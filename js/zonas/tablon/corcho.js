/* =========================================================
   TABLÓN DE CORCHO (tareas, notas de las niñas y noticias)
   ========================================================= */
/* DB.boardMsgs = notas pinchadas por las niñas o papá, visibles para todos. Las noticias inventadas cambian cada día. */
const PAPER_COLS=['#fff3a8','#ffd1dc','#d6ecff','#dff5d8','#ffe2c2'];
function corkMsgs(){ DB.boardMsgs=DB.boardMsgs||[]; return DB.boardMsgs; }
function fakeNews(n){
  const d=new Date(now()), mes=d.getMonth(), dia=d.getDay(), R=rng(today()+'|corcho');
  const pr=Math.round(Math.min(1,bridgeTotal()/BRIDGE_GOAL)*100), st=progressStats(P()||{});
  const tiempo=[mes>=11||mes<=1?'Hace frío: Rosa recomienda bufanda doble y chocolate caliente.':mes<=4?'Llega la primavera: las flores del pueblo están a punto de abrirse.':mes<=8?'¡Calor! Lía avisa de que el río está perfecto para chapotear.':'Otoño en Villaovillo: las hojas cubren los caminos de colores.'];
  const pool=[
    ['🐑','Récord de lana','Rosa la oveja ha tejido una bufanda tan larga que da tres vueltas a la fuente de la plaza.'],
    ['🦔','Se busca','Tomás el erizo ha perdido una bellota dorada. Si la encuentras, devuélvela a su casa. Habrá recompensa: ¡un abrazo sin pinchos!'],
    ['🐔','Oferta en la tienda','Coco dice que esta semana sus farolillos brillan más que nunca. ¿Será verdad?'],
    ['🐻','La receta de Bruno','Pan de miel: harina, miel, agua y mucha paciencia. Bruno dice que el secreto es contar bien los minutos.'],
    ['🦦','Noticias del río','Lía ha visto un pez que salta haciendo piruetas. Dice que se llama Chispa.'],
    ['🐰','Nube cuenta saltos','Nube ha saltado 100 veces seguidas. «Es como un bucle», explica, «salto y repito».'],
    ['🤖','Chiste de Hilo','¿Qué le dice un robot a otro? «Bip». Y el otro contesta: «Bip bip». Hilo se ha reído durante 3 minutos.'],
    ['🦉','Sabina recomienda','Leer un ratito antes de dormir ayuda a recordar lo aprendido. ¡Palabra de lechuza!'],
    ['🌦️','El tiempo',tiempo[0]],
    ['🌉','Obras del puente',pr>=100?'¡El puente ya está terminado! Lía da las gracias a las vecinas que pusieron botones.':`El puente de Lía va por el ${pr}%. Cada botón cuenta.`],
    ['🌳','El pueblo crece',`Ya hay ${st.trees} árboles en Villaovillo. Dicen que cada encargo terminado hace brotar uno nuevo.`],
    ['🧶','Dato curioso','Un buen jersey puede llevar más de 50.000 puntos. ¡Menos mal que existen los bucles!'],
    ['🐝','Dato curioso','Las abejas bailan para contarse dónde hay flores. Es su forma de mandar mensajes.'],
    ['🐙','Dato curioso','Los pulpos tienen tres corazones y la sangre azul. ¿Habrá alguno en tu pecera?'],
    ['🔤','Adivinanza','Tengo agujas y no sé coser, tengo números y no sé leer. ¿Qué soy? (Respuesta: el reloj)'],
    ['🔢','Adivinanza','Si Bruno hornea 3 bandejas de 4 bollos, ¿cuántos bollos hay? Piensa… ¡12!'],
    ['🎨','Concurso','El ayuntamiento busca la tela más bonita del pueblo. ¡Cuelga tus diseños en el tendedero!'],
    ['📮','Correo','El cartero dice que el buzón del alcalde está lleno de cartas bonitas. ¿Has mirado el tuyo?'],
    ['🎵','Música en la plaza','Esta tarde, Tomás tocará la flauta junto a la fuente. Se aceptan aplausos.'],
    ['🐞','Visita inesperada','Una mariquita se ha paseado por el tablón. Contó 7 puntos en su espalda.'],
    ['🗓️','Hoy es '+['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][dia],dia===0||dia===6?'¡Fin de semana! Buen día para regar el jardín y decorar la casa.':'Día de cole. Después de los deberes, el telar te espera.']
  ];
  return shuffle(pool,R).slice(0,n);
}
function pinEl(cls,rot){ const d=el('div','paper '+cls); d.style.transform=`rotate(${rot}deg)`; d.append(el('span','pin')); return d; }
function renderBoard(){
  const alc=!!VISIT, p=P(); $('#board-coins').textContent=alc?'🎩 Alcalde':'🔘 '+p.coins; $('#board-coins').style.display='';
  $('#board-alc').style.display=alc?'none':'';
  const L=$('#blist'); L.innerHTML=''; L.className='cork';
  const R=rng(today()+'|rot'); const rot=()=>Math.round((R()*6-3)*10)/10;
  const all=(DB.msgs||[]).concat(localMsgs()).filter(m=>isTask(m)&&!['borrada','caducada'].includes(m.estado));
  const tasks=alc?all.filter(m=>!(m.estado==='validada'&&(DB.profiles.find(q=>q&&q.id===m.para)||{rewarded:{}}).rewarded[m.id])):myTasks().filter(m=>!(m.estado==='validada'&&p.rewarded[m.id]));
  const items=[];
  // tareas
  tasks.slice().reverse().forEach(m=>{
    const d=pinEl('ptask',rot()); const who=DB.profiles.find(q=>q&&q.id===m.para);
    d.innerHTML+=`<div class="phead">${m.tipo==='deberes'?'📚 Deberes':'🧹 Tarea de casa'}${m.rid?' · 📅 hoy':''}</div>${alc&&who?`<div class="pwho" style="color:${who.color}">Para ${esc(who.name)}</div>`:''}<div class="ptext">${esc(m.texto||'')}</div><div class="pprize">🔘 ${m.premio||10}</div>`;
    const a=el('div','pacts'); const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(m.texto||''); a.append(sp);
    const B=(t,cls,fn)=>{ const b=el('button','btn '+(cls||''),t); b.onclick=fn; a.append(b); };
    if(alc){
      if(m.estado==='hecha') B('✅ Validar','green',()=>{ validateMsg(m); renderBoard(); });
      else a.append(el('span','pstate',m.estado==='nuevo'?'Sin empezar':m.estado==='aceptada'?'Aceptada':m.estado==='validada'?'Validada · falta recoger':''));
      if(String(m.id).startsWith('L')) B('🗑️','',()=>{ m.estado='borrada'; saveQuiet(); renderBoard(); });
    } else {
      if(m.estado==='nuevo') B('✋ Aceptar','primary',()=>{ setMsgState(m,'aceptada'); beep(700,0.08,'triangle'); toast('📌 ¡Tarea aceptada! Cuando la termines, márcala.'); renderBoard(); });
      else if(m.estado==='aceptada') B('✅ ¡Ya la hice!','green',()=>doneTask(m).then(renderBoard));
      else if(m.estado==='hecha') a.append(el('span','pstate','⏳ Papá lo comprobará'));
      else if(m.estado==='validada') B('🎁 Recoger premio','primary',()=>collectTask(m).then(renderBoard));
    }
    d.append(a); if(m.estado==='nuevo'&&!alc) d.classList.add('pnew'); items.push(d);
  });
  // notas de las niñas y de papá
  corkMsgs().slice(-12).reverse().forEach((n,i)=>{
    const d=pinEl('pnote',rot()); d.style.background=n.col||PAPER_COLS[i%PAPER_COLS.length];
    const dt=new Date(n.t); d.innerHTML+=`<div class="pfrom">✏️ ${esc(n.from)} · ${dt.getDate()}/${dt.getMonth()+1}</div><div class="ptext hand">${esc(n.text)}</div>`;
    const a=el('div','pacts'); const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(n.from+' dice: '+n.text); a.append(sp);
    const me=alc?'alcalde':p.id; if(alc||n.fromId===me){ const x=el('button','btn','🗑️'); x.onclick=()=>{ const k=corkMsgs().indexOf(n); if(k>=0) corkMsgs().splice(k,1); saveQuiet(); renderBoard(); }; a.append(x); }
    d.append(a); items.push(d);
  });
  // noticias reales del pueblo
  (DB.news||[]).slice(-3).reverse().forEach(n=>{ const d=pinEl('pnews',rot()); d.innerHTML+=`<div class="pmast">📰 EL OVILLO · Última hora</div><div class="ptitle">${n.e} ¡Bien por ${esc(n.name)}!</div><div class="ptext">${esc(n.name)} ${esc(n.txt)}.</div>`; d.append(speakBtn(`¡Bien por ${n.name}! ${n.name} ${n.txt}.`)); items.push(d); });
  // noticias inventadas en los huecos libres
  fakeNews(Math.max(3,10-items.length)).forEach(([e,t,x])=>{ const d=pinEl('pnews',rot()); d.innerHTML+=`<div class="pmast">📰 EL OVILLO</div><div class="ptitle">${e} ${esc(t)}</div><div class="ptext">${esc(x)}</div>`; d.append(speakBtn(t+'. '+x)); items.push(d); });
  // mezclar: tareas primero, luego el resto intercalado
  const nT=tasks.length, rest=shuffle(items.slice(nT),rng(today()+'|mix'));
  // papel en blanco para escribir
  const blank=pinEl('pblank',rot()); blank.innerHTML+=`<div class="ptitle">${alc?'➕ Poner una tarea':'✏️ Dejar una nota'}</div><div class="ptext">${alc?'Para una de las niñas o para las dos':'Escribe algo para todo el pueblo'}</div>`;
  blank.onclick=()=>alc?corkNewTask():corkNewNote();
  const final=items.slice(0,nT).concat([blank]).concat(rest);
  if(alc){ const nb=pinEl('pblank',rot()); nb.innerHTML+='<div class="ptitle">✏️ Nota del alcalde</div><div class="ptext">Un mensaje para las dos</div>'; nb.onclick=corkNewNote; final.splice(nT+1,0,nb); }
  final.forEach(x=>L.append(x));
}
function speakBtn(t){ const a=el('div','pacts'); const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(t); a.append(sp); return a; }
async function corkNewNote(){
  const alc=!!VISIT, p=P();
  const r=await say({face:'✏️',name:alc?'Nota del alcalde':'Nota para el tablón',speak:false,
    html:`<textarea class="inputline" id="ck-t" maxlength="120" rows="3" style="width:100%;resize:none;font-family:inherit" placeholder="${alc?'¡Mañana vamos al parque!':'¡Hola! …'}"></textarea><div class="choice" id="ck-st">${BOARD_STICKERS.map(s=>`<button style="font-size:24px">${s}</button>`).join('')}</div><div class="choice" id="ck-col" style="margin-top:6px">${PAPER_COLS.map((c,i)=>`<button class="dot${i===0?' sel':''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>`,
    buttons:[{t:'Cancelar'},{t:'📌 Pinchar',cls:'primary'}]});
  if(r!==1) return;
  const t=(document.getElementById('ck-t').value||'').trim(); if(!t) return;
  const col=(document.querySelector('#ck-col .sel')||{dataset:{c:PAPER_COLS[0]}}).dataset.c;
  corkMsgs().push({id:'k'+Date.now().toString(36),from:alc?'Papá, el alcalde':p.name,fromId:alc?'alcalde':p.id,text:t,t:Date.now(),col});
  if(corkMsgs().length>30) corkMsgs().splice(0,corkMsgs().length-30);
  saveQuiet(); fanfare(); toast('📌 ¡Nota pinchada en el tablón!'); renderBoard();
}
document.addEventListener('click',ev=>{ const s=ev.target.closest('#ck-st button'); if(s){ const ta=document.getElementById('ck-t'); if(ta) ta.value=(ta.value+' '+s.textContent).trim(); }
  const c=ev.target.closest('#ck-col .dot'); if(c){ document.querySelectorAll('#ck-col .dot').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); } });
async function corkNewTask(){
  const r=await say({face:'📌',name:'Nueva tarea',speak:false,html:`<div class="lbl">Para</div><select class="inputline" id="ct-para">${profileOptions()}</select>
    <div class="lbl">Tipo</div><select class="inputline" id="ct-tipo"><option value="casa">🧹 Tarea de casa</option><option value="deberes">📚 Deberes del cole</option></select>
    <div class="lbl">Qué hay que hacer</div><input class="inputline" id="ct-texto" placeholder="Ej.: Recoger la habitación">
    <div class="lbl">Premio (botones)</div><input class="inputline" id="ct-premio" type="number" value="10" min="1" max="100">
    <label style="display:flex;gap:8px;align-items:center;font-size:18px;margin:6px 0"><input type="checkbox" id="ct-rec" style="width:24px;height:24px"> 📅 Repetir cada día</label>`,
    buttons:[{t:'Cancelar'},{t:'📌 Pinchar en el tablón',cls:'primary'}]});
  if(r!==1) return;
  const para=$('#ct-para').value, tipo=$('#ct-tipo').value, texto=$('#ct-texto').value.trim(), premio=Math.max(1,+$('#ct-premio').value||10), rec=$('#ct-rec').checked;
  if(!texto){ toast('Escribe la tarea'); return; }
  if(rec){ DB.recTasks=DB.recTasks||[]; DB.recTasks.push({rid:'r'+Date.now().toString(36),para,tipo,texto,premio}); DB.profiles.filter(Boolean).forEach(ensureRecurring); }
  else { const targets=para==='todas'?DB.profiles.filter(Boolean).map(q=>q.id):[para]; targets.forEach(pid=>localMsgs().push({id:'L'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),para:pid,tipo,texto,premio,estado:'nuevo'})); }
  saveQuiet(); toast('📌 ¡Tarea puesta en el tablón!'); renderBoard();
}
