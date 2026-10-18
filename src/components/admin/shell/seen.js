import { useEffect, useState } from 'react';
import { useTable } from '../../../lib/hooks.js';

// "Visto por última vez" por bandeja, guardado en este navegador. Alimenta las marcas "Nuevo" y los contadores de la barra lateral.
const key = (k) => `fp.admin.seen.${k}`;

export const getSeen = (k) => {
  try {
    return Number(localStorage.getItem(key(k))) || 0;
  } catch {
    return 0;
  }
};

export const markSeen = (k, at = Date.now()) => {
  try {
    localStorage.setItem(key(k), String(at));
  } catch {
    /* sin almacenamiento: las marcas simplemente no persisten */
  }
  window.dispatchEvent(new Event('fp:seen'));
};

/** Cuántas filas de `table` son posteriores a la última visita. `skip` = estoy dentro de esa bandeja. */
export function useUnseenCount(table, { skip = false, unreadField } = {}) {
  const { rows } = useTable(table);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((n) => n + 1);
    window.addEventListener('fp:seen', on);
    window.addEventListener('storage', on);
    return () => {
      window.removeEventListener('fp:seen', on);
      window.removeEventListener('storage', on);
    };
  }, []);
  if (unreadField) return rows.filter((r) => !r[unreadField]).length;
  if (skip) return 0;
  void tick;
  const since = getSeen(table);
  return rows.filter((r) => new Date(r.created_at).getTime() > since).length;
}
