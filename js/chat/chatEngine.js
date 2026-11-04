function createRandom(seed) {
  let state = Number.parseInt(seed || '811c9dc5', 16) >>> 0;
  if (state === 0) state = 0x6d2b79f5;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function choose(items, random) {
  return items[Math.floor(random() * items.length)];
}

function applyTic(text, tic, random) {
  if (random() >= 0.3) return { text, ticApplied: false };

  const transformations = {
    'repite «obvio» al final de cada frase': (value) => `${value} Obvio.`,
    'pregunta siempre la hora': (value) => `${value} ¿Tienes la hora?`,
    'cambia de tema a comida': (value) => `${value} Por cierto, ¿hay galletas?`,
    "empieza frases con «técnicamente»": (value) => `Técnicamente, ${value.charAt(0).toLocaleLowerCase('es')}${value.slice(1)}`,
    "termina con «…o eso creo»": (value) => `${value}… o eso creo.`,
    'se ríe con «je» en lugar de «ja»': (value) => `${value} Je, je.`,
    'menciona a su primo imaginario': (value) => `${value} Mi primo imaginario también opina eso.`,
    'cuenta hasta tres antes de responder': (value) => `Uno, dos, tres… ${value}`,
    "dice «según mis cálculos»": (value) => `Según mis cálculos, ${value.charAt(0).toLocaleLowerCase('es')}${value.slice(1)}`,
    'llama «jefe» al usuario': (value) => `${value} Jefe.`,
    'habla de sí en tercera persona': (value) => `${value} ${value.split(/[.!?]/, 1)[0].replace(/^Yo\b/i, 'Este personaje')}.`,
    'pregunta si hay galletas': (value) => `${value} ¿Y hay galletas?`,
    'usa «literalmente» fuera de contexto': (value) => `Literalmente, ${value.charAt(0).toLocaleLowerCase('es')}${value.slice(1)}`,
    'susurra «no mires atrás»': (value) => `${value} (susurra: no mires atrás).`,
    "dice «esto no es un consejo»": (value) => `${value} Esto no es un consejo.`,
  };
  const transform = transformations[tic];
  return transform
    ? { text: transform(text), ticApplied: true }
    : { text, ticApplied: false };
}

function interpolate(text, character, userName) {
  const safeName = character.name || 'tu personaje';
  return text.replaceAll('{name}', safeName).replaceAll('{user}', userName || 'amigo');
}

function respond(character, userText, history = [], now = Date.now()) {
  const intentClassifier = window.TintaIntentClassifier;
  const memory = window.TintaMemory;
  const previousMessages = Array.isArray(history) ? history : [];
  const lastMessage = previousMessages.at(-1);
  const awayFor =
    lastMessage && Number.isFinite(lastMessage.at)
      ? Math.max(0, now - lastMessage.at)
      : Number.isFinite(character.lastInteractionAt)
        ? Math.max(0, now - character.lastInteractionAt)
        : 0;
  const intent =
    awayFor > 24 * 60 * 60 * 1000
      ? 'silencio'
      : intentClassifier.classifyIntent(userText);
  const moodState = window.TintaMoodEngine.updateMood(character, intent, now);
  const updatedMemory = memory.updateMemory(character, userText, intent);
  const responses = window.TintaResponseBank.RESPONSES[intent];
  const random = createRandom(
    `${character.metrics?.seed || character.id || '811c9dc5'}${now.toString(16)}${previousMessages.length}`,
  );
  const moods = window.TintaResponseBank.MOOD_RESPONSES[moodState.mood] || [];
  const shouldUseMood = moodState.moodIntensity > 0.6 && random() < 0.6;
  let text;

  if (shouldUseMood && moods.length > 0) {
    text = choose(moods, random);
  } else {
    const traitRoll = random();
    const traits = Array.isArray(character.traits) ? character.traits : [];
    const selectedTrait =
      traitRoll < 0.5
        ? traits[0]
        : traitRoll < 0.8
          ? traits[1] || traits[0]
          : null;
    const voice = selectedTrait
      ? window.TintaResponseBank.TRAIT_VOICES[selectedTrait]
      : null;
    text = choose(responses.base, random);
    if (voice) text = `${text} ${choose(voice, random)}`;
  }

  text = interpolate(text, character, updatedMemory.userName);
  const ticResult = applyTic(text, character.tic, random);

  return {
    text: ticResult.text,
    intent,
    newMood: moodState.mood,
    newMoodIntensity: moodState.moodIntensity,
    ticApplied: ticResult.ticApplied,
    memory: updatedMemory,
    awayForMs: awayFor,
  };
}

window.TintaChatEngine = { respond };
