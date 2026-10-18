// Piezas compartidas por Projects, Tools, Certificates y Comments (panel admin).
import { useEffect, useId, useRef } from 'react';

/** Campo de formulario con etiqueta, ayuda, contador y error junto al control. */
export function FormField({ label, hint, error, required, counter, children, htmlFor, className = '' }) {
  return (
    <div className={`field ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span aria-hidden className="text-gold"> *</span>}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p className="text-[0.78rem]" style={{ color: 'var(--danger)' }} role="alert" id={htmlFor ? `${htmlFor}-err` : undefined}>
          {error}
        </p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Counter({ value, max }) {
  const n = value.length;
  return (
    <span className="hint tabular-nums" style={n > max ? { color: 'var(--danger)' } : n > max * 0.9 ? { color: 'var(--warn)' } : undefined} aria-live="off">
      {n}/{max}
    </span>
  );
}

export const isHttpUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Monograma neutro cuando no hay imagen. */
export function Monogram({ text = '', className = '' }) {
  const t = (text.trim()[0] || '·').toUpperCase();
  return (
    <span
      aria-hidden
      className={`grid place-items-center font-display text-fg-3 ${className}`}
      style={{ background: 'var(--bg-2)', border: '1px solid var(--line)' }}
    >
      {t}
    </span>
  );
}

/** Avisa al cerrar la pestaña mientras haya cambios sin guardar. */
export function useBeforeUnload(active) {
  useEffect(() => {
    if (!active) return undefined;
    const h = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [active]);
}

/** Lista de iconos pequeños sin dependencias: botón solo-icono accesible. */
export function IconBtn({ label, onClick, disabled, danger, active, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-icon ${danger ? 'btn-danger' : ''} ${className}`}
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Campo de búsqueda. */
export function SearchBox({ value, onChange, placeholder = 'Buscar', label = 'Buscar', icon }) {
  const id = useId();
  return (
    <div className="relative min-w-0 flex-1" style={{ maxWidth: 420 }}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3">{icon}</span>
      <input id={id} type="search" className="input" style={{ paddingLeft: '2.4rem' }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

/** Foco al primer campo con error tras un intento de guardado. */
export function useFocusFirstError(errors, attempt) {
  const root = useRef(null);
  useEffect(() => {
    if (!attempt) return;
    const el = root.current?.querySelector('[aria-invalid="true"]');
    el?.focus();
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  return root;
}

export const errMsg = (e, fallback) => (e && e.message ? e.message : fallback);
