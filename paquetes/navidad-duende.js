"use strict";
/* =========================================================
   CHISPÍN, EL DUENDE ESCONDIDO (Navidad)
   Del 1 de diciembre al 5 de enero se esconde cada día en un sitio del pueblo (CH_SITIOS), el mismo
   para las dos niñas; pasa por todos antes de repetir y nunca está dos días seguidos en el mismo (chOrden). Algunos escondites son fáciles y
   graciosos; en otros solo se asoma de vez en cuando (chAsoma). Los días que está en una casa, solo lo
   puede pillar su dueña. Al tocarlo: «¡Me has pillado!», un chiste o un dato curioso (CH_FRASES, uno por
   día) y 1 botón (una vez al día por niña). De noche suena su cascabel cerca y brilla un poquito.
   Los vecinos dan pistas (enchufe 'vecino'). El 6 de enero se despide y deja su gorro como recuerdo:
   más especial cuanto más veces lo hayan encontrado (mueble nav_gorro1/2/3).
   Se guarda en la partida de cada niña: p.paq.navidad.duende[temporada] = {dias:{fecha:1}, gorro}.
   ========================================================= */
const CH={ s:1.1, toque:{x:-99,y:-99,w:0,h:0}, door:[1200,900], hoy:null, bell:0, img:null };

