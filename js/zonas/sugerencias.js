"use strict";
/* =========================================================
   BUZÓN DE IDEAS DEL AYUNTAMIENTO
   ---------------------------------------------------------
   Las niñas escriben al alcalde cómo mejorar el pueblo: retos y tareas, cosas con papá, fallos e ideas nuevas.
   Se guardan en DB.sugs = [{id, de, nombre, cat, texto, t, leida, resp}] (común) y suben a la nube con el pueblo.
   Papá las lee en el modo alcalde (renderSugBox) y las marca como leídas o contesta (orden 'sugLeida').
   También van en el «Informe para Claude».
   ========================================================= */
const SUG_CATS=[
  {k:'retos',e:'🧶',n:'Retos y tareas',pista:'¿Algún reto es muy fácil o muy difícil? ¿Qué tarea te gustaría que pusiera el alcalde?'},
  {k:'alcalde',e:'🎩',n:'El alcalde y yo',pista:'¿Qué te gustaría hacer con el alcalde? ¿Cartas, premios, tareas… algo que cambiarías?'},
  {k:'fallo',e:'🐞',n:'Algo no funciona',pista:'¿Se ha atascado o se ha visto raro algo? Cuenta dónde estabas y qué pasó.'},
  {k:'idea',e:'💡',n:'Idea nueva',pista:'¿Un vecino nuevo, una tienda, un juego, una fiesta para el pueblo?'}
];
const SUG_STICKERS=['😀','😐','😢','❤️','⭐','🙏','👍','🤔'];
function sugs(){ DB.sugs=DB.sugs||[]; return DB.sugs; }
function sugCat(k){ return SUG_CATS.find(c=>c.k===k)||SUG_CATS[3]; }
async function openSugerencias(){
  const p=P(); if(!p||VISIT){ toast('El buzón de ideas es para las vecinas'); return; }
  const intro='¡Villaovillo lo construimos entre todos! Si algo se puede mejorar, cuéntaselo al alcalde: lee cada papel que llega a este buzón.';
  let cat=null;
  const mias=sugs().filter(s=>s.de===p.id).slice(-4).reverse();
  const html=`<div style="font-size:18px;margin-bottom:8px">${intro}</div>
    <div class="lbl">¿De qué va tu papel?</div>
    <div class="choice" id="sg-cat" style="flex-wrap:wrap;gap:6px;justify-content:flex-start">${SUG_CATS.map(c=>`<button data-k="${c.k}" style="font-size:18px">${c.e} ${c.n}</button>`).join('')}</div>
    <div id="sg-pista" class="counter" style="margin:6px 0;min-height:24px">Elige un tema y escribe.</div>
    <textarea class="inputline" id="sg-t" maxlength="300" rows="3" style="width:100%;resize:none;font-family:inherit" placeholder="Querido alcalde: …"></textarea>
    <div class="choice" id="sg-st" style="margin-top:6px">${SUG_STICKERS.map(s=>`<button style="font-size:24px">${s}</button>`).join('')}</div>
    ${mias.length?`<div class="lbl" style="margin-top:10px">Tus últimos papeles</div>${mias.map(s=>`<div class="counter">${sugCat(s.cat).e} ${esc(s.texto)} · ${s.leida?'👀 <b>El alcalde lo ha leído</b>'+(s.resp?': «'+esc(s.resp)+'»':''):'📬 En el buzón'}</div>`).join('')}`:''}`;
  const pr=say({face:'📮',name:'Buzón de ideas del Ayuntamiento',speak:false,html,buttons:[{t:'Cerrar'},{t:'📮 Echar al buzón',cls:'primary'}]});
  speakAuto(intro);
  const box=document.getElementById('sg-cat');
  if(box) box.onclick=ev=>{ const b=ev.target.closest('button'); if(!b) return; cat=b.dataset.k; box.querySelectorAll('button').forEach(x=>x.classList.toggle('sel',x===b)); const c=sugCat(cat); document.getElementById('sg-pista').textContent=c.pista; speakAuto(c.pista); };
  const st=document.getElementById('sg-st');
  if(st) st.onclick=ev=>{ const b=ev.target.closest('button'); if(!b) return; const ta=document.getElementById('sg-t'); ta.value=(ta.value+' '+b.textContent).trim(); };
  const r=await pr;
  const texto=((document.getElementById('sg-t')||{}).value||'').trim();
  if(r!==1) return;
  if(!texto){ toast('Escribe algo en el papel'); return openSugerencias(); }
  sugs().push({id:'s'+Date.now().toString(36),de:p.id,nombre:p.name,cat:cat||'idea',texto,t:Date.now(),leida:false});
  if(sugs().length>100) sugs().splice(0,sugs().length-100);
  saveQuiet(); scheduleCloudSafe(); fanfare();
  say({face:'🎩',name:'¡Gracias, '+p.name+'!',text:'Tu papel ya está en el buzón. El alcalde lo leerá pronto. ¡Así el pueblo será cada vez mejor!'});
}
function scheduleCloudSafe(){ try{ if(cloudReady()) pushPueblo(); }catch(e){} }
/* Modo alcalde: las ideas de las niñas */
function renderSugBox(box){
  const L=sugs().slice().reverse(), nuevas=L.filter(s=>!s.leida).length;
  const b=box('💡 Buzón de ideas'+(nuevas?` (${nuevas} sin leer)`:''));
  if(!L.length){ b.append(el('div','counter','Todavía no hay papeles. Las niñas los echan en el Ayuntamiento: ideas, fallos del juego y cosas sobre las tareas o sobre ti.')); return; }
  L.slice(0,12).forEach(s=>{ const c=sugCat(s.cat), d=new Date(s.t);
    const row=el('div','msgrow'); row.innerHTML=`<div class="mt"><b>${c.e} ${esc(s.nombre)} · ${c.n} · ${d.getDate()}/${d.getMonth()+1}</b>${esc(s.texto)}${s.resp?`<br><i>Tu respuesta: ${esc(s.resp)}</i>`:''}</div>`;
    if(!s.leida){
      const ok=el('button','btn green','👀 Leída'); ok.onclick=async()=>{ if(await alcHaz('pueblo','sugLeida',{id:s.id},'Idea de '+s.nombre+' leída')) renderAlcalde(); };
      const rp=el('button','btn','✉️ Contestar'); rp.onclick=async()=>{
        const r=await say({face:'✉️',name:'Contestar a '+s.nombre,speak:false,html:`<div class="counter">«${esc(s.texto)}»</div><textarea class="inputline" id="sg-r" maxlength="300" rows="3" style="width:100%;resize:none;font-family:inherit" placeholder="¡Gracias por la idea! …"></textarea>`,buttons:[{t:'Cancelar'},{t:'Enviar',cls:'primary'}]});
        const t=((document.getElementById('sg-r')||{}).value||'').trim(); if(r!==1||!t) return;
        if(await alcHaz('pueblo','sugLeida',{id:s.id,resp:t},'Respuesta a la idea de '+s.nombre)){
          await alcHaz(s.de,'tarea',{tipo:'carta',texto:'Sobre tu idea «'+s.texto.slice(0,80)+'»: '+t,premio:0},'Carta para '+s.nombre);
          toast('✉️ Respuesta enviada a su buzón'); renderAlcalde(); } };
      row.append(ok,rp);
    } else row.append(el('span','chip','👀 Leída'));
    b.append(row); });
}
