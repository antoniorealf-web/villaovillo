/* =========================================================
   TALLER
   ========================================================= */
function openWorkshop(){ const p=P(); ensureDaily(p); renderWorkshop(); show('workshop'); }
function encOf(p,id){ return ENC.find(e=>e.id===id) || ((p.daily&&p.daily.list.find(x=>x.id===id))||{}).gen; }
function isToday(p,id){ return !!(p.daily&&p.daily.list.some(x=>x.id===id)); }
function encCard(e,stars,todayCard){
  const c=el('button','ecard'+(todayCard&&stars?' donecard':''));
  c.innerHTML=`<div class="who" data-npc="${e.npc}"></div><div class="t">${esc(e.title)}</div><div class="badge">${TYPE_NAMES[e.type]}${e.story?' · 📜':''}${e.L?' · nivel '+e.L:''}</div><div class="st">${todayCard&&stars?'✅ ':''}${starsHTML(stars)}</div><div class="counter">${esc(NPCS[e.npc].n)}</div>`;
  fillWho(c); c.onclick=()=>openPuzzle(e); return c;
}
function renderWorkshop(){
  const p=P(); $('#ws-coins').textContent='🔘 '+p.coins;
  $('#ws-tabs').innerHTML=`<div class="wshead">Nivel ${p.unlocked} · ${LEVELS[p.unlocked]} <span>· 🧶 ${mTitle(p,'telar')} (nivel ${mLevel(p,'telar')})</span></div>`;
  const list=$('#ws-list'); list.innerHTML='';
  const H=t=>list.append(el('div','wsec',t));
  const nd=p.daily.list.filter(x=>p.daily.done[x.id]).length;
  H(`📅 Encargos de hoy · ${nd}/${p.daily.list.length}`);
  p.daily.list.forEach(x=>{ const e=encOf(p,x.id); if(e) list.append(encCard(e,p.daily.done[x.id]||0,true)); });
  if(nd===p.daily.list.length) list.append(el('div','wnote',`🎉 ¡Has terminado los encargos del telar de hoy!${!p.daily.math?' Bruno te espera en la panadería 🥐.':''}${cuadernosFor(p).length&&!p.daily.read?' Sabina te espera en la biblioteca 🦉.':''} Mañana llegarán más.`));
  H('✨ Libre');
  const pr=el('button','ecard practice'); const pc=(p.practice&&p.practice.date===today())?p.practice.coins:0;
  pr.innerHTML=`<div class="who">🏋️</div><div class="t">Práctica libre</div><div class="badge">Encargos sin fin</div><div class="counter">🔘 ${pc}/15 botones hoy</div>`;
  pr.onclick=()=>openPuzzle(genEncargo(p,'practice'+Date.now(),'practice','x'+Date.now()));
  list.append(pr);
  const f=el('button','ecard free'); f.innerHTML='<div class="who">🎨</div><div class="t">Diseño libre</div><div class="badge" style="background:#ece0ff;color:#6a45a8">Crea tu propia tela</div><div class="counter">Se cuelga en el tendedero</div>';
  f.onclick=openDraw; list.append(f);
  const rp=ENC.filter(e=>p.done[e.id]);
  if(rp.length){ H('🔁 Repasar encargos con historia'); rp.forEach(e=>list.append(encCard(e,p.done[e.id],false))); }
}
