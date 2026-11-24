"use strict";
/* =========================================================
   AMPLIACIÓN DEL PUEBLO: la otra orilla y la franja de arriba
   ---------------------------------------------------------
   Se enciende con el paquete 'otra-orilla' (paquetes/otra-orilla.js; desde el 8 ene 2027, o si papá lo fuerza).
   Apagada, el pueblo es el de siempre: 2400×1600 desde y=0, idéntico píxel a píxel (pruebas/pueblo_equiv.py).
   Encendida, el mundo mide AMP.ancho de ancho y empieza en y = -AMP.arriba (WY0 < 0). Nada de lo que ya
   existía cambia de sitio: solo se añade terreno a la derecha del río y por arriba.

   Sitios (AMP.zonas):
   - granja: arriba, en el lado del pueblo (ocupa un tercio de la franja; el resto queda libre).
   - huerto: en medio de la otra orilla, junto al puente. Laboratorio: abajo en la otra orilla.
   - reservado: arriba en la otra orilla, libre para algo futuro.
   El huerto, la granja y el Laboratorio se dibujan cerrados (lockedX) hasta que tengan su propio paquete.
   ========================================================= */
const AMP={
  ancho:3200, arriba:560,
  zonas:{
    granja:{x:1060,y:-480,w:640,h:400},
    huerto:{x:2180,y:360,w:600,h:400},
    lab:{x:2270,y:1080,w:420,h:340},
    reservado:{x:2120,y:-480,w:780,h:600}
  },
  puertas:{ granja:[1380,-50], huerto:[2480,792] },
  almendro:[2135,1060], // el almendro centenario (paquetes/otra-orilla.js); el bosque le deja sitio
  caminos:[ // se dibujan junto con ROADS (dos puntos = recta)
    [[1610,468],[1610,-40]], [[1610,-40],[1380,-40]], [[1380,-40],[1380,-78]],
    [[1985,830],[2480,830]], [[2480,830],[2480,762]], [[2480,830],[2480,1080]]
  ],
  farolas:[[1645,200],[1645,-20],[2030,790],[2520,880]],
  rocas:[[2950,420,1.1],[2100,1200,0.9],[1860,-260,0.8],[3080,1260,1]],
  arbustos:[[1020,-120],[1740,-120],[2050,1310],[2830,840],[2240,1480],[900,-420]]
};
let AMPLIO=false; // se fija en fijaMundo() al dibujar el pueblo
function ampActivo(){ try{ const d=PAQUETES.find(x=>x.id==='otra-orilla'); return !!d&&paqActivo(d); }catch(e){ return false; } }
/* Pone el tamaño del mundo según la ampliación. Devuelve true si ha cambiado (hay que redibujar el fondo). */
function fijaMundo(){
  const a=ampActivo(); if(a===AMPLIO) return false;
  AMPLIO=a; WW=a?AMP.ancho:2400; WY0=a?-AMP.arriba:0; CAM_GRID=null; BGC=null;
  return true;
}
/* una zona del otro lado que ya tiene su paquete (edificio activo, p. ej. 'huertoVivo') deja de dibujarse cerrada */
function zonaAbierta(k){ const id={huerto:'huertoVivo',lab:'labVivo'}[k]; return !!id&&edificiosActivos().some(e=>e.id===id); }
function zona(k){ return AMPLIO&&AMP.zonas[k]?AMP.zonas[k]:B[k]; }
function bgClave(){ return (DECO.fondoClave||'')+(AMPLIO?'|amp':''); }

/* ---------- bosque de lo nuevo (siempre el mismo) ---------- */
let AMP_BOSQUE_L=null;
function ampLibre(x,y){
  const fuera=(z,m)=>!(x>z.x-m&&x<z.x+z.w+m&&y>z.y-m&&y<z.y+z.h+m+40);
  const Z=AMP.zonas;
  if(!fuera(Z.granja,70)||!fuera(Z.huerto,80)||!fuera(Z.lab,70)||!fuera(Z.reservado,20)) return false;
  if(x>1840&&x<2030) return false; // río y orillas
  for(const [[ax,ay],[bx,by]] of AMP.caminos){ // lejos de los caminos nuevos
    const L=Math.hypot(bx-ax,by-ay)||1, t=clamp(((x-ax)*(bx-ax)+(y-ay)*(by-ay))/(L*L),0,1);
    if(Math.hypot(x-(ax+(bx-ax)*t),y-(ay+(by-ay)*t))<60) return false; }
  if(Math.hypot(x-1610,y-470)<80) return false;
  if(Math.abs(x-AMP.almendro[0])<150&&y>AMP.almendro[1]-240&&y<AMP.almendro[1]+130) return false; // sitio del almendro y su copa
  return true;
}
function AMP_BOSQUE(){
  if(AMP_BOSQUE_L) return AMP_BOSQUE_L;
  const out=[]; let i=20000;
  const viejos=FOREST.filter(t=>t.x<=1975);
  const add=(x0,y0,w,h,n,kind)=>{ let c=0, guard=0; while(c<n&&guard++<3000){ i++; const x=x0+seeded(i)*w, y=y0+seeded(i+777)*h;
    if(!ampLibre(x,y)) continue; if(out.concat(viejos).some(t=>Math.hypot(t.x-x,t.y-y)<58)) continue;
    out.push({x,y,k:kind==='mix'?(seeded(i+3)<0.5?'pine':'round'):kind,s:0.85+seeded(i+9)*0.4,i}); c++; } };
  // franja de arriba, lado del pueblo: el bosque de la izquierda sigue hacia arriba; a la derecha, unos pocos
  add(40,-530,640,540,28,'mix'); add(700,-520,320,200,5,'round'); add(1730,-530,120,520,5,'round');
  // otra orilla: borde derecho de pinos, alrededor del huerto y del laboratorio, y abajo
  add(2900,-530,280,2100,26,'pine'); add(2040,-530,80,620,4,'pine'); add(2040,140,1100,200,8,'mix');
  add(2040,880,240,640,7,'mix'); add(2720,900,170,660,6,'mix'); add(2300,1450,420,130,4,'round');
  AMP_BOSQUE_L=out; return out;
}

