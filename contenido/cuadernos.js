// Cuadernos de repaso de la Biblioteca de Sabina.
// para: 'todas' | '6' (6-7 años) | '9' (8-10 años) | nombre de la niña
// Tipos de pregunta: opcion (q, opts, a) · vf (q, a: true/false) · ordenar (q, items en el orden correcto)
window.CUADERNOS = [
  {
    id: 'ej-estaciones', para: '6', emoji: '🍂', asignatura: 'Ejemplo · Naturaleza', titulo: 'Las estaciones del año',
    preguntas: [
      {t:'opcion', q:'¿Cuántas estaciones tiene el año?', opts:['2','4','12'], a:'4', exp:'Primavera, verano, otoño e invierno.'},
      {t:'opcion', q:'¿En qué estación se caen las hojas de muchos árboles?', opts:['Otoño','Verano','Primavera'], a:'Otoño'},
      {t:'vf', q:'En verano suele hacer calor.', a:true},
      {t:'opcion', q:'¿Cuál es la estación más fría?', opts:['Invierno','Verano','Otoño'], a:'Invierno'},
      {t:'ordenar', q:'Ordena las estaciones empezando por la primavera.', items:['Primavera','Verano','Otoño','Invierno']}
    ]
  },
  {
    id: 'ej-vertebrados', para: '9', emoji: '🐾', asignatura: 'Ejemplo · Ciencias', titulo: 'Los animales vertebrados',
    preguntas: [
      {t:'opcion', q:'¿Cuántos grupos de animales vertebrados hay?', opts:['3','5','7'], a:'5', exp:'Mamíferos, aves, peces, reptiles y anfibios.'},
      {t:'opcion', q:'¿Cuál de estos animales es un anfibio?', opts:['La rana','El lagarto','La gallina'], a:'La rana'},
      {t:'vf', q:'Las aves tienen el cuerpo cubierto de plumas.', a:true},
      {t:'vf', q:'Los peces respiran con pulmones.', a:false, exp:'Los peces respiran con branquias.'},
      {t:'opcion', q:'¿Qué cubre la piel de los reptiles?', opts:['Escamas','Plumas','Pelo'], a:'Escamas'},
      {t:'vf', q:'Las crías de los mamíferos se alimentan de la leche de su madre.', a:true}
    ]
  }
];
