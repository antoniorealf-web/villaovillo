"use strict";
/* =========================================================
   MÚSICA Y SONIDOS
   ========================================================= */
/* Música de fondo sintetizada con obras clásicas de dominio público, pasos, voces de los vecinos y efectos.
   DB.sound = {music, sfx}: se cambia con el botón 🎵 del pueblo. */
function sndCfg(){ DB.sound=DB.sound||{music:true,sfx:true}; return DB.sound; }
let SND=null;
function sndInit(){
  try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; }
  if(SND) return SND;
  const master=AC.createGain(); master.gain.value=1; master.connect(AC.destination);
  const mus=AC.createGain(); mus.gain.value=0;
  const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2600;
  const dl=AC.createDelay(); dl.delayTime.value=0.34; const fb=AC.createGain(); fb.gain.value=0.28; const wet=AC.createGain(); wet.gain.value=0.35;
  mus.connect(lp); lp.connect(master); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(master);
  const sfx=AC.createGain(); sfx.gain.value=1; sfx.connect(master);
  const nb=AC.createBuffer(1,AC.sampleRate*0.3,AC.sampleRate), d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  SND={master,mus,sfx,noise:nb,song:-1,ev:[],idx:0,t0:0,timer:null,duck:1,on:false};
  return SND;
}
function beep(f=660, d=0.06, type='sine', vol=0.05){
  if(!sndCfg().sfx) return; const S=sndInit(); if(!S) return;
  try{ const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.value=f;
    g.gain.setValueAtTime(vol,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime+d);
    o.connect(g); g.connect(S.sfx); o.start(); o.stop(AC.currentTime+d+0.02); }catch(e){}
}
function bell(f,t,vol=0.06,dur=0.6,bus){ const S=sndInit(); if(!S) return;
  [[1,1],[2,0.25],[3,0.08]].forEach(([m,a])=>{ const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.value=f*m;
    g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol*a,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur/m);
    o.connect(g); g.connect(bus||S.sfx); o.start(t); o.stop(t+dur+0.05); }); }
function fanfare(){ if(!sndCfg().sfx) return; const S=sndInit(); if(!S) return; const t=AC.currentTime+0.02;
  [523,659,784,1046].forEach((f,i)=>bell(f,t+i*0.11,0.07,0.7)); bell(1318,t+0.5,0.05,1.2); }
function sfxLevel(){ if(!sndCfg().sfx) return; const S=sndInit(); if(!S) return; const t=AC.currentTime+0.02;
  [523,659,784,1046,784,1046,1318,1568].forEach((f,i)=>bell(f,t+i*0.09,0.06,0.8)); [523,659,784].forEach(f=>bell(f,t+0.85,0.05,1.6)); }
function sfxBuy(){ if(!sndCfg().sfx) return; const S=sndInit(); if(!S) return; const t=AC.currentTime+0.02;
  bell(1568,t,0.06,0.25); bell(2093,t+0.07,0.06,0.5);
  const n=AC.createBufferSource(); n.buffer=S.noise; const hp=AC.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=5000; const g=AC.createGain(); g.gain.setValueAtTime(0.04,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.15); n.connect(hp); hp.connect(g); g.connect(S.sfx); n.start(t); n.stop(t+0.2); }
function sfxStep(alt){ if(!sndCfg().sfx) return; const S=sndInit(); if(!S) return; const t=AC.currentTime;
  const n=AC.createBufferSource(); n.buffer=S.noise; const bp=AC.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=alt?520:430; bp.Q.value=1.2;
  const g=AC.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.09,t+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
  n.connect(bp); bp.connect(g); g.connect(S.sfx); n.start(t,Math.random()*0.2); n.stop(t+0.09); }
