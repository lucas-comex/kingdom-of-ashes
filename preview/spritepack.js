/* 17.1 original raster atlas import. 4x4 96px body frames + 6x2 64px equipment cells. */
(()=>{'use strict';
const storage='koa-original-raster-atlas-v1';let image=null,starter=null,revision=0,source='none',defaultImage=null;const npcBases=new Map();const $=id=>document.getElementById(id);
const directions=['south','southwest','west','northwest','north','northeast','east','southeast'];
function status(message){const el=$('spritePackStatus');if(el)el.textContent=message}
function changed(){revision++;npcBases.clear();window.dispatchEvent(new Event('koa-spritepack-changed'));const w=window.koaGame?.scene?.getScenes(true)?.[0];if(w){w.prewarmGear=-1;w.heroKey=null}}
function makeStarter(im){const cv=document.createElement('canvas');cv.width=cv.height=384;const c=cv.getContext('2d');c.drawImage(im,0,0,384,384,0,0,384,384);const d=c.getImageData(0,0,384,384),a=d.data;for(let y=0;y<384;y++)for(let x=0;x<384;x++){const yy=y%96,xx=x%96,i=(y*384+x)*4;if(a[i+3]<32||xx<32||xx>63||yy<25||yy>75)continue;const r=a[i],g=a[i+1],b=a[i+2];if(r>g*1.22&&g>b*1.13&&r-g>17)continue;const gray=.3*r+.55*g+.15*b,shirt=yy<47,fade=shirt?.19:.12,wear=((Math.imul(x+3,73856093)^Math.imul(y+7,19349663))>>>0)%13-6;for(let k=0;k<3;k++){const tint=(shirt?[154,141,117]:[111,99,83])[k];a[i+k]=Math.max(0,Math.min(255,a[i+k]*(1-fade)+gray*fade+(tint-128)*.10+wear*.7))}}c.putImageData(d,0,0);return cv}
function activate(im,kind){const cv=document.createElement('canvas');cv.width=384;cv.height=512;const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(im,0,0,384,512);image=cv;starter=makeStarter(cv);source=kind;changed();status(kind==='built-in'?'Arte original integrada e ativa.':'Pack original personalizado ativo.');return true}
function useDefault(im){if(im)defaultImage=im;if(!defaultImage)return false;if(source==='custom')return true;return activate(defaultImage,'built-in')}
function loadURL(url,persist=true){return new Promise((resolve,reject)=>{if(typeof url!=='string'||(!url.startsWith('data:image/png;base64,')&&url!=='assets/koa-hero-atlas.png')||url.length>1800000){reject(new Error('Arquivo inválido'));return}const im=new Image();im.onload=()=>{if(im.naturalWidth!==384||im.naturalHeight!==512){reject(new Error('O pack deve medir 384 × 512 pixels'));return}activate(im,'custom');let saved=true;if(persist){try{localStorage.setItem(storage,url)}catch{saved=false}}status(saved?'Pack original personalizado ativo.':'Pack ativo nesta sessão; armazenamento indisponível.');resolve(true)};im.onerror=()=>reject(new Error('Não foi possível ler o PNG'));im.src=url})}
function clear(){image=null;starter=null;source='none';try{localStorage.removeItem(storage)}catch{}status('Renderizador de compatibilidade ativo.');changed()}
function fromFile(file){return new Promise((resolve,reject)=>{if(!file||file.size>1200000||!file.name.toLowerCase().endsWith('.png')){reject(new Error('Escolha o PNG do pack original (até 1,2 MB)'));return}const rd=new FileReader();rd.onerror=()=>reject(new Error('Falha na leitura do arquivo'));rd.onload=()=>loadURL(rd.result).then(resolve,reject);rd.readAsDataURL(file)})}
function draw(canvas,p,dir,frame,gear,action){if(!image)return false;const ctx=canvas.getContext('2d'),idx=Math.max(0,directions.indexOf(dir)),back=idx>=3&&idx<=5,flip=idx>=1&&idx<=3,walking=action==='run',col=walking?[1,2,3,2,1,2,3,2][Math.abs(Math.floor(frame||0))%8]:0,row=(p.gender==='female'?2:0)+(back?1:0);
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(canvas.width/96,canvas.height/96);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.fillStyle='#12150f44';ctx.beginPath();ctx.ellipse(48,82,15,4,0,0,Math.PI*2);ctx.fill();
 if(action==='die'){ctx.translate(48,82);ctx.rotate(Math.min(1,frame/5)*1.4);ctx.translate(-48,-82)}
 if(flip){ctx.translate(96,0);ctx.scale(-1,1)}
 const strike=['swing','shoot','cast'].includes(action),phase=walking?[0,1,-1,1][col]||0:0;
 function item(i,x,y,w,h){ctx.drawImage(image,(i%6)*64,384+Math.floor(i/6)*64,64,64,x,y,w,h)}
 // Body is an original generated raster frame. Gear uses separate cropped raster art.
 let base=starter||image;
 if(p.npc){const colr=p.palette?.[0]||'#756654',key=colr+'-'+p.gender+'-'+(p.apron||'');if(!npcBases.has(key)){const cv=document.createElement('canvas');cv.width=cv.height=384;const cc=cv.getContext('2d');cc.drawImage(base,0,0);const d=cc.getImageData(0,0,384,384),v=d.data,n=parseInt(colr.slice(1),16),rgb=[n>>16&255,n>>8&255,n&255];for(let y=0;y<384;y++)for(let x=0;x<384;x++){const yy=y%96,xx=x%96,i=(y*384+x)*4;if(v[i+3]<32||xx<33||xx>63||yy<27||yy>49)continue;const R=v[i],G=v[i+1],B=v[i+2];if(R>G*1.22&&G>B*1.13&&R-G>17)continue;const lum=.3*R+.55*G+.15*B;for(let k=0;k<3;k++)v[i+k]=Math.max(0,Math.min(255,lum*.73+rgb[k]*.39-11))}cc.putImageData(d,0,0);if(npcBases.size>=48)npcBases.delete(npcBases.keys().next().value);npcBases.set(key,cv)}base=npcBases.get(key)}
 ctx.drawImage(base,col*96,row*96,96,96,0,0,96,96);
 if(gear&512)item(7,35,43+phase,26,35);
 if(gear&128)item(8,35,65+phase,26,19);
 if(gear&33){if(back){ctx.save();ctx.globalAlpha=.82;item(6,31,23,34,34);ctx.restore()}else item(6,31,23,34,34)}
 if((gear&2)&&!p.hideHelmet)item(5,38,7,20,24);
 if(gear&68)item(4,24,36+phase,25,30);
 if(gear&8){const i=gear&1024?1:gear&2048?2:gear&4096?3:0;ctx.save();ctx.translate(60,50+phase);if(strike)ctx.rotate((frame-1)*.23);item(i,-6,-29,32,44);ctx.restore()}
 if(gear&256){ctx.fillStyle='#c8a471';ctx.beginPath();ctx.ellipse(60,51+phase,1.3,.8,0,0,Math.PI*2);ctx.fill()}
 if(action==='hit'){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#a42f2822';ctx.fillRect(20,8,60,76)}
 ctx.restore();return true
}
const input=$('spritePackInput');if(input)input.addEventListener('change',()=>{fromFile(input.files[0]).catch(e=>status(e.message));input.value=''});
$('spritePackReset')?.addEventListener('click',()=>{clear();useDefault()});
window.KOASpritePack={get active(){return !!image},get revision(){return revision},get source(){return source},loadURL,useDefault,clear,draw,fromFile};
try{const cached=localStorage.getItem(storage);if(cached)loadURL(cached,false).catch(()=>clear());}catch{}
})();