import {parseInstruction,parseTextTheme,parseTextWindow,parseTextLayout,parseTextFont,ensure} from '../protocol/index.js';
import type {TextTheme,TextWindow,TextLayout,TextFont} from '../protocol/index.js';
import type {AssetRef} from './linker.js';
export function textFont(asset:AssetRef<'font'>,fallback:'serif'|'sans-serif'|'monospace'='serif'):TextFont {ensure(asset.kind==='font','TEXT_FONT','Expected a font resource');return parseTextFont({kind:'asset',asset:asset.id,fallback});}
export function textTheme(id:string,options:Partial<Omit<TextTheme,'id'>>={}):TextTheme {return parseTextTheme({id,font:{kind:'system',family:'serif'},fontSize:22,lineHeight:1.8,letterSpacing:.5,color:'#F3E9D6',speakerColor:'#FFD580',background:'#102B3D',backgroundOpacity:.92,borderColor:'#A2A99B',borderWidth:1,padding:24,align:'left',...options});}
export function textWindow(id:string,mode:TextWindow['mode'],theme:string,rect:TextWindow['rect'],options:Partial<Pick<TextWindow,'z'|'visible'|'maxEntries'|'opacityObject'>>={}):TextWindow {return parseTextWindow({id,mode,theme,rect,z:0,visible:true,maxEntries:mode==='adv'?1:8,...options});}
export function textLayout(initialWindow:string,themes:readonly TextTheme[],windows:readonly TextWindow[],options:{followStage?:boolean;stageZ?:number}={}):TextLayout {return parseTextLayout({version:1,initialWindow,themes,windows,...options});}

export function textWindowGeometry(at:string,windowId:string,rect:TextWindow['rect']){const i=parseInstruction({op:'text.window.geometry',at,window:windowId,rect});ensure(i.op==='text.window.geometry','TEXT_GEOMETRY','Invalid geometry opcode');return i;}
