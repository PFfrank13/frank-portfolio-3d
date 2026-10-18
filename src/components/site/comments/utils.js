import { useEffect, useRef, useState } from 'react';
import { LIMITS } from '../../../lib/config.js';

export const cx = (...a) => a.filter(Boolean).join(' ');

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');
export const RAW_MAX_BYTES = 25 * 1024 * 1024; // se comprime al subir; esto solo evita decodificar archivos absurdos
export const COOLDOWN_MS = 20000;
export const NAME_KEY = 'fp.comment.name';
export const LAST_KEY = 'fp.comment.last';

export const mb = (bytes) => (bytes / 1048576).toFixed(bytes < 10485760 ? 1 : 0).replace('.', ',');

export function validateName(v) {
  const t = v.trim();
  if (!t) return 'Escribe tu nombre.';
  if (t.length > LIMITS.commentName) return `El nombre admite hasta ${LIMITS.commentName} caracteres.`;
  return '';
}

export function validateText(v) {
  const t = v.trim();
  if (!t) return 'Escribe tu comentario.';
  if (t.length > LIMITS.commentText) return `Sobran ${t.length - LIMITS.commentText} caracteres: el máximo es ${LIMITS.commentText}.`;
  return '';
}

/** Comprueba tipo y peso; devuelve el mensaje de error o ''. */
export function checkImageFile(file) {
  if (!IMAGE_TYPES.includes(file.type)) return 'Ese archivo no es una imagen compatible. Usa JPG, PNG, WebP o GIF.';
  if (file.type === 'image/gif' && file.size > LIMITS.imageMaxBytes) return `El GIF pesa ${mb(file.size)} MB y el máximo es ${mb(LIMITS.imageMaxBytes)} MB.`;
  if (file.size > RAW_MAX_BYTES) return `La imagen pesa ${mb(file.size)} MB; el máximo es ${mb(RAW_MAX_BYTES)} MB.`;
  if (file.size === 0) return 'El archivo está vacío.';
  return '';
}

/** Verifica que el navegador pueda decodificar la imagen (descarta archivos dañados). */
export function canDecode(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/** Fuerza un re-render cada `ms` para refrescar tiempos relativos. */
export function useTick(ms = 60000) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return n;
}

const sig = (r) => `${r.replies?.length || 0}|${r.is_pinned ? 1 : 0}`;

/**
 * Detecta lo que cambia en vivo DESPUÉS de la carga inicial.
 * Devuelve { [id]: 'new' | 'reply' | 'pinned' } durante `ttl` ms; `onNew(filas)` avisa de filas añadidas.
 */
export function useFresh(rows, ready, { onNew, kinds = ['new', 'reply', 'pinned'], ttl = 4800 } = {}) {
  const prev = useRef(null);
  const timers = useRef(new Set());
  const cb = useRef(onNew);
  cb.current = onNew;
  const kindsRef = useRef(kinds);
  const [fresh, setFresh] = useState({});

  useEffect(() => {
    if (!ready) return;
    const next = new Map(rows.map((r) => [r.id, r]));
    if (prev.current) {
      const add = {};
      const added = [];
      rows.forEach((r) => {
        const old = prev.current.get(r.id);
        if (!old) {
          added.push(r);
          add[r.id] = 'new';
        } else if (sig(old) !== sig(r)) {
          if ((r.replies?.length || 0) > (old.replies?.length || 0)) add[r.id] = 'reply';
          else if (r.is_pinned && !old.is_pinned) add[r.id] = 'pinned';
        }
      });
      const ids = Object.keys(add).filter((id) => kindsRef.current.includes(add[id]));
      if (ids.length) {
        const pick = Object.fromEntries(ids.map((id) => [id, add[id]]));
        setFresh((f) => ({ ...f, ...pick }));
        const t = setTimeout(() => {
          timers.current.delete(t);
          setFresh((f) => {
            const n = { ...f };
            ids.forEach((id) => delete n[id]);
            return n;
          });
        }, ttl);
        timers.current.add(t);
      }
      if (added.length) cb.current?.(added);
    }
    prev.current = next;
  }, [rows, ready, ttl]);

  useEffect(() => {
    const set = timers.current;
    return () => set.forEach(clearTimeout);
  }, []);

  return fresh;
}
