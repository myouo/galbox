import { Application, Sprite, Texture } from 'pixi.js';
import { ensure, GalboxError,parseResourceFact,parseResourceBudget } from '../protocol/index.js';
import type { Program, DeepReadonly, Snapshot,ResourceBudget,ResourceFact } from '../protocol/index.js';
import {inspectResource,resourceUsage,defaultResourceBudget,canonicalReleaseJSON} from '../release/index.js';
import type { HostPort } from '../runtime/ports.js';
import type { Effect } from '../core/index.js';
import { verifiedBytes } from './assets.js';
import type { AssetProvider } from './assets.js';
interface Playing {source:AudioBufferSourceNode;gain:GainNode;}
export interface MediaDiagnostics {state:'available'|'needs-user-action'|'unavailable'|'unverified';starts:number;ended:number;blocked:number;decoded:number;active:number;}
export interface ResourceDiagnostics {graphics:'available'|'unavailable'|'unverified';assets:number;encodedBytes:number;textureBytesEstimated:number;decodedAudioBytes:number;limits:ResourceBudget;}
export class WebHost implements HostPort {
  private app:Application|null=null;
  private textures=new Map<string,Texture>();
  private buffers=new Map<string,AudioBuffer>();
  private sprites=new Map<string,Sprite>();
  private playing=new Map<string,Playing>();
  private context:AudioContext|null=null;
  private master:GainNode|null=null;
  private disposed=false;
  private epoch=0;
  private volume=.6;
  private paused=false;
  private audioUnavailable=false;
  private audioOperation:Promise<void>=Promise.resolve();
  private facts:ResourceFact[]=[];
  private canvas:HTMLCanvasElement|null=null;
  readonly resources:ResourceDiagnostics={graphics:'unverified',assets:0,encodedBytes:0,textureBytesEstimated:0,decodedAudioBytes:0,limits:parseResourceBudget(defaultResourceBudget)};
  readonly media:MediaDiagnostics={state:'unverified',starts:0,ended:0,blocked:0,decoded:0,active:0};
  constructor(private readonly mount:HTMLElement,private readonly fault?:(error:Error)=>void) {}
  resourceFacts():ResourceFact[]{return this.facts.map(parseResourceFact);}
  assertReady():void {ensure(!this.disposed&&this.resources.graphics==='available','GRAPHICS_UNAVAILABLE','Recreate the player to prepare the graphics device');ensure(!this.audioUnavailable&&this.context&&this.context.state!=='closed','AUDIO_UNAVAILABLE','Audio device closed');}
  private lost=(event:Event):void=>{event.preventDefault();this.resources.graphics='unavailable';this.stopAudio();this.fault?.(new GalboxError('WEBGL_CONTEXT_LOST','图像设备连接已丢失，请重新打开播放器后读档。'));};
  async init(program:Program,provider:AssetProvider,signal:AbortSignal,policy:unknown=defaultResourceBudget,expected?:readonly ResourceFact[]):Promise<void> {
    try {
      this.resources.limits=parseResourceBudget(policy);if(expected)resourceUsage(expected,this.resources.limits);
      if(typeof AudioContext==='undefined'){this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Web Audio is unavailable on this device');}
      try{this.context=new AudioContext();}catch{this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Audio context creation failed');}this.master=this.context.createGain();this.master.gain.value=this.volume;this.master.connect(this.context.destination);
      this.media.state=this.context.state==='running'?'available':'needs-user-action';
      const app=new Application();this.app=app;
      try{await app.init({width:1280,height:720,preference:'webgl',background:'#122c44',antialias:true,autoStart:false});}catch{this.resources.graphics='unavailable';throw new GalboxError('GRAPHICS_UNAVAILABLE','WebGL initialization failed');}
      ensure(!this.disposed&&!signal.aborted,'HOST_DISPOSED','Initialization cancelled');
      this.canvas=app.canvas;this.canvas.addEventListener('webglcontextlost',this.lost);this.resources.graphics='available';this.mount.appendChild(app.canvas);app.canvas.setAttribute('aria-label',`${program.title}图像舞台`);app.canvas.style.width='100%';app.canvas.style.height='100%';
      app.stage.sortableChildren=true;
      for(const asset of program.assets){
        const remaining=this.resources.limits.maxEncodedBytes-this.resources.encodedBytes;ensure(remaining>0,'RESOURCE_ENCODED_BUDGET',asset.id);const bytes=await verifiedBytes(provider,program,asset,signal,Math.min(this.resources.limits.maxAssetBytes,remaining));ensure(!this.disposed,'HOST_DISPOSED',asset.id);
        const fact=inspectResource(asset,bytes,b=>new TextDecoder('utf-8',{fatal:true}).decode(b)),usage=resourceUsage([...this.facts,fact],this.resources.limits,this.context.sampleRate);
        if(expected)ensure(canonicalReleaseJSON(expected.find(f=>f.id===asset.id))===canonicalReleaseJSON(fact),'RELEASE_RESOURCE_FACTS',asset.id);
        if(asset.kind==='image'){
          const url=URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer],{type:asset.mime}));
          try {
            const img=new Image();img.src=url;try{await img.decode();}catch{throw new GalboxError('IMAGE_FORMAT',`${asset.id}: image decode unavailable`);}ensure(!signal.aborted&&!this.disposed,'HOST_DISPOSED',asset.id);ensure(fact.kind==='image'&&img.naturalWidth===fact.width&&img.naturalHeight===fact.height,'RESOURCE_IMAGE_SIZE',asset.id);this.textures.set(asset.id,Texture.from(img));
          } finally {URL.revokeObjectURL(url);}
        }else {
          ensure(this.context,'AUDIO_UNAVAILABLE','Audio context absent');
          try {const buffer=await this.context.decodeAudioData(new Uint8Array(bytes).buffer);ensure(!signal.aborted&&!this.disposed,'HOST_DISPOSED',asset.id);ensure(fact.kind==='audio'&&buffer.numberOfChannels===fact.channels&&Math.abs(buffer.duration-fact.frames/fact.sampleRate)<.002,'RESOURCE_AUDIO_SHAPE',asset.id);const actual=buffer.length*buffer.numberOfChannels*4;ensure(this.resources.decodedAudioBytes+actual<=this.resources.limits.maxAudioBytes,'RESOURCE_AUDIO_BUDGET',asset.id);this.resources.decodedAudioBytes+=actual;this.buffers.set(asset.id,buffer);this.media.decoded++;}
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
      this.media.state=context.state==='running'?'available':'needs-user-action';
    });this.audioOperation=next;return next;
  }
  setEpoch(epoch:number):void {this.stopAudio();this.epoch=epoch;}
  render(run:DeepReadonly<Snapshot>):void {
    if(!this.app||this.disposed||this.resources.graphics!=='available')return;
    for(const [id,sprite]of this.sprites)if(!run.stage.some(o=>o.id===id)){sprite.destroy();this.sprites.delete(id);}
    for(const object of run.stage){
      const texture=this.textures.get(object.asset);ensure(texture,'TEXTURE_MISSING',object.asset);
      let sprite=this.sprites.get(object.id);if(!sprite){sprite=new Sprite(texture);this.app.stage.addChild(sprite);this.sprites.set(object.id,sprite);}
      sprite.texture=texture;sprite.position.set(object.position.x,object.position.y);sprite.alpha=object.position.alpha;sprite.zIndex=object.z;
    }
    this.app.render();
  }
  effect(effect:Effect,epoch:number,report:Parameters<HostPort['effect']>[2]):void {
    if(this.disposed||epoch!==this.epoch)return;
    if(effect.type==='audio-stop'){this.stopChannel(effect.channel);return;}
    if(effect.type==='audio-gain'){const playing=this.playing.get(effect.channel);if(playing)playing.gain.gain.value=effect.gain;return;}
    const task=effect.task,context=this.context,master=this.master;
    if(!context||!master||!task.asset||!task.channel){report(task.id,task.attempt,'failed');return;}
    if(this.audioUnavailable||context.state==='closed'){this.media.state='unavailable';report(task.id,task.attempt,'failed');this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Audio device closed'));return;}
    if(context.state!=='running'&&!this.paused){this.media.blocked++;this.media.state='needs-user-action';report(task.id,task.attempt,'blocked');return;}
    const buffer=this.buffers.get(task.asset);if(!buffer){this.media.state='unavailable';report(task.id,task.attempt,'failed');return;}
    this.stopChannel(task.channel);
    let source:AudioBufferSourceNode|undefined,gain:GainNode|undefined;
    try {
      source=context.createBufferSource();gain=context.createGain();source.buffer=buffer;source.loop=task.loop??false;gain.gain.value=task.gain??1;source.connect(gain);gain.connect(master);
      const playing={source,gain},channel=task.channel;this.playing.set(channel,playing);
      source.onended=()=>{if(this.playing.get(channel)===playing){this.playing.delete(channel);this.media.ended++;this.media.active=this.playing.size;}playing.source.disconnect();playing.gain.disconnect();};
      source.start();this.media.starts++;this.media.active=this.playing.size;this.media.state='available';report(task.id,task.attempt,'completed');
    }catch(error){const unavailable=error instanceof DOMException&&error.name==='NotSupportedError';if(task.channel)this.playing.delete(task.channel);if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();}gain?.disconnect();this.media.active=this.playing.size;if(unavailable){this.audioUnavailable=true;this.media.state='unavailable';report(task.id,task.attempt,'failed');this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Audio source unavailable on this device'));}else{this.media.blocked++;this.media.state='needs-user-action';report(task.id,task.attempt,'blocked');}}
  }
  setVolume(value:number):void {this.volume=Math.min(1,Math.max(0,value));if(this.master)this.master.gain.value=this.volume;}
  async pause(value:boolean):Promise<void> {this.paused=value;await this.reconcileAudio();}
  private stopChannel(channel:string):void {const p=this.playing.get(channel);if(p){this.playing.delete(channel);p.source.onended=null;try{p.source.stop();}catch{}p.source.disconnect();p.gain.disconnect();this.media.active=this.playing.size;}}
  private stopAudio():void {for(const channel of [...this.playing.keys()])this.stopChannel(channel);}
  dispose():void {
    if(this.disposed)return;this.disposed=true;this.stopAudio();for(const sprite of this.sprites.values())sprite.destroy();this.sprites.clear();
    this.canvas?.removeEventListener('webglcontextlost',this.lost);this.canvas=null;this.resources.graphics='unavailable';this.resources.textureBytesEstimated=0;this.resources.decodedAudioBytes=0;this.resources.encodedBytes=0;this.resources.assets=0;this.facts=[];
    for(const texture of this.textures.values())texture.destroy(true);this.textures.clear();this.buffers.clear();
    if(this.app?.renderer){this.app.destroy(true,{children:true});}this.app=null;
    if(this.context&&this.context.state!=='closed')void this.context.close().catch(()=>{});this.context=null;this.master=null;this.media.active=0;
  }
}
