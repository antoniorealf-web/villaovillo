"use strict";
/* =========================================================
   EDIFICIOS DEL PUEBLO (lista única)
   Cada edificio se apunta una vez con edificio({...}) y el pueblo lo usa para todo:
   dibujarlo, no pisarlo, tocarlo (niña y paseo del alcalde), la luz de la puerta de noche y el mapa.
   Un edificio nuevo (o el de un paquete) es un archivo propio con una llamada a edificio(); no hace falta tocar mundo.js.

   edificio({
     id: 'huerto',                       // único; si B[id] no existe, se crea con x, y, w, h, door
     x, y, w, h, door:[x,y],             // solo si es nuevo (los de siempre ya están en B, en js/mundo/pueblo.js)
     tambien: ['plotA'],                 // otros rectángulos de B que van con él (no se pisan y al tocarlos cuenta como él)
     dibuja(c, b, ctx){ … },             // dibujo; ctx = {p, pA, pB, st}. Lo normal: bldgX(c, b, {wall, roof, label, extra, acc…})
     ve(b){ return vis(…) },             // opcional: cuándo está a la vista (por defecto, su centro)
     toque: {x,y,w,h},                   // opcional: zona que se puede tocar (por defecto, su rectángulo)
     abre(ctx){ … },                     // al llegar la niña a la puerta; ctx.mia = es su casa
     alcalde(ctx){ … },                  // en el paseo del alcalde (si falta, no hace nada)
     luz: true,                          // luz en la puerta de noche
     mapa: {color, etiqueta},            // en el mapa (pueden ser funciones)
     otroLado: true,                     // está al otro lado del río: solo se llega con el puente terminado
     activo(){ return … },               // opcional: si devuelve false, no existe (p. ej. un paquete apagado)
   });
   El orden de la lista es el orden de dibujo y de toque. Los vecinos, los buzones, el puente y las
   zonas cerradas del otro lado del río siguen en mundo.js.
   ========================================================= */
const EDIFICIOS = [];
function edificio(def){
  if(!def||!def.id) throw new Error('edificio sin id');
  if(EDIFICIOS.some(e=>e.id===def.id)) throw new Error('edificio repetido: '+def.id);
  if(!B[def.id]){ if(def.w==null) throw new Error('edificio sin sitio: '+def.id); B[def.id]={x:def.x,y:def.y,w:def.w,h:def.h,door:def.door}; }
  def.tambien=def.tambien||[];
  EDIFICIOS.push(def);
  return def;
}
function edificiosActivos(){ return EDIFICIOS.filter(e=>{ try{ return !e.activo||e.activo(); }catch(err){ return false; } }); }
function edRect(e){ return B[e.id]; }
function edToca(e,x,y){ const b=edRect(e); return inRect(x,y,typeof e.toque==='function'?e.toque(b):(e.toque||b))||e.tambien.some(k=>inRect(x,y,B[k])); }
function edPisa(x,y){ return edificiosActivos().some(e=>inRect(x,y,edRect(e))||e.tambien.some(k=>inRect(x,y,B[k]))); }
function edVal(v,e){ return typeof v==='function'?v(e):v; }

/* ---------- los de siempre ---------- */
edificio({ id:'taller', luz:true, dibuja:(c,b)=>bldgX(c,b,{wall:'#f3d3a6',roof:'#d9534f',label:'🧶 Taller del telar',extra:tallerExtra,acc:'#4a8fdc',doorW:58}),
  abre:()=>openWorkshop(), alcalde:()=>verEncargos(), mapa:{color:'#d9534f',etiqueta:'🧶 Taller'} });
edificio({ id:'tienda', luz:true, dibuja:(c,b)=>bldgX(c,b,{wall:'#fbeed2',roof:'#8c63c9',label:'🏪 Tienda',extra:shopExtra,acc:'#e4574f'}),
  abre:()=>openShop(), alcalde:()=>say({face:'🐔',name:NPCS.coco.n,text:'¡Hola, alcalde! '+DB.profiles.filter(Boolean).map(q=>q.name+' tiene '+q.coins+' botones').join(' y ')+' para gastar aquí.',speak:false}),
  mapa:{color:'#8c63c9',etiqueta:'🏪 Tienda'} });
edificio({ id:'ayto', luz:true, dibuja:(c,b)=>bldgX(c,b,{wall:'#f6efe2',roof:'#4a6fa5',label:'🎩 Ayuntamiento',extra:aytoExtra,kind:'nowin',acc:'#e4574f'}),
  abre:()=>openNews(), alcalde:()=>openFicha(), mapa:{color:'#4a6fa5',etiqueta:'🎩 Ayto.'} });
edificio({ id:'panaderia', luz:true, dibuja:(c,b)=>bldgX(c,b,{wall:'#fbe1b8',roof:'#e0862f',label:'🥐 Panadería',extra:bakeryExtra,chimney:true,smoke:true,acc:'#f29b38'}),
  abre:()=>openBakery(), alcalde:()=>openFicha('pan'), mapa:{color:'#e0862f',etiqueta:'🥐 Panadería'} });
edificio({ id:'biblio', luz:true, dibuja:(c,b)=>bldgX(c,b,{wall:'#e4ecf7',roof:'#3f6aa8',label:'🦉 Biblioteca',extra:biblioExtra,kind:'nowin',acc:'#a678d6'}),
  abre:()=>openLibrary(), alcalde:()=>openFicha('bib'), mapa:{color:'#3f6aa8',etiqueta:'🦉 Biblioteca'} });
for(const [k,i] of [['A',0],['B',1]]){
  const pp=()=>DB.profiles[i];
  edificio({ id:'house'+k, tambien:['plot'+k], luz:true,
    dibuja:(c,b)=>{ const q=pp(); bldgX(c,b,{wall:shade(q?q.color:'#c9b89c',0.72),roof:q?shade(q.color,-0.05):'#a89a86',label:q?'🏡 Casa de '+q.name:'🏚️ Casa vacía',chimney:true,smoke:!!q,extra:houseExtra,acc:q?q.color:'#ccc',nina:i}); },
    abre:()=>{ if(DB.cur===i) openHouse(DB.cur); else visitOther(); },
    alcalde:()=>{ if(DB.profiles[i]) openHouse(i); else toast('Casa vacía'); },
    mapa:{color:()=>pp()?pp().color:'#a89a86', etiqueta:()=>pp()?'🏡 '+pp().name:'🏚️', relleno:['plot'+k,'#8b5e3c']} });
}
edificio({ id:'tablon', ve:b=>vis(b.x,b.y), dibuja:(c,b)=>drawTablon(c,b), toque:b=>({x:b.x-16,y:b.y-10,w:b.w+32,h:b.h+10}),
  abre:()=>openBoard(), alcalde:()=>openBoard() });
edificio({ id:'tend', ve:b=>vis(b.x+100,b.y), dibuja:(c,b,ctx)=>tendX(c,b,ctx.p), toque:b=>({x:b.x,y:b.y-20,w:b.w,h:b.h+40}),
  abre:()=>openBook('telas'), alcalde:()=>openBook('telas'), mapa:{etiqueta:'🧵 Tendedero'} });
