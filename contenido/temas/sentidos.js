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
    // Ojo de cerca: pupila pequeña (mucha luz) o grande (poca luz)
    ojo:(grande)=>svg(`<rect x="0" y="0" width="120" height="80" rx="12" fill="${grande?'#3b4a63':'#fff4c2'}"/>
      <ellipse cx="60" cy="42" rx="46" ry="26" fill="#fff" stroke="#555" stroke-width="2.5"/>
      <circle cx="60" cy="42" r="20" fill="#3d6b9c"/><circle cx="60" cy="42" r="${grande?14:5}" fill="#111"/><circle cx="66" cy="36" r="3" fill="#fff"/>
      <path d="M14 42 Q60 0 106 42" fill="none" stroke="#555" stroke-width="2.5"/>`,120,80),
    pie:(dib,txt)=>`<div style="text-align:center;font-size:15px;line-height:1.2">${dib}<br>${txt}</div>`,
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
      <p>Los <b>sentidos</b> nos dicen cómo es el mundo que nos rodea. Tenemos <b>cinco</b>, y cada uno tiene su <b>órgano</b>:</p>
      <p>👀 <b>Vista</b> ➜ los <b>ojos</b>.<br>👂 <b>Oído</b> ➜ los <b>oídos</b> (las orejas son la parte de fuera).<br>👃 <b>Olfato</b> ➜ la <b>nariz</b>.<br>👅 <b>Gusto</b> ➜ la <b>lengua</b>.<br>✋ <b>Tacto</b> ➜ la <b>piel</b>.</p>`},
    {h:'El jefe es el cerebro', html:()=>`<p>🧠 Los sentidos funcionan como <b>mensajeros</b>. Cuando ves, oyes o tocas algo, el órgano manda un mensaje al <b>cerebro</b> por unos hilos finísimos que se llaman <b>nervios</b>.</p>
      <p>El cerebro recibe el mensaje y entiende qué es: «esto es una naranja», «eso que suena es mi perro», «¡cuidado, quema!».</p>
      <p>Y todo pasa muy, muy deprisa: ¡en menos de un parpadeo! ⚡</p>`},
    {h:'La vista', html:()=>`${SENT.fila(SENT.pie(SENT.ojo(false),'Con mucha luz'),SENT.pie(SENT.ojo(true),'Con poca luz'))}
      <p>👀 Con la vista vemos <b>colores</b>, <b>formas</b>, <b>tamaños</b> y si algo está cerca o lejos. Para ver hace falta <b>luz</b>.</p>
      <p>El círculo negro del centro del ojo es la <b>pupila</b>: es un agujerito por donde entra la luz. Con mucha luz se hace <b>pequeña</b>, y a oscuras se hace <b>grande</b> para que entre más luz.</p>
      <p>El ojo tiene sus protectores: los <b>párpados</b> y las <b>pestañas</b> paran el polvo, las <b>cejas</b> paran el sudor y las <b>lágrimas</b> lo limpian y lo mantienen húmedo.</p>`},
    {h:'El oído', html:()=>`<p>👂 Los sonidos viajan por el <b>aire</b>, como las olas en el agua. La oreja los recoge y los lleva hacia dentro.</p>
      <p>Dentro del oído hay una piel muy fina que se llama <b>tímpano</b>. Cuando le llega un sonido, <b>vibra</b> como la piel de un tambor 🥁 y manda el mensaje al cerebro.</p>
      <p>¿Sabías que el oído también nos ayuda a mantener el <b>equilibrio</b>? Por eso, si das muchas vueltas, te mareas. 🌀</p>`},
    {h:'El olfato y el gusto, un equipo', html:()=>`<p>👅 La lengua está llena de bultitos llamados <b>papilas gustativas</b>. Con ellas notamos los sabores: <b>dulce</b> (azúcar 🍬), <b>salado</b> (sal 🧂), <b>ácido</b> (limón 🍋) y <b>amargo</b> (café ☕).</p>
      <p>👃 La nariz nota los <b>olores</b>. Los olores también nos avisan de peligros: el humo de un fuego o la comida estropeada.</p>
      <p>El olfato y el gusto trabajan <b>juntos</b>. Cuando estamos resfriados y tenemos la nariz tapada, la comida sabe a muy poco. ¡Haz la prueba: tápate la nariz y come una manzana! 🍎</p>`},
    {h:'El tacto', html:()=>`<p>✋ El tacto está en <b>toda la piel</b>. Con él notamos si algo está <b>frío</b> o <b>caliente</b>, si es <b>suave</b> o <b>áspero</b>, <b>blando</b> o <b>duro</b>, <b>seco</b> o <b>mojado</b>.</p>
      <p>Las partes más sensibles son las <b>yemas de los dedos</b>, los labios y la lengua. Por eso las personas ciegas pueden leer con los dedos: tocan unos puntitos en relieve que forman letras. Esa escritura se llama <b>braille</b>. ⠃⠗⠁⠊⠇⠇⠑</p>
      <p>El <b>dolor</b> también es del tacto: es una alarma que nos avisa de que algo nos hace daño.</p>`},
    {h:'Animales con supersentidos', html:()=>`<p>🐶 El <b>perro</b> tiene un olfato muchísimo mejor que el nuestro: por eso ayuda a buscar personas perdidas.<br>
      🦉 El <b>búho</b> y el <b>gato</b> ven muy bien de noche: sus pupilas se hacen enormes.<br>
      🦇 El <b>murciélago</b> «ve» con el oído: lanza grititos y escucha el eco que rebota en las cosas.<br>
      🦈 El <b>tiburón</b> huele una gota de sangre muy lejos en el mar.</p>`},
    {h:'Cuidamos los sentidos', html:()=>`<p>😎 No miramos nunca directamente al sol, ni siquiera con gafas de sol.<br>📺 Vemos la tablet y la tele a buena distancia y con luz.<br>🎧 No ponemos la música muy alta: los ruidos fuertes dañan el tímpano.<br>✋ Lavamos las manos y la piel, y nos ponemos crema al sol.</p>`},
    {h:'Para recordar', html:()=>`<p>• Vista ➜ ojos · Oído ➜ oídos · Olfato ➜ nariz · Gusto ➜ lengua · Tacto ➜ piel.<br>• Los sentidos mandan mensajes al <b>cerebro</b> por los <b>nervios</b>.<br>• La <b>pupila</b> se hace pequeña con mucha luz y grande a oscuras.<br>• El <b>tímpano</b> vibra con los sonidos. El oído también da el <b>equilibrio</b>.<br>• Con la nariz tapada, la comida sabe a poco.<br>• <b>Braille</b>: leer con los dedos.</p>`}
  ],
  preguntas:[
    {v:[_o('¿Qué parte señala la flecha?',['Los ojos','La nariz','La lengua'],'Los ojos','Son los órganos de la vista.',()=>SENT.marca('ojo')),
        _o('¿Qué parte señala la flecha?',['La oreja','El ojo','La nariz'],'La oreja','Recoge los sonidos.',()=>SENT.marca('oreja')),
        _o('¿Qué parte señala la flecha?',['La lengua','La nariz','La oreja'],'La lengua','Es el órgano del gusto.',()=>SENT.marca('lengua'))]},
    {v:[_o('¿Cuál es el órgano del tacto?',['La piel','La lengua','La nariz'],'La piel','El tacto está en toda la piel.'),
        _o('¿Qué sentido usamos para saber si la sopa está salada?',['El gusto','El oído','La vista'],'El gusto'),
        _o('¿Qué sentido nos avisa del humo de un fuego antes de verlo?',['El olfato','El gusto','El tacto'],'El olfato')]},
    {v:[_o('¿A quién mandan sus mensajes los sentidos?',['Al cerebro','Al estómago','A los pies'],'Al cerebro','El cerebro entiende lo que vemos, oímos o tocamos.'),
        _o('¿Cómo se llaman los hilos finísimos que llevan los mensajes al cerebro?',['Nervios','Pelos','Venas'],'Nervios'),
        _v('Los ojos ven, pero quien entiende lo que vemos es el cerebro.',true,'Sí: los ojos mandan el mensaje y el cerebro lo entiende.')]},
    {v:[_o('¿Cómo se llama el agujerito negro del centro del ojo?',['Pupila','Pestaña','Tímpano'],'Pupila','Por ahí entra la luz.'),
        _o('Entras en una habitación oscura. ¿Qué le pasa a tu pupila?',['Se hace grande','Se hace pequeña','Se cierra'],'Se hace grande','Así entra más luz.',()=>SENT.ojo(true)),
        _o('¿Por qué la pupila se hace pequeña cuando hay mucha luz?',['Para que no entre demasiada luz','Para ver más colores','Porque tiene sueño'],'Para que no entre demasiada luz',null,()=>SENT.ojo(false))]},
    {v:[_o('¿Para qué sirven las pestañas?',['Para parar el polvo','Para oír mejor','Para oler'],'Para parar el polvo'),
        _o('¿Qué limpia el ojo y lo mantiene húmedo?',['Las lágrimas','Las cejas','La pupila'],'Las lágrimas'),
        _v('Las cejas ayudan a que el sudor no caiga en los ojos.',true,'Sí: las cejas, los párpados, las pestañas y las lágrimas protegen el ojo.')]},
    {v:[_o('¿Cómo se llama la piel fina que vibra dentro del oído?',['Tímpano','Pupila','Papila'],'Tímpano','Vibra como la piel de un tambor.'),
        _o('¿Por dónde viajan los sonidos hasta nuestro oído?',['Por el aire','Por la luz','Por los ojos'],'Por el aire'),
        _o('Además de oír, ¿en qué nos ayuda el oído?',['A mantener el equilibrio','A ver de noche','A notar sabores'],'A mantener el equilibrio','Por eso te mareas si das muchas vueltas.')]},
    {v:[_o('Estás resfriada y tienes la nariz tapada. ¿Por qué la comida sabe a poco?',['Porque el olfato y el gusto trabajan juntos','Porque la comida está fría','Porque la lengua duerme'],'Porque el olfato y el gusto trabajan juntos'),
        _o('¿Cómo se llaman los bultitos de la lengua que notan los sabores?',['Papilas gustativas','Pestañas','Nervios del pie'],'Papilas gustativas'),
        _o('¿A qué sabe el limón?',['Ácido','Dulce','Amargo'],'Ácido')]},
    {v:[_o('¿Qué parte de la mano es la más sensible al tacto?',['Las yemas de los dedos','Las uñas','El codo'],'Las yemas de los dedos'),
        _o('¿Cómo se llama la escritura de puntitos que las personas ciegas leen con los dedos?',['Braille','Pupila','Tímpano'],'Braille'),
        _o('¿Para qué sirve sentir dolor?',['Nos avisa de que algo nos hace daño','Para nada','Para oír mejor'],'Nos avisa de que algo nos hace daño','El dolor es una alarma del tacto.')]},
    {v:[_o('¿Qué animal tiene un olfato tan bueno que ayuda a buscar personas perdidas?',['El perro','El búho','La tortuga'],'El perro'),
        _o('¿Qué animal «ve» con el oído, escuchando el eco de sus grititos?',['El murciélago','El gato','El pez'],'El murciélago'),
        _o('¿Por qué el búho ve muy bien de noche?',['Porque sus pupilas se hacen enormes','Porque lleva linterna','Porque duerme de día'],'Porque sus pupilas se hacen enormes','Así entra mucha luz aunque sea poca.')]},
    {v:[_o('¿Por qué no debemos mirar directamente al sol?',['Porque hace daño a los ojos','Porque se apaga','Porque huele mal'],'Porque hace daño a los ojos'),
        _o('¿Qué parte del oído se puede dañar con la música muy alta?',['El tímpano','La pupila','La lengua'],'El tímpano'),
        _o('¿Cuál de estas cosas cuida nuestros sentidos?',['Ver la tablet a buena distancia','Mirar al sol','Poner la música muy alta'],'Ver la tablet a buena distancia')]}
  ]
});
})();
