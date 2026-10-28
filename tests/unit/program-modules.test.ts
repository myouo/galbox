import {it,expect} from 'vitest';
import {compileProgramModules,createModuleProgram,instruction,ProgramBuilder,variable,set} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {i32,bool} from 'galbox-sdk/protocol';
import {moduleNovel,modulePartition} from '../fixtures/game-data/module-novel/program.js';
async function fixture(){return compileProgramModules({program:moduleNovel(),series:'1',resources:[]},modulePartition.map(p=>({...p,functions:[...p.functions]})));}
it('real compiler and Core fetch only the executed call target, retain nested frames and return once at budgets 1/8/100',async()=>{
 const built=await fixture();for(const budget of [1,8,100]){const source=createModuleProgram(built.manifest);source.install(built.files[0]!.body);const core=createCore(source),loaded=['root'];const run=()=>{for(let n=0;n<10000;n++){const state=core.run(budget);if(core.requiredFunction){const id=source.moduleForFunction(core.requiredFunction),file=built.files.find(f=>f.body.id===id);if(!file)throw new Error('module');loaded.push(id);source.install(file.body);}if(state==='stable')return;}throw new Error('loop');};run();let w=core.capture().wait;if(w?.kind!=='text')throw new Error('text');core.accept({type:'reveal',prompt:w.prompt,inputId:'r'});core.accept({type:'advance',prompt:w.prompt,inputId:'a'});run();w=core.capture().wait;if(w?.kind!=='choice')throw new Error('choice');core.accept({type:'choose',prompt:w.prompt,inputId:'choose',option:'shore'});run();expect(core.capture().frames).toHaveLength(2);expect(loaded).toEqual(['root','sea']);const cut=core.capture();expect(cut.programModules?.modules).toEqual(['root','sea']);const restored=createCore(source,core.view().profile,cut);expect(restored.capture().frames).toEqual(cut.frames);w=core.capture().wait;if(w?.kind!=='text')throw new Error('text');core.accept({type:'reveal',prompt:w.prompt,inputId:'rr'});core.accept({type:'advance',prompt:w.prompt,inputId:'aa'});run();expect(core.capture().globals.n).toEqual(i32(42));expect(loaded).toEqual(['root','sea','logic']);expect(source.has('interior')).toBe(false);expect(core.capture().history).toHaveLength(2);source.install(built.files.find(f=>f.body.id==='interior')!.body);expect(core.capture().programModules?.modules).toEqual(['root','sea','logic']);}
});
it('rejects altered bodies, changed manifests, missing closure and module snapshots used without their source',async()=>{
 const built=await fixture(),source=createModuleProgram(built.manifest),bad=structuredClone(built.files[0]!.body);bad.functions[0]!.code[0]=instruction('control.end',{at:'root.intro'});expect(()=>source.install(bad)).toThrow('MODULE_DIGEST');expect(source.has('root')).toBe(false);source.install(built.files[0]!.body);const c=createCore(source);c.run(100);const cut=c.capture();const changed=structuredClone(built.manifest);changed.modules[1]!.uri='other.json';expect(()=>createModuleProgram(changed).binding(cut)).toThrow('PROGRAM_MODULE_BINDING');const invalid=structuredClone(cut);invalid.programModules!.modules=['sea'];expect(()=>source.binding(invalid)).toThrow('PROGRAM_MODULE_CLOSURE');expect(()=>createCore(moduleNovel(),undefined,cut)).toThrow('PROGRAM_MODULE_BINDING');
});
it('typed wire factories reject opcode/value mismatches; dynamic ID relationships are enforced by the real linker',()=>{
 if(false){
 // @ts-expect-error opcode parameters stay associated
 instruction('control.end',{at:'bad',target:'wrong'});
 // @ts-expect-error variable/value kinds stay associated
 set('wrong',variable('n','i32'),bool(true));
 }
 const b=new ProgramBuilder({gameId:'type-audit',release:'v1',entry:'main'}).function({id:'main',entry:'call',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.call',{at:'call',function:'missing',args:[]}),instruction('control.end',{at:'end'})]});expect(()=>b.build()).toThrow('FUNCTION');
});

it('locale preferences accept validated language tags and reject malformed external input',async()=>{const {defaultPreferences,mergePreferences}=await import('galbox-sdk/settings');expect(mergePreferences(defaultPreferences(),{locale:'en-US'}).locale).toBe('en-US');expect(()=>mergePreferences(defaultPreferences(),{locale:'../en'})).toThrow('SCHEMA');});
