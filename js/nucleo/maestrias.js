"use strict";
/* =========================================================
   MAESTRÍAS POR ÁREA y PUENTE DE LÍA
   ========================================================= */
const MAST={
  telar:{e:'🧶',n:'Telar',th:[0,5,15,30,50,80,120,170,230,300],t:['Aprendiz','Hiladora','Tejedora','Bordadora','Tejedora experta','Maestra del telar','Gran maestra','Programadora del telar','Leyenda del telar','Reina del telar'],u:'encargos del telar'},
  pan:{e:'🥐',n:'Panadería',th:[0,10,30,60,100,160,240,340,460,600],t:['Pinche','Ayudante de horno','Amasadora','Repostera','Panadera','Pastelera','Panadera experta','Maestra panadera','Gran maestra panadera','Reina del horno'],u:'problemas de mates'},
  bib:{e:'🦉',n:'Biblioteca',th:[0,8,24,48,80,130,190,260,340,440],t:['Lectora','Curiosa','Exploradora','Estudiosa','Sabia','Gran sabia','Maestra sabia','Erudita','Leyenda de la biblioteca','Reina del saber'],u:'preguntas de repaso'}
};
const MAST_UNLOCK={
  telar:{3:'🛖 Cabaña en la tienda',4:'⛺ Tienda de campaña en la tienda',6:'🤖 Huerto del robot (al otro lado del río)',7:'🎡 Noria en la tienda'},
  pan:{2:'🐝 Colmena en la tienda · problemas nuevos',3:'🧺 Cesta de picnic en la tienda',4:'Problemas más difíciles',5:'🎠 Tiovivo en la tienda'},
  bib:{2:'🎐 Campanilla en la tienda',3:'⛲ Fuente en la tienda',6:'🔭 Laboratorio (al otro lado del río)'}
};
const ZONE_REQ={huerto:['telar',6],lab:['bib',6]};
const BRIDGE_GOAL=400;
function mLevel(p,a){ const n=(p.mastery&&p.mastery[a])||0, th=MAST[a].th; let l=0; while(l<th.length&&n>=th[l]) l++; return l; }
function mProgress(p,a){ const n=(p.mastery&&p.mastery[a])||0, l=mLevel(p,a), th=MAST[a].th; if(l>=th.length) return 1; return (n-th[l-1])/(th[l]-th[l-1]); }
function mTitle(p,a){ return MAST[a].t[mLevel(p,a)-1]; }
function villageLevel(p){ return mLevel(p,'telar')+mLevel(p,'pan')+mLevel(p,'bib'); }
let masteryQueue=[];
function addMastery(p,a,n=1){
  p.mastery=p.mastery||{telar:0,pan:0,bib:0};
  const before=mLevel(p,a); p.mastery[a]=(p.mastery[a]||0)+n; const after=mLevel(p,a);
  for(let l=before+1;l<=after;l++){ const c=5*l; p.coins+=c; p.counters.earned+=c; p.beads.push('c:'+MAST[a].e); masteryQueue.push([a,l]); addNews(p,MAST[a].e,`ha llegado a ${MAST[a].n} ${l}: ${MAST[a].t[l-1]}`); }
}
async function showRankUps(){
  while(masteryQueue.length){
    const [a,l]=masteryQueue.shift(), M=MAST[a]; sfxLevel();
    const un=MAST_UNLOCK[a][l]; const nx=l<M.th.length?`Siguiente: ${M.t[l]} (${M.th[l]} ${M.u})`:'¡Has llegado a lo más alto!';
    await say({center:true,html:`<div class="reward"><div style="font-size:60px">${M.e}</div><div style="font-size:26px;font-weight:800">¡${M.n} nivel ${l}: ${M.t[l-1]}!</div><div class="rw-items"><div class="rw-item">🔘 +${5*l} botones</div><div class="rw-item">${M.e} dije para tu pulsera</div>${un?`<div class="rw-item">🔓 ${un}</div>`:''}</div><div style="font-size:16px;color:var(--soft)">${nx}</div></div>`,buttons:[{t:'¡Bien!',cls:'primary'}]});
    speakAuto(`${M.n}, nivel ${l}: ${M.t[l-1]}`);
  }
}
function addXP(p,n){ if(n) p.xp=(p.xp||0)+n; }
function rankProgress(p){ return mProgress(p,'telar'); }
function shopReq(s){ return {colmena:['pan',2],cesta:['pan',3],campanilla:['bib',2],fuente:['bib',3],caseta:['telar',3],tienda:['telar',4],tiovivo:['pan',5],noria:['telar',7]}[s.k]||null; }
/* ---- puente ---- */
function bridgeTotal(){ return DB.profiles.filter(Boolean).reduce((a,p)=>a+(p.bridge||0),0); }
function bridgeDone(){ return bridgeTotal()>=BRIDGE_GOAL; }
async function openBridge(){
  const p=P(), tot=bridgeTotal();
  if(bridgeDone()){ say({face:'🦦',name:NPCS.lia.n,text:'¡El puente está terminado gracias a vosotras! Ya podéis cruzar el río.'}); return; }
  const parts=DB.profiles.filter(Boolean).map(q=>`<div class="rw-item">${esc(q.name)}: 🔘 ${q.bridge||0}</div>`).join('');
  const pct=Math.round(tot/BRIDGE_GOAL*100);
  const r=await say({face:'🦦',name:NPCS.lia.n,speak:false,text:'¡Estoy construyendo un puente para cruzar el río! Necesito botones para comprar madera. Si aportáis entre las dos, ¡lo terminaremos antes!',
    html:`<div class="pbar" style="height:18px"><i style="width:${pct}%"></i></div><div style="font-size:18px;font-weight:800;margin:6px 0">🔘 ${tot} de ${BRIDGE_GOAL} botones</div><div class="rw-items">${parts}</div><div class="counter">Tú tienes 🔘 ${p.coins}</div>`,
    buttons:[{t:'Ahora no'},{t:'Aportar 10',cls:'green'},{t:'Aportar 50',cls:'green'},{t:'Aportar lo que falta',cls:'primary'}]});
  if(r===0) return;
  const want=r===1?10:r===2?50:BRIDGE_GOAL-tot; const give=Math.min(want,p.coins,BRIDGE_GOAL-tot);
  if(give<=0){ toast('No tienes botones suficientes. ¡Completa encargos!'); return; }
  p.coins-=give; p.bridge=(p.bridge||0)+give; addNews(p,'🪵',`ha puesto ${give} botones en el puente de Lía`); if(bridgeTotal()>=BRIDGE_GOAL) addNews(p,'🌉','ha terminado el puente. ¡Ya se puede cruzar el río!'); save(`Aportó ${give} botones al puente`); [500,650,800].forEach((f,i)=>setTimeout(()=>beep(f,0.08,'triangle',0.05),i*90));
  if(bridgeDone()){ fanfare(); await say({center:true,html:`<div class="reward"><div style="font-size:60px">🌉</div><div style="font-size:28px;font-weight:800">¡Puente terminado!</div><div style="font-size:18px">Lía: «¡Gracias, ${esc(p.name)}! Ya se puede cruzar al otro lado del río.»</div></div>`}); }
  else toast(`🪵 ¡Gracias! El puente va por ${bridgeTotal()} de ${BRIDGE_GOAL}`);
  updateHUD();
}
function drawBridgeX(c){
  const pr=Math.min(1,bridgeTotal()/BRIDGE_GOAL);
  const x0=1860,x1=1972,y=800;
  if(pr<=0){ signX(c,1830,760,'🚧 Puente'); return; }
  for(const px of [x0+6,x0+40,x0+74,x1-6]){ roundRect(c,px-4,y-6,8,64,3); c.fillStyle='#8a5a36'; c.fill(); ol(c,2); }
  const planks=Math.floor(pr*10);
  for(let i=0;i<planks;i++){ roundRect(c,x0+i*11.2,y+2,11,52,2); c.fillStyle=i%2?'#c98f5a':'#b97a48'; c.fill(); ol(c,1.6); }
  if(pr>=1){ c.strokeStyle=OUT; c.lineWidth=4; c.beginPath(); c.moveTo(x0,y); c.quadraticCurveTo((x0+x1)/2,y-14,x1,y); c.moveTo(x0,y+56); c.quadraticCurveTo((x0+x1)/2,y+42,x1,y+56); c.stroke(); c.strokeStyle='#c98f5a'; c.lineWidth=2; c.stroke(); }
  else { signX(c,1830,760,`🚧 ${Math.round(pr*100)}%`); }
}
function zoneMsg(z){
  const [a,l]=ZONE_REQ[z], p=P(), M=MAST[a];
  if(!bridgeDone()) return say({face:'🦦',name:NPCS.lia.n,text:'Primero hay que terminar el puente. ¡Tócame junto al río para ayudarme!'});
  if(mLevel(p,a)<l) return say({face:z==='huerto'?'🤖':'🦉',name:z==='huerto'?'Hilo':'Sabina',text:`Para entrar aquí necesitas ${M.n} nivel ${l} (${M.t[l-1]}). Ahora tienes nivel ${mLevel(p,a)}. ¡Sigue practicando!`});
  return say({face:z==='huerto'?'🤖':'🦉',name:z==='huerto'?'Hilo':'Sabina',text:'¡Ya tienes el nivel! Estamos terminando de prepararlo. ¡Muy pronto podrás entrar!'});
}
function renderMasteryTab(body,p){
  const g=el('div','medgrid');
  Object.entries(MAST).forEach(([a,M])=>{
    const l=mLevel(p,a), n=(p.mastery&&p.mastery[a])||0; const next=l<M.th.length?`${n} / ${M.th[l]} ${M.u} para «${M.t[l]}»`:'¡Nivel máximo!';
    const un=Object.entries(MAST_UNLOCK[a]).map(([lv,t])=>`<div class="md">${+lv<=l?'✅':'🔒'} Nivel ${lv}: ${esc(t)}</div>`).join('');
    const c=el('div','medal'); c.style.alignItems='flex-start';
    c.innerHTML=`<div class="me">${M.e}</div><div style="flex:1"><div class="mn">${M.n} · nivel ${l}</div><div class="md"><b>${M.t[l-1]}</b></div><div class="pbar"><i style="width:${Math.round(mProgress(p,a)*100)}%"></i></div><div class="md">${next}</div>${un}</div>`;
    g.append(c);
  });
  const br=el('div','medal'); br.innerHTML=`<div class="me">🌉</div><div style="flex:1"><div class="mn">Puente del río</div><div class="pbar"><i style="width:${Math.round(Math.min(1,bridgeTotal()/BRIDGE_GOAL)*100)}%"></i></div><div class="md">🔘 ${bridgeTotal()} / ${BRIDGE_GOAL} entre las dos</div></div>`; g.append(br);
  body.append(g);
}

function zoneReqText(z){ const [a,l]=ZONE_REQ[z], p=P(); if(!bridgeDone()) return '🌉 Falta terminar el puente'; return mLevel(p,a)>=l?'¡Muy pronto!':`${MAST[a].e} ${MAST[a].n} nivel ${l}`; }
$('#hud-name').style.cursor='pointer'; $('#hud-name').onclick=()=>openBook('maestrias');
