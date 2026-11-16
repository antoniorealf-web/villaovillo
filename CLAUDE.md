# Villaovillo · guía para Claude

Juego educativo para las dos hijas de Antonio: Berta (9 años, grupo «9») y Cintia (6 años, grupo «6»). Enseña habilidades para la era de la IA (lógica y programación, matemáticas, comprensión lectora, revisar el trabajo de una IA) dentro de un pueblo que crece, al estilo de Animal Crossing. Sesiones de 15-20 minutos en una tablet, cada niña con su perfil y su nivel. Papá es «el alcalde»: escribe cartas, pone tareas y sube el temario del cole.

## Direcciones

- Repositorio: https://github.com/antoniorealf-web/villaovillo (rama `main`; lo que se sube a `main` se publica solo).
- Juego: https://antoniorealf-web.github.io/villaovillo/
- Modo prueba (guardado aparte): https://antoniorealf-web.github.io/villaovillo/?prueba (catálogo de ejercicios: `?prueba#catalogo`)
- Alcalde a distancia, para el móvil o el ordenador de papá (necesita la nube): https://antoniorealf-web.github.io/villaovillo/?alcalde (`panel.html` solo redirige aquí)
- Instrucciones vivas (doc editable): https://claude.ai/artifact/Bq5jDtQdVyTyu2wmVdu2YL
- Registro y estadísticas (hoja): https://claude.ai/artifact/MWN7Cmeky4eZqGc3Li6bhJ

Lo que cambia a menudo (temas del cole, economía, hoja de ruta, decisiones) vive en el doc de Instrucciones vivas, no aquí. Léelo al empezar una tarea de contenido o de diseño.

## Reglas fijas

- La tablet nunca usa una sesión de Claude. Todo el contenido se genera aquí y se publica en GitHub Pages.
- Interfaz y textos en español de España, cálidos y cortos. Pensado para tablet: botones grandes y nada que dependa de pasar el ratón.
- Estética redondeada tipo Nintendo dibujada por código (canvas o SVG). Nunca personajes, logos ni diseños con derechos de autor.
- Nunca se pierde el progreso: un campo nuevo se añade en `migrate()` con valor por defecto y nunca se renombra ni se borra un campo guardado.
- Cada cambio se prueba en el modo prueba antes de subirlo y se resume a Antonio en pocas líneas, sin tecnicismos.

## Arquitectura

| Archivo | Qué es |
| --- | --- |
| `index.html` | Las pantallas (HTML) y la lista ordenada de archivos que se cargan |
| `estilos.css` | El aspecto de todo el juego |
| `js/` | El programa, un archivo por módulo: `nucleo/` (datos, guardado, perfiles, códigos, nube, música, progresión, maestrías, modo prueba, catálogo), `mundo/` (pueblo, cámara, personajes, vecinos, noche), `zonas/` (telar, panadería, biblioteca, tablón, casa), `alcalde/` (modo alcalde y paseo) e `inicio.js` |
| `paquetes/` | Paquetes: temporadas, eventos y zonas nuevas (`gaceta.js`: noticias, chistes y adivinanzas del tablón) |
| `fuentes/` | Tipografías guardadas en el juego (Baloo 2, Patrick Hand y Caveat, licencia OFL) para que no dependan de internet |
| `sw.js`, `manifest.webmanifest`, `iconos/` | Juego instalable y sin wifi: copia de todas las piezas en la tablet, ficha del juego e icono (dibujo en `iconos/icono-fuente.html`; se redibuja con `herramientas/iconos.py`) |
| `contenido/cuadernos.js` | Cuadernos de repaso de la Biblioteca (`window.CUADERNOS`) |
| `herramientas/version.py` | Pone el número de versión en todo lo que carga `index.html` y comprueba que no falta ni sobra ningún archivo |
| `pruebas/` | Pruebas automáticas: `equivalencia.py`, `recorrido.py`, `revision.py` y `sin_conexion.py` |
| `config.js` | URL del Apps Script de la nube (vacía mientras no esté instalada) |
| `panel.html` | Redirige a `?alcalde` (el panel antiguo; se conserva para los favoritos) |
| `manifest-alcalde.webmanifest` | Ficha para instalar el alcalde a distancia en el móvil («Alcalde», abre `?alcalde`) |
| `apps-script/Code.gs` | Backend en una hoja de Google (`CLAVE` y `PIN`) |

