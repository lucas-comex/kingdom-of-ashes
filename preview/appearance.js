/* Original procedural character prototype; no external art. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const defaults={gender:'male',vocation:'warrior',hair:'short',beard:'none',skin:'#c58a68',hairColor:'#38251c',beardColor:'#38251c',hideHelmet:false,showSkin:true,skinId:null};
const choices={gender:['male','female'],vocation:['warrior','archer','sorcerer','druid'],hair:['short','long','tied','shaved'],beard:['none','short','full','goatee']};
const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
function normalize(v){const p={...defaults};for(const k of Object.keys(choices))if(choices[k].includes(v?.[k]))p[k]=v[k];for(const k of ['skin','hairColor','beardColor'])if(color(v?.[k]))p[k]=v[k];for(const k of ['hideHelmet','showSkin'])if(typeof v?.[k]==='boolean')p[k]=v[k];return p}
let profile={...defaults};try{if(!window.koaTestLevel)profile=normalize(JSON.parse(localStorage.getItem('koa-preview-appearance-v1')))}catch{}
const dirs=['south','southwest','west','northwest','north','northeast','east','southeast'];
let angle=0,custom=false;const vocationColors={warrior:['#863e35','#d0aa76'],archer:['#4c6947','#b3ac79'],sorcerer:['#50456f','#b6a1dd'],druid:['#536744','#c4a06a']};
function shade(hex,f){const n=parseInt(hex.slice(1),16);return '#'+[n>>16&255,n>>8&255,n&255].map(c=>Math.min(255,Math.round(c*f)).toString(16).padStart(2,'0')).join('')}
function paint(canvas,p,dir='south',frame=0,gear=0,action='stance'){
 if(window.KOASpritePack?.draw(canvas,p,dir,frame,gear,action))return;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(canvas.width/96,canvas.height/96);
 const theta=(dirs.indexOf(dir)<0?0:dirs.indexOf(dir))*Math.PI/4,co=Math.cos(theta),si=Math.sin(theta),female=p.gender==='female';
 const [base,trim]=p.palette||vocationColors[p.vocation]||vocationColors.warrior,skin=p.skin,hair=p.hairColor,steel=gear&32?'#89938d':'#8997a5',leather='#674c38';
 const walk=action==='run'?Math.sin(frame*Math.PI/4):0,hit=action==='hit'?1:0,bob=Math.abs(walk)*1.1,swing=action==='swing'?Math.sin((frame+1)/4*Math.PI)*1.0:0,cast=action==='cast'||action==='shoot',dead=action==='die';
 const project=([x,y,z])=>({x:48+x*co-z*si,y:82-y*.92+(x*si+z*co)*.40-bob,depth:x*si+z*co});
 const nodes=[];const add=(depth,draw)=>nodes.push({depth,draw});
 function lit(x,y,rx,ry,color,metal=false){const gr=ctx.createLinearGradient(x-rx,y-ry*.6,x+rx,y+ry*.45);gr.addColorStop(0,shade(color,metal?1.65:1.38));gr.addColorStop(.30,shade(color,1.16));gr.addColorStop(.52,color);gr.addColorStop(.76,shade(color,.65));gr.addColorStop(1,shade(color,.42));return gr}
 function orb(pos,rx,ry,col,metal=false,offset=0){const q=project(pos);add(q.depth+offset,()=>{ctx.beginPath();ctx.ellipse(q.x,q.y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=lit(q.x,q.y,rx,ry,col,metal);ctx.fill();if(metal){ctx.strokeStyle=shade(col,1.32);ctx.lineWidth=.42;ctx.stroke()}})}
 function segment(from,to,w1,w2,col,metal=false,offset=0){const q=project(from),v=project(to);add((q.depth+v.depth)/2+offset,()=>{const dx=v.x-q.x,dy=v.y-q.y,len=Math.hypot(dx,dy)||.1,nx=-dy/len,ny=dx/len;
 ctx.beginPath();ctx.moveTo(q.x+nx*w1,q.y+ny*w1);ctx.bezierCurveTo(q.x+nx*w1+dx*.35,q.y+ny*w1+dy*.35,v.x+nx*w2-dx*.15,v.y+ny*w2-dy*.15,v.x+nx*w2,v.y+ny*w2);ctx.quadraticCurveTo(v.x+dx/len*w2,v.y+dy/len*w2,v.x-nx*w2,v.y-ny*w2);ctx.bezierCurveTo(v.x-nx*w2-dx*.2,v.y-ny*w2-dy*.2,q.x-nx*w1+dx*.25,q.y-ny*w1+dy*.25,q.x-nx*w1,q.y-ny*w1);ctx.quadraticCurveTo(q.x-dx/len*w1,q.y-dy/len*w1,q.x+nx*w1,q.y+ny*w1);ctx.fillStyle=lit((q.x+v.x)/2,(q.y+v.y)/2,Math.max(w1,w2)+Math.abs(dx)*.28,Math.max(w1,w2)+Math.abs(dy)*.3,col,metal);ctx.fill();if(metal){ctx.strokeStyle=shade(col,1.25);ctx.lineWidth=.5;ctx.stroke()}})}
 function thread(from,to,col,w=.65,off=0){const q=project(from),v=project(to);add((q.depth+v.depth)/2+off,()=>{ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(v.x,v.y);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke()})}
 const armor=!!(gear&33),helm=!!(gear&2)&&!p.hideHelmet,legs=!!(gear&512),boots=!!(gear&128),shield=!!(gear&68),weapon=!!(gear&8),bow=!!(gear&1024),staff=!!(gear&2048),wand=!!(gear&4096),blade=gear&16?'#be9360':'#b8c5ca',back=co<-.35;
 const shoulder=female?9.3:11.0,hip=female?7.0:6.5,waist=female?5.6:7.0, torso=armor?steel:base;
 // Soft ground contact and proportional anatomy (head about one seventh of height).
 ctx.fillStyle='#10141144';ctx.beginPath();ctx.ellipse(48,82,15,4,0,0,Math.PI*2);ctx.fill();
 if(dead){ctx.translate(48,82);ctx.rotate(Math.min(1,frame/5)*1.40);ctx.translate(-48,-82)}
 for(const s of [-1,1]){
  const stride=walk*s*6.5,hipP=[s*hip*.58,35,0],knee=[s*hip*.63,19,stride*.7],ankle=[s*hip*.67,5,stride],toe=[s*hip*.67,2,stride+3.5];
  segment(hipP,knee,4.1,3.1,legs?steel:shade(base,.74),legs);orb(knee,3.6,3.8,legs?steel:shade(base,.8),legs,.2);
  segment(knee,ankle,2.9,2.25,legs?steel:shade(base,.72),legs);
  segment([ankle[0],10,ankle[2]],ankle,boots?3.3:2.5,boots?2.8:2.3,boots?leather:shade(base,.54));
  segment(ankle,toe,2.9,2.7,boots?shade(leather,.7):'#3c3832');if(boots)thread([ankle[0]-2,10,ankle[2]+2],[ankle[0]+2,10,ankle[2]+2],trim,.8,.5);
 }
 orb([0,34,0],hip+1,5.5,torso,armor);
 segment([0,34,0],[0,47,0],waist,shoulder*.86,torso,armor);
 orb([0,47,0],shoulder*.96,8.5,torso,armor);
 if(armor){for(let j=0;j<4;j++)thread([-waist,36+j*2,3.2],[waist,36+j*2,3.2],shade(steel,.58),.62,.3);
  thread([-shoulder*.8,47,4],[0,42,5],shade(steel,1.5),.8,.4);thread([0,42,5],[shoulder*.8,47,4],shade(steel,1.25),.8,.4);
 }else{for(let j=-2;j<=2;j++)thread([j*2,46,3.2],[j*1.5,36,3.2],shade(base,j%2?.65:1.2),.65,.25)}
 segment([-waist-1,35,0],[waist+1,35,0],1.65,1.65,leather,false,1.5);orb([0,35,4],2,1.6,trim,true,.65);
 if(p.vocation==='sorcerer'||p.vocation==='druid'||p.npcMantle){segment([0,48,-3],[0,13,-4-walk],shoulder*.83,hip+2,shade(base,.67),false,-.3);thread([-hip,14,-4],[hip,14,-4],trim,.8,-.25)}
 const hands=[];
 for(const s of [-1,1]){const w=walk*s*4,raising=s===1?swing*11:cast?4:0,upper=[s*shoulder,49,0],elbow=[s*(shoulder+1.1),39,w+raising*.35],hand=[s*(shoulder+1.5),30+raising,w+raising*.8+2];
  segment(upper,elbow,3.8,2.65,armor?steel:base,armor);orb(upper,armor?5:4.1,armor?4.6:4.5,torso,armor,.1);
  segment(elbow,hand,2.65,2.1,armor?steel:shade(base,.9),armor);orb(hand,2.05,2.6,skin,false,.35);hands.push(hand);
 }
 segment([0,53,0],[0,58,0],2.8,2.8,skin);orb([0,63,0],5.1,7,skin);
 // Hair, ears, face and metal helmet are individual layers.
 if(!helm&&(p.hair==='long'||p.hair==='tied'))segment([0,65,-2.3],[0,p.hair==='long'?45:53,-4.0],5.0,p.hair==='long'?4.0:2.3,hair,false,-.5);
 orb([-4.5,62,0],1.15,2,skin);orb([4.5,62,0],1.15,2,skin);
 if(p.hair!=='shaved'&&!helm){orb([0,66,-.5],5.5,4.7,hair,false,.2);for(let j=-2;j<=2;j++)thread([j*1.65,69,0],[j*1.7,64,-2],shade(hair,j%2?1.32:.7),.5,.2)}
 if(!back&&!helm){for(const s of [-1,1]){thread([s*1.2,64,4.2],[s*3.15,64,3.9],'#392b27',.62,.6);orb([s*2.1,63.6,4.35],.55,.45,'#292b28',false,.7)}
  segment([0,63,4.2],[0,61.2,5.1],.65,.65,shade(skin,1.12),false,.9);thread([-1.6,59.9,3.9],[1.6,59.9,3.9],shade(skin,.65),.52,.8);
  if(p.beard!=='none'){const len=p.beard==='full'?4:p.beard==='goatee'?3:1.5;segment([0,60,3.3],[0,60-len,2.8],p.beard==='goatee'?1.8:3.7,1.9,p.beardColor,false,.7)}
 }
 if(helm){orb([0,65,0],6.4,6.5,steel,true,.15);segment([-5,65,2],[5,65,2],1.1,1.1,shade(steel,.52),true,.6);segment([0,69,2.5],[0,59,3.2],1.05,.8,steel,true,.8)}
 if(weapon){const hand=hands[1],tip=[hand[0]+3+swing*8,hand[1]+29-swing*7,hand[2]+4+swing*5];
  if(bow){const q=project(hand),top=project([hand[0],hand[1]+16,hand[2]+5]),bottom=project([hand[0],hand[1]-15,hand[2]+5]);add(q.depth+.3,()=>{ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.quadraticCurveTo(q.x+8,q.y,bottom.x,bottom.y);ctx.strokeStyle='#ad8152';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.lineTo(bottom.x,bottom.y);ctx.strokeStyle='#d8c8a4';ctx.lineWidth=.65;ctx.stroke()})}
  else if(staff||wand){const top=[hand[0]+2,hand[1]+(wand?13:31),hand[2]+2];segment([hand[0]-1,wand?hand[1]-4:4,hand[2]],top,1.5,1.1,'#8b6540',false,.05);orb(top,wand?2.5:3.2,3.1,staff?'#82b779':'#a495e2',true,.25)}
  else{segment(hand,tip,1.8,.2,blade,true,.1);thread(hand,tip,'#ede7cd',.55,.3);segment([hand[0]-3,hand[1]+2,hand[2]],[hand[0]+3,hand[1]+2,hand[2]],1.2,1.2,trim,true,.3);segment([hand[0],hand[1]-4,hand[2]],hand,1.1,1.1,leather,false,.4)}
 }
 if(shield){const hand=hands[0];orb([hand[0],hand[1]+3,hand[2]+2],6.3,9.0,steel,true,.7);orb([hand[0],hand[1]+3,hand[2]+3],1.9,2.1,trim,true,.9)}
 if(gear&256){const hand=hands[1];orb([hand[0]+1,hand[1],hand[2]+1],1,.85,trim,true,.8)}
 if(p.apron){segment([0,44,4.4],[0,18,4.6],waist+1,hip+1,p.apron,false,.8);thread([-hip,20,4.7],[hip,20,4.7],shade(p.apron,1.3),.7,1)}
 nodes.sort((a,b)=>a.depth-b.depth).forEach(n=>n.draw());if(hit){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#c43c3a26';ctx.fillRect(20,10,56,73)}
 ctx.restore();
}
function textureFor(scene,p,dir,frame,gear,action,prefix){action=action||'stance';if(action==='stance'||action==='hit')frame=0;const key=prefix+'-'+(!p.npc?window.KOASpritePack?.revision||0:0)+'-'+[p.gender,p.vocation,p.hair,p.beard,p.skin,p.hairColor,p.beardColor,p.hideHelmet,dir,frame,gear&8191,action||'stance'].join('-');if(scene.textures.exists(key))return key;const cv=document.createElement('canvas');cv.width=cv.height=96;if(p.npc||window.koaEco||window.KOASpritePack?.active){paint(cv,p,dir,frame,gear,action)}else{const high=document.createElement('canvas');high.width=high.height=192;paint(high,p,dir,frame,gear,action);const ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(high,0,0,96,96)}scene.textures.addCanvas(key,cv);return key}
const npcPalettes=[['#624b38','#baa179'],['#40534c','#b9a47e'],['#6b4e48','#c2a681'],['#4e4b66','#c4b39c'],['#736340','#ddc8a5'],['#63594e','#c3b09a']];
function npcTexture(scene,n,dir,frame,gear=0){const role=n.role||'civilian',label=(n.job||'')+' '+n.name,seed=[...label+' '+(n.anchor?.x??n.home?.x??n.x??0)+' '+(n.anchor?.y??n.home?.y??n.y??0)].reduce((v,ch)=>(v*31+ch.charCodeAt(0))>>>0,0);
 const job=label.toLowerCase(),smith=/ferreir|armeir/.test(job),baker=/padeir/.test(job),priest=/sacerd|curande/.test(job),merchant=/mercador|mercante/.test(job);
 const p={...defaults,npc:true,gender:/curandeira|sacerdotisa|aldeã|costureira|padeira/.test(job)||(!smith&&!baker&&!merchant&&role==='civilian'&&seed%2===0)?'female':'male',hair:['short','long','tied','shaved'][seed%4],beard:'none',skin:['#bc855e','#d3a184','#855b43','#e1b39a'][seed%4],hairColor:['#3b2d25','#57402b','#ad8756','#aaa39b'][seed%4],palette:smith?['#514538','#a98b66']:baker?['#aa9471','#e5d4ae']:priest?['#57496a','#c7b9d6']:npcPalettes[seed%npcPalettes.length],npcMantle:priest||role==='elder'||role==='king',apron:smith?'#513a27':baker?'#d3c5a7':merchant?'#74543a':null};
 if(p.gender==='male')p.beard=role==='elder'?'full':['none','short','full','goatee'][seed%4];p.beardColor=p.hairColor;
 return textureFor(scene,p,dir,frame,gear|128,frame===4?'swing':frame?'run':'stance','koa-npc-'+seed);
}
const ids={gender:'appearanceGender',vocation:'appearanceClass',hair:'appearanceHair',beard:'appearanceBeard',skin:'appearanceSkin',hairColor:'appearanceHairColor',beardColor:'appearanceBeardColor',hideHelmet:'appearanceHideHelmet',showSkin:'appearanceShowSkin'};
function read(){return normalize(Object.fromEntries(Object.entries(ids).map(([k,id])=>[k,$(id).type==='checkbox'?$(id).checked:$(id).value])))}
function redraw(){const p=read();paint($('appearancePreview'),p,dirs[angle],0,$('appearanceArmor').checked?655|(p.vocation==='archer'?1024:p.vocation==='druid'?2048:p.vocation==='sorcerer'?4096:0):0)}
function commit(){if(custom){profile=read();try{if(!window.koaTestLevel)localStorage.setItem('koa-preview-appearance-v1',JSON.stringify(profile))}catch{}}return profile}
function texture(scene,dir,frame,gear,action){return textureFor(scene,profile,dir,frame,gear,action,'koa-original-v2')}
for(const [k,id] of Object.entries(ids)){const el=$(id);if(el.type==='checkbox')el.checked=profile[k];else el.value=profile[k];el.addEventListener('input',()=>{custom=true;redraw()})}
$('appearanceArmor').addEventListener('input',redraw);$('turnPreview').onclick=()=>{angle=(angle+1)%8;redraw()};
$('openCreator').onclick=()=>{custom=true;$('creatorPanel').hidden=!$('creatorPanel').hidden;$('openCreator').textContent=$('creatorPanel').hidden?'PERSONALIZAR PERSONAGEM':'RECOLHER PERSONALIZAÇÃO';redraw()};
$('loginTab').onclick=()=>{$('loginTab').setAttribute('aria-pressed','true');$('registerTab').setAttribute('aria-pressed','false');$('accountNote').textContent='Contas online ainda não estão disponíveis. Nenhuma senha será coletada nesta versão.'};
$('registerTab').onclick=()=>{$('loginTab').setAttribute('aria-pressed','false');$('registerTab').setAttribute('aria-pressed','true');$('accountNote').textContent='Cadastro online em desenvolvimento. Por enquanto, crie seu personagem e jogue como visitante.';if($('creatorPanel').hidden)$('openCreator').click()};
window.KOAAppearance={paint,normalize,get:()=>({...profile}),commit,texture,npcTexture,dirs};window.addEventListener('koa-spritepack-changed',redraw);redraw();
})();
