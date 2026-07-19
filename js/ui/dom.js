// ENTIDAD 404 — helpers de DOM para las vistas

// Mapa de iconos simbólicos → glifos visibles. Los catálogos (items, logros)
// usan identificadores estables ('bowl', 'moon'…) y aquí se traducen a un
// glifo real. Antes se pintaba el identificador literal en pantalla.
export const ICON_GLYPHS = {
  // objetos
  ball:'🪀', bed:'🛏️', berry:'🫐', bolt:'⚡', bowl:'🥣', candy:'🍬',
  capsule:'🎁', cookie:'🍪', cube:'🧊', cup:'🥤', drop:'💧', feast:'🍱',
  flask:'🧪', fruit:'🍎', gel:'🍮', honey:'🍯', ingot:'🪙', key:'🗝️',
  lamp:'💡', med:'💊', moss:'🌿', nectar:'🧃', nuts:'🌰', plant:'🪴',
  radio:'📻', ribbon:'🎀', shard:'🔷', steak:'🥩', wall:'🖼️', window:'🪟',
  // logros
  bag:'🎒', book:'📖', box:'📦', brain:'🧠', cake:'🎂', chat:'💬',
  compass:'🧭', crack:'🕳️', crown:'👑', egg:'🥚', eye:'👁️', gamepad:'🎮',
  heart:'💜', moon:'🌙', question:'❓', run:'🏃', spark:'✨', sparkle:'🫧',
  sun:'☀️', wave:'🌊'
};

/** Traduce un identificador de icono a su glifo visible. */
export function glyph(name, fallback = '❖') {
  return ICON_GLYPHS[name] || fallback;
}

export function h(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

export function panel(title, children, attrs = {}) {
  const kids = [];
  if (title) kids.push(h('h2', { class:'panel-title' }, title));
  return h('section', { class:'panel', ...attrs }, kids.concat([].concat(children)));
}

export function statBar(key, label, value, { inverted = false } = {}) {
  const v = Math.round(value);
  const pct = Math.max(0, Math.min(100, v));
  const bad = inverted ? v > 70 : v < 30;
  const crit = inverted ? v > 85 : v < 15;
  const fill = h('span', { class:'stat-fill', style:`width:${pct}%` });
  const bar = h('div', { class:`stat-bar${bad ? ' low' : ''}${crit ? ' crit' : ''}`, role:'meter',
    'aria-valuenow':v, 'aria-valuemin':0, 'aria-valuemax':100, 'aria-label':`${label}: ${v} de 100` }, [fill]);
  return h('div', { class:'stat-row' }, [
    h('span', { class:'stat-label' }, label),
    bar,
    h('span', { class:'stat-num' }, String(v))
  ]);
}

export function btn(label, onClick, { primary = false, danger = false, icon = null, disabled = false, cls = '' } = {}) {
  const b = h('button', { class:`btn ${primary?'primary':''} ${danger?'danger':''} ${cls}`.trim(), onClick, disabled }, [
    icon ? h('span', { class:'btn-icon', 'aria-hidden':'true' }, icon) : null,
    h('span', {}, label)
  ]);
  return b;
}

export function walletChip(state) {
  const fragmentos = Number(state?.wallet?.fragmentos) || 0;
  const ecos = Number(state?.wallet?.ecos) || 0;
  return h('div', { class:'wallet', 'aria-label':`Monedero: ${fragmentos} fragmentos, ${ecos} ecos` }, [
    h('span', { class:'coin frag' }, `◆ ${fragmentos}`),
    h('span', { class:'coin eco' }, `✦ ${ecos}`)
  ]);
}

export function empty(msg) { return h('p', { class:'empty-note' }, msg); }
