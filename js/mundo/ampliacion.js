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
  caminos:[ // se dibujan junto con ROADS (dos puntos = recta)
    [[1610,468],[1610,-40]], [[1610,-40],[1380,-40]], [[1380,-40],[1380,-78]],
    [[1985,830],[2480,830]], [[2480,830],[2480,762]], [[2480,830],[2480,1080]]
  ],
  farolas:[[1645,200],[1645,-20],[2030,790],[2520,880]],
  rocas:[[2950,420,1.1],[2100,1200,0.9],[1860,-260,0.8],[3080,1260,1]],
  arbustos:[[1020,-120],[1740,-120],[2140,880],[2830,840],[2240,1480],[900,-420]]
};
let AMPLIO=false; // se fija en fijaMundo() al dibujar el pueblo
function ampActivo(){ try{ const d=PAQUETES.find(x=>x.id==='otra-orilla'); return !!d&&paqActivo(d); }catch(e){ return false; } }
/* Pone el tamaño del mundo según la ampliación. Devuelve true si ha cambiado (hay que redibujar el fondo). */
function fijaMundo(){
  const a=ampActivo(); if(a===AMPLIO) return false;
  AMPLIO=a; WW=a?AMP.ancho:2400; WY0=a?-AMP.arriba:0; CAM_GRID=null; BGC=null;
  return true;
}
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
function ampFondo(c){
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
