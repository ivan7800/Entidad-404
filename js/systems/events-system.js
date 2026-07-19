// ENTIDAD 404 — eventos aleatorios
// Se evalúan de vez en cuando; aplican efectos suaves y dejan recuerdo/diario.
import { chance, pick } from '../utils/random.js';
import { applyEffects } from './needs-system.js';
import { bump } from './achievements-system.js';
import { nudgeTrait } from './personality-system.js';
import { dayPhase } from '../utils/helpers.js';
import { dream } from '../ui/voice.js';

const hasDecor = (state, id) => Object.values(state.decor || {}).includes(id);

export const EVENTS = [
  // ── Hallazgos y economía ──
  { id:'fragmento_perdido', peso:3, cond:(c)=>c.hatched, run(state){ state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + 5); return { text:'Encontró un fragmento suelto rodando por la cámara. +5◆', tone:'feliz', counter:'exploraciones', anim:'hop' }; } },
  { id:'eco_404', peso:2, cond:(c)=>c.hatched, run(state){ state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + 2); return { text:'Un eco perdido se disipó y dejó caer 2 fragmentos. +2◆', tone:'raro', counter:'exploraciones' }; } },
  { id:'hallazgo_dulce', peso:2, cond:(c)=>(c.personality?.glotona||0) > 35, run(state){ state.creature.stats = applyEffects(state.creature.stats,{hambre:4,felicidad:5}); return { text:'Encontró una chispa dulce que había escondido y olvidado. Doble alegría.', tone:'feliz', anim:'chomp' }; } },

  // ── Sueños ──
  { id:'sueno_curioso', peso:2, cond:(c)=>c.sleeping, run(state){ state.creature.stats = applyEffects(state.creature.stats,{estres:-6,felicidad:4}); return { text:`${state.creature.name} ${dream()}. Despertó más tranquila.`, tone:'neutral', counter:'suenos' }; } },
  { id:'mal_sueno', peso:1, cond:(c)=>c.sleeping && c.stats.estres > 50, run(state){ state.creature.stats = applyEffects(state.creature.stats,{estres:4,felicidad:-3}); return { text:'Un mal sueño la hizo temblar. Se calmó al recordar que no está sola.', tone:'malo', counter:'suenos', anim:'shiver' }; } },

  // ── Anomalías y umbral ──
  { id:'grieta_señal', peso:1, cond:(c)=>c.hatched, run(state){ state.creature.stats = applyEffects(state.creature.stats,{estabilidad:-8,curiosidad:6}); state.creature.personality = nudgeTrait(state.creature.personality, 'caotica', 2); return { text:'Una grieta de señal parpadeó en la pared. Le fascinó y le inquietó a partes iguales.', tone:'raro', counter:'grietas', anim:'glitch-hit' }; } },
  { id:'vision_nocturna', peso:2, cond:(c)=>dayPhase()==='noche'&&c.hatched&&!c.sleeping, run(state){ state.creature.stats = applyEffects(state.creature.stats,{curiosidad:8}); return { text:'Se quedó mirando el vacío de madrugada, como si viera algo que tú no puedes.', tone:'raro', counter:'madrugadas' }; } },
  { id:'polvo_estelar', peso:2, cond:(c)=>dayPhase()==='noche'&&c.hatched&&!c.sleeping, run(state){ state.creature.stats = applyEffects(state.creature.stats,{curiosidad:4,felicidad:3}); return { text:'Motas de polvo brillante entraron de ninguna parte. Intentó cazarlas todas.', tone:'feliz', counter:'madrugadas', anim:'hop' }; } },

  // ── Afinidad de núcleo ──
  { id:'baile_estatica', peso:2, cond:(c)=>c.hatched&&c.core==='prisma', run(state){ state.creature.stats = applyEffects(state.creature.stats,{felicidad:5}); return { text:'Refractó la luz de la cámara en mil colores diminutos. Aplaudió su propia obra.', tone:'feliz', anim:'wiggle' }; } },
  { id:'marea_interna', peso:2, cond:(c)=>c.hatched&&c.core==='abisal', run(state){ state.creature.stats = applyEffects(state.creature.stats,{estres:-6,estabilidad:3}); return { text:'Una marea lenta la recorrió por dentro. Se quedó en calma profunda.', tone:'neutral' }; } },
  { id:'iman_juguete', peso:2, cond:(c)=>c.hatched&&c.core==='ferrita', run(state){ state.creature.stats = applyEffects(state.creature.stats,{curiosidad:6}); return { text:'Todos los objetos metálicos de la cámara se giraron hacia ella un segundo.', tone:'raro' }; } },

  // ── Decoración colocada ──
  { id:'radio_fantasma', peso:2, cond:(c,state)=>c.hatched&&hasDecor(state,'deco_maquina_radio'), run(state){ state.creature.stats = applyEffects(state.creature.stats,{felicidad:6,curiosidad:4}); return { text:'La radio sintonizó una emisora que dejó de emitir hace décadas. Bailó un poco.', tone:'feliz', anim:'wiggle' }; } },
  { id:'planta_pixel', peso:2, cond:(c,state)=>c.hatched&&hasDecor(state,'deco_planta_helecho'), run(state){ state.creature.stats = applyEffects(state.creature.stats,{salud:3,felicidad:3}); return { text:'El helecho digital creció un píxel. Lo celebró como un triunfo personal.', tone:'feliz' }; } },
  { id:'ventana_vacio', peso:1, cond:(c,state)=>c.hatched&&hasDecor(state,'deco_pared_ventana'), run(state){ state.creature.stats = applyEffects(state.creature.stats,{curiosidad:7,estabilidad:-3}); return { text:'Pasó un rato mirando por la ventana al vacío. Algo le devolvió la mirada.', tone:'raro', anim:'glitch-hit' }; } },
  { id:'llave_susurro', peso:1, cond:(c,state)=>c.hatched&&hasDecor(state,'deco_reliquia_llave'), run(state){ state.creature.stats = applyEffects(state.creature.stats,{estabilidad:4,curiosidad:5}); return { text:'La llave sin puerta vibró un instante. Ella asintió, como si entendiera.', tone:'raro' }; } },
  { id:'musgo_siesta', peso:2, cond:(c,state)=>c.hatched&&!c.sleeping&&hasDecor(state,'deco_suelo_musgo'), run(state){ state.creature.stats = applyEffects(state.creature.stats,{estres:-5,felicidad:2}); return { text:'Se tumbó en la alfombra de musgo y ronroneó en binario.', tone:'feliz' }; } },

  // ── Estado de ánimo y cuerpo ──
  { id:'buen_animo', peso:3, cond:(c)=>c.hatched&&c.stats.felicidad>70, run(state){ state.creature.stats = applyEffects(state.creature.stats,{afecto:5}); return { text:'Dio un pequeño salto de alegría sin motivo aparente.', tone:'feliz', anim:'hop' }; } },
  { id:'estirones', peso:2, cond:(c)=>c.hatched&&!c.sleeping&&c.stats.energia>75, run(state){ state.creature.stats = applyEffects(state.creature.stats,{energia:-4,felicidad:4}); return { text:'Le sobraba energía: corrió en círculos hasta marearse un poco.', tone:'feliz', anim:'hop' }; } },
  { id:'picor_datos', peso:2, cond:(c)=>c.hatched&&c.stats.higiene<40, run(state){ state.creature.stats = applyEffects(state.creature.stats,{felicidad:-3}); return { text:'Algo le picaba entre los datos. Un baño no le vendría mal.', tone:'malo', anim:'shake' }; } },
  { id:'eco_recuerdo', peso:2, cond:(c,state)=>state.memories.length>3, run(state){ return { text:'Pareció recordar algo de vuestra historia juntos.', tone:'neutral' }; } }
];

export function maybeEvent(state) {
  const c = state.creature;
  if (c.suspended || !c.hatched) return null;
  if (!chance(0.04)) return null; // baja probabilidad por evaluación
  const pool = EVENTS.filter(e => { try { return e.cond(c, state); } catch { return false; } });
  if (!pool.length) return null;
  // selección ponderada simple
  const total = pool.reduce((s,e)=>s+e.peso,0);
  let r = Math.random()*total, chosen = pool[0];
  for (const e of pool) { r -= e.peso; if (r <= 0) { chosen = e; break; } }
  const res = chosen.run(state);
  bump(state, 'eventos');
  if (res.counter) bump(state, res.counter);
  state.memories.push({ ts:Date.now(), text:res.text, tone:res.tone||'neutral' });
  if (state.memories.length > 120) state.memories.shift();
  return res;
}
