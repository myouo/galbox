import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {ProgramBuilder,variable,instruction,imagePut,expr as E,assignExpression,branchExpression,templatePage,randomI32} from 'galbox-sdk/port-kit';
import {parseProgram,i32,string} from 'galbox-sdk/protocol';
import {createReleaseManifest,inspectResource} from 'galbox-sdk/release';
const root='tests/player-app/public/expressions';await mkdir(root,{recursive:true});
const original=parseProgram(JSON.parse(await readFile('tests/fixtures/game-data/standard-novel/program.json','utf8'))),image=original.assets.find(a=>a.id==='shore'),music=original.assets.find(a=>a.id==='bgm');if(!image||!music)throw new Error('Original assets');
const b=new ProgramBuilder({gameId:'lighthouse-logbook',title:'灯塔来信 · 值班簿',release:'logbook-1',entry:'main'}).rng(12345),background=b.asset('image',{...image,path:'../'+image.path}),bgm=b.asset('audio',{...music,path:'../'+music.path});
const name=variable('name','string'),roll=variable('roll','i32'),score=variable('score','i32'),status=variable('status','string'),route=variable('route','string');
for(const v of [name,status,route])b.global({...v,initial:string(v.id==='name'?'旅人':'')});for(const v of [roll,score])b.global({...v,initial:i32(0)});
b.function({id:'main',entry:'logbook:stage',layout:1,params:[],locals:[],returns:'void',code:[
 imagePut('logbook:stage','background',background,{x:0,y:0,alpha:1}),instruction('audio.play',{at:'logbook:music',task:'music',asset:bgm.id,channel:'bgm',gain:.2,loop:true,restore:'replay'}),
 templatePage('logbook:welcome','logbook.welcome','zh-1',E.text('澪'),E.template`「${E.variable(name)}，今晚由你值班。」\n灯塔有${E.length(E.text('灯塔'))}条巡查路线。翻过这一页，再领取值班号。`),
 randomI32('logbook:draw',roll,E.integer(1),E.integer(100)),assignExpression('logbook:score',score,E.binary('add',E.binary('mul',E.variable(roll),E.integer(2)),E.integer(5))),
 branchExpression('logbook:weather',E.compare(E.variable(score),'ge',E.integer(105)),'logbook:bright','logbook:quiet'),
 assignExpression('logbook:bright',status,E.text('亮灯值班')),instruction('control.jump',{at:'logbook:bright-next',target:'logbook:result'}),
 assignExpression('logbook:quiet',status,E.text('海岸巡查')),
 templatePage('logbook:result','logbook.result','zh-1',E.text('值班簿'),E.template`${E.variable(name)}抽到了${E.variable(roll)}号；校验分为${E.variable(score)}。\n今夜建议：${E.variable(status)}。你也可以选择自己的路线。`),
 instruction('choice',{at:'logbook:choice',dest:'route',options:[{id:'shore',text:'沿海岸巡查',target:'logbook:ending'},{id:'tower',text:'留下守灯',target:'logbook:ending'}]}),
 templatePage('logbook:ending','logbook.ending','zh-1',E.text('澪'),E.template`${E.choose(E.equal(E.variable(route),E.text('shore')),E.text('潮水替我们捎来平安的消息。'),E.text('这一夜，灯火始终没有熄灭。'))}\n欢迎页已读：${E.wasRead('logbook.welcome','zh-1')}。值班号${E.variable(roll)}留在这本簿子里。`),
 instruction('profile.set',{at:'logbook:unlock',key:'logbookComplete',value:{kind:'bool',value:true}}),instruction('control.end',{at:'logbook:end'})]});
const program=b.build(),resources=await Promise.all(program.assets.map(async a=>inspectResource(a,new Uint8Array(await readFile(path.resolve(root,a.path))),bytes=>new TextDecoder('utf-8',{fatal:true}).decode(bytes))));const release=await createReleaseManifest({program,series:'1',resources},{async sha256(text){return createHash('sha256').update(text,'utf8').digest('hex');}});
for(const target of [root,'tests/fixtures/game-data/expression-novel']){await mkdir(target,{recursive:true});await writeFile(`${target}/program.json`,JSON.stringify(program,null,2)+'\n');await writeFile(`${target}/program.json.release.json`,JSON.stringify(release,null,2)+'\n');}
console.log('Built original logbook chapter using public expression/RNG factories');
