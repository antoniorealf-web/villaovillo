"use strict";
/* =========================================================
   PLANTAS DEL JARDÍN: etapas, abono y dibujos (desde el 25 nov 2026, etapa 2 del jardín)
   ---------------------------------------------------------
   Cada planta de p.jardin.cel guarda, además de lo de siempre:
     rg:   riegos que han contado (el crecimiento nuevo). Si no está, sale de g/need (plRiegos).
     pide: 1 si pide abono. Sin abono el riego no la hace crecer, pero no se estropea.
   g y need siguen como antes (crecida = g>=need) para que una tablet con la versión anterior no se líe:
   al regar se ponen al día (plLegado). Nunca se escriben al abrir una partida.
   Tipos: flor (meta 4 riegos, abono en el 2), cactus (6; abono en el 3) y árbol (meta 30 = árbol joven;
   sigue creciendo: adulto 45, grande 70; abono cada 4 riegos). Los árboles de premio (L1, L2, L3, M)
   empiezan como árbol joven. Abono: dosis en p.inv.sh_abono (Saco de abono, 5 dosis por 10 botones).
   Dibujos: plDibuja(c, o, x, y, t, escala) con el pie en (x,y); cambian con la etapa y, los árboles, con el mes.
   ========================================================= */
const PL_ARB={'pl_🌳':'frondoso','pl_🌲':'pino','pl_🌴':'palmera',L1:'naranjo',L2:'limonero',L3:'cerezo',M:'arcoiris'};
const PL_ETAPAS={flor:[[0,'semilla'],[1,'brote'],[3,'capullo'],[4,'flor']],cactus:[[0,'semilla'],[1,'brote'],[3,'cactus pequeño'],[6,'cactus con flor']],
  arbol:[[0,'semilla'],[1,'plantón'],[8,'arbolito'],[30,'árbol joven'],[45,'árbol adulto'],[70,'árbol grande']]};
function plTipo(k){ k=jdK(k); if(PL_ARB[k]) return 'arbol'; if(k==='pl_🌵') return 'cactus'; return k&&k.startsWith('pl_')?'flor':null; }
function plPremio(k){ k=jdK(k); return !!PL_ARB[k]&&!k.startsWith('pl_'); }
function plMeta(k){ const t=plTipo(k); return t==='arbol'?(plPremio(k)?0:30):t==='cactus'?6:t==='flor'?4:0; }
function plTope(k){ return plTipo(k)==='arbol'?70:plMeta(k); }
function plRiegos(o){ if(o.rg!=null) return o.rg; if(plPremio(o.k)) return 30; return o.g>=o.need?Math.max(plMeta(o.k),o.g):o.g; }
function plCrecida(o){ return !plTipo(o.k)||plRiegos(o)>=plMeta(o.k); }
function plEtapa(o){ const t=plTipo(o.k); if(!t) return null; const E=PL_ETAPAS[t], g=plRiegos(o); let i=0; E.forEach((e,j)=>{ if(g>=e[0]) i=j; }); return {i,n:E[i][1],sig:E[i+1]||null,g}; }
function plPideEn(k,g){ const t=plTipo(k); return t==='flor'?g===2:t==='cactus'?g===3:t==='arbol'?(g>0&&g%4===0&&g<70):false; }
function plQuiereAgua(o){ return !!plTipo(o.k)&&!o.pide&&plRiegos(o)<plTope(o.k); }
function plLegado(o){ o.g=plCrecida(o)?o.need:Math.min(Math.max(0,o.need-1),plRiegos(o)); }
function plNueva(k,crecida){ const need=needFor(jdK(k)); return {k:jdK(k),g:crecida?need:0,need,rg:crecida||plPremio(k)?Math.max(plMeta(k),plPremio(k)?30:0):0}; }
function plInfo(o){ const e=plEtapa(o); if(!e) return itemInfo(o.k).n; const n=itemInfo(o.k).n;
  if(o.pide) return `${n}: pide abono 🌾`;
  return e.sig?`${n} (${e.n}): ${e.g} riegos · le faltan ${e.sig[0]-e.g} para ${e.sig[1]}`:`${n}: ¡${e.n}!`; }
