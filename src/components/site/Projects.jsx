import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { useTable } from '../../lib/hooks.js';
import { ToolIcon } from '../../lib/icons.jsx';
import { plural } from '../../lib/format.js';
import SectionHead from './SectionHead.jsx';
import Reveal from './Reveal.jsx';
import ProjectDetail from './parts/ProjectDetail.jsx';
import { SbMedia, SbStyles, norm, useMedia, useToolMap } from './parts/sbKit.jsx';

const CSS = `
.pj-chapter{position:sticky;top:calc(84px + var(--i) * 14px);margin-bottom:28px}
.pj-fx{position:relative;isolation:isolate;border-radius:22px;background:linear-gradient(180deg,var(--bg-1),var(--bg));border:1px solid var(--line);overflow:hidden;
  transition:transform .55s var(--ease),box-shadow .55s var(--ease),border-color .4s}
.pj-fx::before{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .45s;
  background:radial-gradient(560px circle at var(--mx,50%) var(--my,50%),rgba(213,176,90,.15),transparent 62%)}
.pj-fx::after{content:'';position:absolute;inset:0;z-index:4;pointer-events:none;padding:1.5px;border-radius:inherit;opacity:0;transition:opacity .45s;
  background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),var(--gold),rgba(213,176,90,.25) 45%,transparent 70%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.pj-fx:hover::before,.pj-fx:hover::after,.pj-fx:focus-within::before,.pj-fx:focus-within::after{opacity:1}
.pj-fx:hover{box-shadow:0 40px 80px -40px rgba(0,0,0,.95),0 0 0 1px rgba(213,176,90,.12)}
.pj-card{background:var(--bg-1);transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transform-style:preserve-3d;will-change:transform}
.pj-card:hover{transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(-8px)}
.pj-card.is-live{transition:transform .12s linear,box-shadow .55s var(--ease)}
.pj-open{display:block;width:100%;text-align:left;background:none;border:0;padding:0;color:inherit;cursor:pointer;position:relative;z-index:1}
.pj-open:focus-visible{outline:2px solid var(--gold);outline-offset:-3px}
.pj-media{position:relative;display:block;overflow:hidden;background:var(--bg-2)}
.pj-media>*{transition:transform 1s var(--ease),filter .6s}
.pj-open:hover .pj-media>*:first-child{transform:scale(1.06)}
.pj-media::before{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.28),transparent 32%,transparent 58%,rgba(8,9,10,.82))}
.pj-media::after{content:'';position:absolute;top:-20%;bottom:-20%;left:-60%;width:42%;z-index:3;pointer-events:none;transform:skewX(-20deg) translateX(0);opacity:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent)}
.pj-open:hover .pj-media::after{opacity:1;animation:pj-shine 1.1s var(--ease) forwards}
@keyframes pj-shine{to{transform:skewX(-20deg) translateX(480%)}}
.pj-tag{position:absolute;z-index:4;left:14px;top:14px;display:inline-flex;align-items:center;gap:.45rem;padding:.32rem .75rem;border-radius:999px;font:500 .72rem/1 var(--font-mono);letter-spacing:.04em;color:var(--fg);
  background:rgba(12,13,14,.55);border:1px solid rgba(255,255,255,.14);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.pj-tag i{width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px var(--gold)}
.pj-idx{position:absolute;z-index:4;right:16px;top:12px;font:700 1.9rem/1 var(--font-display);letter-spacing:-.04em;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.55)}
.pj-cta{position:absolute;z-index:4;left:14px;right:14px;bottom:14px;display:flex;align-items:center;justify-content:space-between;padding:.7rem 1rem;border-radius:14px;
  font:600 .88rem/1 var(--font-body);color:#0c0d0e;background:var(--gold);transform:translateY(130%);opacity:0;transition:transform .5s var(--ease),opacity .35s}
.pj-open:hover .pj-cta,.pj-open:focus-visible .pj-cta{transform:none;opacity:1}
.pj-corner{position:absolute;z-index:4;width:22px;height:22px;border:2px solid var(--gold);opacity:0;transition:opacity .4s,transform .5s var(--ease);pointer-events:none}
.pj-corner.a{left:12px;top:12px;border-right:0;border-bottom:0;transform:translate(8px,8px)}
.pj-corner.b{right:12px;top:12px;border-left:0;border-bottom:0;transform:translate(-8px,8px)}
.pj-corner.c{left:12px;bottom:12px;border-right:0;border-top:0;transform:translate(8px,-8px)}
.pj-corner.d{right:12px;bottom:12px;border-left:0;border-top:0;transform:translate(-8px,-8px)}
.pj-open:hover .pj-corner{opacity:.9;transform:none}
.pj-big{position:absolute;right:-.04em;bottom:-.2em;z-index:0;font:700 clamp(9rem,17vw,16rem)/1 var(--font-display);letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1px rgba(213,176,90,.08);pointer-events:none;user-select:none;transition:transform 1s var(--ease),-webkit-text-stroke-color .5s}
.pj-fx:hover .pj-big{transform:translateY(-14px);-webkit-text-stroke-color:rgba(213,176,90,.2)}
.pj-arrow{transition:transform .35s var(--ease),color .3s}
.pj-open:hover .pj-arrow{transform:translate(4px,-4px);color:var(--gold)}
.pj-num{font-family:var(--font-mono);font-size:.78rem;letter-spacing:.06em;color:var(--fg-3);display:flex;align-items:center;gap:.7rem}
.pj-num b{color:var(--gold);font-weight:500}
.pj-num::after{content:'';height:1px;flex:1;background:linear-gradient(90deg,var(--line),transparent)}
.pj-title{background:linear-gradient(90deg,var(--fg),var(--fg)) 0 100%/0 2px no-repeat;transition:background-size .7s var(--ease)}
.pj-open:hover .pj-title{background-size:100% 2px}
.pj-btn{display:inline-flex;align-items:center;gap:.6rem;padding:.7rem 1.15rem;border-radius:999px;border:1px solid var(--line);font:600 .88rem/1 var(--font-body);color:var(--fg);transition:background .3s,color .3s,border-color .3s,gap .3s var(--ease)}
.pj-open:hover .pj-btn{background:var(--gold);color:#0c0d0e;border-color:var(--gold);gap:.9rem}
.pj-chips .chip{transition:border-color .3s,color .3s,background .3s,transform .4s var(--ease)}
.pj-open:hover .pj-chips .chip{border-color:rgba(213,176,90,.45);color:var(--fg)}
.pj-open:hover .pj-chips .chip:nth-child(2){transform:translateY(-2px)}
.pj-open:hover .pj-chips .chip:nth-child(3){transform:translateY(-3px)}
.pj-open:hover .pj-chips .chip:nth-child(4){transform:translateY(-2px)}
.pj-media .sb-pat-cat{display:none}
@media(max-width:1023px){.pj-chapter{position:relative;top:auto}.pj-big{font-size:8rem}}
@media(hover:none){.pj-cta{transform:none;opacity:1;position:static;margin:14px 0 0}.pj-corner{display:none}}
@media(prefers-reduced-motion:reduce){.pj-fx,.pj-card:hover{transform:none!important}.pj-open:hover .pj-media::after{animation:none}}
`;


