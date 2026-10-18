import { Mail, MessageCircle, Linkedin } from 'lucide-react';
import { ToolIcon } from '../../../lib/icons.jsx';
import { safeUrl } from '../parts/sbKit.jsx';

/** Enlaces de icono (hero y otros). Solo muestra los que tienen dato. */
export default function ContactIcons({ settings, size = 20, className = '' }) {
  const gh = safeUrl(settings.github);
  const li = safeUrl(settings.linkedin);
  const items = [
    gh && { href: gh, label: 'GitHub de Frank (se abre en una pestaña nueva)', icon: <ToolIcon name="github" size={size} />, ext: true },
    settings.whatsapp && { href: `https://wa.me/${settings.whatsapp}`, label: 'Escribir por WhatsApp (se abre en una pestaña nueva)', icon: <MessageCircle size={size} />, ext: true },
    settings.email && { href: `mailto:${settings.email}`, label: 'Enviar un correo', icon: <Mail size={size} /> },
    li && { href: li, label: 'LinkedIn de Frank (se abre en una pestaña nueva)', icon: <Linkedin size={size} />, ext: true },
  ].filter(Boolean);
  return (
    <ul className={`m-0 flex list-none items-center gap-2 p-0 ${className}`}>
      {items.map((it) => (
        <li key={it.href}>
          <a
            href={it.href}
            aria-label={it.label}
            className="btn btn-icon"
            {...(it.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {it.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
