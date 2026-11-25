"use strict";
/* =========================================================
   PROGRESIÓN: rangos, medallas, días, encargos diarios, jardín
   ========================================================= */
const RANKS=[['Aprendiz',0],['Ayudante',8],['Hiladora',20],['Tejedora',40],['Bordadora',70],['Oficiala',110],['Experta',160],['Artesana',230],['Maestra',320],['Gran maestra',430],['Leyenda del telar',560],['Reina del telar',720]];
const RANK_CHARM=['','🧵','🪡','🧶','✂️','🎀','🌟','💎','🏅','🏆','🌈','👑'];
const ZONES={huerto:6, lab:8};
let rankQueue=[];

const MEDALS=[
  {id:'tela1',e:'🧵',n:'Primera tela',d:'Completa tu primer encargo',goal:1,v:p=>p.counters.encargos,c:3},
  {id:'tela10',e:'🧶',n:'Tejedora constante',d:'Completa 10 encargos',goal:10,v:p=>p.counters.encargos,c:8},
  {id:'tela30',e:'🧣',n:'Mil puntadas',d:'Completa 30 encargos',goal:30,v:p=>p.counters.encargos,c:15},
  {id:'tela75',e:'🧥',n:'Taller a tope',d:'Completa 75 encargos',goal:75,v:p=>p.counters.encargos,c:30},
  {id:'tela150',e:'🏭',n:'Fábrica de Jacquard',d:'Completa 150 encargos',goal:150,v:p=>p.counters.encargos,c:50},
  {id:'racha3',e:'🔥',n:'Tres días seguidos',d:'Juega 3 días seguidos',goal:3,v:p=>p.days.best||0,c:5},
  {id:'racha7',e:'📅',n:'Una semana entera',d:'Juega 7 días seguidos',goal:7,v:p=>p.days.best||0,c:10},
  {id:'racha14',e:'🗓️',n:'Dos semanas',d:'Juega 14 días seguidos',goal:14,v:p=>p.days.best||0,c:20},
  {id:'racha30',e:'🌙',n:'Un mes entero',d:'Juega 30 días seguidos',goal:30,v:p=>p.days.best||0,c:40},
  {id:'primera10',e:'🎯',n:'A la primera',d:'10 encargos perfectos a la primera y sin pistas',goal:10,v:p=>p.counters.firstTry,c:10},
  {id:'primera30',e:'🏹',n:'Puntería de campeona',d:'30 encargos perfectos a la primera y sin pistas',goal:30,v:p=>p.counters.firstTry,c:25},
  {id:'hilo3',e:'🔍',n:'Cazadora de errores',d:'Acierta 3 veces si el programa de Hilo está bien o mal',goal:3,v:p=>p.counters.hiloRight,c:10},
  {id:'flor10',e:'🌷',n:'Jardinera',d:'Haz florecer 10 plantas',goal:10,v:p=>p.counters.bloomed,c:8},
  {id:'flor40',e:'💐',n:'Jardín de ensueño',d:'Haz florecer 40 plantas',goal:40,v:p=>p.counters.bloomed,c:20},
  {id:'botanica',e:'🌺',n:'Botánica',d:'Haz florecer las 12 clases de plantas',goal:12,v:p=>Object.keys(p.bloomedKinds).length,c:30},
  {id:'regar10',e:'💧',n:'Regadera fiel',d:'Riega tu jardín 10 días',goal:10,v:p=>p.counters.water,c:8},
  {id:'historias',e:'📜',n:'Sabia del pueblo',d:'Descubre las 12 historias',goal:12,v:p=>p.stories.length,c:15},
  {id:'casa5',e:'🧹',n:'Ayudante en casa',d:'5 tareas o deberes comprobados por papá',goal:5,v:p=>p.counters.tasks,c:10},
  {id:'casa20',e:'🏠',n:'Superayudante',d:'20 tareas o deberes comprobados por papá',goal:20,v:p=>p.counters.tasks,c:25},
  {id:'retos5',e:'🎩',n:'Retos del alcalde',d:'Supera 5 retos del alcalde',goal:5,v:p=>p.counters.retos,c:15},
  {id:'artista',e:'🎨',n:'Artista',d:'Guarda 5 diseños libres',goal:5,v:p=>p.counters.designs,c:8},
  {id:'deco10',e:'🛋️',n:'Decoradora',d:'Coloca 10 cosas dentro de tu casa',goal:10,v:p=>casaCuenta(p.room),c:15},
  {id:'ahorro',e:'💰',n:'Hucha llena',d:'Gana 500 botones en total',goal:500,v:p=>p.counters.earned,c:15}
];
function checkMedals(p){
  const out=[];
  for(const m of MEDALS){ if(!p.medals[m.id] && m.v(p)>=m.goal){ p.medals[m.id]=today(); p.coins+=m.c; out.push(m); addNews(p,m.e,`ha ganado la medalla «${m.n}»`); } }
  return out;
}
async function afterRewards(){
  const p=P(); if(!p) return;
  await showRankUps();
  const nm=checkMedals(p);
  if(nm.length){
    save('Medalla: '+nm.map(m=>m.n).join(', ')); sfxLevel();
    await say({center:true,html:`<div class="reward"><div style="font-size:30px;font-weight:800">🏅 ¡${nm.length>1?'Medallas nuevas':'Medalla nueva'}!</div><div class="rw-items">${nm.map(m=>`<div class="rw-item" style="text-align:center"><div style="font-size:40px">${m.e}</div>${esc(m.n)}<br><span style="font-size:14px;color:var(--soft)">🔘 +${m.c}</span></div>`).join('')}</div></div>`,buttons:[{t:'¡Genial!',cls:'primary'}]});
    speakAuto('Medalla nueva: '+nm.map(m=>m.n).join(', '));
    await showRankUps();
  }
  if(curScreen==='village') updateHUD();
}

