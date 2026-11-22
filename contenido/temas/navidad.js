"use strict";
// Temas de la Biblioteca de Navidad (solo salen del 1 de diciembre al 7 de enero, con el paquete de Navidad).
// Cintia (grupo 6): «La Navidad». Berta (grupo 9): «Tradiciones de Navidad». En español.
window.TEMAS=window.TEMAS||[];
(function(){
const o=(q,opts,a,exp)=>({t:'opcion',q,opts,a,exp}), v=(q,a,exp)=>({t:'vf',q,a,exp}), ord=(q,items,exp)=>({t:'ordenar',q,items,exp});
const grande=e=>`<div style="font-size:64px;text-align:center;line-height:1.1">${e}</div>`;
const activo=()=>typeof NAV!=='undefined'&&paqActivo(NAV);

window.TEMAS.push({
  id:'navidad-6', para:'6', emoji:'🎄', asignatura:'Tradiciones', titulo:'La Navidad', activo,
  libro:[
    {h:'¿Qué celebramos?', html:`${grande('⭐ 🛖 ⭐')}<p>En Navidad se recuerda el <b>nacimiento de Jesús</b> en un portal de <b>Belén</b>. Por eso en muchas casas se monta un <b>Belén</b> con figuritas: María, José, el Niño, el buey y la mula.</p>`},
    {h:'Los días de fiesta', html:`${grande('📅')}<p>🌙 <b>24 de diciembre</b>: Nochebuena, cena en familia.<br>🎄 <b>25 de diciembre</b>: Navidad.<br>🍇 <b>31 de diciembre</b>: Nochevieja, el último día del año. Se comen <b>12 uvas</b>, una con cada campanada.<br>👑 <b>6 de enero</b>: día de Reyes.</p>`},
    {h:'Los Reyes Magos', html:`${grande('👑 🐪 👑 🐪 👑')}<p>Son tres: <b>Melchor, Gaspar y Baltasar</b>. Viajan en <b>camello</b> siguiendo una estrella y llevaron al Niño <b>oro, incienso y mirra</b>.</p><p>Los niños les escriben una <b>carta</b>. La noche del 5 de enero dejan sus <b>zapatos</b>, y por la mañana… ¡hay regalos!</p>`},
    {h:'Dulces de Navidad', html:`${grande('🍬 🍪 👑')}<p>El <b>turrón</b> se hace con <b>almendras y miel</b>. Los <b>polvorones</b> se deshacen en la boca. El <b>roscón de Reyes</b> es redondo, con fruta de colores, y esconde una <b>sorpresa</b>… ¡o un <b>haba</b>!</p>`},
    {h:'El invierno', html:`${grande('❄️ ⛄ 🧣')}<p>La Navidad llega en <b>invierno</b>: hace <b>frío</b> y anochece muy pronto. Si nieva, cada copo de nieve tiene <b>seis puntas</b>.</p>`},
    {h:'Música de Navidad', html:`${grande('🎶 🥁')}<p>Las canciones de Navidad se llaman <b>villancicos</b>. Se cantan con <b>zambomba</b> (hace «run, run») y <b>pandereta</b>.</p>`}
  ],
  preguntas:[
    {v:[o('¿Qué recuerda la Navidad?',['El nacimiento de Jesús','El primer día de cole','El verano'],'El nacimiento de Jesús'),
        o('¿Dónde nació Jesús, según la historia del Belén?',['En un portal','En un castillo','En un barco'],'En un portal'),
        v('En el Belén ponemos a María, José y el Niño.',true)]},
    {v:[o('¿Qué animales están junto al Niño en el Belén?',['El buey y la mula','El león y el tigre','El pato y el gallo'],'El buey y la mula'),
        v('En el Belén hay un buey y una mula.',true),
        o('¿Qué figuritas NO suelen estar en el Belén?',['Un dinosaurio','Unas ovejas','Unos pastores'],'Un dinosaurio')]},
    {v:[o('¿Qué día es Nochebuena?',['El 24 de diciembre','El 6 de enero','El 1 de enero'],'El 24 de diciembre'),
        o('¿Qué noche se cena en familia antes de Navidad?',['Nochebuena','Nochevieja','Halloween'],'Nochebuena'),
        v('Nochebuena es el 24 de diciembre.',true)]},
    {v:[o('¿Cuántas uvas se comen en Nochevieja?',['12','6','20'],'12','Una con cada campanada de las 12.'),
        v('En Nochevieja se comen 12 uvas.',true,'Una por cada campanada.'),
        o('¿Cuándo se comen las uvas?',['En Nochevieja','En verano','En el cumpleaños'],'En Nochevieja')]},
    {v:[o('¿Cuántos Reyes Magos hay?',['3','2','5'],'3'),
        o('¿Cuál de estos es un Rey Mago?',['Baltasar','Bruno','Tomás'],'Baltasar'),
        v('Los Reyes Magos se llaman Melchor, Gaspar y Baltasar.',true)]},
    {v:[o('¿En qué animal viajan los Reyes Magos?',['En camello','En elefante','En caballo de mar'],'En camello'),
        o('¿Qué siguen los Reyes Magos para llegar?',['Una estrella','Un río','Un pájaro'],'Una estrella'),
        v('Los Reyes Magos viajan en coche.',false,'Viajan en camello.')]},
    {v:[o('¿Qué dejan los niños la noche de Reyes?',['Sus zapatos','Su mochila','Su almohada'],'Sus zapatos'),
        o('¿Qué escriben los niños a los Reyes?',['Una carta','Un cuento','Una receta'],'Una carta'),
        v('El día de Reyes es el 6 de enero.',true)]},
    {v:[o('¿Con qué se hace el turrón?',['Con almendras y miel','Con tomate','Con pescado'],'Con almendras y miel'),
        o('¿Qué dulce es redondo y lleva una sorpresa?',['El roscón de Reyes','El polvorón','El helado'],'El roscón de Reyes'),
        v('Dentro del roscón puede haber un haba.',true)]},
    {v:[o('¿En qué estación llega la Navidad?',['En invierno','En verano','En primavera'],'En invierno'),
        o('¿Cuántas puntas tiene un copo de nieve?',['Seis','Tres','Diez'],'Seis'),
        v('En invierno anochece muy pronto.',true)]},
    {v:[o('¿Cómo se llaman las canciones de Navidad?',['Villancicos','Nanas','Himnos'],'Villancicos'),
        o('¿Qué instrumento hace «run, run»?',['La zambomba','La flauta','El piano'],'La zambomba'),
        v('Los villancicos son canciones de Navidad.',true)]}
  ]
});

window.TEMAS.push({
  id:'navidad-9', para:'9', emoji:'🎄', asignatura:'Tradiciones', titulo:'Tradiciones de Navidad', activo,
  libro:[
    {h:'Empieza el invierno', html:`${grande('🌍 ☀️')}<p>El <b>21 de diciembre</b> empieza el invierno. Es el día con <b>menos horas de luz</b> del año: el <b>solsticio de invierno</b>.</p><p>¿Por qué? La Tierra está <b>inclinada</b>. En invierno, nuestra mitad del planeta recibe el sol más de lado, así que los días son más cortos y hace más frío.</p>`},
    {h:'El Belén', html:`${grande('🛖 ⭐ 🐑')}<p>El Belén representa el nacimiento de Jesús. Además del portal, se ponen pastores, ovejas, casitas, un castillo y un <b>río de papel de plata</b>. Hay pueblos que hacen un <b>Belén viviente</b>, con vecinos disfrazados.</p><p>La <b>flor de Pascua</b> parece roja, pero lo rojo son <b>hojas</b>: la flor de verdad es el puntito amarillo del centro.</p>`},
    {h:'Días especiales', html:`${grande('🎟️ 🤡 🍇')}<p>🎟️ <b>22 de diciembre</b>: sorteo de la <b>Lotería de Navidad</b>. Los niños del colegio de <b>San Ildefonso</b> cantan los números.<br>🌙 <b>24</b>: Nochebuena. 🎄 <b>25</b>: Navidad.<br>🤡 <b>28</b>: los <b>Santos Inocentes</b>, día de bromas (como pegar monigotes de papel en la espalda).<br>🍇 <b>31</b>: Nochevieja. Se comen <b>12 uvas</b>, una por cada <b>campanada</b> de medianoche, para tener suerte los 12 meses.</p>`},
    {h:'Los Reyes Magos', html:`${grande('👑 🐪 ⭐')}<p><b>Melchor, Gaspar y Baltasar</b> siguieron una estrella y llevaron al Niño <b>oro, incienso y mirra</b>.</p><p>La tarde del <b>5 de enero</b> hay <b>cabalgatas</b>: los Reyes recorren las calles y lanzan caramelos. Por la noche los niños dejan sus zapatos, algo de comer para los Reyes y agua para los camellos. El <b>6 de enero</b> aparecen los regalos.</p>`},
    {h:'Dulces con historia', html:`${grande('🍬 👑')}<p>El turrón más famoso se hace en <b>Jijona (Alicante)</b> con <b>almendra, miel</b>, azúcar y clara de huevo. El <b>roscón de Reyes</b> esconde una <b>sorpresa</b> y un <b>haba</b>: dice la tradición que quien encuentra el haba paga el roscón del año siguiente.</p>`},
    {h:'Música y regalos en otros sitios', html:`${grande('🎶 🎅')}<p>Los <b>villancicos</b> se cantan con zambomba y pandereta. En España, muchos niños reciben los regalos de los <b>Reyes Magos</b>; en otros países los trae <b>Papá Noel</b> la noche del 24.</p>`}
  ],
  preguntas:[
    {v:[o('¿Qué pasa el 21 de diciembre?',['Empieza el invierno','Es Nochevieja','Llegan los Reyes','Empieza el verano'],'Empieza el invierno'),
        o('¿Cómo se llama el día con menos horas de luz del año?',['Solsticio de invierno','Equinoccio de primavera','Día de Reyes'],'Solsticio de invierno'),
        v('El 21 de diciembre es el día con más horas de luz del año.',false,'Es el que tiene menos.')]},
    {v:[o('¿Por qué en invierno los días son más cortos?',['Porque la Tierra está inclinada y nos llega el sol más de lado','Porque el sol se apaga un poco','Porque la Luna tapa el sol','Porque la Tierra se aleja mucho'],'Porque la Tierra está inclinada y nos llega el sol más de lado'),
        v('Los días son más cortos en invierno porque la Tierra está inclinada.',true),
        o('Si la Tierra no estuviera inclinada, ¿qué pasaría con las estaciones?',['Casi no habría estaciones','Habría el doble de inviernos','Siempre sería de noche'],'Casi no habría estaciones','La inclinación es lo que hace las estaciones.')]},
    {v:[o('¿De qué suele hacerse el río del Belén?',['De papel de plata','De cristal','De chocolate'],'De papel de plata'),
        o('¿Qué es un Belén viviente?',['Un Belén con personas disfrazadas','Un Belén de plastilina','Un Belén en un libro'],'Un Belén con personas disfrazadas'),
        v('En el Belén se pone un río de papel de plata.',true)]},
    {v:[o('En la flor de Pascua, ¿qué es lo rojo?',['Hojas','Pétalos','Frutos'],'Hojas','La flor es el puntito amarillo.'),
        v('Lo rojo de la flor de Pascua son pétalos.',false,'Son hojas.'),
        o('¿Dónde está la flor de verdad en la flor de Pascua?',['En el puntito amarillo del centro','En las hojas rojas','En la raíz'],'En el puntito amarillo del centro')]},
    {v:[o('¿Qué día es el sorteo de la Lotería de Navidad?',['El 22 de diciembre','El 31 de diciembre','El 6 de enero'],'El 22 de diciembre'),
        o('¿Quién canta los números de la Lotería de Navidad?',['Los niños de San Ildefonso','Los Reyes Magos','Los pastores'],'Los niños de San Ildefonso'),
        v('La Lotería de Navidad es el 22 de diciembre.',true)]},
    {v:[o('¿Qué se hace el día de los Santos Inocentes?',['Gastar bromas','Comer uvas','Dejar los zapatos'],'Gastar bromas'),
        o('¿Qué día son los Santos Inocentes?',['El 28 de diciembre','El 21 de diciembre','El 5 de enero'],'El 28 de diciembre'),
        v('El 28 de diciembre se pegan monigotes de papel en la espalda.',true)]},
    {v:[o('¿Por qué se comen 12 uvas en Nochevieja?',['Una por cada campanada, para tener suerte los 12 meses','Porque las uvas son el postre','Porque hay 12 Reyes','Porque el año tiene 12 semanas'],'Una por cada campanada, para tener suerte los 12 meses'),
        v('En Nochevieja se come una uva con cada campanada.',true),
        o('¿Cuántas campanadas suenan a medianoche en Nochevieja?',['12','10','24'],'12')]},
    {v:[o('¿Qué llevaron los Reyes Magos al Niño?',['Oro, incienso y mirra','Juguetes y caramelos','Pan, leche y miel'],'Oro, incienso y mirra'),
        o('¿Qué siguieron los Reyes Magos para llegar a Belén?',['Una estrella','Un mapa','Un río'],'Una estrella'),
        v('Los Reyes Magos llevaron oro, incienso y mirra.',true)]},
    {v:[ord('Ordena estas fiestas de la primera a la última.',['Lotería de Navidad (22 dic)','Nochebuena (24 dic)','Santos Inocentes (28 dic)','Nochevieja (31 dic)','Día de Reyes (6 ene)']),
        o('¿Qué pasa la tarde del 5 de enero?',['Las cabalgatas de Reyes','La Lotería','Las uvas'],'Las cabalgatas de Reyes'),
        o('¿Qué dejan los niños la noche de Reyes para los camellos?',['Agua','Zapatos','Turrón'],'Agua')]},
    {v:[o('¿Dónde se hace el turrón más famoso?',['En Jijona (Alicante)','En Sevilla','En Galicia'],'En Jijona (Alicante)'),
        o('Según la tradición, ¿qué le pasa a quien encuentra el haba del roscón?',['Paga el roscón del año siguiente','Gana un premio','Se convierte en rey'],'Paga el roscón del año siguiente'),
        o('¿Con qué se hace el turrón de Jijona?',['Almendra, miel, azúcar y clara de huevo','Harina y chocolate','Arroz y leche'],'Almendra, miel, azúcar y clara de huevo')]}
  ]
});
})();
