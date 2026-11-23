"use strict";
/* =========================================================
   PAQUETE: HUERTO DEL ROBOT 🤖 (con la otra orilla, desde el 8 ene 2027)
   ---------------------------------------------------------
   Un huerto compartido al otro lado del río con una parcela por niña (Cintia 4×4, Berta 5×5).
   La parcela de cada una se abre cuando tiene el puente terminado y Telar nivel 6; la de la hermana se ve siempre.
   - Sembrar: la niña elige semillas de temporada (HU_TEMP) y marca huecos de su parcela.
   - Trabajo de hoy (huTrabajo): el reto del robot sale del estado real de su parcela: plantar y regar lo
     sembrado, regar lo que tiene sed y recoger lo maduro. Cada planta pide agua cada día; con HU_CULT[c].r
     riegos en días distintos, al día siguiente está madura. Sin castigo: si un día no se riega, solo espera.
     Lo recogido va a la cesta (para la granja, más adelante). Botones: 1 por tarea, como mucho 8 al día.
   - Retos del robot: 3 al día de su nivel (rbGenera), 2 botones por estrella la primera vez y 1 de maestría
     de Telar. El nivel (1-10) sube con 2 perfectos seguidos y baja con 2 atascos, como en el telar.
   - Modo: 'flechas' (grupo 6), 'girar' (grupo 9) o 'si' (condiciones, después de girar). Los pasos los
     decide papá en el modo alcalde; el juego avisa (H.listo) cuando domina el nivel 10 de flechas ('girar')
     o el 8 de girar ('si'). En modo 'si' el trabajo de hoy ofrece «Si…» y, si lo resuelve con condiciones,
     se guarda el programa (H.prog) para cargarlo otro día: un programa general sirve cada día.
   Datos de cada niña en p.paq.huerto (paqDatosNina, nunca se borran):
     {W, cel:[null|{c, e:'sem'|'brote', ag:riegos, ur:último riego, pd:plantada}], niv, run, modo, listo,
      cesta:{cultivo:n}, retos:{f, niv:[], est:[]}, trab:{f, b}, tot:{retos, perf, trab, cos}, desde}
   Pantalla: paquetes/huerto-pantalla.js. Robot: js/zonas/huerto/.
   ========================================================= */
const HU_CULT={
  zanahoria:{e:'🥕',n:'Zanahoria',np:'zanahorias',r:3}, lechuga:{e:'🥬',n:'Lechuga',np:'lechugas',r:2},
  col:{e:'🥦',n:'Col',np:'coles',r:4}, haba:{e:'🫘',n:'Haba',np:'habas',r:3},
  fresa:{e:'🍓',n:'Fresa',np:'fresas',r:3}, tomate:{e:'🍅',n:'Tomate',np:'tomates',r:4},
  maiz:{e:'🌽',n:'Maíz',np:'mazorcas',r:4}, calabaza:{e:'🎃',n:'Calabaza',np:'calabazas',r:5}
};
const HU_TEMP={ // qué se siembra cada mes (calendario de la huerta)
  1:['col','haba','lechuga','zanahoria'], 2:['col','haba','lechuga','zanahoria'], 3:['haba','lechuga','zanahoria','fresa'],
  4:['fresa','lechuga','zanahoria','haba'], 5:['fresa','tomate','lechuga','zanahoria'], 6:['tomate','maiz','calabaza','zanahoria'],
  7:['tomate','maiz','calabaza','zanahoria'], 8:['tomate','maiz','calabaza','lechuga'], 9:['calabaza','lechuga','zanahoria','maiz'],
  10:['calabaza','lechuga','col','zanahoria'], 11:['lechuga','col','haba','zanahoria'], 12:['col','haba','lechuga','zanahoria']
};
const HU_TRAB_TOPE=8, HU_RETOS=3;
const HU_MODOS={flechas:'⬆️ Flechas',girar:'↪️ Girar',si:'❓ Condiciones'};

