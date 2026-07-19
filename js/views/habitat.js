// ENTIDAD 404 — vista Hábitat (pantalla firma)
import { h, walletChip, btn } from '../ui/dom.js';
import { renderCreature } from '../ui/render.js';
import { computeMood, MOOD_LABELS } from '../systems/mood-system.js';
import { urgencyLevel } from '../systems/needs-system.js';
import { FORM_MAP, FAMILY_LABELS } from '../data/creatures.js';
import { StateMachine } from '../core/state-machine.js';
import { bus } from '../core/event-bus.js';
import { pet, clean, talk, toggleLights, explore } from '../systems/actions.js';
import { toast } from '../ui/toast.js';
import { describeState, announce } from '../ui/accessibility.js';
import { ageLabel, dayPhase } from '../utils/helpers.js';
import { speak } from '../ui/voice.js';
import { chance } from '../utils/random.js';
import { nudgeTrait } from '../systems/personality-system.js';
import { AudioSystem } from '../systems/audio-system.js';

export function habitatView(ctx) {
  const { state, persist } = ctx;
  const c = state.creature;

  const stage = h('div', { class:'creature-stage' });
  const speech = h('div', { class:'speech', role:'status', 'aria-live':'polite' });
  const statusChip = h('div', { class:'status-chip' });
  const clockChip = h('div', { class:'clock-chip' });

  // Suelo con decoración colocada
  const decorLayer = h('div', { class:'decor-layer', 'aria-hidden':'true' });
  renderDecor(decorLayer, state);

  const habitat = h('div', { class:'habitat', dataset:{ phase: dayPhase() } }, [
    h('div', { class:'floor' }),
    decorLayer,
    h('div', { class:'scanlines', 'aria-hidden':'true' }),
    h('div', { class:'vignette', 'aria-hidden':'true' }),
    h('div', { class:'particles', 'aria-hidden':'true' }, particleSet()),
    stage, speech, statusChip, clockChip
  ]);

  let blink = false;
  function paint() {
    const mood = computeMood(c);
    stage.innerHTML = '';
    const svg = renderCreature(c, { mood, blink, anim: StateMachine.active });
    if (StateMachine.active) svg.classList.add(`anim-${StateMachine.active}`);
    stage.appendChild(svg);
    const form = FORM_MAP[c.formId];
    statusChip.textContent = c.hatched ? MOOD_LABELS[mood] || mood : 'Incubando';
    statusChip.className = `status-chip urgency-${urgencyLevel(c.stats, c.illness)}`;
    clockChip.textContent = `${form ? form.nombre : 'Núcleo'} · ${ageLabel(c.birthTs)}`;
    habitat.dataset.phase = dayPhase();
  }

  function say(msg) { speech.textContent = msg; speech.classList.remove('show'); void speech.offsetWidth; speech.classList.add('show'); }

  // Saludo inicial contextual
  setTimeout(() => { if (c.hatched) say(speak(c, 'saludo')); else say('El núcleo late suavemente. Algo se está formando dentro.'); }, 300);

  // Parpadeo
  const blinkTimer = setInterval(() => { if (computeMood(c) === 'dormida') return; blink = true; paint(); setTimeout(() => { blink = false; paint(); }, 160); }, 4200);

  const onTick = () => { paint(); maybeAmbient(); };
  const onAction = ({ msg }) => { if (msg) { say(msg); announce(msg); } paint(); persist(); };
  const onAnim = () => paint();
  bus.on('tick', onTick); bus.on('action:done', onAction);
  bus.on('anim:start', onAnim); bus.on('anim:end', onAnim);
  bus.on('creature:evolved', onEvolved); bus.on('creature:hatched', onHatched);

  function onEvolved({ form }) { StateMachine.trigger('evolve-flash', 1800); toast(`¡Ha evolucionado a ${form.nombre}!`, { type:'success' }); say(speak(c, 'evolucion')); paint(); persist(); }
  function onHatched(form) { toast(`Tu núcleo ha eclosionado: ${form?.nombre || ''}`, { type:'success' }); paint(); persist(); }
  function onBirthday() { StateMachine.trigger('celebrate', 1400); say(speak(c, 'cumple')); paint(); }
  function onSick() { StateMachine.trigger('shiver', 1600); AudioSystem.play('alerta'); say(speak(c, 'enfermo')); paint(); persist(); }
  function onRecovered() { StateMachine.trigger('hop', 1200); say(speak(c, 'curado')); paint(); persist(); }

  // Charla ambiental: humor y ciclo día/noche, con enfriamiento para no saturar
  let lastAmbientTs = 0, lastPhase = dayPhase();
  function maybeAmbient() {
    if (!c.hatched || c.sleeping) return;
    const now = Date.now();
    const phase = dayPhase();
    if (phase !== lastPhase && (phase === 'noche' || phase === 'amanecer')) {
      lastPhase = phase; lastAmbientTs = now;
      say(speak(c, phase));
      return;
    }
    lastPhase = phase;
    if (now - lastAmbientTs < 45000 || !chance(0.2)) return;
    const mood = computeMood(c);
    let ctx = null;
    if (mood === 'triste') { ctx = c.stats.afecto < 30 ? 'solo' : 'triste'; c.personality = nudgeTrait(c.personality, 'timida', 1); AudioSystem.play('triste'); }
    else if (mood === 'hambrienta') ctx = 'hambre';
    else if (mood === 'sucia') ctx = 'sucio';
    else if (mood === 'radiante') ctx = 'feliz';
    if (!ctx) return;
    lastAmbientTs = now;
    say(speak(c, ctx));
  }
  bus.on('creature:birthday', onBirthday);
  bus.on('creature:sick', onSick);
  bus.on('creature:recovered', onRecovered);

  // Interacción directa: tocar a la criatura = acariciar
  stage.addEventListener('click', () => { const r = pet(state); if (!r.ok) toast(r.reason); });
  stage.style.cursor = 'pointer';
  stage.setAttribute('role', 'button');
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('aria-label', 'Acariciar a tu entidad');
  stage.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const r = pet(state); if (!r.ok) toast(r.reason); } });

  let lightBtn;
  const updateLightButton = () => {
    const label = lightBtn?.querySelector('span:last-child');
    const icon = lightBtn?.querySelector('.btn-icon');
    if (label) label.textContent = c.lightsOff ? 'Encender' : 'Apagar luz';
    if (icon) icon.textContent = c.lightsOff ? '☀' : '☾';
  };
  lightBtn = btn(c.lightsOff ? 'Encender' : 'Apagar luz', () => {
    const r = toggleLights(state);
    toast(r.lightsOff ? 'Luces apagadas' : 'Luces encendidas');
    updateLightButton();
  }, { icon:c.lightsOff ? '☀' : '☾' });

  const actions = h('div', { class:'action-grid' }, [
    btn('Acariciar', () => { const r = pet(state); if (!r.ok) toast(r.reason); }, { icon:'♡' }),
    btn('Limpiar', () => { const r = clean(state); if (!r.ok) toast(r.reason); }, { icon:'✦' }),
    btn('Hablar', () => { const r = talk(state); if (!r.ok) toast(r.reason); }, { icon:'◌' }),
    btn('Explorar', () => { const r = explore(state); if (!r.ok) toast(r.reason); }, { icon:'≋' }),
    lightBtn
  ]);

  const srDesc = h('p', { class:'sr-only', 'aria-live':'polite' }, describeState(c));

  const telemetry = h('section', { class:'telemetry-grid', 'aria-label':'Telemetría de la entidad' }, [
    telemetryCard('Vínculo', Math.round(c.stats?.afecto ?? 0), 100, '♡'),
    telemetryCard('Energía', Math.round(c.stats?.energia ?? 0), 100, 'ϟ'),
    telemetryCard('Estabilidad', Math.round(c.stats?.estabilidad ?? 0), 100, '◈'),
    telemetryCard('Higiene', Math.round(c.stats?.higiene ?? 0), 100, '✦')
  ]);
  const node = h('div', { class:'view habitat-view' }, [
    h('div', { class:'habitat-head spread' }, [
      h('div', {}, [h('div', { class:'screen-kicker' }, 'CÁMARA DE CONTENCIÓN'), h('h1', { class:'screen-title' }, c.name || 'Tu entidad'), h('p', { class:'screen-lead compact' }, 'Supervisa su estado, fortalece el vínculo y guía su evolución.')]),
      walletChip(state)
    ]),
    telemetry,
    habitat,
    srDesc,
    h('div', { class:'section-label' }, 'INTERACCIONES DIRECTAS'),
    actions,
    modeBanner(state, () => { c.suspended = false; say(speak(c, 'reactivacion')); toast('Entidad reactivada', { type:'success' }); paint(); persist(); })
  ]);

  paint();

  function cleanup() {
    clearInterval(blinkTimer);
    bus.off('tick', onTick); bus.off('action:done', onAction);
    bus.off('anim:start', onAnim); bus.off('anim:end', onAnim);
    bus.off('creature:evolved', onEvolved); bus.off('creature:hatched', onHatched);
    bus.off('creature:birthday', onBirthday);
    bus.off('creature:sick', onSick);
    bus.off('creature:recovered', onRecovered);
  }
  return { node, cleanup, title:'Cámara' };
}

