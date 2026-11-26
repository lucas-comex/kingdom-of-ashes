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
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/96,canvas.height/96);
 const d=dirs.indexOf(dir),back=d===3||d===4||d===5,side=d===2||d===6,flip=d>0&&d<4?-1:1,turn=side?5:d%2?3:0;
 const female=p.gender==='female', [cloth,trim]=vocationColors[p.vocation],armor=!!(gear&33),helm=!!(gear&2)&&!p.hideHelmet,weapon=!!(gear&8),shield=!!(gear&68);
 const walk=action==='run'?Math.sin(frame*Math.PI/4):0,bob=action==='run'?Math.abs(walk)*1.5:0,swing=action==='swing'?(frame/3)*9:0;
 const skin=p.skin,hair=p.hairColor,beard=p.beardColor,shoulders=female?10:13,waist=female?7:10;
 function ellipse(x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.65;c.stroke()}}
 function path(points,fill,stroke='#222027',lw=.75){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
 function line(points,col,w){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke()}
 function gradient(x,y,w,h,colors){let g=c.createLinearGradient(x,y,x+w,y+h);colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g}
 const leather=gradient(-8,0,17,12,['#866447','#4b3326','#2c2522']),steel=gradient(-12,-5,25,15,['#343a41','#c7ced0','#727d86','#353b45']),fabric=gradient(-12,-7,24,17,[shade(cloth,1.35),cloth,shade(cloth,.55)]),flesh=gradient(-7,-6,14,9,[shade(skin,1.17),skin,shade(skin,.72)]);
 ellipse(48,82,17,4,'#0b0d0e55');c.translate(48,82-bob);c.scale(flip,1);if(action==='die'){c.rotate(Math.min(1,frame/5)*1.42);c.translate(-frame*1.2,0)}
 if(p.hair==='long'||p.hair==='tied')path([[-6,-60],[5,-62],[9,-44],[5,-33],[-4,-35],[-9,-45]],gradient(-8,-60,16,20,[shade(hair,1.4),hair,shade(hair,.6)]));
 if(p.vocation==='sorcerer'||p.vocation==='druid'||p.vocation==='archer')path([[-shoulders,-48],[shoulders,-48],[shoulders+3,-9],[2,-5],[-shoulders-3,-10]],gradient(-12,-40,24,30,[shade(cloth,.55),cloth,shade(cloth,.52)]));
 for(const s of [-1,1]){const lx=s*(side?3:5),k=walk*s*6,foot=k+turn*.3;
 path([[lx-4,-27],[lx+4,-27],[lx+3+k*.35,-13],[lx+3+foot,-3],[lx-4+foot,-3],[lx-3+k*.35,-14]],armor?steel:leather);
 path([[lx-4+foot,-8],[lx+4+foot,-8],[lx+5+foot,0],[lx-5+foot,0],[lx-6+foot,-3]],leather);line([[lx-4+foot,-1],[lx+4+foot,-1]],'#b08b5d',.7)}
 if(p.vocation==='sorcerer'||p.vocation==='druid')path([[-waist,-30],[waist,-30],[waist+5,-13],[2,-8],[-waist-5,-13]],fabric);
 for(const s of [-1,1]){const x=s*shoulders*.85,y=-47,arm=walk*s*5+(s===1?swing:0);
 path([[x-4,y-1],[x+4,y],[x+s*3+arm,-32],[x+s*2+arm,-25],[x-s*3+arm,-26],[x-s*2+arm,-34]],armor?steel:fabric);ellipse(x+s*2+arm,-25,3.1,3.8,flesh,'#403129');if(armor)ellipse(x,y+1,6,5,steel,'#333b42')}
 path([[-shoulders,-49],[-5,-53],[5,-53],[shoulders,-49],[waist,-32],[waist+2,-27],[-waist-2,-27],[-waist,-32]],armor?steel:fabric);
 if(back){path([[-shoulders,-49],[shoulders,-49],[waist+4,-28],[-waist-4,-28]],fabric);line([[-6,-49],[0,-30],[6,-49]],trim,1.2)}else{line([[-shoulders+2,-47],[0,-38],[shoulders-2,-47]],armor?'#dee4e5':trim,1.15);line([[0,-47],[0,-31]],armor?'#454e55':shade(cloth,.57),1);if(female&&!armor){line([[-8,-42],[-4,-39],[0,-40],[4,-39],[8,-42]],shade(cloth,1.4),.8)}}
 path([[-waist-2,-33],[waist+2,-33],[waist+2,-29],[-waist-2,-29]],leather);ellipse(0,-31,2.7,1.9,trim,'#5b4933');
 path([[-3,-53],[-3,-58],[3,-58],[3,-53]],flesh);
 const hx=side?turn:turn*.5;ellipse(hx,-63,7.5,9.5,flesh,'#513e36');
 if(!back){ellipse(hx-4,-64,.9,.55,'#30282a');if(!side)ellipse(hx+3,-64,.9,.55,'#30282a');line([[hx+1,-63],[hx+2,-61]],shade(skin,.78),.8);line([[hx-1,-58],[hx+2,-58]],'#704b44',.65);
 if(p.beard!=='none'){let ext=p.beard==='full'?4:p.beard==='goatee'?3:1.5;path([[hx-5,-60],[hx-2,-57],[hx+3,-57],[hx+5,-60],[hx+4,-56],[hx,-55-ext],[hx-4,-56]],beard)}}
 if(p.hair!=='shaved'||back){path([[hx-8,-65],[hx-8,-70],[hx-3,-74],[hx+5,-73],[hx+8,-69],[hx+7,-63],[hx+3,-69],[hx-2,-66],[hx-5,-64]],gradient(hx-8,-74,16,10,[shade(hair,1.65),hair,shade(hair,.65)]));if(back||p.hair==='long')path([[hx-7,-69],[hx+7,-69],[hx+7,-55],[hx+2,-52],[hx-7,-55]],hair);if(p.hair==='tied')ellipse(hx+6,-69,4,4,hair,'#302421')}
 if(helm){path([[hx-9,-65],[hx-8,-72],[hx,-76],[hx+8,-72],[hx+9,-65],[hx+6,-58],[hx+4,-65],[hx-4,-65],[hx-6,-58]],steel);line([[hx,-75],[hx,-66]],'#e6e3cf',1)}
 const hand=shoulders+2+swing;
 if(p.vocation==='warrior'){if(weapon){line([[hand,-28],[hand+8,-54-swing]],'#282b30',5);line([[hand,-28],[hand+8,-54-swing]],'#c4c8c5',3);line([[hand-3,-30],[hand+5,-28]],trim,2)}}
 if(weapon&&p.vocation==='archer'){c.strokeStyle='#a78454';c.lineWidth=2.2;c.beginPath();c.moveTo(-hand,-55);c.quadraticCurveTo(-hand-12,-38,-hand,-18);c.stroke();line([[-hand,-55],[-hand,-18]],'#dbcaab',.65)}
 if(weapon&&(p.vocation==='sorcerer'||p.vocation==='druid')){line([[hand,-3],[hand+3,-62]],'#6d5136',2.8);ellipse(hand+3,-64,3.1,4,p.vocation==='druid'?'#9ba962':'#9b85c4','#e0cfac')}
 if(shield){path([[-shoulders-9,-40],[-shoulders+5,-40],[-shoulders+4,-29],[-shoulders-2,-24],[-shoulders-8,-29]],steel);line([[-shoulders-2,-38],[-shoulders-2,-28]],trim,1.1)}
 c.restore();
}
const ids={gender:'appearanceGender',vocation:'appearanceClass',hair:'appearanceHair',beard:'appearanceBeard',skin:'appearanceSkin',hairColor:'appearanceHairColor',beardColor:'appearanceBeardColor',hideHelmet:'appearanceHideHelmet',showSkin:'appearanceShowSkin'};
function read(){return normalize(Object.fromEntries(Object.entries(ids).map(([k,id])=>[k,$(id).type==='checkbox'?$(id).checked:$(id).value])))}
function redraw(){const p=read();paint($('appearancePreview'),p,dirs[angle],0,$('appearanceArmor').checked?15:0)}
function commit(){if(custom){profile=read();try{if(!window.koaTestLevel)localStorage.setItem('koa-preview-appearance-v1',JSON.stringify(profile))}catch{}}return profile}
function texture(scene,dir,frame,gear,action){const p=profile,key='koa-original-'+[p.gender,p.vocation,p.hair,p.beard,p.skin,p.hairColor,p.beardColor,p.hideHelmet,dir,frame,gear&111,action||'stance'].join('-');if(scene.textures.exists(key))return key;const cv=document.createElement('canvas');cv.width=cv.height=96;paint(cv,p,dir,frame,gear,action);scene.textures.addCanvas(key,cv);return key}
for(const [k,id] of Object.entries(ids)){const el=$(id);if(el.type==='checkbox')el.checked=profile[k];else el.value=profile[k];el.addEventListener('input',()=>{custom=true;redraw()})}
$('appearanceArmor').addEventListener('input',redraw);$('turnPreview').onclick=()=>{angle=(angle+1)%8;redraw()};
$('openCreator').onclick=()=>{custom=true;$('creatorPanel').hidden=!$('creatorPanel').hidden;$('openCreator').textContent=$('creatorPanel').hidden?'PERSONALIZAR PERSONAGEM':'RECOLHER PERSONALIZAÇÃO';redraw()};
$('loginTab').onclick=()=>{$('loginTab').setAttribute('aria-pressed','true');$('registerTab').setAttribute('aria-pressed','false');$('accountNote').textContent='Contas online ainda não estão disponíveis. Nenhuma senha será coletada nesta versão.'};
$('registerTab').onclick=()=>{$('loginTab').setAttribute('aria-pressed','false');$('registerTab').setAttribute('aria-pressed','true');$('accountNote').textContent='Cadastro online em desenvolvimento. Por enquanto, crie seu personagem e jogue como visitante.';if($('creatorPanel').hidden)$('openCreator').click()};
window.KOAAppearance={paint,normalize,get:()=>({...profile}),commit,texture,dirs};redraw();
})();
