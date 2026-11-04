function clampIntensity(value) {
  return Math.max(-1, Math.min(1, value));
}

function updateMood(character, intent, now) {
  let intensity = Number.isFinite(character.moodIntensity)
    ? character.moodIntensity
    : 0;
  const previousInteraction = Number.isFinite(character.lastInteractionAt)
    ? character.lastInteractionAt
    : now;
  const awayFor = Math.max(0, now - previousInteraction);

  if (awayFor > 24 * 60 * 60 * 1000) intensity -= 0.15;
  if (intent === 'halago') intensity += 0.2;
  if (intent === 'insulto') intensity -= 0.3;
  if (intent === 'pregunta_personal') intensity += 0.05;
  intensity = clampIntensity(intensity);

  let mood;
  if (intensity > 0.6) mood = 'euforico';
  else if (intensity >= 0.2) mood = 'feliz';
  else if (intensity > -0.2) mood = 'neutral';
  else if (intensity >= -0.6) {
    mood = awayFor > 6 * 60 * 60 * 1000 ? 'aburrido' : 'molesto';
  } else mood = 'triste';

  return {
    mood,
    moodIntensity: Math.round(intensity * 100) / 100,
    awayForMs: awayFor,
  };
}

window.TintaMoodEngine = { updateMood };
