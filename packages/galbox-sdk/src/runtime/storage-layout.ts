import {withoutReceiptTables} from './receipt-ledger.js';
import {storageKey} from './storage-key.js';
export {storageKey} from './storage-key.js';
import {ensure,parseStorageLayout,parseStoredSlotSummary,parseSlotMetadata} from '../protocol/index.js';
import type {StorageLayout,StoredSlotSummary} from '../protocol/index.js';
import {object} from './durable.js';
import type {DatabaseState} from './durable.js';
import type {SlotRecord} from './ports.js';
export const namespaceCharacterLimit=4_000_000;
export const coldStorageByteLimit=64*1024*1024;
function sameJSON(a:unknown,b:unknown):boolean {
 if(Object.is(a,b))return true;if(a===null||b===null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
 const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&sameJSON(Reflect.get(a,key),Reflect.get(b,key)));
}
/** The v5 disk tree owns one complete current activation, under head. */
export function storedHotRoot(state:DatabaseState,layout:StorageLayout):object {
 const hot=layout.version>=4?withoutReceiptTables(state):state;
 if(layout.version!==5)return {...hot,slots:{},histories:{},storageLayout:layout};
 const activations:{[id:string]:unknown}={...hot.activations};
 if(hot.head){const live=activations[hot.head.id];ensure(live&&sameJSON(live,hot.head),'STORAGE_CORRUPT','Live activation differs from head');activations[hot.head.id]={headReference:true};}
 return {...hot,activations,slots:{},histories:{},storageLayout:layout};
}
/** Expand only an exact reference at the current key; never mutate disk input. */
export function expandedHotRoot(input:unknown,layout:StorageLayout):unknown {
 if(layout.version!==5||input===undefined)return input;
 object(input);object(input.activations);const head=input.head;ensure(head===null||head&&typeof head==='object','STORAGE_CORRUPT','Activation head');if(head!==null)object(head);
 const activations:{[id:string]:unknown}={...input.activations};let found=false;
 for(const [id,value]of Object.entries(activations)){object(value);if(!Object.hasOwn(value,'headReference'))continue;ensure(head!==null&&head.id===id&&value.headReference===true&&Object.keys(value).length===1,'STORAGE_CORRUPT','Invalid live activation reference');found=true;activations[id]=head;}
 ensure(head===null?!found:found,'STORAGE_CORRUPT','Missing live activation reference');return {...input,activations};
}
export function assertStoredRootCapacity(root:object,layout:StorageLayout):void {ensure(JSON.stringify(root).length<=namespaceCharacterLimit,'STORAGE_SIZE','Hot record exceeds 4M JSON characters');ensure(layout.records.reduce((sum,row)=>sum+(row.storedBytes??row.characters),0)<=coldStorageByteLimit,'STORAGE_SIZE','Cold records exceed 64MiB stored budget');}
/** Disk inventory is separate from the bounded hot root and decoded working cut. */
export function assertStorageCapacity(hot:DatabaseState,layout:StorageLayout):void {
 if(layout.version===2){ensure(logicalStorageCharacters(hot,layout)<=namespaceCharacterLimit,'STORAGE_SIZE','Legacy namespace exceeds 4M JSON characters');return;}
 assertStoredRootCapacity(storedHotRoot(hot,layout),layout);
}
export function storageLayout(input:unknown):StorageLayout {const layout=parseStorageLayout(input),seen=new Set<string>();ensure(layout.version!==2?layout.revision!==undefined:layout.revision===undefined,'STORAGE_CORRUPT','Layout revision differs from version');for(const row of layout.records){storageKey(row.id);ensure(row.kind!=='receipt'||layout.version>=4&&/^r-[a-f0-9]{2}$/u.test(row.id),'STORAGE_RECEIPT_PAGE','Receipt pages require v4+ bucket identities');const key=JSON.stringify([row.kind,row.id]);ensure(!seen.has(key),'STORAGE_CORRUPT','Duplicate cold record');ensure(layout.version!==2?row.storedBytes!==undefined:row.storedBytes===undefined,'STORAGE_CORRUPT','Cold encoding differs from layout');seen.add(key);}return layout;}
export function slotSummary(slot:string,record:SlotRecord):StoredSlotSummary {return parseStoredSlotSummary({slot,revision:record.revision,hasPrevious:record.previous!==null,metadata:parseSlotMetadata(record.metadata??{profileId:'main',label:slot})});}
/** v2 charges logical cold JSON; v3 charges bounded gzip bytes. Secondary indexes remain excluded. */
export function logicalStorageCharacters(hot:DatabaseState,layout:StorageLayout):number {
 const {storageLayout:ignored,...root}=storedHotRoot(hot,layout) as Record<string,unknown>;void ignored;let n=JSON.stringify(root).length;for(const kind of ['slot','history','receipt'] as const){const rows=layout.records.filter(r=>r.kind===kind);n+=rows.reduce((sum,r)=>sum+JSON.stringify(r.id).length+1+(layout.version!==2?r.storedBytes!:r.characters),0)+Math.max(0,rows.length-1);}return n;
}
