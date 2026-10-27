import {detached} from './wire-input.js';
import {wireBudget} from './budget.js';
import {canonicalParsedJSON} from './canonical.js';
import {isTextComplete} from './text.js';
import {normalizeNativeValue} from './values.js';
import {normalizeExpression,normalizeInstruction,normalizeProgram,normalizeSnapshot,normalizeProfile,normalizeRecipe,normalizeMetadata,normalizeBackup} from './normalize.js';
import { validateProgram, validateSnapshot, validateProfile, validateInstruction, validateValue, validateJsonValue, validateOperationOutcome, validateSavedInvocation, validateOperationResume, validateOperationWait, validateRestoreRecipe, validateSlotMetadata, validateStoreImport, validateProgressBatchWire, validateSourceMap, validatePortObligation, validateBehaviorMapping, validatePortableBackup, validateStoreBackupRestore, validateBackupRestoreReceipt, validateResourceBudget, validateResourceFact, validateReleaseManifest, validateAudioPreferences, validateTextPreferences, validatePlayerPreferences, validatePreferencesRecord, validatePreferencesPatch, validateExpression, validateRngConfig, validateRngState, validatePreferencesValue, validateStoredPreferencesRecord, validatePlaybackPreferences, validateInputPreferences, validateDisplayPreferences, validateAudioPlaybackEvent, validateTextStyle, validateRichTextSourceRun, validateTextState, validateTextTheme, validateTextWindow, validateTextLayout, validateTextFont, validateStagePose, validateStageFilters, validateStageCamera, validateStageScene, validateStageTaskState, validateAudioState, validateVoiceRecipe, validateMediaTaskState, validateTask, validateGraphicsOptions, validateInteractionWait, validateInteractionEvent, validateVideoTaskState, validateResolvedStreamIdentity, validateStreamDescriptor, validateIntegrityEvidence, validateStreamingOptions, validateSaveThumbnail, validateSaveCapture, validateSavePolicy, validateSaveGameOptions, validateSaveCommit, validateSaveReceipt,validateHistoryPolicy,validateHistoryEntry,validateHistoryRecord,validateHistoryCommit,validateHistoryReceipt,validateFlowChapter,validateFlowNode,validateFlowEdge,validateFlowchart,validateFlowProgress,validateFlowRun,validateExtraEntry,validateExtrasCatalog,validateExtrasProgress,validateUIStyle,validateUIControl,validateUIScreen,validateUICatalog,validateUIState,validateUIWait,validateUIAction,validateUIEvent,validateGamePresentation,validateGamePalette,validateGameLabels,validateSystemScreen,validateToolbarAction,validateLoadingOptions,validateStorageLayout,validateRetiredActivation,validateStoredSlotSummary,validateModuleFunction,validateModuleHeader,validateModulePartition,validateCodeModuleDescriptor,validateProgramModule,validateModuleManifest,validateProgramModuleBinding } from './generated/validators.js';
import type { Program, Snapshot, Profile, Instruction, Value, JsonValue, OperationOutcome, SavedInvocation, OperationResume, OperationWait, RestoreRecipe, SlotMetadata, StoreImport, ProgressBatchWire, SourceMap, PortObligation, BehaviorMapping, PortableBackup, StoreBackupRestore, BackupRestoreReceipt, ResourceBudget, ResourceFact, ReleaseManifest, AudioPreferences, TextPreferences, PlayerPreferences, PreferencesRecord, PreferencesPatch, Expression, RngConfig, RngState, PreferencesValue, StoredPreferencesRecord, PlaybackPreferences, InputPreferences, DisplayPreferences, AudioPlaybackEvent, TextStyle, RichTextSourceRun, TextState, TextTheme, TextWindow, TextLayout, TextFont, StagePose, StageFilters, StageCamera, StageScene, StageTaskState, AudioState, VoiceRecipe, MediaTaskState, Task, GraphicsOptions, InteractionWait, InteractionEvent, VideoTaskState, ResolvedStreamIdentity, StreamDescriptor, IntegrityEvidence, StreamingOptions, SaveThumbnail, SaveCapture, SavePolicy, SaveGameOptions, SaveCommit, SaveReceipt,HistoryPolicy,HistoryEntry,HistoryRecord,HistoryCommit,HistoryReceipt,FlowChapter,FlowNode,FlowEdge,Flowchart,FlowProgress,FlowRun,ExtraEntry,ExtrasCatalog,ExtrasProgress,UIStyle,UIControl,UIScreen,UICatalog,UIState,UIWait,UIAction,UIEvent,GamePresentation,GamePalette,GameLabels,SystemScreen,ToolbarAction,LoadingOptions,StorageLayout,RetiredActivation,StoredSlotSummary,ModuleFunction,ModuleHeader,ModulePartition,CodeModuleDescriptor,ProgramModule,ModuleManifest,ProgramModuleBinding } from './generated/wire.js';
export type * from './generated/wire.js';
export { operationSpecs, recoveryOpcodes } from './generated/operations.js';
type JsonPrimitive = Extract<JsonValue,string|number|boolean|null>;
interface ReadonlyJsonArray extends ReadonlyArray<ReadonlyJsonValue> {}
interface ReadonlyJsonObject {readonly [key:string]:ReadonlyJsonValue;}
type ReadonlyJsonValue=JsonPrimitive|ReadonlyJsonArray|ReadonlyJsonObject;
type ReadonlyNode<T> = T extends string | number | boolean | bigint | symbol | null | undefined ? T : {readonly [K in keyof T]:DeepReadonly<T[K]>};
export type DeepReadonly<T> = [T] extends [string|number|boolean|bigint|symbol|null|undefined] ? T : [T] extends [JsonValue] ? [JsonValue] extends [T] ? ReadonlyJsonValue : ReadonlyNode<T> : ReadonlyNode<T>;
export class GalboxError extends Error {
  constructor(readonly code: string, readonly reason: string, readonly location?:{address?:string;path?:string}) { super(`${code}: ${reason}`); this.name = 'GalboxError'; }
}
export function ensure(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new GalboxError(code, message);
}
export function canonicalWireJSON(input:unknown):string {return canonicalParsedJSON(detached(input));}
export function parseProgram(input: unknown): Program {
  const data = detached(input);if(!validateProgram(data)){const path=validateProgram.errors?.find(e=>/\/functions\/\d+\/code\/\d+/.test(e.instancePath))?.instancePath??validateProgram.errors?.[0]?.instancePath??'';const address=rawInstructionAddress(data,path);throw new GalboxError('SCHEMA_PROGRAM',JSON.stringify(validateProgram.errors),{path,...(address?{address}:{})});}return normalizeProgram(data);
}
export function parseSnapshot(input: unknown): Snapshot {
  const data = detached(input); ensure(validateSnapshot(data), 'SCHEMA_SNAPSHOT', JSON.stringify(validateSnapshot.errors)); return normalizeSnapshot(data);
}
export function parseProfile(input: unknown): Profile {
  const data = detached(input); ensure(validateProfile(data), 'SCHEMA_PROFILE', JSON.stringify(validateProfile.errors)); return normalizeProfile(data);
}
export function parseInstruction(input: unknown): Instruction {
  const data = detached(input); ensure(validateInstruction(data), 'SCHEMA_INSTRUCTION', JSON.stringify(validateInstruction.errors)); return normalizeInstruction(data);
}
export function parseValue(input: unknown): Value {
  const data = detached(input); ensure(validateValue(data), 'SCHEMA_VALUE', JSON.stringify(validateValue.errors)); return normalizeNativeValue(data);
}
export function i32(value: number): Extract<Value, {kind: 'i32'}> {
  ensure(Number.isInteger(value) && value >= -2147483648 && value <= 2147483647, 'I32_RANGE', `${value}`); return {kind: 'i32', value};
}
export function string(value: string): Extract<Value, {kind: 'string'}> { const v = parseValue({kind:'string',value}); ensure(v.kind === 'string','VALUE_KIND','string'); return v; }
export function bool(value: boolean): Extract<Value, {kind: 'bool'}> { ensure(typeof value==='boolean','BOOL_TYPE','Expected boolean');return {kind:'bool',value}; }
export function emptyProfile(): Profile { return {revision:0,values:{},read:[]}; }
export function readUnit(text: {textId: string; revision: string}): string {ensure(text&&typeof text.textId==='string'&&typeof text.revision==='string'&&[text.textId,text.revision].every(id=>/^[a-zA-Z][a-zA-Z0-9_.:/-]{0,127}$/.test(id)),'TEXT_IDENTITY','TextId/revision reserve @ as the ReadUnit separator');return `${text.textId}@${text.revision}`;}
export const capabilities = ['adv', 'stage.linear', 'audio.wav', 'tasks.all', 'profile','operations','expressions','rng.lcg32','text.rich','text.windows','values.extended','stage.effects','audio.extended','audio.media','interaction.timed','video.webm','media.stream','flowchart','extras','ui.controls'] as const;

