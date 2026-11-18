"use strict";
/* =========================================================
   ALCALDE A DISTANCIA (?alcalde) Y ÓRDENES DEL ALCALDE
   ---------------------------------------------------------
   Todo lo que papá cambia (tareas, cartas, retos, notas, validar, ajustes) es una «orden»:
   {id, para: id de la niña | 'todas' | 'pueblo', tipo, dato}.
   - En la tablet, alcHaz() aplica la orden en el momento.
   - En el móvil (?alcalde), alcHaz() la apunta en la nube (necesita el PIN), la aplica a lo que se ve
     y la tablet la aplica a la partida de verdad la próxima vez que se conecta (aplicaOrdenesNube).
   El móvil nunca envía una partida: así no puede pisar el progreso de las niñas.
   Las órdenes se pueden aplicar dos veces sin cambiar nada (por si se corta la conexión a mitad).
   ========================================================= */
const ORD_SET_NINA=/^(mathFocus|panLv|code|tlv\.[a-z]+)$/;
const ORD_SET_PUEBLO=/^(dayMode|paqForce\.[\w-]+)$/;
const ORD_TAREAS=['carta','casa','deberes','reto'];
function ordTexto(v,n){ return String(v==null?'':v).slice(0,n); }
function ordNum(v,a,b,def){ v=Math.round(+v); return isFinite(v)?Math.max(a,Math.min(b,v)):def; }
function ordNota(n,papa){ n=n||{}; return {id:ordTexto(n.id,30)||'n'+Date.now().toString(36),from:papa?'Papá, el alcalde':ordTexto(n.from,30),fromId:'alcalde',text:ordTexto(n.text,140),t:+n.t||Date.now(),col:ordTexto(n.col,20)||undefined,seen:false}; }
/* Aplica una orden. Devuelve true (hecha), false (no permitida o imposible) o null (aún no: la niña no está en esta tablet). */
function aplicaOrden(o){
  const d=o.dato||{}, esPueblo=o.para==='pueblo'||o.para==='todas';
  const p=esPueblo?null:DB.profiles.find(q=>q&&q.id===o.para);
  if(!esPueblo&&!p) return null;
  const msg=id=>localMsgs().find(m=>m.id===id);
  switch(o.tipo){
    case 'set': {
      const c=String(d.campo||''); let v=d.valor;
      if(p){
        if(!ORD_SET_NINA.test(c)) return false;
        if(c==='mathFocus'){ v=ordTexto(v,30); p.mathFocus=v; }
        else if(c==='panLv'){ p.panLv=ordNum(v,0,PAN9_LEVELS.length-1,3); }
        else if(c==='code'){ v=String(v||''); if(v&&!/^\d{4}$/.test(v)) return false; p.code=v; }
        else { const k=c.slice(4); if(!TLV_TYPES.includes(k)) return false; p.tlv=p.tlv||{}; p.tlv[k]=ordNum(v,1,TLV_MAX,1); p.tlvRun=p.tlvRun||{}; p.tlvRun[k]=0; }
        p.updatedAt=Date.now(); return true;
      }
      if(o.para!=='pueblo'||!ORD_SET_PUEBLO.test(c)) return false;
      if(c==='dayMode'){ if(!['auto','dia','noche'].includes(v)) return false; DB.dayMode=v; try{ nightCache.t=0; }catch(e){} return true; }
      const id=c.slice(9); if(v!==true&&v!==false&&v!==null) return false;
      DB.paqForce=DB.paqForce||{}; if(v===null) delete DB.paqForce[id]; else DB.paqForce[id]=v; return true;
    }
    case 'tarea': { // carta, tarea de casa, deberes o reto de tejer
      const tipo=d.tipo; if(!ORD_TAREAS.includes(tipo)) return false;
      const texto=ordTexto(d.texto,400).trim(); if(!texto) return false;
      const premio=ordNum(d.premio,0,100,tipo==='carta'?0:10);
      let extra; if(tipo==='reto'){ const w=ordNum((d.extra||{}).w,2,10,6), t=String((d.extra||{}).t||'').replace(/[^rbygwp]/g,'').slice(0,100); if(!t||t.length%w) return false; extra={w,t}; }
      const ids=o.para==='todas'?DB.profiles.filter(Boolean).map(q=>q.id):[p.id];
      ids.forEach(pid=>{ const id='L'+o.id+'-'+pid; if(!msg(id)) localMsgs().push(Object.assign({id,para:pid,tipo,texto,premio,estado:'nuevo',t:Date.now()},extra?{extra}:{})); });
      return true;
    }
    case 'validar': { const m=msg(d.id); if(!m) return false; if(['nuevo','aceptada','hecha'].includes(m.estado)) m.estado='validada'; return true; }
    case 'quitar':  { const m=msg(d.id); if(!m) return false; if(!['cobrada','completado','leida'].includes(m.estado)) m.estado='borrada'; return true; }
    case 'recAdd': {
      if(!['casa','deberes'].includes(d.tipo)) return false; const texto=ordTexto(d.texto,300).trim(); if(!texto) return false;
      const para=d.para==='todas'?'todas':String(d.para||''); if(para!=='todas'&&!DB.profiles.some(q=>q&&q.id===para)) return null;
      DB.recTasks=DB.recTasks||[]; if(!DB.recTasks.some(r=>r.rid===o.id)) { const dias=Array.isArray(d.dias)?[...new Set(d.dias.map(Number).filter(x=>x>=0&&x<=6&&Number.isInteger(x)))]:[];
        DB.recTasks.push(Object.assign({rid:o.id,para,tipo:d.tipo,texto,premio:ordNum(d.premio,1,100,10)},dias.length&&dias.length<7?{dias}:{})); }
      if(!REMOTO) DB.profiles.filter(Boolean).forEach(ensureRecurring);
      return true;
    }
    case 'recDel': DB.recTasks=(DB.recTasks||[]).filter(r=>r.rid!==d.rid); return true;
    case 'nota': { const n=ordNota(d.n,true); if(!n.text) return false; corkPonNota(n); return true; } // sustituye a la nota anterior del alcalde
    case 'sugLeida': { const s=(DB.sugs||[]).find(x=>x.id===d.id); if(!s) return false; s.leida=true; if(d.resp) s.resp=ordTexto(d.resp,300); return true; }
    case 'notaDel': { const L=corkMsgs(), k=L.findIndex(x=>x.id===d.id); if(k>=0){ corkHistMarca(L[k],'papa'); L.splice(k,1); } return true; }
    case 'pizNota': { if(!p) return false; const n=ordNota(d.n,false); n.from='Papá'; if(!n.text) return false; const b=boardOf(p); if(!b.notes.some(x=>x.id===n.id)){ b.notes.unshift(n); if(b.notes.length>30) b.notes.length=30; } p.updatedAt=Date.now(); return true; }
    case 'pizDel': { if(!p) return false; const b=boardOf(p), k=b.notes.findIndex(x=>x.id===d.id); if(k>=0) b.notes.splice(k,1); p.updatedAt=Date.now(); return true; }
  }
  return false;
}
const ORD_TIPOS=['set','tarea','validar','quitar','recAdd','recDel','nota','notaDel','pizNota','pizDel','sugLeida'];
function ordenPermitida(o){ if(!ORD_TIPOS.includes(o.tipo)) return false; if(o.tipo!=='set') return true;
  return o.para==='pueblo'?ORD_SET_PUEBLO.test(o.dato.campo||''):ORD_SET_NINA.test(o.dato.campo||''); }
