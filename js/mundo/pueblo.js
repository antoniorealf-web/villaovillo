"use strict";
/* =========================================================
   PUEBLO (canvas)
   ========================================================= */
const VW=2400, VH=1600;
let WW=2400, WH=1600, WY0=0; // tamaño del mundo: con la ampliación (js/mundo/ampliacion.js) es más ancho y empieza más arriba (WY0 < 0)
const vcanvas=$('#vcanvas'), vctx=vcanvas.getContext('2d');
let vScale=1, vOffX=0, vOffY=0, vDpr=1, rafId=null, lastT=0, tGlobal=0;
const player={x:600,y:548,tx:600,ty:548,moving:false,dir:1,act:null};
let npcs=[], tapFx=null, butterflies=[];

const B = { // edificios y zonas (coordenadas del mundo)
  taller:{x:760,y:230,w:330,h:260,door:[925,500]},
  tienda:{x:1340,y:270,w:240,h:190,door:[1460,472]},
  ayto:{x:1110,y:250,w:200,h:200,door:[1210,462]},
  tablon:{x:1250,y:505,w:58,h:98,door:[1279,618]},
  tend:{x:1640,y:300,w:220,h:120,door:[1750,446]},
  houseA:{x:300,y:560,w:210,h:170,door:[405,745]},
  plotA:{x:285,y:770,w:240,h:120},
  houseB:{x:300,y:990,w:210,h:170,door:[405,1175]},
  plotB:{x:285,y:1200,w:240,h:120},
  panaderia:{x:840,y:1120,w:240,h:180,door:[960,1312]},
  biblio:{x:1320,y:1120,w:240,h:180,door:[1440,1312]},
  plaza:{x:1200,y:820,r:140},
  huerto:{x:2020,y:260,w:300,h:400},
  lab:{x:2020,y:960,w:300,h:400}
};
const TREE_SPOTS=[[1010,660],[1390,660],[1010,980],[1390,980],[700,700],[700,960],[850,1020],[1550,1000],[1700,620],[1560,560],[1050,1500],[1350,1500],[200,1250],[180,700],[640,1080],[1760,1300],[1100,180],[1500,180],[820,160],[1250,1060],[1150,1060],[750,560],[1650,1150],[460,1460],[860,1450],[1550,700],[700,1230],[1700,1450],[1110,1210],[1290,1210]];

window.addEventListener('resize',()=>{ if(curScreen==='village') resizeVillage(); });


function startLoop(){ setupNPCs(); lastT=performance.now(); if(!rafId) rafId=requestAnimationFrame(loop); }
function stopLoop(){ if(rafId) cancelAnimationFrame(rafId); rafId=null; }
function loop(t){
  const dt=Math.min(0.05,(t-lastT)/1000); lastT=t; tGlobal+=dt;
  rafId=requestAnimationFrame(loop); // primero: si algo falla, el pueblo sigue moviéndose
  try{ update(dt); }catch(e){ apuntaFallo(e,'pueblo:mover'); }
  try{ drawVillage(); }catch(e){ apuntaFallo(e,'pueblo:dibujar'); }
}
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function inRect(x,y,r){ return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h; }

// --- cálculo de crecimiento
function seeded(i){ const x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); }

