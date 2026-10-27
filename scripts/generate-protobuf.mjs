import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {stringify as yaml} from 'yaml';
export async function generateProtobuf(schema,kinds,check){
 const nodes={},proto=[],clean=s=>s.replace(/[^A-Za-z0-9_]/g,'_'),name=s=>'Gbx_'+clean(s);
 const ref=s=>s.$ref?.split('/').at(-1);
 function build(id,s){if(Array.isArray(s.type)){const tags={string:1,number:2,integer:3,boolean:4,null:5,object:6,array:7};s={anyOf:s.type.map(type=>({...s,type,'x-proto-tag':tags[type]}))};}if(nodes[id])return id;nodes[id]={kind:'pending'};let lines=[];
  if(ref(s)){const target=name(ref(s));nodes[id]={kind:'alias',target};lines.push(`optional ${target} value = 1;`);}
  else if(Object.hasOwn(s,'const')){nodes[id]={kind:'constant',value:s.const};lines.push('// Fixed semantic value: '+JSON.stringify(s.const));}
  else if(s.oneOf||s.anyOf){const variants=(s.oneOf??s.anyOf).map((v,i)=>{const tag=v['x-proto-tag'];if(!Number.isSafeInteger(tag)||tag<1)throw new Error('Missing stable union tag: '+id);const target=build(id+'_Case'+tag,v);return {tag,target,field:'v'+tag};});nodes[id]={kind:'union',variants};lines.push('oneof value {',...variants.map(v=>`  ${v.target} ${v.field} = ${v.tag};`),'}');}
  else if(s.type==='array'){const target=build(id+'_Item',s.items);nodes[id]={kind:'array',target};lines.push(`repeated ${target} items = 1;`);}
  else if(s.type==='object'&&s.additionalProperties&&typeof s.additionalProperties==='object'&&!s.properties){const target=build(id+'_Value',s.additionalProperties),entry=id+'_Entry';nodes[id]={kind:'map',target};proto.push(`message ${entry} { optional string key = 1; optional ${target} value = 2; }`);lines.push(`repeated ${entry} entries = 1;`);}
  else if(s.type==='object'||s.properties){const fields=[];const tags=new Set();for(const [field,v]of Object.entries(s.properties??{})){const tag=v['x-proto-tag'];if(!Number.isSafeInteger(tag)||tag<1||tags.has(tag))throw new Error('Missing/duplicate stable field tag: '+id+'.'+field);tags.add(tag);const target=build(id+'_'+clean(field),v);fields.push({field,tag,target,required:(s.required??[]).includes(field)});lines.push(`optional ${target} ${field} = ${tag};`);}nodes[id]={kind:'object',fields};}
  else {let type=s.type;if(!type&&s.enum)type=typeof s.enum[0];if(!['string','number','integer','boolean','null'].includes(type))throw new Error('Unsupported protobuf schema '+id+': '+JSON.stringify(s));nodes[id]={kind:type,...(s.enum?{values:s.enum}:{})};if(type!=='null')lines.push(`optional ${{string:'string',number:'double',integer:'sint64',boolean:'bool'}[type]} value = 1;`);}
  proto.push(`message ${id} {\n${lines.map(l=>'  '+l).join('\n')}\n}`);return id;
 }
 for(const [id,s]of Object.entries(schema.definitions))build(name(id),s);
 schema['x-proto-envelope']??={};let next=Math.max(9,...Object.values(schema['x-proto-envelope']));for(const kind of kinds)if(!schema['x-proto-envelope'][kind])schema['x-proto-envelope'][kind]=++next;
 const envelope=kinds.map(k=>({kind:k,field:'body_'+k,tag:schema['x-proto-envelope'][k],target:name(k)}));proto.push(`message WireEnvelope {\n  optional uint32 wire_version = 1;\n  oneof body {\n${envelope.map(v=>`    ${v.target} ${v.field} = ${v.tag};`).join('\n')}\n  }\n}`);
 const text='// Generated from protocol.yaml; field numbers live in that single source.\nsyntax = "proto2";\npackage galbox.wire.v1;\n\n'+proto.join('\n\n')+'\n';
 const outputs={'packages/galbox-sdk/protocol/galbox.proto':text,'packages/galbox-sdk/src/protocol/generated/binary-plan.ts':`/* Generated from schema/protocol.yaml. */\nimport type {ProtoPlan} from '../protobuf-plan.js';\nexport const protoPlan:ProtoPlan=${JSON.stringify({nodes,envelope},null,2)};\n`,'packages/galbox-sdk/src/protocol/generated/binary-types.ts':`/* Generated from schema/protocol.yaml. */\nimport type * as W from './wire.js';\nimport * as V from './validators.js';\nexport interface WireMessages {${kinds.map(k=>`${k}:W.${k};`).join('')}}\nexport type WireKind=keyof WireMessages;\nexport const wireGuards:{[K in WireKind]:(value:unknown)=>value is WireMessages[K]}={${kinds.map(k=>`${k}:V.validate${k}`).join(',')}};\n`};
 for(const [file,body]of Object.entries(outputs)){if(check){if(await readFile(file,'utf8').catch(()=>null)!==body)throw new Error('Protobuf generated drift: '+file);}else{await mkdir(path.dirname(file),{recursive:true});await writeFile(file,body);}}
 const sourceFile='packages/galbox-sdk/schema/protocol.yaml';const updated=yaml(schema,{lineWidth:110});if(check){if(await readFile(sourceFile,'utf8')!==updated)throw new Error('Missing protobuf envelope tags');}else await writeFile(sourceFile,updated);
}