export function parseJsonValue(input:unknown):JsonValue {
  const data=detached(input);ensure(validateJsonValue(data),'SCHEMA_JSON','Invalid normalized JSON');return data;
}
export function parseOperationOutcome(input:unknown):OperationOutcome {const data=detached(input);ensure(validateOperationOutcome(data),'OPERATION_OUTPUT',JSON.stringify(validateOperationOutcome.errors));data.actions.forEach(a=>normalizeNativeValue(a.value));return data;}
export function parseSavedInvocation(input:unknown):SavedInvocation {const data=detached(input);ensure(validateSavedInvocation(data),'SAVED_INVOCATION',JSON.stringify(validateSavedInvocation.errors));return data;}
export function parseOperationResume(input:unknown):OperationResume {const data=detached(input);ensure(validateOperationResume(data),'OPERATION_RESUME',JSON.stringify(validateOperationResume.errors));return data;}
export function parseOperationWait(input:unknown):OperationWait {const data=detached(input);ensure(validateOperationWait(data),'OPERATION_WAIT',JSON.stringify(validateOperationWait.errors));return data;}
export {codec} from './codecs.js';
export type {ProtocolCodec,Decoded} from './codecs.js';

export function parseRestoreRecipe(input:unknown):RestoreRecipe {const data=detached(input);ensure(validateRestoreRecipe(data),'SCHEMA_RECIPE',JSON.stringify(validateRestoreRecipe.errors));return normalizeRecipe(data);}

