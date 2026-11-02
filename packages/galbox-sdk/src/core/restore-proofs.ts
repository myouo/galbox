import {ensure,parseSnapshot} from '../protocol/index.js';
import type {Snapshot} from '../protocol/index.js';
import {freezeJson} from '../protocol/codecs.js';
import {isModuleProgram} from '../program-tools/module-program.js';
import type {ModuleProgram} from '../program-tools/module-program.js';
import type {OperationRegistry} from './operations.js';
type Validator=(input:unknown,snapshot:unknown,operations:OperationRegistry,initial:boolean)=>Snapshot;
interface Proof {snapshot:Snapshot;source:ModuleProgram;identity:string;operations:OperationRegistry;initial:boolean;}
let validator:Validator|undefined;
const proofs=new WeakMap<object,Proof>();
export function registerRestoreValidator(value:Validator):void {ensure(validator===undefined||validator===value,'RESTORE_VALIDATOR','Restore validator already registered');validator=value;}
function proof(input:unknown,snapshot:unknown,operations:OperationRegistry,initial:boolean):Proof|undefined {if(!isModuleProgram(input)||!snapshot||typeof snapshot!=='object')return;const value=proofs.get(snapshot);return value&&value.source===input&&value.identity===input.identity&&value.operations===operations&&value.initial===initial?value:undefined;}
export function validatedRestoreCopy(input:unknown,snapshot:unknown,operations:OperationRegistry,initial:boolean):Snapshot|undefined {const value=proof(input,snapshot,operations,initial);if(!value)return;return parseSnapshot(value.snapshot);}
export function validateImmutableRestore(input:unknown,snapshot:unknown,operations:OperationRegistry,initial=false):Snapshot {ensure(validator,'RESTORE_VALIDATOR','Restore validator unavailable');const out=validator(input,snapshot,operations,initial);freezeJson(out);if(isModuleProgram(input))proofs.set(out,{snapshot:out,source:input,identity:input.identity,operations,initial});return out;}
// Both inputs are owned schema-parsed trees. Object.is also distinguishes -0.
function sameJSON(a:unknown,b:unknown):boolean {if(Object.is(a,b))return true;if(a===null||b===null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&sameJSON(Reflect.get(a,key),Reflect.get(b,key)));}
export function inheritRestoreProof(input:unknown,original:unknown,actual:Snapshot,operations:OperationRegistry,initial:boolean):Snapshot {const value=proof(input,original,operations,initial);if(!value)return actual;const out=parseSnapshot(actual);if(sameJSON(out,value.snapshot)){freezeJson(out);proofs.set(out,{...value,snapshot:out});}return out;}
