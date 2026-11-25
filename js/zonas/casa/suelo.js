"use strict";
/* =========================================================
   SUELO DE LA CASA: 10×4 casillas (desde el 25 nov 2026)
   ---------------------------------------------------------
   Los muebles ocupan su tamaño de verdad (la cama y el sofá, 2 casillas) y las cosas pequeñas
   (osito, planta…) se pueden apoyar encima de la cama, la mesa, el sofá, el piano o la estantería.

   Lo que se guarda en p.room (además de lo de siempre):
     suelo: Array(40)  en la casilla de la izquierda de cada mueble: {k, g:1 si está dado la vuelta, en:[k|null…] lo que tiene encima}
     alf:   Array(40)  alfombras (van debajo de los muebles), en su casilla de la izquierda: 'fu_…'
     aviso: [k…]       muebles que no cupieron y están en la cesta (se avisa una vez y se vacía)
     ampliada: 1       hay que contarle que la casa es nueva (2 = ya se le ha contado)
     flHuella:         texto de fl tal como estaba al pasar a la casa nueva
   fl (la casa de antes, 8×3) NO se toca nunca. Si otra tablet con una versión antigua cambia fl,
   casaReconcilia() pasa ese cambio a la casa nueva sin perder ni duplicar nada.
   El tamaño de cada mueble está en MUEBLE_TAM (js/zonas/casa/muebles.js) o en f.tam.
   ========================================================= */
const SU={C:10,F:4,filas:[[350,408,402],[408,468,462],[468,530,524],[530,598,592]],luces:[]};
function muTam(f){ return Object.assign({w:1,t:1},(f&&typeof MUEBLE_TAM!=='undefined'&&MUEBLE_TAM[f.k])||{},(f&&f.tam)||{}); }
function muAlto(tm){ return tm.h||58*tm.t+6; }
function suW(k){ return muTam(furn(k)).w; }
function esAlf(f){ return !!(f&&(f.draw==='rug'||muTam(f).alf)); }
function capaDe(R,f){ return esAlf(f)?R.alf:R.suelo; }
function suK(o){ return o&&(typeof o==='string'?o:o.k); }
/* Geometría: cada fila se abre hacia delante, como el suelo */
function suFila(r){ const [y0,y1,by]=SU.filas[r], [l,rr]=roomBordes(by), cw=(rr-l)/SU.C; return {y0,y1,by,l,cw,s:cw/76}; }
function suCentro(r,c,w){ const F=suFila(r); return {x:F.l+(c+w/2)*F.cw,y:F.by,s:F.s,cw:F.cw}; }
function suCelda(x,y){ const r=SU.filas.findIndex(f=>y>=f[0]&&y<f[1]); if(r<0) return null;
  const [l,rr]=roomBordes(y), c=Math.floor((x-l)/((rr-l)/SU.C)); if(c<0||c>=SU.C) return null; return {r,c,i:r*SU.C+c}; }
/* Qué casilla tapa cada cosa: m[casilla] = casilla de la izquierda del mueble que la ocupa (o -1) */
function suMapa(arr){ const m=Array(40).fill(-1);
  arr.forEach((o,i)=>{ const k=suK(o); if(!k) return; const w=suW(k), r=Math.floor(i/10), c=i%10; for(let j=0;j<w&&c+j<10;j++) m[r*10+c+j]=i; }); return m; }
function suCabe(arr,r,c,w){ if(c<0||c+w>10) return false; const m=suMapa(arr); for(let j=0;j<w;j++) if(m[r*10+c+j]>=0) return false; return true; }
/* Dónde se pone algo de ancho w si se toca la casilla (r,c): centrado si se puede, si no, corrido a un lado */
function suAncla(arr,r,c,w){ const ord=[c-Math.floor((w-1)/2)]; for(let d=0;d<w;d++) ord.push(c-d); for(const a of ord) if(suCabe(arr,r,a,w)) return a; return -1; }
/* Pone k lo más cerca posible de (fila r0, columna c0). Devuelve false si no cabe en ningún sitio. */
function casaPonCerca(R,k,r0,c0){ const f=furn(k), w=muTam(f).w, arr=capaDe(R,f);
  const filas=[0,1,2,3].sort((a,b)=>Math.abs(a-r0)-Math.abs(b-r0)||b-a);
  for(const r of filas){ const cs=[...Array(11-w).keys()].sort((a,b)=>Math.abs(a+(w-1)/2-c0)-Math.abs(b+(w-1)/2-c0));
    for(const a of cs) if(suCabe(arr,r,a,w)){ arr[r*10+a]=esAlf(f)?k:{k}; return true; } }
  return false; }
