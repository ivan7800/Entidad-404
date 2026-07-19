// ENTIDAD 404 — validación estricta de datos
import { STATS, STAGES, SAVE_SCHEMA_VERSION } from './constants.js';
import { clamp, checksum } from './helpers.js';

export function sanitizeName(raw) {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[<>&"'`\\]/g, '').trim().slice(0, 16);
}

export function isValidName(name) {
  return typeof name === 'string' && name.length >= 1 && name.length <= 16;
}

function num(v, min, max, def) {
  const n = Number(v);
  return Number.isFinite(n) ? clamp(n, min, max) : def;
}

// Normaliza y valida el estado de una partida (importaciones y cargas).
// Devuelve { ok, state?, error? }. Nunca ejecuta contenido importado.
export function validateProfileState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok:false, error:'Estructura de partida no válida.' };
  const c = raw.creature;
  if (!c || typeof c !== 'object') return { ok:false, error:'Falta la criatura en la partida.' };
  if (!isValidName(sanitizeName(c.name))) return { ok:false, error:'Nombre de criatura no válido.' };
  if (!STAGES.includes(c.stage)) return { ok:false, error:'Etapa de criatura no válida.' };

  const state = {
    schema: SAVE_SCHEMA_VERSION,
    createdAt: num(raw.createdAt, 0, 9e15, Date.now()),
    lastTs: num(raw.lastTs, 0, 9e15, Date.now()),
    lastInteraction: num(raw.lastInteraction, 0, 9e15, Date.now()),
    lifeMode: raw.lifeMode === 'legado' ? 'legado' : 'vinculo',
    speed: ['relajada','normal','intensa'].includes(raw.speed) ? raw.speed : 'normal',
    creature: {
      name: sanitizeName(c.name),
      core: ['prisma','abisal','ferrita'].includes(c.core) ? c.core : 'prisma',
      stage: c.stage,
      formId: typeof c.formId === 'string' ? c.formId.slice(0, 40) : 'nucleo_prisma',
      birthTs: num(c.birthTs, 0, 9e15, Date.now()),
      hatched: !!c.hatched,
      sleeping: !!c.sleeping,
      lightsOff: !!c.lightsOff,
      suspended: !!c.suspended,
      illness: typeof c.illness === 'string' ? c.illness.slice(0, 40) : null,
      illnessUntil: num(c.illnessUntil, 0, 9e15, 0),
      stats: {},
      personality: {},
      prefs: {
        favFood: typeof c.prefs?.favFood === 'string' ? c.prefs.favFood.slice(0,40) : null,
        hatedFood: typeof c.prefs?.hatedFood === 'string' ? c.prefs.hatedFood.slice(0,40) : null,
        favGame: typeof c.prefs?.favGame === 'string' ? c.prefs.favGame.slice(0,40) : null
      },
      wakeHour: num(c.wakeHour, 0, 23, 8),
      sleepHour: num(c.sleepHour, 0, 23, 23)
    },
    wallet: {
      fragmentos: num(raw.wallet?.fragmentos, 0, 999999, 0),
      ecos: num(raw.wallet?.ecos, 0, 99999, 0)
    },
    inventory: {},
    decor: {},
    achievements: {},
    records: {},
    counters: {},
    memories: [],
    diary: [],
    legacy: Array.isArray(raw.legacy) ? raw.legacy.slice(0, 20).map(l => ({
      name: sanitizeName(l?.name || '?'), formId: String(l?.formId || '').slice(0,40),
      days: num(l?.days, 0, 9999, 0), ts: num(l?.ts, 0, 9e15, Date.now())
    })) : [],
    discovered: [],
    modes: {
      descanso: !!raw.modes?.descanso,
      descansoUntil: num(raw.modes?.descansoUntil, 0, 9e15, 0),
      vacaciones: !!raw.modes?.vacaciones,
      vacacionesDesde: num(raw.modes?.vacacionesDesde, 0, 9e15, 0)
    },
    gameEnergy: num(raw.gameEnergy, 0, 5, 5),
    gameEnergyTs: num(raw.gameEnergyTs, 0, 9e15, Date.now()),
    anomalies: num(raw.anomalies, 0, 9999, 0),
    _lastActiveDay: typeof raw._lastActiveDay === 'string' ? raw._lastActiveDay.slice(0, 40) : null,
    _lastNightDay: typeof raw._lastNightDay === 'string' ? raw._lastNightDay.slice(0, 40) : null
  };

  for (const s of STATS) state.creature.stats[s] = num(c.stats?.[s], 0, 100, 50);
  const per = c.personality || {};
  for (const k of Object.keys(per)) {
    if (typeof k === 'string' && k.length < 30) state.creature.personality[k.slice(0,30)] = num(per[k], 0, 100, 0);
  }
  const inv = raw.inventory || {};
  for (const k of Object.keys(inv)) {
    const q = num(inv[k], 0, 999, 0);
    if (q > 0 && typeof k === 'string' && k.length < 50) state.inventory[k.slice(0,50)] = q;
  }
  const dec = raw.decor || {};
  for (const k of Object.keys(dec)) {
    if (typeof dec[k] === 'string' && k.length < 30) state.decor[k.slice(0,30)] = dec[k].slice(0, 50);
  }
  const ach = raw.achievements || {};
  for (const k of Object.keys(ach)) {
    const a = ach[k];
    if (a && typeof a === 'object') state.achievements[k.slice(0,50)] = { done: !!a.done, ts: num(a.ts, 0, 9e15, 0), progress: num(a.progress, 0, 999999, 0) };
  }
  const rec = raw.records || {};
  for (const k of Object.keys(rec)) state.records[k.slice(0,50)] = num(rec[k], 0, 9e9, 0);
  const cnt = raw.counters || {};
  for (const k of Object.keys(cnt)) state.counters[k.slice(0,50)] = num(cnt[k], 0, 9e9, 0);
  if (Array.isArray(raw.memories)) {
    state.memories = raw.memories.slice(0, 120).map(m => ({
      id: String(m?.id || '').slice(0, 40), ts: num(m?.ts, 0, 9e15, Date.now()),
      text: String(m?.text || '').slice(0, 200),
      tone: ['neutral','feliz','malo','raro'].includes(m?.tone) ? m.tone : 'neutral'
    })).filter(m => m.text);
  }
  if (Array.isArray(raw.diary)) {
    state.diary = raw.diary.slice(-200).map(d => ({
      ts: num(d?.ts, 0, 9e15, Date.now()), text: String(d?.text || '').slice(0, 240)
    })).filter(d => d.text);
  }
  if (Array.isArray(raw.discovered)) {
    state.discovered = [...new Set(raw.discovered.filter(x => typeof x === 'string').map(x => x.slice(0, 40)))].slice(0, 100);
  }
  return { ok:true, state };
}

// Validación de un archivo exportado completo
export function validateExport(json) {
  let data;
  try { data = JSON.parse(json); } catch { return { ok:false, error:'El archivo no es un JSON válido.' }; }
  if (!data || typeof data !== 'object') return { ok:false, error:'Formato de copia no reconocido.' };
  if (data.app !== 'entidad404') return { ok:false, error:'Este archivo no pertenece a Entidad 404.' };
  if (typeof data.schema !== 'number' || data.schema > SAVE_SCHEMA_VERSION) {
    return { ok:false, error:'La copia procede de una versión más reciente de la aplicación.' };
  }
  if (data.checksum) {
    const body = JSON.stringify(data.state);
    if (checksum(body) !== data.checksum) return { ok:false, error:'La copia parece dañada (checksum no coincide).' };
  }
  const v = validateProfileState(data.state);
  if (!v.ok) return v;
  return { ok:true, state: v.state, exportedAt: data.exportedAt || null };
}
