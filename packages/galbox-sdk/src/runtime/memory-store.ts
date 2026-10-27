import { parseProfile, parseSnapshot, emptyProfile, ensure, parseSaveCommit,parseHistoryCommit } from '../protocol/index.js';
import type { Snapshot, SlotMetadata, StoreImport, StoreBackupRestore, PlayerPreferences,SaveCommit,HistoryCommit } from '../protocol/index.js';
import type { Store, ProgressBatch, Durable, SlotRecord, HostPort, Scheduler, ActivationOptions } from '../runtime/ports.js';
import { databaseState, parseDatabase, commitProgress, saveSlot, commitActivation, confirmActivation, commitImport, selectProfile, claimActivation, commitPreferences,commitSave,saveReceipt,renameSlot,deleteSlot,readHistory,commitHistory,historyReceipt } from '../runtime/durable.js';
import {captureBackup,commitBackupRestore,storageNamespace} from '../runtime/backup.js';
export class MemoryStore implements Store {
  private state=databaseState();
  constructor(private readonly namespace?:string,profile:unknown=emptyProfile()) {this.state.profile=parseProfile(profile);}
  private commitState(s:ReturnType<typeof databaseState>):void {ensure(JSON.stringify(s).length<=4_000_000,'STORAGE_SIZE','Namespace exceeds 4M JSON character budget');this.state=s;}
  async backup(gameId:string,series:string,release:string){ensure(!this.namespace||this.namespace===storageNamespace(gameId,series),'BACKUP_NAMESPACE','Backup identity must match storage');return captureBackup(parseDatabase(this.state),gameId,series,release);}
  async restoreBackup(commit:StoreBackupRestore){ensure(!this.namespace||this.namespace===storageNamespace(commit.backup.gameId,commit.backup.series),'BACKUP_NAMESPACE','Restore identity must match storage');const s=parseDatabase(this.state),r=commitBackupRestore(s,commit);this.commitState(s);return r;}
  async readHistory(id:string){return readHistory(parseDatabase(this.state),id);}
  async historyReceipt(id:string){return historyReceipt(parseDatabase(this.state),id);}
  async commitHistory(input:HistoryCommit,authority:string|null){const s=parseDatabase(this.state),r=commitHistory(s,input,authority);this.commitState(s);return r;}
  async commitSave(input:SaveCommit){const data=parseSaveCommit(input),s=parseDatabase(this.state),r=commitSave(s,data);ensure(JSON.stringify(s).length<=4_000_000,'STORAGE_SIZE','Namespace exceeds 4M JSON character budget');this.commitState(s);return r;}
  async saveReceipt(id:string){return saveReceipt(parseDatabase(this.state),id);}
  async renameSlot(slot:string,revision:number,label:string){const s=parseDatabase(this.state),r=renameSlot(s,slot,revision,label);this.commitState(s);return r;}
  async deleteSlot(slot:string,revision:number){const s=parseDatabase(this.state);deleteSlot(s,slot,revision);this.commitState(s);}
  async readPreferences(){return parseDatabase(this.state).preferences;}
  async writePreferences(value:PlayerPreferences,revision:number){const s=parseDatabase(this.state),r=commitPreferences(s,value,revision);this.commitState(s);return r;}
  async read(profileId?:string):Promise<Durable> {const s=parseDatabase(this.state);return {profile:selectProfile(s,profileId),head:s.head};}
  async readSlot(slot:string):Promise<SlotRecord|null> {const s=parseDatabase(this.state);return Object.hasOwn(s.slots,slot)?s.slots[slot]??null:null;}
  async listProfiles(){const s=parseDatabase(this.state);return [{profileId:'main',revision:s.profile.revision},...Object.entries(s.branches).map(([profileId,p])=>({profileId,revision:p.revision}))];}
  async listSlots(){const s=parseDatabase(this.state);return Object.entries(s.slots).map(([slot,r])=>({slot,revision:r.revision,hasPrevious:r.previous!==null,metadata:r.metadata??{profileId:'main',label:slot}}));}
  async import(commit:StoreImport){const s=parseDatabase(this.state);const r=commitImport(s,commit);this.commitState(s);return r;}
  async save(slot:string,snapshot:Snapshot,expected:number,metadata?:SlotMetadata){const s=parseDatabase(this.state);const r=saveSlot(s,slot,snapshot,expected,metadata);this.commitState(s);return r;}
  async progress(batch:ProgressBatch,authority:string|null){const s=parseDatabase(this.state);const r=commitProgress(s,batch,authority);this.commitState(s);return r;}
  async activate(id:string,snapshot:Snapshot,head:string|null,revision:number,initialProgress?:ProgressBatch,options?:ActivationOptions){const s=parseDatabase(this.state);const r=commitActivation(s,id,snapshot,head,revision,initialProgress,options);this.commitState(s);return r;}
  async claim(id:string,owner:string){const s=parseDatabase(this.state);const r=claimActivation(s,id,owner);this.commitState(s);return r;}
  async confirm(id:string,owner?:string){const s=parseDatabase(this.state);const r=confirmActivation(s,id,owner);this.commitState(s);return r;}
  close():void {}
}