function casaPon(p,k){ return casaPonCerca(roomOf(p),k,3,5); }
/* Quita una unidad de k de la casa nueva. Devuelve lo que hay que devolver a la cesta (k y lo que tuviera encima) o null si no estaba. */
function casaQuitaUno(R,k){
  for(const o of R.suelo) if(o&&o.en){ const j=o.en.indexOf(k); if(j>=0){ o.en[j]=null; return [k]; } }
  let i=R.suelo.findIndex(o=>o&&o.k===k); if(i>=0){ const o=R.suelo[i]; R.suelo[i]=null; return [k].concat((o.en||[]).filter(Boolean)); }
  i=R.alf.indexOf(k); if(i>=0){ R.alf[i]=null; return [k]; }
  return null; }
function casaTiene(R,k){ return R.suelo.some(o=>o&&(o.k===k||(o.en||[]).includes(k)))||R.alf.includes(k)||R.wl.includes(k); }
function casaCuenta(R){ if(!R) return 0; const s=R.suelo||[], a=R.alf||[];
  return s.reduce((n,o)=>n+(o?1+(o.en||[]).filter(Boolean).length:0),0)+a.filter(Boolean).length+(R.wl||[]).filter(Boolean).length; }
/* Paso de la casa de 8×3 a la de 10×4 (una sola vez, desde migrate). Las 3 filas de antes van a las filas 1, 3 y 4
   (la 2 queda libre para moverse). Primero los muebles grandes; lo que no cabe va a la cesta y se le avisa. */
function casaNueva(p){ const R=p.room; if(!R||R.suelo) return;
  R.suelo=Array(40).fill(null); R.alf=Array(40).fill(null); R.aviso=[];
  const fl=Array.isArray(R.fl)?R.fl:[], lista=fl.map((k,i)=>({k,i})).filter(o=>o.k&&furn(o.k));
  lista.sort((a,b)=>suW(b.k)-suW(a.k)||a.i-b.i);
  lista.forEach(({k,i})=>{ const r0=[0,2,3][Math.min(2,Math.floor(i/8))], F=suFila(r0), x=40+(i%8)*90+45, c0=Math.max(0,Math.min(9,Math.floor((x-F.l)/F.cw)));
    if(!casaPonCerca(R,k,r0,c0)){ p.inv=p.inv||{}; p.inv[k]=(p.inv[k]||0)+1; R.aviso.push(k); } });
  R.ampliada=lista.length?1:2; R.flHuella=JSON.stringify(fl); }
function casaReconcilia(p){ const R=p.room; if(!R||!R.suelo) return;
  const fl=Array.isArray(R.fl)?R.fl:[], h=JSON.stringify(fl); if(h===R.flHuella) return;
  let antes=[]; try{ antes=JSON.parse(R.flHuella||'[]')||[]; }catch(e){}
  const cuenta=a=>a.reduce((m,k)=>{ if(k) m[k]=(m[k]||0)+1; return m; },{}), A=cuenta(antes), B=cuenta(fl);
  p.inv=p.inv||{};
  for(const k of new Set(Object.keys(A).concat(Object.keys(B)))){ let d=(B[k]||0)-(A[k]||0);
    while(d>0){ d--; if(!furn(k)||!casaPonCerca(R,k,3,5)){ p.inv[k]=(p.inv[k]||0)+1; R.aviso.push(k); } } // lo puso la versión de antes: ya no está en la cesta
    while(d<0){ d++; const v=casaQuitaUno(R,k); if(!v) break; v.slice(1).forEach(x=>{ p.inv[x]=(p.inv[x]||0)+1; }); } } // lo devolvió a la cesta la versión de antes
  R.flHuella=h; }
/* ¿Qué mueble hay en (x,y)? El de más delante cuyo dibujo contiene el punto. top = la cosa de encima tocada (o -1). */
function suToca(R,x,y){ let best=null;
  R.suelo.forEach((o,i)=>{ if(!o) return; const f=furn(o.k); if(!f) return; const tm=muTam(f), {x:cx,y:by,s,cw}=suCentro(Math.floor(i/10),i%10,tm.w);
    const half=tm.w*cw/2, top=by-muAlto(tm)*s; if(x<cx-half||x>cx+half||y<top-10*s||y>by+8) return;
    let j=-1; (o.en||[]).forEach((k2,jj)=>{ const ap=(tm.apoyo||[])[jj]; if(!k2||!ap) return; const ax=cx+(o.g?-1:1)*ap[0]*s, ay=by+ap[1]*s; if(Math.hypot(x-ax,y-(ay-18*s))<30*s) j=jj; });
    if(!best||by>best.y||j>=0&&best.top<0) best={i,o,f,tm,x:cx,y:by,s,top:j}; });
  return best; }
/* Lo que pasaría al soltar sel en (x,y): encima de un mueble, en el suelo o nada */
function suIntento(R,sel,x,y){ const tm=muTam(sel);
  if(tm.sobre){ const h=suToca(R,x,y); if(h){ const ap=h.tm.apoyo||[], en=h.o.en||[]; let j=-1, dj=1e9;
      ap.forEach((a,jj)=>{ if(en[jj]) return; const d=Math.abs(h.x+(h.o.g?-1:1)*a[0]*h.s-x); if(d<dj){ dj=d; j=jj; } });
      if(j>=0) return {tipo:'encima',i:h.i,j}; } }
  const cel=suCelda(x,y); if(!cel) return null; const a=suAncla(capaDe(R,sel),cel.r,cel.c,tm.w);
  return a<0?null:{tipo:'suelo',r:cel.r,a}; }
