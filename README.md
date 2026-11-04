# Tinta Viva

Tinta Viva es un juego de creación y conversación: dibuja una criatura, deja que
sus trazos y colores revelen su personalidad, y vuelve para conocerla mejor.
Funciona en el navegador, sin registro, backend ni servicios de IA externos.

## Stack

- HTML, CSS y JavaScript nativo, sin frameworks ni dependencias de runtime.
- Canvas HTML5 con Pointer Events para ratón, táctil y stylus.
- `localStorage` con esquema versionado (`schemaVersion: 2`).
- Python sirve los archivos estáticos en desarrollo; no es necesario para el
  funcionamiento o el despliegue de la aplicación.
- Navegación con hash (`#/`, `#/draw`, `#/character/:id`, `#/gallery`) para
  funcionar en cualquier servidor estático sin configuración adicional.

## Ejecutar en local

Con Python instalado, ejecuta desde la carpeta del proyecto:

```sh
python -m http.server 8000
```

Abre <http://localhost:8000>. También puedes usar cualquier servidor estático.
No se necesita instalar paquetes.

## Estructura

```text
index.html       Aplicación y navegación
styles.css       Estilos responsive
js/
  app.js         Rutas, páginas y componentes de interfaz
  draw.js        Lienzo, herramientas, historial y métricas en vivo
  analyze-drawing.js Analizador puro de métricas y semilla del dibujo
  storage.js     Lectura/escritura del estado versionado
  transfer.js    Validación e importación/exportación JSON de personajes
  engine/
    personality.js  Rasgos ponderados y nombre determinista
    rarity.js       Rareza por reglas activadas
    catchphrases.js Frases por rasgo
    tics.js         Manías del personaje
  chat/
    intentClassifier.js Clasificación de intenciones y nombre del usuario
    responseBank.js     Respuestas base y voz por rasgo
    moodEngine.js       Estado de ánimo y cambios por conversación
    memory.js           Nombre, último tema, diario y mensajes
    chatEngine.js       Selección de respuesta y aplicación de tics
tests/
  analyze-drawing.test.html  Ejecutor de pruebas sin dependencias
  analyze-drawing.test.js    Cinco dibujos sintéticos
  personality.test.html      Pruebas del generador
  personality.test.js        Determinismo, reglas y contenido
  chat.test.html             Pruebas del chat
  chat.test.js               Intenciones, memoria y cambios de humor
  transfer.test.html         Pruebas de importación y exportación
  transfer.test.js           Formatos, límites y validación de archivos
```

## Progreso y criterios de aceptación

El MVP se construye en **9 fases**:

- [x] **Fase 1 — Esqueleto y navegación.** Navegación entre inicio, dibujo,
  personaje y galería; interfaz responsive; estado compartido mediante
  `localStorage` versionado. Recargar conserva la colección, incluso cuando
  todavía está vacía.
- [x] **Fase 2 — Lienzo de dibujo.** Dibujo con ratón, pantalla táctil o stylus;
  seis colores, tres grosores, borrador, deshacer (hasta 30 acciones) y limpiar.
  Los indicadores de trazos, colores y tiempo se actualizan mientras dibujas.
- [x] **Fase 3 — Análisis del dibujo.** Muestrea píxeles transparentes y opacos,
  colores dominantes, área, contorno aproximado, densidad y variedad cromática.
  Calcula trazos, velocidad, tiempo activo (excluye pausas mayores a 3 s), uso
  del borrador y semilla FNV-1a. Las métricas se muestran en la mesa al terminar
  cada trazo. La variedad cromática se normaliza entre 0 (un solo color) y 1
  (uso uniforme de los colores detectados).
- [x] **Fase 4 — Generación de personalidad.** Reglas ponderadas por color y
  métricas; selección determinista con semilla FNV-1a + xorshift; tres rasgos
  únicos ordenados y explicados; rareza por cantidad de reglas; nombre, frase
  y tic reproducibles. «Dar vida» revela el personaje en una ficha preliminar.
