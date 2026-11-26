const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'application/javascript','.svg':'image/svg+xml','.css':'text/css'};
(async()=>{
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  let file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
  for(const mode of ['normal','safe','preview','eco','level100']){
   const page=await browser.newPage({viewport:{width:1280,height:800}});
   const errors=[];
   page.on('pageerror',err=>errors.push(err.stack||err.message));
   page.on('console',msg=>{if(msg.type()==='error')console.error(mode,msg.text())});
   await page.route('https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js',route=>route.fulfill({path:require.resolve('phaser/dist/phaser.min.js'),contentType:'application/javascript'}));
   await page.goto('http://127.0.0.1:'+server.address().port+(mode==='preview'||mode==='eco'||mode==='level100'?'/preview/index.html?test=1'+(mode==='eco'?'&eco=1':mode==='level100'?'&leveltest=100':''):'/?'+(mode==='safe'?'safe=1':'test=1')),{waitUntil:'load'});
   await page.waitForFunction(()=>typeof window.koaSave==='function',{timeout:60000});
   await page.locator('#start').click();
   await page.waitForFunction(()=>window.koaStats?.worldSize===80,{timeout:20000});
   if(mode==='level100'){
    assert.deepEqual(await page.evaluate(()=>({level:window.koaStats.level,hp:window.koaStats.maxHP,mana:window.koaStats.maxMana,xp:window.koaStats.xpNeeded,speed:window.koaStats.speed})),{level:100,hp:1585,mana:1090,xp:114000,speed:12.4});
    assert.equal(await page.evaluate(()=>window.koaSave()),false);
    assert.equal(await page.evaluate(()=>localStorage.getItem('koa-preview-save-v1')),null);
    await page.screenshot({path:'artifacts/level100.png'});
    assert.deepEqual(errors,[],mode+': browser runtime errors');
    console.log(mode,'PASS');
    await page.close();continue;
   }
   const start=await page.evaluate(()=>window.koaStats.position);
   await page.keyboard.down('d');await page.waitForTimeout(1700);await page.keyboard.up('d');
   await page.waitForTimeout(500);
   const end=await page.evaluate(()=>window.koaStats.position);
   assert.notDeepEqual(start,end,mode+': player did not move');
   await page.locator('#tools [data-panel=bag]').click();
   await page.locator('[data-kind=bag] .slot').first().waitFor();
   await page.locator('[data-kind=bag] header button').click();
   await page.locator('#tools [data-panel=skills]').click();
   await page.locator('[data-kind=skills] .skillrow').first().waitFor();
   assert.equal(await page.evaluate(()=>window.koaSave()),true);
   if(mode==='preview'){await page.locator('#tools [data-panel=hotkeys]').click();await page.locator('[data-hotkey="0"]').selectOption('I');await page.locator('[data-hotkey="0"]').evaluate(el=>el.blur());await page.keyboard.press('1');await page.locator('[data-kind=bag] .slot').first().waitFor();assert.equal(await page.evaluate(()=>window.KOA15.direction(1,-1)),'northeast');assert.ok(await page.locator('#quickSlots button').count()===9);assert.ok(await page.evaluate(()=>localStorage.getItem('koa-preview-save-v1')&&!localStorage.getItem('koa-save-v1')));}
   if(mode==='preview'){
    const bag=page.locator('[data-kind=bag]');
    if(!(await bag.count()))await page.locator('#tools [data-panel=bag]').click();
    await bag.locator('[data-drag-item=meat]').waitFor();
    const before=await page.evaluate(()=>window.koaStats.meat);
    if(before>1){
     await bag.locator('[data-drop=meat][data-count=ask]').click();
     await page.locator('#dropQuantity').fill('1');
     await page.locator('#dropConfirm').click();
     await page.waitForFunction(n=>window.koaStats.meat===n-1,before);
     await page.locator('#tools [data-panel=ground]').click();
     assert.ok(await page.evaluate(()=>Number(document.querySelector('[data-kind=ground]').style.zIndex)>Number(document.querySelector('[data-kind=bag]').style.zIndex)),'new ground window must be above bag');
     await page.locator('[data-kind=ground] [data-pickup]').first().click();
     await page.waitForFunction(n=>window.koaStats.meat===n,before);
    }
    await page.locator('#tools [data-panel=character]').click();
    await page.locator('[data-kind=character] .groundRow').first().waitFor();
    await page.evaluate(()=>window.KOAInventory.move('meat','gold'));
    assert.equal(await page.evaluate(()=>window.KOAInventory.order[0]),'meat');
    // Route through the tavern door, walk out and verify local item persistence.
    await page.evaluate(()=>window.koaTravel(13,13));
    await page.waitForFunction(()=>window.koaStats?.interior===0,null,{timeout:20000});
    assert.equal(await page.evaluate(()=>window.koaStats.interiorName),'Taverna do Corvo');
    assert.equal(await page.evaluate(()=>window.koaStats.nearby.length),0);
    await page.waitForTimeout(600);
    await page.keyboard.down('s');
    await page.waitForFunction(()=>window.koaStats?.interior===null,null,{timeout:10000});
    await page.keyboard.up('s');
    assert.equal(await page.evaluate(()=>window.koaSave()),true);
    console.log('interior entry/exit PASS');

   }
   if(mode==='eco'){assert.equal(await page.evaluate(()=>window.koaEco),true);assert.equal(await page.evaluate(()=>window.koaPerf.frameLimit),30);assert.equal(await page.evaluate(()=>document.documentElement.dataset.eco),'yes')}
   await page.screenshot({path:'artifacts/'+mode+'.png'});
   assert.deepEqual(errors,[],mode+': browser runtime errors');
   console.log(mode,'PASS',start,end);
   await page.close();
  }
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