function suPoligono(c,r,c0,w){ const [y0,y1]=SU.filas[r], [l0,r0]=roomBordes(y0+2), [l1,r1]=roomBordes(y1-2), k0=(r0-l0)/10, k1=(r1-l1)/10;
  c.beginPath(); c.moveTo(l0+c0*k0+3,y0+3); c.lineTo(l0+(c0+w)*k0-3,y0+3); c.lineTo(l1+(c0+w)*k1-3,y1-3); c.lineTo(l1+c0*k1+3,y1-3); c.closePath(); }
/* Guía al elegir un mueble: casillas en verde donde cabe, en rojo donde no; puntos verdes donde se puede apoyar */
function suGuia(c,R,sel,t){ const tm=muTam(sel), arr=capaDe(R,sel), a=0.5+Math.sin(t*5)*0.2;
  for(let r=0;r<4;r++) for(let col=0;col<10;col++){ const ok=suAncla(arr,r,col,tm.w)>=0; suPoligono(c,r,col,1);
    c.fillStyle=ok?`rgba(120,230,110,${(0.3*a+0.12).toFixed(3)})`:'rgba(225,60,50,.13)'; c.fill();
    if(ok){ c.strokeStyle=`rgba(255,255,255,${a})`; c.lineWidth=2; c.setLineDash([6,5]); c.stroke(); c.setLineDash([]); } }
  if(tm.sobre) R.suelo.forEach((o,i)=>{ if(!o) return; const t2=muTam(furn(o.k)); if(!t2.apoyo) return; const {x,y,s}=suCentro(Math.floor(i/10),i%10,t2.w);
    t2.apoyo.forEach((ap,j)=>{ if(o.en&&o.en[j]) return; c.beginPath(); c.arc(x+(o.g?-1:1)*ap[0]*s,y+ap[1]*s-4,9*s+Math.sin(t*5)*2,0,Math.PI*2); c.fillStyle='rgba(110,210,110,.75)'; c.fill(); c.strokeStyle='#fff'; c.lineWidth=2.5; c.stroke(); }); });
}
/* Alfombras ya dibujadas; devuelve los muebles (con lo de encima) para ordenarlos con la gente, de atrás hacia delante */
function suCosas(c,R,p,t){
  SU.luces=[];
  R.alf.forEach((k,i)=>{ const f=k&&furn(k); if(!f) return; const w=muTam(f).w, {x,y,s}=suCentro(Math.floor(i/10),i%10,w); drawFurn(c,f,x,y,s,t,{w}); });
  const out=[];
  R.suelo.forEach((o,i)=>{ const f=o&&furn(o.k); if(!f) return; const tm=muTam(f), {x,y,s}=suCentro(Math.floor(i/10),i%10,tm.w);
    if(tm.luz) SU.luces.push([x,y-tm.luz*s,s]);
    out.push({y,d:()=>{ drawFurn(c,f,x,y,s,t,{w:tm.w,g:o.g,col:p.color});
      (o.en||[]).forEach((k2,j)=>{ const f2=k2&&furn(k2), ap=(tm.apoyo||[])[j]; if(!f2||!ap) return; drawFurn(c,f2,x+(o.g?-1:1)*ap[0]*s,y+ap[1]*s,s*0.8,t,{encima:1}); }); }}); });
  return out; }
/* Silueta del mueble elegido donde está el dedo o el ratón */
function suFantasma(c,R,sel,p,t){ const fa=GD.fantasma; if(!fa) return; const res=suIntento(R,sel,fa.x,fa.y);
  c.save(); c.globalAlpha=0.55;
  if(!res){ c.globalAlpha=0.8; c.strokeStyle='#e4574f'; c.lineWidth=5; c.beginPath(); c.moveTo(fa.x-12,fa.y-12); c.lineTo(fa.x+12,fa.y+12); c.moveTo(fa.x+12,fa.y-12); c.lineTo(fa.x-12,fa.y+12); c.stroke(); c.restore(); return; }
  if(res.tipo==='encima'){ const o=R.suelo[res.i], tm=muTam(furn(o.k)), {x,y,s}=suCentro(Math.floor(res.i/10),res.i%10,tm.w), ap=tm.apoyo[res.j]; drawFurn(c,sel,x+(o.g?-1:1)*ap[0]*s,y+ap[1]*s,s*0.8,t,{encima:1}); }
  else { const w=muTam(sel).w, {x,y,s}=suCentro(res.r,res.a,w); drawFurn(c,sel,x,y,s,t,{w,col:p.color}); }
  c.restore(); }
