// Piezas compartidas de las secciones Proyectos, Stack, Credenciales y Comentarios.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import Img from '../../ui/Img.jsx';

/* ───────── utilidades ───────── */
export const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : '');

export function lsGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}
export function lsSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
}

export function useMedia(query, initial = false) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : initial);
  const [m, setM] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

export const norm = (s = '') =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9+#]/g, '');

const hash = (s = '') => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/* ───────── estilos propios (prefijo sb-) ───────── */
export function SbStyles() {
  return <style>{CSS}</style>;
}

const CSS = `
@keyframes sb-fade{from{opacity:0}to{opacity:1}}
@keyframes sb-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes sb-swap{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.sb-sec{position:relative;border-top:1px solid var(--line)}
.sb-h2{font-family:var(--font-display);font-weight:600;font-size:clamp(2.2rem,5.2vw,4.2rem);letter-spacing:-.03em;line-height:1}
.sb-lead{color:var(--fg-2);max-width:62ch;line-height:1.65}

/* portada tipográfica */
.sb-pat{position:absolute;inset:0;container-type:size;overflow:hidden;background-color:var(--bg-2)}
.sb-pat-0{background-image:repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 12px)}
.sb-pat-1{background-image:repeating-linear-gradient(135deg,var(--line) 0 1px,transparent 1px 14px)}
.sb-pat-2{background-image:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 18px),repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 18px)}
.sb-pat-3{background-image:repeating-radial-gradient(circle at 88% 12%,transparent 0 15px,var(--line) 15px 16px)}
.sb-mono{position:absolute;right:6%;bottom:-2%;font-family:var(--font-display);font-weight:600;line-height:.8;letter-spacing:-.04em;
  font-size:min(88cqh,52cqw);color:var(--bg-2);-webkit-text-stroke:1px var(--fg-3);user-select:none}
.sb-pat-cat{position:absolute;left:6%;top:7%;font-size:.78rem;color:var(--fg-3);max-width:60%}
@container (max-width:200px){.sb-pat-cat{display:none}}

/* overlay / modal */
.sb-ov{position:fixed;inset:0;z-index:1000;background:var(--bg);color:var(--fg);animation:sb-fade .22s var(--ease);overscroll-behavior:contain}
.sb-ov:focus{outline:none}
.sb-ov-dim{background:rgba(8,8,9,.94)}
.sb-iconbtn{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:999px;border:1px solid var(--line);background:rgba(12,13,14,.6);color:var(--fg);cursor:pointer;transition:background .2s var(--ease),border-color .2s var(--ease)}
.sb-iconbtn:hover{background:var(--bg-2);border-color:var(--fg-3)}
.sb-iconbtn[disabled]{opacity:.35;pointer-events:none}

/* lightbox */
.sb-lb{display:flex;flex-direction:column;height:100%}
.sb-lb-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px var(--gutter)}
.sb-lb-stage{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:0 var(--gutter);touch-action:pan-y}
.sb-lb-scroll{width:100%;height:100%;overflow:auto;display:flex}
.sb-lb-scroll>img,.sb-lb-scroll>span{margin:auto}
.sb-lb-img{max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in}
.sb-lb-img[data-z='1']{max-width:none;max-height:none;width:210%;cursor:zoom-out}
.sb-lb-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2}
.sb-lb-cap{padding:14px var(--gutter) 22px;color:var(--fg-2);font-size:.92rem;text-align:center;min-height:56px}
@media(max-width:640px){.sb-lb-nav{top:auto;bottom:-4px;transform:none}}
`;

