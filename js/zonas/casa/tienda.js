/* =========================================================
   TIENDA
   ========================================================= */
function openShop(){ renderShop(); show('shop'); const p=P(); if(!p._shopHi){ p._shopHi=true; say({face:'🐔',name:NPCS.coco.n,text:'¡Bienvenida a mi tienda! Aquí puedes cambiar tus botones por cosas bonitas para tu jardín y para tu casa.'}); } }
let shopTab='jardin';
function renderShop(){
  const p=P(); $('#shop-coins').textContent='🔘 '+p.coins;
  const g=$('#shopgrid'); g.innerHTML='';
  const tb=el('div','tabs'); tb.style.gridColumn='1/-1'; tb.style.padding='0';
  [['jardin','🌼 Para tu jardín'],['casa','🛋️ Para tu casa']].forEach(([k,t])=>{ const b=el('button','tab'+(shopTab===k?' sel':''),t); b.onclick=()=>{ shopTab=k; renderShop(); }; tb.append(b); }); g.append(tb);
  if(shopTab==='casa'){
    FURN.forEach(f=>{ const c=el('div','sitem'); const ic=document.createElement('canvas'); const dpr=window.devicePixelRatio||1; ic.width=90*dpr; ic.height=80*dpr; ic.style.width='90px'; ic.style.height='80px'; const cx=ic.getContext('2d'); cx.scale(dpr,dpr);
      if(f.z==='wall') drawWallItem(cx,f,45,40,0); else drawFurn(cx,f,45,f.draw==='shelf'?80:74,f.draw==='shelf'?0.8:0.95,0);
      c.append(ic); c.append(el('div','n',esc(f.n))); c.append(el('div','counter',f.z==='wall'?'Para la pared':'Para el suelo'));
      if(f.m&&mLevel(p,f.m[0])<f.m[1]){ c.style.opacity=.6; c.append(el('div','counter',`🔒 ${MAST[f.m[0]].e} ${MAST[f.m[0]].n} nivel ${f.m[1]}`)); g.append(c); return; }
      if(f.d&&(p.days.count||0)<f.d){ c.style.opacity=.6; c.append(el('div','counter',`🔒 Cuando hayas jugado ${f.d} días (llevas ${p.days.count||0})`)); g.append(c); return; }
      if(f.once){ const R=roomOf(p), k='fu_'+f.k; if((p.inv[k]||0)>0||R.fl.includes(k)||R.wl.includes(k)){ c.append(el('div','counter','✅ Ya la tienes')); g.append(c); return; } }
      if(f.k==='pizarra') c.append(el('div','counter','Para dibujar y dejar mensajes'));
      if(f.k==='pecera') c.append(el('div','counter','Con un pez. ¡Luego podrás comprar más!'));
      const b=el('button','btn green',`🔘 ${f.p}`); b.disabled=p.coins<f.p; b.onclick=()=>{ if(p.coins<f.p) return; p.coins-=f.p; const k='fu_'+f.k; p.inv[k]=(p.inv[k]||0)+1; save('Compró: '+f.n); sfxBuy(); toast(`🛋️ ¡${f.n} para tu casa!`); renderShop(); };
      c.append(b); g.append(c); });
    return;
  }
  if(p.gardenRows<6){
    const price=p.gardenRows===4?150:300, rr=p.gardenRows===4?7:20;
    const c=el('div','sitem'); c.style.background='#eaf7e4'; c.innerHTML=`<div class="e">🪴</div><div class="n">Ampliar el jardín</div><div class="counter">+1 fila de huecos</div>`;
    if(p.counters.water<rr) c.append(el('div','counter',`🔒 Riega ${rr} días (llevas ${p.counters.water})`));
    else { const b=el('button','btn green',`🔘 ${price}`); b.disabled=p.coins<price; b.onclick=()=>{ if(p.coins<price) return; p.coins-=price; p.gardenRows++; for(let i=0;i<8;i++) p.garden.push(null); save('Amplió el jardín'); fanfare(); toast('🪴 ¡Tu jardín es más grande!'); renderShop(); }; c.append(b); }
    g.append(c);
  }
  SHOP.forEach(s=>{
    const c=el('div','sitem'); c.innerHTML=`<div class="e">${s.e}</div><div class="n">${esc(s.n)}</div>`;
    const rq=shopReq(s); if(rq&&mLevel(p,rq[0])<rq[1]){ c.style.opacity=.6; c.append(el('div','counter',`🔒 ${MAST[rq[0]].e} ${MAST[rq[0]].n} nivel ${rq[1]}`)); g.append(c); return; }
    const b=el('button','btn green',`🔘 ${s.p}`); b.disabled=p.coins<s.p;
    b.onclick=()=>{ if(p.coins<s.p) return; p.coins-=s.p; const k='sh_'+s.k; p.inv[k]=(p.inv[k]||0)+1; save('Compró: '+s.n); sfxBuy(); toast(`${s.e} ¡${s.n} a tu cesta!`); renderShop(); };
    c.append(b); g.append(c);
  });
  const lock=el('div','sitem'); lock.style.opacity=.6; lock.innerHTML='<div class="e">🤖</div><div class="n">Robot jardinero</div><div class="counter">🔒 Muy pronto…</div>'; g.append(lock);
}
