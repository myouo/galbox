import {captureText} from './capture.js';
import type {TextCapture} from './capture.js';
export type {TextCapture} from './capture.js';
import {parseDisplayPreferences,ensure} from '../protocol/index.js';
import type {DeepReadonly,Program,Snapshot,DisplayPreferences,TextState} from '../protocol/index.js';
import {TextController} from './text.js';
export interface TextRenderer {capture?(snapshot:DeepReadonly<Snapshot>,fontCSS:string):TextCapture;render(snapshot:DeepReadonly<Snapshot>):void;applyDisplayPreferences(preferences:DeepReadonly<DisplayPreferences>):void;dispose():void;}
export interface TextRendererContext {readonly mount:HTMLElement;readonly program:DeepReadonly<Program>;readonly fontFamily:(asset:string)=>string;}
export type TextRendererFactory=(context:TextRendererContext)=>TextRenderer;
class DomTextRenderer implements TextRenderer {
 private layer:HTMLElement|null=null;private legacy:TextController|null=null;private disposed=false;private preferences=parseDisplayPreferences({fontScale:1,windowOpacity:1});private last:DeepReadonly<Snapshot>|null=null;
 private windows=new Map<string,{root:HTMLElement;entries:Map<number,TextController>;key:string}>();private observer:ResizeObserver|null=null;
 constructor(private readonly context:TextRendererContext){const layout=context.program.textLayout;if(!layout){this.legacy=new TextController(context.mount);return;}this.layer=document.createElement('div');this.layer.style.cssText='position:absolute;inset:0;z-index:0;pointer-events:none';context.mount.append(this.layer);for(const w of layout.windows){const root=document.createElement('section');root.className='galbox-text galbox-text-window';root.dataset.textWindow=w.id;root.dataset.mode=w.mode;root.setAttribute('aria-label',w.id);root.hidden=true;root.style.inset='auto';root.style.left=`${w.rect.x/1280*100}%`;root.style.top=`${w.rect.y/720*100}%`;root.style.width=`${w.rect.width/1280*100}%`;root.style.height=`${w.rect.height/720*100}%`;root.style.minHeight='0';root.style.zIndex=String(w.z);this.layer.append(root);this.windows.set(w.id,{root,entries:new Map(),key:''});}this.observer=new ResizeObserver(()=>{if(this.last)this.render(this.last);});this.observer.observe(context.mount);}
 applyDisplayPreferences(input:DeepReadonly<DisplayPreferences>):void {this.preferences=parseDisplayPreferences(input);this.legacy?.applyDisplayPreferences(input);for(const w of this.windows.values())for(const entry of w.entries.values())entry.applyDisplayPreferences(input);if(this.last)this.render(this.last);}
 render(snapshot:DeepReadonly<Snapshot>):void {
  if(this.disposed)return;this.last=snapshot;if(this.legacy){this.legacy.render(snapshot.wait?.kind==='video'?null:snapshot.text);return;}const state=snapshot.textLayout,layout=this.context.program.textLayout;ensure(state&&layout,'TEXT_RENDER_LAYOUT','Layout state required');const scale=this.context.mount.getBoundingClientRect().width/1280;
  for(const w of state.windows){const window=this.windows.get(w.id),theme=layout.themes.find(t=>t.id===w.theme);ensure(window&&theme,'TEXT_RENDER_LAYOUT','Unknown window/theme');const font=theme.font.kind==='system'?theme.font.family:`${JSON.stringify(this.context.fontFamily(theme.font.asset))}, ${theme.font.fallback}`;
   window.root.style.fontFamily=font;window.root.hidden=!w.visible||snapshot.wait?.kind==='video';window.root.style.background=`rgba(${parseInt(theme.background.slice(1,3),16)},${parseInt(theme.background.slice(3,5),16)},${parseInt(theme.background.slice(5,7),16)},${theme.backgroundOpacity*this.preferences.windowOpacity})`;window.root.style.border=`${theme.borderWidth*scale}px solid ${theme.borderColor}`;window.root.style.padding=`${theme.padding*scale}px`;window.root.style.overflowY='auto';
   const texts:DeepReadonly<TextState>[]=[...w.entries];if(snapshot.text?.window?.id===w.id&&!texts.some(t=>t.prompt===snapshot.text?.prompt))texts.push(snapshot.text);
   const ids=new Set(texts.map(t=>t.prompt));for(const [prompt,entry]of window.entries)if(!ids.has(prompt)){entry.dispose();window.entries.delete(prompt);}
   const key=texts.map(t=>t.prompt).join(',');for(const text of texts){let entry=window.entries.get(text.prompt);if(!entry){entry=new TextController(window.root,true);entry.applyDisplayPreferences(this.preferences);window.entries.set(text.prompt,entry);}entry.setCurrent(snapshot.text?.prompt===text.prompt);entry.applyTheme(theme,scale,font);entry.render(text);}
   if(key!==window.key){window.key=key;window.root.scrollTop=window.root.scrollHeight;}
  }
 }
 capture(snapshot:DeepReadonly<Snapshot>,fontCSS:string):TextCapture {ensure(!this.disposed,'SAVE_CAPTURE_TEXT','Text renderer disposed');this.render(snapshot);return captureText(this.legacy?[this.legacy.captureRoot()]:this.layer?[this.layer]:[],this.context.mount,fontCSS);}
 dispose():void {if(this.disposed)return;this.disposed=true;this.last=null;this.observer?.disconnect();this.legacy?.dispose();for(const w of this.windows.values()){for(const entry of w.entries.values())entry.dispose();w.root.remove();}this.windows.clear();this.layer?.remove();this.layer=null;}
}
export function createDomTextRenderer(context:TextRendererContext):TextRenderer {return new DomTextRenderer(context);}