/** Foco dorado que sigue al cursor (y, si `tilt`, inclinación 3D suave). Solo con ratón; no afecta al teclado ni al táctil. */
function useSpot(tilt) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        if (tilt && !calm) {
          el.style.setProperty('--rx', `${((0.5 - y) * 8).toFixed(2)}deg`);
          el.style.setProperty('--ry', `${((x - 0.5) * 10).toFixed(2)}deg`);
          el.classList.add('is-live');
        }
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.classList.remove('is-live');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [tilt]);
  return ref;
}

const Corners = () => (
  <>
    <i className="pj-corner a" aria-hidden />
    <i className="pj-corner b" aria-hidden />
    <i className="pj-corner c" aria-hidden />
    <i className="pj-corner d" aria-hidden />
  </>
);

const Chips = ({ list, toolMap, max = 5 }) => (
  <ul className="pj-chips m-0 flex list-none flex-wrap gap-2 p-0">
    {(list || []).slice(0, max).map((t) => {
      const tool = toolMap.get(norm(t));
      return <li key={t} className="chip">{tool ? <ToolIcon name={tool.icon} size={13} /> : null}{t}</li>;
    })}
    {(list || []).length > max && <li className="chip">+{list.length - max}</li>}
  </ul>
);

function Chapter({ p, i, n, toolMap, onOpen, sticky }) {
  const ref = useSpot(false);
  return (
    <article ref={ref} className="pj-chapter pj-fx" style={{ '--i': i, ...(sticky ? null : { position: 'relative', top: 'auto' }) }}>
      <span className="pj-big" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
      <button type="button" className="pj-open" onClick={() => onOpen(p.id)} aria-label={`Abrir proyecto ${p.title}`}>
        <span className="grid lg:grid-cols-12">
          <span className="pj-media aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[440px]">
            <SbMedia project={p} />
            <span className="pj-tag"><i />Destacado</span>
            <Corners />
            <span className="pj-cta">Ver proyecto completo <ArrowUpRight size={18} aria-hidden /></span>
          </span>
          <span className="flex flex-col justify-between gap-8 p-6 lg:col-span-5 lg:p-10">
            <span>
              <span className="pj-num"><b>{String(i + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')} · {p.category}</span>
              <span className="pj-title font-display mt-5 block pb-1 text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-[1.06] tracking-tight" style={{ overflowWrap: 'anywhere' }}>{p.title}</span>
              <span className="mt-5 block leading-relaxed text-fg-2">{p.summary}</span>
            </span>
            <span className="flex flex-wrap items-end justify-between gap-5">
              <Chips list={p.technologies} toolMap={toolMap} />
              <span className="pj-btn">Ver detalle <ArrowUpRight size={17} aria-hidden /></span>
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}

function Card({ p, i, toolMap, onOpen }) {
  const ref = useSpot(true);
  return (
    <article ref={ref} className="pj-fx pj-card">
      <button type="button" className="pj-open" onClick={() => onOpen(p.id)} aria-label={`Abrir proyecto ${p.title}`}>
        <span className="pj-media aspect-[16/10]">
          <SbMedia project={p} />
          <span className="pj-tag"><i />{p.category}</span>
          <span className="pj-idx" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
          <Corners />
          <span className="pj-cta">Ver proyecto <ArrowUpRight size={18} aria-hidden /></span>
        </span>
        <span className="block p-6">
          <span className="pj-title font-display flex items-start justify-between gap-3 pb-1 text-[1.3rem] font-semibold leading-tight tracking-tight">
            <span style={{ overflowWrap: 'anywhere' }}>{p.title}</span>
            <ArrowUpRight size={20} className="pj-arrow mt-1 shrink-0" aria-hidden />
          </span>
          <span className="mt-3 block text-[.94rem] leading-relaxed text-fg-2">{p.summary}</span>
          <span className="mt-5 block"><Chips list={p.technologies} toolMap={toolMap} max={4} /></span>
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
                <div className={`grid gap-7 sm:grid-cols-2 lg:grid-cols-3 ${featured.length ? '' : 'mt-10'}`}>
                  {rest.map((p, k) => <Reveal key={p.id} delay={(k % 3) * 0.08}><Card p={p} i={featured.length + k} toolMap={toolMap} onOpen={setOpen} /></Reveal>)}
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
