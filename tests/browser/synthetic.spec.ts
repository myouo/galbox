import {test,expect} from '@playwright/test';
import type * as Harness from './harness/sdk.js';
test('synthetic binary preparation uses real Web Crypto and rejects corrupt source bytes',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const url='http://127.0.0.1:4174/sdk.js';const sdk:typeof Harness=await import(url),program:unknown=await(await fetch('/program.json')).json();
  const files=await Promise.all(['slot.bin','global.json'].map(async name=>({name,bytes:new Uint8Array(await(await fetch('/synthetic-saves/'+name)).arrayBuffer())})));
  const context={async digest(bytes:Uint8Array){return new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)));},decodeUtf8(bytes:Uint8Array){return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}};
  const binding=sdk.createFixtureBinding(program),prepared=await binding.prepare(files,context,program);if(prepared.status!=='ready')throw new Error(prepared.message);const report=prepared.plan.report(),payload=sdk.materializeImport(prepared.plan,program);
  const slot=files[0];if(!slot)throw new Error('slot');slot.bytes[slot.bytes.length-1]=(slot.bytes[slot.bytes.length-1]??0)^1;const corrupt=await binding.prepare(files,context,program);
  return {source:report.sourceKey,grade:report.grade,files:report.files.length,visits:payload.snapshot.globals.visits,loadCount:payload.profile.values.syntheticLoadCount,corrupt};
 });expect(result).toMatchObject({source:'fixture-save@1/lighthouse',grade:'semantic',files:2,visits:{kind:'i32',value:1},loadCount:{kind:'i32',value:4},corrupt:{status:'unsupported',code:'FIXTURE_DIGEST'}});
});
