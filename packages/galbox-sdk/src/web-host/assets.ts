import { ensure, parseProgram, GalboxError } from '../protocol/index.js';
import type { Asset, Program } from '../protocol/index.js';
export interface AssetLease {readonly release:string;readonly id:string;readonly kind:Asset['kind'];readonly mime:string;readonly bytes:Uint8Array;releaseLease():void;}
export interface AssetRequest {readonly release:string;readonly asset:Readonly<Asset>;}
export interface AssetProvider {acquire(request:AssetRequest,signal:AbortSignal):Promise<AssetLease>;}
export function createHttpProvider(program:unknown,baseURL:string):AssetProvider {
  const catalog=parseProgram(program);const base=new URL(baseURL,location.href);
  return {async acquire(request,signal){
    const asset=catalog.assets.find(a=>a.id===request.asset.id);
    ensure(request.release===catalog.release&&asset&&JSON.stringify(asset)===JSON.stringify(request.asset),'ASSET_CATALOG','Provider release/catalog mismatch');
    const url=new URL(asset.path,base);ensure(url.origin===base.origin,'ASSET_URL','Cross-origin assets require an explicit provider');
    const response=await fetch(url,{signal});ensure(response.ok,'ASSET_HTTP',`${url.pathname}: ${response.status}`);
    const bytes=new Uint8Array(await response.arrayBuffer());return {release:catalog.release,id:asset.id,kind:asset.kind,mime:asset.mime,bytes,releaseLease(){}};
  }};
}
export async function verifiedBytes(provider:AssetProvider,program:Program,asset:Asset,signal:AbortSignal):Promise<Uint8Array> {
  let lease:AssetLease|undefined;
  try {
    lease=await provider.acquire({release:program.release,asset:{...asset}},signal);
    ensure(!signal.aborted,'ASSET_CANCELLED',asset.id);
    ensure(lease.release===program.release&&lease.id===asset.id&&lease.kind===asset.kind&&lease.mime===asset.mime,'ASSET_IDENTITY',asset.id);
    const bytes=new Uint8Array(lease.bytes);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    ensure(!signal.aborted,'ASSET_CANCELLED',asset.id);
    const sha=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');ensure(sha===asset.sha256,'ASSET_DIGEST',asset.id);return bytes;
  } catch(error){if(error instanceof GalboxError)throw error;throw new GalboxError('ASSET_FAILED',error instanceof Error?error.message:String(error));}
  finally {lease?.releaseLease();}
}
