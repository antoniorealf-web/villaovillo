"use strict";
/* =========================================================
   PUZLE
   ========================================================= */
let PZ=null;
function variant(e,age){ return (age||P().age)<=7?e.v6:e.v9; }
function expand(prog){ const out=[]; const rep=prog.rep||1; for(let k=0;k<rep;k++){ for(const t of (prog.main||[])){ if(t==='A') out.push(...(prog.A||[])); else if(t==='B') out.push(...(prog.B||[])); else out.push(t); if(out.length>400) return out; } } return out; }
function cardCount(prog){ return (prog.main||[]).length+((prog.main||[]).includes('A')?(prog.A||[]).length:0)+((prog.main||[]).includes('B')?(prog.B||[]).length:0); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }

function openPuzzle(e,opts={}){
  const age=opts.age||P().age;
  const v=variant(e,age);
  const target = v.t ? v.t.split('') : expand(v.sol);
  const features = e.type==='seq'?{rep:false,mot:false}: e.type==='rep'?{rep:true,mot:false}: e.type==='custom'?{rep:true,mot:age>7}: {rep:true,mot:true};
  PZ={e,v,target,features,attempts:0,hints:0,t0:Date.now(),best:v.sol?cardCount(v.sol):target.length,
      prog:{main:[],A:[],B:[],rep:1}, row:'main', running:false, phase:null, predicted:null, fill:null, sel:'r', age};
  PZ.maxCards=v.max||null; PZ.L=e.L||null;
  if(e.type==='reglas'){ PZ.holes=new Set(v.holes||target.map((c,i)=>i).filter(i=>i>=target.length-v.miss)); PZ.fill=target.map((c,i)=>PZ.holes.has(i)?'?':c); PZ.sel=uniqColors(target)[0]; }
  if(e.type==='falta'){ PZ.prog=Object.assign({main:[],A:[],B:[],rep:1},clone(v.sol)); PZ.blanks=v.blanks; v.blanks.forEach(b=>{ if(b.rep) PZ.prog.rep='?'; else PZ.prog[b.row][b.i]='?'; }); PZ.phase='falta'; PZ.features={rep:true,mot:!!v.sol.A}; PZ.best=0; }
  if(e.type==='cab'){ PZ.target=v.t.split('').map(c=>c==='.'?null:c); PZ.prog=[]; PZ.selPath=[]; PZ.best=v.best; }
  if(e.type==='cua'){ PZ.target=v.sol.split(''); PZ.fill=v.giv.split('').map(c=>c==='.'?null:c); PZ.sel=v.syms[0]; PZ.best=0; }
  if(e.type==='hilo'){ PZ.prog=Object.assign({main:[],A:[],B:[],rep:1},clone(v.hilo)); PZ.phase='predict'; PZ.features={rep:true,mot:!!(v.sol.A)}; PZ.locTries=0; PZ.locRight=true; }
  document.querySelector('#scr-puzzle .pz-left .lbl').textContent=e.type==='cua'?'Cuadro':'Pedido';
  $('#pz-title').textContent=e.title; $('#pz-type').textContent=TYPE_NAMES[e.type];
  $('#pz-face').innerHTML=''; $('#pz-face').append(npcIcon(e.npc,64)); $('#pz-ask').textContent=e.ask;
  $('#pz-askspeak').onclick=()=>speakNow(e.ask);
  setMsg('');
  show('puzzle'); renderPuzzle(); renderResult([]);
  speakAuto(e.ask);
}
$('#pz-back').onclick=()=>{ if(PZ&&PZ.running) return; stopSpeak(); if(PZ&&PZ.e.kind==='catalog') openCatalog(); else if(PZ&&PZ.e.type==='custom') openMail(); else openWorkshop(); };
function uniqColors(arr){ return [...new Set(arr.filter(c=>COLORS[c]))]; }
function fabS(w){ const avail=Math.min(window.innerWidth*0.42, 460); return Math.max(18,Math.min(40,Math.floor((avail-12)/w))); }
function setMsg(t,cls){ const m=$('#pz-msg'); m.textContent=t; m.className=cls||''; }

