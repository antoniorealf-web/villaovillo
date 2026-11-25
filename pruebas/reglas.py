"""Pruebas de las reglas que nunca se pueden romper.

Uso:  python3 pruebas/reglas.py [ruta a index.html]

1. Partidas antiguas: abre cada partida de pruebas/partidas/ (hechas con versiones publicadas antes) y comprueba
   que no se pierde ni cambia nada de lo guardado: todo lo que había sigue igual (solo se pueden AÑADIR campos nuevos).
   Después entra con cada niña, recorre las pantallas, guarda y vuelve a abrir: lo guardado se lee igual.
2. Paseo del alcalde: papá pasea, entra en todos los edificios, casas, fichas y encargos de las dos niñas
   y, al salir, las partidas están exactamente como estaban.
3. Dos tablets: cada una cambia cosas del pueblo (notas, tareas, ideas, día y noche); al juntarse
   las dos acaban iguales, no se pierde nada de ninguna, juntar otra vez no cambia nada y no se toca el progreso de las niñas.
Falla (código de salida 1) si alguna regla no se cumple.
"""
import asyncio, json, sys, os, glob
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = 'villaovillo.prueba'
SIN_DIALOGOS = "()=>{ window.__auto=setInterval(()=>{ const b=document.querySelectorAll('#dlg.on .dlgbtns button'); if(b.length) b[b.length-1].click(); },25); }"

def diferencias(viejo, nuevo, ruta=''):
    """Todo lo que había en `viejo` tiene que seguir igual en `nuevo` (nuevo puede tener campos de más)."""
    out = []
    if isinstance(viejo, dict):
        if not isinstance(nuevo, dict): return [ruta + ' ya no es un objeto']
        for k, v in viejo.items():
            if k not in nuevo: out.append(ruta + '.' + k + ' ha desaparecido')
            else: out += diferencias(v, nuevo[k], ruta + '.' + k)
    elif isinstance(viejo, list) and isinstance(nuevo, list):
        if len(nuevo) < len(viejo): out.append(f'{ruta} tenía {len(viejo)} elementos y ahora {len(nuevo)}')
        for i, v in enumerate(viejo[:len(nuevo)]): out += diferencias(v, nuevo[i], f'{ruta}[{i}]')
    elif viejo != nuevo:
        out.append(f'{ruta}: {json.dumps(viejo, ensure_ascii=False)[:60]} → {json.dumps(nuevo, ensure_ascii=False)[:60]}')
    return out

async def pagina(b, path, partida=None):
    ctx = await b.new_context(viewport={'width': 1180, 'height': 820})
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    await pg.route('**/*googleapis*/**', lambda r: r.abort()); await pg.route('**/*gstatic*/**', lambda r: r.abort())
    url = 'file://' + os.path.abspath(path) + '?prueba'
    if partida is not None:  # se abre una vez, se mete la partida en la tablet y se vuelve a abrir
        await pg.goto(url + '&carga'); await pg.wait_for_timeout(300)
        await pg.evaluate(f"()=>{{ localStorage.clear(); localStorage.setItem({json.dumps(KEY)}, {json.dumps(json.dumps(partida))}); }}")
    await pg.goto(url); await pg.wait_for_timeout(700)
    return ctx, pg, errs

async def guardado(pg):
    return json.loads(await pg.evaluate(f"()=>localStorage.getItem({json.dumps(KEY)})"))

