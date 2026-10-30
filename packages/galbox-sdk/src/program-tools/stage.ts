import {parseInstruction,ensure} from '../protocol/index.js';
import type {Instruction,StagePose,StageFilters,StageCamera,StageStyle,StageTarget,StageTaskState} from '../protocol/index.js';
import {expr,expressionWire} from './expressions.js';
import type {TypedExpression} from './expressions.js';
import type {AssetRef} from './linker.js';
export type StageNumber=number|TypedExpression<'i32'>|TypedExpression<'f64'>;
export type StagePoseInput=Partial<Record<keyof StagePose,StageNumber>>;
export type StageFilterInput=Partial<Record<keyof StageFilters,StageNumber>>;
export type StageCameraInput=Partial<Record<keyof StageCamera,StageNumber>>;
export type StageStyleInput=Omit<StageStyle,'z'>&{z?:StageNumber};
export interface StageTiming {duration:number|TypedExpression<'i32'>;policy?:'replace'|'reject';easing?:StageTaskState['easing'];}
function record(value:unknown):asserts value is Record<string,unknown>{ensure(typeof value==='object'&&value!==null&&!Array.isArray(value),'STAGE_ARGUMENT','Expected an object');}
function number(value:unknown){if(typeof value==='number'){ensure(Number.isFinite(value),'STAGE_NUMBER','Expected finite number');return expressionWire(expr.real(value));}function typed(v:unknown):v is TypedExpression<'i32'|'f64'>{return typeof v==='object'&&v!==null&&'kind'in v&&(v.kind==='i32'||v.kind==='f64');}ensure(typed(value),'STAGE_NUMBER','Use a numeric expression factory');return expressionWire(value);}
function fields(value:unknown){record(value);return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,number(v)]));}
function style(value:unknown){record(value);return {...value,...('z'in value?{z:number(value.z)}:{})};}
function timing(value:StageTiming){if(typeof value.duration==='number')ensure(Number.isInteger(value.duration)&&value.duration>0&&value.duration<=3600000,'STAGE_DURATION','Duration must be 1..3600000 ms');return {...value,policy:value.policy??'reject',easing:value.easing??'linear',duration:typeof value.duration==='number'?expressionWire(expr.integer(value.duration)):expressionWire(value.duration)};}
function make<K extends Instruction['op']>(op:K,args:Record<string,unknown>):Extract<Instruction,{op:K}>{const value=parseInstruction({...args,op});function match(v:Instruction):v is Extract<Instruction,{op:K}>{return v.op===op;}ensure(match(value),'STAGE_FACTORY','Opcode mismatch');return value;}
export function stageImage(at:string,id:string,asset:AssetRef<'image'>,pose:StagePoseInput={x:0},options?:StageStyleInput){ensure(asset.kind==='image','ASSET_KIND','Expected image');return make('stage.image',{at,id,asset:asset.id,pose:fields(pose),...(options?{style:style(options)}:{})});}
export function stageTween(at:string,task:string,id:string,to:StagePoseInput,options:StageTiming&{relative?:boolean}){return make('stage.pose',{at,task,id,to:fields(to),...timing(options),relative:options.relative??false});}
export function stageFilter(at:string,task:string,target:StageTarget,to:StageFilterInput,options:StageTiming){return make('stage.filter',{at,task,target,to:fields(to),...timing(options)});}
export function stageCamera(at:string,task:string,to:StageCameraInput,options:StageTiming){return make('stage.camera',{at,task,to:fields(to),...timing(options)});}
export function stageFade(at:string,task:string,color:string,alpha:StageNumber,options:StageTiming){return make('stage.fade',{at,task,color,alpha:number(alpha),...timing(options)});}
export function stageTransition(at:string,task:string,id:string,asset:AssetRef<'image'>,options:StageTiming){ensure(asset.kind==='image','ASSET_KIND','Expected image');return make('stage.transition',{at,task,id,asset:asset.id,...timing(options)});}
export function stageRuleTransition(at:string,task:string,id:string,asset:AssetRef<'image'>,rule:AssetRef<'image'>,options:Omit<StageTiming,'policy'>&{vague?:number}){ensure(!('policy'in options),'STAGE_RULE_POLICY','Rule transitions do not accept policy overrides');ensure(asset.kind==='image'&&rule.kind==='image','ASSET_KIND','Expected image and grayscale rule');return make('stage.rule',{at,task,id,asset:asset.id,rule:rule.id,...timing({...options,policy:'reject'}),vague:options.vague??64});}
export function stageShake(at:string,task:string,target:StageTarget,amplitudeX:StageNumber,amplitudeY:StageNumber,periodMs:number|TypedExpression<'i32'>,options:StageTiming&{samples?:readonly {x:number;y:number}[]}){return make('stage.shake',{at,task,target,amplitudeX:number(amplitudeX),amplitudeY:number(amplitudeY),periodMs:typeof periodMs==='number'?expressionWire(expr.integer(periodMs)):expressionWire(periodMs),...timing(options)});}
export function stageStyle(at:string,id:string,input:StageStyleInput){return make('stage.style',{at,id,style:style(input)});}
/** Parallel, additive x/y offsets; each track settles at zero. */
export function stageMotion(at:string,task:string,targets:readonly string[],tracks:readonly import('../protocol/index.js').MotionTrack[],options:{key:string;loop?:boolean;intervalMs?:number;policy?:'replace'|'reject'}){return make('stage.motion',{at,task,targets:[...targets],tracks:[...tracks],key:options.key,loop:options.loop??false,intervalMs:options.intervalMs??1,policy:options.policy??'reject'});}
export function stageClone(at:string,mapping:readonly {from:string;to:string}[]){return make('stage.clone',{at,mapping:[...mapping]});}

