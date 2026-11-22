"use strict";
/* =========================================================
   NAVIDAD · el Belén de cada niña (las piezas están en navidad-belen-piezas.js)
   - Mueble «Mesa del Belén» (gratis, en la tienda de Navidad). Al tocarlo en casa se abre en grande.
   - Las piezas se mueven con el dedo; herramientas: voltear, tamaño (3), delante, detrás, color, copiar, quitar.
     Cielo y suelo gratis. Una pieza comprada se pone las veces que se quiera (hasta 80 en la escena).
   - Comprar piezas solo en Navidad; montarlo y verlo, siempre.
   - De visita: se ve el Belén de la hermana y se le deja una pegatina (se guarda en la partida de quien la da).
   - «Foto al tablón»: cuelga su Belén en el corcho del pueblo.
   Lo que se guarda (partida de cada niña): p.paq.navidad.belen = {own:{id:1}, esc:[{i,x,y,s,f,c}], cielo, suelo, peg:{idNiña:emoji}, foto}
   ========================================================= */
const BL_W=900, BL_H=520, BL_MAX=80, BL_ESC=[0.8,1.15,1.5], BL_PEGAS=['⭐','❤️','🐑','😄','👏','🌟'];
const BL={p:null,mine:false,sel:-1,drag:null,raf:null,t:0,last:0,tab:'sagrada',k:1,from:'casa'};
const BL_VACIO={own:{},esc:[],cielo:'noche',suelo:'musgo',peg:{}};
function blDatos(p){ const d=paqDatosNina(p,'navidad'); if(!d.belen) d.belen={own:{},esc:[],cielo:'noche',suelo:'musgo',peg:{}}; const b=d.belen; b.own=b.own||{}; b.esc=b.esc||[]; b.peg=b.peg||{}; return b; }
function blVer(p){ const b=p&&((p.paq||{}).navidad||{}).belen; return b||BL_VACIO; } // solo leer (no crea nada en la partida)
function blTiene(p,id){ const pz=blPieza(id); return !!pz&&(pz.p===0||!!blVer(p).own[id]); }
function blTieneMesa(p){ const f=furn('fu_nav_belen'); return !!(p&&f&&tieneMueble(p,f)); }
function blPegasDe(p){ return DB.profiles.filter(q=>q&&q!==p&&blVer(q).peg&&blVer(q).peg[p.id]).map(q=>({e:blVer(q).peg[p.id],de:q.name})); }

