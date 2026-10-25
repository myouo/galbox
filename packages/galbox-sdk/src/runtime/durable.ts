import { emptyProfile, parseProfile, parseSnapshot, parseValue, ensure, parseSlotMetadata, parseStoreImport, parseRestoreRecipe, parseProgressBatch, parseJsonValue, parseBackupRestoreReceipt } from '../protocol/index.js';
import type { Profile,SlotMetadata,StoreImport,StoreImportReceipt, BackupRestoreReceipt } from '../protocol/index.js';
import type { Durable, Activation, ProgressBatch, ProgressReceipt, SlotRecord, ActivationOptions } from './ports.js';
export interface DatabaseState {backups:Record<string,BackupRestoreReceipt>;profile:Profile;branches:Record<string,Profile>;slots:Record<string,SlotRecord>;head:Activation|null;activations:Record<string,Activation>;receipts:Record<string,ProgressReceipt>;imports:Record<string,StoreImportReceipt>;}
export function databaseState():DatabaseState {return {backups:{},profile:emptyProfile(),branches:{},slots:{},head:null,activations:{},receipts:{},imports:{}};}
export function object(input:unknown):asserts input is Record<string,unknown> {ensure(typeof input==='object'&&input!==null&&!Array.isArray(input),'STORAGE_CORRUPT','Expected object');}
function key(id:string):void {ensure(typeof id==='string'&&id.length>0&&id.length<=256&&!['__proto__','constructor','prototype'].includes(id)&&!id.includes('\0'),'STORAGE_KEY','Invalid storage identity');}
function own<T>(map:Record<string,T>,id:string):T|undefined {return Object.hasOwn(map,id)?map[id]:undefined;}
export function selectProfile(state:DatabaseState,id=state.head?.profileId??'main'):Profile {key(id);const value=id==='main'?state.profile:own(state.branches,id);ensure(value,'PROFILE_MISSING',id);return value;}
function activation(input:unknown):Activation {
  object(input);ensure(typeof input.id==='string'&&Number.isInteger(input.sequence)&&typeof input.sequence==='number','STORAGE_CORRUPT','Activation');key(input.id);
  const status=input.status;ensure(status==='committed-pending'||status==='activated'||status==='superseded','STORAGE_CORRUPT','Status');
  const profileId=input.profileId??'main',mode=input.mode??'restore';if(typeof input.owner==='string')key(input.owner);ensure(typeof profileId==='string'&&(mode==='initial'||mode==='restore'),'STORAGE_CORRUPT','Activation metadata');key(profileId);
  return {id:input.id,sequence:input.sequence,status,snapshot:parseSnapshot(input.snapshot),profileId,mode,owner:typeof input.owner==='string'?input.owner:input.id,initialCommitId:typeof input.initialCommitId==='string'?input.initialCommitId:null,...(input.provenance!==undefined?{provenance:parseJsonValue(input.provenance)}:{}),...(input.onLoad?{onLoad:parseRestoreRecipe(input.onLoad)}:{}),...(typeof input.slot==='string'?{slot:input.slot}:{})};
}
export function slotRecord(input:unknown):SlotRecord {
  object(input);ensure(Number.isInteger(input.revision)&&typeof input.revision==='number','STORAGE_CORRUPT','Slot revision');return {revision:input.revision,snapshot:parseSnapshot(input.snapshot),previous:input.previous===null?null:parseSnapshot(input.previous),metadata:parseSlotMetadata(input.metadata??{profileId:'main',label:''}),...(input.previousMetadata?{previousMetadata:parseSlotMetadata(input.previousMetadata)}:{})};
}
function importReceipt(input:unknown):StoreImportReceipt {object(input);ensure(typeof input.id==='string'&&typeof input.slot==='string'&&typeof input.profileId==='string'&&typeof input.signature==='string'&&typeof input.revision==='number','STORAGE_CORRUPT','Import receipt');return {id:input.id,slot:input.slot,profileId:input.profileId,signature:input.signature,revision:input.revision};}
export function parseDatabase(input:unknown):DatabaseState {
  if(input===undefined)return databaseState();object(input);object(input.slots);object(input.activations);object(input.receipts);
  const receipts:Record<string,ProgressReceipt>={};
  for(const [id,r]of Object.entries(input.receipts)){key(id);object(r);ensure(typeof r.id==='string'&&typeof r.revision==='number'&&typeof r.through==='number'&&typeof r.signature==='string','STORAGE_CORRUPT','Receipt');if(r.profileId!==undefined)ensure(typeof r.profileId==='string','STORAGE_CORRUPT','Receipt profile');receipts[id]={id:r.id,revision:r.revision,through:r.through,signature:r.signature,...(typeof r.profileId==='string'?{profileId:r.profileId}:{}),...(r.authority===null||typeof r.authority==='string'?{authority:r.authority}:{})};}
  const branches:Record<string,Profile>={},imports:Record<string,StoreImportReceipt>={};
  if(input.branches!==undefined){object(input.branches);for(const [id,p]of Object.entries(input.branches)){key(id);branches[id]=parseProfile(p);}}
  if(input.imports!==undefined){object(input.imports);for(const [id,r]of Object.entries(input.imports)){key(id);imports[id]=importReceipt(r);}}
  const backups:Record<string,BackupRestoreReceipt>={};if(input.backups!==undefined){object(input.backups);for(const [id,r]of Object.entries(input.backups)){key(id);backups[id]=parseBackupRestoreReceipt(r);}}
  const slots:Record<string,SlotRecord>={},activations:Record<string,Activation>={};for(const [id,v]of Object.entries(input.slots)){key(id);slots[id]=slotRecord(v);}for(const [id,v]of Object.entries(input.activations)){key(id);activations[id]=activation(v);}
  return {backups,profile:parseProfile(input.profile),branches,imports,head:input.head===null?null:activation(input.head),slots,activations,receipts};
}
function applyBatch(state:DatabaseState,input:ProgressBatch,profileId:string,authority:string|null):ProgressReceipt {
  const batch=parseProgressBatch(input);
  key(batch.id);const signature=JSON.stringify(batch),existing=own(state.receipts,batch.id);
  if(existing){ensure(existing.signature===signature&&(existing.profileId??'main')===profileId&&(existing.authority===undefined||existing.authority===authority),'COMMIT_ID_REUSED',batch.id);return {...existing};}
  const profile=selectProfile(state,profileId);ensure(profile.revision===batch.baseRevision,'PROFILE_CONFLICT','Reload durable state or explicitly discard local changes');
  ensure(batch.changes.length>0&&batch.through===batch.changes.at(-1)?.seq,'COMMIT_RANGE',batch.id);let previous=0;
  for(const c of batch.changes){ensure(c.seq>previous,'COMMIT_RANGE',batch.id);previous=c.seq;if(c.type==='read'){if(!profile.read.includes(c.unit))profile.read.push(c.unit);}else {ensure(c.type==='set','COMMIT_ACTION','Unknown action');profile.values[c.key]=parseValue(c.value);}}
  profile.revision++;parseProfile(profile);const receipt={id:batch.id,revision:profile.revision,through:batch.through,signature,profileId,authority};state.receipts[batch.id]=receipt;return {...receipt};
}
export function commitProgress(state:DatabaseState,batch:ProgressBatch,authority:string|null):ProgressReceipt {
  const existing=own(state.receipts,batch.id);
  if(existing){ensure(existing.authority===undefined||existing.authority===authority,'SESSION_REVOKED','Receipt belongs to another authority');return applyBatch(state,batch,existing.profileId??'main',authority);}
  ensure((state.head?.owner??state.head?.id??null)===authority,'SESSION_REVOKED','Activation owner changed');return applyBatch(state,batch,state.head?.profileId??'main',authority);
}
export function saveSlot(state:DatabaseState,slot:string,snapshot:unknown,expected:number,metadata?:SlotMetadata):SlotRecord {
  key(slot);const old=own(state.slots,slot);ensure((old?.revision??0)===expected,'SLOT_CONFLICT',slot);const meta=parseSlotMetadata(metadata??{profileId:state.head?.profileId??'main',label:slot});selectProfile(state,meta.profileId);
  ensure(!old||(old.metadata?.profileId??'main')===meta.profileId,'SLOT_PROFILE_CONFLICT','Saving cannot overwrite another profile branch');
  const record:SlotRecord={revision:expected+1,snapshot:parseSnapshot(snapshot),previous:old?.snapshot??null,metadata:meta,...(old?.metadata?{previousMetadata:parseSlotMetadata(old.metadata)}:{})};state.slots[slot]=record;return slotRecord(record);
}
export function commitImport(state:DatabaseState,input:StoreImport):StoreImportReceipt {
  const data=parseStoreImport(input);key(data.id);key(data.slot);const signature=JSON.stringify(data),existing=own(state.imports,data.id);if(existing){ensure(existing.signature===signature,'IMPORT_ID_REUSED',data.id);return {...existing};}
  ensure(data.metadata.profileId===`import:${data.id}`&&data.profile.revision===0,'IMPORT_PROFILE','Import must create a fresh independent profile');key(data.metadata.profileId);
  ensure(!own(state.slots,data.slot)&&!own(state.branches,data.metadata.profileId),'IMPORT_CONFLICT','Import cannot overwrite existing progress');state.branches[data.metadata.profileId]=parseProfile(data.profile);
  const saved=saveSlot(state,data.slot,data.snapshot,0,data.metadata);const receipt={id:data.id,slot:data.slot,profileId:data.metadata.profileId,revision:saved.revision,signature};state.imports[data.id]=receipt;return {...receipt};
}
export function commitActivation(state:DatabaseState,id:string,snapshot:unknown,expectedHead:string|null,revision:number,initialProgress?:ProgressBatch,options:ActivationOptions={}):Activation {
  key(id);key(options.owner??id);const existing=own(state.activations,id),profileId=options.profileId??state.head?.profileId??'main',mode=options.mode??'restore';selectProfile(state,profileId);
  if(existing){ensure(state.head?.id===id&&existing.status!=='superseded','ACTIVATION_SUPERSEDED',id);ensure(JSON.stringify(existing.snapshot)===JSON.stringify(snapshot)&&(existing.profileId??'main')===profileId&&(existing.mode??'restore')===mode&&(existing.initialCommitId??null)===(initialProgress?.id??null)&&JSON.stringify(existing.onLoad??null)===JSON.stringify(options.onLoad??null)&&(existing.slot??null)===(options.slot??null)&&JSON.stringify(existing.provenance??null)===JSON.stringify(options.provenance??null),'ACTIVATION_ID_REUSED',id);if(initialProgress)ensure(own(state.receipts,initialProgress.id)?.signature===JSON.stringify(initialProgress),'ACTIVATION_ID_REUSED',id);return activation(existing);}
  ensure((state.head?.id??null)===expectedHead,'ACTIVATION_CONFLICT','Head changed');ensure(selectProfile(state,profileId).revision===revision,'PROFILE_CONFLICT','Candidate basis changed');if(initialProgress)applyBatch(state,initialProgress,profileId,options.owner??id);
  const next:Activation={id,sequence:(state.head?.sequence??0)+1,status:'committed-pending',snapshot:parseSnapshot(snapshot),profileId,mode,owner:options.owner??id,initialCommitId:initialProgress?.id??null,...(options.provenance!==undefined?{provenance:parseJsonValue(options.provenance)}:{}),...(options.onLoad?{onLoad:parseRestoreRecipe(options.onLoad)}:{}),...(options.slot?{slot:options.slot}:{})};if(state.head){state.head.status='superseded';state.activations[state.head.id]=activation(state.head);}state.head=next;state.activations[id]=activation(next);return activation(next);
}
export function claimActivation(state:DatabaseState,id:string,owner:string):Activation {key(owner);ensure(state.head?.id===id&&state.head.status==='committed-pending','ACTIVATION_SUPERSEDED','Only the current pending activation can be claimed');state.head.owner=owner;state.head.sequence++;state.activations[id]=activation(state.head);return activation(state.head);}
export function confirmActivation(state:DatabaseState,id:string,owner=id):Activation {ensure(state.head?.id===id&&(state.head.owner??state.head.id)===owner&&state.head.status!=='superseded','ACTIVATION_SUPERSEDED',id);state.head.status='activated';state.activations[id]=activation(state.head);return activation(state.head);}
