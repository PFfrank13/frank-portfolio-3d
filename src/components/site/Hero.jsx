import { motion, useReducedMotion } from 'framer-motion';
import { PROFILE } from '../../lib/profile.js';
import { anchorClick } from './scrollControl.js';
import { useCvDownload } from './useCv.js';
import useSiteSettings from './shell/useSiteSettings.js';
import ContactIcons from './shell/ContactIcons.jsx';
import { CvDownloadButton } from './shell/CvButtons.jsx';
import Particles from './Particles.jsx';
import RoleRotator from './RoleRotator.jsx';
import LanyardStage from './shell/LanyardStage.jsx';
import { useBooted } from '../../lib/boot.js';
import { useMedia } from './parts/sbKit.jsx';

const EASE = [0.22, 1, 0.36, 1];

export default function Hero() {
  const reduce = useReducedMotion();
  const settings = useSiteSettings();
  const cv = useCvDownload();
  const booted = useBooted();
  const full = useMedia('(min-width: 1024px) and (pointer: fine)');

  // Una sola secuencia: el titular sube por líneas y el resto sigue a continuación.
  // Espera a que la cortina de carga se abra para empezar.
  const line = (i) =>
    reduce ? {} : { initial: { y: '110%' }, animate: booted ? { y: 0 } : { y: '110%' }, transition: { duration: 0.95, delay: 0.1 + i * 0.12, ease: EASE } };
  const fade = (d) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: booted ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }, transition: { duration: 0.8, delay: d, ease: EASE } };

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative min-h-[100svh] overflow-x-clip bg-bg">
      <div className="fx-aurora" aria-hidden><i /><i /></div>
      <Particles />
      <div className="container relative flex min-h-[100svh] flex-col lg:flex-row lg:items-stretch">
        <div className="relative z-10 flex flex-col justify-center pb-10 pt-28 lg:w-[52%] lg:py-28 lg:pr-8">
          <motion.p {...fade(0)} className="mb-8 flex items-center gap-2.5 text-[0.92rem] text-fg-2" aria-live="polite">
            <span className={`dot ${settings.available ? 'dot-ok' : ''}`} aria-hidden />
            {settings.available ? 'Disponible para nuevos proyectos' : 'No disponible por ahora'}
          </motion.p>

          <h1
            id="hero-title"
            className="font-display m-0 font-semibold text-fg"
            style={{ fontSize: 'clamp(3rem, 6.4vw, 6.2rem)', lineHeight: 0.95, letterSpacing: '-0.045em' }}
          >
            <span className="sr-only">{PROFILE.name}</span>
            {['Frank Farid', 'Yampier', 'Pineda Ferro'].map((t, i) => (
              <span key={t} aria-hidden className="block overflow-hidden pb-[0.1em]">
                <motion.span className="block" {...line(i)}>{t}</motion.span>
              </span>
            ))}
          </h1>

          <motion.p {...fade(0.55)} className="font-display mt-7 text-[clamp(1.2rem,2vw,1.6rem)] font-medium tracking-tight text-fg">
            <RoleRotator roles={['Full-Stack Software Engineer', 'Automatización con IA', 'Sistemas de alto rendimiento', 'Hardware + Backend + Interfaz']} />
          </motion.p>
          <motion.p {...fade(0.65)} className="mt-4 max-w-[52ch] leading-[1.65] text-fg-2">
            Conecto el hardware, el backend y la interfaz como un solo sistema: control de acceso con RFID/NFC integrado a un ERP, APIs de alta disponibilidad y asistentes con IA que funcionan con voz.
          </motion.p>

          <motion.div {...fade(0.8)} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#proyectos" onClick={anchorClick('proyectos')} className="btn btn-primary">
              Ver proyectos
            </a>
            <CvDownloadButton cv={cv} />
          </motion.div>
          <motion.div {...fade(0.9)} className="mt-6">
            <ContactIcons settings={settings} />
          </motion.div>
        </div>

        {/* En pantallas pequeñas o táctiles el carné vive en su propia columna; en escritorio ocupa toda la portada (ver abajo). */}
        {!full && (
          <div className="relative h-[520px] w-full lg:h-auto lg:w-[48%]" aria-hidden={false}>
            <LanyardStage />
          </div>
        )}
      </div>
      {/* Escritorio: el lienzo cubre toda la portada; no bloquea clics, solo el carné responde al puntero. */}
      {full && (
        <div className="pointer-events-none absolute inset-0 z-30">
          <LanyardStage full />
        </div>
      )}
    </section>
  );
}
