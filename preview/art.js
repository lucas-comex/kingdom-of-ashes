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
const pal={meadow:[73,84,48],forest:[42,57,38],moor:[70,69,56],highland:[87,84,56],road:[112,92,67],plaza:[100,98,88],water:[31,59,66],bridge:[105,78,49]};
function tile(type,variant,low=false){
 const out=canvas(64,32),c=out.getContext('2d'),base=pal[type]||pal.meadow,r=rng(38321+variant*17671+Object.keys(pal).indexOf(type)*547);
 c.save();c.beginPath();c.moveTo(32,0);c.lineTo(64,16);c.lineTo(32,32);c.lineTo(0,16);c.closePath();c.clip();
 c.fillStyle=color(base,(r()-.5)*4);c.fillRect(0,0,64,32);
 // Sparse low-frequency tonal changes rather than an artificial checkerboard.
 for(let i=0;i<14;i++)ellipse(c,r()*64,r()*32,6+r()*11,2+r()*5,color(base,(r()-.5)*32,.22));
 if(type==='water'){
  for(let i=0;i<(low?13:32);i++){const x=r()*64,y=r()*32,l=3+r()*16;line(c,x,y,x+l,y+(r()-.5)*1.3,color(base,12+r()*28,.22),.65+r()*.7)}
  for(let i=0;i<5;i++)ellipse(c,r()*64,r()*32,5+r()*6,1+r()*2,color(base,-17,.22));
   if(!low){for(let j=0;j<7;j++){const x=r()*64,y=r()*32,l=7+r()*13;line(c,x,y,x+l,y+.5,color(base,48,.17),.7);line(c,x+1,y+1,x+l-2,y+1.2,color(base,-24,.23),.7)}}
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
  const count=low?75:310;
  for(let i=0;i<count;i++){const x=r()*64,y=r()*32,d=(r()-.5)*48; c.fillStyle=color(base,d,.40+r()*.35);c.fillRect(x,y,.5+r()*2,.5+r()*.75)}
  for(let i=0;i<(low?10:32);i++){const x=r()*64,y=r()*32,l=1.2+r()*2.8;line(c,x,y,x-.7,y-l,color(base,-26,.8),.7);line(c,x,y,x+1.4,y-l*.75,color(base,36,.75),.65);if(i%7===0)ellipse(c,x+2,y,.9,.6,'#b6a37190')}
  if(type==='moor')for(let i=0;i<8;i++)ellipse(c,r()*64,r()*32,2+r()*4,.7+r(), '#343e3590');if(type==='highland'&&!low)for(let i=0;i<6;i++){const x=r()*64,y=r()*32,w=2+r()*5;poly(c,[[x-w,y],[x-w*.35,y-w*.4],[x+w*.65,y-w*.35],[x+w,y],[x,y+w*.25]],color(base,-15,.9));line(c,x-w*.35,y-w*.4,x+w*.65,y-w*.35,color(base,35,.7),.7)}
 }
 c.restore();const pixels=c.getImageData(0,0,64,32),v=pixels.data;for(let k=0;k<v.length;k+=4)if(v[k+3]>96)v[k+3]=255;else v[k+3]=0;c.putImageData(pixels,0,0);return out
}
function shadow(c,x,y,rx,ry){for(let i=0;i<7;i++)ellipse(c,x+7+i*.8,y+1,rx*(1-i*.075),ry*(1-i*.08),'rgba(14,20,15,.075)')}
function trunk(c,r,x,y,top,wide=12){
 poly(c,[[x-wide,y],[x-wide*.45,top+15],[x-3,top],[x+wide*.45,top+9],[x+wide*.55,y-5],[x+wide*1.55,y+3],[x+2,y],[x-wide*1.45,y+5]],'#443b2b');
 poly(c,[[x-wide*.7,y-2],[x-wide*.25,top+12],[x+1,top+4],[x+2,y]],'#786445');
 for(let i=0;i<12;i++){const a=x-wide*.55+r()*wide;line(c,a,y-r()*14,a+(r()-.5)*5,top+15+r()*25,r()<.5?'#302c2390':'#aa92615e',.7+r()*1.4)}
}
function branch(c,x,y,X,Y,w){line(c,x,y,X,Y,'#433827',w);line(c,x-w*.17,y,X-w*.17,Y,'#88714b',w*.38)}
function crown(c,r,x,y,rx,ry,base,points){
 // Uneven foliage masses, lit from upper left; stippled leaf clusters instead of flat circles.
 for(let j=0;j<points;j++){const a=r()*Math.PI*2,rad=Math.sqrt(r()),dx=Math.cos(a)*rx*rad,dy=Math.sin(a)*ry*rad,shade=9-dx*.12-dy*.36+(r()-.5)*27;const size=1.2+r()*3.3;
  ellipse(c,x+dx+1,y+dy+1.2,size*1.15,size*.75,color(base,shade-34,.85));
  ellipse(c,x+dx,y+dy,size,size*.64,color(base,shade,.95));
  if(r()<.57)ellipse(c,x+dx-size*.3,y+dy-size*.35,1+r()*2,.6+r()*1.4,color(base,shade+26,.7))
 }
}
function tree(kind,v){const o=canvas(192,240),c=o.getContext('2d'),r=rng(911+v*9283+kind.length*3247),x=93,y=211;shadow(c,109,211,72,18);
 const base=kind==='pine'?[35,59,40]:kind==='autumn'?[113,83,42]:[53,77,40];
 if(kind==='dead'){trunk(c,r,x,y,45,13);for(const [a,b,d,e,w] of [[93,131,39,73,10],[91,101,55,42,8],[93,115,142,57,11],[92,75,113,26,6],[39,73,25,44,4],[142,57,166,46,4],[55,42,62,17,4]])branch(c,a,b,d,e,w);return o}
 trunk(c,r,x,y,65,kind==='pine'?8:13);
 if(kind==='pine'){
  for(let i=0;i<7;i++){const cy=154-i*21+(r()-.5)*6,rx=65-i*7+(r()-.5)*8;poly(c,[[x-rx,cy+10],[x-11,cy-54],[x+5,cy-61],[x+rx,cy+12],[x+20,cy+26]],color(base,-10+i*2));crown(c,r,x,cy,rx*.90,15,base,190);for(let j=0;j<15;j++){let xx=x+(r()-.5)*rx*1.7,yy=cy-12+r()*26;line(c,xx,yy,xx+(xx<x?-1:1)*(3+r()*5),yy+3,color(base,31,.64),.7)}}
 }else{
  branch(c,x,147,49,87,10);branch(c,x,132,139,72,11);branch(c,x,115,90,40,9);
  const masses=[[91,115,63,32],[48,96,34,29],[140,100,36,31],[104,71,50,38],[61,60,38,32],[119,45,37,27],[86,35,30,23]];
  for(let i=0;i<masses.length;i++){let [a,b,rx,ry]=masses[i];a+=(r()-.5)*12;b+=(r()-.5)*13;ellipse(c,a,b,rx,ry,color(base,-31));crown(c,r,a,b,rx,ry,base,300)}
 }
 return o
}
function detail(kind,v){const o=canvas(112,92),c=o.getContext('2d'),r=rng(1529+v*2311+kind.length*517);shadow(c,59,75,40,10);
 if(kind==='rock'){const p=[[18,65],[25,42],[46,24],[73,29],[94,49],[100,70],[70,81],[39,78]];poly(c,p,'#54574b');poly(c,[[25,42],[46,24],[73,29],[84,43],[52,59]],'#93917d');poly(c,[[18,65],[25,42],[52,59],[39,78]],'#777b69');poly(c,[[52,59],[84,43],[94,49],[100,70],[70,81]],'#4e564d');for(let i=0;i<45;i++){let x=30+r()*54,y=40+r()*27;line(c,x,y,x+2+r()*4,y-1,'#b6b09945',.8)}for(let i=0;i<16;i++)ellipse(c,27+r()*40,49+r()*16,2+r()*3,1+r()*2,'#667443a0')}
 else if(kind==='cliff'){const p=[[8,72],[18,37],[33,21],[56,10],[78,21],[101,45],[106,70],[75,84],[42,81]];poly(c,p,'#42453e');poly(c,[[18,37],[33,21],[56,10],[78,21],[65,36],[42,47]],'#89877a');poly(c,[[8,72],[18,37],[42,47],[35,76]],'#686b5d');poly(c,[[42,47],[65,36],[75,84],[35,76]],'#50564b');poly(c,[[65,36],[78,21],[101,45],[106,70],[75,84]],'#383f38');c.save();c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();for(let i=0;i<140;i++){const x=12+r()*92,y=15+r()*67;line(c,x,y,x+(r()-.4)*6,y+2+r()*8,r()<.5?'#b3ad8b55':'#252e2855',.6+r()*.6)}for(let i=0;i<17;i++)ellipse(c,14+r()*80,64+r()*14,1+r()*4,1+r()*2,'#68764b90');c.restore()}
 else if(kind==='flowers'||kind==='mushrooms'){for(let j=0;j<16;j++){const x=28+r()*54,y=66+r()*10,len=4+r()*14;line(c,x,y,x+(r()-.5)*3,y-len,'#52643b',.8);if(kind==='flowers'){const fill=['#c3aa67','#a9a0a0','#8e796f'][j%3];for(let k=0;k<5;k++)ellipse(c,x+Math.cos(k*1.256)*1.8,y-len+Math.sin(k*1.256)*1.1,1.2,.8,fill);ellipse(c,x,y-len,.8,.6,'#d7b875')}else{line(c,x,y,x,y-len*.65,'#b2a38a',1.4);ellipse(c,x,y-len*.65,2+r()*2.5,1.5+r()*1.2,j%2?'#a47c56':'#79604d');ellipse(c,x-.8,y-len*.65-.6,.8,.5,'#dec3a0')}}}
 else if(kind==='reeds'){for(let i=0;i<19;i++){const x=25+r()*58,y=68+r()*10,h=14+r()*40,dx=(r()-.5)*17;line(c,x,y,x+dx,y-h,'#6a7746',1+r()*2);if(i%3===0)ellipse(c,x+dx,y-h,2,5,'#65503b')}}
 else if(kind==='stump'){poly(c,[[37,73],[40,37],[70,35],[76,70],[89,78],[57,76],[25,80]],'#594936');ellipse(c,56,38,18,8,'#b29a65');ellipse(c,56,38,11,5,'#887344');ellipse(c,56,38,6,3,'#c1a87b');for(let i=0;i<9;i++)line(c,40+i*3,45,36+i*4,72,'#302e2390',1.2)}
 else {const base=kind==='shrub'?[76,97,49]:[112,100,52];crown(c,r,55,57,37,19,base,130);for(let i=0;i<12;i++)ellipse(c,28+r()*50,46+r()*23,1.2,1.2,kind==='shrub'?'#d3bc76':'#9d613d')}
 return o
}
function shore(c,x,y,sides){const points=[[32,0],[64,16],[32,32],[0,16]];for(const side of sides){const a=points[side],b=points[(side+1)%4],ax=x+a[0],ay=y+a[1],bx=x+b[0],by=y+b[1];const inx=x+32,iny=y+16;const lerp=(a,b,t)=>a+(b-a)*t;poly(c,[[ax,ay],[bx,by],[lerp(bx,inx,.20),lerp(by,iny,.20)],[lerp(ax,inx,.20),lerp(ay,iny,.20)]],'#a49b6d90');line(c,ax,ay,bx,by,'#d0c6a35e',1)}}
const edgeCache=new Map();
function edge(from,to,side,variant=0){const key=[from,to,side,variant%4].join(':');if(edgeCache.has(key))return edgeCache.get(key);const out=canvas(64,32),c=out.getContext('2d'),r=rng(variant*991+side*331+from.length*93+to.length*11),points=[[32,0],[64,16],[32,32],[0,16]],a=points[side],b=points[(side+1)%4],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,target=pal[to]||pal.meadow;
 c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();const grad=c.createLinearGradient(mx,my,mx+(32-mx)*.55,my+(16-my)*.55);grad.addColorStop(0,color(target,0,.62));grad.addColorStop(.45,color(target,0,.30));grad.addColorStop(1,color(target,0,0));c.fillStyle=grad;c.fillRect(0,0,64,32);
 for(let i=0;i<22;i++){const u=r(),v=r()*.42,x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u;ellipse(c,x+(32-x)*v,y+(16-y)*v,.5+r()*1.6,.4+r()*.8,color(target,(r()-.5)*36,.24*(1-v)))}c.restore();if(edgeCache.size>256)edgeCache.delete(edgeCache.keys().next().value);edgeCache.set(key,out);return out}
function contact(c,x,y,variant){const r=rng(variant*137+89);for(let i=0;i<6;i++){const a=r()*Math.PI*2,d=2+r()*10;ellipse(c,x+Math.cos(a)*d,y+Math.sin(a)*d*.4,1+r()*2,.5+r()*.8,'rgba(35,33,24,.17)')}}
window.KOAArt={tile,tree,detail,shore,edge,contact,revision:'17.4'}
})();
