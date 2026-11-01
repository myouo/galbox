import {ensure,parseModuleFunction} from '../protocol/index.js';
import type {CodeModuleDescriptor,ModuleFunction,ProgramModule} from '../protocol/index.js';
import {freezeJson} from '../protocol/codecs.js';
import {normalizeFunction} from '../protocol/normalize.js';
import {moduleFunction} from './function-declarations.js';
interface Receipt {body:ProgramModule;manifestSha256:string;id:string;sha256:string;bytes:number;basic:ModuleFunction[];advanced:ModuleFunction[];}
const receipts=new WeakMap<object,Receipt>();
/** Internal issuer: caller has verified the owned bytes against this descriptor. */
export function retainVerifiedModule(body:ProgramModule,manifestSha256:string,descriptor:Pick<CodeModuleDescriptor,'id'|'sha256'|'bytes'>):ProgramModule {
 ensure(body.id===descriptor.id,'MODULE_ABI','Decoded code ID differs from requested module');
 const advanced=body.functions.map(moduleFunction),basic=body.functions.map(f=>{const {code,...header}=f;return parseModuleFunction({...header,addresses:code.map(i=>i.at)});});
 body.functions.forEach(normalizeFunction);freezeJson(body);const receipt={body,manifestSha256,id:descriptor.id,sha256:descriptor.sha256,bytes:descriptor.bytes,basic,advanced};freezeJson(receipt);receipts.set(body,receipt);return body;
}
export function verifiedModuleReceipt(input:unknown):Receipt|undefined {return input!==null&&typeof input==='object'?receipts.get(input):undefined;}