- [x] **Fase 5 — Ficha del personaje.** «Dar vida» guarda el dibujo y sus rasgos
  en la galería; permite renombrar, compartir el enlace, iniciar una conversación
  y borrar con confirmación. La ficha y las visitas se guardan en localStorage.
- [x] **Fase 6 — Conversación y memoria.** Clasifica las 15 intenciones, recuerda
  nombre y tema, aplica cambios de humor y tics, muestra indicador de escritura
  y conserva los mensajes sin conexión ni servicios externos.
- [x] **Fase 7 — Galería y filtros.** Búsqueda por nombre o rasgo, filtros
  combinables por rasgo y ánimo, orden por fecha/nombre/rareza y estado vacío
  cuando no hay coincidencias.
- [x] **Fase 8 — Exportación y compartir.** Descarga el dibujo en PNG, exporta
  una ficha o toda la galería como JSON e importa esos archivos en otro
  navegador/dispositivo. Los enlaces copiados abren la ficha solo si el
  navegador receptor ya tiene ese personaje; para transferirlo, usa el JSON.
  La importación valida el formato, los campos, las imágenes, un límite de
  20 MB y un máximo de 100 personajes antes de guardar; asigna IDs locales
  nuevos para evitar colisiones.
- [x] **Fase 9 — Pulido y preparación del despliegue estático.** Diseño
  adaptable para los nuevos controles, filtros accesibles por teclado, mensajes
  de estado que no interpretan texto como HTML, carga diferida de imágenes y
  metadatos para compartir. La guía de despliegue está documentada abajo; para
  publicar una URL se necesita vincular el proyecto con una cuenta del usuario.

## Validación manual de la Fase 2

1. Abre «Crear personaje».
2. Prueba los seis colores y los tres tamaños, y dibuja con ratón o táctil.
3. Prueba el borrador, deshacer y limpiar.
4. Comprueba que los indicadores de trazos, colores y tiempo se actualizan.

## Pruebas del analizador

Abre `tests/analyze-drawing.test.html` en el navegador (o
<http://localhost:8000/tests/analyze-drawing.test.html> si usas el servidor
Python). La página ejecuta los cinco casos sintéticos y muestra el resultado de
cada uno.

## Pruebas de personalidad

Abre `tests/personality.test.html` en el navegador (o
<http://localhost:8000/tests/personality.test.html>). Comprueba determinismo,
diversidad, reglas, rareza y contenido sin instalar herramientas.

## Pruebas del chat

Abre `tests/chat.test.html` en el navegador (o
<http://localhost:8000/tests/chat.test.html>). Comprueba las 15 intenciones,
memoria, cambios de humor, regreso tras una ausencia, respuestas disponibles y
una frecuencia de tics aproximada del 30 %.

## Pruebas de transferencia

Abre `tests/transfer.test.html` (o
<http://localhost:8000/tests/transfer.test.html>). Comprueba el ciclo de
exportación/importación, la conservación de memoria e historial y el rechazo de
JSON, imágenes, historiales y tamaños no válidos.

## Roadmap v2

- Conversaciones entre personajes dibujados por el usuario.
- Evolución de rasgos al volver a dibujar encima de un personaje.
- Modo de dibujo a ciegas.
- Salas compartidas mediante URL e importación/exportación JSON.
- Voz con Web Speech API.
- Sincronización opcional de galería y logros.

## Despliegue

La aplicación es estática; no necesita servidor de aplicación, instalación de
paquetes ni variables de entorno. Para publicarla en Vercel:

1. Sube la carpeta del proyecto a un repositorio Git propio.
2. En Vercel, selecciona **Add New → Project** e importa ese repositorio.
3. Deja el framework como **Other** y los comandos de build e instalación
   vacíos; publica la raíz del proyecto como contenido estático.
4. Verifica inicio, dibujo, galería e importación en el dominio asignado.

También se puede usar Vercel CLI desde la raíz del proyecto con `vercel`, si
está instalado. Este entorno no está conectado a una cuenta de hosting ni a un
repositorio Git, así que la publicación y la URL pública requieren esa
autorización del propietario.
