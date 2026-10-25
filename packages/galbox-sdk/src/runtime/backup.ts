import {ensure, parsePortableBackup, parseStoreBackupRestore, parseBackupRestoreReceipt, parseProfile} from '../protocol/index.js';
import type {PortableBackup, StoreBackupRestore, BackupRestoreReceipt, SlotMetadata} from '../protocol/index.js';
import type {DatabaseState} from './durable.js';

export function storageNamespace(gameId:string,series:string):string {
  ensure(typeof gameId==='string'&&typeof series==='string'&&/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/.test(gameId)&&/^[a-zA-Z0-9_.-]{1,80}$/.test(series),'STORAGE_NAMESPACE','Expected explicit game and save compatibility series');return JSON.stringify([gameId,series]);
}
function identity(id:string):void {ensure(!['__proto__','constructor','prototype'].includes(id),'BACKUP_IDENTITY',id);}
export function backupClosure(input:unknown):PortableBackup {
  const data=parsePortableBackup(input);ensure(JSON.stringify(data).length<=1_000_000,'BACKUP_SIZE','At most 1000000 JSON characters');const profiles=new Set<string>(),slots=new Set<string>();
  storageNamespace(data.gameId,data.series);
  for(const p of data.profiles){identity(p.id);ensure(!profiles.has(p.id),'BACKUP_PROFILE_DUPLICATE',p.id);profiles.add(p.id);}
  ensure(profiles.has('main'),'BACKUP_PROFILE_MISSING','Main profile is required');
  for(const r of data.slots){identity(r.slot);ensure(!slots.has(r.slot),'BACKUP_SLOT_DUPLICATE',r.slot);slots.add(r.slot);
    ensure(profiles.has(r.metadata.profileId),'BACKUP_PROFILE_MISSING',r.metadata.profileId);
    ensure(r.previous===null?!r.previousMetadata:!!r.previousMetadata,'BACKUP_PREVIOUS_METADATA','Previous snapshot and metadata must travel together');
    if(r.previousMetadata)ensure(profiles.has(r.previousMetadata.profileId),'BACKUP_PROFILE_MISSING',r.previousMetadata.profileId);
  }
  return data;
}
export function captureBackup(state:DatabaseState,gameId:string,series:string,release:string):PortableBackup {
  return backupClosure({format:'galbox-backup',version:1,gameId,series,release,profiles:[{id:'main',profile:state.profile},...Object.entries(state.branches).map(([id,profile])=>({id,profile}))],slots:Object.entries(state.slots).map(([slot,r])=>({...r,slot,metadata:r.metadata??{profileId:'main',label:slot},...(r.previous?{previousMetadata:r.previousMetadata??r.metadata??{profileId:'main',label:slot}}:{})}))});
}
export function commitBackupRestore(state:DatabaseState,input:StoreBackupRestore):BackupRestoreReceipt {
  const commit=parseStoreBackupRestore(input),backup=backupClosure(commit.backup);identity(commit.id);ensure(commit.id.length<=160,'BACKUP_COMMIT_ID','At most 160 characters');
  const signature=JSON.stringify(commit),old=Object.hasOwn(state.backups,commit.id)?state.backups[commit.id]:undefined;
  if(old){ensure(old.signature===signature,'BACKUP_ID_REUSED',commit.id);return parseBackupRestoreReceipt(old);}
  const profiles=backup.profiles.map((p,i)=>({id:p.id,restoredId:`backup:${commit.id}:p${i}`})),slots=backup.slots.map((r,i)=>({slot:r.slot,restoredSlot:`backup:${commit.id}:s${i}`}));
  for(const p of profiles)ensure(!Object.hasOwn(state.branches,p.restoredId),'BACKUP_CONFLICT',p.restoredId);
  for(const s of slots)ensure(!Object.hasOwn(state.slots,s.restoredSlot),'BACKUP_CONFLICT',s.restoredSlot);
  const remap=(metadata:SlotMetadata):SlotMetadata=>{const p=profiles.find(p=>p.id===metadata.profileId);ensure(p,'BACKUP_PROFILE_MISSING',metadata.profileId);return {...metadata,profileId:p.restoredId};};
  // Validate the entire closure and all collisions before changing the transaction candidate.
  const receipt=parseBackupRestoreReceipt({id:commit.id,signature,profiles,slots});
  for(const p of backup.profiles){const mapped=profiles.find(m=>m.id===p.id);ensure(mapped,'BACKUP_PROFILE_MISSING',p.id);state.branches[mapped.restoredId]=parseProfile(p.profile);}
  for(const r of backup.slots){const mapped=slots.find(m=>m.slot===r.slot);ensure(mapped,'BACKUP_SLOT_MISSING',r.slot);state.slots[mapped.restoredSlot]={revision:r.revision,snapshot:r.snapshot,previous:r.previous,metadata:remap(r.metadata),...(r.previousMetadata?{previousMetadata:remap(r.previousMetadata)}:{})};}
  state.backups[commit.id]=receipt;return parseBackupRestoreReceipt(receipt);
}
