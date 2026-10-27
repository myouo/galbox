import {isTextSegmentComplete} from '../protocol/text.js';
import {parsePlaybackPreferences,readUnit} from '../protocol/index.js';
import type {Effect,CoreView,CoreEvent} from '../core/index.js';
export type PlaybackMode='manual'|'auto'|'skip';
export interface PlaybackView {readonly mode:PlaybackMode;readonly reason:string;readonly elapsedMs:number;readonly voice:'none'|'pending'|'playing'|'ended'|'blocked'|'failed';}
export class PlaybackController {
 private mode:PlaybackMode='manual';private paused=false;private prompt:number|null=null;private eligible=false;private elapsed=0;private sequence=0;private reason='manual';
 private preferences=parsePlaybackPreferences({autoDelayMs:1500,skipUnread:false});
 private voice:{task:string;attempt:number;loop:boolean;state:Exclude<PlaybackView['voice'],'none'>}|null=null;
 constructor(private readonly identity:string){}
 view():PlaybackView{return {mode:this.mode,reason:this.paused?'paused':this.reason,elapsedMs:this.elapsed,voice:this.voice?.state??'none'};}
 configure(input:unknown):void{this.preferences=parsePlaybackPreferences(input);this.reset();}
 setMode(mode:PlaybackMode):void{this.mode=mode;this.reason=mode;this.reset();}
 pause(value:boolean):void{this.paused=value;this.eligible=false;}
 private reset():void{this.eligible=false;this.elapsed=0;}
 effect(effect:Effect):void {
  if(effect.type==='audio-stop'&&effect.channel==='voice'){this.voice=null;this.reset();}
  if(effect.type==='audio'&&effect.task.channel==='voice'){this.voice={task:effect.task.id,attempt:effect.task.attempt,loop:effect.task.loop??false,state:'pending'};this.reset();}
 }
 started(task:string,attempt:number,result:'completed'|'blocked'|'failed'):void{if(this.voice?.task!==task||this.voice.attempt!==attempt||this.voice.state!=='pending')return;this.voice.state=result==='completed'?'playing':result;this.reset();}
 ended(task:string,attempt:number):void{if(this.voice?.task!==task||this.voice.attempt!==attempt||this.voice.state!=='playing'||this.voice.loop)return;this.voice.state='ended';this.eligible=false;}
 settle(view:CoreView):void {
  if(this.mode==='manual')return;const run=view.run,w=run.wait;
  if(run.status==='ended'||run.status==='failed'||(w?.kind==='choice'||w?.kind==='interaction')){this.mode='manual';this.reason=w?.kind==='choice'||w?.kind==='interaction'?'choice':run.status;this.reset();}
 }
 tick(view:CoreView,ms:number):CoreEvent|null {
  this.settle(view);
  if(this.paused||this.mode==='manual')return null;const run=view.run,w=run.wait;
  if(w?.kind!=='text'||!run.text){this.reason='waiting';this.reset();return null;}
  if(this.prompt!==w.prompt){this.prompt=w.prompt;this.reset();}
  if(this.mode==='skip'){
   if(!this.preferences.skipUnread&&!view.profile.read.includes(readUnit(run.text))){this.mode='manual';this.reason='unread';this.reset();return null;}
   this.reason='skipping';return {type:'step',prompt:w.prompt,inputId:`${this.identity}:skip:${++this.sequence}`};
  }
  const full=isTextSegmentComplete(run.text),voice=this.voice;
  if(!full||voice&&voice.state!=='ended'){this.reason=!full?'revealing':voice?.loop?'voice-loop':`voice-${voice?.state}`;this.reset();return null;}
  this.reason='auto-delay';if(this.eligible)this.elapsed+=ms;else this.eligible=true;
  if(this.elapsed<this.preferences.autoDelayMs)return null;
  this.reset();return {type:'advance',prompt:w.prompt,inputId:`${this.identity}:auto:${++this.sequence}`};
 }
}