paquete({ id:'huerto', nombre:'Huerto del robot', emoji:'🤖', cuando:{logro:()=>ampActivo(), texto:'Con la otra orilla (8 de enero)'},
  info(){ return 'Parcelas de las niñas al otro lado del río: sembrar, el trabajo del robot y retos por nivel'; },
  pruebas:[
    {t:'🤖 El huerto con las parcelas abiertas (10 ene)', q:'&fecha=2027-01-10'}
  ] });
const HU_DEF=PAQUETES.find(d=>d.id==='huerto');
function huActivo(){ try{ return !!HU_DEF&&paqActivo(HU_DEF); }catch(e){ return false; } }

/* ---------- datos ---------- */
function huTam(p){ return p&&p.age<=7?4:5; }
function huLee(p){ return (p&&p.paq&&p.paq.huerto&&p.paq.huerto.W)?p.paq.huerto:null; } // solo leer (paseo, dibujo)
function huIni(p){ // crea los datos la primera vez (nunca en el paseo del alcalde)
  const H=paqDatosNina(p,'huerto');
  if(!H.W){ H.W=huTam(p); H.cel=Array(H.W*H.W).fill(null); H.niv=1; H.run=0; H.modo=rbModoDe(p.age); H.cesta={}; H.retos={}; H.trab={}; H.tot={retos:0,perf:0,trab:0,cos:0}; H.desde=today(); }
  return H;
}
function huAbierta(p){ return !!p&&huActivo()&&bridgeDone()&&mLevel(p,'telar')>=ZONE_REQ.huerto[1]; }
function huMes(){ return +today().slice(5,7); }
function huTemporada(){ return HU_TEMP[huMes()]; }
/* estado de una casilla hoy: null · 'sem' (semilla marcada) · 'sed' · 'regada' · 'mad' */
function huEst(k,hoy){ if(!k) return null; if(k.e==='sem') return 'sem'; const need=(HU_CULT[k.c]||{r:3}).r; if(k.ag>=need&&k.ur<hoy) return 'mad'; return k.ur===hoy?'regada':'sed'; }
function huCeldas(H){ const hoy=today(); return H.cel.map(k=>{ const e=huEst(k,hoy); return {p:0,c:k?k.c:null,t:e==='regada'?'ok':e}; }); }
function huCuenta(H){ const hoy=today(), n={sem:0,sed:0,mad:0,regada:0}; H.cel.forEach(k=>{ const e=huEst(k,hoy); if(e) n[e]++; }); return n; }

