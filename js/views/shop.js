// ENTIDAD 404 — vista Tienda
import { h, panel, walletChip, btn, glyph } from '../ui/dom.js';
import { ITEM_MAP } from '../data/items.js';
import { buy } from '../systems/economy-system.js';
import { checkAchievements } from '../systems/achievements-system.js';
import { addDiary } from '../systems/actions.js';
import { diaryLine } from '../ui/voice.js';
import { priceLabel } from '../models/item.js';
import { toast } from '../ui/toast.js';

const SECTIONS = [
  { title:'Alimentos', filter:(it)=>['comida','bebida'].includes(it.tipo) && it.cat !== 'anomalo' },
  { title:'Medicinas', filter:(it)=>it.tipo==='medicina' },
  { title:'Juguetes', filter:(it)=>it.tipo==='juguete' },
  { title:'Decoración', filter:(it)=>it.tipo==='decoracion' },
  { title:'Evolución', filter:(it)=>it.tipo==='evolutivo' },
  { title:'Cápsulas de Eco', filter:(it)=>it.tipo==='capsula' },
  { title:'Anómalos', filter:(it)=>it.cat==='anomalo' }
];

export function shopView(ctx) {
  const { state, persist } = ctx;
  const walletHost = h('div', {}, [walletChip(state)]);
  function refreshWallet() { walletHost.innerHTML = ''; walletHost.appendChild(walletChip(state)); }

  const host = h('div', { class:'stack' });
  function paint() {
    host.innerHTML = '';
    for (const sec of SECTIONS) {
      const items = Object.entries(ITEM_MAP).filter(([, it]) => sec.filter(it) && (it.precio != null || it.precioEcos != null));
      if (items.length === 0) continue;
      const grid = h('div', { class:'item-grid' }, items.map(([id, it]) => shopCard(id, it, state, () => { refreshWallet(); persist(); })));
      host.appendChild(panel(sec.title, grid));
    }
  }
  paint();

  const node = h('div', { class:'view' }, [
    h('div', { class:'spread' }, [ h('h1', { class:'screen-title' }, 'Tienda'), walletHost ]),
    panel(null, h('p', { class:'hint' }, 'Todo se compra con Fragmentos y Ecos, que se ganan jugando y cuidando. No hay pagos reales.')),
    host
  ]);
  return { node, title:'Tienda' };
}

function shopCard(id, it, state, after) {
  const b = btn(`Comprar · ${priceLabel(it)}`, () => {
    const r = buy(state, id, 1);
    if (!r.ok) { toast(r.reason); return; }
    if (r.capsule) toast(`Cápsula abierta: ${r.won.nombre}`, { type:'success' });
    else { toast(`Comprado: ${it.nombre}`, { type:'success' }); addDiary(state, diaryLine('compra', { item: it.nombre })); }
    for (const a of checkAchievements(state)) toast(`Logro: ${a.nombre}`, { type:'success' });
    after();
  }, { primary:true, cls:'sm' });
  return h('div', { class:`item-card${it.rareza?` rarity-${it.rareza}`:''}` }, [
    h('div', { class:'item-emoji', 'aria-hidden':'true' }, glyph(it.icon)),
    h('div', { class:'item-name' }, it.nombre),
    it.desc ? h('div', { class:'item-desc' }, it.desc) : null,
    b
  ]);
}
