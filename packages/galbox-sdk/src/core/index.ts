import {SnapshotProjection} from './view.js';
import {freezeJson} from '../protocol/codecs.js';
import {initialUI,isUIInstruction,executeUI,acceptUI,validateUIRestore} from '../protocol/ui.js';
import {extrasSignature,extrasProgress,evaluateExtras,sceneRoot,validateSceneRoot} from '../protocol/extras.js';
import {flowProgress,flowEntry,initialFlow,validateFlowRun} from '../protocol/flow.js';
import {streamCatalog} from '../protocol/streams.js';
import {startVideo,videoReport,videoEnded,videoSaveReason,validateVideo} from './video.js';
import {prepareInteraction,activateInteraction,pickInteraction,tickInteraction,restoreInteraction} from '../protocol/interaction.js';
import {initialAudioState,isAudioInstruction,audioExpressions,tickAudio,updateDuck,stopAudioTasks,bindVoice,mediaReport,mediaEnded,mediaSaveReason} from '../protocol/audio.js';
import {executeAudio,replayVoice,validateAudioSnapshot} from './audio.js';
import {isStageInstruction,initialScene,applyStageTask,taskObject,taskLocks,validateStageGraph} from '../protocol/stage.js';
import {executeStage,removeStageObject,validateStageSnapshot} from './stage.js';
import { ensure, parseSnapshot, parseProfile, parseValue, emptyProfile, i32, readUnit, GalboxError, parseOperationResume, parseSavedInvocation, parseRestoreRecipe, recoveryOpcodes, parseInstruction, parseTextPreferences, parseTextState,parseTask,parseInteractionEvent,parseFlowProgress,parseExtrasProgress } from '../protocol/index.js';
import type { Program, Snapshot, Profile, Frame, Value, Operand, Task, Instruction, DeepReadonly, Position, Function as ProgramFunction, SavedInvocation, OperationResume,InteractionEvent } from '../protocol/index.js';
import {extendedValue,equalValues,orderValues} from '../protocol/values.js';
import {initialTextLayout,prepareWindowText,commitWindowText,confirmWindowText,activeTextWindow,clearTextWindow,validateWindowState} from '../protocol/layout.js';
import {compileRichText,richTextSignature,textSegmentation,tickRichText,revealRichText,isTextComplete,validateRichText} from '../protocol/text.js';
import type {TextPlan} from '../protocol/text.js';
import {evaluateExpression,templateSignature} from '../protocol/expressions.js';
import {sampleI32,initialRng} from './rng.js';
import { linkProgram } from '../program-tools/linker.js';
import { emptyOperations, operationContext } from './operations.js';
import type { OperationRegistry } from './operations.js';
export interface CoreOptions {readonly operations?:OperationRegistry;readonly mode?:'restore'|'initial'|'candidate';readonly rngSeed?:number;readonly entryNode?:string;readonly entryScene?:string;}
export type CoreEvent =
 | {type:'history.session';id:string}
 | import('../protocol/index.js').UIEvent
 | InteractionEvent
 | {type:'video.skip';prompt:number;inputId:string}
 | {type:'media.ended';task:string;attempt:number}
 | {type:'voice.replay';prompt:number;inputId:string}
 | OperationResume
 | {type:'text.preferences';value:import('../protocol/index.js').TextPreferences}
 | {type:'reveal' | 'advance' | 'step'; prompt:number; inputId:string}
 | {type:'choose'; prompt:number; inputId:string; option:string}
 | {type:'tick'; ms:number}
 | {type:'task'; task:string; attempt:number; result:'completed'|'blocked'|'failed'}
 | {type:'retry'; task:string}
 | {type:'flushAck'; revision:number};
