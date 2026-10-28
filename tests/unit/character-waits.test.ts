import {expect,it} from 'vitest';
import {ProgramBuilder,richPage,richText as R,instruction} from 'galbox-sdk/port-kit';
import {createCore,validateRestore} from 'galbox-sdk/core';
import {isTextComplete} from 'galbox-sdk/protocol';
import type {RichTextSourceRun} from 'galbox-sdk/protocol';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
const program=(runs:RichTextSourceRun[])=>new ProgramBuilder({gameId:'character-wait',release:'v1',entry:'main'}).function({id:'main',entry:'page',layout:1,params:[],locals:[],returns:'void',code:[richPage('page','page','v1','',runs),instruction('control.end',{at:'end'})]}).build();
function start(p:ReturnType<typeof program>,intervalMs:number,budget=100){const c=createCore(p);c.accept({type:'text.preferences',value:{intervalMs}});while(c.run(budget)==='yield'){}return c;}
it('samples current speed at each character wait and preserves an already sampled wait through preferences and protobuf restore',()=>{
 const p=program([R.text('A'),R.pauseUnits(8),R.text('B'),R.pauseUnits(3),R.text('C')]);for(const budget of [1,8,100]){const c=start(p,20,budget);c.accept({type:'tick',ms:30});expect(c.capture().text?.rich).toMatchObject({pauseRemainingMs:150,pauseIntervalMs:20});c.accept({type:'text.preferences',value:{intervalMs:60}});const cut=c.capture(),restored=createCore(p,undefined,decodeWire('Snapshot',encodeWire('Snapshot',cut)));expect(restored.capture()).toEqual(cut);
 for(const core of [c,restored]){core.accept({type:'tick',ms:150});expect(core.capture().text?.rich?.pauseIntervalMs).toBeUndefined();core.accept({type:'tick',ms:60});expect(core.capture().text?.rich).toMatchObject({pauseRemainingMs:180,pauseIntervalMs:60});core.accept({type:'text.preferences',value:{intervalMs:0}});core.accept({type:'tick',ms:180});expect(isTextComplete(core.capture().text!)).toBe(true);expect(core.capture().text?.rich?.pauseIntervalMs).toBeUndefined();}expect(restored.capture()).toEqual(c.capture());}
});
it('honors explicit run speed, instant text and the independent confirmation boundary',()=>{
 const p=program([R.speed(40),R.pauseUnits(8),R.confirm(),R.pauseUnits(2),R.text('A')]),c=start(p,20);expect(c.capture().text?.rich).toMatchObject({pauseRemainingMs:320,pauseIntervalMs:40});expect(()=>validateRestore(p,c.capture())).not.toThrow();c.accept({type:'reveal',prompt:c.capture().text!.prompt,inputId:'reveal'});expect(c.capture().text?.rich).toMatchObject({waitingForClick:true,pauseRemainingMs:0});expect(c.capture().text?.rich?.pauseIntervalMs).toBeUndefined();c.accept({type:'step',prompt:c.capture().text!.prompt,inputId:'confirm'});expect(c.capture().text?.rich).toMatchObject({pauseRemainingMs:80,pauseIntervalMs:40});
 const instant=start(p,0);expect(instant.capture().text?.rich).toMatchObject({waitingForClick:true,pauseRemainingMs:0});instant.accept({type:'step',prompt:instant.capture().text!.prompt,inputId:'confirm'});expect(isTextComplete(instant.capture().text!)).toBe(true);
 const fixed=program([R.pause(100),R.confirm(),R.text('X')]),old=start(fixed,0);expect(old.capture().text?.rich?.pauseRemainingMs).toBe(100);expect(()=>validateRestore(fixed,old.capture())).not.toThrow();
});
it('rejects invalid factory values, missing/forged sampling and unrelated sampling without changing saved input',()=>{
 for(const n of [0,301,-1,1.5,Infinity])expect(()=>R.pauseUnits(n)).toThrow();const p=program([R.pauseUnits(8),R.text('A')]),c=start(p,20),cut=c.capture();
 for(const change of [(s:typeof cut)=>{delete s.text!.rich!.pauseIntervalMs;},(s:typeof cut)=>{s.text!.rich!.pauseIntervalMs=1;},(s:typeof cut)=>{s.text!.rich!.pauseRemainingMs=0;}]){const bad=structuredClone(cut);change(bad);expect(()=>createCore(p,undefined,bad)).toThrow(/RESTORE_RICH/);}expect(c.capture()).toEqual(cut);
 const fixed=program([R.pause(500),R.text('B')]),bad=start(fixed,20).capture();bad.text!.rich!.pauseIntervalMs=20;expect(()=>createCore(fixed,undefined,bad)).toThrow(/RESTORE_RICH_PAUSE/);expect(decodeWire('Program',encodeWire('Program',p))).toEqual(p);
});
