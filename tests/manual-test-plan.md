# Plan de pruebas manuales — Entidad 404 1.0.3

Los tests automatizados cubren el motor y el arranque. Este plan completa las comprobaciones que dependen de instalación PWA, permisos, tiempo real, navegadores y uso prolongado.

## 1. Arranque y recuperación
- [ ] Primera apertura: aparece creación sin errores de consola.
- [ ] Con cero partidas no se intenta leer `.state` de una entrada nula.
- [ ] Con una ranura antigua o dañada, se omite la entrada y la aplicación sigue arrancando.
- [ ] Con IndexedDB bloqueado, aparece el aviso de almacenamiento alternativo y se puede crear/jugar.
- [ ] Tras publicar una nueva versión sobre una instalación anterior, no se mezclan módulos antiguos y nuevos.
- [ ] Los botones **Reintentar** y **Limpiar caché y reintentar** recuperan una instalación dañada.

## 2. Primera partida
- [ ] Los tres núcleos cambian la selección visible.
- [ ] El nombre se recorta, sanea y no interpreta HTML.
- [ ] El botón de creación se bloquea mientras guarda para impedir dobles envíos.
- [ ] Con tres ranuras ocupadas, se pide borrar una; ninguna partida se sobrescribe.

## 3. Navegación y partidas
- [ ] Todas las pantallas del menú abren sin error y el elemento activo se resalta.
- [ ] Recargar una ruta profunda por hash mantiene la pantalla o redirige de forma segura.
- [ ] Borrar una partida no activa no afecta a las otras.
- [ ] Borrar la partida activa detiene el autoguardado, vuelve a creación y no recrea la ranura.
- [ ] Cambiar de ranura carga sus datos y no conserva configuración temporal de otra sesión.

## 4. Ciclo, cuidados y salud
- [ ] Eclosión y evoluciones ocurren en los tiempos previstos.
- [ ] Un objeto evolutivo presente en el inventario puede habilitar su familia objetivo.
- [ ] Alimentar, acariciar, limpiar y hablar actualizan estadísticas e inventario una sola vez.
- [ ] Apagar/encender la luz cambia inmediatamente icono, texto y estado de sueño.
- [ ] Salud muestra nombre, síntomas, causa y medicina correcta.

## 5. Minijuegos y economía
- [ ] Los cuatro minijuegos responden a ratón, táctil y teclado.
- [ ] Cada partida consume energía y actualiza saldo/récord visualmente al terminar.
- [ ] Comprar, vender y abrir cápsulas modifican saldos e inventario de forma coherente.
- [ ] No se compra sin saldo y no hay duplicaciones por doble clic.

## 6. Tiempo real y modos
- [ ] Volver tras una ausencia muestra un único informe y aplica el tiempo una sola vez.
- [ ] El máximo offline es 72 h y un reloj atrasado no produce penalización negativa.
- [ ] Descanso y vacaciones cambian el botón inmediatamente y alteran la degradación.
- [ ] Desactivar vacaciones restablece su marca temporal.

## 7. Persistencia y copias
- [ ] Recargar conserva la partida en IndexedDB.
- [ ] Exportar e importar un JSON válido restaura el estado.
- [ ] Un checksum manipulado o un archivo de otra app se rechaza.
- [ ] Las copias rotativas permiten recuperar un guardado principal dañado.
- [ ] localStorage alternativo conserva el progreso entre recargas cuando IndexedDB está bloqueado.

## 8. Responsive, UX y accesibilidad
- [ ] 360×800, 390×844, 768×1024, 1280×800 y 1440×1000 sin scroll horizontal.
- [ ] La navegación móvil no tapa controles ni zonas seguras del dispositivo.
- [ ] En escritorio, cabecera y contenido quedan a la izquierda y el panel lateral a la derecha.
- [ ] Las 7 skins, alto contraste, fuente, animaciones y glitch se aplican y persisten.
- [ ] Foco visible, orden lógico, Escape en modal y controles activables con teclado.
- [ ] VoiceOver/NVDA anuncia títulos, estadísticas, avisos y cambios relevantes.
- [ ] Contraste validado en todas las skins, no solo en la predeterminada.

## 9. PWA y GitHub Pages
- [ ] Publicación desde `main` y `/(root)` sin 404 en iconos, manifiesto, CSS o módulos.
- [ ] Instalación PWA correcta en Chrome/Edge Android y escritorio.
- [ ] Primera carga completa seguida de funcionamiento offline.
- [ ] Actualización entre dos versiones reales sin pantalla en blanco ni error `.state`.
- [ ] Subdirectorio `usuario.github.io/repositorio/` resuelve todas las rutas relativas.
- [ ] Desinstalar y reinstalar la PWA no afecta datos salvo que se borre el almacenamiento del sitio.

## 10. Compatibilidad y resistencia
- [ ] Chrome, Edge, Firefox y Safari actuales.
- [ ] Modo privado: comportamiento claro aunque el almacenamiento sea temporal.
- [ ] Cuota de almacenamiento agotada: error comprensible y posibilidad de exportar.
- [ ] Notificaciones solo piden permiso tras acción explícita y no bloquean el uso si se deniegan.
- [ ] Sesión prolongada de al menos 24 h sin duplicar timers, listeners ni guardados.

## Apertura directa y distribución

- Abrir `index.html` con doble clic: debe aparecer **Crea una entidad imposible**, nunca “No se pudo descargar el módulo principal”.
- Publicar en una subcarpeta de GitHub Pages y comprobar que `app.bundle.js?v=1.0.3` responde correctamente.
- Confirmar que `file://` no intenta registrar un service worker.
- Tras editar archivos dentro de `js/`, ejecutar `npm run build` y comprobar que cambia `app.bundle.js`.
