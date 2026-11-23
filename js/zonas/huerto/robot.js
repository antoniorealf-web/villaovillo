"use strict";
/* =========================================================
   ROBOT DEL HUERTO · motor y generador de retos
   ---------------------------------------------------------
   El robot anda por una cuadrícula del huerto y hace lo que dicen las tarjetas, en orden (como los robots
   programables). Dos formas de mandarle (R.modo):
   - 'flechas' (grupo 6): ⬆️ ➡️ ⬇️ ⬅️ mueven una casilla en esa dirección (el robot se gira solo).
   - 'girar'   (grupo 9): «Avanza» una casilla hacia donde mira, «Gira a la izquierda / derecha» sin moverse.
   Las dos tienen 🌱 Plantar, 💧 Regar, 🧺 Recoger (en la casilla donde está) y 🔁 Repetir (desde el nivel 4 en
   flechas y el 2 en girar). Gana el estado final del huerto, no el programa: vale cualquier programa que lo
   deje todo hecho sin chocar ni equivocarse. Estrellas: tarjetas ≤ R.best → 3; ≤ best+2 → 2; si no, 1.

   Un reto: R = {modo, nivel, w, h, ini:{x,y,d}, cel:[{p:piedra?, t:tarea, c:cultivo}], sol, best, max?}
   d: 0 arriba, 1 derecha, 2 abajo, 3 izquierda.
   Tareas (cel.t): 'sem' semilla marcada (plantar) · 'sw' plantar y regar · 'sed' planta con sed (regar) ·
   'mad' madura (recoger) · 'peq' planta creciendo (no tocar) · null tierra. Durante la ejecución salen además
   'sed2' (recién plantada que pide agua), 'ok' (hecho) y 'hueco' (recogida).
   rbRun(R, prog) → {cel, steps, err, cesta, pend}. Nada aquí guarda en la partida.
   ========================================================= */
const RB_DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const RB_DIR_OP=['U','R','D','L'];
const RB_OPS={
  U:{e:'⬆️',n:'Arriba'}, R:{e:'➡️',n:'Derecha'}, D:{e:'⬇️',n:'Abajo'}, L:{e:'⬅️',n:'Izquierda'},
  F:{e:'👣',n:'Avanza'}, TL:{e:'↩️',n:'Gira izq.'}, TR:{e:'↪️',n:'Gira dcha.'},
  P:{e:'🌱',n:'Plantar'}, W:{e:'💧',n:'Regar'}, H:{e:'🧺',n:'Recoger'}
};
const RB_CULTIVOS=['zanahoria','lechuga','tomate','calabaza'];
const RB_CULT_E={zanahoria:'🥕',lechuga:'🥬',col:'🥦',haba:'🫘',fresa:'🍓',tomate:'🍅',maiz:'🌽',calabaza:'🎃'}; // etiqueta de las semillas
const RB_PEND=['sem','sw','sed','sed2','mad'];
const RB_MAX_NIVEL=10;

function rbCuenta(list){ let c=0; for(const n of list){ c++; if(n.op==='rep') c+=rbCuenta(n.body); } return c; }
function rbClona(o){ return JSON.parse(JSON.stringify(o,(k,v)=>k.startsWith('_')?undefined:v)); }

