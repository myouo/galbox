import {prepareGraphics,destroyGraphicsApplication,validateCanvasProgram,validateCanvasSnapshot} from './graphics.js';
import type {GraphicsApplication} from './graphics.js';
import {prepareMedia,validateLoop} from './media.js';
import type {PreparedMedia} from './media.js';
import {audioPlayback} from '../release/audio.js';
import {ImageStage} from './stage.js';
import { Texture,CanvasRenderer } from 'pixi.js';
import { ensure, GalboxError,parseResourceFact,parseResourceBudget,parseAudioPreferences,parseGraphicsOptions } from '../protocol/index.js';
import type { Program, DeepReadonly, Snapshot,ResourceBudget,ResourceFact,Task,AudioState,GraphicsOptions } from '../protocol/index.js';
import {inspectResource,resourceUsage,defaultResourceBudget,canonicalReleaseJSON} from '../release/index.js';
import type { HostPort } from '../runtime/ports.js';
import type { Effect } from '../core/index.js';
import { verifiedBytes } from './assets.js';
import type { AssetProvider } from './assets.js';
function stopSignal(){let cancel=()=>{};const cancelled=new Promise<void>(resolve=>{cancel=resolve;});return {cancel,cancelled};}
interface Playing {source:AudioNode;buffer?:AudioBufferSourceNode;element?:HTMLAudioElement;gain:GainNode;scriptGain:number;role:'bgm'|'voice'|'sfx';task:Task;epoch:number;reported:boolean;blocked?:boolean;sequence:number;cancelled:Promise<void>;cancel:()=>void;pending?:Promise<void>;report:Parameters<HostPort['effect']>[2];ended?:Parameters<HostPort['effect']>[3];}
export interface MediaDiagnostics {state:'available'|'needs-user-action'|'unavailable'|'unverified';starts:number;ended:number;blocked:number;decoded:number;active:number;loops:number;elementStarts:number;}
export interface ResourceDiagnostics {renderer:'webgl'|'canvas'|null;graphicsFallback:string|null;graphics:'available'|'unavailable'|'unverified';assets:number;encodedBytes:number;textureBytesEstimated:number;decodedAudioBytes:number;mediaElementBytes:number;limits:ResourceBudget;}
export class WebHost implements HostPort {
  private app:GraphicsApplication|null=null;
  private readonly graphicsOptions:GraphicsOptions;
  private stage:ImageStage|null=null;
  private textures=new Map<string,Texture>();
  private buffers=new Map<string,AudioBuffer>();
  private mediaAssets=new Map<string,PreparedMedia>();private mix:DeepReadonly<AudioState>|null=null;
  private playing=new Map<string,Playing>();
  private context:AudioContext|null=null;
  private master:GainNode|null=null;
  private disposed=false;
  private epoch=0;
  private volume=.6;
  private roleVolumes={bgm:1,voice:1,sfx:1};
  private paused=false;
  private audioUnavailable=false;
  private audioOperation:Promise<void>=Promise.resolve();
  private facts:ResourceFact[]=[];
  private fonts=new Map<string,FontFace>();private readonly fontPrefix=`galbox-${crypto.randomUUID()}`;
  fontFamily(id:string):string {const face=this.fonts.get(id);ensure(face,'TEXT_FONT','Font has not been prepared');return face.family;}
  private canvas:HTMLCanvasElement|null=null;
  readonly resources:ResourceDiagnostics={renderer:null,graphicsFallback:null,graphics:'unverified',assets:0,encodedBytes:0,textureBytesEstimated:0,decodedAudioBytes:0,mediaElementBytes:0,limits:parseResourceBudget(defaultResourceBudget)};
  readonly media:MediaDiagnostics={state:'unverified',starts:0,ended:0,blocked:0,decoded:0,active:0,loops:0,elementStarts:0};
  constructor(private readonly mount:HTMLElement,private readonly fault?:(error:Error)=>void,graphics:unknown={renderer:'auto'}) {this.graphicsOptions=parseGraphicsOptions(graphics);}
  resourceFacts():ResourceFact[]{return this.facts.map(parseResourceFact);}
  applyAudioPreferences(input:unknown):void {const audio=parseAudioPreferences(input);this.volume=audio.master;this.roleVolumes={bgm:audio.bgm,voice:audio.voice,sfx:audio.sfx};if(this.master)this.master.gain.value=this.volume;for(const p of this.playing.values())p.gain.gain.value=this.sourceGain(p);}
  assertReady():void {ensure(!this.disposed&&this.resources.graphics==='available','GRAPHICS_UNAVAILABLE','Recreate the player to prepare the graphics device');ensure(!this.audioUnavailable&&this.context&&this.context.state!=='closed','AUDIO_UNAVAILABLE','Audio device closed');}
  private lost=(event:Event):void=>{event.preventDefault();this.resources.graphics='unavailable';this.stopAudio();this.fault?.(new GalboxError('WEBGL_CONTEXT_LOST','图像设备连接已丢失，请重新打开播放器后读档。'));};
  async init(program:Program,provider:AssetProvider,signal:AbortSignal,policy:unknown=defaultResourceBudget,expected?:readonly ResourceFact[]):Promise<void> {
    try {
      this.resources.limits=parseResourceBudget(policy);if(expected)resourceUsage(expected,this.resources.limits);
      if(typeof AudioContext==='undefined'){this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Web Audio is unavailable on this device');}
      try{this.context=new AudioContext();}catch{this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Audio context creation failed');}this.master=this.context.createGain();this.master.gain.value=this.volume;this.master.connect(this.context.destination);
      this.media.state=this.context.state==='running'?'available':'needs-user-action';
      const {app,backend,fallback}=await prepareGraphics(this.graphicsOptions,()=>this.disposed||signal.aborted,app=>{this.app=app;});this.resources.renderer=backend;this.resources.graphicsFallback=fallback;if(app.renderer instanceof CanvasRenderer)validateCanvasProgram(program,app.renderer.canvasContext.blendModes);
      this.canvas=app.canvas;if(backend==='webgl')this.canvas.addEventListener('webglcontextlost',this.lost);this.resources.graphics='available';this.mount.appendChild(app.canvas);app.canvas.setAttribute('aria-label',`${program.title}图像舞台`);app.canvas.style.width='100%';app.canvas.style.height='100%';
      app.stage.sortableChildren=true;this.stage=new ImageStage(app,this.textures);
      for(const asset of program.assets){
        const remaining=this.resources.limits.maxEncodedBytes-this.resources.encodedBytes;ensure(remaining>0,'RESOURCE_ENCODED_BUDGET',asset.id);const bytes=await verifiedBytes(provider,program,asset,signal,Math.min(this.resources.limits.maxAssetBytes,remaining));ensure(!this.disposed,'HOST_DISPOSED',asset.id);
        const fact=inspectResource(asset,bytes,b=>new TextDecoder('utf-8',{fatal:true}).decode(b)),usage=resourceUsage([...this.facts,fact],this.resources.limits,this.context.sampleRate);
        if(expected)ensure(canonicalReleaseJSON(expected.find(f=>f.id===asset.id))===canonicalReleaseJSON(fact),'RELEASE_RESOURCE_FACTS',asset.id);
        if(asset.kind==='image'){
          const url=URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer],{type:asset.mime}));
          try {
            const img=new Image();img.src=url;try{await img.decode();}catch{throw new GalboxError('IMAGE_FORMAT',`${asset.id}: image decode unavailable`);}ensure(!signal.aborted&&!this.disposed,'HOST_DISPOSED',asset.id);ensure(fact.kind==='image'&&img.naturalWidth===fact.width&&img.naturalHeight===fact.height,'RESOURCE_IMAGE_SIZE',asset.id);this.textures.set(asset.id,Texture.from(img));
          } finally {URL.revokeObjectURL(url);}
        }else if(asset.kind==='font'){
          ensure(typeof FontFace!=='undefined'&&document.fonts,'FONT_UNAVAILABLE','Font loading is unavailable');const face=new FontFace(`${this.fontPrefix}-${this.fonts.size}`,new Uint8Array(bytes).buffer);let abort:(()=>void)|undefined;
          try{await Promise.race([face.load(),new Promise<never>((_resolve,reject)=>{abort=()=>reject(new GalboxError('ASSET_CANCELLED',asset.id));signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();})]);ensure(!signal.aborted&&!this.disposed,'HOST_DISPOSED',asset.id);document.fonts.add(face);this.fonts.set(asset.id,face);}catch(error){if(error instanceof GalboxError)throw error;throw new GalboxError('FONT_FORMAT',`${asset.id}: font decode unavailable`);}finally{if(abort)signal.removeEventListener('abort',abort);}
        }else if(audioPlayback(asset)==='element'){const prepared=await prepareMedia(asset,bytes,fact,signal);if(this.disposed||signal.aborted){URL.revokeObjectURL(prepared.url);throw new GalboxError('HOST_DISPOSED',asset.id);}this.mediaAssets.set(asset.id,prepared);this.resources.mediaElementBytes+=bytes.byteLength;
        }else {
          ensure(this.context,'AUDIO_UNAVAILABLE','Audio context absent');
          try {const buffer=await this.context.decodeAudioData(new Uint8Array(bytes).buffer);ensure(!signal.aborted&&!this.disposed,'HOST_DISPOSED',asset.id);ensure(fact.kind==='audio'&&buffer.numberOfChannels===fact.channels&&Math.abs(buffer.duration-fact.frames/fact.sampleRate)<(fact.encoding&&fact.encoding!=='wav'?.15:.002),'RESOURCE_AUDIO_SHAPE',asset.id);const actual=buffer.length*buffer.numberOfChannels*4;ensure(this.resources.decodedAudioBytes+actual<=this.resources.limits.maxAudioBytes,'RESOURCE_AUDIO_BUDGET',asset.id);this.resources.decodedAudioBytes+=actual;this.buffers.set(asset.id,buffer);this.media.decoded++;}
          catch(error){if(error instanceof GalboxError)throw error;this.media.state='unavailable';throw new GalboxError('AUDIO_FORMAT',`${asset.id}: WAV decode unavailable`);}
        }this.facts.push(fact);this.resources.assets=this.facts.length;this.resources.encodedBytes=usage.encodedBytes;this.resources.textureBytesEstimated=usage.textureBytesEstimated;
      }
    }catch(error){this.dispose();throw error;}
  }
  async unlock():Promise<void> {
    ensure(this.context&&!this.disposed,'AUDIO_UNAVAILABLE','Host is not ready');
    if(this.paused)return;
    await this.reconcileAudio();
  }
  private reconcileAudio():Promise<void> {
    const next=this.audioOperation.catch(()=>{}).then(async()=>{
      const context=this.context;if(!context||this.disposed)return;if(this.audioUnavailable||context.state==='closed'){this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Audio device closed');}
      if(this.paused){if(context.state==='running')await context.suspend();}
      else if(context.state!=='running'){
        if(!navigator.userActivation?.hasBeenActive){this.media.state='needs-user-action';return;}
        try {await context.resume();}catch {this.media.state='needs-user-action';return;}
      }
      this.media.state=context.state==='running'?'available':'needs-user-action';for(const p of this.playing.values())if(p.element){if(this.paused)p.element.pause();else if(p.element.paused&&!p.blocked)this.startElement(p);}
    });this.audioOperation=next;return next;
  }
  setEpoch(epoch:number):void {this.stopAudio();this.epoch=epoch;this.stage?.invalidate();}
  validateGraphicsPlan(snapshot:DeepReadonly<Snapshot>):void {if(this.app?.renderer instanceof CanvasRenderer)validateCanvasSnapshot(snapshot,this.app.renderer.canvasContext.blendModes);}
  render(run:DeepReadonly<Snapshot>):void {
    if(!this.app||this.disposed||this.resources.graphics!=='available')return;
    this.validateGraphicsPlan(run);this.mix=run.audioState??null;for(const p of this.playing.values())p.gain.gain.value=this.sourceGain(p);this.stage?.render(run);
  }
  effect(effect:Effect,epoch:number,report:Parameters<HostPort['effect']>[2],playbackEnded?:Parameters<HostPort['effect']>[3]):void {
    if(this.disposed||epoch!==this.epoch)return;
    if(effect.type==='audio-stop'){this.stopChannel(effect.channel);return;}
    if(effect.type==='audio-gain'){const playing=this.playing.get(effect.channel);if(playing){playing.scriptGain=effect.gain;playing.gain.gain.value=this.sourceGain(playing);}return;}
    const task=effect.task,context=this.context,master=this.master;
    if(!context||!master||!task.asset||!task.channel){report(task.id,task.attempt,'failed');return;}
    if(this.audioUnavailable||context.state==='closed'){this.media.state='unavailable';report(task.id,task.attempt,'failed');this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Audio device closed'));return;}
    if(context.state!=='running'&&!this.paused){this.media.blocked++;this.media.state='needs-user-action';report(task.id,task.attempt,'blocked');return;}
    const media=this.mediaAssets.get(task.asset);if(media){this.playElement(task,epoch,report,playbackEnded,media);return;}
    const buffer=this.buffers.get(task.asset);if(!buffer){this.media.state='unavailable';report(task.id,task.attempt,'failed');return;}
    this.stopChannel(task.channel);
    let source:AudioBufferSourceNode|undefined,gain:GainNode|undefined;
    try {
      source=context.createBufferSource();gain=context.createGain();source.buffer=buffer;source.loop=task.loop??false;if(task.mediaTask){validateLoop(task,buffer.duration*1000);source.loopStart=task.mediaTask.loopStartMs/1000;source.loopEnd=(task.mediaTask.loopEndMs??buffer.duration*1000)/1000;}gain.gain.value=(task.gain??1)*this.roleVolumes[task.channel];source.connect(gain);gain.connect(master);
      const playing:Playing={...stopSignal(),source,buffer:source,gain,scriptGain:task.gain??1,role:task.channel,task,epoch,reported:true,sequence:0,report,...(playbackEnded?{ended:playbackEnded}:{})},channel=task.channel;gain.gain.value=this.sourceGain(playing);this.playing.set(channel,playing);
      source.onended=()=>{if(!this.disposed&&epoch===this.epoch&&this.playing.get(channel)===playing){this.playing.delete(channel);this.media.ended++;this.media.active=this.playing.size;playbackEnded?.(task.id,task.attempt);}playing.source.disconnect();playing.gain.disconnect();};
      source.start();this.media.starts++;this.media.active=this.playing.size;this.media.state='available';report(task.id,task.attempt,'completed');
    }catch(error){const unavailable=error instanceof DOMException&&error.name==='NotSupportedError';if(task.channel)this.playing.delete(task.channel);if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();}gain?.disconnect();this.media.active=this.playing.size;if(unavailable){this.audioUnavailable=true;this.media.state='unavailable';report(task.id,task.attempt,'failed');this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Audio source unavailable on this device'));}else{this.media.blocked++;this.media.state='needs-user-action';report(task.id,task.attempt,'blocked');}}
  }
  setVolume(value:number):void {this.volume=Math.min(1,Math.max(0,value));if(this.master)this.master.gain.value=this.volume;}
  async pause(value:boolean):Promise<void> {this.paused=value;if(value)for(const p of this.playing.values())p.element?.pause();await this.reconcileAudio();}
  private sourceGain(p:Playing):number {return p.scriptGain*this.roleVolumes[p.role]*(this.mix?.gains[p.role]??1)*(p.role==='bgm'?this.mix?.duck.value??1:1);}
  private current(p:Playing):boolean {return !this.disposed&&p.epoch===this.epoch&&this.playing.get(p.role)===p;}
  private startElement(p:Playing):void {const element=p.element;if(!element||!this.current(p)||this.paused)return;const seq=++p.sequence;let timeout:ReturnType<typeof setTimeout>|undefined,playing:Promise<void>;try{playing=element.play();}catch(error){playing=Promise.reject(error);}p.pending=Promise.race([playing,p.cancelled,new Promise<never>((_resolve,reject)=>{timeout=setTimeout(()=>reject(new GalboxError('MEDIA_START_TIMEOUT','Media did not start')),30000);})]).then(()=>{if(!this.current(p)){element.pause();return;}if(seq!==p.sequence)return;if(this.paused){element.pause();return;}if(!p.reported){p.reported=true;this.media.starts++;this.media.elementStarts++;this.media.state='available';p.report(p.task.id,p.task.attempt,'completed');}}).catch(error=>{if(!this.current(p)||seq!==p.sequence||this.paused&&error instanceof DOMException&&error.name==='AbortError')return;p.blocked=true;const permanent=error instanceof DOMException&&error.name==='NotSupportedError';if(permanent){this.audioUnavailable=true;this.media.state='unavailable';p.report(p.task.id,p.task.attempt,'failed');this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Media device rejected the source'));}else{this.media.state='needs-user-action';this.media.blocked++;p.report(p.task.id,p.task.attempt,'blocked');}}).finally(()=>{if(timeout!==undefined)clearTimeout(timeout);});}
  private playElement(task:Task,epoch:number,report:Parameters<HostPort['effect']>[2],ended:Parameters<HostPort['effect']>[3],media:PreparedMedia):void {
    ensure(this.context&&this.master&&task.channel,'AUDIO_UNAVAILABLE','Missing media context');try{validateLoop(task,media.durationMs);}catch(error){report(task.id,task.attempt,'failed');this.audioUnavailable=true;this.fault?.(error instanceof Error?error:new Error(String(error)));return;}this.stopChannel(task.channel);const element=new Audio(),gain=this.context.createGain();element.preload='auto';element.src=media.url;element.loop=!!task.loop&&(!task.mediaTask||task.mediaTask.loopStartMs===0&&task.mediaTask.loopEndMs===null);const source=this.context.createMediaElementSource(element);source.connect(gain);gain.connect(this.master);const p:Playing={...stopSignal(),source,element,gain,scriptGain:task.gain??1,role:task.channel,task,epoch,reported:false,sequence:0,report,...(ended?{ended}:{})};this.playing.set(task.channel,p);gain.gain.value=this.sourceGain(p);this.media.active=this.playing.size;
    element.ontimeupdate=()=>{const loop=task.mediaTask;if(this.current(p)&&task.loop&&loop&&loop.loopEndMs!==null&&element.currentTime*1000>=loop.loopEndMs){element.currentTime=loop.loopStartMs/1000;this.media.loops++;}};
    element.onended=()=>{if(!this.current(p))return;if(task.loop){element.currentTime=(task.mediaTask?.loopStartMs??0)/1000;this.media.loops++;this.startElement(p);return;}if(!p.reported)return;this.playing.delete(p.role);this.media.active=this.playing.size;this.media.ended++;p.ended?.(task.id,task.attempt);element.onended=null;element.ontimeupdate=null;element.onerror=null;element.removeAttribute('src');element.load();source.disconnect();gain.disconnect();};
    element.onerror=()=>{if(!this.current(p))return;this.audioUnavailable=true;this.media.state='unavailable';report(task.id,task.attempt,'failed');this.stopChannel(p.role);this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Media playback failed'));};this.startElement(p);
  }
  async awaitAudioStarts():Promise<void> {if(!this.paused)await Promise.all([...this.playing.values()].map(p=>p.pending));}
  validateAudioPlan(snapshot:DeepReadonly<Snapshot>):void {for(const t of snapshot.tasks)if((t.kind==='media'||t.kind==='audio')&&['running','blocked','completed'].includes(t.status)&&t.asset){const info=this.mediaAssets.get(t.asset),buffer=this.buffers.get(t.asset);validateLoop({...t},info?.durationMs??(buffer?.duration??0)*1000);}}
  private stopChannel(channel:string):void {const p=this.playing.get(channel);if(p){this.playing.delete(channel);p.sequence++;p.cancel();if(p.element){p.element.onended=null;p.element.ontimeupdate=null;p.element.onerror=null;p.element.pause();p.element.removeAttribute('src');p.element.load();}if(p.buffer){p.buffer.onended=null;try{p.buffer.stop();}catch{}}p.source.disconnect();p.gain.disconnect();this.media.active=this.playing.size;}}
  private stopAudio():void {for(const channel of [...this.playing.keys()])this.stopChannel(channel);}
  private destroyApplication(app:GraphicsApplication|null):void {destroyGraphicsApplication(app);}
  dispose():void {
    for(const face of this.fonts.values())document.fonts.delete(face);this.fonts.clear();
    if(this.disposed)return;this.disposed=true;this.stopAudio();this.stage?.dispose();this.stage=null;
    this.canvas?.removeEventListener('webglcontextlost',this.lost);this.canvas=null;this.resources.graphics='unavailable';this.resources.textureBytesEstimated=0;this.resources.decodedAudioBytes=0;this.resources.encodedBytes=0;this.resources.assets=0;this.facts=[];
    for(const texture of this.textures.values())texture.destroy(true);this.textures.clear();this.buffers.clear();for(const asset of this.mediaAssets.values())URL.revokeObjectURL(asset.url);this.mediaAssets.clear();this.resources.mediaElementBytes=0;
    this.destroyApplication(this.app);this.app=null;
    if(this.context&&this.context.state!=='closed')void this.context.close().catch(()=>{});this.context=null;this.master=null;this.media.active=0;
  }
}
