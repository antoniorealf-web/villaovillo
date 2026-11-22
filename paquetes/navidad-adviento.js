"use strict";
/* =========================================================
   NAVIDAD · Calendario de Adviento (del 1 al 24 de diciembre)
   - Cada niña recibe el calendario (mueble de pared) la primera vez que juega en diciembre.
   - Una casilla por día. Se abre después de hacer al menos un ejercicio en el telar, la biblioteca y la panadería
     ese día (lo dice p.log[hoy]). Las casillas atrasadas también se abren, pero como mucho 2 casillas al día.
   - Regalos aprobados el 21 nov 2026 (si ya tiene el regalo, se cambia por botones).
   Lo que se guarda: p.paq.navidad.adv = {abiertas:{día:fecha}, aviso:fecha, dado:1}
   ========================================================= */
const ADV_HOY_MAX=2;
function advDatos(p){ const d=paqDatosNina(p,'navidad'); d.adv=d.adv||{abiertas:{}}; d.adv.abiertas=d.adv.abiertas||{}; return d.adv; }
function advVer(p){ const a=p&&((p.paq||{}).navidad||{}).adv; return a&&a.abiertas?a:{abiertas:{}}; }
function advDiaHoy(){ const t=today(); const m=+t.slice(5,7), d=+t.slice(8,10); return m===12?Math.min(d,24):m===1?24:0; } // hasta qué casilla se puede abrir
function advHecho(p){ const L=(p.log||{})[today()]||{}; return {telar:!!(L.t&&L.t[0]), bib:!!(L.b&&L.b[0]), pan:!!(L.p&&L.p[0])}; }
function advListo(p){ const h=advHecho(p); return h.telar&&h.bib&&h.pan; }
function advHoyAbiertas(p){ const a=advVer(p).abiertas; return Object.values(a).filter(f=>f===today()).length; }
function advPendiente(p){ const n=advDiaHoy(), a=advVer(p).abiertas; for(let i=1;i<=n;i++) if(!a[i]) return i; return 0; }
function advPuede(p){ return paqActivo(NAV)&&advPendiente(p)>0&&advListo(p)&&advHoyAbiertas(p)<ADV_HOY_MAX; }

/* ---------- regalos ---------- */
function advBotones(p,n,txt){ p.coins+=n; p.counters.earned=(p.counters.earned||0)+n; return {e:'🔘',t:(txt?txt+' ':'')+'¡'+n+' botones!'}; }
function advPiezas(p,ids,txt){ const b=blDatos(p); const nuevas=ids.filter(i=>!b.own[i]&&blPieza(i)&&blPieza(i).p>0);
  if(!nuevas.length) return advBotones(p,10,'Ya tenías esas piezas del Belén, así que te toca:');
  nuevas.forEach(i=>b.own[i]=1); let extra='';
  if(!blTieneMesa(p)){ p.inv['fu_nav_belen']=(p.inv['fu_nav_belen']||0)+1; extra=' ¡Y la mesa para montarlo! Está en tu cesta.'; }
  return {e:'🌟',t:txt+extra}; }
