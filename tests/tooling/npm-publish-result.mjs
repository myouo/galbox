import assert from 'node:assert/strict';

/** Normalize npm's legacy flat report and its single-package keyed report. */
export function npmPublishResult(json,packageName){
 const parsed=JSON.parse(json);
 assert.ok(parsed&&typeof parsed==='object'&&!Array.isArray(parsed),'Expected a publish report object');
 let result=parsed;
 if(!Object.hasOwn(parsed,'name')){
  assert.deepEqual(Object.keys(parsed),[packageName],'Expected exactly the requested package report');
  result=parsed[packageName];
 }
 assert.ok(result&&typeof result==='object'&&!Array.isArray(result),'Expected package metadata');
 assert.equal(result.name,packageName,'Publish report package identity differs');
 return result;
}
