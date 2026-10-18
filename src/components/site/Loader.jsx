import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Code2, Globe, UserRound } from 'lucide-react';
import { cardReady, isBooted, markBooted } from '../../lib/boot.js';

const MIN_MS = 2600;
const MAX_MS = 7000;
const EASE = [0.76, 0, 0.24, 1];
const CHIPS = [Code2, UserRound, Globe];
const LINE1 = ['Bienvenido', 'a', 'mi'];
const LINE2 = ['sitio', 'web', 'de', 'portafolio'];

function Words({ words, start, className }) {
  return (
    <span className={`block ${className}`}>
      {words.map((w, i) => (
        <span key={w + i} className="mr-[.22em] inline-block overflow-hidden align-bottom" style={{ paddingBottom: '.12em' }}>
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: start + i * 0.11 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Loader() {
  const reduce = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches).current;
  const skip = useRef(isBooted()).current; // al volver del panel (sin recargar) no se repite
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(skip);
  const p = useMotionValue(0);
  const pct = useTransform(p, (v) => String(Math.round(v)).padStart(3, '0'));
  const bar = useTransform(p, (v) => `${v}%`);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (skip) return undefined;
    const min = reduce ? 300 : MIN_MS;
    const t0 = performance.now();
    const done = { fonts: false, load: false, card: cardReady.value };
    let finished = false;
    let raf = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      animate(p, 100, { duration: 0.35, ease: 'easeOut' });
      setTimeout(() => {
        setOpen(true);
        markBooted();
        setTimeout(() => setGone(true), reduce ? 400 : 1300);
      }, 420);
    };

    const onCard = () => (done.card = true);
    window.addEventListener('fp:card-ready', onCard);
    document.fonts?.ready.then(() => (done.fonts = true), () => (done.fonts = true));
    if (document.readyState === 'complete') done.load = true;
    else window.addEventListener('load', () => (done.load = true), { once: true });

    const tick = () => {
      const t = performance.now() - t0;
      const real = (done.fonts ? 25 : 0) + (done.load ? 30 : 0) + (done.card ? 45 : 0);
      const timeP = Math.min(100, (t / min) * 100);
      const target = t > MAX_MS ? 100 : Math.min(real, timeP);
      const cur = p.get();
      p.set(cur + (target - cur) * 0.12 + (target > cur ? 0.15 : 0));
      setStage(cur > 66 ? 3 : cur > 33 ? 2 : cur > 4 ? 1 : 0);
      if (target >= 100 && cur > 97) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const fail = setTimeout(finish, MAX_MS + 1500); // red de seguridad
    return () => {
      clearTimeout(fail);
      cancelAnimationFrame(raf);
      window.removeEventListener('fp:card-ready', onCard);
    };
  }, [p, reduce]);

  useEffect(() => {
    if (gone) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, [gone]);

  if (gone) return null;

  const panel = (side) => ({
    animate: open ? { y: side === 'top' ? '-101%' : '101%' } : { y: '0%' },
    transition: { duration: reduce ? 0.3 : 1.05, ease: EASE },
  });

  return (
    <div className="fixed inset-0 z-[300]" role="status" aria-live="polite" aria-label="Cargando el sitio" style={{ pointerEvents: open ? 'none' : 'auto' }}>
      {['top', 'bottom'].map((side) => (
        <motion.div
          key={side}
          className="absolute inset-x-0 overflow-hidden"
          style={{ background: '#08090a', [side]: 0, height: '50.2%' }}
          {...panel(side)}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 h-[100vh]"
            style={{ [side]: 0, [side === 'top' ? 'top' : 'bottom']: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 75%)',
              }}
            />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(213,176,90,.10), transparent 70%)' }} />
          </div>
        </motion.div>
      ))}

      <motion.span
        aria-hidden
        className="pointer-events-none absolute bottom-[-.12em] left-[.04em] select-none font-display font-bold leading-none tracking-[-0.05em]"
        style={{ fontSize: 'clamp(9rem, 30vw, 28rem)', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,.09)' }}
        animate={open ? { opacity: 0, y: 60 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {pct}
      </motion.span>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
        animate={open ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeIn' }}
      >
        <div className="relative flex items-center gap-4">
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" style={{ borderColor: 'rgba(213,176,90,.28)', animation: 'fx-spin 14s linear infinite' }} />
          {CHIPS.map((Icon, i) => {
            const lit = stage > i;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.14, type: 'spring', stiffness: 260, damping: 18 }}
                className="grid h-12 w-12 place-items-center rounded-full border sm:h-14 sm:w-14"
                style={{
                  borderColor: lit ? 'rgba(213,176,90,.7)' : 'rgba(255,255,255,.16)',
                  color: lit ? '#d5b05a' : 'rgba(255,255,255,.55)',
                  background: lit ? 'rgba(213,176,90,.10)' : 'rgba(255,255,255,.03)',
                  boxShadow: lit ? '0 0 28px rgba(213,176,90,.28)' : 'none',
                  transition: 'all .5s ease',
                }}
              >
                <Icon size={22} strokeWidth={1.6} aria-hidden />
              </motion.span>
            );
          })}
        </div>

        <h1 className="mt-9 font-display font-bold leading-[1.02] tracking-[-0.02em] text-[#f3efe6]" style={{ fontSize: 'clamp(2.1rem, 7.4vw, 6.4rem)', fontStretch: '125%' }} aria-label="Bienvenido a mi sitio web de portafolio">
          <Words words={LINE1} start={0.6} className="" />
          <Words words={LINE2} start={0.95} className="" />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 w-[min(88vw,420px)]"
        >
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border px-5 py-2.5 font-mono text-[.72rem] uppercase tracking-[.14em] text-[#f3efe6]/80" style={{ borderColor: 'rgba(255,255,255,.14)', background: 'rgba(255,255,255,.04)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#d5b05a]" aria-hidden />
            Frank Farid Yampier Pineda Ferro
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 overflow-hidden" style={{ background: 'rgba(255,255,255,.12)' }}>
              <motion.div className="h-full" style={{ width: bar, background: '#d5b05a' }} />
            </div>
            <motion.span className="font-mono text-[.72rem] tabular-nums text-[#d5b05a]">{pct}</motion.span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