function advMueble(p,k,txt){ const f=furn('fu_'+k); if(f&&tieneMueble(p,f)&&f.once) return advBotones(p,10); p.inv['fu_'+k]=(p.inv['fu_'+k]||0)+1; return {e:f?f.e:'🎁',t:txt+' Está en tu cesta: ponlo en tu casa.'}; }
const ADV_REGALOS={
  1:p=>advPiezas(p,['portal','maria','jose','nino'],'¡El portal y la Sagrada Familia para tu Belén!'),
  2:p=>advBotones(p,8),
  3:p=>advMueble(p,'nav_calcetin','¡Un calcetín de Navidad!'),
  4:p=>{ advBotones(p,5); return {e:'❓',t:'Una adivinanza y 5 botones:',adiv:['Tengo ojos de carbón y nariz de zanahoria. Si sale el sol, me voy sin hacer ruido. ¿Quién soy?','¡El muñeco de nieve!']}; },
  5:p=>advPiezas(p,['buey','mula'],'¡El buey y la mula para tu Belén!'),
  6:p=>advBotones(p,10),
  7:p=>{ const R=roomOf(p); if(R.owned.nav_papel) return advBotones(p,10); R.owned.nav_papel=1; return {e:'🧱',t:'¡Papel pintado de Navidad! Cámbialo en tu casa, en «Papel de la pared».'}; },
  8:p=>advPiezas(p,['angel'],'¡Un ángel para tu Belén!'),
  9:p=>advMueble(p,'nav_pascua','¡Una flor de Pascua!'),
  10:p=>advBotones(p,15),
  11:p=>advPiezas(p,['pastor','oveja','oveja2'],'¡Un pastor con sus ovejas para tu Belén!'),
  12:p=>{ if(!p.aqua||!p.aqua.fish) return advBotones(p,12,'Todavía no tienes pecera, así que te toca:'); if(p.aqua.fish.some(f=>f.k==='nav_pez')) return advBotones(p,12);
    p.aqua.fish.push({k:'nav_pez',id:'f'+Date.now().toString(36),name:'Copito'}); return {e:'🐟',t:'¡Un pez navideño para tu pecera! Se llama Copito.'}; },
  13:p=>{ const pu=navPuestos(), a=NAV_ADORNOS.find(x=>!x.ultima&&!pu[x.id]); if(!a) return advBotones(p,15,'¡El árbol de la plaza ya tiene todos sus adornos! Te toca:');
    navDatos(p)[a.id]=today(); addNews(p,a.e,'ha puesto '+a.n.toLowerCase()+' en el árbol de la plaza'); return {e:a.e,t:'¡'+a.n+' para el árbol de la plaza! Ya están colgados.'}; },
  14:p=>advPiezas(p,['lavandera'],'¡La lavandera para tu Belén!'),
  15:p=>advBotones(p,15),
  16:p=>advMueble(p,'nav_alfombra','¡Una alfombra de Navidad!'),
  17:p=>advPiezas(p,[grupoDe(p)==='9'?'molino':'pozo'],grupoDe(p)==='9'?'¡Tu molino con aspas que giran! Solo lo tienes tú.':'¡Tu pozo con cubo que sube y baja! Solo lo tienes tú.'),
  18:p=>advBotones(p,15),
  19:p=>{ if(navPuerta(p)) return advBotones(p,15); paqDatosNina(p,'navidad').puerta=1; return {e:'💚',t:'¡Una corona para tu puerta! Ya está colgada en tu casa del pueblo.'}; },
  20:p=>advPiezas(p,['fuego'],'¡El fuego de los pastores para tu Belén!'),
  21:p=>advBotones(p,20),
  22:p=>{ let hs=+today().slice(0,4); for(const ch of String(p.id)) hs=(hs*31+ch.charCodeAt(0))%100003; const n=5+Math.floor(seeded(hs)*26); return Object.assign(advBotones(p,n),{t:'🎟️ ¡Lotería de Villaovillo! Tu número ha salido premiado con '+n+' botones.'}); },
  23:p=>advPiezas(p,['estrella'],'¡La estrella de Belén para el cielo de tu Belén!'),
  24:p=>advMueble(p,'nav_musica','🎶 ¡Feliz Nochebuena! Una caja de música que toca un villancico.')
};
const ADV_EMOJI=['','🌟','🔘','🧦','❓','🐂','🔘','🧱','👼','🌺','🔘','🐑','🐟','🎄','🧺','🔘','🧶','⭐','🔘','💚','🔥','🔘','🎟️','💫','🎶'];