export function parseSlotMetadata(input:unknown):SlotMetadata {const data=detached(input);ensure(validateSlotMetadata(data),'SCHEMA_SLOT_METADATA',JSON.stringify(validateSlotMetadata.errors));return normalizeMetadata(data);}
export function parseStoreImport(input:unknown):StoreImport {const data=detached(input);ensure(validateStoreImport(data),'SCHEMA_STORE_IMPORT',JSON.stringify(validateStoreImport.errors));normalizeSnapshot(data.snapshot);normalizeProfile(data.profile);normalizeMetadata(data.metadata);return data;}

export function parseProgressBatch(input:unknown):ProgressBatchWire {const data=detached(input);ensure(validateProgressBatchWire(data),'SCHEMA_PROGRESS_BATCH',JSON.stringify(validateProgressBatchWire.errors));data.changes.forEach(c=>{if(c.type==='set')normalizeNativeValue(c.value);else if(c.type==='flow')parseFlowProgress(c.value);else if(c.type==='extras')parseExtrasProgress(c.value);});return data;}

function rawInstructionAddress(data:unknown,path:string):string|undefined {const match=path.match(/\/functions\/(\d+)\/code\/(\d+)/);if(!match||data===null||typeof data!=='object'||!('functions'in data)||!Array.isArray(data.functions))return;const f:unknown=data.functions[Number(match[1])];if(f===null||typeof f!=='object'||!('code'in f)||!Array.isArray(f.code))return;const i:unknown=f.code[Number(match[2])];return i!==null&&typeof i==='object'&&'at'in i&&typeof i.at==='string'?i.at:undefined;}
export function parseSourceMap(input:unknown):SourceMap {const data=detached(input);ensure(validateSourceMap(data),'SCHEMA_SOURCE_MAP',JSON.stringify(validateSourceMap.errors));return data;}
export function parsePortObligation(input:unknown):PortObligation {const data=detached(input);ensure(validatePortObligation(data),'SCHEMA_OBLIGATION',JSON.stringify(validatePortObligation.errors));return data;}
export function parseBehaviorMapping(input:unknown):BehaviorMapping {const data=detached(input);ensure(validateBehaviorMapping(data),'SCHEMA_MAPPING',JSON.stringify(validateBehaviorMapping.errors));return data;}

