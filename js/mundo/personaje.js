"use strict";
/* =========================================================
   PERSONAJE PRINCIPAL (estilo redondeado, animado)
   ========================================================= */
const HAIR_COLORS=[['#6b4226','Castaño'],['#3a2a22','Moreno'],['#e8b94a','Rubio'],['#c0532b','Pelirrojo'],['#9a6a3f','Castaño claro']];
const HAIR_STYLES=[['coletas','Coletas'],['melena','Melena'],['mono','Moño'],['corto','Corto']];
const SKINS=['#ffdcc0','#f5c8a0','#d9a173','#a8714a'];
function lookOf(p){ return Object.assign({hair:'#6b4226',style:'coletas',skin:'#ffdcc0'},p.look||{},{dress:p.color}); }
const OUT='#4a3424';
function ol(c,w=2.4){ c.lineWidth=w; c.strokeStyle=OUT; c.lineJoin='round'; c.lineCap='round'; c.stroke(); }
/* o: {look, t, moving, dir, sc, blink, wave, hop} — pies en (x,y) */
function drawHero(c,x,y,o){
  const L=o.look, t=o.t||0, mv=o.moving, w=t*11;
  const bob = mv ? Math.abs(Math.sin(w))*3.2 : Math.sin(t*2.2)*0.7;
  const hop = o.hop||0;
  c.save(); c.translate(x,y); c.scale(o.sc||1,o.sc||1);
  // sombra
  const sh=1-Math.min(0.4,(bob+hop)/20);
  c.fillStyle='rgba(60,40,20,.18)'; c.beginPath(); c.ellipse(0,1,14*sh,4.5*sh,0,0,Math.PI*2); c.fill();
  c.translate(0,-bob-hop);
  c.scale(o.dir||1,1);
  if(mv) c.rotate(0.06);
  const sw1=Math.sin(w), liftL=mv?Math.max(0,sw1)*4.5:0, liftR=mv?Math.max(0,-sw1)*4.5:0;
  const armL = mv ? 0.15+0.4*Math.max(0,-sw1) : 0.22+Math.sin(t*2.2)*0.04;
  const armR = mv ? 0.15+0.4*Math.max(0,sw1) : 0.22+Math.sin(t*2.2)*0.04;
  const skin=L.skin, dress=L.dress, dressD=shade(dress,-0.22), hair=L.hair, hairD=shade(hair,-0.25);
  // ---- pelo de atrás
  c.fillStyle=hair;
  if(L.style==='melena'){ c.beginPath(); c.moveTo(-16,-52); c.quadraticCurveTo(-19,-34,-14,-27); c.lineTo(14,-27); c.quadraticCurveTo(19,-34,16,-52); c.closePath(); c.fill(); ol(c); }
  if(L.style==='corto'){ c.beginPath(); c.moveTo(-16,-52); c.quadraticCurveTo(-18,-40,-13,-36); c.lineTo(13,-36); c.quadraticCurveTo(18,-40,16,-52); c.closePath(); c.fill(); ol(c); }
  // ---- brazo de atrás
  const arm=(sx,ang,front)=>{
    c.save(); c.translate(sx,-31); c.rotate(ang);
    c.strokeStyle=OUT; c.lineWidth=7.5; c.lineCap='round'; c.beginPath(); c.moveTo(0,0); c.lineTo(0,12); c.stroke();
    c.strokeStyle=front?skin:shade(skin,-0.08); c.lineWidth=4.6; c.beginPath(); c.moveTo(0,0); c.lineTo(0,12); c.stroke();
    c.fillStyle=front?skin:shade(skin,-0.08); c.beginPath(); c.arc(0,13,3.3,0,Math.PI*2); c.fill(); ol(c,1.8);
    c.restore();
  };
  /* Los brazos van girados respecto a la cabeza; las piernas y los pies apuntan hacia donde se anda. */
  c.save(); c.scale(-1,1); arm(-9, armL, false); c.restore(); // brazos girados respecto a la cabeza; piernas y pies sin girar
  // ---- piernas y zapatos
  const leg=(sx,lift)=>{
    c.save(); c.translate(sx,-15-lift);
    c.strokeStyle=OUT; c.lineWidth=8; c.lineCap='round'; c.beginPath(); c.moveTo(0,0); c.lineTo(0,11); c.stroke();
    c.strokeStyle='#ffffff'; c.lineWidth=5; c.beginPath(); c.moveTo(0,0); c.lineTo(0,11); c.stroke();
    c.fillStyle=shade(dress,-0.35); c.beginPath(); c.ellipse(1.5,13,5,3.3,0,0,Math.PI*2); c.fill(); ol(c,1.8);
    c.restore();
  };
  leg(-4.5,liftL); leg(4.5,liftR);
  // ---- vestido
  const g=c.createLinearGradient(0,-36,0,-12); g.addColorStop(0,shade(dress,0.12)); g.addColorStop(1,dressD);
  c.fillStyle=g; c.beginPath();
  c.moveTo(-8,-35); c.quadraticCurveTo(0,-38,8,-35);
  c.quadraticCurveTo(13,-24,16,-15);
  for(let i=0;i<4;i++){ const x0=16-i*8; c.quadraticCurveTo(x0-4,-11,x0-8,-15); }
  c.quadraticCurveTo(-13,-24,-8,-35); c.closePath(); c.fill(); ol(c);
  // cuello blanco y corazón
  c.fillStyle='#fff'; c.beginPath(); c.moveTo(-6,-35); c.quadraticCurveTo(-3,-29,0,-32); c.quadraticCurveTo(3,-29,6,-35); c.quadraticCurveTo(0,-37,-6,-35); c.fill(); ol(c,1.6);
  c.fillStyle='#fff'; c.globalAlpha=.85; c.beginPath(); const hx=0,hy=-23; c.moveTo(hx,hy+3); c.bezierCurveTo(hx-5,hy-1,hx-2,hy-5,hx,hy-2); c.bezierCurveTo(hx+2,hy-5,hx+5,hy-1,hx,hy+3); c.fill(); c.globalAlpha=1;
  // ---- brazo de delante (saluda a veces)
  c.save(); if(!o.wave) c.scale(-1,1); arm(9, o.wave ? -2.15+Math.sin(t*14)*0.3 : -armR, true); c.restore();
  // ---- coletas / moño (detrás de la cabeza en parte)
  const sw=mv?Math.sin(w)*2.2:Math.sin(t*2)*0.6;
  if(L.style==='coletas'){ for(const s of [-1,1]){ c.fillStyle=hair; c.beginPath(); c.ellipse(s*18+sw*0.3,-44+Math.abs(sw)*0.4,6,8,s*0.35,0,Math.PI*2); c.fill(); ol(c); c.fillStyle=dress; c.beginPath(); c.arc(s*14.5,-50,2.6,0,Math.PI*2); c.fill(); ol(c,1.5); } }
  if(L.style==='mono'){ c.fillStyle=hair; c.beginPath(); c.arc(0,-66,7.5,0,Math.PI*2); c.fill(); ol(c); }
  // ---- cabeza
  const hg=c.createRadialGradient(-4,-53,3,0,-48,18); hg.addColorStop(0,shade(skin,0.12)); hg.addColorStop(1,shade(skin,-0.05));
  c.fillStyle=hg; c.beginPath(); c.ellipse(0,-48,16,15.2,0,0,Math.PI*2); c.fill(); ol(c);
  // ---- flequillo
  c.fillStyle=hair; c.beginPath();
  c.moveTo(-16.2,-47);
  c.bezierCurveTo(-17,-66,17,-66,16.2,-47);
  c.quadraticCurveTo(13,-52,10,-50); c.quadraticCurveTo(7,-54,3,-51); c.quadraticCurveTo(-1,-55,-5,-51); c.quadraticCurveTo(-9,-54,-12,-50); c.quadraticCurveTo(-14,-52,-16.2,-47);
  c.closePath(); c.fill(); ol(c);
  c.strokeStyle=shade(hair,0.35); c.lineWidth=2; c.globalAlpha=.6; c.beginPath(); c.arc(-4,-57,6,Math.PI*1.1,Math.PI*1.6); c.stroke(); c.globalAlpha=1;
  // ---- cara
  const ex=1.6;
  if(o.blink){ c.strokeStyle=OUT; c.lineWidth=2; for(const s of [-1,1]){ c.beginPath(); c.moveTo(s*5.5+ex-2.4,-46); c.quadraticCurveTo(s*5.5+ex,-44.5,s*5.5+ex+2.4,-46); c.stroke(); } }
  else for(const s of [-1,1]){ c.fillStyle='#3a2a20'; c.beginPath(); c.ellipse(s*5.5+ex,-46.5,2.5,3.5,0,0,Math.PI*2); c.fill(); c.fillStyle='#fff'; c.beginPath(); c.arc(s*5.5+ex+0.9,-47.8,1.05,0,Math.PI*2); c.fill(); }
  c.fillStyle='rgba(255,120,130,.45)'; for(const s of [-1,1]){ c.beginPath(); c.ellipse(s*9.5+ex,-41.5,3,1.9,0,0,Math.PI*2); c.fill(); }
  c.strokeStyle=OUT; c.lineWidth=1.8;
  if(mv||o.wave){ c.fillStyle='#c0443d'; c.beginPath(); c.ellipse(ex,-40.5,1.8,1.5,0,0,Math.PI*2); c.fill(); }
  else { c.beginPath(); c.arc(ex,-42,2.3,0.2*Math.PI,0.8*Math.PI); c.stroke(); }
  // ---- lazo
  if(L.style!=='mono'){ c.save(); c.translate(9,-61); c.rotate(0.35); c.fillStyle=dress; c.beginPath(); c.moveTo(0,0); c.lineTo(-6,-4); c.lineTo(-6,4); c.closePath(); c.moveTo(0,0); c.lineTo(6,-4); c.lineTo(6,4); c.closePath(); c.fill(); ol(c,1.6); c.beginPath(); c.arc(0,0,2,0,Math.PI*2); c.fill(); ol(c,1.4); c.restore(); }
  adorna(c,'nina',{L}); // ropa de temporada (paquetes)
  c.restore();
}
/* partículas de polvo al andar */
let dust=[];
function heroStep(dt){
  if(player.moving){ player.dustT=(player.dustT||0)+dt; if(player.dustT>0.16){ player.dustT=0; dust.push({x:player.x-player.dir*6+(Math.random()-0.5)*6,y:player.y,t:0}); } player.idle=0; }
  else { player.idle=(player.idle||0)+dt; }
  dust.forEach(d=>d.t+=dt); dust=dust.filter(d=>d.t<0.5);
  if(player.hop>0) player.hop=Math.max(0,player.hop-dt);
  player.blinkT=(player.blinkT===undefined?2+Math.random()*3:player.blinkT)-dt;
  if(player.blinkT<-0.13) player.blinkT=2.5+Math.random()*3;
  if(!player.moving && player.idle>7 && player.idle<8.6) player.waving=true; else player.waving=false;
  if(player.idle>12) player.idle=0;
}
function drawDust(c){ dust.forEach(d=>{ const a=1-d.t/0.5; c.fillStyle=`rgba(255,250,235,${0.7*a})`; c.beginPath(); c.arc(d.x,d.y-2-d.t*10,3+d.t*10,0,Math.PI*2); c.fill(); }); }
function heroCanvas(look,size,opts={}){
  const cv=document.createElement('canvas'), dpr=window.devicePixelRatio||1; cv.width=size*dpr; cv.height=size*dpr; cv.style.width=size+'px'; cv.style.height=size+'px';
  const c=cv.getContext('2d'); c.scale(dpr*size/80,dpr*size/80); drawHero(c,40,76,Object.assign({look,t:0,sc:1.05,dir:1},opts)); return cv;
}
async function editLook(){
  const p=P(); const L=lookOf(p); let look={hair:L.hair,style:L.style,skin:L.skin}, dress=p.color;
  const pr=say({center:true,face:'👗',name:'Mi aspecto',speak:false,html:`<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center">
    <canvas id="lk-prev" width="160" height="160" style="width:160px;height:160px;background:#eaf7e4;border-radius:20px"></canvas>
    <div style="flex:1;min-width:240px"><div class="lbl">Peinado</div><div class="choice" id="lk-style"></div>
    <div class="lbl">Color de pelo</div><div class="choice" id="lk-hair"></div>
    <div class="lbl">Piel</div><div class="choice" id="lk-skin"></div>
    <div class="lbl">Vestido</div><div class="choice" id="lk-dress"></div></div></div>`,buttons:[{t:'Cancelar'},{t:'¡Guardar!',cls:'primary'}]});
  const dots=(id,list,get,set,isColor)=>{ const box=$(id); box.innerHTML=''; list.forEach(([v,n])=>{ const b=el('button',isColor?'dot':'',isColor?'':n); if(isColor){ b.style.background=v; b.title=n||''; } if(get()===v) b.classList.add('sel'); b.onclick=()=>{ set(v); dots(id,list,get,set,isColor); }; box.append(b); }); };
  dots('#lk-style',HAIR_STYLES,()=>look.style,v=>look.style=v,false);
  dots('#lk-hair',HAIR_COLORS,()=>look.hair,v=>look.hair=v,true);
  dots('#lk-skin',SKINS.map(s=>[s,'']),()=>look.skin,v=>look.skin=v,true);
  dots('#lk-dress',DRESS.map(s=>[s,'']),()=>dress,v=>dress=v,true);
  const cv=$('#lk-prev'), cx=cv.getContext('2d'); const dpr=window.devicePixelRatio||1; cv.width=160*dpr; cv.height=160*dpr; let t0=performance.now();
  const loop=()=>{ if(!document.body.contains(cv)) return; const t=(performance.now()-t0)/1000; cx.setTransform(dpr,0,0,dpr,0,0); cx.clearRect(0,0,160,160); drawHero(cx,80,150,{look:Object.assign({},look,{dress}),t,sc:1.9,dir:1,blink:(t%3.2)>3.05,wave:(t%5)>3.8}); requestAnimationFrame(loop); };
  loop();
  const r=await pr;
  if(r===1){ p.look=look; p.color=dress; save('Cambió su aspecto'); toast('👗 ¡Qué guapa!'); if(curScreen==='house') renderHouse(); }
}
