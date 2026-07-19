// ENTIDAD 404 — preferencias de interfaz persistentes (localStorage)
const KEY = 'e404:config';
const DEFAULTS = {
  theme: 'oled',
  contrast: 'normal',   // normal | high
  motion: 'auto',       // auto | off
  glitch: 'on',         // on | off
  fontscale: 1,         // 0.9 .. 1.4
  notifications: false,
  lastProfileSlot: null,
  onboarded: false
};
let cfg = { ...DEFAULTS };

export const Config = {
  load() {
    cfg = { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) cfg = { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      cfg = { ...DEFAULTS };
    }
    return cfg;
  },
  get(k) { return cfg[k]; },
  all() { return { ...cfg }; },
  set(k, v) { cfg[k] = v; this.save(); this.apply(); },
  save() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch { /* almacenamiento no disponible */ } },
  apply() {
    const r = document.documentElement;
    r.setAttribute('data-theme', cfg.theme);
    r.setAttribute('data-contrast', cfg.contrast);
    r.setAttribute('data-motion', cfg.motion === 'off' ? 'off' : (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on'));
    r.setAttribute('data-glitch', cfg.glitch);
    r.setAttribute('data-fontscale', String(cfg.fontscale));
    r.style.setProperty('--font-scale', String(cfg.fontscale));
  }
};
