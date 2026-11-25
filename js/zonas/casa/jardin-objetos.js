"use strict";
/* =========================================================
   OBJETOS DEL JARDÍN: dibujos y cosas que se cuelgan (desde el 25 nov 2026, etapa 3 del jardín)
   ---------------------------------------------------------
   JD_DIB[k](c, t, o): dibujo de cada objeto con el pie en (0,0) y casillas de JD.cs (58 px).
   JD_ALTO[k]: alto del dibujo (para tocarlo).
   JD_VA[k]: dónde se puede poner: 'suelo', 'colgar' (en un árbol joven o mayor, plSitios) o 'encima' (en el banco).
   Lo colgado o puesto encima se guarda en o.en = [k|null…] de la cosa que lo sostiene (un árbol o el banco),
   como los muebles de la casa. Al moverla, se mueve con ella; al guardarla en la cesta, va todo a la cesta.
   JD_COLG[k](c, t, i): dibujo de lo colgado, con el punto de donde cuelga en (0,0).
   ========================================================= */
const JD_VA={sh_columpio:['colgar'],sh_panal:['colgar'],sh_farolillo:['colgar'],sh_campanilla:['colgar','suelo'],sh_pajaro:['colgar','suelo'],sh_cesta:['encima','suelo']};
const JD_ALTO={sh_banco:52,sh_fuente:96,sh_colmena:56,sh_seta:40,sh_farol:84,sh_pajaro:84,sh_campanilla:84,sh_cesta:30,sh_caseta:130,sh_tienda:96,sh_tiovivo:170,sh_noria:200};
function jdVa(k){ return JD_VA[jdK(k)]||['suelo']; }
/* Sitios de una cosa del jardín (árbol: colgar; banco: encima), con el pie en (0,0) y sin dar la vuelta */
function jdSitios(o){ if(plTipo(o.k)==='arbol') return plSitios(o).map(p=>({x:p[0],y:p[1],tipo:'colgar'}));
  if(o.k==='sh_banco') return [{x:-22,y:-30,tipo:'encima'},{x:24,y:-30,tipo:'encima'}]; return []; }