- Guardado: `localStorage` con la clave `villaovillo.v1`; en el modo prueba, `villaovillo.prueba`. `DB.profiles[]` guarda un objeto por niña; `P()` devuelve la niña activa. Todo se escribe con `writeDB()`, que avisa si falla. `load()` aparta una partida ilegible en `KEY+'.danada'` y guarda una copia diaria en `KEY+'.copia'`; las dos se recuperan desde «Restaurar» (`autoCopyButtons`).
- Nube: `apps-script/Code.gs` guarda cada partida como archivo en Drive (carpeta «Villaovillo · partidas», sin límite de tamaño) y una copia por niña y día en «copias» (60 días). La hoja «Partidas» solo tiene el resumen y `archivo:<id>`. Si cambia `Code.gs`, Antonio debe publicar una versión nueva de la implementación.
- Code.gs (versión 2): la primera vez que recibe la `CLAVE` y el `PIN` escritos en el código los guarda en las Propiedades del script; en las actualizaciones siguientes se pega el código tal cual. La tablet sube además lo común del pueblo (`pushPueblo`: tablón, `localMsgs`, `recTasks`, `dayMode`, `paqForce`, `DB.paq`, `news`) al archivo `pueblo.json`, solo si ha cambiado. Hoja «Órdenes»: `id, fecha, para, tipo, dato, estado (pendiente/aplicada/rechazada), actualizado`.
- El programa está repartido en `js/`, un archivo por módulo, y `index.html` los carga en un orden fijo. El orden importa: lo que se ejecuta nada más cargar un archivo solo puede usar cosas de archivos anteriores; dentro de las funciones se puede usar cualquier cosa. Un archivo nuevo se añade a la lista de `index.html` antes de `js/nucleo/paquetes.js`; un paquete, después, junto a los demás de `paquetes/`. Todos los archivos empiezan por `"use strict";`.
- Cada función existe en un único sitio. Para ampliarla se edita en su archivo (búscala con `grep -rn "function nombre" js`); nunca se vuelve a declarar en otro archivo, porque la última versión cargada taparía a la otra sin avisar.
- Antes de cada publicación: `python3 herramientas/version.py`. Pone un número de versión nuevo en todo lo que carga `index.html` (y en `<meta name="villa-version">`) para que la tablet no mezcle archivos viejos y nuevos, y escribe en `sw.js` la versión y la lista de piezas que se guardan en la tablet. Esa lista no se toca a mano. Una imagen, sonido o archivo nuevo que el juego cargue debe estar en esa lista: si no está en `iconos/` o `fuentes/` ni se carga con `?v=` desde `index.html`, añádelo en `version.py`.
- Juego instalable (`js/nucleo/instalacion.js` y `sw.js`): la primera vez que se abre con internet, la tablet guarda todas las piezas y desde entonces abre sin wifi. Una versión publicada se descarga entera en segundo plano (saltando la memoria temporal del navegador y comprobando que la página guardada es de esa versión) y se pone solo en la pantalla de inicio, sin nadie jugando (`swTick`); nunca a mitad de partida. El modo alcalde muestra la versión instalada («El juego en esta tablet»). La nube (POST a Google) no pasa por la copia. Para probarlo hace falta un servidor (`pruebas/sin_conexion.py` lo monta solo); con `file://` no se activa.
- Mundo de 2400×1600 con cámara, fondo prerrenderizado (`BGC`) y entidades ordenadas por profundidad. Los vecinos son sprites vectoriales en `NPC_DRAW`.
- Caminos (`js/mundo/caminos.js`): nadie pisa el lago, los edificios ni el río (solo se cruza por el puente terminado). `andarA(obj, x, y)` busca el camino (A* en casillas de 30 px, `pisable`) y lo deja en tramos rectos en `obj.path`; lo usan la niña, papá en el paseo y los vecinos. En trayectos largos (`player.largo` > 900) se anda más deprisa. Un edificio o zona nueva que no se pueda pisar se añade a `insideBuilding`.
- Zonas: telar (encargos de lógica), Panadería de Bruno (mates), Biblioteca de Sabina (repaso con repetición espaciada, `p.sr`), Tablón (tareas), Tienda de Coco (jardín y casa), casa propia (jardín `GD.mode='garden'` e interior `GD.mode='room'`, `p.room`), puente de Lía (`p.bridge`, objetivo común `BRIDGE_GOAL`; Lía está en el pueblo desde el principio, junto al puente, aunque sus encargos llegan en el nivel 2).
- Paseo del alcalde (supervisión): `VISIT` no nulo mientras papá recorre el pueblo (`startVisit`, `endVisit`). El pueblo es uno solo y se pasea sin elegir niña: lo que es de cada una se pregunta al entrar (`elegirNina`, p. ej. el taller con `verEncargos`) o se enseña de las dos (fichas, tienda). Los «!» de los vecinos salen si cualquiera de las dos tiene un encargo con ellos. En ese modo `DB.cur` apunta a la niña visitada, `save()` no toca su partida, el reloj de juego no cuenta y los encargos se abren en modo `catalog`. Fichas visuales en `openFicha()` y taller de solo lectura en `openVTaller()`. Todo lo nuevo que pueda cambiar la partida debe comprobar `VISIT`.
- Órdenes del alcalde (`js/alcalde/distancia.js`): todo lo que cambia papá pasa por `alcHaz(para, tipo, dato, texto)` con `para` = id de la niña, `'todas'` o `'pueblo'`. Tipos: `set` (solo campos permitidos: `mathFocus`, `panLv`, `code`, `tlv.<tipo>`; del pueblo `dayMode`, `paqForce.<id>`), `tarea` (carta, casa, deberes o reto; crea mensajes `L<orden>-<niña>`), `validar`, `quitar`, `recAdd`, `recDel`, `nota`, `notaDel`, `pizNota`, `pizDel`. En la tablet se aplica al momento (`aplicaOrden`); en el móvil se apunta en la nube con el PIN y la tablet la aplica en `cloudPull` (`aplicaOrdenesNube`: aplica, sube las partidas tocadas y el pueblo, y marca la orden). Todas se pueden aplicar dos veces sin efecto. Un ajuste nuevo que papá deba poder cambiar se añade a `ORD_SET_NINA`/`ORD_SET_PUEBLO` y a `aplicaOrden`; nunca se cambia una partida directamente desde el modo alcalde.
- Alcalde a distancia (`?alcalde`, `REMOTO`): guarda aparte (`villaovillo.alcalde`, clave en `villaovillo.alcaldeClave`, PIN en `villaovillo.alcaldePin`), nunca sincroniza partidas (`cloudReady()` es falso) ni llama a `save`/`pueblo`. `remCargar()` lee partidas, mensajes, `pueblo.json` y órdenes, y vuelve a aplicar a la vista las órdenes pendientes. Reutiliza `renderAlcalde`, el paseo, las fichas y el tablón. La tablet recoge órdenes cada minuto (también en la pantalla de inicio).
- Panadería: el grupo 9 usa una escalera de cuentas (`PAN9_LEVELS`, nivel central `p.panLv`, papá lo cambia en el modo alcalde). `genMath9` mezcla niveles como una campana: 60 % del nivel, 25 % de repaso (🌱, 1 botón), 15 % de reto (🔥, 3 botones); `q.tier` guarda cuál. Con un foco de clase elegido, el 60 % es del foco. El grupo 6 sigue con `genMath`.
- Progresión: maestría por área (`MAST`, `p.mastery`, `addMastery`, `mLevel`), desbloqueos en `MAST_UNLOCK`, zonas al otro lado del río en `ZONE_REQ` (además del puente terminado). Medallas en `MEDALS`.
- Ejercicios del telar: `genEncargo(p, seed, kind, id, forceType)` con los tipos `seq`, `reglas`, `rep`, `mot`, `hilo`, `cab`, `cua`, `falta` (tarjeta perdida) y `custom`. La lista diaria sale de `ensureDaily` (tipos de `tlvTypesFor`), con tipos distintos cada día. `genEncargo` está en `js/zonas/telar/niveles.js`.
- Nivel de reto por tipo (`p.tlv[tipo]`, 1-10, `tlvOf`, `tlvUpdate`): sube tras 2 encargos perfectos seguidos y baja tras 2 atascos (`p.tlvRun`). El nivel cambia el tamaño, los colores, el límite de tarjetas (`v.max`), los bucles dentro de bucles del cabezal (`cabBest`), los huecos sueltos o en diagonal de «¿Qué sigue?» (`v.holes`) y los fallos de Hilo (`v.bugs`, fase `locate` para señalar dónde está). Papá lo ajusta en las fichas. En el catálogo se elige el nivel.
- Al tejer, `animateKnit` usa `traceProg` para marcar con una flecha la tarjeta que se ejecuta y la vuelta de Repetir (`knitHL`); el cabezal usa `cabApply`.
- Pueblo compartido: `progressStats` y los vecinos (`townLv`) se calculan con las dos niñas. Los logros se apuntan con `addNews` en `DB.news` y la otra los ve al entrar (`showNews`) o en el Ayuntamiento (`openNews`).

