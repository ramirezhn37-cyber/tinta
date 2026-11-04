const results = document.querySelector('#results');
const summary = document.querySelector('#summary');
const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectError(run, messagePart) {
  try {
    run();
  } catch (error) {
    assert(error.message.includes(messagePart), `El error debe mencionar «${messagePart}».`);
    return;
  }
  throw new Error('Se esperaba un error de validación.');
}

const character = {
  id: 'local-id',
  name: 'Luma',
  traits: ['curioso', 'calido', 'tranquilo'],
  traitReasons: ['Pregunta por todo.', 'Es cálido.', 'Va sin prisa.'],
  rarity: 'raro',
  catchphrase: '¿Y aquello?',
  tic: 'pregunta siempre la hora',
  seed: '1a2b3c4d',
  imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
  createdAt: 100,
  updatedAt: 200,
  mood: 'feliz',
  moodIntensity: 0.3,
  memory: { userName: 'Ana', lastTopic: 'tema_comida' },
  chatHistory: [
    { id: 'm1', from: 'user', text: 'Me llamo Ana', at: 150, intent: 'otro' },
    { id: 'm2', from: 'character', text: 'Hola, Ana.', at: 175, moodAtTime: 'feliz' },
  ],
  diary: [{ at: 180, text: 'Conversó con Ana.' }],
  visitCount: 2,
};

test('exporta e importa una ficha conservando conversación y memoria', () => {
  const [imported] = window.TintaTransfer.parseImport(
    window.TintaTransfer.exportCharacter(character),
  );
  assert(imported.name === character.name, 'Debe conservar el nombre.');
  assert(imported.traits.join(',') === character.traits.join(','), 'Debe conservar los rasgos.');
  assert(imported.chatHistory.length === 2, 'Debe conservar los mensajes.');
  assert(imported.memory.userName === 'Ana', 'Debe conservar la memoria.');
  assert(imported.imageDataUrl === character.imageDataUrl, 'Debe conservar el dibujo.');
  assert(imported.id === undefined, 'La app asignará un ID nuevo al importar.');
});

test('exporta e importa una galería completa', () => {
  const [first, second] = window.TintaTransfer.parseImport(
    window.TintaTransfer.exportGallery([character, { ...character, name: 'Miga' }]),
  );
  assert(first.name === 'Luma' && second.name === 'Miga', 'Debe mantener el orden y las fichas.');
});

test('rechaza JSON inválido, formatos ajenos y versiones desconocidas', () => {
  expectError(() => window.TintaTransfer.parseImport('{'), 'JSON válido');
  expectError(
    () => window.TintaTransfer.parseImport('{"format":"otro","version":1,"characters":[]}'),
    'compatible',
  );
});

test('valida la imagen y los datos del historial importado', () => {
  const badImage = JSON.stringify({
    format: 'tinta-viva-character',
    version: 1,
    character: { ...character, imageDataUrl: 'javascript:alert(1)' },
  });
  expectError(() => window.TintaTransfer.parseImport(badImage), 'PNG, JPEG o WebP');

  const badMessage = JSON.stringify({
    format: 'tinta-viva-character',
    version: 1,
    character: { ...character, chatHistory: [{ from: 'intruder', text: 'x', at: 1 }] },
  });
  expectError(() => window.TintaTransfer.parseImport(badMessage), 'mensaje 1');
});

test('limita el tamaño de importación y la cantidad de personajes', () => {
  expectError(
    () => window.TintaTransfer.parseImport('x'.repeat(20 * 1024 * 1024 + 1)),
    '20 MB',
  );
  expectError(
    () => window.TintaTransfer.exportGallery(Array.from({ length: 101 }, () => character)),
    '100 personajes',
  );
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
