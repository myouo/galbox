import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { compile } from 'json-schema-to-typescript';
import Ajv from 'ajv';
import {parse as parseYaml} from 'yaml';
import {generateProtobuf} from './generate-protobuf.mjs';
function validationSchema(value){if(Array.isArray(value))return value.map(validationSchema);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!key.startsWith('x-proto')).map(([key,v])=>[key,validationSchema(v)]));return value;}
import standalone from 'ajv/dist/standalone/index.js';
const sourceSchema=parseYaml(await readFile('packages/galbox-sdk/schema/protocol.yaml','utf8'));const schema=validationSchema(sourceSchema);
if(!process.argv.includes('--check')){await mkdir('packages/galbox-sdk/src/protocol/generated',{recursive:true});await mkdir('packages/cli/src/generated',{recursive:true});}
const ajv=new Ajv({allErrors:false,strict:true,code:{source:true,esm:true},inlineRefs:false});
ajv.addSchema(schema);
const exports={};
for(const key of ['Program','Snapshot','Profile','Instruction','Value','JsonValue','OperationOutcome','SavedInvocation','OperationResume','OperationWait','RestoreRecipe','SlotMetadata','StoreImport','ProgressBatchWire','SourceMap','PortObligation','BehaviorMapping','PortableBackup','StoreBackupRestore','BackupRestoreReceipt','ResourceBudget','ResourceFact','ReleaseManifest','AudioPreferences','TextPreferences','PlayerPreferences','PreferencesRecord','PreferencesPatch','Expression','RngConfig','RngState','PreferencesValue','StoredPreferencesRecord','PlaybackPreferences','InputPreferences','DisplayPreferences','AudioPlaybackEvent','TextStyle','RichTextSourceRun','TextState','TextTheme','TextWindow','TextLayout','TextFont','StagePose','StageFilters','StageCamera','StageScene','StageTaskState','AudioState','VoiceRecipe','UISoundRequest','MediaTaskState','Task','GraphicsOptions','InteractionWait','InteractionEvent','VideoTaskState','ResolvedStreamIdentity','StreamDescriptor','IntegrityEvidence','StreamingOptions','SaveThumbnail','SaveCapture','SavePolicy','SaveGameOptions','SaveCommit','SaveReceipt','HistoryPolicy','HistoryEntry','HistoryRecord','HistoryCommit','HistoryReceipt','FlowChapter','FlowNode','FlowEdge','Flowchart','FlowProgress','FlowRun','ExtraEntry','ExtrasCatalog','ExtrasProgress','UIStyle','UIControl','UIScreen','UICatalog','UIState','UIWait','UIAction','UIEvent','GamePresentation','GamePalette','GameLabels','SystemScreen','ToolbarAction','LoadingOptions','StorageLayout','RetiredActivation','StoredSlotSummary','ModuleFunction','ModuleHeader','ModulePartition','CodeModuleDescriptor','ProgramModule','ModuleManifest','ProgramModuleBinding']) {
 const id=`https://galbox.local/${key}`;
 ajv.addSchema({$id:id,$ref:`${schema.$id}#/definitions/${key}`});
 exports[`validate${key}`]=id;
}
const operationSpecs=Object.fromEntries(schema.definitions.Instruction.oneOf.map(op=>[op.properties.op.const,{opcode:op.properties.op.const,parameters:Object.keys(op.properties).filter(k=>k!=='op'),required:op.required.filter(k=>k!=='op')} ]));
const output={
 'operations.ts':`/* Generated from schema/protocol.yaml. */\nexport const operationSpecs = ${JSON.stringify(operationSpecs,null,2)} as const;\nexport const recoveryOpcodes = ${JSON.stringify(schema.definitions.RecipeOpcode.enum)} as const;\n`,
 'wire.ts':await compile(schema,'Wire',{bannerComment:'/* Generated from schema/protocol.yaml. Do not edit. */',additionalProperties:false,unreachableDefinitions:true,style:{singleQuote:true},maxItems:0}),
 'validators.js':standalone.default(ajv,exports)+'\n',
 'validators.d.ts':`import type { Program, Snapshot, Profile, Instruction, Value, JsonValue, OperationOutcome, SavedInvocation, OperationResume, OperationWait, RestoreRecipe, SlotMetadata, StoreImport, ProgressBatchWire, SourceMap, PortObligation, BehaviorMapping, PortableBackup, StoreBackupRestore, BackupRestoreReceipt, ResourceBudget, ResourceFact, ReleaseManifest, AudioPreferences, TextPreferences, PlayerPreferences, PreferencesRecord, PreferencesPatch, Expression, RngConfig, RngState, PreferencesValue, StoredPreferencesRecord, PlaybackPreferences, InputPreferences, DisplayPreferences, AudioPlaybackEvent, TextStyle, RichTextSourceRun, TextState, TextTheme, TextWindow, TextLayout, TextFont, StagePose, StageFilters, StageCamera, StageScene, StageTaskState, AudioState, VoiceRecipe, UISoundRequest, MediaTaskState, Task, GraphicsOptions, InteractionWait, InteractionEvent, VideoTaskState, ResolvedStreamIdentity, StreamDescriptor, IntegrityEvidence, StreamingOptions, SaveThumbnail, SaveCapture, SavePolicy, SaveGameOptions, SaveCommit, SaveReceipt, HistoryPolicy, HistoryEntry, HistoryRecord, HistoryCommit, HistoryReceipt, FlowChapter, FlowNode, FlowEdge, Flowchart, FlowProgress, FlowRun, ExtraEntry, ExtrasCatalog, ExtrasProgress, UIStyle, UIControl, UIScreen, UICatalog, UIState, UIWait, UIAction, UIEvent, GamePresentation, GamePalette, GameLabels, SystemScreen, ToolbarAction, LoadingOptions, StorageLayout, RetiredActivation, StoredSlotSummary, ModuleFunction, ModuleHeader, ModulePartition, CodeModuleDescriptor, ProgramModule, ModuleManifest, ProgramModuleBinding } from './wire.js';\n${Object.keys(exports).map(name=>`export declare const ${name}: { (data: unknown): data is ${name.slice(8)}; errors?: readonly {readonly instancePath: string; readonly message?: string}[] | null };`).join('\n')}\n`
};
if(/\brequire\s*\(/u.test(output['validators.js']))throw new Error('Standalone validator must be native ESM without CommonJS runtime helpers');
let drift=false;
for(const [name,body] of Object.entries(output)) {
 const p=`packages/galbox-sdk/src/protocol/generated/${name}`;
 if(process.argv.includes('--check')) {
  if(await readFile(p,'utf8').catch(()=>null)!==body){console.error(`Generated drift: ${p}`);drift=true;}
 } else await writeFile(p,body);
}
if(drift)process.exitCode=1;

await generateProtobuf(sourceSchema,Object.keys(exports).map(name=>name.slice(8)),process.argv.includes('--check'));
const cliSchema=parseYaml(await readFile('packages/cli/schema/project.yaml','utf8'));
const cliAjv=new Ajv({allErrors:true,strict:true,code:{source:true,esm:true}});const cliValidate=cliAjv.compile(cliSchema);
const cliOutput={
 'config.ts':await compile(cliSchema,'ProjectConfig',{bannerComment:'/* Generated from schema/project.yaml. */',additionalProperties:false,maxItems:0}),
 'validator.js':standalone.default(cliAjv,cliValidate)+'\n',
 'validator.d.ts':`import type {ProjectConfig} from './config.js';\nexport default function validate(input:unknown):input is ProjectConfig;\n`
};
for(const [name,body]of Object.entries(cliOutput)){const p=`packages/cli/src/generated/${name}`;if(process.argv.includes('--check')){if(await readFile(p,'utf8').catch(()=>null)!==body){console.error(`Generated drift: ${p}`);drift=true;}}else await writeFile(p,body);}
if(drift)process.exitCode=1;
