import { it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Core,validateRestore } from '../../packages/galbox-sdk/src/core/index.js';
import { parseProgram,i32,bool } from '../../packages/galbox-sdk/src/protocol/index.js';
import { ProgramBuilder,instruction as op,literal } from '../../packages/galbox-sdk/src/program-tools/index.js';
const source:unknown=JSON.parse(readFileSync('tests/fixtures/game-data/standard-novel/program.json','utf8'));
function three(c:Core){c.run(100);for(let j=0;j<3;j++){const w=c.view().run.wait;if(w?.kind!=='text')throw new Error('text');c.accept({type:'reveal',prompt:w.prompt,inputId:`r${j}`});c.accept({type:'advance',prompt:w.prompt,inputId:`a${j}`});c.run(100);}}
it('restores nested call frames and rejects valid-address but invalid call ABI',()=>{
 const p=parseProgram(source),f=p.functions.find(f=>f.id==='incrementChecked');if(!f)throw new Error('fn');f.entry='helper:pause';f.code.unshift(op('wait.delay',{at:'helper:pause',task:'inside',duration:10}));
 const c=new Core(p);c.run(100);for(let j=0;j<2;j++){const w=c.view().run.wait;if(w?.kind!=='text')throw new Error('text');c.accept({type:'reveal',prompt:w.prompt,inputId:`r${j}`});c.accept({type:'advance',prompt:w.prompt,inputId:`a${j}`});c.run(100);}
 const saved=c.capture();expect(saved.frames).toHaveLength(3);const restored=new Core(p,undefined,saved);restored.accept({type:'tick',ms:10});restored.run(100);expect(restored.view().run.globals.visits).toEqual(i32(1));
 const bad=c.capture();const top=bad.frames.at(-1);if(!top?.returnTo)throw new Error('frame');top.returnTo.returnAt='helper:increment';expect(()=>validateRestore(p,bad)).toThrow('RESTORE_CALL');
});
it('distinguishes superseded task from completed and fails all-success instead of hanging',()=>{
 const p=parseProgram(source),main=p.functions[0];if(!main)throw new Error('main');const move=main.code.find(i=>i.op==='stage.animate'&&i.task==='move');if(move?.op!=='stage.animate')throw new Error('move');move.id='light';move.policy='replace';
 const c=new Core(p);three(c);expect(c.view().run.status).toBe('failed');expect(c.view().error).toBe('TASK_GROUP_TERMINAL');expect(c.view().run.tasks.some(t=>t.name==='fade'&&t.status==='superseded')).toBe(true);
});
it('single prompt input is consumed once; budget continuation is never a save point',()=>{
 const c=new Core(source);expect(c.run(1)).toBe('yield');expect(()=>c.capture()).toThrow('BUDGET_CONTINUATION');while(c.run(1)==='yield'){}
 const w=c.view().run.wait;if(w?.kind!=='text')throw new Error('text');const event={type:'advance' as const,prompt:w.prompt,inputId:'same'};
 c.accept(event);expect(c.view().profile.read).toHaveLength(0);c.accept({type:'reveal',prompt:w.prompt,inputId:'reveal'});c.accept(event);expect(c.view().profile.read).toHaveLength(0);
 c.accept({type:'advance',prompt:w.prompt,inputId:'fresh'});c.run(100);const before=c.capture();c.accept({type:'advance',prompt:w.prompt,inputId:'old-prompt'});expect(c.capture()).toEqual(before);
});
it('supports branch, checked arithmetic, save policy and explicit overflow failure',()=>{
 const b=new ProgramBuilder({gameId:'branch',release:'v1',entry:'main'});b.global({id:'n',kind:'i32',initial:i32(0)});
 b.function({id:'main',layout:1,entry:'set',params:[],locals:[],returns:'void',code:[op('value.set',{at:'set',dest:'n',value:literal(i32(1))}),op('control.branch',{at:'branch',left:literal(i32(1)),right:literal(i32(2)),cmp:'lt',yes:'policy',no:'wrong'}),op('save.policy',{at:'policy',allow:false}),op('wait.delay',{at:'wait',task:'delay',duration:1}),op('i32.add.checked',{at:'overflow',dest:'n',left:literal(i32(2147483647)),right:literal(i32(1))}),op('control.end',{at:'wrong'})]});
 const c=new Core(b.build());c.run(100);expect(()=>c.capture()).toThrow('SAVE_POLICY');c.accept({type:'tick',ms:1});expect(()=>c.run(100)).toThrow('I32_RANGE');expect(c.view().run.globals.n).toEqual(i32(1));expect(c.view().run.status).toBe('failed');
});
it('audio retry retains the logical task; stale attempts and duplicate completion are ignored',()=>{
 const c=new Core(source);c.run(100);const audio=c.view().run.tasks.find(t=>t.kind==='audio');if(!audio)throw new Error('audio');
 c.accept({type:'task',task:audio.id,attempt:1,result:'blocked'});c.accept({type:'retry',task:audio.id});const retry=c.drainEffects().filter(e=>e.type==='audio').at(-1);expect(retry?.type==='audio'&&retry.task.attempt).toBe(2);
 c.accept({type:'task',task:audio.id,attempt:1,result:'completed'});expect(c.view().run.tasks[0]?.status).toBe('running');
 c.accept({type:'task',task:audio.id,attempt:2,result:'completed'});const settled=c.capture();c.accept({type:'task',task:audio.id,attempt:2,result:'failed'});expect(c.capture()).toEqual(settled);expect(c.view().run.globals.visits).toEqual(i32(0));
});
it('rejects reachable but unrelated task-group results and inconsistent animation phase',()=>{
 const c=new Core(source);three(c);const s=c.capture();const group=s.groups[0];if(!group)throw new Error('group');group.members=['task:1'];expect(()=>validateRestore(source,s)).toThrow('RESTORE_GROUP_MEMBERS');
 const phase=c.capture(),task=phase.tasks.find(t=>t.kind==='animation');if(!task)throw new Error('task');task.status='completed';expect(()=>validateRestore(source,phase)).toThrow('RESTORE_TASK_PHASE');
});
it('one step reveals, a second step advances, duplicate input cannot do both',()=>{
 const c=new Core(source);c.run(100);const w=c.view().run.wait;if(w?.kind!=='text')throw new Error('text');
 const step={type:'step' as const,prompt:w.prompt,inputId:'once'};c.accept(step);c.accept(step);expect(c.view().profile.read).toHaveLength(0);c.accept({...step,inputId:'twice'});c.run(100);expect(c.view().profile.read).toHaveLength(1);expect(c.view().run.text?.textId).toBe('opening.2');
});

