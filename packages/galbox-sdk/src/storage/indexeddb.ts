import {storageLayout,storageKey,slotSummary,logicalStorageCharacters,namespaceCharacterLimit} from '../runtime/storage-layout.js';
import type {StorageLayout,StoredSlotSummary} from '../protocol/index.js';
import { ensure,parseSnapshot,parseProgressBatch,parseStoreImport,parseJsonValue,parseRestoreRecipe,parseHistoryRecord,parseStoredSlotSummary, parseStoreBackupRestore,parseSlotMetadata, parsePlayerPreferences,parseSaveCommit,parseHistoryCommit } from '../protocol/index.js';
import type { Snapshot, SlotMetadata, StoreImport, StoreBackupRestore, PlayerPreferences,SaveCommit,HistoryCommit } from '../protocol/index.js';
import type { Store, ProgressBatch, Durable, SlotRecord, ActivationOptions } from '../runtime/ports.js';
import { parseDatabase, commitProgress, saveSlot, commitActivation, confirmActivation, commitImport, selectProfile, claimActivation, commitPreferences,commitSave,saveReceipt,renameSlot,deleteSlot,readHistory,commitHistory,historyReceipt,slotRecord,object } from '../runtime/durable.js';
import {captureBackup,commitBackupRestore,storageNamespace} from '../runtime/backup.js';
import type { DatabaseState } from '../runtime/durable.js';
export async function openStore(namespace:string,database='galbox-sdk'):Promise<Store> {
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{
    let abandoned=false;const r=indexedDB.open(database,2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('namespaces'))r.result.createObjectStore('namespaces');};r.onsuccess=()=>{if(abandoned)r.result.close();else resolve(r.result);};r.onerror=()=>{abandoned=true;reject(r.error);};r.onblocked=()=>{abandoned=true;reject(new Error('IDB_BLOCKED'));};
  });
  let closed=false;db.onversionchange=()=>{closed=true;db.close();};
  type Scope={slots?:'all'|readonly string[];histories?:'all'|readonly string[];summaries?:boolean};
  function transact<T>(mode:IDBTransactionMode,run:(state:DatabaseState,summaries:StoredSlotSummary[])=>T,scope:Scope={}):Promise<T> {
    ensure(!closed,'STORAGE_CLOSED','Database closed');for(const ids of [scope.slots,scope.histories])if(ids&&ids!=='all')for(const id of ids)storageKey(id);
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('namespaces',mode),store=tx.objectStore('namespaces');let result:T;let failure:unknown;
      const fail=(error:unknown)=>{failure=error;tx.abort();};
      const request=store.get(namespace);request.onsuccess=()=>{
        try {
          const raw:unknown=request.result;let layout:StorageLayout={format:'galbox-records',version:2,records:[]},state:DatabaseState,legacy=true;
          if(raw!==undefined){object(raw);if(Object.hasOwn(raw,'storageLayout')){layout=storageLayout(raw.storageLayout);object(raw.slots);object(raw.histories);ensure(Object.keys(raw.slots).length===0&&Object.keys(raw.histories).length===0,'STORAGE_CORRUPT','Mixed storage layouts');legacy=false;}}
          state=parseDatabase(raw);const summaries:StoredSlotSummary[]=[];
          const wanted=(kind:'slot'|'history',id:string)=>{const ids=kind==='slot'?scope.slots:scope.histories;return ids==='all'||!!ids?.includes(id);};
          const complete=()=>{
            try {
              if(legacy&&scope.summaries)for(const [id,r]of Object.entries(state.slots))summaries.push(slotSummary(id,r));
              result=run(state,summaries);
              if(mode==='readwrite'){
                const records=legacy?[]:layout.records.filter(r=>!wanted(r.kind,r.id));
                const writes:{key:IDBValidKey;value:unknown}[]=[];const deletes:IDBValidKey[]=[];
                for(const kind of ['slot','history'] as const){const map=kind==='slot'?state.slots:state.histories;
                  for(const [id,value]of Object.entries(map)){storageKey(id);ensure(legacy||wanted(kind,id),'STORAGE_FOOTPRINT','Unexpected cold record mutation');const characters=JSON.stringify(value).length;records.push({kind,id,characters});writes.push({key:[namespace,kind,id],value});if(kind==='slot'){const record=state.slots[id];ensure(record,'STORAGE_CORRUPT',id);writes.push({key:[namespace,'slot-summary',id],value:slotSummary(id,record)});}}
                  if(!legacy)for(const previous of layout.records)if(previous.kind===kind&&wanted(kind,previous.id)&&!Object.hasOwn(map,previous.id)){deletes.push([namespace,kind,previous.id]);if(kind==='slot')deletes.push([namespace,'slot-summary',previous.id]);}
                }
                const next=storageLayout({format:'galbox-records',version:2,records});ensure(logicalStorageCharacters(state,next)<=namespaceCharacterLimit,'STORAGE_SIZE','Namespace exceeds 4M JSON characters');
                const hot={...state,slots:{},histories:{},storageLayout:next};for(const change of writes)store.put(change.value,change.key);for(const key of deletes)store.delete(key);store.put(hot,namespace);
              }
            }catch(error){fail(error);}
          };
          if(legacy){if(mode==='readonly'||raw===undefined){complete();return;}const keys=store.getAllKeys(IDBKeyRange.bound([namespace],[namespace,[]]));keys.onsuccess=()=>{try{ensure(!keys.result.some(key=>Array.isArray(key)&&key.length===3&&['slot','history','slot-summary'].includes(String(key[1]))),'STORAGE_MIXED_LAYOUT','Legacy header overlaps segmented records');complete();}catch(error){fail(error);}};return;}
          const reads=layout.records.flatMap(row=>wanted(row.kind,row.id)?[{row,summary:false}]:scope.summaries&&row.kind==='slot'?[{row,summary:true}]:[]);if(!reads.length){complete();return;}let remaining=reads.length;
          for(const {row,summary}of reads){const r=store.get([namespace,summary?'slot-summary':row.kind,row.id]);r.onsuccess=()=>{try{ensure(r.result!==undefined,'STORAGE_RECORD_MISSING',row.id);if(summary){const data=parseStoredSlotSummary(r.result);ensure(data.slot===row.id,'STORAGE_CORRUPT','Summary identity');summaries.push(data);}else{ensure(JSON.stringify(r.result).length===row.characters,'STORAGE_RECORD_SIZE',row.id);if(row.kind==='slot')state.slots[row.id]=slotRecord(r.result);else state.histories[row.id]=parseHistoryRecord(r.result);}if(--remaining===0)complete();}catch(error){fail(error);}};}
        }catch(error){fail(error);}
      };
      tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(failure??tx.error??new Error('IDB_ABORT'));tx.onerror=()=>{};
    });
  }
  return {
    readHistory:(id:string)=>transact('readonly',s=>readHistory(s,id),{histories:[id]}),
    historyReceipt:(id:string)=>transact('readonly',s=>historyReceipt(s,id)),
    commitHistory:(input:HistoryCommit,authority:string|null)=>{const data=parseHistoryCommit(input);return transact('readwrite',s=>commitHistory(s,data,authority),{histories:[data.profileId]});},
    commitSave:(input:SaveCommit)=>{const data=parseSaveCommit(input);return transact('readwrite',s=>commitSave(s,data),{slots:[data.slot]});},
    saveReceipt:(id:string)=>transact('readonly',s=>saveReceipt(s,id)),
    renameSlot:(slot:string,revision:number,label:string)=>transact('readwrite',s=>renameSlot(s,slot,revision,label),{slots:[slot]}),
    deleteSlot:(slot:string,revision:number)=>transact('readwrite',s=>deleteSlot(s,slot,revision),{slots:[slot]}),
    readPreferences:()=>transact('readonly',s=>s.preferences),
    writePreferences:(input:PlayerPreferences,revision:number)=>{const value=parsePlayerPreferences(input);return transact('readwrite',s=>commitPreferences(s,value,revision));},
    backup:(gameId:string,series:string,release:string)=>{ensure(namespace===storageNamespace(gameId,series),'BACKUP_NAMESPACE','Backup identity must match storage');return transact('readonly',s=>captureBackup(s,gameId,series,release),{slots:'all',histories:'all'});},
    restoreBackup:(input:StoreBackupRestore)=>{const commit=parseStoreBackupRestore(input);ensure(namespace===storageNamespace(commit.backup.gameId,commit.backup.series),'BACKUP_NAMESPACE','Restore identity must match storage');return transact('readwrite',s=>commitBackupRestore(s,commit),{slots:commit.backup.slots.map((_s,i)=>`backup:${commit.id}:s${i}`),histories:commit.backup.profiles.map((_p,i)=>`backup:${commit.id}:p${i}`)});},
    read:(profileId?:string)=>transact<Durable>('readonly',s=>({profile:selectProfile(s,profileId),head:s.head})),
    readSlot:(slot:string)=>transact<SlotRecord|null>('readonly',s=>Object.hasOwn(s.slots,slot)?s.slots[slot]??null:null,{slots:[slot]}),
    listProfiles:()=>transact('readonly',s=>[{profileId:'main',revision:s.profile.revision},...Object.entries(s.branches).map(([profileId,p])=>({profileId,revision:p.revision}))]),
    listSlots:()=>transact('readonly',(_s,rows)=>Object.values(Object.fromEntries(rows.map(r=>[r.slot,r]))),{summaries:true}),
    import:async(input:StoreImport)=>{const commit=parseStoreImport(input);return transact('readwrite',s=>commitImport(s,commit),{slots:[commit.slot]});},
    save:async(slot:string,snapshot:Snapshot,revision:number,metadata?:SlotMetadata)=>{const data=parseSnapshot(snapshot),meta=metadata===undefined?undefined:parseSlotMetadata(metadata);return transact('readwrite',s=>saveSlot(s,slot,data,revision,meta),{slots:[slot]});},
    progress:async(input:ProgressBatch,authority:string|null)=>{const batch=parseProgressBatch(input);return transact('readwrite',s=>commitProgress(s,batch,authority));},
    activate:async(id:string,snapshot:Snapshot,head:string|null,revision:number,initialProgress?:ProgressBatch,options:ActivationOptions={})=>{const data=parseSnapshot(snapshot),batch=initialProgress===undefined?undefined:parseProgressBatch(initialProgress),metadata:ActivationOptions={...options,...(options.onLoad?{onLoad:parseRestoreRecipe(options.onLoad)}:{}),...(options.provenance===undefined?{}:{provenance:parseJsonValue(options.provenance)})};return transact('readwrite',s=>commitActivation(s,id,data,head,revision,batch,metadata));},
    claim:(id:string,owner:string)=>transact('readwrite',s=>claimActivation(s,id,owner)),
    confirm:(id:string,owner?:string)=>transact('readwrite',s=>confirmActivation(s,id,owner)),
    close:()=>{if(!closed){closed=true;db.close();}}
  };
}
