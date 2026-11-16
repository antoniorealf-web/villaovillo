/* =========================================================
   NIVELES DE RETO DEL TELAR (dificultad adaptativa)
   ========================================================= */
/* p.tlv[tipo] = nivel de reto 1..10. Sube tras 2 encargos seguidos perfectos y baja tras 2 atascos (p.tlvRun). */
const TLV_TYPES=['seq','reglas','rep','mot','hilo','cab','cua','falta'];
const TLV_MAX=10;
TYPE_NAMES.falta='Tarjeta perdida';
ASK.falta='¡Se me han perdido tarjetas del programa! ¿Sabes cuáles faltan para que salga mi tela?';
HELP.falta='A este programa le faltan tarjetas (las de «?»). Toca un «?» y luego elige la tarjeta que va ahí. Si falta el número de Repetir, ponlo con – y +. Después pulsa «Tejer».';
function tlvDefault(p){ const u=p.unlocked||1; const m=(p.mastery?mLevel(p,'telar'):1)||1; return Math.max(1,Math.min(4,u+Math.floor((m-1)/2))); }
function tlvOf(p,t){ return (p.tlv&&p.tlv[t])||tlvDefault(p); }
function tlvTypesFor(p){ const lv=p.unlocked||1; return ['seq','reglas','cua'].concat(lv>=2?['rep','cab','falta']:[]).concat(lv>=3?['mot','hilo']:[]); }
function tlvUpdate(p,t,perfect,stuck){
  if(!TLV_TYPES.includes(t)) return null;
  p.tlv=p.tlv||{}; p.tlvRun=p.tlvRun||{};
  const cur=tlvOf(p,t); let r=p.tlvRun[t]||0, res=null;
  if(perfect) r=r>0?r+1:1; else if(stuck) r=r<0?r-1:-1; else r=0;
  const cap=(p.tlvCap&&p.tlvCap[t])||TLV_MAX;
  if(r>=2&&cur<cap){ p.tlv[t]=cur+1; r=0; res='up'; }
  else if(r<=-2&&cur>1){ p.tlv[t]=cur-1; r=0; res='down'; }
  else if(!p.tlv[t]) p.tlv[t]=cur;
  p.tlvRun[t]=r; return res;
}

