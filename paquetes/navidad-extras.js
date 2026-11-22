"use strict";
/* =========================================================
   NAVIDAD · extras: villancicos, retos navideños (telar y panadería), roscón de Reyes y rincón navideño del tablón
   - Villancicos de dominio público en caja de música; suenan con el resto de la música solo en Navidad.
   - Telar: los encargos son prendas de Navidad (bufandas, jerseys, gorros…), mismo nivel de siempre.
   - Panadería: «Turno de Navidad» con turrones y polvorones (las mismas cuentas de su nivel; cuenta como su turno).
   - Panadería, 6 y 7 de enero: roscón de Reyes con sorpresa o haba (una porción por niña).
   - Tablón: «Rincón de Navidad» con un dato, una tradición, un chiste o una adivinanza nuevos cada día.
   Lo que se guarda: p.paq.navidad.roscon = temporada (ya comió roscón).
   ========================================================= */
const navSolo=()=>typeof NAV!=='undefined'&&paqActivo(NAV);
[
  {n:'Noche de paz (Gruber, 1818)',bpm:84,bar:3,arp:'waltz',noche:true,solo:navSolo,
   chords:'C C C C G G C C F F C C F F C C G G C C C G C C',
   mel:'G4:1.5 A4:.5 G4 E4:3 G4:1.5 A4:.5 G4 E4:3 D5:2 D5 B4:3 C5:2 C5 G4:3 A4:2 A4 C5:1.5 B4:.5 A4 G4:1.5 A4:.5 G4 E4:3 A4:2 A4 C5:1.5 B4:.5 A4 G4:1.5 A4:.5 G4 E4:3 D5:2 D5 F5:1.5 D5:.5 B4 C5:3 E5:3 C5:1.5 G4:.5 E4 G4:1.5 F4:.5 D4 C4:6'},
  {n:'Jingle Bells (Pierpont, 1857)',bpm:126,bar:4,arp:'alberti',solo:navSolo,
   chords:'C C C C F C D7 G C C C C F C G7 C',
   mel:'E5 E5 E5:2 E5 E5 E5:2 E5 G5 C5:1.5 D5:.5 E5:4 F5 F5 F5:1.5 F5:.5 F5 E5 E5 E5:.5 E5:.5 E5 D5 D5 E5 D5:2 G5:2 E5 E5 E5:2 E5 E5 E5:2 E5 G5 C5:1.5 D5:.5 E5:4 F5 F5 F5:1.5 F5:.5 F5 E5 E5 E5:.5 E5:.5 G5 G5 F5 D5 C5:4'},
  {n:'Os deseamos una feliz Navidad (popular)',bpm:120,bar:3,arp:'waltz',solo:navSolo,
   chords:'G G C A D E7 Em D G',
   mel:'r2 D5 G5 G5:.5 A5:.5 G5:.5 F#5:.5 E5 E5 E5 A5 A5:.5 B5:.5 A5:.5 G5:.5 F#5 D5 D5 B5 B5:.5 C6:.5 B5:.5 A5:.5 G5 E5 D5:.5 D5:.5 E5 A5 F#5 G5:3'},
  {n:'Deck the Halls (popular galesa)',bpm:112,bar:4,arp:'alberti',solo:navSolo,
   chords:'C C G C C C G C G C D G C C F C',
   mel:'G5:1.5 F5:.5 E5 D5 C5 D5 E5 C5 D5:.5 E5:.5 F5:.5 D5:.5 E5:1.5 D5:.5 C5 B4 C5:2 G5:1.5 F5:.5 E5 D5 C5 D5 E5 C5 D5:.5 E5:.5 F5:.5 D5:.5 E5:1.5 D5:.5 C5 B4 C5:2 D5:1.5 E5:.5 F5 D5 E5:1.5 F5:.5 G5 D5 E5:.5 F#5:.5 G5 A5:.5 B5:.5 C6 B5 A5 G5:2 G5:1.5 F5:.5 E5 D5 C5 D5 E5 C5 A5:.5 A5:.5 A5:.5 A5:.5 G5:1.5 F5:.5 E5 D5 C5:2'}
].forEach(s=>{ if(!SONGS.some(x=>x.n===s.n)) SONGS.push(s); });

/* ---------- telar: prendas de Navidad ---------- */
NAV.enchufes.prendas=()=>['Bufanda de Navidad','Jersey de renos','Gorro de Navidad','Calcetín de Navidad','Mantita para el Belén','Jersey de copos'];

