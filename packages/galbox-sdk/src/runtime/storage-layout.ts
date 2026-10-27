import {ensure,parseStorageLayout,parseStoredSlotSummary,parseSlotMetadata} from '../protocol/index.js';
import type {StorageLayout,StoredSlotSummary} from '../protocol/index.js';
import type {DatabaseState} from './durable.js';
import type {SlotRecord} from './ports.js';
export const namespaceCharacterLimit=4_000_000;
export function storageKey(id:string):void {ensure(typeof id==='string'&&id.length>0&&id.length<=256&&!['__proto__','constructor','prototype'].includes(id)&&!id.includes('\0'),'STORAGE_KEY','Invalid storage identity');}
export function storageLayout(input:unknown):StorageLayout {const layout=parseStorageLayout(input),seen=new Set<string>();for(const row of layout.records){storageKey(row.id);const key=JSON.stringify([row.kind,row.id]);ensure(!seen.has(key),'STORAGE_CORRUPT','Duplicate cold record');seen.add(key);}return layout;}
export function slotSummary(slot:string,record:SlotRecord):StoredSlotSummary {return parseStoredSlotSummary({slot,revision:record.revision,hasPrevious:record.previous!==null,metadata:parseSlotMetadata(record.metadata??{profileId:'main',label:slot})});}
/** Same logical JSON budget as the monolithic format, excluding secondary indexes. */
export function logicalStorageCharacters(hot:DatabaseState,layout:StorageLayout):number {
 let n=JSON.stringify({...hot,slots:{},histories:{}}).length;for(const kind of ['slot','history'] as const){const rows=layout.records.filter(r=>r.kind===kind);n+=rows.reduce((sum,r)=>sum+JSON.stringify(r.id).length+1+r.characters,0)+Math.max(0,rows.length-1);}return n;
}
