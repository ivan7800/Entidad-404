// ENTIDAD 404 — personalidad emergente
// Los rasgos se acumulan con las acciones; el dominante emerge con el tiempo.
import { clamp } from '../utils/helpers.js';
import { TRAITS } from '../utils/constants.js';

export function nudgeTrait(personality, trait, amount) {
  if (!TRAITS.includes(trait)) return personality;
  const p = { ...personality };
  p[trait] = clamp((p[trait] || 0) + amount);
  return p;
}

export function dominantTrait(personality) {
  let best = null, bestV = 24; // umbral mínimo para "tener" personalidad
  for (const t of TRAITS) {
    const v = personality[t] || 0;
    if (v > bestV) { best = t; bestV = v; }
  }
  return best;
}

export function topTraits(personality, n = 3) {
  return TRAITS.map(t => ({ t, v: personality[t] || 0 }))
    .filter(e => e.v > 12)
    .sort((a, b) => b.v - a.v)
    .slice(0, n);
}

// Interpretación legible sin exponer la fórmula
export function describePersonality(personality) {
  const dom = dominantTrait(personality);
  if (!dom) return 'Su personalidad aún se está formando. Cada gesto tuyo deja huella.';
  const map = {
    afectuosa:'Busca el contacto y responde con calidez a cada gesto.',
    curiosa:'Investiga todo lo que brilla, suena o no debería estar ahí.',
    rebelde:'Cumple las normas... cuando le apetece. Tiene carácter.',
    serena:'Mantiene la calma incluso cuando la señal tiembla.',
    timida:'Prefiere los rincones y los gestos suaves.',
    dormilona:'Su actividad favorita es la siesta. La segunda, también.',
    energica:'No para quieta. La cámara se le queda pequeña.',
    glotona:'Su núcleo late más rápido a la hora de comer.',
    disciplinada:'Sigue rutinas con orgullo casi militar.',
    caotica:'Impredecible. Ni ella sabe qué hará en cinco minutos.',
    protectora:'Vigila la cámara como si guardara algo valioso. Quizá a ti.',
    misteriosa:'Guarda secretos. Algunos ni siquiera caben en el archivo.'
  };
  return map[dom] || '';
}
