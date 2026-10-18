import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTable } from '../../lib/hooks.js';
import { PROFILE } from '../../lib/profile.js';
import Img from '../ui/Img.jsx';
import SectionHead from './SectionHead.jsx';
import Reveal from './Reveal.jsx';
import { Lightbox, safeUrl } from './parts/sbKit.jsx';
import { BStyles } from './sections-b/styles.jsx';

function CertThumb({ c }) {
  const [bad, setBad] = useState(false);
  const url = c.image_urls?.[0];
  if (!bad) return <Img src={url} alt="" onError={() => setBad(true)} fallback={<CertBadge c={c} />} />;
  return <CertBadge c={c} />;
}

function CertBadge({ c }) {
  const initials = (c.issuer || c.title || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span className="fb-badge" aria-hidden>
      <span className="fb-badge-hex"><b>{initials}</b></span>
      <span className="fb-badge-t">{c.title}</span>
      <span className="fb-badge-i">{[c.issuer, c.year].filter(Boolean).join(' · ')}</span>
    </span>
  );
}

const EDU = [
  { school: 'SENATI', title: 'Ingeniería de Software con Inteligencia Artificial (carrera técnica)', state: 'Egresado' },
  { school: PROFILE.school, title: 'Ingeniería de Software (pregrado)', state: 'En curso', note: 'Con convalidación de la carrera técnica por mérito académico.' },
];

export default function Credentials() {
  const { rows, loading } = useTable('certificates');
  const [zoom, setZoom] = useState(null);
  const withImg = useMemo(() => rows.filter((c) => c.image_urls?.[0]), [rows]);
  const items = useMemo(() => withImg.map((c) => ({ src: c.image_urls[0], alt: `Certificado ${c.title}`, caption: [c.title, c.issuer, c.year].filter(Boolean).join(' · ') })), [withImg]);

  return (
    <section id="credenciales" aria-labelledby="cred-title" className="fb-sec on-paper relative">
      <BStyles />
      <div className="container py-24 lg:py-32">
        <SectionHead kicker="Credenciales" id="cred-title">Formación y certificados</SectionHead>
        <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-sm text-fg-3">Formación</p>
            <div className="mt-3">
              {EDU.map((e) => (
                <div key={e.school} className="fb-row">
                  <p className="font-display text-[1.25rem] font-medium leading-snug tracking-tight">{e.school}</p>
                  <p className="mt-1 text-fg-2">{e.title}</p>
                  <p className="mt-2 inline-block border border-line px-2.5 py-1 text-[.82rem] text-fg-2">{e.state}</p>
                  {e.note && <p className="mt-3 text-[.92rem] leading-relaxed text-fg-3">{e.note}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8">
            <p className="text-sm text-fg-3">Certificados</p>
            {loading ? (
              <div className="mt-3 grid gap-5 sm:grid-cols-2" aria-busy="true"><div className="fb-skel aspect-[4/3]" /><div className="fb-skel aspect-[4/3]" /></div>
            ) : !rows.length ? (
              <p className="fb-row mt-3 text-fg-2">Los certificados se publicarán aquí.</p>
            ) : (
              <Reveal>
                <ul className="m-0 mt-3 grid list-none gap-x-5 gap-y-8 p-0 sm:grid-cols-2 xl:grid-cols-3">
                  {rows.map((c) => {
                    const i = withImg.indexOf(c);
                    const link = safeUrl(c.url);
                    return (
                      <li key={c.id}>
                        {i >= 0 ? (
                          <button type="button" className="fb-cert" data-cursor="Ampliar" onClick={() => setZoom(i)} aria-label={`Ampliar certificado ${c.title}`}>
                            <span className="fb-cert-img"><CertThumb c={c} /></span>
                          </button>
                        ) : null}
                        <p className="mt-3 font-medium leading-snug" style={{ overflowWrap: 'anywhere' }}>{c.title}</p>
                        <p className="text-[.9rem] text-fg-3">{[c.issuer, c.year].filter(Boolean).join(' · ')}</p>
                        {link && <a className="link mt-1 inline-flex items-center gap-1 text-[.9rem]" href={link} target="_blank" rel="noopener noreferrer">Verificar <ExternalLink size={13} aria-hidden /><span className="sr-only"> (pestaña nueva)</span></a>}
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </div>
      {zoom !== null && <Lightbox items={items} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />}
    </section>
  );
}
