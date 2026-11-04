import {ensure,GalboxError} from '../protocol/index.js';
import type {StorageLayout} from '../protocol/index.js';
import {namespaceCharacterLimit} from '../runtime/storage-layout.js';
type Descriptor=StorageLayout['records'][number];
export interface EncodedColdRecord {format:'galbox-gzip';version:1;bytes:ArrayBuffer;}
// JSON accepts -0, but JSON.stringify erases its sign. Adapter persistence must
// retain every finite numeric value, including poses and provenance metadata.
function recordJSON(value:unknown):string {
 if(typeof value==='number'&&Object.is(value,-0))return '-0';
 if(Array.isArray(value))return '['+Array.from(value,v=>v===undefined?'null':recordJSON(v)).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.entries(value).filter(([,v])=>v!==undefined).map(([k,v])=>JSON.stringify(k)+':'+recordJSON(v)).join(',')+'}';
 const text=JSON.stringify(value);ensure(text!==undefined,'STORAGE_RECORD_SIZE','Expected owned JSON');return text;
}
export async function encodeColdRecord(value:unknown):Promise<{value:EncodedColdRecord;characters:number;storedBytes:number}>{
 const text=recordJSON(value);ensure(text.length<=namespaceCharacterLimit,'STORAGE_RECORD_SIZE','Cold record exceeds decoded budget');ensure(typeof CompressionStream==='function','STORAGE_COMPRESSION_UNAVAILABLE','Gzip storage needs CompressionStream');
 const bytes=await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();ensure(bytes.byteLength>0&&bytes.byteLength<=namespaceCharacterLimit,'STORAGE_SIZE','Compressed record exceeds namespace budget');return {value:{format:'galbox-gzip',version:1,bytes},characters:text.length,storedBytes:bytes.byteLength};
}
export async function decodeColdRecord(input:unknown,row:Descriptor,version:2|3|4):Promise<unknown>{
 if(version===2){ensure(JSON.stringify(input)?.length===row.characters,'STORAGE_RECORD_SIZE',row.id);return input;}
 ensure(input!==null&&typeof input==='object'&&'format'in input&&input.format==='galbox-gzip'&&'version'in input&&input.version===1&&'bytes'in input&&input.bytes instanceof ArrayBuffer&&Object.keys(input).length===3&&input.bytes.byteLength===row.storedBytes,'STORAGE_RECORD_SIZE','Invalid compressed cold record');ensure(typeof DecompressionStream==='function','STORAGE_COMPRESSION_UNAVAILABLE','Gzip storage needs DecompressionStream');
 const reader=new Blob([input.bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),chunks:Uint8Array[]=[];let length=0;
 try{for(;;){const next=await reader.read();if(next.done)break;length+=next.value.byteLength;ensure(length<=row.characters*4&&length<=namespaceCharacterLimit*4,'STORAGE_RECORD_SIZE','Decompression exceeds declared decoded budget');chunks.push(next.value);}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);ensure(text.length===row.characters,'STORAGE_RECORD_SIZE','Decoded cold record length differs');return JSON.parse(text) as unknown;
 }catch(error){await reader.cancel().catch(()=>{});if(error instanceof GalboxError)throw error;throw new GalboxError('STORAGE_RECORD_SIZE','Corrupt compressed cold record');}finally{reader.releaseLock();}
}