/* Riego del día: devuelve lo que ha florecido y los árboles que han cambiado de etapa */
function plRiega(p){ const flor=[], etapa=[];
  jdPlantas(p).forEach(o=>{ if(!plQuiereAgua(o)) return; const antes=plEtapa(o).i, crecida=plCrecida(o);
    o.rg=plRiegos(o)+1; if(!crecida&&plCrecida(o)) flor.push(o.k); else if(plTipo(o.k)==='arbol'&&plEtapa(o).i>antes&&plEtapa(o).i>=3) etapa.push(o);
    if(plPideEn(o.k,o.rg)) o.pide=1; plLegado(o); });
  return {flor,etapa}; }
function plPidenAbono(p){ return jdPlantas(p).filter(o=>o.pide); }
function plAbona(p){ const pid=plPidenAbono(p); let d=p.inv.sh_abono||0, n=0;
  pid.forEach(o=>{ if(d>0){ o.pide=0; d--; n++; } }); if(d>0) p.inv.sh_abono=d; else delete p.inv.sh_abono; return {n,faltan:pid.length-n}; }
/* ---------- Dibujos ---------- */
function plMes(){ return +today().slice(5,7); }
function plNieve(){ return typeof NAV!=='undefined'&&paqActivo(NAV); }
function plSemilla(c,i){ c.fillStyle='#8a5a36'; c.beginPath(); c.ellipse(0,-2,15,6,0,0,Math.PI*2); c.fill(); ol(c,1.8); c.fillStyle='#d9b26a'; c.beginPath(); c.ellipse(2,-6,4,3,0.4,0,Math.PI*2); c.fill(); ol(c,1.2); }
function plTallo(c,h,col){ c.strokeStyle=OUT; c.lineWidth=5; c.beginPath(); c.moveTo(0,-2); c.quadraticCurveTo(2,-h/2,0,-h); c.stroke(); c.strokeStyle=col||'#4f9e45'; c.lineWidth=2.8; c.stroke(); }
function plHoja(c,x,y,rot,s,col){ c.save(); c.translate(x,y); c.rotate(rot); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(9*s,-6*s,18*s,0); c.quadraticCurveTo(9*s,6*s,0,0); c.fillStyle=col||'#6cc25a'; c.fill(); ol(c,1.6); c.restore(); }
function plBrote(c,s){ s=s||1; plTallo(c,14*s); plHoja(c,0,-12*s,-2.6,0.8*s); plHoja(c,0,-12*s,-0.5,0.8*s); }
function plCabeza(c,x,y,n,rp,pw,col,cen,cr,rot){ c.save(); c.translate(x,y); c.rotate(rot||0);
  for(let i=0;i<n;i++){ c.save(); c.rotate(i/n*Math.PI*2); c.beginPath(); c.ellipse(0,-rp,pw,rp*0.7,0,0,Math.PI*2); c.fillStyle=col; c.fill(); ol(c,1.4); c.restore(); }
  c.beginPath(); c.arc(0,0,cr,0,Math.PI*2); c.fillStyle=cen; c.fill(); ol(c,1.6); c.restore(); }
