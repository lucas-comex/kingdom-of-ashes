const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'application/javascript','.svg':'image/svg+xml','.css':'text/css','.png':'image/png','.webp':'image/webp'};
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
  for(const mode of ['normal','safe','preview','eco','level100','level1000']){
   const page=await browser.newPage({viewport:{width:1280,height:800}});
   const errors=[];
   page.on('pageerror',err=>{errors.push(err.stack||err.message);console.error(mode,'PAGE ERROR',err.stack||err.message)});
   page.on('console',msg=>{if(msg.type()==='error')console.error(mode,msg.text())});
   await page.route('https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js',route=>route.fulfill({path:require.resolve('phaser/dist/phaser.min.js'),contentType:'application/javascript'}));
   await page.goto('http://127.0.0.1:'+server.address().port+(mode==='preview'||mode==='eco'||mode==='level100'||mode==='level1000'?'/preview/index.html?test=1'+(mode==='eco'?'&eco=1':mode==='level100'?'&leveltest=100':mode==='level1000'?'&leveltest=1000':''):'/?'+(mode==='safe'?'safe=1':'test=1')),{waitUntil:'load'});
   await page.waitForFunction(()=>typeof window.koaSave==='function',null,{timeout:60000});
   if(mode==='preview'){
     assert.equal(await page.locator('#registerTab').isVisible(),false);
     await page.locator('#openCreator').click();
     assert.equal(await page.locator('#creatorPanel').isVisible(),true);
     assert.equal(await page.evaluate(()=>window.KOASpritePack.source),'built-in','original raster must load automatically from the bundled asset');assert.equal(await page.evaluate(()=>window.KOASpritePack.nativeFrames),8,'eight native-resolution hero frames must be available');
     const artLayers=await page.evaluate(()=>{const cv=document.createElement('canvas');cv.width=cv.height=96;const p=window.KOAAppearance.get(),sample=q=>{window.KOAAppearance.paint(cv,{...p,...q},'south',0,0,'stance');return cv.toDataURL()};return {skin:sample({skin:'#70432d'})!==sample({skin:'#edc5a6'}),hair:sample({hairColor:'#111111'})!==sample({hairColor:'#c99c64'}),icons:['sword','bow','staff','wand','shield','helmet','armor','legs','boots'].every(k=>window.KOASpritePack.iconURL(k)?.startsWith('data:image/png'))}});assert.deepEqual(artLayers,{skin:true,hair:true,icons:true});
     const poseArt=await page.evaluate(()=>{const api=window.KOASpritePack,p=window.KOAAppearance.get(),cv=document.createElement('canvas');cv.width=cv.height=96;const sample=(dir,frame,gear,action,style={})=>{api.draw(cv,{...p,gearStyle:style},dir,frame,gear,action);return cv.toDataURL()};return {cropped:api.getItemBounds(5).w<64,walk:new Set(Array.from({length:6},(_,i)=>sample('south',i,0,'run'))).size,attack:new Set(Array.from({length:4},(_,i)=>sample('south',i,8,'swing'))).size,side:sample('south',0,0,'stance')!==sample('east',0,0,'stance'),differentGear:sample('south',0,8,'stance',{sword:'trainingSword'})!==sample('south',0,8,'stance',{sword:'crownBlade'}),unarmed:sample('south',0,0,'stance',{sword:'trainingSword'})===sample('south',0,0,'stance',{sword:'crownBlade'})}});assert.deepEqual(poseArt,{cropped:true,walk:4,attack:4,side:true,differentGear:true,unarmed:true});
     const anchors=await page.evaluate(()=>{const a=window.KOASpritePack,p=window.KOAAppearance.get(),cv=document.createElement('canvas');cv.width=cv.height=96;let connected=true,clipped=true,visible=true;const frames=[0,1,2,3];for(let row=0;row<4;row++)for(const col of frames){const dir=row%2?'north':'south',profile={...p,gender:row>=2?'female':'male',hair:'short',beard:'none',hideHelmet:false},render=gear=>{a.draw(cv,profile,dir,col,gear,'run');return cv.getContext('2d').getImageData(0,0,96,96).data},base=render(0),clothes=render(1|128|512),armed=render(8),an=a.getAnchors(row,col);for(const q of [an.head,an.left,an.right,...an.feet]){const x=Math.floor(q[0]),y=Math.floor(q[1]);if(base[(y*96+x)*4+3]<50)connected=false}let changed=0;for(let i=0;i<base.length;i+=4){if(base[i+3]===0&&clothes[i+3]>3)clipped=false;if(armed[i]!==base[i]||armed[i+1]!==base[i+1]||armed[i+2]!==base[i+2]||armed[i+3]!==base[i+3])changed++}if(changed<8)visible=false}return {connected,clipped,visible,grips:[0,1,2,3,4].every(i=>a.getGrip(i).every(v=>v>0&&v<1))}});assert.deepEqual(anchors,{connected:true,clipped:true,visible:true,grips:true});
     const pack=await page.evaluate(async()=>{const api=window.KOASpritePack,c=document.createElement('canvas');c.width=384;c.height=512;const x=c.getContext('2d');x.fillStyle='#794b35';x.fillRect(38,10,20,72);x.fillStyle='#8b9cac';x.fillRect(64*5+16,384+8,32,40);await api.loadURL(c.toDataURL(),false);const out=document.createElement('canvas');out.width=out.height=96;const p=window.KOAAppearance.get();api.draw(out,p,'south',0,0,'stance');const before=out.toDataURL();api.draw(out,p,'south',0,2,'stance');const changed=out.toDataURL()!==before;api.clear();const active=api.active;api.useDefault();return {changed,active}});assert.deepEqual(pack,{changed:true,active:false});
     const starter=await page.evaluate(()=>{const cv=document.createElement('canvas');cv.width=cv.height=96;const p=window.KOAAppearance.get();return ['warrior','archer','sorcerer','druid'].map(vocation=>{window.KOAAppearance.paint(cv,{...p,vocation},'south',0,0,'stance');return cv.toDataURL()})});assert.equal(new Set(starter).size,1,'starting clothing must be identical across vocations');
     assert.equal(await page.locator('#accountPanel input[type=password]').isDisabled(),true);
     await page.locator('#appearanceGender').selectOption('female');
     await page.locator('#appearanceClass').selectOption('archer');
     await page.locator('#appearanceHair').selectOption('long');
     await page.locator('#appearanceSkin').fill('#a86c45');
     await page.locator('#heroName').fill('Ash Test');
     const preview=await page.locator('#appearancePreview').evaluate(c=>c.toDataURL());
     await page.locator('#turnPreview').click();
     assert.notEqual(await page.locator('#appearancePreview').evaluate(c=>c.toDataURL()),preview);
   }
   await page.locator('#start').click();
   const expectedWorldSize=['preview','eco','level100','level1000'].includes(mode)?192:80;
    await page.waitForFunction(size=>window.koaStats?.worldSize===size,expectedWorldSize,{timeout:20000});
    assert.equal(await page.evaluate(()=>window.koaStats.worldSize),expectedWorldSize);
   if(expectedWorldSize===192){
     const art=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],tile=window.KOAArt.tile('plaza',3),rgba=tile.getContext('2d').getImageData(0,0,64,32).data;let painted=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i])painted++;return {version:window.koaPerf.artVersion,painted,artTextures:w.textures.getTextureKeys().filter(k=>k.startsWith('art-')).length,local:w.sceneryActive.size,total:w.trees.length}});
     assert.equal(art.version,'15.8');const edge=await page.evaluate(()=>{const c=window.KOAArt.edge('meadow','road',0,3),a=c.getContext('2d').getImageData(0,0,64,32).data;return {painted:a.some((v,i)=>i%4===3&&v>0),cached:c===window.KOAArt.edge('meadow','road',0,3)}});assert.deepEqual(edge,{painted:true,cached:true});assert.ok(art.painted>800&&art.painted<1500,'isometric tile has a real painted diamond');assert.ok(art.artTextures>0,'new artwork active');assert.ok(art.local<art.total/4,'local scenery remains bounded');console.log('landscape artwork PASS',art);
     const arch=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],keys=w.textures.getTextureKeys(),samples=['house','tavern','temple','barracks','keep'].map(k=>{const c=window.KOAArchitecture.building(k),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n});return {version:window.koaPerf.architectureVersion,types:keys.filter(k=>k.startsWith('arch-building-')).length,samples}});
     assert.equal(arch.version,'15.9');assert.ok(arch.types>=5);assert.ok(arch.samples.every(n=>n>20000&&n<136800),'building artwork must be nonempty and retain transparency');console.log('architecture PASS',arch);
     const worldArt=await page.evaluate(()=>{const A=window.KOAArchitecture,W=window.KOAArt,w=window.koaGame.scene.getScenes(true)[0];const image=c=>c.toDataURL();return {floors:image(A.dungeonTile('crypt',0))!==image(A.dungeonTile('sewer',0)),walls:image(A.dungeonWall('crypt',0))!==image(A.dungeonWall('sewer',0)),props:new Set(['forge','anvil','oven','bread','shelf','barrels','sarcophagus','bones','rubble'].map(k=>image(A.furniture(k)))).size,scenery:new Set(['cliff','flowers','mushrooms'].map(k=>image(W.detail(k,0)))).size,crypt:w.textures.exists('rebirth-crypt-floor'),sewer:w.textures.exists('rebirth-sewer-floor')}});assert.deepEqual(worldArt,{floors:true,walls:true,props:9,scenery:3,crypt:true,sewer:true});
     const city=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],p={...w.p},v=w.occluders.find(v=>v.area==='surface'),ox=(v.x-5200)/32,oy=(v.y-60-100)/16;w.p={x:(ox+oy)/2,y:(oy-ox)/2};for(let i=0;i<60;i++)w.updateOcclusion(1/60);const hidden=v.alpha;w.p={x:150,y:150};for(let i=0;i<60;i++)w.updateOcclusion(1/60);const restored=v.alpha;w.p=p;w.updateOcclusion(.1);const n=w.npcs.find(n=>n.resident),old=n.wait;w.talkResident(n);const first=w.dialogue.line;w.talkResident(n);const varied=first!==w.dialogue.line;w.dialogue=null;n.wait=old;return {hidden,restored,varied,residents:w.npcs.filter(n=>n.resident).length,shops:w.houses.filter(h=>h.shop).length,music:window.KOACity.enabled}});
     assert.equal(city.hidden,.23);assert.equal(city.restored,1);assert.ok(city.varied);assert.ok(city.residents>=15);assert.equal(city.shops,4);assert.equal(city.music,true);console.log('living city PASS',city);


    }
    if(mode==='level100'||mode==='level1000'){
    assert.deepEqual(await page.evaluate(()=>({level:window.koaStats.level,hp:window.koaStats.maxHP,mana:window.koaStats.maxMana,xp:window.koaStats.xpNeeded,speed:window.koaStats.speed})),mode==='level1000'?{level:1000,hp:15085,mana:10090,xp:10140000,speed:3.5}:{level:100,hp:1585,mana:1090,xp:114000,speed:3.5});
    assert.equal(await page.evaluate(()=>window.koaSave()),false);
    assert.equal(await page.evaluate(()=>localStorage.getItem('koa-preview-save-v1')),null);
    await page.screenshot({path:'artifacts/'+mode+'.png'});
    assert.deepEqual(errors,[],mode+': browser runtime errors');
    console.log(mode,'PASS');
    await page.close();continue;
   }
   if(mode==='preview'){
     const movement=await page.evaluate(()=>{
       const w=window.koaGame.scene.getScenes(true)[0], old=w.level, p={...w.p};
       const speeds=[1,12,100,500,1000].map(l=>{w.level=l;return w.moveSpeed()});
       w.level=500;w.goal=null;w.path=[];w.target=null;
       w.keys.D.isDown=true;w.update(0,80);w.keys.D.isDown=false;
       const after={...w.p};w.update(0,80);const released={...w.p};
       w.level=old;w.p=p;return {speeds,distance:Math.hypot(after.x-p.x,after.y-p.y),drift:Math.hypot(released.x-after.x,released.y-after.y)};
     });
     assert.deepEqual(movement.speeds.map(s=>Math.round(s*10000)/10000),[2.5,2.6375,3.5,3.5,3.5]);
     assert.ok(movement.distance<=.281,'a single movement tick must remain bounded');
     assert.equal(movement.drift,0,'release must stop manual movement');
     if(process.env.KOA_REQUIRE_HD==='1')assert.equal(await page.evaluate(()=>window.KOAFlareHeroScale),1,'HD source assets must be active');
     console.log('bounded player movement PASS',movement);
     const sprites=await page.evaluate(()=>{
       const scene=window.koaGame.scene.getScenes(true)[0], flare=window.KOAFlare;
       const dirs=Object.keys(flare.dirs), states={stance:4,run:8,swing:4,block:2,hit:2,shoot:4,cast:4,die:6};
       const failures=[], keys=new Set(), checked=new Set();
       function check(role,dir,frame,gear,action){
         const key=flare.texture(scene,role,dir,frame,gear,action);
         if(!key||!scene.textures.exists(key)){failures.push([role,dir,frame,gear,action]);return key}
         if(!checked.has(key)){
           const canvas=scene.textures.get(key).getSourceImage(), rgba=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
           if(!rgba.some((v,i)=>i%4===3&&v>0))failures.push(['transparent',key]);
           checked.add(key);
         }
         keys.add(key);return key;
       }
       for(const dir of dirs){
         for(const [action,count] of Object.entries(states))for(let f=0;f<count;f++)check('hero',dir,f,15,action);
         for(const role of Object.keys(flare.roles))for(let f=0;f<4;f++)check(role,dir,f,0);
       }
       const variants=[0,1,2,4,8].map(mask=>check('hero','south',0,mask,'stance'));
       const hashes=variants.map(key=>{
         if(!key)return null;
         const canvas=scene.textures.get(key).getSourceImage(), pixels=canvas.getContext('2d').getImageData(0,0,96,96).data;
         let hash=2166136261;for(const value of pixels)hash=Math.imul(hash^value,16777619);return hash;
       });
       const live=scene.hero.texture.key;
       return {failures,unique:keys.size,gearVariants:new Set(hashes).size,live};
     });
     assert.deepEqual(sprites.failures,[],'FLARE sprites must render in all supported directions and frames');
     assert.ok(sprites.unique>=440,'distinct animation textures');
     assert.equal(sprites.gearVariants,5,'each equipment layer must change the rendered pixels');
     assert.ok(sprites.live.startsWith('koa-original-'),'live hero must use original customizable art');assert.equal(await page.evaluate(()=>window.KOASpritePack.active),true);if(process.env.KOA_REQUIRE_CLASSIC){const classic=await page.evaluate(()=>{const A=window.KOAClassic,p=window.KOAAppearance.get(),cv=document.createElement('canvas');cv.width=cv.height=96;let poses=0;for(const gender of ['male','female'])for(const dir of window.KOAAppearance.dirs)if(A.drawHero(cv,{...p,gender},dir,0,0,'stance'))poses++;const ground=A.tile('meadow',0),tree=A.tree('oak',0);return {ready:A.ready,landscape:A.counts.landscape,layers:A.counts.layers,poses,ground:!!ground,tree:!!tree}});assert.ok(classic.ready&&classic.landscape>100&&classic.layers===28&&classic.poses===16&&classic.ground&&classic.tree,JSON.stringify(classic));console.log('CLASSIC ART PASS',classic)}const viewport=await page.evaluate(()=>{const a=document.getElementById('game').getBoundingClientRect(),b=document.getElementById('viewport').getBoundingClientRect();return {gap:Math.abs(a.width-b.width),height:a.height}});assert.ok(viewport.gap<3&&viewport.height>300,'game canvas should fill the viewport');
     assert.equal(await page.evaluate(()=>window.KOAAppearance.get().gender),'female');
     assert.equal(await page.evaluate(()=>window.KOAAppearance.get().vocation),'archer');
     const gearResult=await page.evaluate(()=>{
       const w=window.koaGame.scene.getScenes(true)[0], results=[];
       for(const [slot,bit] of [['helmet',2],['armor',1],['shield',4],['sword',8]]){
         w.acquireCommonGear(slot);if(!w[slot])window.koaEquip('gear:'+slot);
         const before=w.visualGear(), keyOn=w.unitTexture('hero','south',0,before,'stance');
         const on=w.textures.get(keyOn).getSourceImage().toDataURL();
         const removed=window.koaEquip('gear:'+slot), after=w.visualGear(),keyOff=w.unitTexture('hero','south',0,after,'stance');
         const off=w.textures.get(keyOff).getSourceImage().toDataURL();
         const owned=w.hasCommonGear(slot),stored=w.storedGear[slot]===true;
         const equipped=window.koaEquip('gear:'+slot);
         results.push({slot,removed,equipped,owned,stored,bitOn:!!(before&bit),bitOff:!(after&bit),pixelsChanged:on!==off,restored:!!(w.visualGear()&bit)});
       }
       return results;
     });
     for(const item of gearResult)for(const k of ['removed','equipped','owned','stored','bitOn','bitOff','pixelsChanged','restored'])assert.equal(item[k],true,item.slot+' '+k);
     await page.locator('#sideGear [data-equip="gear:helmet"]').click();
     await page.waitForFunction(()=>window.koaStats.storedGear.helmet===true&&!(window.koaStats.visualGear&2));
     await page.locator('#tools [data-panel=bag]').click();
     await page.locator('[data-kind=bag] [data-equip="gear:helmet"]').click();
     await page.waitForFunction(()=>!!(window.koaStats.visualGear&2));
     await page.locator('[data-kind=bag] header button').click();
     const addedLayers=await page.evaluate(()=>{
       const w=window.koaGame.scene.getScenes(true)[0], sample=()=>w.textures.get(w.unitTexture('hero','south',0,w.visualGear(),'stance')).getSourceImage().toDataURL();
       return [['clothLegs',512],['leatherBoots',128]].map(([id,bit])=>{if(!w.relicBag.includes(id))w.relicBag.push(id);const before=sample();window.koaEquip(id);const equipped=!!(w.visualGear()&bit),changed=sample()!==before;window.koaEquip(id);return {equipped,changed,removed:!(w.visualGear()&bit)}});
     });
     for(const layer of addedLayers)assert.deepEqual(layer,{equipped:true,changed:true,removed:true});
     assert.equal(await page.locator('#sideGear [data-equip-slot]').count(),7);assert.equal(await page.locator('#sideAvatar').count(),1);
     const beta=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],S=window.KOARelease,C=window.KOACosmetics,m=new Map(),storage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)},old={level:w.level,cosmetics:w.cosmetics};S.write(storage,{level:5});S.write(storage,{level:6});storage.setItem(S.KEY,'broken');const recovered=S.read(storage);w.level=20;w.cosmetics=C.fresh();const before=JSON.stringify(w.gearBonus()),selected=C.command(w,'select','ember'),p=window.KOAAppearance.get(),cv=document.createElement('canvas');cv.width=cv.height=96;const sample=()=>{window.KOAAppearance.paint(cv,C.profile(w,p),'south',0,w.visualGear(),'stance');return cv.toDataURL()};const withSkin=sample();C.command(w,'toggle');const hidden=sample(),same=before===JSON.stringify(w.gearBonus());Object.assign(w,old);window.koaSave();return {recovered:recovered.recovered,level:recovered.value.level,selected,visible:withSkin!==hidden,same,invalid:S.parse('null')===null,restore:S.restore(storage,{format:'koa-offline-backup',version:1,save:{level:8,pos:{x:15,y:15}}})&&S.read(storage).value.level===8}});assert.deepEqual(beta,{recovered:true,level:5,selected:true,visible:true,same:true,invalid:true,restore:true});await page.locator('#moreTools').click();assert.equal(await page.locator('#moreTools').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#tools [data-panel=bag]').isVisible(),true);assert.equal(await page.locator('#tools [data-panel=quests]').isVisible(),false);await page.locator('#moreTools').click();assert.equal(await page.locator('#tools [data-panel=quests]').isVisible(),true);
     const polish=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],old=window.koaLowFX,eco=window.koaBudgetLow;window.koaLowFX=false;window.koaBudgetLow=false;w.impactAt(w.p.x,w.p.y,true,'ice');const n=w.impactMarks.length;w.updateImpacts(.3);window.koaLowFX=true;w.impactAt(w.p.x,w.p.y);const off=w.impactMarks.length;window.koaLowFX=old;window.koaBudgetLow=eco;return {spawned:n>0,expired:off===0}});assert.deepEqual(polish,{spawned:true,expired:true});
     const frontierTest=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],a=window.KOAFrontiers,old={frontiers:w.frontiers,expansion:w.expansion,gold:w.gold,xp:w.xp,level:w.level,hp:w.hp,mana:w.mana,renown:w.renown};w.frontiers=a.fresh();w.expansion=JSON.parse(JSON.stringify(w.expansion));w.expansion.counts['kill:bandido']=5;const accepted=window.koaFrontier('accept','guard'),early=window.koaFrontier('claim','guard');w.expansion.counts['kill:bandido']=11;const claim=window.koaFrontier('claim','guard'),duplicate=window.koaFrontier('claim','guard');const snap=a.snapshot(w),out={sites:snap.sites.length,elites:w.enemies.filter(e=>e.elite).length,chests:w.treasures.length,accepted,early,claim,duplicate,reputation:snap.contracts[0].reputation};Object.assign(w,old);window.koaSave();return out});assert.deepEqual(frontierTest,{sites:12,elites:12,chests:22,accepted:true,early:false,claim:true,duplicate:false,reputation:10});
     const dungeonTest=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],a=window.KOADungeons,old={p:{...w.p},level:w.level,dungeons:w.dungeons,gold:w.gold,xp:w.xp,relicBag:w.relicBag.slice(),combatTime:w.combatTime};w.level=20;w.combatTime=0;w.dungeons=a.fresh();const gate=w.dungeonGates[0];w.p={x:gate.x,y:gate.y};const entered=a.transition(w,gate.id),isolation=w.sameArea(w.enemies.find(e=>e.dungeon===gate.id))&&!w.sameArea(w.enemies.find(e=>e.crypt&&!e.dungeon)),walk=w.walkable(202,202),boss=w.enemies.find(e=>e.dungeon===gate.id&&e.dungeonBoss),reward=a.defeat(w,boss),duplicate=a.defeat(w,boss),exit=a.transition(w,null);const distinct=new Set(a.defs.map(d=>d.layout.join(''))).size,reachable=a.defs.every(d=>{const q=[[2,2]],seen=new Set(['2,2']);for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,k=X+','+Y;if(d.layout[Y]?.[X]==='.'&&!seen.has(k)){seen.add(k);q.push([X,Y])}}}return d.mobs.every(([x,y])=>seen.has(x+','+y))});Object.assign(w,old);w.refreshTerrain();w.refreshGround();window.koaSave();return {entered,isolation,walk,reward,duplicate,exit,distinct,reachable}});assert.deepEqual(dungeonTest,{entered:true,isolation:true,walk:true,reward:true,duplicate:false,exit:true,distinct:3,reachable:true});
     const mountTest=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],a=window.KOAMounts,old={p:{...w.p},level:w.level,gold:w.gold,mounts:w.mounts,riding:w.riding,combatTime:w.combatTime};w.p={x:15,y:15};w.level=20;w.gold=1000;w.combatTime=0;w.mounts=a.fresh();w.riding=null;const base=w.moveSpeed(),buy=window.koaMount('buy','pony'),duplicate=window.koaMount('buy','pony'),ride=window.koaMount('ride','pony'),boost=Math.round((w.moveSpeed()/base-1)*100),art=a.texture(w,a.mounts[0],'south',0)!==a.texture(w,a.mounts[0],'east',1);w.combatTime=5;a.tick(w);const blocked=!w.riding&&w.moveSpeed()===base&&!window.koaMount('ride','pony'),owned=a.clean(w.mounts).owned.length;const res={buy,duplicate,ride,boost,art,blocked,owned,gold:w.gold,towns:a.towns.length};Object.assign(w,old);window.koaSave();return res});assert.deepEqual(mountTest,{buy:true,duplicate:false,ride:true,boost:18,art:true,blocked:true,owned:1,gold:820,towns:3});
     const skillTest=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],a=window.KOACombat18,old={level:w.level,mana:w.mana,hp:w.hp,progress:w.combatProgress,cd:w.abilityCD,guard:w.abilityGuard};w.level=12;w.mana=200;w.combatProgress=a.clean({uses:{evasion:10}});w.abilityCD={};const cost=a.snapshot(w).skills.find(x=>x.id==='evasion').cost,wrong=window.koaAbility('fortify'),used=window.koaAbility('evasion'),blocked=window.koaAbility('evasion'),guard=w.abilityGuard,remaining=w.abilityCD.evasion;const res={total:a.abilities.length,cost,wrong,used,blocked,guard,remaining,uses:w.combatProgress.uses.evasion,ice:a.resist('rei','ice')};Object.assign(w,{level:old.level,mana:old.mana,hp:old.hp,combatProgress:old.progress,abilityCD:old.cd,abilityGuard:old.guard});return res});assert.deepEqual(skillTest,{total:12,cost:21,wrong:false,used:true,blocked:false,guard:6,remaining:18,uses:11,ice:-.2});
     const offensive=await page.evaluate(()=>{const a=window.KOACombat18,old=window.koaLowFX;window.koaLowFX=true;try{const mob={hp:100,kind:'rei',x:5,y:0},w={p:{x:0,y:0},level:12,mana:100,inCrypt:true,inSewer:false,interior:null,relicEquipped:{},cooldown:0,enemies:[mob],vocation:()=> 'archer',weaponKind:()=> 'bow',sameArea:()=>true,clearStrike:()=>true,guardLine:()=>true,isCastle:()=>false};a.init(w);const queued=a.request(w,'frostarrow'),cast=a.take(w),damage=a.strike(w,cast,20);a.tick(w,1);return {queued,damage,mana:w.mana,slow:mob.slowTime,remaining:w.abilityCD.frostarrow,uses:w.combatProgress.uses.frostarrow}}finally{window.koaLowFX=old}});assert.deepEqual(offensive,{queued:true,damage:38,mana:80,slow:4,remaining:8,uses:1});await page.locator('#tools [data-panel=bag]').click();await page.locator('#bagFilter').selectOption('sword');assert.equal(await page.locator('#bagFilter').inputValue(),'sword');await page.locator('#bagFilter').selectOption('all');await page.locator('[data-kind=bag] header button').click();assert.ok(await page.locator('#sideGear img.rasterIcon').count()>0);
     const expansion=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],old={level:w.level,gold:w.gold,wood:w.wood,herbs:w.herbs,xp:w.xp,hp:w.hp,mana:w.mana,expansion:JSON.parse(JSON.stringify(w.expansion)),bag:w.relicBag.slice()};w.level=12;w.gold=1000;w.wood=30;w.herbs=30;let accepted=window.koaExpansion('accept','q1');window.KOAExpansion.record(w,'kill:lobo',3);let claimed=window.koaExpansion('claim','q1'),duplicate=window.koaExpansion('claim','q1');let crafted=window.koaExpansion('craft','ironHelm'),upgraded=window.koaExpansion('upgrade','ironHelm'),talent=window.koaExpansion('talent','precision'),deposit=window.koaExpansion('deposit','bank',50),withdraw=window.koaExpansion('withdraw','bank',50);const snapshot=window.KOAExpansion.snapshot(w),answer={accepted,claimed,duplicate,crafted,upgraded,talent,deposit,withdraw,quests:snapshot.quests.length,recipes:snapshot.recipes.length};Object.assign(w,{...old,relicBag:old.bag});window.koaSave();return answer});assert.deepEqual(expansion,{accepted:true,claimed:true,duplicate:false,crafted:true,upgraded:true,talent:true,deposit:true,withdraw:true,quests:26,recipes:12});
     const creatures=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],out=[];for(const k of ['lobo','boar','bear']){const e=w.enemies.find(e=>e.kind===k),a=window.KOACreatures.texture(w,k,'south',0,'stance'),b=window.KOACreatures.texture(w,k,'west',1,'run');out.push({kind:k,exists:!!e,size:e.g.displayWidth,framesDiffer:w.textures.get(a).getSourceImage().toDataURL()!==w.textures.get(b).getSourceImage().toDataURL()})}return out});
     assert.ok(creatures.every(e=>e.exists&&e.framesDiffer));assert.ok(creatures[0].size<creatures[1].size&&creatures[1].size<creatures[2].size);
     const dungeonArt=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],a=window.KOACreatures;const result=['rato','ratazana','cobra','esqueleto','cavaleiro','rei'].map(k=>{const A=a.dungeonCreature(w,k,'south',0,'stance'),B=a.dungeonCreature(w,k,'west',1,'run'),sample=id=>w.textures.get(id).getSourceImage().toDataURL();return {different:sample(A)!==sample(B),cached:A===a.dungeonCreature(w,k,'south',0,'stance'),image:sample(A)}});return {distinct:new Set(result.map(x=>x.image)).size,animated:result.every(x=>x.different&&x.cached)}});assert.deepEqual(dungeonArt,{distinct:6,animated:true});
     const ranged=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],out=[];for(const [id,kind,bit,mana] of [['trainingBow','bow',1024,0],['ashWand','wand',4096,6],['oakStaff','staff',2048,6]]){if(!w.relicBag.includes(id))w.relicBag.push(id);window.koaEquip(id);out.push({kind:w.weaponKind(),range:w.attackReach(),mana:w.weaponMana(),visible:!!(w.visualGear()&bit)});window.koaEquip(id)}return out});
     assert.deepEqual(ranged,[{kind:'bow',range:5.25,mana:0,visible:true},{kind:'wand',range:5.25,mana:6,visible:true},{kind:'staff',range:5.25,mana:6,visible:true}]);
     assert.equal(await page.locator('#hotbarDetails').evaluate(e=>e.open),false);
     assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('koa-preview-appearance-v1')).skin),'#a86c45');
     console.log('FLARE character and equipment PASS',sprites);
     await page.locator('#quickEditMode').click();
     await page.locator('#quickSlots [data-index="1"]').click();
     await page.locator('#quickAction').selectOption('X');
     await page.locator('#quickApply').click();
     assert.equal(await page.locator('#quickSlots [data-index="1"]').getAttribute('data-action'),'X');
     assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('koa-preview-hotkeys'))[1]),'X');
     await page.locator('#quickEditMode').click();
     await page.locator('#quickSlots [data-index="1"]').click({button:'right'});
     await page.locator('#quickAction').selectOption('U');
     await page.locator('#quickApply').click();
     assert.equal(await page.locator('#quickSlots [data-index="1"]').getAttribute('data-action'),'U');
     console.log('hotkey edit PASS');
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
    assert.equal(await page.evaluate(()=>window.koaStats.interiorName),'Taverna do Corvo');assert.ok(await page.evaluate(()=>window.koaGame.scene.getScenes(true)[0].textures.exists('arch-room-floor-tavern')));
    assert.equal(await page.evaluate(()=>window.koaStats.nearby.length),0);
    await page.waitForTimeout(600);
    await page.keyboard.down('s');
    await page.waitForFunction(()=>window.koaStats?.interior===null,null,{timeout:10000});
    await page.keyboard.up('s');
    assert.equal(await page.evaluate(()=>window.koaSave()),true);
    console.log('interior entry/exit PASS');
    assert.equal(await page.evaluate(()=>window.koaStats.worldSize),192);
    const expanded=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0];w.routeTo({x:148,y:148});const end=w.path.at(-1)||w.goal;w.goal=null;w.path=[];return {end,doors:w.houses.filter(h=>!h.disabled&&w.walkable(h.door.x,h.door.y)).length,active:w.sceneryActive.size,total:w.trees.length}});
    assert.deepEqual(expanded.end,{x:148,y:148});assert.equal(expanded.doors,57,'all 45 original and 12 new building entrances must be accessible');assert.ok(expanded.active<expanded.total/4,'vegetation must be streamed locally');
    await page.locator('#tools [data-panel=worldmap]').click();await page.locator('[data-kind=worldmap]').getByText('192 × 192',{exact:false}).waitFor();
    const north=await page.evaluate(()=>{const w=window.koaGame.scene.getScenes(true)[0],a=window.KOAMounts;return {towns:window.koaStats.towns.length,reachable:a.towns.map(([x,y])=>{w.routeTo({x,y});const end=w.path.at(-1)||w.goal;w.goal=null;w.path=[];return end&&end.x===x&&end.y===y}),doors:w.houses.slice(-12).every(h=>w.walkable(h.door.x,h.door.y)),chests:a.chests.length}});assert.deepEqual(north,{towns:13,reachable:[true,true,true],doors:true,chests:6});console.log('expanded world and streaming PASS',expanded,north);


   }
   if(mode==='eco'){assert.equal(await page.evaluate(()=>window.koaEco),true);assert.equal(await page.evaluate(()=>window.koaPerf.frameLimit),30);assert.equal(await page.evaluate(()=>document.documentElement.dataset.eco),'yes')}
   await page.screenshot({path:'artifacts/'+mode+'.png'});
   assert.deepEqual(errors,[],mode+': browser runtime errors');
   console.log(mode,'PASS',start,end);
   await page.close();
  }
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
