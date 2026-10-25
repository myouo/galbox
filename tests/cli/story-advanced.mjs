import base from './story-base.mjs';
import {counter} from './port.mjs';
import {instruction as op} from 'galbox-sdk/port-kit';
import {i32,bool} from 'galbox-sdk/protocol';
/** @param {readonly import('galbox-sdk/protocol').Asset[]} assets
 * @param {import('galbox-sdk/port-kit').PortRegistration} port */
export default function buildProgram(assets,port){
 const p=base(assets,port),main=p.functions.find(f=>f.id==='main');if(!main)throw new Error('main');
 p.globals.push({id:'signalValue',kind:'i32',initial:i32(0)});main.entry='main:signal';main.code.unshift(counter.invocation('main:signal',{step:2}));
 const choice=main.code.find(i=>i.op==='choice');if(!choice)throw new Error('choice');choice.options.push({id:'mail',text:'写一封新的回信',target:'mail:page'});
 main.code.push(op('text.page',{at:'mail:page',textId:'mail',revision:'zh-1',speaker:'澪',content:'我把回信交给风。下次潮起时，这里会多一个新的故事。'}),op('profile.set',{at:'mail:unlock',key:'mailUnlocked',value:bool(true)}),op('control.jump',{at:'mail:join',target:'main:ending'}));
 p.sourceMap=(p.sourceMap??[]).map(s=>({...s,source:{...s.source,file:'story-base.mjs'}}));p.sourceMap.push({at:'main:signal',source:{file:'story.mjs',line:9,column:1}},{at:'mail:page',source:{file:'story.mjs',line:11,column:1}});
 p.obligations=[...(p.obligations??[]),{id:'developer-signal',kind:'behavior',required:true,description:'The declared signal must remain implemented',source:{file:'story.mjs',line:9,column:1}}];p.behaviorMappings=[...(p.behaviorMappings??[]),{obligation:'developer-signal',addresses:['main:signal']}];return p;
}
