import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { scrollState } from '../../lib/scroll.js';
import { scrollToId } from './scrollControl.js';

/** Botón flotante "volver arriba" con anillo de progreso de lectura. */
export default function ToTop() {
  const [show, setShow] = useState(false);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setShow((s) => {
        const n = window.scrollY > window.innerHeight * 0.9;
        return n === s ? s : n;
      });
      setP((v) => {
        const n = Math.round(scrollState.progress * 100) / 100;
        return n === v ? v : n;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const R = 22;
  const C = 2 * Math.PI * R;
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Volver arriba"
          data-cursor="Subir"
          onClick={() => scrollToId('inicio')}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="fixed bottom-5 right-5 z-[90] grid h-[52px] w-[52px] place-items-center rounded-full border border-line bg-bg-1/90 text-fg backdrop-blur hover:text-gold"
        >
          <svg className="absolute inset-0" viewBox="0 0 52 52" aria-hidden>
            <circle cx="26" cy="26" r={R} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 26 26)" />
          </svg>
          <ArrowUp size={18} aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
