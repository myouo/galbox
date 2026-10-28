import {isModuleProgram} from '../program-tools/module-program.js';
import type {MediaStreamProvider} from '../runtime/stream-ports.js';
import { ensure, parseProgram, GalboxError,canonicalWireJSON } from '../protocol/index.js';
import type { Asset, Program } from '../protocol/index.js';
export interface AssetLease {readonly release:string;readonly id:string;readonly kind:Asset['kind'];readonly mime:string;readonly bytes:Uint8Array;releaseLease():void;}
export interface AssetRequest {readonly release:string;readonly asset:Readonly<Asset>;readonly maxBytes?:number;}
export interface AssetProvider {readonly streams?:MediaStreamProvider;acquire(request:AssetRequest,signal:AbortSignal):Promise<AssetLease>;}
export function createHttpProvider(program:unknown,baseURL:string):AssetProvider {
  const catalog=isModuleProgram(program)?program.describe().header:parseProgram(program);const base=new URL(baseURL,location.href);
  let catalogHash:Promise<string>|undefined;return {streams:{async open(request,cancel){const asset=catalog.assets.find(a=>a.id===request.identity.assetId);ensure(!cancel.cancelled,'ASSET_CANCELLED',request.identity.assetId);catalogHash??=crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalWireJSON(catalog.assets))).then(b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''));ensure(asset?.transport&&request.identity.gameId===catalog.gameId&&request.identity.release===catalog.release&&request.identity.catalogSha256===await catalogHash&&request.identity.kind===asset.kind&&request.identity.mime===asset.mime&&request.identity.expectedSha256===asset.sha256&&request.identity.version===asset.transport.version,'STREAM_IDENTITY','HTTP provider catalog mismatch');const uri=new URL(asset.path,base);ensure(uri.origin===base.origin,'ASSET_URL','Cross-origin streaming requires an explicit provider');uri.searchParams.set('galbox-version',asset.transport.version);ensure(!cancel.cancelled,'ASSET_CANCELLED',asset.id);return {identity:request.identity,uri:uri.href,releaseLease(){}};}},async acquire(request,signal){
    const asset=catalog.assets.find(a=>a.id===request.asset.id);
    ensure(request.release===catalog.release&&asset&&JSON.stringify(asset)===JSON.stringify(request.asset),'ASSET_CATALOG','Provider release/catalog mismatch');
    const url=new URL(asset.path,base);ensure(url.origin===base.origin,'ASSET_URL','Cross-origin assets require an explicit provider');
    const maxBytes=request.maxBytes??16777216;ensure(Number.isSafeInteger(maxBytes)&&maxBytes>0&&maxBytes<=67108864,'ASSET_BYTE_LIMIT','Expected a bounded resource request');
    const response=await fetch(url,{signal});ensure(response.ok,'ASSET_HTTP',`${url.pathname}: ${response.status}`);
    const length=response.headers.get('content-length');if(length!==null&&Number(length)>maxBytes){await response.body?.cancel();throw new GalboxError('RESOURCE_ASSET_BUDGET',asset.id);}
    ensure(response.body,'ASSET_EMPTY',asset.id);const reader=response.body.getReader(),chunks:Uint8Array[]=[];let total=0;
    try {for(;;){const item=await reader.read();if(item.done)break;total+=item.value.byteLength;ensure(total<=maxBytes,'RESOURCE_ASSET_BUDGET',asset.id);chunks.push(item.value);}}
    catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
    const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return {release:catalog.release,id:asset.id,kind:asset.kind,mime:asset.mime,bytes,releaseLease(){}};
  }};
}
export async function verifiedBytes(provider:AssetProvider,program:Program,asset:Asset,signal:AbortSignal,maxBytes=16777216):Promise<Uint8Array> {
  let lease:AssetLease|undefined,finished=false,failed=false;let cancel:(()=>void)|undefined;
  try {
    ensure(!signal.aborted,'ASSET_CANCELLED',asset.id);
    const cancelled=new Promise<never>((_resolve,reject)=>{cancel=()=>reject(new GalboxError('ASSET_CANCELLED',asset.id));signal.addEventListener('abort',cancel,{once:true});});
    const pending=provider.acquire({release:program.release,asset:{...asset},maxBytes},signal).then(value=>{if(finished){value.releaseLease();throw new GalboxError('ASSET_CANCELLED',asset.id);}lease=value;return value;});
    await Promise.race([pending,cancelled]);ensure(lease,'ASSET_LEASE',asset.id);
    ensure(!signal.aborted,'ASSET_CANCELLED',asset.id);
    ensure(lease.release===program.release&&lease.id===asset.id&&lease.kind===asset.kind&&lease.mime===asset.mime,'ASSET_IDENTITY',asset.id);
    ensure(lease.bytes instanceof Uint8Array&&lease.bytes.byteLength<=maxBytes,'RESOURCE_ASSET_BUDGET',asset.id);const bytes=new Uint8Array(lease.bytes);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    ensure(!signal.aborted,'ASSET_CANCELLED',asset.id);
    const sha=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');ensure(sha===asset.sha256,'ASSET_DIGEST',asset.id);return bytes;
  } catch(error){failed=true;if(error instanceof GalboxError)throw error;throw new GalboxError('ASSET_FAILED',error instanceof Error?error.message:String(error));}
  finally {finished=true;if(cancel)signal.removeEventListener('abort',cancel);try{lease?.releaseLease();}catch(error){if(!failed)throw new GalboxError('ASSET_LEASE',String(error));}}
}
