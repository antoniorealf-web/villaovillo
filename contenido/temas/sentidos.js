// Tema de la Biblioteca para Cintia (grupo 6): Los cinco sentidos (Ciencias de la Naturaleza, 1º).
// Formato: ver contenido/temas/figuras.js. SENT (dibujos) está en este mismo archivo.
window.TEMAS=window.TEMAS||[];
window.SENT=window.SENT||(function(){
  const svg=(inner,w,h)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="margin:4px;vertical-align:middle;max-width:100%">${inner}</svg>`;
  const T=(x,y,t,anchor='start')=>`<text x="${x}" y="${y}" font-family="Baloo 2, sans-serif" font-size="14" font-weight="700" fill="#2b5d7a" text-anchor="${anchor}">${t}</text>`;
  const PIEL='#f6d2b0', BORDE='#b07a52';
  // Cara de frente: dónde está cada órgano (para la flecha)
  const POS={ojo:[78,78],oreja:[33,95],nariz:[100,104],lengua:[100,138]};
  const FL={ojo:[-10,40],oreja:[-30,150],nariz:[220,70],lengua:[220,165]}; // de dónde sale cada flecha (fuera de la cara)
  const cara=()=>`
    <ellipse cx="33" cy="95" rx="11" ry="18" fill="${PIEL}" stroke="${BORDE}" stroke-width="2.5"/>
    <ellipse cx="167" cy="95" rx="11" ry="18" fill="${PIEL}" stroke="${BORDE}" stroke-width="2.5"/>
    <ellipse cx="100" cy="100" rx="66" ry="74" fill="${PIEL}" stroke="${BORDE}" stroke-width="2.5"/>
    <path d="M36 70 Q40 22 100 24 Q160 22 164 70 Q150 44 100 42 Q50 44 36 70Z" fill="#7a4a2a"/>
    <ellipse cx="78" cy="78" rx="11" ry="8" fill="#fff" stroke="#555" stroke-width="2"/><circle cx="78" cy="78" r="5" fill="#3d6b9c"/><circle cx="78" cy="78" r="2" fill="#111"/>
    <ellipse cx="122" cy="78" rx="11" ry="8" fill="#fff" stroke="#555" stroke-width="2"/><circle cx="122" cy="78" r="5" fill="#3d6b9c"/><circle cx="122" cy="78" r="2" fill="#111"/>
    <path d="M100 86 Q92 108 96 112 Q100 115 106 111" fill="none" stroke="${BORDE}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M80 128 Q100 150 120 128 Z" fill="#9b2335" stroke="#6b1020" stroke-width="2"/>
    <ellipse cx="100" cy="139" rx="11" ry="6" fill="#f28fad"/>`;
  const S={
    cara:()=>svg(cara(),200,180),
    // Cara con una flecha que señala un órgano
    marca:k=>{ const [x,y]=POS[k]; const [sx,sy]=FL[k]; const ang=Math.atan2(y-sy,x-sx), ex=x-Math.cos(ang)*17, ey=y-Math.sin(ang)*17;
      const pt=(a,l)=>(ex-Math.cos(ang+a)*l).toFixed(1)+' '+(ey-Math.sin(ang+a)*l).toFixed(1);
      return svg(`<g transform="translate(40,0)">${cara()}
        <circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#d62828" stroke-width="3" stroke-dasharray="6 4"/>
        <path d="M${sx} ${sy} L${ex.toFixed(1)} ${ey.toFixed(1)} M${pt(0.5,13)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${pt(-0.5,13)}" stroke="#d62828" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`,280,180); },
    // Cara rotulada (para el libro)
    etiquetas:()=>svg(`<g transform="translate(70,0)">${cara()}</g>
      <g stroke="#2b5d7a" stroke-width="1.5"><line x1="135" y1="78" x2="62" y2="40"/><line x1="96" y1="95" x2="62" y2="100"/>
      <line x1="170" y1="104" x2="262" y2="80"/><line x1="170" y1="139" x2="262" y2="150"/></g>`+
      T(60,40,'Ojos','end')+T(60,104,'Orejas','end')+T(266,84,'Nariz')+T(266,154,'Lengua'),340,180),
    mano:()=>svg(`<g transform="translate(16,0)" fill="${PIEL}" stroke="${BORDE}" stroke-width="2.5" stroke-linejoin="round">
      <rect x="24" y="74" width="17" height="50" rx="8.5" transform="rotate(-40 32 120)"/>
      <rect x="34" y="34" width="16" height="60" rx="8"/><rect x="52" y="20" width="16" height="74" rx="8"/><rect x="70" y="22" width="16" height="72" rx="8"/><rect x="88" y="34" width="15" height="60" rx="7.5"/>
      <rect x="30" y="76" width="76" height="58" rx="22"/></g>`,140,140),
    fila:(...a)=>`<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;align-items:center">${a.join('')}</div>`
  };
  return S;
})();
(function(){
const _o=(q,opts,a,exp,vis)=>({t:'opcion',q,opts,a,exp,vis});
const _v=(q,a,exp,vis)=>({t:'vf',q,a,exp,vis});
const _r=(q,items,exp)=>({t:'ordenar',q,items,exp});
window.TEMAS.push({
  id:'naturales-sentidos', para:'6', emoji:'👀', asignatura:'Ciencias de la Naturaleza', titulo:'Los cinco sentidos',
  libro:[
    {h:'Tenemos cinco sentidos', html:()=>`${SENT.fila(SENT.etiquetas(),SENT.mano())}
      <p>Los <b>sentidos</b> nos dicen cómo es todo lo que hay a nuestro alrededor. Tenemos <b>cinco</b>:</p>
      <p>👀 <b>Vista</b>, con los <b>ojos</b>.<br>👂 <b>Oído</b>, con las <b>orejas</b>.<br>👃 <b>Olfato</b>, con la <b>nariz</b>.<br>👅 <b>Gusto</b>, con la <b>lengua</b>.<br>✋ <b>Tacto</b>, con la <b>piel</b>.</p>`},
    {h:'La vista y el oído', html:()=>`<p>👀 Con la <b>vista</b> vemos los <b>colores</b>, las <b>formas</b> y si algo es grande o pequeño. Para ver hace falta <b>luz</b>: a oscuras no vemos nada.</p>
      <p>👂 Con el <b>oído</b> oímos los <b>sonidos</b>: la música, el timbre, un perro que ladra, la voz de mamá y papá. Hay sonidos <b>fuertes</b> 🥁 y sonidos <b>suaves</b> 🎐.</p>`},
    {h:'El olfato y el gusto', html:()=>`<p>👃 Con el <b>olfato</b> notamos los <b>olores</b>. Hay olores agradables, como el del pan recién hecho 🥖 o las flores 🌸, y olores desagradables, como el de la basura.</p>
      <p>👅 Con el <b>gusto</b> notamos los <b>sabores</b> de la comida:<br>🍬 El azúcar es <b>dulce</b>. 🧂 La sal es <b>salada</b>.<br>🍋 El limón es <b>ácido</b>. ☕ El café es <b>amargo</b>.</p>`},
    {h:'El tacto', html:()=>`<p>✋ Con el <b>tacto</b> notamos las cosas al tocarlas. El tacto está en <b>toda la piel</b>, aunque usamos sobre todo las manos.</p>
      <p>Al tocar sabemos si algo está <b>frío</b> 🧊 o <b>caliente</b> 🔥, si es <b>suave</b> 🧸 o <b>áspero</b> 🪵, y si es <b>blando</b> 🧽 o <b>duro</b> 🪨.</p>`},
    {h:'Cuidamos los sentidos', html:()=>`<p>😎 No miramos nunca directamente al <b>sol</b>: hace daño a los ojos.<br>
      📺 Vemos la tele y la tablet a una buena distancia y con luz.<br>
      🎧 No ponemos la música muy alta: los ruidos fuertes dañan el oído.<br>
      🔥 No tocamos cosas muy calientes: nos podemos quemar.</p>`},
    {h:'Para recordar', html:()=>`<p>• Vista ➜ ojos ➜ colores y formas.<br>• Oído ➜ orejas ➜ sonidos.<br>• Olfato ➜ nariz ➜ olores.<br>• Gusto ➜ lengua ➜ dulce, salado, ácido, amargo.<br>• Tacto ➜ piel ➜ frío, caliente, suave, áspero.</p>`}
  ],
  preguntas:[
    {v:[_o('¿Cuántos sentidos tenemos?',['3','5','10'],'5','Vista, oído, olfato, gusto y tacto.'),
        _v('Tenemos cinco sentidos.',true,'Vista, oído, olfato, gusto y tacto.'),
        _o('¿Cuál de estos es un sentido?',['El olfato','El pelo','La rodilla'],'El olfato')]},
    {v:[_o('¿Qué parte señala la flecha?',['Los ojos','La nariz','La lengua'],'Los ojos','Con los ojos vemos.',()=>SENT.marca('ojo')),
        _o('¿Con qué parte del cuerpo vemos?',['Con los ojos','Con la nariz','Con las orejas'],'Con los ojos'),
        _o('¿Qué sentido usamos con los ojos?',['La vista','El oído','El gusto'],'La vista')]},
    {v:[_o('¿Qué parte señala la flecha?',['La oreja','El ojo','La lengua'],'La oreja','Con las orejas oímos.',()=>SENT.marca('oreja')),
        _o('¿Con qué parte del cuerpo oímos?',['Con las orejas','Con las manos','Con la lengua'],'Con las orejas'),
        _o('¿Qué sentido usamos para escuchar música?',['El oído','El olfato','El tacto'],'El oído')]},
    {v:[_o('¿Qué parte señala la flecha?',['La nariz','La oreja','El ojo'],'La nariz','Con la nariz olemos.',()=>SENT.marca('nariz')),
        _o('¿Qué sentido usamos para oler una flor?',['El olfato','La vista','El oído'],'El olfato'),
        _v('Olemos el pan recién hecho con la nariz.',true,'Sí: es el sentido del olfato.')]},
    {v:[_o('¿Qué parte señala la flecha?',['La lengua','La nariz','El ojo'],'La lengua','Con la lengua notamos los sabores.',()=>SENT.marca('lengua')),
        _o('¿Con qué parte del cuerpo notamos los sabores?',['Con la lengua','Con las orejas','Con los ojos'],'Con la lengua'),
        _o('¿Qué sentido usamos para saber si la sopa está salada?',['El gusto','El oído','La vista'],'El gusto')]},
    {v:[_o('¿Qué sentido usamos al tocar las cosas?',['El tacto','El olfato','El oído'],'El tacto','El tacto está en la piel.',()=>SENT.mano()),
        _o('¿Dónde está el sentido del tacto?',['En toda la piel','Solo en la nariz','Solo en los ojos'],'En toda la piel'),
        _v('El tacto solo está en las manos.',false,'El tacto está en toda la piel, aunque usamos sobre todo las manos.')]},
    {v:[_o('¿A qué sabe el limón?',['Ácido','Dulce','Salado'],'Ácido'),
        _o('¿Qué sabor tiene el azúcar?',['Dulce','Amargo','Ácido'],'Dulce'),
        _o('¿Qué comida es salada?',['Las patatas fritas','Un caramelo','Un limón'],'Las patatas fritas','Las patatas fritas llevan sal.')]},
    {v:[_o('Tocas un cubito de hielo. ¿Cómo está?',['Frío','Caliente','Áspero'],'Frío','Lo notamos con el tacto.'),
        _o('Un osito de peluche, al tocarlo, es…',['Suave','Áspero','Duro'],'Suave'),
        _o('¿Con qué sentido sabemos si el agua está caliente?',['Con el tacto','Con el oído','Con la vista'],'Con el tacto')]},
    {v:[_o('Estás con los ojos cerrados y oyes «¡guau!». ¿Qué sentido te dice que hay un perro?',['El oído','El gusto','El tacto'],'El oído'),
        _o('¿Qué sentido te dice de qué color es una pelota?',['La vista','El olfato','El gusto'],'La vista'),
        _v('A oscuras, sin nada de luz, podemos ver los colores.',false,'Para ver hace falta luz.')]},
    {v:[_o('¿Por qué no debemos mirar directamente al sol?',['Porque hace daño a los ojos','Porque se apaga','Porque huele mal'],'Porque hace daño a los ojos'),
        _v('Poner la música muy alta es bueno para el oído.',false,'Los ruidos muy fuertes dañan el oído.'),
        _o('¿Cuál de estas cosas cuida nuestros sentidos?',['Ver la tablet a buena distancia','Mirar al sol','Poner la música muy alta'],'Ver la tablet a buena distancia')]}
  ]
});
})();
