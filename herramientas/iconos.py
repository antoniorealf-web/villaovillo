"""Dibuja los iconos del juego a partir de iconos/icono-fuente.html (un dibujo SVG).

Uso:  python3 herramientas/iconos.py
"""
import asyncio, os
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(RAIZ, 'iconos')
# (archivo, tamaño en píxeles, escala del dibujo, esquinas redondeadas)
# El «maskable» lleva el dibujo más pequeño porque Android recorta el borde con la forma que quiera.
JOBS = [('icono-512.png', 512, 1.0, 0), ('icono-192.png', 192, 1.0, 0), ('icono-maskable-512.png', 512, 0.8, 0),
        ('apple-touch-icon.png', 180, 0.92, 0), ('favicon-64.png', 64, 1.0, 14)]

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 512, 'height': 512})
        await pg.goto('file://' + os.path.join(OUT, 'icono-fuente.html'))
        for name, size, sc, rad in JOBS:
            await pg.evaluate(f"""()=>{{ const s=document.getElementById('ic'); s.setAttribute('width',{size}); s.setAttribute('height',{size});
              document.getElementById('dibujo').setAttribute('transform','translate({256*(1-sc)} {256*(1-sc)}) scale({sc})');
              s.style.borderRadius='{rad}px'; }}""")
            await pg.set_viewport_size({'width': size, 'height': size})
            await pg.locator('#ic').screenshot(path=os.path.join(OUT, name), omit_background=True)
        await b.close()
    print('Iconos dibujados en', OUT)

asyncio.run(main())
