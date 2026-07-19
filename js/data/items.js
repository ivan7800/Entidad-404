// ENTIDAD 404 — catálogo de objetos
// tipo: comida | bebida | medicina | juguete | decoracion | evolutivo | capsula
// rareza: comun | raro | anomalo
// Efectos: sobre estadísticas 0-100 (positivos o negativos).

export const ITEMS = [
  // ── Nutrientes básicos ──
  { id:'racion_base', tipo:'comida', cat:'basico', nombre:'Ración base', precio:6, rareza:'comun',
    desc:'Bloque nutritivo estándar de la terminal. Aburrido pero completo.',
    fx:{ hambre:+28, felicidad:+2 }, icon:'cube' },
  { id:'papilla_nucleo', tipo:'comida', cat:'basico', nombre:'Papilla de núcleo', precio:8, rareza:'comun',
    desc:'Suave y templada. Ideal para etapas tempranas y estómagos delicados.',
    fx:{ hambre:+22, salud:+4 }, icon:'bowl' },
  { id:'gel_mineral', tipo:'comida', cat:'basico', nombre:'Gel mineral', precio:7, rareza:'comun',
    desc:'Gelatina densa con trazas de ferrita. Cruje un poco.',
    fx:{ hambre:+24, disciplina:+2 }, icon:'gel' },

  // ── Frutas sintéticas ──
  { id:'fruta_prisma', tipo:'comida', cat:'fruta', nombre:'Fruta prisma', precio:12, rareza:'comun',
    desc:'Gajos translúcidos que cambian de color al morderlos.',
    fx:{ hambre:+18, felicidad:+8, curiosidad:+4 }, icon:'fruit' },
  { id:'baya_abisal', tipo:'comida', cat:'fruta', nombre:'Baya abisal', precio:12, rareza:'comun',
    desc:'Fría y jugosa. Sabe a tormenta lejana.',
    fx:{ hambre:+16, estabilidad:+6, felicidad:+5 }, icon:'berry' },
  { id:'citrico_glitch', tipo:'comida', cat:'fruta', nombre:'Cítrico glitch', precio:14, rareza:'raro',
    desc:'A veces el gajo que muerdes no es el que desaparece.',
    fx:{ hambre:+15, felicidad:+9, estabilidad:-3 }, icon:'fruit' },

  // ── Proteínas ──
  { id:'proteina_forja', tipo:'comida', cat:'proteina', nombre:'Proteína de forja', precio:16, rareza:'comun',
    desc:'Filete sintético de alto rendimiento. Favorito de criaturas activas.',
    fx:{ hambre:+34, energia:+6 }, icon:'steak' },
  { id:'nucleos_tostados', tipo:'comida', cat:'proteina', nombre:'Núcleos tostados', precio:18, rareza:'comun',
    desc:'Crujientes por fuera, cálidos por dentro.',
    fx:{ hambre:+30, salud:+5, felicidad:+4 }, icon:'nuts' },

  // ── Snacks ──
  { id:'chispas_dulces', tipo:'comida', cat:'snack', nombre:'Chispas dulces', precio:5, rareza:'comun',
    desc:'Azúcar estelar. Delicioso. Nada nutritivo.',
    fx:{ hambre:+6, felicidad:+14, salud:-2, disciplina:-2 }, icon:'candy' },
  { id:'galleta_datos', tipo:'comida', cat:'snack', nombre:'Galleta de datos', precio:6, rareza:'comun',
    desc:'Lleva un mensaje dentro. Casi nunca es verdad.',
    fx:{ hambre:+8, felicidad:+12, curiosidad:+3, salud:-1, disciplina:-2 }, icon:'cookie' },

  // ── Bebidas ──
  { id:'agua_destilada', tipo:'bebida', cat:'bebida', nombre:'Agua destilada', precio:3, rareza:'comun',
    desc:'Pura, silenciosa, perfecta.',
    fx:{ hambre:+5, salud:+3, estres:-4 }, icon:'flask' },
  { id:'te_senal', tipo:'bebida', cat:'bebida', nombre:'Té de señal', precio:9, rareza:'comun',
    desc:'Infusión tibia que estabiliza las frecuencias internas.',
    fx:{ estres:-12, estabilidad:+5, energia:+3 }, icon:'cup' },
  { id:'chispa_energetica', tipo:'bebida', cat:'bebida', nombre:'Chispa energética', precio:11, rareza:'raro',
    desc:'Despierta hasta a un núcleo dormido. No abusar.',
    fx:{ energia:+22, estres:+6, salud:-2 }, icon:'bolt' },

  // ── Comida especial ──
  { id:'banquete_umbral', tipo:'comida', cat:'especial', nombre:'Banquete del umbral', precio:40, rareza:'raro',
    desc:'Un plato completo servido en vajilla de cristal oscuro.',
    fx:{ hambre:+50, felicidad:+15, afecto:+5 }, icon:'feast' },
  { id:'nectar_aurora', tipo:'comida', cat:'especial', nombre:'Néctar de aurora', precio:36, rareza:'raro',
    desc:'Recogido al amanecer de un servidor abandonado.',
    fx:{ hambre:+20, felicidad:+18, salud:+8, estres:-8 }, icon:'nectar' },

  // ── Alimentos anómalos ──
  { id:'fragmento_dulce', tipo:'comida', cat:'anomalo', nombre:'Fragmento dulce', precio:25, rareza:'anomalo',
    desc:'Sabe distinto cada vez. A veces sabe a un recuerdo tuyo.',
    fx:{ hambre:+15, felicidad:+10, curiosidad:+8, estabilidad:-6 }, icon:'shard', alergia:0.08 },
  { id:'miel_void', tipo:'comida', cat:'anomalo', nombre:'Miel del vacío', precio:30, rareza:'anomalo',
    desc:'Dorada y densa. Cae hacia arriba si no la vigilas.',
    fx:{ hambre:+18, felicidad:+12, curiosidad:+10, estabilidad:-8 }, icon:'honey', alergia:0.1 },

  // ── Medicinas ──
  { id:'med_estabilizador', tipo:'medicina', cat:'medicina', nombre:'Estabilizador térmico', precio:20, rareza:'comun',
    desc:'Trata la fiebre de señal.', cura:'fiebre_senal', fx:{ salud:+10 }, icon:'med' },
  { id:'med_purgante', tipo:'medicina', cat:'medicina', nombre:'Purgante de núcleo', precio:18, rareza:'comun',
    desc:'Trata la saturación de núcleo.', cura:'saturacion_nucleo', fx:{ salud:+8 }, icon:'med' },
  { id:'med_antiparasito', tipo:'medicina', cat:'medicina', nombre:'Barrido antipíxel', precio:22, rareza:'comun',
    desc:'Elimina el parásito de píxel.', cura:'parasito_pixel', fx:{ salud:+10, higiene:+10 }, icon:'med' },
  { id:'med_reposo', tipo:'medicina', cat:'medicina', nombre:'Tónico de reposo', precio:16, rareza:'comun',
    desc:'Trata la fatiga de memoria.', cura:'fatiga_memoria', fx:{ salud:+8, energia:+10 }, icon:'med' },
  { id:'med_anclaje', tipo:'medicina', cat:'medicina', nombre:'Anclaje de fase', precio:26, rareza:'raro',
    desc:'Trata la inestabilidad de fase.', cura:'inestabilidad_fase', fx:{ salud:+8, estabilidad:+15 }, icon:'med' },
  { id:'med_antialergico', tipo:'medicina', cat:'medicina', nombre:'Neutralizador sintético', precio:14, rareza:'comun',
    desc:'Trata la alergia sintética.', cura:'alergia_sintetica', fx:{ salud:+6 }, icon:'med' },

  // ── Juguetes ──
  { id:'pelota_eco', tipo:'juguete', cat:'juguete', nombre:'Pelota de eco', precio:15, rareza:'comun',
    desc:'Rebota devolviendo un sonido distinto cada vez.',
    fx:{ felicidad:+10, energia:-6, afecto:+3 }, icon:'ball' },
  { id:'cinta_mobius', tipo:'juguete', cat:'juguete', nombre:'Cinta de Möbius', precio:22, rareza:'raro',
    desc:'La criatura puede perseguir su borde durante horas.',
    fx:{ felicidad:+12, curiosidad:+8, energia:-8 }, icon:'ribbon' },
  { id:'cubo_arrullo', tipo:'juguete', cat:'juguete', nombre:'Cubo de arrullo', precio:18, rareza:'comun',
    desc:'Vibra con un zumbido suave que invita a dormir.',
    fx:{ estres:-10, energia:+4 }, icon:'cube' },

  // ── Decoración ── (slot: pared, suelo, luz, cama, comedero, planta, maquina, reliquia)
  { id:'deco_pared_circuito', tipo:'decoracion', slot:'pared', nombre:'Mural de circuitos', precio:30, rareza:'comun',
    desc:'Líneas de cobre que a veces parpadean solas.', fx:{ curiosidad:+2 }, icon:'wall' },
  { id:'deco_pared_ventana', tipo:'decoracion', slot:'pared', nombre:'Ventana al vacío', precio:45, rareza:'raro',
    desc:'No da a ninguna parte. Las vistas son magníficas.', fx:{ curiosidad:+3 }, icon:'window' },
  { id:'deco_suelo_musgo', tipo:'decoracion', slot:'suelo', nombre:'Alfombra de musgo', precio:28, rareza:'comun',
    desc:'Blanda, tibia, ligeramente bioluminiscente.', fx:{ felicidad:+2 }, icon:'moss' },
  { id:'deco_luz_lampara', tipo:'decoracion', slot:'luz', nombre:'Lámpara de plasma', precio:35, rareza:'comun',
    desc:'Sigue con su filamento a quien pasa cerca.', fx:{ felicidad:+2 }, icon:'lamp' },
  { id:'deco_cama_capsula', tipo:'decoracion', slot:'cama', nombre:'Cápsula de sueño', precio:50, rareza:'raro',
    desc:'Mejora el descanso nocturno con un arrullo de estática suave.', fx:{ energia:+3 }, icon:'bed' },
  { id:'deco_planta_helecho', tipo:'decoracion', slot:'planta', nombre:'Helecho digital', precio:24, rareza:'comun',
    desc:'Crece un píxel cada noche.', fx:{ salud:+2 }, icon:'plant' },
  { id:'deco_maquina_radio', tipo:'decoracion', slot:'maquina', nombre:'Radio del umbral', precio:40, rareza:'raro',
    desc:'Sintoniza emisoras que dejaron de existir.', fx:{ curiosidad:+3 }, icon:'radio' },
  { id:'deco_reliquia_llave', tipo:'decoracion', slot:'reliquia', nombre:'Llave sin puerta', precio:60, rareza:'anomalo',
    desc:'Alguien la dejó aquí antes de que existiera el aquí.', fx:{ estabilidad:+2, curiosidad:+3 }, icon:'key' },

  // ── Objetos evolutivos ──
  { id:'evo_prisma_puro', tipo:'evolutivo', nombre:'Prisma puro', precio:80, rareza:'anomalo',
    desc:'Concentra la afinidad prisma de la criatura.', familia:'prisma', icon:'shard' },
  { id:'evo_lodo_abisal', tipo:'evolutivo', nombre:'Lodo abisal', precio:80, rareza:'anomalo',
    desc:'Concentra la afinidad abisal de la criatura.', familia:'abisal', icon:'drop' },
  { id:'evo_lingote', tipo:'evolutivo', nombre:'Lingote imantado', precio:80, rareza:'anomalo',
    desc:'Concentra la afinidad ferrita de la criatura.', familia:'ferrita', icon:'ingot' },

  // ── Cápsulas sorpresa (solo con Ecos, jamás dinero real) ──
  { id:'capsula_eco', tipo:'capsula', nombre:'Cápsula de eco', precioEcos:3, rareza:'raro',
    desc:'Contiene un objeto aleatorio. Se paga con Ecos ganados jugando.', icon:'capsule' }
];

export const ITEM_MAP = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const FOOD_CATS = [
  { id:'basico', label:'Básicos' }, { id:'fruta', label:'Frutas' }, { id:'proteina', label:'Proteínas' },
  { id:'snack', label:'Snacks' }, { id:'bebida', label:'Bebidas' }, { id:'especial', label:'Especial' },
  { id:'anomalo', label:'Anómalos' }
];
export const DECOR_SLOTS = [
  { id:'pared', label:'Pared' }, { id:'suelo', label:'Suelo' }, { id:'luz', label:'Iluminación' },
  { id:'cama', label:'Cama' }, { id:'planta', label:'Planta' }, { id:'maquina', label:'Máquina' },
  { id:'reliquia', label:'Reliquia' }
];
// Botín de cápsulas: pesos por rareza
export const CAPSULE_POOL = ITEMS.filter(i => ['comida','bebida','juguete','medicina','decoracion'].includes(i.tipo))
  .map(i => ({ value: i.id, w: i.rareza === 'anomalo' ? 1 : i.rareza === 'raro' ? 3 : 6 }));
