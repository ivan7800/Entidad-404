// ENTIDAD 404 — navegación premium adaptativa
const NAV = [
  { hash:'#/habitat', label:'Núcleo', icon:'◉', group:'VÍNCULO' },
  { hash:'#/necesidades', label:'Biometría', icon:'▥', group:'VÍNCULO' },
  { hash:'#/alimentar', label:'Nutrición', icon:'◆', group:'CUIDADO' },
  { hash:'#/higiene', label:'Salud', icon:'✚', group:'CUIDADO' },
  { hash:'#/juegos', label:'Simulaciones', icon:'◇', group:'DESARROLLO' },
  { hash:'#/tienda', label:'Suministros', icon:'⬡', group:'DESARROLLO' },
  { hash:'#/mas', label:'Sistema', icon:'⌁', group:'SISTEMA' }
];
export function buildNav(current) {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Navegación principal');
  nav.appendChild(Object.assign(document.createElement('div'), { className:'nav-brand', innerHTML:'<span class="nav-brand-orb" aria-hidden="true"></span><span><strong>ENTIDAD 404</strong><small>DIGITAL CREATURE SIMULATOR</small></span>' }));
  let lastGroup = '';
  for (const item of NAV) {
    if (item.group !== lastGroup) {
      const group = document.createElement('div'); group.className='nav-group-label'; group.textContent=item.group; nav.appendChild(group); lastGroup=item.group;
    }
    const a = document.createElement('a');
    a.href = item.hash;
    a.className = 'nav-item' + (current && current.startsWith(item.hash) ? ' active' : '');
    if (current && current.startsWith(item.hash)) a.setAttribute('aria-current', 'page');
    a.innerHTML = `<span class="nav-icon" aria-hidden="true">${item.icon}</span><span class="nav-label">${item.label}</span><span class="nav-arrow" aria-hidden="true">›</span>`;
    nav.appendChild(a);
  }
  const footer=document.createElement('div'); footer.className='nav-footer'; footer.innerHTML='<span class="system-dot"></span><span>LOCAL · OFFLINE READY</span><small>v2.1.0</small>'; nav.appendChild(footer);
  return nav;
}
export const MORE_LINKS = [
  { hash:'#/inventario', label:'Inventario', desc:'Objetos, consumibles y recursos', icon:'▣' },
  { hash:'#/decoracion', label:'Hábitat', desc:'Personaliza la cámara de contención', icon:'⌂' },
  { hash:'#/archivo', label:'Archivo biológico', desc:'Formas y especies descubiertas', icon:'◫' },
  { hash:'#/diario', label:'Registro de vínculo', desc:'Eventos, recuerdos y anomalías', icon:'≡' },
  { hash:'#/logros', label:'Protocolos', desc:'Hitos y recompensas desbloqueadas', icon:'◇' },
  { hash:'#/evoluciones', label:'Matriz evolutiva', desc:'Ramas, requisitos y formas', icon:'⌘' },
  { hash:'#/config', label:'Configuración', desc:'Apariencia, audio y accesibilidad', icon:'⚙' },
  { hash:'#/partidas', label:'Perfiles', desc:'Gestiona tus vínculos activos', icon:'◎' },
  { hash:'#/copias', label:'Respaldo', desc:'Exporta o restaura tu progreso', icon:'⇅' },
  { hash:'#/privacidad', label:'Privacidad', desc:'Datos locales y control total', icon:'◈' }
];