/* ---------- generador por niveles ---------- */
function genEncargo(p,seed,kind,id,forceType){
  const R=rng(seed), ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pk=a=>a[Math.floor(R()*a.length)];
  const small=p.age<=7, lv=p.unlocked||1;
  const pool=[['seq',lv===1?3:1],['reglas',2],['cua',3]]; if(lv>=2) pool.push(['rep',lv===2?4:2],['cab',4],['falta',3]); if(lv>=3) pool.push(['mot',3],['hilo',2]);
  let x=R()*pool.reduce((a,b)=>a+b[1],0), type='seq'; for(const [t,w] of pool){ if((x-=w)<0){ type=t; break; } }
  if(forceType) type=forceType;
  const L=Math.max(1,Math.min(TLV_MAX,(p.tlvForce)||tlvOf(p,type)));
  const ncol=small?Math.min(4,2+Math.floor(L/4)):Math.min(6,3+Math.floor(L/3));
  const cols=shuffle(COLOR_KEYS.slice(),R).slice(0,ncol);
  const motif=len=>{ let m; do{ m=Array.from({length:len},()=>pk(cols)); }while(new Set(m).size<Math.min(2,cols.length)); return m; };
  const motAB=(w,mainLen,rep)=>{ const A=motif(w); let B; do{ B=motif(w); }while(B.join('')===A.join(''));
    let main; do{ main=Array.from({length:mainLen},()=>R()<0.5?'A':'B'); }while(!main.includes('A')||!main.includes('B')); return {A,B,main,rep}; };
  let v;
  if(type==='seq'){ const n=small?Math.min(12,4+L):Math.min(16,6+L); const t=Array.from({length:n},()=>pk(cols)); v={w:n<=8?n:Math.ceil(n/2),t:t.join('')}; }
  else if(type==='reglas'){
    const diag=small?L>=8:L>=6;
    if(diag){ const Lm=small?3:ri(3,4), m=motif(Lm), w=Lm*2, h=small?4:5, t=[];
      for(let r=0;r<h;r++) for(let c=0;c<w;c++) t.push(m[(c+r)%Lm]);
      const nh=Math.min(w*2,(small?3:4)+Math.floor(L/3)); const cand=shuffle([...Array(t.length).keys()].filter(i=>i>=w*2),R).slice(0,nh).sort((a,b)=>a-b);
      v={w,t:t.join(''),miss:nh,holes:cand,diag:true};
    } else {
      const Lm=small?Math.min(4,2+Math.floor(L/4)):Math.min(6,3+Math.floor(L/3)), m=motif(Lm), w=small?6:8, n=Math.max(w*(small?2:3),Lm*4);
      const t=[]; while(t.length<n) t.push(...m); t.length=n;
      const miss=Math.min((small?Lm:Lm+1)+Math.floor(L/3),Math.floor(n/2.5));
      let holes;
      if(L<=3) holes=[...Array(miss).keys()].map(k=>n-miss+k);
      else holes=shuffle([...Array(n).keys()].filter(i=>i>=Lm*2),R).slice(0,miss).sort((a,b)=>a-b);
      v={w,t:t.join(''),miss,holes};
    }
  }
  else if(type==='rep'){ const Lm=small?Math.min(5,2+Math.floor(L/3)):Math.min(7,3+Math.floor(L/2)), m=motif(Lm), w=small?6:8;
    v={w,sol:{main:m,rep:Math.max(3,Math.ceil(w*(small?2:3)/Lm))}}; if(L>=3) v.max=Lm+(L>=6?0:2); }
  else if(type==='cab'){ const tier=L<=3?1:(L<=(small?7:5))?2:3; const d=genCabDesign2(R,small,tier,L); v=makeCabVariant(d.t,d.w,d.h); if(L>=4) v.max=v.best+(L>=7?1:3); }
  else if(type==='cua'){ v=genCua2(R,small,L); }
  else if(type==='mot'){ const w=small?4:(L>=5?8:6); const big=!small&&L>=6; const sol=motAB(w,big?ri(3,4):(small?Math.min(6,3+Math.floor(L/3)):Math.min(9,4+Math.floor(L/2))),big?2:1);
    v={w,sol}; if(L>=3) v.max=cardCount(sol)+(L>=6?0:2); }
  else if(type==='hilo'){
    const w=small?4:6; const withRep=L>=4; const sol=motAB(w,withRep?ri(2,3):(small?ri(4,5):ri(5,7)),withRep?ri(2,3):1);
    const h=clone(sol), bugs=[];
    if(R()<0.65){
      const modes=L<=3?['tok','col','pop']:['tok','col','rep','swap'];
      const nb=L>=7?2:1; const used=new Set();
      for(let b=0;b<nb;b++){ let mode; do{ mode=pk(modes); }while(used.has(mode)&&used.size<modes.length); used.add(mode);
        if(mode==='tok'){ const i=ri(0,h.main.length-1); h.main[i]=h.main[i]==='A'?'B':'A'; bugs.push({row:'main',i}); }
        else if(mode==='col'){ const r=pk(['A','B']), i=ri(0,w-1); const opts=cols.concat(COLOR_KEYS).filter(c=>c!==h[r][i]); h[r][i]=opts[0]; bugs.push({row:r,i}); }
        else if(mode==='pop'){ h.main.pop(); bugs.push({row:'main',i:h.main.length-1,end:true}); }
        else if(mode==='rep'){ h.rep=h.rep+(R()<0.5&&h.rep>2?-1:1); bugs.push({rep:true}); }
        else { const r=pk(['A','B']); let i=-1; for(const k of shuffle([...Array(w-1).keys()],R)){ if(h[r][k]!==h[r][k+1]){ i=k; break; } }
          if(i<0){ h.rep=h.rep+1; bugs.push({rep:true}); } else { [h[r][i],h[r][i+1]]=[h[r][i+1],h[r][i]]; bugs.push({row:r,i},{row:r,i:i+1,pair:true}); } }
      }
      if(expand(h).join('')===expand(sol).join('')){ h.rep=sol.rep+1; bugs.length=0; bugs.push({rep:true}); }
    }
    v={w,sol,hilo:h,bugs,locate:L>=4};
  }
  else if(type==='falta'){
    const useMot=small?L>=6:L>=4; const w=small?(useMot?4:6):(useMot?6:8);
    let sol; if(useMot) sol=motAB(w,small?ri(3,4):ri(4,6),1); else { const Lm=small?Math.min(4,2+Math.floor(L/3)):Math.min(6,3+Math.floor(L/2)); sol={main:motif(Lm),rep:Math.max(3,Math.ceil(w*2/Lm))}; }
    const slots=[]; ['main','A','B'].forEach(r=>(sol[r]||[]).forEach((_,i)=>slots.push({row:r,i})));
    const nb=L>=7?3:L>=4?2:1; const blanks=shuffle(slots,R).slice(0,nb);
    if(L>=5&&R()<0.6){ blanks.pop(); blanks.push({rep:true}); }
    v={w,sol,blanks};
  }
  const npcs=['rosa','tomas','coco'].concat(lv>=2?['bruno','lia']:[]).concat(lv>=3?['nube']:[]);
  return {id,kind,type,L,lvl:type==='seq'||type==='reglas'||type==='cua'?1:type==='rep'||type==='falta'?2:type==='cab'?(lv>=3?3:2):3,npc:type==='hilo'?'hilo':pk(npcs),
    title:(kind==='practice'?'Práctica: ':'')+(type==='cua'?pk(['Cuadro mágico','Colcha mágica','Tapiz mágico']):type==='falta'?pk(['Programa roto','Tarjetas perdidas','El programa de','Programa incompleto']).replace('El programa de','Programa de '+pk(['Rosa','Tomás','Coco'])):pk(GARMENTS)+' '+pk(GSTYLE)),story:null,ask:ASK[type],v6:v,v9:v};
}

