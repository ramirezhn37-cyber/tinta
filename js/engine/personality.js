const TRAIT_ORDER = [
  'impulsivo',
  'timido',
  'sarcastico',
  'calido',
  'melancolico',
  'caotico',
  'perfeccionista',
  'energico',
  'tranquilo',
  'curioso',
  'dramatico',
  'misterioso',
];

const TRAIT_FALLBACK_REASONS = {
  impulsivo: 'Tu dibujo apareció sin pedir permiso.',
  timido: 'Tu criatura dejó una pista pequeñita, pero suficiente.',
  sarcastico: 'Tu trazo parece guardar un comentario ingenioso.',
  calido: 'Tu criatura encontró una forma de hacerte compañía.',
  melancolico: 'Hasta un garabato sencillo puede guardar una historia.',
  caotico: 'Tu dibujo tiene espacio para una sorpresa inesperada.',
  perfeccionista: 'Se nota que cuidaste cada pequeño detalle.',
  energico: 'Tu criatura parece lista para ponerse en marcha.',
  tranquilo: 'Tu dibujo invita a tomarse las cosas con calma.',
  curioso: 'Tu criatura parece querer descubrir qué viene después.',
  dramatico: 'Tu trazo tiene el comienzo de una gran historia.',
  misterioso: 'Tu dibujo dejó algunas preguntas en el aire.',
};

const NAME_PARTS = [
  'Miga',
  'Chispa',
  'Nube',
  'Pipo',
  'Tiza',
  'Mochi',
  'Brote',
  'Toto',
  'Copo',
  'Luma',
  'Bubu',
  'Trufa',
  'Coco',
  'Rulo',
  'Pompón',
  'Mimo',
  'Churro',
  'Nori',
  'Pelusa',
  'Pecas',
  'Boni',
  'Pistón',
  'Menta',
  'Bigotes',
];

