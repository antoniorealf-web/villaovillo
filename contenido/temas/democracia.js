// Tema de la Biblioteca para Berta (grupo 9): Eleccions i democràcia. EN VALENCIÀ (lang:'ca').
// Formato de tema: ver contenido/temas/figuras.js.
window.TEMAS=window.TEMAS||[];
(function(){
const o=(q,opts,a,exp)=>({t:'opcion',q,opts,a,exp}), v=(q,a,exp)=>({t:'vf',q,a,exp}), ord=(q,items,exp)=>({t:'ordenar',q,items,exp});
window.TEMAS.push({
  id:'socials-democracia', para:'9', lang:'ca', emoji:'🗳️', asignatura:'Ciències socials', titulo:'Eleccions i democràcia',
  libro:[
    {h:'Què és la democràcia?', html:`<p>La paraula <b>democràcia</b> ve del grec: <i>demos</i> vol dir «poble» i <i>kratos</i> vol dir «poder». Democràcia és <b>el govern del poble</b>.</p>
      <p>En una democràcia, les persones decideixen qui les governa <b>votant</b> en unes <b>eleccions</b>. Espanya és un país democràtic.</p>`},
    {h:'El vot', html:`<p>Votar és triar entre diverses opcions. A Espanya pot votar tota persona espanyola <b>major de 18 anys</b>.</p>
      <p>El vot ha de ser:<br>• <b>Lliure</b>: cadascú tria el que vol.<br>• <b>Secret</b>: ningú sap què has votat, així ningú et pot pressionar.<br>• <b>Igual</b>: cada persona té <b>un sol vot</b>, i tots valen el mateix.</p>`},
    {h:'El dia de les eleccions', html:`<p>🏫 Es vota en el <b>col·legi electoral</b> (moltes vegades, una escola).<br>📄 Agafes la <b>papereta</b> del partit que vols, la poses dins d'un <b>sobre</b> i la deixes en l'<b>urna</b>, una caixa transparent.<br>👥 La <b>mesa electoral</b> (persones triades per sorteig) vigila que tot es faça bé.</p>
      <p>Abans hi ha la <b>campanya electoral</b>: els <b>partits polítics</b> expliquen les seues propostes. El dia abans de votar és la <b>jornada de reflexió</b>: no es pot fer campanya.</p>
      <p>Quan s'acaba de votar, es compten els vots: això es diu <b>escrutini</b>.</p>`},
    {h:'Tipus d\'eleccions', html:`<p>Normalment hi ha eleccions <b>cada 4 anys</b>.</p>
      <p>🏛️ <b>Generals</b>: triem les Corts Generals (el <b>Congrés dels Diputats</b> i el <b>Senat</b>) de tot Espanya.<br>🦇 <b>Autonòmiques</b>: triem les <b>Corts Valencianes</b>, el parlament de la Comunitat Valenciana.<br>🏘️ <b>Municipals</b>: triem l'<b>ajuntament</b> del nostre poble o ciutat, amb l'alcalde o l'alcaldessa.<br>🇪🇺 <b>Europees</b>: triem el Parlament Europeu.</p>`},
    {h:'Qui mana i com', html:`<p>El <b>Congrés dels Diputats</b> té <b>350 diputats</b>. Els diputats trien el <b>president o la presidenta del Govern</b>.</p>
      <p>La llei més important d'Espanya és la <b>Constitució</b>, de <b>1978</b>. Diu quins drets i deures tenim tots.</p>
      <p>Espanya és una <b>monarquia parlamentària</b>: el <b>rei</b> és el cap de l'Estat, però no governa ni és triat en eleccions.</p>`},
    {h:'La separació de poders', html:`<p>Perquè ningú tinga massa poder, el poder es reparteix en tres:</p>
      <p>📜 <b>Poder legislatiu</b>: fa les lleis. Són les Corts (el parlament).<br>🏢 <b>Poder executiu</b>: governa i fa complir les lleis. És el Govern.<br>⚖️ <b>Poder judicial</b>: jutja si algú no compleix les lleis. Són els jutges.</p>`},
    {h:'Per a recordar', html:`<p>• Democràcia = govern del poble.<br>• Es vota a partir dels 18 anys. Vot lliure, secret i igual: una persona, un vot.<br>• Papereta → sobre → urna. Escrutini = comptar els vots.<br>• Eleccions cada 4 anys: generals, autonòmiques, municipals i europees.<br>• Constitució de 1978. Congrés: 350 diputats.<br>• Tres poders: legislatiu (lleis), executiu (governa), judicial (jutja).</p>`}
  ],
  preguntas:[
    {v:[o('Què vol dir «democràcia»?',['Govern del poble','Govern del rei','Govern dels jutges'],'Govern del poble','Demos = poble, kratos = poder.'),
        o('En una democràcia, qui decideix qui governa?',['El poble, votant','El més ric','El rei, sempre'],'El poble, votant'),
        v('En una democràcia, les persones trien els seus governants votant.',true)]},
    {v:[o('A partir de quina edat es pot votar a Espanya?',['16 anys','18 anys','21 anys','25 anys'],'18 anys'),
        v('A Espanya poden votar els xiquets i xiquetes de 9 anys.',false,'Cal tindre 18 anys o més.'),
        o('La teua germana té 17 anys. Pot votar en les eleccions?',['Sí','No, encara no té 18 anys','Només si ho diu el rei'],'No, encara no té 18 anys')]},
    {v:[o('Per què el vot és secret?',['Perquè ningú et puga pressionar ni saber què votes','Perquè està prohibit votar','Perquè les paperetes són invisibles'],'Perquè ningú et puga pressionar ni saber què votes'),
        v('Quan votes, has de dir a tothom quin partit has triat.',false,'El vot és secret: no cal dir-ho a ningú.'),
        o('Què vol dir que el vot és «secret»?',['Que ningú sap què has votat','Que es vota de nit','Que només voten uns quants'],'Que ningú sap què has votat')]},
    {v:[o('Quants vots té cada persona en unes eleccions?',['Un','Dos','Tants com vulga'],'Un','Una persona, un vot: tots els vots valen igual.'),
        v('El vot d\'una persona rica val més que el d\'una persona pobra.',false,'El vot és igual: tots valen el mateix.'),
        o('Per què diem que el vot és «igual»?',['Perquè cada persona té un vot i tots valen el mateix','Perquè tots voten el mateix partit','Perquè les urnes són iguals'],'Perquè cada persona té un vot i tots valen el mateix')]},
    {v:[o('On es deixa el sobre amb la papereta?',['En l\'urna','En la bústia de casa','En la paperera'],'En l\'urna'),
        ord('Ordena el que fas per a votar.',['Agafes la papereta','La poses dins del sobre','Deixes el sobre en l\'urna']),
        o('Com es diu el lloc on anem a votar?',['Col·legi electoral','Ajuntament','Congrés'],'Col·legi electoral','Moltes vegades és una escola.')]},
    {v:[o('Cada quants anys hi ha eleccions, normalment?',['Cada any','Cada 4 anys','Cada 10 anys'],'Cada 4 anys'),
        o('Com es diu el temps abans de les eleccions en què els partits expliquen les seues propostes?',['Campanya electoral','Escrutini','Jornada de reflexió'],'Campanya electoral'),
        o('Com es diu comptar els vots després de votar?',['Escrutini','Campanya','Sorteig'],'Escrutini')]},
    {v:[o('En les eleccions municipals, què triem?',['L\'ajuntament del poble o ciutat','El Congrés dels Diputats','El Parlament Europeu'],'L\'ajuntament del poble o ciutat'),
        o('En les eleccions autonòmiques de la Comunitat Valenciana, què triem?',['Les Corts Valencianes','L\'ajuntament','El rei'],'Les Corts Valencianes'),
        o('En les eleccions generals, què triem?',['El Congrés i el Senat','L\'alcalde','Les Corts Valencianes'],'El Congrés i el Senat')]},
    {v:[o('Quants diputats té el Congrés dels Diputats?',['50','150','350','1.000'],'350'),
        o('Qui tria el president o la presidenta del Govern?',['Els diputats del Congrés','El rei tot sol','Els alcaldes'],'Els diputats del Congrés'),
        v('A Espanya, el rei és triat en unes eleccions.',false,'Espanya és una monarquia parlamentària: el rei no es tria votant i no governa.')]},
    {v:[o('Quina és la llei més important d\'Espanya?',['La Constitució','El reglament de l\'escola','El diari'],'La Constitució'),
        o('De quin any és la Constitució espanyola?',['1492','1978','2020'],'1978'),
        v('La Constitució diu quins drets i deures tenim.',true)]},
    {v:[o('Qui fa les lleis?',['El poder legislatiu (les Corts)','El poder judicial (els jutges)','Els partits a la campanya'],'El poder legislatiu (les Corts)'),
        o('Qui jutja si algú no compleix les lleis?',['Els jutges','El Govern','Els votants'],'Els jutges','És el poder judicial.'),
        o('Per què es reparteix el poder en tres parts?',['Perquè ningú tinga massa poder','Perquè hi ha tres reis','Perquè així es vota tres vegades'],'Perquè ningú tinga massa poder')]}
  ]
});
})();
