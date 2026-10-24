import { Core } from '../core/index.js';
import type { CoreEvent, CoreView } from '../core/index.js';
import { ensure } from '../protocol/index.js';
import type { HostPort, Scheduler, Store, ProgressBatch } from './ports.js';
interface Queued {event:CoreEvent;freeze?:boolean;resolve:()=>void;reject:(e:unknown)=>void;}
export class Coordinator {
  private queue:Queued[]=[];
  private held:Queued[]=[];
  private frozen=false;
  private current:Queued|null=null;
  private draining=false;
  private stopped=false;
  private listeners=new Set<()=>void>();
  private flushTail:Promise<void>=Promise.resolve();
  private batch:ProgressBatch|null=null;
  private commitCounter=0;
  private persistenceError:string|null=null;
  private observerError:string|null=null;
  constructor(readonly core:Core,private readonly host:HostPort,private readonly scheduler:Scheduler,private readonly store:Store,readonly epoch:number,readonly authority:string|null,private readonly sessionId:string,private readonly budget=100) {}
  view():CoreView {return this.core.view();}
  subscribe(fn:()=>void):()=>void {this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
  get storageError():string|null {return this.persistenceError;}
  get subscriberError():string|null {return this.observerError;}
  private notify():void {for(const fn of [...this.listeners]){try{fn();}catch(error){this.observerError=error instanceof Error?error.message:String(error);}}}
  start():Promise<void> {return this.dispatch({type:'tick',ms:0});}
  dispatch(event:CoreEvent):Promise<void> {
    if(this.stopped)return Promise.resolve();
    return new Promise((resolve,reject)=>{const target=this.frozen&&event.type!=='flushAck'?this.held:this.queue;target.push({event,resolve,reject});this.pump();});
  }
  freeze():Promise<void> {
    if(this.frozen||this.stopped)return Promise.resolve();
    return new Promise((resolve,reject)=>{this.queue.push({event:{type:'tick',ms:0},freeze:true,resolve,reject});this.pump();});
  }
  thaw():void {if(this.stopped)return;this.frozen=false;this.queue.push(...this.held);this.held=[];this.pump();}
  private pump():void {
    if(this.draining||this.stopped)return;this.draining=true;this.work();
  }
  private work():void {
    if(this.stopped){this.draining=false;return;}
    try {
      if(!this.current){this.current=this.queue.shift()??null;if(!this.current){this.draining=false;return;}this.core.accept(this.current.event);}
      if(this.core.run(this.budget)==='yield'){this.scheduler.defer(()=>this.work());return;}
      for(const effect of this.core.drainEffects())this.host.effect(effect,this.epoch,(task,attempt,result)=>{
        if(!this.stopped)void this.dispatch({type:'task',task,attempt,result}).catch(()=>{});
      });
      const current=this.current;this.current=null;if(current?.freeze){this.frozen=true;this.held.push(...this.queue);this.queue=[];}this.notify();current?.resolve();
      if(this.core.view().dirty||this.core.view().run.wait?.kind==='flush')void this.flush().catch(()=>{});
      if(this.queue.length){this.scheduler.defer(()=>this.work());return;}this.draining=false;
    } catch(error) {this.current?.reject(error);this.current=null;this.draining=false;this.notify();}
  }
  flush():Promise<void> {
    const next=this.flushTail.catch(()=>{}).then(async()=>{
      if(this.stopped)return;
      const changes=this.core.pending();
      if(!this.batch&&changes.length)this.batch=Object.freeze({id:`${this.sessionId}:p${++this.commitCounter}`,baseRevision:this.core.view().profile.revision,through:changes.at(-1)?.seq??0,changes:Object.freeze(changes.map(c=>c.type==='set'?Object.freeze({...c,value:Object.freeze(c.value)}):Object.freeze(c)))});
      if(this.batch){
        try {
          const receipt=await this.store.progress(this.batch,this.authority);
          this.core.acknowledge(receipt.through,receipt.revision);this.batch=null;this.persistenceError=null;
        } catch(error){this.persistenceError=error instanceof Error?error.message:String(error);this.notify();throw error;}
      }
      if(!this.stopped&&this.core.view().run.wait?.kind==='flush')await this.dispatch({type:'flushAck',revision:this.core.view().profile.revision});
      this.notify();
    });
    this.flushTail=next;return next;
  }
  async flushAll():Promise<void> {ensure(!this.stopped,'SESSION_REVOKED','Cannot flush a stopped session');do {await this.flush();}while(!this.stopped&&this.core.pending().length);ensure(!this.core.pending().length,'SESSION_REVOKED','Session stopped with uncommitted progress');}
  stop():void {
    this.stopped=true;this.core.revoke();for(const q of [...this.queue,...this.held])q.resolve();this.queue=[];this.held=[];this.current?.resolve();this.current=null;this.listeners.clear();
  }
}
