"use strict";
/* =========================================================
   PAQUETE: LA OTRA ORILLA 🌾 (desde el 8 de enero de 2027, para siempre)
   Amplía el pueblo hacia la derecha del río y por arriba, con caminos nuevos y el sitio de la granja,
   el huerto del robot, el laboratorio y una pradera libre. El dibujo y los sitios están en js/mundo/ampliacion.js;
   este paquete solo dice cuándo se enciende (papá también puede encenderlo antes en «Paquetes del pueblo»).
   Se espera a después de Reyes para no tener que nevar lo nuevo. No guarda nada en las partidas.
   Siguientes piezas (paquetes propios): huerto del robot (abre a cada niña con Telar 6) y granja (con su parcela).
   ========================================================= */
paquete({ id:'otra-orilla', nombre:'La otra orilla', emoji:'🌾', cuando:{desde:'2027-01-08',hasta:'2999-12-31'},
  info(){ return 'Pueblo más grande: granja arriba, huerto y laboratorio al otro lado del río'; },
  pruebas:[
    {t:'🌾 El pueblo ampliado (10 ene)', q:'&fecha=2027-01-10'},
    {t:'🌙 El pueblo ampliado de noche', q:'&fecha=2027-01-10&noche'},
    {t:'🤖 Robot del huerto (en el catálogo, al final)', q:'#catalogo'}
  ] });

/* ---------- el almendro centenario (junto al puente, en la otra orilla) ----------
   Cambia con el mes: flor (ene-mar, con pétalos que caen), hojas (abr-sep, almendras en jul-ago),
   hojas amarillas (oct-nov) y ramas desnudas (dic). Al tocarlo cuenta algo de los almendros. Solo adorno:
   no guarda nada. El bosque de la ampliación le deja sitio (ampLibre). */
