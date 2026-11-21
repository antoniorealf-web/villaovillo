"use strict";
/* =========================================================
   PAQUETES (temporadas, eventos y zonas nuevas)
   ========================================================= */
/* Todo lo nuevo llega como paquete: un archivo en paquetes/ que llama a paquete({...}).
   El núcleo no sabe qué hay dentro: solo pregunta a los paquetes activos qué enchufan en cada sitio.

   paquete({
     id: 'navidad',                     // único y estable: es la llave de sus datos guardados
     nombre: 'Navidad en Villaovillo', emoji: '🎄',
     cuando: 'siempre'                  // o 'alcalde' (lo enciende papá),
           | {desde:'12-15', hasta:'01-07'}       // cada año (puede cruzar el año nuevo)
           | {desde:'2026-12-15', hasta:'2027-01-07'} // una sola vez
           | {logro: ()=>bridgeDone()},  // cuando se cumple algo
     enchufes:  { tablon(ctx){ return [carteles] }, ... },   // solo mientras está activo
     recuerdos: { ... },                // siempre: lo que ya ganaron (objetos, peces, medallas)
     info(){ return 'texto para el modo alcalde' },          // opcional
   });

   Enchufes disponibles hoy (se añaden según los necesite un paquete):
   - tablon(ctx) → lista de carteles para el tablón del pueblo. Ver «Carteles» en js/zonas/tablon/corcho.js.
   - tienda(p) → pestañas nuevas en la tienda: [{k, t, render(g, p)}]. Para vender muebles o cosas de jardín, se añaden
     a FURN o SHOP con paq:'<id>' (así no salen en las pestañas de siempre, pero se siguen viendo en casa fuera de temporada)
     y se pintan con tarjetaMueble / tarjetaJardin. Con para:'6' o '9', solo la puede comprar esa niña; once:1, solo una vez.
   - pueblo(ctx) → un objeto con lo que el paquete pone en el pueblo en cada fotograma (nieve, adornos, luces…);
     ctx = {p, st}. Las claves posibles están en decoPueblo(), en js/mundo/mundo.js.
   Además, un paquete puede traer:
   - pruebas: [{t:'texto', q:'&fecha=2026-12-01'}] → enlaces al modo prueba en el modo alcalde («🧪 Probar lo nuevo»).

   Datos: paqDatos(id) es común a las dos niñas (DB.paq); paqDatosNina(p,id) es de cada una (p.paq).
   Nada de eso se borra cuando el paquete deja de estar activo: si vuelve el año que viene, sigue ahí. */
const PAQUETES = [];
const PAQ_ERR = {};
window.addEventListener('error',e=>{ const f=String(e.filename||''); if(f.includes('/paquetes/')) PAQ_ERR[f.split('/paquetes/')[1].split('?')[0]]=String(e.message); });
function paquete(def){
  try{
    if(!def||!def.id) throw new Error('paquete sin id');
    if(PAQUETES.some(x=>x.id===def.id)) throw new Error('id repetido: '+def.id);
    def.enchufes=def.enchufes||{}; def.recuerdos=def.recuerdos||{}; def.cuando=def.cuando||'siempre';
    PAQUETES.push(def);
  }catch(e){ PAQ_ERR[(def&&def.id)||'?']=String(e&&e.message||e); }
}
function paqDatos(id){ DB.paq=DB.paq||{}; return DB.paq[id]=DB.paq[id]||{}; }
function paqDatosNina(p,id){ if(!p) return {}; p.paq=p.paq||{}; return p.paq[id]=p.paq[id]||{}; }
/* papá puede forzar un paquete: true (encendido), false (apagado) o sin valor (automático) */
function paqForzado(id){ const f=(DB.paqForce||{})[id]; return f===true||f===false?f:null; }
function setPaqForzado(id,v){ DB.ajT=Date.now(); DB.paqForce=DB.paqForce||{}; if(v===null) delete DB.paqForce[id]; else DB.paqForce[id]=v; saveQuiet(); }
function enFechas(c,t){ // t = 'AAAA-MM-DD'
  const d=c.desde, h=c.hasta; if(!d||!h) return false;
  if(d.length===10) return t>=d&&t<=h;
  const md=t.slice(5); return d<=h ? (md>=d&&md<=h) : (md>=d||md<=h);
}
function paqAutomatico(def,t){
  const c=def.cuando;
  if(c==='siempre') return true;
  if(c==='alcalde') return false;
  if(c&&c.desde) return enFechas(c,t);
  if(c&&typeof c.logro==='function'){ try{ return !!c.logro(); }catch(e){ PAQ_ERR[def.id]=String(e.message||e); return false; } }
  return false;
}
function paqActivo(def,t){ const f=paqForzado(def.id); return f!==null?f:paqAutomatico(def,t||today()); }
function paqCuandoTexto(def){
  const c=def.cuando, fm=s=>s.length===10?s.split('-').reverse().join('/'):s.split('-').reverse().join('/');
  if(c==='siempre') return 'Siempre';
  if(c==='alcalde') return 'Cuando lo enciendas';
  if(c&&c.desde) return 'Del '+fm(c.desde)+' al '+fm(c.hasta)+(c.desde.length===5?' (cada año)':'');
  if(c&&c.logro) return c.texto||'Al conseguir un logro';
  return '?';
}
/* enchufe('tablon', ctx) → todo lo que aportan los paquetes activos (y sus recuerdos, siempre).
   Un paquete con errores no rompe el juego: se salta y queda apuntado para el modo alcalde. */