/* ---------- motor ---------- */
function rbRun(R,prog){
  const cel=R.cel.map(c=>({p:c.p,t:c.t,c:c.c}));
  let x=R.ini.x, y=R.ini.y, d=R.ini.d, err=null, cesta=0; const steps=[], stack=[];
  const exec=list=>{
    for(const n of list){
      if(err) return;
      if(steps.length>400){ err={t:'pasos',node:n}; return; }
      if(n.op==='rep'){ for(let k=0;k<n.n;k++){ stack.push([n,k+1]); exec(n.body); stack.pop(); if(err) return; } continue; }
      const loops=stack.map(s=>s.slice()), o=n.op;
      if(o==='TL'||o==='TR'){ d=(d+(o==='TL'?3:1))%4; steps.push({node:n,x,y,d,loops}); continue; }
      if(o==='F'||o in {U:1,R:1,D:1,L:1}){
        const nd=o==='F'?d:RB_DIR_OP.indexOf(o); d=nd;
        const nx=x+RB_DIRS[nd][0], ny=y+RB_DIRS[nd][1];
        if(nx<0||ny<0||nx>=R.w||ny>=R.h){ err={t:'valla',node:n,x,y,d}; steps.push({node:n,x,y,d,loops,choca:1}); return; }
        if(cel[ny*R.w+nx].p){ err={t:'piedra',node:n,x,y,d}; steps.push({node:n,x,y,d,loops,choca:1}); return; }
        x=nx; y=ny; steps.push({node:n,x,y,d,loops,mv:1}); continue;
      }
      const c=cel[y*R.w+x], t=c.t; let e=null;
      if(o==='P'){ if(t==='sem') c.t='ok'; else if(t==='sw') c.t='sed2'; else e=(t==null||t==='hueco')?'noplantar':'yaplanta'; }
      else if(o==='W'){ if(t==='sed'||t==='sed2') c.t='ok'; else e=(t==='sem'||t==='sw')?'sinplantar':(t==='ok'||t==='peq')?'mojada':(t==='mad')?'madura':'regarnada'; }
      else if(o==='H'){ if(t==='mad'){ c.t='hueco'; cesta++; } else e=(t==='peq'||t==='ok'||t==='sed'||t==='sed2')?'verde':'nadarecoger'; }
      if(e){ err={t:e,node:n,x,y,d}; steps.push({node:n,x,y,d,loops,falla:1}); return; }
      steps.push({node:n,x,y,d,loops,act:o,i:y*R.w+x,t:c.t});
    }
  };
  exec(prog);
  const pend=cel.filter(c=>RB_PEND.includes(c.t)).length;
  return {cel,steps,err,cesta,pend,x,y,d};
}
const RB_ERR={
  valla:'¡Pum! El robot ha chocado con la valla del huerto.',
  piedra:'¡Pum! El robot ha chocado con una piedra. Tiene que rodearla.',
  noplantar:'Ahí no hay semilla marcada: no toca plantar en esa casilla.',
  yaplanta:'¡Ahí ya hay una planta! No se puede plantar encima.',
  sinplantar:'Primero hay que plantar la semilla y después regarla.',
  mojada:'¡Esa planta ya tenía agua! Solo se riegan las que tienen sed 💧.',
  madura:'Esa planta ya está madura: no necesita agua, ¡toca recogerla!',
  regarnada:'Ahí no hay ninguna planta que regar.',
  verde:'¡Esa planta todavía no está madura! Solo se recoge cuando se ve la verdura.',
  nadarecoger:'Ahí no hay nada que recoger.',
  pasos:'¡Uf, el robot no para! Revisa los números de Repetir.'
};
function rbEstrellas(R,n){ return n<=R.best?3:n<=R.best+2?2:1; }
function rbMision(R){
  const k={sem:0,sw:0,sed:0,mad:0}; R.cel.forEach(c=>{ if(c.t in k) k[c.t]++; });
  const t=[]; if(k.sem) t.push(`planta ${k.sem} semilla${k.sem>1?'s':''} 🌱`);
  if(k.sw) t.push(`planta y riega ${k.sw} semilla${k.sw>1?'s':''} 🌱💧`);
  if(k.sed) t.push(`riega ${k.sed} planta${k.sed>1?'s':''} con sed 💧`);
  if(k.mad) t.push(`recoge ${k.mad} verdura${k.mad>1?'s':''} madura${k.mad>1?'s':''} 🧺`);
  const s=t.length>1?t.slice(0,-1).join(', ')+' y '+t[t.length-1]:t[0]||'';
  return s.charAt(0).toUpperCase()+s.slice(1)+'.';
}

/* ---------- comprimir con Repetir (para saber el reto de tarjetas) ---------- */
function rbIgual(a,s1,s2,L){ for(let k=0;k<L;k++) if(a[s1+k]!==a[s2+k]) return false; return true; }
function rbComprime(seq,conRep){
  if(!conRep) return seq.map(op=>({op}));
  let best=null;
  for(let L=1;L<=Math.floor(seq.length/2);L++) for(let s=0;s+2*L<=seq.length;s++){
    let r=1; while(s+(r+1)*L<=seq.length&&rbIgual(seq,s,s+r*L,L)) r++;
    if(r>=2){ const save=r*L-(1+L); if(save>0&&(!best||save>best.save)) best={s,L,r,save}; }
  }
  if(!best) return seq.map(op=>({op}));
  return rbComprime(seq.slice(0,best.s),true)
    .concat([{op:'rep',n:best.r,body:rbComprime(seq.slice(best.s,best.s+best.L),true)}],
            rbComprime(seq.slice(best.s+best.r*best.L),true));
}
/* pasa movimientos absolutos (U R D L) a tarjetas del modo girar, empezando mirando a d */
function rbAGirar(seq,d){
  const out=[];
  for(const o of seq){
    const m=RB_DIR_OP.indexOf(o); if(m<0){ out.push(o); continue; }
    const g=(m-d+4)%4; if(g===1) out.push('TR'); else if(g===3) out.push('TL'); else if(g===2) out.push('TR','TR');
    out.push('F'); d=m;
  }
  return out;
}

