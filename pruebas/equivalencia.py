"""Prueba de equivalencia: juega una sesión fija (azar y hora fijados) y guarda el resultado.

Uso:  python3 pruebas/equivalencia.py <ruta a index.html> <salida.json> [carpeta de capturas]
Dos versiones del juego son equivalentes si producen el mismo .json (compara con `cmp`).
"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright

CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
SEED = """(()=>{ let a=12345; Math.random=function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  window.requestAnimationFrame=()=>0; })();"""

SCENARIO = r"""async()=>{
  const W=ms=>new Promise(r=>setTimeout(r,ms));
  window.__auto=setInterval(()=>{ const b=document.querySelectorAll('#dlg.on .dlgbtns button'); if(b.length) b[b.length-1].click(); },20);
  const out={snap:{}};
  DB.profiles[0]=newProfile('Berta',9,'#4a8fdc'); DB.profiles[1]=newProfile('Cintia',6,'#e4574f');
  DB.profiles.forEach((p,i)=>{ p.code=i?'2222':'1111'; }); saveQuiet();
  for(const i of [0,1]){
    await enterGame(i); await W(300);
    const p=P(); ensureDaily(p);
    for(const e of ENC.slice(0,3)){ openPuzzle(e); await W(50); PZ.attempts=1; await success(); await W(250); }
    openBakery(); await W(100);
    while(curScreen==='bakery'&&MZ&&MZ.i<MZ.qs.length){ const q=MZ.qs[MZ.i]; const i0=MZ.i; await answerMath(q.a); for(let w=0;w<40&&MZ.i===i0&&curScreen==='bakery';w++) await W(25); }
    await W(400);
    const c=cuadernosFor(p)[0];
    if(c){ startQuiz(c); await W(100); while(curScreen==='quiz'&&LQ&&LQ.i<LQ.qs.length){ const q=LQ.qs[LQ.i].q; const i0=LQ.i; answerQuiz(q.t==='ordenar'?q.items.slice():q.a); for(let w=0;w<60&&LQ.i===i0&&curScreen==='quiz';w++) await W(25); } await W(400); }
    if(typeof waterGarden==='function'){ try{ await waterGarden(); }catch(e){} await W(200); }
    p.coins+=500; openShop(); await W(100); const bb=[...document.querySelectorAll('#shopgrid button.btn.green')].filter(b=>!b.disabled); if(bb[0]) bb[0].click(); await W(200);
    localMsgs().push({id:'Ltest'+i,para:p.id,tipo:'casa',texto:'Recoger el cuarto',premio:10,estado:'nuevo'});
    const m=localMsgs().find(x=>x.id==='Ltest'+i); setMsgState(m,'hecha'); await W(50); validateMsg(m); await W(200);
    out.snap['board'+i]=(()=>{ renderBoard(); return document.querySelector('#scr-board, #scr-tablon')?.innerText||''; })();
    show('profiles'); await W(100);
  }
  DB.dayOffset=1; saveQuiet(); await enterGame(0); await W(400);
  openBakery(); await W(100); out.snap.bakeryQ=MZ.qs.map(q=>q.q+'='+q.a).join('|'); show('village');
  renderProfiles(); out.snap.profiles=document.querySelector('#scr-profiles').innerText;
  renderAlcalde(); out.snap.alcalde=document.querySelector('#scr-alcalde').innerText;
  try{ openFicha(0); await W(150); out.snap.ficha=document.querySelector('#dlg').innerText; document.querySelector('#dlg').classList.remove('on'); }catch(e){ out.snap.ficha='ERR '+e; }
  renderShop(); out.snap.shop=document.querySelector('#shopgrid').innerText;
  out.report=buildReport();
  clearInterval(window.__auto);
  const db=JSON.parse(JSON.stringify(DB));
  db.profiles.forEach(p=>{ if(p) delete p.updatedAt; });
  out.db=db; out.keys=Object.keys(localStorage).sort();
  return out; }"""

async def main(path, outp, shots=None):
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1180, 'height': 820})
        await ctx.add_init_script(SEED)
        pg = await ctx.new_page()
        await pg.clock.set_fixed_time('2026-11-20T17:30:00+01:00')
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/*googleapis*/**', lambda r: r.abort())
        await pg.route('**/*gstatic*/**', lambda r: r.abort())
        await pg.goto('file://' + os.path.abspath(path) + '?prueba')
        res = await pg.evaluate(SCENARIO)
        res['errores'] = errs
        if shots:
            os.makedirs(shots, exist_ok=True)
            for name, js in [('perfiles', "show('profiles'); renderProfiles()"), ('alcalde', "renderAlcalde(); show('alcalde')"),
                             ('panaderia', "openBakery()"), ('tienda', "openShop()"), ('catalogo', "renderCatalog(); show('catalog')"),
                             ('telar', "openPuzzle(genEncargo({age:9,unlocked:3,tlvForce:5},'eq','catalog','c1','cab'),{age:9})")]:
                await pg.evaluate('()=>{ document.querySelector("#dlg").classList.remove("on"); ' + js + ' }')
                await pg.wait_for_timeout(300)
                await pg.screenshot(path=f'{shots}/{name}.png')
        await b.close()
    with open(outp, 'w') as f:
        json.dump(res, f, ensure_ascii=False, indent=1, sort_keys=True)
    print('errores:', errs, '| bytes:', os.path.getsize(outp))

asyncio.run(main(*sys.argv[1:]))
