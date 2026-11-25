"use strict";
/* =========================================================
   JARDÍN DE CÉSPED (desde el 25 nov 2026)
   ---------------------------------------------------------
   14 columnas × (2 × p.gardenRows) filas: 8 de inicio; con las ampliaciones de la tienda, 10 y 12.
   Cada cosa ocupa su tamaño (JARDIN_TAM, o s.tam en SHOP: [ancho, alto] en casillas) y los caminos van debajo.
   Lo que se guarda en p.jardin:
     cel:  en la casilla de arriba a la izquierda de cada cosa: {k, g, need, gi:1 si está dado la vuelta}
           (g y need = riegos hechos y necesarios, como en el jardín de antes)
     cam:  caminos (una baldosa por casilla): 'sh_cam_piedra'…
     aviso, ampliado: aviso del jardín nuevo (una vez); huella: lo que había en p.garden al pasar
   p.garden (la cuadrícula de 8 de antes) no se toca nunca: jardinNuevo() la pasa una vez desde migrate()
   y jardinReconcilia() recoge lo que cambie una tablet con la versión antigua.
   ========================================================= */
const JD={C:14,cs:58,gx:44,gy:150};
const JARDIN_TAM={'pl_🌳':[2,2],'pl_🌲':[2,2],'pl_🌴':[2,2],L1:[2,2],L2:[2,2],L3:[2,2],M:[2,2],
  sh_banco:[2,1],sh_fuente:[2,2],sh_caseta:[3,2],sh_tienda:[3,2],sh_tiovivo:[3,3],sh_noria:[3,3],
  sh_nav_abeto:[2,2],sh_nav_trineo:[2,1]};
function jdK(k){ return k&&k.startsWith('gw:')?k.slice(3):k; }
function jdShop(k){ k=jdK(k); return k&&k.startsWith('sh_')?SHOP.find(x=>'sh_'+x.k===k):null; }
function jdTam(k){ const s=jdShop(k); return (s&&s.tam)||JARDIN_TAM[jdK(k)]||[1,1]; }
function jdEsCamino(k){ const s=jdShop(k); return !!(s&&s.camino); }
function jdF(p){ return 2*(p.gardenRows||4); }
function jdIni(p){ const J=p.jardin, n=JD.C*jdF(p); J.cel=J.cel||[]; J.cam=J.cam||[]; J.aviso=J.aviso||[];
  while(J.cel.length<n) J.cel.push(null); while(J.cam.length<n) J.cam.push(null); }
function jdPlantas(p){ return p.jardin?p.jardin.cel.filter(Boolean):[]; }
function jdTiene(p,k){ return !!p.jardin&&(p.jardin.cel.some(o=>o&&o.k===k)||p.jardin.cam.includes(k)); }
/* Qué casilla tapa cada cosa: m[casilla] = casilla de arriba a la izquierda de la cosa (o -1) */
function jdMapa(p,sin){ const F=jdF(p), m=Array(JD.C*F).fill(-1);
  p.jardin.cel.forEach((o,i)=>{ if(!o||i===sin) return; const [w,h]=jdTam(o.k), r=Math.floor(i/JD.C), c=i%JD.C;
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(r+y<F&&c+x<JD.C) m[(r+y)*JD.C+c+x]=i; }); return m; }
function jdCabe(p,m,r,c,w,h){ if(r<0||c<0||r+h>jdF(p)||c+w>JD.C) return false;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(m[(r+y)*JD.C+c+x]>=0) return false; return true; }
/* Dónde se pone algo de w×h si se toca la casilla (r,c): lo más centrado posible sobre ella */
function jdAncla(p,m,r,c,w,h){ const r0=r-Math.floor((h-1)/2), c0=c-Math.floor((w-1)/2), cand=[];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) cand.push([r-y,c-x]);
  cand.sort((a,b)=>(Math.abs(a[0]-r0)+Math.abs(a[1]-c0))-(Math.abs(b[0]-r0)+Math.abs(b[1]-c0)));
  for(const [a,b] of cand) if(jdCabe(p,m,a,b,w,h)) return [a,b]; return null; }
function jdPonCerca(p,o,r0,c0){ const [w,h]=jdTam(o.k), F=jdF(p), m=jdMapa(p); let best=null, bd=1e9;
  for(let r=0;r+h<=F;r++) for(let c=0;c+w<=JD.C;c++){ const d=Math.abs(r+(h-1)/2-r0)*1.3+Math.abs(c+(w-1)/2-c0); if(d<bd&&jdCabe(p,m,r,c,w,h)){ bd=d; best=[r,c]; } }
  if(!best) return false; p.jardin.cel[best[0]*JD.C+best[1]]=o; return true; }