/* ---------- niveles ---------- */
/* tpl: plantillas de camino; tipos: tareas posibles; rep: se puede usar Repetir; max: límite de tarjetas;
   peq: plantas creciendo que no se tocan (despistan); alt: tareas alternas en una misma fila */
const RB_NIV={
  flechas:[null,
    {w:3,h:3,tpl:['suelto'],n:1,tipos:['sem'],pied:0},
    {w:3,h:3,tpl:['suelto'],n:2,tipos:['sem','sed'],pied:0},
    {w:4,h:4,tpl:['suelto'],n:3,tipos:['sem','sed','mad'],pied:1},
    {w:4,h:4,tpl:['fila'],n:3,tipos:['sem','sed','mad'],pied:1,rep:1},
    {w:5,h:5,tpl:['fila','esquina'],n:4,tipos:['sem','sed','mad'],pied:2,rep:1},
    {w:5,h:5,tpl:['escalera','esquina','fila'],n:4,tipos:['sem','sed','mad','sw'],pied:2,rep:1,peq:1},
    {w:5,h:5,tpl:['escalera','alterna','esquina'],n:4,tipos:['sem','sed','mad','sw'],pied:2,rep:1,peq:1,max:1},
    {w:6,h:6,tpl:['dosfilas','escalera','alterna'],n:5,tipos:['sem','sed','mad','sw'],pied:3,rep:1,peq:2,max:1},
    {w:6,h:6,tpl:['marco','dosfilas'],n:4,tipos:['sem','sed','mad','sw'],pied:3,rep:1,peq:2,max:1},
    {w:6,h:6,tpl:['marco','dosfilas','escalera'],n:5,tipos:['sem','sed','mad','sw'],pied:4,rep:1,peq:3,max:1}],
  girar:[null,
    {w:4,h:4,tpl:['recto'],n:2,tipos:['sem','sed'],pied:0},
    {w:4,h:4,tpl:['fila'],n:3,tipos:['sem','sed','mad'],pied:1,rep:1},
    {w:4,h:4,tpl:['suelto','esquina'],n:3,tipos:['sem','sed','mad'],pied:1,rep:1},
    {w:5,h:5,tpl:['esquina','fila'],n:4,tipos:['sem','sed','mad'],pied:2,rep:1},
    {w:5,h:5,tpl:['escalera','esquina','alterna'],n:4,tipos:['sem','sed','mad','sw'],pied:2,rep:1,peq:1},
    {w:5,h:5,tpl:['marco','escalera'],n:3,tipos:['sem','sed','mad','sw'],pied:2,rep:1,peq:1,max:1},
    {w:6,h:6,tpl:['marco','dosfilas'],n:4,tipos:['sem','sed','mad','sw'],pied:3,rep:1,peq:2,max:1},
    {w:6,h:6,tpl:['dosfilas','marco','escalera'],n:5,tipos:['sem','sed','mad','sw'],pied:3,rep:1,peq:2,max:1},
    {w:6,h:6,tpl:['marco','escalera','alterna'],n:5,tipos:['sem','sed','mad','sw'],pied:3,rep:1,peq:3,max:1},
    {w:7,h:7,tpl:['marco','dosfilas','escalera'],n:6,tipos:['sem','sed','mad','sw'],pied:4,rep:1,peq:3,max:1}]
};
function rbModoDe(age){ return age<=7?'flechas':'girar'; }
function rbConRepetir(modo,nivel){ return !!(RB_NIV[modo][Math.max(1,Math.min(RB_MAX_NIVEL,nivel))]||{}).rep; }
const RB_ACT={sem:['P'],sw:['P','W'],sed:['W'],mad:['H']};

