function createMessageId(now) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `msg-${now}-${Math.random().toString(36).slice(2, 10)}`;
}

function createMessage(from, text, now, options = {}) {
  return {
    id: createMessageId(now),
    from,
    text,
    at: now,
    ...options,
  };
}

function updateMemory(character, text, intent) {
  const name = window.TintaIntentClassifier.extractUserName(text);
  const topicIntents = new Set([
    'tema_comida',
    'tema_trabajo',
    'tema_amor',
    'tema_miedo',
    'tema_dinero',
  ]);
  return {
    ...character.memory,
    ...(name ? { userName: name } : {}),
    ...(topicIntents.has(intent) ? { lastTopic: intent } : {}),
  };
}

function addDiaryEntry(character, at, text) {
  const diary = Array.isArray(character.diary) ? character.diary : [];
  return [...diary, { at, text }].slice(-50);
}

window.TintaMemory = { addDiaryEntry, createMessage, updateMemory };
