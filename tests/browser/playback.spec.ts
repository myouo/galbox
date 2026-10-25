import {test,expect} from '@playwright/test';
import type * as Harness from './harness/sdk.js';

test('Auto waits for native voice completion, pauses in menus and rebuilds voice gates on restore',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',sdk:typeof Harness=await import(url),p=sdk.parseProgram(await(await fetch('/program.json')).json()),main=p.functions[0];if(!main)throw new Error('main');
  main.entry='voice:start';main.code=[sdk.instruction('audio.play',{at:'voice:start',task:'voice',asset:'bgm',channel:'voice',gain:.1,loop:false,restore:'replay'}),sdk.instruction('text.page',{at:'voice:one',textId:'voice.1',revision:'v1',speaker:'澪',content:'等这一声回信。'}),sdk.instruction('text.page',{at:'voice:two',textId:'voice.2',revision:'v1',speaker:'澪',content:'现在可以前进了。'}),sdk.instruction('choice',{at:'voice:choice',dest:'route',options:[{id:'stay',text:'留下',target:'voice:end'}]}),sdk.instruction('control.end',{at:'voice:end'})];
  const create=AudioContext.prototype.createBufferSource,sources:AudioBufferSourceNode[]=[];AudioContext.prototype.createBufferSource=function(){const node=create.call(this);sources.push(node);return node;};
  const mount=document.createElement('div');document.body.append(mount);let player:import('galbox-sdk/player').Player|undefined;const sleep=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms));
  try{
   player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,store:new sdk.MemoryStore(),saveCompatibilitySeries:'voice-auto'});await player.updatePreferences({text:{intervalMs:0},playback:{autoDelayMs:100}});await player.start();await player.setAuto(true);await sleep(150);
   const startup={at:player.capture().text?.textId,task:player.capture().tasks[0]?.status,voice:player.getSnapshot().playback.voice};
   await player.save('playing');const source=sources[0],late=source?.onended;await player.load('playing');const restoredMode=player.getSnapshot().playback.mode;await player.setAuto(true);if(source&&late)late.call(source,new Event('ended'));await sleep(150);const lateIgnored=player.capture().text?.textId;
   player.setMenu(true);const paused=player.getSnapshot().playback.elapsedMs;await sleep(250);const menu={at:player.capture().text?.textId,elapsed:player.getSnapshot().playback.elapsedMs,paused};player.setMenu(false);
   const until=performance.now()+5000;while(player.capture().wait?.kind!=='choice'&&performance.now()<until)await sleep(30);return {startup,restoredMode,lateIgnored,menu,final:player.capture().wait?.kind,mode:player.getSnapshot().playback.mode,read:player.getSnapshot().core?.profile.read};
  }finally{player?.dispose();AudioContext.prototype.createBufferSource=create;mount.remove();}
 });
 expect(result.startup).toEqual({at:'voice.1',task:'completed',voice:'playing'});expect(result.restoredMode).toBe('manual');expect(result.lateIgnored).toBe('voice.1');expect(result.menu.at).toBe('voice.1');expect(result.menu.elapsed).toBe(result.menu.paused);expect(result.final).toBe('choice');expect(result.mode).toBe('manual');expect(result.read).toEqual(['voice.1@v1','voice.2@v1']);
});

test('configured input is scoped per instance, ignores repeats/editors and discards held inputs after load or focus loss',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();await page.locator('body').click({position:{x:1,y:1}});
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',sdk:typeof Harness=await import(url),p=sdk.parseProgram(await(await fetch('/program.json')).json()),aRoot=document.createElement('div'),bRoot=document.createElement('div'),editor=document.createElement('input');aRoot.append(editor);document.body.append(aRoot,bRoot);
  const a=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount:aRoot,store:new sdk.MemoryStore(),saveCompatibilitySeries:'keys-a'}),b=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount:bRoot,store:new sdk.MemoryStore(),saveCompatibilitySeries:'keys-b'});
  const key=(root:HTMLElement,type:string,code:string,repeat=false)=>root.dispatchEvent(new KeyboardEvent(type,{code,key:code,bubbles:true,cancelable:true,repeat})),settle=()=>new Promise<void>(r=>setTimeout(r,50)),id=()=>a.capture().text?.textId;
  try{
   await a.updatePreferences({text:{intervalMs:0},input:{advance:['KeyD']}});await b.updatePreferences({text:{intervalMs:0}});await a.start();await b.start();await settle();await a.save('first');
   aRoot.focus();key(aRoot,'keydown','KeyD');key(aRoot,'keydown','KeyD',true);key(aRoot,'keyup','KeyD');await settle();const one={a:id(),b:b.capture().text?.textId};
   key(editor,'keydown','KeyD');key(editor,'keyup','KeyD');await settle();const edited=id();key(aRoot,'keydown','KeyD');await a.load('first');key(aRoot,'keyup','KeyD');await settle();const stale=id();
   key(aRoot,'keydown','ControlLeft');await settle();bRoot.focus();await settle();const blurred=a.getSnapshot().playback.mode;
   await a.load('first');key(aRoot,'keydown','ControlLeft');await settle();const unread={id:id(),mode:a.getSnapshot().playback.mode,reason:a.getSnapshot().playback.reason};key(aRoot,'keyup','ControlLeft');
   return {one,edited,stale,blurred,unread};
  }finally{a.dispose();b.dispose();aRoot.remove();bRoot.remove();}
 });
 expect(result.one).toEqual({a:'opening.2',b:'opening.1'});expect(result.edited).toBe('opening.2');expect(result.stale).toBe('opening.1');expect(result.blurred).toBe('manual');expect(result.unread).toEqual({id:'opening.2',mode:'manual',reason:'unread'});
});