function renderTarget(hl=[]){
  if(PZ.e.type==='cua'){ renderCua(hl); return; }
  const box=$('#pz-target'); box.innerHTML='';
  if(PZ.e.type==='reglas'){
    const cv=fabricCanvas(PZ.fill,PZ.v.w,{s:fabS(PZ.v.w),hl});
    cv.style.cursor='pointer';
    cv.addEventListener('pointerdown',ev=>{
      const r=cv.getBoundingClientRect(), m=cv._meta; const cx=ev.clientX-r.left-m.pad, cy=ev.clientY-r.top-m.pad;
      const col=Math.floor(cx/m.s), row=Math.floor(cy/m.s), i=row*m.w+col;
      if(col<0||col>=m.w||!PZ.holes.has(i)) return;
      PZ.fill[i]=PZ.sel; beep(700,0.05); renderTarget(); setMsg('');
    });
    box.append(cv);
  } else box.append(fabricCanvas(PZ.target,PZ.v.w,{s:fabS(PZ.v.w),hl}));
}
function renderResult(cells,hl=[],sel=-1){
  const box=$('#pz-result'); box.innerHTML='';
  if(PZ.e.type==='reglas'||PZ.e.type==='cua'){ $('#pz-reslbl').style.display='none'; return; }
  $('#pz-reslbl').style.display='';
  box.append(fabricCanvas(cells,PZ.v.w,{s:fabS(PZ.v.w),ghost:PZ.target.length,hl,sel,bg:'#f6ecd8'}));
}

const HELP={
  seq:'Toca los hilos de colores para ponerlos en tu programa. Luego pulsa «Tejer». El telar teje los puntos en orden: de izquierda a derecha y fila a fila.',
  rep:'¡Truco nuevo! Pon solo el trocito que se repite y usa «Repetir» para decir cuántas veces. Cuantas menos tarjetas uses, más estrellas.',
  mot:'Un motivo es un trocito de programa con nombre. Toca la fila «Motivo A» o «Motivo B» para llenarla. Luego, en el programa, usa las tarjetas A y B.',
  reglas:'Mira bien el dibujo: ¿qué se repite? Elige un hilo y toca los huecos con «?» para completarlo.',
  cab:'Programa el cabezal del telar: 🎨 elige el hilo, ➡️ teje un punto y avanza, ⤵️ baja a la fila siguiente. Lo que pongas dentro de 🔁 Repetir se repite. Toca una caja para meter tarjetas dentro.',
  cua:'Cuadro mágico: en cada fila y en cada columna tiene que haber un hilo de cada color, sin repetir. Si el cuadro está dividido en cuadrados, tampoco se puede repetir dentro de cada cuadrado.',
  custom:'Este reto lo ha diseñado el alcalde. Puedes usar todas tus tarjetas. ¡Intenta usar pocas!',
  hilo:'Hilo ha escrito este programa. Antes de tejer, piensa: ¿hará la tela del pedido? Sigue el programa con el dedo, paso a paso.'
};

