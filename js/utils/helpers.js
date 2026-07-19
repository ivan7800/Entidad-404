// ENTIDAD 404 — helpers
export const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const now = () => Date.now();
export const HOUR = 3600000;
export const MINUTE = 60000;

export function formatDuration(ms) {
  const m = Math.floor(ms / MINUTE);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h ${m % 60} min`;
  return `${Math.floor(h / 24)} días`;
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
}
export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
}

export function ageLabel(birthTs, ref = Date.now()) {
  const d = Math.floor((ref - birthTs) / (24 * HOUR));
  if (d < 1) return 'menos de un día';
  if (d === 1) return '1 día';
  return `${d} días`;
}

// Franja del día según hora local
export function dayPhase(date = new Date()) {
  const h = date.getHours();
  if (h >= 6 && h < 9) return 'amanecer';
  if (h >= 9 && h < 19) return 'dia';
  if (h >= 19 && h < 22) return 'atardecer';
  return 'noche';
}

export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// Checksum simple (FNV-1a) para exportaciones
export function checksum(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function deepClone(obj) {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
