"use strict";
/* =========================================================
   NAVIDAD · Reyes Magos y premios del Belén
   - Buzón real en la plaza (del 1 dic al 5 ene): cada niña escribe su carta a los Reyes. Papá la lee en el modo alcalde.
   - Papá elige en el modo alcalde el regalo de Reyes de cada una (de la lista, con botones y un mensaje) y el premio
     de su Belén (una categoría distinta para cada una). Se guardan con órdenes (también desde el móvil).
   - El premio del Belén llega desde el 24 de diciembre; el regalo de Reyes, desde el 6 de enero (hasta el 31 de enero,
     aunque la Navidad ya haya terminado). Si papá no eligió regalo: osito de peluche y 20 botones.
   Lo que se guarda (p.paq.navidad): carta[temporada]={t,d}, reyes={r,b,m,temp}, reyesDado=temp, premio={cat,temp}, premioDado=temp
   ========================================================= */
const REY_REGALOS=[
  {k:'nav_bici',e:'🚲',n:'Bicicleta'},{k:'nav_osito',e:'🧸',n:'Osito de peluche'},{k:'nav_teclado',e:'🎹',n:'Teclado musical'},
  {k:'nav_micro',e:'🔬',n:'Microscopio'},{k:'nav_caballete',e:'🎨',n:'Caballete de pintura'},{k:'nav_castillo',e:'🏰',n:'Castillo de juguete'},
  {k:'nav_patines',e:'⛸️',n:'Patines'},{k:'nav_libros',e:'📚',n:'Montón de libros'},{k:'nav_cometa',e:'🪁',n:'Cometa',z:'wall'}
];
REY_REGALOS.forEach(g=>{ if(!FURN.some(x=>x.k===g.k)) FURN.push({k:g.k,e:g.e,n:g.n,p:0,z:g.z||'floor',paq:'navidad',regalo:1}); });
FURN.some(x=>x.k==='nav_trofeo')||FURN.push({k:'nav_trofeo',e:'🏆',n:'Trofeo del Belén',p:0,z:'floor',paq:'navidad',regalo:1,draw(c,t){
  roundRect(c,-16,-12,32,12,3); c.fillStyle='#7a4a2a'; c.fill(); ol(c,2); roundRect(c,-5,-26,10,15,2); c.fillStyle='#e0b23a'; c.fill(); ol(c,1.8);
  c.beginPath(); c.moveTo(-18,-60); c.lineTo(18,-60); c.quadraticCurveTo(18,-30,0,-26); c.quadraticCurveTo(-18,-30,-18,-60); c.closePath(); c.fillStyle='#f4c430'; c.fill(); ol(c,2.2);
  for(const s of [-1,1]){ c.strokeStyle=OUT; c.lineWidth=5; c.beginPath(); c.arc(s*19,-50,7,s<0?Math.PI*0.5:-Math.PI*0.5,s<0?Math.PI*1.5:Math.PI*0.5,s>0); c.stroke(); c.strokeStyle='#f4c430'; c.lineWidth=3; c.stroke(); }
  navEstrella(c,0,-46,8,t||0); }});
const NAV_PREMIOS=['El Belén más original','El Belén más trabajado','El mejor paisaje','El Belén más divertido','El Belén más bonito de noche','El mejor río','El Belén con más detalles','El Belén más luminoso'];
NAV.ordenes={
  reyes(p,v){ v=v||{}; const r=String(v.r||''); if(r&&!REY_REGALOS.some(g=>g.k===r)) return false;
    paqDatosNina(p,'navidad').reyes={r,b:Math.max(0,Math.min(100,Math.round(+v.b||0))),m:String(v.m||'').slice(0,200),temp:navTemp()}; return true; },
  premio(p,v){ if(!NAV_PREMIOS.includes(v)) return false; paqDatosNina(p,'navidad').premio={cat:v,temp:navTemp()}; return true; }
};
function navD(p){ return ((p&&p.paq)||{}).navidad||{}; }
function navCarta(p){ const c=navD(p).carta; return c&&c[navTemp()]; }
function navCartasAbiertas(){ const t=today().slice(5); return navSolo()&&(t>='12-01'||t<='01-05'); }

