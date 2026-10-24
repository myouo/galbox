import { ensure, parseSnapshot, parseProfile, parseValue, emptyProfile, i32, readUnit, GalboxError } from '../protocol/index.js';
import type { Program, Snapshot, Profile, Frame, Value, Operand, Task, Instruction, DeepReadonly, Position, Function as ProgramFunction } from '../protocol/index.js';
import { linkProgram } from '../program-tools/index.js';
export type CoreEvent =
 | {type:'reveal' | 'advance' | 'step'; prompt:number; inputId:string}
 | {type:'choose'; prompt:number; inputId:string; option:string}
 | {type:'tick'; ms:number}
 | {type:'task'; task:string; attempt:number; result:'completed'|'blocked'|'failed'}
 | {type:'retry'; task:string}
 | {type:'flushAck'; revision:number};
export type Effect = {type:'audio'; task:Task} | {type:'audio-stop'; channel:'bgm'|'voice'|'sfx'} | {type:'audio-gain'; channel:'bgm'|'voice'|'sfx'; gain:number};
export type ProgressChange = {seq:number; type:'read'; unit:string} | {seq:number; type:'set'; key:string; value:Value};
export interface CoreView { readonly run: DeepReadonly<Snapshot>; readonly profile: DeepReadonly<Profile>; readonly dirty:number; readonly error:string|null; readonly canSave:boolean; readonly saveReason:string|null; }
function positions(p: Position): Position { return {...p}; }
function values(slots: readonly {id:string;initial:Value}[]): Record<string,Value> { return Object.fromEntries(slots.map(s=>[s.id,parseValue(s.initial)])); }
function length(text:string):number { return Array.from(text).length; }
export class Core {
  private readonly program:Program;
  private s:Snapshot;
  private profile:Profile;
  private changes:ProgressChange[]=[];
  private progressSeq=0;
  private effects:Effect[]=[];
  private consumed=new Set<string>();
  private textRemainder=0;
  private error:string|null=null;
  private revoked=false;
  constructor(input:unknown, profile:unknown=emptyProfile(), snapshot?:unknown, mode:'restore'|'initial'='restore') {
    ensure(mode==='restore'||mode==='initial','ACTIVATION_MODE','Unknown activation mode');
    this.program=linkProgram(input).copy(); this.profile=parseProfile(profile);
    if(snapshot!==undefined) { this.s=validateRestore(this.program,snapshot); this.s.profileBasis=this.profile.revision; this.resumeEffects(mode); }
    else {
      const entry=this.fn(this.program.entry);
      this.s={version:1,release:this.program.release,frames:[this.frame(entry,[])],globals:values(this.program.globals),stage:[],text:null,history:[],tasks:[],groups:[],wait:null,saveAllowed:true,status:'running',counter:0,profileBasis:this.profile.revision,logicalTime:0};
    }
  }
  private fn(id:string):ProgramFunction { const f=this.program.functions.find(f=>f.id===id); ensure(f,'FUNCTION',id); return f; }
  private frame(f:ProgramFunction,args:Value[]):Frame {
    const locals=values([...f.params,...f.locals]);f.params.forEach((p,j)=>{const v=args[j];ensure(v,'CALL_ARITY',f.id);locals[p.id]=parseValue(v);});
    return {functionId:f.id,layout:1,pc:f.entry,locals};
  }
  private top():Frame { const f=this.s.frames.at(-1);ensure(f,'STACK','Empty stack');return f; }
  private op():Instruction { const f=this.top(); const op=this.fn(f.functionId).code.find(i=>i.at===f.pc);ensure(op,'PC',f.pc);return op; }
  private next():string {const f=this.top();const code=this.fn(f.functionId).code; const op=code[code.findIndex(i=>i.at===f.pc)+1];ensure(op,'FALLTHROUGH',f.pc);return op.at;}
  private get(o:Operand):Value { if('literal'in o)return parseValue(o.literal); const v=this.top().locals[o.slot]??this.s.globals[o.slot];ensure(v,'SLOT',o.slot);return parseValue(v); }
  private put(id:string,v:Value):void {
    const map=Object.hasOwn(this.top().locals,id)?this.top().locals:this.s.globals;
    ensure(map[id]?.kind===v.kind,'SLOT_KIND',id);map[id]=parseValue(v);
  }
  private setProfile(key:string,value:Value):void {this.profile.values[key]=parseValue(value);this.changes.push({seq:++this.progressSeq,type:'set',key,value:parseValue(value)});}
  private read():void { const text=this.s.text;ensure(text,'TEXT','No page');const unit=readUnit(text);if(!this.profile.read.includes(unit)){this.profile.read.push(unit);this.changes.push({seq:++this.progressSeq,type:'read',unit});} }
  view():CoreView {return {run:parseSnapshot(this.s),profile:parseProfile(this.profile),dirty:this.changes.length,error:this.error,canSave:this.canSave(),saveReason:this.saveReason()};}
  pending():ProgressChange[] {return this.changes.map(c=>c.type==='set'?{...c,value:parseValue(c.value)}:{...c});}
  acknowledge(through:number,revision:number):void { ensure(revision>=this.profile.revision,'PROFILE_REVISION','Revision moved backwards');this.changes=this.changes.filter(c=>c.seq>through);this.profile.revision=revision;this.s.profileBasis=revision; }
  canSave():boolean {return !this.revoked&&this.s.saveAllowed&&this.s.status!=='running'&&this.s.status!=='failed'&&this.s.wait?.kind!=='flush';}
  private saveReason():string|null {return this.revoked?'SESSION_REVOKED':!this.s.saveAllowed?'SAVE_POLICY':this.s.status==='running'?'BUDGET_CONTINUATION':this.s.status==='failed'?'CORE_FAILED':this.s.wait?.kind==='flush'?'PROFILE_BARRIER':null;}
  capture():Snapshot {ensure(this.canSave(),'SAVE_UNAVAILABLE',this.saveReason()??'unknown');return parseSnapshot(this.s);}
  drainEffects():Effect[] {const effects=this.effects;this.effects=[];return effects;}
  revoke():void {this.revoked=true;this.effects=[];}
  private resumeEffects(mode:'restore'|'initial'):void {
    for(const t of this.s.tasks)if(t.kind==='audio'&&['running','blocked'].includes(t.status)) {
      t.attempt++;
      if(mode==='restore'&&t.restore==='stop')t.status='cancelled';
      else {t.status='running';this.effects.push({type:'audio',task:{...t}});}
    }
    // Acknowledged replay intentions are recreated even for one-shot channels.
    for(const t of this.s.tasks)if(mode==='restore'&&t.kind==='audio'&&t.status==='completed'&&t.restore==='replay') {
      t.attempt++;this.effects.push({type:'audio',task:{...t}});
    }
  }
  accept(event:CoreEvent):void {
    if(this.revoked||this.s.status==='failed')return;
    if(event.type==='reveal'||event.type==='advance'||event.type==='step'||event.type==='choose') {
      if(this.consumed.has(event.inputId)||!this.s.wait||!('prompt'in this.s.wait)||event.prompt!==this.s.wait.prompt)return;
      this.consumed.add(event.inputId);
      if(event.type==='choose') {
        if(this.s.wait.kind!=='choice')return;const choice=this.s.wait.options.find(o=>o.id===event.option);if(!choice)return;
        this.put(this.s.wait.dest,{kind:'string',value:choice.id});this.top().pc=choice.target;this.s.wait=null;this.s.status='running';
      } else if(this.s.wait.kind==='text'&&this.s.text) {
        if(event.type==='reveal'||(event.type==='step'&&this.s.text.revealed<length(this.s.text.content))){this.s.text.revealed=length(this.s.text.content);return;}
        if(this.s.text.revealed<length(this.s.text.content))return;
        this.read();this.s.history.push({...this.s.text});this.top().pc=this.next();this.s.wait=null;this.s.status='running';
      }
      return;
    }
    if(event.type==='tick') {
      ensure(Number.isInteger(event.ms)&&event.ms>=0&&event.ms<=3600000,'TIME','Invalid active time delta');
      this.s.logicalTime+=event.ms;
      if(this.s.wait?.kind==='text'&&this.s.text){this.textRemainder+=event.ms;const chars=Math.floor(this.textRemainder/32);this.textRemainder%=32;this.s.text.revealed=Math.min(length(this.s.text.content),this.s.text.revealed+chars);}
      for(const t of this.s.tasks)if(t.status==='running'&&(t.kind==='animation'||t.kind==='delay')) {
        t.elapsed=Math.min(t.duration,t.elapsed+event.ms);
        if(t.kind==='animation') {
          const o=this.s.stage.find(o=>o.id===t.target);ensure(o&&t.from&&t.to,'TASK_TARGET',t.id);
          const ratio=t.elapsed/t.duration;
          o.position={x:t.from.x+(t.to.x-t.from.x)*ratio,y:t.from.y+(t.to.y-t.from.y)*ratio,alpha:t.from.alpha+(t.to.alpha-t.from.alpha)*ratio};
        }
        if(t.elapsed===t.duration)t.status='completed';
      }
    } else if(event.type==='task') {
      const t=this.s.tasks.find(t=>t.id===event.task);if(!t||t.kind!=='audio'||t.attempt!==event.attempt||t.status!=='running')return;
      t.status=event.result;
    } else if(event.type==='retry') {
      const t=this.s.tasks.find(t=>t.id===event.task);if(!t||t.status!=='blocked'||t.kind!=='audio')return;
      t.status='running';t.attempt++;this.effects.push({type:'audio',task:{...t}});
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
    } else if(w.kind==='delay') {if(this.s.tasks.find(t=>t.id===w.task)?.status!=='completed')return;}
    else return;
    this.top().pc=this.next();this.s.wait=null;this.s.status='running';
  }
  run(budget:number):'yield'|'stable' {
    ensure(Number.isInteger(budget)&&budget>0,'BUDGET','Positive integer required');
    if(this.revoked)return 'stable';
    for(let j=0;j<budget&&this.s.status==='running';j++) {
      try {this.execute(this.op());}catch(e){this.error=e instanceof GalboxError?e.code:'CORE_ERROR';this.s.status='failed';throw e;}
    }
    return this.s.status==='running'?'yield':'stable';
  }
  private execute(i:Instruction):void {
    const wait=(w:NonNullable<Snapshot['wait']>)=>{this.s.wait=w;this.s.status='waiting';};
    const task=(name:string,kind:Task['kind'],duration:number):Task=>({id:`task:${++this.s.counter}`,name,kind,status:'running',elapsed:0,duration,attempt:1});
    switch(i.op) {
      case 'control.jump':this.top().pc=i.target;return;
      case 'control.branch': {
        const a=this.get(i.left),b=this.get(i.right);ensure(a.kind===b.kind,'COMPARE_KIND',i.at);
        const matches=i.cmp==='eq'?a.value===b.value:a.value<b.value;this.top().pc=matches?i.yes:i.no;return;
      }
      case 'control.call': {
        ensure(this.s.frames.length<64,'STACK_LIMIT',i.at);const args=i.args.map(a=>this.get(a));const frame=this.frame(this.fn(i.function),args);
        frame.returnTo={callAt:i.at,returnAt:this.next(),...(i.dest?{dest:i.dest}:{})};this.s.frames.push(frame);return;
      }
      case 'control.return': {
        const result=i.value?this.get(i.value):undefined;const frame=this.top();ensure(frame.returnTo&&this.s.frames.length>1,'RETURN_FRAME',i.at);
        this.s.frames.pop();if(frame.returnTo.dest){ensure(result,'RETURN_VALUE',i.at);this.put(frame.returnTo.dest,result);}this.top().pc=frame.returnTo.returnAt;return;
      }
      case 'control.end':this.s.status='ended';this.s.wait=null;return;
      case 'value.set':this.put(i.dest,this.get(i.value));break;
      case 'i32.add.checked': {const a=this.get(i.left),b=this.get(i.right);ensure(a.kind==='i32'&&b.kind==='i32','I32_OPERAND',i.at);this.put(i.dest,i32(a.value+b.value));break;}
      case 'text.page': {const prompt=++this.s.counter;this.textRemainder=0;this.s.text={textId:i.textId,revision:i.revision,speaker:i.speaker,content:i.content,revealed:0,prompt};wait({kind:'text',at:i.at,prompt});return;}
      case 'text.clear':this.s.text=null;break;
      case 'choice':wait({kind:'choice',at:i.at,prompt:++this.s.counter,options:i.options.map(o=>({...o})),dest:i.dest});return;
      case 'stage.put': {
        ensure(!this.s.tasks.some(t=>t.kind==='animation'&&t.target===i.object.id&&t.status==='running'),'STAGE_BUSY',i.object.id);
        this.s.stage=this.s.stage.filter(o=>o.id!==i.object.id);this.s.stage.push({...i.object,position:positions(i.object.position)});break;
      }
      case 'stage.remove':this.s.tasks.filter(t=>t.kind==='animation'&&t.target===i.id&&t.status==='running').forEach(t=>{t.status='cancelled';});this.s.stage=this.s.stage.filter(o=>o.id!==i.id);break;
      case 'stage.animate': {
        const target=this.s.stage.find(o=>o.id===i.id);ensure(target,'STAGE_OBJECT',i.id);
        const previous=this.s.tasks.filter(t=>t.kind==='animation'&&t.target===i.id&&t.status==='running');
        ensure(i.policy==='replace'||previous.length===0,'TASK_CONFLICT',i.at);previous.forEach(t=>{t.status='superseded';});
        this.s.tasks.push({...task(i.task,'animation',i.duration),target:i.id,from:positions(target.position),to:positions(i.to)});break;
      }
      case 'task.join': {
        const members=i.members.map(name=>{const t=[...this.s.tasks].reverse().find(t=>t.name===name);ensure(t,'TASK',name);return t.id;});
        ensure(new Set(members).size===members.length,'GROUP_DUPLICATE',i.at);
        const group={id:`group:${++this.s.counter}`,members,consumed:false};this.s.groups.push(group);wait({kind:'group',at:i.at,group:group.id});this.resolveWait();return;
      }
      case 'wait.delay': {const t=task(i.task,'delay',i.duration);this.s.tasks.push(t);wait({kind:'delay',at:i.at,task:t.id});return;}
      case 'audio.play': {
        this.s.tasks.filter(t=>t.kind==='audio'&&t.channel===i.channel&&['running','blocked','completed'].includes(t.status)).forEach(t=>{t.status='superseded';});
        const t:Task={...task(i.task,'audio',0),asset:i.asset,channel:i.channel,gain:i.gain,loop:i.loop,restore:i.restore};this.s.tasks.push(t);this.effects.push({type:'audio',task:{...t}});break;
      }
      case 'audio.stop':this.s.tasks.filter(t=>t.kind==='audio'&&t.channel===i.channel).forEach(t=>{t.status='cancelled';});this.effects.push({type:'audio-stop',channel:i.channel});break;
      case 'audio.gain':this.s.tasks.filter(t=>t.kind==='audio'&&t.channel===i.channel).forEach(t=>{t.gain=i.gain;});this.effects.push({type:'audio-gain',channel:i.channel,gain:i.gain});break;
      case 'profile.set':this.setProfile(i.key,i.value);break;
      case 'profile.flush':wait({kind:'flush',at:i.at});return;
      case 'checkpoint':wait({kind:'flush',at:i.at});return;
      case 'save.policy':this.s.saveAllowed=i.allow;break;
      default: {const impossible:never=i;throw new GalboxError('UNSUPPORTED_OPCODE',String(impossible));}
    }
    this.top().pc=this.next();
  }
}
export function validateRestore(input:unknown,snapshot:unknown):Snapshot {
  const p=linkProgram(input).copy(),s=parseSnapshot(snapshot);
  ensure(s.release===p.release,'RELEASE_MISMATCH','Snapshot release unavailable; migration required');
  ensure(s.status==='waiting'||s.status==='ended','RESTORE_PHASE','Only semantic waits and end are restorable');
  ensure(s.frames.length>0&&s.frames[0]?.functionId===p.entry&&!s.frames[0].returnTo,'RESTORE_FRAME','Invalid entry frame');
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
  if(s.status==='ended')ensure(op.op==='control.end'&&!w,'RESTORE_PHASE','End mismatch');
  else {
    ensure(w&&w.at===op.at,'RESTORE_WAIT','PC/wait mismatch');
    ensure((w.kind==='text'&&op.op==='text.page')||(w.kind==='choice'&&op.op==='choice')||(w.kind==='group'&&op.op==='task.join')||(w.kind==='delay'&&op.op==='wait.delay'),'RESTORE_PHASE','Unsupported phase');
    if(w.kind==='text')ensure(op.op==='text.page'&&s.text&&s.text.prompt===w.prompt&&s.text.textId===op.textId&&s.text.revision===op.revision&&s.text.content===op.content&&s.text.speaker===op.speaker&&s.text.revealed<=length(s.text.content),'RESTORE_TEXT','Text identity/content mismatch');
    if(w.kind==='choice')ensure(op.op==='choice'&&w.dest===op.dest&&JSON.stringify(w.options)===JSON.stringify(op.options),'RESTORE_CHOICE','Choice mismatch');
  }
  ensure(new Set(s.tasks.map(t=>t.id)).size===s.tasks.length,'RESTORE_TASK','Duplicate task');
  for(const t of s.tasks) {
    ensure(t.elapsed<=t.duration&&t.attempt>0,'RESTORE_TASK',t.id);
    if(t.kind!=='audio')ensure(t.duration>0&&t.status!=='blocked'&&(t.status!=='running'||t.elapsed<t.duration)&&(t.status!=='completed'||t.elapsed===t.duration),'RESTORE_TASK_PHASE',t.id);
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
export function createCore(program:unknown,profile?:unknown,snapshot?:unknown):Core {return new Core(program,profile,snapshot);}
