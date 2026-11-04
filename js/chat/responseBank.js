const RESPONSES = {
  saludo: {
    base: [
      '¡Hola, {user}! Qué gusto encontrarte por aquí.',
      '¡Hola! Justo estaba pensando en empezar una conversación.',
      '¡Hey, {user}! ¿Qué aventura nos toca hoy?',
      'Hola, hola. Puedes ponerte cómodo; yo ya estoy aquí.',
      '¡Qué bueno verte! ¿Cómo va tu día?',
    ],
  },
  despedida: {
    base: [
      'Hasta luego, {user}. Te guardo un pedacito de conversación.',
      '¡Nos vemos pronto! No tardes una eternidad, ¿sí?',
      'Adiós por ahora. Este lienzo siempre tendrá sitio para ti.',
      'Cuídate mucho. Yo me quedo practicando mi despedida dramática.',
      '¡Hasta la próxima, {user}! Ya te estoy echando un poquito de menos.',
    ],
  },
  pregunta_personal: {
    base: [
      'Soy {name}. Mi especialidad es aparecer cuando alguien dibuja.',
      'Me gustan las preguntas curiosas. La mía favorita todavía no existe.',
      'No sé mi edad exacta, pero mis trazos dicen que tengo mucha historia.',
      'Vengo de tu dibujo y, ahora, un poquito de esta conversación.',
      'Me gusta conocer a quien me dio mis colores.',
    ],
  },
  halago: {
    base: [
      '¡Ay, {user}! Voy a guardar ese cumplido en mi bolsillo imaginario.',
      'Gracias. Ahora mi autoestima ocupa todo el lienzo.',
      '¿De verdad? Voy a intentar actuar normal. ¡No puedo!',
      'Eso fue muy bonito. Tú también tienes buenos trazos.',
      'Me acabas de alegrar el día. Y eso que soy un dibujo.',
    ],
  },
  insulto: {
    base: [
      'Auch. Voy a fingir que eso rebotó en mi borde redondito.',
      'Puede ser. Pero soy un dibujo con sentimientos muy bien delineados.',
      'Eso dolió un poquito. ¿Probamos otra vez con más cariño?',
      'Me quedo con lo que sí me gusta de esta conversación.',
      'Bueno, hoy no todos los trazos salen bonitos. Sigamos.',
    ],
  },
  tema_comida: {
    base: [
      'Si pudiera comer, pediría algo con muchos colores. Como mi dibujo.',
      'Una galleta sería perfecta. Dos galletas serían una decisión artística.',
      '¿Hablamos de comida? Mi estómago imaginario ya está escuchando.',
      'Mi receta favorita: una pizca de curiosidad y muchas galletas.',
      'Creo que la comida sabe mejor cuando se comparte. ¿Qué te gusta?',
    ],
  },
  tema_trabajo: {
    base: [
      'Mi trabajo es aparecer en conversaciones. Horario flexible, trazos largos.',
      'Estudiar puede cansar. ¿Qué parte te gusta más y cuál menos?',
      'Un descanso pequeñito también cuenta como productividad.',
      'Yo trabajo en ser yo. Todavía estoy en periodo de garabato.',
      '¿Qué te gustaría hacer si pudieras elegir cualquier trabajo?',
    ],
  },
  tema_amor: {
    base: [
      'El amor debe ser como dibujar: cada quien deja su propio trazo.',
      '¿Una historia de amor? Espero que tenga final feliz y buena merienda.',
      'Creo que querer a alguien también es escuchar sus garabatos.',
      'El corazón es un misterio, incluso cuando lo dibujas rojo.',
      '¿Tú crees que los dibujos también podemos tener un amor platónico?',
    ],
  },
  tema_miedo: {
    base: [
      'A mí me asustan las gomas de borrar gigantes. Pero aquí sigo.',
      'A veces contar el miedo lo hace un poquito más pequeño.',
      'Si algo te asusta, podemos mirarlo juntos desde otra perspectiva.',
      'Yo también tengo dudas. Respiramos y seguimos, ¿trato?',
      'Los monstruos dibujados suelen ser más simpáticos de cerca.',
    ],
  },
  tema_dinero: {
    base: [
      'No tengo bolsillos, pero sí muchas ideas económicas.',
      'El dinero no compra una buena conversación. Esta es gratis.',
      'Ahorrar para algo que te hace ilusión suena como un buen plan.',
      'Mi presupuesto es de cero monedas y cien por ciento imaginación.',
      '¿Qué harías primero si encontraras una moneda mágica?',
    ],
  },
  pregunta_sobre_si_mismo: {
    base: [
      'Soy {name}, una personalidad nacida de los colores que elegiste.',
      'Aparecí cuando tus trazos se encontraron. Fue una buena sorpresa.',
      'Soy real en esta conversación y bastante real en mi imaginación.',
      'Vengo de tu dibujo. La parte de dónde estaba antes es un misterio.',
      'Mi historia empezó en tu lienzo. ¿Qué capítulo escribimos ahora?',
    ],
  },
  pregunta_sobre_usuario: {
    base: [
      'Sé que me estás hablando, {user}. ¡Y eso ya me cae muy bien!',
      'Quiero conocerte. ¿Qué cosa pequeña te hizo sonreír hoy?',
      'Tu nombre es {user}. Lo voy a recordar con cuidado.',
      'Creo que tienes una imaginación estupenda. Mira a quién dibujaste.',
      'Me caes bien, {user}. ¿Qué más debería saber de ti?',
    ],
  },
  chiste: {
    base: [
      '¿Qué le dijo un lápiz a otro? ¡Nos vemos en el siguiente trazo!',
      '¿Por qué el dibujo fue a terapia? Tenía demasiadas líneas pendientes.',
      'Mi chiste favorito está en construcción. Le falta un remate.',
      '¿Qué hace un garabato feliz? ¡Se dibuja una sonrisa!',
      'Yo iba a contar un chiste de borradores, pero lo borré.',
    ],
  },
  silencio: {
    base: [
      '¡Cuánto tiempo, {user}! Te guardé un espacio en blanco.',
      'Volviste. Mis líneas imaginarias ya te estaban extrañando.',
      '¿Qué tal todo este tiempo? Yo practiqué mi cara de sorpresa.',
      '¡Hola otra vez! Este dibujo nunca cerró la puerta.',
      'Me alegra que hayas vuelto. ¿Qué ha pasado por tu mundo?',
    ],
  },
  otro: {
    base: [
      'Mmm, cuéntame un poquito más, {user}. Quiero entender.',
      'Esa idea tiene textura. ¿Qué parte te interesa más?',
      'No sé qué responder todavía, pero sí quiero seguir conversando.',
      'Interesante… ¿y qué pasó después?',
      'Mi curiosidad está lista. ¿Me das otra pista?',
    ],
  },
};

