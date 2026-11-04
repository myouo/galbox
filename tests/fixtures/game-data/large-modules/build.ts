import {mkdir,writeFile} from 'node:fs/promises';
import {encodeWire} from 'galbox-sdk/wire';
import {largeModules} from './source.js';
const root='tests/player-app/public/large-modules',{built}=await largeModules(1300,8);await mkdir(root+'/code',{recursive:true});await writeFile(root+'/manifest.pb',encodeWire('ModuleManifest',built.manifest));for(const f of built.files)await writeFile(root+'/'+f.uri,f.bytes);
