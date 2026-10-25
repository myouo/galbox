import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {ProgramBuilder,richText as R,richPage,textTheme,textWindow,textLayout,textFont,instruction,imagePut} from 'galbox-sdk/port-kit';
import {parseProgram,string} from 'galbox-sdk/protocol';
import {createReleaseManifest,inspectResource} from 'galbox-sdk/release';
const root='apps/playground/public/layout';await mkdir(root,{recursive:true});
const original=parseProgram(JSON.parse(await readFile('fixtures/standard-novel/program.json','utf8'))),image=original.assets.find(a=>a.id==='shore'),music=original.assets.find(a=>a.id==='bgm');if(!image||!music)throw new Error('Original assets');
const b=new ProgramBuilder({gameId:'lighthouse-windows',title:'灯塔来信 · 双页值班簿',release:'windows-1',entry:'main'}),background=b.asset('image',{...image,path:'../'+image.path}),bgm=b.asset('audio',{...music,path:'../'+music.path});
const fontBytes=await readFile('fixtures/layout-novel/lighthouse-grid.ttf');await writeFile(root+'/lighthouse-grid.ttf',fontBytes);const font=b.asset('font',{id:'lighthouse-grid',path:'lighthouse-grid.ttf',mime:'font/ttf',sha256:createHash('sha256').update(fontBytes).digest('hex')});
b.textLayout(textLayout('dialogue',[
 textTheme('night'),textTheme('paper',{font:textFont(font),fontSize:25,background:'#EEE2C5',backgroundOpacity:.98,color:'#233744',speakerColor:'#795635',borderColor:'#AB8E62',padding:26}),textTheme('sea',{background:'#123F50',color:'#D7EFF1',speakerColor:'#FFD580'})
],[textWindow('dialogue','adv','night',{x:48,y:500,width:1184,height:188}),textWindow('logbook','nvl','paper',{x:48,y:112,width:730,height:370},{maxEntries:4,visible:false,z:1}),textWindow('note','adv','sea',{x:820,y:130,width:410,height:240},{visible:false,z:2})]));
b.global({id:'route',kind:'string',initial:string('')});
b.function({id:'main',entry:'book:stage',layout:1,params:[],locals:[],returns:'void',code:[imagePut('book:stage','background',background,{x:0,y:0,alpha:1}),instruction('audio.play',{at:'book:music',task:'music',asset:bgm.id,channel:'bgm',gain:.2,loop:true,restore:'replay'}),
 richPage('book:welcome','book.welcome','zh-1','澪',[R.text('灯亮以前，把今晚的事写进值班簿吧。')]),
 instruction('text.window.select',{at:'book:select',window:'logbook'}),richPage('book:first','book.first','zh-1','LOGBOOK / 01',[R.ruby('灯塔','とうだい'),R.text('：傍晚，海风把最后一封信送到了码头。')]),
 richPage('book:second','book.second','zh-1','LOGBOOK / 02',[R.text('入夜，第一束光穿过雾。纸上留下两个人的名字。',{effect:{kind:'fade',duration:180}})]),
 instruction('text.window.select',{at:'book:note-select',window:'note'}),richPage('book:note','book.note','zh-1','窗边的纸条',[R.text('「别忘了回信。」',{italic:true}),R.pause(200),R.text('字迹轻轻晃了一下。',{effect:{kind:'wave',amplitude:1,periodMs:900}})]),
 instruction('text.window.visible',{at:'book:hide-note',window:'note',visible:false}),instruction('text.window.theme',{at:'book:theme',window:'logbook',theme:'sea'}),instruction('text.window.select',{at:'book:back',window:'logbook'}),
 richPage('book:third','book.third','zh-1','澪',[R.text('下一页，我们留给明天。')]),
 instruction('choice',{at:'book:choice',dest:'route',options:[{id:'send',text:'把回信寄往海上',target:'book:clear'},{id:'keep',text:'把回信留在灯下',target:'book:clear'}]}),
 instruction('text.window.clear',{at:'book:clear',window:'logbook'}),richPage('book:ending','book.ending','zh-1','新的一页',[R.text('海风翻过值班簿。灯还亮着，明天仍有故事可以写。')]),
 instruction('profile.set',{at:'book:unlock',key:'bookComplete',value:{kind:'bool',value:true}}),instruction('control.end',{at:'book:end'})]});
const program=b.build(),resources=await Promise.all(program.assets.map(async a=>inspectResource(a,new Uint8Array(await readFile(path.resolve(root,a.path))),bytes=>new TextDecoder('utf-8',{fatal:true}).decode(bytes))));const release=await createReleaseManifest({program,series:'1',resources},{async sha256(text){return createHash('sha256').update(text,'utf8').digest('hex');}});
for(const target of [root,'fixtures/layout-novel']){await mkdir(target,{recursive:true});await writeFile(`${target}/program.json`,JSON.stringify(program,null,2)+'\n');await writeFile(`${target}/program.json.release.json`,JSON.stringify(release,null,2)+'\n');}
console.log('Built original double-page logbook with ADV/NVL windows, themes and owned TrueType font');
