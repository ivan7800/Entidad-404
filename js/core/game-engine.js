// ENTIDAD 404 — motor de juego (orquestador central)
// Une el reloj real, la simulación offline por bloques y todos los sistemas.
import { bus } from './event-bus.js';
import { computeElapsed, splitIntoBlocks, regenGameEnergy, isSleepWindow } from './time-engine.js';
import { applyDecay, applyAura, urgencyLevel } from '../systems/needs-system.js';
import { maybeGetSick } from '../systems/health-system.js';
import { chooseEvolution, nextStage, stageComplete } from '../systems/evolution-system.js';
import { checkAchievements, bump } from '../systems/achievements-system.js';
import { computeMood } from '../systems/mood-system.js';
import { addDiary } from '../systems/actions.js';
import { diaryLine } from '../ui/voice.js';
import { FORM_MAP } from '../data/creatures.js';
import { ITEM_MAP } from '../data/items.js';
import { MAX_OFFLINE_HOURS, TIME_SPEEDS, ILLNESSES, GAME_ENERGY_MAX } from '../utils/constants.js';
import { HOUR, dayPhase } from '../utils/helpers.js';

export class GameEngine {
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
    if (anomaly) { st.anomalies = (st.anomalies || 0) + 1; st.counters = st.counters || {}; st.counters.anomalias = (st.counters.anomalias || 0) + 1; }
    if (elapsedMs <= 0) { st.lastTs = nowTs; return { elapsedMs:0, report:null, anomaly }; }

    const speed = TIME_SPEEDS[st.speed] ?? 1;
    const c = st.creature;
    const before = { ...c.stats };
    const blocks = splitIntoBlocks(st.lastTs, elapsedMs, 24);
    let becameSick = null, evolved = null;

    for (const b of blocks) {
      const sleeping = c.hatched && (c.lightsOff || isSleepWindow(new Date(b.startTs).getHours(), c.sleepHour, c.wakeHour));
      this._trackNight(sleeping, c.sleeping, b.startTs);
      c.sleeping = sleeping;
      c.stats = applyDecay(c.stats, b.hours, {
        sleeping, night: b.night, speed,
        resting: st.modes?.descanso, vacation: st.modes?.vacaciones,
        sickness: !!c.illness
      });
      if (c.hatched) c.stats = applyAura(c.stats, this._decorAura(), b.hours, { sleeping, vacation: st.modes?.vacaciones });
      // Enfermedad (solo si no está de vacaciones)
      if (!becameSick && !st.modes?.vacaciones) {
        const sick = maybeGetSick(c, b.hours * speed);
        if (sick) { c.illness = sick.id; c.illnessUntil = sick.until; becameSick = sick.id; addDiary(st, diaryLine('enfermedad', { nombre:c.name, enfermedad: ILLNESSES[sick.id]?.nombre || sick.id })); }
      }
      // Recuperación de enfermedad por tiempo
      if (c.illness && c.illnessUntil && b.startTs >= c.illnessUntil) {
        c.illness = null; c.illnessUntil = 0;
      }
    }

    // Eclosión offline si el núcleo cumplió su tiempo
    this._maybeHatch(nowTs);
    // Evolución diferida
    evolved = this._maybeEvolve(nowTs);
    // Energía de juego regenerada
    const eg = regenGameEnergy(st.gameEnergy, st.gameEnergyTs, nowTs, GAME_ENERGY_MAX);
    st.gameEnergy = eg.energy; st.gameEnergyTs = eg.ts;

    this._maybeBirthday(nowTs);
    st.lastTs = nowTs;
    checkAchievements(st);

