// Tema de la Biblioteca para Berta (grupo 9): Los egipcios. En español.
// Formato de tema: ver contenido/temas/figuras.js.
window.TEMAS=window.TEMAS||[];
(function(){
const o=(q,opts,a,exp)=>({t:'opcion',q,opts,a,exp}), v=(q,a,exp)=>({t:'vf',q,a,exp}), ord=(q,items,exp)=>({t:'ordenar',q,items,exp});
const piramide=`<div style="text-align:center"><svg viewBox="0 0 220 120" width="220" height="120"><rect x="0" y="100" width="220" height="20" fill="#f2d48c"/><polygon points="40,100 100,30 160,100" fill="#e9b85c" stroke="#a8742c" stroke-width="3"/><polygon points="100,30 160,100 130,100" fill="#d39c45"/><polygon points="140,100 175,62 210,100" fill="#e9b85c" stroke="#a8742c" stroke-width="3"/><circle cx="190" cy="25" r="13" fill="#f6c443"/></svg></div>`;
const sociedad=`<div style="text-align:center"><svg viewBox="0 0 240 150" width="260" height="160" font-family="inherit" font-size="11" text-anchor="middle">
  <polygon points="120,5 235,145 5,145" fill="#f6e3b4" stroke="#a8742c" stroke-width="2"/>
  <line x1="97" y1="33" x2="143" y2="33" stroke="#a8742c"/><line x1="73" y1="63" x2="167" y2="63" stroke="#a8742c"/><line x1="50" y1="91" x2="190" y2="91" stroke="#a8742c"/><line x1="27" y1="119" x2="213" y2="119" stroke="#a8742c"/>
  <text x="120" y="28">Faraón</text><text x="120" y="54">Nobles y sacerdotes</text><text x="120" y="82">Escribas y soldados</text><text x="120" y="110">Campesinos y artesanos</text><text x="120" y="138">Esclavos</text></svg></div>`;
window.TEMAS.push({
  id:'historia-egipcios', para:'9', emoji:'🏺', asignatura:'Historia', titulo:'Los egipcios',
  libro:[
    {h:'Dónde y cuándo', html:`<p>Los antiguos egipcios vivieron en <b>África</b>, junto al <b>río Nilo</b>, hace más de <b>5.000 años</b>. Su civilización duró unos 3.000 años, hasta que los romanos conquistaron Egipto.</p>
      <p>Alrededor había <b>desierto</b>. Sin el Nilo, nadie habría podido vivir allí.</p>`},
    {h:'El regalo del Nilo', html:`<p>🌊 Cada año el Nilo se desbordaba: era la <b>crecida</b>. Al bajar el agua, dejaba en los campos un barro negro muy fértil, el <b>limo</b>.</p>
      <p>🌾 En ese limo cultivaban <b>trigo</b> y <b>cebada</b> (para hacer pan y cerveza), y también <b>papiro</b>, una planta con la que fabricaban un tipo de papel.</p>
      <p>⛵ El Nilo era además su gran camino: viajaban y transportaban cosas en barca. Por eso se dice que Egipto es «un regalo del Nilo».</p>`},
    {h:'El faraón y la sociedad', html:`<p>👑 El <b>faraón</b> era el rey. Los egipcios creían que era un <b>dios</b> en la Tierra. Era dueño de todo el país.</p>${sociedad}
      <p>La sociedad era como una pirámide: arriba, el faraón; debajo, nobles y sacerdotes; después, escribas y soldados; luego, campesinos y artesanos (los más numerosos); y abajo, los esclavos.</p>`},
    {h:'Las pirámides', html:`${piramide}<p>Las <b>pirámides</b> eran <b>tumbas</b> para los faraones. Las más famosas están en <b>Guiza</b>. La más grande es la de <b>Keops</b>: tardaron unos 20 años en construirla, con enormes bloques de piedra.</p>
      <p>Junto a ellas está la <b>Esfinge</b>, una figura gigante con cuerpo de león y cabeza humana.</p>`},
    {h:'Las momias', html:`<p>Los egipcios creían que había <b>vida después de la muerte</b>. Para que el cuerpo durara para siempre, lo convertían en <b>momia</b>: lo secaban con sal, lo vendaban y lo guardaban en un <b>sarcófago</b>.</p>
      <p>En la tumba dejaban comida, joyas y objetos para la otra vida.</p>`},
    {h:'La escritura', html:`<p>✍️ Escribían con <b>jeroglíficos</b>: dibujos que representaban cosas o sonidos. Escribían sobre <b>papiro</b> o tallaban en piedra.</p>
      <p>Pocos sabían escribir: eran los <b>escribas</b>, muy importantes porque llevaban las cuentas y apuntaban las leyes.</p>
      <p>Durante mucho tiempo nadie sabía leer jeroglíficos, hasta que se descubrió la <b>piedra de Rosetta</b>, con el mismo texto en tres escrituras.</p>`},
    {h:'Los dioses', html:`<p>Los egipcios adoraban a <b>muchos dioses</b> (eran <b>politeístas</b>). Algunos tenían cuerpo humano y cabeza de animal.</p>
      <p>☀️ <b>Ra</b>: dios del Sol, el más importante.<br>🐺 <b>Anubis</b>: cabeza de chacal; cuidaba de los muertos y de las momias.<br>🦅 <b>Horus</b>: cabeza de halcón; protegía al faraón.<br>👑 <b>Osiris</b> e <b>Isis</b>: dioses de la vida después de la muerte y de la familia.</p>`},
    {h:'Para recordar', html:`<p>• África, río Nilo, hace más de 5.000 años.<br>• Crecida del Nilo → limo → campos fértiles.<br>• Faraón = rey y dios. Sociedad en forma de pirámide.<br>• Pirámides = tumbas de faraones (Keops, en Guiza).<br>• Momias, porque creían en la vida después de la muerte.<br>• Jeroglíficos sobre papiro; los escribas sabían escribir.<br>• Muchos dioses: Ra (Sol), Anubis (muertos).</p>`}
  ],
  preguntas:[
    {v:[o('¿Junto a qué río vivían los antiguos egipcios?',['El Nilo','El Ebro','El Amazonas','El Danubio'],'El Nilo'),
        o('¿En qué continente está Egipto?',['África','Europa','América'],'África'),
        o('¿Por qué los egipcios vivían cerca del río?',['Porque alrededor había desierto y el río daba agua y tierra fértil','Porque les gustaba nadar','Porque el faraón vivía en una isla'],'Porque alrededor había desierto y el río daba agua y tierra fértil')]},
    {v:[o('¿Qué dejaba el Nilo en los campos después de la crecida?',['Limo, un barro muy fértil','Arena del desierto','Sal'],'Limo, un barro muy fértil'),
        o('¿Por qué era buena la crecida del Nilo?',['Porque dejaba limo y los campos daban buenas cosechas','Porque traía peces voladores','Porque secaba los campos'],'Porque dejaba limo y los campos daban buenas cosechas'),
        v('Las crecidas del Nilo hacían que la tierra fuera fértil.',true,'El limo que dejaba el agua era muy bueno para cultivar.')]},
    {v:[o('¿Cómo se llamaba el rey de los egipcios?',['Faraón','Emperador','Califa'],'Faraón'),
        v('Los egipcios creían que el faraón era un dios.',true),
        o('¿Quién estaba en lo más alto de la sociedad egipcia?',['El faraón','Los escribas','Los campesinos'],'El faraón')]},
    {v:[ord('Ordena la sociedad egipcia de arriba abajo.',['Faraón','Nobles y sacerdotes','Escribas','Campesinos']),
        o('¿Qué grupo era el más numeroso en Egipto?',['Los campesinos y artesanos','Los faraones','Los sacerdotes'],'Los campesinos y artesanos'),
        o('¿Quiénes estaban en la parte más baja de la sociedad?',['Los esclavos','Los nobles','Los escribas'],'Los esclavos')]},
    {v:[o('¿Para qué servían las pirámides?',['Eran tumbas de los faraones','Eran casas de los campesinos','Eran mercados'],'Eran tumbas de los faraones'),
        o('¿Cómo se llama la pirámide más grande de Guiza?',['Keops','Rosetta','Nilo'],'Keops'),
        v('Las pirámides eran palacios donde vivía el faraón.',false,'Eran tumbas.')]},
    {v:[o('¿Por qué los egipcios hacían momias?',['Porque creían en la vida después de la muerte','Para asustar a los ladrones','Porque hacía frío'],'Porque creían en la vida después de la muerte'),
        o('¿Cómo se llama la caja donde se guardaba la momia?',['Sarcófago','Papiro','Esfinge'],'Sarcófago'),
        v('En las tumbas dejaban comida y objetos para la otra vida.',true)]},
    {v:[o('¿Cómo se llamaba la escritura de los egipcios?',['Jeroglíficos','Abecedario','Números romanos'],'Jeroglíficos'),
        o('¿Cómo eran los jeroglíficos?',['Dibujos que representaban cosas o sonidos','Letras como las nuestras','Solo números'],'Dibujos que representaban cosas o sonidos'),
        o('¿Qué objeto ayudó a entender los jeroglíficos?',['La piedra de Rosetta','La pirámide de Keops','El sarcófago'],'La piedra de Rosetta','Tenía el mismo texto en tres escrituras.')]},
    {v:[o('¿Sobre qué escribían los egipcios?',['Sobre papiro','Sobre plástico','Sobre cartulina'],'Sobre papiro'),
        o('¿De dónde salía el papiro?',['De una planta que crecía junto al Nilo','De la piel de los camellos','De las piedras'],'De una planta que crecía junto al Nilo'),
        v('El papiro se hacía con una planta del río Nilo.',true)]},
    {v:[o('¿Quiénes eran los escribas?',['Los que sabían leer y escribir','Los soldados del faraón','Los que construían barcos'],'Los que sabían leer y escribir'),
        o('¿Por qué eran importantes los escribas?',['Porque casi nadie sabía escribir y ellos llevaban cuentas y leyes','Porque eran los más fuertes','Porque eran dioses'],'Porque casi nadie sabía escribir y ellos llevaban cuentas y leyes'),
        v('En Egipto casi todo el mundo sabía escribir.',false,'Solo unos pocos: los escribas.')]},
    {v:[o('¿Quién era Ra?',['El dios del Sol','Un faraón','Un río'],'El dios del Sol'),
        o('¿Qué dios tenía cabeza de chacal y cuidaba de los muertos?',['Anubis','Ra','Horus'],'Anubis'),
        o('Los egipcios adoraban a muchos dioses. ¿Cómo se dice?',['Eran politeístas','Eran nómadas','Eran romanos'],'Eran politeístas')]}
  ]
});
})();
