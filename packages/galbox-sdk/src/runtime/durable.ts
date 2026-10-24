import { emptyProfile, parseProfile, parseSnapshot, parseValue, ensure } from '../protocol/index.js';
import type { Durable, Activation, ProgressBatch, ProgressReceipt, SlotRecord } from './ports.js';
export interface DatabaseState {profile:Durable['profile'];slots:Record<string,SlotRecord>;head:Activation|null;activations:Record<string,Activation>;receipts:Record<string,ProgressReceipt>;}
export function databaseState():DatabaseState {return {profile:emptyProfile(),slots:{},head:null,activations:{},receipts:{}};}
export function object(input:unknown):asserts input is Record<string,unknown> {ensure(typeof input==='object'&&input!==null&&!Array.isArray(input),'STORAGE_CORRUPT','Expected object');}
function activation(input:unknown):Activation {
  object(input);ensure(typeof input.id==='string'&&typeof input.sequence==='number'&&['committed-pending','activated','superseded'].includes(String(input.status)),'STORAGE_CORRUPT','Activation');
  const status=input.status;ensure(status==='committed-pending'||status==='activated'||status==='superseded','STORAGE_CORRUPT','Status');
  return {id:input.id,sequence:input.sequence,status,snapshot:parseSnapshot(input.snapshot)};
}
export function slotRecord(input:unknown):SlotRecord {
  object(input);ensure(Number.isInteger(input.revision)&&typeof input.revision==='number','STORAGE_CORRUPT','Slot revision');return {revision:input.revision,snapshot:parseSnapshot(input.snapshot),previous:input.previous===null?null:parseSnapshot(input.previous)};
}
export function parseDatabase(input:unknown):DatabaseState {
  if(input===undefined)return databaseState();object(input);object(input.slots);object(input.activations);object(input.receipts);
  const receipts:Record<string,ProgressReceipt>={};
  for(const [id,r]of Object.entries(input.receipts)){object(r);ensure(typeof r.id==='string'&&typeof r.revision==='number'&&typeof r.through==='number'&&typeof r.signature==='string','STORAGE_CORRUPT','Receipt');receipts[id]={id:r.id,revision:r.revision,through:r.through,signature:r.signature};}
  return {profile:parseProfile(input.profile),head:input.head===null?null:activation(input.head),slots:Object.fromEntries(Object.entries(input.slots).map(([k,v])=>[k,slotRecord(v)])),activations:Object.fromEntries(Object.entries(input.activations).map(([k,v])=>[k,activation(v)])),receipts};
}
export function commitProgress(state:DatabaseState,batch:ProgressBatch,authority:string|null):ProgressReceipt {
  const signature=JSON.stringify(batch);const existing=state.receipts[batch.id];
  if(existing){ensure(existing.signature===signature,'COMMIT_ID_REUSED',batch.id);return {...existing};}
  ensure((state.head?.id??null)===authority,'SESSION_REVOKED','Activation head changed');
  ensure(state.profile.revision===batch.baseRevision,'PROFILE_CONFLICT','Reload durable state or explicitly discard local changes');
  ensure(batch.changes.length>0&&batch.through===batch.changes.at(-1)?.seq,'COMMIT_RANGE',batch.id);
  let previous=0;
  for(const c of batch.changes){ensure(c.seq>previous,'COMMIT_RANGE',batch.id);previous=c.seq;if(c.type==='read'){if(!state.profile.read.includes(c.unit))state.profile.read.push(c.unit);}else state.profile.values[c.key]=parseValue(c.value);}
  state.profile.revision++;
  const receipt={id:batch.id,revision:state.profile.revision,through:batch.through,signature};state.receipts[batch.id]=receipt;return {...receipt};
}
export function saveSlot(state:DatabaseState,slot:string,snapshot:unknown,expected:number):SlotRecord {
  ensure((state.slots[slot]?.revision??0)===expected,'SLOT_CONFLICT',slot);
  const record={revision:expected+1,snapshot:parseSnapshot(snapshot),previous:state.slots[slot]?.snapshot??null};state.slots[slot]=record;return slotRecord(record);
}
export function commitActivation(state:DatabaseState,id:string,snapshot:unknown,expectedHead:string|null,revision:number,initialProgress?:ProgressBatch):Activation {
  const existing=state.activations[id];
  if(existing){ensure(state.head?.id===id&&existing.status!=='superseded','ACTIVATION_SUPERSEDED',id);ensure(JSON.stringify(existing.snapshot)===JSON.stringify(snapshot),'ACTIVATION_ID_REUSED',id);if(initialProgress)ensure(state.receipts[initialProgress.id]?.signature===JSON.stringify(initialProgress),'ACTIVATION_ID_REUSED',id);return activation(existing);}
  ensure((state.head?.id??null)===expectedHead,'ACTIVATION_CONFLICT','Head changed');ensure(state.profile.revision===revision,'PROFILE_CONFLICT','Candidate basis changed');
  if(initialProgress)commitProgress(state,initialProgress,expectedHead);
  const next:Activation={id,sequence:(state.head?.sequence??0)+1,status:'committed-pending',snapshot:parseSnapshot(snapshot)};
  if(state.head){state.head.status='superseded';state.activations[state.head.id]=activation(state.head);}
  state.head=next;state.activations[id]=activation(next);return activation(next);
}
export function confirmActivation(state:DatabaseState,id:string):Activation {
  ensure(state.head?.id===id&&state.head.status!=='superseded','ACTIVATION_SUPERSEDED',id);state.head.status='activated';state.activations[id]=activation(state.head);return activation(state.head);
}
