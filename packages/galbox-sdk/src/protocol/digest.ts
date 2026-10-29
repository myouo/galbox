import {canonicalParsedJSON} from './canonical.js';
import {detached} from './wire-input.js';
import {programWireBudget} from './budget.js';
import {sha256} from '@noble/hashes/sha2.js';
import {utf8ToBytes} from '@noble/hashes/utils.js';
import {canonicalWireJSON} from './index.js';
// Fixed-width receipts avoid retaining a second complete image/snapshot per save.
export function wireDigest(input:unknown):string {return Array.from(sha256(utf8ToBytes(canonicalWireJSON(input))),b=>b.toString(16).padStart(2,'0')).join('');}

export function wireByteLength(input:unknown):number {return utf8ToBytes(canonicalWireJSON(input)).length;}

export function byteDigest(bytes:Uint8Array):string {return Array.from(sha256(bytes),b=>b.toString(16).padStart(2,'0')).join('');}

// Internal program-derived closure. Do not use for mutable runtime messages.
export function programClosureDigest(input:unknown):string {return byteDigest(utf8ToBytes(canonicalParsedJSON(detached(input,programWireBudget))));}
