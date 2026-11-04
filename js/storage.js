const STORAGE_KEY = 'tinta-viva-state';

const initialState = {
  schemaVersion: 2,
  characters: [],
  settings: {
    soundEnabled: false,
    reduceMotion: false,
  },
};

function isPersistedState(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.schemaVersion === 2 &&
    Array.isArray(value.characters) &&
    typeof value.settings === 'object' &&
    value.settings !== null &&
    typeof value.settings.soundEnabled === 'boolean' &&
    typeof value.settings.reduceMotion === 'boolean'
  );
}

function loadState() {
  try {
    const savedState = window.localStorage.getItem(STORAGE_KEY);
    if (savedState === null) return structuredClone(initialState);

    const parsed = JSON.parse(savedState);
    if (!isPersistedState(parsed)) {
      console.error(
        'Tinta Viva: los datos guardados no coinciden con el esquema actual.',
      );
      return structuredClone(initialState);
    }

    return parsed;
  } catch (error) {
    console.error('Tinta Viva: no se pudo leer el estado guardado.', error);
    return structuredClone(initialState);
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Tinta Viva: no se pudo guardar el estado.', error);
    return false;
  }
}

window.TintaStorage = { initialState, loadState, saveState };
