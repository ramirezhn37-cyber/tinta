const results = document.querySelector('#results');
const summary = document.querySelector('#summary');
const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createCanvas(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  paint(context, canvas);
  return canvas;
}

function getMetrics(canvas, events = []) {
  return window.TintaAnalyzer.analyzeDrawing(canvas, events);
}

function traceEvents({ color, points, isEraser = false, startTime = 0 }) {
  const events = [];
  points.forEach(([x, y], index) => {
    events.push({
      type: index === 0 ? 'down' : 'move',
      x,
      y,
      t: startTime + index * 10,
      color,
      size: 4,
      isEraser,
    });
  });
  const [x, y] = points[points.length - 1];
  events.push({
    type: 'up',
    x,
    y,
    t: startTime + points.length * 10,
    color,
    size: 4,
    isEraser,
  });
  return events;
}

test('dibujo todo rojo: identifica el color dominante', () => {
  const canvas = createCanvas(80, 80, (context) => {
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 80, 80);
  });
  const metrics = getMetrics(canvas);
  assert(metrics.dominantColors[0]?.hex === '#ff0000', 'El color dominante debe ser rojo.');
  assert(metrics.dominantColors[0]?.ratio === 1, 'El rojo debe cubrir toda la muestra.');
  assert(metrics.boundingBoxAreaRatio === 1, 'El dibujo rojo debe ocupar todo el lienzo.');
});

test('dibujo todo azul: diferencia el color y produce una semilla repetible', () => {
  const canvas = createCanvas(80, 80, (context) => {
    context.fillStyle = '#0000ff';
    context.fillRect(0, 0, 80, 80);
  });
  const metrics = getMetrics(canvas);
  assert(metrics.dominantColors[0]?.hex === '#0000ff', 'El color dominante debe ser azul.');
  assert(metrics.dominantColors[0]?.hex !== '#ff0000', 'El resultado no debe ser igual al dibujo rojo.');
  assert(metrics.seed === getMetrics(canvas).seed, 'La misma imagen debe generar la misma semilla.');
});

test('garabato denso: cuenta trazos, velocidad, tiempo y diversidad', () => {
  const canvas = createCanvas(120, 100, (context) => {
    const colors = ['#ff0000', '#0000ff', '#00aa00', '#f0c000'];
    for (let index = 0; index < 24; index += 1) {
      context.beginPath();
      context.strokeStyle = colors[index % colors.length];
      context.lineWidth = 6;
      context.moveTo(6, index * 4 + 4);
      context.lineTo(114, index * 4 + 4);
      context.stroke();
    }
  });
  const events = [];
  for (let index = 0; index < 26; index += 1) {
    events.push(
      ...traceEvents({
        color: '#ff0000',
        startTime: index * 50,
        points: [
          [5, index * 3],
          [25, index * 3 + 1],
          [55, index * 3],
        ],
      }),
    );
  }
  const eraserTrace = traceEvents({
    color: '#000000',
    isEraser: true,
    startTime: 5000,
    points: [
      [5, 5],
      [15, 15],
      [25, 20],
    ],
  });
  eraserTrace[2].t += 5000;
  eraserTrace[3].t += 5000;
  events.push(...eraserTrace);
  const metrics = getMetrics(canvas, events);
  assert(metrics.strokeCount === 27, 'Debe contar las 27 secuencias down/up.');
  assert(metrics.avgStrokeSpeed > 0, 'Debe medir la velocidad media de los trazos.');
  assert(metrics.timeSpentMs > 0 && metrics.timeSpentMs < 1000, 'Debe excluir pausas mayores a tres segundos.');
  assert(metrics.eraserUsage > 0 && metrics.eraserUsage < 1, 'Debe calcular la proporción del tiempo con borrador.');
  assert(metrics.colorVariance > 0, 'Debe detectar el uso de varios colores.');
  assert(metrics.dominantColors.length === 3, 'Debe limitar los colores dominantes a tres.');
});

test('trazo pequeño: su área es menor que la del lienzo', () => {
  const canvas = createCanvas(200, 200, (context) => {
    context.fillStyle = '#df6548';
    context.beginPath();
    context.arc(100, 100, 5, 0, Math.PI * 2);
    context.fill();
  });
  const metrics = getMetrics(
    canvas,
    traceEvents({ color: '#df6548', points: [[100, 100], [101, 100]] }),
  );
  assert(metrics.boundingBoxAreaRatio > 0, 'El trazo debe tener un área medible.');
  assert(metrics.boundingBoxAreaRatio < 0.02, 'El área del trazo debe ser pequeña.');
  assert(metrics.strokeCount === 1, 'El trazo debe contarse una sola vez.');
});

test('dibujo redondo: aproxima su contorno y densidad', () => {
  const canvas = createCanvas(160, 160, (context) => {
    context.fillStyle = '#75885e';
    context.beginPath();
    context.arc(80, 80, 40, 0, Math.PI * 2);
    context.fill();
  });
  const metrics = getMetrics(canvas);
  assert(metrics.roundnessScore > 0.7, 'El dibujo circular debe puntuar como redondo.');
  assert(metrics.drawDensity > 0.7, 'El área dentro del círculo debe estar bien cubierta.');
  assert(metrics.boundingBoxAreaRatio > 0, 'El círculo debe tener un área medible.');
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
