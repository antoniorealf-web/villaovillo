/* =========================================================
   COPIA DEL JUEGO EN LA TABLET (service worker)
   ========================================================= */
/* Guarda en la tablet todas las piezas del juego para que abra sin internet.
   La lista y la versión las escribe herramientas/version.py: no las edites a mano.
   Cuando se publica una versión nueva, se descarga entera en segundo plano y espera;
   el juego la pone al volver a la pantalla de inicio (js/nucleo/instalacion.js), nunca a mitad de partida. */
const VERSION = '20261123-181154';
const PIEZAS = [
// LISTA-INICIO
  './',
  'index.html',
  'panel.html',
  'manifest.webmanifest',
  'manifest-alcalde.webmanifest',
  'fuentes/fuentes.css?v=20261123-181154',
  'estilos.css?v=20261123-181154',
  'config.js?v=20261123-181154',
  'contenido/cuadernos.js?v=20261123-181154',
  'contenido/temas/figuras.js?v=20261123-181154',
  'contenido/temas/democracia.js?v=20261123-181154',
  'contenido/temas/egipcios.js?v=20261123-181154',
  'contenido/temas/plantas.js?v=20261123-181154',
  'contenido/temas/sentidos.js?v=20261123-181154',
  'contenido/temas/angulos.js?v=20261123-181154',
  'contenido/temas/navidad.js?v=20261123-181154',
  'contenido/temas/gombrich.js?v=20261123-181154',
  'js/nucleo/datos.js?v=20261123-181154',
  'js/nucleo/guardado.js?v=20261123-181154',
  'js/nucleo/utilidades.js?v=20261123-181154',
  'js/zonas/telar/tela.js?v=20261123-181154',
  'js/nucleo/navegacion.js?v=20261123-181154',
  'js/nucleo/perfiles.js?v=20261123-181154',
  'js/mundo/pueblo.js?v=20261123-181154',
  'js/mundo/edificios.js?v=20261123-181154',
  'js/zonas/telar/taller.js?v=20261123-181154',
  'js/zonas/telar/puzle.js?v=20261123-181154',
  'js/zonas/casa/casa.js?v=20261123-181154',
  'js/zonas/casa/tienda.js?v=20261123-181154',
  'js/zonas/telar/libro.js?v=20261123-181154',
  'js/zonas/telar/diseno-libre.js?v=20261123-181154',
  'js/nucleo/estadisticas.js?v=20261123-181154',
  'js/nucleo/nube.js?v=20261123-181154',
  'js/nucleo/copias.js?v=20261123-181154',
  'js/zonas/tablon/buzon.js?v=20261123-181154',
  'js/nucleo/modo-prueba.js?v=20261123-181154',
  'js/nucleo/progresion.js?v=20261123-181154',
  'js/zonas/telar/retos-cabezal-cuadro.js?v=20261123-181154',
  'js/alcalde/modo-alcalde.js?v=20261123-181154',
  'js/zonas/panaderia.js?v=20261123-181154',
  'js/zonas/biblioteca.js?v=20261123-181154',
  'js/zonas/lecciones.js?v=20261123-181154',
  'js/mundo/personaje.js?v=20261123-181154',
  'js/mundo/vecinos.js?v=20261123-181154',
  'js/mundo/mundo.js?v=20261123-181154',
  'js/mundo/caminos.js?v=20261123-181154',
  'js/mundo/ampliacion.js?v=20261123-181154',
  'js/zonas/casa/jardin.js?v=20261123-181154',
  'js/nucleo/maestrias.js?v=20261123-181154',
  'js/zonas/casa/interior.js?v=20261123-181154',
  'js/zonas/telar/niveles.js?v=20261123-181154',
  'js/mundo/pueblo-compartido.js?v=20261123-181154',
  'js/nucleo/codigos.js?v=20261123-181154',
  'js/zonas/casa/pizarra.js?v=20261123-181154',
  'js/zonas/casa/pecera.js?v=20261123-181154',
  'js/zonas/tablon/corcho.js?v=20261123-181154',
  'js/zonas/sugerencias.js?v=20261123-181154',
  'js/zonas/recintos.js?v=20261123-181154',
  'js/nucleo/musica.js?v=20261123-181154',
  'js/mundo/noche.js?v=20261123-181154',
  'js/alcalde/paseo.js?v=20261123-181154',
  'js/alcalde/distancia.js?v=20261123-181154',
  'js/nucleo/instalacion.js?v=20261123-181154',
  'js/nucleo/mezcla.js?v=20261123-181154',
  'js/zonas/huerto/robot.js?v=20261123-181154',
  'js/zonas/huerto/robot-pantalla.js?v=20261123-181154',
  'js/nucleo/paquetes.js?v=20261123-181154',
  'paquetes/gaceta.js?v=20261123-181154',
  'paquetes/navidad.js?v=20261123-181154',
  'paquetes/navidad-tienda.js?v=20261123-181154',
  'paquetes/navidad-belen-piezas.js?v=20261123-181154',
  'paquetes/navidad-belen.js?v=20261123-181154',
  'paquetes/navidad-adviento.js?v=20261123-181154',
  'paquetes/navidad-extras.js?v=20261123-181154',
  'paquetes/navidad-reyes.js?v=20261123-181154',
  'paquetes/otra-orilla.js?v=20261123-181154',
  'paquetes/huerto.js?v=20261123-181154',
  'paquetes/huerto-pantalla.js?v=20261123-181154',
  'js/nucleo/catalogo.js?v=20261123-181154',
  'js/inicio.js?v=20261123-181154',
  'iconos/apple-touch-icon.png',
  'iconos/favicon-64.png',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-maskable-512.png',
  'fuentes/baloo-2-latin-500-normal.woff2',
  'fuentes/baloo-2-latin-600-normal.woff2',
  'fuentes/baloo-2-latin-700-normal.woff2',
  'fuentes/baloo-2-latin-800-normal.woff2',
  'fuentes/caveat-latin-600-normal.woff2',
  'fuentes/caveat-latin-700-normal.woff2',
  'fuentes/patrick-hand-latin-400-normal.woff2',
// LISTA-FIN
];
const CACHE = 'villaovillo-' + VERSION;

self.addEventListener('install', e => {
  // cache:'reload' salta la memoria temporal del navegador: así nunca se guarda una pieza vieja con la versión nueva.
  // Después se comprueba que la página guardada es de esta versión; si no, la instalación falla y se reintenta más tarde.
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(PIEZAS.map(u => new Request(u, { cache: 'reload' })))
      .then(() => c.match('index.html')).then(r => r.text())
      .then(t => { if (!t.includes('content="' + VERSION + '"')) throw new Error('página de otra versión'); }))
    .catch(err => caches.delete(CACHE).then(() => { throw err; })));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('villaovillo-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'actualizar') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;                       // la nube usa POST: siempre por internet
  if (new URL(r.url).origin !== location.origin) return; // nada de fuera
  if (r.mode === 'navigate') {                          // el juego o el panel, con o sin ?prueba
    e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true })
      .then(hit => hit || fetch(r).catch(() => c.match('./')))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(r).then(hit => hit || fetch(r))));
});
