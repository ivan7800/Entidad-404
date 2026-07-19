// ENTIDAD 404 — smoke de vistas: cada ruta renderiza sin errores
// con una criatura eclosionada, y las acciones básicas funcionan.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

const html = `<!doctype html><html><body>
  <div id="app"><main id="screen-root"></main><div id="nav-host"></div></div>
  <div id="toast-region"></div><div id="sr-live"></div>
</body></html>`;

function installDom() {
  const dom = new JSDOM(html, { url:'https://example.test/entidad-404/', pretendToBeVisual:true });
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  Object.defineProperty(globalThis, 'navigator', { value:window.navigator, configurable:true });
  Object.defineProperty(globalThis, 'location', { value:window.location, configurable:true });
  Object.defineProperty(globalThis, 'localStorage', { value:window.localStorage, configurable:true });
  globalThis.Node = window.Node;
  globalThis.Blob = window.Blob;
  globalThis.URL = window.URL;
  globalThis.indexedDB = new IDBFactory();
  globalThis.IDBKeyRange = IDBKeyRange;
  globalThis.requestAnimationFrame = callback => setTimeout(() => callback(Date.now()), 5);
  globalThis.cancelAnimationFrame = id => clearTimeout(id);
  window.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
  Object.defineProperty(window.navigator, 'serviceWorker', { value:undefined, configurable:true });
  globalThis.Notification = undefined;
  globalThis.__E404_DISABLE_AUTOBOOT__ = true;
  return dom;
}

function cleanupDom(dom) {
  dom.window.close();
  for (const key of ['window','document','navigator','location','localStorage','Node','Blob','URL',
    'indexedDB','IDBKeyRange','requestAnimationFrame','cancelAnimationFrame','Notification',
    '__E404_DISABLE_AUTOBOOT__']) delete globalThis[key];
}

const ROUTES = [
  '#/habitat', '#/necesidades', '#/alimentar', '#/higiene', '#/juegos', '#/tienda',
  '#/mas', '#/inventario', '#/decoracion', '#/archivo', '#/diario', '#/logros',
  '#/evoluciones', '#/config', '#/partidas', '#/copias', '#/privacidad'
];

test('todas las rutas renderizan con una criatura eclosionada y sin errores de consola', async () => {
  const dom = installDom();
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => { errors.push(args.join(' ')); originalError(...args); };

  const { App } = await import(`../js/app.js?smoke=${Date.now()}`);
  const routerModule = await import('../js/router.js');
  const app = new App();
  try {
    await app.boot();
    await app.createGame({ name:'Umbra', core:'prisma', lifeMode:'vinculo' });

    // Forzar eclosión para probar las vistas en su estado completo
    app.state.creature.hatched = true;
    app.state.creature.stage = 'recien';
    app.state.creature.formId = 'lumin';
    app.state.inventory.deco_pared_circuito = 1;
    app.state.inventory.tonico_basico = 1;

    for (const route of ROUTES) {
      await routerModule.navigate(route);
      const text = document.querySelector('#screen-root')?.textContent || '';
      assert.ok(text.trim().length > 0, `ruta ${route}: pantalla vacía`);
      assert.doesNotMatch(text, /No se pudo|undefined|\[object/i, `ruta ${route}: contenido de error`);
    }

    // Los iconos deben ser glifos, no identificadores literales
    await routerModule.navigate('#/tienda');
    const emojis = [...document.querySelectorAll('.item-emoji')].map(n => n.textContent.trim());
    assert.ok(emojis.length > 0, 'la tienda no muestra objetos');
    for (const e of emojis) assert.doesNotMatch(e, /^[a-z_]{3,}$/, `icono sin traducir: "${e}"`);

    // Acciones básicas desde el estado real
    const actions = await import('../js/systems/actions.js');
    assert.equal(actions.pet(app.state).ok, true);
    assert.equal(actions.talk(app.state).ok, true);
    assert.equal(actions.clean(app.state).ok || app.state.creature.stats.higiene > 90, true);

    assert.deepEqual(errors, [], 'errores de consola durante la navegación');

    // Terminar en una vista sin temporizadores y dejar que los repintados
    // asíncronos pendientes (p. ej. listado de perfiles) terminen antes
    // del desmontaje.
    await routerModule.navigate('#/mas');
    await new Promise(resolveWait => setTimeout(resolveWait, 250));
  } finally {
    console.error = originalError;
    app.destroy();
    cleanupDom(dom);
  }
});
