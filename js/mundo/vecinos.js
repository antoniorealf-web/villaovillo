"use strict";
/* =========================================================
   VECINOS (mismo estilo redondeado que la protagonista)
   ========================================================= */
function fillOl(c,col,w=2.4){ c.fillStyle=col; c.fill(); ol(c,w); }
function ell(c,x,y,rx,ry,col,w=2.4,rot=0){ c.beginPath(); c.ellipse(x,y,rx,ry,rot,0,Math.PI*2); fillOl(c,col,w); }
function eyesN(c,y,gap,blink,r=2.2,ex=1.2,col='#3a2a20'){
  for(const s of [-1,1]){
    if(blink){ c.strokeStyle=OUT; c.lineWidth=1.8; c.beginPath(); c.moveTo(s*gap+ex-2.2,y); c.quadraticCurveTo(s*gap+ex,y+1.4,s*gap+ex+2.2,y); c.stroke(); }
    else { c.fillStyle=col; c.beginPath(); c.ellipse(s*gap+ex,y,r,r*1.35,0,0,Math.PI*2); c.fill(); c.fillStyle='#fff'; c.beginPath(); c.arc(s*gap+ex+r*0.35,y-r*0.5,r*0.42,0,Math.PI*2); c.fill(); }
  }
}
function blushN(c,y,gap,ex=1.2){ c.fillStyle='rgba(255,120,130,.42)'; for(const s of [-1,1]){ c.beginPath(); c.ellipse(s*gap+ex,y,2.6,1.6,0,0,Math.PI*2); c.fill(); } }
function feetN(c,t,mv,col,gap=6,rx=4.2,ry=2.8){ const w=t*11; for(const [s,ph] of [[-1,0],[1,Math.PI]]){ const lift=mv?Math.max(0,Math.sin(w+ph))*3:0; ell(c,s*gap,-2-lift,rx,ry,col,2); } }
function smile(c,x,y,r=2){ c.strokeStyle=OUT; c.lineWidth=1.7; c.beginPath(); c.arc(x,y,r,0.15*Math.PI,0.85*Math.PI); c.stroke(); }