/* Plantillas: devuelven {x,y,mov:[U/R/D/L…, 'A' = hacer la tarea aquí]} o null si no cabe */
function rbPlantilla(tpl,w,h,n,r){
  const ri=k=>Math.floor(r()*k);
  const D=()=>ri(4);
  const tramo=(dir,k,cadaUno)=>{ const out=[]; for(let i=0;i<k;i++){ out.push(RB_DIR_OP[dir]); if(cadaUno) out.push('A'); } return out; };
  let mov=[], x0, y0;
  if(tpl==='suelto'||tpl==='recto'){
    x0=ri(w); y0=ri(h); return {x:x0,y:y0,mov:null,suelto:true,recto:tpl==='recto'};
  }
  if(tpl==='fila'){ const dir=D(), k=Math.min(n,(dir%2?w:h)-1); mov=tramo(dir,k,true); }
  else if(tpl==='alterna'){ const dir=D(), k=Math.min(n,Math.floor(((dir%2?w:h)-1)/2)); for(let i=0;i<k;i++) mov.push(RB_DIR_OP[dir],RB_DIR_OP[dir],'A'); }
  else if(tpl==='esquina'){ const a=D(), b=(a+(r()<0.5?1:3))%4, k1=Math.max(1,Math.ceil(n/2)), k2=Math.max(1,n-k1); mov=tramo(a,k1,true).concat(tramo(b,k2,true)); }
  else if(tpl==='escalera'){ const a=D(), b=(a+(r()<0.5?1:3))%4, k=Math.min(n,Math.min(w,h)-1); for(let i=0;i<k;i++) mov.push(RB_DIR_OP[a],RB_DIR_OP[b],'A'); }
  else if(tpl==='marco'){ const k=Math.max(2,Math.min(Math.min(w,h)-1,Math.ceil(n/2)+1)), giro=r()<0.5?1:3; let d=D(); for(let s=0;s<4;s++){ mov=mov.concat(tramo(d,k,true)); d=(d+giro)%4; } }
  else if(tpl==='dosfilas'){ const a=D(), b=(a+(r()<0.5?1:3))%4, k=Math.min(n,(a%2?w:h)-1);
    mov=tramo(a,k,true).concat([RB_DIR_OP[b]],tramo((a+2)%4,k,true)); }
  else if(tpl==='serpiente'){ const a=D(), b=(a+(r()<0.5?1:3))%4, k=Math.min(n-1,(a%2?w:h)-1), filas=Math.min(3,(b%2?w:h));
    let d=a; for(let f=0;f<filas;f++){ mov=mov.concat(tramo(d,k,true)); if(f<filas-1){ mov.push(RB_DIR_OP[b]); mov.push('A'); d=(d+2)%4; } } }
  // buscar un inicio donde quepa
  const cabe=(sx,sy)=>{ let x=sx,y=sy; for(const o of mov){ if(o==='A') continue; const m=RB_DIR_OP.indexOf(o); x+=RB_DIRS[m][0]; y+=RB_DIRS[m][1]; if(x<0||y<0||x>=w||y>=h) return false; } return true; };
  const ops=[]; for(let yy=0;yy<h;yy++) for(let xx=0;xx<w;xx++) if(cabe(xx,yy)) ops.push([xx,yy]);
  if(!ops.length) return null;
  const [sx,sy]=ops[ri(ops.length)]; return {x:sx,y:sy,mov};
}

