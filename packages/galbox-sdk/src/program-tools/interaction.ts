import {instruction} from './linker.js';
import type {AssetRef,Variable} from './linker.js';
import {expr,expressionWire} from './expressions.js';
import type {TypedExpression} from './expressions.js';
import type {InteractionRect,DeepReadonly} from '../protocol/index.js';
import {ensure} from '../protocol/index.js';
export interface InteractiveOption {readonly id:string;readonly label:string;readonly target:string;readonly enabled?:TypedExpression<'bool'>;readonly rect?:DeepReadonly<InteractionRect>;}
export type InteractionTiming={readonly deadlineMs?:never;readonly timeout?:never}|{readonly deadlineMs:number|TypedExpression<'i32'>;readonly timeout:{readonly id:string;readonly target:string}};
export function interactionPrompt(at:string,dest:Variable<'string'>,label:string,options:readonly [InteractiveOption,...InteractiveOption[]],timing:InteractionTiming={}) {ensure(dest.kind==='string','SLOT_KIND','Interaction destination must be string');const resolved=options.map(o=>({...o,enabled:expressionWire(o.enabled??expr.flag(true))})),first=resolved[0];ensure(first,'INTERACTION_OPTIONS','At least one option required');return instruction('interaction.prompt',{at,dest:dest.id,label,options:[first,...resolved.slice(1)],deadlineMs:timing.deadlineMs===undefined?null:expressionWire(typeof timing.deadlineMs==='number'?expr.integer(timing.deadlineMs):timing.deadlineMs),timeout:timing.timeout??null});}
export function videoPlay(at:string,task:string,asset:AssetRef<'video'>,options:{rect?:DeepReadonly<InteractionRect>;gain?:number;skippable?:boolean;restore:'replay'|'forbid'}) {ensure(asset.kind==='video','ASSET_KIND','Expected video resource');return instruction('video.play',{at,task,asset:asset.id,rect:options.rect??{x:0,y:0,width:1280,height:720},gain:options.gain??1,skippable:options.skippable??false,restore:options.restore});}
