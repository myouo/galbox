import {test,expect} from '@playwright/test';
import type * as Harness from './harness/sdk.js';
test('bound text catalogs run in the real Player and locale preferences survive old story loads and recreation',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).waitFor();
 const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js',sdk:typeof Harness=await import(url),program=sdk.parseProgram(await(await fetch('/program.json')).json()),split=sdk.splitProgramText(program,'en'),mount=document.createElement('div');document.body.append(mount);
  const series='catalog-browser',store=await sdk.openStore(sdk.storageNamespace(program.gameId,series),'catalog-browser');
  if(!store.writePreferences)throw new Error('preferences');const legacy=sdk.defaultPreferences();delete legacy.locale;await store.writePreferences(legacy,0);
  const options={program:split.template,textCatalog:split.catalog,provider:sdk.createHttpProvider(program,location.href),mount,saveCompatibilitySeries:series,store,graphics:{renderer:'canvas' as const}};
  let player=await sdk.createPlayer(options);let mismatch='';
  try{
   await player.reloadPreferences();const inherited=player.exportPreferences().locale;await player.updatePreferences({text:{intervalMs:0}});await player.start();const text=player.capture().text?.content;await player.save('locale-cut');await player.updatePreferences({locale:'ja'});await player.load('locale-cut');const afterLoad=player.exportPreferences().locale;player.dispose();player=await sdk.createPlayer(options);const afterRefresh=player.exportPreferences().locale;await player.load('locale-cut');const restored=player.capture().text?.content;
   try{await sdk.createPlayer({...options,locale:'fr'});}catch(e){mismatch=String(e);}
   return {inherited,afterLoad,afterRefresh,text,restored,mismatch,canvases:mount.querySelectorAll('canvas').length};
  }finally{player.dispose();store.close();mount.remove();}
 });
 expect(result.inherited).toBe('en');expect(result.afterLoad).toBe('ja');expect(result.afterRefresh).toBe('ja');expect(result.restored).toBe(result.text);expect(result.mismatch).toContain('TEXT_CATALOG_IDENTITY');expect(result.canvases).toBe(1);
});
