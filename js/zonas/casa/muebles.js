"use strict";
/* =========================================================
   MUEBLES DE LA CASA: tamaño y dibujos (desde el 25 nov 2026)
   ---------------------------------------------------------
   MUEBLE_TAM[k]: w = casillas de ancho; t = tamaño del emoji; h = alto del dibujo (para tocarlo);
   sobre = se puede apoyar encima de otro mueble; apoyo = sitios de encima [[x,y]…] (con el pie del mueble en 0,0);
   alf = alfombra (va debajo de los muebles); luz = altura de la luz que da de noche.
   Unidades: con escala 1, una casilla mide 76 de ancho y una niña unos 100 de alto.
   Un mueble de un paquete puede traer su propio f.tam = {…} en vez de estar aquí.
   MUEBLE_DIB[nombre](c, t, o): dibujos de f.draw con el pie en (0,0); o.col = color de la dueña.
   ========================================================= */
const MUEBLE_TAM={
  silla:{h:80}, mesa:{w:2,h:68,apoyo:[[-38,-64],[34,-64]]}, cama:{w:2,h:88,apoyo:[[-44,-54],[30,-50]]},
  sofa:{w:2,h:78,apoyo:[[-30,-42],[30,-42]]}, piano:{w:2,h:106,apoyo:[[-38,-102],[38,-102]]}, estante:{h:152,apoyo:[[0,-150]]},
  lampara:{h:150,luz:130}, pecera:{h:84}, caballete:{t:1.35}, planta:{t:1.05,sobre:1}, osito:{t:0.72,sobre:1},
  lanas:{t:0.72,sobre:1}, muneca:{t:0.72,sobre:1},
  alf_r:{w:2,alf:1}, alf_b:{w:2,alf:1}, alf_m:{w:2,alf:1},
  // Navidad
  nav_alfombra:{w:2,alf:1}, nav_chimenea:{w:2,t:1.2,h:100}, nav_belen:{w:2,t:1.5,h:96}, nav_arbolito:{h:100}, nav_telescopio:{h:90},
  nav_regalos:{sobre:1}, nav_pascua:{sobre:1}, nav_musica:{sobre:1,h:50}, nav_jengibre:{sobre:1},
  nav_gorro1:{sobre:1}, nav_gorro2:{sobre:1}, nav_gorro3:{sobre:1}
};
function muRR(c,x,y,w,h,r,col,lw){ roundRect(c,x,y,w,h,r); c.fillStyle=col; c.fill(); ol(c,lw||2.4); }
function muSombra(c,rx){ c.fillStyle='rgba(60,40,20,.2)'; c.beginPath(); c.ellipse(0,2,rx,8,0,0,Math.PI*2); c.fill(); }
const MUEBLE_DIB={
  cama(c,t,o){ const col=o.col||'#4a8fdc'; muSombra(c,80);
    muRR(c,-70,-16,8,16,2,'#8a5a36',2); muRR(c,58,-16,8,16,2,'#8a5a36',2);
    muRR(c,-74,-32,146,20,6,'#b97a48');
    muRR(c,-66,-46,134,18,8,'#fffaf1');
    muRR(c,-28,-50,98,30,11,col);
    c.fillStyle='rgba(255,255,255,.35)'; for(let i=0;i<4;i++) for(let j=0;j<2;j++){ c.beginPath(); c.arc(-8+i*22,-40+j*11,3,0,Math.PI*2); c.fill(); }
    muRR(c,-30,-50,16,30,8,shade(col,0.35),2);
    muRR(c,-64,-58,34,16,8,'#ffffff',2.2);
    muRR(c,-84,-88,16,88,6,'#9a6338'); c.beginPath(); c.arc(-76,-90,7,0,Math.PI*2); c.fillStyle='#b97a48'; c.fill(); ol(c,2);
    muRR(c,66,-58,13,58,5,'#9a6338'); },
  sofa(c,t,o){ const col='#d9825b'; muSombra(c,78);
    muRR(c,-66,-10,8,10,2,'#6b4428',2); muRR(c,58,-10,8,10,2,'#6b4428',2);
    muRR(c,-66,-76,132,44,16,shade(col,-0.12));
    muRR(c,-72,-40,144,32,10,col);
    muRR(c,-62,-48,62,16,7,shade(col,0.18),2.2); muRR(c,0,-48,62,16,7,shade(col,0.18),2.2);
    muRR(c,-84,-60,20,54,10,col); muRR(c,64,-60,20,54,10,col);
    c.fillStyle='rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(-30,-64,20,5,0,0,Math.PI*2); c.ellipse(30,-64,20,5,0,0,Math.PI*2); c.fill(); },
  table(c){ muSombra(c,70);
    muRR(c,-50,-58,6,50,2,'#8a5a36',1.8); muRR(c,44,-58,6,50,2,'#8a5a36',1.8);
    muRR(c,-62,-58,9,58,3,'#9a6338',2.2); muRR(c,53,-58,9,58,3,'#9a6338',2.2);
    muRR(c,-70,-68,140,13,5,'#c98f5a',2.6); c.fillStyle='rgba(255,255,255,.25)'; c.fillRect(-64,-66,128,3); },
  silla(c){ muSombra(c,26);
    muRR(c,-20,-32,5,32,2,'#8a5a36',1.8); muRR(c,15,-32,5,32,2,'#8a5a36',1.8);
    muRR(c,-24,-38,48,9,3,'#c98f5a');
    muRR(c,-24,-78,8,44,3,'#9a6338'); muRR(c,-26,-82,14,10,4,'#b97a48',2);
    for(const y of [-66,-54]){ muRR(c,-18,y,6,5,2,'#b97a48',1.4); } },
  piano(c){ muSombra(c,74);
    muRR(c,-62,-46,10,46,3,'#2a2129',2); muRR(c,52,-46,10,46,3,'#2a2129',2);
    muRR(c,-68,-98,136,54,6,'#3b2f3a');
    muRR(c,-72,-104,144,10,4,'#4a3c48');
    muRR(c,-26,-92,52,24,3,'#5a4a56',2); roundRect(c,-20,-90,40,19,2); c.fillStyle='#fffaf1'; c.fill();
    c.strokeStyle='#8a7f88'; c.lineWidth=1; for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(-16,-86+i*4); c.lineTo(16,-86+i*4); c.stroke(); }
    muRR(c,-72,-50,144,14,3,'#2f252e');
    c.fillStyle='#fffaf1'; c.fillRect(-66,-48,132,9); c.strokeStyle='#bdb3a6'; c.lineWidth=1; for(let x=-66;x<66;x+=8.25){ c.beginPath(); c.moveTo(x,-48); c.lineTo(x,-39); c.stroke(); }
    c.fillStyle='#2a2129'; for(let i=0;i<16;i++){ if(i%7===2||i%7===6) continue; c.fillRect(-61+i*8.25,-48,4.5,5.5); }
    c.fillStyle='#f4c430'; c.fillRect(-8,-6,5,4); c.fillRect(3,-6,5,4); },
  shelf(c){ muSombra(c,36);
    muRR(c,-34,-152,68,152,6,'#b97a48',2.6);
    for(let r=0;r<4;r++){ roundRect(c,-28,-146+r*36,56,31,2); c.fillStyle='#8a5a36'; c.fill();
      ['#e4574f','#4a8fdc','#f4c430','#55b05a','#a678d6','#f29b38'].forEach((col,i)=>{ if((i+r)%4===3) return; const h=25-(i%3)*3; roundRect(c,-26+i*9,-146+r*36+31-h,7.5,h,1); c.fillStyle=col; c.fill(); ol(c,1); }); } },
  lampara(c,t){ const nt=nightLevel()>0.35; muSombra(c,22);
    c.beginPath(); c.ellipse(0,-4,18,6,0,0,Math.PI*2); c.fillStyle='#5a4a56'; c.fill(); ol(c,2);
    roundRect(c,-3,-122,6,118,2); c.fillStyle='#5a4a56'; c.fill(); ol(c,1.6);
    if(nt){ const g=c.createRadialGradient(0,-126,4,0,-126,60); g.addColorStop(0,'rgba(255,230,150,.7)'); g.addColorStop(1,'rgba(255,230,150,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,-126,60,0,Math.PI*2); c.fill(); }
    c.beginPath(); c.moveTo(-16,-150); c.lineTo(16,-150); c.lineTo(28,-118); c.lineTo(-28,-118); c.closePath(); c.fillStyle=nt?'#ffe9a0':'#f6d77a'; c.fill(); ol(c,2.4);
    c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(-10,-146,5,24); }
};
