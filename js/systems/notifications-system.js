// ENTIDAD 404 — notificaciones locales
// Solo funcionan con la app abierta o en segundo plano reciente (PWA estática
// sin push server). El README documenta esta limitación.
let enabled = false;
let lastNotified = new Map();

export const NotificationsSystem = {
  get supported() { return 'Notification' in window; },
  get permission() { return this.supported ? Notification.permission : 'unsupported'; },
  get enabled() { return enabled && this.permission === 'granted'; },

  init(prefEnabled) { enabled = !!prefEnabled; },

  async requestPermission() {
    if (!this.supported) return 'unsupported';
    const res = await Notification.requestPermission();
    if (res === 'granted') enabled = true;
    return res;
  },

  setEnabled(v) { enabled = !!v; },

  // Notifica evitando repeticiones (mín. 30 min por clave)
  notify(key, title, body) {
    if (!this.enabled) return;
    if (document.visibilityState === 'visible') return; // en pantalla: se usa toast, no consume el enfriamiento
    const last = lastNotified.get(key) || 0;
    if (Date.now() - last < 30 * 60 * 1000) return;
    lastNotified.set(key, Date.now());
    try {
      new Notification(title, { body, tag: `e404-${key}`, icon: './assets/icons/icon-192.png' });
    } catch { /* algunos navegadores exigen SW registration.showNotification */ }
  }
};
