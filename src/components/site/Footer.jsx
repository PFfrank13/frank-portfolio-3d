import { useEffect, useState } from 'react';
import { PROFILE } from '../../lib/profile.js';
import { anchorClick } from './scrollControl.js';
import useSiteSettings from './shell/useSiteSettings.js';
import ContactIcons from './shell/ContactIcons.jsx';

function Clock() {
  const fmt = () => new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Lima' }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono tabular-nums" title="Hora actual en Perú">{t} · Perú</span>;
}

export default function Footer() {
  const s = useSiteSettings();
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="container pt-14" aria-hidden>
        <p className="fx-wordmark">Frank Pineda</p>
      </div>
      <div className="container flex flex-wrap items-center justify-between gap-x-8 gap-y-5 py-10">
        <div>
          <p className="font-display font-medium">{PROFILE.name}</p>
          <p className="mt-1 text-sm text-fg-3">{PROFILE.role} · {s.location}</p>
        </div>
        <ContactIcons settings={s} size={18} />
        <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-3">
          <Clock />
          <span>© {new Date().getFullYear()}</span>
          <a href="#inicio" onClick={anchorClick('inicio')} className="link" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Volver arriba</a>
        </p>
      </div>
    </footer>
  );
}
