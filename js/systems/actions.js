// ENTIDAD 404 — acciones de cuidado (capa entre UI y sistemas)
import { applyEffects } from '../systems/needs-system.js';
import { nudgeTrait } from '../systems/personality-system.js';
import { applyMedicine } from '../systems/health-system.js';
import { bump, checkAchievements } from '../systems/achievements-system.js';
import { removeItem } from '../models/inventory.js';
import { ITEM_MAP } from '../data/items.js';
import { StateMachine } from '../core/state-machine.js';
import { AudioSystem } from '../systems/audio-system.js';
import { bus } from '../core/event-bus.js';
import { speak, diaryLine } from '../ui/voice.js';
import { chance } from '../utils/random.js';
import { clamp } from '../utils/helpers.js';

function addMemory(state, text, tone = 'neutral') {
  state.memories.push({ ts: Date.now(), text, tone });
  if (state.memories.length > 120) state.memories.shift();
}
function addDiary(state, text) {
  state.diary.push({ ts: Date.now(), text });
  if (state.diary.length > 200) state.diary.shift();
}

const FOOD_TYPES = new Set(['comida', 'bebida']);

/** Alimentar con un objeto de comida. */
export function feed(state, itemId) {
  const c = state.creature;
  const item = ITEM_MAP[itemId];
  if (!item || !FOOD_TYPES.has(item.tipo)) return { ok:false, reason:'Eso no es comida.' };
  if (!state.inventory[itemId]) return { ok:false, reason:'No te queda de eso.' };
  if (!c.hatched) return { ok:false, reason:'El núcleo aún no ha eclosionado.' };
  if (c.sleeping) return { ok:false, reason:'Está dormida. Déjala descansar.' };
  if (c.stats.hambre > 92) return { ok:false, reason:speak(c,'lleno') };

  removeItem(state.inventory, itemId, 1);
  let fx = { ...(item.fx || {}) };
  let msg, tone = 'neutral';

  // Preferencias
  if (c.prefs.favFood === itemId) { fx.felicidad = (fx.felicidad||0) + 12; fx.afecto = (fx.afecto||0)+4; msg = speak(c,'comer_favorito',{item:item.nombre}); tone='feliz'; }
  else if (c.prefs.hatedFood === itemId) { fx.felicidad = (fx.felicidad||0) - 8; fx.estres = (fx.estres||0)+6; msg = speak(c,'comer_rechazo',{item:item.nombre}); tone='malo'; c.personality = nudgeTrait(c.personality, 'rebelde', 1); }
  else if ((item.fx?.disciplina || 0) > 0 && chance(0.4)) { msg = speak(c,'disciplina',{item:item.nombre}); c.personality = nudgeTrait(c.personality, 'disciplinada', 2); }
  else { msg = speak(c,'comer_bien',{item:item.nombre}); }

  // Descubrir preferencias con el tiempo
  if (!c.prefs.favFood && chance(0.12) && item.cat !== 'anomalo') c.prefs.favFood = itemId;
  else if (!c.prefs.hatedFood && chance(0.08)) c.prefs.hatedFood = itemId;

  // Comida anómala: riesgo de alergia
  if (item.cat === 'anomalo' && chance(item.alergia || 0.1)) {
    c.illness = 'alergia_sintetica';
    c.illnessUntil = Date.now() + 3 * 3600 * 1000;
    addMemory(state, 'Una comida anómala le sentó fatal.', 'malo');
  }

  c.stats = applyEffects(c.stats, fx);
  c.personality = nudgeTrait(c.personality, 'glotona', 2);
  bump(state, 'comidas');
  StateMachine.trigger('chomp', 1200);
  AudioSystem.play('comer');
  addMemory(state, `Comió ${item.nombre}.`, tone);
  addDiary(state, diaryLine(c.prefs.favFood === itemId ? 'favorito' : c.prefs.hatedFood === itemId ? 'rechazo' : 'comida', { nombre:c.name, item:item.nombre }));
  const unlocked = checkAchievements(state);
  bus.emit('action:done', { kind:'feed', msg, unlocked });
  return { ok:true, msg, unlocked };
}

/** Acariciar / dar afecto. */
export function pet(state) {
  const c = state.creature;
  if (!c.hatched) return { ok:false, reason:'El núcleo late, pero aún no responde al tacto.' };
  if (c.sleeping) return { ok:false, reason:'Está dormida.' };
  c.stats = applyEffects(c.stats, { afecto:8, felicidad:6, estres:-5 });
  c.personality = nudgeTrait(c.personality, 'afectuosa', 3);
  bump(state, 'caricias');
  StateMachine.trigger(chance(0.5) ? 'hop' : 'wiggle', 1200);
  AudioSystem.play('feliz');
  const msg = speak(c, 'caricia');
  const unlocked = checkAchievements(state);
  bus.emit('action:done', { kind:'pet', msg, unlocked });
  return { ok:true, msg, unlocked };
}

