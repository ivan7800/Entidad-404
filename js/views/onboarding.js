// ENTIDAD 404 — creación de partida (onboarding)
import { h, panel, btn } from '../ui/dom.js';
import { CORES } from '../utils/constants.js';
import { renderThumb } from '../ui/render.js';
import { sanitizeName } from '../utils/validators.js';
import { toast } from '../ui/toast.js';

export function newGameView(ctx) {
  const { params, createGame } = ctx;
  const slot = params?.slot != null ? parseInt(params.slot, 10) : null;

  let chosenCore = 'prisma';
  let lifeMode = 'vinculo';

  const nameInput = h('input', { type:'text', maxlength:'16', class:'field-input', placeholder:'Nombre de tu entidad', 'aria-label':'Nombre de tu entidad' });

  const coreCards = h('div', { class:'core-choices' }, Object.values(CORES).map(core => {
    const card = h('button', { class:`core-choice${core.id===chosenCore?' active':''}`, type:'button', onclick:() => {
      chosenCore = core.id;
      coreCards.querySelectorAll('.core-choice').forEach(el => el.classList.remove('active'));
      card.classList.add('active');
    } }, [
      h('div', { class:'core-thumb' }, [renderThumb(`nucleo_${core.id}`, { discovered:true })]),
      h('div', { class:'core-name' }, core.nombre),
      h('div', { class:'core-desc muted' }, core.desc)
    ]);
    return card;
  }));

  const modeCards = h('div', { class:'chip-row' }, [
    modeChip('vinculo', 'Vínculo', 'Tu entidad te acompaña sin final: al envejecer entra en suspensión y puedes reactivarla.', () => lifeMode='vinculo', true),
    modeChip('legado', 'Legado', 'Ciclo de vida completo: cuando su tiempo llega, deja un legado y comienzas con una nueva.', () => lifeMode='legado', false)
  ]);
  function modeChip(id, label, desc, onSel, active) {
    const chip = h('button', { class:`mode-chip${active?' active':''}`, type:'button', onclick:() => {
      lifeMode = id; modeCards.querySelectorAll('.mode-chip').forEach(e=>e.classList.remove('active')); chip.classList.add('active');
    } }, [ h('strong', {}, label), h('span', { class:'muted' }, desc) ]);
    return chip;
  }

  const createBtn = btn('Inicializar entidad', async () => {
    const name = sanitizeName(nameInput.value) || 'Entidad';
    createBtn.disabled = true;
    try {
      await createGame({ name, core: chosenCore, lifeMode, slot });
    } catch (error) {
      console.error(error);
      toast('No se pudo crear la partida. Revisa el almacenamiento del navegador.');
      createBtn.disabled = false;
    }
  }, { primary:true, cls:'lg' });

  const node = h('div', { class:'view onboarding' }, [
    h('section', { class:'onboarding-hero' }, [h('span', { class:'hero-eyebrow' }, 'PROTOCOLO DE INICIALIZACIÓN'), h('h1', { class:'screen-title' }, 'Crea una entidad imposible'), h('p', { class:'screen-lead' }, 'Elige su núcleo, define el tipo de vínculo y observa cómo cada decisión altera su personalidad y evolución.'), h('div', { class:'hero-badges' }, [h('span', {}, '8 familias'), h('span', {}, 'Evolución dinámica'), h('span', {}, '100% local')])]),
    panel('Elige un núcleo', [
      h('p', { class:'hint' }, 'Cada núcleo tiene afinidades distintas y abre caminos de evolución diferentes. Solo se conocen 3 orígenes al nacer — el archivo insinúa que hay más familias, pero nadie sabe cómo se llega a ellas.'),
      coreCards
    ]),
    panel('Ponle nombre', nameInput),
    panel('Modo de vida', modeCards),
    h('div', { class:'onboarding-actions' }, [createBtn])
  ]);
  return { node, title:'Nueva partida' };
}