function joRR(c,x,y,w,h,r,col,lw){ roundRect(c,x,y,w,h,r); c.fillStyle=col; c.fill(); ol(c,lw||2.2); }
function joSombra(c,rx){ c.fillStyle='rgba(40,60,20,.22)'; c.beginPath(); c.ellipse(0,2,rx,7,0,0,Math.PI*2); c.fill(); }
function joAbeja(c,x,y,t){ c.save(); c.translate(x,y); c.fillStyle='#f4c430'; c.beginPath(); c.ellipse(0,0,4,3,0,0,Math.PI*2); c.fill(); ol(c,1);
  c.fillStyle='#3b2f3a'; c.fillRect(-1,-3,1.6,6); c.fillStyle='rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(-1,-4,2.4,1.6,Math.sin(t*40)*0.5,0,Math.PI*2); c.fill(); c.restore(); }
let JD_LUCES=null; // mientras se dibuja el jardín grande: dónde hay faroles (para su luz de noche)
function joFarol(c,t,col){ const nt=nightLevel(); if(JD_LUCES){ const m=c.getTransform(); JD_LUCES.push([m.e/GD.k,m.f/GD.k]); } if(nt>0.2){ const g=c.createRadialGradient(0,0,2,0,0,40); g.addColorStop(0,`rgba(255,210,120,${0.6*nt})`); g.addColorStop(1,'rgba(255,210,120,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,40,0,Math.PI*2); c.fill(); }
  c.beginPath(); c.ellipse(0,0,9,12,0,0,Math.PI*2); c.fillStyle=col||'#e4574f'; c.fill(); ol(c,1.8); c.strokeStyle='rgba(0,0,0,.25)'; c.lineWidth=1; c.beginPath(); c.ellipse(0,0,4,12,0,0,Math.PI*2); c.stroke();
  joRR(c,-5,-15,10,4,1,'#3b2f3a',1.2); joRR(c,-5,11,10,4,1,'#3b2f3a',1.2); c.fillStyle=nt>0.2?'rgba(255,240,180,.9)':'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-3,-2,2.2,5,0,0,Math.PI*2); c.fill(); }
function joCaseta(c,t,i){ joRR(c,-11,-14,22,22,3,'#e09a5a',1.8); c.beginPath(); c.moveTo(-15,-12); c.lineTo(0,-26); c.lineTo(15,-12); c.closePath(); c.fillStyle='#c94a3a'; c.fill(); ol(c,1.8);
  c.beginPath(); c.arc(0,-4,5,0,Math.PI*2); c.fillStyle='#3b2f3a'; c.fill(); joRR(c,-1.5,3,3,6,1,'#8a5a36',1);
  const sale=Math.sin(t*0.7+i*2)>0.55; if(sale){ c.beginPath(); c.arc(0,-6,4.6,0,Math.PI*2); c.fillStyle='#4a8fdc'; c.fill(); ol(c,1.2); c.fillStyle='#f4c430'; c.beginPath(); c.moveTo(3.5,-6); c.lineTo(7,-5); c.lineTo(3.5,-4); c.fill(); c.fillStyle='#000'; c.beginPath(); c.arc(1.5,-7,0.9,0,Math.PI*2); c.fill(); } }
function joCampanilla(c,t,i){ joRR(c,-11,-3,22,4,2,'#8a5a36',1.4); [-8,-3,2,7].forEach((x,j)=>{ const l=12+j*3, a=Math.sin(t*2+j+i)*0.18; c.save(); c.translate(x,1); c.rotate(a); c.strokeStyle='#8a7f88'; c.lineWidth=1; c.beginPath(); c.moveTo(0,0); c.lineTo(0,4); c.stroke(); joRR(c,-1.6,4,3.2,l,1.5,['#a6d8f0','#f6b8cf','#c9e6a8','#ffe08a'][j],1.1); c.restore(); });
  c.beginPath(); c.arc(0,24,3,0,Math.PI*2); c.fillStyle='#f4c430'; c.fill(); ol(c,1); }
const JD_COLG={
  sh_columpio(c,t,i){ const a=Math.sin(t*1.8+i)*0.18, L=Math.max(20,-JD_COLG._suelo-14); c.save(); c.rotate(a);
    c.strokeStyle='#8a5a36'; c.lineWidth=2.2; c.beginPath(); c.moveTo(-12,0); c.lineTo(-13,L); c.moveTo(12,0); c.lineTo(13,L); c.stroke();
    joRR(c,-18,L-2,36,7,3,'#c98f5a',2); c.restore(); joRR(c,-16,-4,32,6,3,'#7a4f2e',1.6); },
  sh_panal(c,t,i){ c.strokeStyle='#5a4a3a'; c.lineWidth=1.6; c.beginPath(); c.moveTo(0,0); c.lineTo(0,6); c.stroke();
    c.beginPath(); c.moveTo(0,5); c.bezierCurveTo(15,8,15,30,0,34); c.bezierCurveTo(-15,30,-15,8,0,5); c.fillStyle='#f2b84b'; c.fill(); ol(c,1.8);
    c.strokeStyle='#c98a2b'; c.lineWidth=1.6; [12,19,26].forEach(y=>{ c.beginPath(); c.moveTo(-10,y); c.quadraticCurveTo(0,y+3,10,y); c.stroke(); }); c.beginPath(); c.arc(0,24,2.6,0,Math.PI*2); c.fillStyle='#3b2f3a'; c.fill();
    for(let j=0;j<3;j++){ const a=t*2.4+j*2.1+i; joAbeja(c,Math.cos(a)*24,18+Math.sin(a*1.3)*14,t); } },
  sh_farolillo(c,t,i){ const a=Math.sin(t*1.4+i)*0.08; c.save(); c.rotate(a); c.strokeStyle='#5a4a3a'; c.lineWidth=1.4; c.beginPath(); c.moveTo(0,0); c.lineTo(0,8); c.stroke(); c.translate(0,22); joFarol(c,t,'#f28c28'); c.restore(); },
  sh_campanilla(c,t,i){ c.strokeStyle='#5a4a3a'; c.lineWidth=1.4; c.beginPath(); c.moveTo(0,0); c.lineTo(0,6); c.stroke(); c.save(); c.translate(0,8); joCampanilla(c,t,i); c.restore(); },
  sh_pajaro(c,t,i){ c.strokeStyle='#5a4a3a'; c.lineWidth=1.4; c.beginPath(); c.moveTo(0,0); c.lineTo(0,8); c.stroke(); c.save(); c.translate(0,34); joCaseta(c,t,i); c.restore(); },
  sh_cesta(c,t,i){ c.save(); c.translate(0,0); JD_DIB.sh_cesta(c,t,{sin:1}); c.restore(); }
};
JD_COLG._suelo=-60; // lo pone jdObjeto antes de dibujar un columpio: lo que hay del sitio al suelo
const JD_DIB={
  sh_banco(c){ joSombra(c,50); [[-44,-26],[36,-26]].forEach(([x,y])=>joRR(c,x,y,8,26,2,'#5a4a56',1.8));
    joRR(c,-52,-32,104,9,3,'#c98f5a'); joRR(c,-52,-58,104,8,3,'#b97a48'); joRR(c,-52,-46,104,8,3,'#b97a48');
    [[-46,-62],[38,-62]].forEach(([x,y])=>joRR(c,x,y,8,32,2,'#5a4a56',1.8)); },
  sh_fuente(c,t){ joSombra(c,54); c.beginPath(); c.ellipse(0,-14,52,18,0,0,Math.PI*2); c.fillStyle='#c9c3b6'; c.fill(); ol(c,2.4);
    c.beginPath(); c.ellipse(0,-17,44,13,0,0,Math.PI*2); c.fillStyle='#7ec6ea'; c.fill(); ol(c,1.6);
    for(let j=0;j<3;j++){ c.strokeStyle='rgba(255,255,255,.6)'; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,-17,10+((t*14+j*12)%34),3+((t*4+j*4)%10),0,0,Math.PI*2); c.stroke(); }
    joRR(c,-7,-56,14,40,4,'#d8d2c4'); c.beginPath(); c.ellipse(0,-56,22,8,0,0,Math.PI*2); c.fillStyle='#c9c3b6'; c.fill(); ol(c,2); c.beginPath(); c.ellipse(0,-58,16,5,0,0,Math.PI*2); c.fillStyle='#7ec6ea'; c.fill();
    joRR(c,-4,-80,8,22,3,'#d8d2c4',1.8); c.beginPath(); c.arc(0,-82,6,0,Math.PI*2); c.fillStyle='#d8d2c4'; c.fill(); ol(c,1.8);
    c.strokeStyle='rgba(126,198,234,.95)'; c.lineWidth=3; for(const s of [-1,1]){ c.beginPath(); c.moveTo(0,-86); c.quadraticCurveTo(s*16,-100,s*20,-62); c.stroke(); c.beginPath(); c.moveTo(s*14,-58); c.quadraticCurveTo(s*34,-60,s*38,-22); c.stroke(); }
    c.fillStyle='rgba(255,255,255,.8)'; for(let j=0;j<5;j++){ const a=(t*3+j*1.3)%1; c.beginPath(); c.arc((j%2?1:-1)*(20+a*16),-60+a*40,1.8,0,Math.PI*2); c.fill(); } },
  sh_colmena(c,t){ joSombra(c,24); joRR(c,-4,-8,8,8,1,'#5a4a56',1.4); [['#f2c36b',-30],['#e9b65b',-44]].forEach(([col,y])=>joRR(c,-20,y,40,15,3,col));
    joRR(c,-24,-52,48,9,3,'#c94a3a'); c.fillStyle='#3b2f3a'; roundRect(c,-6,-22,12,4,2); c.fill();
    for(let j=0;j<4;j++){ const a=t*2+j*1.6; joAbeja(c,Math.cos(a)*26,-34+Math.sin(a*1.4)*16,t); } },
  sh_seta(c){ joSombra(c,20); [[-10,0,1],[11,2,0.75],[2,6,0.6]].forEach(([x,y,s])=>{ c.save(); c.translate(x,y); c.scale(s,s);
    joRR(c,-6,-26,12,26,5,'#fffaf1',1.8); c.beginPath(); c.moveTo(-20,-22); c.quadraticCurveTo(-20,-46,0,-46); c.quadraticCurveTo(20,-46,20,-22); c.closePath(); c.fillStyle='#e4574f'; c.fill(); ol(c,2);
    c.fillStyle='#fff'; [[-9,-32,3.5],[6,-38,3],[10,-28,2.6],[-2,-42,2.2]].forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }); c.restore(); }); },
  sh_farol(c,t){ joSombra(c,14); joRR(c,-3,-64,6,64,2,'#3b2f3a',1.6); c.beginPath(); c.ellipse(0,-2,9,4,0,0,Math.PI*2); c.fillStyle='#3b2f3a'; c.fill(); c.save(); c.translate(0,-72); joFarol(c,t,'#e4574f'); c.restore(); },
  sh_pajaro(c,t,o){ joSombra(c,14); joRR(c,-2.5,-48,5,48,2,'#8a5a36',1.6); c.save(); c.translate(0,-50); joCaseta(c,t,1); c.restore(); },
  sh_campanilla(c,t){ joSombra(c,12); c.strokeStyle=OUT; c.lineWidth=6; c.beginPath(); c.moveTo(0,0); c.lineTo(0,-70); c.quadraticCurveTo(0,-80,12,-78); c.stroke(); c.strokeStyle='#5a4a56'; c.lineWidth=3; c.stroke(); c.save(); c.translate(12,-72); joCampanilla(c,t,0); c.restore(); },
  sh_cesta(c,t,o){ if(!o||!o.sin){ c.beginPath(); c.ellipse(0,-4,26,9,0,0,Math.PI*2); c.fillStyle='#f6b8cf'; c.fill(); ol(c,1.6); c.strokeStyle='rgba(228,87,79,.6)'; c.lineWidth=2; for(let x=-18;x<=18;x+=9){ c.beginPath(); c.moveTo(x,-12); c.lineTo(x+4,4); c.stroke(); } }
    c.beginPath(); c.arc(0,-18,10,Math.PI,0); c.strokeStyle=OUT; c.lineWidth=4; c.stroke(); c.strokeStyle='#c98f5a'; c.lineWidth=2; c.stroke();
    joRR(c,-14,-18,28,14,4,'#d9a35a'); c.strokeStyle='rgba(120,70,30,.5)'; c.lineWidth=1; for(let x=-10;x<=10;x+=5){ c.beginPath(); c.moveTo(x,-17); c.lineTo(x,-5); c.stroke(); }
    joRR(c,-14,-20,28,5,2,'#e4574f',1.4); c.fillStyle='#fff'; [[-9,-19],[-1,-19],[7,-19]].forEach(([x,y])=>c.fillRect(x,y,3,2)); },
  sh_caseta(c){ joSombra(c,80); joRR(c,-66,-70,132,70,4,'#d9a35a',2.4); c.strokeStyle='rgba(120,70,30,.35)'; c.lineWidth=1.5; for(let y=-60;y<0;y+=10){ c.beginPath(); c.moveTo(-64,y); c.lineTo(64,y); c.stroke(); }
    joRR(c,-14,-46,28,46,4,'#8a5a36'); c.beginPath(); c.arc(8,-22,2,0,Math.PI*2); c.fillStyle='#f4c430'; c.fill();
    joRR(c,-52,-54,26,22,3,'#bfe6fb'); joRR(c,26,-54,26,22,3,'#bfe6fb'); c.strokeStyle=OUT; c.lineWidth=1.5; [[-39,-54],[39,-54]].forEach(([x,y])=>{ c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+22); c.moveTo(x-13,y+11); c.lineTo(x+13,y+11); c.stroke(); });
    c.beginPath(); c.moveTo(-80,-66); c.lineTo(0,-128); c.lineTo(80,-66); c.quadraticCurveTo(0,-56,-80,-66); c.fillStyle='#c9a24a'; c.fill(); ol(c,2.6);
    c.strokeStyle='rgba(120,80,20,.45)'; c.lineWidth=1.6; for(let j=-60;j<=60;j+=12){ c.beginPath(); c.moveTo(j*0.2,-118); c.lineTo(j,-68); c.stroke(); }
    c.strokeStyle='#8a5a36'; c.lineWidth=4; c.beginPath(); c.moveTo(-6,-124); c.lineTo(8,-136); c.stroke(); },
  sh_tienda(c,t){ joSombra(c,80); c.beginPath(); c.moveTo(-78,0); c.lineTo(-8,-94); c.lineTo(8,-94); c.lineTo(78,0); c.closePath(); c.fillStyle='#f29b38'; c.fill(); ol(c,2.6);
    c.beginPath(); c.moveTo(-78,0); c.lineTo(-8,-94); c.lineTo(-22,0); c.closePath(); c.fillStyle='#e07a2b'; c.fill(); ol(c,1.8);
    c.beginPath(); c.moveTo(-20,0); c.lineTo(0,-70); c.lineTo(20,0); c.closePath(); c.fillStyle='#5a3a2a'; c.fill(); ol(c,1.8);
    c.beginPath(); c.moveTo(0,-70); c.quadraticCurveTo(14,-40,28,-4); c.lineTo(20,0); c.closePath(); c.fillStyle='#f6b04f'; c.fill(); ol(c,1.6);
    c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.moveTo(0,-94); c.lineTo(0,-104); c.stroke(); const ond=Math.sin(t*4)*3; c.beginPath(); c.moveTo(0,-104); c.lineTo(16,-101+ond); c.lineTo(0,-97); c.closePath(); c.fillStyle='#e4574f'; c.fill(); ol(c,1.4);
    c.strokeStyle='#8a7f88'; c.lineWidth=1.4; c.beginPath(); c.moveTo(-50,-38); c.lineTo(-92,4); c.moveTo(50,-38); c.lineTo(92,4); c.stroke(); },
  sh_tiovivo(c,t){ joSombra(c,84); const a=t*0.8;
    c.beginPath(); c.ellipse(0,-10,78,18,0,0,Math.PI*2); c.fillStyle='#c94a3a'; c.fill(); ol(c,2.4); c.beginPath(); c.ellipse(0,-16,78,18,0,0,Math.PI*2); c.fillStyle='#f6e0b8'; c.fill(); ol(c,2.2);
    joRR(c,-6,-140,12,126,4,'#f4c430',2);
    const cab=(j)=>{ const ang=a+j*Math.PI*2/4, x=Math.sin(ang)*58, dz=Math.cos(ang), y=-16+dz*10, sube=Math.sin(t*2.5+j)*8; return {x,y,dz,sube,j}; };
    const cs=[0,1,2,3].map(cab).sort((p,q)=>p.dz-q.dz);
    const dibCab=p=>{ c.strokeStyle='#f6e0b8'; c.lineWidth=3; c.beginPath(); c.moveTo(p.x,p.y-104); c.lineTo(p.x,p.y); c.stroke(); c.save(); c.translate(p.x,p.y-38+p.sube); const s=0.75+p.dz*0.15; c.scale(Math.sin(a+p.j*Math.PI/2)>0?-s:s,s);
      c.beginPath(); c.ellipse(0,0,18,9,0,0,Math.PI*2); c.fillStyle=['#fffaf1','#f6b8cf','#bfe6fb','#c9e6a8'][p.j]; c.fill(); ol(c,1.8); c.beginPath(); c.moveTo(12,-4); c.quadraticCurveTo(20,-18,26,-16); c.lineTo(28,-8); c.quadraticCurveTo(22,-8,16,2); c.closePath(); c.fill(); ol(c,1.8);
      [[-12,6],[-5,8],[6,8],[12,6]].forEach(([x,y],k)=>{ c.strokeStyle=OUT; c.lineWidth=4; c.beginPath(); c.moveTo(x,y); c.lineTo(x+(k%2?3:-3),y+12); c.stroke(); });
      c.fillStyle='#a678d6'; c.beginPath(); c.ellipse(-2,-7,7,3,0,0,Math.PI*2); c.fill(); c.restore(); };
    cs.filter(p=>p.dz<0).forEach(dibCab);
    c.beginPath(); c.moveTo(-84,-120); c.quadraticCurveTo(0,-176,84,-120); c.lineTo(84,-114); c.lineTo(-84,-114); c.closePath(); c.fillStyle='#e4574f'; c.fill(); ol(c,2.4);
    c.save(); c.beginPath(); c.moveTo(-84,-120); c.quadraticCurveTo(0,-176,84,-120); c.lineTo(84,-114); c.lineTo(-84,-114); c.closePath(); c.clip(); c.fillStyle='#fffaf1'; for(let x=-84;x<84;x+=24){ c.beginPath(); c.moveTo(x,-114); c.lineTo(x+12,-114); c.lineTo(x*0.1+6,-180); c.closePath(); c.fill(); } c.restore();
    for(let x=-78;x<=78;x+=13){ c.beginPath(); c.arc(x,-112,6.5,0,Math.PI); c.fillStyle=(x/13)%2?'#f4c430':'#e4574f'; c.fill(); ol(c,1.2); }
    c.beginPath(); c.arc(0,-158,7,0,Math.PI*2); c.fillStyle='#f4c430'; c.fill(); ol(c,1.6);
    cs.filter(p=>p.dz>=0).forEach(dibCab); },
  sh_noria(c,t){ joSombra(c,70); const cy=-110, R=78, a=t*0.35;
    c.strokeStyle=OUT; c.lineWidth=9; c.beginPath(); c.moveTo(-60,0); c.lineTo(0,cy); c.lineTo(60,0); c.stroke(); c.strokeStyle='#4a8fdc'; c.lineWidth=5; c.stroke();
    c.beginPath(); c.arc(0,cy,R,0,Math.PI*2); c.strokeStyle=OUT; c.lineWidth=7; c.stroke(); c.strokeStyle='#fffaf1'; c.lineWidth=4; c.stroke();
    c.beginPath(); c.arc(0,cy,R*0.55,0,Math.PI*2); c.strokeStyle='#fffaf1'; c.lineWidth=3; c.stroke();
    for(let j=0;j<8;j++){ const b=a+j*Math.PI/4; c.strokeStyle='#fffaf1'; c.lineWidth=2.5; c.beginPath(); c.moveTo(0,cy); c.lineTo(Math.cos(b)*R,cy+Math.sin(b)*R); c.stroke(); }
    c.beginPath(); c.arc(0,cy,9,0,Math.PI*2); c.fillStyle='#f4c430'; c.fill(); ol(c,2);
    for(let j=0;j<8;j++){ const b=a+j*Math.PI/4, x=Math.cos(b)*R, y=cy+Math.sin(b)*R; c.strokeStyle=OUT; c.lineWidth=1.6; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+6); c.stroke();
      joRR(c,x-11,y+6,22,16,6,['#e4574f','#f4c430','#55b05a','#a678d6'][j%4],1.8); joRR(c,x-7,y+9,14,6,2,'#bfe6fb',1); } }
};
/* Dibuja una cosa del jardín que no es planta (con lo que tenga colgado o encima) */
function jdObjeto(c,o,x,y,t,esc,i,fant){ const k=jdK(o.k), d=JD_DIB[k];
  c.save(); c.translate(x,y); if(esc&&esc!==1) c.scale(esc,esc); if(o.gi) c.scale(-1,1);
  if(d) d(c,t,o); else { const sz=jdTalla(k), info=itemInfo(k); c.fillStyle='rgba(40,60,20,.22)'; c.beginPath(); c.ellipse(0,0,Math.min(jdTam(k)[0]*JD.cs*0.42,sz*0.42),7+sz*0.03,0,0,Math.PI*2); c.fill();
    c.font=Math.round(sz)+'px serif'; c.textAlign='center'; c.textBaseline='bottom'; c.fillStyle='#000'; c.fillText(info.e,0,4); if(info.f){ c.font=Math.round(sz*0.45)+'px serif'; c.fillText(info.f,sz*0.3,-sz*0.21); } }
  c.restore(); }
