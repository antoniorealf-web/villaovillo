/* =========================================================
   PERFILES
   ========================================================= */
const DRESS=['#e4574f','#4a8fdc','#a678d6','#55b05a','#f29b38','#e46fa8'];
function renderProfiles(){
  const wrap=$('#slots'); wrap.innerHTML='';
  DB.profiles.forEach((p,i)=>{
    const s=el('div','slot');
    if(p){
      const av=avatarCanvas(p,120); s.append(av);
      s.append(el('div','big',esc(p.name)));
      const nd=Object.keys(p.done).length;
      s.append(el('div','meta',`Nivel ${p.unlocked} · ${LEVELS[p.unlocked]}<br>${nd} encargos · 🔘 ${p.coins} botones`));
      const b=el('button','btn primary','¡A jugar!'); b.onclick=async()=>{ if(await askGirlCode(i)) enterGame(i); }; s.append(b);
      const del=el('button','smalllink','Borrar partida'); del.onclick=async()=>{ if(!(await askPin())) return;
        const r=await say({face:'⚠️',name:'¿Seguro?',text:`Se borrará toda la partida de ${p.name}. No se puede deshacer.`,buttons:[{t:'No, volver'},{t:'Sí, borrar',cls:'primary'}],center:true,speak:false});
        if(r===1){ DB.profiles[i]=null; save(); renderProfiles(); }
      }; s.append(del);
    } else {
      s.append(el('div','big','Nueva jugadora'));
      const inp=el('input'); inp.placeholder='Tu nombre'; inp.maxLength=14; s.append(inp);
      s.append(el('div','meta','¿Cuántos años tienes?'));
      const ch=el('div','choice'); let age=null;
      [['6','6-7 años'],['9','8-10 años']].forEach(([v,t])=>{ const b=el('button','',t); b.onclick=()=>{age=+v; ch.querySelectorAll('button').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');}; ch.append(b); });
      s.append(ch);
      s.append(el('div','meta','Peinado y pelo'));
      const look={hair:HAIR_COLORS[i===0?0:2][0],style:i===0?'coletas':'melena',skin:SKINS[0]};
      const prev=el('div'); const drawPrev=()=>{ prev.innerHTML=''; prev.append(heroCanvas(Object.assign({},look,{dress:color}),96)); };
      const hs=el('div','choice'); HAIR_STYLES.forEach(([v,n])=>{ const b=el('button',v===look.style?'sel':'',n); b.onclick=()=>{ look.style=v; hs.querySelectorAll('button').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); drawPrev(); }; hs.append(b); });
      const hc=el('div','choice'); HAIR_COLORS.forEach(([v,n])=>{ const d=el('button','dot'+(v===look.hair?' sel':'')); d.style.background=v; d.title=n; d.onclick=()=>{ look.hair=v; hc.querySelectorAll('.dot').forEach(x=>x.classList.remove('sel')); d.classList.add('sel'); drawPrev(); }; hc.append(d); });
      s.append(hs,hc);
      s.append(el('div','meta','Elige tu color'));
      const cc=el('div','choice'); let color=DRESS[i===0?0:2];
      DRESS.forEach(c=>{ const d=el('button','dot'+(c===color?' sel':'')); d.style.background=c; d.onclick=()=>{color=c; cc.querySelectorAll('.dot').forEach(x=>x.classList.remove('sel')); d.classList.add('sel'); drawPrev();}; cc.append(d); });
      s.append(cc); s.prepend(prev); drawPrev();
      const go=el('button','btn green','Crear'); go.onclick=()=>{
        const name=inp.value.trim(); if(!name){ inp.classList.add('shake'); setTimeout(()=>inp.classList.remove('shake'),400); inp.focus(); return; }
        if(!age){ ch.classList.add('shake'); setTimeout(()=>ch.classList.remove('shake'),400); return; }
        DB.profiles[i]=newProfile(name,age,color); DB.profiles[i].look=look; save(); renderProfiles();
      }; s.append(go);
    }
    wrap.append(s);
  });
  renderProfileTools();
}
function avatarCanvas(p, size){ return heroCanvas(lookOf(p),size); }

async function enterGame(i){
  DB.cur=i; save(); show('village');
  const p=P();
  if(!p.met){
    p.met=true; save();
    await say({face:'🐑',name:NPCS.rosa.n,text:`¡Hola, ${p.name}! Bienvenida a Villaovillo. Nuestro taller del telar necesita una tejedora… ¡y creo que eres tú!`});
    await say({face:'🐑',name:NPCS.rosa.n,text:'Toca el suelo para caminar y toca los edificios para entrar. Empieza por el taller, el edificio del ovillo. Cada encargo que termines hará crecer el pueblo y tu jardín.'});
  } else if(p.days.last===today()) toast(`¡Hola de nuevo, ${p.name}!`);
  await newDayCheck();
  if(P()===p) await showNews(p);
  if(P()===p) await boardNotice(p);
}
