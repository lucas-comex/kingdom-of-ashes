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
window.KOACreatures={texture,paint,species,sizes};
})();