export function stopStageMotion(at:string,targets:readonly string[],key?:string){return make('stage.motion.stop',{at,targets:[...targets],...(key!==undefined?{key}:{})});}

export function stageAsset(at:string,id:string,asset:AssetRef<'image'>){ensure(asset.kind==='image','ASSET_KIND','Expected image');return make('stage.asset',{at,id,asset:asset.id});}
export function stageSequence(at:string,task:string,targets:readonly string[],asset:AssetRef<'image'>,frames:readonly [import('../protocol/index.js').SequenceFrame,...import('../protocol/index.js').SequenceFrame[]],options:{loop?:boolean;delayMs?:number;policy?:'replace'|'reject'}={}){ensure(asset.kind==='image','ASSET_KIND','Expected image');ensure(frames.every(f=>f.asset===undefined),'SEQUENCE_FACTORY','Use stageAssetSequence for resource steps');return make('stage.sequence',{at,task,targets:[...targets],asset:asset.id,frames:[...frames],loop:options.loop??false,delayMs:options.delayMs??0,policy:options.policy??'reject'});}
export function stopStageSequence(at:string,task:string){return make('stage.sequence.stop',{at,task});}
export type StageMixOptions=Omit<StageTiming,'policy'>&({method:Exclude<import('../protocol/index.js').StageMixState['method'],'rule'>}|{method:'rule';rule:AssetRef<'image'>;vague?:number});
export function stageMix(at:string,task:string,sourceRoots:readonly string[],targetRoots:readonly string[],options:StageMixOptions){const extra=options.method==='rule'?{rule:options.rule.id,vague:options.vague??64}:{vague:64};if(options.method==='rule')ensure(options.rule.kind==='image','ASSET_KIND','Expected a rule image');return make('stage.mix',{at,task,sourceRoots:[...sourceRoots],targetRoots:[...targetRoots],method:options.method,...extra,...timing({duration:options.duration,easing:options.easing??'linear',policy:'reject'})});}

export type AssetSequenceFrame=Omit<import('../protocol/index.js').SequenceFrame,'asset'>&{asset:AssetRef<'image'>};
export function stageAssetSequence(at:string,task:string,targets:readonly string[],initial:AssetRef<'image'>,frames:readonly [AssetSequenceFrame,...AssetSequenceFrame[]],options:{loop?:boolean;delayMs?:number;policy?:'replace'|'reject'}={}){ensure(initial.kind==='image'&&frames.every(f=>f.asset.kind==='image'),'ASSET_KIND','Sequence frames require image references');return make('stage.sequence',{at,task,targets:[...targets],asset:initial.id,frames:frames.map(f=>({...f,asset:f.asset.id})),loop:options.loop??false,delayMs:options.delayMs??0,policy:options.policy??'reject'});}
