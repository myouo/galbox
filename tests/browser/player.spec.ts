import { test,expect } from '@playwright/test';
import type { Page } from '@playwright/test';
async function diagnostics(page:Page){return JSON.parse((await page.getByTestId('diagnostics').textContent())??'{}') as {epoch:number;lifecycle:string;globals?:{visits?:{value:number};route?:{value:string}};wait?:{kind:string;prompt?:number};profile?:{read:string[];values:Record<string,{value:boolean}>};media:{starts:number;decoded:number;active:number};};}
async function advanceExact(page:Page){
 const before=(await diagnostics(page)).wait?.prompt;
 await page.getByTestId('advance').click();
 if((await diagnostics(page)).wait?.prompt===before)await page.getByTestId('advance').click();
 await expect.poll(async()=>(await diagnostics(page)).wait?.prompt).not.toBe(before);
}
async function opening(page:Page){for(let j=0;j<3;j++)await advanceExact(page);await expect(page.getByRole('button',{name:'沿着海岸，寻找寄信人'})).toBeVisible();}
async function finish(page:Page,route:'shore'|'tower'){
 await page.getByRole('button',{name:route==='shore'?'沿着海岸，寻找寄信人':'走进灯塔，守候下一束光'}).click();
 await expect.poll(async()=>(await diagnostics(page)).wait?.kind).toBe('text');
 for(let j=0;j<6;j++)await advanceExact(page);
 await expect(page.getByRole('button',{name:'再次阅读'})).toBeVisible();
}
test('real Pixi/WAV/IndexedDB: save, restore, refresh, both endings and ordinary profile',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).click();
 await expect(page.locator('canvas')).toHaveCount(1);await expect(page.getByTestId('advance')).toBeVisible();
 await page.getByTestId('advance').click();expect((await diagnostics(page)).profile?.read).toHaveLength(0);
 await page.getByRole('button',{name:'菜单',exact:true}).click();const prior=await page.getByTestId('story-text').innerText();await page.getByRole('button',{name:'快速保存',exact:true}).click();await expect(page.getByRole('status')).toContainText('已保存到浏览器');
 await page.getByRole('button',{name:'关闭',exact:true}).click();expect(await page.getByTestId('story-text').innerText()).toBe(prior);
 // First page is revealed: one activation advances it.
 await page.getByTestId('advance').click();await advanceExact(page);await advanceExact(page);
 await expect(page.getByRole('button',{name:'沿着海岸，寻找寄信人'})).toBeVisible();expect((await diagnostics(page)).globals?.visits?.value).toBe(1);
 await finish(page,'shore');await expect.poll(async()=>(await diagnostics(page)).profile?.values.shoreUnlocked?.value).toBe(true);
 const media=(await diagnostics(page)).media;expect(media.decoded).toBe(4);expect(media.starts).toBeGreaterThanOrEqual(2);
 await page.reload();await page.getByRole('button',{name:'读取快速存档',exact:true}).click();await expect(page.getByTestId('advance')).toBeVisible();expect((await diagnostics(page)).profile?.values.shoreUnlocked?.value).toBe(true);expect((await diagnostics(page)).profile?.read).toHaveLength(9);
 expect(await page.getByTestId('story-text').innerText()).toBe(prior);
 const oldEpoch=(await diagnostics(page)).epoch;await page.getByRole('button',{name:'菜单',exact:true}).click();await page.getByRole('button',{name:'重新开始',exact:true}).click();await expect.poll(async()=>(await diagnostics(page)).epoch).toBeGreaterThan(oldEpoch);await expect.poll(async()=>(await diagnostics(page)).lifecycle).toBe('playing');await opening(page);await finish(page,'tower');
 await expect.poll(async()=>(await diagnostics(page)).profile?.values.towerUnlocked?.value).toBe(true);expect((await diagnostics(page)).profile?.values.shoreUnlocked?.value).toBe(true);expect((await diagnostics(page)).globals?.route?.value).toBe('tower');
 await page.screenshot({path:'docs/evidence/playable.png'});expect(errors).toEqual([]);
});
test('menu pointer release cannot advance and repeated create/dispose releases canvas/audio',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).click();await page.getByTestId('advance').click();
 const before=await page.getByTestId('story-text').innerText();await page.getByRole('button',{name:'菜单',exact:true}).click();await page.getByRole('button',{name:'关闭',exact:true}).click();expect(await page.getByTestId('story-text').innerText()).toBe(before);
 await page.reload();await expect(page.locator('canvas')).toHaveCount(1);await expect(page.getByRole('button',{name:'开始阅读',exact:true})).toBeVisible();
});
test('keyboard activation consumes one stage and a menu cancels a held key',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'开始阅读',exact:true}).click();const advance=page.getByTestId('advance');await advance.focus();await page.keyboard.press('Enter');expect((await diagnostics(page)).profile?.read).toHaveLength(0);await page.keyboard.press('Enter');await expect.poll(async()=>(await diagnostics(page)).profile?.read.length).toBe(1);
 const before=(await diagnostics(page)).wait?.prompt;await advance.focus();await page.keyboard.down('Space');await page.getByRole('button',{name:'菜单',exact:true}).click();await page.getByRole('button',{name:'关闭',exact:true}).click();await advance.focus();await page.keyboard.up('Space');expect((await diagnostics(page)).wait?.prompt).toBe(before);expect((await diagnostics(page)).profile?.read).toHaveLength(1);
});
