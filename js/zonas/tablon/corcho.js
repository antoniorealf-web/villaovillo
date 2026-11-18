"use strict";
/* =========================================================
   TABLÓN DE CORCHO (tareas, notas de las niñas y noticias)
   ========================================================= */
/* DB.boardMsgs = notas pinchadas por las niñas o papá, visibles para todos. Noticias, chistes y adivinanzas: paquete paquetes/gaceta.js. */
const PAPER_COLS=['#fff3a8','#ffd1dc','#d6ecff','#dff5d8','#ffe2c2'];
function corkMsgs(){ DB.boardMsgs=DB.boardMsgs||[]; return DB.boardMsgs; }
/* Una nota por persona (cada niña y el alcalde): la última que escribe sustituye a la anterior y se queda colgada. */
function corkNotasVivas(){ const L=corkMsgs(), seen=new Set(), out=[]; for(let i=L.length-1;i>=0;i--){ const k=L[i].fromId||L[i].from; if(seen.has(k)) continue; seen.add(k); out.push(L[i]); } return out; }
function corkPonNota(n){ const L=corkMsgs(); if(L.some(x=>x.id===n.id)) return; for(let i=L.length-1;i>=0;i--) if((L[i].fromId||L[i].from)===n.fromId) L.splice(i,1); L.push(n); }
/* ---------- Carteles ----------
   El tablón es un corcho con carteles pequeños (no se leen); al tocar uno, sale en grande como una hoja de papel.
   Un cartel es un objeto:
   { key, tipo, emoji, titulo, texto, firma?, estilo: 'rayas'|'cuadros'|'posit'|'kraft'|'periodico'|'tarjeta'|'pergamino',
     color? (papel), sello? (pegatina en la miniatura: '¡Nuevo!', '❓', '🎁'…), leer? (texto para 🔊),
     prio? (más alto = se queda si no caben todos), extra?(cont) (contenido especial en grande), acciones?(cont) (botones) }
   Los paquetes añaden carteles con el enchufe «tablon» (ver js/nucleo/paquetes.js). */
