import { it,expect } from 'vitest';
import { readFileSync,writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
it('generated standalone validators load as native ESM without an undeclared CommonJS runtime helper',()=>{
 const result=spawnSync(process.execPath,['--input-type=module','-e',"await import('./packages/galbox-sdk/src/protocol/generated/validators.js')"],{encoding:'utf8'});
 expect(result.stderr).toBe('');expect(result.status).toBe(0);
});
it('read-only generated check detects drift without repairing the file',()=>{
 const file='packages/galbox-sdk/src/protocol/generated/wire.ts',original=readFileSync(file,'utf8');
 try {writeFileSync(file,original+'\n// deliberate drift\n');const result=spawnSync(process.execPath,['scripts/generate.mjs','--check'],{encoding:'utf8'});expect(result.status).toBe(1);expect(result.stderr).toContain('Generated drift');expect(readFileSync(file,'utf8')).toContain('deliberate drift');}
 finally {writeFileSync(file,original);}
});
