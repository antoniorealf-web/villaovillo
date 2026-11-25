"use strict";
/* =========================================================
   JARDÍN DE CASA (escena grande animada)
   ========================================================= */
let GD={p:null,mine:false,raf:null,rain:0,spark:[],last:0,k:1};
function gardenDims(p){ if(GD.mode==='room') return {W:GD.roomVW||RW.W,H:RW.H,rows:3,cs:90,gx:0,gy:0}; /* en pantallas estrechas se ve una parte del cuarto y la vista sigue a quien anda */ const rows=jdF(p); return {W:900,H:JD.gy+rows*JD.cs+34,rows,cs:JD.cs,gx:JD.gx,gy:JD.gy}; } // jardín de césped (jardin-suelo.js)
function setupGardenCanvas(p,mine){
  GD.p=p; GD.mine=mine; const cv=$('#gcv');
  cv.onclick=ev=>{ const r=cv.getBoundingClientRect(), d=gardenDims(GD.p); const x=(ev.clientX-r.left)*d.W/r.width, y=(ev.clientY-r.top)*d.H/r.height;
    if(GD.mode==='room'){ roomClick(x+(GD.camX||0),y); return; }
    jardinClick(x,y); };
  cv.onpointermove=ev=>{ if(!invSel&&GD.mano==null){ GD.fantasma=null; return; } const r=cv.getBoundingClientRect(), d=gardenDims(GD.p); GD.fantasma={x:(ev.clientX-r.left)*d.W/r.width+(GD.mode==='room'?GD.camX||0:0),y:(ev.clientY-r.top)*d.H/r.height}; }; // silueta de lo elegido
  cv.onpointerleave=()=>{ GD.fantasma=null; };
  sizeGarden(); if(!GD.raf){ GD.last=performance.now(); GD.raf=requestAnimationFrame(gardenLoop); }
}
function sizeGarden(){ const cv=$('#gcv'); if(!cv||!GD.p) return; const w=Math.max(280,cv.parentElement.clientWidth||600); GD.roomVW=w<620?600:RW.W; GD.camX=Math.min(GD.camX||0,RW.W-GD.roomVW); const d=gardenDims(GD.p); const dpr=window.devicePixelRatio||1; cv.width=Math.round(w*dpr); cv.height=Math.round(w*d.H/d.W*dpr); cv.style.height=(w*d.H/d.W)+'px'; GD.k=w*dpr/d.W; }
window.addEventListener('resize',()=>{ if(curScreen==='house') sizeGarden(); });
function gardenLoop(t){ if(curScreen!=='house'){ GD.raf=null; return; } const dt=Math.min(0.05,(t-GD.last)/1000); GD.last=t; if(GD.rain>0) GD.rain-=dt; GD.spark.forEach(s=>s.t+=dt); GD.spark=GD.spark.filter(s=>s.t<1.2); if(GD.mode==='room') drawRoom(t/1000); else drawGarden(t/1000); GD.raf=requestAnimationFrame(gardenLoop); }
function sproutX(c,x,y,big){
  c.fillStyle='#7a4f2e'; c.beginPath(); c.ellipse(x,y,big?18:14,6,0,0,Math.PI*2); c.fill(); ol(c,2);
  const h=big?26:14; c.strokeStyle=OUT; c.lineWidth=4.5; c.beginPath(); c.moveTo(x,y-2); c.lineTo(x,y-h); c.stroke(); c.strokeStyle='#4f9e45'; c.lineWidth=2.6; c.stroke();
  const leaf=(dx,dy,rot,s)=>{ c.save(); c.translate(x+dx,y+dy); c.rotate(rot); c.beginPath(); c.ellipse(0,0,9*s,4.5*s,0,0,Math.PI*2); c.fillStyle='#6cc25a'; c.fill(); ol(c,2); c.restore(); };
  leaf(-7,-h+4,-0.5,big?1:0.8); leaf(7,-h+2,0.5,big?1:0.8); if(big){ leaf(-6,-h+16,-0.3,0.8); c.beginPath(); c.arc(x,-h+y-5,5,0,Math.PI*2); c.fillStyle='#f6b8c8'; c.fill(); ol(c,1.8); }
}
function drawGarden(t){
  const cv=$('#gcv'); if(!cv) return; const c=cv.getContext('2d'), p=GD.p, d=gardenDims(p);
  c.setTransform(GD.k,0,0,GD.k,0,0);
  const sky=c.createLinearGradient(0,0,0,200); sky.addColorStop(0,'#bfe6fb'); sky.addColorStop(1,'#e7f6ff'); c.fillStyle=sky; c.fillRect(0,0,d.W,200);
  const gr=c.createLinearGradient(0,170,0,d.H); gr.addColorStop(0,'#a6d884'); gr.addColorStop(1,'#8cc46a'); c.fillStyle=gr; c.fillRect(0,170,d.W,d.H-170);
  for(let i=0;i<60;i++){ c.strokeStyle='rgba(60,120,40,.35)'; c.lineWidth=2; const x=seeded(i+90)*d.W, y=190+seeded(i+190)*(d.H-200); c.beginPath(); c.moveTo(x-3,y); c.lineTo(x-1,y-6); c.moveTo(x+3,y); c.lineTo(x+1,y-6); c.stroke(); }
  // casa (más pequeña: el jardín es lo grande)
  c.save(); c.translate(450,6); c.scale(0.62,0.62); c.translate(-450,0);
  const wall=shade(p.color,0.72), roof=shade(p.color,-0.05);
  roundRect(c,40,26,820,166,14); c.fillStyle=wall; c.fill(); ol(c,3);
  c.save(); roundRect(c,40,26,820,166,14); c.clip(); c.fillStyle=shade(wall,-0.2); c.fillRect(40,176,820,16); c.restore();
  c.beginPath(); c.moveTo(20,44); c.lineTo(880,44); c.lineTo(880,8); c.lineTo(20,8); c.closePath(); c.fillStyle=roof; c.fill();
  c.save(); c.beginPath(); c.rect(20,0,860,44); c.clip(); c.strokeStyle=shade(roof,-0.25); c.lineWidth=2; for(let ry=10,row=0;ry<52;ry+=14,row++) for(let rx=20+(row%2?8:0);rx<890;rx+=16){ c.beginPath(); c.arc(rx,ry,8,0.1,Math.PI-0.1); c.stroke(); } c.restore();
  c.beginPath(); c.moveTo(20,44); c.quadraticCurveTo(450,58,880,44); c.lineTo(880,8); c.lineTo(20,8); c.closePath(); ol(c,3);
  winX(c,120,80,96,72,p.color); winX(c,684,80,96,72,p.color); winX(c,250,80,70,72,p.color); winX(c,580,80,70,72,p.color);
  doorX(c,450,190,70,116,shade(p.color,-0.25));
  signX(c,450,66,'🏡 '+p.name);
  bushX(c,80,196,true); bushX(c,820,196,true);
  c.restore();
  // camino
  for(let i=0;i<2;i++){ c.beginPath(); c.ellipse(450+(i%2?8:-8),132+i*8,16,5,0,0,Math.PI*2); c.fillStyle='#d9cbb2'; c.fill(); ol(c,1.6); }
  // valla
  const fx=d.gx-22, fy=d.gy-22, fw=JD.C*d.cs+44, fh=d.rows*d.cs+44;
  c.fillStyle='rgba(40,70,20,.15)'; roundRect(c,fx+6,fy+8,fw,fh,18); c.fill();
  roundRect(c,fx,fy,fw,fh,18); c.fillStyle='#9fd47e'; c.fill();
  c.save(); roundRect(c,fx,fy,fw,fh,18); c.clip(); for(let r=0;r<d.rows;r+=2){ c.fillStyle='rgba(255,255,255,.07)'; c.fillRect(fx,d.gy+r*d.cs,fw,d.cs); } // franjas de césped cortado
  for(let i=0;i<70;i++){ const x=fx+seeded(i+500)*fw, y=fy+seeded(i+700)*fh; c.strokeStyle='rgba(60,120,40,.3)'; c.lineWidth=2; c.beginPath(); c.moveTo(x-3,y); c.lineTo(x-1,y-6); c.moveTo(x+3,y); c.lineTo(x+1,y-6); c.stroke(); if(i%9===0){ c.fillStyle='#fffaf1'; c.beginPath(); c.arc(x+8,y-2,2.6,0,Math.PI*2); c.fill(); c.fillStyle='#f4c430'; c.beginPath(); c.arc(x+8,y-2,1.1,0,Math.PI*2); c.fill(); } }
  c.restore();
  const picket=(x,y)=>{ c.beginPath(); c.moveTo(x-6,y+14); c.lineTo(x-6,y-14); c.lineTo(x,y-22); c.lineTo(x+6,y-14); c.lineTo(x+6,y+14); c.closePath(); c.fillStyle='#fffaf1'; c.fill(); ol(c,2); };
  c.strokeStyle=OUT; c.lineWidth=7; c.beginPath(); c.moveTo(fx,fy+fh-6); c.lineTo(fx+fw,fy+fh-6); c.moveTo(fx+6,fy); c.lineTo(fx+6,fy+fh); c.moveTo(fx+fw-6,fy); c.lineTo(fx+fw-6,fy+fh); c.moveTo(fx,fy+6); c.lineTo(fx+fw/2-50,fy+6); c.moveTo(fx+fw/2+50,fy+6); c.lineTo(fx+fw,fy+6); c.stroke();
  c.strokeStyle='#f1e6cf'; c.lineWidth=4; c.stroke();
  for(let x=fx+6;x<=fx+fw;x+=34){ picket(x,fy+fh-6); if(x<fx+fw/2-50||x>fx+fw/2+50) picket(x,fy+6); }
  for(let y=fy+40;y<fy+fh-20;y+=34){ picket(fx+6,y); picket(fx+fw-6,y); }
  // caminos, guía para colocar y cosas de atrás hacia delante (jardin-suelo.js)
  const mano=GD.mine&&GD.mano!=null&&p.jardin.cel[GD.mano]?GD.mano:null; // lo que se está moviendo
  const sel=mano!=null?p.jardin.cel[mano].k:GD.mine&&invSel&&!invSel.startsWith('fu_')&&p.inv[invSel]>0?invSel:null;
  const cosas=jdCosas(c,p,t); if(sel) jdGuia(c,p,sel,t,mano);
  JD_LUCES=[]; cosas.sort((a,b)=>a.y-b.y).forEach(o=>o.d()); const luces=JD_LUCES; JD_LUCES=null;
  const nl=nightLevel(); if(nl>0.3){ c.fillStyle=`rgba(25,30,70,${(0.3*nl).toFixed(3)})`; c.fillRect(0,0,d.W,d.H); // de noche, más oscuro y los faroles alumbran
    c.save(); c.globalCompositeOperation='lighter'; luces.forEach(([x,y])=>{ const g=c.createRadialGradient(x,y,3,x,y,70); g.addColorStop(0,'rgba(255,190,100,.5)'); g.addColorStop(1,'rgba(255,190,100,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,70,0,Math.PI*2); c.fill(); }); c.restore(); }
  if(mano!=null){ const o=p.jardin.cel[mano], [w,h]=jdTam(o.k); roundRect(c,JD.gx+(mano%JD.C)*JD.cs+2,JD.gy+Math.floor(mano/JD.C)*JD.cs+2,w*JD.cs-4,h*JD.cs-4,10); c.strokeStyle=`rgba(255,210,63,${0.7+Math.sin(t*6)*0.3})`; c.lineWidth=4; c.stroke(); }
  if(sel) jdFantasma(c,p,sel,t,mano);
  // chispas al plantar
  GD.spark.forEach(s=>{ const x=s.x, y=s.y; for(let k=0;k<8;k++){ const a=k/8*Math.PI*2, r=10+s.t*50; c.fillStyle=`rgba(255,230,120,${1-s.t/1.2})`; c.beginPath(); c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,4,0,Math.PI*2); c.fill(); } });
  // lluvia al regar
  if(GD.rain>0){ c.strokeStyle='rgba(120,190,255,.8)'; c.lineWidth=3; for(let k=0;k<70;k++){ const x=d.gx+seeded(k)*JD.C*d.cs, y=d.gy-30+((seeded(k+40)*d.rows*d.cs+t*600)%(d.rows*d.cs+40)); c.beginPath(); c.moveTo(x,y); c.lineTo(x-3,y+12); c.stroke(); } }
  // mariposas y abejas
  const blooms=jdPlantas(p).filter(x=>x.g>=x.need&&x.need>0).length;
  for(let k=0;k<Math.min(5,1+Math.floor(blooms/3));k++){ const x=d.gx+((Math.sin(t*0.4+k*2)+1)/2)*JD.C*d.cs, y=d.gy+20+((Math.cos(t*0.55+k)+1)/2)*(d.rows*d.cs-40); c.font='24px serif'; c.textAlign='center'; c.fillStyle='#000'; c.fillText(k%2?'🐝':'🦋',x,y+Math.sin(t*6+k)*4); }
}
