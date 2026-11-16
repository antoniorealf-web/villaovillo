/*  ============================================================
    VILLAOVILLO · Nube familiar (Google Apps Script)
    Pega este código en: Hoja de Google → Extensiones → Apps Script
    ============================================================ */

// ====== CAMBIA ESTOS DOS VALORES ======
const CLAVE = 'cambia-esta-clave';   // clave de la familia: la escribirás una vez en la tablet y en tu móvil
const PIN   = '1234';                // PIN del panel del alcalde (solo tú)
// ======================================

const H_PART = ['id','nombre','actualizado','nivel','encargos','estrellas','botones','estado'];
const H_HIST = ['fecha','nombre','evento','nivel','encargos','estrellas','botones'];
const H_MSG  = ['id','fecha','para','nombre','tipo','texto','premio','estado','extra','actualizado'];

function doGet() {
  return out_({ok: true, info: 'Villaovillo funcionando'});
}

// Ejecuta esta función una vez desde el editor (botón ▶ Ejecutar) para dar permisos a Drive y crear la carpeta.
function preparar() {
  const f = carpeta_();
  subcarpeta_(f, 'copias');
  hoja_('Partidas', H_PART); hoja_('Mensajes', H_MSG); hoja_('Historial', H_HIST);
  Logger.log('Listo. Carpeta: ' + f.getUrl());
}

function doPost(e) {
  let q;
  try { q = JSON.parse(e.postData.contents); } catch (x) { return out_({ok: false, error: 'formato'}); }
  if (q.key !== CLAVE) return out_({ok: false, error: 'clave'});
  const papa = (q.pin === PIN);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    switch (q.action) {
      case 'save':     return out_(save_(q));
      case 'load':     return out_(load_(papa));
      case 'msgState': return out_(msgState_(q, papa));
      case 'addMsg':   return papa ? out_(addMsg_(q)) : out_({ok: false, error: 'pin'});
      case 'checkPin': return out_(papa ? {ok: true} : {ok: false, error: 'pin'});
      default:         return out_({ok: false, error: 'accion'});
    }
  } catch (err) {
    return out_({ok: false, error: String(err)});
  } finally {
    lock.releaseLock();
  }
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function hoja_(nombre, cabecera) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(nombre);
  if (!s) {
    s = ss.insertSheet(nombre);
    s.appendRow(cabecera);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, cabecera.length).setFontWeight('bold');
  }
  return s;
}

/* ---- Partidas como archivos en Google Drive ----
   Cada niña tiene un archivo «partida-<id>.json» en la carpeta «Villaovillo · partidas».
   Además se guarda una copia por día en la subcarpeta «copias» (se conservan 60 días).
   La hoja «Partidas» solo guarda el resumen y en qué archivo está cada partida. */
const CARPETA = 'Villaovillo · partidas';
const DIAS_COPIA = 60;

function carpeta_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('carpeta');
  if (id) { try { return DriveApp.getFolderById(id); } catch (x) {} }
  const f = DriveApp.createFolder(CARPETA);
  props.setProperty('carpeta', f.getId());
  return f;
}
function subcarpeta_(padre, nombre) {
  const it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}
function escribe_(carpeta, nombre, texto) {
  const it = carpeta.getFilesByName(nombre);
  if (it.hasNext()) { const f = it.next(); f.setContent(texto); return f; }
  return carpeta.createFile(nombre, texto, 'application/json');
}
function hoy_() { return Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyy-MM-dd'); }
function limpiaCopias_(copias) {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('limpieza') === hoy_()) return;
  props.setProperty('limpieza', hoy_());
  const limite = Date.now() - DIAS_COPIA * 864e5;
  const it = copias.getFiles();
  while (it.hasNext()) { const f = it.next(); if (f.getLastUpdated().getTime() < limite) f.setTrashed(true); }
}

