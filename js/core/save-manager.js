// ENTIDAD 404 — persistencia resiliente
// IndexedDB es el almacenamiento principal. Si el navegador lo bloquea,
// se usa localStorage y, como último recurso, memoria temporal.
import { DB_NAME, DB_STORE, DB_META, MAX_PROFILES, SAVE_SCHEMA_VERSION, APP_VERSION } from '../utils/constants.js';
import { validateProfileState } from '../utils/validators.js';
import { checksum, deepClone } from '../utils/helpers.js';

const DB_VERSION = 1;
const FALLBACK_PREFIX = 'e404:fallback';
let dbPromise = null;
let idbUnavailable = false;
let storageMode = 'indexeddb';
const memoryStores = new Map([
  [DB_STORE, new Map()],
  [DB_META, new Map()]
]);

function validSlot(slot) {
  const n = Number(slot);
  return Number.isInteger(n) && n >= 0 && n < MAX_PROFILES ? n : null;
}

function fallbackKey(store, key) {
  return `${FALLBACK_PREFIX}:${store}:${String(key)}`;
}

function memoryStore(store) {
  if (!memoryStores.has(store)) memoryStores.set(store, new Map());
  return memoryStores.get(store);
}

function fallbackGet(store, key) {
  try {
    const raw = localStorage.getItem(fallbackKey(store, key));
    storageMode = 'localStorage';
    return raw == null ? null : JSON.parse(raw);
  } catch {
    storageMode = 'memory';
    return memoryStore(store).get(String(key)) ?? null;
  }
}

function fallbackPut(store, key, value) {
  try {
    localStorage.setItem(fallbackKey(store, key), JSON.stringify(value));
    storageMode = 'localStorage';
    return value;
  } catch {
    storageMode = 'memory';
    memoryStore(store).set(String(key), deepClone(value));
    return value;
  }
}

function fallbackDelete(store, key) {
  try {
    localStorage.removeItem(fallbackKey(store, key));
    storageMode = 'localStorage';
  } catch {
    storageMode = 'memory';
  }
  memoryStore(store).delete(String(key));
}

function markIndexedDBUnavailable(error) {
  idbUnavailable = true;
  dbPromise = null;
  if (storageMode === 'indexeddb') storageMode = 'localStorage';
  if (error) console.warn('IndexedDB no disponible; se activa almacenamiento alternativo.', error);
}

function openDB() {
  if (idbUnavailable || typeof indexedDB === 'undefined') {
    idbUnavailable = true;
    return Promise.reject(new Error('IndexedDB no disponible'));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      markIndexedDBUnavailable(error);
      reject(error);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      if (!db.objectStoreNames.contains(DB_META)) db.createObjectStore(DB_META);
    };
    req.onsuccess = () => {
      storageMode = 'indexeddb';
      const db = req.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onerror = () => {
      markIndexedDBUnavailable(req.error);
      reject(req.error || new Error('No se pudo abrir IndexedDB'));
    };
    req.onblocked = () => console.warn('IndexedDB bloqueada por otra pestaña.');
  });
  return dbPromise;
}

function tx(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    let transaction;
    try {
      transaction = db.transaction(store, mode);
      const request = fn(transaction.objectStore(store));
      transaction.oncomplete = () => resolve(request?.result ?? request);
      transaction.onerror = () => reject(transaction.error || new Error('Error de transacción'));
      transaction.onabort = () => reject(transaction.error || new Error('Transacción abortada'));
    } catch (error) {
      reject(error);
    }
  });
}

async function get(store, key) {
  if (!idbUnavailable) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const req = db.transaction(store, 'readonly').objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error || new Error('No se pudo leer IndexedDB'));
      });
    } catch (error) {
      markIndexedDBUnavailable(error);
    }
  }
  return fallbackGet(store, key);
}

async function put(store, key, value) {
  if (!idbUnavailable) {
    try {
      const db = await openDB();
      return await tx(db, store, 'readwrite', objectStore => objectStore.put(value, key));
    } catch (error) {
      markIndexedDBUnavailable(error);
    }
  }
  return fallbackPut(store, key, value);
}

