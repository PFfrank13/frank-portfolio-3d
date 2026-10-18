import { useEffect, useState } from 'react';

/** Scroll-spy: devuelve el id de la sección que cruza la línea media del viewport. */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    const observe = () =>
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && !seen.has(id)) {
          seen.add(id);
          io.observe(el);
        }
      });
    observe();
    // Las secciones de otros componentes pueden montarse un poco después.
    const t1 = setTimeout(observe, 400);
    const t2 = setTimeout(observe, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      io.disconnect();
    };
  }, [ids]);
  return active;
}
