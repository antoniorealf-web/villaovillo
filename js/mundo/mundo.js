/* =========================================================
   MUNDO AMPLIADO: cámara, fondo, edificios y decorados
   ========================================================= */
let cam={x:0,y:0,ok:false}, viewW=1200, viewH=800, BGC=null;
const ROADS=[
  [[1200,820],[1200,600],[1210,465]],
  [[1200,600],[1060,560],[925,495]],
  [[1200,600],[1340,560],[1460,475]],
  [[1460,475],[1600,470],[1750,445]],
  [[1200,620],[1279,618]],
  [[1200,820],[900,825],[560,830]],
  [[560,745],[560,1350]],
  [[560,745],[405,745]],
  [[560,1175],[405,1175]],
  [[1200,820],[1200,1335]],
  [[960,1335],[1440,1335]],
  [[960,1335],[960,1312]],[[1440,1335],[1440,1312]],
  [[1200,820],[1560,830],[1880,832]],
  [[560,1350],[640,1350]]
];
const POND={x:700,y:1440,rx:170,ry:80};
function inPond(x,y){ return ((x-POND.x)/(POND.rx+10))**2+((y-POND.y)/(POND.ry+10))**2<1; }
const FOREST=(()=>{ const out=[]; let i=0;
  const ok=(x,y)=>!['taller','houseA','plotA','houseB','plotB','panaderia','biblio','tienda','ayto','tend'].some(k=>inRect(x,y,{x:B[k].x-60,y:B[k].y-40,w:B[k].w+120,h:B[k].h+90}))&&!inPond(x,y+20)&&Math.hypot(x-1200,y-820)>200;
  const add=(x0,y0,w,h,n,kind)=>{ let c=0; while(c<n&&i<4000){ i++; const x=x0+seeded(i)*w, y=y0+seeded(i+777)*h; if(ok(x,y)&&!out.some(t=>Math.hypot(t.x-x,t.y-y)<55)){ out.push({x,y,k:kind==='mix'?(seeded(i+3)<0.5?'pine':'round'):kind,s:0.85+seeded(i+9)*0.4,i}); c++; } } };
  add(40,60,620,420,26,'mix'); add(40,480,200,1080,12,'mix'); add(700,1500,1150,90,10,'round'); add(1990,60,380,180,6,'pine'); add(1990,690,380,240,7,'mix'); add(1990,1380,380,200,6,'pine'); add(1640,60,220,200,4,'round');
  return out; })();
const ROCKS=[[690,640,1],[1650,1050,1.2],[1080,1480,0.9],[260,1450,1.1],[1780,560,0.8],[2100,880,1],[480,420,0.9]];
const BUSHES=[[640,560],[1040,700],[1370,700],[760,1020],[1600,1220],[1080,1040],[1330,1040],[230,900],[1700,980],[880,640],[1520,640]];
const BENCHES=[[1060,760],[1340,760]];
const LAMPS=[[1080,700],[1320,700],[1080,940],[1320,940],[560,960],[1200,1150],[1700,830],[800,830]];

function resizeVillage(){
  const r=$('#vwrap').getBoundingClientRect(); vDpr=window.devicePixelRatio||1;
  vcanvas.width=Math.round(r.width*vDpr); vcanvas.height=Math.round(r.height*vDpr);
  vScale=r.height/880; if(r.width/vScale<900) vScale=r.width/900; vScale=Math.max(0.45,Math.min(1.4,vScale));
  viewW=r.width/vScale; viewH=r.height/vScale;
  if(!BGC) buildBG();
  cam.ok=false;
}
function camTarget(){ return {x:clamp(player.x-viewW/2,0,Math.max(0,WW-viewW)), y:clamp(player.y-viewH/2-30,0,Math.max(0,WH-viewH))}; }

