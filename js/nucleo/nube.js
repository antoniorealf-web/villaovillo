/* =========================================================
   NUBE (Google Apps Script)
   ========================================================= */
let cloudStatus='off', cloudTimer=null;
function cloudKey(){ try{ return localStorage.getItem('villaovillo.clave')||''; }catch(e){ return ''; } }
function cloudReady(){ return !TEST && !!(CFG.scriptUrl && cloudKey()); }
async function api(action,data={}){
  const r=await fetch(CFG.scriptUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({action,key:cloudKey()},data))});
  const j=await r.json(); if(!j.ok) throw new Error(j.error||'error'); return j;
}
function summary(p){ return {nivel:p.unlocked, encargos:Object.keys(p.done).length, estrellas:Object.values(p.done).reduce((a,b)=>a+b,0), botones:p.coins}; }
function scheduleCloud(){ if(!cloudReady()) return; clearTimeout(cloudTimer); cloudTimer=setTimeout(pushCloud,3000); }
async function pushCloud(){
  const p=P(); if(!p||!cloudReady()) return;
  const ev=lastEvent; setCloud('sync');
  try{ await api('save',{profile:p,sum:summary(p),evento:ev}); if(lastEvent===ev) lastEvent=''; else lastEvent=lastEvent.slice(ev.length).replace(/^ · /,''); setCloud('ok'); await flushPending(); }
  catch(e){ setCloud(e.message==='clave'?'clave':'err'); }
}
async function flushPending(){
  for(const p of DB.profiles){ if(!p) continue;
    for(const [id,est] of Object.entries(p.pendingMsg||{})){ try{ await api('msgState',{id,estado:est}); delete p.pendingMsg[id]; }catch(e){ return; } }
  }
  saveQuiet();
}
async function cloudPull(mergeProfiles=true){
  if(!cloudReady()) return false;
  setCloud('sync');
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
    saveQuiet(); setCloud('ok'); flushPending();
    if(curScreen==='village') updateHUD(); if(curScreen==='mail') renderMail();
    return true;
  }catch(e){ setCloud(e.message==='clave'?'clave':'err'); return false; }
}
function setCloud(s){ cloudStatus=s; const c=$('#cloudchip'); if(c) c.innerHTML=cloudLabel(); }
function cloudLabel(){
  if(TEST) return '🧪 Prueba: sin nube';
  if(!CFG.scriptUrl) return '☁️ Nube: sin configurar';
  if(!cloudKey()) return '☁️ Nube: falta la clave';
  return {off:'☁️ Nube',ok:'☁️ Guardado en la nube',sync:'☁️ Sincronizando…',err:'⚠️ Sin conexión (se guarda en la tablet)',clave:'⚠️ Clave incorrecta'}[cloudStatus]||'☁️';
}