/* ---------- dibujo de Chispín (pie en 0,0; unos 75 px de alto) ---------- */
function chispin(c,t,o){ o=o||{}; const sw=Math.sin(t*3)*0.08;
  c.save();
  if(!o.sinSombra){ c.fillStyle='rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0,0,13,3.5,0,0,TAU); c.fill(); }
  if(!o.soloCabeza){
    for(const s of [-1,1]){ c.save(); c.translate(s*4,-12); c.rotate(s*0.08);
      roundRect(c,-2.6,0,5.2,11,2.6); c.fillStyle='#fffaf3'; c.fill(); c.fillStyle='#d63a3a'; for(let k=0;k<3;k++) c.fillRect(-2.6,1.5+k*3.4,5.2,1.7); roundRect(c,-2.6,0,5.2,11,2.6); ol(c,1.4); c.restore();
      c.beginPath(); c.moveTo(s*1.5,-2); c.quadraticCurveTo(s*9,-1,s*12,-7); c.quadraticCurveTo(s*13,-3,s*10,0); c.lineTo(s*1.5,0.5); c.closePath(); c.fillStyle='#2e8a4a'; c.fill(); ol(c,1.6);
      c.fillStyle='#f4c430'; c.beginPath(); c.arc(s*12,-7.5,1.8,0,TAU); c.fill(); }
    c.beginPath(); c.moveTo(-8,-30); c.quadraticCurveTo(-12,-20,-13,-13); for(let i=0;i<6;i++){ const x=-13+i*26/6; c.lineTo(x+26/12,-9); c.lineTo(x+26/6,-13); } c.quadraticCurveTo(12,-20,8,-30); c.closePath(); c.fillStyle='#3fa35c'; c.fill(); ol(c,2);
    c.fillStyle='#d63a3a'; roundRect(c,-10.5,-21,21,3.6,1.6); c.fill(); ol(c,1.2); c.fillStyle='#f4c430'; roundRect(c,-2.5,-21.6,5,4.8,1); c.fill(); ol(c,1);
    (o.brazos||[[-13,-24],[13,-24]]).forEach(([x,y])=>{ c.strokeStyle=OUT; c.lineWidth=6; c.lineCap='round'; c.beginPath(); c.moveTo(Math.sign(x)*6,-28); c.lineTo(x,y); c.stroke(); c.strokeStyle='#3fa35c'; c.lineWidth=3.6; c.stroke(); c.fillStyle='#f6d0b0'; c.beginPath(); c.arc(x,y,2.6,0,TAU); c.fill(); ol(c,1.1); });
  }
  roundRect(c,-9,-33,18,5,2.5); c.fillStyle='#d63a3a'; c.fill(); ol(c,1.4); c.fillStyle='#fffaf3'; for(let x=-6;x<8;x+=5) c.fillRect(x,-32.6,2,4.2);
  roundRect(c,3,-31,4.5,9,2); c.fillStyle='#d63a3a'; c.fill(); ol(c,1.2);
  for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*8,-46); c.quadraticCurveTo(s*15,-50,s*19,-55); c.quadraticCurveTo(s*18,-44,s*9,-37); c.closePath(); c.fillStyle='#f6d0b0'; c.fill(); ol(c,1.6); c.strokeStyle='rgba(220,140,120,.7)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(s*10,-44); c.quadraticCurveTo(s*14,-46,s*16,-50); c.stroke(); }
  c.beginPath(); c.arc(0,-41,10.5,0,TAU); c.fillStyle='#f6d0b0'; c.fill(); ol(c,2);
  c.fillStyle='#2a1a14'; c.strokeStyle='#2a1a14'; c.lineWidth=1.8; c.lineCap='round';
  const arco=(x,arriba)=>{ c.beginPath(); c.moveTo(x-2.4,-41); c.quadraticCurveTo(x,arriba?-44:-39,x+2.4,-41); c.stroke(); };
  const ojo=x=>{ c.fillStyle='#2a1a14'; c.beginPath(); c.arc(x,-41.5,1.7,0,TAU); c.fill(); c.fillStyle='#fff'; c.beginPath(); c.arc(x+0.5,-42.1,0.6,0,TAU); c.fill(); };
  if(o.dormido){ arco(-3.6,false); arco(3.6,false); } else { if(o.guino) arco(-3.6,true); else ojo(-3.6); ojo(3.6); }
  c.strokeStyle='#5a3a24'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-6,-45.5); c.lineTo(-1.8,-44.5); c.moveTo(6,-45.5); c.lineTo(1.8,-44.5); c.stroke();
  c.fillStyle='rgba(235,100,90,.55)'; [-6,6].forEach(x=>{ c.beginPath(); c.arc(x,-38.6,2.2,0,TAU); c.fill(); });
  c.fillStyle='rgba(160,90,50,.6)'; [[-5,-40.5],[-6.5,-40],[5,-40.5],[6.5,-40]].forEach(([x,y])=>{ c.beginPath(); c.arc(x,y,0.6,0,TAU); c.fill(); });
  if(o.hollin){ c.fillStyle='rgba(60,50,50,.45)'; [[-4,-47,3],[5,-36,2.4],[-7,-35,2]].forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,TAU); c.fill(); }); }
  if(o.dormido){ c.fillStyle='#8a2a2a'; c.beginPath(); c.ellipse(0,-36.8,1.6,1.2,0,0,TAU); c.fill(); }
  else { c.beginPath(); c.moveTo(-3.6,-38.4); c.quadraticCurveTo(0,-34,3.6,-38.4); c.closePath(); c.fillStyle='#8a2a2a'; c.fill(); ol(c,1); c.fillStyle='#fff'; c.fillRect(-1,-38.3,2,1.6); }
  c.fillStyle='#e07a6a'; c.beginPath(); c.arc(0,-40.6,1.6,0,TAU); c.fill();
  c.save(); c.translate(0,-50); chGorro(c,sw,o.gorro||1); c.restore();
  c.restore();
}
function chGorro(c,sw,nv){ // gorro con cascabel; nv 1 verde, 2 con estrellas, 3 dorado
  c.beginPath(); c.moveTo(-10,2); c.quadraticCurveTo(-8,-14,4,-22); c.quadraticCurveTo(18+sw*20,-28,24+sw*30,-14); c.quadraticCurveTo(14,-20,8,-12); c.quadraticCurveTo(6,-4,10,2); c.closePath();
  c.fillStyle=nv>=3?'#f2c230':'#3fa35c'; c.fill(); ol(c,2);
  if(nv>=2){ c.save(); c.clip(); [[-2,-6],[6,-15],[15,-19],[-4,-12]].forEach(([x,y])=>{ c.save(); c.translate(x,y); c.scale(0.22,0.22); navEstrella(c,0,0,12,0); c.restore(); }); c.restore(); }
  roundRect(c,-11.5,-1,23,5.5,2.7); c.fillStyle=nv>=3?'#fffaf3':'#d63a3a'; c.fill(); ol(c,1.6);
  c.beginPath(); c.arc(24+sw*30,-12,3.6,0,TAU); c.fillStyle=nv>=3?'#fffaf3':'#f4c430'; c.fill(); ol(c,1.4); c.fillStyle='#8a6a1a'; c.fillRect(23+sw*30,-11,2,2.6);
}
/* 0 = escondido, 1 = asomado. Ciclo de 8 s: casi siempre escondido y se asoma un ratito. */
function chAsoma(t,ph){ const u=(t+ph*3.7)%8; if(u<5) return 0; if(u<5.4) return (u-5)/0.4; if(u<7.2) return 1; if(u<7.6) return 1-(u-7.2)/0.4; return 0; }
function chEn(c,x,y,s,fn){ c.save(); c.translate(x,y); c.scale(s,s); fn(); c.restore(); }

/* ---------- escondites ----------
   {id, n: dónde (para papá), pista (los vecinos), solo: 0|1 (solo esa niña), p(): {x,y} centro para tocar,
    r: radio del toque, door(): adónde anda la niña, y(): profundidad, d(c,t,a): dibujo (a = 0..1 asomado)} */
