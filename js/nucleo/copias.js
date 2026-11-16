/* =========================================================
   PERFILES: nube y copias de seguridad
   ========================================================= */
function b64e(s){ return btoa(unescape(encodeURIComponent(s))); }
function b64d(s){ return decodeURIComponent(escape(atob(s))); }
function renderProfileTools(){
  const t=$('#ptools'); if(!t) return; t.innerHTML='';
  if(TEST){ const tb=el('div','wnote'); tb.style.maxWidth='720px'; tb.innerHTML='🧪 <b>Modo prueba:</b> aquí las partidas son aparte y no tocan las de tus hijas. Puedes crear jugadoras de prueba o copiar las reales.'; const r1=el('div','toolsrow'); r1.style.marginTop='8px';
    const cp=el('button','btn','📋 Copiar partidas reales'); cp.onclick=()=>{ try{ const d=JSON.parse(localStorage.getItem('villaovillo.v1')); if(!d) throw 0; DB.profiles=d.profiles.map(migrate); saveQuiet(); renderProfiles(); toast('Copiadas: los cambios aquí no les afectan'); }catch(e){ toast('No hay partidas reales en este navegador'); } };
    const q6=el('button','btn','➕ Prueba 6-7 años'); q6.onclick=()=>{ const i=DB.profiles[0]?1:0; DB.profiles[i]=newProfile('Prueba 6',6,'#e4574f'); DB.profiles[i].met=true; saveQuiet(); renderProfiles(); };
    const q9=el('button','btn','➕ Prueba 8-10 años'); q9.onclick=()=>{ const i=DB.profiles[0]?1:0; DB.profiles[i]=newProfile('Prueba 9',9,'#a678d6'); DB.profiles[i].met=true; saveQuiet(); renderProfiles(); };
    const ct=el('button','btn','📚 Catálogo'); ct.onclick=openCatalog;
    r1.append(cp,q6,q9,ct); tb.append(r1); t.append(tb); }
  const chip=el('div','chip cloudchip'); chip.id='cloudchip'; chip.innerHTML=cloudLabel(); t.append(chip);
  if(!TEST){ const cb=el('button','btn','⚙️ Nube'); cb.onclick=async()=>{ if(await askPin()) configCloud(); }; t.append(cb); }
  const al=el('button','btn','🎩 Alcalde'); al.onclick=()=>openAlcalde(); t.append(al);
  const bk=el('button','btn','💾 Copia de seguridad'); bk.onclick=async()=>{ if(await askPin()) showBackup(); }; t.append(bk);
  const rs=el('button','btn','♻️ Restaurar'); rs.onclick=async()=>{ if(await askPin()) restoreBackup(); }; t.append(rs);
}
async function configCloud(){
  const pr=say({center:true,face:'☁️',name:'Nube familiar',speak:false,
    html:`<div style="font-size:18px">Escribe la clave de la familia (la que pusiste en el script de Google).</div><input class="inputline" id="cl-key" type="password" value="${esc(cloudKey())}" placeholder="Clave">${CFG.scriptUrl?'':'<div class="counter">Aún falta la dirección del script en config.js.</div>'}`,
    buttons:[{t:'Cancelar'},{t:'Guardar y probar',cls:'primary'}]});
  const r=await pr; if(r!==1) return;
  const v=document.getElementById('cl-key').value.trim();
  try{ localStorage.setItem('villaovillo.clave',v); }catch(e){}
  const ok=await cloudPull(true); renderProfiles();
  toast(ok?'☁️ ¡Conectado a la nube!':'No se pudo conectar. Revisa la clave.');
  if(ok) for(const p of DB.profiles) if(p){ const c=DB.cur; DB.cur=DB.profiles.indexOf(p); await pushCloud(); DB.cur=c; }
}
async function showBackup(){
  const code='VO1:'+b64e(JSON.stringify({profiles:DB.profiles}));
  const pr=say({center:true,face:'💾',name:'Copia de seguridad',speak:false,
    html:`<div style="font-size:18px">Copia este código y guárdalo (por ejemplo, envíatelo por WhatsApp). Con él se recupera la partida de las dos.</div><textarea class="code" id="bk-code" readonly>${esc(code)}</textarea><button class="btn blue" id="bk-copy">📋 Copiar</button>`,
    buttons:[{t:'Cerrar',cls:'primary'}]});
  $('#bk-copy').onclick=async()=>{ try{ await navigator.clipboard.writeText(code); toast('📋 Código copiado'); }catch(e){ const ta=$('#bk-code'); ta.select(); toast('Selecciona el texto y cópialo'); } };
  await pr;
}
/* Botones para rellenar «Restaurar» con la copia automática del día o con una partida apartada por estar dañada */
function autoCopyButtons(){
  const src=[]; try{ const c=localStorage.getItem(KEY+'.copia'), f=localStorage.getItem(KEY+'.copiaFecha'); if(c) src.push(['copia','📅 Usar la copia automática del '+(f||'?').split('-').reverse().join('/')]);
    if(localStorage.getItem(KEY+'.danada')) src.push(['danada','🩹 Intentar recuperar la partida apartada']); }catch(e){}
  return src.map(([k,t])=>`<button class="btn" style="margin-top:8px" onclick="fillRestore('${k}')">${t}</button>`).join(' ');
}
function fillRestore(k){
  try{ const d=JSON.parse(localStorage.getItem(KEY+'.'+k)); document.getElementById('rs-code').value='VO1:'+b64e(JSON.stringify({profiles:d.profiles})); toast('Copia cargada: pulsa «Restaurar»'); }
  catch(e){ toast('Esa copia no se puede leer'); }
}
async function restoreBackup(){
  const r=await say({center:true,face:'♻️',name:'Restaurar partida',speak:false,
    html:`<div style="font-size:18px">Pega aquí el código de la copia de seguridad. <b>Sustituirá</b> las partidas de esta tablet.</div><textarea class="code" id="rs-code" placeholder="VO1:..."></textarea>${autoCopyButtons()}`,
    buttons:[{t:'Cancelar'},{t:'Restaurar',cls:'primary'}]});
  if(r!==1) return;
  const v=(document.getElementById('rs-code').value||'').trim();
  try{
    if(!v.startsWith('VO1:')) throw 0;
    const d=JSON.parse(b64d(v.slice(4)));
    if(!d.profiles||d.profiles.length!==2) throw 0;
    DB.profiles=d.profiles.map(migrate); DB.profiles.forEach(p=>{ if(p) p.updatedAt=Date.now(); });
    saveQuiet(); renderProfiles(); toast('✅ Partidas restauradas');
    if(cloudReady()) for(let i=0;i<2;i++) if(DB.profiles[i]){ const c=DB.cur; DB.cur=i; await pushCloud(); DB.cur=c; }
  }catch(e){ toast('Ese código no es válido'); }
}