function renderPuzzle(){
  const R=$('#pz-right'); R.innerHTML='';
  const t=PZ.e.type;
  const help=el('div','help'); const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(HELP[t]); help.append(sp, el('div','',esc(HELP[t])));
  R.append(help);
  if(t==='cab'){ renderTarget(); renderCabRight(R); return; }
  if(t==='cua'){ renderCua(); renderCuaRight(R); return; }
  renderTarget();
  if(t==='reglas'){
    R.append(el('div','lbl','Elige un hilo'));
    const pal=el('div','palette');
    paletteColors().forEach(k=>{ const c=colorCard(k); if(PZ.sel===k) c.style.outline='4px solid #2f5f96'; c.onclick=()=>{ PZ.sel=k; beep(600,0.04); renderPuzzle(); }; pal.append(c); });
    R.append(pal);
    const act=el('div','actions'); if(TEST||VISIT){ const sb=el('button','btn','👁️ Solución'); sb.onclick=showSolution; act.append(sb); } const b=el('button','btn green','✔ Comprobar'); b.onclick=checkReglas; act.append(b); R.append(act);
    return;
  }
  // filas de programa
  const ph=PZ.phase;
  const locked = ph==='predict' || PZ.running || ph==='falta' || ph==='locate';
  const rows=[['main', 'Programa']];
  if(PZ.features.mot){ rows.push(['A','Motivo A'],['B','Motivo B']); }
  rows.forEach(([k,label])=>{
    const r=el('div','prow'+(PZ.row===k&&!locked?' sel':'')+(locked&&ph!=='falta'&&ph!=='locate'?' locked':''));
    const nm=el('div','rname',label); if(k==='A') nm.style.color='var(--purple)'; if(k==='B') nm.style.color='var(--teal)'; r.append(nm);
    const arr=PZ.prog[k];
    if(!arr.length) r.append(el('span','empty',locked?'(vacío)':'Toca los hilos para añadir…'));
    arr.forEach((tok,i)=>{
      const isBlank=ph==='falta'&&blankAt(k,i);
      const c=tok==='?'?el('div','ccard blank','?'):(tok==='A'||tok==='B'?tokenCard(tok):colorCard(tok)); c.dataset.row=k; c.dataset.i=i;
      if(isBlank){ c.classList.add('isblank'); if(PZ.bsel&&PZ.bsel.row===k&&PZ.bsel.i===i) c.classList.add('bsel'); }
      if(ph==='locate') c.classList.add('pick');
      c.onclick=(ev)=>{ ev.stopPropagation();
        if(PZ.running) return;
        if(ph==='locate'){ locateTap({row:k,i}); return; }
        if(ph==='falta'){ if(!isBlank) return; PZ.bsel={row:k,i}; arr[i]='?'; beep(600,0.04); renderPuzzle(); return; }
        if(locked) return; arr.splice(i,1); beep(300,0.05); renderPuzzle(); };
      r.append(c); });
    r.onclick=()=>{ if(locked) return; PZ.row=k; renderPuzzle(); };
    R.append(r);
  });
  if(PZ.features.rep){
    const repBlank=ph==='falta'&&(PZ.blanks||[]).some(b=>b.rep);
    const rb=el('div','repbox'+(ph==='locate'?' pick':'')+(repBlank&&PZ.prog.rep==='?'?' isblank':'')); rb.append(el('span','','🔁 Repetir ×'));
    const canEdit=!PZ.running&&(ph==='falta'?repBlank:!locked);
    const minus=el('button','','–'), n=el('span','n',String(PZ.prog.rep)), plus=el('button','','+');
    const cur=()=>PZ.prog.rep==='?'?1:PZ.prog.rep;
    minus.onclick=(ev)=>{ ev.stopPropagation(); if(!canEdit) return; PZ.prog.rep=Math.max(1,cur()-(PZ.prog.rep==='?'?0:1)); beep(400,0.04); renderPuzzle(); };
    plus.onclick=(ev)=>{ ev.stopPropagation(); if(!canEdit) return; PZ.prog.rep=Math.min(12,PZ.prog.rep==='?'?2:cur()+1); beep(500,0.04); renderPuzzle(); };
    if(!canEdit){ minus.style.visibility='hidden'; plus.style.visibility='hidden'; }
    rb.append(minus,n,plus,el('span','vuelta',''));
    if(ph==='locate') rb.onclick=()=>locateTap({rep:true});
    R.append(rb);
  }
  const cnt=cardCount(PZ.prog), raw=PZ.prog.main.length+PZ.prog.A.length+PZ.prog.B.length;
  if(t!=='falta') R.append(el('div','counter',`Tarjetas usadas: ${cnt}`+(PZ.maxCards?` · 📦 caben ${PZ.maxCards} (llevas ${raw})`:'')+(t!=='seq'&&t!=='hilo'&&t!=='custom'?` · reto: ${PZ.best} o menos`:'')));
  if(ph==='predict'){
    const q=el('div','help'); q.style.background='#fff4d6'; q.style.borderColor='#ecd290';
    q.innerHTML='<div style="font-size:30px">🤖</div><div><b>¿El programa de Hilo teje bien la tela del pedido?</b><br>Piénsalo antes de probarlo.</div>';
    R.append(q);
    const act=el('div','actions'); const no=el('button','btn','❌ Tiene un error'), si=el('button','btn green','✅ Está bien');
    no.onclick=()=>predict(false); si.onclick=()=>predict(true); if(TEST||VISIT){ const sb=el('button','btn','👁️ Solución'); sb.onclick=showSolution; act.prepend(sb); } act.append(no,si); R.append(act); return;
  }
  if(ph==='locate'){
    const q=el('div','help'); q.style.background='#fff4d6'; q.style.borderColor='#ecd290';
    q.innerHTML=`<div style="font-size:30px">🔍</div><div><b>¿Dónde está el fallo de Hilo?</b><br>Toca la tarjeta que está mal${PZ.features.rep?' (o el número de Repetir, si el fallo está en las vueltas)':''}.</div>`;
    R.append(q);
    if(TEST||VISIT){ const act=el('div','actions'); const sb=el('button','btn','👁️ Solución'); sb.onclick=showSolution; act.append(sb); R.append(act); }
    return;
  }
  R.append(el('div','lbl',ph==='falta'?'Elige la tarjeta que falta':'Tarjetas'));
  const pal=el('div','palette');
  paletteColors().forEach(k=>{ const c=colorCard(k); c.onclick=()=>addCard(k); pal.append(c); });
  if(PZ.features.mot){ ['A','B'].forEach(k=>{ const c=tokenCard(k); c.onclick=()=>addCard(k); pal.append(c); }); }
  R.append(pal);
  const act=el('div','actions');
  if(ph!=='falta'){ const clr=el('button','btn','↺ Borrar todo'); clr.onclick=()=>{ if(PZ.running) return; PZ.prog={main:[],A:[],B:[],rep:1}; PZ.row='main'; renderPuzzle(); renderResult([]); setMsg(''); }; act.append(clr); }
  if(PZ.attempts>=3&&t!=='falta'){ const h=el('button','btn blue','💡 Pista'); h.onclick=showHint; act.prepend(h); }
  if(TEST||VISIT){ const sb=el('button','btn','👁️ Solución'); sb.onclick=showSolution; act.prepend(sb); }
  const slow=el('button','btn','🐢 Despacio'); slow.onclick=()=>{ PZ.slow=true; knit(); }; slow.disabled=PZ.running;
  const run=el('button','btn primary','▶ Tejer'); run.onclick=knit; run.disabled=PZ.running;
  act.append(slow,run); R.append(act);
}
function paletteColors(){ const tc=uniqColors(PZ.target); return PZ.age<=7?COLOR_KEYS.filter(k=>tc.includes(k)||k==='w'):COLOR_KEYS; }
function colorCard(k){ const c=el('div','ccard'); c.style.background=shade(COLORS[k].c,0.55); c.append(stitchIcon(k,30)); c.title=COLORS[k].n; return c; }
function tokenCard(k){ const c=el('div','ccard tok'+k,k); return c; }
function addCard(k){
  if(PZ.running) return;
  if(PZ.phase==='falta'){ const b=(PZ.bsel&&PZ.prog[PZ.bsel.row][PZ.bsel.i]==='?')?PZ.bsel:nextBlank(); if(!b){ toast('Ya están todas puestas. Toca una tarjeta con borde de puntos para cambiarla.'); return; }
    if((k==='A'||k==='B')&&b.row!=='main'){ toast('Dentro de un motivo solo van hilos de colores'); return; }
    PZ.prog[b.row][b.i]=k; PZ.bsel=nextBlank(); beep(640+COLOR_KEYS.indexOf(k)*40,0.05); renderPuzzle(); return; }
  const row=PZ.row;
  if(PZ.maxCards&&PZ.prog.main.length+PZ.prog.A.length+PZ.prog.B.length>=PZ.maxCards){ toast(`¡Solo caben ${PZ.maxCards} tarjetas! Usa 🔁 Repetir${PZ.features.mot?' y los motivos':''}.`); $('#pz-right').classList.add('shake'); setTimeout(()=>$('#pz-right').classList.remove('shake'),400); return; }
  if((k==='A'||k==='B') && row!=='main'){ toast('Las tarjetas A y B van en el Programa. ¡Toca la fila «Programa»!'); return; }
  if(PZ.prog[row].length>=16){ toast('¡Esta fila está llena!'); return; }
  PZ.prog[row].push(k); beep(640+COLOR_KEYS.indexOf(k)*40,0.05); renderPuzzle();
}
function showHint(){
  PZ.hints++;
  const t=PZ.e.type, v=PZ.v; let h='';
  if(t==='cab'){ const row=PZ.target.slice(0,PZ.v.w); h=`La primera fila tiene ${cabRuns(row).map(([c,n])=>n+' '+(c?COLORS[c].n:'hueco')).join(', ')}. Pon el hilo, teje esos puntos y baja de fila. ¿Hay filas iguales? ¡Repítelas!`; }
  else if(t==='cua') h='Busca una fila o una columna a la que solo le falte un color: ese hueco tiene que ser el color que falta.';
  else if(t==='custom') h=`Mira el pedido fila a fila. ¿Hay algún trocito que se repita? Empieza por los primeros ${Math.min(4,PZ.target.length)} puntos.`;
  if(t==='seq') h=`Mira el pedido punto a punto. El primero es ${COLORS[PZ.target[0]].n}. Tu programa necesita ${PZ.target.length} puntos.`;
  else if(t==='rep'){ h=`El trocito que se repite tiene ${v.sol.main.length} puntos y empieza por ${COLORS[v.sol.main[0]].n}. Mira cuántas veces aparece.`; }
  else if(t==='custom'){}
  else if(t==='mot'||t==='hilo'){ h=`Cada fila del pedido mide ${v.w} puntos. ¿Cuántos tipos de fila distintos hay? Haz un motivo para cada tipo.`; }
  say({face:'💡',name:'Pista',text:h});
}

