import {sha256} from '@noble/hashes/sha2.js';
import {utf8ToBytes} from '@noble/hashes/utils.js';
import {canonicalWireJSON} from './index.js';
// Fixed-width receipts avoid retaining a second complete image/snapshot per save.
export function wireDigest(input:unknown):string {return Array.from(sha256(utf8ToBytes(canonicalWireJSON(input))),b=>b.toString(16).padStart(2,'0')).join('');}
