"use strict";
/* =========================================================
   MODO PRUEBA
   ========================================================= */
function refreshScreen(){
  if(curScreen==='village'){ setupNPCs(); updateHUD(); }
  else if(curScreen==='workshop') renderWorkshop(); else if(curScreen==='house') renderHouse();
  else if(curScreen==='mail') renderMail(); else if(curScreen==='profiles') renderProfiles(); else if(curScreen==='shop') renderShop(); else if(curScreen==='book') renderBook();
  $('#tb-day').textContent=DB.dayOffset?`(día +${DB.dayOffset})`:'';
}
function initTestBar(){
  $('#testflag').style.display='block'; $('#testbar').classList.add('on','min');
  $('#tb-min').onclick=()=>$('#testbar').classList.toggle('min');
  const need=fn=>()=>{ const p=P(); if(!p||curScreen==='profiles'){ toast('Entra con una jugadora primero'); return; } fn(p); saveQuiet(); refreshScreen(); };
  const fakeMsg=(tipo,texto,extra)=>need(p=>{ DB.msgs.push({id:'t'+Date.now(),para:p.id,tipo,texto,premio:10,estado:'nuevo',extra}); toast('📬 Mensaje de prueba en el buzón'); });
  const B=[
    ['📚 Catálogo',()=>openCatalog()],
    ['Nivel 1',need(p=>setLevel(p,1))],['Nivel 2',need(p=>setLevel(p,2))],['Nivel 3',need(p=>setLevel(p,3))],
    ['+100 🔘',need(p=>{p.coins+=100;})],
    ['+plantas',need(p=>{ for(const l in PLANTS) for(const [e] of PLANTS[l]) p.inv['pl_'+e]=(p.inv['pl_'+e]||0)+1; ['L1','L2','L3','M'].forEach(k=>p.inv[k]=(p.inv[k]||0)+1); })],
    ['Todo hecho',need(async p=>{ ENC.forEach(e=>p.done[e.id]=3); p.unlocked=3; saveQuiet(); await checkLevelUp(); refreshScreen(); })],
    ['+1 día',async()=>{ DB.dayOffset=(DB.dayOffset||0)+1; saveQuiet(); toast('📅 Ahora es '+today()); if(P()&&curScreen!=='profiles'){ await newDayCheck(); } refreshScreen(); }],
    ['+20 maestría',need(async p=>{ ['telar','pan','bib'].forEach(k=>addMastery(p,k,20)); saveQuiet(); await afterRewards(); refreshScreen(); })],
    ['+200 🔘 puente',need(p=>{ p.bridge=(p.bridge||0)+200; toast('🌉 '+bridgeTotal()+'/'+BRIDGE_GOAL); })],
    ['Regar ya',need(p=>{ p.lastWater=null; toast('💧 Puedes volver a regar'); })],
    ['Carta',fakeMsg('carta','¡Hola, tejedora! Estoy muy orgulloso de ti. Te mando unos botones de regalo.')],
    ['Tarea casa',fakeMsg('casa','Recoge los juguetes de tu cuarto.')],
    ['Deberes',fakeMsg('deberes','Repasa la tabla del 7.')],
    ['Reto',fakeMsg('reto','He diseñado esta tela para ti. ¿Te atreves?',{w:6,t:'rrwwrrwwrrwwbbbbbb'})],
    ['Papá valida',need(()=>{ DB.msgs.forEach(m=>{ if(m.estado==='hecha') m.estado='validada'; }); toast('✅ Tareas validadas'); })],
    ['Copiar partidas reales',()=>{ try{ const d=JSON.parse(localStorage.getItem('villaovillo.v1')); if(!d) throw 0; DB.profiles=d.profiles.map(migrate); saveQuiet(); renderProfiles(); show('profiles'); toast('Copiadas (los cambios aquí no les afectan)'); }catch(e){ toast('No hay partidas reales en este dispositivo'); } }],
    ['Reiniciar prueba',()=>{ try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); }]
  ];
  const box=$('#tb-btns'); B.forEach(([t,fn])=>{ const b=el('button','',t); b.onclick=fn; box.append(b); });
  refreshScreen();
}
function setLevel(p,n){ p.unlocked=n; ENC.forEach(e=>{ if(e.lvl<n) p.done[e.id]=p.done[e.id]||3; }); }

function initExtras(){
  if(TEST){ initTestBar(); if(location.hash==='#catalogo') setTimeout(openCatalog,50); }
  startPlayClock();
  if(cloudReady()) cloudPull(true).then(ok=>{ if(ok&&curScreen==='profiles') renderProfiles(); });
}
