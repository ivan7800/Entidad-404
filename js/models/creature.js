// ENTIDAD 404 — modelo de criatura
import { STATS } from '../utils/constants.js';

export function createCreature({ name, core }) {
  const stats = {};
  for (const s of STATS) stats[s] = 60;
  stats.estres = 10;
  stats.afecto = 20;
  stats.disciplina = 30;
  stats.curiosidad = core === 'prisma' ? 55 : 40;
  stats.estabilidad = core === 'abisal' ? 60 : 45;
  if (core === 'ferrita') stats.disciplina = 45;

  return {
    name,
    core,
    stage: 'nucleo',
    formId: `nucleo_${core}`,
    birthTs: Date.now(),
    hatched: false,
    sleeping: false,
    lightsOff: false,
    suspended: false,
    illness: null,
    illnessUntil: 0,
    stats,
    personality: {}, // acumuladores 0-100 por rasgo
    prefs: { favFood: null, hatedFood: null, favGame: null },
    wakeHour: 8,
    sleepHour: 23
  };
}
