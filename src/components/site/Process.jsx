import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { Boxes, Cpu, Rocket, Search } from 'lucide-react';
import SectionHead from './SectionHead.jsx';

const STEPS = [
  { icon: Search, t: 'Entender', d: 'Parto del problema real: quién lo usa, qué hardware o sistemas ya existen y qué significa que funcione bien.', tag: 'Requisitos · alcance' },
  { icon: Boxes, t: 'Diseñar', d: 'Defino la arquitectura de punta a punta: sensores, middleware, APIs, base de datos e interfaz, con un solo modelo de datos.', tag: 'Arquitectura · APIs' },
  { icon: Cpu, t: 'Construir', d: 'Implemento en iteraciones cortas, con pruebas y trazabilidad, integrando hardware, backend e IA sin parches.', tag: 'Código · pruebas' },
  { icon: Rocket, t: 'Entregar', d: 'Despliego, documento y dejo el sistema observable para que siga funcionando cuando yo ya no esté mirando.', tag: 'Despliegue · soporte' },
];

/** "Cómo trabajo": cuatro pasos unidos por una línea que se dibuja con el scroll. */
export default function Process() {
  const ref = useRef(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  return (
    <section id="proceso" aria-labelledby="proc-title" className="relative border-t border-line">
      <div className="container py-24 lg:py-32">
        <SectionHead kicker="Proceso" id="proc-title">Cómo convierto una idea en un sistema</SectionHead>
        <ol ref={ref} className="relative m-0 mt-16 grid list-none gap-6 p-0 md:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          <span aria-hidden className="absolute left-0 top-[34px] hidden h-px w-full bg-[var(--line)] lg:block" />
          <motion.span aria-hidden className="absolute left-0 top-[34px] hidden h-px w-full origin-left bg-[var(--gold)] lg:block" style={{ scaleX: still ? 1 : grow }} />
          {STEPS.map(({ icon: Icon, t, d, tag }, i) => (
            <li key={t} className="fx-spot relative border border-line bg-bg p-6 pt-8 transition-colors hover:border-[var(--fg-3)]">
              <span className="absolute -top-[1px] left-6 grid h-[68px] w-[68px] -translate-y-1/2 place-items-center rounded-full border border-line bg-bg text-gold"><Icon size={26} strokeWidth={1.5} aria-hidden /></span>
              <p className="mt-9 font-mono text-[.78rem] text-fg-3">0{i + 1}</p>
              <h3 className="font-display mt-1 text-[1.5rem] font-semibold tracking-tight">{t}</h3>
              <p className="mt-3 leading-relaxed text-fg-2">{d}</p>
              <p className="mt-5 text-[.78rem] uppercase tracking-[.12em] text-fg-3">{tag}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
