import {test,expect} from '@playwright/test';
import type * as Harness from './harness/sdk.js';

test('ADV fits the full rich page before reveal, survives resize and illustrated restore, then resets a short page',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',s:typeof Harness=await import(url),b=new s.ProgramBuilder({gameId:'adv-full-page',release:'v1',entry:'main'});
  b.textLayout(s.textLayout('body',[s.textTheme('theme',{font:{kind:'system',family:'monospace'},fontSize:30,lineHeight:1.4,padding:8})],[s.textWindow('body','adv','theme',{x:48,y:500,width:1184,height:188})]));
  const words='Long words stay inside the complete page. 全部文字都应在窗口内呈现。'.repeat(8),program=b.function({id:'main',entry:'long',layout:1,params:[],locals:[],returns:'void',code:[s.richPage('long','long','v1','Narrator',[s.richText.ruby('海辺','うみべ'),s.richText.text(words,{scale:1.2}),s.richText.br(),s.richText.text('UNBREAKABLE'.repeat(12))]),s.richPage('short','short','v1','',[s.richText.text('Short page.')]),s.instruction('control.end',{at:'end'})]}).build();
  const mount=document.createElement('div');mount.style.cssText='position:relative;width:640px;height:360px';document.body.append(mount);
  const p=await s.createPlayer({program,provider:{async acquire(){throw new Error('no assets');}},mount,store:new s.MemoryStore(),saveCompatibilitySeries:'v1',graphics:{renderer:'canvas'}});p.setPaused(true);
  const measure=()=>{const root=mount.querySelector<HTMLElement>('[data-text-window=body]')!,paragraph=root.querySelector('p')!,box=root.getBoundingClientRect();return {factor:Number(root.style.getPropertyValue('--galbox-fit-scale')),overflow:getComputedStyle(root).overflow,scroll:[root.scrollWidth-root.clientWidth,root.scrollHeight-root.clientHeight,root.scrollTop],font:parseFloat(getComputedStyle(paragraph).fontSize),escaped:[...paragraph.querySelectorAll('span,ruby,rt')].some(e=>{if(e instanceof HTMLElement&&e.classList.contains('galbox-text-unit')&&!e.textContent?.trim()&&!e.style.textDecoration)return false;const r=e.getBoundingClientRect();return r.width>0&&(r.right>box.right+1||r.bottom>box.bottom+1);}),content:paragraph.textContent};};
  const step=async()=>{p.setPaused(false);try{const v=p.getSnapshot(),w=v.core?.run.wait;if(w?.kind!=='text')throw new Error('text wait');await p.step(w.prompt,v.epoch);}finally{p.setPaused(true);}};
  try{
   await p.updatePreferences({display:{fontScale:1.5}});await p.start();const before=p.capture(),partial=measure();await step();const revealed=measure();if(!p.capture().text?.revealed)throw new Error('manual reveal blocked');await p.quickSave();const thumb=p.getSnapshot().slots.find(x=>x.kind==='quick')?.capture?.thumbnail;if(!thumb)throw new Error('illustrated save');
   mount.style.width='384px';mount.style.height='216px';await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r())));const small=measure();await p.load('quick');const restored=measure(),after=p.capture();await step();const next=measure();
   return {partial,revealed,small,restored,next,units:before.text?.revealed,restoredText:after.text?.content===before.text?.content,restoredFrame:JSON.stringify(after.frames)===JSON.stringify(before.frames),thumbnail:thumb.width===320&&thumb.height===180};
  }finally{p.dispose();mount.remove();}
 });
 expect(result.units).toBe(0);expect(result.partial.factor).toBeGreaterThan(0);expect(result.partial.factor).toBeLessThan(1);
 for(const view of [result.partial,result.revealed,result.small,result.restored]){expect(view.overflow).toBe('hidden');expect(view.scroll).toEqual([0,0,0]);expect(view.escaped).toBe(false);expect(view.content).toContain('UNBREAKABLE'.repeat(12));}
 expect(result.partial.factor).toBe(result.revealed.factor);expect(result.small.factor).toBeCloseTo(result.restored.factor,3);expect(result.restoredText&&result.restoredFrame&&result.thumbnail).toBe(true);expect(result.next.factor).toBe(1);expect(result.next.font).toBeCloseTo(13.5);expect(result.next.content).toBe('Short page.');
});