/* ---------- días y racha ---------- */
function dayNum(s){ const [y,m,d]=s.split('-').map(Number); return Math.round(Date.UTC(y,m-1,d)/864e5); }
let dayChecking=false;
async function newDayCheck(){
  const p=P(); if(!p||dayChecking) return;
  const t=today();
  if(p.days.last===t){ ensureDaily(p); updateHUD(); return; }
  dayChecking=true;
  try{
    const gap=p.days.last?dayNum(t)-dayNum(p.days.last):1;
    if(!p.days.last) p.days.streak=1;
    else if(gap===1) p.days.streak++;
    else if(gap>1) p.days.streak=Math.max(1,p.days.streak-2*(gap-1));
    p.days.last=t; p.days.count=(p.days.count||0)+1; p.days.best=Math.max(p.days.best||0,p.days.streak);
    ensureDaily(p); ensureRecurring(p);
    const gift=2+Math.min(p.days.streak,5); p.coins+=gift; p.counters.earned+=gift; addXP(p,1);
    save('Nuevo día · racha '+p.days.streak);
    if(p.days.count>1){
      const growing=jdPlantas(p).some(plQuiereAgua)||plPidenAbono(p).length>0;
      const lost = gap>1 ? ` Como estuviste ${gap-1===1?'un día':(gap-1)+' días'} sin venir, tu racha ha bajado un poquito, ¡pero no pasa nada!` : '';
      await say({face:'🧔',name:NPCS.alcalde.n,text:`¡Buenos días, ${p.name}! Tu regalo de hoy: ${gift} botones. Racha: ${p.days.streak} ${p.days.streak===1?'día':'días'} 🔥.${lost} Hay ${p.daily.list.length} encargos nuevos en el taller.${growing?' ¡Y no olvides regar tu jardín!':''}`});
    } else {
      await say({face:'🧔',name:NPCS.alcalde.n,text:`¡Hola, ${p.name}! Soy el alcalde. Cada día te esperan encargos nuevos en el taller y un regalo de bienvenida. ¡Hoy tienes ${gift} botones para empezar!`});
    }
    await afterRewards(); updateHUD();
  } finally { dayChecking=false; }
}

/* ---------- encargos del día ---------- */
function ensureDaily(p){
  const t=today(); if(p.daily && p.daily.date===t) return;
  const firstDay=(p.days.count||1)<=1;
  const total=firstDay?4:3, maxStory=firstDay?2:1;
  const list=ENC.filter(e=>e.lvl<=p.unlocked && !p.done[e.id]).slice(0,Math.min(total,maxStory)).map(e=>({id:e.id}));
  const R=rng(t+'|'+p.id+'|tipos');
  const types=tlvTypesFor(p);
  const used=new Set(list.map(x=>(ENC.find(e=>e.id===x.id)||{}).type));
  // el concepto más nuevo sale con más frecuencia
  const fresh=p.unlocked>=3?['cab','mot']:p.unlocked>=2?['cab','rep']:['seq','cua'];
  let i=0; while(list.length<total){
    let cand=types.filter(x=>!used.has(x)); if(!cand.length) cand=types.slice();
    const pref=cand.filter(x=>fresh.includes(x)); const type=(pref.length&&R()<0.6)?pref[Math.floor(R()*pref.length)]:cand[Math.floor(R()*cand.length)];
    used.add(type);
    const id='g'+t.replace(/-/g,'')+'_'+i; const g=genEncargo(p,t+'|'+p.id+'|'+i,'gen',id,type); i++; list.push({id,gen:g});
  }
  p.daily={date:t,list,done:{},bonus:false};
  saveQuiet();
}
async function dailyBonusCheck(p){
  if(!p.daily||p.daily.bonus) return;
  if(!p.daily.list.every(x=>p.daily.done[x.id])) return;
  if(!p.daily.math) return;
  if(cuadernosFor(p).length && !p.daily.read) return;
  p.daily.bonus=true; addNews(p,'🧶','ha completado la ruta del día'); p.coins+=3; p.counters.earned+=3; addXP(p,2); save('Terminó los encargos del día');
  fanfare();
  await say({center:true,html:`<div class="reward"><div style="font-size:56px">🎉</div><div style="font-size:26px;font-weight:800">¡Ruta del día completada!</div><div class="rw-items"><div class="rw-item">🔘 +3 botones</div><div class="rw-item">✨ +2 experiencia</div></div><div style="font-size:18px">Mañana llegarán más. ¿Has regado tu jardín?</div></div>`,buttons:[{t:'¡Hurra!',cls:'primary'}]});
}