function chArbol(tx,ty){ let best=null, bd=1e9; FOREST.forEach(f=>{ if(f.k!=='round') return; const d=Math.hypot(f.x-tx,f.y-ty); if(d<bd){ bd=d; best=f; } }); return best||{x:tx,y:ty,s:1,i:0}; }
function chMuneco(c,x,y,t,a){ // muñeco de nieve… ¡con la cara de Chispín!
  c.fillStyle='rgba(40,70,20,.18)'; c.beginPath(); c.ellipse(x,y+2,26,7,0,0,TAU); c.fill();
  c.beginPath(); c.arc(x,y-20,24,0,TAU); c.fillStyle='#fdfdff'; c.fill(); ol(c,2.6);
  c.beginPath(); c.arc(x,y-52,17,0,TAU); c.fillStyle='#fdfdff'; c.fill(); ol(c,2.4);
  c.fillStyle='#3a2a20'; [[x,y-26],[x,y-16],[x,y-48],[x,y-56]].forEach(([bx,by])=>{ c.beginPath(); c.arc(bx,by,2.2,0,TAU); c.fill(); });
  c.strokeStyle='#8a5a36'; c.lineWidth=3; c.lineCap='round'; c.beginPath(); c.moveTo(x-16,y-50); c.lineTo(x-34,y-62+Math.sin(t*3)*a*6); c.moveTo(x+16,y-50); c.lineTo(x+32,y-58); c.stroke();
  chEn(c,x,y-26,1.05,()=>chispin(c,t,{soloCabeza:true,sinSombra:true,guino:a>0.5}));
}
function chRegalo(c,x,y,t,a){ // caja de regalo grande; la tapa se levanta cuando se asoma
  c.fillStyle='rgba(40,70,20,.18)'; c.beginPath(); c.ellipse(x,y+2,34,8,0,0,TAU); c.fill();
  if(a>0){ c.save(); c.beginPath(); c.rect(x-60,y-200,120,170); c.clip(); chEn(c,x,y-30+ (1-a)*40+40*0,1.0,()=>chispin(c,t,{sinSombra:true,brazos:[[-15,-36],[15,-36]]})); c.restore(); }
  roundRect(c,x-30,y-52,60,52,4); c.fillStyle='#d63a3a'; c.fill(); ol(c,2.4); c.fillStyle='#f4c430'; c.fillRect(x-5,y-52,10,52); ol(c,0);
  c.save(); c.translate(x,y-52-a*26); c.rotate(-a*0.35); roundRect(c,-34,-12,68,12,3); c.fillStyle='#e45a4a'; c.fill(); ol(c,2.2); c.fillStyle='#f4c430'; c.fillRect(-5,-12,10,12); NAVT.lazo(c,0,-12,1.3); c.restore();
}
const CH_SITIOS=[
  {id:'arbolNav', n:'subido al árbol de Navidad de la plaza', pista:'Me ha parecido ver un adorno con orejas puntiagudas en el árbol de la plaza…',
    p:()=>({x:NAV_TX+22,y:NAV_TY-100}), r:40, door:()=>[NAV_TX+40,NAV_TY+24], y:()=>NAV_TY+1,
    d:(c,t)=>chEn(c,NAV_TX+22,NAV_TY-48,1.2,()=>chispin(c,t,{sinSombra:true,brazos:[[-14,-30],[13,-20]]})) },
  {id:'lago', n:'pescando un calcetín en el lago', pista:'Alguien está pescando en el lago… ¡y no es un pato!',
    p:()=>({x:POND.x+40,y:POND.y-30}), r:55, door:()=>[POND.x+30,POND.y-POND.ry-26], y:()=>POND.y+7,
    d:(c,t)=>{ const b=Math.sin(t*2)*1.5; c.save(); c.translate(POND.x+20,POND.y+6+b); c.scale(1.4,1.4);
      c.beginPath(); c.ellipse(0,0,26,8,0,0,TAU); c.fillStyle='#a8743f'; c.fill(); ol(c,2.4); c.beginPath(); c.ellipse(24,-1,4,6,0,0,TAU); c.fillStyle='#e8c48f'; c.fill(); ol(c,2);
      c.save(); c.translate(-4,-2); c.scale(0.8,0.8); chispin(c,t,{sinSombra:true,brazos:[[14,-24],[16,-22]]}); c.restore();
      c.strokeStyle='#6b4523'; c.lineWidth=2.4; c.lineCap='round'; c.beginPath(); c.moveTo(8,-20); c.lineTo(52,-52); c.stroke();
      const cy=-8+Math.sin(t*3)*2; c.strokeStyle='rgba(60,40,30,.7)'; c.lineWidth=1; c.beginPath(); c.moveTo(52,-52); c.quadraticCurveTo(58,-30,60,cy); c.stroke();
      c.save(); c.translate(60,cy); c.rotate(0.2); const cal=()=>{ c.beginPath(); c.moveTo(-4,0); c.lineTo(4,0); c.lineTo(4,12); c.quadraticCurveTo(12,12,12,17); c.quadraticCurveTo(4,20,-4,15); c.closePath(); };
      cal(); c.fillStyle='#e4574f'; c.fill(); c.fillStyle='#fff'; c.fillRect(-4,3,8,3); c.fillRect(-4,9,8,3); cal(); ol(c,1.8); c.restore();
      c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=1.6; c.beginPath(); c.ellipse(0,4,34+Math.sin(t*2)*3,10,0,0,TAU); c.stroke(); c.restore(); } },
  {id:'pato', n:'montado en un pato del lago', pista:'¡Hoy un pato del lago lleva pasajero! ¿Lo has visto?',
    p:()=>{ const a=tGlobal*0.25; return {x:POND.x+Math.cos(a)*(POND.rx-50), y:POND.y+Math.sin(a)*(POND.ry-30)-30}; }, r:45,
    door:()=>{ const a=tGlobal*0.25+0.6, x=POND.x+Math.cos(a)*(POND.rx+26), y=POND.y+Math.sin(a)*(POND.ry+26); return [x,y]; }, y:()=>{ const a=tGlobal*0.25; return POND.y+Math.sin(a)*(POND.ry-30)+1; },
    d:(c,t)=>{ const a=tGlobal*0.25, x=POND.x+Math.cos(a)*(POND.rx-50), y=POND.y+Math.sin(a)*(POND.ry-30), dir=-Math.sin(a)>0?1:-1; chEn(c,x-dir*3,y-4,0.8,()=>chispin(c,t,{sinSombra:true,brazos:[[dir*15,-34],[-dir*13,-22]]})); duckX(c,x+dir*4,y+2,dir); } },
  {id:'fuente', n:'en el agua de la fuente de la plaza', pista:'¡Qué raro! Del agua de la plaza salen burbujas… y a veces una oreja puntiaguda.',
    p:()=>({x:B.plaza.x-20,y:B.plaza.y-10}), r:48, door:()=>[B.plaza.x-70,B.plaza.y+50], y:()=>B.plaza.y+21, asoma:1,
    d:(c,t,a)=>{ const x=B.plaza.x, y=B.plaza.y+10, lv=CH.lv||0, pozo=lv<2; const cx=pozo?x:x-28, ry=pozo?8:17, rx=pozo?22:50;
      c.save(); c.beginPath(); c.rect(x-70,y-220,140,216); c.ellipse(x,y-3,rx,ry,0,0,TAU); c.clip(); chEn(c,cx+2,y+14+(1-a)*34,0.95,()=>chispin(c,t,{sinSombra:true,guino:a>0.9,brazos:[[-17,-26],[17,-26]]})); c.restore();
      if(pozo){ c.strokeStyle=OUT; c.lineWidth=7; c.beginPath(); c.moveTo(x-26,y-2); c.lineTo(x-26,y-48); c.moveTo(x+26,y-2); c.lineTo(x+26,y-48); c.stroke(); c.strokeStyle='#9a6338'; c.lineWidth=4; c.stroke();
        c.beginPath(); c.moveTo(x-36,y-44); c.lineTo(x,y-66); c.lineTo(x+36,y-44); c.closePath(); c.fillStyle='#c0443d'; c.fill(); ol(c,2.6); adorna(c,'fuente',{x,y,lv}); }
      for(let k=0;k<3;k++){ const b=t*3+k*2.1; c.fillStyle='rgba(160,215,245,.9)'; c.beginPath(); c.arc(cx-14+k*14+Math.sin(b)*3,y-8-Math.abs(Math.sin(b))*8,2.4,0,TAU); c.fill(); } } },
  ...[[640,560,'el arbusto que hay junto al camino del taller'],[1520,640,'el arbusto que hay junto a la tienda'],[1700,980,'el arbusto que hay cerca del puente']].map(([bx,by,n],i)=>({
    id:'arbusto'+i, n:'detrás de '+n, pista:'Un arbusto del pueblo se ha reído cuando he pasado. ¡Los arbustos no se ríen!', asoma:1,
    p:()=>({x:bx,y:by-30}), r:40, door:()=>[bx,by+30], y:()=>by-1,
    d:(c,t,a)=>{ c.save(); c.beginPath(); c.rect(bx-60,by-200,120,192); c.clip(); chEn(c,bx+4,by+10+(1-a)*50,1.0,()=>chispin(c,t,{sinSombra:true,guino:i===1,brazos:[[-14,-30],[14,-30]]})); c.restore(); } })),
  ...[[560,1380,'un árbol del bosque de abajo'],[1660,1460,'un árbol del bosque, abajo a la derecha'],[150,560,'un árbol del bosque de la izquierda']].map(([tx,ty,n],i)=>({
    id:'arbol'+i, n:'detrás de '+n, pista:'En el bosque hay un árbol con una cara que sale y se esconde. ¡Míralos bien!', asoma:1,
    p:()=>{ const f=chArbol(tx,ty); return {x:f.x+(i%2?-30:30)*f.s,y:f.y-55*f.s}; }, r:40, door:()=>{ const f=chArbol(tx,ty); return [f.x,f.y+30]; }, y:()=>chArbol(tx,ty).y-1,
    d:(c,t,a)=>{ const f=chArbol(tx,ty), sd=i%2?-1:1; chEn(c,f.x+sd*(6+28*a)*f.s,f.y-14*f.s,f.s*0.95,()=>{ if(sd<0){ c.scale(-1,1); } chispin(c,t,{soloCabeza:true,sinSombra:true,guino:a>0.9}); }); } })),
  ...[[690,640,1,'la roca que hay junto al taller'],[1650,1050,1.2,'la roca grande que hay cerca del puente']].map(([rx,ry,rs,n],i)=>({
    id:'roca'+i, n:'detrás de '+n, pista:'Detrás de una roca asoma la punta de un gorro con cascabel…', asoma:1,
    p:()=>({x:rx,y:ry-34}), r:38, door:()=>[rx,ry+30], y:()=>ry-1,
    d:(c,t,a)=>{ c.save(); c.beginPath(); c.rect(rx-60,ry-200,120,192); c.clip(); chEn(c,rx+3,ry+8+(1-a)*30,0.9,()=>chispin(c,t,{sinSombra:true})); c.restore(); } })),
  {id:'chimenea', n:'asomando por la chimenea de la panadería', pista:'Bruno dice que hoy su chimenea echa humo… ¡y risitas!', asoma:1,
    p:()=>({x:B.panaderia.x+B.panaderia.w*0.7+12,y:B.panaderia.y-30}), r:40, door:()=>B.panaderia.door, y:()=>B.panaderia.y+B.panaderia.h+1,
    d:(c,t,a)=>chChimenea(c,B.panaderia,t,a) },
  {id:'casaA', solo:0, n:'en la chimenea de la casa de {0}', pista:'Hoy he visto a alguien muy pequeño subiendo al tejado de {0}…', asoma:1,
    p:()=>({x:B.houseA.x+B.houseA.w*0.7+12,y:B.houseA.y-30}), r:40, door:()=>B.houseA.door, y:()=>B.houseA.y+B.houseA.h+1,
    d:(c,t,a)=>chChimenea(c,B.houseA,t,a) },
  {id:'casaB', solo:1, n:'en la chimenea de la casa de {1}', pista:'Hoy he visto a alguien muy pequeño subiendo al tejado de {1}…', asoma:1,
    p:()=>({x:B.houseB.x+B.houseB.w*0.7+12,y:B.houseB.y-30}), r:40, door:()=>B.houseB.door, y:()=>B.houseB.y+B.houseB.h+1,
    d:(c,t,a)=>chChimenea(c,B.houseB,t,a) },
  {id:'tablon', n:'detrás del tablón de anuncios', pista:'Debajo del tablón de anuncios he visto unas medias de rayas… ¿de quién serán?', asoma:1,
    p:()=>({x:B.tablon.x+B.tablon.w/2,y:B.tablon.y+50}), r:50, door:()=>B.tablon.door, y:()=>B.tablon.y+B.tablon.h-1,
    d:(c,t,a)=>chEn(c,B.tablon.x+B.tablon.w/2+a*44,B.tablon.y+B.tablon.h,1.0,()=>chispin(c,t,{guino:a>0.9,brazos:[[-13,-24],[16,-36]]})) },
  {id:'banco', n:'durmiendo la siesta en un banco de la plaza', pista:'¡Alguien ronca en la plaza! Zzzz…',
    p:()=>({x:BENCHES[1][0],y:BENCHES[1][1]-26}), r:44, door:()=>[BENCHES[1][0],BENCHES[1][1]+26], y:()=>BENCHES[1][1]+1,
    d:(c,t)=>{ const [x,y]=BENCHES[1]; c.save(); c.translate(x+22,y-17); c.rotate(-Math.PI/2); c.scale(0.9,0.9); chispin(c,t,{sinSombra:true,dormido:true,brazos:[[-12,-18],[12,-18]]}); c.restore();
      c.fillStyle='#5a6aa0'; c.font='bold 16px Baloo 2, sans-serif'; c.textAlign='center'; for(let k=0;k<3;k++){ const u=(t*0.6+k/3)%1; c.globalAlpha=1-u; c.fillText('z',x-38-u*14,y-40-u*36-k*2); } c.globalAlpha=1; } },
  {id:'muneco', n:'disfrazado de muñeco de nieve', pista:'Hay un muñeco de nieve nuevo en el pueblo… ¡y juraría que me ha guiñado un ojo!',
    p:()=>({x:1600,y:840}), r:44, door:()=>[1600,905], y:()=>880, asoma:1,
    d:(c,t,a)=>chMuneco(c,1600,880,t,a) },
  {id:'regalo', n:'dentro de una caja de regalo gigante', pista:'Hay un regalo enorme en el pueblo que se mueve solo. ¡Qué misterio!', asoma:1,
    p:()=>({x:1620,y:540}), r:46, door:()=>[1620,590], y:()=>560,
    d:(c,t,a)=>chRegalo(c,1620,560,t,a) },
  {id:'buzonReal', n:'detrás del buzón de los Reyes Magos', pista:'Detrás del buzón real se esconde alguien que no es un paje…', asoma:1,
    p:()=>({x:BREY.x,y:BREY.y-50}), r:46, door:()=>[BREY.x,BREY.y+26], y:()=>BREY.y-1,
    d:(c,t,a)=>chEn(c,BREY.x-a*42,BREY.y-2,1.05,()=>{ c.scale(-1,1); chispin(c,t,{guino:a>0.9,brazos:[[-13,-24],[16,-36]]}); }) }
];
function chChimenea(c,b,t,a){ const cx=b.x+b.w*0.7+12, top=b.y-8;
  c.save(); c.beginPath(); c.rect(cx-70,top-200,140,200); c.clip(); chEn(c,cx,top+26+(1-a)*60,1.0,()=>chispin(c,t,{sinSombra:true,hollin:true,brazos:[[-16,-30],[16,-30]]})); c.restore();
  if(a>0.05&&a<1){ c.fillStyle='rgba(120,110,110,.35)'; for(let k=0;k<3;k++){ c.beginPath(); c.arc(cx-14+k*14,top-6-a*10,6+k%2*3,0,TAU); c.fill(); } } }