/* Papá hace un cambio. En la tablet se aplica ya; en el móvil se envía a la nube. Devuelve true si salió bien. */
async function alcHaz(para,tipo,dato,txt){
  const o={para,tipo,dato:Object.assign({},dato,txt?{_t:txt}:{})};
  if(!ordenPermitida(o)){ toast('Eso no se puede cambiar desde aquí'); return false; }
  if(REMOTO){
    try{ const r=await api('addOrden',{pin:remPin(),orden:o}); o.id=r.id; }
    catch(e){ toast(e.message==='accion'?'⚠️ Falta actualizar el programa de Google (mira las instrucciones)':e.message==='pin'?'⚠️ El PIN del alcalde no es correcto':'⚠️ Sin conexión: no se ha enviado. Prueba otra vez.',4500); return false; }
    o.estado='pendiente'; o.fecha=new Date().toISOString(); REM.ordenes.push(o);
  } else { o.id='x'+Date.now().toString(36)+Math.random().toString(36).slice(2,5); o.fecha=new Date().toISOString(); }
  if(!REMOTO){ const x=ordAplicaAqui(o); if(x.r===false){ toast('No se ha podido hacer'); return false; } if(x.subir) scheduleCloud(); saveQuiet(); return true; }
  const r=aplicaOrden(o);
  if(r===false&&!REMOTO){ toast('No se ha podido hacer'); return false; }
  saveQuiet(); return true;
}
/* Tablet: aplica las órdenes que llegan de la nube, sube las partidas cambiadas y avisa de que están hechas. */
async function aplicaOrdenesNube(list){
  if(REMOTO||TEST||VISIT) return;
  const res=[], tocadas=new Set(), pend=new Set(list.map(o=>o.id));
  // las pendientes de la nube y las que ya aplicó otra tablet (DB.ordHechas), por orden de fecha
  const todas=list.concat((DB.ordHechas||[]).filter(o=>!pend.has(o.id))).sort((a,b)=>String(a.fecha||'').localeCompare(String(b.fecha||'')));
  let hay=false;
  for(const o of todas){
    const x=ordAplicaAqui(o); if(x.r===null) continue; if(!x.ya) hay=true;
    if(pend.has(o.id)) res.push({id:o.id,estado:x.r?'aplicada':'rechazada'});
    if(x.subir) tocadas.add(x.subir);
  }
  if(!res.length&&!hay) return;
  saveQuiet();
  for(const p of tocadas){ p.updatedAt=Date.now(); try{ await api('save',{profile:p,sum:summary(p),evento:''}); }catch(e){ return; } }
  if(!(await pushPueblo())) return;
  if(res.length) try{ await api('ordenHecha',{res}); }catch(e){}
  saveQuiet();
  if(curScreen==='village') updateHUD(); else if(curScreen==='board') renderBoard(); else if(curScreen==='mail') renderMail();
}

