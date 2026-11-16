/* =========================================================
   LIBRO
   ========================================================= */
let bookTab='historias';
function openBook(tab){ bookTab=tab; renderBook(); show('book'); }
function renderBook(){
  const p=P(); const tabs=$('#book-tabs'); tabs.innerHTML='';
  [['maestrias','⭐ Maestrías'],['historias','📜 Historias'],['medallas','🏅 Medallas'],['plantas','🌼 Plantas'],['telas','🧵 Mis telas']].forEach(([k,t])=>{ const b=el('button','tab'+(bookTab===k?' sel':''),t); b.onclick=()=>{bookTab=k; renderBook();}; tabs.append(b); });
  const body=$('#book-body'); body.innerHTML='';
  if(bookTab==='maestrias'){ renderMasteryTab(body,p); }
  else if(bookTab==='historias'){
    const g=el('div','storygrid');
    Object.entries(STORIES).forEach(([k,s])=>{
      const has=p.stories.includes(k); const c=el('div','storycard'+(has?'':' lock'));
      if(has){ c.innerHTML=`<div style="font-size:36px">${s.e}</div><div><b>${esc(s.t)}</b><br>${esc(s.x)}</div>`; const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(s.t+'. '+s.x); c.append(sp); }
      else c.innerHTML='<div style="font-size:36px">❔</div><div><b>Historia secreta</b><br>Completa encargos para descubrirla.</div>';
      g.append(c);
    });
    body.append(g);
  } else if(bookTab==='medallas'){
    const g=el('div','medgrid'); const got=MEDALS.filter(m=>p.medals[m.id]).length;
    body.append(el('div','wsec',`<div style="padding:12px 16px 0">🏅 ${got} de ${MEDALS.length} medallas</div>`));
    MEDALS.forEach(m=>{ const v=Math.min(m.goal,m.v(p)), has=!!p.medals[m.id]; const c=el('div','medal'+(has?'':' off'));
      c.innerHTML=`<div class="me">${m.e}</div><div style="flex:1"><div class="mn">${esc(m.n)}</div><div class="md">${esc(m.d)}</div><div class="pbar"><i style="width:${Math.round(v/m.goal*100)}%"></i></div><div class="md">${has?'✅ Conseguida':`${v} / ${m.goal}`} · 🔘 ${m.c}</div></div>`; g.append(c); });
    body.append(g);
  } else if(bookTab==='plantas'){
    const g=el('div','plantgrid'); const n=Object.keys(p.bloomedKinds).length;
    body.append(el('div','wsec',`<div style="padding:12px 16px 0">🌼 ${n} de 12 plantas han florecido en tu jardín</div>`));
    [1,2,3].forEach(l=>PLANTS[l].forEach(([e,nm])=>{ const has=p.bloomedKinds[e]; const c=el('div','pcard'+(has?'':' off'));
      c.innerHTML=`<div class="pe">${e}</div><div style="font-weight:800">${has?esc(nm):'???'}</div><span class="rar r${l}">${['','Común','Rara','Especial'][l]}</span>`; g.append(c); }));
    body.append(g);
  } else {
    const g=el('div','fabgrid');
    if(!p.fabrics.length) g.append(el('div','counter','Todavía no tienes telas. ¡Ve al taller!'));
    p.fabrics.slice().reverse().forEach(f=>{ const c=el('div','fabcard'); c.append(fabricCanvas(f.cells,f.w,{s:Math.max(8,Math.min(20,Math.floor(140/f.w)))})); c.append(el('div','',esc(f.name))); g.append(c); });
    body.append(g);
  }
}