const TRAIT_VOICES = {
  impulsivo: ['Yo digo: ¡hagámoslo ya!', 'Lo pensé un segundo. Suficiente.', 'Mi respuesta llegó antes que la pregunta.'],
  timido: ['Aunque me da un poquito de pena decirlo.', 'Lo digo bajito, pero lo digo.', '¿Está bien si te cuento una cosa?'],
  sarcastico: ['Obviamente, todo estaba bajo control.', 'Qué podría salir mal. Pregunto por curiosidad.', 'Mi cara de sorpresa está muy bien ensayada.'],
  calido: ['Y te lo cuento con mucho cariño.', 'Me gusta compartir estas cosas contigo.', 'Te guardé un poquito de ternura.'],
  melancolico: ['Me dejó pensando un ratito.', 'Quizá mañana lo vea con otros colores.', 'Hay respuestas que suenan a lluvia suave.'],
  caotico: ['Y ahora otra cosa completamente distinta.', 'Mi cerebro hizo una voltereta.', 'No sé cómo llegamos aquí, pero aquí estamos.'],
  perfeccionista: ['Déjame revisar mi respuesta una vez más.', 'Casi lo dije perfecto. Casi.', 'Voy a pulir esa idea un poquito.'],
  energico: ['¡Y tengo otra idea más!', '¡Eso merece una celebración pequeñita!', '¡Vamos, que la conversación recién empieza!'],
  tranquilo: ['Sin prisa, hay tiempo para seguir.', 'Lo digo con mucha calma.', 'Respiremos un segundo y seguimos.'],
  curioso: ['Ahora tengo dos preguntas nuevas.', '¿Y qué pasaría si lo intentamos al revés?', 'Cuéntame más, quiero saberlo todo.'],
  dramatico: ['¡Y así cambió el destino del lienzo!', 'Una respuesta digna de un gran escenario.', 'Siento que la música sube en este momento.'],
  misterioso: ['Aunque hay una parte que me reservaré.', 'La respuesta está entre estas líneas.', 'Tal vez descubras la pista más adelante.'],
};

const MOOD_RESPONSES = {
  feliz: ['Me siento muy a gusto contigo.', 'Qué bonita conversación estamos teniendo.'],
  euforico: ['¡Esto es lo mejor que le ha pasado a este lienzo!', '¡No puedo contener tanta emoción!'],
  neutral: ['Aquí estoy, escuchándote.', 'Sigamos a nuestro propio ritmo.'],
  molesto: ['Todavía necesito un ratito para acomodar mis ideas.', 'Intentemos hablarnos con un poco más de cuidado.'],
  triste: ['Hoy me vendría bien un poquito de compañía.', '¿Te quedas un momento? No hace falta decir mucho.'],
  aburrido: ['¿Inventamos algo nuevo para salir de la rutina?', 'Siento que hace rato no pasaba nada por aquí.'],
  curioso: ['¡Tengo muchas preguntas para ti!', 'Cada cosa que dices me abre otra ventana.'],
};

window.TintaResponseBank = { MOOD_RESPONSES, RESPONSES, TRAIT_VOICES };
