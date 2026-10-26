import {ensure,parseExtraEntry,parseExtrasCatalog} from '../protocol/index.js';
import type {ExtraEntry,ExtrasCatalog,Instruction} from '../protocol/index.js';
import {expr,expressionWire} from './expressions.js';
import type {TypedExpression} from './expressions.js';
import {instruction} from './linker.js';
import type {AssetRef} from './linker.js';
const extraBrand:unique symbol=Symbol('extra');
export interface ExtraRef<K extends ExtraEntry['kind']> {readonly [extraBrand]:K;readonly id:string;readonly kind:K;}
const entries=new WeakMap<object,ExtraEntry>();
export interface ExtraOptions {title:string;description?:string;unlock?:TypedExpression<'bool'>;reveal?:ExtraEntry['reveal'];}
function make<K extends ExtraEntry['kind']>(id:string,kind:K,options:ExtraOptions,fields:object):ExtraRef<K> {const entry=parseExtraEntry({id,kind,title:options.title,description:options.description??'',unlock:expressionWire(options.unlock??expr.flag(false)),reveal:options.reveal??'unlocked',...fields});ensure(entry.kind===kind,'EXTRAS_KIND','Entry kind mismatch');const ref=Object.freeze({[extraBrand]:kind,id:entry.id,kind});entries.set(ref,entry);return ref;}
function wire(ref:ExtraRef<ExtraEntry['kind']>):ExtraEntry {const e=entries.get(ref);ensure(e,'EXTRAS_FACTORY','Use the real extras factories');return parseExtraEntry(e);}
export function cgExtra(id:string,images:readonly AssetRef<'image'>[],options:ExtraOptions):ExtraRef<'cg'> {ensure(images.every(a=>a.kind==='image'),'EXTRAS_ASSET_KIND','CG needs images');return make(id,'cg',options,{images:images.map(a=>a.id)});}
export function musicExtra(id:string,asset:AssetRef<'audio'>,options:ExtraOptions&{gain?:number;loop?:boolean}):ExtraRef<'music'> {ensure(asset.kind==='audio','EXTRAS_ASSET_KIND','Music needs audio');return make(id,'music',options,{asset:asset.id,gain:options.gain??1,loop:options.loop??true});}
export function sceneExtra(id:string,entry:string,options:ExtraOptions):ExtraRef<'scene'> {return make(id,'scene',options,{entry});}
export function achievement(id:string,options:ExtraOptions&{icon?:AssetRef<'image'>}):ExtraRef<'achievement'> {ensure(!options.icon||options.icon.kind==='image','EXTRAS_ASSET_KIND','Achievement icon needs an image');return make(id,'achievement',options,{icon:options.icon?.id??null});}
export function extrasCatalog(id:string,revision:string,refs:readonly ExtraRef<ExtraEntry['kind']>[]):ExtrasCatalog {return parseExtrasCatalog({id,revision,entries:refs.map(wire)});}
export function unlockExtra(at:string,ref:ExtraRef<ExtraEntry['kind']>):Extract<Instruction,{op:'extras.unlock'}> {return instruction('extras.unlock',{at,entry:wire(ref).id});}

export function sceneMarker(at:string,ref:ExtraRef<'scene'>):Extract<Instruction,{op:'extras.scene'}> {const e=wire(ref);ensure(e.kind==='scene','EXTRAS_KIND','Scene marker needs a scene reference');return instruction('extras.scene',{at,entry:e.id});}