function buildBG(){
  const f=1, cv=document.createElement('canvas'); cv.width=WW*f; cv.height=WH*f; const c=cv.getContext('2d'); c.scale(f,f);
  const g=c.createLinearGradient(0,0,0,WH); g.addColorStop(0,'#a6d884'); g.addColorStop(1,'#93c973'); c.fillStyle=g; c.fillRect(0,0,WW,WH);
  for(let i=0;i<260;i++){ c.fillStyle=i%2?'rgba(255,255,255,.07)':'rgba(50,110,30,.08)'; c.beginPath(); c.ellipse(seeded(i)*WW,seeded(i+99)*WH,30+seeded(i+7)*60,12+seeded(i+3)*20,0,0,Math.PI*2); c.fill(); }
  c.fillStyle='rgba(40,100,40,.12)'; c.beginPath(); c.ellipse(340,260,380,260,0,0,Math.PI*2); c.fill();
  c.strokeStyle='rgba(60,120,40,.35)'; c.lineWidth=2; for(let i=0;i<900;i++){ const x=seeded(i+3000)*WW, y=seeded(i+4000)*WH; c.beginPath(); c.moveTo(x-3,y); c.lineTo(x-1,y-6); c.moveTo(x+3,y); c.lineTo(x+1,y-6); c.stroke(); }
  // otra orilla
  c.fillStyle='#b8d8a2'; c.fillRect(1880,0,WW-1880,WH);
  // caminos
  const road=(w,col)=>{ c.strokeStyle=col; c.lineWidth=w; c.lineCap='round'; c.lineJoin='round'; ROADS.forEach(pts=>{ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); if(pts.length===3) c.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]); else pts.slice(1).forEach(p=>c.lineTo(p[0],p[1])); c.stroke(); }); };
  road(50,'#cfb47a'); road(42,'#ecdcae');
  for(let i=0;i<500;i++){ const x=seeded(i+5000)*WW, y=seeded(i+6000)*WH; const d=c.getImageData(x|0,y|0,1,1).data; if(d[0]>220&&d[1]>200){ c.fillStyle='rgba(180,150,100,.35)'; c.beginPath(); c.ellipse(x,y,4,2.5,0,0,Math.PI*2); c.fill(); } }
  // plaza
  const P0=B.plaza; c.fillStyle='#cfb47a'; c.beginPath(); c.arc(P0.x,P0.y,P0.r+6,0,Math.PI*2); c.fill();
  c.fillStyle='#efe1bd'; c.beginPath(); c.arc(P0.x,P0.y,P0.r,0,Math.PI*2); c.fill();
  c.strokeStyle='rgba(180,150,100,.45)'; c.lineWidth=2;
  for(let r=30;r<P0.r;r+=22){ c.beginPath(); c.arc(P0.x,P0.y,r,0,Math.PI*2); c.stroke(); const n=Math.round(r/7); for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+(r/22)*0.3; c.beginPath(); c.moveTo(P0.x+Math.cos(a)*r,P0.y+Math.sin(a)*r); c.lineTo(P0.x+Math.cos(a)*(r+22),P0.y+Math.sin(a)*(r+22)); c.stroke(); } }
  // estanque
  c.fillStyle='#cfb47a'; c.beginPath(); c.ellipse(POND.x,POND.y,POND.rx+12,POND.ry+10,0,0,Math.PI*2); c.fill();
  const pg=c.createRadialGradient(POND.x-40,POND.y-20,10,POND.x,POND.y,POND.rx); pg.addColorStop(0,'#9fdcf5'); pg.addColorStop(1,'#5eb3e0');
  c.fillStyle=pg; c.beginPath(); c.ellipse(POND.x,POND.y,POND.rx,POND.ry,0,0,Math.PI*2); c.fill(); c.strokeStyle=OUT; c.lineWidth=3; c.stroke();
  [[POND.x-90,POND.y+20],[POND.x+70,POND.y-30],[POND.x+110,POND.y+25]].forEach(([x,y])=>{ c.fillStyle='#5bb04f'; c.beginPath(); c.arc(x,y,14,0.3,Math.PI*2-0.3); c.lineTo(x,y); c.closePath(); c.fill(); c.strokeStyle=OUT; c.lineWidth=2; c.stroke(); });
  c.fillStyle='#f6b8c8'; c.beginPath(); c.arc(POND.x+70,POND.y-30,5,0,Math.PI*2); c.fill();
  // río
  c.fillStyle='#cfb47a'; c.beginPath(); c.moveTo(1876,0); for(let y=0;y<=WH;y+=20) c.lineTo(1876+Math.sin(y/80)*10,y); c.lineTo(1962+Math.sin(WH/80)*10,WH); for(let y=WH;y>=0;y-=20) c.lineTo(1962+Math.sin(y/80)*10,y); c.fill();
  c.fillStyle='#6ab7e6'; c.beginPath(); c.moveTo(1884,0); for(let y=0;y<=WH;y+=20) c.lineTo(1884+Math.sin(y/80)*10,y); c.lineTo(1954+Math.sin(WH/80)*10,WH); for(let y=WH;y>=0;y-=20) c.lineTo(1954+Math.sin(y/80)*10,y); c.fill();
  // prado de flores
  for(let i=0;i<220;i++){ const x=1480+seeded(i+7000)*380, y=1380+seeded(i+7100)*200; if(x>1860) continue; drawFlower(c,x,y,['#e4574f','#f4c430','#ffffff','#e46fa8','#a678d6'][i%5]); }
  for(let i=0;i<60;i++){ const x=40+seeded(i+7300)*650, y=520+seeded(i+7400)*1050; if(inPond(x,y)||inRect(x,y,{x:260,y:520,w:320,h:820})) continue; drawFlower(c,x,y,['#ffffff','#f4c430','#e46fa8'][i%3]); }
  BGC=cv;
}