const PL_FLOR={
  'pl_🌷':{h:38,col:'#f06a8a',cap(c,y,s){ c.beginPath(); c.moveTo(-9*s,y); c.quadraticCurveTo(-11*s,y-16*s,-5*s,y-20*s); c.lineTo(0,y-13*s); c.lineTo(5*s,y-20*s); c.quadraticCurveTo(11*s,y-16*s,9*s,y); c.quadraticCurveTo(0,y+6*s,-9*s,y); c.fillStyle='#f06a8a'; c.fill(); ol(c,1.8); c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-4*s,y-9*s,2.4*s,6*s,0,0,Math.PI*2); c.fill(); }},
  'pl_🌼':{h:32,col:'#fffaf1',cap(c,y,s){ plCabeza(c,0,y-4,11,8*s,3.2*s,'#fffaf1','#f4c430',5*s); }},
  'pl_🌻':{h:62,col:'#f4c430',hoja:1.3,cap(c,y,s){ plCabeza(c,0,y-6,14,12*s,4.6*s,'#f7c52b','#7a4f2e',9*s); c.fillStyle='rgba(0,0,0,.25)'; for(let i=0;i<6;i++){ c.beginPath(); c.arc(-4*s+(i%3)*4*s,y-9+Math.floor(i/3)*5*s,1.2,0,Math.PI*2); c.fill(); } }},
  'pl_🌹':{h:36,col:'#d8344a',cap(c,y,s){ c.beginPath(); c.arc(0,y-8*s,10*s,0,Math.PI*2); c.fillStyle='#d8344a'; c.fill(); ol(c,1.8); c.strokeStyle='#9e1f33'; c.lineWidth=1.6; c.beginPath(); c.arc(0,y-8*s,5.5*s,0.3,5.4); c.stroke(); c.beginPath(); c.arc(1,y-9*s,2.5*s,2,7); c.stroke(); }},
  'pl_🌺':{h:26,col:'#f2557a',hoja:1.3,cap(c,y,s){ plCabeza(c,0,y-6,5,10*s,7*s,'#f2557a','#ffd23f',3.5*s,0.3); c.strokeStyle='#ffd23f'; c.lineWidth=2; c.beginPath(); c.moveTo(0,y-6); c.lineTo(7*s,y-14*s); c.stroke(); }},
  'pl_🌸':{h:22,col:'#f8b4cc',arbusto:1,cap(c,y,s){ [[-10,-4],[9,-6],[0,-14],[-3,2],[12,4]].forEach(([dx,dy])=>plCabeza(c,dx*s,y+dy*s,5,4*s,3*s,'#f8b4cc','#fff0a8',2*s)); }},
  'pl_🍀':{h:10,col:'#55b05a',bajo:1,cap(c,y,s){ [[-9,0],[8,-2],[0,-8]].forEach(([dx,dy],j)=>{ for(let i=0;i<(j===2?4:3);i++) plCabeza(c,dx*s,y+dy*s,1,4.5*s,4*s,'#55b05a','#55b05a',0.1,i*Math.PI*2/(j===2?4:3)); }); c.fillStyle='#fffaf1'; c.beginPath(); c.arc(12*s,y-10*s,3*s,0,Math.PI*2); c.fill(); ol(c,1.2); }},
  'pl_🪴':{h:24,maceta:1,cap(c,y,s){ [[-1.9,1],[-1.2,1.1],[-0.4,1.2],[0.3,1.1],[1,1]].forEach(([r,k])=>plHoja(c,0,y+4,r-1.57,1.25*k*s,'#4fa35a')); }}
};
function plFlor(c,o,e,t,i){ const k=jdK(o.k), F=PL_FLOR[k]||PL_FLOR['pl_🌼'], sw=Math.sin(t*1.6+i)*0.05;
  if(F.maceta){ c.beginPath(); c.moveTo(-14,-24); c.lineTo(14,-24); c.lineTo(10,0); c.lineTo(-10,0); c.closePath(); c.fillStyle='#d9824e'; c.fill(); ol(c,2); roundRect(c,-16,-28,32,7,3); c.fillStyle='#e8955f'; c.fill(); ol(c,1.6);
    if(e.i===0){ c.fillStyle='#d9b26a'; c.beginPath(); c.arc(0,-29,3,0,Math.PI*2); c.fill(); return; }
    c.save(); c.rotate(sw); if(e.i===1){ plHoja(c,0,-26,-2.4,0.6); plHoja(c,0,-26,-0.7,0.6); } else F.cap(c,-24,e.i===2?0.7:1); c.restore(); return; }
  if(e.i===0){ plSemilla(c,i); return; }
  c.fillStyle='#8a5a36'; c.beginPath(); c.ellipse(0,-1,13,5,0,0,Math.PI*2); c.fill(); ol(c,1.6);
  c.save(); c.rotate(sw);
  if(e.i===1){ plBrote(c); c.restore(); return; }
  const h=e.i===2?F.h*0.75:F.h, s=e.i===2?0.8:1;
  if(F.bajo||F.arbusto){ if(F.arbusto){ [[-11,-8,11],[9,-9,12],[0,-16,12]].forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle='#5aa64a'; c.fill(); ol(c,1.8); }); }
    if(e.i===2){ c.fillStyle=F.col; [[-6,-14],[8,-10],[0,-20]].forEach(([x,y])=>{ c.beginPath(); c.arc(x,y,2.5,0,Math.PI*2); c.fill(); }); } else F.cap(c,F.bajo?-2:-6,1); c.restore(); return; }
  plTallo(c,h); const hs=(F.hoja||1)*s; plHoja(c,0,-h*0.35,-2.7,0.9*hs); plHoja(c,0,-h*0.5,-0.4,0.9*hs);
  if(e.i===2){ c.beginPath(); c.ellipse(0,-h-6,5,8,0,0,Math.PI*2); c.fillStyle='#5aa64a'; c.fill(); ol(c,1.6); c.beginPath(); c.ellipse(0,-h-9,3.4,4.5,0,0,Math.PI*2); c.fillStyle=F.col; c.fill(); }
  else F.cap(c,-h,s);
  c.restore(); }
