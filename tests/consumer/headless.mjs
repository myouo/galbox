import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createCore } from 'galbox-sdk/core';
import { parseProgram } from 'galbox-sdk/protocol';
import { MemoryStore } from 'galbox-sdk/testing';
import { linkProgram } from 'galbox-sdk/port-kit';
const p=parseProgram(JSON.parse(await readFile('./public/program.json','utf8')));linkProgram(p);
const core=createCore(p);core.run(100);const save=core.capture();const restored=createCore(p,undefined,save);const actual=restored.capture();assert.deepEqual({...actual,tasks:save.tasks},save);assert.equal(actual.tasks[0].id,save.tasks[0].id);assert.equal(actual.tasks[0].attempt,save.tasks[0].attempt+1);
const store=new MemoryStore();await store.save('headless',save,0);assert.deepEqual((await store.readSlot('headless')).snapshot,save);
await assert.rejects(import('galbox-sdk/runtime'),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});
console.log('Independent Node headless imports and restore passed');

const {program1,program2,operations1,operations2,counter2,initialized}=await import('./compiled/extension.js');
const plugin=createCore(program1(),undefined,undefined,{operations:operations1});plugin.run(100);const pluginSave=plugin.capture();
const upgrade=createCore(program2(),undefined,pluginSave,{operations:operations2});const call=upgrade.capture().invocations.find(v=>v.phase==='waiting');assert.ok(call?.wait);
upgrade.accept(counter2.result(call.wait,call.id,{kind:'finish',amount:3}));upgrade.run(100);assert.equal(upgrade.view().run.globals.n.value,5);assert.equal(initialized(),1);
console.log('Packed stateful operation restore and full invocation migration passed');
