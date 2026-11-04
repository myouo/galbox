import {it,expect} from 'vitest';
import {createCore} from 'galbox-sdk/core';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {isTextComplete,isTextConfirming} from 'galbox-sdk/protocol';
import {liveScopes} from '../fixtures/game-data/live-scopes/source.js';
it('visits more than64 modules, preserves task/history origins, reattaches an earlier cached body and cold restores the minimal scope',async()=>{
 const built=await liveScopes(),source=createModuleProgram(built.manifest);source.installAll(built.files.slice(0,64).map(f=>f.body));source.installAll(built.files.slice(64).map(f=>f.body));const core=createCore(source);core.accept({type:'text.preferences',value:{intervalMs:0}});let serial=0;
 for(let n=0;n<1000;n++){core.run(8);const s=core.view().run;if(s.text?.textId==='reentered'&&s.wait?.kind==='text')break;if(s.wait?.kind==='text')core.accept({type:isTextComplete(s.text!)||isTextConfirming(s.text!)?'advance':'reveal',prompt:s.wait.prompt,inputId:'scope-'+ ++serial});expect(n).toBeLessThan(999);}
 core.accept({type:'tick',ms:137});const cut=core.capture();expect(cut.text?.textId).toBe('reentered');expect(source.loaded()).toHaveLength(73);expect(cut.programModules?.modules).toHaveLength(4);for(const n of [0,1,2])expect(cut.programModules?.modules).toContain(source.moduleForFunction('chapter'+n));expect(cut.history.some(t=>t.rich?.at==='chapter2:history')).toBe(true);expect(cut.tasks.find(t=>t.name==='motion0')).toMatchObject({status:'running',elapsed:137});const cold=createModuleProgram(built.manifest);cold.installAll(cold.binding(cut).map(id=>built.files.find(f=>f.body.id===id)!.body));expect(createCore(cold,core.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',cut))).capture()).toEqual(cut);
});
it('actually live65-module scope fails before changing the pending call, tasks, stage, progress or binding',async()=>{
 const built=await liveScopes(true,64),source=createModuleProgram(built.manifest);source.installAll(built.files.slice(0,64).map(f=>f.body));source.installAll(built.files.slice(64).map(f=>f.body));const core=createCore(source);core.run(1);let w=core.capture().wait;if(w?.kind!=='text')throw new Error('intro');core.accept({type:'reveal',prompt:w.prompt,inputId:'reveal'});core.run(1);w=core.capture().wait;if(w?.kind!=='text')throw new Error('intro');core.accept({type:'advance',prompt:w.prompt,inputId:'advance'});
 for(let n=0;n<1000;n++){const top=core.view().run.frames.at(-1)!;if(top.functionId==='main'&&top.pc==='call63')break;core.run(1);expect(n).toBeLessThan(999);}const before=structuredClone(core.view()),pending=core.pending();expect(before.run.tasks).toHaveLength(63);expect(before.run.programModules?.modules).toHaveLength(64);expect(()=>core.run(1)).toThrow('SCHEMA_MODULE');expect(core.view().run).toEqual(before.run);expect(core.view().profile).toEqual(before.profile);expect(core.pending()).toEqual(pending);
});
