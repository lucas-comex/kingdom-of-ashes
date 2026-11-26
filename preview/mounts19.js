/* 19.2 — mounts: ownership is persistent, riding is session state. */
(()=>{'use strict';
const towns=[[174,38,'Passo de Gelo'],[62,174,'Porto de Sal Negro'],[174,174,'Fortaleza de Nortenhal']];
const mounts=[{id:'pony',name:'Pônei das Estradas',level:5,price:180,boost:.18,coat:'#79634d',mane:'#3d352c'},{id:'horse',name:'Cavalo Castanho',level:1,price:0,boost:.65,coat:'#865138',mane:'#322b26'},{id:'warhorse',name:'Corcel da Fronteira',level:18,price:950,boost:.38,coat:'#555b58',mane:'#292e2b'}];
const stables=[[15,15],...towns.map(([x,y])=>[x,y])];
const get=id=>mounts.find(m=>m.id===id),fresh=()=>({owned:[]}),clean=raw=>({owned:[...new Set(Array.isArray(raw?.owned)?raw.owned.filter(id=>get(id)):[])]});
function withGift(state){if(!state.owned.includes('horse'))state.owned.push('horse');return state}
const outdoors=w=>w.interior===null&&!w.inCrypt&&!w.inSewer;
const allowed=w=>outdoors(w)&&w.combatTime<=0&&w.hp>0;
const near=w=>outdoors(w)&&stables.some(([x,y])=>Math.hypot(w.p.x-x,w.p.y-y)<5);
function command(w,action,id){if(!window.koaStarted||window.koaPaused)return false;const m=get(id),fail=msg=>{w.notice=msg;w.hudTimer=2;return false};if(action==='dismount'){w.riding=null;w.hudTimer=2;return true}if(!m)return false;
 if(action==='buy'){if(!near(w)||!allowed(w))return fail('Visite um estábulo fora de combate.');if(w.mounts.owned.includes(id)||w.level<m.level||w.gold<m.price)return fail('Requisitos da montaria não atendidos.');w.gold-=m.price;w.mounts.owned.push(id);w.notice=m.name+' adquirido.';window.koaSave?.()}
 else if(action==='ride'){if(!allowed(w)||!w.mounts.owned.includes(id))return fail('Monte apenas ao ar livre, fora de combate.');w.riding=id;w.notice=m.name+' montado.'}else return false;w.hudTimer=2;return true}
function boost(w){return allowed(w)?1+(get(w.riding)?.boost||0):1}
function tick(w){if(w.riding&&!allowed(w))w.riding=null}
function snapshot(w){return {riding:w.riding,near:near(w),allowed:allowed(w),catalog:mounts.map(m=>({...m,owned:w.mounts.owned.includes(m.id)}))}}
const dirs=['south','southwest','west','northwest','north','northeast','east','southeast'];
function texture(w,m,dir,frame){const key=['mount19',m.id,dir,frame].join('-');if(w.textures.exists(key))return key;const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d'),a=Math.max(0,dirs.indexOf(dir))*Math.PI/4,co=Math.cos(a),si=Math.sin(a),stride=Math.sin(frame*Math.PI/2)*6,parts=[];
 const P=(x,y,z)=>[64+x*co+z*si,106-y*.9+(z*co-x*si)*.43,z*co-x*si];
 const ell=(p,rx,ry,base,light,dark,off=0)=>{const q=P(...p);parts.push({d:q[2]+off,draw:()=>{const gr=c.createRadialGradient(q[0]-rx*.4,q[1]-ry*.4,0,q[0],q[1],Math.max(rx,ry)*1.2);gr.addColorStop(0,light);gr.addColorStop(.6,base);gr.addColorStop(1,dark);c.fillStyle=gr;c.beginPath();c.ellipse(q[0],q[1],rx,ry,0,0,Math.PI*2);c.fill()}})};
 const line=(p,r,width,color,light,off=0)=>{const A=P(...p),B=P(...r);parts.push({d:(A[2]+B[2])/2+off,draw:()=>{c.lineCap='round';c.lineWidth=width;c.strokeStyle=color;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();c.strokeStyle=light;c.lineWidth=Math.max(.5,width*.23);c.beginPath();c.moveTo(A[0]-1,A[1]);c.lineTo(B[0]-1,B[1]);c.stroke()}})};
 c.fillStyle='#171b154f';c.beginPath();c.ellipse(64,106,27,7,0,0,Math.PI*2);c.fill();
 for(const side of [-1,1])for(const z of [-1,1]){const f=stride*side*z;line([side*8,31,z*17],[side*9,16,z*17+f*.4],6,m.coat,'#b29b7e');line([side*9,16,z*17+f*.4],[side*9,3,z*17+f],3.5,m.coat,'#96836a');ell([side*9,2,z*17+f+2],3.2,2.2,'#2a2c28','#66665a','#171b17',.2)}
 line([0,33,-21],[0,25,-29],6,m.mane,'#8c7760',-.3);line([0,25,-29],[Math.sin(frame)*4,11,-32],4,m.mane,'#665744',-.2);
 // Body volume built from overlapping depth-sorted forms.
 for(let j=-2;j<=2;j++)ell([0,33,j*7],10+Math.cos(j*.6)*3,14,m.coat,'#bda588','#332b25',.1);
 line([0,34,15],[0,51,24],12,m.coat,'#b59c7d',.4);line([0,45,16],[0,56,22],4,m.mane,'#83715b',.5);ell([0,53,28],7,10,m.coat,'#c3ab8d','#44362c',.5);ell([0,48,35],6,4,'#625347','#b19b81','#332f29',.7);
 for(const k of [-1,1]){line([k*3,59,26],[k*4,66,24],2.5,m.coat,'#c5a887',.6);ell([k*4,55,30],1.1,1.2,'#242421','#e8d2a3','#141914',.8)}
 ell([0,45,-2],11,5,'#634331','#b58a5b','#36291f',.6);for(const k of [-1,1])line([k*10,44,-2],[k*10,32,1],2,'#65513b','#d1b579',.7);parts.sort((a,b)=>a.d-b.d).forEach(v=>v.draw());w.textures.addCanvas(key,cv);return key}
function render(w,a,b,moving){const m=get(w.riding);if(!w.mountSprite)return 0;if(!m||!allowed(w)){w.mountSprite.setVisible(false);return 0}const frame=moving?Math.floor(w.phase*2)%4:0,key=texture(w,m,w.facing,frame);if(w.mountSprite.texture.key!==key)w.mountSprite.setTexture(key);w.mountSprite.setVisible(true).setPosition(a,b).setDepth(b+.1).setDisplaySize(128,128);return 37+(moving?Math.sin(frame*Math.PI/2)*1.2:0)}
const enemies=[[166,15,300,'lobo'],[178,24,350,'bear'],[185,49,400,'bandido'],[165,73,340,'boar'],[181,96,420,'bear'],[168,118,450,'bandido'],[185,139,460,'lobo'],[165,157,490,'bear'],[184,183,560,'bandido'],[140,178,440,'lobo'],[107,183,400,'boar'],[75,185,380,'bandido'],[48,164,330,'bear'],[20,179,310,'lobo'],[6,167,300,'boar'],[90,169,400,'bandido'],[179,66,420,'lobo'],[158,185,500,'bear']].map(([x,y,hp,kind])=>({x,y,hp,kind}));
const chests=[[170,20],[184,55],[166,113],[184,181],[85,184],[20,170]].map(([x,y],i)=>({x,y,bonus:190+i*35}));
window.KOAMounts={towns,mounts,stables,fresh,clean,withGift,command,boost,tick,snapshot,render,texture,enemies,chests};
})();