import type { DeepReadonly, TextState,TextStyle,TextTheme } from '../protocol/index.js';
import {parseDisplayPreferences} from '../protocol/index.js';
import {compileRichText,fadeOpacity} from '../protocol/text.js';
export class TextController {
  private readonly box=document.createElement('section');
  private readonly speaker=document.createElement('div');
  private readonly content=document.createElement('p');
  private key='';private layoutVersion=0;private units:{node:HTMLSpanElement;effect:DeepReadonly<TextStyle>['effect']}[]=[];private rubies:{node:HTMLElement;end:number}[]=[];
  constructor(mount:HTMLElement,embedded=false){this.box.className=embedded?'galbox-text-entry':'galbox-text';this.box.hidden=true;this.speaker.className='galbox-speaker';this.content.dataset.testid='story-text';this.box.append(this.speaker,this.content);mount.append(this.box);}
  captureRoot():HTMLElement {return this.box;}
  get layoutRevision():number {return this.layoutVersion;}
  setCurrent(current:boolean):void {this.content.dataset.testid=current?'story-text':'text-entry';this.box.dataset.current=String(current);}
  applyTheme(theme:DeepReadonly<TextTheme>,scale:number,font:string):void {this.box.style.color=theme.color;this.box.style.fontFamily=font;this.speaker.style.color=theme.speakerColor;this.speaker.style.fontSize=`calc(${theme.fontSize*scale*.8}px * var(--galbox-fit-scale,1))`;this.content.style.fontSize=`calc(${theme.fontSize*scale}px * var(--galbox-font-scale,1) * var(--galbox-fit-scale,1))`;this.content.style.lineHeight=String(theme.lineHeight);this.content.style.letterSpacing=`calc(${theme.letterSpacing*scale}px * var(--galbox-fit-scale,1))`;this.content.style.textAlign=theme.align;this.content.style.minHeight='0';this.content.style.overflowWrap='anywhere';}
  applyDisplayPreferences(input:unknown):void {const value=parseDisplayPreferences(input);this.box.style.setProperty('--galbox-font-scale',String(value.fontScale));this.box.style.setProperty('--galbox-window-opacity',String(value.windowOpacity));}
  render(text:DeepReadonly<TextState>|null):void {
    this.box.hidden=!text;this.speaker.textContent=text?.speaker??'';this.speaker.hidden=!text?.speaker;
    if(!text?.rich){const key=text?JSON.stringify([text.prompt,text.textId,text.revision,text.content]):'';if(key!==this.key){this.key=key;this.layoutVersion++;}this.units=[];this.rubies=[];this.content.removeAttribute('aria-label');const value=Array.from(text?.content??''),tail=document.createElement('span');tail.style.visibility='hidden';tail.setAttribute('aria-hidden','true');tail.textContent=value.slice(text?.revealed??0).join('');this.content.replaceChildren(document.createTextNode(value.slice(0,text?.revealed??0).join('')),tail);return;}
    const rich=text.rich,key=JSON.stringify([text.prompt,text.textId,text.revision,rich.runs]);
    if(key!==this.key){this.key=key;this.layoutVersion++;this.units=[];this.rubies=[];this.content.replaceChildren();const plan=compileRichText(rich.runs);
      rich.runs.forEach((r,index)=>{if(r.kind==='pause'||r.kind==='pause.units'||r.kind==='speed'||r.kind==='confirm')return;const root=r.kind==='ruby'?document.createElement('ruby'):this.content;
        for(const token of plan.tokens){if(token.kind!=='unit'||token.run!==index)continue;const node=document.createElement('span'),style=token.style;node.className='galbox-text-unit';node.textContent=token.text;if(style.color)node.style.color=style.color;if(style.shadow)node.style.textShadow=style.shadow.xEm||style.shadow.yEm||style.shadow.blurEm?`${style.shadow.xEm}em ${style.shadow.yEm}em ${style.shadow.blurEm}em ${style.shadow.color}`:'none';if(style.bold)node.style.fontWeight='bold';if(style.italic)node.style.fontStyle='italic';if(style.underline)node.style.textDecoration='underline';if(style.scale)node.style.fontSize=`${style.scale}em`;if(style.effect)node.dataset.effect=style.effect.kind;root.append(node);this.units.push({node,effect:style.effect});}
        if(r.kind==='ruby'){const reading=document.createElement('rt');reading.textContent=r.reading;if(r.style?.color)reading.style.color=r.style.color;root.append(reading);this.content.append(root);this.rubies.push({node:reading,end:this.units.length});}
      });
    }
    this.units.forEach(({node,effect},index)=>{const visible=index<text.revealed,time=rich.revealedAt[index];node.style.visibility=visible?'visible':'hidden';node.setAttribute('aria-hidden',String(!visible));
      node.style.opacity=String(!visible?0:effect?.kind==='fade'&&typeof time==='number'?fadeOpacity(effect,rich.elapsedMs-time,rich.baseIntervalMs):1);
      if(effect?.kind==='wave')node.style.transform=`translateY(${Math.sin(rich.elapsedMs/effect.periodMs*Math.PI*2+index*.6)*effect.amplitude}px)`;
      else if(effect?.kind==='shake'){const phase=rich.elapsedMs/effect.periodMs*Math.PI*2+index*1.7;node.style.transform=`translate(${Math.sin(phase*3)*effect.amplitude}px,${Math.sin(phase*5)*effect.amplitude}px)`;}
      else node.style.transform='';
    });
    for(const ruby of this.rubies){const visible=text.revealed>=ruby.end;ruby.node.style.visibility=visible?'visible':'hidden';ruby.node.setAttribute('aria-hidden',String(!visible));}
    this.content.setAttribute('aria-label',this.units.slice(0,text.revealed).map(u=>u.node.textContent??'').join(''));
  }
  dispose():void {this.box.remove();}
}