async def partidas_antiguas(b, path):
    fallos = []
    for f in sorted(glob.glob(os.path.join(RAIZ, 'pruebas', 'partidas', '*.json'))):
        nombre = os.path.basename(f); vieja = json.load(open(f))
        ctx, pg, errs = await pagina(b, path, vieja)
        cargada = json.loads(await pg.evaluate("()=>JSON.stringify(DB)"))
        d = diferencias(vieja, cargada)
        if d: fallos.append(f'{nombre}: al abrirla cambia lo guardado: ' + '; '.join(d[:6]))
        # jugar un poco con cada niña, guardar y volver a abrir
        await pg.evaluate(SIN_DIALOGOS)
        await pg.evaluate("""async()=>{ const W=ms=>new Promise(r=>setTimeout(r,ms));
          for(const i of [0,1]){ await enterGame(i); await W(250); for(const f of ['openWorkshop','openBakery','openLibrary','openShop','openBoard','openNews']){ try{ window[f]?window[f]():eval(f+'()'); }catch(e){} await W(60); show('village'); }
            try{ openHouse(DB.cur); }catch(e){} await W(60); show('profiles'); await W(80); } saveQuiet(); }""")
        antes = await guardado(pg)
        await pg.reload(); await pg.wait_for_timeout(700)
        despues = json.loads(await pg.evaluate("()=>JSON.stringify(DB)"))
        d = diferencias(antes, despues)
        if d: fallos.append(f'{nombre}: tras guardar y volver a abrir cambia: ' + '; '.join(d[:6]))
        # lo que había al principio sigue ahí después de jugar (botones, medallas, compras… solo pueden crecer)
        for i, (pv, pn) in enumerate(zip(vieja['profiles'], despues['profiles'])):
            if not pv: continue
            if pn is None: fallos.append(f'{nombre}: ha desaparecido la niña {i}'); continue
            for k in ['id', 'name', 'age', 'color', 'code']:
                if pv.get(k) != pn.get(k): fallos.append(f'{nombre}: {pv.get("name")} cambia {k}')
            for k in ['done', 'inv', 'medals', 'mastery']:
                for kk, vv in (pv.get(k) or {}).items():
                    if kk not in (pn.get(k) or {}): fallos.append(f'{nombre}: {pv.get("name")} pierde {k}.{kk}')
            if (pn.get('counters') or {}).get('earned', 0) < (pv.get('counters') or {}).get('earned', 0): fallos.append(f'{nombre}: bajan los botones ganados')
        if errs: fallos.append(f'{nombre}: errores {errs[:2]}')
        print(('✅' if not any(x.startswith(nombre) for x in fallos) else '❌'), 'Partida antigua', nombre)
        await ctx.close()
    return fallos

async def paseo_alcalde(b, path):
    fallos = []
    ultima = json.load(open(sorted(glob.glob(os.path.join(RAIZ, 'pruebas', 'partidas', '*.json')))[-1]))
    ctx, pg, errs = await pagina(b, path, ultima)
    await pg.evaluate(SIN_DIALOGOS)
    await pg.evaluate("()=>saveQuiet()")  # lo que añade migrate() al abrir una partida antigua se guarda antes de empezar (no es cosa del paseo)
    antes = await guardado(pg); antesDB = json.loads(await pg.evaluate("()=>JSON.stringify(DB.profiles)"))
    await pg.evaluate("""async()=>{ const W=ms=>new Promise(r=>setTimeout(r,ms));
      renderAlcalde(); show('alcalde'); await W(100);
      for(const i of [0,1]){
        startVisit(i); await W(150);
        for(const e of EDIFICIOS){ if(e.alcalde){ try{ await e.alcalde({}); }catch(err){} await W(80); document.querySelector('#dlg').classList.remove('on'); } }
        try{ DB.cur=i; openVTaller(); await W(100); }catch(e){}
        try{ openFicha(); await W(100); openFicha('pan'); await W(60); openFicha('bib'); await W(60); }catch(e){}
        for(const j of [0,1]){ try{ openHouse(j); await W(120); }catch(e){} }
        show('village'); for(let y=200;y<1600;y+=180) for(let x=200;x<2400;x+=220){ try{ handleWorldTap(x,y); if(player.act){ const f=player.act; player.act=null; await f(); } }catch(e){} await W(15); show('village'); if(!VISIT) startVisit(i); }
        try{ drawVillage(); }catch(e){}
        endVisit(); await W(100);
      } }""")
    despues = await guardado(pg); despuesDB = json.loads(await pg.evaluate("()=>JSON.stringify(DB.profiles)"))
    if antes['profiles'] != despues['profiles']:
        fallos.append('El paseo del alcalde cambia las partidas guardadas: ' + '; '.join((diferencias(antes['profiles'], despues['profiles']) or ['(campos nuevos)'])[:6]))
    if antesDB != despuesDB:
        fallos.append('El paseo del alcalde cambia las partidas en memoria: ' + '; '.join((diferencias(antesDB, despuesDB) or ['(campos nuevos)'])[:6]))
    if errs: fallos.append(f'Paseo: errores {errs[:2]}')
    print('✅' if not fallos else '❌', 'Paseo del alcalde sin tocar las partidas')
    await ctx.close()
    return fallos

