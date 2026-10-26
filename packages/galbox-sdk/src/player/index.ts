import {projectFlowchart} from '../runtime/flowchart.js';
import type {FlowchartView} from '../runtime/flowchart.js';
export type {FlowchartView,FlowNodeView} from '../runtime/flowchart.js';
import {HistoryJournal,historyPolicy} from '../runtime/history.js';
import type {BacklogItem} from '../runtime/history.js';
import {validateVoiceRecipe} from '../core/audio.js';
export {historyPolicy} from '../runtime/history.js';
export type {BacklogItem} from '../runtime/history.js';
export type {HistoryPolicy} from '../protocol/index.js';
export type {HistoryVoiceView} from '../web-host/history-voice.js';
import {defaultSavePolicy,selectSaveSlot,profileSlot,submitSave,parseSaveGameOptions,parseSavePolicy,SaveOutcomeError} from './saves.js';
import type {SaveGameOptions,SavePolicy,SaveCommit} from './saves.js';
export {SaveOutcomeError,defaultSavePolicy} from './saves.js';
export type {SaveGameOptions,SavePolicy} from './saves.js';
import {freezeJson} from '../protocol/codecs.js';
import { Core, validateRestore } from '../core/index.js';
import type { CoreView, CoreEvent, ProgressChange } from '../core/index.js';
import { parseProgram, parseSnapshot, parseJsonValue, ensure, readUnit, GalboxError,parseResourceBudget,parseReleaseManifest, parsePlayerPreferences, parsePreferencesRecord, parsePreferencesPatch,parseInteractionEvent,parseIntegrityEvidence,parseSlotMetadata,parseSaveCommit,parseSaveCapture,parseProfile,emptyProfile } from '../protocol/index.js';
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
import {defaultPreferences,mergePreferences,normalizePreferences,normalizePreferencesRecord} from '../settings/index.js';
import type {PreferencesRecord} from '../settings/index.js';
import type {ResourceDiagnostics} from '../web-host/host.js';
import {webFormatContext,webReleaseDigest} from '../web-host/format.js';
import {InputController} from '../web-host/input.js';
import type {PlaybackView} from '../runtime/playback.js';
import {createDomTextRenderer} from '../web-host/renderer.js';
import type {TextRenderer,TextRendererFactory} from '../web-host/renderer.js';
export {createDomTextRenderer} from '../web-host/renderer.js';
export type {TextRenderer,TextRendererFactory,TextRendererContext,TextCapture} from '../web-host/renderer.js';
import {prepareBackupRestore,materializeBackupRestore,storageNamespace} from '../backups/index.js';
import type {PreparedBackupRestore,ContentMigration,PortableBackup,BackupRestoreReceipt} from '../backups/index.js';
import type { AssetProvider } from '../web-host/assets.js';
export { createHttpProvider } from '../web-host/assets.js';
export type { AssetProvider, AssetLease, AssetRequest } from '../web-host/assets.js';
export type { Store } from '../runtime/ports.js';
export interface PlayerOptions {history?:import('../protocol/index.js').HistoryPolicy;saves?:SavePolicy;program:unknown;provider:AssetProvider;mount:HTMLElement;saveCompatibilitySeries:string;database?:string;store?:Store;budget?:number;operations?:OperationRegistry;bindings?:SaveBindingRegistry;release?:unknown;resourceBudget?:unknown;signal?:AbortSignal;streaming?:import('../protocol/index.js').StreamingOptions;graphics?:import('../protocol/index.js').GraphicsOptions;preferencesDefaults?:unknown;textRenderer?:TextRendererFactory;}
export interface ReleaseView {readonly origin:'manifest'|'derived';readonly sha256:string;readonly manifest:DeepReadonly<ReleaseManifest>;}
export interface PreferencesResult {readonly record:DeepReadonly<PreferencesRecord>;readonly committed:true;readonly disposed:boolean;}
export interface SaveLibraryEntry {readonly slot:string;readonly revision:number;readonly profileId:string;readonly label:string;readonly kind:'manual'|'quick'|'auto'|'legacy';readonly capture:DeepReadonly<import('../protocol/index.js').SaveCapture>|null;readonly hasPrevious:boolean;}
export interface BacklogView {readonly entries:readonly BacklogItem[];readonly storage:'durable'|'memory';readonly policy:DeepReadonly<import('../protocol/index.js').HistoryPolicy>;readonly voice:import('../web-host/history-voice.js').HistoryVoiceView;}
export interface PlayerView {readonly flowchart:FlowchartView|null;readonly backlog:BacklogView;
  readonly saveSystem:{readonly supported:boolean;readonly policy:DeepReadonly<SavePolicy>;readonly pending:readonly {id:string;slot:string}[]};
  readonly video:Readonly<import('../web-host/video-types.js').VideoDiagnostics>;readonly canReplayVoice:boolean;readonly playback:PlaybackView;readonly preferences:DeepReadonly<PreferencesRecord>;readonly preferencesSupported:boolean;
  readonly release:ReleaseView|null;readonly resources:DeepReadonly<ResourceDiagnostics>;
  readonly title:string;readonly epoch:number;readonly lifecycle:'ready'|'playing'|'preparing'|'committed-pending'|'commit-unknown'|'disposed';readonly core:CoreView|null;readonly error:string|null;
  readonly media:Readonly<MediaDiagnostics>;readonly menu:boolean;readonly paused:boolean;readonly fast:boolean;readonly namespace:string;readonly profiles:readonly {profileId:string;revision:number}[];readonly profileId:string;readonly slots:readonly SaveLibraryEntry[];readonly importSources:readonly {sourceKey:string;schema:string;version:number;label:string}[];readonly importReport:ConversionReport|null;readonly lastImport:{slot:string;profileId:string}|null;
}
export interface ImportResult {readonly id:string;readonly slot:string;readonly profileId:string;readonly revision:number;readonly committed:true;readonly disposed:boolean;}
interface LoadPolicy {profileId:string;entryNode?:string;recipe?:RestoreRecipe;onLoad?:RestoreRecipe;provenance?:JsonValue;slot?:string;start?:boolean;}
export interface SaveResult {readonly slot:string;readonly revision:number;readonly disposed:boolean;}
export interface BackupRestoreResult {readonly id:string;readonly profiles:BackupRestoreReceipt['profiles'];readonly slots:BackupRestoreReceipt['slots'];readonly committed:true;readonly disposed:boolean;}
export interface IllustratedSaveResult extends SaveResult {readonly id:string;readonly committed:true;readonly reconciled:boolean;}
export class Player {
  private graphProfile:Profile=emptyProfile();
  private graphCache:{key:string;value:FlowchartView|null}|null=null;
  private readonly historyPolicy:import('../protocol/index.js').HistoryPolicy;
  private readonly savePolicy:SavePolicy;
  private captureSequence=0;private saveFailure:string|null=null;
  private saveTail:Promise<void>=Promise.resolve();
  private readonly pendingSaves=new Map<string,SaveCommit>();
  private autoSaving=false;private lastAutoCut='';
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
  private slots:SaveLibraryEntry[]=[];
  private importGeneration=0;
  private importCounter=0;
  private pendingImport:PreparedImport|null=null;
  private lastImport:{slot:string;profileId:string}|null=null;
  private readonly importCommits=new WeakMap<PreparedImport,{id:string;slot:string;label:string}>();
  private readonly host:WebHost;
  private text:TextRenderer|null=null;
  private readonly inputController:InputController;
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
  private fastRequested=false;
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
    this.historyPolicy=historyPolicy(options.history);this.savePolicy=parseSavePolicy(options.saves??defaultSavePolicy);this.operations=options.operations??emptyOperations;this.program=linkProgram(options.program,this.operations).copy();
    this.namespace=storageNamespace(this.program.gameId,options.saveCompatibilitySeries);this.requestedRelease=options.release===undefined?null:parseReleaseManifest(options.release);this.resourceBudget=parseResourceBudget(options.resourceBudget??this.requestedRelease?.limits??defaultResourceBudget);ensure(!this.requestedRelease||canonicalReleaseJSON(this.resourceBudget)===canonicalReleaseJSON(this.requestedRelease.limits),'RELEASE_BUDGET','Player budget differs from manifest');
    this.preferencesDefaults=normalizePreferences(options.preferencesDefaults??defaultPreferences());this.preferences={revision:0,value:parsePlayerPreferences(this.preferencesDefaults)};
    this.host=new WebHost(options.mount,error=>{this.setPause('device',true);this.fail(error);},options.graphics);this.host.applyAudioPreferences(this.preferences.value.audio);
    this.inputController=new InputController({state:()=>{const v=this.getSnapshot(),w=v.core?.run.wait;return {epoch:v.epoch,prompt:w&&'prompt'in w?w.prompt:null,text:w?.kind==='text',playing:v.lifecycle==='playing',paused:v.paused,menu:v.menu};},advance:(prompt,epoch)=>{void this.step(prompt,epoch).catch(e=>this.fail(e));},menu:()=>this.setMenu(!this.menu),auto:()=>{void this.setAuto(this.runtime?.playbackView().mode!=='auto').catch(e=>this.fail(e));},skip:value=>this.setFast(value),quickSave:()=>{void this.quickSave().catch(e=>this.fail(e));},quickLoad:()=>{void this.quickLoad().catch(e=>this.fail(e));}},this.preferences.value.input);this.inputController.attach(options.mount);
    this.cached={flowchart:this.flowView(),backlog:this.backlogView(),saveSystem:{supported:!!this.store?.commitSave&&!!this.store?.saveReceipt&&!!this.store?.listSlots,policy:parseSavePolicy(this.savePolicy),pending:[...this.pendingSaves.values()].map(c=>({id:c.id,slot:c.slot}))},video:{...this.host.video},canReplayVoice:false,playback:this.runtime?.playbackView()??{mode:'manual',reason:'manual',elapsedMs:0,voice:'none'},preferences:parsePreferencesRecord(this.preferences),preferencesSupported:this.preferencesSupported,release:this.release?{...this.release,manifest:parseReleaseManifest(this.release.manifest)}:null,resources:{...this.host.resources,limits:{...this.host.resources.limits},integrity:this.host.resources.integrity.map(row=>({id:row.id,factOrigin:row.factOrigin,evidence:parseIntegrityEvidence(row.evidence)}))},title:this.program.title,epoch:0,lifecycle:'ready',core:null,error:null,media:{...this.host.media},menu:false,paused:false,fast:false,namespace:this.namespace,profiles:this.profiles.map(p=>({...p})),profileId:this.profileId,slots:this.slots.map(s=>({...s,capture:s.capture?parseSaveCapture(s.capture):null})),importSources:this.options.bindings?.list()??[],importReport:this.pendingImport?.report()??null,lastImport:this.lastImport?{...this.lastImport}:null};
  }
  private flowView(core:CoreView|null=this.runtime?.view()??null):FlowchartView|null {if(!this.program.flowchart)return null;const profile=core?.profile??this.graphProfile,enabled=this.lifecycle==='ready'||this.lifecycle==='playing',canSave=core?.canSave??true,key=JSON.stringify([this.epoch,this.profileId,profile.revision,core?.dirty??0,core?.run.flow,enabled,canSave]);if(this.graphCache?.key===key)return this.graphCache.value;const value=projectFlowchart(this.program,profile,core?.run.flow,enabled,canSave);this.graphCache={key,value};return value;}
  async refreshFlowchart():Promise<void> {const store=this.requireStore();if(this.runtime)await this.runtime.flushAll();const record=await store.read(this.profileId);this.graphProfile=parseProfile(record.profile);this.graphCache=null;this.publish();}
  async enterNode(node:string,epoch=this.epoch):Promise<void> {this.requireStore();ensure(this.program.flowchart,'FLOW_UNAVAILABLE','No flowchart declared');const definition=this.program.flowchart.nodes.find(n=>n.id===node);ensure(definition,'FLOW_NODE_UNKNOWN','Unknown node');ensure(definition.entry,'FLOW_NO_ENTRY','Node has no declared entry');ensure(epoch===this.epoch&&(this.lifecycle==='ready'||this.lifecycle==='playing'),'FLOW_STALE','Flowchart session changed');ensure(!this.runtime||this.runtime.view().canSave,'FLOW_ENTRY_UNAVAILABLE',this.runtime?.view().saveReason??'Current cut cannot be left');const gen=++this.generation;this.lifecycle='preparing';this.publish();try{await this.host.unlock();await this.activate(null,gen,{profileId:this.profileId,start:true,entryNode:node});}catch(error){this.precommitFailure(gen,error);throw error;}}
  private backlogView():BacklogView {const view=this.runtime?.view(),canSave=!!view?.canSave&&this.lifecycle==='playing'&&![...this.pauses].some(p=>p!=='menu'&&p!=='history-voice');return {entries:view?this.runtime?.history?.items(view.run.history,canSave,view.saveReason,view.run.release)??[]:[],storage:this.store?.commitHistory&&this.store.readHistory&&this.store.historyReceipt?'durable':'memory',policy:historyPolicy(this.historyPolicy),voice:this.host.historyVoiceView()};}
  static async create(options:PlayerOptions):Promise<Player> {
    ensure(!options.signal?.aborted,'PLAYER_CANCELLED','Creation cancelled');const player=new Player(Object.freeze({...options}));player.host.observeHistoryVoice(()=>{if(['idle','failed','blocked'].includes(player.host.historyVoiceView().state)&&player.pauses.has('history-voice'))player.setPause('history-voice',false);else player.publish();});player.options.signal?.addEventListener('abort',player.abortRequested,{once:true});
    try {
      const digest=webReleaseDigest(),releaseOptions={program:player.program,series:player.options.saveCompatibilitySeries,operations:player.operations,...(player.options.bindings?{bindings:player.options.bindings}:{})};
      if(player.requestedRelease)await verifyReleaseManifest(player.requestedRelease,releaseOptions,digest);ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');
      player.store=player.options.store??await openStore(player.namespace,player.options.database);player.ownsStore=!player.options.store;if(player.disposed){if(player.ownsStore)player.store.close();throw new GalboxError('PLAYER_CANCELLED','Creation cancelled');}
      player.preferencesSupported=!!player.store.readPreferences&&!!player.store.writePreferences;if(player.preferencesSupported){const stored=await player.store.readPreferences?.();if(stored)player.preferences=normalizePreferencesRecord(stored);}ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');player.host.applyAudioPreferences(player.preferences.value.audio);player.inputController.configure(player.preferences.value.input);
      await player.host.init(player.program,player.options.provider,player.abort.signal,player.resourceBudget,player.requestedRelease?.resources,player.options.streaming);
      const renderer=(player.options.textRenderer??createDomTextRenderer)({mount:player.options.mount,program:parseProgram(player.program),fontFamily:id=>player.host.fontFamily(id)});ensure(renderer&&typeof renderer.render==='function'&&typeof renderer.applyDisplayPreferences==='function'&&typeof renderer.dispose==='function','TEXT_RENDERER','Invalid text renderer');if(player.disposed){renderer.dispose();throw new GalboxError('PLAYER_CANCELLED','Creation cancelled');}player.text=renderer;renderer.applyDisplayPreferences(player.preferences.value.display);
      const manifest=player.requestedRelease??await createReleaseManifest({...releaseOptions,resources:player.host.resourceFacts(),limits:player.resourceBudget},digest);const sha256=await releaseFingerprint(manifest,digest);ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');player.release={origin:player.requestedRelease?'manifest':'derived',sha256,manifest};
      document.addEventListener('visibilitychange',player.visibility);window.addEventListener('blur',player.blur);window.addEventListener('focus',player.focus);
      await player.refreshSlots();if(player.program.flowchart){player.graphProfile=parseProfile((await player.store.read('main')).profile);player.graphCache=null;}const durable=await player.store.read();if(durable.head?.status==='committed-pending')player.lifecycle='committed-pending';player.frameId=requestAnimationFrame(player.frame);player.publish();return player;
    }catch(error){player.dispose();throw error;}
  }
  getSnapshot=():PlayerView=>this.cached;
  subscribe=(fn:()=>void):(()=>void)=>{this.listeners.add(fn);return ()=>this.listeners.delete(fn);};
  private publish():void {
    const core=this.runtime?.view()??null;this.fast=this.runtime?.playbackView().mode==='skip';
    if(core&&!this.disposed){this.host.render(core.run);this.text?.render(parseSnapshot(core.run));}
    this.cached={flowchart:this.flowView(core),backlog:this.backlogView(),saveSystem:{supported:!!this.store?.commitSave&&!!this.store?.saveReceipt&&!!this.store?.listSlots,policy:parseSavePolicy(this.savePolicy),pending:[...this.pendingSaves.values()].map(c=>({id:c.id,slot:c.slot}))},video:{...this.host.video},canReplayVoice:!!(core?.run.wait?.kind==='text'&&core.run.text?.voice)&&this.lifecycle==='playing'&&!this.pauses.size,playback:this.runtime?.playbackView()??{mode:'manual',reason:'manual',elapsedMs:0,voice:'none'},preferences:parsePreferencesRecord(this.preferences),preferencesSupported:this.preferencesSupported,release:this.release?{...this.release,manifest:parseReleaseManifest(this.release.manifest)}:null,resources:{...this.host.resources,limits:{...this.host.resources.limits},integrity:this.host.resources.integrity.map(row=>({id:row.id,factOrigin:row.factOrigin,evidence:parseIntegrityEvidence(row.evidence)}))},title:this.program.title,epoch:this.epoch,lifecycle:this.lifecycle,core,error:this.error??this.runtime?.storageError??this.runtime?.subscriberError??null,media:{...this.host.media},menu:this.menu,paused:this.pauses.size>0,fast:this.fast,namespace:this.namespace,profiles:this.profiles.map(p=>({...p})),profileId:this.profileId,slots:this.slots.map(s=>({...s,capture:s.capture?parseSaveCapture(s.capture):null})),importSources:this.options.bindings?.list()??[],importReport:this.pendingImport?.report()??null,lastImport:this.lastImport?{...this.lastImport}:null};
    this.maybeAutoSave();
    for(const listener of [...this.listeners]){try{listener();}catch(error){this.error=error instanceof Error?error.message:String(error);}}
  }
  private frame=(now:number):void=>{
    if(this.disposed)return;
    const ms=this.elapsed(now);
    if(this.runtime&&!this.pauses.size&&(this.lifecycle==='playing'||this.lifecycle==='preparing')) {
      void this.runtime.dispatch({type:'tick',ms}).catch(e=>this.fail(e));
    }
    this.frameId=requestAnimationFrame(this.frame);
  };
  private elapsed(now:number):number {
    if(this.lastTime===null){this.lastTime=now;return 0;}if(now<this.lastTime)return 0;const elapsed=Math.max(0,now-this.lastTime)+this.timeRemainder;const ms=Math.floor(elapsed);this.timeRemainder=elapsed-ms;this.lastTime=now;return Math.min(3600000,ms);
  }
  private visibility=():void=>{this.fast=false;this.setPause('hidden',document.hidden);};
  private blur=():void=>{this.fast=false;this.setPause('blur',true);};
  private focus=():void=>{this.setPause('blur',false);};
  private setPause(reason:string,value:boolean):void {if(value&&!this.pauses.size&&this.runtime)void this.runtime.dispatch({type:'tick',ms:this.elapsed(performance.now())}).catch(e=>this.fail(e));if(value){if(this.fastRequested||this.runtime?.playbackView().mode==='skip')this.setFast(false);this.inputController.clear();this.pauses.add(reason);}else this.pauses.delete(reason);void this.runtime?.pausePlayback(this.pauses.size>0).catch(e=>this.fail(e));this.lastTime=this.pauses.size?null:performance.now();this.host.pauseHistoryVoice([...this.pauses].some(p=>p!=='menu'&&p!=='history-voice'));void this.host.pause([...this.pauses].some(p=>p!=='activation')).catch(e=>this.fail(e));this.publish();}
  private fail(error:unknown):void {this.error=error instanceof Error?error.message:String(error);this.publish();}
  private inputId():string {return `${this.instance}:${++this.inputSeq}`;}
  private requireStore():Store {ensure(this.store&&!this.disposed,'PLAYER_DISPOSED','Player unavailable');return this.store;}
  private stopRuntime():void {const runtime=this.runtime;this.runtime=null;this.unsubscribe?.();this.unsubscribe=null;runtime?.stop();}
  private async refreshSlots():Promise<void> {
    if(this.disposed)return;const records=await this.requireStore().listSlots?.();const profiles=await this.requireStore().listProfiles?.();if(profiles)this.profiles=profiles.map(p=>({...p}));if(records)this.slots=records.map(r=>({slot:r.slot,revision:r.revision,profileId:r.metadata.profileId,label:r.metadata.label||r.slot,kind:r.metadata.kind??'legacy',capture:r.metadata.capture?parseSaveCapture(r.metadata.capture):null,hasPrevious:r.hasPrevious??false}));this.publish();
  }
  private async initialCandidate(profile:Profile,entryNode?:string):Promise<Core> {
    const candidate=new Core(this.program,profile,undefined,'initial',this.operations,this.program.rng&&'seedSource'in this.program.rng?crypto.getRandomValues(new Uint32Array(1))[0]:undefined,entryNode);candidate.accept({type:'text.preferences',value:this.preferences.value.text});let operations=0;
    for(;;){const result=candidate.run(this.options.budget??100);operations+=this.options.budget??100;ensure(operations<=100000,'STARTUP_BUDGET','Startup did not reach a semantic prompt');if(candidate.view().run.wait?.kind==='flush'){candidate.accept({type:'flushAck',revision:profile.revision});continue;}if(result==='stable')return candidate;await new Promise<void>(resolve=>queueMicrotask(resolve));}
  }
  async start(profileId='main'):Promise<void> {
    this.requireStore();const gen=++this.generation;this.lifecycle='preparing';this.publish();
    try {await this.host.unlock();await this.activate(null,gen,{profileId,start:true});}catch(error){this.precommitFailure(gen,error);throw error;}
  }
  async load(slot=profileSlot(this.profileId,'quick'),revision:'current'|'previous'='current'):Promise<void> {
    const store=this.requireStore(),gen=++this.generation;this.lifecycle='preparing';this.publish();
    try {const record=await store.readSlot(slot);ensure(record,'SLOT_EMPTY',slot);ensure(revision==='current'||revision==='previous','SLOT_REVISION','Unknown slot revision');const selected=revision==='previous'?record.previous:record.snapshot;ensure(selected,'SLOT_PREVIOUS_EMPTY',slot);const snapshot=validateRestore(this.program,selected,this.operations),metadata=(revision==='previous'?record.previousMetadata:record.metadata)??{profileId:'main',label:slot};await this.activate(snapshot,gen,{profileId:metadata.profileId,slot,...(metadata.recipe?{recipe:metadata.recipe}:{}),...(metadata.onLoad?{onLoad:metadata.onLoad}:{}),...(metadata.provenance!==undefined?{provenance:metadata.provenance}:{})});}
    catch(error){this.precommitFailure(gen,error);throw error;}
  }
  private precommitFailure(gen:number,error:unknown):void {if(gen===this.generation&&!this.disposed&&!['committed-pending','commit-unknown'].includes(this.lifecycle)){this.lifecycle=this.runtime?'playing':'ready';this.fail(error);}}
  private async install(activation:Activation,owner:string,gen:number):Promise<void> {
    const store=this.requireStore(),head=await store.read(activation.profileId??'main');
    ensure(head.head?.id===activation.id&&(head.head.owner??head.head.id)===owner&&gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Candidate no longer owns the durable head');
    const historyRecord=store.readHistory&&store.commitHistory&&store.historyReceipt?await store.readHistory(activation.profileId??'main'):{revision:0,entries:[]};ensure(gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','History preparation was superseded');this.inputController.clear();const candidate=new Core(this.program,head.profile,activation.snapshot,activation.mode??'restore',this.operations);candidate.accept({type:'text.preferences',value:this.preferences.value.text});const epoch=++this.epoch;this.host.setEpoch(epoch);this.host.render(candidate.view().run);this.text?.render(candidate.view().run);
    const runtime=new Coordinator(candidate,this.host,{defer:callback=>queueMicrotask(callback)},store,epoch,owner,`${this.instance}:${epoch}`,this.options.budget??100,new HistoryJournal(this.historyPolicy,historyRecord,activation.profileId??'main',owner,`history:${crypto.randomUUID()}`,store));this.runtime=runtime;this.unsubscribe=runtime.subscribe(()=>this.publish());this.profileId=activation.profileId??'main';this.onLoad=activation.onLoad;this.provenance=activation.provenance;
    await runtime.configurePlayback(this.preferences.value.playback);await runtime.pausePlayback(this.pauses.size>0);await runtime.start();await this.host.awaitAudioStarts();this.host.assertReady();ensure(gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Takeover was superseded');
    await store.confirm(activation.id,owner);const confirmed=await store.read(this.profileId);ensure(confirmed.head?.id===activation.id&&(confirmed.head.owner??confirmed.head.id)===owner&&gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Head changed during takeover');
    this.lifecycle='playing';this.error=null;if(activation.slot||activation.mode!=='initial')this.lastAutoCut=this.autoCut();this.publish();
  }
  private async activate(baseline:Snapshot|null,gen:number,policy:LoadPolicy):Promise<void> {
    const work=this.activationTail.catch(()=>{}).then(async()=>{
      ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','A newer request replaced this candidate');const store=this.requireStore(),old=this.runtime;this.host.assertReady();this.stopHistoryVoice();this.setPause('activation',true);
      let committed=false,committing=false,id:string|null=null,expectedHead:string|null=null;
      try {
        if(old){await old.freeze();await old.flushAll();}ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate became stale');
        if(policy.entryNode!==undefined)ensure(!old||old.view().canSave,'FLOW_ENTRY_UNAVAILABLE',old?.view().saveReason??'Current cut cannot be left');const durable=await store.read(policy.profileId);this.graphProfile=parseProfile(durable.profile);expectedHead=durable.head?.id??null;let snapshot:Snapshot,changes:readonly ProgressChange[]=[],mode:'initial'|'restore'='restore';
        if(policy.start){const candidate=await this.initialCandidate(durable.profile,policy.entryNode);const v=candidate.view();ensure(v.canSave||v.saveReason==='VIDEO_ACTIVE_UNRESTORABLE','SAVE_UNAVAILABLE',v.saveReason??'startup');snapshot=parseSnapshot(v.run);changes=candidate.pending();mode='initial';}
        else {ensure(baseline,'LOAD_BASELINE','Missing snapshot');snapshot=validateRestore(this.program,baseline,this.operations);if(policy.recipe){const prepared=prepareRestoreRecipe(this.program,durable.profile,snapshot,policy.recipe,{operations:this.operations});snapshot=prepared.snapshot;changes=prepared.changes;mode='initial';}}
        ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate became stale during preparation');id=`${this.instance}:a${gen}`;
        this.host.validateGraphicsPlan(snapshot);this.host.validateAudioPlan(snapshot);await this.host.revalidateStreams();ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate replaced during media validation');
        const initial=changes.length?Object.freeze({id:`${id}:initial`,baseRevision:durable.profile.revision,through:changes.at(-1)?.seq??0,changes:Object.freeze(changes.map(c=>c.type==='read'?Object.freeze({...c}):c.type==='set'?Object.freeze({...c,value:freezeJson(c.value)}):Object.freeze({...c,value:freezeJson(c.value)})))}):undefined;
        this.host.assertReady();committing=true;const activation=await store.activate(id,snapshot,expectedHead,durable.profile.revision,initial,{profileId:policy.profileId,mode,owner:id,...(policy.onLoad?{onLoad:policy.onLoad}:{}),...(policy.provenance!==undefined?{provenance:policy.provenance}:{}),...(policy.slot?{slot:policy.slot}:{})});committed=true;old?.stop();this.unsubscribe?.();this.runtime=null;this.lifecycle='committed-pending';this.publish();await this.install(activation,id,gen);
      }catch(error){
        if(committing&&!committed){try{const current=await store.read(policy.profileId);if(current.head?.id===id||(current.head?.id??null)!==expectedHead)committed=true;}catch{old?.stop();this.stopRuntime();this.lifecycle='commit-unknown';this.fail(new GalboxError('ACTIVATION_COMMIT_UNKNOWN','Outcome unavailable; reconcile the durable head before continuing'));throw error;}}
        if(committed){old?.stop();this.stopRuntime();if(!this.disposed){this.lifecycle='committed-pending';this.fail(error);}}else if(!this.disposed){this.lifecycle=old?'playing':'ready';old?.thaw();}throw error;
      }finally{this.setPause('activation',false);}
    });this.activationTail=work;return work;
  }
  async resumeCommitted(expectedId?:string):Promise<void> {
    const store=this.requireStore(),gen=++this.generation;
    const work=this.activationTail.catch(()=>{}).then(async()=>{
      const durable=await store.read();ensure(durable.head&&(!expectedId||durable.head.id===expectedId),'ACTIVATION_SUPERSEDED','Requested head is no longer current');ensure(durable.head.status==='committed-pending','ACTIVATION_NOT_PENDING','Use an explicit load for an already activated session');const claim=store.claim?.bind(store);ensure(claim,'STORAGE_CLAIM_UNSUPPORTED','Storage does not support recovery ownership');
      await this.host.revalidateStreams();ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Recovery replaced during media validation');const owner=`${this.instance}:retry${gen}`;const activation=await claim(durable.head.id,owner);this.stopRuntime();this.lifecycle='committed-pending';this.setPause('activation',true);
      try{await this.install(activation,owner,gen);}catch(error){this.stopRuntime();if(!this.disposed){this.lifecycle='committed-pending';this.fail(error);}throw error;}finally{this.setPause('activation',false);}
    });this.activationTail=work;return work;
  }
  async save(requestedSlot?:string,expectedRevision?:number):Promise<SaveResult> {
    const store=this.requireStore(),runtime=this.runtime;ensure(runtime,'PLAYER_NOT_STARTED','Start first');const profileId=this.profileId,slot=requestedSlot??(profileId==='main'?'quick':`${profileId}:quick`),metadata:SlotMetadata={profileId,label:profileId==='main'?'快速存档':'快速存档（独立导入进度）',...(this.onLoad?{recipe:this.onLoad,onLoad:this.onLoad}:{}),...(this.provenance!==undefined?{provenance:this.provenance}:{})};const captured=runtime.core.capture();
    const previous=expectedRevision===undefined?await store.readSlot(slot):null;await runtime.flushAll();const result=await store.save(slot,captured,expectedRevision??previous?.revision??0,metadata);if(!this.disposed){try{await this.refreshSlots();}catch(error){this.fail(error);}}return {slot,revision:result.revision,disposed:this.disposed};
  }
  private autoCut():string {const run=this.runtime?.view().run,w=run?.wait;return w&&(w.kind==='text'||w.kind==='choice')?`${this.epoch}:${w.kind}:${w.prompt}`:'';}
  private maybeAutoSave():void {
    if(this.savePolicy.auto!=='on-prompt'||this.autoSaving||this.disposed||this.lifecycle!=='playing'||!this.cached.saveSystem.supported||!this.runtime?.view().canSave)return;
    const cut=this.autoCut();if(!cut||cut===this.lastAutoCut)return;this.lastAutoCut=cut;this.autoSaving=true;
    void this.saveGameAt({kind:'auto'},cut).catch(e=>{if(!(e instanceof GalboxError&&e.code==='SAVE_CUT_CHANGED'))this.fail(e);}).finally(()=>{this.autoSaving=false;if(!this.disposed)this.publish();});
  }
  quickSave():Promise<IllustratedSaveResult> {return this.saveGame({kind:'quick'});}
  quickLoad():Promise<void> {return this.load(profileSlot(this.profileId,'quick'));}
  saveGame(input:SaveGameOptions={}):Promise<IllustratedSaveResult> {return this.saveGameAt(parseSaveGameOptions(input));}
  private saveGameAt(input:SaveGameOptions,expectedCut?:string):Promise<IllustratedSaveResult> {
    const options=parseSaveGameOptions(input),work=this.saveTail.catch(()=>{}).then(async()=>{
      const store=this.requireStore();ensure(store.commitSave&&store.saveReceipt&&store.listSlots,'SAVE_SYSTEM_UNSUPPORTED','Store lacks the save system ports');const requestedRuntime=this.runtime;ensure(requestedRuntime,'PLAYER_NOT_STARTED','Start first');const profileId=this.profileId,gen=this.generation;
      const rows=await store.listSlots(),selected=selectSaveSlot(rows,profileId,this.savePolicy,options),id=crypto.randomUUID();let payload:SaveCommit|undefined;
      const capture=this.activationTail.catch(()=>{}).then(async()=>{
        ensure(!this.disposed&&this.runtime===requestedRuntime&&this.generation===gen,'SAVE_CAPTURE_CANCELLED','Session changed before capture');const runtime=requestedRuntime;await runtime.freeze();
        try{
          ensure(!this.disposed&&this.runtime===runtime,'SAVE_CAPTURE_CANCELLED','Player closed');ensure(!expectedCut||expectedCut===this.autoCut(),'SAVE_CUT_CHANGED','Automatic capture superseded');
          const snapshot=runtime.core.capture(),text=this.text,capture=parseSaveCapture({id,sequence:++this.captureSequence,logicalTime:snapshot.logicalTime,createdAt:Date.now(),speaker:(snapshot.text?.speaker??'').slice(0,512),text:(snapshot.text?.content??'').slice(0,4096),textId:snapshot.text?.textId??null});
          if(options.image!=='none'){ensure(text?.capture,'SAVE_CAPTURE_UNSUPPORTED','Text renderer must implement synchronous capture');const drawing=text.capture(parseSnapshot(snapshot),this.host.captureFontCSS());capture.thumbnail=await this.host.captureThumbnail(snapshot,drawing,this.abort.signal);}
          ensure(!this.disposed,'SAVE_CAPTURE_CANCELLED','Player closed during capture');
          const metadata:SlotMetadata={profileId,label:options.label??(selected.kind==='quick'?(profileId==='main'?'快速存档':'快速存档（独立导入进度）'):selected.kind==='auto'?'自动存档':`手动存档 ${selected.slot}`),kind:selected.kind,capture,...(this.onLoad?{recipe:this.onLoad,onLoad:this.onLoad}:{}),...(this.provenance!==undefined?{provenance:this.provenance}:{})};
          payload=parseSaveCommit({id,slot:selected.slot,expectedRevision:selected.revision,snapshot,metadata});await runtime.flushAll();
        }finally{runtime.thaw();this.lastTime=this.pauses.size?null:performance.now();}
      });this.activationTail=capture;await capture;ensure(payload,'SAVE_CAPTURE','No save captured');this.pendingSaves.set(id,payload);this.publish();return this.commitCaptured(store,payload);
    });this.saveTail=work.then(()=>{},()=>{});return work;
  }
  private async commitCaptured(store:Store,payload:SaveCommit):Promise<IllustratedSaveResult> {
    try{const result=await submitSave(store,payload);this.pendingSaves.delete(payload.id);if(this.saveFailure&&this.error===this.saveFailure)this.error=null;this.saveFailure=null;if(!this.disposed){try{await this.refreshSlots();}catch(e){this.fail(e);}}return {id:result.receipt.id,slot:result.receipt.slot,revision:result.receipt.revision,committed:true,reconciled:result.reconciled,disposed:this.disposed};}
    catch(e){if(!(e instanceof SaveOutcomeError&&e.outcome==='unknown'))this.pendingSaves.delete(payload.id);if(!this.disposed){this.saveFailure=e instanceof Error?e.message:String(e);this.fail(e);}throw e;}
  }
  retrySave(id:string):Promise<IllustratedSaveResult> {const store=this.requireStore(),data=this.pendingSaves.get(id);ensure(data,'SAVE_RETRY_MISSING','Unknown pending save ID');const work=this.saveTail.catch(()=>{}).then(()=>this.commitCaptured(store,data));this.saveTail=work.then(()=>{},()=>{});return work;}
  async inspectSave(id:string):Promise<DeepReadonly<import('../protocol/index.js').SaveReceipt>|null> {const store=this.requireStore();ensure(store.saveReceipt,'SAVE_SYSTEM_UNSUPPORTED','No durable receipt port');return store.saveReceipt(id);}
  async refreshSaveLibrary():Promise<void> {this.requireStore();await this.refreshSlots();}
  async renameSave(slot:string,expectedRevision:number,label:string):Promise<void> {const store=this.requireStore();ensure(store.renameSlot,'SAVE_SYSTEM_UNSUPPORTED','No rename port');await store.renameSlot(slot,expectedRevision,label);if(!this.disposed)await this.refreshSlots();}
  async deleteSave(slot:string,expectedRevision:number):Promise<void> {const store=this.requireStore();ensure(store.deleteSlot,'SAVE_SYSTEM_UNSUPPORTED','No delete port');await store.deleteSlot(slot,expectedRevision);if(!this.disposed)await this.refreshSlots();}
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
    const runtime=this.runtime;this.fastRequested=false;const manual=runtime.setPlayback('manual');const ticking=runtime.dispatch({type:'tick',ms:this.elapsed(performance.now())});
    let event:CoreEvent;
    if(action==='choose'){ensure(option,'CHOICE_OPTION','Missing option');event={type:'choose',prompt,option,inputId:this.inputId()};}
    else event={type:action,prompt,inputId:this.inputId()};
    await Promise.all([manual,ticking,runtime.dispatch(event)]);
  }
  async step(prompt:number,epoch:number):Promise<void> {await this.input('step',prompt,epoch);}
  async resumeOperation(event:OperationResume,epoch:number):Promise<void> {
    if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;
    const runtime=this.runtime;await Promise.all([runtime.dispatch({type:'tick',ms:this.elapsed(performance.now())}),runtime.dispatch(event)]);
  }
  async activateInteraction(prompt:number,attempt:number,epoch:number):Promise<void> {const received=performance.now();if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;const w=this.runtime.view().run.wait;if(w?.kind!=='interaction'||w.prompt!==prompt||w.attempt!==attempt||w.phase!=='prepared')return;const runtime=this.runtime,ms=this.elapsed(received);await Promise.all([runtime.dispatch({type:'tick',ms}),runtime.dispatch({type:'interaction.activate',prompt,attempt})]);}
  async chooseInteraction(option:string,prompt:number,attempt:number,epoch:number):Promise<void> {await this.interact({type:'interaction.choose',option,prompt,attempt,inputId:this.inputId()},epoch);}
  async pointInteraction(x:number,y:number,prompt:number,attempt:number,epoch:number):Promise<void> {ensure(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1280&&y>=0&&y<=720,'INTERACTION_POINT','Point exceeds viewport');await this.interact({type:'interaction.point',x,y,prompt,attempt,inputId:this.inputId()},epoch);}
  private async interact(event:import('../protocol/index.js').InteractionEvent,epoch:number):Promise<void> {const received=performance.now();if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;const w=this.runtime.view().run.wait;if(w?.kind!=='interaction'||w.prompt!==event.prompt||w.attempt!==event.attempt)return;const input=parseInteractionEvent(event),runtime=this.runtime,ms=this.elapsed(received);await Promise.all([runtime.setPlayback('manual'),runtime.dispatch({type:'tick',ms}),runtime.dispatch(input)]);}
  async skipVideo(prompt:number,epoch:number):Promise<void> {const received=performance.now();if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;const runtime=this.runtime,w=runtime.view().run.wait;if(w?.kind!=='video'||w.prompt!==prompt)return;await Promise.all([runtime.dispatch({type:'tick',ms:this.elapsed(received)}),runtime.dispatch({type:'video.skip',prompt,inputId:this.inputId()})]);}
  async retryVideo():Promise<void> {await this.host.unlock();for(const t of this.runtime?.view().run.tasks??[])if(t.kind==='video'&&t.status==='blocked')await this.runtime?.dispatch({type:'retry',task:t.id});}
  async replayHistory(id:string,epoch=this.epoch):Promise<void> {
    this.requireStore();ensure(epoch===this.epoch&&this.lifecycle==='playing'&&this.runtime,'HISTORY_STALE','History session changed');ensure(![...this.pauses].some(p=>p!=='menu'&&p!=='history-voice'),'HISTORY_VOICE_PAUSED','History preview is paused');const row=this.backlogView().entries.find(e=>e.id===id);ensure(row?.text.voice,'HISTORY_VOICE_UNAVAILABLE','This history entry has no voice');validateVoiceRecipe(this.program,row.text.voice);this.setPause('history-voice',true);try{await this.host.playHistoryVoice(id,{...row.text.voice});}catch(e){this.setPause('history-voice',false);throw e;}
  }
  stopHistoryVoice():void {this.host.stopHistoryVoice();if(this.pauses.has('history-voice'))this.setPause('history-voice',false);}
  async rollback(id:string,epoch=this.epoch):Promise<void> {
    this.requireStore();const runtime=this.runtime;ensure(runtime&&epoch===this.epoch&&this.lifecycle==='playing','HISTORY_STALE','History session changed');ensure(runtime.view().canSave,'HISTORY_ROLLBACK_UNAVAILABLE',runtime.view().saveReason??'Current cut cannot be restored');const row=this.backlogView().entries.find(e=>e.id===id);ensure(row?.canRollback,'HISTORY_CHECKPOINT_UNAVAILABLE',row?.rollbackReason??'Checkpoint is not visible');const snapshot=runtime.history?.checkpoint(id,runtime.view().run.history);ensure(snapshot,'HISTORY_CHECKPOINT_MISSING','No checkpoint was captured');validateRestore(this.program,snapshot,this.operations);const gen=++this.generation;this.stopHistoryVoice();this.lifecycle='preparing';this.publish();try{await this.activate(snapshot,gen,{profileId:this.profileId,...(this.onLoad?{onLoad:this.onLoad}:{}),...(this.provenance!==undefined?{provenance:this.provenance}:{})});}catch(e){this.precommitFailure(gen,e);throw e;}
  }
  async replayVoice():Promise<void> {const runtime=this.runtime,view=this.getSnapshot(),wait=view.core?.run.wait;ensure(runtime&&view.canReplayVoice&&wait?.kind==='text','VOICE_REPLAY_UNAVAILABLE','Current text has no replayable voice');await runtime.dispatch({type:'voice.replay',prompt:wait.prompt,inputId:this.inputId()});}
  async retryAudio():Promise<void> {await this.host.unlock();for(const t of this.runtime?.view().run.tasks??[])if((t.kind==='audio'||t.kind==='media')&&t.status==='blocked')await this.runtime?.dispatch({type:'retry',task:t.id});this.publish();}
  setMenu(value:boolean):void {if(!value)this.stopHistoryVoice();this.menu=value;if(this.runtime?.playbackView().mode==='skip')this.setFast(false);this.setPause('menu',value);}
  setPaused(value:boolean):void {this.setPause('user',value);}
  setFast(value:boolean):void {if(this.disposed||!value&&!this.fastRequested&&this.runtime?.playbackView().mode!=='skip')return;this.fastRequested=value&&!this.pauses.size&&this.lifecycle==='playing';void this.runtime?.setPlayback(this.fastRequested?'skip':'manual').then(()=>this.publish()).catch(e=>this.fail(e));}
  async setAuto(value:boolean):Promise<void> {ensure(this.runtime&&this.lifecycle==='playing','PLAYER_NOT_STARTED','Start reading before changing playback mode');this.fastRequested=false;await this.runtime.setPlayback(value?'auto':'manual');this.publish();}
  attachInput(root:HTMLElement):()=>void {this.requireStore();return this.inputController.attach(root);}
  resetPreferences():Promise<PreferencesResult>{return this.updatePreferences({audio:this.preferencesDefaults.audio,text:this.preferencesDefaults.text,playback:this.preferencesDefaults.playback,input:this.preferencesDefaults.input,display:this.preferencesDefaults.display});}
  exportPreferences():DeepReadonly<import('../protocol/index.js').PlayerPreferences>{this.requireStore();return parsePlayerPreferences(this.preferences.value);}
  importPreferences(input:unknown):Promise<PreferencesResult>{const value=normalizePreferences(input);return this.updatePreferences({audio:value.audio,text:value.text,playback:value.playback,input:value.input,display:value.display});}
  setVolume(value:number):void {this.host.setVolume(value);}
  private async applyPreferences(record:PreferencesRecord):Promise<void> {this.preferences=normalizePreferencesRecord(record);if(this.disposed)return;const value=this.preferences.value;this.host.applyAudioPreferences(value.audio);this.text?.applyDisplayPreferences(value.display);this.inputController.configure(value.input);await this.runtime?.configurePlayback(value.playback);await this.runtime?.dispatch({type:'text.preferences',value:value.text});this.publish();}
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
    this.unsubscribe?.();this.runtime?.stop();this.inputController.dispose();this.host.observeHistoryVoice(null);this.host.dispose();if(this.host.disposalError)this.error=String(this.host.disposalError);try{this.text?.dispose();}catch(error){this.error=String(error);}this.text=null;this.lifecycle='disposed';this.publish();this.listeners.clear();
    // IDB transactions already started finish before db.close. Borrowed stores remain open.
    if(this.ownsStore)this.store?.close();
  }
}
export async function createPlayer(options:PlayerOptions):Promise<Player> {return Player.create(options);}

export type {GraphicsOptions} from '../protocol/index.js';

export type {MediaStreamProvider,MediaStreamLease,MediaStreamRequest,Cancellation} from '../runtime/stream-ports.js';
export type {StreamingOptions,IntegrityEvidence,ResolvedStreamIdentity} from '../protocol/index.js';
