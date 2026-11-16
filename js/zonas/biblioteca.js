"use strict";
/* =========================================================
   BIBLIOTECA DE SABINA (repaso de lecturas y deberes)
   ========================================================= */
let LQ=null;
const SR_DAYS=[1,2,4,7,14];
function cuadernosFor(p){ const C=window.CUADERNOS||[]; return C.filter(c=>c.para==='todas'||c.para===(p.age<=7?'6':'9')||String(c.para).toLowerCase()===p.name.toLowerCase()); }
function dueQuestions(p,c){ const t=dayNum(today()); p.sr=p.sr||{}; return c.preguntas.map((q,i)=>({q,key:c.id+':'+i})).filter(x=>{ const s=p.sr[x.key]; return !s||s.n<=t; }); }
function openLibrary(){ renderLibrary(); show('library'); const p=P(); if(!p._libHi){ p._libHi=true; saveQuiet(); say({face:'🦉',name:'Sabina la lechuza',text:'¡Hola! Soy Sabina. Aquí repasamos lo que aprendes en el cole. Lo que te cueste lo volveremos a ver otro día, ¡así se queda en la memoria!'}); } }
function renderLibrary(){
  const p=P(); $('#lib-coins').textContent='🔘 '+p.coins;
  const L=$('#lib-list'); L.innerHTML='';
  const cs=cuadernosFor(p);
  if(!cs.length){ L.append(el('div','wnote','🦉 Todavía no hay cuadernos para ti. Papá puede mandar a Claude una foto de los deberes para crear uno.')); return; }
  cs.forEach(c=>{
    const due=dueQuestions(p,c).length, tot=c.preguntas.length;
    const known=c.preguntas.filter((_,i)=>{ const s=(p.sr||{})[c.id+':'+i]; return s&&s.b>=2; }).length;
    const card=el('button','ecard'); card.innerHTML=`<div class="who">${c.emoji||'📘'}</div><div class="t">${esc(c.titulo)}</div><div class="badge">${esc(c.asignatura||'Repaso')}</div><div class="pbar"><i style="width:${Math.round(known/tot*100)}%"></i></div><div class="counter">${known}/${tot} bien aprendidas · ${due?`${due} para repasar hoy`:'✅ nada pendiente hoy'}</div>`;
    card.onclick=()=>startQuiz(c); L.append(card);
  });
}
function startQuiz(c){
  const p=P(); let pool=dueQuestions(p,c);
  // x.due: la pregunta tocaba hoy. Solo esas mueven el calendario de repaso y la maestría (T6);
  // si no queda nada pendiente, se puede repasar igual, pero como práctica.
  pool.forEach(x=>x.due=true);
  if(!pool.length) pool=c.preguntas.map((q,i)=>({q,key:c.id+':'+i,due:false}));
  pool=shuffle(pool.slice(),Math.random).slice(0,6);
  LQ={c,qs:pool,i:0,ok:0,tries:0,order:[]}; show('quiz'); renderQuiz();
}
function renderQuiz(){
  const x=LQ.qs[LQ.i], q=x.q;
  $('#qz-title').textContent=LQ.c.titulo;
  $('#qz-prog').innerHTML=LQ.qs.map((_,i)=>`<span class="mdot ${i<LQ.i?(LQ.qs[i].good?'ok':'ko'):i===LQ.i?'cur':''}"></span>`).join('');
  const B=$('#qz-body'); B.innerHTML='';
  const head=el('div','npcline'); head.innerHTML=`<div class="face"></div><div class="ask">${esc(q.q)}</div>`; head.querySelector('.face').append(npcIcon('sabina',64)); const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(q.q+(q.opts?'. '+q.opts.join('. '):'')); head.append(sp); B.append(head);
  const A=el('div','mchoices');
  if(q.t==='vf') ['Verdadero','Falso'].forEach(o=>{ const b=el('button','btn',o==='Verdadero'?'✅ Verdadero':'❌ Falso'); b.onclick=()=>answerQuiz(o==='Verdadero'); A.append(b); });
  else if(q.t==='ordenar'){
    if(!LQ.order.length&&!LQ.shuffled) LQ.shuffled=shuffle(q.items.slice(),Math.random);
    const chosen=el('div','qorder'); chosen.innerHTML=LQ.order.length?LQ.order.map((o,i)=>`<span class="qchip">${i+1}. ${esc(o)}</span>`).join(''):'<span class="counter">Toca en orden…</span>'; B.append(chosen);
    LQ.shuffled.filter(o=>!LQ.order.includes(o)).forEach(o=>{ const b=el('button','btn',esc(o)); b.onclick=()=>{ LQ.order.push(o); beep(600,0.04); if(LQ.order.length===q.items.length) answerQuiz(LQ.order.slice()); else renderQuiz(); }; A.append(b); });
    if(LQ.order.length){ const u=el('button','btn','↺ Empezar de nuevo'); u.onclick=()=>{ LQ.order=[]; renderQuiz(); }; A.append(u); }
  }
  else (LQ.optsShuffled=LQ.optsShuffled||shuffle(q.opts.slice(),Math.random)).forEach(o=>{ const b=el('button','btn',esc(o)); b.onclick=()=>answerQuiz(o); A.append(b); });
  B.append(A);
  $('#qz-msg').textContent=''; $('#qz-msg').className='';
  speakAuto(q.q);
}
async function answerQuiz(v){
  const x=LQ.qs[LQ.i], q=x.q, p=P(); p.sr=p.sr||{};
  const right = q.t==='ordenar' ? JSON.stringify(v)===JSON.stringify(q.items) : q.t==='vf' ? v===q.a : v===q.a;
  if(right){
    if(LQ.tries===0){ LQ.ok++; x.good=true;
      if(x.due&&!LQ.catalog){ const s=p.sr[x.key]||{b:-1}; s.b=Math.min(4,s.b+1); s.n=dayNum(today())+SR_DAYS[s.b]; p.sr[x.key]=s; addMastery(p,'bib',1); } }
    fanfare(); $('#qz-msg').textContent='¡Correcto! '+(q.exp||''); $('#qz-msg').className='good';
    await new Promise(r=>setTimeout(r,1500)); nextQuiz();
  } else {
    LQ.tries++; LQ.order=[];
    if(LQ.tries===1&&q.t!=='vf'){ beep(220,0.2,'sawtooth',0.03); $('#qz-msg').textContent='Mmm, no es esa. ¡Piensa otra vez!'; $('#qz-msg').className='bad'; if(q.t==='ordenar') renderQuiz(); return; }
    p.sr[x.key]={b:0,n:dayNum(today())+1,f:((p.sr[x.key]||{}).f||0)+1}; x.good=false;
    const sol=q.t==='ordenar'?q.items.join(' → '):q.t==='vf'?(q.a?'Verdadero':'Falso'):q.a;
    await say({face:'🦉',name:'Sabina',text:`La respuesta es: ${sol}. ${q.exp||''} Mañana la repasamos otra vez.`}); nextQuiz();
  }
}
async function nextQuiz(){
  LQ.i++; LQ.tries=0; LQ.order=[]; LQ.shuffled=null; LQ.optsShuffled=null;
  if(LQ.i<LQ.qs.length){ renderQuiz(); return; }
  const p=P(), n=LQ.qs.length, ok=LQ.ok, stars=ok>=n?3:ok>=n-2?2:1;
  if(LQ.catalog){ await say({center:true,html:`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:24px;font-weight:800">${ok} de ${n}</div></div>`}); openCatalog(); return; }
  const first=!(p.daily&&p.daily.read);
  // repasos extra: hasta 3 botones cada uno y 6 al día en total
  const rx=(p.readExtra&&p.readExtra.date===today())?p.readExtra.coins:0;
  const coins=first?ok*2:Math.min(ok,3,Math.max(0,6-rx)), xp=first?ok+1:0;
  if(!first) p.readExtra={date:today(),coins:rx+coins};
  if(first&&p.daily) p.daily.read=true;
  p.coins+=coins; p.counters.earned+=coins; p.counters.reads=(p.counters.reads||0)+1; addXP(p,xp); logAct(p,'b',n,ok,LQ.c.id);
  save(`Biblioteca: ${LQ.c.titulo} ${ok}/${n}`); fanfare();
  await say({center:true,html:`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:26px;font-weight:800">¡Repaso terminado! ${ok} de ${n}</div><div class="rw-items">${coins?`<div class="rw-item">🔘 +${coins} botones</div>`:''}${xp?`<div class="rw-item">✨ +${xp} experiencia</div>`:''}</div><div style="font-size:18px">🦉 «Lo que te ha costado lo volveremos a ver otro día.»</div></div>`});
  await dailyBonusCheck(p); await afterRewards();
  openLibrary();
}
$('#bk-back').onclick=()=>{ if(MZ&&MZ.catalog) openCatalog(); else show('village'); };
$('#qz-back').onclick=()=>{ if(LQ&&LQ.catalog) openCatalog(); else openLibrary(); };
$('#board-alc').onclick=()=>openAlcalde();
$('#alc-back').onclick=()=>{ if(VISIT){ show('village'); return; } if(REMOTO) return; stopSpeak(); renderProfiles(); show('profiles'); };
