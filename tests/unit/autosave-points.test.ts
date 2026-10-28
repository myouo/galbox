import {it,expect} from 'vitest';
import {parseSavePolicy} from 'galbox-sdk/protocol';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
it('authored autosave policy uses schema and protobuf without changing legacy defaults',()=>{const base={manualSlots:12,autoSlots:4,auto:'on-prompt'};const p=parseSavePolicy({...base,autoAt:['chapter:choice']});expect(decodeWire('SavePolicy',encodeWire('SavePolicy',p))).toEqual(p);expect(parseSavePolicy(base).autoAt).toBeUndefined();for(const autoAt of [['bad space'],['same','same'],[1],Array.from({length:257},(_,i)=>'p'+i)])expect(()=>parseSavePolicy({...base,autoAt})).toThrow();});
