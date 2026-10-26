import {inspectVideo} from './video.js';
import {inspectCompressedAudio,audioPlayback} from './audio.js';
import {ensure,parseResourceFact} from '../protocol/index.js';
import type {Asset,ResourceFact} from '../protocol/index.js';
export function inspectResource(asset:Pick<Asset,'id'|'kind'|'mime'|'playback'>,bytes:Uint8Array,decodeUtf8:(bytes:Uint8Array)=>string):ResourceFact {
 if(asset.kind==='video'){ensure(asset.mime==='video/webm','RESOURCE_VIDEO_CODEC','Only WebM video supported');return inspectVideo(asset.id,bytes);}
 const base={id:asset.id,bytes:bytes.byteLength};const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(asset.kind==='font'){
  ensure(asset.mime==='font/ttf'&&bytes.length>=12&&view.getUint32(0)===0x00010000,'RESOURCE_FONT','Expected TrueType SFNT');const count=view.getUint16(4);ensure(count>0&&count<=64&&bytes.length>=12+count*16,'RESOURCE_FONT','Invalid font table directory');const tables=new Map<number,{offset:number;length:number}>();
  for(let j=0;j<count;j++){const at=12+j*16,tag=view.getUint32(at),offset=view.getUint32(at+8),length=view.getUint32(at+12);ensure(!tables.has(tag)&&offset>=12+count*16&&length>0&&offset+length<=bytes.length,'RESOURCE_FONT','Invalid font table');tables.set(tag,{offset,length});}
  for(const tag of [0x68656164,0x68686561,0x686d7478,0x6d617870,0x636d6170,0x6c6f6361,0x676c7966,0x6e616d65,0x706f7374])ensure(tables.has(tag),'RESOURCE_FONT','Required TrueType table missing');const head=tables.get(0x68656164),maxp=tables.get(0x6d617870);ensure(head&&head.length>=54&&maxp&&maxp.length>=6&&view.getUint32(head.offset+12)===0x5f0f3cf5,'RESOURCE_FONT','Invalid font header');return parseResourceFact({...base,kind:'font',format:'truetype',glyphs:view.getUint16(maxp.offset+4)});
 }
 if(asset.kind==='image'){
  if(asset.mime==='image/png'){ensure(bytes.length>=33&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)&&view.getUint32(8)===13&&view.getUint32(12)===0x49484452,'RESOURCE_PNG','Expected PNG IHDR');return parseResourceFact({...base,kind:'image',width:view.getUint32(16),height:view.getUint32(20)});}
  ensure(asset.mime==='image/svg+xml','RESOURCE_FORMAT',asset.mime);const text=decodeUtf8(bytes),root=text.match(/^\s*(?:<\?xml[^>]*>\s*)?<svg\b([^>]*)>/i);
  ensure(root&&!/<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b|<image\b|@import|(?:xlink:)?href\s*=\s*["'](?!#)|url\(\s*["']?(?!#)[a-zA-Z/]/i.test(text),'RESOURCE_SVG','Only self-contained SVG with fixed dimensions is supported');
  const dimension=(name:string)=>{const m=root[1]?.match(new RegExp(`\\b${name}=["']([0-9]+)(?:px)?["']`,'i'));ensure(m,'RESOURCE_SVG_SIZE',`Explicit integer ${name} required`);return Number(m[1]);};return parseResourceFact({...base,kind:'image',width:dimension('width'),height:dimension('height')});
 }
 if(asset.mime!=='audio/wav')return inspectCompressedAudio(asset,bytes);
 ensure(asset.mime==='audio/wav'&&bytes.length>=44&&view.getUint32(0)===0x52494646&&view.getUint32(8)===0x57415645&&view.getUint32(4,true)+8===bytes.length,'RESOURCE_WAV','Expected complete RIFF WAVE');
 let offset=12,chunks=0,format:number|undefined,channels=0,sampleRate=0,align=0,bits=0,dataBytes:number|undefined;
 while(offset<bytes.length){ensure(++chunks<=64&&offset+8<=bytes.length,'RESOURCE_WAV_CHUNK','Invalid or excessive WAV chunks');const tag=view.getUint32(offset),size=view.getUint32(offset+4,true),start=offset+8;ensure(start+size+(size%2)<=bytes.length,'RESOURCE_WAV_CHUNK','Truncated WAV chunk');
  if(tag===0x666d7420){ensure(format===undefined&&size>=16&&size<=40,'RESOURCE_WAV_FORMAT','Unique finite fmt chunk required');format=view.getUint16(start,true);channels=view.getUint16(start+2,true);sampleRate=view.getUint32(start+4,true);align=view.getUint16(start+12,true);bits=view.getUint16(start+14,true);ensure((format===1&&bits===16||format===3&&bits===32)&&channels>=1&&channels<=2&&sampleRate>=8000&&sampleRate<=96000&&align===channels*bits/8&&view.getUint32(start+8,true)===sampleRate*align,'RESOURCE_WAV_FORMAT','Only mono/stereo PCM16 or float32 WAV');}
  if(tag===0x64617461){ensure(dataBytes===undefined,'RESOURCE_WAV_DATA','Unique data chunk required');dataBytes=size;}offset=start+size+(size%2);
 }
 ensure(format!==undefined&&dataBytes!==undefined&&dataBytes>0&&dataBytes%align===0,'RESOURCE_WAV_DATA','Complete aligned PCM data required');return parseResourceFact({...base,kind:'audio',channels,sampleRate,frames:dataBytes/align,...(audioPlayback(asset)==='element'?{encoding:'wav',playback:'element'}:{})});
}
