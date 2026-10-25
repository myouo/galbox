import { validateProgram, validateSnapshot, validateProfile, validateInstruction, validateValue, validateJsonValue, validateOperationOutcome, validateSavedInvocation, validateOperationResume, validateOperationWait, validateRestoreRecipe, validateSlotMetadata, validateStoreImport, validateProgressBatchWire, validateSourceMap, validatePortObligation, validateBehaviorMapping, validatePortableBackup, validateStoreBackupRestore, validateBackupRestoreReceipt, validateResourceBudget, validateResourceFact, validateReleaseManifest } from './generated/validators.js';
import type { Program, Snapshot, Profile, Instruction, Value, JsonValue, OperationOutcome, SavedInvocation, OperationResume, OperationWait, RestoreRecipe, SlotMetadata, StoreImport, ProgressBatchWire, SourceMap, PortObligation, BehaviorMapping, PortableBackup, StoreBackupRestore, BackupRestoreReceipt, ResourceBudget, ResourceFact, ReleaseManifest } from './generated/wire.js';
export type * from './generated/wire.js';
export { operationSpecs, recoveryOpcodes } from './generated/operations.js';
type JsonPrimitive = Extract<JsonValue,string|number|boolean|null>;
interface ReadonlyJsonArray extends ReadonlyArray<ReadonlyJsonValue> {}
interface ReadonlyJsonObject {readonly [key:string]:ReadonlyJsonValue;}
type ReadonlyJsonValue=JsonPrimitive|ReadonlyJsonArray|ReadonlyJsonObject;
type ReadonlyNode<T> = T extends string | number | boolean | bigint | symbol | null | undefined ? T : {readonly [K in keyof T]:DeepReadonly<T[K]>};
export type DeepReadonly<T> = [T] extends [string|number|boolean|bigint|symbol|null|undefined] ? T : [T] extends [JsonValue] ? [JsonValue] extends [T] ? ReadonlyJsonValue : ReadonlyNode<T> : ReadonlyNode<T>;
export class GalboxError extends Error {
  constructor(readonly code: string, readonly reason: string, readonly location?:{address?:string;path?:string}) { super(`${code}: ${reason}`); this.name = 'GalboxError'; }
}
export function ensure(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new GalboxError(code, message);
}
export function canonicalWireJSON(input:unknown):string {return JSON.stringify(detached(input),(_key:string,v:unknown)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,Reflect.get(v,k)])):v);}
function detached(input: unknown): unknown {
  let nodes=0;const ancestors=new Set<object>();
  function visit(value:unknown,depth:number):void {
    ensure(++nodes<=100000&&depth<=64,'INPUT_SIZE','JSON tree exceeds the supported bound');
    if(value===null||typeof value==='boolean'||typeof value==='string')return;
    if(typeof value==='number'){ensure(Number.isFinite(value),'INPUT_JSON','Non-finite number');return;}
    ensure(typeof value==='object','INPUT_JSON','Expected plain JSON');
    ensure(!ancestors.has(value),'INPUT_JSON','Cyclic JSON');
    ensure(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'INPUT_JSON','Expected plain JSON objects');
    const keys=Object.keys(value);if(Array.isArray(value))ensure(keys.length===value.length,'INPUT_JSON','Sparse/decorated arrays are unsupported');
    ancestors.add(value);
    for(const key of keys){const descriptor=Object.getOwnPropertyDescriptor(value,key);ensure(descriptor&&'value'in descriptor,'INPUT_JSON','Accessors are not wire data');visit(descriptor.value,depth+1);}
    ancestors.delete(value);
  }
  try {visit(input,0);const text=JSON.stringify(input);ensure(text&&text.length<=4_000_000,'INPUT_SIZE','At most 4 MB of finite JSON');return JSON.parse(text);}
  catch(error){if(error instanceof GalboxError)throw error;throw new GalboxError('INPUT_JSON','Expected plain acyclic JSON');}
}
export function parseProgram(input: unknown): Program {
  const data = detached(input);if(!validateProgram(data)){const path=validateProgram.errors?.find(e=>/\/functions\/\d+\/code\/\d+/.test(e.instancePath))?.instancePath??validateProgram.errors?.[0]?.instancePath??'';const address=rawInstructionAddress(data,path);throw new GalboxError('SCHEMA_PROGRAM',JSON.stringify(validateProgram.errors),{path,...(address?{address}:{})});}return data;
}
export function parseSnapshot(input: unknown): Snapshot {
  const data = detached(input); ensure(validateSnapshot(data), 'SCHEMA_SNAPSHOT', JSON.stringify(validateSnapshot.errors)); return data;
}
export function parseProfile(input: unknown): Profile {
  const data = detached(input); ensure(validateProfile(data), 'SCHEMA_PROFILE', JSON.stringify(validateProfile.errors)); return data;
}
export function parseInstruction(input: unknown): Instruction {
  const data = detached(input); ensure(validateInstruction(data), 'SCHEMA_INSTRUCTION', JSON.stringify(validateInstruction.errors)); return data;
}
export function parseValue(input: unknown): Value {
  const data = detached(input); ensure(validateValue(data), 'SCHEMA_VALUE', JSON.stringify(validateValue.errors)); return data;
}
export function i32(value: number): Extract<Value, {kind: 'i32'}> {
  ensure(Number.isInteger(value) && value >= -2147483648 && value <= 2147483647, 'I32_RANGE', `${value}`); return {kind: 'i32', value};
}
export function string(value: string): Extract<Value, {kind: 'string'}> { const v = parseValue({kind:'string',value}); ensure(v.kind === 'string','VALUE_KIND','string'); return v; }
export function bool(value: boolean): Extract<Value, {kind: 'bool'}> { ensure(typeof value==='boolean','BOOL_TYPE','Expected boolean');return {kind:'bool',value}; }
export function emptyProfile(): Profile { return {revision:0,values:{},read:[]}; }
export function readUnit(text: {textId: string; revision: string}): string {ensure(text&&typeof text.textId==='string'&&typeof text.revision==='string'&&[text.textId,text.revision].every(id=>/^[a-zA-Z][a-zA-Z0-9_.:/-]{0,127}$/.test(id)),'TEXT_IDENTITY','TextId/revision reserve @ as the ReadUnit separator');return `${text.textId}@${text.revision}`;}
export const capabilities = ['adv', 'stage.linear', 'audio.wav', 'tasks.all', 'profile','operations'] as const;

