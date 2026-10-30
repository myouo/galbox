import {initialScene} from '../protocol/stage.js';
import {captureText} from './capture.js';
import type {TextCapture} from './capture.js';
export type {TextCapture} from './capture.js';
import {parseDisplayPreferences,ensure} from '../protocol/index.js';
import type {DeepReadonly,Program,Snapshot,DisplayPreferences,TextState} from '../protocol/index.js';
import {TextController} from './text.js';
export interface TextRenderer {setVisible?(visible:boolean):void;capture?(snapshot:DeepReadonly<Snapshot>,fontCSS:string):TextCapture;render(snapshot:DeepReadonly<Snapshot>):void;applyDisplayPreferences(preferences:DeepReadonly<DisplayPreferences>):void;dispose():void;}
export interface TextRendererContext {readonly mount:HTMLElement;readonly program:DeepReadonly<Program>;readonly fontFamily:(asset:string)=>string;}
export type TextRendererFactory=(context:TextRendererContext)=>TextRenderer;
class DomTextRenderer implements TextRenderer {
 private visible=true;
 private layer:HTMLElement|null=null;private transformed:HTMLElement|null=null;private legacy:TextController|null=null;private disposed=false;private preferences=parseDisplayPreferences({fontScale:1,windowOpacity:1});private last:DeepReadonly<Snapshot>|null=null;
 private windows=new Map<string,{root:HTMLElement;entries:Map<number,TextController>;key:string}>();private observer:ResizeObserver|null=null;
 private readonly fontsChanged=()=>{for(const w of this.windows.values())w.key='';if(this.last)this.render(this.last);};
 constructor(private readonly context:TextRendererContext){const layout=context.program.textLayout;if(!layout){this.legacy=new TextController(context.mount);return;}this.layer=document.createElement('div');this.layer.style.cssText='position:absolute;inset:0;z-index:0;pointer-events:none';context.mount.append(this.layer);if(layout.stageZ!==undefined)this.layer.style.zIndex='1';this.layer.style.overflow=layout.followStage?'hidden':'visible';this.transformed=document.createElement('div');this.transformed.style.cssText='position:absolute;inset:0;transform-origin:0 0';this.layer.append(this.transformed);for(const w of layout.windows){const root=document.createElement('section');root.className='galbox-text galbox-text-window';root.dataset.textWindow=w.id;root.dataset.mode=w.mode;root.setAttribute('aria-label',w.id);root.hidden=true;root.style.inset='auto';root.style.left=`${w.rect.x/1280*100}%`;root.style.top=`${w.rect.y/720*100}%`;root.style.width=`${w.rect.width/1280*100}%`;root.style.height=`${w.rect.height/720*100}%`;root.style.minHeight='0';root.style.zIndex=String(w.z);this.transformed.append(root);this.windows.set(w.id,{root,entries:new Map(),key:''});}this.observer=new ResizeObserver(()=>{if(this.last)this.render(this.last);});this.observer.observe(context.mount);document.fonts?.addEventListener('loadingdone',this.fontsChanged);}
 setVisible(visible:boolean):void {this.visible=visible;const root=this.layer??this.legacy?.captureRoot();if(root)root.style.visibility=visible?'':'hidden';}
 applyDisplayPreferences(input:DeepReadonly<DisplayPreferences>):void {this.preferences=parseDisplayPreferences(input);this.legacy?.applyDisplayPreferences(input);for(const w of this.windows.values())for(const entry of w.entries.values())entry.applyDisplayPreferences(input);if(this.last)this.render(this.last);}
 render(snapshot:DeepReadonly<Snapshot>):void {
  if(this.disposed)return;this.last=snapshot;if(this.legacy){this.legacy.render(snapshot.wait?.kind==='video'?null:snapshot.text);return;}const state=snapshot.textLayout,layout=this.context.program.textLayout;ensure(state&&layout,'TEXT_RENDER_LAYOUT','Layout state required');const bounds=this.context.mount.getBoundingClientRect(),scale=bounds.width/1280,vertical=bounds.height/720;if(this.transformed){if(layout.followStage&&scale>0&&vertical>0){const scene=snapshot.scene??initialScene(),camera=scene.camera,r=-camera.rotation*Math.PI/180,a=Math.cos(r)*camera.zoom,b=Math.sin(r)*camera.zoom,c=-b,d=a,x=640+(scene.shake?.x??0)-a*camera.x-c*camera.y,y=360+(scene.shake?.y??0)-b*camera.x-d*camera.y;this.transformed.style.transform=`matrix(${a},${b*vertical/scale},${c*scale/vertical},${d},${x*scale},${y*vertical})`;}else this.transformed.style.transform='';}
  for(const w of state.windows){const window=this.windows.get(w.id),theme=layout.themes.find(t=>t.id===w.theme);ensure(window&&theme,'TEXT_RENDER_LAYOUT','Unknown window/theme');const font=theme.font.kind==='system'?theme.font.family:`${JSON.stringify(this.context.fontFamily(theme.font.asset))}, ${theme.font.fallback}`;
   const definition=layout.windows.find(d=>d.id===w.id),driver=definition?.opacityObject?snapshot.stage.find(o=>o.id===definition.opacityObject):undefined;ensure(definition,'TEXT_RENDER_LAYOUT','Unknown window definition');window.root.style.opacity=definition?.opacityObject?String(driver?Math.max(0,Math.min(1,driver.position.alpha+(driver.motion?.alpha??0))):1):'';window.root.style.fontFamily=font;window.root.hidden=!w.visible||snapshot.wait?.kind==='video';window.root.style.background=`rgba(${parseInt(theme.background.slice(1,3),16)},${parseInt(theme.background.slice(3,5),16)},${parseInt(theme.background.slice(5,7),16)},${theme.backgroundOpacity*this.preferences.windowOpacity})`;window.root.style.border=`${theme.borderWidth*scale}px solid ${theme.borderColor}`;window.root.style.padding=`${theme.padding*scale}px`;if(definition.mode==='adv')window.root.style.paddingTop=`calc(${theme.padding*scale}px + var(--galbox-fit-leading,0px) * var(--galbox-fit-scale,1))`;window.root.style.overflow=definition.mode==='adv'?'hidden':'auto';
   const texts:DeepReadonly<TextState>[]=[...w.entries];if(snapshot.text?.window?.id===w.id&&!texts.some(t=>t.prompt===snapshot.text?.prompt))texts.push(snapshot.text);
   const ids=new Set(texts.map(t=>t.prompt));for(const [prompt,entry]of window.entries)if(!ids.has(prompt)){entry.dispose();window.entries.delete(prompt);}
   for(const text of texts){let entry=window.entries.get(text.prompt);if(!entry){entry=new TextController(window.root,true);entry.applyDisplayPreferences(this.preferences);window.entries.set(text.prompt,entry);}entry.setCurrent(snapshot.text?.prompt===text.prompt);entry.applyTheme(theme,scale,font);entry.render(text);}
   const key=definition.mode==='adv'?JSON.stringify([theme.id,font,scale,this.preferences.fontScale,window.root.clientWidth,window.root.clientHeight,...texts.map(t=>[t.prompt,window.entries.get(t.prompt)!.layoutRevision])]):texts.map(t=>t.prompt).join(',');
   if(key!==window.key){window.key=key;if(definition.mode==='adv')this.fitPage(window.root);else window.root.scrollTop=window.root.scrollHeight;}
  }
 }
 capture(snapshot:DeepReadonly<Snapshot>,fontCSS:string):TextCapture {ensure(!this.disposed,'SAVE_CAPTURE_TEXT','Text renderer disposed');this.render(snapshot);const visible=this.visible;this.setVisible(true);try{return captureText(this.legacy?[this.legacy.captureRoot()]:this.layer?[this.layer]:[],this.context.mount,fontCSS);}finally{this.setVisible(visible);}}
 private fitPage(root:HTMLElement):void {
  root.style.setProperty('--galbox-fit-scale','1');root.style.setProperty('--galbox-fit-leading','0px');root.scrollTop=0;root.scrollLeft=0;
  if(root.clientWidth===0||root.clientHeight===0)return;
  // Offset boxes are layout coordinates, unaffected by the stage camera.
  // Some fonts extend above the first line box despite a matching scrollHeight.
  // Hanging wrap whitespace has no ink; keep its line layout without fitting its box.
  const units=[...root.querySelectorAll<HTMLElement>('.galbox-text-unit,ruby,rt,.galbox-speaker,p>span')].filter(e=>!e.classList.contains('galbox-text-unit')||!!e.textContent?.trim()||!!e.style.textDecoration),top=Math.min(0,...units.filter(e=>e.offsetHeight>0).map(e=>e.offsetTop));
  if(top<0)root.style.setProperty('--galbox-fit-leading',`${1-top}px`);
  const fits=()=>root.scrollHeight<=root.clientHeight&&root.scrollWidth<=root.clientWidth&&units.every(e=>e.offsetHeight===0||e.offsetTop>=0&&e.offsetTop+e.offsetHeight<=root.clientHeight&&e.offsetLeft>=0&&e.offsetLeft+e.offsetWidth<=root.clientWidth);
  if(fits())return;
  let low=0,high=1;for(let i=0;i<12;i++){const middle=(low+high)/2;root.style.setProperty('--galbox-fit-scale',String(middle));if(fits())low=middle;else high=middle;}
  root.style.setProperty('--galbox-fit-scale',String(low||1/4096));root.scrollTop=0;root.scrollLeft=0;
 }
 dispose():void {if(this.disposed)return;this.disposed=true;this.last=null;this.observer?.disconnect();document.fonts?.removeEventListener('loadingdone',this.fontsChanged);this.legacy?.dispose();for(const w of this.windows.values()){for(const entry of w.entries.values())entry.dispose();w.root.remove();}this.windows.clear();this.layer?.remove();this.layer=null;this.transformed=null;}
}
export function createDomTextRenderer(context:TextRendererContext):TextRenderer {return new DomTextRenderer(context);}
