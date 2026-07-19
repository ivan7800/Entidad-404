// ENTIDAD 404 — constantes globales
export const APP_VERSION = '1.0.3';
export const SAVE_SCHEMA_VERSION = 1;
export const DB_NAME = 'entidad404';
export const DB_STORE = 'profiles';
export const DB_META = 'meta';
export const MAX_PROFILES = 3;

export const STATS = ['hambre','energia','higiene','felicidad','salud','afecto','disciplina','estres','curiosidad','estabilidad'];

// Estadísticas donde "alto = mal".
export const INVERTED_STATS = ['estres'];

export const STAT_LABELS = {
  hambre: 'Saciedad', energia: 'Energía', higiene: 'Higiene', felicidad: 'Felicidad',
  salud: 'Salud', afecto: 'Afecto', disciplina: 'Disciplina', estres: 'Estrés',
  curiosidad: 'Curiosidad', estabilidad: 'Estabilidad'
};

export const STAGES = ['nucleo','recien','cria','juvenil','adulto'];
export const STAGE_LABELS = { nucleo:'Núcleo', recien:'Recién nacido', cria:'Cría', juvenil:'Juvenil', adulto:'Forma adulta' };

// Duración de etapas en horas de juego (velocidad Normal)
export const STAGE_HOURS = { nucleo: 0.05, recien: 24, cria: 72, juvenil: 168 };

export const TIME_SPEEDS = { relajada: 0.6, normal: 1, intensa: 1.6 };

// Máximo de tiempo offline simulado (horas)
export const MAX_OFFLINE_HOURS = 72;
// Salto temporal sospechoso: reloj hacia atrás más de este margen (ms)
export const CLOCK_BACK_TOLERANCE_MS = 2 * 60 * 1000;

export const CORES = {
  prisma: { id:'prisma', nombre:'Núcleo Prisma', desc:'Refracta la luz en patrones imposibles. Late con curiosidad.', afinidad:'curiosidad' },
  abisal: { id:'abisal', nombre:'Núcleo Abisal', desc:'Frío al tacto, profundo como una señal perdida. Late con calma.', afinidad:'estabilidad' },
  ferrita: { id:'ferrita', nombre:'Núcleo Ferrita', desc:'Denso, magnético, obstinado. Late con determinación.', afinidad:'disciplina' }
};

export const TRAITS = ['afectuosa','curiosa','rebelde','serena','timida','dormilona','energica','glotona','disciplinada','caotica','protectora','misteriosa'];
export const TRAIT_LABELS = {
  afectuosa:'Afectuosa', curiosa:'Curiosa', rebelde:'Rebelde', serena:'Serena',
  timida:'Tímida', dormilona:'Dormilona', energica:'Enérgica', glotona:'Glotona',
  disciplinada:'Disciplinada', caotica:'Caótica', protectora:'Protectora', misteriosa:'Misteriosa'
};

export const THEMES = [
  { id:'oled', label:'U404 OLED' },
  { id:'terminal', label:'Terminal verde' },
  { id:'ambar', label:'CRT ámbar' },
  { id:'abismo', label:'Abismo azul' },
  { id:'biolab', label:'Biolaboratorio' },
  { id:'noir', label:'Cyber-noir' },
  { id:'minimal', label:'Minimal oscuro' }
];

export const ILLNESSES = {
  fiebre_senal: { id:'fiebre_senal', nombre:'Fiebre de señal', causa:'Estrés alto y descanso insuficiente.', sintomas:'Tiembla, sus colores oscilan y evita jugar.', medicina:'med_estabilizador', duracionH: 10 },
  saturacion_nucleo: { id:'saturacion_nucleo', nombre:'Saturación de núcleo', causa:'Exceso de snacks y alimentos densos.', sintomas:'Se mueve despacio y rechaza comida.', medicina:'med_purgante', duracionH: 8 },
  parasito_pixel: { id:'parasito_pixel', nombre:'Parásito de píxel', causa:'Higiene baja durante demasiado tiempo.', sintomas:'Pequeños cuadros oscuros recorren su cuerpo.', medicina:'med_antiparasito', duracionH: 12 },
  fatiga_memoria: { id:'fatiga_memoria', nombre:'Fatiga de memoria', causa:'Falta de sueño acumulada.', sintomas:'Parpadea lento y olvida rutinas.', medicina:'med_reposo', duracionH: 9 },
  inestabilidad_fase: { id:'inestabilidad_fase', nombre:'Inestabilidad de fase', causa:'Estabilidad muy baja.', sintomas:'Su silueta parpadea entre dos posiciones.', medicina:'med_anclaje', duracionH: 14 },
  alergia_sintetica: { id:'alergia_sintetica', nombre:'Alergia sintética', causa:'Reacción a un alimento anómalo.', sintomas:'Se rasca y estornuda chispas.', medicina:'med_antialergico', duracionH: 6 }
};

export const LIFE_MODES = { vinculo:'vinculo', legado:'legado' };
export const GAME_ENERGY_MAX = 5; // energía de juego (límite suave de minijuegos)
