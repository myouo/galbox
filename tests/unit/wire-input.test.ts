import {expect,it} from 'vitest';
import {canonicalWireJSON,parseJsonValue,parseValue} from 'galbox-sdk/protocol';
import {encodeWire} from 'galbox-sdk/wire';

it('rejects hidden serialization hooks without calling user code at public input boundaries',()=>{
 let calls=0;
 const value={kind:'i32',value:1};
 Object.defineProperty(value,'toJSON',{value(){calls++;return {kind:'i32',value:2};}});
 for(const read of [()=>parseValue(value),()=>canonicalWireJSON(value),()=>encodeWire('JsonValue',value)])expect(read).toThrow('INPUT_JSON');
 const getter={safe:true};
 Object.defineProperty(getter,'toJSON',{get(){calls++;return ()=>({replaced:true});}});
 expect(()=>parseJsonValue({nested:getter})).toThrow('INPUT_JSON');
 expect(calls).toBe(0);
});

it('rejects sparse arrays even when extra properties mask the missing index',()=>{
 const value:number[]=new Array(1);
 Object.defineProperty(value,'extra',{value:'lost',enumerable:true});
 expect(()=>parseJsonValue(value)).toThrow('INPUT_JSON');
 expect(()=>encodeWire('JsonValue',value)).toThrow('INPUT_JSON');
});

it('copies only JSON data without reading inherited array serialization hooks',()=>{
 let calls=0;
 const value=[1,2];
 Object.setPrototypeOf(value,{toJSON(){calls++;return [3];}});
 expect(parseJsonValue(value)).toEqual([1,2]);
 expect(calls).toBe(0);
});

it('preserves JSON normalization, property order and unusual data keys without mutable aliases',()=>{
 const input:unknown=JSON.parse('{"__proto__":{"owned":true},"toJSON":"ordinary data","constructor":null,"z":[0,false,""]}');
 const detached=parseJsonValue(input);
 expect(detached).toEqual(input);
 expect(detached).not.toBe(input);
 expect(Object.getPrototypeOf(detached)).toBe(Object.prototype);
 expect(Object.keys(detached??{})).toEqual(['__proto__','toJSON','constructor','z']);
 const shared={value:1},source={left:shared,right:shared,zero:-0};
 const copy=parseJsonValue(source);
 shared.value=2;
 expect(copy).toEqual({left:{value:1},right:{value:1},zero:0});
});