/* ---------- dibujo ---------- */
function blFondo(c,b,t){
  const cie=b.cielo||'noche', g=c.createLinearGradient(0,0,0,340);
  if(cie==='dia'){ g.addColorStop(0,'#8fcdf3'); g.addColorStop(1,'#dff2fd'); }
  else if(cie==='tarde'){ g.addColorStop(0,'#6f5aa8'); g.addColorStop(0.5,'#e98a6a'); g.addColorStop(1,'#fbd3a0'); }
  else { g.addColorStop(0,'#141c44'); g.addColorStop(1,'#3a4a8a'); }
  c.fillStyle=g; c.fillRect(0,0,BL_W,BL_H);
  if(cie==='noche') for(let i=0;i<70;i++){ const a=0.4+0.6*((Math.sin(t*1.5+i*2.1)+1)/2); c.fillStyle=`rgba(255,255,240,${a*0.8})`; c.fillRect(seeded(i+300)*BL_W,seeded(i+400)*300,1.6+seeded(i)*1.4,1.6+seeded(i)*1.4); }
  if(cie==='tarde'){ c.fillStyle='rgba(255,220,150,.55)'; c.beginPath(); c.arc(720,300,60,0,TAU); c.fill(); }
  const lejos=cie==='noche'?['#2a3566','#24305a']:cie==='tarde'?['#9a6a8a','#7d5a7a']:['#a9c9a0','#8fb88a'];
  [[300,lejos[0],0],[320,lejos[1],2]].forEach(([y,col,o])=>{ c.fillStyle=col; c.beginPath(); c.moveTo(0,y); for(let x=0;x<=BL_W;x+=60) c.quadraticCurveTo(x+30,y-30-seeded(x+o)*30,x+60,y-seeded(x+o+7)*10); c.lineTo(BL_W,BL_H); c.lineTo(0,BL_H); c.closePath(); c.fill(); });
  const su=b.suelo||'musgo', base={musgo:'#5f9a3e',arena:'#e3c88f',nieve:'#eef4fa'}[su]||'#5f9a3e', luz={musgo:'#76b04f',arena:'#efd8a6',nieve:'#ffffff'}[su], som={musgo:'#4f8434',arena:'#cfb176',nieve:'#d5e1ee'}[su];
  c.fillStyle=base; c.beginPath(); c.moveTo(0,338); c.quadraticCurveTo(450,318,BL_W,338); c.lineTo(BL_W,BL_H); c.lineTo(0,BL_H); c.closePath(); c.fill();
  for(let i=0;i<120;i++){ c.fillStyle=i%2?luz:som; c.beginPath(); c.ellipse(seeded(i+600)*BL_W,345+seeded(i+700)*150,6+seeded(i+800)*14,2+seeded(i+900)*4,0,0,TAU); c.fill(); }
  roundRect(c,-10,500,BL_W+20,30,4); c.fillStyle='#a8743f'; c.fill(); c.strokeStyle=OUT; c.lineWidth=2.6; c.beginPath(); c.moveTo(0,500); c.lineTo(BL_W,500); c.stroke();
  c.strokeStyle='rgba(90,50,20,.35)'; c.lineWidth=1.4; for(let x=40;x<BL_W;x+=110){ c.beginPath(); c.moveTo(x,506); c.quadraticCurveTo(x+30,512,x+60,507); c.stroke(); }
}
function blDibuja(c,b,t,sel){
  blFondo(c,b,t);
  (b.esc||[]).forEach((e,i)=>{ const pz=blPieza(e.i); if(!pz) return; const s=BL_ESC[e.s==null?1:e.s];
    c.save(); c.translate(e.x,e.y); c.scale(e.f?-s:s,s); try{ pz.d(c,e.c!=null?BL_COLS[e.c%BL_COLS.length]:null,t,!!e.f); }catch(err){ apuntaFallo(err,'belen:'+e.i); } c.restore();
    if(i===sel){ c.save(); c.strokeStyle='#ffd84a'; c.lineWidth=2.5; c.setLineDash([7,5]); roundRect(c,e.x-pz.w*s/2-6,e.y-pz.h*s-6,pz.w*s+12,pz.h*s+12,10); c.stroke(); c.restore(); } });
}
function blMiniatura(p,w){ const cv=document.createElement('canvas'), k=w/BL_W; cv.width=w; cv.height=Math.round(BL_H*k); const c=cv.getContext('2d'); c.scale(k,k); blDibuja(c,blVer(p),0,-1); return cv.toDataURL('image/jpeg',0.85); }
const BL_PULGAR={};
function blPulgar(pz){ if(BL_PULGAR[pz.id]) return BL_PULGAR[pz.id]; const cv=document.createElement('canvas'), dpr=Math.min(2,window.devicePixelRatio||1); cv.width=80*dpr; cv.height=66*dpr; const c=cv.getContext('2d'); c.scale(dpr,dpr);
  const k=Math.min(70/pz.w,56/pz.h,1.3); c.translate(40,61); c.scale(k,k); try{ pz.d(c,null,0,false); }catch(e){} return BL_PULGAR[pz.id]=cv.toDataURL(); }

