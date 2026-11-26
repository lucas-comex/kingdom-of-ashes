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
  for(const mode of ['normal','safe','preview']){
   const page=await browser.newPage({viewport:{width:1280,height:800}});
   const errors=[];
   page.on('pageerror',err=>errors.push(err.stack||err.message));
   page.on('console',msg=>{if(msg.type()==='error')console.error(mode,msg.text())});
   await page.route('https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js',route=>route.fulfill({path:require.resolve('phaser/dist/phaser.min.js'),contentType:'application/javascript'}));
   await page.goto('http://127.0.0.1:'+server.address().port+(mode==='preview'?'/preview/index.html?test=1':'/?'+(mode==='safe'?'safe=1':'test=1')),{waitUntil:'load'});
   await page.waitForFunction(()=>typeof window.koaSave==='function',{timeout:60000});
   await page.locator('#start').click();
   await page.waitForFunction(()=>window.koaStats?.worldSize===80,{timeout:20000});
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
   await page.screenshot({path:'artifacts/'+mode+'.png'});
   assert.deepEqual(errors,[],mode+': browser runtime errors');
   console.log(mode,'PASS',start,end);
   await page.close();
  }
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
