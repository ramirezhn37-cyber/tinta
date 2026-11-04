const app = document.querySelector('#app');
const toastRegion = document.querySelector('#toast-region');
let state = window.TintaStorage.loadState();
let teardownPage = () => {};
let toastTimeout = 0;

function showToast(message) {
  window.clearTimeout(toastTimeout);
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  toastRegion.replaceChildren(toast);
  toastTimeout = window.setTimeout(() => {
    toastRegion.replaceChildren();
  }, 3000);
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

function getRoute() {
  const path = window.location.hash.replace(/^#/, '') || '/';
  const match = path.match(/^\/character\/([^/]+)$/);
  if (match) return { page: 'character', id: decodeURIComponent(match[1]) };
  if (path === '/draw') return { page: 'draw' };
  if (path === '/gallery') return { page: 'gallery' };
  if (path === '/') return { page: 'home' };
  return { page: 'not-found' };
}

function header(activePage) {
  const links = [
    { href: '#/', label: 'Inicio', page: 'home' },
    { href: '#/draw', label: 'Crear personaje', page: 'draw' },
    { href: '#/gallery', label: 'Mi galería', page: 'gallery' },
  ];

  return `
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="#/" aria-label="Tinta Viva, inicio">
          <span class="brand-mark" aria-hidden="true">tv</span>
          <span>Tinta Viva</span>
        </a>
        <nav class="main-nav" aria-label="Navegación principal">
          ${links
            .map(
              (link) => `
                <a class="nav-link${activePage === link.page ? ' nav-link-active' : ''}"
                   href="${link.href}"${activePage === link.page ? ' aria-current="page"' : ''}>
                  ${link.label}
                </a>`,
            )
            .join('')}
        </nav>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <span>Hecho con curiosidad y un poquito de tinta.</span>
      <span class="footer-note">Un dibujo. Una personalidad. Una vida.</span>
    </footer>`;
}

function homePage() {
  const count = state.characters.length;
  return `
    <div class="home-page">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Un pequeño juego de imaginación</span>
          <h1>Dibuja una vida.<br /><span>Descubre quién es.</span></h1>
          <p class="hero-description">
            Un trazo impulsivo, un color inesperado, una personalidad que no planeabas.
            Tu personaje ya está esperando conocerte.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" href="#/draw"><span aria-hidden="true">✳</span> Crear mi personaje</a>
            <a class="button button-quiet" href="#/gallery">Ver mi galería <span aria-hidden="true">↗</span></a>
          </div>
          <div class="hero-footnote">
            <span class="mini-avatars" aria-hidden="true"><i>☻</i><i>✿</i><i>◉</i></span>
            <span>Sin registro. Sin respuestas iguales.</span>
          </div>
        </div>
        <div class="hero-art" aria-label="Ilustración decorativa de un personaje" role="img">
          <div class="art-sun"></div><div class="art-note art-note-top">¿Ya somos amigos?</div>
          <div class="art-character">
            <div class="character-ears"><span></span><span></span></div>
            <div class="character-face">
              <span class="face-eye face-eye-left"></span><span class="face-eye face-eye-right"></span>
              <span class="face-cheek face-cheek-left"></span><span class="face-cheek face-cheek-right"></span>
              <span class="face-mouth"></span>
            </div>
            <div class="character-body"></div>
          </div>
          <div class="art-note art-note-bottom">dibujado por ti ✷</div>
          <span class="art-spark art-spark-one">✳</span><span class="art-spark art-spark-two">✦</span>
        </div>
      </section>
      <section class="welcome-strip" aria-label="Tu colección">
        <span class="strip-label">Tu pequeño universo</span>
        <span>${count === 0 ? 'Todavía no hay personajes. El primero puede ser cualquier cosa.' : `${count} personaje${count === 1 ? '' : 's'} en tu galería.`}</span>
        <a href="#/gallery">Explorar <span aria-hidden="true">→</span></a>
      </section>
      <section class="how-it-works">
        <div><span class="eyebrow">Así de fácil</span><h2>De un garabato a un nuevo amigo.</h2></div>
        <div class="steps-grid">
          <article class="step-card"><span class="step-number">01</span><span class="step-icon step-icon-peach" aria-hidden="true">✎</span><h3>Dibuja sin pensarlo</h3><p>Un círculo, un monstruo, algo que no sabes qué es. Todo vale.</p></article>
          <article class="step-card"><span class="step-number">02</span><span class="step-icon step-icon-yellow" aria-hidden="true">✨</span><h3>Deja que te sorprenda</h3><p>Sus colores y trazos revelan una personalidad propia.</p></article>
          <article class="step-card"><span class="step-number">03</span><span class="step-icon step-icon-green" aria-hidden="true">☺</span><h3>Conoce a tu criatura</h3><p>Habla con ella, descubre sus manías y guárdala en tu galería.</p></article>
        </div>
      </section>
    </div>`;
}

function galleryPage() {
  const characters = state.characters;
  const traits = [...new Set(characters.flatMap((item) => item.traits || []))]
    .sort((left, right) => left.localeCompare(right, 'es'));

  return `
    <section class="gallery-page">
      <div class="page-heading">
        <div><span class="eyebrow">Tu colección</span><h1>Mi galería</h1><p>Un lugarcito para todas las vidas que has dibujado.</p></div>
        <a class="button button-primary" href="#/draw"><span aria-hidden="true">＋</span> Crear personaje</a>
      </div>
      <div class="gallery-transfer-actions" aria-label="Importar y exportar personajes">
        <button class="button button-quiet export-gallery-button" type="button"${characters.length === 0 ? ' disabled' : ''}>Exportar galería</button>
        <label class="button button-quiet import-gallery-label">
          Importar archivo JSON
          <input class="gallery-import-input" type="file" accept=".json,application/json" />
        </label>
      </div>
      <div class="gallery-filters"${characters.length === 0 ? ' hidden' : ''}>
        <label class="gallery-search-label">
          <span>Buscar</span>
          <input class="gallery-search" type="search" placeholder="Nombre o rasgo" autocomplete="off" />
        </label>
        <label>
          <span>Rasgo</span>
          <select class="gallery-trait-filter">
            <option value="">Todos los rasgos</option>
            ${traits.map((trait) => `<option value="${escapeHtml(trait)}">${escapeHtml(trait)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>Ánimo</span>
          <select class="gallery-mood-filter">
            <option value="">Todos los ánimos</option>
            ${['neutral', 'feliz', 'euforico', 'molesto', 'aburrido', 'triste']
              .map((mood) => `<option value="${mood}">${mood}</option>`)
              .join('')}
          </select>
        </label>
        <label>
          <span>Ordenar</span>
          <select class="gallery-sort">
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="name-asc">Nombre A–Z</option>
            <option value="name-desc">Nombre Z–A</option>
            <option value="rarity">Rareza</option>
          </select>
        </label>
        <button class="gallery-clear-filters" type="button">Limpiar filtros</button>
      </div>
      <p class="gallery-result-count" role="status" aria-live="polite"></p>
      <div class="empty-gallery gallery-empty-state"${characters.length > 0 ? ' hidden' : ''}>
        <span class="empty-illustration" aria-hidden="true"><span>?</span><i>✦</i></span>
        <h2>Tu galería está en blanco (por ahora).</h2>
        <p>Los personajes que dibujes viven aquí. También puedes importar una exportación.</p>
        <a class="button button-primary" href="#/draw">Dibujar a alguien</a>
      </div>
      <p class="gallery-no-results" hidden>No encontramos personajes con esos filtros. Prueba con otros o límpialos.</p>
      <div class="character-grid gallery-character-grid"></div>
    </section>`;
}

function characterPage(id) {
  const character = state.characters.find((item) => item.id === id);
  if (!character) {
    return `<section class="placeholder-page">
      <span class="eyebrow">Aún no le conocemos</span><h1>Este personaje todavía no existe.</h1>
      <p>Cuando le des vida a un dibujo, su historia aparecerá aquí.</p>
      <a class="button button-primary" href="#/draw">Crear un personaje</a>
    </section>`;
  }
  const traits = (character.traits || [])
    .map(
      (trait, index) => `
        <div class="profile-trait">
          <span class="trait-chip">${escapeHtml(trait)}</span>
          <p>${escapeHtml(character.traitReasons?.[index] || '')}</p>
        </div>`,
    )
    .join('');
  const messages = (character.chatHistory || [])
    .map((message) => chatBubbleMarkup(message, character.name))
    .join('');

  return `
    <section class="character-page">
      <a class="back-to-gallery" href="#/gallery">← Volver a la galería</a>
      <div class="character-profile">
        <div class="profile-art">
          <img src="${escapeHtml(character.imageDataUrl)}" alt="Dibujo de ${escapeHtml(character.name)}" />
          <span class="rarity-badge rarity-${escapeHtml(character.rarity)}">${escapeHtml(character.rarity)}</span>
        </div>
        <div class="profile-details">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Nació de tus trazos</span>
          <div class="profile-title">
            <label class="sr-only" for="character-name">Nombre del personaje</label>
            <input id="character-name" class="character-name-input" maxlength="32" value="${escapeHtml(character.name)}" />
            <button class="save-name-button" type="button" aria-label="Guardar nombre" title="Guardar nombre">✓</button>
          </div>
          <p class="name-help">Puedes editar su nombre; sus rasgos son solo suyos.</p>
          <div class="mood-line">
            <span class="mood-badge mood-${escapeHtml(character.mood || 'neutral')}">${escapeHtml(character.mood || 'neutral')}</span>
            <span class="mood-caption">así se siente ahora</span>
          </div>
          <h2 class="profile-section-title">Tres pistas sobre su personalidad</h2>
          <div class="profile-traits">${traits}</div>
          <blockquote class="profile-catchphrase">“${escapeHtml(character.catchphrase)}”</blockquote>
          <p class="profile-tic"><strong>Su pequeña manía:</strong> ${escapeHtml(character.tic)}.</p>
          <div class="profile-actions">
            <a class="button button-primary" href="#chat"><span aria-hidden="true">☻</span> Conversar</a>
            <button class="button button-quiet share-character-button" type="button">Compartir</button>
            <button class="button button-quiet export-character-button" type="button">Exportar JSON</button>
            <button class="button button-quiet download-image-button" type="button">Descargar PNG</button>
            <button class="button button-danger delete-character-button" type="button">Borrar</button>
          </div>
        </div>
      </div>

      <section id="chat" class="chat-panel" aria-label="Conversación con ${escapeHtml(character.name)}">
        <div class="chat-heading">
          <div><span class="eyebrow">Un ratito para conocerse</span><h2>Habla con ${escapeHtml(character.name)}</h2></div>
          <span class="chat-mood-pill mood-${escapeHtml(character.mood || 'neutral')}">${escapeHtml(character.mood || 'neutral')}</span>
        </div>
        <div class="chat-window" role="log" aria-live="polite" aria-relevant="additions text">
          ${messages || '<p class="chat-empty">Prueba con un «hola», cuéntale algo de tu día o pregúntale qué le gusta.</p>'}
          <div class="typing-indicator" hidden aria-label="${escapeHtml(character.name)} está escribiendo">
            <span></span><span></span><span></span>
            <span class="typing-label">${escapeHtml(character.name)} está pensando</span>
          </div>
        </div>
        <form class="chat-form">
          <label class="sr-only" for="chat-input">Tu mensaje</label>
          <textarea id="chat-input" rows="2" maxlength="500" placeholder="Escribe algo para ${escapeHtml(character.name)}…" required></textarea>
          <button class="button button-primary chat-send-button" type="submit">Enviar <span aria-hidden="true">↑</span></button>
          <span class="chat-form-hint">Enter para enviar · Shift + Enter para una nueva línea</span>
        </form>
      </section>
    </section>`;
}

function chatBubbleMarkup(message, characterName) {
  const isUser = message.from === 'user';
  return `<article class="chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-character'}">
    ${isUser ? '' : `<span class="chat-avatar" aria-hidden="true">${escapeHtml(characterName.slice(0, 1))}</span>`}
    <div><p>${escapeHtml(message.text)}</p><time datetime="${new Date(message.at).toISOString()}">${new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(message.at)}</time></div>
  </article>`;
}

function updateCharacter(character) {
  const nextCharacters = state.characters.map((item) =>
    item.id === character.id ? character : item,
  );
  const nextState = { ...state, characters: nextCharacters };
  if (!window.TintaStorage.saveState(nextState)) {
    showToast('No se pudieron guardar los cambios. Revisa el almacenamiento del navegador.');
    return false;
  }
  state = nextState;
  return true;
}

function addCharacter(character) {
  const nextState = {
    ...state,
    characters: [character, ...state.characters.filter((item) => item.id !== character.id)],
  };
  if (!window.TintaStorage.saveState(nextState)) {
    showToast('No se pudo guardar el personaje. Revisa el almacenamiento del navegador.');
    return false;
  }
  state = nextState;
  return true;
}

function downloadTextFile(filename, text, mimeType) {
  const file = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || 'personaje';
}

function createImportedId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mountGalleryPage() {
  const searchInput = app.querySelector('.gallery-search');
  const traitFilter = app.querySelector('.gallery-trait-filter');
  const moodFilter = app.querySelector('.gallery-mood-filter');
  const sortSelect = app.querySelector('.gallery-sort');
  const clearFiltersButton = app.querySelector('.gallery-clear-filters');
  const grid = app.querySelector('.gallery-character-grid');
  const count = app.querySelector('.gallery-result-count');
  const emptyState = app.querySelector('.gallery-empty-state');
  const noResults = app.querySelector('.gallery-no-results');
  const filters = app.querySelector('.gallery-filters');
  const exportButton = app.querySelector('.export-gallery-button');
  const importInput = app.querySelector('.gallery-import-input');

  function renderCharacters() {
    const query = searchInput.value.trim().toLocaleLowerCase('es');
    const selectedTrait = traitFilter.value;
    const selectedMood = moodFilter.value;
    const characters = state.characters
      .filter((character) => {
        const searchable = [character.name, ...(character.traits || [])]
          .join(' ')
          .toLocaleLowerCase('es');
        return (
          (!query || searchable.includes(query)) &&
          (!selectedTrait || (character.traits || []).includes(selectedTrait)) &&
          (!selectedMood || (character.mood || 'neutral') === selectedMood)
        );
      })
      .sort((left, right) => {
        switch (sortSelect.value) {
          case 'oldest':
            return (left.createdAt || 0) - (right.createdAt || 0);
          case 'name-asc':
            return left.name.localeCompare(right.name, 'es');
          case 'name-desc':
            return right.name.localeCompare(left.name, 'es');
          case 'rarity': {
            const rarityOrder = { comun: 0, raro: 1, epico: 2, legendario: 3 };
            return (rarityOrder[right.rarity] || 0) - (rarityOrder[left.rarity] || 0);
          }
          default:
            return (right.createdAt || 0) - (left.createdAt || 0);
        }
      });

    grid.innerHTML = characters
      .map(
        (character) => `
          <a class="gallery-character" href="#/character/${encodeURIComponent(character.id)}">
            <img src="${escapeHtml(character.imageDataUrl)}" alt="Dibujo de ${escapeHtml(character.name)}" loading="lazy" />
            <div class="gallery-character-copy">
              <h2>${escapeHtml(character.name)}</h2>
              <p>${escapeHtml((character.traits || []).join(' · '))}</p>
              <span class="gallery-character-meta">
                <span class="mood-${escapeHtml(character.mood || 'neutral')}">${escapeHtml(character.mood || 'neutral')}</span>
                <span class="rarity-${escapeHtml(character.rarity)}">${escapeHtml(character.rarity)}</span>
              </span>
            </div>
          </a>`,
      )
      .join('');

    const hasCharacters = state.characters.length > 0;
    filters.hidden = !hasCharacters;
    emptyState.hidden = hasCharacters;
    noResults.hidden = characters.length > 0 || !hasCharacters;
    grid.hidden = characters.length === 0;
    count.textContent = hasCharacters
      ? `${characters.length} de ${state.characters.length} personaje${state.characters.length === 1 ? '' : 's'}`
      : '';
    exportButton.disabled = !hasCharacters;
  }

  function handleExport() {
    try {
      const contents = window.TintaTransfer.exportGallery(state.characters);
      downloadTextFile(
        `tinta-viva-galeria-${new Date().toISOString().slice(0, 10)}.json`,
        contents,
        'application/json',
      );
      showToast('Exportación lista. Guarda ese archivo para llevarte la galería.');
    } catch (error) {
      console.error('Tinta Viva: no se pudo exportar la galería.', error);
      showToast(error.message || 'No se pudo exportar la galería.');
    }
  }

  async function handleImport() {
    const file = importInput.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('El archivo supera el límite de 20 MB.');
      importInput.value = '';
      return;
    }

    importInput.disabled = true;
    try {
      const contents = await file.text();
      if (!importInput.isConnected) return;
      const imported = window.TintaTransfer.parseImport(contents);
      if (state.characters.length + imported.length > 100) {
        throw new RangeError('La galería admite hasta 100 personajes para importar y exportar.');
      }
      if (!window.confirm(`Se añadirán ${imported.length} personaje${imported.length === 1 ? '' : 's'} a tu galería. ¿Continuar?`)) {
        return;
      }

      const now = Date.now();
      const newCharacters = imported.map((character, index) => ({
        ...character,
        id: createImportedId(),
        createdAt: character.createdAt ?? now + index,
        updatedAt: now,
        mood: character.mood || 'neutral',
        moodIntensity: character.moodIntensity ?? 0,
        chatHistory: character.chatHistory || [],
        lastInteractionAt: character.lastInteractionAt ?? now,
        lastSeenAt: character.lastSeenAt ?? now,
        visitCount: character.visitCount || 0,
        diary: character.diary || [],
        memory: character.memory || { userName: '', lastTopic: null },
      }));
      const nextState = {
        ...state,
        characters: [...newCharacters, ...state.characters],
      };
      if (!window.TintaStorage.saveState(nextState)) {
        showToast('No se pudo guardar la importación. Revisa el espacio disponible del navegador.');
        return;
      }
      state = nextState;
      render();
      showToast(`${newCharacters.length} personaje${newCharacters.length === 1 ? '' : 's'} añadido${newCharacters.length === 1 ? '' : 's'} a tu galería.`);
    } catch (error) {
      console.error('Tinta Viva: no se pudo importar el archivo.', error);
      showToast(error.message || 'No se pudo importar ese archivo JSON.');
    } finally {
      importInput.disabled = false;
      importInput.value = '';
    }
  }

  searchInput.addEventListener('input', renderCharacters);
  traitFilter.addEventListener('change', renderCharacters);
  moodFilter.addEventListener('change', renderCharacters);
  sortSelect.addEventListener('change', renderCharacters);
  clearFiltersButton.addEventListener('click', () => {
    searchInput.value = '';
    traitFilter.value = '';
    moodFilter.value = '';
    sortSelect.value = 'recent';
    renderCharacters();
    searchInput.focus();
  });
  exportButton.addEventListener('click', handleExport);
  importInput.addEventListener('change', handleImport);
  renderCharacters();

  return () => {
    searchInput.removeEventListener('input', renderCharacters);
    traitFilter.removeEventListener('change', renderCharacters);
    moodFilter.removeEventListener('change', renderCharacters);
    sortSelect.removeEventListener('change', renderCharacters);
    exportButton.removeEventListener('click', handleExport);
    importInput.removeEventListener('change', handleImport);
  };
}

function mountCharacterPage(id) {
  const character = state.characters.find((item) => item.id === id);
  if (!character) return () => {};

  const visitTime = Date.now();
  const viewedCharacter = {
    ...character,
    visitCount: (character.visitCount || 0) + 1,
    lastSeenAt: visitTime,
    updatedAt: visitTime,
  };
  if (!updateCharacter(viewedCharacter)) return () => {};

  const nameInput = app.querySelector('#character-name');
  const saveNameButton = app.querySelector('.save-name-button');
  const chatWindow = app.querySelector('.chat-window');
  const typingIndicator = app.querySelector('.typing-indicator');
  const chatForm = app.querySelector('.chat-form');
  const chatInput = app.querySelector('#chat-input');
  const sendButton = app.querySelector('.chat-send-button');
  const shareButton = app.querySelector('.share-character-button');
  const deleteButton = app.querySelector('.delete-character-button');
  const exportCharacterButton = app.querySelector('.export-character-button');
  const downloadImageButton = app.querySelector('.download-image-button');
  let busy = false;

  function saveName() {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.value = viewedCharacter.name;
      showToast('El nombre no puede estar vacío.');
      return;
    }
    if (name.length > 32) {
      showToast('El nombre debe tener 32 caracteres o menos.');
      return;
    }
    if (name === viewedCharacter.name) return;
    const nextCharacter = { ...viewedCharacter, name, updatedAt: Date.now() };
    if (updateCharacter(nextCharacter)) {
      viewedCharacter.name = name;
      app.querySelector('.chat-heading h2').textContent = `Habla con ${name}`;
      app.querySelector('.chat-panel').setAttribute('aria-label', `Conversación con ${name}`);
      chatInput.placeholder = `Escribe algo para ${name}…`;
      showToast('Nombre guardado. ¡Ahora sí que es suyo!');
    }
  }

  async function shareCharacter() {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/character/${encodeURIComponent(id)}`;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Enlace copiado. ¡Compártelo con quien quieras!');
      } catch (error) {
        console.error('Tinta Viva: no se pudo copiar el enlace.', error);
        showToast('El navegador no permitió copiar el enlace.');
      }
      return;
    }
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = shareUrl;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand('copy');
    temporaryInput.remove();
    if (copied) showToast('Enlace copiado. ¡Compártelo con quien quieras!');
    else showToast('No se pudo copiar el enlace en este navegador.');
  }

  function exportCharacter() {
    try {
      const contents = window.TintaTransfer.exportCharacter(viewedCharacter);
      downloadTextFile(
        `tinta-viva-${safeFilename(viewedCharacter.name)}.json`,
        contents,
        'application/json',
      );
      showToast('Ficha exportada. Ya puedes compartir el archivo JSON.');
    } catch (error) {
      console.error('Tinta Viva: no se pudo exportar el personaje.', error);
      showToast(error.message || 'No se pudo exportar el personaje.');
    }
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.href = viewedCharacter.imageDataUrl;
    link.download = `tinta-viva-${safeFilename(viewedCharacter.name)}.png`;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    showToast('Dibujo descargado como PNG.');
  }

  function deleteCharacter() {
    const shouldDelete = window.confirm(
      `¿Borramos a ${viewedCharacter.name}? Su conversación también se perderá.`,
    );
    if (!shouldDelete) return;
    const nextState = {
      ...state,
      characters: state.characters.filter((item) => item.id !== id),
    };
    if (!window.TintaStorage.saveState(nextState)) {
      showToast('No se pudo borrar el personaje del almacenamiento.');
      return;
    }
    state = nextState;
    window.location.hash = '#/gallery';
    showToast(`${viewedCharacter.name} volvió a su mundo de tinta.`);
  }

  function appendMessage(message) {
    const emptyMessage = chatWindow.querySelector('.chat-empty');
    if (emptyMessage) emptyMessage.remove();
    typingIndicator.insertAdjacentHTML(
      'beforebegin',
      chatBubbleMarkup(message, viewedCharacter.name),
    );
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (busy) return;
    const text = chatInput.value.trim();
    if (!text) return;

    busy = true;
    sendButton.disabled = true;
    chatInput.disabled = true;
    const now = Date.now();
    const response = window.TintaChatEngine.respond(
      viewedCharacter,
      text,
      viewedCharacter.chatHistory || [],
      now,
    );
    const userMessage = window.TintaMemory.createMessage('user', text, now, {
      intent: response.intent,
      moodAtTime: viewedCharacter.mood || 'neutral',
    });
    const withUserMessage = {
      ...viewedCharacter,
      memory: response.memory,
      chatHistory: [...(viewedCharacter.chatHistory || []), userMessage].slice(-500),
      updatedAt: now,
    };
    if (!updateCharacter(withUserMessage)) {
      busy = false;
      sendButton.disabled = false;
      chatInput.disabled = false;
      return;
    }
    viewedCharacter.chatHistory = withUserMessage.chatHistory;
    viewedCharacter.memory = withUserMessage.memory;
    appendMessage(userMessage);
    chatInput.value = '';
    typingIndicator.hidden = false;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    await new Promise((resolve) =>
      window.setTimeout(resolve, 300 + Math.floor(Math.random() * 601)),
    );

    const replyTime = Date.now();
    const characterMessage = window.TintaMemory.createMessage(
      'character',
      response.text,
      replyTime,
      {
        intent: response.intent,
        moodAtTime: response.newMood,
      },
    );
    const nextCharacter = {
      ...viewedCharacter,
      mood: response.newMood,
      moodIntensity: response.newMoodIntensity,
      lastInteractionAt: replyTime,
      lastSeenAt: replyTime,
      updatedAt: replyTime,
      chatHistory: [...viewedCharacter.chatHistory, characterMessage].slice(-500),
      diary: window.TintaMemory.addDiaryEntry(
        viewedCharacter,
        replyTime,
        `Conversó sobre ${response.intent} con ${response.memory.userName || 'su visitante'}.`,
      ),
    };
    if (updateCharacter(nextCharacter)) {
      Object.assign(viewedCharacter, nextCharacter);
      if (chatWindow.isConnected) {
        typingIndicator.hidden = true;
        app.querySelector('.mood-badge').textContent = response.newMood;
        app.querySelector('.mood-badge').className = `mood-badge mood-${response.newMood}`;
        app.querySelector('.chat-mood-pill').textContent = response.newMood;
        app.querySelector('.chat-mood-pill').className = `chat-mood-pill mood-${response.newMood}`;
        appendMessage(characterMessage);
      }
    } else {
      typingIndicator.hidden = true;
    }
    busy = false;
    sendButton.disabled = false;
    chatInput.disabled = false;
    if (chatInput.isConnected) chatInput.focus();
  }

  function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  }

  function handleNameKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveName();
      nameInput.blur();
    }
  }

  saveNameButton.addEventListener('click', saveName);
  nameInput.addEventListener('keydown', handleNameKeyDown);
  shareButton.addEventListener('click', shareCharacter);
  deleteButton.addEventListener('click', deleteCharacter);
  exportCharacterButton.addEventListener('click', exportCharacter);
  downloadImageButton.addEventListener('click', downloadImage);
  chatForm.addEventListener('submit', sendMessage);
  chatInput.addEventListener('keydown', handleEnter);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return () => {
    saveNameButton.removeEventListener('click', saveName);
    nameInput.removeEventListener('keydown', handleNameKeyDown);
    shareButton.removeEventListener('click', shareCharacter);
    deleteButton.removeEventListener('click', deleteCharacter);
    exportCharacterButton.removeEventListener('click', exportCharacter);
    downloadImageButton.removeEventListener('click', downloadImage);
    chatForm.removeEventListener('submit', sendMessage);
    chatInput.removeEventListener('keydown', handleEnter);
  };
}