const NPC_DRAW={
  rosa(c,t,mv,b){ // oveja
    feetN(c,t,mv,'#5a4a42',6);
    const wool=[[-10,-14,9],[0,-11,9],[10,-14,9],[-12,-24,9],[12,-24,9],[-6,-31,8],[6,-31,8],[0,-21,10]];
    c.lineWidth=5; c.strokeStyle=OUT; wool.forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.stroke(); });
    c.fillStyle='#fffaf3'; wool.forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); });
    c.fillStyle='#ffffff'; c.beginPath(); c.arc(-4,-27,4,0,Math.PI*2); c.fill();
    for(const s of [-1,1]){ ell(c,s*12,-30,5.5,3,'#f6e1d3',2,s*0.5); }
    ell(c,0,-28,9,9.5,'#f6e1d3');
    [[-4,-37,4],[1,-39,4.5],[5,-36,3.5]].forEach(([x,y,r])=>ell(c,x,y,r,r,'#fffaf3',2));
    eyesN(c,-28,3.8,b,1.8,0.8); blushN(c,-24.5,6,0.8); smile(c,0.8,-24.5,1.6);
    c.save(); c.translate(7,-40); c.fillStyle='#e46fa8'; c.beginPath(); c.moveTo(0,0); c.lineTo(-5,-3.5); c.lineTo(-5,3.5); c.closePath(); c.moveTo(0,0); c.lineTo(5,-3.5); c.lineTo(5,3.5); c.closePath(); fillOl(c,'#e46fa8',1.6); c.restore();
  },
  tomas(c,t,mv,b){ // erizo
    feetN(c,t,mv,'#5a3a26',6,4,2.6);
    c.beginPath(); const N=14; for(let i=0;i<=N;i++){ const a=Math.PI*0.95+i/N*Math.PI*1.1; const r=i%2?16:21; const x=Math.cos(a)*r, y=-17+Math.sin(a)*r*0.95; if(i===0) c.moveTo(x,y); else c.lineTo(x,y); }
    c.lineTo(15,-8); c.lineTo(-15,-8); c.closePath(); fillOl(c,'#7a5236');
    ell(c,0,-14,13,11.5,'#f0d2a8');
    ell(c,0,-10.5,5,3.6,'#f7e2c4',2); c.fillStyle='#3a2a20'; c.beginPath(); c.arc(0,-12,1.9,0,Math.PI*2); c.fill();
    eyesN(c,-18,4.6,b,1.9,0); blushN(c,-13,8,0);
    c.fillStyle='#55b05a'; c.beginPath(); c.moveTo(-11,-6); c.quadraticCurveTo(0,-2,11,-6); c.lineTo(10,-3); c.quadraticCurveTo(0,1,-10,-3); c.closePath(); fillOl(c,'#55b05a',1.8);
  },
  coco(c,t,mv,b){ // gallina
    const w=t*11;
    for(const s of [-1,1]){ c.strokeStyle='#e8892a'; c.lineWidth=2.6; c.beginPath(); c.moveTo(s*4,-6); c.lineTo(s*4,-1-(mv?Math.max(0,Math.sin(w+(s>0?Math.PI:0)))*3:0)); c.stroke(); }
    [[-3,-36,3.4],[1,-38.5,3.8],[5,-36,3.2]].forEach(([x,y,r])=>ell(c,x,y,r,r,'#e4574f',1.8));
    ell(c,0,-18,14,15,'#fffdf8');
    const fl=mv?Math.sin(w*1.5)*0.35:0;
    for(const s of [-1,1]) ell(c,s*13,-17,4.5,7,'#f1ebe0',2,s*(0.3+fl));
    c.fillStyle='#8fd0f0'; c.beginPath(); c.moveTo(-9,-12); c.lineTo(9,-12); c.quadraticCurveTo(9,-4,0,-4); c.quadraticCurveTo(-9,-4,-9,-12); fillOl(c,'#8fd0f0',1.8);
    eyesN(c,-25,4.6,b,1.9,0.5);
    c.beginPath(); c.moveTo(-2.6,-22); c.lineTo(3.6,-22); c.lineTo(0.5,-17.5); c.closePath(); fillOl(c,'#f4c430',1.6);
    ell(c,0.5,-16,1.6,2.2,'#e4574f',1.4);
  },
  bruno(c,t,mv,b){ // oso panadero
    feetN(c,t,mv,'#7d5333',6.5,4.6,3);
    ell(c,0,-14,14,13,'#a9744a'); ell(c,0,-12,8.5,8,'#e8c9a0',2);
    for(const s of [-1,1]) ell(c,s*13,-16,4,5.5,'#a9744a',2,s*0.3);
    for(const s of [-1,1]){ ell(c,s*10,-42,4.8,4.8,'#a9744a'); ell(c,s*10,-42,2.4,2.4,'#e8c9a0',1.4); }
    ell(c,0,-32,13,12,'#b07b50');
    c.fillStyle='#fff'; c.beginPath(); c.rect(-8,-50,16,7); fillOl(c,'#fff',2);
    [[-6,-52,5.5],[0,-55,6.5],[6,-52,5.5]].forEach(([x,y,r])=>ell(c,x,y,r,r,'#fff',2));
    c.fillStyle='#fff'; c.fillRect(-7,-51,14,5);
    ell(c,0,-28,6,4.5,'#e8c9a0',2); ell(c,0,-30,2.4,1.7,'#3a2a20',1.2);
    eyesN(c,-34,5,b,2,0); blushN(c,-29,8.5,0); smile(c,0,-27.5,1.6);
  },
  lia(c,t,mv,b){ // nutria
    const w=t*11;
    c.save(); c.translate(-6,-6); c.rotate(mv?Math.sin(w)*0.15:Math.sin(t*2)*0.06); c.beginPath(); c.moveTo(0,-3); c.quadraticCurveTo(-12,-2,-17,4); c.quadraticCurveTo(-10,4,0,3); c.closePath(); fillOl(c,'#7a5236',2); c.restore();
    feetN(c,t,mv,'#6b4426',5,4,2.6);
    ell(c,0,-17,10,14.5,'#8b5e3c'); ell(c,0,-15,6.5,10.5,'#ecd3ad',2);
    for(const s of [-1,1]) ell(c,s*4,-24,2.8,2.4,'#8b5e3c',1.6);
    for(const s of [-1,1]) ell(c,s*8.5,-43,2.6,2.6,'#8b5e3c',1.6);
    ell(c,0,-36,11,9.5,'#8b5e3c'); ell(c,0,-32.5,7,5,'#ecd3ad',2);
    ell(c,0,-34.5,2.2,1.6,'#3a2a20',1.2);
    c.strokeStyle=OUT; c.lineWidth=1; for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*3,-33); c.lineTo(s*9,-34); c.moveTo(s*3,-32); c.lineTo(s*9,-31); c.stroke(); }
    eyesN(c,-38.5,4.6,b,1.9,0); smile(c,0,-31.6,1.3);
    c.save(); c.translate(-6,-45); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; ell(c,Math.cos(a)*2.4,Math.sin(a)*2.4,1.8,1.8,'#8fd0f0',1); } ell(c,0,0,1.3,1.3,'#f4c430',0.8); c.restore();
  },
  nube(c,t,mv,b){ // coneja
    const w=t*11, wig=mv?Math.sin(w)*0.12:Math.sin(t*1.6)*0.06;
    for(const s of [-1,1]){ c.save(); c.translate(s*5,-40); c.rotate(s*0.12+wig*s); ell(c,0,-10,4.4,11,'#f7f5ff'); ell(c,0,-10,2.2,7.5,'#f6b8c8',1.2); c.restore(); }
    ell(c,-11,-10,3.5,3.5,'#ffffff',2);
    feetN(c,t,mv,'#f7f5ff',6,5,3);
    ell(c,0,-14,12,12.5,'#f7f5ff');
    ell(c,0,-31,11.5,10.5,'#f7f5ff');
    eyesN(c,-33,4.6,b,2,0); blushN(c,-28.5,7.5,0);
    c.beginPath(); c.moveTo(-1.6,-30); c.lineTo(1.6,-30); c.lineTo(0,-28.4); c.closePath(); fillOl(c,'#f08aa5',1);
    c.strokeStyle=OUT; c.lineWidth=1.4; c.beginPath(); c.moveTo(0,-28.4); c.quadraticCurveTo(-1.5,-26.5,-3,-27.5); c.moveTo(0,-28.4); c.quadraticCurveTo(1.5,-26.5,3,-27.5); c.stroke();
  },
  hilo(c,t,mv,b){ // robot
    const f=Math.sin(t*3)*2;
    c.fillStyle=`rgba(120,200,255,${0.35+Math.sin(t*8)*0.15})`; c.beginPath(); c.ellipse(0,-4,7,3,0,0,Math.PI*2); c.fill();
    c.translate(0,-f);
    for(const s of [-1,1]) ell(c,s*14,-16,3.5,3.5,'#b9c6d6',2);
    const g=c.createLinearGradient(0,-26,0,-6); g.addColorStop(0,'#e6edf5'); g.addColorStop(1,'#b9c6d6');
    roundRect(c,-11,-26,22,19,6); fillOl(c,g);
    c.beginPath(); c.arc(0,-16.5,4,0,Math.PI*2); fillOl(c,'#e46fa8',1.6); c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=1; c.beginPath(); c.arc(0,-16.5,2.3,0.3,2.6); c.stroke();
    c.strokeStyle=OUT; c.lineWidth=2.4; c.beginPath(); c.moveTo(0,-47); c.lineTo(0,-54); c.stroke();
    ell(c,0,-56,3.6,3.6,'#f4c430',1.8);
    roundRect(c,-14,-47,28,21,8); fillOl(c,'#eef3f8');
    roundRect(c,-10.5,-43.5,21,14,5); fillOl(c,'#2c3e50',1.8);
    c.fillStyle='#7fe3ff';
    if(b){ c.fillRect(-7,-36.5,5,1.6); c.fillRect(2,-36.5,5,1.6); }
    else { c.beginPath(); c.arc(-4.5,-36.5,2.4,0,Math.PI*2); c.arc(4.5,-36.5,2.4,0,Math.PI*2); c.fill(); }
    c.strokeStyle='#7fe3ff'; c.lineWidth=1.4; c.beginPath(); c.arc(0,-33.5,2.2,0.15*Math.PI,0.85*Math.PI); c.stroke();
  },
  alcalde(c,t,mv,b){ // papá alcalde
    const w=t*11, la=mv?Math.sin(w)*0.5:0;
    for(const [s,a] of [[-1,la],[1,-la]]){ c.save(); c.translate(s*4.5,-15); c.rotate(a); c.strokeStyle=OUT; c.lineWidth=8.5; c.lineCap='round'; c.beginPath(); c.moveTo(0,0); c.lineTo(0,11); c.stroke(); c.strokeStyle='#3c3f55'; c.lineWidth=5.5; c.beginPath(); c.moveTo(0,0); c.lineTo(0,11); c.stroke(); ell(c,1.5,13,5,3,'#2c2c34',1.8); c.restore(); }
    for(const s of [-1,1]){ c.save(); c.translate(s*10,-31); c.rotate(s*(0.2)+(mv?-s*Math.sin(w)*0.4:0)); c.strokeStyle=OUT; c.lineWidth=8; c.beginPath(); c.moveTo(0,0); c.lineTo(0,12); c.stroke(); c.strokeStyle='#3b4a7a'; c.lineWidth=5; c.beginPath(); c.moveTo(0,0); c.lineTo(0,12); c.stroke(); ell(c,0,13.5,3.2,3.2,'#f5c8a0',1.6); c.restore(); }
    roundRect(c,-11,-36,22,23,6); fillOl(c,'#3b4a7a');
    c.fillStyle='#fff'; c.beginPath(); c.moveTo(-4,-36); c.lineTo(0,-28); c.lineTo(4,-36); c.closePath(); c.fill();
    c.fillStyle='#c0443d'; c.beginPath(); c.moveTo(0,-33); c.lineTo(-3.5,-35); c.lineTo(-3.5,-31); c.closePath(); c.moveTo(0,-33); c.lineTo(3.5,-35); c.lineTo(3.5,-31); c.closePath(); c.fill();
    c.save(); c.beginPath(); c.rect(-11,-36,22,23); c.clip(); c.strokeStyle='#f4c430'; c.lineWidth=4; c.beginPath(); c.moveTo(-11,-34); c.lineTo(11,-14); c.stroke(); c.strokeStyle='#e4574f'; c.lineWidth=1.6; c.beginPath(); c.moveTo(-11,-34); c.lineTo(11,-14); c.stroke(); c.restore();
    ell(c,0,-48,14.5,14,'#f5c8a0');
    c.fillStyle='#4a3424'; c.beginPath(); c.moveTo(-13,-44); c.quadraticCurveTo(-14,-32,0,-33); c.quadraticCurveTo(14,-32,13,-44); c.quadraticCurveTo(9,-38,5,-39); c.quadraticCurveTo(0,-37,-5,-39); c.quadraticCurveTo(-9,-38,-13,-44); fillOl(c,'#5a3d2a',2);
    eyesN(c,-48,5,b,2,0.8); blushN(c,-44,9,0.8);
    c.fillStyle='#5a3d2a'; c.beginPath(); c.ellipse(-2.5,-41.5,3.4,1.7,0.2,0,Math.PI*2); c.ellipse(3.5,-41.5,3.4,1.7,-0.2,0,Math.PI*2); c.fill();
    c.fillStyle='#4a3424'; c.beginPath(); c.moveTo(-14,-49); c.quadraticCurveTo(-14,-62,0,-61); c.quadraticCurveTo(14,-62,14,-49); c.quadraticCurveTo(8,-56,0,-55); c.quadraticCurveTo(-8,-56,-14,-49); fillOl(c,'#4a3424',2);
    roundRect(c,-14,-62,28,4,2); fillOl(c,'#2c2c34',2);
    roundRect(c,-9,-77,18,16,3); fillOl(c,'#2c2c34',2);
    c.fillStyle='#c0443d'; c.fillRect(-9,-66,18,3.5);
  },
  sabina(c,t,mv,b){ // lechuza bibliotecaria
    feetN(c,t,mv,'#e8892a',5,3.6,2.2);
    for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*7,-38); c.lineTo(s*12,-47); c.lineTo(s*13,-36); c.closePath(); fillOl(c,'#8a6440',2); }
    ell(c,0,-20,14,18,'#a07850');
    ell(c,0,-14,8.5,10,'#efdcb6',2);
    c.strokeStyle='#c4a274'; c.lineWidth=1.4; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(-3,-17+i*4); c.lineTo(0,-15+i*4); c.lineTo(3,-17+i*4); c.stroke(); }
    for(const s of [-1,1]) ell(c,s*13,-19,4,9,'#8a6440',2,s*0.2);
    for(const s of [-1,1]) ell(c,s*5.8,-30,6,6,'#fff6e0',2);
    if(b){ c.strokeStyle=OUT; c.lineWidth=1.8; for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*5.8-3,-30); c.lineTo(s*5.8+3,-30); c.stroke(); } }
    else for(const s of [-1,1]){ ell(c,s*5.8,-30,3.4,3.4,'#f4c430',1.2); c.fillStyle='#2a1c14'; c.beginPath(); c.arc(s*5.8,-30,1.9,0,Math.PI*2); c.fill(); c.fillStyle='#fff'; c.beginPath(); c.arc(s*5.8+0.8,-30.9,0.7,0,Math.PI*2); c.fill(); }
    c.strokeStyle='#4a3424'; c.lineWidth=1.6; for(const s of [-1,1]){ c.beginPath(); c.arc(s*5.8,-30,7.2,0,Math.PI*2); c.stroke(); } c.beginPath(); c.moveTo(-1.4,-30); c.lineTo(1.4,-30); c.stroke();
    c.beginPath(); c.moveTo(-2,-25.5); c.lineTo(2,-25.5); c.lineTo(0,-22); c.closePath(); fillOl(c,'#e8892a',1.4);
  }
};
const NPC_SCALE={rosa:1.15,tomas:1.1,coco:1.1,bruno:1.15,lia:1.15,nube:1.1,hilo:1.15,alcalde:1.3,sabina:1.15};
function blinkFor(k,t){ const off=(k.charCodeAt(0)*0.37)%3; return ((t+off)%3.4)>3.25; }
function drawNPCFig(c,k,x,y,o){
  const t=o.t||0, mv=!!o.moving;
  c.save(); c.translate(x,y); const sc=(o.sc||1)*(NPC_SCALE[k]||1); c.scale(sc,sc);
  c.fillStyle='rgba(60,40,20,.18)'; c.beginPath(); c.ellipse(0,1,13,4,0,0,Math.PI*2); c.fill();
  const bob=mv?Math.abs(Math.sin(t*11))*2.6:Math.sin(t*2.1+k.length)*0.6;
  c.translate(0,-bob); c.scale(o.dir||1,1);
  (NPC_DRAW[k]||NPC_DRAW.rosa)(c,t,mv,o.blink===undefined?blinkFor(k,t):o.blink);
  c.restore();
}
const EMO2NPC={'🐑':'rosa','🦔':'tomas','🐔':'coco','🐻':'bruno','🦦':'lia','🐰':'nube','🤖':'hilo','🧔':'alcalde','🦉':'sabina'};
function npcIcon(k,size=56){
  const cv=document.createElement('canvas'), dpr=window.devicePixelRatio||1; cv.width=size*dpr; cv.height=size*dpr; cv.style.width=size+'px'; cv.style.height=size+'px'; cv.className='npcicon';
  const c=cv.getContext('2d'); c.scale(dpr*size/80,dpr*size/80);
  const h={alcalde:80,hilo:60,bruno:60}[k]||52; const sc=Math.min(1.45,70/h);
  drawNPCFig(c,k,40,76,{t:0,sc:sc/(NPC_SCALE[k]||1),blink:false});
  return cv;
}
function faceEl(face,size){ const k=EMO2NPC[face]; if(k) return npcIcon(k,size); return el('div','dlgface',face); }

function fillWho(c){ c.querySelectorAll('.who[data-npc]').forEach(w=>{ w.innerHTML=''; w.append(npcIcon(w.dataset.npc,56)); }); }
