import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {parse} from 'yaml';
import path from 'node:path';

function discover(args){
 const result=spawnSync('pnpm',['exec','playwright','test','--list','--reporter=json',...args],{encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(result.status,0,result.stderr||result.stdout);
 const report=JSON.parse(result.stdout),ids=new Set();
 function visit(suite){for(const spec of suite.specs??[])for(const test of spec.tests??[]){assert.equal(typeof spec.id,'string');const id=`${spec.id}:${test.projectId??''}`;assert.ok(!ids.has(id),'Duplicate discovered test '+id);ids.add(id);}for(const child of suite.suites??[])visit(child);}
 for(const suite of report.suites)visit(suite);assert.ok(ids.size>0,'No tests discovered');return ids;
}
const workflow=parse(await readFile('.github/workflows/ci.yml','utf8')),rows=workflow.jobs.browser.strategy.matrix.include;
assert.ok(Array.isArray(rows)&&rows.length>0,'Missing browser matrix');assert.equal(new Set(rows.map(row=>row.group)).size,rows.length,'Matrix artifact names must be unique');
const full=discover([]),covered=new Set(),counts=[];
for(const row of rows){
 assert.ok(typeof row.filter==='string'&&/^--grep(?:-invert)?=/.test(row.filter));assert.ok(typeof row.shard==='string'&&/^[1-9][0-9]*\/[1-9][0-9]*$/.test(row.shard));
 const tests=discover([row.filter,`--shard=${row.shard}`]);
 for(const id of tests){assert.ok(full.has(id),'Unexpected matrix test '+id);assert.ok(!covered.has(id),'Matrix executes a test more than once: '+id);covered.add(id);}
 counts.push({group:row.group,shard:row.shard,tests:tests.size});
}
assert.deepEqual([...covered].sort(),[...full].sort(),'Browser matrix drops tests');
const dir=path.resolve(process.env.GALBOX_EVIDENCE_DIR??'artifacts/ci-shards');await mkdir(dir,{recursive:true});
const result={result:'passed',total:full.size,groups:counts};await writeFile(path.join(dir,'browser-shards.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
