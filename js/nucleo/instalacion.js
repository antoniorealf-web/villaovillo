"use strict";
/* =========================================================
   INSTALACIÓN Y VERSIONES (juego instalable y sin wifi)
   ========================================================= */
/* sw.js guarda una copia del juego en la tablet. Aquí se registra y se ponen las versiones nuevas:
   solo en la pantalla de inicio (nadie jugando), nunca a mitad de partida. */
const VILLA_VERSION=(document.querySelector('meta[name="villa-version"]')||{}).content||'?';
const SW={reg:null, hadCtrl:false, prompt:null, reloading:false};
function versionTexto(v){ const m=/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(v||''); return m?`${+m[3]}/${+m[2]}/${m[1]} ${m[4]}:${m[5]}`:(v||'?'); }
function esInstalado(){ try{ return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true; }catch(e){ return false; } }
function swPonerVersionNueva(){ if(SW.reg&&SW.reg.waiting){ SW.reg.waiting.postMessage('actualizar'); return true; } return false; }
function swTick(){ // pone la versión nueva si está descargada y nadie está jugando
  if(!SW.reg||!SW.reg.waiting||!SW.hadCtrl) return;
  if(curScreen!=='profiles'||document.querySelector('#dlg.on')) return;
  swPonerVersionNueva();
}
async function swInit(){
  if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol)) return;
  addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); SW.prompt=e; });
  SW.hadCtrl=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(!SW.hadCtrl||SW.reloading) return; SW.reloading=true; location.reload(); });
  try{
    SW.reg=await navigator.serviceWorker.register('sw.js');
    // en cuanto termina de descargarse una versión nueva, se intenta poner (solo si nadie juega)
    const vigilar=w=>{ if(w) w.addEventListener('statechange',()=>{ if(w.state==='installed') swTick(); }); };
    SW.reg.addEventListener('updatefound',()=>vigilar(SW.reg.installing));
    vigilar(SW.reg.installing); // por si la descarga empezó antes de llegar aquí
    swTick();
    setInterval(swTick,20000);
    const buscar=()=>{ try{ SW.reg.update(); }catch(e){} };
    setInterval(buscar,30*60*1000);
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') buscar(); }); // al volver a la tablet desde otra app
  }catch(e){ SW.err=String(e&&e.message||e); }
}
/* Apartado del modo alcalde */
function renderInstalacionBox(box){
  const b=box('📲 El juego en esta tablet');
  const inst=esInstalado(), ctrl=!!(navigator.serviceWorker&&navigator.serviceWorker.controller), wait=!!(SW.reg&&SW.reg.waiting);
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const lines=[
    `Versión: <b>${esc(versionTexto(VILLA_VERSION))}</b>`,
    inst?'✅ Instalado: se abre desde su icono.':'📄 Abierto en el navegador, sin instalar.',
    ctrl?'✅ Listo para jugar sin internet.':(SW.err?'⚠️ No se ha podido preparar sin internet: '+esc(SW.err):'⏳ Se preparará para jugar sin internet la próxima vez que se abra con conexión.'),
    wait?'🆕 Hay una versión nueva descargada. Se pondrá sola la próxima vez que se vuelva a la pantalla de inicio.':'',
  ].filter(Boolean);
  b.append(el('div','counter',lines.join('<br>')));
  const r=el('div'); r.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin-top:8px';
  if(!inst){
    if(SW.prompt){ const bi=el('button','btn primary','📲 Instalar en esta tablet'); bi.onclick=async()=>{ try{ SW.prompt.prompt(); await SW.prompt.userChoice; }catch(e){} SW.prompt=null; renderAlcalde(); }; r.append(bi); }
    b.append(el('div','counter',ios?'Para instalarlo: en Safari, botón Compartir (el cuadrado con la flecha) → «Añadir a pantalla de inicio». Después ábrelo siempre desde ese icono.':'Para instalarlo: menú ⋮ del navegador → «Instalar aplicación» o «Añadir a pantalla de inicio». Después ábrelo siempre desde ese icono.'));
  }
  if(wait){ const bu=el('button','btn green','🆕 Poner la versión nueva ahora'); bu.onclick=()=>swPonerVersionNueva(); r.append(bu); }
  else if(SW.reg){ const bc=el('button','btn','🔄 Buscar versión nueva'); bc.onclick=async()=>{ toast('Buscando…'); try{ await SW.reg.update(); }catch(e){} setTimeout(()=>{ toast(SW.reg.waiting||SW.reg.installing?'🆕 Hay una versión nueva: se está descargando':'Ya tienes la última versión'); renderAlcalde(); },2500); }; r.append(bc); }
  if(r.children.length) b.append(r);
}
