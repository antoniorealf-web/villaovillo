/* =========================================================
   CASA Y JARDÍN
   ========================================================= */
let houseIdx=0, invSel=null;
function openHouse(i){ houseIdx=i; invSel=null; show('house'); renderHouse(); sizeGarden(); }
function renderHouse(){
  const p=DB.profiles[houseIdx]; const mine=houseIdx===DB.cur&&!VISIT;
  $('#house-title').textContent=mine?'🏡 Mi casa':'🏡 Casa de '+p.name;
  $('#house-coins').textContent='🔘 '+P().coins;
  $('#hv-garden').classList.toggle('sel',houseView==='garden'); $('#hv-room').classList.toggle('sel',houseView==='room');
  GD.mode=houseView; setupGardenCanvas(p,mine);
  const inv=$('#inv'); inv.innerHTML='';
  if(houseView==='room'){ if(mine){ renderRoomPanel(inv,p); const sb=el('button','btn blue','🏪 Ir a la tienda'); sb.onclick=()=>{ shopTab='casa'; openShop(); }; inv.append(sb); } else { inv.append(el('div','help',`<div>Esta es la casa de ${esc(p.name)}. ¡Qué bonita!</div>`)); const R=roomOf(p); if(R.wl.includes('fu_pizarra')) inv.append(el('div','help','<div>🖍️ Toca su pizarra para dejarle un mensaje.</div>')); if(R.fl.includes('fu_pecera')) inv.append(el('div','help','<div>🐠 Toca su pecera para verla en grande.</div>')); } return; }
  if(mine){
    const growing=p.garden.some(c=>c&&c.g<c.need);
    const wb=el('button','btn '+(needsWater(p)?'blue':'')+' waterbtn', p.lastWater===today()?'💧 Regado hoy ✓':'💧 Regar el jardín');
    wb.disabled=p.lastWater===today(); wb.onclick=waterGarden; inv.append(wb);
    if(!growing && p.lastWater!==today()) inv.append(el('div','counter','Planta semillas para que tenga sentido regar. ¡También ganas botones regando!'));
    inv.append(el('div','lbl','Mi cesta'));
    const ig=el('div','invgrid'); const keys=Object.keys(p.inv).filter(k=>p.inv[k]>0&&!k.startsWith('fu_'));
    if(!keys.length) ig.append(el('div','counter','Tu cesta está vacía. ¡Completa encargos para ganar plantas o compra en la tienda!'));
    keys.forEach(k=>{ const info=itemInfo(k); const b=el('button','invitem'+(invSel===k?' sel':'')); b.innerHTML=`${info.e}${info.f?`<span class="fr">${info.f}</span>`:''}<small>×${p.inv[k]}</small>`; b.title=info.n;
      b.onclick=()=>{ invSel=invSel===k?null:k; beep(600,0.04); renderHouse(); if(invSel) toast(info.n+': toca un hueco del jardín',1600); }; ig.append(b); });
    inv.append(ig);
    inv.append(el('div','help','<div>💡 Las plantas nacen como semilla 🌱. Riégalas un día tras otro y florecerán. Las flores tardan 2 días y los árboles 3. Lo que ya ha florecido o lo que compras en la tienda lo puedes mover.</div>'));
    const sb=el('button','btn blue','🏪 Ir a la tienda'); sb.onclick=openShop; inv.append(sb);
    const lk=el('button','btn','👗 Cambiar mi aspecto'); lk.onclick=editLook; inv.append(lk);
  } else inv.append(el('div','help',`<div>Este es el jardín de ${esc(p.name)}. ¡Solo ella puede cambiarlo!</div>`));
  inv.append(el('div','lbl','Pulsera'));
  const br=el('div','chip bracelet'); renderBracelet(br,p); inv.append(br);
}
