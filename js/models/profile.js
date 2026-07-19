// ENTIDAD 404 — modelo de partida (perfil)
import { createCreature } from './creature.js';
import { SAVE_SCHEMA_VERSION, GAME_ENERGY_MAX } from '../utils/constants.js';

export function createProfile({ name, core, lifeMode }) {
  const now = Date.now();
  return {
    schema: SAVE_SCHEMA_VERSION,
    createdAt: now,
    lastTs: now,
    lastInteraction: now,
    lifeMode: lifeMode === 'legado' ? 'legado' : 'vinculo',
    speed: 'normal',
    creature: createCreature({ name, core }),
    wallet: { fragmentos: 50, ecos: 0 },
    inventory: { racion_base: 3, agua_destilada: 2, chispas_dulces: 1 },
    decor: {},
    achievements: {},
    records: {},
    counters: {},
    memories: [],
    diary: [],
    legacy: [],
    discovered: [`nucleo_${core}`],
    modes: { descanso: false, descansoUntil: 0, vacaciones: false, vacacionesDesde: 0 },
    gameEnergy: GAME_ENERGY_MAX,
    gameEnergyTs: now,
    anomalies: 0,
    _lastActiveDay: null,
    _lastNightDay: null
  };
}
