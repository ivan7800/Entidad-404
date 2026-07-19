// ENTIDAD 404 — Equilibrio de Señal: mantén el punto dentro de la banda central.
// Puntúa por segundos de estabilidad. Teclado (flechas) o puntero.
export function createSignalBalance(canvas, { onEnd } = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let pos = H/2, target = H/2, vel = 0, drift = 0, score = 0, seconds = 0;
  let alive = true, paused = false, last = performance.now(), keyUp=false, keyDown=false;
  const bandH = 90;

  function tick(now) {
    if (!alive) return;
    if (!paused) {
      const dt = Math.min(50, now - last) / 1000; last = now;
      // deriva aleatoria creciente
      drift += (Math.random()-0.5) * 40 * dt;
      drift *= 0.96;
      target = H/2 + Math.sin(now/900)*60 + drift*3;
      // control del jugador
      if (keyUp) vel -= 320*dt;
      if (keyDown) vel += 320*dt;
      vel *= 0.9;
      pos += vel*dt;
      pos = Math.max(20, Math.min(H-20, pos));
      const inBand = Math.abs(pos - target) < bandH/2;
      if (inBand) { seconds += dt; score = Math.floor(seconds); }
      else { seconds = Math.max(0, seconds - dt*1.5); }
      draw(inBand);
    } else { last = now; }
    requestAnimationFrame(tick);
  }
  function draw(inBand) {
    ctx.clearRect(0,0,W,H);
    // banda objetivo
    ctx.fillStyle = inBand ? 'rgba(90,209,201,0.18)' : 'rgba(201,85,107,0.15)';
    ctx.fillRect(0, target - bandH/2, W, bandH);
    ctx.strokeStyle = inBand ? '#5ad1c9' : '#c9556b';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, target - bandH/2, W, bandH);
    // punto del jugador
    ctx.fillStyle = '#e8eef4';
    ctx.beginPath(); ctx.arc(W/2, pos, 12, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#e8eef4'; ctx.font = '14px monospace'; ctx.textAlign='left';
    ctx.fillText(`Estabilidad ${score}s`, 12, 22);
  }
  function onDown(e){ const r=canvas.getBoundingClientRect(); const y=(e.clientY-r.top)*(H/r.height); target> y ? (keyUp=true) : (keyDown=true); setTimeout(()=>{keyUp=keyDown=false;},120); pointerMove(e);}
  function pointerMove(e){ if(e.buttons){ const r=canvas.getBoundingClientRect(); const y=(e.clientY-r.top)*(H/r.height); vel += (y-pos)*0.15; } }
  function onKeyDown(e){ if(e.key==='ArrowUp'){keyUp=true;e.preventDefault();} if(e.key==='ArrowDown'){keyDown=true;e.preventDefault();} }
  function onKeyUp(e){ if(e.key==='ArrowUp')keyUp=false; if(e.key==='ArrowDown')keyDown=false; }
  function end(){ alive=false; cleanup(); onEnd && onEnd({ score }); }
  function cleanup(){ canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',pointerMove); window.removeEventListener('keydown',onKeyDown); window.removeEventListener('keyup',onKeyUp); }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', pointerMove);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  // fin a los 45s
  const timer = setTimeout(end, 45000);
  requestAnimationFrame(tick);
  return { pause(){paused=true;}, resume(){paused=false; last=performance.now();}, stop(){ if(alive){alive=false; clearTimeout(timer); cleanup();} } };
}
