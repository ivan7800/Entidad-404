// ENTIDAD 404 — estado de ánimo derivado
// Devuelve el ánimo visual dominante para el renderizador y las frases.
export function computeMood(creature) {
  const s = creature.stats;
  if (creature.suspended) return 'suspendida';
  if (!creature.hatched) return 'incubando';
  if (creature.sleeping) return 'dormida';
  if (creature.illness) return 'enferma';
  if (s.hambre < 18) return 'hambrienta';
  if (s.energia < 15) return 'agotada';
  if (s.estres > 80) return 'estresada';
  if (s.felicidad < 25) return 'triste';
  if (s.higiene < 20) return 'sucia';
  if (s.felicidad > 78 && s.energia > 50) return 'radiante';
  if (s.curiosidad > 70) return 'curiosa';
  return 'tranquila';
}

export const MOOD_LABELS = {
  suspendida:'En suspensión', incubando:'Incubando', dormida:'Durmiendo', enferma:'Enferma',
  hambrienta:'Hambrienta', agotada:'Agotada', estresada:'Estresada', triste:'Triste',
  sucia:'Necesita un baño', radiante:'Radiante', curiosa:'Curiosa', tranquila:'Tranquila'
};
