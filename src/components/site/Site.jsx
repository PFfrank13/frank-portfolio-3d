import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from './scrollControl.js';
import { scrollState } from '../../lib/scroll.js';
import Nav from './Nav.jsx';
import Hero from './Hero.jsx';
import Profile from './Profile.jsx';
import Projects from './Projects.jsx';
import Stack from './Stack.jsx';
import Credentials from './Credentials.jsx';
import CvSection from './CvSection.jsx';
import Contact from './Contact.jsx';
import Comments from './Comments.jsx';
import Footer from './Footer.jsx';
import ScrollProgress from './ScrollProgress.jsx';
import SideIndex from './SideIndex.jsx';
import Loader from './Loader.jsx';
import Fx from './Fx.jsx';
import Strip from './Strip.jsx';
import Kinetic from './Kinetic.jsx';
import Process from './Process.jsx';
import ToTop from './ToTop.jsx';

export default function Site() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduce ? null : new Lenis({ lerp: 0.1, smoothWheel: true });
    setLenis(lenis);
    let raf = 0;
    let lastY = window.scrollY;
    const loop = (time) => {
      lenis?.raf(time);
      const y = lenis ? lenis.scroll : window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollState.velocity = y - lastY;
      scrollState.y = y;
      scrollState.progress = Math.min(1, Math.max(0, y / max));
      lastY = y;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      setLenis(null);
      lenis?.destroy();
      scrollState.y = 0;
      scrollState.velocity = 0;
      scrollState.progress = 0;
    };
  }, []);

  return (
    <div className="bg-bg text-fg">
      <a
        href="#contenido"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('contenido')?.focus({ preventScroll: false });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
      >
        Saltar al contenido
      </a>
      <Loader />
      <Fx />
      <ToTop />
      <ScrollProgress />
      <Nav />
      <SideIndex />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <Strip />
        <Profile />
        <Projects />
        <Kinetic a={['Hardware', 'Backend', 'Inteligencia artificial', 'Interfaz']} b={['Diseño', 'Código', 'Sistemas', 'Resultados']} />
        <Stack />
        <Process />
        <Credentials />
        <Kinetic a={['Ica · Perú', 'Full-Stack', 'Disponible', 'Contáctame']} b={['Construyamos', 'algo', 'grande', 'juntos']} />
        <CvSection />
        <Contact />
        <Comments />
      </main>
      <Footer />
    </div>
  );
}
