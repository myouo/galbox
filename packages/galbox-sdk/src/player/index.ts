import {dialoguePresentation,assertDialogueCut} from '../web-host/dialogue.js';
import {bindProgramText} from '../program-tools/localization.js';
import {parseUISoundRequest,parseProgramTextCatalog} from '../protocol/index.js';
import type {UISoundRequest} from '../protocol/index.js';
import type {UISoundView,UISoundResult} from '../web-host/ui-sound.js';
export type {UISoundView,UISoundResult} from '../web-host/ui-sound.js';
import {isModuleProgram} from '../program-tools/module-program.js';
import type {ModuleProgram} from '../program-tools/module-program.js';
import {WebCodeModules} from '../web-host/code-modules.js';
import type {CodeModuleProvider} from '../web-host/code-modules.js';
import {wireDigest} from '../protocol/digest.js';
export {createHttpModuleProvider} from '../web-host/code-modules.js';
export type {CodeModuleProvider,CodeModuleRequest,CodeModuleLease} from '../web-host/code-modules.js';
import {loadingPolicy,validateLoading} from '../protocol/loading.js';
import type {HostPreparation} from '../runtime/ports.js';
import {BrowserScheduler} from '../web-host/scheduler.js';
import {parseSystemScreen,parseGamePresentation} from '../protocol/index.js';
import {ScriptUIRenderer} from '../web-host/script-ui.js';
import {parseUIAction,parseUIEvent} from '../protocol/index.js';
import {projectExtras} from '../runtime/extras.js';
import type {ExtrasView} from '../runtime/extras.js';
import {requireExtra,extrasSignature} from '../protocol/extras.js';
import type {ExtraKind} from '../protocol/extras.js';
import {MemoryStore} from '../runtime/memory-store.js';
import type {ExtraSession,ExtraSessionView,PreviewKind} from './extras.js';
export type {ExtrasView,ExtraView} from '../runtime/extras.js';
export type {ExtraSessionView} from './extras.js';
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
import { parseProgram, parseSnapshot, parseJsonValue, ensure, readUnit, GalboxError,parseResourceBudget,parseReleaseManifest, parsePlayerPreferences, parsePreferencesRecord, parsePreferencesPatch,parseInteractionEvent,parseIntegrityEvidence,parseSlotMetadata,parseSaveCommit,parseSaveCapture,parseProfile,emptyProfile,parseGraphicsOptions,parseStreamingOptions } from '../protocol/index.js';
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
import {bindSavedGameMigrations,migrateSavedGame} from '../backups/saved-game.js';
import type {SavedGameMigration} from '../backups/saved-game.js';
import type {PreparedBackupRestore,ContentMigration,PortableBackup,BackupRestoreReceipt} from '../backups/index.js';
import type { AssetProvider } from '../web-host/assets.js';
export { createHttpProvider } from '../web-host/assets.js';
export type { AssetProvider, AssetLease, AssetRequest } from '../web-host/assets.js';
export type { Store } from '../runtime/ports.js';
export interface PlayerOptions {menuAudio?:'pause'|'continue';
  resourceAudio?:'pause'|'continue';dialogue?:import('../protocol/index.js').DialoguePresentation;galleryAt?:readonly string[];savedGameMigrations?:readonly SavedGameMigration[];textCatalog?:unknown;locale?:string;moduleProvider?:CodeModuleProvider;loading?:import('../protocol/index.js').LoadingOptions;history?:import('../protocol/index.js').HistoryPolicy;saves?:SavePolicy;program:unknown;provider:AssetProvider;mount:HTMLElement;saveCompatibilitySeries:string;database?:string;store?:Store;budget?:number;operations?:OperationRegistry;bindings?:SaveBindingRegistry;release?:unknown;resourceBudget?:unknown;signal?:AbortSignal;streaming?:import('../protocol/index.js').StreamingOptions;graphics?:import('../protocol/index.js').GraphicsOptions;preferencesDefaults?:unknown;textRenderer?:TextRendererFactory;}