export function parsePortableBackup(input:unknown):PortableBackup {const data=detached(input);ensure(validatePortableBackup(data),'SCHEMA_BACKUP',JSON.stringify(validatePortableBackup.errors));return normalizeBackup(data);}
export function parseStoreBackupRestore(input:unknown):StoreBackupRestore {const data=detached(input);ensure(validateStoreBackupRestore(data),'SCHEMA_BACKUP_RESTORE',JSON.stringify(validateStoreBackupRestore.errors));normalizeBackup(data.backup);return data;}
export function parseBackupRestoreReceipt(input:unknown):BackupRestoreReceipt {const data=detached(input);ensure(validateBackupRestoreReceipt(data),'SCHEMA_BACKUP_RECEIPT',JSON.stringify(validateBackupRestoreReceipt.errors));return data;}

export function parseResourceBudget(input:unknown):ResourceBudget {const data=detached(input);ensure(validateResourceBudget(data),'RESOURCE_BUDGET_SCHEMA',JSON.stringify(validateResourceBudget.errors));return data;}

export function parseResourceFact(input:unknown):ResourceFact {const data=detached(input);ensure(validateResourceFact(data),'RESOURCE_FACT_SCHEMA',JSON.stringify(validateResourceFact.errors));return data;}

export function parseReleaseManifest(input:unknown):ReleaseManifest {const data=detached(input);ensure(validateReleaseManifest(data),'RELEASE_SCHEMA',JSON.stringify(validateReleaseManifest.errors));return data;}

export function parseAudioPreferences(input:unknown):AudioPreferences {const data=detached(input);ensure(validateAudioPreferences(data),'SCHEMA_PREFERENCES',JSON.stringify(validateAudioPreferences.errors));return data;}

export function parseTextPreferences(input:unknown):TextPreferences {const data=detached(input);ensure(validateTextPreferences(data),'SCHEMA_PREFERENCES',JSON.stringify(validateTextPreferences.errors));return data;}

export function parsePlayerPreferences(input:unknown):PlayerPreferences {const data=detached(input);ensure(validatePlayerPreferences(data),'SCHEMA_PREFERENCES',JSON.stringify(validatePlayerPreferences.errors));return data;}

export function parsePreferencesRecord(input:unknown):PreferencesRecord {const data=detached(input);ensure(validatePreferencesRecord(data),'SCHEMA_PREFERENCES',JSON.stringify(validatePreferencesRecord.errors));return data;}

export function parsePreferencesPatch(input:unknown):PreferencesPatch {const data=detached(input);ensure(validatePreferencesPatch(data),'SCHEMA_PREFERENCES',JSON.stringify(validatePreferencesPatch.errors));return data;}

export function parseExpression(input:unknown):Expression {const data=detached(input);ensure(validateExpression(data),'SCHEMA_EXPRESSION',JSON.stringify(validateExpression.errors));return normalizeExpression(data);}

export function parseRngConfig(input:unknown):RngConfig {const data=detached(input);ensure(validateRngConfig(data),'SCHEMA_RNGCONFIG',JSON.stringify(validateRngConfig.errors));return data;}

export function parseRngState(input:unknown):RngState {const data=detached(input);ensure(validateRngState(data),'SCHEMA_RNGSTATE',JSON.stringify(validateRngState.errors));return data;}

export function parsePreferencesValue(input:unknown):PreferencesValue {const data=detached(input);ensure(validatePreferencesValue(data),'SCHEMA_PREFERENCES',JSON.stringify(validatePreferencesValue.errors));return data;}

export function parseStoredPreferencesRecord(input:unknown):StoredPreferencesRecord {const data=detached(input);ensure(validateStoredPreferencesRecord(data),'SCHEMA_PREFERENCES',JSON.stringify(validateStoredPreferencesRecord.errors));return data;}

export function parsePlaybackPreferences(input:unknown):PlaybackPreferences {const data=detached(input);ensure(validatePlaybackPreferences(data),'SCHEMA_PLAYBACK',JSON.stringify(validatePlaybackPreferences.errors));return data;}

export function parseInputPreferences(input:unknown):InputPreferences {const data=detached(input);ensure(validateInputPreferences(data),'SCHEMA_PLAYBACK',JSON.stringify(validateInputPreferences.errors));return data;}

export function parseDisplayPreferences(input:unknown):DisplayPreferences {const data=detached(input);ensure(validateDisplayPreferences(data),'SCHEMA_PLAYBACK',JSON.stringify(validateDisplayPreferences.errors));return data;}