/* ---------- generador de encargos ---------- */
function rng(seed){ let h=1779033703^seed.length; for(let i=0;i<seed.length;i++){ h=Math.imul(h^seed.charCodeAt(i),3432918353); h=h<<13|h>>>19; } let a=h>>>0;
  return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function shuffle(a,R){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(R()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const GARMENTS=['Bufanda','Gorro','Cojín','Alfombra','Mantita','Bolso','Cinta','Tapete','Cortina','Mochila','Estuche','Toalla','Delantal','Funda','Mantel'];
const GSTYLE=['de rayas','de colores','con dibujo','alegre','para el invierno','para regalar','de fiesta','para el picnic'];
const ASK={
  seq:'Necesito esta tela, punto a punto y en orden. ¿Me la tejes?',
  reglas:'¡Se me han escapado unos puntos! ¿Descubres la regla y los completas?',
  rep:'Esta tela tiene un trocito que se repite. ¡Hazla con pocas tarjetas!',
  mot:'Mi tela tiene dos tipos de fila. ¡Usa los motivos A y B!',
  hilo:'Bip bip. He preparado el programa de este encargo. ¿Lo revisas antes de tejer?',
  cab:'¡Programa el cabezal del telar para que teja esta tela!',
  cua:'Mi cuadro mágico está a medias. ¿Lo completas sin repetir colores?'
};

/* ---------- plantas y jardín ---------- */
function rollPlant(p){
  const r=Math.random(); const lvl= (r<0.08&&p.unlocked>=3)?3 : (r<0.33&&p.unlocked>=2)?2 : 1;
  const [e,n]=pick(PLANTS[lvl]); return {k:'pl_'+e,e,n,rar:['','Común','Rara','Especial'][lvl]};
}
function needFor(k){ if(k&&k.startsWith('pl_')){ const e=k.slice(3); return PLANTS[3].some(([x])=>x===e)?3:2; } return 0; }
function cellObj(c){ if(!c) return null; if(typeof c==='string'){ const n=needFor(c); return {k:c,g:n,need:n}; } return c; }
function cellEmoji(c){ if(c.g>=c.need){ const i=itemInfo(c.k); return [i.e,i.f]; } return [c.g===0?'🌱':'🌿',null]; }
function needsWater(p){ return p.lastWater!==today() && jdPlantas(p).some(plQuiereAgua); }
async function waterGarden(){
  const p=P(); if(p.lastWater===today()){ toast('¡Ya has regado hoy! Vuelve mañana.'); return; }
  p.lastWater=today(); p.counters.water++;
  const R=plRiega(p), bloomed=R.flor; // etapas y abono: jardin-plantas.js
  bloomed.forEach(k=>{ p.counters.bloomed++; p.bloomedKinds[itemInfo(k).e]=1; });
  const pideAhora=plPidenAbono(p).length;
  const coins=1+bloomed.length+2*R.etapa.length; p.coins+=coins; p.counters.earned+=coins; addXP(p,1);
  GD.rain=1.8;
  save('Regó el jardín'+(bloomed.length?` · ${bloomed.length} planta(s) florecida(s)`:''));
  [700,800,900].forEach((f,i)=>setTimeout(()=>beep(f,0.08,'sine',0.04),i*90));
  renderHouse();
  const names=bloomed.map(k=>itemInfo(k).n), et=R.etapa.map(o=>`tu ${itemInfo(o.k).n.toLowerCase()} ya es un ${plEtapa(o).n}`);
  const txt=(bloomed.length?`¡Ha${bloomed.length>1?'n':''} crecido del todo: ${names.join(', ')}! `:'')+(et.length?`¡Mira: ${et.join(' y ')}! `:'')+(!bloomed.length&&!et.length?'Tus plantas están creciendo. ':'')+`Ganas ${coins} botones.`+(pideAhora?` ${pideAhora===1?'Una planta pide':pideAhora+' plantas piden'} abono 🌾: sin abono no crecen.`:' ¡Vuelve mañana a regarlas!');
  await say({face:'💧',name:'¡Jardín regado!',text:txt});
  await afterRewards(); renderHouse();
}
