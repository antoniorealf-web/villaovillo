"use strict";
/* =========================================================
   MODO NOCHE (el pueblo sigue la hora real)
   ========================================================= */
/* nightLevel(): 0 de día, 1 de noche, con atardecer y amanecer suaves según el mes (horas aproximadas de España).
   Para probar: ?noche o ?dia en la dirección. */
const SUN={rise:[8.6,8.3,7.7,7.9,7.2,6.9,7.1,7.6,8.0,8.4,8.0,8.5],set:[18.3,18.9,19.5,20.9,21.4,21.8,21.7,21.2,20.4,19.6,18.0,17.9]};
const NIGHT_FORCE=(()=>{ try{ const q=new URLSearchParams(location.search); return q.has('noche')?1:q.has('dia')?0:null; }catch(e){ return null; } })();
let NIGHTN=0, NIGHTWINS=[], NOC=null, nightCache={t:0,v:0};
function nightLevel(){
  if(NIGHT_FORCE!=null) return NIGHT_FORCE;
  if(DB.dayMode==='dia') return 0; if(DB.dayMode==='noche') return 1;
  if(Date.now()-nightCache.t<20000) return nightCache.v;
  const d=new Date(now()), h=d.getHours()+d.getMinutes()/60, m=d.getMonth(), rise=SUN.rise[m], set=SUN.set[m];
  let v=0; if(h>=set+0.75||h<rise-0.5) v=1; else if(h>=set) v=(h-set)/0.75; else if(h<rise) v=(rise-h)/0.5;
  nightCache={t:Date.now(),v}; return v;
}
function setDayMode(k){ DB.dayMode=k; DB.ajT=Date.now(); nightCache.t=0; saveQuiet(); toast(k==='dia'?'☀️ El pueblo se queda de día':k==='noche'?'🌙 El pueblo se queda de noche':'🕐 El pueblo sigue la hora real'); const b=$('#vb-night'); if(b) b.textContent=nightLevel()>0.5?'☀️':'🌙'; if(curScreen==='alcalde') renderAlcalde(); }
function drawNight(c,st){
  const n=NIGHTN; $('#scr-village').classList.toggle('night',n>0.5); if(n<=0) return;
  const W=vcanvas.width, H=vcanvas.height, k=vDpr*vScale;
  if(!NOC) NOC=document.createElement('canvas'); if(NOC.width!==W||NOC.height!==H){ NOC.width=W; NOC.height=H; }
  const o=NOC.getContext('2d');
  o.setTransform(1,0,0,1,0,0); o.globalCompositeOperation='source-over'; o.clearRect(0,0,W,H);
  o.fillStyle=`rgba(16,22,62,${0.6*n})`; o.fillRect(0,0,W,H);
  o.setTransform(k,0,0,k,-cam.x*k,-cam.y*k); o.globalCompositeOperation='destination-out';
  const L=[];
  if(st.lv>=2) LAMPS.forEach(([x,y])=>L.push([x,y-62,120,0.95,1]));
  if(st.lv>=2&&AMPLIO) AMP.farolas.forEach(([x,y])=>L.push([x,y-62,120,0.95,1])); // farolas de la ampliación
  NIGHTWINS.forEach(([x,y,w,h])=>L.push([x+w/2,y+h/2,Math.max(w,h)*1.5,0.95,0.8]));
  edificiosActivos().filter(e=>e.luz).forEach(e=>{ const b=edRect(e); if(b&&b.door) L.push([b.door[0],b.door[1]-30,70,0.7,0.6]); });
  L.push([player.x,player.y-40,95,0.6,0]); L.push([B.plaza.x,B.plaza.y,80,0.45,0.3]); L.push([POND.x,POND.y,140,0.3,0]);
  npcs.forEach(q=>L.push([q.x,q.y-30,45,0.35,0]));
  (DECO.luz||[]).forEach(l=>L.push(l)); // luces de los paquetes (p. ej. el árbol de Navidad)
  L.forEach(([x,y,r,a])=>{ if(!vis(x,y,r)) return; const g=o.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(0,0,0,${a})`); g.addColorStop(1,'rgba(0,0,0,0)'); o.fillStyle=g; o.fillRect(x-r,y-r,r*2,r*2); });
  c.save(); c.setTransform(1,0,0,1,0,0); c.drawImage(NOC,0,0); c.restore();
  c.save(); c.globalCompositeOperation='lighter';
  L.forEach(([x,y,r,a,warm])=>{ if(!warm||!vis(x,y,r)) return; const g=c.createRadialGradient(x,y,0,x,y,r*0.8); g.addColorStop(0,`rgba(255,190,90,${0.22*warm*n})`); g.addColorStop(1,'rgba(255,190,90,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); });
  // luciérnagas
  for(let i=0;i<26;i++){ const bx=BUSHES[i%BUSHES.length], x=bx[0]+Math.sin(tGlobal*0.5+i*1.7)*60, y=bx[1]-30+Math.cos(tGlobal*0.7+i)*30, a=(Math.sin(tGlobal*2.3+i*2.1)+1)/2*n;
    if(!vis(x,y)) continue; const g=c.createRadialGradient(x,y,0,x,y,10); g.addColorStop(0,`rgba(255,240,140,${0.9*a})`); g.addColorStop(1,'rgba(255,240,140,0)'); c.fillStyle=g; c.fillRect(x-10,y-10,20,20); }
  c.restore();
}
