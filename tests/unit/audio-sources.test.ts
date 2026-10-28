import {it,expect} from 'vitest';
import {ProgramBuilder,instruction,audioTrack,sfxTrack,audioSourceFade,audioFadeOutAndStop,audioSourceStop} from 'galbox-sdk/port-kit';
import {createCore,validateRestore} from 'galbox-sdk/core';
import {parseSnapshot,parseProgram} from 'galbox-sdk/protocol';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import type {Instruction,Snapshot} from 'galbox-sdk/protocol';
import type {AssetRef,SfxBufferRef} from 'galbox-sdk/port-kit';
import {Coordinator,VirtualHost,VirtualScheduler,MemoryStore} from 'galbox-sdk/testing';
type Author=(sound:AssetRef<'audio'>,a:SfxBufferRef,b:SfxBufferRef)=>Instruction[];
function program(author:Author){const b=new ProgramBuilder({gameId:'audio-sources',release:'v1',entry:'main'}),sound=b.asset('audio',{id:'sound',path:'sound.wav',mime:'audio/wav',sha256:'0'.repeat(64)}),a=b.sfxBuffer('buf0'),second=b.sfxBuffer('buf1'),code=author(sound,a,second);return b.function({id:'main',entry:code[0]!.at,layout:1,params:[],locals:[],returns:'void',code:[...code,instruction('control.end',{at:'end'})]}).build();}
const page=()=>instruction('text.page',{at:'page',textId:'page',revision:'v1',speaker:'',content:'Two independent sounds.'});
function stable(c:ReturnType<typeof createCore>,budget=100){while(c.run(budget)==='yield'){}return c.capture();}
function track(s:Snapshot,name:string){const t=[...s.tasks].reverse().find(t=>t.name===name);if(!t)throw new Error(name);return t;}
const two:Author=(sound,a,b)=>[sfxTrack('a','a',sound,a,{loop:true,restore:'replay'}),sfxTrack('b','b',sound,b,{gain:.8,loop:true,restore:'replay'}),audioFadeOutAndStop('fade','fade','a',1000),page()];

