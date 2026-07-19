// ENTIDAD 404 — router por hash (#/ruta)
import { buildNav } from './ui/navigation.js';

const routes = new Map();
let currentCleanup = null;
let ctx = null;
let initialized = false;

export function registerRoute(hash, factory) {
  if (typeof hash === 'string' && typeof factory === 'function') routes.set(hash, factory);
}
export function setRouterContext(context) { ctx = context || null; }

function safeDecode(value) {
  try { return decodeURIComponent(value || ''); }
  catch { return value || ''; }
}

function parse() {
  const raw = location.hash || '#/habitat';
  const [path, query] = raw.split('?');
  const params = {};
  if (query) {
    for (const part of query.split('&')) {
      const [key, value] = part.split('=');
      if (key) params[safeDecode(key)] = safeDecode(value);
    }
  }
  return { path, params };
}

function baseHash(path) {
  const parts = path.split('/');
  return parts.length > 2 ? `#/${parts[1]}` : path;
}

function renderRouteError(root, error) {
  root.textContent = '';
  const panel = document.createElement('section');
  panel.className = 'panel route-error';
  const title = document.createElement('h2');
  title.textContent = 'Algo falló al abrir esta pantalla';
  const message = document.createElement('p');
  message.textContent = 'La navegación sigue disponible. Vuelve a la cámara o recarga la aplicación.';
  const detail = document.createElement('p');
  detail.className = 'muted small';
  detail.textContent = error?.message || 'Error desconocido.';
  const link = document.createElement('a');
  link.className = 'btn primary';
  link.href = ctx?.state ? '#/habitat' : '#/nueva';
  link.textContent = ctx?.state ? 'Volver a la cámara' : 'Crear una partida';
  panel.append(title, message, detail, link);
  root.appendChild(panel);
}

export async function renderRoute() {
  const { path, params } = parse();
  const root = document.getElementById('screen-root');
  if (!root) return;

  if (currentCleanup) {
    try { currentCleanup(); } catch (error) { console.warn('No se pudo limpiar la vista anterior.', error); }
    currentCleanup = null;
  }

  const hash = baseHash(path);
  const noStateRoutes = new Set(['#/nueva', '#/partidas', '#/privacidad']);
  if (!ctx?.state && !noStateRoutes.has(hash)) {
    if (location.hash !== '#/nueva') {
      location.hash = '#/nueva';
      return;
    }
  }

  const factory = routes.get(hash) || routes.get(ctx?.state ? '#/habitat' : '#/nueva');
  root.textContent = '';
  root.scrollTop = 0;

  try {
    if (typeof factory !== 'function') throw new Error('La ruta solicitada no está registrada.');
    const view = await factory({ ...(ctx || {}), params, path });
    if (view?.node instanceof Node) root.appendChild(view.node);
    else throw new Error('La pantalla no devolvió contenido válido.');
    currentCleanup = typeof view.cleanup === 'function' ? view.cleanup : null;
    document.title = view?.title ? `${view.title} · Entidad 404` : 'Entidad 404 — Mascota del Umbral';
  } catch (error) {
    renderRouteError(root, error);
    console.error(error);
  }

  const navHost = document.getElementById('nav-host');
  if (navHost) {
    navHost.textContent = '';
    if (ctx?.state) navHost.appendChild(buildNav(hash));
  }

  const heading = root.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll:true });
  }
}

export function initRouter() {
  if (!initialized) {
    window.addEventListener('hashchange', renderRoute);
    initialized = true;
  }
  if (!location.hash) location.hash = ctx?.state ? '#/habitat' : '#/nueva';
  return renderRoute();
}

export function navigate(hash) {
  if (location.hash === hash) return renderRoute();
  location.hash = hash;
  return renderRoute();
}