/* ---------- buzón real ---------- */
const BREY={x:1128,y:986};
function navDibujaBuzonReal(c,t){
  const {x,y}=BREY; c.save(); c.translate(x,y);
  c.fillStyle='rgba(40,60,90,.18)'; c.beginPath(); c.ellipse(0,2,30,7,0,0,TAU); c.fill();
  roundRect(c,-5,-40,10,42,3); c.fillStyle='#5a3a24'; c.fill(); ol(c,2.2);
  roundRect(c,-26,-92,52,54,8); c.fillStyle='#c0303a'; c.fill(); ol(c,2.6);
  c.strokeStyle='#f4c430'; c.lineWidth=3; roundRect(c,-21,-87,42,44,6); c.stroke();
  roundRect(c,-14,-74,28,5,2.5); c.fillStyle='#2a1a14'; c.fill();
  c.fillStyle='#fffaf3'; c.font='bold 9px Baloo 2, sans-serif'; c.textAlign='center'; c.fillText('CARTAS',0,-56); c.fillText('REYES',0,-47);
  c.beginPath(); c.moveTo(-18,-92); c.lineTo(-20,-110); c.lineTo(-9,-100); c.lineTo(0,-116); c.lineTo(9,-100); c.lineTo(20,-110); c.lineTo(18,-92); c.closePath(); c.fillStyle='#f4c430'; c.fill(); ol(c,2);
  [[-9,'#e23b3b'],[0,'#3d7fe0'],[9,'#4f9a5a']].forEach(([px,col])=>{ c.fillStyle=col; c.beginPath(); c.arc(px,-99,2.6,0,TAU); c.fill(); });
  const pend=DB.profiles.some(q=>q&&!navCarta(q)); if(pend&&!VISIT){ const b=Math.sin((t||0)*4)*3; c.fillStyle='#fffaf3'; roundRect(c,16,-128+b,22,15,3); c.fill(); ol(c,1.6); c.strokeStyle=OUT; c.lineWidth=1.4; c.beginPath(); c.moveTo(16,-128+b); c.lineTo(27,-119+b); c.lineTo(38,-128+b); c.stroke(); }
  c.restore();
}
edificio({ id:'buzonReal', x:BREY.x-28, y:BREY.y-20, w:56, h:20, door:[BREY.x,BREY.y+26],
  activo:()=>navCartasAbiertas(), ve:()=>vis(BREY.x,BREY.y-60,160), toque:()=>({x:BREY.x-34,y:BREY.y-135,w:68,h:145}),
  dibuja:c=>navDibujaBuzonReal(c,tGlobal), abre:()=>openCartaReyes(), alcalde:()=>openCartaReyes(), mapa:{etiqueta:'👑'} });
async function openCartaReyes(){
  const p=P(), mia=!!p&&!VISIT&&!REMOTO;
  if(!mia){ const html=DB.profiles.filter(Boolean).map(q=>{ const c=navCarta(q); return `<div class="panel" style="margin:6px 0;text-align:left"><b>${esc(q.name)}</b><div style="white-space:pre-wrap;font-family:'Patrick Hand',cursive;font-size:20px">${c?esc(c.t):'Todavía no ha escrito su carta.'}</div></div>`; }).join('');
    return say({face:'👑',name:'Buzón real',text:'Las cartas a los Reyes Magos.',html,buttons:[{t:'Cerrar',cls:'primary'}]}); }
  const prev=navCarta(p), ini=prev?prev.t:'Queridos Reyes Magos:\n\nEste año me he portado…\n\nOs pido…\n\nUn beso,\n'+p.name;
  const pr=say({face:'👑',name:'Buzón real',text:prev?'Ya has echado tu carta. Si quieres, puedes cambiarla hasta el 5 de enero.':'Escribe tu carta a los Reyes Magos y échala al buzón. ¡Llega directa a Oriente!',
    html:`<textarea id="rey-carta" maxlength="600" style="width:100%;min-height:220px;font-family:'Patrick Hand',cursive;font-size:22px;line-height:1.35;padding:12px;border-radius:14px;border:3px solid #e8d3a8;background:#fffdf6;box-sizing:border-box">${esc(ini)}</textarea>`,
    buttons:[{t:'Ahora no'},{t:'📮 Echar la carta',cls:'primary'}],speak:false});
  const r=await pr; if(r!==1) return;
  const txt=String(($('#rey-carta')||{}).value||'').trim().slice(0,600); if(!txt){ toast('La carta está vacía'); return; }
  const d=paqDatosNina(p,'navidad'); d.carta=d.carta||{}; d.carta[navTemp()]={t:txt,d:today()};
  save('Escribió su carta a los Reyes'); fanfare(); addNews(p,'👑','ha echado su carta a los Reyes Magos en el buzón real');
  await say({center:true,html:'<div class="reward"><div style="font-size:80px">📮</div><div style="font-size:22px;font-weight:800">¡Carta enviada!</div><div style="font-size:18px">Los pajes reales la llevarán a Oriente.</div></div>',buttons:[{t:'¡Bien!',cls:'primary'}]});
}
/* el buzón real en las cosas de la plaza que se pintan en el pueblo (también se pide antes que la nieve no lo tape) */