function particleSet() {
  const arr = [];
  for (let i = 0; i < 8; i++) arr.push(h('span', { class:'particle', style:`left:${8+i*11}%; animation-delay:${i*0.7}s` }));
  return arr;
}

function renderDecor(layer, state) {
  const placed = state.decor || {};
  for (const [slot, itemId] of Object.entries(placed)) {
    if (!itemId) continue;
    layer.appendChild(h('div', { class:`decor-item slot-${slot}`, dataset:{ item:itemId } }));
  }
}

function modeBanner(state, onReactivate) {
  if (state.modes?.vacaciones) return h('div', { class:'mode-banner vac' }, 'Modo vacaciones activo: las necesidades están casi congeladas.');
  if (state.modes?.descanso) return h('div', { class:'mode-banner rest' }, 'Modo descanso: el deterioro es más lento.');
  if (state.creature.suspended) return h('div', { class:'mode-banner susp' }, [ 'Tu entidad está en suspensión. Puedes reactivarla cuando quieras. ', btn('Reactivar', onReactivate, { primary:true, cls:'sm' }) ]);
  return null;
}

function telemetryCard(label, value, max, icon) {
  const safe = Math.max(0, Math.min(max, Number(value) || 0));
  return h('div', { class:'telemetry-card' }, [
    h('span', { class:'telemetry-icon', 'aria-hidden':'true' }, icon),
    h('span', { class:'telemetry-copy' }, [h('small', {}, label), h('strong', {}, `${safe}%`)]),
    h('span', { class:'telemetry-track', 'aria-hidden':'true' }, h('span', { style:`width:${safe}%` }))
  ]);
}