/* ---------- trabajo de hoy: un reto hecho con la parcela ---------- */
function huTrabajo(p){
  const H=huLee(p); if(!H) return null;
  const W=H.W, hoy=today(), mapa={sem:'sw',sed:'sed',mad:'mad',regada:'peq'};
  const cel=H.cel.map(k=>{ const e=huEst(k,hoy); return {p:0,t:e?mapa[e]:null,c:k?k.c:RB_CULTIVOS[0]}; });
  const pend=[]; cel.forEach((c,i)=>{ if(c.t&&c.t!=='peq') pend.push(i); });
  if(!pend.length) return null;
  // camino de referencia: siempre a la tarea más cercana (primero en horizontal)
  let x=0, y=0; const seq=[];
  while(pend.length){
    let bi=0, bd=1e9; pend.forEach((i,k)=>{ const d=Math.abs(i%W-x)+Math.abs(Math.floor(i/W)-y); if(d<bd){ bd=d; bi=k; } });
    const i=pend.splice(bi,1)[0], tx=i%W, ty=Math.floor(i/W);
    while(x<tx){ seq.push('R'); x++; } while(x>tx){ seq.push('L'); x--; }
    while(y<ty){ seq.push('D'); y++; } while(y>ty){ seq.push('U'); y--; }
    seq.push(...RB_ACT[cel[i].t]);
  }
  const modo=H.modo||rbModoDe(p.age), niv=Math.max(1,Math.min(RB_MAX_NIVEL,H.niv||1)), conRep=rbConRepetir(modo,niv);
  const ops=modo!=='flechas'?rbAGirar(seq,1):seq;
  let sol=rbComprime(ops,conRep);
  if(modo==='girar'&&conRep) for(const extra of [['TL'],['TR'],['TL','TL']]){ const s2=rbComprime(ops.concat(extra),true); if(rbCuenta(s2)<rbCuenta(sol)) sol=s2; }
  const R={modo,nivel:niv,w:W,h:W,ini:{x:0,y:0,d:1},cel,sol,best:rbCuenta(sol),trabajo:true};
  if(modo==='si'){ R.conds=['sed','mad','sem','delante']; R.sino=true; }
  const chk=rbRun(R,sol); if(chk.err||chk.pend){ try{ apuntaFallo(new Error('trabajo sin solución'),'huerto'); }catch(e){} return null; }
  return R;
}
function huGanaTrabajo(p,R,fin){
  if(VISIT||REMOTO) return '';
  const H=huIni(p), hoy=today(); let tareas=0; const cosecha={};
  R.cel.forEach((c,i)=>{
    if(c.t==='sw'){ H.cel[i]={c:H.cel[i]?H.cel[i].c:c.c,e:'brote',ag:1,ur:hoy,pd:hoy}; tareas+=2; }
    else if(c.t==='sed'&&H.cel[i]){ H.cel[i].ag=(H.cel[i].ag||0)+1; H.cel[i].ur=hoy; tareas++; }
    else if(c.t==='mad'&&H.cel[i]){ const k=H.cel[i].c; H.cesta[k]=(H.cesta[k]||0)+1; cosecha[k]=(cosecha[k]||0)+1; H.cel[i]=null; H.tot.cos++; tareas++; }
  });
  if(!H.trab||H.trab.f!==hoy) H.trab={f:hoy,b:0};
  const coins=Math.max(0,Math.min(HU_TRAB_TOPE-H.trab.b,tareas)); H.trab.b+=coins; H.tot.trab++;
  p.coins+=coins; p.counters.earned+=coins; logAct(p,'hw',1,tareas);
  let guardado='';
  if(H.modo==='si'&&fin.prog&&rbTieneCond(fin.prog)){ const nuevo=JSON.stringify(fin.prog)!==JSON.stringify(H.prog||null); H.prog=fin.prog; if(nuevo) guardado=' 📼 He guardado tu programa: otro día puedes cargarlo con un toque.'; }
  const ks=Object.keys(cosecha);
  if(ks.length&&H.tot.cos===ks.reduce((a,k)=>a+cosecha[k],0)) addNews(p,'🧺','ha recogido su primera cosecha en el huerto del robot');
  save('Trabajo del huerto'+(ks.length?': recogió '+ks.map(k=>cosecha[k]+' '+HU_CULT[k].np).join(', '):''));
  return (coins?`🔘 +${coins} botones.`:'')+(ks.length?' 🧺 A la cesta: '+ks.map(k=>HU_CULT[k].e+'×'+cosecha[k]).join(' ')+'.':'')+guardado;
}

