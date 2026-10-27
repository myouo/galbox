import {isTextComplete} from '../protocol/text.js';
import type {HistoryJournal} from './history.js';
import {freezeJson} from '../protocol/codecs.js';
import { Core } from '../core/index.js';
import type { CoreEvent, CoreView,Effect } from '../core/index.js';
import { ensure,GalboxError,parseAudioPlaybackEvent,parsePlaybackPreferences,parseTask } from '../protocol/index.js';
import type {AudioPlaybackEvent,PlaybackPreferences} from '../protocol/index.js';
import {PlaybackController} from './playback.js';
import type {PlaybackMode,PlaybackView} from './playback.js';
import type { HostPort, HostPreparation, ProgramPreparationPort, Scheduler, Store, ProgressBatch } from './ports.js';
type RuntimeEvent=CoreEvent|{type:'playback.mode';mode:PlaybackMode}|{type:'playback.preferences';value:PlaybackPreferences}|{type:'playback.pause';value:boolean}|{type:'playback.ended';value:AudioPlaybackEvent};
interface Queued {event:RuntimeEvent;automated?:boolean;freeze?:boolean;resolve:()=>void;reject:(e:unknown)=>void;}
export class Coordinator {
  private queue:Queued[]=[];
  private held:Queued[]=[];
  private frozen=false;
  private current:Queued|null=null;
  private draining=false;
  private stopped=false;
  private listeners=new Set<()=>void>();
  private flushTail:Promise<void>=Promise.resolve();
  private batch:ProgressBatch|null=null;
  private commitCounter=0;
  private persistenceError:string|null=null;
  private observerError:string|null=null;
  private preparation:HostPreparation|null=null;private pendingEffects:Effect[]=[];private prepared:CoreView['run']|null=null;private previous:CoreView|null=null;
  private resourcePhase:'idle'|'loading'|'failed'='idle';private resourceFailure:string|null=null;
  private readonly playback:PlaybackController;
  private requestedPlayback:PlaybackMode='manual';private playbackPaused=false;
  constructor(readonly core:Core,private readonly host:HostPort,private readonly scheduler:Scheduler,private readonly store:Store,readonly epoch:number,readonly authority:string|null,private readonly sessionId:string,private readonly budget=100,readonly history?:HistoryJournal,private readonly code?:ProgramPreparationPort) {this.playback=new PlaybackController(sessionId);if(history)this.core.accept({type:'history.session',id:history.scope});}
  get executing():boolean {return this.current!==null;}
  resourceView(){return {phase:this.resourcePhase,error:this.resourceFailure};}
  capture(){ensure(this.resourcePhase==='idle','RESOURCE_PREPARING','Wait for resource preparation or retry it');return this.core.capture();}
  retryResources():Promise<void> {ensure(this.resourcePhase==='failed'&&this.current,'RESOURCE_RETRY_UNAVAILABLE','No failed resource preparation');return new Promise((resolve,reject)=>{this.current={...this.current!,resolve,reject};this.resourcePhase='idle';this.resourceFailure=null;this.work();});}
  playbackView():PlaybackView{return this.playback.view();}
  setPlayback(mode:PlaybackMode):Promise<void>{ensure(mode==='manual'||mode==='auto'||mode==='skip','PLAYBACK_MODE','Unknown playback mode');this.requestedPlayback=mode;return this.enqueue({type:'playback.mode',mode});}
  configurePlayback(input:unknown):Promise<void>{return this.enqueue({type:'playback.preferences',value:parsePlaybackPreferences(input)});}
  pausePlayback(value:boolean):Promise<void>{this.playbackPaused=value;return this.enqueue({type:'playback.pause',value});}
  reportPlayback(input:unknown):Promise<void>{const value=parseAudioPlaybackEvent(input);return value.epoch===this.epoch?this.enqueue({type:'playback.ended',value}):Promise.resolve();}
  view():CoreView {return this.resourcePhase==='idle'?this.core.view():{...(this.previous??this.core.view()),canSave:false,saveReason:'RESOURCE_PREPARING'};}
  subscribe(fn:()=>void):()=>void {this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
  get storageError():string|null {return this.persistenceError;}
  get subscriberError():string|null {return this.observerError;}
  private notify():void {for(const fn of [...this.listeners]){try{fn();}catch(error){this.observerError=error instanceof Error?error.message:String(error);}}}
  start():Promise<void> {return this.dispatch({type:'tick',ms:0});}
  dispatch(event:CoreEvent):Promise<void> {
    return this.enqueue(event);
  }
  private enqueue(event:RuntimeEvent):Promise<void> {
    if(this.stopped)return Promise.resolve();
    return new Promise((resolve,reject)=>{const target=this.frozen&&event.type!=='flushAck'?this.held:this.queue;target.push({event,resolve,reject});this.pump();});
  }
  freeze():Promise<void> {
    if(this.resourcePhase==='failed')return Promise.reject(new GalboxError('RESOURCE_PREPARING','Retry resource preparation before changing the current run'));
    if(this.frozen||this.stopped)return Promise.resolve();
    return new Promise((resolve,reject)=>{this.queue.push({event:{type:'tick',ms:0},freeze:true,resolve,reject});this.pump();});
  }
  thaw():void {if(this.stopped)return;this.frozen=false;this.queue.push(...this.held);this.held=[];this.pump();}
  private pump():void {
    if(this.draining||this.stopped)return;this.draining=true;this.work();
  }
  private work():void {
    if(this.stopped){this.draining=false;return;}
    if(this.resourcePhase!=='idle')return;
    try {
      if(!this.current){this.current=this.queue.shift()??null;if(!this.current){this.draining=false;return;}this.previous=this.core.view();this.accept(this.current.event);}
      if(this.core.run(this.budget)==='yield'){if(this.core.requiredFunction){this.prepareCode(this.core.requiredFunction);return;}this.scheduler.defer(()=>this.work());return;}
      if(!this.effects())return;
      if(this.current.event.type==='tick'&&!this.current.freeze&&!this.current.automated){this.current.automated=true;const action=!this.playbackPaused&&this.playback.view().mode===this.requestedPlayback?this.playback.tick(this.core.view(),this.current.event.ms):null;if(action){this.accept(action);if(this.core.run(this.budget)==='yield'){if(this.core.requiredFunction){this.prepareCode(this.core.requiredFunction);return;}this.scheduler.defer(()=>this.work());return;}if(!this.effects())return;}}
      this.playback.settle(this.core.view());
      const current=this.current;this.current=null;if(current?.freeze){this.frozen=true;this.held.push(...this.queue);this.queue=[];}this.notify();current?.resolve();
      if(this.core.view().dirty||this.history?.dirty||this.core.view().run.wait?.kind==='flush')void this.flush().catch(()=>{});
      if(this.queue.length){this.scheduler.defer(()=>this.work());return;}this.draining=false;
    } catch(error) {this.current?.reject(error);this.current=null;this.draining=false;this.notify();}
  }
  private prepareCode(id:string):void {try{ensure(this.code,'MODULE_PROVIDER','A module preparation port is required');const preparation=this.code.prepareFunction(id);this.preparation=preparation;this.resourcePhase='loading';this.notify();void preparation.ready.then(()=>{if(this.stopped||this.preparation!==preparation)return;try{preparation.commit();this.preparation=null;this.resourcePhase='idle';this.scheduler.defer(()=>this.work());}catch(e){this.cancelPreparation(preparation);this.preparation=null;this.resourceFailed(e);}},e=>{if(this.stopped||this.preparation!==preparation)return;this.cancelPreparation(preparation);this.preparation=null;this.resourceFailed(e);});}catch(e){this.resourceFailed(e);}}
  private accept(event:RuntimeEvent):void{
    if(this.history&&(event.type==='advance'||event.type==='step')){const before=this.core.view();if(before.run.wait?.kind==='text'&&before.run.text&&before.run.wait.prompt===event.prompt&&isTextComplete(before.run.text)){const snapshot=this.history.policy.rollback&&before.canSave?this.core.capture():null;this.core.accept(event);const after=this.core.view();if(after.run.history.length===before.run.history.length+1)this.history.confirmed(snapshot,before.run.text,this.history.policy.rollback?before.saveReason:'ROLLBACK_DISABLED',before.run.release);return;}}
    switch(event.type){case 'playback.mode':this.playback.setMode(event.mode);return;case 'playback.preferences':this.playback.configure(event.value);return;case 'playback.pause':this.playback.pause(event.value);return;case 'playback.ended':this.core.accept({type:'media.ended',task:event.value.task,attempt:event.value.attempt});this.playback.ended(event.value.task,event.value.attempt);return;default:this.core.accept(event);if(event.type==='task')this.playback.started(event.task,event.attempt,event.result);}}
  private effects():boolean {
    this.pendingEffects.push(...this.core.drainEffects());const snapshot=this.core.view().run;
    if(this.prepared!==snapshot){let preparation:HostPreparation|void;try{preparation=this.host.prepare?.(snapshot,this.pendingEffects.map(effect=>effect.type==='audio'||effect.type==='video'?{...effect,task:parseTask(effect.task)}:{...effect}));}catch(error){this.resourceFailed(error);return false;}
      if(preparation){this.preparation=preparation;this.resourcePhase='loading';this.notify();void preparation.ready.then(()=>{if(this.stopped||this.preparation!==preparation)return;try{preparation.commit();this.preparation=null;this.prepared=snapshot;this.resourcePhase='idle';this.scheduler.defer(()=>this.work());}catch(error){this.cancelPreparation(preparation);this.preparation=null;this.resourceFailed(error);}},error=>{if(this.stopped||this.preparation!==preparation)return;this.cancelPreparation(preparation);this.preparation=null;this.resourceFailed(error);});return false;}this.prepared=snapshot;}
    for(const effect of this.pendingEffects.splice(0)){this.playback.effect(effect);this.host.effect(effect,this.epoch,(task,attempt,result)=>{if(!this.stopped)void this.dispatch({type:'task',task,attempt,result}).catch(()=>{});},(task,attempt)=>{if(!this.stopped)void this.reportPlayback({epoch:this.epoch,task,attempt,state:'ended'}).catch(()=>{});});}return true;
  }
  private cancelPreparation(preparation:HostPreparation):void {try{preparation.cancel();}catch(error){this.observerError=String(error);}}
  private resourceFailed(error:unknown):void {this.resourcePhase='failed';this.resourceFailure=String(error);this.current?.reject(error);this.notify();}
  flush():Promise<void> {
    const next=this.flushTail.catch(()=>{}).then(async()=>{
      if(this.stopped)return;
      ensure(this.resourcePhase==='idle','RESOURCE_PREPARING','Uncommitted resource target cannot flush progress');
      const changes=this.core.pending();
      if(!this.batch&&changes.length)this.batch=Object.freeze({id:`${this.sessionId}:p${++this.commitCounter}`,baseRevision:this.core.view().profile.revision,through:changes.at(-1)?.seq??0,changes:Object.freeze(changes.map(c=>c.type==='read'?Object.freeze({...c}):c.type==='set'?Object.freeze({...c,value:freezeJson(c.value)}):c.type==='flow'?Object.freeze({...c,value:freezeJson(c.value)}):Object.freeze({...c,value:freezeJson(c.value)})))});
      if(this.batch){
        try {
          const receipt=await this.store.progress(this.batch,this.authority);
          this.core.acknowledge(receipt.through,receipt.revision);this.batch=null;this.persistenceError=null;
        } catch(error){this.persistenceError=error instanceof Error?error.message:String(error);if(error instanceof GalboxError&&error.code==='SESSION_REVOKED')this.stop(true);else this.notify();throw error;}
      }
      if(!this.stopped&&this.core.view().run.wait?.kind==='flush')await this.dispatch({type:'flushAck',revision:this.core.view().profile.revision});
      if(this.history?.dirty){try{await this.history.flush();this.persistenceError=null;}catch(error){this.persistenceError=error instanceof Error?error.message:String(error);if(error instanceof GalboxError&&error.code==='SESSION_REVOKED')this.stop(true);else this.notify();throw error;}}
      this.notify();
    });
    this.flushTail=next;return next;
  }
  async flushAll():Promise<void> {ensure(!this.stopped,'SESSION_REVOKED','Cannot flush a stopped session');do {await this.flush();}while(!this.stopped&&(this.core.pending().length||this.history?.dirty));ensure(!this.core.pending().length&&!this.history?.dirty,'SESSION_REVOKED','Session stopped with uncommitted progress');}
  stop(notify=false):void {
    if(this.preparation)this.cancelPreparation(this.preparation);this.preparation=null;this.pendingEffects=[];this.resourcePhase='idle';
    this.playback.setMode('manual');
    this.stopped=true;this.core.revoke();for(const q of [...this.queue,...this.held])q.resolve();this.queue=[];this.held=[];this.current?.resolve();this.current=null;if(notify)this.notify();this.listeners.clear();
  }
}
