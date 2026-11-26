/* Original creature sprites: depth-sorted articulated silhouettes, cached per species and direction. */
(()=>{'use strict';
const directions=['south','southwest','west','northwest','north','northeast','east','southeast'];
const species={lobo:{fur:'#767c70',dark:'#3e443f',body:15,head:7,height:21,size:82,hp:0},boar:{fur:'#6a4b36',dark:'#302b27',body:18,head:8,height:19,size:90},bear:{fur:'#66503e',dark:'#352b27',body:20,head:9,height:31,size:112}};
function paint(canvas,kind,dir,frame,state,variant){const c=canvas.getContext('2d'),p=species[kind],theta=Math.max(0,directions.indexOf(dir))*Math.PI/4,co=Math.cos(theta),si=Math.sin(theta),walk=state==='run'?Math.sin(frame*Math.PI/2):0,lunge=state==='attack'?Math.sin((frame+1)*Math.PI/4)*4:0,fur=variant&&kind==='lobo'?'#444c4b':p.fur,parts=[];
c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/96,canvas.height/96);
function P(x,y,z){return {x:48+x*co+z*si,y:78-y*.91+(z*co-x*si)*.42,d:z*co-x*si}}
function color(hex,k){const n=parseInt(hex.slice(1),16);return '#'+[n>>16&255,n>>8&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*k))).toString(16).padStart(2,'0')).join('')}
function ell(q,rx,ry,col,off=0){parts.push({d:q.d+off,draw(){const gr=c.createRadialGradient(q.x-rx*.35,q.y-ry*.45,0,q.x,q.y,Math.max(rx,ry));gr.addColorStop(0,color(col,1.37));gr.addColorStop(.6,col);gr.addColorStop(1,color(col,.55));c.fillStyle=gr;c.beginPath();c.ellipse(q.x,q.y,rx,ry,0,0,Math.PI*2);c.fill();if(rx>=6&&ry>=4){c.save();c.clip();for(let j=0;j<Math.round(rx*ry*1.4);j++){const n=(Math.imul(j+19,2654435761)>>>0)/4294967296,m=(Math.imul(j+37,1597334677)>>>0)/4294967296,x=q.x+(n*2-1)*rx,y=q.y+(m*2-1)*ry;c.strokeStyle=color(col,j%3?1.18:.63);c.globalAlpha=.24;c.lineWidth=.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+1.2,y+.8);c.stroke()}c.restore()}}})}
function limb(q,v,w,col,off=0){parts.push({d:(q.d+v.d)/2+off,draw(){const gr=c.createLinearGradient(q.x-w,q.y,v.x+w,v.y);gr.addColorStop(0,color(col,1.2));gr.addColorStop(1,color(col,.65));c.lineCap='round';c.lineWidth=w;c.strokeStyle=gr;c.beginPath();c.moveTo(q.x,q.y);c.lineTo(v.x,v.y);c.stroke()}})}
const H=p.height,tail=P(0,H-4,-p.body-5),back=P(0,H*.65,-p.body*.62),front=P(0,H*.77,p.body*.60),head=P(0,H*.85,p.body*.87+lunge),nose=P(0,H*.65,p.body*1.28+lunge);
c.fillStyle='#151a1455';c.beginPath();c.ellipse(48,78,kind==='bear'?23:20,7,0,0,Math.PI*2);c.fill();
for(const x of [-1,1])for(const z of [-1,1]){const z0=z*p.body*.67,step=walk*x*z*5,hip=P(x*(kind==='bear'?8:5),H*.63,z0),knee=P(x*5,H*.26,z0+step*.55),foot=P(x*6,2,z0+step);limb(hip,knee,kind==='bear'?7:4.5,fur);limb(knee,foot,kind==='bear'?5:3.1,p.dark);ell(foot,kind==='bear'?3.8:2.8,2.1,p.dark,.1)}
limb(back,front,p.body*(kind==='bear'?1.23:1.03),fur);ell(back,kind==='bear'?13:10,H*.35,fur);ell(front,kind==='bear'?15:11,H*.39,fur);
limb(front,head,kind==='bear'?15:10,fur,.4);ell(head,p.head,H*.31,fur,.7);limb(head,nose,kind==='boar'?8:6,p.dark,.9);ell(nose,kind==='boar'?4:2.8,2.4,'#282523',1);
for(const x of [-1,1]){const ear=P(x*p.head*.64,H*1.12,p.body*.79+lunge);ell(ear,kind==='bear'?3.2:2.4,kind==='bear'?3:5,fur,.4);const eye=P(x*p.head*.65,H*.88,p.body*1.10+lunge);ell(eye,1.1,1.0,kind==='lobo'?'#dda960':'#d9a17c',2);if(kind==='boar'){const root=P(x*4,H*.55,p.body*1.20+lunge),tip=P(x*6,H*.71,p.body*1.42+lunge);limb(root,tip,1.7,'#e0cfaa',1.6)}}
if(kind==='lobo')limb(back,tail,5,fur,-.5);if(kind==='boar')limb(back,P(0,H*.85,-p.body-6),2,p.dark,-.2);
parts.sort((a,b)=>a.d-b.d).forEach(v=>v.draw());c.restore()}
function texture(scene,kind,dir,frame,state='stance',variant=0){if(state==='stance')frame=0;const key='koa-creature-'+kind+'-'+dir+'-'+frame+'-'+state+'-'+variant;if(scene.textures.exists(key))return key;const cv=document.createElement('canvas');cv.width=cv.height=96;paint(cv,kind,dir,frame,state,variant);scene.textures.addCanvas(key,cv);return key}
const sizes={lobo:82,boar:90,bear:112,bandido:96,esqueleto:96,cavaleiro:110,'guardião':128,rei:140};
// Separate raster families for dungeon creatures and undead, with cached directional frames.
function dungeonCreature(scene,kind,dir,frame,state='stance',variant=0){
 if(state==='stance')frame=0;frame=Math.abs(frame|0)%4;const key=['koa-dungeon',kind,dir,frame,state,variant].join('-');if(scene.textures.exists(key))return key;
 const cv=document.createElement('canvas');cv.width=cv.height=96;const c=cv.getContext('2d'),a=Math.max(0,directions.indexOf(dir))*Math.PI/4,co=Math.cos(a),si=Math.sin(a),walk=state==='run'?Math.sin(frame*Math.PI/2):0,attack=state==='attack'?Math.sin((frame+1)*Math.PI/5):0;
 const P=(x,y,z)=>[48+x*co+z*si,78-y*.88+(z*co-x*si)*.40,z*co-x*si];
 const parts=[];function stroke(A,B,w,col,shine,off=0){const q=P(...A),v=P(...B);parts.push({d:(q[2]+v[2])/2+off,draw:()=>{const gr=c.createLinearGradient(q[0]-w,q[1],v[0]+w,v[1]);gr.addColorStop(0,shine);gr.addColorStop(.55,col);gr.addColorStop(1,'#393e35');c.lineWidth=w;c.lineCap='round';c.strokeStyle=gr;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(v[0],v[1]);c.stroke()}})}
 function orb(pos,rx,ry,col,light,dark,off=0){const q=P(...pos);parts.push({d:q[2]+off,draw:()=>{const gr=c.createRadialGradient(q[0]-rx*.35,q[1]-ry*.4,0,q[0],q[1],Math.max(rx,ry)*1.2);gr.addColorStop(0,light);gr.addColorStop(.55,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.beginPath();c.ellipse(q[0],q[1],rx,ry,0,0,Math.PI*2);c.fill()}})}
 c.fillStyle='#171b1555';c.beginPath();c.ellipse(48,78,18,5,0,0,Math.PI*2);c.fill();
 if(kind==='cobra'){
  for(let j=0;j<19;j++){const z=-22+j*2.5,x=Math.sin(j*.63+frame*.7)*(j<12?7:3),y=j<12?2:2+(j-11)*2+attack*2;orb([x,y,z],j<5?1.7+j*.38:4,3,'#65734a','#a0a977','#303c2c',j*.03);if(j%2===0)orb([x,y+1,z],2.5,1.5,'#899065','#b4b586','#455337',.3)}
  const x=Math.sin(18*.63+frame*.7)*3,y=18+attack*2;orb([x,y,23],7,8,'#6d7950','#b3b780','#374331',.1);orb([x,y+2,27],4,3,'#8a9460','#bec28d','#435139',.5);for(const k of [-1,1])orb([x+k*2.6,y+3,29],.9,1,'#d9b15d','#fff1a0','#282c21',1);
 }else if(kind==='rato'||kind==='ratazana'){
  const big=kind==='ratazana',H=big?15:11,bigW=big?11:8,fur=big?'#62534a':'#777468';
  for(let j=0;j<13;j++)stroke([Math.sin(j*.6+frame*.4)*4,2,-12-j*1.6],[Math.sin((j+1)*.6+frame*.4)*4,2,-14-j*1.6],2-j*.095,'#92756a','#c5a293',-.2);
  for(const k of [-1,1])for(const z of [-1,1])stroke([k*4,H*.6,z*8],[k*7,2,z*9+walk*k*z*4],2.5,fur,'#aaa08c');
  orb([0,H*.65,-4],bigW,H*.63,fur,'#b0a48c','#393d36');orb([0,H*.72,8],bigW*.72,H*.48,fur,'#aca18b','#3b3933',.2);orb([0,H*.65,16+attack*3],4.3,3.5,'#7b6a5c','#b0a08c','#433c34',.4);
  for(const k of [-1,1]){orb([k*4,H+1,8],3,3.6,'#aa8276','#ccb29b','#5e514a',.4);orb([k*3,H*.78,15],1,1,'#292b24','#e3c5a4','#1c211b',1)}
 }else{
  const bone='#a7a18d',light='#e3d9b8',armored=kind!=='esqueleto'||variant,king=kind==='rei';
  for(const k of [-1,1]){const z=walk*k*6;stroke([k*4,34,0],[k*5,18,z*.5],4,bone,light);stroke([k*5,18,z*.5],[k*5,3,z],3,bone,light);stroke([k*5,3,z],[k*5,2,z+4],3,bone,light);orb([k*5,18,z*.5],2.8,2.4,bone,light,'#595e51',.2)}
  stroke([0,34,0],[0,54,0],3.6,bone,light);orb([0,34,0],7,4,bone,light,'#585e51');
  for(let j=0;j<5;j++){const y=40+j*2.5,w=8-j*.45;for(const k of [-1,1]){stroke([0,y+1,0],[k*w,y,1.7],2,bone,light,.3);stroke([k*w,y,1.7],[k*2,y-2,4],1.9,bone,light,.4)}}
  if(armored){orb([0,46,0],10,11,'#666d68','#a9a58f','#333a37',.5);for(let j=0;j<3;j++)stroke([-7,38+j*3,4],[7,38+j*3,4],1.4,'#646c67','#a7a18c',.6);if(king){stroke([0,48,-4],[0,13,-5],19,'#543329','#8f5640',-1);stroke([-8,46,-4],[-8,19,-5],1.5,'#b79551','#d5be7a',-.6)}}
  for(const k of [-1,1]){const y=k===1?attack*12:0;stroke([k*10,49,0],[k*13,39,walk*k*3],armored?5:3,bone,armored?'#a6aaa0':light);stroke([k*13,39,walk*k*3],[k*13,29+y,3+y*.4],armored?4:2.8,bone,light);orb([k*13,29+y,3+y*.4],2.5,2.7,bone,light,'#626253');if(armored)orb([k*10,49,0],5.6,5.5,'#686f69','#b5b6a4','#3b4440',.5)}
  orb([0,62,0],5.8,7.4,bone,light,'#676b5c',.2);if(co>-.4){for(const k of [-1,1])orb([k*2.2,63,4.6],1.5,1.9,'#292e29','#43463b','#161e1b',1);stroke([-3,58,3.8],[3,58,3.8],1.3,'#5d6050','#c0b99c',.8)}
  if(king){stroke([-5,68,0],[5,68,0],3,'#957b43','#dec282',.6);for(const k of [-1,0,1])stroke([k*4,68,0],[k*4,72+Math.abs(k)*-1,0],1.7,'#a99050','#e1c477',.7)}
  const y=29+attack*12,z=3+attack*4.8;stroke([13,y,z],[16,y+28,z+3],king?4:2.8,'#a4aba2','#e0dac0',.2);stroke([9,y+2,z],[17,y+2,z],2.4,'#8f7849','#cfb681',.4);
  if(armored)orb([-13,34,5],king?8:6.5,king?11:9,'#535c59','#a7a99a','#293530',.8);
 }
 parts.sort((x,y)=>x.d-y.d).forEach(p=>p.draw());scene.textures.addCanvas(key,cv);return key
}
function bossTexture(scene,kind,source,dir,frame){const key=['koa-boss',kind,source,dir,frame].join('-');if(scene.textures.exists(key))return key;const cv=document.createElement('canvas');cv.width=cv.height=96;const c=cv.getContext('2d');c.drawImage(scene.textures.get(source).getSourceImage(),0,0,96,96);c.save();c.globalCompositeOperation='source-atop';c.fillStyle=kind==='guardião'?'#495d622b':'#65503d22';c.fillRect(25,18,46,64);c.restore();const back=['north','northwest','northeast'].includes(dir);if(back){const gr=c.createLinearGradient(35,30,63,70);gr.addColorStop(0,'#816346');gr.addColorStop(1,'#342b25');c.fillStyle=gr;c.beginPath();c.moveTo(39,32);c.lineTo(57,32);c.lineTo(63,70);c.quadraticCurveTo(49,76,34,70);c.closePath();c.fill();c.strokeStyle='#b3a078';c.lineWidth=.7;c.stroke()}else{c.strokeStyle='#b4a278';c.lineWidth=1.1;c.beginPath();c.moveTo(39,32);c.lineTo(48,44);c.lineTo(57,32);c.stroke()}scene.textures.addCanvas(key,cv);return key}
window.KOACreatures={texture,paint,species,sizes,dungeonCreature,bossTexture,revision:'17.6'};
})();