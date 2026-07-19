// ENTIDAD 404 — cargador universal para archivo local y GitHub Pages
(() => {
  'use strict';

  const BUILD = '2.1.0';
  const BUILD_KEY = 'e404:build';
  const currentScript = document.currentScript;
  const scriptUrl = new URL(currentScript && currentScript.src ? currentScript.src : './bootstrap.js', document.baseURI);
  const appScope = new URL('./', scriptUrl).href;
  let errorShown = false;

  function button(label, handler, primary = false) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = primary ? 'btn primary' : 'btn';
    element.textContent = label;
    element.addEventListener('click', handler);
    return element;
  }

  function showBootstrapError(error, requestedUrl = '') {
    if (errorShown) return;
    errorShown = true;
    console.error('Fallo en el cargador de Entidad 404', error);

    const root = document.getElementById('screen-root');
    if (!root) return;
    root.textContent = '';

    const panel = document.createElement('div');
    panel.className = 'panel startup-error';

    const title = document.createElement('h2');
    title.textContent = 'No se pudo cargar la aplicación';

    const message = document.createElement('p');
    message.textContent = 'El archivo principal no pudo abrirse. Comprueba que app.bundle.js esté junto a index.html.';

    const detail = document.createElement('p');
    detail.className = 'muted small';
    detail.textContent = error && error.message ? error.message : 'Error desconocido.';

    panel.append(title, message, detail);

    if (requestedUrl) {
      const path = document.createElement('p');
      path.className = 'muted small';
      path.textContent = `Ruta solicitada: ${requestedUrl}`;
      panel.appendChild(path);
    }

    const actions = document.createElement('div');
    actions.className = 'row';
    actions.append(
      button('Reintentar', () => location.reload(), true),
      button('Limpiar caché y reintentar', async () => {
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys
              .filter(key => key.startsWith('entidad404-'))
              .map(key => caches.delete(key)));
          }
          if ('serviceWorker' in navigator && navigator.serviceWorker) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations
              .filter(registration => registration.scope === appScope)
              .map(registration => registration.unregister()));
          }
        } catch (cleanupError) {
          console.warn('No se pudo completar la limpieza de caché.', cleanupError);
        }
        location.reload();
      })
    );
    panel.appendChild(actions);
    root.appendChild(panel);
  }

  async function cleanLegacyRuntime() {
    // Los service workers no funcionan en file:// y tampoco hacen falta allí.
    if (location.protocol === 'file:') return;

    let previousBuild = null;
    try { previousBuild = localStorage.getItem(BUILD_KEY); } catch { /* almacenamiento bloqueado */ }

    const serviceWorkerApi = navigator.serviceWorker;
    const controlled = Boolean(serviceWorkerApi && serviceWorkerApi.controller);
    const needsCleanup = previousBuild !== BUILD && (Boolean(previousBuild) || controlled);
    if (!needsCleanup) return;

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter(key => key.startsWith('entidad404-'))
        .map(key => caches.delete(key)));
    }

    if (serviceWorkerApi) {
      const registrations = await serviceWorkerApi.getRegistrations();
      await Promise.all(registrations
        .filter(registration => registration.scope === appScope)
        .map(registration => registration.unregister()));
    }
  }

  function loadBundle() {
    return new Promise((resolve, reject) => {
      const bundleUrl = new URL('app.bundle.js', appScope);
      // En HTTP(S) se usa versión para invalidar CDN/SW. En file:// evitamos
      // parámetros para maximizar compatibilidad al abrir index.html con doble clic.
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        bundleUrl.searchParams.set('v', BUILD);
      }

      const script = document.createElement('script');
      script.src = bundleUrl.href;
      script.async = false;
      script.dataset.e404Bundle = BUILD;
      script.addEventListener('load', () => resolve(bundleUrl.href), { once:true });
      script.addEventListener('error', () => reject(Object.assign(
        new Error('No se pudo descargar app.bundle.js.'),
        { requestedUrl: bundleUrl.href }
      )), { once:true });
      document.body.appendChild(script);
    });
  }

  async function start() {
    try {
      await cleanLegacyRuntime();
    } catch (error) {
      console.warn('No se pudo limpiar por completo la caché anterior.', error);
    }

    try { localStorage.setItem(BUILD_KEY, BUILD); } catch { /* almacenamiento bloqueado */ }
    await loadBundle();
  }

  start().catch(error => showBootstrapError(error, error && error.requestedUrl ? error.requestedUrl : ''));
})();
