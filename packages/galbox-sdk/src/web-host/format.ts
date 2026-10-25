import type {FormatContext} from '../save-bridge/index.js';
import type {DigestPort} from '../release/index.js';
export function webReleaseDigest():DigestPort {return {async sha256(text){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}};}
export function webFormatContext():FormatContext {return {async digest(bytes){return new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)));},decodeUtf8(bytes){return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}};}
