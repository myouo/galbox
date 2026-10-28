import {parseInstruction,parseUISoundRequest,ensure} from '../protocol/index.js';
import type {Instruction,Task} from '../protocol/index.js';
import type {AssetRef,SfxBufferRef} from './linker.js';
import type {StageNumber} from './stage.js';
import {expr,expressionWire} from './expressions.js';
import type {TypedExpression} from './expressions.js';
function numeric(value:StageNumber){return expressionWire(typeof value==='number'?expr.real(value):value);}
function integer(value:number|TypedExpression<'i32'>){return expressionWire(typeof value==='number'?expr.integer(value):value);}
function make<K extends Instruction['op']>(op:K,args:Record<string,unknown>):Extract<Instruction,{op:K}>{const value=parseInstruction({...args,op});function match(v:Instruction):v is Extract<Instruction,{op:K}>{return v.op===op;}ensure(match(value),'AUDIO_FACTORY','Opcode mismatch');return value;}
type Channel=NonNullable<Task['channel']>;
export interface AudioTrackOptions {channel:Channel;gain?:StageNumber;loop?:boolean;loopStartMs?:number|TypedExpression<'i32'>;loopEndMs?:number|TypedExpression<'i32'>;restore:'replay'|'stop';}
export function audioTrack(at:string,task:string,asset:AssetRef<'audio'>,options:AudioTrackOptions){ensure(asset.kind==='audio','ASSET_KIND','Expected audio');return make('audio.track',{at,task,asset:asset.id,...options,gain:numeric(options.gain??1),loop:options.loop??false,loopStartMs:integer(options.loopStartMs??0),loopEndMs:options.loopEndMs===undefined?null:integer(options.loopEndMs)});}
export function audioFade(at:string,task:string,channel:Channel,to:StageNumber,duration:number|TypedExpression<'i32'>,options:{easing?:'linear'|'ease-in'|'ease-out'|'ease-in-out';policy?:'reject'|'replace'}={}){return make('audio.fade',{at,task,channel,to:numeric(to),duration:integer(duration),...options,easing:options.easing??'linear',policy:options.policy??'reject'});}
export function audioDuck(at:string,enabled:boolean,level:StageNumber=.35,attackMs:number|TypedExpression<'i32'>=120,releaseMs:number|TypedExpression<'i32'>=240){return make('audio.duck',{at,enabled,level:numeric(level),attackMs:integer(attackMs),releaseMs:integer(releaseMs)});}

export function uiSound(asset:AssetRef<'audio'>,gain=1){ensure(asset.kind==='audio','ASSET_KIND','Expected audio');return parseUISoundRequest({asset:asset.id,gain});}

export function sfxTrack(at:string,task:string,asset:AssetRef<'audio'>,buffer:SfxBufferRef,options:Omit<AudioTrackOptions,'channel'>){ensure(buffer.kind==='sfx-buffer','AUDIO_BUFFER','Expected an sfx buffer');return make('audio.track',{...audioTrack(at,task,asset,{...options,channel:'sfx'}),buffer:buffer.id});}
export function audioSourceFade(at:string,task:string,source:string,to:StageNumber,duration:number|TypedExpression<'i32'>,options:{easing?:'linear'|'ease-in'|'ease-out'|'ease-in-out';policy?:'reject'|'replace';stop?:boolean}={}){return make('audio.source.fade',{at,task,source,to:numeric(to),duration:integer(duration),easing:options.easing??'linear',policy:options.policy??'reject',stop:options.stop??false});}
export function audioFadeOutAndStop(at:string,task:string,source:string,duration:number|TypedExpression<'i32'>,options:{easing?:'linear'|'ease-in'|'ease-out'|'ease-in-out';policy?:'reject'|'replace'}={}){return audioSourceFade(at,task,source,0,duration,{...options,stop:true});}
export function audioSourceStop(at:string,source:string){return make('audio.source.stop',{at,source});}
