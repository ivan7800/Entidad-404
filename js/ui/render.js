// ENTIDAD 404 — renderizador procedural de criaturas (SVG generado)
// Sin imágenes externas: cada forma se dibuja según cuerpo + hue + etapa.
import { FORM_MAP } from '../data/creatures.js';

const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

function hsl(h, s, l) { return `hsl(${h} ${s}% ${l}%)`; }

// Escala por etapa (el núcleo/recién es pequeño; el adulto, grande)
const STAGE_SCALE = { nucleo:0.55, recien:0.62, cria:0.75, juvenil:0.88, adulto:1 };

/**
 * Devuelve un <svg> con la criatura dibujada.
 * @param {object} creature estado de la criatura
 * @param {object} opts { mood, anim, blink }
 */
export function renderCreature(creature, opts = {}) {
  const form = FORM_MAP[creature.formId] || FORM_MAP[`nucleo_${creature.core}`];
  const svg = el('svg', { viewBox:'0 0 200 200', class:'creature-svg', role:'img' });
  svg.setAttribute('aria-hidden', 'true');
  const scale = STAGE_SCALE[creature.stage] ?? 0.8;
  const g = el('g', { transform:`translate(100 108) scale(${scale})` });

  const hue = form.hue ?? 190;
  const mood = opts.mood || 'tranquila';
  const cuerpo = form.cuerpo || 'blob';

  // Sombra en el suelo
  g.appendChild(el('ellipse', { cx:0, cy:64, rx:46, ry:10, fill:'rgba(0,0,0,0.28)' }));

  const bodyColor = hsl(hue, mood === 'enferma' ? 20 : 62, mood === 'triste' ? 42 : 55);
  const bodyLight = hsl(hue, 70, 68);
  const bodyDark = hsl(hue, 55, 34);

  const idle = mood === 'dormida' || mood === 'suspendida' ? '' : ` idle-${form.familia}`;
  const body = el('g', { class:`creature-body${idle}` });

  drawBody(body, cuerpo, { bodyColor, bodyLight, bodyDark, hue });
  drawFace(body, { mood, blink: opts.blink, anim: opts.anim, hue });
  drawFamilyMark(body, form.familia, hue);

  // Núcleo brillante (todas tienen un punto de luz interno)
  const core = el('circle', { cx:0, cy:6, r:5, fill:bodyLight, opacity:0.85 });
  core.appendChild(el('animate', { attributeName:'opacity', values:'0.5;0.95;0.5', dur:'3s', repeatCount:'indefinite' }));
  body.appendChild(core);

  g.appendChild(body);
  svg.appendChild(g);
  return svg;
}