it('declared buffers keep independent gains; protobuf restore renews sources and resumes the bound envelope',()=>{
 const p=program(two),c=createCore(p);stable(c);for(const t of c.capture().tasks.filter(t=>t.kind==='media'))c.accept({type:'task',task:t.id,attempt:t.attempt,result:'completed'});c.accept({type:'tick',ms:400});const cut=c.capture();
 expect(track(cut,'a').gain).toBeCloseTo(.6);expect(track(cut,'b').gain).toBe(.8);expect(track(cut,'fade').sourceFade?.source).toBe(track(cut,'a').id);
 const decoded=decodeWire('Snapshot',encodeWire('Snapshot',cut)),restored=createCore(decodeWire('Program',encodeWire('Program',p)),undefined,decoded),effects=restored.drainEffects();expect(effects.filter(e=>e.type==='audio')).toHaveLength(2);
 expect(track(restored.capture(),'a').attempt).toBe(track(cut,'a').attempt+1);
 for(const core of [c,restored]){core.drainEffects();core.accept({type:'tick',ms:600});const done=core.capture();expect(track(done,'a').status).toBe('cancelled');expect(track(done,'b').status).toBe('running');expect(track(done,'fade').status).toBe('completed');expect(core.drainEffects()).toEqual([{type:'audio-source-stop',task:track(done,'a').id,attempt:track(done,'a').attempt}]);expect(validateRestore(p,done)).toEqual(done);}
});
it('replacing the same buffer and task name supersedes the old envelope without stopping the new invocation',()=>{
 const p=program((sound,a)=>[sfxTrack('old','tone',sound,a,{loop:true,restore:'replay'}),audioFadeOutAndStop('fade','fade','tone',1000),instruction('wait.delay',{at:'pause',task:'pause',duration:400}),sfxTrack('new','tone',sound,a,{gain:.9,loop:true,restore:'replay'}),page()]),c=createCore(p);stable(c);const old=track(c.capture(),'tone').id;c.accept({type:'tick',ms:400});stable(c);const fresh=track(c.capture(),'tone');expect(fresh.id).not.toBe(old);expect(track(c.capture(),'fade').status).toBe('superseded');c.drainEffects();c.accept({type:'tick',ms:1000});expect(track(c.capture(),'tone')).toMatchObject({id:fresh.id,gain:.9,status:'running'});expect(c.drainEffects()).toEqual([]);expect(validateRestore(p,c.capture())).toEqual(c.capture());
});
it('source stop affects only the selected media invocation and settles its unfinished envelope',()=>{
 const p=program((sound,a,b)=>[...two(sound,a,b).slice(0,-1),audioSourceStop('stop','a'),page()]),c=createCore(p);const s=stable(c);expect(track(s,'a').status).toBe('cancelled');expect(track(s,'b').status).toBe('running');expect(track(s,'fade').status).toBe('cancelled');expect(validateRestore(p,s)).toEqual(s);
});
it('source natural completion and stale physical callbacks never complete another source or envelope',()=>{
 const p=program((sound,a)=>[sfxTrack('a','a',sound,a,{restore:'replay'}),audioFadeOutAndStop('fade','fade','a',1000),page()]),c=createCore(p);stable(c);const source=track(c.capture(),'a');c.accept({type:'task',task:source.id,attempt:source.attempt,result:'completed'});c.accept({type:'media.ended',task:source.id,attempt:source.attempt+1});expect(track(c.capture(),'fade').status).toBe('running');c.accept({type:'media.ended',task:source.id,attempt:source.attempt});expect(track(c.capture(),'a').status).toBe('completed');expect(track(c.capture(),'fade').status).toBe('cancelled');const before=c.capture();c.accept({type:'task',task:source.id,attempt:source.attempt,result:'failed'});expect(c.capture()).toEqual(before);
});
it('inactive sources fail atomically and natural completion cannot falsely satisfy an unfinished fade group',()=>{
 const inactive=createCore(program((sound,a)=>[audioSourceStop('stop','later'),sfxTrack('later','later',sound,a,{restore:'replay'}),page()]));expect(()=>inactive.run(100)).toThrow('AUDIO_SOURCE_INACTIVE');expect(inactive.view().run.tasks).toEqual([]);expect(inactive.view().run.counter).toBe(0);
 const p=program((sound,a)=>[sfxTrack('a','a',sound,a,{restore:'replay'}),audioFadeOutAndStop('fade','fade','a',1000),instruction('task.join',{at:'join',group:'fade-group',members:['fade']}),page()]),c=createCore(p);stable(c);const source=track(c.capture(),'a');c.accept({type:'task',task:source.id,attempt:source.attempt,result:'completed'});c.accept({type:'media.ended',task:source.id,attempt:source.attempt});c.run(100);expect(c.view().run.status).toBe('failed');expect(c.view().error).toBe('TASK_GROUP_TERMINAL');expect(c.view().run.text).toBeNull();
});
it('conflicts and invalid stop gain fail before changing tasks, counter or audio state',()=>{
 for(const bad of [audioSourceFade('bad','bad','a',.2,100),audioSourceFade('bad','bad','a',.5,100,{stop:true})]){
  const p=program((sound,a)=>[sfxTrack('a','a',sound,a,{loop:true,restore:'replay'}),audioFadeOutAndStop('fade','fade','a',1000),bad,page()]),c=createCore(p);c.run(2);const before=c.view().run;expect(()=>c.run(100)).toThrow('AUDIO_SOURCE');expect(c.view().run.tasks).toEqual(before.tasks);expect(c.view().run.counter).toBe(before.counter);expect(c.view().run.audioState).toEqual(before.audioState);
 }
});
it('replacement source envelopes start at the current gain and direct channel gain supersedes them',()=>{
 const p=program((sound,a)=>[sfxTrack('a','a',sound,a,{loop:true,restore:'replay'}),audioSourceFade('fade','fade','a',0,1000),instruction('wait.delay',{at:'pause',task:'pause',duration:500}),audioSourceFade('next','next','a',1,1000,{policy:'replace'}),page(),instruction('audio.gain',{at:'gain',channel:'sfx',gain:.7})]),c=createCore(p);stable(c);c.accept({type:'tick',ms:500});stable(c);expect(track(c.capture(),'next').sourceFade?.from).toBe(.5);c.accept({type:'tick',ms:500});expect(track(c.capture(),'a').gain).toBe(.75);const wait=c.capture().wait;if(wait?.kind!=='text')throw new Error('wait');c.accept({type:'reveal',prompt:wait.prompt,inputId:'r'});c.accept({type:'advance',prompt:wait.prompt,inputId:'a'});stable(c);expect(track(c.capture(),'next').status).toBe('superseded');expect(track(c.capture(),'a').gain).toBe(.7);
});
it('active envelopes over stop-on-restore sources explicitly forbid saving',()=>{
 const p=program((sound,a)=>[sfxTrack('a','a',sound,a,{restore:'stop'}),audioFadeOutAndStop('fade','fade','a',1000),page()]),c=createCore(p);c.run(100);expect(c.view().canSave).toBe(false);expect(c.view().saveReason).toBe('AUDIO_SOURCE_RESTORE_UNSUPPORTED');expect(()=>c.capture()).toThrow();expect(()=>validateRestore(p,c.view().run)).toThrow('MEDIA_WAIT_RESTORE_UNSUPPORTED');
});
it('initial activation starts a stop-policy source and its envelope while ordinary restore remains forbidden',()=>{
 const p=program((sound,a)=>[sfxTrack('a','a',sound,a,{restore:'stop'}),audioFadeOutAndStop('fade','fade','a',500),page()]),prepared=createCore(p);prepared.run(100);
 const initial=createCore(p,undefined,prepared.view().run,{mode:'initial'});expect(initial.drainEffects().filter(e=>e.type==='audio')).toHaveLength(1);expect(initial.view().canSave).toBe(false);initial.accept({type:'tick',ms:500});expect(track(initial.capture(),'fade').status).toBe('completed');
 expect(()=>createCore(p,undefined,prepared.view().run)).toThrow('MEDIA_WAIT_RESTORE_UNSUPPORTED');
});
it('restoration refuses changed declarations, missing references, overlapping slots and forged envelope progress',()=>{
 const p=program(two),c=createCore(p);stable(c);c.accept({type:'tick',ms:400});const saved=c.capture();const edits:((s:Snapshot)=>void)[]=[s=>{s.counter=0;},s=>{delete s.audioSourcesSignature;},s=>{track(s,'a').buffer='buf1';},s=>{s.tasks=s.tasks.filter(t=>t.name!=='a');},s=>{track(s,'fade').sourceFade!.source=track(s,'b').id;},s=>{track(s,'fade').sourceFade!.signature='changed';},s=>{track(s,'a').gain=.1;},s=>{track(s,'fade').sourceFade!.to=.2;}];for(const edit of edits){const bad=parseSnapshot(saved);edit(bad);expect(()=>validateRestore(p,bad)).toThrow();}const changed=parseProgram(p);changed.sfxBuffers?.push('extra');expect(()=>validateRestore(changed,saved)).toThrow('RESTORE_AUDIO_SOURCES');expect(c.capture()).toEqual(saved);
});
it('real Builder/linker rejects undeclared buffers, cross-role buffers, duplicate declarations and unknown sources',()=>{
 const p=program(two),bad=parseProgram(p),first=bad.functions[0]!.code[0];if(first?.op!=='audio.track')throw new Error('track');first.buffer='undeclared';expect(()=>createCore(bad)).toThrow('AUDIO_BUFFER');first.buffer='buf0';first.channel='voice';expect(()=>createCore(bad)).toThrow('AUDIO_BUFFER');expect(()=>program((sound,a,b)=>[...two(sound,a,b),audioSourceStop('unknown','missing')])).toThrow('AUDIO_SOURCE');const duplicate=parseProgram(p);duplicate.sfxBuffers?.push('buf0');expect(()=>createCore(duplicate)).toThrow('AUDIO_BUFFER_DUPLICATE');
});
it('legacy media Programs and their snapshots remain valid without source capability or new fields',()=>{
 const b=new ProgramBuilder({gameId:'legacy-audio',release:'v1',entry:'main'}),sound=b.asset('audio',{id:'sound',path:'sound.wav',mime:'audio/wav',sha256:'0'.repeat(64)}),p=b.function({id:'main',entry:'a',layout:1,params:[],locals:[],returns:'void',code:[audioTrack('a','a',sound,{channel:'bgm',restore:'replay'}),page(),instruction('control.end',{at:'end'})]}).build(),c=createCore(p),snapshot=stable(c);expect(p.capabilities).not.toContain('audio.sources');expect(snapshot.audioSourcesSignature).toBeUndefined();expect(()=>createCore(p,undefined,snapshot)).not.toThrow();
});
it('logical source state and effects are identical across Core budgets',()=>{
 const p=program(two),cuts=[];for(const budget of [1,8,100]){const c=createCore(p);stable(c,budget);c.accept({type:'tick',ms:1000});cuts.push({snapshot:c.capture(),effects:c.drainEffects()});}expect(cuts[1]).toEqual(cuts[0]);expect(cuts[2]).toEqual(cuts[0]);
});
it('repeated joined source envelopes retain their reachable source without accumulating old invocations',()=>{
 const p=program((sound,a)=>{const code:Instruction[]=[];for(let i=0;i<300;i++)code.push(sfxTrack(`play${i}`,'tone',sound,a,{loop:true,restore:'replay'}),audioFadeOutAndStop(`fade${i}`,'fade','tone',1),instruction('task.join',{at:`join${i}`,group:'group',members:['fade']}));return [...code,page()];}),c=createCore(p);c.run(100);
 for(let i=0;i<300;i++){c.accept({type:'tick',ms:1});c.run(100);}
 const saved=c.capture();expect(saved.wait?.kind).toBe('text');expect(saved.tasks.length).toBeLessThanOrEqual(4);expect(validateRestore(p,saved)).toEqual(saved);
 const b=new ProgramBuilder({gameId:'too-many-buffers',release:'v1',entry:'main'});for(let i=0;i<9;i++)b.sfxBuffer(`buffer${i}`);b.function({id:'main',entry:'end',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.end',{at:'end'})]});expect(()=>b.build()).toThrow('SCHEMA_PROGRAM');
});
it('a bound voice stop releases Auto waiting without pretending that the voice ended naturally',async()=>{
 const p=program(sound=>[audioTrack('voice','voice',sound,{channel:'voice',restore:'replay'}),audioFadeOutAndStop('fade','fade','voice',500),page()]),c=createCore(p),scheduler=new VirtualScheduler(),runtime=new Coordinator(c,new VirtualHost(),scheduler,new MemoryStore(),1,null,'voice-fade');
 c.accept({type:'text.preferences',value:{intervalMs:0}});
 async function run(promise:Promise<void>){scheduler.drain();await promise;scheduler.drain();}
 try{await run(runtime.start());await run(runtime.configurePlayback({autoDelayMs:0,skipUnread:false}));await run(runtime.setPlayback('auto'));await run(runtime.dispatch({type:'tick',ms:500}));expect(c.capture().status).toBe('ended');expect(track(c.capture(),'voice').status).toBe('cancelled');}finally{runtime.stop();}
});
