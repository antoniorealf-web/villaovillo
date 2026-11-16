/* =========================================================
   PANADERÍA DE BRUNO (mates)
   ========================================================= */
let MZ=null;
function rr(a,b){ return a+Math.floor(Math.random()*(b-a+1)); }
function emojis(e,n,perRow=5){ let s='<div class="mvis">'; for(let i=0;i<n;i++){ s+=`<span>${e}</span>`; if((i+1)%perRow===0&&i<n-1) s+='<br>'; } return s+'</div>'; }
function genMath(p){
  const small=p.age<=7, f=p.mathFocus||'';
  const E=['🥐','🧁','🍪','🥖','🍩','🥨'], e=E[rr(0,E.length-1)];
  const pickKind=()=>{
    const pl=(p.mastery?mLevel(p,'pan'):1)||1;
    if(small){ if(f&&Math.random()<0.6) return f; const ks=['contar','sumas','sumas'].concat(pl>=2?['restas','restas']:[]).concat(pl>=3?['dinero']:[]).concat(pl>=4?['sumas','restas']:[]); return ks[rr(0,ks.length-1)]; }
    if(f.startsWith('tabla')&&Math.random()<0.6) return 'multi';
    if(f&&!f.startsWith('tabla')&&Math.random()<0.6) return {division:'reparto',dinero:'cambio',fracciones:'fraccion',problemas:'dospasos'}[f];
    return 'escalera';
    const ks=['multi','multi','suma100','receta'].concat(pl>=2?['reparto','cambio']:[]).concat(pl>=4?['dospasos','fraccion']:[]); return ks[rr(0,ks.length-1)];
  };
  const k=pickKind();
  if(k==='escalera') return genMath9(p);
  if(k==='contar'){ const n=rr(5,15); return {k,q:`¿Cuántos ${e} hay en la bandeja?`,vis:emojis(e,n),a:n,exp:`Hay ${n}. Cuenta de 5 en 5: cada fila tiene 5.`}; }
  if(k==='sumas'){ const a=rr(2,10), b=rr(1,Math.min(10,20-a)); return {k,q:`En una bandeja hay ${a} ${e} y en otra ${b}. ¿Cuántos hay en total?`,vis:emojis(e,a)+'<div class="mplus">+</div>'+emojis(e,b),a:a+b,exp:`${a} + ${b} = ${a+b}`}; }
  if(k==='restas'){ const a=rr(6,18), b=rr(1,a-2); return {k,q:`Bruno tenía ${a} ${e}. Ha vendido ${b}. ¿Cuántos le quedan?`,vis:`<div class="mvis">${Array.from({length:a},(_,i)=>`<span style="${i<b?'opacity:.25':''}">${e}</span>${(i+1)%5===0?'<br>':''}`).join('')}</div>`,a:a-b,exp:`${a} − ${b} = ${a-b}`}; }
  if(k==='dinero'){ const x=rr(1,6), y=rr(1,6);
    if(Math.random()<0.5) return {k,q:`Un pan cuesta ${x} botones y un bollo ${y}. ¿Cuánto cuesta todo?`,vis:`<div class="mvis">🥖 ${'🔘'.repeat(x)}<br>🥐 ${'🔘'.repeat(y)}</div>`,a:x+y,exp:`${x} + ${y} = ${x+y} botones`};
    const c=rr(2,9); return {k,q:`Una tarta cuesta ${c} botones. Pagas con 10. ¿Cuántos botones te devuelven?`,vis:`<div class="mvis">🎂 ${'🔘'.repeat(c)}<br>💰 ${'🔘'.repeat(10)}</div>`,a:10-c,exp:`10 − ${c} = ${10-c}`}; }
  if(k==='multi'){ const t=f.startsWith('tabla')?+f.split(':')[1]:rr(2,9); const n=rr(2,10); const [a,b]=Math.random()<0.5?[n,t]:[t,n];
    return {k,q:`Bruno llena ${a} cajas con ${b} ${e} en cada una. ¿Cuántos ${e} hay?`,vis:a*b<=60?`<div class="mvis">${Array.from({length:a},()=>`<div class="mbox">${e.repeat(b)}</div>`).join('')}</div>`:`<div class="mvis">📦 × ${a} &nbsp; (${b} ${e} en cada caja)</div>`,a:a*b,exp:`${a} × ${b} = ${a*b}`}; }
  if(k==='reparto'){ const b=rr(2,9), q=rr(2,9); return {k,q:`Hay ${b*q} ${e} para repartir en ${b} bolsas iguales. ¿Cuántos van en cada bolsa?`,vis:`<div class="mvis">${'🛍️'.repeat(b)}</div>`,a:q,exp:`${b*q} : ${b} = ${q}, porque ${b} × ${q} = ${b*q}`}; }
  if(k==='cambio'){ const n=rr(2,5), pr=rr(2,9), tot=n*pr, pay=tot<20?20:tot<50?50:100; return {k,q:`Compras ${n} barras de pan a ${pr} botones cada una y pagas con ${pay}. ¿Cuánto te devuelven?`,vis:`<div class="mvis">${'🥖'.repeat(n)}</div>`,a:pay-tot,exp:`${n} × ${pr} = ${tot}; ${pay} − ${tot} = ${pay-tot}`}; }
  if(k==='dospasos'){ const a=rr(3,6), b=rr(4,8), c=rr(3,a*b-3); return {k,q:`Bruno hornea ${a} bandejas de ${b} ${e}. Vende ${c}. ¿Cuántos le quedan?`,vis:`<div class="mvis">${'🍽️'.repeat(a)}</div>`,a:a*b-c,exp:`${a} × ${b} = ${a*b}; ${a*b} − ${c} = ${a*b-c}`}; }
  if(k==='receta'){ const h=rr(2,4), t=rr(2,5); if(Math.random()<0.4){ const hh=h*2; return {k,q:`Para una tarta se necesitan ${hh} huevos. ¿Cuántos hacen falta para media tarta?`,vis:`<div class="mvis">🎂 ${'🥚'.repeat(hh)}</div>`,a:hh/2,exp:`La mitad de ${hh} es ${hh/2}`}; }
    return {k,q:`Para una tarta se necesitan ${h} huevos. ¿Cuántos hacen falta para ${t} tartas?`,vis:`<div class="mvis">${'🎂'.repeat(t)}</div>`,a:h*t,exp:`${t} × ${h} = ${h*t}`}; }
  if(k==='fraccion'){ const n=[4,6,8][rr(0,2)], c=rr(1,n-1);
    const opts=shuffle([`${n-c}/${n}`,`${c}/${n}`,`${n}/${n-c}`,`${n-c}/${c}`].filter((x,i,a)=>a.indexOf(x)===i),Math.random);
    return {k,q:`La tarta tenía ${n} trozos iguales y se han comido ${c}. ¿Qué parte de la tarta queda?`,vis:pieSVG(n,c),a:`${n-c}/${n}`,choices:opts,exp:`Quedan ${n-c} trozos de ${n}: ${n-c}/${n}`}; }
  // suma100
  const a=rr(12,58), b=rr(11,40); return {k:'suma100',q:`Por la mañana Bruno vendió ${a} ${e} y por la tarde ${b}. ¿Cuántos vendió en total?`,vis:'',a:a+b,exp:`${a} + ${b} = ${a+b}`};
}
/* ---------- Escalera de cuentas del grupo 9 (p.panLv) ----------
   Cada turno mezcla niveles como una campana: la mayoría del nivel actual, algunos de repaso (menos premio)
   y alguno de reto (más premio). q.tier: -2/-1 repaso, 0 actual, 1 reto. */
