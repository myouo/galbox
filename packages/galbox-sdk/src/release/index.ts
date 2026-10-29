import {canonicalParsedJSON} from '../protocol/canonical.js';
import {ensure,parseReleaseManifest,parseResourceBudget,parseResourceFact,canonicalWireJSON} from '../protocol/index.js';
import type {Program,ResourceFact,ResourceBudget,ReleaseManifest} from '../protocol/index.js';
import {linkProgram} from '../program-tools/linker.js';
import {emptyOperations} from '../core/operations.js';
import type {OperationRegistry} from '../core/operations.js';
import {createSaveBindingRegistry} from '../save-bridge/index.js';
import type {SaveBindingRegistry} from '../save-bridge/index.js';
import {storageNamespace} from '../runtime/backup.js';
export type {ResourceFact,ResourceBudget,ReleaseManifest};
export {inspectResource} from './inspect.js';
export const defaultResourceBudget:Readonly<ResourceBudget>=Object.freeze({maxAssetBytes:16777216,maxEncodedBytes:33554432,maxTextureBytes:134217728,maxAudioBytes:33554432,maxImageSide:4096,maxAudioMs:30000});
export interface DigestPort {sha256(utf8Text:string):Promise<string>;}
export function canonicalReleaseJSON(value:unknown):string {return canonicalWireJSON(value);}
export interface ResourceUsage {encodedBytes:number;textureBytesEstimated:number;audioBytesEstimated:number;assets:number;}
export function resourceUsage(input:readonly ResourceFact[],policy:unknown=defaultResourceBudget,decodeRate?:number):ResourceUsage {
 const limits=parseResourceBudget(policy),facts=input.map(parseResourceFact),ids=new Set<string>();let encodedBytes=0,textureBytesEstimated=0,audioBytesEstimated=0;
 if(decodeRate!==undefined)ensure(Number.isFinite(decodeRate)&&decodeRate>0,'RESOURCE_AUDIO_RATE','Invalid device decode rate');
 for(const f of facts){ensure(!ids.has(f.id),'RESOURCE_DUPLICATE',f.id);ids.add(f.id);ensure(f.bytes<=limits.maxAssetBytes,'RESOURCE_ASSET_BUDGET',f.id);encodedBytes+=f.bytes;
  if(f.kind==='video'){ensure(f.durationMs<=(limits.maxVideoMs??600000),'RESOURCE_VIDEO_DURATION',f.id);ensure(Math.max(f.width,f.height)<=limits.maxImageSide,'RESOURCE_IMAGE_SIDE',f.id);textureBytesEstimated+=f.width*f.height*4;}
  if(f.kind==='image'){ensure(Math.max(f.width,f.height)<=limits.maxImageSide,'RESOURCE_IMAGE_SIDE',f.id);textureBytesEstimated+=f.width*f.height*4;}
  else if(f.kind==='audio'){ensure(f.frames*1000/f.sampleRate<=(f.playback==='element'?limits.maxMediaMs??3600000:limits.maxAudioMs),'RESOURCE_AUDIO_DURATION',f.id);if(f.playback!=='element')audioBytesEstimated+=Math.ceil(f.frames*(decodeRate??f.sampleRate)/f.sampleRate)*f.channels*4;}
 }
 ensure(encodedBytes<=limits.maxEncodedBytes,'RESOURCE_ENCODED_BUDGET','Encoded preload total');ensure(textureBytesEstimated<=limits.maxTextureBytes,'RESOURCE_TEXTURE_BUDGET','Estimated RGBA texture total');ensure(audioBytesEstimated<=limits.maxAudioBytes,'RESOURCE_AUDIO_BUDGET','Decoded PCM estimate');return {encodedBytes,textureBytesEstimated,audioBytesEstimated,assets:facts.length};
}
export interface ReleaseOptions {program:unknown;series:string;resources:readonly ResourceFact[];operations?:OperationRegistry;bindings?:SaveBindingRegistry;limits?:unknown;resourceScope?:'resident';}
function inputs(options:ReleaseOptions){const operations=options.operations??emptyOperations,bindings=options.bindings??createSaveBindingRegistry([]),program=linkProgram(options.program,operations).copy(),series=options.series,resources=options.resources.map(parseResourceFact),limits=parseResourceBudget(options.limits??defaultResourceBudget);storageNamespace(program.gameId,series);
 ensure(resources.length===program.assets.length&&program.assets.every(a=>resources.some(f=>f.id===a.id&&f.kind===a.kind)),'RELEASE_RESOURCES','Every catalog resource needs exactly one fact');if(options.resourceScope==='resident')resources.forEach(f=>resourceUsage([f],limits));else resourceUsage(resources,limits);
 return {program,series,resources,limits,registry:{operations:operations.describe(),migrations:operations.migrationIdentity(),bindings:bindings.describe()}};
}
async function digest(port:DigestPort,text:string):Promise<string> {const value=await port.sha256(text);ensure(typeof value==='string'&&/^[a-f0-9]{64}$/.test(value),'RELEASE_DIGEST','Expected UTF-8 SHA-256');return value;}
export async function createReleaseManifest(options:ReleaseOptions,port:DigestPort):Promise<ReleaseManifest> {
 const {program,series,resources,limits,registry}=inputs(options);const [programSha256,registrySha256,assetsSha256]=await Promise.all([digest(port,canonicalParsedJSON(program)),digest(port,canonicalReleaseJSON(registry)),digest(port,canonicalReleaseJSON(program.assets))]);
 return parseReleaseManifest({...options.resourceScope?{resourceScope:options.resourceScope}:{},format:'galbox-release',version:1,sdk:'0.1.0',protocol:1,semantics:'galbox-core@1',gameId:program.gameId,release:program.release,series,programSha256,registrySha256,assetsSha256,resources,limits});
}
export async function verifyReleaseManifest(input:unknown,options:Omit<ReleaseOptions,'resources'|'limits'>,port:DigestPort):Promise<ReleaseManifest> {
 const manifest=parseReleaseManifest(input),expected=await createReleaseManifest({...options,resources:manifest.resources,limits:manifest.limits,...(manifest.resourceScope?{resourceScope:manifest.resourceScope}:{})},port);ensure(canonicalReleaseJSON(manifest)===canonicalReleaseJSON(expected),'RELEASE_MISMATCH','Program, catalog, modules or save series differ from the release manifest');return manifest;
}
export async function releaseFingerprint(input:unknown,port:DigestPort):Promise<string> {return digest(port,canonicalReleaseJSON(parseReleaseManifest(input)));}
export function assertResourceFacts(expected:readonly ResourceFact[],actual:readonly ResourceFact[]):void {ensure(canonicalReleaseJSON(expected)===canonicalReleaseJSON(actual),'RELEASE_RESOURCE_FACTS','Actual media facts differ from the published release');}
