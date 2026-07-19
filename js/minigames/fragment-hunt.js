// ENTIDAD 404 — Caza de Fragmentos: toca los fragmentos antes de que se apaguen.
export function createFragmentHunt(canvas, { onEnd, duration = 30000 } = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let score = 0, alive = true, paused = false, tEnd = performance.now() + duration, frags = [], spawnT = 0;

  function spawn(now) {
    const good = Math.random() > 0.22;
    frags.push({
      x: 30 + Math.random()*(W-60), y: 40 + Math.random()*(H-80),
      r: 18 + Math.random()*8, born: now, life: 1100 + Math.random()*700, good
    });
  }
  function draw(now) {
    ctx.clearRect(0,0,W,H);
    frags.forEach(f => {
      const age = (now - f.born)/f.life;
      ctx.globalAlpha = Math.max(0, 1 - age);
      ctx.fillStyle = f.good ? '#5ad1c9' : '#c9556b';
      ctx.beginPath();
      if (f.good) { for(let i=0;i<6;i++){ const a=(i/6)*Math.PI*2 - Math.PI/2; const px=f.x+Math.cos(a)*f.r, py=f.y+Math.sin(a)*f.r; i?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.closePath(); }
      else { ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); }
      ctx.fill();
      if (!f.good) { ctx.strokeStyle='#0b0f12'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(f.x-6,f.y-6); ctx.lineTo(f.x+6,f.y+6); ctx.moveTo(f.x+6,f.y-6); ctx.lineTo(f.x-6,f.y+6); ctx.stroke(); }
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e8eef4'; ctx.font = '14px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`Fragmentos ${score}`, 12, 22);
    const left = Math.max(0, Math.ceil((tEnd-now)/1000));
    ctx.textAlign = 'right'; ctx.fillText(`${left}s`, W-12, 22);
  }
  function tick(now) {
    if (!alive) return;
    if (!paused) {
      if (now >= tEnd) { end(); return; }
      if (now >= spawnT) { spawn(now); spawnT = now + 380 + Math.random()*260; }
      frags = frags.filter(f => now - f.born < f.life);
      draw(now);
    }
    requestAnimationFrame(tick);
  }
  function hit(x,y) {
    if (paused) return;
    for (let i = frags.length-1; i>=0; i--) {
      const f = frags[i];
      if ((x-f.x)**2 + (y-f.y)**2 <= (f.r+6)**2) {
        if (f.good) score++; else score = Math.max(0, score-2);
        frags.splice(i,1); return;
      }
    }
  }
  function onClick(e){ const r=canvas.getBoundingClientRect(); hit((e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height)); }
  function end(){ alive=false; canvas.removeEventListener('click',onClick); onEnd && onEnd({ score }); }
  canvas.addEventListener('click', onClick);
  spawnT = performance.now();
  requestAnimationFrame(tick);
  return { pause(){paused=true;}, resume(){ if(paused){ const d=performance.now(); paused=false; }}, stop(){ if(alive){alive=false; canvas.removeEventListener('click',onClick);} } };
}