test('default UI persists playback, mappings and display settings, imports/exports JSON and restores defaults',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();const data=async()=>JSON.parse((await page.getByTestId('diagnostics').textContent())??'{}');
 await page.getByRole('button',{name:'菜单',exact:true}).click();await page.getByLabel('文字显示间隔').selectOption('0');await page.getByLabel('字体缩放').selectOption('1.5');await page.getByLabel('文本框背景透明度').press('Home');await page.getByLabel('推进按键',{exact:true}).selectOption('KeyD');await page.getByLabel('自动阅读等待毫秒').fill('300');await expect.poll(async()=>(await data()).preferences.value.playback.autoDelayMs).toBe(300);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'导出系统设置',exact:true}).click();expect((await download).suggestedFilename()).toBe('galbox-settings.json');const exported=(await data()).preferences.value;
 await page.getByRole('button',{name:'关闭',exact:true}).click();await page.getByRole('button',{name:'开始阅读',exact:true}).click();await expect(page.getByTestId('story-text')).toContainText('写着我的名字');const style=await page.locator('.galbox-text').evaluate(e=>({background:getComputedStyle(e).backgroundImage,opacity:getComputedStyle(e.querySelector('p')!).opacity,font:getComputedStyle(e.querySelector('p')!).fontSize}));expect(style.background).toContain('rgba(13, 35, 49, 0)');expect(style.opacity).toBe('1');expect(Number.parseFloat(style.font)).toBeGreaterThan(30);
 await page.locator('.stage').focus();await page.keyboard.press('KeyD');await expect.poll(async()=>(await data()).wait?.at).toBe('main:opening-2');
 await page.getByRole('button',{name:'菜单',exact:true}).click();await page.getByRole('button',{name:'快速保存',exact:true}).click();await expect(page.getByRole('status')).toContainText('已保存到浏览器');await page.reload();await page.getByRole('button',{name:'读取快速存档',exact:true}).click();expect((await data()).preferences.value).toEqual(exported);expect((await data()).playback.mode).toBe('manual');
 await page.getByRole('button',{name:'菜单',exact:true}).click();await page.getByRole('button',{name:'恢复默认设置',exact:true}).click();await expect(page.getByTestId('preferences-notice')).toContainText('已恢复默认设置');expect((await data()).preferences.value.input.advance).toEqual(['Enter','Space']);
 await page.getByLabel('导入系统设置',{exact:true}).setInputFiles({name:'settings.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await expect(page.getByTestId('preferences-notice')).toContainText('已导入系统设置');expect((await data()).preferences.value).toEqual(exported);
 const before=(await data()).preferences;await page.getByLabel('导入系统设置',{exact:true}).setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...exported,input:{...exported.input,advance:['UnknownKey']}}))});await expect(page.getByTestId('preferences-notice')).toContainText('SCHEMA_PREFERENCES');expect((await data()).preferences).toEqual(before);
 expect((await page.getByTestId('preferences-notice').innerText()).length).toBeLessThan(100);expect(await page.locator('.preferences').evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
 await page.screenshot({path:`${process.env.GALBOX_EVIDENCE_DIR??'docs/evidence'}/playback-settings.png`});
});

test('real IndexedDB v1 preferences migrate without losing revision and reset uses authored defaults',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',sdk:typeof Harness=await import(url),p=sdk.parseProgram(await(await fetch('/program.json')).json()),namespace=sdk.storageNamespace(p.gameId,'legacy-settings'),db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('legacy-settings',1);r.onupgradeneeded=()=>r.result.createObjectStore('namespaces');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const legacy={version:1,audio:{master:.2,bgm:.3,voice:.4,sfx:.5},text:{intervalMs:80}};await new Promise<void>((resolve,reject)=>{const tx=db.transaction('namespaces','readwrite');tx.objectStore('namespaces').put({profile:sdk.emptyProfile(),head:null,slots:{},activations:{},receipts:{},preferences:{revision:7,value:legacy}},namespace);tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error);});db.close();
  const mount=document.createElement('div');document.body.append(mount);const player=await sdk.createPlayer({program:p,provider:sdk.createHttpProvider(p,location.href),mount,database:'legacy-settings',saveCompatibilitySeries:'legacy-settings',preferencesDefaults:sdk.mergePreferences(sdk.defaultPreferences(),{audio:{master:.8},playback:{autoDelayMs:700},display:{fontScale:1.25}})});
  try{const migrated=player.getSnapshot().preferences;await player.resetPreferences();const reset=player.getSnapshot().preferences;await player.importPreferences(legacy);const imported=player.exportPreferences();return {migrated,reset,imported};}finally{player.dispose();mount.remove();}
 });
 expect(result.migrated).toMatchObject({revision:7,value:{version:2,audio:{master:.2,bgm:.3,voice:.4,sfx:.5},text:{intervalMs:80},playback:{autoDelayMs:1500,skipUnread:false}}});expect(result.reset).toMatchObject({revision:8,value:{audio:{master:.8},playback:{autoDelayMs:700},display:{fontScale:1.25}}});expect(result.imported).toMatchObject({version:2,audio:{master:.2},text:{intervalMs:80}});
});
