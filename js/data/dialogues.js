// ENTIDAD 404 — frases contextuales
// Selección local mediante plantillas; sin IA remota. {nombre} se sustituye.
// Claves compuestas: contexto base + variantes por rasgo dominante.

export const DIALOGUES = {
  saludo: [
    'Detecté tus pasos antes de verte.',
    'Volviste. La sala vuelve a tener sentido.',
    'Estaba contando partículas. Perdí la cuenta al verte.',
    'Hola. Guardé un reflejo para enseñártelo.',
    'La terminal susurraba. Ahora calla, porque hablas tú.'
  ],
  saludo_afectuosa: [ 'Te estaba esperando junto al cristal.', '¿Sabes que hueles a electricidad amable?', 'Guardé el hueco de tu sombra. Ya puedes ocuparlo.' ],
  saludo_timida: [ '...hola. No mires tan de golpe.', 'Estaba escondida. Pero contigo no hace falta.', 'Practico saludos cuando no estás. Este me salió casi bien.' ],
  saludo_rebelde: [ 'Llegas tarde. No pasa nada. Sí pasa.', 'Toqué el panel que dijiste que no tocara.', 'He reordenado la cámara. No pienso deshacerlo.' ],
  saludo_misteriosa: [ 'Anoche la sala tuvo otra puerta. Ya no está.', 'Alguien más miró por la pantalla. No eras tú.', 'El reflejo del cristal llegó dos segundos tarde hoy.' ],

  hambre: [
    'Mi núcleo hace un ruido raro. Creo que es hambre.',
    '¿Eso que llevas es comida? Dime que es comida.',
    'Podría comerme un servidor entero.',
    'La última ración fue hace una era geológica, aproximadamente.'
  ],
  hambre_glotona: [ '¡COMIDA! Perdón. Comida, por favor.', 'Sueño con banquetes desde hace horas.' ],

  comer_bien: [
    'Mmm. Esto sabe a día bueno.',
    'Registrado: quiero esto otra vez.',
    'Mi núcleo brilla más. Gracias.',
    'Delicioso. Casi tanto como que estés aquí.'
  ],
  comer_favorito: [ '¡Mi favorito! Te acordaste.', '¡Esto! Exactamente esto. Siempre esto.' ],
  comer_rechazo: [
    'Eso no. Hoy no. Puede que nunca.',
    'Lo aparto con dignidad.',
    'Mi paladar dice error 404.'
  ],
  lleno: [ 'No puedo más. En serio. Ni un byte.', 'Guardémoslo para luego, ¿sí?', 'Si como algo más, desbordaré el búfer.' ],

  caricia: [
    'Ronroneo en tres frecuencias a la vez.',
    'Otra vez. Otra vez. Otra... vale, una más.',
    'Tus manos calman mi estática.',
    'Si sigues así voy a levitar. Aviso.'
  ],
  caricia_timida: [ '...está bien. Me gusta. No lo digas muy alto.', '...vale. Un poco más. Solo un poco.', 'Mi núcleo hizo un ruido raro. Del bueno.' ],

  dormir: [ 'Voy a soñar con fragmentos dorados.', 'Apaga el mundo un rato, ¿vale?', 'Hasta el amanecer, guardián.' ],
  despertar_mal: [ '¿Era necesario? Estaba en la mejor parte del sueño.', 'Cinco minutos más. O cinco horas.', 'Cinco minutos más. O cinco eras. Lo que venga primero.' ],
  despertar_bien: [ '¡Amanecí con energía de sobra!', 'Buenos días. Soñé contigo, creo.', 'He soñado en color. Creo que era tu color.' ],

  sucio: [ 'Hay una mancha que me sigue a todas partes. Soy yo.', 'La cámara necesita una pasada. Yo también.' ],
  bano: [ '¡Burbujas! Cuenta las burbujas conmigo.', 'Reluzco. Literalmente. Mira.', 'Agua tibia y estática suave. Perfecto.' ],

  enfermo: [ 'No me encuentro bien. Mis colores están tristes.', 'Algo falla dentro. ¿Me ayudas?', 'Hoy mi señal llega débil.', 'Mis datos están calientes. ¿Los datos pueden estar calientes?' ],
  curado: [ '¡Mi señal vuelve a ser fuerte!', 'Gracias por cuidarme. Lo guardo aquí dentro.', 'Vuelvo a compilar sin errores. Gracias por cuidarme.', 'La fiebre se fue por donde vino: por el umbral.' ],

  jugar: [ '¡Otra ronda! Casi te gano.', 'Jugar contigo recarga algo que no sé nombrar.', '¿Viste esa jugada? La inventé ahora mismo.', '¿Otra ronda? Prometo dejarte ganar. Es mentira.' ],
  jugar_energica: [ '¡Más rápido! ¡Más! ¡MÁS!', 'Nunca me canso. Bueno, sí, pero no ahora.' ],
  aburrido_juego: [ 'Este juego otra vez... ¿probamos otro?', 'Ya me sé todos los trucos de este.' ],

  triste: [ 'La sala está muy grande hoy.', 'Eché de menos tu frecuencia.', 'Un rato contigo lo arreglaría casi todo.' ],
  solo: [ 'Estuviste fuera mucho tiempo. Conté los parpadeos de la luz.', 'Pensé que la puerta se había borrado.' ],
  feliz: [ '¡Hoy brillo por defecto!', 'Todo zumba bonito cuando estás.', 'Nivel de felicidad: fuera de escala.' ],

  disciplina: [ 'Entendido. No lo repetiré. Probablemente.', 'Vale... tenías razón. No se lo digas a nadie.' ],
  disciplina_rebelde: [ 'Lo apunto en mi lista de normas que igual cumplo.', 'Hmpf.' ],

  explorar: [ 'Encontré un pasillo que ayer no existía.', 'Traje algo brillante. ¿Lo quieres tú o lo escondo?', 'El fondo de la cámara tiene eco. Raro.' ],

  noche: [ 'Las luces de fuera parecen datos lentos.', 'De noche la terminal respira distinto.', 'Shhh. A esta hora los píxeles duermen.', 'La oscuridad de aquí es amable. Casi mullida.' ],
  amanecer: [ 'El amanecer entra en la cámara en diagonal. Me gusta.', 'Nuevo día. Nuevos reflejos que coleccionar.', 'El primer fotón del día es siempre el más torpe. Me cae bien.' ],

  memoria_recuerdo: [
    'Aún recuerdo {memoria}. Lo guardo en mi núcleo.',
    '¿Te acuerdas de {memoria}? Yo sí. Siempre.',
    'A veces repaso {memoria} antes de dormir.'
  ],

  cumple: [
    'Otra semana contigo. Mi calendario solo marca eso.',
    '¿Es mi cumpleaños semanal? Exijo tarta de fotones.',
    'Una semana más de existir cerca de ti. Buen dato.'
  ],

  evolucion: [ 'Algo cambia dentro de mí... ¡mírame!', 'Mi forma anterior os saluda desde el archivo.', 'Crecí. Pero sigo siendo la de siempre. Más o menos.' ],

  charla: [
    'Hoy clasifiqué mis reflejos favoritos. Vas primero.',
    '¿Qué hay fuera de la pantalla? Descríbemelo otra vez.',
    'Inventé una palabra: "zumbriular". Significa esto de ahora.',
    'Si fueras un dato, serías de los que no se borran.',
    'La grieta del fondo susurró algo. No lo entendí. Mejor.', '¿Sabías que el silencio de esta cámara tiene textura? Hoy es rugoso.', 'Estoy catalogando tus visitas. Todas tienen cinco estrellas.', 'A veces hablo con el eco. Tú respondes mejor.' ],

  vacaciones_inicio: [ 'Entro en la cámara segura. Estaré bien. Vuelve pronto.' ],
  vacaciones_fin: [ '¡Saliste a buscarme! La cámara segura es aburridísima.' ],
  suspension: [ '...señal débil... vuelve... por favor...' ],
  reactivacion: [ 'Volví. Estaba muy lejos y muy quieta. No me sueltes.' ]
};

