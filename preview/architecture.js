/* 15.9 — original cached isometric architecture, no external assets. */
(function(){
'use strict';
const cv=(w,h)=>{const o=document.createElement('canvas');o.width=w;o.height=h;return o};
const rnd=seed=>{let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}};
const col=(a,d=0,alpha=1)=>'rgba('+a.map(x=>Math.max(0,Math.min(255,Math.round(x+d)))).join(',')+','+alpha+')';
function path(c,p){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
function poly(c,p,f){path(c,p);c.fillStyle=f;c.fill()}
function line(c,a,b,f,w=1){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=f;c.lineWidth=w;c.stroke()}
function ell(c,x,y,a,b,f){c.beginPath();c.ellipse(x,y,a,b,0,0,Math.PI*2);c.fillStyle=f;c.fill()}
function rect(c,x,y,w,h,f){c.fillStyle=f;c.fillRect(x,y,w,h)}
function mix(a,b,t){return a.map((v,i)=>v+(b[i]-v)*t)}
function face(c,a,b,height,base,r,kind='stone'){
 const A=[a[0],a[1]-height],B=[b[0],b[1]-height],p=[A,B,b,a];poly(c,p,col(base));c.save();path(c,p);c.clip();
 for(let j=0;j<Math.ceil(height/9);j++){const yy=j*9,steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/17);for(let k=-1;k<=steps;k++){const t=(k+(j%2)*.5)/steps,u=t+.93/steps,P=mix(A,B,t),Q=mix(A,B,u);poly(c,[[P[0],P[1]+yy],[Q[0],Q[1]+yy],[Q[0],Q[1]+yy+8],[P[0],P[1]+yy+8]],col(base,(r()-.5)*(kind==='wood'?37:28)));line(c,[P[0],P[1]+yy],[Q[0],Q[1]+yy],col(base,34,.45),.8);line(c,[P[0],P[1]+yy+8],[Q[0],Q[1]+yy+8],col(base,-48,.55),1)}}
 for(let i=0;i<400;i++){let p=mix(A,B,r()),y=r()*height;rect(c,p[0],p[1]+y,.6+r()*2,.5+r()*.7,col(base,(r()-.5)*64,.36))}const light=c.createLinearGradient(A[0],A[1],b[0],b[1]);light.addColorStop(0,'rgba(228,186,116,.09)');light.addColorStop(1,'rgba(19,23,25,.23)');c.fillStyle=light;c.fillRect(Math.min(a[0],b[0])-2,Math.min(A[1],B[1])-2,Math.abs(a[0]-b[0])+4,height+Math.abs(a[1]-b[1])+4);c.restore();
}
function roof(c,p,base,r){poly(c,p,col(base));c.save();path(c,p);c.clip();const [a,b,d,e]=p;for(let j=0;j<13;j++){let t=j/13;const A=mix(a,e,t),B=mix(b,d,t),C=mix(a,e,(j+1)/13),D=mix(b,d,(j+1)/13);for(let k=-1;k<=13;k++){const u=(k+(j%2)*.5)/13,v=u+.96/13;poly(c,[mix(A,B,u),mix(A,B,v),mix(C,D,v),mix(C,D,u)],col(base,(r()-.5)*35));line(c,mix(C,D,u),mix(C,D,v),col(base,-40,.8),1);line(c,mix(A,B,u),mix(A,B,v),col(base,34,.45),.7)}}for(let i=0;i<520;i++){const x=r()*360,y=r()*380;rect(c,x,y,.5+r()*1.8,.5+r()*.9,col(base,(r()-.5)*65,.42))}const shade=c.createLinearGradient(a[0],a[1],d[0],d[1]);shade.addColorStop(0,'#d4b28020');shade.addColorStop(1,'#161c2460');c.fillStyle=shade;c.fillRect(0,0,360,380);c.restore();line(c,p[0],p[1],col(base,35),2);line(c,p[2],p[3],col(base,-45),3)}
function beam(c,a,b,w=6){line(c,a,b,'#45382b',w);line(c,[a[0]-1,a[1]-1],[b[0]-1,b[1]-1],'#a08459',w*.23)}
function windowAt(c,x,y,wide=13,h=29,glow=false){rect(c,x-wide/2-3,y-2,wide+6,h+5,'#a39a7e');c.beginPath();c.moveTo(x-wide/2,y+h);c.lineTo(x-wide/2,y+6);c.quadraticCurveTo(x,y-12,x+wide/2,y+6);c.lineTo(x+wide/2,y+h);c.closePath();c.fillStyle='#292c27';c.fill();if(glow)rect(c,x-wide*.28,y+7,wide*.56,h-10,'#c3a363');line(c,[x,y+4],[x,y+h],'#6e6250',2);line(c,[x-wide/2,y+h*.55],[x+wide/2,y+h*.55],'#77664b',2);rect(c,x-wide/2-4,y+h,wide+8,3,'#6c6857')}
function banner(c,x,y,base){line(c,[x-12,y],[x+12,y],'#beaa75',3);poly(c,[[x-10,y+2],[x+10,y+2],[x+10,y+39],[x,y+47],[x-10,y+39]],base);line(c,[x-8,y+3],[x-8,y+39],'#d8bc7566',1);poly(c,[[x,y+10],[x+5,y+18],[x,y+26],[x-5,y+18]],'#d4b67a')}
function tower(c,x,y,w,h,r,stone=[137,137,119],cap=true){const a=[x-w,y-w*.5],b=[x,y],d=[x+w,y-w*.5],e=[x,y-w];face(c,a,b,h,stone,r);face(c,b,d,h,stone.map(n=>n-33),r);poly(c,[[a[0],a[1]-h],[b[0],b[1]-h],[d[0],d[1]-h],[e[0],e[1]-h]],col(stone,23));windowAt(c,x-w*.48,y-w*.27-h*.72,Math.max(5,w*.18),Math.max(10,h*.22));if(cap){for(const [A,B] of [[a,b],[b,d]])for(let i=0;i<4;i+=2){const p=mix(A,B,i/4),q=mix(A,B,(i+1)/4);poly(c,[[p[0],p[1]-h],[q[0],q[1]-h],[q[0],q[1]-h-12],[p[0],p[1]-h-12]],col(stone,A===a?14:-16))}}}
function building(kind,v=0){const o=cv(360,380),c=o.getContext('2d'),r=rnd(9787+v*917+kind.length*223),x=180,y=350;
 for(let j=0;j<8;j++)ell(c,x+13,y-10,145-j*9,35-j*2,'#151d1610');
 const shop=['bakery','smith','herbal','inn'].includes(kind),shopKind=shop?kind:null;if(shop)kind=kind==='inn'?'tavern':'house';
 const stone=kind==='temple'?[171,163,140]:kind==='barracks'?[122,128,116]:[145,137,118],roofBase=kind==='tavern'?[118,66,43]:kind==='temple'?[74,87,92]:kind==='barracks'?[75,85,65]:shopKind==='smith'?[77,78,73]:shopKind==='bakery'?[137,80,46]:shopKind==='herbal'?[69,83,52]:v%3===1?[110,91,57]:v%3===2?[95,65,49]:[119,76,54];
 if(kind==='keep'){
  tower(c,80,260,48,155,r);tower(c,280,260,48,155,r);
  const a=[58,278],b=[180,339],d=[302,278],e=[180,217];face(c,a,b,136,[148,145,130],r);face(c,b,d,136,[105,111,101],r);poly(c,[[58,142],[180,203],[302,142],[180,81]],'#969889');
  tower(c,180,195,63,144,r,[156,151,132]);tower(c,66,279,44,115,r);tower(c,294,279,44,115,r);
  for(let j=0;j<4;j++){windowAt(c,92+j*19,221+j*9,12,32);windowAt(c,268-j*19,221+j*9,12,32)}banner(c,133,254,'#783e36');banner(c,228,254,'#783e36');
  poly(c,[[155,338],[155,299],[180,278],[205,299],[205,338],[180,350]],'#55574c');poly(c,[[163,339],[163,302],[180,287],[197,302],[197,339],[180,348]],'#242925');return o
 }
 const w=kind==='house'?102:128,dep=w*.5,h=kind==='temple'?130:kind==='barracks'?105:92,a=[x-w,y-dep],b=[x,y],d=[x+w,y-dep],e=[x,y-2*dep],A=[a[0],a[1]-h],B=[b[0],b[1]-h],D=[d[0],d[1]-h],E=[e[0],e[1]-h];
 face(c,a,b,h,stone,r);face(c,b,d,h,stone.map(n=>n-35),r);
 if(kind==='house'||kind==='tavern'){for(const [P,Q] of [[A,B],[B,D]]){beam(c,P,Q);for(let i=0;i<=4;i++){let q=mix(P,Q,i/4);beam(c,q,[q[0],q[1]+h],5);if(i<4){let z=mix(P,Q,(i+1)/4);beam(c,[q[0],q[1]+h*.1],[z[0],z[1]+h*.8],3)}}beam(c,[P[0],P[1]+h*.48],[Q[0],Q[1]+h*.48],5)}}
 for(let i=1;i<=3;i++){let p=mix(a,b,i/4);if(i<3)windowAt(c,p[0],p[1]-h*.73,14,27,kind==='tavern');p=mix(b,d,i/4);if(i>1)windowAt(c,p[0],p[1]-h*.73,14,27,kind==='tavern')}
 const ridgeH=kind==='temple'?86:68,ra=[(A[0]+E[0])/2,(A[1]+E[1])/2-ridgeH],rb=[(B[0]+D[0])/2,(B[1]+D[1])/2-ridgeH];
 poly(c,[A,B,rb,ra],col(roofBase,6));roof(c,[ra,rb,B,A],roofBase.map(n=>n+12),r);roof(c,[ra,rb,D,E],roofBase.map(n=>n-24),r);poly(c,[B,D,rb],col(stone,-12));line(c,B,rb,'#534736',4);line(c,D,rb,'#534736',4);line(c,ra,rb,col(roofBase,35),4);
 if(kind==='temple'){tower(c,x+62,y-98,28,155,r,[154,153,137],false);const t=[x+62,y-98-155];poly(c,[[t[0]-33,t[1]-12],[t[0],t[1]-76],[t[0]+33,t[1]-12],[t[0],t[1]+6]],'#485963');line(c,[t[0],t[1]-76],[t[0],t[1]-97],'#c8b06b',3);line(c,[t[0]-8,t[1]-89],[t[0]+8,t[1]-89],'#c8b06b',3)}
 else {const chx=x+44,chy=y-h-106;face(c,[chx-9,chy],[chx+7,chy+8],38,[123,113,92],r);face(c,[chx+7,chy+8],[chx+19,chy+2],38,[84,80,67],r);poly(c,[[chx-11,chy-40],[chx+7,chy-32],[chx+22,chy-39],[chx+4,chy-47]],'#aaa18b')}
 if(kind==='tavern'){beam(c,[x-64,y-71],[x-35,y-57],3);rect(c,x-61,y-70,25,16,'#6d4c30');ell(c,x-48,y-63,6,4,'#ddc08a')}
 if(kind==='barracks'){banner(c,x-54,y-82,'#627649');banner(c,x+54,y-82,'#627649')}
 if(shopKind){const sx=x-62,sy=y-62;beam(c,[sx,sy-14],[sx+20,sy-4],3);beam(c,[sx+20,sy-4],[sx+20,sy+5],2);rect(c,sx+5,sy+2,29,23,'#372c20');rect(c,sx+7,sy+4,25,19,'#97774a');const z=sx+19,q=sy+14;if(shopKind==='smith'){poly(c,[[z-10,q-3],[z+10,q-3],[z+4,q+2],[z+2,q+7],[z-5,q+7],[z-5,q+2]],'#363d3e');line(c,[z-9,q-3],[z+9,q-3],'#d1c9ad',1.2)}else if(shopKind==='bakery'){ell(c,z,q,9,6,'#c99a58');for(let j=-1;j<=1;j++)line(c,[z+j*5-1,q-4],[z+j*5+1,q+2],'#72532e',1.2)}else if(shopKind==='herbal'){line(c,[z,q+7],[z,q-7],'#384b31',2);for(const k of [-1,1]){ell(c,z+k*4,q-2,4,2,'#557143');ell(c,z+k*5,q+3,4,2,'#74834c')}}else{rect(c,z-5,q-5,9,11,'#6b4630');ell(c,z,q-5,5,2,'#eed9a4');line(c,[z+5,q-3],[z+8,q+3],'#d2a76b',2)}}
 poly(c,[[x-20,y-1],[x-20,y-41],[x,y-54],[x+20,y-41],[x+20,y-1],[x,y+4]],'#565043');poly(c,[[x-14,y],[x-14,y-38],[x,y-47],[x+14,y-38],[x+14,y],[x,y+3]],'#252923');return o
}
function fort(kind){const o=cv(160,240),c=o.getContext('2d'),r=rnd(kind==='wall'?981:1337);if(kind==='wall')tower(c,80,222,48,100,r,[142,141,126]);else tower(c,80,222,62,174,r,[150,148,133]);return o}
function furniture(kind){const o=cv(128,128),c=o.getContext('2d'),r=rnd(kind.length*771),x=64,y=112;ell(c,x+6,y,45,12,'#16191550');const a=[24,91],b=[64,111],d=[104,91],e=[64,71];
 if(kind==='throne'){face(c,a,b,23,[121,91,51],r,'wood');face(c,b,d,23,[83,61,40],r,'wood');poly(c,[[36,81],[64,95],[90,82],[64,68]],'#8c4337');poly(c,[[36,81],[36,27],[64,41],[64,95]],'#b49456');poly(c,[[64,95],[64,41],[90,27],[90,82]],'#725230');poly(c,[[44,75],[44,38],[64,48],[83,37],[83,75],[64,86]],'#8d413b');line(c,[64,43],[64,84],'#b16c51',2);return o}
 if(kind==='altar'){face(c,a,b,28,[151,149,130],r);face(c,b,d,28,[107,111,97],r);poly(c,[[24,63],[64,83],[104,63],[64,43]],'#b7b09a');line(c,[64,60],[64,17],'#c7aa65',5);line(c,[49,30],[79,30],'#c7aa65',5);ell(c,39,61,3,7,'#e1b76e');ell(c,89,61,3,7,'#e1b76e');return o}
 if(kind==='bed'){face(c,a,b,19,[106,79,48],r,'wood');face(c,b,d,19,[70,54,39],r,'wood');poly(c,[[24,72],[64,92],[104,72],[64,52]],'#d0c2a0');poly(c,[[42,78],[64,92],[104,72],[80,59]],'#905348');for(let j=0;j<6;j++)line(c,[45+j*6,77-j*3],[64+j*6,89-j*3],'#c0805b65',1);poly(c,[[29,70],[45,78],[63,69],[47,60]],'#e2d5b6');beam(c,[24,72],[24,38],5);beam(c,[64,52],[64,18],5);beam(c,[24,38],[64,18],8);return o}
 for(const [a,b] of [[[29,71],[29,99]],[[64,88],[64,113]],[[99,71],[99,99]]])beam(c,a,b,6);face(c,[24,69],[64,89],8,[137,102,60],r,'wood');face(c,[64,89],[104,69],8,[91,66,43],r,'wood');poly(c,[[24,61],[64,81],[104,61],[64,41]],'#a68450');for(let i=1;i<6;i++)line(c,mix([24,61],[64,41],i/6),mix([64,81],[104,61],i/6),'#654f33',1);ell(c,52,58,9,5,'#d4c19a');ell(c,52,58,5,3,'#98653b');rect(c,76,49,5,13,'#78684d');ell(c,78,49,3,2,'#ceb27a');return o
}
function floor(kind,v){const o=cv(64,32),c=o.getContext('2d'),r=rnd(v*811+kind.length*71);c.save();path(c,[[32,0],[64,16],[32,32],[0,16]]);c.clip();const wood=kind==='house'||kind==='tavern'||kind==='barracks',base=wood?[121,93,62]:[112,114,105];rect(c,0,0,64,32,col(base));for(let i=-5;i<10;i++){const x=i*9;poly(c,[[x,0],[x+8,0],[x+72,32],[x+64,32]],col(base,(r()-.5)*24));line(c,[x,0],[x+64,32],col(base,-45),1);if(!wood)for(let j=0;j<4;j++){let y=j*8;line(c,[x+y*2,y],[x+y*2+8,y],col(base,-38),1)}}for(let i=0;i<70;i++)rect(c,r()*64,r()*32,1+r()*2,.8,col(base,(r()-.5)*32,.5));c.restore();return o}
window.KOAArchitecture={building,fort,furniture,floor};
})();