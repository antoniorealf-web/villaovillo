"use strict";
/* =========================================================
   PAQUETE: LA OTRA ORILLA 🌾 (desde el 8 de enero de 2027, para siempre)
   Amplía el pueblo hacia la derecha del río y por arriba, con caminos nuevos y el sitio de la granja,
   el huerto del robot, el laboratorio y una pradera libre. El dibujo y los sitios están en js/mundo/ampliacion.js;
   este paquete solo dice cuándo se enciende (papá también puede encenderlo antes en «Paquetes del pueblo»).
   Se espera a después de Reyes para no tener que nevar lo nuevo. No guarda nada en las partidas.
   Siguientes piezas (paquetes propios): huerto del robot (abre a cada niña con Telar 6) y granja (con su parcela).
   ========================================================= */
paquete({ id:'otra-orilla', nombre:'La otra orilla', emoji:'🌾', cuando:{desde:'2027-01-08',hasta:'2999-12-31'},
  info(){ return 'Pueblo más grande: granja arriba, huerto y laboratorio al otro lado del río'; },
  pruebas:[
    {t:'🌾 El pueblo ampliado (10 ene)', q:'&fecha=2027-01-10'},
    {t:'🌙 El pueblo ampliado de noche', q:'&fecha=2027-01-10&noche'},
    {t:'🤖 Robot del huerto (en el catálogo, al final)', q:'#catalogo'}
  ] });
