"use strict";
/* =========================================================
   HUERTO DEL ROBOT · pantalla (scr-huerto, creada desde el paquete)
   Se ven las dos parcelas (la de cada niña con su nombre). La niña que juega, si su parcela está abierta:
   🌱 Sembrar (elige semilla de temporada y toca huecos), 🤖 Trabajo de hoy, 🧩 Retos del robot y 🧺 Cesta.
   En el paseo del alcalde o con la parcela cerrada solo se mira; los retos se abren en modo catálogo.
   ========================================================= */
(function(){ if(document.getElementById('scr-huerto')) return;
  const s=document.createElement('section'); s.id='scr-huerto'; s.className='screen';
  s.innerHTML=`<div class="topbar"><button class="btn" id="hu-back">← Pueblo</button><div class="ttl">🤖 Huerto del robot</div><div class="chip" id="hu-chip"></div></div>
  <div class="pz-body">
    <div class="pz-left panel">
      <div class="npcline"><div class="face">🤖</div><div class="ask" id="hu-ask"></div><button class="speak" id="hu-speak">🔊</button></div>
      <div class="rbstage"><canvas id="hu-cv"></canvas></div>
      <div id="hu-msg"></div>
    </div>
    <div class="pz-right panel" id="hu-right"></div>
  </div>`;
  (document.getElementById('scr-robot')||document.body.lastElementChild).after(s);
})();
const HUZ={sem:null,raf:null,last:0,t:0,geo:null};
function huMia(){ const p=P(); return !!p&&!VISIT&&!REMOTO&&huAbierta(p); }

function huGeo(cv){ // dónde va cada parcela en el lienzo
  const ps=DB.profiles, Ws=[0,1].map(k=>ps[k]?((huLee(ps[k])||{}).W||huTam(ps[k])):0);
  const W=Math.min(720,(cv.parentElement&&cv.parentElement.clientWidth)||600);
  const cols=Ws[0]+Ws[1], cs=Math.min(64,(W-70)/Math.max(1,cols)), alto=Math.max(...Ws)*cs;
  return {W,cs,H:alto+70,Ws,x:[20,W-20-Ws[1]*cs],y:44};
}
function huDibuja(){
  const cv=$('#hu-cv'); if(!cv) return;
  const g=HUZ.geo=huGeo(cv), dpr=Math.min(2,window.devicePixelRatio||1);
  if(cv.width!==Math.round(g.W*dpr)||cv.height!==Math.round(g.H*dpr)){ cv.width=Math.round(g.W*dpr); cv.height=Math.round(g.H*dpr); cv.style.width=g.W+'px'; cv.style.height=g.H+'px'; }
  const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,g.W,g.H);
  c.fillStyle='#9fd583'; roundRect(c,0,0,g.W,g.H,18); c.fill(); c.strokeStyle='#b07a45'; c.lineWidth=6; roundRect(c,4,4,g.W-8,g.H-8,14); c.stroke();
  const p=P();
  [0,1].forEach(k=>{ const q=DB.profiles[k]; if(!q) return; const x0=g.x[k], y0=g.y, W=g.Ws[k];
    huDibujaParcela(c,q,x0,y0,g.cs,HUZ.t);
    c.font='bold 18px "Baloo 2",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#3d5a2a';
    c.fillText((q===p&&!VISIT?'⭐ ':'')+q.name,x0+W*g.cs/2,22);
    if(q===p&&HUZ.sem&&huMia()){ c.strokeStyle='#f4c430'; c.lineWidth=4; c.setLineDash([8,6]); roundRect(c,x0-5,y0-5,W*g.cs+10,W*g.cs+10,12); c.stroke(); c.setLineDash([]); }
  });
}
function huBucle(now){ if(curScreen!=='huerto'){ HUZ.raf=null; return; } HUZ.t+=Math.min(0.05,(now-(HUZ.last||now))/1000); HUZ.last=now; huDibuja(); HUZ.raf=requestAnimationFrame(huBucle); }
function huMsg(t,cls){ const m=$('#hu-msg'); m.className=cls||''; m.textContent=t||''; }

