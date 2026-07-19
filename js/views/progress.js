// ENTIDAD 404 — vistas de logros y evoluciones
import { h, panel, empty, glyph } from '../ui/dom.js';
import { ACHIEVEMENTS, ACH_CATS } from '../data/achievements.js';
import { FORMS, FAMILY_LABELS } from '../data/creatures.js';
import { renderThumb } from '../ui/render.js';
import { formHint } from '../systems/evolution-system.js';
import { STAGES } from '../utils/constants.js';

export function achievementsView(ctx) {
  const { state } = ctx;
  const done = state.achievements || {};
  const total = ACHIEVEMENTS.length;
  const unlocked = ACHIEVEMENTS.filter(a => done[a.id]?.done).length;

  const host = h('div', { class:'stack' });
  for (const cat of ACH_CATS) {
    const inCat = ACHIEVEMENTS.filter(a => a.cat === cat.id);
    if (!inCat.length) continue;
    const list = h('div', { class:'ach-list' }, inCat.map(a => {
      const rec = done[a.id] || { done:false, progress:0 };
      const pct = Math.min(100, Math.round((rec.progress || 0) / a.goal * 100));
      return h('div', { class:`achievement${rec.done?' unlocked':''}` }, [
        h('div', { class:'ach-icon', 'aria-hidden':'true' }, rec.done ? glyph(a.icon, '★') : '○'),
        h('div', { class:'ach-body' }, [
          h('div', { class:'ach-name' }, a.nombre),
          h('div', { class:'ach-desc muted' }, a.desc),
          rec.done ? h('div', { class:'ach-status' }, 'Completado') :
            h('div', { class:'ach-progress' }, [ h('span', { class:'ach-progress-fill', style:`width:${pct}%` }) ])
        ]),
        a.reward ? h('div', { class:'ach-reward' }, `${a.reward.fragmentos?`+${a.reward.fragmentos}◆`:''} ${a.reward.ecos?`+${a.reward.ecos}✦`:''}`.trim()) : null
      ]);
    }));
    host.appendChild(panel(`${cat.label} (${inCat.filter(a=>done[a.id]?.done).length}/${inCat.length})`, list));
  }

  const node = h('div', { class:'view' }, [
    h('h1', { class:'screen-title' }, 'Logros'),
    panel(null, h('p', { class:'muted' }, `Desbloqueados ${unlocked} de ${total}.`)),
    host
  ]);
  return { node, title:'Logros' };
}

export function evolutionsView(ctx) {
  const { state } = ctx;
  const discovered = new Set(state.discovered || []);
  const host = h('div', { class:'stack' });
  for (const stage of STAGES) {
    const forms = FORMS.filter(f => f.etapa === stage);
    if (!forms.length) continue;
    const grid = h('div', { class:'evo-grid' }, forms.map(f => {
      const known = discovered.has(f.id);
      return h('div', { class:`evo-node${known?'':' locked'}` }, [
        h('div', { class:'evo-thumb' }, [renderThumb(f.id, { discovered: known })]),
        h('div', { class:'evo-name' }, known ? f.nombre : '???'),
        h('div', { class:'evo-fam muted' }, FAMILY_LABELS[f.familia] || f.familia),
        h('div', { class:'evo-hint hint' }, known ? (f.desc || '') : formHint(f))
      ]);
    }));
    host.appendChild(panel(stageLabel(stage), grid));
  }
  const node = h('div', { class:'view' }, [
    h('h1', { class:'screen-title' }, 'Árbol de evoluciones'),
    panel(null, h('p', { class:'muted' }, 'Las condiciones exactas de las formas secretas quedan a tu descubrimiento.')),
    host
  ]);
  return { node, title:'Evoluciones' };
}
function stageLabel(s){ return ({ nucleo:'Núcleos', recien:'Recién nacidas', cria:'Crías', juvenil:'Juveniles', adulto:'Adultas' })[s] || s; }
