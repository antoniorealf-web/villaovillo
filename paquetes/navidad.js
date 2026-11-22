"use strict";
/* =========================================================
   PAQUETE: NAVIDAD EN VILLAOVILLO 🎄 (del 1 de diciembre al 7 de enero, cada año)
   Parte 1 (21 nov 2026): pueblo nevado (suelo, tejados, árboles, carámbanos, copos), luces en los tejados,
   ropa de invierno para vecinos y niñas, y el árbol de la plaza que decoran las dos (10 adornos, 200 botones).
   Lo que se guarda: p.paq.navidad.arbol[temporada][adorno] = fecha (en la partida de cada niña; el árbol
   se ve con lo de las dos, así no hace falta juntar nada entre tablets). Temporada = año del diciembre.
   Para probar: ?prueba&fecha=2026-12-01 (o los enlaces de «🧪 Probar lo nuevo» del modo alcalde).
   ========================================================= */
const NAV = paquete({ id:'navidad', nombre:'Navidad en Villaovillo', emoji:'🎄', cuando:{desde:'12-01',hasta:'01-07'},
  enchufes:{}, info(){ const n=navArbolN(); return 'Árbol de la plaza: '+n+' de '+NAV_ADORNOS.length+' adornos'; } }) || PAQUETES.find(d=>d.id==='navidad');
function navTemp(){ const t=today(), y=+t.slice(0,4), m=+t.slice(5,7); return String(m>=11?y:y-1); }
NAV.pruebas=[
  {t:'❄️ Primer día de Navidad (1 dic)', q:'&fecha='+navTemp()+'-12-01'},
  {t:'🌙 Navidad de noche', q:'&fecha='+navTemp()+'-12-10&noche'},
  {t:'🎄 Último día de Navidad (7 ene)', q:'&fecha='+(+navTemp()+1)+'-01-07'},
  {t:'🌱 Después de Navidad (8 ene)', q:'&fecha='+(+navTemp()+1)+'-01-08'}
];

/* ---------- el árbol de la plaza ---------- */
const NAV_ADORNOS=[
  {id:'rojas',  n:'Bolas rojas',        e:'🔴', precio:10},
  {id:'doradas',n:'Bolas doradas',      e:'🟡', precio:10},
  {id:'azules', n:'Bolas azules',       e:'🔵', precio:10},
  {id:'plata',  n:'Bolas de cristal',   e:'⚪', precio:10},
  {id:'lazos',  n:'Lazos rojos',        e:'🎀', precio:15},
  {id:'pinas',  n:'Piñas',              e:'🌰', precio:15},
  {id:'espum',  n:'Espumillón dorado',  e:'✨', precio:20},
  {id:'regalos',n:'Regalos al pie',     e:'🎁', precio:25},
  {id:'luces',  n:'Guirnalda de luces', e:'💡', precio:35},
  {id:'estrella',n:'Estrella',          e:'⭐', precio:50, ultima:true}
];
const NAV_TX=1292, NAV_TY=956; // pie del árbol (dentro de la plaza, al sureste de la fuente)
function navDatos(p){ const d=paqDatosNina(p,'navidad'); d.arbol=d.arbol||{}; return d.arbol[navTemp()]=d.arbol[navTemp()]||{}; }
function navPuestos(){ const out={}; DB.profiles.forEach(q=>{ if(!q) return; const a=((q.paq||{}).navidad||{}).arbol; const s=a&&a[navTemp()]; if(s) Object.keys(s).forEach(k=>{ if(!out[k]) out[k]=q.name; }); }); return out; }
function navArbolN(){ return Object.keys(navPuestos()).length; }

const NAV_TIERS=[[-22,60,56],[-62,50,50],[-98,40,44],[-130,29,40]]; // [base, media anchura, alto]
const NAV_BOLAS=(()=>{ const s=[]; NAV_TIERS.forEach(([by,hw,h])=>{ const n1=Math.max(3,Math.round(hw/13)); for(let j=0;j<n1;j++) s.push([-hw*0.74+j*hw*1.48/(n1-1), by-7-(j%2)*4]);
  const n2=Math.max(2,n1-2); for(let j=0;j<n2;j++) s.push([-hw*0.4+j*hw*0.8/(n2-1), by-h*0.5]); }); return s; })();
