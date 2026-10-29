import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createReleaseManifest,verifyReleaseManifest,releaseFingerprint,inspectResource,resourceUsage,defaultResourceBudget,assertResourceFacts,canonicalReleaseJSON} from 'galbox-sdk/release';
import type {ResourceFact} from 'galbox-sdk/release';
import {parseProgram,parseReleaseManifest,codec} from 'galbox-sdk/protocol';
import {defineOperation,createOperationRegistry,createSaveBindingRegistry,defineSaveMapping,bindOriginalSave} from 'galbox-sdk/port-kit';
import {createFixtureBinding,fixtureCodec} from '../fixtures/game-data/synthetic-saves/binding.js';
const program=parseProgram(JSON.parse(readFileSync('tests/fixtures/game-data/standard-novel/program.json','utf8'))),series='release-tests',digest={async sha256(text:string){return createHash('sha256').update(text,'utf8').digest('hex');}};
const resources=program.assets.map(a=>inspectResource(a,new Uint8Array(readFileSync('tests/player-app/public/'+a.path)),b=>new TextDecoder('utf-8',{fatal:true}).decode(b)));
const options={program,series,resources};
it('binds real Program/media/registries and a stable series into a detached release and fingerprint',async()=>{
 const manifest=await createReleaseManifest({...options,bindings:createSaveBindingRegistry([createFixtureBinding(program)])},digest);expect(manifest.programSha256).toBe(await digest.sha256(canonicalReleaseJSON(program)));expect(manifest.resources).toHaveLength(9);
 expect(await verifyReleaseManifest(manifest,{program,series,bindings:createSaveBindingRegistry([createFixtureBinding(program)])},digest)).toEqual(manifest);expect(await releaseFingerprint(manifest,digest)).toMatch(/^[a-f0-9]{64}$/);await expect(verifyReleaseManifest(manifest,{program,series:'other'},digest)).rejects.toThrow('RELEASE_MISMATCH');
 const changed=parseProgram(program);changed.title='灯塔来信 · 改版';await expect(verifyReleaseManifest(manifest,{program:changed,series},digest)).rejects.toThrow('RELEASE_MISMATCH');
 expect(()=>parseReleaseManifest({...manifest,sdk:'0.2.0'})).toThrow('RELEASE_SCHEMA');expect(()=>canonicalReleaseJSON({n:NaN})).toThrow('INPUT_JSON');
});
function registry(implementation:string){const unit=codec.object('release.unit',{}),resume=codec.object('release.resume',{kind:codec.literal('release.kind','go')});const op=defineOperation({id:'release.fixture',version:1,args:unit,state:unit,resume,manifest:{implementation,save:'safe',restore:'continue',resumeKinds:['go'],jumpTargets:[],recipe:false},initialize(){return {};},reduce(){return {state:{},actions:[],effects:[],flow:{kind:'continue'}};}});return createOperationRegistry([op]);}
it('rejects changed operation implementations, binding mapping versions and source identities',async()=>{
 const operations=registry('release.fixture@1'),manifest=await createReleaseManifest({...options,operations},digest);await expect(verifyReleaseManifest(manifest,{program,series,operations:registry('release.fixture@2')},digest)).rejects.toThrow('RELEASE_MISMATCH');
 const first=createFixtureBinding(program),bindingManifest=await createReleaseManifest({...options,bindings:createSaveBindingRegistry([first])},digest);
 const mapping=defineSaveMapping(fixtureCodec,{id:first.mapping,version:2,target:{gameId:program.gameId,release:program.release},convert(){return {status:'unsupported',code:'fixture-only',message:'A release identity test'};}}),changed=createSaveBindingRegistry([bindOriginalSave(fixtureCodec,mapping)]);await expect(verifyReleaseManifest(bindingManifest,{program,series,bindings:changed},digest)).rejects.toThrow('RELEASE_MISMATCH');
});
it('captures all inputs before digest awaits and reports mismatched actual source facts',async()=>{
 const p=parseProgram(program),facts=resources.map(f=>({...f})),limits={...defaultResourceBudget};let release:(()=>void)|undefined;const gate=new Promise<void>(r=>{release=r;}),pending=createReleaseManifest({program:p,series,resources:facts,limits},{async sha256(text){await gate;return digest.sha256(text);}});p.title='Mutation';facts[0]!.bytes=1;limits.maxEncodedBytes=1;release?.();const manifest=await pending;expect(manifest.limits.maxEncodedBytes).toBe(defaultResourceBudget.maxEncodedBytes);expect(manifest.resources[0]?.bytes).toBe(resources[0]?.bytes);await verifyReleaseManifest(manifest,{program,series},digest);
 expect(()=>assertResourceFacts(manifest.resources,facts)).toThrow('RELEASE_RESOURCE_FACTS');
});
it('enforces compressed, image, PCM and duration budgets before admission, including resampled PCM',()=>{
 const usage=resourceUsage(resources),budget={...defaultResourceBudget};expect(usage.assets).toBe(9);expect(usage.textureBytesEstimated).toBeGreaterThan(1280*720*4);expect(usage.audioBytesEstimated).toBeGreaterThan(0);
 for(const limits of [{...budget,maxAssetBytes:1},{...budget,maxEncodedBytes:usage.encodedBytes-1},{...budget,maxTextureBytes:usage.textureBytesEstimated-1},{...budget,maxAudioBytes:4},{...budget,maxImageSide:100},{...budget,maxAudioMs:1}])expect(()=>resourceUsage(resources,limits)).toThrow(/RESOURCE_/);
 const sound:ResourceFact={id:'resample',kind:'audio',bytes:16044,channels:1,sampleRate:8000,frames:8000};expect(resourceUsage([sound],budget,48000).audioBytesEstimated).toBe(192000);expect(()=>resourceUsage([sound],{...budget,maxAudioBytes:100000},48000)).toThrow('RESOURCE_AUDIO_BUDGET');expect(()=>resourceUsage([resources[0]!,resources[0]!])).toThrow('RESOURCE_DUPLICATE');
});
it('rejects unsafe SVG, invalid dimensions, unsupported WAV encodings and truncated chunks',()=>{
 const svg={id:'vector',kind:'image',mime:'image/svg+xml'} as const,utf8=(b:Uint8Array)=>new TextDecoder('utf-8',{fatal:true}).decode(b),encode=(s:string)=>new TextEncoder().encode(s);
 expect(()=>inspectResource(svg,encode('<svg viewBox="0 0 10 10"></svg>'),utf8)).toThrow('RESOURCE_SVG_SIZE');expect(()=>inspectResource(svg,encode('<svg width="10" height="10"><image href="https://example.com/a.png"/></svg>'),utf8)).toThrow('RESOURCE_SVG');
 const a=program.assets.find(a=>a.kind==='audio')!;const wav=new Uint8Array(readFileSync('tests/player-app/public/'+a.path)),bad=wav.slice();new DataView(bad.buffer).setUint16(20,85,true);expect(()=>inspectResource(a,bad,utf8)).toThrow('RESOURCE_WAV_FORMAT');expect(()=>inspectResource(a,wav.slice(0,-2),utf8)).toThrow('RESOURCE_WAV');
 const png=new Uint8Array(33);png.set([137,80,78,71,13,10,26,10]);const v=new DataView(png.buffer);v.setUint32(8,13);v.setUint32(12,0x49484452);v.setUint32(16,8192);v.setUint32(20,8192);const fact=inspectResource({id:'oversized',kind:'image',mime:'image/png'},png,utf8);expect(()=>resourceUsage([fact])).toThrow('RESOURCE_IMAGE_SIDE');
});
it('refuses required timed-choice/video capabilities instead of treating a release as proof of support',async()=>{
 for(const capability of ['choice.timed','video','hotspot']){const p=parseProgram(program);p.capabilities.push(capability);await expect(createReleaseManifest({...options,program:p},digest)).rejects.toThrow('UNSUPPORTED_CAPABILITY');}
});
it('resident releases validate each catalog item but leave aggregate resident limits enforced by resourceUsage',async()=>{const p=parseProgram(program),facts=resources.map(f=>({...f})),encoded=facts.reduce((n,f)=>n+f.bytes,0),largest=Math.max(...facts.map(f=>f.bytes)),limits={...defaultResourceBudget,maxEncodedBytes:largest};expect(encoded).toBeGreaterThan(largest);await expect(createReleaseManifest({program:p,series:'resident',resources:facts,limits},digest)).rejects.toThrow('RESOURCE_ENCODED_BUDGET');const m=await createReleaseManifest({program:p,series:'resident',resources:facts,limits,resourceScope:'resident'},digest);expect(m.resourceScope).toBe('resident');expect(await verifyReleaseManifest(m,{program:p,series:'resident'},digest)).toEqual(m);expect(()=>resourceUsage(facts,m.limits)).toThrow('RESOURCE_ENCODED_BUDGET');const bad={...limits,maxEncodedBytes:largest-1};await expect(createReleaseManifest({program:p,series:'resident',resources:facts,limits:bad,resourceScope:'resident'},digest)).rejects.toThrow('RESOURCE_ENCODED_BUDGET');});