/* ---------- modo alcalde ---------- */
NAV.alcalde=function(box){
  const b=box('👑 Navidad: cartas, Reyes y Belén');
  b.append(el('div','counter','Lee sus cartas, da un premio a cada Belén (llega desde el 24 de diciembre) y elige el regalo de Reyes de cada una (llega el 6 de enero, al abrir el juego). Si no eliges regalo, les llegará un osito y 20 botones.'));
  DB.profiles.filter(Boolean).forEach(q=>{
    const D=navD(q), card=el('div','panel'); card.style.cssText='margin:10px 0;background:#fffaf1';
    card.append(el('div','wsec',esc(q.name)));
    const c=navCarta(q); card.append(el('div','lbl','💌 Carta a los Reyes'));
    card.append(el('div','',c?`<div style="white-space:pre-wrap;font-family:'Patrick Hand',cursive;font-size:19px;background:#fff;border-radius:12px;padding:8px 12px">${esc(c.t)}</div><div class="counter">Escrita el ${esc(c.d.slice(8,10)+'/'+c.d.slice(5,7))}</div>`:'<div class="counter">Todavía no ha escrito su carta (buzón real de la plaza).</div>'));
    card.append(el('div','lbl','🌟 Su Belén'));
    const bv=blVer(q); if(bv.esc.length){ const im=document.createElement('img'); im.src=blMiniatura(q,360); im.style.cssText='width:100%;max-width:360px;border-radius:10px;border:2px solid #5a3a24'; card.append(im); card.append(el('div','counter',bv.esc.length+' piezas'+(blPegasDe(q).length?' · pegatinas: '+blPegasDe(q).map(x=>x.e).join(' '):''))); }
    else card.append(el('div','counter','Todavía no ha montado su Belén.'));
    const pr=D.premio&&D.premio.temp===navTemp()?D.premio.cat:'';
    const row=el('div'); row.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px';
    const sel=el('select','inputline'); sel.style.cssText='width:auto;font-size:16px;min-height:42px'; [['','— Elige un premio —']].concat(NAV_PREMIOS.map(x=>[x,x])).forEach(([v,t])=>{ const o=document.createElement('option'); o.value=v; o.textContent=t; if(v===pr) o.selected=true; sel.append(o); });
    const bt=el('button','btn green',pr?'Cambiar premio':'🏆 Dar premio'); bt.onclick=async()=>{ if(!sel.value){ toast('Elige una categoría'); return; } if(await alcHaz(q.id,'paq',{id:'navidad',campo:'premio',valor:sel.value},'Premio del Belén para '+q.name)){ toast('🏆 Premio guardado para '+q.name); renderAlcalde(); } };
    row.append(sel,bt); card.append(row); if(pr) card.append(el('div','counter','✅ Premio: «'+esc(pr)+'»'+(D.premioDado===navTemp()?' · ya lo ha recibido':'')));
    card.append(el('div','lbl','👑 Regalo de Reyes'));
    const R=D.reyes&&D.reyes.temp===navTemp()?D.reyes:null;
    const g=el('div'); g.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center';
    const s2=el('select','inputline'); s2.style.cssText='width:auto;font-size:16px;min-height:42px'; [['','Solo botones']].concat(REY_REGALOS.map(x=>[x.k,x.e+' '+x.n])).forEach(([v,t])=>{ const o=document.createElement('option'); o.value=v; o.textContent=t; if(R&&R.r===v) o.selected=true; s2.append(o); });
    const nb=el('input','inputline'); nb.type='number'; nb.min=0; nb.max=100; nb.value=R?R.b:20; nb.style.cssText='width:90px;font-size:16px;min-height:42px'; nb.title='Botones';
    const ms=el('input','inputline'); ms.maxLength=200; ms.placeholder='Mensaje de los Reyes (opcional)'; ms.value=R?R.m:''; ms.style.cssText='flex:1;min-width:200px;font-size:16px;min-height:42px';
    const gb=el('button','btn green',R?'Cambiar regalo':'🎁 Guardar regalo'); gb.onclick=async()=>{ if(await alcHaz(q.id,'paq',{id:'navidad',campo:'reyes',valor:{r:s2.value,b:+nb.value||0,m:ms.value}},'Regalo de Reyes para '+q.name)){ toast('🎁 Regalo guardado para '+q.name); renderAlcalde(); } };
    g.append(s2,el('span','counter','+ 🔘'),nb,ms,gb); card.append(g);
    if(R){ const x=REY_REGALOS.find(y=>y.k===R.r); card.append(el('div','counter','✅ '+(x?x.e+' '+esc(x.n)+' y ':'')+R.b+' botones'+(R.m?' · «'+esc(R.m)+'»':'')+(D.reyesDado===navTemp()?' · ya lo ha recibido':''))); }
    b.append(card);
  });
};

