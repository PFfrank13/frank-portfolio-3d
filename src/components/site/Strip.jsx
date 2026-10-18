import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { scrollState } from '../../lib/scroll.js';
import { useTable } from '../../lib/hooks.js';
import { ToolIcon } from '../../lib/icons.jsx';

function Count({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(to);
      return undefined;
    }
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref} className="tabular-nums">{v}{suffix}</span>;
}

/** Franja bajo el hero: cifras reales (contadores) y una marquesina con las herramientas del stack. */
export default function Strip() {
  const tools = useTable('tools');
  const projects = useTable('projects');
  const certs = useTable('certificates');
  const track = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let x = 0;
    let dir = -1;
    let raf = 0;
    const loop = () => {
      const v = scrollState.velocity;
      if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;
      x += dir * (0.55 + Math.min(14, Math.abs(v) * 0.6));
      const el = track.current;
      if (el) {
        const half = el.scrollWidth / 2;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        el.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const list = tools.loading || tools.error ? [] : tools.rows;
  const stats = [
    ['Proyectos', projects.rows.length],
    ['Herramientas', list.length],
    ['Certificaciones', certs.rows.length],
  ].filter(([, n]) => n > 0);

  return (
    <section aria-label="Resumen y tecnologías" className="fx-strip relative border-y border-line">
      {stats.length > 0 && (
        <div className="container grid grid-cols-3 divide-x divide-[var(--line)] py-8 sm:py-10">
          {stats.map(([k, n]) => (
            <div key={k} className="px-3 text-center first:pl-0 last:pr-0 sm:px-8">
              <p className="font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-none tracking-tight"><Count to={n} suffix="+" /></p>
              <p className="mt-2 text-[.78rem] uppercase tracking-[.14em] text-fg-3">{k}</p>
            </div>
          ))}
        </div>
      )}
      {list.length > 0 && (
        <div className="fx-marquee border-t border-line py-5" aria-hidden>
          <div className="fx-track" ref={track}>
            {[0, 1].map((k) => (
              <ul key={k} className="fx-row">
                {list.map((t) => (
                  <li key={t.id} className="fx-item"><ToolIcon name={t.icon} size={20} /><span>{t.name}</span></li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
