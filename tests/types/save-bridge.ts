import {codec,defineSaveSource,defineSaveCodec,defineSaveMapping,bindOriginalSave} from '../../packages/galbox-sdk/src/program-tools/index.js';
const state=codec.object('source.schema@1',{value:codec.integer('source.integer')});
const a=defineSaveSource('family-a',state),b=defineSaveSource('family-b',state);
const anotherSchema=codec.object('source.schema@2',{value:codec.integer('source.integer')});
const sameFamilyOtherSchema=defineSaveSource('family-a',anotherSchema);
const sourceA=defineSaveCodec(a,{version:1,async decode(){return {status:'ready',state:{value:1}};}});
const sourceB=defineSaveCodec(b,{version:1,async decode(){return {status:'ready',state:{value:1}};}});
const sourceA2=defineSaveCodec(sameFamilyOtherSchema,{version:1,async decode(){return {status:'ready',state:{value:1}};}});
const mappingB=defineSaveMapping(sourceB,{id:'mapping-b',version:1,target:{gameId:'game',release:'v1'},convert(){return {status:'unsupported',code:'no-map',message:'No mapping'};}});
const mappingA2=defineSaveMapping(sourceA2,{id:'mapping-a2',version:1,target:{gameId:'game',release:'v1'},convert(){return {status:'unsupported',code:'no-map',message:'No mapping'};}});
// @ts-expect-error source family is anchored to codec, no union widening through mapping
bindOriginalSave(sourceA,mappingB);
// @ts-expect-error same-shaped state with another schema is still a different source
bindOriginalSave(sourceA,mappingA2);
const larger=defineSaveSource('family-a',codec.object('source.schema@1',{value:codec.integer('source.integer'),extra:codec.boolean('source.bool')}));
const largerCodec=defineSaveCodec(larger,{version:1,async decode(){return {status:'ready',state:{value:1,extra:true}};}});
const largerMapping=defineSaveMapping(largerCodec,{id:'larger',version:1,target:{gameId:'game',release:'v1'},convert(){return {status:'unsupported',code:'no-map',message:'No mapping'};}});
// @ts-expect-error state is invariant even when the author mistakenly reuses a schema ID
bindOriginalSave(sourceA,largerMapping);
