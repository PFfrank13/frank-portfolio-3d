import { useEffect, useRef } from 'react';

/** Constelación de puntos dorados que huye del puntero. Ligera (canvas 2D), se pausa fuera de pantalla. */
export default function Particles() {
  const cv = useRef(null);
  useEffect(() => {
    const c = cv.current;
    if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = c.getContext('2d');
    let w = 0;
    let h = 0;
    let pts = [];
    let raf = 0;
    let on = true;
    const m = { x: -999, y: -999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const size = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 0.8 + Math.random() * 1.4 }));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    io.observe(c);
    const move = (e) => {
      const r = c.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
    };
    window.addEventListener('pointermove', move, { passive: true });
    const LINK = 130;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - m.x;
        const dy = p.y - m.y;
        const d = Math.hypot(dx, dy);
        if (d < 150) {
          const f = (1 - d / 150) * 1.6;
          p.vx += (dx / (d || 1)) * f * 0.12;
          p.vy += (dy / (d || 1)) * f * 0.12;
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx + 0.02;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(213,176,90,${(1 - d / LINK) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - m.x, a.y - m.y);
        if (dm < 190) {
          ctx.strokeStyle = `rgba(243,239,230,${(1 - dm / 190) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(213,176,90,.75)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, 6.283);
        ctx.fill();
      }
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', move);
    };
  }, []);
  return <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full" />;
}
