/* 18.0: vocation skills. Offensive casts use the existing authoritative damage/loot path. */
(()=>{'use strict';
const abilities=[
 ['cleave','Guerreiro','warrior','Golpe devastador',2,12,6,'physical','blade',2.05,1.9,0,'Golpe poderoso contra um alvo.'],
 ['shieldbash','Guerreiro','warrior','Impacto de escudo',5,18,9,'physical','blade',1.45,1.8,3,'Exige escudo equipado. Reduz a velocidade do inimigo por 3s.'],
 ['fortify','Guerreiro','warrior','Postura de ferro',8,25,18,'self','',0,0,6,'Reduz dano recebido em 30% por 6s.'],
 ['pierce','Arqueiro','archer','Flecha perfurante',2,12,6,'physical','bow',1.85,6.5,0,'Disparo de longo alcance.'],
 ['frostarrow','Arqueiro','archer','Flecha glacial',5,20,9,'ice','bow',1.6,6.5,4,'Reduz a velocidade do inimigo por 4s.'],
 ['evasion','Arqueiro','archer','Passo evasivo',8,22,18,'self','',0,0,6,'Reduz dano recebido em 30% por 6s.'],
 ['firebolt','Sorcerer','sorcerer','Lança de fogo',2,18,5,'fire','wand',2.1,6,0,'Ataque elemental de fogo.'],
 ['frostnova','Sorcerer','sorcerer','Prisão glacial',5,26,9,'ice','wand',2,6,4,'Ataque de gelo e lentidão por 4s.'],
 ['aegis','Sorcerer','sorcerer','Égide arcana',8,32,18,'self','',0,0,6,'Reduz dano recebido em 30% por 6s.'],
 ['thorn','Druida','druid','Espinhos ancestrais',2,16,6,'nature','staff',1.95,6,0,'Ataque elemental da natureza.'],
 ['roots','Druida','druid','Raízes aprisionadoras',5,24,9,'nature','staff',1.65,6,4,'Reduz a velocidade do inimigo por 4s.'],
 ['renewal','Druida','druid','Renovação ancestral',8,30,14,'heal','',0,0,0,'Recupera 25% da vida máxima.']
 ].map(([id,group,vocation,name,level,mana,cd,element,weapon,mult,range,seconds,description])=>({id,group,vocation,name,level,mana,cd,element,weapon,mult,range,seconds,description}));
const byId=Object.fromEntries(abilities.map(a=>[a.id,a]));
const colors={physical:0xe1c897,fire:0xe98943,ice:0x9dcbe8,nature:0x98c773,self:0xe1c897,heal:0x9fda85};
const elements={lobo:{fire:-.15,nature:.15},boar:{fire:-.15,nature:.15},bear:{fire:-.15,nature:.20},cobra:{nature:.35,ice:-.20},rato:{fire:-.20},ratazana:{fire:-.20},esqueleto:{nature:.35,fire:-.20},cavaleiro:{physical:.15,nature:.30,fire:-.15},'guardião':{physical:.15,fire:.25,ice:-.20},rei:{nature:.30,fire:.30,ice:-.20}};
const resist=(kind,element)=>elements[kind]?.[element]||0;
const fresh=()=>({uses:{}});function clean(raw){const p=fresh();for(const a of abilities){const n=raw?.uses?.[a.id];if(Number.isSafeInteger(n)&&n>=0)p.uses[a.id]=Math.min(1000000,n)}return p}
function init(w){w.combatProgress=fresh();w.abilityCD={};w.abilityGuard=0;w.queuedAbility=null}
function tick(w,dt){for(const id of Object.keys(w.abilityCD))w.abilityCD[id]=Math.max(0,w.abilityCD[id]-dt);w.abilityGuard=Math.max(0,w.abilityGuard-dt)}
function mastery(w,id){return Math.min(5,Math.floor((w.combatProgress.uses[id]||0)/10))}
function manaCost(w,a){return Math.max(1,a.mana-mastery(w,a.id))}
function reason(w,a){if(!a||a.vocation!==w.vocation())return 'Habilidade de outra vocação.';if(w.level<a.level)return 'Nível insuficiente.';if(w.abilityCD[a.id]>0)return 'Habilidade em recarga.';if(w.mana<manaCost(w,a))return 'Mana insuficiente.';if(a.weapon&&w.weaponKind()!==a.weapon)return 'Equipe a arma exigida.';if(a.id==='shieldbash'&&!w.shield&&!w.relicEquipped.shield)return 'Equipe um escudo.';return ''}
function safe(w){return w.interior!==null||!w.inCrypt&&!w.inSewer&&w.isCastle(w.p.x,w.p.y)}
function validTarget(w,e,a){return !!(e&&e.hp>0&&w.sameArea(e)&&!(e.kind==='rei'&&w.cryptDefeated)&&!(e.kind==='guardião'&&w.bossDead)&&Math.hypot(e.x-w.p.x,e.y-w.p.y)<=a.range&&w.clearStrike(w.p,e)&&(a.range<=2||w.guardLine(w.p,e)))}
function spend(w,a){w.mana-=manaCost(w,a);w.abilityCD[a.id]=a.cd;w.combatProgress.uses[a.id]=(w.combatProgress.uses[a.id]||0)+1;w.hudTimer=2;w.notice=a.name}
function fx(w,a,e){if(window.koaSafe||window.koaLowFX||window.koaBudgetLow)return;const [x,y]=w.iso(w.p.x,w.p.y),[u,v]=w.iso(e?.x??w.p.x,e?.y??w.p.y),g=w.add.graphics().setDepth(9601);const col=colors[a.element];g.lineStyle(3,col,.9);if(e){g.lineBetween(x,y-30,u,v-23);g.strokeEllipse(u,v-13,37,22)}else g.strokeEllipse(x,y-15,48,36);g.fillStyle(col,.22);g.fillEllipse(u,v-12,40,24);w.tweens.add({targets:g,alpha:0,duration:350,onComplete:()=>g.destroy()})}
function request(w,id){if(!window.koaStarted||window.koaPaused)return false;const a=byId[id],why=reason(w,a),fail=msg=>{w.notice=msg;w.hudTimer=2;return false};if(why)return fail(why);if(w.queuedAbility)return fail('Aguarde o ataque anterior.');if(a.element==='heal'){if(w.hp>=w.maxHP())return fail('Vida já cheia.');const hp=Math.min(w.maxHP()-w.hp,Math.ceil(w.maxHP()*.25*(1+.12*window.KOAExpansion.rank(w,'renew'))));spend(w,a);w.hp+=hp;w.floatAt(w.p.x,w.p.y,'+'+hp,'#a6df85');fx(w,a);window.koaAudio?.play('heal');window.koaSave?.();return true}if(a.element==='self'){spend(w,a);w.abilityGuard=a.seconds;fx(w,a);window.koaSave?.();return true}if(safe(w))return fail('Não é permitido atacar na zona segura.');if(w.cooldown>0)return fail('Aguarde a recuperação do ataque.');const target=validTarget(w,w.target,a)?w.target:w.enemies.filter(e=>validTarget(w,e,a)).sort((x,y)=>Math.hypot(x.x-w.p.x,x.y-w.p.y)-Math.hypot(y.x-w.p.x,y.y-w.p.y))[0];if(!target)return fail('Nenhum alvo válido no alcance.');w.queuedAbility={id,target};w.target=target;w.path=[];w.goal=null;return true}
function take(w){const q=w.queuedAbility;w.queuedAbility=null;if(!q)return null;const a=byId[q.id];if(reason(w,a)||safe(w)||w.cooldown>0||!validTarget(w,q.target,a))return null;return {a,target:q.target}}
function strike(w,cast,damage){const {a,target}=cast,rank=mastery(w,a.id);spend(w,a);if(a.seconds)target.slowTime=Math.max(target.slowTime||0,a.seconds);fx(w,a,target);return Math.max(1,Math.round(damage*a.mult*(1+rank*.03)*(1-resist(target.kind,a.element))))}
function snapshot(w){return {guard:Math.ceil(w.abilityGuard),skills:abilities.filter(a=>a.vocation===w.vocation()).map(a=>({...a,cost:manaCost(w,a),remaining:Math.ceil(w.abilityCD[a.id]||0),mastery:mastery(w,a.id),uses:w.combatProgress.uses[a.id]||0,reason:reason(w,a)}))}}
window.KOACombat18={abilities,init,clean,tick,request,take,strike,snapshot,resist,mastery};
})();