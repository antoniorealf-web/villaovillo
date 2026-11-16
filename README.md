# Villaovillo · El Taller del Telar

Juego educativo para dos niñas (6 y 9 años): pensamiento computacional tejiendo telas con tarjetas, un pueblo que crece con los logros y un alcalde (papá) que escribe cartas, manda tareas y diseña retos.

- `index.html`: el juego (para la tablet).
- `panel.html`: el panel del alcalde (para el móvil de papá).
- `index.html?prueba`: modo prueba, con su propio guardado.
- `config.js`: dirección del script de Google.
- `apps-script/Code.gs`: la «nube familiar» (se pega en una hoja de Google).

## Puesta en marcha (una sola vez)

### 1. La nube familiar (hoja de Google)
1. Crea una hoja de cálculo nueva en Google Drive. Llámala, por ejemplo, «Villaovillo».
2. Menú **Extensiones → Apps Script**.
3. Borra lo que haya y pega el contenido de `apps-script/Code.gs`.
4. Arriba del todo, cambia `CLAVE` (la clave de la familia) y `PIN` (el tuyo). Guarda con el icono del disquete.
5. Elige la función **preparar** en el desplegable de arriba y pulsa **▶ Ejecutar**. Google pedirá permisos para la hoja y para Drive: acéptalos. Se crea en tu Drive la carpeta **«Villaovillo · partidas»**, con un archivo por niña y la subcarpeta **«copias»** (una copia por niña y día, se guardan 60 días).
6. **Implementar → Nueva implementación** → tipo **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
7. Pulsa **Implementar** y autoriza los permisos. Google avisa de que la aplicación no está verificada: pulsa **Configuración avanzada → Ir a…** (es tu propio script).
8. Copia la **URL de la aplicación web** (termina en `/exec`) y pásasela a Claude para ponerla en `config.js`.

### 2. La web (GitHub Pages)
En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**.
Al cabo de uno o dos minutos, el juego estará en `https://antoniorealf-web.github.io/villaovillo/`.

### 3. La tablet
1. Abre la dirección del juego y añádela a la pantalla de inicio («Añadir a pantalla de inicio»).
2. En la pantalla de inicio del juego, pulsa **⚙️ Nube** y escribe la clave de la familia. Solo se hace una vez.

### 4. Tu móvil
Abre `https://antoniorealf-web.github.io/villaovillo/panel.html`, escribe la clave y el PIN, y guárdalo en favoritos.

## Si algo va mal
- **⚠️ Sin conexión:** el juego sigue guardando en la tablet y sube los cambios cuando vuelve la conexión.
- **Copia automática en la tablet:** cada día el juego guarda una copia de las partidas. Si la partida no se puede leer, la aparta en vez de borrarla. Las dos se recuperan desde **♻️ Restaurar**.
- **Copias en Drive:** con la nube instalada, en la carpeta «Villaovillo · partidas → copias» hay una copia por niña y día.
- **Copia de seguridad manual:** en la pantalla de inicio, **💾 Copia de seguridad** genera un código; **♻️ Restaurar** lo recupera.
- **Si cambias el código del script:** usa **Implementar → Gestionar implementaciones → editar → Nueva versión**, para que la URL no cambie.

## Progresión (v0.3)
- **Encargos del día:** 4 el primer día y 3 los siguientes (como máximo 2 con historia). Cuando se acaban las historias, el generador crea encargos nuevos según el nivel y la edad.
- **Práctica libre:** encargos ilimitados; da como máximo 15 botones al día.
- **Rangos:** 12 rangos con experiencia (de Aprendiz a Reina del telar), pensados para unos 2 meses de juego diario. Los rangos desbloquean objetos de la tienda y zonas del pueblo (Huerto del robot: Experta; Laboratorio: Maestra).
- **Jardín vivo:** las plantas nacen como semilla y hay que regarlas cada día (las flores tardan 2 días y los árboles 3). Hay plantas comunes, raras y especiales para coleccionar.
- **Racha diaria:** cada día que juegan reciben un regalo. Si faltan algún día, la racha baja un poco, pero no vuelve a cero.
- **22 medallas** con barra de progreso, en el libro.

## Tipos de reto en el telar (v0.4)
| Tipo | Habilidad | Desde |
|---|---|---|
| Secuencia | seguir un orden | nivel 1 |
| ¿Qué sigue? | encontrar la regla de una serie | nivel 1 |
| Cuadro mágico | deducción lógica (sudoku de colores 3×3, o 4×4 con cuadrados) | nivel 1 |
| Repetir | bucles | nivel 2 |
| Cabezal programable | estado (el hilo activo), coordenadas, bucles dentro de bucles | nivel 2 |
| Motivos | funciones | nivel 3 |
| Revisa a Hilo | comprobar el trabajo de una IA | nivel 3 |

Cada día salen tipos distintos, con más probabilidad para el concepto más nuevo. Todos se pueden probar en `?prueba#catalogo`.

## Casas nuevas (v0.5)
- **📌 Tablón de tareas:** tareas de casa y deberes. Ellas las aceptan, las marcan como hechas y, cuando papá las valida, recogen el premio. Se gestionan desde el **modo alcalde** de la tablet (PIN local, funciona sin nube) o desde el panel del móvil (con nube). Las tareas pueden repetirse cada día.
- **🥐 Panadería de Bruno:** turnos de problemas de mates según la edad: contar, sumas, restas y dinero (6-7); multiplicar, repartir, cambio, recetas, fracciones y problemas de dos pasos (8-10). En el modo alcalde se elige el «foco» de clase (p. ej. la tabla del 7).
- **🦉 Biblioteca de Sabina:** repaso de lo que dan en clase, con preguntas de opción, verdadero/falso y ordenar. Usa repaso espaciado: lo que se falla vuelve a salir al día siguiente y lo que se sabe, cada vez más tarde. El contenido está en `contenido/cuadernos.js`.
- **Cabezal:** se ilumina la tarjeta que se ejecuta y cada «Repetir» muestra en qué vuelta va. También hay modo **👣 Paso a paso**.
- **Ruta del día:** telar + panadería + biblioteca (si hay cuadernos) = bonus diario.

## Registro e informe (v0.6)
- El juego guarda un registro diario de cada niña: minutos, ejercicios por área, aciertos, tareas, botones y maestría.
- En el **modo alcalde**, **📊 Informe para Claude → Copiar** (o **Enviar**) saca ese registro como texto. Se pega en el proyecto de Claude para actualizar la hoja de registro y las estadísticas.
- `CLAUDE.md` explica la estructura del juego a cualquier sesión nueva de Claude.
