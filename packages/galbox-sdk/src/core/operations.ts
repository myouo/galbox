import { ensure, parseInstruction, parseJsonValue, parseOperationOutcome, parseSavedInvocation, parseOperationWait, parseProfile, parseValue } from '../protocol/index.js';
import type { DeepReadonly, JsonValue, Value, Profile, SchemaRef, OperationAction, OperationEffect, OperationOutcome, OperationWait, SavedInvocation, Instruction, OperationResume } from '../protocol/index.js';
import { assertCodec, freezeJson, schemaEqual, acceptsFieldLiteral } from '../protocol/codecs.js';
import type { ProtocolCodec } from '../protocol/codecs.js';

export interface ResumeMessage { readonly kind:string; }
export interface OperationContext { readonly globals:Readonly<Record<string,DeepReadonly<Value>>>;readonly profile:DeepReadonly<Profile>; }
export type OperationInput<A,R> = {readonly kind:'start';readonly args:DeepReadonly<A>} | {readonly kind:'resume';readonly event:DeepReadonly<R>;readonly args:DeepReadonly<A>};
export type SerializableWait<R extends ResumeMessage, Id extends string> = Omit<OperationWait,'resumeKind'|'schema'> & {resumeKind:R['kind'];schema:{id:Id;signature:string}};
export type OperationFlow<R extends ResumeMessage, Id extends string> = {kind:'continue'} | {kind:'jump';target:string} | {kind:'wait';wait:SerializableWait<R,Id>};
export interface OperationResult<S,R extends ResumeMessage,Id extends string> {state:S;actions:readonly OperationAction[];effects:readonly OperationEffect[];flow:OperationFlow<R,Id>;}
export type InvocationData<A,S,R extends ResumeMessage,Id extends string> = {args:A;state:S;phase:'waiting'|'completed';wait:SerializableWait<R,Id>|null};
export type TypedInvocation<A,S,R extends ResumeMessage,Id extends string> = Omit<SavedInvocation,'args'|'state'|'wait'> & InvocationData<A,S,R,Id>;
export interface OperationManifest<R extends ResumeMessage> {readonly implementation:string;readonly save:'safe'|'forbid';readonly restore:'continue'|'reject';readonly resumeKinds:readonly R['kind'][];readonly jumpTargets:readonly string[];readonly recipe:boolean;}
export interface OperationSpec<Id extends string,A,S,R extends ResumeMessage,AI extends string,SI extends string,RI extends string> {
  readonly id:Id;readonly version:number;readonly args:ProtocolCodec<A,AI>;readonly state:ProtocolCodec<S,SI>;readonly resume:ProtocolCodec<R,RI>;readonly manifest:OperationManifest<NoInfer<R>>;
  readonly initialize:(args:DeepReadonly<NoInfer<A>>,context:OperationContext)=>NoInfer<S>;
  readonly reduce:(input:OperationInput<NoInfer<A>,NoInfer<R>>,state:DeepReadonly<NoInfer<S>>,context:OperationContext)=>OperationResult<NoInfer<S>,NoInfer<R>,NoInfer<RI>>;
  readonly migrateState?:(oldVersion:number,state:unknown)=>NoInfer<S>;
}
export interface RuntimeOperation {
  readonly id:string;readonly version:number;readonly argsSchema:Readonly<SchemaRef>;readonly stateSchema:Readonly<SchemaRef>;readonly resumeSchema:Readonly<SchemaRef>;
  readonly manifest:OperationManifest<ResumeMessage>;
  instruction(at:string,args:unknown):Instruction;
  validateArgs(args:unknown,schema:Readonly<SchemaRef>):JsonValue;
  validateSaved(saved:unknown):SavedInvocation;
  start(args:unknown,context:OperationContext):OperationOutcome;
  resume(saved:SavedInvocation,event:unknown,context:OperationContext):OperationOutcome;
  migrateState(saved:SavedInvocation):SavedInvocation;
}
export interface OperationDefinition<Id extends string,A,S,R extends ResumeMessage,RI extends string> extends RuntimeOperation {
  readonly id:Id;
  invocation(at:string,args:NoInfer<A>):Instruction;
  readSaved(saved:unknown):TypedInvocation<A,S,R,RI>;
  encodeInvocation(original:SavedInvocation,data:InvocationData<NoInfer<A>,NoInfer<S>,NoInfer<R>,NoInfer<RI>>):SavedInvocation;
  result(wait:Readonly<OperationWait>,invocation:string,event:NoInfer<R>):OperationResume;
}
const definitions=new WeakSet<object>();
const trustedMigrations=new WeakSet<object>();
export function waitFor<R extends ResumeMessage,const Id extends string>(resume:ProtocolCodec<R,Id>,kind:NoInfer<R['kind']>,request:string):SerializableWait<R,Id> {
  assertCodec(resume);const value={resumeKind:kind,schema:{...resume.identity},request,attempt:1};parseOperationWait(value);return value;
}
export function operationContext(globals:Record<string,Value>,profile:Profile):OperationContext {
  return freezeJson({globals:Object.fromEntries(Object.entries(globals).map(([k,v])=>[k,parseValue(v)])),profile:parseProfile(profile)});
}
export function defineOperation<const Id extends string,A,S,R extends ResumeMessage,const AI extends string,const SI extends string,const RI extends string>(spec:OperationSpec<Id,A,S,R,AI,SI,RI>):OperationDefinition<Id,A,S,R,RI> {
  const {id,version,args,state,resume,initialize,reduce}=spec;
  [args,state,resume].forEach(assertCodec);
  ensure(/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/.test(id)&&Number.isInteger(version)&&version>0,'OPERATION_ID',id);
  const manifest=Object.freeze({...spec.manifest,resumeKinds:Object.freeze([...spec.manifest.resumeKinds]),jumpTargets:Object.freeze([...spec.manifest.jumpTargets])});
  ensure(['safe','forbid'].includes(manifest.save)&&['continue','reject'].includes(manifest.restore)&&typeof manifest.recipe==='boolean','OPERATION_MANIFEST',id);
  ensure(new Set(manifest.resumeKinds).size===manifest.resumeKinds.length&&new Set(manifest.jumpTargets).size===manifest.jumpTargets.length,'OPERATION_MANIFEST','Duplicate resume/jump identity');
  ensure(manifest.resumeKinds.every(kind=>acceptsFieldLiteral(resume,'kind',kind)),'OPERATION_RESUME_KIND','Manifest kind is absent from the resume codec');
  const migrate=spec.migrateState;
  function checkedWait(input:OperationWait|null):SerializableWait<R,RI>|null {
    if(input===null)return null;
    ensure(schemaEqual(input.schema,resume.identity),'OPERATION_WAIT_SCHEMA',id);
    const kind=manifest.resumeKinds.find(k=>k===input.resumeKind);ensure(kind,'OPERATION_WAIT_KIND',input.resumeKind);
    return {...parseOperationWait(input),resumeKind:kind,schema:{...resume.identity}};
  }
  function outcome(input:OperationResult<S,R,RI>):OperationOutcome {
    const data=parseOperationOutcome(input);state.parse(data.state);
    if(data.flow.kind==='wait')checkedWait(data.flow.wait);
    if(data.flow.kind==='jump')ensure(manifest.jumpTargets.includes(data.flow.target),'OPERATION_JUMP',data.flow.target);
    return data;
  }
  function readSaved(input:unknown):TypedInvocation<A,S,R,RI> {
    const saved=parseSavedInvocation(input);
    ensure(saved.operation===id&&saved.version===version&&saved.implementation===manifest.implementation,'OPERATION_VERSION',id);
    ensure(schemaEqual(saved.argsSchema,args.identity)&&schemaEqual(saved.stateSchema,state.identity)&&schemaEqual(saved.resumeSchema,resume.identity),'OPERATION_SCHEMA',id);
    const wait=checkedWait(saved.wait);ensure((saved.phase==='waiting')===(wait!==null),'OPERATION_PHASE',id);
    return {...saved,args:args.parse(saved.args),state:state.parse(saved.state),wait};
  }
  const definition:OperationDefinition<Id,A,S,R,RI>={
    id,version,argsSchema:args.identity,stateSchema:state.identity,resumeSchema:resume.identity,manifest,
    instruction(at,input){return parseInstruction({at,op:'extension.invoke',operation:id,version,argsSchema:{...args.identity},args:args.parse(input)});},
    invocation(at,input){return definition.instruction(at,input);},
    validateArgs(input,schema){ensure(schemaEqual(schema,args.identity),'OPERATION_ARGS_SCHEMA',id);return parseJsonValue(args.parse(input));},
    validateSaved(input){readSaved(input);return parseSavedInvocation(input);},readSaved,
    start(input,context){const a=freezeJson(args.parse(input));const initial=freezeJson(state.parse(initialize(a,context)));return outcome(reduce({kind:'start',args:a},initial,context));},
    resume(input,event,context){const saved=readSaved(input);const data=resume.parse(event);ensure(saved.wait&&data.kind===saved.wait.resumeKind,'OPERATION_RESUME_KIND',id);return outcome(reduce({kind:'resume',args:freezeJson(saved.args),event:freezeJson(data)},freezeJson(saved.state),context));},
    encodeInvocation(original,data){const next=parseSavedInvocation({...original,version,implementation:manifest.implementation,argsSchema:{...args.identity},stateSchema:{...state.identity},resumeSchema:{...resume.identity},args:args.parse(data.args),state:state.parse(data.state),phase:data.phase,wait:data.wait?{...data.wait,attempt:original.wait?.attempt??data.wait.attempt}:null});readSaved(next);return next;},
    migrateState(input){
      ensure(migrate&&input.operation===id&&schemaEqual(input.argsSchema,args.identity)&&schemaEqual(input.resumeSchema,resume.identity),'INVOCATION_MIGRATION_REQUIRED',id);
      return definition.encodeInvocation(input,{args:args.parse(input.args),state:migrate(input.version,parseJsonValue(input.state)),phase:input.phase,wait:checkedWait(input.wait)});
    },
    result(wait,invocation,event){ensure(schemaEqual(wait.schema,resume.identity),'OPERATION_RESUME_SCHEMA',id);const data=resume.parse(event);ensure(data.kind===wait.resumeKind,'OPERATION_RESUME_KIND',id);return {type:'operation',invocation,request:wait.request,attempt:wait.attempt,schema:{...resume.identity},data:parseJsonValue(data)};}
  };
  // Schema validation also bounds the implementation identity, independent of TS callers.
  parseSavedInvocation({id:'validation',operation:id,version,implementation:manifest.implementation,at:'validation',frameDepth:1,argsSchema:args.identity,stateSchema:state.identity,resumeSchema:resume.identity,args:null,state:null,phase:'completed',wait:null});
  definitions.add(definition);return Object.freeze(definition);
}
export interface InvocationMigration {readonly from:RuntimeOperation;readonly to:RuntimeOperation;apply(saved:SavedInvocation):SavedInvocation;}
export function defineInvocationMigration<FI extends string,FA,FS,FR extends ResumeMessage,FRI extends string,TA,TS,TR extends ResumeMessage,TRI extends string>(
  from:OperationDefinition<FI,FA,FS,FR,FRI>,to:OperationDefinition<NoInfer<FI>,TA,TS,TR,TRI>,migrate:(saved:DeepReadonly<TypedInvocation<NoInfer<FA>,NoInfer<FS>,NoInfer<FR>,NoInfer<FRI>>>)=>InvocationData<NoInfer<TA>,NoInfer<TS>,NoInfer<TR>,NoInfer<TRI>>
):InvocationMigration {
  ensure(definitions.has(from)&&definitions.has(to)&&from.id===to.id&&from.version!==to.version,'INVOCATION_MIGRATION','Expected two registered versions of the same operation');
  const result=Object.freeze({from,to,apply(saved:SavedInvocation){return to.encodeInvocation(saved,migrate(freezeJson(from.readSaved(saved))));}});trustedMigrations.add(result);return result;
}
export class OperationRegistry {
  private readonly entries:ReadonlyMap<string,RuntimeOperation>;
  private readonly migrations:readonly InvocationMigration[];
  constructor(operations:readonly RuntimeOperation[],migrations:readonly InvocationMigration[]=[]) {
    const entries=new Map<string,RuntimeOperation>(),schemas=new Map<string,string>();
    for(const op of operations){
      ensure(definitions.has(op),'OPERATION_FACTORY','Use defineOperation');const key=`${op.id}@${op.version}`;ensure(!entries.has(key),'OPERATION_DUPLICATE',key);
      for(const schema of [op.argsSchema,op.stateSchema,op.resumeSchema]){const previous=schemas.get(schema.id);ensure(previous===undefined||previous===schema.signature,'CODEC_ID_CONFLICT',schema.id);schemas.set(schema.id,schema.signature);}
      entries.set(key,op);
    }
    const migrationKeys=new Set<string>();
    for(const migration of migrations){ensure(trustedMigrations.has(migration),'MIGRATION_FACTORY','Use defineInvocationMigration');const key=`${migration.from.id}@${migration.from.version}->${migration.to.version}`;ensure(!migrationKeys.has(key),'MIGRATION_DUPLICATE',key);migrationKeys.add(key);ensure(entries.get(`${migration.to.id}@${migration.to.version}`)===migration.to,'MIGRATION_TARGET',key);}
    this.entries=entries;this.migrations=Object.freeze([...migrations]);Object.freeze(this);
  }
  get(id:string,version:number):RuntimeOperation {const value=this.entries.get(`${id}@${version}`);ensure(value,'UNSUPPORTED_OPERATION',`${id}@${version}`);return value;}
  restore(saved:SavedInvocation,target:Extract<Instruction,{op:'extension.invoke'}>):SavedInvocation {
    ensure(saved.operation===target.operation,'RESTORE_INVOCATION','Operation changed');const op=this.get(target.operation,target.version);
    if(saved.version===op.version)return op.validateSaved(saved);
    const migration=this.migrations.find(m=>m.from.id===saved.operation&&m.from.version===saved.version&&m.to===op);
    const migrated=migration?migration.apply(parseSavedInvocation(saved)):op.migrateState(parseSavedInvocation(saved));
    return op.validateSaved(migrated);
  }
}
export function createOperationRegistry(operations:readonly RuntimeOperation[],migrations:readonly InvocationMigration[]=[]):OperationRegistry {return new OperationRegistry(operations,migrations);}
export const emptyOperations=createOperationRegistry([]);
