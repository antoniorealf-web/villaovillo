"use strict";
/* =========================================================
   TELA (dibujo de puntos)
   ========================================================= */
function drawStitch(ctx,x,y,s,col){
  const c=COLORS[col].c, edge=shade(c,-0.28);
  ctx.lineWidth=Math.max(1,s*0.06); ctx.fillStyle=c; ctx.strokeStyle=edge;
  for(const dir of [-1,1]){
    ctx.save(); ctx.translate(x+s/2+dir*s*0.19, y+s*0.5); ctx.rotate(dir*0.48);
    ctx.beginPath(); ctx.ellipse(0,0,s*0.2,s*0.42,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}
/* cells: array de claves de color, null (vacío), '?' (falta) ; opt: {s, ghost:n, hl:[idx], sel:idx} */
function fabricCanvas(cells, w, opt={}){
  const s=opt.s||28, total=Math.max(cells.length, opt.ghost||0), rows=Math.max(1,Math.ceil(total/w));
  const pad=6, W=w*s+pad*2, H=rows*s+pad*2, dpr=window.devicePixelRatio||1;
  const cv=document.createElement('canvas'); cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+'px'; cv.style.height=H+'px'; cv.className='fab';
  const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ctx.fillStyle=opt.bg||'#efe3cc'; roundRect(ctx,0,0,W,H,10); ctx.fill();
  for(let i=0;i<total;i++){
    const x=pad+(i%w)*s, y=pad+Math.floor(i/w)*s, v=cells[i];
    if(v && v!=='?' && COLORS[v]) drawStitch(ctx,x,y,s,v);
    else if(v==='?'){ ctx.setLineDash([4,3]); ctx.strokeStyle='#b89b6a'; ctx.lineWidth=2; roundRect(ctx,x+3,y+3,s-6,s-6,6); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#b89b6a'; ctx.font=`700 ${s*0.55}px 'Baloo 2',sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',x+s/2,y+s/2+1); }
    else { ctx.fillStyle='rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(x+s/2,y+s/2,s*0.12,0,Math.PI*2); ctx.fill(); }
  }
  for(const i of (opt.hl||[])){ const x=pad+(i%w)*s, y=pad+Math.floor(i/w)*s; ctx.strokeStyle='#d62828'; ctx.lineWidth=3.5; roundRect(ctx,x+1,y+1,s-2,s-2,7); ctx.stroke(); }
  if(opt.sel!=null && opt.sel>=0){ const i=opt.sel, x=pad+(i%w)*s, y=pad+Math.floor(i/w)*s; ctx.strokeStyle='#2f5f96'; ctx.lineWidth=3.5; roundRect(ctx,x+1,y+1,s-2,s-2,7); ctx.stroke(); }
  cv._meta={s,pad,w};
  return cv;
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function stitchIcon(col, s=34){ const cv=document.createElement('canvas'), dpr=window.devicePixelRatio||1; cv.width=s*dpr; cv.height=s*dpr; cv.style.width=s+'px'; cv.style.height=s+'px'; const c=cv.getContext('2d'); c.scale(dpr,dpr); drawStitch(c,0,0,s,col); return cv; }
