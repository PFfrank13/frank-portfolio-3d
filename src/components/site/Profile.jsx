import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTable } from '../../lib/hooks.js';
import { LETTER, PROFILE } from '../../lib/profile.js';
import portrait from '../../assets/image_c70791.png';
import SectionHead from './SectionHead.jsx';
import Reveal from './Reveal.jsx';
import { anchorClick } from './scrollControl.js';
import useSiteSettings from './shell/useSiteSettings.js';
import { BStyles } from './sections-b/styles.jsx';
import Milestones from './sections-b/Milestones.jsx';

export default function Profile() {
  const settings = useSiteSettings();
  const tools = useTable('tools');
  const toolCount = tools.loading || tools.error ? 0 : tools.rows.length;
  const [first, ...rest] = LETTER.paragraphs;
  const still = useReducedMotion();
  const pic = useRef(null);
  const { scrollYProgress } = useScroll({ target: pic, offset: ['start end', 'end start'] });
  const py = useTransform(scrollYProgress, [0, 1], [26, -26]);
  const sc = useTransform(scrollYProgress, [0, 0.5], [1.06, 1]);

  const facts = [
    ['Rol', `${PROFILE.role} (${PROFILE.headline})`],
    ['Formación', `${PROFILE.school} · egresado de SENATI`],
    ['Lugar', settings.location],
  ];

  return (
    <section id="perfil" aria-labelledby="perfil-title" className="fb-sec on-paper relative">
      <BStyles />
      <div className="container py-24 lg:py-36">
        <SectionHead kicker="Perfil" id="perfil-title" className="max-w-[16ch] sm:max-w-none">
          {LETTER.title}
        </SectionHead>

        <div className="mt-14 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-x-16">
          <aside className="lg:col-span-4 lg:self-start lg:sticky lg:top-24">
            <div className="pf-frame" style={{ width: 'min(100%, 288px)' }}>
            <div ref={pic} className="overflow-hidden" style={{ width: '100%' }}>
            <motion.img
              src={portrait}
              width={227}
              height={314}
              alt="Retrato de Frank Pineda"
              className="mix-blend-multiply"
              style={still ? { width: '100%', height: 'auto' } : { width: '100%', height: 'auto', y: py, scale: sc }}
            />
            </div>
            <span className="pf-chip" aria-hidden><i />Disponible</span>
            </div>
            <dl className="m-0 mt-8 max-w-[288px]">
              {facts.map(([k, v]) => (
                <div key={k} className="border-t border-line py-3">
                  <dt className="text-sm text-fg-3">{k}</dt>
                  <dd className="m-0 mt-0.5 leading-snug">{v}</dd>
                </div>
              ))}
              {toolCount > 0 && (
                <div className="border-y border-line py-3">
                  <dt className="text-sm text-fg-3">Herramientas</dt>
                  <dd className="m-0 mt-0.5 leading-snug">
                    <a href="#stack" onClick={anchorClick('stack')} className="link">
                      {toolCount} en el stack
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </aside>

          <div className="lg:col-span-8">
            <Reveal>
              <p className="fb-lead max-w-[30ch] text-fg sm:max-w-[34ch]">{first}</p>
            </Reveal>
            <div className="mt-8 max-w-[62ch] space-y-5 leading-[1.65] text-fg-2">
              {rest.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <p className="font-display mt-10 max-w-[40ch] border-l border-line pl-5 text-[1.2rem] font-medium leading-snug tracking-tight">{LETTER.closing}</p>

            <div className="mt-20 lg:mt-28">
              <Milestones />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
