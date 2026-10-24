import 'galbox-sdk/react/style.css';
import { createPlayer,createHttpProvider } from 'galbox-sdk/player';
import { instruction,variable,set } from 'galbox-sdk/port-kit';
import { i32,bool } from 'galbox-sdk/protocol';
import { DefaultUI } from 'galbox-sdk/react';
void DefaultUI;
instruction('control.end',{at:'end'});set('ok',variable('n','i32'),i32(1));
if(false){
// @ts-expect-error published factory rejects the wrong opcode argument
instruction('control.end',{at:'wrong',target:'invalid'});
// @ts-expect-error published factory retains variable/value association
set('wrong',variable('n','i32'),bool(true));
}
const button=document.getElementById('run');
button?.addEventListener('click',()=>{void(async()=>{
 const mount=document.getElementById('stage');if(!mount)throw new Error('mount');const program:unknown=await(await fetch('./program.json')).json();
 const player=await createPlayer({program,provider:createHttpProvider(program,location.href),mount,saveCompatibilitySeries:'consumer'});
 await player.start();const before=player.getSnapshot().core?.run.wait;if(before?.kind!=='text')throw new Error('Initial wait');
 await player.input('reveal',before.prompt,player.getSnapshot().epoch);await player.save('consumer');await player.input('advance',before.prompt,player.getSnapshot().epoch);
 const advanced=player.getSnapshot().core?.run.text?.textId;if(advanced==='opening.1')throw new Error('Did not advance');await player.load('consumer');
 if(player.getSnapshot().core?.run.text?.textId!=='opening.1')throw new Error('Did not restore');
 if(!player.getSnapshot().core?.profile.read.includes('opening.1@zh-1'))throw new Error('Lost durable read progress');
 player.dispose();if(mount.querySelector('canvas'))throw new Error('Canvas leaked');
 document.body.dataset.result='passed';document.getElementById('result')!.textContent='Packed SDK playback / save / restore passed';
 })().catch(e=>{document.body.dataset.result='failed';document.getElementById('result')!.textContent=String(e);});});
