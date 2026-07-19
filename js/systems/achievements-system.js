// ENTIDAD 404 — logros
import { ACHIEVEMENTS } from '../data/achievements.js';

/**
 * Revisa todos los logros contra el estado. Devuelve los recién desbloqueados.
 * Muta state.achievements y aplica recompensas a state.wallet.
 */
export function checkAchievements(state) {
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    const rec = state.achievements[a.id] || { done:false, ts:0, progress:0 };
    if (rec.done) continue;
    let value = 0;
    if (a.counter) value = state.counters[a.counter] || 0;
    else if (a.record) value = state.records[a.record] || 0;
    else if (a.stat) value = state.creature.stats[a.stat] || 0;
    rec.progress = Math.min(value, a.goal);
    if (value >= a.goal) {
      rec.done = true;
      rec.ts = Date.now();
      if (a.reward?.fragmentos) state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + a.reward.fragmentos);
      if (a.reward?.ecos) state.wallet.ecos = Math.min(99999, state.wallet.ecos + a.reward.ecos);
      unlocked.push(a);
    }
    state.achievements[a.id] = rec;
  }
  return unlocked;
}

export function bump(state, counter, amount = 1) {
  state.counters[counter] = (state.counters[counter] || 0) + amount;
}
