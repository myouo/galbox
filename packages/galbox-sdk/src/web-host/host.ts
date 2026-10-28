import {audioSlot} from '../protocol/audio-sources.js';
import {ResourceLoader} from './resource-loader.js';
import type {LoadedResource} from './resource-loader.js';
import {AssetCache} from './asset-cache.js';
import type {AssetUse} from './asset-cache.js';
import {loadingPolicy,validateLoading,startupAssets,snapshotAssets,chapterAssets,lookaheadAssets} from '../protocol/loading.js';
import type {LoadingOptions} from '../protocol/index.js';
import type {HostPreparation} from '../runtime/ports.js';
import {openGalleryImage} from './gallery-image.js';
import {UISoundController} from './ui-sound.js';
import {HistoryVoiceController} from './history-voice.js';
export type {HistoryVoiceView} from './history-voice.js';
import {composeThumbnail} from './capture.js';
import type {TextCapture} from './capture.js';
import {VideoController} from './video.js';
import type {VideoDiagnostics} from './video-types.js';
import {defaultCanvasBytes} from '../protocol/canvas.js';
import {prepareGraphics,destroyGraphicsApplication,validateCanvasProgram,validateCanvasSnapshot} from './graphics.js';
import type {GraphicsApplication} from './graphics.js';
import {validateLoop} from './media.js';
import type {PreparedMedia} from './media.js';
import {ImageStage} from './stage.js';
import { Texture,CanvasRenderer } from 'pixi.js';
import { ensure, GalboxError,parseExtraEntry,parseResourceFact,parseResourceBudget,parseAudioPreferences,parseGraphicsOptions,parseStreamingOptions } from '../protocol/index.js';
import type { Program, DeepReadonly, Snapshot,ResourceBudget,ResourceFact,Task,AudioState,GraphicsOptions,IntegrityEvidence } from '../protocol/index.js';
import {resourceUsage,defaultResourceBudget} from '../release/index.js';
import type { HostPort } from '../runtime/ports.js';
import type { Effect } from '../core/index.js';
import type { AssetProvider } from './assets.js';
function stopSignal(){let finish=()=>{};const controller=new AbortController(),cancelled=new Promise<void>(resolve=>{finish=resolve;});return {signal:controller.signal,cancel(){controller.abort();finish();},cancelled};}
interface Playing {source:AudioNode;buffer?:AudioBufferSourceNode;element?:HTMLAudioElement;gain:GainNode;scriptGain:number;role:'bgm'|'voice'|'sfx';task:Task;epoch:number;reported:boolean;blocked?:boolean;sequence:number;signal:AbortSignal;media?:PreparedMedia;cancelled:Promise<void>;cancel:()=>void;pending?:Promise<void>;report:Parameters<HostPort['effect']>[2];ended?:Parameters<HostPort['effect']>[3];}
export interface MediaDiagnostics {state:'buffering'|'available'|'needs-user-action'|'unavailable'|'unverified';starts:number;ended:number;blocked:number;decoded:number;active:number;loops:number;elementStarts:number;}
export interface ResourceDiagnostics {ruleBytesEstimated:number;rulePeakBytesEstimated:number;ruleSurfaces:number;ruleFrames:number;catalogEncodedBytes:number;streamDeclaredBytes:number;integrity:{id:string;factOrigin:'inspected'|'manifest';evidence:IntegrityEvidence}[];canvasBlur:'native'|'cpu'|null;canvasBytesEstimated:number;canvasPeakBytesEstimated:number;canvasSurfaces:number;renderer:'webgl'|'canvas'|null;graphicsFallback:string|null;graphics:'available'|'unavailable'|'unverified';assets:number;encodedBytes:number;textureBytesEstimated:number;decodedAudioBytes:number;mediaElementBytes:number;limits:ResourceBudget;}
export class WebHost implements HostPort {
  private policy:LoadingOptions={mode:'eager'};private program:Program|null=null;private loader:ResourceLoader|null=null;private cache:AssetCache|null=null;
  private uiSoundObserver:(()=>void)|null=null;
  private readonly uiSound=new UISoundController(async(asset,signal)=>{ensure(this.cache&&!this.disposed,'HOST_DISPOSED','Resources unavailable');const use=this.cache.acquire([asset],signal);try{await use.ready;const buffer=this.buffers.get(asset);ensure(buffer,'UI_SOUND_BUFFER','Cue requires a decoded buffer');return {buffer,release:()=>use.release()};}catch(error){use.release();throw error;}},()=>this.uiSoundObserver?.());
  observeUISound(observer:(()=>void)|null):void{this.uiSoundObserver=observer;}
  uiSoundView(){return this.uiSound.view();}
  playUISound(request:import('../protocol/index.js').UISoundRequest){const asset=this.program?.assets.find(a=>a.id===request.asset);ensure(asset?.kind==='audio'&&(asset.playback??(asset.mime==='audio/wav'?'buffer':'element'))==='buffer','UI_SOUND_ASSET','Cue must name a buffer audio asset in this program');return this.uiSound.play(request);}
  stopUISound():void{this.uiSound.stop();}
  private readonly loaded=new Map<string,LoadedResource>();private readonly loadAbort=new AbortController();private bootstrap:string[]=[];private bootUse:AssetUse|null=null;private displayUse:AssetUse|null=null;private displayKey='';private previousUses:AssetUse[]=[];private prefetched='';private prefetchAbort:AbortController|null=null;
  loadingView(){return {mode:this.policy.mode,...(this.cache?.stats??{residentBytes:0,peakResidentBytes:0,hits:0,misses:0,evictions:0,active:0,queued:0})};}
  private updateResources():void {const rows=[...this.loaded.values()];this.resources.assets=rows.length;this.resources.encodedBytes=rows.reduce((n,r)=>n+(r.stream?0:r.fact.bytes),0);this.resources.catalogEncodedBytes=this.loader?.knownFacts().reduce((n,f)=>n+f.bytes,0)??0;this.resources.streamDeclaredBytes=rows.reduce((n,r)=>n+(r.stream?r.fact.bytes:0),0);this.resources.decodedAudioBytes=rows.reduce((n,r)=>n+(r.buffer?r.buffer.length*r.buffer.numberOfChannels*4:0),0);this.resources.textureBytesEstimated=rows.reduce((n,r)=>n+((r.fact.kind==='image'||r.fact.kind==='video')?r.fact.width*r.fact.height*4:0),0);this.resources.mediaElementBytes=rows.reduce((n,r)=>n+(r.media?.kind==='blob'?r.fact.bytes:0),0);this.resources.integrity=rows.map(r=>({id:r.fact.id,factOrigin:r.stream?'manifest':'inspected',evidence:r.integrity}));}
  private required(snapshot:DeepReadonly<Snapshot>,effects:readonly Effect[]):string[] {return [...new Set([...this.bootstrap,...snapshotAssets(snapshot),...chapterAssets(this.policy,snapshot),...effects.flatMap(e=>(e.type==='audio'||e.type==='video')&&e.task.asset?[e.task.asset]:[]),...[...this.playing.values()].flatMap(p=>p.task.asset?[p.task.asset]:[])])];}
  prepare(snapshot:DeepReadonly<Snapshot>,effects:readonly Effect[]):HostPreparation|void {
    const ids=this.required(snapshot,effects);if(ids.join('|')===this.displayKey){this.validateGraphicsPlan(snapshot);return;}const ready=this.cache?.has(ids),preparation=this.prepareCandidate(snapshot,this.loadAbort.signal,effects);
    if(ready){try{this.validateGraphicsPlan(snapshot);preparation.commit();}catch(error){preparation.cancel();void preparation.ready.catch(()=>{});throw error;}void preparation.ready.catch(()=>{});return;}return preparation;
  }
  prepareCandidate(snapshot:DeepReadonly<Snapshot>,signal:AbortSignal,effects:readonly Effect[]=[]):HostPreparation {
    const cache=this.cache;ensure(cache&&!this.disposed,'HOST_DISPOSED','Resources unavailable');const ids=this.required(snapshot,effects),controller=new AbortController(),abort=()=>controller.abort();signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();const use=cache.acquire(ids,controller.signal);this.prefetchAbort?.abort();this.prefetchAbort=null;this.prefetched='';let settled=false;
    const commit=()=>{if(settled)return;settled=true;signal.removeEventListener('abort',abort);if(this.displayUse)this.previousUses.push(this.displayUse);this.displayUse=use;this.displayKey=ids.join('|');},cancel=()=>{if(settled)return;settled=true;signal.removeEventListener('abort',abort);controller.abort();use.release();};return {ready:use.ready.then(()=>{ensure(!controller.signal.aborted&&!this.disposed,'HOST_DISPOSED','Preparation cancelled');this.validateGraphicsPlan(snapshot);}),commit,cancel};
  }
  private prefetch(snapshot:DeepReadonly<Snapshot>):void {if(!this.program||!this.cache||this.policy.mode!=='balanced')return;const ids=lookaheadAssets(this.program,snapshot,this.policy),key=ids.join('|');if(key===this.prefetched)return;this.prefetched=key;this.prefetchAbort?.abort();this.prefetchAbort=new AbortController();if(!ids.length)return;const use=this.cache.acquire(ids,this.prefetchAbort.signal,1);void use.ready.catch(()=>{}).finally(()=>use.release());}
  private gallerySource:{program:Program;provider:AssetProvider}|null=null;
  private musicUse:AssetUse|null=null;private musicAbort:AbortController|null=null;private voiceUse:AssetUse|null=null;private voiceAbort:AbortController|null=null;
  private musicObserver:(()=>void)|null=null;
  private readonly galleryMusic=new HistoryVoiceController(asset=>{const buffer=this.buffers.get(asset),media=this.mediaAssets.get(asset);if(buffer)return {kind:'buffer',buffer};ensure(media,'EXTRAS_MUSIC_ASSET','Music resource unavailable');return {kind:'media',media};},()=>{this.musicObserver?.();const use=this.musicUse;queueMicrotask(()=>{if(this.galleryMusic.view().state==='idle'&&this.musicUse===use){use?.release();this.musicUse=null;}});},'bgm');
  observeMusic(observer:(()=>void)|null):void {this.musicObserver=observer;}
  musicView(){return this.galleryMusic.view();}
  async playMusic(input:unknown){const entry=parseExtraEntry(input);ensure(entry.kind==='music','EXTRAS_KIND','Expected music');this.stopMusic();const abort=new AbortController();this.musicAbort=abort;ensure(this.cache,'HOST_DISPOSED','Resources unavailable');this.musicUse=this.cache.acquire([entry.asset],abort.signal);await this.musicUse.ready;ensure(!abort.signal.aborted&&!this.disposed,'EXTRAS_CANCELLED','Music cancelled');return this.galleryMusic.music(entry);}
  stopMusic():void {this.musicAbort?.abort();this.musicAbort=null;this.galleryMusic.stop();this.musicUse?.release();this.musicUse=null;}
  pauseMusic(value:boolean):void {this.galleryMusic.pause(value);}
  async openCG(id:string,title:string,mount:HTMLElement,signal:AbortSignal):Promise<()=>void> {const source=this.gallerySource,fact=this.loader?.expectedFact(id);ensure(!this.disposed&&source&&fact?.kind==='image'&&this.cache,'EXTRAS_ASSET_KIND','Gallery image is not declared');if(this.policy.mode==='eager')return openGalleryImage(source.program,source.provider,id,title,mount,signal,this.resources.limits.maxAssetBytes,fact);ensure(!signal.aborted,'EXTRAS_CANCELLED','Gallery cancelled');const controller=new AbortController(),cancel=()=>controller.abort();signal.addEventListener('abort',cancel,{once:true});const use=this.cache.acquire([id],controller.signal);try{await use.ready;ensure(!signal.aborted&&!this.disposed,'EXTRAS_CANCELLED','Gallery cancelled');const image=this.galleryImages.get(id);ensure(image,'EXTRAS_IMAGE','Image missing');const container=document.createElement('div');container.className='galbox-gallery-image-root';image.className='galbox-gallery-image';image.alt=title;container.append(image);mount.append(container);return ()=>{image.remove();image.className='';container.remove();use.release();};}catch(error){use.release();throw error;}finally{signal.removeEventListener('abort',cancel);}}
  private historyObserver:(()=>void)|null=null;
  private readonly historyVoice=new HistoryVoiceController(asset=>{const buffer=this.buffers.get(asset),media=this.mediaAssets.get(asset);if(buffer)return {kind:'buffer',buffer};ensure(media,'HISTORY_VOICE_ASSET','Voice resource unavailable');return {kind:'media',media};},()=>{this.historyObserver?.();const use=this.voiceUse;queueMicrotask(()=>{if(this.historyVoice.view().state==='idle'&&this.voiceUse===use){use?.release();this.voiceUse=null;}});});
  observeHistoryVoice(observer:(()=>void)|null):void {this.historyObserver=observer;}
  historyVoiceView(){return this.historyVoice.view();}
  async playHistoryVoice(id:string,recipe:import('../protocol/index.js').VoiceRecipe){this.stopHistoryVoice();const abort=new AbortController();this.voiceAbort=abort;ensure(this.cache,'HOST_DISPOSED','Resources unavailable');this.voiceUse=this.cache.acquire([recipe.asset],abort.signal);await this.voiceUse.ready;ensure(!abort.signal.aborted&&!this.disposed,'HISTORY_VOICE_CANCELLED','Voice cancelled');return this.historyVoice.play(id,recipe);}
  stopHistoryVoice():void {this.voiceAbort?.abort();this.voiceAbort=null;this.historyVoice.stop();this.voiceUse?.release();this.voiceUse=null;}
  pauseHistoryVoice(value:boolean):void {this.historyVoice.pause(value);}
  readonly video:VideoDiagnostics={state:'unverified',starts:0,ended:0,active:0,blocked:0};private videoController:VideoController|null=null;private videoAssets=new Map<string,PreparedMedia>();
  private streamFailure:Error|null=null;private cleanupFailure:Error|null=null;
  private app:GraphicsApplication|null=null;
  private readonly graphicsOptions:GraphicsOptions;
  private stage:ImageStage|null=null;
  private textures=new Map<string,Texture>();
  private readonly galleryImages=new Map<string,HTMLImageElement>();
  private readonly artwork=new Set<()=>void>();
  private readonly interfaceImages=new Map<string,string>();
  uiImageURL(id:string,width:number,height:number):string {const source=this.galleryImages.get(id);ensure(!this.disposed&&source,'UI_IMAGE','Image is not prepared');const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.min(1280,Math.ceil(width)));canvas.height=Math.max(1,Math.min(720,Math.ceil(height)));try{const context=canvas.getContext('2d');ensure(context,'UI_IMAGE','Image drawing unavailable');const scale=Math.min(canvas.width/source.naturalWidth,canvas.height/source.naturalHeight);context.drawImage(source,(canvas.width-source.naturalWidth*scale)/2,(canvas.height-source.naturalHeight*scale)/2,source.naturalWidth*scale,source.naturalHeight*scale);return canvas.toDataURL('image/png');}finally{canvas.width=0;canvas.height=0;}}
  interfaceArtwork(id:string,title:string,mount:HTMLElement,role:'background'|'logo'):()=>void {const source=this.galleryImages.get(id);ensure(!this.disposed&&source,'PRESENTATION_IMAGE','Artwork is not prepared');const image=new Image();image.alt=role==='logo'?title:'';image.className=`game-art-${role}`;const key=`${role}:${id}`;let uri=this.interfaceImages.get(key);if(!uri){uri=this.uiImageURL(id,role==='logo'?480:1280,role==='logo'?180:720);this.interfaceImages.set(key,uri);}image.src=uri;mount.append(image);let released=false;const release=()=>{if(released)return;released=true;image.remove();image.removeAttribute('src');this.artwork.delete(release);};this.artwork.add(release);return release;}
  achievementIcon(id:string,title:string,mount:HTMLElement):()=>void {const source=this.galleryImages.get(id);ensure(!this.disposed&&source,'EXTRAS_ICON','Image is not prepared');const canvas=document.createElement('canvas');canvas.width=96;canvas.height=96;const context=canvas.getContext('2d');ensure(context,'EXTRAS_ICON','Thumbnail drawing unavailable');const scale=Math.min(96/source.naturalWidth,96/source.naturalHeight);context.drawImage(source,(96-source.naturalWidth*scale)/2,(96-source.naturalHeight*scale)/2,source.naturalWidth*scale,source.naturalHeight*scale);const image=new Image();image.alt=title;image.className='achievement-icon';image.width=48;image.height=48;image.src=canvas.toDataURL('image/png');canvas.width=0;canvas.height=0;mount.append(image);let released=false;const release=()=>{if(released)return;released=true;image.remove();image.removeAttribute('src');this.artwork.delete(release);};this.artwork.add(release);return release;}
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
  private fonts=new Map<string,FontFace>();private readonly fontPrefix=`galbox-${crypto.randomUUID()}`;
  fontFamily(id:string):string {const face=this.fonts.get(id);ensure(face,'TEXT_FONT','Font has not been prepared');return face.family;}
  private canvas:HTMLCanvasElement|null=null;
  readonly resources:ResourceDiagnostics={ruleBytesEstimated:0,rulePeakBytesEstimated:0,ruleSurfaces:0,ruleFrames:0,catalogEncodedBytes:0,streamDeclaredBytes:0,integrity:[],canvasBlur:null,canvasBytesEstimated:0,canvasPeakBytesEstimated:0,canvasSurfaces:0,renderer:null,graphicsFallback:null,graphics:'unverified',assets:0,encodedBytes:0,textureBytesEstimated:0,decodedAudioBytes:0,mediaElementBytes:0,limits:parseResourceBudget(defaultResourceBudget)};
  readonly media:MediaDiagnostics={state:'unverified',starts:0,ended:0,blocked:0,decoded:0,active:0,loops:0,elementStarts:0};
  constructor(private readonly mount:HTMLElement,private readonly fault?:(error:Error)=>void,graphics:unknown={renderer:'auto'}) {this.graphicsOptions=parseGraphicsOptions(graphics);}
  get disposalError():Error|null {return this.cleanupFailure;}
  resourceFacts():ResourceFact[]{return this.loader?.knownFacts().map(parseResourceFact)??[];}
  applyAudioPreferences(input:unknown):void {const audio=parseAudioPreferences(input);this.uiSound.preferences(audio);this.historyVoice.preferences(audio);this.galleryMusic.preferences(audio);this.volume=audio.master;this.roleVolumes={bgm:audio.bgm,voice:audio.voice,sfx:audio.sfx};if(this.master)this.master.gain.value=this.volume;for(const p of this.playing.values())p.gain.gain.value=this.sourceGain(p);this.videoController?.preferences(this.roleVolumes.sfx*(this.mix?.gains.sfx??1));}
  assertReady():void {if(this.streamFailure)throw this.streamFailure;this.videoController?.assertReady();ensure(!this.disposed&&this.resources.graphics==='available','GRAPHICS_UNAVAILABLE','Recreate the player to prepare the graphics device');ensure(!this.audioUnavailable&&this.context&&this.context.state!=='closed','AUDIO_UNAVAILABLE','Audio device closed');}
  private lost=(event:Event):void=>{event.preventDefault();this.resources.graphics='unavailable';this.stopAudio();this.fault?.(new GalboxError('WEBGL_CONTEXT_LOST','图像设备连接已丢失，请重新打开播放器后读档。'));};
  async init(program:Program,provider:AssetProvider,signal:AbortSignal,policy:unknown=defaultResourceBudget,expected?:readonly ResourceFact[],streaming?:unknown,loading:LoadingOptions={mode:'eager'},functions:readonly string[]=[]):Promise<void> {
    try {
      this.gallerySource={program,provider};const streamPolicy=streaming===undefined?null:parseStreamingOptions(streaming);this.resources.limits=parseResourceBudget(policy);if(expected)resourceUsage(expected,this.resources.limits);
      if(typeof AudioContext==='undefined'){this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Web Audio is unavailable on this device');}
      try{this.context=new AudioContext();}catch{this.media.state='unavailable';throw new GalboxError('AUDIO_UNAVAILABLE','Audio context creation failed');}this.master=this.context.createGain();this.master.gain.value=this.volume;this.master.connect(this.context.destination);
      this.media.state=this.context.state==='running'?'available':'needs-user-action';
      const {app,backend,fallback}=await prepareGraphics(this.graphicsOptions,()=>this.disposed||signal.aborted,app=>{this.app=app;});this.resources.renderer=backend;this.resources.graphicsFallback=fallback;if(app.renderer instanceof CanvasRenderer){validateCanvasProgram(program,app.renderer.canvasContext.blendModes);ensure((this.graphicsOptions.maxCanvasBytes??defaultCanvasBytes)>=1280*720*4,'CANVAS_COMPOSITION_BUDGET','Canvas back buffer exceeds budget');}
      this.canvas=app.canvas;if(backend==='webgl')this.canvas.addEventListener('webglcontextlost',this.lost);this.resources.graphics='available';this.mount.appendChild(app.canvas);app.canvas.setAttribute('aria-label',`${program.title}图像舞台`);app.canvas.style.width='100%';app.canvas.style.height='100%';
      app.stage.sortableChildren=true;this.stage=new ImageStage(app,this.textures,this.galleryImages,this.graphicsOptions.maxCanvasBytes,this.graphicsOptions.maxRuleBytes);
      this.policy=loadingPolicy(loading);validateLoading(program,this.policy,functions);ensure(this.policy.mode==='eager'||expected,'LOADING_RELEASE_REQUIRED','Deferred loading requires a verified release manifest');this.program=program;this.loader=new ResourceLoader(program,provider,this.context,this.resources.limits,expected,streamPolicy,this.fontPrefix);
      this.cache=new AssetCache(this.policy.concurrency??3,this.policy.maxResidentBytes??268435456,async(id,signal,reserve)=>{const resource=await this.loader!.load(id,signal,reserve);try{ensure(!this.disposed&&!signal.aborted,'HOST_DISPOSED',id);if(resource.buffer)ensure([...this.buffers.values()].reduce((n,b)=>n+b.length*b.numberOfChannels*4,0)+resource.buffer.length*resource.buffer.numberOfChannels*4<=this.resources.limits.maxAudioBytes,'RESOURCE_AUDIO_BUDGET',id);this.loaded.set(id,resource);if(resource.texture)this.textures.set(id,resource.texture);if(resource.image)this.galleryImages.set(id,resource.image);if(resource.buffer){this.buffers.set(id,resource.buffer);this.media.decoded++;}if(resource.media){if(resource.fact.kind==='video'){this.videoAssets.set(id,resource.media);this.video.state='available';}else this.mediaAssets.set(id,resource.media);}if(resource.font)this.fonts.set(id,resource.font);this.updateResources();return {bytes:resource.cost,dispose:()=>{if(this.loaded.get(id)===resource){this.loaded.delete(id);this.textures.delete(id);this.galleryImages.delete(id);this.buffers.delete(id);this.mediaAssets.delete(id);this.videoAssets.delete(id);this.fonts.delete(id);}try{resource.dispose();}catch(error){this.cleanupFailure=new GalboxError(resource.stream?'STREAM_LEASE':'RESOURCE_CLEANUP',String(error));}this.updateResources();}};}catch(e){resource.dispose();throw e;}});
      this.bootstrap=this.policy.mode==='eager'?program.assets.map(a=>a.id):startupAssets(program);this.bootUse=this.cache.acquire(this.bootstrap,signal);await this.bootUse.ready;
      this.videoController=new VideoController(this.context,this.master,this.videoAssets,this.video,(texture,rect)=>this.stage?.setVideo(texture,rect),()=>this.stage?.invalidate(),error=>this.fault?.(error));this.videoController.preferences(this.roleVolumes.sfx);
    }catch(error){this.dispose();throw error;}
  }
  captureFontCSS():string {return [...this.loaded.values()].flatMap(r=>r.fontCSS?[r.fontCSS]:[]).join('\n');}
  captureThumbnail(snapshot:DeepReadonly<Snapshot>,text:TextCapture,signal:AbortSignal,overlay?:TextCapture){this.assertReady();ensure(this.canvas&&this.stage,'SAVE_CAPTURE_UNAVAILABLE','Graphics not ready');this.stage.invalidate();this.render(snapshot);return composeThumbnail(this.canvas,text,signal,overlay);}
  async revalidateStreams():Promise<void> {for(const r of this.loaded.values())await r.stream?.validate();}
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
  setEpoch(epoch:number):void {this.uiSound.stop();this.historyVoice.stop();this.stopAudio();this.videoController?.setEpoch(epoch);this.epoch=epoch;this.stage?.invalidate();}
  private syncCanvasDiagnostics():void {const rule=this.stage?.ruleDiagnostics();if(rule){this.resources.ruleBytesEstimated=rule.bytesEstimated;this.resources.rulePeakBytesEstimated=rule.peakBytesEstimated;this.resources.ruleSurfaces=rule.surfaces;this.resources.ruleFrames=rule.frames;}const d=this.stage?.canvasDiagnostics();if(d){this.resources.canvasBlur=d.blur;this.resources.canvasBytesEstimated=d.bytesEstimated;this.resources.canvasPeakBytesEstimated=d.peakBytesEstimated;this.resources.canvasSurfaces=d.surfaces;}}
  validateGraphicsPlan(snapshot:DeepReadonly<Snapshot>):void {if(this.app?.renderer instanceof CanvasRenderer)validateCanvasSnapshot(snapshot,this.app.renderer.canvasContext.blendModes);this.stage?.validate(snapshot);}
  render(run:DeepReadonly<Snapshot>,allowPrefetch=true,draw=true):void {
    if(!this.app||this.disposed||this.resources.graphics!=='available')return;
    try{this.validateGraphicsPlan(run);this.mix=run.audioState??null;for(const p of this.playing.values()){const logical=run.tasks.find(t=>t.id===p.task.id&&t.attempt===p.task.attempt);if(logical?.gain!==undefined)p.scriptGain=logical.gain;p.gain.gain.value=this.sourceGain(p);}this.videoController?.preferences(this.roleVolumes.sfx*(this.mix?.gains.sfx??1));this.videoController?.frame();if(draw)this.stage?.render(run);else this.stage?.pruneHidden(run);this.syncCanvasDiagnostics();this.previousUses.splice(0).forEach(use=>use.release());if(allowPrefetch)this.prefetch(run);}catch(error){this.syncCanvasDiagnostics();this.resources.graphics='unavailable';this.stopAudio();this.fault?.(error instanceof Error?error:new Error(String(error)));throw error;}
  }
  effect(effect:Effect,epoch:number,report:Parameters<HostPort['effect']>[2],playbackEnded?:Parameters<HostPort['effect']>[3]):void {
    if(this.disposed||epoch!==this.epoch)return;
    if(effect.type==='video-stop'){this.videoController?.stop();return;}
    if(effect.type==='video'){this.videoController?.play(effect.task,epoch,report,playbackEnded);return;}
    if(effect.type==='audio-stop'){for(const p of [...this.playing.values()])if(p.role===effect.channel)this.stopChannel(audioSlot(p.task));return;}
    if(effect.type==='audio-source-stop'){for(const p of [...this.playing.values()])if(p.task.id===effect.task&&p.task.attempt===effect.attempt)this.stopChannel(audioSlot(p.task));return;}
    if(effect.type==='audio-gain'){for(const playing of this.playing.values())if(playing.role===effect.channel){playing.scriptGain=effect.gain;playing.gain.gain.value=this.sourceGain(playing);}return;}
    const task=effect.task,context=this.context,master=this.master;
    if(!context||!master||!task.asset||!task.channel){report(task.id,task.attempt,'failed');return;}
    if(this.audioUnavailable||context.state==='closed'){this.media.state='unavailable';report(task.id,task.attempt,'failed');this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Audio device closed'));return;}
    if(context.state!=='running'&&!this.paused){this.media.blocked++;this.media.state='needs-user-action';report(task.id,task.attempt,'blocked');return;}
    const media=this.mediaAssets.get(task.asset);if(media){this.playElement(task,epoch,report,playbackEnded,media);return;}
    const buffer=this.buffers.get(task.asset);if(!buffer){this.media.state='unavailable';report(task.id,task.attempt,'failed');return;}
    this.stopChannel(audioSlot(task));
    let source:AudioBufferSourceNode|undefined,gain:GainNode|undefined;
    try {
      source=context.createBufferSource();gain=context.createGain();source.buffer=buffer;source.loop=task.loop??false;if(task.mediaTask){validateLoop(task,buffer.duration*1000);source.loopStart=task.mediaTask.loopStartMs/1000;source.loopEnd=(task.mediaTask.loopEndMs??buffer.duration*1000)/1000;}gain.gain.value=(task.gain??1)*this.roleVolumes[task.channel];source.connect(gain);gain.connect(master);
      const playing:Playing={...stopSignal(),source,buffer:source,gain,scriptGain:task.gain??1,role:task.channel,task,epoch,reported:true,sequence:0,report,...(playbackEnded?{ended:playbackEnded}:{})},channel=audioSlot(task);gain.gain.value=this.sourceGain(playing);this.playing.set(channel,playing);
      source.onended=()=>{if(!this.disposed&&epoch===this.epoch&&this.playing.get(channel)===playing){this.playing.delete(channel);this.media.ended++;this.media.active=this.playing.size;playbackEnded?.(task.id,task.attempt);}playing.source.disconnect();playing.gain.disconnect();};
      source.start();this.media.starts++;this.media.active=this.playing.size;this.media.state='available';report(task.id,task.attempt,'completed');
    }catch(error){const unavailable=error instanceof DOMException&&error.name==='NotSupportedError';this.playing.delete(audioSlot(task));if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();}gain?.disconnect();this.media.active=this.playing.size;if(unavailable){this.audioUnavailable=true;this.media.state='unavailable';report(task.id,task.attempt,'failed');this.fault?.(new GalboxError('AUDIO_UNAVAILABLE','Audio source unavailable on this device'));}else{this.media.blocked++;this.media.state='needs-user-action';report(task.id,task.attempt,'blocked');}}
  }
  setVolume(value:number):void {this.volume=Math.min(1,Math.max(0,value));if(this.master)this.master.gain.value=this.volume;}
  async pause(value:boolean):Promise<void> {this.paused=value;this.videoController?.pause(value);if(value)for(const p of this.playing.values())p.element?.pause();await this.reconcileAudio();}
  private sourceGain(p:Playing):number {return p.scriptGain*this.roleVolumes[p.role]*(this.mix?.gains[p.role]??1)*(p.role==='bgm'?this.mix?.duck.value??1:1);}
  private current(p:Playing):boolean {return !this.disposed&&p.epoch===this.epoch&&this.playing.get(audioSlot(p.task))===p;}
  private startElement(p:Playing):void {const element=p.element;if(!element||!this.current(p)||this.paused)return;const seq=++p.sequence;let timeout:ReturnType<typeof setTimeout>|undefined,playing:Promise<void>;try{playing=p.media?.validate&&!p.reported?p.media.validate(p.signal).then(()=>{if(!this.current(p)||p.signal.aborted||seq!==p.sequence||this.paused)return;if(p.media){element.crossOrigin='anonymous';element.src=p.media.url;}return element.play();}):element.play();}catch(error){playing=Promise.reject(error);}p.pending=Promise.race([playing,p.cancelled,new Promise<never>((_resolve,reject)=>{timeout=setTimeout(()=>reject(new GalboxError(p.media?.kind==='stream'?'STREAM_START_TIMEOUT':'MEDIA_START_TIMEOUT','Media did not start')),30000);})]).then(()=>{if(!this.current(p)){element.pause();return;}if(seq!==p.sequence)return;if(this.paused){element.pause();return;}if(!p.reported){p.reported=true;this.media.starts++;this.media.elementStarts++;this.media.state='available';p.report(p.task.id,p.task.attempt,'completed');}}).catch(error=>{if(!this.current(p)||seq!==p.sequence||this.paused&&error instanceof DOMException&&error.name==='AbortError')return;p.blocked=true;const stream=error instanceof GalboxError&&error.code.startsWith('STREAM_'),permanent=stream||error instanceof DOMException&&error.name==='NotSupportedError';if(permanent){this.audioUnavailable=true;this.media.state='unavailable';p.report(p.task.id,p.task.attempt,'failed');if(stream&&error instanceof Error)this.streamFailure=error;this.fault?.(stream&&error instanceof Error?error:new GalboxError('AUDIO_UNAVAILABLE','Media device rejected the source'));}else{this.media.state='needs-user-action';this.media.blocked++;p.report(p.task.id,p.task.attempt,'blocked');}}).finally(()=>{if(timeout!==undefined)clearTimeout(timeout);});}
  private playElement(task:Task,epoch:number,report:Parameters<HostPort['effect']>[2],ended:Parameters<HostPort['effect']>[3],media:PreparedMedia):void {
    ensure(this.context&&this.master&&task.channel,'AUDIO_UNAVAILABLE','Missing media context');try{validateLoop(task,media.durationMs);}catch(error){report(task.id,task.attempt,'failed');this.audioUnavailable=true;this.fault?.(error instanceof Error?error:new Error(String(error)));return;}this.stopChannel(audioSlot(task));const element=new Audio(),gain=this.context.createGain();element.preload=media.kind==='stream'?'none':'auto';if(media.kind==='blob')element.src=media.url;element.loop=!!task.loop&&(!task.mediaTask||task.mediaTask.loopStartMs===0&&task.mediaTask.loopEndMs===null);const source=this.context.createMediaElementSource(element);source.connect(gain);gain.connect(this.master);const p:Playing={...stopSignal(),media,source,element,gain,scriptGain:task.gain??1,role:task.channel,task,epoch,reported:false,sequence:0,report,...(ended?{ended}:{})};this.playing.set(audioSlot(task),p);gain.gain.value=this.sourceGain(p);this.media.active=this.playing.size;
    element.ontimeupdate=()=>{const loop=task.mediaTask;if(this.current(p)&&task.loop&&loop&&loop.loopEndMs!==null&&element.currentTime*1000>=loop.loopEndMs){element.currentTime=loop.loopStartMs/1000;this.media.loops++;}};
    element.onwaiting=()=>{if(this.current(p))this.media.state='buffering';};element.onplaying=()=>{if(this.current(p))this.media.state='available';};element.onstalled=()=>{if(this.current(p))this.media.state='buffering';};
    element.onended=()=>{if(!this.current(p))return;if(media.kind==='stream'&&element.currentTime*1000<media.durationMs-150){this.streamFailure=new GalboxError('STREAM_TRUNCATED','Stream ended before declared duration');report(task.id,task.attempt,'failed');this.stopChannel(audioSlot(p.task));this.fault?.(this.streamFailure);return;}if(task.loop){element.currentTime=(task.mediaTask?.loopStartMs??0)/1000;this.media.loops++;this.startElement(p);return;}if(!p.reported)return;this.playing.delete(audioSlot(p.task));this.media.active=this.playing.size;this.media.ended++;p.ended?.(task.id,task.attempt);element.onended=null;element.ontimeupdate=null;element.onerror=null;element.onwaiting=null;element.onplaying=null;element.onstalled=null;element.removeAttribute('src');element.load();source.disconnect();gain.disconnect();};
    element.onerror=()=>{if(!this.current(p))return;this.audioUnavailable=true;this.media.state='unavailable';report(task.id,task.attempt,'failed');this.stopChannel(audioSlot(p.task));if(media.kind==='stream')this.streamFailure=new GalboxError('STREAM_MEDIA','Streaming media request failed');this.fault?.(this.streamFailure??new GalboxError('AUDIO_UNAVAILABLE','Media playback failed'));};this.startElement(p);
  }
  async awaitAudioStarts():Promise<void> {if(!this.paused){await Promise.all([...this.playing.values()].map(p=>p.pending));await this.videoController?.awaitStarts();}}
  validateAudioPlan(snapshot:DeepReadonly<Snapshot>):void {for(const t of snapshot.tasks)if((t.kind==='media'||t.kind==='audio')&&['running','blocked','completed'].includes(t.status)&&t.asset){const info=this.mediaAssets.get(t.asset),buffer=this.buffers.get(t.asset);validateLoop({...t},info?.durationMs??(buffer?.duration??0)*1000);}}
  private stopChannel(channel:string):void {const p=this.playing.get(channel);if(p){this.playing.delete(channel);p.sequence++;p.cancel();if(p.element){p.element.onended=null;p.element.ontimeupdate=null;p.element.onerror=null;p.element.onwaiting=null;p.element.onplaying=null;p.element.onstalled=null;p.element.pause();p.element.removeAttribute('src');p.element.load();}if(p.buffer){p.buffer.onended=null;try{p.buffer.stop();}catch{}}p.source.disconnect();p.gain.disconnect();this.media.active=this.playing.size;}}
  private stopAudio():void {for(const channel of [...this.playing.keys()])this.stopChannel(channel);}
  private destroyApplication(app:GraphicsApplication|null):void {destroyGraphicsApplication(app);}
  dispose():void {
    for(const face of this.fonts.values())document.fonts.delete(face);this.fonts.clear();
    if(this.disposed)return;this.uiSoundObserver=null;this.uiSound.dispose();this.musicObserver=null;this.stopMusic();this.galleryMusic.dispose();this.gallerySource=null;this.historyObserver=null;this.stopHistoryVoice();this.historyVoice.dispose();this.disposed=true;this.videoController?.dispose();this.videoController=null;this.stopAudio();this.stage?.dispose();this.resources.ruleBytesEstimated=0;this.resources.ruleSurfaces=0;this.stage=null;
    this.canvas?.removeEventListener('webglcontextlost',this.lost);this.canvas=null;this.resources.graphics='unavailable';this.resources.canvasBytesEstimated=0;this.resources.canvasSurfaces=0;this.resources.textureBytesEstimated=0;this.resources.decodedAudioBytes=0;this.resources.encodedBytes=0;this.resources.assets=0;
    this.loadAbort.abort();this.prefetchAbort?.abort();this.bootUse?.release();this.displayUse?.release();this.previousUses.splice(0).forEach(use=>use.release());this.cache?.dispose();this.textures.clear();this.galleryImages.clear();this.interfaceImages.clear();for(const release of [...this.artwork])release();this.buffers.clear();this.mediaAssets.clear();this.videoAssets.clear();this.resources.mediaElementBytes=0;this.resources.integrity=[];this.resources.streamDeclaredBytes=0;this.resources.catalogEncodedBytes=0;
    this.destroyApplication(this.app);this.app=null;
    if(this.context&&this.context.state!=='closed')void this.context.close().catch(()=>{});this.context=null;this.master=null;this.media.active=0;
  }
}
