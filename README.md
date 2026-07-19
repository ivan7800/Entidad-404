# Entidad 404 — Digital Creature Simulator

PWA premium de criatura digital creada para el Universo 404. Funciona localmente, sin cuentas, sin anuncios y con soporte offline.

## Funciones principales

- Crianza, necesidades, salud, personalidad y vínculo.
- Evolución dinámica por núcleo, conducta y cuidados.
- Siete familias de criaturas y archivo de descubrimientos.
- Inventario, tienda, decoración y economía interna.
- Cuatro minijuegos, logros, diario y eventos aleatorios.
- Tres perfiles, exportación/importación y checksum.
- PWA instalable, navegación móvil y escritorio.
- Skins, contraste, reducción de movimiento, audio y voz.

## Ejecutar

Abre `index.html` directamente o sirve la carpeta con:

```bash
python -m http.server 8000
```

## Pruebas y compilación

```bash
npm install
npm run build
npm test
```

Resultado verificado de la entrega: **36/36 pruebas superadas**.

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `Entidad-404`.
2. Sube **el contenido de esta carpeta a la raíz**, no la carpeta contenedora.
3. Confirma que `index.html`, `.nojekyll`, `app.bundle.js` y `service-worker.js` estén en la raíz.
4. En GitHub abre `Settings → Pages`.
5. En `Build and deployment`, selecciona `Deploy from a branch`.
6. Elige rama `main` y carpeta `/ (root)`.
7. Guarda y abre la URL publicada.
8. Haz una recarga forzada una vez para descartar cachés de versiones previas.

## Privacidad

No se envía información a ningún servidor. Las partidas se guardan en IndexedDB. Usa `Sistema → Respaldo` para conservar copias JSON.

**Versión:** 2.1.0  
**Autor:** I. Roig — Universo 404  
**Licencia:** MIT
