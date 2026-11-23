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
   - Modo: 'flechas' (grupo 6) o 'girar' (grupo 9). El paso de flechas a girar lo decide papá en el modo
     alcalde: cuando Cintia domina el nivel 10 de flechas, se le avisa (H.listo).
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
  const ops=modo==='girar'?rbAGirar(seq,1):seq;
  let sol=rbComprime(ops,conRep);
  if(modo==='girar'&&conRep) for(const extra of [['TL'],['TR'],['TL','TL']]){ const s2=rbComprime(ops.concat(extra),true); if(rbCuenta(s2)<rbCuenta(sol)) sol=s2; }
  const R={modo,nivel:niv,w:W,h:W,ini:{x:0,y:0,d:1},cel,sol,best:rbCuenta(sol),trabajo:true};
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
  const ks=Object.keys(cosecha);
  if(ks.length&&H.tot.cos===ks.reduce((a,k)=>a+cosecha[k],0)) addNews(p,'🧺','ha recogido su primera cosecha en el huerto del robot');
  save('Trabajo del huerto'+(ks.length?': recogió '+ks.map(k=>cosecha[k]+' '+HU_CULT[k].np).join(', '):''));
  return (coins?`🔘 +${coins} botones.`:'')+(ks.length?' 🧺 A la cesta: '+ks.map(k=>HU_CULT[k].e+'×'+cosecha[k]).join(' ')+'.':'');
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
  modo(p,v){ if(v!=='flechas'&&v!=='girar') return false; const H=huIni(p); if(H.modo!==v){ H.modo=v; H.niv=1; H.run=0; } H.listo=null; return true; }
};
HU_DEF.alcalde=function(box){
  const b=box('🤖 Huerto del robot');
  b.append(el('div','counter',`Cada niña tiene su parcela (se abre con el puente y Telar nivel ${ZONE_REQ.huerto[1]}). El nivel del robot sube y baja solo; aquí puedes cambiarlo y decidir cuándo pasa de flechas a girar.`));
  DB.profiles.filter(Boolean).forEach(q=>{
    const H=huLee(q), card=el('div','panel'); card.style.cssText='margin:10px 0;background:#f4fbef';
    card.append(el('div','wsec',esc(q.name)));
    if(!huAbierta(q)) card.append(el('div','counter',`🔒 Parcela cerrada: Telar nivel ${mLevel(q,'telar')} de ${ZONE_REQ.huerto[1]}${bridgeDone()?'':' · falta el puente'}.`));
    if(!H){ card.append(el('div','counter','Todavía no ha entrado en su parcela.')); b.append(card); return; }
    const n=huCuenta(H), Rt=huRetosHoy(H), ces=Object.keys(H.cesta||{}).filter(k=>H.cesta[k]);
    card.append(el('div','',`<b>${H.modo==='flechas'?'⬆️ Flechas':'↪️ Girar'} · nivel ${H.niv}</b> · retos de hoy: ${Rt.est.filter(Boolean).length}/${HU_RETOS} ${Rt.est.map(s=>s?'★'.repeat(s):'').filter(Boolean).join(' ')}`));
    card.append(el('div','counter',`Parcela: ${n.sem} sembradas · ${n.sed} con sed · ${n.regada} regadas hoy · ${n.mad} maduras · total: ${H.tot.retos} retos (${H.tot.perf} perfectos), ${H.tot.cos} verduras recogidas`));
    card.append(el('div','counter','🧺 Cesta: '+(ces.length?ces.map(k=>HU_CULT[k].e+' '+H.cesta[k]).join(' · '):'vacía')));
    if(H.listo==='girar'&&H.modo==='flechas') card.append(el('div','',`<div style="background:#fff3cf;border-radius:12px;padding:8px 10px;margin:6px 0">💡 <b>${esc(q.name)} domina las flechas.</b> ¿Pasa a girar (avanza y gira, como Berta)? Empezaría en el nivel 1 de girar.</div>`));
    const row=el('div'); row.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px';
    const nv=el('select','inputline'); nv.style.cssText='width:auto;font-size:16px;min-height:42px';
    for(let k=1;k<=RB_MAX_NIVEL;k++){ const o=document.createElement('option'); o.value=k; o.textContent='Nivel '+k; if(k===H.niv) o.selected=true; nv.append(o); }
    const bn=el('button','btn','Cambiar nivel'); bn.onclick=async()=>{ if(await alcHaz(q.id,'paq',{id:'huerto',campo:'niv',valor:+nv.value},'Robot de '+q.name+': nivel '+nv.value)){ toast('Nivel del robot cambiado'); renderAlcalde(); } };
    const otro=H.modo==='flechas'?'girar':'flechas';
    const bm=el('button','btn '+(H.listo?'green':''),otro==='girar'?'↪️ Pasar a girar':'⬆️ Volver a flechas'); bm.onclick=async()=>{ if(await alcHaz(q.id,'paq',{id:'huerto',campo:'modo',valor:otro},'Robot de '+q.name+': '+otro)){ toast('Cambiado: el robot de '+q.name+' usa '+otro); renderAlcalde(); } };
    row.append(nv,bn,bm); card.append(row);
    b.append(card);
  });
};