export interface ReleaseView {readonly origin:'manifest'|'derived'|'modules';readonly sha256:string;readonly manifest:DeepReadonly<ReleaseManifest>;}
export interface PreferencesResult {readonly record:DeepReadonly<PreferencesRecord>;readonly committed:true;readonly disposed:boolean;}
export interface SaveLibraryEntry {readonly slot:string;readonly revision:number;readonly profileId:string;readonly label:string;readonly kind:'manual'|'quick'|'auto'|'legacy';readonly capture:DeepReadonly<import('../protocol/index.js').SaveCapture>|null;readonly hasPrevious:boolean;}
export interface BacklogView {readonly entries:readonly BacklogItem[];readonly storage:'durable'|'memory';readonly policy:DeepReadonly<import('../protocol/index.js').HistoryPolicy>;readonly voice:import('../web-host/history-voice.js').HistoryVoiceView;}
export interface PlayerView {readonly dialogueVisible:boolean;readonly dialoguePending:boolean;readonly loading:ReturnType<WebHost['loadingView']>&{readonly phase:'idle'|'loading'|'failed';readonly error:string|null};readonly presentation:DeepReadonly<import('../protocol/index.js').GamePresentation>|null;readonly systemScreen:import('../protocol/index.js').SystemScreen;readonly context:'story'|'gallery';readonly extras:ExtrasView|null;readonly extraSession:ExtraSessionView|null;readonly music:import('../web-host/history-voice.js').HistoryVoiceView;readonly flowchart:FlowchartView|null;readonly backlog:BacklogView;
  readonly saveSystem:{readonly supported:boolean;readonly policy:DeepReadonly<SavePolicy>;readonly pending:readonly {id:string;slot:string}[]};
  readonly video:Readonly<import('../web-host/video-types.js').VideoDiagnostics>;readonly canReplayVoice:boolean;readonly playback:PlaybackView;readonly preferences:DeepReadonly<PreferencesRecord>;readonly preferencesSupported:boolean;
  readonly release:ReleaseView|null;readonly resources:DeepReadonly<ResourceDiagnostics>;
  readonly title:string;readonly epoch:number;readonly lifecycle:'ready'|'playing'|'preparing'|'committed-pending'|'commit-unknown'|'disposed';readonly core:CoreView|null;readonly error:string|null;
  readonly uiSound:UISoundView;readonly media:Readonly<MediaDiagnostics>;readonly menu:boolean;readonly paused:boolean;readonly fast:boolean;readonly namespace:string;readonly profiles:readonly {profileId:string;revision:number}[];readonly profileId:string;readonly slots:readonly SaveLibraryEntry[];readonly importSources:readonly {sourceKey:string;schema:string;version:number;label:string}[];readonly importReport:ConversionReport|null;readonly lastImport:{slot:string;profileId:string}|null;
}
export interface ImportResult {readonly id:string;readonly slot:string;readonly profileId:string;readonly revision:number;readonly committed:true;readonly disposed:boolean;}
interface LoadPolicy {profileId:string;entryNode?:string;entryScene?:string;recipe?:RestoreRecipe;onLoad?:RestoreRecipe;provenance?:JsonValue;slot?:string;start?:boolean;}
export interface SaveResult {readonly slot:string;readonly revision:number;readonly disposed:boolean;}
export interface BackupRestoreResult {readonly id:string;readonly profiles:BackupRestoreReceipt['profiles'];readonly slots:BackupRestoreReceipt['slots'];readonly committed:true;readonly disposed:boolean;}
export interface IllustratedSaveResult extends SaveResult {readonly id:string;readonly committed:true;readonly reconciled:boolean;}
export class Player {
  private readonly graphicsPolicy:import('../protocol/index.js').GraphicsOptions;
  private readonly streamingPolicy:import('../protocol/index.js').StreamingOptions|undefined;
  private readonly extrasIdentity:string|null;
  private replayOnly=false;
  private extra:ExtraSession|null=null;
  private extrasCache:{key:string;value:ExtrasView|null}|null=null;
  private graphProfile:Profile=emptyProfile();
  private graphCache:{key:string;value:FlowchartView|null}|null=null;
  private readonly historyPolicy:import('../protocol/index.js').HistoryPolicy;
  private readonly savePolicy:SavePolicy;
  private captureSequence=0;private saveFailure:string|null=null;
  private saveTail:Promise<void>=Promise.resolve();
  private readonly pendingSaves=new Map<string,SaveCommit>();
  private readonly galleryPoints:ReadonlySet<string>;
  private savedGameMigrations:readonly SavedGameMigration[]=[];
  private autoSaving=false;private lastAutoCut='';
  private readonly backupCommits=new WeakMap<PreparedBackupRestore,string>();
  private runtime:Coordinator|null=null;
  private readonly scheduler=new BrowserScheduler();
  private candidateController=new AbortController();private resourcePaused=false;private readonly loadingPolicy:import('../protocol/index.js').LoadingOptions;
  private nextGeneration():number {this.restoreDialogue();this.host.stopUISound();this.candidateController.abort();this.candidateController=new AbortController();return ++this.generation;}
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
  private scriptUI:ScriptUIRenderer|null=null;
  private readonly inputController:InputController;
  private readonly program:Program;private readonly moduleSource:ModuleProgram|null;
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
  private systemScreen:import('../protocol/index.js').SystemScreen='title';
  private screenGeneration=0;
  private readonly presentation:DeepReadonly<import('../protocol/index.js').GamePresentation>|null;
  private fast=false;
  private fastRequested=false;
  private frameId=0;
  private backgroundTimer:ReturnType<typeof setTimeout>|null=null;
  private windowBlurred=!document.hasFocus();
  private wasBackground=false;
  private lastTime:number|null=null;
  private timeRemainder=0;
  private unsubscribe:(()=>void)|null=null;
  private readonly menuAudioPolicy:'pause'|'continue';private readonly resourceAudioPolicy:'pause'|'continue';private readonly dialoguePresentation:import('../protocol/index.js').DialoguePresentation;private dialogueHidden=false;private dialoguePending=false;private dialogueGeneration=0;
  private lifecycle:PlayerView['lifecycle']='ready';
  private error:string|null=null;
  private cached:PlayerView;
  readonly namespace:string;
  private readonly instance=crypto.randomUUID();
  private constructor(private readonly options:PlayerOptions,private readonly codeModules:WebCodeModules|null=null){
    ensure(options.menuAudio===undefined||options.menuAudio==='pause'||options.menuAudio==='continue','MENU_AUDIO_POLICY','Invalid menu audio policy');this.menuAudioPolicy=options.menuAudio??'pause';ensure(options.resourceAudio===undefined||options.resourceAudio==='pause'||options.resourceAudio==='continue','RESOURCE_AUDIO_POLICY','Invalid resource audio policy');this.resourceAudioPolicy=options.resourceAudio??'continue';this.moduleSource=isModuleProgram(options.program)?options.program:null;this.loadingPolicy=loadingPolicy(options.loading??{mode:'eager'});this.graphicsPolicy=parseGraphicsOptions(options.graphics??{renderer:'auto'});this.streamingPolicy=options.streaming===undefined?undefined:parseStreamingOptions(options.streaming);this.historyPolicy=historyPolicy(this.moduleSource?{...options.history,rollback:false}:options.history);this.savePolicy=parseSavePolicy(options.saves??defaultSavePolicy);this.operations=options.operations??emptyOperations;this.program=this.moduleSource?this.moduleSource.program([this.moduleSource.entryModule]):linkProgram(options.program,this.operations).copy();validateLoading(this.program,this.loadingPolicy,this.moduleSource?.describe().functionOrder);if(this.savePolicy.autoAt){ensure(!this.moduleSource,'MODULE_UNSUPPORTED','Authored autosave points require a classic Program');const points=new Set(this.program.functions.flatMap(f=>f.code.filter(i=>['text.page','text.rich','text.template','choice'].includes(i.op)).map(i=>i.at)));ensure(this.savePolicy.autoAt.every(at=>points.has(at)),'SAVE_AUTOSAVE_POINT','Autosave points must name declared text or choice instructions');}ensure(!this.moduleSource||!options.savedGameMigrations?.length,'MODULE_UNSUPPORTED','Saved-game migrations require a classic Program');this.savedGameMigrations=bindSavedGameMigrations(options.savedGameMigrations??[],this.program,options.saveCompatibilitySeries);this.extrasIdentity=extrasSignature(this.program);this.presentation=this.program.presentation?freezeJson(parseGamePresentation(this.program.presentation)):null;
    this.dialoguePresentation=dialoguePresentation(options.dialogue,this.program);
    const galleryPoints=options.galleryAt??[];ensure(Array.isArray(galleryPoints)&&galleryPoints.length<=256&&new Set(galleryPoints).size===galleryPoints.length&&galleryPoints.every(at=>typeof at==='string'&&this.program.functions.some(f=>f.code.some(i=>i.at===at&&i.op==='choice'))),'EXTRAS_ENTRY_POINT','Gallery points must be unique declared choices');ensure(!this.moduleSource||!galleryPoints.length,'MODULE_UNSUPPORTED','Authored gallery points require a classic Program');this.galleryPoints=new Set(galleryPoints);
    this.namespace=storageNamespace(this.program.gameId,options.saveCompatibilitySeries);this.requestedRelease=this.moduleSource?this.moduleSource.describe().release:options.release===undefined?null:parseReleaseManifest(options.release);this.resourceBudget=parseResourceBudget(options.resourceBudget??this.requestedRelease?.limits??defaultResourceBudget);ensure(!this.requestedRelease||canonicalReleaseJSON(this.resourceBudget)===canonicalReleaseJSON(this.requestedRelease.limits),'RELEASE_BUDGET','Player budget differs from manifest');
    this.preferencesDefaults=normalizePreferences({...normalizePreferences(options.preferencesDefaults??defaultPreferences()),...(options.locale!==undefined?{locale:options.locale}:{})});this.preferences={revision:0,value:parsePlayerPreferences(this.preferencesDefaults)};
    this.host=new WebHost(options.mount,error=>{this.setPause('device',true);this.fail(error);},this.graphicsPolicy);this.host.observeUISound(()=>this.publish());this.host.applyAudioPreferences(this.preferences.value.audio);
    this.inputController=new InputController({state:()=>{const v=this.getSnapshot(),w=v.core?.run.wait;return {epoch:v.epoch,prompt:w&&'prompt'in w?w.prompt??null:null,text:w?.kind==='text'||(w?.kind==='group'||w?.kind==='delay')&&w.prompt!==undefined,playing:v.lifecycle==='playing',paused:v.paused||v.loading.phase!=='idle',menu:v.menu,history:v.dialogueVisible&&!!(v.core?.run.text||v.backlog.entries.length)};},advance:(prompt,epoch)=>this.step(prompt,epoch).catch(e=>this.fail(e)),menu:()=>{if(this.dialogueHidden){this.restoreDialogue();this.publish();}else this.setMenu(!this.menu);},auto:()=>{void this.setAuto(this.runtime?.playbackView().mode!=='auto').catch(e=>this.fail(e));},skip:value=>this.setFast(value),quickSave:()=>{if(!this.replayOnly)void this.quickSave().catch(e=>this.fail(e));},quickLoad:()=>{if(!this.replayOnly)void this.quickLoad().catch(e=>this.fail(e));},history:()=>{void this.showSystemScreen('history').catch(e=>this.fail(e));}},this.preferences.value.input,this.preferencesDefaults.input.wheelMode??'gesture');this.inputController.attach(options.mount);
    this.cached={dialogueVisible:!this.dialogueHidden,dialoguePending:this.dialoguePending,loading:{...this.host.loadingView(),...(this.runtime?.resourceView()??{phase:'idle',error:null})},presentation:this.presentation,systemScreen:this.systemScreen,context:this.replayOnly?'gallery':'story',extras:this.extrasView(),extraSession:this.extraView(),music:this.host.musicView(),flowchart:this.flowView(),backlog:this.backlogView(),saveSystem:{supported:!!this.store?.commitSave&&!!this.store?.saveReceipt&&!!this.store?.listSlots,policy:parseSavePolicy(this.savePolicy),pending:[...this.pendingSaves.values()].map(c=>({id:c.id,slot:c.slot}))},video:{...this.host.video},canReplayVoice:false,playback:this.runtime?.playbackView()??{mode:'manual',reason:'manual',elapsedMs:0,voice:'none'},preferences:this.preferencesView(),preferencesSupported:this.preferencesSupported,release:this.release,resources:{...this.host.resources,limits:{...this.host.resources.limits},integrity:this.integrityView()},title:this.program.title,epoch:0,lifecycle:'ready',core:null,error:null,uiSound:this.host.uiSoundView(),media:{...this.host.media},menu:false,paused:false,fast:false,namespace:this.namespace,profiles:this.profiles.map(p=>({...p})),profileId:this.profileId,slots:this.slotsView(),importSources:this.options.bindings?.list()??[],importReport:this.pendingImport?.report()??null,lastImport:this.lastImport?{...this.lastImport}:null};
  }
  private authoredGalleryCut(core:CoreView):boolean {return core.saveReason==='SAVE_POLICY'&&core.run.wait?.kind==='choice'&&this.galleryPoints.has(core.run.wait.at);}
  private checkGalleryCut():void {const core=this.runtime?.view();ensure(!this.runtime||this.runtime.resourceView().phase==='idle','EXTRAS_SAVE_POINT','Resource preparation is not a gallery cut');if(!core||core.canSave)return;ensure(this.authoredGalleryCut(core),'EXTRAS_SAVE_POINT','Gallery needs a safe cut');validateRestore(this.program,{...core.run,saveAllowed:true},this.operations);}
  private extrasView(core:CoreView|null=this.runtime?.view()??null):ExtrasView|null {if(!this.program.extras||this.replayOnly)return null;const profile=core?.profile??this.graphProfile,enabled=!this.extra&&(this.lifecycle==='ready'||this.lifecycle==='playing'),canSave=core?(core.canSave||this.authoredGalleryCut(core)):true,key=JSON.stringify([this.epoch,this.profileId,profile.revision,core?.dirty??0,enabled,canSave]);if(this.extrasCache?.key===key)return this.extrasCache.value;const value=projectExtras(this.program,profile,enabled,canSave,this.extrasIdentity);this.extrasCache={key,value};return value;}
  private extraView():ExtraSessionView|null {const s=this.extra;return s?{id:s.id,kind:s.kind,state:s.state,variant:s.variant,variants:s.variants,error:s.error}:null;}
  private storyOperation():void {ensure(!this.replayOnly,'EXTRAS_REPLAY_ONLY','Scene replay does not expose story persistence or navigation');ensure(!this.extra,'EXTRAS_ACTIVE','Close the gallery preview first');}
  mountAchievementIcon(id:string,mount:HTMLElement):()=>void {this.requireStore();ensure(!this.replayOnly,'EXTRAS_REPLAY_ONLY','No nested gallery artwork');const profile=this.runtime?.view().profile??this.graphProfile,entry=requireExtra(this.program,profile,id,'achievement',this.extrasIdentity);ensure(entry.icon,'EXTRAS_ICON','Achievement has no image icon');return this.host.achievementIcon(entry.icon,entry.title,mount);}
  getSceneReplay():Player|null {return this.extra?.kind==='scene'?this.extra.child:null;}
  async refreshExtras():Promise<void> {this.storyOperation();const store=this.requireStore();if(this.runtime)await this.runtime.flushAll();this.graphProfile=parseProfile((await store.read(this.profileId)).profile);this.extrasCache=null;this.publish();}
  private async beginExtra<K extends PreviewKind>(id:string,kind:K,epoch:number):Promise<{session:ExtraSession;entry:Extract<import('../protocol/index.js').ExtraEntry,{kind:K}>;profile:Profile}> {
    this.storyOperation();const store=this.requireStore();ensure(epoch===this.epoch&&(this.lifecycle==='ready'||this.lifecycle==='playing'),'EXTRAS_STALE','Gallery session changed');const definition=this.program.extras?.entries.find(e=>e.id===id);ensure(definition&&definition.kind===kind,'EXTRAS_KIND','Unknown or mismatched gallery kind');this.checkGalleryCut();
    const session:ExtraSession={id,kind,state:'loading',entry:null,profile:null,controller:new AbortController(),barrier:null,runtime:this.runtime,profileId:this.profileId,variant:0,variants:definition.kind==='cg'?definition.images.length:0,error:null,mount:null,child:null,image:null,imageAbort:null,imageSequence:0,closing:null};this.setFast(false);this.extra=session;this.extrasCache=null;
    const work=this.activationTail.catch(()=>{}).then(async()=>{ensure(this.extra===session&&!session.controller.signal.aborted&&!this.disposed,'EXTRAS_CANCELLED','Gallery preparation cancelled');ensure(this.runtime===session.runtime&&this.epoch===epoch&&this.profileId===session.profileId,'EXTRAS_STALE','Main session changed during gallery preparation');this.setPause('extras',true);this.stopHistoryVoice();const old=session.runtime;if(old){await old.freeze();await old.flushAll();}this.checkGalleryCut();ensure(this.extra===session&&!session.controller.signal.aborted&&!this.disposed,'EXTRAS_CANCELLED','Gallery preparation cancelled');const durable=await store.read(session.profileId);ensure(!old||(durable.head?.owner??durable.head?.id??null)===old.authority,'SESSION_REVOKED','Main story was taken over');ensure(!old||durable.profile.revision===old.view().profile.revision,'PROFILE_CONFLICT','Main profile changed outside the active session');const entry=requireExtra(this.program,durable.profile,id,kind,this.extrasIdentity);session.entry=entry;session.profile=parseProfile(durable.profile);this.graphProfile=parseProfile(durable.profile);return {session,entry,profile:parseProfile(durable.profile)};});session.barrier=work.then(()=>{},()=>{});this.activationTail=session.barrier;this.publish();
    try{return await work;}catch(error){if(this.extra===session)await this.closeExtra();throw error;}
  }
  private extraCurrent(s:ExtraSession):boolean {return !this.disposed&&this.extra===s&&!s.controller.signal.aborted;}
  async openCG(id:string,mount:HTMLElement,epoch=this.epoch):Promise<void> {const {session}=await this.beginExtra(id,'cg',epoch);session.mount=mount;try{await this.selectCGVariant(0);}catch(error){if(this.extra===session)await this.closeExtra();throw error;}}
  async selectCGVariant(index:number):Promise<void> {const s=this.extra;ensure(s&&s.kind==='cg'&&s.entry?.kind==='cg'&&s.mount&&this.extraCurrent(s),'EXTRAS_KIND','No active CG preview');ensure(Number.isInteger(index)&&index>=0&&index<s.entry.images.length,'EXTRAS_VARIANT','Unknown CG variant');const asset=s.entry.images[index];ensure(asset,'EXTRAS_VARIANT','Missing image');const sequence=++s.imageSequence;s.imageAbort?.abort();s.image?.();s.image=null;s.imageAbort=new AbortController();s.variant=index;s.state='loading';s.error=null;this.publish();try{const release=await this.host.openCG(asset,s.entry.title,s.mount,s.imageAbort.signal);if(!this.extraCurrent(s)||sequence!==s.imageSequence){release();throw new GalboxError('EXTRAS_CANCELLED','Old image preparation cancelled');}s.image=release;s.state='ready';this.publish();}catch(error){if(this.extraCurrent(s)&&sequence===s.imageSequence){s.state='failed';s.error=String(error);this.publish();}throw error;}}
  async playMusic(id:string,epoch=this.epoch):Promise<void> {const {session,entry}=await this.beginExtra(id,'music',epoch);try{await this.host.playMusic(entry);if(!this.extraCurrent(session))throw new GalboxError('EXTRAS_CANCELLED','Music preparation cancelled');session.state='ready';this.publish();}catch(error){if(this.extraCurrent(session)){session.state='failed';session.error=String(error);this.publish();}throw error;}}
  async retryMusic():Promise<void> {const s=this.extra;ensure(s?.kind==='music'&&s.entry?.kind==='music'&&this.extraCurrent(s),'EXTRAS_KIND','No music preview');s.state='loading';s.error=null;this.publish();try{await this.host.playMusic(s.entry);if(this.extraCurrent(s)){s.state='ready';this.publish();}}catch(e){if(this.extraCurrent(s)){s.state='failed';s.error=String(e);this.publish();}throw e;}}
  async openSceneReplay(id:string,mount:HTMLElement,epoch=this.epoch):Promise<Player> {const {session,entry,profile}=await this.beginExtra(id,'scene',epoch);session.mount=mount;let child:Player|null=null;try{const replayStore=new MemoryStore(this.namespace,{...profile,revision:0});const release=this.release;ensure(release,'EXTRAS_RELEASE','Missing prepared release');child=await Player.create({...this.options,loading:this.loadingPolicy,menuAudio:this.menuAudioPolicy,resourceAudio:this.resourceAudioPolicy,dialogue:this.dialoguePresentation,galleryAt:[...this.galleryPoints],savedGameMigrations:this.savedGameMigrations,program:this.program,release:release.manifest,resourceBudget:this.resourceBudget,graphics:this.graphicsPolicy,...(this.streamingPolicy?{streaming:this.streamingPolicy}:{}),operations:this.operations,mount,store:replayStore,signal:session.controller.signal,preferencesDefaults:{...this.preferences.value,input:{...this.preferences.value.input,wheelMode:this.preferences.value.input.wheelMode??this.preferencesDefaults.input.wheelMode??'gesture'}},saves:{manualSlots:1,autoSlots:1,auto:'off'},history:{maxEntries:1,maxCharacters:65536,rollback:false}});if(!this.extraCurrent(session)){child.dispose();throw new GalboxError('EXTRAS_CANCELLED','Scene preparation cancelled');}session.child=child;child.replayOnly=true;await child.importPreferences(this.preferences.value);const generation=child.nextGeneration();child.lifecycle='preparing';child.publish();await child.host.unlock();await child.activate(null,generation,{profileId:'main',start:true,entryScene:entry.id});if(!this.extraCurrent(session)){child.dispose();throw new GalboxError('EXTRAS_CANCELLED','Scene preparation cancelled');}child.replayOnly=true;child.publish();session.state='ready';this.syncExtraPause();this.publish();return child;}catch(error){child?.dispose();if(this.extra===session)await this.closeExtra();throw error;}}
  private syncExtraPause():void {const paused=[...this.pauses].some(p=>p!=='menu'&&p!=='extras');this.host.pauseMusic(paused);this.extra?.child?.setPaused(paused);}
  closeExtra():Promise<void> {const s=this.extra;if(!s)return Promise.resolve();if(s.closing)return s.closing;s.controller.abort();s.imageAbort?.abort();s.image?.();s.image=null;s.child?.dispose();s.child=null;this.host.stopMusic();s.state='closing';this.publish();const work=(async()=>{await s.barrier;let invalid:'SESSION_REVOKED'|'PROFILE_CONFLICT'|null=null;if(!this.disposed&&s.runtime&&this.runtime===s.runtime){let durable:Awaited<ReturnType<Store['read']>>;try{durable=await this.requireStore().read(s.profileId);}catch(error){s.state='failed';s.error='EXTRAS_HEAD_UNKNOWN: Cannot verify the main story; retry closing when storage is available';s.closing=null;this.publish();throw new GalboxError('EXTRAS_HEAD_UNKNOWN',String(error));}if(this.disposed)return;if((durable.head?.owner??durable.head?.id??null)!==s.runtime.authority||durable.profile.revision!==s.runtime.view().profile.revision){invalid=(durable.head?.owner??durable.head?.id??null)!==s.runtime.authority?'SESSION_REVOKED':'PROFILE_CONFLICT';s.runtime.stop();this.stopRuntime();this.host.setEpoch(++this.epoch);this.lifecycle=durable.head?.status==='committed-pending'?'committed-pending':'ready';this.graphProfile=parseProfile(durable.profile);}else s.runtime.thaw();}if(this.extra===s)this.extra=null;if(!this.disposed){this.setPause('extras',false);this.extrasCache=null;this.publish();}if(invalid)throw new GalboxError(invalid,'The main authority or profile changed while gallery was open; explicitly reload or restart');})();s.closing=work;return work;}