- Códigos de entrada: cada niña entra con `p.code` (4 números, lo elige ella la primera vez con `askGirlCode`); papá los ve y cambia en el modo alcalde (`renderCodesBox`). El código del alcalde (`askPin`, teclado `askKeypad`) protege además borrar partidas, la nube y las copias de seguridad. `changePin()` lo cambia: el viejo sigue valiendo hasta que el nuevo se escribe dos veces igual.
- Buzón (`drawBuzon`, `buzonPos`, en `js/mundo/mundo.js`): cada casa tiene su buzón al lado de la puerta; con carta o reto sin abrir (`mailCountOf`) la banderita sube y sale un sobre. Se abre yendo hasta él (no hay botón en la barra). Papá, en el pueblo, manda a la niña al buzón.
- Interior de la casa: pared del fondo de `RWB.x0` a `RWB.x1` y paredes laterales en perspectiva. Dentro andan la dueña y, de visita, la otra niña o papá (`roomGente`, `roomAndar`): se toca el suelo libre para andar. En pantallas estrechas (menos de 620 px) se ve una parte del cuarto (`GD.roomVW`) y la vista sigue a quien anda (`GD.camX`).
- Buzón de ideas (`js/zonas/sugerencias.js`): en el Ayuntamiento (botón «💡 Buzón de ideas» de `openNews`) las niñas escriben al alcalde por temas (`SUG_CATS`: retos y tareas, el alcalde y yo, algo no funciona, idea nueva). Se guardan en `DB.sugs`, suben con el pueblo y salen en el informe (`ideas`). Papá las ve en el modo alcalde (`renderSugBox`) y las marca como leídas o contesta (orden `sugLeida`; la respuesta llega también como carta). Cuando Antonio pegue un informe con ideas nuevas, coméntalas en el resumen (sobre todo los fallos).
- Pizarra (`fu_pizarra`, pared): `p.board = {img, notes}`. La dueña dibuja; la otra niña y papá dejan notas (`openBoardView`). Al entrar, `boardNotice` avisa de mensajes nuevos.
- Pecera (`fu_pecera`, suelo, 300 botones y 14 días jugados): `p.aqua = {fish, deco, fed}`, vista grande en `openAqua`, con peces (`FISH`) y decoración (`AQDECO`) que se desbloquean con maestrías y medallas. Dar de comer una vez al día da 1 botón.
- Tablón de corcho (`js/zonas/tablon/corcho.js`): un corcho horizontal de 4×3 casillas (3×4 en vertical) con carteles pequeños que no se leen (`miniCard`); al tocar uno sale en grande como hoja de papel con letra manuscrita (`openPaper`). Todo es un «cartel» (`boardCards`): tareas, notas (`DB.boardMsgs`), logros (`DB.news`) y lo que añadan los paquetes con el enchufe `tablon`. Si no caben, se quedan los de más `prio`. Estilos de papel: `rayas`, `cuadros`, `posit`, `kraft`, `periodico`, `tarjeta`, `pergamino`. Notas: una por persona (cada niña y el alcalde); la nueva sustituye a la anterior y se queda colgada (`corkPonNota`, `corkNotasVivas`). En el paseo del alcalde se ven las tareas de las dos, se validan y se ponen tareas nuevas (`corkNewTask`). Las tareas no se aceptan: de «nuevo» se pasa a «¡Ya la hice!». El formulario de tarea (`tareaForm`, también en el modo alcalde) ofrece las últimas tareas con un toque (`tareasRecientes`) y, si se repite, los días de la semana: `recTasks[].dias` (0 = domingo, sin lista = todos; `ensureRecurring` la respeta).
- Música y sonidos (`js/nucleo/musica.js`): música de fondo sintetizada con obras clásicas de dominio público (`SONGS`, cada una suena 2 veces y cambia), más baja en los ejercicios (`DUCK_SCREENS`). Pasos al andar (`stepSfx`), voz de cada vecino (`npcVoice`), compras (`sfxBuy`), logros (`sfxLevel`) y `fanfare`. `DB.sound` se cambia con el botón 🎵 del pueblo: música y sonidos, solo sonidos o silencio. `show()` está en este archivo.
- Modo noche (`js/mundo/noche.js`): `nightLevel()` (0 a 1) sigue la hora real con el amanecer y el atardecer de cada mes. Por la noche `drawNight` oscurece el pueblo, enciende farolas y ventanas (las ventanas se apuntan en `winX`), saca luciérnagas, cambia la ventana de la casa y la música elige las obras más tranquilas. Papá lo fija en el modo alcalde («Día y noche», `DB.dayMode`: auto, dia o noche) o con el botón ☀️/🌙 del paseo. Para probarlo, añade `&noche` o `&dia` a la dirección.