function rbGenera(modo,nivel,seed){
  nivel=Math.max(1,Math.min(RB_MAX_NIVEL,nivel|0||1));
  const L=RB_NIV[modo][nivel], r=rng(String(seed||Math.random()));
  for(let intento=0;intento<60;intento++){
    const R=rbIntenta(modo,nivel,L,r); if(R) return R;
  }
  return rbIntenta(modo,1,RB_NIV[modo][1],r); // nunca debería pasar
}
function rbIntenta(modo,nivel,L,r){
  const ri=k=>Math.floor(r()*k), w=L.w, h=L.h, N=w*h, tpl=L.tpl[ri(L.tpl.length)];
  const cel=Array.from({length:N},()=>({p:0,t:null,c:RB_CULTIVOS[ri(4)]}));
  const P=rbPlantilla(tpl,w,h,L.n,r); if(!P) return null;
  let x=P.x, y=P.y; const visto=new Set([y*w+x]), tareas=[]; let mov=P.mov;
  if(P.suelto){ // tareas sueltas: camino al azar entre ellas, sin pasar por piedras
    for(let k=0;k<L.pied;k++){ const i=ri(N); if(i!==y*w+x) cel[i].p=1; }
    mov=[]; let cx=x, cy=y, d=ri(4);
    for(let t=0;t<L.n;t++){
      const pasos=1+ri(2);
      for(let s=0;s<pasos;s++){
        let ok=false;
        for(let tries=0;tries<8&&!ok;tries++){
          const nd=P.recto?(tries?ri(4):d):ri(4), nx=cx+RB_DIRS[nd][0], ny=cy+RB_DIRS[nd][1];
          if(nx<0||ny<0||nx>=w||ny>=h||cel[ny*w+nx].p) continue;
          if(t>0&&s===0&&tareas.includes(ny*w+nx)) continue;
          mov.push(RB_DIR_OP[nd]); cx=nx; cy=ny; d=nd; ok=true;
        }
        if(!ok) return null;
      }
      if(tareas.includes(cy*w+cx)) return null;
      mov.push('A'); tareas.push(cy*w+cx);
    }
  }
  // recorrer el camino: marcar casillas pisadas y tareas
  const seq=[]; let cx=x, cy=y; const tareaAqui=[];
  const tipoFijo=L.tipos[ri(L.tipos.length)], tipoB=L.tipos[ri(L.tipos.length)];
  let nA=0;
  for(const o of mov){
    if(o==='A'){
      const i=cy*w+cx; if(cel[i].t) return null;
      // en las plantillas repetibles, la misma tarea en todas (o dos alternas en «alterna» de niveles altos)
      const tipo=P.suelto?L.tipos[ri(L.tipos.length)]:(tpl==='alterna'&&nivel>=7&&nA%2?tipoB:tipoFijo);
      cel[i].t=tipo; tareaAqui.push(i); seq.push(...RB_ACT[tipo]); nA++; continue;
    }
    const m=RB_DIR_OP.indexOf(o); cx+=RB_DIRS[m][0]; cy+=RB_DIRS[m][1]; visto.add(cy*w+cx); seq.push(o);
  }
  if(!tareaAqui.length) return null;
  // piedras y plantas creciendo fuera del camino (las piedras, mejor junto al camino)
  const libres=[]; for(let i=0;i<N;i++) if(!visto.has(i)&&!cel[i].t&&!cel[i].p) libres.push(i);
  const cerca=libres.filter(i=>[...visto].some(v=>Math.abs(v%w-i%w)+Math.abs(Math.floor(v/w)-Math.floor(i/w))===1));
  if(!P.suelto) for(let k=0;k<L.pied;k++){ const pool=cerca.filter(i=>!cel[i].p).length?cerca.filter(i=>!cel[i].p):libres.filter(i=>!cel[i].p); if(!pool.length) break; cel[pool[ri(pool.length)]].p=1; }
  for(let k=0;k<(L.peq||0);k++){ const pool=libres.filter(i=>!cel[i].p&&!cel[i].t); if(!pool.length) break; cel[pool[ri(pool.length)]].t='peq'; }
  // dirección inicial: hacia el primer movimiento (en niveles altos de girar, a veces otra)
  const primer=seq.find(o=>RB_DIR_OP.includes(o)); let d0=primer?RB_DIR_OP.indexOf(primer):ri(4);
  if(modo==='girar'&&nivel>=5&&r()<0.4) d0=(d0+(r()<0.5?1:3))%4;
  const ops=modo==='girar'?rbAGirar(seq,d0):seq;
  // girar: un giro de sobra al final no cambia el huerto y a veces deja repetir el bloque entero
  let sol=rbComprime(ops,!!L.rep);
  if(modo==='girar'&&L.rep) for(const extra of [['TL'],['TR'],['TL','TL']]){ const s2=rbComprime(ops.concat(extra),true); if(rbCuenta(s2)<rbCuenta(sol)) sol=s2; }
  const best=rbCuenta(sol);
  const R={modo,nivel,w,h,ini:{x,y,d:d0},cel,sol,best,tpl};
  if(L.max) R.max=best+1;
  const chk=rbRun(R,sol); if(chk.err||chk.pend) return null;
  return R;
}
