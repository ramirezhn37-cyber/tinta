const results = document.querySelector('#results');
const summary = document.querySelector('#summary');
const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function metrics(overrides = {}) {
  return {
    dominantColors: [{ hex: '#ff0000', ratio: 1 }],
    strokeCount: 8,
    avgStrokeSpeed: 0.8,
    boundingBoxAreaRatio: 0.4,
    roundnessScore: 0.45,
    eraserUsage: 0,
    timeSpentMs: 2000,
    colorVariance: 0,
    drawDensity: 0.4,
    seed: '1a2b3c4d',
    ...overrides,
  };
}

test('el mismo dibujo produce exactamente el mismo personaje', () => {
  const drawing = metrics();
  const first = window.TintaPersonality.generatePersonality(drawing);
  const second = window.TintaPersonality.generatePersonality(drawing);
  assert(JSON.stringify(first) === JSON.stringify(second), 'Los resultados deben ser deterministas.');
});

test('dibujos distintos producen identidades y nombres distintos', () => {
  const redDrawing = window.TintaPersonality.generatePersonality(metrics());
  const blueDrawing = window.TintaPersonality.generatePersonality(
    metrics({
      dominantColors: [{ hex: '#0000ff', ratio: 1 }],
      seed: '5e6f7081',
    }),
  );
  assert(redDrawing.id !== blueDrawing.id, 'Cada semilla debe identificar su dibujo.');
  assert(redDrawing.name !== blueDrawing.name, 'Dibujos distintos deben recibir nombres distintos.');
});

test('genera exactamente tres rasgos únicos y tres razones legibles', () => {
  const character = window.TintaPersonality.generatePersonality(metrics());
  assert(character.traits.length === 3, 'El personaje debe tener exactamente tres rasgos.');
  assert(new Set(character.traits).size === 3, 'Los rasgos no deben repetirse.');
  assert(character.traitReasons.length === 3, 'Cada rasgo debe tener su razón.');
  assert(character.dominantTrait === character.traits[0], 'El primer rasgo debe ser el dominante.');
});

test('el color dominante influye en el rasgo', () => {
  const red = window.TintaPersonality.generatePersonality(metrics());
  const blue = window.TintaPersonality.generatePersonality(
    metrics({ dominantColors: [{ hex: '#0000ff', ratio: 1 }], seed: 'b17e220a' }),
  );
  assert(['impulsivo', 'energico'].includes(red.traits[0]), 'El rojo debe sugerir energía o impulso.');
  assert(['tranquilo', 'misterioso'].includes(blue.traits[0]), 'El azul debe sugerir calma o misterio.');
});

test('las reglas activadas determinan la rareza', () => {
  const legendary = window.TintaPersonality.generatePersonality(
    metrics({
      boundingBoxAreaRatio: 0.9,
      eraserUsage: 0.3,
      colorVariance: 0.8,
      strokeCount: 30,
      avgStrokeSpeed: 2,
      drawDensity: 0.8,
    }),
  );
  assert(legendary.triggeredRuleCount >= 4, 'El dibujo de prueba debe activar al menos cuatro reglas.');
  assert(legendary.rarity === 'legendario', 'Cuatro o más reglas deben dar rareza legendaria.');
  assert(window.TintaRarity.getRarity(0) === 'comun', 'Cero reglas debe ser común.');
  assert(window.TintaRarity.getRarity(2) === 'raro', 'Dos reglas deben ser raras.');
  assert(window.TintaRarity.getRarity(3) === 'epico', 'Tres reglas deben ser épicas.');
});

test('hay al menos 20 frases de personaje y 15 tics', () => {
  const phraseCount = Object.values(window.TintaCatchphrases.CATCHPHRASES)
    .reduce((sum, phrases) => sum + phrases.length, 0);
  assert(phraseCount >= 20, 'Debe haber al menos veinte frases.');
  assert(window.TintaTics.TICS.length >= 15, 'Debe haber al menos quince tics.');
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
