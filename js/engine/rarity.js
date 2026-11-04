function getRarity(ruleCount) {
  if (ruleCount >= 4) return 'legendario';
  if (ruleCount === 3) return 'epico';
  if (ruleCount === 2) return 'raro';
  return 'comun';
}

window.TintaRarity = { getRarity };
