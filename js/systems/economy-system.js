// ENTIDAD 404 — economía: tienda, venta, cápsulas
import { ITEM_MAP, CAPSULE_POOL } from '../data/items.js';
import { addItem, removeItem } from '../models/inventory.js';
import { weightedPick } from '../utils/random.js';

export function canAfford(wallet, item, qty = 1) {
  if (item.precioEcos) return wallet.ecos >= item.precioEcos * qty;
  return wallet.fragmentos >= item.precio * qty;
}

export function buy(state, itemId, qty = 1) {
  const item = ITEM_MAP[itemId];
  if (!item) return { ok:false, reason:'Objeto desconocido.' };
  if (!canAfford(state.wallet, item, qty)) return { ok:false, reason:'No tienes suficiente para esta compra.' };
  if (item.precioEcos) state.wallet.ecos -= item.precioEcos * qty;
  else state.wallet.fragmentos -= item.precio * qty;
  state.counters = state.counters || {};
  state.counters.compras = (state.counters.compras || 0) + 1;
  if (item.tipo === 'capsula') {
    state.counters.capsulas = (state.counters.capsulas || 0) + 1;
    const wonId = weightedPick(CAPSULE_POOL);
    addItem(state.inventory, wonId, 1);
    state.counters.objetos_distintos = Object.keys(state.inventory).length;
    return { ok:true, capsule:true, won: ITEM_MAP[wonId] };
  }
  addItem(state.inventory, itemId, qty);
  state.counters.objetos_distintos = Object.keys(state.inventory).length;
  return { ok:true, item };
}

export function sell(state, itemId, qty = 1) {
  const item = ITEM_MAP[itemId];
  if (!item) return { ok:false, reason:'Objeto desconocido.' };
  if (item.tipo === 'capsula' || item.precioEcos) return { ok:false, reason:'Este objeto no se puede vender.' };
  if ((state.inventory[itemId] || 0) < qty) return { ok:false, reason:'No tienes suficientes unidades.' };
  removeItem(state.inventory, itemId, qty);
  const value = Math.floor(item.precio * 0.4) * qty;
  state.wallet.fragmentos = Math.min(999999, state.wallet.fragmentos + value);
  return { ok:true, value };
}

// Recompensa de minijuego con rendimiento decreciente según energía de juego
export function gameReward(baseFragments, score, gameEnergy) {
  const energyMult = gameEnergy > 0 ? 1 : 0.25; // sin energía: recompensa simbólica
  const fragments = Math.max(1, Math.floor((baseFragments + score * 0.4) * energyMult));
  const ecos = score >= 25 && gameEnergy > 0 ? 1 : 0;
  return { fragments: Math.min(fragments, 60), ecos };
}
