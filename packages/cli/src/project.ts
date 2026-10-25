import {readFile,realpath} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import path from 'node:path';
import type {Program,Asset} from 'galbox-sdk/protocol';
import type {PortRegistration} from 'galbox-sdk/port-kit';
import type {ProjectConfig} from './generated/config.js';
import {safePath,projectConfig,readJSON,atomicJSON,requireValue} from './config.js';
export interface ProjectSDK {protocol:typeof import('galbox-sdk/protocol');tools:typeof import('galbox-sdk/port-kit');core:typeof import('galbox-sdk/core');bridge:typeof import('galbox-sdk/save-bridge');}
export interface Project {root:string;config:ProjectConfig;sdk:ProjectSDK;port:PortRegistration;}
export async function openProject(directory:string):Promise<Project> {
 const {root,config}=await projectConfig(directory),sdkRoot=await realpath(path.join(root,'node_modules/galbox-sdk')),manifest=await readJSON(path.join(sdkRoot,'package.json'));
 requireValue(manifest!==null&&typeof manifest==='object'&&'name'in manifest&&manifest.name==='galbox-sdk'&&'exports'in manifest,'PROJECT_SDK','Install the project SDK before running CLI commands');const entries=manifest.exports;requireValue(entries!==null&&typeof entries==='object','PROJECT_SDK','Expected explicit SDK exports');
 function entry(name:string):string {requireValue(entries!==null&&typeof entries==='object','PROJECT_SDK','Invalid exports table');const key='./'+name;requireValue(Object.hasOwn(entries,key),'PROJECT_SDK',`Missing public ${key}`);const item:unknown=Reflect.get(entries,key),target=typeof item==='string'?item:item!==null&&typeof item==='object'&&'import'in item?item.import:undefined;requireValue(typeof target==='string'&&target.startsWith('./')&&!target.includes('..'),'PROJECT_SDK',`Unsupported public ${key} export`);return pathToFileURL(path.resolve(sdkRoot,target)).href;}
 const [protocol,tools,core,bridge]:[ProjectSDK['protocol'],ProjectSDK['tools'],ProjectSDK['core'],ProjectSDK['bridge']]=await Promise.all([import(entry('protocol')),import(entry('port-kit')),import(entry('core')),import(entry('save-bridge'))]);
 requireValue(typeof tools.readPortRegistration==='function'&&typeof core.createCore==='function','PROJECT_SDK','This CLI needs the matching SDK registration/Core API');
 const moduleFile=await safePath(root,config.port);requireValue(/\.(mjs|js)$/.test(moduleFile),'PROJECT_PORT','Compile a trusted port module to ESM .js/.mjs');const module:Record<string,unknown>=await import(pathToFileURL(moduleFile).href);const port=tools.readPortRegistration(module.default);return {root,config,sdk:{protocol,tools,core,bridge},port};
}
async function assetBytes(project:Project,asset:{path:string}):Promise<Uint8Array> {const publicRoot=await safePath(project.root,project.config.assetsRoot);const file=await safePath(publicRoot,asset.path);return new Uint8Array(await readFile(file));}
function mediaHeader(bytes:Uint8Array,asset:Asset):boolean {
 if(asset.mime==='image/svg+xml')return /<svg[\s>]/i.test(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(asset.mime==='image/png')return bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10;
 return bytes.length>=44&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WAVE';
}
export async function checkAssets(project:Project,program:Program):Promise<{id:string;bytes:number;sha256:string}[]> {
 const results=[];for(const asset of program.assets){const bytes=await assetBytes(project,asset),sha256=createHash('sha256').update(bytes).digest('hex');requireValue(sha256===asset.sha256,'ASSET_DIGEST',`${asset.id}: ${asset.path} does not match the published bytes`);requireValue((asset.kind==='image'&&asset.mime.startsWith('image/'))||(asset.kind==='audio'&&asset.mime==='audio/wav'),'ASSET_KIND',asset.id);requireValue(mediaHeader(bytes,asset),'ASSET_FORMAT',asset.path);results.push({id:asset.id,bytes:bytes.length,sha256});}return results;
}
export async function validateProject(directory:string):Promise<{project:Project;program:Program;assets:Awaited<ReturnType<typeof checkAssets>>}> {
 const project=await openProject(directory),file=await safePath(project.root,project.config.program),program=project.sdk.tools.linkProgram(await readJSON(file),project.port.operations).copy();const assets=await checkAssets(project,program);return {project,program,assets};
}
export async function buildAssets(directory:string):Promise<{program:Program;assets:Awaited<ReturnType<typeof checkAssets>>}> {
 const project=await openProject(directory),assets:Asset[]=[];const ids=new Set<string>();for(const asset of project.config.assets){requireValue(!ids.has(asset.id),'ASSET_DUPLICATE',asset.id);ids.add(asset.id);const bytes=await assetBytes(project,asset);assets.push({...asset,sha256:createHash('sha256').update(bytes).digest('hex')});}
 const file=await safePath(project.root,project.config.source);requireValue(/\.(mjs|js)$/.test(file),'PROJECT_SOURCE','Compile the trusted Builder source to ESM .js/.mjs');const module:Record<string,unknown>=await import(pathToFileURL(file).href);requireValue(typeof module.default==='function','PROJECT_SOURCE','Default export must build a Program');const input:unknown=await module.default(assets,project.port);const program=project.sdk.tools.linkProgram(input,project.port.operations).copy();
 requireValue(program.assets.length===assets.length&&assets.every(a=>program.assets.some(p=>p.id===a.id&&p.kind===a.kind&&p.path===a.path&&p.mime===a.mime&&p.sha256===a.sha256)),'ASSET_CATALOG','Builder must use the compiled catalog unchanged');const report=await checkAssets(project,program);const destination=await safePath(project.root,project.config.program,true),publicRoot=await safePath(project.root,project.config.assetsRoot);requireValue(destination.startsWith(publicRoot+path.sep),'PROJECT_PROGRAM','Published Program must be inside assetsRoot');await atomicJSON(destination,program);return {program,assets:report};
}
