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
export function stageShake(at:string,task:string,target:StageTarget,amplitudeX:StageNumber,amplitudeY:StageNumber,periodMs:number|TypedExpression<'i32'>,options:StageTiming){return make('stage.shake',{at,task,target,amplitudeX:number(amplitudeX),amplitudeY:number(amplitudeY),periodMs:typeof periodMs==='number'?expressionWire(expr.integer(periodMs)):expressionWire(periodMs),...timing(options)});}
export function stageStyle(at:string,id:string,input:StageStyleInput){return make('stage.style',{at,id,style:style(input)});}