## Paquetes

- Todo lo nuevo, temporal (Navidad, la feria) o permanente (Huerto, Laboratorio), es un paquete: un archivo en `paquetes/` que llama a `paquete({id, nombre, emoji, cuando, enchufes, recuerdos, info})`. La explicación completa está al principio de `js/nucleo/paquetes.js`.
- `cuando`: `'siempre'`, `'alcalde'` (lo enciende papá), `{desde:'12-15', hasta:'01-07'}` (cada año), `{desde:'2026-12-15', hasta:'2027-01-07'}` (una vez) o `{logro:()=>…}`. Papá puede forzar cualquiera en el modo alcalde («Paquetes del pueblo»).
- El núcleo pide a los paquetes lo que aportan con `enchufe(nombre, …)`. Hoy solo existe el enchufe `tablon`. Cuando un paquete necesite otro sitio (decorados del pueblo, tienda, retos, música, vecino visitante), se añade una llamada a `enchufe('…')` en ese punto del núcleo y se documenta en `paquetes.js`.
- Lo que se gana en un paquete se guarda en `paqDatos(id)` (común) o `paqDatosNina(p,id)` (de cada niña) y nunca se borra. Lo que deba seguir viéndose fuera de temporada (un objeto comprado) va en `recuerdos`.
- Un paquete con errores no rompe el juego: se salta y el aviso sale en el modo alcalde.
- Para probar un paquete de temporada: `?prueba&fecha=2026-12-20`.
- El calendario de paquetes vive en las instrucciones vivas.
- La Gaceta (`paquetes/gaceta.js`) saca edición nueva cada lunes y jueves: 2 noticias, 1 dato curioso, 1 chiste, 1 adivinanza (la solución se ve desde el día siguiente) y 1 cartel del día. Para ampliarla, añade elementos al final de cada lista; el modo alcalde dice hasta qué día hay carteles nuevos.

