"use strict";
/* =========================================================
   CÓDIGOS DE ENTRADA (cada niña y el alcalde)
   ========================================================= */
/* p.code = código de 4 números de cada niña (papá los ve en el modo alcalde). El del alcalde sigue en villaovillo.pinLocal. */
function askKeypad({face='🔑',name='',text='',len=4,free=false}){
  return new Promise(res=>{
    let v='';
    say({face,name,text,speak:false,center:true,html:`<div class="kpdots" id="kp-dots"></div><div class="kpad">${['1','2','3','4','5','6','7','8','9','⌫','0',free?'✔':'·'].map(k=>`<button class="btn kpk${k==='✔'?' green':''}" data-k="${k}"${k==='·'?' style="visibility:hidden"':''}>${k}</button>`).join('')}</div>`,
      buttons:[{t:'Volver'},{t:'ok',cls:'kphidden'}]}).then(i=>res(i===1?v:null));
    const draw=()=>{ const d=document.getElementById('kp-dots'); if(d) d.innerHTML=Array.from({length:free?Math.max(4,v.length):len},(_,i)=>`<span class="${i<v.length?'on':''}"></span>`).join(''); };
    const submit=()=>{ const ok=document.querySelector('#dlg .dlgbtns .kphidden'); if(ok) ok.click(); };
    draw();
    document.querySelectorAll('#dlg .kpk').forEach(b=>b.onclick=()=>{ const k=b.dataset.k; if(k==='✔'){ if(v.length>=4) submit(); else toast('Faltan números'); return; } if(k==='⌫') v=v.slice(0,-1); else if(v.length<len) v+=k; beep(600,0.03); draw();
      if(!free&&v.length===len) setTimeout(submit,180); });
  });
}
async function askGirlCode(i){
  const p=DB.profiles[i]; if(!p) return false;
  if(TEST&&!p.code) return true;
  if(!p.code){
    const a=await askKeypad({name:'¡Hola, '+p.name+'!',text:'Elige tu código secreto: 4 números que solo sepas tú (papá también los guarda por si se te olvidan).'}); if(!a) return false;
    const b=await askKeypad({name:'Repite tu código',text:'Escríbelo otra vez para no olvidarlo.'}); if(!b) return false;
    if(a!==b){ toast('No coinciden. ¡Vuelve a intentarlo!'); return false; }
    p.code=a; saveQuiet(); toast('🔑 ¡Código guardado! Recuérdalo para la próxima vez.',3200); return true;
  }
  for(let k=0;k<3;k++){
    const c=await askKeypad({name:p.name,text:k?'Ese no es. Prueba otra vez.':'Escribe tu código secreto.'}); if(c===null) return false;
    if(c===p.code) return true; beep(220,0.2,'sawtooth',0.03);
  }
  toast('Si no te acuerdas de tu código, pregúntale a papá 🎩',3500); return false;
}
async function askPin(){
  let stored=null; try{ stored=localStorage.getItem('villaovillo.pinLocal'); }catch(e){}
  if(!stored){
    const a=await askKeypad({face:'🎩',name:'Crea el código del alcalde',text:'Elige 4 números. Solo papá debe saberlos.'}); if(!a) return false;
    const b=await askKeypad({face:'🎩',name:'Repite el código del alcalde',text:'Otra vez, para comprobarlo.'}); if(!b) return false;
    if(a!==b){ toast('No coinciden'); return false; }
    try{ localStorage.setItem('villaovillo.pinLocal',pinHash(a)); }catch(e){} toast('🔐 Código del alcalde guardado'); return true;
  }
  const v=await askKeypad({face:'🎩',name:'Modo alcalde',text:'Escribe el código del alcalde y pulsa ✔.',len:8,free:true}); if(v===null) return false;
  if(pinHash(v)!==stored){ toast('Código incorrecto'); return false; }
  return true;
}
function renderCodesBox(V,box){
  const b=box('🔑 Códigos de entrada');
  b.append(el('div','counter','Cada niña entra con su código. Si no tiene, lo elige ella la próxima vez que entre. Aquí puedes verlos y cambiarlos.'));
  girlsIdx().forEach(i=>{ const p=DB.profiles[i]; const row=el('div','mitem'); row.style.cssText='padding:8px 12px;align-items:center;margin-top:8px';
    row.innerHTML=`<div class="mi"><span class="dot" style="width:24px;height:24px;background:${p.color};display:inline-block"></span></div><div class="mt"><b>${esc(p.name)}</b> ${p.code?`<span style="font-size:24px;letter-spacing:6px;font-weight:800">${esc(p.code)}</span>`:'<span class="counter">sin código todavía</span>'}</div>`;
    const a=el('div','ma'); const ch=el('button','btn','✏️ Cambiar'); ch.onclick=async()=>{ const c=await askKeypad({face:'🔑',name:'Nuevo código de '+p.name,text:'4 números.'}); if(!c) return; if(await alcHaz(p.id,'set',{campo:'code',valor:c},'Código nuevo de '+p.name)) toast('Código cambiado'); renderAlcalde(); };
    const qu=el('button','btn','🗑️ Quitar'); qu.onclick=async()=>{ if(await alcHaz(p.id,'set',{campo:'code',valor:''},'Quitar el código de '+p.name)) toast(p.name+' elegirá uno nuevo al entrar'); renderAlcalde(); };
    a.append(ch,qu); row.append(a); b.append(row); });
  const cp=el('button','btn','🎩 Cambiar el código del alcalde'); cp.style.marginTop='10px'; cp.onclick=async()=>{ try{ localStorage.removeItem('villaovillo.pinLocal'); }catch(e){} if(!(await askPin())) toast('El código del alcalde se pedirá al volver a entrar'); };
  if(!REMOTO) b.append(cp);
}
