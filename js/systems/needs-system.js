// ENTIDAD 404 — sistema de necesidades
// Funciones puras: reciben estadísticas y horas, devuelven nuevas estadísticas.
// Las estadísticas interactúan entre sí; no es una reducción lineal simple.
import { clamp } from '../utils/helpers.js';

// Tasas base por hora (velocidad Normal, despierta)
export const DECAY_PER_HOUR = {
  hambre: -3.0,      // saciedad baja (antes -4.2, muy exigente para 3 comidas/día)
  energia: -3.0,
  higiene: -2.2,
  felicidad: -1.2,
  salud: 0,          // depende de las demás
  afecto: -0.5,
  disciplina: -0.15,
  estres: +1.0,      // sube lentamente
  curiosidad: -0.25,
  estabilidad: -0.2
};

/**
 * Aplica un bloque de tiempo a las estadísticas.
 * @param {object} stats estadísticas actuales (0-100)
 * @param {number} hours horas del bloque
 * @param {object} ctx { sleeping, night, speed(mult), resting, vacation, sickness }
 * @returns {object} nuevas estadísticas
 */
export function applyDecay(stats, hours, ctx = {}) {
  const s = { ...stats };
  if (hours <= 0) return s;
  const speed = ctx.speed ?? 1;
  // Modo vacaciones: la cámara segura casi congela las necesidades.
  const vacationMult = ctx.vacation ? 0.05 : 1;
  // Modo descanso: deterioro reducido.
  const restMult = ctx.resting ? 0.35 : 1;
  const mult = speed * vacationMult * restMult;

  const asleep = !!ctx.sleeping;

  // Deterioro base
  s.hambre += DECAY_PER_HOUR.hambre * hours * mult * (asleep ? 0.45 : 1);
  s.higiene += DECAY_PER_HOUR.higiene * hours * mult * (asleep ? 0.5 : 1);
  s.felicidad += DECAY_PER_HOUR.felicidad * hours * mult;
  s.afecto += DECAY_PER_HOUR.afecto * hours * mult;
  s.disciplina += DECAY_PER_HOUR.disciplina * hours * mult;
  s.curiosidad += DECAY_PER_HOUR.curiosidad * hours * mult;
  s.estabilidad += DECAY_PER_HOUR.estabilidad * hours * mult;

  if (asleep) {
    // Dormir recupera energía y reduce estrés (también amortiguado en vacaciones/descanso)
    s.energia += 9 * hours * mult;
    s.estres -= 3.5 * hours * mult;
  } else {
    s.energia += DECAY_PER_HOUR.energia * hours * mult;
    s.estres += DECAY_PER_HOUR.estres * hours * mult;
    // Estar despierta de madrugada estresa
    if (ctx.night) s.estres += 1.2 * hours * mult;
  }

  // ── Interacciones entre estadísticas ──
  // Hambre extrema daña salud y felicidad
  if (s.hambre < 15) { s.salud -= 2.0 * hours * mult; s.felicidad -= 1.5 * hours * mult; }
  // Falta de sueño (energía muy baja) dispara estrés
  if (s.energia < 15) { s.estres += 1.8 * hours * mult; s.felicidad -= 0.7 * hours * mult; }
  // Mala higiene erosiona salud y felicidad
  if (s.higiene < 20) { s.salud -= 1.4 * hours * mult; s.felicidad -= 0.6 * hours * mult; }
  // Estrés alto castiga estabilidad y salud
  if (s.estres > 75) { s.estabilidad -= 1.2 * hours * mult; s.salud -= 0.6 * hours * mult; }
  // Afecto alto acelera la recuperación de salud
  if (s.afecto > 70 && s.salud < 90) s.salud += 1.5 * hours * mult;
  // Felicidad alta amortigua el estrés
  if (s.felicidad > 75) s.estres -= 1.0 * hours * mult;
  // Estar enferma drena
  if (ctx.sickness) { s.salud -= 1.2 * hours * mult; s.energia -= 0.8 * hours * mult; s.felicidad -= 0.8 * hours * mult; }

  for (const k of Object.keys(s)) s[k] = clamp(s[k]);
  return s;
}

/**
 * Aura pasiva de la decoración colocada: mejora suave y continua.
 * @param {object} stats estadísticas actuales
 * @param {object} aura suma de fx de las decoraciones colocadas
 * @param {number} hours horas transcurridas
 * @param {object} ctx { sleeping, vacation }
 */
export function applyAura(stats, aura = {}, hours = 0, ctx = {}) {
  if (hours <= 0 || ctx.vacation) return stats;
  const s = { ...stats };
  // Durante el sueño la cámara envuelve más: el aura rinde un 50% extra.
  const restBonus = ctx.sleeping ? 1.5 : 1;
  for (const [k, v] of Object.entries(aura)) {
    if (typeof s[k] !== 'number' || !Number.isFinite(v)) continue;
    s[k] = clamp(s[k] + v * 0.35 * hours * restBonus);
  }
  return s;
}

/** Efectos puntuales de una acción u objeto. */
export function applyEffects(stats, fx = {}) {
  const s = { ...stats };
  for (const [k, v] of Object.entries(fx)) {
    if (k in s) s[k] = clamp(s[k] + v);
  }
  return s;
}

/** Nivel de urgencia global 0-2 para el chip de estado. */
export function urgencyLevel(stats, illness) {
  if (illness || stats.salud < 25 || stats.hambre < 12 || stats.energia < 10) return 2;
  if (stats.hambre < 30 || stats.higiene < 30 || stats.felicidad < 30 || stats.estres > 75 || stats.energia < 25) return 1;
  return 0;
}

/** Puntuación de calidad de cuidado 0-100 (para evolución). */
export function careScore(stats) {
  const positive = (stats.hambre + stats.energia + stats.higiene + stats.felicidad + stats.salud + stats.afecto) / 6;
  return clamp(positive - stats.estres * 0.15);
}
