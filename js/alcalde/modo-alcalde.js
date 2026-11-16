"use strict";
/* =========================================================
   TABLÓN DE TAREAS + MODO ALCALDE (local, con PIN)
   ========================================================= */
function localMsgs(){ DB.localMsgs=DB.localMsgs||[]; return DB.localMsgs; }
function isTask(m){ return m.tipo==='casa'||m.tipo==='deberes'; }
function myTasks(){ const p=P(); if(!p) return []; return myMsgs().filter(m=>isTask(m)&&!['borrada','caducada'].includes(m.estado)); }
function taskCount(){ const p=P(); if(!p) return 0; return myTasks().filter(m=>m.estado==='nuevo'||(m.estado==='validada'&&!p.rewarded[m.id])).length; }
function ensureRecurring(p){
  const t=today(); DB.recTasks=DB.recTasks||[];
  localMsgs().forEach(m=>{ if(m.rid&&m.day&&m.day<t&&['nuevo','aceptada'].includes(m.estado)) m.estado='caducada'; });
  DB.recTasks.forEach(r=>{
    if(r.para!=='todas'&&r.para!==p.id) return;
    if(localMsgs().some(m=>m.rid===r.rid&&m.para===p.id&&m.day===t)) return;
    localMsgs().push({id:'L'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),rid:r.rid,day:t,para:p.id,tipo:r.tipo,texto:r.texto,premio:r.premio,estado:'nuevo'});
  });
  saveQuiet();
}
function openBoard(){ const p=P(); if(VISIT) DB.profiles.filter(Boolean).forEach(ensureRecurring); else ensureRecurring(p); renderBoard(); show('board'); if(!TEST&&!VISIT) cloudPull(false); }

