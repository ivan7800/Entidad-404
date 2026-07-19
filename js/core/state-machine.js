// ENTIDAD 404 — máquina de estados visuales (transitorios)
// Gestiona la animación puntual activa (comer, saltar, sacudirse...) sobre
// el estado de ánimo base. Una sola animación transitoria a la vez.
import { bus } from './event-bus.js';

let current = null; // { anim, until }
let timer = null;

export const StateMachine = {
  /** Lanza una animación transitoria durante ms milisegundos. */
  trigger(anim, ms = 1600) {
    if (timer) clearTimeout(timer);
    current = { anim, until: Date.now() + ms };
    bus.emit('anim:start', anim);
    timer = setTimeout(() => {
      current = null;
      timer = null;
      bus.emit('anim:end', anim);
    }, ms);
  },
  get active() {
    if (current && current.until > Date.now()) return current.anim;
    return null;
  },
  clear() {
    if (timer) clearTimeout(timer);
    current = null; timer = null;
  }
};
