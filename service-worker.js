// ENTIDAD 404 — service worker estable para GitHub Pages
const VERSION = 'e404-v2.1.0';
const CACHE = `entidad404-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './bootstrap.js?v=2.1.0',
  './app.bundle.js?v=2.1.0',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/themes.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/views.css',
  './css/animations.css',
  './css/responsive.css',
  './css/u404-premium.css',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(APP_SHELL.map(asset => cache.add(asset).catch(() => undefined)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('entidad404-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackUrl = null) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response?.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch {
    return (await cache.match(request)) || (fallbackUrl ? await cache.match(fallbackUrl) : undefined) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response?.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  const isRuntimeCode = /\.(?:js|css|html|webmanifest)$/i.test(url.pathname);
  event.respondWith(isRuntimeCode ? networkFirst(request) : cacheFirst(request));
});
