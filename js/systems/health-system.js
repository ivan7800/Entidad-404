// ENTIDAD 404 — salud y enfermedades
import { ILLNESSES } from '../utils/constants.js';
import { chance, pick } from '../utils/random.js';
import { HOUR } from '../utils/helpers.js';

// Riesgo de enfermar en un bloque de horas según el estado (puro salvo el azar).
export function illnessRisk(stats, hours) {
  let p = 0;
  if (stats.higiene < 20) p += 0.02 * hours;
  if (stats.estres > 80) p += 0.018 * hours;
  if (stats.energia < 12) p += 0.015 * hours;
  if (stats.estabilidad < 20) p += 0.02 * hours;
  if (stats.salud < 30) p += 0.01 * hours;
  if (stats.hambre > 92) p += 0.015 * hours;
  return Math.min(0.5, p);
}

export function pickIllness(stats) {
  const candidates = [];
  if (stats.estres > 75) candidates.push('fiebre_senal');
  if (stats.hambre > 90) candidates.push('saturacion_nucleo');
  if (stats.higiene < 25) candidates.push('parasito_pixel');
  if (stats.energia < 18) candidates.push('fatiga_memoria');
  if (stats.estabilidad < 25) candidates.push('inestabilidad_fase');
  if (candidates.length === 0) candidates.push('fiebre_senal');
  return pick(candidates);
}

export function maybeGetSick(creature, hours, rng = chance) {
  if (creature.illness || !creature.hatched || creature.suspended) return null;
  const risk = illnessRisk(creature.stats, hours);
  if (rng(risk)) {
    const id = pickIllness(creature.stats);
    return { id, until: Date.now() + ILLNESSES[id].duracionH * HOUR };
  }
  return null;
}

export function applyMedicine(creature, medItem) {
  if (!creature.illness) return { ok:false, reason:'No está enferma.' };
  const ill = ILLNESSES[creature.illness];
  if (!ill) { creature.illness = null; return { ok:true, cured:true }; }
  if (medItem.cura === creature.illness) {
    creature.illness = null;
    creature.illnessUntil = 0;
    return { ok:true, cured:true, name: ill.nombre };
  }
  return { ok:false, reason:`Esa medicina no trata la ${ill.nombre.toLowerCase()}.` };
}
