"use strict";
/* =========================================================
   DATOS
   ========================================================= */
const COLORS = {
  r:{n:'rojo',c:'#e4574f'}, b:{n:'azul',c:'#4a8fdc'}, y:{n:'amarillo',c:'#f4c430'},
  g:{n:'verde',c:'#55b05a'}, w:{n:'blanco',c:'#f7f2e8'}, p:{n:'lila',c:'#a678d6'}
};
const COLOR_KEYS = Object.keys(COLORS);

const NPCS = {
  rosa:{e:'🐑',n:'Rosa la oveja', hi:['¡Mi lana es la más suave del pueblo!','¿Sabes que con una oveja se pueden tejer varios jerséis al año?']},
  tomas:{e:'🦔',n:'Tomás el erizo', hi:['Tengo pinchos, pero soy muy cariñoso.','Me encanta ordenar mis bellotas por colores.']},
  coco:{e:'🐔',n:'Coco la gallina', hi:['¡Me encantan los acertijos de colores!','Pásate por mi tienda, tengo cosas bonitas para tu jardín.']},
  bruno:{e:'🐻',n:'Bruno el oso', hi:['Este invierno voy a dormir calentito.','¿Has probado la miel con pan? ¡Mmm!']},
  lia:{e:'🦦',n:'Lía la nutria', hi:['¡Me encanta nadar en el río!','Al otro lado del río pasan cosas misteriosas…']},
  nube:{e:'🐰',n:'Nube la coneja', hi:['Salto, salto y vuelvo a saltar: ¡como un bucle!','Mis zanahorias crecen en filas perfectas.']},
  hilo:{e:'🤖',n:'Hilo el robot', hi:['Bip bip. Soy muy rápido… pero compruébame, ¿eh?','Algún día cuidaré un huerto al otro lado del río.']},
  alcalde:{e:'🧔',n:'Papá, el alcalde', hi:['¡Estoy muy orgulloso de lo que estás haciendo!','Mira tu buzón de vez en cuando: a veces te escribo.','Un buen tejedor no tiene prisa: mira, piensa y prueba.']}
};

const STORIES = {
  punto:{e:'🧶',t:'Tejer es seguir una receta',x:'Tejer punto es seguir una receta: «dos del derecho, dos del revés, y repetir». Una lista de pasos en orden… ¡eso es justo un programa!'},
  gusano:{e:'🐛',t:'Los gusanos de seda',x:'La seda la fabrican unas orugas llamadas gusanos de seda. Cada capullo está hecho de un solo hilo larguísimo: ¡de cientos de metros!'},
  quipu:{e:'🪢',t:'Los quipus de los incas',x:'Los incas no escribían con letras, pero guardaban números con cuerdas y nudos llamados quipus. Cada nudo y su lugar significaban algo.'},
  jacquard:{e:'🏭',t:'El telar de Jacquard',x:'Hace más de 200 años, en Lyon (Francia), Joseph-Marie Jacquard inventó un telar que leía tarjetas con agujeros. Con agujero, el hilo sube; sin agujero, se queda abajo. ¡Una de las primeras máquinas programables!'},
  fairisle:{e:'🧥',t:'Los jerséis de Fair Isle',x:'En Fair Isle, una islita de Escocia, tejen jerséis con bandas de dibujos que se repiten. Normalmente usan solo dos colores en cada fila.'},
  kente:{e:'🌍',t:'La tela kente de Ghana',x:'En Ghana tejen la tela kente en tiras estrechas que luego se cosen juntas. Cada color tiene su significado.'},
  sashiko:{e:'🪡',t:'El sashiko de Japón',x:'En Japón, el sashiko son puntadas pequeñas para reforzar y arreglar la ropa. ¡Forman dibujos geométricos preciosos!'},
  seda:{e:'🏛️',t:'La Lonja de la Seda',x:'En Valencia está la Lonja de la Seda, un edificio de hace más de 500 años donde se compraba y vendía seda. ¡Es Patrimonio de la Humanidad!'},
  ada:{e:'👩‍🔬',t:'Ada Lovelace',x:'Ada Lovelace vivió en Inglaterra hace casi 200 años. Escribió programas para una máquina que aún no se había construido y dijo que esa máquina «tejería» números como el telar teje flores. ¡Fue la primera programadora!'},
  binario:{e:'💡',t:'Agujero o no agujero',x:'Las tarjetas de Jacquard solo tenían dos opciones: agujero o no agujero. Los ordenadores de hoy también piensan con dos opciones: 1 y 0.'},
  hilo1:{e:'🤖',t:'Los ayudantes también fallan',x:'Los ayudantes con inteligencia artificial, como Hilo, son rapidísimos, pero a veces se equivocan. Por eso hay que comprobar lo que dicen.'},
  hilo2:{e:'✅',t:'Comprobar es pensar',x:'Esta vez Hilo acertó. Comprobar no es desconfiar siempre: es mirar con atención antes de decidir.'}
};

