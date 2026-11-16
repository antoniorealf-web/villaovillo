"use strict";
/* =========================================================
   PAQUETE: LA GACETA DE VILLAOVILLO (tablón)
   ========================================================= */
/* Noticias del pueblo, chistes, adivinanzas y datos curiosos para el tablón.
   Sale una edición nueva cada lunes y cada jueves (la 0 es la del lunes 16/11/2026).
   Cada edición: 2 noticias, 1 dato curioso, 1 chiste, 1 adivinanza y 1 cartel del día.
   La solución de la adivinanza se puede ver a partir del día siguiente a la edición.
   Para ampliar: añade elementos al final de cada lista (no cambies el orden de los que ya hay).
   El modo alcalde dice hasta qué día hay carteles nuevos; después se repiten desde el principio. */
(()=>{
const BASE='2026-11-16';

const NOTICIAS=[
 ['🐑','¡Récord de lana!','Rosa ha tejido una bufanda tan larga que da tres vueltas a la fuente de la plaza. Ahora busca a alguien con el cuello muy, muy largo.'],
 ['🦔','Se busca bellota dorada','Tomás ha perdido una bellota dorada cerca del puente. Si la encuentras, habrá recompensa: un abrazo sin pinchos.'],
 ['🐔','Coco madruga','Coco dice que madrugar es su superpoder. «Kikirikí… digo, ¡buenos días!», se le escapó ayer al abrir la tienda.'],
 ['🐻','El secreto de Bruno','Bruno ha contado por fin el secreto de su pan: «Medir bien, contar bien y esperar sin abrir el horno».'],
 ['🦦','El pez Chispa','Lía ha vuelto a ver al pez que salta haciendo piruetas. Dice que esta vez dio tres vueltas seguidas en el aire.'],
 ['🐰','Nube y los bucles','Nube ha saltado cien veces sin parar. «Es fácil», explica: «salto y repito, salto y repito».'],
 ['🤖','Hilo se equivoca','Hilo quiso tejer una bufanda de rayas y le salió de lunares. «Tenía un fallo en el programa», reconoce. ¿Le ayudas a revisarlo?'],
 ['🦉','Sabina recomienda','Leer un ratito antes de dormir ayuda a recordar lo aprendido. ¡Palabra de lechuza!'],
 ['🎨','Concurso de telas','El ayuntamiento busca la tela más bonita del pueblo. Cuelga tus diseños en el tendedero del taller.'],
 ['🎵','Música en la plaza','Tomás tocará la flauta junto a la fuente al caer la tarde. Se aceptan aplausos y bailes.'],
 ['🐞','Visitante en el tablón','Una mariquita se ha paseado por este tablón. Ha contado siete puntos en su espalda… y ninguno en la de Tomás.'],
 ['🧺','Pícnic junto al río','Lía organiza un pícnic en la orilla. Cada vecino llevará una cosa. Bruno, por supuesto, llevará pan.'],
 ['🌙','Ruidos en la noche','Anoche se oyó un «uh, uh» en la biblioteca. Sabina asegura que no era un fantasma: estaba leyendo en voz alta.'],
 ['🧦','Calcetín perdido','Ha aparecido un calcetín de rayas en la fuente. Si es tuyo, pásate por el ayuntamiento. Huele un poco a pez.'],
 ['🐑','Rosa no se duerme','Rosa no conseguía dormirse y se puso a contar ovejas. Al llegar a una se dio cuenta de que era ella misma.'],
 ['🐔','Coco pone orden','Coco ha ordenado su tienda por colores: rojo, naranja, amarillo, verde y azul. «Como el arcoíris», dice orgullosa.'],
 ['🐻','Bruno reparte','Bruno tenía 12 magdalenas para 4 vecinos. A cada uno le dio 3 y no sobró ninguna. «Repartir bien también es cocinar», dice.'],
 ['🦦','Récord de piedras','Lía hizo rebotar una piedra en el río seis veces. Nube dice que ella lo hizo siete, pero nadie la vio.'],
 ['🤖','Hilo aprende chistes','Hilo ha memorizado cien chistes, pero se ríe antes de contarlos. Estamos trabajando en ello.'],
 ['🦔','Tomás en el huerto','Tomás ha plantado zanahorias en fila: una, dos, tres… hasta veinte. Dice que crecerán antes de que acabe de contarlas.'],
 ['📮','Cartas en el buzón','El buzón del alcalde está lleno de cartas bonitas. ¿Has mirado si hay alguna para ti?'],
 ['🐰','Las gafas de Nube','Nube buscó sus gafas por todo el pueblo. Al final las encontró: las llevaba puestas en la cabeza.'],
 ['🌳','Árbol nuevo','Ha brotado un árbol nuevo junto al camino. Dicen que cada encargo del telar hace crecer el pueblo un poquito.'],
 ['🦉','Libros en orden','Sabina ha ordenado los libros por orden alfabético. La A está arriba del todo y la Z, junto a la puerta.'],
 ['🐑','Un jersey para Hilo','Rosa ha tejido un jersey a Hilo para que no se oxide con el frío. Le queda un poco grande, pero dice que le encanta.'],
 ['🎈','Globo a la deriva','Un globo rojo voló por encima del pueblo. Coco cree que iba hacia el mar. Lía dice que hacia el bosque. ¿Quién tendrá razón?'],
 ['🐻','Panes con forma','Bruno ha probado a hacer panes con forma de estrella. Deberían tener cinco puntas; el de ayer salió con seis, «pero también vale».'],
 ['🦔','¿Dónde está Tomás?','Tomás ha juntado un montón de hojas secas para dormir calentito. Ahora el problema es encontrar a Tomás dentro del montón.'],
 ['🤖','Hilo hace la cama','Hilo ha escrito un programa para hacer la cama: estirar, doblar, repetir. Funciona… pero también ha doblado a Nube.'],
 ['🐰','Carrera de sacos','El sábado hay carrera de sacos en el camino del río. Nube es la favorita, aunque los demás dicen que saltar tanto es trampa.'],
 ['🦦','La presa de Lía','Lía está construyendo una presa con ramitas. Necesita 30 y lleva 18. Dice que le faltan 12. ¿Lo ha contado bien?'],
 ['🐔','Coco canta','Coco se ha apuntado a clases de canto. Su profesor dice que tiene mucho ritmo… de corral.'],
];
const DATOS=[
 ['🐙','Los pulpos tienen tres corazones y la sangre azul.'],
 ['🐝','Las abejas bailan para contarse dónde hay flores. Es su forma de mandar mensajes.'],
 ['🦦','Las nutrias marinas se dan la mano al dormir para que la corriente no las separe.'],
 ['🦔','Un erizo tiene unas seis mil púas. ¡Imagina peinarlas!'],
 ['🐑','Las ovejas reconocen las caras de otras ovejas y las recuerdan durante años.'],
 ['🐔','Las gallinas son parientes de los dinosaurios: todas las aves lo son.'],
 ['🐻‍❄️','Debajo de su pelo blanco, el oso polar tiene la piel negra.'],
 ['🦉','Las lechuzas no pueden mover los ojos, así que giran muchísimo la cabeza para mirar a los lados.'],
 ['🐰','Los conejos ven casi todo lo que hay a su alrededor sin girar la cabeza.'],
 ['🌙','La Luna se aleja de la Tierra unos cuatro centímetros cada año.'],
 ['🐋','El corazón de la ballena azul es tan grande como un coche pequeño.'],
 ['⚡','Un rayo está más caliente que la superficie del Sol.'],
 ['⭐','Las estrellas de mar no tienen cerebro, ¡y aun así saben moverse!'],
 ['🦴','Al nacer tenemos unos 300 huesos. De mayores tenemos 206, porque algunos se unen.'],
 ['🦋','Las mariposas notan el sabor de las cosas con las patas.'],
 ['🪐','En Venus un día dura más que un año: gira sobre sí mismo muy despacio.'],
 ['🧶','Un jersey puede llevar más de cincuenta mil puntos. ¡Menos mal que existen los bucles!'],
 ['🐌','Los caracoles tienen miles de dientes diminutos en la lengua.'],
];
const CHISTES=[
 ['¿Qué le dice un pez a otro pez?','¡Nada!'],
 ['¿Qué le dice el 0 al 8?','¡Qué cinturón tan bonito!'],
 ['¿Por qué está triste el libro de mates?','Porque tiene muchos problemas.'],
 ['¿Qué hace una abeja en el gimnasio?','¡Zum-ba!'],
 ['¿Qué le dice una iguana a su hermana gemela?','Somos iguanitas.'],
 ['¿Cuál es el animal que es dos veces animal?','El gato, porque es gato y araña.'],
 ['¿Qué le dice una impresora a otra?','¿Esa hoja es tuya o es impresión mía?'],
 ['¿Cómo se dice pañuelo en japonés?','Saka-moko.'],
 ['¿Qué le dice un semáforo a otro?','No me mires, que me estoy cambiando.'],
 ['¿Por qué las focas miran siempre hacia arriba?','¡Porque ahí están los focos!'],
 ['Mamá, mamá, en el cole me llaman despistado.','Niño, tú no vives aquí.'],
 ['¿Qué le dice una uva verde a una morada?','¡Respira, respira!'],
 ['¿Qué le dice el 1 al 10?','Para ser como yo, tienes que ser sincero.'],
 ['¿Por qué Hilo el robot nunca tiene miedo?','Porque tiene nervios de acero.'],
 ['¿Qué le dijo la Luna al Sol?','Tan grande y no te dejan salir de noche.'],
 ['¿Qué le dice una pared a otra pared?','Nos vemos en la esquina.'],
 ['¿Cuál es el colmo de un jardinero?','Que su hija se llame Rosa y lo deje plantado.'],
];
const ADIVINANZAS=[
 ['Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera.','La pera.'],
 ['Oro parece, plata no es. ¿Qué es?','El plátano.'],
 ['Tiene dientes y no come, tiene cabeza y no es hombre.','El ajo.'],
 ['Cuanto más le quitas, más grande es.','El agujero.'],
 ['Rosa teje un punto rojo, uno azul, uno rojo, uno azul… ¿De qué color es el punto número 10?','Azul: los puntos pares son azules.'],
 ['Tengo hojas y no soy árbol, tengo lomo y no soy caballo.','El libro.'],
 ['Vuela sin alas, silba sin boca, empuja sin manos y no se ve ni se toca.','El viento.'],
 ['Redondo, redondo, sin tapa ni fondo.','El anillo.'],
 ['¿Qué pesa más, un kilo de lana o un kilo de piedras?','Pesan lo mismo: un kilo.'],
 ['Tiene ojos y no ve, tiene agua y no la bebe, tiene barba y no es hombre.','El coco.'],
 ['Sube llena y baja vacía, y si no se da prisa, la sopa se enfría.','La cuchara.'],
 ['Coco y sus dos hermanas tienen dos patas cada una. ¿Cuántas patas hay entre las tres?','Seis patas: 2 + 2 + 2.'],
 ['Doce señoritas en un corredor, todas tienen medias y zapatos no.','Las horas del reloj.'],
 ['Agua pasa por mi casa, cate de mi corazón.','El aguacate.'],
 ['Te lo digo y te lo repito, y si no lo adivinas, no vales un pito.','El té.'],
 ['Tengo agujas y no sé coser, tengo números y no sé leer.','El reloj.'],
 ['Si Bruno hornea 3 bandejas con 4 bollos cada una y se come uno, ¿cuántos quedan?','Once: 3 × 4 = 12, y 12 − 1 = 11.'],
];

const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const wd=n=>new Date(n*864e5).getUTCDay();
function edicion(t){ // última edición (lunes o jueves) hasta el día t
  let d=dayNum(t); while(wd(d)!==1&&wd(d)!==4) d--;
  const w=Math.floor((d-dayNum(BASE))/7);
  return {idx:w*2+(wd(d)===4?1:0), dia:d};
}
const at=(arr,i)=>arr[((i%arr.length)+arr.length)%arr.length];
const capacidad=()=>Math.min(Math.floor(NOTICIAS.length/2),DATOS.length,CHISTES.length,ADIVINANZAS.length);
const fecha=n=>{ const x=new Date(n*864e5); return x.getUTCDate()+'/'+(x.getUTCMonth()+1); };

function delDia(t){
  const d=new Date(now()), mes=d.getMonth(), dia=d.getDay(), n=dayNum(t);
  const pr=Math.round(Math.min(1,bridgeTotal()/BRIDGE_GOAL)*100);
  let trees=0; try{ trees=progressStats(P()||{}).trees||0; }catch(e){}
  const op=[
    ['🌦️','El tiempo',mes>=11||mes<=1?'Hace frío: Rosa recomienda bufanda doble y chocolate caliente.':mes<=4?'Llega la primavera: las flores del pueblo están a punto de abrirse.':mes<=8?'¡Calor! Lía avisa de que el río está perfecto para chapotear.':'Otoño en Villaovillo: las hojas cubren los caminos de colores.'],
    ['🌉','Obras del puente',pr>=100?'¡El puente ya está terminado! Lía da las gracias a las vecinas que pusieron botones.':`El puente de Lía va por el ${pr} %. Cada botón cuenta.`],
    ['🌳','El pueblo crece',`Ya hay ${trees} árboles en Villaovillo. Cada encargo terminado hace brotar uno nuevo.`],
    ['🗓️','Hoy es '+DIAS[dia],dia===0||dia===6?'¡Fin de semana! Buen día para regar el jardín y decorar la casa.':'Día de cole. Después de los deberes, el telar te espera.'],
  ];
  return at(op,n);
}

paquete({
  id:'gaceta', nombre:'La Gaceta de Villaovillo', emoji:'📰', cuando:'siempre',
  info(){ const cap=capacidad(), e=edicion(today()); const fin=dayNum(BASE)+Math.floor((cap-1)/2)*7+((cap-1)%2?6:2); // último día de la última edición distinta
    return `Edición ${e.idx+1} de ${cap}. Carteles nuevos hasta el ${fecha(fin)}; después se repiten`; },
  enchufes:{
    tablon(){
      const t=today(), E=edicion(t), i=E.idx, cards=[];
      const firma=`La Gaceta · ${DIAS[wd(E.dia)]} ${fecha(E.dia)}`;
      [at(NOTICIAS,2*i),at(NOTICIAS,2*i+1)].forEach(([e,ti,tx],k)=>cards.push({key:'gn'+i+k,tipo:'noticia',estilo:k?'cuadros':'kraft',emoji:e,titulo:ti,texto:tx,firma,prio:20-k}));
      const [de,dt]=at(DATOS,i); cards.push({key:'gd'+i,tipo:'dato',estilo:'cuadros',color:'#eef7ff',emoji:de,titulo:'¿Sabías que…?',texto:dt,firma,prio:15});
      const [cp,cr]=at(CHISTES,i); cards.push({key:'gc'+i,tipo:'chiste',estilo:'tarjeta',emoji:'😂',titulo:'El chiste de Hilo',texto:cp,firma:'Hilo el robot, que se ríe solo',prio:25,leer:cp+' … '+cr,
        extra(x){ x.innerHTML=`<div class="bpunch">— ${esc(cr)}</div>`; }});
      const [ap,ar]=at(ADIVINANZAS,i), hay=dayNum(t)>E.dia;
      cards.push({key:'ga'+i,tipo:'adivinanza',estilo:'pergamino',emoji:'❓',titulo:'Adivina, adivinanza',texto:ap,firma:'Sabina la lechuza',prio:30,sello:hay?'¡Solución!':'',leer:ap,
        extra(x){
          if(!hay){ x.innerHTML='<div class="bsol cerrada">🔒 La solución saldrá mañana en este tablón. ¡Piénsalo bien!</div>'; return; }
          const b=el('button','btn primary','🔍 Ver la solución'); b.onclick=ev=>{ ev.stopPropagation(); x.innerHTML=`<div class="bsol">💡 ${esc(ar)}</div>`; speakNow(ar); };
          x.append(el('div','bsolq','¿Ya lo has pensado? La solución ya está aquí:'),b);
        }});
      const [ye,yt,yx]=delDia(t); cards.push({key:'gy'+t,tipo:'del-dia',estilo:'posit',color:'#dff5d8',emoji:ye,titulo:yt,texto:yx,firma:'Tablón del pueblo',prio:12});
      return cards;
    }
  }
});
})();