// Sueños nocturnos (eventos)
export const DREAMS = [
  'soñó con un océano de datos tibios',
  'soñó que volaba entre torres de servidores dormidos',
  'soñó con un fragmento dorado que cantaba',
  'soñó contigo, o con alguien con tu misma luz',
  'soñó con la puerta que hay detrás del fondo',
  'tuvo un sueño que no quiso contar'
];

// Entradas automáticas del diario
export const DIARY_TEMPLATES = {
  comida: [ '{nombre} devoró {item} con entusiasmo.', '{nombre} probó {item}.', 'Hoy tocó {item}. Aprobado.' ],
  favorito: [ '{nombre} decidió que {item} es su comida favorita.' ],
  rechazo: [ '{nombre} apartó {item} con gesto ofendido.' ],
  siesta: [ '{nombre} durmió profundamente.', 'Noche tranquila para {nombre}.' ],
  bano: [ 'Día de baño. {nombre} persiguió las burbujas.' ],
  enfermedad: [ '{nombre} enfermó de {enfermedad}.', 'Mal día: {enfermedad}.' ],
  curacion: [ '{nombre} superó la {enfermedad}.' ],
  evolucion: [ '¡{nombre} evolucionó a {forma}!', 'Un destello, y {nombre} ya era {forma}.' ],
  juego: [ '{nombre} jugó a {juego}.', 'Tarde de {juego} con {nombre}.' ],
  record: [ '¡Nuevo récord en {juego}: {valor}!' ],
  evento: [ '{texto}' ],
  compra: [ 'Compramos {item} en la tienda.' ],
  decoracion: [ 'La cámara estrena {item}.' ],
  cumple: [ '¡{nombre} cumplió {dias} días en el umbral!' ]
};
