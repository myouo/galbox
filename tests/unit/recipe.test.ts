import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {Core} from '../../packages/galbox-sdk/src/core/index.js';
import {prepareRestoreRecipe,defineRestoreRecipe} from '../../packages/galbox-sdk/src/runtime/recipe.js';
import {codec,defineOperation,createOperationRegistry,waitFor,instruction,ProgramBuilder} from '../../packages/galbox-sdk/src/program-tools/index.js';
import {i32} from '../../packages/galbox-sdk/src/protocol/index.js';
const program:unknown=JSON.parse(readFileSync('fixtures/standard-novel/program.json','utf8'));
function baseline(){const core=new Core(program,{revision:3,values:{loads:i32(4)},read:[]});core.run(100);return {core,snapshot:core.capture(),profile:core.view().profile};}
it('recovery only mutates a candidate; staging and preview do not consume profile changes',()=>{
 const {core,snapshot,profile}=baseline();const recipe=defineRestoreRecipe('count',[instruction('profile.i32.add.checked',{at:'recipe:count',key:'loads',delta:1})]);const first=prepareRestoreRecipe(program,profile,snapshot,recipe),second=prepareRestoreRecipe(program,profile,snapshot,recipe);
 expect(first.profile.values.loads).toEqual(i32(5));expect(second.profile.values.loads).toEqual(i32(5));expect(first.changes).toHaveLength(1);expect(profile.values.loads).toEqual(i32(4));expect(core.capture()).toEqual(snapshot);expect(()=>core.applyRecipe(recipe)).toThrow('RECIPE_CANDIDATE');expect(core.capture()).toEqual(snapshot);
});
it('rejects human/media waiting and control loops without guessing or advancing PC',()=>{
 const {snapshot,profile}=baseline();for(const step of [instruction('choice',{at:'recipe:choice',dest:'route',options:[{id:'shore',text:'Choose',target:'shore:start'}]}),instruction('task.join',{at:'recipe:media',group:'media',members:['music']}),instruction('control.jump',{at:'recipe:loop',target:'recipe:loop'}),instruction('wait.delay',{at:'recipe:delay',task:'time',duration:1})])expect(()=>prepareRestoreRecipe(program,profile,snapshot,{version:1,id:'bad',maxSteps:1,steps:[step]})).toThrow('RECIPE_OPCODE');
 expect(snapshot.frames.at(-1)?.pc).toBe('main:opening-1');
});
it('bounds steps and atomically rolls back an earlier profile action when a later step fails',()=>{
 const {snapshot,profile}=baseline();const steps=[instruction('profile.i32.add.checked',{at:'recipe:increment',key:'loads',delta:1}),instruction('stage.put',{at:'recipe:bad-asset',object:{id:'bad',asset:'bgm',position:{x:0,y:0,alpha:1},z:0}})];expect(()=>prepareRestoreRecipe(program,profile,snapshot,{version:1,id:'budget',maxSteps:1,steps})).toThrow('RECIPE_BUDGET');
 const candidate=new Core(program,profile,snapshot,'candidate'),before=candidate.capture();expect(()=>candidate.applyRecipe({version:1,id:'bad-effect',maxSteps:2,steps})).toThrow('ASSET_KIND');expect(candidate.capture()).toEqual(before);expect(candidate.view().profile.values.loads).toEqual(i32(4));expect(candidate.pending()).toEqual([]);
});
it('registered recipe operations cannot wait for external input and preserve ABI on failure',()=>{
 const arg=codec.object('recipe.args',{}),state=codec.object('recipe.state',{n:codec.integer('recipe.int')}),resume=codec.object('recipe.resume',{kind:codec.literal('recipe.ready','ready')});
 const op=defineOperation({id:'recipe.signal',version:1,args:arg,state,resume,manifest:{implementation:'recipe.signal@1',save:'safe',restore:'continue',resumeKinds:['ready'],jumpTargets:[],recipe:true},initialize(){return {n:0};},reduce(){return {state:{n:1},actions:[],effects:[],flow:{kind:'wait',wait:waitFor(resume,'ready','external')}};}});const operations=createOperationRegistry([op]);const {snapshot,profile}=baseline();expect(()=>prepareRestoreRecipe(program,profile,snapshot,defineRestoreRecipe('no-guess',[op.invocation('recipe:signal',{})]),{operations})).toThrow('RECIPE_CONTROL');expect(profile.values.loads).toEqual(i32(4));
});
it('executes qualified pure extensions through the same dispatcher without retaining completed temporary invocations',()=>{
 const arg=codec.object('pure.args',{}),state=codec.object('pure.state',{n:codec.integer('pure.int')}),resume=codec.object('pure.resume',{kind:codec.literal('pure.ready','ready')});
 const op=defineOperation({id:'pure.profile',version:1,args:arg,state,resume,manifest:{implementation:'pure.profile@1',save:'safe',restore:'continue',resumeKinds:['ready'],jumpTargets:[],recipe:true},initialize(){return {n:0};},reduce(_input,s,context){const old=context.profile.values.loads;if(old?.kind!=='i32')throw new Error('loads');return {state:{n:s.n+1},actions:[{type:'profile.set',key:'loads',value:i32(old.value+2)}],effects:[],flow:{kind:'continue'}};}});
 const {snapshot,profile}=baseline(),operations=createOperationRegistry([op]),result=prepareRestoreRecipe(program,profile,snapshot,defineRestoreRecipe('pure',[op.invocation('recipe:pure',{})]),{operations});expect(result.profile.values.loads).toEqual(i32(6));expect(result.snapshot.invocations).toEqual([]);expect(result.snapshot.frames).toEqual(snapshot.frames);expect(profile.values.loads).toEqual(i32(4));
});

it('supports an ended baseline without inventing a next PC',()=>{
 const p=new ProgramBuilder({gameId:'recipe-end',release:'v1',entry:'main'}).function({id:'main',layout:1,params:[],locals:[],returns:'void',entry:'end',code:[instruction('control.end',{at:'end'})]}).build();
 const profile={revision:0,values:{loads:i32(4)},read:[]},core=new Core(p,profile);core.run(100);const result=prepareRestoreRecipe(p,profile,core.capture(),defineRestoreRecipe('ended',[instruction('profile.i32.add.checked',{at:'recipe:count',key:'loads',delta:1})]));expect(result.snapshot.status).toBe('ended');expect(result.snapshot.frames[0]?.pc).toBe('end');expect(result.profile.values.loads).toEqual(i32(5));
});
