// ENTIDAD 404 — vista Juegos (lanzador de minijuegos)
import { h, panel, walletChip, btn } from '../ui/dom.js';
import { createMemoryGlitch } from '../minigames/memory-glitch.js';
import { createFragmentHunt } from '../minigames/fragment-hunt.js';
import { createSignalBalance } from '../minigames/signal-balance.js';
import { createVoidRunner } from '../minigames/void-runner.js';
import { gameReward } from '../systems/economy-system.js';
import { StateMachine } from '../core/state-machine.js';
import { bump, checkAchievements } from '../systems/achievements-system.js';
import { applyEffects } from '../systems/needs-system.js';
import { AudioSystem } from '../systems/audio-system.js';
import { toast } from '../ui/toast.js';
import { speak, diaryLine } from '../ui/voice.js';
import { addDiary } from '../systems/actions.js';
import { GAME_ENERGY_MAX } from '../utils/constants.js';

const GAMES = [
  { id:'memoria_glitch', nombre:'Memoria Glitch', desc:'Repite la secuencia de símbolos.', base:6, record:'memoria_glitch', factory:createMemoryGlitch },
  { id:'caza_fragmentos', nombre:'Caza de Fragmentos', desc:'Toca los fragmentos, evita los corruptos.', base:5, record:'caza_fragmentos', factory:createFragmentHunt },
  { id:'equilibrio_senal', nombre:'Equilibrio de Señal', desc:'Mantén el punto dentro de la banda.', base:5, record:'equilibrio_senal', factory:createSignalBalance },
  { id:'corredor_vacio', nombre:'Corredor del Vacío', desc:'Esquiva los bloques el mayor tiempo posible.', base:4, record:'corredor_vacio', factory:createVoidRunner }
];

export function gamesView(ctx) {
  const { state, persist } = ctx;
  let active = null;

  const walletHost = h('div', {}, [walletChip(state)]);
  const refreshWallet = () => walletHost.replaceChildren(walletChip(state));
  const energyLabel = h('span', { class:'energy-label' });
  function refreshEnergy() { energyLabel.textContent = `Energía de juego: ${state.gameEnergy}/${GAME_ENERGY_MAX}`; }
  refreshEnergy();

  const list = h('div', { class:'game-list' }, GAMES.map(g => h('div', { class:'game-card' }, [
    h('h3', {}, g.nombre),
    h('p', { class:'muted' }, g.desc),
    h('p', { class:'record' }, `Récord: ${state.records[g.record] || 0}`),
    btn('Jugar', () => launch(g), { primary:true })
  ])));
  let lastGameId = null;

  const arena = h('div', { class:'game-arena', hidden:true });

  function launch(g) {
    if (active) return;
    const lowEnergy = state.gameEnergy <= 0;
    if (lowEnergy) toast('Poca energía: la recompensa será simbólica y tu entidad se cansará.');
    const canvas = h('canvas', { width:340, height:300, class:'game-canvas', 'aria-label':`Minijuego ${g.nombre}` });
    const overlay = h('div', { class:'game-overlay' });
    const stopBtn = btn('Salir', () => finish({ score:0, aborted:true }), { danger:true, cls:'sm' });
    const pauseBtn = btn('Pausa', () => { if (!active) return; if (paused) { active.resume(); pauseBtn.querySelector('span:last-child').textContent='Pausa'; } else { active.pause(); pauseBtn.querySelector('span:last-child').textContent='Seguir'; } paused = !paused; }, { cls:'sm' });
    let paused = false;

    arena.hidden = false; arena.innerHTML = '';
    arena.appendChild(h('div', { class:'game-hud' }, [ h('strong', {}, g.nombre), h('div', { class:'row' }, [pauseBtn, stopBtn]) ]));
    arena.appendChild(canvas);
    arena.appendChild(overlay);
    list.hidden = true;
    AudioSystem.play('juego');

    active = g.factory(canvas, { onEnd: (res) => finish(res) });

    function finish(res) {
      if (active) { active.stop?.(); active = null; }
      arena.hidden = true; list.hidden = false;
      if (res.aborted) return;
      const score = res.score || 0;
      // Récord
      const isRecord = score > (state.records[g.record] || 0);
      if (isRecord) state.records[g.record] = score;
      // Recompensa
      const reward = gameReward(g.base, score, state.gameEnergy);
      state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + reward.fragments);
      state.wallet.ecos = Math.min(99999, state.wallet.ecos + reward.ecos);
      // Consumo de energía y efectos en la mascota
      if (state.gameEnergy > 0) state.gameEnergy -= 1;
      state.gameEnergyTs = Date.now();
      state.creature.stats = applyEffects(state.creature.stats, { felicidad:10, curiosidad:6, energia:-6, estres:-4 });
      state.creature.personality = nudgeTrait(state.creature.personality, 'energica', 1);
      StateMachine.trigger('spin-play', 1100);
      bump(state, 'partidas');
      bump(state, `juego_${g.id}`);
      const unlocked = checkAchievements(state);
      AudioSystem.play('moneda');
      toast(`Puntuación ${score} · +${reward.fragments}◆${reward.ecos?` +${reward.ecos}✦`:''}`, { type:'success' });
      for (const a of unlocked) toast(`Logro: ${a.nombre}`, { type:'success' });
      toast(speak(state.creature, lastGameId === g.id ? 'aburrido_juego' : 'jugar'));
      lastGameId = g.id;
      addDiary(state, isRecord ? diaryLine('record', { juego:g.nombre, valor:score }) : diaryLine('juego', { nombre:state.creature.name, juego:g.nombre }));
      refreshEnergy();
      refreshWallet();
      persist();
      // Actualiza récords mostrados
      const cards = list.querySelectorAll('.game-card .record');
      GAMES.forEach((gg, i) => { if (cards[i]) cards[i].textContent = `Récord: ${state.records[gg.record] || 0}`; });
    }
  }

  const node = h('div', { class:'view' }, [
    h('div', { class:'spread' }, [ h('h1', { class:'screen-title' }, 'Juegos'), walletHost ]),
    panel(null, [ energyLabel, h('p', { class:'hint' }, 'Cada partida consume 1 de energía (se regenera con el tiempo). Sin energía puedes jugar, pero la recompensa baja.') ]),
    arena,
    list
  ]);

  return { node, cleanup: () => { if (active) active.stop?.(); }, title:'Juegos' };
}