/* ---------- en el pueblo: el huerto con las dos parcelas ---------- */
function huParcelaRect(b,lado,W){ const cs=50, y0=b.y+70; return lado===0?{x:b.x+26,y:y0,cs}:{x:b.x+b.w-26-W*cs,y:y0,cs}; }
function huDibujaParcela(c,q,x0,y0,cs,t){
  const H=huLee(q), W=H?H.W:huTam(q), abierta=huAbierta(q);
  const cel=H?huCeldas(H):Array(W*W).fill(0).map(()=>({p:0,t:null}));
  for(let i=0;i<W*W;i++) rbCasilla(c,{w:W,h:W},cel,i,x0,y0,cs,t,false);
  if(!abierta){ c.fillStyle='rgba(255,250,240,.55)'; roundRect(c,x0,y0,W*cs,W*cs,10); c.fill(); c.font=`${cs*0.7}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('🔒',x0+W*cs/2,y0+W*cs/2); }
}
function huDibujaPueblo(c,b){
  c.fillStyle='#9fd583'; roundRect(c,b.x,b.y,b.w,b.h,26); c.fill();
  c.strokeStyle='#b07a45'; c.lineWidth=7; roundRect(c,b.x+6,b.y+6,b.w-12,b.h-12,22); c.stroke();
  c.fillStyle='#c99560'; for(let x=b.x+20;x<b.x+b.w-10;x+=46){ roundRect(c,x,b.y,9,16,3); c.fill(); }
  // puerta (hueco en la valla)
  c.fillStyle='#9fd583'; c.fillRect(b.x+b.w/2-34,b.y+b.h-16,68,18);
  const ps=DB.profiles;
  [0,1].forEach(lado=>{ const q=ps[lado]; if(!q) return; const W=(huLee(q)||{}).W||huTam(q), r=huParcelaRect(b,lado,W);
    huDibujaParcela(c,q,r.x,r.y,r.cs,tGlobal);
    signX(c,r.x+W*r.cs/2,r.y-30,'🌱 '+q.name); });
  // caseta del robot, en el hueco entre las dos parcelas
  const Wa=ps[0]?((huLee(ps[0])||{}).W||huTam(ps[0])):4, Wb=ps[1]?((huLee(ps[1])||{}).W||huTam(ps[1])):4;
  const ra=huParcelaRect(b,0,Wa), rb=huParcelaRect(b,1,Wb), sx=(ra.x+Wa*ra.cs+rb.x)/2, sy=b.y+b.h-64;
  c.fillStyle='#e9d3a8'; roundRect(c,sx-28,sy-30,56,48,8); c.fill(); c.fillStyle='#d9534f'; c.beginPath(); c.moveTo(sx-36,sy-26); c.lineTo(sx,sy-58); c.lineTo(sx+36,sy-26); c.closePath(); c.fill();
  c.fillStyle='#7a5a2f'; roundRect(c,sx-11,sy-6,22,24,5); c.fill();
  rbRobot(c,sx,sy+30,44,2,tGlobal,false);
}
edificio({ id:'huertoVivo', x:AMP.zonas.huerto.x, y:AMP.zonas.huerto.y, w:AMP.zonas.huerto.w, h:AMP.zonas.huerto.h, door:AMP.puertas.huerto,
  otroLado:true, activo:()=>AMPLIO&&huActivo(), dibuja:(c,b)=>huDibujaPueblo(c,b),
  abre:()=>openHuerto(), alcalde:()=>openHuerto(), mapa:{color:'#8a6a3a',etiqueta:'🤖 Huerto'} });