/* ---------- regalos nuevos: alfombra, caja de música, papel y pez ---------- */
let ADV_SONANDO=0;
function advVillancico(){ // «Noche de paz» (Gruber, 1818, dominio público), en caja de música
  if(ADV_SONANDO&&Date.now()-ADV_SONANDO<20000) return; ADV_SONANDO=Date.now();
  const N={C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698};
  const mel=[['G4',3],['A4',1],['G4',2],['E4',6],['G4',3],['A4',1],['G4',2],['E4',6],['D5',4],['D5',2],['B4',6],['C5',4],['C5',2],['G4',6],['A4',4],['A4',2],['C5',3],['B4',1],['A4',2],['G4',3],['A4',1],['G4',2],['E4',6],
    ['A4',4],['A4',2],['C5',3],['B4',1],['A4',2],['G4',3],['A4',1],['G4',2],['E4',6],['D5',4],['D5',2],['F5',3],['D5',1],['B4',2],['C5',6],['E5',6],['C5',3],['G4',1],['E4',2],['G4',3],['F4',1],['D4',2],['C4',10]];
  let tt=0; const u=170; mel.forEach(([n,d])=>{ setTimeout(()=>{ beep(N[n]*2,Math.min(1.4,d*u/1000+0.3),'triangle',0.06); beep(N[n],0.25,'sine',0.02); },tt); tt+=d*u; });
  setTimeout(()=>{ ADV_SONANDO=0; },tt);
}
[
  {k:'nav_alfombra',e:'🟥',n:'Alfombra de Navidad',p:0,z:'floor',paq:'navidad',regalo:1,draw(c){ c.scale(1.6,1.6); c.beginPath(); c.ellipse(0,-6,46,13,0,0,TAU); c.fillStyle='#c0443d'; c.fill(); ol(c,2.2);
    c.beginPath(); c.ellipse(0,-6,38,9.5,0,0,TAU); c.strokeStyle='#2e9e5b'; c.lineWidth=3; c.stroke(); c.fillStyle='#fffaf3'; for(let i=0;i<10;i++){ const a=i/10*TAU; c.beginPath(); c.arc(Math.cos(a)*30,-6+Math.sin(a)*7,1.8,0,TAU); c.fill(); }
    c.save(); c.translate(0,-6); c.scale(1,0.3); navEstrella(c,0,0,12,0); c.restore(); }},
  {k:'nav_musica',e:'🎶',n:'Caja de música',p:0,z:'floor',paq:'navidad',regalo:1,abre:()=>{ advVillancico(); toast('🎶 Suena «Noche de paz»…'); },
    draw(c,t){ roundRect(c,-20,-26,40,26,4); c.fillStyle='#7a3d8a'; c.fill(); ol(c,2.2); c.fillStyle='#f4c430'; c.fillRect(-20,-15,40,3); roundRect(c,-22,-32,44,8,3); c.fillStyle='#8f4ea0'; c.fill(); ol(c,1.8);
      c.strokeStyle='#f4c430'; c.lineWidth=2; c.beginPath(); c.moveTo(22,-12); c.lineTo(30,-12); c.lineTo(30,-18); c.stroke();
      c.save(); c.translate(0,-32); c.rotate(Math.sin((t||0)*2)*0.2); c.fillStyle='#fffaf3'; c.beginPath(); c.moveTo(-5,0); c.lineTo(0,-14); c.lineTo(5,0); c.fill(); ol(c,1.2); c.beginPath(); c.arc(0,-16,3,0,TAU); c.fillStyle='#f2cba8'; c.fill(); ol(c,1); c.restore();
      if(ADV_SONANDO){ c.fillStyle='#5a3a8a'; c.font='14px serif'; c.fillText('♪',18,-40+Math.sin((t||0)*4)*3); c.fillText('♫',-26,-44+Math.cos((t||0)*4)*3); } }},
  {k:'nav_adviento',e:'🎁',n:'Calendario de Adviento',p:0,z:'wall',paq:'navidad',regalo:1,abre:p=>openAdviento(p),
    draw(c,t){ roundRect(c,-38,-34,76,68,5); c.fillStyle='#2e7a4a'; c.fill(); ol(c,2.2); c.fillStyle='#fffaf3'; c.font='bold 9px Baloo 2, sans-serif'; c.textAlign='center'; c.fillText('ADVIENTO',0,-24);
      for(let i=0;i<24;i++){ const x=-32+(i%6)*11, y=-18+Math.floor(i/6)*12; roundRect(c,x,y,9,9,2); c.fillStyle=['#d63a3a','#f4c430','#fffaf3','#3d7fe0'][i%4]; c.fill(); }
      c.save(); c.translate(0,-38); NAVT.lazo(c,0,0,0.9); c.restore(); }}
].forEach(f=>{ if(!FURN.some(x=>x.k===f.k)) FURN.push(f); });
WALLPATS.some(w=>w.k==='nav_papel')||WALLPATS.push({k:'nav_papel',n:'Navidad',p:0,paq:'navidad',draw(c,W,H){
  for(let y=30,r=0;y<H;y+=64,r++) for(let x=30+(r%2)*48;x<W;x+=96){ if((x+y)%3===0){ c.save(); c.globalAlpha=0.55; navEstrella(c,x,y,9,0); c.restore(); }
    else if((x+y)%3===1){ c.save(); c.globalAlpha=0.5; NAVT.copo(c,x,y,9); c.restore(); } else { c.save(); c.globalAlpha=0.55; c.translate(x,y); c.scale(0.5,0.5); NAVT.hoja(c,-5,0,0.5); NAVT.hoja(c,5,0,-0.5); c.fillStyle='#d62828'; c.beginPath(); c.arc(0,-2,3,0,TAU); c.fill(); c.restore(); } } }});
