import { describe,it,expect } from 'vitest';
import { Core } from '../../packages/galbox-sdk/src/core/index.js';
import { codec,defineOperation,waitFor,createOperationRegistry,defineInvocationMigration,ProgramBuilder,instruction } from '../../packages/galbox-sdk/src/program-tools/index.js';
import { i32 } from '../../packages/galbox-sdk/src/protocol/index.js';
import type { RuntimeOperation } from '../../packages/galbox-sdk/src/core/operations.js';
import type { Snapshot } from '../../packages/galbox-sdk/src/protocol/index.js';
const integer=codec.integer('test.integer');
const args=codec.object('test.args@1',{delta:integer});
const state=codec.object('test.state@1',{count:integer});
const resume=codec.object('test.resume@1',{kind:codec.literal('test.ready','ready'),value:integer});
const manifest={implementation:'test.counter@1',save:'safe',restore:'continue',resumeKinds:['ready'],jumpTargets:[],recipe:false} as const;
function program(op:RuntimeOperation,operations=createOperationRegistry([op]),twice=false){
 const builder=new ProgramBuilder({gameId:'operations',release:'operations-content-1',entry:'main'});builder.global({id:'n',kind:'i32',initial:i32(0)});
 builder.function({id:'main',entry:'invoke',layout:1,params:[],locals:[],returns:'void',code:[op.instruction('invoke',op.version===3?{step:2}:{delta:2}),...(twice?[op.instruction('again',{delta:5})]:[]),instruction('control.end',{at:'end'})]});return builder.build(operations);
}
function active(s:Snapshot){const value=s.invocations?.find(v=>v.phase==='waiting');if(!value?.wait)throw new Error('active invocation');return {...value,wait:value.wait};}
function counter(onInitialize=()=>{}){
 return defineOperation({id:'test.counter',version:1,args,state,resume,manifest,
  initialize(){onInitialize();return {count:0};},
  reduce(input,current){const count=current.count+(input.kind==='start'?input.args.delta:input.event.value);return {state:{count},actions:[{type:'set',dest:'n',value:i32(count)}],effects:[],flow:input.kind==='start'?{kind:'wait',wait:waitFor(resume,'ready','signal')}:{kind:'continue'}};}
 });
}
describe('production stateful operations',()=>{
 it('owns each invocation and restores without reinitializing; old and duplicate results are ignored',()=>{
  let initialized=0;const op=counter(()=>initialized++),registry=createOperationRegistry([op]),p=program(op,registry,true),core=new Core(p,undefined,undefined,'restore',registry);core.run(100);
  const first=active(core.capture());expect(initialized).toBe(1);expect(first.state).toEqual({count:2});
  const restored=new Core(p,undefined,core.capture(),'restore',registry);expect(initialized).toBe(1);const current=active(restored.capture());
  restored.accept(op.result(first.wait,first.id,{kind:'ready',value:1}));expect(restored.capture().invocations?.[0]?.state).toEqual({count:2});
  const result=op.result(current.wait,current.id,{kind:'ready',value:1});restored.accept(result);restored.run(100);expect(initialized).toBe(2);
  const second=active(restored.capture());expect(second.id).not.toBe(first.id);expect(second.state).toEqual({count:5});restored.accept(result);expect(active(restored.capture()).state).toEqual({count:5});
  restored.accept(op.result(second.wait,second.id,{kind:'ready',value:1}));restored.run(100);expect(restored.view().run.status).toBe('ended');expect(restored.view().run.globals.n).toEqual(i32(6));
 });
 it('rolls back initialize/reducer/output/actions/effects and protects retained aliases',()=>{
  let output:{count:number}|undefined;
  const op=defineOperation({id:'test.counter',version:1,args,state,resume,manifest,initialize(){return {count:0};},reduce(input,current){output={count:current.count+1};return {state:output,actions:[],effects:[],flow:{kind:'wait',wait:waitFor(resume,'ready','signal')}};}});
  const registry=createOperationRegistry([op]),core=new Core(program(op),undefined,undefined,'restore',registry);core.run(100);if(!output)throw new Error('output');output.count=99;expect(active(core.capture()).state).toEqual({count:1});
  const bad=defineOperation({id:'test.bad',version:1,args,state,resume,manifest,initialize(){return {count:0};},reduce(){return {state:{count:7},actions:[{type:'profile.set',key:'bad',value:i32(1)},{type:'set',dest:'missing',value:i32(9)}],effects:[],flow:{kind:'continue'}};}});
  const badRegistry=createOperationRegistry([bad]),broken=new Core(program(bad),undefined,undefined,'restore',badRegistry),before=broken.view();expect(()=>broken.run(100)).toThrow('SLOT_KIND');expect(broken.view().run).toEqual(before.run);expect(broken.view().profile).toEqual(before.profile);expect(broken.pending()).toEqual([]);expect(broken.drainEffects()).toEqual([]);
  const invalid=defineOperation({id:'test.invalid',version:1,args,state,resume,manifest,initialize(){return {count:0};},reduce(){return {state:{count:NaN},actions:[],effects:[],flow:{kind:'continue'}};}});const invalidRegistry=createOperationRegistry([invalid]),invalidCore=new Core(program(invalid),undefined,undefined,'restore',invalidRegistry);const invalidBefore=invalidCore.view().run;expect(()=>invalidCore.run(100)).toThrow('INPUT_JSON');expect(invalidCore.view().run).toEqual(invalidBefore);
 });
 it('rejects unknown registrations, duplicate implementations, false schema identities, invalid resume and forbidden saves',()=>{
  const op=counter(),registry=createOperationRegistry([op]),p=program(op);expect(()=>new Core(p)).toThrow('UNSUPPORTED_OPERATION');expect(()=>createOperationRegistry([op,counter()])).toThrow('OPERATION_DUPLICATE');
  const core=new Core(p,undefined,undefined,'restore',registry);core.run(100);const invocation=active(core.capture()),event=op.result(invocation.wait,invocation.id,{kind:'ready',value:1});event.schema.signature='wrong';expect(()=>core.accept(event)).toThrow('OPERATION_RESUME_SCHEMA');expect(active(core.capture()).state).toEqual({count:2});
  const refused=defineOperation({id:'test.counter',version:1,args,state,resume,manifest:{...manifest,save:'forbid'},initialize(){return {count:0};},reduce(){return {state:{count:0},actions:[],effects:[],flow:{kind:'wait',wait:waitFor(resume,'ready','signal')}};}});const r=createOperationRegistry([refused]),c=new Core(program(refused),undefined,undefined,'restore',r);c.run(100);expect(()=>c.capture()).toThrow('OPERATION_UNRESTORABLE');
 });
 it('allows state-only migration only while args and resume ABI remain identical',()=>{
  const v1=counter(),r1=createOperationRegistry([v1]),c=new Core(program(v1),undefined,undefined,'restore',r1);c.run(100);const saved=c.capture();
  const nextState=codec.object('test.state@2',{count:integer,note:codec.string('test.note')});
  const v2=defineOperation({id:'test.counter',version:2,args,state:nextState,resume,manifest:{...manifest,implementation:'test.counter@2'},initialize(){throw new Error('Must not reinitialize');},migrateState(version,old){expect(version).toBe(1);return {...state.parse(old),note:'migrated'};},reduce(_input,current){return {state:{count:current.count,note:current.note},actions:[],effects:[],flow:{kind:'continue'}};}});
  const r2=createOperationRegistry([v2]),restored=new Core(program(v2,r2),undefined,saved,'restore',r2);expect(active(restored.capture()).state).toEqual({count:2,note:'migrated'});
 });
 it('requires full invocation migration when args/wait change, then relinks and preserves logical identity',()=>{
  const v1=counter(),r1=createOperationRegistry([v1]),c=new Core(program(v1),undefined,undefined,'restore',r1);c.run(100);const saved=c.capture(),old=active(saved);
  const nextArgs=codec.object('test.args@3',{step:integer}),nextState=codec.object('test.state@3',{total:integer}),nextResume=codec.object('test.resume@3',{kind:codec.literal('test.finish','finish'),amount:integer});
  const v3=defineOperation({id:'test.counter',version:3,args:nextArgs,state:nextState,resume:nextResume,manifest:{...manifest,implementation:'test.counter@3',resumeKinds:['finish']},initialize(){return {total:0};},migrateState(){return {total:100};},reduce(input,current){return {state:{total:current.total},actions:[{type:'set',dest:'n',value:i32(current.total+(input.kind==='resume'?input.event.amount:input.args.step))}],effects:[],flow:{kind:'continue'}};}});
  const r3=createOperationRegistry([v3]);expect(()=>new Core(program(v3,r3),undefined,saved,'restore',r3)).toThrow('INVOCATION_MIGRATION_REQUIRED');
  const migration=defineInvocationMigration(v1,v3,previous=>({args:{step:previous.args.delta},state:{total:previous.state.count},phase:previous.phase,wait:previous.wait?waitFor(nextResume,'finish',previous.wait.request):null}));
  const migratedRegistry=createOperationRegistry([v3],[migration]),restored=new Core(program(v3,migratedRegistry),undefined,saved,'restore',migratedRegistry),now=active(restored.capture());expect(now.id).toBe(old.id);expect(now.args).toEqual({step:2});expect(now.wait.resumeKind).toBe('finish');
  restored.accept(v3.result(now.wait,now.id,{kind:'finish',amount:3}));restored.run(100);expect(restored.view().run.globals.n).toEqual(i32(5));expect(restored.view().run.status).toBe('ended');expect(saved.invocations?.[0]?.version).toBe(1);
 });
});
it('rejects thrown initialize/reduce and rolls back a partially staged audio effect',()=>{
 const init=defineOperation({id:'test.init-fail',version:1,args,state,resume,manifest,initialize(){throw new Error('initialize failed');},reduce(){throw new Error('must not run');}});const initRegistry=createOperationRegistry([init]),c=new Core(program(init),undefined,undefined,'restore',initRegistry),before=c.view();expect(()=>c.run(100)).toThrow('initialize failed');expect(c.view().run).toEqual(before.run);
 let fail=true;
 const op=defineOperation({id:'test.counter',version:1,args,state,resume,manifest,initialize(){return {count:0};},reduce(input,s){if(input.kind==='resume'&&fail)throw new Error('reducer failed');return {state:{count:s.count+1},actions:[],effects:[],flow:input.kind==='start'?{kind:'wait',wait:waitFor(resume,'ready','signal')}:{kind:'continue'}};}});
 const registry=createOperationRegistry([op]),core=new Core(program(op),undefined,undefined,'restore',registry);core.run(100);const saved=core.capture(),inv=active(saved),event=op.result(inv.wait,inv.id,{kind:'ready',value:1});expect(()=>core.accept(event)).toThrow('reducer failed');expect(core.capture()).toEqual(saved);fail=false;core.accept(event);core.run(100);expect(core.view().run.status).toBe('ended');
 const effect=defineOperation({id:'test.effects',version:1,args,state,resume,manifest,initialize(){return {count:0};},reduce(){return {state:{count:1},actions:[],effects:[{type:'audio',task:'first',asset:'tone',channel:'sfx',gain:1,loop:false,restore:'stop'},{type:'audio',task:'second',asset:'missing',channel:'sfx',gain:1,loop:false,restore:'stop'}],flow:{kind:'continue'}};}});
 const effectRegistry=createOperationRegistry([effect]),p=program(effect);p.assets.push({id:'tone',kind:'audio',path:'tone.wav',mime:'audio/wav',sha256:'0'.repeat(64)});const effectsCore=new Core(p,undefined,undefined,'restore',effectRegistry),effectBefore=effectsCore.view().run;expect(()=>effectsCore.run(100)).toThrow('ASSET_KIND');expect(effectsCore.view().run).toEqual(effectBefore);expect(effectsCore.drainEffects()).toEqual([]);
});
it('rejects JSON cycles, excessive depth, nonfinite values and conflicting codec identities',()=>{
 const cycle:Record<string,unknown>={};cycle.self=cycle;expect(()=>args.parse(cycle)).toThrow('INPUT_JSON');let deep:unknown=null;for(let j=0;j<70;j++)deep={child:deep};expect(()=>args.parse(deep)).toThrow('INPUT_SIZE');expect(()=>integer.parse(Infinity)).toThrow('INPUT_JSON');
 const op=counter();const otherArgs=codec.object('test.args@1',{other:integer});const other=defineOperation({id:'test.other',version:1,args:otherArgs,state,resume,manifest,initialize(){return {count:0};},reduce(_input,s){return {state:{count:s.count},actions:[],effects:[],flow:{kind:'continue'}};}});expect(()=>createOperationRegistry([op,other])).toThrow('CODEC_ID_CONFLICT');
});
it('checks runtime manifest kinds against the factory schema and rejects a forged codec',()=>{
 const invalidManifest={...manifest};Object.defineProperty(invalidManifest,'resumeKinds',{value:['unreachable']});expect(()=>defineOperation({id:'test.counter',version:1,args,state,resume,manifest:invalidManifest,initialize(){return {count:0};},reduce(_i,s){return {state:{count:s.count},actions:[],effects:[],flow:{kind:'continue'}};}})).toThrow('OPERATION_RESUME_KIND');
 const fake={...args};expect(()=>defineOperation({id:'test.counter',version:1,args:fake,state,resume,manifest,initialize(){return {count:0};},reduce(_i,s){return {state:{count:s.count},actions:[],effects:[],flow:{kind:'continue'}};}})).toThrow('CODEC_FACTORY');
});
it('rejects reentrant reducer access while retaining the pre-invocation state',()=>{
 let core:Core;const op=defineOperation({id:'test.reentrant',version:1,args,state,resume,manifest,initialize(){return {count:0};},reduce(){core.run(1);return {state:{count:1},actions:[],effects:[],flow:{kind:'continue'}};}});const operations=createOperationRegistry([op]);core=new Core(program(op),undefined,undefined,'restore',operations);const before=core.view().run;expect(()=>core.run(100)).toThrow('CORE_REENTRANT');expect(core.view().run).toEqual(before);expect(core.pending()).toEqual([]);
});
import {createPortRegistration,readPortRegistration} from '../../packages/galbox-sdk/src/program-tools/index.js';
it('project registrations preserve real frozen registries and reject structural forgeries',()=>{
 const operations=createOperationRegistry([counter()]),registration=createPortRegistration({operations});expect(readPortRegistration(registration).operations).toBe(operations);expect(Object.isFrozen(registration)).toBe(true);expect(()=>readPortRegistration({...registration})).toThrow('PORT_REGISTRATION');
});
