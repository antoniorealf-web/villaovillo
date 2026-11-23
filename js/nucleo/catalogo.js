"use strict";
/* =========================================================
   CATÁLOGO DE EJERCICIOS (puerta trasera, solo modo prueba)
   ========================================================= */
function showSolution(){
  const t=PZ.e.type, v=PZ.v;
  if(t==='cab'){ PZ.prog=clone(v.sol); PZ.selPath=[]; renderPuzzle(); setMsg('Solución cargada ('+countNodes(PZ.prog)+' tarjetas). Pulsa ▶ Tejer.','good'); return; }
  if(t==='cua'){ PZ.fill=PZ.target.slice(); renderCua(); setMsg('Solución cargada. Pulsa Comprobar.','good'); return; }
  if(t==='reglas'){ PZ.fill=PZ.target.slice(); renderTarget(); setMsg('Solución cargada. Pulsa Comprobar.','good'); return; }
  if(t==='falta'){ PZ.prog=Object.assign({main:[],A:[],B:[],rep:1},clone(v.sol)); renderPuzzle(); setMsg('Solución cargada. Pulsa ▶ Tejer.','good'); return; }
  if(t==='hilo'&&PZ.phase==='locate'){ const b=v.bugs[0]; toast(b.rep?'El fallo está en el número de Repetir':'El fallo está en la fila '+(b.row==='main'?'Programa':'Motivo '+b.row)+', tarjeta '+(b.i+1),3500); return; }
  if(t==='hilo'){ const ok=firstDiff(expand(PZ.prog),PZ.target)===-1; toast(ok?'✅ Esta vez el programa de Hilo está BIEN':'❌ El programa de Hilo tiene un ERROR',3500); PZ.phase=null; }
  PZ.prog = (t==='seq'||t==='custom'||!v.sol) ? {main:PZ.target.slice(),A:[],B:[],rep:1} : Object.assign({main:[],A:[],B:[],rep:1},clone(v.sol));
  renderPuzzle(); setMsg('Solución cargada ('+cardCount(PZ.prog)+' tarjetas). Pulsa ▶ Tejer.','good');
}
function ensureTestProfile(){ if(!P()){ const i=DB.profiles.findIndex(p=>p); if(i>=0) DB.cur=i; else { DB.profiles[0]=newProfile('Papá',9,'#4a8fdc'); DB.profiles[0].met=true; DB.cur=0; } saveQuiet(); } }
let CAT_L=5, CAT_PAN=3;
function openCatalog(){ if(VISIT){ openVTaller(); return; } ensureTestProfile(); renderCatalog(); show('catalog'); }
function catCard(e,label,extra){
  const c=el('div','ecard'); c.style.cursor='default';
  c.innerHTML=`<div class="who" data-npc="${e.npc}"></div><div class="t">${esc(label||e.title)}</div><div class="badge">${TYPE_NAMES[e.type]}</div>${extra?`<div class="counter">${extra}</div>`:''}`;
  const row=el('div','choice'); row.style.justifyContent='flex-start';
  [[6,'👧 6-7 años'],[9,'👧 8-10 años']].forEach(([a,t])=>{ const b=el('button','',t); b.onclick=()=>{ const ee=Object.assign({},typeof e.make==='function'?e.make(a):e,{kind:'catalog'}); openPuzzle(ee,{age:a}); }; row.append(b); });
  fillWho(c); c.append(row); return c;
}
function describe(e,age){ const v=age<=7?e.v6:e.v9; const t=v.t?v.t.length:expand(v.sol).length; return `${t} puntos · ancho ${v.w}`+(v.sol?` · reto ${cardCount(v.sol)} tarjetas`:''); }
function renderCatalog(){
  const L=$('#cat-list'); L.innerHTML='';
  L.append(el('div','wnote','🧪 Aquí puedes probar cualquier ejercicio, en la versión de 6-7 o de 8-10 años, sin que cuente para ninguna partida. En cada ejercicio tienes el botón <b>👁️ Solución</b>.'));
  [1,2,3].forEach(l=>{
    L.append(el('div','wsec',`Nivel ${l} · ${LEVELS[l]} (encargos con historia)`));
    ENC.filter(e=>e.lvl===l).forEach(e=>L.append(catCard(e,e.title,`6-7: ${describe(e,6)}<br>8-10: ${describe(e,9)}`)));
  });
  L.append(el('div','wsec','Otras casas del pueblo'));
  const bk=el('div','ecard'); bk.innerHTML='<div class="who">🥐</div><div class="t">Turno en la panadería</div><div class="badge">Mates</div><div class="counter">Problemas generados según la edad y el foco que elijas en el modo alcalde</div>';
  const bkr=el('div','choice'); bkr.style.justifyContent='flex-start'; [[6,'👧 6-7 años'],[9,'👧 8-10 años']].forEach(([a,t])=>{ const b=el('button','',t); b.onclick=()=>openBakery(a); bkr.append(b); }); bk.append(bkr);
  const bkl=el('div','counter'); bkl.innerHTML='Nivel de cuentas (8-10 años): '; const bch=el('span','choice'); bch.style.display='inline-flex';
  PAN9_LEVELS.forEach((x,k)=>{ const b=el('button',k===CAT_PAN?'sel':'',String(k+1)); b.title=x.n; b.onclick=()=>{ CAT_PAN=k; renderCatalog(); }; bch.append(b); }); bkl.append(bch); bk.append(bkl); L.append(bk);
  const dv=el('div','ecard'); dv.innerHTML='<div class="who">➗</div><div class="t">Divisiones con dibujo</div><div class="badge">Mates · 8-10 años</div><div class="counter">Cuadraditos por colores: repartir, agrupar y sobrantes</div>'; const dvb=el('button','btn','Probar'); dvb.onclick=()=>openBakeryDiv(); dv.append(dvb); L.append(dv);
  (window.TEMAS||[]).forEach(t=>{ const cc=el('div','ecard'); cc.innerHTML=`<div class="who">${t.emoji||'📗'}</div><div class="t">${esc(t.titulo)}</div><div class="badge">Biblioteca · lección · para ${t.para==='6'?'6-7 años':t.para==='9'?'8-10 años':esc(t.para)}</div><div class="counter">${t.serie?'Capítulo '+t.serie.orden+' de «'+esc(t.serie.titulo)+'» (sin libro en el juego) · ':'Libro + '}${t.preguntas.length} preguntas × 3 formas</div>`; const row=el('div','choice'); row.style.justifyContent='flex-start';
    const b1=el('button','','📖 Libro'); b1.onclick=()=>openLibro(t,true); const b2=el('button','','✏️ Ronda de prueba'); b2.onclick=()=>{ LQ={c:t,qs:lecSeleccion(t.preguntas.map((_,i)=>({t,i})),LEC_N),i:0,ok:0,tries:0,order:[],mode:'leccion',catalog:true}; show('quiz'); renderQuiz(); };
    if(lecSinLibro(t)) row.append(b2); else row.append(b1,b2); cc.append(row); L.append(cc); });
  (window.CUADERNOS||[]).forEach(c=>{ const cc=el('div','ecard'); cc.innerHTML=`<div class="who">${c.emoji||'📘'}</div><div class="t">${esc(c.titulo)}</div><div class="badge">Biblioteca · para ${c.para==='6'?'6-7 años':c.para==='9'?'8-10 años':esc(c.para)}</div><div class="counter">${c.preguntas.length} preguntas</div>`; const b=el('button','btn','Probar'); b.onclick=()=>{ LQ=null; startQuiz(c); LQ.catalog=true; }; cc.append(b); L.append(cc); });
  L.append(el('div','wsec','Encargos generados (cada vez sale uno distinto)'));
  const lvr=el('div','wnote'); lvr.innerHTML='Nivel de reto de los generados: '; const ch=el('span','choice'); ch.style.display='inline-flex';
  for(let k=1;k<=TLV_MAX;k++){ const b=el('button',k===CAT_L?'sel':'',String(k)); b.onclick=()=>{ CAT_L=k; renderCatalog(); }; ch.append(b); } lvr.append(ch); L.append(lvr);
[['seq',3,''],['reglas',3,''],['rep',3,''],['mot',3,''],['hilo',3,''],['cua',3,''],['cab',3,''],['falta',3,'']].forEach(([t,lv,extra])=>{
    const proto={npc:t==='hilo'?'hilo':t==='cab'?'bruno':t==='cua'?'nube':'coco',type:t,title:'Generado: '+TYPE_NAMES[t]+extra};
    proto.make=a=>{ const g=genEncargo({age:a,unlocked:3,id:'cat',tlvForce:CAT_L},'cat'+t+Date.now()+Math.random(),'catalog','cat'+Date.now(),t); g.title=proto.title; return g; };
    L.append(catCard(proto, proto.title, t==='cab'?'Nuevo · programa el cabezal':t==='cua'?'Nuevo · lógica tipo sudoku':''));
  });
  L.append(rbCatCard()); // huerto del robot (js/zonas/huerto/robot-pantalla.js), con el mismo nivel de reto
}
$('#cat-back').onclick=()=>{ if(P()&&P().met) show('village'); else { renderProfiles(); show('profiles'); } };
