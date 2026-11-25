"use strict";
/* =========================================================
   INTERIOR DE LA CASA (decoración)
   ========================================================= */
const FURN=[
  {k:'silla',e:'🪑',n:'Silla',p:15,z:'floor',draw:'silla'},{k:'mesa',n:'Mesa',p:30,z:'floor',draw:'table'},
  {k:'cama',e:'🛏️',n:'Cama',p:45,z:'floor',draw:'cama'},{k:'sofa',e:'🛋️',n:'Sofá',p:60,z:'floor',draw:'sofa'},
  {k:'lampara',e:'💡',n:'Lámpara de pie',p:35,z:'floor',draw:'lampara',nota:'De noche se enciende'},
  {k:'alf_r',n:'Alfombra roja',p:20,z:'floor',draw:'rug',col:'#e4574f'},{k:'alf_b',n:'Alfombra azul',p:20,z:'floor',draw:'rug',col:'#4a8fdc'},
  {k:'alf_m',n:'Alfombra lila',p:25,z:'floor',draw:'rug',col:'#a678d6',m:['telar',2]},
  {k:'planta',e:'🪴',n:'Planta',p:20,z:'floor'},{k:'osito',e:'🧸',n:'Osito',p:15,z:'floor'},
  {k:'lanas',e:'🧶',n:'Cesto de lanas',p:25,z:'floor',m:['telar',2]},{k:'muneca',e:'🪆',n:'Muñecas rusas',p:30,z:'floor',m:['pan',2]},
  {k:'estante',n:'Estantería con libros',p:50,z:'floor',draw:'shelf',m:['bib',2]},{k:'caballete',e:'🎨',n:'Caballete de pintura',p:50,z:'floor',m:['telar',3]},
  {k:'pecera',n:'Pecera',p:300,z:'floor',draw:'fishbowl',d:14,once:1},{k:'piano',e:'🎹',n:'Piano',p:120,z:'floor',draw:'piano',m:['pan',4]},
  {k:'pizarra',n:'Pizarra',p:40,z:'wall',draw:'board',once:1},{k:'cuadro',e:'🖼️',n:'Cuadro',p:20,z:'wall'},{k:'guirnalda',n:'Guirnalda',p:15,z:'wall',draw:'garland'},
  {k:'espejo',e:'🪞',n:'Espejo',p:25,z:'wall'},{k:'mapa',e:'🗺️',n:'Mapa del mundo',p:30,z:'wall',m:['bib',2]},
  {k:'reloj',e:'🕰️',n:'Reloj de pared',p:35,z:'wall',m:['pan',3]},{k:'estrella',e:'⭐',n:'Estrella brillante',p:40,z:'wall',m:['bib',4]}
];
const WALLPATS=[{k:'liso',n:'Lisa',p:0},{k:'rayas',n:'Rayas',p:30},{k:'lunares',n:'Lunares',p:40},{k:'flores',n:'Flores',p:60,m:['telar',3]},{k:'estrellas',n:'Estrellas',p:80,m:['bib',3]}];
const FLOORS=[{k:'madera',n:'Madera',p:0},{k:'baldosas',n:'Baldosas',p:40},{k:'moqueta',n:'Moqueta',p:50},{k:'ajedrez',n:'Ajedrez',p:70,m:['telar',4]}];
const WALLCOLS=['#fbe9d0','#fde2e4','#e2ecfb','#e4f5df','#efe4fb','#fff6c9'];
const WALL_SLOTS=[[122,165],[215,135],[305,180],[595,180],[690,135],[782,165]];
const RW={W:900,H:600,gx:40,cw:90,rows:[[352,432,405,0.9],[432,505,478,1],[505,590,560,1.12]]}; // gx, cw y rows: la casa de antes (8×3); el suelo de ahora está en suelo.js
function furn(k){ return FURN.find(f=>'fu_'+f.k===k); }
function roomOf(p){ if(!p.room){ p.room={wall:'#fbe9d0',pat:'liso',floor:'madera',owned:{liso:1,madera:1},fl:Array(24).fill(null),wl:Array(6).fill(null)}; casaNueva(p); } return p.room; }
let houseView='garden';
function drawFurn(c,f,x,y,s,t,o){ o=o||{}; const tm=muTam(f);
  if(f.draw==='rug'){ c.save(); c.translate(x,y-8); c.scale(s*(o.w||1)*0.9,s*0.42); c.beginPath(); c.ellipse(0,0,52,52,0,0,Math.PI*2); c.fillStyle=f.col; c.fill(); ol(c,4); c.beginPath(); c.ellipse(0,0,38,38,0,0,Math.PI*2); c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=5; c.setLineDash([10,8]); c.stroke(); c.setLineDash([]); c.restore(); return; }
  c.save(); c.translate(x,y); c.scale(o.g?-s:s,s);
  if(typeof f.draw==='string'&&typeof MUEBLE_DIB!=='undefined'&&MUEBLE_DIB[f.draw]){ MUEBLE_DIB[f.draw](c,t||0,o); c.restore(); return; } // muebles dibujados (muebles.js)
  c.fillStyle='rgba(60,40,20,.2)'; c.beginPath(); c.ellipse(0,2,34*(tm.w>1?tm.w*0.9:Math.min(1,tm.t)),8,0,0,Math.PI*2); c.fill();
  if(f.draw==='fishbowl'){ roundRect(c,-26,-14,52,14,4); c.fillStyle='#9a6338'; c.fill(); ol(c,2); c.beginPath(); c.arc(0,-46,32,0,Math.PI*2); c.fillStyle='rgba(190,235,255,.55)'; c.fill(); ol(c,2.6);
    c.save(); c.beginPath(); c.arc(0,-46,30,0,Math.PI*2); c.clip(); c.fillStyle='#6ab7e6'; c.fillRect(-32,-58,64,44); c.fillStyle='#e8d5a6'; c.fillRect(-32,-24,64,10);
    for(let i=0;i<3;i++){ const fx=Math.sin(t*0.9+i*2)*18, fy=-40+i*7+Math.sin(t*2+i)*2, d=Math.cos(t*0.9+i*2)>0?1:-1; c.save(); c.translate(fx,fy); c.scale(d,1); c.fillStyle=['#f29b38','#e4574f','#f4c430'][i]; c.beginPath(); c.ellipse(0,0,6,4,0,0,Math.PI*2); c.fill(); c.beginPath(); c.moveTo(-5,0); c.lineTo(-10,-4); c.lineTo(-10,4); c.closePath(); c.fill(); c.restore(); }
    c.strokeStyle='#55b05a'; c.lineWidth=3; c.beginPath(); c.moveTo(-14,-16); c.quadraticCurveTo(-18+Math.sin(t)*3,-28,-12,-38); c.stroke(); c.restore();
    c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=3; c.beginPath(); c.arc(-8,-56,14,Math.PI*1.1,Math.PI*1.5); c.stroke(); }
  else if(typeof f.draw==='function'){ if(tm.t!==1) c.scale(tm.t,tm.t); f.draw(c,t||0); } // dibujo propio (p. ej. los muebles de un paquete), con el pie en (0,0)
  else { c.font=Math.round(58*tm.t)+'px serif'; c.textAlign='center'; c.textBaseline='bottom'; c.fillStyle='#000'; c.fillText(f.e,0,4); }
  c.restore();
}
function drawWallItem(c,f,x,y,t){
  if(typeof f.draw==='function'){ c.save(); c.translate(x,y); f.draw(c,t||0); c.restore(); return; } // dibujo propio, centrado en (0,0)
  if(f.draw==='board'){ drawBoardMini(c,x,y,curScreen==='house'?GD.p:null); return; }
  if(f.draw==='garland'){ c.strokeStyle='#8a5a36'; c.lineWidth=2; c.beginPath(); c.moveTo(x-50,y-20); c.quadraticCurveTo(x,y+4,x+50,y-20); c.stroke(); for(let i=0;i<7;i++){ const tt=(i+0.5)/7, px=x-50+100*tt, py=y-20+24*4*tt*(1-tt); c.fillStyle=Object.values(COLORS)[i%6].c; c.beginPath(); c.moveTo(px-6,py); c.lineTo(px+6,py); c.lineTo(px,py+14); c.closePath(); c.fill(); ol(c,1.2); } return; }
  c.fillStyle='rgba(60,40,20,.12)'; c.beginPath(); c.ellipse(x+4,y+30,22,5,0,0,Math.PI*2); c.fill();
  c.font='56px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#000';
  if(f.k==='estrella'){ c.save(); c.translate(x,y); c.rotate(Math.sin(t*1.5)*0.1); c.globalAlpha=0.85+Math.sin(t*3)*0.15; c.fillText(f.e,0,0); c.restore(); } else c.fillText(f.e,x,y);
}
/* ---- Paredes laterales y gente que anda dentro ----
   La pared del fondo va de RWB.x0 a RWB.x1; el suelo es un trapecio que se abre hacia delante.
   Dentro andan la dueña y, si hay visita, la otra niña o papá (el alcalde). Se toca el suelo para andar. */