async function knit(){
  if(PZ.e.type==='cab') return knitCab(false);
  if(PZ.running) return;
  if(PZ.phase==='falta'&&(['main','A','B'].some(r=>PZ.prog[r].includes('?'))||PZ.prog.rep==='?')){ setMsg('Todavía quedan tarjetas «?» por poner.','bad'); PZ.slow=false; return; }
  const out=expand(PZ.prog);
  if(!out.length){ setMsg('Tu programa está vacío. ¡Toca los hilos para añadir puntos!','bad'); $('#pz-right').classList.add('shake'); setTimeout(()=>$('#pz-right').classList.remove('shake'),400); return; }
  if(PZ.prog.main.some(t=>t==='A')&&!PZ.prog.A.length){ setMsg('Usas el motivo A, ¡pero está vacío!','bad'); return; }
  if(PZ.prog.main.some(t=>t==='B')&&!PZ.prog.B.length){ setMsg('Usas el motivo B, ¡pero está vacío!','bad'); return; }
  PZ.attempts++; PZ.running=true; renderPuzzle(); setMsg('🧶 Tejiendo…');
  await animateKnit(out);
  PZ.running=false;
  evaluate(out);
}
function firstDiff(a,b){ const n=Math.min(a.length,b.length); for(let i=0;i<n;i++) if(a[i]!==b[i]) return i; return a.length===b.length?-1:n; }

