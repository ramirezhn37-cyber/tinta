const CHARACTER_FORMAT = 'tinta-viva-character';
const GALLERY_FORMAT = 'tinta-viva-gallery';
const TRANSFER_VERSION = 1;
const MAX_TRANSFER_SIZE = 20 * 1024 * 1024;
const MAX_CHARACTERS = 100;
const MOODS = new Set([
  'neutral',
  'feliz',
  'euforico',
  'molesto',
  'aburrido',
  'triste',
]);

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value, label, maximumLength) {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0 ||
    value.length > maximumLength
  ) {
    throw new TypeError(`${label} no es válido.`);
  }
  return value;
}

function validateCharacter(character, index) {
  const label = `El personaje ${index + 1}`;
  if (!isRecord(character)) throw new TypeError(`${label} no es válido.`);

  const name = requireString(character.name, `${label}: el nombre`, 32);
  const imageDataUrl = requireString(
    character.imageDataUrl,
    `${label}: la imagen`,
    6 * 1024 * 1024,
  );
  if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(imageDataUrl)) {
    throw new TypeError(`${label}: la imagen debe ser PNG, JPEG o WebP en base64.`);
  }
  if (
    !Array.isArray(character.traits) ||
    character.traits.length < 1 ||
    character.traits.length > 3 ||
    character.traits.some(
      (trait) => typeof trait !== 'string' || trait.trim().length === 0 || trait.length > 40,
    )
  ) {
    throw new TypeError(`${label}: los rasgos no son válidos.`);
  }

  const normalized = {
    name,
    imageDataUrl,
    traits: [...character.traits],
    traitReasons: [],
    rarity: requireString(character.rarity, `${label}: la rareza`, 24),
    catchphrase: requireString(
      character.catchphrase,
      `${label}: la frase`,
      500,
    ),
    tic: requireString(character.tic, `${label}: la manía`, 200),
  };

  if (character.traitReasons !== undefined) {
    if (
      !Array.isArray(character.traitReasons) ||
      character.traitReasons.length > 3 ||
      character.traitReasons.some(
        (reason) => typeof reason !== 'string' || reason.length > 300,
      )
    ) {
      throw new TypeError(`${label}: las explicaciones de rasgos no son válidas.`);
    }
    normalized.traitReasons = [...character.traitReasons];
  }

  for (const key of ['seed', 'dominantTrait']) {
    if (character[key] !== undefined) {
      normalized[key] = requireString(character[key], `${label}: ${key}`, 100);
    }
  }
  if (character.metrics !== undefined) {
    if (!isRecord(character.metrics)) {
      throw new TypeError(`${label}: las métricas no son válidas.`);
    }
    normalized.metrics = character.metrics;
  }

  if (character.mood !== undefined) {
    if (!MOODS.has(character.mood)) {
      throw new TypeError(`${label}: el estado de ánimo no es válido.`);
    }
    normalized.mood = character.mood;
  }
  if (character.moodIntensity !== undefined) {
    if (
      !Number.isFinite(character.moodIntensity) ||
      character.moodIntensity < -1 ||
      character.moodIntensity > 1
    ) {
      throw new TypeError(`${label}: la intensidad del ánimo no es válida.`);
    }
    normalized.moodIntensity = character.moodIntensity;
  }
  for (const key of ['createdAt', 'updatedAt', 'lastInteractionAt', 'lastSeenAt']) {
    if (character[key] !== undefined) {
      if (!Number.isFinite(character[key]) || character[key] < 0) {
        throw new TypeError(`${label}: la fecha ${key} no es válida.`);
      }
      normalized[key] = character[key];
    }
  }

  if (character.memory !== undefined) {
    if (!isRecord(character.memory)) {
      throw new TypeError(`${label}: la memoria no es válida.`);
    }
    const memory = {};
    if (character.memory.userName !== undefined) {
      if (
        typeof character.memory.userName !== 'string' ||
        character.memory.userName.length > 40
      ) {
        throw new TypeError(`${label}: el nombre recordado no es válido.`);
      }
      memory.userName = character.memory.userName;
    }
    if (character.memory.lastTopic !== undefined) {
      if (
        character.memory.lastTopic !== null &&
        (typeof character.memory.lastTopic !== 'string' ||
          character.memory.lastTopic.length > 40)
      ) {
        throw new TypeError(`${label}: el último tema no es válido.`);
      }
      memory.lastTopic = character.memory.lastTopic;
    }
    normalized.memory = memory;
  }

  if (character.chatHistory !== undefined) {
    if (
      !Array.isArray(character.chatHistory) ||
      character.chatHistory.length > 500
    ) {
      throw new TypeError(`${label}: el historial no es válido.`);
    }
    normalized.chatHistory = character.chatHistory.map((message, messageIndex) => {
      if (
        !isRecord(message) ||
        !['user', 'character'].includes(message.from) ||
        typeof message.text !== 'string' ||
        message.text.length === 0 ||
        message.text.length > 500 ||
        !Number.isFinite(message.at) ||
        message.at < 0
      ) {
        throw new TypeError(
          `${label}: el mensaje ${messageIndex + 1} no es válido.`,
        );
      }
      return {
        ...(typeof message.id === 'string' ? { id: message.id.slice(0, 100) } : {}),
        from: message.from,
        text: message.text,
        at: message.at,
        ...(typeof message.intent === 'string'
          ? { intent: message.intent.slice(0, 60) }
          : {}),
        ...(typeof message.moodAtTime === 'string'
          ? { moodAtTime: message.moodAtTime.slice(0, 30) }
          : {}),
      };
    });
  }

  if (character.diary !== undefined) {
    if (!Array.isArray(character.diary) || character.diary.length > 50) {
      throw new TypeError(`${label}: el diario no es válido.`);
    }
    normalized.diary = character.diary.map((entry, entryIndex) => {
      if (
        !isRecord(entry) ||
        !Number.isFinite(entry.at) ||
        entry.at < 0 ||
        typeof entry.text !== 'string' ||
        entry.text.length > 300
      ) {
        throw new TypeError(`${label}: la entrada ${entryIndex + 1} no es válida.`);
      }
      return { at: entry.at, text: entry.text };
    });
  }

  if (character.visitCount !== undefined) {
    if (!Number.isInteger(character.visitCount) || character.visitCount < 0) {
      throw new TypeError(`${label}: el contador de visitas no es válido.`);
    }
    normalized.visitCount = character.visitCount;
  }
  return normalized;
}

