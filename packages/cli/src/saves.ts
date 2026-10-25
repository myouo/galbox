import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateProject} from './project.js';
import {requireValue,readJSON,ReportError} from './config.js';
export interface SaveOptions {internal?:boolean;verify?:boolean;profile?:string;source?:string;schema?:string;version?:number;}
export async function inspectSaveFiles(directory:string,files:readonly string[],options:SaveOptions={}) {
 const {project,program}=await validateProject(directory),{sdk,port}=project;
 if(options.internal){
  const file=files[0];requireValue(files.length===1&&file,'CLI_USAGE','Internal inspection needs one snapshot JSON');requireValue(!options.source&&!options.schema&&!options.version,'CLI_OPTION','Source selectors are only for original packages');const input=await readJSON(file);const trace=sdk.diagnostics.inspectSnapshot(program,input,port.operations);if(trace.status==='invalid')throw new ReportError(trace.diagnostics.map(d=>({...d,file})));
  if(!options.verify){requireValue(!options.profile,'CLI_OPTION','--profile is only used by internal verify');return {status:'analyzed',kind:'internal-snapshot',trace,originalReference:'not-verified'};}
  requireValue(options.profile,'SAVE_PROFILE_REQUIRED','Internal verify requires --profile; a current profile is not guessed');const profile=sdk.protocol.parseProfile(await readJSON(options.profile)),core=sdk.core.createCore(program,profile,input,{operations:port.operations});return {status:'verified',kind:'standard-state',trace:sdk.diagnostics.inspectSnapshot(program,core.capture(),port.operations),profileRevision:profile.revision,originalReference:'not-verified'};
 }
 requireValue(files.length>0,'CLI_USAGE','Give the original package files explicitly');requireValue(!options.profile,'CLI_OPTION','--profile is only for --internal');
 const candidates=port.bindings.list().filter(b=>(options.source===undefined||options.source===b.sourceKey)&&(options.schema===undefined||options.schema===b.schema)&&(options.version===undefined||options.version===b.version));
 if(candidates.length!==1)return {status:'needs-input',code:'SAVE_SOURCE_REQUIRED',message:'Select exactly one registered source/schema/version',sources:port.bindings.list(),originalReference:'not-verified'};
 const source=candidates[0];requireValue(source,'SAVE_SOURCE_REQUIRED','No source');const binding=port.bindings.get(source.sourceKey,source.schema,source.version),input=await Promise.all(files.map(async f=>({name:path.basename(f),bytes:new Uint8Array(await readFile(f))})));
 const result=await binding.prepare(input,{async digest(bytes){return new Uint8Array(createHash('sha256').update(bytes).digest());},decodeUtf8(bytes){return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}},program,port.operations);if(result.status!=='ready')return {...result,source:source.sourceKey,originalReference:'not-verified'};
 if(!options.verify)return {status:'ready',kind:'conversion-plan',report:result.plan.report(),originalReference:'not-verified'};
 const payload=sdk.bridge.materializeImport(result.plan,program,port.operations),prepared=payload.recipe?sdk.tools.prepareRestoreRecipe(program,payload.profile,payload.snapshot,payload.recipe,{operations:port.operations}):payload;
 const trace=sdk.diagnostics.inspectSnapshot(program,prepared.snapshot,port.operations);if(trace.status==='invalid')throw new ReportError(trace.diagnostics);
 return {status:'verified',kind:'candidate',report:result.plan.report(),trace,persisted:false,originalReference:'not-verified'};
}
