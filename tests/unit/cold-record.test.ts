import {test,expect} from 'vitest';
import {encodeColdRecord,decodeColdRecord} from '../../packages/galbox-sdk/src/storage/cold-record.js';
test('cold gzip keeps Unicode and ownership, checks lengths/CRC and bounds expansion',async()=>{
 const original={text:'保存原始切点\n'.repeat(3000),revision:2},encoded=await encodeColdRecord(original),row={kind:'slot' as const,id:'one',characters:encoded.characters,storedBytes:encoded.storedBytes};original.text='changed';const restored=await decodeColdRecord(encoded.value,row,3);expect(restored).toEqual({text:'保存原始切点\n'.repeat(3000),revision:2});expect(encoded.storedBytes).toBeLessThan(encoded.characters/10);
 await expect(decodeColdRecord(encoded.value,{...row,characters:10},3)).rejects.toThrow('STORAGE_RECORD_SIZE');await expect(decodeColdRecord(encoded.value,{...row,storedBytes:1},3)).rejects.toThrow('STORAGE_RECORD_SIZE');const broken=encoded.value.bytes.slice(0);new Uint8Array(broken)[broken.byteLength-5]!^=1;await expect(decodeColdRecord({...encoded.value,bytes:broken},row,3)).rejects.toThrow('STORAGE_RECORD_SIZE');await expect(encodeColdRecord('x'.repeat(4_000_000))).rejects.toThrow('STORAGE_RECORD_SIZE');
});
