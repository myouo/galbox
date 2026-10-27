import {decodeWire} from '../protocol/protobuf.js';
import type {WireKind} from '../protocol/protobuf.js';
/** Downloads can be re-uploaded with a temporary filename; content selects the codec. */
export function readWireFile(kind:WireKind,bytes:Uint8Array):unknown {
 try{return decodeWire(kind,bytes);}catch(error){const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes).trimStart();if(!text.startsWith('{'))throw error;const legacy:unknown=JSON.parse(text);return legacy;}
}