const NAV_COL={rojas:'#e23b3b',doradas:'#f4c430',azules:'#3d7fe0',plata:'#eef3f8'};
function navTier(c,by,hw,h,sw){ c.beginPath(); c.moveTo(-hw,by); c.quadraticCurveTo(0,by+12,hw,by); c.lineTo(sw,by-h); c.closePath(); }
function navEstrella(c,x,y,r,t){ c.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*0.45:r; c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fillStyle='#ffd34d'; c.fill(); ol(c,2.4);
  c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.arc(x-r*0.2,y-r*0.25,r*0.18,0,Math.PI*2); c.fill(); }
/* Dibuja el árbol con el pie en (ox, oy). ad = adornos puestos; t = tiempo (para las luces) */
function navDibujaArbol(c,ox,oy,ad,t){
  c.save(); c.translate(ox,oy);
  c.fillStyle='rgba(40,60,90,.18)'; c.beginPath(); c.ellipse(4,2,66,14,0,0,Math.PI*2); c.fill();
  roundRect(c,-9,-28,18,30,4); c.fillStyle='#8a5a36'; c.fill(); ol(c,2.6);
  roundRect(c,-22,-10,44,14,5); c.fillStyle='#b5523b'; c.fill(); ol(c,2.4); // maceta
  NAV_TIERS.forEach(([by,hw,h],k)=>{ navTier(c,by,hw,h,0); const g=c.createLinearGradient(0,by-h,0,by); g.addColorStop(0,'#4fa863'); g.addColorStop(1,'#2f7a4a'); c.fillStyle=g; c.fill(); ol(c,2.8);
    c.save(); navTier(c,by,hw,h,0); c.clip(); c.fillStyle='#fbfdff'; c.beginPath(); c.ellipse(0,by-h,hw*0.5,h*0.42,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(150,180,215,.8)'; c.lineWidth=1.6; c.beginPath(); c.ellipse(0,by-h,hw*0.5,h*0.42,0,0.15,Math.PI-0.15); c.stroke(); c.restore(); });
  const swag=(y1,y2,hw,col,lw,dash)=>{ c.strokeStyle=col; c.lineWidth=lw; c.setLineDash(dash||[]); c.beginPath(); c.moveTo(-hw,y1); c.quadraticCurveTo(0,(y1+y2)/2+14,hw,y2); c.stroke(); c.setLineDash([]); };
  if(ad.espum) [[-40,-30,44],[-82,-70,36],[-114,-106,28]].forEach(([a,b,hw])=>{ swag(a,b,hw,'#c99a1a',6); swag(a,b,hw,'#ffd84a',4,[3,3]); });
  const bulbs=[];
  if(ad.luces) [[-26,-46,50],[-66,-86,40],[-102,-118,30],[-134,-150,20]].forEach(([a,b,hw])=>{ swag(a,b,hw,'#2c4a3a',1.6);
    const n=Math.round(hw/7); for(let i=0;i<=n;i++){ const u=i/n, x=-hw+2*hw*u, y=(1-u)*(1-u)*a+2*(1-u)*u*((a+b)/2+14)+u*u*b; bulbs.push([x,y,i]); } });
  NAV_BOLAS.forEach(([x,y],i)=>{ const k=['rojas','doradas','azules','plata'][i%4]; if(!ad[k]) return;
    c.strokeStyle='#8a6a2a'; c.lineWidth=1.2; c.beginPath(); c.moveTo(x,y-9); c.lineTo(x,y-5); c.stroke();
    c.beginPath(); c.arc(x,y,5.5,0,Math.PI*2); c.fillStyle=NAV_COL[k]; c.fill(); ol(c,1.6);
    c.fillStyle=k==='plata'?'#9cc7ee':'rgba(255,255,255,.75)'; c.beginPath(); c.arc(x-1.8,y-1.8,1.7,0,Math.PI*2); c.fill(); });
  if(ad.pinas) [[-44,-36],[40,-44],[-26,-76],[24,-90],[-16,-120],[12,-150]].forEach(([x,y])=>{ c.beginPath(); c.ellipse(x,y,4,6,0,0,Math.PI*2); c.fillStyle='#8a5a36'; c.fill(); ol(c,1.6);
    c.strokeStyle='#5e3a20'; c.lineWidth=1; for(let j=-1;j<=1;j++){ c.beginPath(); c.moveTo(x-3,y+j*3); c.lineTo(x+3,y+j*3+1); c.stroke(); } });
  if(ad.lazos) [[0,-44],[-30,-52],[32,-58],[-6,-86],[18,-112],[-14,-138],[4,-160]].forEach(([x,y])=>{ c.fillStyle='#d63a3a';
    c.beginPath(); c.moveTo(x,y); c.lineTo(x-7,y-4); c.lineTo(x-7,y+4); c.closePath(); c.moveTo(x,y); c.lineTo(x+7,y-4); c.lineTo(x+7,y+4); c.closePath(); c.fill(); ol(c,1.4);
    c.beginPath(); c.arc(x,y,2,0,Math.PI*2); c.fill(); ol(c,1.2); c.strokeStyle='#d63a3a'; c.lineWidth=2; c.beginPath(); c.moveTo(x-1,y+2); c.lineTo(x-4,y+9); c.moveTo(x+1,y+2); c.lineTo(x+4,y+9); c.stroke(); });
  const luzCol=['#ff5a5a','#ffd84a','#5ad1ff','#7dff8a','#ff9bf0'];
  bulbs.forEach(([x,y,i])=>{ const on=(Math.sin(t*3+i*1.7)+1)/2; c.beginPath(); c.arc(x,y+2,3,0,Math.PI*2); c.fillStyle=luzCol[i%luzCol.length]; c.globalAlpha=0.55+0.45*on; c.fill(); c.globalAlpha=1; ol(c,1); });
  if(ad.regalos) [[-46,-6,22,18,'#e23b3b','#ffd84a'],[34,-4,18,16,'#3d7fe0','#fff'],[54,-2,14,12,'#2e9e5b','#e23b3b'],[-26,4,16,12,'#a678d6','#fff']].forEach(([x,y,w,h,col,cin])=>{
    roundRect(c,x-w/2,y-h,w,h,3); c.fillStyle=col; c.fill(); ol(c,2); c.fillStyle=cin; c.fillRect(x-2,y-h,4,h); c.fillRect(x-w/2,y-h/2-2,w,4);
    c.beginPath(); c.ellipse(x-4,y-h-2,4,2.5,0.4,0,Math.PI*2); c.ellipse(x+4,y-h-2,4,2.5,-0.4,0,Math.PI*2); c.fill(); ol(c,1.2); });
  if(ad.estrella){ const pul=1+Math.sin(t*2)*0.05; c.save(); c.globalAlpha=.35+Math.sin(t*2)*0.1; c.fillStyle='#fff2a8'; c.beginPath(); c.arc(0,-176,26*pul,0,Math.PI*2); c.fill(); c.restore(); navEstrella(c,0,-176,16*pul,t); }
  c.restore();
  return bulbs.map(([x,y,i])=>[ox+x,oy+y+2,i]);
}
function navAdObj(){ const o={}; Object.keys(navPuestos()).forEach(k=>o[k]=true); return o; }
function navArbolImg(){ const cv=document.createElement('canvas'), s=1.4; cv.width=200*s; cv.height=230*s; const c=cv.getContext('2d'); c.scale(s,s); navDibujaArbol(c,100,218,navAdObj(),tGlobal||0); return cv.toDataURL(); }
async function openArbolNav(){
  const p=P(), soloVer=!!VISIT||!!REMOTO||!p, puestos=navPuestos(), n=Object.keys(puestos).length, falta=NAV_ADORNOS.filter(a=>!puestos[a.id]);
  const todosMenos=NAV_ADORNOS.filter(a=>!a.ultima).every(a=>puestos[a.id]);
  const filas=NAV_ADORNOS.map(a=>{ const quien=puestos[a.id];
    const est=quien?`<span class="counter">✅ Lo puso ${esc(quien)}</span>`:a.ultima&&!todosMenos?`<span class="counter">🔒 Primero los otros 9 adornos</span>`:soloVer?`<span class="counter">🔘 ${a.precio}</span>`:`<button class="btn green" data-ad="${a.id}" ${p.coins<a.precio?'disabled':''}>Poner · 🔘 ${a.precio}</button>`;
    return `<div class="mitem" style="padding:6px 10px;align-items:center;margin:4px 0"><div class="mi" style="font-size:26px">${a.e}</div><div class="mt"><b>${esc(a.n)}</b></div><div class="ma">${est}</div></div>`; }).join('');
  const txt=n>=NAV_ADORNOS.length?'¡El árbol está terminado y encendido! Lo habéis decorado entre las dos.':'¡Decoremos entre las dos el árbol del pueblo! Cada adorno lo pone una de vosotras. Cuando esté la estrella, se encenderá.';
  const pr=say({face:'🎄',name:'Árbol de la plaza',text:txt,speak:!soloVer,
    html:`<div style="text-align:center"><img src="${navArbolImg()}" style="width:180px;max-width:60%"></div><div style="font-weight:800;text-align:center;margin:4px 0">${n} de ${NAV_ADORNOS.length} adornos${soloVer||!p?'':' · Tú tienes 🔘 '+p.coins}</div><div id="nav-ad">${filas}</div>`,
    buttons:[{t:'Cerrar',cls:'primary'}]});
  document.querySelectorAll('#nav-ad [data-ad]').forEach(b=>b.onclick=()=>{ const a=NAV_ADORNOS.find(x=>x.id===b.dataset.ad); $('#dlgbox .dlgbtns button').click(); navPoner(a); });
  return pr;
}
async function navPoner(a){
  const p=P(); if(!p||VISIT||REMOTO||!a) return;
  if(navPuestos()[a.id]){ toast('Ese adorno ya está puesto'); return openArbolNav(); }
  if(p.coins<a.precio){ toast('No tienes botones suficientes. ¡Completa encargos!'); return; }
  p.coins-=a.precio; navDatos(p)[a.id]=today();
  addNews(p,a.e,'ha puesto '+a.n.toLowerCase()+' en el árbol de la plaza'); save('Puso '+a.n+' en el árbol de Navidad'); updateHUD();
  if(a.ultima){ addNews(p,'🌟','ha puesto la estrella: ¡el árbol de la plaza está encendido!'); fanfare();
    await say({center:true,html:`<div class="reward"><img src="${navArbolImg()}" style="width:170px"><div style="font-size:28px;font-weight:800">¡Árbol encendido!</div><div style="font-size:18px">Lo habéis decorado entre las dos. ¡Feliz Navidad, ${esc(p.name)}!</div></div>`,buttons:[{t:'¡Qué bonito!',cls:'primary'}]}); return; }
  sfxBuy(); toast(a.e+' ¡Puesto! El árbol va por '+navArbolN()+' de '+NAV_ADORNOS.length); openArbolNav();
}
edificio({ id:'arbolNav', x:NAV_TX-50, y:NAV_TY-40, w:100, h:40, door:[NAV_TX,NAV_TY+24],
  activo:()=>paqActivo(NAV), ve:b=>vis(NAV_TX,NAV_TY-90,220),
  toque:()=>({x:NAV_TX-66,y:NAV_TY-190,w:132,h:204}),
  dibuja:(c)=>{ const ad=navAdObj(); NAVF.bulbs.push(...navDibujaArbol(c,NAV_TX,NAV_TY,ad,tGlobal));
    const n=Object.keys(ad).length; if(n<NAV_ADORNOS.length) signX(c,NAV_TX-74,NAV_TY-4,'🎄 '+n+'/'+NAV_ADORNOS.length); },
  abre:()=>openArbolNav(), alcalde:()=>openArbolNav(), mapa:{etiqueta:'🎄'} });

/* ---------- el pueblo nevado ---------- */
const NAVF={bulbs:[]}; // luces dibujadas en este fotograma (para el brillo de noche)
function navCapa(c,bx,by,r){ c.save(); c.beginPath(); c.arc(bx,by,r,0,Math.PI*2); c.clip(); c.fillStyle='#fbfdff'; c.beginPath(); c.ellipse(bx,by-r*0.95,r*1.15,r*0.72,0,0,Math.PI*2); c.fill();
  c.strokeStyle='rgba(150,180,215,.75)'; c.lineWidth=1.6; c.beginPath(); c.ellipse(bx,by-r*0.95,r*1.15,r*0.72,0,0.2,Math.PI-0.2); c.stroke(); c.restore(); }
function navGorro(c,hx,hy,r){ // gorro rojo con borde y pompón blancos
  c.beginPath(); c.moveTo(hx-r*0.95,hy); c.quadraticCurveTo(hx-r*0.5,hy-r*1.9,hx+r*1.15,hy-r*1.55); c.quadraticCurveTo(hx+r*0.55,hy-r*0.9,hx+r*0.95,hy); c.closePath(); c.fillStyle='#d63a3a'; c.fill(); ol(c,1.8);
  roundRect(c,hx-r-1.5,hy-2.5,2*r+3,5.5,2.7); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.6);
  c.beginPath(); c.arc(hx+r*1.18,hy-r*1.55,Math.max(2.4,r*0.32),0,Math.PI*2); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.4); }
function navBufanda(c,sx,sy,w,col){ roundRect(c,sx-w,sy-2.6,2*w,5.2,2.6); c.fillStyle=col||'#2e9e5b'; c.fill(); ol(c,1.5);
  c.fillStyle='#fffaf3'; for(let x=sx-w+3;x<sx+w-2;x+=5) c.fillRect(x,sy-2,1.6,4); roundRect(c,sx+w*0.35,sy,4.5,9,2.2); c.fillStyle=col||'#2e9e5b'; c.fill(); ol(c,1.3); }
const NAV_ROPA={rosa:{g:[0,-38,9]},tomas:{g:[0,-33,10]},coco:{g:[1,-40,6]},bruno:{b:[0,-21,11]},lia:{g:[0,-44,10],b:[0,-26,8]},nube:{b:[0,-21,10,'#d63a3a']},hilo:{g:[0,-48,12]},alcalde:{b:[0,-35,11,'#d63a3a']},sabina:{g:[0,-37,10]}};
function navAdorna(c,tipo,o){
  if(tipo==='arbol'){ [[0,-62,22],[-17,-44,18],[17,-46,18]].forEach(([x,y,r])=>navCapa(c,x,y,r)); return; }
  if(tipo==='pino'){ [[0,-20,30,30],[0,-42,25,28],[0,-62,19,26]].forEach(([tx,ty,hw,th],k)=>{ const sx=(o.sw||0)*(k+1)*0.4; c.save(); c.beginPath(); c.moveTo(tx-hw,ty); c.quadraticCurveTo(tx,ty+8,tx+hw,ty); c.lineTo(sx,ty-th); c.closePath(); c.clip();
    c.fillStyle='#fbfdff'; c.beginPath(); c.ellipse(sx,ty-th,hw*0.55,th*0.5,0,0,Math.PI*2); c.fill(); c.strokeStyle='rgba(150,180,215,.8)'; c.lineWidth=1.4; c.beginPath(); c.ellipse(sx,ty-th,hw*0.55,th*0.5,0,0.2,Math.PI-0.2); c.stroke(); c.restore(); }); return; }
  if(tipo==='arbusto'){ [[0,-15,13],[-12,-10,11],[12,-10,11]].forEach(([x,y,r])=>navCapa(c,o.x+x,o.y+y,r)); return; }
  if(tipo==='roca'){ const s=o.s||1; c.fillStyle='#fbfdff'; c.beginPath(); c.ellipse(o.x-1*s,o.y-17*s,14*s,5*s,-0.05,0,Math.PI*2); c.fill(); return; }
  if(tipo==='farola'){ c.fillStyle='#fbfdff'; c.beginPath(); c.ellipse(o.x,o.y-77,9,3.5,0,0,Math.PI*2); c.fill(); return; }
  if(tipo==='banco'){ c.fillStyle='#fbfdff'; roundRect(c,o.x-27,o.y-16,54,5,2.5); c.fill(); roundRect(c,o.x-25,o.y-25,50,4,2); c.fill(); return; }
  if(tipo==='buzon'){ c.fillStyle='#fbfdff'; c.beginPath(); c.ellipse(o.x,o.y-70,18,5,0,0,Math.PI*2); c.fill(); ol(c,1.2); return; }
  if(tipo==='fuente'){ const {x,y}=o; c.fillStyle='#fbfdff'; if(o.lv<2){ c.beginPath(); c.moveTo(x-30,y-46); c.lineTo(x,y-64); c.lineTo(x+30,y-46); c.quadraticCurveTo(x,y-52,x-30,y-46); c.fill(); }
    else { c.beginPath(); c.ellipse(x,y-52,18,5,0,0,Math.PI*2); c.fill(); } return; }
  if(tipo==='tejado'){ const {x,y,w,rh}=o;
    c.save(); roofPath(c,x,y,w,rh); c.clip(); c.fillStyle='#fbfdff'; c.beginPath(); c.moveTo(x-30,y-30); c.lineTo(x+w+30,y-30); const n=Math.max(5,Math.round(w/26)), sw=(w+40)/n;
    c.lineTo(x+w+20,y+rh*0.3); for(let i=n;i>0;i--) c.quadraticCurveTo(x-20+(i-0.5)*sw,y+rh*0.3+(i%2?12:6),x-20+(i-1)*sw,y+rh*0.3); c.closePath(); c.fill();
    c.strokeStyle='rgba(150,180,215,.85)'; c.lineWidth=2; c.beginPath(); c.moveTo(x+w+20,y+rh*0.3); for(let i=n;i>0;i--) c.quadraticCurveTo(x-20+(i-0.5)*sw,y+rh*0.3+(i%2?12:6),x-20+(i-1)*sw,y+rh*0.3); c.stroke(); c.restore();
    roofPath(c,x,y,w,rh); ol(c,3);
    if(o.chimney){ const cx=x+w*0.7+12; c.fillStyle='#fbfdff'; c.beginPath(); c.ellipse(cx,y-9,17,5,0,0,Math.PI*2); c.fill(); ol(c,1.6); }
    // carámbanos y luces en el alero
    const P=u=>[(1-u)*(1-u)*(x-10)+2*(1-u)*u*(x+w/2)+u*u*(x+w+10),(1-u)*(1-u)*(y+rh)+2*(1-u)*u*(y+rh+10)+u*u*(y+rh)];
    c.fillStyle='rgba(225,240,252,.95)'; for(let i=1;i<14;i++){ const [ix,iy]=P(i/14), L=4+seeded(i+x)*7; c.beginPath(); c.moveTo(ix-2.5,iy); c.lineTo(ix,iy+L); c.lineTo(ix+2.5,iy); c.closePath(); c.fill(); }
    c.strokeStyle='#2c4a3a'; c.lineWidth=1.6; c.beginPath(); for(let i=0;i<=20;i++){ const [px,py]=P(i/20); i?c.lineTo(px,py+3):c.moveTo(px,py+3); } c.stroke();
    const nb=Math.max(6,Math.round(w/20)), cols=['#ff5a5a','#ffd84a','#5ad1ff','#7dff8a'];
    for(let i=0;i<nb;i++){ const [bx,by]=P((i+0.5)/nb), on=(Math.sin(tGlobal*2.6+i*1.3+x*0.01)+1)/2; c.beginPath(); c.arc(bx,by+6,3.2,0,Math.PI*2); c.fillStyle=cols[i%4]; c.globalAlpha=0.6+0.4*on; c.fill(); c.globalAlpha=1; ol(c,1); NAVF.bulbs.push([bx,by+6,i]); }
    return; }
  if(tipo==='vecino'){ const r=NAV_ROPA[o.k]; if(!r) return; if(r.b) navBufanda(c,r.b[0],r.b[1],r.b[2],r.b[3]); if(r.g) navGorro(c,r.g[0],r.g[1],r.g[2]); return; }
  if(tipo==='nina'){ const d=(o.L&&o.L.dress)||'#e4574f';
    roundRect(c,-9.5,-37.5,19,5.5,2.7); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.5); c.fillStyle=d; for(let x=-7;x<8;x+=5) c.fillRect(x,-37,2,4.5);
    roundRect(c,2.5,-35,5,11,2.4); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.3);
    c.beginPath(); c.moveTo(-16.6,-53); c.bezierCurveTo(-17.5,-75,17.5,-75,16.6,-53); c.closePath(); c.fillStyle=shade(d,0.12); c.fill(); ol(c,2);
    c.strokeStyle=shade(d,-0.12); c.lineWidth=1.4; for(const x of [-8,0,8]){ c.beginPath(); c.moveTo(x,-56); c.quadraticCurveTo(x*1.1,-64,x*0.6,-69); c.stroke(); }
    roundRect(c,-17.8,-57,35.6,7.5,3.7); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.6);
    c.beginPath(); c.arc(0,-73,5.2,0,Math.PI*2); c.fillStyle='#fffaf3'; c.fill(); ol(c,1.6); return; }
}
function navFondo(c,fase){
  const H=WH-WY0; // el pueblo puede ser más grande (ampliación): se cubre todo
  if(fase==='hierba'){ const g=c.createLinearGradient(0,WY0,0,WH); g.addColorStop(0,'#f4f8fd'); g.addColorStop(1,'#e6eef7'); c.fillStyle=g; c.fillRect(0,WY0,WW,H);
    for(let i=0;i<260;i++){ c.fillStyle=i%2?'rgba(255,255,255,.7)':'rgba(170,195,228,.16)'; c.beginPath(); c.ellipse(seeded(i)*WW,WY0+seeded(i+99)*H,30+seeded(i+7)*60,12+seeded(i+3)*20,0,0,Math.PI*2); c.fill(); }
    for(let i=0;i<700;i++){ c.fillStyle='rgba(200,220,245,.55)'; c.beginPath(); c.arc(seeded(i+3000)*WW,WY0+seeded(i+4000)*H,1.3,0,Math.PI*2); c.fill(); }
    return; }
  // final: nieve pisada en caminos y plaza, y orillas blancas
  for(let i=0;i<900;i++){ const x=seeded(i+8000)*1860, y=WY0+seeded(i+8100)*H; if(inPond(x,y)) continue;
    c.fillStyle='rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x,y,5+seeded(i+8200)*12,2.5+seeded(i+8300)*4,0,0,Math.PI*2); c.fill(); }
  c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=6; c.beginPath(); c.ellipse(POND.x,POND.y,POND.rx+8,POND.ry+7,0,0,Math.PI*2); c.stroke();
}
function navCopos(c){
  const n=NIGHTN>0.5?70:90;
  for(let i=0;i<n;i++){ const sp=22+seeded(i+900)*28, x=cam.x+((seeded(i+910)*viewW+Math.sin(tGlobal*0.8+i)*18+tGlobal*6)%viewW+viewW)%viewW, y=cam.y+((seeded(i+920)*viewH+tGlobal*sp)%viewH);
    c.fillStyle=`rgba(255,255,255,${0.65+seeded(i+930)*0.3})`; c.beginPath(); c.arc(x,y,1.4+seeded(i+940)*2.2,0,Math.PI*2); c.fill(); }
  if(NIGHTN>0){ c.save(); c.globalCompositeOperation='lighter'; const cols=['255,90,90','255,216,74','90,209,255','125,255,138'];
    NAVF.bulbs.forEach(([x,y,i])=>{ if(!vis(x,y,40)) return; const a=(0.25+0.2*Math.sin(tGlobal*2.6+i*1.3))*NIGHTN, g=c.createRadialGradient(x,y,0,x,y,14); g.addColorStop(0,`rgba(${cols[i%4]},${a})`); g.addColorStop(1,`rgba(${cols[i%4]},0)`); c.fillStyle=g; c.fillRect(x-14,y-14,28,28); });
    c.restore(); }
}
NAV.enchufes.pueblo=function(){
  NAVF.bulbs.length=0;
  const ad=navPuestos(), luz=[];
  if(ad.luces) luz.push([NAV_TX,NAV_TY-90,150,0.85,1]);
  if(ad.estrella) luz.push([NAV_TX,NAV_TY-176,90,0.9,1]);
  return {fondo:navFondo, fondoClave:'nieve', sinFlores:true, sinMariposas:true, sinBanderines:true, adorna:navAdorna, encima:navCopos, luz};
};
