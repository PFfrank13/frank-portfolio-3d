import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS, NAV_GROUP, SECTION_IDS, SECTION_LABELS, SHEET_LINKS } from './sections.js';
import useActiveSection from './useActiveSection.js';
import { anchorClick, scrollToId, startScroll, stopScroll } from './scrollControl.js';
import Monogram from './shell/Monogram.jsx';

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Nav() {
  const spy = useActiveSection(SECTION_IDS);
  const active = NAV_GROUP[spy] || spy;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sheet = useRef(null);
  const toggle = useRef(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!open) return;
    stopScroll();
    const root = sheet.current;
    root?.querySelector(FOCUSABLE)?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !root) return;
      const items = [...root.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      startScroll();
      toggle.current?.focus();
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className="fixed inset-x-0 top-0 z-[100]"
      style={{
        background: solid ? 'rgba(12,13,14,0.72)' : 'transparent',
        backdropFilter: solid ? 'blur(14px) saturate(1.2)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(14px) saturate(1.2)' : 'none',
        borderBottom: `1px solid ${solid ? 'var(--line)' : 'transparent'}`,
        transition: 'background .3s var(--ease), border-color .3s var(--ease)',
      }}
    >
      <div className="container flex h-16 items-center justify-between gap-6">
        <a href="#inicio" onClick={anchorClick('inicio')} className="flex items-center gap-3 text-fg no-underline" aria-label="Frank Farid Yampier Pineda Ferro, ir al inicio">
          <Monogram />
          <span className="font-display text-[1.05rem] font-semibold tracking-tight"><span className="xl:hidden">Frank Pineda</span><span className="hidden xl:inline">Frank Farid Yampier Pineda Ferro</span></span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-1 p-0">
            {NAV_LINKS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={anchorClick(id)}
                  aria-current={active === id ? 'true' : undefined}
                  className="relative inline-flex min-h-[44px] items-center px-3.5 text-[0.92rem] no-underline transition-colors duration-200"
                  style={{ color: active === id ? 'var(--fg)' : 'var(--fg-2)' }}
                >
                  {SECTION_LABELS[id]}
                  <span
                    aria-hidden
                    className="absolute inset-x-3.5 bottom-1.5 h-px bg-gold"
                    style={{ transform: `scaleX(${active === id ? 1 : 0})`, transformOrigin: 'left', transition: 'transform .3s var(--ease)' }}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contacto" onClick={anchorClick('contacto')} className="btn btn-primary hidden sm:inline-flex">
            Contactar
          </a>
          <button
            ref={toggle}
            type="button"
            className="btn btn-icon lg:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="menu-movil"
          ref={sheet}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="fixed inset-x-0 bottom-0 top-16 flex flex-col bg-bg lg:hidden"
          style={{ animation: 'sb-fade .22s var(--ease)' }}
        >
          <ul className="container m-0 flex list-none flex-col p-0 pt-4">
            {SHEET_LINKS.map((id) => (
              <li key={id} className="border-b border-line">
                <a
                  href={`#${id}`}
                  onClick={anchorClick(id, () => {
                    setOpen(false);
                    // Lenis se reactiva al cerrar; se espera al siguiente frame para que el desplazamiento no se ignore.
                    requestAnimationFrame(() => scrollToId(id));
                  })}
                  aria-current={spy === id ? 'true' : undefined}
                  className="font-display flex min-h-[56px] items-center justify-between text-[1.6rem] font-medium tracking-tight no-underline"
                  style={{ color: spy === id ? 'var(--gold)' : 'var(--fg)' }}
                >
                  {SECTION_LABELS[id]}
                </a>
              </li>
            ))}
          </ul>
          <div className="container mt-auto pb-8 pt-6">
            <a
              href="#contacto"
              onClick={anchorClick('contacto', () => {
                setOpen(false);
                requestAnimationFrame(() => scrollToId('contacto'));
              })}
              className="btn btn-primary w-full"
            >
              Contactar
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
