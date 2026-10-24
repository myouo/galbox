import {codec,defineOperation,waitFor,createOperationRegistry,defineInvocationMigration,ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {i32} from 'galbox-sdk/protocol';
const number=codec.integer('consumer.number');
const args1=codec.object('consumer.args@1',{increment:number}),state1=codec.object('consumer.state@1',{count:number});
const resume1=codec.object('consumer.resume@1',{kind:codec.literal('consumer.continue','continue'),value:number});
const args2=codec.object('consumer.args@2',{step:number}),state2=codec.object('consumer.state@2',{total:number});
const resume2=codec.object('consumer.resume@2',{kind:codec.literal('consumer.finish','finish'),amount:number});
const manifest={implementation:'consumer.counter@1',save:'safe',restore:'continue',resumeKinds:['continue'],jumpTargets:[],recipe:false} as const;
let initializations=0;
export function initialized(){return initializations;}
export const counter1=defineOperation({id:'consumer.counter',version:1,args:args1,state:state1,resume:resume1,manifest,initialize(){initializations++;return {count:0};},reduce(input,state){const count=state.count+(input.kind==='start'?input.args.increment:input.event.value);return {state:{count},actions:[{type:'set',dest:'n',value:i32(count)}],effects:[],flow:input.kind==='start'?{kind:'wait',wait:waitFor(resume1,'continue','signal')}:{kind:'continue'}};}});
export const counter2=defineOperation({id:'consumer.counter',version:2,args:args2,state:state2,resume:resume2,manifest:{...manifest,implementation:'consumer.counter@2',resumeKinds:['finish']},initialize(){throw new Error('Restoring must not initialize');},reduce(input,state){return {state:{total:state.total},actions:[{type:'set',dest:'n',value:i32(state.total+(input.kind==='start'?input.args.step:input.event.amount))}],effects:[],flow:{kind:'continue'}};}});
const migration=defineInvocationMigration(counter1,counter2,old=>({args:{step:old.args.increment},state:{total:old.state.count},phase:old.phase,wait:old.wait?waitFor(resume2,'finish',old.wait.request):null}));
export const operations1=createOperationRegistry([counter1]),operations2=createOperationRegistry([counter2],[migration]);
function builder(){return new ProgramBuilder({gameId:'consumer-operations',release:'consumer-content-1',entry:'main'}).global({id:'n',kind:'i32',initial:i32(0)});}
export function program1(){return builder().function({id:'main',layout:1,params:[],locals:[],returns:'void',entry:'invoke',code:[counter1.invocation('invoke',{increment:2}),instruction('control.end',{at:'end'})]}).build(operations1);}
export function program2(){return builder().function({id:'main',layout:1,params:[],locals:[],returns:'void',entry:'invoke',code:[counter2.invocation('invoke',{step:2}),instruction('control.end',{at:'end'})]}).build(operations2);}
if(false){
 // @ts-expect-error installed public operation factory retains its args schema
 counter1.invocation('bad',{increment:'two'});
 // @ts-expect-error installed migration factory requires the target args
 defineInvocationMigration(counter1,counter2,old=>({args:{step:'bad'},state:{total:old.state.count},phase:old.phase,wait:null}));
}