/* ---------- chistes y datos curiosos (uno cada día, el mismo para las dos) ---------- */
const CH_FRASES=[
  '¿Qué desayuna un muñeco de nieve? ¡Copos con leche!',
  '¿Sabías que casi todos los copos de nieve tienen seis puntas? Mira uno de cerca con una lupa.',
  '¿Cuál es el colmo de un duende? ¡Que le pillen jugando al escondite! Como a mí hoy…',
  'En los renos, tanto los machos como las hembras tienen cuernos. ¡Son los únicos ciervos así!',
  '¿Qué le dice una uva verde a una morada? ¡Respira, respira!',
  'En Australia la Navidad llega en verano, y mucha gente la celebra en la playa.',
  '¿Por qué estaba triste el libro de mates? ¡Porque tenía muchos problemas!',
  'Los osos polares tienen la piel negra debajo del pelo. Así guardan mejor el calor del sol.',
  '¿Cuál es el animal más antiguo? ¡La cebra, porque está en blanco y negro!',
  'La flor de Pascua, esa planta roja de Navidad, viene de México.',
  '¿Qué le dijo el semáforo al coche? ¡No me mires, que me estoy cambiando!',
  'El hielo es transparente. La nieve se ve blanca porque la luz rebota en sus cristalitos.',
  '¿Cómo se dice pañuelo en japonés? ¡Saka-moko!',
  'Los pingüinos emperadores se juntan muy apretados para no pasar frío, y se turnan para estar en el centro.',
  '¿Qué le dice el cero al ocho? ¡Bonito cinturón!',
  'Las ardillas entierran nueces para el invierno y se olvidan de muchas. ¡Así nacen árboles nuevos!',
  'Había un turrón tan duro, tan duro… ¡que lo usaron de ladrillo para el Belén!',
  'Cerca del Polo Norte, en invierno, el sol casi no sale durante semanas.',
  '¿Por qué los peces viven en el agua salada? ¡Porque en la pimienta estornudan!',
  'Algunas ranas del bosque se quedan congeladas en invierno… ¡y en primavera se descongelan y vuelven a saltar!',
  '¿Qué hace un perro con un taladro? ¡Taladrando!',
  'El villancico «Noche de paz» se cantó por primera vez en Austria hace más de 200 años.',
  '¿Qué le dice una bola de Navidad a otra? ¡Nos vemos colgadas en el árbol!',
  'En Nochevieja, en España, se toman doce uvas: una con cada campanada.',
  'Toc, toc. —¿Quién es? —Chispín. —¿Chispín qué? —¡Chispín-tado de verde para que no me veas!',
  'Los renos ven una luz que nosotros no vemos, la ultravioleta. Les ayuda a encontrar comida en la nieve.',
  '¿Qué es lo que más me gusta de la panadería? ¡Las magdalenas con chispas de chocolate, claro!',
  'Es casi imposible encontrar dos copos de nieve exactamente iguales.',
  '¿Qué le dijo una pared a otra? ¡Nos vemos en la esquina!',
  'En la Lotería de Navidad, los números los cantan niños y niñas de un colegio de Madrid.',
  '¿Por qué el muñeco de nieve nunca se enfada? ¡Porque es muy, muy frío!',
  'El roscón de Reyes esconde una figurita y un haba. A quien le sale el haba… ¡le toca pagar el roscón!',
  '¿Qué le dice un jardinero a otro? ¡Disfrutemos mientras podamos!',
  'Los camellos guardan grasa en la joroba. Por eso aguantan muchos días andando por el desierto.',
  '¿Qué hace un duende cuando tiene frío? ¡Se pone en un rincón, que siempre hay noventa grados!',
  'Los Reyes Magos se llaman Melchor, Gaspar y Baltasar. ¡Mañana vienen!'
];

