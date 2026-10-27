import {Texture} from 'pixi.js';
import {ensure,GalboxError,parseResolvedStreamIdentity,canonicalWireJSON} from '../protocol/index.js';
import type {Asset,Program,ResourceFact,ResourceBudget,IntegrityEvidence,StreamingOptions} from '../protocol/index.js';
import {inspectResource,resourceUsage,canonicalReleaseJSON} from '../release/index.js';
import {audioPlayback} from '../release/audio.js';
import {verifiedBytes} from './assets.js';
import type {AssetProvider} from './assets.js';
import {prepareMedia,prepareMediaURI} from './media.js';
import type {PreparedMedia} from './media.js';
import {openStream} from './streams.js';
import {streamRequest} from '../runtime/stream-ports.js';
import type {PreparedStream} from './streams.js';
export interface LoadedResource {fact:ResourceFact;cost:number;integrity:IntegrityEvidence;image?:HTMLImageElement;texture?:Texture;buffer?:AudioBuffer;media?:PreparedMedia;stream?:PreparedStream;font?:FontFace;fontCSS?:string;dispose():void;}
export class ResourceLoader {
 private readonly known=new Map<string,ResourceFact>();private readonly assets:Map<string,Asset>;private readonly facts:Map<string,ResourceFact>;private catalogHash:Promise<string>|undefined;
 constructor(private readonly program:Program,private readonly provider:AssetProvider,private readonly context:AudioContext,private readonly limits:ResourceBudget,expected:readonly ResourceFact[]|undefined,private readonly streaming:StreamingOptions|null,private readonly fontPrefix:string){this.assets=new Map(program.assets.map(a=>[a.id,a]));this.facts=new Map(expected?.map(f=>[f.id,f]));if(expected)resourceUsage(expected,limits,context.sampleRate);}
 knownFacts():ResourceFact[]{return this.program.assets.flatMap(a=>{const f=this.known.get(a.id);return f?[f]:[];});}
 expectedFact(id:string):ResourceFact|undefined{return this.facts.get(id)??this.known.get(id);}
 async load(id:string,signal:AbortSignal,reserve:(n:number)=>void):Promise<LoadedResource> {
  const asset=this.assets.get(id);ensure(asset,'LOADING_ASSET',id);ensure(!signal.aborted,'ASSET_CANCELLED',id);let texture:Texture|undefined,image:HTMLImageElement|undefined,buffer:AudioBuffer|undefined,media:PreparedMedia|undefined,stream:PreparedStream|undefined,font:FontFace|undefined,fontCSS:string|undefined;let disposed=false;
  const dispose=()=>{if(disposed)return;disposed=true;texture?.destroy(true);image?.remove();image?.removeAttribute('src');if(media?.kind==='blob')URL.revokeObjectURL(media.url);stream?.release();if(font)document.fonts.delete(font);};
  try {
   const expected=this.facts.get(id);let fact:ResourceFact,bytes:Uint8Array|undefined,integrity:IntegrityEvidence;
   if(asset.transport){ensure(expected&&this.streaming&&this.provider.streams,'STREAM_POLICY','Streaming needs release facts, explicit policy and a provider');fact=expected;}
   else {bytes=await verifiedBytes(this.provider,this.program,asset,signal,this.limits.maxAssetBytes);fact=inspectResource(asset,bytes,b=>new TextDecoder('utf-8',{fatal:true}).decode(b));if(expected)ensure(canonicalReleaseJSON(expected)===canonicalReleaseJSON(fact),'RELEASE_RESOURCE_FACTS',id);}
   resourceUsage([...this.known.values()].filter(f=>f.id!==id).concat(fact),this.limits,this.context.sampleRate);
   let cost=fact.kind==='image'?fact.width*fact.height*8:fact.kind==='video'?fact.width*fact.height*8+(asset.transport?0:fact.bytes):fact.kind==='font'?fact.bytes*4:fact.playback==='element'?(asset.transport?0:fact.bytes):Math.ceil(fact.frames*this.context.sampleRate/fact.sampleRate)*fact.channels*4;
   // Reserve encoded input plus decoded/device estimates while decoding; no unbounded parallel allocation.
   reserve(cost+(bytes?.byteLength??0));ensure(!signal.aborted,'ASSET_CANCELLED',id);
   if(asset.transport){ensure(this.provider.streams&&(fact.kind==='audio'||fact.kind==='video')&&asset.kind===fact.kind,'STREAM_FACT',id);this.catalogHash??=crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalWireJSON(this.program.assets))).then(b=>[...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join(''));const identity=parseResolvedStreamIdentity({gameId:this.program.gameId,release:this.program.release,catalogSha256:await this.catalogHash,assetId:id,expectedSha256:asset.sha256,kind:asset.kind,mime:asset.mime,version:asset.transport.version});const request=identity.kind==='audio'&&fact.kind==='audio'?streamRequest(identity,fact):identity.kind==='video'&&fact.kind==='video'?streamRequest(identity,fact):null;ensure(request,'STREAM_IDENTITY',id);stream=await openStream(this.provider.streams,request,signal);media=await prepareMediaURI(asset,fact,stream.uri,signal);const lease=stream;media.validate=input=>lease.validate(input);integrity=stream.evidence;
   }else {ensure(bytes,'ASSET_BYTES',id);integrity={level:'digest-verified',expectedSha256:asset.sha256,verifiedSha256:asset.sha256,bytes:bytes.byteLength};
    if(asset.kind==='image'){const url=URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer],{type:asset.mime}));try{image=new Image();image.src=url;try{await image.decode();}catch{throw new GalboxError('IMAGE_FORMAT',`${id}: image decode unavailable`);}ensure(!signal.aborted,'ASSET_CANCELLED',id);ensure(fact.kind==='image'&&image.naturalWidth===fact.width&&image.naturalHeight===fact.height,'RESOURCE_IMAGE_SIZE',id);texture=Texture.from(image);}finally{URL.revokeObjectURL(url);}}
    else if(asset.kind==='font'){ensure(typeof FontFace!=='undefined'&&document.fonts,'FONT_UNAVAILABLE','Font loading unavailable');font=new FontFace(`${this.fontPrefix}-${id}`,new Uint8Array(bytes).buffer);let abort:()=>void=()=>{};try{await Promise.race([font.load(),new Promise<never>((_r,reject)=>{abort=()=>reject(new GalboxError('ASSET_CANCELLED',id));signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();})]);ensure(!signal.aborted,'ASSET_CANCELLED',id);document.fonts.add(font);let binary='';for(const b of bytes)binary+=String.fromCharCode(b);fontCSS=`@font-face{font-family:'${font.family}';src:url(data:${asset.mime};base64,${btoa(binary)})}`;}catch(e){if(e instanceof GalboxError)throw e;throw new GalboxError('FONT_FORMAT',`${id}: font decode unavailable`);}finally{signal.removeEventListener('abort',abort);}}
    else if(asset.kind==='video'||audioPlayback(asset)==='element')media=await prepareMedia(asset,bytes,fact,signal);
    else {try{buffer=await this.context.decodeAudioData(new Uint8Array(bytes).buffer);}catch{throw new GalboxError('AUDIO_FORMAT',`${id}: audio decode unavailable`);}ensure(fact.kind==='audio'&&buffer.numberOfChannels===fact.channels&&Math.abs(buffer.duration-fact.frames/fact.sampleRate)<(fact.encoding&&fact.encoding!=='wav'?.15:.002),'RESOURCE_AUDIO_SHAPE',id);cost=buffer.length*buffer.numberOfChannels*4;}
   }
   ensure(!signal.aborted,'ASSET_CANCELLED',id);reserve(cost);this.known.set(id,fact);resourceUsage([...this.known.values()],this.limits,this.context.sampleRate);
   return {fact,cost,integrity,...(texture?{texture}:{}),...(image?{image}:{}),...(buffer?{buffer}:{}),...(media?{media}:{}),...(stream?{stream}:{}),...(font?{font}:{}),...(fontCSS?{fontCSS}:{}),dispose};
  }catch(error){dispose();throw error;}
 }
}
