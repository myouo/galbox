import {ensure,parseStorageLayout,parseStoredSlotSummary,parseSlotMetadata} from '../protocol/index.js';
import type {StorageLayout,StoredSlotSummary} from '../protocol/index.js';
import type {DatabaseState} from './durable.js';
import type {SlotRecord} from './ports.js';
export const namespaceCharacterLimit=4_000_000;
export const coldStorageByteLimit=64*1024*1024;
export function assertStoredRootCapacity(root:object,layout:StorageLayout):void {ensure(JSON.stringify(root).length<=namespaceCharacterLimit,'STORAGE_SIZE','Hot record exceeds 4M JSON characters');ensure(layout.records.reduce((sum,row)=>sum+(row.storedBytes??row.characters),0)<=coldStorageByteLimit,'STORAGE_SIZE','Cold records exceed 64MiB stored budget');}
/** Disk inventory is separate from the bounded hot root and decoded working cut. */
export function assertStorageCapacity(hot:DatabaseState,layout:StorageLayout):void {
 if(layout.version===2){ensure(logicalStorageCharacters(hot,layout)<=namespaceCharacterLimit,'STORAGE_SIZE','Legacy namespace exceeds 4M JSON characters');return;}
 assertStoredRootCapacity({...hot,slots:{},histories:{},storageLayout:layout},layout);
}
export function storageKey(id:string):void {ensure(typeof id==='string'&&id.length>0&&id.length<=256&&!['__proto__','constructor','prototype'].includes(id)&&!id.includes('\0'),'STORAGE_KEY','Invalid storage identity');}
export function storageLayout(input:unknown):StorageLayout {const layout=parseStorageLayout(input),seen=new Set<string>();ensure(layout.version===3?layout.revision!==undefined:layout.revision===undefined,'STORAGE_CORRUPT','Layout revision differs from version');for(const row of layout.records){storageKey(row.id);const key=JSON.stringify([row.kind,row.id]);ensure(!seen.has(key),'STORAGE_CORRUPT','Duplicate cold record');ensure(layout.version===3?row.storedBytes!==undefined:row.storedBytes===undefined,'STORAGE_CORRUPT','Cold encoding differs from layout');seen.add(key);}return layout;}
export function slotSummary(slot:string,record:SlotRecord):StoredSlotSummary {return parseStoredSlotSummary({slot,revision:record.revision,hasPrevious:record.previous!==null,metadata:parseSlotMetadata(record.metadata??{profileId:'main',label:slot})});}
/** v2 charges logical cold JSON; v3 charges bounded gzip bytes. Secondary indexes remain excluded. */
export function logicalStorageCharacters(hot:DatabaseState,layout:StorageLayout):number {
 let n=JSON.stringify({...hot,slots:{},histories:{}}).length;for(const kind of ['slot','history'] as const){const rows=layout.records.filter(r=>r.kind===kind);n+=rows.reduce((sum,r)=>sum+JSON.stringify(r.id).length+1+(layout.version===3?r.storedBytes!:r.characters),0)+Math.max(0,rows.length-1);}return n;
}
