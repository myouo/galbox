import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {MemoryStore} from '../../packages/galbox-sdk/src/testing/index.js';
import {Core} from '../../packages/galbox-sdk/src/core/index.js';
import {parseDatabase} from '../../packages/galbox-sdk/src/runtime/durable.js';
import {i32} from '../../packages/galbox-sdk/src/protocol/index.js';
import type {StoreImport} from '../../packages/galbox-sdk/src/protocol/index.js';
const p:unknown=JSON.parse(readFileSync('tests/fixtures/game-data/standard-novel/program.json','utf8'));
function snapshot(){const core=new Core(p);core.run(100);return core.capture();}
function imported(id='one'):StoreImport{return {id,slot:`source-${id}`,snapshot:snapshot(),profile:{revision:0,values:{loads:i32(4)},read:[]},metadata:{profileId:`import:${id}`,label:'Synthetic fixture'}};}
it('import atomically adds a fresh profile and slot without touching the current head/profile',async()=>{
 const store=new MemoryStore();await store.progress({id:'web',baseRevision:0,through:1,changes:[{seq:1,type:'set',key:'webOnly',value:i32(9)}]},null);await store.save('quick',snapshot(),0);const before=await store.read();
 const data=imported(),receipt=await store.import(data);expect(await store.read()).toEqual(before);expect((await store.read('import:one')).profile.values.loads).toEqual(i32(4));expect((await store.readSlot(receipt.slot))?.metadata?.profileId).toBe('import:one');expect(await store.import(data)).toEqual(receipt);expect(await store.listSlots()).toHaveLength(2);
 await expect(store.import({...data,profile:{...data.profile,values:{loads:i32(5)}}})).rejects.toThrow('IMPORT_ID_REUSED');await expect(store.save('quick',snapshot(),1,data.metadata)).rejects.toThrow('SLOT_PROFILE_CONFLICT');expect((await store.read('main')).profile.values.webOnly).toEqual(i32(9));
});
it('activation updates only the selected profile, is idempotent and preserves prior committed effects',async()=>{
 const store=new MemoryStore(),data=imported();await store.import(data);
 const batch={id:'A:initial',baseRevision:0,through:1,changes:[{seq:1,type:'set' as const,key:'loads',value:i32(5)}]};const a=await store.activate('A',data.snapshot,null,0,batch,{profileId:'import:one'});expect(a.profileId).toBe('import:one');expect((await store.read()).profile.values.loads).toEqual(i32(5));expect((await store.read('main')).profile.values.loads).toBeUndefined();await store.activate('A',data.snapshot,null,0,batch,{profileId:'import:one'});expect((await store.read()).profile.revision).toBe(1);
 await expect(store.activate('A',data.snapshot,null,0,undefined,{profileId:'import:one'})).rejects.toThrow('ACTIVATION_ID_REUSED');
 await store.activate('B',data.snapshot,'A',1,{id:'B:initial',baseRevision:1,through:1,changes:[{seq:1,type:'set',key:'loads',value:i32(6)}]},{profileId:'import:one'});await store.confirm('B');await expect(store.confirm('A')).rejects.toThrow('ACTIVATION_SUPERSEDED');await expect(store.progress({id:'late',baseRevision:2,through:1,changes:[{seq:1,type:'set',key:'loads',value:i32(99)}]},'A')).rejects.toThrow('SESSION_REVOKED');expect((await store.read('import:one')).profile.values.loads).toEqual(i32(6));
});
it('pending claims keep one semantic activation while revoking prior host owners',async()=>{
 const store=new MemoryStore();await store.activate('A',snapshot(),null,0,{id:'initial',baseRevision:0,through:1,changes:[{seq:1,type:'set',key:'loads',value:i32(1)}]});const b=await store.claim('A','host-B');expect(b.id).toBe('A');expect(b.sequence).toBe(2);await expect(store.confirm('A','A')).rejects.toThrow('ACTIVATION_SUPERSEDED');await store.claim('A','host-C');await expect(store.confirm('A','host-B')).rejects.toThrow('ACTIVATION_SUPERSEDED');await store.confirm('A','host-C');await expect(store.claim('A','host-D')).rejects.toThrow('ACTIVATION_SUPERSEDED');expect((await store.read()).profile.values.loads).toEqual(i32(1));
});
it('rejects malformed progress and prototype keys before corrupting storage',async()=>{
 const store=new MemoryStore();const bad={id:'bad',baseRevision:0,through:1,changes:[{seq:1,type:'read' as const,unit:42}]};
 // @ts-expect-error JavaScript-side boundary negative
 await expect(store.progress(bad,null)).rejects.toThrow('SCHEMA_PROGRESS_BATCH');
 expect((await store.read()).profile).toEqual({revision:0,values:{},read:[]});await expect(store.save('__proto__',snapshot(),0)).rejects.toThrow('STORAGE_KEY');expect(await store.readSlot('__proto__')).toBeNull();
});

it('reads legacy M2 rows without losing main profile or requiring new metadata',()=>{
 const saved=snapshot();delete saved.invocations;const head={id:'old',sequence:1,status:'activated',snapshot:saved};const state=parseDatabase({profile:{revision:2,values:{legacy:i32(7)},read:['opening.1@zh-1']},slots:{quick:{revision:1,snapshot:saved,previous:null}},head,activations:{old:head},receipts:{}});
 expect(state.profile.revision).toBe(2);expect(state.profile.values.legacy).toEqual(i32(7));expect(state.slots.quick?.metadata?.profileId).toBe('main');expect(state.head?.owner).toBe('old');const restored=new Core(p,state.profile,state.slots.quick?.snapshot);expect(restored.view().profile.values.legacy).toEqual(i32(7));expect(restored.view().profile.revision).toBe(2);
});
it('rejects a valid batch whose combined profile exceeds wire limits without committing a partial value or receipt',async()=>{
 const store=new MemoryStore(),data=imported('bounded');data.profile.read=Array.from({length:20000},(_,i)=>`unit${i}@v1`);await store.import(data);await store.activate('bounded',data.snapshot,null,0,undefined,{profileId:data.metadata.profileId});const before=await store.read(data.metadata.profileId);
 await expect(store.progress({id:'bound',baseRevision:0,through:2,changes:[{seq:1,type:'set',key:'partial',value:i32(9)},{seq:2,type:'read',unit:'overflow@v1'}]},'bounded')).rejects.toThrow('SCHEMA_PROFILE');expect(await store.read(data.metadata.profileId)).toEqual(before);
 const retry=await store.progress({id:'bound',baseRevision:0,through:1,changes:[{seq:1,type:'read',unit:'unit0@v1'}]},'bounded');expect(retry.revision).toBe(1);expect((await store.read(data.metadata.profileId)).profile.read).toHaveLength(20000);expect((await store.read(data.metadata.profileId)).profile.values.partial).toBeUndefined();
});
