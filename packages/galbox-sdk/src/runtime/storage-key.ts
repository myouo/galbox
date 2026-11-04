import {ensure} from '../protocol/index.js';
export function storageKey(id:string):void {ensure(typeof id==='string'&&id.length>0&&id.length<=256&&!['__proto__','constructor','prototype'].includes(id)&&!id.includes('\0'),'STORAGE_KEY','Invalid storage identity');}
