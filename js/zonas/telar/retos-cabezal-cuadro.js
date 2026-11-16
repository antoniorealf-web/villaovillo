/* =========================================================
   NUEVOS RETOS: CABEZAL PROGRAMABLE y CUADRO MÁGICO
   ========================================================= */
const CAB_OPS={p:{e:'➡️',n:'Tejer'},s:{e:'⏭️',n:'Saltar'},n:{e:'⤵️',n:'Bajar fila'}};
function countNodes(list){ let c=0; for(const n of list){ c++; if(n.op==='rep') c+=countNodes(n.body); } return c; }
function runCab(prog,w,h){
  const grid=Array(w*h).fill(null); let x=0,y=0,col=null; const steps=[]; let err=null;
  const stack=[];
  const exec=list=>{
    for(const n of list){
      if(err) return;
      if(steps.length>800){ err={t:'pasos'}; return; }
      if(n.op==='rep'){ for(let k=0;k<n.n;k++){ stack.push([n,k+1]); exec(n.body); stack.pop(); if(err) return; } continue; }
      const loops=stack.map(s=>s.slice());
      if(n.op==='c'){ col=n.v; steps.push({node:n,x,y,loops}); }
      else if(n.op==='n'){ y++; x=0; steps.push({node:n,x,y,loops}); }
      else {
        if(y>=h){ err={t:'abajo',node:n}; return; }
        if(x>=w){ err={t:'derecha',node:n,y}; return; }
        if(n.op==='p'){ if(!col){ err={t:'sinhilo',node:n}; return; } grid[y*w+x]=col; }
        steps.push({node:n,x,y,i:y*w+x,put:n.op==='p'?col:null,loops}); x++;
      }
    }
  };
  exec(prog); return {grid,steps,err};
}
function cabRuns(row){ const r=[]; for(const c of row){ if(r.length&&r[r.length-1][0]===c) r[r.length-1][1]++; else r.push([c,1]); } return r; }
function cabCanon(t,w,h){
  const groups=[];
  for(let y=0;y<h;y++){ const row=t.slice(y*w,(y+1)*w), key=row.join(','); const g=groups[groups.length-1]; if(g&&g.key===key) g.k++; else groups.push({key,row,k:1}); }
  const prog=[];
  groups.forEach((g,gi)=>{
    const body=[];
    cabRuns(g.row).forEach(([c,len])=>{ if(c) body.push({op:'c',v:c}); const op=c?'p':'s'; if(len>=3) body.push({op:'rep',n:len,body:[{op}]}); else for(let i=0;i<len;i++) body.push({op}); });
    if(g.k>=2) prog.push({op:'rep',n:g.k,body:body.concat([{op:'n'}])});
    else { prog.push(...body); if(gi<groups.length-1) prog.push({op:'n'}); }
  });
  return prog;
}
function genCabDesign(R,small,tier){
  const ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pk=a=>a[Math.floor(R()*a.length)];
  const cols=shuffle(COLOR_KEYS.slice(),R);
  let w,h,t=[];
  if(tier===1){
    w=small?ri(3,4):ri(4,6); h=small?2:ri(2,3);
    for(let y=0;y<h;y++){ const a=cols[ri(0,2)], b=cols[ri(0,3)], cut=ri(1,w); for(let x=0;x<w;x++) t.push(x<cut?a:b); }
  } else {
    w=small?ri(4,5):ri(6,8); h=small?ri(3,4):ri(4,6);
    const fam=pk(small?['bandas','rayas','marco']:['bandas','rayas','marco','mixto']);
    const A=cols[0],B=cols[1],C=cols[2];
    if(fam==='bandas'){ const k=ri(1,2); for(let y=0;y<h;y++){ const c=[A,B,C][Math.floor(y/k)%3]; for(let x=0;x<w;x++) t.push(c); } }
    else if(fam==='rayas'){ const k=ri(1,2); for(let y=0;y<h;y++) for(let x=0;x<w;x++) t.push([A,B][Math.floor(x/k)%2]); }
    else if(fam==='marco'){ for(let y=0;y<h;y++) for(let x=0;x<w;x++) t.push((y===0||y===h-1||x===0||x===w-1)?A:B); }
    else { for(let y=0;y<h;y++) for(let x=0;x<w;x++) t.push(y===0||y===h-1?C:[A,B][Math.floor(x/2)%2]); }
  }
  return {w,h,t};
}

