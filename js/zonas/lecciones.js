"use strict";
/* =========================================================
   LECCIONES DE LA BIBLIOTECA (temas con libro, rondas y repasos)
   Cada tema (window.TEMAS, contenido/temas/*.js): libro para leer + 10 preguntas con 3 formas de decirlas.
   Ronda: 6 preguntas distintas de las 10, una forma al azar cada una.
   Aprendido: 2 rondas perfectas (6 de 6) en días distintos. Después solo sale en los repasos.
   Botones: ronda 6/6 → 12, 4-5 → 4, menos → 0. Repaso 6/6 → 3, 4-5 → 1. Tope de 24 al día entre todo.
   Maestría de Biblioteca: 1 por acierto, solo en el primer intento del día de cada tema.
   LIBROS POR CAPÍTULOS (serie): temas sin libro en el juego (la niña lee su libro de papel).
   Cada capítulo lleva serie:{id, titulo, autor?, orden, abiertos, total?} y rondas:1 (rondas perfectas para aprenderlo).
   Solo están abiertos los «abiertos» primeros capítulos sin aprender; al aprender uno se abre el siguiente.
   No se guarda nada nuevo: qué capítulos se ven sale de lo aprendido.
   ========================================================= */
window.TEMAS=window.TEMAS||[];
const LEC_TOPE=24, LEC_N=6;
function temasFor(p){ return window.TEMAS.filter(c=>c.para==='todas'||c.para===(p.age<=7?'6':'9')||String(c.para).toLowerCase()===p.name.toLowerCase()); }
function lecT(p,id){ p.lec=p.lec||{t:{},rep:{date:'',n:0},cap:{date:'',coins:0}}; p.lec.t=p.lec.t||{}; return p.lec.t[id]=p.lec.t[id]||{dias:[],ap:false,hoy:{date:'',n:0,perfect:false}}; }
function lecRondas(t){ return t.rondas||2; }
function lecSinLibro(t){ return !(t.libro&&t.libro.length); }
// Temas que se ven ahora: los normales y, de cada serie, los capítulos abiertos y los ya aprendidos
function lecVisibles(p){ const out=[], series={};
  temasFor(p).forEach(t=>{ if(t.serie) (series[t.serie.id]=series[t.serie.id]||[]).push(t); else out.push(t); });
  Object.values(series).forEach(cs=>{ let abiertos=0; cs.sort((a,b)=>a.serie.orden-b.serie.orden).forEach(t=>{
    if(lecT(p,t.id).ap) out.push(t); else if(abiertos<(t.serie.abiertos||2)){ abiertos++; out.push(t); } }); });
  return out; }
function lecCapUsado(p){ return p.lec.cap&&p.lec.cap.date===today()?p.lec.cap.coins:0; }
function lecEstado(p,t){ const s=lecT(p,t.id); if(s.ap) return {ok:false,txt:'🌟 Aprendido · saldrá en los repasos'};
  if(s.hoy.date===today()){ if(s.hoy.perfect) return {ok:false,txt:'✅ Ronda perfecta hoy · mañana otra'}; if(s.hoy.n>=2) return {ok:false,txt:'😴 Hoy ya has hecho los 2 intentos'}; return {ok:true,txt:'🔁 Puedes hacer un segundo intento hoy'}; }
  return {ok:true,txt:'✏️ Ronda disponible hoy'}; }
function lecAprendidos(p){ return temasFor(p).filter(t=>lecT(p,t.id).ap); }
function repasosHoy(p){ return p.lec.rep.date===today()?p.lec.rep.n:0; }
function lecTarjeta(p,t){ const s=lecT(p,t.id), e=lecEstado(p,t), n=new Set(s.dias).size, R=lecRondas(t);
  const card=el('button','ecard'); card.innerHTML=`<div class="who">${t.emoji||'📗'}</div><div class="t">${esc(t.titulo)}</div><div class="badge">${t.serie?'Capítulo '+t.serie.orden+' · '+esc(t.serie.titulo):esc(t.asignatura||'Tema')+' · Lección'}</div><div class="pbar"><i style="width:${s.ap?100:Math.round(Math.min(R,n)/R*100)}%"></i></div><div class="counter">${R>1?(s.ap?R:n)+' de '+R+' rondas perfectas · ':''}${e.txt}</div>`;
  card.onclick=()=>menuTema(t); return card; }
