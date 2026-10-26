import {validateFlowchart} from '../protocol/flow.js';
import {streamCatalog} from '../protocol/streams.js';
import {interactionExpressions} from '../protocol/interaction.js';
import {isAudioInstruction,audioExpressions} from '../protocol/audio.js';
import { emptyOperations } from '../core/operations.js';
import type { OperationRegistry } from '../core/operations.js';
import { parseProgram, parseInstruction, parseValue, ensure, capabilities, GalboxError, parseSourceMap, parsePortObligation, parseBehaviorMapping, readUnit,parseRngConfig,parseTextLayout,parseFlowchart } from '../protocol/index.js';
import {validateTextLayout} from '../protocol/layout.js';
import {richTextSignature,compileRichText} from '../protocol/text.js';
import {isStageInstruction,stageExpressions} from '../protocol/stage.js';
import {extendedValue} from '../protocol/values.js';
import {validateExpressionTree,templateSignature,extendedExpression} from '../protocol/expressions.js';
import type { Program, Instruction, Value, ValueKind, Operand, Function as ProgramFunction, Slot, Asset, Position, DeepReadonly, SourceLocation, PortObligation, BehaviorMapping } from '../protocol/index.js';

export type AssetRef<K extends Asset['kind']> = { readonly id: string; readonly kind: K };
export type Variable<K extends ValueKind> = {readonly id: string; readonly kind: K};
export function variable<K extends ValueKind>(id: string, kind: K): Variable<K> { return {id,kind}; }
export function literal(value: DeepReadonly<Value>): Operand { return {literal:parseValue(value)}; }
export function slot(id: string): Operand { return {slot:id}; }
function operands(i:Instruction):Operand[]{switch(i.op){case 'control.branch':case 'i32.add.checked':return [i.left,i.right];case 'control.call':return i.args;case 'control.return':return i.value?[i.value]:[];case 'value.set':return [i.value];default:return [];}}
export function instruction<K extends Instruction['op']>(op: K, args: Omit<Extract<Instruction,{op: NoInfer<K>}>, 'op'>): Extract<Instruction,{op: K}> {
  const value = parseInstruction({...args,op});
  // A discriminant predicate retains the exact schema branch without exposing unchecked data.
  function isKind(i: Instruction): i is Extract<Instruction,{op: K}> { return i.op === op; }
  ensure(isKind(value),'OPCODE','Factory opcode mismatch'); return value;
}
export function set<K extends ValueKind>(at: string, dest: Variable<K>, value: Extract<DeepReadonly<Value>,{kind:NoInfer<K>}>): Extract<Instruction,{op:'value.set'}> {
  ensure(dest.kind === value.kind,'VALUE_KIND',dest.id); return instruction('value.set',{at,dest:dest.id,value:literal(value)});
}
export function imagePut(at: string, id: string, asset: AssetRef<'image'>, position: Position, z=0): Extract<Instruction,{op:'stage.put'}> {
  ensure(asset.kind === 'image','ASSET_KIND',asset.id); return instruction('stage.put',{at,object:{id,asset:asset.id,position,z}});
}
function programNeedsExtended(p:Program):boolean {
 if(p.flowchart?.nodes.some(n=>extendedExpression(n.unlock)||extendedExpression(n.gate)))return true;
 return p.globals.some(s=>extendedValue(s.initial))||p.functions.some(f=>![...['void','i32','bool','string']].includes(f.returns)||[...f.params,...f.locals].some(s=>extendedValue(s.initial))||f.code.some(i=>{
  if(isStageInstruction(i)||isAudioInstruction(i)||i.op==='interaction.prompt')return true;
  if(operands(i).some(o=>'literal'in o?extendedValue(o.literal):'expression'in o&&extendedExpression(o.expression)))return true;
  if(i.op==='profile.set')return extendedValue(i.value);if(i.op==='profile.expression')return extendedExpression(i.value);
  if(i.op==='text.template')return extendedExpression(i.speaker)||extendedExpression(i.content);
  if(i.op==='text.rich')return extendedExpression(i.speaker)||i.runs.some(r=>(r.kind==='text'||r.kind==='ruby')&&(extendedExpression(r.content)||r.kind==='ruby'&&extendedExpression(r.reading)));return false;
 }));
}
export class ProgramBuilder {
  private readonly data: Program;
  constructor(identity: {gameId:string; release:string; entry:string; title?:string}) {
    this.data={version:1,...identity,title:identity.title??identity.gameId,capabilities:['adv','stage.linear','audio.wav','tasks.all','profile'],assets:[],globals:[],functions:[]};
  }
  asset<K extends Asset['kind']>(kind: K, data: Omit<Asset,'kind'>): AssetRef<K> { this.data.assets.push({...data,kind}); return {id:data.id,kind}; }
  global(value: Slot): this { this.data.globals.push(value); return this; }
  function(value: ProgramFunction): this { this.data.functions.push(value); return this; }
  source(at:string,source:SourceLocation):this {const entries=parseSourceMap([{at,source}]);this.data.sourceMap=[...(this.data.sourceMap??[]),...entries];return this;}
  obligation(value:PortObligation):this {this.data.obligations=[...(this.data.obligations??[]),parsePortObligation(value)];return this;}
  mapping(value:BehaviorMapping):this {this.data.behaviorMappings=[...(this.data.behaviorMappings??[]),parseBehaviorMapping(value)];return this;}
  flowchart(input:import('../protocol/index.js').Flowchart):this {this.data.flowchart=parseFlowchart(input);return this;}
  textLayout(input:import('../protocol/index.js').TextLayout):this {this.data.textLayout=parseTextLayout(input);return this;}
  capability(value:typeof capabilities[number]):this {ensure(capabilities.some(c=>c===value),'UNSUPPORTED_CAPABILITY',value);this.data.capabilities=[...new Set([...this.data.capabilities,value])];return this;}
  rngFromHost():this {this.data.rng=parseRngConfig({algorithm:'lcg32@1',seedSource:'host'});return this;}
  rng(seed:number):this {this.data.rng=parseRngConfig({algorithm:'lcg32@1',seed});return this;}
  build(operations:OperationRegistry=emptyOperations): Program {if(this.data.flowchart)this.data.capabilities=[...new Set([...this.data.capabilities,'flowchart','expressions'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='profile.expression'||i.op==='text.template'||i.op==='text.rich'||i.op==='random.i32'||operands(i).some(o=>'expression'in o))))this.data.capabilities=[...new Set([...this.data.capabilities,'expressions'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='text.rich')))this.data.capabilities=[...new Set([...this.data.capabilities,'text.rich'])];if(this.data.textLayout)this.data.capabilities=[...new Set([...this.data.capabilities,'text.windows'])];if(programNeedsExtended(this.data))this.data.capabilities=[...new Set([...this.data.capabilities,'values.extended'])];if(this.data.functions.some(f=>f.code.some(i=>isStageInstruction(i)||i.op==='stage.put'&&Object.keys(i.object).some(k=>!['id','asset','z','position'].includes(k)))))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.effects','expressions','values.extended'])];if(this.data.functions.some(f=>f.code.some(isAudioInstruction)))this.data.capabilities=[...new Set([...this.data.capabilities,'audio.extended','expressions','values.extended'])];if(this.data.assets.some(a=>a.kind==='audio'&&(a.mime!=='audio/wav'||a.playback==='element')))this.data.capabilities=[...new Set([...this.data.capabilities,'audio.media'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='interaction.prompt')))this.data.capabilities=[...new Set([...this.data.capabilities,'interaction.timed','expressions','values.extended'])];if(this.data.assets.some(a=>a.kind==='video'))this.data.capabilities=[...new Set([...this.data.capabilities,'video.webm'])];if(this.data.assets.some(a=>a.transport))this.data.capabilities=[...new Set([...this.data.capabilities,'media.stream'])];if(this.data.rng)this.data.capabilities=[...new Set([...this.data.capabilities,'rng.lcg32'])];return linkProgram(this.data,operations).copy(); }
}
export class LinkedProgram {
  private readonly program: Program;
  constructor(input: unknown,operations:OperationRegistry=emptyOperations) { this.program = parseProgram(input); validateLinks(this.program,operations); }
  copy(): Program { return parseProgram(this.program); }
  view(): DeepReadonly<Program> { return this.copy(); }
}
export function linkProgram(input: unknown,operations:OperationRegistry=emptyOperations): LinkedProgram { return new LinkedProgram(input,operations); }
export function valueKind(operand: Operand, slots: readonly Slot[]): ValueKind {
  if ('literal' in operand) return operand.literal.kind;
  if ('expression'in operand)return validateExpressionTree(operand.expression,id=>slots.find(s=>s.id===id)?.kind);
  const s=slots.find(s=>s.id === operand.slot); ensure(s,'SLOT',operand.slot); return s.kind;
}
export function validateLinks(p: Program,operations:OperationRegistry=emptyOperations): void {
  const unique=(ids:string[],code:string)=>ensure(new Set(ids).size===ids.length,code,'Duplicate identity');
  unique(p.functions.map(f=>f.id),'FUNCTION_DUPLICATE'); unique(p.assets.map(a=>a.id),'ASSET_DUPLICATE');
  unique(p.functions.flatMap(f=>f.code.map(i=>i.at)),'ADDRESS_DUPLICATE');
  ensure(p.capabilities.every(c=>capabilities.some(s=>s===c)),'UNSUPPORTED_CAPABILITY',p.capabilities.join(','));
  ensure(!programNeedsExtended(p)||p.capabilities.includes('values.extended'),'VALUE_CAPABILITY','Declare values.extended');
  if(p.rng)ensure(p.capabilities.includes('rng.lcg32'),'RNG_CAPABILITY','Declare rng.lcg32');
  const richIds=new Set(p.functions.flatMap(f=>f.code).filter(i=>i.op==='text.rich').map(i=>readUnit(i)));for(const op of p.functions.flatMap(f=>f.code))if(op.op==='text.page'||op.op==='text.template')ensure(!richIds.has(readUnit(op)),'TEXT_FORMAT_IDENTITY','Rich and legacy text cannot share textId/revision');
  validateFlowchart(p);validateTextLayout(p);streamCatalog(p);ensure(!p.assets.some(a=>a.transport)||p.capabilities.includes('media.stream'),'STREAM_CAPABILITY','Declare media.stream');for(const a of p.assets)if(a.transport)ensure(a.kind==='video'||a.kind==='audio'&&(a.playback==='element'||a.playback===undefined&&a.mime!=='audio/wav'),'STREAM_PLAYBACK','Streaming requires media element playback');
  const main=p.functions.find(f=>f.id === p.entry); ensure(main && !main.params.length && main.returns==='void','ENTRY','Entry must take no parameters and return void');
  for(const a of p.assets)ensure((a.kind==='image'&&a.mime.startsWith('image/'))||(a.kind==='audio'&&['audio/wav','audio/mpeg','audio/ogg'].includes(a.mime))||(a.kind==='font'&&a.mime==='font/ttf')||(a.kind==='video'&&a.mime==='video/webm'),'ASSET_KIND',a.id);
  for(const a of p.assets){if(a.kind==='video')ensure(p.capabilities.includes('video.webm'),'VIDEO_CAPABILITY','Declare video.webm');ensure(a.kind==='audio'||a.playback===undefined,'ASSET_PLAYBACK','Playback mode only applies to audio');if(a.kind==='audio'&&(a.mime!=='audio/wav'||a.playback==='element'))ensure(p.capabilities.includes('audio.media'),'MEDIA_CAPABILITY','Declare audio.media');}
  for(const f of p.functions) {
    const slots=[...p.globals,...f.params,...f.locals]; unique(slots.map(s=>s.id),'SLOT_DUPLICATE');
    for(const s of slots)ensure(s.kind===s.initial.kind,'VALUE_KIND',s.id);
    const kind=(o:Operand)=>{if('expression'in o)ensure(p.capabilities.includes('expressions'),'EXPRESSION_CAPABILITY','Declare expressions');return valueKind(o,slots);};
    const target=(at:string)=>ensure(f.code.some(i=>i.at===at),'ADDRESS_SCOPE',`${f.id} -> ${at}`);
    const dest=(id:string,k:ValueKind)=>ensure(slots.find(s=>s.id===id)?.kind===k,'SLOT_KIND',id);
    target(f.entry); ensure(f.code.length>0,'FUNCTION_EMPTY',f.id);
    for(let index=0;index<f.code.length;index++) {
      const i=f.code[index]; ensure(i,'INSTRUCTION','missing');
      try {
      if(!['control.jump','control.branch','control.return','control.end'].includes(i.op))ensure(f.code[index+1],'FALLTHROUGH',i.at);
      if('task'in i&&typeof i.task==='string')ensure(!i.task.startsWith('voice-replay:'),'AUDIO_RESERVED_TASK','Reserved voice replay name');if(isAudioInstruction(i)){ensure(p.capabilities.includes('audio.extended')&&p.capabilities.includes('expressions'),'AUDIO_CAPABILITY','Declare audio.extended and expressions');audioExpressions(i).forEach(e=>validateExpressionTree(e,id=>slots.find(s=>s.id===id)?.kind));if(i.op==='audio.track')ensure(p.assets.some(a=>a.id===i.asset&&a.kind==='audio'),'ASSET_KIND',i.asset);}
      if(isStageInstruction(i)){ensure(p.capabilities.includes('stage.effects')&&p.capabilities.includes('expressions'),'STAGE_CAPABILITY','Declare stage.effects and expressions');stageExpressions(i).forEach(e=>validateExpressionTree(e,id=>slots.find(s=>s.id===id)?.kind));if(i.op==='stage.image'||i.op==='stage.transition')ensure(p.assets.some(a=>a.id===i.asset&&a.kind==='image'),'ASSET_KIND',i.at);}
      if(i.op==='interaction.prompt'){ensure(p.capabilities.includes('interaction.timed')&&p.capabilities.includes('expressions'),'INTERACTION_CAPABILITY','Declare interaction.timed');dest(i.dest,'string');unique(i.options.map(o=>o.id),'INTERACTION_DUPLICATE');interactionExpressions(i).forEach(e=>validateExpressionTree(e,id=>slots.find(s=>s.id===id)?.kind));for(const o of i.options){target(o.target);if(o.rect)ensure(o.rect.x+o.rect.width<=1280&&o.rect.y+o.rect.height<=720,'INTERACTION_RECT','Rectangle exceeds viewport');}ensure((i.deadlineMs===null)===(i.timeout===null),'INTERACTION_TIMEOUT','Deadline and timeout must be paired');if(i.timeout){target(i.timeout.target);ensure(!i.options.some(o=>o.id===i.timeout?.id),'INTERACTION_DUPLICATE','Timeout identity must be distinct');}}
      if(i.op==='video.play'){ensure(p.capabilities.includes('video.webm')&&p.assets.some(a=>a.id===i.asset&&a.kind==='video'),'VIDEO_CAPABILITY','Declared video asset required');ensure(i.rect.x+i.rect.width<=1280&&i.rect.y+i.rect.height<=720,'VIDEO_RECT','Video exceeds viewport');}
      if(i.op==='flow.node'||i.op==='flow.unlock')ensure(p.flowchart?.nodes.some(n=>n.id===i.node),'FLOW_NODE_UNKNOWN',i.node);
      switch(i.op) {
        case 'text.window.select':case 'text.window.clear':case 'text.window.visible':case 'text.window.theme':ensure(p.textLayout?.windows.some(w=>w.id===i.window),'TEXT_WINDOW',i.window);if(i.op==='text.window.theme')ensure(p.textLayout?.themes.some(t=>t.id===i.theme),'TEXT_THEME',i.theme);break;
        case 'text.page': readUnit(i);break;
        case 'text.template': ensure(p.capabilities.includes('expressions'),'EXPRESSION_CAPABILITY','Declare expressions');readUnit(i);validateExpressionTree(i.speaker,id=>slots.find(s=>s.id===id)?.kind);validateExpressionTree(i.content,id=>slots.find(s=>s.id===id)?.kind);templateSignature(i.speaker,i.content);break;
        case 'text.rich': {ensure(p.capabilities.includes('text.rich')&&p.capabilities.includes('expressions'),'TEXT_CAPABILITY','Declare text.rich and expressions');readUnit(i);validateExpressionTree(i.speaker,id=>slots.find(s=>s.id===id)?.kind);for(const run of i.runs){if(run.kind==='text'||run.kind==='ruby'){validateExpressionTree(run.content,id=>slots.find(s=>s.id===id)?.kind);if(run.kind==='ruby')validateExpressionTree(run.reading,id=>slots.find(s=>s.id===id)?.kind);}}richTextSignature(i);if(i.runs.every(r=>(r.kind!=='text'&&r.kind!=='ruby')||r.content.op==='literal'&&(r.kind!=='ruby'||r.reading.op==='literal'))){compileRichText(i.runs.map(r=>{if(r.kind==='text')return {...r,content:r.content.op==='literal'?r.content.value:''};if(r.kind==='ruby')return {...r,content:r.content.op==='literal'?r.content.value:'',reading:r.reading.op==='literal'?r.reading.value:''};return r;}));}break;}
        case 'profile.expression':ensure(p.capabilities.includes('expressions'),'EXPRESSION_CAPABILITY','Declare expressions');validateExpressionTree(i.value,id=>slots.find(s=>s.id===id)?.kind);break;
        case 'random.i32': ensure(p.rng&&p.capabilities.includes('rng.lcg32')&&p.capabilities.includes('expressions'),'RNG_CAPABILITY','Declare rng and expressions');dest(i.dest,'i32');validateExpressionTree(i.min,id=>slots.find(s=>s.id===id)?.kind);validateExpressionTree(i.max,id=>slots.find(s=>s.id===id)?.kind);break;
        case 'rng.seed': ensure(p.rng&&p.capabilities.includes('rng.lcg32'),'RNG_CAPABILITY','Declare rng');break;
        case 'control.jump': target(i.target); break;
        case 'control.branch': ensure(kind(i.left)===kind(i.right),'COMPARE_KIND',i.at); ensure(i.cmp==='eq'||['i32','i64','f64','string'].includes(kind(i.left)),'COMPARE_KIND',i.at); target(i.yes); target(i.no); break;
        case 'control.call': {
          const callee=p.functions.find(f=>f.id===i.function); ensure(callee,'FUNCTION',i.function);
          ensure(i.args.length===callee.params.length,'CALL_ARITY',i.at);
          i.args.forEach((o,j)=>ensure(kind(o)===callee.params[j]?.kind,'CALL_KIND',i.at));
          if(callee.returns==='void')ensure(i.dest===undefined,'RETURN_SLOT',i.at); else { ensure(i.dest,'RETURN_SLOT',i.at); dest(i.dest,callee.returns); } break;
        }
        case 'control.return': ensure(i.value ? kind(i.value)===f.returns : f.returns==='void','RETURN_KIND',i.at); break;
        case 'control.end': ensure(f.id===p.entry,'END_SCOPE',i.at); break;
        case 'value.set': dest(i.dest,kind(i.value)); break;
        case 'i32.add.checked': dest(i.dest,'i32'); ensure(kind(i.left)==='i32'&&kind(i.right)==='i32','I32_OPERAND',i.at); break;
        case 'choice': dest(i.dest,'string'); ensure(i.options.length>0,'CHOICE_EMPTY',i.at); unique(i.options.map(o=>o.id),'CHOICE_DUPLICATE'); i.options.forEach(o=>target(o.target)); break;
        case 'stage.put': if(Object.keys(i.object).some(k=>!['id','asset','position','z'].includes(k)))ensure(p.capabilities.includes('stage.effects'),'STAGE_CAPABILITY','Extended object needs stage.effects');for(const layer of i.object.layers??[])ensure(p.assets.some(a=>a.id===layer.asset&&a.kind==='image'),'ASSET_KIND',i.at);ensure(p.assets.find(a=>a.id===i.object.asset)?.kind==='image','ASSET_KIND',i.at); break;
        case 'extension.invoke': {const op=operations.get(i.operation,i.version);op.validateArgs(i.args,i.argsSchema);op.manifest.jumpTargets.forEach(target);break;}
        case 'audio.play': ensure(p.assets.find(a=>a.id===i.asset)?.kind==='audio','ASSET_KIND',i.at); break;
      }
      }catch(error){if(error instanceof GalboxError)throw new GalboxError(error.code,error.reason,{...error.location,address:i.at});throw error;}
    }
  }
}

