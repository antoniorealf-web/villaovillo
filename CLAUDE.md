# Villaovillo · guía para Claude

Juego educativo para las dos hijas de Antonio: Berta (9 años, grupo «9») y Cintia (6 años, grupo «6»). Enseña habilidades para la era de la IA (lógica y programación, matemáticas, comprensión lectora, revisar el trabajo de una IA) dentro de un pueblo que crece, al estilo de Animal Crossing. Sesiones de 15-20 minutos en una tablet, cada niña con su perfil y su nivel. Papá es «el alcalde»: escribe cartas, pone tareas y sube el temario del cole.

## Direcciones

- Repositorio: https://github.com/antoniorealf-web/villaovillo (rama `main`; lo que se sube a `main` se publica solo).
- Juego: https://antoniorealf-web.github.io/villaovillo/
- Modo prueba (guardado aparte): https://antoniorealf-web.github.io/villaovillo/?prueba (catálogo de ejercicios: `?prueba#catalogo`)
- Panel del alcalde para el móvil (necesita la nube): https://antoniorealf-web.github.io/villaovillo/panel.html
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
| `index.html` | El juego entero (HTML, CSS y JS en un archivo, unos 280 KB) |
| `cuadernos.js` | Cuadernos de repaso de la Biblioteca (`window.CUADERNOS`) |
| `config.js` | URL del Apps Script de la nube (vacía mientras no esté instalada) |
| `panel.html` | Panel del alcalde para el móvil (lee y escribe en la nube) |
| `apps-script/Code.gs` | Backend en una hoja de Google (`CLAVE` y `PIN`) |

- Guardado: `localStorage` con la clave `villaovillo.v1`; en el modo prueba, `villaovillo.prueba`. `DB.profiles[]` guarda un objeto por niña; `P()` devuelve la niña activa.
- `index.html` está organizado en módulos con un comentario-cabecera (`/* ===== NOMBRE ===== */`). Los módulos nuevos se añaden antes del comentario «CATÁLOGO DE EJERCICIOS». Una `function` declarada más abajo sustituye a una anterior del mismo nombre: así se han ido ampliando algunas funciones. Antes de cambiar una función, busca su última definición.
- Mundo de 2400×1600 con cámara, fondo prerrenderizado (`BGC`) y entidades ordenadas por profundidad. Los vecinos son sprites vectoriales en `NPC_DRAW`.
- Zonas: telar (encargos de lógica), Panadería de Bruno (mates), Biblioteca de Sabina (repaso con repetición espaciada, `p.sr`), Tablón (tareas), Tienda de Coco (jardín y casa), casa propia (jardín `GD.mode='garden'` e interior `GD.mode='room'`, `p.room`), puente de Lía (`p.bridge`, objetivo común `BRIDGE_GOAL`).
- Paseo del alcalde (supervisión): `VISIT` no nulo mientras papá recorre el pueblo de una niña (`startVisit`, `endVisit`). En ese modo `DB.cur` apunta a la niña visitada, `save()` no toca su partida, el reloj de juego no cuenta y los encargos se abren en modo `catalog`. Fichas visuales en `openFicha()` y taller de solo lectura en `openVTaller()`. Todo lo nuevo que pueda cambiar la partida debe comprobar `VISIT`.
- Progresión: maestría por área (`MAST`, `p.mastery`, `addMastery`, `mLevel`), desbloqueos en `MAST_UNLOCK`, zonas al otro lado del río en `ZONE_REQ` (además del puente terminado). Medallas en `MEDALS`.
- Ejercicios del telar: `genEncargo(p, seed, kind, id, forceType)` con los tipos `seq`, `reglas`, `rep`, `mot`, `hilo`, `cab`, `cua`, `falta` (tarjeta perdida) y `custom`. La lista diaria sale de `ensureDaily` (tipos de `tlvTypesFor`), con tipos distintos cada día. La última definición de `genEncargo` está en el módulo «NIVELES DE RETO DEL TELAR».
- Nivel de reto por tipo (`p.tlv[tipo]`, 1-10, `tlvOf`, `tlvUpdate`): sube tras 2 encargos perfectos seguidos y baja tras 2 atascos (`p.tlvRun`). El nivel cambia el tamaño, los colores, el límite de tarjetas (`v.max`), los bucles dentro de bucles del cabezal (`cabBest`), los huecos sueltos o en diagonal de «¿Qué sigue?» (`v.holes`) y los fallos de Hilo (`v.bugs`, fase `locate` para señalar dónde está). Papá lo ajusta en las fichas. En el catálogo se elige el nivel.
- Al tejer, `animateKnit` usa `traceProg` para marcar con una flecha la tarjeta que se ejecuta y la vuelta de Repetir (`knitHL`); el cabezal usa `cabApply`.
- Pueblo compartido: `progressStats` y los vecinos (`townLv`) se calculan con las dos niñas. Los logros se apuntan con `addNews` en `DB.news` y la otra los ve al entrar (`showNews`) o en el Ayuntamiento (`openNews`).

