import { Core, validateRestore } from '../core/index.js';
import type { CoreView, CoreEvent, ProgressChange } from '../core/index.js';
import { parseProgram, parseSnapshot, parseJsonValue, ensure, readUnit, GalboxError,parseResourceBudget,parseReleaseManifest, parsePlayerPreferences, parsePreferencesRecord, parsePreferencesPatch } from '../protocol/index.js';
import type { Program, Snapshot, DeepReadonly, Profile, RestoreRecipe, SlotMetadata, StoreImport, JsonValue } from '../protocol/index.js';
import { linkProgram } from '../program-tools/linker.js';
import { Coordinator } from '../runtime/coordinator.js';
import { emptyOperations } from '../core/operations.js';
import type { OperationRegistry } from '../core/operations.js';
import type { OperationResume } from '../protocol/index.js';
import type { Store, Activation } from '../runtime/ports.js';
import { openStore } from '../storage/indexeddb.js';
import { WebHost } from '../web-host/host.js';
import type { MediaDiagnostics } from '../web-host/host.js';
import {prepareRestoreRecipe} from '../runtime/recipe.js';
import {materializeImport} from '../save-bridge/index.js';
import type {SaveBindingRegistry,PreparedImport,PrepareResult,ConversionReport,OriginalSaveFile} from '../save-bridge/index.js';
import {createReleaseManifest,verifyReleaseManifest,releaseFingerprint,defaultResourceBudget,canonicalReleaseJSON} from '../release/index.js';
import type {ResourceBudget,ReleaseManifest} from '../release/index.js';
import {defaultPreferences,mergePreferences} from '../settings/index.js';
import type {PreferencesRecord} from '../settings/index.js';
import type {ResourceDiagnostics} from '../web-host/host.js';
import {webFormatContext,webReleaseDigest} from '../web-host/format.js';
import { TextController } from '../web-host/text.js';
import {prepareBackupRestore,materializeBackupRestore,storageNamespace} from '../backups/index.js';
import type {PreparedBackupRestore,ContentMigration,PortableBackup,BackupRestoreReceipt} from '../backups/index.js';
import type { AssetProvider } from '../web-host/assets.js';
export { createHttpProvider } from '../web-host/assets.js';
export type { AssetProvider, AssetLease, AssetRequest } from '../web-host/assets.js';
export type { Store } from '../runtime/ports.js';
export interface PlayerOptions {program:unknown;provider:AssetProvider;mount:HTMLElement;saveCompatibilitySeries:string;database?:string;store?:Store;budget?:number;operations?:OperationRegistry;bindings?:SaveBindingRegistry;release?:unknown;resourceBudget?:unknown;signal?:AbortSignal;preferencesDefaults?:unknown;}
export interface ReleaseView {readonly origin:'manifest'|'derived';readonly sha256:string;readonly manifest:DeepReadonly<ReleaseManifest>;}
export interface PreferencesResult {readonly record:DeepReadonly<PreferencesRecord>;readonly committed:true;readonly disposed:boolean;}
export interface PlayerView {
  readonly preferences:DeepReadonly<PreferencesRecord>;readonly preferencesSupported:boolean;
  readonly release:ReleaseView|null;readonly resources:DeepReadonly<ResourceDiagnostics>;
  readonly title:string;readonly epoch:number;readonly lifecycle:'ready'|'playing'|'preparing'|'committed-pending'|'commit-unknown'|'disposed';readonly core:CoreView|null;readonly error:string|null;
  readonly media:Readonly<MediaDiagnostics>;readonly menu:boolean;readonly paused:boolean;readonly fast:boolean;readonly namespace:string;readonly profiles:readonly {profileId:string;revision:number}[];readonly profileId:string;readonly slots:readonly {slot:string;revision:number;profileId:string;label:string}[];readonly importSources:readonly {sourceKey:string;schema:string;version:number;label:string}[];readonly importReport:ConversionReport|null;readonly lastImport:{slot:string;profileId:string}|null;
}
export interface ImportResult {readonly id:string;readonly slot:string;readonly profileId:string;readonly revision:number;readonly committed:true;readonly disposed:boolean;}
interface LoadPolicy {profileId:string;recipe?:RestoreRecipe;onLoad?:RestoreRecipe;provenance?:JsonValue;slot?:string;start?:boolean;}
export interface SaveResult {readonly slot:string;readonly revision:number;readonly disposed:boolean;}
export interface BackupRestoreResult {readonly id:string;readonly profiles:BackupRestoreReceipt['profiles'];readonly slots:BackupRestoreReceipt['slots'];readonly committed:true;readonly disposed:boolean;}
export class Player {
  private readonly backupCommits=new WeakMap<PreparedBackupRestore,string>();
  private runtime:Coordinator|null=null;
  private preferences:PreferencesRecord;
  private readonly preferencesDefaults:import('../protocol/index.js').PlayerPreferences;
  private preferencesSupported=false;
  private preferencesTail:Promise<void>=Promise.resolve();
  private release:ReleaseView|null=null;
  private readonly requestedRelease:ReleaseManifest|null;
  private readonly resourceBudget:ResourceBudget;
  private abortRequested=():void=>this.dispose();
  private profileId='main';
  private profiles:{profileId:string;revision:number}[]=[];
  private onLoad:RestoreRecipe|undefined;
  private provenance:JsonValue|undefined;
  private slots:{slot:string;revision:number;profileId:string;label:string}[]=[];
  private importGeneration=0;
  private importCounter=0;
  private pendingImport:PreparedImport|null=null;
  private lastImport:{slot:string;profileId:string}|null=null;
  private readonly importCommits=new WeakMap<PreparedImport,{id:string;slot:string;label:string}>();
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
    this.operations=options.operations??emptyOperations;this.program=linkProgram(options.program,this.operations).copy();
    this.namespace=storageNamespace(this.program.gameId,options.saveCompatibilitySeries);this.requestedRelease=options.release===undefined?null:parseReleaseManifest(options.release);this.resourceBudget=parseResourceBudget(options.resourceBudget??this.requestedRelease?.limits??defaultResourceBudget);ensure(!this.requestedRelease||canonicalReleaseJSON(this.resourceBudget)===canonicalReleaseJSON(this.requestedRelease.limits),'RELEASE_BUDGET','Player budget differs from manifest');
    this.preferencesDefaults=parsePlayerPreferences(options.preferencesDefaults??defaultPreferences());this.preferences={revision:0,value:parsePlayerPreferences(this.preferencesDefaults)};
    this.host=new WebHost(options.mount,error=>{this.setPause('device',true);this.fail(error);});this.text=new TextController(options.mount);this.host.applyAudioPreferences(this.preferences.value.audio);
    this.cached={preferences:parsePreferencesRecord(this.preferences),preferencesSupported:this.preferencesSupported,release:this.release?{...this.release,manifest:parseReleaseManifest(this.release.manifest)}:null,resources:{...this.host.resources,limits:{...this.host.resources.limits}},title:this.program.title,epoch:0,lifecycle:'ready',core:null,error:null,media:{...this.host.media},menu:false,paused:false,fast:false,namespace:this.namespace,profiles:this.profiles.map(p=>({...p})),profileId:this.profileId,slots:this.slots.map(s=>({...s})),importSources:this.options.bindings?.list()??[],importReport:this.pendingImport?.report()??null,lastImport:this.lastImport?{...this.lastImport}:null};
  }
  static async create(options:PlayerOptions):Promise<Player> {
    ensure(!options.signal?.aborted,'PLAYER_CANCELLED','Creation cancelled');const player=new Player(Object.freeze({...options}));player.options.signal?.addEventListener('abort',player.abortRequested,{once:true});
    try {
      const digest=webReleaseDigest(),releaseOptions={program:player.program,series:player.options.saveCompatibilitySeries,operations:player.operations,...(player.options.bindings?{bindings:player.options.bindings}:{})};
      if(player.requestedRelease)await verifyReleaseManifest(player.requestedRelease,releaseOptions,digest);ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');
      player.store=player.options.store??await openStore(player.namespace,player.options.database);player.ownsStore=!player.options.store;if(player.disposed){if(player.ownsStore)player.store.close();throw new GalboxError('PLAYER_CANCELLED','Creation cancelled');}
      player.preferencesSupported=!!player.store.readPreferences&&!!player.store.writePreferences;if(player.preferencesSupported){const stored=await player.store.readPreferences?.();if(stored)player.preferences=parsePreferencesRecord(stored);}ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');player.host.applyAudioPreferences(player.preferences.value.audio);
      await player.host.init(player.program,player.options.provider,player.abort.signal,player.resourceBudget,player.requestedRelease?.resources);
      const manifest=player.requestedRelease??await createReleaseManifest({...releaseOptions,resources:player.host.resourceFacts(),limits:player.resourceBudget},digest);const sha256=await releaseFingerprint(manifest,digest);ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');player.release={origin:player.requestedRelease?'manifest':'derived',sha256,manifest};
      document.addEventListener('visibilitychange',player.visibility);window.addEventListener('blur',player.blur);window.addEventListener('focus',player.focus);
      await player.refreshSlots();const durable=await player.store.read();if(durable.head?.status==='committed-pending')player.lifecycle='committed-pending';player.frameId=requestAnimationFrame(player.frame);player.publish();return player;
    }catch(error){player.dispose();throw error;}
  }
  getSnapshot=():PlayerView=>this.cached;
  subscribe=(fn:()=>void):(()=>void)=>{this.listeners.add(fn);return ()=>this.listeners.delete(fn);};
  private publish():void {
    const core=this.runtime?.view()??null;
    if(core){this.host.render(core.run);this.text.render(core.run);}
    this.cached={preferences:parsePreferencesRecord(this.preferences),preferencesSupported:this.preferencesSupported,release:this.release?{...this.release,manifest:parseReleaseManifest(this.release.manifest)}:null,resources:{...this.host.resources,limits:{...this.host.resources.limits}},title:this.program.title,epoch:this.epoch,lifecycle:this.lifecycle,core,error:this.error??this.runtime?.storageError??this.runtime?.subscriberError??null,media:{...this.host.media},menu:this.menu,paused:this.pauses.size>0,fast:this.fast,namespace:this.namespace,profiles:this.profiles.map(p=>({...p})),profileId:this.profileId,slots:this.slots.map(s=>({...s})),importSources:this.options.bindings?.list()??[],importReport:this.pendingImport?.report()??null,lastImport:this.lastImport?{...this.lastImport}:null};
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
  private stopRuntime():void {const runtime=this.runtime;this.runtime=null;this.unsubscribe?.();this.unsubscribe=null;runtime?.stop();}
  private async refreshSlots():Promise<void> {
    if(this.disposed)return;const records=await this.requireStore().listSlots?.();const profiles=await this.requireStore().listProfiles?.();if(profiles)this.profiles=profiles.map(p=>({...p}));if(records)this.slots=records.map(r=>({slot:r.slot,revision:r.revision,profileId:r.metadata.profileId,label:r.metadata.label||r.slot}));this.publish();
  }
  private async initialCandidate(profile:Profile):Promise<Core> {
    const candidate=new Core(this.program,profile,undefined,'initial',this.operations,this.program.rng&&'seedSource'in this.program.rng?crypto.getRandomValues(new Uint32Array(1))[0]:undefined);candidate.accept({type:'text.preferences',value:this.preferences.value.text});let operations=0;
    for(;;){const result=candidate.run(this.options.budget??100);operations+=this.options.budget??100;ensure(operations<=100000,'STARTUP_BUDGET','Startup did not reach a semantic prompt');if(candidate.view().run.wait?.kind==='flush'){candidate.accept({type:'flushAck',revision:profile.revision});continue;}if(result==='stable')return candidate;await new Promise<void>(resolve=>queueMicrotask(resolve));}
  }
  async start(profileId='main'):Promise<void> {
    this.requireStore();const gen=++this.generation;this.lifecycle='preparing';this.publish();await this.host.unlock();
    try {await this.activate(null,gen,{profileId,start:true});}catch(error){this.precommitFailure(gen,error);throw error;}
  }
  async load(slot='quick'):Promise<void> {
    const store=this.requireStore(),gen=++this.generation;this.lifecycle='preparing';this.publish();
    try {const record=await store.readSlot(slot);ensure(record,'SLOT_EMPTY',slot);const snapshot=validateRestore(this.program,record.snapshot,this.operations),metadata=record.metadata??{profileId:'main',label:slot};await this.activate(snapshot,gen,{profileId:metadata.profileId,slot,...(metadata.recipe?{recipe:metadata.recipe}:{}),...(metadata.onLoad?{onLoad:metadata.onLoad}:{}),...(metadata.provenance!==undefined?{provenance:metadata.provenance}:{})});}
    catch(error){this.precommitFailure(gen,error);throw error;}
  }
  private precommitFailure(gen:number,error:unknown):void {if(gen===this.generation&&!this.disposed&&!['committed-pending','commit-unknown'].includes(this.lifecycle)){this.lifecycle=this.runtime?'playing':'ready';this.fail(error);}}
  private async install(activation:Activation,owner:string,gen:number):Promise<void> {
    const store=this.requireStore(),head=await store.read(activation.profileId??'main');
    ensure(head.head?.id===activation.id&&(head.head.owner??head.head.id)===owner&&gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Candidate no longer owns the durable head');
    const candidate=new Core(this.program,head.profile,activation.snapshot,activation.mode??'restore',this.operations);candidate.accept({type:'text.preferences',value:this.preferences.value.text});const epoch=++this.epoch;this.host.setEpoch(epoch);this.host.render(candidate.view().run);this.text.render(candidate.view().run);
    const runtime=new Coordinator(candidate,this.host,{defer:callback=>queueMicrotask(callback)},store,epoch,owner,`${this.instance}:${epoch}`,this.options.budget??100);this.runtime=runtime;this.unsubscribe=runtime.subscribe(()=>this.publish());this.profileId=activation.profileId??'main';this.onLoad=activation.onLoad;this.provenance=activation.provenance;
    await runtime.start();this.host.assertReady();ensure(gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Takeover was superseded');
    await store.confirm(activation.id,owner);const confirmed=await store.read(this.profileId);ensure(confirmed.head?.id===activation.id&&(confirmed.head.owner??confirmed.head.id)===owner&&gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Head changed during takeover');
    this.lifecycle='playing';this.error=null;this.publish();
  }
  private async activate(baseline:Snapshot|null,gen:number,policy:LoadPolicy):Promise<void> {
    const work=this.activationTail.catch(()=>{}).then(async()=>{
      ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','A newer request replaced this candidate');const store=this.requireStore(),old=this.runtime;this.host.assertReady();this.setPause('activation',true);
      let committed=false,committing=false,id:string|null=null,expectedHead:string|null=null;
      try {
        if(old){await old.freeze();await old.flushAll();}ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate became stale');
        const durable=await store.read(policy.profileId);expectedHead=durable.head?.id??null;let snapshot:Snapshot,changes:readonly ProgressChange[]=[],mode:'initial'|'restore'='restore';
        if(policy.start){const candidate=await this.initialCandidate(durable.profile);snapshot=candidate.capture();changes=candidate.pending();mode='initial';}
        else {ensure(baseline,'LOAD_BASELINE','Missing snapshot');snapshot=validateRestore(this.program,baseline,this.operations);if(policy.recipe){const prepared=prepareRestoreRecipe(this.program,durable.profile,snapshot,policy.recipe,{operations:this.operations});snapshot=prepared.snapshot;changes=prepared.changes;mode='initial';}}
        ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate became stale during preparation');id=`${this.instance}:a${gen}`;
        const initial=changes.length?Object.freeze({id:`${id}:initial`,baseRevision:durable.profile.revision,through:changes.at(-1)?.seq??0,changes:Object.freeze(changes.map(c=>c.type==='set'?Object.freeze({...c,value:Object.freeze(c.value)}):Object.freeze(c)))}):undefined;
        this.host.assertReady();committing=true;const activation=await store.activate(id,snapshot,expectedHead,durable.profile.revision,initial,{profileId:policy.profileId,mode,owner:id,...(policy.onLoad?{onLoad:policy.onLoad}:{}),...(policy.provenance!==undefined?{provenance:policy.provenance}:{}),...(policy.slot?{slot:policy.slot}:{})});committed=true;old?.stop();this.unsubscribe?.();this.runtime=null;this.lifecycle='committed-pending';this.publish();await this.install(activation,id,gen);
      }catch(error){
        if(committing&&!committed){try{const current=await store.read(policy.profileId);if(current.head?.id===id||(current.head?.id??null)!==expectedHead)committed=true;}catch{old?.stop();this.stopRuntime();this.lifecycle='commit-unknown';this.fail(new GalboxError('ACTIVATION_COMMIT_UNKNOWN','Outcome unavailable; reconcile the durable head before continuing'));throw error;}}
        if(committed){old?.stop();this.stopRuntime();this.lifecycle='committed-pending';this.fail(error);}else {this.lifecycle=old?'playing':'ready';old?.thaw();}throw error;
      }finally{this.setPause('activation',false);}
    });this.activationTail=work;return work;
  }
  async resumeCommitted(expectedId?:string):Promise<void> {
    const store=this.requireStore(),gen=++this.generation;
    const work=this.activationTail.catch(()=>{}).then(async()=>{
      const durable=await store.read();ensure(durable.head&&(!expectedId||durable.head.id===expectedId),'ACTIVATION_SUPERSEDED','Requested head is no longer current');ensure(durable.head.status==='committed-pending','ACTIVATION_NOT_PENDING','Use an explicit load for an already activated session');const claim=store.claim?.bind(store);ensure(claim,'STORAGE_CLAIM_UNSUPPORTED','Storage does not support recovery ownership');
      const owner=`${this.instance}:retry${gen}`;const activation=await claim(durable.head.id,owner);this.stopRuntime();this.lifecycle='committed-pending';this.setPause('activation',true);
      try{await this.install(activation,owner,gen);}catch(error){this.stopRuntime();this.lifecycle='committed-pending';this.fail(error);throw error;}finally{this.setPause('activation',false);}
    });this.activationTail=work;return work;
  }
  async save(requestedSlot?:string,expectedRevision?:number):Promise<SaveResult> {
    const store=this.requireStore(),runtime=this.runtime;ensure(runtime,'PLAYER_NOT_STARTED','Start first');const profileId=this.profileId,slot=requestedSlot??(profileId==='main'?'quick':`${profileId}:quick`),metadata:SlotMetadata={profileId,label:profileId==='main'?'快速存档':'快速存档（独立导入进度）',...(this.onLoad?{recipe:this.onLoad,onLoad:this.onLoad}:{}),...(this.provenance!==undefined?{provenance:this.provenance}:{})};const captured=runtime.core.capture();
    const previous=expectedRevision===undefined?await store.readSlot(slot):null;await runtime.flushAll();const result=await store.save(slot,captured,expectedRevision??previous?.revision??0,metadata);if(!this.disposed){try{await this.refreshSlots();}catch(error){this.fail(error);}}return {slot,revision:result.revision,disposed:this.disposed};
  }
  async prepareImport(source:{sourceKey:string;schema:string;version:number},files:readonly OriginalSaveFile[]):Promise<PrepareResult> {return this.prepareImportAt(source,files,++this.importGeneration);}
  async prepareImportFiles(source:{sourceKey:string;schema:string;version:number},files:readonly File[]):Promise<PrepareResult> {
    const gen=++this.importGeneration;ensure(files.length<=16&&files.every(f=>f.size<=4_000_000)&&files.reduce((n,f)=>n+f.size,0)<=8_000_000,'SAVE_PACKAGE_SIZE','Too many or oversized files');const bytes=await Promise.all(files.map(async f=>({name:f.name,bytes:new Uint8Array(await f.arrayBuffer())})));return this.prepareImportAt(source,bytes,gen);
  }
  private async prepareImportAt(source:{sourceKey:string;schema:string;version:number},files:readonly OriginalSaveFile[],gen:number):Promise<PrepareResult> {
    this.requireStore();ensure(gen===this.importGeneration&&!this.disposed,'IMPORT_PLAN_SUPERSEDED','A newer preparation replaced this request');const binding=this.options.bindings?.get(source.sourceKey,source.schema,source.version);ensure(binding,'SAVE_BINDING_UNSUPPORTED','Select a registered save source');this.pendingImport=null;this.lastImport=null;this.publish();const result=await binding.prepare(files,webFormatContext(),this.program,this.operations);ensure(gen===this.importGeneration&&!this.disposed,'IMPORT_PLAN_SUPERSEDED','A newer preparation replaced this request');if(result.status==='ready')this.pendingImport=result.plan;this.publish();return result;
  }
  async commitImport(plan:PreparedImport|null=this.pendingImport):Promise<ImportResult> {
    const store=this.requireStore();ensure(plan,'IMPORT_PLAN','Prepare an import first');const write=store.import?.bind(store);ensure(write,'STORAGE_IMPORT_UNSUPPORTED','Storage does not support independent imports');const payload=materializeImport(plan,this.program,this.operations),report=plan.report();
    let identity=this.importCommits.get(plan);if(!identity){identity={id:`${this.instance}:import${++this.importCounter}`,slot:`import-${crypto.randomUUID()}`,label:report.label};this.importCommits.set(plan,identity);}
    const commit:StoreImport={id:identity.id,slot:identity.slot,snapshot:payload.snapshot,profile:payload.profile,metadata:{profileId:`import:${identity.id}`,label:`${identity.label} · ${identity.slot.slice(-8)}`,provenance:parseJsonValue(report),...(payload.recipe?{recipe:payload.recipe}:{}),...(payload.onLoad?{onLoad:payload.onLoad}:{})}};
    let receipt;try{receipt=await write(commit);}catch(error){const failure=new GalboxError('IMPORT_COMMIT_UNKNOWN',`Import may have committed; retry this same plan. ${String(error)}`);this.fail(failure);throw failure;}
    if(!this.disposed){this.error=null;if(this.pendingImport===plan)this.lastImport={slot:receipt.slot,profileId:receipt.profileId};try{await this.refreshSlots();}catch(error){this.fail(error);}}
    return {id:receipt.id,slot:receipt.slot,profileId:receipt.profileId,revision:receipt.revision,committed:true,disposed:this.disposed};
  }
  async exportBackup():Promise<PortableBackup> {
    const store=this.requireStore(),read=store.backup?.bind(store);ensure(read,'STORAGE_BACKUP_UNSUPPORTED','Storage does not support atomic backups');await this.runtime?.flushAll();return read(this.program.gameId,this.options.saveCompatibilitySeries,this.program.release);
  }
  prepareBackupRestore(input:unknown,migration?:ContentMigration):PreparedBackupRestore {
    this.requireStore();return prepareBackupRestore(input,{program:this.program,series:this.options.saveCompatibilitySeries,operations:this.operations,...(migration?{migration}:{})});
  }
  async commitBackupRestore(plan:PreparedBackupRestore):Promise<BackupRestoreResult> {
    const store=this.requireStore(),write=store.restoreBackup?.bind(store);ensure(write,'STORAGE_BACKUP_UNSUPPORTED','Storage does not support atomic backup restoration');const backup=materializeBackupRestore(plan,{program:this.program,series:this.options.saveCompatibilitySeries,operations:this.operations});
    let id=this.backupCommits.get(plan);if(!id){id=`${this.instance}:backup${++this.importCounter}`;this.backupCommits.set(plan,id);}
    let receipt:BackupRestoreReceipt;try{receipt=await write({id,backup});}catch(error){const failure=new GalboxError('BACKUP_COMMIT_UNKNOWN',`Restore may have committed; retry this same plan. ${String(error)}`);this.fail(failure);throw failure;}
    if(!this.disposed){this.error=null;try{await this.refreshSlots();}catch(error){this.fail(error);}}
    return {id:receipt.id,profiles:receipt.profiles,slots:receipt.slots,committed:true,disposed:this.disposed};
  }
  async flush():Promise<void> {this.requireStore();await this.runtime?.flushAll();this.publish();}
  async discardAndLoad(slot='quick'):Promise<void> {
    // Explicit conflict resolution; only the caller can discard uncommitted working changes.
    this.stopRuntime();await this.load(slot);
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
  private async applyPreferences(record:PreferencesRecord):Promise<void> {this.preferences=parsePreferencesRecord(record);if(this.disposed)return;this.host.applyAudioPreferences(record.value.audio);await this.runtime?.dispatch({type:'text.preferences',value:record.value.text});this.publish();}
  async updatePreferences(input:unknown):Promise<PreferencesResult> {
    const patch=parsePreferencesPatch(input),store=this.requireStore(),write=store.writePreferences?.bind(store);ensure(this.preferencesSupported&&write,'PREFERENCES_UNSUPPORTED','Storage has no preferences port');
    const work=this.preferencesTail.catch(()=>{}).then(async()=>{ensure(!this.disposed,'PLAYER_DISPOSED','Player unavailable');const value=mergePreferences(this.preferences.value,patch);let record:PreferencesRecord;try{record=await write(value,this.preferences.revision);}catch(error){if(error instanceof GalboxError&&error.code==='PREFERENCES_CONFLICT')throw error;throw new GalboxError('PREFERENCES_COMMIT_UNKNOWN',`Reload preferences to reconcile the durable result. ${String(error)}`);}await this.applyPreferences(record);return {record:parsePreferencesRecord(record),committed:true as const,disposed:this.disposed};});this.preferencesTail=work.then(()=>{},()=>{});return work;
  }
  async reloadPreferences():Promise<void> {
    const store=this.requireStore(),read=store.readPreferences?.bind(store);ensure(this.preferencesSupported&&read,'PREFERENCES_UNSUPPORTED','Storage has no preferences port');const work=this.preferencesTail.catch(()=>{}).then(async()=>{ensure(!this.disposed,'PLAYER_DISPOSED','Player unavailable');const stored=await read();await this.applyPreferences(stored??{revision:0,value:parsePlayerPreferences(this.preferencesDefaults)});});this.preferencesTail=work.catch(()=>{});return work;
  }

  capture():DeepReadonly<Snapshot> {ensure(this.runtime,'PLAYER_NOT_STARTED','Start first');return this.runtime.core.capture();}
  dispose():void {
    if(this.disposed)return;this.disposed=true;++this.generation;++this.importGeneration;this.options.signal?.removeEventListener('abort',this.abortRequested);this.abort.abort();cancelAnimationFrame(this.frameId);
    document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('blur',this.blur);window.removeEventListener('focus',this.focus);
    this.unsubscribe?.();this.runtime?.stop();this.host.dispose();this.text.dispose();this.lifecycle='disposed';this.publish();this.listeners.clear();
    // IDB transactions already started finish before db.close. Borrowed stores remain open.
    if(this.ownsStore)this.store?.close();
  }
}
export async function createPlayer(options:PlayerOptions):Promise<Player> {return Player.create(options);}