function jdHuella(g){ return g.filter(o=>o&&o.k).map(o=>o.k).sort().join('|'); }
function jdACesta(p,o){ const key=plTipo(o.k)&&!plPremio(o.k)&&plCrecida(o)?'gw:'+o.k:o.k; p.inv[key]=(p.inv[key]||0)+1; }
/* Paso del jardín de 8 columnas al de césped (una sola vez, desde migrate). Cada cosa va lo más cerca posible de donde estaba, primero las grandes. */
function jardinNuevo(p){ if(p.jardin){ jdIni(p); return; }
  p.jardin={}; jdIni(p); p.inv=p.inv||{};
  const g=Array.isArray(p.garden)?p.garden:[], lista=g.map((o,i)=>({o,i})).filter(x=>x.o&&x.o.k);
  lista.sort((a,b)=>{ const A=jdTam(a.o.k), B=jdTam(b.o.k); return B[0]*B[1]-A[0]*A[1]||a.i-b.i; });
  lista.forEach(({o,i})=>{ const n={k:o.k,g:o.g||0,need:o.need||0};
    if(!jdPonCerca(p,n,Math.floor(i/8)*2+0.5,((i%8)+0.5)*JD.C/8-0.5)){ jdACesta(p,n); p.jardin.aviso.push(n.k); } });
  p.jardin.ampliado=lista.length?1:2; p.jardin.huella=jdHuella(g); }
function jardinReconcilia(p){ const J=p.jardin; if(!J) return; const g=Array.isArray(p.garden)?p.garden:[], h=jdHuella(g); if(h===J.huella) return;
  const cnt=s=>(s||'').split('|').filter(Boolean).reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{}), A=cnt(J.huella), B=cnt(h);
  for(const k of new Set(Object.keys(A).concat(Object.keys(B)))){ let d=(B[k]||0)-(A[k]||0);
    while(d>0){ d--; const o=g.find(x=>x&&x.k===k)||{}; const n={k,g:o.g||0,need:o.need||0}; if(!jdPonCerca(p,n,jdF(p)-1,JD.C/2)){ jdACesta(p,n); J.aviso.push(k); } } // lo plantó la versión de antes
    while(d<0){ d++; const i=J.cel.findIndex(x=>x&&x.k===k); if(i<0) break; J.cel[i]=null; } } // lo quitó la versión de antes (ya está en la cesta)
  J.huella=h; }
/* Dibujo */
function jdPie(r,c,w,h){ return {x:JD.gx+(c+w/2)*JD.cs, y:JD.gy+(r+h)*JD.cs-6}; }
function jdTalla(k){ return JD.cs*Math.min(...jdTam(k))*1.05; }
function jdAlto(o){ return plTipo(o.k)?plAlto(o):(JD_ALTO[jdK(o.k)]||jdTalla(o.k)); }
function jdDibuja(c,o,x,y,t,i,fant){ // plantas: jardin-plantas.js; lo demás y lo colgado: jardin-objetos.js
  if(plTipo(o.k)) plDibuja(c,o,x,y,t,1,i,fant); else jdObjeto(c,o,x,y,t,1,i,fant);
  if(!fant) jdEncima(c,o,x,y,t,1,i); }
function jdCamino(c,k,x,y,i){ const cs=JD.cs;
  if(jdK(k)==='sh_cam_baldosa'){ roundRect(c,x+3,y+3,cs-6,cs-6,8); c.fillStyle=i%2?'#e0a77a':'#d9996a'; c.fill(); ol(c,1.6); c.fillStyle='rgba(255,255,255,.2)'; c.fillRect(x+8,y+7,cs-16,4); return; }
  c.fillStyle='rgba(70,90,40,.18)'; c.fillRect(x+2,y+2,cs-4,cs-4);
  [[0.3,0.3,13],[0.72,0.32,10],[0.5,0.7,14],[0.18,0.75,8],[0.84,0.76,8]].forEach(([a,b,r],j)=>{ c.beginPath(); c.ellipse(x+a*cs,y+b*cs,r*(0.9+seeded(i*7+j)*0.3),r*0.75,0,0,Math.PI*2); c.fillStyle=j%2?'#c9c3b6':'#d8d2c4'; c.fill(); ol(c,1.4); }); }
