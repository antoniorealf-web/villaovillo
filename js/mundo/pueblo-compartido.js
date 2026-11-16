/* =========================================================
   PUEBLO COMPARTIDO y NOTICIAS DEL PUEBLO
   ========================================================= */
/* El pueblo crece con lo que hacen las dos. DB.news guarda los logros para que la otra los vea. */
function townLv(){ const G=DB.profiles.filter(Boolean); return G.length?Math.max(...G.map(q=>q.unlocked||1)):1; }
function progressStats(p){
  const G=DB.profiles.filter(Boolean); if(!G.length) return {done:0,stars:0,lv:1,trees:3};
  const done=G.reduce((a,q)=>a+(q.counters.encargos||0),0), xp=G.reduce((a,q)=>a+(q.xp||0),0), lv=townLv(), vl=G.reduce((a,q)=>a+villageLevel(q),0);
  return {done,stars:xp,lv,trees:Math.min(TREE_SPOTS.length,3+Math.floor(done/3)+Math.floor(vl/2)+(lv-1))};
}
function addNews(p,e,txt){
  if(VISIT||!p) return; DB.news=DB.news||[];
  DB.news.push({t:Date.now(),pid:p.id,name:p.name,e,txt}); if(DB.news.length>60) DB.news.splice(0,DB.news.length-60);
}
function newsLine(n){ const d=new Date(n.t); const dd=today()===`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`?'hoy':`${d.getDate()}/${d.getMonth()+1}`;
  return `<div class="mitem" style="padding:8px 12px;align-items:center"><div class="mi" style="font-size:28px">${n.e}</div><div class="mt"><b>${esc(n.name)}</b> ${esc(n.txt)} <span class="counter">· ${dd}</span></div></div>`; }
async function showNews(p){
  const fresh=(DB.news||[]).filter(n=>n.pid!==p.id&&n.t>(p.newsSeen||0)).slice(-5);
  p.newsSeen=Date.now(); saveQuiet();
  if(!fresh.length) return;
  await say({face:'📰',name:'Noticias del pueblo',speak:false,html:`<div style="font-size:18px;margin-bottom:8px">Mientras no estabas, en Villaovillo…</div><div style="display:flex;flex-direction:column;gap:6px">${fresh.map(newsLine).join('')}</div>`,buttons:[{t:'¡Qué bien!',cls:'primary'}]});
}
async function openNews(){
  const all=(DB.news||[]).slice(-10).reverse();
  const r=await say({face:'🎩',name:'Ayuntamiento · Noticias',speak:false,
    html:all.length?`<div style="display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow:auto">${all.map(newsLine).join('')}</div>`:'<div style="font-size:18px">Todavía no hay noticias. ¡Cada logro de las dos aparecerá aquí!</div>',
    buttons:[{t:'Cerrar'},{t:'📌 Tablón de tareas',cls:'primary'}]});
  if(r===1) openBoard();
}