/* tocar el lienzo: sembrar en la parcela propia */
$('#hu-cv').addEventListener('click',ev=>{
  const g=HUZ.geo, p=P(); if(!g||!p) return;
  const r=$('#hu-cv').getBoundingClientRect(), x=ev.clientX-r.left, y=ev.clientY-r.top;
  const k=DB.profiles.indexOf(p), W=g.Ws[k]; if(k<0) return;
  const i=Math.floor((x-g.x[k])/g.cs), j=Math.floor((y-g.y)/g.cs);
  const dentro=i>=0&&j>=0&&i<W&&j<W;
  if(!dentro){ const otra=DB.profiles[1-k]; if(otra){ const W2=g.Ws[1-k], i2=Math.floor((x-g.x[1-k])/g.cs), j2=Math.floor((y-g.y)/g.cs); if(i2>=0&&j2>=0&&i2<W2&&j2<W2){ huMsg('Esa es la parcela de '+otra.name+'. ¡Puedes mirar, pero no tocar!'); } } return; }
  if(!huMia()){ huMsg(VISIT||REMOTO?'En el paseo del alcalde solo se mira.':'Tu parcela todavía está cerrada.'); return; }
  if(!HUZ.sem){ huMsg('Para sembrar, elige primero una semilla en «🌱 Sembrar».'); return; }
  const res=huSiembra(p,j*W+i,HUZ.sem);
  if(res==='pon'){ beep(620,0.05); huMsg(HU_CULT[HUZ.sem].e+' Semilla marcada. El robot la plantará en el trabajo de hoy.','good'); }
  else if(res==='quita'){ beep(320,0.05); huMsg('Semilla quitada.'); }
  else if(res==='ocupada') huMsg('Ahí ya hay una planta creciendo.','bad');
  else if(res==='tope') huMsg(`Como mucho ${(huLee(p)||{}).W} semillas esperando a la vez. ¡Que el robot las plante primero!`,'bad');
  huRender();
});

