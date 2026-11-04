import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {MemoryStore} from 'galbox-sdk/testing';
import {createCore} from 'galbox-sdk/core';
import {i32} from 'galbox-sdk/protocol';
import type {StoreImport} from 'galbox-sdk/protocol';
import {databaseState,parseDatabase,commitImport,commitActivation,commitProgress} from '../../packages/galbox-sdk/src/runtime/durable.js';
const program:unknown=JSON.parse(readFileSync('tests/fixtures/game-data/standard-novel/program.json','utf8'));
function snapshot(){const c=createCore(program);c.run(100);return c.capture();}
function data(id:string,count:number):StoreImport{return {id,slot:'source-'+id,snapshot:snapshot(),profile:{revision:0,values:{},read:Array.from({length:count},(_,n)=>'historical-unit-'+String(n).padStart(6,'0')+'-'+'x'.repeat(37)+'@revision-'+'b'.repeat(16))},metadata:{profileId:'import:'+id,label:'Full progress'}};}
it('imports complete-length read identities once without retaining a duplicate profile in its receipt',async()=>{
 const store=new MemoryStore(),input=data('large',33000),before=JSON.stringify(input),r=await store.import(input);expect(before.length*2).toBeGreaterThan(4_000_000);expect(r.signature).toMatch(/^sha256-json-v1:[a-f0-9]{64}$/);expect((await store.read('import:large')).profile.read).toEqual(input.profile.read);expect(await store.import(input)).toEqual(r);expect(JSON.stringify(input)).toBe(before);
 const changed={...input,profile:{...input.profile,read:[...input.profile.read.slice(0,-1),'changed@v1']}};await expect(store.import(changed)).rejects.toThrow('IMPORT_ID_REUSED');expect((await store.readSlot(r.slot))?.revision).toBe(1);
 // The real hot-root bound is unchanged: a second independent full profile still refuses atomically.
 const second=data('second',20000);await expect(store.import(second)).rejects.toThrow('STORAGE_SIZE');expect(await store.readSlot(second.slot)).toBeNull();await store.import({...second,profile:{revision:0,values:{},read:[]}});expect((await store.read('import:large')).profile.read).toEqual(input.profile.read);
});
it('compacts old exact-JSON import identities without changing their retry or mismatch semantics',()=>{
 const old=databaseState(),input=data('legacy',100);const receipt=commitImport(old,input);old.imports[input.id]={...receipt,signature:JSON.stringify(input)};const raw=JSON.stringify(old),next=parseDatabase(old);expect(next.imports[input.id]?.signature).toMatch(/^sha256-json-v1:/);expect(JSON.stringify(old)).toBe(raw);expect(commitImport(next,input)).toEqual(next.imports[input.id]);expect(()=>commitImport(next,{...input,metadata:{...input.metadata,label:'changed'}})).toThrow('IMPORT_ID_REUSED');expect(next.slots[input.slot]?.revision).toBe(1);
});
it('legacy progress and pending-activation retry retain profile, authority and content checks',()=>{
 const old=databaseState(),cut=snapshot(),batch={id:'initial',baseRevision:0,through:1,changes:[{seq:1,type:'set' as const,key:'score',value:i32(4)}]};commitActivation(old,'A',cut,null,0,batch);old.receipts.initial!.signature=JSON.stringify(batch);const next=parseDatabase(old);expect(commitActivation(next,'A',cut,null,0,batch).id).toBe('A');expect(commitProgress(next,batch,'A').revision).toBe(1);expect(next.profile.values.score).toEqual(i32(4));expect(()=>commitProgress(next,{...batch,changes:[{seq:1,type:'set',key:'score',value:i32(5)}]},'A')).toThrow('COMMIT_ID_REUSED');expect(()=>commitProgress(next,batch,'other')).toThrow('SESSION_REVOKED');
});
