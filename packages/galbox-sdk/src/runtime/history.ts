import {ensure,parseHistoryPolicy,parseHistoryEntry,parseHistoryRecord,parseHistoryCommit,parseHistoryReceipt,parseTextState,parseSnapshot,canonicalWireJSON} from '../protocol/index.js';
import type {HistoryPolicy,HistoryRecord,HistoryCommit,HistoryEntry,Snapshot,TextState,DeepReadonly} from '../protocol/index.js';
import {wireDigest} from '../protocol/digest.js';
import type {Store} from './ports.js';
export const defaultHistoryPolicy:Readonly<HistoryPolicy>=Object.freeze({maxEntries:32,maxCharacters:500000,rollback:true});
export function historyPolicy(input:Partial<HistoryPolicy>={}):HistoryPolicy {return parseHistoryPolicy({...defaultHistoryPolicy,...input});}
export interface BacklogItem {readonly id:string;readonly text:DeepReadonly<TextState>;readonly canReplay:boolean;readonly canRollback:boolean;readonly rollbackReason:string|null;}
export class HistoryJournal {
 private rows:HistoryEntry[];private revision:number;private sequence=0;private generation=0;private acknowledged=0;private pending:{batch:HistoryCommit;through:number}|null=null;
 readonly policy:DeepReadonly<HistoryPolicy>;
 constructor(policy:HistoryPolicy,record:HistoryRecord,readonly profileId:string,readonly authority:string|null,readonly scope:string,private readonly store:Store){this.policy=Object.freeze(parseHistoryPolicy(policy));const copy=parseHistoryRecord(record);this.rows=copy.entries;this.revision=copy.revision;}
 get durable():boolean {return !!this.store.commitHistory&&!!this.store.readHistory&&!!this.store.historyReceipt;}
 get dirty():boolean {return this.generation!==this.acknowledged;}
 confirmed(snapshot:Snapshot|null,text:DeepReadonly<TextState>,reason:string|null,release:string):void {
  ensure(text.historyId,'HISTORY_ID','Confirmation has no history identity');const fits=snapshot&&JSON.stringify(snapshot).length+JSON.stringify(text).length<this.policy.maxCharacters;let entry=parseHistoryEntry({id:text.historyId,release,text:parseTextState(text),snapshot:fits?parseSnapshot(snapshot):null,reason:fits?null:snapshot?'CHECKPOINT_BUDGET':reason??'CHECKPOINT_UNAVAILABLE'});
  if(JSON.stringify(entry).length>this.policy.maxCharacters)entry=parseHistoryEntry({...entry,snapshot:null,reason:'CHECKPOINT_BUDGET'});
  this.rows=this.rows.filter(e=>e.id!==entry.id);this.rows.push(entry);while(this.rows.length>this.policy.maxEntries||JSON.stringify(this.rows).length>this.policy.maxCharacters)this.rows.shift();this.generation++;
 }
 items(history:readonly DeepReadonly<TextState>[],canSave:boolean,saveReason:string|null,release?:string):BacklogItem[]{return history.slice(-this.policy.maxEntries).map((text,index)=>{const id=text.historyId??`legacy:${index}:${text.prompt}`,point=text.historyId?this.rows.find(e=>e.id===text.historyId):undefined,matching=point&&canonicalWireJSON(point.text)===canonicalWireJSON(text),reason=!this.policy.rollback?'ROLLBACK_DISABLED':!canSave?saveReason??'SAVE_UNAVAILABLE':!text.historyId?'LEGACY_HISTORY':!matching?'CHECKPOINT_EXPIRED':release&&point.release!==release?'RELEASE_UNAVAILABLE':point.reason;return {id,text:parseTextState(text),canReplay:!!text.voice,canRollback:reason===null&&!!point?.snapshot,rollbackReason:reason};});}
 checkpoint(id:string,history:readonly DeepReadonly<TextState>[]):Snapshot {ensure(this.policy.rollback,'ROLLBACK_DISABLED','Rollback disabled by instance policy');const text=history.find(t=>t.historyId===id),entry=this.rows.find(e=>e.id===id);ensure(text&&entry&&canonicalWireJSON(text)===canonicalWireJSON(entry.text),'HISTORY_CHECKPOINT_MISSING','No checkpoint for the current history identity');ensure(entry.snapshot,'HISTORY_CHECKPOINT_UNAVAILABLE',entry.reason??'Checkpoint unavailable');return parseSnapshot(entry.snapshot);}
 async flush():Promise<void>{
  if(!this.durable){this.acknowledged=this.generation;return;}const commit=this.store.commitHistory?.bind(this.store),read=this.store.readHistory?.bind(this.store);ensure(commit&&read,'HISTORY_STORAGE','Missing history port');
  if(!this.pending&&this.dirty)this.pending={batch:parseHistoryCommit({id:`${this.scope}:h${++this.sequence}`,profileId:this.profileId,baseRevision:this.revision,entries:this.rows}),through:this.generation};
  if(!this.pending)return;const pending=this.pending,signature=wireDigest(pending.batch);let receipt;
  try{receipt=await commit(parseHistoryCommit(pending.batch),this.authority);}catch(error){receipt=await this.store.historyReceipt?.(pending.batch.id);if(!receipt)throw error;}
  const checked=parseHistoryReceipt(receipt);ensure(checked.id===pending.batch.id&&checked.profileId===this.profileId&&checked.authority===this.authority&&checked.signature===signature&&checked.revision===this.revision+1,'HISTORY_RECEIPT','Receipt differs from immutable journal batch');this.revision=checked.revision;this.acknowledged=pending.through;this.pending=null;
 }
}
