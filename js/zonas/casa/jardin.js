"use strict";
/* =========================================================
   JARDÍN DE CASA (escena grande animada)
   ========================================================= */
let GD={p:null,mine:false,raf:null,rain:0,spark:[],last:0,k:1};
function gardenDims(p){ if(GD.mode==='room') return {W:GD.roomVW||RW.W,H:RW.H,rows:3,cs:90,gx:0,gy:0}; /* en pantallas estrechas se ve una parte del cuarto y la vista sigue a quien anda */ const rows=p.gardenRows||4, cs=92; return {W:900,H:262+rows*cs,rows,cs,gx:(900-8*cs)/2,gy:232}; }
function setupGardenCanvas(p,mine){
  GD.p=p; GD.mine=mine; const cv=$('#gcv');
  cv.onclick=ev=>{ const r=cv.getBoundingClientRect(), d=gardenDims(GD.p); const x=(ev.clientX-r.left)*d.W/r.width, y=(ev.clientY-r.top)*d.H/r.height;
    if(GD.mode==='room'){ roomClick(x+(GD.camX||0),y); return; }
    const col=Math.floor((x-d.gx)/d.cs), row=Math.floor((y-d.gy)/d.cs); if(col<0||col>7||row<0||row>=d.rows) return; gardenCellClick(row*8+col); };
  cv.onpointermove=ev=>{ if(GD.mode!=='room'||!invSel){ GD.fantasma=null; return; } const r=cv.getBoundingClientRect(), d=gardenDims(GD.p); GD.fantasma={x:(ev.clientX-r.left)*d.W/r.width+(GD.camX||0),y:(ev.clientY-r.top)*d.H/r.height}; }; // silueta del mueble elegido
  cv.onpointerleave=()=>{ GD.fantasma=null; };
  sizeGarden(); if(!GD.raf){ GD.last=performance.now(); GD.raf=requestAnimationFrame(gardenLoop); }
}
function sizeGarden(){ const cv=$('#gcv'); if(!cv||!GD.p) return; const w=Math.max(280,cv.parentElement.clientWidth||600); GD.roomVW=w<620?600:RW.W; GD.camX=Math.min(GD.camX||0,RW.W-GD.roomVW); const d=gardenDims(GD.p); const dpr=window.devicePixelRatio||1; cv.width=Math.round(w*dpr); cv.height=Math.round(w*d.H/d.W*dpr); cv.style.height=(w*d.H/d.W)+'px'; GD.k=w*dpr/d.W; }
window.addEventListener('resize',()=>{ if(curScreen==='house') sizeGarden(); });
function gardenLoop(t){ if(curScreen!=='house'){ GD.raf=null; return; } const dt=Math.min(0.05,(t-GD.last)/1000); GD.last=t; if(GD.rain>0) GD.rain-=dt; GD.spark.forEach(s=>s.t+=dt); GD.spark=GD.spark.filter(s=>s.t<1.2); if(GD.mode==='room') drawRoom(t/1000); else drawGarden(t/1000); GD.raf=requestAnimationFrame(gardenLoop); }
function gardenCellClick(i){
  const p=GD.p, cell=p.garden[i]; if(!GD.mine){ toast('Este jardín no es tuyo 😊'); return; }
  if(cell){
    if(cell.g<cell.need){ toast('🌱 Está creciendo. ¡Riégala cada día hasta que florezca!'); return; }
    const key=cell.need>0?'gw:'+cell.k:cell.k; p.garden[i]=null; p.inv[key]=(p.inv[key]||0)+1; beep(350,0.05);
  } else if(invSel && p.inv[invSel]>0){
    const k=invSel.startsWith('gw:')?invSel.slice(3):invSel, need=needFor(k);
    p.garden[i]={k,g:invSel.startsWith('gw:')?need:0,need}; p.inv[invSel]--; if(!p.inv[invSel]){ delete p.inv[invSel]; invSel=null; }
    beep(760,0.07,'triangle'); GD.spark.push({i,t:0});
  } else { toast('Elige algo de tu cesta y toca un hueco del jardín'); return; }
  save(); renderHouse();
}
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
  // casa
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
  // camino
  for(let i=0;i<3;i++){ c.beginPath(); c.ellipse(450+(i%2?10:-10),204+i*9,22,6,0,0,Math.PI*2); c.fillStyle='#d9cbb2'; c.fill(); ol(c,1.6); }
  // valla
  const fx=d.gx-22, fy=d.gy-22, fw=8*d.cs+44, fh=d.rows*d.cs+44;
  c.fillStyle='rgba(40,70,20,.15)'; roundRect(c,fx+6,fy+8,fw,fh,18); c.fill();
  roundRect(c,fx,fy,fw,fh,18); c.fillStyle='#8cc46a'; c.fill();
  const picket=(x,y)=>{ c.beginPath(); c.moveTo(x-6,y+14); c.lineTo(x-6,y-14); c.lineTo(x,y-22); c.lineTo(x+6,y-14); c.lineTo(x+6,y+14); c.closePath(); c.fillStyle='#fffaf1'; c.fill(); ol(c,2); };
  c.strokeStyle=OUT; c.lineWidth=7; c.beginPath(); c.moveTo(fx,fy+fh-6); c.lineTo(fx+fw,fy+fh-6); c.moveTo(fx+6,fy); c.lineTo(fx+6,fy+fh); c.moveTo(fx+fw-6,fy); c.lineTo(fx+fw-6,fy+fh); c.moveTo(fx,fy+6); c.lineTo(fx+fw/2-50,fy+6); c.moveTo(fx+fw/2+50,fy+6); c.lineTo(fx+fw,fy+6); c.stroke();
  c.strokeStyle='#f1e6cf'; c.lineWidth=4; c.stroke();
  for(let x=fx+6;x<=fx+fw;x+=34){ picket(x,fy+fh-6); if(x<fx+fw/2-50||x>fx+fw/2+50) picket(x,fy+6); }
  for(let y=fy+40;y<fy+fh-20;y+=34){ picket(fx+6,y); picket(fx+fw-6,y); }
  // parcelas
  const drop=GD.mine&&invSel;
  for(let i=0;i<8*d.rows;i++){
    const col=i%8,row=Math.floor(i/8), x=d.gx+col*d.cs, y=d.gy+row*d.cs, cell=p.garden[i];
    const sg=c.createLinearGradient(0,y+8,0,y+d.cs-8); sg.addColorStop(0,'#a8754e'); sg.addColorStop(1,'#7e5232');
    roundRect(c,x+7,y+7,d.cs-14,d.cs-14,18); c.fillStyle=sg; c.fill(); ol(c,2.2);
    c.strokeStyle='rgba(60,35,20,.35)'; c.lineWidth=2; for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(x+18,y+26+k*18); c.quadraticCurveTo(x+d.cs/2,y+22+k*18,x+d.cs-18,y+26+k*18); c.stroke(); }
    if(!cell&&drop){ c.strokeStyle=`rgba(255,255,255,${0.6+Math.sin(t*5)*0.3})`; c.lineWidth=4; c.setLineDash([8,6]); roundRect(c,x+11,y+11,d.cs-22,d.cs-22,14); c.stroke(); c.setLineDash([]); }
    if(!cell) continue;
    const cx=x+d.cs/2, by=y+d.cs-20;
    if(cell.g>=cell.need){
      const info=itemInfo(cell.k); const sway=cell.need>0?Math.sin(t*1.6+i)*0.06:0;
      c.fillStyle='rgba(40,25,10,.25)'; c.beginPath(); c.ellipse(cx,by+4,24,7,0,0,Math.PI*2); c.fill();
      c.save(); c.translate(cx,by+6); c.rotate(sway); c.font='60px serif'; c.textAlign='center'; c.textBaseline='bottom'; c.fillStyle='#000'; c.fillText(info.e,0,0); if(info.f){ c.font='28px serif'; c.fillText(info.f,18,-14); } c.restore();
    } else {
      sproutX(c,cx,by,cell.g>0);
      for(let k=0;k<cell.need;k++){ c.font='13px serif'; c.textAlign='center'; c.textBaseline='middle'; c.globalAlpha=k<cell.g?1:0.3; c.fillStyle='#000'; c.fillText('💧',x+d.cs/2-(cell.need-1)*8+k*16,y+16); c.globalAlpha=1; }
    }
  }
  // chispas al plantar
  GD.spark.forEach(s=>{ const col=s.i%8,row=Math.floor(s.i/8), x=d.gx+col*d.cs+d.cs/2, y=d.gy+row*d.cs+d.cs/2; for(let k=0;k<8;k++){ const a=k/8*Math.PI*2, r=10+s.t*50; c.fillStyle=`rgba(255,230,120,${1-s.t/1.2})`; c.beginPath(); c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,4,0,Math.PI*2); c.fill(); } });
  // lluvia al regar
  if(GD.rain>0){ c.strokeStyle='rgba(120,190,255,.8)'; c.lineWidth=3; for(let k=0;k<70;k++){ const x=d.gx+seeded(k)*8*d.cs, y=d.gy-30+((seeded(k+40)*d.rows*d.cs+t*600)%(d.rows*d.cs+40)); c.beginPath(); c.moveTo(x,y); c.lineTo(x-3,y+12); c.stroke(); } }
  // mariposas y abejas
  const blooms=p.garden.filter(x=>x&&x.g>=x.need&&x.need>0).length;
  for(let k=0;k<Math.min(5,1+Math.floor(blooms/3));k++){ const x=d.gx+((Math.sin(t*0.4+k*2)+1)/2)*8*d.cs, y=d.gy+20+((Math.cos(t*0.55+k)+1)/2)*(d.rows*d.cs-40); c.font='24px serif'; c.textAlign='center'; c.fillStyle='#000'; c.fillText(k%2?'🐝':'🦋',x,y+Math.sin(t*6+k)*4); }
}