/* ---------- pantalla ---------- */
(function(){ if(document.getElementById('scr-belen')) return;
  const s=document.createElement('section'); s.id='scr-belen'; s.className='screen';
  s.innerHTML=`<div class="topbar"><button class="btn" id="bl-back">← Casa</button><div class="ttl" id="bl-title">🌟 Mi Belén</div><div class="chip" id="bl-coins"></div></div>
  <div class="scroll" style="flex:1"><div class="blwrap"><div class="blleft"><div class="blstage"><canvas id="bl-cv"></canvas><div id="bl-peg"></div></div><div id="bl-tools"></div></div><div class="blside" id="bl-side"></div></div></div>`;
  document.body.append(s);
  const st=document.createElement('style'); st.textContent=`.blwrap{display:flex;gap:14px;padding:12px;flex-wrap:wrap;max-width:1500px;margin:0 auto}.blleft{flex:3 1 560px;min-width:0}.blstage{position:relative}
  #bl-cv{display:block;width:100%;border-radius:18px;touch-action:none;box-shadow:0 0 0 3px #5a3a24}.blside{flex:1 1 300px;display:flex;flex-direction:column;gap:10px}
  #bl-peg{position:absolute;left:10px;top:10px;display:flex;gap:6px;flex-wrap:wrap}#bl-peg span{background:rgba(255,250,240,.92);border-radius:14px;padding:3px 10px;font-weight:800;font-size:15px}
  #bl-tools{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}#bl-tools .btn{min-height:46px;padding:4px 12px;font-size:16px}
  .blgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}.blp{display:flex;flex-direction:column;align-items:center;padding:6px 4px;border-radius:14px;background:#fffaf1;border:2px solid #eadcc4;font-size:13px;font-weight:700;line-height:1.15;text-align:center;min-height:120px}
  .blp img{width:80px;height:66px}.blp.no{opacity:.55}.blp small{font-weight:800;margin-top:3px}.blrow{display:flex;gap:6px;flex-wrap:wrap}.blrow .btn{min-height:42px;padding:4px 10px;font-size:15px}.blrow .btn.sel{outline:3px solid #f4c430}`;
  document.head.append(st);
  document.getElementById('bl-back').onclick=()=>blSalir();
  const cv=document.getElementById('bl-cv');
  const pos=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*BL_W,(e.clientY-r.top)/r.height*BL_H]; };
  cv.addEventListener('pointerdown',e=>{ if(!BL.mine) return; const [x,y]=pos(e), b=blDatos(BL.p); let hit=-1;
    for(let i=b.esc.length-1;i>=0;i--){ const q=b.esc[i], pz=blPieza(q.i); if(!pz) continue; const s=BL_ESC[q.s==null?1:q.s]; if(Math.abs(x-q.x)<=pz.w*s/2+6&&y>=q.y-pz.h*s-6&&y<=q.y+8){ hit=i; break; } }
    BL.sel=hit; if(hit>=0){ BL.drag={dx:x-b.esc[hit].x,dy:y-b.esc[hit].y,mov:false}; try{ cv.setPointerCapture(e.pointerId); }catch(err){} beep(640,0.03); }
    blHerramientas(); });
  cv.addEventListener('pointermove',e=>{ if(!BL.drag||BL.sel<0) return; const [x,y]=pos(e), q=blDatos(BL.p).esc[BL.sel]; if(!q) return;
    q.x=Math.round(Math.max(10,Math.min(BL_W-10,x-BL.drag.dx))); q.y=Math.round(Math.max(40,Math.min(512,y-BL.drag.dy))); BL.drag.mov=true; });
  const fin=()=>{ if(BL.drag&&BL.drag.mov) save(); BL.drag=null; };
  cv.addEventListener('pointerup',fin); cv.addEventListener('pointercancel',fin);
  window.addEventListener('resize',()=>{ if(curScreen==='belen') blTam(); });
})();
function blTam(){ const cv=$('#bl-cv'); if(!cv) return; const w=Math.max(300,cv.parentElement.clientWidth||900), dpr=Math.min(2,window.devicePixelRatio||1); cv.width=Math.round(w*dpr); cv.height=Math.round(w*BL_H/BL_W*dpr); BL.k=cv.width/BL_W; }
function blBucle(now){ if(curScreen!=='belen'||!BL.p){ BL.raf=null; return; }
  BL.t+=Math.min(0.05,(now-(BL.last||now))/1000); BL.last=now; const c=$('#bl-cv').getContext('2d'); c.setTransform(BL.k,0,0,BL.k,0,0); blDibuja(c,blVer(BL.p),BL.t,BL.mine?BL.sel:-1); BL.raf=requestAnimationFrame(blBucle); }
