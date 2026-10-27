import type { Profile, Snapshot, DeepReadonly, SlotMetadata, StoreImport, StoreImportReceipt, PortableBackup, StoreBackupRestore, BackupRestoreReceipt, PlayerPreferences, PreferencesRecord, SaveCommit, SaveReceipt,HistoryCommit,HistoryRecord,HistoryReceipt } from '../protocol/index.js';
import type { ProgressChange, Effect } from '../core/index.js';
export interface ProgressBatch {readonly id:string;readonly baseRevision:number;readonly through:number;readonly changes:readonly DeepReadonly<ProgressChange>[];}
export interface ProgressReceipt {id:string;revision:number;through:number;signature:string;profileId?:string;authority?:string|null;}
export interface Activation {id:string;sequence:number;status:'committed-pending'|'activated'|'superseded';snapshot:Snapshot;profileId?:string;mode?:'initial'|'restore';provenance?:import('../protocol/index.js').JsonValue;owner?:string;initialCommitId?:string|null;onLoad?:import('../protocol/index.js').RestoreRecipe;slot?:string;}
export interface Durable {profile:Profile;head:Activation|null;}
export interface SlotRecord {revision:number;snapshot:Snapshot;previous:Snapshot|null;metadata?:SlotMetadata;previousMetadata?:SlotMetadata;}
export interface SlotSummary {slot:string;revision:number;metadata:SlotMetadata;hasPrevious?:boolean;}
export interface ActivationOptions {profileId?:string;mode?:'initial'|'restore';provenance?:import('../protocol/index.js').JsonValue;owner?:string;onLoad?:import('../protocol/index.js').RestoreRecipe;slot?:string;}
export interface Store {
  historyReceipt?(id:string):Promise<HistoryReceipt|null>;
  readHistory?(profileId:string):Promise<HistoryRecord>;
  commitHistory?(batch:HistoryCommit,authority:string|null):Promise<HistoryReceipt>;
  commitSave?(commit:SaveCommit):Promise<SaveReceipt>;
  saveReceipt?(id:string):Promise<SaveReceipt|null>;
  renameSlot?(slot:string,expectedRevision:number,label:string):Promise<SlotRecord>;
  deleteSlot?(slot:string,expectedRevision:number):Promise<void>;
  readPreferences?():Promise<PreferencesRecord|null>;
  writePreferences?(value:PlayerPreferences,expectedRevision:number):Promise<PreferencesRecord>;
  backup?(gameId:string,series:string,release:string):Promise<PortableBackup>;
  restoreBackup?(commit:StoreBackupRestore):Promise<BackupRestoreReceipt>;
  read(profileId?:string):Promise<Durable>;
  readSlot(slot:string):Promise<SlotRecord|null>;
  listProfiles?():Promise<{profileId:string;revision:number}[]>;
  listSlots?():Promise<SlotSummary[]>;
  save(slot:string,snapshot:Snapshot,expectedRevision:number,metadata?:SlotMetadata):Promise<SlotRecord>;
  import?(commit:StoreImport):Promise<StoreImportReceipt>;
  progress(batch:ProgressBatch,authority:string|null):Promise<ProgressReceipt>;
  activate(id:string,snapshot:Snapshot,expectedHead:string|null,expectedRevision:number,initialProgress?:ProgressBatch,options?:ActivationOptions):Promise<Activation>;
  claim?(id:string,owner:string):Promise<Activation>;
  confirm(id:string,owner?:string):Promise<Activation>;
  close():void;
}
export interface HostPreparation {readonly ready:Promise<void>;commit():void;cancel():void;}
export interface HostPort {prepare?(snapshot:DeepReadonly<Snapshot>,effects:readonly Effect[]):HostPreparation|void;effect(effect:Effect,epoch:number,report:(task:string,attempt:number,result:'completed'|'blocked'|'failed')=>void,playbackEnded?:(task:string,attempt:number)=>void):void;}
export interface Scheduler {defer(callback:()=>void):void;}
