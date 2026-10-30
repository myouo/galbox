import {ownedWireFootprint} from '../protocol/budget.js';
import {isParticleInstruction,validateParticleConfig} from '../protocol/particles.js';
import {isMotionInstruction,motionDuration} from '../protocol/motion.js';
import {validatePresentation} from '../protocol/presentation.js';
import {validateUICatalog,validateUIInstruction,isUIInstruction,uiExpressions} from '../protocol/ui.js';
import {validateExtras} from '../protocol/extras.js';
import {validateFlowchart} from '../protocol/flow.js';
import {streamCatalog} from '../protocol/streams.js';
import {interactionExpressions} from '../protocol/interaction.js';
import {isAudioInstruction,audioExpressions} from '../protocol/audio.js';
import { emptyOperations } from '../core/operations.js';
import type { OperationRegistry } from '../core/operations.js';
import { parseModuleHeader,parseProgramModule,parseFunction,parseAsset,parseTextStyle,parseProgram, parseInstruction, parseValue, ensure, capabilities, GalboxError, parseSourceMap, parsePortObligation, parseBehaviorMapping, readUnit,parseRngConfig,parseTextLayout,parseFlowchart,parseExtrasCatalog,parseUICatalog,parseGamePresentation } from '../protocol/index.js';
import {validateTextLayout} from '../protocol/layout.js';
import {resolveRichSource,richTextSignature,richContinuationSources,compileRichText} from '../protocol/text.js';
import {isStageInstruction,stageExpressions} from '../protocol/stage.js';
import {extendedValue} from '../protocol/values.js';
import {validateExpressionTree,templateSignature,extendedExpression} from '../protocol/expressions.js';
import type { Program, Instruction, Value, ValueKind, Operand, Function as ProgramFunction, Slot, Asset, Position, DeepReadonly, SourceLocation, PortObligation, BehaviorMapping } from '../protocol/index.js';

