"use strict";
// Tema de la Biblioteca para Berta (grupo 9): Ángulos, triángulos y rectas (4º de primaria). En español.
// Hecho sin el libro del cole (20 nov 2026): ajustar vocabulario y ejemplos cuando llegue el material.
// Formato de tema: ver contenido/temas/figuras.js. 12 preguntas × 3 formas (10 de ángulos y triángulos + 2 de rectas).
window.TEMAS=window.TEMAS||[];
(function(){
const o=(q,opts,a,exp,vis)=>({t:'opcion',q,opts,a,exp,vis}), v=(q,a,exp,vis)=>({t:'vf',q,a,exp,vis}), ord=(q,items,exp)=>({t:'ordenar',q,items,exp});
const AZ='#2b5d7a', RO='#d62828';
const svg=(inner,w,h)=>`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="margin:4px;vertical-align:middle;max-width:100%">${inner}</svg>`;
const fila=(...a)=>`<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;align-items:flex-end">${a.join('')}</div>`;
const pie=(t,d)=>`<div style="text-align:center;font-size:15px">${d}<div><b>${t}</b></div></div>`;
// Arco (o cuadradito si es recto) en el vértice V entre los lados que van hacia A y B
function marca(V,A,B,r,recto,col){
  const u=P=>{ const dx=P[0]-V[0], dy=P[1]-V[1], l=Math.hypot(dx,dy); return [dx/l,dy/l]; }, a=u(A), b=u(B);
  if(recto){ const p1=[V[0]+a[0]*r,V[1]+a[1]*r], p3=[V[0]+b[0]*r,V[1]+b[1]*r], p2=[p1[0]+b[0]*r,p1[1]+b[1]*r];
    return `<path d="M${p1} L${p2} L${p3}" fill="none" stroke="${col}" stroke-width="2.5"/>`; }
  const s=[V[0]+a[0]*r,V[1]+a[1]*r], e=[V[0]+b[0]*r,V[1]+b[1]*r], cruz=a[0]*b[1]-a[1]*b[0];
  return `<path d="M${V} L${s} A${r} ${r} 0 0 ${cruz>0?1:0} ${e} Z" fill="${col}" fill-opacity=".25" stroke="${col}" stroke-width="2"/>`;
}
// Un ángulo de «g» grados: un lado horizontal hacia la derecha y otro girado
function angulo(g,etq){
  const V=[100,100], R=85, A=[V[0]+R,V[1]], rad=g*Math.PI/180, B=[V[0]+R*Math.cos(rad),V[1]-R*Math.sin(rad)];
  let m;
  if(g===90) m=marca(V,A,B,18,true,RO);
  else if(g===180) m=`<path d="M${V[0]+22},${V[1]} A22 22 0 0 0 ${V[0]-22},${V[1]} Z" fill="${RO}" fill-opacity=".25" stroke="${RO}" stroke-width="2"/>`;
  else m=marca(V,A,B,24,false,RO);
  const t=etq?`<text x="100" y="${g>150?70:118}" text-anchor="middle" font-size="13" fill="${RO}" font-weight="700">${etq}</text>`:'';
  return svg(`${m}<line x1="${V[0]}" y1="${V[1]}" x2="${A[0]}" y2="${A[1]}" stroke="${AZ}" stroke-width="4" stroke-linecap="round"/><line x1="${V[0]}" y1="${V[1]}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${AZ}" stroke-width="4" stroke-linecap="round"/><circle cx="${V[0]}" cy="${V[1]}" r="5" fill="${AZ}"/>${t}`,200,etq?125:110);
}
// Triángulo: 3 puntos, rayitas por lado (lado i va del punto i al i+1), ángulo recto y ángulo obtuso marcados
function tri(P,col,rayas,recto,obtuso){
  let out=`<polygon points="${P.map(p=>p.join(',')).join(' ')}" fill="${col}" stroke="${AZ}" stroke-width="3" stroke-linejoin="round"/>`;
  (rayas||[0,0,0]).forEach((n,i)=>{ const A=P[i], B=P[(i+1)%3], mx=(A[0]+B[0])/2, my=(A[1]+B[1])/2, dx=B[0]-A[0], dy=B[1]-A[1], l=Math.hypot(dx,dy), ux=dx/l, uy=dy/l;
    for(let k=0;k<n;k++){ const o=(k-(n-1)/2)*7, cx=mx+ux*o, cy=my+uy*o;
      out+=`<line x1="${(cx-uy*8).toFixed(1)}" y1="${(cy+ux*8).toFixed(1)}" x2="${(cx+uy*8).toFixed(1)}" y2="${(cy-ux*8).toFixed(1)}" stroke="${RO}" stroke-width="3" stroke-linecap="round"/>`; } });
  if(recto!=null){ const V=P[recto]; out+=marca(V,P[(recto+1)%3],P[(recto+2)%3],16,true,RO); }
  if(obtuso!=null){ const V=P[obtuso]; out+=marca(V,P[(obtuso+1)%3],P[(obtuso+2)%3],18,false,RO); }
  return svg(out,200,125);
}
const T={
  equilatero:()=>tri([[100,11],[160,115],[40,115]],'#ffd166',[1,1,1]),
  isosceles:()=>tri([[100,8],[138,115],[62,115]],'#8ecae6',[1,0,1]),
  escaleno:()=>tri([[60,40],[175,115],[25,115]],'#95d5b2',[0,0,0]),
  rectangulo:()=>tri([[45,115],[165,115],[45,30]],'#f4a259',null,0),
  obtusangulo:()=>tri([[62,62],[185,112],[15,112]],'#cdb4db',null,null,0),
  acutangulo:()=>tri([[110,18],[170,115],[30,115]],'#f28fad'),
  rectIsos:()=>tri([[45,115],[150,115],[45,10]],'#f4a259',[1,0,1],0)
};
// Reloj en punto: la aguja larga en el 12 y la corta en la hora «h»
function reloj(h){
  let marcas=''; for(let i=1;i<=12;i++){ const a=(i*30-90)*Math.PI/180; marcas+=`<text x="${(60+40*Math.cos(a)).toFixed(1)}" y="${(64+40*Math.sin(a)).toFixed(1)}" text-anchor="middle" font-size="12" fill="${AZ}" font-weight="700">${i}</text>`; }
  const a=(h*30-90)*Math.PI/180, hx=60+30*Math.cos(a), hy=60+30*Math.sin(a);
  return svg(`<circle cx="60" cy="60" r="54" fill="#fff8e7" stroke="${AZ}" stroke-width="4"/>${marcas}<line x1="60" y1="60" x2="60" y2="30" stroke="${AZ}" stroke-width="3.5" stroke-linecap="round"/><line x1="60" y1="60" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="${RO}" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="60" r="4" fill="${AZ}"/>`,120,120);
}
// Rectas
const L=(x1,y1,x2,y2,c)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
const R={
  paralelas:()=>svg(L(15,40,185,25,AZ)+L(15,95,185,80,'#2a9d8f'),200,120),
  perpendiculares:()=>svg(L(20,65,180,65,AZ)+L(100,8,100,115,'#2a9d8f')+marca([100,65],[180,65],[100,8],14,true,RO),200,120),
  secantes:()=>svg(L(15,100,185,25,AZ)+L(15,30,185,105,'#2a9d8f'),200,120)
};
window.TEMAS.push({
  id:'mates-angulos', para:'9', emoji:'📐', asignatura:'Matemáticas', titulo:'Ángulos, triángulos y rectas',
  libro:[
    {h:'¿Qué es un ángulo?', html:()=>`${fila(angulo(50))}
      <p>Un <b>ángulo</b> se forma cuando dos líneas (los <b>lados</b>) salen del mismo punto. Ese punto se llama <b>vértice</b>.</p>
      <p>Lo que importa es <b>cuánto se abren</b> los lados, no lo largos que sean. La abertura se mide en <b>grados</b>, que se escriben con un circulito: 90° se lee «noventa grados».</p>
      <p>📄 Truco: la esquina de un folio es un ángulo de 90°. Úsala para comprobar ángulos.</p>`},
    {h:'Tipos de ángulo', html:()=>`${fila(pie('Agudo',angulo(45)),pie('Recto',angulo(90)))}${fila(pie('Obtuso',angulo(135)),pie('Llano',angulo(180)))}
      <p>🔸 <b>Agudo</b>: mide <b>menos de 90°</b>. Es más cerrado que la esquina del folio.<br>
      🔸 <b>Recto</b>: mide <b>justo 90°</b>. Se marca con un cuadradito.<br>
      🔸 <b>Obtuso</b>: mide <b>más de 90° y menos de 180°</b>. Es más abierto que la esquina del folio.<br>
      🔸 <b>Llano</b>: mide <b>180°</b>. Sus dos lados forman una línea recta. Es como <b>dos rectos juntos</b>: 90° + 90° = 180°.</p>
      <p>De menor a mayor: agudo → recto → obtuso → llano.</p>`},
    {h:'Ángulos a nuestro alrededor', html:()=>`${fila(pie('A la 1',reloj(1)),pie('A las 3',reloj(3)),pie('A las 5',reloj(5)))}
      <p>🕒 Las agujas del reloj forman ángulos. A las <b>3 en punto</b> forman un ángulo <b>recto</b>. A la <b>1</b>, uno <b>agudo</b>. A las <b>5</b>, uno <b>obtuso</b>. Y a las <b>6</b> forman una línea recta: un ángulo <b>llano</b>.</p>
      <p>🚪 Una puerta que se abre un poco forma un ángulo agudo; abierta del todo contra la pared, uno recto o más.<br>🍕 Una porción de pizza tiene en la punta un ángulo agudo.</p>`},
    {h:'Triángulos según sus lados', html:()=>`${fila(pie('Equilátero',T.equilatero()),pie('Isósceles',T.isosceles()),pie('Escaleno',T.escaleno()))}
      <p>Las <b>rayitas rojas</b> marcan los lados que miden lo mismo.</p>
      <p>🔺 <b>Equilátero</b>: sus <b>3 lados son iguales</b>.<br>
      🔺 <b>Isósceles</b>: tiene <b>2 lados iguales</b> y uno distinto.<br>
      🔺 <b>Escaleno</b>: sus <b>3 lados son distintos</b>.</p>
      <p>Ejemplo: un triángulo de 5 cm, 5 cm y 3 cm es isósceles, porque tiene dos lados de 5.</p>`},
    {h:'Triángulos según sus ángulos', html:()=>`${fila(pie('Acutángulo',T.acutangulo()),pie('Rectángulo',T.rectangulo()),pie('Obtusángulo',T.obtusangulo()))}
      <p>🔺 <b>Acutángulo</b>: sus <b>3 ángulos son agudos</b>.<br>
      🔺 <b>Rectángulo</b>: tiene <b>un ángulo recto</b> (el del cuadradito).<br>
      🔺 <b>Obtusángulo</b>: tiene <b>un ángulo obtuso</b>.</p>
      <p>Fíjate en que los nombres se parecen a los de los ángulos: <b>acut</b>ángulo viene de agudo, <b>rect</b>ángulo de recto y <b>obtus</b>ángulo de obtuso.</p>`},
    {h:'Nombre completo', html:()=>`${fila(T.rectIsos())}
      <p>Todo triángulo tiene un nombre por sus <b>ángulos</b> y otro por sus <b>lados</b>, y se pueden juntar.</p>
      <p>Este tiene un ángulo recto y dos lados iguales: es un triángulo <b>rectángulo isósceles</b>. Como la mitad de un cuadrado cortado en diagonal.</p>
      <p>El equilátero tiene sus tres ángulos agudos, así que su nombre completo es <b>acutángulo equilátero</b>.</p>`},
    {h:'El secreto del triángulo', html:()=>`<p>✂️ Dibuja un triángulo en un papel, recórtalo y corta sus 3 esquinas. Si las juntas, una al lado de otra, ¡forman una línea recta! Un ángulo llano.</p>
      <p>Por eso <b>los 3 ángulos de cualquier triángulo suman siempre 180°</b>.</p>
      <p>Ejemplo: si un ángulo mide 90° y otro 40°, el tercero mide 180 − 90 − 40 = <b>50°</b>.</p>
      <p>🤔 Por eso un triángulo <b>no puede tener dos ángulos rectos</b>: 90° + 90° ya son 180° y no quedaría nada para el tercer ángulo. Tampoco puede tener dos obtusos.</p>`},
    {h:'Las rectas', html:()=>`${fila(pie('Paralelas',R.paralelas()),pie('Perpendiculares',R.perpendiculares()))}${fila(pie('Secantes',R.secantes()))}
      <p>Una <b>recta</b> es una línea derecha que no se acaba nunca, ni por un lado ni por el otro.</p>
      <p>🛤️ <b>Paralelas</b>: van siempre a la misma distancia y <b>nunca se cortan</b>, aunque las alargues. Como las vías del tren.<br>
      ➕ <b>Perpendiculares</b>: se cortan formando <b>4 ángulos rectos</b>. Como las líneas del signo más o una esquina de la pizarra.<br>
      ✖️ <b>Secantes</b>: se cortan en un punto. Las perpendiculares son unas secantes especiales.</p>`},
    {h:'Para recordar', html:()=>`<p>• Ángulo: dos lados que salen de un vértice. Se mide en grados (°).<br>
      • Agudo &lt; 90° · Recto = 90° · Obtuso entre 90° y 180° · Llano = 180°.<br>
      • Por sus lados: equilátero (3 iguales), isósceles (2 iguales), escaleno (ninguno igual).<br>
      • Por sus ángulos: acutángulo (3 agudos), rectángulo (1 recto), obtusángulo (1 obtuso).<br>
      • Los 3 ángulos de un triángulo suman 180°.<br>
      • Rectas paralelas (nunca se cortan), perpendiculares (se cortan en ángulo recto) y secantes (se cortan).</p>`}
  ],
  preguntas:[
    // 1. Reconocer un ángulo dibujado
    {v:[o('¿Qué tipo de ángulo es este?',['Agudo','Recto','Obtuso','Llano'],'Agudo','Es más cerrado que la esquina de un folio: mide menos de 90°.',()=>angulo(40)),
        o('¿Qué tipo de ángulo es este?',['Agudo','Recto','Obtuso','Llano'],'Obtuso','Es más abierto que la esquina de un folio, pero sus lados no forman una línea recta.',()=>angulo(130)),
        o('¿Qué tipo de ángulo es este?',['Agudo','Recto','Obtuso','Llano'],'Recto','El cuadradito avisa de que es un ángulo recto: 90°.',()=>angulo(90))]},
    // 2. Grados de cada tipo
    {v:[o('Un ángulo agudo mide…',['Menos de 90°','Justo 90°','Entre 90° y 180°','180°'],'Menos de 90°'),
        o('Un ángulo de 120° es…',['Agudo','Recto','Obtuso','Llano'],'Obtuso','120° es más que 90° y menos que 180°.'),
        o('Un ángulo de 45° es…',['Agudo','Recto','Obtuso','Llano'],'Agudo','45° es menos que 90°.')]},
    // 3. Recto y llano
    {v:[o('¿Cuántos grados mide un ángulo recto?',['45°','90°','180°','360°'],'90°'),
        o('¿Cuántos grados mide un ángulo llano?',['90°','100°','180°','360°'],'180°','Sus dos lados forman una línea recta.'),
        v('Un ángulo llano es como dos ángulos rectos juntos.',true,'90° + 90° = 180°, que es lo que mide un llano.')]},
    // 4. Ordenar ángulos
    {v:[ord('Ordena los ángulos de menor a mayor.',['Agudo','Recto','Obtuso','Llano']),
        ord('Ordena estos ángulos de menor a mayor.',['20°','75°','110°','180°']),
        o('Un ángulo obtuso, comparado con uno recto, es…',['Más grande','Más pequeño','Igual'],'Más grande','El obtuso mide más de 90° y el recto justo 90°.')]},
    // 5. El reloj
    {v:[o('¿Qué ángulo forman las agujas a las 3 en punto?',['Agudo','Recto','Obtuso','Llano'],'Recto','A las 3 las agujas forman una esquina, como la de un folio.',()=>reloj(3)),
        o('¿Qué ángulo forman las agujas a la 1 en punto?',['Agudo','Recto','Obtuso','Llano'],'Agudo','Están muy juntas: el ángulo es más cerrado que uno recto.',()=>reloj(1)),
        o('¿Qué ángulo forman las agujas a las 5 en punto?',['Agudo','Recto','Obtuso','Llano'],'Obtuso','Están más abiertas que a las 3, pero no forman una línea recta como a las 6.',()=>reloj(5))]},
    // 6. Triángulos por sus lados (dibujo)
    {v:[o('Las rayitas marcan los lados iguales. ¿Cómo es este triángulo?',['Equilátero','Isósceles','Escaleno'],'Equilátero','Sus 3 lados tienen rayita: los 3 son iguales.',()=>T.equilatero()),
        o('Las rayitas marcan los lados iguales. ¿Cómo es este triángulo?',['Equilátero','Isósceles','Escaleno'],'Isósceles','Tiene 2 lados iguales y uno distinto.',()=>T.isosceles()),
        o('Este triángulo tiene sus 3 lados distintos. ¿Cómo se llama?',['Equilátero','Isósceles','Escaleno'],'Escaleno','Escaleno = ningún lado igual.',()=>T.escaleno())]},
    // 7. Triángulos por sus lados (medidas)
    {v:[o('Un triángulo mide 5 cm, 5 cm y 3 cm. ¿Cómo es?',['Equilátero','Isósceles','Escaleno'],'Isósceles','Tiene dos lados de 5 cm: 2 lados iguales.'),
        o('Un triángulo mide 4 cm, 4 cm y 4 cm. ¿Cómo es?',['Equilátero','Isósceles','Escaleno'],'Equilátero','Sus 3 lados miden lo mismo.'),
        o('Un triángulo mide 3 cm, 4 cm y 6 cm. ¿Cómo es?',['Equilátero','Isósceles','Escaleno'],'Escaleno','Los 3 lados son distintos.')]},
    // 8. Triángulos por sus ángulos
    {v:[o('¿Cómo se llama este triángulo por sus ángulos?',['Acutángulo','Rectángulo','Obtusángulo'],'Rectángulo','Tiene un ángulo recto (el del cuadradito).',()=>T.rectangulo()),
        o('¿Cómo se llama este triángulo por sus ángulos?',['Acutángulo','Rectángulo','Obtusángulo'],'Obtusángulo','El ángulo marcado es obtuso: mide más de 90°.',()=>T.obtusangulo()),
        o('Un triángulo con sus 3 ángulos agudos se llama…',['Acutángulo','Rectángulo','Obtusángulo'],'Acutángulo','Acutángulo viene de «agudo».',()=>T.acutangulo())]},
    // 9. Los ángulos suman 180°
    {v:[o('¿Cuánto suman los 3 ángulos de cualquier triángulo?',['90°','180°','270°','360°'],'180°','Si juntas sus 3 esquinas, forman un ángulo llano.'),
        o('Dos ángulos de un triángulo miden 90° y 40°. ¿Cuánto mide el tercero?',['40°','50°','60°','90°'],'50°','180 − 90 − 40 = 50.'),
        o('En un triángulo equilátero los 3 ángulos son iguales. ¿Cuánto mide cada uno?',['45°','60°','90°','180°'],'60°','180 entre 3 = 60.')]},
    // 10. Por qué no dos rectos / nombre completo
    {v:[v('Un triángulo puede tener dos ángulos rectos.',false,'90° + 90° ya son 180°: no quedaría nada para el tercer ángulo.'),
        o('¿Por qué un triángulo no puede tener dos ángulos rectos?',['Porque sumarían ya 180° y no quedaría nada para el tercer ángulo','Porque los ángulos rectos solo existen en los cuadrados','Porque un triángulo solo tiene dos ángulos'],'Porque sumarían ya 180° y no quedaría nada para el tercer ángulo'),
        o('Tiene un ángulo recto y dos lados iguales. ¿Cuál es su nombre completo?',['Rectángulo isósceles','Acutángulo equilátero','Obtusángulo escaleno','Rectángulo escaleno'],'Rectángulo isósceles','Por sus ángulos es rectángulo y por sus lados, isósceles.',()=>T.rectIsos())]},
    // 11. Rectas (dibujo)
    {v:[o('¿Cómo son estas dos rectas?',['Paralelas','Perpendiculares','Secantes'],'Paralelas','Van a la misma distancia y nunca se cortan.',()=>R.paralelas()),
        o('¿Cómo son estas dos rectas?',['Paralelas','Perpendiculares','Secantes'],'Perpendiculares','Se cortan formando ángulos rectos (mira el cuadradito).',()=>R.perpendiculares()),
        o('Estas rectas se cortan, pero no en ángulo recto. ¿Cómo son?',['Paralelas','Perpendiculares','Secantes'],'Secantes','Se cortan en un punto: son secantes.',()=>R.secantes())]},
    // 12. Rectas en la vida
    {v:[o('Las dos vías del tren son rectas…',['Paralelas','Perpendiculares','Secantes'],'Paralelas','Van siempre a la misma distancia y nunca se juntan.'),
        o('¿Qué rectas nunca se cortan, aunque las alargues mucho?',['Las paralelas','Las perpendiculares','Las secantes'],'Las paralelas'),
        v('Dos rectas perpendiculares forman 4 ángulos rectos al cortarse.',true,'Como las líneas del signo +.')]}
  ]
});
})();