const CORK_COLS=4, CORK_ROWS=3;
function boardCards(){
  const alc=!!VISIT, p=P(), cards=[];
  const all=(DB.msgs||[]).concat(localMsgs()).filter(m=>isTask(m)&&!['borrada','caducada'].includes(m.estado));
  const tasks=alc?all.filter(m=>!(m.estado==='validada'&&(DB.profiles.find(q=>q&&q.id===m.para)||{rewarded:{}}).rewarded[m.id])):myTasks().filter(m=>!(m.estado==='validada'&&p.rewarded[m.id]));
  tasks.slice().reverse().forEach(m=>{
    const who=DB.profiles.find(q=>q&&q.id===m.para);
    const sello=alc?(m.estado==='hecha'?'✅ ¿Hecha?':''):(m.estado==='nuevo'?'¡Nueva!':m.estado==='hecha'?'⏳':m.estado==='validada'?'🎁':'');
    cards.push({key:'t'+m.id, tipo:'tarea', estilo:'rayas', emoji:m.tipo==='deberes'?'📚':'🧹', titulo:m.tipo==='deberes'?'Deberes':'Tarea de casa',
      texto:m.texto||'', firma:(alc&&who?'Para '+who.name+' · ':'')+'Premio: 🔘 '+(m.premio||10)+(m.rid?' · 📅 cada día':''), punto:alc&&who?who.color:null,
      sello, prio:100+(m.estado==='hecha'?5:0), leer:m.texto||'',
      acciones(a){
        const B=(t,cls,fn)=>{ const b=el('button','btn '+(cls||''),t); b.onclick=fn; a.append(b); };
        const again=()=>{ closePaper(); renderBoard(); };
        if(alc){
          if(m.estado==='hecha') B('✅ Validar','green',async()=>{ await validateMsg(m); again(); });
          else a.append(el('span','pstate',m.estado==='nuevo'?'Sin empezar':m.estado==='aceptada'?'Aceptada':m.estado==='validada'?'Validada · falta recoger':''));
          if(String(m.id).startsWith('L')) B('🗑️ Quitar','',async()=>{ if(await alcHaz('pueblo','quitar',{id:m.id},'Quitar la tarea «'+(m.texto||'')+'»')) again(); });
        } else {
          if(m.estado==='nuevo'||m.estado==='aceptada') B('✅ ¡Ya la hice!','green',()=>{ closePaper(); doneTask(m).then(renderBoard); }); // sin paso de «Aceptar»
          else if(m.estado==='hecha') a.append(el('span','pstate','⏳ Papá lo comprobará'));
          else if(m.estado==='validada') B('🎁 Recoger premio','primary',()=>{ closePaper(); collectTask(m).then(renderBoard); });
        }
      }});
  });
  corkNotasVivas().forEach((n,i)=>{
    const dt=new Date(n.t), me=alc?'alcalde':(p&&p.id);
    const st=(String(n.text).match(/\p{Extended_Pictographic}/u)||['✏️'])[0];
    const dueña=DB.profiles.find(q=>q&&q.id===n.fromId);
    cards.push({key:'n'+(n.id||n.t), tipo:'nota', fromId:n.fromId, punto:dueña?dueña.color:null, estilo:'posit', color:n.col||PAPER_COLS[i%PAPER_COLS.length], emoji:st, titulo:'Nota de '+n.from,
      texto:n.text, firma:n.from+' · '+dt.getDate()+'/'+(dt.getMonth()+1), prio:120-i, leer:n.from+' dice: '+n.text,
      acciones:(alc||n.fromId===me)?(a=>{ const x=el('button','btn','🗑️ Quitar la nota'); x.onclick=async()=>{ if(alc){ if(!(await alcHaz('pueblo','notaDel',{id:n.id},'Quitar la nota «'+n.text+'»'))) return; } else { const k=corkMsgs().indexOf(n); if(k>=0) corkMsgs().splice(k,1); saveQuiet(); } closePaper(); renderBoard(); }; a.append(x); }):null});
  });
  (DB.news||[]).slice(-2).reverse().forEach((n,i)=>cards.push({key:'g'+n.t, tipo:'logro', estilo:'periodico', emoji:n.e, titulo:'¡Bien por '+n.name+'!',
    texto:n.name+' '+n.txt+'.', firma:'La Gaceta de Villaovillo · Última hora', prio:50-i}));
  enchufe('tablon',{alcalde:alc,p}).forEach(c=>{ if(c&&c.titulo) cards.push(Object.assign({prio:10},c)); });
  return cards;
}
function renderBoard(){
  const alc=!!VISIT, p=P(); $('#board-coins').textContent=alc?'🎩 Alcalde':'🔘 '+p.coins; $('#board-coins').style.display='';
  $('#board-alc').style.display=alc?'none':'';
  const L=$('#blist'); L.innerHTML=''; L.className='corkboard';
  const portrait=innerHeight>innerWidth, C=portrait?3:CORK_COLS, Rw=portrait?4:CORK_ROWS;
  L.style.gridTemplateColumns=`repeat(${C},1fr)`; L.style.gridTemplateRows=`repeat(${Rw},1fr)`;
  const R=rng(today()+'|corcho'), slots=[];
  for(let r=0;r<Rw;r++) for(let c=0;c<C;c++) slots.push([r,c]);
  const pad=slots.pop(); // la libreta siempre abajo a la derecha
  // Un hueco reservado para cada niña, siempre el mismo (junto a la libreta): ahí va su nota y solo ella la sustituye.
  const ninas=DB.profiles.filter(Boolean).slice(0,2), reservados=slots.splice(slots.length-ninas.length,ninas.length);
  let cards=boardCards();
  const ajenas=cards.filter(c=>!(c.tipo==='nota'&&ninas.some(q=>q.id===c.fromId)));
  let resto=ajenas;
  if(resto.length>slots.length) resto=resto.slice().sort((a,b)=>b.prio-a.prio).slice(0,slots.length);
  // tareas primero, en las primeras casillas; el resto, repartido por el corcho
  const nT=resto.filter(c=>c.tipo==='tarea').length;
  const free=slots.slice(nT); shuffle(free,R);
  const pos=slots.slice(0,nT).concat(free);
  resto.forEach((c,i)=>L.append(miniCard(c,pos[i],R)));
  ninas.forEach((q,i)=>{
    const c=cards.find(x=>x.tipo==='nota'&&x.fromId===q.id), mia=!alc&&p&&p.id===q.id;
    if(c) L.append(miniCard(c,reservados[i],R));
    else { const h=miniCard({key:'h'+q.id,tipo:'libreta',estilo:'hueco',emoji:mia?'✏️':'📌',punto:q.color},reservados[i],R); h.classList.add('hueco');
      h.insertAdjacentHTML('beforeend',`<div class="hname">${esc(q.name)}</div>`);
      h.onclick=()=>{ if(mia) corkNewNote(); else toast('📌 Este sitio es de '+q.name); }; L.append(h); }
  });
  const blank={key:'pad',tipo:'libreta',estilo:'libreta',emoji:alc?'➕':'✏️',sello:''};
  const d=miniCard(blank,pad,R); d.classList.add('mpad'); d.innerHTML+=`<div class="mpadt">${alc?'Poner tarea':'Dejar nota'}</div>`;
  d.onclick=()=>alc?corkPadMenu():corkNewNote(); L.append(d);
}
function miniCard(c,[r,col],R){
  const d=el('div','mini pap-'+c.estilo); d.style.gridRow=String(r+1); d.style.gridColumn=String(col+1);
  const rot=Math.round((R()*8-4)*10)/10, dx=Math.round(R()*16-8), dy=Math.round(R()*12-6);
  d.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg)`; if(c.color) d.style.background=c.color;
  const fix=(c.estilo==='tarjeta'||c.estilo==='kraft')?'<span class="tape"></span>':'<span class="pin"></span>';
  d.innerHTML=`${fix}<div class="me">${c.emoji||'📄'}</div>${c.tipo==='libreta'?'':'<div class="scrib"></div><div class="scrib s2"></div><div class="scrib s3"></div>'}${c.punto?`<span class="mdot" style="background:${c.punto}"></span>`:''}${c.sello?`<span class="msello">${esc(c.sello)}</span>`:''}`;
  if(c.tipo!=='libreta') d.onclick=()=>openPaper(c);
  return d;
}
function openPaper(c){
  closePaper(); beep(520,0.05,'triangle');
  const ov=el('div','paperview'); ov.id='paperview';
  const sh=el('div','bigpaper pap-'+c.estilo); if(c.color) sh.style.background=c.color;
  sh.style.setProperty('--rot',(((c.key||'').length%5)-2)*0.6+'deg');
  sh.innerHTML=`${c.estilo==='tarjeta'||c.estilo==='kraft'?'<span class="tape"></span>':'<span class="pin"></span>'}`;
  const bin=el('div','bin'); sh.append(bin); // el contenido va dentro para que la chincheta no se corte al hacer scroll
  bin.innerHTML=(c.estilo==='periodico'?`<div class="bmast">LA GACETA DE VILLAOVILLO</div>`:'')+
    `<div class="btitle">${c.emoji?c.emoji+' ':''}${esc(c.titulo||'')}</div><div class="btext">${esc(c.texto||'').replace(/\n/g,'<br>')}</div>`;
  if(c.extra){ const x=el('div','bextra'); c.extra(x); bin.append(x); }
  if(c.firma) bin.append(el('div','bfirma',esc(c.firma)));
  const a=el('div','bacts'); const sp=el('button','speak','🔊'); sp.onclick=ev=>{ ev.stopPropagation(); speakNow(c.leer||((c.titulo||'')+'. '+(c.texto||''))); }; a.append(sp);
  if(c.acciones) c.acciones(a); bin.append(a);
  const x=el('button','bclose','✕'); x.onclick=closePaper;
  ov.append(sh,x); ov.onclick=ev=>{ if(ev.target===ov) closePaper(); };
  $('#scr-board').append(ov); requestAnimationFrame(()=>ov.classList.add('on'));
}
function closePaper(){ const o=document.getElementById('paperview'); if(o) o.remove(); }
async function corkPadMenu(){
  const r=await say({face:'📌',name:'Tablón',speak:false,text:'¿Qué quieres pinchar?',buttons:[{t:'Cancelar'},{t:'✏️ Nota del alcalde'},{t:'➕ Poner una tarea',cls:'primary'}]});
  if(r===2) corkNewTask(); else if(r===1) corkNewNote();
}
function speakBtn(t){ const a=el('div','pacts'); const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(t); a.append(sp); return a; }
async function corkNewNote(){
  const alc=!!VISIT, p=P();
  const r=await say({face:'✏️',name:alc?'Nota del alcalde':'Nota para el tablón',speak:false,
    html:`<div style="font-size:17px;margin-bottom:6px">${alc?'Tu nota se queda colgada en el tablón para las dos. Si escribes otra, sustituye a la anterior.':'Tu nota se queda colgada en tu sitio del tablón para que la lean tu hermana y papá. Si escribes otra, sustituye a la anterior.'}</div><textarea class="inputline" id="ck-t" maxlength="120" rows="3" style="width:100%;resize:none;font-family:inherit" placeholder="${alc?'¡Mañana vamos al parque!':'¡Hola! …'}"></textarea><div class="choice" id="ck-st">${BOARD_STICKERS.map(s=>`<button style="font-size:24px">${s}</button>`).join('')}</div><div class="choice" id="ck-col" style="margin-top:6px">${PAPER_COLS.map((c,i)=>`<button class="dot${i===0?' sel':''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>`,
    buttons:[{t:'Cancelar'},{t:'📌 Pinchar',cls:'primary'}]});
  if(r!==1) return;
  const t=(document.getElementById('ck-t').value||'').trim(); if(!t) return;
  const col=(document.querySelector('#ck-col .sel')||{dataset:{c:PAPER_COLS[0]}}).dataset.c;
  const n={id:'k'+Date.now().toString(36),from:alc?'Papá, el alcalde':p.name,fromId:alc?'alcalde':p.id,text:t,t:Date.now(),col};
  if(alc){ if(!(await alcHaz('pueblo','nota',{n},'Nota en el tablón: «'+t+'»'))) return; }
  else { corkPonNota(n); saveQuiet(); }
  fanfare(); toast('📌 ¡Nota pinchada en el tablón!'); renderBoard();
}
document.addEventListener('click',ev=>{ const s=ev.target.closest('#ck-st button'); if(s){ const ta=document.getElementById('ck-t'); if(ta) ta.value=(ta.value+' '+s.textContent).trim(); }
  const c=ev.target.closest('#ck-col .dot'); if(c){ document.querySelectorAll('#ck-col .dot').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); } });
async function corkNewTask(){
  const pr=say({face:'📌',name:'Nueva tarea',speak:false,html:'<div id="ct-form"></div>',buttons:[{t:'Cancelar'},{t:'📌 Pinchar en el tablón',cls:'primary'}]});
  const F=tareaForm(); document.getElementById('ct-form').append(F.el);
  if((await pr)!==1) return;
  const v=F.leer(); if(!v) return;
  if(!(await nuevaTarea(v.para,v.tipo,v.texto,v.premio,v.rec,v.dias))) return;
  toast(REMOTO?'📌 Tarea enviada: saldrá en la tablet cuando se conecte':'📌 ¡Tarea puesta en el tablón!'); renderBoard();
}
addEventListener('resize',()=>{ if(curScreen==='board') renderBoard(); });