const LEVELS = {1:'Secuencias',2:'Repetir',3:'Motivos'};
const TYPE_NAMES = {cab:'Cabezal',cua:'Cuadro mágico',seq:'Secuencia',rep:'Repetir',mot:'Motivos',reglas:'¿Qué sigue?',hilo:'Revisa a Hilo',custom:'Reto del alcalde'};

const ENC = [
  {id:'e1',lvl:1,type:'seq',npc:'rosa',title:'Bufanda de rayas',story:'punto',
   ask:'¡Hace fresquito! ¿Me tejes una bufanda con estos colores, en este orden?',
   v6:{w:6,t:'rwrwrw'}, v9:{w:8,t:'rrbwwbrr'}},
  {id:'e2',lvl:1,type:'seq',npc:'tomas',title:'Cinta para el pelo',story:'gusano',
   ask:'Quiero una cinta de colores para no pincharme el flequillo. ¿Me ayudas?',
   v6:{w:6,t:'yyggyy'}, v9:{w:8,t:'ygbppbgy'}},
  {id:'e3',lvl:1,type:'reglas',npc:'coco',title:'¿Qué punto sigue?',story:'quipu',
   ask:'¡Se me escaparon unos puntos! Descubre la regla del dibujo y complétalo.',
   v6:{w:6,t:'ryyryyryyryy',miss:3}, v9:{w:8,t:'rbbyrbbyrbbyrbby',miss:5}},
  {id:'e4',lvl:1,type:'seq',npc:'rosa',title:'Mantel de la merienda',story:'jacquard',
   ask:'Voy a invitar a todo el pueblo a merendar. ¡Necesito un mantel de cuadros!',
   v6:{w:4,t:'bwbwwbwb'}, v9:{w:8,t:'bwbwbwbwwbwbwbwb'}},
  {id:'e5',lvl:2,type:'rep',npc:'bruno',title:'Manta para hibernar',story:'fairisle',
   ask:'Voy a dormir todo el invierno. ¿Me tejes una manta grande? ¡Usa la tarjeta Repetir!',
   v6:{w:6,sol:{main:['r','w'],rep:6}}, v9:{w:8,sol:{main:['r','r','w'],rep:8}}},
  {id:'e6',lvl:2,type:'rep',npc:'lia',title:'Calcetines de colores',story:'kente',
   ask:'¡Mis patas se enfrían al salir del río! Quiero unos calcetines alegres.',
   v6:{w:6,sol:{main:['b','y','g'],rep:4}}, v9:{w:8,sol:{main:['y','p','y','b'],rep:6}}},
  {id:'e7',lvl:2,type:'reglas',npc:'coco',title:'El dibujo misterioso',story:'sashiko',
   ask:'Este dibujo es más largo. Busca el trocito que se repite y completa lo que falta.',
   v6:{w:6,t:'yywyywyywyywyywyyw',miss:3}, v9:{w:8,t:'rbywrbywrbywrbywrbywrbyw',miss:6}},
  {id:'e8',lvl:2,type:'rep',npc:'rosa',title:'Jersey de bandas',story:'seda',
   ask:'Quiero un jersey con bandas, como los de Fair Isle. ¡Con pocas tarjetas!',
   v6:{w:6,sol:{main:['w','r','r'],rep:4}}, v9:{w:8,sol:{main:['w','r','r','r','w','b','b','b'],rep:3}}},
  {id:'e9',lvl:3,type:'mot',npc:'nube',title:'Tapiz de filas',story:'ada',
   ask:'Mi tapiz tiene dos tipos de fila. Crea el motivo A y el motivo B y úsalos en el programa.',
   v6:{w:4,sol:{A:['p','w','w','p'],B:['g','g','g','g'],main:['A','A','B','A','B','B'],rep:1}},
   v9:{w:6,sol:{A:['r','r','w','w','r','r'],B:['w','w','r','r','w','w'],main:['A','B','B','A'],rep:2}}},
  {id:'e10',lvl:3,type:'mot',npc:'lia',title:'Toalla de playa',story:'binario',
   ask:'¡Me voy a la playa! Mi toalla tiene filas azules y filas de sol.',
   v6:{w:4,sol:{A:['b','b','b','b'],B:['w','y','y','w'],main:['A','B','B','A','B'],rep:1}},
   v9:{w:6,sol:{A:['b','b','w','w','b','b'],B:['y','y','y','y','y','y'],main:['A','A','B','A','B','B','A'],rep:1}}},
  {id:'e11',lvl:3,type:'hilo',npc:'hilo',title:'Hilo quiere ayudar',story:'hilo1',
   ask:'Bip bip. ¡Yo he hecho el programa de este pedido! ¿Lo revisas antes de tejer?',
   v6:{w:6,sol:{main:['r','w'],rep:6},hilo:{main:['r','w'],rep:5}},
   v9:{w:6,sol:{A:['g','g','w','w','g','g'],B:['p','p','p','p','p','p'],main:['A','B','A'],rep:1},
       hilo:{A:['g','g','w','w','g','g'],B:['p','p','p','p','p','p'],main:['A','B','B'],rep:1}}},
  {id:'e12',lvl:3,type:'hilo',npc:'hilo',title:'Hilo lo intenta otra vez',story:'hilo2',
   ask:'¡He practicado mucho! Revisa mi nuevo programa, por favor.',
   v6:{w:4,sol:{main:['g','g','g','w'],rep:3},hilo:{main:['g','g','g','w'],rep:3}},
   v9:{w:6,sol:{A:['b','w','b','w','b','w'],B:['w','b','w','b','w','b'],main:['A','B'],rep:3},
       hilo:{A:['b','w','b','w','b','w'],B:['w','b','w','b','w','b'],main:['A','B'],rep:3}}}
];

