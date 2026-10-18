// Control de scroll compartido: Site.jsx registra la instancia de Lenis; el resto solo la usa.
let lenis = null;
export const NAV_OFFSET = 64;

export const setLenis = (instance) => {
  lenis = instance;
};

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Desplaza hasta una sección por id, sin tocar window.location.hash (el router decide por hash). */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = id === 'inicio' ? 0 : -NAV_OFFSET + 1;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.2 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduced() ? 'auto' : 'smooth' });
}

export function stopScroll() {
  if (lenis) lenis.stop();
  else document.body.style.overflow = 'hidden';
}

export function startScroll() {
  if (lenis) lenis.start();
  document.body.style.overflow = '';
}

/** onClick para enlaces de ancla: scroll suave en lugar de cambiar el hash. */
export const anchorClick = (id, after) => (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  e.preventDefault();
  scrollToId(id);
  after?.();
};