/* ---------- retos del robot (3 al día, de su nivel) ---------- */
function huRetosHoy(H){ return H.retos&&H.retos.f===today()?H.retos:{f:today(),niv:[],est:[]}; }
function huReto(p,k){
  const H=huIni(p); if(!H.retos||H.retos.f!==today()) H.retos={f:today(),niv:[],est:[]};
  if(!H.retos.niv[k]) H.retos.niv[k]=H.niv;
  return rbGenera(H.modo,H.retos.niv[k],'hu'+today()+(p.id||p.name)+k);
}
function huGanaReto(p,k,fin){
  if(VISIT||REMOTO) return '';
  const H=huIni(p), Rt=huRetosHoy(H); H.retos=Rt;
  const prev=Rt.est[k]||0, st=fin.estrellas, first=!prev; let coins=0; const out=[];
  Rt.est[k]=Math.max(prev,st);
  if(first){
    coins=st*2; addMastery(p,'telar',1); logAct(p,'h',1,st===3?1:0); H.tot.retos++;
    const perfect=fin.intentos<=1&&st===3, stuck=st<=1||fin.intentos>=4; if(perfect) H.tot.perf++;
    let r=H.run||0; if(perfect) r=r>0?r+1:1; else if(stuck) r=r<0?r-1:-1; else r=0;
    if(r>=2&&H.niv<RB_MAX_NIVEL){ H.niv++; r=0; out.push(`📈 ¡Robot nivel ${H.niv}!`); addNews(p,'🤖',`ha subido al nivel ${H.niv} del robot del huerto`); }
    else if(r<=-2&&H.niv>1){ H.niv--; r=0; }
    else if(perfect&&H.niv>=RB_MAX_NIVEL&&H.modo==='flechas'&&!H.listo){ H.listo='girar'; }
    if(perfect&&H.niv>=8&&H.modo==='girar'&&!H.listo) H.listo='si';
    H.run=r;
  } else coins=Math.max(0,st-prev)*2;
  p.coins+=coins; p.counters.earned+=coins;
  save(`Reto del robot ${k+1}: ${'★'.repeat(st)}`);
  return [coins?`🔘 +${coins} botones.`:'',...out].filter(Boolean).join(' ');
}

/* ---------- sembrar ---------- */
function huSiembra(p,i,cult){
  if(VISIT||REMOTO) return 'no';
  const H=huIni(p), k=H.cel[i];
  if(k&&k.e==='sem'){ H.cel[i]=null; saveQuiet(); return 'quita'; }
  if(k) return 'ocupada';
  if(H.cel.filter(x=>x&&x.e==='sem').length>=H.W) return 'tope';
  if(!huTemporada().includes(cult)) return 'no';
  H.cel[i]={c:cult,e:'sem'}; saveQuiet(); return 'pon';
}

