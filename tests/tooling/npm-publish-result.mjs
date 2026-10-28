import assert from 'node:assert/strict';
export function publishResult(input,name){
 assert.ok(input&&typeof input==='object'&&!Array.isArray(input),'Expected npm JSON object');
 let value=input;
 if(!Object.hasOwn(input,'name')){assert.deepEqual(Object.keys(input),[name],'Expected one package-keyed npm result');value=input[name];}
 assert.ok(value&&typeof value==='object'&&!Array.isArray(value),'Expected package metadata');assert.equal(value.name,name);return value;
}
