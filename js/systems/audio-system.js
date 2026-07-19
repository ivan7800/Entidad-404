// ENTIDAD 404 — audio sintetizado (Web Audio API, sin archivos externos)
// El contexto solo se crea tras la primera interacción del usuario.

const PREF_KEY = 'e404:audio';

let ctx = null;
let masterGain = null;
let sfxGain = null;
let musicGain = null;
let ambientNodes = null;

const prefs = { master: 0.7, sfx: 0.8, music: 0.35, muted: false };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) Object.assign(prefs, JSON.parse(raw));
  } catch { /* prefs corruptas: se usan valores por defecto */ }
}
function savePrefs() {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* almacenamiento lleno o bloqueado */ }
}

function ensureCtx() {
  if (ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    masterGain = ctx.createGain();
    sfxGain = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain.connect(masterGain);
    musicGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    applyVolumes();
    return true;
  } catch { return false; }
}

function applyVolumes() {
  if (!ctx) return;
  masterGain.gain.value = prefs.muted ? 0 : prefs.master;
  sfxGain.gain.value = prefs.sfx;
  musicGain.gain.value = prefs.music;
}

function tone(freq, dur, { type = 'sine', gain = 0.25, when = 0, glide = null } = {}) {
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(sfxGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const SFX = {
  boton: () => tone(520, 0.08, { type:'triangle', gain:0.12 }),
  comer: () => { tone(300, 0.09, { type:'square', gain:0.1 }); tone(260, 0.09, { type:'square', gain:0.1, when:0.12 }); tone(320, 0.1, { type:'square', gain:0.1, when:0.24 }); },
  feliz: () => { tone(440, 0.1, { gain:0.14 }); tone(554, 0.1, { gain:0.14, when:0.1 }); tone(660, 0.16, { gain:0.16, when:0.2 }); },
  triste: () => tone(330, 0.5, { gain:0.12, glide:180 }),
  alerta: () => { tone(700, 0.09, { type:'square', gain:0.12 }); tone(700, 0.09, { type:'square', gain:0.12, when:0.16 }); },
  exito: () => { tone(523, 0.09, { gain:0.15 }); tone(659, 0.09, { gain:0.15, when:0.09 }); tone(784, 0.09, { gain:0.15, when:0.18 }); tone(1046, 0.22, { gain:0.18, when:0.27 }); },
  evolucion: () => { for (let i = 0; i < 6; i++) tone(300 + i * 120, 0.14, { gain:0.13, when: i * 0.09 }); tone(1200, 0.5, { gain:0.16, when:0.6, glide:1800 }); },
  dormir: () => tone(280, 0.7, { gain:0.1, glide:140 }),
  juego: () => tone(600, 0.07, { type:'triangle', gain:0.12, glide:900 }),
  moneda: () => { tone(880, 0.06, { type:'triangle', gain:0.13 }); tone(1320, 0.12, { type:'triangle', gain:0.13, when:0.06 }); }
};

// Ambiente: zumbido suave de terminal (dos osciladores desafinados + LFO)
function startAmbient() {
  if (!ctx || ambientNodes) return;
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  o1.type = 'sine'; o1.frequency.value = 62;
  o2.type = 'sine'; o2.frequency.value = 62.7;
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.02;
  g.gain.value = 0.05;
  lfo.connect(lfoGain).connect(g.gain);
  o1.connect(g); o2.connect(g);
  g.connect(musicGain);
  o1.start(); o2.start(); lfo.start();
  ambientNodes = { o1, o2, lfo, g };
}
function stopAmbient() {
  if (!ambientNodes) return;
  try { ambientNodes.o1.stop(); ambientNodes.o2.stop(); ambientNodes.lfo.stop(); } catch { /* ya detenido */ }
  ambientNodes = null;
}

export const AudioSystem = {
  prefs,
  init() { loadPrefs(); },
  // Debe llamarse desde un gesto del usuario
  unlock() {
    if (!ensureCtx()) return false;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!prefs.muted && prefs.music > 0) startAmbient();
    return true;
  },
  play(name) {
    if (prefs.muted || !ctx) return;
    SFX[name]?.();
  },
  setVolume(kind, v) {
    prefs[kind] = Math.min(1, Math.max(0, v));
    applyVolumes();
    if (kind === 'music') { if (v > 0 && !prefs.muted) startAmbient(); else stopAmbient(); }
    savePrefs();
  },
  setMuted(m) {
    prefs.muted = !!m;
    applyVolumes();
    if (m) stopAmbient(); else if (prefs.music > 0 && ctx) startAmbient();
    savePrefs();
  },
  pauseAmbient() { stopAmbient(); },
  resumeAmbient() { if (ctx && !prefs.muted && prefs.music > 0) startAmbient(); }
};
