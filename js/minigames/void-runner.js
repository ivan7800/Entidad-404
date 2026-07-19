// ENTIDAD 404 — Corredor del Vacío: esquiva los bloques. Puntúa por distancia.
// Un solo control: saltar (espacio / clic / toque).
export function createVoidRunner(canvas, { onEnd } = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const groundY = H - 40;
  let y = groundY, vy = 0, jumping = false, dist = 0, speed = 4, obstacles = [], spawnX = W, alive = true, paused = false, last = performance.now();
  const G = 1400, JUMP = -520;

  function jump(){ if(!jumping && !paused){ vy = JUMP; jumping = true; } }
  function spawn(){ const h = 20 + Math.random()*34; obstacles.push({ x:W+20, w:16+Math.random()*14, h }); }
  function tick(now){
    if(!alive) return;
    if(!paused){
      const dt = Math.min(50, now-last)/1000; last = now;
      speed += dt*0.25;
      dist += speed*dt*10;
      vy += G*dt; y += vy*dt;
      if(y >= groundY){ y = groundY; vy = 0; jumping = false; }
      obstacles.forEach(o => o.x -= speed*60*dt);
      obstacles = obstacles.filter(o => o.x + o.w > -10);
      if(obstacles.length===0 || obstacles[obstacles.length-1].x < W-160-Math.random()*120) spawn();
      // colisión
      const px = 50;
      for(const o of obstacles){
        if(px+14 > o.x && px-14 < o.x+o.w && y+14 > groundY-o.h){ end(); return; }
      }
      draw();
    } else last = now;
    requestAnimationFrame(tick);
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#2b3742'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,groundY+16); ctx.lineTo(W,groundY+16); ctx.stroke();
    // criatura
    ctx.fillStyle='#5ad1c9';
    ctx.beginPath(); ctx.arc(50, y, 14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#0b0f12'; ctx.beginPath(); ctx.arc(55, y-3, 3, 0, Math.PI*2); ctx.fill();
    // obstáculos
    ctx.fillStyle='#c9556b';
    obstacles.forEach(o => ctx.fillRect(o.x, groundY-o.h, o.w, o.h+16));
    ctx.fillStyle='#e8eef4'; ctx.font='14px monospace'; ctx.textAlign='left';
    ctx.fillText(`Distancia ${Math.floor(dist)}`, 12, 22);
  }
  function onKey(e){ if(e.key===' '||e.key==='ArrowUp'){ e.preventDefault(); jump(); } }
  function onPointer(){ jump(); }
  function end(){ alive=false; cleanup(); onEnd && onEnd({ score: Math.floor(dist) }); }
  function cleanup(){ window.removeEventListener('keydown',onKey); canvas.removeEventListener('pointerdown',onPointer); }
  window.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', onPointer);
  requestAnimationFrame(tick);
  return { pause(){paused=true;}, resume(){paused=false; last=performance.now();}, stop(){ if(alive){alive=false; cleanup();} } };
}
