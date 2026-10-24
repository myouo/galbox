import {codec,defineSaveSource,defineSaveCodec,defineSaveMapping,bindOriginalSave,defineRestoreRecipe,instruction} from 'galbox-sdk/port-kit';
import {bool,i32} from 'galbox-sdk/protocol';
import type {Program,Snapshot} from 'galbox-sdk/protocol';
const schema=codec.object('consumer.original@1',{locator:codec.literal('consumer.locator','opening.1'),flag:codec.boolean('consumer.flag')});
const source=defineSaveSource('consumer-synthetic@1',schema);
const decoder=defineSaveCodec(source,{version:1,async decode(files,context){const file=files.find(f=>f.name==='original.json');if(!file)return {status:'needs-input',code:'CONSUMER_FILE',message:'Expected original.json'};const input:unknown=JSON.parse(context.decodeUtf8(file.bytes));return {status:'ready',state:schema.parse(input)};}});
export function consumerBinding(program:Program,snapshot:Snapshot){
 const mapping=defineSaveMapping(decoder,{id:'consumer.mapping@1',version:1,target:{gameId:program.gameId,release:program.release},convert(state){return {grade:'semantic',warnings:['synthetic consumer fixture only'],payload:{snapshot,recipe:defineRestoreRecipe('consumer.load',[instruction('profile.i32.add.checked',{at:'recipe:loads',key:'loads',delta:1})]),profile:{revision:0,values:{imported:bool(state.flag),loads:i32(4)},read:[]}}};}});
 return bindOriginalSave(decoder,mapping);
}
const otherSource=defineSaveSource('consumer-other@1',schema);
const otherCodec=defineSaveCodec(otherSource,{version:1,async decode(){return {status:'ready',state:schema.parse({locator:'opening.1',flag:true})};}});
const otherMapping=defineSaveMapping(otherCodec,{id:'other.mapping@1',version:1,target:{gameId:'game',release:'v1'},convert(){return {status:'unsupported',code:'UNSUPPORTED',message:'No mapping'};}});
if(false){
 // @ts-expect-error the installed binding factory preserves exact source identity
 bindOriginalSave(decoder,otherMapping);
}
