// ENTIDAD 404 — vista Necesidades (estado detallado)
import { h, panel, statBar, walletChip } from '../ui/dom.js';
import { STAT_LABELS, INVERTED_STATS } from '../utils/constants.js';
import { describePersonality, topTraits } from '../systems/personality-system.js';
import { TRAIT_LABELS } from '../utils/constants.js';
import { FORM_MAP } from '../data/creatures.js';
import { computeMood, MOOD_LABELS } from '../systems/mood-system.js';
import { bus } from '../core/event-bus.js';
import { ageLabel } from '../utils/helpers.js';

export function needsView(ctx) {
  const { state } = ctx;
  const c = state.creature;
  const barsHost = h('div', { class:'stats-list' });

  function paint() {
    barsHost.innerHTML = '';
    for (const [key, label] of Object.entries(STAT_LABELS)) {
      barsHost.appendChild(statBar(key, label, c.stats[key], { inverted: INVERTED_STATS.includes(key) }));
    }
  }
  paint();
  const onTick = () => paint();
  bus.on('tick', onTick);
  bus.on('action:done', onTick);

  const form = FORM_MAP[c.formId];
  const traits = topTraits(c.personality, 4);
  const traitChips = traits.length
    ? h('div', { class:'chip-row' }, traits.map(t => h('span', { class:'chip' }, TRAIT_LABELS?.[t.t] || t.t)))
    : h('p', { class:'empty-note' }, 'Aún sin rasgos marcados.');

  const node = h('div', { class:'view' }, [
    h('div', { class:'spread' }, [ h('h1', { class:'screen-title' }, 'Estado'), walletChip(state) ]),
    panel(null, [
      h('div', { class:'ident-row' }, [
        h('strong', {}, form ? form.nombre : 'Núcleo'),
        h('span', { class:'muted' }, ` · ${MOOD_LABELS[computeMood(c)] || ''} · ${ageLabel(c.birthTs)}`)
      ]),
      barsHost
    ]),
    panel('Personalidad', [
      h('p', {}, describePersonality(c.personality)),
      traitChips
    ])
  ]);

  return { node, cleanup: () => { bus.off('tick', onTick); bus.off('action:done', onTick); }, title:'Estado' };
}
