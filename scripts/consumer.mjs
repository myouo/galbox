import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp,readFile,writeFile,cp,mkdir,rm,realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
const root=process.cwd();
const evidence=path.resolve(process.env.GALBOX_EVIDENCE_DIR??'docs/evidence');await mkdir(evidence,{recursive:true});
function run(cmd,args,cwd=root){const r=spawnSync(cmd,args,{cwd,encoding:'utf8',env:process.env});process.stdout.write(r.stdout??'');process.stderr.write(r.stderr??'');if(r.status!==0)throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}`);}
run('pnpm',['build:cli']);
const {serveVersionedMedia}=await import('../packages/cli/dist/stream-http.js');
const dir=await mkdtemp(path.join(tmpdir(),'galbox-consumer-'));console.log(`Isolated consumer: ${dir}`);
let success=false;
try {
 const tar=path.join(dir,'galbox-sdk.tgz');run('pnpm',['--dir','packages/galbox-sdk','pack','--out',tar]);
 await cp(path.join(root,'tests/consumer'),dir,{recursive:true});
 const pkg=JSON.parse(await readFile(path.join(dir,'package.json'),'utf8'));pkg.dependencies['galbox-sdk']='file:./galbox-sdk.tgz';await writeFile(path.join(dir,'package.json'),JSON.stringify(pkg,null,2));
 await mkdir(path.join(dir,'public'),{recursive:true});await cp(path.join(root,'apps/playground/public'),path.join(dir,'public'),{recursive:true});
 run('pnpm',['install','--ignore-workspace'],dir);run('pnpm',['exec','tsc','--noEmit'],dir);run('pnpm',['exec','tsc','--outDir','compiled'],dir);run('node',['headless.mjs'],dir);run('pnpm',['exec','vite','build','--base=./'],dir);
 const installed=await realpath(path.join(dir,'node_modules/galbox-sdk'));if(installed.startsWith(root))throw new Error('Consumer resolved workspace source');
 const server=createServer(async(req,res)=>{if(await serveVersionedMedia(path.join(dir,'dist'),req,res))return;const file=path.resolve(dir,'dist','.'+(req.url==='/'?'/index.html':req.url??'/index.html'));if(!file.startsWith(path.join(dir,'dist')+path.sep)){res.writeHead(403);res.end();return;}try{const bytes=await readFile(file);res.writeHead(200,{'content-type':file.endsWith('.js')?'text/javascript':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.json')?'application/json':'text/html'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();if(!address||typeof address==='string')throw new Error('No port');
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${address.port}`);await page.locator('#run').click();await page.waitForFunction(()=>document.body.dataset.result!==undefined,{},{timeout:60000});const result=await page.locator('#result').textContent();if(await page.locator('body').getAttribute('data-result')!=='passed'||errors.length)throw new Error(`${result}; ${errors.join(',')}`);console.log(result);await mkdir(path.join(root,'artifacts'),{recursive:true});await cp(tar,path.join(root,'artifacts/galbox-sdk-0.1.0.tgz'));const tarBytes=await readFile(tar);await writeFile(path.join(evidence,'consumer-result.json'),JSON.stringify({result:'passed',isolatedDirectory:dir,installed,typescript:'5.9.3',skipLibCheck:false,tarball:'artifacts/galbox-sdk-0.1.0.tgz',tarballSha256:createHash('sha256').update(tarBytes).digest('hex'),browser:browser.version(),publicEntries:['core','protocol','port-kit','player','react','react/style.css','testing','save-bridge','backups','release','settings'],playSaveRestore:true,portableBackupRestore:true,explicitContentMigration:true,releaseManifest:true,resourceBudgets:true,persistentPreferences:true,playbackModes:true,preferencesV1Migration:true,settingsImportExport:true,typedExpressions:true,rngRestore:true,structuredText:true,rubyRendering:true,graphemePauseEffectRestore:true,textWindows:true,nvlRestore:true,requiredFonts:true,customTextRenderer:true,extendedValues:true,exactF64I64:true,orderedCollections:true,nativeDataBackupRestore:true,stageEffects:true,parsedStageRestore:true,stageBackupRestore:true,longMedia:true,naturalMediaCompletion:true,voiceReplay:true,audioMixRestore:true,mediaBackupRestore:true,canvasFallback:true,canvasNativePixels:true,crossRendererSave:true,canvasInstanceIsolation:true,canvasIsolatedEffects:true,canvasStageBackup:true,canvasSurfaceCleanup:true,videoPlaybackRestore:true,videoForbidSave:true,videoBackupRestore:true,preparedHotspots:true,timedInteractionRestore:true,versionedStreaming:true,streamingIdentityRestore:true,streamingBackupRestore:true,integrityLevels:true,illustratedSaves:true,saveLibrary:true,previousCaptureBackup:true},null,2)+'\n');}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 success=true;
}finally{if(success)await rm(dir,{recursive:true,force:true});else console.error(`Failed consumer retained at ${dir}`);}