export function parseAudioPlaybackEvent(input:unknown):AudioPlaybackEvent {const data=detached(input);ensure(validateAudioPlaybackEvent(data),'SCHEMA_PLAYBACK',JSON.stringify(validateAudioPlaybackEvent.errors));return data;}

export function parseTextStyle(input:unknown):TextStyle {const data=detached(input);ensure(validateTextStyle(data),'SCHEMA_TEXT',JSON.stringify(validateTextStyle.errors));return data;}

export function parseRichTextSourceRun(input:unknown):RichTextSourceRun {const data=detached(input);ensure(validateRichTextSourceRun(data),'SCHEMA_TEXT',JSON.stringify(validateRichTextSourceRun.errors));return data;}

export function parseTextState(input:unknown):TextState {const data=detached(input);ensure(validateTextState(data),'SCHEMA_TEXT',JSON.stringify(validateTextState.errors));return data;}

export {isTextComplete,textUnitCount} from './text.js';

export function parseTextTheme(input:unknown):TextTheme {const data=detached(input);ensure(validateTextTheme(data),'SCHEMA_TEXT_LAYOUT',JSON.stringify(validateTextTheme.errors));return data;}

export function parseTextWindow(input:unknown):TextWindow {const data=detached(input);ensure(validateTextWindow(data),'SCHEMA_TEXT_LAYOUT',JSON.stringify(validateTextWindow.errors));return data;}

export function parseTextLayout(input:unknown):TextLayout {const data=detached(input);ensure(validateTextLayout(data),'SCHEMA_TEXT_LAYOUT',JSON.stringify(validateTextLayout.errors));return data;}

export function parseTextFont(input:unknown):TextFont {const data=detached(input);ensure(validateTextFont(data),'SCHEMA_TEXT_LAYOUT',JSON.stringify(validateTextFont.errors));return data;}

export {i64,f64,f64Bits,f64Number,nullValue,list,dict} from './values.js';

export function parseStagePose(input:unknown):StagePose {const data=detached(input);ensure(validateStagePose(data),'SCHEMA_STAGE',JSON.stringify(validateStagePose.errors));return data;}

export function parseStageFilters(input:unknown):StageFilters {const data=detached(input);ensure(validateStageFilters(data),'SCHEMA_STAGE',JSON.stringify(validateStageFilters.errors));return data;}

export function parseStageCamera(input:unknown):StageCamera {const data=detached(input);ensure(validateStageCamera(data),'SCHEMA_STAGE',JSON.stringify(validateStageCamera.errors));return data;}

export function parseStageScene(input:unknown):StageScene {const data=detached(input);ensure(validateStageScene(data),'SCHEMA_STAGE',JSON.stringify(validateStageScene.errors));return data;}

export function parseStageTaskState(input:unknown):StageTaskState {const data=detached(input);ensure(validateStageTaskState(data),'SCHEMA_STAGE',JSON.stringify(validateStageTaskState.errors));return data;}

export function parseAudioState(input:unknown):AudioState {const data=detached(input);ensure(validateAudioState(data),'SCHEMA_AUDIO',JSON.stringify(validateAudioState.errors));return data;}

export function parseVoiceRecipe(input:unknown):VoiceRecipe {const data=detached(input);ensure(validateVoiceRecipe(data),'SCHEMA_AUDIO',JSON.stringify(validateVoiceRecipe.errors));return data;}

export function parseMediaTaskState(input:unknown):MediaTaskState {const data=detached(input);ensure(validateMediaTaskState(data),'SCHEMA_AUDIO',JSON.stringify(validateMediaTaskState.errors));return data;}

export function parseTask(input:unknown):Task {const data=detached(input);ensure(validateTask(data),'SCHEMA_TASK',JSON.stringify(validateTask.errors));return data;}

export function parseGraphicsOptions(input:unknown):GraphicsOptions {const data=detached(input);ensure(validateGraphicsOptions(data),'SCHEMA_GRAPHICS',JSON.stringify(validateGraphicsOptions.errors));return data;}

export function parseInteractionWait(input:unknown):InteractionWait {const data=detached(input);ensure(validateInteractionWait(data),'SCHEMA_INTERACTIONWAIT',JSON.stringify(validateInteractionWait.errors));return data;}

export function parseInteractionEvent(input:unknown):InteractionEvent {const data=detached(input);ensure(validateInteractionEvent(data),'SCHEMA_INTERACTIONEVENT',JSON.stringify(validateInteractionEvent.errors));return data;}

