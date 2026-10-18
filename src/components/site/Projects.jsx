import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { useTable } from '../../lib/hooks.js';
import { ToolIcon } from '../../lib/icons.jsx';
import { plural } from '../../lib/format.js';
import SectionHead from './SectionHead.jsx';
import Reveal from './Reveal.jsx';
import ProjectDetail from './parts/ProjectDetail.jsx';
import { SbMedia, SbStyles, norm, useMedia, useToolMap } from './parts/sbKit.jsx';

const CSS = `
.pj-chapter{position:sticky;top:calc(84px + var(--i) * 14px);background:var(--bg);border:1px solid var(--line);margin-bottom:28px}
.pj-open{display:block;width:100%;text-align:left;background:none;border:0;padding:0;color:inherit;cursor:pointer}
.pj-open:focus-visible{outline:2px solid var(--gold);outline-offset:-2px}
.pj-media{position:relative;display:block;overflow:hidden;background:var(--bg-2)}
.pj-media>img{transition:transform .9s var(--ease)}
.pj-open:hover .pj-media>img{transform:scale(1.035)}
.pj-num{font-family:var(--font-mono);font-size:.8rem;color:var(--fg-3)}
.pj-arrow{transition:transform .3s var(--ease),color .3s}
.pj-open:hover .pj-arrow{transform:translate(3px,-3px);color:var(--gold)}
@media(max-width:1023px){.pj-chapter{position:relative;top:auto}}
`;

const Chips = ({ list, toolMap, max = 5 }) => (
  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
    {(list || []).slice(0, max).map((t) => {
      const tool = toolMap.get(norm(t));
      return <li key={t} className="chip">{tool ? <ToolIcon name={tool.icon} size={13} /> : null}{t}</li>;
    })}
    {(list || []).length > max && <li className="chip">+{list.length - max}</li>}
  </ul>
);