/* ---------- lo que decide papá (orden 'paq') ---------- */
HU_DEF.ordenes={
  niv(p,v){ const H=huIni(p), n=Math.round(+v); if(!(n>=1&&n<=RB_MAX_NIVEL)) return false; H.niv=n; H.run=0; return true; },
  modo(p,v){ if(!['flechas','girar','si'].includes(v)) return false; const H=huIni(p); if(H.modo!==v){ H.modo=v; H.niv=1; H.run=0; } H.listo=null; return true; }
};
HU_DEF.alcalde=function(box){
  const b=box('🤖 Huerto del robot');
  b.append(el('div','counter',`Cada niña tiene su parcela (se abre con el puente y Telar nivel ${ZONE_REQ.huerto[1]}). El nivel del robot sube y baja solo; aquí puedes cambiarlo y decidir cuándo pasa de flechas a girar y de girar a condiciones («si…»).`));
  DB.profiles.filter(Boolean).forEach(q=>{
    const H=huLee(q), card=el('div','panel'); card.style.cssText='margin:10px 0;background:#f4fbef';
    card.append(el('div','wsec',esc(q.name)));
    if(!huAbierta(q)) card.append(el('div','counter',`🔒 Parcela cerrada: Telar nivel ${mLevel(q,'telar')} de ${ZONE_REQ.huerto[1]}${bridgeDone()?'':' · falta el puente'}.`));
    if(!H){ card.append(el('div','counter','Todavía no ha entrado en su parcela.')); b.append(card); return; }
    const n=huCuenta(H), Rt=huRetosHoy(H), ces=Object.keys(H.cesta||{}).filter(k=>H.cesta[k]);
    card.append(el('div','',`<b>${HU_MODOS[H.modo]} · nivel ${H.niv}</b> · retos de hoy: ${Rt.est.filter(Boolean).length}/${HU_RETOS} ${Rt.est.map(s=>s?'★'.repeat(s):'').filter(Boolean).join(' ')}`));
    card.append(el('div','counter',`Parcela: ${n.sem} sembradas · ${n.sed} con sed · ${n.regada} regadas hoy · ${n.mad} maduras · total: ${H.tot.retos} retos (${H.tot.perf} perfectos), ${H.tot.cos} verduras recogidas`));
    card.append(el('div','counter','🧺 Cesta: '+(ces.length?ces.map(k=>HU_CULT[k].e+' '+H.cesta[k]).join(' · '):'vacía')));
    if(H.listo==='girar'&&H.modo==='flechas') card.append(el('div','',`<div style="background:#fff3cf;border-radius:12px;padding:8px 10px;margin:6px 0">💡 <b>${esc(q.name)} domina las flechas.</b> ¿Pasa a girar (avanza y gira)? Empezaría en el nivel 1 de girar.</div>`));
    if(H.listo==='si'&&H.modo==='girar') card.append(el('div','',`<div style="background:#fff3cf;border-radius:12px;padding:8px 10px;margin:6px 0">💡 <b>${esc(q.name)} domina girar.</b> ¿Pasa a condiciones («si tiene sed → riega»)? Empezaría en el nivel 1 de condiciones.</div>`));
    if(H.prog) card.append(el('div','counter','📼 Tiene un programa guardado para el trabajo de cada día.'));
    const row=el('div'); row.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px';
    const nv=el('select','inputline'); nv.style.cssText='width:auto;font-size:16px;min-height:42px';
    for(let k=1;k<=RB_MAX_NIVEL;k++){ const o=document.createElement('option'); o.value=k; o.textContent='Nivel '+k; if(k===H.niv) o.selected=true; nv.append(o); }
    const bn=el('button','btn','Cambiar nivel'); bn.onclick=async()=>{ if(await alcHaz(q.id,'paq',{id:'huerto',campo:'niv',valor:+nv.value},'Robot de '+q.name+': nivel '+nv.value)){ toast('Nivel del robot cambiado'); renderAlcalde(); } };
    const md=el('select','inputline'); md.style.cssText='width:auto;font-size:16px;min-height:42px';
    Object.keys(HU_MODOS).forEach(k=>{ const o=document.createElement('option'); o.value=k; o.textContent=HU_MODOS[k]; if(k===(H.listo&&H.modo!==H.listo?H.listo:H.modo)) o.selected=true; md.append(o); });
    const bm=el('button','btn '+(H.listo&&H.modo!==H.listo?'green':''),'Cambiar forma'); bm.onclick=async()=>{ if(md.value===H.modo){ toast('Ya usa esa forma'); return; } if(await alcHaz(q.id,'paq',{id:'huerto',campo:'modo',valor:md.value},'Robot de '+q.name+': '+HU_MODOS[md.value])){ toast('Cambiado: el robot de '+q.name+' usa '+HU_MODOS[md.value]+' (nivel 1)'); renderAlcalde(); } };
    row.append(nv,bn,md,bm); card.append(row);
    b.append(card);
  });
};

