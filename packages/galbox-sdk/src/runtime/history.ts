import {freezeJson,isDeeplyFrozenJSON} from '../protocol/codecs.js';
import {canonicalParsedJSON} from '../protocol/canonical.js';
import {ensure,parseHistoryPolicy,parseHistoryEntry,parseHistoryRecord,parseHistoryCommit,parseHistoryReceipt,parseTextState,parseSnapshot,canonicalWireJSON} from '../protocol/index.js';
import type {HistoryPolicy,HistoryRecord,HistoryCommit,HistoryEntry,Snapshot,TextState,DeepReadonly} from '../protocol/index.js';
import {wireDigest} from '../protocol/digest.js';
import type {Store} from './ports.js';
export const defaultHistoryPolicy:Readonly<HistoryPolicy>=Object.freeze({maxEntries:32,maxCharacters:500000,rollback:true});
export function historyPolicy(input:Partial<HistoryPolicy>={}):HistoryPolicy {return parseHistoryPolicy({...defaultHistoryPolicy,...input});}
export interface BacklogItem {readonly id:string;readonly text:DeepReadonly<TextState>;readonly canReplay:boolean;readonly canRollback:boolean;readonly rollbackReason:string|null;}
export class HistoryJournal {
 private rows:HistoryEntry[];private revision:number;private sequence=0;private generation=0;private acknowledged=0;private pending:{batch:HistoryCommit;through:number;signature:string}|null=null;
 private readonly index=new Map<string,HistoryEntry>();private readonly textKeys=new Map<string,string>();private readonly rowSizes=new Map<string,number>();private characters=2;
 private readonly frozenTextKeys=new WeakMap<object,string>();private readonly projections=new WeakMap<object,{generation:number;permission:string;item:BacklogItem}>();
 readonly policy:DeepReadonly<HistoryPolicy>;
 constructor(policy:HistoryPolicy,record:HistoryRecord,readonly profileId:string,readonly authority:string|null,readonly scope:string,private readonly store:Store){this.policy=Object.freeze(parseHistoryPolicy(policy));const copy=parseHistoryRecord(record);this.rows=copy.entries;this.revision=copy.revision;for(const entry of this.rows)this.register(entry);}
 get durable():boolean {return !!this.store.commitHistory&&!!this.store.readHistory&&!!this.store.historyReceipt;}
 get dirty():boolean {return this.generation!==this.acknowledged;}
 private register(entry:HistoryEntry):void {freezeJson(entry);this.index.set(entry.id,entry);this.textKeys.set(entry.id,canonicalParsedJSON(entry.text));const size=JSON.stringify(entry).length;this.rowSizes.set(entry.id,size);this.characters+=size+(this.index.size>1?1:0);}
 private remove(id:string):void {const size=this.rowSizes.get(id);if(size===undefined)return;this.characters-=size+(this.index.size>1?1:0);this.index.delete(id);this.textKeys.delete(id);this.rowSizes.delete(id);}
 confirmed(snapshot:Snapshot|null,text:DeepReadonly<TextState>,reason:string|null,release:string):void {
  ensure(text.historyId,'HISTORY_ID','Confirmation has no history identity');const fits=snapshot&&JSON.stringify(snapshot).length+JSON.stringify(text).length<this.policy.maxCharacters;let entry=parseHistoryEntry({id:text.historyId,release,text,snapshot:fits?snapshot:null,reason:fits?null:snapshot?'CHECKPOINT_BUDGET':reason??'CHECKPOINT_UNAVAILABLE'});
  if(JSON.stringify(entry).length>this.policy.maxCharacters)entry=parseHistoryEntry({...entry,snapshot:null,reason:'CHECKPOINT_BUDGET'});
  this.remove(entry.id);this.rows=this.rows.filter(e=>e.id!==entry.id);this.rows.push(entry);this.register(entry);while(this.rows.length>this.policy.maxEntries||this.characters>this.policy.maxCharacters){const removed=this.rows.shift();if(removed)this.remove(removed.id);else break;}this.generation++;
 }
 items(history:readonly DeepReadonly<TextState>[],canSave:boolean,saveReason:string|null,release?:string):BacklogItem[]{const permission=JSON.stringify([canSave,saveReason,release??null]);return history.slice(-this.policy.maxEntries).map((text,index)=>{const id=text.historyId??`legacy:${index}:${text.prompt}`,trusted=isDeeplyFrozenJSON(text),cached=trusted?this.projections.get(text):undefined;if(cached&&cached.generation===this.generation&&cached.permission===permission&&cached.item.id===id)return cached.item;const point=text.historyId?this.index.get(text.historyId):undefined;let key=trusted?this.frozenTextKeys.get(text):undefined;if(point&&key===undefined){key=trusted?canonicalParsedJSON(text):canonicalWireJSON(text);if(trusted)this.frozenTextKeys.set(text,key);}const matching=point&&this.textKeys.get(point.id)===key,reason=!this.policy.rollback?'ROLLBACK_DISABLED':!canSave?saveReason??'SAVE_UNAVAILABLE':!text.historyId?'LEGACY_HISTORY':!matching?'CHECKPOINT_EXPIRED':release&&point.release!==release?'RELEASE_UNAVAILABLE':point.reason;const item=Object.freeze({id,text:trusted?text:freezeJson(parseTextState(text)),canReplay:!!text.voice,canRollback:reason===null&&!!point?.snapshot,rollbackReason:reason});if(trusted)this.projections.set(text,{generation:this.generation,permission,item});return item;});}
 checkpoint(id:string,history:readonly DeepReadonly<TextState>[]):Snapshot {ensure(this.policy.rollback,'ROLLBACK_DISABLED','Rollback disabled by instance policy');const text=history.find(t=>t.historyId===id),entry=this.index.get(id);ensure(text&&entry&&canonicalWireJSON(text)===canonicalWireJSON(entry.text),'HISTORY_CHECKPOINT_MISSING','No checkpoint for the current history identity');ensure(entry.snapshot,'HISTORY_CHECKPOINT_UNAVAILABLE',entry.reason??'Checkpoint unavailable');return parseSnapshot(entry.snapshot);}
 async flush():Promise<void>{
  if(!this.durable){this.acknowledged=this.generation;return;}const commit=this.store.commitHistory?.bind(this.store),read=this.store.readHistory?.bind(this.store);ensure(commit&&read,'HISTORY_STORAGE','Missing history port');
  if(!this.pending&&this.dirty){const batch=parseHistoryCommit({id:`${this.scope}:h${++this.sequence}`,profileId:this.profileId,baseRevision:this.revision,entries:this.rows});freezeJson(batch);this.pending={batch,through:this.generation,signature:wireDigest(batch)};}
  if(!this.pending)return;const pending=this.pending,signature=pending.signature;let receipt;
  try{receipt=await commit(parseHistoryCommit(pending.batch),this.authority);}catch(error){receipt=await this.store.historyReceipt?.(pending.batch.id);if(!receipt)throw error;}
  const checked=parseHistoryReceipt(receipt);ensure(checked.id===pending.batch.id&&checked.profileId===this.profileId&&checked.authority===this.authority&&checked.signature===signature&&checked.revision===this.revision+1,'HISTORY_RECEIPT','Receipt differs from immutable journal batch');this.revision=checked.revision;this.acknowledged=pending.through;this.pending=null;
 }
}
