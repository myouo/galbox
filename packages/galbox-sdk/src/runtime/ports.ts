import type { Profile, Snapshot, DeepReadonly } from '../protocol/index.js';
import type { ProgressChange, Effect } from '../core/index.js';
export interface ProgressBatch {readonly id:string;readonly baseRevision:number;readonly through:number;readonly changes:readonly DeepReadonly<ProgressChange>[];}
export interface ProgressReceipt {id:string;revision:number;through:number;signature:string;}
export interface Activation {id:string;sequence:number;status:'committed-pending'|'activated'|'superseded';snapshot:Snapshot;}
export interface Durable {profile:Profile;head:Activation|null;}
export interface SlotRecord {revision:number;snapshot:Snapshot;previous:Snapshot|null;}
export interface Store {
  read():Promise<Durable>;
  readSlot(slot:string):Promise<SlotRecord|null>;
  save(slot:string,snapshot:Snapshot,expectedRevision:number):Promise<SlotRecord>;
  progress(batch:ProgressBatch,authority:string|null):Promise<ProgressReceipt>;
  activate(id:string,snapshot:Snapshot,expectedHead:string|null,expectedRevision:number,initialProgress?:ProgressBatch):Promise<Activation>;
  confirm(id:string):Promise<Activation>;
  close():void;
}
export interface HostPort {effect(effect:Effect,epoch:number,report:(task:string,attempt:number,result:'completed'|'blocked'|'failed')=>void):void;}
export interface Scheduler {defer(callback:()=>void):void;}
