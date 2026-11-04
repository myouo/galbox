import {serializedJSONDigest} from '../protocol/digest.js';
const prefix='sha256-json-v1:';
/** Preserve the previous exact JSON identity, while retaining no duplicate payload. */
export function compactReceiptSignature(signature:string):string {
 if(signature.startsWith(prefix)&&/^[a-f0-9]{64}$/u.test(signature.slice(prefix.length)))return signature;
 return prefix+serializedJSONDigest(signature);
}
/** Call only after the input has been detached and validated by its formal parser. */
export function receiptSignature(input:object):string {return compactReceiptSignature(JSON.stringify(input));}
