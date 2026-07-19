// ENTIDAD 404 — operaciones de inventario (puras)
import { ITEM_MAP } from '../data/items.js';

export function addItem(inv, id, qty = 1) {
  if (!ITEM_MAP[id]) return inv;
  inv[id] = Math.min(999, (inv[id] || 0) + qty);
  return inv;
}
export function removeItem(inv, id, qty = 1) {
  if (!inv[id]) return false;
  inv[id] -= qty;
  if (inv[id] <= 0) delete inv[id];
  return true;
}
export function countDistinct(inv) { return Object.keys(inv).length; }
export function itemsOfType(inv, tipo) {
  return Object.entries(inv)
    .map(([id, qty]) => ({ item: ITEM_MAP[id], qty }))
    .filter(e => e.item && e.item.tipo === tipo);
}
