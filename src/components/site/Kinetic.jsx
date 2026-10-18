import { useEffect, useRef } from 'react';
import { scrollState } from '../../lib/scroll.js';

/** Banda tipográfica gigante: dos filas que se deslizan en sentidos opuestos según el scroll. */
export default function Kinetic({ a, b, className = '' }) {
  const root = useRef(null);
  const r1 = useRef(null);
  const r2 = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    let off = 0;
    const loop = () => {
      const el = root.current;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.bottom > -100 && r.top < window.innerHeight + 100) {
          off += 0.35 + Math.abs(scrollState.velocity) * 0.5;
          const p = (r.top + r.height / 2 - window.innerHeight / 2) * 0.55;
          const w1 = (r1.current?.scrollWidth || 2) / 2;
          const w2 = (r2.current?.scrollWidth || 2) / 2;
          if (r1.current) r1.current.style.transform = `translate3d(${-((off + p + 9999 * w1) % w1)}px,0,0)`;
          if (r2.current) r2.current.style.transform = `translate3d(${-w2 + ((off + p + 9999 * w2) % w2)}px,0,0)`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const row = (words, ref, solid) => (
    <div ref={ref} className="fx-kt-row" style={{ transform: 'translate3d(0,0,0)' }}>
      {[0, 1].map((k) => (
        <span key={k} className="fx-kt-set">
          {words.map((w, i) => (
            <span key={w + i} className={`fx-kt-word ${(i + (solid ? 0 : 1)) % 2 ? 'is-solid' : ''}`}>{w}<i aria-hidden>✦</i></span>
          ))}
        </span>
      ))}
    </div>
  );
  return (
    <div ref={root} className={`fx-kt ${className}`} aria-hidden>
      {row(a, r1, true)}
      {row(b, r2, false)}
    </div>
  );
}
