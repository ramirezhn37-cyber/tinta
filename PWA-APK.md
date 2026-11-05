# Convertir Tinta Viva en APK (Android)

La app ya es PWA. Para publicarla como APK/AAB en Android se recomienda **Trusted Web Activity (TWA)**.

## Opción A — PWABuilder (más fácil, sin instalar nada)

1. Despliega la PWA en un dominio HTTPS (Vercel, Netlify, GitHub Pages).
2. Entra a https://www.pwabuilder.com e introduce la URL.
3. Revisa el informe (debe marcar manifest y service worker válidos).
4. En "Build" → Android → genera el paquete. Descarga el `.aab`/`.apk`.
5. PWABuilder te dará un `assetlinks.json` y un `signing key`. Coloca el `assetlinks.json`
   en `/.well-known/assetlinks.json` de tu dominio (ya hay una plantilla en este repo).
6. Sube el `.aab` a Google Play Console (cuenta de desarrollador requerida).

## Opción B — Bubblewrap (CLI, control total)

```sh
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://tu-dominio/manifest.json
bubblewrap build
```

Genera el APK/AAB y el fingerprint SHA-256 que debes poner en `assetlinks.json`.

## Opción C — Capacitor (si necesitas APIs nativas)

```sh
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Tinta Viva" "com.tudominio.tintaviva" --web-dir .
npx cap add android
npx cap open android
```

Luego compila desde Android Studio. Requiere recompilar para cada actualización.

## Notas

- Play Store exige HTTPS, política de privacidad y cuenta de desarrollador.
- El `assetlinks.json` debe estar accesible en `https://tu-dominio/.well-known/assetlinks.json`.
- Sustituye `com.tudominio.tintaviva` y el fingerprint en `assetlinks.json`.
- Para solo instalar el APK sin Play Store, PWABuilder/Capacitor generan APK directamente.

## Limitación de este entorno

No se pudo compilar un APK aquí (falta Android SDK/terminal). Los archivos anteriores
dejan todo listo para compilar en tu máquina o en PWABuilder.
