import {isModuleProgram} from '../program-tools/module-program.js';
import type {ModuleProgram} from '../program-tools/module-program.js';
import {detached} from '../protocol/wire-input.js';
import {ensure,GalboxError,parseSnapshot,parseProfile,canonicalWireJSON} from '../protocol/index.js';
import type {Snapshot,Profile,Program,DeepReadonly} from '../protocol/index.js';
import {freezeJson} from '../protocol/codecs.js';
import {linkProgram} from '../program-tools/linker.js';
import {validateRestore} from '../core/index.js';
import {emptyOperations} from '../core/operations.js';
import type {OperationRegistry} from '../core/operations.js';
import type {Cancellation} from '../runtime/stream-ports.js';
import {storageNamespace} from '../runtime/backup.js';
const token:unique symbol=Symbol('saved-game-migration');
export interface SavedGameMigration {readonly [token]:true;readonly id:string;readonly fromRelease:string;readonly toRelease:string;}
export interface SavedGameMigrationInput {readonly source:DeepReadonly<Program>;readonly target:DeepReadonly<Program>;readonly snapshot:DeepReadonly<Snapshot>;readonly profile:DeepReadonly<Profile>;readonly cancellation:Cancellation;readonly sourceModules?:ModuleProgram;readonly targetModules?:ModuleProgram;}
export interface SavedGameMigrationOutput {readonly snapshot:Snapshot;readonly readAliases?:readonly {readonly from:string;readonly to:string}[];}
export interface SavedGameMigrationDefinition {id:string;gameId:string;series:string;fromRelease:string;toRelease:string;sourceProgram:(cancellation:Cancellation)=>unknown|Promise<unknown>;migrate:(input:SavedGameMigrationInput)=>SavedGameMigrationOutput|Promise<SavedGameMigrationOutput>;prepareSourceModules?:(source:ModuleProgram,modules:readonly string[],cancellation:Cancellation)=>Promise<void>;sourceOperations?:OperationRegistry;requiredFunctions?:readonly string[];}
const definitions=new WeakMap<SavedGameMigration,Readonly<SavedGameMigrationDefinition>>();
export function defineSavedGameMigration(input:SavedGameMigrationDefinition):SavedGameMigration {
 const id=/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/;
 ensure([input.id,input.fromRelease,input.toRelease].every(v=>typeof v==='string'&&id.test(v))&&input.fromRelease!==input.toRelease,'SAVE_MIGRATION_ID','Expected explicit distinct release identities');storageNamespace(input.gameId,input.series);
 ensure(typeof input.sourceProgram==='function'&&typeof input.migrate==='function'&&(input.prepareSourceModules===undefined||typeof input.prepareSourceModules==='function'),'SAVE_MIGRATION_FACTORY','Source provider and complete migration required');
 ensure(input.requiredFunctions===undefined||Array.isArray(input.requiredFunctions)&&input.requiredFunctions.length<=256&&input.requiredFunctions.every(f=>typeof f==='string'&&id.test(f)),'SAVE_MIGRATION_FUNCTION','Expected bounded target function identities');const required=input.requiredFunctions===undefined?{}:{requiredFunctions:Object.freeze([...input.requiredFunctions])};
 const handle=Object.freeze({[token]:true as const,id:input.id,fromRelease:input.fromRelease,toRelease:input.toRelease});definitions.set(handle,Object.freeze({...input,...required}));return handle;
}
export function bindSavedGameMigrations(input:readonly SavedGameMigration[],program:Program,series:string,functions:readonly string[]=program.functions.map(f=>f.id)):readonly SavedGameMigration[]{
 ensure(input.length<=32,'SAVE_MIGRATION_LIMIT','At most 32 source editions');const releases=new Set<string>();
 for(const handle of input){const d=definitions.get(handle);ensure(d&&d.gameId===program.gameId&&d.series===series&&d.toRelease===program.release,'SAVE_MIGRATION_TARGET','Use a factory bound to this game, series and target release');ensure(!releases.has(d.fromRelease),'SAVE_MIGRATION_DUPLICATE','Ambiguous source edition');ensure((d.requiredFunctions??[]).length<=256&&(d.requiredFunctions??[]).every(id=>functions.includes(id)),'SAVE_MIGRATION_FUNCTION','Declare existing target functions');releases.add(d.fromRelease);}
 return Object.freeze([...input]);
}
export function savedGameMigrationFunctions(handle:SavedGameMigration):readonly string[]{const d=definitions.get(handle);ensure(d,'SAVE_MIGRATION_FACTORY','Use a migration factory');return [...d.requiredFunctions??[]];}
function units(p:DeepReadonly<Program>):Set<string>{return new Set(p.functions.flatMap(f=>f.code.flatMap(i=>i.op==='text.page'||i.op==='text.rich'||i.op==='text.template'?[i.textId+'@'+i.revision]:[])));}
async function cancellable<T>(work:T|Promise<T>,cancel:Cancellation):Promise<T>{
 let release=()=>{};const aborted=new Promise<never>((_resolve,reject)=>{release=cancel.onCancel(()=>reject(new GalboxError('SAVE_MIGRATION_CANCELLED','Migration superseded')));});
 try{return await Promise.race([Promise.resolve(work),aborted]);}finally{release();}
}
export async function migrateSavedGame(handle:SavedGameMigration,program:Program,snapshot:Snapshot,profile:Profile,cancellation:Cancellation,operations=emptyOperations,modules?:ModuleProgram,prepareTargetModules?:(ids:readonly string[],cancellation:Cancellation)=>Promise<void>):Promise<{snapshot:Snapshot;reads:string[]}> {
 const d=definitions.get(handle);ensure(d&&d.gameId===program.gameId&&d.toRelease===program.release&&d.fromRelease===snapshot.release,'SAVE_MIGRATION_IDENTITY','Migration does not match this saved game');
 const check=()=>ensure(!cancellation.cancelled,'SAVE_MIGRATION_CANCELLED','Migration superseded');check();
 const provided=await cancellable(d.sourceProgram(cancellation),cancellation);check();const sourceModules=isModuleProgram(provided)?provided:null,sourceOperations=d.sourceOperations??emptyOperations;let source:Program;
 if(sourceModules){const header=sourceModules.describe().header;ensure(header.gameId===d.gameId&&header.release===d.fromRelease,'SAVE_MIGRATION_SOURCE','Source module identity differs');const ids=sourceModules.binding(snapshot);if(ids.some(id=>!sourceModules.has(id))){ensure(d.prepareSourceModules,'SAVE_MIGRATION_MODULE_SOURCE','Original module closure requires its loader');await cancellable(d.prepareSourceModules(sourceModules,ids,cancellation),cancellation);check();}source=sourceModules.program(ids,sourceOperations);}
 else source=linkProgram(provided,sourceOperations).copy();check();ensure(source.gameId===d.gameId&&source.release===d.fromRelease,'SAVE_MIGRATION_SOURCE','Source program identity differs');
 const old=validateRestore(sourceModules??source,snapshot,sourceOperations),ownedProfile=parseProfile(profile);
 const output=await cancellable(d.migrate(Object.freeze({source:freezeJson(source),target:freezeJson(modules?modules.program(modules.loaded()):linkProgram(program,operations).copy()),snapshot:freezeJson(old),profile:freezeJson(ownedProfile),cancellation,...(sourceModules?{sourceModules}:{}),...(modules?{targetModules:modules}:{})})),cancellation);check();
 // Reparse before inspecting; callback-owned aliases and snapshots never enter the live state.
 const data=detached(output);ensure(data&&typeof data==='object'&&!Array.isArray(data)&&Object.keys(data).every(k=>k==='snapshot'||k==='readAliases'),'SAVE_MIGRATION_RESULT','Unexpected migration result');
 const draft=parseSnapshot(Reflect.get(data,'snapshot'));if(modules){const ids=modules.binding(draft);if(ids.some(id=>!modules.has(id))){ensure(prepareTargetModules,'SAVE_MIGRATION_MODULE_TARGET','Mapped closure requires target code');await cancellable(prepareTargetModules(ids,cancellation),cancellation);check();}}const candidate=validateRestore(modules??program,draft,operations);ensure(!candidate.replayScene&&!old.replayScene,'SAVE_MIGRATION_REPLAY','Gallery snapshots are temporary');
 const aliases=Reflect.get(data,'readAliases')??[];ensure(Array.isArray(aliases)&&aliases.length<=10000,'SAVE_MIGRATION_READS','Read aliases must be bounded');const from=units(source),to=units(modules?modules.program(modules.loaded()):program),seen=new Set<string>(),reads=new Set<string>();
 for(const pair of aliases){ensure(pair&&typeof pair==='object'&&!Array.isArray(pair)&&Object.keys(pair).length===2&&typeof pair.from==='string'&&typeof pair.to==='string'&&from.has(pair.from)&&to.has(pair.to)&&!seen.has(pair.from),'SAVE_MIGRATION_READS','Aliases must name declared source and target read units');seen.add(pair.from);if(profile.read.includes(pair.from)&&!profile.read.includes(pair.to))reads.add(pair.to);}
 // Callback cannot restore its captured profile; only explicit monotonic aliases are returned.
 ensure(canonicalWireJSON(profile)===canonicalWireJSON(ownedProfile),'SAVE_MIGRATION_PROFILE','Caller progress changed unexpectedly');
 return {snapshot:candidate,reads:[...reads]};
}
