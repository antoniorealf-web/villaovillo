// Tema de la Biblioteca para Cintia (grupo 6): Figuras geométricas (básico).
// Formato de tema: {id, para, emoji, asignatura, titulo, libro:[{h, html}], preguntas:[{v:[3 formas de la misma pregunta]}]}
// Cada forma: {t:'opcion'|'vf'|'ordenar', q, opts, a, exp?, vis?}  (vis: HTML o función que devuelve HTML; FIG está en esta misma carpeta)
window.TEMAS=window.TEMAS||[];
window.FIG=window.FIG||(function(){
  const ST='stroke="#2b5d7a" stroke-width="3" stroke-linejoin="round"';
  const svg=(inner,w=110,h=110)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="margin:4px;vertical-align:middle">${inner}</svg>`;
  const poly=(n,col,rot)=>{ const pts=[]; for(let i=0;i<n;i++){ const a=rot+i*2*Math.PI/n; pts.push((55+46*Math.cos(a)).toFixed(1)+','+(55+46*Math.sin(a)).toFixed(1)); } return svg(`<polygon points="${pts.join(' ')}" fill="${col}" ${ST}/>`); };
  const F={
    triangulo:()=>poly(3,'#f4a259',-Math.PI/2), cuadrado:()=>svg(`<rect x="16" y="16" width="78" height="78" rx="3" fill="#8ecae6" ${ST}/>`),
    rectangulo:()=>svg(`<rect x="5" y="25" width="100" height="60" rx="3" fill="#95d5b2" ${ST}/>`,110,110), circulo:()=>svg(`<circle cx="55" cy="55" r="44" fill="#f28fad" ${ST}/>`),
    pentagono:()=>poly(5,'#cdb4db',-Math.PI/2), hexagono:()=>poly(6,'#ffd166',0),
    axis:k=>{ const L=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#d62828" stroke-width="3" stroke-dasharray="7 5"/>`;
      if(k==='rect-ok') return svg(`<rect x="10" y="25" width="90" height="60" fill="#95d5b2" ${ST}/>`+L(55,12,55,98));
      if(k==='tri-no') return svg(`<polygon points="20,15 20,92 95,92" fill="#f4a259" ${ST}/>`+L(57,8,57,102));
      if(k==='circ-ok') return svg(`<circle cx="55" cy="55" r="42" fill="#f28fad" ${ST}/>`+L(55,6,55,104));
      return svg(`<polygon points="55,12 15,92 95,92" fill="#f4a259" ${ST}/>`+L(55,6,55,102)); },
    grid:(w,h)=>{ let r=''; for(let i=0;i<w;i++) for(let j=0;j<h;j++) r+=`<rect x="${4+i*26}" y="${4+j*26}" width="26" height="26" fill="#ffd166" stroke="#c98f16" stroke-width="2"/>`; return svg(r,w*26+8,h*26+8); },
    fila:(...a)=>`<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;align-items:center">${a.join('')}</div>`
  };
  return F;
})();
const _o=(q,opts,a,exp,vis)=>({t:'opcion',q,opts,a,exp,vis});
const _v=(q,a,exp,vis)=>({t:'vf',q,a,exp,vis});
window.TEMAS.push({
  id:'mates-figuras', para:'6', emoji:'🔷', asignatura:'Matemáticas', titulo:'Figuras geométricas',
  libro:[
    {h:'Las figuras y sus lados', html:()=>`<p>Las figuras tienen <b>lados</b> (las rayas que las forman) y <b>esquinas</b>, que se llaman <b>vértices</b>.</p>
      ${FIG.fila(FIG.triangulo(),FIG.cuadrado(),FIG.rectangulo())}
      <p>🔺 <b>Triángulo</b>: 3 lados y 3 esquinas.<br>🟦 <b>Cuadrado</b>: 4 lados, todos iguales.<br>🟩 <b>Rectángulo</b>: 4 lados; los de enfrente son iguales (2 largos y 2 cortos).</p>`},
    {h:'Más figuras', html:()=>`${FIG.fila(FIG.circulo(),FIG.pentagono(),FIG.hexagono())}
      <p>⭕ <b>Círculo</b>: es redondo. No tiene lados ni esquinas.<br>⬟ <b>Pentágono</b>: 5 lados.<br>⬢ <b>Hexágono</b>: 6 lados (como las celdas de un panal de abejas 🐝).</p>`},
    {h:'La simetría', html:()=>`<p>Una figura es <b>simétrica</b> si la puedes doblar por una línea y las dos mitades son iguales y coinciden, como un espejo. Esa línea se llama <b>eje de simetría</b>. 🦋 Las alas de una mariposa son simétricas.</p>
      ${FIG.fila(FIG.axis('rect-ok'),FIG.axis('tri-ok'))}<p>✅ En estas dos, la línea roja es un eje: las dos mitades son iguales.</p>
      ${FIG.fila(FIG.axis('tri-no'))}<p>❌ Aquí la línea no es un eje: las dos mitades no son iguales.</p>`},
    {h:'El perímetro', html:()=>`<p>El <b>perímetro</b> es la vuelta completa alrededor de una figura: se suman todos sus lados. 🐜 Es el camino que haría una hormiga andando por el borde.</p>
      ${FIG.fila(FIG.grid(3,2))}<p>Este rectángulo mide 3 de largo y 2 de alto.<br>Perímetro = 3 + 2 + 3 + 2 = <b>10</b>.</p>`},
    {h:'El área', html:()=>`<p>El <b>área</b> es el espacio que ocupa una figura por dentro. Se cuenta con cuadraditos.</p>
      ${FIG.fila(FIG.grid(3,2))}<p>Este rectángulo tiene 6 cuadraditos por dentro. Su área es <b>6</b>.<br>Truco: 3 columnas × 2 filas = 6.</p>`},
    {h:'Para recordar', html:()=>`<p>• Triángulo 3 lados · Cuadrado 4 lados iguales · Rectángulo 4 lados · Pentágono 5 · Hexágono 6 · Círculo ninguno.<br>• Vértices = esquinas.<br>• Simétrica = dos mitades iguales al doblar.<br>• <b>Perímetro</b> = la vuelta por fuera. <b>Área</b> = lo de dentro.</p>`}
  ],
  preguntas:[
    {v:[_o('¿Cómo se llama esta figura?',['Triángulo','Cuadrado','Círculo'],'Triángulo','Tiene 3 lados.',()=>FIG.triangulo()),
        _o('¿Qué figura tiene 3 lados?',['Rectángulo','Triángulo','Círculo'],'Triángulo'),
        _o('¿Cuántas esquinas tiene un triángulo?',['2','3','4'],'3','Un triángulo tiene 3 lados y 3 esquinas.')]},
    {v:[_o('¿Cómo se llama esta figura de 4 lados iguales?',['Triángulo','Círculo','Cuadrado'],'Cuadrado','Sus 4 lados son iguales.',()=>FIG.cuadrado()),
        _o('¿Qué figura tiene 4 lados y todos son iguales?',['Cuadrado','Triángulo','Círculo'],'Cuadrado'),
        _v('Un cuadrado tiene sus 4 lados iguales.',true,'Sí: los 4 lados del cuadrado miden lo mismo.')]},
    {v:[_o('¿Cómo se llama esta figura?',['Círculo','Rectángulo','Triángulo'],'Rectángulo','Tiene 4 lados: 2 largos y 2 cortos.',()=>FIG.rectangulo()),
        _o('Una puerta suele tener forma de…',['Círculo','Triángulo','Rectángulo'],'Rectángulo'),
        _o('¿Cuántos lados tiene un rectángulo?',['3','4','5'],'4')]},
    {v:[_o('¿Cómo se llama esta figura redonda?',['Cuadrado','Círculo','Triángulo'],'Círculo','No tiene lados ni esquinas.',()=>FIG.circulo()),
        _o('¿Qué figura no tiene esquinas ni lados rectos?',['Círculo','Cuadrado','Triángulo'],'Círculo'),
        _o('Una rueda de bici tiene forma de…',['Triángulo','Rectángulo','Círculo'],'Círculo')]},
    {v:[_o('¿Cuántos lados tiene esta figura?',['4','5','6'],'5','Es un pentágono: 5 lados.',()=>FIG.pentagono()),
        _o('¿Cómo se llama la figura de 5 lados?',['Hexágono','Cuadrado','Pentágono'],'Pentágono'),
        _v('Un hexágono tiene 6 lados.',true,'Hexágono = 6 lados.')]},
    {v:[_o('Las esquinas de una figura se llaman…',['Vértices','Ejes','Áreas'],'Vértices'),
        _o('¿Cuántos vértices (esquinas) tiene un cuadrado?',['3','4','5'],'4'),
        _v('El círculo tiene muchas esquinas.',false,'El círculo es redondo: no tiene esquinas.')]},
    {v:[_o('¿Qué es una figura simétrica?',['La que se dobla y sus dos mitades son iguales','La que tiene más de 5 lados','La que es muy grande'],'La que se dobla y sus dos mitades son iguales'),
        _o('Si doblas una figura simétrica por su eje, las dos mitades…',['Son iguales y coinciden','Son distintas','Desaparecen'],'Son iguales y coinciden'),
        _v('Una mariposa tiene las dos alas iguales, por eso es simétrica.',true,'Las dos mitades son como un espejo.')]},
    {v:[_v('La línea roja divide al rectángulo en dos mitades iguales. ¿Es un eje de simetría?',true,'Sí: las dos mitades son iguales.',()=>FIG.axis('rect-ok')),
        _v('¿Es un eje de simetría la línea roja de este triángulo?',false,'No: las dos mitades no son iguales.',()=>FIG.axis('tri-no')),
        _v('La línea roja pasa justo por el centro del círculo. ¿Es un eje de simetría?',true,'Sí: las dos mitades son iguales.',()=>FIG.axis('circ-ok'))]},
    {v:[_o('¿Qué es el perímetro?',['La suma de todos los lados','Lo que ocupa por dentro','El color de la figura'],'La suma de todos los lados'),
        _o('Este rectángulo mide 3 de largo y 2 de alto. ¿Cuánto mide su perímetro (la vuelta completa)?',['5','10','6'],'10','3 + 2 + 3 + 2 = 10',()=>FIG.grid(3,2)),
        _o('Un cuadrado tiene 4 lados de 2 cm. ¿Cuánto mide su perímetro?',['4 cm','6 cm','8 cm'],'8 cm','2 + 2 + 2 + 2 = 8')]},
    {v:[_o('¿Qué es el área?',['El espacio que ocupa por dentro','La suma de los lados','El número de esquinas'],'El espacio que ocupa por dentro'),
        _o('¿Cuántos cuadraditos ocupa este rectángulo por dentro? (su área)',['5','6','10'],'6','3 columnas × 2 filas = 6',()=>FIG.grid(3,2)),
        _o('Cuenta los cuadraditos de dentro. ¿Cuál es el área?',['3','4','8'],'4','2 × 2 = 4',()=>FIG.grid(2,2))]}
  ]
});