function evaluate(out){
  const T=PZ.target, d=firstDiff(out,T);
  if(d===-1){ success(); return; }
  renderPuzzle();
  if(d<Math.min(out.length,T.length)){
    renderResult(out.slice(0,Math.min(out.length,T.length+PZ.v.w*2)),[d]); renderTarget([d]);
    setMsg(`¡Uy! El punto ${d+1} debería ser ${COLORS[T[d]].n} y es ${COLORS[out[d]].n}. ¡Busca el error en el programa!`,'bad');
  } else if(out.length<T.length){
    setMsg(`¡Casi! Faltan puntos: tu tela tiene ${out.length} y el pedido ${T.length}.`,'bad');
  } else {
    renderResult(out.slice(0,T.length+PZ.v.w*2),[T.length]);
    setMsg(`¡Te sobran puntos! Tu tela tiene ${out.length} y el pedido solo ${T.length}.`,'bad');
  }
  speakAuto($('#pz-msg').textContent); beep(220,0.2,'sawtooth',0.03);
  if(PZ.e.type==='hilo' && PZ.phase==='fix-intro'){ PZ.phase=null; }
  if(PZ.attempts===3) toast('💡 Ya puedes pedir una pista');
}

async function predict(saysOk){
  PZ.predicted=saysOk; PZ.phase=null;
  const out=expand(PZ.prog); const hiloOk=firstDiff(out,PZ.target)===-1;
  PZ.predictRight = (saysOk===hiloOk);
  PZ.running=true; renderPuzzle(); setMsg('🤖 Probamos el programa de Hilo…');
  await animateKnit(out); PZ.running=false;
  if(hiloOk){
    if(PZ.predictRight) await say({face:'🤖',name:'Hilo',text:'¡Bip! Tenías razón: esta vez mi programa estaba bien. ¡Gracias por comprobarlo!'});
    else await say({face:'🤖',name:'Hilo',text:'Pues esta vez sí estaba bien. ¡Comprobar siempre ayuda a estar segura!'});
    success(); return;
  }
  const d=firstDiff(out,PZ.target);
  if(PZ.predictRight&&PZ.v.locate&&(PZ.v.bugs||[]).length){
    await say({face:'🤖',name:'Hilo',text:'¡Bien visto! Me había equivocado. Pero… ¿dónde? Toca la tarjeta de mi programa que está mal.'});
    PZ.phase='locate'; renderPuzzle(); renderResult(out.slice(0,PZ.target.length+PZ.v.w*2)); setMsg('🔍 Compara el pedido con lo que ha tejido Hilo y busca la tarjeta culpable.'); return; }
  await say({face:'🤖',name:'Hilo',text: PZ.predictRight?'¡Bien visto! Me había equivocado. ¿Me ayudas a arreglar el programa?':'¡Ups! Mi programa tenía un error. Fíjate bien en la tela… ¿Me ayudas a arreglarlo?'});
  PZ.attempts=0; renderPuzzle(); evaluate(out);
}

