"use strict";
/* =========================================================
   ROBOT DEL HUERTO · pantalla (scr-robot)
   ---------------------------------------------------------
   openRobot(R, opts): enseña un reto (de rbGenera) con el huerto dibujado, el programa y las tarjetas.
   opts: {catalog, volver(), alGanar({estrellas, tarjetas, cesta, intentos}) → texto extra (premios), una sola vez al acabar bien}.
   Las tarjetas y Repetir funcionan como el cabezal del telar (mismas clases: cbox, repblk, ccard opc):
   tocar una tarjeta de abajo la añade donde está el recuadro azul; tocar una del programa la quita.
   ▶ ejecuta, 🐢 despacio, 👣 paso a paso. Esta pantalla no guarda nada: quien la abre decide qué se gana.
   ========================================================= */
const RBZ={R:null,prog:[],sel:[],running:false,step:null,att:0,opts:{},cel:null,rob:null,vis:null,choque:null,falla:-1,brillo:-1,raf:null,t:0,last:0,fin:null};

/* ---------- dibujo ---------- */
function rbGota(c,x,y,s){ c.beginPath(); c.moveTo(x,y-s); c.bezierCurveTo(x+s*0.9,y,x+s*0.7,y+s*0.9,x,y+s*0.9); c.bezierCurveTo(x-s*0.7,y+s*0.9,x-s*0.9,y,x,y-s); c.closePath(); c.fillStyle='#4aa3df'; c.fill(); c.strokeStyle='#2f78ad'; c.lineWidth=Math.max(1,s*0.15); c.stroke(); c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.arc(x-s*0.25,y+s*0.25,s*0.18,0,Math.PI*2); c.fill(); }
function rbHoja(c,x,y,a,l,col){ c.save(); c.translate(x,y); c.rotate(a); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(l*0.5,-l*0.35,l,0); c.quadraticCurveTo(l*0.5,l*0.35,0,0); c.fillStyle=col; c.fill(); c.restore(); }
function rbBrote(c,x,y,s,triste){
  const col=triste?'#a9b54a':'#4fae4a', tallo=triste?'#8a8f3a':'#3a8a3a';
  c.strokeStyle=tallo; c.lineWidth=s*0.06; c.beginPath(); c.moveTo(x,y+s*0.18); c.lineTo(x,y-s*0.05); c.stroke();
  if(triste){ rbHoja(c,x,y-s*0.04,2.4,s*0.24,col); rbHoja(c,x,y-s*0.04,0.75,s*0.24,col); }
  else { rbHoja(c,x,y-s*0.04,-2.5,s*0.26,col); rbHoja(c,x,y-s*0.04,-0.65,s*0.26,col); }
}
function rbPlanta(c,x,y,s){ rbBrote(c,x,y,s,false); rbHoja(c,x,y+s*0.08,-2.9,s*0.2,'#5bbd52'); rbHoja(c,x,y+s*0.08,-0.25,s*0.2,'#5bbd52'); }
function rbVerdura(c,x,y,s,cul){
  if(cul==='zanahoria'){
    rbHoja(c,x,y-s*0.06,-2.1,s*0.24,'#3f9e3f'); rbHoja(c,x,y-s*0.06,-1.57,s*0.26,'#4fae4a'); rbHoja(c,x,y-s*0.06,-1.0,s*0.24,'#3f9e3f');
    c.fillStyle='#f08a24'; c.beginPath(); c.moveTo(x-s*0.15,y-s*0.04); c.lineTo(x+s*0.15,y-s*0.04); c.lineTo(x,y+s*0.3); c.closePath(); c.fill();
    c.strokeStyle='#c96a12'; c.lineWidth=s*0.03; for(const k of [0.06,0.14]){ c.beginPath(); c.moveTo(x-s*0.09+k*s*0.3,y+s*k); c.lineTo(x+s*0.03,y+s*k); c.stroke(); }
  } else if(cul==='lechuga'){
    for(const [dx,dy,r,col] of [[-0.13,0.05,0.17,'#7cc65a'],[0.13,0.05,0.17,'#7cc65a'],[0,-0.06,0.18,'#93d66b'],[0,0.1,0.15,'#a8e07c']]){ c.fillStyle=col; c.beginPath(); c.arc(x+dx*s,y+dy*s,r*s,0,Math.PI*2); c.fill(); }
    c.strokeStyle='#5ea544'; c.lineWidth=s*0.025; c.beginPath(); c.arc(x,y+s*0.02,s*0.09,0,Math.PI*2); c.stroke();
  } else if(cul==='tomate'){
    rbPlanta(c,x,y,s*1.05);
    for(const [dx,dy] of [[-0.14,0.02],[0.13,-0.06],[0.04,0.14]]){ c.fillStyle='#e4423a'; c.beginPath(); c.arc(x+dx*s,y+dy*s,s*0.1,0,Math.PI*2); c.fill(); c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.arc(x+dx*s-s*0.03,y+dy*s-s*0.03,s*0.025,0,Math.PI*2); c.fill(); }
  } else if(cul==='col'){
    for(const [dx,dy,r,col] of [[-0.12,0.06,0.16,'#9fd39a'],[0.12,0.06,0.16,'#9fd39a'],[0,-0.05,0.2,'#c4e8b5'],[0,0.05,0.16,'#b2e0a5']]){ c.fillStyle=col; c.beginPath(); c.arc(x+dx*s,y+dy*s,r*s,0,Math.PI*2); c.fill(); }
    c.strokeStyle='#7fb878'; c.lineWidth=s*0.025; for(const a of [-0.6,0,0.6]){ c.beginPath(); c.moveTo(x,y+s*0.08); c.quadraticCurveTo(x+Math.sin(a)*s*0.08,y-s*0.04,x+Math.sin(a)*s*0.17,y-s*0.15); c.stroke(); }
  } else if(cul==='haba'){
    rbPlanta(c,x,y-s*0.04,s*0.9);
    for(const [dx,a] of [[-0.12,0.5],[0.12,-0.5]]){ c.save(); c.translate(x+dx*s,y+s*0.12); c.rotate(a); c.fillStyle='#6cbf4a'; c.beginPath(); c.ellipse(0,0,s*0.07,s*0.2,0,0,Math.PI*2); c.fill(); c.fillStyle='#8fd66a'; for(const k of [-0.1,0,0.1]){ c.beginPath(); c.arc(0,k*s,s*0.035,0,Math.PI*2); c.fill(); } c.restore(); }
  } else if(cul==='fresa'){
    rbHoja(c,x-s*0.04,y-s*0.04,-2.6,s*0.22,'#4fae4a'); rbHoja(c,x+s*0.04,y-s*0.04,-0.5,s*0.22,'#4fae4a');
    for(const [dx,dy] of [[-0.12,0.1],[0.12,0.08]]){ const fx=x+dx*s, fy=y+dy*s; c.fillStyle='#e2343f'; c.beginPath(); c.moveTo(fx-s*0.09,fy-s*0.05); c.quadraticCurveTo(fx,fy-s*0.1,fx+s*0.09,fy-s*0.05); c.quadraticCurveTo(fx+s*0.08,fy+s*0.08,fx,fy+s*0.13); c.quadraticCurveTo(fx-s*0.08,fy+s*0.08,fx-s*0.09,fy-s*0.05); c.fill();
      c.fillStyle='#ffe28a'; for(const [a,b] of [[-0.04,0],[0.03,0.02],[0,0.07],[-0.02,0.04]]){ c.beginPath(); c.arc(fx+a*s,fy+b*s,s*0.012,0,Math.PI*2); c.fill(); } c.fillStyle='#3f9e3f'; c.beginPath(); c.ellipse(fx,fy-s*0.07,s*0.06,s*0.025,0,0,Math.PI*2); c.fill(); }
  } else if(cul==='maiz'){
    rbHoja(c,x,y+s*0.18,-2.2,s*0.3,'#5aa845'); rbHoja(c,x,y+s*0.18,-0.9,s*0.3,'#5aa845');
    c.fillStyle='#f6cf3d'; c.beginPath(); c.ellipse(x,y-s*0.02,s*0.09,s*0.22,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#d9a91c'; c.lineWidth=s*0.015; for(const k of [-0.12,-0.04,0.04,0.12]){ c.beginPath(); c.moveTo(x-s*0.08,y+k*s); c.lineTo(x+s*0.08,y+k*s); c.stroke(); } c.beginPath(); c.moveTo(x,y-s*0.22); c.lineTo(x,y+s*0.18); c.stroke();
    rbHoja(c,x-s*0.02,y+s*0.15,-1.95,s*0.2,'#7cc65a'); rbHoja(c,x+s*0.02,y+s*0.15,-1.2,s*0.2,'#7cc65a');
  } else {
    rbHoja(c,x+s*0.05,y-s*0.12,-0.8,s*0.22,'#4fae4a');
    c.fillStyle='#f39a2b'; c.beginPath(); c.ellipse(x,y+s*0.06,s*0.24,s*0.18,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#d07a14'; c.lineWidth=s*0.03; for(const k of [-0.1,0,0.1]){ c.beginPath(); c.ellipse(x+k*s,y+s*0.06,s*0.05,s*0.17,0,0,Math.PI*2); c.stroke(); }
    c.fillStyle='#6b8e23'; c.fillRect(x-s*0.02,y-s*0.15,s*0.04,s*0.06);
  }
}
function rbBrillo(c,x,y,s,t){ const a=0.5+0.5*Math.sin(t*4+x*0.1); c.fillStyle=`rgba(255,236,120,${0.55*a})`; c.beginPath(); for(let k=0;k<8;k++){ const r=k%2?s*0.05:s*0.13, an=k*Math.PI/4+t; c.lineTo(x+Math.cos(an)*r,y+Math.sin(an)*r); } c.closePath(); c.fill(); }
function rbRobot(c,x,y,s,d,t,choque){
  const bob=Math.sin(t*5)*s*0.015;
  c.save(); c.translate(x,y+bob);
  if(choque) c.translate(Math.sin(t*60)*s*0.04,0);
  // flecha amarilla: hacia dónde mira
  c.save(); c.rotate(d*Math.PI/2); c.fillStyle='#f4c430'; c.strokeStyle='#b58a10'; c.lineWidth=s*0.025;
  c.beginPath(); c.moveTo(0,-s*0.47); c.lineTo(s*0.13,-s*0.33); c.lineTo(-s*0.13,-s*0.33); c.closePath(); c.fill(); c.stroke(); c.restore();
  c.fillStyle='rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0,s*0.3,s*0.26,s*0.07,0,0,Math.PI*2); c.fill();
  // ruedas
  c.fillStyle='#3d4a5c'; roundRect(c,-s*0.3,s*0.12,s*0.14,s*0.2,s*0.05); c.fill(); roundRect(c,s*0.16,s*0.12,s*0.14,s*0.2,s*0.05); c.fill();
  // cuerpo
  c.fillStyle=choque?'#e4574f':'#5bb7b0'; c.strokeStyle='#2f7d78'; c.lineWidth=s*0.035;
  roundRect(c,-s*0.24,-s*0.2,s*0.48,s*0.44,s*0.12); c.fill(); c.stroke();
  c.fillStyle='rgba(255,255,255,.3)'; roundRect(c,-s*0.19,-s*0.16,s*0.2,s*0.08,s*0.04); c.fill();
  // antena
  c.strokeStyle='#2f7d78'; c.lineWidth=s*0.03; c.beginPath(); c.moveTo(0,-s*0.2); c.lineTo(0,-s*0.3); c.stroke();
  c.fillStyle='#e4574f'; c.beginPath(); c.arc(0,-s*0.32,s*0.04,0,Math.PI*2); c.fill();
  // pantalla y ojos (miran hacia d)
  c.fillStyle='#24323f'; roundRect(c,-s*0.17,-s*0.08,s*0.34,s*0.2,s*0.06); c.fill();
  const ox=RB_DIRS[d][0]*s*0.04, oy=RB_DIRS[d][1]*s*0.03;
  c.fillStyle=choque?'#ffd0cc':'#8ff0e6';
  if(choque){ c.font=`bold ${s*0.12}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('× ×',0,s*0.02); }
  else { c.beginPath(); c.arc(-s*0.07+ox,s*0.02+oy,s*0.035,0,Math.PI*2); c.arc(s*0.07+ox,s*0.02+oy,s*0.035,0,Math.PI*2); c.fill(); }
  c.restore();
}
function rbCasilla(c,R,cel,i,x0,y0,cs,t,marca){
  const x=x0+(i%R.w)*cs, y=y0+Math.floor(i/R.w)*cs, m=cs*0.05, s=cs, cx=x+cs/2, cy=y+cs/2, k=cel[i];
  c.fillStyle=k.t==='hueco'?'#94633b':'#a8754a'; roundRect(c,x+m,y+m,cs-2*m,cs-2*m,cs*0.14); c.fill();
  c.strokeStyle='rgba(80,45,20,.25)'; c.lineWidth=cs*0.03; for(const f of [0.3,0.5,0.7]){ c.beginPath(); c.moveTo(x+cs*0.18,y+cs*f); c.lineTo(x+cs*0.82,y+cs*f); c.stroke(); }
  if(marca) { c.strokeStyle='#f4c430'; c.lineWidth=cs*0.06; roundRect(c,x+m*1.5,y+m*1.5,cs-3*m,cs-3*m,cs*0.13); c.stroke(); }
  if(k.p){ c.fillStyle='#9aa3ad'; c.beginPath(); c.ellipse(cx,cy+s*0.05,s*0.3,s*0.22,0,0,Math.PI*2); c.fill(); c.fillStyle='#b9c1c9'; c.beginPath(); c.ellipse(cx-s*0.05,cy-s*0.01,s*0.2,s*0.13,0,0,Math.PI*2); c.fill(); c.strokeStyle='#6f7882'; c.lineWidth=s*0.03; c.beginPath(); c.ellipse(cx,cy+s*0.05,s*0.3,s*0.22,0,0,Math.PI*2); c.stroke(); return; }
  const t_=k.t;
  if(t_==='hueco'){ c.fillStyle='#6e4426'; c.beginPath(); c.ellipse(cx,cy+s*0.05,s*0.16,s*0.08,0,0,Math.PI*2); c.fill(); return; }
  if(t_==='sem'||t_==='sw'){
    c.setLineDash([s*0.06,s*0.05]); c.strokeStyle='#fff6dc'; c.lineWidth=s*0.04; c.beginPath(); c.arc(cx,cy,s*0.24,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    c.fillStyle='#6b4423'; c.beginPath(); c.ellipse(cx,cy,s*0.07,s*0.045,0.5,0,Math.PI*2); c.fill(); c.fillStyle='#8a5a30'; c.beginPath(); c.ellipse(cx-s*0.01,cy-s*0.01,s*0.035,s*0.02,0.5,0,Math.PI*2); c.fill();
    if(t_==='sw') rbGota(c,x+cs*0.78,y+cs*0.24,s*0.1);
    if(k.c&&RB_CULT_E[k.c]){ c.font=`${s*0.24}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(RB_CULT_E[k.c],x+cs*0.24,y+cs*0.76); } // qué semilla es
    return;
  }
  if(t_==='sed'||t_==='sed2'){ if(t_==='sed2') rbBrote(c,cx,cy+s*0.05,s*0.8,true); else rbBrote(c,cx,cy+s*0.02,s,true);
    c.fillStyle='#fff'; c.strokeStyle='#4aa3df'; c.lineWidth=s*0.025; c.beginPath(); c.arc(x+cs*0.76,y+cs*0.25,s*0.14,0,Math.PI*2); c.fill(); c.stroke(); rbGota(c,x+cs*0.76,y+cs*0.24,s*0.08); return; }
  if(t_==='ok'){ rbPlanta(c,cx,cy+s*0.03,s*0.95); return; }
  if(t_==='peq'){ rbPlanta(c,cx,cy+s*0.03,s*0.8); return; }
  if(t_==='mad'){ rbVerdura(c,cx,cy+s*0.02,s,k.c); rbBrillo(c,x+cs*0.8,y+cs*0.2,s,t); }
}
function rbDibuja(){
  const cv=$('#rb-cv'); if(!cv||!RBZ.R) return;
  const R=RBZ.R, W=Math.min(640,(cv.parentElement&&cv.parentElement.clientWidth)||400), dpr=Math.min(2,window.devicePixelRatio||1);
  const cs=Math.min(96,(W-24)/R.w), bw=cs*R.w+24, bh=cs*R.h+24;
  if(cv.width!==Math.round(bw*dpr)||cv.height!==Math.round(bh*dpr)){ cv.width=Math.round(bw*dpr); cv.height=Math.round(bh*dpr); cv.style.width=bw+'px'; cv.style.height=bh+'px'; }
  const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,bw,bh);
  // valla de madera y césped
  c.fillStyle='#8ccf6c'; roundRect(c,0,0,bw,bh,18); c.fill();
  c.strokeStyle='#b07a45'; c.lineWidth=6; roundRect(c,5,5,bw-10,bh-10,14); c.stroke();
  c.fillStyle='#c99560'; for(let k=0;k<=R.w;k++){ roundRect(c,12+k*cs-4,2,8,12,3); c.fill(); roundRect(c,12+k*cs-4,bh-14,8,12,3); c.fill(); }
  for(let k=0;k<=R.h;k++){ roundRect(c,2,12+k*cs-4,12,8,3); c.fill(); roundRect(c,bw-14,12+k*cs-4,12,8,3); c.fill(); }
  const cel=RBZ.cel||R.cel;
  for(let i=0;i<R.w*R.h;i++) rbCasilla(c,R,cel,i,12,12,cs,RBZ.t,i===RBZ.brillo);
  if(RBZ.falla>=0){ const x=12+(RBZ.falla%R.w)*cs, y=12+Math.floor(RBZ.falla/R.w)*cs; c.strokeStyle='#e4423a'; c.lineWidth=cs*0.08; roundRect(c,x+4,y+4,cs-8,cs-8,cs*0.14); c.stroke(); }
  const v=RBZ.vis||{x:R.ini.x,y:R.ini.y,d:R.ini.d};
  rbRobot(c,12+(v.x+0.5)*cs,12+(v.y+0.5)*cs,cs,v.d,RBZ.t,!!RBZ.choque);
  if(RBZ.choque){ c.font=`${cs*0.4}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; const [dx,dy]=RB_DIRS[v.d]; c.fillText('💥',12+(v.x+0.5+dx*0.5)*cs,12+(v.y+0.5+dy*0.5)*cs); }
}
function rbBucle(now){
  if(curScreen!=='robot'){ RBZ.raf=null; return; }
  const dt=Math.min(0.05,(now-(RBZ.last||now))/1000); RBZ.last=now; RBZ.t+=dt;
  if(RBZ.rob){ RBZ.vis=RBZ.vis||Object.assign({},RBZ.rob); const k=Math.min(1,dt*12); RBZ.vis.x+=(RBZ.rob.x-RBZ.vis.x)*k; RBZ.vis.y+=(RBZ.rob.y-RBZ.vis.y)*k; RBZ.vis.d=RBZ.rob.d; }
  rbDibuja(); RBZ.raf=requestAnimationFrame(rbBucle);
}

/* ---------- programa (como el cabezal) ---------- */
function rbCurList(){ let l=RBZ.prog; for(const i of RBZ.sel){ const n=l[i]; if(!n||n.op!=='rep'){ RBZ.sel=[]; return RBZ.prog; } l=n.body; } return l; }
function rbCarta(op){ const o=RB_OPS[op], c=el('div','ccard opc rbc rb-'+op); c.innerHTML=`<span>${o.e}</span><small>${o.n}</small>`; return c; }
function rbRenderProg(list,path,locked){
  const box=el('div','cbox'+(!locked&&path.join(',')===RBZ.sel.join(',')?' sel':''));
  if(!list.length) box.append(el('span','empty',path.length?'Toca aquí y añade lo que se repite':'Toca las tarjetas de abajo para programar al robot…'));
  list.forEach((n,i)=>{
    if(n.op==='rep'){
      const b=el('div','repblk'); n._el=b;
      const hd=el('div','rephead'); hd.append(el('span','','🔁 Repetir ×'));
      const vu=el('span','vuelta',''); n._cnt=vu;
      const mi=el('button','','–'), num=el('span','n',String(n.n)), pl=el('button','',' +'), del=el('button','','✖');
      mi.onclick=ev=>{ ev.stopPropagation(); if(locked) return; n.n=Math.max(2,n.n-1); rbRender(); };
      pl.onclick=ev=>{ ev.stopPropagation(); if(locked) return; n.n=Math.min(12,n.n+1); rbRender(); };
      del.onclick=ev=>{ ev.stopPropagation(); if(locked) return; list.splice(i,1); RBZ.sel=[]; beep(300,0.05); rbRender(); };
      hd.append(mi,num,pl,del,vu); b.append(hd);
      b.append(rbRenderProg(n.body,path.concat(i),locked)); box.append(b);
    } else {
      const c=rbCarta(n.op); n._el=c;
      c.onclick=ev=>{ ev.stopPropagation(); if(locked) return; list.splice(i,1); beep(300,0.05); rbRender(); };
      box.append(c);
    }
  });
  box.onclick=ev=>{ ev.stopPropagation(); if(locked) return; RBZ.sel=path; rbRender(); };
  return box;
}
function rbAdd(node){
  if(RBZ.running||RBZ.step) return;
  const n=rbCuenta(RBZ.prog);
  if(n>=40){ toast('¡Programa demasiado largo! Usa 🔁 Repetir.'); return; }
  if(RBZ.R.max&&n>=RBZ.R.max){ toast(`¡Solo caben ${RBZ.R.max} tarjetas! Usa 🔁 Repetir.`); return; }
  const l=rbCurList(); l.push(node); if(node.op==='rep') RBZ.sel=RBZ.sel.concat(l.length-1);
  rbLimpiaEstado(); beep(640,0.05); rbRender();
}
function rbLimpiaEstado(){ if(RBZ.running||RBZ.step) return; RBZ.cel=null; RBZ.rob={x:RBZ.R.ini.x,y:RBZ.R.ini.y,d:RBZ.R.ini.d}; RBZ.choque=null; RBZ.falla=-1; RBZ.brillo=-1; RBZ.fin=null; }
function rbPaleta(){
  const R=RBZ.R, ops=(R.modo==='flechas'?['U','R','D','L']:['F','TL','TR']).concat(['P','W','H']);
  const pal=el('div','palette'); ops.forEach(op=>{ const c=rbCarta(op); c.onclick=()=>rbAdd({op}); pal.append(c); });
  if(rbConRepetir(R.modo,R.nivel)){ const rc=el('div','ccard opc'); rc.style.background='#fff3e0'; rc.innerHTML='<span>🔁</span><small>Repetir</small>'; rc.onclick=()=>rbAdd({op:'rep',n:2,body:[]}); pal.append(rc); }
  return pal;
}
function rbRender(){
  const R=RBZ.R, Rt=$('#rb-right'); Rt.innerHTML='';
  const locked=RBZ.running||!!RBZ.step||!!(RBZ.fin&&RBZ.fin.ok);
  Rt.append(el('div','lbl','Programa del robot'));
  Rt.append(rbRenderProg(RBZ.prog,[],locked));
  Rt.append(el('div','counter',`Tarjetas usadas: ${rbCuenta(RBZ.prog)}`+(R.max?` · 📦 caben ${R.max}`:'')+` · ⭐⭐⭐ con ${R.best} o menos`));
  Rt.append(el('div','lbl','Tarjetas'));
  Rt.append(rbPaleta());
  const act=el('div','actions');
  if(RBZ.fin&&RBZ.fin.ok){
    if(RBZ.opts.catalog){ const ot=el('button','btn primary','🔁 Otro reto'); ot.onclick=()=>openRobot(rbGenera(R.modo,R.nivel,'cat'+Date.now()),RBZ.opts); act.append(ot); }
    if(RBZ.opts.volver&&!RBZ.opts.catalog){ const sg=el('button','btn primary','Seguir ➜'); sg.onclick=()=>RBZ.opts.volver(); act.append(sg); }
    Rt.append(act); return;
  }
  if(RBZ.att>=3&&!RBZ.step){ const h=el('button','btn blue','💡 Pista'); h.onclick=rbPista; act.append(h); }
  if(TEST||VISIT){ const sb=el('button','btn','👁️ Solución'); sb.onclick=()=>{ RBZ.prog=rbClona(R.sol); RBZ.sel=[]; rbLimpiaEstado(); rbRender(); rbMsg(`Solución cargada (${rbCuenta(RBZ.prog)} tarjetas). Pulsa ▶.`,'good'); }; act.append(sb); }
  if(RBZ.step){
    const stop=el('button','btn','⏹ Parar'); stop.onclick=()=>{ RBZ.step=null; rbLimpiaEstado(); rbRender(); rbMsg(''); };
    const nx=el('button','btn primary','👣 Siguiente paso'); nx.onclick=rbPasoSig;
    act.append(stop,nx); Rt.append(act); return;
  }
  const clr=el('button','btn','↺ Borrar todo'); clr.onclick=()=>{ if(RBZ.running) return; RBZ.prog=[]; RBZ.sel=[]; rbLimpiaEstado(); rbRender(); rbMsg(''); };
  const stp=el('button','btn','👣 Paso a paso'); stp.onclick=rbPasoIni; stp.disabled=RBZ.running;
  const slow=el('button','btn','🐢 Despacio'); slow.onclick=()=>rbEjecuta(true); slow.disabled=RBZ.running;
  const run=el('button','btn primary','▶ ¡Adelante!'); run.onclick=()=>rbEjecuta(false); run.disabled=RBZ.running;
  act.append(clr,stp,slow,run); Rt.append(act);
}
function rbMsg(t,cls){ const m=$('#rb-msg'); m.className=cls||''; m.textContent=t||''; }

/* ---------- ejecutar ---------- */
function rbPrepara(){ RBZ.cel=RBZ.R.cel.map(c=>({p:c.p,t:c.t,c:c.c})); RBZ.rob={x:RBZ.R.ini.x,y:RBZ.R.ini.y,d:RBZ.R.ini.d}; RBZ.vis=Object.assign({},RBZ.rob); RBZ.choque=null; RBZ.falla=-1; RBZ.brillo=-1; RBZ.fin=null;
  return {res:rbRun(RBZ.R,RBZ.prog),idx:0}; }
function rbLimpiaHL(){ document.querySelectorAll('#rb-right .run').forEach(e=>e.classList.remove('run')); document.querySelectorAll('#rb-right .loopon').forEach(e=>e.classList.remove('loopon')); document.querySelectorAll('#rb-right .vuelta').forEach(e=>e.textContent=''); }
function rbAplica(S){
  const s=S.res.steps[S.idx]; rbLimpiaHL();
  (s.loops||[]).forEach(([n,k])=>{ if(n._el) n._el.classList.add('loopon'); if(n._cnt) n._cnt.textContent=`vuelta ${k} de ${n.n}`; });
  if(s.node._el) s.node._el.classList.add('run');
  RBZ.rob={x:s.x,y:s.y,d:s.d};
  if(s.choca){ RBZ.choque=true; }
  else if(s.falla){ RBZ.falla=s.y*RBZ.R.w+s.x; }
  else if(s.act){ RBZ.cel[s.i].t=s.t; beep(s.act==='P'?520:s.act==='W'?700:880,0.06,'triangle',0.05); }
  else if(s.mv) beep(420,0.03,'sine',0.03);
  S.idx++;
}
function rbFin(S){
  const {err,pend,cesta}=S.res; rbLimpiaHL(); RBZ.running=false; RBZ.step=null;
  if(err){
    rbRender(); if(err.node&&err.node._el) err.node._el.classList.add('shake');
    const m=RB_ERR[err.t]||'¡Uy! Algo no ha salido bien.'; rbMsg(m,'bad'); speakAuto(m); beep(220,0.2,'sawtooth',0.03); return;
  }
  if(pend){
    const i=RBZ.cel.findIndex(c=>RB_PEND.includes(c.t)); RBZ.brillo=i;
    rbRender(); const m=`¡Casi! Aún queda${pend>1?'n':''} ${pend} cosa${pend>1?'s':''} por hacer en el huerto. Mira la casilla que brilla.`;
    rbMsg(m,'bad'); speakAuto(m); beep(260,0.15,'sawtooth',0.03); return;
  }
  const n=rbCuenta(RBZ.prog), st=rbEstrellas(RBZ.R,n);
  RBZ.fin={ok:true,estrellas:st,tarjetas:n,cesta,intentos:RBZ.att};
  let extra=''; if(RBZ.opts.alGanar){ try{ extra=RBZ.opts.alGanar(RBZ.fin)||''; }catch(e){ try{ apuntaFallo(e,'robot'); }catch(_){} } }
  rbRender();
  const m=(st===3?`¡Perfecto! ⭐⭐⭐ Lo has hecho con ${n} tarjetas.`:`¡Huerto listo! ${'⭐'.repeat(st)} Con ${RBZ.R.best} tarjetas o menos conseguirías las tres estrellas.`)+(extra?' '+extra:'');
  rbMsg(m,'good'); speakAuto(m); try{ fanfare(); }catch(e){ beep(880,0.1); }
}
async function rbEjecuta(slow){
  if(RBZ.running||RBZ.step) return;
  if(!RBZ.prog.length){ rbMsg('El programa está vacío. ¡Toca las tarjetas!','bad'); return; }
  RBZ.att++; RBZ.running=true; const S=rbPrepara(); rbRender(); rbMsg(slow?'🐢 Mira qué tarjeta se ilumina en cada momento…':'🤖 El robot está trabajando…');
  const n=S.res.steps.length, delay=slow?650:Math.max(180,Math.min(420,5000/Math.max(1,n)));
  while(S.idx<n){ rbAplica(S); await new Promise(r=>setTimeout(r,delay)); if(curScreen!=='robot'){ RBZ.running=false; return; } }
  rbFin(S);
}
function rbPasoIni(){
  if(RBZ.running) return;
  if(!RBZ.prog.length){ rbMsg('El programa está vacío. ¡Toca las tarjetas!','bad'); return; }
  RBZ.att++; RBZ.step=rbPrepara(); rbRender();
  rbMsg('👣 Pulsa «Siguiente paso» y mira qué tarjeta se ilumina y qué hace el robot.');
  if(!RBZ.step.res.steps.length) rbFin(RBZ.step);
}
function rbPasoSig(){
  const S=RBZ.step; if(!S) return;
  if(S.idx<S.res.steps.length){ rbAplica(S); const s=S.res.steps[S.idx-1], o=s.node.op;
    rbMsg(s.choca?'💥 ¡Choca!':s.falla?'❌ Ahí no puede hacer eso':o==='P'?'🌱 Planta la semilla':o==='W'?'💧 Riega':o==='H'?'🧺 Recoge la verdura':o==='TL'?'↩️ Gira a la izquierda':o==='TR'?'↪️ Gira a la derecha':'👣 Avanza una casilla'); }
  if(S.idx>=S.res.steps.length) setTimeout(()=>rbFin(S),350);
}
function rbPista(){
  const R=RBZ.R, primero=R.sol[0], op=primero.op==='rep'?primero.body[0].op:primero.op;
  const m=primero.op==='rep'?`💡 Pista: el robot puede empezar con un 🔁 Repetir ×${primero.n} que empiece por ${RB_OPS[op].e} ${RB_OPS[op].n}.`:`💡 Pista: la primera tarjeta puede ser ${RB_OPS[op].e} ${RB_OPS[op].n}.`;
  rbMsg(m); speakAuto(m);
}

/* ---------- abrir ---------- */
function rbAyuda(R){
  return R.modo==='flechas'
    ? 'Toca las flechas para llevar al robot por el huerto. Cuando esté encima de una casilla, dile qué hacer: 🌱 plantar, 💧 regar o 🧺 recoger.'
    : 'El robot anda hacia donde mira (la flecha amarilla). 👣 Avanza una casilla; ↩️ y ↪️ lo giran sin moverse. Cuando esté encima de una casilla: 🌱 planta, 💧 riega o 🧺 recoge.';
}
function openRobot(R,opts={}){
  RBZ.R=R; RBZ.opts=opts; RBZ.prog=[]; RBZ.sel=[]; RBZ.running=false; RBZ.step=null; RBZ.att=0; RBZ.vis=null; rbLimpiaEstado();
  $('#rb-title').textContent='🤖 Huerto del robot';
  $('#rb-chip').textContent=(opts.catalog?'🧪 ':'')+(R.trabajo?'🌱 Trabajo de hoy · ':'')+(R.modo==='flechas'?'Flechas':'Girar')+' · nivel '+R.nivel;
  $('#rb-ask').textContent=rbAyuda(R);
  $('#rb-mision').innerHTML=`<div class="rbmis"><b>Hoy toca:</b> ${esc(rbMision(R))}${R.max?` <span class="counter">· como mucho ${R.max} tarjetas</span>`:''}</div>`;
  rbMsg(''); show('robot'); rbRender();
  if(!RBZ.raf){ RBZ.last=0; RBZ.raf=requestAnimationFrame(rbBucle); }
  speakAuto(rbMision(R));
}
$('#rb-back').onclick=()=>{ if(RBZ.running) RBZ.running=false; RBZ.step=null; if(RBZ.opts.volver) RBZ.opts.volver(); else if(RBZ.opts.catalog) openCatalog(); else show('village'); };
$('#rb-speak').onclick=()=>speakNow(rbAyuda(RBZ.R)+' '+rbMision(RBZ.R));
window.addEventListener('resize',()=>{ if(curScreen==='robot') rbDibuja(); });

/* ---------- catálogo de pruebas ---------- */
function rbCatCard(){
  const c=el('div','ecard'); c.style.cursor='default';
  c.innerHTML=`<div class="who">🤖</div><div class="t">Huerto del robot</div><div class="badge">Programar · nuevo</div><div class="counter">Plantar, regar y recoger con tarjetas. Usa el nivel de reto de arriba (1-10).</div>`;
  const row=el('div','choice'); row.style.justifyContent='flex-start';
  [[6,'👧 6-7 años · flechas'],[9,'👧 8-10 años · girar']].forEach(([a,t])=>{ const b=el('button','',t); b.onclick=()=>{ ensureTestProfile(); openRobot(rbGenera(rbModoDe(a),CAT_L,'cat'+Date.now()),{catalog:true}); }; row.append(b); });
  c.append(row); return c;
}
