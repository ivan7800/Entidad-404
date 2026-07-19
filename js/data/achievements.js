// ENTIDAD 404 — 40 logros
// counter: clave de state.counters que alimenta el progreso · goal: objetivo
// reward: { fragmentos, ecos }
export const ACHIEVEMENTS = [
  // ── Cuidado (7) ──
  { id:'primera_comida', cat:'cuidado', nombre:'Primer bocado', desc:'Alimenta a tu criatura por primera vez.', counter:'comidas', goal:1, reward:{ fragmentos:10 }, icon:'bowl' },
  { id:'cien_comidas', cat:'cuidado', nombre:'Cocina del umbral', desc:'Sirve 100 comidas.', counter:'comidas', goal:100, reward:{ fragmentos:60, ecos:1 }, icon:'feast' },
  { id:'primer_bano', cat:'cuidado', nombre:'Reluciente', desc:'Baña a tu criatura por primera vez.', counter:'banos', goal:1, reward:{ fragmentos:10 }, icon:'drop' },
  { id:'limpieza_experta', cat:'cuidado', nombre:'Cámara impecable', desc:'Limpia el hábitat 30 veces.', counter:'limpiezas', goal:30, reward:{ fragmentos:40 }, icon:'sparkle' },
  { id:'primera_cura', cat:'cuidado', nombre:'Primeros auxilios', desc:'Cura una enfermedad.', counter:'curas', goal:1, reward:{ fragmentos:15 }, icon:'med' },
  { id:'medico_umbral', cat:'cuidado', nombre:'Médico del umbral', desc:'Supera 5 enfermedades.', counter:'curas', goal:5, reward:{ fragmentos:50, ecos:1 }, icon:'med' },
  { id:'buen_dormir', cat:'cuidado', nombre:'Guardián del sueño', desc:'Acuesta a tu criatura 20 noches.', counter:'noches', goal:20, reward:{ fragmentos:35 }, icon:'moon' },

  // ── Evolución (5) ──
  { id:'eclosion', cat:'evolucion', nombre:'Eclosión', desc:'Presencia el nacimiento de tu criatura.', counter:'nacimientos', goal:1, reward:{ fragmentos:20 }, icon:'egg' },
  { id:'primera_evolucion', cat:'evolucion', nombre:'Primer cambio', desc:'Alcanza la etapa de cría.', counter:'evoluciones', goal:1, reward:{ fragmentos:25 }, icon:'spark' },
  { id:'juvenil_logro', cat:'evolucion', nombre:'Crecer duele bonito', desc:'Alcanza la etapa juvenil.', counter:'evoluciones', goal:2, reward:{ fragmentos:40 }, icon:'spark' },
  { id:'adulto_logro', cat:'evolucion', nombre:'Forma plena', desc:'Alcanza la forma adulta.', counter:'evoluciones', goal:3, reward:{ fragmentos:80, ecos:2 }, icon:'crown' },
  { id:'forma_secreta', cat:'evolucion', nombre:'Más allá del archivo', desc:'Descubre una forma secreta.', counter:'secretas', goal:1, reward:{ fragmentos:120, ecos:3 }, icon:'question' },
  { id:'mecanica_primera', cat:'evolucion', nombre:'Piezas encastradas', desc:'Evoluciona hacia la familia Mecánica por primera vez.', counter:'mecanica_etapas', goal:1, reward:{ fragmentos:25 }, icon:'spark' },
  { id:'mecanica_adulta', cat:'evolucion', nombre:'Relojería viva', desc:'Alcanza una forma adulta de la familia Mecánica.', counter:'mecanica_etapas', goal:3, reward:{ fragmentos:90, ecos:2 }, icon:'crown' },

  // ── Exploración (5) ──
  { id:'primer_evento', cat:'exploracion', nombre:'Algo se mueve', desc:'Presencia un evento especial.', counter:'eventos', goal:1, reward:{ fragmentos:10 }, icon:'eye' },
  { id:'diez_eventos', cat:'exploracion', nombre:'Testigo del umbral', desc:'Presencia 10 eventos especiales.', counter:'eventos', goal:10, reward:{ fragmentos:40 }, icon:'eye' },
  { id:'primer_sueno', cat:'exploracion', nombre:'¿Qué soñará?', desc:'Tu criatura tiene su primer sueño.', counter:'suenos', goal:1, reward:{ fragmentos:12 }, icon:'moon' },
  { id:'explorador', cat:'exploracion', nombre:'Expedición interna', desc:'Envía a tu criatura a explorar 15 veces.', counter:'exploraciones', goal:15, reward:{ fragmentos:45 }, icon:'compass' },
  { id:'grieta', cat:'exploracion', nombre:'La grieta', desc:'Descubre una grieta en la cámara.', counter:'grietas', goal:1, reward:{ ecos:1 }, icon:'crack' },

  // ── Minijuegos (6) ──
  { id:'primer_juego', cat:'minijuegos', nombre:'Hora de jugar', desc:'Completa un minijuego.', counter:'partidas', goal:1, reward:{ fragmentos:10 }, icon:'gamepad' },
  { id:'memoria_10', cat:'minijuegos', nombre:'Memoria de cristal', desc:'Alcanza nivel 10 en Memoria Glitch.', record:'memoria_glitch', goal:10, reward:{ fragmentos:50, ecos:1 }, icon:'brain' },
  { id:'fragmentos_30', cat:'minijuegos', nombre:'Recolector', desc:'Consigue 30 puntos en Caza de Fragmentos.', record:'caza_fragmentos', goal:30, reward:{ fragmentos:50, ecos:1 }, icon:'shard' },
  { id:'senal_20', cat:'minijuegos', nombre:'Pulso firme', desc:'Aguanta 20 s de racha en Equilibrio de Señal.', record:'equilibrio_senal', goal:20, reward:{ fragmentos:50, ecos:1 }, icon:'wave' },
  { id:'corredor_500', cat:'minijuegos', nombre:'Correr el vacío', desc:'Alcanza 500 puntos en Corredor del Vacío.', record:'corredor_vacio', goal:500, reward:{ fragmentos:50, ecos:1 }, icon:'run' },
  { id:'cien_partidas', cat:'minijuegos', nombre:'Sala recreativa', desc:'Juega 100 partidas.', counter:'partidas', goal:100, reward:{ fragmentos:100, ecos:2 }, icon:'gamepad' },

  // ── Colección (6) ──
  { id:'primera_compra', cat:'coleccion', nombre:'Cliente del umbral', desc:'Compra tu primer objeto.', counter:'compras', goal:1, reward:{ fragmentos:8 }, icon:'bag' },
  { id:'coleccionista', cat:'coleccion', nombre:'Coleccionista', desc:'Posee 15 objetos distintos a la vez.', counter:'objetos_distintos', goal:15, reward:{ fragmentos:60 }, icon:'box' },
  { id:'decorador', cat:'coleccion', nombre:'Interiorista', desc:'Coloca 5 decoraciones.', counter:'decoraciones', goal:5, reward:{ fragmentos:40 }, icon:'lamp' },
  { id:'primera_capsula', cat:'coleccion', nombre:'Sorpresa', desc:'Abre una cápsula de eco.', counter:'capsulas', goal:1, reward:{ fragmentos:15 }, icon:'capsule' },
  { id:'archivo_10', cat:'coleccion', nombre:'Archivista', desc:'Descubre 10 formas en el archivo.', counter:'descubiertas', goal:10, reward:{ fragmentos:70, ecos:1 }, icon:'book' },
  { id:'reliquia_logro', cat:'coleccion', nombre:'Sin puerta', desc:'Coloca una reliquia en la cámara.', counter:'reliquias', goal:1, reward:{ ecos:1 }, icon:'key' },

  // ── Vínculo (5) ──
  { id:'primera_caricia', cat:'vinculo', nombre:'Contacto', desc:'Acaricia a tu criatura por primera vez.', counter:'caricias', goal:1, reward:{ fragmentos:8 }, icon:'heart' },
  { id:'cien_caricias', cat:'vinculo', nombre:'Lenguaje propio', desc:'Acaricia a tu criatura 100 veces.', counter:'caricias', goal:100, reward:{ fragmentos:60 }, icon:'heart' },
  { id:'afecto_alto', cat:'vinculo', nombre:'Inseparables', desc:'Alcanza 90 de afecto.', stat:'afecto', goal:90, reward:{ fragmentos:70, ecos:1 }, icon:'heart' },
  { id:'charlas', cat:'vinculo', nombre:'Conversaciones', desc:'Habla con tu criatura 50 veces.', counter:'charlas', goal:50, reward:{ fragmentos:45 }, icon:'chat' },
  { id:'cumple', cat:'vinculo', nombre:'Feliz vuelta al núcleo', desc:'Celebra un cumpleaños semanal.', counter:'cumples', goal:1, reward:{ fragmentos:30, ecos:1 }, icon:'cake' },

  // ── Secretos (3) ──
  { id:'anomalia_vista', cat:'secretos', nombre:'No estaba ahí antes', desc:'Registra una anomalía temporal.', counter:'anomalias', goal:1, reward:{ ecos:1 }, icon:'question' },
  { id:'medianoche', cat:'secretos', nombre:'Hora bruja', desc:'Visita a tu criatura entre las 3 y las 4 de la madrugada.', counter:'madrugadas', goal:1, reward:{ ecos:1 }, icon:'moon' },
  { id:'nombre_404', cat:'secretos', nombre:'Meta-anomalía', desc:'Un secreto para quien nombra las cosas por su origen.', counter:'nombre404', goal:1, reward:{ ecos:2 }, icon:'question' },

  // ── Constancia (3) ──
  { id:'tres_dias', cat:'constancia', nombre:'Tres amaneceres', desc:'Cuida a tu criatura durante 3 días distintos.', counter:'dias_activos', goal:3, reward:{ fragmentos:30 }, icon:'sun' },
  { id:'siete_dias', cat:'constancia', nombre:'Semana del umbral', desc:'Cuida a tu criatura durante 7 días distintos.', counter:'dias_activos', goal:7, reward:{ fragmentos:60, ecos:1 }, icon:'sun' },
  { id:'treinta_dias', cat:'constancia', nombre:'Habitante permanente', desc:'Cuida a tu criatura durante 30 días distintos.', counter:'dias_activos', goal:30, reward:{ fragmentos:200, ecos:5 }, icon:'crown' }
];

export const ACH_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
export const ACH_CATS = [
  { id:'cuidado', label:'Cuidado' }, { id:'evolucion', label:'Evolución' }, { id:'exploracion', label:'Exploración' },
  { id:'minijuegos', label:'Minijuegos' }, { id:'coleccion', label:'Colección' }, { id:'vinculo', label:'Vínculo' },
  { id:'secretos', label:'Secretos' }, { id:'constancia', label:'Constancia' }
];
