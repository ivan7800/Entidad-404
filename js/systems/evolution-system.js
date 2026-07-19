// ENTIDAD 404 — sistema de evolución
// Puntúa cada forma candidata según condiciones; nunca una sola mala acción
// decide el resultado: se suman señales acumuladas.
import { FORMS, FORM_MAP } from '../data/creatures.js';
import { STAGES, STAGE_HOURS, TIME_SPEEDS } from '../utils/constants.js';
import { HOUR } from '../utils/helpers.js';
import { dominantTrait } from './personality-system.js';
import { careScore } from './needs-system.js';

/** Etapa siguiente o null si ya es adulta. */
export function nextStage(stage) {
  const i = STAGES.indexOf(stage);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
}

/** ¿Ha cumplido la edad mínima de su etapa? */
export function stageComplete(creature, nowTs, speed = 'normal') {
  const hours = STAGE_HOURS[creature.stage];
  if (hours == null) return false; // adulto: no evoluciona más
  const mult = TIME_SPEEDS[speed] ?? 1;
  const elapsedH = (nowTs - creature.birthTs) / HOUR * mult;
  // birthTs se reinicia en cada evolución, así que mide la etapa actual
  return elapsedH >= hours;
}

/**
 * Puntúa una forma para el estado dado. Devuelve -Infinity si es inviable.
 * ctx: { core, family, dominant, stats, anomalies, counters, legacyCount, isNight, evoItems:Set }
 */
export function scoreForm(form, ctx) {
  const c = form.cond || {};
  let score = 1;

  if (c.core) {
    if (c.core !== ctx.core) return -Infinity;
    score += 10;
  }
  if (c.family) {
    if (c.family === ctx.family) score += 8;
    else if (ctx.evoItems?.has(c.family)) score += 6; // objeto evolutivo abre familias
    else score -= 6;
  }
  if (c.trait) {
    if (c.trait === ctx.dominant) score += 7;
    else score -= 3;
  }
  if (c.stat) {
    for (const [k, v] of Object.entries(c.stat)) {
      const cur = ctx.stats[k] ?? 50;
      if (v >= 0) { // mínimo requerido
        if (cur >= v) score += 4; else score -= (v - cur) / 10;
      } else { // máximo permitido (v negativo → stat debe ser <= |v|)
        const max = -v;
        if (cur <= max) score += 4; else score -= (cur - max) / 10;
      }
    }
  }
  if (c.anomalies) {
    if ((ctx.anomalies || 0) >= c.anomalies) score += 6; else return -Infinity;
  }
  if (c.night) {
    if (ctx.isNight) score += 5; else score -= 4;
  }
  if (c.counter) {
    for (const [k, v] of Object.entries(c.counter)) {
      if ((ctx.counters?.[k] || 0) >= v) score += 5; else return -Infinity;
    }
  }
  if (c.legacy) {
    if ((ctx.legacyCount || 0) >= c.legacy) score += 6; else return -Infinity;
  }
  // Las secretas exigen puntuación alta además de sus condiciones
  if (form.secreta && score < 14) return -Infinity;
  // Buen cuidado favorece formas exigentes; mal cuidado empuja a formas básicas
  score += (ctx.care - 50) / 25;
  return score;
}

/**
 * Elige la mejor forma para la siguiente etapa. Determinista salvo empates.
 */
export function chooseEvolution(creature, ctx0 = {}) {
  const stage = nextStage(creature.stage);
  if (!stage) return null;
  const currentFamily = FORM_MAP[creature.formId]?.familia || creature.core;
  const ctx = {
    core: creature.core,
    family: currentFamily,
    dominant: dominantTrait(creature.personality),
    stats: creature.stats,
    care: careScore(creature.stats),
    anomalies: ctx0.anomalies || 0,
    counters: ctx0.counters || {},
    legacyCount: ctx0.legacyCount || 0,
    isNight: !!ctx0.isNight,
    evoItems: ctx0.evoItems || new Set()
  };
  const candidates = FORMS.filter(f => f.etapa === stage);
  let best = null, bestScore = -Infinity;
  for (const f of candidates) {
    const s = scoreForm(f, ctx);
    if (s > bestScore) { best = f; bestScore = s; }
  }
  return best;
}

/** Pistas del archivo sin revelar la fórmula completa. */
export function formHint(form) {
  const c = form.cond || {};
  if (form.secreta) return 'Condiciones desconocidas. Los rumores hablan de cuidados extraordinarios.';
  const hints = [];
  if (c.core) return `Nace del Núcleo ${c.core.charAt(0).toUpperCase()}${c.core.slice(1)}.`;
  if (c.family) hints.push(`afín a la familia ${c.family}`);
  if (c.trait) hints.push('cierto carácter concreto');
  if (c.stat) hints.push('un cuidado particular en algunas necesidades');
  if (c.night) hints.push('la compañía nocturna');
  if (c.anomalies) hints.push('las anomalías registradas');
  if (hints.length === 0) return 'Aparece cuando el resto de caminos no reclaman a la criatura.';
  return `Parece favorecerla: ${hints.join(', ')}.`;
}
