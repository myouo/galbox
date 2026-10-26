import {ensure,parseGamePresentation} from '../protocol/index.js';
import type {GamePresentation,GamePalette,GameLabels,ToolbarAction} from '../protocol/index.js';
import {defaultGamePresentation} from '../protocol/presentation.js';
import type {AssetRef} from './linker.js';
export interface GamePresentationOptions {readonly id?:string;readonly revision?:string;readonly palette?:Partial<GamePalette>;readonly radius?:number;readonly fontSize?:number;readonly font?:{readonly family:'serif'|'sans';readonly asset?:AssetRef<'font'>};readonly title?:{readonly subtitle?:string;readonly credit?:string;readonly background?:AssetRef<'image'>;readonly logo?:AssetRef<'image'>};readonly labels?:Partial<GameLabels>;readonly toolbar?:readonly ToolbarAction[];}
export function gamePresentation(options:GamePresentationOptions={}):GamePresentation {
 const d=defaultGamePresentation();for(const a of [options.title?.background,options.title?.logo])ensure(!a||a.kind==='image','PRESENTATION_IMAGE','Use image references');ensure(!options.font?.asset||options.font.asset.kind==='font','PRESENTATION_FONT','Use a font reference');
 const value=parseGamePresentation({...d,id:options.id??d.id,revision:options.revision??d.revision,palette:{...d.palette,...options.palette},radius:options.radius??d.radius,fontSize:options.fontSize??d.fontSize,font:{family:options.font?.family??d.font.family,asset:options.font?.asset?.id??null},title:{subtitle:options.title?.subtitle??d.title.subtitle,credit:options.title?.credit??'',background:options.title?.background?.id??null,logo:options.title?.logo?.id??null},labels:{...d.labels,...options.labels},toolbar:options.toolbar??d.toolbar});ensure(value.toolbar.includes('menu'),'PRESENTATION_MENU','Keep a menu action');return value;
}
