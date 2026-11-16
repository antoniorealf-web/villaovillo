"use strict";
/* =========================================================
   UTILIDADES
   ========================================================= */
const $ = s=>document.querySelector(s);
function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function shade(hex, amt){ // amt -1..1
  const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255;
  const t=amt<0?0:255, a=Math.abs(amt);
  r=Math.round(r+(t-r)*a); g=Math.round(g+(t-g)*a); b=Math.round(b+(t-b)*a);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function starsHTML(n, max=3){ let s=''; for(let i=0;i<max;i++) s+= i<n?'★':'<span class="off">★</span>'; return s; }

/* ---------- sonido ---------- */
let AC=null;

/* ---------- voz ---------- */
function stripEmoji(t){ return t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,'').replace(/[«»]/g,''); }
function speakNow(text){
  try{
    if(!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(stripEmoji(text));
    u.lang='es-ES'; u.rate=0.95;
    const v=speechSynthesis.getVoices().find(v=>/^es(-|_)ES/i.test(v.lang)) || speechSynthesis.getVoices().find(v=>/^es/i.test(v.lang));
    if(v) u.voice=v;
    speechSynthesis.speak(u);
  }catch(e){}
}
function speakAuto(text){ const p=P(); if(p&&p.voice) speakNow(text); }
function stopSpeak(){ try{ speechSynthesis.cancel(); }catch(e){} }
