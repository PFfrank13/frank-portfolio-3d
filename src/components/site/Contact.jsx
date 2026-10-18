import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { store, isLocal } from '../../lib/store/index.js';
import { LIMITS } from '../../lib/config.js';
import SectionHead from './SectionHead.jsx';
import Reveal from './Reveal.jsx';
import { Burst } from './Fx.jsx';
import useSiteSettings from './shell/useSiteSettings.js';
import { safeUrl } from './parts/sbKit.jsx';
import { BStyles } from './sections-b/styles.jsx';

const COOLDOWN = 30000;
const LAST = 'fp.msg.last';

function useLimaTime() {
  const [t, setT] = useState('');
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' }).format(new Date()));
    f();
    const i = setInterval(f, 30000);
    return () => clearInterval(i);
  }, []);
  return t;
}

export default function Contact() {
  const s = useSiteSettings();
  const lima = useLimaTime();
  const uid = useId();
  const id = (n) => `${uid}-${n}`;
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', msg: '' });
  const set = (p) => setF((v) => ({ ...v, ...p }));
  const live = useRef(null);

  const gh = safeUrl(s.github);
  const li = safeUrl(s.linkedin);
  const rows = [
    ['Correo', s.email, `mailto:${s.email}`, false],
    ['Teléfono', s.phone, `tel:+${s.whatsapp || s.phone.replace(/\D/g, '')}`, false],
    s.whatsapp && ['WhatsApp', 'Escríbeme por WhatsApp', `https://wa.me/${s.whatsapp}`, true],
    gh && ['GitHub', gh.replace(/^https?:\/\//, ''), gh, true],
    li && ['LinkedIn', li.replace(/^https?:\/\/(www\.)?/, ''), li, true],
  ].filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    if (state.status === 'sending') return;
    const er = {};
    if (!f.name.trim()) er.name = 'Escribe tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) er.email = 'Escribe un correo válido.';
    if (f.message.trim().length < 5) er.message = 'Cuéntame un poco más (mínimo 5 caracteres).';
    if (f.message.length > LIMITS.messageBody) er.message = `Sobran ${f.message.length - LIMITS.messageBody} caracteres.`;
    setErrors(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => document.querySelector('#contacto-form [aria-invalid="true"]')?.focus());
      return;
    }
    if (f.website) { // honeypot: se simula éxito sin guardar
      setState({ status: 'ok', msg: '' });
      return;
    }
    let last = 0;
    try { last = Number(localStorage.getItem(LAST)) || 0; } catch { /* noop */ }
    const wait = COOLDOWN - (Date.now() - last);
    if (wait > 0) {
      setState({ status: 'err', msg: `Espera ${Math.ceil(wait / 1000)} s antes de enviar otro mensaje.` });
      return;
    }
    setState({ status: 'sending', msg: '' });
    try {
      await store.createMessage({ name: f.name, email: f.email, subject: f.subject, message: f.message });
      try { localStorage.setItem(LAST, String(Date.now())); } catch { /* noop */ }
      setF({ name: '', email: '', subject: '', message: '', website: '' });
      setState({ status: 'ok', msg: '' });
    } catch (err) {
      setState({ status: 'err', msg: (err && err.message) || 'No se pudo enviar. Escríbeme directamente por correo o WhatsApp.' });
    }
  };

  const inv = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': id(k) + '-e' } : {});
  const Err = ({ k }) => (errors[k] ? <p id={id(k) + '-e'} className="hint" style={{ color: 'var(--danger)' }}>{errors[k]}</p> : null);

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="fb-sec sb-sec">
      <BStyles />
      <div className="container py-24 lg:py-36">
        <SectionHead kicker="Contacto" id="contacto-title">Conversemos</SectionHead>
        <div className="mt-14 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="sb-lead">{s.available ? 'Estoy disponible para nuevos proyectos y oportunidades. Elige el canal que prefieras.' : 'Ahora no tomo nuevos proyectos, pero puedes escribirme.'}</p>
              <div className="mt-9">
                {rows.map(([k, v, href, ext]) => (
                  <a key={k} href={href} className="fb-link-row" {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    <span className="min-w-0"><span className="block text-sm text-fg-3">{k}</span><span className="fb-v">{v}</span></span>
                    <ArrowUpRight size={20} aria-hidden />
                    {ext && <span className="sr-only">(pestaña nueva)</span>}
                  </a>
                ))}
                <div className="border-t border-line" />
              </div>
              <p className="mt-6 text-sm text-fg-3">{s.location}{lima ? ` · ${lima} hora local` : ''}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal>
              {state.status === 'ok' ? (
                <div className="border border-line p-8" role="status">
                  <p className="font-display flex items-center gap-3 text-[1.5rem] font-medium"><Check size={22} className="text-ok" aria-hidden /> Mensaje enviado<Burst /></p>
                  <p className="mt-3 text-fg-2">Gracias. Te responderé al correo que dejaste.{isLocal ? ' (Modo demostración: el mensaje quedó guardado en este navegador.)' : ''}</p>
                  <button type="button" className="btn btn-sm mt-6" onClick={() => setState({ status: 'idle', msg: '' })}>Escribir otro</button>
                </div>
              ) : (
                <form id="contacto-form" onSubmit={submit} noValidate className="grid gap-6" aria-label="Formulario de contacto">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="field"><label className="label" htmlFor={id('n')}>Nombre</label><input id={id('n')} className="input" autoComplete="name" maxLength={LIMITS.messageName} value={f.name} onChange={(e) => set({ name: e.target.value })} {...inv('name')} /><Err k="name" /></div>
                    <div className="field"><label className="label" htmlFor={id('m')}>Correo</label><input id={id('m')} type="email" className="input" autoComplete="email" value={f.email} onChange={(e) => set({ email: e.target.value })} {...inv('email')} /><Err k="email" /></div>
                  </div>
                  <div className="field"><label className="label" htmlFor={id('s')}>Asunto <span className="text-fg-3">(opcional)</span></label><input id={id('s')} className="input" maxLength={120} value={f.subject} onChange={(e) => set({ subject: e.target.value })} /></div>
                  <div className="field"><label className="label" htmlFor={id('b')}>Mensaje</label><textarea id={id('b')} className="textarea" style={{ minHeight: 160 }} value={f.message} onChange={(e) => set({ message: e.target.value })} {...inv('message')} /><Err k="message" />
                    <p className="hint" style={{ textAlign: 'right' }}>{f.message.length} / {LIMITS.messageBody}</p></div>
                  <div className="fb-trap" aria-hidden><label>No rellenar<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set({ website: e.target.value })} /></label></div>
                  <div className="flex flex-wrap items-center gap-4">
                    <button type="submit" className="btn btn-primary" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}</button>
                    <p ref={live} role="status" aria-live="polite" className="text-sm" style={{ color: 'var(--danger)' }}>{state.status === 'err' ? state.msg : ''}</p>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