function openBelen(p,desde){
  if(!p) return; const yo=P(); BL.p=p; BL.mine=!!yo&&p===yo&&!VISIT&&!REMOTO; BL.sel=-1; BL.drag=null; BL.from=desde||(curScreen==='house'?'casa':'pueblo');
  if(BL.mine) blDatos(p);
  $('#bl-title').textContent=BL.mine?'🌟 Mi Belén':'🌟 El Belén de '+p.name;
  $('#bl-back').textContent=BL.from==='casa'?'← Casa':'← Pueblo';
  show('belen'); blTam(); blPanel(); blHerramientas();
  if(!BL.raf){ BL.last=performance.now(); BL.raf=requestAnimationFrame(blBucle); }
  if(BL.mine&&!blVer(p).esc.length) setTimeout(()=>{ if(curScreen==='belen'&&BL.p===p) toast('Toca una pieza de la derecha para ponerla. Luego muévela con el dedo.',3500); },400);
}
function blSalir(){ const p=BL.p; BL.p=null; if(BL.from==='casa'){ const i=DB.profiles.indexOf(p); houseView='room'; openHouse(i>=0?i:DB.cur); } else show('village'); }
function blPegas(){ const box=$('#bl-peg'); if(!box) return; box.innerHTML=''; blPegasDe(BL.p).forEach(x=>box.append(el('span','',esc(x.e+' de '+x.de)))); }
function blHerramientas(){
  const T=$('#bl-tools'); T.innerHTML=''; blPegas(); if(!BL.mine) return;
  const b=blDatos(BL.p), q=b.esc[BL.sel], pz=q&&blPieza(q.i);
  if(!q){ T.append(el('div','counter','👆 Toca una pieza del Belén para moverla o cambiarla.')); return; }
  const B=(t,fn)=>{ const x=el('button','btn',t); x.onclick=()=>{ fn(); save(); blHerramientas(); }; T.append(x); };
  T.append(el('div','counter','<b>'+esc(pz.n)+'</b>'));
  B('↔️ Voltear',()=>{ q.f=q.f?0:1; });
  B('🔍 Tamaño',()=>{ q.s=((q.s==null?1:q.s)+1)%3; });
  B('⬆️ Delante',()=>{ b.esc.splice(BL.sel,1); b.esc.push(q); BL.sel=b.esc.length-1; });
  B('⬇️ Detrás',()=>{ b.esc.splice(BL.sel,1); b.esc.unshift(q); BL.sel=0; });
  if(pz.col) B('🎨 Color',()=>{ q.c=((q.c==null?-1:q.c)+1)%BL_COLS.length; });
  B('📄 Copiar',()=>{ if(b.esc.length>=BL_MAX){ toast('¡Tu Belén está lleno! Quita alguna pieza.'); return; } const n=Object.assign({},q,{x:Math.min(BL_W-20,q.x+34)}); b.esc.push(n); BL.sel=b.esc.length-1; });
  B('🗑️ Quitar',()=>{ b.esc.splice(BL.sel,1); BL.sel=-1; });
}
function blPanel(){
  const S=$('#bl-side'); S.innerHTML=''; const p=BL.p, yo=P();
  $('#bl-coins').textContent=BL.mine?'🔘 '+yo.coins:''; $('#bl-coins').style.display=BL.mine?'':'none';
  if(!BL.mine){
    const pan=el('div','panel'); pan.append(el('div','wsec','🌟 El Belén de '+esc(p.name)));
    const n=blVer(p).esc.length; pan.append(el('div','counter',n?`Tiene ${n} piezas. ¡Fíjate en los detalles!`:'Todavía no ha puesto ninguna pieza.'));
    if(yo&&yo!==p&&!VISIT&&!REMOTO){ pan.append(el('div','lbl','Déjale una pegatina'));
      const mia=blVer(yo).peg[p.id], row=el('div','blrow');
      BL_PEGAS.forEach(e=>{ const x=el('button','btn'+(mia===e?' sel':''),e); x.style.fontSize='26px'; x.onclick=()=>{ blDatos(yo).peg[p.id]=e; save('Pegatina en el Belén de '+p.name); sfxBuy(); toast(e+' ¡Pegatina para '+p.name+'!'); blPanel(); blPegas(); }; row.append(x); });
      pan.append(row); }
    S.append(pan); return;
  }
  const b=blDatos(p), temp=paqActivo(NAV);
  const fondo=el('div','panel'); fondo.append(el('div','lbl','Cielo'));
  const r1=el('div','blrow'); [['dia','☀️ Día'],['tarde','🌅 Atardecer'],['noche','🌙 Noche']].forEach(([k,t])=>{ const x=el('button','btn'+(b.cielo===k?' sel':''),t); x.onclick=()=>{ b.cielo=k; save(); blPanel(); }; r1.append(x); }); fondo.append(r1);
  fondo.append(el('div','lbl','Suelo'));
  const r2=el('div','blrow'); [['musgo','🌿 Musgo'],['arena','🏜️ Arena'],['nieve','❄️ Nieve']].forEach(([k,t])=>{ const x=el('button','btn'+(b.suelo===k?' sel':''),t); x.onclick=()=>{ b.suelo=k; save(); blPanel(); }; r2.append(x); }); fondo.append(r2);
  S.append(fondo);
  const pz=el('div','panel'); const tabs=el('div','blrow'); tabs.style.marginBottom='8px';
  BL_GRUPOS.forEach(([k,t])=>{ const x=el('button','btn'+(BL.tab===k?' sel':''),t); x.onclick=()=>{ BL.tab=k; blPanel(); }; tabs.append(x); }); pz.append(tabs);
  const grid=el('div','blgrid');
  BL_PIEZAS.filter(x=>x.g===BL.tab).forEach(x=>{ const tiene=blTiene(p,x.id), otra=deOtra(p,x);
    const d=el('button','blp'+(otra||(!tiene&&!temp)?' no':'')); d.innerHTML=`<img src="${blPulgar(x)}" alt="">${esc(x.n)}<small>${otra?'⭐ Es de '+esc(otra):tiene?'➕ Poner':temp?'🔘 '+x.p:'🔒 En Navidad'}</small>`;
    d.onclick=()=>blTocaPieza(x); grid.append(d); });
  pz.append(grid); S.append(pz);
  const fin=el('div','panel'), fr=el('div','blrow');
  const foto=el('button','btn green','📷 Colgar foto en el tablón'); foto.onclick=()=>{ if(!b.esc.length){ toast('Pon antes alguna pieza'); return; } b.foto=today(); save('Colgó la foto de su Belén'); fanfare(); toast('📷 ¡Tu Belén ya está en el tablón del pueblo!'); };
  fr.append(foto);
  DB.profiles.filter(q=>q&&q!==p&&blTieneMesa(q)).forEach(q=>{ const v=el('button','btn','👀 Ver el de '+esc(q.name)); v.onclick=()=>openBelen(q,'pueblo'); fr.append(v); });
  fin.append(fr); const pg=blPegasDe(p); if(pg.length) fin.append(el('div','counter','Pegatinas que te han dejado: '+pg.map(x=>esc(x.e+' '+x.de)).join(' · ')));
  S.append(fin);
}
async function blTocaPieza(x){
  const p=BL.p; if(!BL.mine) return; const b=blDatos(p);
  const otra=deOtra(p,x); if(otra){ toast('Esa pieza es de '+otra+'. ¡Ve a ver su Belén!'); return; }
  if(!blTiene(p,x.id)){
    if(!paqActivo(NAV)){ toast('Las piezas se compran en Navidad'); return; }
    if(p.coins<x.p){ toast('Te faltan botones para «'+x.n+'». ¡Completa encargos!'); return; }
    const r=await say({face:'🌟',name:'Tu Belén',text:`¿Comprar «${x.n}» por ${x.p} botones? Luego podrás ponerla las veces que quieras.`,buttons:[{t:'No'},{t:'¡Sí!',cls:'primary'}],speak:false}); if(r!==1) return;
    if(p.coins<x.p) return; p.coins-=x.p; b.own[x.id]=1; sfxBuy(); save('Compró para el Belén: '+x.n); addNews(p,'🌟','ha comprado «'+x.n+'» para su Belén');
  }
  if(b.esc.length>=BL_MAX){ toast('¡Tu Belén está lleno! Quita alguna pieza.'); return; }
  const n=b.esc.filter(e=>e.i===x.id).length;
  b.esc.push({i:x.id,x:Math.round(450+((n*37)%160)-80),y:x.g==='cielo'?150:x.g==='paisaje'&&x.h>100?360:420+((n*13)%50),s:1,f:0});
  BL.sel=b.esc.length-1; save(); beep(760,0.07,'triangle'); blPanel(); blHerramientas();
}