function drawBody(g, cuerpo, c) {
  const grad = uniqueGradient(g, c.bodyLight, c.bodyColor, c.bodyDark);
  const fill = `url(#${grad})`;
  const stroke = c.bodyDark;
  switch (cuerpo) {
    case 'egg':
      g.appendChild(el('path', { d:'M0,-58 C34,-58 42,-8 42,18 C42,50 22,64 0,64 C-22,64 -42,50 -42,18 C-42,-8 -34,-58 0,-58 Z', fill, stroke, 'stroke-width':2 }));
      // grietas sutiles
      g.appendChild(el('path', { d:'M-8,-20 L2,-6 L-6,6 L4,18', fill:'none', stroke:c.bodyDark, 'stroke-width':1.4, opacity:0.5 }));
      break;
    case 'blob':
      g.appendChild(el('path', { d:'M0,-46 C30,-46 50,-24 50,4 C50,40 28,60 0,60 C-28,60 -50,40 -50,4 C-50,-24 -30,-46 0,-46 Z', fill, stroke, 'stroke-width':2 }));
      break;
    case 'round':
      g.appendChild(el('circle', { cx:0, cy:8, r:52, fill, stroke, 'stroke-width':2 }));
      break;
    case 'orb':
      g.appendChild(el('circle', { cx:0, cy:6, r:50, fill, stroke, 'stroke-width':2 }));
      g.appendChild(el('ellipse', { cx:-16, cy:-12, rx:14, ry:9, fill:c.bodyLight, opacity:0.4 }));
      break;
    case 'tall':
      g.appendChild(el('path', { d:'M-30,60 C-38,-30 -20,-64 0,-64 C20,-64 38,-30 30,60 Z', fill, stroke, 'stroke-width':2 }));
      break;
    case 'angular':
      g.appendChild(el('path', { d:'M0,-58 L46,-14 L30,58 L-30,58 L-46,-14 Z', fill, stroke, 'stroke-width':2 }));
      break;
    case 'cube':
      g.appendChild(el('path', { d:'M-40,-34 L40,-34 L40,46 L-40,46 Z', fill, stroke, 'stroke-width':2 }));
      g.appendChild(el('path', { d:'M-40,-34 L-24,-50 L56,-50 L40,-34 Z', fill:c.bodyLight, stroke, 'stroke-width':2, opacity:0.85 }));
      g.appendChild(el('path', { d:'M40,-34 L56,-50 L56,30 L40,46 Z', fill:c.bodyDark, stroke, 'stroke-width':2, opacity:0.9 }));
      break;
    case 'ghost':
      g.appendChild(el('path', { d:'M0,-52 C30,-52 46,-28 46,2 L46,52 L32,42 L20,54 L6,42 L-6,54 L-20,42 L-32,54 L-46,42 L-46,2 C-46,-28 -30,-52 0,-52 Z', fill, stroke, 'stroke-width':2, opacity:0.92 }));
      break;
    case 'sprout':
      g.appendChild(el('path', { d:'M0,-40 C26,-40 44,-18 44,10 C44,44 24,60 0,60 C-24,60 -44,44 -44,10 C-44,-18 -26,-40 0,-40 Z', fill, stroke, 'stroke-width':2 }));
      g.appendChild(el('path', { d:'M0,-40 C-4,-58 -18,-64 -22,-72 C-8,-70 2,-60 0,-40 Z', fill:hsl(120,45,45), stroke:hsl(120,40,30), 'stroke-width':1.5 }));
      g.appendChild(el('path', { d:'M0,-42 C6,-60 20,-66 24,-74 C10,-72 0,-62 0,-42 Z', fill:hsl(130,48,50), stroke:hsl(130,40,32), 'stroke-width':1.5 }));
      break;
    default:
      g.appendChild(el('circle', { cx:0, cy:8, r:48, fill, stroke, 'stroke-width':2 }));
  }
}

function drawFace(g, { mood, blink, anim, hue }) {
  const eyeColor = '#0b0f12';
  const eyeWhite = '#f2f7fb';
  const closed = blink || mood === 'dormida' || mood === 'suspendida';
  const ex = 15, ey = -6;

  if (closed) {
    g.appendChild(el('path', { d:`M${-ex-7},${ey} q7,6 14,0`, fill:'none', stroke:eyeColor, 'stroke-width':2.4, 'stroke-linecap':'round' }));
    g.appendChild(el('path', { d:`M${ex-7},${ey} q7,6 14,0`, fill:'none', stroke:eyeColor, 'stroke-width':2.4, 'stroke-linecap':'round' }));
  } else {
    for (const sx of [-ex, ex]) {
      g.appendChild(el('circle', { cx:sx, cy:ey, r:8, fill:eyeWhite }));
      const pupilY = mood === 'triste' ? ey + 2 : ey;
      const pupil = el('circle', { cx:sx, cy:pupilY, r:4.2, fill:eyeColor });
      g.appendChild(pupil);
      g.appendChild(el('circle', { cx:sx - 1.5, cy:pupilY - 1.5, r:1.3, fill:'#fff' }));
    }
  }

  // Boca según ánimo
  let mouth;
  switch (mood) {
    case 'radiante': case 'feliz':
      mouth = el('path', { d:'M-10,14 q10,12 20,0', fill:'none', stroke:eyeColor, 'stroke-width':2.4, 'stroke-linecap':'round' }); break;
    case 'triste': case 'enferma':
      mouth = el('path', { d:'M-10,20 q10,-10 20,0', fill:'none', stroke:eyeColor, 'stroke-width':2.4, 'stroke-linecap':'round' }); break;
    case 'hambrienta': case 'agotada': case 'estresada':
      mouth = el('path', { d:'M-8,17 l16,0', fill:'none', stroke:eyeColor, 'stroke-width':2.4, 'stroke-linecap':'round' }); break;
    case 'dormida': case 'suspendida':
      mouth = el('ellipse', { cx:0, cy:16, rx:4, ry:5, fill:eyeColor, opacity:0.7 }); break;
    default:
      mouth = el('path', { d:'M-8,15 q8,7 16,0', fill:'none', stroke:eyeColor, 'stroke-width':2.2, 'stroke-linecap':'round' });
  }
  g.appendChild(mouth);

  // Mejillas cuando está contenta
  if (mood === 'radiante' || mood === 'tranquila') {
    g.appendChild(el('circle', { cx:-26, cy:10, r:5, fill:hsl(hue, 80, 70), opacity:0.35 }));
    g.appendChild(el('circle', { cx:26, cy:10, r:5, fill:hsl(hue, 80, 70), opacity:0.35 }));
  }
  // Zzz al dormir
  if (mood === 'dormida') {
    const z = el('text', { x:40, y:-40, fill:'#9fb4c4', 'font-size':'16', 'font-family':'monospace' });
    z.textContent = 'z';
    g.appendChild(z);
  }
}

