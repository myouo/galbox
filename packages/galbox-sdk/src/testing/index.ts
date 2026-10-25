import { parseProfile, parseSnapshot, ensure } from '../protocol/index.js';
import type { Snapshot, SlotMetadata, StoreImport, StoreBackupRestore, PlayerPreferences } from '../protocol/index.js';
import type { Store, ProgressBatch, Durable, SlotRecord, HostPort, Scheduler, ActivationOptions } from '../runtime/ports.js';
import { databaseState, parseDatabase, commitProgress, saveSlot, commitActivation, confirmActivation, commitImport, selectProfile, claimActivation, commitPreferences } from '../runtime/durable.js';
export { Coordinator } from '../runtime/coordinator.js';
export type { Store, ProgressBatch, ProgressReceipt, HostPort, Scheduler, Activation } from '../runtime/ports.js';
import {captureBackup,commitBackupRestore,storageNamespace} from '../runtime/backup.js';
export class MemoryStore implements Store {
  private state=databaseState();
  constructor(private readonly namespace?:string) {}
  async backup(gameId:string,series:string,release:string){ensure(!this.namespace||this.namespace===storageNamespace(gameId,series),'BACKUP_NAMESPACE','Backup identity must match storage');return captureBackup(parseDatabase(this.state),gameId,series,release);}
  async restoreBackup(commit:StoreBackupRestore){ensure(!this.namespace||this.namespace===storageNamespace(commit.backup.gameId,commit.backup.series),'BACKUP_NAMESPACE','Restore identity must match storage');const s=parseDatabase(this.state),r=commitBackupRestore(s,commit);this.state=s;return r;}
  async readPreferences(){return parseDatabase(this.state).preferences;}
  async writePreferences(value:PlayerPreferences,revision:number){const s=parseDatabase(this.state),r=commitPreferences(s,value,revision);this.state=s;return r;}
  async read(profileId?:string):Promise<Durable> {const s=parseDatabase(this.state);return {profile:selectProfile(s,profileId),head:s.head};}
  async readSlot(slot:string):Promise<SlotRecord|null> {const s=parseDatabase(this.state);return Object.hasOwn(s.slots,slot)?s.slots[slot]??null:null;}
  async listProfiles(){const s=parseDatabase(this.state);return [{profileId:'main',revision:s.profile.revision},...Object.entries(s.branches).map(([profileId,p])=>({profileId,revision:p.revision}))];}
  async listSlots(){const s=parseDatabase(this.state);return Object.entries(s.slots).map(([slot,r])=>({slot,revision:r.revision,metadata:r.metadata??{profileId:'main',label:slot}}));}
  async import(commit:StoreImport){const s=parseDatabase(this.state);const r=commitImport(s,commit);this.state=s;return r;}
  async save(slot:string,snapshot:Snapshot,expected:number,metadata?:SlotMetadata){const s=parseDatabase(this.state);const r=saveSlot(s,slot,snapshot,expected,metadata);this.state=s;return r;}
  async progress(batch:ProgressBatch,authority:string|null){const s=parseDatabase(this.state);const r=commitProgress(s,batch,authority);this.state=s;return r;}
  async activate(id:string,snapshot:Snapshot,head:string|null,revision:number,initialProgress?:ProgressBatch,options?:ActivationOptions){const s=parseDatabase(this.state);const r=commitActivation(s,id,snapshot,head,revision,initialProgress,options);this.state=s;return r;}
  async claim(id:string,owner:string){const s=parseDatabase(this.state);const r=claimActivation(s,id,owner);this.state=s;return r;}
  async confirm(id:string,owner?:string){const s=parseDatabase(this.state);const r=confirmActivation(s,id,owner);this.state=s;return r;}
  close():void {}
}
export class VirtualScheduler implements Scheduler {
  private callbacks:(()=>void)[]=[];
  defer(callback:()=>void):void {this.callbacks.push(callback);}
  drain(limit=100000):void {let steps=0;while(this.callbacks.length){if(++steps>limit)throw new Error('Scheduler limit');this.callbacks.shift()?.();}}
}
export class VirtualHost implements HostPort {
  readonly effects:unknown[]=[];
  audioResult:'completed'|'blocked'|'failed'='completed';
  effect(effect:Parameters<HostPort['effect']>[0],epoch:number,report:Parameters<HostPort['effect']>[2]):void {
    this.effects.push(JSON.parse(JSON.stringify(effect)));
    if(effect.type==='audio')report(effect.task.id,effect.task.attempt,this.audioResult);
  }
}
export function profileCopy(input:unknown){return parseProfile(input);}
export function snapshotCopy(input:unknown){return parseSnapshot(input);}