const PLANTS = {
  1:[['🌷','tulipán'],['🌼','margarita'],['🌻','girasol'],['🌹','rosa']],
  2:[['🌺','hibisco'],['🪴','planta en maceta'],['🌸','flor de cerezo'],['🍀','trébol']],
  3:[['🌳','árbol'],['🌲','pino'],['🌴','palmera'],['🌵','cactus']]
};
const SPECIAL = {
  L1:{e:'🌳',f:'🍊',n:'Naranjo de nivel 1'},
  L2:{e:'🌳',f:'🍋',n:'Limonero de nivel 2'},
  L3:{e:'🌳',f:'🍒',n:'Cerezo de nivel 3'},
  M:{e:'🌳',f:'🌈',n:'Árbol arcoíris de maestra'}
};
const SHOP = [
  {k:'seta',e:'🍄',n:'Setas',p:10,r:0},{k:'farol',e:'🏮',n:'Farolillo',p:15,r:0},{k:'banco',e:'🪑',n:'Banco',p:20,r:0},
  {k:'pajaro',e:'🐦',n:'Caseta de pájaros',p:25,r:0},{k:'colmena',e:'🐝',n:'Colmena',p:30,r:1},{k:'cesta',e:'🧺',n:'Cesta de picnic',p:35,r:2},
  {k:'campanilla',e:'🎐',n:'Campanilla de viento',p:40,r:3},{k:'fuente',e:'⛲',n:'Fuente',p:60,r:3},{k:'caseta',e:'🛖',n:'Cabaña',p:90,r:4},
  {k:'tienda',e:'⛺',n:'Tienda de campaña',p:130,r:5},{k:'tiovivo',e:'🎠',n:'Tiovivo',p:180,r:6},{k:'noria',e:'🎡',n:'Noria',p:260,r:8},
  {k:'cam_piedra',e:'🪨',n:'Camino de piedras',p:12,r:0,camino:1,lote:6},{k:'cam_baldosa',e:'🟧',n:'Baldosas',p:15,r:0,camino:1,lote:6} // caminos: van debajo de todo (jardin-suelo.js)
];
// catálogo de objetos para jardín: key -> {e, f?, n}
function itemInfo(k){
  if (k.startsWith('gw:')) return itemInfo(k.slice(3));
  if (k.startsWith('fu_')){ const f=FURN.find(f=>'fu_'+f.k===k); return {e:f?(f.e||'🛋️'):'❓',n:f?f.n:'?'}; }
  if (SPECIAL[k]) return SPECIAL[k];
  for (const l in PLANTS) for (const [e,n] of PLANTS[l]) if (k==='pl_'+e) return {e,n};
  const s = SHOP.find(s=>'sh_'+s.k===k); if (s) return {e:s.e,n:s.n};
  return {e:'❓',n:'?'};
}
