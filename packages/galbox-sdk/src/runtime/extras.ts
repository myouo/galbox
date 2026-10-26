import {extrasProgress,extraCondition} from '../protocol/extras.js';
import type {DeepReadonly,Program,Profile,ExtraEntry} from '../protocol/index.js';
export interface ExtraView {readonly id:string;readonly kind:ExtraEntry['kind'];readonly title:string;readonly description:string;readonly unlocked:boolean;readonly canOpen:boolean;readonly variants:number;readonly hasIcon:boolean;readonly reason:'locked'|'scene-gate'|'achievement'|'busy'|'save-unavailable'|null;}
export interface ExtrasView {readonly id:string;readonly revision:string;readonly available:boolean;readonly error:string|null;readonly entries:readonly ExtraView[];}
export function projectExtras(program:DeepReadonly<Program>,profile:DeepReadonly<Profile>,enabled:boolean,canSave:boolean,signature?:string|null):ExtrasView|null {
 const catalog=program.extras;if(!catalog)return null;
 try{const progress=extrasProgress(program,profile,signature);if(!progress)return null;const entries=catalog.entries.map(e=>{const unlocked=progress.unlocked.includes(e.id)||extraCondition(e,profile);let reason:ExtraView['reason']=!unlocked?'locked':e.kind==='achievement'?'achievement':!enabled?'busy':!canSave?'save-unavailable':null;const visible=e.reveal==='always'||unlocked;return Object.freeze({id:e.id,kind:e.kind,title:visible?e.title:e.kind==='achievement'?'未达成成就':'未解锁内容',description:visible?e.description:'继续阅读以解锁。',unlocked,canOpen:reason===null,variants:e.kind==='cg'?e.images.length:0,hasIcon:e.kind==='achievement'&&!!e.icon,reason});});return Object.freeze({id:catalog.id,revision:catalog.revision,available:true,error:null,entries:Object.freeze(entries)});}
 catch(error){return Object.freeze({id:catalog.id,revision:catalog.revision,available:false,error:String(error),entries:Object.freeze([])});}
}