/* ---------- cabezal: diseños con bucles dentro de bucles y mejor solución ---------- */
function genCabDesign2(R,small,tier,L){
  if(tier<3){ const d=genCabDesign(R,small,tier); return d; }
  const ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pk=a=>a[Math.floor(R()*a.length)];
  const cols=shuffle(COLOR_KEYS.slice(),R), A=cols[0],B=cols[1],C=cols[2];
  const w=small?4:pk([6,8]), h=small?4:pk([4,6]); const t=[];
  const fam=pk(small?['ajedrez','filas']:['ajedrez','filas','bloques','escalera']);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(fam==='ajedrez') t.push((x+y)%2?B:A);
    else if(fam==='filas') t.push(y%2?C:(x%2?B:A));
    else if(fam==='bloques') t.push((Math.floor(x/2)+Math.floor(y/2))%2?B:A);
    else t.push(((x+Math.floor(y/2)*2)%4)<2?A:B);
  }
  return {w,h,t};
}
function cabRowBody(row){
  const runs=[]; cabRuns(row).forEach(([c,len])=>{ if(c) runs.push({op:'c',v:c}); const op=c?'p':'s'; if(len>=3) runs.push({op:'rep',n:len,body:[{op}]}); else for(let i=0;i<len;i++) runs.push({op}); });
  let best=runs;
  for(let P=2;P<=row.length/2;P++){ if(row.length%P) continue; let ok=true; for(let i=P;i<row.length;i++) if(row[i]!==row[i-P]){ ok=false; break; } if(!ok) continue;
    const blk=[]; cabRuns(row.slice(0,P)).forEach(([c,len])=>{ if(c) blk.push({op:'c',v:c}); for(let i=0;i<len;i++) blk.push({op:c?'p':'s'}); });
    const cand=[{op:'rep',n:row.length/P,body:blk}]; if(countNodes(cand)<countNodes(best)) best=cand; break; }
  return best;
}
function cabBest(t,w,h){
  const rows=[]; for(let y=0;y<h;y++) rows.push(t.slice(y*w,(y+1)*w));
  const key=r=>r.join(',');
  // filas agrupadas cuando se repiten seguidas
  const groups=[]; rows.forEach(r=>{ const g=groups[groups.length-1]; if(g&&g.key===key(r)) g.k++; else groups.push({key:key(r),row:r,k:1}); });
  let prog=[]; groups.forEach((g,gi)=>{ const body=cabRowBody(g.row); if(g.k>=2) prog.push({op:'rep',n:g.k,body:body.concat([{op:'n'}])}); else { prog.push(...body); if(gi<groups.length-1) prog.push({op:'n'}); } });
  let best=prog;
  // patrón de filas que se repite (cada 2 o 3 filas)
  for(let Q=2;Q<=3;Q++){ if(h%Q||h/Q<2) continue; let ok=true; for(let y=Q;y<h;y++) if(key(rows[y])!==key(rows[y-Q])){ ok=false; break; } if(!ok) continue;
    const body=[]; for(let y=0;y<Q;y++){ body.push(...cabRowBody(rows[y]),{op:'n'}); }
    const cand=[{op:'rep',n:h/Q,body}]; if(countNodes(cand)<countNodes(best)) best=cand; }
  const old=cabCanon(t,w,h); return countNodes(old)<countNodes(best)?old:best;
}
function makeCabVariant(t,w,h){ const sol=cabBest(t,w,h); return {w,h,t:t.map(c=>c||'.').join(''),sol,best:countNodes(sol)}; }

