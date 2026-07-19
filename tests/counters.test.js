// ENTIDAD 404 — tests de contadores de logros (noches y cumpleaños)
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GameEngine } from '../js/core/game-engine.js';
import { createProfile } from '../js/models/profile.js';
import { validateProfileState } from '../js/utils/validators.js';

const HOUR = 3600000;

function hatchedProfile() {
  const st = createProfile({ name:'Test', core:'prisma', lifeMode:'vinculo' });
  st.creature.hatched = true;
  st.creature.stage = 'recien';
  st.creature.sleeping = false;
  return st;
}

test('noches: la transición despierta→dormida cuenta una noche', () => {
  const st = hatchedProfile();
  const engine = new GameEngine(st);
  const ts = new Date('2026-07-10T23:30:00').getTime();
  engine._trackNight(true, false, ts);
  assert.equal(st.counters.noches, 1);
});

test('noches: dormir a través de medianoche no duplica la misma noche', () => {
  const st = hatchedProfile();
  const engine = new GameEngine(st);
  const noche = new Date('2026-07-10T23:30:00').getTime();
  engine._trackNight(true, false, noche);
  // sigue dormida: sin transición, aunque cambie la fecha
  engine._trackNight(true, true, noche + 2 * HOUR);
  assert.equal(st.counters.noches, 1);
});

test('noches: noches en fechas distintas cuentan por separado', () => {
  const st = hatchedProfile();
  const engine = new GameEngine(st);
  const noche1 = new Date('2026-07-10T23:30:00').getTime();
  const noche2 = noche1 + 24 * HOUR;
  engine._trackNight(true, false, noche1);
  engine._trackNight(false, true, noche1 + 9 * HOUR); // despierta
  engine._trackNight(true, false, noche2);
  assert.equal(st.counters.noches, 2);
});

test('noches: sin eclosionar no cuenta', () => {
  const st = createProfile({ name:'Test', core:'prisma', lifeMode:'vinculo' });
  const engine = new GameEngine(st);
  engine._trackNight(true, false, Date.now());
  assert.equal(st.counters.noches, undefined);
});

test('cumples: se celebra la primera semana y desbloquea el logro', () => {
  const st = hatchedProfile();
  st.createdAt = Date.now() - 8 * 24 * HOUR; // hace 8 días
  const engine = new GameEngine(st);
  const weeks = engine._maybeBirthday(Date.now());
  assert.equal(weeks, 1);
  assert.equal(st.counters.cumples, 1);
  assert.equal(st.achievements.cumple?.done, true);
  assert.ok(st.memories.some(m => m.text.includes('semana')));
});

test('cumples: no se repite dentro de la misma semana', () => {
  const st = hatchedProfile();
  st.createdAt = Date.now() - 8 * 24 * HOUR;
  const engine = new GameEngine(st);
  engine._maybeBirthday(Date.now());
  const again = engine._maybeBirthday(Date.now() + HOUR);
  assert.equal(again, null);
  assert.equal(st.counters.cumples, 1);
});

test('cumples: ausencias largas ponen al día las semanas pendientes', () => {
  const st = hatchedProfile();
  st.createdAt = Date.now() - 22 * 24 * HOUR; // 3 semanas y algo
  const engine = new GameEngine(st);
  engine._maybeBirthday(Date.now());
  assert.equal(st.counters.cumples, 3);
});

test('validador: conserva _lastNightDay en importaciones', () => {
  const st = hatchedProfile();
  st._lastNightDay = 'Fri Jul 10 2026';
  const v = validateProfileState(JSON.parse(JSON.stringify(st)));
  assert.equal(v.ok, true);
  assert.equal(v.state._lastNightDay, 'Fri Jul 10 2026');
});