/* ---------- cuadro mágico (sudoku de colores) ---------- */
function cuaOk(g,n,box,i,v){
  const r=Math.floor(i/n), c=i%n;
  for(let k=0;k<n;k++){ if(g[r*n+k]===v&&r*n+k!==i) return false; if(g[k*n+c]===v&&k*n+c!==i) return false; }
  if(box){ const br=r-r%2, bc=c-c%2; for(let a=0;a<2;a++) for(let b=0;b<2;b++){ const j=(br+a)*n+bc+b; if(j!==i&&g[j]===v) return false; } }
  return true;
}
function cuaCount(g,n,box,syms,limit=2){
  const i=g.indexOf(null); if(i<0) return 1; let c=0;
  for(const v of syms){ if(cuaOk(g,n,box,i,v)){ g[i]=v; c+=cuaCount(g,n,box,syms,limit); g[i]=null; if(c>=limit) return c; } }
  return c;
}
function genCua(R,small){
  const n=small?3:4, box=!small, syms=shuffle(COLOR_KEYS.slice(),R).slice(0,n);
  const g=Array(n*n).fill(null);
  const fill=i=>{ if(i===n*n) return true; for(const v of shuffle(syms.slice(),R)){ if(cuaOk(g,n,box,i,v)){ g[i]=v; if(fill(i+1)) return true; g[i]=null; } } return false; };
  fill(0);
  const sol=g.slice(), giv=g.slice(), maxRemove=small?5:10;
  let removed=0;
  for(const i of shuffle([...Array(n*n).keys()],R)){
    if(removed>=maxRemove) break;
    const keep=giv[i]; giv[i]=null;
    if(cuaCount(giv.slice(),n,box,syms)!==1) giv[i]=keep; else removed++;
  }
  return {n,box,sol:sol.join(''),giv:giv.map(c=>c||'.').join(''),syms};
}