## Registro y estadísticas

- El juego guarda por día y por niña `p.log[fecha] = {t:[hechos,3★], p:[hechos,bien], b:[hechas,bien], ta, ty:{tipo:n}, cu:[cuadernos], e:botones ganados acumulados, m:[maestría telar, pan, bib acumuladas]}` y los minutos en `p.play[fecha]` (en segundos).
- En el modo alcalde, «Informe para Claude» copia un texto que empieza por `VILLAOVILLO-INFORME v1 <fecha>` seguido de un JSON (`buildReport()`).
- Cuando Antonio pegue un informe (desde ahora puede traer también `ideas`, del buzón de ideas):
  1. Lee la hoja Registro (pestaña Diario) y añade solo los días que falten, una fila por niña y día. Columnas: Fecha, Niña (el nombre del perfil), Minutos (`min`), Telar hechos y 3★ (`t`), Panadería hechos y bien (`p`), Biblioteca hechas y bien (`b`), Tareas (`ta`), Botones ganados (diferencia de `e` con el día anterior registrado), Maestrías (`m`, acumuladas), Notas, Semana (lunes de esa semana).
  2. La fila 5 de la pestaña Resumen tiene los nombres (Berta y Cintia): las fórmulas buscan esos nombres en la columna Niña. Si los perfiles del juego se llaman distinto, usa los nombres de la fila 5 al escribir en Diario.
  3. Actualiza la pestaña Cuadernos con `sabidas` y con las preguntas que se le resisten (`flojas`).
  4. Resume la semana en 4-6 líneas: tiempo, áreas fuertes y flojas, lo que se le atasca y una sugerencia (tipo de reto, cuaderno nuevo, ajuste de economía).
