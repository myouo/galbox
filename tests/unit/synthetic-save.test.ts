import {it,expect,describe} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Core} from 'galbox-sdk/core';
import {materializeImport,createSaveBindingRegistry} from 'galbox-sdk/save-bridge';
import type {FormatContext,OriginalSaveFile} from 'galbox-sdk/save-bridge';
import {createFixtureBinding,fixtureCodec,fixtureSource,originalSchema} from '../../fixtures/synthetic-saves/binding.js';
import {defineSaveCodec,defineSaveMapping,defineSaveSource,bindOriginalSave,codec} from 'galbox-sdk/port-kit';
import {parseProgram} from 'galbox-sdk/protocol';
const program:unknown=JSON.parse(readFileSync('fixtures/standard-novel/program.json','utf8'));
const context:FormatContext={async digest(bytes){return new Uint8Array(createHash('sha256').update(bytes).digest());},decodeUtf8(bytes){return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}};
function files():OriginalSaveFile[]{return ['slot.bin','global.json'].map(name=>({name,bytes:new Uint8Array(readFileSync(`fixtures/synthetic-saves/data/${name}`))}));}
function payload(changes:Record<string,unknown>):Uint8Array{
 const bytes=files()[0]!.bytes,body=JSON.parse(context.decodeUtf8(bytes.slice(9,-32)));const data=new TextEncoder().encode(JSON.stringify({...body,...changes})),result=new Uint8Array(9+data.length+32);result.set([71,66,70,88,1]);new DataView(result.buffer).setUint32(5,data.length,true);result.set(data,9);result.set(createHash('sha256').update(data).digest(),9+data.length);return result;
}
describe('synthetic fixture-save@1 (not N/F compatibility)',()=>{
 it('decodes real bytes/attachments, creates an owned plan and resumes the production Core at the declared choice',async()=>{
  const binding=createFixtureBinding(program),input=files(),result=await binding.prepare(input,context,program);expect(result.status).toBe('ready');if(result.status!=='ready')throw new Error(result.message);
  expect(result.plan.report().sourceKey).toBe('fixture-save@1/lighthouse');expect(result.plan.report().files).toHaveLength(2);expect(result.plan.report().grade).toBe('semantic');
  input[0]!.bytes.fill(0);const first=materializeImport(result.plan,program);expect(first.snapshot.globals.visits).toEqual({kind:'i32',value:1});expect(first.profile.values.syntheticLoadCount?.value).toBe(4);first.profile.values.syntheticLoadCount={kind:'i32',value:99};expect(materializeImport(result.plan,program).profile.values.syntheticLoadCount?.value).toBe(4);
  const core=new Core(program,materializeImport(result.plan,program).profile,materializeImport(result.plan,program).snapshot);expect(core.view().run.wait?.kind).toBe('choice');const w=core.view().run.wait;if(w?.kind!=='choice')throw new Error('choice');core.accept({type:'choose',prompt:w.prompt,inputId:'route',option:'shore'});core.run(100);expect(core.view().run.globals.route?.value).toBe('shore');expect(core.view().profile.values.shoreUnlocked?.value).toBe(true);
  const changed=parseProgram(program);changed.title='Changed target';expect(()=>materializeImport(result.plan,changed)).toThrow('IMPORT_PLAN_STALE');
 });
 it('returns needs-input for missing globals and rejects corrupt digest/length/version/edition/locator/oversize',async()=>{
  const binding=createFixtureBinding(program);expect((await binding.prepare(files().slice(0,1),context,program)).status).toBe('needs-input');
  const damaged=files();const damagedBytes=damaged[0]!.bytes;damagedBytes[damagedBytes.length-1]=(damagedBytes[damagedBytes.length-1]??0)^1;expect(await binding.prepare(damaged,context,program)).toMatchObject({status:'unsupported',code:'FIXTURE_DIGEST'});
  const length=files();length[0]={name:'slot.bin',bytes:new Uint8Array(length[0]!.bytes.slice(0,-1))};expect(await binding.prepare(length,context,program)).toMatchObject({status:'unsupported',code:'FIXTURE_LENGTH'});
  const version=files();version[0]!.bytes[4]=2;expect(await binding.prepare(version,context,program)).toMatchObject({status:'unsupported',code:'FIXTURE_VERSION'});
  for(const update of [{edition:'other-edition'},{locator:'unknown'},{visits:2}]){const input=files();input[0]={name:'slot.bin',bytes:payload(update)};expect((await binding.prepare(input,context,program)).status).toBe('unsupported');}
  expect(await binding.prepare([{name:'slot.bin',bytes:new Uint8Array(4_000_001)}],context,program)).toMatchObject({status:'unsupported',code:'SAVE_PACKAGE_SIZE'});
 });
 it('rejects cross-source/schema registration and duplicate registry entries',()=>{
  const otherSource=defineSaveSource('other-source',originalSchema),other=defineSaveCodec(otherSource,{version:1,async decode(){throw new Error('not called');}});
  const mapping=defineSaveMapping(other,{id:'other-mapping',version:1,target:{gameId:'lighthouse-letters',release:'lighthouse-1'},convert(){return {status:'unsupported',code:'no-map',message:'No mapping'};}});
  // @ts-expect-error intentional JS-side negative for the checked binding factory
  expect(()=>bindOriginalSave(fixtureCodec,mapping)).toThrow('SAVE_BINDING_IDENTITY');
  const binding=createFixtureBinding(program);expect(()=>createSaveBindingRegistry([binding,binding])).toThrow('SAVE_BINDING_DUPLICATE');expect(()=>createSaveBindingRegistry([binding]).get('unknown','unknown',1)).toThrow('SAVE_BINDING_UNSUPPORTED');
 });
 it('defensively owns asynchronous input and never mutates the active Core/profile during preparation',async()=>{
  const binding=createFixtureBinding(program),core=new Core(program);core.run(100);const before=core.capture(),profile=core.view().profile;
  let release:(()=>void)|undefined;const gate=new Promise<void>(resolve=>{release=resolve;});const input=files();const waiting=binding.prepare(input,{...context,async digest(bytes){await gate;return context.digest(bytes);}},program);input[0]!.bytes.fill(0);release?.();expect((await waiting).status).toBe('ready');expect(core.capture()).toEqual(before);expect(core.view().profile).toEqual(profile);
 });
});
