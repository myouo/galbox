import {readFile,realpath,mkdir,rename,writeFile,lstat} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import validate from './generated/validator.js';
import type {ProjectConfig} from './generated/config.js';
export interface Diagnostic {code:string;message:string;file?:string;path?:string;address?:string;source?:{file:string;line:number;column:number};}
export class CliError extends Error {constructor(readonly diagnostic:Diagnostic){super(diagnostic.message);this.name='CliError';}}
export function requireValue(value:unknown,code:string,message:string):asserts value {if(!value)throw new CliError({code,message});}
export function diagnostic(error:unknown,file?:string):Diagnostic {
 if(error instanceof CliError)return error.diagnostic;const code=error!==null&&typeof error==='object'&&'code'in error&&typeof error.code==='string'?error.code:'CLI_ERROR';return {code,message:error instanceof Error?error.message:String(error),...(file?{file}:{})};
}
export function inside(root:string,file:string):boolean {const relative=path.relative(root,file);return relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));}
export async function safePath(root:string,relative:string,write=false):Promise<string> {
 requireValue(!path.isAbsolute(relative)&&!relative.includes('\0'),'PROJECT_PATH','Use a path inside the project');const target=path.resolve(root,relative);requireValue(inside(root,target),'PROJECT_PATH',relative);
 let existing=target;for(;;){try{await lstat(existing);break;}catch(error){if(error!==null&&typeof error==='object'&&'code'in error&&error.code==='ENOENT'&&write){const parent=path.dirname(existing);requireValue(parent!==existing,'PROJECT_PATH',relative);existing=parent;}else throw error;}}
 requireValue(inside(await realpath(root),await realpath(existing)),'PROJECT_PATH','Symlink escapes the project');return target;
}
export async function readJSON(file:string):Promise<unknown> {try{const text=await readFile(file,'utf8');requireValue(Buffer.byteLength(text)<=4_000_000,'INPUT_SIZE',file);const value:unknown=JSON.parse(text);return value;}catch(error){if(error instanceof CliError)throw error;throw new CliError({...diagnostic(error,file),code:'PROJECT_JSON'});}}
export async function projectConfig(directory:string):Promise<{root:string;config:ProjectConfig}> {
 const root=await realpath(directory),file=await safePath(root,'galbox.config.json');const data=await readJSON(file);requireValue(validate(data),'PROJECT_CONFIG',`${file}: invalid project schema`);return {root,config:data};
}
export async function atomicJSON(file:string,data:unknown):Promise<void> {await mkdir(path.dirname(file),{recursive:true});const temporary=path.join(path.dirname(file),`.galbox-${randomUUID()}.tmp`);await writeFile(temporary,JSON.stringify(data,null,2)+'\n',{flag:'wx'});await rename(temporary,file);}