/* ---------- El móvil del alcalde ---------- */
const REM={ordenes:[],hechas:[],at:0,error:''};
function remPin(){ try{ return localStorage.getItem('villaovillo.alcaldePin')||''; }catch(e){ return ''; } }
async function startRemoto(){
  document.body.classList.add('remoto');
  try{ const c=JSON.parse(localStorage.getItem('villaovillo.alcaldeEstado')||'null'); if(c){ REM.ordenes=c.ordenes||[]; REM.hechas=c.hechas||[]; REM.at=c.at||0; } }catch(e){}
  if(!CFG.scriptUrl){ renderAlcalde(); show('alcalde'); toast('Falta la dirección de la nube en config.js'); return; }
  if(!cloudKey()||!remPin()){ if(!(await remLogin())) return startRemoto(); }
  renderAlcalde(); show('alcalde');
  await remCargar();
}
async function remLogin(){
  const r=await say({center:true,face:'🎩',name:'Alcalde a distancia',speak:false,
    html:`<div style="font-size:18px">Desde aquí ves los pueblos de tus hijas y les dejas tareas, cartas y ajustes. Sus partidas no se tocan: los cambios llegan a la tablet en cuanto se conecta.</div>
      <div class="lbl">Clave de la familia</div><input class="inputline" id="rl-key" type="password" autocomplete="off">
      <div class="lbl">PIN del alcalde</div><input class="inputline" id="rl-pin" type="password" inputmode="numeric" autocomplete="off">`,
    buttons:[{t:'Entrar',cls:'primary'}]});
  const k=(document.getElementById('rl-key')||{}).value||'', pin=(document.getElementById('rl-pin')||{}).value||'';
  if(r!==0||!k.trim()||!pin.trim()){ toast('Escribe la clave y el PIN'); return false; }
  try{ localStorage.setItem('villaovillo.alcaldeClave',k.trim()); }catch(e){}
  try{ await api('checkPin',{pin:pin.trim()}); }
  catch(e){ toast(e.message==='clave'?'La clave no es correcta':e.message==='pin'?'El PIN no es correcto':'No hay conexión con la nube',3500); try{ localStorage.removeItem('villaovillo.alcaldeClave'); }catch(e2){} return false; }
  try{ localStorage.setItem('villaovillo.alcaldePin',pin.trim()); }catch(e){}
  toast('🎩 ¡Bienvenido, alcalde!'); return true;
}
function remGuardaEstado(){ try{ localStorage.setItem('villaovillo.alcaldeEstado',JSON.stringify({ordenes:REM.ordenes.slice(-60),hechas:REM.hechas.slice(-40),at:REM.at})); }catch(e){} }
async function remCargar(){
  REM.error='cargando'; if(curScreen==='alcalde') renderAlcalde();
  let j; try{ j=await api('load',{pin:remPin()}); REM.error=''; if(!j.papa) throw new Error('pin'); }
  catch(e){ REM.error=e.message==='clave'||e.message==='pin'?'clave':'red'; if(curScreen==='alcalde') renderAlcalde(); return false; }
  const ps=(j.profiles||[]).map(x=>migrate(x.state)).filter(Boolean).slice(0,2);
  const cur=P()&&P().id;
  DB.profiles=[ps[0]||null,ps[1]||null];
  const i=DB.profiles.findIndex(p=>p&&p.id===cur); DB.cur=i>=0?i:0;
  DB.msgs=j.msgs||[];
  const pu=j.pueblo||{};
  ['news','boardMsgs','notasHist','recTasks','localMsgs','paq','sugs'].forEach(k=>{ DB[k]=pu[k]||(k==='paq'?{}:[]); });
  DB.dayMode=pu.dayMode||'auto'; DB.paqForce=pu.paqForce||{};
  REM.puebloEn=pu.en||0; REM.sinPueblo=!j.pueblo; REM.version=j.version||1;
  // las órdenes que la tablet aún no ha recogido se vuelven a aplicar a lo que se ve
  const pend=j.ordenes||[];
  REM.ordenes=pend.map(o=>Object.assign({},o,{estado:'pendiente'}));
  REM.hechas=j.ordenesHechas||[]; REM.historial=(j.historial||[]).slice(-10).reverse();
  pend.forEach(o=>{ try{ aplicaOrden(o); }catch(e){} });
  REM.at=Date.now(); saveQuiet(); remGuardaEstado();
  if(VISIT){ if(!P()) DB.cur=girlsIdx()[0]||0; setupNPCs(); renderVisitBar(); updateHUD(); }
  if(curScreen==='alcalde') renderAlcalde(); else if(curScreen==='board') renderBoard(); else if(curScreen==='ficha') openFicha();
  return true;
}
function remHora(t){ if(!t) return '—'; const d=new Date(t); const h=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); return d.toDateString()===new Date().toDateString()?'hoy a las '+h:d.getDate()+'/'+(d.getMonth()+1)+' a las '+h; }
function ordenTexto(o){ const d=o.dato||{}; if(d._t) return d._t;
  const n=o.para==='todas'?'las dos':o.para==='pueblo'?'el pueblo':((DB.profiles.find(p=>p&&p.id===o.para)||{}).name||'?');
  return ({tarea:'Mensaje para '+n,set:'Ajuste de '+n,validar:'Validar una tarea',quitar:'Quitar una tarea',recAdd:'Tarea de cada día',recDel:'Quitar tarea de cada día',nota:'Nota en el tablón',notaDel:'Quitar nota',pizNota:'Mensaje en la pizarra de '+n,pizDel:'Quitar mensaje de la pizarra'})[o.tipo]||o.tipo; }