function checkReglas(){
  if(PZ.fill.includes('?')){ setMsg('Todavía quedan huecos con «?».','bad'); return; }
  PZ.attempts++;
  const d=firstDiff(PZ.fill,PZ.target);
  if(d===-1){ success(); return; }
  renderTarget([d]); setMsg(`El punto ${d+1} no sigue la regla. ¡Mira otra vez qué se repite!`,'bad'); speakAuto($('#pz-msg').textContent); beep(220,0.2,'sawtooth',0.03);
}

async function success(){
  const p=P(), e=PZ.e, t=e.type; let stars=3, note='';
  if(t==='custom') return successCustom();
  if(t==='seq'||t==='reglas'||t==='cua'){ stars=PZ.attempts<=1?3:PZ.attempts===2?2:1; }
  else if(t==='cab'){ const cc=countNodes(PZ.prog); stars=cc<=PZ.best?3:cc<=PZ.best+4?2:1; if(stars<3) note=`¡Funciona! Has usado ${cc} tarjetas. Se puede hacer con ${PZ.best}. Pista: usa 🔁 Repetir, también uno dentro de otro.`; }
  else if(t==='rep'||t==='mot'){
    const cc=cardCount(PZ.prog);
    stars = cc<=PZ.best?3: cc<=PZ.best+3?2:1;
    if(stars<3) note=`¡Funciona! Has usado ${cc} tarjetas. Se puede hacer con ${PZ.best}. ¿Te atreves a intentarlo otra vez?`;
  } else if(t==='hilo'){ stars=PZ.predictRight&&PZ.locRight!==false?3:2; if(!PZ.predictRight) note='La próxima vez, sigue el programa de Hilo con el dedo antes de decidir.'; else if(PZ.locRight===false) note='Encontraste que había un error. ¡La próxima vez busca también dónde está a la primera!'; }
  else if(t==='falta'){ stars=PZ.attempts<=1?3:PZ.attempts===2?2:1; }
  const kind=e.kind||'story';
  if(kind==='catalog'){ fanfare(); await say({center:true,html:`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:24px;font-weight:800">Ejercicio superado</div>${note?`<div style="font-size:17px">${esc(note)}</div>`:''}<div class="counter">Intentos: ${PZ.attempts} · Tarjetas: ${t==='cab'?countNodes(PZ.prog):cardCount(PZ.prog)} · Reto: ${PZ.best}</div></div>`}); openCatalog(); return; }
  recordStats(p,e.id,stars,t); if(kind!=='catalog') logAct(p,'t',1,stars===3?1:0,t);
  if(t==='hilo'&&PZ.predictRight) p.counters.hiloRight++;
  const perfect = PZ.attempts<=1 && stars===3 && !PZ.hints;
  const items=[]; let coins=0, xp=0, plant=null, story=null, first=false;
  if(kind==='practice'){
    const pc=(p.practice&&p.practice.date===today())?p.practice.coins:0;
    coins=Math.min(Math.max(0,15-pc),stars); p.practice={date:today(),coins:pc+coins};
    if(!coins) note='Hoy ya has ganado todos los botones de práctica. ¡Pero practicar te hace mejor tejedora!';
  } else {
    const prev = kind==='story' ? (p.done[e.id]||0) : ((p.daily&&p.daily.done[e.id])||0);
    first=!prev;
    if(kind==='story') p.done[e.id]=Math.max(prev,stars);
    if(isToday(p,e.id)) p.daily.done[e.id]=Math.max(p.daily.done[e.id]||0,stars);
    if(first){
      coins=stars*(kind==='story'?3:2); xp=stars+1;
      if(t==='hilo'&&PZ.predictRight) coins+=3;
      p.counters.encargos++; if(perfect) p.counters.firstTry++;
      if(kind==='story' || p.counters.encargos<=10 || Math.random()<0.5){ plant=rollPlant(p); p.inv[plant.k]=(p.inv[plant.k]||0)+1; }
      p.beads.push(mostCommon(PZ.target)); items.push('📿 cuenta nueva');
      if(e.story && !p.stories.includes(e.story)){ p.stories.push(e.story); story=STORIES[e.story]; }
      p.fabrics.push({cells:PZ.target.slice(),w:PZ.v.w,name:e.title,by:e.npc}); if(p.fabrics.length>60) p.fabrics.shift();
    } else { coins=Math.max(0,stars-prev)*2; xp=Math.max(0,stars-prev); }
    p.streak = (PZ.attempts<=1&&stars===3) ? (p.streak||0)+1 : 0;
  }
  p.coins+=coins; p.counters.earned+=coins; addXP(p,xp);
  if(first) addMastery(p,'telar',1); // solo los encargos nuevos suman maestría: ni repetir uno hecho ni la práctica libre
  if(e.L&&(first||kind==='practice')&&!VISIT){ const lvUp=tlvUpdate(p,t,PZ.attempts<=1&&stars===3&&!PZ.hints,stars<=1||PZ.attempts>=4||PZ.hints>0);
    if(lvUp==='up'){ items.push(`📈 ${TYPE_NAMES[t]}: ¡nivel ${tlvOf(p,t)}!`); addNews(p,'📈',`ha subido ${TYPE_NAMES[t]} al nivel ${tlvOf(p,t)}`); } }
  if(coins) items.unshift(`🔘 +${coins} botones`);
  if(xp) items.push(`✨ +${xp} experiencia`);
  if(plant) items.splice(1,0,`${plant.e} ${plant.n}${plant.rar!=='Común'?' · '+plant.rar+'!':''}`);
  save(`${kind==='practice'?'Practicó':first?'Completó':'Repitió'}: ${e.title} ${'★'.repeat(stars)}`); fanfare();
  let html=`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:26px;font-weight:800">¡${esc(NPCS[e.npc].n.split(' ')[0])} está feliz!</div>`;
  if(note) html+=`<div style="font-size:18px">${esc(note)}</div>`;
  if(items.length) html+=`<div class="rw-items">${items.map(i=>`<div class="rw-item">${i}</div>`).join('')}</div>`;
  if(story) html+=`<div class="story"><b>${story.e} ${esc(story.t)}</b><br>${esc(story.x)}</div>`;
  if(plant) html+=`<div style="font-size:16px;color:var(--soft)">Planta tu ${esc(plant.n)} en el jardín y riégala cada día para que crezca.</div>`;
  html+='</div>';
  if(story) speakAuto(story.x);
  const canImprove = stars<3 && t!=='hilo' && kind!=='practice';
  const choice = await say({html,buttons:canImprove?[{t:'Intentarlo otra vez'},{t:'Seguir',cls:'primary'}]:[{t:'¡Genial!',cls:'primary'}],center:true});
  await checkLevelUp();
  await dailyBonusCheck(p);
  await afterRewards();
  if(canImprove && choice===0){ openPuzzle(e); return; }
  if(kind==='practice'){ const r=await say({face:'🏋️',name:'Práctica libre',text:'¿Otra tela de práctica?',buttons:[{t:'Volver al taller'},{t:'¡Otra!',cls:'primary'}],speak:false}); if(r===1){ openPuzzle(genEncargo(p,'practice'+Date.now(),'practice','x'+Date.now())); return; } }
  openWorkshop();
}
function mostCommon(arr){ const c={}; arr.forEach(x=>c[x]=(c[x]||0)+1); return Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0]; }