/* Lo que pasaría al soltar k en (x,y): {r,c} o null */
/* m = jdMapa (sin la cosa que se está moviendo) */
function jdIntento(p,m,k,x,y){ const va=jdVa(k); if(va.includes('colgar')||va.includes('encima')){ const s=jdSitioLibre(p,k,x,y); if(s) return s; if(!va.includes('suelo')) return null; } const r=Math.floor((y-JD.gy)/JD.cs), c=Math.floor((x-JD.gx)/JD.cs); if(r<0||c<0||r>=jdF(p)||c>=JD.C) return null;
  if(jdEsCamino(k)) return p.jardin.cam[r*JD.C+c]?null:{r,c};
  const [w,h]=jdTam(k), a=jdAncla(p,m,r,c,w,h); return a?{r:a[0],c:a[1]}:null; }
/* ¿Qué hay en (x,y)? La cosa de más delante cuyo dibujo contiene el punto. */
function jdToca(p,x,y){ let best=null;
  p.jardin.cel.forEach((o,i)=>{ if(!o) return; const [w,h]=jdTam(o.k), r=Math.floor(i/JD.C), c=i%JD.C, pie=jdPie(r,c,w,h), x0=JD.gx+c*JD.cs;
    const alto=Math.max(JD.cs*0.8,jdAlto(o)); if(x<x0||x>x0+w*JD.cs||y>pie.y+10||y<Math.min(pie.y-alto,JD.gy+r*JD.cs)) return;
    let top=-1; const S=jdSitios(o); (o.en||[]).forEach((k2,j)=>{ const st=S[j]; if(!k2||!st) return; const sx=pie.x+(o.gi?-1:1)*st.x, sy=pie.y+st.y+(st.tipo==='colgar'?18:-8); if(Math.hypot(x-sx,y-sy)<24) top=j; });
    if(!best||top>=0&&best.top<0||(top>=0)===(best.top>=0)&&pie.y>best.y) best={i,o,y:pie.y,x:pie.x,top}; }); return best; }
/* Sitio libre más cercano a (x,y) para colgar o poner encima k (o null) */
function jdSitioLibre(p,k,x,y){ const va=jdVa(k); let best=null, bd=46;
  p.jardin.cel.forEach((o,i)=>{ if(!o) return; const [w,h]=jdTam(o.k), pie=jdPie(Math.floor(i/JD.C),i%JD.C,w,h);
    jdSitios(o).forEach((st,j)=>{ if(!va.includes(st.tipo)||(o.en&&o.en[j])||(jdK(k)==='sh_columpio'&&j>1)) return; const d=Math.hypot(x-(pie.x+(o.gi?-1:1)*st.x),y-(pie.y+st.y+12)); if(d<bd){ bd=d; best={tipo:'sitio',i,j}; } }); });
  return best; }
function jdGuia(c,p,k,t,sin){ const m=jdMapa(p,sin), a=0.5+Math.sin(t*5)*0.2, cam=jdEsCamino(k), [w,h]=jdTam(k), va=jdVa(k);
  if(va.includes('colgar')||va.includes('encima')) p.jardin.cel.forEach((o,i)=>{ if(!o) return; const [ow,oh]=jdTam(o.k), pie=jdPie(Math.floor(i/JD.C),i%JD.C,ow,oh);
    jdSitios(o).forEach((st,j)=>{ if(!va.includes(st.tipo)||(o.en&&o.en[j])||(jdK(k)==='sh_columpio'&&j>1)) return; c.beginPath(); c.arc(pie.x+(o.gi?-1:1)*st.x,pie.y+st.y+4,9+Math.sin(t*5)*2,0,Math.PI*2); c.fillStyle='rgba(110,210,110,.85)'; c.fill(); c.strokeStyle='#fff'; c.lineWidth=2.5; c.stroke(); }); });
  if(!va.includes('suelo')) return;
  for(let r=0;r<jdF(p);r++) for(let col=0;col<JD.C;col++){ const ok=cam?!p.jardin.cam[r*JD.C+col]:!!jdAncla(p,m,r,col,w,h), x=JD.gx+col*JD.cs, y=JD.gy+r*JD.cs;
    roundRect(c,x+3,y+3,JD.cs-6,JD.cs-6,8); c.fillStyle=ok?`rgba(150,240,120,${(0.25*a+0.1).toFixed(3)})`:'rgba(225,60,50,.15)'; c.fill();
    if(ok){ c.strokeStyle=`rgba(255,255,255,${a.toFixed(3)})`; c.lineWidth=2; c.setLineDash([5,4]); c.stroke(); c.setLineDash([]); } } }
