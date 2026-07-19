// ENTIDAD 404 — aplicación principal
import { Config } from './config.js';
import { SaveManager } from './core/save-manager.js';
import { GameEngine } from './core/game-engine.js';
import { createProfile } from './models/profile.js';
import { bus } from './core/event-bus.js';
import { AudioSystem } from './systems/audio-system.js';
import { NotificationsSystem } from './systems/notifications-system.js';
import { maybeEvent } from './systems/events-system.js';
import { StateMachine } from './core/state-machine.js';
import { checkAchievements, bump } from './systems/achievements-system.js';
import { registerRoute, setRouterContext, initRouter, renderRoute, navigate } from './router.js';
import { toast } from './ui/toast.js';
import { openModal } from './ui/modal.js';
import { h, btn } from './ui/dom.js';
import { formatDuration } from './utils/helpers.js';
import { MAX_PROFILES } from './utils/constants.js';

// Vistas
import { habitatView } from './views/habitat.js';
import { needsView } from './views/needs.js';
import { feedView } from './views/feed.js';
import { healthView } from './views/health.js';
import { gamesView } from './views/games.js';
import { shopView } from './views/shop.js';
import { inventoryView, decorView, archiveView, diaryView } from './views/collections.js';
import { achievementsView, evolutionsView } from './views/progress.js';
import { moreView, configView, profilesView, backupView, privacyView } from './views/system.js';
import { newGameView } from './views/onboarding.js';

class App {
  constructor() {
    this.state = null;
    this.engine = null;
    this.currentSlot = null;
    this.saveTimer = null;
    this.eventTimer = null;
    this.bootPromise = null;
    this.routesRegistered = false;
    this.lifecycleBound = false;
    this.onVisibilityChange = null;
    this.onPageHide = null;
    this.onBeforeUnload = null;
  }

  boot() {
    if (this.bootPromise) return this.bootPromise;
    this.bootPromise = this.performBoot().catch(error => {
      this.bootPromise = null;
      throw error;
    });
    return this.bootPromise;
  }

  async performBoot() {
    Config.load();
    Config.apply();
    AudioSystem.init();
    NotificationsSystem.init(Config.get('notifications'));

    this.bindAudioUnlock();
    this.registerRoutes();
    this.refreshRouterContext();

    bus.on('creature:birthday', ({ weeks }) => {
      toast(`🎂 ¡Cumpleaños semanal! ${weeks} semana${weeks === 1 ? '' : 's'} de vínculo.`, { type:'success' });
      this.persist();
    });

    // Cargar la última partida válida. Se toleran contratos antiguos, huecos
    // nulos y almacenamiento bloqueado sin abortar el arranque.
    const configuredSlot = Number(Config.get('lastProfileSlot'));
    const lastSlot = Number.isInteger(configuredSlot) && configuredSlot >= 0 && configuredSlot < MAX_PROFILES
      ? configuredSlot
      : null;

    let loaded = false;
    if (lastSlot != null) loaded = await this.loadSlot(lastSlot, { silent:true });

    if (!loaded) {
      const list = await SaveManager.listProfiles().catch(error => {
        console.warn('No se pudieron enumerar las partidas.', error);
        return [];
      });
      const existing = Array.isArray(list) ? list.find(profile => profile?.state) : null;
      if (existing?.slot != null) loaded = await this.loadSlot(existing.slot, { silent:true });
    }

    // Ninguna vista de juego debe recibir state=null.
    if (!this.state && location.hash !== '#/nueva') location.hash = '#/nueva';
    await initRouter();
    this.bindLifecycle();
    this.reportStorageFallback();
    return true;
  }

