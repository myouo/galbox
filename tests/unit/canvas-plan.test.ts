import {it,expect} from 'vitest';
import {createCore} from 'galbox-sdk/core';
import {ProgramBuilder,instruction,stageImage} from 'galbox-sdk/port-kit';
import {canvasPlan} from '../../packages/galbox-sdk/src/protocol/canvas.js';
it('hidden backup subtrees allocate no filter workspaces, but becoming visible rechecks the same budget and hidden cycles still reject',()=>{
 const b=new ProgramBuilder({gameId:'hidden-canvas-budget',release:'v1',entry:'main'}),image=b.asset('image',{id:'image',path:'image.svg',mime:'image/svg+xml',sha256:'a'.repeat(64)}),p=b.function({id:'main',entry:'parent',layout:1,params:[],locals:[],returns:'void',code:[stageImage('parent','parent',image,{x:0}, {visible:false,filters:{blur:4,brightness:.5,grayscale:0}}),stageImage('child','child',image,{x:0}, {parent:'parent',filters:{blur:8,brightness:.5,grayscale:1}}),instruction('text.page',{at:'page',textId:'page',revision:'v1',speaker:'',content:'Hidden'}),instruction('control.end',{at:'end'})]}).build(),c=createCore(p);c.run(100);const hidden=c.capture();expect(canvasPlan(hidden,true,4194304)).toMatchObject({depth:0,blur:false,color:false,bytes:1280*720*4});const visible=c.capture();visible.stage[0]!.visible=true;expect(()=>canvasPlan(visible,true,4194304)).toThrow('CANVAS_COMPOSITION_BUDGET');hidden.stage[0]!.parent='child';expect(()=>canvasPlan(hidden,true,4194304)).toThrow('CANVAS_GRAPH');
});
