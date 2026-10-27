import {encodeWire} from '../../../../packages/galbox-sdk/src/protocol/protobuf.js';
import {mkdir,writeFile,readFile,cp} from 'node:fs/promises';
import {compileProgramModules} from '../../../../packages/galbox-sdk/src/program-tools/index.js';
import {moduleNovel,modulePartition} from './program.js';
const compiled=await compileProgramModules({program:moduleNovel(),series:'1',resources:[]},modulePartition.map(p=>({...p,functions:[...p.functions]})));
const root=new URL('../../../player-app/public/modules/',import.meta.url);await mkdir(new URL('code/',root),{recursive:true});await writeFile(new URL('manifest.pb',root),encodeWire('ModuleManifest',compiled.manifest));for(const file of compiled.files)await writeFile(new URL(file.uri,root),file.bytes);

const publicRoot=new URL('../../../player-app/public/',import.meta.url),standard=JSON.parse(await readFile(new URL('program.json',publicRoot),'utf8')),facts=JSON.parse(await readFile(new URL('program.json.release.json',publicRoot),'utf8'));
const actual=await compileProgramModules({program:standard,series:'module-standard',resources:facts.resources},standard.functions.map((f:{id:string})=>({id:f.id,uri:`code/${f.id}.pb`,functions:[f.id]})));
const destination=new URL('module-standard/',publicRoot);await mkdir(new URL('code/',destination),{recursive:true});await cp(new URL('assets/',publicRoot),new URL('assets/',destination),{recursive:true});await writeFile(new URL('manifest.pb',destination),encodeWire('ModuleManifest',actual.manifest));for(const file of actual.files)await writeFile(new URL(file.uri,destination),file.bytes);
