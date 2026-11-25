"use strict";
/* =========================================================
   LA NIÑA EN EL JARDÍN (desde el 25 nov 2026, etapa 4 del jardín)
   ---------------------------------------------------------
   En el jardín andan la dueña y, de visita, la otra niña o papá (como dentro de casa).
   Tocar el césped hace andar (rodeando lo que hay: jgCamino busca el camino por casillas).
   Tocar el banco, el columpio, el tiovivo o la noria hace ir hasta allí y usarlo (JG_USOS);
   tocar otro sitio la baja. Papá solo pasea. No se guarda nada: es solo para jugar.
   Para mover lo que se usa (o los caminos) está el botón «Mover cosas» (GD.mover).
   ========================================================= */
const JG={p:null,gente:[],last:0,vis:null,sc:1.35,usa:new Map()};
function jgGente(){ const p=GD.p, vis=VISIT?'alcalde':P()&&P().id;
  if(JG.p===p&&JG.gente.length&&JG.vis===vis) return JG.gente;
  JG.p=p; JG.vis=vis; const x0=JD.gx+7.5*JD.cs, y0=JD.gy+JD.cs*0.6;
  JG.gente=[{k:'dueña',p,x:x0,y:y0,path:[],dir:1}];
  if(VISIT) JG.gente.push({k:'alcalde',x:x0-60,y:y0+10,path:[],dir:1});
  else if(P()&&P()!==p) JG.gente.push({k:'visita',p:P(),x:x0-60,y:y0+10,path:[],dir:1});
  return JG.gente; }
function jgAndador(){ const g=jgGente(); return GD.mine?g[0]:(g[1]||null); }
/* Camino por casillas (8 direcciones, sin cortar esquinas) que rodea lo que hay en el jardín */
function jgCamino(p,x0,y0,x1,y1){ const F=jdF(p), C=JD.C, m=jdMapa(p), libre=i=>m[i]<0;
  const cel=(x,y)=>[Math.max(0,Math.min(F-1,Math.floor((y-JD.gy)/JD.cs))),Math.max(0,Math.min(C-1,Math.floor((x-JD.gx)/JD.cs)))];
  const [r0,c0]=cel(x0,y0); let [r1,c1]=cel(x1,y1);
  if(!libre(r1*C+c1)){ let best=null,bd=1e9; for(let r=0;r<F;r++) for(let c=0;c<C;c++) if(libre(r*C+c)){ const d=Math.hypot(r-r1,c-c1); if(d<bd){ bd=d; best=[r,c]; } } if(!best) return []; [r1,c1]=best; x1=JD.gx+(c1+0.5)*JD.cs; y1=JD.gy+(r1+0.6)*JD.cs; }
  const ini=r0*C+c0, fin=r1*C+c1, g=new Map([[ini,0]]), de=new Map(), abierta=[ini], h=i=>Math.hypot(Math.floor(i/C)-r1,i%C-c1);
  while(abierta.length){ abierta.sort((a,b)=>g.get(a)+h(a)-g.get(b)-h(b)); const u=abierta.shift(); if(u===fin) break; const ur=Math.floor(u/C), uc=u%C;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ if(!dr&&!dc) continue; const r=ur+dr, c=uc+dc; if(r<0||c<0||r>=F||c>=C) continue; const v=r*C+c;
      if(!libre(v)&&v!==fin) continue; if(dr&&dc&&(!libre(ur*C+c)||!libre(r*C+uc))) continue;
      const nd=g.get(u)+(dr&&dc?1.42:1); if(!g.has(v)||nd<g.get(v)){ g.set(v,nd); de.set(v,u); if(!abierta.includes(v)) abierta.push(v); } } }
  if(!g.has(fin)) return [];
  const pts=[]; for(let v=fin; v!==ini&&v!=null; v=de.get(v)) pts.unshift([JD.gx+(v%C+0.5)*JD.cs,JD.gy+(Math.floor(v/C)+0.6)*JD.cs]);
  if(pts.length) pts[pts.length-1]=[x1,y1]; else pts.push([x1,y1]); return pts; }
function jgIr(a,x,y,quiere){ a.usa=null; a.quiere=quiere||null; a.path=jgCamino(GD.p,a.x,a.y,x,y); if(!a.path.length&&quiere){ a.usa=quiere; a.quiere=null; } }
/* ¿Se puede usar lo tocado? Devuelve {tipo, i, j?, x, y} con el sitio desde donde se usa */
const JG_USOS={sh_banco:'banco',sh_tiovivo:'tiovivo',sh_noria:'noria'};
function jgUso(h){ if(!h) return null; const o=h.o, [w,hh]=jdTam(o.k), pie=jdPie(Math.floor(h.i/JD.C),h.i%JD.C,w,hh);
  if(h.top>=0&&o.en[h.top]==='sh_columpio'){ const st=jdSitios(o)[h.top]; return {tipo:'columpio',i:h.i,j:h.top,x:pie.x+(o.gi?-1:1)*st.x,y:pie.y+16}; }
  const tipo=JG_USOS[o.k]; return tipo?{tipo,i:h.i,x:pie.x,y:pie.y+(tipo==='banco'?22:26)}:null; }
/* Toque que hace andar o usar algo. Devuelve true si lo ha atendido. */
function jgToque(x,y){ const a=jgAndador(); if(!a) return false; const h=jdToca(GD.p,x,y), u=jgUso(h);
  if(u&&a.k!=='alcalde'){ jgIr(a,u.x,u.y,u); beep(620,0.04); return true; }
  if(h) return false;
  if(y<JD.gy||y>JD.gy+jdF(GD.p)*JD.cs||x<JD.gx||x>JD.gx+JD.C*JD.cs) return false;
  jgIr(a,x,y); return true; }
function jgMover(dt){ JG.usa=new Map();
  for(const a of jgGente()){ if(a.path&&a.path.length){ const [tx,ty]=a.path[0], dx=tx-a.x, dy=ty-a.y, d=Math.hypot(dx,dy), s=Math.min(d,170*dt);
      if(d>2){ a.x+=dx/d*s; a.y+=dy/d*s; a.moving=true; if(Math.abs(dx)>1) a.dir=dx>0?1:-1; } else a.path.shift(); }
    else { a.moving=false; if(a.quiere){ a.usa=a.quiere; a.quiere=null; beep(880,0.05,'triangle'); } }
    if(a.usa){ const o=GD.p.jardin.cel[a.usa.i]; if(!o||(a.usa.tipo==='columpio'&&(!o.en||o.en[a.usa.j]!=='sh_columpio'))) a.usa=null; else JG.usa.set(o,a); } } }
function jgFigura(c,a,x,y,t,o){ o=o||{}; const sc=o.sc||JG.sc;
  if(a.k==='alcalde') drawNPCFig(c,'alcalde',x,y,{t,moving:a.moving,dir:a.dir,sc});
  else drawHero(c,x,y,{look:lookOf(a.p),t,sc,dir:o.dir||a.dir,moving:a.moving&&!o.sit,sit:o.sit,brazos:o.brazos,blink:(t%3.4)>3.25,wave:!a.moving&&!o.sit&&a.k==='dueña'&&(t%7)>5.8}); }
/* Gente que no está usando nada, para ordenarla con las cosas del jardín */
function jgCosas(c,t){ return jgGente().filter(a=>!a.usa).map(a=>({y:a.y,d:()=>jgFigura(c,a,a.x,a.y,t)})); }
/* Quién usa la cosa o (lo miran los dibujos del banco, tiovivo, noria y columpio) */
function jgEn(o){ return curScreen==='house'&&GD.mode==='garden'&&JG.usa.get(o)||null; }
