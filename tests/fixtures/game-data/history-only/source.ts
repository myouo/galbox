import {createHash} from 'node:crypto';
import {ProgramBuilder,instruction,richPage,richText as R,historyText,textLayout,textTheme,textWindow,branchExpression,expr,variable,stageImage} from 'galbox-sdk/port-kit';
import {bool} from 'galbox-sdk/protocol';
export const pixel=new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><path fill="#8bc" d="M0 0h16v9H0z"/></svg>');
export function historyOnlyBuilder(enabled=true){
 const b=new ProgramBuilder({gameId:'original-history-only',release:'v1',entry:'main'}),image=b.asset('image',{id:'pixel',path:'pixel.svg',mime:'image/svg+xml',sha256:createHash('sha256').update(pixel).digest('hex')}),flag=variable('write','bool');b.global({...flag,initial:bool(enabled)}).textLayout(textLayout('body',[textTheme('plain')],[textWindow('body','adv','plain',{x:0,y:500,width:1280,height:200})]));
 b.function({id:'notes',entry:'note-a',layout:1,params:[],locals:[],returns:'void',code:[historyText('note-a','note-a','v1',[R.text('Only in history ',{color:'#ff0000'}),R.ruby('name','reading')],{append:true}),historyText('note-b','note-b','v1',[R.br(),R.text('Another fragment')]),instruction('control.return',{at:'notes-return'})]});
 b.function({id:'main',entry:'put',layout:1,params:[],locals:[],returns:'void',code:[stageImage('put','background',image,{scaleX:80,scaleY:80}),richPage('first','first','v1','Keeper',[R.text('Visible body')]),instruction('text.window.visible',{at:'hide',window:'body',visible:false}),branchExpression('guard',expr.variable(flag),'call','pause'),instruction('control.call',{at:'call',function:'notes',args:[]}),instruction('wait.delay',{at:'pause',task:'pause',duration:100000}),instruction('text.window.visible',{at:'show',window:'body',visible:true}),richPage('last','last','v1','Keeper',[R.text('The body continues.')]),instruction('control.end',{at:'end'})]});return b;
}

export const historyOnlyProgram=(enabled=true)=>historyOnlyBuilder(enabled).build();
