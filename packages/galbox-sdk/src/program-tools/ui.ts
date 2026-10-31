import {ensure,parseUIControl,parseUIScreen,parseUICatalog} from '../protocol/index.js';
import type {UISoundRequest,UIControl,UIStyle,InteractionRect,DeepReadonly,UICatalog} from '../protocol/index.js';
import type {AssetRef,Variable} from './linker.js';
import {instruction} from './linker.js';
import {expressionWire} from './expressions.js';
import type {TypedExpression} from './expressions.js';
const controlBrand:unique symbol=Symbol('ui-control'),screenBrand:unique symbol=Symbol('ui-screen'),fieldBrand:unique symbol=Symbol('ui-field');
export interface UIControlRef<K extends UIControl['kind']>{readonly [controlBrand]:K;readonly id:string;readonly kind:K;}
export interface UIScreenRef {readonly [screenBrand]:true;readonly id:string;}
export interface UIFieldRef {readonly [fieldBrand]:true;}
export interface UIControlOptions {readonly rect:DeepReadonly<InteractionRect>;readonly text:string;readonly visible?:boolean;readonly enabled?:boolean;readonly style?:Partial<UIStyle>;}
const controls=new WeakMap<object,UIControl>(),screens=new WeakMap<object,{wire:import('../protocol/index.js').UIScreen;refs:readonly UIControlRef<UIControl['kind']>[]}>(),fields=new WeakMap<object,{control:UIControlRef<'toggle'|'range'|'input'>;dest:string}>();
function create<K extends UIControl['kind']>(id:string,kind:K,options:UIControlOptions,extra:object={}):UIControlRef<K> {const wire=parseUIControl({id,kind,rect:options.rect,text:options.text,visible:options.visible??true,enabled:options.enabled??true,style:{foreground:'#f4efe2',background:'#163647',border:'#bfa774',fontSize:24,...options.style},...extra}),ref=Object.freeze({[controlBrand]:kind,id:wire.id,kind});controls.set(ref,wire);return ref;}
export function uiLabel(id:string,options:UIControlOptions):UIControlRef<'label'>{return create(id,'label',options);}
export function uiImage(id:string,asset:AssetRef<'image'>,options:UIControlOptions):UIControlRef<'image'>{ensure(asset.kind==='image','UI_ASSET_KIND','UI image needs image');return create(id,'image',options,{asset:asset.id});}
export function uiButton(id:string,options:UIControlOptions):UIControlRef<'button'>{return create(id,'button',options);}
export function uiImageButton(id:string,asset:AssetRef<'image'>,options:UIControlOptions&{frameWidth:number;frameHeight:number;enterSound?:UISoundRequest;clickSound?:UISoundRequest}):UIControlRef<'button'>{const {frameWidth,frameHeight,enterSound,clickSound,...base}=options;ensure(asset.kind==='image','UI_ASSET_KIND','Sprite button needs an image');return create(id,'button',base,{graphic:{asset:asset.id,frameWidth,frameHeight,...(enterSound?{enterSound}:{}),...(clickSound?{clickSound}:{})}});}
export function uiToggle(id:string,value:boolean,options:UIControlOptions):UIControlRef<'toggle'>{return create(id,'toggle',options,{value});}
export function uiRange(id:string,value:number,options:UIControlOptions&{min:number;max:number;step:number}):UIControlRef<'range'>{return create(id,'range',options,{value,min:options.min,max:options.max,step:options.step});}
export function uiInput(id:string,value:string,options:UIControlOptions&{maxLength:number}):UIControlRef<'input'>{return create(id,'input',options,{value,maxLength:options.maxLength});}
function wire(ref:UIControlRef<UIControl['kind']>):UIControl {const c=controls.get(ref);ensure(c,'UI_FACTORY','Use real control factories');return parseUIControl(c);}
export function uiScreen(id:string,title:string,refs:readonly UIControlRef<UIControl['kind']>[],background='#102938',options:{overlay?:boolean}={}):UIScreenRef {const value=parseUIScreen({id,title,background,controls:refs.map(wire),...options}),ref=Object.freeze({[screenBrand]:true as const,id:value.id});screens.set(ref,{wire:value,refs:[...refs]});return ref;}
function screen(ref:UIScreenRef){const s=screens.get(ref);ensure(s,'UI_FACTORY','Use real screen factory');return s;}
function member(s:UIScreenRef,c:UIControlRef<UIControl['kind']>):string {ensure(screen(s).refs.includes(c),'UI_MEMBERSHIP','Control belongs to a different screen');return wire(c).id;}
export function uiCatalog(id:string,revision:string,refs:readonly UIScreenRef[]):UICatalog {return parseUICatalog({id,revision,screens:refs.map(r=>screen(r).wire)});}
export function showUI(at:string,s:UIScreenRef){return instruction('ui.show',{at,screen:screen(s).wire.id});}
export function hideUI(at:string){return instruction('ui.hide',{at});}
export function setUIText(at:string,s:UIScreenRef,c:UIControlRef<UIControl['kind']>,value:TypedExpression<'string'>){return instruction('ui.text',{at,screen:s.id,control:member(s,c),value:expressionWire(value)});}
export function setUIVisible(at:string,s:UIScreenRef,c:UIControlRef<UIControl['kind']>,value:TypedExpression<'bool'>){return instruction('ui.visible',{at,screen:s.id,control:member(s,c),value:expressionWire(value)});}
export function setUIEnabled(at:string,s:UIScreenRef,c:UIControlRef<UIControl['kind']>,value:TypedExpression<'bool'>){return instruction('ui.enabled',{at,screen:s.id,control:member(s,c),value:expressionWire(value)});}
export function setUIToggle(at:string,s:UIScreenRef,c:UIControlRef<'toggle'>,value:TypedExpression<'bool'>){ensure(wire(c).kind==='toggle','UI_CONTROL_KIND','Expected toggle');return instruction('ui.toggle',{at,screen:s.id,control:member(s,c),value:expressionWire(value)});}
export function setUIRange(at:string,s:UIScreenRef,c:UIControlRef<'range'>,value:TypedExpression<'i32'>){ensure(wire(c).kind==='range','UI_CONTROL_KIND','Expected range');return instruction('ui.range',{at,screen:s.id,control:member(s,c),value:expressionWire(value)});}
export function setUIInput(at:string,s:UIScreenRef,c:UIControlRef<'input'>,value:TypedExpression<'string'>){ensure(wire(c).kind==='input','UI_CONTROL_KIND','Expected input');return instruction('ui.input',{at,screen:s.id,control:member(s,c),value:expressionWire(value)});}
export function uiField(c:UIControlRef<'toggle'>,dest:Variable<'bool'>):UIFieldRef;
export function uiField(c:UIControlRef<'range'>,dest:Variable<'i32'>):UIFieldRef;
export function uiField(c:UIControlRef<'input'>,dest:Variable<'string'>):UIFieldRef;
export function uiField(c:UIControlRef<'toggle'|'range'|'input'>,dest:Variable<'bool'|'i32'|'string'>):UIFieldRef {const control=wire(c);ensure(control.kind==='toggle'&&dest.kind==='bool'||control.kind==='range'&&dest.kind==='i32'||control.kind==='input'&&dest.kind==='string','UI_SLOT_KIND','Field destination type mismatch');const ref=Object.freeze({[fieldBrand]:true as const});fields.set(ref,{control:c,dest:dest.id});return ref;}
export function waitUI(at:string,s:UIScreenRef,dest:Variable<'string'>,buttons:readonly [{control:UIControlRef<'button'>;target:string},...{control:UIControlRef<'button'>;target:string}[]],outputs:readonly UIFieldRef[]=[]){ensure(dest.kind==='string','UI_SLOT_KIND','Button destination requires string');ensure(wire(buttons[0].control).kind==='button','UI_CONTROL_KIND','Expected button');return instruction('ui.wait',{at,screen:screen(s).wire.id,dest:dest.id,buttons:[{control:member(s,buttons[0].control),target:buttons[0].target},...buttons.slice(1).map(b=>{ensure(wire(b.control).kind==='button','UI_CONTROL_KIND','Expected button');return {control:member(s,b.control),target:b.target};})],fields:outputs.map(ref=>{const f=fields.get(ref);ensure(f,'UI_FACTORY','Use real field factory');return {control:member(s,f.control),dest:f.dest};})});}
