"use strict";
/* =========================================================
   NAVEGACIÓN
   ========================================================= */
let curScreen='profiles';
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{ stopSpeak(); show(b.dataset.go); }));

/* ---------- diálogo ---------- */
function say({face='', name='', text='', html='', buttons=[{t:'¡Vale!',cls:'primary'}], center=false, speak=true}){
  return new Promise(res=>{
    const box=$('#dlgbox'); box.innerHTML='';
    if(face||name){ const h=el('div','dlghead'); h.append(faceEl(face,68), el('div','dlgname',esc(name)));
      if(text){ const sp=el('button','speak','🔊'); sp.onclick=()=>speakNow(text); h.append(sp); } box.append(h); }
    if(text) box.append(el('div','dlgtext',esc(text)));
    if(html){ const d=el('div'); d.innerHTML=html; box.append(d); }
    const bb=el('div','dlgbtns');
    buttons.forEach((b,i)=>{ const x=el('button','btn '+(b.cls||''),b.t); x.onclick=()=>{ $('#dlg').classList.remove('on','center'); stopSpeak(); res(i); }; bb.append(x); });
    box.append(bb);
    $('#dlg').classList.toggle('center',center); $('#dlg').classList.add('on');
    if(speak && text) speakAuto(text);
  });
}
let toastT=null;
function toast(t, ms=2600){ const e=$('#toast'); e.textContent=t; e.style.display='block'; clearTimeout(toastT); toastT=setTimeout(()=>e.style.display='none',ms); }
