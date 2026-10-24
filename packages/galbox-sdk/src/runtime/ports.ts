import type { Profile, Snapshot, DeepReadonly, SlotMetadata, StoreImport, StoreImportReceipt } from '../protocol/index.js';
import type { ProgressChange, Effect } from '../core/index.js';
export interface ProgressBatch {readonly id:string;readonly baseRevision:number;readonly through:number;readonly changes:readonly DeepReadonly<ProgressChange>[];}
export interface ProgressReceipt {id:string;revision:number;through:number;signature:string;profileId?:string;authority?:string|null;}
export interface Activation {id:string;sequence:number;status:'committed-pending'|'activated'|'superseded';snapshot:Snapshot;profileId?:string;mode?:'initial'|'restore';provenance?:import('../protocol/index.js').JsonValue;owner?:string;initialCommitId?:string|null;onLoad?:import('../protocol/index.js').RestoreRecipe;slot?:string;}
export interface Durable {profile:Profile;head:Activation|null;}
export interface SlotRecord {revision:number;snapshot:Snapshot;previous:Snapshot|null;metadata?:SlotMetadata;previousMetadata?:SlotMetadata;}
export interface SlotSummary {slot:string;revision:number;metadata:SlotMetadata;}
export interface ActivationOptions {profileId?:string;mode?:'initial'|'restore';provenance?:import('../protocol/index.js').JsonValue;owner?:string;onLoad?:import('../protocol/index.js').RestoreRecipe;slot?:string;}
export interface Store {
  read(profileId?:string):Promise<Durable>;
  readSlot(slot:string):Promise<SlotRecord|null>;
  listSlots?():Promise<SlotSummary[]>;
  save(slot:string,snapshot:Snapshot,expectedRevision:number,metadata?:SlotMetadata):Promise<SlotRecord>;
  import?(commit:StoreImport):Promise<StoreImportReceipt>;
  progress(batch:ProgressBatch,authority:string|null):Promise<ProgressReceipt>;
  activate(id:string,snapshot:Snapshot,expectedHead:string|null,expectedRevision:number,initialProgress?:ProgressBatch,options?:ActivationOptions):Promise<Activation>;
  claim?(id:string,owner:string):Promise<Activation>;
  confirm(id:string,owner?:string):Promise<Activation>;
  close():void;
}
export interface HostPort {effect(effect:Effect,epoch:number,report:(task:string,attempt:number,result:'completed'|'blocked'|'failed')=>void):void;}
export interface Scheduler {defer(callback:()=>void):void;}
