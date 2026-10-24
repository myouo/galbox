import type {FormatContext} from '../save-bridge/index.js';
export function webFormatContext():FormatContext {return {async digest(bytes){return new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)));},decodeUtf8(bytes){return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}};}
