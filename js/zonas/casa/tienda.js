"use strict";
/* =========================================================
   TIENDA
   ========================================================= */
function openShop(){ renderShop(); show('shop'); const p=P();
  const txt=saludoHora()+', '+p.name+'! '+(p._shopHi?'¿Qué deseas comprar hoy?':'Bienvenida a mi tienda. Aquí cambias tus botones por cosas bonitas para tu jardín y tu casa. ¿Qué deseas comprar hoy?');
  if(!p._shopHi){ p._shopHi=true; saveQuiet(); }
  lugarEscena('shop',$('#shop-esc'),txt); }
let shopTab='jardin';
/* Pestañas de la tienda: las de siempre y las que añadan los paquetes activos (enchufe 'tienda' → [{k, t, render(g, p)}]).
   Los muebles (FURN) y cosas de jardín (SHOP) con .paq solo se venden en la pestaña de su paquete. */
function grupoDe(p){ return p&&p.age<=7?'6':'9'; }
function renderShop(){
  const p=P(); $('#shop-coins').textContent='🔘 '+p.coins;
  const g=$('#shopgrid'); g.innerHTML='';
  const extra=enchufe('tienda',p).filter(x=>x&&x.k&&x.render);
  const tabs=[['jardin','🌼 Para tu jardín'],['casa','🛋️ Para tu casa']].concat(extra.map(x=>[x.k,x.t]));
  if(!tabs.some(([k])=>k===shopTab)) shopTab='jardin';
  const tb=el('div','tabs'); tb.style.gridColumn='1/-1'; tb.style.padding='0';
  tabs.forEach(([k,t])=>{ const b=el('button','tab'+(shopTab===k?' sel':''),t); b.onclick=()=>{ shopTab=k; renderShop(); }; tb.append(b); }); g.append(tb);
  const ex=extra.find(x=>x.k===shopTab); if(ex){ ex.render(g,p); return; }
  if(shopTab==='casa'){ FURN.filter(f=>!f.paq).forEach(f=>tarjetaMueble(g,p,f)); return; }
  if(p.gardenRows<6){
    const price=p.gardenRows===4?150:300, rr=p.gardenRows===4?7:20;
    const c=el('div','sitem'); c.style.background='#eaf7e4'; c.innerHTML=`<div class="e">🪴</div><div class="n">Ampliar el jardín</div><div class="counter">+1 fila de huecos</div>`;
    if(p.counters.water<rr) c.append(el('div','counter',`🔒 Riega ${rr} días (llevas ${p.counters.water})`));
    else { const b=el('button','btn green',`🔘 ${price}`); b.disabled=p.coins<price; b.onclick=()=>{ if(p.coins<price) return; p.coins-=price; p.gardenRows++; for(let i=0;i<8;i++) p.garden.push(null); save('Amplió el jardín'); fanfare(); toast('🪴 ¡Tu jardín es más grande!'); renderShop(); }; c.append(b); }
    g.append(c);
  }
  SHOP.filter(s=>!s.paq).forEach(s=>tarjetaJardin(g,p,s));
  const lock=el('div','sitem'); lock.style.opacity=.6; lock.innerHTML='<div class="e">🤖</div><div class="n">Robot jardinero</div><div class="counter">🔒 Muy pronto…</div>'; g.append(lock);
}
/* ¿Lo tiene ya? (cesta, suelo o pared) */
function tieneMueble(p,f){ const R=roomOf(p), k='fu_'+f.k; return (p.inv[k]||0)>0||R.fl.includes(k)||R.wl.includes(k); }
function tieneJardin(p,s){ const k='sh_'+s.k; return (p.inv[k]||0)>0||p.garden.some(c=>c&&c.k===k); }
/* Cosas que solo puede comprar una de las dos (f.para = '6' o '9'): la otra la ve, pero no la compra. */
function deOtra(p,f){ if(!f.para||f.para===grupoDe(p)) return null; const o=DB.profiles.find(q=>q&&grupoDe(q)===f.para); return o?o.name:'tu hermana'; }
function tarjetaMueble(g,p,f){
  const c=el('div','sitem'); const ic=document.createElement('canvas'); const dpr=window.devicePixelRatio||1; ic.width=90*dpr; ic.height=80*dpr; ic.style.width='90px'; ic.style.height='80px'; const cx=ic.getContext('2d'); cx.scale(dpr,dpr);
  if(f.z==='wall') drawWallItem(cx,f,45,40,0); else drawFurn(cx,f,45,f.draw==='shelf'?80:74,f.draw==='shelf'?0.8:0.95,0);
  c.append(ic); c.append(el('div','n',esc(f.n))); c.append(el('div','counter',f.z==='wall'?'Para la pared':'Para el suelo'));
  const otra=deOtra(p,f); if(otra){ c.style.opacity=.6; c.append(el('div','counter',`⭐ Es de ${esc(otra)}. ¡Ve a verla a su casa!`)); g.append(c); return; }
  if(f.m&&mLevel(p,f.m[0])<f.m[1]){ c.style.opacity=.6; c.append(el('div','counter',`🔒 ${MAST[f.m[0]].e} ${MAST[f.m[0]].n} nivel ${f.m[1]}`)); g.append(c); return; }
  if(f.d&&(p.days.count||0)<f.d){ c.style.opacity=.6; c.append(el('div','counter',`🔒 Cuando hayas jugado ${f.d} días (llevas ${p.days.count||0})`)); g.append(c); return; }
  if(f.once&&tieneMueble(p,f)){ c.append(el('div','counter','✅ Ya la tienes')); g.append(c); return; }
  if(f.k==='pizarra') c.append(el('div','counter','Para dibujar y dejar mensajes'));
  if(f.k==='pecera') c.append(el('div','counter','Con un pez. ¡Luego podrás comprar más!'));
  if(f.nota) c.append(el('div','counter',esc(f.nota)));
  const b=el('button','btn green',`🔘 ${f.p}`); b.disabled=p.coins<f.p; b.onclick=()=>{ if(p.coins<f.p) return; p.coins-=f.p; const k='fu_'+f.k; p.inv[k]=(p.inv[k]||0)+1; save('Compró: '+f.n); sfxBuy(); toast(`🛋️ ¡${f.n} para tu casa!`); renderShop(); };
  c.append(b); g.append(c);
}
function tarjetaJardin(g,p,s){
  const c=el('div','sitem'); c.innerHTML=`<div class="e">${s.e}</div><div class="n">${esc(s.n)}</div>`;
  const otra=deOtra(p,s); if(otra){ c.style.opacity=.6; c.append(el('div','counter',`⭐ Es de ${esc(otra)}. ¡Ve a verla a su casa!`)); g.append(c); return; }
  const rq=shopReq(s); if(rq&&mLevel(p,rq[0])<rq[1]){ c.style.opacity=.6; c.append(el('div','counter',`🔒 ${MAST[rq[0]].e} ${MAST[rq[0]].n} nivel ${rq[1]}`)); g.append(c); return; }
  if(s.once&&tieneJardin(p,s)){ c.append(el('div','counter','✅ Ya lo tienes')); g.append(c); return; }
  if(s.nota) c.append(el('div','counter',esc(s.nota)));
  const b=el('button','btn green',`🔘 ${s.p}`); b.disabled=p.coins<s.p;
  b.onclick=()=>{ if(p.coins<s.p) return; p.coins-=s.p; const k='sh_'+s.k; p.inv[k]=(p.inv[k]||0)+1; save('Compró: '+s.n); sfxBuy(); toast(`${s.e} ¡${s.n} a tu cesta!`); renderShop(); };
  c.append(b); g.append(c);
}