/* ---------- en el pueblo: el huerto con las dos parcelas ---------- */
/* bancal de madera con las casillas de una niña (también en la pantalla del huerto) */
function huDibujaParcela(c,q,x0,y0,cs,t){
  const H=huLee(q), W=H?H.W:huTam(q), abierta=huAbierta(q), L=W*cs, m=Math.max(5,cs*0.16);
  c.fillStyle='rgba(0,0,0,.12)'; roundRect(c,x0-m+3,y0-m+5,L+2*m,L+2*m,8); c.fill();
  c.fillStyle='#9a6b3f'; roundRect(c,x0-m,y0-m,L+2*m,L+2*m,8); c.fill();
  c.strokeStyle='#7c522d'; c.lineWidth=1.5; for(let k=1;k<3;k++){ const o=m*k/3; c.beginPath(); c.moveTo(x0-m+o,y0-m+o); c.lineTo(x0+L+m-o,y0-m+o); c.stroke(); }
  c.fillStyle='#6e4a2a'; for(const [px,py] of [[x0-m,y0-m],[x0+L+m,y0-m],[x0-m,y0+L+m],[x0+L+m,y0+L+m]]){ roundRect(c,px-m*0.6,py-m*0.6,m*1.2,m*1.2,3); c.fill(); }
  c.fillStyle='#7d5434'; c.fillRect(x0,y0,L,L);
  const cel=H?huCeldas(H):Array(W*W).fill(0).map(()=>({p:0,t:null}));
  for(let i=0;i<W*W;i++) rbCasilla(c,{w:W,h:W},cel,i,x0,y0,cs,t,false);
  if(!abierta){ c.fillStyle='rgba(230,205,140,.72)'; c.fillRect(x0,y0,L,L);
    c.strokeStyle='rgba(180,140,70,.6)'; c.lineWidth=2; for(let k=0;k<18;k++){ const sx=x0+seeded(k+770)*L, sy=y0+seeded(k+880)*L; c.beginPath(); c.moveTo(sx-8,sy+3); c.lineTo(sx+8,sy-3); c.stroke(); } // paja
    const sw=Math.min(L-10,118), sh=34, sx=x0+L/2-sw/2, sy=y0+L/2-sh/2;
    c.strokeStyle='#6e4a2a'; c.lineWidth=2; c.beginPath(); c.moveTo(sx+16,sy); c.lineTo(x0+L/2,sy-14); c.lineTo(sx+sw-16,sy); c.stroke();
    c.fillStyle='#c99560'; roundRect(c,sx,sy,sw,sh,8); c.fill(); c.fillStyle='#4a2f18'; c.font='bold 15px "Baloo 2",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`🔒 Telar ${ZONE_REQ.huerto[1]}`,x0+L/2,sy+sh/2+1); }
}
function huCartel(c,x,y,txt,col){ // cartel de madera con dos patas
  c.font='bold 16px "Baloo 2",sans-serif'; const w=Math.max(70,c.measureText(txt).width+34);
  c.fillStyle='#7c522d'; c.fillRect(x-w/2+10,y+8,5,20); c.fillRect(x+w/2-15,y+8,5,20);
  c.fillStyle='#d8a86d'; roundRect(c,x-w/2,y-14,w,28,8); c.fill(); c.strokeStyle='#9a6b3f'; c.lineWidth=2; roundRect(c,x-w/2,y-14,w,28,8); c.stroke();
  if(col){ c.fillStyle=col; c.beginPath(); c.arc(x-w/2+13,y,6,0,Math.PI*2); c.fill(); }
  c.fillStyle='#4a2f18'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(txt,x+(col?7:0),y+1);
}
function huGirasol(c,x,y,s,t){ c.strokeStyle='#4f9a3e'; c.lineWidth=3; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-30*s); c.stroke(); rbHoja(c,x,y-12*s,-2.6,11*s,'#5aae48'); rbHoja(c,x,y-16*s,-0.5,11*s,'#5aae48');
  const cy=y-34*s+Math.sin(t*1.5+x)*1.2; c.fillStyle='#f6c12b'; for(let k=0;k<10;k++){ const a=k*Math.PI/5; c.beginPath(); c.ellipse(x+Math.cos(a)*7*s,cy+Math.sin(a)*7*s,4.5*s,2.6*s,a,0,Math.PI*2); c.fill(); }
  c.fillStyle='#7a4a1f'; c.beginPath(); c.arc(x,cy,5*s,0,Math.PI*2); c.fill(); }
