"use strict";
/* =========================================================
   CASA Y JARDÍN
   ========================================================= */
let houseIdx=0, invSel=null;
function openHouse(i){ houseIdx=i; invSel=null; GD.girar=false; GD.fantasma=null; GD.mano=null; show('house'); renderHouse(); sizeGarden(); }
function renderHouse(){
  const p=DB.profiles[houseIdx]; const mine=houseIdx===DB.cur&&!VISIT;
  $('#house-title').textContent=mine?'🏡 Mi casa':'🏡 Casa de '+p.name;
  $('#house-coins').textContent='🔘 '+P().coins;
  $('#hv-garden').classList.toggle('sel',houseView==='garden'); $('#hv-room').classList.toggle('sel',houseView==='room');
  GD.mode=houseView; setupGardenCanvas(p,mine);
  const inv=$('#inv'); inv.innerHTML='';
  if(houseView==='room'){ if(mine){ renderRoomPanel(inv,p); const sb=el('button','btn blue','🏪 Ir a la tienda'); sb.onclick=()=>{ shopTab='casa'; openShop(); }; inv.append(sb); } else { inv.append(el('div','help',`<div>Esta es la casa de ${esc(p.name)}. ¡Qué bonita!</div>`)); const R=roomOf(p); if(R.wl.includes('fu_pizarra')) inv.append(el('div','help','<div>🖍️ Toca su pizarra para dejarle un mensaje.</div>')); if(casaTiene(R,'fu_pecera')) inv.append(el('div','help','<div>🐠 Toca su pecera para verla en grande.</div>')); } return; }
  if(mine){
    const growing=jdPlantas(p).some(plQuiereAgua); jardinAviso(p);
    const wb=el('button','btn '+(needsWater(p)?'blue':'')+' waterbtn', p.lastWater===today()?'💧 Regado hoy ✓':'💧 Regar el jardín');
    wb.disabled=p.lastWater===today(); wb.onclick=waterGarden; inv.append(wb);
    if(!growing && p.lastWater!==today()) inv.append(el('div','counter','Planta semillas para que tenga sentido regar. ¡También ganas botones regando!'));
    const pid=plPidenAbono(p), dosis=p.inv.sh_abono||0;
    if(pid.length||dosis){ const ab=el('button','btn'+(pid.length?' green':''),pid.length?`🌾 Echar abono (${pid.length===1?'1 planta lo pide':pid.length+' plantas lo piden'})`:'🌾 Ninguna planta pide abono'); ab.disabled=!pid.length;
      ab.onclick=()=>{ if(!dosis){ toast('No te queda abono. Cómpralo en la tienda de Coco 🌾',2400); return; } const r=plAbona(p); beep(650,0.06,'triangle'); save('Echó abono'); renderHouse(); toast(r.faltan?`🌾 ¡Abonadas ${r.n}! Te falta abono para ${r.faltan}.`:`🌾 ¡Abonada${r.n>1?'s':''}! Ya pueden seguir creciendo.`,2400); };
      inv.append(ab); inv.append(el('div','counter',`Te quedan ${dosis} ${dosis===1?'dosis':'dosis'} de abono`)); }
    if(GD.mano!=null&&p.jardin.cel[GD.mano]){ const o=p.jardin.cel[GD.mano];
      inv.append(el('div','help',`<div>✋ Llevas: <b>${esc(itemInfo(o.k).n)}</b>${plTipo(o.k)?' · '+esc(plEtapa(o).n):''}. Toca un hueco verde para ponerlo ahí.</div>`));
      const gc=el('button','btn','📦 Guardar en la cesta'); gc.onclick=()=>jdGuarda(p); inv.append(gc);
      const sl=el('button','btn','✋ Dejarlo donde estaba'); sl.onclick=()=>{ jdSoltar(); renderHouse(); }; inv.append(sl); }
    inv.append(el('div','lbl','Mi cesta'));
    const ig=el('div','invgrid'); const keys=Object.keys(p.inv).filter(k=>p.inv[k]>0&&!k.startsWith('fu_')&&k!=='sh_abono');
    if(!keys.length) ig.append(el('div','counter','Tu cesta está vacía. ¡Completa encargos para ganar plantas o compra en la tienda!'));
    keys.forEach(k=>{ const info=itemInfo(k); const b=el('button','invitem'+(invSel===k?' sel':'')); b.innerHTML=`${info.e}${info.f?`<span class="fr">${info.f}</span>`:''}<small>×${p.inv[k]}</small>`; b.title=info.n;
      b.onclick=()=>{ invSel=invSel===k?null:k; GD.girar=false; GD.fantasma=null; GD.mano=null; beep(600,0.04); renderHouse(); if(invSel){ const [w,h]=jdTam(k); toast(info.n+(jdEsCamino(k)?': toca el césped para poner el camino':w*h>1?`: ocupa ${w}×${h} casillas. Toca un hueco verde`:': toca un hueco verde'),1800); } }; ig.append(b); });
    inv.append(ig);
    const gb=el('button','btn'+(GD.girar?' blue':''),GD.girar?'↔️ Toca algo para girarlo · Terminar':'↔️ Dar la vuelta a algo');
    gb.onclick=()=>{ GD.girar=!GD.girar; invSel=null; GD.mano=null; beep(600,0.04); renderHouse(); }; inv.append(gb);
    inv.append(el('div','help','<div>💡 Las plantas nacen como semilla 🌱. Riégalas un día tras otro: las flores tardan 4 riegos y los árboles, un mes en ser árbol joven (y luego siguen creciendo). A veces piden abono 🌾: cómpralo en la tienda. Toca algo del jardín para moverlo a otro sitio; los árboles, la fuente o la noria ocupan varias casillas y los caminos van por debajo.</div>'));
    const sb=el('button','btn blue','🏪 Ir a la tienda'); sb.onclick=openShop; inv.append(sb);
    const lk=el('button','btn','👗 Cambiar mi aspecto'); lk.onclick=editLook; inv.append(lk);
  } else inv.append(el('div','help',`<div>Este es el jardín de ${esc(p.name)}. ¡Solo ella puede cambiarlo!</div>`));
  inv.append(el('div','lbl','Pulsera'));
  const br=el('div','chip bracelet'); renderBracelet(br,p); inv.append(br);
}
