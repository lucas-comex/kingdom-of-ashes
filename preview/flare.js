/* FLARE CC BY-SA 3.0 art adapter; source and attribution in assets/flare. */
(()=>{const dirs={southwest:0,west:1,northwest:2,north:3,northeast:4,east:5,southeast:6,south:7};
const roles={guard:'knight',king:'knight',merchant:'wandering_trader',elder:'peasant_man2',hunter:'peasant_man1',civilian:'peasant_woman1'};
const heroLayers=['clothes','steel_armor','head_short','plate_helm','shortsword','shield'];
function heroPrefix(){return window.KOAFlareHeroScale===1?'flare-hd-':'flare-mini-'}
function preload(scene){for(const n of Object.keys(window.KOAFlareNPC||{}))scene.load.image('flare-npc-'+n,'assets/flare/'+n+'.png');for(const n of heroLayers)scene.load.image(heroPrefix()+n,'assets/flare/'+(window.KOAFlareHeroScale===1?'hd-':'mini-')+n+'.png')}
function draw(scene,c,key,row,scale){if(!row||!scene.textures.exists(key))return false;const image=scene.textures.get(key).getSourceImage();if(!image||!image.width)return false;const [f,d,x,y,w,h,ox,oy]=row;c.drawImage(image,x,y,w,h,48-ox*scale,82-oy*scale,w*scale,h*scale);return true}
function texture(scene,role,dir,frame,gear,action){const d=dirs[dir]??7,hero=role==='hero',npc=roles[role];if(!hero&&!npc)return null;const state=hero?(action||(frame===4?'swing':frame===0?'stance':'run')):'stance',n=hero?(state==='run'?8:state==='die'?6:state==='block'||state==='hit'?2:4):4,step=hero?(action?frame%n:state==='run'?frame*2%n:frame===4?2:frame%n):frame%4;
const mask=gear&111,key='flare-unit-'+role+'-'+d+'-'+state+'-'+step+'-'+(hero?mask:0);if(scene.textures.exists(key))return key;const cv=document.createElement('canvas');cv.width=96;cv.height=96;const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';let ok=true;
if(hero){const body=mask&33?'steel_armor':'clothes',head=mask&2?'plate_helm':'head_short',weapon=mask&8?'shortsword':null,shield=mask&68?'shield':null,order=d<3?[weapon,body,shield,head]:d<6?[body,shield,head,weapon]:d===6?[weapon,body,head,shield]:[weapon,body,head,shield];for(const k of order.filter(Boolean)){const rows=window.KOAFlareHero?.[k]?.[state];const row=rows?.find(v=>v[0]===step&&v[1]===d);// The upstream shortsword atlas omits die frame 4 in directions 6 and 7.
// Keep the body animation instead of switching to an unrelated procedural sprite.
if(!row&&k==='shortsword'&&state==='die'&&step===4&&(d===6||d===7))continue;if(!draw(scene,c,heroPrefix()+k,row,window.KOAFlareHeroScale||2.65))ok=false}}
else{const rows=window.KOAFlareNPC?.[npc]?.stance,row=rows?.find(v=>v[0]===step&&v[1]===d);ok=draw(scene,c,'flare-npc-'+npc,row,.44)}
if(!ok)return null;scene.textures.addCanvas(key,cv);return key}
window.KOAFlare={preload,texture,dirs,roles};
})();