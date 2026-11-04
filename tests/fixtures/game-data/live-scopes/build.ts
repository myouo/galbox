import {mkdir,writeFile} from 'node:fs/promises';
import {encodeWire} from 'galbox-sdk/wire';
import {liveScopes,pixel} from './source.js';
const root='tests/player-app/public/live-scopes',built=await liveScopes();await mkdir(root+'/code',{recursive:true});await writeFile(root+'/manifest.pb',encodeWire('ModuleManifest',built.manifest));await writeFile(root+'/pixel.svg',pixel);for(const f of built.files)await writeFile(root+'/'+f.uri,f.bytes);
