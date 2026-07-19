import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

const html = `<!doctype html><html><body>
  <div id="app"><main id="screen-root"></main><div id="nav-host"></div></div>
  <div id="toast-region"></div><div id="sr-live"></div>
</body></html>`;

function installDom() {
  const dom = new JSDOM(html, {
    url: 'https://example.test/entidad-404/',
    pretendToBeVisual: true
  });
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
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.navigator;
  delete globalThis.location;
  delete globalThis.localStorage;
  delete globalThis.Node;
  delete globalThis.Blob;
  delete globalThis.URL;
  delete globalThis.indexedDB;
  delete globalThis.IDBKeyRange;
  delete globalThis.requestAnimationFrame;
  delete globalThis.cancelAnimationFrame;
  delete globalThis.Notification;
  delete globalThis.__E404_DISABLE_AUTOBOOT__;
}

test('arranque limpio, creación de partida y navegación principal', async () => {
  const dom = installDom();
  const { App } = await import(`../js/app.js?test=${Date.now()}`);
  const app = new App();
  try {
    await app.boot();
    assert.equal(window.location.hash, '#/nueva');
    assert.match(document.querySelector('#screen-root')?.textContent || '', /Crea una entidad imposible/i);

    await app.createGame({ name:'Umbra', core:'prisma', lifeMode:'vinculo' });
    assert.equal(window.location.hash, '#/habitat');
    assert.match(document.querySelector('#screen-root')?.textContent || '', /Umbra|Cámara/i);
    assert.ok(document.querySelector('#nav-host nav'));

    await app.deleteProfile(0);
    assert.equal(app.state, null);
    assert.equal(window.location.hash, '#/nueva');
    assert.match(document.querySelector('#screen-root')?.textContent || '', /Crea una entidad imposible/i);
  } finally {
    app.destroy();
    cleanupDom(dom);
  }
});

test('el arranque tolera entradas nulas en el listado de perfiles', async () => {
  const dom = installDom();
  const appModule = await import(`../js/app.js?null-profile=${Date.now()}`);
  const saveModule = await import('../js/core/save-manager.js');
  await saveModule.SaveManager.deleteProfile(0);
  const originalList = saveModule.SaveManager.listProfiles;
  saveModule.SaveManager.listProfiles = async () => [null, { slot:1, state:null }, { slot:2, empty:true }];
  const app = new appModule.App();
  try {
    await app.boot();
    assert.equal(window.location.hash, '#/nueva');
    assert.doesNotMatch(document.querySelector('#screen-root')?.textContent || '', /No se pudo iniciar/i);
  } finally {
    saveModule.SaveManager.listProfiles = originalList;
    app.destroy();
    cleanupDom(dom);
  }
});