/* ---------- cuadro mágico por niveles ---------- */
function genCua2(R,small,L){
  const n=small?3:4, box=!small, syms=shuffle(COLOR_KEYS.slice(),R).slice(0,n);
  const g=Array(n*n).fill(null);
  const fill=i=>{ if(i===n*n) return true; for(const v of shuffle(syms.slice(),R)){ if(cuaOk(g,n,box,i,v)){ g[i]=v; if(fill(i+1)) return true; g[i]=null; } } return false; };
  fill(0);
  const sol=g.slice(), giv=g.slice(), maxRemove=small?Math.min(6,3+Math.floor(L/2)):Math.min(12,5+L);
  let removed=0;
  for(const i of shuffle([...Array(n*n).keys()],R)){
    if(removed>=maxRemove) break;
    const keep=giv[i]; giv[i]=null;
    if(cuaCount(giv.slice(),n,box,syms)!==1) giv[i]=keep; else removed++;
  }
  return {n,box,sol:sol.join(''),giv:giv.map(c=>c||'.').join(''),syms};
}

/* ---------- traza de ejecución: qué tarjeta teje cada punto ---------- */
function traceProg(prog){
  const out=[]; const rep=prog.rep||1;
  for(let k=0;k<rep;k++) (prog.main||[]).forEach((tk,i)=>{ if(tk==='A'||tk==='B') (prog[tk]||[]).forEach((c,j)=>out.push({c,i,row:tk,j,k})); else out.push({c:tk,i,k}); if(out.length>400) return; });
  return out;
}
function knitHL(s,rep){
  document.querySelectorAll('#pz-right .ccard.run,#pz-right .ccard.run2').forEach(e=>e.classList.remove('run','run2'));
  if(!s){ const v=document.querySelector('#pz-right .repbox .vuelta'); if(v) v.textContent=''; return; }
  const m=document.querySelector(`#pz-right .ccard[data-row="main"][data-i="${s.i}"]`); if(m) m.classList.add('run');
  if(s.row){ const c=document.querySelector(`#pz-right .ccard[data-row="${s.row}"][data-i="${s.j}"]`); if(c) c.classList.add('run2'); }
  const v=document.querySelector('#pz-right .repbox .vuelta'); if(v) v.textContent=rep>1?`vuelta ${s.k+1} de ${rep}`:'';
}
function animateKnit(out,slow){
  return new Promise(res=>{
    const tr=traceProg(PZ.prog), rep=PZ.prog.rep||1;
    const n=Math.min(out.length, PZ.target.length+PZ.v.w*2); let i=0;
    const speed = slow||PZ.slow ? 650 : Math.max(110,Math.min(320,4200/Math.max(1,n)));
    const tick=()=>{ i++; renderResult(out.slice(0,i),[],i-1); knitHL(tr[i-1],rep); beep(500+COLOR_KEYS.indexOf(out[i-1])*60,0.03,'triangle',0.03); if(i<n) setTimeout(tick,speed); else setTimeout(()=>{ knitHL(null); PZ.slow=false; res(); },Math.min(500,speed)); };
    tick();
  });
}

/* ---------- tarjetas perdidas y buscar el fallo de Hilo ---------- */
function blankAt(row,i){ return (PZ.blanks||[]).some(b=>b.row===row&&b.i===i); }
function nextBlank(){ const bs=(PZ.blanks||[]).filter(b=>!b.rep); return bs.find(b=>PZ.prog[b.row][b.i]==='?')||null; }
function locateTap(where){
  const ok=(PZ.v.bugs||[]).some(b=>where.rep?b.rep:(b.row===where.row&&(b.i===where.i||(b.end&&where.row==='main'&&where.i>=PZ.prog.main.length-1))));
  if(ok){ PZ.locRight=PZ.locTries===0; PZ.phase=null; beep(880,0.1,'triangle'); renderPuzzle();
    say({face:'🤖',name:'Hilo',text:where.rep?'¡Ahí está! Me equivoqué en las vueltas de Repetir. ¿Me ayudas a arreglarlo?':'¡Ahí está mi fallo! Ahora, ¿me ayudas a arreglar el programa?'}).then(()=>{ PZ.attempts=0; evaluate(expand(PZ.prog)); });
    return; }
  PZ.locTries=(PZ.locTries||0)+1; beep(220,0.15,'sawtooth',0.03);
  if(PZ.locTries>=2){ PZ.locRight=false; PZ.phase=null; renderPuzzle(); const b=PZ.v.bugs[0];
    if(b.rep){ const rb=document.querySelector('#pz-right .repbox'); if(rb) rb.classList.add('shake'); }
    else { const c=document.querySelector(`#pz-right .ccard[data-row="${b.row}"][data-i="${b.i}"]`); if(c) c.classList.add('run'); }
    setMsg(b.rep?'El fallo estaba en el número de Repetir. ¡Arréglalo y teje!':'El fallo estaba en la tarjeta marcada. ¡Arréglalo y teje!','bad'); speakAuto($('#pz-msg').textContent); return; }
  setMsg('Ahí no está el fallo. Sigue el programa tarjeta a tarjeta y compara con el pedido.','bad');
}
