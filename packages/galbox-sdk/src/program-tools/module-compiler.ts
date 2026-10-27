import {parseModulePartition,parseProgramModule,parseModuleManifest,ensure,canonicalWireJSON} from '../protocol/index.js';
import type {ModulePartition,ModuleManifest,ProgramModule} from '../protocol/index.js';
import {wireDigest,byteDigest} from '../protocol/digest.js';
import {encodeWire} from '../protocol/protobuf.js';
import {linkProgram} from './linker.js';
import {createReleaseManifest} from '../release/index.js';
import type {ReleaseOptions} from '../release/index.js';
import {createModuleProgram} from './module-program.js';
export interface CompiledModules {manifest:ModuleManifest;files:{uri:string;body:ProgramModule;bytes:Uint8Array}[];}
export async function compileProgramModules(options:ReleaseOptions,partition:readonly {id:string;uri:string;functions:readonly string[]}[]):Promise<CompiledModules> {
 const p=linkProgram(options.program,options.operations).copy(),plan=parseModulePartition(partition);ensure(!p.extras&&!p.flowchart&&!p.ui&&!p.textLayout&&!p.rng,'MODULE_UNSUPPORTED','Advanced module capabilities are tracked separately');const used=new Set<string>(),files=plan.map(d=>{const functions=d.functions.map(id=>{ensure(!used.has(id),'MODULE_DUPLICATE',id);used.add(id);const f=p.functions.find(f=>f.id===id);ensure(f,'FUNCTION',id);return f;});const body=parseProgramModule({format:'galbox-code',version:1,id:d.id,functions});return {uri:d.uri,body,bytes:encodeWire('ProgramModule',body)};});ensure(used.size===p.functions.length,'MODULE_PARTITION','Every function needs exactly one module');
 const {functions:_functions,...header}=p,release=await createReleaseManifest(options,{async sha256(text){return wireDigest(JSON.parse(text));}}),manifest=parseModuleManifest({format:'galbox-module-program',version:1,header,release,functionOrder:p.functions.map(f=>f.id),modules:files.map(f=>({id:f.body.id,uri:f.uri,sha256:byteDigest(f.bytes),bytes:f.bytes.byteLength,functions:f.body.functions.map(f=>{const {code,...header}=f;return {...header,addresses:code.map(i=>i.at)};})}))});const checked=createModuleProgram(manifest);for(const file of files)checked.install(file.body);return {manifest,files};
}