const NPC_VOICE={rosa:520,tomas:400,coco:690,bruno:200,lia:600,nube:760,hilo:330,alcalde:160,sabina:460};
function npcVoice(k){ if(!sndCfg().sfx) return; const S=sndInit(); if(!S) return; const base=NPC_VOICE[k]||450, t=AC.currentTime+0.01;
  [[0,0.09,1,1.25],[0.11,0.16,1.3,0.95]].forEach(([dt,dur,a,b])=>{ const o=AC.createOscillator(); o.type=k==='hilo'?'square':'sawtooth';
    o.frequency.setValueAtTime(base*a,t+dt); o.frequency.exponentialRampToValueAtTime(base*b,t+dt+dur);
    const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=k==='hilo'?1400:1100; f.Q.value=3;
    const g=AC.createGain(); g.gain.setValueAtTime(0.0001,t+dt); g.gain.linearRampToValueAtTime(k==='hilo'?0.07:0.17,t+dt+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+dt+dur);
    o.connect(f); f.connect(g); g.connect(S.sfx); o.start(t+dt); o.stop(t+dt+dur+0.02); }); }

/* ---- canciones (obras de dominio público, arreglos sencillos) ---- */
const NOTE_IX={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nfreq(n){ const m=n.match(/^([A-G])(#|b)?(\d)$/); if(!m) return 0; const midi=12*(+m[3]+1)+NOTE_IX[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0); return 440*Math.pow(2,(midi-69)/12); }
const CHORDS={G:['G2','B3','D4','G4'],Gmaj7:['G2','B3','D4','F#4'],Dmaj7:['D2','A3','C#4','F#4'],D:['D2','A3','D4','F#4'],D7:['D2','A3','C4','F#4'],C:['C3','G3','C4','E4'],Am:['A2','A3','C4','E4'],Em:['E2','G3','B3','E4'],
  Bm:['B2','F#3','B3','D4'],Fsm:['F#2','A3','C#4','F#4'],A:['A2','A3','C#4','E4'],F:['F2','A3','C4','F4'],G7:['G2','B3','D4','F4'],Dm:['D2','A3','D4','F4'],E7:['E2','G#3','B3','D4']};
const SONGS=[
  {n:'Gymnopédie n.º 1 (Satie)',bpm:68,bar:3,arp:'waltzlong',
   chords:'Gmaj7 Dmaj7 Gmaj7 Dmaj7 Gmaj7 Dmaj7 Gmaj7 Dmaj7 Gmaj7 Dmaj7 Gmaj7 Dmaj7 Gmaj7 Dmaj7 Em Bm Em Dmaj7',
   mel:'r3 r3 r3 r3 r2 F#5 A5 G5 F#5 C#5 B4 C#5 D5 A4:2 F#4:3 F#4:3 F#4:3 r2 F#5 A5 G5 F#5 C#5 B4 C#5 D5 A4:2 C#5:3 F#5:3 E5:3'},
  {n:'Minueto en sol (cuaderno de Anna Magdalena Bach)',bpm:96,bar:3,arp:'waltz',
   chords:'G G C G C G D D G G C G C G D G',
   mel:'D5 G4:.5 A4:.5 B4:.5 C5:.5 D5 G4 G4 E5 C5:.5 D5:.5 E5:.5 F#5:.5 G5 G4 G4 C5 D5:.5 C5:.5 B4:.5 A4:.5 B4 C5:.5 B4:.5 A4:.5 G4:.5 F#4 G4:.5 A4:.5 B4:.5 G4:.5 A4:3 D5 G4:.5 A4:.5 B4:.5 C5:.5 D5 G4 G4 E5 C5:.5 D5:.5 E5:.5 F#5:.5 G5 G4 G4 C5 D5:.5 C5:.5 B4:.5 A4:.5 B4 C5:.5 B4:.5 A4:.5 G4:.5 A4 B4:.5 A4:.5 G4:.5 F#4:.5 G4:3'},
  {n:'Canción de cuna (Brahms)',bpm:84,bar:3,arp:'waltz',
   chords:'C C G G G G C C F C G C F C G C C',
   mel:'r2 E4:.5 E4:.5 G4:2 E4:.5 E4:.5 G4:2 E4:.5 G4:.5 C5 B4:1.5 A4:.5 A4 G4 D4:.5 E4:.5 F4 D4 D4:.5 E4:.5 F4:2 D4:.5 F4:.5 B4:.5 A4:.5 G4 B4 C5:3 C4:.5 C4:.5 C5:2 A4:.5 F4:.5 G4:2 E4:.5 C4:.5 F4 G4 A4 G4:2 C4:.5 C4:.5 C5:2 A4:.5 F4:.5 G4:2 E4:.5 C4:.5 F4 E4 D4 C4:2'},
  {n:'Canon (Pachelbel)',bpm:58,bar:4,arp:'canon',
   chords:'D A Bm Fsm G D G A D A Bm Fsm G D G A D',
   mel:'F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2 D5:2 C#5:2 B4:2 A4:2 G4:2 F#4:2 G4:2 E4:2 D4 F#4 A4 G4 F#4 D4 F#4 E4 D4 B3 D4 A4 G4 B4 A4 G4 F#4 D4 E4 C#5 D5 F#5 A5 A4 B4 G4 A4 F#4 D4 D5 D5:1.5 C#5:.5 D5:4'},
  {n:'Variaciones sobre «Ah, vous dirai-je, maman» (Mozart)',bpm:80,bar:4,arp:'alberti',
   chords:'C F F C C G C G C F F C C F G C',
   mel:'C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2 G5 G5 F5 F5 E5 E5 D5:2 G5 G5 F5 F5 E5 E5 D5:2 C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2 C5:.5 D5:.5 C5:.5 B4:.5 C5:.5 G5:.5 A5:.5 G5:.5 F5:.5 E5:.5 D5:.5 C5:.5 C5:2 G4:.5 A4:.5 B4:.5 C5:.5 D5:.5 E5:.5 F5:.5 D5:.5 C5:4'}
];
function parseMel(s){ let t=0; const out=[]; s.trim().split(/\s+/).forEach(tok=>{ const [n,d]=tok.split(':'); const dur=d?parseFloat(d):1; if(n[0]!=='r') out.push({t,n,dur}); else { const k=parseFloat(n.slice(1)); t+=isNaN(k)?1:k; return; } t+=dur; }); return {ev:out,len:t}; }
function buildSong(i){
  const S=SONGS[i], spb=60/S.bpm, ev=[]; const ch=S.chords.split(' '); const m=parseMel(S.mel);
  const bars=Math.max(ch.length,Math.ceil(m.len/S.bar));
  for(let b=0;b<bars;b++){ const c=CHORDS[ch[b%ch.length]]||CHORDS.C, t0=b*S.bar*spb;
    if(S.arp==='waltzlong'){ ev.push({t:t0,f:nfreq(c[0]),d:S.bar*spb*1.1,v:0.10,k:'bass'}); ev.push({t:t0+spb,f:nfreq(c[1]),d:spb*2,v:0.045},{t:t0+spb,f:nfreq(c[2]),d:spb*2,v:0.045},{t:t0+spb,f:nfreq(c[3]),d:spb*2,v:0.04}); }
    else if(S.arp==='waltz'){ ev.push({t:t0,f:nfreq(c[0]),d:spb*1.6,v:0.09,k:'bass'}); for(const k of [1,2]) ev.push({t:t0+k*spb,f:nfreq(c[2]),d:spb*0.8,v:0.035},{t:t0+k*spb,f:nfreq(c[3]),d:spb*0.8,v:0.03}); }
    else if(S.arp==='canon'){ ev.push({t:t0,f:nfreq(c[0]),d:spb*2,v:0.09,k:'bass'}); [1,2,3,2].forEach((k,j)=>ev.push({t:t0+j*spb,f:nfreq(c[k]),d:spb*1.2,v:0.03})); }
    else { ev.push({t:t0,f:nfreq(c[0]),d:spb*S.bar,v:0.07,k:'bass'}); for(let j=0;j<S.bar*2;j++){ const k=[1,3,2,3][j%4]; ev.push({t:t0+j*spb/2,f:nfreq(c[k]),d:spb*0.45,v:0.025}); } }
  }
  m.ev.forEach(e=>ev.push({t:e.t*spb,f:nfreq(e.n),d:e.dur*spb*0.95,v:0.075,k:'mel'}));
  ev.sort((a,b)=>a.t-b.t);
  return {ev,len:Math.max(bars*S.bar,m.len)*spb};
}
function playNote(e,t){ const S=SND; const o=AC.createOscillator(), o2=AC.createOscillator(), g=AC.createGain();
  o.type=e.k==='bass'?'sine':'triangle'; o2.type='sine'; o.frequency.value=e.f; o2.frequency.value=e.f*2;
  const g2=AC.createGain(); g2.gain.value=e.k==='mel'?0.18:0.08;
  const rel=Math.min(2.4,e.d*1.3+0.3);
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(e.v,t+(e.k==='mel'?0.02:0.04)); g.gain.exponentialRampToValueAtTime(e.v*0.45,t+Math.min(0.4,e.d)); g.gain.exponentialRampToValueAtTime(0.0001,t+rel);
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(S.mus); o.start(t); o2.start(t); o.stop(t+rel+0.05); o2.stop(t+rel+0.05); }
function musicTick(){
  const S=SND; if(!S||!S.on) return;
  const ahead=AC.currentTime+0.5;
  if(!S.cur||S.idx>=S.cur.ev.length&&AC.currentTime>S.t0+S.cur.len+3){
    S.rep=(S.rep||0)+1; if(!S.cur||S.rep>2){ const vale=i=>!SONGS[i].solo||SONGS[i].solo(), pool=nightLevel()>0.5?SONGS.map((_,i)=>i).filter(i=>(i===0||i===2||SONGS[i].noche)&&vale(i)):SONGS.map((_,i)=>i).filter(vale); S.song=pool[(pool.indexOf(S.song)+1)%pool.length]; S.rep=1; S.cur=buildSong(S.song); }
    S.idx=0; S.t0=AC.currentTime+0.3; }
  while(S.idx<S.cur.ev.length&&S.t0+S.cur.ev[S.idx].t<ahead){ const e=S.cur.ev[S.idx++]; if(e.f) playNote(e,S.t0+e.t); }
}
function musicTarget(){ const S=SND; if(!S) return 0; if(!sndCfg().music) return 0; return 0.7*S.duck; }
function musicStart(){
  if(!sndCfg().music) return; const S=sndInit(); if(!S) return;
  try{ if(AC.state==='suspended') AC.resume(); }catch(e){}
  if(!S.on){ S.on=true; if(S.song<0) S.song=Math.floor(Math.random()*SONGS.length)-1; S.cur=null; S.timer=setInterval(musicTick,120); musicTick(); }
  S.mus.gain.cancelScheduledValues(AC.currentTime); S.mus.gain.setTargetAtTime(musicTarget(),AC.currentTime,0.8);
}
function musicStop(){ const S=SND; if(!S||!S.on) return; S.mus.gain.setTargetAtTime(0,AC.currentTime,0.3); setTimeout(()=>{ if(!sndCfg().music){ clearInterval(S.timer); S.on=false; } },1500); }
const DUCK_SCREENS=['puzzle','bakery','library'];
function musicScreen(id){ if(!sndCfg().music||id==='profiles') return; const S=sndInit(); if(!S) return; S.duck=DUCK_SCREENS.includes(id)?0.35:1; musicStart(); }
document.addEventListener('visibilitychange',()=>{ try{ if(!AC) return; if(document.hidden) AC.suspend(); else AC.resume(); }catch(e){} });
function soundLabel(){ const c=sndCfg(); return c.music?'🎵':c.sfx?'🔔':'🔕'; }
function cycleSound(){ const c=sndCfg(); if(c.music){ c.music=false; c.sfx=true; musicStop(); toast('🔔 Solo sonidos'); } else if(c.sfx){ c.sfx=false; toast('🔕 Silencio'); } else { c.music=true; c.sfx=true; musicStart(); toast('🎵 Música y sonidos'); } saveQuiet(); const b=$('#hb-music'); if(b) b.textContent=soundLabel(); }
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  $('#scr-'+id).classList.add('on'); curScreen=id;
  if(id==='village'){ resizeVillage(); updateHUD(); startLoop(); } else stopLoop();
  musicScreen(id);
}
let stepT=0, stepAlt=false;
function stepSfx(dt){ if(curScreen!=='village'||!player.moving){ stepT=0.12; return; } stepT-=dt; if(stepT<=0){ stepT=0.3; stepAlt=!stepAlt; sfxStep(stepAlt); } }
$('#hb-music').onclick=cycleSound; $('#hb-music').textContent=soundLabel();