export function parseVideoTaskState(input:unknown):VideoTaskState {const data=detached(input);ensure(validateVideoTaskState(data),'SCHEMA_VIDEOTASKSTATE',JSON.stringify(validateVideoTaskState.errors));return data;}

export function parseResolvedStreamIdentity(input:unknown):ResolvedStreamIdentity {const data=detached(input);ensure(validateResolvedStreamIdentity(data),'SCHEMA_RESOLVEDSTREAMIDENTITY',JSON.stringify(validateResolvedStreamIdentity.errors));return data;}

export function parseStreamDescriptor(input:unknown):StreamDescriptor {const data=detached(input);ensure(validateStreamDescriptor(data),'SCHEMA_STREAMDESCRIPTOR',JSON.stringify(validateStreamDescriptor.errors));return data;}

export function parseIntegrityEvidence(input:unknown):IntegrityEvidence {const data=detached(input);ensure(validateIntegrityEvidence(data),'SCHEMA_INTEGRITYEVIDENCE',JSON.stringify(validateIntegrityEvidence.errors));if(data.level==='digest-verified')ensure(data.expectedSha256===data.verifiedSha256,'INTEGRITY_DIGEST','Verified digest differs from expectation');if(data.level==='versioned-url')ensure(data.etag===`"${data.version}"`,'INTEGRITY_VERSION','ETag differs from version');return data;}

export function parseStreamingOptions(input:unknown):StreamingOptions {const data=detached(input);ensure(validateStreamingOptions(data),'SCHEMA_STREAMINGOPTIONS',JSON.stringify(validateStreamingOptions.errors));return data;}

