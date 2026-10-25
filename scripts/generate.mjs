import { readFile, writeFile } from 'node:fs/promises';
import { compile } from 'json-schema-to-typescript';
import Ajv from 'ajv';
import standalone from 'ajv/dist/standalone/index.js';
const schema=JSON.parse(await readFile('packages/galbox-sdk/schema/protocol.json','utf8'));
const ajv=new Ajv({allErrors:true,strict:true,code:{source:true,esm:true},inlineRefs:true});
ajv.addSchema(schema);
const exports={};
for(const key of ['Program','Snapshot','Profile','Instruction','Value','JsonValue','OperationOutcome','SavedInvocation','OperationResume','OperationWait','RestoreRecipe','SlotMetadata','StoreImport','ProgressBatchWire','SourceMap','PortObligation','BehaviorMapping','PortableBackup','StoreBackupRestore','BackupRestoreReceipt','ResourceBudget','ResourceFact','ReleaseManifest']) {
 const id=`https://galbox.local/${key}`;
 ajv.addSchema({$id:id,$ref:`${schema.$id}#/definitions/${key}`});
 exports[`validate${key}`]=id;
}
const operationSpecs=Object.fromEntries(schema.definitions.Instruction.oneOf.map(op=>[op.properties.op.const,{opcode:op.properties.op.const,parameters:Object.keys(op.properties).filter(k=>k!=='op'),required:op.required.filter(k=>k!=='op')} ]));
const output={
 'operations.ts':`/* Generated from schema/protocol.json. */\nexport const operationSpecs = ${JSON.stringify(operationSpecs,null,2)} as const;\nexport const recoveryOpcodes = ${JSON.stringify(schema.definitions.RecipeOpcode.enum)} as const;\n`,
 'wire.ts':await compile(schema,'Wire',{bannerComment:'/* Generated from schema/protocol.json. Do not edit. */',additionalProperties:false,unreachableDefinitions:true,style:{singleQuote:true},maxItems:0}),
 'validators.js':standalone.default(ajv,exports)+'\n',
 'validators.d.ts':`import type { Program, Snapshot, Profile, Instruction, Value, JsonValue, OperationOutcome, SavedInvocation, OperationResume, OperationWait, RestoreRecipe, SlotMetadata, StoreImport, ProgressBatchWire, SourceMap, PortObligation, BehaviorMapping, PortableBackup, StoreBackupRestore, BackupRestoreReceipt, ResourceBudget, ResourceFact, ReleaseManifest } from './wire.js';\n${Object.keys(exports).map(name=>`export declare const ${name}: { (data: unknown): data is ${name.slice(8)}; errors?: readonly {readonly instancePath: string; readonly message?: string}[] | null };`).join('\n')}\n`
};
let drift=false;
for(const [name,body] of Object.entries(output)) {
 const p=`packages/galbox-sdk/src/protocol/generated/${name}`;
 if(process.argv.includes('--check')) {
  if(await readFile(p,'utf8').catch(()=>null)!==body){console.error(`Generated drift: ${p}`);drift=true;}
 } else await writeFile(p,body);
}
if(drift)process.exitCode=1;

const cliSchema=JSON.parse(await readFile('packages/cli/schema/project.json','utf8'));
const cliAjv=new Ajv({allErrors:true,strict:true,code:{source:true,esm:true}});const cliValidate=cliAjv.compile(cliSchema);
const cliOutput={
 'config.ts':await compile(cliSchema,'ProjectConfig',{bannerComment:'/* Generated from schema/project.json. */',additionalProperties:false,maxItems:0}),
 'validator.js':standalone.default(cliAjv,cliValidate)+'\n',
 'validator.d.ts':`import type {ProjectConfig} from './config.js';\nexport default function validate(input:unknown):input is ProjectConfig;\n`
};
for(const [name,body]of Object.entries(cliOutput)){const p=`packages/cli/src/generated/${name}`;if(process.argv.includes('--check')){if(await readFile(p,'utf8').catch(()=>null)!==body){console.error(`Generated drift: ${p}`);drift=true;}}else await writeFile(p,body);}
if(drift)process.exitCode=1;