function plCactus(c,o,e,t){ if(e.i===0){ plSemilla(c); return; } c.fillStyle='#d9b26a'; c.beginPath(); c.ellipse(0,-1,15,5,0,0,Math.PI*2); c.fill(); ol(c,1.6);
  const h=e.i===1?12:e.i===2?30:46, col='#5aa65a';
  roundRect(c,-8,-h,16,h,8); c.fillStyle=col; c.fill(); ol(c,2);
  if(e.i>=2){ roundRect(c,-20,-h*0.62,8,h*0.34,4); c.fill(); ol(c,1.8); roundRect(c,-14,-h*0.36,8,6,3); c.fill(); }
  if(e.i>=3){ roundRect(c,12,-h*0.78,8,h*0.4,4); c.fillStyle=col; c.fill(); ol(c,1.8); roundRect(c,6,-h*0.46,8,6,3); c.fill(); plCabeza(c,0,-h-2,6,4.5,3,'#f26aa0','#ffd23f',2.2); }
  c.strokeStyle='rgba(255,255,255,.4)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-3,-h+6); c.lineTo(-3,-4); c.moveTo(3,-h+6); c.lineTo(3,-4); c.stroke(); }
function plCopa(c,pts,col,hi){ c.lineWidth=5; c.strokeStyle=OUT; pts.forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.stroke(); });
  pts.forEach(([x,y,r,cc])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=cc||col; c.fill(); });
  if(hi){ c.fillStyle=hi; pts.forEach(([x,y,r])=>{ c.beginPath(); c.arc(x-r*0.28,y-r*0.3,r*0.42,0,Math.PI*2); c.fill(); }); } }
