// Tema de la Biblioteca para Cintia (grupo 6): Las plantas (Ciencias de la Naturaleza, 1º).
// Formato: ver contenido/temas/figuras.js. PLANTA (dibujos) está en este mismo archivo.
window.TEMAS=window.TEMAS||[];
window.PLANTA=window.PLANTA||(function(){
  const svg=(inner,w,h)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="margin:4px;vertical-align:middle;max-width:100%">${inner}</svg>`;
  const T=(x,y,t,anchor='start')=>`<text x="${x}" y="${y}" font-family="Baloo 2, sans-serif" font-size="15" font-weight="700" fill="#2b5d7a" text-anchor="${anchor}">${t}</text>`;
  // Partes de la planta: dónde están (para la flecha) y cómo se dibujan
  const PART={raiz:[86,178],tallo:[100,136],hojas:[124,104],flor:[100,44],fruto:[132,70]};
  const cuerpo=()=>`
    <rect x="0" y="150" width="200" height="60" fill="#c8a27a"/><line x1="0" y1="150" x2="200" y2="150" stroke="#8b5e3c" stroke-width="3"/>
    <g stroke="#8b5e3c" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M100 150 Q98 170 84 190"/><path d="M100 150 Q104 172 118 192"/><path d="M100 152 L100 196"/><path d="M92 170 L78 172"/><path d="M106 176 L120 178"/></g>
    <path d="M100 150 L100 52" stroke="#3a8d3a" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="78" cy="112" rx="20" ry="9" fill="#5cb85c" stroke="#2f7a2f" stroke-width="2" transform="rotate(25 78 112)"/>
    <ellipse cx="124" cy="104" rx="20" ry="9" fill="#5cb85c" stroke="#2f7a2f" stroke-width="2" transform="rotate(-25 124 104)"/>
    <path d="M100 82 Q118 78 128 66" stroke="#3a8d3a" stroke-width="4" fill="none"/>
    <circle cx="132" cy="70" r="10" fill="#e63946" stroke="#9b2226" stroke-width="2"/>
    ${[0,72,144,216,288].map(a=>`<ellipse cx="100" cy="30" rx="9" ry="15" fill="#f28fad" stroke="#c9184a" stroke-width="2" transform="rotate(${a} 100 44)"/>`).join('')}
    <circle cx="100" cy="44" r="8" fill="#ffd166" stroke="#c98f16" stroke-width="2"/>`;
  const P={
    // Planta con todas las partes rotuladas
    etiquetas:()=>svg(cuerpo()+
      `<g stroke="#2b5d7a" stroke-width="1.5">
        <line x1="112" y1="38" x2="150" y2="22"/><line x1="142" y1="70" x2="160" y2="70"/><line x1="140" y1="100" x2="160" y2="112"/>
        <line x1="100" y1="128" x2="160" y2="140"/><line x1="84" y1="182" x2="40" y2="188"/></g>`+
      T(152,26,'Flor')+T(162,74,'Fruto')+T(162,116,'Hojas')+T(162,144,'Tallo')+T(38,192,'Raíz','end'),240,210),
    // Planta sin rótulos y con una flecha que señala una parte
    marca:k=>{ const [x,y]=PART[k]; return svg(cuerpo()+
      `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#d62828" stroke-width="3" stroke-dasharray="6 4"/>
       <path d="M${x+60} ${y-20} L${x+22} ${y-6}" stroke="#d62828" stroke-width="4" stroke-linecap="round"/>
       <path d="M${x+22} ${y-6} l10 -9 M${x+22} ${y-6} l13 4" stroke="#d62828" stroke-width="4" stroke-linecap="round"/>`,240,210); },
    // Las etapas: semilla, brote, planta, flor, fruto
    semilla:()=>svg(`<rect x="0" y="60" width="80" height="30" fill="#c8a27a"/><ellipse cx="40" cy="72" rx="10" ry="6" fill="#a0522d" stroke="#5c2e0e" stroke-width="2"/>`,80,90),
    brote:()=>svg(`<rect x="0" y="60" width="80" height="30" fill="#c8a27a"/><ellipse cx="40" cy="74" rx="9" ry="5" fill="#a0522d"/><path d="M40 72 L40 44" stroke="#3a8d3a" stroke-width="4"/><ellipse cx="32" cy="44" rx="9" ry="5" fill="#5cb85c"/><ellipse cx="48" cy="44" rx="9" ry="5" fill="#5cb85c"/><path d="M40 76 l-6 8 M40 76 l6 8" stroke="#8b5e3c" stroke-width="2"/>`,80,90),
    plantita:()=>svg(`<rect x="0" y="60" width="80" height="30" fill="#c8a27a"/><path d="M40 60 L40 18" stroke="#3a8d3a" stroke-width="5"/><ellipse cx="28" cy="40" rx="12" ry="6" fill="#5cb85c" transform="rotate(25 28 40)"/><ellipse cx="52" cy="32" rx="12" ry="6" fill="#5cb85c" transform="rotate(-25 52 32)"/>`,80,90),
    conFlor:()=>svg(`<rect x="0" y="60" width="80" height="30" fill="#c8a27a"/><path d="M40 60 L40 22" stroke="#3a8d3a" stroke-width="5"/><ellipse cx="28" cy="44" rx="12" ry="6" fill="#5cb85c" transform="rotate(25 28 44)"/>${[0,72,144,216,288].map(a=>`<ellipse cx="40" cy="8" rx="6" ry="9" fill="#f28fad" transform="rotate(${a} 40 18)"/>`).join('')}<circle cx="40" cy="18" r="5" fill="#ffd166"/>`,80,90),
    conFruto:()=>svg(`<rect x="0" y="60" width="80" height="30" fill="#c8a27a"/><path d="M40 60 L40 26" stroke="#3a8d3a" stroke-width="5"/><ellipse cx="28" cy="44" rx="12" ry="6" fill="#5cb85c" transform="rotate(25 28 44)"/><circle cx="40" cy="20" r="12" fill="#e63946" stroke="#9b2226" stroke-width="2"/><path d="M40 8 l4 -5" stroke="#3a8d3a" stroke-width="3"/>`,80,90),
    // Árbol, arbusto y hierba
    arbol:()=>svg(`<rect x="0" y="100" width="100" height="10" fill="#8fc97a"/><rect x="43" y="55" width="14" height="47" fill="#8b5e3c"/><circle cx="50" cy="40" r="32" fill="#4f9d4f"/>`,100,110),
    arbusto:()=>svg(`<rect x="0" y="100" width="100" height="10" fill="#8fc97a"/><path d="M50 100 L38 80 M50 100 L50 76 M50 100 L62 80" stroke="#8b5e3c" stroke-width="3"/><circle cx="34" cy="78" r="16" fill="#5cb85c"/><circle cx="66" cy="78" r="16" fill="#5cb85c"/><circle cx="50" cy="68" r="18" fill="#4f9d4f"/>`,100,110),
    hierba:()=>svg(`<rect x="0" y="100" width="100" height="10" fill="#8fc97a"/>${[22,34,46,58,70,80].map((x,i)=>`<path d="M${x} 100 Q${x+(i%2?6:-6)} 86 ${x+(i%2?3:-3)} ${74+(i%3)*4}" stroke="#3a8d3a" stroke-width="3" fill="none"/>`).join('')}`,100,110),
    // Fotosíntesis: la hoja toma luz, agua y aire, fabrica alimento y suelta oxígeno
    fotosintesis:()=>{ const A=(x1,y1,x2,y2,c)=>{ const a=Math.atan2(y2-y1,x2-x1), p=(d,l)=>(x2-Math.cos(a+d)*l).toFixed(1)+','+(y2-Math.sin(a+d)*l).toFixed(1); return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="4" stroke-linecap="round"/><polygon points="${x2},${y2} ${p(0.45,14)} ${p(-0.45,14)}" fill="${c}"/>`; };
      return svg(`<circle cx="40" cy="34" r="20" fill="#ffd166" stroke="#e0a800" stroke-width="2"/>
        <path d="M100 150 Q60 95 130 45 Q205 70 160 140 Q135 160 100 150Z" fill="#5cb85c" stroke="#2f7a2f" stroke-width="3"/>
        <path d="M100 150 Q125 100 135 60" stroke="#2f7a2f" stroke-width="2.5" fill="none"/>
        <path d="M100 150 L94 178" stroke="#3a8d3a" stroke-width="5"/>
        ${A(60,50,108,82,'#e0a800')}${A(70,190,98,160,'#3d8bd9')}${A(20,120,82,118,'#8aa0b0')}${A(176,98,226,84,'#2a9d8f')}
        ${T(66,30,'Luz')}${T(10,186,'Agua')}${T(2,108,'Aire')}${T(200,72,'Oxígeno')}
        <text x="132" y="118" font-family="Baloo 2, sans-serif" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">Alimento</text>`,270,200); },
    // Hoja caduca y perenne
    roble:(inv)=>svg(`<rect x="0" y="100" width="100" height="10" fill="${inv?'#e8eef2':'#8fc97a'}"/><rect x="45" y="55" width="10" height="47" fill="#8b5e3c"/>
      <g stroke="#8b5e3c" stroke-width="4" stroke-linecap="round"><path d="M50 62 L28 34"/><path d="M50 58 L74 30"/><path d="M50 50 L50 18"/><path d="M38 47 L24 46"/><path d="M62 44 L80 46"/></g>
      ${inv?'<g fill="#d98a2b"><ellipse cx="20" cy="96" rx="5" ry="3"/><ellipse cx="72" cy="97" rx="5" ry="3"/><ellipse cx="86" cy="80" rx="4" ry="3"/></g>':'<g fill="#4f9d4f" opacity=".95"><circle cx="30" cy="34" r="16"/><circle cx="70" cy="30" r="17"/><circle cx="50" cy="20" r="17"/><circle cx="50" cy="42" r="16"/></g>'}`,100,110),
    pino:()=>svg(`<rect x="0" y="100" width="100" height="10" fill="#e8eef2"/><rect x="45" y="80" width="10" height="22" fill="#8b5e3c"/>
      <polygon points="50,6 24,46 76,46" fill="#2e7d4f"/><polygon points="50,26 18,68 82,68" fill="#2e7d4f"/><polygon points="50,46 12,88 88,88" fill="#2e7d4f"/>`,100,110),
    pie:(dib,txt)=>`<div style="text-align:center;font-size:15px;line-height:1.2">${dib}<br>${txt}</div>`,
    fila:(...a)=>`<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;align-items:center">${a.join('')}</div>`,
    etapas:()=>P.fila(P.semilla(),'➜',P.brote(),'➜',P.plantita(),'➜',P.conFlor(),'➜',P.conFruto())
  };
  return P;
})();
(function(){
const _o=(q,opts,a,exp,vis)=>({t:'opcion',q,opts,a,exp,vis});
const _v=(q,a,exp,vis)=>({t:'vf',q,a,exp,vis});
const _r=(q,items,exp)=>({t:'ordenar',q,items,exp});
window.TEMAS.push({
  id:'naturales-plantas', para:'6', emoji:'🌱', asignatura:'Ciencias de la Naturaleza', titulo:'Las plantas',
  libro:[
    {h:'Las plantas son seres vivos', html:()=>`<p>Las plantas son <b>seres vivos</b>, como los animales y las personas: <b>nacen</b>, <b>crecen</b>, se <b>reproducen</b> (tienen plantas hijas) y <b>mueren</b>.</p>
      <p>Pero hay una cosa que las hace especiales: las plantas <b>fabrican su propio alimento</b>. Los animales tenemos que buscar la comida; ¡las plantas se la hacen ellas solas! 🌱</p>`},
    {h:'Las partes de la planta', html:()=>`${PLANTA.fila(PLANTA.etiquetas())}
      <p>🟤 La <b>raíz</b> está bajo la tierra. Sujeta la planta y absorbe el agua y las sales minerales del suelo.<br>
      🟢 El <b>tallo</b> sostiene la planta. Por dentro tiene unos tubitos muy finos que llevan el agua desde la raíz hasta las hojas.<br>
      🍃 Las <b>hojas</b> fabrican el alimento de la planta.<br>
      🌸 La <b>flor</b> sirve para que nazcan plantas nuevas: de la flor sale el fruto.<br>
      🍎 El <b>fruto</b> protege las <b>semillas</b>.</p>`},
    {h:'La fotosíntesis: la cocina de la planta', html:()=>`${PLANTA.fila(PLANTA.fotosintesis())}
      <p>Las hojas son como una cocina. Para hacer la comida usan tres ingredientes:</p>
      <p>☀️ la <b>luz</b> del sol,<br>💧 el <b>agua</b> que sube desde la raíz,<br>🌬️ y un gas del <b>aire</b> que se llama <b>dióxido de carbono</b>.</p>
      <p>Con ellos fabrican su alimento. Esto se llama <b>fotosíntesis</b> («foto» quiere decir luz).</p>
      <p>Mientras cocinan, las hojas sueltan <b>oxígeno</b> al aire: ¡el oxígeno que respiramos las personas y los animales! Por eso los bosques son tan importantes. 🌳</p>
      <p>Las hojas son verdes porque tienen <b>clorofila</b>, una sustancia verde que atrapa la luz del sol. Sin luz, la planta no puede cocinar: se pone pálida y se muere.</p>`},
    {h:'Hoja caduca y hoja perenne', html:()=>`${PLANTA.fila(PLANTA.pie(PLANTA.roble(false),'Roble<br>en verano'),PLANTA.pie(PLANTA.roble(true),'Roble<br>en invierno'),PLANTA.pie(PLANTA.pino(),'Pino<br>en invierno'))}
      <p>🍂 Los árboles de <b>hoja caduca</b> pierden sus hojas en <b>otoño</b>: primero se ponen amarillas, naranjas o marrones y luego se caen. En invierno las ramas están desnudas y en primavera salen hojas nuevas. Ejemplos: el <b>roble</b>, el <b>castaño</b> y el <b>chopo</b>.</p>
      <p>🌲 Los árboles de <b>hoja perenne</b> tienen hojas verdes <b>todo el año</b>. También cambian las hojas, pero poco a poco, y nunca se quedan sin ellas. Ejemplos: el <b>pino</b>, el <b>olivo</b> y el <b>naranjo</b>.</p>
      <p>«Caduca» viene de «caer». «Perenne» quiere decir «que dura siempre».</p>`},
    {h:'De la flor a la semilla', html:()=>`${PLANTA.etapas()}
      <p>🐝 Dentro de las flores hay un polvillo amarillo: el <b>polen</b>. Las abejas y las mariposas van de flor en flor a beber néctar y, sin darse cuenta, llevan el polen pegado de una flor a otra. Esto se llama <b>polinización</b>. Gracias a ella, la flor se convierte en <b>fruto</b>.</p>
      <p>🌬️ Las semillas viajan para nacer lejos: el <b>viento</b> se lleva las del diente de león, los <b>animales</b> comen frutos y dejan las semillas en otro sitio, y algunas flotan en el <b>agua</b>.</p>
      <p>🌱 Cuando una semilla cae en tierra húmeda, <b>germina</b>: primero sale una raicita hacia abajo y luego un brote hacia arriba.</p>`},
    {h:'¿Qué parte nos comemos?', html:()=>`<p>¡Comemos plantas todos los días! Pero no siempre la misma parte:</p>
      <p>🥕 <b>Raíz</b>: la zanahoria y el rábano.<br>🌿 <b>Tallo</b>: el espárrago y el apio.<br>🥬 <b>Hojas</b>: la lechuga y las espinacas.<br>🥦 <b>Flores</b>: el brócoli y la coliflor (son flores que aún no se han abierto).<br>🍊 <b>Frutos</b>: la naranja, la manzana… ¡y también el tomate!<br>🌰 <b>Semillas</b>: las lentejas, los garbanzos y las pipas.</p>`},
    {h:'Árboles, arbustos y hierbas', html:()=>`${PLANTA.fila(PLANTA.arbol(),PLANTA.arbusto(),PLANTA.hierba())}
      <p>🌳 El <b>árbol</b> es alto y tiene un tallo grueso y duro: el <b>tronco</b>.<br>
      🌿 El <b>arbusto</b> es más bajo y tiene muchos tallos duros desde el suelo.<br>
      🌾 La <b>hierba</b> es pequeña y su tallo es blando y verde.</p>`},
    {h:'Para recordar', html:()=>`<p>• Partes: raíz, tallo, hojas, flor y fruto (con semillas).<br>
      • <b>Fotosíntesis</b>: con luz, agua y aire las hojas fabrican alimento y sueltan <b>oxígeno</b>.<br>
      • Las hojas son verdes por la <b>clorofila</b>.<br>
      • <b>Caduca</b>: pierde las hojas en otoño (roble). <b>Perenne</b>: verde todo el año (pino).<br>
      • Las abejas llevan el <b>polen</b> de flor en flor: <b>polinización</b>.<br>
      • Semilla ➜ germina ➜ planta ➜ flor ➜ fruto.</p>`}
  ],
  preguntas:[
    {v:[_o('¿Cómo se llama la parte que señala la flecha?',['Raíz','Tallo','Fruto'],'Raíz','La raíz está bajo la tierra.',()=>PLANTA.marca('raiz')),
        _o('¿Cómo se llama la parte que señala la flecha?',['Tallo','Raíz','Flor'],'Tallo','El tallo sostiene la planta.',()=>PLANTA.marca('tallo')),
        _o('¿Cómo se llama la parte que señala la flecha?',['Fruto','Flor','Hoja'],'Fruto','El fruto protege las semillas.',()=>PLANTA.marca('fruto'))]},
    {v:[_o('¿Qué hace la raíz?',['Sujeta la planta y absorbe el agua','Fabrica el alimento','Atrae a las abejas'],'Sujeta la planta y absorbe el agua'),
        _o('¿Por dónde sube el agua desde la raíz hasta las hojas?',['Por unos tubitos del tallo','Por la flor','Por el aire'],'Por unos tubitos del tallo'),
        _o('¿Para qué sirve el fruto?',['Para proteger las semillas','Para sujetar la planta','Para beber agua'],'Para proteger las semillas')]},
    {v:[_o('¿Cómo se llama lo que hacen las hojas para fabricar su alimento?',['Fotosíntesis','Polinización','Germinación'],'Fotosíntesis','«Foto» quiere decir luz.',()=>PLANTA.fotosintesis()),
        _o('¿Qué ingredientes usan las hojas para fabricar su alimento?',['Luz, agua y aire','Tierra, piedras y arena','Leche, pan y miel'],'Luz, agua y aire'),
        _v('Las plantas fabrican su propio alimento.',true,'Sí: lo fabrican las hojas con la fotosíntesis.')]},
    {v:[_o('Durante la fotosíntesis, ¿qué sueltan las hojas al aire?',['Oxígeno','Humo','Polen'],'Oxígeno','Es el oxígeno que respiramos.'),
        _o('¿Por qué son tan importantes los bosques para las personas?',['Porque las plantas sueltan el oxígeno que respiramos','Porque hacen ruido','Porque dan sombra a las nubes'],'Porque las plantas sueltan el oxígeno que respiramos'),
        _v('El oxígeno que respiramos lo sueltan las plantas.',true,'Sí: lo sueltan las hojas mientras fabrican su alimento.')]},
    {v:[_o('¿Por qué las hojas son verdes?',['Porque tienen clorofila','Porque las pintan','Porque beben mucha agua'],'Porque tienen clorofila','La clorofila atrapa la luz del sol.'),
        _o('Guardamos una planta en un armario oscuro muchos días. ¿Qué le pasará?',['Se pondrá pálida y se morirá','Crecerá más deprisa','Le saldrán frutos'],'Se pondrá pálida y se morirá','Sin luz, las hojas no pueden fabricar alimento.'),
        _o('¿Para qué sirve la clorofila?',['Para atrapar la luz del sol','Para oler bien','Para beber agua'],'Para atrapar la luz del sol')]},
    {v:[_o('¿Qué es un árbol de hoja caduca?',['El que pierde las hojas en otoño','El que tiene hojas todo el año','El que no tiene raíces'],'El que pierde las hojas en otoño'),
        _o('¿Qué es un árbol de hoja perenne?',['El que tiene hojas verdes todo el año','El que pierde las hojas en otoño','El que solo tiene flores'],'El que tiene hojas verdes todo el año'),
        _o('Este roble está en invierno, sin hojas. ¿Cómo es su hoja?',['Caduca','Perenne','Verde todo el año'],'Caduca','Los árboles de hoja caduca pierden las hojas en otoño.',()=>PLANTA.roble(true))]},
    {v:[_o('¿Cuál de estos árboles es de hoja perenne?',['El pino','El roble','El castaño'],'El pino'),
        _o('¿Cuál de estos árboles es de hoja caduca?',['El castaño','El pino','El olivo'],'El castaño'),
        _o('Este pino tiene hojas en pleno invierno. ¿Cómo es su hoja?',['Perenne','Caduca','Seca'],'Perenne','Los pinos tienen hojas verdes todo el año.',()=>PLANTA.pino())]},
    {v:[_o('¿Cómo ayudan las abejas a las plantas?',['Llevan el polen de una flor a otra','Riegan las flores','Se comen las hojas malas'],'Llevan el polen de una flor a otra','Eso se llama polinización.'),
        _o('¿Cómo se llama el polvillo amarillo que hay dentro de las flores?',['Polen','Clorofila','Semilla'],'Polen'),
        _v('Gracias a la polinización, la flor se convierte en fruto.',true,'Sí: las abejas llevan el polen y la flor puede hacerse fruto.')]},
    {v:[_r('Ordena la vida de una planta.',['Semilla','Germina','Planta','Flor','Fruto'],'Semilla ➜ germina ➜ planta ➜ flor ➜ fruto.'),
        _o('¿Cómo viajan las semillas del diente de león?',['Con el viento','En coche','Las lleva la raíz'],'Con el viento'),
        _o('Cuando una semilla germina, ¿qué sale primero?',['Una raicita hacia abajo','Una flor','Un fruto'],'Una raicita hacia abajo','Luego sale el brote hacia arriba.')]},
    {v:[_o('¿Qué parte de la planta es la zanahoria?',['La raíz','La flor','El fruto'],'La raíz'),
        _o('¿Qué parte de la planta es el brócoli?',['Flores','Raíces','Semillas'],'Flores','Son flores que aún no se han abierto.'),
        _o('¿Qué parte de la planta es la lechuga?',['Hojas','Raíz','Tallo'],'Hojas')]}
  ]
});
})();