const RWB={x0:70,x1:830,fy:340};
function roomBordes(y){ const k=Math.max(0,Math.min(1,(y-RWB.fy)/(RW.H-RWB.fy))); return [RWB.x0*(1-k)+26, RWB.x1+(RW.W-RWB.x1)*k-26]; }
let RM={p:null,gente:[],last:0};
function roomGente(){
  const p=GD.p; if(RM.p===p&&RM.gente.length&&RM.vis===(VISIT?'alcalde':P()&&P().id)) return RM.gente;
  RM.p=p; RM.vis=VISIT?'alcalde':P()&&P().id;
  RM.gente=[{k:'dueña',p,x:820,y:570,tx:820,ty:570,dir:-1}];
  if(VISIT) RM.gente.push({k:'alcalde',x:690,y:585,tx:690,ty:585,dir:1});
  else if(P()&&P()!==p) RM.gente.push({k:'visita',p:P(),x:690,y:585,tx:690,ty:585,dir:1});
  GD.camX=Math.max(0,RW.W-(GD.roomVW||RW.W)); return RM.gente;
}
function roomAndador(){ const g=roomGente(); return GD.mine?g[0]:(g[1]||null); }
function roomAndar(x,y){
  const a=roomAndador(); if(!a) return false;
  const yy=Math.max(392,Math.min(RW.H-10,y)), [l,r]=roomBordes(yy);
  a.tx=Math.max(l,Math.min(r,x)); a.ty=yy; return true;
}
function roomMover(dt){
  for(const a of roomGente()){ const dx=a.tx-a.x, dy=a.ty-a.y, d=Math.hypot(dx,dy);
    if(d>3){ const s=Math.min(d,260*dt); a.x+=dx/d*s; a.y+=dy/d*s; a.moving=true; if(Math.abs(dx)>2) a.dir=dx>0?1:-1; } else a.moving=false; }
  const a=roomAndador()||roomGente()[0], vw=GD.roomVW||RW.W;
  if(vw<RW.W){ const want=Math.max(0,Math.min(RW.W-vw,a.x-vw/2)); GD.camX=(GD.camX||0)+(want-(GD.camX||0))*Math.min(1,dt*5); } else GD.camX=0;
}
function drawGenteRoom(c,a,t){
  if(a.k==='alcalde') drawNPCFig(c,'alcalde',a.x,a.y,{t,moving:a.moving,dir:a.dir,sc:1.9});
  else drawHero(c,a.x,a.y,{look:lookOf(a.p),t,sc:1.9,dir:a.dir,moving:a.moving,blink:(t%3.4)>3.25,wave:!a.moving&&a.k==='dueña'&&(t%7)>5.8});
}
function drawRoom(t){
  const cv=$('#gcv'); if(!cv) return; const c=cv.getContext('2d'), p=GD.p, R=roomOf(p);
  const dt=Math.min(0.05,Math.max(0,t-(RM.last||t))); RM.last=t; roomMover(dt);
  c.setTransform(GD.k,0,0,GD.k,-(GD.camX||0)*GD.k,0);
  // pared
  c.fillStyle=R.wall; c.fillRect(0,0,RW.W,340);
  c.save(); c.beginPath(); c.rect(0,0,RW.W,330); c.clip();
  const dk=shade(R.wall,-0.08), lt=shade(R.wall,0.5);
  const wpd=WALLPATS.find(w=>w.k===R.pat); if(wpd&&typeof wpd.draw==='function') wpd.draw(c,RW.W,330,R.wall); // papel de un paquete
  if(R.pat==='rayas'){ c.fillStyle=dk; for(let x=0;x<RW.W;x+=44) c.fillRect(x,0,20,330); }
  if(R.pat==='lunares'){ c.fillStyle=lt; for(let y=20,r=0;y<330;y+=40,r++) for(let x=20+(r%2)*20;x<RW.W;x+=40){ c.beginPath(); c.arc(x,y,6,0,Math.PI*2); c.fill(); } }
  if(R.pat==='flores'){ for(let y=30,r=0;y<330;y+=60,r++) for(let x=30+(r%2)*40;x<RW.W;x+=80) drawFlower(c,x,y,['#e46fa8','#ffffff','#f4c430'][(x+y)%3]); }
  if(R.pat==='estrellas'){ c.font='16px serif'; c.textAlign='center'; c.fillStyle='#000'; c.globalAlpha=0.5; for(let y=26,r=0;y<330;y+=48,r++) for(let x=24+(r%2)*30;x<RW.W;x+=60) c.fillText('✦',x,y); c.globalAlpha=1; }
  c.restore();
  roundRect(c,-4,312,RW.W+8,28,4); c.fillStyle='#b97a48'; c.fill(); ol(c,2.6);
  // ventana
  roundRect(c,380,62,140,150,12); c.fillStyle='#fffaf1'; c.fill(); ol(c,3);
  const nt=nightLevel()>0.5; const sky=c.createLinearGradient(0,72,0,202); sky.addColorStop(0,nt?'#1c2552':'#a8dcf7'); sky.addColorStop(1,nt?'#3a4a8a':'#d8f1ff'); roundRect(c,392,74,116,126,6); c.fillStyle=sky; c.fill();
  c.fillStyle=nt?'#2f4a3a':'#8cc46a'; c.fillRect(392,170,116,30); c.fillStyle=nt?'#24402f':'#5bb04f'; c.beginPath(); c.arc(430,168,18,0,Math.PI*2); c.arc(476,172,14,0,Math.PI*2); c.fill();
  if(nt){ c.fillStyle='#fff6cf'; c.beginPath(); c.arc(480,100,13,0,Math.PI*2); c.fill(); c.fillStyle='#1c2552'; c.beginPath(); c.arc(486,96,11,0,Math.PI*2); c.fill(); c.fillStyle='#fff'; [[405,90],[430,118],[455,84],[420,150],[495,140]].forEach(([sx,sy],i)=>{ c.globalAlpha=0.5+0.5*Math.sin(t*2+i); c.fillRect(sx,sy,2.5,2.5); }); c.globalAlpha=1; }
  else { c.fillStyle='#fff'; c.beginPath(); c.arc(420+Math.sin(t*0.2)*20,100,10,0,Math.PI*2); c.arc(434+Math.sin(t*0.2)*20,96,13,0,Math.PI*2); c.arc(448+Math.sin(t*0.2)*20,102,9,0,Math.PI*2); c.fill(); }
  c.strokeStyle='#fffaf1'; c.lineWidth=5; c.beginPath(); c.moveTo(450,74); c.lineTo(450,200); c.moveTo(392,137); c.lineTo(508,137); c.stroke();
  for(const s of [-1,1]){ c.beginPath(); const cx=450+s*76; c.moveTo(cx,56); c.quadraticCurveTo(cx-s*20,140,cx+s*4,222); c.lineTo(cx+s*24,222); c.quadraticCurveTo(cx+s*10,140,cx+s*20,56); c.closePath(); c.fillStyle=p.color; c.fill(); ol(c,2.4); }
  roundRect(c,360,52,180,9,4); c.fillStyle='#9a6338'; c.fill(); ol(c,2);
  // suelo
  const fy=340;
  if(R.floor==='madera'){ c.fillStyle='#d9a873'; c.fillRect(0,fy,RW.W,RW.H-fy); c.strokeStyle='#b8865a'; c.lineWidth=2; for(let y=fy,r=0;y<RW.H;y+=30,r++){ c.beginPath(); c.moveTo(0,y); c.lineTo(RW.W,y); c.stroke(); for(let x=(r%2)*70;x<RW.W;x+=140){ c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+30); c.stroke(); } } }
  else if(R.floor==='baldosas'){ c.fillStyle='#f3efe6'; c.fillRect(0,fy,RW.W,RW.H-fy); c.strokeStyle='#cfc6b4'; c.lineWidth=2; for(let y=fy;y<RW.H;y+=52){ c.beginPath(); c.moveTo(0,y); c.lineTo(RW.W,y); c.stroke(); } for(let x=0;x<RW.W;x+=52){ c.beginPath(); c.moveTo(x,fy); c.lineTo(x,RW.H); c.stroke(); } }
  else if(R.floor==='moqueta'){ c.fillStyle=shade(p.color,0.55); c.fillRect(0,fy,RW.W,RW.H-fy); for(let i=0;i<500;i++){ c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(seeded(i)*RW.W,fy+seeded(i+9)*(RW.H-fy),2,2); } }
  else { for(let y=fy,r=0;y<RW.H;y+=46,r++) for(let x=0,k=0;x<RW.W;x+=46,k++){ c.fillStyle=(r+k)%2?'#3e3a44':'#f3efe6'; c.fillRect(x,y,46,46); } }
  c.fillStyle='rgba(60,40,20,.12)'; c.fillRect(0,fy,RW.W,10);
  // paredes laterales (encima del borde del suelo y de la pared del fondo)
  for(const s of [-1,1]){ const xb=s<0?RWB.x0:RWB.x1, xe=s<0?0:RW.W;
    c.beginPath(); c.moveTo(xe,0); c.lineTo(xb,0); c.lineTo(xb,RWB.fy); c.lineTo(xe,RW.H); c.closePath();
    c.fillStyle=shade(R.wall,-0.16); c.fill();
    c.save(); c.clip(); c.fillStyle='rgba(255,255,255,.08)'; for(let k=0;k<4;k++){ c.beginPath(); c.moveTo(xb+(xe-xb)*k/4,0); c.lineTo(xb+(xe-xb)*(k+0.5)/4,0); c.lineTo(xb+(xe-xb)*(k+0.5)/4,RW.H); c.lineTo(xb+(xe-xb)*k/4,RW.H); c.fill(); }
    // zócalo inclinado
    c.beginPath(); c.moveTo(xb,RWB.fy-28); c.lineTo(xb,RWB.fy); c.lineTo(xe,RW.H); c.lineTo(xe,RW.H-60); c.closePath(); c.fillStyle='#a86d3f'; c.fill(); c.restore();
    c.beginPath(); c.moveTo(xb,0); c.lineTo(xb,RWB.fy); c.lineTo(xe,RW.H); c.lineWidth=3; c.strokeStyle=OUT; c.stroke(); }
  // huecos de la pared
  const sel=GD.mine&&invSel&&invSel.startsWith('fu_')?furn(invSel):null;
  WALL_SLOTS.forEach(([x,y],i)=>{ const it=R.wl[i];
    if(!it&&sel&&sel.z==='wall'){ c.strokeStyle=`rgba(255,255,255,${0.6+Math.sin(t*5)*0.3})`; c.lineWidth=4; c.setLineDash([8,6]); roundRect(c,x-40,y-40,80,80,14); c.stroke(); c.setLineDash([]); }
    if(it){ const f=furn(it); if(f) drawWallItem(c,f,x,y,t); } });
  // suelo: alfombras, guía para colocar, muebles y gente de atrás hacia delante (suelo.js)
  if(sel&&sel.z==='floor') suGuia(c,R,sel,t);
  const cosas=suCosas(c,R,p,t).concat(roomGente().map(a=>({y:a.y,d:()=>drawGenteRoom(c,a,t)})));
  cosas.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
  if(sel&&sel.z==='floor') suFantasma(c,R,sel,p,t);
  // de noche el cuarto se oscurece un poco y las lámparas dan luz
  const nl=nightLevel(); if(nl>0.3){ c.fillStyle=`rgba(25,30,70,${(0.24*nl).toFixed(3)})`; c.fillRect(0,0,RW.W,RW.H);
    c.save(); c.globalCompositeOperation='lighter'; SU.luces.forEach(([x,y,s])=>{ const g=c.createRadialGradient(x,y,4,x,y,150*s); g.addColorStop(0,'rgba(255,190,100,.42)'); g.addColorStop(1,'rgba(255,190,100,0)'); c.fillStyle=g; c.beginPath(); c.arc(x,y,150*s,0,Math.PI*2); c.fill(); }); c.restore(); }
}
function roomAbre(k,p){ const f=furn(k); if(!f) return false;
  if(typeof f.abre==='function'){ beep(700,0.05); f.abre(p); return true; } // muebles que se abren (p. ej. el Belén)
  if(k==='fu_pizarra'){ beep(700,0.05); openBoardView(p); return true; }
  if(k==='fu_pecera'){ beep(700,0.05); openAqua(p); return true; }
  return false; }