function plBolas(cy,R,sd){ const pts=[[0,cy,R*0.62]]; for(let i=0;i<7;i++){ const a=i/7*Math.PI*2+sd, d=R*0.52; pts.push([Math.cos(a)*d,cy+Math.sin(a)*d*0.8,R*(0.42+seeded(sd*31+i)*0.1)]); } return pts; }
function plTronco(c,h,w,col){ c.beginPath(); c.moveTo(-w*0.62,0); c.quadraticCurveTo(-w*0.32,-h*0.45,-w*0.3,-h); c.lineTo(w*0.3,-h); c.quadraticCurveTo(w*0.32,-h*0.45,w*0.62,0); c.closePath(); c.fillStyle=col||'#8a5a36'; c.fill(); ol(c,2.4);
  c.strokeStyle='rgba(0,0,0,.18)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-w*0.1,-h*0.2); c.lineTo(-w*0.05,-h*0.6); c.stroke(); }
function plRamas(c,cy,R,nieve){ c.strokeStyle=OUT; c.lineCap='round'; [[0,cy+R*0.5,-0.5,R*0.9],[0,cy+R*0.5,0.5,R*0.9],[0,cy+R*0.2,-1.1,R*0.7],[0,cy+R*0.2,1.1,R*0.7],[0,cy,0,R*0.8]].forEach(([x,y,a,l])=>{
    const x2=x+Math.sin(a)*l, y2=y-Math.cos(a)*l; c.lineWidth=7; c.strokeStyle=OUT; c.beginPath(); c.moveTo(x,y); c.lineTo(x2,y2); c.stroke(); c.lineWidth=4; c.strokeStyle='#8a5a36'; c.stroke();
    if(nieve){ c.lineWidth=3; c.strokeStyle='#fff'; c.beginPath(); c.moveTo((x+x2)/2,(y+y2)/2-2); c.lineTo(x2,y2-2); c.stroke(); } }); c.lineCap='butt'; }
function plFrutos(c,pts,n,col,r,sd,hoja){ for(let i=0;i<n;i++){ const p=pts[1+i%(pts.length-1)], a=seeded(sd+i*7)*Math.PI*2, d=p[2]*0.55*seeded(sd+i*3+1);
  const x=p[0]+Math.cos(a)*d, y=p[1]+Math.sin(a)*d; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=col; c.fill(); ol(c,1.4);
  c.fillStyle='rgba(255,255,255,.45)'; c.beginPath(); c.arc(x-r*0.35,y-r*0.35,r*0.3,0,Math.PI*2); c.fill(); if(hoja){ plHoja(c,x,y-r,-1,0.35,'#4e9a43'); } } }
function plFlores(c,pts,n,col,sd){ for(let i=0;i<n;i++){ const p=pts[i%pts.length], a=seeded(sd+i*5)*Math.PI*2, d=p[2]*0.7*seeded(sd+i*9), x=p[0]+Math.cos(a)*d, y=p[1]+Math.sin(a)*d;
  c.fillStyle=col; for(let j=0;j<5;j++){ const b=j/5*Math.PI*2; c.beginPath(); c.arc(x+Math.cos(b)*2.6,y+Math.sin(b)*2.6,2.2,0,Math.PI*2); c.fill(); }
  c.fillStyle='#f4c430'; c.beginPath(); c.arc(x,y,1.5,0,Math.PI*2); c.fill(); } }
const PL_TAM=[0,0,{h:46,R:22,w:9},{h:62,R:46,w:16},{h:72,R:56,w:20},{h:82,R:66,w:24}]; // forma del árbol en cada etapa
/* Sitios para colgar cosas (desde árbol joven), con el pie en (0,0) y sin dar la vuelta: los dos primeros, a los lados (columpio) */
function plSitios(o){ const e=plEtapa(o); if(!e||plTipo(o.k)!=='arbol'||e.i<3) return []; const tm=PL_TAM[e.i], R=tm.R, esp=PL_ARB[jdK(o.k)];
  if(esp==='pino') return [[-R*0.78,-tm.h*0.3-6],[R*0.78,-tm.h*0.3-6],[0,-tm.h*0.3-R*0.6]].slice(0,e.i>=4?3:2);
  if(esp==='palmera'){ const tx=tm.w*0.4, ty=-tm.h-8; return [[tx-R*0.85,ty+R*0.3],[tx+R*0.95,ty+R*0.35]]; }
  const cy=-tm.h-R*0.35; return [[-R*0.72,cy+R*0.62],[R*0.72,cy+R*0.62],[R*0.15,cy+R*0.88]].slice(0,e.i>=4?3:2); }
function plArbol(c,o,e,t,i){ const esp=PL_ARB[jdK(o.k)]||'frondoso', mes=plMes(), nieve=plNieve();
  if(e.i===0){ plSemilla(c); return; }
  c.fillStyle='#8a5a36'; c.beginPath(); c.ellipse(0,-1,18,6,0,0,Math.PI*2); c.fill(); ol(c,1.6);
  if(e.i===1){ roundRect(c,7,-34,3,34,1); c.fillStyle='#c9a36a'; c.fill(); ol(c,1); plTallo(c,24,'#6b8f3a'); plHoja(c,0,-22,-2.5,0.8); plHoja(c,0,-22,-0.6,0.8); plHoja(c,0,-14,-2.9,0.6); return; }
  const tam=PL_TAM[e.i], sw=Math.sin(t*1.1+i)*1.5, sd=(i%7)+1, cy=-tam.h-tam.R*0.35+sw*0.3;
  c.save(); c.translate(sw*0.4,0);
  if(e.i===2){ roundRect(c,10,-46,3,46,1); c.fillStyle='#c9a36a'; c.fill(); ol(c,1); }
  if(esp==='palmera'){ c.beginPath(); c.moveTo(-tam.w*0.5,0); c.quadraticCurveTo(tam.w*0.4,-tam.h*0.5,tam.w*0.2,-tam.h-8); c.lineTo(tam.w*0.6+2,-tam.h-8); c.quadraticCurveTo(tam.w,-tam.h*0.5,tam.w*0.5,0); c.closePath(); c.fillStyle='#b98a55'; c.fill(); ol(c,2.2);
    c.strokeStyle='rgba(90,60,30,.5)'; c.lineWidth=1.5; for(let y=-8;y>-tam.h;y-=9){ c.beginPath(); c.moveTo(-tam.w*0.4+(-y/tam.h)*tam.w*0.6,y); c.lineTo(tam.w*0.4+(-y/tam.h)*tam.w*0.6,y-3); c.stroke(); }
    const tx=tam.w*0.4, ty=-tam.h-8; [-2.7,-2.1,-1.5,-0.9,-0.3,0.3].forEach((a,j)=>{ c.save(); c.translate(tx,ty); c.rotate(a+Math.sin(t*1.3+j)*0.04); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(tam.R*0.6,-tam.R*0.45,tam.R*1.25,tam.R*0.1); c.quadraticCurveTo(tam.R*0.6,-tam.R*0.05,0,0); c.fillStyle=j%2?'#4fa35a':'#5fb865'; c.fill(); ol(c,1.8); c.restore(); });
    if(e.i>=4){ [[-6,4],[4,6],[0,10]].slice(0,e.i===5?3:2).forEach(([dx,dy])=>{ c.beginPath(); c.arc(tx+dx,ty+dy,5,0,Math.PI*2); c.fillStyle='#7a4f2e'; c.fill(); ol(c,1.4); }); }
    c.restore(); return; }
  if(esp==='pino'){ plTronco(c,tam.h*0.35,tam.w*0.8,'#7a4f2e'); const pisos=e.i===2?2:e.i===3?3:4;
    for(let j=0;j<pisos;j++){ const base=-tam.h*0.3-j*tam.R*0.62, an=tam.R*(1.15-j*0.2); c.beginPath(); c.moveTo(-an,base); c.lineTo(0,base-tam.R*1.05); c.lineTo(an,base); c.quadraticCurveTo(0,base+8,-an,base); c.fillStyle=j%2?'#3f8f5a':'#4a9e63'; c.fill(); ol(c,2.2);
      if(nieve){ c.beginPath(); c.moveTo(-an*0.45,base-tam.R*0.58); c.lineTo(0,base-tam.R*1.05); c.lineTo(an*0.45,base-tam.R*0.58); c.quadraticCurveTo(0,base-tam.R*0.45,-an*0.45,base-tam.R*0.58); c.fillStyle='#fff'; c.fill(); } }
    if(e.i>=4){ for(let j=0;j<(e.i===5?5:3);j++){ c.beginPath(); c.ellipse(-tam.R*0.5+seeded(sd+j)*tam.R,-tam.h*0.45-seeded(sd*3+j)*tam.R*1.2,3.5,5,0,0,Math.PI*2); c.fillStyle='#8a5a36'; c.fill(); ol(c,1.2); } }
    c.restore(); return; }
  plTronco(c,tam.h,tam.w); const pts=plBolas(cy,tam.R,sd);
  let col='#5daa48', hi='rgba(255,255,255,.18)', desnudo=false;
  const mesFr=n=>e.i>=3?Math.round(n*(e.i-2)/3):0;
  if(esp==='frondoso'){ if(mes>=3&&mes<=5) col='#8fd16a'; else if(mes>=9&&mes<=11){ col='#e8913a'; pts.forEach((p,j)=>{ if(j%3===1) p.push('#d9622b'); }); } else if(mes===12||mes<=2) desnudo=true; }
  if(esp==='cerezo'){ if(mes>=3&&mes<=4){ col='#f6b8cf'; hi='rgba(255,255,255,.4)'; } else if(mes>=9&&mes<=11){ col='#d9622b'; pts.forEach((p,j)=>{ if(j%2) p.push('#c94a3a'); }); } else if(mes===12||mes<=2) desnudo=true; }
  if(esp==='naranjo') col='#4e9a43'; if(esp==='limonero') col='#5aa64a';
  if(esp==='arcoiris'){ const pal=['#e4574f','#f29b38','#f4c430','#55b05a','#4a8fdc','#a678d6']; pts.forEach((p,j)=>p.push(pal[(j+Math.floor(t*0.5))%pal.length])); hi='rgba(255,255,255,.3)'; }
  if(desnudo&&e.i>=2){ plRamas(c,cy,tam.R,nieve); if(!nieve){ c.fillStyle='#b98a55'; for(let j=0;j<4;j++){ c.beginPath(); c.arc(-tam.R*0.5+seeded(sd+j)*tam.R,cy-tam.R*0.4+seeded(sd+j*2)*tam.R*0.6,2.5,0,Math.PI*2); c.fill(); } } c.restore(); return; }
  plCopa(c,pts,col,hi);
  if(nieve){ c.fillStyle='#fff'; pts.slice(1).forEach(([x,y,r])=>{ if(y<cy){ c.beginPath(); c.ellipse(x,y-r*0.7,r*0.6,r*0.25,0,Math.PI,0); c.fill(); } }); }
  if(esp==='naranjo'){ if(mes>=4&&mes<=5) plFlores(c,pts,mesFr(9)+2,'#fffaf1',sd); if(mes>=11||mes<=3) plFrutos(c,pts,mesFr(9),'#f28c28',5,sd,true); else if(e.i>=3) plFrutos(c,pts,mesFr(5),'#8cc04a',3.5,sd); }
  if(esp==='limonero'){ if(mes>=3&&mes<=5) plFlores(c,pts,mesFr(6)+1,'#fffaf1',sd); plFrutos(c,pts,mesFr(mes>=6&&mes<=8?4:8),'#f4d23a',5,sd+3,true); }
  if(esp==='cerezo'){ if(mes>=3&&mes<=4) plFlores(c,pts,mesFr(10)+3,'#fde3ee',sd); if(mes>=5&&mes<=6) for(let j=0;j<mesFr(7);j++){ const p=pts[1+j%7]; c.strokeStyle=OUT; c.lineWidth=1.4; c.beginPath(); c.moveTo(p[0],p[1]-6); c.lineTo(p[0]-3,p[1]+2); c.moveTo(p[0],p[1]-6); c.lineTo(p[0]+4,p[1]+2); c.stroke(); [[-3,3],[4,3]].forEach(([dx,dy])=>{ c.beginPath(); c.arc(p[0]+dx,p[1]+dy,3.6,0,Math.PI*2); c.fillStyle='#d8243a'; c.fill(); ol(c,1.2); }); }
    if(mes>=3&&mes<=4) for(let j=0;j<4;j++){ const y=((t*18+j*37)%70), x=-tam.R+((seeded(j+sd)*2*tam.R+t*9)%(2*tam.R)); c.fillStyle='#f6b8cf'; c.beginPath(); c.ellipse(x,cy+y-10,2.6,1.6,t+j,0,Math.PI*2); c.fill(); } }
  if(esp==='frondoso'&&mes>=3&&mes<=5&&e.i>=3) plFlores(c,pts,mesFr(6)+1,'#fffaf1',sd);
  if(esp==='frondoso'&&mes>=9&&mes<=11) for(let j=0;j<3;j++){ const y=((t*20+j*43)%80); c.fillStyle=j%2?'#e8913a':'#d9622b'; c.beginPath(); c.ellipse(-tam.R*0.6+j*tam.R*0.5,cy+y,3,1.8,t*2+j,0,Math.PI*2); c.fill(); }
  if(esp==='arcoiris'&&e.i>=3) for(let j=0;j<4;j++){ const a=t*1.5+j*1.6, x=Math.cos(a)*tam.R*0.9, y=cy+Math.sin(a*1.3)*tam.R*0.6, s=2+Math.sin(t*4+j)*1.5; c.fillStyle='#fff'; c.beginPath(); c.moveTo(x,y-s*2); c.lineTo(x+s*0.6,y); c.lineTo(x,y+s*2); c.lineTo(x-s*0.6,y); c.closePath(); c.fill(); }
  c.restore(); }
/* Burbuja encima de la planta: abono que pide o agua de hoy */
function plBurbuja(c,o,alto,t){ const p=GD.p; if(!p||!GD.mine) return; const pide=o.pide, agua=false; if(!pide) return; // solo el abono: el riego se avisa con el botón
  const y=-alto-14+Math.sin(t*3)*2; c.beginPath(); c.arc(0,y,11,0,Math.PI*2); c.fillStyle='#fffaf1'; c.fill(); c.strokeStyle=pide?'#8a5a36':'#4a8fdc'; c.lineWidth=2.4; c.stroke();
  if(pide){ c.beginPath(); c.moveTo(-6,y+7); c.lineTo(-5,y-3); c.lineTo(-3,y-6); c.lineTo(3,y-6); c.lineTo(5,y-3); c.lineTo(6,y+7); c.closePath(); c.fillStyle='#c9a36a'; c.fill(); ol(c,1.2); c.fillStyle='#55b05a'; c.beginPath(); c.arc(0,y+1,2,0,Math.PI*2); c.fill(); }
  else { c.beginPath(); c.moveTo(0,y-7); c.quadraticCurveTo(6,y+1,0,y+6); c.quadraticCurveTo(-6,y+1,0,y-7); c.fillStyle='#6cb8f0'; c.fill(); ol(c,1.2); } }
function plAlto(o){ const e=plEtapa(o); if(!e) return 0; const t=plTipo(o.k); if(t==='arbol') return [10,36,80,124,148,171][e.i]; if(t==='cactus') return [10,16,34,52][e.i]; const F=PL_FLOR[jdK(o.k)]||{h:32}; return Math.round([10,18,F.h,F.h+14][e.i]*1.15); }
function plDibuja(c,o,x,y,t,esc,i,fant){ const e=plEtapa(o); c.save(); c.translate(x,y); if(esc&&esc!==1) c.scale(esc,esc); if(o.gi) c.scale(-1,1);
  if(!fant&&!(esc<0.8)){ c.fillStyle='rgba(40,60,20,.2)'; c.beginPath(); c.ellipse(0,2,plTipo(o.k)==='arbol'&&e.i>=3?40:18,6,0,0,Math.PI*2); c.fill(); }
  const tp=plTipo(o.k); if(tp==='arbol') plArbol(c,o,e,t,i||0); else { c.save(); c.scale(1.15,1.15); if(tp==='cactus') plCactus(c,o,e,t); else plFlor(c,o,e,t,i||0); c.restore(); }
  if(!fant&&!(esc<0.8)){ if(o.gi) c.scale(-1,1); plBurbuja(c,o,plAlto(o),t); }
  c.restore(); }