function renderRemotoBox(V,box){
  const b=box('📡 Alcalde a distancia');
  const st=REM.error==='cargando'?'☁️ Cargando los datos de la nube…':REM.error==='red'?'⚠️ Sin conexión. Ves los datos de '+remHora(REM.at)+'.':REM.error==='clave'?'⚠️ La clave o el PIN han cambiado: vuelve a entrar.':'☁️ Datos de la nube de '+remHora(REM.at)+'.';
  b.append(el('div','counter',st+(REM.puebloEn?' La tablet se conectó por última vez '+remHora(REM.puebloEn)+'.':'')));
  if(REM.sinPueblo&&!REM.error) b.append(el('div','counter','ℹ️ El tablón y las tareas de cada día se verán aquí cuando la tablet se conecte con la versión nueva del juego.'));
  if(REM.version<2&&!REM.error) b.append(el('div','wnote','⚠️ El programa de Google es de la versión anterior: actualízalo para poder enviar cambios desde aquí.'));
  if(!DB.profiles.some(Boolean)&&!REM.error) b.append(el('div','counter','Todavía no hay ninguna partida en la nube. Aparecerán cuando las niñas jueguen en la tablet con la nube puesta.'));
  const r=el('div'); r.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin-top:8px';
  const ra=el('button','btn primary','🔄 Actualizar'); ra.onclick=()=>remCargar(); r.append(ra);
  if(REM.error==='clave'){ const re=el('button','btn','🔑 Volver a entrar'); re.onclick=remSalir; r.append(re); }
  b.append(r);
  const pend=REM.ordenes.filter(o=>o.estado==='pendiente'), hechas=REM.hechas.slice(-6).reverse();
  if(pend.length||hechas.length){
    const w=el('div'); w.style.marginTop='10px';
    w.append(el('div','lbl',pend.length?`⏳ Esperando a la tablet (${pend.length})`:'Últimos cambios'));
    pend.slice(-8).reverse().forEach(o=>w.append(el('div','counter','⏳ '+esc(ordenTexto(o)))));
    hechas.forEach(o=>w.append(el('div','counter',(o.estado==='aplicada'?'✅ ':'⛔ ')+esc(ordenTexto(o))+' · '+(o.estado==='aplicada'?'en la tablet ':'no se pudo, ')+remHora(o.actualizado))));
    b.append(w);
  }
}
function renderNovedadesBox(box){
  if(!REM.historial||!REM.historial.length) return;
  const b=box('📰 Lo último que han hecho');
  REM.historial.forEach(h=>b.append(el('div','counter','<b>'+esc(h.nombre)+'</b> · '+esc(h.evento)+' · '+remHora(h.fecha))));
}
function remSalir(){ ['villaovillo.alcaldeClave','villaovillo.alcaldePin','villaovillo.alcaldeEstado'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} }); try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); }