async def dos_tablets(b, path):
    fallos = []
    ultima = json.load(open(sorted(glob.glob(os.path.join(RAIZ, 'pruebas', 'partidas', '*.json')))[-1]))
    cA, A, eA = await pagina(b, path, ultima)
    cB, Bp, eB = await pagina(b, path, ultima)
    pidA = await A.evaluate("()=>DB.profiles[0].id"); pidB = await A.evaluate("()=>DB.profiles[1].id")
    perfA0 = await A.evaluate("()=>JSON.stringify(DB.profiles)"); perfB0 = await Bp.evaluate("()=>JSON.stringify(DB.profiles)")
    # tablet A (Berta): nota, tarea nueva y una tarea hecha
    await A.evaluate(f"""()=>{{ const t=Date.now();
      corkPonNota({{id:'nA',from:'Berta',fromId:'{pidA}',text:'Nota de la tablet A',t}});
      localMsgs().push({{id:'LA1',para:'{pidA}',tipo:'casa',texto:'Tarea en A',premio:10,estado:'nuevo',t}});
      const m=localMsgs()[0]; if(m) m.estado='hecha';
      saveQuiet(); }}""")
    # tablet B (Cintia): nota, idea en el buzón y día/noche
    await Bp.evaluate(f"""()=>{{ const t=Date.now()+5;
      corkPonNota({{id:'nB',from:'Cintia',fromId:'{pidB}',text:'Nota de la tablet B',t}});
      sugs().push({{id:'sB',de:'{pidB}',nombre:'Cintia',cat:'idea',texto:'Quiero un perro',t,leida:false}});
      localMsgs().push({{id:'LB1',para:'{pidB}',tipo:'deberes',texto:'Tarea en B',premio:5,estado:'nuevo',t}});
      DB.dayMode='noche'; DB.ajT=Date.now()+1000; saveQuiet(); }}""")
    pa = await A.evaluate("()=>JSON.stringify(puebloDatos())"); pb = await Bp.evaluate("()=>JSON.stringify(puebloDatos())")
    await A.evaluate(f"()=>mezclaPueblo(JSON.parse({json.dumps(pb)}))"); await Bp.evaluate(f"()=>mezclaPueblo(JSON.parse({json.dumps(pa)}))")
    ja = json.loads(await A.evaluate("()=>JSON.stringify(puebloDatos())")); jb = json.loads(await Bp.evaluate("()=>JSON.stringify(puebloDatos())"))
    for j in (ja, jb): j.pop('en', None)
    if ja != jb: fallos.append('Las dos tablets no acaban con el mismo pueblo: ' + '; '.join(diferencias(ja, jb)[:4]))
    notas = {n['id'] for n in ja['boardMsgs']}; msgs = {m['id']: m for m in ja['localMsgs']}
    for falta, cond in [('la nota de A', 'nA' in notas), ('la nota de B', 'nB' in notas), ('la tarea de A', 'LA1' in msgs), ('la tarea de B', 'LB1' in msgs),
                        ('la idea de B', any(s['id'] == 'sB' for s in ja['sugs'])), ('el ajuste de noche de B', ja['dayMode'] == 'noche')]:
        if not cond: fallos.append('Al juntar las tablets se pierde ' + falta)
    otra = await A.evaluate(f"""()=>{{ const q=()=>{{ const d=puebloDatos(); delete d.en; return JSON.stringify(d); }}; const a=q(); mezclaPueblo(JSON.parse({json.dumps(json.dumps(jb))})); return a!==q(); }}""")
    if otra: fallos.append('Juntar otra vez lo mismo vuelve a cambiar el pueblo')
    if await A.evaluate("()=>JSON.stringify(DB.profiles)") != perfA0 or await Bp.evaluate("()=>JSON.stringify(DB.profiles)") != perfB0:
        fallos.append('Juntar el pueblo toca el progreso de las niñas')
    if eA or eB: fallos.append(f'Dos tablets: errores {(eA + eB)[:2]}')
    print('✅' if not fallos else '❌', 'Dos tablets que juntan su pueblo')
    await cA.close(); await cB.close()
    return fallos

async def main(path):
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        fallos = await partidas_antiguas(b, path) + await paseo_alcalde(b, path) + await dos_tablets(b, path)
        await b.close()
    if fallos:
        print('\nFALLOS:'); [print(' -', f) for f in fallos]; sys.exit(1)
    print('\nTodas las reglas se cumplen.')

asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, 'index.html')))