function almEstacion(){ const m=+today().slice(5,7); return m<=3?'flor':m<=6?'hoja':m<=8?'fruto':m<=11?'otono':'dormido'; }
function almDibuja(c,b){
  const x=b.x+b.w/2, y=b.y+b.h, t=tGlobal, est=almEstacion(), sway=Math.sin(t*0.8)*2;
  c.fillStyle='rgba(40,70,20,.2)'; c.beginPath(); c.ellipse(x,y+4,110,26,0,0,Math.PI*2); c.fill();
  // alfombra de pétalos u hojas en el suelo
  if(est==='flor'||est==='otono'){ for(let k=0;k<70;k++){ const a=seeded(k+13000)*Math.PI*2, r=Math.sqrt(seeded(k+13100)); c.fillStyle=est==='flor'?(k%3?'#f9d3e1':'#ffffff'):(k%2?'#f0b13c':'#e2802f'); c.beginPath(); c.ellipse(x+Math.cos(a)*r*120,y+6+Math.sin(a)*r*30,3,1.8,a,0,Math.PI*2); c.fill(); } }
  // banco a la sombra
  const bx=x+78, by=y+26; c.fillStyle='#7c522d'; c.fillRect(bx-26,by-6,4,12); c.fillRect(bx+22,by-6,4,12);
  c.fillStyle='#b07a45'; roundRect(c,bx-30,by-12,60,8,3); c.fill(); roundRect(c,bx-30,by-24,60,7,3); c.fill(); c.fillStyle='#7c522d'; c.fillRect(bx-27,by-24,3,14); c.fillRect(bx+24,by-24,3,14);
  // tronco retorcido con dos ramas
  c.fillStyle='#6b5446'; c.beginPath(); c.moveTo(x-18,y); c.quadraticCurveTo(x-6,y-40,x-14,y-72); c.quadraticCurveTo(x-34,y-96,x-52+sway,y-118); c.lineTo(x-42+sway,y-124);
  c.quadraticCurveTo(x-18,y-102,x-2,y-84); c.quadraticCurveTo(x+18,y-104,x+44+sway,y-120); c.lineTo(x+50+sway,y-112); c.quadraticCurveTo(x+22,y-88,x+12,y-64); c.quadraticCurveTo(x+6,y-30,x+18,y); c.closePath(); c.fill();
  c.strokeStyle='#4f3d33'; c.lineWidth=2; c.beginPath(); c.moveTo(x-4,y-6); c.quadraticCurveTo(x+2,y-30,x-4,y-56); c.moveTo(x+8,y-10); c.quadraticCurveTo(x+4,y-26,x+10,y-44); c.stroke();
  // copa (o ramitas en diciembre)
  const copa=[[-62,-128,40],[-24,-158,46],[26,-156,44],[66,-128,38],[-86,-100,30],[88,-96,30],[0,-122,50],[-44,-106,38],[46,-104,38],[-10,-90,32]];
  if(est==='dormido'){ c.strokeStyle='#6b5446'; c.lineWidth=3; for(const [dx,dy] of copa){ c.beginPath(); c.moveTo(x+dx*0.35+sway,y+dy*0.7); c.lineTo(x+dx+sway,y+dy-6); c.stroke(); } return; }
  const pal={flor:['#fbd9e6','#f6bcd2','#ffffff','#f9cfe0'],hoja:['#7cc65a','#69b54c','#8fd66a','#5aa845'],fruto:['#7cc65a','#69b54c','#8fd66a','#5aa845'],otono:['#f2c14e','#e9a23b','#f6d36b','#de8a30']}[est];
  copa.forEach(([dx,dy,r],i)=>{ c.fillStyle=pal[i%4]; c.beginPath(); c.arc(x+dx+sway*(1+dy/-200),y+dy,r,0,Math.PI*2); c.fill(); });
  if(est==='flor'){ for(let k=0;k<60;k++){ const [dx,dy,r]=copa[k%copa.length], a=seeded(k+13200)*Math.PI*2, rr=Math.sqrt(seeded(k+13300))*r*0.9, fx=x+dx+sway+Math.cos(a)*rr, fy=y+dy+Math.sin(a)*rr;
      c.fillStyle=k%4?'#ffffff':'#f08cb0'; for(let p=0;p<5;p++){ const pa=p*Math.PI*0.4; c.beginPath(); c.arc(fx+Math.cos(pa)*2.2,fy+Math.sin(pa)*2.2,1.7,0,Math.PI*2); c.fill(); } c.fillStyle='#e0607e'; c.beginPath(); c.arc(fx,fy,1,0,Math.PI*2); c.fill(); }
    for(let k=0;k<16;k++){ const s=seeded(k+13400), px=x-120+((s*240+t*14)%240)+Math.sin(t*1.7+k)*8, py=y-160+((t*22+s*400)%185); // pétalos que caen
      c.fillStyle=k%3?'#fbd9e6':'#ffffff'; c.beginPath(); c.ellipse(px,py,3,1.8,t*2+k,0,Math.PI*2); c.fill(); } }
  if(est==='fruto'){ for(let k=0;k<18;k++){ const [dx,dy,r]=copa[k%copa.length], a=seeded(k+13500)*Math.PI*2, rr=Math.sqrt(seeded(k+13600))*r*0.8; c.fillStyle='#a9c46a'; c.beginPath(); c.ellipse(x+dx+sway+Math.cos(a)*rr,y+dy+Math.sin(a)*rr,4,5.5,0.4,0,Math.PI*2); c.fill(); } }
}
const ALM_TXT={
  flor:'🌸 El almendro centenario está en flor. Los almendros florecen a finales del invierno, ¡antes que casi todos los árboles! Las abejas vienen a por su néctar.',
  hoja:'🌳 Al almendro le han salido hojas nuevas. De cada flor que visitaron las abejas está creciendo una almendra.',
  fruto:'🌰 ¡El almendro tiene almendras! Crecen dentro de una cáscara verde y peluda que se abre cuando maduran, a finales del verano.',
  otono:'🍂 En otoño las hojas del almendro se vuelven amarillas y se caen. Es un árbol de hoja caduca.',
  dormido:'🌙 El almendro está dormido: sin hojas, guarda fuerzas para florecer a finales de enero.'
};
function almHabla(){ say({face:'🌸',name:'El almendro centenario',text:ALM_TXT[almEstacion()]+' Dicen que tiene más de cien años.'}); }
edificio({ id:'almendro', x:AMP.almendro[0]-22, y:AMP.almendro[1]-16, w:44, h:16, door:[AMP.almendro[0]-40,AMP.almendro[1]+40],
  otroLado:true, activo:()=>AMPLIO, ve:b=>vis(b.x+22,b.y-60,280), dibuja:(c,b)=>almDibuja(c,b),
  toque:b=>({x:b.x-90,y:b.y-170,w:224,h:190}), abre:()=>almHabla(), alcalde:()=>almHabla() });