  bindAudioUnlock() {
    const unlock = () => {
      AudioSystem.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once:true });
    window.addEventListener('keydown', unlock, { once:true });
  }

  bindLifecycle() {
    if (this.lifecycleBound) return;
    this.lifecycleBound = true;
    this.onVisibilityChange = () => {
      if (document.hidden) {
        this.persist();
        AudioSystem.pauseAmbient();
        this.engine?.stop();
      } else {
        AudioSystem.resumeAmbient();
        this.resume();
      }
    };
    this.onPageHide = () => this.persist();
    this.onBeforeUnload = () => this.persist();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('pagehide', this.onPageHide);
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }

  registerRoutes() {
    if (this.routesRegistered) return;
    this.routesRegistered = true;
    registerRoute('#/habitat', habitatView);
    registerRoute('#/necesidades', needsView);
    registerRoute('#/alimentar', feedView);
    registerRoute('#/higiene', healthView);
    registerRoute('#/juegos', gamesView);
    registerRoute('#/tienda', shopView);
    registerRoute('#/inventario', inventoryView);
    registerRoute('#/decoracion', decorView);
    registerRoute('#/archivo', archiveView);
    registerRoute('#/diario', diaryView);
    registerRoute('#/logros', achievementsView);
    registerRoute('#/evoluciones', evolutionsView);
    registerRoute('#/config', configView);
    registerRoute('#/partidas', profilesView);
    registerRoute('#/copias', backupView);
    registerRoute('#/privacidad', privacyView);
    registerRoute('#/mas', moreView);
    registerRoute('#/nueva', newGameView);
  }

  refreshRouterContext() {
    setRouterContext({
      state: this.state,
      engine: this.engine,
      save: SaveManager,
      currentSlot: this.currentSlot,
      persist: () => this.persist(),
      createGame: options => this.createGame(options),
      reloadInto: slot => this.loadSlot(slot).then(ok => {
        if (ok) navigate('#/habitat');
        return ok;
      }),
      applyImport: state => this.applyImport(state),
      deleteProfile: slot => this.deleteProfile(slot)
    });
  }

  async createGame({ name, core, lifeMode, slot }) {
    let safeSlot = Number(slot);
    if (!Number.isInteger(safeSlot) || safeSlot < 0 || safeSlot >= MAX_PROFILES) {
      const list = await SaveManager.listProfiles().catch(() => []);
      safeSlot = null;
      for (let candidate = 0; candidate < MAX_PROFILES; candidate++) {
        const occupied = Array.isArray(list) && list.some(profile => profile?.slot === candidate && profile?.state);
        if (!occupied) { safeSlot = candidate; break; }
      }
      if (safeSlot == null) throw new Error('No hay ranuras libres. Borra una partida antes de crear otra.');
    }

    const state = createProfile({ name, core, lifeMode });
    if (name.trim().toLowerCase() === '404') {
      state.counters = state.counters || {};
      state.counters.nombre404 = 1;
    }
    this.setActive(state, safeSlot);
    await SaveManager.saveProfile(safeSlot, state);
    Config.set('lastProfileSlot', safeSlot);
    this.trackDailyActive();
    toast(`${name} comienza a formarse en su núcleo.`, { type:'success' });
    await navigate('#/habitat');
    return true;
  }


  async deleteProfile(slot) {
    const safeSlot = Number(slot);
    if (!Number.isInteger(safeSlot) || safeSlot < 0 || safeSlot >= MAX_PROFILES) return false;
    await SaveManager.deleteProfile(safeSlot);
    if (this.currentSlot === safeSlot) {
      this.engine?.stop();
      this.engine = null;
      this.state = null;
      this.currentSlot = null;
      if (this.saveTimer) clearInterval(this.saveTimer);
      if (this.eventTimer) clearInterval(this.eventTimer);
      this.saveTimer = null;
      this.eventTimer = null;
      Config.set('lastProfileSlot', null);
      this.refreshRouterContext();
      await navigate('#/nueva');
    }
    return true;
  }

  async loadSlot(slot, { silent = false } = {}) {
    const safeSlot = Number(slot);
    if (!Number.isInteger(safeSlot) || safeSlot < 0 || safeSlot >= MAX_PROFILES) return false;

    const loaded = await SaveManager.loadProfile(safeSlot).catch(error => {
      console.warn('No se pudo cargar la partida.', error);
      return null;
    });
    if (!loaded) return false;
    if (loaded?.corrupt) {
      if (!silent) toast('La partida estaba dañada y no se pudo recuperar.', { type:'error' });
      return false;
    }
    if (!loaded.creature) return false;

    this.setActive(loaded, safeSlot);
    Config.set('lastProfileSlot', safeSlot);
    const { report } = this.engine.simulateAbsence();
    this.trackDailyActive();
    if (report && !silent) this.showAbsenceReport(report);
    await this.persist();
    return true;
  }

  setActive(state, slot) {
    if (!state || typeof state !== 'object' || !state.creature) {
      throw new Error('La partida activa no contiene un estado válido.');
    }
    this.engine?.stop();
    this.state = state;
    this.currentSlot = slot;
    this.engine = new GameEngine(state, { save: SaveManager });
    this.engine.start();
    this.refreshRouterContext();
    this.startAutoSave();
    this.startEvents();
  }

  resume() {
    if (!this.state || !this.engine) return;
    const { report } = this.engine.simulateAbsence();
    this.engine.start();
    if (report && report.hours >= 0.25) this.showAbsenceReport(report);
    renderRoute();
  }

  async applyImport(state) {
    const slot = this.currentSlot ?? 0;
    this.setActive(state, slot);
    await SaveManager.saveProfile(slot, state);
    Config.set('lastProfileSlot', slot);
    await navigate('#/habitat');
  }

  startAutoSave() {
    if (this.saveTimer) clearInterval(this.saveTimer);
    this.saveTimer = setInterval(() => this.persist(), 20000);
  }

  startEvents() {
    if (this.eventTimer) clearInterval(this.eventTimer);
    this.eventTimer = setInterval(() => {
      if (!this.state) return;
      const event = maybeEvent(this.state);
      if (event) {
        if (event.anim) StateMachine.trigger(event.anim, 1400);
        bus.emit('action:done', { kind:'event', msg:event.text });
        this.persist();
      }
      this.checkUrgentNotifications();
    }, 45000);
  }

  checkUrgentNotifications() {
    const creature = this.state?.creature;
    if (!creature?.hatched) return;
    if (creature.stats?.hambre < 15) NotificationsSystem.notify('hambre', 'Tu entidad tiene hambre', 'Vuelve para alimentarla.');
    if (creature.illness) NotificationsSystem.notify('salud', 'Tu entidad está enferma', 'Necesita tratamiento.');
    if (creature.stats?.higiene < 15) NotificationsSystem.notify('higiene', 'La cámara está sucia', 'Una limpieza le vendría bien.');
  }

  trackDailyActive() {
    if (!this.state) return;
    const today = new Date().toDateString();
    if (this.state._lastActiveDay !== today) {
      this.state._lastActiveDay = today;
      bump(this.state, 'dias_activos');
      checkAchievements(this.state);
    }
  }

  showAbsenceReport(report) {
    const rows = [];
    const diff = key => Math.round((report.after?.[key] ?? 0) - (report.before?.[key] ?? 0));
    const duration = formatDuration((report.hours || 0) * 3600000);
    rows.push(h('p', {}, `Estuviste fuera ${duration}.`));
    if (report.anomaly) rows.push(h('p', { class:'hint' }, 'Se detectó un salto en el reloj del sistema; el tiempo se contabilizó con prudencia y sin penalización.'));
    if (report.becameSick) rows.push(h('p', { class:'warn' }, `Enfermó de ${report.illnessName || 'una dolencia'} mientras no estabas.`));
    if (report.evolved) rows.push(h('p', { class:'good' }, `¡Evolucionó a ${report.evolved.nombre}!`));
    const changes = ['hambre','energia','higiene','felicidad','salud']
      .map(key => `${key}: ${diff(key) > 0 ? '+' : ''}${diff(key)}`)
      .join('  ·  ');
    rows.push(h('p', { class:'muted small' }, changes));
    openModal({
      title:'Mientras no estabas',
      body:h('div', { class:'stack' }, rows),
      actions:[{ label:'Continuar', primary:true }]
    });
  }

  reportStorageFallback() {
    const status = SaveManager.getStorageStatus();
    if (status.mode === 'localStorage') {
      setTimeout(() => toast('IndexedDB no está disponible. Se usa guardado local de compatibilidad.', { ms:6500 }), 500);
    } else if (status.mode === 'memory') {
      setTimeout(() => toast('El navegador bloquea el almacenamiento: el progreso solo durará mientras esta pestaña siga abierta.', { type:'error', ms:9000 }), 500);
    }
  }

  async persist() {
    if (!this.state || this.currentSlot == null) return false;
    try {
      await SaveManager.saveProfile(this.currentSlot, this.state);
      return true;
    } catch (error) {
      console.error('No se pudo guardar', error);
      return false;
    }
  }

  destroy() {
    this.engine?.stop();
    if (this.saveTimer) clearInterval(this.saveTimer);
    if (this.eventTimer) clearInterval(this.eventTimer);
    this.saveTimer = null;
    this.eventTimer = null;
    if (this.lifecycleBound) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      window.removeEventListener('pagehide', this.onPageHide);
      window.removeEventListener('beforeunload', this.onBeforeUnload);
      this.lifecycleBound = false;
    }
  }
}