function drawFlower(c,x,y,col){ c.fillStyle=col; for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; c.beginPath(); c.arc(x+Math.cos(a)*4,y+Math.sin(a)*4,3.4,0,Math.PI*2); c.fill(); } c.fillStyle='#f2a93b'; c.beginPath(); c.arc(x,y,2.6,0,Math.PI*2); c.fill(); }
function drawTree(c,x,y,i){
  c.fillStyle='rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x,y+4,30,10,0,0,Math.PI*2); c.fill();
  c.fillStyle='#8a5a36'; c.fillRect(x-6,y-26,12,30);
  const g=['#4f9e45','#5bb04f','#68bd5a']; const sway=Math.sin(tGlobal*1.5+i)*1.5;
  c.fillStyle=g[0]; c.beginPath(); c.arc(x-16+sway,y-36,20,0,Math.PI*2); c.fill();
  c.fillStyle=g[1]; c.beginPath(); c.arc(x+16+sway,y-38,20,0,Math.PI*2); c.fill();
  c.fillStyle=g[2]; c.beginPath(); c.arc(x+sway,y-56,24,0,Math.PI*2); c.fill();
  if(i%3===0){ c.fillStyle=i%2?'#f29b38':'#e4574f'; for(let k=0;k<4;k++){ c.beginPath(); c.arc(x-14+k*9+sway,y-44+(k%2)*10,3.5,0,Math.PI*2); c.fill(); } }
}
function drawBuilding(c,b,wall,roof,label,big){
  c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(b.x+8,b.y+b.h-8,b.w,14);
  const roofH=b.h*0.38;
  c.fillStyle=wall; roundRect(c,b.x+12,b.y+roofH-6,b.w-24,b.h-roofH+6,10); c.fill();
  c.strokeStyle=shade(wall,-0.25); c.lineWidth=3; c.stroke();
  c.fillStyle=roof; c.beginPath(); c.moveTo(b.x,b.y+roofH+4); c.lineTo(b.x+b.w/2,b.y); c.lineTo(b.x+b.w,b.y+roofH+4); c.closePath(); c.fill();
  c.strokeStyle=shade(roof,-0.25); c.stroke();
  // puerta
  const dw=big?46:34, dh=big?62:48; c.fillStyle='#8a5a36'; roundRect(c,b.x+b.w/2-dw/2,b.y+b.h-dh,dw,dh,8); c.fill();
  c.fillStyle='#f4c430'; c.beginPath(); c.arc(b.x+b.w/2+dw/4,b.y+b.h-dh/2,3,0,Math.PI*2); c.fill();
  // ventanas
  c.fillStyle='#bfe3f2'; c.strokeStyle='#fff'; c.lineWidth=4;
  for(const wx of [b.x+30, b.x+b.w-30-40]){ roundRect(c,wx,b.y+roofH+18,40,34,6); c.fill(); c.stroke(); }
  // cartel
  c.font=`800 ${big?24:18}px 'Baloo 2',sans-serif`; const tw=c.measureText(label).width+22;
  c.fillStyle='#fffaf1'; roundRect(c,b.x+b.w/2-tw/2,b.y+roofH-22,tw,32,10); c.fill(); c.strokeStyle='#c9a978'; c.lineWidth=3; c.stroke();
  c.fillStyle='#5a3d22'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(label,b.x+b.w/2,b.y+roofH-5);
}
function drawHouse(c,b,color,label){ drawBuilding(c,b,shade(color,0.6),shade(color,-0.05),label,false); }
function drawShop(c,b){
  drawBuilding(c,b,'#f3e4c4','#8c63c9','🏪 TIENDA',false);
  // toldo a rayas
  const y=b.y+b.h*0.38+30; for(let i=0;i<8;i++){ c.fillStyle=i%2?'#fff':'#e4574f'; c.beginPath(); const x=b.x+16+i*(b.w-32)/8; c.moveTo(x,y); c.lineTo(x+(b.w-32)/8,y); c.lineTo(x+(b.w-32)/16,y+14); c.closePath(); c.fill(); }
}
function drawPlot(c,b,p){
  c.fillStyle='#8b5e3c'; roundRect(c,b.x,b.y,b.w,b.h,10); c.fill();
  c.strokeStyle='#d7b98c'; c.lineWidth=5; c.stroke();
  const rows=p?p.gardenRows:4, cw=(b.w-10)/8, ch=(b.h-10)/rows, fs=Math.min(cw,ch);
  c.fillStyle='#a8754e';
  for(let i=0;i<8*rows;i++){ const x=b.x+5+(i%8)*cw, y=b.y+5+Math.floor(i/8)*ch; roundRect(c,x+1,y+1,cw-2,ch-2,4); c.fill(); }
  if(!p) return;
  c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#000';
  p.garden.forEach((cell,i)=>{ if(!cell) return; const [em,fr]=cellEmoji(cell); const x=b.x+5+(i%8)*cw+cw/2, y=b.y+5+Math.floor(i/8)*ch+ch/2;
    c.font=`${fs*0.9}px serif`; c.fillText(em,x,y+1); if(fr){ c.font=`${fs*0.45}px serif`; c.fillText(fr,x+cw*0.28,y+ch*0.25); } });
  if(p===P() && needsWater(p)){ const bob=Math.sin(tGlobal*4)*4; c.fillStyle='#fffaf1'; c.beginPath(); c.arc(b.x+b.w-6,b.y-14+bob,17,0,Math.PI*2); c.fill(); c.strokeStyle='#4a8fdc'; c.lineWidth=3; c.stroke(); c.fillStyle='#000'; c.font='20px serif'; c.fillText('💧',b.x+b.w-6,b.y-13+bob); }
  // valla
  c.strokeStyle='#f6ead2'; c.lineWidth=3; for(let x=b.x;x<=b.x+b.w;x+=14){ c.beginPath(); c.moveTo(x,b.y+b.h-2); c.lineTo(x,b.y+b.h+10); c.stroke(); }
}
function drawTablon(c,b){
  c.fillStyle='#7d5333'; c.fillRect(b.x+6,b.y+40,7,b.h-40); c.fillRect(b.x+b.w-13,b.y+40,7,b.h-40);
  c.fillStyle='#c98f5a'; roundRect(c,b.x-14,b.y,b.w+28,62,6); c.fill(); c.strokeStyle='#7d5333'; c.lineWidth=4; c.stroke();
  const n=Math.min(4,taskCount());
  ['#fff8c4','#ffd8e4','#d8ecff','#e2f7d8'].forEach((col,i)=>{ c.fillStyle=col; c.fillRect(b.x-8+i*21,b.y+8+(i%2)*10,17,22); c.fillStyle='#e4574f'; c.beginPath(); c.arc(b.x+0.5+i*21,b.y+10+(i%2)*10,2.5,0,Math.PI*2); c.fill(); });
  c.font="800 13px 'Baloo 2',sans-serif"; c.fillStyle='#5a3d22'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('TABLÓN',b.x+b.w/2,b.y+52);
  if(n){ c.fillStyle='#fffaf1'; c.beginPath(); c.arc(b.x+b.w+12,b.y-6,13,0,Math.PI*2); c.fill(); c.strokeStyle='#f2b632'; c.lineWidth=3; c.stroke(); c.fillStyle='#e4574f'; c.font="800 16px 'Baloo 2',sans-serif"; c.fillText(String(n),b.x+b.w+12,b.y-5); }
}
function drawFountain(c,x,y){
  c.fillStyle='#b7c3cc'; c.beginPath(); c.ellipse(x,y+6,46,22,0,0,Math.PI*2); c.fill();
  c.fillStyle='#7fc6ee'; c.beginPath(); c.ellipse(x,y+4,38,16,0,0,Math.PI*2); c.fill();
  c.fillStyle='#b7c3cc'; c.fillRect(x-6,y-30,12,34);
  for(let k=0;k<6;k++){ const a=tGlobal*2+k; c.fillStyle='rgba(255,255,255,.8)'; c.beginPath(); c.arc(x+Math.cos(k)*20*((a%1)), y-30+((a*40)%30), 2.5,0,Math.PI*2); c.fill(); }
}
function drawWell(c,x,y){ c.fillStyle='#b7a58a'; c.beginPath(); c.ellipse(x,y,26,14,0,0,Math.PI*2); c.fill(); c.fillStyle='#4e7aa0'; c.beginPath(); c.ellipse(x,y-2,18,8,0,0,Math.PI*2); c.fill(); c.strokeStyle='#8a5a36'; c.lineWidth=4; c.beginPath(); c.moveTo(x-22,y); c.lineTo(x-22,y-36); c.lineTo(x+22,y-36); c.lineTo(x+22,y); c.stroke(); }
function drawLamp(c,x,y){ c.fillStyle='#5a4a3a'; c.fillRect(x-3,y-46,6,46); c.fillStyle=`rgba(255,220,120,${0.7+Math.sin(tGlobal*3+x)*0.2})`; c.beginPath(); c.arc(x,y-52,9,0,Math.PI*2); c.fill(); }
function drawBunting(c){
  const pts=[[480,330],[600,300],[720,330]];
  c.strokeStyle='#8a5a36'; c.lineWidth=2; c.beginPath(); c.moveTo(...pts[0]); c.quadraticCurveTo(...pts[1],...pts[2]); c.stroke();
  const cols=Object.values(COLORS).map(o=>o.c);
  for(let i=0;i<12;i++){ const t=(i+0.5)/12; const x=(1-t)*(1-t)*pts[0][0]+2*(1-t)*t*pts[1][0]+t*t*pts[2][0], y=(1-t)*(1-t)*pts[0][1]+2*(1-t)*t*pts[1][1]+t*t*pts[2][1];
    c.fillStyle=cols[i%cols.length]; c.beginPath(); c.moveTo(x-7,y); c.lineTo(x+7,y); c.lineTo(x,y+14); c.closePath(); c.fill(); }
}
function drawLockedZone(c,x,y,w,h,icon,label,req){
  c.fillStyle='rgba(255,255,255,.25)'; roundRect(c,x,y,w,h,14); c.fill();
  c.strokeStyle='#a8754a'; c.lineWidth=4; c.setLineDash([10,8]); roundRect(c,x,y,w,h,14); c.stroke(); c.setLineDash([]);
  c.fillStyle='#000'; c.font='54px serif'; c.textAlign='center'; c.textBaseline='middle'; c.globalAlpha=.55; c.fillText(icon,x+w/2,y+h/2-30); c.globalAlpha=1;
  c.font='30px serif'; c.fillText('🔒',x+w/2,y+h/2+22);
  c.font="800 17px 'Baloo 2',sans-serif"; c.fillStyle='#5a3d22'; c.fillText(label,x+w/2,y+h/2+58); c.font="600 14px 'Baloo 2',sans-serif"; c.fillText(req||'Próximamente',x+w/2,y+h/2+78);
}
function drawTendedero(c,p){
  const x1=770,x2=950,y=120;
  c.strokeStyle='#8a5a36'; c.lineWidth=6; c.beginPath(); c.moveTo(x1,y+90); c.lineTo(x1,y-10); c.moveTo(x2,y+90); c.lineTo(x2,y-10); c.stroke();
  c.strokeStyle='#d9c7a6'; c.lineWidth=2; c.beginPath(); c.moveTo(x1,y); c.quadraticCurveTo((x1+x2)/2,y+16,x2,y); c.stroke();
  const fabs=(p.fabrics||[]).slice(-4);
  if(!fabs.length){ c.font="600 14px 'Baloo 2',sans-serif"; c.fillStyle='#5a3d22'; c.textAlign='center'; c.fillText('Tendedero',(x1+x2)/2,y+60); return; }
  fabs.forEach((f,i)=>{
    const fx=x1+14+i*42, fy=y+6+Math.sin((i+0.5)/4*Math.PI)*8, s=Math.max(3,Math.min(6,36/f.w));
    const rows=Math.ceil(f.cells.length/f.w), sway=Math.sin(tGlobal*2+i)*1.5;
    c.save(); c.translate(fx+sway,fy);
    c.fillStyle='#efe3cc'; c.fillRect(-1,0,f.w*s+2,rows*s+2);
    f.cells.forEach((k,j)=>{ if(!k||!COLORS[k]) return; c.fillStyle=COLORS[k].c; c.fillRect((j%f.w)*s,Math.floor(j/f.w)*s+1,s-0.5,s-0.5); });
    c.fillStyle='#c0443d'; c.fillRect(2,-3,3,6); c.fillRect(f.w*s-5,-3,3,6);
    c.restore();
  });
}
function drawGirl(c,x,y,color,walk,sc=1){
  c.save(); c.translate(x,y); c.scale(sc,sc);
  c.fillStyle='rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0,2,16,6,0,0,Math.PI*2); c.fill();
  const lg=Math.sin(walk)*5;
  c.strokeStyle='#6b4a32'; c.lineWidth=4; c.lineCap='round';
  c.beginPath(); c.moveTo(-5,-10); c.lineTo(-5-lg/2,0); c.moveTo(5,-10); c.lineTo(5+lg/2,0); c.stroke();
  c.fillStyle=color; c.beginPath(); c.moveTo(-14,-10); c.lineTo(14,-10); c.lineTo(8,-34); c.lineTo(-8,-34); c.closePath(); c.fill();
  c.fillStyle='#f2c9a0'; c.beginPath(); c.arc(0,-44,12,0,Math.PI*2); c.fill();
  c.fillStyle='#6b4226'; c.beginPath(); c.arc(0,-47,12.5,Math.PI,Math.PI*2); c.fill();
  c.beginPath(); c.arc(-11,-40,5,0,Math.PI*2); c.arc(11,-40,5,0,Math.PI*2); c.fill();
  c.fillStyle='#3a2a1c'; c.beginPath(); c.arc(-4,-43,1.8,0,Math.PI*2); c.arc(4,-43,1.8,0,Math.PI*2); c.fill();
  c.fillStyle='#e88f8f'; c.beginPath(); c.arc(-7,-39,2.2,0,Math.PI*2); c.arc(7,-39,2.2,0,Math.PI*2); c.fill();
  c.restore();
}
function drawPlayer(c){
  if(VISIT) return drawMayorPlayer(c);
  const p=P();
  const hopY = player.hop>0 ? Math.sin((0.32-player.hop)/0.32*Math.PI)*7 : 0;
  drawDust(c);
  drawHero(c,player.x,player.y,{look:lookOf(p),t:tGlobal,moving:player.moving,dir:player.dir,sc:1.45,blink:player.blinkT<0,wave:player.waving,hop:hopY});
  c.font="800 16px 'Baloo 2',sans-serif"; c.textAlign='center'; c.textBaseline='middle';
  const tw=c.measureText(p.name).width+14; c.fillStyle='rgba(255,250,241,.9)'; roundRect(c,player.x-tw/2,player.y-122,tw,22,8); c.fill();
  c.fillStyle='#5a3d22'; c.fillText(p.name,player.x,player.y-111);
}
function drawNPC(c,n){
  const moving=Math.hypot(n.tx-n.x,n.ty-n.y)>3;
  drawNPCFig(c,n.k,n.x,n.y,{t:tGlobal+(n.home[0]%7)*0.37,moving,dir:n.dir||1,sc:1.3});
  const top=(n.k==='alcalde'?-100:n.k==='hilo'?-74:-66)*1.3;
  if(n.k==='alcalde'){ c.font="800 13px 'Baloo 2',sans-serif"; c.fillStyle='#5a3d22'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('Alcalde',n.x,n.y+14); }
  if(hasEncargo(n.k)){ const by=n.y+top+Math.sin(tGlobal*4)*2; c.fillStyle='#fffaf1'; c.beginPath(); c.arc(n.x+16,by,11,0,Math.PI*2); c.fill(); c.strokeStyle='#f2b632'; c.lineWidth=3; c.stroke(); c.fillStyle='#e4574f'; c.font="800 16px 'Baloo 2',sans-serif"; c.textAlign='center'; c.textBaseline='middle'; c.fillText('!',n.x+16,by+1); }
}
function hasEncargo(k){ if(VISIT){ if(k==='alcalde') return false; return DB.profiles.filter(Boolean).some(p=>encargoDe(p,k)); } // en el paseo: si alguna de las dos tiene uno
  const p=P(); if(k==='alcalde') return mailCount()+taskCount()>0; return encargoDe(p,k); }
