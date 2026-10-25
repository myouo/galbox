import {codec,defineSaveSource,defineSaveCodec,defineSaveMapping,bindOriginalSave,createSaveBindingRegistry,createPortRegistration} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {bool} from 'galbox-sdk/protocol';
const schema=codec.object('cli.original@1',{locator:codec.literal('cli.locator','main:opening'),flag:codec.boolean('cli.flag')});
const source=defineSaveSource('cli-synthetic@1',schema);
const decoder=defineSaveCodec(source,{version:1,async decode(files,context){const file=files.find(f=>f.name==='original.json');if(!file)return {status:'needs-input',code:'FILE_REQUIRED',message:'Provide original.json'};return {status:'ready',state:schema.parse(JSON.parse(context.decodeUtf8(file.bytes)))};}});
const mapping=defineSaveMapping(decoder,{id:'cli.mapping@1',version:1,label:'CLI synthetic example',target:{gameId:'my-lighthouse-novel',release:'story-1'},convert(state,program){const profile={revision:0,values:{imported:bool(state.flag)},read:[]};const core=createCore(program,profile);core.run(100);const snapshot=core.capture();if(snapshot.wait?.at!==state.locator)return {status:'unsupported',code:'LOCATOR',message:'Target is not the declared source point'};return {grade:'semantic',warnings:['Synthetic test only; not commercial compatibility'],payload:{snapshot,profile}};}});
export default createPortRegistration({bindings:createSaveBindingRegistry([bindOriginalSave(decoder,mapping)])});
