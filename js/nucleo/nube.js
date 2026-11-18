"use strict";
/* =========================================================
   NUBE (Google Apps Script)
   ========================================================= */
let cloudStatus='off', cloudTimer=null;
function cloudKey(){ try{ return localStorage.getItem(REMOTO?'villaovillo.alcaldeClave':'villaovillo.clave')||''; }catch(e){ return ''; } }
function cloudReady(){ return !TEST && !REMOTO && !!(CFG.scriptUrl && cloudKey()); } // el alcalde a distancia nunca sincroniza partidas
async function api(action,data={}){
  const r=await fetch(CFG.scriptUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({action,key:cloudKey()},data))});
  const j=await r.json(); if(!j.ok) throw new Error(j.error||'error'); return j;
}
function summary(p){ return {nivel:p.unlocked, encargos:Object.keys(p.done).length, estrellas:Object.values(p.done).reduce((a,b)=>a+b,0), botones:p.coins}; }
function scheduleCloud(){ if(!cloudReady()) return; clearTimeout(cloudTimer); cloudTimer=setTimeout(pushCloud,3000); }
async function pushCloud(){
  const p=P(); if(!p||!cloudReady()) return;
  const ev=lastEvent; setCloud('sync');
  p.dev=devId();
  try{ await api('save',{profile:p,sum:summary(p),evento:ev}); if(lastEvent===ev) lastEvent=''; else lastEvent=lastEvent.slice(ev.length).replace(/^ · /,''); setCloud('ok'); await flushPending(); await pushPueblo(); }
  catch(e){ setCloud(e.message==='clave'?'clave':'err'); }
}
async function flushPending(){
  for(const p of DB.profiles){ if(!p) continue;
    for(const [id,est] of Object.entries(p.pendingMsg||{})){ try{ await api('msgState',{id,estado:est}); delete p.pendingMsg[id]; }catch(e){ return; } }
  }
  saveQuiet();
}
let cloudBusy=false;
async function cloudPull(mergeProfiles=true){
  if(!cloudReady()||cloudBusy) return false;
  cloudBusy=true; setCloud('sync');
  try{
    const j=await api('load');
    if(mergeProfiles){
      for(const cp of (j.profiles||[])){
        const st=migrate(cp.state); if(mergeProfiles==='others'&&P()&&st.id===P().id) continue; const i=DB.profiles.findIndex(p=>p&&p.id===st.id);
        if(i>=0){ if((st.updatedAt||0)>(DB.profiles[i].updatedAt||0)) DB.profiles[i]=st; }
        else { const free=DB.profiles.findIndex(p=>!p); if(free>=0) DB.profiles[free]=st; }
      }
    }
    DB.msgs=(j.msgs||[]);
    for(const p of DB.profiles){ if(!p) continue; for(const [id,est] of Object.entries(p.pendingMsg||{})){ const m=DB.msgs.find(m=>m.id===id); if(m) m.estado=est; } }
    saveQuiet(); setCloud('ok'); await flushPending();
    if(j.pueblo&&mezclaPueblo(j.pueblo)) saveQuiet();
    await aplicaOrdenesNube(j.ordenes||[]);
    await pushPueblo();
    if(curScreen==='village') updateHUD(); if(curScreen==='mail') renderMail();
    return true;
  }catch(e){ setCloud(e.message==='clave'?'clave':'err'); return false; }
  finally{ cloudBusy=false; }
}
/* Lo común del pueblo (tablón, tareas, ajustes) se sube para que papá lo vea desde el móvil. Solo si ha cambiado. */
let puebloSubido='';
function puebloDatos(){ return {news:(DB.news||[]).slice(-40),boardMsgs:DB.boardMsgs||[],notasHist:(DB.notasHist||[]).slice(-120),recTasks:DB.recTasks||[],localMsgs:(DB.localMsgs||[]).slice(-200),dayMode:DB.dayMode||'auto',paqForce:DB.paqForce||{},ajT:DB.ajT||0,paq:DB.paq||{},sugs:(DB.sugs||[]).slice(-100),recBorradas:DB.recBorradas||[],errores:(DB.errores||[]).slice(-20),ordHechas:(DB.ordHechas||[]).slice(-150),en:Date.now()}; }
async function pushPueblo(){
  if(!cloudReady()) return true;
  const d=puebloDatos(), h=JSON.stringify(Object.assign({},d,{en:0}));
  if(h===puebloSubido) return true;
  try{ await api('pueblo',{pueblo:d}); puebloSubido=h; return true; }catch(e){ return false; }
}
function setCloud(s){ cloudStatus=s; const c=$('#cloudchip'); if(c) c.innerHTML=cloudLabel(); }
function cloudLabel(){
  if(TEST) return '🧪 Prueba: sin nube';
  if(!CFG.scriptUrl) return '☁️ Nube: sin configurar';
  if(!cloudKey()) return '☁️ Nube: falta la clave';
  return {off:'☁️ Nube',ok:'☁️ Guardado en la nube',sync:'☁️ Sincronizando…',err:'⚠️ Sin conexión (se guarda en la tablet)',clave:'⚠️ Clave incorrecta'}[cloudStatus]||'☁️';
}
