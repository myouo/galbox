import {it,expect} from 'vitest';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {readUnit,parseSnapshot} from 'galbox-sdk/protocol';
import {createCore} from 'galbox-sdk/core';
import {MemoryStore} from 'galbox-sdk/testing';
function builder(textId:string,revision:string){return new ProgramBuilder({gameId:'read-identities',release:'read-1',entry:'main'}).function({id:'main',entry:'page',layout:1,params:[],locals:[],returns:'void',code:[instruction('text.page',{at:'page',textId,revision,speaker:'fixture',content:'Read identity fixture'}),instruction('control.end',{at:'end'})]});}
it('the real Builder/linker refuses both ambiguous ReadUnit identities before creating a Core',()=>{
 for(const [textId,revision]of [['a@b','c'],['a','b@c']] as const){expect(()=>readUnit({textId,revision})).toThrow('TEXT_IDENTITY');expect(()=>builder(textId,revision).build()).toThrow('TEXT_IDENTITY');}
 expect(readUnit({textId:'a',revision:'bc'})).not.toBe(readUnit({textId:'ab',revision:'c'}));
});
it('legacy wire identities remain readable/exportable and are refused at current-content restore without deleting the slot',async()=>{
 const program=builder('a','bc').build(),core=createCore(program);core.run(100);const legacy=core.capture();if(!legacy.text)throw new Error('text');legacy.text.textId='a@b';legacy.text.revision='c';const copy=parseSnapshot(legacy),store=new MemoryStore();await store.save('old',copy,0);
 expect(()=>createCore(program,undefined,copy)).toThrow('RESTORE_TEXT');expect((await store.backup(program.gameId,'1',program.release)).slots[0]?.snapshot.text?.textId).toBe('a@b');expect((await store.readSlot('old'))?.snapshot).toEqual(legacy);
});