function drawFamilyMark(g, familia, hue) {
  switch (familia) {
    case 'prisma':
      g.appendChild(el('path', { d:'M0,-70 l10,16 l-20,0 Z', fill:hsl(hue,80,72), opacity:0.9 })); break;
    case 'ferrita':
      g.appendChild(el('rect', { x:-6, y:-78, width:12, height:12, fill:hsl(hue,30,60), stroke:'#333', 'stroke-width':1.5, transform:'rotate(45 0 -72)' })); break;
    case 'abisal':
      g.appendChild(el('path', { d:'M-14,-70 q14,-12 28,0', fill:'none', stroke:hsl(hue,70,60), 'stroke-width':3, 'stroke-linecap':'round' })); break;
    case 'espectral':
      g.appendChild(el('circle', { cx:0, cy:-72, r:7, fill:'none', stroke:hsl(hue,60,70), 'stroke-width':2, opacity:0.8 })); break;
    case 'astral':
      for (let i = 0; i < 5; i++) { const a = (i/5)*Math.PI*2 - Math.PI/2; g.appendChild(el('circle', { cx:Math.cos(a)*10, cy:-72+Math.sin(a)*10, r:1.8, fill:hsl(hue,80,80) })); } break;
    case 'mecanica':
      g.appendChild(el('circle', { cx:0, cy:-72, r:7, fill:'none', stroke:hsl(hue,20,65), 'stroke-width':2, 'stroke-dasharray':'3 2' })); break;
    case 'glitch':
      g.appendChild(el('rect', { x:-8, y:-76, width:6, height:6, fill:hsl(320,80,60) }));
      g.appendChild(el('rect', { x:2, y:-72, width:6, height:6, fill:hsl(160,80,55) })); break;
    // botánica: hojas ya dibujadas en el cuerpo sprout
  }
}

let gradCount = 0;
function uniqueGradient(g, c1, c2, c3) {
  const id = `grad-${gradCount++}`;
  const defs = el('defs');
  const rg = el('radialGradient', { id, cx:'40%', cy:'32%', r:'75%' });
  rg.appendChild(el('stop', { offset:'0%', 'stop-color':c1 }));
  rg.appendChild(el('stop', { offset:'60%', 'stop-color':c2 }));
  rg.appendChild(el('stop', { offset:'100%', 'stop-color':c3 }));
  defs.appendChild(rg);
  g.appendChild(defs);
  return id;
}

// Miniatura para el archivo/dex (silueta simple)
export function renderThumb(formId, { discovered = true } = {}) {
  const form = FORM_MAP[formId];
  const svg = el('svg', { viewBox:'0 0 100 100', class:'thumb-svg', 'aria-hidden':'true' });
  if (!form) return svg;
  const g = el('g', { transform:'translate(50 54) scale(0.7)' });
  if (!discovered) {
    g.appendChild(el('circle', { cx:0, cy:6, r:44, fill:'#1a2128' }));
    const q = el('text', { x:0, y:16, 'text-anchor':'middle', fill:'#3d4a56', 'font-size':'48', 'font-family':'monospace' });
    q.textContent = '?';
    g.appendChild(q);
  } else {
    const hue = form.hue ?? 190;
    drawBody(g, form.cuerpo || 'blob', { bodyColor:hsl(hue,60,52), bodyLight:hsl(hue,70,66), bodyDark:hsl(hue,55,32), hue });
    drawFace(g, { mood:'tranquila', hue });
  }
  svg.appendChild(g);
  return svg;
}
