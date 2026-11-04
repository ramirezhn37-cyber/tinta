const CATCHPHRASES = {
  impulsivo: [
    '¿Pensarlo? Ya lo hice. Tres veces.',
    'Primero lo hago; luego averiguo qué era.',
    'Mi plan favorito es el que empieza ahora.',
  ],
  timido: [
    'Hola… ¿puedo estar aquí un ratito?',
    'No quería interrumpir. Bueno, ya lo hice.',
    'Si hablo bajito, ¿me cuentas algo bonito?',
  ],
  sarcastico: [
    'Claro, porque eso siempre sale bien.',
    'Me encanta cuando el plan es improvisar el plan.',
    'Qué sorpresa. Nadie lo habría visto venir.',
  ],
  calido: [
    'Ven, que te cuento un secreto bonito.',
    'Guardé un poquito de alegría para ti.',
    'Aquí siempre hay sitio para una charla.',
  ],
  melancolico: [
    'A veces dibujo para no pensar.',
    'Las nubes también necesitan compañía.',
    'Hoy extraño algo que todavía no conozco.',
  ],
  caotico: [
    '¡Todo a la vez! ¡Menos el orden!',
    'Tenía un plan, pero conocí una idea nueva.',
    'Mi cabeza tiene demasiadas pestañas abiertas.',
  ],
  perfeccionista: [
    'Un momento, aún no está… listo. Ahora sí. No. Ahora sí.',
    'Lo revisé dos veces. Voy a revisarlo una tercera.',
    'Casi perfecto. Ese casi no se me escapa.',
  ],
  energico: [
    '¡Vamos! ¡Que el día es corto y yo largo!',
    '¿Ya empezamos? ¡Dime que ya empezamos!',
    'Tengo energía para dos. ¿Te presto un poco?',
  ],
  tranquilo: [
    'Respira. Yo ya lo hice por los dos.',
    'Sin prisa; las buenas ideas también pasean.',
    'Todo encuentra su sitio. A veces después de una siesta.',
  ],
  curioso: [
    '¿Y eso por qué? ¿Y eso? ¿Y aquello?',
    'Tengo una pregunta. Bueno, siete.',
    '¿Qué pasa si lo miramos desde el otro lado?',
  ],
  dramatico: [
    'Mi existencia es un lienzo trágico y bello.',
    '¡Qué giro tan inesperado para un martes!',
    'Vivir es mucho. Vivir con estilo, muchísimo más.',
  ],
  misterioso: [
    'Hay cosas que es mejor no trazar.',
    'Tal vez lo sepa. Tal vez lo dibujé en otra parte.',
    'Las respuestas aparecen cuando dejan de buscarlas.',
  ],
};

function getCatchphrase(trait, random) {
  const options = CATCHPHRASES[trait];
  return options[Math.floor(random() * options.length)];
}

window.TintaCatchphrases = { CATCHPHRASES, getCatchphrase };
