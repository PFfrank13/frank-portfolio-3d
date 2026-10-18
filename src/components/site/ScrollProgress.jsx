import { useEffect, useRef } from 'react';
import { scrollState } from '../../lib/scroll.js';

/** Línea dorada de 2 px con el avance de lectura; se actualiza por rAF sin re-renders. */
export default function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (ref.current) ref.current.style.transform = `scaleX(${scrollState.progress})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[2px]">
      <div ref={ref} className="h-full origin-left bg-gold" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