/* ---------- el día ---------- */
const CH_DESDE='12-01', CH_HASTA='01-05';
function chDiaN(f){ f=f||today(); const y=+f.slice(0,4), md=f.slice(5), y0=md>='06-01'?y:y-1; return Math.round((Date.UTC(y,+f.slice(5,7)-1,+f.slice(8,10))-Date.UTC(y0,11,1))/864e5); }
function chHayHoy(f){ const md=(f||today()).slice(5); return md>=CH_DESDE||md<=CH_HASTA; }
function chOrden(){ // orden de toda la temporada: tandas de los 20 sitios barajados; el primer día, uno fácil (el lago)
  const tp=+navTemp(); if(CH.orden&&CH.ordenT===tp) return CH.orden; const N=CH_SITIOS.length, out=[CH_SITIOS.findIndex(x=>x.id==='lago')]; let k=0;
  while(out.length<45){ const t=CH_SITIOS.map((_,i)=>i); for(let i=N-1;i>0;i--){ const j=Math.floor(seeded(tp*0.37+(k++)*1.91+5)*(i+1)); [t[i],t[j]]=[t[j],t[i]]; }
    if(t[0]===out[out.length-1]) t.push(t.shift()); out.push(...t); }
  CH.ordenT=tp; return CH.orden=out; }
