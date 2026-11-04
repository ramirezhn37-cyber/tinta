const KEYWORDS = {
  saludo: [
    'hola', 'buenas', 'buenos dias', 'buenas tardes', 'que tal',
    'hey', 'holi', 'saludos', 'que gusto',
  ],
  despedida: [
    'adios', 'hasta luego', 'nos vemos', 'me voy', 'hasta pronto',
    'buenas noches', 'chao', 'bye', 'hasta manana',
  ],
  pregunta_personal: [
    'como te llamas', 'cuantos anos tienes', 'de donde eres',
    'que te gusta', 'que te disgusta', 'cual es tu color favorito',
    'tienes amigos', 'cuentame de ti', 'como eres',
  ],
  halago: [
    'me caes bien', 'eres genial', 'eres lindo', 'eres bonita',
    'te quiero', 'me gustas', 'eres increible', 'que bonito', 'buen trabajo',
  ],
  insulto: [
    'tonto', 'tonta', 'feo', 'fea', 'inutil', 'aburrido', 'aburrida',
    'no me gustas', 'callate', 'eres horrible',
  ],
  tema_comida: [
    'comida', 'comer', 'hambre', 'galletas', 'galleta', 'pizza',
    'chocolate', 'desayuno', 'almuerzo', 'cena', 'receta', 'cocinar',
  ],
  tema_trabajo: [
    'trabajo', 'trabajar', 'oficina', 'jefe', 'escuela', 'estudiar',
    'estudio', 'tarea', 'examen', 'profesor', 'colegio', 'empleo',
  ],
  tema_amor: [
    'amor', 'enamorado', 'enamorada', 'novio', 'novia', 'pareja',
    'romance', 'cita', 'beso', 'corazon', 'relacion',
  ],
  tema_miedo: [
    'miedo', 'asusta', 'asustado', 'asustada', 'terror', 'monstruo',
    'pesadilla', 'nervioso', 'nerviosa', 'temor', 'oscuro',
  ],
  tema_dinero: [
    'dinero', 'plata', 'dinero', 'pagar', 'precio', 'comprar',
    'barato', 'caro', 'ahorrar', 'moneda', 'billete', 'rico',
  ],
  pregunta_sobre_si_mismo: [
    'quien eres', 'que eres', 'eres real', 'como naciste',
    'como apareciste', 'que haces aqui', 'eres un dibujo',
    'de donde saliste', 'quien te dibujo',
  ],
  pregunta_sobre_usuario: [
    'y tu que', 'sabes mi nombre', 'como me llamo', 'que piensas de mi',
    'que sabes de mi', 'te caigo bien', 'soy tu amigo',
    'quieres conocerme', 'preguntame algo',
  ],
  chiste: [
    'chiste', 'cuentame algo gracioso', 'hazme reir', 'broma',
    'algo gracioso', 'cuentame algo divertido', 'jajaja',
    'ja ja', 'jeje', 'humor',
  ],
  silencio: [],
  otro: [],
};

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()[\]{}"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyIntent(text) {
  const normalized = normalizeText(text);
  if (!normalized) return 'otro';

  const scored = Object.entries(KEYWORDS)
    .filter(([intent]) => intent !== 'silencio' && intent !== 'otro')
    .map(([intent, keywords]) => ({
      intent,
      score: keywords.reduce(
        (score, keyword) =>
          score +
          (normalized.includes(normalizeText(keyword))
            ? normalizeText(keyword).includes(' ')
              ? 2
              : 1
            : 0),
        0,
      ),
    }))
    .sort((first, second) => second.score - first.score);

  if (scored.length === 0 || scored[0].score === 0) return 'otro';
  if (scored[1] && scored[0].score === scored[1].score) return 'otro';
  return scored[0].intent;
}

function extractUserName(text) {
  const normalized = String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const match = normalized.match(
    /\b(?:me llamo|mi nombre es|soy)\s+([a-zA-Z][a-zA-Z'-]{0,24})/i,
  );
  if (!match) return null;
  return `${match[1].charAt(0).toLocaleUpperCase('es')}${match[1]
    .slice(1)
    .toLocaleLowerCase('es')}`;
}

window.TintaIntentClassifier = {
  KEYWORDS,
  classifyIntent,
  extractUserName,
  normalizeText,
};
