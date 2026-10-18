import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTable } from '../../lib/hooks.js';
import { ToolIcon } from '../../lib/icons.jsx';
import SectionHead from './SectionHead.jsx';
import Reveal from './Reveal.jsx';
import { SbStyles, norm, useMedia } from './parts/sbKit.jsx';

const CSS = `
.st-tool{display:flex;align-items:center;gap:.7rem;width:100%;min-height:52px;padding:.55rem .9rem;border:1px solid var(--line);background:transparent;color:var(--fg);text-align:left;cursor:pointer;
  font-family:var(--font-body);font-size:.95rem;transition:border-color .2s var(--ease),background .2s var(--ease)}
.st-tool:hover{border-color:var(--fg-3);background:var(--bg-1)}
.st-tool[aria-pressed='true']{border-color:var(--gold);background:var(--bg-1)}
.st-tool:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.st-panel{border:1px solid var(--line);background:var(--bg-1);padding:1.6rem}
.st-swap{animation:sb-swap .28s var(--ease)}
.st-sheet{position:fixed;left:0;right:0;bottom:0;z-index:60;border-top:1px solid var(--line);background:var(--bg-1);padding:1.25rem var(--gutter) calc(1.5rem + env(safe-area-inset-bottom));box-shadow:0 -20px 50px rgba(0,0,0,.5);animation:sb-rise .28s var(--ease)}
`;

function Panel({ tool, projects, onOpenProject, onClose }) {
  if (!tool) {
    return (
      <div className="st-panel text-fg-2">
        <p className="font-display text-[1.2rem] text-fg">Elige una herramienta</p>
        <p className="mt-2 text-[.94rem] leading-relaxed">Pasa el cursor o toca cualquiera para ver para qué la uso y en qué proyectos aparece.</p>
      </div>
    );
  }
  return (
    <div className="st-panel st-swap" key={tool.id}>
      <div className="flex items-start gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center border border-line bg-bg"><ToolIcon name={tool.icon} size={34} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.45rem] font-semibold leading-tight tracking-tight" style={{ overflowWrap: 'anywhere' }}>{tool.name}</h3>
          <p className="mt-1 text-sm text-fg-3">{tool.category}</p>
        </div>
        {onClose && <button type="button" className="sb-iconbtn shrink-0" onClick={onClose} aria-label="Cerrar panel"><X size={18} /></button>}
      </div>
      {tool.description && <p className="mt-5 leading-relaxed text-fg-2">{tool.description}</p>}
      {tool.used_in && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm text-fg-3">Dónde la uso</p>
          <p className="mt-1 text-gold" style={{ overflowWrap: 'anywhere' }}>{tool.used_in}</p>
        </div>
      )}
      {projects.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm text-fg-3">En proyectos</p>
          <ul className="m-0 mt-2 grid list-none gap-1 p-0">
            {projects.map((p) => (
              <li key={p.id}><button type="button" className="link text-left" onClick={() => onOpenProject(p.id)}>{p.title}</button></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Stack() {
  const { rows, loading, error } = useTable('tools');
  const projects = useTable('projects');
  const wide = useMedia('(min-width: 1024px)');
  const [sel, setSel] = useState(null);
  const grid = useRef(null);

  const groups = useMemo(() => {
    const m = new Map();
    rows.forEach((t) => m.set(t.category, [...(m.get(t.category) || []), t]));
    return [...m.entries()];
  }, [rows]);
  const flat = useMemo(() => groups.flatMap(([, l]) => l), [groups]);
  const [touched, setTouched] = useState(false);
  const [demo, setDemo] = useState(0);
  const tool = flat.find((t) => t.id === sel) || (wide && !touched && flat.length ? flat[demo % flat.length] : null);
  const using = useMemo(() => (tool ? projects.rows.filter((p) => (p.technologies || []).some((x) => norm(x) === norm(tool.name))) : []), [tool, projects.rows]);

  useEffect(() => {
    if (!wide || touched || !flat.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setDemo((n) => n + 1), 2800);
    return () => clearInterval(id);
  }, [wide, touched, flat.length]);

  useEffect(() => {
    if (sel && !loading && !flat.some((t) => t.id === sel)) setSel(null);
  }, [sel, flat, loading]);

  const openProject = (id) => {
    setSel(null);
    window.dispatchEvent(new CustomEvent('fp:open-project', { detail: id }));
  };

  const onKey = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    const btns = [...grid.current.querySelectorAll('button.st-tool')];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    btns[(i + keys[e.key] + btns.length) % btns.length].focus();
  };

  return (
    <section id="stack" aria-labelledby="stack-title" className="sb-sec">
      <SbStyles />
      <style>{CSS}</style>
      <div className="container py-24 lg:py-36">
        <SectionHead kicker="Stack" id="stack-title">Herramientas que manejo</SectionHead>
        <Reveal><p className="sb-lead mt-6">Pasa el cursor, enfoca con el teclado o toca una herramienta: el panel te dice para qué la uso y dónde.</p></Reveal>

        {loading ? (
          <div className="mt-14 grid gap-3 sm:grid-cols-3" aria-busy="true">{Array.from({ length: 9 }, (_, i) => <div key={i} className="fb-skel h-[52px]" />)}</div>
        ) : error && !rows.length ? (
          <p role="alert" className="mt-14 text-fg-2">No se pudieron cargar las herramientas.</p>
        ) : (
          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7" ref={grid} onKeyDown={onKey}>
              {groups.map(([cat, list]) => (
                <div key={cat} className="mb-9">
                  <h3 className="mb-3 text-sm text-fg-3">{cat}</h3>
                  <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          className="st-tool"
                          aria-pressed={sel === t.id}
                          data-demo={tool?.id === t.id && sel !== t.id ? '1' : undefined}
                          onClick={() => (setTouched(true), setSel(sel === t.id && !wide ? null : t.id))}
                          onMouseEnter={() => wide && (setTouched(true), setSel(t.id))}
                          onFocus={() => wide && (setTouched(true), setSel(t.id))}
                        >
                          <ToolIcon name={t.icon} size={20} />
                          <span className="min-w-0 flex-1 truncate">{t.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {wide && (
              <aside className="lg:col-span-5" aria-label="Detalle de la herramienta">
                <div className="sticky top-28" aria-live="polite"><Panel tool={tool} projects={using} onOpenProject={openProject} /></div>
              </aside>
            )}
          </div>
        )}
      </div>
      {!wide && tool && (
        <div className="st-sheet" role="dialog" aria-label={`Detalle de ${tool.name}`} data-lenis-prevent style={{ maxHeight: '70dvh', overflowY: 'auto' }}>
          <Panel tool={tool} projects={using} onOpenProject={openProject} onClose={() => setSel(null)} />
        </div>
      )}
    </section>
  );
}
