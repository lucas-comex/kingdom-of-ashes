/* Original quiet city score and NPC dialogue data, preview-only. */
(()=>{
'use strict';
const residents=[
['Edric','Padeiro','merchant',['O pão da manhã acabou de sair do forno.','As caravanas trazem farinha de Thorn.','Passe na padaria quando tiver fome.']],
['Mira','Herbalista','hunter',['As ervas do bosque são boas para poções.','À noite, evite caminhar perto das ruínas.','O templo acolhe quem precisa de cura.']],
['Garran','Ferreiro','merchant',['O aço de Ashes não teme as cinzas.','Um bom escudo vale mais que cem promessas.','Procure minha ferraria quando precisar de equipamento.']],
['Lysa','Moradora','civilian',['Bom dia, viajante!','A praça fica animada quando os mercadores chegam.','Dizem que há tesouros além do rio.']],
['Oswin','Carpinteiro','hunter',['A madeira das florestas antigas é resistente.','As portas da cidade protegem nossas famílias.','O quartel precisa de novos bancos.']],
['Elena','Viajante','civilian',['Vim de Ravenhold pela estrada do leste.','As noites estão mais frias ultimamente.','Que sua viagem seja segura.']],
['Borin','Mineiro','merchant',['O ferro de Vargard é conhecido em todo o reino.','As montanhas escondem veios de minério.','Descanse antes de atravessar as colinas.']],
['Sera','Lavradora','civilian',['O campo precisa de chuva.','A colheita alimenta a cidade.','Os guardas mantêm os caminhos seguros.']],
['Tomas','Mensageiro','hunter',['Trago notícias de outras vilas.','A estrada ao norte é longa.','O rei espera notícias das fronteiras.']],
['Iria','Peregrina','elder',['As cinzas não apagam nossa esperança.','Acenda uma vela no templo.','Que os antigos protejam seus passos.']]
];
const shops={
 bakery:{name:'Padaria do Trigo',keeper:'Edric',role:'merchant',lines:['Pão quente e refeições para a estrada.','Uma refeição custa 5 moedas. Abra Comércio para confirmar a compra.'],cost:5,item:'cooked'},
 smith:{name:'Ferraria da Brasa',keeper:'Garran',role:'merchant',lines:['Bem-vindo à minha ferraria.','Espada de aço: 30 moedas. Armadura: 25. Use K/L junto ao ferreiro.']},
 herbal:{name:'Ervanária da Lua',keeper:'Mira',role:'hunter',lines:['Tenho poções para sua jornada.','Uma poção custa 12 moedas. Abra Comércio para confirmar a compra.'],cost:12,item:'potions'},
 inn:{name:'Pousada do Peregrino',keeper:'Elena',role:'merchant',lines:['Aqui você pode descansar.','Uma noite de descanso custa 8 moedas. Use Comércio para recuperar vida, mana e saciedade.'],cost:8,item:'rest'}
};
// Original modal melody with lute-like plucks and sparse drone. No external audio.
let ctx,bus,next=0,step=0,enabled=true,level=.12,active=false;
try{enabled=localStorage.getItem('koa-city-music')!=='0';let v=localStorage.getItem('koa-city-music-volume');if(v!==null&&Number.isFinite(+v))level=Math.max(0,Math.min(1,+v))}catch{}
const melody=[62,65,69,67,65,62,60,62,57,null,60,62,65,64,62,null,62,65,67,69,72,69,67,65,64,62,60,57,60,62,null,null];
const bass=[50,50,48,50,45,48,50,50];
function note(m,t,d,amp){if(m==null)return;const f=440*2**((m-69)/12),g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(amp,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(bus);for(const [ratio,gain] of [[1,1],[2,.17],[3,.07]]){const o=ctx.createOscillator(),h=ctx.createGain();o.type='sine';o.frequency.value=f*ratio;h.gain.value=gain;o.connect(h);h.connect(g);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();h.disconnect()}}}
function init(){if(ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ctx=new C();bus=ctx.createGain();bus.gain.value=0;bus.connect(ctx.destination);ctx.resume().catch(()=>{})}catch{ctx=null}}
function tick(city){if(!ctx)return;const want=!!city&&enabled&&!window.koaAudio?.muted&&!window.koaPaused&&window.koaStarted&&!document.hidden;const gain=want?level*(window.koaAudio?.volume??.35)*.65:0;if(want!==active||Math.abs((bus._target??-1)-gain)>.0001){active=want;bus._target=gain;bus.gain.setTargetAtTime(gain,ctx.currentTime,.25)}if(!want||ctx.state!=='running'){next=0;return}if(next<ctx.currentTime)next=ctx.currentTime+.04;while(next<ctx.currentTime+.28){note(melody[step%melody.length],next,.68,.28);if(step%4===0){const n=bass[Math.floor(step/4)%bass.length];note(n,next,1.7,.21);note(n+7,next+.09,1.3,.09)}step++;next+=.44}}
document.addEventListener('pointerdown',init,{once:true});
window.KOACity={residents,shops,tick,get enabled(){return enabled},get volume(){return level},get active(){return active},setEnabled(v){enabled=!!v;try{localStorage.setItem('koa-city-music',enabled?'1':'0')}catch{}if(!enabled)tick(false)},setVolume(v){level=Math.max(0,Math.min(1,+v||0));try{localStorage.setItem('koa-city-music-volume',String(level))}catch{}}};
})();