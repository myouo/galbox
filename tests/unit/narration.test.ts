import {it,expect} from 'vitest';
import {ProgramBuilder,instruction,richPage,richText as R,templatePage,expr as E} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {parseTextState,parseProgram,emptyProfile} from 'galbox-sdk/protocol';
import type {Instruction} from 'galbox-sdk/protocol';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {MemoryStore} from 'galbox-sdk/testing';
const program=(first:Instruction)=>new ProgramBuilder({gameId:'unnamed-narration',release:'v1',entry:'main'}).function({id:'main',entry:first.at,params:[],locals:[],returns:'void',layout:1,code:[first,instruction('text.page',{at:'named',textId:'named',revision:'v1',speaker:'Narrator',content:'Next page'}),instruction('control.end',{at:'end'})]}).build();
const sources=()=>[instruction('text.page',{at:'page',textId:'page',revision:'v1',speaker:'',content:'Original narration'}),templatePage('page','page','v1',E.text(''),E.text('Original narration')),richPage('page','page','v1','',[R.text('Original narration')])];
it('all public text factories accept unnamed narration and restore the same continuation across budgets and protobuf',async()=>{
 for(const source of sources())for(const budget of [1,8,100]){const p=program(source);expect(decodeWire('Program',encodeWire('Program',p))).toEqual(p);const core=createCore(p);while(core.run(budget)==='yield'){}core.accept({type:'tick',ms:32});const cut=core.capture();expect(cut.text?.speaker).toBe('');expect(cut.text?.revealed).toBe(1);const store=new MemoryStore();await store.save('narration',cut,0);const restored=createCore(p,emptyProfile(),decodeWire('Snapshot',encodeWire('Snapshot',(await store.readSlot('narration'))!.snapshot)));expect(restored.capture()).toEqual(cut);
  for(const c of [core,restored]){const wait=c.capture().wait;if(wait?.kind!=='text')throw new Error('Text cut');c.accept({type:'reveal',prompt:wait.prompt,inputId:'r'});c.accept({type:'advance',prompt:wait.prompt,inputId:'a'});while(c.run(budget)==='yield'){}}
  expect(restored.capture()).toEqual(core.capture());expect(restored.capture().history[0]?.speaker).toBe('');expect(restored.capture().text?.speaker).toBe('Narrator');
 }
});
it('empty narration does not permit empty content, null speakers, NUL or oversized names',()=>{
 const p=program(sources()[0]!);for(const speaker of [null,'\0','a'.repeat(4097)]){const input=structuredClone(p),i=input.functions[0]?.code[0];if(i?.op!=='text.page')throw new Error('page');expect(()=>parseProgram({...input,functions:[{...input.functions[0],code:[{...i,speaker}]}]})).toThrow('SCHEMA_PROGRAM');}
 const c=createCore(p);c.run(100);const text=c.capture().text;expect(text).not.toBeNull();expect(()=>parseTextState({...text,content:''})).toThrow('SCHEMA_TEXT');expect(()=>createCore(program(templatePage('page','page','v1',E.text(''),E.text('')))).run(100)).toThrow('TEMPLATE_EMPTY');
});