function huEspantapajaros(c,x,y){
  c.fillStyle='#7c522d'; c.fillRect(x-3,y-60,6,60); c.fillRect(x-26,y-46,52,5);
  c.fillStyle='#4a8fdc'; roundRect(c,x-16,y-50,32,30,6); c.fill(); c.fillStyle='#e4574f'; c.fillRect(x-16,y-34,32,4);
  c.fillStyle='#f1d6a8'; c.beginPath(); c.arc(x,y-60,11,0,Math.PI*2); c.fill();
  c.fillStyle='#c98f2e'; c.beginPath(); c.ellipse(x,y-69,17,5,0,0,Math.PI*2); c.fill(); roundRect(c,x-9,y-82,18,14,4); c.fill();
  c.fillStyle='#3a2a1a'; c.beginPath(); c.arc(x-4,y-61,1.6,0,Math.PI*2); c.arc(x+4,y-61,1.6,0,Math.PI*2); c.fill();
  c.strokeStyle='#3a2a1a'; c.lineWidth=1.5; c.beginPath(); c.arc(x,y-58,4,0.2,Math.PI-0.2); c.stroke();
  c.strokeStyle='#e7c45a'; c.lineWidth=2; for(const dx of [-25,25]){ for(let k=-1;k<=1;k++){ c.beginPath(); c.moveTo(x+dx,y-44); c.lineTo(x+dx+(dx<0?-5:5),y-40+k*4); c.stroke(); } }
}
function huCaseta(c,x,y,t){ // caseta del robot con placas solares; (x,y) = centro de la base
  c.fillStyle='rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(x,y+4,50,9,0,0,Math.PI*2); c.fill();
  c.fillStyle='#c98f55'; c.fillRect(x-40,y-48,80,50); c.strokeStyle='#a5703c'; c.lineWidth=1.5; for(let k=1;k<5;k++){ c.beginPath(); c.moveTo(x-40,y-48+k*10); c.lineTo(x+40,y-48+k*10); c.stroke(); }
  c.fillStyle='#3d4a5c'; c.beginPath(); c.moveTo(x-50,y-44); c.lineTo(x,y-80); c.lineTo(x+50,y-44); c.closePath(); c.fill();
  c.fillStyle='#4a7fb8'; c.beginPath(); c.moveTo(x-40,y-48); c.lineTo(x-4,y-74); c.lineTo(x-4,y-62); c.lineTo(x-28,y-45); c.closePath(); c.fill();
  c.strokeStyle='#8fc0ee'; c.lineWidth=1; c.beginPath(); c.moveTo(x-22,y-61); c.lineTo(x-14,y-52); c.moveTo(x-14,y-67); c.lineTo(x-6,y-58); c.stroke();
  c.fillStyle='#6e4a2a'; roundRect(c,x-13,y-30,26,32,5); c.fill(); c.fillStyle='#f4c430'; c.beginPath(); c.arc(x+7,y-14,2,0,Math.PI*2); c.fill();
  const on=0.5+0.5*Math.sin(t*3); c.fillStyle=`rgba(255,230,120,${0.6+0.4*on})`; roundRect(c,x+18,y-38,14,12,3); c.fill();
  c.strokeStyle='#3d4a5c'; c.lineWidth=2; c.beginPath(); c.moveTo(x+30,y-58); c.lineTo(x+30,y-88); c.stroke(); c.fillStyle=`rgba(228,87,79,${0.5+0.5*on})`; c.beginPath(); c.arc(x+30,y-90,4,0,Math.PI*2); c.fill();
}
function huGeoPueblo(b){ const ps=DB.profiles, Ws=[0,1].map(k=>ps[k]?((huLee(ps[k])||{}).W||huTam(ps[k])):4), cs=44, cx=b.x+b.w/2, y0=b.y+96;
  return {cs,cx,y0,Ws,x:[cx-58-Ws[0]*cs,cx+58]}; }