/* ---------- el mueble, la tienda y el tablón ---------- */
FURN.some(f=>f.k==='nav_belen')||FURN.push({k:'nav_belen',e:'🌟',n:'Mesa del Belén',p:0,z:'floor',paq:'navidad',once:1,nota:'Gratis. Tócala en tu casa para montar tu Belén',
  abre:p=>openBelen(p,'casa'),
  draw(c,t){ roundRect(c,-40,-30,80,30,4); c.fillStyle='#9a6338'; c.fill(); ol(c,2.2); c.fillStyle='#7a4a2a'; c.fillRect(-36,-4,8,4); c.fillRect(28,-4,8,4);
    roundRect(c,-44,-36,88,8,3); c.fillStyle='#5f9a3e'; c.fill(); ol(c,1.8);
    c.beginPath(); c.moveTo(-30,-36); c.lineTo(-30,-58); c.lineTo(-6,-70); c.lineTo(18,-58); c.lineTo(18,-36); c.closePath(); c.fillStyle='#b98552'; c.fill(); ol(c,1.8); c.fillStyle='#3a2a20'; c.fillRect(-20,-52,28,16);
    [[-12,'#3d6fc4'],[0,'#8a5a36']].forEach(([x,col])=>{ c.fillStyle=col; c.beginPath(); c.moveTo(x-4,-36); c.lineTo(x,-48); c.lineTo(x+4,-36); c.fill(); });
    c.fillStyle='#fbf8f0'; [[26,-38],[34,-39]].forEach(([x,y])=>{ c.beginPath(); c.ellipse(x,y,4,2.6,0,0,TAU); c.fill(); });
    const a=(Math.sin((t||0)*2)+1)/2; c.save(); c.globalAlpha=0.6+a*0.4; navEstrella(c,-6,-80,6,t||0); c.restore(); }});
