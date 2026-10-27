import {createReleaseManifest,inspectResource} from 'galbox-sdk/release';
import {createSaveBindingRegistry} from 'galbox-sdk/port-kit';
import {createFixtureBinding} from '../synthetic-saves/binding.js';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ProgramBuilder, instruction as op, literal, slot, imagePut } from '../../../../packages/galbox-sdk/src/program-tools/index.js';
import { i32, string } from '../../../../packages/galbox-sdk/src/protocol/index.js';
import type { Instruction } from '../../../../packages/galbox-sdk/src/protocol/index.js';
const root='tests/player-app/public';await mkdir(`${root}/assets`,{recursive:true});
const b=new ProgramBuilder({gameId:'lighthouse-letters',title:'灯塔来信',release:'lighthouse-1',entry:'main'});
const svg=(body:string,w=1280,h=720)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const defs='<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#102d46"/><stop offset="1" stop-color="#cf9f85"/></linearGradient><linearGradient id="sea" x2="0" y2="1"><stop stop-color="#307284"/><stop offset="1" stop-color="#122c44"/></linearGradient></defs>';
const shore=svg(`${defs}<path fill="url(#sky)" d="M0 0h1280v720H0z"/><circle cx="935" cy="225" r="62" fill="#f9ddb1"/><path fill="url(#sea)" d="M0 350Q500 330 1280 370v350H0z"/><g fill="none" stroke="#8cb9bd" opacity=".5" stroke-width="3"><path d="M40 410q180 -20 390 0m150 30q190 -20 500 0M0 500q400 -30 850 0M190 555q400 -20 1000 0"/></g><path fill="#293a43" d="M0 600Q210 490 400 570t320 150H0z"/><path fill="#1b333e" d="M1050 380l30-210h65l30 210z"/><path fill="#152c38" d="M1060 170v-45h95v45zM1050 125l58-60 58 60z"/><path fill="#f5dc9f" d="M1078 132h58v25h-58z"/>`);
const tower=svg(`${defs}<path fill="url(#sky)" d="M0 0h1280v720H0z"/><path fill="#102936" d="M0 480q500-90 1280 0v240H0z"/><path fill="#ddd4b6" d="M730 610l55-400h150l70 400z"/><path fill="#304d59" d="M760 210V110h205v100z"/><path fill="#f7dc9d" d="M790 130h145v55H790z"/><path fill="#182e3b" d="M740 110l123-85 122 85z"/><path fill="#263d47" d="M830 610v-135q35-40 70 0v135z"/><path fill="#e7cf9b" opacity=".2" d="M790 145L0 0v350z"/><path fill="#5d6c65" d="M0 650q400-180 745-10l-20 80H0z"/>`);
const lamp=svg('<defs><radialGradient id="glow"><stop stop-color="#fff1b0" stop-opacity=".95"/><stop offset="1" stop-color="#ffde89" stop-opacity="0"/></radialGradient></defs><ellipse cx="160" cy="110" rx="160" ry="110" fill="url(#glow)"/>',320,220);
const envelope=svg('<rect x="8" y="8" width="164" height="110" rx="5" fill="#ead9b5" stroke="#ad8665" stroke-width="3"/><path d="M8 8l82 63 82-63M8 118l57-52m107 52l-57-52" fill="none" stroke="#ad8665" stroke-width="2"/><circle cx="90" cy="74" r="12" fill="#b86555"/>',180,130);
async function image(id:string,body:string){const path=`assets/${id}.svg`;await writeFile(`${root}/${path}`,body);return b.asset('image',{id,path,mime:'image/svg+xml',sha256:createHash('sha256').update(body).digest('hex')});}
const bgShore=await image('shore',shore),bgTower=await image('tower',tower),light=await image('lamp',lamp),letter=await image('envelope',envelope);
await image('button',svg('<path fill="#ead9b5" d="M0 12L12 0h176l12 12-12 12H12z"/>',200,24));
for(const [id,freq,seconds]of [['bgm',174,2],['voice-shore',392,.3],['voice-tower',523,.3],['click',784,.06]] as const){
 const rate=22050,n=Math.floor(rate*seconds),wav=Buffer.alloc(44+n*2);wav.write('RIFF');wav.writeUInt32LE(36+n*2,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*2,40);
 for(let j=0;j<n;j++){const t=j/rate,envelope=Math.min(1,t*20,(seconds-t)*20);wav.writeInt16LE(Math.round(Math.sin(2*Math.PI*freq*t)*envelope*2000),44+j*2);}
 const path=`assets/${id}.wav`;await writeFile(`${root}/${path}`,wav);b.asset('audio',{id,path,mime:'audio/wav',sha256:createHash('sha256').update(wav).digest('hex')});
}
b.global({id:'visits',kind:'i32',initial:i32(0)}).global({id:'route',kind:'string',initial:string('none')});
const page=(at:string,id:string,content:string):Instruction=>op('text.page',{at,textId:id,revision:'zh-1',speaker:id.startsWith('opening')?'澪':'灯塔来信',content});
const code:Instruction[]=[
 imagePut('main:opening-start','background',bgShore,{x:0,y:0,alpha:1}),
 imagePut('main:lamp','light',light,{x:910,y:75,alpha:0},1),
 imagePut('main:letter','letter',letter,{x:170,y:380,alpha:1},2),
 op('audio.play',{at:'main:music',task:'music',asset:'bgm',channel:'bgm',gain:.3,loop:true,restore:'replay'}),
 page('main:opening-1','opening.1','潮水退去时，我在旧码头拾到一封没有邮戳的信。信封上，写着我的名字。'),
 page('main:opening-2','opening.2','「请在灯亮以前，替我读完它。」澪把信递过来，远处的塔还沉在暮色里。'),
 op('control.call',{at:'main:prepare',function:'prepareSignal',args:[literal(i32(0))],dest:'visits'}),
 page('main:opening-3','opening.3','我照着信上的记号拨动开关。第一束光穿过海雾，信纸上的字也慢慢清晰。'),
 op('stage.animate',{at:'main:fade',task:'fade',id:'light',to:{x:910,y:75,alpha:1},duration:400,policy:'reject'}),
 op('stage.animate',{at:'main:move',task:'move',id:'letter',to:{x:500,y:300,alpha:1},duration:1200,policy:'reject'}),
 op('task.join',{at:'main:effects-join',group:'signal',members:['fade','move']}),
 op('choice',{at:'main:route-choice',dest:'route',options:[{id:'shore',text:'沿着海岸，寻找寄信人',target:'shore:start'},{id:'tower',text:'走进灯塔，守候下一束光',target:'tower:start'}]}),
];
for(const route of ['shore','tower'] as const){
 code.push(imagePut(`${route}:start`,'background',route==='shore'?bgShore:bgTower,{x:0,y:0,alpha:1}));
 code.push(op('audio.play',{at:`${route}:sound`,task:`${route}-voice`,asset:`voice-${route}`,channel:'voice',gain:.65,loop:false,restore:'stop'}));
 const lines=route==='shore'?['碎贝壳在鞋底轻响。澪说，每一封没能送出的信，都会在这片海停留。','我们在防波堤后找到一只铁盒。里面没有地址，只有一张两个人的合影。','「原来，等信的人也可以先出发。」她笑着，把空白的背面朝向我。','我写下今天的日期。海风不再催促，潮水替我们收好了最后一句话。']:['塔里的阶梯比想象中长。每上一层，海面的声音就轻一点。','控制室的桌上放着一本值班簿，最后一页写着：「灯亮着，就有人能回家。」','澪打开窗。我把信放在灯下，看见纸背还有一行很小的字。','「谢谢你来。」没有落款。我想，这已经足够。'];
 lines.forEach((line,j)=>code.push(page(`${route}:page-${j+1}`,`${route}.${j+1}`,line)));
 code.push(page(`${route}:ending`,`ending.${route}`,route==='shore'?'海岸结局 · 寄出的明天\n我们把回信装进铁盒，约好下一次退潮再见。':'灯塔结局 · 留灯的人\n我们轮流守着那束光，直到远处传来船笛。'));
 code.push(op('profile.set',{at:`${route}:unlock`,key:`${route}Unlocked`,value:{kind:'bool',value:true}}));
 code.push(op('control.jump',{at:`${route}:to-epilogue`,target:'main:epilogue'}));
}
code.push(page('main:epilogue','epilogue','夜色落下，灯塔仍在回信。\n《灯塔来信》· 完'));
code.push(op('control.end',{at:'main:end'}));
b.function({id:'main',layout:1,entry:'main:opening-start',params:[],locals:[],returns:'void',code});
b.function({id:'prepareSignal',layout:1,entry:'helper:prepare-signal',params:[{id:'base',kind:'i32',initial:i32(0)}],locals:[{id:'result',kind:'i32',initial:i32(0)}],returns:'i32',code:[op('control.call',{at:'helper:prepare-signal',function:'incrementChecked',args:[slot('base')],dest:'result'}),op('control.return',{at:'helper:prepared',value:slot('result')})]});
b.function({id:'incrementChecked',layout:1,entry:'helper:increment',params:[{id:'base',kind:'i32',initial:i32(0)}],locals:[{id:'result',kind:'i32',initial:i32(0)}],returns:'i32',code:[op('i32.add.checked',{at:'helper:increment',dest:'result',left:slot('base'),right:literal(i32(1))}),op('control.return',{at:'helper:incremented',value:slot('result')})]});
const program=b.build();await writeFile(`${root}/program.json`,JSON.stringify(program,null,2)+'\n');await writeFile('tests/fixtures/game-data/standard-novel/program.json',JSON.stringify(program,null,2)+'\n');
console.log(`Generated ${program.assets.length} original assets and ${program.functions.length} functions`);

const resources=await Promise.all(program.assets.map(async a=>inspectResource(a,new Uint8Array(await readFile(`${root}/${a.path}`)),b=>new TextDecoder('utf-8',{fatal:true}).decode(b))));
const release=await createReleaseManifest({program,series:'1',resources,bindings:createSaveBindingRegistry([createFixtureBinding(program)])},{async sha256(text){return createHash('sha256').update(text,'utf8').digest('hex');}});for(const file of [`${root}/program.json.release.json`,'tests/fixtures/game-data/standard-novel/program.json.release.json'])await writeFile(file,JSON.stringify(release,null,2)+'\n');