async function checkLevelUp(){
  const p=P();
  while(p.unlocked<3){
    const l=p.unlocked; const lvEnc=ENC.filter(e=>e.lvl===l); const nd=lvEnc.filter(e=>p.done[e.id]).length;
    const fast = p.streak>=3 && nd>=3;
    if(nd<lvEnc.length && !fast) break;
    p.unlocked=l+1; p.streak=0; addNews(p,'🎉',`ha llegado al nivel ${l+1} del taller: ${LEVELS[l+1]}`);
    const sp=SPECIAL['L'+l]; p.inv['L'+l]=(p.inv['L'+l]||0)+1; p.beads.push('c:⭐'); p.coins+=10; p.counters.earned+=10; save('¡Sube al nivel '+(l+1)+'!');
    const news = l===1?'Han llegado Bruno el oso y Lía la nutria, ¡y la plaza tiene fuente y farolas nuevas!':'Han llegado Nube la coneja y Hilo el robot. ¡Y hay un puente nuevo sobre el río!';
    fanfare();
    await say({center:true,html:`<div class="reward"><div style="font-size:64px">🎉</div><div style="font-size:30px;font-weight:800">¡Nivel ${l+1}: ${LEVELS[l+1]}!</div>${fast&&nd<lvEnc.length?'<div style="font-size:18px">¡Vas tan rápida que pasas de nivel antes de tiempo!</div>':''}<div class="rw-items"><div class="rw-item">${sp.e}${sp.f} ${esc(sp.n)}</div><div class="rw-item">⭐ dije para tu pulsera</div><div class="rw-item">🔘 +10 botones</div></div><div style="font-size:19px">${esc(news)}</div></div>`,buttons:[{t:'¡Bien!',cls:'primary'}]});
    speakAuto('Nivel '+(l+1)+'. '+news);
  }
  if(!p.master && ENC.every(e=>p.done[e.id])){
    p.master=true; p.inv.M=(p.inv.M||0)+1; p.beads.push('c:👑'); p.coins+=20; save('¡Maestra tejedora!'); fanfare();
    await say({center:true,html:`<div class="reward"><div style="font-size:64px">👑</div><div style="font-size:30px;font-weight:800">¡Maestra tejedora!</div><div class="rw-items"><div class="rw-item">🌳🌈 Árbol arcoíris</div><div class="rw-item">👑 dije de corona</div><div class="rw-item">🔘 +20 botones</div></div><div style="font-size:19px">Has terminado todos los encargos. Hilo dice que muy pronto se abrirá el Huerto del robot…</div></div>`,buttons:[{t:'¡Hurra!',cls:'primary'}]});
  }
}
