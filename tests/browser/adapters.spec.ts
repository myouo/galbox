import { test,expect } from '@playwright/test';
import type * as Harness from './harness/sdk.js';
test('browser resource identity, digest, owned bytes, cancellation lease and actual decode failure',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=sdk.parseProgram(await(await fetch('/program.json')).json()),asset=p.assets[0];if(!asset)throw new Error('asset');
  const original=new Uint8Array(await(await fetch('/'+asset.path)).arrayBuffer());let released=0;
  const provider:sdkTypeProvider={async acquire(){return {release:p.release,id:asset.id,kind:asset.kind,mime:asset.mime,bytes:original,releaseLease(){released++;original.fill(0);}};}};
  type sdkTypeProvider=import('galbox-sdk/player').AssetProvider;
  const bytes=await sdk.verifiedBytes(provider,p,asset,new AbortController().signal);
  let identity='',digest='',cancel='';
  try {await sdk.verifiedBytes({async acquire(r,s){const lease=await provider.acquire(r,s);return {...lease,release:'R2'};}},p,asset,new AbortController().signal);}catch(e){identity=String(e);}
  try {await sdk.verifiedBytes(provider,p,asset,new AbortController().signal);}catch(e){digest=String(e);}
  const abort=new AbortController();const late={async acquire(){await Promise.resolve();abort.abort();return {release:p.release,id:asset.id,kind:asset.kind,mime:asset.mime,bytes:original,releaseLease(){released++;}};}};
  try {await sdk.verifiedBytes(late,p,asset,abort.signal);}catch(e){cancel=String(e);}
  const bad=sdk.parseProgram(p),audio=bad.assets.find(a=>a.kind==='audio');if(!audio)throw new Error('audio');const invalid=new Uint8Array([1,2,3,4]);audio.sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',invalid)),x=>x.toString(16).padStart(2,'0')).join('');
  const http=sdk.createHttpProvider(p,location.href);const broken={async acquire(r:Parameters<sdkTypeProvider['acquire']>[0],s:AbortSignal){if(r.asset.id===audio.id)return {release:p.release,id:audio.id,kind:audio.kind,mime:audio.mime,bytes:invalid,releaseLease(){}};return http.acquire(r,s);}};
  const mount=document.createElement('div');document.body.append(mount);let decode='';try {await sdk.createPlayer({program:bad,provider:broken,mount,saveCompatibilitySeries:'decode-test',database:'adapters'});}catch(e){decode=String(e);}
  return {released,owned:bytes[0]!==original[0],identity,digest,cancel,decode,canvases:mount.querySelectorAll('canvas').length};
 });
 expect(results).toMatchObject({released:4,owned:true,canvases:0});expect(results.identity).toContain('ASSET_IDENTITY');expect(results.digest).toContain('ASSET_DIGEST');expect(results.cancel).toContain('ASSET_CANCELLED');expect(results.decode).toContain('AUDIO_FORMAT');
});
test('real IndexedDB isolates namespaces and rejects profile/slot/head conflicts',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=await(await fetch('/program.json')).json();const c=new sdk.Core(p);c.run(100);const snap=c.capture();
  const a=await sdk.openStore('game-A/series1','isolation'),b=await sdk.openStore('game-B/series1','isolation');
  const batch={id:'batch',baseRevision:0,through:1,changes:[{seq:1,type:'set' as const,key:'route',value:sdk.string('shore')}]};await a.progress(batch,null);await a.progress(batch,null);await a.save('same',snap,0);
  let profileConflict='',slotConflict='',stale='';try{await a.progress({...batch,id:'conflict'},null);}catch(e){profileConflict=String(e);}try{await a.save('same',snap,0);}catch(e){slotConflict=String(e);}
  await a.activate('A',snap,null,1);await a.activate('B',snap,'A',1);await a.confirm('B');try{await a.confirm('A');}catch(e){stale=String(e);}
  a.close();const restart=await sdk.openStore('game-A/series1','isolation');const state=await restart.read(),other=await b.read(),otherSlot=await b.readSlot('same');restart.close();b.close();
  return {revision:state.profile.revision,head:state.head?.id,other:other.profile.revision,otherSlot,profileConflict,slotConflict,stale};
 });expect(result).toMatchObject({revision:1,head:'B',other:0,otherSlot:null});expect(result.profileConflict).toContain('PROFILE_CONFLICT');expect(result.slotConflict).toContain('SLOT_CONFLICT');expect(result.stale).toContain('ACTIVATION_SUPERSEDED');
});
declare global { interface Window { partialPlayer?:import('galbox-sdk/player').Player; } }
test('public Player saves partial animation group, resumes with new audio epoch, cleans instances',async({page})=>{
 const time=new Date('2026-10-25T00:00:00Z');await page.clock.install({time});await page.goto('/');await page.locator('body').click({position:{x:1,y:1}});
 await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=await(await fetch('/program.json')).json();const mount=document.createElement('div');mount.id='partial-stage';mount.style.cssText='width:640px;height:360px;position:relative';document.body.append(mount);
  const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'partial',database:'partial'});window.partialPlayer=player;await player.start();
 });
 // Use the installed clock's fixed future point; a second RPC can outlive a 100 ms margin.
 await page.clock.pauseAt(new Date(time.getTime()+60000));
 await page.evaluate(async()=>{const player=window.partialPlayer;if(!player)throw new Error('player');
  for(let j=0;j<3;j++){const w=player.getSnapshot().core?.run.wait;if(w?.kind!=='text')throw new Error('text');await player.input('reveal',w.prompt,player.getSnapshot().epoch);await player.input('advance',w.prompt,player.getSnapshot().epoch);}
 });
 await page.clock.runFor(608);
 const cuts=await page.evaluate(async()=>{const player=window.partialPlayer;if(!player)throw new Error('player');player.setPaused(true);const before=player.capture();await player.save('half');await player.load('half');const after=player.capture();player.setPaused(false);return {before:before.tasks.filter(t=>t.kind==='animation'),after:after.tasks.filter(t=>t.kind==='animation')};});
 expect(cuts.before.map(t=>t.status)).toEqual(['completed','running']);expect(cuts.after).toEqual(cuts.before);
 await page.clock.runFor(640);
 const final=await page.evaluate(()=>{const player=window.partialPlayer;if(!player)throw new Error('player');const v=player.getSnapshot();player.dispose();player.dispose();return {wait:v.core?.run.wait?.kind,visits:v.core?.run.globals.visits,consumed:v.core?.run.groups.filter(g=>g.consumed).length,active:player.getSnapshot().media.active,canvas:document.querySelectorAll('#partial-stage canvas').length};});
 expect(final).toEqual({wait:'choice',visits:{kind:'i32',value:1},consumed:1,active:0,canvas:0});
});
test('load generations retain current profile and a delayed older preparation never takes over',async({page})=>{
 await page.goto('/');await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=await(await fetch('/program.json')).json();const base=new sdk.MemoryStore();
  let release:(()=>void)|undefined,entered:(()=>void)|undefined;const ready=new Promise<void>(resolve=>{entered=resolve;});let delay=false;
  const store:import('galbox-sdk/player').Store={read:()=>base.read(),save:base.save.bind(base),progress:base.progress.bind(base),activate:base.activate.bind(base),confirm:base.confirm.bind(base),close(){},async readSlot(slot){if(slot==='A'&&delay){entered?.();await new Promise<void>(resolve=>{release=resolve;});}return base.readSlot(slot);}};
  const mount=document.createElement('div');document.body.append(mount);const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'generations',store});await player.start();await player.save('A');
  let w=player.getSnapshot().core?.run.wait;if(w?.kind!=='text')throw new Error('text');await player.input('reveal',w.prompt,player.getSnapshot().epoch);await player.input('advance',w.prompt,player.getSnapshot().epoch);await player.save('B');
  delay=true;let oldError='';const old=player.load('A').catch(e=>{oldError=String(e);});await ready;
  // Old session can gain progress during preparation; final activation must hand it off.
  w=player.getSnapshot().core?.run.wait;if(w?.kind!=='text')throw new Error('text');await player.input('reveal',w.prompt,player.getSnapshot().epoch);await player.input('advance',w.prompt,player.getSnapshot().epoch);
  await player.load('B');release?.();await old;const view=player.getSnapshot();const durable=await base.read();player.dispose();
  return {oldError,text:view.core?.run.text?.textId,read:view.core?.profile.read,durable:durable.profile.read};
 });expect(result.oldError).toContain('LOAD_SUPERSEDED');expect(result.text).toBe('opening.2');expect(result.read).toEqual(['opening.1@zh-1','opening.2@zh-1']);expect(result.durable).toEqual(result.read);
});
test('save already inside storage commit reports success after dispose; resources stay released',async({page})=>{
 await page.goto('/');await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=await(await fetch('/program.json')).json();const base=new sdk.MemoryStore();
  let entered:(()=>void)|undefined,release:(()=>void)|undefined;const ready=new Promise<void>(resolve=>{entered=resolve;});
  const store:import('galbox-sdk/player').Store={read:()=>base.read(),readSlot:base.readSlot.bind(base),progress:base.progress.bind(base),activate:base.activate.bind(base),confirm:base.confirm.bind(base),close(){},async save(slot,snapshot,revision){const committed=await base.save(slot,snapshot,revision);entered?.();await new Promise<void>(resolve=>{release=resolve;});return committed;}};
  const mount=document.createElement('div');document.body.append(mount);const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'dispose',store});await player.start();
  const saving=player.save('commit');await ready;player.dispose();release?.();const saved=await saving;return {saved,slot:(await base.readSlot('commit'))?.revision,canvas:mount.querySelectorAll('canvas').length,active:player.getSnapshot().media.active};
 });expect(result).toMatchObject({saved:{slot:'commit',revision:1,disposed:true},slot:1,canvas:0,active:0});
});
test('blocked real audio startup retries the same task without repeating narrative updates',async({page})=>{
 await page.goto('/');await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=await(await fetch('/program.json')).json();const mount=document.createElement('div');document.body.append(mount);
  const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'retry',database:'retry'});
  const create=AudioContext.prototype.createBufferSource;let fail=true;
  AudioContext.prototype.createBufferSource=function(){if(fail){fail=false;throw new Error('Injected device start failure');}return create.call(this);};
  try {await player.start();for(let j=0;j<100&&player.getSnapshot().core?.run.tasks[0]?.status==='running';j++)await new Promise<void>(r=>setTimeout(r,10));const blocked=player.getSnapshot();await player.retryAudio();for(let j=0;j<100&&player.getSnapshot().core?.run.tasks[0]?.status==='running';j++)await new Promise<void>(r=>setTimeout(r,10));const success=player.getSnapshot();const first=blocked.core?.run.tasks.find(t=>t.kind==='audio'),second=success.core?.run.tasks.find(t=>t.kind==='audio');player.dispose();return {first,second,visits:success.core?.run.globals.visits,starts:success.media.starts};}
  finally {AudioContext.prototype.createBufferSource=create;player.dispose();}
 });expect(result.first?.status).toBe('blocked');expect(result.second?.status).toBe('completed');expect(result.first?.id).toBe(result.second?.id);expect(result.second?.attempt).toBe((result.first?.attempt??0)+1);expect(result.visits).toEqual({kind:'i32',value:0});expect(result.starts).toBe(1);
});
test('old input epoch cannot act on an identical restored prompt; pause reasons remain independent',async({page})=>{
 await page.goto('/');await page.locator('body').click({position:{x:1,y:1}});const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=await(await fetch('/program.json')).json();const mount=document.createElement('div');document.body.append(mount);const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'input',database:'input'});
  await player.start();const oldEpoch=player.getSnapshot().epoch;const prompt=player.getSnapshot().core?.run.wait;if(prompt?.kind!=='text')throw new Error('prompt');await player.input('reveal',prompt.prompt,oldEpoch);await player.save();await player.load();
  await player.input('advance',prompt.prompt,oldEpoch);const ignored=player.getSnapshot().core?.run.text?.textId;
  player.setPaused(true);player.setMenu(true);player.setMenu(false);const paused=player.getSnapshot().paused;player.setPaused(false);
  player.setFast(true);window.dispatchEvent(new Event('blur'));const blur={fast:player.getSnapshot().fast,paused:player.getSnapshot().paused};window.dispatchEvent(new Event('focus'));
  await player.input('advance',prompt.prompt,player.getSnapshot().epoch);const advanced=player.getSnapshot().core?.run.text?.textId;player.dispose();return {ignored,paused,blur,advanced};
 });expect(result).toEqual({ignored:'opening.1',paused:true,blur:{fast:false,paused:true},advanced:'opening.2'});
});
test('postcommit failure retries the same activation; a new load supersedes it permanently',async({page})=>{
 await page.goto('/');await page.locator('body').click({position:{x:1,y:1}});const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=sdk.parseProgram(await(await fetch('/program.json')).json()),main=p.functions[0];if(!main)throw new Error('main');
  main.entry='main:boot';main.code.unshift(sdk.instruction('profile.set',{at:'main:boot',key:'booted',value:sdk.bool(true)}),sdk.instruction('profile.flush',{at:'main:boot-flush'}));
  const base=new sdk.MemoryStore();let fail=true;const store:import('galbox-sdk/player').Store={read:base.read.bind(base),readSlot:base.readSlot.bind(base),save:base.save.bind(base),progress:base.progress.bind(base),claim:base.claim.bind(base),activate:(id,snapshot,head,revision,initial,options)=>{if(initial&&(!Object.isFrozen(initial)||!Object.isFrozen(initial.changes)))throw new Error('Mutable initial batch');return base.activate(id,snapshot,head,revision,initial,options);},close(){},async confirm(id,owner){if(fail){fail=false;throw new Error('Confirmation unavailable after persistent commit');}return base.confirm(id,owner);}};
  const mount=document.createElement('div');document.body.append(mount);const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'postcommit',store});let failure='';try{await player.start();}catch(e){failure=String(e);}
  const a=await base.read(),pending=player.getSnapshot().lifecycle;if(!a.head)throw new Error('head');await player.resumeCommitted(a.head.id);const recovered=await base.read();let staleOwner='';try{await base.confirm(a.head.id);}catch(e){staleOwner=String(e);}
  await base.save('checkpoint',a.head.snapshot,0);await player.load('checkpoint');const b=await base.read();let stale='';try{await base.confirm(a.head.id);}catch(e){stale=String(e);}player.dispose();
  const restarted=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'postcommit',store});let activeError='';try{await restarted.resumeCommitted();}catch(e){activeError=String(e);}const c=await base.read();restarted.dispose();
  return {failure,pending,boot:a.profile.values.booted?.value,revisions:[a.profile.revision,recovered.profile.revision,b.profile.revision,c.profile.revision],heads:[a.head.id,recovered.head?.id,b.head?.id,c.head?.id],staleOwner,stale,activeError};
 });expect(result.failure).toContain('Confirmation unavailable');expect(result.pending).toBe('committed-pending');expect(result.boot).toBe(true);expect(result.revisions).toEqual([1,1,1,1]);expect(result.heads[0]).toBe(result.heads[1]);expect(result.heads[2]).toBe(result.heads[3]);expect(new Set(result.heads).size).toBe(2);expect(result.staleOwner).toContain('ACTIVATION_SUPERSEDED');expect(result.stale).toContain('ACTIVATION_SUPERSEDED');expect(result.activeError).toContain('ACTIVATION_NOT_PENDING');
});
test('missing Web Audio fails with an explicit unavailable diagnostic and no leftover canvas',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'开始阅读',exact:true})).toBeVisible();const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=await(await fetch('/program.json')).json();const mount=document.createElement('div');document.body.append(mount);const descriptor=Object.getOwnPropertyDescriptor(window,'AudioContext');let error='';
  try {Object.defineProperty(window,'AudioContext',{value:undefined,configurable:true});await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'missing-audio',database:'missing-audio'});}catch(e){error=String(e);}finally{if(descriptor)Object.defineProperty(window,'AudioContext',descriptor);}
  return {error,canvas:mount.querySelectorAll('canvas').length};
 });expect(result.error).toContain('AUDIO_UNAVAILABLE');expect(result.canvas).toBe(0);
});
test('initial Player activation plays a stop-on-restore one-shot; subsequent load stops it',async({page})=>{
 await page.goto('/');await page.locator('body').click({position:{x:1,y:1}});const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url);const p=sdk.parseProgram(await(await fetch('/program.json')).json());const audio=p.functions[0]?.code.find(i=>i.op==='audio.play');if(audio?.op!=='audio.play')throw new Error('audio');audio.loop=false;audio.restore='stop';
  const mount=document.createElement('div');document.body.append(mount);const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'initial-audio',database:'initial-audio'});await player.start();for(let j=0;j<100&&player.getSnapshot().core?.run.tasks[0]?.status==='running';j++)await new Promise<void>(r=>setTimeout(r,10));
  const started=player.getSnapshot();await player.save();await player.load();const restored=player.getSnapshot();player.dispose();return {starts:started.media.starts,task:started.core?.run.tasks[0]?.status,restoredStarts:restored.media.starts,active:restored.media.active};
 });expect(result).toEqual({starts:1,task:'completed',restoredStarts:1,active:0});
});
