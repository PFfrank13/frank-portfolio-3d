import { useEffect, useState } from 'react';
import { useResolvedUrl } from '../../lib/images.js';

/** <img> que entiende URLs "idb:" (modo local) y https (Supabase). Muestra un bloque neutro mientras carga o si falla. */
export default function Img({ src, alt = '', className = '', fallback = null, ...rest }) {
  const url = useResolvedUrl(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (!url || failed) return fallback ?? <span className={className} style={{ display: 'block', background: 'var(--bg-2)' }} aria-hidden />;
  return <img src={url} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFailed(true)} {...rest} />;
}
