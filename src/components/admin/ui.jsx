// Primitivas compartidas del panel de administración.
// Contrato estable: Projects/Tools/Certificates/Comments dependen de estos nombres y firmas.
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { LIMITS } from '../../lib/config.js';
import Img from '../ui/Img.jsx';

const cx = (...a) => a.filter(Boolean).join(' ');

/* ───────────────────────── Estilos acotados ───────────────────────── */
const CSS = `
@keyframes adm-fade{from{opacity:0}to{opacity:1}}
@keyframes adm-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes adm-spin{to{transform:rotate(360deg)}}
.adm-fade{animation:adm-fade .2s var(--ease) both}
.adm-rise{animation:adm-rise .25s var(--ease) both}
.adm-spin{animation:adm-spin .8s linear infinite}
.adm-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;color:var(--fg-2);background:transparent;border:1px solid transparent;cursor:pointer;transition:background .2s var(--ease),color .2s var(--ease),border-color .2s var(--ease)}
.adm-iconbtn:hover:not(:disabled){background:var(--bg-3);color:var(--fg)}
.adm-iconbtn:disabled{opacity:.35;cursor:not-allowed}
.adm-iconbtn.danger:hover:not(:disabled){color:var(--danger)}
@media (pointer:coarse){.adm-iconbtn{width:40px;height:40px}}
`;

/* ───────────────────────── Pila de capas (Escape solo cierra la superior) ───────────────────────── */
const layers = [];
let lockCount = 0;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useLayer(open, ref, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const token = {};
    layers.push(token);
    const prev = document.activeElement;
    if (lockCount++ === 0) document.body.style.overflow = 'hidden';

    const node = ref.current;
    const first = node?.querySelector('[data-autofocus]') || node?.querySelector(FOCUSABLE);
    (first || node)?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (layers[layers.length - 1] !== token) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) {
        e.preventDefault();
        node.focus();
        return;
      }
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === node)) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      } else if (!node.contains(document.activeElement)) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      const i = layers.indexOf(token);
      if (i >= 0) layers.splice(i, 1);
      if (--lockCount === 0) document.body.style.overflow = '';
      if (prev && document.contains(prev)) prev.focus?.({ preventScroll: true });
    };
  }, [open, ref]);
}

/* ───────────────────────── Toasts ───────────────────────── */
let toastSeq = 0;
const toastSubs = new Set();
const pushToast = (tone, message) => {
  const t = { id: ++toastSeq, tone, message: String(message || '') };
  toastSubs.forEach((fn) => fn(t));
  return t.id;
};

export const toast = {
  success: (msg) => pushToast('ok', msg),
  error: (msg) => pushToast('danger', msg),
  info: (msg) => pushToast('info', msg),
};

const TOAST_ICON = { ok: CheckCircle2, danger: AlertCircle, info: Info };
const TOAST_COLOR = { ok: 'var(--ok)', danger: 'var(--danger)', info: 'var(--gold)' };

