import { emptyOperations } from '../core/operations.js';
import type { OperationRegistry } from '../core/operations.js';
import { parseProgram, parseInstruction, parseValue, ensure, capabilities, GalboxError, parseSourceMap, parsePortObligation, parseBehaviorMapping } from '../protocol/index.js';
import type { Program, Instruction, Value, ValueKind, Operand, Function as ProgramFunction, Slot, Asset, Position, DeepReadonly, SourceLocation, PortObligation, BehaviorMapping } from '../protocol/index.js';

export type AssetRef<K extends Asset['kind']> = { readonly id: string; readonly kind: K };
export type Variable<K extends ValueKind> = {readonly id: string; readonly kind: K};
export function variable<K extends ValueKind>(id: string, kind: K): Variable<K> { return {id,kind}; }
export function literal(value: Value): Operand { return {literal:parseValue(value)}; }
export function slot(id: string): Operand { return {slot:id}; }
export function instruction<K extends Instruction['op']>(op: K, args: Omit<Extract<Instruction,{op: NoInfer<K>}>, 'op'>): Extract<Instruction,{op: K}> {
  const value = parseInstruction({...args,op});
  // A discriminant predicate retains the exact schema branch without exposing unchecked data.
  function isKind(i: Instruction): i is Extract<Instruction,{op: K}> { return i.op === op; }
  ensure(isKind(value),'OPCODE','Factory opcode mismatch'); return value;
}
export function set<K extends ValueKind>(at: string, dest: Variable<K>, value: Extract<Value,{kind:NoInfer<K>}>): Extract<Instruction,{op:'value.set'}> {
  ensure(dest.kind === value.kind,'VALUE_KIND',dest.id); return instruction('value.set',{at,dest:dest.id,value:literal(value)});
}
export function imagePut(at: string, id: string, asset: AssetRef<'image'>, position: Position, z=0): Extract<Instruction,{op:'stage.put'}> {
  ensure(asset.kind === 'image','ASSET_KIND',asset.id); return instruction('stage.put',{at,object:{id,asset:asset.id,position,z}});
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
  build(operations:OperationRegistry=emptyOperations): Program { return linkProgram(this.data,operations).copy(); }
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
  const s=slots.find(s=>s.id === operand.slot); ensure(s,'SLOT',operand.slot); return s.kind;
}
export function validateLinks(p: Program,operations:OperationRegistry=emptyOperations): void {
  const unique=(ids:string[],code:string)=>ensure(new Set(ids).size===ids.length,code,'Duplicate identity');
  unique(p.functions.map(f=>f.id),'FUNCTION_DUPLICATE'); unique(p.assets.map(a=>a.id),'ASSET_DUPLICATE');
  unique(p.functions.flatMap(f=>f.code.map(i=>i.at)),'ADDRESS_DUPLICATE');
  ensure(p.capabilities.every(c=>capabilities.some(s=>s===c)),'UNSUPPORTED_CAPABILITY',p.capabilities.join(','));
  const main=p.functions.find(f=>f.id === p.entry); ensure(main && !main.params.length && main.returns==='void','ENTRY','Entry must take no parameters and return void');
  for(const a of p.assets)ensure((a.kind==='image'&&a.mime.startsWith('image/'))||(a.kind==='audio'&&a.mime==='audio/wav'),'ASSET_KIND',a.id);
  for(const f of p.functions) {
    const slots=[...p.globals,...f.params,...f.locals]; unique(slots.map(s=>s.id),'SLOT_DUPLICATE');
    for(const s of slots)ensure(s.kind===s.initial.kind,'VALUE_KIND',s.id);
    const kind=(o:Operand)=>valueKind(o,slots);
    const target=(at:string)=>ensure(f.code.some(i=>i.at===at),'ADDRESS_SCOPE',`${f.id} -> ${at}`);
    const dest=(id:string,k:ValueKind)=>ensure(slots.find(s=>s.id===id)?.kind===k,'SLOT_KIND',id);
    target(f.entry); ensure(f.code.length>0,'FUNCTION_EMPTY',f.id);
    for(let index=0;index<f.code.length;index++) {
      const i=f.code[index]; ensure(i,'INSTRUCTION','missing');
      try {
      if(!['control.jump','control.branch','control.return','control.end'].includes(i.op))ensure(f.code[index+1],'FALLTHROUGH',i.at);
      switch(i.op) {
        case 'control.jump': target(i.target); break;
        case 'control.branch': ensure(kind(i.left)===kind(i.right),'COMPARE_KIND',i.at); ensure(i.cmp==='eq'||kind(i.left)!=='bool','COMPARE_KIND',i.at); target(i.yes); target(i.no); break;
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
        case 'stage.put': ensure(p.assets.find(a=>a.id===i.object.asset)?.kind==='image','ASSET_KIND',i.at); break;
        case 'extension.invoke': {const op=operations.get(i.operation,i.version);op.validateArgs(i.args,i.argsSchema);op.manifest.jumpTargets.forEach(target);break;}
        case 'audio.play': ensure(p.assets.find(a=>a.id===i.asset)?.kind==='audio','ASSET_KIND',i.at); break;
      }
      }catch(error){if(error instanceof GalboxError)throw new GalboxError(error.code,error.reason,{...error.location,address:i.at});throw error;}
    }
  }
}