    const hours = elapsedMs / HOUR;
    const report = hours >= 0.05 ? {
      hours, clamped, anomaly,
      before, after: { ...c.stats },
      becameSick, evolved,
      illnessName: becameSick ? ILLNESSES[becameSick]?.nombre : null
    } : null;
    return { elapsedMs, report, anomaly };
  }

  _maybeHatch(nowTs) {
    const c = this.state.creature;
    if (c.hatched || c.stage !== 'nucleo') return false;
    if (stageComplete(c, nowTs, this.state.speed)) {
      c.hatched = true;
      c.stage = 'recien';
      c.birthTs = nowTs;
      const form = chooseEvolution({ ...c, stage:'nucleo' }, this._evoCtx(nowTs)) || FORM_MAP[`recien_${c.core}`];
      if (form) { c.formId = form.id; this._discover(form.id); }
      bump(this.state, 'nacimientos');
      bus.emit('creature:hatched', form);
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
    bump(this.state, 'evoluciones');
    if (form.secreta) bump(this.state, 'secretas');
    if (form.familia === 'mecanica') bump(this.state, 'mecanica_etapas');
    addDiary(this.state, diaryLine('evolucion', { nombre:c.name, forma: form.nombre }));
    bus.emit('creature:evolved', { form, prevStage });
    return form;
  }

  _evoCtx(nowTs) {
    const isNight = dayPhase(new Date(nowTs)) === 'noche';
    const evoItems = new Set();
    for (const [id, quantity] of Object.entries(this.state.inventory || {})) {
      const item = ITEM_MAP[id];
      if (quantity > 0 && item?.tipo === 'evolutivo' && item.familia) evoItems.add(item.familia);
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
      if (!item || item.tipo !== 'decoracion') continue;
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
    bump(st, 'noches');
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
    st.memories.push({ ts: nowTs, text:`🎂 ${c.name} cumple ${weeks} semana${weeks === 1 ? '' : 's'} contigo.`, tone:'feliz' });
    if (st.memories.length > 120) st.memories.shift();
    addDiary(st, diaryLine('cumple', { nombre:c.name, dias: weeks * 7 }));
    checkAchievements(st);
    bus.emit('creature:birthday', { weeks });
    return weeks;
  }

  _discover(formId) {
    if (!this.state.discovered.includes(formId)) {
      this.state.discovered.push(formId);
      bump(this.state, 'descubiertas');
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
      if (now - this.lastLogicTick >= 1000) {
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
      const h = new Date(now).getHours();
      const sleeping = c.lightsOff || isSleepWindow(h, c.sleepHour, c.wakeHour);
      this._trackNight(sleeping, c.sleeping, now);
      c.sleeping = sleeping;
    }
    c.stats = applyDecay(c.stats, hoursDelta, {
      sleeping: c.sleeping, night: dayPhase(new Date(now)) === 'noche',
      speed, resting: st.modes?.descanso, vacation: st.modes?.vacaciones,
      sickness: !!c.illness
    });

    if (c.hatched) c.stats = applyAura(c.stats, this._decorAura(), hoursDelta, { sleeping: c.sleeping, vacation: st.modes?.vacaciones });

    // Enfermedad también en vivo (antes solo podía ocurrir en simulación offline)
    if (c.hatched && !c.illness && !st.modes?.vacaciones) {
      const sick = maybeGetSick(c, hoursDelta * speed);
      if (sick) { c.illness = sick.id; c.illnessUntil = sick.until; addDiary(st, diaryLine('enfermedad', { nombre:c.name, enfermedad: ILLNESSES[sick.id]?.nombre || sick.id })); bus.emit('creature:sick', sick); }
    }

    if (c.illness && c.illnessUntil && now >= c.illnessUntil) { c.illness = null; c.illnessUntil = 0; bus.emit('creature:recovered'); }
    this._maybeHatch(now);
    this._maybeEvolve(now);
    this._maybeBirthday(now);

    const eg = regenGameEnergy(st.gameEnergy, st.gameEnergyTs, now, GAME_ENERGY_MAX);
    st.gameEnergy = eg.energy; st.gameEnergyTs = eg.ts;

    st.lastTs = now;
    bus.emit('tick', { mood: computeMood(c), urgency: urgencyLevel(c.stats, c.illness) });
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}
