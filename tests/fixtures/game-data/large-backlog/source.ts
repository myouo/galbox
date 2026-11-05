import {createHash} from 'node:crypto';
import {ProgramBuilder,instruction,richPage,richText,expr,expressionWire,branchExpression,variable,slot,stageImage} from 'galbox-sdk/port-kit';
import {i32} from 'galbox-sdk/protocol';
import {createCore} from 'galbox-sdk/core';
export const pixel=new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><path fill="#8bc" d="M0 0h16v9H0z"/></svg>');
export function largeBacklog(){
 const b=new ProgramBuilder({gameId:'original-large-backlog',release:'v1',entry:'main'}),count=variable('count','i32'),image=b.asset('image',{id:'pixel',path:'pixel.svg',mime:'image/svg+xml',sha256:createHash('sha256').update(pixel).digest('hex')});
 b.global({...count,initial:i32(0)}).function({id:'main',entry:'put',layout:1,params:[],locals:[],returns:'void',code:[stageImage('put','lamp',image,{x:0,y:0,scaleX:80,scaleY:80}),instruction('state.collect',{at:'collect',retainTasks:[],historyLimit:2048}),richPage('body','body','v1','Keeper',[richText.text(expr.template`Entry ${expr.variable(count)}`)]),instruction('i32.add.checked',{at:'increment',dest:count.id,left:slot(count.id),right:{literal:i32(1)}}),branchExpression('loop',expr.compare(expr.variable(count),'lt',expr.integer(2100)),'collect','done'),richPage('done','done','v1','Keeper',[richText.text('The earlier entries remain available for reading.')]),instruction('control.end',{at:'end'})]});return b.build();
}
/** Actual Core confirmations; no history array or saved PC is synthesized. */
export function largeBacklogCut(){
 const program=largeBacklog(),core=createCore(program);core.accept({type:'history.session',id:'large-backlog'});core.accept({type:'text.preferences',value:{intervalMs:0}});
 for(let n=0;n<2100;n++){core.run(100);const w=core.view().run.wait;if(w?.kind!=='text'||w.at!=='body')throw new Error('Backlog body');core.accept({type:'advance',prompt:w.prompt,inputId:'entry-'+n});}
 core.run(100);const cut=core.capture();if(cut.wait?.at!=='done'||cut.history.length!==2049)throw new Error('Backlog endpoint');return {program,cut,profile:core.view().profile};
}