/* ---------- integración en el puzle ---------- */
function cabCurList(){ let l=PZ.prog; for(const i of PZ.selPath){ const n=l[i]; if(!n||n.op!=='rep') { PZ.selPath=[]; return PZ.prog; } l=n.body; } return l; }
function opCard(n){
  if(n.op==='c'){ const c=el('div','ccard opc'); c.style.background=shade(COLORS[n.v].c,0.55); c.append(stitchIcon(n.v,24)); c.append(el('small','','hilo')); return c; }
  const o=CAB_OPS[n.op]; const c=el('div','ccard opc'); c.innerHTML=`<span>${o.e}</span><small>${o.n}</small>`; return c;
}
function renderCabProg(list,path,locked){
  const box=el('div','cbox'+(!locked&&path.join(',')===PZ.selPath.join(',')?' sel':''));
  if(!list.length) box.append(el('span','empty',path.length?'Toca aquí y añade lo que se repite':'Toca las tarjetas para programar el cabezal…'));
  list.forEach((n,i)=>{
    if(n.op==='rep'){
      const b=el('div','repblk'); n._el=b;
      const hd=el('div','rephead'); hd.append(el('span','','🔁 Repetir ×'));
      const vu=el('span','vuelta',''); n._cnt=vu;
      const mi=el('button','','–'), num=el('span','n',String(n.n)), pl=el('button','',' +'), del=el('button','','✖');
      mi.onclick=ev=>{ ev.stopPropagation(); if(locked) return; n.n=Math.max(2,n.n-1); renderPuzzle(); };
      pl.onclick=ev=>{ ev.stopPropagation(); if(locked) return; n.n=Math.min(12,n.n+1); renderPuzzle(); };
      del.onclick=ev=>{ ev.stopPropagation(); if(locked) return; list.splice(i,1); PZ.selPath=[]; beep(300,0.05); renderPuzzle(); };
      hd.append(mi,num,pl,del,vu); b.append(hd);
      b.append(renderCabProg(n.body,path.concat(i),locked));
      box.append(b);
    } else {
      const c=opCard(n); n._el=c;
      c.onclick=ev=>{ ev.stopPropagation(); if(locked) return; list.splice(i,1); beep(300,0.05); renderPuzzle(); };
      box.append(c);
    }
  });
  box.onclick=ev=>{ ev.stopPropagation(); if(locked) return; PZ.selPath=path; renderPuzzle(); };
  return box;
}
function cabAdd(node){
  if(PZ.running) return;
  if(countNodes(PZ.prog)>=40){ toast('¡Programa demasiado largo! Usa Repetir.'); return; }
  if(PZ.maxCards&&countNodes(PZ.prog)>=PZ.maxCards){ toast(`¡Solo caben ${PZ.maxCards} tarjetas! Usa 🔁 Repetir, también uno dentro de otro.`); return; }
  const l=cabCurList(); l.push(node);
  if(node.op==='rep') PZ.selPath=PZ.selPath.concat(l.length-1);
  beep(640,0.05); renderPuzzle();
}
function renderCabRight(R){
  const locked=PZ.running||!!PZ.step;
  R.append(el('div','lbl','Programa del cabezal'));
  R.append(renderCabProg(PZ.prog,[],locked));
  R.append(el('div','counter',`Tarjetas usadas: ${countNodes(PZ.prog)}`+(PZ.maxCards?` · 📦 caben ${PZ.maxCards}`:'')+` · reto: ${PZ.best} o menos`));
  R.append(el('div','lbl','Tarjetas'));
  const pal=el('div','palette');
  uniqColors(PZ.target).concat(PZ.age>7?COLOR_KEYS.filter(c=>!uniqColors(PZ.target).includes(c)).slice(0,1):[]).forEach(k=>{ const c=opCard({op:'c',v:k}); c.onclick=()=>cabAdd({op:'c',v:k}); pal.append(c); });
  ['p','n'].concat(PZ.target.includes(null)?['s']:[]).forEach(op=>{ const c=opCard({op}); c.onclick=()=>cabAdd({op}); pal.append(c); });
  const rc=el('div','ccard opc'); rc.style.background='#fff3e0'; rc.innerHTML='<span>🔁</span><small>Repetir</small>'; rc.onclick=()=>cabAdd({op:'rep',n:2,body:[]}); pal.append(rc);
  R.append(pal);
  const act=el('div','actions');
  if(PZ.attempts>=3){ const h=el('button','btn blue','💡 Pista'); h.onclick=showHint; act.append(h); }
  if(TEST||VISIT){ const sb=el('button','btn','👁️ Solución'); sb.onclick=showSolution; act.append(sb); }
  if(PZ.step){
    const stop=el('button','btn','⏹ Parar'); stop.onclick=()=>{ PZ.step=null; renderPuzzle(); renderResult([]); setMsg(''); };
    const nx=el('button','btn primary','👣 Siguiente paso'); nx.onclick=cabStepNext;
    act.append(stop,nx); R.append(act); return;
  }
  const clr=el('button','btn','↺ Borrar todo'); clr.onclick=()=>{ if(PZ.running) return; PZ.prog=[]; PZ.selPath=[]; renderPuzzle(); renderResult([]); setMsg(''); };
  const stp=el('button','btn','👣 Paso a paso'); stp.onclick=cabStepStart; stp.disabled=PZ.running;
  const slow=el('button','btn','🐢 Despacio'); slow.onclick=()=>knitCab(true); slow.disabled=PZ.running;
  const run=el('button','btn primary','▶ Tejer'); run.onclick=()=>knitCab(false); run.disabled=PZ.running;
  act.append(clr,stp,slow,run); R.append(act);
}
function cabPrepare(){ return {res:runCab(PZ.prog,PZ.v.w,PZ.v.h),idx:0,shown:Array(PZ.v.w*PZ.v.h).fill(null)}; }
function cabClearHL(){ document.querySelectorAll('#pz-right .run').forEach(e=>e.classList.remove('run')); document.querySelectorAll('#pz-right .loopon').forEach(e=>e.classList.remove('loopon')); document.querySelectorAll('#pz-right .vuelta').forEach(e=>e.textContent=''); }
function cabApply(S){
  const s=S.res.steps[S.idx]; cabClearHL();
  (s.loops||[]).forEach(([n,k])=>{ if(n._el) n._el.classList.add('loopon'); if(n._cnt) n._cnt.textContent=`vuelta ${k} de ${n.n}`; });
  if(s.node._el) s.node._el.classList.add('run');
  if(s.put) S.shown[s.i]=s.put;
  renderResult(S.shown,[],s.x<PZ.v.w&&s.y<PZ.v.h?s.y*PZ.v.w+s.x:-1);
  if(s.put) beep(500+COLOR_KEYS.indexOf(s.put)*60,0.03,'triangle',0.03);
  S.idx++;
}
function cabFinish(S){
  const {grid,err}=S.res; cabClearHL(); PZ.running=false; PZ.step=null; renderPuzzle(); renderResult(grid);
  if(err){
    if(err.node&&err.node._el) err.node._el.classList.add('shake');
    const m={derecha:'¡El cabezal se ha salido por la derecha! Al final de cada fila usa ⤵️ Bajar fila.',abajo:'¡El cabezal se ha salido por abajo de la tela! Sobran filas.',sinhilo:'¡El cabezal no tiene hilo! Pon una tarjeta de color antes de tejer.',pasos:'¡Uf, el cabezal no para! Revisa los números de Repetir.'}[err.t];
    setMsg(m,'bad'); speakAuto(m); beep(220,0.2,'sawtooth',0.03); return;
  }
  const d=firstDiff(grid,PZ.target);
  if(d===-1){ success(); return; }
  renderResult(grid,[d]); renderTarget([d]);
  const want=PZ.target[d], got=grid[d], row=Math.floor(d/PZ.v.w)+1, colN=d%PZ.v.w+1;
  setMsg(`Fila ${row}, punto ${colN}: debería ser ${want?COLORS[want].n:'un hueco'} y es ${got?COLORS[got].n:'un hueco'}. ¡Busca el error!`,'bad');
  speakAuto($('#pz-msg').textContent); beep(220,0.2,'sawtooth',0.03);
}
async function knitCab(slow){
  if(PZ.running||PZ.step) return;
  if(!PZ.prog.length){ setMsg('El programa está vacío. ¡Toca las tarjetas!','bad'); return; }
  PZ.attempts++; PZ.running=true; renderPuzzle(); setMsg(slow?'🐢 Mira qué tarjeta se ilumina en cada momento…':'🧶 El cabezal está tejiendo…');
  const S=cabPrepare(), n=S.res.steps.length;
  const delay=slow?550:Math.max(60,Math.min(160,3200/Math.max(1,n)));
  while(S.idx<n){ const op=S.res.steps[S.idx].node.op; cabApply(S); await new Promise(r=>setTimeout(r,op==='c'?delay*0.7:delay)); }
  cabFinish(S);
}
function cabStepStart(){
  if(PZ.running) return;
  if(!PZ.prog.length){ setMsg('El programa está vacío. ¡Toca las tarjetas!','bad'); return; }
  PZ.attempts++; PZ.step=cabPrepare(); renderPuzzle(); renderResult([]);
  setMsg('👣 Pulsa «Siguiente paso» y mira qué tarjeta se ilumina y dónde está el cabezal (cuadro azul).');
  if(!PZ.step.res.steps.length) cabFinish(PZ.step);
}
function cabStepNext(){
  const S=PZ.step; if(!S) return;
  if(S.idx<S.res.steps.length){ cabApply(S); const s=S.res.steps[S.idx-1]; const o=s.node.op;
    setMsg(o==='c'?`🎨 Cambia al hilo ${COLORS[s.node.v].n}`:o==='p'?`➡️ Teje un punto ${COLORS[S.shown[s.i]]?COLORS[S.shown[s.i]].n:''} y avanza`:o==='s'?'⏭️ Salta un punto':'⤵️ Baja a la fila siguiente'); }
  if(S.idx>=S.res.steps.length) setTimeout(()=>cabFinish(S),400);
}

