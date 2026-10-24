import 'galbox-sdk/react/style.css';
import {consumerBinding} from './binding.js';
import {counter1,operations1,program1,initialized} from './extension.js';
import { createPlayer,createHttpProvider } from 'galbox-sdk/player';
import { instruction,variable,set,createSaveBindingRegistry } from 'galbox-sdk/port-kit';
import { i32,bool,parseProgram,parseSnapshot } from 'galbox-sdk/protocol';
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
 const importSnapshot=parseSnapshot(player.capture());player.dispose();if(mount.querySelector('canvas'))throw new Error('Canvas leaked');
 const pluginProgram=program1();const plugin=await createPlayer({program:pluginProgram,operations:operations1,provider:createHttpProvider(pluginProgram,location.href),mount,saveCompatibilitySeries:'plugin-consumer'});await plugin.start();const call=plugin.getSnapshot().core?.run.invocations?.find(v=>v.phase==='waiting');if(!call?.wait)throw new Error('Plugin wait');
 await plugin.save('plugin');await plugin.resumeOperation(counter1.result(call.wait,call.id,{kind:'continue',value:3}),plugin.getSnapshot().epoch);if(plugin.getSnapshot().core?.run.globals.n?.value!==5)throw new Error('Plugin result');
 await plugin.load('plugin');await plugin.resumeOperation(counter1.result(call.wait,call.id,{kind:'continue',value:99}),plugin.getSnapshot().epoch);if(plugin.getSnapshot().core?.run.globals.n?.value!==2)throw new Error('Stale plugin attempt');const resumed=plugin.getSnapshot().core?.run.invocations?.find(v=>v.phase==='waiting');if(!resumed?.wait)throw new Error('Restored plugin wait');await plugin.resumeOperation(counter1.result(resumed.wait,resumed.id,{kind:'continue',value:3}),plugin.getSnapshot().epoch);if(plugin.getSnapshot().core?.run.globals.n?.value!==5||initialized()!==1)throw new Error('Plugin restore initialized twice');plugin.dispose();
 const binding=consumerBinding(parseProgram(program),importSnapshot),imports=await createPlayer({program,provider:createHttpProvider(program,location.href),mount,saveCompatibilitySeries:'import-consumer',bindings:createSaveBindingRegistry([binding])});await imports.start();const prepared=await imports.prepareImport({sourceKey:binding.sourceKey,schema:binding.schema,version:binding.codecVersion},[{name:'original.json',bytes:new TextEncoder().encode(JSON.stringify({locator:'opening.1',flag:true}))}]);if(prepared.status!=='ready')throw new Error(prepared.message);const receipt=await imports.commitImport(prepared.plan);if(imports.getSnapshot().profileId!=='main')throw new Error('Import activated automatically');await imports.load(receipt.slot);if(imports.getSnapshot().core?.profile.values.loads?.value!==5)throw new Error('Import load hook');const importedSave=await imports.save('import-progress');await imports.load(importedSave.slot);if(imports.getSnapshot().core?.profile.values.loads?.value!==6)throw new Error('Saved import hook lost or duplicated');imports.dispose();
 document.body.dataset.result='passed';document.getElementById('result')!.textContent='Packed SDK playback / save / restore passed';
 })().catch(e=>{document.body.dataset.result='failed';document.getElementById('result')!.textContent=String(e);});});
