"""Pone un número de versión nuevo en todas las piezas que carga index.html.

Ejecútalo antes de cada publicación:  python3 herramientas/version.py
Así la tablet nunca mezcla archivos de una versión con los de otra.
También comprueba que cada archivo de js/ está en la lista de carga y que todo lo que se carga existe.
"""
import re, os, sys, datetime

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(RAIZ, 'index.html')

html = open(INDEX, encoding='utf-8').read()
v = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
html2, n = re.subn(r'\?v=[0-9A-Za-z\-]+"', f'?v={v}"', html)

cargados = re.findall(r'(?:src|href)="([^"?]+\.(?:js|css))\?v=', html2)
faltan = [c for c in cargados if not os.path.exists(os.path.join(RAIZ, c))]
en_disco = []
for base, _, files in [w for d in ('js', 'paquetes') for w in os.walk(os.path.join(RAIZ, d))]:
    for f in files:
        if f.endswith('.js'):
            en_disco.append(os.path.relpath(os.path.join(base, f), RAIZ).replace(os.sep, '/'))
sin_cargar = sorted(set(en_disco) - set(cargados))
repetidos = sorted({c for c in cargados if cargados.count(c) > 1})

if faltan or sin_cargar or repetidos:
    print('ERROR')
    if faltan: print('  Se cargan pero no existen:', faltan)
    if sin_cargar: print('  Existen pero no se cargan:', sin_cargar)
    if repetidos: print('  Se cargan dos veces:', repetidos)
    sys.exit(1)

open(INDEX, 'w', encoding='utf-8').write(html2)
print(f'Versión {v} en {n} piezas.')