/* ---------- piezas de dibujo ---------- */
function smoke(c,x,y){ for(let i=0;i<4;i++){ const ph=(tGlobal*0.45+i/4)%1; c.fillStyle=`rgba(255,255,255,${0.55*(1-ph)})`; c.beginPath(); c.arc(x+Math.sin(ph*6+i)*5,y-ph*55,5+ph*10,0,Math.PI*2); c.fill(); } }
function winX(c,x,y,w,h,acc){
  const nt=nightLevel()>0.4; if(nt&&curScreen==='village') NIGHTWINS.push([x,y,w,h]);
  roundRect(c,x,y,w,h,7); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.6);
  const g=c.createLinearGradient(x,y,x+w,y+h); g.addColorStop(0,nt?'#fff1b8':'#d8f1ff'); g.addColorStop(1,nt?'#f6b94e':'#8fc8ea'); roundRect(c,x+5,y+5,w-10,h-10,4); c.fillStyle=g; c.fill();
  c.strokeStyle='#fffaf1'; c.lineWidth=3; c.beginPath(); c.moveTo(x+w/2,y+5); c.lineTo(x+w/2,y+h-5); c.moveTo(x+5,y+h/2); c.lineTo(x+w-5,y+h/2); c.stroke();
  c.fillStyle=acc; c.beginPath(); c.moveTo(x+5,y+5); c.lineTo(x+w*0.36,y+5); c.quadraticCurveTo(x+w*0.2,y+h*0.45,x+5,y+h*0.6); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x+w-5,y+5); c.lineTo(x+w*0.64,y+5); c.quadraticCurveTo(x+w*0.8,y+h*0.45,x+w-5,y+h*0.6); c.closePath(); c.fill();
  roundRect(c,x-4,y+h-2,w+8,9,3); c.fillStyle='#9a6338'; c.fill(); ol(c,2);
  ['#e4574f','#f4c430','#e46fa8','#ffffff'].forEach((col,i)=>{ c.fillStyle=col; c.beginPath(); c.arc(x+6+i*(w-12)/3,y+h-4,3.4,0,Math.PI*2); c.fill(); });
}
function doorX(c,cx,by,w,h,col='#9a6338'){
  c.beginPath(); c.moveTo(cx-w/2,by); c.lineTo(cx-w/2,by-h+w/2); c.arc(cx,by-h+w/2,w/2,Math.PI,0); c.lineTo(cx+w/2,by); c.closePath();
  const g=c.createLinearGradient(cx-w/2,0,cx+w/2,0); g.addColorStop(0,shade(col,0.1)); g.addColorStop(1,shade(col,-0.15)); c.fillStyle=g; c.fill(); ol(c,2.8);
  c.strokeStyle=shade(col,-0.3); c.lineWidth=1.6; for(let i=1;i<3;i++){ c.beginPath(); c.moveTo(cx-w/2+i*w/3,by-2); c.lineTo(cx-w/2+i*w/3,by-h+w/3); c.stroke(); }
  c.fillStyle='#f4c430'; c.beginPath(); c.arc(cx+w*0.28,by-h*0.42,3,0,Math.PI*2); c.fill(); ol(c,1.4);
  roundRect(c,cx-w/2-6,by-2,w+12,8,3); c.fillStyle='#c8b9a2'; c.fill(); ol(c,2);
}
function signX(c,cx,cy,text){
  c.font="800 20px 'Baloo 2',sans-serif"; const tw=c.measureText(text).width+26;
  c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.moveTo(cx-tw/3,cy-14); c.lineTo(cx-tw/3,cy-24); c.moveTo(cx+tw/3,cy-14); c.lineTo(cx+tw/3,cy-24); c.stroke();
  roundRect(c,cx-tw/2,cy-15,tw,32,10); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.6);
  c.fillStyle='#5a3d22'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(text,cx,cy+2);
}
function roofPath(c,x,y,w,rh){ c.beginPath(); c.moveTo(x-10,y+rh); c.lineTo(x+w*0.18,y+6); c.quadraticCurveTo(x+w*0.5,y-8,x+w*0.82,y+6); c.lineTo(x+w+10,y+rh); c.quadraticCurveTo(x+w/2,y+rh+10,x-10,y+rh); c.closePath(); }
function bldgX(c,b,o){
  const {x,y,w,h}=b, rh=h*0.44, wy=y+rh-6, wh=h-rh+6;
  c.fillStyle='rgba(40,70,20,.2)'; c.beginPath(); c.ellipse(x+w/2+8,y+h+2,w*0.55,14,0,0,Math.PI*2); c.fill();
  if(o.chimney){ const cx=x+w*0.7; roundRect(c,cx,y-2,24,rh*0.7,4); c.fillStyle='#c27a5a'; c.fill(); ol(c,3); roundRect(c,cx-4,y-8,32,10,3); c.fillStyle='#a7604a'; c.fill(); ol(c,2.6); if(o.smoke) smoke(c,cx+12,y-12); }
  const wg=c.createLinearGradient(0,wy,0,y+h); wg.addColorStop(0,shade(o.wall,0.1)); wg.addColorStop(1,shade(o.wall,-0.08));
  roundRect(c,x+12,wy,w-24,wh,12); c.fillStyle=wg; c.fill();
  c.save(); roundRect(c,x+12,wy,w-24,wh,12); c.clip(); c.fillStyle=shade(o.wall,-0.22); c.fillRect(x,y+h-16,w,16);
  c.strokeStyle=shade(o.wall,-0.32); c.lineWidth=1.5; for(let bx=x+20;bx<x+w-12;bx+=22){ c.beginPath(); c.moveTo(bx,y+h-16); c.lineTo(bx,y+h); c.stroke(); } c.restore();
  roundRect(c,x+12,wy,w-24,wh,12); ol(c,3);
  roofPath(c,x,y,w,rh); const rg=c.createLinearGradient(0,y,0,y+rh); rg.addColorStop(0,shade(o.roof,0.15)); rg.addColorStop(1,shade(o.roof,-0.1)); c.fillStyle=rg; c.fill();
  c.save(); roofPath(c,x,y,w,rh); c.clip(); c.strokeStyle=shade(o.roof,-0.25); c.lineWidth=2;
  for(let ry=y+10,row=0; ry<y+rh+10; ry+=14,row++){ for(let rx=x-12+(row%2?8:0); rx<x+w+14; rx+=16){ c.beginPath(); c.arc(rx,ry,8,0.1,Math.PI-0.1); c.stroke(); } }
  c.fillStyle='rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x+w*0.35,y+rh*0.3,w*0.2,rh*0.12,-0.2,0,Math.PI*2); c.fill(); c.restore();
  roofPath(c,x,y,w,rh); ol(c,3);
  const dw=o.doorW||Math.min(52,w*0.2), dh=Math.min(wh*0.62,dw*1.6);
  if(o.kind!=='nowin'){ const ww=Math.min(48,w*0.19), whh=Math.min(44,wh*0.38); winX(c,x+w*0.12+6,wy+wh*0.2,ww,whh,o.acc||'#e46fa8'); winX(c,x+w*0.88-ww-6,wy+wh*0.2,ww,whh,o.acc||'#e46fa8'); }
  doorX(c,x+w/2,y+h-2,dw,dh,o.door||'#9a6338');
  if(o.extra) o.extra(c,x,y,w,h,rh,wy,wh);
  if(o.label) signX(c,x+w/2,wy-2,o.label);
}
function awning(c,x,y,w,cols){ const n=Math.max(4,Math.round(w/26)), sw=w/n; for(let i=0;i<n;i++){ c.fillStyle=cols[i%2]; c.beginPath(); c.moveTo(x+i*sw,y); c.lineTo(x+(i+1)*sw,y); c.lineTo(x+(i+1)*sw,y+16); c.quadraticCurveTo(x+(i+0.5)*sw,y+26,x+i*sw,y+16); c.closePath(); c.fill(); }
  c.beginPath(); c.moveTo(x,y); c.lineTo(x+w,y); for(let i=n;i>0;i--){ c.lineTo(x+i*sw,y+16); c.quadraticCurveTo(x+(i-0.5)*sw,y+26,x+(i-1)*sw,y+16); } c.closePath(); ol(c,2.4); }