function jdCosas(c,p,t){ const J=p.jardin, out=[];
  J.cam.forEach((k,i)=>{ if(k) jdCamino(c,k,JD.gx+(i%JD.C)*JD.cs,JD.gy+Math.floor(i/JD.C)*JD.cs,i); });
  return J.cel.map((o,i)=>{ if(!o) return null; const [w,h]=jdTam(o.k), pie=jdPie(Math.floor(i/JD.C),i%JD.C,w,h); return {y:pie.y,d:()=>jdDibuja(c,o,pie.x,pie.y,t,i)}; }).filter(Boolean); }
function jdFantasma(c,p,k,t,sin){ const fa=GD.fantasma; if(!fa) return; const res=jdIntento(p,jdMapa(p,sin),k,fa.x,fa.y);
  c.save(); if(!res){ c.globalAlpha=0.85; c.strokeStyle='#e4574f'; c.lineWidth=5; c.beginPath(); c.moveTo(fa.x-12,fa.y-12); c.lineTo(fa.x+12,fa.y+12); c.moveTo(fa.x+12,fa.y-12); c.lineTo(fa.x-12,fa.y+12); c.stroke(); c.restore(); return; }
  c.globalAlpha=0.6; if(res.tipo==='sitio'){ const o=p.jardin.cel[res.i], [w,h]=jdTam(o.k), pie=jdPie(Math.floor(res.i/JD.C),res.i%JD.C,w,h), st=jdSitios(o)[res.j]; c.translate(pie.x+(o.gi?-1:1)*st.x,pie.y+st.y); JD_COLG._suelo=st.y; const f=JD_COLG[jdK(k)]; if(f) f(c,t,0); c.restore(); return; }
  if(jdEsCamino(k)) jdCamino(c,k,JD.gx+res.c*JD.cs,JD.gy+res.r*JD.cs,0);
  else { const [w,h]=jdTam(k), pie=jdPie(res.r,res.c,w,h), o=sin!=null&&p.jardin.cel[sin]?p.jardin.cel[sin]:plTipo(k)?plNueva(k,k.startsWith('gw:')):{k}; jdDibuja(c,o,pie.x,pie.y,t,0,true); }
  c.restore(); }
/* Toques en el jardín. Tocar algo lo coge (GD.mano = su casilla): al tocar otro sitio se mueve con todo lo que ha crecido;
   «Guardar en la cesta» lo guarda (las plantas a medio crecer y los árboles ya mayores no caben en la cesta). */
function jdSoltar(){ GD.mano=null; GD.fantasma=null; }
function jdPuedeCesta(o){ return !plTipo(o.k)||plPremio(o.k)||(plCrecida(o)&&!(plTipo(o.k)==='arbol'&&plRiegos(o)>30)); }
function jdGuarda(p){ const i=GD.mano, o=i!=null&&p.jardin.cel[i]; if(!o) return; if(!jdPuedeCesta(o)){ toast(plCrecida(o)?'Este árbol ya es muy grande para la cesta. ¡Muévelo a otro sitio!':'🌱 Está creciendo: no cabe en la cesta. ¡Muévela a otro sitio!'); return; }
  p.jardin.cel[i]=null; jdACesta(p,o); (o.en||[]).forEach(k2=>{ if(k2) p.inv[k2]=(p.inv[k2]||0)+1; }); jdSoltar(); beep(350,0.05); save(); renderHouse(); }
