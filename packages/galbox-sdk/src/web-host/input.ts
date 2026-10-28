import {parseInputPreferences} from '../protocol/index.js';
import type {InputPreferences} from '../protocol/index.js';
interface InputState {epoch:number;prompt:number|null;text:boolean;playing:boolean;paused:boolean;menu:boolean;history:boolean;}
export interface InputActions {state():InputState;advance(prompt:number,epoch:number):void;menu():void;auto():void;skip(value:boolean):void;quickSave():void;quickLoad():void;history():void;}
const keyboardActions=['advance','menu','auto','skip','quickSave','quickLoad'] as const;
type Action=typeof keyboardActions[number];
export class InputController {
 private readonly roots=new Map<HTMLElement,{refs:number;remove:()=>void}>();
 private wheelLast=-Infinity;private wheelSum=0;private wheelSpent=true;private wheelEpoch=-1;private wheelPrompt:number|null=null;private wheelDirection=0;
 private held=new Map<string,{action:Action;epoch:number;prompt:number|null}>();private skips=new Set<string>();private bindings:InputPreferences;
 constructor(private readonly actions:InputActions,bindings:InputPreferences){this.bindings=parseInputPreferences(bindings);}
 configure(input:InputPreferences):void {this.clear();this.bindings=parseInputPreferences(input);}
 clear():void {this.wheelSum=0;this.wheelSpent=true;this.held.clear();if(this.skips.size){this.skips.clear();this.actions.skip(false);}}
 attach(root:HTMLElement):()=>void {
  const existing=this.roots.get(root);if(existing)existing.refs++;else {
   const assigned=!root.hasAttribute('tabindex');if(assigned)root.tabIndex=0;
   const wheel=(e:WheelEvent)=>this.wheel(e,root),down=(e:KeyboardEvent)=>this.down(e),up=(e:KeyboardEvent)=>this.up(e),pointer=(e:PointerEvent)=>{if(!(e.target instanceof Element)||!e.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))root.focus({preventScroll:true});},out=(e:FocusEvent)=>{const target=e.relatedTarget;if(!(target instanceof Node)||![...this.roots.keys()].some(r=>r.contains(target)))this.clear();};
   root.addEventListener('wheel',wheel,{passive:false});root.addEventListener('keydown',down);root.addEventListener('keyup',up);root.addEventListener('pointerdown',pointer);root.addEventListener('focusout',out);
   this.roots.set(root,{refs:1,remove:()=>{root.removeEventListener('wheel',wheel);root.removeEventListener('keydown',down);root.removeEventListener('keyup',up);root.removeEventListener('pointerdown',pointer);root.removeEventListener('focusout',out);if(assigned&&root.getAttribute('tabindex')==='0')root.removeAttribute('tabindex');}});
  }
  let released=false;return ()=>{if(released)return;released=true;const state=this.roots.get(root);if(state&&--state.refs===0){state.remove();this.roots.delete(root);this.clear();}};
 }
 private wheel(event:WheelEvent,root:HTMLElement):void {
  if(event.defaultPrevented)return;
  const now=performance.now(),state=this.actions.state(),target=event.target;
  const cancel=()=>{this.wheelLast=now;this.wheelSum=0;this.wheelSpent=true;};
  if(this.bindings.wheel===false||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||!Number.isFinite(event.deltaY)||!Number.isFinite(event.deltaX)||event.deltaY===0||Math.abs(event.deltaX)>=Math.abs(event.deltaY)||![0,1,2].includes(event.deltaMode)){cancel();return;}
  if(!state.playing||state.paused||state.menu||!state.text||state.prompt===null||!(target instanceof Element)||target.closest('button,a,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-galbox-system-dialog]')){cancel();return;}
  for(let node:Element|null=target;node&&root.contains(node);node=node.parentElement){const overflow=getComputedStyle(node).overflowY;if(node.scrollHeight>node.clientHeight+1&&['auto','scroll'].includes(overflow)){cancel();return;}if(node===root)break;}
  const direction=Math.sign(event.deltaY);if(direction<0&&!state.history){cancel();return;}
  event.preventDefault();
  if(now-this.wheelLast>=220){this.wheelSum=0;this.wheelSpent=false;this.wheelEpoch=state.epoch;this.wheelPrompt=state.prompt;this.wheelDirection=direction;}
  this.wheelLast=now;
  if(this.wheelSpent)return;
  if(state.epoch!==this.wheelEpoch||state.prompt!==this.wheelPrompt||direction!==this.wheelDirection){this.wheelSpent=true;this.wheelSum=0;return;}
  const unit=event.deltaMode===1?16:event.deltaMode===2?Math.max(1,root.clientHeight||root.ownerDocument.documentElement.clientHeight):1;
  this.wheelSum+=Math.min(960,Math.abs(event.deltaY)*unit);if(this.wheelSum<48)return;
  this.wheelSpent=true;
  if(direction>0)this.actions.advance(state.prompt,state.epoch);else this.actions.history();
 }
 private editable(target:EventTarget|null):boolean{return target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable="true"]');}
 private down(event:KeyboardEvent):void {
  if(this.editable(event.target)||event.defaultPrevented||event.target instanceof Element&&event.target.closest('[data-galbox-system-dialog]'))return;if(event.target instanceof Element&&event.target.closest('button,a,[role=button]')&&(event.key==='Enter'||event.key===' '))return;const state=this.actions.state(),action=keyboardActions.find(k=>this.bindings[k].some(code=>code===event.code));if(!action)return;
  if(action==='skip'){if(!state.playing||state.paused||state.menu)return;event.preventDefault();if(event.repeat)return;this.skips.add(event.code);this.actions.skip(true);return;}
  if(event.ctrlKey||event.altKey||event.metaKey)return;
  if(action==='advance'&&(event.target instanceof Element&&!!event.target.closest('button,a,[role="button"]')||!state.text||state.paused||state.menu||!state.playing))return;
  event.preventDefault();if(event.repeat||this.held.has(event.code))return;this.held.set(event.code,{action,epoch:state.epoch,prompt:state.prompt});
 }
 private up(event:KeyboardEvent):void {
  if(this.skips.delete(event.code)){event.preventDefault();if(!this.skips.size)this.actions.skip(false);return;}
  const held=this.held.get(event.code);this.held.delete(event.code);if(!held)return;event.preventDefault();if(this.editable(event.target))return;const state=this.actions.state();if(state.epoch!==held.epoch)return;
  switch(held.action){case 'advance':if(state.playing&&!state.paused&&!state.menu&&state.text&&state.prompt===held.prompt&&held.prompt!==null)this.actions.advance(held.prompt,held.epoch);break;case 'menu':this.actions.menu();break;case 'auto':this.actions.auto();break;case 'quickSave':this.actions.quickSave();break;case 'quickLoad':this.actions.quickLoad();break;}
 }
 dispose():void {this.clear();for(const r of this.roots.values())r.remove();this.roots.clear();}
}