(function(){ const antes=NAV.enchufes.tienda;
  NAV.enchufes.tienda=function(p){ const tabs=antes.call(this,p); tabs.forEach(tb=>{ if(tb.k!=='navidad') return; const r=tb.render;
    tb.render=(g,p)=>{ const d=el('div','wsec','🌟 Tu Belén'); d.style.gridColumn='1/-1'; g.append(d);
      const f=furn('fu_nav_belen');
      if(blTieneMesa(p)){ const c=el('div','sitem'); c.innerHTML='<div class="e">🌟</div><div class="n">Tu Belén</div><div class="counter">Las piezas se compran dentro, al montarlo</div>'; const b=el('button','btn green','Abrir mi Belén'); b.onclick=()=>openBelen(p,'pueblo'); c.append(b); g.append(c); }
      else tarjetaMueble(g,p,f);
      r(g,p); }; }); return tabs; }; })();
(function(){ const antes=NAV.enchufes.tablon;
  NAV.enchufes.tablon=function(ctx){ const prev=antes?antes.call(this,ctx):[]; const out=[].concat(prev||[]);
    DB.profiles.forEach(q=>{ if(!q) return; const b=blVer(q); if(!b.foto||!b.esc.length) return;
      out.push({key:'belen-'+q.id, tipo:'nota', estilo:'tarjeta', emoji:'🌟', titulo:'El Belén de '+q.name, texto:'¡Mirad mi Belén!', firma:q.name, sello:'📷', prio:60, punto:q.color,
        extra(cont){ const im=document.createElement('img'); im.src=blMiniatura(q,600); im.style.cssText='width:100%;border-radius:12px;margin-top:8px;border:3px solid #5a3a24'; cont.append(im); },
        acciones(a){ const x=el('button','btn green','👀 Verlo en grande'); x.onclick=()=>{ closePaper(); openBelen(q,'pueblo'); }; a.append(x); } }); });
    return out; }; })();