/* ───────── overlay con foco atrapado, Escape y bloqueo de scroll ───────── */
let lockCount = 0;
const stack = [];
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Overlay({ label, onClose, onKey, className = '', children }) {
  const ref = useRef(null);
  const cb = useRef({ onClose, onKey });
  cb.current = { onClose, onKey };

  useLayoutEffect(() => {
    const id = Symbol('ov');
    const prev = document.activeElement;
    stack.push(id);
    const root = document.documentElement;
    if (lockCount++ === 0) {
      const sw = window.innerWidth - root.clientWidth;
      root.dataset.sbPad = root.style.paddingRight || '';
      root.style.overflow = 'hidden';
      if (sw > 0) root.style.paddingRight = sw + 'px';
    }
    const el = ref.current;
    const first = el.querySelector('[data-autofocus]') || el.querySelector(FOCUSABLE) || el;
    first.focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cb.current.onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
        if (!items.length) {
          e.preventDefault();
          return;
        }
        const a = items[0];
        const z = items[items.length - 1];
        if (!el.contains(document.activeElement)) {
          e.preventDefault();
          a.focus();
        } else if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
        return;
      }
      cb.current.onKey?.(e);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      const i = stack.indexOf(id);
      if (i >= 0) stack.splice(i, 1);
      if (--lockCount === 0) {
        root.style.overflow = '';
        root.style.paddingRight = root.dataset.sbPad || '';
        delete root.dataset.sbPad;
      }
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div ref={ref} className={`sb-ov ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} data-lenis-prevent>
      {children}
    </div>,
    document.body,
  );
}

/* ───────── deslizar en táctil ───────── */
export function useSwipe(onPrev, onNext) {
  const st = useRef(null);
  const moved = useRef(false);
  return {
    swiped: () => moved.current,
    bind: {
      onPointerDown: (e) => {
        moved.current = false;
        if (e.pointerType === 'mouse') return;
        st.current = { x: e.clientX, y: e.clientY };
      },
      onPointerUp: (e) => {
        const s = st.current;
        st.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          moved.current = true;
          dx < 0 ? onNext() : onPrev();
        }
      },
      onPointerCancel: () => {
        st.current = null;
      },
    },
  };
}

/* ───────── lightbox con zoom ───────── */
export function Lightbox({ items, index, onIndex, onClose }) {
  const [zoom, setZoom] = useState(false);
  const n = items.length;
  const cur = items[index] || items[0];
  const box = useRef(null);
  const go = (d) => {
    if (n < 2) return;
    setZoom(false);
    onIndex((index + d + n) % n);
  };
  const swipe = useSwipe(() => go(-1), () => go(1));

  useEffect(() => {
    if (zoom && box.current) {
      const b = box.current;
      b.scrollLeft = (b.scrollWidth - b.clientWidth) / 2;
      b.scrollTop = (b.scrollHeight - b.clientHeight) / 2;
    }
  }, [zoom]);

  if (!cur) return null;
  return (
    <Overlay
      label={cur.alt || 'Imagen ampliada'}
      className="sb-ov-dim"
      onClose={onClose}
      onKey={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        else if (e.key === 'ArrowRight') go(1);
        else if (e.key === '+' || e.key === '=') setZoom(true);
        else if (e.key === '-') setZoom(false);
      }}
    >
      <div className="sb-lb">
        <div className="sb-lb-bar">
          <span className="text-fg-2 text-sm" aria-live="polite">{n > 1 ? `${index + 1} de ${n}` : ''}</span>
          <div className="flex gap-2">
            <button type="button" className="sb-iconbtn" onClick={() => setZoom((z) => !z)} aria-label={zoom ? 'Reducir imagen' : 'Ampliar imagen'} aria-pressed={zoom}>
              {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>
            <button type="button" className="sb-iconbtn" onClick={onClose} aria-label="Cerrar" data-autofocus>
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="sb-lb-stage" {...swipe.bind}>
          {n > 1 && (
            <button type="button" className="sb-iconbtn sb-lb-nav" style={{ left: 'max(8px,calc(var(--gutter) - 18px))' }} onClick={() => go(-1)} aria-label="Imagen anterior">
              <ChevronLeft size={20} />
            </button>
          )}
          <div ref={box} className="sb-lb-scroll">
            <Img key={cur.src} src={cur.src} alt={cur.alt || ''} className="sb-lb-img" data-z={zoom ? '1' : '0'} onClick={() => !swipe.swiped() && setZoom((z) => !z)} draggable={false} />
          </div>
          {n > 1 && (
            <button type="button" className="sb-iconbtn sb-lb-nav" style={{ right: 'max(8px,calc(var(--gutter) - 18px))' }} onClick={() => go(1)} aria-label="Imagen siguiente">
              <ChevronRight size={20} />
            </button>
          )}
        </div>
        <p className="sb-lb-cap">{cur.caption || ''}</p>
      </div>
    </Overlay>
  );
}

/* ───────── portada tipográfica (sin imágenes) ───────── */
export function SbCover({ title = '', category = '' }) {
  const pat = hash(title) % 4;
  const letter = (title.trim()[0] || '·').toUpperCase();
  return (
    <span className={`sb-pat sb-pat-${pat}`} aria-hidden>
      {category ? <span className="sb-pat-cat">{category}</span> : null}
      <span className="sb-mono">{letter}</span>
    </span>
  );
}

/** Portada de un proyecto: imagen (object-cover) o tipografía. Rellena a su contenedor (position:relative). */
export function SbMedia({ project, index = 0, alt = '' }) {
  const src = project.image_urls?.[index];
  if (src) return <Img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />;
  return <SbCover title={project.title} category={project.category} />;
}

export function useToolMap(tools) {
  return useMemo(() => {
    const m = new Map();
    tools.forEach((t) => m.set(norm(t.name), t));
    return m;
  }, [tools]);
}
