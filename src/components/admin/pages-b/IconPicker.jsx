import { useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ICON_KEYS, ToolIcon } from '../../../lib/icons.jsx';

const LABELS = { cube: 'genérico', db: 'base de datos', nfc: 'NFC', mic: 'micrófono', cpp: 'C++', openai: 'OpenAI', three: 'Three.js', node: 'Node.js', openjdk: 'Java' };
const label = (k) => (k === 'cube' ? 'Genérico (sin marca)' : LABELS[k] || k);

/** Rejilla buscable de íconos; es un radiogroup (flechas para moverse, Enter/espacio para elegir). */
export default function IconPicker({ value, onChange }) {
  const [q, setQ] = useState('');
  const gid = useId();
  const keys = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ICON_KEYS.filter((k) => !t || k.includes(t) || label(k).toLowerCase().includes(t));
  }, [q]);

  const onKey = (e) => {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!move) return;
    e.preventDefault();
    const btns = [...e.currentTarget.querySelectorAll('button[role="radio"]')];
    const i = btns.indexOf(document.activeElement);
    const next = btns[(Math.max(i, 0) + move + btns.length) % btns.length];
    next?.focus();
  };

  return (
    <div>
      <div className="relative mb-2">
        <label htmlFor={`${gid}-q`} className="sr-only">Buscar ícono</label>
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3"><Search size={15} aria-hidden /></span>
        <input id={`${gid}-q`} type="search" className="input" style={{ paddingLeft: '2.4rem' }} placeholder="Buscar ícono…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <p className="hint mb-2" aria-live="polite">
        Elegido: <strong className="font-medium text-fg">{label(value)}</strong>. {keys.length ? '' : 'Ningún ícono coincide; prueba otra palabra o usa el genérico.'}
      </p>
      <div role="radiogroup" aria-label="Ícono de la herramienta" onKeyDown={onKey} className="grid max-h-[200px] grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5 overflow-y-auto rounded-[12px] p-1.5" style={{ border: '1px solid var(--line)' }}>
        {keys.map((k) => {
          const on = value === k;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={label(k)}
              title={label(k)}
              tabIndex={on || (!keys.includes(value) && k === keys[0]) ? 0 : -1}
              onClick={() => onChange(k)}
              className="flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[10px] px-1 py-2 text-fg-2 transition-colors hover:text-fg"
              style={{ border: `1px solid ${on ? 'var(--gold)' : 'transparent'}`, background: on ? 'var(--gold-soft)' : 'var(--bg-2)', color: on ? 'var(--fg)' : undefined }}
            >
              <ToolIcon name={k} size={22} />
              <span className="w-full truncate text-center text-[0.66rem] text-fg-3">{k}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
