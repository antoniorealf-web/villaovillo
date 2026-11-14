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
5. **Implementar → Nueva implementación** → tipo **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Pulsa **Implementar** y autoriza los permisos. Google avisa de que la aplicación no está verificada: pulsa **Configuración avanzada → Ir a…** (es tu propio script).
7. Copia la **URL de la aplicación web** (termina en `/exec`) y pásasela a Claude para ponerla en `config.js`.

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
