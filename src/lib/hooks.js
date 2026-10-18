import { useCallback, useEffect, useRef, useState } from 'react';
import { store } from './store/index.js';
import { SETTINGS_DEFAULTS } from './profile.js';

/** Lista una tabla y se actualiza sola cuando alguien (otra pestaña, otro visitante, el admin) la cambia. */
export function useTable(table) {
  const [state, setState] = useState({ rows: [], loading: true, error: null });
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const rows = await store.list(table);
      if (alive.current) setState({ rows, loading: false, error: null });
    } catch (error) {
      if (alive.current) setState((s) => ({ ...s, loading: false, error }));
    }
  }, [table]);

  useEffect(() => {
    alive.current = true;
    let timer;
    load();
    const off = store.subscribe(table, () => {
      clearTimeout(timer);
      timer = setTimeout(load, 100);
    });
    return () => {
      alive.current = false;
      clearTimeout(timer);
      off();
    };
  }, [table, load]);

  return { ...state, reload: load };
}

/** Ajustes del sitio (contacto, disponibilidad, CV…). Siempre devuelve valores por defecto completos. */
export function useSettings() {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () =>
      store
        .getSettings()
        .then((s) => alive && (setSettings(s), setLoading(false)))
        .catch(() => alive && setLoading(false));
    load();
    const off = store.subscribe('settings', load);
    return () => {
      alive = false;
      off();
    };
  }, []);

  const save = useCallback((patch) => store.saveSettings(patch), []);
  return { settings, loading, save };
}

/** Sesión del administrador. */
export function useAdminSession() {
  const [state, setState] = useState({ session: null, loading: true });
  useEffect(() => {
    let alive = true;
    const check = () => store.auth.getSession().then((session) => alive && setState({ session, loading: false }));
    check();
    const off = store.auth.onChange(check);
    return () => {
      alive = false;
      off();
    };
  }, []);
  return state;
}

/** Hash router mínimo: "#/admin/comentarios" → ["admin","comentarios"]. */
export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (path) => {
  window.location.hash = path.startsWith('#') ? path : '#/' + path.replace(/^\//, '');
};

/** Evita que un visitante dé "me gusta" varias veces al mismo comentario (por navegador). */
export function useLikedSet() {
  const read = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem('fp.liked') || '[]'));
    } catch {
      return new Set();
    }
  };
  const [liked, setLiked] = useState(read);
  const add = (id) => {
    const next = new Set(liked).add(id);
    setLiked(next);
    try {
      localStorage.setItem('fp.liked', JSON.stringify([...next]));
    } catch {
      /* noop */
    }
  };
  return [liked, add];
}
