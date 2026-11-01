import {encodeColdRecord,decodeColdRecord} from './cold-record.js';
import {storageLayout,storageKey,slotSummary,logicalStorageCharacters,namespaceCharacterLimit} from '../runtime/storage-layout.js';
import type {StorageLayout,StoredSlotSummary} from '../protocol/index.js';
import { ensure,parseSnapshot,parseProgressBatch,parseStoreImport,parseJsonValue,parseRestoreRecipe,parseHistoryRecord,parseStoredSlotSummary, parseStoreBackupRestore,parseSlotMetadata, parsePlayerPreferences,parseSaveCommit,parseHistoryCommit } from '../protocol/index.js';
import type { Snapshot, SlotMetadata, StoreImport, StoreBackupRestore, PlayerPreferences,SaveCommit,HistoryCommit } from '../protocol/index.js';
import type { Store, ProgressBatch, Durable, SlotRecord, ActivationOptions } from '../runtime/ports.js';
import { parseDatabase, commitProgress, saveSlot, commitActivation, confirmActivation, commitImport, selectProfile, claimActivation, commitPreferences,commitSave,saveReceipt,renameSlot,protectSlot,deleteSlot,readHistory,commitHistory,historyReceipt,slotRecord,object } from '../runtime/durable.js';
import {captureBackup,commitBackupRestore,storageNamespace} from '../runtime/backup.js';
import type { DatabaseState } from '../runtime/durable.js';
export async function openStore(namespace:string,database='galbox-sdk'):Promise<Store> {
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{
    let abandoned=false;const r=indexedDB.open(database,2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('namespaces'))r.result.createObjectStore('namespaces');};r.onsuccess=()=>{if(abandoned)r.result.close();else resolve(r.result);};r.onerror=()=>{abandoned=true;reject(r.error);};r.onblocked=()=>{abandoned=true;reject(new Error('IDB_BLOCKED'));};
  });
  let closed=false;db.onversionchange=()=>{closed=true;db.close();};
  type Scope={slots?:'all'|readonly string[];histories?:'all'|readonly string[];summaries?:boolean};
  type Row=StorageLayout['records'][number];
  type ReadCut={raw:unknown;layout:StorageLayout;legacy:boolean;values:{row:Row;summary:boolean;value:unknown}[]};
  const emptyLayout=():StorageLayout=>({format:'galbox-records',version:3,revision:0,records:[]});
  const wanted=(scope:Scope,kind:'slot'|'history',id:string)=>{const ids=kind==='slot'?scope.slots:scope.histories;return ids==='all'||!!ids?.includes(id);};
  function header(raw:unknown):{layout:StorageLayout;legacy:boolean}{if(raw!==undefined){object(raw);if(Object.hasOwn(raw,'storageLayout')){const layout=storageLayout(raw.storageLayout);object(raw.slots);object(raw.histories);ensure(Object.keys(raw.slots).length===0&&Object.keys(raw.histories).length===0,'STORAGE_CORRUPT','Mixed storage layouts');return {layout,legacy:false};}ensure(JSON.stringify(raw).length<=namespaceCharacterLimit,'STORAGE_SIZE','Legacy namespace exceeds 4M JSON characters');}return {layout:emptyLayout(),legacy:true};}
  function bounded(state:DatabaseState,layout:StorageLayout){ensure(logicalStorageCharacters(state,layout)<=namespaceCharacterLimit,'STORAGE_SIZE','Namespace exceeds 4M stored characters/bytes');}
  function readCut(scope:Scope,mode:IDBTransactionMode):Promise<ReadCut>{return new Promise((resolve,reject)=>{
    const tx=db.transaction('namespaces','readonly'),store=tx.objectStore('namespaces');let cut:ReadCut,failure:unknown;
    const fail=(error:unknown)=>{failure=error;tx.abort();},q=store.get(namespace);q.onsuccess=()=>{try{const {layout,legacy}=header(q.result);cut={raw:q.result,layout,legacy,values:[]};const migrate=mode==='readwrite'&&layout.version===2;ensure(layout.records.filter(row=>migrate||wanted(scope,row.kind,row.id)).reduce((n,row)=>n+row.characters,0)<=namespaceCharacterLimit,'STORAGE_READ_SIZE','Requested decoded records exceed 4M working budget');let summaryCharacters=0;for(const row of layout.records){const full=migrate||wanted(scope,row.kind,row.id),summary=!full&&scope.summaries&&row.kind==='slot';if(!full&&!summary)continue;const r=store.get([namespace,summary?'slot-summary':row.kind,row.id]);r.onsuccess=()=>{try{ensure(r.result!==undefined,'STORAGE_RECORD_MISSING',row.id);if(summary){summaryCharacters+=JSON.stringify(r.result).length;ensure(summaryCharacters<=namespaceCharacterLimit,'STORAGE_READ_SIZE','Summaries exceed 4M working budget');}cut.values.push({row,summary:!!summary,value:r.result});}catch(error){fail(error);}};}}catch(error){fail(error);}};
    tx.oncomplete=()=>resolve(cut);tx.onabort=()=>reject(failure??tx.error??new Error('IDB_ABORT'));tx.onerror=()=>{};
  });}
  // A v3 hot-only mutation retains its original one-read/one-write transaction.
  function hot<T>(mode:IDBTransactionMode,run:(state:DatabaseState,summaries:StoredSlotSummary[])=>T):Promise<{handled:true;result:T}|{handled:false}>{return new Promise((resolve,reject)=>{
    const tx=db.transaction('namespaces',mode),store=tx.objectStore('namespaces');let result:{handled:true;result:T}|{handled:false}={handled:false},failure:unknown;const q=store.get(namespace);q.onsuccess=()=>{try{const h=header(q.result);if(mode==='readwrite'&&q.result!==undefined&&(h.legacy||h.layout.version===2))return;const state=parseDatabase(q.result);bounded(state,h.layout);const value=run(state,[]);if(mode==='readwrite'){const next=storageLayout({...h.layout,revision:(h.layout.revision??0)+1});bounded(state,next);store.put({...state,slots:{},histories:{},storageLayout:next},namespace);}result={handled:true,result:value};}catch(error){failure=error;tx.abort();}};tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(failure??tx.error??new Error('IDB_ABORT'));tx.onerror=()=>{};
  });}
  async function transact<T>(mode:IDBTransactionMode,run:(state:DatabaseState,summaries:StoredSlotSummary[])=>T,scope:Scope={}):Promise<T>{
    ensure(!closed,'STORAGE_CLOSED','Database closed');for(const ids of [scope.slots,scope.histories])if(ids&&ids!=='all')for(const id of ids)storageKey(id);
    if(!scope.slots&&!scope.histories&&!scope.summaries){const quick=await hot(mode,run);if(quick.handled)return quick.result;}
    for(let attempt=0;attempt<8;attempt++){
      ensure(!closed,'STORAGE_CLOSED','Database closed');const cut=await readCut(scope,mode),state=parseDatabase(cut.raw),summaries:StoredSlotSummary[]=[];bounded(state,cut.layout);const migrate=mode==='readwrite'&&(cut.legacy||cut.layout.version===2),loaded=(kind:'slot'|'history',id:string)=>migrate||wanted(scope,kind,id);
      // Bounded parallel decompression happens after the readonly transaction completes.
      let cursor=0;await Promise.all(Array.from({length:Math.min(4,cut.values.length)},async()=>{for(;;){const value=cut.values[cursor++];if(!value)return;const {row}=value;if(value.summary){const summary=parseStoredSlotSummary(value.value);ensure(summary.slot===row.id,'STORAGE_CORRUPT','Summary identity');summaries.push(summary);}else{const raw=await decodeColdRecord(value.value,row,cut.layout.version);if(row.kind==='slot')state.slots[row.id]=slotRecord(raw);else state.histories[row.id]=parseHistoryRecord(raw);}}}));
      if((cut.legacy||migrate)&&scope.summaries)for(const [id,r]of Object.entries(state.slots))summaries.push(slotSummary(id,r));
      const result=run(state,summaries);if(mode==='readonly')return result;
      const records=migrate?[]:cut.layout.records.filter(r=>!loaded(r.kind,r.id)),writes:{key:IDBValidKey;value:unknown}[]=[],deletes:IDBValidKey[]=[];
      for(const kind of ['slot','history'] as const){const map=kind==='slot'?state.slots:state.histories;for(const [id,value]of Object.entries(map)){storageKey(id);ensure(loaded(kind,id),'STORAGE_FOOTPRINT','Unexpected cold record mutation');const encoded=await encodeColdRecord(value);records.push({kind,id,characters:encoded.characters,storedBytes:encoded.storedBytes});writes.push({key:[namespace,kind,id],value:encoded.value});if(kind==='slot'){const record=state.slots[id];ensure(record,'STORAGE_CORRUPT',id);writes.push({key:[namespace,'slot-summary',id],value:slotSummary(id,record)});}}if(!cut.legacy)for(const previous of cut.layout.records)if(previous.kind===kind&&loaded(kind,previous.id)&&!Object.hasOwn(map,previous.id)){deletes.push([namespace,kind,previous.id]);if(kind==='slot')deletes.push([namespace,'slot-summary',previous.id]);}}
      const next=storageLayout({format:'galbox-records',version:3,revision:(cut.layout.revision??0)+1,records});bounded(state,next);const nextRoot={...state,slots:{},histories:{},storageLayout:next},stamp=JSON.stringify(cut.raw);
      const committed=await new Promise<boolean>((resolve,reject)=>{const tx=db.transaction('namespaces','readwrite'),store=tx.objectStore('namespaces');let success=false,failure:unknown;const fail=(error:unknown)=>{failure=error;tx.abort();},q=store.get(namespace);q.onsuccess=()=>{try{if(JSON.stringify(q.result)!==stamp)return;const apply=()=>{for(const change of writes)store.put(change.value,change.key);for(const key of deletes)store.delete(key);store.put(nextRoot,namespace);success=true;};if(cut.legacy){const keys=store.getAllKeys(IDBKeyRange.bound([namespace],[namespace,[]]));keys.onsuccess=()=>{try{ensure(!keys.result.some(key=>Array.isArray(key)&&key.length===3&&['slot','history','slot-summary'].includes(String(key[1]))),'STORAGE_MIXED_LAYOUT','Legacy header overlaps segmented records');apply();}catch(error){fail(error);}};}else if(cut.layout.version===2){const values=cut.values.filter(v=>!v.summary);let remaining=values.length,changed=false;if(!remaining)apply();for(const value of values){const old=store.get([namespace,value.row.kind,value.row.id]);old.onsuccess=()=>{try{if(JSON.stringify(old.result)!==JSON.stringify(value.value))changed=true;if(--remaining===0&&!changed)apply();}catch(error){fail(error);}};}}else apply();}catch(error){fail(error);}};tx.oncomplete=()=>resolve(success);tx.onabort=()=>reject(failure??tx.error??new Error('IDB_ABORT'));tx.onerror=()=>{};});
      if(committed)return result;
    }
    throw new Error('STORAGE_CONFLICT: Storage changed during eight preparation attempts');
  }
  return {
    readHistory:(id:string)=>transact('readonly',s=>readHistory(s,id),{histories:[id]}),
    historyReceipt:(id:string)=>transact('readonly',s=>historyReceipt(s,id)),
    commitHistory:(input:HistoryCommit,authority:string|null)=>{const data=parseHistoryCommit(input);return transact('readwrite',s=>commitHistory(s,data,authority),{histories:[data.profileId]});},
    commitSave:(input:SaveCommit)=>{const data=parseSaveCommit(input);return transact('readwrite',s=>commitSave(s,data),{slots:[data.slot]});},
    saveReceipt:(id:string)=>transact('readonly',s=>saveReceipt(s,id)),
    renameSlot:(slot:string,revision:number,label:string)=>transact('readwrite',s=>renameSlot(s,slot,revision,label),{slots:[slot]}),
    protectSlot:(slot:string,revision:number,protectedState:boolean)=>transact('readwrite',s=>protectSlot(s,slot,revision,protectedState),{slots:[slot]}),
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