const PAN9_LEVELS=[
  {n:'Tablas y sumas de dos cifras',ks:['multi','suma100','reparto']},
  {n:'Sumas de 3 cifras y restas de 2 cifras llevando',ks:['suma3','resta2','mult21']},
  {n:'Restas de 3 cifras (una llevada) y 2 cifras × 1',ks:['resta3a','mult21b','cambio','receta']},
  {n:'Restas de 3 cifras llevando y 3 cifras × 1',ks:['resta3','resta3','resta3','mult31','mult31','mult31','fraccion']},
  {n:'Restas con ceros (503 − 278), 4 cifras × 1 y dos pasos',ks:['resta0','mult41','dospasos3']},
  {n:'Multiplicar por 2 cifras y repartos con resto',ks:['mult22','resto','dospasos3']}
];
const PAN_TIER={'-2':'🌱 Repaso','-1':'🌱 Repaso','1':'🔥 Reto'};
function panLvOf(p){ return Math.max(0,Math.min(PAN9_LEVELS.length-1,p.panLv==null?3:p.panLv)); }
function digits(n){ return String(n).split('').map(Number); }
function colOp(a,b,op){ // cuenta colocada en vertical, como en el cuaderno
  const w=Math.max(String(a).length,String(b).length)+1;
  const pad=s=>String(s).padStart(w,' ');
  return `<div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:34px;font-weight:800;line-height:1.15;display:inline-block;text-align:right;background:#fff;border:2px solid #e5d6bd;border-radius:12px;padding:6px 16px;margin:8px 0">${pad(a)}<br>${op}${pad(b).slice(1)}<div style="border-top:3px solid #4a3b2c;margin-top:4px"></div>&nbsp;</div>`;
}
function genMath9(p){
  const center=panLvOf(p), r=Math.random();
  const off=r<0.05?-2:r<0.25?-1:r<0.85?0:1;
  const lv=Math.max(0,Math.min(PAN9_LEVELS.length-1,center+off));
  const tier=Math.max(-2,Math.min(1,lv-center));
  const k=pick(PAN9_LEVELS[lv].ks);
  const E=['🥐','🧁','🍪','🥖','🍩','🥨'], e=pick(E);
  const bare=Math.random()<0.5; // la mitad, cuenta en vertical; la otra mitad, problema con historia
  let q;
  const sub=(a,b)=>bare?{q:`Haz la cuenta: ${a} − ${b}`,vis:colOp(a,b,'−'),say:`${a} menos ${b}`}:pick([
    {q:`En el almacén de Bruno había ${a} kilos de harina. Ha gastado ${b}. ¿Cuántos kilos quedan?`},
    {q:`Bruno quiere hornear ${a} galletas y ya lleva ${b}. ¿Cuántas le faltan?`},
    {q:`El lunes Bruno vendió ${a} ${e} y el martes ${b}. ¿Cuántos vendió de más el lunes?`}]);
  const mul=(a,b)=>bare?{q:`Haz la cuenta: ${a} × ${b}`,vis:colOp(a,b,'×'),say:`${a} por ${b}`}:pick([
    {q:`Bruno empaqueta ${a} ${e} cada día. ¿Cuántos empaqueta en ${b} días?`},
    {q:`Cada caja lleva ${a} ${e}. ¿Cuántos hay en ${b} cajas?`},
    {q:`Un saco de harina pesa ${a} gramos. ¿Cuánto pesan ${b} sacos?`}]);
  const add=(a,b)=>bare?{q:`Haz la cuenta: ${a} + ${b}`,vis:colOp(a,b,'+'),say:`${a} más ${b}`}:{q:`Por la mañana Bruno vendió ${a} ${e} y por la tarde ${b}. ¿Cuántos vendió en total?`};
  // números con llevadas
  const borrow=(nd,minB)=>{ for(;;){ const a=rr(10**(nd-1)+10**(nd-1)/2|0,10**nd-1), b=rr(10**(nd-1),a-1); const da=digits(a).reverse(), db=digits(b).reverse(); let n=0; for(let i=0;i<db.length;i++) if(da[i]<db[i]) n++; if(n>=minB&&(nd<3||n<=(minB===1?1:3))) return [a,b]; } };
  const carryMul=(nd)=>{ for(;;){ const a=rr(10**(nd-1),10**nd-1), b=rr(3,9); if(digits(a).some(d=>d*b>=10)) return [a,b]; } };
  if(k==='multi'){ const t=rr(2,9), n=rr(2,10); q={q:`Bruno llena ${n} cajas con ${t} ${e} en cada una. ¿Cuántos ${e} hay?`,a:n*t,exp:`${n} × ${t} = ${n*t}`}; }
  else if(k==='suma100'){ const a=rr(12,58), b=rr(11,40); q=Object.assign(add(a,b),{a:a+b,exp:`${a} + ${b} = ${a+b}`}); }
  else if(k==='reparto'){ const b=rr(2,9), c=rr(2,9); q={q:`Hay ${b*c} ${e} para repartir en ${b} bolsas iguales. ¿Cuántos van en cada bolsa?`,a:c,exp:`${b*c} : ${b} = ${c}, porque ${b} × ${c} = ${b*c}`}; }
  else if(k==='suma3'){ let a,b; do{ a=rr(120,689); b=rr(110,299); }while(!(a%10+b%10>=10||((a/10|0)%10+(b/10|0)%10)>=10)||a+b>999); q=Object.assign(add(a,b),{a:a+b,exp:`${a} + ${b} = ${a+b}`}); }
  else if(k==='resta2'){ const [a,b]=borrow(2,1); q=Object.assign(sub(a,b),{a:a-b,exp:`${a} − ${b} = ${a-b}`}); }
  else if(k==='resta3a'){ const [a,b]=borrow(3,1); q=Object.assign(sub(a,b),{a:a-b,exp:`${a} − ${b} = ${a-b}`}); }
  else if(k==='resta3'){ const [a,b]=borrow(3,2); q=Object.assign(sub(a,b),{a:a-b,exp:`${a} − ${b} = ${a-b}`}); }
  else if(k==='resta0'){ let a,b; do{ a=rr(2,9)*100+rr(0,8); b=rr(101,a-11); }while(b%10<=a%10||(b/10|0)%10===0); q=Object.assign(sub(a,b),{a:a-b,exp:`${a} − ${b} = ${a-b}. Como en las decenas hay un 0, hay que pedir prestado a las centenas.`}); }
  else if(k==='mult21'){ let a,b; do{ a=rr(11,43); b=rr(2,3); }while(digits(a).some(d=>d*b>=10)); q=Object.assign(mul(a,b),{a:a*b,exp:`${a} × ${b} = ${a*b}`}); }
  else if(k==='mult21b'){ const [a,b]=carryMul(2); q=Object.assign(mul(a,b),{a:a*b,exp:`${a} × ${b} = ${a*b}`}); }
  else if(k==='mult31'){ const [a,b]=carryMul(3); q=Object.assign(mul(a,b),{a:a*b,exp:`${a} × ${b} = ${a*b}`}); }
  else if(k==='mult41'){ const [a,b]=carryMul(4); q=Object.assign(mul(a,b),{a:a*b,exp:`${a} × ${b} = ${a*b}`}); }
  else if(k==='mult22'){ const a=rr(12,49), b=rr(11,19); q=Object.assign(bare?{q:`Haz la cuenta: ${a} × ${b}`,vis:colOp(a,b,'×'),say:`${a} por ${b}`}:{q:`En la panadería hay ${b} estantes con ${a} ${e} cada uno. ¿Cuántos ${e} hay?`},{a:a*b,exp:`${a} × ${b} = ${a*b}`}); }
  else if(k==='resto'){ const b=rr(3,9), c=rr(4,12), s=rr(1,b-1), n=b*c+s; q={q:`Bruno reparte ${n} ${e} en bolsas de ${b}. Llena todas las bolsas que puede. ¿Cuántos ${e} le sobran?`,a:s,exp:`${b} × ${c} = ${b*c}; ${n} − ${b*c} = ${s}. Sobran ${s}.`}; }
  else if(k==='dospasos3'){ const a=rr(105,248), b=rr(3,4), c=rr(120,a*b-60); q={q:`Bruno hornea ${b} bandejas de ${a} ${e}. Vende ${c}. ¿Cuántos le quedan?`,a:a*b-c,exp:`${a} × ${b} = ${a*b}; ${a*b} − ${c} = ${a*b-c}`}; }
  else if(k==='cambio'){ const n=rr(2,5), pr=rr(2,9), tot=n*pr, pay=tot<20?20:50; q={q:`Compras ${n} barras de pan a ${pr} botones cada una y pagas con ${pay}. ¿Cuánto te devuelven?`,vis:`<div class="mvis">${'🥖'.repeat(n)}</div>`,a:pay-tot,exp:`${n} × ${pr} = ${tot}; ${pay} − ${tot} = ${pay-tot}`}; }
  else if(k==='receta'){ const h=rr(2,4), t=rr(3,8); q={q:`Para una tarta se necesitan ${h} huevos. ¿Cuántos hacen falta para ${t} tartas?`,a:h*t,exp:`${t} × ${h} = ${h*t}`}; }
  else { const n=[4,6,8][rr(0,2)], c=rr(1,n-1); const opts=shuffle([`${n-c}/${n}`,`${c}/${n}`,`${n}/${n-c}`,`${n-c}/${c}`].filter((x,i,a)=>a.indexOf(x)===i),Math.random);
    q={q:`La tarta tenía ${n} trozos iguales y se han comido ${c}. ¿Qué parte de la tarta queda?`,vis:pieSVG(n,c),a:`${n-c}/${n}`,choices:opts,exp:`Quedan ${n-c} trozos de ${n}: ${n-c}/${n}`}; }
  q.k=k; q.tier=tier; q.vis=q.vis||''; return q;
}
function pieSVG(n,eaten){ let s='<svg viewBox="-52 -52 104 104" width="120" height="120">'; for(let i=0;i<n;i++){ const a0=i/n*Math.PI*2-Math.PI/2, a1=(i+1)/n*Math.PI*2-Math.PI/2; const x0=Math.cos(a0)*48,y0=Math.sin(a0)*48,x1=Math.cos(a1)*48,y1=Math.sin(a1)*48;
  s+=`<path d="M0,0 L${x0.toFixed(1)},${y0.toFixed(1)} A48,48 0 0,1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${i<eaten?'#f3ead9':'#f29b38'}" stroke="#8a5a36" stroke-width="2"/>`; } return s+'</svg>'; }