function roomClick(x,y){
  const p=GD.p, R=roomOf(p), mine=GD.mine, sel=mine&&invSel&&invSel.startsWith('fu_')?furn(invSel):null;
  // la pared
  for(let i=0;i<WALL_SLOTS.length;i++){ const [sx,sy]=WALL_SLOTS[i]; if(Math.abs(x-sx)<46&&Math.abs(y-sy)<46){
    if(R.wl[i]&&!sel&&!GD.girar&&roomAbre(R.wl[i],p)) return;
    if(!mine) return;
    if(R.wl[i]){ p.inv[R.wl[i]]=(p.inv[R.wl[i]]||0)+1; R.wl[i]=null; beep(350,0.05); }
    else if(sel&&sel.z==='wall'){ R.wl[i]=invSel; if(!--p.inv[invSel]){ delete p.inv[invSel]; invSel=null; } beep(760,0.07,'triangle'); }
    else { toast(sel?'Eso va en el suelo':'Elige algo para la pared en tu cesta'); return; }
    save(); renderHouse(); return; } }
  const h=suToca(R,x,y);
  // dar la vuelta a los muebles
  if(mine&&GD.girar){ if(h){ h.o.g=h.o.g?0:1; beep(620,0.05); save(); } else toast('Toca un mueble para darle la vuelta'); return; }
  // con algo elegido en la cesta: ponerlo en el suelo o encima de un mueble
  if(sel){ if(sel.z==='wall'){ toast('Eso va en la pared'); return; }
    const res=suIntento(R,sel,x,y);
    if(!res){ toast(suCelda(x,y)||h?'Ahí no cabe. ¡Busca un hueco verde!':'Toca el suelo'); return; }
    if(res.tipo==='encima'){ const o=R.suelo[res.i]; o.en=o.en||[]; o.en[res.j]=invSel; }
    else capaDe(R,sel)[res.r*10+res.a]=esAlf(sel)?invSel:{k:invSel};
    if(!--p.inv[invSel]){ delete p.inv[invSel]; invSel=null; } GD.fantasma=null;
    beep(760,0.07,'triangle'); save(); renderHouse(); return; }
  // sin nada elegido: abrir, devolver a la cesta o andar
  if(h){ if(h.top>=0){ const k2=h.o.en[h.top]; if(roomAbre(k2,p)) return; if(!mine){ roomAndar(x,y); return; }
      h.o.en[h.top]=null; p.inv[k2]=(p.inv[k2]||0)+1; beep(350,0.05); save(); renderHouse(); return; }
    if(roomAbre(h.o.k,p)) return; if(!mine){ roomAndar(x,y); return; }
    R.suelo[h.i]=null; [h.o.k].concat((h.o.en||[]).filter(Boolean)).forEach(k=>{ p.inv[k]=(p.inv[k]||0)+1; }); beep(350,0.05); save(); renderHouse(); return; }
  const cel=suCelda(x,y);
  if(mine&&cel){ const ai=suMapa(R.alf)[cel.i]; if(ai>=0){ const k=R.alf[ai]; R.alf[ai]=null; p.inv[k]=(p.inv[k]||0)+1; beep(350,0.05); save(); renderHouse(); return; } }
  roomAndar(x,y);
}
function renderRoomPanel(inv,p){
  const R=roomOf(p);
  if(!VISIT&&(R.ampliada===1||(R.aviso&&R.aviso.length))){ // aviso de la casa nueva, una sola vez
    const cuenta={}; (R.aviso||[]).forEach(k=>{ if(furn(k)) cuenta[k]=(cuenta[k]||0)+1; }); const fuera=Object.entries(cuenta).map(([k,n])=>(n>1?n+' × ':'')+'«'+furn(k).n+'»'), nueva=R.ampliada===1;
    R.ampliada=2; R.aviso=[]; save();
    const lista=fuera.length>1?fuera.slice(0,-1).join(', ')+' y '+fuera[fuera.length-1]:fuera[0];
    setTimeout(()=>say({face:'🏠',name:'¡Casa nueva!',text:(nueva?'¡Han ampliado tu casa! Ahora hay más sitio y los muebles grandes ocupan su espacio de verdad. ':'')+(fuera.length?`No todo cabía: ${lista} ${fuera.length>1?'están':'está'} en tu cesta. `:'')+(nueva?'Y ahora puedes poner el osito o la planta encima de la cama, la mesa o el sofá.':'')}),350); }
  inv.append(el('div','lbl','Mis muebles'));
  const ig=el('div','invgrid'); const keys=Object.keys(p.inv).filter(k=>k.startsWith('fu_')&&p.inv[k]>0);
  if(!keys.length) ig.append(el('div','counter','No tienes muebles. ¡Cómpralos en la tienda, en la sección «Para tu casa»!'));
  keys.forEach(k=>{ const f=furn(k); const b=el('button','invitem'+(invSel===k?' sel':'')); b.innerHTML=`${f.e||({rug:'🟠',table:'🟫',shelf:'📚',fishbowl:'🐠',garland:'🎏',board:'🖍️'}[f.draw])}<small>×${p.inv[k]}</small>`; b.title=f.n;
    b.onclick=()=>{ invSel=invSel===k?null:k; GD.girar=false; GD.fantasma=null; beep(600,0.04); renderHouse(); if(invSel) toast(`${f.n}: toca ${f.z==='wall'?'un hueco de la pared':muTam(f).sobre?'un hueco verde o un punto verde encima de un mueble':'un hueco verde'}`,2200); }; ig.append(b); });
  inv.append(ig);
  const gb=el('button','btn'+(GD.girar?' blue':''),GD.girar?'↔️ Toca un mueble para girarlo · Terminar':'↔️ Dar la vuelta a un mueble');
  gb.onclick=()=>{ GD.girar=!GD.girar; invSel=null; beep(600,0.04); renderHouse(); }; inv.append(gb);
  inv.append(el('div','lbl','🖌️ Color de la pared'));
  const wc=el('div','choice'); WALLCOLS.forEach(col=>{ const d=el('button','dot'+(R.wall===col?' sel':'')); d.style.background=col; d.onclick=()=>{ R.wall=col; save(); renderHouse(); }; wc.append(d); }); inv.append(wc);
  const opts=(list,cur,set,label)=>{ inv.append(el('div','lbl',label)); const row=el('div','choice');
    list.filter(o=>!o.paq||R.owned[o.k]).forEach(o=>{ const owned=R.owned[o.k], lock=o.m&&mLevel(p,o.m[0])<o.m[1]; // lo de los paquetes, solo si ya lo tiene
      const b=el('button',cur===o.k?'sel':'',owned?o.n:lock?`🔒 ${o.n}`:`${o.n} · 🔘${o.p}`);
      b.onclick=async()=>{ if(owned){ set(o.k); save(); renderHouse(); return; } if(lock){ toast(`Necesitas ${MAST[o.m[0]].n} nivel ${o.m[1]}`); return; }
        if(p.coins<o.p){ toast('No tienes botones suficientes'); return; }
        const r=await say({face:'🖌️',name:'Reforma',text:`¿Comprar «${o.n}» por ${o.p} botones?`,buttons:[{t:'No'},{t:'¡Sí!',cls:'primary'}],speak:false}); if(r!==1) return;
        p.coins-=o.p; R.owned[o.k]=1; set(o.k); save('Reforma: '+o.n); sfxBuy(); renderHouse(); };
      row.append(b); }); inv.append(row); };
  opts(WALLPATS,R.pat,v=>R.pat=v,'🧱 Papel de la pared');
  opts(FLOORS,R.floor,v=>R.floor=v,'🪵 Suelo');
  inv.append(el('div','help','<div>💡 Elige un mueble de tu cesta y toca un hueco verde del suelo o un hueco de la pared. Las cosas pequeñas (el osito, la planta…) se pueden poner encima de la cama, la mesa o el sofá. Si tocas algo ya colocado, vuelve a tu cesta. La pizarra, la pecera y el Belén se abren al tocarlos.</div>'));
}

$('#hv-garden').onclick=()=>{ houseView='garden'; invSel=null; renderHouse(); sizeGarden(); };
$('#hv-room').onclick=()=>{ houseView='room'; invSel=null; renderHouse(); sizeGarden(); };
