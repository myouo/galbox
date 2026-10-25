import {it,expect} from 'vitest';
import {ProgramBuilder,variable,instruction,expr as E,expressionWire,assignExpression,branchExpression,templatePage,randomI32,defineRestoreRecipe,prepareRestoreRecipe} from 'galbox-sdk/port-kit';
import type {TypedExpression} from 'galbox-sdk/port-kit';
import {createCore,validateRestore} from 'galbox-sdk/core';
import {i32,string,bool,emptyProfile,parseProgram} from 'galbox-sdk/protocol';
import type {Instruction,ValueKind} from 'galbox-sdk/protocol';
import {MemoryStore} from 'galbox-sdk/testing';
const n=variable('n','i32'),text=variable('text','string'),flag=variable('flag','bool'),end=instruction('control.end',{at:'end'});
function program(code:Instruction[],rng=false){const b=new ProgramBuilder({gameId:'expressions',release:'expressions-1',entry:'main'}).global({...n,initial:i32(0)}).global({...text,initial:string('旅人')}).global({...flag,initial:bool(false)});if(rng)b.rng(0);return b.function({id:'main',entry:code[0]?.at??'end',layout:1,params:[],locals:[],returns:'void',code:[...code,end]}).build();}
function initialWait(){return templatePage('page','expression.page','r1',E.text('澪'),E.template`你好，${E.variable(text)}，数字是${E.variable(n)}。`);}
function stable(core:ReturnType<typeof createCore>,budget=100){while(core.run(budget)==='yield'){}return core.capture();}
it('evaluates typed arithmetic, Unicode strings, formatting and profile/read conditions through real factories and Core',()=>{
 const p=program([assignExpression('number',n,E.binary('add',E.binary('mul',E.integer(6),E.integer(7)),E.unary('neg',E.integer(2)))),assignExpression('slice',text,E.slice(E.text('A😀B'),E.integer(1),E.integer(2))),assignExpression('flag',flag,E.logic('and',E.wasRead('opening','v1'),E.equal(E.profile('i32','coins',i32(7)),E.integer(7)))),initialWait()]);
 const profile=emptyProfile();profile.read=['opening@v1'];const c=createCore(p,profile),s=stable(c);expect(s.globals.n).toEqual(i32(40));expect(s.globals.text).toEqual(string('😀'));expect(s.globals.flag).toEqual(bool(true));expect(s.text?.content).toBe('你好，😀，数字是40。');expect(c.view().profile.read).toEqual(['opening@v1']);
 const length=stable(createCore(program([assignExpression('length',n,E.length(E.text('A😀B')))])));expect(length.globals.n).toEqual(i32(3));
});
it('short-circuits runtime faults but links all branches and refuses malformed correlated wire input',()=>{
 const bad=E.equal(E.binary('div',E.integer(1),E.integer(0)),E.integer(0));expect(stable(createCore(program([assignExpression('safe',flag,E.logic('and',E.flag(false),bad))]))).globals.flag).toEqual(bool(false));
 expect(()=>program([assignExpression('missing',n,E.choose(E.flag(false),E.variable(variable('absent','i32')),E.integer(1)))])).toThrow('EXPRESSION_SLOT_KIND');
 const p=program([assignExpression('value',n,E.integer(1))]),set=p.functions[0]?.code[0];if(set?.op!=='value.set'||!('expression'in set.value))throw new Error('expression');const invalid={...p,functions:p.functions.map(f=>({...f,code:f.code.map(i=>i===set?{...i,value:{expression:{kind:'i32',op:'add',left:expressionWire(E.flag(true)),right:expressionWire(E.integer(1))}}}:i)}))};expect(()=>createCore(invalid)).toThrow('SCHEMA_PROGRAM');
});
it('rejects overflow, zero division, slice/string bounds and wrong persisted kinds without changing the destination or RNG',()=>{
 const cases:TypedExpression<ValueKind>[]=[E.binary('add',E.integer(2147483647),E.integer(1)),E.binary('div',E.integer(-2147483648),E.integer(-1)),E.binary('mod',E.integer(1),E.integer(0)),E.slice(E.text('abc'),E.integer(-1),E.integer(2)),E.concat(E.text('a'.repeat(4096)),E.text('b')),E.profile('i32','wrong',i32(0))];
 for(const e of cases){const profile=emptyProfile();profile.values.wrong=string('not an integer');const operand={expression:expressionWire(e)},p=program([instruction('value.set',{at:'bad',dest:e.kind==='string'?'text':'n',value:operand})],true),c=createCore(p,profile),before=c.view();expect(()=>c.run(100)).toThrow();const after=c.view();expect(after.run.globals).toEqual(before.run.globals);expect(after.run.rng).toEqual(before.run.rng);expect(after.profile).toEqual(before.profile);expect(after.run.frames[0]?.pc).toBe('bad');}
});
it('captures evaluated template text, retains it after a real candidate recipe changes variables and rejects changed templates',()=>{
 const p=program([initialWait()]),c=createCore(p),saved=stable(c),recipe=defineRestoreRecipe('rename',[instruction('value.set',{at:'rename',dest:'text',value:{literal:string('后来的人')}})]),prepared=prepareRestoreRecipe(p,emptyProfile(),saved,recipe);expect(prepared.snapshot.globals.text).toEqual(string('后来的人'));expect(prepared.snapshot.text?.content).toBe(saved.text?.content);expect(createCore(p,prepared.profile,prepared.snapshot).capture().text?.content).toBe(saved.text?.content);
 const changed=parseProgram(p),page=changed.functions[0]?.code[0];if(page?.op!=='text.template')throw new Error('template');page.content=expressionWire(E.text('不同的内容'));expect(()=>validateRestore(changed,saved)).toThrow('RESTORE_TEMPLATE');const missing=c.capture();if(missing.text)delete missing.text.template;expect(()=>validateRestore(p,missing)).toThrow('RESTORE_TEMPLATE');
});
it('validates displayed template identity even when the snapshot is waiting for a later choice',()=>{
 const p=program([initialWait(),instruction('choice',{at:'choice',dest:'text',options:[{id:'done',text:'done',target:'end'}]})]),c=createCore(p);stable(c);const saved=advance(c,'choice');expect(saved.wait?.kind).toBe('choice');const changed=parseProgram(p),first=changed.functions[0]?.code[0];if(first?.op!=='text.template')throw new Error('template');first.content=expressionWire(E.text('changed'));expect(()=>validateRestore(changed,saved)).toThrow('RESTORE_TEMPLATE');expect(createCore(p,undefined,saved).capture().text?.content).toBe(saved.text?.content);
});
it('bounds AST size and isolates factory inputs and exported wire objects',()=>{
 const source=string('original'),e=E.value(source);source.value='changed';const wire=expressionWire(e);if(wire.op==='literal'&&wire.kind==='string')wire.value='also changed';expect(stable(createCore(program([assignExpression('value',text,e)]))).globals.text).toEqual(string('original'));
 let nested=E.integer(1);expect(()=>{for(let i=0;i<20;i++)nested=E.unary('neg',nested);}).toThrow('EXPRESSION_SIZE');expect(()=>E.concat(...Array.from({length:65},()=>E.text('x')))).toThrow('SCHEMA_EXPRESSION');
});
function rngProgram(){return program([initialWait(),randomI32('draw-1',n,E.integer(-2147483648),E.integer(2147483647)),templatePage('first','draw.first','r1',E.text('簿'),E.template`号码${E.variable(n)}`),randomI32('draw-2',n,E.integer(-2147483648),E.integer(2147483647)),templatePage('second','draw.second','r1',E.text('簿'),E.template`号码${E.variable(n)}`)],true);}
function advance(c:ReturnType<typeof createCore>,id:string,budget=100){const w=c.view().run.wait;if(w?.kind!=='text')throw new Error('text');c.accept({type:'reveal',prompt:w.prompt,inputId:'reveal-'+id});c.accept({type:'advance',prompt:w.prompt,inputId:id});return stable(c,budget);}
it('matches an independent BigInt LCG reference, persists complete RNG and gives the same trace across budgets/restores',()=>{
 const p=rngProgram();let baseline;
 for(const budget of [1,8,100]){const c=createCore(p),before=stable(c,budget),first=advance(c,'first',budget),restored=createCore(p,undefined,before),again=advance(restored,'first',budget),second=advance(c,'second',budget),continued=createCore(p,undefined,first),secondAgain=advance(continued,'second',budget);const u1=Number((1664525n*0n+1013904223n)%4294967296n),u2=Number((1664525n*BigInt(u1)+1013904223n)%4294967296n);expect(first.rng).toEqual({algorithm:'lcg32@1',state:u1,draws:1});expect(first.globals.n).toEqual(i32(-2147483648+u1));expect(second.rng).toEqual({algorithm:'lcg32@1',state:u2,draws:2});expect(again).toEqual(first);expect(secondAgain).toEqual(second);if(baseline)expect([before,first,second]).toEqual(baseline);else baseline=[before,first,second];}
});
it('random range and consumption failures preserve RNG and explicit reseed is deterministic',()=>{
 const p=program([randomI32('bad',n,E.integer(2),E.integer(1))],true),c=createCore(p);expect(()=>c.run(100)).toThrow('RNG_RANGE');expect(c.view().run.rng).toEqual({algorithm:'lcg32@1',state:0,draws:0});expect(c.view().run.globals.n).toEqual(i32(0));
 const q=rngProgram(),initial=stable(createCore(q));if(!initial.rng)throw new Error('rng');initial.rng.draws=2147483647;const high=createCore(q,undefined,initial);expect(()=>advance(high,'limit')).toThrow('RNG_DRAWS');expect(high.view().run.rng?.draws).toBe(2147483647);
 const seeded=program([randomI32('first',n,E.integer(0),E.integer(100)),assignExpression('remember',text,E.format(E.variable(n))),instruction('rng.seed',{at:'seed',seed:0}),randomI32('draw',n,E.integer(0),E.integer(100))],true),reset=stable(createCore(seeded));expect(reset.globals.text).toEqual(string(String(reset.globals.n?.value)));expect(reset.rng?.draws).toBe(1);
});
it('rejection sampling accounts for every consumed word and rolls back even after a rejected draw',()=>{
 const p=program([initialWait(),randomI32('range',n,E.integer(-2147483648),E.integer(0)),templatePage('result','sample','v1',E.text('簿'),E.template`${E.variable(n)}`)],true),saved=stable(createCore(p));if(!saved.rng)throw new Error('rng');saved.rng.state=100000;const c=createCore(p,undefined,saved),result=advance(c,'sample');let state=100000n,draws=0;do{state=(state*1664525n+1013904223n)%4294967296n;draws++;}while(state>=2147483649n);expect(result.rng?.state).toBe(Number(state));expect(result.rng?.draws).toBe(draws);expect(result.globals.n).toEqual(i32(-2147483648+Number(state)));
 saved.rng.draws=2147483646;const overflow=createCore(p,undefined,saved);expect(()=>advance(overflow,'fail')).toThrow('RNG_DRAWS');expect(overflow.view().run.rng).toEqual(saved.rng);
});
it('host entropy is explicit run input and cannot reseed a restored run',()=>{
 const p=rngProgram();p.rng={algorithm:'lcg32@1',seedSource:'host'};expect(()=>createCore(p)).toThrow('RNG_SEED_REQUIRED');const c=createCore(p,undefined,undefined,{rngSeed:123}),saved=stable(c);expect(saved.rng?.state).toBe(123);expect(createCore(p,undefined,saved).capture().rng).toEqual(saved.rng);expect(()=>createCore(p,undefined,saved,{rngSeed:99})).toThrow('RESTORE_RNG_SEED');expect(()=>createCore(p,undefined,undefined,{rngSeed:-1})).toThrow('SCHEMA_RNGCONFIG');
});
it('expression operands are linked and evaluated in the actual call frame',()=>{
 const b=new ProgramBuilder({gameId:'expression-call',release:'call-1',entry:'main'}).global({...n,initial:i32(0)}),param=variable('p','i32');b.function({id:'main',entry:'call',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.call',{at:'call',function:'twice',args:[{expression:expressionWire(E.binary('add',E.integer(2),E.integer(3)))}],dest:'n'}),end]});b.function({id:'twice',entry:'return',layout:1,params:[{...param,initial:i32(0)}],locals:[],returns:'i32',code:[instruction('control.return',{at:'return',value:{expression:expressionWire(E.binary('mul',E.variable(param),E.integer(2)))}})]});expect(stable(createCore(b.build())).globals.n).toEqual(i32(10));
});
it('preserves old saves but refuses absent RNG state and disallows random recovery guesses',async()=>{
 const legacy=program([initialWait()]),saved=stable(createCore(legacy)),next=parseProgram(legacy);next.rng={algorithm:'lcg32@1',seed:1};next.capabilities.push('rng.lcg32');const store=new MemoryStore();await store.save('legacy',saved,0);expect(()=>createCore(next,undefined,saved)).toThrow('RESTORE_RNG');expect((await store.readSlot('legacy'))?.snapshot).toEqual(saved);
 const p=rngProgram(),snapshot=stable(createCore(p)),candidate=createCore(p,undefined,snapshot,{mode:'candidate'});expect(()=>candidate.applyRecipe({version:1,id:'guess',maxSteps:1,steps:[instruction('rng.seed',{at:'guess',seed:9})]})).toThrow(/RECIPE/);expect(candidate.capture()).toEqual(snapshot);
});