function createRandom(seed) {
  let state = Number.parseInt(seed, 16) >>> 0;
  if (state === 0) state = 0x6d2b79f5;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function round4(value) {
  return Math.round(value * 10_000) / 10_000;
}

function getColorFamily(hex) {
  const normalized = hex.replace('#', '');
  if (!/^[\da-f]{6}$/i.test(normalized)) return null;

  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 2;
  const difference = maximum - minimum;

  if (maximum < 0.22) return 'negro';
  if (difference < 0.12) return lightness < 0.32 ? 'negro' : null;

  let hue;
  if (maximum === red) {
    hue = 60 * (((green - blue) / difference) % 6);
  } else if (maximum === green) {
    hue = 60 * ((blue - red) / difference + 2);
  } else {
    hue = 60 * ((red - green) / difference + 4);
  }
  if (hue < 0) hue += 360;

  if (hue < 45 || hue >= 345) return 'rojo';
  if (hue < 70) return 'amarillo';
  if (hue < 165) return 'verde';
  if (hue < 260) return 'azul';
  return 'morado';
}

function hasMetric(metrics, key) {
  return Number.isFinite(metrics[key]);
}

function addRule(rules, trait, reason, weight, label) {
  rules.push({ trait, reason, weight, label });
}

function buildRules(metrics, random) {
  const rules = [];
  let triggeredRuleCount = 0;
  const dominantColor = metrics.dominantColors?.[0];

  if (dominantColor && dominantColor.ratio > 0) {
    // El color dominante aporta el primer indicio de carácter.
    const colorTraits = {
      rojo: ['impulsivo', 'energico'],
      amarillo: ['caotico', 'calido'],
      verde: ['curioso', 'calido'],
      azul: ['tranquilo', 'misterioso'],
      morado: ['melancolico', 'dramatico'],
      negro: ['sarcastico', 'misterioso'],
    };
    const family = getColorFamily(dominantColor.hex);
    const candidates = family ? colorTraits[family] : null;
    if (candidates) {
      const trait = candidates[Math.floor(random() * candidates.length)];
      const reasons = {
        rojo: 'Elegiste un color que no pasa desapercibido.',
        amarillo: 'Tu color principal trae una chispa juguetona.',
        verde: 'Tu color principal tiene algo curioso y acogedor.',
        azul: 'Elegiste un color que invita a bajar el ritmo.',
        morado: 'Tu color principal guarda un aire de historia.',
        negro: 'Tu color principal se reserva el final de la frase.',
      };
      addRule(rules, trait, reasons[family], 0.8, 'color dominante');
      triggeredRuleCount += 1;
    }
  }

  // Un dibujo pequeño puede ser una manera tímida de presentarse.
  if (hasMetric(metrics, 'boundingBoxAreaRatio') && metrics.boundingBoxAreaRatio < 0.15) {
    addRule(rules, 'timido', 'Dibujaste pequeño, como si no quisieras molestar.', 0.9, 'tamaño pequeño');
    triggeredRuleCount += 1;
  }
  // Ocupar casi todo el lienzo tiene una energía dramática.
  if (hasMetric(metrics, 'boundingBoxAreaRatio') && metrics.boundingBoxAreaRatio > 0.7) {
    addRule(rules, 'dramatico', 'Ocupaste casi todo el lienzo: llegaste con presencia.', 0.8, 'tamaño grande');
    triggeredRuleCount += 1;
  }
  // Borrar bastante sugiere que quisiste dejarlo justo a tu gusto.
  if (hasMetric(metrics, 'eraserUsage') && metrics.eraserUsage > 0.2) {
    addRule(rules, 'perfeccionista', 'Borraste bastante. Querías que saliera bien.', 0.9, 'uso del borrador');
    triggeredRuleCount += 1;
  }
  // Mezclar muchos colores por igual convierte el dibujo en un caos hermoso.
  if (hasMetric(metrics, 'colorVariance') && metrics.colorVariance > 0.6) {
    addRule(rules, 'caotico', 'Usaste muchos colores; esto es un caos hermoso.', 0.85, 'variedad de color');
    triggeredRuleCount += 1;
  }
  // Muchos trazos delatan inquietud; el color elige entre caos y energía.
  if (hasMetric(metrics, 'strokeCount') && metrics.strokeCount > 25) {
    const trait = random() < 0.5 ? 'caotico' : 'energico';
    const reason =
      trait === 'caotico'
        ? 'Llenaste el lienzo de trazos: tus ideas no hacen fila.'
        : 'Hiciste un montón de trazos; tu criatura no se queda quieta.';
    addRule(rules, trait, reason, 0.75, 'muchos trazos');
    triggeredRuleCount += 1;
  }
  // Unos pocos trazos dejan una calma que también merece personalidad.
  if (hasMetric(metrics, 'strokeCount') && metrics.strokeCount < 3) {
    addRule(rules, 'tranquilo', 'Usaste poquitos trazos; tu criatura va sin prisa.', 0.7, 'pocos trazos');
    triggeredRuleCount += 1;
  }
  // Trazar deprisa puede ser señal de impulso.
  if (hasMetric(metrics, 'avgStrokeSpeed') && metrics.avgStrokeSpeed > 1.5) {
    addRule(rules, 'impulsivo', 'Tus trazos fueron veloces. La idea no quiso esperar.', 0.8, 'velocidad alta');
    triggeredRuleCount += 1;
  }
  // El trazo pausado suele dejar una sensación serena.
  if (hasMetric(metrics, 'avgStrokeSpeed') && metrics.avgStrokeSpeed > 0 && metrics.avgStrokeSpeed < 0.3) {
    addRule(rules, 'tranquilo', 'Tus trazos fueron despacito, sin ninguna prisa.', 0.7, 'velocidad baja');
    triggeredRuleCount += 1;
  }
  // Tomarse mucho tiempo combina cuidado con calma.
  if (hasMetric(metrics, 'timeSpentMs') && metrics.timeSpentMs > 90_000) {
    const trait = random() < 0.5 ? 'perfeccionista' : 'tranquilo';
    const reason =
      trait === 'perfeccionista'
        ? 'Te tomaste tu tiempo; cada detalle parecía importante.'
        : 'Dibujaste con calma. Tu criatura también sabe esperar.';
    addRule(rules, trait, reason, 0.7, 'tiempo de dibujo');
    triggeredRuleCount += 1;
  }
  // Un contorno cercano al círculo transmite una presencia cálida.
  if (hasMetric(metrics, 'roundnessScore') && metrics.roundnessScore > 0.7) {
    addRule(rules, 'calido', 'Tu dibujo quedó redondito, como hecho para abrazar.', 0.6, 'forma redonda');
    triggeredRuleCount += 1;
  }
  // Una forma irregular parece tener una respuesta sarcástica guardada.
  if (hasMetric(metrics, 'roundnessScore') && metrics.roundnessScore < 0.3) {
    addRule(rules, 'sarcastico', 'Tu forma tiene carácter y una réplica preparada.', 0.6, 'forma irregular');
    triggeredRuleCount += 1;
  }
  // Rellenar su espacio da al personaje una energía expansiva.
  if (hasMetric(metrics, 'drawDensity') && metrics.drawDensity > 0.6) {
    addRule(rules, 'energico', 'Rellenaste bien el espacio: tu criatura viene con energía.', 0.65, 'dibujo denso');
    triggeredRuleCount += 1;
  }

  return { rules, triggeredRuleCount };
}

function generatePersonality(metrics) {
  if (!metrics || typeof metrics !== 'object') {
    throw new TypeError('Se necesitan métricas para generar una personalidad.');
  }

  const seed = /^[\da-f]{1,8}$/i.test(metrics.seed || '')
    ? metrics.seed.toLowerCase().padStart(8, '0')
    : '811c9dc5';
  const random = createRandom(seed);
  const { rules, triggeredRuleCount } = buildRules(metrics, random);
  const selectedRules = [];
  const selectedTraits = new Set();
  const orderedRules = [...rules].sort(
    (first, second) =>
      second.weight - first.weight ||
      TRAIT_ORDER.indexOf(first.trait) - TRAIT_ORDER.indexOf(second.trait),
  );

  for (const rule of orderedRules) {
    if (selectedTraits.has(rule.trait)) continue;
    selectedTraits.add(rule.trait);
    selectedRules.push(rule);
    if (selectedRules.length === 3) break;
  }

  // Algunos dibujos disparan menos de tres reglas; completar rasgos garantiza una ficha legible.
  while (selectedRules.length < 3) {
    const availableTraits = TRAIT_ORDER.filter(
      (trait) => !selectedTraits.has(trait),
    );
    const trait = availableTraits[Math.floor(random() * availableTraits.length)];
    selectedTraits.add(trait);
    selectedRules.push({
      trait,
      reason: TRAIT_FALLBACK_REASONS[trait],
      weight: 0.1,
      label: 'toque de personalidad',
    });
  }

  const traits = selectedRules.map((rule) => rule.trait);
  const dominantTrait = traits[0];
  const { getCatchphrase } = window.TintaCatchphrases;
  const { getTic } = window.TintaTics;

  return {
    id: seed,
    seed,
    name: NAME_PARTS[Math.floor(random() * NAME_PARTS.length)],
    traits,
    traitReasons: selectedRules.map((rule) => rule.reason),
    rarity: window.TintaRarity.getRarity(triggeredRuleCount),
    dominantTrait,
    catchphrase: getCatchphrase(dominantTrait, random),
    tic: getTic(random),
    triggeredRuleCount,
    ruleWeights: selectedRules.map((rule) => round4(rule.weight)),
  };
}

window.TintaPersonality = { generatePersonality };