/** Limpiar la cámara y a la criatura. */
export function clean(state) {
  const c = state.creature;
  if (c.stats.higiene > 90) return { ok:false, reason:'Ya está impecable.' };
  c.stats = applyEffects(c.stats, { higiene:45, felicidad:5, salud:3 });
  c.personality = nudgeTrait(c.personality, 'serena', 1);
  bump(state, 'limpiezas'); bump(state, 'banos');
  StateMachine.trigger('wiggle', 1000);
  AudioSystem.play('boton');
  const msg = speak(c, 'bano');
  addDiary(state, diaryLine('bano', { nombre:c.name }));
  const unlocked = checkAchievements(state);
  bus.emit('action:done', { kind:'clean', msg, unlocked });
  return { ok:true, msg, unlocked };
}

/** Alternar luces para inducir el sueño. */
export function toggleLights(state) {
  const c = state.creature;
  c.lightsOff = !c.lightsOff;
  if (c.lightsOff) { c.personality = nudgeTrait(c.personality, 'dormilona', 2); }
  const wokeGrumpy = !c.lightsOff && c.stats.energia < 45;
  if (wokeGrumpy) c.personality = nudgeTrait(c.personality, 'rebelde', 1);
  const msg = c.lightsOff ? speak(c, 'dormir') : speak(c, (wokeGrumpy ? 'despertar_mal' : 'despertar_bien'));
  if (c.lightsOff) { StateMachine.trigger('zzz', 1500); AudioSystem.play('dormir'); addDiary(state, diaryLine('siesta', { nombre:c.name })); }
  bus.emit('action:done', { kind:'lights', msg });
  return { ok:true, msg, lightsOff:c.lightsOff };
}

/** Administrar medicina. */
export function medicate(state, itemId) {
  const c = state.creature;
  const item = ITEM_MAP[itemId];
  if (!item || item.tipo !== 'medicina') return { ok:false, reason:'Eso no es una medicina.' };
  if (!state.inventory[itemId]) return { ok:false, reason:'No te queda esa medicina.' };
  const res = applyMedicine(c, item);
  if (!res.ok) return res;
  removeItem(state.inventory, itemId, 1);
  c.stats = applyEffects(c.stats, { salud:15, felicidad:4, estres:-6 });
  c.personality = nudgeTrait(c.personality, 'protectora', 1);
  bump(state, 'curas');
  StateMachine.trigger('celebrate', 1300);
  AudioSystem.play('exito');
  const msg = speak(c, 'curado');
  addMemory(state, `Se recuperó de la ${res.name || 'dolencia'}.`, 'feliz');
  addDiary(state, diaryLine('curacion', { nombre:c.name, enfermedad: res.name || 'dolencia' }));
  const unlocked = checkAchievements(state);
  bus.emit('action:done', { kind:'medicate', msg, unlocked });
  return { ok:true, msg, unlocked };
}

/** Charlar: frase contextual + pequeño afecto. */
export function talk(state) {
  const c = state.creature;
  if (!c.hatched) return { ok:true, msg:'El núcleo emite un zumbido tenue.' };
  c.stats = applyEffects(c.stats, { afecto:2, felicidad:2 });
  c.personality = nudgeTrait(c.personality, 'misteriosa', 1);
  // A veces recuerda algo del diario
  let msg;
  if (state.memories.length && chance(0.4)) {
    const mem = state.memories[Math.floor(Math.random()*state.memories.length)];
    msg = speak(c, 'memoria_recuerdo', { memoria: mem.text });
  } else {
    msg = speak(c, 'charla');
  }
  bump(state, 'charlas');
  StateMachine.trigger('nod', 900);
  const unlocked = checkAchievements(state);
  bus.emit('action:done', { kind:'talk', msg, unlocked });
  return { ok:true, msg, unlocked };
}

export { addMemory, addDiary };

/** Explorar la cámara: pequeño impulso de curiosidad. */
export function explore(state) {
  const c = state.creature;
  if (!c.hatched) return { ok:false, reason:'El núcleo aún no ha eclosionado.' };
  if (c.sleeping) return { ok:false, reason:'Está dormida. Deja que descanse.' };
  c.stats = applyEffects(c.stats, { curiosidad:5, energia:-4 });
  c.personality = nudgeTrait(c.personality, 'curiosa', 2);
  bump(state, 'exploraciones');
  StateMachine.trigger('hop', 1000);
  AudioSystem.play('boton');
  const msg = speak(c, 'explorar');
  const unlocked = checkAchievements(state);
  bus.emit('action:done', { kind:'explore', msg, unlocked });
  return { ok:true, msg, unlocked };
}
