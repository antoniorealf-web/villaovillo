"use strict";
/* =========================================================
   NAVIDAD · parte 2: tienda de Navidad (pestaña «🎄 Navidad» en la tienda de Coco)
   - Para la casa (FURN con paq:'navidad', dibujos propios), para el jardín (SHOP, se ve desde el pueblo)
     y la corona para la puerta (se dibuja en su casa del pueblo).
   - Únicos (para:'9' Berta, para:'6' Cintia; once:1): Berta, telescopio y farolillos; Cintia, casita de jengibre
     y muñeco de nieve. La pieza única del Belén llegará con el Belén.
   - Lo comprado no se borra nunca: los muebles siguen en casa después de Reyes (cada una decide si los quita).
   Lo que se guarda: lo de siempre (p.inv, p.room, p.garden) y p.paq.navidad.puerta = 1 (corona).
   ========================================================= */
const NAVT={};
NAVT.bola=(c,x,y,r,col)=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=col; c.fill(); ol(c,1.2); c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.arc(x-r*0.35,y-r*0.35,r*0.3,0,Math.PI*2); c.fill(); };
NAVT.hoja=(c,x,y,a,col)=>{ c.save(); c.translate(x,y); c.rotate(a); c.beginPath(); c.moveTo(-8,0); c.quadraticCurveTo(-4,-5,0,-2); c.quadraticCurveTo(4,-6,8,0); c.quadraticCurveTo(4,5,0,2); c.quadraticCurveTo(-4,6,-8,0); c.closePath(); c.fillStyle=col||'#2f8a4a'; c.fill(); ol(c,1.3); c.restore(); };
NAVT.copo=(c,x,y,r)=>{ c.save(); c.translate(x,y); c.strokeStyle='#7fa8d6'; c.lineWidth=4; for(let k=0;k<2;k++){ for(let i=0;i<6;i++){ c.save(); c.rotate(i*Math.PI/3); c.beginPath(); c.moveTo(0,0); c.lineTo(0,-r); c.moveTo(0,-r*0.55); c.lineTo(-r*0.25,-r*0.78); c.moveTo(0,-r*0.55); c.lineTo(r*0.25,-r*0.78); c.stroke(); c.restore(); } c.strokeStyle='#ffffff'; c.lineWidth=2; } c.restore(); };
NAVT.lazo=(c,x,y,s,col)=>{ c.fillStyle=col||'#d63a3a'; c.beginPath(); c.moveTo(x,y); c.lineTo(x-9*s,y-6*s); c.lineTo(x-9*s,y+6*s); c.closePath(); c.moveTo(x,y); c.lineTo(x+9*s,y-6*s); c.lineTo(x+9*s,y+6*s); c.closePath(); c.fill(); ol(c,1.4);
  c.beginPath(); c.arc(x,y,2.6*s,0,Math.PI*2); c.fill(); ol(c,1.2); c.strokeStyle=col||'#d63a3a'; c.lineWidth=3*s; c.beginPath(); c.moveTo(x-1,y+2); c.lineTo(x-5*s,y+12*s); c.moveTo(x+1,y+2); c.lineTo(x+5*s,y+12*s); c.stroke(); };
NAVT.caja=(c,x,y,w,h,col,cin)=>{ roundRect(c,x-w/2,y-h,w,h,3); c.fillStyle=col; c.fill(); ol(c,2); c.fillStyle=cin; c.fillRect(x-2.5,y-h,5,h); c.fillRect(x-w/2,y-h/2-2.5,w,5);
  c.beginPath(); c.ellipse(x-5,y-h-3,5,3,0.4,0,Math.PI*2); c.ellipse(x+5,y-h-3,5,3,-0.4,0,Math.PI*2); c.fill(); ol(c,1.2); };

