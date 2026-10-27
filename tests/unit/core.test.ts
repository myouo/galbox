import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Core,validateRestore } from '../../packages/galbox-sdk/src/core/index.js';
import { parseProgram,parseInstruction,i32,readUnit } from '../../packages/galbox-sdk/src/protocol/index.js';
import { linkProgram } from '../../packages/galbox-sdk/src/program-tools/index.js';
import { Coordinator,VirtualHost,VirtualScheduler,MemoryStore } from '../../packages/galbox-sdk/src/testing/index.js';
const program:unknown=JSON.parse(readFileSync('tests/fixtures/game-data/standard-novel/program.json','utf8'));
function advance(core:Core,id:string){const w=core.view().run.wait;if(w&&'prompt'in w){core.accept({type:'reveal',prompt:w.prompt,inputId:`${id}:reveal`});core.accept({type:'advance',prompt:w.prompt,inputId:id});core.run(100);}}
function group(core:Core){core.run(100);advance(core,'1');advance(core,'2');advance(core,'3');expect(core.view().run.wait?.kind).toBe('group');}
describe('finite protocol and production Core',()=>{
 it('rejects malformed opcodes, args, values, assets and unsupported capabilities',()=>{
  expect(()=>parseInstruction({at:'bad',op:'value.set',dest:'a',value:{literal:{kind:'i32',value:2147483648}}})).toThrow('SCHEMA_INSTRUCTION');
  expect(()=>parseInstruction({at:'bad',op:'future.video'})).toThrow('SCHEMA_INSTRUCTION');
  expect(()=>parseInstruction({at:'bad',op:'control.end',extra:true})).toThrow('SCHEMA_INSTRUCTION');
  const p=parseProgram(program);p.capabilities.push('timed-choice');expect(()=>linkProgram(p)).toThrow('UNSUPPORTED_CAPABILITY');
  const p2=parseProgram(program);const image=p2.assets.find(a=>a.kind==='image');expect(image).toBeDefined();if(image)image.kind='audio';expect(()=>linkProgram(p2)).toThrow('ASSET_KIND');
  expect(()=>i32(2147483648)).toThrow('I32_RANGE');expect(()=>i32(1.2)).toThrow('I32_RANGE');
 });
 it('runs nested ABI and both routes, reveal alone is unread',()=>{
  for(const route of ['shore','tower']){
   const c=new Core(program);c.run(100);const text=c.view().run.text;expect(text).not.toBeNull();if(!text)throw new Error('text');
   c.accept({type:'reveal',prompt:text.prompt,inputId:'reveal'});expect(c.view().profile.read).not.toContain(readUnit(text));
   group(c);expect(c.view().run.globals.visits).toEqual(i32(1));c.accept({type:'tick',ms:1200});c.run(100);
   const w=c.view().run.wait;if(w?.kind!=='choice')throw new Error('choice');c.accept({type:'choose',option:route,prompt:w.prompt,inputId:'route'});c.run(100);
   for(let j=0;j<6;j++)advance(c,`route-${j}`);
   expect(c.view().run.status).toBe('ended');expect(c.view().profile.values[`${route}Unlocked`]).toEqual({kind:'bool',value:true});expect(c.view().profile.read).toHaveLength(9);
  }
 });
 it.each([0,600,1200])('restores closed group at %i ms without replaying completed members',ms=>{
  const c=new Core(program);group(c);c.accept({type:'tick',ms});c.run(100);
  const snapshot=c.capture();const restored=new Core(program,c.view().profile,snapshot);
  expect(restored.view().run.tasks.filter(t=>t.name==='fade')[0]?.status).toBe(ms>=400?'completed':'running');
  restored.accept({type:'tick',ms:1200-ms});restored.run(100);expect(restored.view().run.wait?.kind).toBe('choice');expect(restored.view().run.globals.visits).toEqual(i32(1));expect(restored.view().run.groups.filter(g=>g.consumed)).toHaveLength(1);
  const before=restored.capture();restored.accept({type:'task',task:'fade@5',attempt:0,result:'completed'});expect(restored.capture()).toEqual(before);
 });
 it('rejects invalid frame relation, wait phase, text revision and mutable aliases',()=>{
  const c=new Core(program);c.run(100);const s=c.capture();const edited=c.capture();if(edited.text)edited.text.content='mutated';expect(c.capture()).toEqual(s);expect(()=>validateRestore(program,edited)).toThrow('RESTORE_TEXT');
  const bad=c.capture();bad.frames[0]!.pc='helper:increment';expect(()=>validateRestore(program,bad)).toThrow('RESTORE_FRAME');
  const p=parseProgram(program);const caller=p.functions[0];if(!caller)throw new Error('main');const at=caller.code.findIndex(i=>i.op==='control.call');caller.code.splice(at,0,{at:'main:wait-call',op:'wait.delay',task:'wait-call',duration:1});
  const c2=new Core(p);c2.run(100);const owned=c2.view();if(owned.run.text){const t=c2.capture();t.text!.revealed=99999;expect(()=>validateRestore(p,t)).toThrow('RESTORE_TEXT');}
  const w=c.capture();w.wait={kind:'delay',at:w.frames[0]!.pc,task:'unknown'};expect(()=>validateRestore(program,w)).toThrow('RESTORE_PHASE');
 });
 it('produces identical canonical effects, run and profile with budgets 1/8/100',async()=>{
  const results=[];
  for(const budget of [1,8,100]){
   const host=new VirtualHost(),scheduler=new VirtualScheduler(),store=new MemoryStore(),c=new Core(program);
   const r=new Coordinator(c,host,scheduler,store,1,null,'trace',budget);
   async function send(e:Parameters<Coordinator['dispatch']>[0]){const promise=r.dispatch(e);scheduler.drain();await promise;await Promise.resolve();scheduler.drain();}
   await send({type:'tick',ms:0});for(let j=0;j<3;j++){const w=c.view().run.wait;if(!w||!('prompt'in w))throw new Error('prompt');await send({type:'reveal',prompt:w.prompt,inputId:`r${j}`});await send({type:'advance',prompt:w.prompt,inputId:`a${j}`});}
   await send({type:'tick',ms:600});const snap=c.capture();await send({type:'tick',ms:600});const w=c.view().run.wait;if(w?.kind!=='choice')throw new Error('choice');await send({type:'choose',prompt:w.prompt,inputId:'route',option:'shore'});
   for(let j=0;j<6;j++){const w=c.view().run.wait;if(w?.kind!=='text')break;await send({type:'reveal',prompt:w.prompt,inputId:`rr${j}`});await send({type:'advance',prompt:w.prompt,inputId:`aa${j}`});}
   await r.flushAll();results.push({snap,run:c.capture(),effects:host.effects,profile:c.view().profile});r.stop();
  }
  expect(results[1]).toEqual(results[0]);expect(results[2]).toEqual(results[0]);
 });
});
