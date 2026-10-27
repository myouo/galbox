import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {Core} from '../../packages/galbox-sdk/src/core/index.js';
import {MemoryStore} from '../../packages/galbox-sdk/src/testing/index.js';
import {defineContentMigration,prepareBackupRestore,materializeBackupRestore,storageNamespace} from '../../packages/galbox-sdk/src/backups/index.js';
import {parseProgram,parsePortableBackup,i32} from '../../packages/galbox-sdk/src/protocol/index.js';
import type {PortableBackup,DeepReadonly} from '../../packages/galbox-sdk/src/protocol/index.js';
import {defineRestoreRecipe} from '../../packages/galbox-sdk/src/runtime/recipe.js';
import {createOperationRegistry} from '../../packages/galbox-sdk/src/core/operations.js';
const program=parseProgram(JSON.parse(readFileSync('tests/fixtures/game-data/standard-novel/program.json','utf8'))),series='backup-tests';
const options={program,series};
function cut(){const c=new Core(program);c.run(100);return c.capture();}
async function saved(){const store=new MemoryStore(storageNamespace(program.gameId,series)),snapshot=cut();await store.progress({id:'web',baseRevision:0,through:1,changes:[{seq:1,type:'set',key:'unlock',value:i32(9)}]},null);await store.save('quick',snapshot,0);await store.save('quick',snapshot,1);return {store,snapshot,backup:await store.backup(program.gameId,series,program.release)};}
function revised(){const target=parseProgram(program);target.release='lighthouse-2';for(const f of target.functions)for(const i of f.code)if(i.op==='text.page'&&i.textId==='opening.1'){i.revision='zh-2';i.content='新译文：'+i.content;}return target;}
function translate(input:DeepReadonly<PortableBackup>):PortableBackup {
  const output=parsePortableBackup(input);output.release='lighthouse-2';
  for(const p of output.profiles)p.profile.read=p.profile.read.filter(u=>u!=='opening.1@zh-1');
  for(const s of output.slots)for(const snapshot of [s.snapshot,...(s.previous?[s.previous]:[])]){snapshot.release='lighthouse-2';if(snapshot.text?.textId==='opening.1'){snapshot.text.revision='zh-2';snapshot.text.content='新译文：'+snapshot.text.content;snapshot.text.revealed=0;}}
  return output;
}
const migration=(migrate:(input:DeepReadonly<PortableBackup>)=>unknown=translate)=>defineContentMigration({id:'lighthouse.zh2',gameId:program.gameId,series,fromReleases:[program.release],toRelease:'lighthouse-2',migrate});
it('restores a complete durable closure into fresh branches, preserving previous revisions and leaving authority untouched',async()=>{
  const {store,snapshot}=await saved(),recipe=defineRestoreRecipe('restore-count',[{op:'profile.i32.add.checked',at:'fixture:count',key:'loads',delta:1}]);
  await store.import({id:'original',slot:'original',snapshot,profile:{revision:0,values:{loads:i32(4)},read:[]},metadata:{profileId:'import:original',label:'Synthetic only',recipe,onLoad:recipe,provenance:{fixture:true}}});
  await store.activate('A',snapshot,null,1);const before=await store.read('main'),backup=await store.backup(program.gameId,series,program.release),plan=prepareBackupRestore(backup,options);expect(plan.report()).toMatchObject({profiles:2,slots:2,migrationId:null});
  backup.profiles[0]!.profile.values.unlock=i32(99);const payload=materializeBackupRestore(plan,options),receipt=await store.restoreBackup({id:'restore',backup:payload});expect(await store.read('main')).toEqual(before);expect(await store.restoreBackup({id:'restore',backup:payload})).toEqual(receipt);
  const restoredQuick=receipt.slots.find(s=>s.slot==='quick')!,record=await store.readSlot(restoredQuick.restoredSlot);expect(record?.revision).toBe(2);expect(record?.previous).toEqual(snapshot);expect(record?.metadata?.profileId).toBe(receipt.profiles.find(p=>p.id==='main')?.restoredId);
  const restoredSource=await store.readSlot(receipt.slots.find(s=>s.slot==='original')!.restoredSlot);expect(restoredSource?.metadata?.recipe).toEqual(recipe);expect(restoredSource?.metadata?.provenance).toEqual({fixture:true});expect((await store.read(receipt.profiles.find(p=>p.id==='import:original')!.restoredId)).profile.values.loads).toEqual(i32(4));
  expect((await store.read(receipt.profiles.find(p=>p.id==='main')!.restoredId)).profile.values.unlock).toEqual(i32(9));await store.confirm('A');
});
it('rejects changed commit payloads and missing profile/previous closure without partial writes',async()=>{
  const {store,backup}=await saved(),before=await store.listSlots(),bad=parsePortableBackup(backup);bad.slots[0]!.metadata.profileId='absent';await expect(store.restoreBackup({id:'missing',backup:bad})).rejects.toThrow('BACKUP_PROFILE_MISSING');expect(await store.listSlots()).toEqual(before);
  const previous=parsePortableBackup(backup);delete previous.slots[0]!.previousMetadata;expect(()=>prepareBackupRestore(previous,options)).toThrow('BACKUP_PREVIOUS_METADATA');
  await store.restoreBackup({id:'one',backup});backup.profiles[0]!.profile.values.unlock=i32(10);await expect(store.restoreBackup({id:'one',backup})).rejects.toThrow('BACKUP_ID_REUSED');expect(await store.listSlots()).toHaveLength(before.length*2);
});
it('requires matching game/series and bounds the package before storage mutation',async()=>{
  const {store,backup}=await saved();await expect(store.backup('another',series,program.release)).rejects.toThrow('BACKUP_NAMESPACE');expect(()=>prepareBackupRestore(backup,{...options,series:'other'})).toThrow('BACKUP_NAMESPACE');
  const duplicate=parsePortableBackup(backup);duplicate.profiles.push(duplicate.profiles[0]!);expect(()=>prepareBackupRestore(duplicate,options)).toThrow('BACKUP_PROFILE_DUPLICATE');
  const large=parsePortableBackup(backup);large.profiles[0]!.profile.read=Array.from({length:10000},(_,i)=>'large:'+i+':'.repeat(120));await expect(store.restoreBackup({id:'too-large',backup:large})).rejects.toThrow('BACKUP_SIZE');expect(await store.listSlots()).toHaveLength(1);
  const authority={...backup,head:{id:'old'}};expect(()=>prepareBackupRestore(authority,options)).toThrow('SCHEMA_BACKUP');
});
it('refuses missing releases, deleted nodes and stale text revisions while preserving the exact old backup',async()=>{
  const {store,backup}=await saved(),original=JSON.stringify(backup),target=revised();expect(()=>prepareBackupRestore(backup,{program:target,series})).toThrow('BACKUP_RELEASE_UNAVAILABLE');
  const relabel=migration(input=>{const b=parsePortableBackup(input);b.release=target.release;for(const s of b.slots){s.snapshot.release=target.release;if(s.previous)s.previous.release=target.release;}return b;});expect(()=>prepareBackupRestore(backup,{program:target,series,migration:relabel})).toThrow('RESTORE_TEXT');
  const deleted=parseProgram(program);deleted.functions[0]!.code=deleted.functions[0]!.code.filter(i=>i.at!=='main:opening-1');expect(()=>prepareBackupRestore(backup,{program:deleted,series})).toThrow('RESTORE_FRAME');expect(JSON.stringify(backup)).toBe(original);expect(await store.backup(program.gameId,series,program.release)).toEqual(backup);
});
it('explicit full migration resets changed text reveal/read-unit and restores through the production Core',async()=>{
  const {store,backup}=await saved(),target=revised();backup.profiles[0]!.profile.read=['opening.1@zh-1','other@v1'];backup.slots[0]!.snapshot.text!.revealed=8;
  const plan=prepareBackupRestore(backup,{program:target,series,migration:migration()}),payload=materializeBackupRestore(plan,{program:target,series});expect(plan.report().migrationId).toBe('lighthouse.zh2');expect(payload.profiles[0]!.profile.read).toEqual(['other@v1']);expect(payload.slots[0]!.snapshot.text?.revealed).toBe(0);
  const receipt=await store.restoreBackup({id:'migrated',backup:payload}),record=await store.readSlot(receipt.slots[0]!.restoredSlot),profile=(await store.read(receipt.profiles[0]!.restoredId)).profile;const core=new Core(target,profile,record?.snapshot);expect(core.view().run.text?.content).toContain('新译文');expect((await store.readSlot('quick'))?.snapshot.release).toBe(program.release);expect(backup.slots[0]!.snapshot.text?.revealed).toBe(8);
});
it('isolates migration inputs/outputs, rejects closure loss and binds plans to the full Program and registry',async()=>{
  const {backup}=await saved(),target=revised(),original=JSON.stringify(backup);let frozen=false,leaked:PortableBackup|undefined;
  const m=migration(input=>{frozen=Object.isFrozen(input)&&Object.isFrozen(input.slots[0]?.snapshot.text);leaked=translate(input);return leaked;});const plan=prepareBackupRestore(backup,{program:target,series,migration:m});expect(frozen).toBe(true);leaked!.slots[0]!.snapshot.frames[0]!.pc='deleted:later';expect(materializeBackupRestore(plan,{program:target,series}).slots[0]!.snapshot.frames[0]!.pc).toBe('main:opening-1');
  const loss=migration(input=>{const b=translate(input);b.slots=[];return b;});expect(()=>prepareBackupRestore(backup,{program:target,series,migration:loss})).toThrow('CONTENT_MIGRATION_CLOSURE');
  const changed=parseProgram(target);changed.title='Changed';expect(()=>materializeBackupRestore(plan,{program:changed,series})).toThrow('BACKUP_PLAN_STALE');expect(()=>materializeBackupRestore(plan,{program:target,series,operations:createOperationRegistry([])})).toThrow('BACKUP_PLAN_STALE');expect(JSON.stringify(backup)).toBe(original);
});
it('supports profile-only durable backups and requires release mapping even without slots',async()=>{
  const store=new MemoryStore();await store.progress({id:'read',baseRevision:0,through:1,changes:[{seq:1,type:'read',unit:'opening.1@zh-1'}]},null);const backup=await store.backup(program.gameId,series,program.release);expect(backup.slots).toHaveLength(0);expect(()=>prepareBackupRestore(backup,{program:revised(),series})).toThrow('BACKUP_RELEASE_UNAVAILABLE');
  const plan=prepareBackupRestore(backup,{program:revised(),series,migration:migration()}),receipt=await store.restoreBackup({id:'profile-only',backup:materializeBackupRestore(plan,{program:revised(),series})});expect(receipt.slots).toHaveLength(0);expect((await store.read(receipt.profiles[0]!.restoredId)).profile.read).toEqual([]);
});
it('migration failures and the wrong registered source do not modify old progress',async()=>{
  const {store,backup}=await saved(),before=await store.backup(program.gameId,series,program.release),target=revised();
  expect(()=>prepareBackupRestore(backup,{program:target,series,migration:migration(()=>{throw new Error('Author mapping failed');})})).toThrow('CONTENT_MIGRATION_FAILED');
  const other=defineContentMigration({id:'other',gameId:program.gameId,series,fromReleases:['not-this-release'],toRelease:target.release,migrate:translate});expect(()=>prepareBackupRestore(backup,{program:target,series,migration:other})).toThrow('CONTENT_MIGRATION_SOURCE');
  expect(await store.backup(program.gameId,series,program.release)).toEqual(before);expect(await store.listSlots()).toHaveLength(1);
});
