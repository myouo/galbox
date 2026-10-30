import {collectGraphemes} from 'unicode-segmenter/grapheme';
import type {CSSProperties} from 'react';
import type {DeepReadonly,TextState,TextStyle} from '../protocol/index.js';
/** Static history formatting only: it never reveals text, drives clocks or advances a Player. */
export function HistoryText({text,fontSize,lineHeight,allowedColors,defaultColor,respectRevealed=false}:{text:DeepReadonly<TextState>;fontSize?:number;lineHeight?:number;allowedColors?:readonly string[];defaultColor?:string;respectRevealed?:boolean}){
 const palette=allowedColors?.map(c=>c.toLowerCase()),style=(value:DeepReadonly<TextStyle>|undefined):CSSProperties=>{const color=value?.color,size=fontSize===undefined?undefined:Math.round(fontSize*(value?.scale??1));return {fontWeight:value?.bold?'bold':undefined,fontStyle:value?.italic?'italic':undefined,color:color&&(!palette||palette.includes(color.toLowerCase()))?color:defaultColor,...(size!==undefined?{fontSize:size,...(lineHeight!==undefined?{lineHeight:`${size+lineHeight-fontSize!}px`}:{})}:value?.scale!==undefined?{fontSize:`${value.scale}em`}:{})};};
 if(!text.rich)return <span data-history-text>{respectRevealed?Array.from(text.content).slice(0,text.revealed).join(''):text.content}</span>;
 let remaining=respectRevealed?text.revealed:Infinity;
 return <span data-history-text>{text.rich.runs.map((run,index)=>{if(run.kind==='pause'||run.kind==='pause.units'||run.kind==='speed'||run.kind==='confirm'||remaining<=0)return null;if(run.kind==='break'){remaining--;return <br key={index}/>;}const units=collectGraphemes(run.content),content=units.slice(0,remaining).join('');remaining-=Math.min(remaining,units.length);return run.kind==='ruby'?<ruby key={index} style={style(run.style)}>{content}<rt>{run.reading}</rt></ruby>:<span key={index} style={style(run.style)}>{content}</span>;})}</span>;
}
