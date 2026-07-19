// ENTIDAD 404 — tests de las novedades 2.1.0
// Aura de decoración, enfermedad en vivo y catálogo ampliado de eventos.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyAura } from '../js/systems/needs-system.js';
import { GameEngine } from '../js/core/game-engine.js';
import { createProfile } from '../js/models/profile.js';
import { EVENTS, maybeEvent } from '../js/systems/events-system.js';
import { ITEM_MAP } from '../js/data/items.js';
import { STATS } from '../js/utils/constants.js';

function hatchedProfile() {
  const st = createProfile({ name:'Test', core:'prisma', lifeMode:'vinculo' });
  st.creature.hatched = true;
  st.creature.stage = 'recien';
  return st;
}

// ── Aura de decoración ──

test('applyAura: mejora suave proporcional a las horas', () => {
  const stats = {}; for (const k of STATS) stats[k] = 50;
  const out = applyAura(stats, { felicidad:2, curiosidad:3 }, 10);
  assert.ok(out.felicidad > stats.felicidad);
  assert.ok(out.curiosidad > stats.curiosidad);
  assert.equal(out.hambre, 50); // no toca lo que no está en el aura
});

test('applyAura: dormir potencia el aura y vacaciones la congelan', () => {
  const stats = {}; for (const k of STATS) stats[k] = 50;
  const awake = applyAura(stats, { energia:3 }, 8);
  const asleep = applyAura(stats, { energia:3 }, 8, { sleeping:true });
  const frozen = applyAura(stats, { energia:3 }, 8, { vacation:true });
  assert.ok(asleep.energia > awake.energia);
  assert.equal(frozen.energia, 50);
});

test('applyAura: respeta los topes 0-100', () => {
  const stats = {}; for (const k of STATS) stats[k] = 99;
  const out = applyAura(stats, { felicidad:5 }, 100);
  assert.equal(out.felicidad, 100);
});

test('_decorAura: suma los efectos de la decoración colocada', () => {
  const st = hatchedProfile();
  st.decor = { pared:'deco_pared_circuito', suelo:'deco_suelo_musgo', reliquia:'deco_reliquia_llave' };
  const engine = new GameEngine(st);
  const aura = engine._decorAura();
  const expected = {};
  for (const id of Object.values(st.decor)) {
    for (const [k, v] of Object.entries(ITEM_MAP[id].fx)) expected[k] = (expected[k] || 0) + v;
  }
  assert.deepEqual(aura, expected);
  assert.ok(Object.keys(aura).length >= 3);
});

test('_decorAura: ignora ids desconocidos sin romper', () => {
  const st = hatchedProfile();
  st.decor = { pared:'no_existe' };
  const engine = new GameEngine(st);
  assert.deepEqual(engine._decorAura(), {});
});

// ── Enfermedad en vivo ──

test('_liveTick: la criatura puede enfermar en sesión activa', () => {
  const st = hatchedProfile();
  const c = st.creature;
  // Estado desastroso → riesgo máximo
  c.stats.higiene = 5; c.stats.estres = 95; c.stats.energia = 5; c.stats.estabilidad = 5; c.stats.salud = 10;
  const engine = new GameEngine(st);
  const originalRandom = Math.random;
  Math.random = () => 0; // el azar siempre desencadena
  try {
    engine._liveTick(1); // una hora simulada
  } finally {
    Math.random = originalRandom;
  }
  assert.ok(c.illness, 'debería haber enfermado con riesgo máximo y azar forzado');
  assert.ok(c.illnessUntil > Date.now());
});

// ── Catálogo de eventos ──

test('EVENTS: ids únicos y al menos 18 eventos', () => {
  const ids = EVENTS.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(EVENTS.length >= 18, `solo hay ${EVENTS.length} eventos`);
});

test('EVENTS: cada evento ejecuta sin lanzar y devuelve texto y tono válidos', () => {
  const tones = new Set(['neutral','feliz','malo','raro']);
  for (const e of EVENTS) {
    const st = hatchedProfile();
    st.creature.sleeping = true; // satisface conds de sueño sin filtrar
    st.decor = { maquina:'deco_maquina_radio', planta:'deco_planta_helecho', pared:'deco_pared_ventana', reliquia:'deco_reliquia_llave', suelo:'deco_suelo_musgo' };
    st.memories = [{},{},{},{},{}];
    const res = e.run(st);
    assert.ok(typeof res.text === 'string' && res.text.length > 4, `evento ${e.id}: texto inválido`);
    if (res.tone) assert.ok(tones.has(res.tone), `evento ${e.id}: tono desconocido "${res.tone}"`);
    for (const k of STATS) {
      const v = st.creature.stats[k];
      assert.ok(v >= 0 && v <= 100, `evento ${e.id}: estadística ${k} fuera de rango (${v})`);
    }
  }
});

test('EVENTS: las condiciones no lanzan con estados mínimos', () => {
  const st = hatchedProfile();
  for (const e of EVENTS) {
    assert.doesNotThrow(() => e.cond(st.creature, st), `evento ${e.id}`);
  }
});

test('maybeEvent: con azar forzado genera evento, contador y recuerdo', () => {
  const st = hatchedProfile();
  const originalRandom = Math.random;
  Math.random = () => 0;
  let res;
  try { res = maybeEvent(st); } finally { Math.random = originalRandom; }
  assert.ok(res && res.text);
  assert.equal(st.counters.eventos, 1);
  assert.equal(st.memories.length, 1);
});

test('maybeEvent: no ocurre nada con el núcleo sin eclosionar', () => {
  const st = createProfile({ name:'Test', core:'prisma', lifeMode:'vinculo' });
  const originalRandom = Math.random;
  Math.random = () => 0;
  let res;
  try { res = maybeEvent(st); } finally { Math.random = originalRandom; }
  assert.equal(res, null);
});