export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const timers = new Map();
    const dismiss = (id) => {
      clearTimeout(timers.get(id));
      timers.delete(id);
      setItems((l) => l.filter((x) => x.id !== id));
    };
    const sub = (t) => {
      setItems((l) => [...l.slice(-3), t]);
      timers.set(t.id, setTimeout(() => dismiss(t.id), t.tone === 'danger' ? 8000 : 4500));
    };
    toastSubs.add(sub);
    return () => {
      toastSubs.delete(sub);
      timers.forEach(clearTimeout);
    };
  }, []);

  const close = (id) => setItems((l) => l.filter((x) => x.id !== id));

  return (
    <>
      <style>{CSS}</style>
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-stretch gap-2 p-4 sm:inset-x-auto sm:right-0 sm:w-[400px]"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {items.map((t) => {
          const Icon = TOAST_ICON[t.tone];
          return (
            <div
              key={t.id}
              role={t.tone === 'danger' ? 'alert' : 'status'}
              className="adm-rise pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-bg-2 px-3.5 py-3 text-sm text-fg shadow-[0_8px_30px_rgba(0,0,0,.35)]"
            >
              <Icon size={18} className="mt-0.5 shrink-0" style={{ color: TOAST_COLOR[t.tone] }} aria-hidden />
              <p className="min-w-0 flex-1 leading-snug [overflow-wrap:anywhere]">{t.message}</p>
              <button type="button" className="adm-iconbtn -my-1 -mr-1.5" style={{ width: 28, height: 28 }} onClick={() => close(t.id)} aria-label="Cerrar aviso">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ───────────────────────── Modal ───────────────────────── */
const SIZES = { md: 'sm:max-w-[520px]', lg: 'sm:max-w-[760px]', xl: 'sm:max-w-[1040px]' };

export function Modal({ open, onClose, title, size = 'md', footer, children }) {
  const ref = useRef(null);
  const titleId = useId();
  useLayer(open, ref, onClose);
  if (!open) return null;
  return (
    <div
      className="adm-fade fixed inset-0 z-[80] flex items-end justify-center bg-black/65 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'adm-rise flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-bg-1 outline-none sm:max-h-[90dvh] sm:rounded-2xl',
          SIZES[size] || SIZES.md,
        )}
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <button type="button" className="adm-iconbtn -mr-2" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        {footer ? (
          <footer
            className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-bg-1 px-5 py-3.5"
            style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

/* ───────────────────────── Diálogo de confirmación ───────────────────────── */
const dialogSubs = new Set();
export function confirmDialog({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false } = {}) {
  return new Promise((resolve) => {
    const req = { title, message, confirmLabel, cancelLabel, danger, resolve };
    if (!dialogSubs.size) return resolve(window.confirm(`${title || ''}\n${message || ''}`.trim()));
    dialogSubs.forEach((fn) => fn(req));
  });
}

export function DialogHost() {
  const [queue, setQueue] = useState([]);
  useEffect(() => {
    const sub = (req) => setQueue((q) => [...q, req]);
    dialogSubs.add(sub);
    return () => dialogSubs.delete(sub);
  }, []);
  const current = queue[0];
  const settle = useCallback(
    (value) => {
      setQueue((q) => q.slice(1));
      current?.resolve(value);
    },
    [current],
  );
  return current ? <ConfirmView key={queue.length + (current.title || '')} req={current} settle={settle} /> : null;
}

function ConfirmView({ req, settle }) {
  const ref = useRef(null);
  const tid = useId();
  const did = useId();
  useLayer(true, ref, () => settle(false));
  return (
    <div
      className="adm-fade fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && settle(false)}
    >
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={tid}
        aria-describedby={did}
        tabIndex={-1}
        className="adm-rise w-full max-w-[440px] rounded-2xl border border-line bg-bg-1 p-6 outline-none"
      >
        <h2 id={tid} className="font-display text-lg font-semibold tracking-tight">
          {req.title}
        </h2>
        {req.message ? (
          <p id={did} className="mt-2 text-sm leading-relaxed text-fg-2 [overflow-wrap:anywhere]">
            {req.message}
          </p>
        ) : (
          <span id={did} />
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-sm" data-autofocus={req.danger ? '' : undefined} onClick={() => settle(false)}>
            {req.cancelLabel}
          </button>
          <button
            type="button"
            className={cx('btn btn-sm', req.danger ? 'btn-danger' : 'btn-primary')}
            data-autofocus={req.danger ? undefined : ''}
            onClick={() => settle(true)}
          >
            {req.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Piezas pequeñas ───────────────────────── */
export function PageHeader({ title, description, actions }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-line pb-6">
      <div className="min-w-0">
        <h1 className="font-display text-[1.9rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.2rem]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-[62ch] text-[0.95rem] leading-relaxed text-fg-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Empty({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      {hint ? <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-fg-2">{hint}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label = 'Cargando' }) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <span
        className="adm-spin inline-block h-5 w-5 rounded-full border-2 border-line"
        style={{ borderTopColor: 'var(--gold)' }}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

const BADGE = {
  neutral: 'border-line text-fg-2',
  gold: 'border-[color:rgba(213,176,90,.4)] bg-[color:var(--gold-soft)] text-gold',
  ok: 'border-[color:rgba(111,191,138,.35)] bg-[color:rgba(111,191,138,.08)] text-ok',
  danger: 'border-[color:rgba(220,112,102,.35)] bg-[color:rgba(220,112,102,.08)] text-danger',
};
export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={cx('inline-flex items-center rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold leading-tight', BADGE[tone] || BADGE.neutral, className)}>
      {children}
    </span>
  );
}

export function Switch({ checked, onChange, label, hint, disabled = false }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={!!checked}
        aria-labelledby={`${id}-l`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50"
        style={{
          background: checked ? 'var(--gold)' : 'var(--bg-3)',
          borderColor: checked ? 'var(--gold)' : 'var(--line)',
          transitionDuration: '.25s',
        }}
      >
        <span
          className="absolute left-0.5 h-[18px] w-[18px] rounded-full transition-transform"
          style={{
            background: checked ? '#1b1405' : 'var(--fg-2)',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transitionDuration: '.25s',
          }}
        />
      </button>
      {label || hint ? (
        <label htmlFor={id} className="cursor-pointer select-none">
          <span id={`${id}-l`} className="block text-sm font-medium text-fg">
            {label}
          </span>
          {hint ? <span className="hint block">{hint}</span> : null}
        </label>
      ) : null}
    </div>
  );
}

/* ───────────────────────── TagInput ───────────────────────── */
export function TagInput({ value = [], onChange, suggestions = [], placeholder = 'Escribe y pulsa Enter', label, id: idProp }) {
  const auto = useId();
  const id = idProp || auto;
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const has = (t) => value.some((v) => v.toLowerCase() === t.toLowerCase());

  const add = (raw) => {
    const parts = String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = [...value];
    parts.forEach((p) => {
      if (!next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    });
    if (next.length !== value.length) onChange?.(next);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (text.trim()) add(text);
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange?.(value.slice(0, -1));
    }
  };

  const shown = suggestions.filter((s) => !has(s) && s.toLowerCase().includes(text.trim().toLowerCase())).slice(0, 12);

  return (
    <div>
      <div
        className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-line bg-bg-1 px-2 py-1.5 transition-colors focus-within:border-gold focus-within:shadow-[0_0_0_3px_var(--gold-soft)]"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((t, i) => (
          <span key={t} className="chip chip-solid !py-1 pr-1">
            <span className="[overflow-wrap:anywhere]">{t}</span>
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-fg-3 hover:bg-bg-3 hover:text-fg"
              aria-label={`Quitar ${t}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(value.filter((_, j) => j !== i));
                inputRef.current?.focus();
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={text}
          onChange={(e) => (e.target.value.includes(',') ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={onKeyDown}
          onBlur={() => text.trim() && add(text)}
          placeholder={value.length ? '' : placeholder}
          aria-label={label || placeholder}
          className="min-w-[8ch] flex-1 bg-transparent px-1.5 py-1 text-[0.95rem] text-fg outline-none placeholder:text-fg-3"
          autoComplete="off"
        />
      </div>
      {shown.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Sugerencias">
          {shown.map((s) => (
            <button key={s} type="button" className="chip hover:border-fg-3 hover:text-fg" onClick={() => add(s)}>
              <Plus size={11} aria-hidden /> {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── ListEditor ───────────────────────── */
export function ListEditor({ value = [], onChange, placeholder = 'Escribe aquí', addLabel = 'Añadir' }) {
  const refs = useRef([]);
  const focusNext = useRef(null);
  useEffect(() => {
    if (focusNext.current != null) {
      refs.current[focusNext.current]?.focus();
      focusNext.current = null;
    }
  });
  const set = (i, v) => onChange?.(value.map((x, j) => (j === i ? v : x)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    focusNext.current = null;
    onChange?.(next);
  };
  const add = () => {
    focusNext.current = value.length;
    onChange?.([...value, '']);
  };
  return (
    <div className="space-y-2">
      {value.length === 0 ? <p className="hint">Aún no hay elementos.</p> : null}
      <ul className="space-y-2">
        {value.map((v, i) => (
          <li key={i} className="flex items-center gap-1">
            <input
              ref={(el) => (refs.current[i] = el)}
              className="input !min-h-[40px] !py-2"
              value={v}
              placeholder={placeholder}
              aria-label={`${placeholder} ${i + 1}`}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <button type="button" className="adm-iconbtn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir elemento ${i + 1}`}>
              <ArrowUp size={15} />
            </button>
            <button type="button" className="adm-iconbtn" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Bajar elemento ${i + 1}`}>
              <ArrowDown size={15} />
            </button>
            <button type="button" className="adm-iconbtn danger" onClick={() => onChange?.(value.filter((_, j) => j !== i))} aria-label={`Eliminar elemento ${i + 1}`}>
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-sm" onClick={add}>
        <Plus size={14} aria-hidden /> {addLabel}
      </button>
    </div>
  );
}

/* ───────────────────────── ImageUploader ───────────────────────── */
const mb = (n) => `${Math.round(n / 1048576)} MB`;

export function ImageUploader({ value = [], onChange, bucket, multiple = true, max = 12, label }) {
  const inputRef = useRef(null);
  const labelId = useId();
  const hintId = useId();
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const session = useRef(new Set()); // URLs subidas desde que se montó este editor
  const [jobs, setJobs] = useState([]); // { key, name, status: 'up'|'err', error }
  const [drag, setDrag] = useState(false);
  const seq = useRef(0);

  const limit = multiple ? max : 1;
  const room = Math.max(0, limit - value.length - jobs.filter((j) => j.status === 'up').length);

  const emit = (urls) => {
    valueRef.current = urls;
    onChangeRef.current?.(urls);
  };

  const handle = async (fileList) => {
    let files = [...fileList];
    if (!files.length) return;
    const rejected = [];
    const ok = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) rejected.push({ name: f.name, error: 'Solo se aceptan imágenes (JPG, PNG, WebP, GIF, SVG).' });
      else if (f.size > LIMITS.imageMaxBytes * 3 && !/svg|gif/.test(f.type)) ok.push(f); // la compresión reduce; filtro grueso
      else if (f.size > LIMITS.imageMaxBytes && /svg|gif/.test(f.type)) rejected.push({ name: f.name, error: `Supera ${mb(LIMITS.imageMaxBytes)}.` });
      else ok.push(f);
    }
    let slots = multiple ? room : 1;
    const accepted = ok.slice(0, slots);
    ok.slice(slots).forEach((f) => rejected.push({ name: f.name, error: `Máximo ${limit} imagen${limit === 1 ? '' : 'es'}.` }));
    if (rejected.length) {
      setJobs((j) => [...j, ...rejected.map((r) => ({ key: ++seq.current, name: r.name, status: 'err', error: r.error }))]);
    }
    for (const file of accepted) {
      const key = ++seq.current;
      setJobs((j) => [...j, { key, name: file.name, status: 'up' }]);
      try {
        const { url } = await store.upload(bucket, file);
        session.current.add(url);
        setJobs((j) => j.filter((x) => x.key !== key));
        if (multiple) emit([...valueRef.current, url]);
        else {
          const old = valueRef.current[0];
          if (old && session.current.has(old)) {
            session.current.delete(old);
            store.removeFile(old).catch(() => {});
          }
          emit([url]);
        }
      } catch (err) {
        setJobs((j) => j.map((x) => (x.key === key ? { ...x, status: 'err', error: err?.message || 'No se pudo subir el archivo. Inténtalo de nuevo.' } : x)));
      }
    }
  };

  const onPick = (e) => {
    handle(e.target.files || []);
    e.target.value = '';
  };

  const remove = (i) => {
    const url = value[i];
    emit(value.filter((_, j) => j !== i));
    if (url && session.current.has(url)) {
      session.current.delete(url);
      store.removeFile(url).catch(() => {});
    }
  };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    emit(next);
  };

  const uploading = jobs.some((j) => j.status === 'up');
  const full = room === 0;

  return (
    <div>
      {label ? (
        <span id={labelId} className="label mb-1.5 block">
          {label}
        </span>
      ) : null}

      {value.length || jobs.length ? (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-labelledby={label ? labelId : undefined}>
          {value.map((url, i) => (
            <li key={url} className="group relative overflow-hidden rounded-xl border border-line bg-bg-2">
              <Img src={url} alt={i === 0 && multiple ? 'Imagen de portada' : `Imagen ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
              {multiple && i === 0 ? (
                <span className="absolute left-2 top-2">
                  <Badge tone="gold" className="!bg-[#1b1405] backdrop-blur">
                    Portada
                  </Badge>
                </span>
              ) : null}
              <div className="flex items-center justify-between gap-1 border-t border-line bg-bg-1 px-1 py-1">
                <div className="flex">
                  {multiple ? (
                    <>
                      <button type="button" className="adm-iconbtn" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Mover imagen ${i + 1} a la izquierda`}>
                        <ArrowLeft size={15} />
                      </button>
                      <button type="button" className="adm-iconbtn" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Mover imagen ${i + 1} a la derecha`}>
                        <ArrowRight size={15} />
                      </button>
                    </>
                  ) : null}
                </div>
                <button type="button" className="adm-iconbtn danger" onClick={() => remove(i)} aria-label={`Quitar imagen ${i + 1}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
          {jobs.map((j) => (
            <li
              key={j.key}
              className={cx('flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center', j.status === 'err' ? 'border-[color:rgba(220,112,102,.4)]' : 'border-line bg-bg-2')}
              role={j.status === 'err' ? 'alert' : 'status'}
            >
              {j.status === 'up' ? (
                <>
                  <Spinner label={`Subiendo ${j.name}`} />
                  <span className="max-w-full truncate text-xs text-fg-2">Subiendo {j.name}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} className="text-danger" aria-hidden />
                  <span className="max-w-full truncate text-xs font-medium">{j.name}</span>
                  <span className="text-xs leading-snug text-danger">{j.error}</span>
                  <button type="button" className="text-xs text-fg-2 underline underline-offset-2 hover:text-fg" onClick={() => setJobs((l) => l.filter((x) => x.key !== j.key))}>
                    Descartar
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {!full || !multiple ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handle(e.dataTransfer.files || []);
          }}
          className="rounded-xl border border-dashed px-4 py-5 text-center transition-colors"
          style={{ borderColor: drag ? 'var(--gold)' : 'var(--line)', background: drag ? 'var(--gold-soft)' : 'transparent' }}
        >
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading && multiple && full}
            aria-describedby={hintId}
          >
            <Upload size={14} aria-hidden /> {multiple ? (value.length ? 'Añadir imágenes' : 'Subir imágenes') : value.length ? 'Reemplazar imagen' : 'Subir imagen'}
          </button>
          <p id={hintId} className="hint mt-2">
            O arrástralas aquí. Solo imágenes, hasta {mb(LIMITS.imageMaxBytes)} cada una
            {multiple ? `. Quedan ${room} de ${limit}.` : '.'}
          </p>
          <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="sr-only" tabIndex={-1} onChange={onPick} aria-label={label || 'Subir imágenes'} />
        </div>
      ) : (
        <p className="hint">Alcanzaste el máximo de {limit} imágenes. Quita alguna para añadir otra.</p>
      )}
    </div>
  );
}

/* ───────────────────────── useDebounced ───────────────────────── */
export function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