function chSitioDe(n){ return CH_SITIOS[chOrden()[n]]; } // el sitio del día n (0 = 1 de diciembre); nunca el mismo dos días seguidos
function chHoy(){ if(!paqActivo(NAV)||!chHayHoy()) return null; const n=chDiaN(); return n>=0&&n<40?chSitioDe(n):null; }
function chD(p){ const d=paqDatosNina(p,'navidad'); d.duende=d.duende||{}; const t=navTemp(); return d.duende[t]=d.duende[t]||{dias:{}}; }
function chVeces(p){ return p?Object.keys(chD(p).dias).length:0; }
function chPillado(p){ return !!p&&!!chD(p).dias[today()]; }
function chTexto(s,txt){ return String(txt).replace('{0}',(DB.profiles[0]||{}).name||'la casa azul').replace('{1}',(DB.profiles[1]||{}).name||'la otra casa'); }
function chFrase(){ const n=Math.max(0,chDiaN()); return CH_FRASES[n%CH_FRASES.length]; }
function chRetrato(){ if(CH.img) return CH.img; const cv=document.createElement('canvas'); cv.width=180; cv.height=200; const c=cv.getContext('2d'); c.translate(90,190); c.scale(2.4,2.4); chispin(c,1.2,{brazos:[[-15,-36],[15,-36]]}); return CH.img=cv.toDataURL(); }
function chCascabel(){ if(!sndCfg().sfx) return; const S=sndInit(); if(!S) return; const t=AC.currentTime+0.02; [2093,2349,2093,2637].forEach((f,i)=>bell(f,t+i*0.07,0.025,0.3)); }

