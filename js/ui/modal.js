// ENTIDAD 404 — modal accesible con focus trap y Escape
let active = null;

export function openModal({ title, body, actions = [], onClose } = {}) {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  const titleId = 'modal-title';
  modal.setAttribute('aria-labelledby', titleId);

  const h = document.createElement('h2');
  h.id = titleId; h.className = 'modal-title'; h.textContent = title || '';
  modal.appendChild(h);

  const content = document.createElement('div');
  content.className = 'modal-body';
  if (typeof body === 'string') content.textContent = body;
  else if (body instanceof Node) content.appendChild(body);
  modal.appendChild(content);

  const bar = document.createElement('div');
  bar.className = 'modal-actions';
  if (actions.length === 0) actions = [{ label:'Cerrar', primary:true }];
  for (const a of actions) {
    const btn = document.createElement('button');
    btn.className = `btn ${a.danger ? 'danger' : a.primary ? 'primary' : ''}`;
    btn.textContent = a.label;
    btn.addEventListener('click', () => {
      const keep = a.onClick && a.onClick();
      if (!keep) closeModal();
    });
    bar.appendChild(btn);
  }
  modal.appendChild(bar);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const prevFocus = document.activeElement;
  const focusables = () => modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusables()[0];
  if (first) first.focus();

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    else if (e.key === 'Tab') {
      const f = Array.from(focusables());
      if (f.length === 0) return;
      const idx = f.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); f[f.length-1].focus(); }
      else if (!e.shiftKey && idx === f.length-1) { e.preventDefault(); f[0].focus(); }
    }
  }
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', onKey);

  active = { backdrop, onKey, prevFocus, onClose };
  return { close: closeModal };
}

export function closeModal() {
  if (!active) return;
  document.removeEventListener('keydown', active.onKey);
  active.backdrop.remove();
  if (active.onClose) active.onClose();
  if (active.prevFocus && active.prevFocus.focus) active.prevFocus.focus();
  active = null;
}

export function confirmModal(title, message, { danger = false, confirmLabel = 'Confirmar' } = {}) {
  return new Promise((resolve) => {
    openModal({
      title, body:message,
      actions:[
        { label:'Cancelar', onClick:() => { resolve(false); } },
        { label:confirmLabel, primary:!danger, danger, onClick:() => { resolve(true); } }
      ],
      onClose:() => resolve(false)
    });
  });
}
