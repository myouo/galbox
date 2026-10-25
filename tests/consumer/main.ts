import 'galbox-sdk/react/style.css';
import {prepareBackupRestore,materializeBackupRestore} from 'galbox-sdk/backups';
import {consumerBinding} from './binding.js';
import {counter1,operations1,program1,initialized} from './extension.js';
import { createPlayer,createHttpProvider } from 'galbox-sdk/player';
import {expr as E,assignExpression,templatePage,randomI32,richPage,richText} from 'galbox-sdk/port-kit';
import { instruction,variable,set,createSaveBindingRegistry } from 'galbox-sdk/port-kit';
import { i32,bool,parseProgram,parseSnapshot } from 'galbox-sdk/protocol';
import { DefaultUI } from 'galbox-sdk/react';
import {normalizePreferences} from 'galbox-sdk/settings';
void DefaultUI;
instruction('control.end',{at:'end'});set('ok',variable('n','i32'),i32(1));
if(false){
richPage('rich','rich.page','v1','澪',[richText.ruby('海','うみ'),richText.text(E.text('光'))]);
// @ts-expect-error Published rich factory rejects non-string expressions.
richText.ruby(E.integer(1),'うみ');
// @ts-expect-error published arithmetic factory rejects bool operands
E.binary('add',E.flag(true),E.integer(1));
assignExpression('good',variable('n','i32'),E.integer(1));
templatePage('text','consumer.text','v1',E.text('author'),E.template`Value ${E.integer(2)}`);
randomI32('random',variable('n','i32'),E.integer(1),E.integer(2));
// @ts-expect-error published factory rejects the wrong opcode argument
instruction('control.end',{at:'wrong',target:'invalid'});
// @ts-expect-error published factory retains variable/value association
set('wrong',variable('n','i32'),bool(true));
}
const button=document.getElementById('run');
button?.addEventListener('click',()=>{void(async()=>{
 const mount=document.getElementById('stage');if(!mount)throw new Error('mount');const program:unknown=await(await fetch('./program.json')).json();const release:unknown=await(await fetch('./consumer.release.json')).json();
 const player=await createPlayer({program,provider:createHttpProvider(program,location.href),mount,saveCompatibilitySeries:'consumer',release});
 const settings=normalizePreferences({version:1,audio:{master:.4,bgm:.7,voice:1,sfx:1},text:{intervalMs:32}});await player.importPreferences(settings);await player.updatePreferences({input:{advance:['KeyD']},playback:{autoDelayMs:60000},display:{fontScale:1.25,windowOpacity:.7}});const settingsBackup=player.exportPreferences();await player.resetPreferences();await player.importPreferences(settingsBackup);if(player.getSnapshot().preferences.value.input.advance[0]!=='KeyD'||mount.querySelector<HTMLElement>('.galbox-text')?.style.getPropertyValue('--galbox-font-scale')!=='1.25')throw new Error('Settings import/default reset failed');
 if(player.getSnapshot().release?.origin!=='manifest'||player.getSnapshot().resources.decodedAudioBytes<=0)throw new Error('Missing verified release/resource report');await player.updatePreferences({audio:{master:.4,bgm:.7},text:{intervalMs:32}});if(player.getSnapshot().preferences.value.audio.master!==.4)throw new Error('Preferences not applied');await player.start();const before=player.getSnapshot().core?.run.wait;if(before?.kind!=='text')throw new Error('Initial wait');
 await player.input('reveal',before.prompt,player.getSnapshot().epoch);await player.setAuto(true);if(player.getSnapshot().playback.mode!=='auto')throw new Error('Auto API failed');await player.save('consumer');await player.input('advance',before.prompt,player.getSnapshot().epoch);
 const advanced=player.getSnapshot().core?.run.text?.textId;if(advanced==='opening.1')throw new Error('Did not advance');await player.load('consumer');
 if(player.getSnapshot().core?.run.text?.textId!=='opening.1')throw new Error('Did not restore');
 if(player.getSnapshot().playback.mode!=='manual'||player.exportPreferences().display.fontScale!==1.25)throw new Error('Restore mixed playback session and durable preferences');
 if(!player.getSnapshot().core?.profile.read.includes('opening.1@zh-1'))throw new Error('Lost durable read progress');
 const portable=await player.exportBackup(),backupPlan=prepareBackupRestore(portable,{program,series:'consumer'});materializeBackupRestore(backupPlan,{program,series:'consumer'});const restoredBackup=await player.commitBackupRestore(backupPlan),backupEpoch=player.getSnapshot().epoch;await player.load(restoredBackup.slots[0]!.restoredSlot);if(player.getSnapshot().epoch<=backupEpoch||!player.getSnapshot().profileId.startsWith('backup:')||!player.getSnapshot().core?.profile.read.includes('opening.1@zh-1'))throw new Error('Portable backup restore failed');
 await player.start(restoredBackup.profiles[0]!.restoredId);if(!player.getSnapshot().profileId.startsWith('backup:')||!player.getSnapshot().core?.profile.read.includes('opening.1@zh-1'))throw new Error('Profile-only restart lost reading progress');
 const importSnapshot=parseSnapshot(player.capture());player.dispose();if(mount.querySelector('canvas'))throw new Error('Canvas leaked');
 const pluginProgram=program1();const plugin=await createPlayer({program:pluginProgram,operations:operations1,provider:createHttpProvider(pluginProgram,location.href),mount,saveCompatibilitySeries:'plugin-consumer'});await plugin.start();const call=plugin.getSnapshot().core?.run.invocations?.find(v=>v.phase==='waiting');if(!call?.wait)throw new Error('Plugin wait');
 await plugin.save('plugin');await plugin.resumeOperation(counter1.result(call.wait,call.id,{kind:'continue',value:3}),plugin.getSnapshot().epoch);if(plugin.getSnapshot().core?.run.globals.n?.value!==5)throw new Error('Plugin result');
 await plugin.load('plugin');await plugin.resumeOperation(counter1.result(call.wait,call.id,{kind:'continue',value:99}),plugin.getSnapshot().epoch);if(plugin.getSnapshot().core?.run.globals.n?.value!==2)throw new Error('Stale plugin attempt');const resumed=plugin.getSnapshot().core?.run.invocations?.find(v=>v.phase==='waiting');if(!resumed?.wait)throw new Error('Restored plugin wait');await plugin.resumeOperation(counter1.result(resumed.wait,resumed.id,{kind:'continue',value:3}),plugin.getSnapshot().epoch);if(plugin.getSnapshot().core?.run.globals.n?.value!==5||initialized()!==1)throw new Error('Plugin restore initialized twice');plugin.dispose();
 const binding=consumerBinding(parseProgram(program),importSnapshot),imports=await createPlayer({program,provider:createHttpProvider(program,location.href),mount,saveCompatibilitySeries:'import-consumer',bindings:createSaveBindingRegistry([binding])});await imports.start();const prepared=await imports.prepareImport({sourceKey:binding.sourceKey,schema:binding.schema,version:binding.codecVersion},[{name:'original.json',bytes:new TextEncoder().encode(JSON.stringify({locator:'opening.1',flag:true}))}]);if(prepared.status!=='ready')throw new Error(prepared.message);const receipt=await imports.commitImport(prepared.plan);if(imports.getSnapshot().profileId!=='main')throw new Error('Import activated automatically');await imports.load(receipt.slot);if(imports.getSnapshot().core?.profile.values.loads?.value!==5)throw new Error('Import load hook');const importedSave=await imports.save('import-progress');await imports.load(importedSave.slot);if(imports.getSnapshot().core?.profile.values.loads?.value!==6)throw new Error('Saved import hook lost or duplicated');imports.dispose();

 const richProgram:unknown=await(await fetch('./text/program.json')).json(),rich=await createPlayer({program:richProgram,provider:createHttpProvider(richProgram,new URL('./text/',location.href).href),mount,saveCompatibilitySeries:'rich-consumer'});await rich.updatePreferences({text:{intervalMs:0}});await rich.start();if(rich.capture().text?.rich?.segmentation!=='uax29-17.0.0@1'||mount.querySelector('ruby rt')?.textContent!=='とうだい')throw new Error('Packed rich rendering failed');await rich.save('rich');const richWait=rich.getSnapshot().core?.run.wait;if(richWait?.kind!=='text')throw new Error('rich prompt');await rich.input('advance',richWait.prompt,rich.getSnapshot().epoch);await rich.save('pause');await rich.load('pause');if(rich.capture().text?.textId!=='paper.light'||!rich.capture().text?.rich?.pauseRemainingMs||rich.getSnapshot().playback.mode!=='manual')throw new Error('Packed pause restore failed');await rich.load('rich');if(rich.capture().text?.textId!=='paper.welcome'||!mount.querySelector('ruby'))throw new Error('Packed rich load failed');rich.dispose();
 document.body.dataset.result='passed';document.getElementById('result')!.textContent='Packed SDK playback / save / restore / portable backup passed';
 })().catch(e=>{document.body.dataset.result='failed';document.getElementById('result')!.textContent=String(e);});});
