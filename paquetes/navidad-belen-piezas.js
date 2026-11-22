"use strict";
/* =========================================================
   NAVIDAD · Belén: las piezas (dibujos). El montaje está en navidad-belen.js.
   Cada pieza: {id, n, g (grupo), p (precio; 0 = gratis desde el principio), w, h (caja para tocarla, a tamaño 1),
   col (se puede cambiar el color de la ropa), para ('9' o '6': única de esa niña), d(c, col, t)}.
   Todas se dibujan con el pie en (0,0). Los ids no se cambian nunca (están guardados en las partidas).
   ========================================================= */
const TAU=Math.PI*2;
const BL_COLS=['#3d6fc4','#c0443d','#d9a441','#4f9a5a','#8a5aa8','#e07a3a','#8a5a36','#eae3d2'];
const BL_GRUPOS=[['sagrada','✨ Portal'],['animales','🐑 Animales'],['gente','🧑‍🌾 Pastores'],['reyes','👑 Reyes'],['paisaje','⛰️ Paisaje'],['cielo','⭐ Cielo']];
function blE(c,x,y,rx,ry,col,lw,rot){ c.beginPath(); c.ellipse(x,y,rx,ry,rot||0,0,TAU); c.fillStyle=col; c.fill(); if(lw) ol(c,lw); }
function blR(c,x,y,w,h,r,col,lw){ roundRect(c,x,y,w,h,r); c.fillStyle=col; c.fill(); if(lw) ol(c,lw); }
function blSombra(c,rx){ c.fillStyle='rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0,0,rx,rx*0.25,0,0,TAU); c.fill(); }
/* Una persona del Belén (unos 62 de alto). o: ropa, manto, velo, panuelo, pelo, barba, corona, turbante, gorro, sombrero,
   aureola, delantal, cinto, piel, hy (altura de la cabeza), manos [[x,y],[x,y]], atras(c,t), frente(c,t), encima(c,t) */
function blPersona(c,o,t){
  const R=o.ropa||'#3d6fc4', piel=o.piel||'#f2cba8', hy=o.hy||-50;
  blSombra(c,15);
  if(o.atras) o.atras(c,t);
  if(o.velo||o.panuelo){ const v=o.velo||o.panuelo; c.beginPath(); c.moveTo(-11,hy-1); c.quadraticCurveTo(-16,hy+14,-14,hy+24); c.lineTo(14,hy+24); c.quadraticCurveTo(16,hy+14,11,hy-1); c.arc(0,hy-1,11,0,Math.PI,true); c.closePath(); c.fillStyle=v; c.fill(); ol(c,1.6); }
  c.fillStyle='#5a3a24'; roundRect(c,-9,-4,7,4.5,2); c.fill(); roundRect(c,2,-4,7,4.5,2); c.fill();
  c.beginPath(); c.moveTo(-9,hy+9); c.quadraticCurveTo(-13,hy+30,-16,-3); c.quadraticCurveTo(0,1.5,16,-3); c.quadraticCurveTo(13,hy+30,9,hy+9); c.quadraticCurveTo(0,hy+6,-9,hy+9); c.closePath(); c.fillStyle=R; c.fill(); ol(c,2);
  c.strokeStyle=shade(R,-0.2); c.lineWidth=1.3; c.beginPath(); c.moveTo(-4,hy+20); c.quadraticCurveTo(-6,hy+36,-7,-4); c.moveTo(4,hy+20); c.quadraticCurveTo(6,hy+36,7,-4); c.stroke();
  if(o.delantal){ blR(c,-8,hy+21,16,-(hy+21)-5,3,o.delantal,1.4); }
  if(o.cinto){ c.fillStyle=o.cinto; roundRect(c,-11.5,hy+22,23,3.6,1.6); c.fill(); }
  if(o.manto){ for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*9,hy+8); c.quadraticCurveTo(s*17,hy+28,s*16,-5); c.lineTo(s*10,-4); c.quadraticCurveTo(s*9,hy+28,s*4,hy+9); c.closePath(); c.fillStyle=o.manto; c.fill(); ol(c,1.6); } }
  const M=o.manos||[[-10,hy+25],[10,hy+25]];
  M.forEach(([mx,my])=>{ c.lineCap='round'; c.strokeStyle=OUT; c.lineWidth=8; c.beginPath(); c.moveTo(Math.sign(mx||1)*7,hy+11); c.lineTo(mx,my-2); c.stroke(); c.strokeStyle=o.manga||o.manto||R; c.lineWidth=5; c.stroke();
    c.beginPath(); c.arc(mx,my,3,0,TAU); c.fillStyle=piel; c.fill(); ol(c,1.2); });
  if(o.frente) o.frente(c,t);
  c.beginPath(); c.arc(0,hy,9,0,TAU); c.fillStyle=piel; c.fill(); ol(c,2);
  if(o.pelo){ c.beginPath(); c.arc(0,hy,9.3,Math.PI*1.0,Math.PI*2.0); c.quadraticCurveTo(5,hy-4,1,hy-3.5); c.quadraticCurveTo(-5,hy-5,-9.3,hy); c.closePath(); c.fillStyle=o.pelo; c.fill(); ol(c,1.3); }
  c.fillStyle='#3a2a20'; [-3.2,3.2].forEach(x=>{ c.beginPath(); c.arc(x,hy+0.5,1.3,0,TAU); c.fill(); });
  c.fillStyle='rgba(230,120,110,.45)'; [-5.6,5.6].forEach(x=>{ c.beginPath(); c.arc(x,hy+3.6,1.8,0,TAU); c.fill(); });
  if(o.barba){ const L=o.barbaL||11; c.beginPath(); c.moveTo(-8.5,hy+1); c.quadraticCurveTo(-7,hy+L,0,hy+L+2); c.quadraticCurveTo(7,hy+L,8.5,hy+1); c.quadraticCurveTo(4,hy+6.5,0,hy+5.2); c.quadraticCurveTo(-4,hy+6.5,-8.5,hy+1); c.closePath(); c.fillStyle=o.barba; c.fill(); ol(c,1.2); }
  else { c.strokeStyle='#3a2a20'; c.lineWidth=1.1; c.beginPath(); c.arc(0,hy+3.2,2.2,0.25,Math.PI-0.25); c.stroke(); }
  const v=o.velo||o.panuelo;
  if(v){ c.beginPath(); c.arc(0,hy-1,10.6,Math.PI*1.05,Math.PI*1.95); c.quadraticCurveTo(0,hy-7.5,-10.2,hy-3.7); c.closePath(); c.fillStyle=v; c.fill(); ol(c,1.4);
    if(o.panuelo){ c.fillStyle=o.banda||shade(o.panuelo,-0.35); roundRect(c,-10.5,hy-7,21,3,1.4); c.fill(); } }
  if(o.gorro){ c.beginPath(); c.arc(0,hy-2,9.6,Math.PI,0); c.closePath(); c.fillStyle=o.gorro; c.fill(); ol(c,1.4); }
  if(o.sombrero){ blE(c,0,hy-5,15,3.6,o.sombrero,1.4); blR(c,-7,hy-14,14,9,3,o.sombrero,1.4); c.fillStyle=shade(o.sombrero,-0.3); c.fillRect(-7,hy-8,14,2); }
  if(o.corona){ c.beginPath(); c.moveTo(-8,hy-6); c.lineTo(-9,hy-16); c.lineTo(-4.5,hy-11); c.lineTo(0,hy-18); c.lineTo(4.5,hy-11); c.lineTo(9,hy-16); c.lineTo(8,hy-6); c.closePath(); c.fillStyle='#f4c430'; c.fill(); ol(c,1.4);
    [[-4.5,'#e23b3b'],[0,'#3d7fe0'],[4.5,'#4f9a5a']].forEach(([x,col])=>{ c.fillStyle=col; c.beginPath(); c.arc(x,hy-8.5,1.5,0,TAU); c.fill(); }); }
  if(o.turbante){ blE(c,0,hy-7,11.5,7,o.turbante,1.6); c.strokeStyle=shade(o.turbante,-0.25); c.lineWidth=1.2; c.beginPath(); c.ellipse(0,hy-7,8,4,0,0.3,Math.PI-0.3); c.stroke();
    blE(c,0,hy-9,2.6,2.6,'#e23b3b',1); c.strokeStyle='#fffaf3'; c.lineWidth=2; c.beginPath(); c.moveTo(0,hy-11); c.quadraticCurveTo(3,hy-18,7,hy-19); c.stroke(); }
  if(o.aureola){ c.strokeStyle='#f4c430'; c.lineWidth=2.2; c.beginPath(); c.ellipse(0,hy-14,8,2.6,0,0,TAU); c.stroke(); }
  if(o.encima) o.encima(c,t);
}
function blCayado(c,x){ c.strokeStyle=OUT; c.lineWidth=4.5; c.lineCap='round'; c.beginPath(); c.moveTo(x,-2); c.lineTo(x,-62); c.arc(x-5,-62,5,0,Math.PI,true); c.stroke(); c.strokeStyle='#9a6338'; c.lineWidth=2.5; c.stroke(); }
function blOveja(c,tumb){ blSombra(c,15);
  if(!tumb){ c.strokeStyle=OUT; c.lineWidth=3.6; for(const x of [-8,-3,4,9]){ c.beginPath(); c.moveTo(x,-8); c.lineTo(x,0); c.stroke(); } c.strokeStyle='#3a3a40'; c.lineWidth=2.2; for(const x of [-8,-3,4,9]){ c.beginPath(); c.moveTo(x,-8); c.lineTo(x,0); c.stroke(); } }
  const y=tumb?-7:-14; c.fillStyle='#fbf8f0'; c.beginPath(); for(let i=0;i<7;i++){ const a=i/7*TAU; c.moveTo(Math.cos(a)*9+5,y+Math.sin(a)*5); c.arc(Math.cos(a)*9,y+Math.sin(a)*5,5.5,0,TAU); } c.fill();
  c.strokeStyle=OUT; c.lineWidth=1.6; c.beginPath(); for(let i=0;i<7;i++){ const a=i/7*TAU; c.moveTo(Math.cos(a)*9+5.5,y+Math.sin(a)*5); c.arc(Math.cos(a)*9,y+Math.sin(a)*5,5.5,0,TAU); } c.stroke();
  c.fillStyle='#fbf8f0'; c.beginPath(); c.ellipse(0,y,11,6,0,0,TAU); c.fill();
  blE(c,12,y-3,4.6,5.6,'#3a3a40',1.4,0.3); blE(c,9,y-6,3,1.6,'#3a3a40',0,-0.6); c.fillStyle='#fff'; c.beginPath(); c.arc(13.5,y-4,1,0,TAU); c.fill(); }

