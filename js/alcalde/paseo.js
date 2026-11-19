"use strict";
/* =========================================================
   PASEO DEL ALCALDE (supervisión: el pueblo visto por papá)
   ========================================================= */
const MATH_NAMES={divgrid:'Divisiones con dibujo',suma3:'Sumas de 3 cifras',resta2:'Restas de 2 cifras llevando',mult21:'2 cifras × 1',resta3a:'Restas de 3 cifras (una llevada)',mult21b:'2 cifras × 1 llevando',resta3:'Restas de 3 cifras llevando',mult31:'3 cifras × 1',resta0:'Restas con ceros',mult41:'4 cifras × 1',dospasos3:'Dos pasos (grandes)',mult22:'Multiplicar por 2 cifras',resto:'Repartos con resto',contar:'Contar',sumas:'Sumas',restas:'Restas',dinero:'Dinero',multi:'Multiplicar',suma100:'Sumas grandes',receta:'Recetas (doble y mitad)',reparto:'Repartos',cambio:'Cambio',dospasos:'Problemas de dos pasos',fraccion:'Fracciones'};
function girlsIdx(){ return DB.profiles.map((p,i)=>p?i:-1).filter(i=>i>=0); }
/* El pueblo es uno solo: se pasea sin elegir niña. Solo al mirar algo que es de cada una (sus encargos, sus botones)
   se pregunta de quién (elegirNina) o se enseñan las dos (fichas). */
function startVisit(i){
  const g=girlsIdx(); if(!g.length){ toast('Todavía no hay jugadoras'); return; }
  if(!VISIT) VISIT={from:DB.cur};
  DB.cur=g.includes(i)?i:g[0];
  player.placed=false; cam.ok=false; setupNPCs();
  $('#scr-village').classList.add('visit'); renderVisitBar(); show('village');
  toast('🎩 Toca los edificios para curiosear',2200);
}
function endVisit(){
  if(!VISIT) return; DB.cur=VISIT.from; VISIT=null; player.placed=false; cam.ok=false;
  $('#scr-village').classList.remove('visit'); saveQuiet(); renderAlcalde(); show('alcalde');
}
async function elegirNina(pregunta){
  const g=girlsIdx(); if(g.length<2) return g.length?g[0]:null;
  const r=await say({center:true,face:'🎩',name:pregunta,speak:false,buttons:[{t:'Cancelar'}].concat(g.map(i=>({t:DB.profiles[i].name,cls:'primary'})))});
  return r>=1?g[r-1]:null;
}
async function verEncargos(){ const i=await elegirNina('¿Los encargos de quién?'); if(i==null) return; DB.cur=i; openVTaller(); }
function renderVisitBar(){
  const nb=$('#vb-night'); if(nb) nb.textContent=nightLevel()>0.5?'☀️':'🌙';
  const w=$('#vb-who'); if(w) w.innerHTML=''; // ya no se elige niña para pasear: el pueblo es de las dos
}
$('#vb-map').onclick=()=>openMap();
$('#vb-ficha').onclick=()=>openFicha();
$('#vb-tablon').onclick=()=>openBoard();
$('#vb-exit').onclick=()=>endVisit();
$('#vb-night').onclick=()=>setDayMode(nightLevel()>0.5?'dia':'noche');
$('#ficha-back').onclick=()=>{ if(VISIT) show('village'); else { renderAlcalde(); show('alcalde'); } };
function drawMayorPlayer(c){
  drawDust(c);
  const hopY=player.hop>0?Math.sin((0.32-player.hop)/0.32*Math.PI)*7:0;
  drawNPCFig(c,'alcalde',player.x,player.y-hopY,{t:tGlobal,moving:player.moving,dir:player.dir||1,sc:1.45});
  c.font="800 16px 'Baloo 2',sans-serif"; c.textAlign='center'; c.textBaseline='middle';
  const label='Papá, el alcalde', tw=c.measureText(label).width+14; c.fillStyle='rgba(255,250,241,.9)'; roundRect(c,player.x-tw/2,player.y-170,tw,22,8); c.fill();
  c.fillStyle='#5a3d22'; c.fillText(label,player.x,player.y-159);
}
function visitTap(x,y){
  const p=P();
  for(const n of npcs){ if(Math.hypot(n.x-x,n.y-38-y)<44){ const info=NPCS[n.k]; npcVoice(n.k); say({face:info.e,name:info.n,text:`¡Hola, señor alcalde! ${pick(info.hi)}`,speak:false}); return; } }
  const go=(door,fn)=>{ tapFx={x:door[0],y:door[1],t:0}; if(andarA(player,door[0],door[1])<5){ player.act=null; fn(); } else player.act=fn; };
  for(const [k,i] of [['A',0],['B',1]]){ const [bx,by]=buzonPos(k); if(Math.abs(x-bx)<30&&y>by-110&&y<by+12){ const q=DB.profiles[i]; return go([bx-34,by+10],()=>{ if(!q){ toast('Buzón vacío'); return; } const n=mailCountOf(q); say({face:'📬',name:'Buzón de '+q.name,text:n?`Tiene ${n===1?'una carta o un reto sin abrir':n+' cartas o retos sin abrir'}.`:'No tiene nada sin abrir.',speak:false}); }); } }
  for(const e of edificiosActivos()){ if(e.otroLado&&!bridgeDone()) continue; if(edToca(e,x,y)) return go(edRect(e).door,()=>e.alcalde?e.alcalde({}):null); } // ver js/mundo/edificios.js
  if(x>=1790&&x<=1990&&y>=740&&y<=890) return go([1830,850],()=>say({face:'🦦',name:NPCS.lia.n,text:`El puente va por ${bridgeTotal()} de ${BRIDGE_GOAL} botones. ${DB.profiles.filter(Boolean).map(q=>q.name+' ha puesto '+(q.bridge||0)).join(' y ')}.`,speak:false}));
  if(x>=1870){ toast('Al otro lado del río están el Huerto y el Laboratorio (todavía cerrados)'); return; }
  if(player.x>1880){ player.x=1850; player.path=[]; }
  let tx=clamp(x,30,1860), ty=clamp(y,60,1580);
  if(inPond(tx,ty)){ const a=Math.atan2((ty-POND.y)/POND.ry,(tx-POND.x)/POND.rx); tx=POND.x+Math.cos(a)*(POND.rx+24); ty=POND.y+Math.sin(a)*(POND.ry+24); }
  andarA(player,tx,ty); player.act=null; tapFx={x:tx,y:ty,t:0};
}

