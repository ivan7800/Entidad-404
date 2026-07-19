// Pruebas de la distribución real: index.html -> bootstrap.js -> app.bundle.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import jsdomPackage from 'jsdom';
const { JSDOM, VirtualConsole } = jsdomPackage;
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

const root = resolve('.');

function browserStubs(window) {
  window.indexedDB = new IDBFactory();
  window.IDBKeyRange = IDBKeyRange;
  window.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
  Object.defineProperty(window.navigator, 'serviceWorker', { value:undefined, configurable:true });
  window.Notification = undefined;
  window.requestAnimationFrame = callback => window.setTimeout(() => callback(Date.now()), 5);
  window.cancelAnimationFrame = id => window.clearTimeout(id);
}

async function waitForBoot(dom) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const text = dom.window.document.querySelector('#screen-root')?.textContent || '';
    if (/Crea una entidad imposible/i.test(text)) return text;
    if (/No se pudo cargar|No se pudo iniciar/i.test(text)) {
      throw new Error(`El arranque mostró una pantalla de error: ${text}`);
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 25));
  }
  throw new Error('El arranque de la distribución superó el tiempo de espera.');
}

function virtualConsole(errors) {
  const consoleBridge = new VirtualConsole();
  consoleBridge.on('error', (...args) => errors.push(args.join(' ')));
  consoleBridge.on('jsdomError', error => errors.push(error.message));
  return consoleBridge;
}

test('index.html arranca por file:// sin módulos ES', async () => {
  const errors = [];
  const dom = await JSDOM.fromFile(resolve(root, 'index.html'), {
    resources:'usable',
    runScripts:'dangerously',
    pretendToBeVisual:true,
    virtualConsole:virtualConsole(errors),
    beforeParse:browserStubs
  });

  try {
    const text = await waitForBoot(dom);
    assert.match(text, /Crea una entidad imposible/i);
    assert.equal(dom.window.location.protocol, 'file:');
    assert.match(dom.window.document.querySelector('script[data-e404-bundle="2.1.0"]')?.src || '', /app\.bundle\.js$/);
    assert.deepEqual(errors, []);
  } finally {
    dom.window.close();
  }
});

test('index.html arranca dentro de una subcarpeta tipo GitHub Pages', async () => {
  const errors = [];
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const bootstrap = await readFile(resolve(root, 'bootstrap.js'), 'utf8');
  const bundle = await readFile(resolve(root, 'app.bundle.js'), 'utf8');
  const dom = new JSDOM(html, {
    url:'https://usuario.github.io/entidad-404/',
    runScripts:'outside-only',
    pretendToBeVisual:true,
    virtualConsole:virtualConsole(errors),
    beforeParse:browserStubs
  });

  const originalAppend = dom.window.document.body.appendChild.bind(dom.window.document.body);
  dom.window.document.body.appendChild = element => {
    const result = originalAppend(element);
    if (element.tagName === 'SCRIPT' && element.dataset.e404Bundle === '2.1.0') {
      dom.window.eval(bundle);
      element.dispatchEvent(new dom.window.Event('load'));
    }
    return result;
  };

  try {
    dom.window.eval(bootstrap);
    const text = await waitForBoot(dom);
    assert.match(text, /Crea una entidad imposible/i);
    assert.equal(dom.window.location.pathname, '/entidad-404/');
    assert.match(dom.window.document.querySelector('script[data-e404-bundle="2.1.0"]')?.src || '', /\/entidad-404\/app\.bundle\.js\?v=2\.1\.0$/);
    assert.deepEqual(errors, []);
  } finally {
    dom.window.close();
  }
});
