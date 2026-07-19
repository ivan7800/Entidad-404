// ENTIDAD 404 — tests del motor (partes puras)
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeElapsed, splitIntoBlocks, regenGameEnergy, isSleepWindow, speedFactor } from '../js/core/time-engine.js';
import { applyDecay, applyEffects, urgencyLevel, careScore } from '../js/systems/needs-system.js';
import { nextStage, scoreForm } from '../js/systems/evolution-system.js';
import { gameReward, canAfford } from '../js/systems/economy-system.js';
import { MAX_OFFLINE_HOURS, STATS } from '../js/utils/constants.js';
import { GameEngine } from '../js/core/game-engine.js';
import { createProfile } from '../js/models/profile.js';

const HOUR = 3600000;
function baseStats(v = 60) { const s = {}; for (const k of STATS) s[k] = v; s.estres = 20; return s; }

test('computeElapsed: tiempo normal hacia adelante', () => {
  const now = 1_000_000_000_000;
  const r = computeElapsed(now - 2 * HOUR, now, MAX_OFFLINE_HOURS);
  assert.equal(r.anomaly, false);
  assert.equal(r.clamped, false);
  assert.ok(Math.abs(r.elapsedMs - 2 * HOUR) < 5);
});

test('computeElapsed: recorte a MAX_OFFLINE_HOURS', () => {
  const now = 1_000_000_000_000;
  const r = computeElapsed(now - 200 * HOUR, now, MAX_OFFLINE_HOURS);
  assert.equal(r.clamped, true);
  assert.ok(r.elapsedMs <= MAX_OFFLINE_HOURS * HOUR + 5);
});

test('computeElapsed: reloj hacia atrás marca anomalía sin tiempo negativo', () => {
  const now = 1_000_000_000_000;
  const r = computeElapsed(now + 60 * 60 * 1000, now, MAX_OFFLINE_HOURS);
  assert.equal(r.anomaly, true);
  assert.ok(r.elapsedMs <= 0 || r.elapsedMs === 0);
});

test('splitIntoBlocks: cubre el intervalo y respeta el máximo de bloques', () => {
  const start = 1_000_000_000_000;
  const blocks = splitIntoBlocks(start, 10 * HOUR, 24);
  const totalH = blocks.reduce((s, b) => s + b.hours, 0);
  assert.ok(Math.abs(totalH - 10) < 0.01);
  assert.ok(blocks.length <= 24);
  for (const b of blocks) assert.equal(typeof b.night, 'boolean');
});

test('regenGameEnergy: regenera 1 punto cada 30 min sin pasar del máximo', () => {
  const now = 1_000_000_000_000;
  const r1 = regenGameEnergy(2, now - 30 * 60 * 1000, now, 5);
  assert.equal(r1.energy, 3);
  const r2 = regenGameEnergy(5, now - 5 * HOUR, now, 5);
  assert.equal(r2.energy, 5); // no supera el tope
  const r3 = regenGameEnergy(0, now - 90 * 60 * 1000, now, 5);
  assert.equal(r3.energy, 3); // 3 medias horas -> +3
});

test('isSleepWindow: ventana nocturna con cruce de medianoche', () => {
  assert.equal(isSleepWindow(23, 22, 8), true);
  assert.equal(isSleepWindow(3, 22, 8), true);
  assert.equal(isSleepWindow(7, 22, 8), true);
  assert.equal(isSleepWindow(12, 22, 8), false);
  assert.equal(isSleepWindow(21, 22, 8), false);
});

test('isSleepWindow: ventana diurna sin cruce', () => {
  assert.equal(isSleepWindow(14, 13, 15), true);
  assert.equal(isSleepWindow(16, 13, 15), false);
});

test('speedFactor: valores conocidos y por defecto', () => {
  assert.equal(speedFactor('normal'), 1);
  assert.ok(speedFactor('relajada') < 1);
  assert.ok(speedFactor('intensa') > 1);
  assert.equal(speedFactor('desconocido'), 1);
});

