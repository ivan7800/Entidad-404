// ENTIDAD 404 — vistas de sistema (config, partidas, copias, privacidad, más)
import { h, panel, btn, empty } from '../ui/dom.js';
import { MORE_LINKS } from '../ui/navigation.js';
import { Config } from '../config.js';
import { AudioSystem } from '../systems/audio-system.js';
import { NotificationsSystem } from '../systems/notifications-system.js';
import { THEMES, TIME_SPEEDS } from '../utils/constants.js';
import { confirmModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { formatDate } from '../utils/helpers.js';
import { validateExport } from '../utils/validators.js';
import { speak } from '../ui/voice.js';

// ── Menú Más ──
export function moreView() {
  const node = h('div', { class:'view' }, [
    h('div', { class:'screen-kicker' }, 'CENTRO DE CONTROL'), h('h1', { class:'screen-title' }, 'Sistema 404'), h('p', { class:'screen-lead' }, 'Gestiona el vínculo, el archivo biológico y todos los protocolos locales de la simulación.'),
    h('nav', { class:'more-list', 'aria-label':'Secciones adicionales' },
      MORE_LINKS.map(l => h('a', { class:'more-link', href:l.hash }, [ h('span', { class:'more-icon', 'aria-hidden':'true' }, l.icon), h('span', { class:'more-copy' }, [h('strong', {}, l.label), h('small', {}, l.desc)]), h('span', { class:'chev', 'aria-hidden':'true' }, '›') ]))
    )
  ]);
  return { node, title:'Más' };
}

// ── Configuración ──
export function configView(ctx) {
  const { state, persist, engine } = ctx;
  const cfg = Config.all();

  const themeSel = selectRow('Tema visual', THEMES.map(t => ({ v:t.id, l:t.label })), cfg.theme, (v) => { Config.set('theme', v); });
  const contrastSel = toggleRow('Alto contraste', cfg.contrast === 'high', (on) => Config.set('contrast', on ? 'high' : 'normal'));
  const motionSel = toggleRow('Reducir animaciones', cfg.motion === 'off', (on) => Config.set('motion', on ? 'off' : 'auto'));
  const glitchSel = toggleRow('Efecto glitch', cfg.glitch === 'on', (on) => Config.set('glitch', on ? 'on' : 'off'));
  const fontRow = rangeRow('Tamaño de texto', 0.9, 1.4, 0.05, cfg.fontscale, (v) => Config.set('fontscale', v));

  const speedSel = selectRow('Ritmo del tiempo',
    Object.keys(TIME_SPEEDS).map(k => ({ v:k, l: k.charAt(0).toUpperCase()+k.slice(1) })), state.speed,
    (v) => { state.speed = v; persist(); });

  const sleepRow = h('div', { class:'field-row' }, [
    numberRow('Hora de dormir', 0, 23, state.creature.sleepHour, (v)=>{ state.creature.sleepHour = v; persist(); }),
    numberRow('Hora de despertar', 0, 23, state.creature.wakeHour, (v)=>{ state.creature.wakeHour = v; persist(); })
  ]);

  // Audio
  const masterR = rangeRow('Volumen general', 0, 1, 0.05, AudioSystem.prefs.master, (v)=>AudioSystem.setVolume('master', v));
  const musicR = rangeRow('Música ambiente', 0, 1, 0.05, AudioSystem.prefs.music, (v)=>AudioSystem.setVolume('music', v));
  const sfxR = rangeRow('Efectos', 0, 1, 0.05, AudioSystem.prefs.sfx, (v)=>AudioSystem.setVolume('sfx', v));
  const muteR = toggleRow('Silenciar todo', AudioSystem.prefs.muted, (on)=>AudioSystem.setMuted(on));

  // Notificaciones
  let notifBtn;
  notifBtn = btn(
    NotificationsSystem.permission === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones',
    async () => {
      const res = await NotificationsSystem.requestPermission();
      if (res === 'granted') {
        Config.set('notifications', true);
        notifBtn.disabled = true;
        notifBtn.querySelector('span:last-child').textContent = 'Notificaciones activadas';
        toast('Notificaciones activadas', { type:'success' });
      } else if (res === 'denied') toast('El navegador ha bloqueado las notificaciones.');
      else toast('Notificaciones no disponibles en este navegador.');
    },
    { disabled: NotificationsSystem.permission === 'granted' }
  );

  // Modos
  let restBtn;
  restBtn = btn(state.modes.descanso ? 'Desactivar modo descanso' : 'Activar modo descanso', () => {
    state.modes.descanso = !state.modes.descanso;
    restBtn.querySelector('span:last-child').textContent = state.modes.descanso ? 'Desactivar modo descanso' : 'Activar modo descanso';
    persist();
    toast(state.modes.descanso ? 'Modo descanso activado' : 'Modo descanso desactivado');
  });
  let vacBtn;
  vacBtn = btn(state.modes.vacaciones ? 'Terminar vacaciones' : 'Activar modo vacaciones', () => {
    state.modes.vacaciones = !state.modes.vacaciones;
    state.modes.vacacionesDesde = state.modes.vacaciones ? Date.now() : 0;
    vacBtn.querySelector('span:last-child').textContent = state.modes.vacaciones ? 'Terminar vacaciones' : 'Activar modo vacaciones';
    persist();
    toast(speak(state.creature, state.modes.vacaciones ? 'vacaciones_inicio' : 'vacaciones_fin'));
  });

  const node = h('div', { class:'view' }, [
    h('h1', { class:'screen-title' }, 'Configuración'),
    panel('Apariencia', [themeSel, contrastSel, motionSel, glitchSel, fontRow]),
    panel('Tiempo y sueño', [speedSel, sleepRow]),
    panel('Sonido', [masterR, musicR, sfxR, muteR]),
    panel('Notificaciones', [ h('p', { class:'hint' }, 'Solo funcionan con la app abierta o recién cerrada; es una app estática sin servidor de avisos.'), notifBtn ]),
    panel('Modos de cuidado', [ h('p', { class:'hint' }, 'El modo descanso ralentiza el deterioro; el de vacaciones casi lo congela.'), h('div', { class:'row' }, [restBtn, vacBtn]) ])
  ]);
  return { node, title:'Configuración' };
}

// ── Partidas (3 ranuras) ──
export function profilesView(ctx) {
  const { save, reloadInto, deleteProfile, currentSlot } = ctx;
  const host = h('div', { class:'stack' });
  async function paint() {
    host.innerHTML = '';
    const list = await save.listProfiles();
    for (let slot = 0; slot < 3; slot++) {
      const p = Array.isArray(list) ? list.find(x => x?.slot === slot) : null;
      if (p && p.state) {
        const c = p.state.creature;
        host.appendChild(panel(`Ranura ${slot+1}${slot===currentSlot?' · activa':''}`, [
          h('p', {}, `${c?.name || 'Entidad'} · ${p.state.discovered?.length||0} formas descubiertas`),
          h('p', { class:'muted' }, `Última sesión: ${formatDate(p.state.lastTs||p.updatedAt||Date.now())}`),
          h('div', { class:'row' }, [
            slot!==currentSlot ? btn('Cargar', () => reloadInto(slot), { primary:true }) : null,
            btn('Borrar', async () => { if (await confirmModal('Borrar partida', '¿Seguro? Esta acción no se puede deshacer.', { danger:true, confirmLabel:'Borrar' })) { await deleteProfile(slot); toast('Partida borrada'); if (slot !== currentSlot) paint(); } }, { danger:true })
          ])
        ]));
      } else {
        host.appendChild(panel(`Ranura ${slot+1} · vacía`, [
          btn('Crear nueva partida aquí', () => { location.hash = `#/nueva?slot=${slot}`; }, { primary:true })
        ]));
      }
    }
  }
  paint().catch(error => { console.error(error); host.replaceChildren(empty('No se pudieron cargar las ranuras de partida.')); });
  const node = h('div', { class:'view' }, [ h('h1', { class:'screen-title' }, 'Partidas'), host ]);
  return { node, title:'Partidas' };
}

// ── Copias de seguridad ──
export function backupView(ctx) {
  const { state, save, currentSlot, applyImport } = ctx;

  const exportBtn = btn('Exportar partida (JSON)', () => {
    const json = save.exportProfile(state, currentSlot);
    const blob = new Blob([json], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `entidad404-slot${currentSlot+1}-${Date.now()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Copia exportada', { type:'success' });
  }, { primary:true });

  const fileInput = h('input', { type:'file', accept:'application/json', class:'sr-only', id:'import-file' });
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const check = validateExport(text);
      if (!check.ok) { toast(`Copia no válida: ${check.error}`); return; }
      if (await confirmModal('Importar partida', 'Esto sobrescribirá la partida activa. ¿Continuar?', { danger:true, confirmLabel:'Importar' })) {
        await applyImport(check.state);
        toast('Partida importada', { type:'success' });
      }
    } catch (err) { toast('No se pudo leer el archivo.'); }
    fileInput.value = '';
  });
  const importBtn = btn('Importar partida (JSON)', () => fileInput.click());

  const node = h('div', { class:'view' }, [
    h('h1', { class:'screen-title' }, 'Copias de seguridad'),
    panel(null, [
      h('p', { class:'hint' }, 'Las copias incluyen una suma de verificación para detectar archivos corruptos. Todo se guarda en tu dispositivo.'),
      h('div', { class:'row' }, [exportBtn, importBtn, fileInput])
    ])
  ]);
  return { node, title:'Copias de seguridad' };
}

// ── Privacidad ──
export function privacyView() {
  const node = h('div', { class:'view' }, [
    h('h1', { class:'screen-title' }, 'Privacidad'),
    panel(null, [
      h('p', {}, 'Entidad 404 funciona por completo en tu dispositivo. No hay cuentas, ni servidores, ni analítica.'),
      h('ul', { class:'bullet' }, [
        h('li', {}, 'Tu progreso se guarda localmente (IndexedDB) y nunca sale de tu navegador.'),
        h('li', {}, 'No se recopila ningún dato personal ni de uso.'),
        h('li', {}, 'Las notificaciones, si las activas, son locales y opcionales.'),
        h('li', {}, 'No hay compras reales: Fragmentos y Ecos son monedas del juego.'),
        h('li', {}, 'Puedes exportar o borrar tus datos cuando quieras desde Copias de seguridad y Partidas.')
      ])
    ])
  ]);
  return { node, title:'Privacidad' };
}

// ── helpers de formulario ──
function selectRow(label, options, value, onChange) {
  const sel = h('select', { class:'field-input', onchange:(e)=>onChange(e.target.value) },
    options.map(o => { const opt = h('option', { value:o.v }, o.l); if (o.v===value) opt.selected = true; return opt; }));
  return h('label', { class:'field' }, [ h('span', { class:'field-label' }, label), sel ]);
}
function toggleRow(label, checked, onChange) {
  const input = h('input', { type:'checkbox', class:'switch-input' });
  input.checked = checked;
  input.addEventListener('change', (e)=>onChange(e.target.checked));
  return h('label', { class:'switch-row' }, [ h('span', {}, label), input, h('span', { class:'switch-track', 'aria-hidden':'true' }) ]);
}
function rangeRow(label, min, max, step, value, onChange) {
  const out = h('output', { class:'range-out' }, String(Math.round(value*100)/100));
  const input = h('input', { type:'range', min, max, step, value, class:'field-range' });
  input.addEventListener('input', (e)=>{ const v = parseFloat(e.target.value); out.textContent = String(Math.round(v*100)/100); onChange(v); });
  return h('label', { class:'field' }, [ h('span', { class:'field-label' }, label), h('div', { class:'row' }, [input, out]) ]);
}
function numberRow(label, min, max, value, onChange) {
  const input = h('input', { type:'number', min, max, value, class:'field-input num' });
  input.addEventListener('change', (e)=>{ let v = parseInt(e.target.value,10); if (isNaN(v)) v = min; v = Math.max(min, Math.min(max, v)); e.target.value = v; onChange(v); });
  return h('label', { class:'field' }, [ h('span', { class:'field-label' }, label), input ]);
}
