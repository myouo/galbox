import {it,expect} from 'vitest';
import {createCore} from 'galbox-sdk/core';
import {createModuleProgram,compileProgramModuleParts} from 'galbox-sdk/port-kit';
import {parseProgramModule} from 'galbox-sdk/protocol';
import {inspectResource} from 'galbox-sdk/release';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {historyOnlyBuilder,pixel} from '../fixtures/game-data/history-only/source.js';
it('retains returned history-only source bodies in a minimal cold module binding',async()=>{
 const builder=historyOnlyBuilder(),parts=builder.parts({compositionVersion:3}),all=parts.files.flatMap(f=>f.body.functions);parts.files=all.map(f=>({uri:'code/'+f.id+'.pb',body:parseProgramModule({format:'galbox-code',version:1,id:f.id,functions:[f]})}));const built=await compileProgramModuleParts({parts,compositionVersion:3,series:'notes',resources:[inspectResource(parts.header.assets[0]!,pixel,b=>new TextDecoder().decode(b))],packedDeclarations:true}),source=createModuleProgram(built.manifest);source.installAll(built.files.map(f=>f.body));const c=createCore(source);c.accept({type:'text.preferences',value:{intervalMs:0}});c.run(100);const w=c.view().run.wait;if(w?.kind!=='text')throw new Error('first');c.accept({type:'advance',prompt:w.prompt,inputId:'first'});c.run(100);const cut=c.capture();expect(cut.frames.map(f=>f.functionId)).toEqual(['main']);expect(cut.programModules?.modules).toEqual(['main','notes']);const cold=createModuleProgram(built.manifest);cold.installAll(cold.binding(cut).map(id=>built.files.find(f=>f.body.id===id)!.body));expect(createCore(cold,c.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',cut))).capture()).toEqual(cut);
});
