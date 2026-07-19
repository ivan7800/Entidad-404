// ENTIDAD 404 — motor de tiempo
// Simulación por bloques analíticos: nunca itera minuto a minuto miles de veces.
import { MAX_OFFLINE_HOURS, CLOCK_BACK_TOLERANCE_MS, TIME_SPEEDS, GAME_ENERGY_MAX } from '../utils/constants.js';
import { HOUR, clamp } from '../utils/helpers.js';

/**
 * Calcula el tiempo transcurrido válido entre la última marca y ahora.
 * Devuelve { elapsedMs, clamped, anomaly } donde anomaly indica salto de reloj sospechoso.
 * Función pura: testeable sin navegador.
 */
export function computeElapsed(lastTs, nowTs, maxHours = MAX_OFFLINE_HOURS) {
  if (!Number.isFinite(lastTs) || !Number.isFinite(nowTs)) {
    return { elapsedMs: 0, clamped: false, anomaly: true };
  }
  const raw = nowTs - lastTs;
  if (raw < -CLOCK_BACK_TOLERANCE_MS) {
    // Reloj hacia atrás: no castigar, no recompensar. Registrar anomalía.
    return { elapsedMs: 0, clamped: false, anomaly: true };
  }
  if (raw < 0) return { elapsedMs: 0, clamped: false, anomaly: false };
  const maxMs = maxHours * HOUR;
  if (raw > maxMs) return { elapsedMs: maxMs, clamped: true, anomaly: raw > maxMs * 4 };
  return { elapsedMs: raw, clamped: false, anomaly: false };
}

/** Multiplicador de velocidad configurado. */
export function speedFactor(speed) {
  return TIME_SPEEDS[speed] ?? 1;
}

/**
 * Divide un intervalo largo en bloques de simulación (máx. 24 bloques).
 * Cada bloque devuelve { startTs, hours, phase } con la franja horaria dominante.
 */
export function splitIntoBlocks(startTs, elapsedMs, maxBlocks = 24) {
  if (elapsedMs <= 0) return [];
  const totalH = elapsedMs / HOUR;
  const n = Math.max(1, Math.min(maxBlocks, Math.ceil(totalH)));
  const blockH = totalH / n;
  const blocks = [];
  for (let i = 0; i < n; i++) {
    const ts = startTs + i * blockH * HOUR;
    const h = new Date(ts).getHours();
    const night = h >= 23 || h < 7;
    blocks.push({ startTs: ts, hours: blockH, night });
  }
  return blocks;
}

/** Regeneración de energía de minijuegos: 1 punto cada 30 min. */
export function regenGameEnergy(current, lastTs, nowTs, max = GAME_ENERGY_MAX) {
  const elapsed = Math.max(0, nowTs - lastTs);
  const gained = Math.floor(elapsed / (30 * 60 * 1000));
  if (gained <= 0) return { energy: clamp(current, 0, max), ts: lastTs };
  return { energy: clamp(current + gained, 0, max), ts: lastTs + gained * 30 * 60 * 1000 };
}

/** ¿Es hora de dormir según el horario configurado de la criatura? */
export function isSleepWindow(hourNow, sleepHour, wakeHour) {
  if (sleepHour === wakeHour) return false;
  if (sleepHour < wakeHour) return hourNow >= sleepHour && hourNow < wakeHour;
  return hourNow >= sleepHour || hourNow < wakeHour; // ventana que cruza medianoche
}
