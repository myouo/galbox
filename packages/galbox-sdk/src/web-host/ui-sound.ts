import {ensure,GalboxError,parseAudioPreferences,parseUISoundRequest} from '../protocol/index.js';
export type UISoundResult='started'|'blocked'|'cancelled';
export interface UISoundView {readonly state:'idle'|'preparing'|'playing'|'blocked'|'failed';readonly asset:string|null;readonly gain:number;readonly starts:number;readonly ended:number;readonly error:string|null;}
export interface UISoundLease {readonly buffer:AudioBuffer;release():void;}
/** Device feedback only: one owned cue, independent of story tasks and clocks. */
export class UISoundController {
 private context:AudioContext|null=null;
 private source:AudioBufferSourceNode|null=null;
 private gain:GainNode|null=null;
 private lease:UISoundLease|null=null;
 private abort:AbortController|null=null;
 private generation=0;
 private disposed=false;
 private volume=1;
 private scriptGain=1;
 private status:Omit<UISoundView,'gain'>={state:'idle',asset:null,starts:0,ended:0,error:null};
 constructor(private readonly load:(asset:string,signal:AbortSignal)=>Promise<UISoundLease>,private readonly changed:()=>void){}
 view():UISoundView{return {...this.status,gain:this.volume*this.scriptGain};}
 preferences(input:unknown):void{const p=parseAudioPreferences(input);this.volume=p.master*p.sfx;if(this.gain)this.gain.gain.value=this.volume*this.scriptGain;}
 private update(patch:Partial<Omit<UISoundView,'gain'>>):void{this.status={...this.status,...patch};this.changed();}
 private current(ticket:number):boolean{return !this.disposed&&ticket===this.generation;}
 private release():void{this.abort?.abort();this.abort=null;if(this.source){this.source.onended=null;try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}this.gain?.disconnect();this.gain=null;this.lease?.release();this.lease=null;}
 stop():void{++this.generation;this.release();this.update({state:'idle',asset:null,error:null});}
 private async bounded<T>(work:Promise<T>,signal:AbortSignal):Promise<T>{let timer:ReturnType<typeof setTimeout>|undefined;let cancel=()=>{};try{return await Promise.race([work,new Promise<never>((_r,reject)=>{cancel=()=>reject(new GalboxError('UI_SOUND_CANCELLED','Cue cancelled'));signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel();timer=setTimeout(()=>reject(new GalboxError('UI_SOUND_TIMEOUT','Cue preparation exceeded 10 seconds')),10000);})]);}finally{if(timer)clearTimeout(timer);signal.removeEventListener('abort',cancel);}}
 async play(input:unknown):Promise<UISoundResult>{
  const request=parseUISoundRequest(input);ensure(!this.disposed,'UI_SOUND_DISPOSED','Cue controller disposed');const ticket=this.generation+1;this.stop();if(!this.current(ticket))return 'cancelled';this.scriptGain=request.gain;
  if(!navigator.userActivation?.hasBeenActive){this.update({state:'blocked',asset:request.asset});return 'blocked';}
  const controller=new AbortController();this.abort=controller;this.update({state:'preparing',asset:request.asset});if(!this.current(ticket))return 'cancelled';
  try{
   const context=this.context??=new AudioContext();
   // Start resume in the gesture turn, before asynchronous resource preparation.
   const resumed=this.bounded(context.resume(),controller.signal);
   const loading=this.load(request.asset,controller.signal).then(lease=>{if(!this.current(ticket)){lease.release();throw new GalboxError('UI_SOUND_CANCELLED','Superseded cue');}this.lease=lease;return lease;});
   const [,lease]=await this.bounded(Promise.all([resumed,loading]),controller.signal);if(!this.current(ticket))return 'cancelled';
   if(context.state!=='running'){this.release();this.update({state:'blocked'});return 'blocked';}
   ensure(lease.buffer.duration<=30,'UI_SOUND_DURATION','Interface sounds are limited to 30 seconds');
   const source=context.createBufferSource(),gain=context.createGain();this.source=source;this.gain=gain;source.buffer=lease.buffer;source.loop=false;gain.gain.value=this.volume*this.scriptGain;source.connect(gain);gain.connect(context.destination);
   source.onended=()=>{if(!this.current(ticket)||this.source!==source)return;this.release();this.update({state:'idle',asset:null,ended:this.status.ended+1});};
   source.start();this.update({state:'playing',starts:this.status.starts+1});return 'started';
  }catch(error){if(!this.current(ticket))return 'cancelled';++this.generation;this.release();if(error instanceof DOMException&&error.name==='NotAllowedError'){this.update({state:'blocked'});return 'blocked';}this.update({state:'failed',error:String(error)});throw error;}
 }
 dispose():void{if(this.disposed)return;this.stop();this.disposed=true;if(this.context&&this.context.state!=='closed')void this.context.close().catch(()=>{});this.context=null;}
}