/* ---------- Reto de tejer: papá diseña la tela ---------- */
const RETO={w:6,h:3,col:'r',cells:null};
function retoDesigner(){
  if(!RETO.cells||RETO.cells.length!==RETO.w*RETO.h) RETO.cells=Array(RETO.w*RETO.h).fill('w');
  const wrap=el('div');
  const sz=el('div'); sz.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap';
  const mk=(lbl,vals,cur,fn)=>{ const s=el('select','inputline'); s.style.cssText='width:auto;min-height:42px;font-size:16px'; vals.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=lbl+' '+v; if(v===cur) o.selected=true; s.append(o); }); s.onchange=()=>fn(+s.value); return s; };
  sz.append(mk('Ancho',[4,5,6,7,8],RETO.w,v=>{ RETO.w=v; RETO.cells=null; redraw(); }),mk('Filas',[2,3,4,5,6],RETO.h,v=>{ RETO.h=v; RETO.cells=null; redraw(); }));
  const pal=el('div','choice'); pal.style.cssText='justify-content:flex-start;margin:8px 0';
  const grid=el('div'); grid.style.cssText='display:inline-grid;gap:3px;touch-action:none;padding:6px;background:#efe3cf;border-radius:12px';
  function redraw(){
    if(!RETO.cells||RETO.cells.length!==RETO.w*RETO.h) RETO.cells=Array(RETO.w*RETO.h).fill('w');
    pal.innerHTML=''; Object.entries(COLORS).forEach(([k,c])=>{ const d=el('button','dot'+(RETO.col===k?' sel':'')); d.style.cssText=`width:40px;height:40px;background:${c.c};border-radius:50%`; d.title=c.n; d.onclick=()=>{ RETO.col=k; redraw(); }; pal.append(d); });
    grid.innerHTML=''; grid.style.gridTemplateColumns=`repeat(${RETO.w},34px)`;
    RETO.cells.forEach((k,i)=>{ const c=el('div'); c.dataset.i=i; c.style.cssText=`width:34px;height:34px;border-radius:8px;background:${COLORS[k].c};border:2px solid rgba(0,0,0,.12)`; grid.append(c); });
  }
  const paint=ev=>{ const t=document.elementFromPoint(ev.clientX,ev.clientY); if(t&&t.parentNode===grid&&t.dataset.i!=null){ RETO.cells[+t.dataset.i]=RETO.col; t.style.background=COLORS[RETO.col].c; } };
  let down=false; grid.onpointerdown=ev=>{ down=true; paint(ev); }; grid.onpointermove=ev=>{ if(down) paint(ev); }; addEventListener('pointerup',()=>{ down=false; });
  redraw(); wrap.append(sz,pal,grid); return wrap;
}
function renderRetoBox(box){
  const b=box('🎯 Reto de tejer');
  b.append(el('div','counter','Dibuja una tela. Le llegará al buzón y tendrá que tejerla con las tarjetas del telar.'));
  const f=el('div'); f.innerHTML=`<div class="lbl">Para</div><select class="inputline" id="rt-para">${profileOptions()}</select><div class="lbl">Qué le dices</div><input class="inputline" id="rt-texto" value="¿Puedes tejer esta tela?"><div class="lbl">Premio (botones)</div><input class="inputline" id="rt-premio" type="number" value="15" min="1" max="100">`;
  b.append(f, retoDesigner());
  const s=el('button','btn primary','🎯 Enviar el reto'); s.style.marginTop='10px';
  s.onclick=async()=>{ const para=$('#rt-para').value, texto=$('#rt-texto').value.trim()||'¿Puedes tejer esta tela?';
    if(RETO.cells.every(k=>k===RETO.cells[0])){ toast('Usa al menos dos colores'); return; }
    if(await alcHaz(para,'tarea',{tipo:'reto',texto,premio:Math.max(1,+$('#rt-premio').value||15),extra:{w:RETO.w,t:RETO.cells.join('')}},'Reto de tejer para '+(para==='todas'?'las dos':(DB.profiles.find(p=>p&&p.id===para)||{}).name))){ toast('🎯 ¡Reto enviado!'); RETO.cells=null; renderAlcalde(); } };
  b.append(s);
}
