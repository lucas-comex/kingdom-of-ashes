/* Local beta: save recovery and cosmetic-only wardrobe. */
(()=>{'use strict';
const KEY='koa-preview-save-v1',BACKUP=KEY+'-backup',CORRUPT=KEY+'-corrupt',MAX=2*1024*1024;
function parse(raw){if(typeof raw!=='string'||raw.length>MAX)return null;try{const v=JSON.parse(raw);return v&&typeof v==='object'&&!Array.isArray(v)&&Number.isSafeInteger(v.level)&&v.level>=1?v:null}catch{return null}}
function read(storage){try{const raw=storage.getItem(KEY),v=parse(raw);if(v)return {value:v,recovered:false};const old=parse(storage.getItem(BACKUP));if(raw!==null&&!v){try{storage.setItem(CORRUPT,raw.slice(0,MAX))}catch{}}return {value:old,recovered:!!old,invalid:raw!==null&&!v}}catch{return {value:null,recovered:false,unavailable:true}}}
function write(storage,v){try{const raw=JSON.stringify(v);if(!parse(raw))return false;const old=storage.getItem(KEY);if(parse(old)&&old!==raw){try{storage.setItem(BACKUP,old)}catch{}}storage.setItem(KEY,raw);return true}catch{return false}}
function exportSave(){if(window.koaTestLevel)return false;window.koaSave?.();const v=read(localStorage).value;if(!v)return false;const data={format:'koa-offline-backup',version:1,save:v,appearance:window.KOAAppearance?.get()};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='kingdom-of-ashes-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true}
const catalog=[
 {id:'wanderer',name:'Traje do Peregrino',level:1,coat:'#75664e',trim:'#c5b083',desc:'Tecido rústico e detalhes em couro.'},
 {id:'watch',name:'Vigia de Ashes',level:5,coat:'#4e6368',trim:'#b7c3bf',desc:'Tons de aço e azul envelhecido.'},
 {id:'ember',name:'Juramento das Cinzas',level:10,coat:'#743e34',trim:'#d5a65d',desc:'Vermelho escuro com acabamento dourado.'},
 {id:'moon',name:'Ordem da Lua',level:15,coat:'#544665',trim:'#c3b6df',desc:'Violeta e prata.'}
];
const get=id=>catalog.find(x=>x.id===id),fresh=()=>({selected:null,visible:true});
function clean(v){return {selected:get(v?.selected)?v.selected:null,visible:v?.visible!==false}}
function effective(w){const m=get(w.cosmetics?.selected);return w.cosmetics?.visible!==false&&m&&w.level>=m.level?m:null}
function profile(w,p){const m=effective(w);return {...p,skinId:m?.id||null,cosmetic:m||null}}
function command(w,action,id){if(!window.koaStarted||window.koaPaused)return false;if(action==='toggle')w.cosmetics.visible=!w.cosmetics.visible;else if(action==='clear')w.cosmetics.selected=null;else if(action==='select'){const m=get(id);if(!m||w.level<m.level)return false;w.cosmetics.selected=id;w.cosmetics.visible=true}else return false;w.hudTimer=2;window.koaSave?.();return true}
function snapshot(w){return {...w.cosmetics,effective:effective(w)?.id||null,catalog:catalog.map(m=>({...m,available:w.level>=m.level}))}}
window.KOARelease={parse,read,write,exportSave,KEY,BACKUP};window.KOACosmetics={catalog,get,fresh,clean,effective,profile,command,snapshot};
})();