/* =========================================================
   PIZARRA (mensajes y dibujos entre las niñas)
   ========================================================= */
/* p.board = {img: dibujo en PNG, notes:[{id,from,fromId,text,t,seen}]}. Se cuelga en la pared (fu_pizarra). */
const CHALKS=['#ffffff','#f7e27a','#ff9fb8','#8fd0ff','#9be38f','#ffb46b'];
const BOARD_STICKERS=['❤️','⭐','😊','🌸','🎉','🐑','🧶','👍'];
let BD=null;
function boardOf(p){ p.board=p.board||{img:null,notes:[]}; return p.board; }
const boardImgCache={};
function boardImage(p){ const b=boardOf(p); if(!b.img) return null; let c=boardImgCache[p.id]; if(!c||c.src!==b.img){ c=new Image(); c.src=b.img; boardImgCache[p.id]=c; } return c.complete?c:null; }
function drawBoardMini(c,x,y,p){
  c.fillStyle='rgba(60,40,20,.15)'; c.beginPath(); c.ellipse(x+4,y+42,46,6,0,0,Math.PI*2); c.fill();
  roundRect(c,x-45,y-32,90,64,8); c.fillStyle='#b97a48'; c.fill(); ol(c,2.6);
  roundRect(c,x-39,y-26,78,52,4); c.fillStyle='#2f5a46'; c.fill();
  const im=p?boardImage(p):null; if(im){ c.drawImage(im,x-39,y-26,78,49); } else if(!p){ c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.moveTo(x-24,y); c.quadraticCurveTo(x-10,y-14,x+4,y); c.quadraticCurveTo(x+16,y+12,x+26,y-4); c.stroke(); }
  const n=p?boardOf(p).notes.length:0; for(let i=0;i<Math.min(3,n);i++){ c.fillStyle=['#fff3a8','#ffd1dc','#d6ecff'][i]; c.fillRect(x+14-i*13,y-22+i*4,15,13); }
  roundRect(c,x-28,y+24,56,6,2); c.fillStyle='#d9b48a'; c.fill();
}
function openBoardView(p){
  const mine=p===P()&&!VISIT; const b=boardOf(p);
  BD={p,mine,col:CHALKS[0],w:6,erase:false,draw:false,last:null};
  if(mine){ let ch=false; b.notes.forEach(n=>{ if(!n.seen&&n.fromId!==p.id){ n.seen=true; ch=true; } }); if(ch) saveQuiet(); }
  $('#bd-title').textContent=mine?'🖍️ Mi pizarra':'🖍️ Pizarra de '+p.name;
  show('pizarra'); renderBoardView();
}
function renderBoardView(){
  const {p,mine}=BD, b=boardOf(p);
  const cv=$('#bd-cv'), c=cv.getContext('2d'); cv.width=800; cv.height=500; c.clearRect(0,0,800,500);
  if(b.img){ const im=new Image(); im.onload=()=>c.drawImage(im,0,0,800,500); im.src=b.img; }
  const tools=$('#bd-tools'); tools.innerHTML='';
  if(mine){
    CHALKS.forEach(col=>{ const d=el('button','dot'+(BD.col===col&&!BD.erase?' sel':'')); d.style.background=col; d.onclick=()=>{ BD.col=col; BD.erase=false; renderBoardTools(); }; tools.append(d); });
    [[4,'fino'],[10,'gordo']].forEach(([w,n])=>{ const bb=el('button','btn'+(BD.w===w&&!BD.erase?' blue':''),n==='fino'?'✏️ Fino':'🖍️ Gordo'); bb.onclick=()=>{ BD.w=w; BD.erase=false; renderBoardTools(); }; tools.append(bb); });
    const er=el('button','btn'+(BD.erase?' blue':''),'🧽 Borrador'); er.onclick=()=>{ BD.erase=true; renderBoardTools(); }; tools.append(er);
    const cl=el('button','btn','🗑️ Borrar todo'); cl.onclick=async()=>{ const r=await say({face:'🧽',name:'¿Borrar el dibujo?',text:'Se borrará todo lo dibujado en la pizarra. Los mensajes se quedan.',buttons:[{t:'No'},{t:'Sí, borrar',cls:'primary'}],speak:false}); if(r!==1) return; b.img=null; saveQuiet(); renderBoardView(); }; tools.append(cl);
    const pa=el('button','btn','📦 Guardar en la cesta'); pa.onclick=()=>putAway(p,'fu_pizarra'); tools.append(pa);
  } else tools.append(el('div','counter',`Solo ${esc(p.name)} puede dibujar aquí, pero tú puedes dejarle un mensaje.`));
  renderBoardNotes();
}
function renderBoardTools(){ renderBoardViewToolsOnly(); }
function renderBoardViewToolsOnly(){ const tools=$('#bd-tools'); const btns=tools.querySelectorAll('.dot'); btns.forEach((d,i)=>d.classList.toggle('sel',CHALKS[i]===BD.col&&!BD.erase)); const bs=tools.querySelectorAll('.btn'); if(bs.length>=3){ bs[0].classList.toggle('blue',BD.w===4&&!BD.erase); bs[1].classList.toggle('blue',BD.w===10&&!BD.erase); bs[2].classList.toggle('blue',BD.erase); } }
function renderBoardNotes(){
  const {p,mine}=BD, b=boardOf(p), me=VISIT?{name:'Papá',id:'alcalde'}:{name:P().name,id:P().id};
  const N=$('#bd-notes'); N.innerHTML='';
  const f=el('div','panel'); f.style.padding='10px';
  f.append(el('div','lbl',mine?'Escribe una nota':'Déjale un mensaje a '+esc(p.name)));
  const inp=el('textarea','inputline'); inp.maxLength=140; inp.rows=2; inp.placeholder=mine?'Algo que no quiero olvidar…':'¡Hola! …'; inp.style.cssText='width:100%;resize:none;font-family:inherit';
  const st=el('div','choice'); BOARD_STICKERS.forEach(s=>{ const bb=el('button','',s); bb.style.fontSize='24px'; bb.onclick=()=>{ inp.value=(inp.value+' '+s).trim(); }; st.append(bb); });
  const send=el('button','btn primary','📌 Pegar en la pizarra'); send.style.marginTop='8px';
  send.onclick=()=>{ const t=inp.value.trim(); if(!t){ toast('Escribe algo primero'); return; }
    b.notes.unshift({id:'n'+Date.now().toString(36),from:me.name,fromId:me.id,text:t,t:Date.now(),seen:mine}); if(b.notes.length>30) b.notes.length=30;
    saveQuiet(); fanfare(); toast(mine?'📌 Nota pegada':'📌 ¡Mensaje pegado! '+p.name+' lo verá al entrar.'); renderBoardNotes(); };
  f.append(inp,st,send); N.append(f);
  if(!b.notes.length) N.append(el('div','counter','Todavía no hay notas.'));
  b.notes.forEach((n,i)=>{ const d=el('div','bnote'); d.style.background=['#fff3a8','#ffd1dc','#d6ecff','#dff5d8'][i%4]; d.style.transform=`rotate(${(i%3-1)*1.5}deg)`;
    const dt=new Date(n.t); d.innerHTML=`<div class="bfrom">${esc(n.from)} · ${dt.getDate()}/${dt.getMonth()+1}</div><div class="btxt">${esc(n.text)}</div>`;
    const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(n.from+' dice: '+n.text); d.append(sp);
    if(mine||n.fromId===me.id){ const x=el('button','bdel','✖'); x.onclick=()=>{ b.notes.splice(i,1); saveQuiet(); renderBoardNotes(); }; d.append(x); }
    N.append(d); });
}
(function setupBoardCanvas(){
  const cv=document.getElementById('bd-cv'); if(!cv) return;
  const pos=ev=>{ const r=cv.getBoundingClientRect(); return [(ev.clientX-r.left)*800/r.width,(ev.clientY-r.top)*500/r.height]; };
  cv.addEventListener('pointerdown',ev=>{ if(!BD||!BD.mine) { if(BD) toast('Esta pizarra es de '+BD.p.name+'. ¡Déjale un mensaje!'); return; } BD.draw=true; BD.last=pos(ev); cv.setPointerCapture(ev.pointerId); stroke(BD.last,BD.last); });
  cv.addEventListener('pointermove',ev=>{ if(!BD||!BD.draw) return; const q=pos(ev); stroke(BD.last,q); BD.last=q; });
  const end=()=>{ if(!BD||!BD.draw) return; BD.draw=false; boardOf(BD.p).img=cv.toDataURL('image/png'); saveQuiet(); };
  cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);
  function stroke(a,b){ const c=cv.getContext('2d'); c.save(); c.lineCap='round'; c.lineJoin='round';
    if(BD.erase){ c.globalCompositeOperation='destination-out'; c.lineWidth=34; } else { c.strokeStyle=BD.col; c.lineWidth=BD.w; c.globalAlpha=0.92; }
    c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0]+0.01,b[1]); c.stroke(); c.restore(); }
})();
$('#bd-back').onclick=()=>{ const p=BD&&BD.p; BD=null; if(p){ houseView='room'; openHouse(DB.profiles.indexOf(p)); } else show('village'); };
async function boardNotice(p){
  const n=boardOf(p).notes.filter(x=>!x.seen&&x.fromId!==p.id);
  if(!n.length) return;
  const who=[...new Set(n.map(x=>x.from))].join(' y ');
  const r=await say({face:'🖍️',name:'¡Mensajes en tu pizarra!',text:`${who} te ha${n.length>1?'n':''} dejado ${n.length===1?'un mensaje':n.length+' mensajes'} en la pizarra de tu casa.`,buttons:[{t:'Luego'},{t:'🖍️ Ir a verla',cls:'primary'}]});
  if(r===1) openBoardView(p);
}