/* ---------- fondo: flores y prados de lo nuevo (se dibuja una vez, en buildBG) ---------- */
/* suelo propio de la otra orilla: prado de tréboles, margaritas, lavanda y setas (distinto del lado del pueblo) */
function ampSueloLibre(x,y){
  if(x<2000) return false;
  for(const k of ['huerto','lab','reservado']){ const z=AMP.zonas[k]; if(x>z.x-8&&x<z.x+z.w+8&&y>z.y-8&&y<z.y+z.h+8) return false; }
  for(const [[ax,ay],[bx,by]] of AMP.caminos){ const L=Math.hypot(bx-ax,by-ay)||1, t=clamp(((x-ax)*(bx-ax)+(y-ay)*(by-ay))/(L*L),0,1); if(Math.hypot(x-(ax+(bx-ax)*t),y-(ay+(by-ay)*t))<34) return false; }
  return true;
}
function ampSuelo(c){
  const x0=1995, y0=WY0, w=WW-x0, h=WH-WY0, n=k=>Math.round(k*w*h/(1200*2160));
  // manchas de dos verdes (más frescos que los del pueblo)
  for(let i=0;i<n(150);i++){ const x=x0+seeded(i+11000)*w, y=y0+seeded(i+11100)*h; if(!ampSueloLibre(x,y)) continue;
    c.fillStyle=i%3?'rgba(150,200,120,.28)':'rgba(225,240,200,.45)'; c.beginPath(); c.ellipse(x,y,26+seeded(i+11200)*50,10+seeded(i+11300)*16,0,0,Math.PI*2); c.fill(); }
  // matas de hierba alta
  c.strokeStyle='rgba(70,135,80,.45)'; c.lineWidth=2;
  for(let i=0;i<n(520);i++){ const x=x0+seeded(i+11400)*w, y=y0+seeded(i+11500)*h; if(!ampSueloLibre(x,y)) continue; c.beginPath(); c.moveTo(x-4,y); c.quadraticCurveTo(x-5,y-6,x-2,y-9); c.moveTo(x,y); c.lineTo(x,y-10); c.moveTo(x+4,y); c.quadraticCurveTo(x+5,y-6,x+2,y-8); c.stroke(); }
  // corros de tréboles
  for(let i=0;i<n(46);i++){ const cx=x0+seeded(i+11600)*w, cy=y0+seeded(i+11700)*h; if(!ampSueloLibre(cx,cy)) continue;
    for(let k=0;k<9;k++){ const x=cx+(seeded(i*13+k+11800)-0.5)*60, y=cy+(seeded(i*13+k+11900)-0.5)*26; if(!ampSueloLibre(x,y)) continue;
      c.fillStyle=k%4?'#6fae5a':'#7fbe66'; for(let a=0;a<3;a++){ const an=-Math.PI/2+a*2*Math.PI/3; c.beginPath(); c.arc(x+Math.cos(an)*3.2,y+Math.sin(an)*3.2,3.2,0,Math.PI*2); c.fill(); }
      if(k===4){ c.fillStyle='#fbfbf6'; c.beginPath(); c.arc(x,y-7,3,0,Math.PI*2); c.fill(); c.fillStyle='#f0b8d0'; c.beginPath(); c.arc(x,y-7,1.6,0,Math.PI*2); c.fill(); } } } // flor de trébol
  // margaritas sueltas
  for(let i=0;i<n(160);i++){ const x=x0+seeded(i+12000)*w, y=y0+seeded(i+12100)*h; if(!ampSueloLibre(x,y)) continue;
    c.fillStyle='#ffffff'; for(let k=0;k<6;k++){ const a=k*Math.PI/3; c.beginPath(); c.ellipse(x+Math.cos(a)*3,y+Math.sin(a)*3,2.4,1.3,a,0,Math.PI*2); c.fill(); }
    c.fillStyle='#f4c430'; c.beginPath(); c.arc(x,y,1.8,0,Math.PI*2); c.fill(); }
  // matas de lavanda
  for(let i=0;i<n(34);i++){ const x=x0+seeded(i+12200)*w, y=y0+seeded(i+12300)*h; if(!ampSueloLibre(x,y)) continue;
    for(let k=-2;k<=2;k++){ const tx=x+k*4, ty=y-12-Math.abs(k)*-1; c.strokeStyle='#5f9a55'; c.lineWidth=1.5; c.beginPath(); c.moveTo(x,y); c.lineTo(tx,ty); c.stroke();
      c.fillStyle=k%2?'#9b7fd0':'#b59ae2'; for(let j=0;j<3;j++){ c.beginPath(); c.ellipse(tx,ty-j*3,1.8,2.2,0,0,Math.PI*2); c.fill(); } } }
  // setas al pie de algunos árboles
  AMP_BOSQUE().forEach((t,i)=>{ if(t.x<2000||seeded(i+12400)>0.35) return; const x=t.x+(seeded(i+12500)<0.5?-1:1)*(22+seeded(i+12600)*10), y=t.y+8;
    for(let k=0;k<(seeded(i+12700)<0.5?1:2);k++){ const sx=x+k*9, sy=y+k*3, r=5-k;
      c.fillStyle='#f6efe2'; c.fillRect(sx-1.6,sy-5,3.2,5); c.fillStyle='#d9453c'; c.beginPath(); c.ellipse(sx,sy-5,r+1,r*0.75,0,Math.PI,0); c.fill();
      c.fillStyle='#fff'; c.beginPath(); c.arc(sx-2,sy-7,0.9,0,Math.PI*2); c.arc(sx+2,sy-6,0.9,0,Math.PI*2); c.fill(); } });
}
function ampFondo(c){
  ampSuelo(c);
  if(DECO.sinFlores) return;
  const R=AMP.zonas.reservado, cols=['#e4574f','#f4c430','#ffffff','#e46fa8','#a678d6'];
  [[0.25,0.3],[0.62,0.22],[0.45,0.62],[0.8,0.6],[0.18,0.75]].forEach(([fx,fy],m)=>{ // corros de flores
    const cx=R.x+fx*R.w, cy=R.y+fy*R.h;
    for(let k=0;k<22;k++){ const a=seeded(k+9100+m*50)*Math.PI*2, r=Math.sqrt(seeded(k+9200+m*50))*70; drawFlower(c,cx+Math.cos(a)*r*1.4,cy+Math.sin(a)*r*0.8,cols[(k+m)%5]); } });
  for(let k=0;k<40;k++){ const x=100+seeded(k+9300)*900, y=-60+seeded(k+9400)*50; if(!ampLibre(x,y)) continue; drawFlower(c,x,y,['#ffffff','#f4c430','#e46fa8'][k%3]); }
}
/* ---------- sitios cerrados de lo nuevo (debajo de todo, como el huerto y el laboratorio) ---------- */
function ampZonasPueblo(c){
  const g=AMP.zonas.granja;
  if(vis(g.x+g.w/2,g.y+g.h/2,g.w)) lockedX(c,g,'🐄','Granja','Abre con tu huerto');
  const R=AMP.zonas.reservado;
  if(vis(R.x+R.w/2,R.y+R.h/2,R.w)) signX(c,R.x+R.w/2,R.y+R.h-40,'🌼 Pradera libre');
}
/* ---------- árboles, rocas, arbustos y farolas de lo nuevo (ordenados por profundidad) ---------- */
function ampEntidades(E,st){
  const c=vctx;
  AMP_BOSQUE().forEach(t=>{ if(vis(t.x,t.y)) E.push({y:t.y,d:()=>t.k==='pine'?treePine(c,t.x,t.y,t.s,t.i):treeRound(c,t.x,t.y,t.s,t.i)}); });
  AMP.rocas.forEach(([x,y,s])=>{ if(vis(x,y)) E.push({y,d:()=>rockX(c,x,y,s)}); });
  AMP.arbustos.forEach(([x,y],i)=>{ if(vis(x,y)) E.push({y,d:()=>bushX(c,x,y,i%2===0)}); });
  if(st.lv>=2) AMP.farolas.forEach(([x,y])=>{ if(vis(x,y)) E.push({y,d:()=>lampX(c,x,y)}); });
}
function ampGranjaMsg(){
  say({face:'🐄',name:'La granja',text:'Aquí habrá una granja con animales. Se abrirá cuando tengas tu parcela en el huerto del robot, al otro lado del río: ¡los animales comerán lo que cultives!'});
}
