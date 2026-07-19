// ENTIDAD 404 — vista Higiene y Salud
import { h, panel, walletChip, btn, statBar, empty, glyph } from '../ui/dom.js';
import { ITEM_MAP } from '../data/items.js';
import { ILLNESSES } from '../utils/constants.js';
import { clean, medicate } from '../systems/actions.js';
import { toast } from '../ui/toast.js';
import { bus } from '../core/event-bus.js';

export function healthView(ctx) {
  const { state } = ctx;
  const c = state.creature;
  const host = h('div', { class:'stack' });

  function paint() {
    host.innerHTML = '';
    // Higiene
    host.appendChild(panel('Higiene', [
      statBar('higiene', 'Higiene', c.stats.higiene),
      btn('Limpiar la cámara', () => { const r = clean(state); if (!r.ok) toast(r.reason); else paint(); }, { primary:true, icon:'✦' })
    ]));

    // Salud
    const saludKids = [ statBar('salud', 'Salud', c.stats.salud) ];
    if (c.illness) {
      const ill = ILLNESSES[c.illness];
      saludKids.push(h('div', { class:'illness-box' }, [
        h('strong', {}, `Enferma: ${ill?.nombre || c.illness}`),
        h('p', { class:'muted' }, ill?.sintomas || 'Necesita tratamiento.'),
        ill?.causa ? h('p', { class:'hint' }, `Causa probable: ${ill.causa}`) : null,
        h('p', { class:'hint' }, `Medicina indicada: ${medNameFor(c.illness)}`)
      ]));
    } else {
      saludKids.push(h('p', { class:'ok-note' }, 'Sin dolencias. Se encuentra bien.'));
    }
    host.appendChild(panel('Salud', saludKids));

    // Botiquín
    const meds = Object.entries(state.inventory)
      .map(([id, qty]) => ({ item: ITEM_MAP[id], qty, id }))
      .filter(e => e.item && e.item.tipo === 'medicina');
    const medHost = meds.length
      ? h('div', { class:'item-grid' }, meds.map(m => h('div', { class:'item-card' }, [
          h('div', { class:'item-emoji', 'aria-hidden':'true' }, glyph(m.item.icon, '✚')),
          h('div', { class:'item-name' }, m.item.nombre),
          h('div', { class:'item-qty' }, `×${m.qty}`),
          btn('Usar', () => { const r = medicate(state, m.id); if (!r.ok) toast(r.reason); else { toast('Medicina administrada', { type:'success' }); paint(); } }, { primary:true, cls:'sm' })
        ])))
      : empty('Botiquín vacío. Compra medicinas en la tienda.');
    host.appendChild(panel('Botiquín', medHost));
  }
  paint();
  const onDone = () => paint();
  bus.on('action:done', onDone); bus.on('tick', onDone);

  const node = h('div', { class:'view' }, [
    h('div', { class:'spread' }, [ h('h1', { class:'screen-title' }, 'Salud' ), walletChip(state) ]),
    host
  ]);
  return { node, cleanup: () => { bus.off('action:done', onDone); bus.off('tick', onDone); }, title:'Salud' };
}

function medNameFor(illnessId) {
  for (const it of Object.values(ITEM_MAP)) if (it.tipo === 'medicina' && it.cura === illnessId) return it.nombre;
  return 'desconocida';
}
