"use strict";
/* =========================================================
   ESTADÍSTICAS Y TIEMPO DE JUEGO
   ========================================================= */
/* Registro diario: p.log[fecha] = {t,p,b:[hechos,bien], ta, ty:{tipo:n}, cu:[cuadernos], e:botones ganados acumulados, m:[maestrías acumuladas]} */
function touchLog(p){
  p.log=p.log||{}; const d=today(); const L=p.log[d]=p.log[d]||{};
  L.e=p.counters.earned||0; const M=p.mastery||{}; L.m=[M.telar||0,M.pan||0,M.bib||0]; return L;
}
function logAct(p,area,n,ok,extra){
  const L=touchLog(p);
  if(area==='ta'){ L.ta=(L.ta||0)+n; return; }
  const a=L[area]=L[area]||[0,0]; a[0]+=n; a[1]+=ok;
  if(area==='t'&&extra){ L.ty=L.ty||{}; L.ty[extra]=(L.ty[extra]||0)+1; }
  if(area==='b'&&extra){ L.cu=L.cu||[]; if(!L.cu.includes(extra)) L.cu.push(extra); }
}
function recordStats(p,id,stars,type){
  const st=p.stats[id]||{tries:0,hints:0,plays:0,best:0,secs:0}; st.type=type||st.type;
  st.tries+=PZ.attempts; st.hints+=PZ.hints||0; st.plays++; st.best=Math.max(st.best,stars);
  st.secs+=Math.round((Date.now()-PZ.t0)/1000); if(st.firstTry===undefined) st.firstTry=(PZ.attempts<=1); st.last=today();
  p.stats[id]=st;
}
let playTicks=0;
let lastInput=Date.now();
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{ lastInput=Date.now(); },{capture:true,passive:true}));
function startPlayClock(){
  setInterval(()=>{
    const p=P(); if(!p||VISIT||['profiles','alcalde','ficha','catalog'].includes(curScreen)||document.hidden) return;
    if(Date.now()-lastInput>60000) return; // nadie toca la tablet desde hace más de un minuto: no cuenta
    if(p.days.last!==today() && curScreen==='village' && !$('#dlg').classList.contains('on')) newDayCheck();
    const d=today(); p.play[d]=(p.play[d]||0)+15; touchLog(p); p.updatedAt=Date.now(); saveQuiet();
    if(++playTicks%20===0) scheduleCloud();
  },15000);
  setInterval(()=>{ if(P()&&curScreen!=='profiles') cloudPull('others'); },60000);
}
