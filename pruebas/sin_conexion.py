"""Prueba del juego instalable: abre sin internet y pone las versiones nuevas al volver a la pantalla de inicio.

Uso:  python3 pruebas/sin_conexion.py
Copia el juego a una carpeta temporal, lo sirve en http://localhost:8765/villaovillo/ y simula publicar versiones.
"""
import asyncio, os, re, shutil, subprocess, sys, tempfile, time
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = tempfile.mkdtemp(); COPIA = os.path.join(TMP, 'villaovillo')
shutil.copytree(RAIZ, COPIA, ignore=shutil.ignore_patterns('.git'))
U = 'http://localhost:8765/villaovillo/'
IDX = os.path.join(COPIA, 'index.html')
ver = lambda: re.search(r'villa-version" content="([^"]+)"', open(IDX).read()).group(1)
def publicar():
    time.sleep(1.1)
    subprocess.run([sys.executable, os.path.join(COPIA, 'herramientas', 'version.py')], stdout=subprocess.DEVNULL, check=True)
    return ver()
CERRAR = "setInterval(()=>{ const b=document.querySelectorAll('#dlg.on .dlgbtns button'); if(b.length) b[b.length-1].click(); },100);"

async def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765'], cwd=TMP, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    fallos = []
    def ok(cond, txt): print(('OK      ' if cond else 'FALLO   ') + txt); (None if cond else fallos.append(txt))
    try:
        time.sleep(0.8)
        async with async_playwright() as pw:
            b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
            ctx = await b.new_context(viewport={'width': 1180, 'height': 820}); pg = await ctx.new_page()
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(U + '?prueba'); await pg.evaluate('navigator.serviceWorker.ready'); await pg.wait_for_timeout(800)
            await pg.reload(); await pg.wait_for_function('SW.reg')
            cdp = await ctx.new_cdp_session(pg)
            inst = [e['errorId'] for e in (await cdp.send('Page.getInstallabilityErrors')).get('installabilityErrors', []) if e['errorId'] != 'in-incognito']
            ok(not inst, 'el navegador lo acepta como aplicación instalable ' + (str(inst) if inst else ''))
            await ctx.set_offline(True)
            for url in [U, U + '?prueba', U + 'panel.html']:
                await pg.goto(url); await pg.wait_for_timeout(600)
                ok('Villaovillo' in await pg.title(), 'abre sin internet: ' + url.replace(U, '/'))
            await pg.goto(U + '?prueba'); await pg.wait_for_timeout(600)
            r = await pg.evaluate("async()=>{ " + CERRAR + " DB.profiles[0]=newProfile('Berta',9,'#4a8fdc'); DB.profiles[0].met=true; DB.cur=0; saveQuiet(); openBakery(); await document.fonts.load(\"20px 'Patrick Hand'\"); return curScreen==='bakery'&&MZ.qs.length>0&&document.fonts.check(\"20px 'Patrick Hand'\"); }")
            ok(r, 'se juega sin internet y las letras manuscritas cargan')
            await ctx.set_offline(False)
            v0 = await pg.evaluate('VILLA_VERSION')
            await pg.evaluate("show('village')")
            v1 = publicar()
            await pg.evaluate('SW.reg.update()'); await pg.wait_for_function('SW.reg.waiting', timeout=20000)
            await pg.evaluate('swTick()'); await pg.wait_for_timeout(1500)
            ok(await pg.evaluate('VILLA_VERSION') == v0, 'una versión nueva no se pone mientras juegan')
            await pg.evaluate("show('profiles'); swTick()")
            await pg.wait_for_function(f"typeof VILLA_VERSION!=='undefined' && VILLA_VERSION==='{v1}'", timeout=15000)
            ok(await pg.evaluate("!!(DB.profiles[0]&&DB.profiles[0].name==='Berta')"), 'al volver al inicio se pone la nueva y la partida sigue')
            v2 = publicar(); await pg.close(); pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(U + '?prueba')
            try:
                await pg.wait_for_function(f"typeof VILLA_VERSION!=='undefined' && VILLA_VERSION==='{v2}'", timeout=25000); ok(True, 'publicada con la tablet cerrada: se pone al abrir')
            except Exception:
                ok(False, 'publicada con la tablet cerrada: se pone al abrir')
            ok(not errs, 'sin errores ' + (str(errs) if errs else ''))
            await b.close()
    finally:
        srv.terminate(); shutil.rmtree(TMP, ignore_errors=True)
    sys.exit(1 if fallos else 0)

asyncio.run(main())
