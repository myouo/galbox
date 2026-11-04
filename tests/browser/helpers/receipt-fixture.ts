import type {DatabaseState} from '../../../packages/galbox-sdk/src/runtime/durable.js';
import {partitionReceiptTables,withoutReceiptTables} from '../../../packages/galbox-sdk/src/runtime/receipt-ledger.js';
import {storageLayout,assertStorageCapacity} from '../../../packages/galbox-sdk/src/runtime/storage-layout.js';
import {encodeColdRecord} from '../../../packages/galbox-sdk/src/storage/cold-record.js';
/** Only creates synthetic fixture namespaces. Actual mutations/retries use the public Store. */
export async function writeReceiptFixture(state:DatabaseState,database:string,namespace:string){
 const pages=[...partitionReceiptTables(state)],rows:ReturnType<typeof storageLayout>['records']=[],writes:{key:IDBValidKey;value:unknown}[]=[];let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{for(;;){const next=pages[cursor++];if(!next)return;const [id,page]=next,encoded=await encodeColdRecord(page);rows.push({kind:'receipt',id,characters:encoded.characters,storedBytes:encoded.storedBytes});writes.push({key:[namespace,'receipt',id],value:encoded.value});}}));
 const layout=storageLayout({format:'galbox-records',version:4,revision:1,records:rows}),hot=withoutReceiptTables(state),root={...hot,slots:{},histories:{},storageLayout:layout};assertStorageCapacity(hot,layout);
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open(database,2);q.onupgradeneeded=()=>q.result.createObjectStore('namespaces');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
 try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('namespaces','readwrite'),store=tx.objectStore('namespaces'),q=store.get(namespace);q.onsuccess=()=>{if(q.result!==undefined){tx.abort();return;}for(const w of writes)store.put(w.value,w.key);store.put(root,namespace);};tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error('fixture already exists'));});}finally{db.close();}
 return {pages:pages.length,hotCharacters:JSON.stringify(root).length,coldBytes:rows.reduce((n,r)=>n+r.storedBytes!,0)};
}
