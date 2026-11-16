"use strict";
/* =========================================================
   PECERA (acuario que se ve en grande y se va llenando)
   ========================================================= */
/* p.aqua = {fish:[{k,id}], deco:[k], fed:fecha}. Se compra en la tienda (fu_pecera) y se mejora con botones y logros. */
const FISH=[
  {k:'naranja',n:'Pez naranja',p:0,c:'#f29b38',c2:'#fff',shape:'pez'},
  {k:'azul',n:'Pez azul',p:40,c:'#4a8fdc',c2:'#f4c430',shape:'pez'},
  {k:'rosa',n:'Pez rosa',p:40,c:'#e46fa8',c2:'#fff',shape:'pez'},
  {k:'globo',n:'Pez globo',p:60,c:'#f4c430',c2:'#c98f5a',shape:'globo'},
  {k:'luna',n:'Pez luna',p:80,c:'#a678d6',c2:'#e7dcff',shape:'alto',m:['telar',4]},
  {k:'caballito',n:'Caballito de mar',p:120,c:'#f6b26b',c2:'#e0862f',shape:'caballito',m:['bib',4]},
  {k:'pulpo',n:'Pulpo',p:150,c:'#e4574f',c2:'#ffb3a8',shape:'pulpo',m:['pan',5]},
  {k:'tortuga',n:'Tortuga',p:200,c:'#55b05a',c2:'#8a5a36',shape:'tortuga',med:8},
  {k:'arcoiris',n:'Pez arcoíris',p:250,c:'#4a8fdc',c2:'#e4574f',shape:'arcoiris',m:['telar',6]}
];
const AQDECO=[
  {k:'alga',n:'Algas',p:15},{k:'concha',n:'Concha',p:20},{k:'estrella',n:'Estrella de mar',p:25},{k:'coral',n:'Coral',p:30},
  {k:'burbujas',n:'Burbujeador',p:40},{k:'cofre',n:'Cofre del tesoro',p:60,m:['pan',3]},{k:'castillo',n:'Castillo',p:90,m:['bib',3]},{k:'barco',n:'Barco hundido',p:140,m:['telar',5]}
];
const AQ_MAXFISH=8, AQW=900, AQH=560;
let AQ=null;
function aquaOf(p){ if(!p.aqua) p.aqua={fish:[{k:'naranja',id:'f0'}],deco:['alga'],fed:null}; return p.aqua; }
function aqReqOk(p,o){ if(o.m&&mLevel(p,o.m[0])<o.m[1]) return false; if(o.med&&Object.keys(p.medals||{}).length<o.med) return false; return true; }
function aqReqText(o){ return o.m?`${MAST[o.m[0]].e} ${MAST[o.m[0]].n} nivel ${o.m[1]}`:o.med?`🏅 ${o.med} medallas`:''; }
function openAqua(p){
  const mine=p===P()&&!VISIT; const A=aquaOf(p);
  AQ={p,mine,fish:A.fish.map((f,i)=>({f,x:150+Math.random()*600,y:150+Math.random()*250,vx:(Math.random()<.5?-1:1)*(30+Math.random()*30),vy:0,ph:Math.random()*6,tx:null,ty:null})),food:[],bub:[],t:0,raf:null,last:performance.now(),info:null};
  $('#aq-title').textContent=mine?'🐠 Mi pecera':'🐠 Pecera de '+p.name;
  show('pecera'); renderAquaSide(); sizeAqua();
  if(!AQ.raf) AQ.raf=requestAnimationFrame(aquaLoop);
}
function sizeAqua(){ const cv=$('#aq-cv'); const w=Math.max(300,Math.min(cv.parentElement.clientWidth||900,1000)); const dpr=window.devicePixelRatio||1; cv.width=w*dpr; cv.height=w*AQH/AQW*dpr; cv.style.width=w+'px'; cv.style.height=(w*AQH/AQW)+'px'; if(AQ) AQ.k=w*dpr/AQW; }
function aquaLoop(now){
  if(!AQ||curScreen!=='pecera'){ if(AQ) AQ.raf=null; return; }
  const dt=Math.min(0.05,(now-AQ.last)/1000); AQ.last=now; AQ.t+=dt; aquaUpdate(dt); aquaDraw(); AQ.raf=requestAnimationFrame(aquaLoop);
}
function aquaUpdate(dt){
  const A=aquaOf(AQ.p);
  AQ.fish.forEach(F=>{
    const food=AQ.food.length?AQ.food.reduce((b,f)=>{ const d=Math.hypot(f.x-F.x,f.y-F.y); return !b||d<b.d?{f,d}:b; },null):null;
    if(food){ const dx=food.f.x-F.x, dy=food.f.y-F.y, d=food.d||1; F.vx+=dx/d*160*dt; F.vy+=dy/d*160*dt; if(d<18){ food.f.eaten=true; F.happy=2; } }
    else if(F.tx!=null){ const dx=F.tx-F.x, dy=F.ty-F.y, d=Math.hypot(dx,dy)||1; F.vx+=dx/d*120*dt; F.vy+=dy/d*120*dt; if(d<20) F.tx=null; }
    else { F.vy+=Math.sin(AQ.t*0.8+F.ph)*8*dt; if(Math.random()<0.004) F.vx=-F.vx; }
    const sp=Math.hypot(F.vx,F.vy), mx=F.f.k==='tortuga'||F.f.k==='caballito'?45:80; if(sp>mx){ F.vx*=mx/sp; F.vy*=mx/sp; } if(sp<20&&!food&&F.tx==null) F.vx+=(F.vx>=0?1:-1)*10*dt;
    F.x+=F.vx*dt; F.y+=F.vy*dt;
    if(F.x<70){ F.x=70; F.vx=Math.abs(F.vx); } if(F.x>AQW-70){ F.x=AQW-70; F.vx=-Math.abs(F.vx); }
    if(F.y<90){ F.y=90; F.vy=Math.abs(F.vy)*0.5; } if(F.y>AQH-120){ F.y=AQH-120; F.vy=-Math.abs(F.vy)*0.5; }
    F.vy*=0.98; if(F.happy) F.happy=Math.max(0,F.happy-dt);
  });
  AQ.food.forEach(f=>{ f.y+=26*dt; if(f.y>AQH-80) f.eaten=true; }); AQ.food=AQ.food.filter(f=>!f.eaten);
  const nb=A.deco.includes('burbujas')?0.25:0.06; if(Math.random()<nb) AQ.bub.push({x:A.deco.includes('burbujas')?760+Math.random()*14:100+Math.random()*700,y:AQH-70,r:3+Math.random()*5});
  AQ.bub.forEach(b=>{ b.y-=60*dt; b.x+=Math.sin(b.y/20)*0.4; }); AQ.bub=AQ.bub.filter(b=>b.y>40);
}
function aquaDraw(){
  const cv=$('#aq-cv'), c=cv.getContext('2d'), A=aquaOf(AQ.p), t=AQ.t; c.setTransform(AQ.k,0,0,AQ.k,0,0);
  const g=c.createLinearGradient(0,0,0,AQH); g.addColorStop(0,'#8fd6f5'); g.addColorStop(1,'#2f7fb8'); c.fillStyle=g; c.fillRect(0,0,AQW,AQH);
  c.fillStyle='rgba(255,255,255,.08)'; for(let i=0;i<5;i++){ c.beginPath(); const x=120+i*170+Math.sin(t*0.4+i)*30; c.moveTo(x,0); c.lineTo(x+60,0); c.lineTo(x-40+60,AQH-90); c.lineTo(x-40,AQH-90); c.closePath(); c.fill(); }
  c.fillStyle='#e8d5a6'; c.beginPath(); c.moveTo(0,AQH-70); for(let x=0;x<=AQW;x+=60) c.quadraticCurveTo(x+30,AQH-86+Math.sin(x)*6,x+60,AQH-72); c.lineTo(AQW,AQH); c.lineTo(0,AQH); c.closePath(); c.fill();
  c.fillStyle='rgba(180,150,100,.5)'; for(let i=0;i<60;i++) c.fillRect(seeded(i)*AQW,AQH-60+seeded(i+7)*55,3,3);
  A.deco.forEach(d=>aqDeco(c,d,t));
  AQ.food.forEach(f=>{ c.fillStyle='#c98f5a'; c.beginPath(); c.arc(f.x,f.y,4,0,Math.PI*2); c.fill(); });
  AQ.fish.slice().sort((a,b)=>a.y-b.y).forEach(F=>aqFish(c,F,t));
  AQ.bub.forEach(b=>{ c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=2; c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke(); });
  c.strokeStyle='#5a3d22'; c.lineWidth=10; c.strokeRect(5,5,AQW-10,AQH-10);
  if(AQ.info&&AQ.info.t>0){ AQ.info.t-=1/60; const F=AQ.info.F; c.font="800 22px 'Baloo 2',sans-serif"; const w=c.measureText(AQ.info.txt).width+20; c.fillStyle='rgba(255,250,241,.95)'; roundRect(c,F.x-w/2,F.y-70,w,32,10); c.fill(); c.fillStyle='#5a3d22'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(AQ.info.txt,F.x,F.y-54); }
}
function aqFish(c,F,t){
  const f=FISH.find(x=>x.k===F.f.k)||FISH[0]; const dir=F.vx>=0?1:-1, wag=Math.sin(t*8+F.ph)*0.25;
  c.save(); c.translate(F.x,F.y); c.scale(dir,1); c.lineWidth=2.5; c.strokeStyle='#4a3b2c';
  const eye=(x,y)=>{ c.fillStyle='#fff'; c.beginPath(); c.arc(x,y,5,0,Math.PI*2); c.fill(); c.stroke(); c.fillStyle='#222'; c.beginPath(); c.arc(x+1.5,y,2.3,0,Math.PI*2); c.fill(); };
  if(f.shape==='pez'||f.shape==='arcoiris'){
    c.save(); c.rotate(wag); c.beginPath(); c.moveTo(-22,0); c.lineTo(-40,-14); c.lineTo(-40,14); c.closePath(); c.fillStyle=f.c2==='#fff'?f.c:f.c2; c.fill(); c.stroke(); c.restore();
    c.beginPath(); c.ellipse(0,0,28,17,0,0,Math.PI*2);
    if(f.shape==='arcoiris'){ const gg=c.createLinearGradient(-28,0,28,0); ['#e4574f','#f29b38','#f4c430','#55b05a','#4a8fdc','#a678d6'].forEach((col,i)=>gg.addColorStop(i/5,col)); c.fillStyle=gg; } else c.fillStyle=f.c;
    c.fill(); c.stroke();
    if(f.c2==='#fff'){ c.fillStyle='#fff'; c.fillRect(-6,-15,7,30); }
    else if(f.shape==='pez'){ c.fillStyle=f.c2; c.beginPath(); c.moveTo(-4,-16); c.quadraticCurveTo(6,-28,14,-14); c.fill(); }
    eye(14,-4);
  } else if(f.shape==='globo'){
    const r=F.happy>0?28:22; c.save(); c.rotate(wag); c.beginPath(); c.moveTo(-r+4,0); c.lineTo(-r-12,-10); c.lineTo(-r-12,10); c.closePath(); c.fillStyle=f.c2; c.fill(); c.stroke(); c.restore();
    c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.fillStyle=f.c; c.fill(); c.stroke(); c.fillStyle=f.c2; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; c.beginPath(); c.arc(Math.cos(a)*r*0.6,Math.sin(a)*r*0.6,2,0,Math.PI*2); c.fill(); } eye(r*0.45,-r*0.25);
  } else if(f.shape==='alto'){
    c.save(); c.rotate(wag); c.beginPath(); c.moveTo(-16,0); c.lineTo(-32,-10); c.lineTo(-32,10); c.closePath(); c.fillStyle=f.c2; c.fill(); c.stroke(); c.restore();
    c.beginPath(); c.moveTo(-18,0); c.quadraticCurveTo(0,-46,20,0); c.quadraticCurveTo(0,46,-18,0); c.fillStyle=f.c; c.fill(); c.stroke();
    c.strokeStyle=f.c2; c.lineWidth=3; for(const x of [-6,4]){ c.beginPath(); c.moveTo(x,-22); c.lineTo(x,22); c.stroke(); } c.strokeStyle='#4a3b2c'; c.lineWidth=2.5; eye(9,-6);
  } else if(f.shape==='caballito'){
    c.rotate(Math.sin(t*2+F.ph)*0.08); c.beginPath(); c.moveTo(4,-30); c.quadraticCurveTo(22,-30,20,-16); c.quadraticCurveTo(10,-14,10,-6); c.quadraticCurveTo(18,14,4,26); c.quadraticCurveTo(-8,34,-4,20); c.quadraticCurveTo(4,16,-2,8); c.quadraticCurveTo(-12,-6,-4,-22); c.closePath(); c.fillStyle=f.c; c.fill(); c.stroke();
    c.beginPath(); c.moveTo(18,-24); c.lineTo(30,-22); c.lineTo(19,-18); c.fillStyle=f.c2; c.fill(); c.stroke(); eye(6,-22);
  } else if(f.shape==='pulpo'){
    for(let i=0;i<5;i++){ const x=-16+i*8; c.beginPath(); c.moveTo(x,6); c.quadraticCurveTo(x+Math.sin(t*4+i)*8,24,x+Math.sin(t*3+i)*6,36); c.strokeStyle=f.c; c.lineWidth=7; c.lineCap='round'; c.stroke(); }
    c.lineWidth=2.5; c.strokeStyle='#4a3b2c'; c.beginPath(); c.ellipse(0,-6,22,20,0,0,Math.PI*2); c.fillStyle=f.c; c.fill(); c.stroke(); eye(-7,-8); eye(8,-8); c.beginPath(); c.arc(0,2,5,0.2,Math.PI-0.2); c.stroke();
  } else if(f.shape==='tortuga'){
    const fl=Math.sin(t*3+F.ph)*0.4; for(const [x,y] of [[14,12],[-14,12],[14,-12],[-14,-12]]){ c.save(); c.translate(x,y); c.rotate(fl*(y>0?1:-1)); c.beginPath(); c.ellipse(0,y>0?8:-8,6,10,0,0,Math.PI*2); c.fillStyle=f.c; c.fill(); c.stroke(); c.restore(); }
    c.beginPath(); c.ellipse(32,-2,10,8,0,0,Math.PI*2); c.fillStyle=f.c; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0,0,28,18,0,0,Math.PI*2); c.fillStyle=f.c2; c.fill(); c.stroke(); c.strokeStyle='#c9a06a'; c.beginPath(); c.moveTo(-14,0); c.lineTo(14,0); c.moveTo(0,-16); c.lineTo(0,16); c.stroke(); c.strokeStyle='#4a3b2c'; eye(34,-5);
  }
  if(F.happy>0){ c.scale(dir,1); c.font='16px serif'; c.textAlign='center'; c.fillText('❤️',0,-34); }
  c.restore();
}
function aqDeco(c,k,t){
  c.lineWidth=2.5; c.strokeStyle='#4a3b2c';
  if(k==='alga'){ for(const [x,h,col] of [[80,170,'#3c9a4a'],[110,120,'#55b05a'],[820,150,'#3c9a4a']]){ c.beginPath(); c.moveTo(x,AQH-70); c.bezierCurveTo(x+Math.sin(t)*16,AQH-70-h/3,x-Math.sin(t+1)*16,AQH-70-h*0.66,x+Math.sin(t*1.3)*10,AQH-70-h); c.strokeStyle=col; c.lineWidth=10; c.lineCap='round'; c.stroke(); } }
  else if(k==='concha'){ c.save(); c.translate(300,AQH-60); c.beginPath(); c.moveTo(-20,0); c.quadraticCurveTo(0,-34,20,0); c.closePath(); c.fillStyle='#ffd1dc'; c.fill(); c.stroke(); for(const a of [-12,0,12]){ c.beginPath(); c.moveTo(0,0); c.lineTo(a,-24); c.stroke(); } c.restore(); }
  else if(k==='estrella'){ c.save(); c.translate(620,AQH-58); c.rotate(0.3); c.beginPath(); for(let i=0;i<10;i++){ const r=i%2?9:22, a=i/10*Math.PI*2-Math.PI/2; c.lineTo(Math.cos(a)*r,Math.sin(a)*r); } c.closePath(); c.fillStyle='#f29b38'; c.fill(); c.stroke(); c.restore(); }
  else if(k==='coral'){ c.save(); c.translate(200,AQH-70); c.strokeStyle='#e46fa8'; c.lineWidth=12; c.lineCap='round'; for(const [a,l] of [[-0.5,60],[0,80],[0.5,55]]){ c.beginPath(); c.moveTo(0,0); const ex=Math.sin(a)*l, ey=-Math.cos(a)*l; c.lineTo(ex,ey); c.lineTo(ex+Math.sin(a+0.6)*24,ey-Math.cos(a+0.6)*24); c.stroke(); } c.restore(); }
  else if(k==='burbujas'){ roundRect(c,750,AQH-96,34,30,6); c.fillStyle='#8a8f9a'; c.fill(); c.stroke(); }
  else if(k==='cofre'){ c.save(); c.translate(470,AQH-66); const op=(Math.sin(t*0.7)+1)/2*0.5; roundRect(c,-32,-26,64,30,4); c.fillStyle='#9a6338'; c.fill(); c.stroke(); c.save(); c.translate(-32,-26); c.rotate(-op); roundRect(c,0,-14,64,16,6); c.fillStyle='#b97a48'; c.fill(); c.stroke(); c.restore(); if(op>0.2){ c.fillStyle='#f4c430'; c.beginPath(); c.arc(-8,-26,6,0,Math.PI*2); c.arc(6,-28,6,0,Math.PI*2); c.fill(); } c.fillStyle='#f4c430'; c.fillRect(-5,-18,10,10); c.restore(); }
  else if(k==='castillo'){ c.save(); c.translate(700,AQH-70); c.fillStyle='#d6b98a'; c.fillRect(-40,-90,80,90); c.strokeRect(-40,-90,80,90); for(const x of [-40,-14,12]){ c.fillRect(x,-104,22,14); c.strokeRect(x,-104,22,14); } c.fillStyle='#2f5a7a'; c.beginPath(); c.arc(0,-20,14,Math.PI,0); c.lineTo(14,0); c.lineTo(-14,0); c.fill(); c.restore(); }
  else if(k==='barco'){ c.save(); c.translate(400,AQH-72); c.rotate(-0.15); c.beginPath(); c.moveTo(-90,-30); c.lineTo(90,-30); c.lineTo(66,8); c.lineTo(-70,8); c.closePath(); c.fillStyle='#8a5a36'; c.fill(); c.stroke(); c.fillStyle='#6b4226'; c.fillRect(-4,-120,8,90); c.beginPath(); c.moveTo(4,-116); c.lineTo(50,-80); c.lineTo(4,-60); c.fillStyle='rgba(255,250,241,.7)'; c.fill(); c.stroke(); c.restore(); }
}
$('#aq-cv').addEventListener('pointerdown',ev=>{
  if(!AQ) return; const cv=$('#aq-cv'), r=cv.getBoundingClientRect(); const x=(ev.clientX-r.left)*AQW/r.width, y=(ev.clientY-r.top)*AQH/r.height;
  const F=AQ.fish.find(F=>Math.hypot(F.x-x,F.y-y)<40);
  if(F){ const f=FISH.find(q=>q.k===F.f.k); AQ.info={F,txt:F.f.name||f.n,t:2.5}; F.happy=1.5; beep(880,0.06,'sine'); return; }
  AQ.fish.forEach(F=>{ if(Math.random()<0.6){ F.tx=x+(Math.random()-0.5)*80; F.ty=y+(Math.random()-0.5)*60; } }); beep(500,0.04,'sine');
});
function renderAquaSide(){
  const {p,mine}=AQ, A=aquaOf(p), S=$('#aq-side'); S.innerHTML='';
  S.append(el('div','counter',`🐟 ${A.fish.length} de ${AQ_MAXFISH} peces · toca un pez para ver su nombre, o el agua para llamarlos`));
  if(!mine){ S.append(el('div','help',`<div>Esta es la pecera de ${esc(p.name)}. ¡Qué bonita!</div>`)); return; }
  const fed=A.fed===today(); const fb=el('button','btn '+(fed?'':'blue'),fed?'🍤 Ya han comido hoy ✓':'🍤 Dar de comer (+1 🔘)'); fb.disabled=fed;
  fb.onclick=()=>{ A.fed=today(); p.coins+=1; p.counters.earned+=1; for(let i=0;i<12;i++) AQ.food.push({x:200+Math.random()*500,y:60+Math.random()*30}); save('Dio de comer a sus peces'); beep(700,0.06); renderAquaSide(); };
  S.append(fb);
  const pa=el('button','btn','📦 Guardar la pecera en la cesta'); pa.onclick=()=>putAway(p,'fu_pecera'); S.append(pa);
  S.append(el('div','lbl',`Tienda de la pecera · tienes 🔘 ${p.coins}`));
  const g=el('div','aqshop');
  const item=(o,kind)=>{ const c=el('div','sitem'); c.style.minHeight='0';
    const ic=document.createElement('canvas'), dpr=window.devicePixelRatio||1; ic.width=110*dpr; ic.height=80*dpr; ic.style.width='110px'; ic.style.height='80px'; const cx=ic.getContext('2d'); cx.scale(dpr,dpr);
    cx.fillStyle='#bfe6f7'; roundRect(cx,0,0,110,80,12); cx.fill();
    if(kind==='fish'){ cx.save(); cx.translate(55,40); cx.scale(0.9,0.9); aqFish(cx,{f:{k:o.k},vx:1,ph:0,x:0,y:0},0); cx.restore(); }
    else { cx.font='44px serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(({alga:'🌿',concha:'🐚',estrella:'⭐',coral:'🪸',burbujas:'🫧',cofre:'💰',castillo:'🏰',barco:'⛵'})[o.k]||'✨',55,42); }
    c.append(ic, el('div','n',esc(o.n)));
    const owned=kind==='deco'&&A.deco.includes(o.k);
    if(owned){ c.append(el('div','counter','✅ En tu pecera')); return c; }
    if(!aqReqOk(p,o)){ c.style.opacity=.6; c.append(el('div','counter','🔒 '+aqReqText(o))); return c; }
    if(kind==='fish'&&o.p===0){ c.append(el('div','counter','Viene con la pecera')); return c; }
    const b=el('button','btn green',`🔘 ${o.p}`); b.disabled=p.coins<o.p||(kind==='fish'&&A.fish.length>=AQ_MAXFISH);
    b.onclick=async()=>{ if(p.coins<o.p) return;
      if(kind==='fish'){ if(A.fish.length>=AQ_MAXFISH){ toast('¡La pecera está llena!'); return; }
        const r=await say({face:'🐠',name:o.n,speak:false,text:'¿Cómo se va a llamar?',html:'<input class="inputline" id="aq-name" maxlength="12" placeholder="Nombre del pez">',buttons:[{t:'Cancelar'},{t:'¡Comprar!',cls:'primary'}]}); if(r!==1) return;
        const nm=(document.getElementById('aq-name').value||'').trim()||o.n;
        p.coins-=o.p; const nf={k:o.k,id:'f'+Date.now().toString(36),name:nm}; A.fish.push(nf); AQ.fish.push({f:nf,x:450,y:120,vx:50,vy:20,ph:Math.random()*6}); save('Compró un pez: '+o.n); sfxBuy(); addNews(p,'🐠',`tiene un ${o.n.toLowerCase()} nuevo en su pecera: ${nm}`); }
      else { p.coins-=o.p; A.deco.push(o.k); save('Decoró su pecera: '+o.n); sfxBuy(); }
      renderAquaSide(); };
    c.append(b); return c; };
  FISH.forEach(o=>g.append(item(o,'fish'))); AQDECO.forEach(o=>g.append(item(o,'deco')));
  S.append(g);
}
$('#aq-back').onclick=()=>{ const p=AQ&&AQ.p; AQ=null; if(p){ houseView='room'; openHouse(DB.profiles.indexOf(p)); } else show('village'); };
window.addEventListener('resize',()=>{ if(curScreen==='pecera') sizeAqua(); });

/* ---- tocar la pizarra o la pecera dentro de casa ---- */
function putAway(p,k){ const R=roomOf(p); let i=R.wl.indexOf(k); if(i>=0) R.wl[i]=null; else { i=R.fl.indexOf(k); if(i>=0) R.fl[i]=null; } p.inv[k]=(p.inv[k]||0)+1; save(); toast('📦 Guardada en tu cesta (no se borra nada)'); BD=null; AQ=null; houseView='room'; openHouse(DB.profiles.indexOf(p)); }
function roomHitKey(x,y,R){
  for(let i=0;i<WALL_SLOTS.length;i++){ const [sx,sy]=WALL_SLOTS[i]; if(Math.abs(x-sx)<46&&Math.abs(y-sy)<46) return R.wl[i]; }
  if(y<RW.rows[0][0]||x<RW.gx||x>=RW.gx+8*RW.cw) return null;
  const row=RW.rows.findIndex(r=>y>=r[0]&&y<r[1]); if(row<0) return null; return R.fl[row*8+Math.floor((x-RW.gx)/RW.cw)];
}