async function chEncontrado(){
  const s=chHoy(); if(!s) return;
  if(VISIT||REMOTO) return chAlcalde();
  const p=P(); if(!p) return;
  if(s.solo!=null&&DB.cur!==s.solo){ const o=DB.profiles[s.solo];
    return say({face:'🧝',name:'Chispín',text:`¡Chsss! Hoy estoy escondido en casa de ${o?o.name:'tu hermana'}, y aquí solo puede pillarme ella. ¡Mañana me escondo en otro sitio!`}); }
  if(chPillado(p)) return say({face:'🧝',name:'Chispín',text:'¡Ya me has pillado hoy! Mañana me escondo en otro sitio… ¡y será más difícil!'});
  const d=chD(p); d.dias[today()]=1; p.coins+=1; p.counters.earned=(p.counters.earned||0)+1; saveQuiet(); updateHUD(); chCascabel(); setTimeout(sfxBuy,350);
  const n=chVeces(p);
  return say({face:'🧝',name:'Chispín',text:'¡Me has pillado! '+chFrase(),
    html:`<div style="text-align:center"><img src="${chRetrato()}" style="width:110px"></div><div style="text-align:center;font-weight:800">+1 🔘 · Me has encontrado ${n===1?'1 vez':n+' veces'} esta Navidad</div>`,
    buttons:[{t:'¡Hasta mañana, Chispín!',cls:'primary'}]});
}
function chAlcalde(){ const s=chHoy(); if(!s) return;
  const quien=DB.profiles.filter(Boolean).map(q=>`${q.name}: ${chPillado(q)?'✅ hoy lo ha encontrado':'todavía no'} (${chVeces(q)} veces esta Navidad)`).join('<br>');
  return say({face:'🧝',name:'Chispín',text:'¡Hola, alcalde! Hoy estoy '+chTexto(s,s.n)+'.',html:`<div style="text-align:center">${quien}</div>`,speak:false}); }

/* toque: va antes que los demás edificios, para que se le pueda pillar encima del árbol o del buzón */
const CH_ED=edificio({ id:'chispin', x:-50, y:-50, w:0, h:0, door:[1200,900],
  activo:()=>!!chHoy(), ve:()=>false, dibuja:()=>{}, toque:()=>CH.toque, abre:()=>chEncontrado(), alcalde:()=>chAlcalde() });
EDIFICIOS.splice(EDIFICIOS.indexOf(CH_ED),1); EDIFICIOS.unshift(CH_ED);

/* ---------- en el pueblo ---------- */
function chPueblo(ctx){
  const s=chHoy(); CH.toque={x:-99,y:-99,w:0,h:0}; if(!s) return {};
  CH.lv=ctx&&ctx.st?ctx.st.lv:0; const p=ctx&&ctx.p, visto=!VISIT&&chPillado(p), pt=s.p(), r=s.r||40;
  CH.toque={x:pt.x-r,y:pt.y-r,w:2*r,h:2*r}; const dr=s.door(); B.chispin.door=[dr[0],dr[1]];
  const ph=chDiaN()%5, asomado=()=>s.asoma&&!visto?chAsoma(tGlobal,ph):1;
  const ent=[{x:pt.x,y:s.y(),m:260,d:c=>s.d(c,tGlobal,asomado())}], luz=[];
  if(NIGHTN>0.3){ luz.push([pt.x,pt.y,46,0.5,1]);
    if(!VISIT&&!visto&&Math.hypot(player.x-pt.x,player.y-pt.y)<480&&tGlobal-CH.bell>4.5){ CH.bell=tGlobal; chCascabel(); } }
  return {ent,luz};
}

