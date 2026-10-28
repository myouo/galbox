import {test,expect} from '@playwright/test';
import type * as H from './harness/sdk.js';

for(const mode of ['buffer','element'] as const)test(`source-bound ${mode} fades restore through IndexedDB and stop only their own SFX buffer`,async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async mode=>{
  const url='http://127.0.0.1:4174/sdk.js',sdk:typeof H=await import(url),original=sdk.parseProgram(await(await fetch('/program.json')).json()),asset=original.assets.find(a=>a.kind==='audio');if(!asset)throw new Error('audio fixture');
  const b=new sdk.ProgramBuilder({gameId:`source-browser-${mode}`,release:'v1',entry:'main'}),sound=b.asset('audio',{...asset,id:'tone',playback:mode}),a=b.sfxBuffer('ambient'),other=b.sfxBuffer('effect');
  b.function({id:'main',entry:'a',layout:1,params:[],locals:[],returns:'void',code:[sdk.sfxTrack('a','a',sound,a,{loop:true,restore:'replay'}),sdk.sfxTrack('b','b',sound,other,{gain:.8,loop:true,restore:'replay'}),sdk.audioFadeOutAndStop('fade','fade','a',1800),sdk.instruction('text.page',{at:'page',textId:'page',revision:'v1',speaker:'',content:'Independent sounds'}),sdk.instruction('control.end',{at:'end'})]});
  const p=b.build(),mount=document.createElement('div');mount.style.cssText='position:relative;width:640px;height:360px';document.body.append(mount);
  const gains:GainNode[]=[],buffers:AudioBufferSourceNode[]=[],elements:HTMLMediaElement[]=[],makeGain=AudioContext.prototype.createGain,makeBuffer=AudioContext.prototype.createBufferSource,makeMedia=AudioContext.prototype.createMediaElementSource;
  AudioContext.prototype.createGain=function(){const value=makeGain.call(this);gains.push(value);return value;};
  AudioContext.prototype.createBufferSource=function(){const value=makeBuffer.call(this);buffers.push(value);return value;};
  AudioContext.prototype.createMediaElementSource=function(element){elements.push(element);return makeMedia.call(this,element);};
  let player:import('galbox-sdk/player').Player|undefined;
  const sleep=()=>new Promise<void>(r=>setTimeout(r,20));
  try{
   player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,database:`sources-${mode}`,saveCompatibilitySeries:'v1',graphics:{renderer:mode==='buffer'?'webgl':'canvas'}});await player.start();
   const live=player,find=(name:string)=>live.capture().tasks.find(t=>t.name===name);
   for(let n=0;n<100&&(find('a')?.gain??1)>.9;n++)await sleep();
   player.setPaused(true);const before=player.capture(),first=before.tasks.find(t=>t.name==='a');if(!first)throw new Error('source');
   const oldBuffer=buffers[0],bufferEnded=oldBuffer?.onended,oldElement=elements[0],elementEnded=oldElement?.onended;
   const late=()=>{if(mode==='buffer'&&oldBuffer&&bufferEnded)bufferEnded.call(oldBuffer,new Event('ended'));if(mode==='element'&&oldElement&&elementEnded)elementEnded.call(oldElement,new Event('ended'));};
   await player.save('mid');await player.load('mid');const restored=player.capture(),fresh=restored.tasks.find(t=>t.name==='a');if(!fresh)throw new Error('restore');
   const active=player.getSnapshot().media.active,restoredGains=gains.slice(-2).map(g=>g.gain.value);
   late();await sleep();const afterLate=player.capture().tasks.find(t=>t.name==='a')?.status;
   player.setPaused(false);for(let n=0;n<250&&find('a')?.status!=='cancelled';n++)await sleep();
   const final=player.capture(),media=player.getSnapshot().media,physicalClean=mode==='element'?elements.slice(0,-1).every(e=>!e.getAttribute('src')):buffers.slice(0,-1).every(b=>b.onended===null);
   player.dispose();return {mode,first,fresh,beforeTime:before.tasks.find(t=>t.name==='fade')?.elapsed,restoredTime:restored.tasks.find(t=>t.name==='fade')?.elapsed,active,restoredGains,afterLate,final,media,physicalClean,clean:player.getSnapshot().media.active,canvases:mount.querySelectorAll('canvas').length};
  }finally{player?.dispose();AudioContext.prototype.createGain=makeGain;AudioContext.prototype.createBufferSource=makeBuffer;AudioContext.prototype.createMediaElementSource=makeMedia;mount.remove();}
 },mode);
 expect(result.first.gain).toBeGreaterThan(0);expect(result.first.gain).toBeLessThan(.95);expect(result.fresh.id).toBe(result.first.id);expect(result.fresh.attempt).toBe(result.first.attempt+1);expect(result.restoredTime).toBe(result.beforeTime);expect(result.restoredGains[0]).toBeCloseTo(result.first.gain??0,4);expect(result.restoredGains[1]).toBeCloseTo(.8,4);expect(result.active).toBe(2);expect(result.afterLate).toBe('running');expect(result.final.tasks.find(t=>t.name==='a')?.status).toBe('cancelled');expect(result.final.tasks.find(t=>t.name==='b')?.status).toBe('running');expect(result.final.tasks.find(t=>t.name==='fade')?.status).toBe('completed');expect(result.media.active).toBe(1);expect(result.physicalClean).toBe(true);expect(result.clean).toBe(0);expect(result.canvases).toBe(0);
});