function save_(q) {
  const p = q.profile, sum = q.sum || {};
  if (!p || !p.id) return {ok: false, error: 'perfil'};
  const json = JSON.stringify(p);
  const s = hoja_('Partidas', H_PART);
  const data = s.getDataRange().getValues();
  let r0 = -1;
  for (let i = 1; i < data.length; i++) if (data[i][0] === p.id) { r0 = i + 1; break; }
  if (r0 > 0) {
    const old = data[r0 - 1][2];
    if (old instanceof Date && old.getTime() > (p.updatedAt || 0)) return {ok: true, stale: true};
  }
  const dir = carpeta_();
  const file = escribe_(dir, 'partida-' + p.id + '.json', json);
  const copias = subcarpeta_(dir, 'copias');
  escribe_(copias, (p.name || p.id) + ' ' + hoy_() + '.json', json);
  limpiaCopias_(copias);
  const row = [p.id, p.name, new Date(p.updatedAt || Date.now()), sum.nivel, sum.encargos, sum.estrellas, sum.botones, 'archivo:' + file.getId()];
  if (r0 > 0) s.getRange(r0, 1, 1, row.length).setValues([row]);
  else s.appendRow(row);
  if (q.evento) {
    hoja_('Historial', H_HIST).appendRow([new Date(), p.name, q.evento, sum.nivel, sum.encargos, sum.estrellas, sum.botones]);
  }
  return {ok: true};
}

function load_(papa) {
  const part = hoja_('Partidas', H_PART).getDataRange().getValues().slice(1)
    .filter(r => r[0])
    .map(r => { let st = null; try { st = JSON.parse(leePartida_(r[7])); } catch (x) {} return {id: r[0], state: st}; })
    .filter(x => x.state);
  const msgs = hoja_('Mensajes', H_MSG).getDataRange().getValues().slice(1)
    .filter(r => r[0] && r[7] !== 'borrada')
    .map(r => ({id: r[0], fecha: r[1], para: r[2], nombre: r[3], tipo: r[4], texto: r[5], premio: Number(r[6]) || 0,
                estado: r[7], extra: r[8] ? safeJson_(r[8]) : null}));
  const res = {ok: true, profiles: part, msgs: msgs};
  if (papa) {
    const h = hoja_('Historial', H_HIST).getDataRange().getValues().slice(1);
    res.historial = h.slice(-300).map(r => ({fecha: r[0], nombre: r[1], evento: r[2]}));
    res.papa = true;
  }
  return res;
}

// La columna «estado» guarda «archivo:<id>» (partida en Drive) o, en versiones antiguas, la partida entera.
function leePartida_(v) {
  v = String(v || '');
  if (v.indexOf('archivo:') === 0) return DriveApp.getFileById(v.slice(8)).getBlob().getDataAsString();
  return v;
}

function safeJson_(s) { try { return JSON.parse(s); } catch (x) { return null; } }

function addMsg_(q) {
  const m = q.msg || {};
  const id = 'm' + Date.now() + Math.floor(Math.random() * 1000);
  hoja_('Mensajes', H_MSG).appendRow([id, new Date(), m.para, m.nombre || '', m.tipo, m.texto || '', Number(m.premio) || 0,
    'nuevo', m.extra ? JSON.stringify(m.extra) : '', new Date()]);
  return {ok: true, id: id};
}

// Cambios de estado permitidos
const KID_OK  = {'nuevo>leida': 1, 'nuevo>hecha': 1, 'nuevo>aceptada': 1, 'aceptada>hecha': 1, 'nuevo>completado': 1, 'validada>cobrada': 1, 'leida>completado': 1};
const PAPA_OK = {'hecha>validada': 1, 'aceptada>validada': 1, 'nuevo>validada': 1};

function msgState_(q, papa) {
  const s = hoja_('Mensajes', H_MSG);
  const data = s.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== q.id) continue;
    const from = data[i][7], to = q.estado, k = from + '>' + to;
    const allowed = KID_OK[k] || (papa && (PAPA_OK[k] || to === 'borrada'));
    if (!allowed) return {ok: true, estado: from, ignored: true};
    s.getRange(i + 1, 8).setValue(to);
    s.getRange(i + 1, 10).setValue(new Date());
    return {ok: true, estado: to};
  }
  return {ok: false, error: 'no existe'};
}