export type Effect = {type:'video';task:Task} | {type:'video-stop'} | {type:'audio'; task:Task} | {type:'audio-stop'; channel:'bgm'|'voice'|'sfx'} | {type:'audio-gain'; channel:'bgm'|'voice'|'sfx'; gain:number};
export type ProgressChange = import('../protocol/index.js').ProgressChangeWire;
export interface CoreView { readonly run: DeepReadonly<Snapshot>; readonly profile: DeepReadonly<Profile>; readonly dirty:number; readonly error:string|null; readonly canSave:boolean; readonly saveReason:string|null; }
function positions(p: Position): Position { return {...p}; }
function values(slots: readonly {id:string;initial:Value}[]): Record<string,Value> { return Object.fromEntries(slots.map(s=>[s.id,parseValue(s.initial)])); }
function length(text:string):number { return Array.from(text).length; }
export class Core {
  private readonly program:Program;
  private readonly functions=new Map<string,{definition:ProgramFunction;code:Map<string,Instruction>;next:Map<string,string>}>();
  private readonly extrasIdentity:string|null;
  private s:Snapshot;
  private viewCache:CoreView|null=null;
  private readonly projection=new SnapshotProjection();
  private profileView:{source:Profile;sequence:number;revision:number;value:DeepReadonly<Profile>}|null=null;
  private profile:Profile;
  private changes:ProgressChange[]=[];
  private progressSeq=0;
  private effects:Effect[]=[];
  private consumed=new Set<string>();
  private textRemainder=0;
  private richPlan:TextPlan|null=null;
  private textInterval=32;
  private error:string|null=null;
  private revoked=false;
  private recovering=false;
  private reducing=false;
  constructor(input:unknown, profile:unknown=emptyProfile(), snapshot?:unknown, private readonly mode:'restore'|'initial'|'candidate'='restore',private readonly operations:OperationRegistry=emptyOperations, rngSeed?:number,entryNode?:string,entryScene?:string) {
    ensure(mode==='restore'||mode==='initial'||mode==='candidate','ACTIVATION_MODE','Unknown activation mode');
    this.program=linkProgram(input,operations).copy();for(const definition of this.program.functions){const code=new Map(definition.code.map(i=>[i.at,i])),next=new Map<string,string>();for(let i=0;i<definition.code.length-1;i++){const at=definition.code[i]?.at,following=definition.code[i+1]?.at;if(at&&following)next.set(at,following);}this.functions.set(definition.id,{definition,code,next});} this.profile=parseProfile(profile);this.extrasIdentity=extrasSignature(this.program);extrasProgress(this.program,this.profile,this.extrasIdentity);flowProgress(this.program,this.profile);ensure(entryNode===undefined||entryScene===undefined,'EXTRAS_ENTRY_CONFLICT','Choose one declared root');ensure(snapshot===undefined||(entryNode===undefined&&entryScene===undefined),'FLOW_ENTRY_SNAPSHOT','Declared entry starts a fresh run');
    if(snapshot!==undefined) {ensure(rngSeed===undefined,'RESTORE_RNG_SEED','A restored run must use its saved RNG state');this.s=validateSnapshot(this.program,snapshot,operations,mode==='initial'); this.s.profileBasis=this.profile.revision; this.resumeEffects(mode==='candidate'?'restore':mode);if(mode==='candidate')this.effects=[]; }
    else {
      const entry=this.fn(entryScene!==undefined?sceneRoot(this.program,this.profile,entryScene):entryNode===undefined?this.program.entry:flowEntry(this.program,this.profile,entryNode)),rng=initialRng(this.program.rng,rngSeed);
      const ui=initialUI(this.program),textLayout=initialTextLayout(this.program),catalog=streamCatalog(this.program),flow=initialFlow(this.program,entryNode??null);this.s={...(ui?{ui}:{}),...(entryScene!==undefined?{replayScene:entryScene}:{}),...(this.extrasIdentity?{extrasSignature:this.extrasIdentity}:{}),...(flow?{flow}:{}),...(catalog?{streamCatalog:catalog}:{}),...(textLayout?{textLayout}:{}),...(this.program.capabilities.includes('stage.effects')?{scene:initialScene()}:{}),...(this.program.capabilities.includes('audio.extended')?{audioState:initialAudioState()}:{}),version:1,release:this.program.release,frames:[this.frame(entry,[])],globals:values(this.program.globals),stage:[],text:null,history:[],tasks:[],groups:[],wait:null,saveAllowed:true,status:'running',counter:0,profileBasis:this.profile.revision,logicalTime:0,invocations:[],...(rng?{rng}:{})};
    }
    if(snapshot===undefined)this.checkExtras();
    if(this.s.text?.rich){this.textInterval=this.s.text.rich.baseIntervalMs;this.richPlan=compileRichText(this.s.text.rich.runs);}
  }
  private textPlan():TextPlan {const rich=this.s.text?.rich;ensure(rich,'TEXT_STATE','No structured text');return this.richPlan??=compileRichText(rich.runs);}
  private definition(id:string){const result=this.functions.get(id);ensure(result,'FUNCTION',id);return result;}
  private fn(id:string):ProgramFunction {return this.definition(id).definition;}
  private frame(f:ProgramFunction,args:Value[]):Frame {
    const locals=values([...f.params,...f.locals]);f.params.forEach((p,j)=>{const v=args[j];ensure(v,'CALL_ARITY',f.id);locals[p.id]=parseValue(v);});
    return {functionId:f.id,layout:1,pc:f.entry,locals};
  }
  private top():Frame { const f=this.s.frames.at(-1);ensure(f,'STACK','Empty stack');return f; }
  private op():Instruction {const f=this.top(),op=this.definition(f.functionId).code.get(f.pc);ensure(op,'PC',f.pc);return op;}
  private next():string {const f=this.top(),next=this.definition(f.functionId).next.get(f.pc);ensure(next,'FALLTHROUGH',f.pc);return next;}
  private expression(e:import('../protocol/index.js').Expression):Value {return evaluateExpression(e,{slot:id=>Object.hasOwn(this.top().locals,id)?this.top().locals[id]:Object.hasOwn(this.s.globals,id)?this.s.globals[id]:undefined,profile:key=>Object.hasOwn(this.profile.values,key)?this.profile.values[key]:undefined,read:unit=>this.profile.read.includes(unit)});}
  private get(o:Operand):Value { if('expression'in o)return this.expression(o.expression);if('literal'in o)return parseValue(o.literal); const v=this.top().locals[o.slot]??this.s.globals[o.slot];ensure(v,'SLOT',o.slot);return parseValue(v); }
  private put(id:string,v:Value):void {
    const map=Object.hasOwn(this.top().locals,id)?this.top().locals:this.s.globals;
    ensure(map[id]?.kind===v.kind,'SLOT_KIND',id);map[id]=parseValue(v);
  }
  private setProfile(key:string,value:Value):void {ensure(!extendedValue(value)||this.program.capabilities.includes('values.extended'),'VALUE_CAPABILITY','Declare values.extended');if(!this.program.extras){this.profile.values[key]=parseValue(value);this.changes.push({seq:++this.progressSeq,type:'set',key,value:parseValue(value)});return;}const next=parseProfile(this.profile);next.values[key]=parseValue(value);const extra=evaluateExtras(this.program,next,this.extrasIdentity);if(extra?.changed)next.extras=extra.progress;parseProfile(next);this.profile=next;this.changes.push({seq:++this.progressSeq,type:'set',key,value:parseValue(value)});if(extra?.changed)this.changes.push({seq:++this.progressSeq,type:'extras',value:parseExtrasProgress(extra.progress)});}
  private markFlow(id:string,visited:boolean):void {const node=this.program.flowchart?.nodes.find(n=>n.id===id),state=flowProgress(this.program,this.profile);ensure(node&&state&&this.s.flow,'FLOW_NODE_UNKNOWN',id);const before=JSON.stringify(state);if(visited&&!state.visited.includes(id))state.visited.push(id);if(!state.unlocked.includes(id))state.unlocked.push(id);const next=parseFlowProgress(state);if(before!==JSON.stringify(next)){this.profile.flow=next;this.changes.push({seq:++this.progressSeq,type:'flow',value:parseFlowProgress(next)});}if(visited)this.s.flow.current=id;}
  private checkExtras(force?:string):void {const extra=evaluateExtras(this.program,this.profile,this.extrasIdentity,force);if(extra?.changed){this.profile.extras=parseExtrasProgress(extra.progress);this.changes.push({seq:++this.progressSeq,type:'extras',value:parseExtrasProgress(extra.progress)});}}
  private read():void {const text=this.s.text;ensure(text,'TEXT','No page');const unit=readUnit(text),unread=!this.profile.read.includes(unit);if(!this.program.extras){if(unread){this.profile.read.push(unit);this.changes.push({seq:++this.progressSeq,type:'read',unit});}return;}const next=parseProfile(this.profile);if(unread)next.read.push(unit);const extra=evaluateExtras(this.program,next,this.extrasIdentity);if(extra?.changed)next.extras=extra.progress;parseProfile(next);this.profile=next;if(unread)this.changes.push({seq:++this.progressSeq,type:'read',unit});if(extra?.changed)this.changes.push({seq:++this.progressSeq,type:'extras',value:parseExtrasProgress(extra.progress)});}
  view():CoreView {ensure(!this.reducing,'CORE_REENTRANT','Use the reducer context');if(this.viewCache)return this.viewCache;if(!this.profileView||this.profileView.source!==this.profile||this.profileView.sequence!==this.progressSeq||this.profileView.revision!==this.profile.revision)this.profileView={source:this.profile,sequence:this.progressSeq,revision:this.profile.revision,value:freezeJson(parseProfile(this.profile))};return this.viewCache=Object.freeze({run:this.projection.read(this.s),profile:this.profileView.value,dirty:this.changes.length,error:this.error,canSave:this.canSave(),saveReason:this.saveReason()});}
  pending():ProgressChange[] {return this.changes.map(c=>c.type==='set'?{...c,value:parseValue(c.value)}:c.type==='flow'?{...c,value:parseFlowProgress(c.value)}:c.type==='extras'?{...c,value:parseExtrasProgress(c.value)}:{...c});}
  acknowledge(through:number,revision:number):void { ensure(!this.reducing,'CORE_REENTRANT','No receipt mutation inside a reducer');this.viewCache=null;ensure(revision>=this.profile.revision,'PROFILE_REVISION','Revision moved backwards');this.changes=this.changes.filter(c=>c.seq>through);this.profile.revision=revision;this.s.profileBasis=revision; }
  private operationSaveAllowed():boolean {const w=this.s.wait;if(w?.kind!=='operation')return true;const saved=this.s.invocations?.find(v=>v.id===w.invocation);if(!saved)return false;const op=this.operations.get(saved.operation,saved.version);return op.manifest.save==='safe'&&op.manifest.restore==='continue';}
  canSave():boolean {return this.operationSaveAllowed()&&!videoSaveReason(this.s)&&!mediaSaveReason(this.s)&&!this.revoked&&this.s.saveAllowed&&this.s.status!=='running'&&this.s.status!=='failed'&&this.s.wait?.kind!=='flush';}
  private saveReason():string|null {return !this.operationSaveAllowed()?'OPERATION_UNRESTORABLE':videoSaveReason(this.s)??mediaSaveReason(this.s)??(this.revoked?'SESSION_REVOKED':!this.s.saveAllowed?'SAVE_POLICY':this.s.status==='running'?'BUDGET_CONTINUATION':this.s.status==='failed'?'CORE_FAILED':this.s.wait?.kind==='flush'?'PROFILE_BARRIER':null);}
  capture():Snapshot {ensure(!this.reducing,'CORE_REENTRANT','No capture inside a reducer');ensure(this.canSave(),'SAVE_UNAVAILABLE',this.saveReason()??'unknown');return parseSnapshot(this.s);}
  drainEffects():Effect[] {ensure(!this.reducing,'CORE_REENTRANT','No effect drain inside a reducer');const effects=this.effects;this.effects=[];return effects;}
  revoke():void {ensure(!this.reducing,'CORE_REENTRANT','No authority mutation inside a reducer');this.viewCache=null;this.revoked=true;this.effects=[];}
  private resumeEffects(mode:'restore'|'initial'):void {
    for(const invocation of this.s.invocations??[])if(invocation.wait)invocation.wait.attempt++;
    for(const t of this.s.tasks)if(t.kind==='audio'&&['running','blocked'].includes(t.status)) {
      t.attempt++;
      if(mode==='restore'&&t.restore==='stop')t.status='cancelled';
      else {t.status='running';this.effects.push({type:'audio',task:parseTask(t)});}
    }
    // Acknowledged replay intentions are recreated even for one-shot channels.
    for(const t of this.s.tasks)if(t.kind==='audio'&&t.status==='completed'&&t.restore==='replay') {
      t.attempt++;this.effects.push({type:'audio',task:parseTask(t)});
    }
    for(const t of this.s.tasks)if(t.kind==='media'&&['running','blocked'].includes(t.status)){ensure(t.mediaTask,'MEDIA_TASK','Missing media state');t.attempt++;if(t.restore==='stop'){t.status='cancelled';t.mediaTask.phase='cancelled';}else {t.status='running';t.mediaTask.phase='pending';this.effects.push({type:'audio',task:parseTask(t)});}}updateDuck(this.s);
    for(const t of this.s.tasks)if(t.kind==='video'&&['running','blocked'].includes(t.status)){ensure(t.videoTask,'VIDEO_TASK','Missing video state');t.attempt++;t.status='running';t.videoTask.phase='pending';this.effects.push({type:'video',task:parseTask(t)});}
    if(this.s.wait?.kind==='ui'){ensure(this.s.wait.attempt<2147483647,'RESTORE_UI_ATTEMPT','UI attempts exhausted');this.s.wait.attempt++;this.s.wait.phase='prepared';}
    if(this.s.wait?.kind==='interaction'){this.s.wait.attempt++;this.s.wait.phase='prepared';this.s.wait.activeAt=null;}
  }
  private interactionBranch(branch:import('../protocol/interaction.js').InteractionBranch):void {this.put(branch.dest,{kind:'string',value:branch.id});this.top().pc=branch.target;this.s.wait=null;this.s.status='running';}
  accept(event:CoreEvent):void {
    ensure(!this.reducing,'CORE_REENTRANT','Reentrant dispatch is forbidden');this.viewCache=null;
    if(this.revoked||this.s.status==='failed')return;
    if(event.type==='history.session'){const next=parseSnapshot({...this.s,historySession:event.id});ensure(next.historySession,'HISTORY_SESSION','Missing validated session scope');if(next.wait?.kind==='text'&&next.text)next.text.historyId=`${next.historySession}:${next.text.prompt}`;this.s=next;return;}
    if(event.type==='media.ended'){if(!videoEnded(this.s,event.task,event.attempt))mediaEnded(this.s,event.task,event.attempt);this.resolveWait();return;}
    if(event.type==='ui.activate'||event.type==='ui.click'||event.type==='ui.toggle'||event.type==='ui.range'||event.type==='ui.input'){
      if('inputId'in event&&this.consumed.has(event.inputId))return;const result=acceptUI(this.s,event);if(result.submission){for(const write of result.submission.writes){const value=Object.hasOwn(this.top().locals,write.dest)?this.top().locals[write.dest]:this.s.globals[write.dest];ensure(value?.kind===write.value.kind,'UI_SLOT_KIND','Invalid submit destination');}for(const write of result.submission.writes)this.put(write.dest,write.value);this.top().pc=result.submission.target;this.s.wait=null;this.s.status='running';}if(result.accepted&&'inputId'in event)this.consumed.add(event.inputId);return;
    }
    if(event.type==='interaction.activate'){const input=parseInteractionEvent(event);if(input.type==='interaction.activate')activateInteraction(this.s,input);return;}
    if(event.type==='interaction.choose'||event.type==='interaction.point'){const input=parseInteractionEvent(event);if(input.type==='interaction.activate'||this.consumed.has(event.inputId))return;const branch=pickInteraction(this.s,input);if(branch){this.consumed.add(event.inputId);this.interactionBranch(branch);}return;}
    if(event.type==='video.skip'){const w=this.s.wait;if(w?.kind!=='video'||w.prompt!==event.prompt||this.consumed.has(event.inputId))return;const t=this.s.tasks.find(t=>t.id===w.task);if(!t?.videoTask?.skippable||!['running','blocked'].includes(t.status))return;this.consumed.add(event.inputId);t.status='cancelled';t.videoTask.phase='skipped';this.effects.push({type:'video-stop'});this.resolveWait();return;}
    if(event.type==='voice.replay'){if(this.consumed.has(event.inputId)||this.s.wait?.kind!=='text'||event.prompt!==this.s.wait.prompt||!this.s.text?.voice)return;this.consumed.add(event.inputId);this.effects.push(...replayVoice(this.program,this.s));return;}
    if(event.type==='text.preferences'){const value=parseTextPreferences(event.value);this.textInterval=value.intervalMs;this.textRemainder=0;if(this.s.wait?.kind==='text'&&this.s.text?.rich){if(this.s.text.rich.baseIntervalMs!==value.intervalMs)this.s.text.rich.remainderMs=0;this.s.text.rich.baseIntervalMs=value.intervalMs;}return;}
    if(event.type==='operation'){this.resumeOperation(parseOperationResume(event));return;}
    if(event.type==='reveal'||event.type==='advance'||event.type==='step'||event.type==='choose') {
      if(this.consumed.has(event.inputId)||!this.s.wait||!('prompt'in this.s.wait)||event.prompt!==this.s.wait.prompt)return;
      this.consumed.add(event.inputId);
      if(event.type==='choose') {
        if(this.s.wait.kind!=='choice')return;const choice=this.s.wait.options.find(o=>o.id===event.option);if(!choice)return;
        this.put(this.s.wait.dest,{kind:'string',value:choice.id});this.top().pc=choice.target;this.s.wait=null;this.s.status='running';
      } else if(this.s.wait.kind==='text'&&this.s.text) {
        if(event.type==='reveal'||(event.type==='step'&&!isTextComplete(this.s.text))){if(this.s.text.rich)revealRichText(this.s.text,this.textPlan());else this.s.text.revealed=length(this.s.text.content);return;}
        if(!isTextComplete(this.s.text))return;
        try{this.read();}catch(error){this.consumed.delete(event.inputId);throw error;}
        if(this.s.audioState?.stopVoiceOnAdvance&&this.s.text.voice){stopAudioTasks(this.s,'voice');this.effects.push({type:'audio-stop',channel:'voice'});}const confirmed=parseTextState(this.s.text);if(Object.isFrozen(this.s.history))this.s.history=[...this.s.history,confirmed];else this.s.history.push(confirmed);confirmWindowText(this.s);this.top().pc=this.next();this.s.wait=null;this.s.status='running';
      }
      return;
    }
    if(event.type==='tick') {
      ensure(Number.isInteger(event.ms)&&event.ms>=0&&event.ms<=3600000,'TIME','Invalid active time delta');
      this.s.logicalTime+=event.ms;
      if(this.s.wait?.kind==='text'&&this.s.text){if(this.s.text.rich)tickRichText(this.s.text,event.ms,this.textPlan());else if(this.textInterval===0)this.s.text.revealed=length(this.s.text.content);else{this.textRemainder+=event.ms;const chars=Math.floor(this.textRemainder/this.textInterval);this.textRemainder%=this.textInterval;this.s.text.revealed=Math.min(length(this.s.text.content),this.s.text.revealed+chars);}}
      tickAudio(this.s,event.ms);const timeout=tickInteraction(this.s,event.ms);if(timeout)this.interactionBranch(timeout);
      for(const t of this.s.tasks)if(t.status==='running'&&(t.kind==='animation'||t.kind==='delay'||t.kind==='stage')) {
        t.elapsed=Math.min(t.duration,t.elapsed+event.ms);
        if(t.kind==='animation') {
          const o=this.s.stage.find(o=>o.id===t.target);ensure(o&&t.from&&t.to,'TASK_TARGET',t.id);
          const ratio=t.elapsed/t.duration;
          o.position={x:t.from.x+(t.to.x-t.from.x)*ratio,y:t.from.y+(t.to.y-t.from.y)*ratio,alpha:t.from.alpha+(t.to.alpha-t.from.alpha)*ratio};
        }
        if(t.kind==='stage')applyStageTask(this.s,t);
        if(t.elapsed===t.duration)t.status='completed';
      }
    } else if(event.type==='task') {
      if(videoReport(this.s,event.task,event.attempt,event.result)||mediaReport(this.s,event.task,event.attempt,event.result)){this.resolveWait();return;}
      const t=this.s.tasks.find(t=>t.id===event.task);if(!t||t.kind!=='audio'||t.attempt!==event.attempt||t.status!=='running')return;
      t.status=event.result;
    } else if(event.type==='retry') {
      const t=this.s.tasks.find(t=>t.id===event.task);if(!t||t.status!=='blocked'||t.kind!=='audio'&&t.kind!=='media'&&t.kind!=='video')return;
      if(t.kind==='video'&&t.videoTask){t.status='running';t.videoTask.phase='pending';t.attempt++;this.effects.push({type:'video',task:parseTask(t)});return;}t.status='running';if(t.mediaTask)t.mediaTask.phase='pending';t.attempt++;updateDuck(this.s);this.effects.push({type:'audio',task:parseTask(t)});
    } else if(event.type==='flushAck') {
      if(this.s.wait?.kind==='flush'){this.top().pc=this.next();this.s.wait=null;this.s.status='running';}
    }
    this.resolveWait();
  }
  private resolveWait():void {
    const w=this.s.wait;if(!w)return;
    if(w.kind==='group') {
      const g=this.s.groups.find(g=>g.id===w.group);ensure(g&&!g.consumed,'GROUP',w.group);
      const tasks=g.members.map(id=>{const t=this.s.tasks.find(t=>t.id===id);ensure(t,'TASK',id);return t;});
      if(tasks.some(t=>['superseded','cancelled','failed'].includes(t.status))){this.error='TASK_GROUP_TERMINAL';this.s.status='failed';return;}
      if(!tasks.every(t=>t.status==='completed'))return;g.consumed=true;
    } else if(w.kind==='video'){const t=this.s.tasks.find(t=>t.id===w.task);ensure(t?.videoTask,'VIDEO_WAIT','Missing video task');if(t.status==='failed'){this.s.status='failed';this.error='VIDEO_WAIT_FAILED';return;}if(t.videoTask.phase!=='ended'&&t.videoTask.phase!=='skipped')return;
    } else if(w.kind==='media'){const task=this.s.tasks.find(t=>t.id===w.task);ensure(task?.kind==='media','MEDIA_WAIT','Track missing');if(['failed','cancelled','superseded'].includes(task.status)){this.error='MEDIA_WAIT_TERMINAL';this.s.status='failed';return;}if(task.status!=='completed')return;
    } else if(w.kind==='delay') {if(this.s.tasks.find(t=>t.id===w.task)?.status!=='completed')return;}
    else return;
    this.top().pc=this.next();this.s.wait=null;this.s.status='running';
  }
  run(budget:number):'yield'|'stable' {
    ensure(!this.reducing,'CORE_REENTRANT','Reentrant execution is forbidden');if(this.s.status==='running')this.viewCache=null;
    ensure(Number.isInteger(budget)&&budget>0,'BUDGET','Positive integer required');
    if(this.revoked)return 'stable';
    for(let j=0;j<budget&&this.s.status==='running';j++) {
      const op=this.op();try {this.execute(op);}catch(e){this.error=e instanceof GalboxError?e.code:'CORE_ERROR';if(op.op!=='extension.invoke')this.s.status='failed';throw e;}
    }
    return this.s.status==='running'?'yield':'stable';
  }
  applyRecipe(input:unknown):void {
    ensure(this.mode==='candidate'&&!this.revoked&&!this.recovering&&!this.reducing,'RECIPE_CANDIDATE','Recovery can only mutate an isolated candidate');this.viewCache=null;
    const recipe=parseRestoreRecipe(input);ensure(recipe.steps.length<=recipe.maxSteps,'RECIPE_BUDGET','Step count exceeds the declared bound');
    ensure(this.s.status==='waiting'||this.s.status==='ended','RECIPE_PHASE','A semantic baseline is required');
    const before={s:this.s,profile:this.profile,changes:this.changes,effects:this.effects,seq:this.progressSeq};
    this.s=parseSnapshot(this.s);this.profile=parseProfile(this.profile);this.changes=this.pending();this.effects=[...this.effects];this.recovering=true;
    try {
      for(const raw of recipe.steps){
        const step=parseInstruction(raw);ensure(recoveryOpcodes.some(op=>op===step.op),'RECIPE_OPCODE',step.op);
        if(step.op==='stage.put')ensure(this.program.assets.find(a=>a.id===step.object.asset)?.kind==='image','ASSET_KIND',step.object.asset);
        if(step.op==='audio.play')ensure(this.program.assets.find(a=>a.id===step.asset)?.kind==='audio','ASSET_KIND',step.asset);
        const frame=this.top(),pc=frame.pc,wait=this.s.wait,status=this.s.status,existing=new Set((this.s.invocations??[]).map(v=>v.id));
        this.execute(step);frame.pc=pc;this.s.wait=wait;this.s.status=status;this.s.invocations=this.s.invocations?.filter(v=>existing.has(v.id))??[];
      }
      validateRestore(this.program,this.s,this.operations);this.error=null;
    }catch(error){this.s=before.s;this.profile=before.profile;this.changes=before.changes;this.effects=before.effects;this.progressSeq=before.seq;this.error=error instanceof GalboxError?error.code:'RECIPE_FAILURE';throw error;}
    finally {this.recovering=false;}
  }
  private resumeOperation(event:OperationResume):void {
    const w=this.s.wait;if(w?.kind!=='operation')return;
    const saved=this.s.invocations?.find(v=>v.id===w.invocation);ensure(saved&&saved.wait,'RESTORE_INVOCATION','Missing active invocation');
    if(event.invocation!==saved.id||event.request!==saved.wait.request||event.attempt!==saved.wait.attempt)return;
    ensure(event.schema.id===saved.resumeSchema.id&&event.schema.signature===saved.resumeSchema.signature,'OPERATION_RESUME_SCHEMA',saved.id);
    const instruction=this.op();ensure(instruction.op==='extension.invoke','OPERATION_PHASE',saved.id);this.invokeOperation(instruction,saved,event.data);
  }
  private invokeOperation(instruction:Extract<Instruction,{op:'extension.invoke'}>,previous?:SavedInvocation,event?:unknown):void {
    const before={s:this.s,profile:this.profile,changes:this.changes,effects:this.effects,seq:this.progressSeq};
    this.s=parseSnapshot(this.s);this.profile=parseProfile(this.profile);this.changes=this.pending();this.effects=[...this.effects];
    try {
      const op=this.operations.get(instruction.operation,instruction.version);
      ensure(!this.recovering||op.manifest.recipe,'RECIPE_OPERATION','Operation is not registered for recovery');
      op.validateArgs(previous?previous.args:instruction.args,instruction.argsSchema);
      const id=previous?.id??`invocation:${++this.s.counter}`;
      const context=operationContext(this.s.globals,this.profile);
      this.reducing=true;let output;try {output=previous?op.resume(previous,event,context):op.start(instruction.args,context);}finally{this.reducing=false;}
      ensure(!this.recovering||output.flow.kind==='continue','RECIPE_CONTROL','Recipe operations cannot wait or jump');
      for(const action of output.actions){if(action.type==='set')this.put(action.dest,action.value);else this.setProfile(action.key,action.value);}
      for(const effect of output.effects){
        ensure(this.program.assets.find(a=>a.id===effect.asset)?.kind==='audio','ASSET_KIND',effect.asset);
        const at=this.top().pc;this.execute({at,op:'audio.play',task:effect.task,asset:effect.asset,channel:effect.channel,gain:effect.gain,loop:effect.loop,restore:effect.restore});this.top().pc=at;
      }
      const wait=output.flow.kind==='wait'?{...output.flow.wait,attempt:(previous?.wait?.attempt??0)+1}:null;
      const saved=op.validateSaved(parseSavedInvocation({id,operation:op.id,version:op.version,implementation:op.manifest.implementation,at:instruction.at,frameDepth:this.s.frames.length,argsSchema:op.argsSchema,stateSchema:op.stateSchema,resumeSchema:op.resumeSchema,args:previous?previous.args:instruction.args,state:output.state,phase:wait?'waiting':'completed',wait}));
      const invocations=this.s.invocations??[];ensure(previous||invocations.length<256,'INVOCATION_LIMIT','Too many retained invocations');
      this.s.invocations=[...invocations.filter(v=>v.id!==id),saved];
      if(wait){this.s.wait={kind:'operation',at:instruction.at,invocation:id};this.s.status='waiting';}
      else {
        if(output.flow.kind==='jump'){const target=output.flow.target;ensure(this.fn(this.top().functionId).code.some(i=>i.at===target),'ADDRESS_SCOPE',target);this.top().pc=target;}
        else if(!this.recovering)this.top().pc=this.next();
        this.s.wait=null;this.s.status='running';
      }
      this.error=null;
    }catch(error){this.s=before.s;this.profile=before.profile;this.changes=before.changes;this.effects=before.effects;this.progressSeq=before.seq;this.error=error instanceof GalboxError?error.code:'OPERATION_FAILURE';throw error;}
  }
  private execute(i:Instruction):void {
    if(isUIInstruction(i)){ensure(!this.recovering,'RECIPE_OPCODE','UI input cannot be guessed');if(!executeUI(this.program,this.s,i,e=>this.expression(e)))this.top().pc=this.next();return;}
    if(i.op==='interaction.prompt'){ensure(!this.recovering,'RECIPE_OPCODE','Interaction cannot be guessed');const w=prepareInteraction(i,this.s.counter+1,e=>this.expression(e));this.s.counter=w.prompt;this.s.wait=w;this.s.status='waiting';return;}
    if(i.op==='video.play'){ensure(!this.recovering,'RECIPE_OPCODE','Video cannot be guessed');this.effects.push(startVideo(this.program,this.s,i));return;}
    if(isAudioInstruction(i)){ensure(!this.recovering,'RECIPE_OPCODE','Media tasks are not recovery guesses');this.effects.push(...executeAudio(this.program,this.s,i,e=>this.expression(e)));if(i.op==='audio.wait'){this.resolveWait();return;}this.top().pc=this.next();return;}
    if(isStageInstruction(i)){ensure(!this.recovering,'RECIPE_OPCODE','Stage tasks are not recovery guesses');try{executeStage(this.program,this.s,i,e=>this.expression(e));}catch(error){if(error instanceof GalboxError)throw new GalboxError(error.code,error.reason,{...error.location,address:i.at});throw error;}this.top().pc=this.next();return;}
    const wait=(w:NonNullable<Snapshot['wait']>)=>{this.s.wait=w;this.s.status='waiting';};
    const task=(name:string,kind:Task['kind'],duration:number):Task=>({id:`task:${++this.s.counter}`,name,kind,status:'running',elapsed:0,duration,attempt:1,at:i.at});
    switch(i.op) {
      case 'control.jump':this.top().pc=i.target;return;
      case 'control.branch': {
        const a=this.get(i.left),b=this.get(i.right);ensure(a.kind===b.kind,'COMPARE_KIND',i.at);
        const matches=i.cmp==='eq'?equalValues(a,b):orderValues(a,b)===-1;this.top().pc=matches?i.yes:i.no;return;
      }
      case 'control.call': {
        ensure(this.s.frames.length<64,'STACK_LIMIT',i.at);const args=i.args.map(a=>this.get(a));const frame=this.frame(this.fn(i.function),args);
        frame.returnTo={callAt:i.at,returnAt:this.next(),...(i.dest?{dest:i.dest}:{})};this.s.frames.push(frame);return;
      }
      case 'control.return': {
        if(this.s.frames.length===1&&(this.s.flow?.entryNode||this.s.replayScene)){ensure(!i.value,'FLOW_RETURN','Chapter root must return void');this.s.status='ended';this.s.wait=null;return;}
        const result=i.value?this.get(i.value):undefined;const frame=this.top();ensure(frame.returnTo&&this.s.frames.length>1,'RETURN_FRAME',i.at);
        this.s.frames.pop();this.s.invocations=this.s.invocations?.filter(v=>v.frameDepth<=this.s.frames.length)??[];if(frame.returnTo.dest){ensure(result,'RETURN_VALUE',i.at);this.put(frame.returnTo.dest,result);}this.top().pc=frame.returnTo.returnAt;return;
      }
      case 'extras.scene':case 'extras.unlock':this.checkExtras(i.entry);break;
      case 'extras.check':this.checkExtras();break;
      case 'flow.node':this.markFlow(i.node,true);break;
      case 'flow.unlock':this.markFlow(i.node,false);break;
      case 'control.end':this.s.status='ended';this.s.wait=null;return;
      case 'extension.invoke':this.invokeOperation(i);return;
      case 'value.set':this.put(i.dest,this.get(i.value));break;
      case 'i32.add.checked': {const a=this.get(i.left),b=this.get(i.right);ensure(a.kind==='i32'&&b.kind==='i32','I32_OPERAND',i.at);this.put(i.dest,i32(a.value+b.value));break;}
      case 'text.page': {const prompt=this.s.counter+1,text=parseTextState({textId:i.textId,revision:i.revision,speaker:i.speaker,content:i.content,revealed:this.textInterval===0?length(i.content):0,prompt});prepareWindowText(this.program,this.s,text,i.at);this.richPlan=null;this.s.counter=prompt;this.textRemainder=0;bindVoice(this.s,text);if(this.s.historySession)text.historyId=`${this.s.historySession}:${text.prompt}`;this.s.text=text;commitWindowText(this.program,this.s);wait({kind:'text',at:i.at,prompt});return;}
      case 'text.template': {this.richPlan=null;const speaker=this.expression(i.speaker),content=this.expression(i.content);ensure(speaker.kind==='string'&&content.kind==='string','EXPRESSION_KIND','Template requires strings');ensure(speaker.value.length>0&&content.value.length>0,'TEMPLATE_EMPTY','Text and speaker must not be empty');const signature=templateSignature(i.speaker,i.content),prompt=this.s.counter+1;i32(prompt);const text=parseTextState({textId:i.textId,revision:i.revision,speaker:speaker.value,content:content.value,revealed:this.textInterval===0?length(content.value):0,prompt,template:{at:i.at,signature}});prepareWindowText(this.program,this.s,text,i.at);this.s.counter=prompt;this.textRemainder=0;bindVoice(this.s,text);if(this.s.historySession)text.historyId=`${this.s.historySession}:${text.prompt}`;this.s.text=text;commitWindowText(this.program,this.s);wait({kind:'text',at:i.at,prompt});return;}
      case 'text.rich': {
        const speaker=this.expression(i.speaker);ensure(speaker.kind==='string'&&speaker.value.length>0,'TEMPLATE_EMPTY','Speaker must not be empty');
        const textValue=(expression:import('../protocol/index.js').StringExpression)=>{const value=this.expression(expression);ensure(value.kind==='string'&&value.value.length>0,'TEMPLATE_EMPTY','Rich content/reading must not be empty');return value.value;};
        const runs=i.runs.map(run=>run.kind==='text'?{...run,content:textValue(run.content)}:run.kind==='ruby'?{...run,content:textValue(run.content),reading:textValue(run.reading)}:{...run});
        const plan=compileRichText(runs),signature=richTextSignature(i),prompt=this.s.counter+1;i32(prompt);
        const text=parseTextState({textId:i.textId,revision:i.revision,speaker:speaker.value,content:plan.content,revealed:0,prompt,rich:{version:1,segmentation:textSegmentation,at:i.at,signature,runs,cursor:0,elapsedMs:0,remainderMs:0,pauseRemainingMs:0,baseIntervalMs:this.textInterval,revealedAt:[]}});
        tickRichText(text,0,plan);validateRichText(text,i);prepareWindowText(this.program,this.s,text,i.at);this.richPlan=plan;bindVoice(this.s,text);if(this.s.historySession)text.historyId=`${this.s.historySession}:${text.prompt}`;this.s.text=text;commitWindowText(this.program,this.s);this.s.counter=prompt;this.textRemainder=0;wait({kind:'text',at:i.at,prompt});return;
      }
      case 'random.i32': {ensure(this.s.rng,'RNG_STATE_REQUIRED','No RNG state');const min=this.expression(i.min),max=this.expression(i.max);ensure(min.kind==='i32'&&max.kind==='i32','EXPRESSION_KIND','Random bounds require i32');const result=sampleI32(this.s.rng,min.value,max.value);this.put(i.dest,result.value);this.s.rng=result.rng;break;}
      case 'rng.seed': ensure(this.s.rng,'RNG_STATE_REQUIRED','No RNG state');this.s.rng={algorithm:'lcg32@1',state:i.seed,draws:0};break;
      case 'text.clear':if(this.s.textLayout)clearTextWindow(this.s,this.s.textLayout.active);else this.s.text=null;break;
      case 'text.window.select': {const w=this.s.textLayout?.windows.find(w=>w.id===i.window);ensure(w&&this.s.textLayout,'TEXT_WINDOW',i.window);this.s.textLayout.active=w.id;w.visible=true;break;}
      case 'text.window.clear':clearTextWindow(this.s,i.window);break;
      case 'text.window.visible': {const w=this.s.textLayout?.windows.find(w=>w.id===i.window);ensure(w,'TEXT_WINDOW',i.window);w.visible=i.visible;break;}
      case 'text.window.theme': {const w=this.s.textLayout?.windows.find(w=>w.id===i.window);ensure(w,'TEXT_WINDOW',i.window);w.theme=i.theme;break;}
      case 'choice':wait({kind:'choice',at:i.at,prompt:++this.s.counter,options:i.options.map(o=>({...o})),dest:i.dest});return;
      case 'stage.put': {
        ensure(!this.s.tasks.some(t=>taskObject(t)===i.object.id&&t.status==='running'),'STAGE_BUSY',i.object.id);
        const owned=parseInstruction(i);ensure(owned.op==='stage.put','STAGE_OBJECT','Object copy failed');const stage=[...this.s.stage.filter(o=>o.id!==i.object.id),owned.object];validateStageGraph(stage);this.s.stage=stage;break;
      }
      case 'stage.remove':removeStageObject(this.s,i.id);break;
      case 'stage.animate': {
        const target=this.s.stage.find(o=>o.id===i.id);ensure(target,'STAGE_OBJECT',i.id);
        const locks=new Set(['x','y','alpha'].map(k=>`object:${i.id}:pose:${k}`)),previous=this.s.tasks.filter(t=>t.status==='running'&&taskLocks(t).some(k=>locks.has(k)));
        ensure(i.policy==='replace'||previous.length===0,'TASK_CONFLICT',i.at);previous.forEach(t=>{t.status='superseded';});
        this.s.tasks.push({...task(i.task,'animation',i.duration),target:i.id,from:positions(target.position),to:positions(i.to)});break;
      }
      case 'task.join': {
        const members=i.members.map(name=>{const t=[...this.s.tasks].reverse().find(t=>t.name===name);ensure(t,'TASK',name);ensure(t.kind!=='media'||!t.loop,'MEDIA_LOOP_WAIT','A looping track cannot be joined');return t.id;});
        ensure(new Set(members).size===members.length,'GROUP_DUPLICATE',i.at);
        const group={id:`group:${++this.s.counter}`,members,consumed:false};this.s.groups.push(group);wait({kind:'group',at:i.at,group:group.id});this.resolveWait();return;
      }
      case 'wait.delay': {const t=task(i.task,'delay',i.duration);this.s.tasks.push(t);wait({kind:'delay',at:i.at,task:t.id});return;}
      case 'audio.play': {
        this.s.tasks.filter(t=>(t.kind==='audio'||t.kind==='media')&&t.channel===i.channel&&['running','blocked','completed'].includes(t.status)).forEach(t=>{if(t.kind==='media'&&t.status==='completed')return;t.status='superseded';if(t.mediaTask)t.mediaTask.phase='superseded';});updateDuck(this.s);
        const t:Task={...task(i.task,'audio',0),asset:i.asset,channel:i.channel,gain:i.gain,loop:i.loop,restore:i.restore};this.s.tasks.push(t);this.effects.push({type:'audio',task:parseTask(t)});break;
      }
      case 'audio.stop':stopAudioTasks(this.s,i.channel);this.effects.push({type:'audio-stop',channel:i.channel});break;
      case 'audio.gain':this.s.tasks.filter(t=>(t.kind==='audio'||t.kind==='media')&&t.channel===i.channel).forEach(t=>{t.gain=i.gain;});this.effects.push({type:'audio-gain',channel:i.channel,gain:i.gain});break;
      case 'profile.i32.add.checked': {const previous=this.profile.values[i.key];ensure(previous?.kind==='i32','PROFILE_KIND',i.key);this.setProfile(i.key,i32(previous.value+i.delta));break;}
      case 'profile.set':this.setProfile(i.key,i.value);break;
      case 'profile.expression':this.setProfile(i.key,this.expression(i.value));break;
      case 'profile.flush':wait({kind:'flush',at:i.at});return;
      case 'checkpoint':wait({kind:'flush',at:i.at});return;
      case 'save.policy':this.s.saveAllowed=i.allow;break;
      default: {const impossible:never=i;throw new GalboxError('UNSUPPORTED_OPCODE',String(impossible));}
    }
    if(!this.recovering)this.top().pc=this.next();
  }
}
function validateSnapshot(input:unknown,snapshot:unknown,operations:OperationRegistry=emptyOperations,initial=false):Snapshot {
  const p=linkProgram(input,operations).copy(),s=parseSnapshot(snapshot);
  const historyIds=s.history.flatMap(t=>t.historyId?[t.historyId]:[]);ensure(new Set(historyIds).size===historyIds.length&&!(s.wait?.kind==='text'&&s.text?.historyId&&historyIds.includes(s.text.historyId)),'RESTORE_HISTORY_ID','History identities must remain unique');
  ensure((s.extrasSignature??null)===extrasSignature(p),'RESTORE_EXTRAS_DEFINITION','Gallery/resources changed; explicit migration required');
  ensure(s.streamCatalog===streamCatalog(p),'RESTORE_STREAM_CATALOG','Streaming catalog/version changed; explicit migration required');s.invocations=s.invocations??[];
  for(let index=0;index<s.invocations.length;index++){
    const old=s.invocations[index];ensure(old,'RESTORE_INVOCATION','Missing invocation');
    const frame=s.frames[old.frameDepth-1];const code=p.functions.find(f=>f.id===frame?.functionId)?.code;const target=code?.find(i=>i.at===old.at);
    ensure(target?.op==='extension.invoke','RESTORE_INVOCATION',old.at);const saved=operations.restore(old,target);
    ensure(saved.id===old.id&&saved.at===old.at&&saved.frameDepth===old.frameDepth,'RESTORE_INVOCATION_ID',old.id);s.invocations[index]=saved;
    if(saved.phase==='waiting')ensure(operations.get(saved.operation,saved.version).manifest.restore==='continue','OPERATION_RESTORE_UNSUPPORTED',saved.id);
  }
  ensure(new Set(s.invocations.map(v=>v.id)).size===s.invocations.length,'RESTORE_INVOCATION_ID','Duplicate invocation');
  ensure(!!p.rng===!!s.rng&&(!s.rng||s.rng.algorithm===p.rng?.algorithm),'RESTORE_RNG','RNG state missing or unavailable; explicit migration required');
  ensure(s.release===p.release,'RELEASE_MISMATCH','Snapshot release unavailable; migration required');
  const richSources=p.functions.flatMap(f=>f.code).filter(i=>i.op==='text.rich');
  for(const text of [...(s.text?[s.text]:[]),...s.history,...(s.textLayout?.windows.flatMap(w=>w.entries)??[])]){if(text.rich){const source=richSources.find(i=>i.at===text.rich?.at);ensure(source,'RESTORE_RICH_SOURCE','Rich source unavailable; explicit migration required');validateRichText(text,source);}else ensure(!richSources.some(i=>i.textId===text.textId&&i.revision===text.revision),'RESTORE_RICH_SOURCE','Missing structured text continuation');}
  if(s.text?.template){const text=s.text,origin=text.template,source=p.functions.flatMap(f=>f.code).find(i=>i.at===origin?.at);ensure(source?.op==='text.template'&&text.textId===source.textId&&text.revision===source.revision&&text.revealed<=length(text.content)&&origin?.signature===templateSignature(source.speaker,source.content),'RESTORE_TEMPLATE','Displayed template changed; explicit migration required');}
  validateUIRestore(p,s);validateWindowState(p,s);
  ensure(s.status==='waiting'||s.status==='ended','RESTORE_PHASE','Only semantic waits and end are restorable');
  const flowRoot=validateFlowRun(p,s),root=validateSceneRoot(p,s)??flowRoot;ensure(s.frames.length>0&&s.frames[0]?.functionId===root&&!s.frames[0].returnTo,'RESTORE_FRAME','Invalid entry frame');
  const checkSlots=(actual:Record<string,Value>,expected:readonly {id:string;kind:string}[])=>{
    ensure(Object.keys(actual).length===expected.length,'RESTORE_SLOTS','Slot count');
    for(const def of expected)ensure(actual[def.id]?.kind===def.kind,'RESTORE_SLOT_KIND',def.id);
  };
  checkSlots(s.globals,p.globals);
  for(let index=0;index<s.frames.length;index++) {
    const frame=s.frames[index];ensure(frame,'RESTORE_FRAME','missing');const f=p.functions.find(f=>f.id===frame.functionId);
    ensure(f&&frame.layout===f.layout&&f.code.some(i=>i.at===frame.pc),'RESTORE_FRAME',frame.functionId);checkSlots(frame.locals,[...f.params,...f.locals]);
    if(index>0) {
      const caller=s.frames[index-1];ensure(caller&&frame.returnTo,'RESTORE_CALL','Missing caller');
      const code=p.functions.find(f=>f.id===caller.functionId)?.code;const at=code?.findIndex(i=>i.at===caller.pc)??-1;const call=code?.[at];
      ensure(call?.op==='control.call'&&call.function===frame.functionId&&frame.returnTo.callAt===caller.pc&&frame.returnTo.returnAt===code?.[at+1]?.at&&frame.returnTo.dest===call.dest,'RESTORE_CALL','Call ABI mismatch');
    }
  }
  const top=s.frames.at(-1);const op=p.functions.find(f=>f.id===top?.functionId)?.code.find(i=>i.at===top?.pc);ensure(op,'RESTORE_PC','missing');
  const w=s.wait;
  if(s.status==='ended')ensure((op.op==='control.end'||op.op==='control.return'&&s.frames.length===1&&!!(s.flow?.entryNode||s.replayScene)&&!op.value)&&!w,'RESTORE_PHASE','End mismatch');
  else {
    ensure(w&&w.at===op.at,'RESTORE_WAIT','PC/wait mismatch');
    ensure((w.kind==='text'&&(op.op==='text.page'||op.op==='text.template'||op.op==='text.rich'))||(w.kind==='choice'&&op.op==='choice')||(w.kind==='group'&&op.op==='task.join')||(w.kind==='delay'&&op.op==='wait.delay')||(w.kind==='operation'&&op.op==='extension.invoke')||(w.kind==='media'&&op.op==='audio.wait')||(w.kind==='ui'&&op.op==='ui.wait')||(w.kind==='interaction'&&op.op==='interaction.prompt')||(w.kind==='video'&&op.op==='video.play'),'RESTORE_PHASE','Unsupported phase');
    if(w.kind==='text'){ensure((op.op==='text.page'||op.op==='text.template'||op.op==='text.rich')&&s.text&&s.text.prompt===w.prompt&&s.text.textId===op.textId&&s.text.revision===op.revision&&(s.text.rich||s.text.revealed<=length(s.text.content)),'RESTORE_TEXT','Text identity mismatch');if(op.op!=='text.rich')ensure(!s.text.rich,'RESTORE_RICH_SOURCE','Unexpected structured text');if(op.op==='text.page')ensure(!s.text.template&&s.text.content===op.content&&s.text.speaker===op.speaker,'RESTORE_TEXT','Text content mismatch');else if(op.op==='text.template')ensure(s.text.template?.signature===templateSignature(op.speaker,op.content),'RESTORE_TEMPLATE','Template changed; explicit migration required');}
    if(w.kind==='choice')ensure(op.op==='choice'&&w.dest===op.dest&&JSON.stringify(w.options)===JSON.stringify(op.options),'RESTORE_CHOICE','Choice mismatch');
  }
  const waiting=s.invocations.filter(v=>v.phase==='waiting');
  if(w?.kind==='operation'){const active=waiting.find(v=>v.id===w.invocation);ensure(waiting.length===1&&active&&active.at===op.at&&active.frameDepth===s.frames.length&&active.wait,'RESTORE_INVOCATION_WAIT',w.invocation);}else ensure(waiting.length===0,'RESTORE_INVOCATION_WAIT','Unreferenced active invocation');
  validateStageSnapshot(p,s);validateAudioSnapshot(p,s);restoreInteraction(p,s);validateVideo(p,s,initial);
  ensure(new Set(s.tasks.map(t=>t.id)).size===s.tasks.length,'RESTORE_TASK','Duplicate task');
  for(const t of s.tasks) {
    ensure(t.elapsed<=t.duration&&t.attempt>0,'RESTORE_TASK',t.id);
    if(t.kind!=='audio'&&t.kind!=='media'&&t.kind!=='video')ensure(t.duration>0&&t.status!=='blocked'&&(t.status!=='running'||t.elapsed<t.duration)&&(t.status!=='completed'||t.elapsed===t.duration),'RESTORE_TASK_PHASE',t.id);
    if(t.kind==='animation') {
      const object=s.stage.find(o=>o.id===t.target);ensure(t.from&&t.to&&(t.status!=='running'||object),'RESTORE_TASK_TARGET',t.id);
      if(t.status==='running'&&object){const ratio=t.elapsed/t.duration;for(const key of ['x','y','alpha'] as const)ensure(Math.abs(object.position[key]-(t.from[key]+(t.to[key]-t.from[key])*ratio))<0.000001,'RESTORE_ANIMATION',t.id);}
    }
    if(t.kind==='audio')ensure(p.assets.find(a=>a.id===t.asset)?.kind==='audio'&&t.channel&&t.gain!==undefined&&t.loop!==undefined&&t.restore,'RESTORE_AUDIO',t.id);
  }
  for(const g of s.groups)ensure(new Set(g.members).size===g.members.length&&g.members.every(id=>s.tasks.some(t=>t.id===id)),'RESTORE_GROUP',g.id);
  if(w?.kind==='group'){
    const g=s.groups.find(g=>g.id===w.group);ensure(g&&!g.consumed&&op.op==='task.join','RESTORE_GROUP',w.group);
    const tasks=g.members.map(id=>s.tasks.find(t=>t.id===id));
    ensure(tasks.length===op.members.length&&tasks.every((t,j)=>t&&t.name===op.members[j]),'RESTORE_GROUP_MEMBERS',w.group);
    ensure(tasks.some(t=>t?.status!=='completed')&&!tasks.some(t=>t&&['failed','cancelled','superseded'].includes(t.status)),'RESTORE_GROUP_PHASE',w.group);
  }
  if(w?.kind==='delay')ensure(op.op==='wait.delay'&&s.tasks.some(t=>t.id===w.task&&t.kind==='delay'&&t.name===op.task&&t.duration===op.duration&&t.status==='running'),'RESTORE_DELAY',w.task);
  ensure(new Set(s.stage.map(o=>o.id)).size===s.stage.length&&new Set(s.groups.map(g=>g.id)).size===s.groups.length,'RESTORE_IDENTITY','Duplicate stage/group identity');
  for(const o of s.stage)ensure(p.assets.find(a=>a.id===o.asset)?.kind==='image','RESTORE_ASSET',o.asset);
  return s;
}
export function createCore(program:unknown,profile?:unknown,snapshot?:unknown,options:CoreOptions={}):Core {return new Core(program,profile,snapshot,options.mode??'restore',options.operations??emptyOperations,options.rngSeed,options.entryNode,options.entryScene);}

export function validateRestore(input:unknown,snapshot:unknown,operations:OperationRegistry=emptyOperations):Snapshot {return validateSnapshot(input,snapshot,operations);}