function crate(c,x,y,fruit){ roundRect(c,x,y,30,20,3); c.fillStyle='#c98f5a'; c.fill(); ol(c,2.2); c.strokeStyle='#8a5a36'; c.lineWidth=1.5; c.beginPath(); c.moveTo(x,y+10); c.lineTo(x+30,y+10); c.stroke(); c.font='14px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#000'; c.fillText(fruit+fruit,x+15,y-3); }
function treeRound(c,x,y,s,i,fruit){
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle='rgba(40,70,20,.2)'; c.beginPath(); c.ellipse(0,2,30,9,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(-7,0); c.quadraticCurveTo(-5,-20,-8,-34); c.lineTo(8,-34); c.quadraticCurveTo(5,-20,7,0); c.closePath(); c.fillStyle='#9a6338'; c.fill(); ol(c,2.6);
  const sw=Math.sin(tGlobal*1.3+i)*1.6; c.translate(sw*0.6,0);
  const blobs=[[-17,-44,18],[17,-46,18],[0,-62,22],[-8,-50,17],[9,-52,17]];
  c.lineWidth=6; c.strokeStyle=OUT; blobs.forEach(([bx,by,r])=>{ c.beginPath(); c.arc(bx,by,r,0,Math.PI*2); c.stroke(); });
  c.fillStyle='#5bb04f'; blobs.forEach(([bx,by,r])=>{ c.beginPath(); c.arc(bx,by,r,0,Math.PI*2); c.fill(); });
  c.fillStyle='#78c464'; [[-12,-54,10],[4,-68,11],[16,-52,8]].forEach(([bx,by,r])=>{ c.beginPath(); c.arc(bx,by,r,0,Math.PI*2); c.fill(); });
  c.fillStyle='rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(-4,-72,7,4,-0.4,0,Math.PI*2); c.fill();
  if(fruit){ [[-16,-42],[10,-46],[0,-58],[18,-38],[-8,-62]].forEach(([fx,fy])=>{ c.fillStyle=fruit; c.beginPath(); c.arc(fx,fy,4,0,Math.PI*2); c.fill(); ol(c,1.4); }); }
  c.restore();
}
function treePine(c,x,y,s,i){
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle='rgba(40,70,20,.2)'; c.beginPath(); c.ellipse(0,2,24,8,0,0,Math.PI*2); c.fill();
  roundRect(c,-6,-22,12,22,3); c.fillStyle='#8a5a36'; c.fill(); ol(c,2.6);
  const sw=Math.sin(tGlobal*1.2+i)*1.2;
  [[0,-20,30,30],[0,-42,25,28],[0,-62,19,26]].forEach(([tx,ty,hw,th],k)=>{ c.beginPath(); c.moveTo(tx-hw,ty); c.quadraticCurveTo(tx,ty+8,tx+hw,ty); c.lineTo(tx+sw*(k+1)*0.4,ty-th); c.closePath(); const g=c.createLinearGradient(0,ty-th,0,ty); g.addColorStop(0,'#5fb36a'); g.addColorStop(1,'#3a8a52'); c.fillStyle=g; c.fill(); ol(c,2.6); });
  c.restore();
}
function bushX(c,x,y,flowers){ c.lineWidth=5; c.strokeStyle=OUT; const bl=[[-12,-10,11],[0,-15,13],[12,-10,11]]; bl.forEach(([bx,by,r])=>{ c.beginPath(); c.arc(x+bx,y+by,r,0,Math.PI*2); c.stroke(); }); c.fillStyle='#4fa547'; bl.forEach(([bx,by,r])=>{ c.beginPath(); c.arc(x+bx,y+by,r,0,Math.PI*2); c.fill(); }); if(flowers){ [[-10,-14],[4,-20],[12,-10]].forEach(([fx,fy],k)=>{ c.fillStyle=['#e46fa8','#fff','#f4c430'][k]; c.beginPath(); c.arc(x+fx,y+fy,3.2,0,Math.PI*2); c.fill(); }); } }
function rockX(c,x,y,s){ c.beginPath(); c.moveTo(x-18*s,y); c.quadraticCurveTo(x-20*s,y-16*s,x-4*s,y-20*s); c.quadraticCurveTo(x+16*s,y-22*s,x+20*s,y-4*s); c.quadraticCurveTo(x+18*s,y+2,x-18*s,y); c.closePath(); const g=c.createLinearGradient(0,y-20*s,0,y); g.addColorStop(0,'#c9ced6'); g.addColorStop(1,'#98a0ab'); c.fillStyle=g; c.fill(); ol(c,2.6); c.fillStyle='rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(x-4*s,y-14*s,5*s,2.5*s,-0.3,0,Math.PI*2); c.fill(); }
function lampX(c,x,y){ roundRect(c,x-3,y-56,6,56,2); c.fillStyle='#4a4a5a'; c.fill(); ol(c,2); const a=0.75+Math.sin(tGlobal*3+x)*0.15; c.fillStyle=`rgba(255,226,140,${a*0.35})`; c.beginPath(); c.arc(x,y-62,16,0,Math.PI*2); c.fill(); roundRect(c,x-8,y-72,16,16,4); c.fillStyle=`rgba(255,226,140,${a})`; c.fill(); ol(c,2.2); c.fillStyle='#4a4a5a'; c.beginPath(); c.moveTo(x-11,y-72); c.lineTo(x,y-80); c.lineTo(x+11,y-72); c.closePath(); c.fill(); ol(c,2); }
function benchX(c,x,y){ roundRect(c,x-26,y-22,52,8,3); c.fillStyle='#b97a48'; c.fill(); ol(c,2.2); roundRect(c,x-28,y-12,56,8,3); c.fillStyle='#c98f5a'; c.fill(); ol(c,2.2); c.strokeStyle=OUT; c.lineWidth=3; c.beginPath(); c.moveTo(x-22,y-4); c.lineTo(x-22,y+2); c.moveTo(x+22,y-4); c.lineTo(x+22,y+2); c.stroke(); }
function fountainX(c,x,y,lv){
  if(lv<2){ // pozo
    c.fillStyle='rgba(40,70,20,.2)'; c.beginPath(); c.ellipse(x,y+4,40,12,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(x,y,32,14,0,0,Math.PI*2); c.fillStyle='#b9a68a'; c.fill(); ol(c,3); c.beginPath(); c.ellipse(x,y-3,22,8,0,0,Math.PI*2); c.fillStyle='#4e7aa0'; c.fill(); ol(c,2);
    c.strokeStyle=OUT; c.lineWidth=7; c.beginPath(); c.moveTo(x-26,y-2); c.lineTo(x-26,y-48); c.moveTo(x+26,y-2); c.lineTo(x+26,y-48); c.stroke(); c.strokeStyle='#9a6338'; c.lineWidth=4; c.stroke();
    c.beginPath(); c.moveTo(x-36,y-44); c.lineTo(x,y-66); c.lineTo(x+36,y-44); c.closePath(); c.fillStyle='#c0443d'; c.fill(); ol(c,2.6); return; }
  c.fillStyle='rgba(40,70,20,.2)'; c.beginPath(); c.ellipse(x,y+6,66,18,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(x,y,60,24,0,0,Math.PI*2); c.fillStyle='#c9ced6'; c.fill(); ol(c,3);
  c.beginPath(); c.ellipse(x,y-4,50,17,0,0,Math.PI*2); const g=c.createRadialGradient(x-15,y-8,4,x,y-4,50); g.addColorStop(0,'#bfeaff'); g.addColorStop(1,'#6ab7e6'); c.fillStyle=g; c.fill(); ol(c,2.2);
  for(let k=0;k<3;k++){ const ph=(tGlobal*0.8+k/3)%1; c.strokeStyle=`rgba(255,255,255,${0.7*(1-ph)})`; c.lineWidth=2; c.beginPath(); c.ellipse(x,y-4,10+ph*36,4+ph*12,0,0,Math.PI*2); c.stroke(); }
  roundRect(c,x-8,y-50,16,46,4); c.fillStyle='#d8dde4'; c.fill(); ol(c,2.6);
  c.beginPath(); c.ellipse(x,y-50,20,7,0,0,Math.PI*2); c.fillStyle='#c9ced6'; c.fill(); ol(c,2.4);
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2+tGlobal; c.strokeStyle='rgba(190,235,255,.9)'; c.lineWidth=3; c.beginPath(); c.moveTo(x,y-62); c.quadraticCurveTo(x+Math.cos(a)*22,y-80,x+Math.cos(a)*34,y-12+Math.sin(a)*8); c.stroke(); }
  c.fillStyle='#e8f8ff'; c.beginPath(); c.arc(x,y-64,6,0,Math.PI*2); c.fill();
}
function duckX(c,x,y,dir){ c.save(); c.translate(x,y); c.scale(dir,1); c.beginPath(); c.ellipse(0,0,13,8,0,0,Math.PI*2); c.fillStyle='#fffdf5'; c.fill(); ol(c,2); c.beginPath(); c.arc(9,-9,6,0,Math.PI*2); c.fill(); ol(c,2); c.fillStyle='#f29b38'; c.beginPath(); c.moveTo(14,-9); c.lineTo(20,-8); c.lineTo(14,-6); c.closePath(); c.fill(); ol(c,1.2); c.fillStyle='#3a2a20'; c.beginPath(); c.arc(10,-10,1.4,0,Math.PI*2); c.fill(); c.restore(); }
function lockedX(c,z,icon,label,req){
  c.strokeStyle='#9a6338'; c.lineWidth=5; roundRect(c,z.x,z.y,z.w,z.h,20); c.setLineDash([16,10]); c.stroke(); c.setLineDash([]);
  c.fillStyle='rgba(255,255,255,.22)'; roundRect(c,z.x,z.y,z.w,z.h,20); c.fill();
  c.globalAlpha=.5; c.font='86px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#000'; c.fillText(icon,z.x+z.w/2,z.y+z.h/2-40); c.globalAlpha=1;
  const cx=z.x+z.w/2, cy=z.y+z.h/2+50;
  c.strokeStyle=OUT; c.lineWidth=5; c.beginPath(); c.moveTo(cx,cy+60); c.lineTo(cx,cy); c.stroke(); c.strokeStyle='#9a6338'; c.lineWidth=3; c.stroke();
  roundRect(c,cx-100,cy-34,200,64,10); c.fillStyle='#fff3c4'; c.fill(); ol(c,2.8);
  c.font="800 20px 'Baloo 2',sans-serif"; c.fillStyle='#5a3d22'; c.fillText('🚧 '+label,cx,cy-12); c.font="700 16px 'Baloo 2',sans-serif"; c.fillText('🔒 '+req,cx,cy+14);
}
function tendX(c,b,p){
  const x1=b.x+10,x2=b.x+b.w-10,y=b.y+20;
  for(const px of [x1,x2]){ roundRect(c,px-4,y-14,8,b.h-4,3); c.fillStyle='#9a6338'; c.fill(); ol(c,2.2); }
  c.strokeStyle='#e8dcc4'; c.lineWidth=2.5; c.beginPath(); c.moveTo(x1,y); c.quadraticCurveTo((x1+x2)/2,y+18,x2,y); c.stroke();
  const fabs=(p.fabrics||[]).slice(-5);
  fabs.forEach((f,i)=>{ const fx=x1+16+i*38, fy=y+4+Math.sin((i+0.5)/5*Math.PI)*10, s=Math.max(3,Math.min(6,32/f.w)); const rows=Math.ceil(f.cells.length/f.w), sw=Math.sin(tGlobal*2+i)*1.5;
    c.save(); c.translate(fx+sw,fy); roundRect(c,-2,0,f.w*s+4,rows*s+4,3); c.fillStyle='#efe3cc'; c.fill(); ol(c,1.6);
    f.cells.forEach((k,j)=>{ if(!k||!COLORS[k]) return; c.fillStyle=COLORS[k].c; c.fillRect((j%f.w)*s,Math.floor(j/f.w)*s+2,s-0.5,s-0.5); }); c.fillStyle='#c0443d'; c.fillRect(2,-3,3,6); c.fillRect(f.w*s-3,-3,3,6); c.restore(); });
  signX(c,(x1+x2)/2,b.y+b.h+6,'🧵 Tendedero');
}
function aytoExtra(c,x,y,w,h,rh,wy,wh){
  const cx=x+w/2, cy=y+rh*0.55; c.beginPath(); c.arc(cx,cy,17,0,Math.PI*2); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.6);
  const d=new Date(); const hA=((d.getHours()%12)+d.getMinutes()/60)/12*Math.PI*2-Math.PI/2, mA=d.getMinutes()/60*Math.PI*2-Math.PI/2;
  c.strokeStyle=OUT; c.lineWidth=2.6; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.cos(hA)*8,cy+Math.sin(hA)*8); c.moveTo(cx,cy); c.lineTo(cx+Math.cos(mA)*12,cy+Math.sin(mA)*12); c.stroke();
  c.strokeStyle=OUT; c.lineWidth=3; c.beginPath(); c.moveTo(cx,y-4); c.lineTo(cx,y-46); c.stroke();
  const wv=Math.sin(tGlobal*4)*3; c.beginPath(); c.moveTo(cx,y-46); c.quadraticCurveTo(cx+14,y-50+wv,cx+28,y-44); c.lineTo(cx+28,y-28); c.quadraticCurveTo(cx+14,y-34+wv,cx,y-30); c.closePath(); c.fillStyle='#e46fa8'; c.fill(); ol(c,2); c.font='12px serif'; c.textAlign='center'; c.fillStyle='#000'; c.fillText('🧶',cx+14,y-37+wv/2);
  for(const s of [-1,1]){ roundRect(c,cx+s*42-6,wy+10,12,wh-20,4); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.2); }
}
function biblioExtra(c,x,y,w,h,rh,wy,wh){
  const cx=x+w/2; c.beginPath(); c.arc(cx,y+rh*0.55,15,0,Math.PI*2); c.fillStyle='#d8f1ff'; c.fill(); ol(c,2.6);
  c.font='18px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#000'; c.fillText('🦉',cx,y+rh*0.55+1);
  for(const s of [-1,1]){ roundRect(c,cx+s*38-7,wy+6,14,wh-14,4); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.2); }
  [['#e4574f',0],['#4a8fdc',8],['#f4c430',16]].forEach(([col,o])=>{ roundRect(c,x+w-36,y+h-14-o,26,8,2); c.fillStyle=col; c.fill(); ol(c,1.6); });
}
function bakeryExtra(c,x,y,w,h,rh,wy,wh){ awning(c,x+18,wy+4,w-36,['#f29b38','#fffaf1']); c.font='22px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#000'; c.fillText('🥖🥐',x+w*0.18+18,y+h-22); }
function shopExtra(c,x,y,w,h,rh,wy,wh){ awning(c,x+18,wy+4,w-36,['#e4574f','#fffaf1']); crate(c,x+6,y+h-18,'🍎'); crate(c,x+w-36,y+h-18,'🥕'); }
function tallerExtra(c,x,y,w,h,rh,wy,wh){ const cx=x+w/2; c.beginPath(); c.arc(cx,y+rh*0.58,20,0,Math.PI*2); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.6); c.font='26px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#000'; c.fillText('🧶',cx,y+rh*0.58+1);
  roundRect(c,x+18,y+h-26,36,22,6); c.fillStyle='#c98f5a'; c.fill(); ol(c,2.2); ['#e4574f','#4a8fdc','#f4c430'].forEach((col,i)=>{ c.beginPath(); c.arc(x+26+i*10,y+h-28,6,0,Math.PI*2); c.fillStyle=col; c.fill(); ol(c,1.6); }); }
