import {ProgramBuilder,instruction as op,imagePut} from 'galbox-sdk/port-kit';
import {string,bool} from 'galbox-sdk/protocol';
/** @param {readonly import('galbox-sdk/protocol').Asset[]} assets
 * @param {import('galbox-sdk/port-kit').PortRegistration} port */
export default function buildProgram(assets,port){
 const coast=assets.find(a=>a.id==='coast'),music=assets.find(a=>a.id==='music');if(!coast||!music)throw new Error('Missing declared assets');
 const b=new ProgramBuilder({gameId:'my-lighthouse-novel',release:'story-1',title:'海风的回信',entry:'main'});
 const background=b.asset('image',coast);b.asset('audio',music);b.global({id:'route',kind:'string',initial:string('none')});
 b.function({id:'main',layout:1,entry:'main:start',params:[],locals:[],returns:'void',code:[
  imagePut('main:start','background',background,{x:0,y:0,alpha:1}),
  op('audio.play',{at:'main:music',task:'music',asset:'music',channel:'bgm',gain:.2,loop:true,restore:'replay'}),
  op('text.page',{at:'main:opening',textId:'opening',revision:'zh-1',speaker:'澪',content:'潮水送来一封信。最后一行写着：灯亮的时候，你会找到答案。'}),
  op('choice',{at:'main:choice',dest:'route',options:[{id:'shore',text:'沿着海岸走',target:'shore:page'},{id:'tower',text:'等灯塔亮起',target:'tower:page'}]}),
  op('text.page',{at:'shore:page',textId:'shore',revision:'zh-1',speaker:'澪',content:'我们把回信藏进礁石之间。明天退潮时，海风会记得这条路。'}),
  op('profile.set',{at:'shore:unlock',key:'shoreUnlocked',value:bool(true)}),
  op('control.jump',{at:'shore:join',target:'main:ending'}),
  op('text.page',{at:'tower:page',textId:'tower',revision:'zh-1',speaker:'澪',content:'灯光划过海面。我在信的背面写下日期，替远方留一盏灯。'}),
  op('profile.set',{at:'tower:unlock',key:'towerUnlocked',value:bool(true)}),
  op('text.page',{at:'main:ending',textId:'ending',revision:'zh-1',speaker:'海风的回信',content:'这一次，信有了归处。\n完'}),
  op('control.end',{at:'main:end'}),
 ]});b.source('main:opening',{file:'story.mjs',line:12,column:1}).source('main:choice',{file:'story.mjs',line:13,column:1});
 b.obligation({id:'route-choice',kind:'behavior',required:true,description:'Both authored routes remain selectable',source:{file:'story.mjs',line:13,column:1,locator:'authored:route-choice'}});
 b.mapping({obligation:'route-choice',addresses:['main:choice']});return b.build(port.operations);
}
