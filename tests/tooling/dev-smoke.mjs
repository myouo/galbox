import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const evidence=path.resolve(process.env.GALBOX_EVIDENCE_DIR??'artifacts/dev');await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto('http://127.0.0.1:4173');await page.getByRole('button',{name:'开始阅读',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-testid="story-text"]')?.textContent?.includes('写着我的名字。'));
 const diagnostic=JSON.parse(await page.getByTestId('diagnostics').textContent()),count=await page.locator('canvas').count();
 if(response.status()!==200||count!==1||diagnostic.wait.at!=='main:opening-1'||diagnostic.profile.read.length!==0||errors.length)throw new Error(JSON.stringify({count,diagnostic,errors}));
 await page.screenshot({path:path.join(evidence,'development.png')});
 const result={result:'passed',url:'http://127.0.0.1:4173',status:response.status(),canvas:count,textId:diagnostic.wait.at,readCount:diagnostic.profile.read.length,media:diagnostic.media,errors,browser:browser.version()};
 await writeFile(path.join(evidence,'dev-result.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
} finally {await browser.close();}