/* Lo que tiene colgado o encima, después de dibujar la cosa (árbol o banco) */
function jdEncima(c,o,x,y,t,esc,i){ const S=jdSitios(o); if(!o.en||!S.length) return; esc=esc||1;
  o.en.forEach((k2,j)=>{ const st=S[j]; if(!k2||!st) return; c.save(); c.translate(x+(o.gi?-1:1)*st.x*esc,y+st.y*esc); if(esc!==1) c.scale(esc,esc);
    JD_COLG._suelo=st.y; const f=JD_COLG[jdK(k2)]; if(f) f(c,t,i*3+j); c.restore(); }); }
/* Tocar la campanilla la hace sonar */
function jdSuena(){ [1046,1318,1568,1318,2093].forEach((f,j)=>setTimeout(()=>beep(f,0.18,'sine',0.05),j*110)); }
/* Nieve en el jardín mientras dura la Navidad (como en el pueblo): fase 'suelo' (manchas y tejado) y 'copos' (encima de todo) */
function jdNieve(c,d,t,fase){ if(!plNieve()) return;
  if(fase==='suelo'){ c.fillStyle='rgba(255,255,255,.85)'; for(let i=0;i<34;i++){ const x=d.gx+seeded(i+900)*JD.C*JD.cs, y=d.gy+seeded(i+950)*d.rows*JD.cs, r=10+seeded(i+990)*26; c.beginPath(); c.ellipse(x,y,r,r*0.4,0,0,Math.PI*2); c.fill(); }
    c.beginPath(); c.moveTo(450-430*0.62,6+4); c.quadraticCurveTo(450,6-4,450+430*0.62,6+4); c.lineTo(450+430*0.62,6+12); for(let x=430;x>=-430;x-=24) c.quadraticCurveTo(450+(x-12)*0.62,6+20,450+(x-24)*0.62,6+12); c.closePath(); c.fillStyle='#fff'; c.fill(); return; }
  c.fillStyle='rgba(255,255,255,.9)'; for(let i=0;i<60;i++){ const x=(seeded(i+300)*d.W+Math.sin(t*0.8+i)*14)%d.W, y=(seeded(i+400)*d.H+t*(22+seeded(i)*18))%d.H; c.beginPath(); c.arc(x,y,1.6+seeded(i+500)*1.8,0,Math.PI*2); c.fill(); } }
