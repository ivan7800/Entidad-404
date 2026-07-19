(() => {
  // js/config.js
  var KEY = "e404:config";
  var DEFAULTS = {
    theme: "oled",
    contrast: "normal",
    // normal | high
    motion: "auto",
    // auto | off
    glitch: "on",
    // on | off
    fontscale: 1,
    // 0.9 .. 1.4
    notifications: false,
    lastProfileSlot: null,
    onboarded: false
  };
  var cfg = { ...DEFAULTS };
  var Config = {
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
    get(k) {
      return cfg[k];
    },
    all() {
      return { ...cfg };
    },
    set(k, v) {
      cfg[k] = v;
      this.save();
      this.apply();
    },
    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(cfg));
      } catch {
      }
    },
    apply() {
      const r = document.documentElement;
      r.setAttribute("data-theme", cfg.theme);
      r.setAttribute("data-contrast", cfg.contrast);
      r.setAttribute("data-motion", cfg.motion === "off" ? "off" : window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "on");
      r.setAttribute("data-glitch", cfg.glitch);
      r.setAttribute("data-fontscale", String(cfg.fontscale));
      r.style.setProperty("--font-scale", String(cfg.fontscale));
    }
  };

  // js/utils/constants.js
  var APP_VERSION = "1.0.3";
  var SAVE_SCHEMA_VERSION = 1;
  var DB_NAME = "entidad404";
  var DB_STORE = "profiles";
  var DB_META = "meta";
  var MAX_PROFILES = 3;
  var STATS = ["hambre", "energia", "higiene", "felicidad", "salud", "afecto", "disciplina", "estres", "curiosidad", "estabilidad"];
  var INVERTED_STATS = ["estres"];
  var STAT_LABELS = {
    hambre: "Saciedad",
    energia: "Energ\xEDa",
    higiene: "Higiene",
    felicidad: "Felicidad",
    salud: "Salud",
    afecto: "Afecto",
    disciplina: "Disciplina",
    estres: "Estr\xE9s",
    curiosidad: "Curiosidad",
    estabilidad: "Estabilidad"
  };
  var STAGES = ["nucleo", "recien", "cria", "juvenil", "adulto"];
  var STAGE_HOURS = { nucleo: 0.05, recien: 24, cria: 72, juvenil: 168 };
  var TIME_SPEEDS = { relajada: 0.6, normal: 1, intensa: 1.6 };
  var MAX_OFFLINE_HOURS = 72;
  var CLOCK_BACK_TOLERANCE_MS = 2 * 60 * 1e3;
  var CORES = {
    prisma: { id: "prisma", nombre: "N\xFAcleo Prisma", desc: "Refracta la luz en patrones imposibles. Late con curiosidad.", afinidad: "curiosidad" },
    abisal: { id: "abisal", nombre: "N\xFAcleo Abisal", desc: "Fr\xEDo al tacto, profundo como una se\xF1al perdida. Late con calma.", afinidad: "estabilidad" },
    ferrita: { id: "ferrita", nombre: "N\xFAcleo Ferrita", desc: "Denso, magn\xE9tico, obstinado. Late con determinaci\xF3n.", afinidad: "disciplina" }
  };
  var TRAITS = ["afectuosa", "curiosa", "rebelde", "serena", "timida", "dormilona", "energica", "glotona", "disciplinada", "caotica", "protectora", "misteriosa"];
  var TRAIT_LABELS = {
    afectuosa: "Afectuosa",
    curiosa: "Curiosa",
    rebelde: "Rebelde",
    serena: "Serena",
    timida: "T\xEDmida",
    dormilona: "Dormilona",
    energica: "En\xE9rgica",
    glotona: "Glotona",
    disciplinada: "Disciplinada",
    caotica: "Ca\xF3tica",
    protectora: "Protectora",
    misteriosa: "Misteriosa"
  };
  var THEMES = [
    { id: "oled", label: "U404 OLED" },
    { id: "terminal", label: "Terminal verde" },
    { id: "ambar", label: "CRT \xE1mbar" },
    { id: "abismo", label: "Abismo azul" },
    { id: "biolab", label: "Biolaboratorio" },
    { id: "noir", label: "Cyber-noir" },
    { id: "minimal", label: "Minimal oscuro" }
  ];
  var ILLNESSES = {
    fiebre_senal: { id: "fiebre_senal", nombre: "Fiebre de se\xF1al", causa: "Estr\xE9s alto y descanso insuficiente.", sintomas: "Tiembla, sus colores oscilan y evita jugar.", medicina: "med_estabilizador", duracionH: 10 },
    saturacion_nucleo: { id: "saturacion_nucleo", nombre: "Saturaci\xF3n de n\xFAcleo", causa: "Exceso de snacks y alimentos densos.", sintomas: "Se mueve despacio y rechaza comida.", medicina: "med_purgante", duracionH: 8 },
    parasito_pixel: { id: "parasito_pixel", nombre: "Par\xE1sito de p\xEDxel", causa: "Higiene baja durante demasiado tiempo.", sintomas: "Peque\xF1os cuadros oscuros recorren su cuerpo.", medicina: "med_antiparasito", duracionH: 12 },
    fatiga_memoria: { id: "fatiga_memoria", nombre: "Fatiga de memoria", causa: "Falta de sue\xF1o acumulada.", sintomas: "Parpadea lento y olvida rutinas.", medicina: "med_reposo", duracionH: 9 },
    inestabilidad_fase: { id: "inestabilidad_fase", nombre: "Inestabilidad de fase", causa: "Estabilidad muy baja.", sintomas: "Su silueta parpadea entre dos posiciones.", medicina: "med_anclaje", duracionH: 14 },
    alergia_sintetica: { id: "alergia_sintetica", nombre: "Alergia sint\xE9tica", causa: "Reacci\xF3n a un alimento an\xF3malo.", sintomas: "Se rasca y estornuda chispas.", medicina: "med_antialergico", duracionH: 6 }
  };
  var GAME_ENERGY_MAX = 5;

  // js/utils/helpers.js
  var clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));
  var HOUR = 36e5;
  var MINUTE = 6e4;
  function formatDuration(ms) {
    const m = Math.floor(ms / MINUTE);
    if (m < 60) return `${m} min`;
    const h2 = Math.floor(m / 60);
    if (h2 < 48) return `${h2} h ${m % 60} min`;
    return `${Math.floor(h2 / 24)} d\xEDas`;
  }
  function formatDate(ts) {
    return new Date(ts).toLocaleDateString(void 0, { day: "numeric", month: "short", year: "numeric" });
  }
  function ageLabel(birthTs, ref = Date.now()) {
    const d = Math.floor((ref - birthTs) / (24 * HOUR));
    if (d < 1) return "menos de un d\xEDa";
    if (d === 1) return "1 d\xEDa";
    return `${d} d\xEDas`;
  }
  function dayPhase(date = /* @__PURE__ */ new Date()) {
    const h2 = date.getHours();
    if (h2 >= 6 && h2 < 9) return "amanecer";
    if (h2 >= 9 && h2 < 19) return "dia";
    if (h2 >= 19 && h2 < 22) return "atardecer";
    return "noche";
  }
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function checksum(str) {
    let h2 = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h2 ^= str.charCodeAt(i);
      h2 = Math.imul(h2, 16777619);
    }
    return (h2 >>> 0).toString(16).padStart(8, "0");
  }
  function deepClone(obj) {
    return typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
  }

  // js/utils/validators.js
  function sanitizeName(raw) {
    if (typeof raw !== "string") return "";
    return raw.replace(/[<>&"'`\\]/g, "").trim().slice(0, 16);
  }
  function isValidName(name) {
    return typeof name === "string" && name.length >= 1 && name.length <= 16;
  }
  function num(v, min, max, def) {
    const n = Number(v);
    return Number.isFinite(n) ? clamp(n, min, max) : def;
  }
  function validateProfileState(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Estructura de partida no v\xE1lida." };
    const c = raw.creature;
    if (!c || typeof c !== "object") return { ok: false, error: "Falta la criatura en la partida." };
    if (!isValidName(sanitizeName(c.name))) return { ok: false, error: "Nombre de criatura no v\xE1lido." };
    if (!STAGES.includes(c.stage)) return { ok: false, error: "Etapa de criatura no v\xE1lida." };
    const state = {
      schema: SAVE_SCHEMA_VERSION,
      createdAt: num(raw.createdAt, 0, 9e15, Date.now()),
      lastTs: num(raw.lastTs, 0, 9e15, Date.now()),
      lastInteraction: num(raw.lastInteraction, 0, 9e15, Date.now()),
      lifeMode: raw.lifeMode === "legado" ? "legado" : "vinculo",
      speed: ["relajada", "normal", "intensa"].includes(raw.speed) ? raw.speed : "normal",
      creature: {
        name: sanitizeName(c.name),
        core: ["prisma", "abisal", "ferrita"].includes(c.core) ? c.core : "prisma",
        stage: c.stage,
        formId: typeof c.formId === "string" ? c.formId.slice(0, 40) : "nucleo_prisma",
        birthTs: num(c.birthTs, 0, 9e15, Date.now()),
        hatched: !!c.hatched,
        sleeping: !!c.sleeping,
        lightsOff: !!c.lightsOff,
        suspended: !!c.suspended,
        illness: typeof c.illness === "string" ? c.illness.slice(0, 40) : null,
        illnessUntil: num(c.illnessUntil, 0, 9e15, 0),
        stats: {},
        personality: {},
        prefs: {
          favFood: typeof c.prefs?.favFood === "string" ? c.prefs.favFood.slice(0, 40) : null,
          hatedFood: typeof c.prefs?.hatedFood === "string" ? c.prefs.hatedFood.slice(0, 40) : null,
          favGame: typeof c.prefs?.favGame === "string" ? c.prefs.favGame.slice(0, 40) : null
        },
        wakeHour: num(c.wakeHour, 0, 23, 8),
        sleepHour: num(c.sleepHour, 0, 23, 23)
      },
      wallet: {
        fragmentos: num(raw.wallet?.fragmentos, 0, 999999, 0),
        ecos: num(raw.wallet?.ecos, 0, 99999, 0)
      },
      inventory: {},
      decor: {},
      achievements: {},
      records: {},
      counters: {},
      memories: [],
      diary: [],
      legacy: Array.isArray(raw.legacy) ? raw.legacy.slice(0, 20).map((l) => ({
        name: sanitizeName(l?.name || "?"),
        formId: String(l?.formId || "").slice(0, 40),
        days: num(l?.days, 0, 9999, 0),
        ts: num(l?.ts, 0, 9e15, Date.now())
      })) : [],
      discovered: [],
      modes: {
        descanso: !!raw.modes?.descanso,
        descansoUntil: num(raw.modes?.descansoUntil, 0, 9e15, 0),
        vacaciones: !!raw.modes?.vacaciones,
        vacacionesDesde: num(raw.modes?.vacacionesDesde, 0, 9e15, 0)
      },
      gameEnergy: num(raw.gameEnergy, 0, 5, 5),
      gameEnergyTs: num(raw.gameEnergyTs, 0, 9e15, Date.now()),
      anomalies: num(raw.anomalies, 0, 9999, 0),
      _lastActiveDay: typeof raw._lastActiveDay === "string" ? raw._lastActiveDay.slice(0, 40) : null,
      _lastNightDay: typeof raw._lastNightDay === "string" ? raw._lastNightDay.slice(0, 40) : null
    };
    for (const s of STATS) state.creature.stats[s] = num(c.stats?.[s], 0, 100, 50);
    const per = c.personality || {};
    for (const k of Object.keys(per)) {
      if (typeof k === "string" && k.length < 30) state.creature.personality[k.slice(0, 30)] = num(per[k], 0, 100, 0);
    }
    const inv = raw.inventory || {};
    for (const k of Object.keys(inv)) {
      const q = num(inv[k], 0, 999, 0);
      if (q > 0 && typeof k === "string" && k.length < 50) state.inventory[k.slice(0, 50)] = q;
    }
    const dec = raw.decor || {};
    for (const k of Object.keys(dec)) {
      if (typeof dec[k] === "string" && k.length < 30) state.decor[k.slice(0, 30)] = dec[k].slice(0, 50);
    }
    const ach = raw.achievements || {};
    for (const k of Object.keys(ach)) {
      const a = ach[k];
      if (a && typeof a === "object") state.achievements[k.slice(0, 50)] = { done: !!a.done, ts: num(a.ts, 0, 9e15, 0), progress: num(a.progress, 0, 999999, 0) };
    }
    const rec = raw.records || {};
    for (const k of Object.keys(rec)) state.records[k.slice(0, 50)] = num(rec[k], 0, 9e9, 0);
    const cnt = raw.counters || {};
    for (const k of Object.keys(cnt)) state.counters[k.slice(0, 50)] = num(cnt[k], 0, 9e9, 0);
    if (Array.isArray(raw.memories)) {
      state.memories = raw.memories.slice(0, 120).map((m) => ({
        id: String(m?.id || "").slice(0, 40),
        ts: num(m?.ts, 0, 9e15, Date.now()),
        text: String(m?.text || "").slice(0, 200),
        tone: ["neutral", "feliz", "malo", "raro"].includes(m?.tone) ? m.tone : "neutral"
      })).filter((m) => m.text);
    }
    if (Array.isArray(raw.diary)) {
      state.diary = raw.diary.slice(-200).map((d) => ({
        ts: num(d?.ts, 0, 9e15, Date.now()),
        text: String(d?.text || "").slice(0, 240)
      })).filter((d) => d.text);
    }
    if (Array.isArray(raw.discovered)) {
      state.discovered = [...new Set(raw.discovered.filter((x) => typeof x === "string").map((x) => x.slice(0, 40)))].slice(0, 100);
    }
    return { ok: true, state };
  }
  function validateExport(json) {
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      return { ok: false, error: "El archivo no es un JSON v\xE1lido." };
    }
    if (!data || typeof data !== "object") return { ok: false, error: "Formato de copia no reconocido." };
    if (data.app !== "entidad404") return { ok: false, error: "Este archivo no pertenece a Entidad 404." };
    if (typeof data.schema !== "number" || data.schema > SAVE_SCHEMA_VERSION) {
      return { ok: false, error: "La copia procede de una versi\xF3n m\xE1s reciente de la aplicaci\xF3n." };
    }
    if (data.checksum) {
      const body = JSON.stringify(data.state);
      if (checksum(body) !== data.checksum) return { ok: false, error: "La copia parece da\xF1ada (checksum no coincide)." };
    }
    const v = validateProfileState(data.state);
    if (!v.ok) return v;
    return { ok: true, state: v.state, exportedAt: data.exportedAt || null };
  }

  // js/core/save-manager.js
  var DB_VERSION = 1;
  var FALLBACK_PREFIX = "e404:fallback";
  var dbPromise = null;
  var idbUnavailable = false;
  var storageMode = "indexeddb";
  var memoryStores = /* @__PURE__ */ new Map([
    [DB_STORE, /* @__PURE__ */ new Map()],
    [DB_META, /* @__PURE__ */ new Map()]
  ]);
  function validSlot(slot) {
    const n = Number(slot);
    return Number.isInteger(n) && n >= 0 && n < MAX_PROFILES ? n : null;
  }
  function fallbackKey(store, key) {
    return `${FALLBACK_PREFIX}:${store}:${String(key)}`;
  }
  function memoryStore(store) {
    if (!memoryStores.has(store)) memoryStores.set(store, /* @__PURE__ */ new Map());
    return memoryStores.get(store);
  }
  function fallbackGet(store, key) {
    try {
      const raw = localStorage.getItem(fallbackKey(store, key));
      storageMode = "localStorage";
      return raw == null ? null : JSON.parse(raw);
    } catch {
      storageMode = "memory";
      return memoryStore(store).get(String(key)) ?? null;
    }
  }
  function fallbackPut(store, key, value) {
    try {
      localStorage.setItem(fallbackKey(store, key), JSON.stringify(value));
      storageMode = "localStorage";
      return value;
    } catch {
      storageMode = "memory";
      memoryStore(store).set(String(key), deepClone(value));
      return value;
    }
  }
  function fallbackDelete(store, key) {
    try {
      localStorage.removeItem(fallbackKey(store, key));
      storageMode = "localStorage";
    } catch {
      storageMode = "memory";
    }
    memoryStore(store).delete(String(key));
  }
  function markIndexedDBUnavailable(error) {
    idbUnavailable = true;
    dbPromise = null;
    if (storageMode === "indexeddb") storageMode = "localStorage";
    if (error) console.warn("IndexedDB no disponible; se activa almacenamiento alternativo.", error);
  }
  function openDB() {
    if (idbUnavailable || typeof indexedDB === "undefined") {
      idbUnavailable = true;
      return Promise.reject(new Error("IndexedDB no disponible"));
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
        storageMode = "indexeddb";
        const db = req.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      req.onerror = () => {
        markIndexedDBUnavailable(req.error);
        reject(req.error || new Error("No se pudo abrir IndexedDB"));
      };
      req.onblocked = () => console.warn("IndexedDB bloqueada por otra pesta\xF1a.");
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
        transaction.onerror = () => reject(transaction.error || new Error("Error de transacci\xF3n"));
        transaction.onabort = () => reject(transaction.error || new Error("Transacci\xF3n abortada"));
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
          const req = db.transaction(store, "readonly").objectStore(store).get(key);
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror = () => reject(req.error || new Error("No se pudo leer IndexedDB"));
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
        return await tx(db, store, "readwrite", (objectStore) => objectStore.put(value, key));
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
        return await tx(db, store, "readwrite", (objectStore) => objectStore.delete(key));
      } catch (error) {
        markIndexedDBUnavailable(error);
      }
    }
    fallbackDelete(store, key);
    return void 0;
  }
  var SaveManager = {
    // Acepta estados antiguos y también envoltorios { state } de builds previas.
    migrate(raw) {
      if (!raw || typeof raw !== "object") return raw;
      let state = raw;
      if (!state.creature && state.state && typeof state.state === "object") state = state.state;
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
            name: state.creature?.name || "Entidad",
            stage: state.creature?.stage || "nucleo",
            createdAt: state.createdAt,
            lastTs: state.lastTs,
            lifeMode: state.lifeMode
          });
        } else {
          out.push({ slot, state: null, corrupt: true, error: validated.error || "Partida no v\xE1lida" });
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
      const backup = await get(DB_META, `backup:${safeSlot}`).catch(() => null);
      if (backup) {
        const backupValidated = validateProfileState(this.migrate(backup));
        if (backupValidated.ok && backupValidated.state) return backupValidated.state;
      }
      return { corrupt: true, error: validated.error || "La partida est\xE1 da\xF1ada." };
    },
    async saveProfile(slot, state) {
      const safeSlot = validSlot(slot);
      if (safeSlot == null) throw new Error("Ranura de guardado no v\xE1lida.");
      if (!state || typeof state !== "object" || !state.creature) {
        throw new Error("No hay una partida v\xE1lida para guardar.");
      }
      const data = deepClone(state);
      data.schema = SAVE_SCHEMA_VERSION;
      await put(DB_STORE, safeSlot, data);
      const key = `backupTs:${safeSlot}`;
      const last = await get(DB_META, key).catch(() => 0);
      if (!last || Date.now() - Number(last) > 5 * 60 * 1e3) {
        await put(DB_META, `backup:${safeSlot}`, data).catch(() => {
        });
        await put(DB_META, key, Date.now()).catch(() => {
        });
      }
    },
    async deleteProfile(slot) {
      const safeSlot = validSlot(slot);
      if (safeSlot == null) return;
      await del(DB_STORE, safeSlot);
      await del(DB_META, `backup:${safeSlot}`).catch(() => {
      });
      await del(DB_META, `backupTs:${safeSlot}`).catch(() => {
      });
    },
    exportProfile(state, slot) {
      if (!state || typeof state !== "object" || !state.creature) {
        throw new Error("No se puede exportar una partida inv\xE1lida.");
      }
      const body = deepClone(state);
      const payload = {
        app: "entidad404",
        version: APP_VERSION,
        schema: SAVE_SCHEMA_VERSION,
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        slot: validSlot(slot) ?? 0,
        state: body,
        checksum: checksum(JSON.stringify(body))
      };
      return JSON.stringify(payload, null, 2);
    },
    getStorageStatus() {
      return {
        mode: storageMode,
        persistent: storageMode !== "memory",
        indexedDB: storageMode === "indexeddb"
      };
    },
    async getMeta(key) {
      return get(DB_META, key).catch(() => null);
    },
    async setMeta(key, value) {
      return put(DB_META, key, value).catch(() => void 0);
    }
  };

  // js/core/event-bus.js
  var listeners = /* @__PURE__ */ new Map();
  var bus = {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, /* @__PURE__ */ new Set());
      listeners.get(event).add(fn);
      return () => bus.off(event, fn);
    },
    off(event, fn) {
      listeners.get(event)?.delete(fn);
    },
    emit(event, payload) {
      listeners.get(event)?.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[bus:${event}]`, err);
        }
      });
    }
  };

  // js/core/time-engine.js
  function computeElapsed(lastTs, nowTs, maxHours = MAX_OFFLINE_HOURS) {
    if (!Number.isFinite(lastTs) || !Number.isFinite(nowTs)) {
      return { elapsedMs: 0, clamped: false, anomaly: true };
    }
    const raw = nowTs - lastTs;
    if (raw < -CLOCK_BACK_TOLERANCE_MS) {
      return { elapsedMs: 0, clamped: false, anomaly: true };
    }
    if (raw < 0) return { elapsedMs: 0, clamped: false, anomaly: false };
    const maxMs = maxHours * HOUR;
    if (raw > maxMs) return { elapsedMs: maxMs, clamped: true, anomaly: raw > maxMs * 4 };
    return { elapsedMs: raw, clamped: false, anomaly: false };
  }
  function splitIntoBlocks(startTs, elapsedMs, maxBlocks = 24) {
    if (elapsedMs <= 0) return [];
    const totalH = elapsedMs / HOUR;
    const n = Math.max(1, Math.min(maxBlocks, Math.ceil(totalH)));
    const blockH = totalH / n;
    const blocks = [];
    for (let i = 0; i < n; i++) {
      const ts = startTs + i * blockH * HOUR;
      const h2 = new Date(ts).getHours();
      const night = h2 >= 23 || h2 < 7;
      blocks.push({ startTs: ts, hours: blockH, night });
    }
    return blocks;
  }
  function regenGameEnergy(current2, lastTs, nowTs, max = GAME_ENERGY_MAX) {
    const elapsed = Math.max(0, nowTs - lastTs);
    const gained = Math.floor(elapsed / (30 * 60 * 1e3));
    if (gained <= 0) return { energy: clamp(current2, 0, max), ts: lastTs };
    return { energy: clamp(current2 + gained, 0, max), ts: lastTs + gained * 30 * 60 * 1e3 };
  }
  function isSleepWindow(hourNow, sleepHour, wakeHour) {
    if (sleepHour === wakeHour) return false;
    if (sleepHour < wakeHour) return hourNow >= sleepHour && hourNow < wakeHour;
    return hourNow >= sleepHour || hourNow < wakeHour;
  }

  // js/systems/needs-system.js
  var DECAY_PER_HOUR = {
    hambre: -4.2,
    // saciedad baja
    energia: -3,
    higiene: -2.2,
    felicidad: -1.6,
    salud: 0,
    // depende de las demás
    afecto: -0.8,
    disciplina: -0.3,
    estres: 1,
    // sube lentamente
    curiosidad: -0.5,
    estabilidad: -0.4
  };
  function applyDecay(stats, hours, ctx3 = {}) {
    const s = { ...stats };
    if (hours <= 0) return s;
    const speed = ctx3.speed ?? 1;
    const vacationMult = ctx3.vacation ? 0.05 : 1;
    const restMult = ctx3.resting ? 0.35 : 1;
    const mult = speed * vacationMult * restMult;
    const asleep = !!ctx3.sleeping;
    s.hambre += DECAY_PER_HOUR.hambre * hours * mult * (asleep ? 0.45 : 1);
    s.higiene += DECAY_PER_HOUR.higiene * hours * mult * (asleep ? 0.5 : 1);
    s.felicidad += DECAY_PER_HOUR.felicidad * hours * mult;
    s.afecto += DECAY_PER_HOUR.afecto * hours * mult;
    s.disciplina += DECAY_PER_HOUR.disciplina * hours * mult;
    s.curiosidad += DECAY_PER_HOUR.curiosidad * hours * mult;
    s.estabilidad += DECAY_PER_HOUR.estabilidad * hours * mult;
    if (asleep) {
      s.energia += 9 * hours * speed;
      s.estres -= 3.5 * hours * speed;
    } else {
      s.energia += DECAY_PER_HOUR.energia * hours * mult;
      s.estres += DECAY_PER_HOUR.estres * hours * mult;
      if (ctx3.night) s.estres += 1.2 * hours * mult;
    }
    if (s.hambre < 15) {
      s.salud -= 2.5 * hours * mult;
      s.felicidad -= 2 * hours * mult;
    }
    if (s.energia < 15) {
      s.estres += 2.2 * hours * mult;
      s.felicidad -= 1 * hours * mult;
    }
    if (s.higiene < 20) {
      s.salud -= 1.8 * hours * mult;
      s.felicidad -= 0.8 * hours * mult;
    }
    if (s.estres > 75) {
      s.estabilidad -= 1.6 * hours * mult;
      s.salud -= 0.8 * hours * mult;
    }
    if (s.afecto > 70 && s.salud < 90) s.salud += 1.2 * hours * mult;
    if (s.felicidad > 75) s.estres -= 0.8 * hours * mult;
    if (ctx3.sickness) {
      s.salud -= 1.5 * hours * mult;
      s.energia -= 1 * hours * mult;
      s.felicidad -= 1 * hours * mult;
    }
    for (const k of Object.keys(s)) s[k] = clamp(s[k]);
    return s;
  }
  function applyAura(stats, aura = {}, hours = 0, ctx3 = {}) {
    if (hours <= 0 || ctx3.vacation) return stats;
    const s = { ...stats };
    const restBonus = ctx3.sleeping ? 1.5 : 1;
    for (const [k, v] of Object.entries(aura)) {
      if (typeof s[k] !== "number" || !Number.isFinite(v)) continue;
      s[k] = clamp(s[k] + v * 0.35 * hours * restBonus);
    }
    return s;
  }
  function applyEffects(stats, fx = {}) {
    const s = { ...stats };
    for (const [k, v] of Object.entries(fx)) {
      if (k in s) s[k] = clamp(s[k] + v);
    }
    return s;
  }
  function urgencyLevel(stats, illness) {
    if (illness || stats.salud < 25 || stats.hambre < 12 || stats.energia < 10) return 2;
    if (stats.hambre < 30 || stats.higiene < 30 || stats.felicidad < 30 || stats.estres > 75 || stats.energia < 25) return 1;
    return 0;
  }
  function careScore(stats) {
    const positive = (stats.hambre + stats.energia + stats.higiene + stats.felicidad + stats.salud + stats.afecto) / 6;
    return clamp(positive - stats.estres * 0.15);
  }

  // js/utils/random.js
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function chance(p) {
    return Math.random() < p;
  }
  function weightedPick(entries) {
    const total = entries.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const e of entries) {
      r -= e.w;
      if (r <= 0) return e.value;
    }
    return entries[entries.length - 1].value;
  }
  var lastPicks = /* @__PURE__ */ new Map();
  function pickFresh(key, arr) {
    if (!arr || arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    let v;
    do {
      v = pick(arr);
    } while (v === lastPicks.get(key));
    lastPicks.set(key, v);
    return v;
  }

  // js/systems/health-system.js
  function illnessRisk(stats, hours) {
    let p = 0;
    if (stats.higiene < 20) p += 0.02 * hours;
    if (stats.estres > 80) p += 0.018 * hours;
    if (stats.energia < 12) p += 0.015 * hours;
    if (stats.estabilidad < 20) p += 0.02 * hours;
    if (stats.salud < 30) p += 0.01 * hours;
    return Math.min(0.5, p);
  }
  function pickIllness(stats) {
    const candidates = [];
    if (stats.estres > 75) candidates.push("fiebre_senal");
    if (stats.higiene < 25) candidates.push("parasito_pixel");
    if (stats.energia < 18) candidates.push("fatiga_memoria");
    if (stats.estabilidad < 25) candidates.push("inestabilidad_fase");
    if (candidates.length === 0) candidates.push("fiebre_senal");
    return pick(candidates);
  }
  function maybeGetSick(creature, hours, rng = chance) {
    if (creature.illness || !creature.hatched || creature.suspended) return null;
    const risk = illnessRisk(creature.stats, hours);
    if (rng(risk)) {
      const id = pickIllness(creature.stats);
      return { id, until: Date.now() + ILLNESSES[id].duracionH * HOUR };
    }
    return null;
  }
  function applyMedicine(creature, medItem) {
    if (!creature.illness) return { ok: false, reason: "No est\xE1 enferma." };
    const ill = ILLNESSES[creature.illness];
    if (!ill) {
      creature.illness = null;
      return { ok: true, cured: true };
    }
    if (medItem.cura === creature.illness) {
      creature.illness = null;
      creature.illnessUntil = 0;
      return { ok: true, cured: true, name: ill.nombre };
    }
    return { ok: false, reason: `Esa medicina no trata la ${ill.nombre.toLowerCase()}.` };
  }

  // js/data/creatures.js
  var FORMS = [
    // ───────────── NÚCLEOS (huevos) ─────────────
    {
      id: "nucleo_prisma",
      nombre: "N\xFAcleo Prisma",
      etapa: "nucleo",
      familia: "prisma",
      cuerpo: "egg",
      hue: 180,
      desc: "Un huevo facetado que refracta luz que no existe en la sala."
    },
    {
      id: "nucleo_abisal",
      nombre: "N\xFAcleo Abisal",
      etapa: "nucleo",
      familia: "abisal",
      cuerpo: "egg",
      hue: 215,
      desc: "Un huevo liso y fr\xEDo. Si lo escuchas de cerca, suena a marea."
    },
    {
      id: "nucleo_ferrita",
      nombre: "N\xFAcleo Ferrita",
      etapa: "nucleo",
      familia: "ferrita",
      cuerpo: "egg",
      hue: 20,
      desc: "Un huevo denso con vetas met\xE1licas. Atrae el polvo en espirales."
    },
    // ───────────── RECIÉN NACIDOS (3) ─────────────
    {
      id: "lumin",
      nombre: "Lumin",
      etapa: "recien",
      familia: "prisma",
      cuerpo: "blob",
      hue: 185,
      desc: "Una gota luminosa que parpadea al ritmo de tu voz.",
      cond: { core: "prisma" }
    },
    {
      id: "brumo",
      nombre: "Brumo",
      etapa: "recien",
      familia: "abisal",
      cuerpo: "blob",
      hue: 220,
      desc: "Una burbuja transl\xFAcida que deja rastros de niebla.",
      cond: { core: "abisal" }
    },
    {
      id: "ferrin",
      nombre: "Ferr\xEDn",
      etapa: "recien",
      familia: "ferrita",
      cuerpo: "blob",
      hue: 25,
      desc: "Una esferita rugosa que rueda contra tu dedo, terca y c\xE1lida.",
      cond: { core: "ferrita" }
    },
    // ───────────── CRÍAS (6) ─────────────
    {
      id: "chispel",
      nombre: "Chispel",
      etapa: "cria",
      familia: "prisma",
      cuerpo: "round",
      hue: 175,
      desc: "Cr\xEDa facetada, coleccionista de reflejos.",
      cond: { family: "prisma", stat: { curiosidad: 40 } }
    },
    {
      id: "onduil",
      nombre: "Onduil",
      etapa: "cria",
      familia: "abisal",
      cuerpo: "round",
      hue: 210,
      desc: "Cr\xEDa acuosa que flota dos cent\xEDmetros por encima de todo.",
      cond: { family: "abisal", stat: { estabilidad: 40 } }
    },
    {
      id: "tornel",
      nombre: "Tornel",
      etapa: "cria",
      familia: "ferrita",
      cuerpo: "angular",
      hue: 30,
      desc: "Cr\xEDa angulosa que ordena sus juguetes por peso.",
      cond: { family: "ferrita", stat: { disciplina: 35 } }
    },
    {
      id: "velino",
      nombre: "Velino",
      etapa: "cria",
      familia: "espectral",
      cuerpo: "ghost",
      hue: 265,
      desc: "Cr\xEDa tenue que aparece antes de que la llames.",
      cond: { stat: { estabilidad: -35 }, trait: "misteriosa" }
    },
    {
      id: "brotel",
      nombre: "Brotel",
      etapa: "cria",
      familia: "botanica",
      cuerpo: "sprout",
      hue: 120,
      desc: "Cr\xEDa con un brote que gira buscando una luz que le gusta.",
      cond: { stat: { felicidad: 55, salud: 55 } }
    },
    {
      id: "pixin",
      nombre: "Pix\xEDn",
      etapa: "cria",
      familia: "glitch",
      cuerpo: "cube",
      hue: 320,
      desc: "Cr\xEDa c\xFAbica que a veces parpadea medio fotograma tarde.",
      cond: { anomalies: 1, trait: "caotica" }
    },
    // ───────────── JUVENILES (10) ─────────────
    {
      id: "prismil",
      nombre: "Prismil",
      etapa: "juvenil",
      familia: "prisma",
      cuerpo: "tall",
      hue: 178,
      desc: "Juvenil de cristal que tararea espectros de color.",
      cond: { family: "prisma", stat: { curiosidad: 50 } }
    },
    {
      id: "faroluz",
      nombre: "Faroluz",
      etapa: "juvenil",
      familia: "prisma",
      cuerpo: "orb",
      hue: 190,
      desc: "Juvenil que enciende su n\xFAcleo cuando est\xE1s triste.",
      cond: { family: "prisma", stat: { afecto: 60 } }
    },
    {
      id: "marejil",
      nombre: "Marejil",
      etapa: "juvenil",
      familia: "abisal",
      cuerpo: "tall",
      hue: 215,
      desc: "Juvenil de corrientes lentas. Duerme flotando bocarriba.",
      cond: { family: "abisal", stat: { estabilidad: 55 } }
    },
    {
      id: "abisel",
      nombre: "Abisel",
      etapa: "juvenil",
      familia: "abisal",
      cuerpo: "ghost",
      hue: 230,
      desc: "Juvenil de aguas profundas con ojos de linterna.",
      cond: { family: "abisal", trait: "serena" }
    },
    {
      id: "forjil",
      nombre: "Forjil",
      etapa: "juvenil",
      familia: "ferrita",
      cuerpo: "angular",
      hue: 28,
      desc: "Juvenil blindado que practica posturas de guardia.",
      cond: { family: "ferrita", stat: { disciplina: 55 } }
    },
    {
      id: "magnel",
      nombre: "Magnel",
      etapa: "juvenil",
      familia: "ferrita",
      cuerpo: "round",
      hue: 12,
      desc: "Juvenil magn\xE9tico al que se le pegan los tornillos perdidos.",
      cond: { family: "ferrita", trait: "protectora" }
    },
    {
      id: "sombrel",
      nombre: "Sombrel",
      etapa: "juvenil",
      familia: "espectral",
      cuerpo: "ghost",
      hue: 270,
      desc: "Juvenil de contornos suaves que colecciona silencios.",
      cond: { family: "espectral" }
    },
    {
      id: "floresta",
      nombre: "Floresta",
      etapa: "juvenil",
      familia: "botanica",
      cuerpo: "sprout",
      hue: 110,
      desc: "Juvenil con jard\xEDn propio en la espalda.",
      cond: { family: "botanica", stat: { salud: 60 } }
    },
    {
      id: "lunel",
      nombre: "Lunel",
      etapa: "juvenil",
      familia: "astral",
      cuerpo: "orb",
      hue: 250,
      desc: "Juvenil orbitado por tres motas de polvo estelar.",
      cond: { night: true, stat: { curiosidad: 55 } }
    },
    {
      id: "bitzel",
      nombre: "Bitzel",
      etapa: "juvenil",
      familia: "glitch",
      cuerpo: "cube",
      hue: 315,
      desc: "Juvenil teselado que habla en fragmentos desordenados.",
      cond: { family: "glitch" }
    },
    // ───────────── ADULTOS (16) ─────────────
    {
      id: "prismarch",
      nombre: "Prismarca",
      etapa: "adulto",
      familia: "prisma",
      cuerpo: "tall",
      hue: 176,
      desc: "Adulta coronada de facetas. Proyecta auroras diminutas al alegrarse.",
      cond: { family: "prisma", stat: { curiosidad: 60, felicidad: 55 } }
    },
    {
      id: "espejun",
      nombre: "Espej\xFAn",
      etapa: "adulto",
      familia: "prisma",
      cuerpo: "orb",
      hue: 195,
      desc: "Adulto espejado que imita tus gestos medio segundo despu\xE9s.",
      cond: { family: "prisma", stat: { afecto: 65 } }
    },
    {
      id: "caleidor",
      nombre: "Caleidor",
      etapa: "adulto",
      familia: "prisma",
      cuerpo: "angular",
      hue: 160,
      desc: "Adulto caleidosc\xF3pico, inquieto, siempre reordenando su piel.",
      cond: { family: "prisma", trait: "energica" }
    },
    {
      id: "marabis",
      nombre: "Marabis",
      etapa: "adulto",
      familia: "abisal",
      cuerpo: "tall",
      hue: 212,
      desc: "Adulta de marea tranquila. Su respiraci\xF3n calma la sala.",
      cond: { family: "abisal", stat: { estabilidad: 65 } }
    },
    {
      id: "fosforal",
      nombre: "Fosforal",
      etapa: "adulto",
      familia: "abisal",
      cuerpo: "ghost",
      hue: 200,
      desc: "Adulto bioluminiscente que escribe ondas en el aire al hablar.",
      cond: { family: "abisal", trait: "misteriosa" }
    },
    {
      id: "nereidon",
      nombre: "Nereid\xF3n",
      etapa: "adulto",
      familia: "abisal",
      cuerpo: "orb",
      hue: 225,
      desc: "Adulto de profundidad, guardi\xE1n de las corrientes de datos.",
      cond: { family: "abisal", stat: { disciplina: 55 } }
    },
    {
      id: "yunkar",
      nombre: "Yunkar",
      etapa: "adulto",
      familia: "ferrita",
      cuerpo: "angular",
      hue: 24,
      desc: "Adulto forjado. Cuando duerme parece una escultura antigua.",
      cond: { family: "ferrita", stat: { disciplina: 65 } }
    },
    {
      id: "imantra",
      nombre: "Imantra",
      etapa: "adulto",
      familia: "ferrita",
      cuerpo: "tall",
      hue: 8,
      desc: "Adulta magn\xE9tica que orienta su cuerpo al norte al meditar.",
      cond: { family: "ferrita", trait: "serena" }
    },
    {
      id: "oxidal",
      nombre: "Oxidal",
      etapa: "adulto",
      familia: "ferrita",
      cuerpo: "round",
      hue: 35,
      desc: "Adulto de p\xE1tina c\xE1lida, cari\xF1oso y pesado como una manta.",
      cond: { family: "ferrita", stat: { afecto: 60 } }
    },
    {
      id: "umbrion",
      nombre: "Umbri\xF3n",
      etapa: "adulto",
      familia: "espectral",
      cuerpo: "ghost",
      hue: 268,
      desc: "Adulto del umbral. Aparece en los reflejos un instante antes que en la sala.",
      cond: { family: "espectral", stat: { curiosidad: 55 } }
    },
    {
      id: "susurra",
      nombre: "Susurra",
      etapa: "adulto",
      familia: "espectral",
      cuerpo: "tall",
      hue: 280,
      desc: "Adulta que guarda tus palabras y las devuelve cuando las necesitas.",
      cond: { family: "espectral", stat: { afecto: 60 } }
    },
    {
      id: "arborhal",
      nombre: "Arb\xF3rhal",
      etapa: "adulto",
      familia: "botanica",
      cuerpo: "sprout",
      hue: 105,
      desc: "Adulto jard\xEDn. Florece con tus buenos h\xE1bitos.",
      cond: { family: "botanica", stat: { salud: 65 } }
    },
    {
      id: "polenda",
      nombre: "Polenda",
      etapa: "adulto",
      familia: "botanica",
      cuerpo: "round",
      hue: 80,
      desc: "Adulta polinizadora de ideas: deja esporas doradas sobre lo que tocas.",
      cond: { family: "botanica", trait: "afectuosa" }
    },
    {
      id: "astrion",
      nombre: "Astri\xF3n",
      etapa: "adulto",
      familia: "astral",
      cuerpo: "orb",
      hue: 248,
      desc: "Adulto orbital con un cintur\xF3n de fragmentos brillantes.",
      cond: { family: "astral" }
    },
    {
      id: "novalis",
      nombre: "Novalis",
      etapa: "adulto",
      familia: "astral",
      cuerpo: "tall",
      hue: 238,
      desc: "Adulta estelar. Su n\xFAcleo pulsa como una estrella joven.",
      cond: { family: "astral", stat: { felicidad: 65 } }
    },
    {
      id: "fragmentor",
      nombre: "Fragmentor",
      etapa: "adulto",
      familia: "glitch",
      cuerpo: "cube",
      hue: 318,
      desc: "Adulto de teselas m\xF3viles. Reconstruye su cuerpo cada amanecer.",
      cond: { family: "glitch" }
    },
    // ───────────── SECRETAS (6) ─────────────
    {
      id: "error_original",
      nombre: "Error Original",
      etapa: "adulto",
      familia: "glitch",
      cuerpo: "cube",
      hue: 300,
      secreta: true,
      desc: "Dicen que fue la primera anomal\xEDa. Parpadea en un idioma anterior al c\xF3digo.",
      cond: { anomalies: 3, trait: "caotica", stat: { estabilidad: -40 } }
    },
    {
      id: "custodia",
      nombre: "Custodia",
      etapa: "adulto",
      familia: "espectral",
      cuerpo: "ghost",
      hue: 275,
      secreta: true,
      desc: "Guardiana del umbral. Solo se muestra a quien cuid\xF3 sin descanso.",
      cond: { stat: { afecto: 80, salud: 70 }, trait: "protectora" }
    },
    {
      id: "meridion",
      nombre: "Meridi\xF3n",
      etapa: "adulto",
      familia: "astral",
      cuerpo: "orb",
      hue: 255,
      secreta: true,
      desc: "Nace de las noches compartidas. Lleva un mapa estelar en la piel.",
      cond: { night: true, stat: { curiosidad: 70 }, counter: { suenos: 5 } }
    },
    {
      id: "reliquiar",
      nombre: "Reliquiar",
      etapa: "adulto",
      familia: "ferrita",
      cuerpo: "angular",
      hue: 45,
      secreta: true,
      desc: "Un adulto forjado con memoria de otras vidas.",
      cond: { legacy: 1, family: "ferrita" }
    },
    {
      id: "coralum",
      nombre: "Coralum",
      etapa: "adulto",
      familia: "abisal",
      cuerpo: "sprout",
      hue: 190,
      secreta: true,
      desc: "Jard\xEDn abisal. Crece donde el agua y la luz se pusieron de acuerdo.",
      cond: { family: "abisal", stat: { salud: 75, felicidad: 70 } }
    },
    {
      id: "diamantea",
      nombre: "Diamantea",
      etapa: "adulto",
      familia: "prisma",
      cuerpo: "tall",
      hue: 165,
      secreta: true,
      desc: "La forma perfecta del prisma. Casi nadie la ha visto dos veces.",
      cond: { family: "prisma", stat: { curiosidad: 75, disciplina: 70, estres: -30 } }
    }
  ];
  var FORM_MAP = Object.fromEntries(FORMS.map((f) => [f.id, f]));
  var FAMILY_LABELS = {
    prisma: "Prisma",
    ferrita: "Ferrita",
    abisal: "Abisal",
    espectral: "Espectral",
    botanica: "Bot\xE1nica",
    astral: "Astral",
    mecanica: "Mec\xE1nica",
    glitch: "Glitch"
  };
  function formsByStage(stage) {
    return FORMS.filter((f) => f.etapa === stage);
  }

  // js/systems/personality-system.js
  function nudgeTrait(personality, trait, amount) {
    if (!TRAITS.includes(trait)) return personality;
    const p = { ...personality };
    p[trait] = clamp((p[trait] || 0) + amount);
    return p;
  }
  function dominantTrait(personality) {
    let best = null, bestV = 24;
    for (const t of TRAITS) {
      const v = personality[t] || 0;
      if (v > bestV) {
        best = t;
        bestV = v;
      }
    }
    return best;
  }
  function topTraits(personality, n = 3) {
    return TRAITS.map((t) => ({ t, v: personality[t] || 0 })).filter((e) => e.v > 12).sort((a, b) => b.v - a.v).slice(0, n);
  }
  function describePersonality(personality) {
    const dom = dominantTrait(personality);
    if (!dom) return "Su personalidad a\xFAn se est\xE1 formando. Cada gesto tuyo deja huella.";
    const map = {
      afectuosa: "Busca el contacto y responde con calidez a cada gesto.",
      curiosa: "Investiga todo lo que brilla, suena o no deber\xEDa estar ah\xED.",
      rebelde: "Cumple las normas... cuando le apetece. Tiene car\xE1cter.",
      serena: "Mantiene la calma incluso cuando la se\xF1al tiembla.",
      timida: "Prefiere los rincones y los gestos suaves.",
      dormilona: "Su actividad favorita es la siesta. La segunda, tambi\xE9n.",
      energica: "No para quieta. La c\xE1mara se le queda peque\xF1a.",
      glotona: "Su n\xFAcleo late m\xE1s r\xE1pido a la hora de comer.",
      disciplinada: "Sigue rutinas con orgullo casi militar.",
      caotica: "Impredecible. Ni ella sabe qu\xE9 har\xE1 en cinco minutos.",
      protectora: "Vigila la c\xE1mara como si guardara algo valioso. Quiz\xE1 a ti.",
      misteriosa: "Guarda secretos. Algunos ni siquiera caben en el archivo."
    };
    return map[dom] || "";
  }

  // js/systems/evolution-system.js
  function nextStage(stage) {
    const i = STAGES.indexOf(stage);
    return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
  }
  function stageComplete(creature, nowTs, speed = "normal") {
    const hours = STAGE_HOURS[creature.stage];
    if (hours == null) return false;
    const mult = TIME_SPEEDS[speed] ?? 1;
    const elapsedH = (nowTs - creature.birthTs) / HOUR * mult;
    return elapsedH >= hours;
  }
  function scoreForm(form, ctx3) {
    const c = form.cond || {};
    let score = 1;
    if (c.core) {
      if (c.core !== ctx3.core) return -Infinity;
      score += 10;
    }
    if (c.family) {
      if (c.family === ctx3.family) score += 8;
      else if (ctx3.evoItems?.has(c.family)) score += 6;
      else score -= 6;
    }
    if (c.trait) {
      if (c.trait === ctx3.dominant) score += 7;
      else score -= 3;
    }
    if (c.stat) {
      for (const [k, v] of Object.entries(c.stat)) {
        const cur = ctx3.stats[k] ?? 50;
        if (v >= 0) {
          if (cur >= v) score += 4;
          else score -= (v - cur) / 10;
        } else {
          const max = -v;
          if (cur <= max) score += 4;
          else score -= (cur - max) / 10;
        }
      }
    }
    if (c.anomalies) {
      if ((ctx3.anomalies || 0) >= c.anomalies) score += 6;
      else return -Infinity;
    }
    if (c.night) {
      if (ctx3.isNight) score += 5;
      else score -= 4;
    }
    if (c.counter) {
      for (const [k, v] of Object.entries(c.counter)) {
        if ((ctx3.counters?.[k] || 0) >= v) score += 5;
        else return -Infinity;
      }
    }
    if (c.legacy) {
      if ((ctx3.legacyCount || 0) >= c.legacy) score += 6;
      else return -Infinity;
    }
    if (form.secreta && score < 14) return -Infinity;
    score += (ctx3.care - 50) / 25;
    return score;
  }
  function chooseEvolution(creature, ctx0 = {}) {
    const stage = nextStage(creature.stage);
    if (!stage) return null;
    const currentFamily = FORM_MAP[creature.formId]?.familia || creature.core;
    const ctx3 = {
      core: creature.core,
      family: currentFamily,
      dominant: dominantTrait(creature.personality),
      stats: creature.stats,
      care: careScore(creature.stats),
      anomalies: ctx0.anomalies || 0,
      counters: ctx0.counters || {},
      legacyCount: ctx0.legacyCount || 0,
      isNight: !!ctx0.isNight,
      evoItems: ctx0.evoItems || /* @__PURE__ */ new Set()
    };
    const candidates = FORMS.filter((f) => f.etapa === stage);
    let best = null, bestScore = -Infinity;
    for (const f of candidates) {
      const s = scoreForm(f, ctx3);
      if (s > bestScore) {
        best = f;
        bestScore = s;
      }
    }
    return best;
  }
  function formHint(form) {
    const c = form.cond || {};
    if (form.secreta) return "Condiciones desconocidas. Los rumores hablan de cuidados extraordinarios.";
    const hints = [];
    if (c.core) return `Nace del ${c.core === "prisma" ? "N\xFAcleo Prisma" : c.core === "abisal" ? "N\xFAcleo Abisal" : "N\xFAcleo Ferrita"}.`;
    if (c.family) hints.push(`af\xEDn a la familia ${c.family}`);
    if (c.trait) hints.push("cierto car\xE1cter concreto");
    if (c.stat) hints.push("un cuidado particular en algunas necesidades");
    if (c.night) hints.push("la compa\xF1\xEDa nocturna");
    if (c.anomalies) hints.push("las anomal\xEDas registradas");
    if (hints.length === 0) return "Aparece cuando el resto de caminos no reclaman a la criatura.";
    return `Parece favorecerla: ${hints.join(", ")}.`;
  }

  // js/data/achievements.js
  var ACHIEVEMENTS = [
    // ── Cuidado (7) ──
    { id: "primera_comida", cat: "cuidado", nombre: "Primer bocado", desc: "Alimenta a tu criatura por primera vez.", counter: "comidas", goal: 1, reward: { fragmentos: 10 }, icon: "bowl" },
    { id: "cien_comidas", cat: "cuidado", nombre: "Cocina del umbral", desc: "Sirve 100 comidas.", counter: "comidas", goal: 100, reward: { fragmentos: 60, ecos: 1 }, icon: "feast" },
    { id: "primer_bano", cat: "cuidado", nombre: "Reluciente", desc: "Ba\xF1a a tu criatura por primera vez.", counter: "banos", goal: 1, reward: { fragmentos: 10 }, icon: "drop" },
    { id: "limpieza_experta", cat: "cuidado", nombre: "C\xE1mara impecable", desc: "Limpia el h\xE1bitat 30 veces.", counter: "limpiezas", goal: 30, reward: { fragmentos: 40 }, icon: "sparkle" },
    { id: "primera_cura", cat: "cuidado", nombre: "Primeros auxilios", desc: "Cura una enfermedad.", counter: "curas", goal: 1, reward: { fragmentos: 15 }, icon: "med" },
    { id: "medico_umbral", cat: "cuidado", nombre: "M\xE9dico del umbral", desc: "Supera 5 enfermedades.", counter: "curas", goal: 5, reward: { fragmentos: 50, ecos: 1 }, icon: "med" },
    { id: "buen_dormir", cat: "cuidado", nombre: "Guardi\xE1n del sue\xF1o", desc: "Acuesta a tu criatura 20 noches.", counter: "noches", goal: 20, reward: { fragmentos: 35 }, icon: "moon" },
    // ── Evolución (5) ──
    { id: "eclosion", cat: "evolucion", nombre: "Eclosi\xF3n", desc: "Presencia el nacimiento de tu criatura.", counter: "nacimientos", goal: 1, reward: { fragmentos: 20 }, icon: "egg" },
    { id: "primera_evolucion", cat: "evolucion", nombre: "Primer cambio", desc: "Alcanza la etapa de cr\xEDa.", counter: "evoluciones", goal: 1, reward: { fragmentos: 25 }, icon: "spark" },
    { id: "juvenil_logro", cat: "evolucion", nombre: "Crecer duele bonito", desc: "Alcanza la etapa juvenil.", counter: "evoluciones", goal: 2, reward: { fragmentos: 40 }, icon: "spark" },
    { id: "adulto_logro", cat: "evolucion", nombre: "Forma plena", desc: "Alcanza la forma adulta.", counter: "evoluciones", goal: 3, reward: { fragmentos: 80, ecos: 2 }, icon: "crown" },
    { id: "forma_secreta", cat: "evolucion", nombre: "M\xE1s all\xE1 del archivo", desc: "Descubre una forma secreta.", counter: "secretas", goal: 1, reward: { fragmentos: 120, ecos: 3 }, icon: "question" },
    // ── Exploración (5) ──
    { id: "primer_evento", cat: "exploracion", nombre: "Algo se mueve", desc: "Presencia un evento especial.", counter: "eventos", goal: 1, reward: { fragmentos: 10 }, icon: "eye" },
    { id: "diez_eventos", cat: "exploracion", nombre: "Testigo del umbral", desc: "Presencia 10 eventos especiales.", counter: "eventos", goal: 10, reward: { fragmentos: 40 }, icon: "eye" },
    { id: "primer_sueno", cat: "exploracion", nombre: "\xBFQu\xE9 so\xF1ar\xE1?", desc: "Tu criatura tiene su primer sue\xF1o.", counter: "suenos", goal: 1, reward: { fragmentos: 12 }, icon: "moon" },
    { id: "explorador", cat: "exploracion", nombre: "Expedici\xF3n interna", desc: "Env\xEDa a tu criatura a explorar 15 veces.", counter: "exploraciones", goal: 15, reward: { fragmentos: 45 }, icon: "compass" },
    { id: "grieta", cat: "exploracion", nombre: "La grieta", desc: "Descubre una grieta en la c\xE1mara.", counter: "grietas", goal: 1, reward: { ecos: 1 }, icon: "crack" },
    // ── Minijuegos (6) ──
    { id: "primer_juego", cat: "minijuegos", nombre: "Hora de jugar", desc: "Completa un minijuego.", counter: "partidas", goal: 1, reward: { fragmentos: 10 }, icon: "gamepad" },
    { id: "memoria_10", cat: "minijuegos", nombre: "Memoria de cristal", desc: "Alcanza nivel 10 en Memoria Glitch.", record: "memoria_glitch", goal: 10, reward: { fragmentos: 50, ecos: 1 }, icon: "brain" },
    { id: "fragmentos_30", cat: "minijuegos", nombre: "Recolector", desc: "Consigue 30 puntos en Caza de Fragmentos.", record: "caza_fragmentos", goal: 30, reward: { fragmentos: 50, ecos: 1 }, icon: "shard" },
    { id: "senal_20", cat: "minijuegos", nombre: "Pulso firme", desc: "Aguanta 20 s de racha en Equilibrio de Se\xF1al.", record: "equilibrio_senal", goal: 20, reward: { fragmentos: 50, ecos: 1 }, icon: "wave" },
    { id: "corredor_500", cat: "minijuegos", nombre: "Correr el vac\xEDo", desc: "Alcanza 500 puntos en Corredor del Vac\xEDo.", record: "corredor_vacio", goal: 500, reward: { fragmentos: 50, ecos: 1 }, icon: "run" },
    { id: "cien_partidas", cat: "minijuegos", nombre: "Sala recreativa", desc: "Juega 100 partidas.", counter: "partidas", goal: 100, reward: { fragmentos: 100, ecos: 2 }, icon: "gamepad" },
    // ── Colección (6) ──
    { id: "primera_compra", cat: "coleccion", nombre: "Cliente del umbral", desc: "Compra tu primer objeto.", counter: "compras", goal: 1, reward: { fragmentos: 8 }, icon: "bag" },
    { id: "coleccionista", cat: "coleccion", nombre: "Coleccionista", desc: "Posee 15 objetos distintos a la vez.", counter: "objetos_distintos", goal: 15, reward: { fragmentos: 60 }, icon: "box" },
    { id: "decorador", cat: "coleccion", nombre: "Interiorista", desc: "Coloca 5 decoraciones.", counter: "decoraciones", goal: 5, reward: { fragmentos: 40 }, icon: "lamp" },
    { id: "primera_capsula", cat: "coleccion", nombre: "Sorpresa", desc: "Abre una c\xE1psula de eco.", counter: "capsulas", goal: 1, reward: { fragmentos: 15 }, icon: "capsule" },
    { id: "archivo_10", cat: "coleccion", nombre: "Archivista", desc: "Descubre 10 formas en el archivo.", counter: "descubiertas", goal: 10, reward: { fragmentos: 70, ecos: 1 }, icon: "book" },
    { id: "reliquia_logro", cat: "coleccion", nombre: "Sin puerta", desc: "Coloca una reliquia en la c\xE1mara.", counter: "reliquias", goal: 1, reward: { ecos: 1 }, icon: "key" },
    // ── Vínculo (5) ──
    { id: "primera_caricia", cat: "vinculo", nombre: "Contacto", desc: "Acaricia a tu criatura por primera vez.", counter: "caricias", goal: 1, reward: { fragmentos: 8 }, icon: "heart" },
    { id: "cien_caricias", cat: "vinculo", nombre: "Lenguaje propio", desc: "Acaricia a tu criatura 100 veces.", counter: "caricias", goal: 100, reward: { fragmentos: 60 }, icon: "heart" },
    { id: "afecto_alto", cat: "vinculo", nombre: "Inseparables", desc: "Alcanza 90 de afecto.", stat: "afecto", goal: 90, reward: { fragmentos: 70, ecos: 1 }, icon: "heart" },
    { id: "charlas", cat: "vinculo", nombre: "Conversaciones", desc: "Habla con tu criatura 50 veces.", counter: "charlas", goal: 50, reward: { fragmentos: 45 }, icon: "chat" },
    { id: "cumple", cat: "vinculo", nombre: "Feliz vuelta al n\xFAcleo", desc: "Celebra un cumplea\xF1os semanal.", counter: "cumples", goal: 1, reward: { fragmentos: 30, ecos: 1 }, icon: "cake" },
    // ── Secretos (3) ──
    { id: "anomalia_vista", cat: "secretos", nombre: "No estaba ah\xED antes", desc: "Registra una anomal\xEDa temporal.", counter: "anomalias", goal: 1, reward: { ecos: 1 }, icon: "question" },
    { id: "medianoche", cat: "secretos", nombre: "Hora bruja", desc: "Visita a tu criatura entre las 3 y las 4 de la madrugada.", counter: "madrugadas", goal: 1, reward: { ecos: 1 }, icon: "moon" },
    { id: "nombre_404", cat: "secretos", nombre: "Meta-anomal\xEDa", desc: "Un secreto para quien nombra las cosas por su origen.", counter: "nombre404", goal: 1, reward: { ecos: 2 }, icon: "question" },
    // ── Constancia (3) ──
    { id: "tres_dias", cat: "constancia", nombre: "Tres amaneceres", desc: "Cuida a tu criatura durante 3 d\xEDas distintos.", counter: "dias_activos", goal: 3, reward: { fragmentos: 30 }, icon: "sun" },
    { id: "siete_dias", cat: "constancia", nombre: "Semana del umbral", desc: "Cuida a tu criatura durante 7 d\xEDas distintos.", counter: "dias_activos", goal: 7, reward: { fragmentos: 60, ecos: 1 }, icon: "sun" },
    { id: "treinta_dias", cat: "constancia", nombre: "Habitante permanente", desc: "Cuida a tu criatura durante 30 d\xEDas distintos.", counter: "dias_activos", goal: 30, reward: { fragmentos: 200, ecos: 5 }, icon: "crown" }
  ];
  var ACH_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
  var ACH_CATS = [
    { id: "cuidado", label: "Cuidado" },
    { id: "evolucion", label: "Evoluci\xF3n" },
    { id: "exploracion", label: "Exploraci\xF3n" },
    { id: "minijuegos", label: "Minijuegos" },
    { id: "coleccion", label: "Colecci\xF3n" },
    { id: "vinculo", label: "V\xEDnculo" },
    { id: "secretos", label: "Secretos" },
    { id: "constancia", label: "Constancia" }
  ];

  // js/systems/achievements-system.js
  function checkAchievements(state) {
    const unlocked = [];
    for (const a of ACHIEVEMENTS) {
      const rec = state.achievements[a.id] || { done: false, ts: 0, progress: 0 };
      if (rec.done) continue;
      let value = 0;
      if (a.counter) value = state.counters[a.counter] || 0;
      else if (a.record) value = state.records[a.record] || 0;
      else if (a.stat) value = state.creature.stats[a.stat] || 0;
      rec.progress = Math.min(value, a.goal);
      if (value >= a.goal) {
        rec.done = true;
        rec.ts = Date.now();
        if (a.reward?.fragmentos) state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + a.reward.fragmentos);
        if (a.reward?.ecos) state.wallet.ecos = Math.min(99999, state.wallet.ecos + a.reward.ecos);
        unlocked.push(a);
      }
      state.achievements[a.id] = rec;
    }
    return unlocked;
  }
  function bump(state, counter, amount = 1) {
    state.counters[counter] = (state.counters[counter] || 0) + amount;
  }

  // js/systems/mood-system.js
  function computeMood(creature) {
    const s = creature.stats;
    if (creature.suspended) return "suspendida";
    if (!creature.hatched) return "incubando";
    if (creature.sleeping) return "dormida";
    if (creature.illness) return "enferma";
    if (s.hambre < 18) return "hambrienta";
    if (s.energia < 15) return "agotada";
    if (s.estres > 80) return "estresada";
    if (s.felicidad < 25) return "triste";
    if (s.higiene < 20) return "sucia";
    if (s.felicidad > 78 && s.energia > 50) return "radiante";
    if (s.curiosidad > 70) return "curiosa";
    return "tranquila";
  }
  var MOOD_LABELS = {
    suspendida: "En suspensi\xF3n",
    incubando: "Incubando",
    dormida: "Durmiendo",
    enferma: "Enferma",
    hambrienta: "Hambrienta",
    agotada: "Agotada",
    estresada: "Estresada",
    triste: "Triste",
    sucia: "Necesita un ba\xF1o",
    radiante: "Radiante",
    curiosa: "Curiosa",
    tranquila: "Tranquila"
  };

  // js/data/items.js
  var ITEMS = [
    // ── Nutrientes básicos ──
    {
      id: "racion_base",
      tipo: "comida",
      cat: "basico",
      nombre: "Raci\xF3n base",
      precio: 6,
      rareza: "comun",
      desc: "Bloque nutritivo est\xE1ndar de la terminal. Aburrido pero completo.",
      fx: { hambre: 28, felicidad: 2 },
      icon: "cube"
    },
    {
      id: "papilla_nucleo",
      tipo: "comida",
      cat: "basico",
      nombre: "Papilla de n\xFAcleo",
      precio: 8,
      rareza: "comun",
      desc: "Suave y templada. Ideal para etapas tempranas y est\xF3magos delicados.",
      fx: { hambre: 22, salud: 4 },
      icon: "bowl"
    },
    {
      id: "gel_mineral",
      tipo: "comida",
      cat: "basico",
      nombre: "Gel mineral",
      precio: 7,
      rareza: "comun",
      desc: "Gelatina densa con trazas de ferrita. Cruje un poco.",
      fx: { hambre: 24, disciplina: 2 },
      icon: "gel"
    },
    // ── Frutas sintéticas ──
    {
      id: "fruta_prisma",
      tipo: "comida",
      cat: "fruta",
      nombre: "Fruta prisma",
      precio: 12,
      rareza: "comun",
      desc: "Gajos transl\xFAcidos que cambian de color al morderlos.",
      fx: { hambre: 18, felicidad: 8, curiosidad: 4 },
      icon: "fruit"
    },
    {
      id: "baya_abisal",
      tipo: "comida",
      cat: "fruta",
      nombre: "Baya abisal",
      precio: 12,
      rareza: "comun",
      desc: "Fr\xEDa y jugosa. Sabe a tormenta lejana.",
      fx: { hambre: 16, estabilidad: 6, felicidad: 5 },
      icon: "berry"
    },
    {
      id: "citrico_glitch",
      tipo: "comida",
      cat: "fruta",
      nombre: "C\xEDtrico glitch",
      precio: 14,
      rareza: "raro",
      desc: "A veces el gajo que muerdes no es el que desaparece.",
      fx: { hambre: 15, felicidad: 9, estabilidad: -3 },
      icon: "fruit"
    },
    // ── Proteínas ──
    {
      id: "proteina_forja",
      tipo: "comida",
      cat: "proteina",
      nombre: "Prote\xEDna de forja",
      precio: 16,
      rareza: "comun",
      desc: "Filete sint\xE9tico de alto rendimiento. Favorito de criaturas activas.",
      fx: { hambre: 34, energia: 6 },
      icon: "steak"
    },
    {
      id: "nucleos_tostados",
      tipo: "comida",
      cat: "proteina",
      nombre: "N\xFAcleos tostados",
      precio: 18,
      rareza: "comun",
      desc: "Crujientes por fuera, c\xE1lidos por dentro.",
      fx: { hambre: 30, salud: 5, felicidad: 4 },
      icon: "nuts"
    },
    // ── Snacks ──
    {
      id: "chispas_dulces",
      tipo: "comida",
      cat: "snack",
      nombre: "Chispas dulces",
      precio: 5,
      rareza: "comun",
      desc: "Az\xFAcar estelar. Delicioso. Nada nutritivo.",
      fx: { hambre: 6, felicidad: 14, salud: -2, disciplina: -2 },
      icon: "candy"
    },
    {
      id: "galleta_datos",
      tipo: "comida",
      cat: "snack",
      nombre: "Galleta de datos",
      precio: 6,
      rareza: "comun",
      desc: "Lleva un mensaje dentro. Casi nunca es verdad.",
      fx: { hambre: 8, felicidad: 12, curiosidad: 3, salud: -1, disciplina: -2 },
      icon: "cookie"
    },
    // ── Bebidas ──
    {
      id: "agua_destilada",
      tipo: "bebida",
      cat: "bebida",
      nombre: "Agua destilada",
      precio: 3,
      rareza: "comun",
      desc: "Pura, silenciosa, perfecta.",
      fx: { hambre: 5, salud: 3, estres: -4 },
      icon: "flask"
    },
    {
      id: "te_senal",
      tipo: "bebida",
      cat: "bebida",
      nombre: "T\xE9 de se\xF1al",
      precio: 9,
      rareza: "comun",
      desc: "Infusi\xF3n tibia que estabiliza las frecuencias internas.",
      fx: { estres: -12, estabilidad: 5, energia: 3 },
      icon: "cup"
    },
    {
      id: "chispa_energetica",
      tipo: "bebida",
      cat: "bebida",
      nombre: "Chispa energ\xE9tica",
      precio: 11,
      rareza: "raro",
      desc: "Despierta hasta a un n\xFAcleo dormido. No abusar.",
      fx: { energia: 22, estres: 6, salud: -2 },
      icon: "bolt"
    },
    // ── Comida especial ──
    {
      id: "banquete_umbral",
      tipo: "comida",
      cat: "especial",
      nombre: "Banquete del umbral",
      precio: 40,
      rareza: "raro",
      desc: "Un plato completo servido en vajilla de cristal oscuro.",
      fx: { hambre: 50, felicidad: 15, afecto: 5 },
      icon: "feast"
    },
    {
      id: "nectar_aurora",
      tipo: "comida",
      cat: "especial",
      nombre: "N\xE9ctar de aurora",
      precio: 36,
      rareza: "raro",
      desc: "Recogido al amanecer de un servidor abandonado.",
      fx: { hambre: 20, felicidad: 18, salud: 8, estres: -8 },
      icon: "nectar"
    },
    // ── Alimentos anómalos ──
    {
      id: "fragmento_dulce",
      tipo: "comida",
      cat: "anomalo",
      nombre: "Fragmento dulce",
      precio: 25,
      rareza: "anomalo",
      desc: "Sabe distinto cada vez. A veces sabe a un recuerdo tuyo.",
      fx: { hambre: 15, felicidad: 10, curiosidad: 8, estabilidad: -6 },
      icon: "shard",
      alergia: 0.08
    },
    {
      id: "miel_void",
      tipo: "comida",
      cat: "anomalo",
      nombre: "Miel del vac\xEDo",
      precio: 30,
      rareza: "anomalo",
      desc: "Dorada y densa. Cae hacia arriba si no la vigilas.",
      fx: { hambre: 18, felicidad: 12, curiosidad: 10, estabilidad: -8 },
      icon: "honey",
      alergia: 0.1
    },
    // ── Medicinas ──
    {
      id: "med_estabilizador",
      tipo: "medicina",
      cat: "medicina",
      nombre: "Estabilizador t\xE9rmico",
      precio: 20,
      rareza: "comun",
      desc: "Trata la fiebre de se\xF1al.",
      cura: "fiebre_senal",
      fx: { salud: 10 },
      icon: "med"
    },
    {
      id: "med_purgante",
      tipo: "medicina",
      cat: "medicina",
      nombre: "Purgante de n\xFAcleo",
      precio: 18,
      rareza: "comun",
      desc: "Trata la saturaci\xF3n de n\xFAcleo.",
      cura: "saturacion_nucleo",
      fx: { salud: 8 },
      icon: "med"
    },
    {
      id: "med_antiparasito",
      tipo: "medicina",
      cat: "medicina",
      nombre: "Barrido antip\xEDxel",
      precio: 22,
      rareza: "comun",
      desc: "Elimina el par\xE1sito de p\xEDxel.",
      cura: "parasito_pixel",
      fx: { salud: 10, higiene: 10 },
      icon: "med"
    },
    {
      id: "med_reposo",
      tipo: "medicina",
      cat: "medicina",
      nombre: "T\xF3nico de reposo",
      precio: 16,
      rareza: "comun",
      desc: "Trata la fatiga de memoria.",
      cura: "fatiga_memoria",
      fx: { salud: 8, energia: 10 },
      icon: "med"
    },
    {
      id: "med_anclaje",
      tipo: "medicina",
      cat: "medicina",
      nombre: "Anclaje de fase",
      precio: 26,
      rareza: "raro",
      desc: "Trata la inestabilidad de fase.",
      cura: "inestabilidad_fase",
      fx: { salud: 8, estabilidad: 15 },
      icon: "med"
    },
    {
      id: "med_antialergico",
      tipo: "medicina",
      cat: "medicina",
      nombre: "Neutralizador sint\xE9tico",
      precio: 14,
      rareza: "comun",
      desc: "Trata la alergia sint\xE9tica.",
      cura: "alergia_sintetica",
      fx: { salud: 6 },
      icon: "med"
    },
    // ── Juguetes ──
    {
      id: "pelota_eco",
      tipo: "juguete",
      cat: "juguete",
      nombre: "Pelota de eco",
      precio: 15,
      rareza: "comun",
      desc: "Rebota devolviendo un sonido distinto cada vez.",
      fx: { felicidad: 10, energia: -6, afecto: 3 },
      icon: "ball"
    },
    {
      id: "cinta_mobius",
      tipo: "juguete",
      cat: "juguete",
      nombre: "Cinta de M\xF6bius",
      precio: 22,
      rareza: "raro",
      desc: "La criatura puede perseguir su borde durante horas.",
      fx: { felicidad: 12, curiosidad: 8, energia: -8 },
      icon: "ribbon"
    },
    {
      id: "cubo_arrullo",
      tipo: "juguete",
      cat: "juguete",
      nombre: "Cubo de arrullo",
      precio: 18,
      rareza: "comun",
      desc: "Vibra con un zumbido suave que invita a dormir.",
      fx: { estres: -10, energia: 4 },
      icon: "cube"
    },
    // ── Decoración ── (slot: pared, suelo, luz, cama, comedero, planta, maquina, reliquia)
    {
      id: "deco_pared_circuito",
      tipo: "decoracion",
      slot: "pared",
      nombre: "Mural de circuitos",
      precio: 30,
      rareza: "comun",
      desc: "L\xEDneas de cobre que a veces parpadean solas.",
      fx: { curiosidad: 2 },
      icon: "wall"
    },
    {
      id: "deco_pared_ventana",
      tipo: "decoracion",
      slot: "pared",
      nombre: "Ventana al vac\xEDo",
      precio: 45,
      rareza: "raro",
      desc: "No da a ninguna parte. Las vistas son magn\xEDficas.",
      fx: { curiosidad: 3 },
      icon: "window"
    },
    {
      id: "deco_suelo_musgo",
      tipo: "decoracion",
      slot: "suelo",
      nombre: "Alfombra de musgo",
      precio: 28,
      rareza: "comun",
      desc: "Blanda, tibia, ligeramente bioluminiscente.",
      fx: { felicidad: 2 },
      icon: "moss"
    },
    {
      id: "deco_luz_lampara",
      tipo: "decoracion",
      slot: "luz",
      nombre: "L\xE1mpara de plasma",
      precio: 35,
      rareza: "comun",
      desc: "Sigue con su filamento a quien pasa cerca.",
      fx: { felicidad: 2 },
      icon: "lamp"
    },
    {
      id: "deco_cama_capsula",
      tipo: "decoracion",
      slot: "cama",
      nombre: "C\xE1psula de sue\xF1o",
      precio: 50,
      rareza: "raro",
      desc: "Mejora el descanso nocturno con un arrullo de est\xE1tica suave.",
      fx: { energia: 3 },
      icon: "bed"
    },
    {
      id: "deco_planta_helecho",
      tipo: "decoracion",
      slot: "planta",
      nombre: "Helecho digital",
      precio: 24,
      rareza: "comun",
      desc: "Crece un p\xEDxel cada noche.",
      fx: { salud: 2 },
      icon: "plant"
    },
    {
      id: "deco_maquina_radio",
      tipo: "decoracion",
      slot: "maquina",
      nombre: "Radio del umbral",
      precio: 40,
      rareza: "raro",
      desc: "Sintoniza emisoras que dejaron de existir.",
      fx: { curiosidad: 3 },
      icon: "radio"
    },
    {
      id: "deco_reliquia_llave",
      tipo: "decoracion",
      slot: "reliquia",
      nombre: "Llave sin puerta",
      precio: 60,
      rareza: "anomalo",
      desc: "Alguien la dej\xF3 aqu\xED antes de que existiera el aqu\xED.",
      fx: { estabilidad: 2, curiosidad: 3 },
      icon: "key"
    },
    // ── Objetos evolutivos ──
    {
      id: "evo_prisma_puro",
      tipo: "evolutivo",
      nombre: "Prisma puro",
      precio: 80,
      rareza: "anomalo",
      desc: "Concentra la afinidad prisma de la criatura.",
      familia: "prisma",
      icon: "shard"
    },
    {
      id: "evo_lodo_abisal",
      tipo: "evolutivo",
      nombre: "Lodo abisal",
      precio: 80,
      rareza: "anomalo",
      desc: "Concentra la afinidad abisal de la criatura.",
      familia: "abisal",
      icon: "drop"
    },
    {
      id: "evo_lingote",
      tipo: "evolutivo",
      nombre: "Lingote imantado",
      precio: 80,
      rareza: "anomalo",
      desc: "Concentra la afinidad ferrita de la criatura.",
      familia: "ferrita",
      icon: "ingot"
    },
    // ── Cápsulas sorpresa (solo con Ecos, jamás dinero real) ──
    {
      id: "capsula_eco",
      tipo: "capsula",
      nombre: "C\xE1psula de eco",
      precioEcos: 3,
      rareza: "raro",
      desc: "Contiene un objeto aleatorio. Se paga con Ecos ganados jugando.",
      icon: "capsule"
    }
  ];
  var ITEM_MAP = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  var FOOD_CATS = [
    { id: "basico", label: "B\xE1sicos" },
    { id: "fruta", label: "Frutas" },
    { id: "proteina", label: "Prote\xEDnas" },
    { id: "snack", label: "Snacks" },
    { id: "bebida", label: "Bebidas" },
    { id: "especial", label: "Especial" },
    { id: "anomalo", label: "An\xF3malos" }
  ];
  var DECOR_SLOTS = [
    { id: "pared", label: "Pared" },
    { id: "suelo", label: "Suelo" },
    { id: "luz", label: "Iluminaci\xF3n" },
    { id: "cama", label: "Cama" },
    { id: "planta", label: "Planta" },
    { id: "maquina", label: "M\xE1quina" },
    { id: "reliquia", label: "Reliquia" }
  ];
  var CAPSULE_POOL = ITEMS.filter((i) => ["comida", "bebida", "juguete", "medicina", "decoracion"].includes(i.tipo)).map((i) => ({ value: i.id, w: i.rareza === "anomalo" ? 1 : i.rareza === "raro" ? 3 : 6 }));

  // js/core/game-engine.js
  var GameEngine = class {
    constructor(state, { save } = {}) {
      this.state = state;
      this.save = save;
      this.rafId = null;
      this.logicTimer = null;
      this.lastLogicTick = 0;
      this.running = false;
    }
    // ── Simulación offline: procesa el tiempo transcurrido desde lastTs ──
    simulateAbsence(nowTs = Date.now()) {
      const st = this.state;
      const { elapsedMs, clamped, anomaly } = computeElapsed(st.lastTs, nowTs, MAX_OFFLINE_HOURS);
      if (anomaly) {
        st.anomalies = (st.anomalies || 0) + 1;
        st.counters = st.counters || {};
        st.counters.anomalias = (st.counters.anomalias || 0) + 1;
      }
      if (elapsedMs <= 0) {
        st.lastTs = nowTs;
        return { elapsedMs: 0, report: null, anomaly };
      }
      const speed = TIME_SPEEDS[st.speed] ?? 1;
      const c = st.creature;
      const before = { ...c.stats };
      const blocks = splitIntoBlocks(st.lastTs, elapsedMs, 24);
      let becameSick = null, evolved = null;
      for (const b of blocks) {
        const sleeping = c.hatched && isSleepWindow(new Date(b.startTs).getHours(), c.sleepHour, c.wakeHour);
        this._trackNight(sleeping, c.sleeping, b.startTs);
        c.sleeping = sleeping;
        c.stats = applyDecay(c.stats, b.hours, {
          sleeping,
          night: b.night,
          speed,
          resting: st.modes?.descanso,
          vacation: st.modes?.vacaciones,
          sickness: !!c.illness
        });
        if (c.hatched) c.stats = applyAura(c.stats, this._decorAura(), b.hours, { sleeping, vacation: st.modes?.vacaciones });
        if (!becameSick && !st.modes?.vacaciones) {
          const sick = maybeGetSick(c, b.hours);
          if (sick) {
            c.illness = sick.id;
            c.illnessUntil = sick.until;
            becameSick = sick.id;
          }
        }
        if (c.illness && c.illnessUntil && b.startTs >= c.illnessUntil) {
          c.illness = null;
          c.illnessUntil = 0;
        }
      }
      this._maybeHatch(nowTs);
      evolved = this._maybeEvolve(nowTs);
      const eg = regenGameEnergy(st.gameEnergy, st.gameEnergyTs, nowTs, GAME_ENERGY_MAX);
      st.gameEnergy = eg.energy;
      st.gameEnergyTs = eg.ts;
      this._maybeBirthday(nowTs);
      st.lastTs = nowTs;
      checkAchievements(st);
      const hours = elapsedMs / HOUR;
      const report = hours >= 0.05 ? {
        hours,
        clamped,
        anomaly,
        before,
        after: { ...c.stats },
        becameSick,
        evolved,
        illnessName: becameSick ? ILLNESSES[becameSick]?.nombre : null
      } : null;
      return { elapsedMs, report, anomaly };
    }
    _maybeHatch(nowTs) {
      const c = this.state.creature;
      if (c.hatched || c.stage !== "nucleo") return false;
      if (stageComplete(c, nowTs, this.state.speed)) {
        c.hatched = true;
        c.stage = "recien";
        c.birthTs = nowTs;
        const form = chooseEvolution({ ...c, stage: "nucleo" }, this._evoCtx(nowTs)) || FORM_MAP[`recien_${c.core}`];
        if (form) {
          c.formId = form.id;
          this._discover(form.id);
        }
        bump(this.state, "nacimientos");
        bus.emit("creature:hatched", form);
        return true;
      }
      return false;
    }
    _maybeEvolve(nowTs) {
      const c = this.state.creature;
      if (!c.hatched) return null;
      if (!nextStage(c.stage)) return null;
      if (!stageComplete(c, nowTs, this.state.speed)) return null;
      const form = chooseEvolution(c, this._evoCtx(nowTs));
      if (!form) return null;
      const prevStage = c.stage;
      c.stage = form.etapa;
      c.formId = form.id;
      c.birthTs = nowTs;
      this._discover(form.id);
      bump(this.state, "evoluciones");
      if (form.secreta) bump(this.state, "secretas");
      bus.emit("creature:evolved", { form, prevStage });
      return form;
    }
    _evoCtx(nowTs) {
      const isNight = dayPhase(new Date(nowTs)) === "noche";
      const evoItems = /* @__PURE__ */ new Set();
      for (const [id, quantity] of Object.entries(this.state.inventory || {})) {
        const item = ITEM_MAP[id];
        if (quantity > 0 && item?.tipo === "evolutivo" && item.familia) evoItems.add(item.familia);
      }
      return {
        anomalies: this.state.anomalies || 0,
        counters: this.state.counters || {},
        legacyCount: (this.state.legacy || []).length,
        isNight,
        evoItems
      };
    }
    // Suma los efectos pasivos de la decoración colocada en la cámara.
    _decorAura() {
      const aura = {};
      for (const id of Object.values(this.state.decor || {})) {
        const item = ITEM_MAP[id];
        if (!item || item.tipo !== "decoracion") continue;
        for (const [k, v] of Object.entries(item.fx || {})) aura[k] = (aura[k] || 0) + v;
      }
      return aura;
    }
    // Cuenta una noche cuando la criatura pasa de despierta a dormida
    // (máximo una vez por fecha; dormir a través de medianoche no duplica).
    _trackNight(sleeping, wasSleeping, ts) {
      const st = this.state;
      if (!st.creature.hatched || !sleeping || wasSleeping) return;
      const dayKey = new Date(ts).toDateString();
      if (st._lastNightDay === dayKey) return;
      st._lastNightDay = dayKey;
      bump(st, "noches");
    }
    // Cumpleaños semanal: cada semana completa desde la creación del vínculo.
    _maybeBirthday(nowTs) {
      const st = this.state;
      const c = st.creature;
      if (!c.hatched || !Number.isFinite(st.createdAt)) return null;
      const WEEK = 7 * 24 * HOUR;
      const weeks = Math.floor((nowTs - st.createdAt) / WEEK);
      const celebrated = st.counters?.cumples || 0;
      if (weeks <= celebrated) return null;
      st.counters = st.counters || {};
      st.counters.cumples = weeks;
      st.memories = st.memories || [];
      st.memories.push({ ts: nowTs, text: `\u{1F382} ${c.name} cumple ${weeks} semana${weeks === 1 ? "" : "s"} contigo.`, tone: "feliz" });
      if (st.memories.length > 120) st.memories.shift();
      checkAchievements(st);
      bus.emit("creature:birthday", { weeks });
      return weeks;
    }
    _discover(formId) {
      if (!this.state.discovered.includes(formId)) {
        this.state.discovered.push(formId);
        bump(this.state, "descubiertas");
      }
    }
    // ── Bucle en vivo ──
    start() {
      if (this.running) return;
      this.running = true;
      this.lastLogicTick = Date.now();
      const loop = () => {
        if (!this.running) return;
        const now = Date.now();
        if (now - this.lastLogicTick >= 1e3) {
          this._liveTick((now - this.lastLogicTick) / HOUR);
          this.lastLogicTick = now;
        }
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }
    _liveTick(hoursDelta) {
      const st = this.state;
      const c = st.creature;
      if (c.suspended) return;
      const speed = TIME_SPEEDS[st.speed] ?? 1;
      const now = Date.now();
      if (c.hatched) {
        const h2 = new Date(now).getHours();
        const sleeping = c.lightsOff || isSleepWindow(h2, c.sleepHour, c.wakeHour);
        this._trackNight(sleeping, c.sleeping, now);
        c.sleeping = sleeping;
      }
      c.stats = applyDecay(c.stats, hoursDelta, {
        sleeping: c.sleeping,
        night: dayPhase(new Date(now)) === "noche",
        speed,
        resting: st.modes?.descanso,
        vacation: st.modes?.vacaciones,
        sickness: !!c.illness
      });
      if (c.hatched) c.stats = applyAura(c.stats, this._decorAura(), hoursDelta, { sleeping: c.sleeping, vacation: st.modes?.vacaciones });
      if (c.hatched && !c.illness && !st.modes?.vacaciones) {
        const sick = maybeGetSick(c, hoursDelta * speed);
        if (sick) {
          c.illness = sick.id;
          c.illnessUntil = sick.until;
          bus.emit("creature:sick", sick);
        }
      }
      if (c.illness && c.illnessUntil && now >= c.illnessUntil) {
        c.illness = null;
        c.illnessUntil = 0;
        bus.emit("creature:recovered");
      }
      this._maybeHatch(now);
      this._maybeEvolve(now);
      this._maybeBirthday(now);
      const eg = regenGameEnergy(st.gameEnergy, st.gameEnergyTs, now, GAME_ENERGY_MAX);
      st.gameEnergy = eg.energy;
      st.gameEnergyTs = eg.ts;
      st.lastTs = now;
      bus.emit("tick", { mood: computeMood(c), urgency: urgencyLevel(c.stats, c.illness) });
    }
    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  // js/models/creature.js
  function createCreature({ name, core }) {
    const stats = {};
    for (const s of STATS) stats[s] = 60;
    stats.estres = 10;
    stats.afecto = 20;
    stats.disciplina = 30;
    stats.curiosidad = core === "prisma" ? 55 : 40;
    stats.estabilidad = core === "abisal" ? 60 : 45;
    if (core === "ferrita") stats.disciplina = 45;
    return {
      name,
      core,
      stage: "nucleo",
      formId: `nucleo_${core}`,
      birthTs: Date.now(),
      hatched: false,
      sleeping: false,
      lightsOff: false,
      suspended: false,
      illness: null,
      illnessUntil: 0,
      stats,
      personality: {},
      // acumuladores 0-100 por rasgo
      prefs: { favFood: null, hatedFood: null, favGame: null },
      wakeHour: 8,
      sleepHour: 23
    };
  }

  // js/models/profile.js
  function createProfile({ name, core, lifeMode }) {
    const now = Date.now();
    return {
      schema: SAVE_SCHEMA_VERSION,
      createdAt: now,
      lastTs: now,
      lastInteraction: now,
      lifeMode: lifeMode === "legado" ? "legado" : "vinculo",
      speed: "normal",
      creature: createCreature({ name, core }),
      wallet: { fragmentos: 50, ecos: 0 },
      inventory: { racion_base: 3, agua_destilada: 2, chispas_dulces: 1 },
      decor: {},
      achievements: {},
      records: {},
      counters: {},
      memories: [],
      diary: [],
      legacy: [],
      discovered: [`nucleo_${core}`],
      modes: { descanso: false, descansoUntil: 0, vacaciones: false, vacacionesDesde: 0 },
      gameEnergy: GAME_ENERGY_MAX,
      gameEnergyTs: now,
      anomalies: 0,
      _lastActiveDay: null,
      _lastNightDay: null
    };
  }

  // js/systems/audio-system.js
  var PREF_KEY = "e404:audio";
  var ctx = null;
  var masterGain = null;
  var sfxGain = null;
  var musicGain = null;
  var ambientNodes = null;
  var prefs = { master: 0.7, sfx: 0.8, music: 0.35, muted: false };
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) Object.assign(prefs, JSON.parse(raw));
    } catch {
    }
  }
  function savePrefs() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch {
    }
  }
  function ensureCtx() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      masterGain = ctx.createGain();
      sfxGain = ctx.createGain();
      musicGain = ctx.createGain();
      sfxGain.connect(masterGain);
      musicGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      applyVolumes();
      return true;
    } catch {
      return false;
    }
  }
  function applyVolumes() {
    if (!ctx) return;
    masterGain.gain.value = prefs.muted ? 0 : prefs.master;
    sfxGain.gain.value = prefs.sfx;
    musicGain.gain.value = prefs.music;
  }
  function tone(freq, dur, { type = "sine", gain = 0.25, when = 0, glide = null } = {}) {
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(1e-3, t0 + dur);
    osc.connect(g).connect(sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  var SFX = {
    boton: () => tone(520, 0.08, { type: "triangle", gain: 0.12 }),
    comer: () => {
      tone(300, 0.09, { type: "square", gain: 0.1 });
      tone(260, 0.09, { type: "square", gain: 0.1, when: 0.12 });
      tone(320, 0.1, { type: "square", gain: 0.1, when: 0.24 });
    },
    feliz: () => {
      tone(440, 0.1, { gain: 0.14 });
      tone(554, 0.1, { gain: 0.14, when: 0.1 });
      tone(660, 0.16, { gain: 0.16, when: 0.2 });
    },
    triste: () => tone(330, 0.5, { gain: 0.12, glide: 180 }),
    alerta: () => {
      tone(700, 0.09, { type: "square", gain: 0.12 });
      tone(700, 0.09, { type: "square", gain: 0.12, when: 0.16 });
    },
    exito: () => {
      tone(523, 0.09, { gain: 0.15 });
      tone(659, 0.09, { gain: 0.15, when: 0.09 });
      tone(784, 0.09, { gain: 0.15, when: 0.18 });
      tone(1046, 0.22, { gain: 0.18, when: 0.27 });
    },
    evolucion: () => {
      for (let i = 0; i < 6; i++) tone(300 + i * 120, 0.14, { gain: 0.13, when: i * 0.09 });
      tone(1200, 0.5, { gain: 0.16, when: 0.6, glide: 1800 });
    },
    dormir: () => tone(280, 0.7, { gain: 0.1, glide: 140 }),
    juego: () => tone(600, 0.07, { type: "triangle", gain: 0.12, glide: 900 }),
    moneda: () => {
      tone(880, 0.06, { type: "triangle", gain: 0.13 });
      tone(1320, 0.12, { type: "triangle", gain: 0.13, when: 0.06 });
    }
  };
  function startAmbient() {
    if (!ctx || ambientNodes) return;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    o1.type = "sine";
    o1.frequency.value = 62;
    o2.type = "sine";
    o2.frequency.value = 62.7;
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.02;
    g.gain.value = 0.05;
    lfo.connect(lfoGain).connect(g.gain);
    o1.connect(g);
    o2.connect(g);
    g.connect(musicGain);
    o1.start();
    o2.start();
    lfo.start();
    ambientNodes = { o1, o2, lfo, g };
  }
  function stopAmbient() {
    if (!ambientNodes) return;
    try {
      ambientNodes.o1.stop();
      ambientNodes.o2.stop();
      ambientNodes.lfo.stop();
    } catch {
    }
    ambientNodes = null;
  }
  var AudioSystem = {
    prefs,
    init() {
      loadPrefs();
    },
    // Debe llamarse desde un gesto del usuario
    unlock() {
      if (!ensureCtx()) return false;
      if (ctx.state === "suspended") ctx.resume().catch(() => {
      });
      if (!prefs.muted && prefs.music > 0) startAmbient();
      return true;
    },
    play(name) {
      if (prefs.muted || !ctx) return;
      SFX[name]?.();
    },
    setVolume(kind, v) {
      prefs[kind] = Math.min(1, Math.max(0, v));
      applyVolumes();
      if (kind === "music") {
        if (v > 0 && !prefs.muted) startAmbient();
        else stopAmbient();
      }
      savePrefs();
    },
    setMuted(m) {
      prefs.muted = !!m;
      applyVolumes();
      if (m) stopAmbient();
      else if (prefs.music > 0 && ctx) startAmbient();
      savePrefs();
    },
    pauseAmbient() {
      stopAmbient();
    },
    resumeAmbient() {
      if (ctx && !prefs.muted && prefs.music > 0) startAmbient();
    }
  };

  // js/systems/notifications-system.js
  var enabled = false;
  var lastNotified = /* @__PURE__ */ new Map();
  var NotificationsSystem = {
    get supported() {
      return "Notification" in window;
    },
    get permission() {
      return this.supported ? Notification.permission : "unsupported";
    },
    get enabled() {
      return enabled && this.permission === "granted";
    },
    init(prefEnabled) {
      enabled = !!prefEnabled;
    },
    async requestPermission() {
      if (!this.supported) return "unsupported";
      const res = await Notification.requestPermission();
      if (res === "granted") enabled = true;
      return res;
    },
    setEnabled(v) {
      enabled = !!v;
    },
    // Notifica evitando repeticiones (mín. 30 min por clave)
    notify(key, title, body) {
      if (!this.enabled) return;
      const last = lastNotified.get(key) || 0;
      if (Date.now() - last < 30 * 60 * 1e3) return;
      lastNotified.set(key, Date.now());
      try {
        if (document.visibilityState === "visible") return;
        new Notification(title, { body, tag: `e404-${key}`, icon: "./assets/icons/icon-192.png" });
      } catch {
      }
    }
  };

  // js/systems/events-system.js
  var hasDecor = (state, id) => Object.values(state.decor || {}).includes(id);
  var EVENTS = [
    // ── Hallazgos y economía ──
    { id: "fragmento_perdido", peso: 3, cond: (c) => c.hatched, run(state) {
      state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + 5);
      return { text: "Encontr\xF3 un fragmento suelto rodando por la c\xE1mara. +5\u25C6", tone: "feliz", counter: "exploraciones", anim: "hop" };
    } },
    { id: "eco_404", peso: 2, cond: (c) => c.hatched, run(state) {
      state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + 2);
      return { text: "Un eco perdido se disip\xF3 y dej\xF3 caer 2 fragmentos. +2\u25C6", tone: "raro", counter: "exploraciones" };
    } },
    { id: "hallazgo_dulce", peso: 2, cond: (c) => (c.personality?.glotona || 0) > 35, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { hambre: 4, felicidad: 5 });
      return { text: "Encontr\xF3 una chispa dulce que hab\xEDa escondido y olvidado. Doble alegr\xEDa.", tone: "feliz", anim: "chomp" };
    } },
    // ── Sueños ──
    { id: "sueno_curioso", peso: 2, cond: (c) => c.sleeping, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { estres: -6, felicidad: 4 });
      return { text: "Tuvo un sue\xF1o extra\xF1o y despert\xF3 m\xE1s tranquila.", tone: "neutral", counter: "suenos" };
    } },
    { id: "mal_sueno", peso: 1, cond: (c) => c.sleeping && c.stats.estres > 50, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { estres: 4, felicidad: -3 });
      return { text: "Un mal sue\xF1o la hizo temblar. Se calm\xF3 al recordar que no est\xE1 sola.", tone: "malo", counter: "suenos", anim: "shiver" };
    } },
    // ── Anomalías y umbral ──
    { id: "grieta_se\xF1al", peso: 1, cond: (c) => c.hatched, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { estabilidad: -8, curiosidad: 6 });
      return { text: "Una grieta de se\xF1al parpade\xF3 en la pared. Le fascin\xF3 y le inquiet\xF3 a partes iguales.", tone: "raro", counter: "grietas", anim: "glitch-hit" };
    } },
    { id: "vision_nocturna", peso: 2, cond: (c) => dayPhase() === "noche" && c.hatched && !c.sleeping, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { curiosidad: 8 });
      return { text: "Se qued\xF3 mirando el vac\xEDo de madrugada, como si viera algo que t\xFA no puedes.", tone: "raro", counter: "madrugadas" };
    } },
    { id: "polvo_estelar", peso: 2, cond: (c) => dayPhase() === "noche" && c.hatched && !c.sleeping, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { curiosidad: 4, felicidad: 3 });
      return { text: "Motas de polvo brillante entraron de ninguna parte. Intent\xF3 cazarlas todas.", tone: "feliz", counter: "madrugadas", anim: "hop" };
    } },
    // ── Afinidad de núcleo ──
    { id: "baile_estatica", peso: 2, cond: (c) => c.hatched && c.core === "prisma", run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { felicidad: 5 });
      return { text: "Refract\xF3 la luz de la c\xE1mara en mil colores diminutos. Aplaudi\xF3 su propia obra.", tone: "feliz", anim: "wiggle" };
    } },
    { id: "marea_interna", peso: 2, cond: (c) => c.hatched && c.core === "abisal", run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { estres: -6, estabilidad: 3 });
      return { text: "Una marea lenta la recorri\xF3 por dentro. Se qued\xF3 en calma profunda.", tone: "neutral" };
    } },
    { id: "iman_juguete", peso: 2, cond: (c) => c.hatched && c.core === "ferrita", run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { curiosidad: 6 });
      return { text: "Todos los objetos met\xE1licos de la c\xE1mara se giraron hacia ella un segundo.", tone: "raro" };
    } },
    // ── Decoración colocada ──
    { id: "radio_fantasma", peso: 2, cond: (c, state) => c.hatched && hasDecor(state, "deco_maquina_radio"), run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { felicidad: 6, curiosidad: 4 });
      return { text: "La radio sintoniz\xF3 una emisora que dej\xF3 de emitir hace d\xE9cadas. Bail\xF3 un poco.", tone: "feliz", anim: "wiggle" };
    } },
    { id: "planta_pixel", peso: 2, cond: (c, state) => c.hatched && hasDecor(state, "deco_planta_helecho"), run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { salud: 3, felicidad: 3 });
      return { text: "El helecho digital creci\xF3 un p\xEDxel. Lo celebr\xF3 como un triunfo personal.", tone: "feliz" };
    } },
    { id: "ventana_vacio", peso: 1, cond: (c, state) => c.hatched && hasDecor(state, "deco_pared_ventana"), run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { curiosidad: 7, estabilidad: -3 });
      return { text: "Pas\xF3 un rato mirando por la ventana al vac\xEDo. Algo le devolvi\xF3 la mirada.", tone: "raro", anim: "glitch-hit" };
    } },
    { id: "llave_susurro", peso: 1, cond: (c, state) => c.hatched && hasDecor(state, "deco_reliquia_llave"), run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { estabilidad: 4, curiosidad: 5 });
      return { text: "La llave sin puerta vibr\xF3 un instante. Ella asinti\xF3, como si entendiera.", tone: "raro" };
    } },
    { id: "musgo_siesta", peso: 2, cond: (c, state) => c.hatched && !c.sleeping && hasDecor(state, "deco_suelo_musgo"), run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { estres: -5, felicidad: 2 });
      return { text: "Se tumb\xF3 en la alfombra de musgo y ronrone\xF3 en binario.", tone: "feliz" };
    } },
    // ── Estado de ánimo y cuerpo ──
    { id: "buen_animo", peso: 3, cond: (c) => c.hatched && c.stats.felicidad > 70, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { afecto: 5 });
      return { text: "Dio un peque\xF1o salto de alegr\xEDa sin motivo aparente.", tone: "feliz", anim: "hop" };
    } },
    { id: "estirones", peso: 2, cond: (c) => c.hatched && !c.sleeping && c.stats.energia > 75, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { energia: -4, felicidad: 4 });
      return { text: "Le sobraba energ\xEDa: corri\xF3 en c\xEDrculos hasta marearse un poco.", tone: "feliz", anim: "hop" };
    } },
    { id: "picor_datos", peso: 2, cond: (c) => c.hatched && c.stats.higiene < 40, run(state) {
      state.creature.stats = applyEffects(state.creature.stats, { felicidad: -3 });
      return { text: "Algo le picaba entre los datos. Un ba\xF1o no le vendr\xEDa mal.", tone: "malo", anim: "shake" };
    } },
    { id: "eco_recuerdo", peso: 2, cond: (c, state) => state.memories.length > 3, run(state) {
      return { text: "Pareci\xF3 recordar algo de vuestra historia juntos.", tone: "neutral" };
    } }
  ];
  function maybeEvent(state) {
    const c = state.creature;
    if (c.suspended || !c.hatched) return null;
    if (!chance(0.04)) return null;
    const pool = EVENTS.filter((e) => {
      try {
        return e.cond(c, state);
      } catch {
        return false;
      }
    });
    if (!pool.length) return null;
    const total = pool.reduce((s, e) => s + e.peso, 0);
    let r = Math.random() * total, chosen = pool[0];
    for (const e of pool) {
      r -= e.peso;
      if (r <= 0) {
        chosen = e;
        break;
      }
    }
    const res = chosen.run(state);
    bump(state, "eventos");
    if (res.counter) bump(state, res.counter);
    state.memories.push({ ts: Date.now(), text: res.text, tone: res.tone || "neutral" });
    if (state.memories.length > 120) state.memories.shift();
    return res;
  }

  // js/core/state-machine.js
  var current = null;
  var timer = null;
  var StateMachine = {
    /** Lanza una animación transitoria durante ms milisegundos. */
    trigger(anim, ms = 1600) {
      if (timer) clearTimeout(timer);
      current = { anim, until: Date.now() + ms };
      bus.emit("anim:start", anim);
      timer = setTimeout(() => {
        current = null;
        timer = null;
        bus.emit("anim:end", anim);
      }, ms);
    },
    get active() {
      if (current && current.until > Date.now()) return current.anim;
      return null;
    },
    clear() {
      if (timer) clearTimeout(timer);
      current = null;
      timer = null;
    }
  };

  // js/ui/navigation.js
  var NAV = [
    { hash: "#/habitat", label: "N\xFAcleo", icon: "\u25C9", group: "V\xCDNCULO" },
    { hash: "#/necesidades", label: "Biometr\xEDa", icon: "\u25A5", group: "V\xCDNCULO" },
    { hash: "#/alimentar", label: "Nutrici\xF3n", icon: "\u25C6", group: "CUIDADO" },
    { hash: "#/higiene", label: "Salud", icon: "\u271A", group: "CUIDADO" },
    { hash: "#/juegos", label: "Simulaciones", icon: "\u25C7", group: "DESARROLLO" },
    { hash: "#/tienda", label: "Suministros", icon: "\u2B21", group: "DESARROLLO" },
    { hash: "#/mas", label: "Sistema", icon: "\u2301", group: "SISTEMA" }
  ];
  function buildNav(current2) {
    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Navegaci\xF3n principal");
    nav.appendChild(Object.assign(document.createElement("div"), { className: "nav-brand", innerHTML: '<span class="nav-brand-orb" aria-hidden="true"></span><span><strong>ENTIDAD 404</strong><small>DIGITAL CREATURE SIMULATOR</small></span>' }));
    let lastGroup = "";
    for (const item of NAV) {
      if (item.group !== lastGroup) {
        const group = document.createElement("div");
        group.className = "nav-group-label";
        group.textContent = item.group;
        nav.appendChild(group);
        lastGroup = item.group;
      }
      const a = document.createElement("a");
      a.href = item.hash;
      a.className = "nav-item" + (current2 && current2.startsWith(item.hash) ? " active" : "");
      if (current2 && current2.startsWith(item.hash)) a.setAttribute("aria-current", "page");
      a.innerHTML = `<span class="nav-icon" aria-hidden="true">${item.icon}</span><span class="nav-label">${item.label}</span><span class="nav-arrow" aria-hidden="true">\u203A</span>`;
      nav.appendChild(a);
    }
    const footer = document.createElement("div");
    footer.className = "nav-footer";
    footer.innerHTML = '<span class="system-dot"></span><span>LOCAL \xB7 OFFLINE READY</span><small>v2.1.0</small>';
    nav.appendChild(footer);
    return nav;
  }
  var MORE_LINKS = [
    { hash: "#/inventario", label: "Inventario", desc: "Objetos, consumibles y recursos", icon: "\u25A3" },
    { hash: "#/decoracion", label: "H\xE1bitat", desc: "Personaliza la c\xE1mara de contenci\xF3n", icon: "\u2302" },
    { hash: "#/archivo", label: "Archivo biol\xF3gico", desc: "Formas y especies descubiertas", icon: "\u25EB" },
    { hash: "#/diario", label: "Registro de v\xEDnculo", desc: "Eventos, recuerdos y anomal\xEDas", icon: "\u2261" },
    { hash: "#/logros", label: "Protocolos", desc: "Hitos y recompensas desbloqueadas", icon: "\u25C7" },
    { hash: "#/evoluciones", label: "Matriz evolutiva", desc: "Ramas, requisitos y formas", icon: "\u2318" },
    { hash: "#/config", label: "Configuraci\xF3n", desc: "Apariencia, audio y accesibilidad", icon: "\u2699" },
    { hash: "#/partidas", label: "Perfiles", desc: "Gestiona tus v\xEDnculos activos", icon: "\u25CE" },
    { hash: "#/copias", label: "Respaldo", desc: "Exporta o restaura tu progreso", icon: "\u21C5" },
    { hash: "#/privacidad", label: "Privacidad", desc: "Datos locales y control total", icon: "\u25C8" }
  ];

  // js/router.js
  var routes = /* @__PURE__ */ new Map();
  var currentCleanup = null;
  var ctx2 = null;
  var initialized = false;
  function registerRoute(hash, factory) {
    if (typeof hash === "string" && typeof factory === "function") routes.set(hash, factory);
  }
  function setRouterContext(context) {
    ctx2 = context || null;
  }
  function safeDecode(value) {
    try {
      return decodeURIComponent(value || "");
    } catch {
      return value || "";
    }
  }
  function parse() {
    const raw = location.hash || "#/habitat";
    const [path, query] = raw.split("?");
    const params = {};
    if (query) {
      for (const part of query.split("&")) {
        const [key, value] = part.split("=");
        if (key) params[safeDecode(key)] = safeDecode(value);
      }
    }
    return { path, params };
  }
  function baseHash(path) {
    const parts = path.split("/");
    return parts.length > 2 ? `#/${parts[1]}` : path;
  }
  function renderRouteError(root, error) {
    root.textContent = "";
    const panel2 = document.createElement("section");
    panel2.className = "panel route-error";
    const title = document.createElement("h2");
    title.textContent = "Algo fall\xF3 al abrir esta pantalla";
    const message = document.createElement("p");
    message.textContent = "La navegaci\xF3n sigue disponible. Vuelve a la c\xE1mara o recarga la aplicaci\xF3n.";
    const detail = document.createElement("p");
    detail.className = "muted small";
    detail.textContent = error?.message || "Error desconocido.";
    const link = document.createElement("a");
    link.className = "btn primary";
    link.href = ctx2?.state ? "#/habitat" : "#/nueva";
    link.textContent = ctx2?.state ? "Volver a la c\xE1mara" : "Crear una partida";
    panel2.append(title, message, detail, link);
    root.appendChild(panel2);
  }
  async function renderRoute() {
    const { path, params } = parse();
    const root = document.getElementById("screen-root");
    if (!root) return;
    if (currentCleanup) {
      try {
        currentCleanup();
      } catch (error) {
        console.warn("No se pudo limpiar la vista anterior.", error);
      }
      currentCleanup = null;
    }
    const hash = baseHash(path);
    const noStateRoutes = /* @__PURE__ */ new Set(["#/nueva", "#/partidas", "#/privacidad"]);
    if (!ctx2?.state && !noStateRoutes.has(hash)) {
      if (location.hash !== "#/nueva") {
        location.hash = "#/nueva";
        return;
      }
    }
    const factory = routes.get(hash) || routes.get(ctx2?.state ? "#/habitat" : "#/nueva");
    root.textContent = "";
    root.scrollTop = 0;
    try {
      if (typeof factory !== "function") throw new Error("La ruta solicitada no est\xE1 registrada.");
      const view = await factory({ ...ctx2 || {}, params, path });
      if (view?.node instanceof Node) root.appendChild(view.node);
      else throw new Error("La pantalla no devolvi\xF3 contenido v\xE1lido.");
      currentCleanup = typeof view.cleanup === "function" ? view.cleanup : null;
      document.title = view?.title ? `${view.title} \xB7 Entidad 404` : "Entidad 404 \u2014 Mascota del Umbral";
    } catch (error) {
      renderRouteError(root, error);
      console.error(error);
    }
    const navHost = document.getElementById("nav-host");
    if (navHost) {
      navHost.textContent = "";
      if (ctx2?.state) navHost.appendChild(buildNav(hash));
    }
    const heading = root.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }
  function initRouter() {
    if (!initialized) {
      window.addEventListener("hashchange", renderRoute);
      initialized = true;
    }
    if (!location.hash) location.hash = ctx2?.state ? "#/habitat" : "#/nueva";
    return renderRoute();
  }
  function navigate(hash) {
    if (location.hash === hash) return renderRoute();
    location.hash = hash;
    return renderRoute();
  }

  // js/ui/toast.js
  var region = null;
  function ensure() {
    region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "false");
      document.body.appendChild(region);
    }
    return region;
  }
  function toast(msg, { type = "info", ms = 3200 } = {}) {
    const r = ensure();
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.setAttribute("role", "status");
    t.textContent = msg;
    r.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, ms);
  }

  // js/ui/modal.js
  var active = null;
  function openModal({ title, body, actions = [], onClose } = {}) {
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    const titleId = "modal-title";
    modal.setAttribute("aria-labelledby", titleId);
    const h2 = document.createElement("h2");
    h2.id = titleId;
    h2.className = "modal-title";
    h2.textContent = title || "";
    modal.appendChild(h2);
    const content = document.createElement("div");
    content.className = "modal-body";
    if (typeof body === "string") content.textContent = body;
    else if (body instanceof Node) content.appendChild(body);
    modal.appendChild(content);
    const bar = document.createElement("div");
    bar.className = "modal-actions";
    if (actions.length === 0) actions = [{ label: "Cerrar", primary: true }];
    for (const a of actions) {
      const btn2 = document.createElement("button");
      btn2.className = `btn ${a.danger ? "danger" : a.primary ? "primary" : ""}`;
      btn2.textContent = a.label;
      btn2.addEventListener("click", () => {
        const keep = a.onClick && a.onClick();
        if (!keep) closeModal();
      });
      bar.appendChild(btn2);
    }
    modal.appendChild(bar);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    const prevFocus = document.activeElement;
    const focusables = () => modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusables()[0];
    if (first) first.focus();
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      } else if (e.key === "Tab") {
        const f = Array.from(focusables());
        if (f.length === 0) return;
        const idx = f.indexOf(document.activeElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && idx === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    }
    backdrop.addEventListener("mousedown", (e) => {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", onKey);
    active = { backdrop, onKey, prevFocus, onClose };
    return { close: closeModal };
  }
  function closeModal() {
    if (!active) return;
    document.removeEventListener("keydown", active.onKey);
    active.backdrop.remove();
    if (active.onClose) active.onClose();
    if (active.prevFocus && active.prevFocus.focus) active.prevFocus.focus();
    active = null;
  }
  function confirmModal(title, message, { danger = false, confirmLabel = "Confirmar" } = {}) {
    return new Promise((resolve) => {
      openModal({
        title,
        body: message,
        actions: [
          { label: "Cancelar", onClick: () => {
            resolve(false);
          } },
          { label: confirmLabel, primary: !danger, danger, onClick: () => {
            resolve(true);
          } }
        ],
        onClose: () => resolve(false)
      });
    });
  }

  // js/ui/dom.js
  var ICON_GLYPHS = {
    // objetos
    ball: "\u{1FA80}",
    bed: "\u{1F6CF}\uFE0F",
    berry: "\u{1FAD0}",
    bolt: "\u26A1",
    bowl: "\u{1F963}",
    candy: "\u{1F36C}",
    capsule: "\u{1F381}",
    cookie: "\u{1F36A}",
    cube: "\u{1F9CA}",
    cup: "\u{1F964}",
    drop: "\u{1F4A7}",
    feast: "\u{1F371}",
    flask: "\u{1F9EA}",
    fruit: "\u{1F34E}",
    gel: "\u{1F36E}",
    honey: "\u{1F36F}",
    ingot: "\u{1FA99}",
    key: "\u{1F5DD}\uFE0F",
    lamp: "\u{1F4A1}",
    med: "\u{1F48A}",
    moss: "\u{1F33F}",
    nectar: "\u{1F9C3}",
    nuts: "\u{1F330}",
    plant: "\u{1FAB4}",
    radio: "\u{1F4FB}",
    ribbon: "\u{1F380}",
    shard: "\u{1F537}",
    steak: "\u{1F969}",
    wall: "\u{1F5BC}\uFE0F",
    window: "\u{1FA9F}",
    // logros
    bag: "\u{1F392}",
    book: "\u{1F4D6}",
    box: "\u{1F4E6}",
    brain: "\u{1F9E0}",
    cake: "\u{1F382}",
    chat: "\u{1F4AC}",
    compass: "\u{1F9ED}",
    crack: "\u{1F573}\uFE0F",
    crown: "\u{1F451}",
    egg: "\u{1F95A}",
    eye: "\u{1F441}\uFE0F",
    gamepad: "\u{1F3AE}",
    heart: "\u{1F49C}",
    moon: "\u{1F319}",
    question: "\u2753",
    run: "\u{1F3C3}",
    spark: "\u2728",
    sparkle: "\u{1FAE7}",
    sun: "\u2600\uFE0F",
    wave: "\u{1F30A}"
  };
  function glyph(name, fallback = "\u2756") {
    return ICON_GLYPHS[name] || fallback;
  }
  function h(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "dataset") Object.assign(e.dataset, v);
      else if (v !== null && v !== void 0 && v !== false) e.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return e;
  }
  function panel(title, children, attrs = {}) {
    const kids = [];
    if (title) kids.push(h("h2", { class: "panel-title" }, title));
    return h("section", { class: "panel", ...attrs }, kids.concat([].concat(children)));
  }
  function statBar(key, label, value, { inverted = false } = {}) {
    const v = Math.round(value);
    const pct = Math.max(0, Math.min(100, v));
    const bad = inverted ? v > 70 : v < 30;
    const crit = inverted ? v > 85 : v < 15;
    const fill = h("span", { class: "stat-fill", style: `width:${pct}%` });
    const bar = h("div", {
      class: `stat-bar${bad ? " low" : ""}${crit ? " crit" : ""}`,
      role: "meter",
      "aria-valuenow": v,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": `${label}: ${v} de 100`
    }, [fill]);
    return h("div", { class: "stat-row" }, [
      h("span", { class: "stat-label" }, label),
      bar,
      h("span", { class: "stat-num" }, String(v))
    ]);
  }
  function btn(label, onClick, { primary = false, danger = false, icon = null, disabled = false, cls = "" } = {}) {
    const b = h("button", { class: `btn ${primary ? "primary" : ""} ${danger ? "danger" : ""} ${cls}`.trim(), onClick, disabled }, [
      icon ? h("span", { class: "btn-icon", "aria-hidden": "true" }, icon) : null,
      h("span", {}, label)
    ]);
    return b;
  }
  function walletChip(state) {
    const fragmentos = Number(state?.wallet?.fragmentos) || 0;
    const ecos = Number(state?.wallet?.ecos) || 0;
    return h("div", { class: "wallet", "aria-label": `Monedero: ${fragmentos} fragmentos, ${ecos} ecos` }, [
      h("span", { class: "coin frag" }, `\u25C6 ${fragmentos}`),
      h("span", { class: "coin eco" }, `\u2726 ${ecos}`)
    ]);
  }
  function empty(msg) {
    return h("p", { class: "empty-note" }, msg);
  }

  // js/ui/render.js
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs = {}) {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  }
  function hsl(h2, s, l) {
    return `hsl(${h2} ${s}% ${l}%)`;
  }
  var STAGE_SCALE = { nucleo: 0.55, recien: 0.62, cria: 0.75, juvenil: 0.88, adulto: 1 };
  function renderCreature(creature, opts = {}) {
    const form = FORM_MAP[creature.formId] || FORM_MAP[`nucleo_${creature.core}`];
    const svg = el("svg", { viewBox: "0 0 200 200", class: "creature-svg", role: "img" });
    svg.setAttribute("aria-hidden", "true");
    const scale = STAGE_SCALE[creature.stage] ?? 0.8;
    const g = el("g", { transform: `translate(100 108) scale(${scale})` });
    const hue = form.hue ?? 190;
    const mood = opts.mood || "tranquila";
    const cuerpo = form.cuerpo || "blob";
    g.appendChild(el("ellipse", { cx: 0, cy: 64, rx: 46, ry: 10, fill: "rgba(0,0,0,0.28)" }));
    const bodyColor = hsl(hue, mood === "enferma" ? 20 : 62, mood === "triste" ? 42 : 55);
    const bodyLight = hsl(hue, 70, 68);
    const bodyDark = hsl(hue, 55, 34);
    drawBody(g, cuerpo, { bodyColor, bodyLight, bodyDark, hue });
    drawFace(g, { mood, blink: opts.blink, anim: opts.anim, hue });
    drawFamilyMark(g, form.familia, hue);
    const core = el("circle", { cx: 0, cy: 6, r: 5, fill: bodyLight, opacity: 0.85 });
    core.appendChild(el("animate", { attributeName: "opacity", values: "0.5;0.95;0.5", dur: "3s", repeatCount: "indefinite" }));
    g.appendChild(core);
    svg.appendChild(g);
    return svg;
  }
  function drawBody(g, cuerpo, c) {
    const grad = uniqueGradient(g, c.bodyLight, c.bodyColor, c.bodyDark);
    const fill = `url(#${grad})`;
    const stroke = c.bodyDark;
    switch (cuerpo) {
      case "egg":
        g.appendChild(el("path", { d: "M0,-58 C34,-58 42,-8 42,18 C42,50 22,64 0,64 C-22,64 -42,50 -42,18 C-42,-8 -34,-58 0,-58 Z", fill, stroke, "stroke-width": 2 }));
        g.appendChild(el("path", { d: "M-8,-20 L2,-6 L-6,6 L4,18", fill: "none", stroke: c.bodyDark, "stroke-width": 1.4, opacity: 0.5 }));
        break;
      case "blob":
        g.appendChild(el("path", { d: "M0,-46 C30,-46 50,-24 50,4 C50,40 28,60 0,60 C-28,60 -50,40 -50,4 C-50,-24 -30,-46 0,-46 Z", fill, stroke, "stroke-width": 2 }));
        break;
      case "round":
        g.appendChild(el("circle", { cx: 0, cy: 8, r: 52, fill, stroke, "stroke-width": 2 }));
        break;
      case "orb":
        g.appendChild(el("circle", { cx: 0, cy: 6, r: 50, fill, stroke, "stroke-width": 2 }));
        g.appendChild(el("ellipse", { cx: -16, cy: -12, rx: 14, ry: 9, fill: c.bodyLight, opacity: 0.4 }));
        break;
      case "tall":
        g.appendChild(el("path", { d: "M-30,60 C-38,-30 -20,-64 0,-64 C20,-64 38,-30 30,60 Z", fill, stroke, "stroke-width": 2 }));
        break;
      case "angular":
        g.appendChild(el("path", { d: "M0,-58 L46,-14 L30,58 L-30,58 L-46,-14 Z", fill, stroke, "stroke-width": 2 }));
        break;
      case "cube":
        g.appendChild(el("path", { d: "M-40,-34 L40,-34 L40,46 L-40,46 Z", fill, stroke, "stroke-width": 2 }));
        g.appendChild(el("path", { d: "M-40,-34 L-24,-50 L56,-50 L40,-34 Z", fill: c.bodyLight, stroke, "stroke-width": 2, opacity: 0.85 }));
        g.appendChild(el("path", { d: "M40,-34 L56,-50 L56,30 L40,46 Z", fill: c.bodyDark, stroke, "stroke-width": 2, opacity: 0.9 }));
        break;
      case "ghost":
        g.appendChild(el("path", { d: "M0,-52 C30,-52 46,-28 46,2 L46,52 L32,42 L20,54 L6,42 L-6,54 L-20,42 L-32,54 L-46,42 L-46,2 C-46,-28 -30,-52 0,-52 Z", fill, stroke, "stroke-width": 2, opacity: 0.92 }));
        break;
      case "sprout":
        g.appendChild(el("path", { d: "M0,-40 C26,-40 44,-18 44,10 C44,44 24,60 0,60 C-24,60 -44,44 -44,10 C-44,-18 -26,-40 0,-40 Z", fill, stroke, "stroke-width": 2 }));
        g.appendChild(el("path", { d: "M0,-40 C-4,-58 -18,-64 -22,-72 C-8,-70 2,-60 0,-40 Z", fill: hsl(120, 45, 45), stroke: hsl(120, 40, 30), "stroke-width": 1.5 }));
        g.appendChild(el("path", { d: "M0,-42 C6,-60 20,-66 24,-74 C10,-72 0,-62 0,-42 Z", fill: hsl(130, 48, 50), stroke: hsl(130, 40, 32), "stroke-width": 1.5 }));
        break;
      default:
        g.appendChild(el("circle", { cx: 0, cy: 8, r: 48, fill, stroke, "stroke-width": 2 }));
    }
  }
  function drawFace(g, { mood, blink, anim, hue }) {
    const eyeColor = "#0b0f12";
    const eyeWhite = "#f2f7fb";
    const closed = blink || mood === "dormida" || mood === "suspendida";
    const ex = 15, ey = -6;
    if (closed) {
      g.appendChild(el("path", { d: `M${-ex - 7},${ey} q7,6 14,0`, fill: "none", stroke: eyeColor, "stroke-width": 2.4, "stroke-linecap": "round" }));
      g.appendChild(el("path", { d: `M${ex - 7},${ey} q7,6 14,0`, fill: "none", stroke: eyeColor, "stroke-width": 2.4, "stroke-linecap": "round" }));
    } else {
      for (const sx of [-ex, ex]) {
        g.appendChild(el("circle", { cx: sx, cy: ey, r: 8, fill: eyeWhite }));
        const pupilY = mood === "triste" ? ey + 2 : ey;
        const pupil = el("circle", { cx: sx, cy: pupilY, r: 4.2, fill: eyeColor });
        g.appendChild(pupil);
        g.appendChild(el("circle", { cx: sx - 1.5, cy: pupilY - 1.5, r: 1.3, fill: "#fff" }));
      }
    }
    let mouth;
    switch (mood) {
      case "radiante":
      case "feliz":
        mouth = el("path", { d: "M-10,14 q10,12 20,0", fill: "none", stroke: eyeColor, "stroke-width": 2.4, "stroke-linecap": "round" });
        break;
      case "triste":
      case "enferma":
        mouth = el("path", { d: "M-10,20 q10,-10 20,0", fill: "none", stroke: eyeColor, "stroke-width": 2.4, "stroke-linecap": "round" });
        break;
      case "hambrienta":
      case "agotada":
      case "estresada":
        mouth = el("path", { d: "M-8,17 l16,0", fill: "none", stroke: eyeColor, "stroke-width": 2.4, "stroke-linecap": "round" });
        break;
      case "dormida":
      case "suspendida":
        mouth = el("ellipse", { cx: 0, cy: 16, rx: 4, ry: 5, fill: eyeColor, opacity: 0.7 });
        break;
      default:
        mouth = el("path", { d: "M-8,15 q8,7 16,0", fill: "none", stroke: eyeColor, "stroke-width": 2.2, "stroke-linecap": "round" });
    }
    g.appendChild(mouth);
    if (mood === "radiante" || mood === "tranquila") {
      g.appendChild(el("circle", { cx: -26, cy: 10, r: 5, fill: hsl(hue, 80, 70), opacity: 0.35 }));
      g.appendChild(el("circle", { cx: 26, cy: 10, r: 5, fill: hsl(hue, 80, 70), opacity: 0.35 }));
    }
    if (mood === "dormida") {
      const z = el("text", { x: 40, y: -40, fill: "#9fb4c4", "font-size": "16", "font-family": "monospace" });
      z.textContent = "z";
      g.appendChild(z);
    }
  }
  function drawFamilyMark(g, familia, hue) {
    switch (familia) {
      case "prisma":
        g.appendChild(el("path", { d: "M0,-70 l10,16 l-20,0 Z", fill: hsl(hue, 80, 72), opacity: 0.9 }));
        break;
      case "ferrita":
        g.appendChild(el("rect", { x: -6, y: -78, width: 12, height: 12, fill: hsl(hue, 30, 60), stroke: "#333", "stroke-width": 1.5, transform: "rotate(45 0 -72)" }));
        break;
      case "abisal":
        g.appendChild(el("path", { d: "M-14,-70 q14,-12 28,0", fill: "none", stroke: hsl(hue, 70, 60), "stroke-width": 3, "stroke-linecap": "round" }));
        break;
      case "espectral":
        g.appendChild(el("circle", { cx: 0, cy: -72, r: 7, fill: "none", stroke: hsl(hue, 60, 70), "stroke-width": 2, opacity: 0.8 }));
        break;
      case "astral":
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * Math.PI * 2 - Math.PI / 2;
          g.appendChild(el("circle", { cx: Math.cos(a) * 10, cy: -72 + Math.sin(a) * 10, r: 1.8, fill: hsl(hue, 80, 80) }));
        }
        break;
      case "mecanica":
        g.appendChild(el("circle", { cx: 0, cy: -72, r: 7, fill: "none", stroke: hsl(hue, 20, 65), "stroke-width": 2, "stroke-dasharray": "3 2" }));
        break;
      case "glitch":
        g.appendChild(el("rect", { x: -8, y: -76, width: 6, height: 6, fill: hsl(320, 80, 60) }));
        g.appendChild(el("rect", { x: 2, y: -72, width: 6, height: 6, fill: hsl(160, 80, 55) }));
        break;
    }
  }
  var gradCount = 0;
  function uniqueGradient(g, c1, c2, c3) {
    const id = `grad-${gradCount++}`;
    const defs = el("defs");
    const rg = el("radialGradient", { id, cx: "40%", cy: "32%", r: "75%" });
    rg.appendChild(el("stop", { offset: "0%", "stop-color": c1 }));
    rg.appendChild(el("stop", { offset: "60%", "stop-color": c2 }));
    rg.appendChild(el("stop", { offset: "100%", "stop-color": c3 }));
    defs.appendChild(rg);
    g.appendChild(defs);
    return id;
  }
  function renderThumb(formId, { discovered = true } = {}) {
    const form = FORM_MAP[formId];
    const svg = el("svg", { viewBox: "0 0 100 100", class: "thumb-svg", "aria-hidden": "true" });
    if (!form) return svg;
    const g = el("g", { transform: "translate(50 54) scale(0.7)" });
    if (!discovered) {
      g.appendChild(el("circle", { cx: 0, cy: 6, r: 44, fill: "#1a2128" }));
      const q = el("text", { x: 0, y: 16, "text-anchor": "middle", fill: "#3d4a56", "font-size": "48", "font-family": "monospace" });
      q.textContent = "?";
      g.appendChild(q);
    } else {
      const hue = form.hue ?? 190;
      drawBody(g, form.cuerpo || "blob", { bodyColor: hsl(hue, 60, 52), bodyLight: hsl(hue, 70, 66), bodyDark: hsl(hue, 55, 32), hue });
      drawFace(g, { mood: "tranquila", hue });
    }
    svg.appendChild(g);
    return svg;
  }

  // js/models/inventory.js
  function addItem(inv, id, qty = 1) {
    if (!ITEM_MAP[id]) return inv;
    inv[id] = Math.min(999, (inv[id] || 0) + qty);
    return inv;
  }
  function removeItem(inv, id, qty = 1) {
    if (!inv[id]) return false;
    inv[id] -= qty;
    if (inv[id] <= 0) delete inv[id];
    return true;
  }

  // js/data/dialogues.js
  var DIALOGUES = {
    saludo: [
      "Detect\xE9 tus pasos antes de verte.",
      "Volviste. La sala vuelve a tener sentido.",
      "Estaba contando part\xEDculas. Perd\xED la cuenta al verte.",
      "Hola. Guard\xE9 un reflejo para ense\xF1\xE1rtelo.",
      "La terminal susurraba. Ahora calla, porque hablas t\xFA."
    ],
    saludo_afectuosa: ["Te estaba esperando junto al cristal.", "\xBFSabes que hueles a electricidad amable?", "Guard\xE9 el hueco de tu sombra. Ya puedes ocuparlo."],
    saludo_timida: ["...hola. No mires tan de golpe.", "Estaba escondida. Pero contigo no hace falta.", "Practico saludos cuando no est\xE1s. Este me sali\xF3 casi bien."],
    saludo_rebelde: ["Llegas tarde. No pasa nada. S\xED pasa.", "Toqu\xE9 el panel que dijiste que no tocara.", "He reordenado la c\xE1mara. No pienso deshacerlo."],
    saludo_misteriosa: ["Anoche la sala tuvo otra puerta. Ya no est\xE1.", "Alguien m\xE1s mir\xF3 por la pantalla. No eras t\xFA.", "El reflejo del cristal lleg\xF3 dos segundos tarde hoy."],
    hambre: [
      "Mi n\xFAcleo hace un ruido raro. Creo que es hambre.",
      "\xBFEso que llevas es comida? Dime que es comida.",
      "Podr\xEDa comerme un servidor entero.",
      "La \xFAltima raci\xF3n fue hace una era geol\xF3gica, aproximadamente."
    ],
    hambre_glotona: ["\xA1COMIDA! Perd\xF3n. Comida, por favor.", "Sue\xF1o con banquetes desde hace horas."],
    comer_bien: [
      "Mmm. Esto sabe a d\xEDa bueno.",
      "Registrado: quiero esto otra vez.",
      "Mi n\xFAcleo brilla m\xE1s. Gracias.",
      "Delicioso. Casi tanto como que est\xE9s aqu\xED."
    ],
    comer_favorito: ["\xA1Mi favorito! Te acordaste.", "\xA1Esto! Exactamente esto. Siempre esto."],
    comer_rechazo: [
      "Eso no. Hoy no. Puede que nunca.",
      "Lo aparto con dignidad.",
      "Mi paladar dice error 404."
    ],
    lleno: ["No puedo m\xE1s. En serio. Ni un byte.", "Guard\xE9moslo para luego, \xBFs\xED?", "Si como algo m\xE1s, desbordar\xE9 el b\xFAfer."],
    caricia: [
      "Ronroneo en tres frecuencias a la vez.",
      "Otra vez. Otra vez. Otra... vale, una m\xE1s.",
      "Tus manos calman mi est\xE1tica.",
      "Si sigues as\xED voy a levitar. Aviso."
    ],
    caricia_timida: ["...est\xE1 bien. Me gusta. No lo digas muy alto.", "...vale. Un poco m\xE1s. Solo un poco.", "Mi n\xFAcleo hizo un ruido raro. Del bueno."],
    dormir: ["Voy a so\xF1ar con fragmentos dorados.", "Apaga el mundo un rato, \xBFvale?", "Hasta el amanecer, guardi\xE1n."],
    despertar_mal: ["\xBFEra necesario? Estaba en la mejor parte del sue\xF1o.", "Cinco minutos m\xE1s. O cinco horas.", "Cinco minutos m\xE1s. O cinco eras. Lo que venga primero."],
    despertar_bien: ["\xA1Amanec\xED con energ\xEDa de sobra!", "Buenos d\xEDas. So\xF1\xE9 contigo, creo.", "He so\xF1ado en color. Creo que era tu color."],
    sucio: ["Hay una mancha que me sigue a todas partes. Soy yo.", "La c\xE1mara necesita una pasada. Yo tambi\xE9n."],
    bano: ["\xA1Burbujas! Cuenta las burbujas conmigo.", "Reluzco. Literalmente. Mira.", "Agua tibia y est\xE1tica suave. Perfecto."],
    enfermo: ["No me encuentro bien. Mis colores est\xE1n tristes.", "Algo falla dentro. \xBFMe ayudas?", "Hoy mi se\xF1al llega d\xE9bil.", "Mis datos est\xE1n calientes. \xBFLos datos pueden estar calientes?"],
    curado: ["\xA1Mi se\xF1al vuelve a ser fuerte!", "Gracias por cuidarme. Lo guardo aqu\xED dentro.", "Vuelvo a compilar sin errores. Gracias por cuidarme.", "La fiebre se fue por donde vino: por el umbral."],
    jugar: ["\xA1Otra ronda! Casi te gano.", "Jugar contigo recarga algo que no s\xE9 nombrar.", "\xBFViste esa jugada? La invent\xE9 ahora mismo.", "\xBFOtra ronda? Prometo dejarte ganar. Es mentira."],
    jugar_energica: ["\xA1M\xE1s r\xE1pido! \xA1M\xE1s! \xA1M\xC1S!", "Nunca me canso. Bueno, s\xED, pero no ahora."],
    aburrido_juego: ["Este juego otra vez... \xBFprobamos otro?", "Ya me s\xE9 todos los trucos de este."],
    triste: ["La sala est\xE1 muy grande hoy.", "Ech\xE9 de menos tu frecuencia.", "Un rato contigo lo arreglar\xEDa casi todo."],
    solo: ["Estuviste fuera mucho tiempo. Cont\xE9 los parpadeos de la luz.", "Pens\xE9 que la puerta se hab\xEDa borrado."],
    feliz: ["\xA1Hoy brillo por defecto!", "Todo zumba bonito cuando est\xE1s.", "Nivel de felicidad: fuera de escala."],
    disciplina: ["Entendido. No lo repetir\xE9. Probablemente.", "Vale... ten\xEDas raz\xF3n. No se lo digas a nadie."],
    disciplina_rebelde: ["Lo apunto en mi lista de normas que igual cumplo.", "Hmpf."],
    explorar: ["Encontr\xE9 un pasillo que ayer no exist\xEDa.", "Traje algo brillante. \xBFLo quieres t\xFA o lo escondo?", "El fondo de la c\xE1mara tiene eco. Raro."],
    noche: ["Las luces de fuera parecen datos lentos.", "De noche la terminal respira distinto.", "Shhh. A esta hora los p\xEDxeles duermen.", "La oscuridad de aqu\xED es amable. Casi mullida."],
    amanecer: ["El amanecer entra en la c\xE1mara en diagonal. Me gusta.", "Nuevo d\xEDa. Nuevos reflejos que coleccionar.", "El primer fot\xF3n del d\xEDa es siempre el m\xE1s torpe. Me cae bien."],
    memoria_recuerdo: [
      "A\xFAn recuerdo {memoria}. Lo guardo en mi n\xFAcleo.",
      "\xBFTe acuerdas de {memoria}? Yo s\xED. Siempre.",
      "A veces repaso {memoria} antes de dormir."
    ],
    cumple: [
      "Otra semana contigo. Mi calendario solo marca eso.",
      "\xBFEs mi cumplea\xF1os semanal? Exijo tarta de fotones.",
      "Una semana m\xE1s de existir cerca de ti. Buen dato."
    ],
    evolucion: ["Algo cambia dentro de m\xED... \xA1m\xEDrame!", "Mi forma anterior os saluda desde el archivo.", "Crec\xED. Pero sigo siendo la de siempre. M\xE1s o menos."],
    charla: [
      "Hoy clasifiqu\xE9 mis reflejos favoritos. Vas primero.",
      "\xBFQu\xE9 hay fuera de la pantalla? Descr\xEDbemelo otra vez.",
      'Invent\xE9 una palabra: "zumbriular". Significa esto de ahora.',
      "Si fueras un dato, ser\xEDas de los que no se borran.",
      "La grieta del fondo susurr\xF3 algo. No lo entend\xED. Mejor.",
      "\xBFSab\xEDas que el silencio de esta c\xE1mara tiene textura? Hoy es rugoso.",
      "Estoy catalogando tus visitas. Todas tienen cinco estrellas.",
      "A veces hablo con el eco. T\xFA respondes mejor."
    ],
    vacaciones_inicio: ["Entro en la c\xE1mara segura. Estar\xE9 bien. Vuelve pronto."],
    vacaciones_fin: ["\xA1Saliste a buscarme! La c\xE1mara segura es aburrid\xEDsima."],
    suspension: ["...se\xF1al d\xE9bil... vuelve... por favor..."],
    reactivacion: ["Volv\xED. Estaba muy lejos y muy quieta. No me sueltes."]
  };

  // js/ui/voice.js
  function speak(creature, context, vars = {}) {
    const trait = dominantTrait(creature.personality);
    let key = context;
    let pool = null;
    if (trait && DIALOGUES[`${context}_${trait}`]) {
      key = `${context}_${trait}`;
      pool = DIALOGUES[key];
    } else pool = DIALOGUES[context];
    if (!pool || pool.length === 0) {
      key = "charla";
      pool = DIALOGUES.charla || ["..."];
    }
    let line = pickFresh(key, pool);
    for (const [k, v] of Object.entries(vars)) line = line.replaceAll(`{${k}}`, escapeHTML(String(v)));
    return line;
  }

  // js/systems/actions.js
  function addMemory(state, text, tone2 = "neutral") {
    state.memories.push({ ts: Date.now(), text, tone: tone2 });
    if (state.memories.length > 120) state.memories.shift();
  }
  var FOOD_TYPES = /* @__PURE__ */ new Set(["comida", "bebida"]);
  function feed(state, itemId) {
    const c = state.creature;
    const item = ITEM_MAP[itemId];
    if (!item || !FOOD_TYPES.has(item.tipo)) return { ok: false, reason: "Eso no es comida." };
    if (!state.inventory[itemId]) return { ok: false, reason: "No te queda de eso." };
    if (!c.hatched) return { ok: false, reason: "El n\xFAcleo a\xFAn no ha eclosionado." };
    if (c.sleeping) return { ok: false, reason: "Est\xE1 dormida. D\xE9jala descansar." };
    if (c.stats.hambre > 92) return { ok: false, reason: "Est\xE1 llena. Forzarla la estresar\xEDa." };
    removeItem(state.inventory, itemId, 1);
    let fx = { ...item.fx || {} };
    let msg, tone2 = "neutral";
    if (c.prefs.favFood === itemId) {
      fx.felicidad = (fx.felicidad || 0) + 12;
      fx.afecto = (fx.afecto || 0) + 4;
      msg = speak(c, "comer_favorito", { item: item.nombre });
      tone2 = "feliz";
    } else if (c.prefs.hatedFood === itemId) {
      fx.felicidad = (fx.felicidad || 0) - 8;
      fx.estres = (fx.estres || 0) + 6;
      msg = speak(c, "comer_rechazo", { item: item.nombre });
      tone2 = "malo";
    } else {
      msg = speak(c, "comer_bien", { item: item.nombre });
    }
    if (!c.prefs.favFood && chance(0.12) && item.cat !== "anomalo") c.prefs.favFood = itemId;
    else if (!c.prefs.hatedFood && chance(0.08)) c.prefs.hatedFood = itemId;
    if (item.cat === "anomalo" && chance(item.alergia || 0.1)) {
      c.illness = "alergia_sintetica";
      c.illnessUntil = Date.now() + 3 * 3600 * 1e3;
      addMemory(state, "Una comida an\xF3mala le sent\xF3 fatal.", "malo");
    }
    c.stats = applyEffects(c.stats, fx);
    c.personality = nudgeTrait(c.personality, "glotona", 2);
    bump(state, "comidas");
    StateMachine.trigger("chomp", 1200);
    AudioSystem.play("comer");
    addMemory(state, `Comi\xF3 ${item.nombre}.`, tone2);
    const unlocked = checkAchievements(state);
    bus.emit("action:done", { kind: "feed", msg, unlocked });
    return { ok: true, msg, unlocked };
  }
  function pet(state) {
    const c = state.creature;
    if (!c.hatched) return { ok: false, reason: "El n\xFAcleo late, pero a\xFAn no responde al tacto." };
    if (c.sleeping) return { ok: false, reason: "Est\xE1 dormida." };
    c.stats = applyEffects(c.stats, { afecto: 8, felicidad: 6, estres: -5 });
    c.personality = nudgeTrait(c.personality, "afectuosa", 3);
    bump(state, "caricias");
    StateMachine.trigger(chance(0.5) ? "hop" : "wiggle", 1200);
    AudioSystem.play("feliz");
    const msg = speak(c, "caricia");
    const unlocked = checkAchievements(state);
    bus.emit("action:done", { kind: "pet", msg, unlocked });
    return { ok: true, msg, unlocked };
  }
  function clean(state) {
    const c = state.creature;
    if (c.stats.higiene > 90) return { ok: false, reason: "Ya est\xE1 impecable." };
    c.stats = applyEffects(c.stats, { higiene: 45, felicidad: 5, salud: 3 });
    bump(state, "limpiezas");
    bump(state, "banos");
    StateMachine.trigger("wiggle", 1e3);
    AudioSystem.play("boton");
    const msg = speak(c, "bano");
    const unlocked = checkAchievements(state);
    bus.emit("action:done", { kind: "clean", msg, unlocked });
    return { ok: true, msg, unlocked };
  }
  function toggleLights(state) {
    const c = state.creature;
    c.lightsOff = !c.lightsOff;
    const msg = c.lightsOff ? speak(c, "dormir") : speak(c, "despertar_bien");
    if (c.lightsOff) {
      StateMachine.trigger("zzz", 1500);
      AudioSystem.play("dormir");
    }
    bus.emit("action:done", { kind: "lights", msg });
    return { ok: true, msg, lightsOff: c.lightsOff };
  }
  function medicate(state, itemId) {
    const c = state.creature;
    const item = ITEM_MAP[itemId];
    if (!item || item.tipo !== "medicina") return { ok: false, reason: "Eso no es una medicina." };
    if (!state.inventory[itemId]) return { ok: false, reason: "No te queda esa medicina." };
    const res = applyMedicine(c, item);
    if (!res.ok) return res;
    removeItem(state.inventory, itemId, 1);
    c.stats = applyEffects(c.stats, { salud: 15, felicidad: 4, estres: -6 });
    bump(state, "curas");
    StateMachine.trigger("celebrate", 1300);
    AudioSystem.play("exito");
    const msg = speak(c, "curado");
    addMemory(state, `Se recuper\xF3 de la ${res.name || "dolencia"}.`, "feliz");
    const unlocked = checkAchievements(state);
    bus.emit("action:done", { kind: "medicate", msg, unlocked });
    return { ok: true, msg, unlocked };
  }
  function talk(state) {
    const c = state.creature;
    if (!c.hatched) return { ok: true, msg: "El n\xFAcleo emite un zumbido tenue." };
    c.stats = applyEffects(c.stats, { afecto: 2, felicidad: 2 });
    let msg;
    if (state.memories.length && chance(0.4)) {
      const mem = state.memories[Math.floor(Math.random() * state.memories.length)];
      msg = speak(c, "memoria_recuerdo", { memoria: mem.text });
    } else {
      msg = speak(c, "charla");
    }
    bump(state, "charlas");
    StateMachine.trigger("nod", 900);
    const unlocked = checkAchievements(state);
    bus.emit("action:done", { kind: "talk", msg, unlocked });
    return { ok: true, msg, unlocked };
  }

  // js/ui/accessibility.js
  function describeState(creature) {
    const form = FORM_MAP[creature.formId];
    const mood = computeMood(creature);
    const name = creature.name || "Tu entidad";
    if (!creature.hatched) return `${name} todav\xEDa es un n\xFAcleo sin eclosionar.`;
    const parts = [`${name}, ${form ? form.nombre : "forma desconocida"}. Estado: ${MOOD_LABELS[mood] || mood}.`];
    const s = creature.stats;
    const low = [];
    for (const [k, label] of Object.entries(STAT_LABELS)) {
      const v = Math.round(s[k]);
      const bad = INVERTED_STATS.includes(k) ? v > 70 : v < 30;
      if (bad) low.push(`${label} ${v}`);
    }
    if (low.length) parts.push(`Necesita atenci\xF3n: ${low.join(", ")}.`);
    else parts.push("Sus necesidades est\xE1n cubiertas.");
    if (creature.illness) parts.push("Est\xE1 enferma.");
    return parts.join(" ");
  }
  function announce(msg) {
    let live = document.getElementById("sr-live");
    if (!live) {
      live = document.createElement("div");
      live.id = "sr-live";
      live.className = "sr-only";
      live.setAttribute("aria-live", "polite");
      document.body.appendChild(live);
    }
    live.textContent = "";
    requestAnimationFrame(() => {
      live.textContent = msg;
    });
  }

  // js/views/habitat.js
  function habitatView(ctx3) {
    const { state, persist } = ctx3;
    const c = state.creature;
    const stage = h("div", { class: "creature-stage" });
    const speech = h("div", { class: "speech", role: "status", "aria-live": "polite" });
    const statusChip = h("div", { class: "status-chip" });
    const clockChip = h("div", { class: "clock-chip" });
    const decorLayer = h("div", { class: "decor-layer", "aria-hidden": "true" });
    renderDecor(decorLayer, state);
    const habitat = h("div", { class: "habitat", dataset: { phase: dayPhase() } }, [
      h("div", { class: "floor" }),
      decorLayer,
      h("div", { class: "scanlines", "aria-hidden": "true" }),
      h("div", { class: "vignette", "aria-hidden": "true" }),
      h("div", { class: "particles", "aria-hidden": "true" }, particleSet()),
      stage,
      speech,
      statusChip,
      clockChip
    ]);
    let blink = false;
    function paint() {
      const mood = computeMood(c);
      stage.innerHTML = "";
      const svg = renderCreature(c, { mood, blink, anim: StateMachine.active });
      if (StateMachine.active) svg.classList.add(`anim-${StateMachine.active}`);
      stage.appendChild(svg);
      const form = FORM_MAP[c.formId];
      statusChip.textContent = c.hatched ? MOOD_LABELS[mood] || mood : "Incubando";
      statusChip.className = `status-chip urgency-${urgencyLevel(c.stats, c.illness)}`;
      clockChip.textContent = `${form ? form.nombre : "N\xFAcleo"} \xB7 ${ageLabel(c.birthTs)}`;
      habitat.dataset.phase = dayPhase();
    }
    function say(msg) {
      speech.textContent = msg;
      speech.classList.remove("show");
      void speech.offsetWidth;
      speech.classList.add("show");
    }
    setTimeout(() => {
      if (c.hatched) say(speak(c, "saludo"));
      else say("El n\xFAcleo late suavemente. Algo se est\xE1 formando dentro.");
    }, 300);
    const blinkTimer = setInterval(() => {
      if (computeMood(c) === "dormida") return;
      blink = true;
      paint();
      setTimeout(() => {
        blink = false;
        paint();
      }, 160);
    }, 4200);
    const onTick = () => paint();
    const onAction = ({ msg }) => {
      if (msg) {
        say(msg);
        announce(msg);
      }
      paint();
      persist();
    };
    const onAnim = () => paint();
    bus.on("tick", onTick);
    bus.on("action:done", onAction);
    bus.on("anim:start", onAnim);
    bus.on("anim:end", onAnim);
    bus.on("creature:evolved", onEvolved);
    bus.on("creature:hatched", onHatched);
    function onEvolved({ form }) {
      StateMachine.trigger("evolve-flash", 1800);
      toast(`\xA1Ha evolucionado a ${form.nombre}!`, { type: "success" });
      say(speak(c, "evolucion"));
      paint();
      persist();
    }
    function onHatched(form) {
      toast(`Tu n\xFAcleo ha eclosionado: ${form?.nombre || ""}`, { type: "success" });
      paint();
      persist();
    }
    function onBirthday() {
      StateMachine.trigger("celebrate", 1400);
      say(speak(c, "cumple"));
      paint();
    }
    function onSick() {
      StateMachine.trigger("shiver", 1600);
      say(speak(c, "enfermo"));
      paint();
      persist();
    }
    function onRecovered() {
      StateMachine.trigger("hop", 1200);
      say(speak(c, "curado"));
      paint();
      persist();
    }
    bus.on("creature:birthday", onBirthday);
    bus.on("creature:sick", onSick);
    bus.on("creature:recovered", onRecovered);
    stage.addEventListener("click", () => {
      const r = pet(state);
      if (!r.ok) toast(r.reason);
    });
    stage.style.cursor = "pointer";
    stage.setAttribute("role", "button");
    stage.setAttribute("tabindex", "0");
    stage.setAttribute("aria-label", "Acariciar a tu entidad");
    stage.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const r = pet(state);
        if (!r.ok) toast(r.reason);
      }
    });
    let lightBtn;
    const updateLightButton = () => {
      const label = lightBtn?.querySelector("span:last-child");
      const icon = lightBtn?.querySelector(".btn-icon");
      if (label) label.textContent = c.lightsOff ? "Encender" : "Apagar luz";
      if (icon) icon.textContent = c.lightsOff ? "\u2600" : "\u263E";
    };
    lightBtn = btn(c.lightsOff ? "Encender" : "Apagar luz", () => {
      const r = toggleLights(state);
      toast(r.lightsOff ? "Luces apagadas" : "Luces encendidas");
      updateLightButton();
    }, { icon: c.lightsOff ? "\u2600" : "\u263E" });
    const actions = h("div", { class: "action-grid" }, [
      btn("Acariciar", () => {
        const r = pet(state);
        if (!r.ok) toast(r.reason);
      }, { icon: "\u2661" }),
      btn("Limpiar", () => {
        const r = clean(state);
        if (!r.ok) toast(r.reason);
      }, { icon: "\u2726" }),
      btn("Hablar", () => {
        const r = talk(state);
        if (!r.ok) toast(r.reason);
      }, { icon: "\u25CC" }),
      lightBtn
    ]);
    const srDesc = h("p", { class: "sr-only", "aria-live": "polite" }, describeState(c));
    const telemetry = h("section", { class: "telemetry-grid", "aria-label": "Telemetr\xEDa de la entidad" }, [
      telemetryCard("V\xEDnculo", Math.round(c.stats?.afecto ?? 0), 100, "\u2661"),
      telemetryCard("Energ\xEDa", Math.round(c.stats?.energia ?? 0), 100, "\u03DF"),
      telemetryCard("Estabilidad", Math.round(c.stats?.estabilidad ?? 0), 100, "\u25C8"),
      telemetryCard("Higiene", Math.round(c.stats?.higiene ?? 0), 100, "\u2726")
    ]);
    const node = h("div", { class: "view habitat-view" }, [
      h("div", { class: "habitat-head spread" }, [
        h("div", {}, [h("div", { class: "screen-kicker" }, "C\xC1MARA DE CONTENCI\xD3N"), h("h1", { class: "screen-title" }, c.name || "Tu entidad"), h("p", { class: "screen-lead compact" }, "Supervisa su estado, fortalece el v\xEDnculo y gu\xEDa su evoluci\xF3n.")]),
        walletChip(state)
      ]),
      telemetry,
      habitat,
      srDesc,
      h("div", { class: "section-label" }, "INTERACCIONES DIRECTAS"),
      actions,
      modeBanner(state)
    ]);
    paint();
    function cleanup() {
      clearInterval(blinkTimer);
      bus.off("tick", onTick);
      bus.off("action:done", onAction);
      bus.off("anim:start", onAnim);
      bus.off("anim:end", onAnim);
      bus.off("creature:evolved", onEvolved);
      bus.off("creature:hatched", onHatched);
      bus.off("creature:birthday", onBirthday);
      bus.off("creature:sick", onSick);
      bus.off("creature:recovered", onRecovered);
    }
    return { node, cleanup, title: "C\xE1mara" };
  }
  function particleSet() {
    const arr = [];
    for (let i = 0; i < 8; i++) arr.push(h("span", { class: "particle", style: `left:${8 + i * 11}%; animation-delay:${i * 0.7}s` }));
    return arr;
  }
  function renderDecor(layer, state) {
    const placed = state.decor || {};
    for (const [slot, itemId] of Object.entries(placed)) {
      if (!itemId) continue;
      layer.appendChild(h("div", { class: `decor-item slot-${slot}`, dataset: { item: itemId } }));
    }
  }
  function modeBanner(state) {
    if (state.modes?.vacaciones) return h("div", { class: "mode-banner vac" }, "Modo vacaciones activo: las necesidades est\xE1n casi congeladas.");
    if (state.modes?.descanso) return h("div", { class: "mode-banner rest" }, "Modo descanso: el deterioro es m\xE1s lento.");
    if (state.creature.suspended) return h("div", { class: "mode-banner susp" }, "Tu entidad est\xE1 en suspensi\xF3n. Puedes reactivarla cuando quieras.");
    return null;
  }
  function telemetryCard(label, value, max, icon) {
    const safe = Math.max(0, Math.min(max, Number(value) || 0));
    return h("div", { class: "telemetry-card" }, [
      h("span", { class: "telemetry-icon", "aria-hidden": "true" }, icon),
      h("span", { class: "telemetry-copy" }, [h("small", {}, label), h("strong", {}, `${safe}%`)]),
      h("span", { class: "telemetry-track", "aria-hidden": "true" }, h("span", { style: `width:${safe}%` }))
    ]);
  }

  // js/views/needs.js
  function needsView(ctx3) {
    const { state } = ctx3;
    const c = state.creature;
    const barsHost = h("div", { class: "stats-list" });
    function paint() {
      barsHost.innerHTML = "";
      for (const [key, label] of Object.entries(STAT_LABELS)) {
        barsHost.appendChild(statBar(key, label, c.stats[key], { inverted: INVERTED_STATS.includes(key) }));
      }
    }
    paint();
    const onTick = () => paint();
    bus.on("tick", onTick);
    bus.on("action:done", onTick);
    const form = FORM_MAP[c.formId];
    const traits = topTraits(c.personality, 4);
    const traitChips = traits.length ? h("div", { class: "chip-row" }, traits.map((t) => h("span", { class: "chip" }, TRAIT_LABELS?.[t.t] || t.t))) : h("p", { class: "empty-note" }, "A\xFAn sin rasgos marcados.");
    const node = h("div", { class: "view" }, [
      h("div", { class: "spread" }, [h("h1", { class: "screen-title" }, "Estado"), walletChip(state)]),
      panel(null, [
        h("div", { class: "ident-row" }, [
          h("strong", {}, form ? form.nombre : "N\xFAcleo"),
          h("span", { class: "muted" }, ` \xB7 ${MOOD_LABELS[computeMood(c)] || ""} \xB7 ${ageLabel(c.birthTs)}`)
        ]),
        barsHost
      ]),
      panel("Personalidad", [
        h("p", {}, describePersonality(c.personality)),
        traitChips
      ])
    ]);
    return { node, cleanup: () => {
      bus.off("tick", onTick);
      bus.off("action:done", onTick);
    }, title: "Estado" };
  }

  // js/views/feed.js
  var FOOD_TYPES2 = /* @__PURE__ */ new Set(["comida", "bebida"]);
  function feedView(ctx3) {
    const { state } = ctx3;
    const host = h("div", { class: "stack" });
    function paint() {
      host.innerHTML = "";
      const foods = Object.entries(state.inventory).map(([id, qty]) => ({ item: ITEM_MAP[id], qty, id })).filter((e) => e.item && FOOD_TYPES2.has(e.item.tipo));
      if (foods.length === 0) {
        host.appendChild(empty("No tienes comida. P\xE1sate por la tienda."));
        return;
      }
      for (const catDef of FOOD_CATS) {
        const inCat = foods.filter((f) => f.item.cat === catDef.id);
        if (inCat.length === 0) continue;
        const grid = h("div", { class: "item-grid" }, inCat.map((f) => foodCard(f, state, paint)));
        host.appendChild(panel(catDef.label, grid));
      }
    }
    paint();
    const onDone = () => paint();
    bus.on("action:done", onDone);
    const node = h("div", { class: "view" }, [
      h("div", { class: "spread" }, [h("h1", { class: "screen-title" }, "Nutrir"), walletChip(state)]),
      host
    ]);
    return { node, cleanup: () => bus.off("action:done", onDone), title: "Nutrir" };
  }
  function foodCard(f, state, refresh) {
    const c = state.creature;
    const fav = c.prefs.favFood === f.id;
    const hated = c.prefs.hatedFood === f.id;
    return h("div", { class: "item-card" }, [
      h("div", { class: "item-emoji", "aria-hidden": "true" }, glyph(f.item.icon)),
      h("div", { class: "item-name" }, f.item.nombre),
      fav ? h("span", { class: "tag fav" }, "\u2605 favorita") : hated ? h("span", { class: "tag bad" }, "no le gusta") : null,
      h("div", { class: "item-qty" }, `\xD7${f.qty}`),
      btn("Dar", () => {
        const r = feed(state, f.id);
        if (!r.ok) toast(r.reason);
        else refresh();
      }, { primary: true, cls: "sm" })
    ]);
  }

  // js/views/health.js
  function healthView(ctx3) {
    const { state } = ctx3;
    const c = state.creature;
    const host = h("div", { class: "stack" });
    function paint() {
      host.innerHTML = "";
      host.appendChild(panel("Higiene", [
        statBar("higiene", "Higiene", c.stats.higiene),
        btn("Limpiar la c\xE1mara", () => {
          const r = clean(state);
          if (!r.ok) toast(r.reason);
          else paint();
        }, { primary: true, icon: "\u2726" })
      ]));
      const saludKids = [statBar("salud", "Salud", c.stats.salud)];
      if (c.illness) {
        const ill = ILLNESSES[c.illness];
        saludKids.push(h("div", { class: "illness-box" }, [
          h("strong", {}, `Enferma: ${ill?.nombre || c.illness}`),
          h("p", { class: "muted" }, ill?.sintomas || "Necesita tratamiento."),
          ill?.causa ? h("p", { class: "hint" }, `Causa probable: ${ill.causa}`) : null,
          h("p", { class: "hint" }, `Medicina indicada: ${medNameFor(c.illness)}`)
        ]));
      } else {
        saludKids.push(h("p", { class: "ok-note" }, "Sin dolencias. Se encuentra bien."));
      }
      host.appendChild(panel("Salud", saludKids));
      const meds = Object.entries(state.inventory).map(([id, qty]) => ({ item: ITEM_MAP[id], qty, id })).filter((e) => e.item && e.item.tipo === "medicina");
      const medHost = meds.length ? h("div", { class: "item-grid" }, meds.map((m) => h("div", { class: "item-card" }, [
        h("div", { class: "item-emoji", "aria-hidden": "true" }, glyph(m.item.icon, "\u271A")),
        h("div", { class: "item-name" }, m.item.nombre),
        h("div", { class: "item-qty" }, `\xD7${m.qty}`),
        btn("Usar", () => {
          const r = medicate(state, m.id);
          if (!r.ok) toast(r.reason);
          else {
            toast("Medicina administrada", { type: "success" });
            paint();
          }
        }, { primary: true, cls: "sm" })
      ]))) : empty("Botiqu\xEDn vac\xEDo. Compra medicinas en la tienda.");
      host.appendChild(panel("Botiqu\xEDn", medHost));
    }
    paint();
    const onDone = () => paint();
    bus.on("action:done", onDone);
    bus.on("tick", onDone);
    const node = h("div", { class: "view" }, [
      h("div", { class: "spread" }, [h("h1", { class: "screen-title" }, "Salud"), walletChip(state)]),
      host
    ]);
    return { node, cleanup: () => {
      bus.off("action:done", onDone);
      bus.off("tick", onDone);
    }, title: "Salud" };
  }
  function medNameFor(illnessId) {
    for (const it of Object.values(ITEM_MAP)) if (it.tipo === "medicina" && it.cura === illnessId) return it.nombre;
    return "desconocida";
  }

  // js/minigames/memory-glitch.js
  function createMemoryGlitch(canvas, { onEnd } = {}) {
    const ctx3 = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cells = [
      { sym: "\u25B2", color: "#5ad1c9", label: "tri\xE1ngulo" },
      { sym: "\u25A0", color: "#c9a25a", label: "cuadrado" },
      { sym: "\u25CF", color: "#7a9ff5", label: "c\xEDrculo" },
      { sym: "\u25C6", color: "#c95ab0", label: "rombo" }
    ];
    const rects = [];
    const cols = 2, rows = 2, pad = 16;
    const cw = (W - pad * 3) / cols, ch = (H - pad * 3) / rows;
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      rects.push({ x: pad + c * (cw + pad), y: pad + r * (ch + pad), w: cw, h: ch });
    }
    let seq = [], input = [], showing = true, flash = -1, level = 0, score = 0, alive = true, paused = false;
    let stepT = 0, idx = 0;
    function addStep() {
      seq.push(Math.floor(Math.random() * 4));
    }
    function nextLevel() {
      level++;
      input = [];
      showing = true;
      idx = 0;
      stepT = performance.now() + 400;
      addStep();
    }
    function draw(now) {
      ctx3.clearRect(0, 0, W, H);
      ctx3.font = `${Math.floor(ch * 0.4)}px monospace`;
      ctx3.textAlign = "center";
      ctx3.textBaseline = "middle";
      rects.forEach((r, i) => {
        const on = flash === i;
        ctx3.globalAlpha = on ? 1 : 0.35;
        ctx3.fillStyle = cells[i].color;
        roundRect(ctx3, r.x, r.y, r.w, r.h, 12);
        ctx3.fill();
        ctx3.globalAlpha = 1;
        ctx3.fillStyle = "#0b0f12";
        ctx3.fillText(cells[i].sym, r.x + r.w / 2, r.y + r.h / 2);
      });
      ctx3.globalAlpha = 1;
      ctx3.fillStyle = "#e8eef4";
      ctx3.font = "14px monospace";
      ctx3.textAlign = "left";
      ctx3.fillText(`Nivel ${level}  \xB7  Puntos ${score}`, 12, H - 10);
    }
    function tick(now) {
      if (!alive) return;
      if (!paused) {
        if (showing) {
          if (now >= stepT) {
            if (idx < seq.length) {
              flash = seq[idx];
              stepT = now + 520;
              idx++;
              setTimeout(() => {
                if (alive) flash = -1;
              }, 300);
            } else {
              showing = false;
              flash = -1;
            }
          }
        }
        draw(now);
      }
      requestAnimationFrame(tick);
    }
    function press(i) {
      if (showing || !alive || paused) return;
      flash = i;
      setTimeout(() => {
        if (alive) flash = -1;
      }, 140);
      input.push(i);
      const pos = input.length - 1;
      if (input[pos] !== seq[pos]) {
        end();
        return;
      }
      if (input.length === seq.length) {
        score += level * 5;
        setTimeout(() => {
          if (alive) nextLevel();
        }, 500);
      }
    }
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (W / rect.width);
      const y = (e.clientY - rect.top) * (H / rect.height);
      rects.forEach((r, i) => {
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) press(i);
      });
    }
    function onKey(e) {
      const k = ["1", "2", "3", "4"].indexOf(e.key);
      if (k >= 0) press(k);
    }
    function end() {
      alive = false;
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      onEnd && onEnd({ score, best: level });
    }
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    nextLevel();
    requestAnimationFrame(tick);
    return {
      pause() {
        paused = true;
      },
      resume() {
        paused = false;
      },
      stop() {
        if (alive) {
          alive = false;
          canvas.removeEventListener("click", onClick);
          window.removeEventListener("keydown", onKey);
        }
      }
    };
  }
  function roundRect(ctx3, x, y, w, h2, r) {
    ctx3.beginPath();
    ctx3.moveTo(x + r, y);
    ctx3.arcTo(x + w, y, x + w, y + h2, r);
    ctx3.arcTo(x + w, y + h2, x, y + h2, r);
    ctx3.arcTo(x, y + h2, x, y, r);
    ctx3.arcTo(x, y, x + w, y, r);
    ctx3.closePath();
  }

  // js/minigames/fragment-hunt.js
  function createFragmentHunt(canvas, { onEnd, duration = 3e4 } = {}) {
    const ctx3 = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    let score = 0, alive = true, paused = false, tEnd = performance.now() + duration, frags = [], spawnT = 0;
    function spawn(now) {
      const good = Math.random() > 0.22;
      frags.push({
        x: 30 + Math.random() * (W - 60),
        y: 40 + Math.random() * (H - 80),
        r: 18 + Math.random() * 8,
        born: now,
        life: 1100 + Math.random() * 700,
        good
      });
    }
    function draw(now) {
      ctx3.clearRect(0, 0, W, H);
      frags.forEach((f) => {
        const age = (now - f.born) / f.life;
        ctx3.globalAlpha = Math.max(0, 1 - age);
        ctx3.fillStyle = f.good ? "#5ad1c9" : "#c9556b";
        ctx3.beginPath();
        if (f.good) {
          for (let i = 0; i < 6; i++) {
            const a = i / 6 * Math.PI * 2 - Math.PI / 2;
            const px = f.x + Math.cos(a) * f.r, py = f.y + Math.sin(a) * f.r;
            i ? ctx3.lineTo(px, py) : ctx3.moveTo(px, py);
          }
          ctx3.closePath();
        } else {
          ctx3.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        }
        ctx3.fill();
        if (!f.good) {
          ctx3.strokeStyle = "#0b0f12";
          ctx3.lineWidth = 3;
          ctx3.beginPath();
          ctx3.moveTo(f.x - 6, f.y - 6);
          ctx3.lineTo(f.x + 6, f.y + 6);
          ctx3.moveTo(f.x + 6, f.y - 6);
          ctx3.lineTo(f.x - 6, f.y + 6);
          ctx3.stroke();
        }
      });
      ctx3.globalAlpha = 1;
      ctx3.fillStyle = "#e8eef4";
      ctx3.font = "14px monospace";
      ctx3.textAlign = "left";
      ctx3.fillText(`Fragmentos ${score}`, 12, 22);
      const left = Math.max(0, Math.ceil((tEnd - now) / 1e3));
      ctx3.textAlign = "right";
      ctx3.fillText(`${left}s`, W - 12, 22);
    }
    function tick(now) {
      if (!alive) return;
      if (!paused) {
        if (now >= tEnd) {
          end();
          return;
        }
        if (now >= spawnT) {
          spawn(now);
          spawnT = now + 380 + Math.random() * 260;
        }
        frags = frags.filter((f) => now - f.born < f.life);
        draw(now);
      }
      requestAnimationFrame(tick);
    }
    function hit(x, y) {
      if (paused) return;
      for (let i = frags.length - 1; i >= 0; i--) {
        const f = frags[i];
        if ((x - f.x) ** 2 + (y - f.y) ** 2 <= (f.r + 6) ** 2) {
          if (f.good) score++;
          else score = Math.max(0, score - 2);
          frags.splice(i, 1);
          return;
        }
      }
    }
    function onClick(e) {
      const r = canvas.getBoundingClientRect();
      hit((e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height));
    }
    function end() {
      alive = false;
      canvas.removeEventListener("click", onClick);
      onEnd && onEnd({ score });
    }
    canvas.addEventListener("click", onClick);
    spawnT = performance.now();
    requestAnimationFrame(tick);
    return { pause() {
      paused = true;
    }, resume() {
      if (paused) {
        const d = performance.now();
        paused = false;
      }
    }, stop() {
      if (alive) {
        alive = false;
        canvas.removeEventListener("click", onClick);
      }
    } };
  }

  // js/minigames/signal-balance.js
  function createSignalBalance(canvas, { onEnd } = {}) {
    const ctx3 = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    let pos = H / 2, target = H / 2, vel = 0, drift = 0, score = 0, seconds = 0;
    let alive = true, paused = false, last = performance.now(), keyUp = false, keyDown = false;
    const bandH = 90;
    function tick(now) {
      if (!alive) return;
      if (!paused) {
        const dt = Math.min(50, now - last) / 1e3;
        last = now;
        drift += (Math.random() - 0.5) * 40 * dt;
        drift *= 0.96;
        target = H / 2 + Math.sin(now / 900) * 60 + drift * 3;
        if (keyUp) vel -= 320 * dt;
        if (keyDown) vel += 320 * dt;
        vel *= 0.9;
        pos += vel * dt;
        pos = Math.max(20, Math.min(H - 20, pos));
        const inBand = Math.abs(pos - target) < bandH / 2;
        if (inBand) {
          seconds += dt;
          score = Math.floor(seconds);
        } else {
          seconds = Math.max(0, seconds - dt * 1.5);
        }
        draw(inBand);
      } else {
        last = now;
      }
      requestAnimationFrame(tick);
    }
    function draw(inBand) {
      ctx3.clearRect(0, 0, W, H);
      ctx3.fillStyle = inBand ? "rgba(90,209,201,0.18)" : "rgba(201,85,107,0.15)";
      ctx3.fillRect(0, target - bandH / 2, W, bandH);
      ctx3.strokeStyle = inBand ? "#5ad1c9" : "#c9556b";
      ctx3.lineWidth = 2;
      ctx3.strokeRect(0, target - bandH / 2, W, bandH);
      ctx3.fillStyle = "#e8eef4";
      ctx3.beginPath();
      ctx3.arc(W / 2, pos, 12, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.fillStyle = "#e8eef4";
      ctx3.font = "14px monospace";
      ctx3.textAlign = "left";
      ctx3.fillText(`Estabilidad ${score}s`, 12, 22);
    }
    function onDown(e) {
      const r = canvas.getBoundingClientRect();
      const y = (e.clientY - r.top) * (H / r.height);
      target > y ? keyUp = true : keyDown = true;
      setTimeout(() => {
        keyUp = keyDown = false;
      }, 120);
      pointerMove(e);
    }
    function pointerMove(e) {
      if (e.buttons) {
        const r = canvas.getBoundingClientRect();
        const y = (e.clientY - r.top) * (H / r.height);
        vel += (y - pos) * 0.15;
      }
    }
    function onKeyDown(e) {
      if (e.key === "ArrowUp") {
        keyUp = true;
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        keyDown = true;
        e.preventDefault();
      }
    }
    function onKeyUp(e) {
      if (e.key === "ArrowUp") keyUp = false;
      if (e.key === "ArrowDown") keyDown = false;
    }
    function end() {
      alive = false;
      cleanup();
      onEnd && onEnd({ score });
    }
    function cleanup() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", pointerMove);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const timer2 = setTimeout(end, 45e3);
    requestAnimationFrame(tick);
    return { pause() {
      paused = true;
    }, resume() {
      paused = false;
      last = performance.now();
    }, stop() {
      if (alive) {
        alive = false;
        clearTimeout(timer2);
        cleanup();
      }
    } };
  }

  // js/minigames/void-runner.js
  function createVoidRunner(canvas, { onEnd } = {}) {
    const ctx3 = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const groundY = H - 40;
    let y = groundY, vy = 0, jumping = false, dist = 0, speed = 4, obstacles = [], spawnX = W, alive = true, paused = false, last = performance.now();
    const G = 1400, JUMP = -520;
    function jump() {
      if (!jumping && !paused) {
        vy = JUMP;
        jumping = true;
      }
    }
    function spawn() {
      const h2 = 20 + Math.random() * 34;
      obstacles.push({ x: W + 20, w: 16 + Math.random() * 14, h: h2 });
    }
    function tick(now) {
      if (!alive) return;
      if (!paused) {
        const dt = Math.min(50, now - last) / 1e3;
        last = now;
        speed += dt * 0.25;
        dist += speed * dt * 10;
        vy += G * dt;
        y += vy * dt;
        if (y >= groundY) {
          y = groundY;
          vy = 0;
          jumping = false;
        }
        obstacles.forEach((o) => o.x -= speed * 60 * dt);
        obstacles = obstacles.filter((o) => o.x + o.w > -10);
        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < W - 160 - Math.random() * 120) spawn();
        const px = 50;
        for (const o of obstacles) {
          if (px + 14 > o.x && px - 14 < o.x + o.w && y + 14 > groundY - o.h) {
            end();
            return;
          }
        }
        draw();
      } else last = now;
      requestAnimationFrame(tick);
    }
    function draw() {
      ctx3.clearRect(0, 0, W, H);
      ctx3.strokeStyle = "#2b3742";
      ctx3.lineWidth = 2;
      ctx3.beginPath();
      ctx3.moveTo(0, groundY + 16);
      ctx3.lineTo(W, groundY + 16);
      ctx3.stroke();
      ctx3.fillStyle = "#5ad1c9";
      ctx3.beginPath();
      ctx3.arc(50, y, 14, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.fillStyle = "#0b0f12";
      ctx3.beginPath();
      ctx3.arc(55, y - 3, 3, 0, Math.PI * 2);
      ctx3.fill();
      ctx3.fillStyle = "#c9556b";
      obstacles.forEach((o) => ctx3.fillRect(o.x, groundY - o.h, o.w, o.h + 16));
      ctx3.fillStyle = "#e8eef4";
      ctx3.font = "14px monospace";
      ctx3.textAlign = "left";
      ctx3.fillText(`Distancia ${Math.floor(dist)}`, 12, 22);
    }
    function onKey(e) {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    }
    function onPointer() {
      jump();
    }
    function end() {
      alive = false;
      cleanup();
      onEnd && onEnd({ score: Math.floor(dist) });
    }
    function cleanup() {
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
    }
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);
    requestAnimationFrame(tick);
    return { pause() {
      paused = true;
    }, resume() {
      paused = false;
      last = performance.now();
    }, stop() {
      if (alive) {
        alive = false;
        cleanup();
      }
    } };
  }

  // js/systems/economy-system.js
  function canAfford(wallet, item, qty = 1) {
    if (item.precioEcos) return wallet.ecos >= item.precioEcos * qty;
    return wallet.fragmentos >= item.precio * qty;
  }
  function buy(state, itemId, qty = 1) {
    const item = ITEM_MAP[itemId];
    if (!item) return { ok: false, reason: "Objeto desconocido." };
    if (!canAfford(state.wallet, item, qty)) return { ok: false, reason: "No tienes suficiente para esta compra." };
    if (item.precioEcos) state.wallet.ecos -= item.precioEcos * qty;
    else state.wallet.fragmentos -= item.precio * qty;
    state.counters = state.counters || {};
    state.counters.compras = (state.counters.compras || 0) + 1;
    if (item.tipo === "capsula") {
      state.counters.capsulas = (state.counters.capsulas || 0) + 1;
      const wonId = weightedPick(CAPSULE_POOL);
      addItem(state.inventory, wonId, 1);
      state.counters.objetos_distintos = Object.keys(state.inventory).length;
      return { ok: true, capsule: true, won: ITEM_MAP[wonId] };
    }
    addItem(state.inventory, itemId, qty);
    state.counters.objetos_distintos = Object.keys(state.inventory).length;
    return { ok: true, item };
  }
  function sell(state, itemId, qty = 1) {
    const item = ITEM_MAP[itemId];
    if (!item) return { ok: false, reason: "Objeto desconocido." };
    if (item.tipo === "capsula" || item.precioEcos) return { ok: false, reason: "Este objeto no se puede vender." };
    if ((state.inventory[itemId] || 0) < qty) return { ok: false, reason: "No tienes suficientes unidades." };
    removeItem(state.inventory, itemId, qty);
    const value = Math.floor(item.precio * 0.4) * qty;
    state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + value);
    return { ok: true, value };
  }
  function gameReward(baseFragments, score, gameEnergy) {
    const energyMult = gameEnergy > 0 ? 1 : 0.25;
    const fragments = Math.max(1, Math.floor((baseFragments + score * 0.4) * energyMult));
    const ecos = score >= 25 && gameEnergy > 0 ? 1 : 0;
    return { fragments: Math.min(fragments, 60), ecos };
  }

  // js/views/games.js
  var GAMES = [
    { id: "memoria_glitch", nombre: "Memoria Glitch", desc: "Repite la secuencia de s\xEDmbolos.", base: 6, record: "memoria_glitch", factory: createMemoryGlitch },
    { id: "caza_fragmentos", nombre: "Caza de Fragmentos", desc: "Toca los fragmentos, evita los corruptos.", base: 5, record: "caza_fragmentos", factory: createFragmentHunt },
    { id: "equilibrio_senal", nombre: "Equilibrio de Se\xF1al", desc: "Mant\xE9n el punto dentro de la banda.", base: 5, record: "equilibrio_senal", factory: createSignalBalance },
    { id: "corredor_vacio", nombre: "Corredor del Vac\xEDo", desc: "Esquiva los bloques el mayor tiempo posible.", base: 4, record: "corredor_vacio", factory: createVoidRunner }
  ];
  function gamesView(ctx3) {
    const { state, persist } = ctx3;
    let active2 = null;
    const walletHost = h("div", {}, [walletChip(state)]);
    const refreshWallet = () => walletHost.replaceChildren(walletChip(state));
    const energyLabel = h("span", { class: "energy-label" });
    function refreshEnergy() {
      energyLabel.textContent = `Energ\xEDa de juego: ${state.gameEnergy}/${GAME_ENERGY_MAX}`;
    }
    refreshEnergy();
    const list = h("div", { class: "game-list" }, GAMES.map((g) => h("div", { class: "game-card" }, [
      h("h3", {}, g.nombre),
      h("p", { class: "muted" }, g.desc),
      h("p", { class: "record" }, `R\xE9cord: ${state.records[g.record] || 0}`),
      btn("Jugar", () => launch(g), { primary: true })
    ])));
    const arena = h("div", { class: "game-arena", hidden: true });
    function launch(g) {
      if (active2) return;
      const lowEnergy = state.gameEnergy <= 0;
      if (lowEnergy) toast("Poca energ\xEDa: la recompensa ser\xE1 simb\xF3lica y tu entidad se cansar\xE1.");
      const canvas = h("canvas", { width: 340, height: 300, class: "game-canvas", "aria-label": `Minijuego ${g.nombre}` });
      const overlay = h("div", { class: "game-overlay" });
      const stopBtn = btn("Salir", () => finish({ score: 0, aborted: true }), { danger: true, cls: "sm" });
      const pauseBtn = btn("Pausa", () => {
        if (!active2) return;
        if (paused) {
          active2.resume();
          pauseBtn.querySelector("span:last-child").textContent = "Pausa";
        } else {
          active2.pause();
          pauseBtn.querySelector("span:last-child").textContent = "Seguir";
        }
        paused = !paused;
      }, { cls: "sm" });
      let paused = false;
      arena.hidden = false;
      arena.innerHTML = "";
      arena.appendChild(h("div", { class: "game-hud" }, [h("strong", {}, g.nombre), h("div", { class: "row" }, [pauseBtn, stopBtn])]));
      arena.appendChild(canvas);
      arena.appendChild(overlay);
      list.hidden = true;
      AudioSystem.play("juego");
      active2 = g.factory(canvas, { onEnd: (res) => finish(res) });
      function finish(res) {
        if (active2) {
          active2.stop?.();
          active2 = null;
        }
        arena.hidden = true;
        list.hidden = false;
        if (res.aborted) return;
        const score = res.score || 0;
        if (score > (state.records[g.record] || 0)) state.records[g.record] = score;
        const reward = gameReward(g.base, score, state.gameEnergy);
        state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + reward.fragments);
        state.wallet.ecos = Math.min(99999, state.wallet.ecos + reward.ecos);
        if (state.gameEnergy > 0) state.gameEnergy -= 1;
        state.gameEnergyTs = Date.now();
        state.creature.stats = applyEffects(state.creature.stats, { felicidad: 10, curiosidad: 6, energia: -6, estres: -4 });
        StateMachine.trigger("spin-play", 1100);
        bump(state, "partidas");
        bump(state, `juego_${g.id}`);
        const unlocked = checkAchievements(state);
        AudioSystem.play("moneda");
        toast(`Puntuaci\xF3n ${score} \xB7 +${reward.fragments}\u25C6${reward.ecos ? ` +${reward.ecos}\u2726` : ""}`, { type: "success" });
        for (const a of unlocked) toast(`Logro: ${a.nombre}`, { type: "success" });
        refreshEnergy();
        refreshWallet();
        persist();
        const cards = list.querySelectorAll(".game-card .record");
        GAMES.forEach((gg, i) => {
          if (cards[i]) cards[i].textContent = `R\xE9cord: ${state.records[gg.record] || 0}`;
        });
      }
    }
    const node = h("div", { class: "view" }, [
      h("div", { class: "spread" }, [h("h1", { class: "screen-title" }, "Juegos"), walletHost]),
      panel(null, [energyLabel, h("p", { class: "hint" }, "Cada partida consume 1 de energ\xEDa (se regenera con el tiempo). Sin energ\xEDa puedes jugar, pero la recompensa baja.")]),
      arena,
      list
    ]);
    return { node, cleanup: () => {
      if (active2) active2.stop?.();
    }, title: "Juegos" };
  }

  // js/models/item.js
  function priceLabel(item) {
    if (item.precioEcos) return `${item.precioEcos} ecos`;
    return `${item.precio} fragmentos`;
  }

  // js/views/shop.js
  var SECTIONS = [
    { title: "Alimentos", filter: (it) => ["comida", "bebida"].includes(it.tipo) && it.cat !== "anomalo" },
    { title: "Medicinas", filter: (it) => it.tipo === "medicina" },
    { title: "Juguetes", filter: (it) => it.tipo === "juguete" },
    { title: "Decoraci\xF3n", filter: (it) => it.tipo === "decoracion" },
    { title: "Evoluci\xF3n", filter: (it) => it.tipo === "evolutivo" },
    { title: "C\xE1psulas de Eco", filter: (it) => it.tipo === "capsula" },
    { title: "An\xF3malos", filter: (it) => it.cat === "anomalo" }
  ];
  function shopView(ctx3) {
    const { state, persist } = ctx3;
    const walletHost = h("div", {}, [walletChip(state)]);
    function refreshWallet() {
      walletHost.innerHTML = "";
      walletHost.appendChild(walletChip(state));
    }
    const host = h("div", { class: "stack" });
    function paint() {
      host.innerHTML = "";
      for (const sec of SECTIONS) {
        const items = Object.entries(ITEM_MAP).filter(([, it]) => sec.filter(it) && (it.precio != null || it.precioEcos != null));
        if (items.length === 0) continue;
        const grid = h("div", { class: "item-grid" }, items.map(([id, it]) => shopCard(id, it, state, () => {
          refreshWallet();
          persist();
        })));
        host.appendChild(panel(sec.title, grid));
      }
    }
    paint();
    const node = h("div", { class: "view" }, [
      h("div", { class: "spread" }, [h("h1", { class: "screen-title" }, "Tienda"), walletHost]),
      panel(null, h("p", { class: "hint" }, "Todo se compra con Fragmentos y Ecos, que se ganan jugando y cuidando. No hay pagos reales.")),
      host
    ]);
    return { node, title: "Tienda" };
  }
  function shopCard(id, it, state, after) {
    const b = btn(`Comprar \xB7 ${priceLabel(it)}`, () => {
      const r = buy(state, id, 1);
      if (!r.ok) {
        toast(r.reason);
        return;
      }
      if (r.capsule) toast(`C\xE1psula abierta: ${r.won.nombre}`, { type: "success" });
      else toast(`Comprado: ${it.nombre}`, { type: "success" });
      after();
    }, { primary: true, cls: "sm" });
    return h("div", { class: `item-card${it.rareza ? ` rarity-${it.rareza}` : ""}` }, [
      h("div", { class: "item-emoji", "aria-hidden": "true" }, glyph(it.icon)),
      h("div", { class: "item-name" }, it.nombre),
      it.desc ? h("div", { class: "item-desc" }, it.desc) : null,
      b
    ]);
  }

  // js/views/collections.js
  function inventoryView(ctx3) {
    const { state, persist } = ctx3;
    const host = h("div", { class: "stack" });
    function paint() {
      host.innerHTML = "";
      const entries = Object.entries(state.inventory).map(([id, qty]) => ({ it: ITEM_MAP[id], qty, id })).filter((e) => e.it);
      if (entries.length === 0) {
        host.appendChild(empty("Inventario vac\xEDo."));
        return;
      }
      const grid = h("div", { class: "item-grid" }, entries.map((e) => h("div", { class: "item-card" }, [
        h("div", { class: "item-emoji", "aria-hidden": "true" }, glyph(e.it.icon)),
        h("div", { class: "item-name" }, e.it.nombre),
        h("div", { class: "item-qty" }, `\xD7${e.qty}`),
        e.it.precio && e.it.tipo !== "capsula" ? btn("Vender", () => {
          const r = sell(state, e.id, 1);
          if (!r.ok) toast(r.reason);
          else {
            toast(`+${r.value}\u25C6`);
            persist();
            paint();
          }
        }, { cls: "sm" }) : null
      ])));
      host.appendChild(grid);
    }
    paint();
    const node = h("div", { class: "view" }, [
      h("div", { class: "spread" }, [h("h1", { class: "screen-title" }, "Inventario"), walletChip(state)]),
      host
    ]);
    return { node, title: "Inventario" };
  }
  function decorView(ctx3) {
    const { state, persist } = ctx3;
    const host = h("div", { class: "stack" });
    function paint() {
      host.innerHTML = "";
      for (const slotDef of DECOR_SLOTS) {
        const slot = slotDef.id;
        const owned = Object.keys(state.inventory).map((id) => ITEM_MAP[id]).filter((it) => it && it.tipo === "decoracion" && it.slot === slot);
        const current2 = state.decor[slot];
        const options = h("div", { class: "chip-row" }, [
          h("button", { class: `chip${!current2 ? " active" : ""}`, onclick: () => {
            delete state.decor[slot];
            persist();
            paint();
          } }, "Vac\xEDo"),
          ...owned.map((it) => h("button", { class: `chip${current2 === itId(it) ? " active" : ""}`, onclick: () => {
            const id = itId(it);
            if (state.decor[slot] !== id) {
              state.decor[slot] = id;
              bump(state, "decoraciones");
              if (slot === "reliquia") bump(state, "reliquias");
              for (const a of checkAchievements(state)) toast(`Protocolo desbloqueado: ${a.nombre}`, { type: "success" });
            }
            persist();
            paint();
          } }, it.nombre))
        ]);
        host.appendChild(panel(`Ranura: ${slotDef.label}`, owned.length ? options : empty("Sin decoraci\xF3n para esta ranura. Compra en la tienda.")));
      }
    }
    function itId(it) {
      for (const [id, v] of Object.entries(ITEM_MAP)) if (v === it) return id;
      return null;
    }
    paint();
    const node = h("div", { class: "view" }, [
      h("div", { class: "spread" }, [h("h1", { class: "screen-title" }, "Decoraci\xF3n"), walletChip(state)]),
      panel(null, h("p", { class: "hint" }, "Coloca objetos en la c\xE1mara. Algunas decoraciones mejoran el \xE1nimo con el tiempo.")),
      host
    ]);
    return { node, title: "Decoraci\xF3n" };
  }
  function archiveView(ctx3) {
    const { state } = ctx3;
    const discovered = new Set(state.discovered || []);
    const host = h("div", { class: "stack" });
    for (const stage of STAGES) {
      const forms = formsByStage(stage);
      if (!forms.length) continue;
      const grid = h("div", { class: "dex-grid" }, forms.map((f) => {
        const known = discovered.has(f.id);
        const card = h("button", { class: `dex-card${known ? "" : " unknown"}`, onclick: () => openForm(f, known) }, [
          h("div", { class: "dex-thumb" }, [renderThumb(f.id, { discovered: known })]),
          h("div", { class: "dex-name" }, known ? f.nombre : "???")
        ]);
        return card;
      }));
      host.appendChild(panel(stageLabel(stage) + ` (${forms.filter((f) => discovered.has(f.id)).length}/${forms.length})`, grid));
    }
    function openForm(f, known) {
      openModal({
        title: known ? f.nombre : "Forma no descubierta",
        body: (() => {
          const box = h("div", { class: "dex-detail" }, [
            h("div", { class: "dex-detail-thumb" }, [renderThumb(f.id, { discovered: known })]),
            known ? h("p", {}, f.desc || "") : h("p", { class: "muted" }, "A\xFAn no la has visto en tu c\xE1mara."),
            h("p", { class: "muted" }, `Etapa: ${stageLabel(f.etapa)} \xB7 Familia: ${FAMILY_LABELS[f.familia] || f.familia}`),
            h("p", { class: "hint" }, formHint(f))
          ]);
          return box;
        })()
      });
    }
    const total = FORMS.length;
    const node = h("div", { class: "view" }, [
      h("h1", { class: "screen-title" }, "Archivo de criaturas"),
      panel(null, h("p", { class: "muted" }, `Descubiertas ${discovered.size} de ${total} formas.`)),
      host
    ]);
    return { node, title: "Archivo" };
  }
  function stageLabel(s) {
    return { nucleo: "N\xFAcleos", recien: "Reci\xE9n nacidas", cria: "Cr\xEDas", juvenil: "Juveniles", adulto: "Adultas" }[s] || s;
  }
  function diaryView(ctx3) {
    const { state } = ctx3;
    const entries = [...state.diary || []].reverse();
    const memories = [...state.memories || []].reverse().slice(0, 40);
    const node = h("div", { class: "view" }, [
      h("h1", { class: "screen-title" }, "Diario"),
      panel("Entradas del diario", entries.length ? h("div", { class: "diary-list" }, entries.map((e) => h("div", { class: "diary-entry" }, [
        h("time", { class: "diary-date" }, formatDate(e.ts)),
        h("p", {}, e.text)
      ]))) : empty("El diario a\xFAn est\xE1 en blanco. Se ir\xE1 escribiendo solo con lo que viv\xE1is.")),
      panel("Recuerdos recientes", memories.length ? h("ul", { class: "memory-list" }, memories.map((m) => h("li", { class: `mem-${m.tone || "neutral"}` }, m.text))) : empty("Sin recuerdos todav\xEDa."))
    ]);
    return { node, title: "Diario" };
  }

  // js/views/progress.js
  function achievementsView(ctx3) {
    const { state } = ctx3;
    const done = state.achievements || {};
    const total = ACHIEVEMENTS.length;
    const unlocked = ACHIEVEMENTS.filter((a) => done[a.id]?.done).length;
    const host = h("div", { class: "stack" });
    for (const cat of ACH_CATS) {
      const inCat = ACHIEVEMENTS.filter((a) => a.cat === cat.id);
      if (!inCat.length) continue;
      const list = h("div", { class: "ach-list" }, inCat.map((a) => {
        const rec = done[a.id] || { done: false, progress: 0 };
        const pct = Math.min(100, Math.round((rec.progress || 0) / a.goal * 100));
        return h("div", { class: `achievement${rec.done ? " unlocked" : ""}` }, [
          h("div", { class: "ach-icon", "aria-hidden": "true" }, rec.done ? glyph(a.icon, "\u2605") : "\u25CB"),
          h("div", { class: "ach-body" }, [
            h("div", { class: "ach-name" }, a.nombre),
            h("div", { class: "ach-desc muted" }, a.desc),
            rec.done ? h("div", { class: "ach-status" }, "Completado") : h("div", { class: "ach-progress" }, [h("span", { class: "ach-progress-fill", style: `width:${pct}%` })])
          ]),
          a.reward ? h("div", { class: "ach-reward" }, `${a.reward.fragmentos ? `+${a.reward.fragmentos}\u25C6` : ""} ${a.reward.ecos ? `+${a.reward.ecos}\u2726` : ""}`.trim()) : null
        ]);
      }));
      host.appendChild(panel(`${cat.label} (${inCat.filter((a) => done[a.id]?.done).length}/${inCat.length})`, list));
    }
    const node = h("div", { class: "view" }, [
      h("h1", { class: "screen-title" }, "Logros"),
      panel(null, h("p", { class: "muted" }, `Desbloqueados ${unlocked} de ${total}.`)),
      host
    ]);
    return { node, title: "Logros" };
  }
  function evolutionsView(ctx3) {
    const { state } = ctx3;
    const discovered = new Set(state.discovered || []);
    const host = h("div", { class: "stack" });
    for (const stage of STAGES) {
      const forms = FORMS.filter((f) => f.etapa === stage);
      if (!forms.length) continue;
      const grid = h("div", { class: "evo-grid" }, forms.map((f) => {
        const known = discovered.has(f.id);
        return h("div", { class: `evo-node${known ? "" : " locked"}` }, [
          h("div", { class: "evo-thumb" }, [renderThumb(f.id, { discovered: known })]),
          h("div", { class: "evo-name" }, known ? f.nombre : "???"),
          h("div", { class: "evo-fam muted" }, FAMILY_LABELS[f.familia] || f.familia),
          h("div", { class: "evo-hint hint" }, known ? f.desc || "" : formHint(f))
        ]);
      }));
      host.appendChild(panel(stageLabel2(stage), grid));
    }
    const node = h("div", { class: "view" }, [
      h("h1", { class: "screen-title" }, "\xC1rbol de evoluciones"),
      panel(null, h("p", { class: "muted" }, "Las condiciones exactas de las formas secretas quedan a tu descubrimiento.")),
      host
    ]);
    return { node, title: "Evoluciones" };
  }
  function stageLabel2(s) {
    return { nucleo: "N\xFAcleos", recien: "Reci\xE9n nacidas", cria: "Cr\xEDas", juvenil: "Juveniles", adulto: "Adultas" }[s] || s;
  }

  // js/views/system.js
  function moreView() {
    const node = h("div", { class: "view" }, [
      h("div", { class: "screen-kicker" }, "CENTRO DE CONTROL"),
      h("h1", { class: "screen-title" }, "Sistema 404"),
      h("p", { class: "screen-lead" }, "Gestiona el v\xEDnculo, el archivo biol\xF3gico y todos los protocolos locales de la simulaci\xF3n."),
      h(
        "nav",
        { class: "more-list", "aria-label": "Secciones adicionales" },
        MORE_LINKS.map((l) => h("a", { class: "more-link", href: l.hash }, [h("span", { class: "more-icon", "aria-hidden": "true" }, l.icon), h("span", { class: "more-copy" }, [h("strong", {}, l.label), h("small", {}, l.desc)]), h("span", { class: "chev", "aria-hidden": "true" }, "\u203A")]))
      )
    ]);
    return { node, title: "M\xE1s" };
  }
  function configView(ctx3) {
    const { state, persist, engine } = ctx3;
    const cfg2 = Config.all();
    const themeSel = selectRow("Tema visual", THEMES.map((t) => ({ v: t.id, l: t.label })), cfg2.theme, (v) => {
      Config.set("theme", v);
    });
    const contrastSel = toggleRow("Alto contraste", cfg2.contrast === "high", (on) => Config.set("contrast", on ? "high" : "normal"));
    const motionSel = toggleRow("Reducir animaciones", cfg2.motion === "off", (on) => Config.set("motion", on ? "off" : "auto"));
    const glitchSel = toggleRow("Efecto glitch", cfg2.glitch === "on", (on) => Config.set("glitch", on ? "on" : "off"));
    const fontRow = rangeRow("Tama\xF1o de texto", 0.9, 1.4, 0.05, cfg2.fontscale, (v) => Config.set("fontscale", v));
    const speedSel = selectRow(
      "Ritmo del tiempo",
      Object.keys(TIME_SPEEDS).map((k) => ({ v: k, l: k.charAt(0).toUpperCase() + k.slice(1) })),
      state.speed,
      (v) => {
        state.speed = v;
        persist();
      }
    );
    const sleepRow = h("div", { class: "field-row" }, [
      numberRow("Hora de dormir", 0, 23, state.creature.sleepHour, (v) => {
        state.creature.sleepHour = v;
        persist();
      }),
      numberRow("Hora de despertar", 0, 23, state.creature.wakeHour, (v) => {
        state.creature.wakeHour = v;
        persist();
      })
    ]);
    const masterR = rangeRow("Volumen general", 0, 1, 0.05, AudioSystem.prefs.master, (v) => AudioSystem.setVolume("master", v));
    const musicR = rangeRow("M\xFAsica ambiente", 0, 1, 0.05, AudioSystem.prefs.music, (v) => AudioSystem.setVolume("music", v));
    const sfxR = rangeRow("Efectos", 0, 1, 0.05, AudioSystem.prefs.sfx, (v) => AudioSystem.setVolume("sfx", v));
    const muteR = toggleRow("Silenciar todo", AudioSystem.prefs.muted, (on) => AudioSystem.setMuted(on));
    let notifBtn;
    notifBtn = btn(
      NotificationsSystem.permission === "granted" ? "Notificaciones activadas" : "Activar notificaciones",
      async () => {
        const res = await NotificationsSystem.requestPermission();
        if (res === "granted") {
          Config.set("notifications", true);
          notifBtn.disabled = true;
          notifBtn.querySelector("span:last-child").textContent = "Notificaciones activadas";
          toast("Notificaciones activadas", { type: "success" });
        } else if (res === "denied") toast("El navegador ha bloqueado las notificaciones.");
        else toast("Notificaciones no disponibles en este navegador.");
      },
      { disabled: NotificationsSystem.permission === "granted" }
    );
    let restBtn;
    restBtn = btn(state.modes.descanso ? "Desactivar modo descanso" : "Activar modo descanso", () => {
      state.modes.descanso = !state.modes.descanso;
      restBtn.querySelector("span:last-child").textContent = state.modes.descanso ? "Desactivar modo descanso" : "Activar modo descanso";
      persist();
      toast(state.modes.descanso ? "Modo descanso activado" : "Modo descanso desactivado");
    });
    let vacBtn;
    vacBtn = btn(state.modes.vacaciones ? "Terminar vacaciones" : "Activar modo vacaciones", () => {
      state.modes.vacaciones = !state.modes.vacaciones;
      state.modes.vacacionesDesde = state.modes.vacaciones ? Date.now() : 0;
      vacBtn.querySelector("span:last-child").textContent = state.modes.vacaciones ? "Terminar vacaciones" : "Activar modo vacaciones";
      persist();
      toast(state.modes.vacaciones ? "Modo vacaciones activado" : "Modo vacaciones desactivado");
    });
    const node = h("div", { class: "view" }, [
      h("h1", { class: "screen-title" }, "Configuraci\xF3n"),
      panel("Apariencia", [themeSel, contrastSel, motionSel, glitchSel, fontRow]),
      panel("Tiempo y sue\xF1o", [speedSel, sleepRow]),
      panel("Sonido", [masterR, musicR, sfxR, muteR]),
      panel("Notificaciones", [h("p", { class: "hint" }, "Solo funcionan con la app abierta o reci\xE9n cerrada; es una app est\xE1tica sin servidor de avisos."), notifBtn]),
      panel("Modos de cuidado", [h("p", { class: "hint" }, "El modo descanso ralentiza el deterioro; el de vacaciones casi lo congela."), h("div", { class: "row" }, [restBtn, vacBtn])])
    ]);
    return { node, title: "Configuraci\xF3n" };
  }
  function profilesView(ctx3) {
    const { save, reloadInto, deleteProfile, currentSlot } = ctx3;
    const host = h("div", { class: "stack" });
    async function paint() {
      host.innerHTML = "";
      const list = await save.listProfiles();
      for (let slot = 0; slot < 3; slot++) {
        const p = Array.isArray(list) ? list.find((x) => x?.slot === slot) : null;
        if (p && p.state) {
          const c = p.state.creature;
          host.appendChild(panel(`Ranura ${slot + 1}${slot === currentSlot ? " \xB7 activa" : ""}`, [
            h("p", {}, `${c?.name || "Entidad"} \xB7 ${p.state.discovered?.length || 0} formas descubiertas`),
            h("p", { class: "muted" }, `\xDAltima sesi\xF3n: ${formatDate(p.state.lastTs || p.updatedAt || Date.now())}`),
            h("div", { class: "row" }, [
              slot !== currentSlot ? btn("Cargar", () => reloadInto(slot), { primary: true }) : null,
              btn("Borrar", async () => {
                if (await confirmModal("Borrar partida", "\xBFSeguro? Esta acci\xF3n no se puede deshacer.", { danger: true, confirmLabel: "Borrar" })) {
                  await deleteProfile(slot);
                  toast("Partida borrada");
                  if (slot !== currentSlot) paint();
                }
              }, { danger: true })
            ])
          ]));
        } else {
          host.appendChild(panel(`Ranura ${slot + 1} \xB7 vac\xEDa`, [
            btn("Crear nueva partida aqu\xED", () => {
              location.hash = `#/nueva?slot=${slot}`;
            }, { primary: true })
          ]));
        }
      }
    }
    paint().catch((error) => {
      console.error(error);
      host.replaceChildren(empty("No se pudieron cargar las ranuras de partida."));
    });
    const node = h("div", { class: "view" }, [h("h1", { class: "screen-title" }, "Partidas"), host]);
    return { node, title: "Partidas" };
  }
  function backupView(ctx3) {
    const { state, save, currentSlot, applyImport } = ctx3;
    const exportBtn = btn("Exportar partida (JSON)", () => {
      const json = save.exportProfile(state, currentSlot);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `entidad404-slot${currentSlot + 1}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
      toast("Copia exportada", { type: "success" });
    }, { primary: true });
    const fileInput = h("input", { type: "file", accept: "application/json", class: "sr-only", id: "import-file" });
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const check = validateExport(text);
        if (!check.ok) {
          toast(`Copia no v\xE1lida: ${check.error}`);
          return;
        }
        if (await confirmModal("Importar partida", "Esto sobrescribir\xE1 la partida activa. \xBFContinuar?", { danger: true, confirmLabel: "Importar" })) {
          await applyImport(check.state);
          toast("Partida importada", { type: "success" });
        }
      } catch (err) {
        toast("No se pudo leer el archivo.");
      }
      fileInput.value = "";
    });
    const importBtn = btn("Importar partida (JSON)", () => fileInput.click());
    const node = h("div", { class: "view" }, [
      h("h1", { class: "screen-title" }, "Copias de seguridad"),
      panel(null, [
        h("p", { class: "hint" }, "Las copias incluyen una suma de verificaci\xF3n para detectar archivos corruptos. Todo se guarda en tu dispositivo."),
        h("div", { class: "row" }, [exportBtn, importBtn, fileInput])
      ])
    ]);
    return { node, title: "Copias de seguridad" };
  }
  function privacyView() {
    const node = h("div", { class: "view" }, [
      h("h1", { class: "screen-title" }, "Privacidad"),
      panel(null, [
        h("p", {}, "Entidad 404 funciona por completo en tu dispositivo. No hay cuentas, ni servidores, ni anal\xEDtica."),
        h("ul", { class: "bullet" }, [
          h("li", {}, "Tu progreso se guarda localmente (IndexedDB) y nunca sale de tu navegador."),
          h("li", {}, "No se recopila ning\xFAn dato personal ni de uso."),
          h("li", {}, "Las notificaciones, si las activas, son locales y opcionales."),
          h("li", {}, "No hay compras reales: Fragmentos y Ecos son monedas del juego."),
          h("li", {}, "Puedes exportar o borrar tus datos cuando quieras desde Copias de seguridad y Partidas.")
        ])
      ])
    ]);
    return { node, title: "Privacidad" };
  }
  function selectRow(label, options, value, onChange) {
    const sel = h(
      "select",
      { class: "field-input", onchange: (e) => onChange(e.target.value) },
      options.map((o) => {
        const opt = h("option", { value: o.v }, o.l);
        if (o.v === value) opt.selected = true;
        return opt;
      })
    );
    return h("label", { class: "field" }, [h("span", { class: "field-label" }, label), sel]);
  }
  function toggleRow(label, checked, onChange) {
    const input = h("input", { type: "checkbox", class: "switch-input" });
    input.checked = checked;
    input.addEventListener("change", (e) => onChange(e.target.checked));
    return h("label", { class: "switch-row" }, [h("span", {}, label), input, h("span", { class: "switch-track", "aria-hidden": "true" })]);
  }
  function rangeRow(label, min, max, step, value, onChange) {
    const out = h("output", { class: "range-out" }, String(Math.round(value * 100) / 100));
    const input = h("input", { type: "range", min, max, step, value, class: "field-range" });
    input.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      out.textContent = String(Math.round(v * 100) / 100);
      onChange(v);
    });
    return h("label", { class: "field" }, [h("span", { class: "field-label" }, label), h("div", { class: "row" }, [input, out])]);
  }
  function numberRow(label, min, max, value, onChange) {
    const input = h("input", { type: "number", min, max, value, class: "field-input num" });
    input.addEventListener("change", (e) => {
      let v = parseInt(e.target.value, 10);
      if (isNaN(v)) v = min;
      v = Math.max(min, Math.min(max, v));
      e.target.value = v;
      onChange(v);
    });
    return h("label", { class: "field" }, [h("span", { class: "field-label" }, label), input]);
  }

  // js/views/onboarding.js
  function newGameView(ctx3) {
    const { params, createGame } = ctx3;
    const slot = params?.slot != null ? parseInt(params.slot, 10) : null;
    let chosenCore = "prisma";
    let lifeMode = "vinculo";
    const nameInput = h("input", { type: "text", maxlength: "16", class: "field-input", placeholder: "Nombre de tu entidad", "aria-label": "Nombre de tu entidad" });
    const coreCards = h("div", { class: "core-choices" }, Object.values(CORES).map((core) => {
      const card = h("button", { class: `core-choice${core.id === chosenCore ? " active" : ""}`, type: "button", onclick: () => {
        chosenCore = core.id;
        coreCards.querySelectorAll(".core-choice").forEach((el2) => el2.classList.remove("active"));
        card.classList.add("active");
      } }, [
        h("div", { class: "core-thumb" }, [renderThumb(`nucleo_${core.id}`, { discovered: true })]),
        h("div", { class: "core-name" }, core.nombre),
        h("div", { class: "core-desc muted" }, core.desc)
      ]);
      return card;
    }));
    const modeCards = h("div", { class: "chip-row" }, [
      modeChip("vinculo", "V\xEDnculo", "Tu entidad te acompa\xF1a sin final: al envejecer entra en suspensi\xF3n y puedes reactivarla.", () => lifeMode = "vinculo", true),
      modeChip("legado", "Legado", "Ciclo de vida completo: cuando su tiempo llega, deja un legado y comienzas con una nueva.", () => lifeMode = "legado", false)
    ]);
    function modeChip(id, label, desc, onSel, active2) {
      const chip = h("button", { class: `mode-chip${active2 ? " active" : ""}`, type: "button", onclick: () => {
        lifeMode = id;
        modeCards.querySelectorAll(".mode-chip").forEach((e) => e.classList.remove("active"));
        chip.classList.add("active");
      } }, [h("strong", {}, label), h("span", { class: "muted" }, desc)]);
      return chip;
    }
    const createBtn = btn("Inicializar entidad", async () => {
      const name = sanitizeName(nameInput.value) || "Entidad";
      createBtn.disabled = true;
      try {
        await createGame({ name, core: chosenCore, lifeMode, slot });
      } catch (error) {
        console.error(error);
        toast("No se pudo crear la partida. Revisa el almacenamiento del navegador.");
        createBtn.disabled = false;
      }
    }, { primary: true, cls: "lg" });
    const node = h("div", { class: "view onboarding" }, [
      h("section", { class: "onboarding-hero" }, [h("span", { class: "hero-eyebrow" }, "PROTOCOLO DE INICIALIZACI\xD3N"), h("h1", { class: "screen-title" }, "Crea una entidad imposible"), h("p", { class: "screen-lead" }, "Elige su n\xFAcleo, define el tipo de v\xEDnculo y observa c\xF3mo cada decisi\xF3n altera su personalidad y evoluci\xF3n."), h("div", { class: "hero-badges" }, [h("span", {}, "7 familias"), h("span", {}, "Evoluci\xF3n din\xE1mica"), h("span", {}, "100% local")])]),
      panel("Elige un n\xFAcleo", [
        h("p", { class: "hint" }, "Cada n\xFAcleo tiene afinidades distintas y abre caminos de evoluci\xF3n diferentes."),
        coreCards
      ]),
      panel("Ponle nombre", nameInput),
      panel("Modo de vida", modeCards),
      h("div", { class: "onboarding-actions" }, [createBtn])
    ]);
    return { node, title: "Nueva partida" };
  }

  // js/app.js
  var App = class {
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
      this.bootPromise = this.performBoot().catch((error) => {
        this.bootPromise = null;
        throw error;
      });
      return this.bootPromise;
    }
    async performBoot() {
      Config.load();
      Config.apply();
      AudioSystem.init();
      NotificationsSystem.init(Config.get("notifications"));
      this.bindAudioUnlock();
      this.registerRoutes();
      this.refreshRouterContext();
      bus.on("creature:birthday", ({ weeks }) => {
        toast(`\u{1F382} \xA1Cumplea\xF1os semanal! ${weeks} semana${weeks === 1 ? "" : "s"} de v\xEDnculo.`, { type: "success" });
        this.persist();
      });
      const configuredSlot = Number(Config.get("lastProfileSlot"));
      const lastSlot = Number.isInteger(configuredSlot) && configuredSlot >= 0 && configuredSlot < MAX_PROFILES ? configuredSlot : null;
      let loaded = false;
      if (lastSlot != null) loaded = await this.loadSlot(lastSlot, { silent: true });
      if (!loaded) {
        const list = await SaveManager.listProfiles().catch((error) => {
          console.warn("No se pudieron enumerar las partidas.", error);
          return [];
        });
        const existing = Array.isArray(list) ? list.find((profile) => profile?.state) : null;
        if (existing?.slot != null) loaded = await this.loadSlot(existing.slot, { silent: true });
      }
      if (!this.state && location.hash !== "#/nueva") location.hash = "#/nueva";
      await initRouter();
      this.bindLifecycle();
      this.reportStorageFallback();
      return true;
    }
    bindAudioUnlock() {
      const unlock = () => {
        AudioSystem.unlock();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
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
      document.addEventListener("visibilitychange", this.onVisibilityChange);
      window.addEventListener("pagehide", this.onPageHide);
      window.addEventListener("beforeunload", this.onBeforeUnload);
    }
    registerRoutes() {
      if (this.routesRegistered) return;
      this.routesRegistered = true;
      registerRoute("#/habitat", habitatView);
      registerRoute("#/necesidades", needsView);
      registerRoute("#/alimentar", feedView);
      registerRoute("#/higiene", healthView);
      registerRoute("#/juegos", gamesView);
      registerRoute("#/tienda", shopView);
      registerRoute("#/inventario", inventoryView);
      registerRoute("#/decoracion", decorView);
      registerRoute("#/archivo", archiveView);
      registerRoute("#/diario", diaryView);
      registerRoute("#/logros", achievementsView);
      registerRoute("#/evoluciones", evolutionsView);
      registerRoute("#/config", configView);
      registerRoute("#/partidas", profilesView);
      registerRoute("#/copias", backupView);
      registerRoute("#/privacidad", privacyView);
      registerRoute("#/mas", moreView);
      registerRoute("#/nueva", newGameView);
    }
    refreshRouterContext() {
      setRouterContext({
        state: this.state,
        engine: this.engine,
        save: SaveManager,
        currentSlot: this.currentSlot,
        persist: () => this.persist(),
        createGame: (options) => this.createGame(options),
        reloadInto: (slot) => this.loadSlot(slot).then((ok) => {
          if (ok) navigate("#/habitat");
          return ok;
        }),
        applyImport: (state) => this.applyImport(state),
        deleteProfile: (slot) => this.deleteProfile(slot)
      });
    }
    async createGame({ name, core, lifeMode, slot }) {
      let safeSlot = Number(slot);
      if (!Number.isInteger(safeSlot) || safeSlot < 0 || safeSlot >= MAX_PROFILES) {
        const list = await SaveManager.listProfiles().catch(() => []);
        safeSlot = null;
        for (let candidate = 0; candidate < MAX_PROFILES; candidate++) {
          const occupied = Array.isArray(list) && list.some((profile) => profile?.slot === candidate && profile?.state);
          if (!occupied) {
            safeSlot = candidate;
            break;
          }
        }
        if (safeSlot == null) throw new Error("No hay ranuras libres. Borra una partida antes de crear otra.");
      }
      const state = createProfile({ name, core, lifeMode });
      this.setActive(state, safeSlot);
      await SaveManager.saveProfile(safeSlot, state);
      Config.set("lastProfileSlot", safeSlot);
      this.trackDailyActive();
      toast(`${name} comienza a formarse en su n\xFAcleo.`, { type: "success" });
      await navigate("#/habitat");
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
        Config.set("lastProfileSlot", null);
        this.refreshRouterContext();
        await navigate("#/nueva");
      }
      return true;
    }
    async loadSlot(slot, { silent = false } = {}) {
      const safeSlot = Number(slot);
      if (!Number.isInteger(safeSlot) || safeSlot < 0 || safeSlot >= MAX_PROFILES) return false;
      const loaded = await SaveManager.loadProfile(safeSlot).catch((error) => {
        console.warn("No se pudo cargar la partida.", error);
        return null;
      });
      if (!loaded) return false;
      if (loaded?.corrupt) {
        if (!silent) toast("La partida estaba da\xF1ada y no se pudo recuperar.", { type: "error" });
        return false;
      }
      if (!loaded.creature) return false;
      this.setActive(loaded, safeSlot);
      Config.set("lastProfileSlot", safeSlot);
      const { report } = this.engine.simulateAbsence();
      this.trackDailyActive();
      if (report && !silent) this.showAbsenceReport(report);
      await this.persist();
      return true;
    }
    setActive(state, slot) {
      if (!state || typeof state !== "object" || !state.creature) {
        throw new Error("La partida activa no contiene un estado v\xE1lido.");
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
      Config.set("lastProfileSlot", slot);
      await navigate("#/habitat");
    }
    startAutoSave() {
      if (this.saveTimer) clearInterval(this.saveTimer);
      this.saveTimer = setInterval(() => this.persist(), 2e4);
    }
    startEvents() {
      if (this.eventTimer) clearInterval(this.eventTimer);
      this.eventTimer = setInterval(() => {
        if (!this.state) return;
        const event = maybeEvent(this.state);
        if (event) {
          if (event.anim) StateMachine.trigger(event.anim, 1400);
          bus.emit("action:done", { kind: "event", msg: event.text });
          this.persist();
        }
        this.checkUrgentNotifications();
      }, 45e3);
    }
    checkUrgentNotifications() {
      const creature = this.state?.creature;
      if (!creature?.hatched) return;
      if (creature.stats?.hambre < 15) NotificationsSystem.notify("hambre", "Tu entidad tiene hambre", "Vuelve para alimentarla.");
      if (creature.illness) NotificationsSystem.notify("salud", "Tu entidad est\xE1 enferma", "Necesita tratamiento.");
      if (creature.stats?.higiene < 15) NotificationsSystem.notify("higiene", "La c\xE1mara est\xE1 sucia", "Una limpieza le vendr\xEDa bien.");
    }
    trackDailyActive() {
      if (!this.state) return;
      const today = (/* @__PURE__ */ new Date()).toDateString();
      if (this.state._lastActiveDay !== today) {
        this.state._lastActiveDay = today;
        bump(this.state, "dias_activos");
        checkAchievements(this.state);
      }
    }
    showAbsenceReport(report) {
      const rows = [];
      const diff = (key) => Math.round((report.after?.[key] ?? 0) - (report.before?.[key] ?? 0));
      const duration = formatDuration((report.hours || 0) * 36e5);
      rows.push(h("p", {}, `Estuviste fuera ${duration}.`));
      if (report.anomaly) rows.push(h("p", { class: "hint" }, "Se detect\xF3 un salto en el reloj del sistema; el tiempo se contabiliz\xF3 con prudencia y sin penalizaci\xF3n."));
      if (report.becameSick) rows.push(h("p", { class: "warn" }, `Enferm\xF3 de ${report.illnessName || "una dolencia"} mientras no estabas.`));
      if (report.evolved) rows.push(h("p", { class: "good" }, `\xA1Evolucion\xF3 a ${report.evolved.nombre}!`));
      const changes = ["hambre", "energia", "higiene", "felicidad", "salud"].map((key) => `${key}: ${diff(key) > 0 ? "+" : ""}${diff(key)}`).join("  \xB7  ");
      rows.push(h("p", { class: "muted small" }, changes));
      openModal({
        title: "Mientras no estabas",
        body: h("div", { class: "stack" }, rows),
        actions: [{ label: "Continuar", primary: true }]
      });
    }
    reportStorageFallback() {
      const status = SaveManager.getStorageStatus();
      if (status.mode === "localStorage") {
        setTimeout(() => toast("IndexedDB no est\xE1 disponible. Se usa guardado local de compatibilidad.", { ms: 6500 }), 500);
      } else if (status.mode === "memory") {
        setTimeout(() => toast("El navegador bloquea el almacenamiento: el progreso solo durar\xE1 mientras esta pesta\xF1a siga abierta.", { type: "error", ms: 9e3 }), 500);
      }
    }
    async persist() {
      if (!this.state || this.currentSlot == null) return false;
      try {
        await SaveManager.saveProfile(this.currentSlot, this.state);
        return true;
      } catch (error) {
        console.error("No se pudo guardar", error);
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
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        window.removeEventListener("pagehide", this.onPageHide);
        window.removeEventListener("beforeunload", this.onBeforeUnload);
        this.lifecycleBound = false;
      }
    }
  };
  function renderStartupError(error) {
    console.error(error);
    const root = document.getElementById("screen-root");
    if (!root) return;
    root.replaceChildren(h("div", { class: "panel startup-error" }, [
      h("h2", {}, "No se pudo iniciar"),
      h("p", {}, "La aplicaci\xF3n ha detectado un problema de cach\xE9 o almacenamiento y no ha podido completar el arranque."),
      h("p", { class: "muted small" }, error?.message || "Error desconocido."),
      h("div", { class: "row" }, [
        btn("Reintentar", () => location.reload(), { primary: true }),
        btn("Limpiar cach\xE9 de la app", async () => {
          try {
            if ("caches" in window) {
              const keys = await caches.keys();
              await Promise.all(keys.filter((key) => key.startsWith("entidad404-")).map((key) => caches.delete(key)));
            }
            location.reload();
          } catch {
            location.reload();
          }
        })
      ])
    ]));
  }
  var app = new App();
  function bootApplication() {
    return app.boot().catch(renderStartupError);
  }
  if (!globalThis.__E404_DISABLE_AUTOBOOT__) {
    if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootApplication, { once: true });
    else bootApplication();
  }
  if (navigator.serviceWorker?.register && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              toast("Actualizaci\xF3n preparada. Cierra y vuelve a abrir la app para aplicarla con seguridad.", { ms: 8e3 });
            }
          });
        });
      }).catch((error) => console.warn("Service worker no disponible.", error));
    }, { once: true });
  }
})();