function renderCua(hl=[]){
  const box=$('#pz-target'); box.innerHTML='';
  const n=PZ.v.n, g=el('div','cua'); g.style.gridTemplateColumns=`repeat(${n},auto)`;
  PZ.fill.forEach((c,i)=>{
    const given=PZ.v.giv[i]!=='.';
    const d=el('button','cuac'+(given?' given':'')+(hl.includes(i)?' bad':''));
    if(PZ.v.box && !given){ const bx=Math.floor((i%n)/2)+Math.floor(Math.floor(i/n)/2); d.style.background=bx%2?'#e4efff':'#fff'; }
    if(c) d.append(stitchIcon(c,40));
    d.onclick=()=>{ if(given){ toast('Este punto ya venía puesto 📌'); return; } PZ.fill[i]=PZ.fill[i]===PZ.sel?null:PZ.sel; beep(650,0.05); renderCua(); setMsg(''); };
    g.append(d);
  });
  box.append(g);
  $('#pz-reslbl').style.display='none'; $('#pz-result').innerHTML='';
}
function renderCuaRight(R){
  R.append(el('div','lbl','Elige un hilo y toca un hueco'));
  const pal=el('div','palette');
  PZ.v.syms.forEach(k=>{ const c=colorCard(k); if(PZ.sel===k) c.style.outline='4px solid #2f5f96'; c.onclick=()=>{ PZ.sel=k; beep(600,0.04); renderPuzzle(); }; pal.append(c); });
  R.append(pal);
  const act=el('div','actions');
  if(PZ.attempts>=3){ const h=el('button','btn blue','💡 Pista'); h.onclick=showHint; act.append(h); }
  if(TEST||VISIT){ const sb=el('button','btn','👁️ Solución'); sb.onclick=showSolution; act.append(sb); }
  const b=el('button','btn green','✔ Comprobar'); b.onclick=checkCua; act.append(b); R.append(act);
}
function checkCua(){
  const n=PZ.v.n, g=PZ.fill;
  if(g.includes(null)){ setMsg('Todavía quedan huecos vacíos.','bad'); return; }
  PZ.attempts++;
  const bad=new Set(); let why='';
  for(let i=0;i<n*n;i++) if(!cuaOk(g,n,PZ.v.box,i,g[i])){ bad.add(i); }
  if(!bad.size){ success(); return; }
  const i=[...bad][0], r=Math.floor(i/n)+1, c=i%n+1;
  why=`Hay un hilo ${COLORS[g[i]].n} repetido. Mira la fila ${r}, la columna ${c}${PZ.v.box?' y su cuadrado':''}.`;
  renderCua([...bad]); setMsg(why,'bad'); speakAuto(why); beep(220,0.2,'sawtooth',0.03);
}