/* ---------- dibujos de los muebles (suelo: pie en (0,0); pared: centro en (0,0)) ---------- */
const NAV_DIB={
  arbolito(c,t){ roundRect(c,-18,-24,36,7,3); c.fillStyle='#a8362f'; c.fill(); ol(c,2); roundRect(c,-15,-18,30,18,4); c.fillStyle='#c0443d'; c.fill(); ol(c,2.2);
    c.fillStyle='#8a5a36'; c.fillRect(-4,-30,8,7);
    [[-26,32,28],[-46,26,26],[-64,19,24]].forEach(([by,hw,h])=>{ c.beginPath(); c.moveTo(-hw,by); c.quadraticCurveTo(0,by+6,hw,by); c.lineTo(0,by-h); c.closePath(); c.fillStyle='#3f9a5a'; c.fill(); ol(c,2.2); });
    [[-18,-32,'#e23b3b'],[14,-34,'#f4c430'],[-6,-50,'#3d7fe0'],[12,-54,'#e23b3b'],[-9,-68,'#f4c430'],[4,-76,'#eef3f8']].forEach(([x,y,col])=>NAVT.bola(c,x,y,3.6,col));
    for(let i=0;i<7;i++){ const a=(Math.sin(t*3+i*1.9)+1)/2; c.fillStyle=`rgba(255,240,150,${0.4+a*0.6})`; c.beginPath(); c.arc(-20+i*6.5,-28-(i%3)*16-(i>3?10:0),1.8,0,Math.PI*2); c.fill(); }
    navEstrella(c,0,-92,9,t); },
  chimenea(c,t){ roundRect(c,-42,-82,84,82,6); c.fillStyle='#c8775a'; c.fill(); ol(c,2.6);
    c.strokeStyle='rgba(120,60,40,.45)'; c.lineWidth=1.5; for(let y=-70,r=0;y<0;y+=12,r++){ c.beginPath(); c.moveTo(-40,y); c.lineTo(40,y); c.stroke(); for(let x=-40+(r%2)*10;x<40;x+=20){ c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+12); c.stroke(); } }
    c.beginPath(); c.moveTo(-24,0); c.lineTo(-24,-34); c.arc(0,-34,24,Math.PI,0); c.lineTo(24,0); c.closePath(); c.fillStyle='#3a2620'; c.fill(); ol(c,2);
    roundRect(c,-18,-9,36,7,3); c.fillStyle='#7a4a2a'; c.fill(); ol(c,1.6);
    for(let i=0;i<3;i++){ const fx=-10+i*10, h=16+Math.sin(t*7+i*2)*4; c.beginPath(); c.moveTo(fx-7,-8); c.quadraticCurveTo(fx-6,-8-h*0.7,fx,-8-h); c.quadraticCurveTo(fx+6,-8-h*0.7,fx+7,-8); c.closePath(); c.fillStyle='#f29b38'; c.fill();
      c.beginPath(); c.moveTo(fx-3.5,-8); c.quadraticCurveTo(fx-3,-8-h*0.45,fx,-8-h*0.6); c.quadraticCurveTo(fx+3,-8-h*0.45,fx+3.5,-8); c.closePath(); c.fillStyle='#ffd84a'; c.fill(); }
    roundRect(c,-48,-90,96,10,4); c.fillStyle='#9a6338'; c.fill(); ol(c,2.4);
    [[-30,'#d63a3a'],[0,'#2e9e5b'],[30,'#3d7fe0']].forEach(([x,col])=>{ roundRect(c,x-5,-76,10,16,2); c.fillStyle=col; c.fill(); ol(c,1.6); c.beginPath(); c.ellipse(x+3,-60,7.5,4.5,0,0,Math.PI*2); c.fill(); ol(c,1.6);
      roundRect(c,x-6.5,-81,13,6,2); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.4); }); },
  regalos(c){ NAVT.caja(c,-16,0,30,26,'#e23b3b','#ffd84a'); NAVT.caja(c,16,0,24,20,'#3d7fe0','#fffaf3'); NAVT.caja(c,2,-24,20,16,'#2e9e5b','#e23b3b'); },
  pascua(c){ roundRect(c,-15,-20,30,20,4); c.fillStyle='#e9d6a8'; c.fill(); ol(c,2.2); roundRect(c,-17,-24,34,6,3); c.fillStyle='#d63a3a'; c.fill(); ol(c,1.6);
    for(let i=0;i<5;i++) NAVT.hoja(c,Math.cos(i*1.26+0.6)*14,-36+Math.sin(i*1.26+0.6)*8,i*1.26+0.6,'#2f8a4a');
    for(let i=0;i<7;i++){ const a=i/7*Math.PI*2; c.save(); c.translate(Math.cos(a)*12,-44+Math.sin(a)*9); c.rotate(a); c.beginPath(); c.ellipse(0,0,11,5,0,0,Math.PI*2); c.fillStyle='#e0303a'; c.fill(); ol(c,1.4); c.restore(); }
    c.fillStyle='#f4c430'; for(let i=0;i<4;i++){ c.beginPath(); c.arc(-3+(i%2)*6,-46+Math.floor(i/2)*4,2,0,Math.PI*2); c.fill(); } },
  telescopio(c,t){ c.strokeStyle=OUT; c.lineWidth=6; c.beginPath(); c.moveTo(0,-42); c.lineTo(-22,0); c.moveTo(0,-42); c.lineTo(22,0); c.moveTo(0,-42); c.lineTo(4,0); c.stroke();
    c.strokeStyle='#9a6338'; c.lineWidth=3.5; c.stroke();
    c.save(); c.translate(0,-46); c.rotate(-0.55); roundRect(c,-34,-8,68,16,6); c.fillStyle='#3b4a7a'; c.fill(); ol(c,2.4); roundRect(c,26,-10,12,20,4); c.fillStyle='#5a6fa8'; c.fill(); ol(c,2);
    c.fillStyle='#f4c430'; [-14,8].forEach(x=>{ c.fillRect(x,-8,4,16); }); roundRect(c,-42,-5,9,10,3); c.fillStyle='#2c2c34'; c.fill(); ol(c,1.6); c.restore();
    const a=(Math.sin(t*2.5)+1)/2; c.save(); c.globalAlpha=0.4+a*0.6; navEstrella(c,40,-90,5+a*2,t); c.restore(); },
  jengibre(c){ c.beginPath(); c.ellipse(0,-3,36,7,0,0,Math.PI*2); c.fillStyle='#fffaf3'; c.fill(); ol(c,2);
    roundRect(c,-23,-38,46,34,3); c.fillStyle='#b9773e'; c.fill(); ol(c,2.4);
    c.beginPath(); c.moveTo(-30,-34); c.lineTo(0,-62); c.lineTo(30,-34); c.closePath(); c.fillStyle='#8a5228'; c.fill(); ol(c,2.4);
    c.fillStyle='#fffaf3'; c.beginPath(); c.moveTo(-30,-34); c.lineTo(0,-62); c.lineTo(30,-34); for(let i=6;i>=0;i--) c.quadraticCurveTo(-30+(i+0.5)*60/7*1,-28,-30+i*60/7,-34); c.closePath(); c.globalAlpha=0.95; c.fill(); c.globalAlpha=1;
    c.beginPath(); c.moveTo(-6,-4); c.lineTo(-6,-16); c.arc(0,-16,6,Math.PI,0); c.lineTo(6,-4); c.closePath(); c.fillStyle='#6b3e1e'; c.fill(); ol(c,1.6);
    for(const wx of [-15,15]){ roundRect(c,wx-5,-30,10,10,2); c.fillStyle='#ffe59a'; c.fill(); ol(c,1.4); c.strokeStyle='#fffaf3'; c.lineWidth=1.6; c.beginPath(); c.moveTo(wx,-30); c.lineTo(wx,-20); c.moveTo(wx-5,-25); c.lineTo(wx+5,-25); c.stroke(); }
    ['#e23b3b','#2e9e5b','#f4c430','#3d7fe0','#e46fa8'].forEach((col,i)=>{ c.fillStyle=col; c.beginPath(); c.arc(-18+i*9,-8,2.4,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(-14+i*7,-44+(i%2)*4,2.2,0,Math.PI*2); c.fill(); });
    c.strokeStyle='#fffaf3'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(30,-2); c.lineTo(30,-20); c.arc(26,-20,4,0,Math.PI,true); c.stroke(); c.strokeStyle='#e23b3b'; c.lineWidth=4; c.setLineDash([3,3]); c.stroke(); c.setLineDash([]); },
  corona(c){ for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; NAVT.hoja(c,Math.cos(a)*22,Math.sin(a)*22,a+Math.PI/2,i%2?'#2f8a4a':'#3fa35c'); }
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+0.3; c.fillStyle='#d62828'; for(const [dx,dy] of [[0,0],[3,2],[-2,3]]){ c.beginPath(); c.arc(Math.cos(a)*22+dx,Math.sin(a)*22+dy,2.4,0,Math.PI*2); c.fill(); } }
    NAVT.lazo(c,0,22,1.3); },
  acebo(c){ c.strokeStyle='#2f6a3a'; c.lineWidth=3; c.beginPath(); c.moveTo(-52,-20); c.quadraticCurveTo(0,6,52,-20); c.stroke();
    for(let i=0;i<9;i++){ const u=(i+0.5)/9, x=-52+104*u, y=-20+26*4*u*(1-u)*0.5+((1-u)*(1-u)*0+0); const yy=(1-u)*(1-u)*-20+2*(1-u)*u*6+u*u*-20; NAVT.hoja(c,x-4,yy+2,0.5,'#2f8a4a'); NAVT.hoja(c,x+4,yy+2,-0.5,'#3fa35c'); if(i%2===0){ c.fillStyle='#d62828'; c.beginPath(); c.arc(x,yy,2.6,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(x+3,yy+3,2.4,0,Math.PI*2); c.fill(); } } },
  calcetin(c){ c.strokeStyle='#8a5a36'; c.lineWidth=3; c.beginPath(); c.moveTo(-4,-34); c.lineTo(-4,-28); c.stroke(); c.fillStyle='#8a5a36'; c.beginPath(); c.arc(-4,-36,3,0,Math.PI*2); c.fill();
    c.beginPath(); c.moveTo(-14,-24); c.lineTo(6,-24); c.lineTo(6,6); c.quadraticCurveTo(22,6,22,18); c.quadraticCurveTo(22,28,6,28); c.lineTo(-6,28); c.quadraticCurveTo(-14,28,-14,18); c.closePath(); c.fillStyle='#d63a3a'; c.fill(); ol(c,2.2);
    c.fillStyle='#fffaf3'; for(const [x,y] of [[-6,6],[2,14],[-8,18],[12,20]]){ c.beginPath(); c.arc(x,y,2,0,Math.PI*2); c.fill(); }
    roundRect(c,-17,-30,26,10,4); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.8); },
  copos(c,t){ c.strokeStyle='#b5a58a'; c.lineWidth=1.5; [[-30,6],[0,-10],[30,12]].forEach(([x,y],i)=>{ const sw=Math.sin(t*1.5+i)*3; c.beginPath(); c.moveTo(x,-40); c.lineTo(x+sw,y-12); c.stroke(); NAVT.copo(c,x+sw,y,12); }); },
  farolillos(c,t){ c.strokeStyle='#8a5a36'; c.lineWidth=2; c.beginPath(); c.moveTo(-50,-28); c.quadraticCurveTo(0,-8,50,-28); c.stroke();
    [[-30,'#e4574f'],[0,'#f4c430'],[30,'#4a8fdc']].forEach(([x,col],i)=>{ const y=-20+(i===1?8:3), sw=Math.sin(t*1.4+i)*0.08; c.save(); c.translate(x,y); c.rotate(sw);
      c.strokeStyle=OUT; c.lineWidth=1.5; c.beginPath(); c.moveTo(0,0); c.lineTo(0,6); c.stroke();
      const nt=nightLevel()>0.5; if(nt){ c.fillStyle='rgba(255,220,120,.35)'; c.beginPath(); c.arc(0,22,22,0,Math.PI*2); c.fill(); }
      roundRect(c,-6,5,12,4,1.5); c.fillStyle='#2c2c34'; c.fill(); c.beginPath(); c.ellipse(0,22,13,15,0,0,Math.PI*2); c.fillStyle=col; c.fill(); ol(c,2);
      c.strokeStyle='rgba(0,0,0,.18)'; c.lineWidth=1.2; for(const k of [-0.5,0,0.5]){ c.beginPath(); c.ellipse(0,22,13*Math.abs(k)+0.5,15,0,-Math.PI/2,Math.PI/2,k<0); c.stroke(); }
      roundRect(c,-6,36,12,4,1.5); c.fillStyle='#2c2c34'; c.fill(); c.strokeStyle='#d63a3a'; c.lineWidth=1.5; c.beginPath(); c.moveTo(0,40); c.lineTo(0,48); c.stroke(); c.restore(); }); }
};
/* Muebles de Navidad (se añaden a FURN; siempre existen, pero solo se venden en Navidad) */
[
  {k:'nav_arbolito',e:'🎄',n:'Árbol de Navidad',p:40,z:'floor',draw:NAV_DIB.arbolito},
  {k:'nav_chimenea',e:'🔥',n:'Chimenea con calcetines',p:60,z:'floor',draw:NAV_DIB.chimenea},
  {k:'nav_regalos',e:'🎁',n:'Montón de regalos',p:20,z:'floor',draw:NAV_DIB.regalos},
  {k:'nav_pascua',e:'🌺',n:'Flor de Pascua',p:20,z:'floor',draw:NAV_DIB.pascua},
  {k:'nav_corona',e:'💚',n:'Corona de Navidad',p:25,z:'wall',draw:NAV_DIB.corona},
  {k:'nav_acebo',e:'🌿',n:'Guirnalda de acebo',p:20,z:'wall',draw:NAV_DIB.acebo},
  {k:'nav_calcetin',e:'🧦',n:'Calcetín de Navidad',p:15,z:'wall',draw:NAV_DIB.calcetin},
  {k:'nav_copos',e:'❄️',n:'Copos de papel',p:15,z:'wall',draw:NAV_DIB.copos},
  {k:'nav_telescopio',e:'🔭',n:'Telescopio para buscar la estrella',p:60,z:'floor',draw:NAV_DIB.telescopio,para:'9',once:1,nota:'Único: solo hay uno en todo el pueblo'},
  {k:'nav_farolillos',e:'🏮',n:'Farolillos de papel',p:30,z:'wall',draw:NAV_DIB.farolillos,para:'9',once:1,nota:'Único: de noche se iluminan'},
  {k:'nav_jengibre',e:'🏠',n:'Casita de jengibre',p:45,z:'floor',draw:NAV_DIB.jengibre,para:'6',once:1,nota:'Única: solo hay una en todo el pueblo'}
].forEach(f=>{ f.paq='navidad'; if(!FURN.some(x=>x.k===f.k)) FURN.push(f); });
/* Para el jardín (se ven en el huerto de su casa, en el pueblo) */
[
  {k:'nav_abeto',e:'🎄',n:'Abeto con luces',p:25,r:0},
  {k:'nav_reno',e:'🦌',n:'Reno',p:35,r:0},
  {k:'nav_trineo',e:'🛷',n:'Trineo',p:30,r:0},
  {k:'nav_regalo',e:'🎁',n:'Regalo grande',p:15,r:0},
  {k:'nav_muneco',e:'⛄',n:'Muñeco de nieve',p:40,r:0,para:'6',once:1,nota:'Único: solo hay uno en todo el pueblo'}
].forEach(s=>{ s.paq='navidad'; if(!SHOP.some(x=>x.k===s.k)) SHOP.push(s); });