function huRender(){
  const Rt=$('#hu-right'); Rt.innerHTML=''; const p=P();
  const card=(t)=>{ const d=el('div','panel'); d.style.cssText='margin:0 0 10px;background:#fbfff6;padding:10px 12px'; d.append(el('div','lbl',t)); Rt.append(d); return d; };
  if(!p||VISIT||REMOTO){
    Rt.append(el('div','wsec','Las parcelas'));
    DB.profiles.filter(Boolean).forEach(q=>{ const H=huLee(q), d=card(q.name);
      if(!H){ d.append(el('div','counter',huAbierta(q)?'Aún no ha entrado en su parcela.':`🔒 Se abre con Telar nivel ${ZONE_REQ.huerto[1]}.`)); return; }
      const n=huCuenta(H); d.append(el('div','counter',`${H.modo==='flechas'?'⬆️ Flechas':'↪️ Girar'} · nivel ${H.niv} · ${n.sem+n.sed+n.regada} plantas, ${n.mad} maduras`));
      const b=el('button','btn','🧩 Probar un reto de su nivel'); b.onclick=()=>openRobot(rbGenera(H.modo,H.niv,'vis'+Date.now()),{catalog:true,volver:()=>openHuerto()}); d.append(b); });
    return;
  }
  if(!huAbierta(p)){
    const d=card('Tu parcela'); d.append(el('div','',`🔒 Tu parcela se abre cuando tengas <b>Telar nivel ${ZONE_REQ.huerto[1]}</b>. Ahora tienes el nivel ${mLevel(p,'telar')}. ¡Sigue tejiendo encargos!`));
    d.append(el('div','counter','Mientras tanto, mira lo que crece en la parcela de tu hermana.')); return;
  }
  const H=huIni(p), n=huCuenta(H);
  $('#hu-chip').textContent=`${H.modo==='flechas'?'⬆️ Flechas':'↪️ Girar'} · nivel ${H.niv}`;
  // trabajo de hoy
  const R=huTrabajo(p), d1=card('🤖 Trabajo de hoy');
  if(R){
    d1.append(el('div','',`${n.sem?`🌱 ${n.sem} por plantar · `:''}${n.sed?`💧 ${n.sed} con sed · `:''}${n.mad?`🧺 ${n.mad} madura${n.mad>1?'s':''}`:''}`.replace(/ · $/,'')));
    const b=el('button','btn primary','🤖 Programar al robot'); b.onclick=()=>{ HUZ.sem=null; openRobot(R,{volver:()=>openHuerto(),alGanar:fin=>huGanaTrabajo(p,R,fin)}); }; d1.append(b);
  } else d1.append(el('div','',n.regada+n.mad+n.sed?'✅ ¡Hoy tu parcela está perfecta! Vuelve mañana: las plantas tendrán sed otra vez.':'Tu parcela está vacía. ¡Siembra algo!'));
  // sembrar
  const d2=card('🌱 Sembrar'); const temp=huTemporada();
  d2.append(el('div','counter',`Semillas de este mes. Elige una y toca los huecos de tu parcela (toca otra vez para quitarla).`));
  const row=el('div','choice'); row.style.justifyContent='flex-start';
  temp.forEach(k=>{ const C=HU_CULT[k], b=el('button',HUZ.sem===k?'sel':'',`${C.e} ${C.n} <small>(${C.r} riegos)</small>`); b.onclick=()=>{ HUZ.sem=HUZ.sem===k?null:k; huMsg(HUZ.sem?'Toca los huecos de tu parcela para sembrar '+C.np+'.':''); huRender(); }; row.append(b); });
  d2.append(row);
  // retos
  const Rh=huRetosHoy(H), d3=card(`🧩 Retos del robot (${Rh.est.filter(Boolean).length}/${HU_RETOS} hoy)`);
  const r3=el('div','choice'); r3.style.justifyContent='flex-start';
  for(let k=0;k<HU_RETOS;k++){ const st=Rh.est[k]||0, b=el('button','',`Reto ${k+1} ${st?'⭐'.repeat(st):'·'}`);
    b.onclick=()=>{ HUZ.sem=null; const Rr=huReto(p,k); openRobot(Rr,{volver:()=>openHuerto(),alGanar:fin=>huGanaReto(p,k,fin)}); }; r3.append(b); }
  d3.append(r3); d3.append(el('div','counter','2 botones por estrella la primera vez. Con 2 perfectos seguidos, el robot sube de nivel.'));
  // cesta
  const d4=card('🧺 Tu cesta'), ks=Object.keys(H.cesta||{}).filter(k=>H.cesta[k]);
  d4.append(el('div','',ks.length?ks.map(k=>`${HU_CULT[k].e} ${H.cesta[k]} ${H.cesta[k]>1?HU_CULT[k].np:HU_CULT[k].n.toLowerCase()}`).join(' · '):'<span class="counter">Vacía. Cuando una planta madure, el robot la recogerá.</span>'));
  Rt.append(el('div','counter','💡 Cada planta pide agua un día tras otro. Cuando ha bebido los días que necesita, a la mañana siguiente está madura.'));
}
function huAyuda(){
  const p=P();
  if(!p||VISIT||REMOTO) return 'Este es el huerto del robot. Cada niña cuida su parcela programando al robot.';
  if(!huAbierta(p)) return '¡Hola! Soy el robot del huerto. Tu parcela aún está cerrada, pero puedes ver la de tu hermana.';
  return '¡Hola, '+p.name+'! Siembra semillas en tu parcela y prográmame para plantar, regar y recoger. ¡Cada día hay trabajo!';
}
function openHuerto(){
  HUZ.sem=null; $('#hu-chip').textContent=''; $('#hu-ask').textContent=huAyuda(); huMsg('');
  show('huerto'); huRender(); if(!HUZ.raf){ HUZ.last=0; HUZ.raf=requestAnimationFrame(huBucle); }
}
$('#hu-back').onclick=()=>{ HUZ.sem=null; show('village'); };
$('#hu-speak').onclick=()=>speakNow(huAyuda());
