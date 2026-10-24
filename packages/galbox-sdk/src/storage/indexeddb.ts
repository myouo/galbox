import { ensure } from '../protocol/index.js';
import type { Snapshot } from '../protocol/index.js';
import type { Store, ProgressBatch, Durable, SlotRecord } from '../runtime/ports.js';
import { parseDatabase, commitProgress, saveSlot, commitActivation, confirmActivation } from '../runtime/durable.js';
import type { DatabaseState } from '../runtime/durable.js';
export async function openStore(namespace:string,database='galbox-sdk'):Promise<Store> {
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{
    const r=indexedDB.open(database,1);r.onupgradeneeded=()=>{r.result.createObjectStore('namespaces');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('IDB_BLOCKED'));
  });
  let closed=false;db.onversionchange=()=>{closed=true;db.close();};
  function transact<T>(mode:IDBTransactionMode,run:(state:DatabaseState)=>T):Promise<T> {
    ensure(!closed,'STORAGE_CLOSED','Database closed');
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('namespaces',mode),store=tx.objectStore('namespaces');let result:T;let failure:unknown;
      const request=store.get(namespace);request.onsuccess=()=>{
        try {const state=parseDatabase(request.result);result=run(state);if(mode==='readwrite')store.put(state,namespace);}
        catch(error){failure=error;tx.abort();}
      };
      tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(failure??tx.error??new Error('IDB_ABORT'));tx.onerror=()=>reject(failure??tx.error);
    });
  }
  return {
    read:()=>transact<Durable>('readonly',s=>({profile:s.profile,head:s.head})),
    readSlot:(slot:string)=>transact<SlotRecord|null>('readonly',s=>s.slots[slot]??null),
    save:(slot:string,snapshot:Snapshot,revision:number)=>transact('readwrite',s=>saveSlot(s,slot,snapshot,revision)),
    progress:(batch:ProgressBatch,authority:string|null)=>transact('readwrite',s=>commitProgress(s,batch,authority)),
    activate:(id:string,snapshot:Snapshot,head:string|null,revision:number,initialProgress?:ProgressBatch)=>transact('readwrite',s=>commitActivation(s,id,snapshot,head,revision,initialProgress)),
    confirm:(id:string)=>transact('readwrite',s=>confirmActivation(s,id)),
    close:()=>{if(!closed){closed=true;db.close();}}
  };
}