function encargoDe(p,k){ if(!p||!p.daily) return false; return p.daily.list.some(x=>!p.daily.done[x.id] && (encOf(p,x.id)||{}).npc===k); }

// --- toques en el pueblo
vcanvas.addEventListener('pointerdown',ev=>{
  const r=vcanvas.getBoundingClientRect(); handleWorldTap(cam.x+(ev.clientX-r.left)/vScale, cam.y+(ev.clientY-r.top)/vScale);
});
async function talkNPC(n){
  npcVoice(n.k);
  const info=NPCS[n.k]; const p=P();
  if(n.k==='lia'&&!bridgeDone()) return openBridge();
  if(n.k==='alcalde'){
    const tc=taskCount(); if(tc&&!mailCount()){ const r2=await say({face:'🧔',name:info.n,text:`¡Hola, ${p.name}! Hay ${tc===1?'una tarea nueva':tc+' tareas'} en el tablón.`,buttons:[{t:'Luego'},{t:'📌 Ver tablón',cls:'primary'}]}); if(r2===1) openBoard(); return; }
    const c=mailCount();
    const r=await say({face:'🧔',name:info.n,text:c?`¡Hola, ${p.name}! Tienes ${c===1?'algo nuevo':c+' cosas nuevas'} en tu buzón. ¡Mira la banderita!`:pick(info.hi),buttons:c?[{t:'Luego'},{t:'📬 Ir al buzón',cls:'primary'}]:[{t:'¡Adiós, papá!',cls:'primary'}]});
    if(c&&r===1){ const [bx,by]=buzonPos(DB.cur===0?'A':'B'); andarA(player,bx-34,by+10); player.act=openMail; } return; // se va andando hasta su buzón
  }
  let text=pick(info.hi);
  if(hasEncargo(n.k)) text='¡Hola, '+p.name+'! Tengo un encargo para ti en el taller. ¿Vamos?';
  const r=await say({face:info.e,name:info.n,text,buttons:hasEncargo(n.k)?[{t:'Luego'},{t:'¡Al taller!',cls:'primary'}]:[{t:'¡Adiós!',cls:'primary'}]});
  if(hasEncargo(n.k)&&r===1){ andarA(player,B.taller.door[0],B.taller.door[1]); player.act=openWorkshop; }
}
async function visitOther(){
  const oi=DB.cur===0?1:0, o=DB.profiles[oi];
  if(!o){ say({face:'🏚️',name:'Casa vacía',text:'Esta casa espera a una nueva vecina. Se puede crear otra jugadora desde la pantalla de inicio.'}); return; }
  const r=await say({face:'🏡',name:'Casa de '+o.name,text:`Es la casa de ${o.name}. ¿Quieres ver su jardín?`,buttons:[{t:'No'},{t:'Ver jardín',cls:'primary'}]});
  if(r===1) openHouse(oi);
}