## Registro y estadísticas

- El juego guarda por día y por niña `p.log[fecha] = {t:[hechos,3★], p:[hechos,bien], b:[hechas,bien], ta, ty:{tipo:n}, cu:[cuadernos], e:botones ganados acumulados, m:[maestría telar, pan, bib acumuladas]}` y los minutos en `p.play[fecha]` (en segundos).
- En el modo alcalde, «Informe para Claude» copia un texto que empieza por `VILLAOVILLO-INFORME v1 <fecha>` seguido de un JSON (`buildReport()`).
- Cuando Antonio pegue un informe:
  1. Lee la hoja Registro (pestaña Diario) y añade solo los días que falten, una fila por niña y día. Columnas: Fecha, Niña (el nombre del perfil), Minutos (`min`), Telar hechos y 3★ (`t`), Panadería hechos y bien (`p`), Biblioteca hechas y bien (`b`), Tareas (`ta`), Botones ganados (diferencia de `e` con el día anterior registrado), Maestrías (`m`, acumuladas), Notas, Semana (lunes de esa semana).
  2. La fila 5 de la pestaña Resumen tiene los nombres (Berta y Cintia): las fórmulas buscan esos nombres en la columna Niña. Si los perfiles del juego se llaman distinto, usa los nombres de la fila 5 al escribir en Diario.
  3. Actualiza la pestaña Cuadernos con `sabidas` y con las preguntas que se le resisten (`flojas`).
  4. Resume la semana en 4-6 líneas: tiempo, áreas fuertes y flojas, lo que se le atasca y una sugerencia (tipo de reto, cuaderno nuevo, ajuste de economía).
- Las semanas de la pestaña Semanal llegan hasta mayo de 2027: amplíalas copiando la última fila cuando haga falta.

## Material del cole → cuadernos

Formato de `cuadernos.js`: `{id, para:'6'|'9'|'todas'|nombre, emoji, asignatura, titulo, preguntas:[…]}`. Tipos de pregunta: `{t:'opcion', q, opts, a, exp?}`, `{t:'vf', q, a:true|false, exp?}` y `{t:'ordenar', q, items}` (con los items en el orden correcto). De 6 a 10 preguntas, solo con lo que pone el material. Grupo 6: frases cortas y 3 opciones. Grupo 9: 3 o 4 opciones y alguna pregunta de «por qué». Pon una `exp` corta en las preguntas difíciles. Usa ids estables (`asignatura-tema`): si se cambia un id, se pierde la repetición espaciada de ese cuaderno.

## Cómo probar

- Playwright con Chromium sobre `file:///…/index.html?prueba`. Bloquea las fuentes de Google (`route('**/*googleapis*/**', abort)`), pulsa los diálogos con JS (`#dlg.on .dlgbtns button`) y llama con `void` a las funciones que esperan un diálogo.
- Crea perfiles de prueba con `newProfile(nombre, edad, color)`. La barra de prueba permite saltar días y dar botones o maestría.
- Revisa siempre que no haya `pageerror` y mira capturas de las pantallas tocadas.

## Para que escale

- Cada zona o casa nueva es un módulo con su pantalla `<section id="scr-…">`, su apertura `open…()`, su requisito en `ZONE_REQ` o `MAST_UNLOCK` y, si da puntos, su área en `MAST` y su registro con `logAct()`.
- Un tipo de ejercicio nuevo se añade a `genEncargo`, a `TYPE_NAMES` y al catálogo de pruebas.
- Si `index.html` pasa de unos 400 KB, separa los módulos grandes en archivos `.js` (como `cuadernos.js`) cargados con `<script src>`, sin cambiar el formato del guardado.
- Si cambia el formato del informe, sube la versión (`v2`) y mantén la lectura de la anterior.
