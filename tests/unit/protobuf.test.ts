import {it,expect} from 'vitest';
import protobuf from 'protobufjs';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {parseValue,parseJsonValue,emptyProfile} from 'galbox-sdk/protocol';
import {readFile,readdir} from 'node:fs/promises';
it('round trips every authored test Program including expressions, media, stage and UI through protobuf',async()=>{
 for(const dir of await readdir('tests/fixtures/game-data')){let raw:unknown;try{raw=JSON.parse(await readFile(`tests/fixtures/game-data/${dir}/program.json`,'utf8'));}catch(e){if(e&&typeof e==='object'&&'code'in e&&e.code==='ENOENT')continue;throw e;}const {parseProgram}=await import('galbox-sdk/protocol'),p=parseProgram(raw);expect(decodeWire('Program',encodeWire('Program',p))).toEqual(p);}
});
it('uses real protobuf interoperable with the published IDL and keeps opcode unions and empty containers',async()=>{
 const p=new ProgramBuilder({gameId:'protobuf',release:'v1',entry:'main'}).function({id:'main',entry:'page',layout:1,params:[],locals:[],returns:'void',code:[instruction('text.page',{at:'page',textId:'t',revision:'v1',speaker:'澪',content:'Hello 世界 👩🏽‍🚀'}),instruction('control.end',{at:'end'})]}).build();const bytes=encodeWire('Program',p);expect(()=>JSON.parse(new TextDecoder().decode(bytes))).toThrow();expect(decodeWire('Program',bytes)).toEqual(p);const root=await protobuf.load('packages/galbox-sdk/protocol/galbox.proto'),type=root.lookupType('galbox.wire.v1.WireEnvelope'),message=type.decode(bytes);expect(type.verify(message)).toBeNull();expect(decodeWire('Program',type.encode(message).finish())).toEqual(p);const c=createCore(p);c.run(100);const s=c.capture();expect(decodeWire('Snapshot',encodeWire('Snapshot',s))).toEqual(s);expect(decodeWire('Profile',encodeWire('Profile',emptyProfile()))).toEqual(emptyProfile());
});
it('retains exact scalar encodings, null, false, empty string and map key order',()=>{
 for(const value of [{kind:'i64',value:'9007199254740993'},{kind:'f64',value:'8000000000000000'},{kind:'bool',value:false},{kind:'string',value:''},{kind:'null',value:null},{kind:'list',value:[]},{kind:'dict',value:[]}]){const parsed=parseValue(value);expect(decodeWire('Value',encodeWire('Value',parsed))).toEqual(parsed);}
 const json=parseJsonValue({z:null,a:[],empty:{},no:false,zero:0});expect(decodeWire('JsonValue',encodeWire('JsonValue',json))).toEqual(json);expect(Object.keys(decodeWire('JsonValue',encodeWire('JsonValue',json))??{})).toEqual(['z','a','empty','no','zero']);
});
it('rejects unexpected envelopes, invalid UTF-8, unsafe integers, malformed bytes and deep input',()=>{
 const bytes=encodeWire('Profile',emptyProfile());expect(()=>decodeWire('Snapshot',bytes)).toThrow('PROTO_TYPE');expect(()=>decodeWire('Profile',bytes.subarray(0,bytes.length-1))).toThrow('PROTO');expect(()=>decodeWire('Profile',new Uint8Array([8,2]))).toThrow('PROTO_VERSION');expect(()=>encodeWire('JsonValue','\ud800')).toThrow('PROTO_UTF8');let deep:unknown=null;for(let i=0;i<70;i++)deep={child:deep};expect(()=>encodeWire('JsonValue',parseJsonValue(deep))).toThrow();
});
it('rejects corrupted UTF-8 and multiple envelope bodies before accepting a DTO',()=>{
 const bytes=encodeWire('JsonValue','a'),bad=new Uint8Array(bytes);bad[bad.length-1]=0xff;expect(()=>decodeWire('JsonValue',bad)).toThrow('PROTO_UTF8');
 const duplicated=new Uint8Array(bytes.length*2-2);duplicated.set(bytes);duplicated.set(bytes.subarray(2),bytes.length);expect(()=>decodeWire('JsonValue',duplicated)).toThrow('PROTO_TYPE');
 expect(()=>encodeWire('Value',{kind:'i32',value:Number.MAX_SAFE_INTEGER+1})).toThrow('PROTO_SCHEMA');
});

// Raw messages use the public IDL's stable tags; bypass encodeWire so malformed
// duplicate fields reach the decoder exactly as they would from external bytes.
function message(field:number,...children:Uint8Array[]):Uint8Array {
 const size=children.reduce((sum,child)=>sum+child.byteLength,0);
 const header=protobuf.Writer.create().uint32(field*8+2).uint32(size).finish();
 const bytes=new Uint8Array(header.length+size);bytes.set(header);let offset=header.length;
 for(const child of children){bytes.set(child,offset);offset+=child.length;}
 return bytes;
}
function jsonEnvelope(payload:Uint8Array):Uint8Array {return Uint8Array.from([8,1,...message(15,payload)]);}
it.each([
 ['string',Uint8Array.from([10,1,97,10,1,98]),4],
 ['boolean',Uint8Array.from([8,0,8,1]),2],
 ['integer',Uint8Array.from([8,2,8,4]),3],
] as const)('rejects duplicate %s scalar fields instead of replacing the first value',(_name,scalar,branch)=>{
 expect(()=>decodeWire('JsonValue',jsonEnvelope(message(branch,scalar)))).toThrow('PROTO_DUPLICATE');
});
it('rejects duplicate floating point fields in preference imports',()=>{
 const scalar=protobuf.Writer.create().uint32(9).double(.5).uint32(9).double(1).finish();
 const body=message(33,message(1,scalar),...[2,3,4].map(field=>message(field,protobuf.Writer.create().uint32(9).double(1).finish())));
 expect(()=>decodeWire('AudioPreferences',Uint8Array.from([8,1,...body]))).toThrow('PROTO_DUPLICATE');
});
it('rejects duplicate map entry keys and values while accepting distinct repeated entries',()=>{
 const nullValue=message(1,Uint8Array.from([10,0]));
 const key=Uint8Array.from([10,1,97]);
 const duplicateKey=message(1,key,key,message(2,nullValue));
 const duplicateValue=message(1,key,message(2,nullValue),message(2,nullValue));
 for(const entry of [duplicateKey,duplicateValue])expect(()=>decodeWire('JsonValue',jsonEnvelope(message(6,entry)))).toThrow('PROTO_DUPLICATE');
 expect(decodeWire('JsonValue',encodeWire('JsonValue',{a:null,b:null}))).toEqual({a:null,b:null});
 expect(decodeWire('JsonValue',encodeWire('JsonValue',[1,1]))).toEqual([1,1]);
});
