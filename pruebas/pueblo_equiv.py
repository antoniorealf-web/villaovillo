"""Equivalencia del pueblo: dibuja el pueblo en varios sitios (de día y de noche, normal y en el paseo del alcalde),
toca una rejilla de puntos y apunta qué pasa. Sirve para comprobar que un cambio en el pueblo no cambia nada.

Uso:  python3 pruebas/pueblo_equiv.py <ruta a index.html> <salida.json>
Dos versiones son equivalentes si producen el mismo .json (compara con `cmp`).
"""
import asyncio, json, sys, os, hashlib
from playwright.async_api import async_playwright

CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
SEED = """(()=>{ let a=777; Math.random=function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  window.requestAnimationFrame=()=>0; window.speechSynthesis=undefined; })();"""

SCENARIO = r"""async(modo)=>{
  const W=ms=>new Promise(r=>setTimeout(r,ms));
  const out={};
  DB.profiles[0]=newProfile('Berta',9,'#4a8fdc'); DB.profiles[1]=newProfile('Cintia',6,'#e4574f');
  DB.profiles.forEach((p,i)=>{ p.code=i?'2222':'1111'; p.met=true; }); DB.dayMode=modo; saveQuiet();
  window.__auto=setInterval(()=>{ const b=document.querySelectorAll('#dlg.on .dlgbtns button'); if(b.length) b[b.length-1].click(); },15);
  await enterGame(0); await W(300); show('village'); resizeVillage(); await W(100);
  // 1) qué puntos no se pueden pisar
  let bits=''; for(let y=0;y<WH;y+=10) for(let x=0;x<WW;x+=10) bits+=insideBuilding(x,y)?'1':'0';
  out.pisable=bits;
  // 2) dibujo del pueblo en varias posiciones de cámara (tiempo fijo)
  const huella=()=>{ const d=vctx.getImageData(0,0,vcanvas.width,vcanvas.height).data; let h=0; for(let i=0;i<d.length;i+=4){ h=(h*31+d[i]*7+d[i+1]*3+d[i+2])|0; } return h; };
  out.dibujo=[];
  for(const [px,py] of [[600,548],[1200,820],[1450,1200],[400,1000],[1750,400],[2150,700]]){
    player.x=px; player.y=py; player.tx=px; player.ty=py; player.path=null; player.moving=false; cam.ok=false; tGlobal=3.25;
    npcs.forEach((n,i)=>{ n.x=n.home[0]; n.y=n.home[1]; n.path=null; n.dir=1; n.moving=false; }); player.blinkT=1; player.dir=1; player.dustT=0; if(typeof dust!=='undefined') dust.length=0;
    butterflies.forEach((b,i)=>{ b.x=500+i*90; b.y=400+i*70; b.a=i; });
    drawVillage(); out.dibujo.push(huella());
  }
  // 3) mapa
  try{ openMap(); const cv=$('#mapcv'); const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let h=0; for(let i=0;i<d.length;i+=8) h=(h*31+d[i]+d[i+1]*3+d[i+2]*7)|0; out.mapa=h; $('#mapov').classList.remove('on'); }catch(e){ out.mapa='ERR '+e; }
  // 4) toques: dónde va y qué se abre
  const toca=async(x,y)=>{
    show('village'); player.x=600; player.y=548; player.path=null; player.act=null; player.moving=false; tapFx=null;
    document.querySelector('#dlg').classList.remove('on');
    npcs.forEach(n=>{ n.x=-999; n.y=-999; });
    handleWorldTap(x,y);
    const r={fx:tapFx?[Math.round(tapFx.x),Math.round(tapFx.y)]:null, dest:player.path&&player.path.length?player.path[player.path.length-1].map(Math.round):null};
    const dlgTxt=()=>{ const d=document.querySelector('#dlg.on'); return d?d.innerText.slice(0,80):''; };
    r.dlg0=dlgTxt();
    if(player.act){ const f=player.act; player.act=null; try{ await f(); }catch(e){ r.err=String(e); } await W(20); }
    r.scr=curScreen; r.dlg=dlgTxt();
    return r;
  };
  out.toques={};
  for(let y=100;y<1600;y+=45) for(let x=60;x<2400;x+=55){ out.toques[x+','+y]=JSON.stringify(await toca(x,y)); }
  // 5) paseo del alcalde
  show('village'); startVisit(0); await W(100);
  out.alcalde={};
  for(let y=100;y<1600;y+=90) for(let x=60;x<2400;x+=110){ out.alcalde[x+','+y]=JSON.stringify(await toca(x,y)); if(!VISIT) startVisit(0); }
  endVisit();
  clearInterval(window.__auto);
  return out; }"""

async def main(path, outp):
    res = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
        for modo in ['dia', 'noche']:
            ctx = await b.new_context(viewport={'width': 1180, 'height': 820}, device_scale_factor=1)
            await ctx.add_init_script(SEED)
            pg = await ctx.new_page()
            await pg.clock.set_fixed_time('2026-11-20T17:30:00+01:00')
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/*googleapis*/**', lambda r: r.abort())
            await pg.route('**/*gstatic*/**', lambda r: r.abort())
            await pg.goto('file://' + os.path.abspath(path) + '?prueba')
            r = await pg.evaluate(SCENARIO, modo)
            r['pisable'] = hashlib.sha1(r['pisable'].encode()).hexdigest()
            r['errores'] = errs
            res[modo] = r
            await ctx.close()
        await b.close()
    with open(outp, 'w') as f:
        json.dump(res, f, ensure_ascii=False, indent=1, sort_keys=True)
    print('errores:', res['dia']['errores'] + res['noche']['errores'], '| toques:', len(res['dia']['toques']), '| bytes:', os.path.getsize(outp))

asyncio.run(main(*sys.argv[1:]))
