import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {encodeWire} from 'galbox-sdk/wire';
import {createReleaseManifest,inspectResource} from 'galbox-sdk/release';
import {largeBacklog,pixel} from './source.js';
const root='tests/player-app/public/large-backlog',program=largeBacklog(),resource=inspectResource(program.assets[0]!,pixel,b=>new TextDecoder().decode(b)),release=await createReleaseManifest({program,series:'large-backlog',resources:[resource]},{async sha256(text){return createHash('sha256').update(text).digest('hex');}});await mkdir(root,{recursive:true});await writeFile(root+'/program.pb',encodeWire('Program',program));await writeFile(root+'/release.pb',encodeWire('ReleaseManifest',release));await writeFile(root+'/pixel.svg',pixel);