/* ---------- entregas: premio del Belén (desde el 24 dic) y Reyes (desde el 6 ene, hasta el 31 ene) ---------- */
const NAVE={ocupado:false};
async function navEntregas(p){
  if(Date.now()-(NAVE.t||0)<1500) return; NAVE.t=Date.now();
  if(NAVE.ocupado||!p||VISIT||REMOTO||curScreen!=='village'||document.querySelector('#dlg.on')) return;
  const t=today().slice(5), temp=navTemp(), D=navD(p);
  const premioYa=(t>='12-24'||t<='01-31')&&D.premio&&D.premio.temp===temp&&D.premioDado!==temp;
  const reyesYa=t>='01-06'&&t<='01-31'&&D.reyesDado!==temp;
  if(!premioYa&&!reyesYa) return;
  NAVE.ocupado=true;
  try{
    const d=paqDatosNina(p,'navidad');
    if(premioYa){ d.premioDado=temp; p.inv['fu_nav_trofeo']=(p.inv['fu_nav_trofeo']||0)+1; p.coins+=25; p.counters.earned=(p.counters.earned||0)+25;
      save('Premio del Belén: '+D.premio.cat); updateHUD(); addNews(p,'🏆','ha ganado el premio «'+D.premio.cat+'» con su Belén'); fanfare();
      await say({center:true,html:`<div class="reward"><div style="font-size:84px">🏆</div><div style="font-size:24px;font-weight:800">¡Premio para tu Belén!</div><div style="font-size:20px">El alcalde ha elegido tu Belén como<br><b>«${esc(D.premio.cat)}»</b></div><div style="font-size:18px;margin-top:6px">Te llevas un trofeo para tu casa y 25 botones.</div></div>`,buttons:[{t:'¡Qué ilusión!',cls:'primary'}]}); }
    if(reyesYa){ const R=D.reyes&&D.reyes.temp===temp?D.reyes:{r:'nav_osito',b:20,m:''}; const g=REY_REGALOS.find(x=>x.k===R.r);
      d.reyesDado=temp; if(g) p.inv['fu_'+g.k]=(p.inv['fu_'+g.k]||0)+1; if(R.b){ p.coins+=R.b; p.counters.earned=(p.counters.earned||0)+R.b; }
      save('Regalo de Reyes'); updateHUD(); addNews(p,'👑','ha recibido los regalos de los Reyes Magos'); fanfare(); setTimeout(()=>{ try{ advVillancico(); }catch(e){} },600);
      await say({center:true,html:`<div class="reward"><div style="font-size:40px">👑👑👑</div><div style="font-size:24px;font-weight:800">¡Los Reyes Magos han pasado por Villaovillo!</div>
        <div style="font-size:84px">${g?g.e:'🎁'}</div><div style="font-size:20px">${g?'Te han dejado: <b>'+esc(g.n)+'</b>. Está en tu cesta, ponlo en tu casa.':''}${R.b?'<br>Y '+R.b+' botones.':''}</div>
        ${R.m?`<div style="font-family:'Patrick Hand',cursive;font-size:22px;margin-top:8px">«${esc(R.m)}»<br>— Melchor, Gaspar y Baltasar</div>`:''}</div>`,buttons:[{t:'¡Gracias, Majestades!',cls:'primary'}]}); }
  } finally { NAVE.ocupado=false; }
}
(function(){ const antes=NAV.enchufes.pueblo; NAV.enchufes.pueblo=function(ctx){ const d=antes.call(this,ctx); if(ctx&&ctx.p) setTimeout(()=>navEntregas(ctx.p),0); return d; }; })();
/* Del 8 al 31 de enero la Navidad ya no está, pero el regalo de Reyes y el premio tienen que poder llegar */
paquete({ id:'reyes-entrega', nombre:'Regalos de Reyes pendientes', emoji:'👑', cuando:{desde:'01-08',hasta:'01-31'},
  enchufes:{ pueblo(ctx){ if(ctx&&ctx.p) setTimeout(()=>navEntregas(ctx.p),0); return {}; } }, info(){ return 'Entrega el regalo de Reyes a quien no jugó el 6 o el 7'; } });