it('replays an acknowledged one-shot only when the declared restore policy is replay',()=>{
 const p=parseProgram(source),play=p.functions[0]?.code.find(i=>i.op==='audio.play');if(play?.op!=='audio.play')throw new Error('audio');play.loop=false;
 const c=new Core(p);c.run(100);const task=c.view().run.tasks[0];if(!task)throw new Error('task');c.accept({type:'task',task:task.id,attempt:task.attempt,result:'completed'});
 const restored=new Core(p,undefined,c.capture()),effect=restored.drainEffects()[0];expect(effect?.type==='audio'&&effect.task.id).toBe(task.id);expect(effect?.type==='audio'&&effect.task.attempt).toBe(task.attempt+1);expect(restored.capture().frames).toEqual(c.capture().frames);
 play.restore='stop';const stopped=new Core(p);stopped.run(100);const stopTask=stopped.view().run.tasks[0];if(!stopTask)throw new Error('task');stopped.accept({type:'task',task:stopTask.id,attempt:stopTask.attempt,result:'completed'});expect(new Core(p,undefined,stopped.capture()).drainEffects()).toEqual([]);
});
it('the public bool constructor rejects an invalid JavaScript argument',()=>{
 // @ts-expect-error intentional JavaScript-side negative mirrors the runtime boundary
 expect(()=>bool('true')).toThrow('BOOL_TYPE');
});

it('initial activation plays pending audio even when its later restore policy is stop',()=>{
 const p=parseProgram(source),play=p.functions[0]?.code.find(i=>i.op==='audio.play');if(play?.op!=='audio.play')throw new Error('audio');play.loop=false;play.restore='stop';
 const prepared=new Core(p);prepared.run(100);const snapshot=prepared.capture();expect(new Core(p,undefined,snapshot,'initial').drainEffects().some(e=>e.type==='audio')).toBe(true);
 const restored=new Core(p,undefined,snapshot);expect(restored.drainEffects()).toEqual([]);expect(restored.view().run.tasks[0]?.status).toBe('cancelled');
});
