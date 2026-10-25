import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {defaultPreferences,mergePreferences} from 'galbox-sdk/settings';
import {parsePreferencesPatch} from 'galbox-sdk/protocol';
import {createCore} from 'galbox-sdk/core';
import {MemoryStore,Coordinator,VirtualHost,VirtualScheduler} from 'galbox-sdk/testing';
const program:unknown=JSON.parse(readFileSync('fixtures/standard-novel/program.json','utf8'));
function cut(){const c=createCore(program);c.run(100);return c.capture();}
it('the preferences factory isolates defaults and strictly validates only implemented settings',()=>{
 const a=defaultPreferences();a.audio.master=0;expect(defaultPreferences().audio.master).toBe(.6);expect(mergePreferences(defaultPreferences(),{audio:{voice:.25},text:{intervalMs:0}})).toMatchObject({audio:{master:.6,voice:.25},text:{intervalMs:0}});
 for(const bad of [{},{audio:{}},{audio:{master:NaN}},{audio:{master:2}},{text:{intervalMs:-1}},{text:{intervalMs:201}},{text:{ruby:true}},{autoPlay:true}])expect(()=>parsePreferencesPatch(bad)).toThrow();
});
it('preferences CAS is independent of narrative/profile/head/backup restore and failures do not replace settings',async()=>{
 const store=new MemoryStore();await store.save('story',cut(),0);await store.activate('story',cut(),null,0);const story=await store.read(),slot=await store.readSlot('story');expect(await store.readPreferences()).toBeNull();
 const requested=mergePreferences(defaultPreferences(),{audio:{master:.2}}),record=await store.writePreferences(requested,0);requested.audio.master=.9;record.value.audio.master=.8;expect((await store.readPreferences())?.value.audio.master).toBe(.2);
 await expect(store.writePreferences(defaultPreferences(),0)).rejects.toThrow('PREFERENCES_CONFLICT');await expect(store.writePreferences({...defaultPreferences(),text:{intervalMs:999}},1)).rejects.toThrow('SCHEMA_PREFERENCES');expect((await store.readPreferences())?.revision).toBe(1);expect(await store.read()).toEqual(story);expect(await store.readSlot('story')).toEqual(slot);
 const backup=await store.backup('lighthouse-letters','1','lighthouse-1');expect(Object.hasOwn(backup,'preferences')).toBe(false);await store.restoreBackup({id:'restore',backup});expect((await store.readPreferences())?.value.audio.master).toBe(.2);expect(await store.read()).toEqual(story);
});
it('current text preferences control remaining reveal without changing saved text identity, PC or read facts',()=>{
 const core=createCore(program);core.accept({type:'text.preferences',value:{intervalMs:100}});core.run(100);core.accept({type:'tick',ms:100});const saved=core.capture();expect(saved.text?.revealed).toBe(1);expect(core.view().profile.read).toEqual([]);
 const restored=createCore(program,undefined,saved);restored.accept({type:'text.preferences',value:{intervalMs:200}});expect(restored.capture()).toMatchObject({text:{revealed:1,textId:saved.text?.textId},frames:saved.frames});restored.accept({type:'tick',ms:199});expect(restored.capture().text?.revealed).toBe(1);restored.accept({type:'tick',ms:1});expect(restored.capture().text?.revealed).toBe(2);
 const before=restored.capture();expect(()=>restored.accept({type:'text.preferences',value:{intervalMs:201}})).toThrow('SCHEMA_PREFERENCES');expect(restored.capture()).toEqual(before);restored.accept({type:'text.preferences',value:{intervalMs:0}});restored.accept({type:'tick',ms:0});expect(restored.capture().text?.revealed).toBe(Array.from(saved.text?.content??'').length);expect(restored.view().profile.read).toEqual([]);
});
it('coordinator serializes preference changes behind a budget continuation and instant text is still unread',async()=>{
 const core=createCore(program),scheduler=new VirtualScheduler(),runtime=new Coordinator(core,new VirtualHost(),scheduler,new MemoryStore(),1,null,'preferences',1);const start=runtime.start(),setting=runtime.dispatch({type:'text.preferences',value:{intervalMs:0}});scheduler.drain();await Promise.all([start,setting]);const tick=runtime.dispatch({type:'tick',ms:0});scheduler.drain();await tick;expect(core.capture().text?.revealed).toBe(Array.from(core.capture().text?.content??'').length);expect(core.view().profile.read).toEqual([]);runtime.stop();
});
