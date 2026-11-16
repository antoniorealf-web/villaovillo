"use strict";
/* =========================================================
   BUZÓN: cartas, tareas y retos del alcalde
   ========================================================= */
const MAIL_ICON={carta:'✉️',casa:'🧹',deberes:'📚',reto:'🎯'};
const MAIL_NAME={carta:'Carta del alcalde',casa:'Tarea de casa',deberes:'Deberes',reto:'Reto del alcalde'};
function myMsgs(){ const p=P(); if(!p) return []; return (DB.msgs||[]).concat(DB.localMsgs||[]).filter(m=>m.para===p.id && m.estado!=='borrada'); }
function mailCount(){ const p=P(); if(!p) return 0; return myMsgs().filter(m=>!isTask(m)&&(m.estado==='nuevo'||(m.estado==='validada'&&!p.rewarded[m.id]))).length; }
function setMsgState(m,estado){
  m.estado=estado; const p=P();
  if(String(m.id).startsWith('L')){ save(); return; }
  if(!TEST){ p.pendingMsg[m.id]=estado; }
  save(); if(!TEST&&cloudReady()) api('msgState',{id:m.id,estado}).then(()=>{ delete p.pendingMsg[m.id]; saveQuiet(); }).catch(()=>{});
}
function openMail(){ renderMail(); show('mail'); if(!TEST) cloudPull(false); }
function renderMail(){
  const p=P(); $('#mail-coins').textContent='🔘 '+p.coins;
  const L=$('#mlist'); L.innerHTML='';
  const list=myMsgs().filter(m=>!isTask(m)).slice().reverse();
  if(!list.length){ L.append(el('div','help','<div style="font-size:30px">📭</div><div>Tu buzón está vacío. ¡El alcalde te escribirá pronto!</div>')); return; }
  list.forEach(m=>{
    const it=el('div','mitem'+((m.estado==='nuevo'||(m.estado==='validada'&&!p.rewarded[m.id]))?' nuevo':''));
    it.append(el('div','mi',MAIL_ICON[m.tipo]||'✉️'));
    const tx=el('div','mt',`<b>${MAIL_NAME[m.tipo]||'Mensaje'}${m.premio?` · 🔘 ${m.premio}`:''}</b>${esc(m.texto||'')}`);
    if(m.tipo==='reto'&&m.extra&&m.extra.t) tx.append(fabricCanvas(m.extra.t.split(''),m.extra.w,{s:Math.max(10,Math.min(22,Math.floor(180/m.extra.w)))}));
    it.append(tx);
    const a=el('div','ma');
    const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(m.texto||''); a.append(sp);
    const B=(t,cls,fn)=>{ const b=el('button','btn '+(cls||''),t); b.onclick=fn; a.append(b); };
    if(m.tipo==='carta'){
      if(m.estado==='nuevo') B('Leer','primary',()=>readLetter(m)); else a.append(el('div','counter','Leída'));
    } else if(m.tipo==='reto'){
      if(m.estado==='completado') a.append(el('div','counter','✅ Superado')); else B('🎯 Aceptar reto','primary',()=>openReto(m));
    } else {
      if(m.estado==='nuevo') B('✅ ¡Ya la hice!','green',()=>doneTask(m));
      else if(m.estado==='hecha') a.append(el('div','counter','⏳ Esperando a que papá lo compruebe'));
      else if(m.estado==='validada'&&!p.rewarded[m.id]) B('🎁 Recoger premio','primary',()=>collectTask(m));
      else a.append(el('div','counter','✅ Premio recogido'));
    }
    it.append(a); L.append(it);
  });
}
async function readLetter(m){
  const p=P();
  await say({face:'🧔',name:'Carta del alcalde',text:m.texto||''});
  if(m.premio&&!p.rewarded[m.id]){ p.rewarded[m.id]=1; p.coins+=m.premio; fanfare(); toast(`🔘 +${m.premio} botones de regalo`); }
  setMsgState(m,'leida'); renderMail();
}
async function doneTask(m){
  setMsgState(m,'hecha'); beep(700,0.1,'triangle');
  await say({face:'🧔',name:'Papá, el alcalde',text:'¡Muy bien! Lo comprobaré y, si está hecho, te daré tu premio.'});
}
async function collectTask(m){
  const p=P(); if(p.rewarded[m.id]) return;
  p.rewarded[m.id]=1; p.coins+=m.premio||10; p.counters.earned+=m.premio||10; p.beads.push(m.tipo==='deberes'?'#4a8fdc':'#f29b38');
  const pl=rollPlant(p), pe=pl.e, pn=pl.n; p.inv[pl.k]=(p.inv[pl.k]||0)+1; p.counters.tasks++; addXP(p,3); logAct(p,'ta',1,1);
  setMsgState(m,'cobrada'); save('Premio: '+(MAIL_NAME[m.tipo]||'')); fanfare();
  await say({center:true,html:`<div class="reward"><div style="font-size:56px">🎁</div><div style="font-size:26px;font-weight:800">¡Papá lo ha comprobado!</div><div class="rw-items"><div class="rw-item">🔘 +${m.premio||10} botones</div><div class="rw-item">${pe} ${esc(pn)}</div><div class="rw-item">📿 cuenta nueva</div><div class="rw-item">✨ +3 experiencia</div></div></div>`});
  await afterRewards();
}
function openReto(m){
  const x=m.extra||{w:6,t:'rwrwrw'};
  const e={id:'msg_'+m.id,lvl:P().unlocked,type:'custom',npc:'alcalde',title:'Reto del alcalde',story:null,ask:m.texto||'¿Puedes tejer esto?',v6:{w:x.w,t:x.t},v9:{w:x.w,t:x.t},msg:m};
  openPuzzle(e);
}
async function successCustom(){
  const p=P(), e=PZ.e, m=e.msg; const stars=PZ.attempts<=1?3:PZ.attempts===2?2:1;
  const first=!p.rewarded[m.id]; let items=[];
  if(first){
    p.rewarded[m.id]=1; const coins=m.premio||15; p.coins+=coins; items.push(`🔘 +${coins} botones`);
    const pl=rollPlant(p); p.inv[pl.k]=(p.inv[pl.k]||0)+1; items.push(`${pl.e} ${pl.n}`); p.counters.earned+=coins;
    p.beads.push(mostCommon(PZ.target)); items.push('📿 cuenta nueva');
    p.fabrics.push({cells:PZ.target.slice(),w:PZ.v.w,name:'Reto del alcalde',by:'alcalde'});
  }
  recordStats(p,e.id,stars,'custom'); logAct(p,'t',1,stars===3?1:0,'custom'); addMastery(p,'telar',1);
  if(first){ p.counters.retos++; addXP(p,3); items.push('✨ +3 experiencia'); }
  setMsgState(m,'completado'); save('Superó un reto del alcalde '+'★'.repeat(stars)); fanfare();
  await say({center:true,html:`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:26px;font-weight:800">¡Reto superado!</div><div class="rw-items">${items.map(i=>`<div class="rw-item">${i}</div>`).join('')}</div><div style="font-size:18px">🧔 «¡Sabía que lo conseguirías!»</div></div>`});
  await afterRewards();
  openMail();
}