test('applyDecay: la saciedad baja con el tiempo despierta', () => {
  const s0 = baseStats(80);
  const s1 = applyDecay(s0, 3, { sleeping:false, night:false, speed:1 });
  assert.ok(s1.hambre < s0.hambre);
  for (const k of STATS) { assert.ok(s1[k] >= 0 && s1[k] <= 100); }
});

test('applyDecay: dormir recupera energía y baja estrés', () => {
  const s0 = baseStats(40); s0.energia = 30; s0.estres = 70;
  const s1 = applyDecay(s0, 4, { sleeping:true, night:true, speed:1 });
  assert.ok(s1.energia > s0.energia);
  assert.ok(s1.estres < s0.estres);
});

test('applyDecay: vacaciones casi congela las necesidades', () => {
  const s0 = baseStats(80);
  const normal = applyDecay(s0, 10, { speed:1 });
  const vac = applyDecay(s0, 10, { speed:1, vacation:true });
  assert.ok(vac.hambre > normal.hambre); // decae mucho menos
});

test('applyEffects: suma acotada 0..100', () => {
  const s = baseStats(95);
  const r = applyEffects(s, { hambre:20, estres:-100 });
  assert.equal(r.hambre, 100);
  assert.equal(r.estres, 0);
});

test('urgencyLevel: enfermedad y hambre crítica elevan la urgencia', () => {
  const s = baseStats(60);
  assert.equal(urgencyLevel(s, null), 0);
  s.hambre = 10;
  assert.equal(urgencyLevel(s, null), 2);
  assert.equal(urgencyLevel(baseStats(60), 'fiebre_senal'), 2);
});

test('careScore: mejor cuidado da mayor puntuación', () => {
  const bueno = baseStats(90); bueno.estres = 5;
  const malo = baseStats(20); malo.estres = 90;
  assert.ok(careScore(bueno) > careScore(malo));
});

test('nextStage: progresión de etapas', () => {
  assert.equal(nextStage('nucleo'), 'recien');
  assert.equal(nextStage('recien'), 'cria');
  assert.equal(nextStage('juvenil'), 'adulto');
  assert.equal(nextStage('adulto'), null);
});

test('scoreForm: núcleo equivocado descarta la forma', () => {
  const form = { etapa:'recien', familia:'prisma', cond:{ core:'prisma' } };
  const ctx = { core:'abisal', family:'abisal', stats:baseStats(60), care:50 };
  assert.equal(scoreForm(form, ctx), -Infinity);
});

test('scoreForm: coincidencia de núcleo puntúa alto', () => {
  const form = { etapa:'recien', familia:'prisma', cond:{ core:'prisma' } };
  const ctx = { core:'prisma', family:'prisma', stats:baseStats(60), care:50, dominant:null, anomalies:0, counters:{}, legacyCount:0, isNight:false, evoItems:new Set() };
  assert.ok(scoreForm(form, ctx) > 5);
});

test('gameReward: sin energía la recompensa se reduce', () => {
  const conEnergia = gameReward(6, 20, 3);
  const sinEnergia = gameReward(6, 20, 0);
  assert.ok(conEnergia.fragments > sinEnergia.fragments);
  assert.ok(conEnergia.fragments <= 60);
});

test('canAfford: comprueba fragmentos y ecos', () => {
  assert.equal(canAfford({ fragmentos:10, ecos:0 }, { precio:8 }), true);
  assert.equal(canAfford({ fragmentos:5, ecos:0 }, { precio:8 }), false);
  assert.equal(canAfford({ fragmentos:0, ecos:2 }, { precioEcos:2 }), true);
  assert.equal(canAfford({ fragmentos:0, ecos:1 }, { precioEcos:2 }), false);
});

test('GameEngine: los objetos evolutivos del inventario activan su familia', () => {
  const state = createProfile({ name:'Test', core:'prisma', lifeMode:'vinculo' });
  state.inventory.evo_prisma_puro = 1;
  const engine = new GameEngine(state);
  assert.equal(engine._evoCtx(Date.now()).evoItems.has('prisma'), true);
});
