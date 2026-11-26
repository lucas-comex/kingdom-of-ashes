/* 15.8 — original isometric landscape artwork. Generated once, cached as raster textures. */
(function(){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function rng(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function color(rgb,d=0,a=1){return 'rgba('+rgb.map(v=>clamp(Math.round(v+d),0,255)).join(',')+','+a+')'}
function ellipse(c,x,y,rx,ry,fill){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fill()}
function poly(c,points,fill){c.fillStyle=fill;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
function line(c,x,y,X,Y,stroke,w=1){c.strokeStyle=stroke;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke()}
const pal={meadow:[91,106,58],forest:[55,75,43],moor:[91,86,67],highland:[113,111,72],road:[130,113,84],plaza:[116,115,103],water:[45,78,83],bridge:[115,91,59]};
function tile(type,variant,low=false){
 const out=canvas(64,32),c=out.getContext('2d'),base=pal[type]||pal.meadow,r=rng(38321+variant*17671+Object.keys(pal).indexOf(type)*547);
 c.save();c.beginPath();c.moveTo(32,0);c.lineTo(64,16);c.lineTo(32,32);c.lineTo(0,16);c.closePath();c.clip();
 c.fillStyle=color(base,(r()-.5)*7);c.fillRect(0,0,64,32);
 // Sparse low-frequency tonal changes rather than an artificial checkerboard.
 for(let i=0;i<9;i++)ellipse(c,r()*64,r()*32,6+r()*11,2+r()*5,color(base,(r()-.5)*28,.18));
 if(type==='water'){
  for(let i=0;i<(low?13:32);i++){const x=r()*64,y=r()*32,l=3+r()*16;line(c,x,y,x+l,y+(r()-.5)*1.3,color(base,12+r()*28,.22),.65+r()*.7)}
  for(let i=0;i<5;i++)ellipse(c,r()*64,r()*32,5+r()*6,1+r()*2,color(base,-17,.22));
 }else if(type==='bridge'){
  // Boards run along the isometric crossing; alternating seams and nail heads.
  for(let i=-7;i<11;i++){const x=i*9;poly(c,[[x,0],[x+8,0],[x+72,32],[x+64,32]],color(base,(r()-.5)*35));line(c,x,0,x+64,32,'#41372b',1.1);line(c,x+2,0,x+66,32,'#d0b18470',.7)}
  for(let i=0;i<16;i++)ellipse(c,r()*64,r()*32,.65,.5,'#443b31');
 }else if(type==='plaza'){
  for(let j=-3;j<7;j++)for(let i=-3;i<8;i++){const x=i*12+(j%2)*6,y=j*5.5;poly(c,[[x,y],[x+9,y-1],[x+12,y+2],[x+9,y+4],[x,y+5],[x-2,y+2]],color(base,(r()-.5)*25));line(c,x,y,x+9,y-1,'#d3cab04a',.7);line(c,x,y+5,x+9,y+4,'#393a3370',.8)}
 }else if(type==='road'){
  for(let i=0;i<(low?25:75);i++){const x=r()*64,y=r()*32;ellipse(c,x,y,.5+r()*2.1,.3+r()*.9,color(base,(r()-.5)*52,.62))}
  for(let i=0;i<5;i++){const x=r()*64,y=r()*32;ellipse(c,x,y,2+r()*2,.7+r(),color(base,-24,.4));line(c,x-2,y-.5,x+1,y-1,color(base,30,.42),.7)}
 }else{
  const count=low?65:180;
  for(let i=0;i<count;i++){const x=r()*64,y=r()*32,d=(r()-.5)*48; c.fillStyle=color(base,d,.40+r()*.35);c.fillRect(x,y,.5+r()*2,.5+r()*.75)}
  for(let i=0;i<(low?7:18);i++){const x=r()*64,y=r()*32,l=1.2+r()*2.8;line(c,x,y,x-.7,y-l,color(base,-26,.8),.7);line(c,x,y,x+1.4,y-l*.75,color(base,36,.75),.65);if(i%7===0)ellipse(c,x+2,y,.9,.6,'#b6a37190')}
  if(type==='moor')for(let i=0;i<6;i++)ellipse(c,r()*64,r()*32,2+r()*4,.7+r(), '#343e3590');
 }
 c.restore();return out
}
function shadow(c,x,y,rx,ry){for(let i=0;i<7;i++)ellipse(c,x,y,rx*(1-i*.075),ry*(1-i*.08),'rgba(14,20,15,.065)')}
function trunk(c,r,x,y,top,wide=12){
 poly(c,[[x-wide,y],[x-wide*.45,top+15],[x-3,top],[x+wide*.45,top+9],[x+wide*.55,y-5],[x+wide*1.55,y+3],[x+2,y],[x-wide*1.45,y+5]],'#443b2b');
 poly(c,[[x-wide*.7,y-2],[x-wide*.25,top+12],[x+1,top+4],[x+2,y]],'#786445');
 for(let i=0;i<12;i++){const a=x-wide*.55+r()*wide;line(c,a,y-r()*14,a+(r()-.5)*5,top+15+r()*25,r()<.5?'#302c2390':'#aa92615e',.7+r()*1.4)}
}
function branch(c,x,y,X,Y,w){line(c,x,y,X,Y,'#433827',w);line(c,x-w*.17,y,X-w*.17,Y,'#88714b',w*.38)}
function crown(c,r,x,y,rx,ry,base,points){
 // Uneven foliage masses, lit from upper left; stippled leaf clusters instead of flat circles.
 for(let j=0;j<points;j++){const a=r()*Math.PI*2,rad=Math.sqrt(r()),dx=Math.cos(a)*rx*rad,dy=Math.sin(a)*ry*rad,shade=9-dx*.12-dy*.36+(r()-.5)*27;const size=2.4+r()*6;
  ellipse(c,x+dx+1,y+dy+2,size*1.18,size*.75,color(base,shade-23,.85));
  ellipse(c,x+dx,y+dy,size,size*.65,color(base,shade,.95));
  if(r()<.57)ellipse(c,x+dx-size*.3,y+dy-size*.35,1+r()*2,.6+r()*1.4,color(base,shade+26,.7))
 }
}
function tree(kind,v){const o=canvas(192,240),c=o.getContext('2d'),r=rng(911+v*9283+kind.length*3247),x=93,y=211;shadow(c,109,211,72,18);
 const base=kind==='pine'?[46,70,44]:kind==='autumn'?[128,98,49]:[67,91,45];
 if(kind==='dead'){trunk(c,r,x,y,45,13);for(const [a,b,d,e,w] of [[93,131,39,73,10],[91,101,55,42,8],[93,115,142,57,11],[92,75,113,26,6],[39,73,25,44,4],[142,57,166,46,4],[55,42,62,17,4]])branch(c,a,b,d,e,w);return o}
 trunk(c,r,x,y,65,kind==='pine'?8:13);
 if(kind==='pine'){
  for(let i=0;i<7;i++){const cy=154-i*21,rx=65-i*7;poly(c,[[x-rx,cy+10],[x-11,cy-54],[x+5,cy-61],[x+rx,cy+12],[x+20,cy+26]],color(base,-10+i*2));crown(c,r,x,cy,rx*.90,15,base,58);for(let j=0;j<15;j++){let xx=x+(r()-.5)*rx*1.7,yy=cy-12+r()*26;line(c,xx,yy,xx+(xx<x?-1:1)*(3+r()*5),yy+3,color(base,31,.64),.7)}}
 }else{
  branch(c,x,147,49,87,10);branch(c,x,132,139,72,11);branch(c,x,115,90,40,9);
  const masses=[[91,115,63,32],[48,96,34,29],[140,100,36,31],[104,71,50,38],[61,60,38,32],[119,45,37,27],[86,35,30,23]];
  for(let i=0;i<masses.length;i++){let [a,b,rx,ry]=masses[i];a+=(r()-.5)*12;b+=(r()-.5)*13;ellipse(c,a,b,rx,ry,color(base,-21));crown(c,r,a,b,rx,ry,base,100)}
 }
 return o
}
function detail(kind,v){const o=canvas(112,92),c=o.getContext('2d'),r=rng(1529+v*2311+kind.length*517);shadow(c,59,75,40,10);
 if(kind==='rock'){const p=[[18,65],[25,42],[46,24],[73,29],[94,49],[100,70],[70,81],[39,78]];poly(c,p,'#54574b');poly(c,[[25,42],[46,24],[73,29],[84,43],[52,59]],'#93917d');poly(c,[[18,65],[25,42],[52,59],[39,78]],'#777b69');poly(c,[[52,59],[84,43],[94,49],[100,70],[70,81]],'#4e564d');for(let i=0;i<45;i++){let x=30+r()*54,y=40+r()*27;line(c,x,y,x+2+r()*4,y-1,'#b6b09945',.8)}for(let i=0;i<16;i++)ellipse(c,27+r()*40,49+r()*16,2+r()*3,1+r()*2,'#667443a0')}
 else if(kind==='reeds'){for(let i=0;i<19;i++){const x=25+r()*58,y=68+r()*10,h=14+r()*40,dx=(r()-.5)*17;line(c,x,y,x+dx,y-h,'#6a7746',1+r()*2);if(i%3===0)ellipse(c,x+dx,y-h,2,5,'#65503b')}}
 else if(kind==='stump'){poly(c,[[37,73],[40,37],[70,35],[76,70],[89,78],[57,76],[25,80]],'#594936');ellipse(c,56,38,18,8,'#b29a65');ellipse(c,56,38,11,5,'#887344');ellipse(c,56,38,6,3,'#c1a87b');for(let i=0;i<9;i++)line(c,40+i*3,45,36+i*4,72,'#302e2390',1.2)}
 else {const base=kind==='shrub'?[76,97,49]:[112,100,52];crown(c,r,55,57,37,19,base,130);for(let i=0;i<12;i++)ellipse(c,28+r()*50,46+r()*23,1.2,1.2,kind==='shrub'?'#d3bc76':'#9d613d')}
 return o
}
function shore(c,x,y,sides){const points=[[32,0],[64,16],[32,32],[0,16]];for(const side of sides){const a=points[side],b=points[(side+1)%4],ax=x+a[0],ay=y+a[1],bx=x+b[0],by=y+b[1];const inx=x+32,iny=y+16;const lerp=(a,b,t)=>a+(b-a)*t;poly(c,[[ax,ay],[bx,by],[lerp(bx,inx,.20),lerp(by,iny,.20)],[lerp(ax,inx,.20),lerp(ay,iny,.20)]],'#a49b6d90');line(c,ax,ay,bx,by,'#d0c6a35e',1)}}
window.KOAArt={tile,tree,detail,shore};
})();
