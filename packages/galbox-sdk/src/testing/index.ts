import {parseProfile,parseSnapshot} from '../protocol/index.js';
import type {HostPort,Scheduler} from '../runtime/ports.js';
export {MemoryStore} from '../runtime/memory-store.js';
export {Coordinator} from '../runtime/coordinator.js';
export type {Store,ProgressBatch,ProgressReceipt,HostPort,Scheduler,Activation} from '../runtime/ports.js';
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

export {HistoryJournal,historyPolicy} from '../runtime/history.js';