function houseExtra(c,x,y,w,h){ const mx=x+w-8, my=y+h+4; c.strokeStyle=OUT; c.lineWidth=4; c.beginPath(); c.moveTo(mx,my); c.lineTo(mx,my-30); c.stroke(); roundRect(c,mx-12,my-44,24,16,6); c.fillStyle='#4a8fdc'; c.fill(); ol(c,2.2); }

/* ---------- escena ---------- */
function vis(x,y,m=180){ return x>cam.x-m&&x<cam.x+viewW+m&&y>cam.y-m&&y<cam.y+viewH+m*1.5; }
function drawVillage(){
  const c=vctx, p=P(); if(!p) return;
  const st=progressStats(p); NIGHTN=nightLevel(); NIGHTWINS.length=0;
  if(!cam.ok){ const t=camTarget(); cam.x=t.x; cam.y=t.y; cam.ok=true; }
  const k=vDpr*vScale;
  c.setTransform(1,0,0,1,0,0); c.fillStyle='#93c973'; c.fillRect(0,0,vcanvas.width,vcanvas.height);
  c.setTransform(k,0,0,k,-cam.x*k,-cam.y*k);
  if(BGC) c.drawImage(BGC,cam.x,cam.y,viewW+2,viewH+2,cam.x,cam.y,viewW+2,viewH+2);
  // agua animada
  c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=2;
  for(let i=0;i<16;i++){ const yy=(i*110+tGlobal*35)%WH; if(!vis(1915,yy)) continue; c.beginPath(); c.moveTo(1900+Math.sin(yy/80)*10,yy); c.lineTo(1918+Math.sin(yy/80)*10,yy+8); c.stroke(); }
  if(vis(POND.x,POND.y,260)) for(let k2=0;k2<3;k2++){ const ph=(tGlobal*0.3+k2/3)%1; c.strokeStyle=`rgba(255,255,255,${0.5*(1-ph)})`; c.beginPath(); c.ellipse(POND.x-30+k2*30,POND.y+10,8+ph*40,3+ph*14,0,0,Math.PI*2); c.stroke(); }
  // flores de los caminos (crecen con la experiencia)
  const nf=Math.min(160,st.stars*2+10);
  for(let i=0;i<nf;i++){ const r=ROADS[i%ROADS.length], a=r[0], b=r[r.length-1]; const t=0.12+seeded(i+500)*0.76; const x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t; const side=(i%2?1:-1)*(30+seeded(i)*12); const ang=Math.atan2(b[1]-a[1],b[0]-a[0])+Math.PI/2; const fx=x+Math.cos(ang)*side, fy=y+Math.sin(ang)*side; if(vis(fx,fy)&&!insideBuilding(fx,fy)) drawFlower(c,fx,fy,['#e4574f','#f4c430','#ffffff','#e46fa8','#a678d6'][i%5]); }
  // puente
  drawBridgeX(c);
  // huertos de las casas y zonas cerradas
  const pA=DB.profiles[0], pB=DB.profiles[1];
  drawPlot(c,B.plotA,pA); drawPlot(c,B.plotB,pB);
  if(vis(B.huerto.x+150,B.huerto.y+200,300)) lockedX(c,B.huerto,'🤖','Huerto del robot',zoneReqText('huerto'));
  if(vis(B.lab.x+150,B.lab.y+200,300)) lockedX(c,B.lab,'🔭','Laboratorio',zoneReqText('lab'));
  // patos
  for(let d=0;d<3;d++){ const a=tGlobal*0.25+d*2.1; const x=POND.x+Math.cos(a)*(POND.rx-50), y=POND.y+Math.sin(a)*(POND.ry-30); if(vis(x,y)) duckX(c,x,y,-Math.sin(a)>0?1:-1); }
  // entidades con profundidad
  const E=[];
  const addB=(b,fn)=>{ if(vis(b.x+b.w/2,b.y+b.h/2,b.w)) E.push({y:b.y+b.h,d:fn}); };
  addB(B.taller,()=>bldgX(c,B.taller,{wall:'#f3d3a6',roof:'#d9534f',label:'🧶 Taller del telar',extra:tallerExtra,acc:'#4a8fdc',doorW:58}));
  addB(B.tienda,()=>bldgX(c,B.tienda,{wall:'#fbeed2',roof:'#8c63c9',label:'🏪 Tienda',extra:shopExtra,acc:'#e4574f'}));
  addB(B.ayto,()=>bldgX(c,B.ayto,{wall:'#f6efe2',roof:'#4a6fa5',label:'🎩 Ayuntamiento',extra:aytoExtra,kind:'nowin',acc:'#e4574f'}));
  addB(B.panaderia,()=>bldgX(c,B.panaderia,{wall:'#fbe1b8',roof:'#e0862f',label:'🥐 Panadería',extra:bakeryExtra,chimney:true,smoke:true,acc:'#f29b38'}));
  addB(B.biblio,()=>bldgX(c,B.biblio,{wall:'#e4ecf7',roof:'#3f6aa8',label:'🦉 Biblioteca',extra:biblioExtra,kind:'nowin',acc:'#a678d6'}));
  for(const [k,pp] of [['houseA',pA],['houseB',pB]]) addB(B[k],()=>bldgX(c,B[k],{wall:shade(pp?pp.color:'#c9b89c',0.72),roof:pp?shade(pp.color,-0.05):'#a89a86',label:pp?'🏡 Casa de '+pp.name:'🏚️ Casa vacía',chimney:true,smoke:!!pp,extra:houseExtra,acc:pp?pp.color:'#ccc'}));
  if(vis(B.tablon.x,B.tablon.y)) E.push({y:B.tablon.y+B.tablon.h,d:()=>drawTablon(c,B.tablon)});
  if(vis(B.tend.x+100,B.tend.y)) E.push({y:B.tend.y+B.tend.h,d:()=>tendX(c,B.tend,p)});
  E.push({y:B.plaza.y+20,d:()=>fountainX(c,B.plaza.x,B.plaza.y+10,st.lv)});
  FOREST.forEach(t=>{ if(vis(t.x,t.y)) E.push({y:t.y,d:()=>t.k==='pine'?treePine(c,t.x,t.y,t.s,t.i):treeRound(c,t.x,t.y,t.s,t.i)}); });
  TREE_SPOTS.slice(0,st.trees).forEach(([x,y],i)=>{ if(vis(x,y)) E.push({y,d:()=> i%3===2?bushX(c,x,y,true):treeRound(c,x,y,0.8,i,['#f29b38','#e4574f',null][i%3])}); });
  ROCKS.forEach(([x,y,s])=>{ if(vis(x,y)) E.push({y,d:()=>rockX(c,x,y,s)}); });
  BUSHES.forEach(([x,y],i)=>{ if(vis(x,y)) E.push({y,d:()=>bushX(c,x,y,i%2===0)}); });
  BENCHES.forEach(([x,y])=>{ if(vis(x,y)) E.push({y,d:()=>benchX(c,x,y)}); });
  if(st.lv>=2) LAMPS.forEach(([x,y])=>{ if(vis(x,y)) E.push({y,d:()=>lampX(c,x,y)}); });
  npcs.forEach(n=>{ if(vis(n.x,n.y)) E.push({y:n.y,d:()=>drawNPC(c,n)}); });
  E.push({y:player.y,d:()=>drawPlayer(c)});
  E.sort((a,b)=>a.y-b.y).forEach(e=>e.d());
  if(st.lv>=3) drawBuntingX(c);
  c.fillStyle='#000'; if(NIGHTN<0.5) butterflies.forEach(b=>{ if(vis(b.x,b.y)){ c.font='22px serif'; c.textAlign='center'; c.fillText('🦋',b.x,b.y); } });
  if(tapFx){ c.strokeStyle=`rgba(255,255,255,${1-tapFx.t*2})`; c.lineWidth=4; c.beginPath(); c.ellipse(tapFx.x,tapFx.y,10+tapFx.t*40,5+tapFx.t*20,0,0,Math.PI*2); c.stroke(); }
  drawNight(c,st);
}
function drawBuntingX(c){
  const pts=[[1050,700],[1200,660],[1350,700]];
  c.strokeStyle='#8a5a36'; c.lineWidth=2; c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1],...pts[2]); c.stroke();
  const cols=Object.values(COLORS).map(o=>o.c);
  for(let i=0;i<16;i++){ const t=(i+0.5)/16; const x=(1-t)*(1-t)*pts[0][0]+2*(1-t)*t*pts[1][0]+t*t*pts[2][0], y=(1-t)*(1-t)*pts[0][1]+2*(1-t)*t*pts[1][1]+t*t*pts[2][1];
    c.fillStyle=cols[i%cols.length]; c.beginPath(); c.moveTo(x-8,y); c.lineTo(x+8,y); c.lineTo(x,y+16); c.closePath(); c.fill(); ol(c,1.2); }
}

