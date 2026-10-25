import {collectGraphemes,countGraphemes} from 'unicode-segmenter/grapheme';
import {canonicalWireJSON,ensure} from './index.js';
import type {TextState,TextRun,TextStyle,Instruction,DeepReadonly,RichTextState} from './index.js';
export const textSegmentation='uax29-17.0.0@1';
type Text=DeepReadonly<TextState>;
type RichInstruction=Extract<Instruction,{op:'text.rich'}>;
export type TextToken={kind:'unit';text:string;run:number;style:DeepReadonly<TextStyle>}|{kind:'pause';duration:number}|{kind:'speed';intervalMs:number};
export interface TextPlan {content:string;tokens:TextToken[];units:number;}
function unicode(text:string):void {ensure(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(text),'TEXT_UNICODE','Unpaired UTF-16 surrogate');}
export function compileRichText(runs:readonly DeepReadonly<TextRun>[]):TextPlan {
 const content=runs.map(r=>r.kind==='text'||r.kind==='ruby'?r.content:r.kind==='break'?'\n':'').join('');unicode(content);ensure(content.length>0&&content.length<=4096,'TEXT_SIZE','Rich text requires 1..4096 UTF-16 units');
 const boundaries=new Set([0]);let offset=0;for(const part of collectGraphemes(content)){offset+=part.length;boundaries.add(offset);}
 const tokens:TextToken[]=[];let units=0;offset=0;
 runs.forEach((run,index)=>{
  ensure(boundaries.has(offset),'TEXT_GRAPHEME_BOUNDARY','A run or control splits a grapheme');
  if(run.kind==='pause'){tokens.push({kind:'pause',duration:run.duration});return;}
  if(run.kind==='speed'){tokens.push({kind:'speed',intervalMs:run.intervalMs});return;}
  if(run.kind==='ruby'){unicode(run.reading);ensure(run.reading.length<=256,'TEXT_RUBY_SIZE','Ruby reading is at most 256 UTF-16 units');}
  const value=run.kind==='break'?'\n':run.content;unicode(value);offset+=value.length;ensure(boundaries.has(offset),'TEXT_GRAPHEME_BOUNDARY','A run splits a grapheme');
  for(const part of collectGraphemes(value)){tokens.push({kind:'unit',text:part,run:index,style:run.kind==='break'?{}:run.style??{}});units++;}
 });return {content,tokens,units};
}
export function richTextSignature(source:DeepReadonly<RichInstruction>):string {const signature=canonicalWireJSON({segmentation:textSegmentation,speaker:source.speaker,runs:source.runs});ensure(signature.length<=65536,'TEXT_SOURCE_SIZE','Rich source signature exceeds 65536 characters');return signature;}
function intervalAt(rich:DeepReadonly<RichTextState>,plan:TextPlan):number {let value=rich.baseIntervalMs;for(let j=0;j<rich.cursor;j++){const token=plan.tokens[j];if(token?.kind==='speed')value=token.intervalMs;}return rich.baseIntervalMs===0?0:value;}
export function tickRichText(text:TextState,ms:number,plan:TextPlan):void {
 const rich=text.rich;ensure(rich,'TEXT_STATE','Missing structured continuation');let budget=ms,interval=intervalAt(rich,plan);
 while(rich.cursor<plan.tokens.length||rich.pauseRemainingMs>0){
  if(rich.pauseRemainingMs>0){const used=Math.min(budget,rich.pauseRemainingMs);rich.pauseRemainingMs-=used;rich.elapsedMs+=used;budget-=used;if(rich.pauseRemainingMs>0)break;}
  const token=plan.tokens[rich.cursor];if(!token)break;
  if(token.kind==='pause'){rich.cursor++;rich.pauseRemainingMs=token.duration;rich.remainderMs=0;continue;}
  if(token.kind==='speed'){rich.cursor++;interval=rich.baseIntervalMs===0?0:token.intervalMs;rich.remainderMs=0;continue;}
  const needed=Math.max(0,interval-rich.remainderMs);if(budget<needed){rich.remainderMs+=budget;rich.elapsedMs+=budget;budget=0;break;}
  budget-=needed;rich.elapsedMs+=needed;rich.remainderMs=0;rich.cursor++;text.revealed++;rich.revealedAt.push(rich.elapsedMs);
 }
 rich.elapsedMs+=budget;
}
export function textUnitCount(text:Text):number {return text.rich?countGraphemes(text.content):Array.from(text.content).length;}
export function isTextComplete(text:Text):boolean {
 const rich=text.rich,count=textUnitCount(text);if(text.revealed!==count)return false;if(!rich)return true;
 const controls=rich.runs.filter(r=>r.kind==='pause'||r.kind==='speed').length;if(rich.cursor!==count+controls||rich.pauseRemainingMs>0)return false;
 let at=0;for(const run of rich.runs){if(run.kind==='pause'||run.kind==='speed')continue;const units=run.kind==='break'?1:countGraphemes(run.content);at+=units;const effect=run.kind==='break'?undefined:run.style?.effect,time=rich.revealedAt[at-1];if(effect?.kind==='fade'&&typeof time==='number'&&rich.elapsedMs-time<effect.duration)return false;}return true;
}
export function revealRichText(text:TextState,plan:TextPlan):void {const rich=text.rich;ensure(rich,'TEXT_STATE','Missing structured continuation');text.revealed=plan.units;rich.cursor=plan.tokens.length;rich.pauseRemainingMs=0;rich.remainderMs=0;rich.revealedAt=Array.from({length:plan.units},()=>null);}
export function validateRichText(text:TextState,source:RichInstruction):void {
 const rich=text.rich;ensure(rich&&!text.template&&rich.at===source.at&&rich.signature===richTextSignature(source),'RESTORE_RICH_SOURCE','Rich origin missing or changed; explicit migration required');
 const plan=compileRichText(rich.runs);ensure(text.textId===source.textId&&text.revision===source.revision&&text.content===plan.content&&rich.runs.length===source.runs.length,'RESTORE_RICH_TEXT','Rich content/identity mismatch');unicode(text.speaker);
 if(source.speaker.op==='literal')ensure(text.speaker===source.speaker.value,'RESTORE_RICH_TEXT','Literal speaker changed');
 rich.runs.forEach((run,index)=>{const original=source.runs[index];ensure(original&&original.kind===run.kind,'RESTORE_RICH_TEXT','Run kind mismatch');
  if(run.kind==='text'||run.kind==='ruby'){ensure(original.kind==='text'||original.kind==='ruby','RESTORE_RICH_TEXT','Text run mismatch');ensure(canonicalWireJSON(run.style??{})===canonicalWireJSON(original.style??{}),'RESTORE_RICH_TEXT','Style mismatch');if(original.content.op==='literal')ensure(run.content===original.content.value,'RESTORE_RICH_TEXT','Literal content mismatch');if(run.kind==='ruby'){ensure(original.kind==='ruby','RESTORE_RICH_TEXT','Ruby mismatch');if(original.reading.op==='literal')ensure(run.reading===original.reading.value,'RESTORE_RICH_TEXT','Literal reading mismatch');}}
  else ensure(canonicalWireJSON(run)===canonicalWireJSON(original),'RESTORE_RICH_TEXT','Control mismatch');
 });
 ensure(rich.cursor<=plan.tokens.length&&text.revealed===rich.revealedAt.length&&text.revealed===plan.tokens.slice(0,rich.cursor).filter(t=>t.kind==='unit').length,'RESTORE_RICH_CURSOR','Invalid reveal cursor');
 let previous=0;for(const time of rich.revealedAt){if(time===null)continue;ensure(time>=previous&&time<=rich.elapsedMs,'RESTORE_RICH_TIME','Invalid reveal time');previous=time;}
 if(rich.revealedAt.some(t=>t===null))ensure(rich.revealedAt.every(t=>t===null)&&rich.cursor===plan.tokens.length&&rich.pauseRemainingMs===0,'RESTORE_RICH_TIME','Partial instant reveal is unsupported');
 const before=plan.tokens[rich.cursor-1],next=plan.tokens[rich.cursor],interval=intervalAt(rich,plan);
 if(rich.pauseRemainingMs>0)ensure(before?.kind==='pause'&&rich.pauseRemainingMs<=before.duration&&rich.remainderMs===0,'RESTORE_RICH_PAUSE','Invalid remaining pause');
 else if(next)ensure(next.kind==='unit'&&(interval===0?rich.remainderMs===0:rich.remainderMs<interval),'RESTORE_RICH_CURSOR','Noncanonical reveal continuation');
 else ensure(rich.remainderMs===0,'RESTORE_RICH_CURSOR','Remainder after completion');
}
