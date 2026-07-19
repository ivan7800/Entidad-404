// ENTIDAD 404 — aleatoriedad
export function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function randFloat(min, max) { return Math.random() * (max - min) + min; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function chance(p) { return Math.random() < p; }
export function weightedPick(entries) {
  const total = entries.reduce((s, e) => s + e.w, 0);
  let r = Math.random() * total;
  for (const e of entries) { r -= e.w; if (r <= 0) return e.value; }
  return entries[entries.length - 1].value;
}
// Selección sin repetir la última (para frases)
const lastPicks = new Map();
export function pickFresh(key, arr) {
  if (!arr || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  let v;
  do { v = pick(arr); } while (v === lastPicks.get(key));
  lastPicks.set(key, v);
  return v;
}
