"""Crea una partida de muestra jugando con una versión del juego (sirve también con versiones antiguas).

Uso:  python3 pruebas/hacer_partida.py <ruta a index.html> <salida.json>
Juega unos minutos con dos niñas (telar, panadería, biblioteca, tienda, tareas, jardín, puente…) usando solo
lo que exista en esa versión, y guarda la partida tal como queda en la tablet. Las partidas de pruebas/partidas/
se hicieron así con versiones publicadas antes; pruebas/reglas.py comprueba que la versión actual las abre sin perder nada.
"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
SEED = """(()=>{ let a=4242; Math.random=function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  window.requestAnimationFrame=()=>0; })();"""
JUEGA = r"""async()=>{
  const W=ms=>new Promise(r=>setTimeout(r,ms)); const ok=f=>typeof window[f]==='function'||(()=>{ try{ return typeof eval(f)==='function'; }catch(e){ return false; } })();
  const T=async(f)=>{ try{ await f(); }catch(e){ log.push(String(e).slice(0,80)); } };
  const log=[];
  window.__auto=setInterval(()=>{ const b=document.querySelectorAll('#dlg.on .dlgbtns button'); if(b.length) b[b.length-1].click(); },20);
  DB.profiles[0]=newProfile('Berta',9,'#4a8fdc'); DB.profiles[1]=newProfile('Cintia',6,'#e4574f');
  DB.profiles.forEach((p,i)=>{ p.code=i?'2222':'1111'; p.met=true; });
  if(ok('saveQuiet')) saveQuiet(); else save();
  for(const dia of [0,1,2]){
    DB.dayOffset=dia;
    for(const i of [0,1]){
      await T(async()=>{ await enterGame(i); }); await W(250);
      const p=P();
      await T(async()=>{ if(ok('ensureDaily')) ensureDaily(p); for(const e of (window.ENC||eval('ENC')).slice(0,3)){ openPuzzle(e); await W(40); PZ.attempts=1; await success(); await W(200); } });
      await T(async()=>{ openBakery(); await W(80); if(ok('empezarTurno')&&curScreen!=='bakery-q'){ try{ empezarTurno(); }catch(e){} await W(80); }
        const MZx=()=>eval('MZ'); for(let k=0;k<12&&MZx()&&MZx().i<MZx().qs.length;k++){ const q=MZx().qs[MZx().i]; const i0=MZx().i; await answerMath(k%4===3?(q.a+1):q.a); for(let w=0;w<40&&MZx().i===i0;w++) await W(20); } await W(300); });
      await T(async()=>{ const c=cuadernosFor(p)[0]; if(!c) return; startQuiz(c); await W(80); const LQx=()=>eval('LQ'); for(let k=0;k<12&&LQx()&&LQx().i<LQx().qs.length;k++){ const q=LQx().qs[LQx().i].q; const i0=LQx().i; answerQuiz(q.t==='ordenar'?q.items.slice():q.a); for(let w=0;w<50&&LQx().i===i0;w++) await W(20); } await W(300); });
      await T(async()=>{ if(!ok('temasFor')) return; const t=temasFor(p)[0]; if(!t) return; startLeccion(t); await W(80); const LQx=()=>eval('LQ'); for(let k=0;k<8&&LQx()&&LQx().i<LQx().qs.length;k++){ const q=LQx().qs[LQx().i].q; const i0=LQx().i; answerQuiz(q.t==='ordenar'?q.items.slice():q.t==='vf'?q.a:q.a); for(let w=0;w<50&&LQx().i===i0;w++) await W(20); } await W(400); });
      await T(async()=>{ if(ok('waterGarden')) { await waterGarden(); await W(150); } });
      await T(async()=>{ p.coins+=300; openShop(); await W(80); const bb=[...document.querySelectorAll('#shopgrid button.btn.green, #shopgrid button.btn')].filter(b=>!b.disabled); if(bb[dia]) bb[dia].click(); await W(150); });
      await T(async()=>{ if(ok('localMsgs')){ localMsgs().push({id:'L'+dia+'-'+i,para:p.id,tipo:'casa',texto:'Recoger el cuarto',premio:10,estado:'nuevo',t:Date.now()}); const m=localMsgs().find(x=>x.id==='L'+dia+'-'+i); setMsgState(m,'hecha'); await W(40); validateMsg(m); await W(150); } });
      await T(async()=>{ if(ok('corkPonNota')) await corkPonNota('¡Hola desde '+p.name+' '+dia+'!'); });
      await T(async()=>{ p.bridge=(p.bridge||0)+20; });
      await T(async()=>{ if(ok('saveQuiet')) saveQuiet(); else save(); show('profiles'); });
      await W(150);
    }
  }
  clearInterval(window.__auto);
  if(ok('saveQuiet')) saveQuiet(); else save();
  const st={}; for(let k=0;k<localStorage.length;k++){ const n=localStorage.key(k); if(n.startsWith('villaovillo')) st[n]=localStorage.getItem(n); }
  return {st,log}; }"""
async def main(path, outp):
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1180, 'height': 820})
        await ctx.add_init_script(SEED)
        pg = await ctx.new_page()
        await pg.clock.set_fixed_time('2026-11-17T18:00:00+01:00')
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:120]))
        await pg.route('**/*googleapis*/**', lambda r: r.abort()); await pg.route('**/*gstatic*/**', lambda r: r.abort())
        await pg.goto('file://' + os.path.abspath(path) + '?prueba'); await pg.wait_for_timeout(800)
        r = await pg.evaluate(JUEGA)
        await b.close()
    st = r['st']; key = max((k for k in st if st[k].startswith('{') and '"profiles"' in st[k]), key=lambda k: (('prueba' in k), len(st[k])))
    db = json.loads(st[key])
    with open(outp, 'w') as f: json.dump(db, f, ensure_ascii=False)
    print(os.path.basename(outp), '| clave', key, '| botones', [p and p.get('coins') for p in db['profiles']], '| fallos', len(errs), errs[:2], '| avisos', r['log'][:3])
asyncio.run(main(*sys.argv[1:]))