function enchufe(nombre,...args){
  const out=[], t=today();
  for(const def of PAQUETES){
    const fns=[]; if(paqActivo(def,t)&&def.enchufes[nombre]) fns.push(def.enchufes[nombre]); if(def.recuerdos[nombre]) fns.push(def.recuerdos[nombre]);
    for(const fn of fns){
      try{ const r=fn.apply(def,args); if(Array.isArray(r)) r.forEach(x=>{ if(x&&typeof x==='object'&&!x.paq) x.paq=def.id; out.push(x); }); else if(r!=null) out.push(r); }
      catch(e){ PAQ_ERR[def.id]=nombre+': '+String(e&&e.message||e); }
    }
  }
  return out;
}
/* Apartado «Paquetes» del modo alcalde */
function renderPaquetesBox(box){
  if(!PAQUETES.length&&!Object.keys(PAQ_ERR).length) return;
  const b=box('📦 Paquetes del pueblo');
  b.append(el('div','counter','Temporadas, eventos y zonas nuevas. «Automático» sigue sus fechas; puedes encender o apagar uno a mano.'));
  const t=today();
  PAQUETES.forEach(def=>{
    const on=paqActivo(def,t), f=paqForzado(def.id);
    const r=el('div','mitem'); r.style.cssText='padding:8px 12px;align-items:center;margin:6px 0';
    let extra=''; try{ extra=def.info?def.info():''; }catch(e){}
    r.innerHTML=`<div class="mi">${def.emoji||'📦'}</div><div class="mt"><b>${esc(def.nombre||def.id)}</b> · ${on?'🟢 activo':'⚪ apagado'}<div class="counter">${esc(paqCuandoTexto(def))}${extra?' · '+esc(extra):''}</div>${PAQ_ERR[def.id]?`<div class="counter" style="color:#b4432f">⚠️ ${esc(PAQ_ERR[def.id])}</div>`:''}</div>`;
    const a=el('div','ma'); const sel=el('select','inputline'); sel.style.cssText='width:auto;font-size:16px;min-height:42px';
    [['auto','Automático'],['on','Encendido'],['off','Apagado']].forEach(([v,tx])=>{ const o=document.createElement('option'); o.value=v; o.textContent=tx; if((f===null&&v==='auto')||(f===true&&v==='on')||(f===false&&v==='off')) o.selected=true; sel.append(o); });
    sel.onchange=async()=>{ const v=sel.value==='auto'?null:sel.value==='on'; await alcHaz('pueblo','set',{campo:'paqForce.'+def.id,valor:v},(def.nombre||def.id)+': '+sel.selectedOptions[0].textContent); renderAlcalde(); };
    a.append(sel); r.append(a); b.append(r);
  });
  Object.keys(PAQ_ERR).filter(id=>!PAQUETES.some(d=>d.id===id)).forEach(id=>b.append(el('div','counter','⚠️ No se pudo cargar el paquete «'+id+'»: '+PAQ_ERR[id])));
}
