"""Recorrido completo: abre todas las pantallas con el pueblo en marcha y falla si hay algún error.

Uso:  python3 pruebas/recorrido.py [ruta a index.html]  (también prueba &noche y la Navidad, de día y de noche)
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASOS = [
 "DB.profiles[0]=newProfile('Berta',9,'#4a8fdc'); DB.profiles[1]=newProfile('Cintia',6,'#e4574f'); DB.profiles.forEach(p=>{p.met=true;p.code='1111';}); saveQuiet(); show('profiles'); renderProfiles()",
 "enterGame(0)", "player.tx=900; player.ty=700; player.moving=true", "openWorkshop()", "openPuzzle(ENC[0])",
 "openBakery()", "openLibrary()", "openShop()", "openHouse(DB.cur)", "openNews()",
 "P().coins=2000; P().days.count=20; P().inv.fu_pecera=1; openAqua(P())", "openBoardView(DB.profiles[0])",
 "renderBoard(); show('board')", "boardCards().forEach(c=>{ openPaper(c); closePaper(); }); openPaper(boardCards()[0])", "closePaper()", "renderAlcalde(); show('alcalde')", "openFicha(DB.profiles[0])", "startVisit(1)", "endVisit()",
 "renderCatalog(); show('catalog')", "show('village')",
 "if(typeof openArbolNav==='function'&&paqActivo(NAV)){ P().coins=500; void openArbolNav(); }", "if(typeof navPoner==='function'&&paqActivo(NAV)) void navPoner(NAV_ADORNOS[0])", "show('village')",
 "if(typeof NAV!=='undefined'&&paqActivo(NAV)){ openShop(); shopTab='navidad'; renderShop(); document.querySelectorAll('#shopgrid button.btn.green').forEach(b=>{ if(!b.disabled) b.click(); }); }",
 "if(typeof NAV!=='undefined'&&paqActivo(NAV)){ const p=P(), R=roomOf(p); FURN.filter(f=>f.paq&&p.inv['fu_'+f.k]).forEach((f,i)=>{ if(f.z==='wall') R.wl[i%6]='fu_'+f.k; else R.fl[i]='fu_'+f.k; }); houseView='room'; openHouse(DB.cur); }", "show('village')",
 "if(typeof openBelen==='function'&&paqActivo(NAV)){ const p=P(); p.coins=500; openBelen(p,'pueblo'); BL_GRUPOS.forEach(([g])=>{ BL.tab=g; blPanel(); }); const b=blDatos(p); BL_PIEZAS.forEach(x=>{ b.own[x.id]=1; b.esc.push({i:x.id,x:450,y:400}); }); BL.sel=0; blHerramientas(); b.foto=today(); }",
 "if(typeof openBelen==='function'&&paqActivo(NAV)&&DB.profiles[1]) openBelen(DB.profiles[1]===P()?DB.profiles[0]:DB.profiles[1],'pueblo')", "openBoard()", "show('village')",
 "if(typeof openAdviento==='function'&&paqActivo(NAV)){ const p=P(); logAct(p,'t',1,1,'seq'); logAct(p,'b',1,1,'x'); logAct(p,'p',1,1); void openAdviento(p); }", "if(typeof advAbrir==='function'&&paqActivo(NAV)) void advAbrir(P(),advPendiente(P())||1)",
 "if(typeof openCartaReyes==='function'&&paqActivo(NAV)) void openCartaReyes()", "show('village')",
 "if(typeof navTurnoNavidad==='function'&&paqActivo(NAV)){ openBakery(); navTurnoNavidad(); }", "show('village')",
 "if(typeof navEntregas==='function'&&paqActivo(NAV)){ NAV.ordenes.premio(P(),NAV_PREMIOS[0]); NAV.ordenes.reyes(P(),{r:'nav_bici',b:10,m:'hola'}); renderAlcalde(); }",
 "if(typeof ADV_REGALOS!=='undefined'&&paqActivo(NAV)){ const p=P(); for(let d=1;d<=24;d++) ADV_REGALOS[d](p); const R=roomOf(p); R.wl[2]='fu_nav_adviento'; R.pat='nav_papel'; R.fl[2]='fu_nav_alfombra'; R.fl[3]='fu_nav_musica'; houseView='room'; openHouse(DB.cur); }", "show('village')",
]
async def main(path):
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        fallos = 0
        for extra in ['', '&noche', '&fecha=2026-12-10', '&fecha=2026-12-10&noche']:  # también en Navidad
            pg = await b.new_page(viewport={'width': 1180, 'height': 820})
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/*googleapis*/**', lambda r: r.abort())
            await pg.goto('file://' + os.path.abspath(path) + '?prueba' + extra)
            await pg.evaluate("()=>{ window.__auto=setInterval(()=>{ const b=document.querySelectorAll('#dlg.on .dlgbtns button'); if(b.length) b[b.length-1].click(); },60); }")
            for js in PASOS:
                try:
                    await pg.evaluate('()=>{ ' + js + '; return 0; }')
                except Exception as e:
                    errs.append(f'{js}: {e}')
                await pg.wait_for_timeout(450)
            await pg.screenshot(path='/tmp/recorrido' + extra.replace('&', '_') + '.png')
            print((extra or 'día') + ':', 'sin errores' if not errs else errs)
            fallos += len(errs)
            await pg.close()
        await b.close()
        sys.exit(1 if fallos else 0)
asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, 'index.html')))