function notFoundPage() {
  return `<section class="placeholder-page">
    <span class="eyebrow">Página no encontrada</span><h1>Este trazo se salió del lienzo.</h1>
    <p>Pero podemos volver a empezar.</p><a class="button button-primary" href="#/">Volver al inicio</a>
  </section>`;
}

function render() {
  teardownPage();
  teardownPage = () => {};
  const route = getRoute();
  let content;

  switch (route.page) {
    case 'home':
      content = homePage();
      break;
    case 'draw':
      content = '<div id="drawing-studio"></div>';
      break;
    case 'gallery':
      content = galleryPage();
      break;
    case 'character':
      content = characterPage(route.id);
      break;
    default:
      content = notFoundPage();
  }

  app.innerHTML = `${header(route.page)}<main class="page-main">${content}</main>${footer()}`;

  if (route.page === 'draw') {
    teardownPage = window.TintaDraw.mountDrawingStudio(
      app.querySelector('#drawing-studio'),
      showToast,
      (character) => {
        if (addCharacter(character)) {
          window.location.hash = `#/character/${encodeURIComponent(character.id)}`;
        }
      },
    );
  } else if (route.page === 'character') {
    teardownPage = mountCharacterPage(route.id);
  } else if (route.page === 'gallery') {
    teardownPage = mountGalleryPage();
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('storage', (event) => {
  if (event.key === 'tinta-viva-state') {
    state = window.TintaStorage.loadState();
    render();
  }
});

window.addEventListener('beforeunload', teardownPage);

if (window.location.hash === '') {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
}

render();

window.tintaViva = {
  getState: () => structuredClone(state),
  saveState: (nextState) => {
    state = { ...window.TintaStorage.initialState, ...nextState };
    if (window.TintaStorage.saveState(state)) render();
  },
};
