"use strict";
/* =========================================================
   POR DENTRO DE LA TIENDA, LA PANADERÍA Y LA BIBLIOTECA
   ---------------------------------------------------------
   Al entrar se ve el interior dibujado con quien atiende detrás del mostrador y un bocadillo que saluda.
   Las opciones (lo que se compra, los cuadernos, empezar el turno) salen al lado; en pantallas estrechas, debajo.
   lugarEscena(kind, cont, texto) pinta la escena en cont y la anima mientras esa pantalla esté abierta.
   ========================================================= */
const RECINTOS={
  shop:{npc:'coco',nombre:()=>NPCS.coco.n,pared:'#fbe6cc',dibujo:fondoTienda},
  bakery:{npc:'bruno',nombre:()=>'Bruno el panadero',pared:'#fdf1dd',dibujo:fondoPanaderia},
  library:{npc:'sabina',nombre:()=>'Sabina la lechuza',pared:'#ece4f6',dibujo:fondoBiblioteca}
};
const ESC_W=600, ESC_H=380;
function saludoHora(){ const h=new Date(now()).getHours(); return h<14&&h>=6?'¡Buenos días':h<21&&h>=6?'¡Buenas tardes':'¡Buenas noches'; }
function lugarEscena(kind,cont,texto){
  const R=RECINTOS[kind]; if(!cont||!R) return;
  cont.innerHTML='';
  const cv=document.createElement('canvas'); cv.className='esc-cv';
  const bo=el('div','esc-boca'); bo.innerHTML=`<div class="esc-nom">${esc(R.nombre())}</div><div class="esc-txt">${esc(texto)}</div>`;
  const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(texto); bo.append(sp);
  cont.append(bo,cv);
  const dpr=Math.min(2,window.devicePixelRatio||1); cv.width=ESC_W*dpr; cv.height=ESC_H*dpr;
  const c=cv.getContext('2d'); const scr=curScreen, t0=performance.now();
  const frame=()=>{ if(curScreen!==scr||!cv.isConnected) return; const t=(performance.now()-t0)/1000;
    c.setTransform(dpr,0,0,dpr,0,0); dibujaRecinto(c,kind,t); requestAnimationFrame(frame); };
  frame(); speakAuto(texto);
}
function dibujaRecinto(c,kind,t){
  const R=RECINTOS[kind];
  c.fillStyle=R.pared; c.fillRect(0,0,ESC_W,ESC_H);
  c.fillStyle='#d9b48a'; c.fillRect(0,330,ESC_W,50); // suelo
  c.fillStyle='rgba(0,0,0,.06)'; for(let x=0;x<ESC_W;x+=60) c.fillRect(x,330,2,50);
  R.dibujo(c,t,'fondo');
  // quien atiende, detrás del mostrador
  const sc={library:2.5,shop:3.1,bakery:2.8}[kind], y={library:262,shop:266,bakery:272}[kind]; // se ve de cintura para arriba
  drawNPCFig(c,R.npc,300,y,{t,sc});
  R.dibujo(c,t,'mostrador');
}
function mostrador(c,col,top){
  roundRect(c,110,255,380,90,14); c.fillStyle=col; c.fill(); ol(c,3);
  roundRect(c,98,242,404,26,10); c.fillStyle=top; c.fill(); ol(c,3);
  c.fillStyle='rgba(0,0,0,.08)'; for(let x=134;x<440;x+=78){ roundRect(c,x,280,56,52,8); c.fill(); }
}
function balda(c,x,y,w){ roundRect(c,x,y,w,10,4); c.fillStyle='#a8723f'; c.fill(); ol(c,2.2); }
/* ---- La Tienda de Coco ---- */
function fondoTienda(c,t,capa){
  if(capa==='fondo'){
    c.fillStyle='rgba(255,255,255,.35)'; for(let x=0;x<ESC_W;x+=48) c.fillRect(x,0,22,330); // papel a rayas
    balda(c,30,118,170); balda(c,400,118,170); balda(c,30,206,170); balda(c,400,206,170);
    // macetas, cojines, lámpara y tarros
    const maceta=(x,y,col)=>{ roundRect(c,x-12,y-20,24,20,5); c.fillStyle='#d8774a'; c.fill(); ol(c,2); c.fillStyle=col; c.beginPath(); c.arc(x,y-28,12,0,Math.PI*2); c.fill(); ol(c,2); };
    maceta(60,118,'#f39ab8'); maceta(110,118,'#ffd25a'); maceta(160,118,'#9ad07a');
    const cojin=(x,y,col)=>{ roundRect(c,x-20,y-22,40,22,9); c.fillStyle=col; c.fill(); ol(c,2); };
    cojin(440,118,'#8fc3ef'); cojin(492,118,'#f6a3c0'); cojin(540,118,'#c8a8ef');
    const tarro=(x,y,col)=>{ roundRect(c,x-11,y-26,22,26,6); c.fillStyle='rgba(255,255,255,.7)'; c.fill(); ol(c,2); c.fillStyle=col; for(let k=0;k<4;k++){ c.beginPath(); c.arc(x-4+(k%2)*8,y-8-Math.floor(k/2)*8,3.5,0,Math.PI*2); c.fill(); } };
    tarro(55,206,'#e4574f'); tarro(90,206,'#4a8fdc'); tarro(125,206,'#5cb85c'); tarro(160,206,'#f29b38');
    roundRect(c,435,170,10,36,3); c.fillStyle='#7a5a3a'; c.fill(); c.beginPath(); c.moveTo(420,176); c.lineTo(460,176); c.lineTo(450,150); c.lineTo(430,150); c.closePath(); c.fillStyle='#ffe28a'; c.fill(); ol(c,2);
    roundRect(c,480,166,70,40,6); c.fillStyle='#c98a55'; c.fill(); ol(c,2); // cajita
    // cartel
    roundRect(c,215,18,170,44,12); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.6);
    c.fillStyle=OUT; c.font='700 22px "Baloo 2",sans-serif'; c.textAlign='center'; c.fillText('Tienda de Coco',300,48); c.textAlign='left';
  } else {
    mostrador(c,'#c98a55','#e6b07a');
    roundRect(c,130,214,62,34,6); c.fillStyle='#f6d36b'; c.fill(); ol(c,2.4); c.fillStyle=OUT; c.font='700 18px sans-serif'; c.fillText('🔘',146,238); // caja
    for(let k=0;k<5;k++){ const a=-0.6+k*0.3; c.strokeStyle='#5c9e46'; c.lineWidth=3; c.beginPath(); c.moveTo(440,248); c.lineTo(440+Math.sin(a)*34,214-Math.cos(a)*10); c.stroke(); c.fillStyle=['#f39ab8','#ffd25a','#ffffff','#e4574f','#c8a8ef'][k]; c.beginPath(); c.arc(440+Math.sin(a)*34,206-Math.cos(a)*10+Math.sin(t*2+k)*1.2,8,0,Math.PI*2); c.fill(); ol(c,1.6); }
    roundRect(c,424,226,32,24,6); c.fillStyle='#8fc3ef'; c.fill(); ol(c,2.2);
  }
}
/* ---- La Panadería de Bruno ---- */
function fondoPanaderia(c,t,capa){
  if(capa==='fondo'){
    c.fillStyle='#f3dfc2'; for(let y=200;y<330;y+=26) for(let x=(y/26)%2?0:24;x<ESC_W;x+=48){ roundRect(c,x+2,y+2,44,22,4); c.fill(); } // azulejos
    // horno de leña
    roundRect(c,26,70,170,190,28); c.fillStyle='#c4693f'; c.fill(); ol(c,3);
    c.fillStyle='rgba(0,0,0,.1)'; for(let y=86;y<250;y+=22) for(let x=y%44?34:46;x<186;x+=26) c.fillRect(x,y,18,3);
    c.beginPath(); c.moveTo(56,250); c.lineTo(56,175); c.arc(111,175,55,Math.PI,0); c.lineTo(166,250); c.closePath(); c.fillStyle='#3a2418'; c.fill(); ol(c,3);
    const g=0.6+Math.sin(t*6)*0.15+Math.sin(t*11)*0.08; // fuego
    for(let k=0;k<5;k++){ c.fillStyle=k%2?`rgba(255,200,60,${g})`:`rgba(242,110,40,${g})`; c.beginPath(); const x=72+k*16, h=30+Math.sin(t*8+k*1.7)*10; c.moveTo(x-9,248); c.quadraticCurveTo(x,248-h*1.6,x+9,248); c.fill(); }
    // baldas con pan
    balda(c,380,96,190); balda(c,380,176,190);
    const pan=(x,y,w,col)=>{ c.fillStyle=col; c.beginPath(); c.ellipse(x,y-12,w,12,0,0,Math.PI*2); c.fill(); ol(c,2); c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=2; for(let k=-1;k<=1;k++){ c.beginPath(); c.moveTo(x+k*w/2.5-4,y-18); c.lineTo(x+k*w/2.5+4,y-8); c.stroke(); } };
    pan(410,96,26,'#d8994f'); pan(470,96,26,'#c98440'); pan(530,96,26,'#e0a65e');
    const crua=(x,y)=>{ c.fillStyle='#eaa64e'; c.beginPath(); c.moveTo(x-22,y-4); c.quadraticCurveTo(x,y-34,x+22,y-4); c.quadraticCurveTo(x,y-14,x-22,y-4); c.fill(); ol(c,2); };
    crua(410,176); crua(470,176); crua(530,176);
    roundRect(c,215,18,170,44,12); c.fillStyle='#fffaf1'; c.fill(); ol(c,2.6);
    c.fillStyle=OUT; c.font='700 22px "Baloo 2",sans-serif'; c.textAlign='center'; c.fillText('Panadería',300,48); c.textAlign='left';
  } else {
    mostrador(c,'#b07a4a','#e8c79a');
    roundRect(c,132,222,84,26,10); c.fillStyle='#c9925a'; c.fill(); ol(c,2.4); // cesta
    for(let k=0;k<3;k++){ c.fillStyle='#e0a65e'; c.beginPath(); c.ellipse(150+k*24,220,13,9,0,0,Math.PI*2); c.fill(); ol(c,1.8); }
    // tarta
    roundRect(c,410,206,64,42,8); c.fillStyle='#fbe3ef'; c.fill(); ol(c,2.4); c.fillStyle='#f39ab8'; c.fillRect(410,222,64,6);
    c.fillStyle='#e4574f'; c.beginPath(); c.arc(442,200,7,0,Math.PI*2); c.fill(); ol(c,1.6);
  }
}
/* ---- La Biblioteca de Sabina ---- */
const LIB_COLS=['#e4574f','#4a8fdc','#5cb85c','#f29b38','#a678d6','#f6d36b','#3fb3a8','#e98bb3'];
function estante(c,x,y,w,h,seed){
  roundRect(c,x,y,w,h,10); c.fillStyle='#8a5a36'; c.fill(); ol(c,3);
  for(let r=0;r<4;r++){ const yy=y+14+r*((h-24)/4), hh=(h-24)/4-8; let xx=x+12, k=seed+r*7;
    while(xx<x+w-20){ const bw=12+(k*37%10), bh=hh-(k*13%12); c.fillStyle=LIB_COLS[k%LIB_COLS.length]; roundRect(c,xx,yy+hh-bh,bw,bh,2); c.fill(); ol(c,1.4); xx+=bw+2; k++; }
    c.fillStyle='#6d4426'; c.fillRect(x+8,yy+hh,w-16,5); }
}
function fondoBiblioteca(c,t,capa){
  if(capa==='fondo'){
    estante(c,20,40,150,290,1); estante(c,430,40,150,290,5);
    // ventana con cielo
    roundRect(c,225,40,150,120,60); c.fillStyle=nightLevel()>0.5?'#2c3566':'#bfe3f7'; c.fill(); ol(c,3);
    c.strokeStyle=OUT; c.lineWidth=3; c.beginPath(); c.moveTo(300,40); c.lineTo(300,160); c.moveTo(225,105); c.lineTo(375,105); c.stroke();
    if(nightLevel()>0.5){ c.fillStyle='#fff3b0'; c.beginPath(); c.arc(340,72,12,0,Math.PI*2); c.fill(); }
    else { c.fillStyle='#fff'; c.beginPath(); c.ellipse(258+Math.sin(t*0.3)*6,74,18,8,0,0,Math.PI*2); c.fill(); }
    // alfombra
    c.fillStyle='#a678d6'; c.beginPath(); c.ellipse(300,352,190,18,0,0,Math.PI*2); c.fill();
  } else {
    // mesa de la lechuza
    roundRect(c,150,262,300,76,14); c.fillStyle='#9a6338'; c.fill(); ol(c,3);
    roundRect(c,138,250,324,22,10); c.fillStyle='#c18a55'; c.fill(); ol(c,3);
    // libro abierto
    c.fillStyle='#fffaf1'; c.beginPath(); c.moveTo(200,250); c.quadraticCurveTo(225,236,252,246); c.lineTo(252,252); c.quadraticCurveTo(225,244,200,256); c.closePath(); c.fill(); ol(c,1.8);
    c.beginPath(); c.moveTo(252,246); c.quadraticCurveTo(278,236,304,250); c.lineTo(304,256); c.quadraticCurveTo(278,244,252,252); c.closePath(); c.fill(); ol(c,1.8);
    // lámpara
    roundRect(c,398,206,8,46,3); c.fillStyle='#5c9e46'; c.fill(); ol(c,2);
    c.beginPath(); c.moveTo(376,212); c.lineTo(428,212); c.lineTo(418,188); c.lineTo(386,188); c.closePath(); c.fillStyle='#7fc06a'; c.fill(); ol(c,2.2);
    c.fillStyle='rgba(255,236,150,.25)'; c.beginPath(); c.moveTo(380,214); c.lineTo(424,214); c.lineTo(450,250); c.lineTo(354,250); c.closePath(); c.fill();
  }
}
