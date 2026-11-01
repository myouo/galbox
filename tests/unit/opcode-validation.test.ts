import {readFileSync,readdirSync} from 'node:fs';
import {Ajv} from 'ajv';
import {parse} from 'yaml';
import {test,expect} from 'vitest';
import {validateInstruction} from '../../packages/galbox-sdk/src/protocol/generated/validators.js';

test('opcode dispatch preserves original schema acceptance and rejects malformed branches',()=>{
 const strip=(value:unknown):unknown=>Array.isArray(value)?value.map(strip):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([k])=>!k.startsWith('x-proto')).map(([k,v])=>[k,strip(v)])):value;
 const schema=strip(parse(readFileSync('packages/galbox-sdk/schema/protocol.yaml','utf8'))) as { $id:string;definitions:Record<string,unknown> };
 const ajv=new Ajv({strict:true,allErrors:false,inlineRefs:false});ajv.addSchema(schema);const reference=ajv.compile({$ref:schema.$id+'#/definitions/Instruction'});
 const samples=new Map<string,Record<string,unknown>>(),root='tests/player-app/public';
 for(const file of readdirSync(root,{recursive:true,encoding:'utf8'}).filter(f=>f.endsWith('.json'))){const data=JSON.parse(readFileSync(root+'/'+file,'utf8'));for(const f of data.functions??[])for(const i of f.code??[])if(typeof i.op==='string'&&!samples.has(i.op))samples.set(i.op,i);}
 samples.set('audio.source.pause',{op:'audio.source.pause',at:'pause',source:'music',paused:true});
 expect(samples.size).toBeGreaterThanOrEqual(55);
 for(const sample of samples.values()){
  expect(validateInstruction(sample),String(sample.op)).toBe(true);
  const variants:unknown[]=[sample,{...sample,extra:true},{...sample,op:'unknown.op'},{...sample,op:4},null,[],{}];
  for(const key of Object.keys(sample)){const missing={...sample};delete missing[key];variants.push(missing,{...sample,[key]:null},{...sample,[key]:{}},{...sample,[key]:['wrong']});}
  for(const variant of variants)expect(validateInstruction(variant),JSON.stringify(variant)).toBe(reference(variant));
 }
 for(const invalid of [{at:'bad'}, {op:1,at:'bad'}, {op:'control.end',at:'bad',extra:1}, {op:'text.rich',at:'bad',runs:[{kind:'text',content:4}]}, {op:'audio.source.pause',at:'bad',source:'music',paused:'false'}])expect(validateInstruction(invalid)).toBe(false);
},20000);