test('plain ADV reserves unrevealed lines and explicit NVL accumulation retains scrolling',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',s:typeof Harness=await import(url),b=new s.ProgramBuilder({gameId:'plain-full-page',release:'v1',entry:'main'}),content=Array.from({length:9},(_,i)=>'Line '+i+' stays visible.').join('\n');
  b.textLayout(s.textLayout('body',[s.textTheme('theme',{fontSize:30,padding:0})],[s.textWindow('body','adv','theme',{x:0,y:500,width:1280,height:180}),s.textWindow('book','nvl','theme',{x:0,y:0,width:600,height:300},{visible:false})]));
  const program=b.function({id:'main',entry:'plain',layout:1,params:[],locals:[],returns:'void',code:[s.instruction('text.page',{at:'plain',textId:'plain',revision:'v1',speaker:'',content}),s.instruction('text.window.select',{at:'select',window:'book'}),s.instruction('text.page',{at:'book',textId:'book',revision:'v1',speaker:'',content}),s.instruction('control.end',{at:'end'})]}).build(),mount=document.createElement('div');mount.style.cssText='position:relative;width:640px;height:360px';document.body.append(mount);
  const p=await s.createPlayer({program,provider:{async acquire(){throw new Error('no assets');}},mount,store:new s.MemoryStore(),saveCompatibilitySeries:'v1',graphics:{renderer:'canvas'}});p.setPaused(true);const step=async()=>{p.setPaused(false);try{const v=p.getSnapshot(),w=v.core?.run.wait;if(w?.kind!=='text')throw new Error('wait');await p.step(w.prompt,v.epoch);}finally{p.setPaused(true);}};
  try{await p.start();const root=mount.querySelector<HTMLElement>('[data-text-window=body]')!,initial={fit:root.style.getPropertyValue('--galbox-fit-scale'),text:root.querySelector('p')!.textContent,hidden:root.querySelector('[aria-hidden=true]')?.textContent};await step();const revealed={fit:root.style.getPropertyValue('--galbox-fit-scale'),overflow:root.scrollHeight-root.clientHeight,top:root.scrollTop};await step();await step();const book=mount.querySelector<HTMLElement>('[data-text-window=book]')!;return {content,initial,revealed,nvl:{overflow:getComputedStyle(book).overflowY,tall:book.scrollHeight>book.clientHeight},read:p.getSnapshot().core?.profile.read.length};}finally{p.dispose();mount.remove();}
 });expect(result.initial.text).toBe(result.content);expect(result.initial.hidden).toBe(result.content);expect(Number(result.initial.fit)).toBeLessThan(1);expect(result.initial.fit).toBe(result.revealed.fit);expect(result.revealed.overflow).toBe(0);expect(result.revealed.top).toBe(0);expect(result.nvl).toEqual({overflow:'auto',tall:true});expect(result.read).toBe(1);
});

test('font boxes extending above a tight line pitch keep their first line inside the ADV frame',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',s:typeof Harness=await import(url),b=new s.ProgramBuilder({gameId:'font-box-leading',release:'v1',entry:'main'});
  b.textLayout(s.textLayout('body',[s.textTheme('theme',{font:{kind:'system',family:'monospace'},fontSize:40,lineHeight:1,padding:0,borderWidth:0})],[s.textWindow('body','adv','theme',{x:0,y:200,width:1280,height:160})]));
  const program=b.function({id:'main',entry:'text',layout:1,params:[],locals:[],returns:'void',code:[s.richPage('text','text','v1','',[s.richText.text('Tall glyphs',{scale:1.5})]),s.instruction('control.end',{at:'end'})]}).build(),mount=document.createElement('div');mount.style.cssText='position:relative;width:640px;height:360px';document.body.append(mount);
  const p=await s.createPlayer({program,provider:{async acquire(){throw new Error('no assets');}},mount,store:new s.MemoryStore(),saveCompatibilitySeries:'v1',graphics:{renderer:'canvas'}});p.setPaused(true);
  try{await p.start();const root=mount.querySelector<HTMLElement>('[data-text-window]')!,unit=root.querySelector<HTMLElement>('.galbox-text-unit')!,bounds=root.getBoundingClientRect(),glyph=unit.getBoundingClientRect();return {leading:parseFloat(root.style.getPropertyValue('--galbox-fit-leading')),fit:Number(root.style.getPropertyValue('--galbox-fit-scale')),top:glyph.top-bounds.top,bottom:bounds.bottom-glyph.bottom,overflow:root.scrollHeight-root.clientHeight};}finally{p.dispose();mount.remove();}
 });expect(result.leading).toBeGreaterThan(0);expect(result.fit).toBe(1);expect(result.top).toBeGreaterThanOrEqual(0);expect(result.bottom).toBeGreaterThanOrEqual(0);expect(result.overflow).toBe(0);
});

