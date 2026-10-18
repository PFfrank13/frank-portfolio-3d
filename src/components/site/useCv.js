import { useCallback, useEffect, useState } from 'react';
import cvFile from '../../../cv/Frank_Pineda_CV.pdf';
import { useSettings } from '../../lib/hooks.js';
import { resolveUrl } from '../../lib/images.js';

const blobCache = new Map();

/** Los data: URL (build de un solo archivo) no se pueden abrir en pestaña nueva: se pasan a blob:. */
function toUsableUrl(src) {
  if (!src.startsWith('data:')) return src;
  if (blobCache.has(src)) return blobCache.get(src);
  const comma = src.indexOf(',');
  const meta = src.slice(5, comma);
  const mime = meta.split(';')[0] || 'application/pdf';
  const raw = meta.includes('base64') ? atob(src.slice(comma + 1)) : decodeURIComponent(src.slice(comma + 1));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  blobCache.set(src, url);
  return url;
}

/**
 * Lógica única del CV (Hero y CvSection):
 * settings.cv_url (https o "idb:") con settings.cv_name; si está vacío, el PDF incluido en el sitio.
 */
export function useCvDownload() {
  const { settings } = useSettings();
  const custom = (settings.cv_url || '').trim();
  const name = (settings.cv_name || '').trim() || 'Frank_Pineda_CV.pdf';
  const [state, setState] = useState({ status: 'loading', url: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', url: '' });
    (async () => {
      try {
        const src = custom ? await resolveUrl(custom) : cvFile;
        if (!src) throw new Error('empty');
        const url = toUsableUrl(src);
        if (alive) setState({ status: 'ready', url });
      } catch {
        if (alive) setState({ status: 'error', url: '' });
      }
    })();
    return () => {
      alive = false;
    };
  }, [custom, attempt]);

  const download = useCallback(() => {
    if (!state.url) return;
    const a = document.createElement('a');
    a.href = state.url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [state.url, name]);

  const open = useCallback(() => {
    if (state.url) window.open(state.url, '_blank', 'noopener');
  }, [state.url]);

  return {
    status: state.status,
    ready: state.status === 'ready',
    loading: state.status === 'loading',
    error: state.status === 'error',
    name,
    updatedAt: settings.cv_updated_at,
    download,
    open,
    retry: () => setAttempt((n) => n + 1),
  };
}
