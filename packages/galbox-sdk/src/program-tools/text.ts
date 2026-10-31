import {parseRichTextSourceRun,ensure} from '../protocol/index.js';
import type {RichTextSourceRun,TextStyle,Instruction,StringExpression} from '../protocol/index.js';
import {expr,expressionWire} from './expressions.js';
import type {TypedExpression} from './expressions.js';
import {instruction} from './linker.js';
type Content=string|TypedExpression<'string'>;
function expression(value:Content):StringExpression {return expressionWire(typeof value==='string'?expr.text(value):value);}
function run<K extends RichTextSourceRun['kind']>(kind:K,input:unknown):Extract<RichTextSourceRun,{kind:K}> {const value=parseRichTextSourceRun(input);function matches(v:RichTextSourceRun):v is Extract<RichTextSourceRun,{kind:K}>{return v.kind===kind;}ensure(matches(value),'TEXT_RUN_KIND','Run factory mismatch');return value;}
export const richText=Object.freeze({
 styled:(content:Content,styleId:string)=>run('text',{kind:'text',content:expression(content),styleId}),
 rubyStyled:(content:Content,reading:Content,styleId:string)=>run('ruby',{kind:'ruby',content:expression(content),reading:expression(reading),styleId}),
 text:(content:Content,style?:TextStyle)=>run('text',{kind:'text',content:expression(content),...(style?{style}:{})}),
 ruby:(content:Content,reading:Content,style?:TextStyle)=>run('ruby',{kind:'ruby',content:expression(content),reading:expression(reading),...(style?{style}:{})}),
 br:()=>run('break',{kind:'break'}),
 confirm:(options:{skippable?:boolean}={})=>run('confirm',{kind:'confirm',...options}),
 pause:(duration:number)=>run('pause',{kind:'pause',duration}),
 pauseUnits:(units:number)=>run('pause.units',{kind:'pause.units',units}),
 speed:(intervalMs:number)=>run('speed',{kind:'speed',intervalMs}),
 userSpeed:()=>run('speed',{kind:'speed',intervalMs:0,user:true})
});
export function richPage(at:string,textId:string,revision:string,speaker:Content,runs:readonly RichTextSourceRun[],options:{completion?:'input'|'continue'|'finish';appendFrom?:string;recordHistory?:boolean}={}):Extract<Instruction,{op:'text.rich'}> {const [first,...rest]=runs;ensure(first,'TEXT_RUNS','At least one run is required');return instruction('text.rich',{at,textId,revision,speaker:expression(speaker),runs:[first,...rest],...options});}