/* ---------- panadería: turno de Navidad y roscón ---------- */
const NAV_PAN_PAL=[[/🥐/g,'🍬'],[/🧁/g,'⭐'],[/🥖/g,'🍫'],[/🍩/g,'🔔'],[/🥨/g,'🎁'],[/\bpan\b/g,'turrón'],[/\bbollo\b/g,'polvorón'],[/\bgalletas\b/g,'galletas de jengibre'],[/\bbarras\b/g,'tabletas de turrón']];
function navPanTexto(s){ if(typeof s!=='string') return s; NAV_PAN_PAL.forEach(([a,b])=>{ s=s.replace(a,b); }); return s; }
function navTurnoNavidad(){
  const p=P(); MZ={qs:Array.from({length:p.age<=7?5:6},()=>{ const q=genMath(p); ['q','say','vis','exp'].forEach(k=>{ if(q[k]!=null) q[k]=navPanTexto(q[k]); }); return q; }),i:0,ok:0,tries:0,input:'',catalog:false};
  empezarTurno();
}
const NAV_ROSCON_SVG=`<svg viewBox="-70 -42 140 84" width="220" height="132"><ellipse cx="0" cy="6" rx="64" ry="30" fill="#c98a4a" stroke="#5a3a24" stroke-width="3"/><ellipse cx="0" cy="0" rx="62" ry="28" fill="#e3a764" stroke="#5a3a24" stroke-width="3"/>
  <ellipse cx="0" cy="0" rx="26" ry="11" fill="#f3ead8" stroke="#5a3a24" stroke-width="3"/>${[[-44,-6,'#e23b3b'],[-22,-20,'#3f9a5a'],[8,-22,'#f4c430'],[34,-14,'#e23b3b'],[48,4,'#3f9a5a'],[22,18,'#f29b38'],[-10,20,'#e23b3b'],[-40,14,'#f4c430']].map(([x,y,c])=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="${c}" stroke="#5a3a24" stroke-width="1.5"/>`).join('')}
  ${Array.from({length:24},(_,i)=>{ const a=i/24*Math.PI*2; return `<circle cx="${(Math.cos(a)*44).toFixed(1)}" cy="${(Math.sin(a)*19).toFixed(1)}" r="1.8" fill="#fffaf3"/>`; }).join('')}</svg>`;
function navRosconHoy(){ const t=today().slice(5); return t==='01-06'||t==='01-07'; }
async function navRoscon(){
  const p=P(); if(!p||VISIT) return; const d=paqDatosNina(p,'navidad');
  if(d.roscon===navTemp()){ await say({face:'👑',name:'Bruno',text:'¡Ya te has comido tu porción de roscón! Que aproveche.',buttons:[{t:'Vale',cls:'primary'}]}); return; }
  await say({face:'👑',name:'Bruno',text:'¡Feliz día de Reyes! Te he guardado una porción de roscón. ¿Qué habrá dentro?',html:`<div style="text-align:center">${NAV_ROSCON_SVG}</div>`,buttons:[{t:'¡A ver!',cls:'primary'}]});
  d.roscon=navTemp(); let r;
  const h=[...String(p.id)].reduce((a,c)=>(a*31+c.charCodeAt(0))%9973,+navTemp());
  if(seeded(h)<0.25){ p.coins+=5; r={e:'🫘',t:'¡Te ha tocado el haba! Dice la tradición que quien la encuentra paga el roscón del año que viene. 😄 Bruno te da 5 botones de consuelo.'}; }
  else { const b=blDatos(p), faltan=BL_PIEZAS.filter(x=>x.p>0&&!x.para&&!b.own[x.id]);
    if(faltan.length){ const x=faltan[Math.floor(seeded(h+7)*faltan.length)]; b.own[x.id]=1; r={e:'🎁',t:'¡Sorpresa! Dentro había una figurita para tu Belén: «'+x.n+'».'}; }
    else { p.coins+=15; r={e:'🎁',t:'¡Sorpresa! Te ha tocado la sorpresa del roscón: 15 botones.'}; } }
  save('Roscón de Reyes'); updateHUD(); fanfare(); addNews(p,'👑','ha probado el roscón de Reyes');
  await say({center:true,html:`<div class="reward"><div style="font-size:84px">${r.e}</div><div style="font-size:20px">${esc(r.t)}</div></div>`,buttons:[{t:'¡Gracias, Bruno!',cls:'primary'}]});
  openBakery();
}
NAV.enchufes.panaderia=function(p){ const out=[{t:'🎄 Turno de Navidad: turrones y polvorones',fn:navTurnoNavidad}]; if(navRosconHoy()) out.unshift({t:'👑 Roscón de Reyes',fn:navRoscon}); return out; };

/* ---------- tablón: rincón de Navidad ---------- */
const NAV_RINCON=[
  ['📜','Tradición','El Belén representa el nacimiento de Jesús en un portal de Belén. En muchas casas de España se monta con figuritas, musgo y un río de papel de plata.'],
  ['🤣','Chiste','¿Qué le dice un árbol de Navidad a otro? —¡Qué bien te sientan esas bolas!'],
  ['❓','Adivinanza','Con ojos de carbón y nariz de zanahoria, si sale el sol se acaba mi historia. ¿Quién soy?|El muñeco de nieve'],
  ['🔎','Dato curioso','El 21 de diciembre empieza el invierno. Es el día con menos horas de luz de todo el año.'],
  ['📜','Tradición','En Nochevieja muchas familias se comen 12 uvas, una con cada campanada de las 12, para empezar el año con buena suerte.'],
  ['🤣','Chiste','—Mamá, ¿los Reyes Magos vienen en camello? —Sí. —¿Y cómo aparcan?'],
  ['❓','Adivinanza','Soy dulce, duro y de almendra, y en Navidad todos me esperan. ¿Qué soy?|El turrón'],
  ['🔎','Dato curioso','El turrón más famoso de España se hace en Jijona, en Alicante, con almendras, miel, azúcar y clara de huevo.'],
  ['📜','Tradición','El 22 de diciembre es el sorteo de la Lotería de Navidad: los niños del colegio de San Ildefonso cantan los números premiados.'],
  ['🤣','Chiste','¿Por qué los copos de nieve nunca se pelean? Porque al final siempre se quedan helados.'],
  ['❓','Adivinanza','Tengo hojas pero no soy libro, en Navidad me llenan de bolas y luces. ¿Quién soy?|El árbol de Navidad'],
  ['🔎','Dato curioso','No hay dos copos de nieve iguales, pero casi todos tienen seis puntas.'],
  ['📜','Tradición','El 28 de diciembre es el día de los Santos Inocentes: se gastan bromas y se pegan monigotes de papel en la espalda.'],
  ['🤣','Chiste','¿Qué come un muñeco de nieve? ¡Helados de chocolate… del Polo Norte!'],
  ['❓','Adivinanza','Redondo, con fruta escarchada y una sorpresa dentro. Se come el 6 de enero. ¿Qué es?|El roscón de Reyes'],
  ['🔎','Dato curioso','Los renos pueden ver la luz ultravioleta, algo que nosotros no vemos. ¡Les ayuda a encontrar comida en la nieve!'],
  ['📜','Tradición','La tarde del 5 de enero hay cabalgatas: los Reyes Magos recorren las calles y lanzan caramelos.'],
  ['🤣','Chiste','—¿Qué le dice una vela a otra? —¡Esta noche salimos!'],
  ['❓','Adivinanza','Voy de casa en casa cantando, con zambomba y pandereta. ¿Qué canto?|Un villancico'],
  ['🔎','Dato curioso','Las zambombas se hacen con un tarro, una piel tensa y un palito: al frotarlo, suena «run, run».'],
  ['📜','Tradición','Los Reyes Magos se llaman Melchor, Gaspar y Baltasar, y traen oro, incienso y mirra.'],
  ['🤣','Chiste','¿Por qué Papá Noel no se pierde nunca? ¡Porque tiene un reno-gador!'],
  ['❓','Adivinanza','Llevo gorro rojo y barba blanca, y en muchos países reparto regalos en trineo. ¿Quién soy?|Papá Noel'],
  ['🔎','Dato curioso','La flor de Pascua no es una flor: lo rojo son hojas. La flor de verdad es el puntito amarillo del centro.'],
  ['📜','Tradición','En algunos pueblos de España, en vez de árbol, se adorna una rama o se monta un Belén viviente con vecinos disfrazados.'],
  ['🤣','Chiste','—¿Cuál es el colmo de un muñeco de nieve? —¡Tener la cabeza en las nubes y los pies fríos!'],
  ['❓','Adivinanza','Brillo en el cielo con una cola larga; guié a los Reyes hasta el portal. ¿Quién soy?|La estrella'],
  ['🔎','Dato curioso','La Navidad dura en España desde el 24 de diciembre hasta el 6 de enero, día de Reyes.'],
  ['📜','Tradición','Antes de dormir el 5 de enero, los niños dejan los zapatos a la vista y algo de comer para los Reyes y agua para los camellos.'],
  ['🤣','Chiste','¿Qué hace un reno con una escoba? ¡Re-no-var la casa!']
];
(function(){ const antes=NAV.enchufes.tablon;
  NAV.enchufes.tablon=function(ctx){ const out=[].concat(antes?antes.call(this,ctx)||[]:[]);
    const t=today(), base=new Date(navTemp()+'-12-01T12:00:00'), n=Math.max(0,Math.round((new Date(t+'T12:00:00')-base)/86400000)), it=NAV_RINCON[n%NAV_RINCON.length], [txt,sol]=it[2].split('|');
    out.push({key:'navrincon-'+t, tipo:'nota', estilo:'periodico', emoji:'🎄', titulo:'Rincón de Navidad · '+it[1], texto:txt, firma:'La Gaceta de Villaovillo', prio:45, leer:txt,
      extra(cont){ if(!sol) return; const d=document.createElement('details'); d.style.marginTop='10px'; d.innerHTML='<summary style="font-weight:800;cursor:pointer">Ver la solución</summary><div style="font-size:22px">'+esc(sol)+'</div>'; cont.append(d); } });
    return out; }; })();
