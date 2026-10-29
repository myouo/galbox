import {it,expect} from 'vitest';
import {defaultPreferences,normalizePreferences,mergePreferences} from 'galbox-sdk/settings';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
it('prefetch depth is a bounded optional persistent preference with zero preserved and old defaults intact',()=>{
 const old=defaultPreferences();expect(old.prefetchPages).toBeUndefined();expect(normalizePreferences(old)).toEqual(old);const changed=mergePreferences(old,{prefetchPages:8});expect(decodeWire('PlayerPreferences',encodeWire('PlayerPreferences',changed))).toEqual(changed);expect(mergePreferences(changed,{text:{intervalMs:24}}).prefetchPages).toBe(8);expect(mergePreferences(changed,{prefetchPages:0}).prefetchPages).toBe(0);for(const n of [-1,9,1.5])expect(()=>mergePreferences(old,{prefetchPages:n})).toThrow();
});
