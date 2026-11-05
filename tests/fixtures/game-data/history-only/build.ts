import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {encodeWire} from 'galbox-sdk/wire';
import {createReleaseManifest,inspectResource} from 'galbox-sdk/release';
import {historyOnlyProgram,pixel} from './source.js';
const root='tests/player-app/public/history-only',program=historyOnlyProgram(),resource=inspectResource(program.assets[0]!,pixel,b=>new TextDecoder().decode(b)),release=await createReleaseManifest({program,series:'history-only',resources:[resource]},{async sha256(s){return createHash('sha256').update(s).digest('hex');}});await mkdir(root,{recursive:true});for(const [name,type,value]of [['program.pb','Program',program],['release.pb','ReleaseManifest',release]]as const)await writeFile(root+'/'+name,encodeWire(type,value));await writeFile(root+'/program.json',JSON.stringify(program));await writeFile(root+'/program.json.release.json',JSON.stringify(release));await writeFile(root+'/pixel.svg',pixel);
