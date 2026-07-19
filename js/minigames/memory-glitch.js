// ENTIDAD 404 — Memoria Glitch: repite la secuencia de símbolos que parpadea.
// Accesible: cada celda tiene forma + color + etiqueta, no solo color.
export function createMemoryGlitch(canvas, { onEnd } = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cells = [
    { sym:'▲', color:'#5ad1c9', label:'triángulo' },
    { sym:'■', color:'#c9a25a', label:'cuadrado' },
    { sym:'●', color:'#7a9ff5', label:'círculo' },
    { sym:'◆', color:'#c95ab0', label:'rombo' }
  ];
  const rects = [];
  const cols = 2, rows = 2, pad = 16;
  const cw = (W - pad*3)/cols, ch = (H - pad*3)/rows;
  for (let i = 0; i < 4; i++) {
    const r = Math.floor(i/cols), c = i%cols;
    rects.push({ x: pad + c*(cw+pad), y: pad + r*(ch+pad), w:cw, h:ch });
  }
  let seq = [], input = [], showing = true, flash = -1, level = 0, score = 0, alive = true, paused = false;
  let stepT = 0, idx = 0;

  function addStep() { seq.push(Math.floor(Math.random()*4)); }
  function nextLevel() { level++; input = []; showing = true; idx = 0; stepT = performance.now() + 400; addStep(); }

  function draw(now) {
    ctx.clearRect(0,0,W,H);
    ctx.font = `${Math.floor(ch*0.4)}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    rects.forEach((r,i) => {
      const on = flash === i;
      ctx.globalAlpha = on ? 1 : 0.35;
      ctx.fillStyle = cells[i].color;
      roundRect(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0b0f12';
      ctx.fillText(cells[i].sym, r.x + r.w/2, r.y + r.h/2);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e8eef4'; ctx.font = '14px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`Nivel ${level}  ·  Puntos ${score}`, 12, H-10);
  }

  function tick(now) {
    if (!alive) return;
    if (!paused) {
      if (showing) {
        if (now >= stepT) {
          if (idx < seq.length) { flash = seq[idx]; stepT = now + 520; idx++; setTimeout(()=>{ if(alive) flash=-1; }, 300); }
          else { showing = false; flash = -1; }
        }
      }
      draw(now);
    }
    requestAnimationFrame(tick);
  }

  function press(i) {
    if (showing || !alive || paused) return;
    flash = i; setTimeout(()=>{ if(alive) flash=-1; }, 140);
    input.push(i);
    const pos = input.length - 1;
    if (input[pos] !== seq[pos]) { end(); return; }
    if (input.length === seq.length) { score += level * 5; setTimeout(()=>{ if(alive) nextLevel(); }, 500); }
  }
  function onClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W/rect.width);
    const y = (e.clientY - rect.top) * (H/rect.height);
    rects.forEach((r,i) => { if (x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h) press(i); });
  }
  function onKey(e) { const k = ['1','2','3','4'].indexOf(e.key); if (k>=0) press(k); }
  function end() {
    alive = false;
    canvas.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKey);
    onEnd && onEnd({ score, best: level });
  }

  canvas.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  nextLevel();
  requestAnimationFrame(tick);
  return {
    pause(){ paused = true; }, resume(){ paused = false; },
    stop(){ if(alive){ alive=false; canvas.removeEventListener('click',onClick); window.removeEventListener('keydown',onKey);} }
  };
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
