import { useEffect, useState } from 'react';

const GLYPHS = '▓▒░<>/{}[]=+*#01';

/** Subtítulo que alterna especialidades con efecto de "descifrado". El texto accesible es fijo. */
export default function RoleRotator({ roles, className = '' }) {
  const [text, setText] = useState(roles[0]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let i = 0;
    let raf = 0;
    let timer = 0;
    const scramble = (to) => {
      const start = performance.now();
      const dur = 900;
      const tick = (now) => {
        const k = Math.min(1, (now - start) / dur);
        const reveal = Math.floor(to.length * k);
        setText(to.split('').map((ch, n) => (ch === ' ' || n < reveal ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''));
        if (k < 1) raf = requestAnimationFrame(tick);
        else timer = setTimeout(next, 2600);
      };
      raf = requestAnimationFrame(tick);
    };
    const next = () => {
      i = (i + 1) % roles.length;
      scramble(roles[i]);
    };
    timer = setTimeout(next, 3800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [roles]);
  return (
    <span className={className}>
      <span className="sr-only">{roles[0]}</span>
      <span aria-hidden>{text}</span>
    </span>
  );
}