export type AssetRef<K extends Asset['kind']> = { readonly id: string; readonly kind: K };
export type SfxBufferRef = {readonly id:string;readonly kind:'sfx-buffer'};
export type BgmBufferRef = {readonly id:string;readonly kind:'bgm-buffer'};
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
 if(p.extras?.entries.some(e=>extendedExpression(e.unlock)))return true;
 if(p.flowchart?.nodes.some(n=>extendedExpression(n.unlock)||extendedExpression(n.gate)))return true;
 return p.globals.some(s=>extendedValue(s.initial))||p.functions.some(f=>![...['void','i32','bool','string']].includes(f.returns)||[...f.params,...f.locals].some(s=>extendedValue(s.initial))||f.code.some(i=>{
  if(isUIInstruction(i)&&uiExpressions(i).some(extendedExpression))return true;
  if(isStageInstruction(i)||isAudioInstruction(i)||i.op==='interaction.prompt')return true;
  if(operands(i).some(o=>'literal'in o?extendedValue(o.literal):'expression'in o&&extendedExpression(o.expression)))return true;
  if(i.op==='profile.set')return extendedValue(i.value);if(i.op==='profile.expression')return extendedExpression(i.value);
  if(i.op==='text.template')return extendedExpression(i.speaker)||extendedExpression(i.content);
  if(i.op==='text.rich')return extendedExpression(i.speaker)||i.runs.some(r=>(r.kind==='text'||r.kind==='ruby')&&(extendedExpression(r.content)||r.kind==='ruby'&&extendedExpression(r.reading)));return false;
 }));
}
function authoredText(i:DeepReadonly<Instruction>):boolean{return i.op==='text.rich'&&i.runs.some(r=>(r.kind==='text'||r.kind==='ruby')&&(r.style?.shadow!==undefined||r.style?.effect?.kind==='fade'&&(r.style.effect.samples!==undefined||r.style.effect.minimumIntervalMs!==undefined)));}
export class ProgramBuilder {
  private readonly data: Program;
  constructor(identity: {gameId:string; release:string; entry:string; title?:string}) {
    this.data={version:1,...identity,title:identity.title??identity.gameId,capabilities:['adv','stage.linear','audio.wav','tasks.all','profile'],assets:[],globals:[],functions:[]};
  }
  asset<K extends Asset['kind']>(kind: K, data: Omit<Asset,'kind'>): AssetRef<K> { this.data.assets.push({...data,kind}); return {id:data.id,kind}; }
  bgmBuffer(id:string):BgmBufferRef {this.data.bgmBuffers=[...(this.data.bgmBuffers??[]),id];return {id,kind:'bgm-buffer'};}
  sfxBuffer(id:string):SfxBufferRef {this.data.sfxBuffers=[...(this.data.sfxBuffers??[]),id];return {id,kind:'sfx-buffer'};}
  global(value: Slot): this { this.data.globals.push(value); return this; }
  function(value: ProgramFunction): this { this.data.functions.push(value); return this; }
  source(at:string,source:SourceLocation):this {const entries=parseSourceMap([{at,source}]);this.data.sourceMap=[...(this.data.sourceMap??[]),...entries];return this;}
  obligation(value:PortObligation):this {this.data.obligations=[...(this.data.obligations??[]),parsePortObligation(value)];return this;}
  mapping(value:BehaviorMapping):this {this.data.behaviorMappings=[...(this.data.behaviorMappings??[]),parseBehaviorMapping(value)];return this;}
  presentation(input:import('../protocol/index.js').GamePresentation):this {this.data.presentation=parseGamePresentation(input);return this;}
  ui(input:import('../protocol/index.js').UICatalog):this {this.data.ui=parseUICatalog(input);return this;}
  extras(input:import('../protocol/index.js').ExtrasCatalog):this {this.data.extras=parseExtrasCatalog(input);return this;}
  flowchart(input:import('../protocol/index.js').Flowchart):this {this.data.flowchart=parseFlowchart(input);return this;}
  textLayout(input:import('../protocol/index.js').TextLayout):this {this.data.textLayout=parseTextLayout(input);return this;}
  capability(value:typeof capabilities[number]):this {ensure(capabilities.some(c=>c===value),'UNSUPPORTED_CAPABILITY',value);this.data.capabilities=[...new Set([...this.data.capabilities,value])];return this;}
  rngFromHost():this {this.data.rng=parseRngConfig({algorithm:'lcg32@1',seedSource:'host'});return this;}
  rng(seed:number):this {this.data.rng=parseRngConfig({algorithm:'lcg32@1',seed});return this;}
  textStyle(id:string,style:import('../protocol/index.js').TextStyle):string {const entry={id,style:parseTextStyle(style)};if(this.data.textStyles)this.data.textStyles.push(entry);else this.data.textStyles=[entry];return id;}
  private inferCapabilities():void {if(this.data.textStyles)this.data.capabilities=[...new Set([...this.data.capabilities,'text.styles'])];if(this.data.textStyles?.some(s=>s.style.shadow!==undefined||s.style.effect?.kind==='fade'&&(s.style.effect.samples!==undefined||s.style.effect.minimumIntervalMs!==undefined)))this.data.capabilities=[...new Set([...this.data.capabilities,'text.authored-opacity'])];if(this.data.textLayout?.windows.some(w=>w.opacityObject))this.data.capabilities=[...new Set([...this.data.capabilities,'text.stage-opacity'])];if(this.data.functions.some(f=>f.code.some(authoredText)))this.data.capabilities=[...new Set([...this.data.capabilities,'text.authored-opacity'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='stage.motion'&&i.tracks.some(t=>t.axis==='alpha'))))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.motion.alpha'])];if(this.data.textLayout?.stageZ!==undefined)this.data.capabilities=[...new Set([...this.data.capabilities,'text.stage-order'])];if(this.data.functions.some(f=>f.code.some(i=>(i.op==='task.join'||i.op==='wait.delay')&&i.skippable)))this.data.capabilities=[...new Set([...this.data.capabilities,'wait.skippable'])];if(this.data.bgmBuffers||this.data.functions.some(f=>f.code.some(i=>i.op==='audio.source.gain'||i.op==='audio.source.fade'&&(i.delayMs!==undefined||i.inactive!==undefined)||(i.op==='audio.source.stop'||i.op==='audio.wait')&&i.inactive!==undefined)))this.data.capabilities=[...new Set([...this.data.capabilities,'audio.layers','audio.sources','audio.extended','expressions'])];if(this.data.textLayout?.followStage)this.data.capabilities=[...new Set([...this.data.capabilities,'text.stage-transform'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='stage.shake'&&i.samples)))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.sampled'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='stage.mix'||i.op==='stage.asset'||i.op==='stage.style'&&i.style.filters||i.op==='stage.image'&&i.style?.filters)))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.composition'])];if(this.data.functions.some(f=>f.code.some(isParticleInstruction)))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.particles','stage.frames','stage.effects','expressions','values.extended'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='stage.put'&&i.object.frame||(i.op==='stage.image'||i.op==='stage.style')&&i.style?.frame)))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.frames'])];if(this.data.functions.some(f=>f.code.some(isMotionInstruction)))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.motion','stage.effects','expressions','values.extended'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='state.collect')))this.data.capabilities=[...new Set([...this.data.capabilities,'state.retention'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='text.rich'&&(i.appendFrom||i.completion&&i.completion!=='input'||i.runs.some(r=>r.kind==='speed'&&r.user)))))this.data.capabilities=[...new Set([...this.data.capabilities,'text.continuations'])];if(this.data.sfxBuffers||this.data.functions.some(f=>f.code.some(i=>i.op==='audio.source.fade'||i.op==='audio.source.stop'||i.op==='audio.track'&&i.buffer!==undefined)))this.data.capabilities=[...new Set([...this.data.capabilities,'audio.sources','audio.extended','expressions'])];if(this.data.ui)this.data.capabilities=[...new Set([...this.data.capabilities,'ui.controls','expressions'])];if(this.data.extras)this.data.capabilities=[...new Set([...this.data.capabilities,'extras','expressions'])];if(this.data.flowchart)this.data.capabilities=[...new Set([...this.data.capabilities,'flowchart','expressions'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='profile.expression'||i.op==='text.template'||i.op==='text.rich'||i.op==='random.i32'||operands(i).some(o=>'expression'in o))))this.data.capabilities=[...new Set([...this.data.capabilities,'expressions'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='text.rich')))this.data.capabilities=[...new Set([...this.data.capabilities,'text.rich'])];if(this.data.textLayout)this.data.capabilities=[...new Set([...this.data.capabilities,'text.windows'])];if(programNeedsExtended(this.data))this.data.capabilities=[...new Set([...this.data.capabilities,'values.extended'])];if(this.data.functions.some(f=>f.code.some(i=>isStageInstruction(i)||i.op==='stage.put'&&Object.keys(i.object).some(k=>!['id','asset','z','position'].includes(k)))))this.data.capabilities=[...new Set([...this.data.capabilities,'stage.effects','expressions','values.extended'])];if(this.data.functions.some(f=>f.code.some(isAudioInstruction)))this.data.capabilities=[...new Set([...this.data.capabilities,'audio.extended','expressions','values.extended'])];if(this.data.assets.some(a=>a.kind==='audio'&&(a.mime!=='audio/wav'||a.playback==='element')))this.data.capabilities=[...new Set([...this.data.capabilities,'audio.media'])];if(this.data.functions.some(f=>f.code.some(i=>i.op==='interaction.prompt')))this.data.capabilities=[...new Set([...this.data.capabilities,'interaction.timed','expressions','values.extended'])];if(this.data.assets.some(a=>a.kind==='video'))this.data.capabilities=[...new Set([...this.data.capabilities,'video.webm'])];if(this.data.assets.some(a=>a.transport))this.data.capabilities=[...new Set([...this.data.capabilities,'media.stream'])];if(this.data.rng)this.data.capabilities=[...new Set([...this.data.capabilities,'rng.lcg32'])];}
  parts():import('./module-compiler.js').ModuleParts {this.inferCapabilities();const {functions,assets,...raw}=this.data,ownedAssets=assets.map(parseAsset),header=parseModuleHeader({...raw,assets:ownedAssets.slice(0,256)}),files:import('./module-compiler.js').ModuleParts['files']=[];let batch:ProgramFunction[]=[];
   const flush=()=>{if(!batch.length)return;const id='part-'+String(files.length).padStart(3,'0'),body=parseProgramModule({format:'galbox-code',version:1,id,functions:batch});files.push({uri:'code/'+id+'.pb',body});batch=[];};let nodes=0,chars=0;
   for(const rawFunction of functions){const f=parseFunction(rawFunction),size=ownedWireFootprint(f);ensure(size.nodes<80000&&size.characters<3000000,'MODULE_FUNCTION_SIZE','Split this function at a declared call boundary');if(nodes+size.nodes>80000||chars+size.characters>3000000){flush();nodes=0;chars=0;}batch.push(f);nodes+=size.nodes;chars+=size.characters;}flush();ensure(files.length<=64,'MODULE_SIZE','At most 64 code modules');return {header,files,assetCatalogs:Array.from({length:Math.ceil(Math.max(0,ownedAssets.length-256)/256)},(_,i)=>ownedAssets.slice(256+i*256,512+i*256))};}
  build(operations:OperationRegistry=emptyOperations):Program {this.inferCapabilities();return linkProgram(this.data,operations).copy();}

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
export function validateLinks(p: Program,operations:OperationRegistry=emptyOperations,imports:readonly import('../protocol/index.js').ModuleFunction[]=[]): void {
  const unique=(ids:string[],code:string)=>ensure(new Set(ids).size===ids.length,code,'Duplicate identity');
  ensure(!p.textCatalogBinding,'TEXT_CATALOG_REQUIRED','Resolve the selected text catalog before linking/executing');unique(p.functions.map(f=>f.id),'FUNCTION_DUPLICATE'); unique(p.assets.map(a=>a.id),'ASSET_DUPLICATE');
  unique(p.functions.flatMap(f=>f.code.map(i=>i.at)),'ADDRESS_DUPLICATE');
  ensure(p.capabilities.every(c=>capabilities.some(s=>s===c)),'UNSUPPORTED_CAPABILITY',p.capabilities.join(','));
  ensure(!programNeedsExtended(p)||p.capabilities.includes('values.extended'),'VALUE_CAPABILITY','Declare values.extended');
  if(p.bgmBuffers){unique(p.bgmBuffers,'AUDIO_BUFFER_DUPLICATE');ensure(p.capabilities.includes('audio.layers')&&p.capabilities.includes('audio.sources'),'AUDIO_LAYER_CAPABILITY','Declare audio.layers');}
  if(p.sfxBuffers){unique(p.sfxBuffers,'AUDIO_BUFFER_DUPLICATE');ensure(p.capabilities.includes('audio.sources'),'AUDIO_SOURCE_CAPABILITY','Declare audio.sources');}
  if(p.capabilities.includes('audio.sources'))ensure(p.capabilities.includes('audio.extended')&&p.capabilities.includes('expressions'),'AUDIO_SOURCE_CAPABILITY','Audio sources require extended audio and expressions');
  if(p.rng)ensure(p.capabilities.includes('rng.lcg32'),'RNG_CAPABILITY','Declare rng.lcg32');
  const richIds=new Set(p.functions.flatMap(f=>f.code).filter(i=>i.op==='text.rich').map(i=>readUnit(i)));for(const op of p.functions.flatMap(f=>f.code))if(op.op==='text.page'||op.op==='text.template')ensure(!richIds.has(readUnit(op)),'TEXT_FORMAT_IDENTITY','Rich and legacy text cannot share textId/revision');
  if(p.textLayout?.followStage)ensure(p.capabilities.includes('text.stage-transform'),'TEXT_TRANSFORM_CAPABILITY','Declare text.stage-transform');
  if(p.textLayout?.stageZ!==undefined)ensure(p.capabilities.includes('text.stage-order'),'TEXT_ORDER_CAPABILITY','Declare text.stage-order');
  if(p.textStyles){unique(p.textStyles.map(s=>s.id),'TEXT_STYLE_DUPLICATE');ensure(p.capabilities.includes('text.styles'),'TEXT_STYLE_CAPABILITY','Declare text.styles');}
  validatePresentation(p);validateUICatalog(p);validateFlowchart(p,imports);validateExtras(p,imports);validateTextLayout(p);streamCatalog(p);ensure(!p.assets.some(a=>a.transport)||p.capabilities.includes('media.stream'),'STREAM_CAPABILITY','Declare media.stream');for(const a of p.assets)if(a.transport)ensure(a.kind==='video'||a.kind==='audio'&&(a.playback==='element'||a.playback===undefined&&a.mime!=='audio/wav'),'STREAM_PLAYBACK','Streaming requires media element playback');
  const main=p.functions.find(f=>f.id === p.entry)??imports.find(f=>f.id===p.entry); ensure(main && !main.params.length && main.returns==='void','ENTRY','Entry must take no parameters and return void');
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
      if('task'in i&&typeof i.task==='string')ensure(!i.task.startsWith('voice-replay:'),'AUDIO_RESERVED_TASK','Reserved voice replay name');if(isAudioInstruction(i)){ensure(p.capabilities.includes('audio.extended')&&p.capabilities.includes('expressions'),'AUDIO_CAPABILITY','Declare audio.extended and expressions');audioExpressions(i).forEach(e=>validateExpressionTree(e,id=>slots.find(s=>s.id===id)?.kind));if(i.op==='audio.track'){ensure(p.assets.some(a=>a.id===i.asset&&a.kind==='audio'),'ASSET_KIND',i.asset);if(i.buffer!==undefined)ensure(p.capabilities.includes('audio.sources')&&(i.channel==='sfx'&&p.sfxBuffers?.includes(i.buffer)||i.channel==='bgm'&&p.capabilities.includes('audio.layers')&&p.bgmBuffers?.includes(i.buffer)),'AUDIO_BUFFER','Declare an sfx buffer');}
      if(i.op==='audio.source.fade'||i.op==='audio.source.stop'||i.op==='audio.source.gain'){ensure(p.capabilities.includes('audio.sources'),'AUDIO_SOURCE_CAPABILITY','Declare audio.sources');ensure(p.functions.some(f=>f.code.some(source=>source.op==='audio.track'&&source.task===i.source))||imports.some(f=>f.audioSources?.includes(i.source)),'AUDIO_SOURCE','Source must name a declared media task');}}
      if(isStageInstruction(i)){ensure(p.capabilities.includes('stage.effects')&&p.capabilities.includes('expressions'),'STAGE_CAPABILITY','Declare stage.effects and expressions');stageExpressions(i).forEach(e=>validateExpressionTree(e,id=>slots.find(s=>s.id===id)?.kind));if(i.op==='stage.image'||i.op==='stage.asset'||i.op==='stage.transition'||i.op==='stage.rule')ensure(p.assets.some(a=>a.id===i.asset&&a.kind==='image'),'ASSET_KIND',i.at);if(i.op==='stage.rule')ensure(p.assets.some(a=>a.id===i.rule&&a.kind==='image'),'ASSET_KIND',i.at);}
      if(i.op==='stage.put'&&i.object.frame||(i.op==='stage.image'||i.op==='stage.style')&&i.style?.frame)ensure(p.capabilities.includes('stage.frames'),'FRAME_CAPABILITY','Declare stage.frames');
      if(isParticleInstruction(i)){ensure(p.capabilities.includes('stage.particles')&&p.capabilities.includes('stage.frames')&&p.capabilities.includes('stage.effects'),'PARTICLE_CAPABILITY','Declare particle/frame/stage capabilities');if(i.op==='stage.particles'){validateParticleConfig(i.config);for(const style of i.config.styles)ensure(p.assets.some(a=>a.id===style.asset&&a.kind==='image'),'ASSET_KIND',style.asset);}}
      if(authoredText(i))ensure(p.capabilities.includes('text.authored-opacity'),'TEXT_OPACITY_CAPABILITY','Declare authored text opacity');
      if(isMotionInstruction(i)){ensure(p.capabilities.includes('stage.motion')&&p.capabilities.includes('stage.effects'),'MOTION_CAPABILITY','Declare stage.motion and stage.effects');if(i.op==='stage.motion'){if(i.tracks.some(t=>t.axis==='alpha'))ensure(p.capabilities.includes('stage.motion.alpha'),'MOTION_ALPHA_CAPABILITY','Declare opacity motion');motionDuration(i.tracks,i.loop,i.intervalMs);}}
      if(i.op==='stage.put')ensure(!i.object.motion,'MOTION_DERIVED','Motion offset belongs to Core');
      if(i.op==='stage.mix'||i.op==='stage.asset'||i.op==='stage.style'&&i.style.filters||i.op==='stage.image'&&i.style?.filters){ensure(p.capabilities.includes('stage.composition'),'STAGE_COMPOSITION_CAPABILITY','Declare stage.composition');if(i.op==='stage.mix'){ensure((i.method==='rule')===!!i.rule,'STAGE_MIX_RULE','Rule required only for rule mixing');if(i.rule)ensure(p.assets.some(a=>a.id===i.rule&&a.kind==='image'),'ASSET_KIND',i.rule);}}
      if(i.op==='stage.shake'&&i.samples)ensure(p.capabilities.includes('stage.sampled'),'STAGE_SAMPLED_CAPABILITY','Declare stage.sampled');
      if(i.op==='audio.source.gain'||i.op==='audio.source.fade'&&(i.delayMs!==undefined||i.inactive!==undefined)||(i.op==='audio.source.stop'||i.op==='audio.wait')&&i.inactive!==undefined)ensure(p.capabilities.includes('audio.layers'),'AUDIO_LAYER_CAPABILITY','Declare audio.layers');
      if((i.op==='task.join'||i.op==='wait.delay')&&i.skippable)ensure(p.capabilities.includes('wait.skippable'),'WAIT_SKIP_CAPABILITY','Declare wait.skippable');
      if(isUIInstruction(i))validateUIInstruction(p,i,slots,target);
      if(i.op==='interaction.prompt'){ensure(p.capabilities.includes('interaction.timed')&&p.capabilities.includes('expressions'),'INTERACTION_CAPABILITY','Declare interaction.timed');dest(i.dest,'string');unique(i.options.map(o=>o.id),'INTERACTION_DUPLICATE');interactionExpressions(i).forEach(e=>validateExpressionTree(e,id=>slots.find(s=>s.id===id)?.kind));for(const o of i.options){target(o.target);if(o.rect)ensure(o.rect.x+o.rect.width<=1280&&o.rect.y+o.rect.height<=720,'INTERACTION_RECT','Rectangle exceeds viewport');}ensure((i.deadlineMs===null)===(i.timeout===null),'INTERACTION_TIMEOUT','Deadline and timeout must be paired');if(i.timeout){target(i.timeout.target);ensure(!i.options.some(o=>o.id===i.timeout?.id),'INTERACTION_DUPLICATE','Timeout identity must be distinct');}}
      if(i.op==='video.play'){ensure(p.capabilities.includes('video.webm')&&p.assets.some(a=>a.id===i.asset&&a.kind==='video'),'VIDEO_CAPABILITY','Declared video asset required');ensure(i.rect.x+i.rect.width<=1280&&i.rect.y+i.rect.height<=720,'VIDEO_RECT','Video exceeds viewport');}
      if(i.op==='extras.unlock'||i.op==='extras.check'||i.op==='extras.scene')ensure(p.extras&&p.capabilities.includes('extras'),'EXTRAS_CAPABILITY','Extras instructions need a catalog');
      if(i.op==='flow.node'||i.op==='flow.unlock')ensure(p.flowchart?.nodes.some(n=>n.id===i.node),'FLOW_NODE_UNKNOWN',i.node);
      switch(i.op) {
        case 'state.collect':ensure(p.capabilities.includes('state.retention'),'STATE_RETENTION_CAPABILITY','Declare state.retention');break;
        case 'text.window.select':case 'text.window.clear':case 'text.window.visible':case 'text.window.theme':ensure(p.textLayout?.windows.some(w=>w.id===i.window),'TEXT_WINDOW',i.window);if(i.op==='text.window.theme')ensure(p.textLayout?.themes.some(t=>t.id===i.theme),'TEXT_THEME',i.theme);break;
        case 'text.page': readUnit(i);break;
        case 'text.template': ensure(p.capabilities.includes('expressions'),'EXPRESSION_CAPABILITY','Declare expressions');readUnit(i);validateExpressionTree(i.speaker,id=>slots.find(s=>s.id===id)?.kind);validateExpressionTree(i.content,id=>slots.find(s=>s.id===id)?.kind);templateSignature(i.speaker,i.content);break;
        case 'text.rich': {const resolved=resolveRichSource(p,i);if(i.runs.some(r=>(r.kind==='text'||r.kind==='ruby')&&r.styleId!==undefined))ensure(p.capabilities.includes('text.styles'),'TEXT_STYLE_CAPABILITY','Declare text.styles');if(authoredText(resolved))ensure(p.capabilities.includes('text.authored-opacity'),'TEXT_OPACITY_CAPABILITY','Declare authored text opacity');if(i.appendFrom||i.completion&&i.completion!=='input'||i.runs.some(r=>r.kind==='speed'&&r.user))ensure(p.capabilities.includes('text.continuations'),'TEXT_CAPABILITY','Declare text.continuations');ensure(p.capabilities.includes('text.rich')&&p.capabilities.includes('expressions'),'TEXT_CAPABILITY','Declare text.rich and expressions');readUnit(i);validateExpressionTree(i.speaker,id=>slots.find(s=>s.id===id)?.kind);for(const run of i.runs){if(run.kind==='text'||run.kind==='ruby'){validateExpressionTree(run.content,id=>slots.find(s=>s.id===id)?.kind);if(run.kind==='ruby')validateExpressionTree(run.reading,id=>slots.find(s=>s.id===id)?.kind);}}richTextSignature(resolved);richContinuationSources(p,i);if(i.runs.every(r=>(r.kind!=='text'&&r.kind!=='ruby')||r.content.op==='literal'&&(r.kind!=='ruby'||r.reading.op==='literal'))){compileRichText(i.runs.map(r=>{if(r.kind==='text')return {...r,content:r.content.op==='literal'?r.content.value:''};if(r.kind==='ruby')return {...r,content:r.content.op==='literal'?r.content.value:'',reading:r.reading.op==='literal'?r.reading.value:''};return r;}));}break;}
        case 'profile.expression':ensure(p.capabilities.includes('expressions'),'EXPRESSION_CAPABILITY','Declare expressions');validateExpressionTree(i.value,id=>slots.find(s=>s.id===id)?.kind);break;
        case 'random.i32': ensure(p.rng&&p.capabilities.includes('rng.lcg32')&&p.capabilities.includes('expressions'),'RNG_CAPABILITY','Declare rng and expressions');dest(i.dest,'i32');validateExpressionTree(i.min,id=>slots.find(s=>s.id===id)?.kind);validateExpressionTree(i.max,id=>slots.find(s=>s.id===id)?.kind);break;
        case 'rng.seed': ensure(p.rng&&p.capabilities.includes('rng.lcg32'),'RNG_CAPABILITY','Declare rng');break;
        case 'control.jump': target(i.target); break;
        case 'control.branch': ensure(kind(i.left)===kind(i.right),'COMPARE_KIND',i.at); ensure(i.cmp==='eq'||['i32','i64','f64','string'].includes(kind(i.left)),'COMPARE_KIND',i.at); target(i.yes); target(i.no); break;
        case 'control.call': {
          const callee=p.functions.find(f=>f.id===i.function)??imports.find(f=>f.id===i.function); ensure(callee,'FUNCTION',i.function);
          ensure(i.args.length===callee.params.length,'CALL_ARITY',i.at);
          i.args.forEach((o,j)=>ensure(kind(o)===callee.params[j]?.kind,'CALL_KIND',i.at));
          if(callee.returns==='void')ensure(i.dest===undefined,'RETURN_SLOT',i.at); else { ensure(i.dest,'RETURN_SLOT',i.at); dest(i.dest,callee.returns); } break;
        }
        case 'control.return': ensure(i.value ? kind(i.value)===f.returns : f.returns==='void','RETURN_KIND',i.at); break;
        case 'control.end': ensure(f.id===p.entry,'END_SCOPE',i.at); break;
        case 'value.set': dest(i.dest,kind(i.value)); break;
        case 'i32.add.checked': dest(i.dest,'i32'); ensure(kind(i.left)==='i32'&&kind(i.right)==='i32','I32_OPERAND',i.at); break;
        case 'choice': dest(i.dest,'string'); ensure(i.options.length>0,'CHOICE_EMPTY',i.at); unique(i.options.map(o=>o.id),'CHOICE_DUPLICATE'); i.options.forEach(o=>target(o.target)); break;
        case 'stage.put': if(Object.keys(i.object).some(k=>!['id','asset','position','z'].includes(k)))ensure(p.capabilities.includes('stage.effects'),'STAGE_CAPABILITY','Extended object needs stage.effects');for(const id of i.object.ruleTransition?[i.object.ruleTransition.from,i.object.ruleTransition.rule]:[])ensure(p.assets.some(a=>a.id===id&&a.kind==='image'),'ASSET_KIND',i.at);for(const layer of i.object.layers??[])ensure(p.assets.some(a=>a.id===layer.asset&&a.kind==='image'),'ASSET_KIND',i.at);ensure(p.assets.find(a=>a.id===i.object.asset)?.kind==='image','ASSET_KIND',i.at); break;
        case 'extension.invoke': {const op=operations.get(i.operation,i.version);op.validateArgs(i.args,i.argsSchema);op.manifest.jumpTargets.forEach(target);break;}
        case 'audio.play': ensure(p.assets.find(a=>a.id===i.asset)?.kind==='audio','ASSET_KIND',i.at); break;
      }
      }catch(error){if(error instanceof GalboxError)throw new GalboxError(error.code,error.reason,{...error.location,address:i.at});throw error;}
    }
  }
}

