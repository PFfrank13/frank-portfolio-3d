import { useEffect, useRef } from 'react';

/** Estallido de partículas en un punto (lo usan "Mensaje enviado" y los "me gusta"). */
export function burst(x, y, n = 26, spread = 120, colors = ['#d5b05a', '#f0d58f', '#f3efe6']) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i');
    d.className = 'fx-spark';
    const a = Math.random() * Math.PI * 2;
    const l = spread * (0.35 + Math.random() * 0.75);
    d.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * l}px;--dy:${Math.sin(a) * l - 30}px;background:${colors[i % colors.length]};width:${3 + Math.random() * 5}px;height:${3 + Math.random() * 5}px;animation-duration:${0.7 + Math.random() * 0.6}s`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  }
}

export function Burst() {
  const ref = useRef(null);
  useEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (r) burst(r.left + 40, r.top + 20, 34, 170);
  }, []);
  return <span ref={ref} className="inline-block h-0 w-0" aria-hidden />;
}

const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOT = 'a, button, [role="button"], summary, input, textarea, select, label[for]';
const REVEAL = '.pj-media, .st-tool, .pj-chapter, main li.fx-li, .fb-sec dl > div, .fx-up, main article';
const LABELS = [['.pj-chapter', 'Abrir'], ['.st-tool', 'Ver'], ['[data-cursor]', null]];
const SPOT = '.pj-chapter, .st-tool, .st-panel, .fx-spot';

/**
 * Capa de pulido: cursor propio, botones magnéticos, brillo que sigue al puntero en tarjetas
 * y titulares que se destapan al entrar. Todo se apaga con "reducir movimiento" y en pantallas táctiles.
 */
export default function Fx() {
  const ring = useRef(null);
  const dot = useRef(null);

  useEffect(() => {
    const still = calm();
    const hover = fine();
    const cleanups = [];

    // Numeral gigante en contorno detrás de cada sección + título de la pestaña.
    const secs = [...document.querySelectorAll('main > section[id]')].filter((x) => x.id !== 'inicio');
    secs.forEach((x, i) => x.setAttribute('data-n', String(i + 1).padStart(2, '0')));
    const baseTitle = document.title;
    const onVis = () => {
      document.title = document.visibilityState === 'hidden' ? 'Vuelve pronto · Frank Pineda' : baseTitle;
    };
    document.addEventListener('visibilitychange', onVis);
    cleanups.push(() => {
      document.removeEventListener('visibilitychange', onVis);
      secs.forEach((x) => x.removeAttribute('data-n'));
      document.title = baseTitle;
    });

    // Titulares: se destapan con máscara.
    const heads = [...document.querySelectorAll('main h2')];
    if (!still) {
      const pending = new Set();
      heads.forEach((h) => {
        if (h.getBoundingClientRect().top < window.innerHeight * 0.88) return; // ya visible
        h.classList.add('fx-h');
        pending.add(h);
      });
      let tick = 0;
      const check = () => {
        tick = 0;
        pending.forEach((h) => {
          if (h.getBoundingClientRect().top < window.innerHeight * 0.88) {
            h.classList.add('fx-in');
            pending.delete(h);
          }
        });
      };
      const onScroll = () => {
        if (!tick) tick = requestAnimationFrame(check);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(tick);
        pending.forEach((h) => h.classList.remove('fx-h'));
      });
    }

    // Aparición escalonada de tarjetas y listas (se ocultan solo si aún no están a la vista).
    const seen = new WeakSet();
    const waiting = new Set();
    const scan = () => {
      if (still) return;
      document.querySelectorAll(REVEAL).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 || r.height === 0) return;
        const i = [...(el.parentElement?.children || [])].indexOf(el);
        el.style.setProperty('--d', `${Math.min(i, 9) * 70}ms`);
        el.classList.add('fx-pre');
        waiting.add(el);
      });
    };
    const lines = [...document.querySelectorAll('main > section[id]')].filter((x) => x.id !== 'inicio');
    lines.forEach((x) => x.classList.add('fx-line'));
    cleanups.push(() => lines.forEach((x) => x.classList.remove('fx-line', 'fx-drawn')));
    const flush = () => {
      lines.forEach((x) => {
        if (!x.classList.contains('fx-drawn') && x.getBoundingClientRect().top < window.innerHeight * 0.8) x.classList.add('fx-drawn');
      });
      waiting.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.classList.add('fx-on');
          waiting.delete(el);
          setTimeout(() => el.classList.remove('fx-pre', 'fx-on'), 1400);
        }
      });
    };
    scan();
    const rescan = setInterval(scan, 900);
    cleanups.push(() => {
      clearInterval(rescan);
      waiting.forEach((el) => el.classList.remove('fx-pre', 'fx-on'));
    });

    // El contenido del hero se aleja y se desvanece al salir.
    const heroBox = document.querySelector('#inicio > .container');
    let heroRaf = 0;
    const heroOut = () => {
      heroRaf = 0;
      flush();
      if (!heroBox || still) return;
      const y = window.scrollY;
      const k = Math.min(1, Math.max(0, y / (window.innerHeight * 0.9)));
      heroBox.style.transform = k > 0 ? `translate3d(0, ${k * 70}px, 0) scale(${1 - k * 0.05})` : '';
      heroBox.style.opacity = k > 0 ? String(1 - k * 0.85) : '';
    };
    const onScroll2 = () => {
      if (!heroRaf) heroRaf = requestAnimationFrame(heroOut);
    };
    window.addEventListener('scroll', onScroll2, { passive: true });
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll2);
      cancelAnimationFrame(heroRaf);
      if (heroBox) {
        heroBox.style.transform = '';
        heroBox.style.opacity = '';
      }
    });

    if (still) return () => cleanups.forEach((f) => f());

    // Onda al pulsar un botón.
    const ripple = (e) => {
      const b = e.target instanceof Element ? e.target.closest('.btn') : null;
      if (!b || b.disabled) return;
      const r = b.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const el = document.createElement('span');
      el.className = 'fx-ripple';
      el.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      b.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };
    const sparks = (e) => {
      if (e.button !== 0) return;
      for (let i = 0; i < 9; i++) {
        const d = document.createElement('i');
        d.className = 'fx-spark';
        const a = (Math.PI * 2 * i) / 9 + Math.random() * 0.5;
        const l = 26 + Math.random() * 34;
        d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${Math.cos(a) * l}px;--dy:${Math.sin(a) * l}px`;
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 650);
      }
    };
    const likeBurst = (e) => {
      const b = e.target instanceof Element ? e.target.closest('button.cm-like') : null;
      if (b && !b.disabled) {
        const r = b.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 16, 70, ['#e5646e', '#d5b05a', '#f3efe6']);
      }
    };
    window.addEventListener('click', likeBurst);
    cleanups.push(() => window.removeEventListener('click', likeBurst));
    window.addEventListener('pointerdown', sparks);
    cleanups.push(() => window.removeEventListener('pointerdown', sparks));
    window.addEventListener('pointerdown', ripple);
    cleanups.push(() => window.removeEventListener('pointerdown', ripple));
    if (!hover) return () => cleanups.forEach((f) => f());

    // Cursor propio.
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let magnet = null;
    let snap = null;
    let snapKey = '';
    let snapEl = null;
    const loop = () => {
      if (snapEl) {
        // Sigue al elemento aunque haga scroll; si desaparece, suelta el anillo.
        const r = snapEl.isConnected ? snapEl.getBoundingClientRect() : null;
        if (r && r.width > 0 && mx >= r.left - 12 && mx <= r.right + 12 && my >= r.top - 12 && my <= r.bottom + 12) {
          snap = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        } else {
          snap = null;
          snapEl = null;
          snapKey = '';
          if (ring.current) {
            ring.current.style.width = '';
            ring.current.style.height = '';
            ring.current.style.borderRadius = '';
          }
        }
      }
      const tx = snap ? snap.x : mx;
      const ty = snap ? snap.y : my;
      rx += (tx - rx) * (snap ? 0.28 : 0.18);
      ry += (ty - ry) * (snap ? 0.28 : 0.18);
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      document.documentElement.classList.add('fx-cursor');
      const t = e.target instanceof Element ? e.target : null;
      const hot = !!t?.closest(HOT);
      ring.current?.classList.toggle('fx-hot', hot && !snap);
      // El anillo se adhiere a botones y enlaces pequeños.
      const hotEl = t?.closest('.btn, a.link, nav a, button.st-tool, .fx-mag, header a');
      let key = '';
      snap = null;
      snapEl = null;
      if (hotEl) {
        const r = hotEl.getBoundingClientRect();
        if (r.width < 340 && r.height < 90) {
          snap = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          snapEl = hotEl;
          key = `${Math.round(r.width)}x${Math.round(r.height)}`;
          if (key !== snapKey && ring.current) {
            ring.current.style.width = `${r.width + 14}px`;
            ring.current.style.height = `${r.height + 12}px`;
            ring.current.style.borderRadius = '16px';
          }
        }
      }
      if (!snap && snapKey && ring.current) {
        ring.current.style.width = '';
        ring.current.style.height = '';
        ring.current.style.borderRadius = '';
      }
      snapKey = key;
      let label = '';
      for (const [sel, txt] of LABELS) {
        const m = t?.closest(sel);
        if (m) {
          label = txt ?? m.getAttribute('data-cursor') ?? '';
          break;
        }
      }
      if (ring.current && ring.current.dataset.l !== label) {
        ring.current.dataset.l = label;
        ring.current.firstChild.textContent = label;
        ring.current.classList.toggle('fx-label', !!label);
      }

      // Brillo en tarjetas.
      const spot = t?.closest(SPOT);
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
        spot.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
        spot.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
      }

      // Botones magnéticos.
      const b = t?.closest('.btn, .fx-mag');
      if (magnet && magnet !== b) {
        magnet.style.transform = '';
        magnet = null;
      }
      if (b && !b.disabled) {
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
        magnet = b;
      }
    };
    const hero = document.getElementById('inicio');
    const par = (e) => {
      if (!hero) return;
      hero.style.setProperty('--px', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
      hero.style.setProperty('--py', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
    };
    window.addEventListener('pointermove', par, { passive: true });
    cleanups.push(() => window.removeEventListener('pointermove', par));
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;
    const konami = (e) => {
      pos = e.key === code[pos] ? pos + 1 : e.key === code[0] ? 1 : 0;
      if (pos === code.length) {
        pos = 0;
        for (let i = 0; i < 70; i++) {
          const d = document.createElement('i');
          d.className = 'fx-spark fx-rain';
          d.style.cssText = `left:${Math.random() * 100}vw;top:-10px;--dx:${(Math.random() - 0.5) * 120}px;--dy:${window.innerHeight + 40}px;animation-duration:${1.4 + Math.random() * 1.6}s;animation-delay:${Math.random() * 0.8}s;width:${4 + Math.random() * 6}px;height:${4 + Math.random() * 6}px`;
          document.body.appendChild(d);
          setTimeout(() => d.remove(), 3800);
        }
      }
    };
    window.addEventListener('keydown', konami);
    cleanups.push(() => window.removeEventListener('keydown', konami));
    const down = () => ring.current?.classList.add('fx-down');
    const up = () => ring.current?.classList.remove('fx-down');
    const leave = () => document.documentElement.classList.remove('fx-cursor');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('fx-cursor');
    });
    return () => cleanups.forEach((f) => f());
  }, []);

  return (
    <>
      <div className="fx-grain" aria-hidden />
      <div ref={ring} className="fx-ring" aria-hidden><span /></div>
      <div ref={dot} className="fx-dot" aria-hidden />
    </>
  );
}
