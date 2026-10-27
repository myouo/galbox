import {GalboxError} from '../protocol/index.js';
import type {Scheduler} from '../runtime/ports.js';
/** Instance-owned browser tasks; a microtask chain is not a rendering yield. */
export class BrowserScheduler implements Scheduler {
 private readonly Channel=typeof MessageChannel==='function'?MessageChannel:null;
 private channel:MessageChannel|null=null;
 private readonly pending=new Map<number,{run:()=>void;cancel?:()=>void}>();
 private readonly timers=new Set<ReturnType<typeof setTimeout>>();
 private sequence=0;private disposed=false;
 private deliver(id:number):void {const item=this.pending.get(id);if(!item||this.disposed)return;this.pending.delete(id);item.run();}
 private enqueue(run:()=>void,cancel?:()=>void):void {if(this.disposed){cancel?.();return;}if(this.Channel&&!this.channel){this.channel=new this.Channel();this.channel.port1.onmessage=(event:MessageEvent<unknown>)=>{if(typeof event.data==='number')this.deliver(event.data);};}const id=++this.sequence;this.pending.set(id,{run,...(cancel?{cancel}:{})});if(this.channel)this.channel.port2.postMessage(id);else{const timer=setTimeout(()=>{this.timers.delete(timer);this.deliver(id);},0);this.timers.add(timer);}}
 defer(run:()=>void):void {this.enqueue(run);}
 turn():Promise<void> {return new Promise((resolve,reject)=>this.enqueue(resolve,()=>reject(new GalboxError('SCHEDULER_DISPOSED','Player task scheduling was cancelled'))));}
 dispose():void {if(this.disposed)return;this.disposed=true;this.channel?.port1.close();this.channel?.port2.close();for(const timer of this.timers)clearTimeout(timer);this.timers.clear();for(const item of this.pending.values())item.cancel?.();this.pending.clear();}
}