  private flowView(core:CoreView|null=this.runtime?.view()??null):FlowchartView|null {if(!this.program.flowchart)return null;const profile=core?.profile??this.graphProfile,enabled=!this.extra&&!this.replayOnly&&(this.lifecycle==='ready'||this.lifecycle==='playing'),canSave=core?(core.canSave||this.authoredGalleryCut(core)):true,key=JSON.stringify([this.epoch,this.profileId,profile.revision,core?.dirty??0,core?.run.flow,enabled,canSave]);if(this.graphCache?.key===key)return this.graphCache.value;const value=projectFlowchart(this.program,profile,core?.run.flow,enabled,canSave);this.graphCache={key,value};return value;}
  async refreshFlowchart():Promise<void> {const store=this.requireStore();if(this.runtime)await this.runtime.flushAll();const record=await store.read(this.profileId);this.graphProfile=parseProfile(record.profile);this.graphCache=null;this.publish();}
  async enterNode(node:string,epoch=this.epoch):Promise<void> {this.storyOperation();this.requireStore();ensure(this.program.flowchart,'FLOW_UNAVAILABLE','No flowchart declared');const definition=this.program.flowchart.nodes.find(n=>n.id===node);ensure(definition,'FLOW_NODE_UNKNOWN','Unknown node');ensure(definition.entry,'FLOW_NO_ENTRY','Node has no declared entry');ensure(epoch===this.epoch&&(this.lifecycle==='ready'||this.lifecycle==='playing'),'FLOW_STALE','Flowchart session changed');ensure(!this.runtime||this.runtime.view().canSave,'FLOW_ENTRY_UNAVAILABLE',this.runtime?.view().saveReason??'Current cut cannot be left');const gen=this.nextGeneration();this.lifecycle='preparing';this.publish();try{await this.host.unlock();await this.activate(null,gen,{profileId:this.profileId,start:true,entryNode:node});}catch(error){this.precommitFailure(gen,error);throw error;}}
  private backlogView(view:CoreView|undefined=this.runtime?.view()):BacklogView {const canSave=!!view?.canSave&&this.lifecycle==='playing'&&![...this.pauses].some(p=>p!=='menu'&&p!=='history-voice');return {entries:view?this.runtime?.history?.items(view.run.history,canSave,view.saveReason,view.run.release)??[]:[],storage:this.store?.commitHistory&&this.store.readHistory&&this.store.historyReceipt?'durable':'memory',policy:historyPolicy(this.historyPolicy),voice:this.host.historyVoiceView()};}
  static async create(options:PlayerOptions):Promise<Player> {
    if(options.textCatalog!==undefined){const catalog=parseProgramTextCatalog(options.textCatalog);ensure(options.locale===undefined||options.locale===catalog.locale,'TEXT_CATALOG_IDENTITY','Requested locale differs from catalog');options={...options,program:bindProgramText(options.program,catalog,options.operations),locale:catalog.locale};}ensure(!options.signal?.aborted,'PLAYER_CANCELLED','Creation cancelled');const source=isModuleProgram(options.program)?options.program:null;ensure(source||!options.moduleProvider,'MODULE_SOURCE','Module provider requires a module program');ensure(!source||options.moduleProvider,'MODULE_PROVIDER','Provide the code module provider');ensure(!source||!options.release&&!options.bindings&&!options.history?.rollback,'MODULE_UNSUPPORTED','Use the module release; bridge and rollback are not enabled');let player:Player|undefined;const code=source&&options.moduleProvider?new WebCodeModules(source,options.moduleProvider,()=>{if(player)player.program.functions=source.program(source.describe().modules.filter(m=>source.has(m.id)).map(m=>m.id)).functions;}):null;try{if(code&&source)await code.ensure([source.entryModule],options.signal??new AbortController().signal);}catch(e){code?.dispose();throw e;}ensure(!options.signal?.aborted,'PLAYER_CANCELLED','Creation cancelled');try{player=new Player(Object.freeze({...options}),code);}catch(e){code?.dispose();throw e;}player.host.observeMusic(()=>player.publish());player.host.observeHistoryVoice(()=>{if(['idle','failed','blocked'].includes(player.host.historyVoiceView().state)&&player.pauses.has('history-voice'))player.setPause('history-voice',false);else player.publish();});player.options.signal?.addEventListener('abort',player.abortRequested,{once:true});
    try {
      const digest=webReleaseDigest(),releaseOptions={program:player.program,series:player.options.saveCompatibilitySeries,operations:player.operations,...(player.options.bindings?{bindings:player.options.bindings}:{})};
      if(player.moduleSource){const manifest=player.requestedRelease;ensure(manifest&&manifest.series===player.options.saveCompatibilitySeries&&manifest.registrySha256===wireDigest({operations:player.operations.describe(),migrations:player.operations.migrationIdentity(),bindings:[]}), 'MODULE_REGISTRY','Module release/registry/series mismatch');}else if(player.requestedRelease)await verifyReleaseManifest(player.requestedRelease,releaseOptions,digest);ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');
      player.store=player.options.store??await openStore(player.namespace,player.options.database);player.ownsStore=!player.options.store;if(player.disposed){if(player.ownsStore)player.store.close();throw new GalboxError('PLAYER_CANCELLED','Creation cancelled');}
      player.preferencesSupported=!!player.store.readPreferences&&!!player.store.writePreferences;if(player.preferencesSupported){const stored=await player.store.readPreferences?.();if(stored){player.preferences=normalizePreferencesRecord(stored);if(player.preferences.value.locale===undefined)player.preferences.value.locale=player.preferencesDefaults.locale??'zh-Hans';}}ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');player.host.applyAudioPreferences(player.preferences.value.audio);player.inputController.configure(player.preferences.value.input);
      await player.host.init(player.program,player.options.provider,player.abort.signal,player.resourceBudget,player.requestedRelease?.resources,player.streamingPolicy,{...player.loadingPolicy,lookahead:player.preferences.value.prefetchPages??player.loadingPolicy.lookahead??2},player.moduleSource?.describe().functionOrder,player.requestedRelease?.resourceScope);
      const renderer=(player.options.textRenderer??createDomTextRenderer)({mount:player.options.mount,program:parseProgram(player.program),fontFamily:id=>player.host.fontFamily(id)});ensure(renderer&&typeof renderer.render==='function'&&typeof renderer.applyDisplayPreferences==='function'&&typeof renderer.dispose==='function','TEXT_RENDERER','Invalid text renderer');if(player.disposed){renderer.dispose();throw new GalboxError('PLAYER_CANCELLED','Creation cancelled');}player.text=renderer;renderer.applyDisplayPreferences(player.preferences.value.display);
      if(player.program.ui)player.scriptUI=new ScriptUIRenderer(player.options.mount,(id,w,h)=>player.host.uiImageURL(id,w,h),(action,id)=>player.uiAction(action,id.prompt,id.attempt,id.generation,id.epoch),id=>player.activateUI(id.prompt,id.attempt,id.generation,id.epoch),e=>player.fail(e),!!player.program.presentation);
      const manifest=player.requestedRelease??await createReleaseManifest({...releaseOptions,resources:player.host.resourceFacts(),limits:player.resourceBudget},digest);const sha256=await releaseFingerprint(manifest,digest);ensure(!player.disposed,'PLAYER_CANCELLED','Creation cancelled');player.release=freezeJson({origin:player.moduleSource?'modules':player.requestedRelease?'manifest':'derived',sha256,manifest});
      player.wasBackground=document.hidden;document.addEventListener('visibilitychange',player.visibility);window.addEventListener('blur',player.blur);window.addEventListener('focus',player.focus);
      await player.refreshSlots();if(player.program.flowchart||player.program.extras){player.graphProfile=parseProfile((await player.store.read('main')).profile);player.graphCache=null;player.extrasCache=null;}const durable=await player.store.read();if(durable.head?.status==='committed-pending')player.lifecycle='committed-pending';player.reconcileBackground();player.frameId=requestAnimationFrame(player.frame);player.publish();return player;
    }catch(error){player.dispose();throw error;}
  }
  getSnapshot=():PlayerView=>this.cached;
  subscribe=(fn:()=>void):(()=>void)=>{this.listeners.add(fn);return ()=>this.listeners.delete(fn);};
  private preferenceProjection:{source:PreferencesRecord;value:DeepReadonly<PreferencesRecord>}|null=null;
  private preferencesView():DeepReadonly<PreferencesRecord> {if(this.preferenceProjection?.source!==this.preferences)this.preferenceProjection={source:this.preferences,value:freezeJson(parsePreferencesRecord(this.preferences))};return this.preferenceProjection.value;}
  private slotProjection:{source:SaveLibraryEntry[];value:readonly SaveLibraryEntry[]}|null=null;
  private slotsView():readonly SaveLibraryEntry[] {if(this.slotProjection?.source!==this.slots)this.slotProjection={source:this.slots,value:freezeJson(this.slots.map(s=>({...s,capture:s.capture?parseSaveCapture(s.capture):null})))};return this.slotProjection.value;}
  private integrityProjection:{source:WebHost['resources']['integrity'];value:DeepReadonly<WebHost['resources']['integrity']>}|null=null;
  private integrityView():DeepReadonly<WebHost['resources']['integrity']> {const source=this.host.resources.integrity;if(this.integrityProjection?.source!==source)this.integrityProjection={source,value:freezeJson(source.map(row=>({id:row.id,factOrigin:row.factOrigin,evidence:parseIntegrityEvidence(row.evidence)})))};return this.integrityProjection.value;}
  private publish():void {
    const core=this.runtime?.view()??null;this.fast=this.runtime?.playbackView().mode==='skip';
    const resourcePaused=this.runtime?.resourceView().phase!=='idle'&&!!this.runtime;if(resourcePaused!==this.resourcePaused){this.resourcePaused=resourcePaused;this.lastTime=resourcePaused?null:performance.now();void this.host.pause(this.audioPaused()).catch(e=>this.fail(e));}
    if(core&&!this.disposed){this.host.render(core.run,!resourcePaused,!document.hidden);if(!document.hidden)this.text?.render(this.options.textRenderer?parseSnapshot(core.run):core.run);}
    try{this.scriptUI?.render(core?.run??null,this.epoch,!document.hidden&&!this.windowBlurred&&this.lifecycle==='playing'&&!this.pauses.size&&!this.resourcePaused);}catch(error){this.scriptUI?.dispose();this.scriptUI=null;this.error=`UI_RENDER_FAILED: ${String(error)}; recreate the Player to restore UI devices`;this.pauses.add('device');this.lastTime=null;this.fastRequested=false;this.inputController.clear();void this.runtime?.pausePlayback(true).catch(e=>this.fail(e));void this.host.pause(true).catch(e=>this.fail(e));this.syncExtraPause();}
    this.cached={dialogueVisible:!this.dialogueHidden,dialoguePending:this.dialoguePending,loading:{...this.host.loadingView(),...(this.runtime?.resourceView()??{phase:'idle',error:null})},presentation:this.presentation,systemScreen:this.systemScreen,context:this.replayOnly?'gallery':'story',extras:this.extrasView(core),extraSession:this.extraView(),music:this.host.musicView(),flowchart:this.flowView(core),backlog:this.backlogView(core??undefined),saveSystem:{supported:!!this.store?.commitSave&&!!this.store?.saveReceipt&&!!this.store?.listSlots,policy:parseSavePolicy(this.savePolicy),pending:[...this.pendingSaves.values()].map(c=>({id:c.id,slot:c.slot}))},video:{...this.host.video},canReplayVoice:!!(core?.run.wait?.kind==='text'&&core.run.text?.voice)&&this.lifecycle==='playing'&&!this.pauses.size&&!this.resourcePaused,playback:this.runtime?.playbackView()??{mode:'manual',reason:'manual',elapsedMs:0,voice:'none'},preferences:this.preferencesView(),preferencesSupported:this.preferencesSupported,release:this.release,resources:{...this.host.resources,limits:{...this.host.resources.limits},integrity:this.integrityView()},title:this.program.title,epoch:this.epoch,lifecycle:this.lifecycle,core,error:this.error??this.runtime?.resourceView().error??this.runtime?.storageError??this.runtime?.subscriberError??null,uiSound:this.host.uiSoundView(),media:{...this.host.media},menu:this.menu,paused:this.pauses.size>0||this.resourcePaused,fast:this.fast,namespace:this.namespace,profiles:this.profiles.map(p=>({...p})),profileId:this.profileId,slots:this.slotsView(),importSources:this.options.bindings?.list()??[],importReport:this.pendingImport?.report()??null,lastImport:this.lastImport?{...this.lastImport}:null};
    this.syncBackgroundTimer();this.maybeAutoSave();
    for(const listener of [...this.listeners]){try{listener();}catch(error){this.error=error instanceof Error?error.message:String(error);}}
  }
  private frame=(now:number):void=>{
    if(this.disposed)return;
    if(!document.hidden&&this.runtime&&!this.runtime.executing&&!this.resourcePaused&&!this.pauses.size&&(this.lifecycle==='playing'||this.lifecycle==='preparing')) {
      void this.runtime.dispatch({type:'tick',ms:this.elapsed(now),text:!this.dialogueHidden}).catch(e=>this.fail(e));
    }
    this.frameId=requestAnimationFrame(this.frame);
  };
  private elapsed(now:number):number {
    if(this.lastTime===null){this.lastTime=now;return 0;}if(now<this.lastTime)return 0;const elapsed=Math.max(0,now-this.lastTime)+this.timeRemainder;const ms=Math.floor(elapsed);this.timeRemainder=elapsed-ms;this.lastTime=now;return Math.min(3600000,ms);
  }
  private syncBackgroundTimer():void {
    const status=this.runtime?.view().run.status;const active=status!=='ended'&&status!=='failed'&&!this.disposed&&document.hidden&&(this.preferences.value.playback.backgroundPlayback??'continue')==='continue'&&!!this.runtime&&!this.pauses.size&&!this.resourcePaused&&(this.lifecycle==='playing'||this.lifecycle==='preparing');
    if(!active){if(this.backgroundTimer!==null)clearTimeout(this.backgroundTimer);this.backgroundTimer=null;return;}
    if(this.backgroundTimer!==null)return;
    this.backgroundTimer=setTimeout(()=>{this.backgroundTimer=null;if(this.disposed)return;if(this.runtime&&!this.runtime.executing&&!this.pauses.size&&!this.resourcePaused&&document.hidden)void this.runtime.dispatch({type:'tick',ms:this.elapsed(performance.now()),text:!this.dialogueHidden}).catch(e=>this.fail(e));this.syncBackgroundTimer();},250);
  }
  private reconcileBackground():void {
    const background=document.hidden||this.windowBlurred;
    if(background&&!this.wasBackground){this.fast=false;this.fastRequested=false;this.inputController.clear();void this.runtime?.setPlayback('manual').catch(e=>this.fail(e));if(this.host.uiSoundView().state==='preparing')this.host.stopUISound();}
    this.wasBackground=background;const pause=background&&(this.preferences.value.playback.backgroundPlayback??'continue')==='pause';
    if(this.pauses.has('background')!==pause)this.setPause('background',pause);else this.syncBackgroundTimer();this.publish();
  }
  private visibility=():void=>{this.reconcileBackground();if(!document.hidden)this.publish();};
  private blur=():void=>{this.windowBlurred=true;this.reconcileBackground();};
  private focus=():void=>{this.windowBlurred=false;this.reconcileBackground();};
  private audioPaused():boolean {return this.resourcePaused&&this.resourceAudioPolicy==='pause'||[...this.pauses].some(reason=>reason!=='activation'&&!(reason==='menu'&&this.menuAudioPolicy==='continue'));}
  private setPause(reason:string,value:boolean):void {if(reason==='menu'&&!value&&this.pauses.has(reason))this.inputController.clear(true);if(value&&['background','device','user'].includes(reason))this.host.stopUISound();if(value&&!this.pauses.size&&this.runtime)void this.runtime.dispatch({type:'tick',ms:this.elapsed(performance.now()),text:!this.dialogueHidden}).catch(e=>this.fail(e));if(value){if(this.fastRequested||this.runtime?.playbackView().mode==='skip')this.setFast(false);this.inputController.clear();this.pauses.add(reason);}else this.pauses.delete(reason);void this.runtime?.pausePlayback(this.pauses.size>0||this.dialogueHidden).catch(e=>this.fail(e));this.lastTime=this.pauses.size?null:performance.now();this.host.pauseHistoryVoice([...this.pauses].some(p=>p!=='menu'&&p!=='history-voice'));this.syncExtraPause();void this.host.pause(this.audioPaused()).catch(e=>this.fail(e));this.publish();}
  private fail(error:unknown):void {this.error=error instanceof Error?error.message:String(error);this.publish();}
  private inputId():string {return `${this.instance}:${++this.inputSeq}`;}
  private requireStore():Store {ensure(this.store&&!this.disposed,'PLAYER_DISPOSED','Player unavailable');return this.store;}
  private stopRuntime():void {const runtime=this.runtime;this.runtime=null;this.unsubscribe?.();this.unsubscribe=null;runtime?.stop();}
  private async refreshSlots():Promise<void> {
    if(this.disposed)return;const records=await this.requireStore().listSlots?.();const profiles=await this.requireStore().listProfiles?.();if(profiles)this.profiles=profiles.map(p=>({...p}));if(records)this.slots=records.map(r=>({slot:r.slot,revision:r.revision,profileId:r.metadata.profileId,label:r.metadata.label||r.slot,kind:r.metadata.kind??'legacy',capture:r.metadata.capture?parseSaveCapture(r.metadata.capture):null,hasPrevious:r.hasPrevious??false}));this.publish();
  }
  private async initialCandidate(profile:Profile,entryNode?:string,entryScene?:string,generation=this.generation):Promise<Core> {
    const candidate=new Core(this.moduleSource??this.program,profile,undefined,'initial',this.operations,this.program.rng&&'seedSource'in this.program.rng?crypto.getRandomValues(new Uint32Array(1))[0]:undefined,entryNode,entryScene);candidate.accept({type:'text.preferences',value:this.preferences.value.text});let operations=0;
    for(;;){ensure(generation===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Startup candidate was replaced');const result=candidate.run(this.options.budget??100);operations+=this.options.budget??100;ensure(operations<=100000,'STARTUP_BUDGET','Startup did not reach a semantic prompt');if(candidate.view().run.wait?.kind==='flush'){candidate.accept({type:'flushAck',revision:profile.revision});continue;}if(result==='stable')return candidate;if(candidate.requiredFunction){ensure(this.codeModules,'MODULE_PROVIDER','Missing module loader');await this.codeModules.ensure([this.codeModules.source.moduleForFunction(candidate.requiredFunction)],this.candidateController.signal);}else await this.scheduler.turn();}
  }
  async start(profileId='main'):Promise<void> {this.storyOperation();++this.screenGeneration;
    this.requireStore();const gen=this.nextGeneration();this.lifecycle='preparing';this.publish();
    try {await this.host.unlock();await this.activate(null,gen,{profileId,start:true});}catch(error){this.precommitFailure(gen,error);throw error;}
  }
  async load(slot=profileSlot(this.profileId,'quick'),revision:'current'|'previous'='current'):Promise<void> {this.storyOperation();++this.screenGeneration;
    const store=this.requireStore(),gen=this.nextGeneration();this.lifecycle='preparing';this.publish();
    try {const record=await store.readSlot(slot);ensure(record,'SLOT_EMPTY',slot);ensure(revision==='current'||revision==='previous','SLOT_REVISION','Unknown slot revision');const selected=revision==='previous'?record.previous:record.snapshot;ensure(selected,'SLOT_PREVIOUS_EMPTY',slot);if(this.moduleSource){ensure(this.codeModules,'MODULE_PROVIDER','Missing module loader');await this.codeModules.ensure(this.moduleSource.binding(selected),this.candidateController.signal);}const snapshot=selected.release!==this.program.release&&this.savedGameMigrations.some(m=>m.fromRelease===selected.release)?parseSnapshot(selected):validateRestore(this.moduleSource??this.program,selected,this.operations),metadata=(revision==='previous'?record.previousMetadata:record.metadata)??{profileId:'main',label:slot};await this.activate(snapshot,gen,{profileId:metadata.profileId,slot,...(metadata.recipe?{recipe:metadata.recipe}:{}),...(metadata.onLoad?{onLoad:metadata.onLoad}:{}),...(metadata.provenance!==undefined?{provenance:metadata.provenance}:{})});}
    catch(error){this.precommitFailure(gen,error);throw error;}
  }
  private precommitFailure(gen:number,error:unknown):void {if(gen===this.generation&&!this.disposed&&!['committed-pending','commit-unknown'].includes(this.lifecycle)){this.lifecycle=this.runtime?'playing':'ready';this.fail(error);}}
  private async install(activation:Activation,owner:string,gen:number):Promise<void> {
    ensure(this.replayOnly||!activation.snapshot.replayScene,'EXTRAS_REPLAY_ONLY','A gallery replay cannot take over the main story');const store=this.requireStore(),head=await store.read(activation.profileId??'main');
    ensure(head.head?.id===activation.id&&(head.head.owner??head.head.id)===owner&&gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Candidate no longer owns the durable head');
    const historyRecord=store.readHistory&&store.commitHistory&&store.historyReceipt?await store.readHistory(activation.profileId??'main'):{revision:0,entries:[]};ensure(gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','History preparation was superseded');this.inputController.clear(activation.mode!=='initial');if(this.moduleSource){ensure(this.codeModules,'MODULE_PROVIDER','Missing module loader');await this.codeModules.ensure(this.moduleSource.binding(activation.snapshot),this.candidateController.signal);}const candidate=new Core(this.moduleSource??this.program,head.profile,activation.snapshot,activation.mode??'restore',this.operations);candidate.accept({type:'text.preferences',value:this.preferences.value.text});const prepared=this.host.prepareCandidate(candidate.view().run,this.candidateController.signal);try{await prepared.ready;ensure(gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Prepared resources became stale');prepared.commit();}catch(error){prepared.cancel();throw error;}const epoch=++this.epoch;this.host.setEpoch(epoch);this.host.render(candidate.view().run);this.text?.render(candidate.view().run);
    const runtime=new Coordinator(candidate,this.host,this.scheduler,store,epoch,owner,`${this.instance}:${epoch}`,this.options.budget??100,new HistoryJournal(this.historyPolicy,historyRecord,activation.profileId??'main',owner,`history:${crypto.randomUUID()}`,store),this.codeModules??undefined);this.runtime=runtime;this.unsubscribe=runtime.subscribe(()=>this.publish());this.profileId=activation.profileId??'main';this.onLoad=activation.onLoad;this.provenance=activation.provenance;
    await runtime.configurePlayback(this.preferences.value.playback);await runtime.pausePlayback(this.pauses.size>0||this.dialogueHidden);await runtime.start();await this.host.awaitAudioStarts();this.host.assertReady();ensure(gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Takeover was superseded');
    await store.confirm(activation.id,owner);const confirmed=await store.read(this.profileId);ensure(confirmed.head?.id===activation.id&&(confirmed.head.owner??confirmed.head.id)===owner&&gen===this.generation&&!this.disposed,'ACTIVATION_SUPERSEDED','Head changed during takeover');
    this.lifecycle='playing';this.error=null;if(this.presentation){++this.screenGeneration;this.systemScreen='story';this.menu=false;this.setPause('menu',false);}else if(!this.menu)this.systemScreen='story';if(activation.slot||activation.mode!=='initial')this.lastAutoCut=this.autoCut();this.publish();
  }
  private async activate(baseline:Snapshot|null,gen:number,policy:LoadPolicy):Promise<void> {
    const work=this.activationTail.catch(()=>{}).then(async()=>{
      ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','A newer request replaced this candidate');const store=this.requireStore(),old=this.runtime;ensure(this.replayOnly||!baseline?.replayScene,'EXTRAS_REPLAY_ONLY','A gallery replay cannot be loaded as the main story');this.host.assertReady();this.stopHistoryVoice();this.setPause('activation',true);
      let committed=false,committing=false,id:string|null=null,expectedHead:string|null=null,preparation:HostPreparation|undefined;
      try {
        if(old){await old.freeze();await old.flushAll();}ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate became stale');
        if(policy.entryNode!==undefined)ensure(!old||old.view().canSave,'FLOW_ENTRY_UNAVAILABLE',old?.view().saveReason??'Current cut cannot be left');const durable=await store.read(policy.profileId);this.graphProfile=parseProfile(durable.profile);expectedHead=durable.head?.id??null;let snapshot:Snapshot,changes:readonly ProgressChange[]=[],mode:'initial'|'restore'='restore';
        if(policy.start){const candidate=await this.initialCandidate(durable.profile,policy.entryNode,policy.entryScene,gen);const v=candidate.view();ensure(v.canSave||v.saveReason==='SAVE_POLICY'||v.saveReason==='VIDEO_ACTIVE_UNRESTORABLE'||v.saveReason==='MEDIA_WAIT_RESTORE_UNSUPPORTED'||v.saveReason==='AUDIO_SOURCE_RESTORE_UNSUPPORTED','SAVE_UNAVAILABLE',v.saveReason??'startup');snapshot=parseSnapshot(v.run);changes=candidate.pending();mode='initial';}
        else {ensure(baseline,'LOAD_BASELINE','Missing snapshot');ensure(!this.moduleSource||!policy.recipe&&!policy.onLoad,'MODULE_UNSUPPORTED','Module restore recipes are not enabled');const migration=baseline.release===this.program.release?undefined:this.savedGameMigrations.find(m=>m.fromRelease===baseline.release);
          if(migration){ensure(!policy.recipe&&!policy.onLoad,'SAVE_MIGRATION_RECIPE','Old restore recipes require a separate explicit migration');const signal=this.candidateController.signal,cancellation={get cancelled(){return signal.aborted;},onCancel(listener:()=>void){signal.addEventListener('abort',listener,{once:true});if(signal.aborted)listener();return()=>signal.removeEventListener('abort',listener);}};const result=await migrateSavedGame(migration,this.program,baseline,durable.profile,cancellation,this.operations);ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Migration replaced');snapshot=result.snapshot;changes=result.reads.map((unit,i)=>({seq:i+1,type:'read' as const,unit}));}
          else snapshot=validateRestore(this.moduleSource??this.program,baseline,this.operations);if(policy.recipe){const prepared=prepareRestoreRecipe(this.program,durable.profile,snapshot,policy.recipe,{operations:this.operations});snapshot=prepared.snapshot;changes=prepared.changes;mode='initial';}}
        ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate became stale during preparation');id=`${this.instance}:a${gen}`;
        preparation=this.host.prepareCandidate(snapshot,this.candidateController.signal);await preparation.ready;ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Resource preparation replaced');this.host.validateGraphicsPlan(snapshot);this.host.validateAudioPlan(snapshot);await this.host.revalidateStreams();ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Candidate replaced during media validation');
        const initial=changes.length?Object.freeze({id:`${id}:initial`,baseRevision:durable.profile.revision,through:changes.at(-1)?.seq??0,changes:Object.freeze(changes.map(c=>c.type==='read'?Object.freeze({...c}):c.type==='set'?Object.freeze({...c,value:freezeJson(c.value)}):c.type==='flow'?Object.freeze({...c,value:freezeJson(c.value)}):Object.freeze({...c,value:freezeJson(c.value)})))}):undefined;
        this.host.assertReady();committing=true;const activation=await store.activate(id,snapshot,expectedHead,durable.profile.revision,initial,{profileId:policy.profileId,mode,owner:id,...(policy.onLoad?{onLoad:policy.onLoad}:{}),...(policy.provenance!==undefined?{provenance:policy.provenance}:{}),...(policy.slot?{slot:policy.slot}:{})});committed=true;old?.stop();this.unsubscribe?.();this.runtime=null;this.lifecycle='committed-pending';this.publish();await this.install(activation,id,gen);
      }catch(error){
        if(committing&&!committed){try{const current=await store.read(policy.profileId);if(current.head?.id===id||(current.head?.id??null)!==expectedHead)committed=true;}catch{old?.stop();this.stopRuntime();this.lifecycle='commit-unknown';this.fail(new GalboxError('ACTIVATION_COMMIT_UNKNOWN','Outcome unavailable; reconcile the durable head before continuing'));throw error;}}
        if(committed){old?.stop();this.stopRuntime();if(!this.disposed){this.lifecycle='committed-pending';this.fail(error);}}else if(!this.disposed){this.lifecycle=old?'playing':'ready';old?.thaw();}throw error;
      }finally{preparation?.cancel();this.setPause('activation',false);}
    });this.activationTail=work;return work;
  }
  async resumeCommitted(expectedId?:string):Promise<void> {this.storyOperation();
    const store=this.requireStore(),gen=this.nextGeneration();
    const work=this.activationTail.catch(()=>{}).then(async()=>{
      const durable=await store.read();ensure(durable.head&&(!expectedId||durable.head.id===expectedId),'ACTIVATION_SUPERSEDED','Requested head is no longer current');ensure(durable.head.status==='committed-pending','ACTIVATION_NOT_PENDING','Use an explicit load for an already activated session');const claim=store.claim?.bind(store);ensure(claim,'STORAGE_CLAIM_UNSUPPORTED','Storage does not support recovery ownership');
      await this.host.revalidateStreams();ensure(gen===this.generation&&!this.disposed,'LOAD_SUPERSEDED','Recovery replaced during media validation');const owner=`${this.instance}:retry${gen}`;const activation=await claim(durable.head.id,owner);this.stopRuntime();this.lifecycle='committed-pending';this.setPause('activation',true);
      try{await this.install(activation,owner,gen);}catch(error){this.stopRuntime();if(!this.disposed){this.lifecycle='committed-pending';this.fail(error);}throw error;}finally{this.setPause('activation',false);}
    });this.activationTail=work;return work;
  }
  async save(requestedSlot?:string,expectedRevision?:number):Promise<SaveResult> {this.storyOperation();
    const store=this.requireStore(),runtime=this.runtime;ensure(runtime,'PLAYER_NOT_STARTED','Start first');const profileId=this.profileId,slot=requestedSlot??(profileId==='main'?'quick':`${profileId}:quick`),metadata:SlotMetadata={profileId,label:profileId==='main'?'快速存档':'快速存档（独立导入进度）',...(this.onLoad?{recipe:this.onLoad,onLoad:this.onLoad}:{}),...(this.provenance!==undefined?{provenance:this.provenance}:{})};const captured=runtime.capture();
    const previous=expectedRevision===undefined?await store.readSlot(slot):null;await runtime.flushAll();const result=await store.save(slot,captured,expectedRevision??previous?.revision??0,metadata);if(!this.disposed){try{await this.refreshSlots();}catch(error){this.fail(error);}}return {slot,revision:result.revision,disposed:this.disposed};
  }
  private autoCut():string {const run=this.runtime?.view().run,w=run?.wait;return w&&(w.kind==='text'||w.kind==='choice')?`${this.epoch}:${w.kind}:${w.prompt}`:'';}
  private maybeAutoSave():void {
    if(this.extra||this.replayOnly||this.savePolicy.auto!=='on-prompt'||this.autoSaving||this.disposed||this.lifecycle!=='playing'||!this.cached.saveSystem.supported||!this.runtime?.view().canSave)return;
    const wait=this.runtime?.view().run.wait;if(this.savePolicy.autoAt&&(!wait||!this.savePolicy.autoAt.includes(wait.at)))return;
    const cut=this.autoCut();if(!cut||cut===this.lastAutoCut)return;this.lastAutoCut=cut;this.autoSaving=true;
    void this.saveGameAt({kind:'auto'},cut).catch(e=>{if(e instanceof GalboxError&&e.code==='EXTRAS_ACTIVE')this.lastAutoCut='';else if(!(e instanceof GalboxError&&e.code==='SAVE_CUT_CHANGED'))this.fail(e);}).finally(()=>{this.autoSaving=false;if(!this.disposed)this.publish();});
  }
  quickSave():Promise<IllustratedSaveResult> {return this.saveGame({kind:'quick'});}
  quickLoad():Promise<void> {return this.load(profileSlot(this.profileId,'quick'));}
  async saveGame(input:SaveGameOptions={}):Promise<IllustratedSaveResult> {this.storyOperation();ensure(!this.runtime||this.runtime.resourceView().phase==='idle','RESOURCE_PREPARING','Wait for resources before saving');return this.saveGameAt(parseSaveGameOptions(input));}
  private saveGameAt(input:SaveGameOptions,expectedCut?:string):Promise<IllustratedSaveResult> {
    const options=parseSaveGameOptions(input),work=this.saveTail.catch(()=>{}).then(async()=>{this.storyOperation();
      const store=this.requireStore();ensure(store.commitSave&&store.saveReceipt&&store.listSlots,'SAVE_SYSTEM_UNSUPPORTED','Store lacks the save system ports');const requestedRuntime=this.runtime;ensure(requestedRuntime,'PLAYER_NOT_STARTED','Start first');const profileId=this.profileId,gen=this.generation;
      const rows=await store.listSlots(),selected=selectSaveSlot(rows,profileId,this.savePolicy,options),id=crypto.randomUUID();let payload:SaveCommit|undefined;
      const capture=this.activationTail.catch(()=>{}).then(async()=>{
        this.storyOperation();ensure(!this.disposed&&this.runtime===requestedRuntime&&this.generation===gen,'SAVE_CAPTURE_CANCELLED','Session changed before capture');const runtime=requestedRuntime;await runtime.freeze();
        try{
          ensure(!this.disposed&&this.runtime===runtime,'SAVE_CAPTURE_CANCELLED','Player closed');ensure(!expectedCut||expectedCut===this.autoCut(),'SAVE_CUT_CHANGED','Automatic capture superseded');
          const snapshot=runtime.capture(),text=this.text,capture=parseSaveCapture({id,sequence:++this.captureSequence,logicalTime:snapshot.logicalTime,createdAt:Date.now(),speaker:(snapshot.text?.speaker??'').slice(0,512),text:(snapshot.text?.content??'').slice(0,4096),textId:snapshot.text?.textId??null});
          if(options.image!=='none'){ensure(text?.capture,'SAVE_CAPTURE_UNSUPPORTED','Text renderer must implement synchronous capture');ensure(!snapshot.ui?.active||this.scriptUI,'SAVE_CAPTURE_UI','Script UI is unavailable; use a logical save and recreate the Player');text.render(snapshot);const drawing=text.capture(parseSnapshot(snapshot),this.host.captureFontCSS());capture.thumbnail=await this.host.captureThumbnail(snapshot,drawing,this.abort.signal,this.scriptUI?.capture(snapshot,this.host.captureFontCSS()));}
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
  async renameSave(slot:string,expectedRevision:number,label:string):Promise<void> {this.storyOperation();const store=this.requireStore();ensure(store.renameSlot,'SAVE_SYSTEM_UNSUPPORTED','No rename port');await store.renameSlot(slot,expectedRevision,label);if(!this.disposed)await this.refreshSlots();}
  async deleteSave(slot:string,expectedRevision:number):Promise<void> {this.storyOperation();const store=this.requireStore();ensure(store.deleteSlot,'SAVE_SYSTEM_UNSUPPORTED','No delete port');await store.deleteSlot(slot,expectedRevision);if(!this.disposed)await this.refreshSlots();}
  async prepareImport(source:{sourceKey:string;schema:string;version:number},files:readonly OriginalSaveFile[]):Promise<PrepareResult> {this.storyOperation();return this.prepareImportAt(source,files,++this.importGeneration);}
  async prepareImportFiles(source:{sourceKey:string;schema:string;version:number},files:readonly File[]):Promise<PrepareResult> {this.storyOperation();
    const gen=++this.importGeneration;ensure(files.length<=16&&files.every(f=>f.size<=4_000_000)&&files.reduce((n,f)=>n+f.size,0)<=8_000_000,'SAVE_PACKAGE_SIZE','Too many or oversized files');const bytes=await Promise.all(files.map(async f=>({name:f.name,bytes:new Uint8Array(await f.arrayBuffer())})));return this.prepareImportAt(source,bytes,gen);
  }
  private async prepareImportAt(source:{sourceKey:string;schema:string;version:number},files:readonly OriginalSaveFile[],gen:number):Promise<PrepareResult> {
    this.requireStore();ensure(gen===this.importGeneration&&!this.disposed,'IMPORT_PLAN_SUPERSEDED','A newer preparation replaced this request');const binding=this.options.bindings?.get(source.sourceKey,source.schema,source.version);ensure(binding,'SAVE_BINDING_UNSUPPORTED','Select a registered save source');this.pendingImport=null;this.lastImport=null;this.publish();const result=await binding.prepare(files,webFormatContext(),this.program,this.operations);ensure(gen===this.importGeneration&&!this.disposed,'IMPORT_PLAN_SUPERSEDED','A newer preparation replaced this request');if(result.status==='ready')this.pendingImport=result.plan;this.publish();return result;
  }
  async commitImport(plan:PreparedImport|null=this.pendingImport):Promise<ImportResult> {this.storyOperation();ensure(!this.moduleSource,'MODULE_UNSUPPORTED','Module save bridge is not enabled');
    const store=this.requireStore();ensure(plan,'IMPORT_PLAN','Prepare an import first');const write=store.import?.bind(store);ensure(write,'STORAGE_IMPORT_UNSUPPORTED','Storage does not support independent imports');const payload=materializeImport(plan,this.program,this.operations),report=plan.report();ensure(!payload.snapshot.replayScene,'EXTRAS_REPLAY_ONLY','Gallery replay snapshots cannot be imported as story slots');
    let identity=this.importCommits.get(plan);if(!identity){identity={id:`${this.instance}:import${++this.importCounter}`,slot:`import-${crypto.randomUUID()}`,label:report.label};this.importCommits.set(plan,identity);}
    const commit:StoreImport={id:identity.id,slot:identity.slot,snapshot:payload.snapshot,profile:payload.profile,metadata:{profileId:`import:${identity.id}`,label:`${identity.label} · ${identity.slot.slice(-8)}`,provenance:parseJsonValue(report),...(payload.recipe?{recipe:payload.recipe}:{}),...(payload.onLoad?{onLoad:payload.onLoad}:{})}};
    let receipt;try{receipt=await write(commit);}catch(error){const failure=new GalboxError('IMPORT_COMMIT_UNKNOWN',`Import may have committed; retry this same plan. ${String(error)}`);this.fail(failure);throw failure;}
    if(!this.disposed){this.error=null;if(this.pendingImport===plan)this.lastImport={slot:receipt.slot,profileId:receipt.profileId};try{await this.refreshSlots();}catch(error){this.fail(error);}}
    return {id:receipt.id,slot:receipt.slot,profileId:receipt.profileId,revision:receipt.revision,committed:true,disposed:this.disposed};
  }
  async exportBackup():Promise<PortableBackup> {this.storyOperation();
    const store=this.requireStore(),read=store.backup?.bind(store);ensure(read,'STORAGE_BACKUP_UNSUPPORTED','Storage does not support atomic backups');await this.runtime?.flushAll();return read(this.program.gameId,this.options.saveCompatibilitySeries,this.program.release);
  }
  prepareBackupRestore(input:unknown,migration?:ContentMigration):PreparedBackupRestore {this.storyOperation();ensure(!this.moduleSource,'MODULE_UNSUPPORTED','Module backup restore is not enabled');
    this.requireStore();return prepareBackupRestore(input,{program:this.program,series:this.options.saveCompatibilitySeries,operations:this.operations,...(migration?{migration}:{})});
  }
  async commitBackupRestore(plan:PreparedBackupRestore):Promise<BackupRestoreResult> {this.storyOperation();ensure(!this.moduleSource,'MODULE_UNSUPPORTED','Module backup restore is not enabled');
    const store=this.requireStore(),write=store.restoreBackup?.bind(store);ensure(write,'STORAGE_BACKUP_UNSUPPORTED','Storage does not support atomic backup restoration');const backup=materializeBackupRestore(plan,{program:this.program,series:this.options.saveCompatibilitySeries,operations:this.operations});
    let id=this.backupCommits.get(plan);if(!id){id=`${this.instance}:backup${++this.importCounter}`;this.backupCommits.set(plan,id);}
    let receipt:BackupRestoreReceipt;try{receipt=await write({id,backup});}catch(error){const failure=new GalboxError('BACKUP_COMMIT_UNKNOWN',`Restore may have committed; retry this same plan. ${String(error)}`);this.fail(failure);throw failure;}
    if(!this.disposed){this.error=null;try{await this.refreshSlots();}catch(error){this.fail(error);}}
    return {id:receipt.id,profiles:receipt.profiles,slots:receipt.slots,committed:true,disposed:this.disposed};
  }
  async flush():Promise<void> {this.requireStore();await this.runtime?.flushAll();this.publish();}
  async discardAndLoad(slot='quick'):Promise<void> {this.storyOperation();
    // Explicit conflict resolution; only the caller can discard uncommitted working changes.
    this.stopRuntime();await this.load(slot);
  }
  async input(action:'reveal'|'advance'|'step'|'choose',prompt:number,epoch:number,option?:string):Promise<void> {
    if(this.dialogueHidden&&epoch===this.epoch&&action!=='choose'){const wait=this.runtime?.view().run.wait;if(wait?.kind==='text'&&wait.prompt===prompt)await this.setDialogueVisible(true,epoch);return;}
    if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||(this.lifecycle!=='playing'&&this.lifecycle!=='preparing'))return;
    const runtime=this.runtime;this.fastRequested=false;const manual=runtime.setPlayback('manual');const ticking=runtime.dispatch({type:'tick',ms:this.elapsed(performance.now()),text:!this.dialogueHidden});
    let event:CoreEvent;
    if(action==='choose'){ensure(option,'CHOICE_OPTION','Missing option');event={type:'choose',prompt,option,inputId:this.inputId()};}
    else event={type:action,prompt,inputId:this.inputId()};
    await Promise.all([manual,ticking,runtime.dispatch(event)]);
  }
  async step(prompt:number,epoch:number):Promise<void> {await this.input('step',prompt,epoch);}
  async resumeOperation(event:OperationResume,epoch:number):Promise<void> {ensure(!this.extra,'EXTRAS_ACTIVE','Close the gallery first');
    if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;
    const runtime=this.runtime;await Promise.all([runtime.dispatch({type:'tick',ms:this.elapsed(performance.now()),text:!this.dialogueHidden}),runtime.dispatch(event)]);
  }
  async activateUI(prompt:number,attempt:number,generation:number,epoch:number):Promise<void> {if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;await this.runtime.dispatch(parseUIEvent({type:'ui.activate',prompt,attempt,generation}));}
  async uiAction(action:import('../protocol/index.js').UIAction,prompt:number,attempt:number,generation:number,epoch:number):Promise<void> {if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;const waiting=this.runtime.view().run.wait;if(waiting?.kind!=='ui'||waiting.phase!=='active'||waiting.prompt!==prompt||waiting.attempt!==attempt||waiting.generation!==generation)return;const event=parseUIEvent({...parseUIAction(action),prompt,attempt,generation,inputId:this.inputId()}),runtime=this.runtime;await Promise.all([runtime.setPlayback('manual'),runtime.dispatch(event)]);}
  async activateInteraction(prompt:number,attempt:number,epoch:number):Promise<void> {const received=performance.now();if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;const w=this.runtime.view().run.wait;if(w?.kind!=='interaction'||w.prompt!==prompt||w.attempt!==attempt||w.phase!=='prepared')return;const runtime=this.runtime,ms=this.elapsed(received);await Promise.all([runtime.dispatch({type:'tick',ms}),runtime.dispatch({type:'interaction.activate',prompt,attempt})]);}
  async chooseInteraction(option:string,prompt:number,attempt:number,epoch:number):Promise<void> {await this.interact({type:'interaction.choose',option,prompt,attempt,inputId:this.inputId()},epoch);}
  async pointInteraction(x:number,y:number,prompt:number,attempt:number,epoch:number):Promise<void> {ensure(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1280&&y>=0&&y<=720,'INTERACTION_POINT','Point exceeds viewport');await this.interact({type:'interaction.point',x,y,prompt,attempt,inputId:this.inputId()},epoch);}
  private async interact(event:import('../protocol/index.js').InteractionEvent,epoch:number):Promise<void> {const received=performance.now();if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;const w=this.runtime.view().run.wait;if(w?.kind!=='interaction'||w.prompt!==event.prompt||w.attempt!==event.attempt)return;const input=parseInteractionEvent(event),runtime=this.runtime,ms=this.elapsed(received);await Promise.all([runtime.setPlayback('manual'),runtime.dispatch({type:'tick',ms}),runtime.dispatch(input)]);}
  async skipVideo(prompt:number,epoch:number):Promise<void> {const received=performance.now();if(epoch!==this.epoch||this.disposed||this.pauses.size||!this.runtime||this.lifecycle!=='playing')return;const runtime=this.runtime,w=runtime.view().run.wait;if(w?.kind!=='video'||w.prompt!==prompt)return;await Promise.all([runtime.dispatch({type:'tick',ms:this.elapsed(received)}),runtime.dispatch({type:'video.skip',prompt,inputId:this.inputId()})]);}
  async retryVideo():Promise<void> {ensure(!this.extra,'EXTRAS_ACTIVE','Close the gallery first');await this.host.unlock();for(const t of this.runtime?.view().run.tasks??[])if(t.kind==='video'&&t.status==='blocked')await this.runtime?.dispatch({type:'retry',task:t.id});}
  async replayHistory(id:string,epoch=this.epoch):Promise<void> {this.storyOperation();
    this.requireStore();ensure(epoch===this.epoch&&this.lifecycle==='playing'&&this.runtime,'HISTORY_STALE','History session changed');ensure(![...this.pauses].some(p=>p!=='menu'&&p!=='history-voice'),'HISTORY_VOICE_PAUSED','History preview is paused');const row=this.backlogView().entries.find(e=>e.id===id);ensure(row?.text.voice,'HISTORY_VOICE_UNAVAILABLE','This history entry has no voice');validateVoiceRecipe(this.program,row.text.voice);this.setPause('history-voice',true);try{await this.host.playHistoryVoice(id,{...row.text.voice});}catch(e){this.setPause('history-voice',false);throw e;}
  }
  stopHistoryVoice():void {this.host.stopHistoryVoice();if(this.pauses.has('history-voice'))this.setPause('history-voice',false);}
  async rollback(id:string,epoch=this.epoch):Promise<void> {this.storyOperation();
    this.requireStore();const runtime=this.runtime;ensure(runtime&&epoch===this.epoch&&this.lifecycle==='playing','HISTORY_STALE','History session changed');ensure(runtime.view().canSave,'HISTORY_ROLLBACK_UNAVAILABLE',runtime.view().saveReason??'Current cut cannot be restored');const row=this.backlogView().entries.find(e=>e.id===id);ensure(row?.canRollback,'HISTORY_CHECKPOINT_UNAVAILABLE',row?.rollbackReason??'Checkpoint is not visible');const snapshot=runtime.history?.checkpoint(id,runtime.view().run.history);ensure(snapshot,'HISTORY_CHECKPOINT_MISSING','No checkpoint was captured');validateRestore(this.program,snapshot,this.operations);const gen=this.nextGeneration();this.stopHistoryVoice();this.lifecycle='preparing';this.publish();try{await this.activate(snapshot,gen,{profileId:this.profileId,...(this.onLoad?{onLoad:this.onLoad}:{}),...(this.provenance!==undefined?{provenance:this.provenance}:{})});}catch(e){this.precommitFailure(gen,e);throw e;}
  }
  async replayVoice():Promise<void> {const runtime=this.runtime,view=this.getSnapshot(),wait=view.core?.run.wait;ensure(runtime&&view.canReplayVoice&&wait?.kind==='text','VOICE_REPLAY_UNAVAILABLE','Current text has no replayable voice');await runtime.dispatch({type:'voice.replay',prompt:wait.prompt,inputId:this.inputId()});}
  async retryResources():Promise<void> {ensure(this.runtime,'PLAYER_NOT_STARTED','Start first');this.error=null;await this.runtime.retryResources();this.publish();}
  async playUISound(input:UISoundRequest):Promise<UISoundResult>{this.requireStore();ensure(!document.hidden,'UI_SOUND_HIDDEN','Interface sound is unavailable while hidden');return this.host.playUISound(parseUISoundRequest(input));}
  stopUISound():void{this.host.stopUISound();}
  async retryAudio():Promise<void> {ensure(!this.extra,'EXTRAS_ACTIVE','Close the gallery first');await this.host.unlock();for(const t of this.runtime?.view().run.tasks??[])if((t.kind==='audio'||t.kind==='media')&&t.status==='blocked')await this.runtime?.dispatch({type:'retry',task:t.id});this.publish();}
  interfaceFont():string {const fallback=this.presentation?.font.family==='serif'?'Georgia, serif':'system-ui, sans-serif';return this.presentation?.font.asset?`"${this.host.fontFamily(this.presentation.font.asset)}", ${fallback}`:fallback;}
  mountInterfaceArtwork(role:'background'|'logo',mount:HTMLElement):()=>void {this.requireStore();ensure(role==='background'||role==='logo','PRESENTATION_IMAGE','Unknown artwork role');const id=this.presentation?.title[role];ensure(id,'PRESENTATION_IMAGE','No artwork declared');return this.host.interfaceArtwork(id,this.program.title,mount,role);}
  async showSystemScreen(input:import('../protocol/index.js').SystemScreen):Promise<void> {this.requireStore();this.restoreDialogue();const screen=parseSystemScreen(input);ensure(!this.replayOnly||screen==='history'||screen==='story','EXTRAS_REPLAY_ONLY','No persistence/navigation inside scene replay');ensure(this.lifecycle==='ready'||this.lifecycle==='playing','SYSTEM_BUSY','Wait for activation to finish');ensure(screen!=='story'||!!this.runtime,'PLAYER_NOT_STARTED','Start a story first');ensure(screen!=='flowchart'||this.program.flowchart,'SYSTEM_SCREEN_UNAVAILABLE','No flowchart declared');ensure(screen!=='extras'||this.program.extras,'SYSTEM_SCREEN_UNAVAILABLE','No gallery declared');const ticket=++this.screenGeneration;if(this.extra)await this.closeExtra();if(ticket!==this.screenGeneration||this.disposed)return;this.stopHistoryVoice();this.systemScreen=screen;this.menu=screen!=='story';this.setPause('menu',this.menu);}
  setMenu(value:boolean):void {this.restoreDialogue();const ticket=++this.screenGeneration;if(this.extra&&!value){void this.closeExtra().then(()=>{if(!this.disposed&&ticket===this.screenGeneration)this.setMenu(false);},e=>this.fail(e));return;}if(!value)this.stopHistoryVoice();this.menu=value;this.systemScreen=value?'menu':this.runtime?'story':'title';if(this.runtime?.playbackView().mode==='skip')this.setFast(false);this.setPause('menu',value);}
  setPaused(value:boolean):void {this.setPause('user',value);}
  setFast(value:boolean):void {if(this.extra||value&&this.dialogueHidden)return;if(this.disposed||!value&&!this.fastRequested&&this.runtime?.playbackView().mode!=='skip')return;this.fastRequested=value&&!this.wasBackground&&!this.pauses.size&&this.lifecycle==='playing';void this.runtime?.setPlayback(this.fastRequested?'skip':'manual').then(()=>this.publish()).catch(e=>this.fail(e));}
  async setAuto(value:boolean):Promise<void> {ensure(!this.extra,'EXTRAS_ACTIVE','Close the gallery first');ensure(this.runtime&&this.lifecycle==='playing','PLAYER_NOT_STARTED','Start reading before changing playback mode');if(value&&this.dialogueHidden)return;this.fastRequested=false;await this.runtime.setPlayback(value&&!this.wasBackground?'auto':'manual');this.publish();}
  attachInput(root:HTMLElement):()=>void {this.requireStore();return this.inputController.attach(root);}
  resetPreferences():Promise<PreferencesResult>{return this.updatePreferences({audio:this.preferencesDefaults.audio,text:this.preferencesDefaults.text,playback:this.preferencesDefaults.playback,input:this.preferencesDefaults.input,display:this.preferencesDefaults.display,prefetchPages:this.preferencesDefaults.prefetchPages??this.loadingPolicy.lookahead??2});}
  exportPreferences():DeepReadonly<import('../protocol/index.js').PlayerPreferences>{this.requireStore();return parsePlayerPreferences(this.preferences.value);}
  importPreferences(input:unknown):Promise<PreferencesResult>{const value=normalizePreferences(input);return this.changePreferences(current=>{const next=mergePreferences(current,{audio:value.audio,text:value.text,playback:value.playback,input:value.input,display:value.display,...(value.prefetchPages!==undefined?{prefetchPages:value.prefetchPages}:{})});if(value.prefetchPages===undefined)delete next.prefetchPages;return next;});}
  private restoreDialogue():void {const changed=this.dialogueHidden||this.dialoguePending;++this.dialogueGeneration;this.dialoguePending=false;this.dialogueHidden=false;if(!changed)return;this.host?.showDialogue();this.text?.setVisible?.(true);if(this.runtime)void this.runtime.pausePlayback(this.pauses.size>0).catch(e=>this.fail(e));}
  async setDialogueVisible(visible:boolean,epoch=this.epoch):Promise<void> {
    ensure(typeof visible==='boolean','DIALOGUE_VISIBILITY','Expected visibility boolean');this.requireStore();ensure(epoch===this.epoch,'DIALOGUE_STALE','Dialogue belongs to an old session');if(visible){this.restoreDialogue();this.publish();return;}
    ensure(this.runtime&&this.lifecycle==='playing'&&!this.menu&&!this.extra&&!this.resourcePaused&&!this.pauses.size,'DIALOGUE_UNAVAILABLE','Close menus and finish preparation first');ensure(this.text?.setVisible,'DIALOGUE_RENDERER_UNSUPPORTED','Text renderer needs setVisible');const snapshot=this.runtime.view().run;assertDialogueCut(snapshot);if(this.dialogueHidden)return;
    const generation=++this.dialogueGeneration;this.dialogueHidden=true;this.dialoguePending=true;this.fastRequested=false;
    try{await this.runtime.setPlayback('manual');await this.runtime.pausePlayback(true);this.publish();ensure(!this.disposed&&epoch===this.epoch&&generation===this.dialogueGeneration,'DIALOGUE_CANCELLED','Visibility request replaced');await this.host.hideDialogue(snapshot,this.dialoguePresentation);ensure(!this.disposed&&epoch===this.epoch&&generation===this.dialogueGeneration,'DIALOGUE_CANCELLED','Visibility request replaced');this.text.setVisible(false);this.dialoguePending=false;this.publish();}catch(error){if(generation===this.dialogueGeneration){this.restoreDialogue();this.publish();}throw error;}
  }
  async cancel():Promise<void> {this.requireStore();if(this.menu){await this.showSystemScreen('story');return;}if(this.dialogueHidden||this.runtime?.view().run.wait?.kind==='text')await this.setDialogueVisible(this.dialogueHidden);}
  setVolume(value:number):void {this.host.setVolume(value);}
  private async applyPreferences(record:PreferencesRecord):Promise<void> {this.preferences=normalizePreferencesRecord(record);if(this.preferences.value.locale===undefined)this.preferences.value.locale=this.preferencesDefaults.locale??'zh-Hans';if(this.disposed)return;const value=this.preferences.value;this.host.setPrefetchPages(value.prefetchPages??this.loadingPolicy.lookahead??2);this.host.applyAudioPreferences(value.audio);this.text?.applyDisplayPreferences(value.display);this.inputController.configure(value.input);const update=Promise.all([this.runtime?.configurePlayback(value.playback),this.runtime?.dispatch({type:'text.preferences',value:value.text})]);if(this.extra){void update.catch(e=>this.fail(e));const child=this.extra.child;if(child)void child.importPreferences(value).catch(()=>{});}else await update;this.reconcileBackground();this.publish();}
  async updatePreferences(input:unknown):Promise<PreferencesResult> {
    const patch=parsePreferencesPatch(input);return this.changePreferences(current=>mergePreferences(current,patch));
  }
  private changePreferences(change:(current:import('../protocol/index.js').PlayerPreferences)=>import('../protocol/index.js').PlayerPreferences):Promise<PreferencesResult> {
    const store=this.requireStore(),write=store.writePreferences?.bind(store);ensure(this.preferencesSupported&&write,'PREFERENCES_UNSUPPORTED','Storage has no preferences port');
    const work=this.preferencesTail.catch(()=>{}).then(async()=>{ensure(!this.disposed,'PLAYER_DISPOSED','Player unavailable');const value=parsePlayerPreferences(change(parsePlayerPreferences(this.preferences.value)));let record:PreferencesRecord;try{record=await write(value,this.preferences.revision);}catch(error){if(error instanceof GalboxError&&error.code==='PREFERENCES_CONFLICT')throw error;throw new GalboxError('PREFERENCES_COMMIT_UNKNOWN',`Reload preferences to reconcile the durable result. ${String(error)}`);}await this.applyPreferences(record);return {record:parsePreferencesRecord(record),committed:true as const,disposed:this.disposed};});this.preferencesTail=work.then(()=>{},()=>{});return work;
  }
  async reloadPreferences():Promise<void> {
    const store=this.requireStore(),read=store.readPreferences?.bind(store);ensure(this.preferencesSupported&&read,'PREFERENCES_UNSUPPORTED','Storage has no preferences port');const work=this.preferencesTail.catch(()=>{}).then(async()=>{ensure(!this.disposed,'PLAYER_DISPOSED','Player unavailable');const stored=await read();await this.applyPreferences(stored??{revision:0,value:parsePlayerPreferences(this.preferencesDefaults)});});this.preferencesTail=work.catch(()=>{});return work;
  }

  capture():DeepReadonly<Snapshot> {ensure(this.runtime,'PLAYER_NOT_STARTED','Start first');return this.runtime.capture();}
  dispose():void {
    if(this.disposed)return;this.disposed=true;++this.screenGeneration;this.nextGeneration();++this.importGeneration;this.options.signal?.removeEventListener('abort',this.abortRequested);this.abort.abort();const extra=this.extra;this.extra=null;extra?.controller.abort();extra?.imageAbort?.abort();extra?.image?.();extra?.child?.dispose();cancelAnimationFrame(this.frameId);if(this.backgroundTimer!==null)clearTimeout(this.backgroundTimer);this.backgroundTimer=null;
    document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('blur',this.blur);window.removeEventListener('focus',this.focus);
    this.unsubscribe?.();this.runtime?.stop();this.codeModules?.dispose();this.scheduler.dispose();this.inputController.dispose();this.scriptUI?.dispose();this.scriptUI=null;this.host.observeHistoryVoice(null);this.host.observeMusic(null);this.host.dispose();if(this.host.disposalError)this.error=String(this.host.disposalError);try{this.text?.dispose();}catch(error){this.error=String(error);}this.text=null;this.lifecycle='disposed';this.publish();this.listeners.clear();
    // IDB transactions already started finish before db.close. Borrowed stores remain open.
    if(this.ownsStore)this.store?.close();
  }
}
export async function createPlayer(options:PlayerOptions):Promise<Player> {return Player.create(options);}

export type {GraphicsOptions} from '../protocol/index.js';

export type {MediaStreamProvider,MediaStreamLease,MediaStreamRequest,Cancellation} from '../runtime/stream-ports.js';
export type {StreamingOptions,IntegrityEvidence,ResolvedStreamIdentity} from '../protocol/index.js';

export type ModulePlayerOptions=Omit<PlayerOptions,'program'|'release'|'moduleProvider'|'bindings'|'streaming'|'history'>&{program:ModuleProgram;moduleProvider:CodeModuleProvider;release?:never;bindings?:never;streaming?:never;history?:Omit<import('../protocol/index.js').HistoryPolicy,'rollback'>&{rollback:false}};
export function createModulePlayer(options:ModulePlayerOptions):Promise<Player> {return Player.create(options);}
