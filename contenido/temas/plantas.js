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
    {h:'Las plantas son seres vivos', html:()=>`<p>Las plantas son <b>seres vivos</b>, como los animales y las personas. 🌱</p>
      <p>Las plantas <b>nacen</b>, <b>crecen</b>, tienen <b>hijos</b> (nuevas plantas) y al final <b>mueren</b>.</p>
      <p>Pero las plantas <b>no se pueden mover</b> de un sitio a otro. Viven siempre en el mismo lugar.</p>`},
    {h:'Las partes de la planta', html:()=>`${PLANTA.fila(PLANTA.etiquetas())}
      <p>🟤 La <b>raíz</b> está bajo la tierra. Sujeta la planta y bebe el agua.<br>
      🟢 El <b>tallo</b> sostiene la planta y lleva el agua hasta las hojas.<br>
      🍃 Las <b>hojas</b> usan la luz del sol para hacer la comida de la planta.<br>
      🌸 La <b>flor</b> es la parte de colores. De la flor sale el fruto.<br>
      🍎 El <b>fruto</b> guarda dentro las <b>semillas</b>.</p>`},
    {h:'Qué necesita una planta', html:()=>`<p>Para vivir y crecer, una planta necesita:</p>
      <p>💧 <b>Agua</b>: si no la riegas, se seca.<br>☀️ <b>Luz</b>: sin luz, la planta se pone pálida y se muere.<br>🌬️ <b>Aire</b>.<br>🟫 <b>Tierra</b>, donde están las raíces.</p>
      <p>Por eso en Villaovillo hay que regar el jardín. 🚿</p>`},
    {h:'De semilla a planta', html:()=>`${PLANTA.etapas()}
      <p>1. Plantamos una <b>semilla</b> en la tierra.<br>2. Con agua, la semilla <b>germina</b>: sale un brote pequeño.<br>3. El brote <b>crece</b> y se hace una planta.<br>4. Le salen <b>flores</b>.<br>5. De la flor sale el <b>fruto</b>, con semillas nuevas dentro. ¡Y vuelta a empezar! 🔁</p>`},
    {h:'Árboles, arbustos y hierbas', html:()=>`${PLANTA.fila(PLANTA.arbol(),PLANTA.arbusto(),PLANTA.hierba())}
      <p>🌳 El <b>árbol</b> es muy alto y tiene un tallo grueso y duro: el <b>tronco</b>.<br>
      🌿 El <b>arbusto</b> es más bajo y tiene muchos tallos duros y finos.<br>
      🌾 La <b>hierba</b> es pequeña y su tallo es blando y verde.</p>`},
    {h:'Para recordar', html:()=>`<p>• Las plantas son seres vivos: nacen, crecen, tienen hijos y mueren.<br>
      • Partes: <b>raíz</b>, <b>tallo</b>, <b>hojas</b>, <b>flor</b> y <b>fruto</b>.<br>
      • Necesitan <b>agua</b>, <b>luz</b>, <b>aire</b> y <b>tierra</b>.<br>
      • Semilla ➜ brote ➜ planta ➜ flor ➜ fruto.<br>
      • Árbol (tronco), arbusto (bajito) y hierba (tallo blando).</p>`}
  ],
  preguntas:[
    {v:[_v('Las plantas son seres vivos.',true,'Sí: nacen, crecen, tienen hijos y mueren.'),
        _o('¿Qué hacen las plantas, igual que los animales?',['Nacen, crecen y mueren','Hablan y cantan','Andan por el campo'],'Nacen, crecen y mueren'),
        _v('Una planta puede ir andando a otro sitio.',false,'Las plantas no se pueden mover: viven siempre en el mismo lugar.')]},
    {v:[_o('¿Cómo se llama la parte que señala la flecha?',['Raíz','Hoja','Flor'],'Raíz','La raíz está bajo la tierra.',()=>PLANTA.marca('raiz')),
        _o('¿Qué parte de la planta está bajo la tierra?',['La flor','La raíz','El fruto'],'La raíz'),
        _o('¿Qué parte bebe el agua de la tierra?',['La raíz','La flor','El fruto'],'La raíz','La raíz sujeta la planta y bebe el agua.')]},
    {v:[_o('¿Cómo se llama la parte que señala la flecha?',['Fruto','Tallo','Raíz'],'Tallo','El tallo sostiene la planta.',()=>PLANTA.marca('tallo')),
        _o('¿Qué parte sostiene la planta y lleva el agua a las hojas?',['El tallo','La flor','La semilla'],'El tallo'),
        _v('El tronco de un árbol es su tallo.',true,'Sí: el tronco es un tallo grueso y duro.')]},
    {v:[_o('¿Cómo se llama la parte que señala la flecha?',['Hoja','Flor','Raíz'],'Hoja','Las hojas son verdes.',()=>PLANTA.marca('hojas')),
        _o('¿Qué parte usa la luz del sol para hacer la comida de la planta?',['Las hojas','La raíz','El fruto'],'Las hojas'),
        _v('Las hojas hacen la comida de la planta con la luz del sol.',true,'Sí: por eso las plantas necesitan luz.')]},
    {v:[_o('¿Cómo se llama la parte que señala la flecha?',['Flor','Tallo','Raíz'],'Flor','La flor es la parte de colores.',()=>PLANTA.marca('flor')),
        _o('¿De qué parte de la planta sale el fruto?',['De la flor','De la raíz','Del tallo'],'De la flor'),
        _o('¿Qué parte de la planta suele tener colores bonitos?',['La flor','La raíz','El tallo'],'La flor')]},
    {v:[_o('¿Cómo se llama la parte que señala la flecha?',['Fruto','Hoja','Raíz'],'Fruto','El fruto guarda las semillas.',()=>PLANTA.marca('fruto')),
        _o('¿Qué guarda el fruto dentro?',['Semillas','Raíces','Hojas'],'Semillas'),
        _v('Una manzana es un fruto y dentro tiene semillas.',true,'Sí: las pepitas de la manzana son sus semillas.')]},
    {v:[_o('¿Qué necesita una planta para vivir?',['Agua y luz','Chocolate','Música'],'Agua y luz'),
        _v('Una planta puede vivir sin agua.',false,'Sin agua la planta se seca.'),
        _o('Si no riegas una planta, ¿qué le pasa?',['Se seca','Crece más','Le salen flores'],'Se seca','Las plantas necesitan agua.')]},
    {v:[_o('Guardamos una planta en un armario oscuro muchos días. ¿Qué le pasará?',['Se pondrá pálida y se morirá','Crecerá mucho','Le saldrán frutos'],'Se pondrá pálida y se morirá','Las hojas necesitan luz para hacer la comida.'),
        _o('¿Por qué una planta necesita luz?',['Porque las hojas hacen su comida con la luz','Porque le da miedo la oscuridad','Para ver mejor'],'Porque las hojas hacen su comida con la luz'),
        _v('Las plantas necesitan luz para vivir.',true,'Sí: sin luz las hojas no pueden hacer la comida.')]},
    {v:[_r('Ordena cómo crece una planta.',['Semilla','Brote','Planta','Flor','Fruto'],'Semilla ➜ brote ➜ planta ➜ flor ➜ fruto.'),
        _o('¿Qué plantamos en la tierra para que nazca una planta nueva?',['Una semilla','Una hoja','Una piedra'],'Una semilla'),
        _o('¿Qué sale primero de la semilla?',['Un brote pequeño','Un fruto','Un árbol grande'],'Un brote pequeño','Con agua, la semilla germina y sale un brote.')]},
    {v:[_o('¿Qué planta es esta, alta y con tronco?',['Árbol','Arbusto','Hierba'],'Árbol','El árbol tiene un tallo grueso: el tronco.',()=>PLANTA.arbol()),
        _o('¿Qué planta es pequeña y tiene el tallo blando y verde?',['La hierba','El árbol','El arbusto'],'La hierba'),
        _o('¿Qué planta es más baja que un árbol y tiene muchos tallos duros?',['El arbusto','La hierba','La flor'],'El arbusto')]}
  ]
});
})();