function renderStartupError(error) {
  console.error(error);
  const root = document.getElementById('screen-root');
  if (!root) return;
  root.replaceChildren(h('div', { class:'panel startup-error' }, [
    h('h2', {}, 'No se pudo iniciar'),
    h('p', {}, 'La aplicación ha detectado un problema de caché o almacenamiento y no ha podido completar el arranque.'),
    h('p', { class:'muted small' }, error?.message || 'Error desconocido.'),
    h('div', { class:'row' }, [
      btn('Reintentar', () => location.reload(), { primary:true }),
      btn('Limpiar caché de la app', async () => {
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter(key => key.startsWith('entidad404-')).map(key => caches.delete(key)));
          }
          location.reload();
        } catch {
          location.reload();
        }
      })
    ])
  ]));
}

const app = new App();

function bootApplication() {
  return app.boot().catch(renderStartupError);
}

if (!globalThis.__E404_DISABLE_AUTOBOOT__) {
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', bootApplication, { once:true });
  else bootApplication();
}

// El SW se registra después de la carga. No fuerza activación inmediata para
// evitar mezclar módulos de dos versiones en una sesión abierta.
if (navigator.serviceWorker?.register && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Actualización preparada. Cierra y vuelve a abrir la app para aplicarla con seguridad.', { ms:8000 });
          }
        });
      });
    }).catch(error => console.warn('Service worker no disponible.', error));
  }, { once:true });
}

export { App, app, bootApplication, renderStartupError };
