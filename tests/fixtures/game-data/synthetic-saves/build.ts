import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='tests/fixtures/game-data/synthetic-saves/data';await mkdir(root,{recursive:true});
const payload=Buffer.from(JSON.stringify({format:'fixture-save@1',edition:'lighthouse-synthetic-1',locator:'legacy:route-choice',visits:1,route:'none'}));
const bytes=Buffer.alloc(9+payload.length+32);bytes.write('GBFX');bytes[4]=1;bytes.writeUInt32LE(payload.length,5);payload.copy(bytes,9);createHash('sha256').update(payload).digest().copy(bytes,9+payload.length);
await writeFile(`${root}/slot.bin`,bytes);await writeFile(`${root}/global.json`,JSON.stringify({format:'fixture-save@1',edition:'lighthouse-synthetic-1',shoreUnlocked:true,towerUnlocked:false,readUnits:['opening.1@zh-1'],syntheticLoadCount:4},null,2)+'\n');
console.log('Generated synthetic fixture-save@1: slot.bin + global.json');

await mkdir('tests/player-app/public/synthetic-saves',{recursive:true});
await writeFile('tests/player-app/public/synthetic-saves/slot.bin',bytes);
await writeFile('tests/player-app/public/synthetic-saves/global.json',JSON.stringify({format:'fixture-save@1',edition:'lighthouse-synthetic-1',shoreUnlocked:true,towerUnlocked:false,readUnits:['opening.1@zh-1'],syntheticLoadCount:4},null,2)+'\n');