/* ---- PIN del alcalde (local) ---- */
function pinHash(s){ let h=7; for(const ch of String(s)) h=(h*31+ch.charCodeAt(0))%1000003; return 'h'+h; }
/* Informe para Claude: resumen compacto que papá copia y pega en el proyecto */
function buildReport(){
  const days=Object.keys(Object.assign({},...DB.profiles.filter(Boolean).map(p=>Object.assign({},p.play||{},p.log||{})))).sort();
  const perf=DB.profiles.filter(Boolean).map(p=>{
    const ty={}; Object.values(p.stats||{}).forEach(st=>{ const k=st.type||'?'; const o=ty[k]=ty[k]||{v:0,a1:0,i:0,s3:0,seg:0}; o.v+=st.plays||0; o.a1+=st.firstTry?1:0; o.i+=st.tries||0; o.s3+=st.best===3?1:0; o.seg+=st.secs||0; });
    const cu={}; cuadernosFor(p).forEach(c=>{ let sab=0,vis=0; const flojas=[]; c.preguntas.forEach((q,i)=>{ const s=(p.sr||{})[c.id+':'+i]; if(s){ vis++; if(s.b>=2) sab++; if(s.f&&s.b<2) flojas.push(q.q); } }); cu[c.id]={titulo:c.titulo,preguntas:c.preguntas.length,vistas:vis,sabidas:sab,flojas}; });
    const log={}; days.slice(-120).forEach(d=>{ const L=Object.assign({},(p.log||{})[d]||{}); if(p.play&&p.play[d]) L.min=Math.round(p.play[d]/60); if(Object.keys(L).length) log[d]=L; });
    return {nombre:p.name,edad:p.age,botones:p.coins,ganados:p.counters.earned||0,nivelTelar:p.unlocked,
      maestria:{telar:[mLevel(p,'telar'),(p.mastery||{}).telar||0],pan:[mLevel(p,'pan'),(p.mastery||{}).pan||0],bib:[mLevel(p,'bib'),(p.mastery||{}).bib||0]},
      nivelesReto:Object.fromEntries(TLV_TYPES.map(t=>[t,tlvOf(p,t)])),
      racha:p.days.streak||0,mejorRacha:p.days.best||0,diasJugados:p.days.count||0,medallas:Object.keys(p.medals||{}).length,
      puente:p.bridge||0,tareas:p.counters.tasks||0,retos:p.counters.retos||0,historias:(p.stories||[]).length,
      tiposTelar:ty,mates:p.math||{},cuadernos:cu,dias:log};
  });
  const data={v:1,fecha:today(),puente:[bridgeTotal(),BRIDGE_GOAL],perfiles:perf};
  return 'VILLAOVILLO-INFORME v1 '+today()+'\n'+JSON.stringify(data);
}
async function copyText(t){
  try{ await navigator.clipboard.writeText(t); return true; }catch(e){}
  try{ const ta=document.createElement('textarea'); ta.value=t; document.body.append(ta); ta.select(); const ok=document.execCommand('copy'); ta.remove(); return ok; }catch(e){ return false; }
}
async function openAlcalde(){ if(!(await askPin())) return; renderAlcalde(); show('alcalde'); }
function profileOptions(withAll=true){ return DB.profiles.filter(Boolean).map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')+(withAll&&DB.profiles.filter(Boolean).length>1?'<option value="todas">Las dos</option>':''); }
function renderAlcalde(){
  const V=$('#alc-body'); V.innerHTML='';
  const box=(title)=>{ const d=el('div','panel'); d.style.marginBottom='14px'; d.append(el('div','wsec',title)); V.append(d); return d; };
  // supervisión
  const b0=box(VISIT?'🚶 Estás paseando por el pueblo':'👀 Ver el juego por dentro');
  b0.append(el('div','counter',VISIT?'Vuelve al pueblo cuando quieras o sal del paseo.':'Entra al pueblo como alcalde: mira sus casas, sus encargos y cómo crece el pueblo de cada una, sin tocar su partida.'));
  const r0=el('div'); r0.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin-top:8px';
  if(VISIT){ const bv=el('button','btn primary','🚶 Volver al pueblo'); bv.onclick=()=>show('village'); r0.append(bv); const bx=el('button','btn','🚪 Terminar el paseo'); bx.onclick=endVisit; r0.append(bx); }
  else girlsIdx().forEach(i=>{ const q=DB.profiles[i]; const bv=el('button','btn primary','🚶 Pueblo de '+esc(q.name)); bv.onclick=()=>startVisit(i); r0.append(bv); });
  const bf=el('button','btn blue','📊 Fichas de las niñas'); bf.onclick=()=>openFicha(); r0.append(bf);
  b0.append(r0);
  renderCodesBox(V,box);
  renderPaquetesBox(box);
  const bn=box('🌙 Día y noche');
  bn.append(el('div','counter','Normalmente el pueblo sigue la hora real. Aquí puedes dejarlo fijo de día o de noche.'));
  const rn=el('div','choice'); rn.style.cssText='justify-content:flex-start;margin-top:8px';
  [['auto','🕐 Según la hora'],['dia','☀️ Siempre de día'],['noche','🌙 Siempre de noche']].forEach(([k,t])=>{ const b=el('button',(DB.dayMode||'auto')===k?'sel':'',t); b.onclick=()=>setDayMode(k); rn.append(b); });
  bn.append(rn);
  // pendientes de validar
  const all=(DB.msgs||[]).concat(localMsgs());
  const pend=all.filter(m=>isTask(m)&&['hecha','aceptada'].includes(m.estado));
  const b1=box(`✅ Tareas por comprobar (${pend.filter(m=>m.estado==='hecha').length})`);
  if(!pend.length) b1.append(el('div','counter','No hay nada pendiente.'));
  pend.forEach(m=>{ const pr=DB.profiles.find(p=>p&&p.id===m.para); const r=el('div','mitem'); r.innerHTML=`<div class="mi">${m.tipo==='deberes'?'📚':'🧹'}</div><div class="mt"><b>${esc(pr?pr.name:'?')} · ${m.estado==='hecha'?'dice que la ha hecho':'la ha aceptado'}</b>${esc(m.texto)}</div>`;
    const a=el('div','ma'); const v=el('button','btn green','✅ Validar'); v.onclick=()=>{ validateMsg(m); renderAlcalde(); }; a.append(v); r.append(a); b1.append(r); });
  // nueva tarea
  const b2=box('📌 Nueva tarea para el tablón');
  const f=el('div'); f.innerHTML=`<div class="lbl">Para</div><select class="inputline" id="a-para">${profileOptions()}</select>
    <div class="lbl">Tipo</div><select class="inputline" id="a-tipo"><option value="casa">🧹 Tarea de casa</option><option value="deberes">📚 Deberes del cole</option></select>
    <div class="lbl">Qué hay que hacer</div><input class="inputline" id="a-texto" placeholder="Ej.: Recoger la habitación">
    <div class="lbl">Premio (botones)</div><input class="inputline" id="a-premio" type="number" value="10" min="1" max="100">
    <label style="display:flex;gap:8px;align-items:center;font-size:18px;margin:6px 0"><input type="checkbox" id="a-rec" style="width:24px;height:24px"> 📅 Repetir cada día</label>`;
  const send=el('button','btn primary','Poner en el tablón'); send.onclick=()=>{
    const para=$('#a-para').value, tipo=$('#a-tipo').value, texto=$('#a-texto').value.trim(), premio=Math.max(1,+$('#a-premio').value||10), rec=$('#a-rec').checked;
    if(!texto){ toast('Escribe la tarea'); return; }
    if(rec){ DB.recTasks=DB.recTasks||[]; DB.recTasks.push({rid:'r'+Date.now().toString(36),para,tipo,texto,premio}); DB.profiles.filter(Boolean).forEach(ensureRecurring); }
    else { const targets=para==='todas'?DB.profiles.filter(Boolean).map(p=>p.id):[para];
      targets.forEach(pid=>localMsgs().push({id:'L'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),para:pid,tipo,texto,premio,estado:'nuevo'})); }
    saveQuiet(); toast('📌 ¡Tarea puesta en el tablón!'); renderAlcalde();
  };
  f.append(send); b2.append(f);
  // tareas diarias
  const b3=box('📅 Tareas de cada día');
  (DB.recTasks||[]).forEach((r,i)=>{ const pr=DB.profiles.find(p=>p&&p.id===r.para); const row=el('div','mitem'); row.innerHTML=`<div class="mi">${r.tipo==='deberes'?'📚':'🧹'}</div><div class="mt"><b>${r.para==='todas'?'Las dos':esc(pr?pr.name:'?')} · 🔘 ${r.premio}</b>${esc(r.texto)}</div>`;
    const a=el('div','ma'); const d=el('button','btn','🗑️ Quitar'); d.onclick=()=>{ DB.recTasks.splice(i,1); saveQuiet(); renderAlcalde(); }; a.append(d); row.append(a); b3.append(row); });
  if(!(DB.recTasks||[]).length) b3.append(el('div','counter','Ninguna. Marca «Repetir cada día» al crear una tarea.'));
  // informe
  const bi=box('📊 Informe para Claude');
  bi.append(el('div','counter','Copia el informe y pégalo en el proyecto de Villaovillo. Claude lo usa para actualizar el registro y las estadísticas.'));
  const rowI=el('div'); rowI.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin-top:8px';
  const bc=el('button','btn primary','📋 Copiar informe'); bc.onclick=async()=>{ const ok=await copyText(buildReport()); toast(ok?'📋 Informe copiado':'No se pudo copiar'); };
  rowI.append(bc);
  if(navigator.share){ const bs=el('button','btn','📤 Enviar'); bs.onclick=()=>{ navigator.share({title:'Informe Villaovillo '+today(),text:buildReport()}).catch(()=>{}); }; rowI.append(bs); }
  bi.append(rowI);
  // carta
  const b4=box('✉️ Escribir una carta');
  const fc=el('div'); fc.innerHTML=`<select class="inputline" id="c-para">${profileOptions()}</select><input class="inputline" id="c-texto" placeholder="¡Estoy muy orgulloso de ti!"><div class="lbl">Regalo (botones, opcional)</div><input class="inputline" id="c-premio" type="number" value="0" min="0" max="50">`;
  const cs=el('button','btn primary','Enviar carta'); cs.onclick=()=>{ const para=$('#c-para').value, texto=$('#c-texto').value.trim(); if(!texto){ toast('Escribe la carta'); return; }
    const targets=para==='todas'?DB.profiles.filter(Boolean).map(p=>p.id):[para];
    targets.forEach(pid=>localMsgs().push({id:'L'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),para:pid,tipo:'carta',texto,premio:+$('#c-premio').value||0,estado:'nuevo'}));
    saveQuiet(); toast('✉️ ¡Carta en el buzón!'); renderAlcalde(); };
  fc.append(cs); b4.append(fc);
  // foco de mates
  const b5=box('🥐 Mates: ¿qué están dando en clase?');
  DB.profiles.filter(Boolean).forEach(p=>{
    const row=el('div'); row.style.margin='6px 0';
    const opts=p.age<=7?[['','Variado'],['sumas','Sumas'],['restas','Restas'],['dinero','Dinero'],['contar','Contar']]:[['','Variado'],...[2,3,4,5,6,7,8,9].map(n=>['tabla:'+n,'Tabla del '+n]),['division','Repartos (dividir)'],['dinero','Dinero y cambio'],['fracciones','Fracciones'],['problemas','Problemas de dos pasos']];
    row.innerHTML=`<b>${esc(p.name)}</b> <select class="inputline">${opts.map(([v,t])=>`<option value="${v}" ${p.mathFocus===v?'selected':''}>${t}</option>`).join('')}</select>`;
    row.querySelector('select').onchange=ev=>{ p.mathFocus=ev.target.value; p.updatedAt=Date.now(); saveQuiet(); toast('Guardado'); };
    b5.append(row);
    if(p.age>7){ // escalera de cuentas: nivel central de la mezcla
      const lv=el('div','mitem'); lv.style.cssText='padding:8px 12px;align-items:center;margin:4px 0 10px';
      const L=panLvOf(p);
      lv.innerHTML=`<div class="mt"><b>Nivel de cuentas de ${esc(p.name)}: ${L+1} de ${PAN9_LEVELS.length}</b>${esc(PAN9_LEVELS[L].n)}<div class="counter">Cada turno: la mayoría de este nivel, alguno de repaso (🌱, 1 botón) y alguno de reto (🔥, 3 botones). Con «Variado».</div></div>`;
      const a=el('div','ma'); const mi=el('button','btn','–'), pl=el('button','btn','+');
      const setL=d=>{ p.panLv=Math.max(0,Math.min(PAN9_LEVELS.length-1,panLvOf(p)+d)); p.updatedAt=Date.now(); saveQuiet(); renderAlcalde(); };
      mi.onclick=()=>setL(-1); pl.onclick=()=>setL(1); a.append(mi,pl); lv.append(a); b5.append(lv);
    }
  });
  const b7=box('🧹 Empezar de cero');
  b7.append(el('div','counter','Borra las partidas de esta tablet (jugadoras, progreso y tareas). Úsalo antes de que tus hijas empiecen a jugar.'));
  const rz=el('button','btn','🧹 Reiniciar todo el juego'); rz.style.marginTop='8px'; rz.onclick=async()=>{ const a=await say({center:true,face:'⚠️',name:'¿Reiniciar todo?',text:'Se borrarán las dos partidas, las tareas y los mensajes de esta tablet. No se puede deshacer.',buttons:[{t:'No'},{t:'Sí, borrar todo',cls:'primary'}],speak:false}); if(a!==1) return;
    const b=await say({center:true,face:'⚠️',name:'Última confirmación',text:'¿Seguro de verdad?',buttons:[{t:'Cancelar'},{t:'Borrar',cls:'primary'}],speak:false}); if(b!==1) return;
    try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); };
  b7.append(rz);
  const b6=box('🔐 Seguridad');
  const cp=el('button','btn','Cambiar PIN'); cp.onclick=()=>{ try{ localStorage.removeItem('villaovillo.pinLocal'); }catch(e){} toast('Ahora crea un PIN nuevo'); openAlcalde(); }; b6.append(cp);
}
function validateMsg(m){
  if(!String(m.id).startsWith('L')){ toast('Esta tarea llegó desde la nube: valídala desde el panel del móvil.'); return; }
  m.estado='validada';
  if(!String(m.id).startsWith('L')&&cloudReady()) api('msgState',{id:m.id,estado:'validada',pin:''}).catch(()=>{});
  saveQuiet(); toast('✅ Validada: ya puede recoger su premio');
}
