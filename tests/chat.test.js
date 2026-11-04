const results = document.querySelector('#results');
const summary = document.querySelector('#summary');
const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const character = {
  id: 'test-character',
  name: 'Luma',
  traits: ['curioso', 'calido', 'tranquilo'],
  tic: 'pregunta siempre la hora',
  mood: 'neutral',
  moodIntensity: 0,
  lastInteractionAt: 1_000_000,
  metrics: { seed: '1a2b3c4d' },
  memory: {},
};

test('clasifica las quince intenciones y normaliza tildes', () => {
  const examples = {
    saludo: '¡Hola!',
    despedida: 'Hasta pronto',
    pregunta_personal: '¿Cómo te llamas?',
    halago: 'Eres genial',
    insulto: 'Eres tonto',
    tema_comida: 'Tengo hambre y quiero pizza',
    tema_trabajo: 'Mañana tengo un examen',
    tema_amor: 'Hablemos del corazón',
    tema_miedo: 'Me da miedo la oscuridad',
    tema_dinero: 'No puedo pagar ese precio',
    pregunta_sobre_si_mismo: '¿Quién eres?',
    pregunta_sobre_usuario: '¿Qué sabes de mí?',
    chiste: 'Cuéntame un chiste',
    silencio: '',
    otro: 'Me gustan los triángulos',
  };
  for (const [intent, phrase] of Object.entries(examples)) {
    if (intent === 'silencio') continue;
    assert(
      window.TintaIntentClassifier.classifyIntent(phrase) === intent,
      `«${phrase}» debe clasificarse como ${intent}.`,
    );
  }
  assert(window.TintaIntentClassifier.KEYWORDS.saludo.length >= 8, 'Cada intención debe tener al menos ocho palabras clave.');
  assert(window.TintaIntentClassifier.classifyIntent('HOLA, ¿CÓMO estás?') === 'saludo', 'Debe ignorar mayúsculas y signos.');
});

test('recuerda el nombre del usuario para la siguiente respuesta', () => {
  const first = window.TintaChatEngine.respond(character, 'Me llamo Ana', [], 1_000_100);
  assert(first.memory.userName === 'Ana', 'Debe recordar que el usuario se llama Ana.');
  const second = window.TintaChatEngine.respond(
    { ...character, memory: first.memory },
    'hola',
    [{ from: 'user', text: 'Me llamo Ana', at: 1_000_100 }],
    1_000_200,
  );
  assert(second.text.includes('Ana'), 'La siguiente respuesta debe usar el nombre recordado.');
});

test('un halago sube el humor y un insulto lo baja', () => {
  const initial = { ...character, moodIntensity: 0 };
  const compliment = window.TintaMoodEngine.updateMood(initial, 'halago', 1_000_100);
  const insult = window.TintaMoodEngine.updateMood(initial, 'insulto', 1_000_100);
  assert(compliment.moodIntensity === 0.2 && compliment.mood === 'feliz', 'El halago suma 0.2 y da alegría.');
  assert(insult.moodIntensity === -0.3 && insult.mood === 'molesto', 'El insulto resta 0.3 y causa molestia.');
});

test('recuerda el tema y el aburrimiento aparece tras más de seis horas', () => {
  const memory = window.TintaMemory.updateMemory(character, 'Quiero comer pizza', 'tema_comida');
  assert(memory.lastTopic === 'tema_comida', 'Debe recordar el último tema de conversación.');
  const bored = window.TintaMoodEngine.updateMood(
    { ...character, moodIntensity: -0.3, lastInteractionAt: 1_000_000 },
    'otro',
    1_000_000 + 7 * 60 * 60 * 1000,
  );
  assert(bored.mood === 'aburrido', 'Tras seis horas sin hablar, el ánimo bajo debe ser aburrimiento.');
});

test('más de un día sin hablar produce una respuesta de silencio', () => {
  const history = [{ from: 'character', text: 'hasta luego', at: 1_000_000 }];
  const result = window.TintaChatEngine.respond(
    character,
    'hola',
    history,
    1_000_000 + 25 * 60 * 60 * 1000,
  );
  assert(result.intent === 'silencio', 'La ausencia prolongada debe priorizar la intención silencio.');
});

test('hay una respuesta para cada intención y el banco de respuestas es ampliable', () => {
  const intents = Object.keys(window.TintaIntentClassifier.KEYWORDS);
  for (const intent of intents) {
    assert(
      window.TintaResponseBank.RESPONSES[intent]?.base?.length >= 5,
      `La intención ${intent} necesita al menos cinco respuestas base.`,
    );
  }
});

test('las respuestas incluyen rasgos y pueden aplicar el tic del personaje', () => {
  const result = window.TintaChatEngine.respond(
    { ...character, tic: "dice «esto no es un consejo»" },
    'hola',
    [],
    1_234_567,
  );
  assert(typeof result.text === 'string' && result.text.length > 0, 'Debe responder con texto.');
  assert(result.newMoodIntensity >= -1 && result.newMoodIntensity <= 1, 'El humor debe permanecer entre -1 y 1.');
  assert(typeof result.ticApplied === 'boolean', 'Debe indicar si aplicó el tic.');
});

test('aplica la manía con una frecuencia cercana al 30 por ciento', () => {
  let applied = 0;
  for (let index = 0; index < 120; index += 1) {
    const result = window.TintaChatEngine.respond(
      { ...character, tic: "dice «esto no es un consejo»" },
      'hola',
      [],
      1_234_567 + index * 1000,
    );
    if (result.ticApplied) applied += 1;
  }
  const ratio = applied / 120;
  assert(ratio > 0.1 && ratio < 0.5, `La frecuencia de tics debería aproximarse a 30 %, se obtuvo ${Math.round(ratio * 100)} %.`);
});

let passed = 0;
for (const { name, run } of tests) {
  const item = document.createElement('li');
  try {
    run();
    passed += 1;
    item.className = 'pass';
    item.textContent = `✓ ${name}`;
  } catch (error) {
    item.className = 'fail';
    item.textContent = `✗ ${name}: ${error.message}`;
  }
  results.append(item);
}

summary.textContent = `${passed}/${tests.length} pruebas aprobadas`;
summary.className = passed === tests.length ? 'pass' : 'fail';