/* ---------- vecinos y movimiento ---------- */
function setupNPCs(){
  const lv=townLv();
  const list=(VISIT?[]:['alcalde']).concat(['rosa','tomas','coco']); if(lv>=2) list.push('bruno','lia'); if(lv>=3) list.push('nube','hilo');
  const homes={alcalde:[1300,660],rosa:[760,880],tomas:[1520,640],coco:[1470,520],bruno:[1000,1390],lia:[1800,960],nube:[1620,1420],hilo:[1640,760]};
  npcs=list.map(k=>{ const old=npcs.find(n=>n.k===k&&n.home===homes[k]); return old||{k,x:homes[k][0],y:homes[k][1],tx:homes[k][0],ty:homes[k][1],home:homes[k],wait:Math.random()*3}; });
  butterflies=[]; const nb=lv>=2?lv*3:2; for(let i=0;i<nb;i++) butterflies.push({x:400+Math.random()*1400,y:300+Math.random()*1200,a:Math.random()*6,sp:0.5+Math.random()});
  if(!player.placed){ player.x=player.tx=1200; player.y=player.ty=920; player.placed=true; }
}
function insideBuilding(x,y){ return ['taller','tienda','ayto','houseA','houseB','plotA','plotB','tend','tablon','panaderia','biblio'].some(k=>inRect(x,y,B[k]))||inPond(x,y); }
function update(dt){
  heroStep(dt); stepSfx(dt);
  const dx=player.tx-player.x, dy=player.ty-player.y, d=Math.hypot(dx,dy);
  if(d>4){ player.v=Math.min(300,(player.v||60)+700*dt); const sp=Math.min(player.v,d*7+40)*dt; player.x+=dx/d*Math.min(sp,d); player.y+=dy/d*Math.min(sp,d); player.moving=true; if(Math.abs(dx)>2) player.dir=dx>0?1:-1; }
  else if(player.moving){ if(player.path&&player.path.length){ const nx=player.path.shift(); player.tx=nx[0]; player.ty=nx[1]; return; } player.moving=false; player.v=60; player.hop=0.32; if(player.act){ const a=player.act; player.act=null; a(); } }
  for(const n of npcs){
    const ddx=n.tx-n.x, ddy=n.ty-n.y, dd=Math.hypot(ddx,ddy);
    if(dd>3){ const sp=45*dt; n.x+=ddx/dd*Math.min(sp,dd); n.y+=ddy/dd*Math.min(sp,dd); n.dir=ddx>0?1:-1; }
    else { n.wait-=dt; if(n.wait<=0){ n.wait=2+Math.random()*4; n.tx=clamp(n.home[0]+(Math.random()-0.5)*260,80,1850); n.ty=clamp(n.home[1]+(Math.random()-0.5)*200,140,1560); if(insideBuilding(n.tx,n.ty)){ n.tx=n.home[0]; n.ty=n.home[1]; } } }
  }
  for(const b of butterflies){ b.a+=dt*b.sp; b.x+=Math.cos(b.a*0.7)*30*dt; b.y+=Math.sin(b.a)*22*dt; }
  if(tapFx){ tapFx.t+=dt; if(tapFx.t>0.5) tapFx=null; }
  const t=camTarget(), f=Math.min(1,dt*4); cam.x+=(t.x-cam.x)*f; cam.y+=(t.y-cam.y)*f;
}
function handleWorldTap(x,y){
  beep(520,0.04);
  if(VISIT) return visitTap(x,y);
  for(const n of npcs){ if(Math.hypot(n.x-x,n.y-38-y)<44){ talkNPC(n); return; } }
  const mine=DB.cur===0?'A':'B', other=mine==='A'?'B':'A';
  const go=(door,fn)=>{ player.tx=door[0]; player.ty=door[1]; player.act=fn; tapFx={x:door[0],y:door[1],t:0}; };
  if(inRect(x,y,B.taller)) return go(B.taller.door,openWorkshop);
  if(inRect(x,y,{x:B.tablon.x-16,y:B.tablon.y-10,w:B.tablon.w+32,h:B.tablon.h+10})) return go(B.tablon.door,openBoard);
  if(inRect(x,y,B.ayto)) return go(B.ayto.door,openNews);
  if(inRect(x,y,B.panaderia)) return go(B.panaderia.door,()=>openBakery());
  if(inRect(x,y,B.biblio)) return go(B.biblio.door,openLibrary);
  if(inRect(x,y,B.tienda)) return go(B.tienda.door,openShop);
  if(inRect(x,y,{x:B.tend.x,y:B.tend.y-20,w:B.tend.w,h:B.tend.h+40})) return go(B.tend.door,()=>openBook('telas'));
  if(inRect(x,y,B['house'+mine])||inRect(x,y,B['plot'+mine])) return go(B['house'+mine].door,()=>openHouse(DB.cur));
  if(inRect(x,y,B['house'+other])||inRect(x,y,B['plot'+other])) return go(B['house'+other].door,()=>visitOther());
  if(x>=1790&&x<=1990&&y>=740&&y<=890&&!bridgeDone()) return go([1830,850],openBridge);
  const viaBridge=(tx,ty,fn)=>{ const east=player.x>1880, toEast=tx>1880; player.path=[]; if(east!==toEast){ player.path=east?[[1985,828],[1850,828],[tx,ty]]:[[1850,828],[1985,828],[tx,ty]]; player.tx=player.path[0][0]; player.ty=player.path[0][1]; player.path.shift(); } else { player.tx=tx; player.ty=ty; } player.act=fn||null; tapFx={x:tx,y:ty,t:0}; };
  if(x>=1870){
    if(!bridgeDone()) return go([1850,clamp(y,120,1540)],()=>say({face:'🦦',name:NPCS.lia.n,text:'Para cruzar el río hace falta un puente. ¡Estoy construyéndolo! Tócame o toca la obra del puente para ayudarme con botones.'}));
    if(inRect(x,y,B.huerto)) return viaBridge(B.huerto.x+B.huerto.w/2,B.huerto.y+B.huerto.h+20,()=>zoneMsg('huerto'));
    if(inRect(x,y,B.lab)) return viaBridge(B.lab.x+B.lab.w/2,B.lab.y-20,()=>zoneMsg('lab'));
    return viaBridge(clamp(x,1990,2370),clamp(y,60,1580));
  }
  if(player.x>1880){ return viaBridge(clamp(x,30,1860),clamp(y,60,1580)); }
  let tx=clamp(x,30,1860), ty=clamp(y,60,1580);
  if(inPond(tx,ty)){ const a=Math.atan2((ty-POND.y)/POND.ry,(tx-POND.x)/POND.rx); tx=POND.x+Math.cos(a)*(POND.rx+24); ty=POND.y+Math.sin(a)*(POND.ry+24); }
  player.tx=tx; player.ty=ty; player.act=null; tapFx={x:tx,y:ty,t:0};
}
/* ---------- mapa ---------- */
function openMap(){
  const ov=$('#mapov'); ov.classList.add('on'); const cv=$('#mapcv'); const r=ov.getBoundingClientRect();
  const s=Math.min((r.width-40)/WW,(r.height-110)/WH), dpr=window.devicePixelRatio||1;
  cv.style.width=WW*s+'px'; cv.style.height=WH*s+'px'; cv.width=WW*s*dpr; cv.height=WH*s*dpr;
  const c=cv.getContext('2d'); c.setTransform(s*dpr,0,0,s*dpr,0,0); c.drawImage(BGC,0,0);
  const p=P();
  [['taller','#d9534f'],['tienda','#8c63c9'],['ayto','#4a6fa5'],['panaderia','#e0862f'],['biblio','#3f6aa8'],['houseA',DB.profiles[0]?DB.profiles[0].color:'#a89a86'],['houseB',DB.profiles[1]?DB.profiles[1].color:'#a89a86'],['plotA','#8b5e3c'],['plotB','#8b5e3c']].forEach(([k,col])=>{ const b=B[k]; roundRect(c,b.x+10,b.y+20,b.w-20,b.h-20,16); c.fillStyle=col; c.fill(); ol(c,5); });
  FOREST.forEach(t=>{ c.fillStyle='#4f9e45'; c.beginPath(); c.arc(t.x,t.y-30,26*t.s,0,Math.PI*2); c.fill(); });
  const lab=(b,t)=>{ c.font="800 44px 'Baloo 2',sans-serif"; c.textAlign='center'; c.textBaseline='middle'; const tw=c.measureText(t).width+40; roundRect(c,b.x+b.w/2-tw/2,b.y+b.h/2-34,tw,68,18); c.fillStyle='rgba(255,250,241,.95)'; c.fill(); ol(c,5); c.fillStyle='#5a3d22'; c.fillText(t,b.x+b.w/2,b.y+b.h/2+2); };
  lab(B.taller,'🧶 Taller'); lab(B.tienda,'🏪 Tienda'); lab(B.ayto,'🎩 Ayto.'); lab(B.panaderia,'🥐 Panadería'); lab(B.biblio,'🦉 Biblioteca'); lab(B.tend,'🧵 Tendedero');
  lab(B.houseA,DB.profiles[0]?'🏡 '+DB.profiles[0].name:'🏚️'); lab(B.houseB,DB.profiles[1]?'🏡 '+DB.profiles[1].name:'🏚️');
  lab(B.huerto,'🤖 🔒'); lab(B.lab,'🔭 🔒');
  c.fillStyle=p.color; c.beginPath(); c.arc(player.x,player.y-20,30,0,Math.PI*2); c.fill(); ol(c,8); c.font='40px serif'; c.fillStyle='#000'; c.fillText('⭐',player.x,player.y-20);
  cv.onclick=ev=>{ const rr=cv.getBoundingClientRect(); const x=(ev.clientX-rr.left)/s, y=(ev.clientY-rr.top)/s; ov.classList.remove('on'); handleWorldTap(x,y); };
}

$('#hb-map').onclick=()=>openMap();
$('#map-close').onclick=()=>$('#mapov').classList.remove('on');
