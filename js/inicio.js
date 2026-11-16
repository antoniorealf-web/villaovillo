"use strict";
/* =========================================================
   INICIO
   ========================================================= */
load();
try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){}
initExtras();
if(DB_DAMAGED) setTimeout(()=>toast('⚠️ La partida guardada no se podía leer. Está apartada: papá puede recuperarla en «♻️ Restaurar».',8000),800);
if('speechSynthesis' in window){ try{ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged=()=>{}; }catch(e){} }
renderProfiles(); show('profiles');