export function parseSaveThumbnail(input:unknown):SaveThumbnail {const data=detached(input);ensure(validateSaveThumbnail(data),'SAVE_THUMBNAIL','Invalid bounded PNG thumbnail');const bytes=(data.dataURL.length-22)*3/4-(data.dataURL.endsWith('==')?2:data.dataURL.endsWith('=')?1:0);ensure(bytes<=262144&&data.dataURL.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAC0'),'SAVE_THUMBNAIL','Expected 320 by 180 PNG, at most 256 KiB');return data;}
export function parseSaveCapture(input:unknown):SaveCapture {const data=detached(input);ensure(validateSaveCapture(data),'SAVE_CAPTURE','Invalid capture');if(data.thumbnail)parseSaveThumbnail(data.thumbnail);return data;}
export function parseSavePolicy(input:unknown):SavePolicy {const data=detached(input);ensure(validateSavePolicy(data),'SAVE_POLICY_CONFIG','Invalid save policy');return data;}
export function parseSaveGameOptions(input:unknown):SaveGameOptions {const data=detached(input);ensure(validateSaveGameOptions(data),'SAVE_OPTIONS','Invalid save options');return data;}
export function parseSaveCommit(input:unknown):SaveCommit {const data=detached(input);ensure(validateSaveCommit(data),'SAVE_COMMIT','Invalid save commit');normalizeSnapshot(data.snapshot);normalizeMetadata(data.metadata);ensure(data.metadata.capture?.id===data.id,'SAVE_CAPTURE_MISMATCH','Commit must own its capture');assertSaveCut(data.snapshot,data.metadata);return data;}
export function parseSaveReceipt(input:unknown):SaveReceipt {const data=detached(input);ensure(validateSaveReceipt(data),'SAVE_RECEIPT','Invalid save receipt');return data;}

export function assertSaveCut(snapshot:DeepReadonly<Snapshot>,metadata:DeepReadonly<SlotMetadata>):void {const c=metadata.capture;if(c)ensure(c.logicalTime===snapshot.logicalTime&&c.textId===(snapshot.text?.textId??null)&&c.speaker===(snapshot.text?.speaker??'').slice(0,512)&&c.text===(snapshot.text?.content??'').slice(0,4096),'SAVE_CAPTURE_MISMATCH','Capture summary differs from snapshot cut');}

export function parseHistoryPolicy(input:unknown):HistoryPolicy {const d=detached(input);ensure(validateHistoryPolicy(d),'HISTORY_POLICY','Invalid bounded history policy');return d;}
function normalizeHistoryEntry(d:HistoryEntry):HistoryEntry {ensure(isTextComplete(d.text),'HISTORY_TEXT','History must represent a confirmed complete body');ensure(d.text.historyId===d.id,'HISTORY_ID','Text and checkpoint identity differ');if(d.snapshot){normalizeSnapshot(d.snapshot);ensure(d.reason===null&&d.snapshot.saveAllowed&&d.snapshot.release===d.release&&d.snapshot.wait?.kind==='text'&&d.snapshot.text?.historyId===d.id&&canonicalParsedJSON(d.snapshot.text)===canonicalParsedJSON(d.text),'HISTORY_CUT','Checkpoint must be the actual confirmed text cut');}else ensure(d.reason,'HISTORY_CUT','Missing point must explain its refusal');return d;}
function normalizeHistoryEntries(entries:HistoryEntry[]):void {for(const entry of entries)normalizeHistoryEntry(entry);ensure(new Set(entries.map(e=>e.id)).size===entries.length&&JSON.stringify(entries).length<=1000000,'HISTORY_SIZE','Journal bound or identity exceeded');}
export function parseHistoryEntry(input:unknown):HistoryEntry {const d=detached(input);ensure(validateHistoryEntry(d),'HISTORY_ENTRY','Invalid history entry');return normalizeHistoryEntry(d);}
export function parseHistoryRecord(input:unknown):HistoryRecord {const d=detached(input);ensure(validateHistoryRecord(d),'HISTORY_RECORD','Invalid history record');normalizeHistoryEntries(d.entries);return d;}
export function parseHistoryCommit(input:unknown):HistoryCommit {const d=detached(input);ensure(validateHistoryCommit(d),'HISTORY_COMMIT','Invalid history commit');normalizeHistoryEntries(d.entries);return d;}
export function parseHistoryReceipt(input:unknown):HistoryReceipt {const d=detached(input);ensure(validateHistoryReceipt(d),'HISTORY_RECEIPT','Invalid history receipt');return d;}

export function parseFlowChapter(input:unknown):FlowChapter {const d=detached(input);ensure(validateFlowChapter(d),'FLOW_CHAPTER','Invalid chapter');return d;}
export function parseFlowNode(input:unknown):FlowNode {const d=detached(input);ensure(validateFlowNode(d),'FLOW_NODE','Invalid node');normalizeExpression(d.unlock);normalizeExpression(d.gate);return d;}
export function parseFlowEdge(input:unknown):FlowEdge {const d=detached(input);ensure(validateFlowEdge(d),'FLOW_EDGE','Invalid edge');return d;}
export function parseFlowchart(input:unknown):Flowchart {const d=detached(input);ensure(validateFlowchart(d),'FLOW_SCHEMA','Invalid flowchart');d.nodes.forEach(n=>{normalizeExpression(n.unlock);normalizeExpression(n.gate);});return d;}
export function parseFlowProgress(input:unknown):FlowProgress {const d=detached(input);ensure(validateFlowProgress(d),'FLOW_PROGRESS','Invalid node progress');ensure(d.visited.every(id=>d.unlocked.includes(id)),'FLOW_PROGRESS','Visited nodes must be unlocked');return d;}
export function parseFlowRun(input:unknown):FlowRun {const d=detached(input);ensure(validateFlowRun(d),'FLOW_RUN','Invalid flow state');return d;}

export function parseExtraEntry(input:unknown):ExtraEntry {const d=detached(input);ensure(validateExtraEntry(d),'EXTRAS_ENTRY','Invalid gallery entry');normalizeExpression(d.unlock);return d;}
export function parseExtrasCatalog(input:unknown):ExtrasCatalog {const d=detached(input);ensure(validateExtrasCatalog(d),'EXTRAS_CATALOG','Invalid extras catalog');d.entries.forEach(e=>normalizeExpression(e.unlock));return d;}
export function parseExtrasProgress(input:unknown):ExtrasProgress {const d=detached(input);ensure(validateExtrasProgress(d),'EXTRAS_PROGRESS','Invalid extras progress');return d;}

export function parseUIStyle(input:unknown):UIStyle {const data=detached(input);ensure(validateUIStyle(data),'UI_SCHEMA','Invalid UIStyle');return data;}

export function parseUIControl(input:unknown):UIControl {const data=detached(input);ensure(validateUIControl(data),'UI_SCHEMA','Invalid UIControl');return data;}

export function parseUIScreen(input:unknown):UIScreen {const data=detached(input);ensure(validateUIScreen(data),'UI_SCHEMA','Invalid UIScreen');return data;}

export function parseUICatalog(input:unknown):UICatalog {const data=detached(input);ensure(validateUICatalog(data),'UI_SCHEMA','Invalid UICatalog');return data;}

export function parseUIState(input:unknown):UIState {const data=detached(input);ensure(validateUIState(data),'UI_SCHEMA','Invalid UIState');return data;}

export function parseUIWait(input:unknown):UIWait {const data=detached(input);ensure(validateUIWait(data),'UI_SCHEMA','Invalid UIWait');return data;}

export function parseUIAction(input:unknown):UIAction {const data=detached(input);ensure(validateUIAction(data),'UI_SCHEMA','Invalid UIAction');return data;}

export function parseUIEvent(input:unknown):UIEvent {const data=detached(input);ensure(validateUIEvent(data),'UI_SCHEMA','Invalid UIEvent');return data;}

export function parseGamePresentation(input:unknown):GamePresentation {const data=detached(input);ensure(validateGamePresentation(data),'PRESENTATION_SCHEMA','Invalid GamePresentation');return data;}

export function parseGamePalette(input:unknown):GamePalette {const data=detached(input);ensure(validateGamePalette(data),'PRESENTATION_SCHEMA','Invalid GamePalette');return data;}

export function parseGameLabels(input:unknown):GameLabels {const data=detached(input);ensure(validateGameLabels(data),'PRESENTATION_SCHEMA','Invalid GameLabels');return data;}

export function parseSystemScreen(input:unknown):SystemScreen {const data=detached(input);ensure(validateSystemScreen(data),'PRESENTATION_SCHEMA','Invalid SystemScreen');return data;}

export function parseToolbarAction(input:unknown):ToolbarAction {const data=detached(input);ensure(validateToolbarAction(data),'PRESENTATION_SCHEMA','Invalid ToolbarAction');return data;}

export function parseLoadingOptions(input:unknown):LoadingOptions {const data=detached(input);ensure(validateLoadingOptions(data),'SCHEMA_LOADING',JSON.stringify(validateLoadingOptions.errors));return data;}

export function parseStorageLayout(input:unknown):StorageLayout {const data=detached(input);ensure(validateStorageLayout(data),'SCHEMA_STORAGE',JSON.stringify(validateStorageLayout.errors));return data;}

export function parseRetiredActivation(input:unknown):RetiredActivation {const data=detached(input);ensure(validateRetiredActivation(data),'SCHEMA_STORAGE',JSON.stringify(validateRetiredActivation.errors));return data;}

export function parseStoredSlotSummary(input:unknown):StoredSlotSummary {const data=detached(input);ensure(validateStoredSlotSummary(data),'SCHEMA_STORAGE',JSON.stringify(validateStoredSlotSummary.errors));return data;}

export function parseModuleFunction(input:unknown):ModuleFunction {const data=detached(input);ensure(validateModuleFunction(data),'SCHEMA_MODULE',JSON.stringify(validateModuleFunction.errors));return data;}

export function parseModuleHeader(input:unknown):ModuleHeader {const data=detached(input);ensure(validateModuleHeader(data),'SCHEMA_MODULE',JSON.stringify(validateModuleHeader.errors));return data;}

export function parseModulePartition(input:unknown):ModulePartition {const data=detached(input);ensure(validateModulePartition(data),'SCHEMA_MODULE',JSON.stringify(validateModulePartition.errors));return data;}

export function parseCodeModuleDescriptor(input:unknown):CodeModuleDescriptor {const data=detached(input);ensure(validateCodeModuleDescriptor(data),'SCHEMA_MODULE',JSON.stringify(validateCodeModuleDescriptor.errors));return data;}

export function parseProgramModule(input:unknown):ProgramModule {const data=detached(input);ensure(validateProgramModule(data),'SCHEMA_MODULE',JSON.stringify(validateProgramModule.errors));return data;}

export function parseModuleManifest(input:unknown):ModuleManifest {const data=detached(input);ensure(validateModuleManifest(data),'SCHEMA_MODULE',JSON.stringify(validateModuleManifest.errors));return data;}

export function parseProgramModuleBinding(input:unknown):ProgramModuleBinding {const data=detached(input);ensure(validateProgramModuleBinding(data),'SCHEMA_MODULE',JSON.stringify(validateProgramModuleBinding.errors));return data;}
