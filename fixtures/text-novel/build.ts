import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {ProgramBuilder,richText as R,richPage,expr as E,variable,instruction,imagePut} from 'galbox-sdk/port-kit';
import {parseProgram,string} from 'galbox-sdk/protocol';
import {createReleaseManifest,inspectResource} from 'galbox-sdk/release';
const root='apps/playground/public/text';await mkdir(root,{recursive:true});
const original=parseProgram(JSON.parse(await readFile('fixtures/standard-novel/program.json','utf8'))),image=original.assets.find(a=>a.id==='shore'),music=original.assets.find(a=>a.id==='bgm');if(!image||!music)throw new Error('Original assets');
const b=new ProgramBuilder({gameId:'lighthouse-typecase',title:'灯塔来信 · 信纸上的光',release:'typecase-1',entry:'main'}),background=b.asset('image',{...image,path:'../'+image.path}),bgm=b.asset('audio',{...music,path:'../'+music.path}),name=variable('name','string'),route=variable('route','string');
b.global({...name,initial:string('旅人')}).global({...route,initial:string('')});
b.function({id:'main',entry:'paper:stage',layout:1,params:[],locals:[],returns:'void',code:[
 imagePut('paper:stage','background',background,{x:0,y:0,alpha:1}),instruction('audio.play',{at:'paper:music',task:'music',asset:bgm.id,channel:'bgm',gain:.2,loop:true,restore:'replay'}),
 richPage('paper:welcome','paper.welcome','zh-1','澪',[R.text('信纸上的光',{bold:true,color:'#FFD580',scale:1.25}),R.br(),R.text(E.template`${E.variable(name)}，你看，`),R.ruby('灯塔','とうだい',{color:'#B8E1E8'}),R.text('把海风也写进了信里。'),R.br(),R.text('信末画着一家人👨‍👩‍👧‍👦，还有一颗星。',{underline:true})]),
 richPage('paper:light','paper.light','zh-1','澪',[R.text('「先别急着翻页。」',{italic:true}),R.pause(650),R.text('光从字里慢慢浮起来。',{effect:{kind:'fade',duration:240}}),R.br(),R.speed(60),R.text('海面在信纸上轻轻起伏。',{color:'#B8E1E8',effect:{kind:'wave',amplitude:2,periodMs:1000}}),R.speed(32),R.text('灯忽然跳了一下。',{effect:{kind:'shake',amplitude:1,periodMs:180}})]),
 instruction('choice',{at:'paper:choice',dest:'route',options:[{id:'send',text:'寄出回信',target:'paper:ending'},{id:'keep',text:'把信留在灯下',target:'paper:ending'}]}),
 richPage('paper:ending','paper.ending','zh-1','灯塔来信',[R.text(E.choose(E.equal(E.variable(route),E.text('send')),E.text('我把回信折好，交给下一班靠岸的船。'),E.text('我把信压在值班簿里，等下一位守灯的人。'))),R.br(),R.ruby('明日','あした',{bold:true,color:'#FFD580'}),R.text('的光，会找到它该去的地方。',{effect:{kind:'fade',duration:300}})]),
 instruction('profile.set',{at:'paper:unlock',key:'paperComplete',value:{kind:'bool',value:true}}),instruction('control.end',{at:'paper:end'})]});
const program=b.build(),resources=await Promise.all(program.assets.map(async a=>inspectResource(a,new Uint8Array(await readFile(path.resolve(root,a.path))),bytes=>new TextDecoder('utf-8',{fatal:true}).decode(bytes))));
const release=await createReleaseManifest({program,series:'1',resources},{async sha256(text){return createHash('sha256').update(text,'utf8').digest('hex');}});
for(const target of [root,'fixtures/text-novel']){await mkdir(target,{recursive:true});await writeFile(`${target}/program.json`,JSON.stringify(program,null,2)+'\n');await writeFile(`${target}/program.json.release.json`,JSON.stringify(release,null,2)+'\n');}
console.log('Built original letter chapter using public rich text factories');
