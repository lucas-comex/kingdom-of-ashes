/* 17.1 original raster atlas import. 4x4 96px body frames + 6x2 64px equipment cells. */
(()=>{'use strict';
const storage='koa-original-raster-atlas-v1';let image=null,starter=null,revision=0,source='none',defaultImage=null,defaultHD=null;const npcBases=new Map(),profileBases=new Map(),icons=new Map(),equipmentArt=new Map();let itemBounds=[];const anchorCache=new Map(),gripCache=new Map();const $=id=>document.getElementById(id);
const directions=['south','southwest','west','northwest','north','northeast','east','southeast'];
function status(message){const el=$('spritePackStatus');if(el)el.textContent=message}
function changed(){revision++;npcBases.clear();profileBases.clear();icons.clear();equipmentArt.clear();anchorCache.clear();gripCache.clear();itemBounds=[];window.dispatchEvent(new Event('koa-spritepack-changed'));const w=window.koaGame?.scene?.getScenes(true)?.[0];if(w){w.prewarmGear=-1;w.heroKey=null}}
function makeStarter(im){const cv=document.createElement('canvas');cv.width=cv.height=384;const c=cv.getContext('2d');c.drawImage(im,0,0,384,384,0,0,384,384);const d=c.getImageData(0,0,384,384),a=d.data;for(let y=0;y<384;y++)for(let x=0;x<384;x++){const yy=y%96,xx=x%96,i=(y*384+x)*4;if(a[i+3]<32||xx<32||xx>63||yy<25||yy>75)continue;const r=a[i],g=a[i+1],b=a[i+2];if(r>g*1.22&&g>b*1.13&&r-g>17)continue;const gray=.3*r+.55*g+.15*b,shirt=yy<47,fade=shirt?.19:.12,wear=((Math.imul(x+3,73856093)^Math.imul(y+7,19349663))>>>0)%13-6;for(let k=0;k<3;k++){const tint=(shirt?[154,141,117]:[111,99,83])[k];a[i+k]=Math.max(0,Math.min(255,a[i+k]*(1-fade)+gray*fade+(tint-128)*.10+wear*.7))}}c.putImageData(d,0,0);return cv}
function activate(im,kind){const cv=document.createElement('canvas');cv.width=384;cv.height=512;const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(im,0,0,384,512);if(kind==='built-in'&&defaultHD){for(let row=0;row<4;row++)for(const [src,dest] of [[0,0],[1,2]]){c.clearRect(dest*96,row*96,96,96);c.drawImage(defaultHD,src*96,row*96,96,96,dest*96,row*96,96,96)}}image=cv;starter=makeStarter(cv);source=kind;changed();status(kind==='built-in'?'Arte original integrada e ativa.':'Pack original personalizado ativo.');return true}
function useDefault(im,hd){if(im)defaultImage=im;if(hd)defaultHD=hd;if(!defaultImage)return false;if(source==='custom')return true;return activate(defaultImage,'built-in')}
function loadURL(url,persist=true){return new Promise((resolve,reject)=>{if(typeof url!=='string'||(!url.startsWith('data:image/png;base64,')&&url!=='assets/koa-hero-atlas.png')||url.length>1800000){reject(new Error('Arquivo inválido'));return}const im=new Image();im.onload=()=>{if(im.naturalWidth!==384||im.naturalHeight!==512){reject(new Error('O pack deve medir 384 × 512 pixels'));return}activate(im,'custom');let saved=true;if(persist){try{localStorage.setItem(storage,url)}catch{saved=false}}status(saved?'Pack original personalizado ativo.':'Pack ativo nesta sessão; armazenamento indisponível.');resolve(true)};im.onerror=()=>reject(new Error('Não foi possível ler o PNG'));im.src=url})}
function clear(){image=null;starter=null;source='none';try{localStorage.removeItem(storage)}catch{}status('Renderizador de compatibilidade ativo.');changed()}
function fromFile(file){return new Promise((resolve,reject)=>{if(!file||file.size>1200000||!file.name.toLowerCase().endsWith('.png')){reject(new Error('Escolha o PNG do pack original (até 1,2 MB)'));return}const rd=new FileReader();rd.onerror=()=>reject(new Error('Falha na leitura do arquivo'));rd.onload=()=>loadURL(rd.result).then(resolve,reject);rd.readAsDataURL(file)})}
function profileBase(base,p){const key=[p.skin,p.hairColor,p.beardColor,p.hair,p.beard,p.gender,p.npc?p.palette?.[0]:'',p.apron||''].join(':');if(profileBases.has(key))return profileBases.get(key);
 const cv=document.createElement('canvas');cv.width=cv.height=384;const c=cv.getContext('2d');c.drawImage(base,0,0);const data=c.getImageData(0,0,384,384),d=data.data;
 const rgb=v=>{const n=parseInt((v||'#805d43').slice(1),16);return [n>>16&255,n>>8&255,n&255]},skin=rgb(p.skin),hair=rgb(p.hairColor),beard=rgb(p.beardColor),apron=p.apron?rgb(p.apron):null;
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const ox=col*96,oy=row*96,back=row%2===1;let top=96,left=96,right=0;
 for(let y=4;y<32;y++)for(let x=25;x<71;x++){if(d[((oy+y)*384+ox+x)*4+3]>150){if(y<top)top=y;if(y<=top+10){left=Math.min(left,x);right=Math.max(right,x)}}}
 if(top===96)continue;const mid=(left+right)/2;
 for(let y=top;y<Math.min(76,top+54);y++)for(let x=26;x<70;x++){const i=((oy+y)*384+ox+x)*4;if(d[i+3]<80)continue;const R=d[i],G=d[i+1],B=d[i+2],lum=.3*R+.56*G+.14*B,warm=R>G*1.10&&G>B*1.07&&R-B>17,head=y<top+16&&Math.abs(x-mid)<8;
 let target=null,strength=0;
 if(head&&y<top+7&&lum<125){target=p.hair==='shaved'?skin:hair;strength=.58}
 else if(head&&!back&&p.beard!=='none'&&y>=top+10&&y<=top+(p.beard==='full'?15:13)&&Math.abs(x-mid)<(p.beard==='goatee'?2:4)&&warm){target=beard;strength=.65}
 else if((head&&!back&&warm&&lum>65)||(y>top+25&&y<top+45&&Math.abs(x-mid)>10&&warm&&lum>90)){target=skin;strength=.38}
 else if(apron&&!back&&y>top+21&&y<top+49&&Math.abs(x-mid)<7){target=apron;strength=.48}
 if(target){const gray=.3*target[0]+.56*target[1]+.14*target[2];for(let k=0;k<3;k++)d[i+k]=Math.max(0,Math.min(255,d[i+k]*(1-strength)+(lum*.80+target[k]-gray*.56)*strength))}
 }
 }
 c.putImageData(data,0,0);
 // Hair extensions follow the raster silhouette; no fixed helmet or garment is added.
 if(p.hair==='long'||p.hair==='tied'){c.globalCompositeOperation='source-over';for(let row=0;row<4;row++)for(let col=0;col<4;col++){if(row<2&&row%2===0)continue;const x=col*96+48,y=row*96+16;c.fillStyle=p.hairColor||'#38251c';c.globalAlpha=.85;c.beginPath();c.moveTo(x-3,y);c.quadraticCurveTo(x-6,y+6,x-4,y+(p.hair==='long'?15:8));c.lineTo(x-1,y+4);c.closePath();c.fill();c.globalAlpha=1}}
 if(profileBases.size>=64)profileBases.delete(profileBases.keys().next().value);profileBases.set(key,cv);return cv
}
function bounds(i){if(itemBounds[i])return itemBounds[i];const x=i%6*64,y=384+Math.floor(i/6)*64,d=image.getContext('2d').getImageData(x,y,64,64).data;let l=64,t=64,r=-1,b=-1;for(let j=0;j<64;j++)for(let k=0;k<64;k++)if(d[(j*64+k)*4+3]>24){l=Math.min(l,k);t=Math.min(t,j);r=Math.max(r,k);b=Math.max(b,j)}return itemBounds[i]=r<l?{x,y,w:64,h:64}:{x:x+l,y:y+t,w:r-l+1,h:b-t+1}}
const paletteFor=(id,i)=>{if(!id)return null;let hash=0;for(const v of id)hash=(Math.imul(hash,31)+v.charCodeAt(0))>>>0;const palette=i===1||i===2||i===3||i===8?[[160,128,86],[118,143,112],[132,113,159],[168,117,91]]:[[166,175,178],[191,162,105],[114,144,156],[171,126,114],[144,155,117]];if(id==='trainingSword')return [166,175,178];if(id==='crownBlade')return [222,181,86];const base=palette[hash%palette.length];return base.map((v,k)=>Math.max(0,Math.min(255,v+((hash>>>(k*7))%23)-11)))};
function piece(i,id){const key=i+':'+(id||'');if(equipmentArt.has(key))return equipmentArt.get(key);const b=bounds(i),cv=document.createElement('canvas');cv.width=b.w;cv.height=b.h;const c=cv.getContext('2d');c.drawImage(image,b.x,b.y,b.w,b.h,0,0,b.w,b.h);const rgb=paletteFor(id,i);if(rgb){const d=c.getImageData(0,0,b.w,b.h),v=d.data;for(let j=0;j<v.length;j+=4){if(v[j+3]<16)continue;const lum=.30*v[j]+.56*v[j+1]+.14*v[j+2];for(let k=0;k<3;k++)v[j+k]=Math.max(0,Math.min(255,v[j+k]*.54+(lum*.68+rgb[k]*.32)*.46))}c.putImageData(d,0,0)}if(equipmentArt.size>=160)equipmentArt.delete(equipmentArt.keys().next().value);equipmentArt.set(key,cv);return cv}
function iconURL(kind){if(!image)return null;const index={sword:0,bow:1,staff:2,wand:3,shield:4,helmet:5,armor:6,legs:7,boots:8}[kind];if(index===undefined)return null;if(icons.has(kind))return icons.get(kind);const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.drawImage(image,index%6*64,384+Math.floor(index/6)*64,64,64,0,0,64,64);const url=cv.toDataURL('image/png');icons.set(kind,url);return url}
const poseAnchors=[
 [[48,16,37,49,61,46,39,76,57,72],[48,16,35,47,61,45,48,77,43,65],[48,16,33,45,63,44,53,77,39,62],[48,16,31,44,64,44,55,76,40,59]],
 [[48,16,35,49,61,46,38,77,56,76],[48,16,35,50,57,44,45,77,49,70],[47,16,33,40,60,45,53,77,42,65],[46,16,31,40,63,46,53,77,40,57]],
 [[47,16,38,49,58,47,38,77,55,73],[48,16,36,47,59,44,49,77,43,66],[48,16,35,46,61,45,52,77,40,64],[46,16,34,46,62,45,54,76,40,61]],
 [[48,16,37,47,58,47,43,77,57,75],[48,16,36,44,59,49,49,77,44,68],[47,16,35,41,59,48,53,77,41,65],[47,16,34,40,61,47,53,77,42,60]]
];
// Use nearest actual body pixel to compensate for the compressed atlas and custom imports.
function nearest(data,w,h,x,y,radius=5){let best=null,dist=Infinity;for(let j=Math.max(0,Math.floor(y-radius));j<=Math.min(h-1,Math.ceil(y+radius));j++)for(let k=Math.max(0,Math.floor(x-radius));k<=Math.min(w-1,Math.ceil(x+radius));k++){const d=(k-x)**2+(j-y)**2;if(d<dist&&data[(j*w+k)*4+3]>100){best=[k+.5,j+.5];dist=d}}return best||[x,y]}
function anchors(row,col){const key=row*4+col;if(anchorCache.has(key))return anchorCache.get(key);const d=(starter||image).getContext('2d').getImageData(col*96,row*96,96,96).data,v=poseAnchors[row][col],point=i=>nearest(d,96,96,v[i],v[i+1],6);const a={head:point(0),left:point(2),right:point(4),feet:[point(6),point(8)],chest:nearest(d,96,96,48,31,8),waist:nearest(d,96,96,48,43,8)};anchorCache.set(key,a);return a}
function grip(i){if(gripCache.has(i))return gripCache.get(i);const p=piece(i,''),d=p.getContext('2d').getImageData(0,0,p.width,p.height).data,[x,y]=[[.15,.87],[.15,.50],[.35,.62],[.35,.65],[.50,.55]][i]||[.5,.5],q=nearest(d,p.width,p.height,x*(p.width-1),y*(p.height-1),6),out=[q[0]/p.width,q[1]/p.height];gripCache.set(i,out);return out}
function draw(canvas,p,dir,frame,gear,action){if(!image)return false;const ctx=canvas.getContext('2d'),idx=Math.max(0,directions.indexOf(dir)),back=idx>=3&&idx<=5,flip=idx>=1&&idx<=3,walking=action==='run',col=walking?[0,1,2,3,2,1][Math.abs(Math.floor(frame||0))%6]:0,row=(p.gender==='female'?2:0)+(back?1:0);
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(canvas.width/96,canvas.height/96);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.fillStyle='#12150f44';ctx.beginPath();ctx.ellipse(48,82,15,4,0,0,Math.PI*2);ctx.fill();
 if(action==='die'){ctx.translate(48,82);ctx.rotate(Math.min(1,frame/5)*1.4);ctx.translate(-48,-82)}
 if(flip){ctx.translate(96,0);ctx.scale(-1,1)}
 const strike=['swing','shoot','cast'].includes(action),phase=walking?[0,1,-1,1][col]||0:0,pose=Math.max(0,Math.min(3,frame|0)),swing=strike?[-.09,.13,.21,.03][pose]:action==='block'?-.07:0;
 // Keep the soles fixed while the torso leans; approximate side view from the two original views.
 const side=idx===2||idx===6;ctx.translate(48,82);ctx.scale(side?.84:1,1);ctx.transform(1,0,swing,1,0,0);ctx.translate(-48,-82);
 const ids=p.gearStyle||{},female=p.gender==='female',anchor=anchors(row,col),hand=back?anchor.right:anchor.left,offhand=back?anchor.left:anchor.right;

 // Body is an original generated raster frame. Gear uses separate cropped raster art.
 let base=starter||image;
 if(p.npc){const colr=p.palette?.[0]||'#756654',key=colr+'-'+p.gender+'-'+(p.apron||'');if(!npcBases.has(key)){const cv=document.createElement('canvas');cv.width=cv.height=384;const cc=cv.getContext('2d');cc.drawImage(base,0,0);const d=cc.getImageData(0,0,384,384),v=d.data,n=parseInt(colr.slice(1),16),rgb=[n>>16&255,n>>8&255,n&255];for(let y=0;y<384;y++)for(let x=0;x<384;x++){const yy=y%96,xx=x%96,i=(y*384+x)*4;if(v[i+3]<32||xx<33||xx>63||yy<27||yy>49)continue;const R=v[i],G=v[i+1],B=v[i+2];if(R>G*1.22&&G>B*1.13&&R-G>17)continue;const lum=.3*R+.55*G+.15*B;for(let k=0;k<3;k++)v[i+k]=Math.max(0,Math.min(255,lum*.73+rgb[k]*.39-11))}cc.putImageData(d,0,0);if(npcBases.size>=48)npcBases.delete(npcBases.keys().next().value);npcBases.set(key,cv)}base=npcBases.get(key)}
 base=profileBase(base,p);
 const body=()=>ctx.drawImage(base,col*96,row*96,96,96,0,0,96,96);
 // Clothing uses a separate alpha-masked pass. It cannot appear outside the painted body silhouette.
 const cloth=document.createElement('canvas');cloth.width=cloth.height=96;const cc=cloth.getContext('2d');cc.imageSmoothingQuality='high';
 const garment=(i,x,y,w,h,slot)=>cc.drawImage(piece(i,ids[slot]),x,y,w,h);
 if(gear&512)garment(7,anchor.waist[0]-(female?8:10),anchor.waist[1]-4,female?16:20,26,'legs');
 if(gear&128){const art=piece(8,ids.boots),half=Math.floor(art.width/2);anchor.feet.forEach(([x,y],j)=>{const sx=j?half:0,sw=j?art.width-half:half;cc.drawImage(art,sx,0,sw,art.height,x-4,y-12,9,14)})}
 if(gear&33)garment(6,anchor.chest[0]-(female?10:13),anchor.chest[1]-12,female?20:26,26,'armor');
 cc.globalCompositeOperation='destination-in';cc.drawImage(base,col*96,row*96,96,96,0,0,96,96);cc.globalCompositeOperation='source-over';
 const weapon=()=>{if(!(gear&8))return;const i=gear&1024?1:gear&2048?2:gear&4096?3:0,art=piece(i,ids.sword),[gx,gy]=grip(i),height=[36,31,43,31][i],width=height*art.width/art.height;ctx.save();ctx.translate(...hand);
 // Rotate around the grip, never the center of the icon. Same pivot in idle, walk and attack.
 const angles=i===0?[-.25,-.95,.95,.22]:i===1?[-.12,-.32,-.58,-.12]:[-.12,-.42,.20,0];ctx.rotate((back?-1:1)*(strike?angles[pose]:-.12));ctx.drawImage(art,-gx*width,-gy*height,width,height);ctx.restore()};
 const shield=()=>{if(!(gear&68))return;const art=piece(4,ids.shield),[gx,gy]=grip(4),height=25,width=height*art.width/art.height;ctx.save();ctx.translate(...offhand);ctx.rotate((back?-1:1)*(action==='block'?-0.6:-.12));ctx.drawImage(art,-gx*width,-gy*height,width,height);ctx.restore()};
 // Depth follows view: far-side equipment is behind the body; nearer equipment is in front.
 const farWeapon=idx===1||idx===2||idx===3||idx===4,farShield=!farWeapon&&idx!==0;
 if(farWeapon)weapon();if(farShield)shield();body();ctx.drawImage(cloth,0,0);
 if((gear&2)&&!p.hideHelmet){const art=piece(5,ids.helmet),height=16,width=height*art.width/art.height;ctx.drawImage(art,anchor.head[0]-width/2,anchor.head[1]-8,width,height)}
 if(!farShield)shield();if(!farWeapon&&gear&8){weapon();ctx.save();ctx.beginPath();ctx.ellipse(hand[0],hand[1],2,2.6,0,0,Math.PI*2);ctx.clip();body();ctx.restore()}
 if(gear&256){ctx.fillStyle='#c8a471';ctx.beginPath();ctx.ellipse(hand[0],hand[1]+1,1.2,.7,0,0,Math.PI*2);ctx.fill()}
 if(action==='hit'){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#a42f2822';ctx.fillRect(20,8,60,76)}
 ctx.restore();return true
}
const input=$('spritePackInput');if(input)input.addEventListener('change',()=>{fromFile(input.files[0]).catch(e=>status(e.message));input.value=''});
$('spritePackReset')?.addEventListener('click',()=>{clear();useDefault()});
window.KOASpritePack={get active(){return !!image},get revision(){return revision},get source(){return source},get nativeFrames(){return source==='custom'?16:source==='built-in'&&defaultHD?8:0},loadURL,useDefault,clear,draw,fromFile,iconURL,getItemBounds:bounds,getAnchors:anchors,getGrip:grip};
try{const cached=localStorage.getItem(storage);if(cached)loadURL(cached,false).catch(()=>clear());}catch{}
})();