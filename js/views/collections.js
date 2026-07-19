// ENTIDAD 404 — vistas secundarias (parte 1)
import { h, panel, walletChip, btn, empty, glyph } from '../ui/dom.js';
import { ITEM_MAP, DECOR_SLOTS } from '../data/items.js';
import { FORMS, FORM_MAP, FAMILY_LABELS, FAMILIES, formsByStage } from '../data/creatures.js';
import { renderThumb } from '../ui/render.js';
import { formHint } from '../systems/evolution-system.js';
import { sell } from '../systems/economy-system.js';
import { bump, checkAchievements } from '../systems/achievements-system.js';
import { addDiary } from '../systems/actions.js';
import { diaryLine } from '../ui/voice.js';
import { openModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { formatDate } from '../utils/helpers.js';
import { STAGES } from '../utils/constants.js';

// ── Inventario ──
export function inventoryView(ctx) {
  const { state, persist } = ctx;
  const host = h('div', { class:'stack' });
  function paint() {
    host.innerHTML = '';
    const entries = Object.entries(state.inventory).map(([id, qty]) => ({ it: ITEM_MAP[id], qty, id })).filter(e => e.it);
    if (entries.length === 0) { host.appendChild(empty('Inventario vacío.')); return; }
    const grid = h('div', { class:'item-grid' }, entries.map(e => h('div', { class:'item-card' }, [
      h('div', { class:'item-emoji', 'aria-hidden':'true' }, glyph(e.it.icon)),
      h('div', { class:'item-name' }, e.it.nombre),
      h('div', { class:'item-qty' }, `×${e.qty}`),
      (e.it.precio && e.it.tipo !== 'capsula') ? btn('Vender', () => { const r = sell(state, e.id, 1); if (!r.ok) toast(r.reason); else { toast(`+${r.value}◆`); persist(); paint(); } }, { cls:'sm' }) : null
    ])));
    host.appendChild(grid);
  }
  paint();
  const node = h('div', { class:'view' }, [
    h('div', { class:'spread' }, [ h('h1', { class:'screen-title' }, 'Inventario'), walletChip(state) ]),
    host
  ]);
  return { node, title:'Inventario' };
}

// ── Decoración ──
export function decorView(ctx) {
  const { state, persist } = ctx;
  const host = h('div', { class:'stack' });
  function paint() {
    host.innerHTML = '';
    for (const slotDef of DECOR_SLOTS) {
      const slot = slotDef.id;
      const owned = Object.keys(state.inventory).map(id => ITEM_MAP[id]).filter(it => it && it.tipo === 'decoracion' && it.slot === slot);
      const current = state.decor[slot];
      const options = h('div', { class:'chip-row' }, [
        h('button', { class:`chip${!current?' active':''}`, onclick:() => { delete state.decor[slot]; persist(); paint(); } }, 'Vacío'),
        ...owned.map(it => h('button', { class:`chip${current===itId(it)?' active':''}`, onclick:() => {
          const id = itId(it);
          if (state.decor[slot] !== id) {
            state.decor[slot] = id;
            bump(state, 'decoraciones');
            addDiary(state, diaryLine('decoracion', { item: it.nombre }));
            if (slot === 'reliquia') bump(state, 'reliquias');
            for (const a of checkAchievements(state)) toast(`Protocolo desbloqueado: ${a.nombre}`, { type:'success' });
          }
          persist(); paint();
        } }, it.nombre))
      ]);
      host.appendChild(panel(`Ranura: ${slotDef.label}`, owned.length ? options : empty('Sin decoración para esta ranura. Compra en la tienda.')));
    }
  }
  function itId(it) { for (const [id, v] of Object.entries(ITEM_MAP)) if (v === it) return id; return null; }
  paint();
  const node = h('div', { class:'view' }, [
    h('div', { class:'spread' }, [ h('h1', { class:'screen-title' }, 'Decoración'), walletChip(state) ]),
    panel(null, h('p', { class:'hint' }, 'Coloca objetos en la cámara. Algunas decoraciones mejoran el ánimo con el tiempo.')),
    host
  ]);
  return { node, title:'Decoración' };
}

// ── Archivo de criaturas (dex) ──
export function archiveView(ctx) {
  const { state } = ctx;
  const discovered = new Set(state.discovered || []);
  const discoveredFamilies = new Set(FORMS.filter(f => discovered.has(f.id)).map(f => f.familia));
  const famRow = h('div', { class:'chip-row' }, FAMILIES.map(fam => h('span', { class:`chip${discoveredFamilies.has(fam)?' active':''}` },
    discoveredFamilies.has(fam) ? FAMILY_LABELS[fam] : '????'
  )));
  const host = h('div', { class:'stack' });
  for (const stage of STAGES) {
    const forms = formsByStage(stage);
    if (!forms.length) continue;
    const grid = h('div', { class:'dex-grid' }, forms.map(f => {
      const known = discovered.has(f.id);
      const card = h('button', { class:`dex-card${known?'':' unknown'}`, onclick:() => openForm(f, known) }, [
        h('div', { class:'dex-thumb' }, [renderThumb(f.id, { discovered: known })]),
        h('div', { class:'dex-name' }, known ? f.nombre : '???')
      ]);
      return card;
    }));
    host.appendChild(panel(stageLabel(stage) + ` (${forms.filter(f=>discovered.has(f.id)).length}/${forms.length})`, grid));
  }
  function openForm(f, known) {
    openModal({
      title: known ? f.nombre : 'Forma no descubierta',
      body: (() => {
        const box = h('div', { class:'dex-detail' }, [
          h('div', { class:'dex-detail-thumb' }, [renderThumb(f.id, { discovered: known })]),
          known ? h('p', {}, f.desc || '') : h('p', { class:'muted' }, 'Aún no la has visto en tu cámara.'),
          h('p', { class:'muted' }, `Etapa: ${stageLabel(f.etapa)} · Familia: ${FAMILY_LABELS[f.familia] || f.familia}`),
          h('p', { class:'hint' }, formHint(f))
        ]);
        return box;
      })()
    });
  }
  const total = FORMS.length;
  const node = h('div', { class:'view' }, [
    h('h1', { class:'screen-title' }, 'Archivo de criaturas'),
    panel(null, h('p', { class:'muted' }, `Descubiertas ${discovered.size} de ${total} formas.`)),
    panel('Familias registradas', [ h('p', { class:'hint' }, 'El archivo sospecha que existen más familias de las conocidas al nacer.'), famRow ]),
    host
  ]);
  return { node, title:'Archivo' };
}
function stageLabel(s){ return ({ nucleo:'Núcleos', recien:'Recién nacidas', cria:'Crías', juvenil:'Juveniles', adulto:'Adultas' })[s] || s; }

// ── Diario ──
export function diaryView(ctx) {
  const { state } = ctx;
  const entries = [...(state.diary || [])].reverse();
  const memories = [...(state.memories || [])].reverse().slice(0, 40);
  const node = h('div', { class:'view' }, [
    h('h1', { class:'screen-title' }, 'Diario'),
    panel('Entradas del diario', entries.length
      ? h('div', { class:'diary-list' }, entries.map(e => h('div', { class:'diary-entry' }, [
          h('time', { class:'diary-date' }, formatDate(e.ts)),
          h('p', {}, e.text)
        ])))
      : empty('El diario aún está en blanco. Se irá escribiendo solo con lo que viváis.')),
    panel('Recuerdos recientes', memories.length
      ? h('ul', { class:'memory-list' }, memories.map(m => h('li', { class:`mem-${m.tone||'neutral'}` }, m.text)))
      : empty('Sin recuerdos todavía.'))
  ]);
  return { node, title:'Diario' };
}