/* Corona de la puerta: se compra una vez y se ve en su casa del pueblo durante la Navidad */
const NAV_PUERTA={n:'Corona para tu puerta',p:20};
function navPuerta(p){ return !!(p&&((p.paq||{}).navidad||{}).puerta); }
function tarjetaPuerta(g,p){
  const c=el('div','sitem'); const ic=document.createElement('canvas'), dpr=window.devicePixelRatio||1; ic.width=90*dpr; ic.height=80*dpr; ic.style.width='90px'; ic.style.height='80px'; const cx=ic.getContext('2d'); cx.scale(dpr,dpr);
  doorX(cx,45,78,40,64,'#9a6338'); cx.save(); cx.translate(45,40); cx.scale(0.55,0.55); NAV_DIB.corona(cx); cx.restore();
  c.append(ic); c.append(el('div','n',NAV_PUERTA.n)); c.append(el('div','counter','Se verá en tu casa, en el pueblo'));
  if(navPuerta(p)){ c.append(el('div','counter','✅ Ya la tienes puesta')); g.append(c); return; }
  const b=el('button','btn green','🔘 '+NAV_PUERTA.p); b.disabled=p.coins<NAV_PUERTA.p;
  b.onclick=()=>{ if(p.coins<NAV_PUERTA.p||VISIT) return; p.coins-=NAV_PUERTA.p; paqDatosNina(p,'navidad').puerta=1; save('Compró: corona para la puerta'); sfxBuy(); toast('💚 ¡Corona colgada en tu puerta!'); renderShop(); };
  c.append(b); g.append(c);
}
NAV.enchufes.tienda=function(){
  return [{k:'navidad',t:'🎄 Navidad',render(g,p){
    const h=t=>{ const d=el('div','wsec',t); d.style.gridColumn='1/-1'; g.append(d); };
    const mio=x=>x.para===grupoDe(p), deNav=x=>x.paq==='navidad';
    h('⭐ Únicos: cada una tiene los suyos');
    FURN.filter(f=>deNav(f)&&mio(f)).forEach(f=>tarjetaMueble(g,p,f)); SHOP.filter(s=>deNav(s)&&mio(s)).forEach(s=>tarjetaJardin(g,p,s));
    FURN.filter(f=>deNav(f)&&f.para&&!mio(f)).forEach(f=>tarjetaMueble(g,p,f)); SHOP.filter(s=>deNav(s)&&s.para&&!mio(s)).forEach(s=>tarjetaJardin(g,p,s));
    h('🛋️ Para tu casa'); FURN.filter(f=>deNav(f)&&!f.para&&!f.abre&&!f.regalo).forEach(f=>tarjetaMueble(g,p,f));
    h('🌼 Para tu jardín (se ve desde el pueblo)'); SHOP.filter(s=>deNav(s)&&!s.para).forEach(s=>tarjetaJardin(g,p,s));
    h('🚪 Para tu puerta'); tarjetaPuerta(g,p);
  }}];
};
/* La corona en la puerta de su casa del pueblo (se suma a lo que ya dibuja la Navidad) */
(function(){ const antes=NAV.enchufes.pueblo;
  NAV.enchufes.pueblo=function(ctx){ const d=antes.call(this,ctx), ad=d.adorna;
    d.adorna=(c,tipo,o)=>{ ad(c,tipo,o); if(tipo==='fachada'&&o.nina!=null&&navPuerta(DB.profiles[o.nina])){ const cy=o.y+o.h-2-o.dh*0.66; c.translate(o.x+o.w/2,cy); c.scale(0.42,0.42); NAV_DIB.corona(c); } };
    return d; }; })();

