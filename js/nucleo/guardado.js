"use strict";
/* =========================================================
   GUARDADO
   ========================================================= */
const TEST = (()=>{ try{ return new URLSearchParams(location.search).has('prueba'); }catch(e){ return false; } })();
/* ?alcalde: «alcalde a distancia» (el móvil o el ordenador de papá). Ve las partidas de la nube y manda órdenes;
   nunca escribe una partida. Guarda su copia de lo visto aparte, en 'villaovillo.alcalde'. */
const REMOTO = !TEST && (()=>{ try{ return new URLSearchParams(location.search).has('alcalde'); }catch(e){ return false; } })();
const KEY = TEST ? 'villaovillo.prueba' : REMOTO ? 'villaovillo.alcalde' : 'villaovillo.v1';
const CFG = window.VILLA_CONFIG || {scriptUrl:''};
let DB = {profiles:[null,null], cur:0, dayOffset:0, msgs:[]};
let VISIT=null; // paseo del alcalde: {from: índice de la niña activa antes de entrar}
function uid(){ return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function migrate(p){
  if(!p) return p;
  p.id=p.id||uid(); p.stats=p.stats||{}; p.play=p.play||{}; p.rewarded=p.rewarded||{}; p.pendingMsg=p.pendingMsg||{}; p.updatedAt=p.updatedAt||Date.now();
  p.readExtra=p.readExtra||{date:'',coins:0}; // botones de repasos extra de la biblioteca hoy (tope 6)
  p.lec=p.lec||{}; p.lec.t=p.lec.t||{}; p.lec.rep=p.lec.rep||{date:'',n:0}; p.lec.cap=p.lec.cap||{date:'',coins:0}; // lecciones de la Biblioteca (temas, repasos y tope diario)
  p.paq=p.paq||{}; // datos de cada niña dentro de cada paquete (paqDatosNina); nunca se borran
  p.xp=p.xp||0; p.rank=p.rank||0; p.days=p.days||{last:null,streak:0,best:0,count:0};
  p.counters=Object.assign({encargos:Object.keys(p.done||{}).length,firstTry:0,hiloRight:0,bloomed:0,water:0,tasks:0,designs:0,earned:p.coins||0,retos:0},p.counters||{});
  p.medals=p.medals||{}; p.bloomedKinds=p.bloomedKinds||{}; p.gardenRows=p.gardenRows||4;
  if(!p.mastery) p.mastery={telar:p.counters.encargos||0,pan:Object.values(p.math||{}).reduce((a,v)=>a+(v.ok||0),0),bib:Object.keys(p.sr||{}).length};
  if(p.panLv==null) p.panLv=3; // escalera de cuentas del grupo 9 (0-5), ver PAN9_LEVELS
  p.bridge=p.bridge||0; p.tlv=p.tlv||{}; p.tlvRun=p.tlvRun||{}; p.newsSeen=p.newsSeen||0; p.code=p.code||'';
  p.garden=(p.garden||[]).map(cellObj); while(p.garden.length<8*p.gardenRows) p.garden.push(null);
  if(p.room&&typeof casaNueva==='function'){ p.room.wl=p.room.wl||Array(6).fill(null); casaNueva(p); casaReconcilia(p); } // casa de 10×4 (suelo.js): la de antes (fl) no se toca
  return p;
}
/* Protección del guardado: si la partida no se puede leer, se aparta en KEY+'.danada' en vez de perderse;
   una vez al día se guarda una copia en KEY+'.copia' (fecha en KEY+'.copiaFecha'), recuperable desde «Restaurar». */
let DB_DAMAGED=false, saveWarned=0;
function load(){
  let raw=null; try{ raw=localStorage.getItem(KEY); }catch(e){}
  if(raw){ try{ const d=JSON.parse(raw); if(!d||!d.profiles) throw 0; DB=Object.assign({dayOffset:0,msgs:[]},d); }
    catch(e){ DB_DAMAGED=true; try{ if(!localStorage.getItem(KEY+'.danada')) localStorage.setItem(KEY+'.danada',raw); }catch(e2){} } }
  DB.profiles=DB.profiles.map(migrate);
  if(raw&&!DB_DAMAGED){ try{ if(localStorage.getItem(KEY+'.copiaFecha')!==today()){ localStorage.setItem(KEY+'.copia',raw); localStorage.setItem(KEY+'.copiaFecha',today()); } }catch(e){ try{ localStorage.removeItem(KEY+'.copia'); localStorage.removeItem(KEY+'.copiaFecha'); }catch(e2){} } }
}
function writeDB(){
  const s=JSON.stringify(DB);
  try{ localStorage.setItem(KEY,s); return true; }
  catch(e){ // sin sitio: se sacrifica la copia diaria y se reintenta
    try{ localStorage.removeItem(KEY+'.copia'); localStorage.removeItem(KEY+'.copiaFecha'); localStorage.setItem(KEY,s); return true; }catch(e2){}
    if(Date.now()-saveWarned>60000){ saveWarned=Date.now(); try{ toast('⚠️ No se ha podido guardar en la tablet. Avisa a papá.',5000); }catch(e3){} }
    return false; }
}
let lastEvent='';
function save(evento){
  if(VISIT||REMOTO){ saveQuiet(); return; }
  const p=P(); if(p){ p.updatedAt=Date.now(); if(evento) lastEvent = lastEvent? lastEvent+' · '+evento : evento; }
  writeDB();
  if(p) scheduleCloud();
}
function saveQuiet(){ writeDB(); }
function P(){ return DB.profiles[DB.cur]; }
/* Solo en el modo prueba: ?prueba&fecha=2026-12-20 hace que el juego crea que es ese día (para probar paquetes de temporada). */
const FECHA_PRUEBA_MS = (()=>{ if(!TEST) return 0; try{ const f=new URLSearchParams(location.search).get('fecha'); if(!f) return 0;
  const t=new Date(f+'T12:00:00').getTime(); if(isNaN(t)) return 0; const d=new Date(); d.setHours(12,0,0,0); return Math.round((t-d.getTime())/864e5)*864e5; }catch(e){ return 0; } })();
function now(){ return Date.now() + FECHA_PRUEBA_MS + (DB.dayOffset||0)*864e5; }
function today(){ const d=new Date(now()); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function newProfile(name, age, color){
  return migrate({name, age, color, unlocked:1, done:{}, coins:0, inv:{}, garden:Array(32).fill(null),
          fabrics:[], stories:[], beads:[], voice:false, streak:0, master:false, seenHelp:{}, met:false, lvlRewarded:{}});
}
