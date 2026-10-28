import {it,expect} from 'vitest';
import {npmPublishResult} from '../tooling/npm-publish-result.mjs';

it('accepts legacy flat and current package-keyed npm dry-run metadata without dropping file evidence',()=>{
 for(const name of ['galbox-sdk','@galbox/cli']){
  const record={name,version:'0.1.0',files:[{path:'package.json',size:100},{path:'dist/index.js',size:200}]};
  expect(npmPublishResult(JSON.stringify(record),name)).toEqual(record);
  expect(npmPublishResult(JSON.stringify({[name]:record}),name)).toEqual(record);
 }
});
it('rejects empty, multiple, mismatched and malformed reports instead of manufacturing a successful audit',()=>{
 for(const value of [null,[],{}, {'another-package':{name:'galbox-sdk'}},{'galbox-sdk':{name:'galbox-sdk'},extra:{}},{'galbox-sdk':null},{'galbox-sdk':{name:'wrong'}},{name:'wrong'}])expect(()=>npmPublishResult(JSON.stringify(value),'galbox-sdk')).toThrow();
});
