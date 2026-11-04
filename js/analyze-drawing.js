const SAMPLE_STEP = 4;
const MAX_DRAWING_PAUSE_MS = 3000;

function round4(value) {
  return Math.round(value * 10_000) / 10_000;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function hashImageDataUrl(imageDataUrl) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < imageDataUrl.length; index += 1) {
    hash ^= imageDataUrl.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function validateTraceEvents(traceEvents) {
  if (!Array.isArray(traceEvents)) {
    throw new TypeError('traceEvents debe ser un arreglo.');
  }

  for (const event of traceEvents) {
    if (
      typeof event !== 'object' ||
      event === null ||
      !['down', 'move', 'up'].includes(event.type) ||
      !Number.isFinite(event.x) ||
      !Number.isFinite(event.y) ||
      !Number.isFinite(event.t) ||
      typeof event.color !== 'string' ||
      !Number.isFinite(event.size) ||
      typeof event.isEraser !== 'boolean'
    ) {
      throw new TypeError('Cada evento de trazo debe tener datos válidos.');
    }
  }
}

function getColorHex(data, index) {
  return `#${[data[index], data[index + 1], data[index + 2]]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function analyzeDrawing(canvas, traceEvents) {
  if (
    typeof canvas !== 'object' ||
    canvas === null ||
    typeof canvas.getContext !== 'function' ||
    typeof canvas.toDataURL !== 'function' ||
    !Number.isInteger(canvas.width) ||
    !Number.isInteger(canvas.height)
  ) {
    throw new TypeError('canvas debe ser un elemento HTMLCanvasElement.');
  }
  validateTraceEvents(traceEvents);

  const width = canvas.width;
  const height = canvas.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('No se pudo leer el lienzo 2D.');

  const colorCounts = new Map();
  const occupiedCells = new Set();
  const sampleColumns = Math.ceil(width / SAMPLE_STEP);
  let opaqueSampleCount = 0;
  let minimumX = width;
  let minimumY = height;
  let maximumX = -1;
  let maximumY = -1;

  if (width > 0 && height > 0) {
    const image = context.getImageData(0, 0, width, height);
    for (let y = 0; y < height; y += SAMPLE_STEP) {
      for (let x = 0; x < width; x += SAMPLE_STEP) {
        const pixelIndex = (y * width + x) * 4;
        if (image.data[pixelIndex + 3] < 32) continue;

        opaqueSampleCount += 1;
        minimumX = Math.min(minimumX, x);
        minimumY = Math.min(minimumY, y);
        maximumX = Math.max(maximumX, x);
        maximumY = Math.max(maximumY, y);

        const color = getColorHex(image.data, pixelIndex);
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
        occupiedCells.add(
          Math.floor(y / SAMPLE_STEP) * sampleColumns +
            Math.floor(x / SAMPLE_STEP),
        );
      }
    }
  }

  const sampledColors = [...colorCounts.entries()].sort(
    ([colorA, countA], [colorB, countB]) =>
      countB - countA || colorA.localeCompare(colorB),
  );
  const dominantColors = sampledColors.slice(0, 3).map(([hex, count]) => ({
    hex,
    ratio: round4(count / Math.max(opaqueSampleCount, 1)),
  }));
  const colorVariety = sampledColors.length;
  const colorConcentration = sampledColors.reduce(
    (sum, [, count]) => sum + (count / Math.max(opaqueSampleCount, 1)) ** 2,
    0,
  );
  const colorVariance =
    colorVariety <= 1
      ? 0
      : (1 - colorConcentration) / (1 - 1 / colorVariety);

  let boundingBoxAreaRatio = 0;
  let drawDensity = 0;
  let roundnessScore = 0;

  if (maximumX >= minimumX && maximumY >= minimumY) {
    const boundingWidth = maximumX - minimumX + SAMPLE_STEP;
    const boundingHeight = maximumY - minimumY + SAMPLE_STEP;
    boundingBoxAreaRatio = clamp(
      (boundingWidth * boundingHeight) / (width * height),
      0,
      1,
    );

    const columnsInBounds = Math.floor((maximumX - minimumX) / SAMPLE_STEP) + 1;
    const rowsInBounds = Math.floor((maximumY - minimumY) / SAMPLE_STEP) + 1;
    drawDensity = clamp(
      opaqueSampleCount / (columnsInBounds * rowsInBounds),
      0,
      1,
    );

    let exposedEdges = 0;
    const neighbors = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const cell of occupiedCells) {
      const cellIndex = cell;
      const cellX = cellIndex % sampleColumns;
      const cellY = Math.floor(cellIndex / sampleColumns);
      for (const [offsetX, offsetY] of neighbors) {
        const neighborX = cellX + offsetX;
        const neighborY = cellY + offsetY;
        const neighbor =
          neighborX < 0 ||
          neighborY < 0 ||
          neighborX >= sampleColumns ||
          neighborY >= Math.ceil(height / SAMPLE_STEP)
            ? -1
            : neighborY * sampleColumns + neighborX;
        if (!occupiedCells.has(neighbor)) exposedEdges += 1;
      }
    }

    const sampledArea = opaqueSampleCount * SAMPLE_STEP ** 2;
    const contourPerimeter = exposedEdges * SAMPLE_STEP;
    const equivalentCirclePerimeter =
      2 * Math.PI * Math.sqrt(sampledArea / Math.PI);
    roundnessScore =
      equivalentCirclePerimeter === 0
        ? 0
        : clamp(
            1 -
              Math.abs(contourPerimeter - equivalentCirclePerimeter) /
                equivalentCirclePerimeter,
            0,
            1,
          );
  }

  let strokeCount = 0;
  let totalDrawingTime = 0;
  let eraserTime = 0;
  let totalMoveSpeed = 0;
  let moveSpeedCount = 0;
  let strokeIsOpen = false;
  let previousEvent = null;
  let previousMove = null;

  for (const event of traceEvents) {
    if (event.type === 'down') {
      strokeIsOpen = true;
      previousEvent = event;
      previousMove = null;
      continue;
    }
    if (!strokeIsOpen) continue;

    const elapsed = event.t - previousEvent.t;
    if (elapsed > 0 && elapsed <= MAX_DRAWING_PAUSE_MS) {
      totalDrawingTime += elapsed;
      if (previousEvent.isEraser) eraserTime += elapsed;
    }

    if (event.type === 'move') {
      if (previousMove) {
        const moveElapsed = event.t - previousMove.t;
        if (moveElapsed >= 5) {
          totalMoveSpeed +=
            Math.hypot(event.x - previousMove.x, event.y - previousMove.y) /
            moveElapsed;
          moveSpeedCount += 1;
        }
      }
      previousMove = event;
      previousEvent = event;
    } else {
      strokeCount += 1;
      strokeIsOpen = false;
      previousEvent = null;
      previousMove = null;
    }
  }

  const imageDataUrl = canvas.toDataURL('image/png');
  return {
    dominantColors,
    strokeCount,
    avgStrokeSpeed:
      moveSpeedCount === 0 ? 0 : round4(totalMoveSpeed / moveSpeedCount),
    boundingBoxAreaRatio: round4(boundingBoxAreaRatio),
    roundnessScore: round4(roundnessScore),
    eraserUsage:
      totalDrawingTime === 0 ? 0 : round4(eraserTime / totalDrawingTime),
    timeSpentMs: round4(totalDrawingTime),
    colorVariance: round4(clamp(colorVariance, 0, 1)),
    drawDensity: round4(drawDensity),
    seed: hashImageDataUrl(imageDataUrl),
  };
}

window.TintaAnalyzer = { analyzeDrawing };