async function del(store, key) {
  if (!idbUnavailable) {
    try {
      const db = await openDB();
      return await tx(db, store, 'readwrite', objectStore => objectStore.delete(key));
    } catch (error) {
      markIndexedDBUnavailable(error);
    }
  }
  fallbackDelete(store, key);
  return undefined;
}

export const SaveManager = {
  // Acepta estados antiguos y también envoltorios { state } de builds previas.
  migrate(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    let state = raw;
    if (!state.creature && state.state && typeof state.state === 'object') state = state.state;
    if (!state.schema || state.schema < 1) state = { ...state, schema: 1 };
    return state;
  },

  async listProfiles() {
    const out = [];
    for (let slot = 0; slot < MAX_PROFILES; slot++) {
      const raw = await get(DB_STORE, slot).catch(() => null);
      if (!raw) {
        out.push({ slot, state: null, empty: true });
        continue;
      }
      const validated = validateProfileState(this.migrate(raw));
      if (validated.ok && validated.state) {
        const state = validated.state;
        out.push({
          slot,
          state,
          name: state.creature?.name || 'Entidad',
          stage: state.creature?.stage || 'nucleo',
          createdAt: state.createdAt,
          lastTs: state.lastTs,
          lifeMode: state.lifeMode
        });
      } else {
        out.push({ slot, state: null, corrupt: true, error: validated.error || 'Partida no válida' });
      }
    }
    return out;
  },

  async loadProfile(slot) {
    const safeSlot = validSlot(slot);
    if (safeSlot == null) return null;
    const raw = await get(DB_STORE, safeSlot).catch(() => null);
    if (!raw) return null;

    const validated = validateProfileState(this.migrate(raw));
    if (validated.ok && validated.state) return validated.state;

    // Recuperación automática mediante copia interna.
    const backup = await get(DB_META, `backup:${safeSlot}`).catch(() => null);
    if (backup) {
      const backupValidated = validateProfileState(this.migrate(backup));
      if (backupValidated.ok && backupValidated.state) return backupValidated.state;
    }
    return { corrupt: true, error: validated.error || 'La partida está dañada.' };
  },

  async saveProfile(slot, state) {
    const safeSlot = validSlot(slot);
    if (safeSlot == null) throw new Error('Ranura de guardado no válida.');
    if (!state || typeof state !== 'object' || !state.creature) {
      throw new Error('No hay una partida válida para guardar.');
    }

    const data = deepClone(state);
    data.schema = SAVE_SCHEMA_VERSION;
    await put(DB_STORE, safeSlot, data);

    // Copia rotativa cada cinco minutos como máximo.
    const key = `backupTs:${safeSlot}`;
    const last = await get(DB_META, key).catch(() => 0);
    if (!last || Date.now() - Number(last) > 5 * 60 * 1000) {
      await put(DB_META, `backup:${safeSlot}`, data).catch(() => {});
      await put(DB_META, key, Date.now()).catch(() => {});
    }
  },

  async deleteProfile(slot) {
    const safeSlot = validSlot(slot);
    if (safeSlot == null) return;
    await del(DB_STORE, safeSlot);
    await del(DB_META, `backup:${safeSlot}`).catch(() => {});
    await del(DB_META, `backupTs:${safeSlot}`).catch(() => {});
  },

  exportProfile(state, slot) {
    if (!state || typeof state !== 'object' || !state.creature) {
      throw new Error('No se puede exportar una partida inválida.');
    }
    const body = deepClone(state);
    const payload = {
      app: 'entidad404',
      version: APP_VERSION,
      schema: SAVE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      slot: validSlot(slot) ?? 0,
      state: body,
      checksum: checksum(JSON.stringify(body))
    };
    return JSON.stringify(payload, null, 2);
  },

  getStorageStatus() {
    return {
      mode: storageMode,
      persistent: storageMode !== 'memory',
      indexedDB: storageMode === 'indexeddb'
    };
  },

  async getMeta(key) { return get(DB_META, key).catch(() => null); },
  async setMeta(key, value) { return put(DB_META, key, value).catch(() => undefined); }
};
