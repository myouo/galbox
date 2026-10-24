import { Core, validateRestore } from '../core/index.js';
import type { CoreView, CoreEvent, ProgressChange } from '../core/index.js';
import { parseProgram, parseSnapshot, ensure, readUnit, GalboxError } from '../protocol/index.js';
import type { Program, Snapshot, DeepReadonly } from '../protocol/index.js';
import { linkProgram } from '../program-tools/linker.js';
import { Coordinator } from '../runtime/coordinator.js';
import { emptyOperations } from '../core/operations.js';
import type { OperationRegistry } from '../core/operations.js';
import type { OperationResume } from '../protocol/index.js';
import type { Store } from '../runtime/ports.js';
import { openStore } from '../storage/indexeddb.js';
import { WebHost } from '../web-host/host.js';
import type { MediaDiagnostics } from '../web-host/host.js';
import { TextController } from '../web-host/text.js';
import type { AssetProvider } from '../web-host/assets.js';
export { createHttpProvider } from '../web-host/assets.js';
export type { AssetProvider, AssetLease, AssetRequest } from '../web-host/assets.js';
export type { Store } from '../runtime/ports.js';
export interface PlayerOptions {program:unknown;provider:AssetProvider;mount:HTMLElement;saveCompatibilitySeries:string;database?:string;store?:Store;budget?:number;operations?:OperationRegistry;}
export interface PlayerView {
  readonly title:string;readonly epoch:number;readonly lifecycle:'ready'|'playing'|'preparing'|'committed-pending'|'disposed';readonly core:CoreView|null;readonly error:string|null;
  readonly media:Readonly<MediaDiagnostics>;readonly menu:boolean;readonly paused:boolean;readonly fast:boolean;readonly namespace:string;
}
export interface SaveResult {readonly slot:string;readonly revision:number;readonly disposed:boolean;}
export class Player {
  private runtime:Coordinator|null=null;
  private readonly host:WebHost;
  private readonly text:TextController;
  private readonly program:Program;
  private readonly operations:OperationRegistry;
  private readonly abort=new AbortController();
  private store:Store|null=null;
  private ownsStore=false;
  private disposed=false;
  private epoch=0;
  private inputSeq=0;
  private generation=0;
  private activationTail:Promise<void>=Promise.resolve();
  private listeners=new Set<()=>void>();
  private pauses=new Set<string>();
  private menu=false;
  private fast=false;
  private frameId=0;
  private lastTime:number|null=null;
  private timeRemainder=0;
  private unsubscribe:(()=>void)|null=null;
  private lifecycle:PlayerView['lifecycle']='ready';
  private error:string|null=null;
  private cached:PlayerView;
  readonly namespace:string;
  private readonly instance=crypto.randomUUID();
  private constructor(private readonly options:PlayerOptions){
    this.operations=options.operations??emptyOperations;this.program=linkProgram(options.program,this.operations).copy();ensure(/^[a-zA-Z0-9_.-]{1,80}$/.test(options.saveCompatibilitySeries),'NAMESPACE','Invalid compatibility series');
    this.namespace=JSON.stringify([this.program.gameId,options.saveCompatibilitySeries]);
    this.host=new WebHost(options.mount);this.text=new TextController(options.mount);
    this.cached={title:this.program.title,epoch:0,lifecycle:'ready',core:null,error:null,media:{...this.host.media},menu:false,paused:false,fast:false,namespace:this.namespace};
  }
  static async create(options:PlayerOptions):Promise<Player> {
    const player=new Player(options);
    try {
      player.store=options.store??await openStore(player.namespace,options.database);player.ownsStore=!options.store;
      await player.host.init(player.program,options.provider,player.abort.signal);
      document.addEventListener('visibilitychange',player.visibility);window.addEventListener('blur',player.blur);window.addEventListener('focus',player.focus);
      player.frameId=requestAnimationFrame(player.frame);player.publish();return player;
    }catch(error){player.dispose();throw error;}
  }
  getSnapshot=():PlayerView=>this.cached;
  subscribe=(fn:()=>void):(()=>void)=>{this.listeners.add(fn);return ()=>this.listeners.delete(fn);};
  private publish():void {
    const core=this.runtime?.view()??null;
    if(core){this.host.render(core.run);this.text.render(core.run);}
    this.cached={title:this.program.title,epoch:this.epoch,lifecycle:this.lifecycle,core,error:this.error??this.runtime?.storageError??this.runtime?.subscriberError??null,media:{...this.host.media},menu:this.menu,paused:this.pauses.size>0,fast:this.fast,namespace:this.namespace};
    for(const listener of [...this.listeners]){try{listener();}catch(error){this.error=error instanceof Error?error.message:String(error);}}
  }
  private frame=(now:number):void=>{
    if(this.disposed)return;
    const ms=this.elapsed(now);
    if(this.runtime&&!this.pauses.size&&(this.lifecycle==='playing'||this.lifecycle==='preparing')) {
      void this.runtime.dispatch({type:'tick',ms}).catch(e=>this.fail(e));
      if(this.fast){const c=this.runtime.view();if(c.run.wait?.kind==='text'&&c.run.text&&c.profile.read.includes(readUnit(c.run.text))){const prompt=c.run.wait.prompt;void this.runtime.dispatch({type:'reveal',prompt,inputId:this.inputId()});void this.runtime.dispatch({type:'advance',prompt,inputId:this.inputId()});}}
    }
    this.frameId=requestAnimationFrame(this.frame);
  };
  private elapsed(now:number):number {
    if(this.lastTime===null){this.lastTime=now;return 0;}if(now<this.lastTime)return 0;const elapsed=Math.max(0,now-this.lastTime)+this.timeRemainder;const ms=Math.floor(elapsed);this.timeRemainder=elapsed-ms;this.lastTime=now;return Math.min(3600000,ms);
  }
  private visibility=():void=>{this.fast=false;this.setPause('hidden',document.hidden);};
  private blur=():void=>{this.fast=false;this.setPause('blur',true);};
  private focus=():void=>{this.setPause('blur',false);};
  private setPause(reason:string,value:boolean):void {if(value&&!this.pauses.size&&this.runtime)void this.runtime.dispatch({type:'tick',ms:this.elapsed(performance.now())}).catch(e=>this.fail(e));if(value)this.pauses.add(reason);else this.pauses.delete(reason);this.lastTime=this.pauses.size?null:performance.now();void this.host.pause([...this.pauses].some(p=>p!=='activation')).catch(e=>this.fail(e));this.publish();}
  private fail(error:unknown):void {this.error=error instanceof Error?error.message:String(error);this.publish();}
  private inputId():string {return `${this.instance}:${++this.inputSeq}`;}
  private requireStore():Store {ensure(this.store&&!this.disposed,'PLAYER_DISPOSED','Player unavailable');return this.store;}
  async start():Promise<void> {
    const store=this.requireStore();const gen=++this.generation;this.lifecycle='preparing';this.publish();await this.host.unlock();
    try {const durable=await store.read();const candidate=new Core(this.program,durable.profile,undefined,'initial',this.operations);let operations=0;for(;;){const result=candidate.run(this.options.budget??100);operations+=this.options.budget??100;ensure(operations<=100000,'STARTUP_BUDGET','Startup did not reach a semantic prompt');if(candidate.view().run.wait?.kind==='flush'){candidate.accept({type:'flushAck',revision:durable.profile.revision});continue;}if(result==='stable')break;await new Promise<void>(resolve=>queueMicrotask(resolve));}await this.activate(candidate.capture(),gen,candidate.pending(),'initial');}
    catch(error){this.precommitFailure(gen,error);throw error;}
  }
  async load(slot='quick'):Promise<void> {
    const store=this.requireStore(),gen=++this.generation;this.lifecycle='preparing';this.publish();
    try {const record=await store.readSlot(slot);ensure(record,'SLOT_EMPTY',slot);const snapshot=validateRestore(this.program,record.snapshot,this.operations);await this.activate(snapshot,gen);}
    catch(error){this.precommitFailure(gen,error);throw error;}
  }
  private precommitFailure(gen:number,error:unknown):void {if(gen===this.generation&&!this.disposed&&this.lifecycle!=='committed-pending'){this.lifecycle=this.runtime?'playing':'ready';this.fail(error);}}
  private async activate(snapshot:Snapshot,gen:number,initialChanges:readonly ProgressChange[]=[],mode:'initial'|'restore'='restore'):Promise<void> {
    const work=this.activationTail.catch(()=>{}).then(async()=>{
      ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','A newer request replaced this candidate');
      const store=this.requireStore(),old=this.runtime;this.setPause('activation',true);
      let committed=false;
      try {
        if(old){await old.freeze();await old.flushAll();}
        ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate became stale');
        const durable=await store.read();validateRestore(this.program,snapshot,this.operations);
        const id=`${this.instance}:a${gen}`;
        const initialProgress=initialChanges.length?Object.freeze({id:`${id}:initial`,baseRevision:durable.profile.revision,through:initialChanges.at(-1)?.seq??0,changes:Object.freeze(initialChanges.map(c=>c.type==='set'?Object.freeze({...c,value:Object.freeze(c.value)}):Object.freeze(c)))}):undefined;
        const activation=await store.activate(id,parseSnapshot(snapshot),durable.head?.id??null,durable.profile.revision,initialProgress);
        committed=true;old?.stop();this.unsubscribe?.();this.runtime=null;this.lifecycle='committed-pending';this.publish();
        // Read the durable head again after commit. A delayed receipt cannot restore authority.
        const head=await store.read();ensure(head.head?.id===activation.id,'ACTIVATION_SUPERSEDED','Committed candidate is no longer current');
        ensure(gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Committed candidate awaits a newer activation');
        const candidate=new Core(this.program,head.profile,snapshot,mode,this.operations);
        const epoch=++this.epoch;this.host.setEpoch(epoch);
        const runtime=new Coordinator(candidate,this.host,{defer:callback=>queueMicrotask(callback)},store,epoch,id,`${this.instance}:${epoch}`,this.options.budget??100);
        this.runtime=runtime;this.unsubscribe=runtime.subscribe(()=>this.publish());
        await store.confirm(id);ensure((await store.read()).head?.id===id,'ACTIVATION_SUPERSEDED','Head changed during host takeover');
        this.lifecycle='playing';this.error=null;await runtime.start();this.publish();
      }catch(error){if(committed){this.runtime?.stop();this.runtime=null;this.lifecycle='committed-pending';this.fail(error);}else this.lifecycle=old?'playing':'ready';throw error;}
      finally {if(!committed)old?.thaw();this.setPause('activation',false);}
    });
    this.activationTail=work;return work;
  }
  async resumeCommitted():Promise<void> {
    const store=this.requireStore();const durable=await store.read();ensure(durable.head&&durable.head.status!=='superseded','ACTIVATION_EMPTY','No recoverable activation');
    const gen=++this.generation;await this.activate(durable.head.snapshot,gen);
  }
  async save(slot='quick',expectedRevision?:number):Promise<SaveResult> {
    const store=this.requireStore(),runtime=this.runtime;ensure(runtime,'PLAYER_NOT_STARTED','Start first');
    const captured=runtime.core.capture(); // Permission applies to this immutable capture, before asynchronous I/O.
    await runtime.flushAll();const previous=expectedRevision===undefined?await store.readSlot(slot):null;
    const result=await store.save(slot,captured,expectedRevision??previous?.revision??0);return {slot,revision:result.revision,disposed:this.disposed};
  }
  async flush():Promise<void> {this.requireStore();await this.runtime?.flushAll();this.publish();}
  async discardAndLoad(slot='quick'):Promise<void> {
    // Explicit conflict resolution; only the caller can discard uncommitted working changes.
    this.runtime?.stop();this.unsubscribe?.();this.runtime=null;await this.load(slot);
  }
  async input(action:'reveal'|'advance'|'step'|'choose',prompt:number,epoch:number,option?:string):Promise<void> {
    if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||(this.lifecycle!=='playing'&&this.lifecycle!=='preparing'))return;
    const runtime=this.runtime;const ticking=runtime.dispatch({type:'tick',ms:this.elapsed(performance.now())});
    let event:CoreEvent;
    if(action==='choose'){ensure(option,'CHOICE_OPTION','Missing option');event={type:'choose',prompt,option,inputId:this.inputId()};}
    else event={type:action,prompt,inputId:this.inputId()};
    await Promise.all([ticking,runtime.dispatch(event)]);
  }
  async step(prompt:number,epoch:number):Promise<void> {await this.input('step',prompt,epoch);}
  async resumeOperation(event:OperationResume,epoch:number):Promise<void> {
    if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;
    const runtime=this.runtime;await Promise.all([runtime.dispatch({type:'tick',ms:this.elapsed(performance.now())}),runtime.dispatch(event)]);
  }
  async retryAudio():Promise<void> {await this.host.unlock();for(const t of this.runtime?.view().run.tasks??[])if(t.kind==='audio'&&t.status==='blocked')await this.runtime?.dispatch({type:'retry',task:t.id});this.publish();}
  setMenu(value:boolean):void {this.menu=value;this.fast=false;this.setPause('menu',value);}
  setPaused(value:boolean):void {this.setPause('user',value);}
  setFast(value:boolean):void {this.fast=value&&!this.pauses.size;this.publish();}
  setVolume(value:number):void {this.host.setVolume(value);}
  capture():DeepReadonly<Snapshot> {ensure(this.runtime,'PLAYER_NOT_STARTED','Start first');return this.runtime.core.capture();}
  dispose():void {
    if(this.disposed)return;this.disposed=true;++this.generation;this.abort.abort();cancelAnimationFrame(this.frameId);
    document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('blur',this.blur);window.removeEventListener('focus',this.focus);
    this.unsubscribe?.();this.runtime?.stop();this.host.dispose();this.text.dispose();this.lifecycle='disposed';this.publish();this.listeners.clear();
    // IDB transactions already started finish before db.close. Borrowed stores remain open.
    if(this.ownsStore)this.store?.close();
  }
}
export async function createPlayer(options:PlayerOptions):Promise<Player> {return Player.create(options);}