FISH.some(f=>f.k==='nav_pez')||FISH.push({k:'nav_pez',n:'Pez navideño',p:0,c:'#d63a3a',c2:'#fffaf3',shape:'pez',paq:'navidad'});
/* En la tienda: acceso directo al calendario (lo que se regala, regalo:1, no se vende) */
(function(){ const antes=NAV.enchufes.tienda; NAV.enchufes.tienda=function(p){ const tabs=antes.call(this,p); tabs.forEach(tb=>{ if(tb.k!=='navidad') return; const r=tb.render;
  tb.render=(g,p)=>{ r(g,p);
    if(paqActivo(NAV)&&advDiaHoy()&&advDiaHoy()<=24){ const d=el('div','wsec','🎁 Calendario de Adviento'); d.style.gridColumn='1/-1'; g.append(d); const c=el('div','sitem'); c.innerHTML='<div class="e">🎁</div><div class="n">Tu calendario</div><div class="counter">Una casilla cada día</div>'; const b=el('button','btn green','Abrir'); b.onclick=()=>openAdviento(p); c.append(b); g.append(c); } }; }); return tabs; }; })();

/* ---------- el calendario ---------- */
async function openAdviento(p){
  p=p||P(); const mia=!!P()&&p===P()&&!VISIT&&!REMOTO, a=advVer(p).abiertas, hoy=advDiaHoy(), h=advHecho(p), listo=advListo(p), quedan=ADV_HOY_MAX-advHoyAbiertas(p);
  if(!paqActivo(NAV)||!hoy){ toast('El calendario de Adviento se abre en diciembre'); return; }
  const chk=(ok,t)=>`<span style="padding:4px 10px;border-radius:12px;background:${ok?'#dff3d8':'#f3ead8'};font-weight:800">${ok?'✅':'⬜'} ${t}</span>`;
  const casillas=Array.from({length:24},(_,i)=>{ const d=i+1, ab=!!a[d], ya=d<=hoy, sig=mia&&!ab&&ya&&listo&&quedan>0&&advPendiente(p)===d;
    const bg=ab?'#fffaf3':ya?['#d63a3a','#2e7a4a','#f4c430','#3d7fe0'][d%4]:'#cfc6b4';
    return `<button data-d="${d}" class="advc${sig?' adv-hoy':''}" style="background:${bg};${ab?'':'color:#fff;'}">${ab?ADV_EMOJI[d]:d}</button>`; }).join('');
  const pend=advPendiente(p);
  const txt=!mia?'El calendario de Adviento de '+p.name+'.':!pend?'¡Has abierto todas las casillas que tocan! Vuelve mañana.':listo&&quedan>0?'¡Ya puedes abrir la casilla '+pend+'! Tócala.':!listo?'Para abrir la casilla de hoy, haz al menos un ejercicio en el telar, la biblioteca y la panadería.':'Hoy ya has abierto '+ADV_HOY_MAX+' casillas. ¡Mañana más!';
  const pr=say({face:'🎁',name:'Calendario de Adviento',text:txt,speak:mia,
    html:`<style>.advg{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin:10px 0}.advc{aspect-ratio:1;border-radius:14px;border:3px solid #5a3a24;font-size:24px;font-weight:900;font-family:inherit}
      .adv-hoy{animation:advLate 1s infinite alternate;outline:4px solid #ffd84a}@keyframes advLate{from{transform:scale(1)}to{transform:scale(1.08)}}</style>
      ${mia?`<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${chk(h.telar,'🧶 Telar')}${chk(h.bib,'📚 Biblioteca')}${chk(h.pan,'🥖 Panadería')}</div>`:''}
      <div class="advg">${casillas}</div>`,buttons:[{t:'Cerrar',cls:'primary'}]});
  document.querySelectorAll('.advc').forEach(b=>b.onclick=()=>{ const d=+b.dataset.d;
    if(!mia) return; if(a[d]){ toast('Ya la abriste: '+ADV_EMOJI[d]); return; } if(d>hoy){ toast('¡Todavía no! Esa es la del día '+d+' de diciembre.'); return; }
    if(!listo){ toast('Primero un ejercicio en el telar, la biblioteca y la panadería'); return; } if(quedan<=0){ toast('Hoy ya has abierto '+ADV_HOY_MAX+' casillas'); return; }
    if(d!==advPendiente(p)){ toast('Abre antes la casilla '+advPendiente(p)); return; }
    $('#dlgbox .dlgbtns button').click(); advAbrir(p,d); });
  return pr;
}
async function advAbrir(p,d){
  if(!p||VISIT||REMOTO||advVer(p).abiertas[d]) return;
  let r; try{ r=(ADV_REGALOS[d]||(q=>advBotones(q,10)))(p); }catch(e){ apuntaFallo(e,'adviento:'+d); r=advBotones(p,10); }
  advDatos(p).abiertas[d]=today(); save('Abrió la casilla '+d+' del calendario de Adviento'); updateHUD&&updateHUD(); fanfare();
  if(d===24){ addNews(p,'🎶','ha abierto la última casilla del calendario de Adviento. ¡Feliz Nochebuena!'); setTimeout(advVillancico,800); }
  const extra=r.adiv?`<div style="margin-top:10px;font-size:19px">${esc(r.adiv[0])}</div><details style="margin-top:8px"><summary style="font-weight:800;cursor:pointer">Ver la solución</summary><div style="font-size:20px">${esc(r.adiv[1])}</div></details>`:'';
  await say({center:true,html:`<div class="reward"><div style="font-size:20px;font-weight:800">Casilla ${d}</div><div style="font-size:84px">${r.e||'🎁'}</div><div style="font-size:20px">${esc(r.t)}</div>${extra}</div>`,buttons:[{t:'¡Gracias!',cls:'primary'}]});
}
/* Regalar el calendario el primer día y avisar cuando se puede abrir la casilla (desde el pueblo) */
(function(){ const antes=NAV.enchufes.pueblo;
  NAV.enchufes.pueblo=function(ctx){ const d=antes.call(this,ctx); const p=ctx&&ctx.p;
    if(p&&!VISIT&&!REMOTO&&advDiaHoy()&&+today().slice(5,7)===12){ const A=advDatos(p);
      if(!A.dado){ A.dado=1; p.inv['fu_nav_adviento']=(p.inv['fu_nav_adviento']||0)+1; saveQuiet(); setTimeout(()=>toast('🎁 ¡Tienes un calendario de Adviento en tu cesta! Cuélgalo en una pared de tu casa.',5000),600); }
      else if(A.aviso!==today()&&advPuede(p)){ A.aviso=today(); saveQuiet(); setTimeout(()=>toast('🎁 ¡Ya puedes abrir la casilla de hoy de tu calendario de Adviento!',4500),300); } }
    return d; }; })();
