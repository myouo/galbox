import { Application, Sprite, Texture } from 'pixi.js';
import { ensure, GalboxError } from '../protocol/index.js';
import type { Program, DeepReadonly, Snapshot } from '../protocol/index.js';
import type { HostPort } from '../runtime/ports.js';
import type { Effect } from '../core/index.js';
import { verifiedBytes } from './assets.js';
import type { AssetProvider } from './assets.js';
interface Playing {source:AudioBufferSourceNode;gain:GainNode;}
export interface MediaDiagnostics {state:'available'|'needs-user-action'|'unavailable'|'unverified';starts:number;ended:number;blocked:number;decoded:number;active:number;}
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
  private audioOperation:Promise<void>=Promise.resolve();
  readonly media:MediaDiagnostics={state:'unverified',starts:0,ended:0,blocked:0,decoded:0,active:0};
  constructor(private readonly mount:HTMLElement) {}
  async init(program:Program,provider:AssetProvider,signal:AbortSignal):Promise<void> {
    try {
      if(typeof AudioContext==='undefined'){this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Web Audio is unavailable on this device');}
      this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=this.volume;this.master.connect(this.context.destination);
      this.media.state=this.context.state==='running'?'available':'needs-user-action';
      const app=new Application();this.app=app;
      await app.init({width:1280,height:720,preference:'webgl',background:'#122c44',antialias:true,autoStart:false});
      ensure(!this.disposed&&!signal.aborted,'HOST_DISPOSED','Initialization cancelled');
      this.mount.appendChild(app.canvas);app.canvas.setAttribute('aria-label',`${program.title}图像舞台`);app.canvas.style.width='100%';app.canvas.style.height='100%';
      app.stage.sortableChildren=true;
      for(const asset of program.assets){
        const bytes=await verifiedBytes(provider,program,asset,signal);ensure(!this.disposed,'HOST_DISPOSED',asset.id);
        if(asset.kind==='image'){
          const url=URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer],{type:asset.mime}));
          try {
            const img=new Image();img.src=url;await img.decode();ensure(!signal.aborted&&!this.disposed,'HOST_DISPOSED',asset.id);this.textures.set(asset.id,Texture.from(img));
          } finally {URL.revokeObjectURL(url);}
        }else {
          ensure(this.context,'AUDIO_UNAVAILABLE','Audio context absent');
          try {const buffer=await this.context.decodeAudioData(new Uint8Array(bytes).buffer);ensure(!signal.aborted&&!this.disposed,'HOST_DISPOSED',asset.id);this.buffers.set(asset.id,buffer);this.media.decoded++;}
          catch(error){if(error instanceof GalboxError)throw error;this.media.state='unavailable';throw new GalboxError('AUDIO_FORMAT',`${asset.id}: WAV decode unavailable`);}
        }
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
      const context=this.context;if(!context||this.disposed)return;
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
    if(!this.app||this.disposed)return;
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
    if(context.state!=='running'&&!this.paused){this.media.blocked++;this.media.state='needs-user-action';report(task.id,task.attempt,'blocked');return;}
    const buffer=this.buffers.get(task.asset);if(!buffer){this.media.state='unavailable';report(task.id,task.attempt,'failed');return;}
    this.stopChannel(task.channel);
    try {
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.loop=task.loop??false;gain.gain.value=task.gain??1;source.connect(gain);gain.connect(master);
      const playing={source,gain},channel=task.channel;this.playing.set(channel,playing);
      source.onended=()=>{if(this.playing.get(channel)===playing){this.playing.delete(channel);this.media.ended++;this.media.active=this.playing.size;}source.disconnect();gain.disconnect();};
      source.start();this.media.starts++;this.media.active=this.playing.size;this.media.state='available';report(task.id,task.attempt,'completed');
    }catch{this.media.blocked++;report(task.id,task.attempt,'blocked');}
  }
  setVolume(value:number):void {this.volume=Math.min(1,Math.max(0,value));if(this.master)this.master.gain.value=this.volume;}
  async pause(value:boolean):Promise<void> {this.paused=value;await this.reconcileAudio();}
  private stopChannel(channel:string):void {const p=this.playing.get(channel);if(p){this.playing.delete(channel);p.source.onended=null;try{p.source.stop();}catch{}p.source.disconnect();p.gain.disconnect();this.media.active=this.playing.size;}}
  private stopAudio():void {for(const channel of [...this.playing.keys()])this.stopChannel(channel);}
  dispose():void {
    if(this.disposed)return;this.disposed=true;this.stopAudio();for(const sprite of this.sprites.values())sprite.destroy();this.sprites.clear();
    for(const texture of this.textures.values())texture.destroy(true);this.textures.clear();this.buffers.clear();
    if(this.app?.renderer){this.app.destroy(true,{children:true});}this.app=null;
    if(this.context&&this.context.state!=='closed')void this.context.close().catch(()=>{});this.context=null;this.master=null;this.media.active=0;
  }
}
