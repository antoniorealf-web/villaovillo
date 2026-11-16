"""Comprobaciones de los fallos de la revisión global (noviembre 2026).

Uso:  python3 pruebas/revision.py
Informa del estado de cada fallo (OK o PENDIENTE) para saber qué sigue roto.
"""
import asyncio, os
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHECKS = {
 'F2 dinero sin resultados negativos ni cero': """()=>{ let bad=0; for(const [age,f] of [[6,'dinero'],[6,''],[9,'dinero'],[9,'']]) for(let i=0;i<5000;i++){ const q=genMath({age,mathFocus:f,panLv:3,mastery:{pan:400}}); if(typeof q.a==='number'&&(q.a<=0&&q.k!=='contar'||!Number.isInteger(q.a))) bad++; } return bad===0; }""",
 'F5 el personaje no pisa el lago': """()=>{ show('village'); player.x=player.tx=480; player.y=player.ty=1440; handleWorldTap(930,1440); let wet=0; for(let i=0;i<400;i++){ update(0.03); if(inPond(player.x,player.y)) wet++; } return wet===0; }""",
 'F3 repetir un cuaderno el mismo día no lo da por sabido': """async()=>{ const p=P(); const c=cuadernosFor(p)[0];
   for(let k=0;k<5;k++){ startQuiz(c); while(curScreen==='quiz'&&LQ&&LQ.i<LQ.qs.length){ const q=LQ.qs[LQ.i].q; const i0=LQ.i; answerQuiz(q.t==='ordenar'?q.items.slice():q.a); for(let w=0;w<60&&LQ.i===i0&&curScreen==='quiz';w++) await new Promise(r=>setTimeout(r,40)); } await new Promise(r=>setTimeout(r,400)); }
   return Math.max(...Object.values(p.sr).map(s=>s.b))<3; }""",
 'F4 repetir un encargo hecho no sube la maestría': """async()=>{ const p=P(); p.days.last=today(); ensureDaily(p); const e=ENC[0]; const r=[];
   for(let k=0;k<3;k++){ openPuzzle(e); PZ.prog.main=PZ.target.slice(); PZ.attempts=1; await success(); await new Promise(r=>setTimeout(r,250)); r.push(p.mastery.telar); }
   return r[2]===r[0]; }""",
}

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        for name, js in CHECKS.items():
            pg = await b.new_page(viewport={'width': 1180, 'height': 820})
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/*googleapis*/**', lambda r: r.abort())
            await pg.goto('file://' + os.path.join(RAIZ, 'index.html') + '?prueba')
            await pg.evaluate("""()=>{ DB.profiles[0]=newProfile('Berta',9,'#4a8fdc'); DB.profiles[1]=newProfile('Cintia',6,'#e4574f'); DB.profiles.forEach(p=>{p.met=true;p.code='1111';}); DB.cur=0; saveQuiet();
              window.__auto=setInterval(()=>{ const b=document.querySelectorAll('#dlg.on .dlgbtns button'); if(b.length) b[b.length-1].click(); },50); }""")
            ok = await pg.evaluate(js)
            print(('OK        ' if ok else 'PENDIENTE ') + name + ('  · errores: ' + str(errs) if errs else ''))
            await pg.close()
        await b.close()
asyncio.run(main())
