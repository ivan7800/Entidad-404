// ENTIDAD 404 — descripción textual del estado (lectores de pantalla)
import { STAT_LABELS, INVERTED_STATS } from '../utils/constants.js';
import { MOOD_LABELS, computeMood } from '../systems/mood-system.js';
import { FORM_MAP } from '../data/creatures.js';

export function describeState(creature) {
  const form = FORM_MAP[creature.formId];
  const mood = computeMood(creature);
  const name = creature.name || 'Tu entidad';
  if (!creature.hatched) return `${name} todavía es un núcleo sin eclosionar.`;
  const parts = [`${name}, ${form ? form.nombre : 'forma desconocida'}. Estado: ${MOOD_LABELS[mood] || mood}.`];
  const s = creature.stats;
  const low = [];
  for (const [k, label] of Object.entries(STAT_LABELS)) {
    const v = Math.round(s[k]);
    const bad = INVERTED_STATS.includes(k) ? v > 70 : v < 30;
    if (bad) low.push(`${label} ${v}`);
  }
  if (low.length) parts.push(`Necesita atención: ${low.join(', ')}.`);
  else parts.push('Sus necesidades están cubiertas.');
  if (creature.illness) parts.push('Está enferma.');
  return parts.join(' ');
}

export function announce(msg) {
  let live = document.getElementById('sr-live');
  if (!live) {
    live = document.createElement('div');
    live.id = 'sr-live';
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
  }
  live.textContent = '';
  requestAnimationFrame(() => { live.textContent = msg; });
}
