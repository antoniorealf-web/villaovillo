"use strict";
/* =========================================================
   CAMINOS: andar rodeando el lago, los edificios y el río
   ---------------------------------------------------------
   El pueblo se mira como una cuadrícula de casillas de CAM_C px. caminoA() busca el camino más corto
   (A*, 8 direcciones) y lo deja en pocos tramos rectos (solo gira donde hace falta).
   andarA(obj, x, y) lo pone en marcha para el personaje (player) o para un vecino.
   ========================================================= */
const CAM_C=30, CAM_M=14; let CAM_W=Math.ceil(WW/CAM_C), CAM_H=Math.ceil((WH-WY0)/CAM_C); // margen alrededor de lo que no se pisa
const RIO={x0:1862,x1:1992,puenteY:828,puenteMedio:30};
function rioCorta(x,y){ return x>RIO.x0&&x<RIO.x1&&!(bridgeDoneSafe()&&Math.abs(y-RIO.puenteY)<RIO.puenteMedio); }
function bridgeDoneSafe(){ try{ return !VISIT&&bridgeDone(); }catch(e){ return false; } }
/* ¿Se puede pisar este punto? (con un pequeño margen para que los pies no rocen las paredes) */
function pisable(x,y){
  if(x<30||x>WW-30||y<WY0+60||y>WH-20) return false;
  if(rioCorta(x,y)) return false;
  for(const [dx,dy] of [[0,0],[CAM_M,0],[-CAM_M,0],[0,CAM_M],[0,-CAM_M]]) if(insideBuilding(x+dx,y+dy)) return false;
  return true;
}
let CAM_GRID=null, CAM_KEY='';
function camRejilla(){
  const key=(bridgeDoneSafe()?'p':'n')+WW+','+WY0; if(CAM_GRID&&CAM_KEY===key) return CAM_GRID;
  CAM_W=Math.ceil(WW/CAM_C); CAM_H=Math.ceil((WH-WY0)/CAM_C); // el pueblo puede crecer (ampliación)
  const g=new Uint8Array(CAM_W*CAM_H);
  for(let j=0;j<CAM_H;j++) for(let i=0;i<CAM_W;i++) g[j*CAM_W+i]=pisable(i*CAM_C+CAM_C/2,WY0+j*CAM_C+CAM_C/2)?1:0;
  CAM_GRID=g; CAM_KEY=key; return g;
}
function camLibre(g,i,j){ return i>=0&&j>=0&&i<CAM_W&&j<CAM_H&&g[j*CAM_W+i]===1; }
function camCelda(x,y){ return [clamp(Math.floor(x/CAM_C),0,CAM_W-1),clamp(Math.floor((y-WY0)/CAM_C),0,CAM_H-1)]; }
function camCercana(g,i,j){ // la casilla libre más cercana
  if(camLibre(g,i,j)) return [i,j];
  for(let r=1;r<20;r++){ let best=null,bd=1e9;
    for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){ if(Math.max(Math.abs(di),Math.abs(dj))!==r) continue; if(camLibre(g,i+di,j+dj)){ const d=di*di+dj*dj; if(d<bd){ bd=d; best=[i+di,j+dj]; } } }
    if(best) return best; }
  return null;
}
/* ¿Se va en línea recta de a a b sin pisar nada? */
function camRecta(ax,ay,bx,by){ const d=Math.hypot(bx-ax,by-ay), n=Math.ceil(d/12); for(let k=1;k<n;k++){ const t=k/n; if(!pisable(ax+(bx-ax)*t,ay+(by-ay)*t)) return false; } return true; }
/* Camino de (x0,y0) a (x1,y1): lista de puntos [[x,y],…] sin el de salida. null si no hay forma de llegar. */
function caminoA(x0,y0,x1,y1){
  if(camRecta(x0,y0,x1,y1)&&pisable(x1,y1)) return [[x1,y1]];
  const g=camRejilla(); const s=camCercana(g,...camCelda(x0,y0)), e=camCercana(g,...camCelda(x1,y1)); if(!s||!e) return null;
  const N=CAM_W*CAM_H, si=s[1]*CAM_W+s[0], ei=e[1]*CAM_W+e[0];
  const gs=new Float32Array(N).fill(Infinity), from=new Int32Array(N).fill(-1), done=new Uint8Array(N);
  const open=[si]; gs[si]=0;
  const h=k=>{ const dx=Math.abs(k%CAM_W-e[0]), dy=Math.abs(((k/CAM_W)|0)-e[1]); return Math.max(dx,dy)+0.414*Math.min(dx,dy); };
  const fs=new Float32Array(N).fill(Infinity); fs[si]=h(si);
  let found=false, guard=0;
  while(open.length&&guard++<N*2){
    let bi=0; for(let k=1;k<open.length;k++) if(fs[open[k]]<fs[open[bi]]) bi=k;
    const cur=open[bi]; open[bi]=open[open.length-1]; open.pop();
    if(cur===ei){ found=true; break; } if(done[cur]) continue; done[cur]=1;
    const ci=cur%CAM_W, cj=(cur/CAM_W)|0;
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ if(!di&&!dj) continue;
      const ni=ci+di, nj=cj+dj; if(!camLibre(g,ni,nj)) continue;
      if(di&&dj&&(!camLibre(g,ci+di,cj)||!camLibre(g,ci,cj+dj))) continue; // sin cortar esquinas
      const nk=nj*CAM_W+ni, ng=gs[cur]+(di&&dj?1.414:1);
      if(ng<gs[nk]){ gs[nk]=ng; from[nk]=cur; fs[nk]=ng+h(nk); open.push(nk); } }
  }
  if(!found) return null;
  const cells=[]; for(let k=ei;k!==-1&&k!==si;k=from[k]) cells.push([(k%CAM_W)*CAM_C+CAM_C/2,WY0+((k/CAM_W)|0)*CAM_C+CAM_C/2]); cells.reverse();
  if(!insideBuilding(x1,y1)&&!rioCorta(x1,y1)&&x1>=30&&x1<=WW-30) cells.push([x1,y1]); // el punto exacto (una puerta, por ejemplo) aunque esté pegado a la pared
  // alisar: desde cada punto, saltar al más lejano que se vea en línea recta
  const out=[]; let ax=x0, ay=y0, i=0;
  while(i<cells.length){ let j=cells.length-1; while(j>i&&!camRecta(ax,ay,cells[j][0],cells[j][1])) j--; out.push(cells[j]); ax=cells[j][0]; ay=cells[j][1]; i=j+1; }
  return out;
}
/* Pone en marcha a alguien (player o un vecino) hacia (x,y). Devuelve la longitud del camino (0 si no hay). */
function andarA(o,x,y){
  const r=caminoA(o.x,o.y,x,y);
  if(!r||!r.length){ o.tx=o.x; o.ty=o.y; o.path=[]; return 0; }
  let L=0, px=o.x, py=o.y; r.forEach(([a,b])=>{ L+=Math.hypot(a-px,b-py); px=a; py=b; });
  o.tx=r[0][0]; o.ty=r[0][1]; o.path=r.slice(1); o.largo=L;
  return L;
}
