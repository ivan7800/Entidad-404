// ENTIDAD 404 — voz de la criatura (frases contextuales locales, sin IA remota)
import { DIALOGUES, DREAMS, DIARY_TEMPLATES } from '../data/dialogues.js';
import { pickFresh, pick } from '../utils/random.js';
import { dominantTrait } from '../systems/personality-system.js';
import { escapeHTML } from '../utils/helpers.js';

/** Devuelve una frase para un contexto, ajustada al rasgo dominante si existe variante. */
export function speak(creature, context, vars = {}) {
  const trait = dominantTrait(creature.personality);
  let key = context;
  let pool = null;
  if (trait && DIALOGUES[`${context}_${trait}`]) { key = `${context}_${trait}`; pool = DIALOGUES[key]; }
  else pool = DIALOGUES[context];
  if (!pool || pool.length === 0) { key = 'charla'; pool = DIALOGUES.charla || ['...']; }
  let line = pickFresh(key, pool);
  for (const [k, v] of Object.entries(vars)) line = line.replaceAll(`{${k}}`, escapeHTML(String(v)));
  return line;
}

export function dream() { return pick(DREAMS); }

/** Genera una entrada de diario a partir de una plantilla. */
export function diaryLine(kind, vars = {}) {
  const pool = DIARY_TEMPLATES[kind] || DIARY_TEMPLATES.general || ['Un día más en la cámara.'];
  let line = pick(pool);
  for (const [k, v] of Object.entries(vars)) line = line.replaceAll(`{${k}}`, String(v));
  return line;
}