/* ---------- el 6 de enero: se despide y deja su gorro ---------- */
const CH_GORROS=[{k:'nav_gorro1',n:'Gorro de Chispín',min:1,nv:1},{k:'nav_gorro2',n:'Gorro de Chispín con estrellas',min:12,nv:2},{k:'nav_gorro3',n:'Gorro dorado de Chispín',min:24,nv:3}];
CH_GORROS.forEach(g=>{ if(!FURN.some(f=>f.k===g.k)) FURN.push({k:g.k,e:'🧝',n:g.n,p:0,z:'floor',paq:'navidad',regalo:1,nota:'El recuerdo de Chispín',
  abre:p=>say({face:'🧝',name:g.n,text:'Una notita dentro del gorro: «¡Gracias por jugar conmigo! Nos vemos la próxima Navidad. Chispín»'}),
  draw(c,t){ c.fillStyle='rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0,0,26,6,0,0,TAU); c.fill(); roundRect(c,-24,-10,48,10,5); c.fillStyle='#c0443d'; c.fill(); ol(c,2);
    c.save(); c.translate(-4,-10); c.scale(1.6,1.6); chGorro(c,Math.sin((t||0)*2)*0.05,g.nv); c.restore(); }}); });
const CHE={t:0,ocupado:false};
async function chDespedida(p){
  if(Date.now()-CHE.t<1500) return; CHE.t=Date.now();
  const md=today().slice(5); if(!(md>='01-06'&&md<='01-31')) return;
  if(CHE.ocupado||!p||VISIT||REMOTO||curScreen!=='village'||document.querySelector('#dlg.on')) return;
  const d=chD(p), n=chVeces(p); if(d.gorro||!n) return;
  const g=[...CH_GORROS].reverse().find(x=>n>=x.min)||CH_GORROS[0];
  CHE.ocupado=true;
  try{ d.gorro=g.nv; p.inv['fu_'+g.k]=(p.inv['fu_'+g.k]||0)+1; saveQuiet(); sfxLevel();
    await say({face:'🧝',name:'Chispín',text:`¡Hola, ${p.name}! Me vuelvo a mi casa hasta la próxima Navidad. Me has encontrado ${n===1?'1 vez':n+' veces'}. ¡Qué buena buscadora! Te dejo mi ${g.n.replace(' de Chispín','').toLowerCase()} de recuerdo. Está en tu cesta.`,
      html:`<div style="text-align:center"><img src="${chRetrato()}" style="width:100px"></div>`,buttons:[{t:'¡Adiós, Chispín!',cls:'primary'}]}); }
  finally{ CHE.ocupado=false; }
}
(function(){ const antes=NAV.enchufes.pueblo; NAV.enchufes.pueblo=function(ctx){ const d=antes.call(this,ctx)||{}; const e=chPueblo(ctx);
  if(e.ent) d.ent=(d.ent||[]).concat(e.ent); if(e.luz) d.luz=(d.luz||[]).concat(e.luz);
  if(ctx&&ctx.p) setTimeout(()=>chDespedida(ctx.p),0); return d; }; })();
/* después del 7 de enero la Navidad ya no está: el gorro tiene que poder llegar igual */
paquete({ id:'duende-gorro', nombre:'Gorro de Chispín pendiente', emoji:'🧝', cuando:{desde:'01-08',hasta:'01-31'},
  enchufes:{ pueblo(ctx){ if(ctx&&ctx.p) setTimeout(()=>chDespedida(ctx.p),0); return {}; } }, info(){ return 'Entrega el gorro de Chispín a quien no jugó el 6 o el 7'; } });

/* pistas de los vecinos: a veces, si la niña todavía no lo ha encontrado hoy */
NAV.enchufes.vecino=function(n,p){ const s=chHoy(); if(!s||!p||VISIT||chPillado(p)||n.k==='alcalde'||Math.random()<0.5) return null;
  if(s.solo!=null&&DB.cur!==s.solo) return '¿Has visto a Chispín? Dicen que hoy se ha escondido en casa de '+((DB.profiles[s.solo]||{}).name||'tu hermana')+'.';
  return chTexto(s,s.pista); };

/* en el modo alcalde: dónde está hoy */
(function(){ const antes=NAV.info; NAV.info=function(){ const s=chHoy(), base=antes?antes.call(this):''; return s?base+' · Chispín hoy: '+chTexto(s,s.n):base; }; })();
NAV.pruebas.push({t:'🧝 Chispín escondido (5 dic)', q:'&fecha='+navTemp()+'-12-05'},{t:'🧝 Chispín de noche (9 dic)', q:'&fecha='+navTemp()+'-12-09&noche'},{t:'🧝 El gorro de Chispín (6 ene)', q:'&fecha='+(+navTemp()+1)+'-01-06'});
