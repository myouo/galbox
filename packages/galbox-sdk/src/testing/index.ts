import { parseProfile, parseSnapshot } from '../protocol/index.js';
import type { Snapshot } from '../protocol/index.js';
import type { Store, ProgressBatch, Durable, SlotRecord, HostPort, Scheduler } from '../runtime/ports.js';
import { databaseState, parseDatabase, commitProgress, saveSlot, commitActivation, confirmActivation } from '../runtime/durable.js';
export { Coordinator } from '../runtime/coordinator.js';
export type { Store, ProgressBatch, ProgressReceipt, HostPort, Scheduler, Activation } from '../runtime/ports.js';
export class MemoryStore implements Store {
  private state=databaseState();
  async read():Promise<Durable> {const s=parseDatabase(this.state);return {profile:s.profile,head:s.head};}
  async readSlot(slot:string):Promise<SlotRecord|null> {return parseDatabase(this.state).slots[slot]??null;}
  async save(slot:string,snapshot:Snapshot,expected:number){const s=parseDatabase(this.state);const r=saveSlot(s,slot,snapshot,expected);this.state=s;return r;}
  async progress(batch:ProgressBatch,authority:string|null){const s=parseDatabase(this.state);const r=commitProgress(s,batch,authority);this.state=s;return r;}
  async activate(id:string,snapshot:Snapshot,head:string|null,revision:number,initialProgress?:ProgressBatch){const s=parseDatabase(this.state);const r=commitActivation(s,id,snapshot,head,revision,initialProgress);this.state=s;return r;}
  async confirm(id:string){const s=parseDatabase(this.state);const r=confirmActivation(s,id);this.state=s;return r;}
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
