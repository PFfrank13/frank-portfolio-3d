/**
 * Disuasión básica en el sitio público: sin selección, copiado, arrastre de imágenes, menú contextual
 * ni atajos de inspección. Los campos de formulario siguen funcionando (se puede escribir y pegar).
 * Ojo: ningún sitio web puede impedirlo del todo (el navegador es del visitante); esto frena el uso casual.
 */
const FIELD = 'input, textarea, select, [contenteditable="true"], [data-allow-select]';
const isAdmin = () => window.location.hash.startsWith('#/admin'); // el panel queda libre (copiar mensajes, etc.)
const inField = (t) => isAdmin() || (t instanceof Element && Boolean(t.closest(FIELD)));

export function installGuard() {
  if (typeof window === 'undefined' || window.__guard) return;
  window.__guard = true;
  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const on = (type, fn) => document.addEventListener(type, fn, true);

  on('contextmenu', (e) => {
    if (!inField(e.target)) stop(e);
  });
  on('selectstart', (e) => {
    if (!inField(e.target)) stop(e);
  });
  on('dragstart', (e) => {
    if (!inField(e.target)) stop(e);
  });
  ['copy', 'cut', 'paste'].forEach((t) =>
    on(t, (e) => {
      if (!inField(e.target)) stop(e);
    })
  );
  on('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    const devtools =
      k === 'f12' ||
      (mod && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) ||
      (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(k)) ||
      (mod && ['u', 's'].includes(k));
    if (devtools && !isAdmin()) return stop(e);
    if (mod && ['a', 'c', 'x', 'v'].includes(k) && !inField(e.target)) stop(e);
  });
}