function stringifyExport(format, characters) {
  const validatedCharacters = characters.map(validateCharacter);
  const payload = JSON.stringify({
    format,
    version: TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    ...(format === CHARACTER_FORMAT
      ? { character: validatedCharacters[0] }
      : { characters: validatedCharacters }),
  });
  if (new TextEncoder().encode(payload).byteLength > MAX_TRANSFER_SIZE) {
    throw new RangeError('La exportación supera el límite de 20 MB.');
  }
  return payload;
}

function exportCharacter(character) {
  return stringifyExport(CHARACTER_FORMAT, [character]);
}

function exportGallery(characters) {
  if (!Array.isArray(characters) || characters.length > MAX_CHARACTERS) {
    throw new TypeError('La galería debe contener como máximo 100 personajes.');
  }
  return stringifyExport(GALLERY_FORMAT, characters);
}

function parseImport(text) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new TypeError('El archivo está vacío.');
  }
  if (new TextEncoder().encode(text).byteLength > MAX_TRANSFER_SIZE) {
    throw new RangeError('El archivo supera el límite de 20 MB.');
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError('El archivo no contiene JSON válido.', { cause: error });
  }
  if (
    !isRecord(payload) ||
    payload.version !== TRANSFER_VERSION ||
    ![CHARACTER_FORMAT, GALLERY_FORMAT].includes(payload.format)
  ) {
    throw new TypeError('El archivo no es una exportación compatible de Tinta Viva.');
  }

  const characters =
    payload.format === CHARACTER_FORMAT
      ? [validateCharacter(payload.character, 0)]
      : payload.characters;
  if (
    !Array.isArray(characters) ||
    characters.length === 0 ||
    characters.length > MAX_CHARACTERS
  ) {
    throw new TypeError('La exportación debe contener entre 1 y 100 personajes.');
  }
  return characters.map(validateCharacter);
}

window.TintaTransfer = {
  exportCharacter,
  exportGallery,
  parseImport,
};
