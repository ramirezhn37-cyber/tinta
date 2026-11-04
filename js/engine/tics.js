const TICS = [
  "repite «obvio» al final de cada frase",
  'pregunta siempre la hora',
  'cambia de tema a comida',
  "empieza frases con «técnicamente»",
  "termina con «…o eso creo»",
  'se ríe con «je» en lugar de «ja»',
  'menciona a su primo imaginario',
  'cuenta hasta tres antes de responder',
  "dice «según mis cálculos»",
  'llama «jefe» al usuario',
  'habla de sí en tercera persona',
  'pregunta si hay galletas',
  'usa «literalmente» fuera de contexto',
  'susurra «no mires atrás»',
  "dice «esto no es un consejo»",
];

function getTic(random) {
  return TICS[Math.floor(random() * TICS.length)];
}

window.TintaTics = { TICS, getTic };