/* ---------- dibujos de las cosas de Navidad del jardín (25 nov 2026) ----------
   Se añaden a JD_DIB, JD_ALTO y JARDIN_TAM (js/zonas/casa/jardin-objetos.js y jardin-suelo.js), con el pie en (0,0).
   Se cargan siempre: lo comprado se sigue viendo después de Reyes. */
Object.assign(JARDIN_TAM,{sh_nav_reno:[2,1]});
Object.assign(JD_ALTO,{sh_nav_abeto:150,sh_nav_reno:78,sh_nav_trineo:50,sh_nav_regalo:46,sh_nav_muneco:86});
Object.assign(JD_DIB,{
  sh_nav_abeto(c,t){ joSombra(c,46); joRR(c,-7,-22,14,22,3,'#7a4f2e',1.8);
    const pisos=[[-20,46],[-52,38],[-82,30],[-108,21]];
    pisos.forEach(([y,an],j)=>{ c.beginPath(); c.moveTo(-an,y); c.lineTo(0,y-44); c.lineTo(an,y); c.quadraticCurveTo(0,y+8,-an,y); c.fillStyle=j%2?'#2f7d4c':'#3a8f58'; c.fill(); ol(c,2.2);
      c.beginPath(); c.moveTo(-an*0.42,y-25); c.lineTo(0,y-44); c.lineTo(an*0.42,y-25); c.quadraticCurveTo(0,y-19,-an*0.42,y-25); c.fillStyle='#fff'; c.fill(); });
    c.strokeStyle='#f4c430'; c.lineWidth=2; [[-34,-30,30,-46],[-26,-62,24,-74],[-18,-92,16,-100]].forEach(([a,b,d,e])=>{ c.beginPath(); c.moveTo(a,b); c.quadraticCurveTo((a+d)/2,b+10,d,e); c.stroke(); });
    const cols=['#e4574f','#f4c430','#4a8fdc','#55b05a','#f6b8cf'];
    [[-30,-28],[-12,-24],[10,-26],[30,-30],[-22,-58],[0,-56],[20,-60],[-14,-88],[12,-86],[0,-112]].forEach(([x,y],j)=>{ const on=Math.sin(t*3+j*1.7)>-0.2;
      if(on){ c.fillStyle='rgba(255,240,180,.5)'; c.beginPath(); c.arc(x,y,6,0,Math.PI*2); c.fill(); } NAVT.bola(c,x,y,3.4,on?cols[j%5]:shade(cols[j%5],-0.35)); });
    c.save(); c.translate(0,-134); c.rotate(Math.sin(t)*0.05); c.beginPath(); for(let k=0;k<10;k++){ const r=k%2?5:12, a=-Math.PI/2+k*Math.PI/5; c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fillStyle='#f4c430'; c.fill(); ol(c,1.8); c.restore(); },
  sh_nav_reno(c,t){ joSombra(c,40); const cab=Math.sin(t*0.8)*0.06;
    [[-26,-34],[-14,-34],[16,-34],[28,-34]].forEach(([x,y])=>{ joRR(c,x-3,y,7,34,3,'#8a5a36',1.6); joRR(c,x-4,-6,9,6,2,'#3b2f3a',1.2); });
    c.beginPath(); c.ellipse(0,-44,36,17,0,0,Math.PI*2); c.fillStyle='#b07a4a'; c.fill(); ol(c,2.2); c.beginPath(); c.ellipse(-2,-36,22,7,0,0,Math.PI*2); c.fillStyle='#f1dfc4'; c.fill();
    c.beginPath(); c.ellipse(-36,-50,5,4,0,0,Math.PI*2); c.fillStyle='#f1dfc4'; c.fill(); ol(c,1.4);
    c.save(); c.translate(26,-54); c.rotate(cab); joRR(c,-6,-22,14,26,6,'#b07a4a',2); c.translate(4,-26);
    c.strokeStyle=OUT; c.lineWidth=5; c.lineCap='round'; const ast=()=>{ c.beginPath(); c.moveTo(-4,-6); c.lineTo(-12,-24); c.moveTo(-9,-17); c.lineTo(-18,-20); c.moveTo(-11,-22); c.lineTo(-8,-32); c.moveTo(4,-6); c.lineTo(10,-26); c.moveTo(8,-18); c.lineTo(17,-22); c.moveTo(10,-24); c.lineTo(8,-34); c.stroke(); };
    ast(); c.strokeStyle='#8a5a36'; c.lineWidth=2.6; ast(); c.lineCap='butt';
    c.beginPath(); c.ellipse(4,0,13,10,0,0,Math.PI*2); c.fillStyle='#b07a4a'; c.fill(); ol(c,2); c.beginPath(); c.ellipse(15,3,7,5.5,0,0,Math.PI*2); c.fillStyle='#d9b08a'; c.fill(); ol(c,1.4);
    c.fillStyle='#3b2f3a'; c.beginPath(); c.arc(20,2,2.6,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(6,-3,2,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(-8,-6,6,3,-0.6,0,Math.PI*2); c.fillStyle='#8a5a36'; c.fill(); ol(c,1.2); c.restore();
    c.strokeStyle='#c94a3a'; c.lineWidth=4; c.beginPath(); c.arc(26,-36,9,0.2,Math.PI-0.4); c.stroke(); c.beginPath(); c.arc(30,-27,4,0,Math.PI*2); c.fillStyle='#f4c430'; c.fill(); ol(c,1.2); },
  sh_nav_trineo(c,t){ joSombra(c,50);
    c.strokeStyle=OUT; c.lineWidth=7; c.beginPath(); c.moveTo(-46,-4); c.lineTo(36,-4); c.quadraticCurveTo(52,-4,50,-20); c.stroke(); c.strokeStyle='#f4c430'; c.lineWidth=4; c.stroke();
    [[-34],[22]].forEach(([x])=>joRR(c,x,-16,5,13,2,'#f4c430',1.4));
    c.beginPath(); c.moveTo(-44,-16); c.lineTo(34,-16); c.quadraticCurveTo(44,-16,42,-34); c.lineTo(30,-34); c.lineTo(28,-26); c.lineTo(-40,-26); c.quadraticCurveTo(-50,-36,-44,-44); c.quadraticCurveTo(-54,-30,-44,-16); c.closePath(); c.fillStyle='#d63a3a'; c.fill(); ol(c,2.2);
    c.strokeStyle='#f4c430'; c.lineWidth=2; c.beginPath(); c.moveTo(-38,-21); c.lineTo(30,-21); c.stroke();
    NAVT.caja(c,-14,-26,18,16,'#4a8fdc','#fffaf1'); NAVT.caja(c,6,-26,16,20,'#55b05a','#e4574f'); },
  sh_nav_regalo(c,t){ joSombra(c,22); const s=1+Math.sin(t*2)*0.02; c.save(); c.scale(s,s); NAVT.caja(c,0,0,36,30,'#55b05a','#e4574f'); NAVT.caja(c,12,-30,16,12,'#4a8fdc','#f4c430'); c.restore(); },
  sh_nav_muneco(c,t){ joSombra(c,26); c.beginPath(); c.arc(0,-20,22,0,Math.PI*2); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.2);
    c.beginPath(); c.arc(0,-54,16,0,Math.PI*2); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.2);
    c.strokeStyle=OUT; c.lineWidth=4; c.lineCap='round'; const br=Math.sin(t*1.5)*0.1; c.beginPath(); c.moveTo(-18,-32); c.lineTo(-34,-46+br*20); c.moveTo(-28,-41); c.lineTo(-34,-38); c.moveTo(18,-32); c.lineTo(34,-46-br*20); c.moveTo(28,-41); c.lineTo(34,-38); c.stroke(); c.strokeStyle='#7a4f2e'; c.lineWidth=2; c.stroke(); c.lineCap='butt';
    c.fillStyle='#3b2f3a'; [[-5,-58],[5,-58]].forEach(([x,y])=>{ c.beginPath(); c.arc(x,y,2.2,0,Math.PI*2); c.fill(); }); [-26,-18,-10].forEach(y=>{ c.beginPath(); c.arc(0,y,2.4,0,Math.PI*2); c.fill(); });
    c.beginPath(); c.moveTo(0,-53); c.lineTo(14,-50); c.lineTo(0,-49); c.closePath(); c.fillStyle='#f28c28'; c.fill(); ol(c,1);
    roundRect(c,-15,-42,30,7,3); c.fillStyle='#e4574f'; c.fill(); ol(c,1.6); roundRect(c,6,-40,7,16,3); c.fill(); ol(c,1.4);
    roundRect(c,-14,-76,28,5,2); c.fillStyle='#3b2f3a'; c.fill(); roundRect(c,-9,-90,18,16,3); c.fill(); c.fillStyle='#e4574f'; c.fillRect(-9,-79,18,3); }
});
