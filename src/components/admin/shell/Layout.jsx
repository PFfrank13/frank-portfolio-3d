import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CommandPalette from './CommandPalette.jsx';
import { Award, ExternalLink, FolderKanban, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Search as SearchIcon, Settings as SettingsIcon, Wrench, X } from 'lucide-react';
import { store } from '../../../lib/store/index.js';
import { go } from '../../../lib/hooks.js';
import { useUnseenCount } from './seen.js';

export const NAV = [
  { id: '', label: 'Resumen', icon: LayoutDashboard },
  { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  { id: 'herramientas', label: 'Herramientas', icon: Wrench },
  { id: 'certificados', label: 'Certificados', icon: Award },
  { id: 'comentarios', label: 'Comentarios', icon: MessageSquare, badge: 'comments' },
  { id: 'mensajes', label: 'Mensajes', icon: Mail, badge: 'messages' },
  { id: 'ajustes', label: 'Ajustes', icon: SettingsIcon },
];

function Sidebar({ page, onNavigate, onSignOut }) {
  const comments = useUnseenCount('comments', { skip: page === 'comentarios' });
  const messages = useUnseenCount('messages', { unreadField: 'read' });
  const counts = { comments, messages };
  const local = store.mode === 'local';
  return (
    <div className="flex h-full flex-col">
      <p className="flex items-center gap-2.5 px-3 pb-6 pt-1 font-display text-[1.02rem] font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-[.8rem]" aria-hidden>FP</span>
        Panel
      </p>
      <nav aria-label="Secciones del panel" className="grid gap-1">
        {NAV.map(({ id, label, icon: Icon, badge }) => {
          const active = page === id;
          const n = badge ? counts[badge] : 0;
          return (
            <a
              key={id}
              href={`#/admin${id ? '/' + id : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              className={`relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[.95rem] transition-colors ${active ? 'text-fg' : 'text-fg-2 hover:bg-bg-1 hover:text-fg'}`}
            >
              {active && <motion.span layoutId="adm-active" className="absolute inset-0 rounded-xl bg-bg-2" style={{ zIndex: -1 }} transition={{ type: 'spring', stiffness: 420, damping: 34 }} aria-hidden />}
              {active && <motion.span layoutId="adm-bar" className="absolute inset-y-2 left-0 w-[2px] rounded bg-gold" transition={{ type: 'spring', stiffness: 420, damping: 34 }} aria-hidden />}
              <Icon size={18} aria-hidden />
              <span className="flex-1">{label}</span>
              {n > 0 && (
                <span className="grid min-w-[22px] place-items-center rounded-full bg-gold px-1.5 text-[.72rem] font-semibold leading-[22px] text-ink">
                  {n > 99 ? '99+' : n}
                  <span className="sr-only"> {badge === 'comments' ? 'comentarios sin ver' : 'mensajes sin leer'}</span>
                </span>
              )}
            </a>
          );
        })}
      </nav>
      <div className="mt-auto grid gap-2 pt-6">
        <p className="rounded-xl border border-line px-3 py-2.5 text-[.78rem] leading-snug text-fg-2" role="status">
          <i className={`dot ${local ? '' : 'dot-ok'} mr-2 align-middle`} aria-hidden />
          {local ? 'Modo demostración: los datos viven solo en este navegador.' : 'Conectado a Supabase: en vivo para todos los visitantes.'}
        </p>
        <button type="button" className="btn btn-sm justify-start" style={{ minHeight: 44 }} onClick={() => window.dispatchEvent(new Event('adm:palette'))}>
          <SearchIcon size={15} aria-hidden /> Buscar <kbd className="ml-auto rounded border border-line px-1.5 font-mono text-[.68rem] text-fg-3">Ctrl K</kbd>
        </button>
        <a href="#/" className="btn btn-sm justify-start" style={{ minHeight: 44 }}><ExternalLink size={15} aria-hidden /> Ver sitio</a>
        <button type="button" className="btn btn-sm justify-start" style={{ minHeight: 44 }} onClick={onSignOut}><LogOut size={15} aria-hidden /> Cerrar sesión</button>
      </div>
    </div>
  );
}

export default function Layout({ page, title, children }) {
  const [open, setOpen] = useState(false);
  const main = useRef(null);
  const first = useRef(true);

  // Al cambiar de página el foco va al contenido (accesibilidad) salvo en la primera carga.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const signOut = async () => {
    await store.auth.signOut();
    go('admin');
  };

  return (
    <div className="adm-shell min-h-[100dvh] lg:grid lg:grid-cols-[256px_1fr]">
      <a href="#admin-main" onClick={(e) => (e.preventDefault(), main.current?.focus())} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-paper focus:px-4 focus:py-3 focus:text-ink">
        Saltar al contenido
      </a>
      <aside className="sticky top-0 hidden h-[100dvh] border-r border-line bg-bg-1 p-4 lg:block">
        <Sidebar page={page} onSignOut={signOut} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-2.5 backdrop-blur lg:hidden">
          <button type="button" className="btn btn-icon" aria-label="Abrir menú del panel" aria-expanded={open} onClick={() => setOpen(true)} style={{ minWidth: 44, minHeight: 44 }}>
            <Menu size={20} aria-hidden />
          </button>
          <p className="font-display text-[1rem] font-semibold">{title}</p>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú del panel">
            <button type="button" className="absolute inset-0 bg-black/60" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
            <div className="adm-rise absolute inset-y-0 left-0 w-[min(300px,86vw)] overflow-y-auto border-r border-line bg-bg-1 p-4">
              <button type="button" className="btn btn-icon absolute right-3 top-3" aria-label="Cerrar menú" onClick={() => setOpen(false)} style={{ minWidth: 44, minHeight: 44 }}>
                <X size={18} aria-hidden />
              </button>
              <Sidebar page={page} onNavigate={() => setOpen(false)} onSignOut={signOut} />
            </div>
          </div>
        )}
        <main id="admin-main" ref={main} tabIndex={-1} className="mx-auto w-full max-w-[1120px] px-4 py-8 outline-none sm:px-8 lg:py-12">
          <motion.div key={page} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            {children}
          </motion.div>
        </main>
        <CommandPalette onSignOut={signOut} />
      </div>
    </div>
  );
}