function huDibujaPueblo(c,b){
  const t=tGlobal, G=huGeoPueblo(b), ps=DB.profiles;
  // césped con matices
  c.fillStyle='#a9db8c'; roundRect(c,b.x,b.y,b.w,b.h,28); c.fill();
  c.fillStyle='rgba(255,255,255,.12)'; for(let k=0;k<14;k++){ c.beginPath(); c.ellipse(b.x+30+seeded(k+300)*(b.w-60),b.y+30+seeded(k+400)*(b.h-60),22+seeded(k+500)*20,8,0,0,Math.PI*2); c.fill(); }
  // camino de grava desde la puerta hasta la caseta
  c.fillStyle='#e8dcc0'; roundRect(c,G.cx-30,b.y+150,60,b.h-150,14); c.fill();
  c.fillStyle='#cdbd98'; for(let k=0;k<26;k++){ c.beginPath(); c.arc(G.cx-24+seeded(k+600)*48,b.y+160+seeded(k+700)*(b.h-170),2+seeded(k+800)*1.5,0,Math.PI*2); c.fill(); }
  // bancales con su cartel
  [0,1].forEach(k=>{ const q=ps[k]; if(!q) return; const W=G.Ws[k], x0=G.x[k];
    huDibujaParcela(c,q,x0,G.y0,G.cs,t); huCartel(c,x0+W*G.cs/2,G.y0-40,q.name,q.color); });
  // espantapájaros bajo el bancal más pequeño; girasoles junto a la valla de abajo
  const peq=G.Ws[0]<=G.Ws[1]?0:1, xe=G.x[peq]+G.Ws[peq]*G.cs/2, ye=G.y0+G.Ws[peq]*G.cs+92;
  if(ye<b.y+b.h-6) huEspantapajaros(c,xe,ye);
  for(let x=b.x+34;x<b.x+b.w-30;x+=44){ if(Math.abs(x-G.cx)<64||Math.abs(x-xe)<40) continue; const fondo=G.y0+Math.max(...[0,1].filter(k=>x>=G.x[k]-12&&x<=G.x[k]+G.Ws[k]*G.cs+12).map(k=>G.Ws[k]*G.cs),0)+26; if(fondo>b.y+b.h-20) continue; huGirasol(c,x,b.y+b.h-18,0.9,t); }
  // caseta y el robot que va y viene por el camino
  huCaseta(c,G.cx,b.y+140,t);
  const fase=(t*0.12)%2, ida=fase<1, f=ida?fase:2-fase, ry=b.y+178+f*(b.h-230);
  rbRobot(c,G.cx,ry,40,ida?2:0,t,false);
  // valla de estacas con la puerta abajo
  const valla=(x1,y1,x2,y2)=>{ const L=Math.hypot(x2-x1,y2-y1), n=Math.max(1,Math.round(L/22));
    c.strokeStyle='#c99a62'; c.lineWidth=4; c.beginPath(); c.moveTo(x1,y1-6); c.lineTo(x2,y2-6); c.moveTo(x1,y1-16); c.lineTo(x2,y2-16); c.stroke();
    c.fillStyle='#ecd2a4'; for(let k=0;k<=n;k++){ const px=x1+(x2-x1)*k/n, py=y1+(y2-y1)*k/n; roundRect(c,px-4,py-24,8,26,3); c.fill(); } };
  const x1=b.x+10, x2=b.x+b.w-10, y1=b.y+18, y2=b.y+b.h-4;
  valla(x1,y1,x2,y1); valla(x1,y1,x1,y2); valla(x2,y1,x2,y2); valla(x1,y2,G.cx-40,y2); valla(G.cx+40,y2,x2,y2);
  c.fillStyle='#9a6b3f'; for(const gx of [G.cx-44,G.cx+44]){ roundRect(c,gx-6,y2-36,12,40,4); c.fill(); c.fillStyle='#f4c430'; c.beginPath(); c.arc(gx,y2-40,5,0,Math.PI*2); c.fill(); c.fillStyle='#9a6b3f'; }
}
edificio({ id:'huertoVivo', x:AMP.zonas.huerto.x, y:AMP.zonas.huerto.y, w:AMP.zonas.huerto.w, h:AMP.zonas.huerto.h, door:AMP.puertas.huerto,
  otroLado:true, activo:()=>AMPLIO&&huActivo(), dibuja:(c,b)=>huDibujaPueblo(c,b),
  abre:()=>openHuerto(), alcalde:()=>openHuerto(), mapa:{color:'#8a6a3a',etiqueta:'🤖 Huerto'} });
