import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {compileProgramModuleParts} from 'galbox-sdk/port-kit';
import {encodeWire} from 'galbox-sdk/wire';import {inspectResource} from 'galbox-sdk/release';
import type {Asset} from 'galbox-sdk/protocol';
import {interactiveParts,interactiveRegistry} from './source.js';
const root='tests/player-app/public/interactive-modules';await mkdir(root+'/code',{recursive:true});
const files=[{id:'image',kind:'image' as const,mime:'image/svg+xml' as const,path:'image.svg',source:'tests/player-app/public/stage/markers/red.svg'},{id:'video',kind:'video' as const,mime:'video/webm' as const,path:'video.webm',source:'tests/fixtures/game-data/interactive-novel/assets/beacon-opus.webm'},{id:'tone',kind:'audio' as const,mime:'audio/wav' as const,path:'tone.wav',source:'tests/player-app/public/assets/click.wav'}];
const assets:Asset[]=[],resources=[];
for(const f of files){const bytes=new Uint8Array(await readFile(f.source)),a={id:f.id,kind:f.kind,mime:f.mime,path:f.path,sha256:createHash('sha256').update(bytes).digest('hex')};assets.push(a);resources.push(inspectResource(a,bytes,b=>new TextDecoder().decode(b)));await writeFile(root+'/'+f.path,bytes);}
const [image,video,tone]=assets;if(!image||!video||!tone)throw new Error('assets');
for(const policy of ['replay','forbid'] as const){
 const parts=interactiveParts(image,video,tone,policy);if(policy==='forbid')parts.files=parts.files.map(f=>({...f,uri:f.body.id==='video'?'code/video-forbid.pb':f.uri}));
 const built=await compileProgramModuleParts({parts,series:'v2',resources,operations:interactiveRegistry().operations});await writeFile(root+'/'+policy+'.pb',encodeWire('ModuleManifest',built.manifest));for(const file of built.files)await writeFile(root+'/'+file.uri,file.bytes);
}
console.log('Built original modular UI/flow/video/timed/RNG/operation fixture');