test('a replacement native source survives the old envelope deadline and stale end callback',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',sdk:typeof H=await import(url),original=sdk.parseProgram(await(await fetch('/program.json')).json()),asset=original.assets.find(a=>a.kind==='audio');if(!asset)throw new Error('audio');
  const b=new sdk.ProgramBuilder({gameId:'source-replacement',release:'v1',entry:'main'}),sound=b.asset('audio',{...asset,id:'tone'}),buffer=b.sfxBuffer('ambient');
  b.function({id:'main',entry:'old',layout:1,params:[],locals:[],returns:'void',code:[sdk.sfxTrack('old','tone',sound,buffer,{loop:true,restore:'replay'}),sdk.audioFadeOutAndStop('fade','fade','tone',700),sdk.instruction('wait.delay',{at:'delay',task:'delay',duration:200}),sdk.sfxTrack('new','tone',sound,buffer,{gain:.7,loop:true,restore:'replay'}),sdk.instruction('text.page',{at:'page',textId:'page',revision:'v1',speaker:'',content:'Replacement survives'}),sdk.instruction('control.end',{at:'end'})]});
  const p=b.build(),mount=document.createElement('div');mount.style.cssText='width:640px;height:360px';document.body.append(mount);const sources:AudioBufferSourceNode[]=[],make=AudioContext.prototype.createBufferSource;AudioContext.prototype.createBufferSource=function(){const source=make.call(this);sources.push(source);return source;};let player:import('galbox-sdk/player').Player|undefined;
  try{player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,store:new sdk.MemoryStore(),saveCompatibilitySeries:'v1',graphics:{renderer:'canvas'}});await player.start();const old=sources[0],late=old?.onended;await new Promise(r=>setTimeout(r,1000));if(old&&late)late.call(old,new Event('ended'));await new Promise(r=>setTimeout(r,30));return {snapshot:player.capture(),media:player.getSnapshot().media,count:sources.length,oldClean:old?.onended===null};}finally{player?.dispose();AudioContext.prototype.createBufferSource=make;mount.remove();}
 });expect(result.snapshot.tasks.find(t=>t.name==='fade')?.status).toBe('superseded');expect(result.snapshot.tasks.find(t=>t.at==='new')).toMatchObject({gain:.7,status:'running'});expect(result.media.active).toBe(1);expect(result.count).toBe(2);expect(result.oldClean).toBe(true);
});

test('initial activation plays stop-policy media while the active envelope remains unsaveable',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',sdk:typeof H=await import(url),original=sdk.parseProgram(await(await fetch('/program.json')).json()),asset=original.assets.find(a=>a.kind==='audio');if(!asset)throw new Error('audio');
  const b=new sdk.ProgramBuilder({gameId:'initial-source-stop',release:'v1',entry:'main'}),sound=b.asset('audio',{...asset,id:'tone'}),buffer=b.sfxBuffer('ambient');b.function({id:'main',entry:'a',layout:1,params:[],locals:[],returns:'void',code:[sdk.sfxTrack('a','a',sound,buffer,{loop:true,restore:'stop'}),sdk.audioFadeOutAndStop('fade','fade','a',500),sdk.instruction('text.page',{at:'page',textId:'page',revision:'v1',speaker:'',content:'Initial stop policy'}),sdk.instruction('control.end',{at:'end'})]});
  const p=b.build(),mount=document.createElement('div');mount.style.cssText='width:640px;height:360px';document.body.append(mount);const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,store:new sdk.MemoryStore(),saveCompatibilitySeries:'v1',graphics:{renderer:'canvas'}});
  try{await player.start();const initial=player.getSnapshot();let rejected='';try{await player.save('forbidden');}catch(e){rejected=String(e);}for(let i=0;i<150&&player.getSnapshot().core?.run.tasks.find(t=>t.name==='fade')?.status!=='completed';i++)await new Promise<void>(r=>setTimeout(r,20));await player.save('settled');return {starts:initial.media.starts,reason:initial.core?.saveReason,rejected,final:player.capture(),active:player.getSnapshot().media.active};}finally{player.dispose();mount.remove();}
 });expect(result.starts).toBe(1);expect(result.reason).toBe('AUDIO_SOURCE_RESTORE_UNSUPPORTED');expect(result.rejected).toContain('SAVE_UNAVAILABLE');expect(result.final.tasks.find(t=>t.name==='a')?.status).toBe('cancelled');expect(result.final.tasks.find(t=>t.name==='fade')?.status).toBe('completed');expect(result.active).toBe(0);
});
