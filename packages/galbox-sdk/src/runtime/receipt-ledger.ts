import {ensure} from '../protocol/index.js';
import {serializedJSONDigest} from '../protocol/digest.js';
import {databaseState,parseDatabase,object} from './durable.js';
import type {DatabaseState} from './durable.js';
import {storageKey} from './storage-key.js';
export const receiptTables=['receipts','imports','saves','historyReceipts','backups'] as const;
export type ReceiptTable=typeof receiptTables[number];
export type ReceiptTables=Pick<DatabaseState,ReceiptTable>;
export function emptyReceiptTables():ReceiptTables{return {receipts:{},imports:{},saves:{},historyReceipts:{},backups:{}};}
export function withoutReceiptTables(state:DatabaseState):DatabaseState{return {...state,...emptyReceiptTables()};}
export function hasReceiptTables(state:DatabaseState):boolean{return receiptTables.some(k=>Object.keys(state[k]).length>0);}
export function receiptPage(table:ReceiptTable,id:string):string{storageKey(id);return 'r-'+serializedJSONDigest(JSON.stringify([table,id])).slice(0,2);}
/** Partition once when upgrading a large legacy table; no per-bucket rescan. */
export function partitionReceiptTables(state:ReceiptTables):Map<string,ReceiptTables>{
 const pages=new Map<string,ReceiptTables>();
 function put<T>(table:ReceiptTable,rows:Record<string,T>,target:(page:ReceiptTables)=>Record<string,T>){for(const [id,value]of Object.entries(rows)){const key=receiptPage(table,id);let page=pages.get(key);if(!page){page=emptyReceiptTables();pages.set(key,page);}target(page)[id]=value;}}
 put('receipts',state.receipts,p=>p.receipts);put('imports',state.imports,p=>p.imports);put('saves',state.saves,p=>p.saves);put('historyReceipts',state.historyReceipts,p=>p.historyReceipts);put('backups',state.backups,p=>p.backups);return pages;
}
/** Decode only a declared page; every identity must belong to that exact bucket. */
export function applyReceiptPage(state:DatabaseState,input:unknown,page:string):void {
 object(input);ensure(Object.keys(input).length===receiptTables.length&&receiptTables.every(k=>Object.hasOwn(input,k)),'STORAGE_RECEIPT_PAGE','Exact receipt tables required');const checked=parseDatabase({...databaseState(),receipts:input.receipts,imports:input.imports,saves:input.saves,historyReceipts:input.historyReceipts,backups:input.backups});
 function check<T extends {id:string}>(table:ReceiptTable,from:Record<string,T>,to:Record<string,T>){for(const [id,value]of Object.entries(from))ensure(value.id===id&&receiptPage(table,id)===page&&!Object.hasOwn(to,id),'STORAGE_RECEIPT_PAGE','Receipt identity differs from declared bucket');}
 check('receipts',checked.receipts,state.receipts);check('imports',checked.imports,state.imports);check('saves',checked.saves,state.saves);check('historyReceipts',checked.historyReceipts,state.historyReceipts);check('backups',checked.backups,state.backups);
 Object.assign(state.receipts,checked.receipts);Object.assign(state.imports,checked.imports);Object.assign(state.saves,checked.saves);Object.assign(state.historyReceipts,checked.historyReceipts);Object.assign(state.backups,checked.backups);
}
