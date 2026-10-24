import {codec,defineOperation,waitFor,defineInvocationMigration} from '../../packages/galbox-sdk/src/program-tools/index.js';
const n=codec.integer('types.integer');
const args=codec.object('types.args',{delta:n});
const state=codec.object('types.state',{count:n});
const resume=codec.object('types.resume',{kind:codec.literal('types.ready','ready'),value:n});
const foreign=codec.object('foreign.resume',{kind:codec.literal('foreign.ready','ready'),value:n});
const manifest={implementation:'types.counter',save:'safe',restore:'continue',resumeKinds:['ready'],jumpTargets:[],recipe:false} as const;
const op=defineOperation({id:'typed.counter',version:1,args,state,resume,manifest,initialize(){return {count:0};},reduce(input,s){if(input.kind==='resume'){const count:number=input.event.value;void count;}return {state:{count:s.count},actions:[],effects:[],flow:{kind:'wait',wait:waitFor(resume,'ready','signal')}};}});
op.invocation('valid',{delta:1});
// @ts-expect-error actual operation factory is anchored to the args codec
op.invocation('wrong',{delta:'one'});
// @ts-expect-error unsupported resume kind
waitFor(resume,'audio-completed','signal');
const wait=waitFor(resume,'ready','signal');
op.result(wait,'invocation',{kind:'ready',value:1});
// @ts-expect-error resume payload is tied to the registered operation
op.result(wait,'invocation',{kind:'ready',value:'one'});
defineOperation({id:'typed.bad-init',version:1,args,state,resume,manifest,
 // @ts-expect-error initializer output is anchored to state, cannot widen it
 initialize(){return {count:'one'};},
 reduce(_input,s){return {state:{count:s.count},actions:[],effects:[],flow:{kind:'continue'}};}
});
defineOperation({id:'typed.bad-wait',version:1,args,state,resume,manifest,initialize(){return {count:0};},
 // @ts-expect-error same-shaped foreign codec identity is still rejected
 reduce(_input,s){return {state:{count:s.count},actions:[],effects:[],flow:{kind:'wait',wait:waitFor(foreign,'ready','signal')}};}
});
const tuple=codec.tuple('types.tuple',codec.literal('types.tag','tag'),n);
const value=tuple.parse(['tag',1]);const tag:'tag'=value[0];void tag;
// @ts-expect-error tuple position retained
const wrongTuple:string=value[1];void wrongTuple;
const v2=defineOperation({id:'typed.counter',version:2,args,state,resume,manifest,initialize(){return {count:0};},reduce(_input,s){return {state:{count:s.count},actions:[],effects:[],flow:{kind:'continue'}};}});
defineInvocationMigration(op,v2,s=>({args:{delta:s.args.delta},state:{count:s.state.count},phase:s.phase,wait:s.wait}));
// @ts-expect-error complete migration must return the target args schema
defineInvocationMigration(op,v2,s=>({args:{delta:'wrong'},state:{count:s.state.count},phase:s.phase,wait:s.wait}));
