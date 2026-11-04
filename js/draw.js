const COLORS = [
  { name: 'Rojo coral', value: '#df6548' },
  { name: 'Amarillo', value: '#e7b64f' },
  { name: 'Verde', value: '#75885e' },
  { name: 'Azul', value: '#5b7f9e' },
  { name: 'Morado', value: '#8e7191' },
  { name: 'Negro', value: '#292820' },
];

const BRUSH_SIZES = [
  { name: 'Fino', value: 4 },
  { name: 'Mediano', value: 8 },
  { name: 'Grueso', value: 14 },
];

const MAX_UNDO_STEPS = 30;

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function mountDrawingStudio(container, showToast, onCharacterGenerated) {
  container.innerHTML = `
    <section class="draw-page">
      <div class="draw-heading">
        <div>
          <span class="eyebrow"><span class="eyebrow-dot"></span> Tu lienzo</span>
          <h1>Todo empieza con una línea.</h1>
          <p>Dibuja sin pensarlo demasiado. Tu personaje saldrá de tus trazos.</p>
        </div>
        <a class="button button-quiet back-link" href="#/">← Volver al inicio</a>
      </div>

      <div class="studio-layout">
        <section class="drawing-panel" aria-label="Mesa de dibujo">
          <div class="drawing-toolbar">
            <div class="toolbar-group color-group">
              <span class="toolbar-label">Color</span>
              <div class="color-options" role="group" aria-label="Color del trazo">
                ${COLORS.map(
                  (color, index) => `
                    <button
                      class="color-option${index === 0 ? ' is-selected' : ''}"
                      type="button"
                      data-color="${color.value}"
                      aria-label="${color.name}"
                      aria-pressed="${index === 0}"
                      title="${color.name}"
                      style="--swatch: ${color.value}"
                    ></button>`,
                ).join('')}
              </div>
            </div>

            <div class="toolbar-group brush-group">
              <span class="toolbar-label">Trazo</span>
              <div class="brush-options" role="group" aria-label="Grosor del trazo">
                ${BRUSH_SIZES.map(
                  (brush, index) => `
                    <button
                      class="brush-option${index === 1 ? ' is-selected' : ''}"
                      type="button"
                      data-size="${brush.value}"
                      aria-label="Grosor ${brush.name.toLowerCase()}"
                      aria-pressed="${index === 1}"
                      title="${brush.name}"
                    ><span style="--dot-size: ${Math.min(brush.value, 12)}px"></span></button>`,
                ).join('')}
              </div>
            </div>

            <div class="toolbar-actions">
              <button class="tool-button eraser-button" type="button" aria-pressed="false" title="Borrador">
                <span aria-hidden="true">⌫</span><span class="tool-text">Borrador</span>
              </button>
              <span class="toolbar-divider" aria-hidden="true"></span>
              <button class="tool-button undo-button" type="button" title="Deshacer" aria-label="Deshacer" disabled>
                <span aria-hidden="true">↶</span>
              </button>
              <button class="tool-button clear-button" type="button" title="Limpiar lienzo">
                <span aria-hidden="true">⌧</span><span class="tool-text">Limpiar</span>
              </button>
            </div>
          </div>

          <div class="canvas-wrap">
            <canvas class="drawing-canvas" aria-label="Lienzo para dibujar"></canvas>
            <div class="canvas-hint">
              <span class="canvas-hint-icon" aria-hidden="true">✎</span>
              <span>Empieza donde quieras. Aquí no hay errores.</span>
            </div>
            <span class="canvas-caption">tu imaginación, sin instrucciones</span>
          </div>

          <div class="canvas-footer">
            <span><span class="live-dot"></span> Guardado en este lienzo</span>
            <span class="canvas-help">Ratón, dedo o lápiz · <kbd>Ctrl</kbd> + <kbd>Z</kbd> para deshacer</span>
          </div>
          <div class="birth-action">
            <p>¿Quién apareció entre tus trazos?</p>
            <button class="button button-primary birth-button" type="button" disabled>
              <span aria-hidden="true">✷</span> Dar vida
            </button>
          </div>
        </section>

        <aside class="drawing-aside">
          <div class="aside-card live-card">
            <span class="eyebrow">Mientras dibujas</span>
            <h2>Cada trazo cuenta.</h2>
            <p class="aside-description">Los detalles de tu dibujo darán pistas sobre su personalidad.</p>
            <div class="live-metrics" aria-live="polite" aria-label="Métricas en vivo">
              <div class="metric-row">
                <span class="metric-icon metric-icon-peach" aria-hidden="true">✎</span>
                <span class="metric-name">Trazos</span>
                <strong class="metric-strokes">0</strong>
              </div>
              <div class="metric-row">
                <span class="metric-icon metric-icon-yellow" aria-hidden="true">◉</span>
                <span class="metric-name">Colores usados</span>
                <strong class="metric-colors">0</strong>
              </div>
              <div class="metric-row">
                <span class="metric-icon metric-icon-green" aria-hidden="true">◷</span>
                <span class="metric-name">Tiempo dibujando</span>
                <strong class="metric-time">0:00</strong>
              </div>
            </div>
            <div class="analysis-metrics" aria-live="polite" aria-label="Análisis del dibujo">
              <span class="analysis-label">Pistas del dibujo</span>
              <div><span>Espacio ocupado</span><strong class="metric-area">0%</strong></div>
              <div><span>Velocidad media</span><strong class="metric-speed">0 px/ms</strong></div>
              <div><span>Forma redonda</span><strong class="metric-roundness">0%</strong></div>
              <div><span>Densidad del trazo</span><strong class="metric-density">0%</strong></div>
              <div><span>Tiempo con borrador</span><strong class="metric-eraser">0%</strong></div>
            </div>
            <div class="aside-note">
              <span aria-hidden="true">✦</span>
              <p>No hay una forma correcta de dibujar a alguien.</p>
            </div>
          </div>

          <div class="aside-card future-card">
            <span class="future-spark" aria-hidden="true">✳</span>
            <span class="eyebrow">Lo que viene</span>
            <h3>Tu criatura tendrá una voz propia.</h3>
            <p>Cuando termines, sus colores y sus trazos contarán quién es.</p>
            <span class="future-tag">Tu dibujo decide su personalidad</span>
          </div>
        </aside>
      </div>

      <section class="generated-character" aria-live="polite" aria-label="Personaje que nació de tu dibujo" hidden></section>

      <div class="draw-bottom">
        <span>Un garabato también puede ser el principio de una amistad.</span>
        <span class="draw-bottom-mark">Tinta Viva ✷</span>
      </div>
    </section>
  `;

  const canvas = container.querySelector('.drawing-canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const hint = container.querySelector('.canvas-hint');
  const undoButton = container.querySelector('.undo-button');
  const eraserButton = container.querySelector('.eraser-button');
  const clearButton = container.querySelector('.clear-button');
  const birthButton = container.querySelector('.birth-button');
  const generatedCharacter = container.querySelector('.generated-character');
  const strokesValue = container.querySelector('.metric-strokes');
  const colorsValue = container.querySelector('.metric-colors');
  const timeValue = container.querySelector('.metric-time');
  const areaValue = container.querySelector('.metric-area');
  const speedValue = container.querySelector('.metric-speed');
  const roundnessValue = container.querySelector('.metric-roundness');
  const densityValue = container.querySelector('.metric-density');
  const eraserValue = container.querySelector('.metric-eraser');

  let selectedColor = COLORS[0].value;
  let selectedSize = BRUSH_SIZES[1].value;
  let eraserEnabled = false;
  let activeStroke = null;
  let strokes = [];
  let history = [[]];
  let disposed = false;

  function drawStroke(stroke) {
    if (stroke.points.length === 0) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const points = stroke.points.map(([x, y]) => ({
      x: x * width,
      y: y * height,
    }));

    context.save();
    context.globalCompositeOperation = stroke.isEraser
      ? 'destination-out'
      : 'source-over';
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.lineWidth = stroke.size;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x, points[0].y, stroke.size / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length; index += 1) {
        context.lineTo(points[index].x, points[index].y);
      }
      context.stroke();
    }

    context.restore();
  }

  function redraw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    for (const stroke of strokes) drawStroke(stroke);
    if (activeStroke) drawStroke(activeStroke);
    updateMetrics();
  }

  function allStrokes() {
    return activeStroke ? [...strokes, activeStroke] : strokes;
  }

  function getTraceEvents() {
    return allStrokes().flatMap((stroke) => stroke.traceEvents);
  }

  function updateAnalyzedMetrics() {
    const metrics = window.TintaAnalyzer.analyzeDrawing(
      canvas,
      getTraceEvents(),
    );
    birthButton.disabled = metrics.dominantColors.length === 0;
    areaValue.textContent = `${Math.round(metrics.boundingBoxAreaRatio * 100)}%`;
    speedValue.textContent = `${metrics.avgStrokeSpeed.toFixed(2)} px/ms`;
    roundnessValue.textContent = `${Math.round(metrics.roundnessScore * 100)}%`;
    densityValue.textContent = `${Math.round(metrics.drawDensity * 100)}%`;
    eraserValue.textContent = `${Math.round(metrics.eraserUsage * 100)}%`;
  }

  function updateMetrics() {
    const currentStrokes = allStrokes();
    const usedColors = new Set(
      currentStrokes.filter((stroke) => !stroke.isEraser).map((stroke) => stroke.color),
    );
    let drawingTime = 0;

    for (const stroke of currentStrokes) {
      for (let index = 1; index < stroke.points.length; index += 1) {
        const elapsed = stroke.points[index][2] - stroke.points[index - 1][2];
        if (elapsed > 0 && elapsed <= 3000) drawingTime += elapsed;
      }
    }

    strokesValue.textContent = String(currentStrokes.length);
    colorsValue.textContent = String(usedColors.size);
    timeValue.textContent = formatTime(drawingTime);
    hint.hidden = currentStrokes.length > 0;
    undoButton.disabled = history.length <= 1;
  }

  function pushHistory() {
    history.push([...strokes]);
    if (history.length > MAX_UNDO_STEPS + 1) history.shift();
    updateMetrics();
  }

  function getPoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
      performance.now(),
    ];
  }

  function createTraceEvent(type, event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      type,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      t: performance.now(),
      color: selectedColor,
      size: selectedSize,
      isEraser: eraserEnabled,
    };
  }

  function handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    generatedCharacter.hidden = true;
    canvas.setPointerCapture(event.pointerId);
    activeStroke = {
      color: selectedColor,
      size: selectedSize,
      isEraser: eraserEnabled,
      points: [getPoint(event)],
      traceEvents: [createTraceEvent('down', event)],
    };
    drawStroke(activeStroke);
    updateMetrics();
  }

  function handlePointerMove(event) {
    if (!activeStroke || !canvas.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    activeStroke.points.push(getPoint(event));
    activeStroke.traceEvents.push(createTraceEvent('move', event));
    drawStroke(activeStroke);
    updateMetrics();
  }

  function finishStroke(event) {
    if (!activeStroke) return;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    activeStroke.traceEvents.push(createTraceEvent('up', event));
    strokes = [...strokes, activeStroke];
    activeStroke = null;
    pushHistory();
    updateAnalyzedMetrics();
  }

  function selectColor(button) {
    selectedColor = button.dataset.color;
    eraserEnabled = false;
    eraserButton.setAttribute('aria-pressed', 'false');
    container.querySelectorAll('.color-option').forEach((option) => {
      const selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
  }

  function selectSize(button) {
    selectedSize = Number(button.dataset.size);
    container.querySelectorAll('.brush-option').forEach((option) => {
      const selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
  }

  function undo() {
    if (activeStroke) {
      activeStroke = null;
      generatedCharacter.hidden = true;
      redraw();
      return;
    }
    if (history.length <= 1) return;
    history.pop();
    strokes = [...history[history.length - 1]];
    generatedCharacter.hidden = true;
    redraw();
    updateAnalyzedMetrics();
  }

  function clear() {
    if (strokes.length === 0 && !activeStroke) {
      showToast('El lienzo ya está en blanco.');
      return;
    }
    activeStroke = null;
    generatedCharacter.hidden = true;
    if (strokes.length === 0) {
      redraw();
      updateAnalyzedMetrics();
      showToast('Lienzo limpio.');
      return;
    }
    strokes = [];
    pushHistory();
    redraw();
    updateAnalyzedMetrics();
    showToast('Lienzo limpio. Puedes deshacer para recuperar el dibujo.');
  }

  function handleKeyDown(event) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'z' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      undo();
    }
  }

  function giveLife() {
    const metrics = window.TintaAnalyzer.analyzeDrawing(canvas, getTraceEvents());
    if (metrics.dominantColors.length === 0) {
      showToast('Dibuja un poquito antes de darle vida.');
      return;
    }

    const character = window.TintaPersonality.generatePersonality(metrics);
    generatedCharacter.innerHTML = `
      <div class="generated-art">
        <span class="generated-spark" aria-hidden="true">✷</span>
        <img src="${canvas.toDataURL('image/png')}" alt="Dibujo de ${escapeHtml(character.name)}" />
      </div>
      <div class="generated-copy">
        <span class="eyebrow"><span class="eyebrow-dot"></span> ¡Tu dibujo cobró vida!</span>
        <div class="generated-title-row">
          <h2>${escapeHtml(character.name)}</h2>
          <span class="rarity-badge rarity-${character.rarity}">${character.rarity}</span>
        </div>
        <div class="generated-traits">
          ${character.traits
            .map(
              (trait, index) => `
                <span class="generated-trait">
                  <strong>${escapeHtml(trait)}</strong>
                  <span>${escapeHtml(character.traitReasons[index])}</span>
                </span>`,
            )
            .join('')}
        </div>
        <blockquote>“${escapeHtml(character.catchphrase)}”</blockquote>
        <p class="generated-tic"><span>Su pequeña manía:</span> ${escapeHtml(character.tic)}.</p>
        <p class="generated-note">Sus rasgos nacieron de los colores y trazos de tu dibujo.</p>
        <button class="button button-primary save-character-button" type="button">
          Guardar personaje <span aria-hidden="true">→</span>
        </button>
      </div>`;
    generatedCharacter.hidden = false;
    const savedCharacter = {
      ...character,
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `character-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      imageDataUrl: canvas.toDataURL('image/png'),
      metrics,
      mood: 'neutral',
      moodIntensity: 0,
      chatHistory: [],
      lastInteractionAt: Date.now(),
      lastSeenAt: Date.now(),
      visitCount: 0,
      diary: [],
      memory: { userName: '', lastTopic: null },
    };
    generatedCharacter.dataset.characterId = savedCharacter.id;
    generatedCharacter
      .querySelector('.save-character-button')
      .addEventListener('click', () => {
        onCharacterGenerated(savedCharacter);
      });
    generatedCharacter.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const onResize = () => {
    if (!disposed) {
      redraw();
      if (!activeStroke) updateAnalyzedMetrics();
    }
  };
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(canvas);
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', finishStroke);
  canvas.addEventListener('pointercancel', finishStroke);
  container.querySelectorAll('.color-option').forEach((button) => {
    button.addEventListener('click', () => selectColor(button));
  });
  container.querySelectorAll('.brush-option').forEach((button) => {
    button.addEventListener('click', () => selectSize(button));
  });
  eraserButton.addEventListener('click', () => {
    eraserEnabled = !eraserEnabled;
    eraserButton.setAttribute('aria-pressed', String(eraserEnabled));
    if (eraserEnabled) {
      container.querySelectorAll('.color-option').forEach((button) => {
        button.classList.remove('is-selected');
        button.setAttribute('aria-pressed', 'false');
      });
    } else {
      const selected = container.querySelector(
        `[data-color="${escapeAttribute(selectedColor)}"]`,
      );
      if (selected) selectColor(selected);
    }
  });
  undoButton.addEventListener('click', undo);
  clearButton.addEventListener('click', clear);
  birthButton.addEventListener('click', giveLife);
  window.addEventListener('keydown', handleKeyDown);

  redraw();
  updateAnalyzedMetrics();

  return () => {
    disposed = true;
    resizeObserver.disconnect();
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', finishStroke);
    canvas.removeEventListener('pointercancel', finishStroke);
    birthButton.removeEventListener('click', giveLife);
    window.removeEventListener('keydown', handleKeyDown);
  };
}

window.TintaDraw = { mountDrawingStudio };
