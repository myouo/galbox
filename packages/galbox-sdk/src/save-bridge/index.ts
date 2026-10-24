import {ensure,GalboxError,parseProfile,parseSnapshot,parseProgram} from '../protocol/index.js';
import type {DeepReadonly,Program,Snapshot,Profile,SchemaRef} from '../protocol/index.js';
import {assertCodec,freezeJson,schemaEqual} from '../protocol/codecs.js';
import type {ProtocolCodec} from '../protocol/codecs.js';
import {linkProgram} from '../program-tools/linker.js';
import {validateRestore} from '../core/index.js';
import {emptyOperations} from '../core/operations.js';
import type {OperationRegistry} from '../core/operations.js';

export interface OriginalSaveFile {readonly name:string;readonly bytes:Uint8Array;}
export interface FormatContext {digest(bytes:Uint8Array):Promise<Uint8Array>;decodeUtf8(bytes:Uint8Array):string;}
export interface Failure {readonly status:'needs-input'|'unsupported';readonly code:string;readonly message:string;}
export type DecodeResult<S>={readonly status:'ready';readonly state:S}|Failure;
export interface SaveSource<Key extends string,Schema extends string,S> {readonly key:Key;readonly schema:ProtocolCodec<S,Schema>;readonly validate:(state:S)=>S;}
export interface DecodedOriginal<Key extends string,Schema extends string,Version extends number,S> {readonly sourceKey:Key;readonly schema:Readonly<SchemaRef>&{readonly id:Schema};readonly codecVersion:Version;readonly state:DeepReadonly<S>;}
export interface OriginalSaveCodec<Key extends string,Schema extends string,Version extends number,S> {readonly source:SaveSource<Key,Schema,S>;readonly version:Version;decode(files:readonly OriginalSaveFile[],context:FormatContext):Promise<DecodedOriginal<Key,Schema,Version,S>|Failure>;}
export interface ImportPayload {snapshot:Snapshot;profile:Profile;}
export interface MappedImport {readonly grade:'exact'|'semantic'|'checkpoint';readonly payload:ImportPayload;readonly warnings:readonly string[];}
export interface SaveMapping<Key extends string,Schema extends string,Version extends number,S> {
  readonly id:string;readonly version:number;readonly codec:OriginalSaveCodec<Key,Schema,Version,S>;readonly target:Readonly<{gameId:string;release:string}>;
  convert(decoded:DecodedOriginal<Key,Schema,Version,S>,program:Program):MappedImport|Failure;
}
export interface ConversionReport {readonly status:'ready';readonly grade:MappedImport['grade'];readonly sourceKey:string;readonly sourceSchema:Readonly<SchemaRef>;readonly codecVersion:number;readonly mapping:string;readonly mappingVersion:number;readonly target:Readonly<{gameId:string;release:string}>;readonly files:readonly {readonly name:string;readonly sha256:string}[];readonly warnings:readonly string[];}
const planBrand:unique symbol=Symbol('PreparedImport');
export interface PreparedImport {readonly [planBrand]:true;report():ConversionReport;}
export type PrepareResult={readonly status:'ready';readonly plan:PreparedImport}|Failure;
const sources=new WeakSet<object>(),codecs=new WeakSet<object>(),mappings=new WeakSet<object>(),bindings=new WeakSet<object>();
const decodedSources=new WeakMap<object,object>();
const plans=new WeakMap<PreparedImport,{payload:ImportPayload;signature:string;report:ConversionReport;operations:OperationRegistry}>();
export function defineSaveSource<const Key extends string,const Schema extends string,S>(key:Key,schema:ProtocolCodec<S,Schema>):SaveSource<Key,Schema,S> {
  assertCodec(schema);ensure(/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/.test(key),'SAVE_SOURCE_KEY',key);const source=Object.freeze({key,schema,validate:(state:S)=>schema.parse(state)});sources.add(source);return source;
}
function copyFiles(files:readonly OriginalSaveFile[]):OriginalSaveFile[] {
  ensure(Array.isArray(files)&&files.length<=16,'SAVE_PACKAGE_SIZE','At most sixteen named files');let total=0;const names=new Set<string>();
  return files.map(file=>{ensure(/^[a-zA-Z0-9_.-]{1,128}$/.test(file.name)&&!names.has(file.name),'SAVE_FILE_NAME',file.name);names.add(file.name);ensure(file.bytes instanceof Uint8Array,'SAVE_BYTES',file.name);total+=file.bytes.length;ensure(file.bytes.length<=4_000_000&&total<=8_000_000,'SAVE_PACKAGE_SIZE','Package exceeds byte limit');return {name:file.name,bytes:new Uint8Array(file.bytes)};});
}
function formatContext(context:FormatContext):FormatContext {
  return {async digest(input){const result=await context.digest(new Uint8Array(input));ensure(result instanceof Uint8Array&&result.length===32,'SAVE_DIGEST_PORT','Expected SHA-256 bytes');return new Uint8Array(result);},decodeUtf8(input){return context.decodeUtf8(new Uint8Array(input));}};
}
export function defineSaveCodec<Key extends string,Schema extends string,S,const Version extends number>(source:SaveSource<Key,Schema,S>,spec:{readonly version:Version;readonly decode:(files:readonly OriginalSaveFile[],context:FormatContext)=>Promise<DecodeResult<NoInfer<S>>>}):OriginalSaveCodec<Key,Schema,Version,S> {
  ensure(sources.has(source)&&Number.isInteger(spec.version)&&spec.version>0,'SAVE_CODEC_FACTORY','Expected a source factory and positive version');const {version,decode}=spec;
  const codec:OriginalSaveCodec<Key,Schema,Version,S>={source,version,async decode(files,context){
    const result=await decode(copyFiles(files),formatContext(context));if(result.status!=='ready'){ensure(result.status==='needs-input'||result.status==='unsupported','SAVE_DECODE_RESULT','Invalid status');ensure(typeof result.code==='string'&&typeof result.message==='string','SAVE_DECODE_RESULT','Invalid diagnostic');return Object.freeze({...result});}
    const decoded=Object.freeze({sourceKey:source.key,schema:source.schema.identity,codecVersion:version,state:freezeJson(source.schema.parse(result.state))});decodedSources.set(decoded,codec);return decoded;
  }};codecs.add(codec);return Object.freeze(codec);
}
export function defineSaveMapping<Key extends string,Schema extends string,Version extends number,S>(codec:OriginalSaveCodec<Key,Schema,Version,S>,spec:{readonly id:string;readonly version:number;readonly target:{gameId:string;release:string};readonly convert:(state:DeepReadonly<NoInfer<S>>,program:DeepReadonly<Program>)=>MappedImport|Failure}):SaveMapping<Key,Schema,Version,S> {
  ensure(codecs.has(codec)&&Number.isInteger(spec.version)&&spec.version>0,'SAVE_MAPPING_FACTORY','Expected a codec factory');const {id,version,convert}=spec,target=Object.freeze({...spec.target});
  const mapping:SaveMapping<Key,Schema,Version,S>={id,version,codec,target,convert(decoded,program){
    ensure(decodedSources.get(decoded)===codec&&decoded.sourceKey===codec.source.key&&decoded.codecVersion===codec.version&&schemaEqual(decoded.schema,codec.source.schema.identity),'SAVE_SOURCE_IDENTITY','Decoded state belongs to another codec');
    ensure(program.gameId===target.gameId&&program.release===target.release,'SAVE_TARGET','Target edition/release mismatch');return convert(decoded.state,freezeJson(parseProgram(program)));
  }};mappings.add(mapping);return Object.freeze(mapping);
}
export interface CompatibilityBinding<Key extends string=string,Schema extends string=string,Version extends number=number,S=unknown> {readonly sourceKey:Key;readonly schema:Schema;readonly codecVersion:Version;readonly mapping:string;prepare(files:readonly OriginalSaveFile[],context:FormatContext,program:unknown,operations?:OperationRegistry):Promise<PrepareResult>;}
function canonicalProgram(program:Program):string {
  return JSON.stringify(program,(_key:string,value:unknown)=>value!==null&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,Reflect.get(value,k)])):value);
}
function reportCopy(report:ConversionReport):ConversionReport {return {...report,sourceSchema:{...report.sourceSchema},target:{...report.target},files:report.files.map(f=>({...f})),warnings:[...report.warnings]};}
export function bindOriginalSave<Key extends string,Schema extends string,Version extends number,S>(codec:OriginalSaveCodec<Key,Schema,Version,S>,mapping:SaveMapping<NoInfer<Key>,NoInfer<Schema>,NoInfer<Version>,NoInfer<S>>):CompatibilityBinding<Key,Schema,Version,S> {
  ensure(codecs.has(codec)&&mappings.has(mapping)&&mapping.codec===codec,'SAVE_BINDING_IDENTITY','Codec/schema/source/version must match the mapping factory');
  const binding:CompatibilityBinding<Key,Schema,Version,S>={sourceKey:codec.source.key,schema:codec.source.schema.identity.id,codecVersion:codec.version,mapping:mapping.id,async prepare(input,context,target,operations=emptyOperations){
    try {
      const files=copyFiles(input),program=linkProgram(target,operations).copy(),port=formatContext(context);
      const decoded=await codec.decode(files,port);if('status'in decoded)return decoded;
      const mapped=mapping.convert(decoded,program);if('status'in mapped){ensure((mapped.status==='needs-input'||mapped.status==='unsupported')&&typeof mapped.code==='string'&&typeof mapped.message==='string','SAVE_MAPPING_RESULT','Invalid diagnostic');return Object.freeze({...mapped});}
      ensure(['exact','semantic','checkpoint'].includes(mapped.grade)&&Array.isArray(mapped.warnings)&&mapped.warnings.length<=64&&mapped.warnings.every(w=>typeof w==='string'),'IMPORT_REPORT','Invalid mapping grade/warnings');
      const payload={snapshot:validateRestore(program,mapped.payload.snapshot,operations),profile:parseProfile(mapped.payload.profile)};
      const fingerprints=[];for(const file of files)fingerprints.push({name:file.name,sha256:Array.from(await port.digest(file.bytes),b=>b.toString(16).padStart(2,'0')).join('')});
      const report:ConversionReport={status:'ready',grade:mapped.grade,sourceKey:codec.source.key,sourceSchema:{...codec.source.schema.identity},codecVersion:codec.version,mapping:mapping.id,mappingVersion:mapping.version,target:{...mapping.target},files:fingerprints,warnings:[...mapped.warnings]};
      const plan:PreparedImport=Object.freeze({[planBrand]:true as const,report(){return reportCopy(report);}});plans.set(plan,{payload,signature:canonicalProgram(program),report,operations});return {status:'ready',plan};
    }catch(error){return {status:'unsupported',code:error instanceof GalboxError?error.code:'SAVE_PREPARE_FAILED',message:error instanceof Error?error.message:String(error)};}
  }};bindings.add(binding);return Object.freeze(binding);
}
export function materializeImport(plan:PreparedImport,program:unknown,operations:OperationRegistry=emptyOperations):ImportPayload {
  const data=plans.get(plan);ensure(data,'IMPORT_PLAN','Expected a prepared import handle');const target=linkProgram(program,operations).copy();ensure(data.operations===operations&&canonicalProgram(target)===data.signature,'IMPORT_PLAN_STALE','Target changed after preparation');return {snapshot:validateRestore(target,data.payload.snapshot,operations),profile:parseProfile(data.payload.profile)};
}
export class SaveBindingRegistry {
  private readonly entries:ReadonlyMap<string,CompatibilityBinding>;
  constructor(input:readonly CompatibilityBinding[]){const entries=new Map<string,CompatibilityBinding>();for(const binding of input){ensure(bindings.has(binding),'SAVE_BINDING_FACTORY','Use bindOriginalSave');const key=`${binding.sourceKey}/${binding.schema}@${binding.codecVersion}`;ensure(!entries.has(key),'SAVE_BINDING_DUPLICATE',key);entries.set(key,binding);}this.entries=entries;Object.freeze(this);}
  get(sourceKey:string,schema:string,version:number):CompatibilityBinding {const value=this.entries.get(`${sourceKey}/${schema}@${version}`);ensure(value,'SAVE_BINDING_UNSUPPORTED','Unknown source/schema/codec');return value;}
}
export function createSaveBindingRegistry(bindings:readonly CompatibilityBinding[]):SaveBindingRegistry {return new SaveBindingRegistry(bindings);}