function jardinClick(x,y){ const p=GD.p, J=p.jardin; if(!GD.mine){ toast('Este jardín no es tuyo 😊'); return; }
  const r=Math.floor((y-JD.gy)/JD.cs), col=Math.floor((x-JD.gx)/JD.cs), dentro=r>=0&&r<jdF(p)&&col>=0&&col<JD.C, h=jdToca(p,x,y);
  if(GD.girar){ if(h){ h.o.gi=h.o.gi?0:1; beep(620,0.05); save(); } else toast('Toca algo del jardín para darle la vuelta'); return; }
  if(GD.mano!=null&&J.cel[GD.mano]){ const o=J.cel[GD.mano];
    if(h&&h.i===GD.mano){ jdSoltar(); renderHouse(); return; }
    const res=jdIntento(p,jdMapa(p,GD.mano),o.k,x,y); if(!res){ toast(dentro?'Ahí no cabe. ¡Busca un hueco verde!':'Toca dentro de la valla'); return; }
    J.cel[GD.mano]=null; J.cel[res.r*JD.C+res.c]=o; jdSoltar(); beep(760,0.07,'triangle'); save(); renderHouse(); return; }
  if(invSel&&p.inv[invSel]>0&&!invSel.startsWith('fu_')){
    const res=jdIntento(p,jdMapa(p),invSel,x,y); if(!res){ toast(dentro?'Ahí no cabe. ¡Busca un hueco verde!':'Toca dentro de la valla'); return; }
    if(res.tipo==='sitio'){ const o=J.cel[res.i]; o.en=o.en||[]; o.en[res.j]=jdK(invSel); }
    else if(jdEsCamino(invSel)){ J.cam[res.r*JD.C+res.c]=invSel; }
    else { const k=jdK(invSel), [w,hh]=jdTam(k); J.cel[res.r*JD.C+res.c]=plTipo(k)?plNueva(invSel,invSel.startsWith('gw:')):{k,g:0,need:0}; const pie=jdPie(res.r,res.c,w,hh); GD.spark.push({x:pie.x,y:pie.y-20,t:0}); }
    p.inv[invSel]--; if(!p.inv[invSel]){ delete p.inv[invSel]; invSel=null; } GD.fantasma=null;
    beep(760,0.07,'triangle'); save(); renderHouse(); return; }
  if(h&&h.top>=0){ const k2=h.o.en[h.top]; if(k2==='sh_campanilla'){ jdSuena(); toast('🎐 ¡Tilín, tilín! Para quitarla, toca el árbol y «Quitar lo colgado».',2400); return; }
    h.o.en[h.top]=null; p.inv[k2]=(p.inv[k2]||0)+1; beep(350,0.05); save(); renderHouse(); return; }
  if(h){ GD.mano=h.i; beep(600,0.04); renderHouse(); toast(plTipo(h.o.k)?plInfo(h.o)+'. Toca otro sitio para moverla.':itemInfo(h.o.k).n+': toca otro sitio para moverlo.',2600); return; }
  if(dentro&&J.cam[r*JD.C+col]){ const k=J.cam[r*JD.C+col]; J.cam[r*JD.C+col]=null; p.inv[k]=(p.inv[k]||0)+1; beep(350,0.05); save(); renderHouse(); return; }
  toast('Elige algo de tu cesta y toca un hueco del jardín'); }
/* Aviso del jardín nuevo, una vez */
function jardinAviso(p){ const J=p.jardin; if(VISIT||!J||!(J.ampliado===1||J.aviso.length)) return;
  const cuenta={}; J.aviso.forEach(k=>{ cuenta[k]=(cuenta[k]||0)+1; }); const fuera=Object.entries(cuenta).map(([k,n])=>(n>1?n+' × ':'')+'«'+itemInfo(k).n+'»'), nuevo=J.ampliado===1;
  J.ampliado=2; J.aviso=[]; save();
  setTimeout(()=>say({face:'🌳',name:'¡Jardín nuevo!',text:(nuevo?'¡Tu jardín ahora es de césped y mucho más grande! Los árboles, la fuente o la noria ocupan su sitio de verdad. ':'')+(fuera.length?`No todo cabía: ${fuera.join(', ')} ${fuera.length>1?'están':'está'} en tu cesta. `:'')+(nuevo?'En la tienda hay caminos de piedras y baldosas para decorarlo.':'')}),350); }
/* Quita lo colgado o lo que hay encima de lo que se está moviendo y lo devuelve a la cesta */
function jdQuitaEncima(p){ const o=GD.mano!=null&&p.jardin.cel[GD.mano]; if(!o||!o.en) return; o.en.forEach((k2,j)=>{ if(k2){ p.inv[k2]=(p.inv[k2]||0)+1; o.en[j]=null; } }); beep(350,0.05); save(); renderHouse(); }
/* Condiciones para que salgan en la tienda las cosas de colgar (s.cond) */
function jdCond(p,s){ const ar=jdPlantas(p).filter(o=>plTipo(o.k)==='arbol').map(o=>plEtapa(o).i), fl=jdPlantas(p).filter(o=>plTipo(o.k)==='flor'&&plCrecida(o)).length;
  if(s.cond==='joven'&&!ar.some(i=>i>=3)) return 'Cuando tengas un árbol joven (30 riegos)';
  if(s.cond==='adulto'&&!ar.some(i=>i>=4)) return 'Cuando tengas un árbol adulto (45 riegos)';
  if(s.cond==='flores'&&fl<5) return `Cuando tengas 5 flores crecidas (tienes ${fl})`;
  return null; }
