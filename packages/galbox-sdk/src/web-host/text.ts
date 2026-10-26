import type { DeepReadonly, TextState,TextStyle,TextTheme } from '../protocol/index.js';
import {parseDisplayPreferences} from '../protocol/index.js';
import {compileRichText} from '../protocol/text.js';
export class TextController {
  private readonly box=document.createElement('section');
  private readonly speaker=document.createElement('div');
  private readonly content=document.createElement('p');
  private key='';private units:{node:HTMLSpanElement;effect:DeepReadonly<TextStyle>['effect']}[]=[];private rubies:{node:HTMLElement;end:number}[]=[];
  constructor(mount:HTMLElement,embedded=false){this.box.className=embedded?'galbox-text-entry':'galbox-text';this.box.hidden=true;this.speaker.className='galbox-speaker';this.content.dataset.testid='story-text';this.box.append(this.speaker,this.content);mount.append(this.box);}
  captureRoot():HTMLElement {return this.box;}
  setCurrent(current:boolean):void {this.content.dataset.testid=current?'story-text':'text-entry';this.box.dataset.current=String(current);}
  applyTheme(theme:DeepReadonly<TextTheme>,scale:number,font:string):void {this.box.style.color=theme.color;this.box.style.fontFamily=font;this.speaker.style.color=theme.speakerColor;this.speaker.style.fontSize=`${theme.fontSize*scale*.8}px`;this.content.style.fontSize=`calc(${theme.fontSize*scale}px * var(--galbox-font-scale,1))`;this.content.style.lineHeight=String(theme.lineHeight);this.content.style.letterSpacing=`${theme.letterSpacing*scale}px`;this.content.style.textAlign=theme.align;this.content.style.minHeight='0';}
  applyDisplayPreferences(input:unknown):void {const value=parseDisplayPreferences(input);this.box.style.setProperty('--galbox-font-scale',String(value.fontScale));this.box.style.setProperty('--galbox-window-opacity',String(value.windowOpacity));}
  render(text:DeepReadonly<TextState>|null):void {
    this.box.hidden=!text;this.speaker.textContent=text?.speaker??'';
    if(!text?.rich){this.key='';this.units=[];this.rubies=[];this.content.removeAttribute('aria-label');this.content.textContent=text?Array.from(text.content).slice(0,text.revealed).join(''):'';return;}
    const rich=text.rich,key=JSON.stringify([text.prompt,text.textId,text.revision,rich.runs]);
    if(key!==this.key){this.key=key;this.units=[];this.rubies=[];this.content.replaceChildren();const plan=compileRichText(rich.runs);
      rich.runs.forEach((r,index)=>{if(r.kind==='pause'||r.kind==='speed')return;const root=r.kind==='ruby'?document.createElement('ruby'):this.content;
        for(const token of plan.tokens){if(token.kind!=='unit'||token.run!==index)continue;const node=document.createElement('span'),style=token.style;node.className='galbox-text-unit';node.textContent=token.text;if(style.color)node.style.color=style.color;if(style.bold)node.style.fontWeight='bold';if(style.italic)node.style.fontStyle='italic';if(style.underline)node.style.textDecoration='underline';if(style.scale)node.style.fontSize=`${style.scale}em`;if(style.effect)node.dataset.effect=style.effect.kind;root.append(node);this.units.push({node,effect:style.effect});}
        if(r.kind==='ruby'){const reading=document.createElement('rt');reading.textContent=r.reading;if(r.style?.color)reading.style.color=r.style.color;root.append(reading);this.content.append(root);this.rubies.push({node:reading,end:this.units.length});}
      });
    }
    this.units.forEach(({node,effect},index)=>{const visible=index<text.revealed,time=rich.revealedAt[index];node.style.visibility=visible?'visible':'hidden';node.setAttribute('aria-hidden',String(!visible));
      node.style.opacity=String(!visible?0:effect?.kind==='fade'&&typeof time==='number'?Math.min(1,Math.max(0,(rich.elapsedMs-time)/effect.duration)):1);
      if(effect?.kind==='wave')node.style.transform=`translateY(${Math.sin(rich.elapsedMs/effect.periodMs*Math.PI*2+index*.6)*effect.amplitude}px)`;
      else if(effect?.kind==='shake'){const phase=rich.elapsedMs/effect.periodMs*Math.PI*2+index*1.7;node.style.transform=`translate(${Math.sin(phase*3)*effect.amplitude}px,${Math.sin(phase*5)*effect.amplitude}px)`;}
      else node.style.transform='';
    });
    for(const ruby of this.rubies){const visible=text.revealed>=ruby.end;ruby.node.style.visibility=visible?'visible':'hidden';ruby.node.setAttribute('aria-hidden',String(!visible));}
    this.content.setAttribute('aria-label',this.units.slice(0,text.revealed).map(u=>u.node.textContent??'').join(''));
  }
  dispose():void {this.box.remove();}
}