test('hanging wrap spaces do not shrink readable text that already fits',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',s:typeof Harness=await import(url),ctx=document.createElement('canvas').getContext('2d')!;ctx.font='10px monospace';const width=ctx.measureText('A'.repeat(17)).width*2,b=new s.ProgramBuilder({gameId:'hanging-wrap-space',release:'v1',entry:'main'});
  b.textLayout(s.textLayout('body',[s.textTheme('theme',{font:{kind:'system',family:'monospace'},fontSize:20,lineHeight:1.5,letterSpacing:0,padding:0,borderWidth:0})],[s.textWindow('body','adv','theme',{x:0,y:0,width,height:160})]));
  const content='A'.repeat(17)+' '+'B'.repeat(17),program=b.function({id:'main',entry:'text',layout:1,params:[],locals:[],returns:'void',code:[s.richPage('text','text','v1','',[s.richText.text(content)]),s.instruction('control.end',{at:'end'})]}).build(),mount=document.createElement('div');mount.style.cssText='position:relative;width:640px;height:360px';document.body.append(mount);
  const p=await s.createPlayer({program,provider:{async acquire(){throw new Error('no assets');}},mount,store:new s.MemoryStore(),saveCompatibilitySeries:'v1',graphics:{renderer:'canvas'}});p.setPaused(true);
  try{await p.start();const root=mount.querySelector<HTMLElement>('[data-text-window]')!,paragraph=root.querySelector('p')!,space=[...root.querySelectorAll<HTMLElement>('.galbox-text-unit')].find(e=>e.textContent===' ')!;return {factor:Number(root.style.getPropertyValue('--galbox-fit-scale')),font:parseFloat(getComputedStyle(paragraph).fontSize),content:paragraph.textContent,expected:content,hanging:space.offsetLeft+space.offsetWidth>root.clientWidth,overflow:root.scrollHeight-root.clientHeight};}finally{p.dispose();mount.remove();}
 });expect(result.hanging).toBe(true);expect(result.factor).toBe(1);expect(result.font).toBe(10);expect(result.content).toBe(result.expected);expect(result.overflow).toBe(0);
});

test('blank first lines that rewrap during fitting reserve the current candidate font bounds',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',s:typeof Harness=await import(url),b=new s.ProgramBuilder({gameId:'blank-first-line',release:'v1',entry:'main'});
  b.textLayout(s.textLayout('body',[s.textTheme('theme',{font:{kind:'system',family:'monospace'},fontSize:30,lineHeight:1,letterSpacing:0,padding:0,borderWidth:0})],[s.textWindow('body','adv','theme',{x:0,y:0,width:400,height:70})]));
  const content=' '.repeat(24)+'A'.repeat(40),program=b.function({id:'main',entry:'text',layout:1,params:[],locals:[],returns:'void',code:[s.richPage('text','text','v1','',[s.richText.text(content)]),s.instruction('control.end',{at:'end'})]}).build(),mount=document.createElement('div');mount.style.cssText='position:relative;width:640px;height:360px';document.body.append(mount);
  const p=await s.createPlayer({program,provider:{async acquire(){throw new Error('no assets');}},mount,store:new s.MemoryStore(),saveCompatibilitySeries:'v1',graphics:{renderer:'canvas'}});p.setPaused(true);
  try{await p.start();const root=mount.querySelector<HTMLElement>('[data-text-window]')!,box=root.getBoundingClientRect(),ink=[...root.querySelectorAll<HTMLElement>('.galbox-text-unit')].filter(e=>e.textContent?.trim());return {fit:Number(root.style.getPropertyValue('--galbox-fit-scale')),content:root.querySelector('p')?.textContent,expected:content,overflow:root.scrollHeight-root.clientHeight,escaped:ink.some(e=>{const r=e.getBoundingClientRect();return r.top<box.top-1||r.bottom>box.bottom+1||r.right>box.right+1;})};}finally{p.dispose();mount.remove();}
 });expect(result.fit).toBeGreaterThan(.5);expect(result.fit).toBeLessThan(1);expect(result.content).toBe(result.expected);expect(result.overflow).toBe(0);expect(result.escaped).toBe(false);
});
