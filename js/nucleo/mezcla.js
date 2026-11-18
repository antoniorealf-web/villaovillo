"use strict";
/* =========================================================
   PUEBLO EN VARIAS TABLETS
   Cada tablet tiene su copia de lo común del pueblo (cartas y tareas, notas del tablón, logros,
   buzón de ideas, tareas que se repiten, ajustes) y la sube a pueblo.json.
   Antes, la última en subir pisaba a la otra. Ahora, al recoger pueblo.json, cada tablet lo JUNTA
   con lo suyo (mezclaPueblo) y no se borra nada de nadie.
   Las órdenes del alcalde que una tablet aplica se apuntan en DB.ordHechas (viaja en pueblo.json);
   la otra tablet las ve y las aplica también (todas se pueden aplicar dos veces sin efecto).
   Lo que cambia la partida de una niña (ajustes, notas de su pizarra) solo lo sube a la nube
   la tablet donde esa niña jugó por última vez (p.dev), para no pisar su progreso con una copia vieja.
   ========================================================= */
function devId(){ try{ let d=localStorage.getItem('villaovillo.dispositivo'); if(!d){ d='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); localStorage.setItem('villaovillo.dispositivo',d); } return d; }catch(e){ return 'd0'; } }
const MSG_RANGO={nuevo:0,pendiente:0,aceptada:1,hecha:2,validada:3,leida:4,cobrada:4,completado:4,caducada:5,borrada:6};
function unePorId(loc,rem,key,elige){ const m=new Map(); (loc||[]).forEach(x=>{ if(x&&x[key]!=null) m.set(x[key],x); }); (Array.isArray(rem)?rem:[]).forEach(x=>{ if(!x||x[key]==null) return; const a=m.get(x[key]); m.set(x[key],a?elige(a,x):x); }); return [...m.values()]; }
function mezclaPueblo(pu){
  if(!pu||typeof pu!=='object') return false;
  const antes=JSON.stringify(puebloDatos());
  // notas del tablón: historial primero (dice cuáles se quitaron o sustituyeron)
  DB.notasHist=unePorId(DB.notasHist,pu.notasHist,'id',(a,b)=>a.fin?a:b.fin?b:a).sort((a,b)=>(a.t||0)-(b.t||0)).slice(-300);
  const fin=new Set(DB.notasHist.filter(h=>h.fin).map(h=>h.id));
  let N=unePorId(DB.boardMsgs,pu.boardMsgs,'id',a=>a).filter(n=>!fin.has(n.id)).sort((a,b)=>(a.t||0)-(b.t||0));
  const visto=new Set(), quedan=[];
  for(let i=N.length-1;i>=0;i--){ const k=N[i].fromId||N[i].from; if(visto.has(k)){ corkHistMarca(N[i],'sustituida'); continue; } visto.add(k); quedan.unshift(N[i]); }
  DB.boardMsgs=quedan;
  // cartas y tareas: gana el estado más avanzado
  const masAvanzada=(a,b)=>(MSG_RANGO[b.estado]||0)>(MSG_RANGO[a.estado]||0)?b:a;
  let M=unePorId(DB.localMsgs,pu.localMsgs,'id',masAvanzada);
  // la tarea que se repite de un mismo día solo una vez por niña, aunque la hayan creado las dos tablets
  const rk=m=>m.rid&&m.day?m.rid+'|'+m.day+'|'+m.para:'id|'+m.id;
  const g=new Map(); M.forEach(m=>{ const k=rk(m), x=g.get(k); g.set(k,x?masAvanzada(x,m):m); }); M=[...g.values()];
  DB.localMsgs=M.sort((a,b)=>(a.t||0)-(b.t||0)).slice(-200);
  // buzón de ideas
  DB.sugs=unePorId(DB.sugs,pu.sugs,'id',(a,b)=>Object.assign({},a,{leida:!!(a.leida||b.leida),resp:a.resp||b.resp})).sort((a,b)=>(a.t||0)-(b.t||0)).slice(-100);
  // logros
  const nk=n=>(n.t||0)+'|'+(n.pid||'')+'|'+(n.txt||'');
  DB.news=unePorId((DB.news||[]).map(n=>Object.assign(n,{_k:nk(n)})),(Array.isArray(pu.news)?pu.news:[]).map(n=>Object.assign({},n,{_k:nk(n)})),'_k',a=>a).sort((a,b)=>(a.t||0)-(b.t||0)).slice(-60);
  DB.news.forEach(n=>delete n._k);
  // tareas que se repiten (las borradas no vuelven)
  DB.recBorradas=[...new Set((DB.recBorradas||[]).concat(Array.isArray(pu.recBorradas)?pu.recBorradas:[]))].slice(-100);
  const rb=new Set(DB.recBorradas);
  DB.recTasks=unePorId(DB.recTasks,pu.recTasks,'rid',a=>a).filter(r=>!rb.has(r.rid));
  // ajustes del pueblo: gana el cambio más reciente
  if((+pu.ajT||0)>(+DB.ajT||0)){ if(pu.dayMode) DB.dayMode=pu.dayMode; DB.paqForce=pu.paqForce||{}; DB.ajT=+pu.ajT; try{ nightCache.t=0; }catch(e){} }
  // órdenes ya aplicadas en otra tablet
  DB.ordHechas=unePorId(DB.ordHechas,pu.ordHechas,'id',a=>a).sort((a,b)=>String(a.fecha||'').localeCompare(String(b.fecha||''))).slice(-150);
  return JSON.stringify(puebloDatos())!==antes;
}
/* Apunta una orden aplicada para que la vean las demás tablets. */
function ordApunta(o){ DB.ordHechas=DB.ordHechas||[]; DB.ordVistas=DB.ordVistas||[];
  if(!DB.ordHechas.some(x=>x.id===o.id)) DB.ordHechas.push({id:o.id,para:o.para,tipo:o.tipo,dato:o.dato,fecha:o.fecha||new Date().toISOString()});
  if(DB.ordHechas.length>150) DB.ordHechas.splice(0,DB.ordHechas.length-150);
  if(!DB.ordVistas.includes(o.id)) DB.ordVistas.push(o.id); if(DB.ordVistas.length>400) DB.ordVistas.splice(0,DB.ordVistas.length-400); }
const ORD_NINA=['set','pizNota','pizDel'];
/* Aplica una orden en esta tablet. Devuelve {r, subir}: r como aplicaOrden; subir = partida que hay que subir. */
function ordAplicaAqui(o){
  DB.ordVistas=DB.ordVistas||[];
  const pid=(o.para!=='pueblo'&&o.para!=='todas')?o.para:null, p=pid?DB.profiles.find(q=>q&&q.id===pid):null;
  if(pid&&ORD_NINA.includes(o.tipo)){
    if(!p) return {r:null};
    p.ords=p.ords||[]; const casa=p.dev===devId(), sinCasa=!p.dev;
    if(p.ords.includes(o.id)||(!casa&&!sinCasa&&DB.ordVistas.includes(o.id))) return {r:true,ya:true};
    const t0=p.updatedAt; let r; try{ r=aplicaOrden(o); }catch(e){ r=false; }
    if(r===null) return {r:null};
    ordApunta(o);
    if(casa||sinCasa){ p.ords.push(o.id); if(p.ords.length>100) p.ords.splice(0,p.ords.length-100); }
    if(casa) return {r,subir:p};
    p.updatedAt=t0; return {r}; // en otra tablet: se ve aquí, pero la sube la tablet donde juega
  }
  if(DB.ordVistas.includes(o.id)) return {r:true,ya:true};
  let r; try{ r=aplicaOrden(o); }catch(e){ r=false; }
  if(r===null) return {r:null};
  if(o.tipo==='recDel'){ DB.recBorradas=DB.recBorradas||[]; if(!DB.recBorradas.includes(o.dato&&o.dato.rid)) DB.recBorradas.push(o.dato&&o.dato.rid); }
  if(o.para==='pueblo'&&o.tipo==='set') DB.ajT=Date.now();
  ordApunta(o); return {r};
}
