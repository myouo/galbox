import {ensure,parsePortableBackup,GalboxError} from '../protocol/index.js';
import type {PortableBackup,DeepReadonly,Program} from '../protocol/index.js';
import {linkProgram} from '../program-tools/linker.js';
import {validateRestore} from '../core/index.js';
import {emptyOperations} from '../core/operations.js';
import type {OperationRegistry} from '../core/operations.js';
import {prepareRestoreRecipe} from '../runtime/recipe.js';
import {backupClosure,storageNamespace} from '../runtime/backup.js';
export {storageNamespace};
export type {PortableBackup,BackupRestoreReceipt} from '../protocol/index.js';

const migrationToken:unique symbol=Symbol('content-migration');
export interface ContentMigration {readonly [migrationToken]:true;readonly id:string;readonly fromReleases:readonly string[];readonly toRelease:string;}
export interface ContentMigrationDefinition {id:string;gameId:string;series:string;fromReleases:readonly string[];toRelease:string;migrate:(input:DeepReadonly<PortableBackup>)=>unknown;}
const migrations=new WeakMap<ContentMigration,ContentMigrationDefinition>();
function freeze(value:unknown):void {if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}}
function releases(backup:PortableBackup):string[] {return [...new Set([backup.release,...backup.slots.flatMap(s=>[s.snapshot.release,...(s.previous?[s.previous.release]:[])])])].sort();}
function canonical(value:unknown):string {return JSON.stringify(value,(_key:string,v:unknown)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,Reflect.get(v,k)])):v);}
export function defineContentMigration(definition:ContentMigrationDefinition):ContentMigration {
  ensure(typeof definition.id==='string'&&typeof definition.toRelease==='string'&&Array.isArray(definition.fromReleases)&&definition.fromReleases.every(r=>typeof r==='string'),'CONTENT_MIGRATION','Expected string identities and an explicit source release array');
  const fromReleases=[...definition.fromReleases].sort();storageNamespace(definition.gameId,definition.series);
  ensure(/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/.test(definition.id)&&fromReleases.length>0&&fromReleases.length<=256&&new Set(fromReleases).size===fromReleases.length&&[...fromReleases,definition.toRelease].every(r=>/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/.test(r))&&typeof definition.migrate==='function','CONTENT_MIGRATION','Expected a named, bounded, explicit source/target migration');
  const handle=Object.freeze({[migrationToken]:true as const,id:definition.id,fromReleases:Object.freeze(fromReleases),toRelease:definition.toRelease});migrations.set(handle,{...definition,fromReleases:[...fromReleases]});return handle;
}
const prepared:unique symbol=Symbol('prepared-backup');
export interface BackupRestoreReport {readonly profiles:number;readonly slots:number;readonly sourceReleases:readonly string[];readonly targetRelease:string;readonly migrationId:string|null;}
export interface PreparedBackupRestore {readonly [prepared]:true;report():BackupRestoreReport;}
interface Plan {backup:PortableBackup;signature:string;namespace:string;operations:OperationRegistry;}
const plans=new WeakMap<PreparedBackupRestore,Plan>();
export interface BackupRestoreOptions {program:unknown;series:string;operations?:OperationRegistry;migration?:ContentMigration;}
function preserveClosure(before:PortableBackup,after:PortableBackup):void {
  ensure(storageNamespace(before.gameId,before.series)===storageNamespace(after.gameId,after.series),'CONTENT_MIGRATION_IDENTITY','Migration cannot change game/series');
  ensure(before.profiles.length===after.profiles.length&&before.profiles.every(p=>after.profiles.some(q=>q.id===p.id&&q.profile.revision===p.profile.revision)),'CONTENT_MIGRATION_CLOSURE','Preserve profile identities and revisions');
  ensure(before.slots.length===after.slots.length&&before.slots.every(s=>after.slots.some(t=>t.slot===s.slot&&t.revision===s.revision&&t.metadata.profileId===s.metadata.profileId&&(t.previous===null)===(s.previous===null)&&t.previousMetadata?.profileId===s.previousMetadata?.profileId)),'CONTENT_MIGRATION_CLOSURE','Preserve every slot, previous revision and profile relationship');
}
function validateCandidates(backup:PortableBackup,program:Program,operations:OperationRegistry):void {
  for(const slot of backup.slots){
    for(const cut of [{snapshot:slot.snapshot,metadata:slot.metadata},...(slot.previous&&slot.previousMetadata?[{snapshot:slot.previous,metadata:slot.previousMetadata}]:[])]){
      const snapshot=validateRestore(program,cut.snapshot,operations),profile=backup.profiles.find(p=>p.id===cut.metadata.profileId)?.profile;ensure(profile,'BACKUP_PROFILE_MISSING',cut.metadata.profileId);
      // Keep a before-recipe baseline; these isolated previews never persist hook effects.
      if(cut.metadata.recipe)prepareRestoreRecipe(program,profile,snapshot,cut.metadata.recipe,{operations});
      if(cut.metadata.onLoad)prepareRestoreRecipe(program,profile,snapshot,cut.metadata.onLoad,{operations});
      Object.assign(cut.snapshot,snapshot);
    }
  }
}
export function prepareBackupRestore(input:unknown,options:BackupRestoreOptions):PreparedBackupRestore {
  const operations=options.operations??emptyOperations,program=linkProgram(options.program,operations).copy(),namespace=storageNamespace(program.gameId,options.series);let backup=backupClosure(input);
  ensure(storageNamespace(backup.gameId,backup.series)===namespace,'BACKUP_NAMESPACE','Backup belongs to another game or compatibility series');
  const sourceReleases=releases(backup);let migrationId:string|null=null;
  if(options.migration){const migration=migrations.get(options.migration);ensure(migration,'CONTENT_MIGRATION','Use defineContentMigration');ensure(storageNamespace(migration.gameId,migration.series)===namespace&&migration.toRelease===program.release&&canonical(migration.fromReleases)===canonical(sourceReleases),'CONTENT_MIGRATION_SOURCE','Migration does not match this complete release set');
    const before=backupClosure(backup);freeze(backup);let output:unknown;try{output=migration.migrate(backup);}catch(error){throw new GalboxError('CONTENT_MIGRATION_FAILED',`${migration.id}: ${String(error)}`);}backup=backupClosure(output);preserveClosure(before,backup);migrationId=migration.id;
  }
  ensure(releases(backup).every(r=>r===program.release),'BACKUP_RELEASE_UNAVAILABLE','An explicit complete migration or the matching old release is required; original data is preserved');
  validateCandidates(backup,program,operations);backup=backupClosure(backup);
  const report={profiles:backup.profiles.length,slots:backup.slots.length,sourceReleases,targetRelease:program.release,migrationId};
  const plan:PreparedBackupRestore=Object.freeze({[prepared]:true as const,report:()=>({...report,sourceReleases:[...report.sourceReleases]})});plans.set(plan,{backup,namespace,signature:canonical(program),operations});return plan;
}
export function materializeBackupRestore(plan:PreparedBackupRestore,options:BackupRestoreOptions):PortableBackup {
  const stored=plans.get(plan);ensure(stored,'BACKUP_PLAN','Expected a prepared backup handle');const operations=options.operations??emptyOperations,program=linkProgram(options.program,operations).copy();
  ensure(stored.namespace===storageNamespace(program.gameId,options.series)&&stored.signature===canonical(program)&&stored.operations===operations,'BACKUP_PLAN_STALE','Program, series or operation registry changed');return parsePortableBackup(stored.backup);
}
