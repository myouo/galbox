import {it,expect} from 'vitest';
import {ProgramBuilder,instruction} from '../../packages/galbox-sdk/src/program-tools/index.js';
import {linkProgram} from '../../packages/galbox-sdk/src/program-tools/linker.js';
import {inspectProgram,inspectSnapshot} from '../../packages/galbox-sdk/src/diagnostics/index.js';
import {Core} from '../../packages/galbox-sdk/src/core/index.js';
function program(){return new ProgramBuilder({gameId:'diagnostics',release:'v1',entry:'main'}).function({id:'main',layout:1,entry:'page',params:[],locals:[],returns:'void',code:[instruction('text.page',{at:'page',textId:'one',revision:'zh-1',speaker:'A',content:'Original text'}),instruction('control.end',{at:'end'})]}).source('page',{file:'story.mjs',line:17,column:3}).obligation({id:'required-behavior',kind:'behavior',required:true,description:'The source page must be mapped',source:{file:'original.txt',line:9,column:2,locator:'known:page'}}).mapping({obligation:'required-behavior',addresses:['page']}).build();}
it('missing necessary behavior blocks tooling even when standard Program remains legal',()=>{
 const p=program();expect(inspectProgram(p).status).toBe('valid');p.behaviorMappings=[];expect(()=>linkProgram(p)).not.toThrow();expect(inspectProgram(p)).toMatchObject({status:'invalid',diagnostics:[{code:'OBLIGATION_UNMAPPED',obligation:'required-behavior',source:{file:'original.txt',line:9,column:2}}]});
});
it('structural and linked instruction failures retain the source address and position',()=>{
 const p=program(),wire:Record<string,unknown>={...p,functions:[{...p.functions[0],code:[{at:'page',op:'text.page',content:42},instruction('control.end',{at:'end'})]}]};expect(inspectProgram(wire)).toMatchObject({status:'invalid',diagnostics:[{code:'SCHEMA_PROGRAM',address:'page',source:{file:'story.mjs',line:17,column:3}}]});
 const linked=program();linked.functions[0]!.code[0]=instruction('control.jump',{at:'page',target:'missing'});expect(inspectProgram(linked)).toMatchObject({status:'invalid',diagnostics:[{code:'ADDRESS_SCOPE',address:'page',source:{file:'story.mjs',line:17,column:3}}]});
});
it('snapshot traces use production restore validation and preserve frame/wait locations',()=>{
 const p=program(),core=new Core(p);core.run(100);const trace=inspectSnapshot(p,core.capture());expect(trace).toMatchObject({status:'valid',frames:[{functionId:'main',pc:{address:'page',source:{file:'story.mjs',line:17,column:3}}}],wait:{kind:'text',at:'page'}});
});