export function parseJsonValue(input:unknown):JsonValue {
  const data=detached(input);ensure(validateJsonValue(data),'SCHEMA_JSON','Invalid normalized JSON');return data;
}
export function parseOperationOutcome(input:unknown):OperationOutcome {const data=detached(input);ensure(validateOperationOutcome(data),'OPERATION_OUTPUT',JSON.stringify(validateOperationOutcome.errors));return data;}
export function parseSavedInvocation(input:unknown):SavedInvocation {const data=detached(input);ensure(validateSavedInvocation(data),'SAVED_INVOCATION',JSON.stringify(validateSavedInvocation.errors));return data;}
export function parseOperationResume(input:unknown):OperationResume {const data=detached(input);ensure(validateOperationResume(data),'OPERATION_RESUME',JSON.stringify(validateOperationResume.errors));return data;}
export function parseOperationWait(input:unknown):OperationWait {const data=detached(input);ensure(validateOperationWait(data),'OPERATION_WAIT',JSON.stringify(validateOperationWait.errors));return data;}
export {codec} from './codecs.js';
export type {ProtocolCodec,Decoded} from './codecs.js';

export function parseRestoreRecipe(input:unknown):RestoreRecipe {const data=detached(input);ensure(validateRestoreRecipe(data),'SCHEMA_RECIPE',JSON.stringify(validateRestoreRecipe.errors));return data;}

export function parseSlotMetadata(input:unknown):SlotMetadata {const data=detached(input);ensure(validateSlotMetadata(data),'SCHEMA_SLOT_METADATA',JSON.stringify(validateSlotMetadata.errors));return data;}
export function parseStoreImport(input:unknown):StoreImport {const data=detached(input);ensure(validateStoreImport(data),'SCHEMA_STORE_IMPORT',JSON.stringify(validateStoreImport.errors));return data;}

export function parseProgressBatch(input:unknown):ProgressBatchWire {const data=detached(input);ensure(validateProgressBatchWire(data),'SCHEMA_PROGRESS_BATCH',JSON.stringify(validateProgressBatchWire.errors));return data;}

function rawInstructionAddress(data:unknown,path:string):string|undefined {const match=path.match(/\/functions\/(\d+)\/code\/(\d+)/);if(!match||data===null||typeof data!=='object'||!('functions'in data)||!Array.isArray(data.functions))return;const f:unknown=data.functions[Number(match[1])];if(f===null||typeof f!=='object'||!('code'in f)||!Array.isArray(f.code))return;const i:unknown=f.code[Number(match[2])];return i!==null&&typeof i==='object'&&'at'in i&&typeof i.at==='string'?i.at:undefined;}
export function parseSourceMap(input:unknown):SourceMap {const data=detached(input);ensure(validateSourceMap(data),'SCHEMA_SOURCE_MAP',JSON.stringify(validateSourceMap.errors));return data;}
export function parsePortObligation(input:unknown):PortObligation {const data=detached(input);ensure(validatePortObligation(data),'SCHEMA_OBLIGATION',JSON.stringify(validatePortObligation.errors));return data;}
export function parseBehaviorMapping(input:unknown):BehaviorMapping {const data=detached(input);ensure(validateBehaviorMapping(data),'SCHEMA_MAPPING',JSON.stringify(validateBehaviorMapping.errors));return data;}

export function parsePortableBackup(input:unknown):PortableBackup {const data=detached(input);ensure(validatePortableBackup(data),'SCHEMA_BACKUP',JSON.stringify(validatePortableBackup.errors));return data;}
export function parseStoreBackupRestore(input:unknown):StoreBackupRestore {const data=detached(input);ensure(validateStoreBackupRestore(data),'SCHEMA_BACKUP_RESTORE',JSON.stringify(validateStoreBackupRestore.errors));return data;}
export function parseBackupRestoreReceipt(input:unknown):BackupRestoreReceipt {const data=detached(input);ensure(validateBackupRestoreReceipt(data),'SCHEMA_BACKUP_RECEIPT',JSON.stringify(validateBackupRestoreReceipt.errors));return data;}

export function parseResourceBudget(input:unknown):ResourceBudget {const data=detached(input);ensure(validateResourceBudget(data),'RESOURCE_BUDGET_SCHEMA',JSON.stringify(validateResourceBudget.errors));return data;}

export function parseResourceFact(input:unknown):ResourceFact {const data=detached(input);ensure(validateResourceFact(data),'RESOURCE_FACT_SCHEMA',JSON.stringify(validateResourceFact.errors));return data;}

export function parseReleaseManifest(input:unknown):ReleaseManifest {const data=detached(input);ensure(validateReleaseManifest(data),'RELEASE_SCHEMA',JSON.stringify(validateReleaseManifest.errors));return data;}
