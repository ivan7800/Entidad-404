// ENTIDAD 404 — vista Alimentar
import { h, panel, walletChip, btn, empty, glyph } from '../ui/dom.js';
import { ITEM_MAP, FOOD_CATS } from '../data/items.js';
import { feed } from '../systems/actions.js';
import { toast } from '../ui/toast.js';
import { bus } from '../core/event-bus.js';


const FOOD_TYPES = new Set(['comida', 'bebida']);

export function feedView(ctx) {
  const { state } = ctx;
  const host = h('div', { class:'stack' });

  function paint() {
    host.innerHTML = '';
    const foods = Object.entries(state.inventory)
      .map(([id, qty]) => ({ item: ITEM_MAP[id], qty, id }))
      .filter(e => e.item && FOOD_TYPES.has(e.item.tipo));
    if (foods.length === 0) { host.appendChild(empty('No tienes comida. Pásate por la tienda.')); return; }
    for (const catDef of FOOD_CATS) {
      const inCat = foods.filter(f => f.item.cat === catDef.id);
      if (inCat.length === 0) continue;
      const grid = h('div', { class:'item-grid' }, inCat.map(f => foodCard(f, state, paint)));
      host.appendChild(panel(catDef.label, grid));
    }
  }
  paint();
  const onDone = () => paint();
  bus.on('action:done', onDone);

  const node = h('div', { class:'view' }, [
    h('div', { class:'spread' }, [ h('h1', { class:'screen-title' }, 'Nutrir'), walletChip(state) ]),
    host
  ]);
  return { node, cleanup: () => bus.off('action:done', onDone), title:'Nutrir' };
}

function foodCard(f, state, refresh) {
  const c = state.creature;
  const fav = c.prefs.favFood === f.id;
  const hated = c.prefs.hatedFood === f.id;
  return h('div', { class:'item-card' }, [
    h('div', { class:'item-emoji', 'aria-hidden':'true' }, glyph(f.item.icon)),
    h('div', { class:'item-name' }, f.item.nombre),
    fav ? h('span', { class:'tag fav' }, '★ favorita') : hated ? h('span', { class:'tag bad' }, 'no le gusta') : null,
    h('div', { class:'item-qty' }, `×${f.qty}`),
    btn('Dar', () => { const r = feed(state, f.id); if (!r.ok) toast(r.reason); else refresh(); }, { primary:true, cls:'sm' })
  ]);
}