// --- HUD
function updateHUD(){
  const p=P();
  $('#hud-name').innerHTML=`<span class="dot" style="width:22px;height:22px;background:${p.color};flex-shrink:0"></span><span class="nm">${esc(p.name)}</span>${Object.entries(MAST).map(([a,M])=>`<span class="mbadge" title="${M.n}: ${mTitle(p,a)}">${M.e}${mLevel(p,a)}</span>`).join('')}`;
  if(p.daily){ const nd=p.daily.list.filter(x=>p.daily.done[x.id]).length; const hasR=cuadernosFor(p).length>0; $('#hud-daily').innerHTML=`Hoy: 🧶 ${nd}/${p.daily.list.length} · 🥐 ${p.daily.math?'✅':'○'}${hasR?` · 🦉 ${p.daily.read?'✅':'○'}`:''} · 🔥 ${p.days.streak||0}`; }
  $('#hud-coins').textContent='🔘 '+p.coins;
  $('#hb-voz').textContent=p.voice?'🔊':'🔇';
  renderBracelet($('#hud-bracelet'),p);
  const mc=mailCount(); const bd=$('#mail-badge'); bd.style.display=mc?'flex':'none'; bd.textContent=mc;
}
function renderBracelet(box,p){
  box.innerHTML='<span style="font-size:15px;margin-right:6px">Mi pulsera</span>';
  if(!p.beads.length){ box.innerHTML+='<span style="font-size:15px;color:#b4a58e">¡Consigue tu primera cuenta!</span>'; return; }
  const MAXB=36; if(p.beads.length>MAXB) box.append(el('span','charm',`+${p.beads.length-MAXB}`));
  p.beads.slice(-MAXB).forEach(b=>{ if(b.startsWith('c:')) box.append(el('span','charm',b.slice(2))); else { const d=el('span','bead'); d.style.background=COLORS[b]?COLORS[b].c:b; box.append(d); } });
}
$('#hb-taller').onclick=()=>openWorkshop();
$('#hb-casa').onclick=()=>openHouse(DB.cur);
$('#hb-libro').onclick=()=>openBook('historias');
$('#hb-mail').onclick=()=>openMail();
$('#hb-voz').onclick=()=>{ const p=P(); p.voice=!p.voice; save(); updateHUD(); toast(p.voice?'🔊 La voz leerá los textos':'🔇 Voz apagada (puedes usar los botones 🔊)'); if(p.voice) speakNow('Voz encendida'); };
$('#hb-perfil').onclick=()=>{ renderProfiles(); show('profiles'); };
