"use strict";
/* =========================================================
   DISEÑO LIBRE
   ========================================================= */
let DR={w:8,h:8,cells:[],col:'r',painting:false};
function openDraw(){ DR.cells=Array(DR.w*DR.h).fill('w'); renderDraw(); show('draw'); }
function renderDraw(){
  const g=$('#drawgrid'); g.innerHTML=''; g.style.gridTemplateColumns=`repeat(${DR.w},auto)`;
  DR.cells.forEach((k,i)=>{ const c=el('div','dcell'); c.style.background=COLORS[k].c; c.dataset.i=i; g.append(c); });
  const pal=$('#draw-pal'); pal.innerHTML='';
  COLOR_KEYS.forEach(k=>{ const c=colorCard(k); if(DR.col===k) c.style.outline='4px solid #2f5f96'; c.onclick=()=>{DR.col=k; renderDraw();}; pal.append(c); });
  const sz=$('#draw-size'); sz.innerHTML='';
  [[6,6],[8,8],[10,8]].forEach(([w,h])=>{ const b=el('button',(DR.w===w&&DR.h===h)?'sel':'',`${w}×${h}`); b.onclick=()=>{ DR.w=w; DR.h=h; DR.cells=Array(w*h).fill('w'); renderDraw(); }; sz.append(b); });
}
function paintAt(x,y){ const t=document.elementFromPoint(x,y); if(t&&t.classList.contains('dcell')){ const i=+t.dataset.i; if(DR.cells[i]!==DR.col){ DR.cells[i]=DR.col; t.style.background=COLORS[DR.col].c; beep(600+COLOR_KEYS.indexOf(DR.col)*40,0.03,'triangle',0.03); } } }
$('#drawgrid').addEventListener('pointerdown',e=>{ DR.painting=true; paintAt(e.clientX,e.clientY); });
window.addEventListener('pointermove',e=>{ if(DR.painting) paintAt(e.clientX,e.clientY); });
window.addEventListener('pointerup',()=>DR.painting=false);
$('#draw-clear').onclick=()=>{ DR.cells=Array(DR.w*DR.h).fill('w'); renderDraw(); };
$('#draw-back').onclick=openWorkshop;
$('#draw-save').onclick=async()=>{
  const p=P(); const n=p.fabrics.filter(f=>f.free).length+1;
  p.fabrics.push({cells:DR.cells.slice(),w:DR.w,name:'Mi diseño '+n,free:true});
  let extra='';
  p.counters.designs++;
  if(!p.artist){ p.artist=true; p.beads.push('c:🎨'); extra='<div class="rw-items"><div class="rw-item">🎨 dije de artista para tu pulsera</div></div>'; }
  save(); fanfare();
  await say({center:true,html:`<div class="reward"><div style="font-size:56px">🧵</div><div style="font-size:26px;font-weight:800">¡Tela guardada!</div>${extra}<div style="font-size:18px">Ya está colgada en el tendedero del pueblo.</div></div>`});
  await afterRewards();
  openWorkshop();
};
