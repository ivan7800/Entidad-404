// ENTIDAD 404 — utilidades de objetos
import { ITEM_MAP } from '../data/items.js';
export function getItem(id) { return ITEM_MAP[id] || null; }
export function priceLabel(item) {
  if (item.precioEcos) return `${item.precioEcos} ecos`;
  return `${item.precio} fragmentos`;
}