function openBakery(age){
  const p=P(); const src=age?{age,mathFocus:'',panLv:CAT_PAN}:p;
  MZ={qs:Array.from({length:src.age<=7?5:6},()=>genMath(src)),i:0,ok:0,tries:0,input:'',catalog:!!age};
  show('bakery'); renderBakery();
  if(!age && !p._bakeryHi){ p._bakeryHi=true; saveQuiet(); say({face:'🐻',name:'Bruno el panadero',text:'¡Bienvenida a mi panadería! Necesito ayuda con las cuentas. Cada día puedes hacer un turno de problemas.'}); }
}
function renderBakery(){
  const p=P(), q=MZ.qs[MZ.i]; $('#bk-coins').textContent='🔘 '+p.coins;
  $('#bk-prog').innerHTML=MZ.qs.map((_,i)=>`<span class="mdot ${i<MZ.i?(MZ.qs[i].good?'ok':'ko'):i===MZ.i?'cur':''}"></span>`).join('');
  const tag=PAN_TIER[q.tier]?`<div class="badge" style="display:inline-block;margin:0 0 6px;${q.tier>0?'background:#ffe0d6;color:#b4432f':'background:#e2f4dc;color:#3c7d38'}">${PAN_TIER[q.tier]} · 🔘 ${q.tier>0?3:1}</div>`:'';
  $('#bk-q').innerHTML=`${tag}<div class="npcline"><div class="face" id="bk-face"></div><div class="ask">${esc(q.q)}</div><button class="speak" id="bk-sp">🔊</button></div>${q.vis||''}`;
  $('#bk-face').append(npcIcon('bruno',64));
  $('#bk-sp').onclick=()=>speakNow(q.say||q.q);
  const A=$('#bk-ans'); A.innerHTML='';
  if(q.choices){ const g=el('div','mchoices'); q.choices.forEach(c=>{ const b=el('button','btn',esc(c)); b.style.fontSize='26px'; b.onclick=()=>answerMath(c); g.append(b); }); A.append(g); }
  else {
    A.append(el('div','mdisp',MZ.input||'&nbsp;'));
    const pad=el('div','mpad');
    ['1','2','3','4','5','6','7','8','9','⌫','0','✔'].forEach(k=>{ const b=el('button','btn'+(k==='✔'?' green':''),k); b.onclick=()=>{
      if(k==='⌫') MZ.input=MZ.input.slice(0,-1); else if(k==='✔'){ if(MZ.input!=='') answerMath(+MZ.input); return; } else if(MZ.input.length<5) MZ.input+=k;
      beep(600,0.03); renderBakery(); }; pad.append(b); });
    A.append(pad);
  }
  $('#bk-msg').textContent=''; $('#bk-msg').className='';
  speakAuto(q.say||q.q);
}
async function answerMath(v){
  const q=MZ.qs[MZ.i], p=P(); p.math=p.math||{}; const st=p.math[q.k]=p.math[q.k]||{ok:0,total:0};
  if(String(v)===String(q.a)){
    if(MZ.tries===0){ MZ.ok++; q.good=true; st.ok++; } st.total++;
    if(!MZ.catalog) addMastery(p,'pan',1);
    fanfare(); $('#bk-msg').textContent='¡Correcto! '+q.exp; $('#bk-msg').className='good';
    await new Promise(r=>setTimeout(r,1300)); nextMath();
  } else {
    MZ.tries++;
    if(MZ.tries===1){ beep(220,0.2,'sawtooth',0.03); $('#bk-msg').textContent='¡Casi! Vuelve a mirarlo con calma.'; $('#bk-msg').className='bad'; MZ.input=''; setTimeout(()=>{ const d=document.querySelector('.mdisp'); if(d) d.innerHTML='&nbsp;'; },300); speakAuto('Casi. Vuelve a mirarlo con calma.'); }
    else { st.total++; q.good=false; await say({face:'🐻',name:'Bruno',text:`La respuesta es ${q.a}. ${q.exp}. ¡La próxima seguro que sí!`}); nextMath(); }
  }
}
async function nextMath(){
  MZ.i++; MZ.tries=0; MZ.input='';
  if(MZ.i<MZ.qs.length){ renderBakery(); return; }
  const p=P(), n=MZ.qs.length, ok=MZ.ok, stars=ok>=n?3:ok>=n-2?2:1;
  if(MZ.catalog){ await say({center:true,html:`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:24px;font-weight:800">${ok} de ${n} a la primera</div></div>`}); openCatalog(); return; }
  const first=!(p.daily&&p.daily.math);
  let coins, xp;
  if(first){ coins=MZ.qs.filter(q=>q.good).reduce((s,q)=>s+(q.tier<0?1:q.tier>0?3:2),0); xp=ok+1; if(p.daily) p.daily.math=true; }
  else { const pc=(p.mathPractice&&p.mathPractice.date===today())?p.mathPractice.coins:0; coins=Math.min(Math.max(0,10-pc),ok); p.mathPractice={date:today(),coins:pc+coins}; xp=0; }
  p.coins+=coins; p.counters.earned+=coins; p.counters.math=(p.counters.math||0)+1; addXP(p,xp); logAct(p,'p',n,ok);
  save(`Panadería: ${ok}/${n} bien`); fanfare();
  await say({center:true,html:`<div class="reward"><div class="stars">${starsHTML(stars)}</div><div style="font-size:26px;font-weight:800">¡Turno terminado! ${ok} de ${n} a la primera</div><div class="rw-items">${coins?`<div class="rw-item">🔘 +${coins} botones</div>`:''}${xp?`<div class="rw-item">✨ +${xp} experiencia</div>`:''}</div><div style="font-size:18px">🐻 «¡Gracias por ayudarme con las cuentas!»</div>${first?'':'<div class="counter">Los turnos extra dan menos premio. ¡Mañana hay turno nuevo!</div>'}</div>`});
  await dailyBonusCheck(p); await afterRewards();
  const r=await say({face:'🐻',name:'Bruno',text:'¿Otro turno?',buttons:[{t:'Volver al pueblo'},{t:'¡Otro turno!',cls:'primary'}],speak:false});
  if(r===1) openBakery(); else show('village');
}
