import {ensure,canonicalWireJSON,parseTextState} from './index.js';
import type {Program,Snapshot,TextLayoutState,TextState,DeepReadonly} from './index.js';
import {isTextComplete} from './text.js';
import {templateSignature} from './expressions.js';
export function validateTextLayout(program:Program):void {
 const layout=program.textLayout;if(!layout)return;ensure(!layout.windows.some(w=>w.opacityObject)||program.capabilities.includes('text.stage-opacity'),'TEXT_OPACITY_CAPABILITY','Declare text.stage-opacity');ensure(program.capabilities.includes('text.windows'),'TEXT_LAYOUT_CAPABILITY','Declare text.windows');
 ensure(new Set(layout.themes.map(t=>t.id)).size===layout.themes.length&&new Set(layout.windows.map(w=>w.id)).size===layout.windows.length,'TEXT_LAYOUT_DUPLICATE','Duplicate window/theme');
 const initial=layout.windows.find(w=>w.id===layout.initialWindow);ensure(initial?.visible,'TEXT_LAYOUT_INITIAL','Initial window must exist and be visible');
 for(const theme of layout.themes)if(theme.font.kind==='asset'){const asset=theme.font.asset;ensure(program.assets.some(a=>a.id===asset&&a.kind==='font'),'TEXT_FONT','Theme needs a registered font asset');}
 for(const w of layout.windows){ensure(layout.themes.some(t=>t.id===w.theme),'TEXT_THEME',w.theme);ensure(w.rect.x+w.rect.width<=1280&&w.rect.y+w.rect.height<=720,'TEXT_RECT',w.id);ensure(w.mode!=='adv'||w.maxEntries===1,'TEXT_WINDOW_CAPACITY','ADV requires maxEntries=1');}
 textLayoutSignature(program);
}
export function textLayoutSignature(p:DeepReadonly<Program>):string {ensure(p.textLayout,'TEXT_LAYOUT','No declared layout');const value=canonicalWireJSON({layout:p.textLayout,fonts:p.assets.filter(a=>a.kind==='font')});ensure(value.length<=65536,'TEXT_LAYOUT_SIZE','Layout signature exceeds 65536 characters');return value;}
export function initialTextLayout(p:Program):TextLayoutState|undefined {const l=p.textLayout;if(!l)return;const [first,...rest]=l.windows.map(w=>({id:w.id,theme:w.theme,visible:w.visible,entries:[]}));ensure(first,'TEXT_LAYOUT','No windows');return {version:1,signature:textLayoutSignature(p),active:l.initialWindow,windows:[first,...rest]};}
export function activeTextWindow(s:Snapshot){const state=s.textLayout;ensure(state,'TEXT_LAYOUT','No text window state');const w=state.windows.find(w=>w.id===state.active);ensure(w,'TEXT_WINDOW',state.active);return w;}
export function prepareWindowText(p:Program,s:Snapshot,text:TextState,at:string):void {
 if(!p.textLayout)return;const state=activeTextWindow(s),definition=p.textLayout.windows.find(w=>w.id===state.id);ensure(!definition?.opacityObject||s.stage.some(o=>o.id===definition.opacityObject&&!o.parent),'TEXT_OPACITY_OBJECT','Window needs its declared root opacity object');ensure(definition&&state.visible,'TEXT_WINDOW_HIDDEN','A prompt needs a visible active window');ensure(definition.mode==='adv'||state.entries.length<definition.maxEntries,'TEXT_WINDOW_FULL','Clear the NVL window before adding more entries');text.window={id:state.id,at};
}
export function commitWindowText(p:Program,s:Snapshot):void {if(!s.textLayout||!s.text)return;const w=activeTextWindow(s),definition=p.textLayout?.windows.find(d=>d.id===w.id);ensure(definition,'TEXT_WINDOW',w.id);if(definition.mode==='adv')w.entries=[];}
export function confirmWindowText(s:Snapshot):void {if(!s.textLayout||!s.text)return;const w=activeTextWindow(s);w.entries.push(parseTextState(s.text));}
export function clearTextWindow(s:Snapshot,id:string):void {const w=s.textLayout?.windows.find(w=>w.id===id);ensure(w,'TEXT_WINDOW',id);w.entries=[];if(s.text?.window?.id===id)s.text=null;}
export function validateWindowState(p:Program,s:Snapshot):void {
 const layout=p.textLayout,state=s.textLayout;ensure(!!layout===!!state,'RESTORE_TEXT_LAYOUT','Layout state missing/unavailable; explicit migration required');
 const texts=[...(s.text?[s.text]:[]),...s.history,...(state?.windows.flatMap(w=>w.entries)??[])];
 if(!layout||!state){ensure(texts.every(t=>!t.window),'RESTORE_TEXT_WINDOW','Unexpected text window origin');return;}
 ensure(state.signature===textLayoutSignature(p)&&state.windows.length===layout.windows.length&&new Set(state.windows.map(w=>w.id)).size===state.windows.length,'RESTORE_TEXT_LAYOUT','Layout definition changed or identities are invalid');
 ensure(state.windows.some(w=>w.id===state.active),'RESTORE_TEXT_WINDOW','Unknown active window');
 const code=p.functions.flatMap(f=>f.code),entryPrompts=new Set<number>();
 for(const text of texts){const origin=text.window,source=code.find(i=>i.at===origin?.at);ensure(origin&&state.windows.some(w=>w.id===origin.id)&&source&&(source.op==='text.page'||source.op==='text.template'||source.op==='text.rich')&&source.textId===text.textId&&source.revision===text.revision,'RESTORE_TEXT_WINDOW','Text window origin missing or changed');
  if(source.op==='text.page')ensure(!text.template&&!text.rich&&source.content===text.content&&source.speaker===text.speaker,'RESTORE_TEXT_WINDOW','Static text changed');
  if(source.op==='text.template')ensure(!text.rich&&text.template?.at===source.at&&text.template.signature===templateSignature(source.speaker,source.content),'RESTORE_TEXT_WINDOW','Template source changed');
  if(source.op==='text.rich')ensure(text.rich?.at===source.at,'RESTORE_TEXT_WINDOW','Rich origin missing');
 }
 for(const w of state.windows){ensure(!!w.rect===!!w.geometryAt,'RESTORE_TEXT_GEOMETRY','Geometry source/value must travel together');if(w.rect){const source=code.find(i=>i.at===w.geometryAt);ensure(p.capabilities.includes('text.windows')&&source?.op==='text.window.geometry'&&source.window===w.id&&canonicalWireJSON(source.rect)===canonicalWireJSON(w.rect),'RESTORE_TEXT_GEOMETRY','Window geometry source changed');}const definition=layout.windows.find(d=>d.id===w.id);if(definition?.opacityObject&&(w.entries.length||s.text?.window?.id===w.id))ensure(s.stage.some(o=>o.id===definition.opacityObject&&!o.parent),'RESTORE_TEXT_OPACITY','Opacity driver missing or parented');ensure(definition&&layout.themes.some(t=>t.id===w.theme)&&w.entries.length<=definition.maxEntries,'RESTORE_TEXT_WINDOW','Unknown window/theme or capacity exceeded');
  for(const entry of w.entries){ensure(entry.window?.id===w.id&&isTextComplete(entry)&&!entryPrompts.has(entry.prompt)&&s.history.some(t=>t.prompt===entry.prompt&&canonicalWireJSON(t)===canonicalWireJSON(entry)),'RESTORE_TEXT_ENTRIES','Invalid/unconfirmed/duplicate window entry');entryPrompts.add(entry.prompt);}
 }
 if(s.wait?.kind==='text'){const w=state.windows.find(w=>w.id===state.active);ensure(w?.visible&&s.text?.window?.id===w.id&&s.text.window.at===s.wait.at&&!entryPrompts.has(s.text.prompt),'RESTORE_TEXT_WINDOW','Current prompt belongs to the visible active window');}
 else if(s.text)ensure(s.history.some(t=>t.prompt===s.text?.prompt&&canonicalWireJSON(t)===canonicalWireJSON(s.text))||isTextComplete(s.text)&&code.some(i=>i.op==='text.rich'&&i.at===s.text?.rich?.at&&i.completion==='continue'),'RESTORE_TEXT_ENTRIES','Retained text must be confirmed or an explicit completed continuation');
}
