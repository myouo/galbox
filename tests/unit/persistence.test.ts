import { it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Core } from '../../packages/galbox-sdk/src/core/index.js';
import { MemoryStore,Coordinator,VirtualHost,VirtualScheduler } from '../../packages/galbox-sdk/src/testing/index.js';
import type { ProgressBatch } from '../../packages/galbox-sdk/src/testing/index.js';
const program:unknown=JSON.parse(readFileSync('tests/fixtures/game-data/standard-novel/program.json','utf8'));
function snapshot(){const c=new Core(program);c.run(100);return c.capture();}
const batch=(id:string,revision:number,seq=1):ProgressBatch=>({id,baseRevision:revision,through:seq,changes:[{seq,type:'set',key:'unlocked',value:{kind:'bool',value:true}}]});
it('commits progress and receipts atomically; lost replies are idempotent and changed payload is rejected',async()=>{
 const store=new MemoryStore(),b=batch('lost',0);const receipt=await store.progress(b,null);expect(await store.progress(b,null)).toEqual(receipt);expect((await store.read()).profile.revision).toBe(1);
 await expect(store.progress({...b,through:3},null)).rejects.toThrow('COMMIT_ID_REUSED');
 await expect(store.progress(batch('conflict',0),null)).rejects.toThrow('PROFILE_CONFLICT');
});
it('late snapshot saves do not overwrite current profile; revisions retain the previous slot',async()=>{
 const store=new MemoryStore(),early=snapshot();await store.progress(batch('unlock',0),null);await store.save('quick',early,0);expect((await store.read()).profile.values.unlocked?.value).toBe(true);
 await expect(store.save('quick',early,0)).rejects.toThrow('SLOT_CONFLICT');await store.save('quick',early,1);expect((await store.readSlot('quick'))?.previous).toEqual(early);
});
it('persistent head prevents A resurrection after failed takeover and B activation',async()=>{
 const store=new MemoryStore(),s=snapshot();await store.activate('A',s,null,0);expect((await store.read()).head?.status).toBe('committed-pending');
 await store.progress(batch('A-progress',0),'A');await store.activate('B',s,'A',1);await store.confirm('B');
 await expect(store.confirm('A')).rejects.toThrow('ACTIVATION_SUPERSEDED');await expect(store.activate('A',s,'B',1)).rejects.toThrow('ACTIVATION_SUPERSEDED');await expect(store.progress(batch('late',1),'A')).rejects.toThrow('SESSION_REVOKED');expect((await store.read()).profile.revision).toBe(1);
});
it('acknowledges only committed prefix when new working changes arrive before the receipt',async()=>{
 const base=new MemoryStore();let unblock:(()=>void)|undefined;let entered:(()=>void)|undefined;const ready=new Promise<void>(resolve=>{entered=resolve;});
 const store={...base,read:()=>base.read(),readSlot:(s:string)=>base.readSlot(s),save:base.save.bind(base),activate:base.activate.bind(base),confirm:base.confirm.bind(base),close(){},async progress(b:ProgressBatch,a:string|null){const receipt=await base.progress(b,a);entered?.();await new Promise<void>(resolve=>{unblock=resolve;});return receipt;}};
 const c=new Core(program),schedule=new VirtualScheduler(),r=new Coordinator(c,new VirtualHost(),schedule,store,1,null,'prefix');
 const initial=r.start();schedule.drain();await initial;const w=c.view().run.wait;if(w?.kind!=='text')throw new Error('text');
 c.accept({type:'reveal',prompt:w.prompt,inputId:'r1'});c.accept({type:'advance',prompt:w.prompt,inputId:'a1'});c.run(100);const pending=r.flush();await ready;
 const w2=c.view().run.wait;if(w2?.kind!=='text')throw new Error('text');c.accept({type:'reveal',prompt:w2.prompt,inputId:'r2'});c.accept({type:'advance',prompt:w2.prompt,inputId:'a2'});c.run(100);
 unblock?.();await pending;expect(c.pending()).toHaveLength(1);expect(c.view().profile.read).toHaveLength(2);expect((await base.read()).profile.read).toHaveLength(1);r.stop();
});
it('freeze waits for a semantic boundary, holds host results, and thaw preserves their order',async()=>{
 const base=new MemoryStore(),scheduler=new VirtualScheduler();let report:Parameters<import('../../packages/galbox-sdk/src/runtime/ports.js').HostPort['effect']>[2]|undefined;let task:{id:string;attempt:number}|undefined;
 const host={effect(e:Parameters<import('../../packages/galbox-sdk/src/runtime/ports.js').HostPort['effect']>[0],_epoch:number,callback:NonNullable<typeof report>){if(e.type==='audio'){report=callback;task=e.task;}}};
 const c=new Core(program),r=new Coordinator(c,host,scheduler,base,1,null,'freeze',1);const start=r.start();scheduler.drain();await start;const freeze=r.freeze();scheduler.drain();await freeze;
 if(!task||!report)throw new Error('host');report(task.id,task.attempt,'completed');scheduler.drain();expect(c.view().run.tasks[0]?.status).toBe('running');
 await r.flushAll();r.thaw();scheduler.drain();expect(c.view().run.tasks[0]?.status).toBe('completed');r.stop();
});
it('activation atomically includes staged startup profile changes, and replay cannot apply them twice',async()=>{
 const store=new MemoryStore(),s=snapshot(),initial=batch('initial',0);await store.activate('start',s,null,0,initial);expect((await store.read()).profile.values.unlocked?.value).toBe(true);expect((await store.read()).profile.revision).toBe(1);await store.activate('start',s,null,0,initial);expect((await store.read()).profile.revision).toBe(1);
});
it('coordinator retries an immutable batch after the committed reply is lost',async()=>{
 const base=new MemoryStore();let lose=true;const ids:string[]=[];
 const store={read:()=>base.read(),readSlot:base.readSlot.bind(base),save:base.save.bind(base),activate:base.activate.bind(base),confirm:base.confirm.bind(base),close(){},async progress(b:ProgressBatch,a:string|null){ids.push(b.id);expect(Object.isFrozen(b)).toBe(true);expect(Object.isFrozen(b.changes)).toBe(true);const receipt=await base.progress(b,a);if(lose){lose=false;throw new Error('Reply lost after commit');}return receipt;}};
 const core=new Core(program);core.run(100);const w=core.view().run.wait;if(w?.kind!=='text')throw new Error('text');core.accept({type:'reveal',prompt:w.prompt,inputId:'r'});core.accept({type:'advance',prompt:w.prompt,inputId:'a'});core.run(100);
 const r=new Coordinator(core,new VirtualHost(),new VirtualScheduler(),store,1,null,'lost');await expect(r.flush()).rejects.toThrow('Reply lost');expect(core.pending()).toHaveLength(1);await r.flushAll();expect(core.pending()).toHaveLength(0);expect(ids).toHaveLength(2);expect(ids[0]).toBe(ids[1]);expect((await base.read()).profile.revision).toBe(1);r.stop();
});
it('a throwing subscriber cannot strand the serialized event or prevent other observers',async()=>{
 const schedule=new VirtualScheduler(),core=new Core(program),r=new Coordinator(core,new VirtualHost(),schedule,new MemoryStore(),1,null,'observers');let observed=0;r.subscribe(()=>{throw new Error('Observer failed');});r.subscribe(()=>{observed++;});const start=r.start();schedule.drain();await start;expect(observed).toBeGreaterThan(0);expect(r.subscriberError).toBe('Observer failed');expect(core.view().run.status).toBe('waiting');r.stop();
});
