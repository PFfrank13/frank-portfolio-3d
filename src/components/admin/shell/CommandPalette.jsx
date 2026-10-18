import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, ExternalLink, FilePlus2, Globe, LogOut, Search } from 'lucide-react';
import { NAV } from './Layout.jsx';

/** Paleta de comandos (Ctrl/⌘ + K): saltar a cualquier página o ejecutar una acción. */
export default function CommandPalette({ onSignOut }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef(null);

  const items = useMemo(() => {
    const base = [
      ...NAV.map((n) => ({ key: 'n' + n.id, label: `Ir a ${n.label}`, icon: n.icon, run: () => (location.hash = `#/admin${n.id ? '/' + n.id : ''}`) })),
      { key: 'new-p', label: 'Subir un proyecto nuevo', icon: FilePlus2, run: () => (location.hash = '#/admin/proyectos') },
      { key: 'site', label: 'Ver el sitio público', icon: Globe, run: () => (location.hash = '#/') },
      { key: 'site2', label: 'Abrir el sitio en otra pestaña', icon: ExternalLink, run: () => window.open(location.pathname + '#/', '_blank', 'noopener') },
      { key: 'out', label: 'Cerrar sesión', icon: LogOut, run: onSignOut },
    ];
    const t = q.trim().toLowerCase();
    return t ? base.filter((x) => x.label.toLowerCase().includes(t)) : base;
  }, [q, onSignOut]);

  useEffect(() => {
    let g = 0;
    const GO = { d: '', p: 'proyectos', h: 'herramientas', c: 'comentarios', m: 'mensajes', a: 'ajustes', s: 'certificados' };
    const on = (e) => {
      const typing = /^(input|textarea|select)$/i.test(e.target?.tagName || '') || e.target?.isContentEditable;
      if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (g && Date.now() - g < 1200 && e.key.toLowerCase() in GO) {
          g = 0;
          location.hash = `#/admin${GO[e.key.toLowerCase()] ? '/' + GO[e.key.toLowerCase()] : ''}`;
          return;
        }
        g = e.key === 'g' ? Date.now() : 0;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') setOpen(false);
    };
    const ext = () => setOpen(true);
    window.addEventListener('keydown', on);
    window.addEventListener('adm:palette', ext);
    return () => {
      window.removeEventListener('keydown', on);
      window.removeEventListener('adm:palette', ext);
    };
  }, []);
  useEffect(() => {
    if (open) {
      setQ('');
      setI(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);
  useEffect(() => setI(0), [q]);

  const run = (it) => {
    setOpen(false);
    setTimeout(it.run, 60);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setI((n) => (n + 1) % Math.max(1, items.length)));
    else if (e.key === 'ArrowUp') (e.preventDefault(), setI((n) => (n - 1 + items.length) % Math.max(1, items.length)));
    else if (e.key === 'Enter' && items[i]) (e.preventDefault(), run(items[i]));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[120] grid place-items-start justify-items-center px-4 pt-[14vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} role="dialog" aria-modal="true" aria-label="Paleta de comandos">
          <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Cerrar" onClick={() => setOpen(false)} />
          <motion.div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-bg-1 shadow-[0_30px_90px_-20px_rgba(0,0,0,.8)]" initial={{ y: -16, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, scale: 0.98 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
            <label className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-fg-3" aria-hidden />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Escribe una página o acción…" className="h-14 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-fg-3" aria-label="Buscar comando" />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[.7rem] text-fg-3">Esc</kbd>
            </label>
            <ul className="m-0 max-h-[50vh] list-none overflow-y-auto p-2">
              {items.map((it, n) => (
                <li key={it.key}>
                  <button type="button" onMouseEnter={() => setI(n)} onClick={() => run(it)} className={`flex min-h-[46px] w-full items-center gap-3 rounded-xl px-3 text-left text-[.95rem] ${n === i ? 'bg-bg-2 text-fg' : 'text-fg-2'}`}>
                    <it.icon size={17} className={n === i ? 'text-gold' : ''} aria-hidden />
                    <span className="flex-1">{it.label}</span>
                    {n === i && <CornerDownLeft size={14} className="text-fg-3" aria-hidden />}
                  </button>
                </li>
              ))}
              {!q && <li className="px-3 pb-1 pt-3 text-[.76rem] text-fg-3">Atajo rápido: pulsa <kbd className="font-mono">g</kbd> y luego <kbd className="font-mono">d</kbd> resumen · <kbd className="font-mono">p</kbd> proyectos · <kbd className="font-mono">h</kbd> herramientas · <kbd className="font-mono">s</kbd> certificados · <kbd className="font-mono">c</kbd> comentarios · <kbd className="font-mono">m</kbd> mensajes · <kbd className="font-mono">a</kbd> ajustes</li>}
              {!items.length && <li className="px-3 py-6 text-center text-[.9rem] text-fg-3">Nada coincide con «{q}».</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
