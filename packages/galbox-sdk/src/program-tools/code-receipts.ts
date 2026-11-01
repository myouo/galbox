import {ensure,parseModuleFunction} from '../protocol/index.js';
import type {CodeModuleDescriptor,ModuleFunction,ProgramModule} from '../protocol/index.js';
import {freezeJson} from '../protocol/codecs.js';
import {normalizeFunction} from '../protocol/normalize.js';
import {moduleFunction} from './function-declarations.js';
import {ownedWireFootprint} from '../protocol/budget.js';
interface Receipt {body:ProgramModule;manifestSha256:string;id:string;sha256:string;bytes:number;basic:ModuleFunction[];advanced:ModuleFunction[];}
const receipts=new WeakMap<object,Receipt>();
const byBytes=new Map<string,{body:ProgramModule;weight:number}>();let retained=0;
const cacheLimit=64*1024*1024,key=(scope:string,d:Pick<CodeModuleDescriptor,'id'|'sha256'|'bytes'>)=>scope+':'+d.id+':'+d.sha256+':'+d.bytes;
/** Session-local byte identity reuse; ABI/links are still checked for each source. */
export function reuseVerifiedModule(manifestSha256:string,descriptor:Pick<CodeModuleDescriptor,'id'|'sha256'|'bytes'>,cacheScope:string):ProgramModule|undefined {const id=key(cacheScope,descriptor),entry=byBytes.get(id);if(!entry)return;byBytes.delete(id);byBytes.set(id,entry);const original=receipts.get(entry.body)!;if(original.manifestSha256===manifestSha256)return entry.body;const body={...entry.body},receipt={...original,body,manifestSha256};freezeJson(receipt);receipts.set(body,receipt);return body;}
/** Internal issuer: caller has verified the owned bytes against this descriptor. */
export function retainVerifiedModule(body:ProgramModule,manifestSha256:string,descriptor:Pick<CodeModuleDescriptor,'id'|'sha256'|'bytes'>,cacheScope?:string):ProgramModule {
 ensure(body.id===descriptor.id,'MODULE_ABI','Decoded code ID differs from requested module');
 const advanced=body.functions.map(moduleFunction),basic=body.functions.map(f=>{const {code,...header}=f;return parseModuleFunction({...header,addresses:code.map(i=>i.at)});});
 body.functions.forEach(normalizeFunction);freezeJson(body);const receipt={body,manifestSha256,id:descriptor.id,sha256:descriptor.sha256,bytes:descriptor.bytes,basic,advanced};freezeJson(receipt);receipts.set(body,receipt);const footprint=ownedWireFootprint(receipt),weight=footprint.characters*2+footprint.nodes*64;if(cacheScope!==undefined&&weight<=cacheLimit){const id=key(cacheScope,descriptor),previous=byBytes.get(id);if(previous){retained-=previous.weight;byBytes.delete(id);}byBytes.set(id,{body,weight});retained+=weight;while(retained>cacheLimit||byBytes.size>64){const oldest=byBytes.keys().next().value;if(oldest===undefined)break;retained-=byBytes.get(oldest)!.weight;byBytes.delete(oldest);}}return body;
}
export function verifiedModuleReceipt(input:unknown,manifestSha256?:string):Receipt|undefined {if(input===null||typeof input!=='object')return;const receipt=receipts.get(input);if(receipt&&manifestSha256!==undefined)ensure(receipt.manifestSha256===manifestSha256,'MODULE_DIGEST','Receipt is not bound to this manifest');return receipt;}