function Chapter({ p, i, n, toolMap, onOpen, sticky }) {
  return (
    <article className="pj-chapter" style={{ '--i': i, ...(sticky ? null : { position: 'relative', top: 'auto' }) }}>
      <button type="button" className="pj-open" onClick={() => onOpen(p.id)} aria-label={`Abrir proyecto ${p.title}`}>
        <span className="grid lg:grid-cols-12">
          <span className="pj-media aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[420px]"><SbMedia project={p} /></span>
          <span className="flex flex-col justify-between gap-8 p-6 lg:col-span-5 lg:p-10">
            <span>
              <span className="pj-num">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {p.category}</span>
              <span className="font-display mt-4 block text-[clamp(1.5rem,2.4vw,2.2rem)] font-semibold leading-[1.08] tracking-tight" style={{ overflowWrap: 'anywhere' }}>{p.title}</span>
              <span className="mt-4 block leading-relaxed text-fg-2">{p.summary}</span>
            </span>
            <span className="flex items-end justify-between gap-4">
              <Chips list={p.technologies} toolMap={toolMap} />
              <ArrowUpRight size={26} className="pj-arrow shrink-0" aria-hidden />
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}

function Card({ p, toolMap, onOpen }) {
  return (
    <article className="border border-line">
      <button type="button" className="pj-open" onClick={() => onOpen(p.id)} aria-label={`Abrir proyecto ${p.title}`}>
        <span className="pj-media aspect-[16/10]"><SbMedia project={p} /></span>
        <span className="block p-5">
          <span className="pj-num">{p.category}</span>
          <span className="font-display mt-2 flex items-start justify-between gap-3 text-[1.25rem] font-semibold leading-tight tracking-tight">
            <span style={{ overflowWrap: 'anywhere' }}>{p.title}</span>
            <ArrowUpRight size={20} className="pj-arrow mt-1 shrink-0" aria-hidden />
          </span>
          <span className="mt-2 block text-[.94rem] leading-relaxed text-fg-2">{p.summary}</span>
          <span className="mt-4 block"><Chips list={p.technologies} toolMap={toolMap} max={4} /></span>
        </span>
      </button>
    </article>
  );
}

export default function Projects() {
  const { rows, loading, error } = useTable('projects');
  const tools = useTable('tools');
  const toolMap = useToolMap(tools.rows);
  const wide = useMedia('(min-width: 1024px)');
  const [cat, setCat] = useState('');
  const [tech, setTech] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const on = (e) => e.detail && setOpen(e.detail);
    window.addEventListener('fp:open-project', on);
    return () => window.removeEventListener('fp:open-project', on);
  }, []);

  const cats = useMemo(() => [...new Set(rows.map((p) => p.category).filter(Boolean))], [rows]);
  const techs = useMemo(() => [...new Set(rows.flatMap((p) => p.technologies || []))].sort((a, b) => a.localeCompare(b)), [rows]);
  const filtering = Boolean(cat || tech || q.trim());
  const shown = useMemo(() => {
    const t = norm(q);
    return rows.filter((p) => (!cat || p.category === cat) && (!tech || (p.technologies || []).includes(tech)) && (!t || norm([p.title, p.summary, p.category, ...(p.technologies || [])].join(' ')).includes(t)));
  }, [rows, cat, tech, q]);

  const featured = filtering ? [] : rows.filter((p) => p.featured);
  const rest = filtering ? shown : rows.filter((p) => !p.featured);
  const idx = rows.findIndex((p) => p.id === open);
  const current = idx >= 0 ? rows[idx] : null;
  useEffect(() => {
    if (open && !loading && idx < 0) setOpen(null);
  }, [open, loading, idx]);
  const step = (d) => setOpen(rows[(idx + d + rows.length) % rows.length].id);

  return (
    <section id="proyectos" aria-labelledby="proyectos-title" className="sb-sec">
      <SbStyles />
      <style>{CSS}</style>
      <div className="container py-24 lg:py-36">
        <SectionHead kicker="Proyectos" id="proyectos-title">Sistemas que hablan con el mundo físico</SectionHead>
        <Reveal><p className="sb-lead mt-6">Hardware, backend, IA e interfaz trabajando como un solo sistema. Abre cualquier proyecto para ver el detalle.</p></Reveal>

        {loading ? (
          <div className="mt-16 grid gap-6 lg:grid-cols-2" aria-busy="true">{[0, 1].map((k) => <div key={k} className="fb-skel aspect-[16/10]" />)}</div>
        ) : error && !rows.length ? (
          <p role="alert" className="mt-16 text-fg-2">No se pudieron cargar los proyectos. Recarga la página.</p>
        ) : !rows.length ? (
          <p className="mt-16 text-fg-2">Pronto habrá proyectos publicados aquí.</p>
        ) : (
          <>
            {(rows.length > 4 || filtering) && (
              <div className="mt-12 flex flex-wrap items-center gap-3">
                <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
                  {['', ...cats].map((c) => (
                    <button key={c || 'all'} type="button" className={`chip ${cat === c ? 'chip-solid' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)} style={{ minHeight: 36, cursor: 'pointer' }}>{c || 'Todos'}</button>
                  ))}
                </div>
                <div className="field ml-auto flex-row gap-2" style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <label htmlFor="pj-tech" className="sr-only">Filtrar por tecnología</label>
                  <select id="pj-tech" className="select" value={tech} onChange={(e) => setTech(e.target.value)} style={{ minWidth: 160 }}>
                    <option value="">Toda tecnología</option>
                    {techs.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <label htmlFor="pj-q" className="sr-only">Buscar proyectos</label>
                  <span className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" aria-hidden /><input id="pj-q" type="search" className="input" style={{ paddingLeft: '2.2rem', minWidth: 190 }} placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} /></span>
                </div>
              </div>
            )}
            {filtering && <p className="hint mt-4" aria-live="polite">{plural(shown.length, 'proyecto', 'proyectos')}</p>}

            {featured.length > 0 && (
              <div className="mt-14" role="list" aria-label="Proyectos destacados">
                {featured.map((p, i) => (
                  <div role="listitem" key={p.id}><Chapter p={p} i={i} n={featured.length} toolMap={toolMap} onOpen={setOpen} sticky={wide} /></div>
                ))}
              </div>
            )}

            {rest.length > 0 ? (
              <>
                {featured.length > 0 && <h3 className="font-display mb-6 mt-20 text-[1.4rem] font-medium">Más proyectos</h3>}
                <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${featured.length ? '' : 'mt-10'}`}>
                  {rest.map((p) => <Card key={p.id} p={p} toolMap={toolMap} onOpen={setOpen} />)}
                </div>
              </>
            ) : !featured.length ? (
              <div className="mt-12 border border-dashed border-line p-10 text-center">
                <p className="font-display text-lg">Ningún proyecto coincide</p>
                <button type="button" className="btn btn-sm mt-4" onClick={() => (setCat(''), setTech(''), setQ(''))}>Quitar filtros</button>
              </div>
            ) : null}
          </>
        )}
      </div>
      {current && <ProjectDetail project={current} index={idx} total={rows.length} toolMap={toolMap} onClose={() => setOpen(null)} onStep={step} />}
    </section>
  );
}