const BL_PIEZAS=[
  /* ---- Portal ---- */
  {id:'portal',n:'Portal de madera',g:'sagrada',p:30,w:200,h:150,d(c){ blSombra(c,100);
    blR(c,-88,-110,176,110,4,'#b98552',2.4); c.strokeStyle='#8a5a36'; c.lineWidth=1.5; for(let x=-70;x<88;x+=18){ c.beginPath(); c.moveTo(x,-108); c.lineTo(x,-2); c.stroke(); }
    c.fillStyle='rgba(60,30,10,.25)'; c.fillRect(-86,-108,172,40);
    blR(c,-86,-14,172,14,3,'#e3c26b',1.6); c.strokeStyle='#c9a24a'; c.lineWidth=1.4; for(let i=0;i<30;i++){ const x=-80+i*5.6; c.beginPath(); c.moveTo(x,-2); c.lineTo(x+4*Math.sin(i),-12); c.stroke(); }
    for(const x of [-92,82]) blR(c,x,-118,10,118,3,'#7a4a2a',2.2);
    c.beginPath(); c.moveTo(-104,-104); c.lineTo(0,-150); c.lineTo(104,-104); c.lineTo(96,-96); c.lineTo(0,-138); c.lineTo(-96,-96); c.closePath(); c.fillStyle='#c9a24a'; c.fill(); ol(c,2.4);
    c.strokeStyle='#a88234'; c.lineWidth=1.3; for(let i=0;i<14;i++){ const u=i/13, x=-100+200*u, y=-104+(-46)*(1-Math.abs(u-0.5)*2); c.beginPath(); c.moveTo(x,y); c.lineTo(x+(u-0.5)*8,y+10); c.stroke(); }
    c.strokeStyle='#6b4a2e'; c.lineWidth=3; c.beginPath(); c.moveTo(56,-96); c.lineTo(56,-80); c.stroke(); blR(c,50,-80,12,14,3,'#ffd36b',1.4); }},
  {id:'cueva',n:'Cueva',g:'sagrada',p:25,w:190,h:130,d(c){ blSombra(c,95);
    c.beginPath(); c.moveTo(-95,0); c.quadraticCurveTo(-100,-90,-40,-122); c.quadraticCurveTo(10,-140,60,-112); c.quadraticCurveTo(102,-80,95,0); c.closePath(); c.fillStyle='#9a8a74'; c.fill(); ol(c,2.6);
    c.fillStyle='#b5a68e'; [[-60,-70,20],[-20,-100,16],[40,-96,18],[70,-50,14]].forEach(([x,y,r])=>{ c.beginPath(); c.ellipse(x,y,r,r*0.6,0.3,0,TAU); c.fill(); });
    c.beginPath(); c.moveTo(-58,0); c.quadraticCurveTo(-60,-78,0,-84); c.quadraticCurveTo(60,-78,58,0); c.closePath(); c.fillStyle='#3e3128'; c.fill(); ol(c,2);
    blR(c,-56,-10,112,10,3,'#e3c26b',1.4); }},
  {id:'maria',n:'María',g:'sagrada',p:10,w:36,h:56,col:true,d(c,col,t){ blPersona(c,{ropa:'#f0dcd0',manto:col||'#3d6fc4',velo:col||'#3d6fc4',hy:-42,manos:[[-3,-26],[3,-26]]},t); }},
  {id:'jose',n:'José',g:'sagrada',p:10,w:40,h:66,col:true,d(c,col,t){ blCayado(c,15); blPersona(c,{ropa:col||'#8a5a36',manto:'#d9a441',pelo:'#6b4a2e',barba:'#6b4a2e',manos:[[-9,-25],[15,-34]]},t); }},
  {id:'nino',n:'Niño en el pesebre',g:'sagrada',p:10,w:46,h:34,d(c){ blSombra(c,22);
    c.strokeStyle=OUT; c.lineWidth=5; c.beginPath(); c.moveTo(-16,0); c.lineTo(-8,-16); c.moveTo(-8,0); c.lineTo(-16,-16); c.moveTo(16,0); c.lineTo(8,-16); c.moveTo(8,0); c.lineTo(16,-16); c.stroke(); c.strokeStyle='#9a6338'; c.lineWidth=3; c.stroke();
    c.beginPath(); c.moveTo(-22,-22); c.lineTo(22,-22); c.lineTo(16,-10); c.lineTo(-16,-10); c.closePath(); c.fillStyle='#b98552'; c.fill(); ol(c,2);
    c.strokeStyle='#e3c26b'; c.lineWidth=2; for(let i=0;i<9;i++){ c.beginPath(); c.moveTo(-18+i*4.5,-21); c.lineTo(-20+i*4.5+Math.sin(i)*3,-27); c.stroke(); }
    blE(c,2,-25,11,5,'#fffaf3',1.6); blE(c,-10,-26,5,5,'#f2cba8',1.4); c.strokeStyle='#f4c430'; c.lineWidth=1.8; c.beginPath(); c.arc(-10,-26,8,Math.PI*1.1,Math.PI*1.9); c.stroke(); }},
  {id:'angel',n:'Ángel',g:'sagrada',p:12,w:52,h:70,col:true,d(c,col,t){ c.translate(0,-6+Math.sin(t*1.5)*2);
    blPersona(c,{ropa:'#fdfbf4',cinto:col||'#d9a441',pelo:'#f4c430',aureola:true,manos:[[-11,-36],[11,-36]],atras(c){ for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*5,-38); c.quadraticCurveTo(s*30,-62,s*26,-30); c.quadraticCurveTo(s*20,-24,s*6,-28); c.closePath(); c.fillStyle='#ffffff'; c.fill(); ol(c,1.8);
      c.strokeStyle='#cfd8e3'; c.lineWidth=1.2; for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(s*(8+k*5),-30); c.lineTo(s*(16+k*4),-46+k*4); c.stroke(); } } }},t); }},
  /* ---- Animales ---- */
  {id:'buey',n:'Buey',g:'animales',p:8,w:70,h:40,d(c){ blSombra(c,32);
    blE(c,-4,-14,26,13,'#9a6a3a',2); c.fillStyle='#fffaf3'; c.beginPath(); c.ellipse(-10,-18,8,5,0.3,0,TAU); c.fill();
    blE(c,24,-20,10,11,'#9a6a3a',2); blE(c,28,-14,7,5,'#e8c4a0',1.4); c.fillStyle='#3a2a20'; c.beginPath(); c.arc(25,-14,1,0,TAU); c.arc(30,-14,1,0,TAU); c.fill();
    c.strokeStyle=OUT; c.lineWidth=4; c.beginPath(); c.moveTo(18,-28); c.quadraticCurveTo(12,-36,16,-40); c.moveTo(30,-28); c.quadraticCurveTo(36,-36,32,-40); c.stroke(); c.strokeStyle='#efe6d2'; c.lineWidth=2.4; c.stroke();
    c.fillStyle='#3a2a20'; c.beginPath(); c.arc(21,-22,1.4,0,TAU); c.arc(28,-22,1.4,0,TAU); c.fill(); blE(c,-28,-8,6,3,'#7a4a2a',1.2); }},
  {id:'mula',n:'Mula',g:'animales',p:8,w:64,h:44,d(c){ blSombra(c,30);
    blE(c,-4,-13,24,12,'#9a9aa2',2); blE(c,20,-21,8,11,'#9a9aa2',2,0.3); blE(c,25,-15,6,5,'#d8d8de',1.3);
    for(const [x,r] of [[16,-0.3],[22,0.2]]){ c.beginPath(); c.ellipse(x,-36,3,9,r,0,TAU); c.fillStyle='#9a9aa2'; c.fill(); ol(c,1.6); }
    c.fillStyle='#3a2a20'; c.beginPath(); c.arc(21,-22,1.4,0,TAU); c.fill(); c.strokeStyle='#5a5a62'; c.lineWidth=3; c.beginPath(); c.moveTo(12,-26); c.lineTo(4,-22); c.stroke(); }},
  {id:'oveja',n:'Oveja',g:'animales',p:5,w:34,h:26,d(c){ blOveja(c,false); }},
  {id:'oveja2',n:'Oveja tumbada',g:'animales',p:5,w:34,h:18,d(c){ blOveja(c,true); }},
  {id:'cabra',n:'Cabra',g:'animales',p:6,w:34,h:32,d(c){ blSombra(c,14); c.strokeStyle='#5a3a24'; c.lineWidth=2.6; for(const x of [-8,-3,4,9]){ c.beginPath(); c.moveTo(x,-10); c.lineTo(x,0); c.stroke(); }
    blE(c,0,-15,12,7,'#c9a27a',1.8); blE(c,-3,-16,4,3,'#fffaf3',0); blE(c,13,-22,5,6,'#c9a27a',1.6,0.3); c.strokeStyle='#efe6d2'; c.lineWidth=2.2; c.beginPath(); c.moveTo(11,-27); c.quadraticCurveTo(8,-33,4,-32); c.stroke();
    c.fillStyle='#efe6d2'; c.beginPath(); c.moveTo(14,-18); c.lineTo(16,-12); c.lineTo(12,-16); c.fill(); c.fillStyle='#3a2a20'; c.beginPath(); c.arc(14,-23,1,0,TAU); c.fill(); }},
  {id:'burro',n:'Burro',g:'animales',p:8,w:56,h:50,d(c){ blSombra(c,24); c.strokeStyle='#6a6a72'; c.lineWidth=4; for(const x of [-14,-8,8,14]){ c.beginPath(); c.moveTo(x,-14); c.lineTo(x,0); c.stroke(); }
    blE(c,0,-20,20,10,'#8e8e96',2); blE(c,20,-32,7,10,'#8e8e96',2,0.6); blE(c,25,-26,5,4,'#d8d8de',1.2);
    for(const [x,r] of [[16,-0.4],[21,0.1]]){ c.beginPath(); c.ellipse(x,-46,2.6,8,r,0,TAU); c.fillStyle='#8e8e96'; c.fill(); ol(c,1.4); }
    c.fillStyle='#3a2a20'; c.beginPath(); c.arc(21,-33,1.3,0,TAU); c.fill(); blR(c,-8,-30,16,8,2,'#c0443d',1.4); }},
  {id:'perro',n:'Perro pastor',g:'animales',p:6,w:28,h:30,d(c){ blSombra(c,12); blE(c,0,-10,10,10,'#2f2f36',1.8); blE(c,2,-9,5,7,'#fffaf3',0); blE(c,4,-22,7,6.5,'#2f2f36',1.8); blE(c,7,-20,4,3.5,'#fffaf3',1);
    blE(c,-1,-25,3,5,'#2f2f36',1.2,-0.5); c.fillStyle='#fff'; c.beginPath(); c.arc(5,-24,1.1,0,TAU); c.fill(); c.strokeStyle='#2f2f36'; c.lineWidth=3; c.beginPath(); c.moveTo(-9,-6); c.quadraticCurveTo(-16,-10,-14,-16); c.stroke(); }},
  {id:'gallina',n:'Gallina',g:'animales',p:4,w:20,h:20,d(c){ blSombra(c,8); c.strokeStyle='#e0a030'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-2,-4); c.lineTo(-2,0); c.moveTo(2,-4); c.lineTo(2,0); c.stroke();
    blE(c,0,-9,8,6,'#c9773a',1.4); blE(c,6,-14,4,4,'#c9773a',1.2); c.fillStyle='#e23b3b'; c.beginPath(); c.arc(6,-18.5,1.8,0,TAU); c.fill(); c.fillStyle='#f4c430'; c.beginPath(); c.moveTo(9.5,-14); c.lineTo(12,-13); c.lineTo(9.5,-12); c.fill(); }},
  {id:'pato',n:'Pato',g:'animales',p:4,w:20,h:16,d(c){ blE(c,0,-6,8,5,'#fffaf3',1.4); blE(c,6,-11,3.6,3.6,'#3f8f5a',1.2); c.fillStyle='#f29b38'; c.beginPath(); c.moveTo(9,-11); c.lineTo(13,-10); c.lineTo(9,-9); c.fill(); }},
  {id:'camello',n:'Camello',g:'reyes',p:15,w:90,h:84,col:true,d(c,col){ blSombra(c,34); c.strokeStyle=OUT; c.lineWidth=6; for(const x of [-22,-14,14,22]){ c.beginPath(); c.moveTo(x,-34); c.lineTo(x,0); c.stroke(); } c.strokeStyle='#c9a26a'; c.lineWidth=3.6; c.stroke();
    c.beginPath(); c.moveTo(-30,-34); c.quadraticCurveTo(-30,-48,-16,-50); c.quadraticCurveTo(-6,-70,4,-50); c.quadraticCurveTo(20,-48,28,-40); c.quadraticCurveTo(30,-30,24,-30); c.lineTo(-26,-30); c.closePath(); c.fillStyle='#d6b07a'; c.fill(); ol(c,2.2);
    c.beginPath(); c.moveTo(24,-40); c.quadraticCurveTo(40,-50,36,-70); c.lineTo(46,-74); c.quadraticCurveTo(50,-60,32,-34); c.closePath(); c.fillStyle='#d6b07a'; c.fill(); ol(c,2); blE(c,46,-74,8,5,'#d6b07a',1.8);
    c.fillStyle='#3a2a20'; c.beginPath(); c.arc(46,-76,1.3,0,TAU); c.fill();
    c.beginPath(); c.moveTo(-14,-52); c.lineTo(14,-52); c.lineTo(18,-34); c.lineTo(-18,-34); c.closePath(); c.fillStyle=col||'#c0443d'; c.fill(); ol(c,1.8); c.fillStyle='#f4c430'; for(let i=0;i<5;i++){ c.beginPath(); c.arc(-14+i*7,-36,1.8,0,TAU); c.fill(); } }},
  /* ---- Pastores y oficios ---- */
  {id:'pastor',n:'Pastor con cayado',g:'gente',p:10,w:40,h:66,col:true,d(c,col,t){ blCayado(c,-15); blPersona(c,{ropa:col||'#7a8f4a',manto:'#efe6d2',panuelo:'#eae3d2',barba:'#8a8a8a',manos:[[-15,-36],[9,-26]]},t); }},
  {id:'pastora',n:'Pastora con cántaro',g:'gente',p:10,w:40,h:64,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#c0443d',delantal:'#fffaf3',panuelo:'#eae3d2',manos:[[-9,-26],[13,-30]],frente(c){ c.beginPath(); c.moveTo(10,-40); c.quadraticCurveTo(24,-38,22,-28); c.quadraticCurveTo(20,-20,14,-20); c.quadraticCurveTo(8,-22,9,-32); c.closePath(); c.fillStyle='#c98f5a'; c.fill(); ol(c,1.6); blR(c,11,-43,8,4,1.5,'#b07a45',1.2); }},t); }},
  {id:'pastor2',n:'Pastor con un corderito',g:'gente',p:12,w:42,h:66,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#8a5a36',panuelo:'#d9a441',barba:'#4a3a2a',manos:[[-14,-42],[14,-42]],atras(c){ c.save(); c.translate(0,-44); c.fillStyle='#fbf8f0'; c.beginPath(); c.ellipse(0,0,19,6.5,0,0,TAU); c.fill(); ol(c,1.5); for(const x of [-12,-5,5,12]){ c.beginPath(); c.arc(x,-3,3.5,0,TAU); c.fill(); } blE(c,19,-3,4.2,4.2,'#3a3a40',1.2); c.strokeStyle='#3a3a40'; c.lineWidth=2.4; c.beginPath(); c.moveTo(-17,3); c.lineTo(-20,10); c.moveTo(15,3); c.lineTo(18,10); c.stroke(); c.restore(); }},t); }},
  {id:'lavandera',n:'Lavandera',g:'gente',p:12,w:60,h:46,col:true,d(c,col,t){ c.save(); c.translate(-10,0); blPersona(c,{ropa:col||'#4f9a5a',panuelo:'#fffaf3',hy:-36,manos:[[14,-14],[20,-12]]},t); c.restore();
    blE(c,18,-6,16,6,'#9a6338',1.8); blE(c,18,-9,13,3.6,'#cfe6f5',1.2); c.fillStyle='#fffaf3'; [[12,-11],[20,-12],[25,-9]].forEach(([x,y])=>{ c.beginPath(); c.ellipse(x,y,4,2.4,0.4,0,TAU); c.fill(); }); }},
  {id:'panadero',n:'Panadero con su horno',g:'gente',p:20,w:76,h:66,col:true,d(c,col,t){ blSombra(c,34);
    c.save(); c.translate(18,0); c.beginPath(); c.moveTo(-20,0); c.quadraticCurveTo(-22,-40,0,-42); c.quadraticCurveTo(22,-40,20,0); c.closePath(); c.fillStyle='#c98f5a'; c.fill(); ol(c,2);
    c.beginPath(); c.moveTo(-8,0); c.lineTo(-8,-12); c.arc(0,-12,8,Math.PI,0); c.lineTo(8,0); c.closePath(); c.fillStyle='#3a2620'; c.fill(); const a=(Math.sin(t*4)+1)/2; c.fillStyle=`rgba(255,${150+a*60},60,.9)`; c.beginPath(); c.ellipse(0,-4,5,3+a*2,0,0,TAU); c.fill(); c.restore();
    c.save(); c.translate(-14,0); blPersona(c,{ropa:col||'#d9a441',delantal:'#fffaf3',gorro:'#fffaf3',manos:[[-9,-26],[10,-28]],frente(c){ blE(c,10,-31,6,3.6,'#d9a060',1.2); }},t); c.restore(); }},
  {id:'herrero',n:'Herrero',g:'gente',p:18,w:66,h:66,col:true,d(c,col,t){ blSombra(c,30);
    c.save(); c.translate(16,0); blR(c,-5,-14,10,14,2,'#5a5a62',1.6); c.beginPath(); c.moveTo(-14,-22); c.lineTo(14,-22); c.lineTo(10,-14); c.lineTo(-10,-14); c.closePath(); c.fillStyle='#4a4a52'; c.fill(); ol(c,1.6); c.restore();
    const g=Math.max(0,Math.sin(t*5))*0.5; c.save(); c.translate(-12,0); blPersona(c,{ropa:col||'#5a5a62',delantal:'#8a5a36',pelo:'#2f2f36',barba:'#2f2f36',barbaL:8,manos:[[12,-30-g*10],[-9,-26]],frente(c){ c.save(); c.translate(12,-30-g*10); c.rotate(-0.6+g); blR(c,-1.5,-14,3,16,1,'#8a5a36',1); blR(c,-6,-18,12,6,1.5,'#4a4a52',1.2); c.restore(); }},t); c.restore();
    if(g>0.4){ c.fillStyle='#ffd84a'; for(let i=0;i<4;i++){ c.beginPath(); c.arc(16+Math.cos(i*1.7)*8,-26-Math.abs(Math.sin(i*2.3))*8,1.4,0,TAU); c.fill(); } } }},
  {id:'pescador',n:'Pescador',g:'gente',p:12,w:56,h:66,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#3d6fc4',sombrero:'#e3c26b',barba:'#6b4a2e',barbaL:7,manos:[[10,-36],[12,-30]],frente(c){ c.strokeStyle='#7a4a2a'; c.lineWidth=2; c.beginPath(); c.moveTo(10,-34); c.lineTo(34,-60); c.stroke(); c.strokeStyle='#5a5a62'; c.lineWidth=0.8; const sw=Math.sin(t*1.5)*2; c.beginPath(); c.moveTo(34,-60); c.lineTo(36+sw,-14); c.stroke();
      c.fillStyle='#9fb6c8'; c.beginPath(); c.ellipse(36+sw,-11,5,2.6,0,0,TAU); c.fill(); ol(c,1); }},t); }},
  {id:'hilandera',n:'Hilandera con su rueca',g:'gente',p:15,w:44,h:68,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#8a5aa8',panuelo:'#f4c430',delantal:'#eae3d2',manos:[[-12,-40],[8,-24]],frente(c){ c.strokeStyle='#9a6338'; c.lineWidth=2.4; c.beginPath(); c.moveTo(-12,-20); c.lineTo(-14,-64); c.stroke();
      blE(c,-14,-58,6,9,'#fbf8f0',1.4); c.strokeStyle='#d9c9a8'; c.lineWidth=1; c.beginPath(); c.moveTo(-12,-52); c.quadraticCurveTo(0,-40,8,-28); c.stroke(); blE(c,9,-22,2.6,5,'#efe6d2',1); }},t); }},
  {id:'zambomba',n:'Niño con zambomba',g:'gente',p:10,w:32,h:50,col:true,d(c,col,t){ c.scale(0.8,0.8); const b=Math.sin(t*6)*2; blPersona(c,{ropa:col||'#e07a3a',pelo:'#6b4a2e',manos:[[-8,-24],[6,-34+b]],frente(c){ blE(c,-3,-20,9,8,'#c98f5a',1.6); blE(c,-3,-27,8,2.4,'#efe6d2',1.2); c.strokeStyle='#9a6338'; c.lineWidth=2; c.beginPath(); c.moveTo(-3,-27); c.lineTo(6,-38+b); c.stroke(); }},t); }},
  {id:'lenador',n:'Leñador',g:'gente',p:12,w:44,h:68,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#c0443d',manga:'#c0443d',pelo:'#8a5a36',barba:'#8a5a36',manos:[[-11,-26],[11,-26]],atras(c){ c.save(); c.translate(0,-44); c.rotate(-0.2); for(let i=0;i<5;i++) blR(c,-18,-4+i*3.2-8,36,4,2,i%2?'#9a6338':'#7a4a2a',1); c.strokeStyle='#c9a24a'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-6,-14); c.lineTo(-6,8); c.moveTo(6,-14); c.lineTo(6,8); c.stroke(); c.restore(); }},t); }},
  {id:'castanera',n:'Castañera',g:'gente',p:18,w:70,h:64,col:true,d(c,col,t){ blSombra(c,32);
    c.save(); c.translate(20,0); blR(c,-14,-24,28,24,3,'#9a6338',1.8); blE(c,0,-26,13,4,'#4a4a52',1.6); const a=(Math.sin(t*3)+1)/2; c.fillStyle=`rgba(255,${140+a*60},60,.8)`; c.beginPath(); c.ellipse(0,-27,9,2,0,0,TAU); c.fill();
      c.fillStyle='#7a4a2a'; for(let i=0;i<5;i++){ c.beginPath(); c.arc(-8+i*4,-29,1.8,0,TAU); c.fill(); } c.strokeStyle='rgba(200,200,210,.6)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-2,-32); c.quadraticCurveTo(-6-a*3,-42,0,-50); c.stroke(); c.restore();
    c.save(); c.translate(-14,0); blPersona(c,{ropa:col||'#4a4a52',panuelo:'#c0443d',delantal:'#eae3d2',manos:[[-9,-26],[12,-28]],frente(c){ c.beginPath(); c.moveTo(10,-34); c.lineTo(18,-34); c.lineTo(14,-24); c.closePath(); c.fillStyle='#fffaf3'; c.fill(); ol(c,1); }},t); c.restore(); }},
  /* ---- Reyes ---- */
  {id:'melchor',n:'Melchor',g:'reyes',p:15,w:40,h:70,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#c0443d',manto:'#d9a441',corona:true,pelo:'#eae3d2',barba:'#f6f3ea',barbaL:16,manos:[[-8,-28],[8,-28]],frente(c){ blR(c,-7,-34,14,9,2,'#f4c430',1.4); blR(c,-8,-37,16,4,1.5,'#d9a441',1.2); }},t); }},
  {id:'gaspar',n:'Gaspar',g:'reyes',p:15,w:40,h:70,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#4f9a5a',manto:'#8a5aa8',corona:true,pelo:'#b07a3a',barba:'#b07a3a',barbaL:10,manos:[[-8,-28],[8,-28]],frente(c){ c.beginPath(); c.moveTo(-5,-26); c.lineTo(5,-26); c.lineTo(6,-36); c.lineTo(-6,-36); c.closePath(); c.fillStyle='#d9d9e0'; c.fill(); ol(c,1.3); blE(c,0,-38,4,2.6,'#d9d9e0',1.2); }},t); }},
  {id:'baltasar',n:'Baltasar',g:'reyes',p:15,w:40,h:70,col:true,d(c,col,t){ blPersona(c,{ropa:col||'#8a5aa8',manto:'#d9a441',turbante:'#fffaf3',piel:'#7a4a2e',barba:'#2a2020',barbaL:7,manos:[[-8,-28],[8,-28]],frente(c){ blE(c,0,-31,6,7,'#c98f5a',1.4); blR(c,-3,-41,6,4,1.5,'#f4c430',1.2); }},t); }},
  {id:'paje',n:'Paje con un cofre',g:'reyes',p:10,w:34,h:54,col:true,d(c,col,t){ c.scale(0.85,0.85); blPersona(c,{ropa:col||'#3d6fc4',gorro:'#c0443d',pelo:'#2a2020',manos:[[-8,-28],[8,-28]],frente(c){ blR(c,-10,-36,20,12,2,'#8a5a36',1.6); c.fillStyle='#f4c430'; c.fillRect(-10,-31,20,2.4); blR(c,-2,-33,4,5,1,'#f4c430',0.8); }},t); }},
  /* ---- Paisaje ---- */
  {id:'montana',n:'Montaña de corcho',g:'paisaje',p:15,w:220,h:150,d(c){ c.beginPath(); c.moveTo(-110,0); c.lineTo(-90,-60); c.lineTo(-60,-80); c.lineTo(-40,-130); c.lineTo(-10,-110); c.lineTo(20,-150); c.lineTo(55,-100); c.lineTo(80,-90); c.lineTo(110,0); c.closePath(); c.fillStyle='#8a6a4a'; c.fill(); ol(c,2.6);
    c.fillStyle='#a8845e'; [[-70,-50,18,10],[-30,-90,14,8],[25,-120,12,7],[60,-60,20,10],[0,-40,22,9]].forEach(([x,y,rx,ry])=>{ c.beginPath(); c.ellipse(x,y,rx,ry,0.2,0,TAU); c.fill(); });
    c.fillStyle='#6b4f36'; for(let i=0;i<60;i++){ c.beginPath(); c.arc(-90+seeded(i)*180,-10-seeded(i+50)*110*(1-Math.abs(seeded(i)-0.55)),1.4,0,TAU); c.fill(); }
    c.fillStyle='#5f9a3e'; [[-80,-20],[-40,-60],[30,-80],[70,-30]].forEach(([x,y])=>{ c.beginPath(); c.ellipse(x,y,10,5,0,0,TAU); c.fill(); }); }},
  {id:'rio',n:'Río de papel de plata',g:'paisaje',p:0,w:160,h:28,d(c,col,t){ c.beginPath(); c.moveTo(-80,-6); c.quadraticCurveTo(-40,-20,0,-10); c.quadraticCurveTo(40,0,80,-16); c.lineTo(80,4); c.quadraticCurveTo(40,18,0,8); c.quadraticCurveTo(-40,-2,-80,12); c.closePath(); c.fillStyle='#c9d6e2'; c.fill(); ol(c,2);
    c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=1.6; for(let i=0;i<8;i++){ const x=-66+i*18, s=Math.sin(t*2+i)*2; c.beginPath(); c.moveTo(x,-2+s); c.lineTo(x+7,-5+s); c.lineTo(x+12,0+s); c.stroke(); }
    c.strokeStyle='#9fb0c4'; c.lineWidth=1; for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(-70+i*26,4); c.lineTo(-62+i*26,8); c.stroke(); } }},
  {id:'rio2',n:'Río en curva',g:'paisaje',p:6,w:140,h:64,d(c,col,t){ c.beginPath(); c.moveTo(-70,-56); c.quadraticCurveTo(-30,-60,-10,-34); c.quadraticCurveTo(10,-8,70,-6); c.lineTo(70,6); c.quadraticCurveTo(0,8,-24,-24); c.quadraticCurveTo(-40,-44,-70,-42); c.closePath(); c.fillStyle='#c9d6e2'; c.fill(); ol(c,2);
    c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=1.6; for(let i=0;i<6;i++){ const u=i/5, x=-60+u*120, y=-50+u*50+(u>0.5?-6:0), s=Math.sin(t*2+i)*2; c.beginPath(); c.moveTo(x,y+s); c.lineTo(x+6,y-3+s); c.lineTo(x+11,y+1+s); c.stroke(); } }},
  {id:'puente',n:'Puente de piedra',g:'paisaje',p:12,w:110,h:42,d(c){ c.beginPath(); c.moveTo(-55,0); c.lineTo(-55,-24); c.quadraticCurveTo(0,-46,55,-24); c.lineTo(55,0); c.lineTo(30,0); c.quadraticCurveTo(0,-34,-30,0); c.closePath(); c.fillStyle='#b5a68e'; c.fill(); ol(c,2.2);
    c.strokeStyle='#8a7a64'; c.lineWidth=1.2; for(let i=0;i<7;i++){ c.beginPath(); c.moveTo(-48+i*16,-26-Math.sin(i/6*Math.PI)*12); c.lineTo(-48+i*16,-18-Math.sin(i/6*Math.PI)*12); c.stroke(); } c.beginPath(); c.moveTo(-55,-24); c.quadraticCurveTo(0,-46,55,-24); c.lineWidth=3; c.strokeStyle='#9a8a74'; c.stroke(); }},
  {id:'palmera',n:'Palmera',g:'paisaje',p:8,w:70,h:130,d(c,col,t){ blSombra(c,18); const sw=Math.sin(t*0.8)*2;
    for(let i=0;i<9;i++){ const y=-i*13, x=Math.sin(i*0.25)*6; blR(c,x-5,y-14,10,14,4,i%2?'#9a6338':'#a8743f',1.3); }
    for(let i=0;i<7;i++){ const a=-Math.PI-0.25+i*(Math.PI+0.5)/6; c.save(); c.translate(6+sw,-118); c.rotate(a); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(16,-9,36,5); c.quadraticCurveTo(18,4,0,0); c.fillStyle=i%2?'#3f8f4a':'#4fa85a'; c.fill(); ol(c,1.4); c.strokeStyle='rgba(30,80,40,.6)'; c.lineWidth=1; c.beginPath(); c.moveTo(2,0); c.quadraticCurveTo(18,-3,34,4); c.stroke(); c.restore(); }
    c.fillStyle='#7a4a2a'; [[2,-114],[10,-112],[6,-108]].forEach(([x,y])=>{ c.beginPath(); c.arc(x+sw,y,3,0,TAU); c.fill(); }); }},
  {id:'casa1',n:'Casita blanca',g:'paisaje',p:15,w:72,h:62,d(c){ blSombra(c,36); blR(c,-32,-50,64,50,3,'#f6f1e6',2.2); blR(c,-36,-56,72,8,3,'#e8dfcc',2); blR(c,10,-68,16,14,2,'#f6f1e6',1.8);
    c.beginPath(); c.moveTo(-8,0); c.lineTo(-8,-20); c.arc(0,-20,8,Math.PI,0); c.lineTo(8,0); c.closePath(); c.fillStyle='#6b4a2e'; c.fill(); ol(c,1.6); blR(c,14,-38,10,10,2,'#3a5a8a',1.4); blR(c,-24,-38,10,10,2,'#3a5a8a',1.4); }},
  {id:'casa2',n:'Casa con tejado',g:'paisaje',p:15,w:80,h:74,d(c){ blSombra(c,40); blR(c,-32,-46,64,46,3,'#e8cf98',2.2);
    c.beginPath(); c.moveTo(-40,-44); c.lineTo(0,-74); c.lineTo(40,-44); c.closePath(); c.fillStyle='#c0503d'; c.fill(); ol(c,2.2); c.strokeStyle='#9a3a2a'; c.lineWidth=1.2; for(let i=1;i<4;i++){ c.beginPath(); c.moveTo(-40+i*7,-44-i*5.3); c.lineTo(40-i*7,-44-i*5.3); c.stroke(); }
    blR(c,-7,-24,14,24,3,'#7a4a2a',1.6); blR(c,14,-34,12,11,2,'#ffe59a',1.4); blR(c,-26,-34,12,11,2,'#ffe59a',1.4); }},
  {id:'castillo',n:'Castillo',g:'paisaje',p:35,w:150,h:136,d(c){ blSombra(c,74); blR(c,-50,-80,100,80,2,'#cfc2a6',2.4);
    for(const x of [-70,46]){ blR(c,x,-112,24,112,2,'#bfb294',2.2); for(let k=0;k<3;k++) blR(c,x+k*9-1,-120,6,9,1,'#bfb294',1.4); blR(c,x+8,-92,8,12,3,'#3a2a20',1); }
    for(let k=0;k<8;k++) blR(c,-50+k*13,-88,8,9,1,'#cfc2a6',1.4);
    c.beginPath(); c.moveTo(-14,0); c.lineTo(-14,-30); c.arc(0,-30,14,Math.PI,0); c.lineTo(14,0); c.closePath(); c.fillStyle='#5a3a24'; c.fill(); ol(c,1.8);
    c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.moveTo(-58,-112); c.lineTo(-58,-134); c.stroke(); c.fillStyle='#c0443d'; c.beginPath(); c.moveTo(-58,-134); c.lineTo(-44,-129); c.lineTo(-58,-124); c.fill(); }},
  {id:'fuego',n:'Fuego de los pastores',g:'paisaje',p:8,w:36,h:40,d(c,col,t){ blSombra(c,16); for(let i=0;i<7;i++){ const a=i/7*TAU; blE(c,Math.cos(a)*13,Math.sin(a)*4-2,4,3,'#8a8a90',1); }
    blR(c,-12,-6,24,5,2,'#7a4a2a',1.2); for(let i=0;i<3;i++){ const fx=-6+i*6, h=16+Math.sin(t*8+i*2)*4; c.beginPath(); c.moveTo(fx-5,-5); c.quadraticCurveTo(fx-4,-5-h*0.7,fx,-5-h); c.quadraticCurveTo(fx+4,-5-h*0.7,fx+5,-5); c.closePath(); c.fillStyle='#f29b38'; c.fill(); c.beginPath(); c.moveTo(fx-2.5,-5); c.quadraticCurveTo(fx-2,-5-h*0.4,fx,-5-h*0.55); c.quadraticCurveTo(fx+2,-5-h*0.4,fx+2.5,-5); c.closePath(); c.fillStyle='#ffd84a'; c.fill(); } }},
  {id:'piedras',n:'Piedras',g:'paisaje',p:0,w:44,h:18,d(c){ blE(c,-10,-6,12,7,'#9a9aa0',1.8); blE(c,9,-5,9,5.5,'#a8a8ae',1.6); blE(c,0,-10,7,5,'#b5b5ba',1.4); }},
  {id:'arbusto',n:'Arbusto',g:'paisaje',p:0,w:44,h:28,d(c){ [[-10,-10,11],[8,-11,11],[0,-17,12]].forEach(([x,y,r])=>blE(c,x,y,r,r*0.9,'#4f9a5a',1.8)); c.fillStyle='#d62828'; [[-6,-14],[8,-16],[2,-22]].forEach(([x,y])=>{ c.beginPath(); c.arc(x,y,1.8,0,TAU); c.fill(); }); }},
  {id:'pozo',n:'Pozo con cubo que sube y baja',g:'paisaje',p:20,para:'6',w:64,h:86,d(c,col,t){ blSombra(c,30);
    for(const x of [-24,20]) blR(c,x,-74,5,52,2,'#7a4a2a',1.6); c.beginPath(); c.moveTo(-32,-70); c.lineTo(0,-86); c.lineTo(32,-70); c.closePath(); c.fillStyle='#c0503d'; c.fill(); ol(c,2);
    c.strokeStyle='#5a3a24'; c.lineWidth=2.4; c.beginPath(); c.moveTo(-22,-62); c.lineTo(22,-62); c.stroke(); const yb=-40+Math.sin(t*1.2)*14; c.strokeStyle='#8a7a64'; c.lineWidth=1.2; c.beginPath(); c.moveTo(0,-62); c.lineTo(0,yb-6); c.stroke(); blR(c,-5,yb-6,10,8,2,'#9a6338',1.2);
    blR(c,-28,-26,56,26,6,'#b5a68e',2.2); c.strokeStyle='#8a7a64'; c.lineWidth=1.2; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-28+i*14+7,-26); c.lineTo(-28+i*14+7,0); c.stroke(); } c.beginPath(); c.moveTo(-28,-13); c.lineTo(28,-13); c.stroke(); blE(c,0,-26,26,5,'#3e5a70',1.6); }},
  {id:'molino',n:'Molino con aspas que giran',g:'paisaje',p:25,para:'9',w:90,h:140,d(c,col,t){ blSombra(c,26);
    c.beginPath(); c.moveTo(-20,0); c.lineTo(-14,-86); c.lineTo(14,-86); c.lineTo(20,0); c.closePath(); c.fillStyle='#f6f1e6'; c.fill(); ol(c,2.2); c.beginPath(); c.moveTo(-18,-84); c.quadraticCurveTo(0,-104,18,-84); c.closePath(); c.fillStyle='#8a5a36'; c.fill(); ol(c,2);
    blR(c,-6,-22,12,22,4,'#6b4a2e',1.4); blR(c,-4,-60,8,10,2,'#3a5a8a',1.2);
    c.save(); c.translate(0,-88); c.rotate(t*0.9); for(let i=0;i<4;i++){ c.rotate(Math.PI/2); c.strokeStyle='#6b4a2e'; c.lineWidth=2.4; c.beginPath(); c.moveTo(0,0); c.lineTo(0,-46); c.stroke(); blR(c,1,-46,10,32,1,'#fffaf3',1.4); c.strokeStyle='#d9c9a8'; c.lineWidth=0.8; for(let k=1;k<4;k++){ c.beginPath(); c.moveTo(1,-46+k*8); c.lineTo(11,-46+k*8); c.stroke(); } } c.restore(); blE(c,0,-88,4,4,'#6b4a2e',1.2); }},
  /* ---- Cielo ---- */
  {id:'estrella',n:'Estrella de Belén',g:'cielo',p:15,w:130,h:60,d(c,col,t){ const a=(Math.sin(t*2)+1)/2; c.save(); c.globalAlpha=0.35+a*0.2; blE(c,40,-30,26,26,'#fff2a8'); c.restore();
    c.beginPath(); c.moveTo(30,-36); c.quadraticCurveTo(-10,-30,-62,-8); c.quadraticCurveTo(-8,-22,30,-24); c.closePath(); c.fillStyle='rgba(255,226,120,.85)'; c.fill();
    c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(20,-30); c.quadraticCurveTo(-10,-24,-50,-10); c.stroke(); navEstrella(c,40,-30,14+a*2,t); }},
  {id:'luna',n:'Luna',g:'cielo',p:8,w:44,h:44,d(c){ c.save(); c.globalAlpha=0.3; blE(c,0,-22,26,26,'#fff6cf'); c.restore(); blE(c,0,-22,18,18,'#fff6cf',1.6); c.fillStyle='rgba(220,200,140,.6)'; [[-6,-26,3.4],[5,-16,2.4],[6,-28,1.8],[-4,-14,1.6]].forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,TAU); c.fill(); }); }},
  {id:'nube',n:'Nube',g:'cielo',p:4,w:84,h:36,d(c,col,t){ c.translate(Math.sin(t*0.4)*3,0); c.fillStyle='#fbfdff'; c.beginPath(); [[-24,-12,14],[-6,-20,17],[16,-16,15],[30,-10,10]].forEach(([x,y,r])=>{ c.moveTo(x+r,y); c.arc(x,y,r,0,TAU); }); c.fill(); c.fillRect(-36,-12,72,12); c.strokeStyle='rgba(150,170,200,.6)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-38,0); c.lineTo(38,0); c.stroke(); }},
  {id:'estrellas',n:'Estrellitas',g:'cielo',p:4,w:84,h:50,d(c,col,t){ [[-30,-30],[-10,-44],[8,-22],[26,-40],[36,-14],[-22,-8]].forEach(([x,y],i)=>{ const a=(Math.sin(t*3+i*1.7)+1)/2; c.save(); c.globalAlpha=0.5+a*0.5; c.fillStyle='#fff2a8'; c.beginPath(); for(let k=0;k<8;k++){ const r=k%2?1.4:4+a*1.5, an=k*Math.PI/4; c.lineTo(x+Math.cos(an)*r,y+Math.sin(an)*r); } c.closePath(); c.fill(); c.restore(); }); }},
  {id:'angel2',n:'Ángel anunciador',g:'cielo',p:12,w:110,h:62,col:true,d(c,col,t,f){ c.translate(0,Math.sin(t*1.3)*3); c.save(); c.translate(-14,0); c.rotate(-0.25);
    blPersona(c,{ropa:'#fdfbf4',cinto:col||'#d9a441',pelo:'#f4c430',aureola:true,manos:[[12,-40],[16,-36]],atras(c){ for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*4,-38); c.quadraticCurveTo(s*28,-64,s*24,-30); c.quadraticCurveTo(s*18,-24,s*5,-28); c.closePath(); c.fillStyle='#fff'; c.fill(); ol(c,1.6); } }},t); c.restore();
    c.save(); c.translate(26,-46); c.rotate(-0.15); blR(c,-4,-8,52,18,3,'#fffaf3',1.6); c.fillStyle='#8a5a36'; c.font='bold 12px Patrick Hand, cursive'; c.textAlign='center'; c.textBaseline='middle'; if(f){ c.translate(22,0); c.scale(-1,1); c.translate(-22,0); } c.fillText('¡Gloria!',22,1); c.restore(); }}
];
function blPieza(id){ return BL_PIEZAS.find(x=>x.id===id); }