- Las semanas de la pestaña Semanal llegan hasta mayo de 2027: amplíalas copiando la última fila cuando haga falta.

## Material del cole → cuadernos

Formato de `contenido/cuadernos.js`: `{id, para:'6'|'9'|'todas'|nombre, emoji, asignatura, titulo, preguntas:[…]}`. Tipos de pregunta: `{t:'opcion', q, opts, a, exp?}`, `{t:'vf', q, a:true|false, exp?}` y `{t:'ordenar', q, items}` (con los items en el orden correcto). De 6 a 10 preguntas, solo con lo que pone el material. Grupo 6: frases cortas y 3 opciones. Grupo 9: 3 o 4 opciones y alguna pregunta de «por qué». Pon una `exp` corta en las preguntas difíciles. Usa ids estables (`asignatura-tema`): si se cambia un id, se pierde la repetición espaciada de ese cuaderno.

## Cómo probar

- Playwright con Chromium sobre `file:///…/index.html?prueba`. Bloquea las fuentes de Google (`route('**/*googleapis*/**', abort)`), pulsa los diálogos con JS (`#dlg.on .dlgbtns button`) y llama con `void` a las funciones que esperan un diálogo.
- Antes de publicar un cambio, ejecuta `python3 pruebas/recorrido.py` (abre todas las pantallas, de día y de noche, y falla si hay errores). `python3 pruebas/revision.py` dice qué fallos de la revisión siguen pendientes.
- Para cambios que no deberían alterar nada (reorganizar, limpiar), `python3 pruebas/equivalencia.py index.html salida.json` juega una sesión fija con el azar y la hora fijados: compara la salida con la de la versión anterior (`cmp`) y debe ser idéntica.
- Crea perfiles de prueba con `newProfile(nombre, edad, color)`. La barra de prueba permite saltar días y dar botones o maestría.
- Revisa siempre que no haya `pageerror` y mira capturas de las pantallas tocadas.

## Para que escale

- Cada zona o casa nueva es un módulo con su pantalla `<section id="scr-…">`, su apertura `open…()`, su requisito en `ZONE_REQ` o `MAST_UNLOCK` y, si da puntos, su área en `MAST` y su registro con `logAct()`.
- Un tipo de ejercicio nuevo se añade a `genEncargo`, a `TYPE_NAMES` y al catálogo de pruebas.
- Si un archivo de `js/` pasa de unos 40 KB, pártelo por temas dentro de su carpeta.
- Si cambia el formato del informe, sube la versión (`v2`) y mantén la lectura de la anterior.