function renderTemas(L){
  const p=P(), vis=lecVisibles(p), series={};
  vis.forEach(t=>{ if(!t.serie){ L.append(lecTarjeta(p,t)); return; } (series[t.serie.id]=series[t.serie.id]||[]).push(t); });
  Object.values(series).forEach(cs=>{ const S=cs[0].serie, todos=temasFor(p).filter(t=>t.serie&&t.serie.id===S.id), ap=cs.filter(t=>lecT(p,t.id).ap);
    L.append(el('div','wsec',`📚 ${S.titulo}${S.autor?' · '+S.autor:''} · ${ap.length} de ${S.total||todos.length} capítulos`));
    cs.filter(t=>!lecT(p,t.id).ap).forEach(t=>L.append(lecTarjeta(p,t)));
    if(ap.length){ const c=el('div','ecard'); c.innerHTML=`<div class="who">🌟</div><div class="t">Capítulos aprendidos</div><div class="counter">${ap.map(t=>t.serie.orden).sort((a,b)=>a-b).join(', ')} · ya salen en los repasos</div>`; L.append(c); }
    if(!cs.some(t=>!lecT(p,t.id).ap)) L.append(el('div','wnote','🦉 ¡Has hecho todos los capítulos que tengo! Papá traerá más pronto.')); });
  const ap=lecAprendidos(p);
  if(ap.length){ const r=repasosHoy(p), card=el('button','ecard practice'); card.innerHTML=`<div class="who">🔁</div><div class="t">Repaso de lo aprendido</div><div class="badge">${ap.length} tema${ap.length>1?'s':''}</div><div class="counter">${r>=2?'✅ Hoy ya has hecho los 2 repasos':'Repasos de hoy: '+r+' de 2'}</div>`; card.onclick=()=>startRepaso(); L.append(card); }
}
async function menuTema(t){
  const p=P(), e=lecEstado(p,t);
  const b=lecSinLibro(t)?[]:[{t:'📖 Leer el libro'}]; if(e.ok) b.push({t:'✏️ Hacer la ronda',cls:'primary'}); b.push({t:'← Volver'});
  const r=await say({face:'🦉',name:'Sabina',text:`${t.serie?'Capítulo '+t.serie.orden+': ':''}${t.titulo}. ${e.txt}.${t.serie&&e.ok?' ¿Ya lo has leído en tu libro?':''}`,buttons:b,speak:false});
  const lab=b[r]&&b[r].t;
  if(lab==='📖 Leer el libro') openLibro(t); else if(lab==='✏️ Hacer la ronda') startLeccion(t);
}
let LIBRO_CAT=false;
function openLibro(t,cat){ LIBRO_CAT=!!cat;
  $('#lb-title').textContent='📖 '+t.titulo; const B=$('#lb-body'); B.innerHTML='';
  (t.libro||[]).forEach(pg=>{ const d=el('div','panel'); d.style.cssText='margin:12px 0;font-size:21px;line-height:1.5';
    d.innerHTML=(pg.h?`<h3 style="margin:0 0 6px;font-size:26px">${esc(pg.h)}</h3>`:'')+(typeof pg.html==='function'?pg.html():pg.html||'');
    const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(d.textContent.replace('🔊',''),t.lang); d.prepend(sp); B.append(d); });
  if(!LIBRO_CAT){ const go=el('button','btn primary',t.lang==='ca'?'✏️ Som-hi, a la ronda!':'✏️ ¡A por la ronda!'); go.style.fontSize='22px'; go.onclick=()=>{ const e=lecEstado(P(),t); if(e.ok) startLeccion(t); else { toast(e.txt); openLibrary(); } }; B.append(go); }
  show('libro');
}
$('#lb-back').onclick=()=>{ if(LIBRO_CAT){ LIBRO_CAT=false; openCatalog(); } else openLibrary(); };
function lecSeleccion(lista,n){ // lista: [{t, i}] preguntas distintas; una forma al azar de cada una
  return shuffle(lista.slice(),Math.random).slice(0,n).map(x=>{ const pr=x.t.preguntas[x.i]; return {q:pr.v[rr(0,pr.v.length-1)],key:x.t.id+':'+x.i,tema:x.t.titulo,lang:x.t.lang}; });
}
function startLeccion(t){
  const p=P(), e=lecEstado(p,t); if(!e.ok){ toast(e.txt); return; }
  const qs=lecSeleccion(t.preguntas.map((_,i)=>({t,i})),LEC_N);
  LQ={c:t,qs,i:0,ok:0,tries:0,order:[],mode:'leccion'}; show('quiz'); renderQuiz();
}
async function startRepaso(){
  const p=P(), ap=lecAprendidos(p);
  if(repasosHoy(p)>=2){ await say({face:'🦉',name:'Sabina',text:'Hoy ya has hecho los 2 repasos. ¡Mañana más!'}); return; }
  const pool=[]; ap.forEach(t=>t.preguntas.forEach((_,i)=>pool.push({t,i})));
  LQ={c:{titulo:'🔁 Repaso',id:'repaso'},qs:lecSeleccion(pool,LEC_N),i:0,ok:0,tries:0,order:[],mode:'repaso'}; show('quiz'); renderQuiz();
}
async function finRonda(){
  const p=P(), n=LQ.qs.length, ok=LQ.ok, rep=LQ.mode==='repaso', t=LQ.c; let aprendido=false, primera=false, premio;
  if(rep){ premio=ok>=n?3:ok>=n-2?1:0; p.lec.rep={date:today(),n:repasosHoy(p)+1}; }
  else { const s=lecT(p,t.id); primera=s.hoy.date!==today();
    premio=ok>=n?12:ok>=n-2?4:0;
    s.hoy={date:today(),n:(primera?0:s.hoy.n)+1,perfect:ok>=n};
    if(ok>=n&&!s.dias.includes(today())) s.dias.push(today());
    if(!s.ap&&s.dias.length>=lecRondas(t)){ s.ap=true; aprendido=true; }
    if(primera){ if(ok) addMastery(p,'bib',ok); if(p.daily) p.daily.read=true; }
  }
  const coins=Math.min(premio,Math.max(0,LEC_TOPE-lecCapUsado(p))), xp=(!rep&&primera)?ok+1:0;
  p.lec.cap={date:today(),coins:lecCapUsado(p)+coins};
  p.coins+=coins; p.counters.earned+=coins; p.counters.reads=(p.counters.reads||0)+1; addXP(p,xp); logAct(p,'b',n,ok,rep?'repaso':t.id);
  save(`Biblioteca: ${rep?'repaso':t.titulo} ${ok}/${n}`); fanfare();
  const fallos=LQ.qs.filter(x=>!x.good), stars=ok>=n?3:ok>=n-2?2:1;
  const lista=fallos.length?`<div style="text-align:left;font-size:17px;margin-top:6px"><b>Para repasar:</b><br>${fallos.map(x=>'• '+esc(x.q.q)+' → <b>'+esc(x.q.t==='vf'?(x.q.a?'Verdadero':'Falso'):x.q.t==='ordenar'?x.q.items.join(' → '):x.q.a)+'</b>').join('<br>')}</div>`:'';
  const sinL=!rep&&lecSinLibro(t);
  const msg=ok>=n?(aprendido?(t.serie?'¡Capítulo aprendido! 🌟 Ya puedes empezar el siguiente.':'¡Tema aprendido! 🌟 Ya solo saldrá en los repasos.'):(rep?'¡Repaso perfecto!':'¡Ronda perfecta! Para aprender el tema hace falta otra ronda perfecta en otro día.')):ok>=n-2?(sinL?'¡Casi! Repasa el capítulo en tu libro y vuelve a intentarlo.':'¡Casi! Lee el libro y vuelve a intentarlo.'):(sinL?'Todavía no. Vuelve a leer el capítulo con calma en tu libro y lo intentas otra vez.':'Todavía no. Lee el libro con calma y vuelve a intentarlo.');
  const tope=(premio>coins)?'<div class="counter">Hoy has llegado al tope de botones de la Biblioteca.</div>':'';
  await say({center:true,html:`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:26px;font-weight:800">${ok} de ${n} a la primera</div><div class="rw-items">${coins?`<div class="rw-item">🔘 +${coins} botones</div>`:''}${xp?`<div class="rw-item">✨ +${xp} experiencia</div>`:''}</div><div style="font-size:19px">🦉 «${msg}»</div>${lista}${tope}</div>`});
  await dailyBonusCheck(p); await afterRewards();
  if(!rep&&ok<n&&!sinL){ const r=await say({face:'🦉',name:'Sabina',text:'¿Quieres leer el libro ahora?',buttons:[{t:'Ahora no'},{t:'📖 Leer el libro',cls:'primary'}],speak:false}); if(r===1){ openLibro(t); return; } }
  openLibrary();
}
