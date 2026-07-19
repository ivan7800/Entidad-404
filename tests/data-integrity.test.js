// ENTIDAD 404 — integridad de datos entre catálogos y código
// Garantiza que ningún logro sea inalcanzable, que todo icono tenga glifo
// y que los catálogos no se rompan entre sí al crecer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ITEMS, ITEM_MAP, CAPSULE_POOL, DECOR_SLOTS } from '../js/data/items.js';
import { ACHIEVEMENTS } from '../js/data/achievements.js';
import { FORMS } from '../js/data/creatures.js';
import { ICON_GLYPHS } from '../js/ui/dom.js';
import { STATS } from '../js/utils/constants.js';
import { EVENTS } from '../js/systems/events-system.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function allJsSources() {
  const out = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.js')) out.push(readFileSync(p, 'utf8'));
    }
  })(join(ROOT, 'js'));
  return out.join('\n');
}

test('ids únicos en items, logros y formas', () => {
  for (const [label, list] of [['items', ITEMS], ['logros', ACHIEVEMENTS], ['formas', FORMS]]) {
    const ids = list.map(x => x.id);
    assert.equal(new Set(ids).size, ids.length, `ids duplicados en ${label}`);
  }
});

test('todos los efectos de items apuntan a estadísticas reales', () => {
  const valid = new Set(STATS);
  for (const it of ITEMS) {
    for (const k of Object.keys(it.fx || {})) {
      assert.ok(valid.has(k), `item ${it.id}: efecto desconocido "${k}"`);
    }
  }
});

test('todos los iconos de items y logros tienen glifo visible', () => {
  for (const it of ITEMS) {
    if (it.icon) assert.ok(ICON_GLYPHS[it.icon], `item ${it.id}: icono "${it.icon}" sin glifo`);
  }
  for (const a of ACHIEVEMENTS) {
    if (a.icon) assert.ok(ICON_GLYPHS[a.icon], `logro ${a.id}: icono "${a.icon}" sin glifo`);
  }
});

test('cada contador de logro se incrementa en algún punto del código', () => {
  const src = allJsSources();
  const counters = [...new Set(ACHIEVEMENTS.filter(a => a.counter).map(a => a.counter))];
  for (const counter of counters) {
    const viaBump = new RegExp(`bump\\([^)]*,\\s*['"]${counter}['"]`).test(src);
    const direct = new RegExp(`counters\\.${counter}\\s*=`).test(src);
    const viaEvent = new RegExp(`counter:\\s*['"]${counter}['"]`).test(src);
    assert.ok(viaBump || direct || viaEvent, `contador "${counter}" nunca se incrementa: logro inalcanzable`);
  }
});

test('cada récord de logro se registra en los minijuegos', () => {
  const games = readFileSync(join(ROOT, 'js/views/games.js'), 'utf8');
  for (const a of ACHIEVEMENTS.filter(a => a.record)) {
    assert.ok(games.includes(a.record), `récord "${a.record}" no aparece en games.js`);
  }
});

test('la reserva de cápsulas no está vacía y solo contiene items reales', () => {
  assert.ok(CAPSULE_POOL.length > 0);
  for (const entry of CAPSULE_POOL) {
    const id = typeof entry === 'string' ? entry : entry.id ?? entry.value ?? entry[0];
    assert.ok(ITEM_MAP[id], `cápsula referencia item desconocido: ${JSON.stringify(entry)}`);
  }
});

test('toda decoración usa una ranura declarada', () => {
  const slots = new Set(DECOR_SLOTS.map(s => s.id));
  for (const it of ITEMS.filter(i => i.tipo === 'decoracion')) {
    assert.ok(slots.has(it.slot), `decoración ${it.id}: ranura desconocida "${it.slot}"`);
  }
});

test('las condiciones evolutivas referencian estadísticas y contadores válidos', () => {
  const valid = new Set(STATS);
  const src = allJsSources();
  for (const f of FORMS) {
    for (const k of Object.keys(f.cond?.stat || {})) {
      assert.ok(valid.has(k), `forma ${f.id}: estadística desconocida "${k}" en cond`);
    }
    for (const k of Object.keys(f.cond?.counter || {})) {
      const reachable = new RegExp(`['"]${k}['"]`).test(src);
      assert.ok(reachable, `forma ${f.id}: contador evolutivo "${k}" no aparece en el código`);
    }
  }
});

test('EVENTS: las animaciones referenciadas existen en el CSS', () => {
  const css = readFileSync(join(ROOT, 'css/animations.css'), 'utf8');
  for (const e of EVENTS) {
    const probe = { run: e.run.toString() };
    const match = probe.run.match(/anim:'([a-z-]+)'/);
    if (match) assert.ok(css.includes(`.anim-${match[1]}`), `evento ${e.id}: animación "${match[1]}" sin CSS`);
  }
});

test('EVENTS: las decoraciones condicionantes existen en el catálogo', () => {
  for (const e of EVENTS) {
    const src = e.cond.toString();
    for (const m of src.matchAll(/hasDecor\(state,\s*'([a-z_]+)'\)/g)) {
      assert.ok(ITEM_MAP[m[1]], `evento ${e.id}: decoración desconocida "${m[1]}"`);
    }
  }
});
