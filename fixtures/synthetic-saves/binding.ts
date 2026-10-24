import {codec,defineSaveSource,defineSaveCodec,defineSaveMapping,bindOriginalSave,linkProgram} from 'galbox-sdk/port-kit';
import {bool,i32,parseValue,readUnit} from 'galbox-sdk/protocol';
import type {Snapshot,Value} from 'galbox-sdk/protocol';
const text=codec.string('fixture.string');
export const slotSchema=codec.object('fixture.slot@1',{
 format:codec.literal('fixture.format','fixture-save@1'),edition:codec.literal('fixture.edition','lighthouse-synthetic-1'),locator:text,
 visits:codec.literal('fixture.visits',1),route:codec.literal('fixture.route','none'),
});
export const globalSchema=codec.object('fixture.global@1',{
 format:codec.literal('fixture.format','fixture-save@1'),edition:codec.literal('fixture.edition','lighthouse-synthetic-1'),shoreUnlocked:codec.boolean('fixture.bool'),towerUnlocked:codec.boolean('fixture.bool'),readUnits:codec.array('fixture.read',text),syntheticLoadCount:codec.integer('fixture.count',0),
});
export const originalSchema=codec.object('fixture.original@1',{slot:slotSchema,global:globalSchema});
export const fixtureSource=defineSaveSource('fixture-save@1/lighthouse',originalSchema);
export const fixtureCodec=defineSaveCodec(fixtureSource,{version:1,async decode(files,context){
 const slot=files.find(f=>f.name==='slot.bin'),global=files.find(f=>f.name==='global.json');
 if(!slot||!global)return {status:'needs-input',code:'FIXTURE_MISSING_FILE',message:'slot.bin and global.json are both required'};
 if(files.length!==2)return {status:'unsupported',code:'FIXTURE_FILES',message:'Unknown attachment'};
 const bytes=slot.bytes;
 if(bytes.length<41||bytes[0]!==71||bytes[1]!==66||bytes[2]!==70||bytes[3]!==88)return {status:'unsupported',code:'FIXTURE_HEADER',message:'Expected GBFX header'};
 if(bytes[4]!==1)return {status:'unsupported',code:'FIXTURE_VERSION',message:'Only fixture version 1 is supported'};
 const length=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(5,true);
 if(length>65536||bytes.length!==9+length+32||global.bytes.length>65536)return {status:'unsupported',code:'FIXTURE_LENGTH',message:'Invalid length or input bound'};
 const body=bytes.slice(9,9+length),checksum=bytes.slice(9+length),actual=await context.digest(body);
 if(!actual.every((byte,j)=>byte===checksum[j]))return {status:'unsupported',code:'FIXTURE_DIGEST',message:'Payload SHA-256 mismatch'};
 const rawSlot:unknown=JSON.parse(context.decodeUtf8(body)),rawGlobal:unknown=JSON.parse(context.decodeUtf8(global.bytes));
 const state=originalSchema.parse({slot:rawSlot,global:rawGlobal});
 if(state.slot.locator!=='legacy:route-choice')return {status:'unsupported',code:'FIXTURE_LOCATOR',message:'Only legacy:route-choice has a verified mapping'};
 return {status:'ready',state};
}});
export function createFixtureBinding(input:unknown){
 const program=linkProgram(input).copy();
 const mapping=defineSaveMapping(fixtureCodec,{id:'lighthouse.fixture@1',version:1,target:{gameId:'lighthouse-letters',release:'lighthouse-1'},convert(original,target){
  const main=target.functions.find(f=>f.id==='main'),choice=main?.code.find(i=>i.at==='main:route-choice');
  if(!main||choice?.op!=='choice')return {status:'unsupported',code:'FIXTURE_TARGET',message:'The declared recovery anchor is unavailable'};
  const known=new Set(target.functions.flatMap(f=>f.code.flatMap(i=>i.op==='text.page'?[readUnit(i)]:[])));
  if(original.global.readUnits.some(unit=>!known.has(unit))||new Set(original.global.readUnits).size!==original.global.readUnits.length)return {status:'unsupported',code:'FIXTURE_READ_UNIT',message:'Unknown/repeated text revision requires an explicit migration'};
  const globals:Record<string,Value>=Object.fromEntries(target.globals.map(v=>[v.id,parseValue(v.initial)]));globals.visits=i32(original.slot.visits);globals.route={kind:'string',value:original.slot.route};
  const snapshot:Snapshot={version:1,release:target.release,frames:[{functionId:'main',layout:1,pc:choice.at,locals:Object.fromEntries([...main.params,...main.locals].map(v=>[v.id,parseValue(v.initial)]))}],globals,
   stage:[{id:'background',asset:'shore',position:{x:0,y:0,alpha:1},z:0},{id:'light',asset:'lamp',position:{x:910,y:75,alpha:1},z:1},{id:'letter',asset:'envelope',position:{x:500,y:300,alpha:1},z:2}],text:null,history:[],tasks:[],groups:[],wait:{kind:'choice',at:choice.at,prompt:1,options:choice.options.map(o=>({...o})),dest:choice.dest},saveAllowed:true,status:'waiting',counter:1,profileBasis:0,logicalTime:0,invocations:[]};
  return {grade:'semantic',warnings:['synthetic fixture only; no commercial save compatibility','Original fixture contains no backlog or exact media position; recover the declared choice state'],payload:{snapshot,profile:{revision:0,values:{shoreUnlocked:bool(original.global.shoreUnlocked),towerUnlocked:bool(original.global.towerUnlocked),syntheticLoadCount:i32(original.global.syntheticLoadCount)},read:[...original.global.readUnits]}}};
 }});
 // Link here as well so callers cannot accidentally prepare a different fixture target.
 if(program.gameId!=='lighthouse-letters'||program.release!=='lighthouse-1')throw new Error('FIXTURE_TARGET');
 return bindOriginalSave(fixtureCodec,mapping);
}
