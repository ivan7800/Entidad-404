// ENTIDAD 404 — tests del sistema de guardado y validación
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeName, validateProfileState, validateExport } from '../js/utils/validators.js';
import { checksum } from '../js/utils/helpers.js';
import { createProfile } from '../js/models/profile.js';
import { addItem, removeItem, countDistinct } from '../js/models/inventory.js';
import { SAVE_SCHEMA_VERSION } from '../js/utils/constants.js';

test('sanitizeName: elimina caracteres peligrosos y recorta', () => {
  assert.equal(sanitizeName('<script>'), 'script');
  assert.equal(sanitizeName('  Bruna  '), 'Bruna');
  assert.equal(sanitizeName('a'.repeat(40)).length, 16);
  assert.equal(sanitizeName(123), '');
});

test('createProfile: estado inicial coherente', () => {
  const p = createProfile({ name:'Test', core:'prisma', lifeMode:'vinculo' });
  assert.equal(p.schema, SAVE_SCHEMA_VERSION);
  assert.equal(p.creature.core, 'prisma');
  assert.equal(p.creature.stage, 'nucleo');
  assert.equal(p.creature.hatched, false);
  assert.ok(p.wallet.fragmentos >= 0);
  assert.ok(Array.isArray(p.discovered));
});

test('validateProfileState: normaliza un perfil válido', () => {
  const p = createProfile({ name:'Test', core:'abisal', lifeMode:'legado' });
  const v = validateProfileState(p);
  assert.equal(v.ok, true);
  assert.equal(v.state.creature.core, 'abisal');
  // Todas las estadísticas presentes y en rango
  for (const val of Object.values(v.state.creature.stats)) {
    assert.ok(val >= 0 && val <= 100);
  }
});

test('validateProfileState: repara estadísticas fuera de rango', () => {
  const p = createProfile({ name:'X', core:'ferrita', lifeMode:'vinculo' });
  p.creature.stats.hambre = 9999;
  p.creature.stats.salud = -50;
  const v = validateProfileState(p);
  assert.ok(v.ok);
  assert.ok(v.state.creature.stats.hambre <= 100);
  assert.ok(v.state.creature.stats.salud >= 0);
});

test('validateProfileState: rechaza objetos no válidos', () => {
  assert.equal(validateProfileState(null).ok, false);
  assert.equal(validateProfileState('cadena').ok, false);
  assert.equal(validateProfileState(42).ok, false);
});

test('checksum: determinista y sensible al cambio', () => {
  const a = checksum('hola mundo');
  const b = checksum('hola mundo');
  const c = checksum('hola mundo!');
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test('validateExport: acepta una copia bien formada', () => {
  const p = createProfile({ name:'Export', core:'prisma', lifeMode:'vinculo' });
  const payload = {
    app:'entidad404', version:'1.0.0', schema:SAVE_SCHEMA_VERSION,
    exportedAt:new Date().toISOString(), slot:0, state:p,
    checksum: checksum(JSON.stringify(p))
  };
  const r = validateExport(JSON.stringify(payload));
  assert.equal(r.ok, true);
  assert.ok(r.state);
});

test('validateExport: detecta checksum dañado', () => {
  const p = createProfile({ name:'Export', core:'prisma', lifeMode:'vinculo' });
  const payload = {
    app:'entidad404', schema:SAVE_SCHEMA_VERSION, state:p, checksum:'deadbeef'
  };
  const r = validateExport(JSON.stringify(payload));
  assert.equal(r.ok, false);
});

test('validateExport: rechaza archivos de otra app', () => {
  const r = validateExport(JSON.stringify({ app:'otra_cosa', schema:1, state:{} }));
  assert.equal(r.ok, false);
});

test('validateExport: rechaza JSON malformado', () => {
  const r = validateExport('{ esto no es json');
  assert.equal(r.ok, false);
});

test('inventario: añadir, quitar y contar', () => {
  const inv = {};
  addItem(inv, 'racion_base', 2);
  addItem(inv, 'racion_base', 1);
  assert.equal(inv.racion_base, 3);
  addItem(inv, 'agua_destilada', 1);
  assert.equal(countDistinct(inv), 2);
  removeItem(inv, 'racion_base', 3);
  assert.equal(inv.racion_base, undefined);
  assert.equal(countDistinct(inv), 1);
});

test('inventario: no permite ítems desconocidos', () => {
  const inv = {};
  addItem(inv, 'objeto_inexistente', 5);
  assert.equal(inv.objeto_inexistente, undefined);
});