/* ---- fichas ---- */
function pctTag(ok,tot){ if(!tot) return '<span class="pct n">—</span>'; const v=Math.round(ok/tot*100); return `<span class="pct ${v>=80?'g':v>=50?'a':'r'}">${v}%</span>`; }
function telarByType(p){
  const ty={}; Object.values(p.stats||{}).forEach(st=>{ const k=st.type||'?'; const o=ty[k]=ty[k]||{n:0,first:0,s3:0,plays:0,secs:0}; o.n++; o.plays+=st.plays||0; if(st.firstTry) o.first++; if(st.best===3) o.s3++; o.secs+=st.secs||0; });
  return ty;
}
function lastDays(n){ const out=[]; const d0=new Date(now()); for(let i=n-1;i>=0;i--){ const d=new Date(d0.getTime()-i*864e5); out.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')); } return out; }
function dayChart(p){
  const days=lastDays(14), W=320, H=110, bw=W/14;
  const mins=days.map(d=>Math.round(((p.play||{})[d]||0)/60));
  const ex=days.map(d=>{ const L=(p.log||{})[d]||{}; return ((L.t||[])[0]||0)+((L.p||[])[0]||0)+((L.b||[])[0]||0); });
  const mx=Math.max(20,...mins);
  let s=`<svg viewBox="0 -14 ${W} ${H+48}" width="100%" style="max-width:420px;display:block">`;
  s+=`<line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#e5d6bd" stroke-width="2"/>`;
  const L15=H-15/mx*H; s+=`<line x1="0" y1="${L15}" x2="${W}" y2="${L15}" stroke="#55b05a" stroke-dasharray="4 4" stroke-width="1.5"/><text x="${W-2}" y="${L15-3}" font-size="10" text-anchor="end" fill="#3c8546">15 min</text>`;
  days.forEach((d,i)=>{ const h=mins[i]/mx*H, x=i*bw+3; const wd='DLMXJVS'[new Date(d+'T12:00').getDay()];
    if(mins[i]) s+=`<rect x="${x}" y="${H-h}" width="${bw-6}" height="${h}" rx="5" fill="${p.color}"><title>${d}: ${mins[i]} min, ${ex[i]} ejercicios</title></rect><text x="${x+(bw-6)/2}" y="${H-h-3}" font-size="10" text-anchor="middle" fill="#4a3b2c">${mins[i]}</text>`;
    s+=`<text x="${x+(bw-6)/2}" y="${H+14}" font-size="11" text-anchor="middle" fill="${d===today()?'#e4574f':'#8a7660'}" font-weight="${d===today()?800:400}">${wd}</text>`;
    if(ex[i]) s+=`<text x="${x+(bw-6)/2}" y="${H+29}" font-size="10" text-anchor="middle" fill="#2f5f96">${ex[i]}</text>`; });
  s+='</svg>';
  const played=mins.filter(m=>m>0), tot=mins.reduce((a,b)=>a+b,0);
  return s+`<div class="counter">Arriba, minutos jugados; abajo, ejercicios hechos. ${played.length?`${played.length} días con juego · ${tot} min en total · ${Math.round(tot/played.length)} min de media`:'Sin datos de tiempo en estas dos semanas.'}</div>`;
}
function insights(p){
  const out=[]; const ty=telarByType(p);
  const tt=Object.entries(ty).filter(([k,o])=>o.n>=3).map(([k,o])=>({n:'Telar · '+(TYPE_NAMES[k]||k),r:o.first/o.n}));
  const mm=Object.entries(p.math||{}).filter(([k,o])=>o.total>=4).map(([k,o])=>({n:'Mates · '+(MATH_NAMES[k]||k),r:o.ok/o.total}));
  const all=tt.concat(mm).sort((a,b)=>b.r-a.r);
  if(all.length){ const top=all.filter(x=>x.r>=0.8).slice(0,2), low=all.filter(x=>x.r<0.6).slice(-2).reverse();
    if(top.length) out.push('💪 Le sale muy bien: '+top.map(x=>`${x.n} (${Math.round(x.r*100)}%)`).join(', ')+'.');
    if(low.length) out.push('🧩 Le cuesta: '+low.map(x=>`${x.n} (${Math.round(x.r*100)}%)`).join(', ')+'.');
    if(!top.length&&!low.length) out.push('Todo en un punto intermedio: ni muy fácil ni muy difícil.'); }
  else out.push('Todavía hay pocos ejercicios para sacar conclusiones.');
  const fl=[]; cuadernosFor(p).forEach(c=>c.preguntas.forEach((q,i)=>{ const s=(p.sr||{})[c.id+':'+i]; if(s&&s.f&&s.b<2) fl.push(q.q); }));
  if(fl.length) out.push(`📚 Preguntas que se le resisten: ${fl.length}.`);
  const last=p.days&&p.days.last; if(last&&last!==today()){ const dd=dayNum(today())-dayNum(last); if(dd>=2) out.push(`⏸️ Lleva ${dd} días sin jugar.`); }
  return out;
}
function fichaCard(p,i,focus){
  const c=el('div','fcard');
  const head=el('div','fhead'); head.append(avatarCanvas(p,84));
  const hd=el('div'); hd.innerHTML=`<div class="fn">${esc(p.name)}</div><div class="counter">${p.age<=7?'Grupo 6 (6-7 años)':'Grupo 9 (8-10 años)'}${p.days.last?` · jugó por última vez ${p.days.last===today()?'hoy':p.days.last.split('-').reverse().slice(0,2).join('/')}`:''}</div>`;
  head.append(hd); c.append(head);
  const tasks=(DB.msgs||[]).concat(localMsgs()).filter(m=>isTask(m)&&m.para===p.id);
  c.append(el('div','fchips',`<span>🔘 ${p.coins} botones</span><span>🏆 ${p.counters.earned||0} ganados</span><span>🔥 racha ${p.days.streak||0} (mejor ${p.days.best||0})</span><span>📅 ${p.days.count||0} días</span><span>🌉 ${p.bridge||0} al puente</span>`));
  // hoy
  const d=p.daily&&p.daily.date===today()?p.daily:null;
  const hoyMin=Math.round(((p.play||{})[today()]||0)/60);
  c.append(el('div','fsec',`<h4>☀️ Hoy</h4><div class="fnote">${d?`🧶 Telar ${d.list.filter(x=>d.done[x.id]).length} de ${d.list.length} · 🥐 Panadería ${d.math?'✅':'—'} · 🦉 Biblioteca ${d.read?'✅':'—'}${d.bonus?' · 🎉 ruta completa':''}`:'Todavía no ha entrado hoy.'} · ⏱️ ${hoyMin} min</div>`));
  // conclusiones
  c.append(el('div','fsec',`<h4>🔎 De un vistazo</h4>${insights(p).map(t=>`<div class="fnote">${esc(t)}</div>`).join('')}`));
  // tiempo
  const tc=el('div','fsec'); tc.innerHTML='<h4>⏱️ Últimas dos semanas</h4>'+dayChart(p); c.append(tc);
  // niveles
  let lv='<h4>⭐ Niveles</h4>';
  Object.entries(MAST).forEach(([a,M])=>{ const l=mLevel(p,a), n=(p.mastery||{})[a]||0; lv+=`<div class="frow"><span style="font-size:22px">${M.e}</span><div class="fl"><b>${M.n} ${l}</b> · ${esc(M.t[l-1])}<div class="pbar"><i style="width:${Math.round(mProgress(p,a)*100)}%"></i></div></div><span class="counter">${n}${l<M.th.length?' / '+M.th[l]:''}</span></div>`; });
  lv+=`<div class="counter">Telar: ${p.unlocked>=3?'todos los tipos de reto abiertos':'nivel '+p.unlocked+' de 3 ('+LEVELS[p.unlocked]+')'} · ${Object.keys(p.medals||{}).length}/${MEDALS.length} medallas · ${(p.stories||[]).length}/${Object.keys(STORIES).length} historias · ${Object.keys(p.bloomedKinds||{}).length}/12 plantas</div>`;
  c.append(el('div','fsec',lv));
  // telar
  const ty=telarByType(p); const tsec=el('div','fsec'); tsec.innerHTML=`<h4>🧶 Telar · ${p.counters.encargos||0} encargos</h4><div class="counter" style="margin-bottom:4px">El nivel de reto sube solo tras 2 encargos perfectos seguidos y baja tras 2 atascos. Puedes ajustarlo con – y +.</div>`;
  const tk=[...new Set(tlvTypesFor(p).concat(Object.keys(ty).filter(k=>k!=='custom'&&k!=='?')))];
  tsec.append(el('div','frow counter','<span class="fl">Tipo</span><span>Hechos</span><span style="min-width:52px;text-align:center">A la 1ª</span><span style="min-width:52px;text-align:center">3★</span><span style="min-width:112px;text-align:center">Nivel de reto</span>'));
  tk.forEach(k=>{ const o=ty[k]||{n:0,first:0,s3:0}; const r=el('div','frow',`<span class="fl">${esc(TYPE_NAMES[k]||k)}</span><span class="fv">${o.n}</span>${pctTag(o.first,o.n)}${pctTag(o.s3,o.n)}`);
    if(TLV_TYPES.includes(k)){ const lvb=el('span','lvctl'); const mi=el('button','','–'), nn=el('b','',String(tlvOf(p,k))), pl=el('button','','+');
      const setL=async d=>{ const v=Math.max(1,Math.min(TLV_MAX,tlvOf(p,k)+d)); if(v===tlvOf(p,k)) return; const t=`${p.name} · ${TYPE_NAMES[k]}: nivel ${v}`; if(await alcHaz(p.id,'set',{campo:'tlv.'+k,valor:v},t)){ nn.textContent=tlvOf(p,k); toast(t); } };
      mi.onclick=()=>setL(-1); pl.onclick=()=>setL(1); lvb.append(mi,nn,pl); r.append(lvb); }
    tsec.append(r); });
  c.append(tsec);
  // panadería
  const mk=Object.keys(p.math||{}); let pn=`<h4>🥐 Panadería · ${mk.reduce((a,k)=>a+p.math[k].total,0)} problemas</h4>`;
  pn+=mk.length?mk.sort((a,b)=>p.math[b].total-p.math[a].total).map(k=>{ const o=p.math[k]; return `<div class="frow"><span class="fl">${esc(MATH_NAMES[k]||k)}</span><span class="fv">${o.ok}/${o.total}</span>${pctTag(o.ok,o.total)}</div>`; }).join(''):'<div class="counter">Aún no ha hecho turnos.</div>';
  pn+=`<div class="counter">Foco de clase: ${p.mathFocus?esc(p.mathFocus.replace('tabla:','tabla del ')):'variado'}${p.age>7?` · Nivel de cuentas ${panLvOf(p)+1}: ${esc(PAN9_LEVELS[panLvOf(p)].n)}`:''}</div>`;
  const pe=el('div','fsec',pn); pe.id='ficha-pan-'+i; c.append(pe);
  // biblioteca
  let bb='<h4>🦉 Biblioteca</h4>'; const cs=cuadernosFor(p);
  if(!cs.length) bb+='<div class="counter">No hay cuadernos para ella.</div>';
  cs.forEach(cu=>{ let sab=0,vis=0; const fl=[]; cu.preguntas.forEach((q,k)=>{ const s=(p.sr||{})[cu.id+':'+k]; if(s){ vis++; if(s.b>=2) sab++; if(s.f&&s.b<2) fl.push(q.q); } });
    bb+=`<div class="frow"><span style="font-size:20px">${cu.emoji||'📘'}</span><span class="fl">${esc(cu.titulo)}<div class="pbar"><i style="width:${Math.round(sab/cu.preguntas.length*100)}%"></i></div></span><span class="counter">${sab}/${cu.preguntas.length} sabidas</span></div>`;
    if(fl.length) bb+=`<div class="fnote" style="margin:0 0 6px 30px;color:#a73a34">Le cuesta: ${fl.slice(0,3).map(esc).join(' · ')}</div>`; });
  const be=el('div','fsec',bb); be.id='ficha-bib-'+i; c.append(be);
  // tablón
  const pend=tasks.filter(m=>m.estado==='hecha').length, acc=tasks.filter(m=>['nuevo','aceptada'].includes(m.estado)).length;
  const tb=el('div','fsec',`<h4>📌 Tablón</h4><div class="fnote">${p.counters.tasks||0} tareas cobradas · ${acc} abiertas · <b>${pend} por comprobar</b></div>`);
  const tbtn=el('button','btn'+(pend?' primary':''),pend?'✅ Comprobar tareas':'📌 Poner una tarea'); tbtn.style.marginTop='8px'; tbtn.onclick=()=>{ renderAlcalde(); show('alcalde'); }; tb.append(tbtn); c.append(tb);
  // accesos
  const acts=el('div','fchips');
  const B1=(t,fn)=>{ const b=el('button','btn',t); b.onclick=fn; acts.append(b); };
  B1('🏡 Su casa',()=>{ if(!VISIT) startVisit(i); openHouse(i); });
  B1('🧶 Sus encargos',()=>{ if(!VISIT) startVisit(i); else DB.cur=i; openVTaller(); });
  B1('🚶 Pasear por el pueblo',()=>startVisit(i));
  c.append(acts);
  return c;
}
function openFicha(focus){
  const b=$('#ficha-body'); b.innerHTML='';
  const g=girlsIdx(); if(!g.length) b.append(el('div','counter','Todavía no hay jugadoras.'));
  g.forEach(i=>b.append(fichaCard(DB.profiles[i],i,focus)));
  show('ficha');
  if(focus){ const t=document.getElementById(`ficha-${focus}-${VISIT?DB.cur:g[0]}`); if(t) setTimeout(()=>t.scrollIntoView({behavior:'smooth',block:'center'}),60); }
}

/* ---- taller visto por papá ---- */
function tryAsCatalog(e,p){ const ee=Object.assign({},e,{kind:'catalog'}); openPuzzle(ee,{age:p.age}); }
function vtCard(e,p,starsGot,extra){
  const c=el('div','ecard');
  c.innerHTML=`<div class="who" data-npc="${e.npc}"></div><div class="t">${esc(e.title)}</div><div class="badge">${esc(TYPE_NAMES[e.type]||e.type)}</div><div class="stars" style="font-size:24px">${starsGot?starsHTML(starsGot):'<span class="counter">Sin hacer</span>'}</div>${extra?`<div class="counter">${extra}</div>`:''}`;
  const b=el('button','btn','▶ Probarlo yo'); b.onclick=()=>tryAsCatalog(e,p); c.append(b); fillWho(c); return c;
}
function openVTaller(){
  const p=P(); $('#vt-title').textContent='🧶 Encargos de '+p.name;
  const V=$('#vt-body'); V.innerHTML='';
  V.append(el('div','help','<div>Puedes probar cualquier encargo sin que cuente para su partida. Dentro tienes el botón 👁️ Solución.</div>'));
  const sec=(t)=>{ const s=el('div','panel'); s.append(el('div','wsec',t)); const g=el('div','vtgrid'); g.style.marginTop='10px'; s.append(g); V.append(s); return g; };
  const d=p.daily;
  const g1=sec(d?`📋 Ruta del día (${d.date===today()?'hoy':d.date.split('-').reverse().slice(0,2).join('/')})`:'📋 Ruta del día');
  if(!d) g1.append(el('div','counter','Todavía no ha abierto el taller.'));
  else d.list.forEach(x=>{ const e=encOf(p,x.id); if(e) g1.append(vtCard(e,p,d.done[x.id],x.gen?'Generado para ella':'Con historia')); });
  const g2=sec(`📜 Encargos con historia (${ENC.filter(e=>p.done[e.id]).length} de ${ENC.length})`);
  ENC.forEach(e=>{ const st=(p.stats||{})[e.id]; g2.append(vtCard(e,p,p.done[e.id]||0,e.lvl>p.unlocked?'🔒 Aún no lo tiene abierto':st?`${st.plays} veces · ${st.tries} intentos`:'')); });
  const g3=sec('🎲 Un reto como los suyos');
  const types=tlvTypesFor(p);
  types.forEach(t=>{ const c=el('div','ecard'); c.innerHTML=`<div class="t">${esc(TYPE_NAMES[t])}</div><div class="counter">Uno nuevo, del nivel que le sale a ella</div>`; const b=el('button','btn','▶ Probar'); b.onclick=()=>{ const e=genEncargo(p,'vt'+t+Date.now(),'catalog','vt'+Date.now(),t); e.kind='catalog'; openPuzzle(e,{age:p.age}); }; c.append(b); g3.append(c); });
  const s4=el('div','panel'); s4.append(el('div','wsec',`🧵 Sus telas (${p.fabrics.length})`));
  const fg=el('div','fabgrid'); fg.style.padding='10px 0 0';
  if(!p.fabrics.length) fg.append(el('div','counter','Todavía no tiene telas.'));
  p.fabrics.slice(-24).reverse().forEach(f=>{ const c=el('div','fabcard'); c.append(fabricCanvas(f.cells,f.w,{s:Math.max(8,Math.min(18,Math.floor(130/f.w)))})); c.append(el('div','',esc(f.name))); fg.append(c); });
  s4.append(fg); V.append(s4);
  show('vtaller');
}
