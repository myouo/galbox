import {test} from '@playwright/test';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
test('character-unit waits preserve native DOM and IndexedDB continuation across reload',async()=>{
 await promisify(execFile)(process.execPath,['tests/tooling/character-waits-browser.mjs'],{timeout:40000,maxBuffer:1024*1024});
});
