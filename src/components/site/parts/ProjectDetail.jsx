import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { ToolIcon } from '../../../lib/icons.jsx';
import Img from '../../ui/Img.jsx';
import { Lightbox, Overlay, SbCover, norm, safeUrl, useSwipe } from './sbKit.jsx';

/** Ficha completa de un proyecto: galería, descripción, puntos clave, tecnologías y enlaces. */
export default function ProjectDetail({ project, index, total, toolMap, onClose, onStep }) {
  const [shot, setShot] = useState(0);
  const [zoom, setZoom] = useState(null);
  const imgs = project.image_urls || [];
  const live = safeUrl(project.live_url);
  const repo = safeUrl(project.github_url);
  const gallery = useMemo(() => imgs.map((src, i) => ({ src, alt: `${project.title}, imagen ${i + 1}` })), [imgs, project.title]);
  const swipe = useSwipe(() => onStep(-1), () => onStep(1));

  return (
    <>
      <Overlay
        label={`Proyecto: ${project.title}`}
        onClose={onClose}
        onKey={(e) => {
          if (zoom !== null) return;
          if (e.key === 'ArrowLeft') onStep(-1);
          if (e.key === 'ArrowRight') onStep(1);
        }}
      >
        <div className="flex h-full flex-col" {...swipe.bind}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-[var(--gutter)] py-3">
            <p className="text-sm text-fg-2" aria-live="polite">{index + 1} de {total}</p>
            <div className="flex gap-2">
              <button type="button" className="sb-iconbtn" onClick={() => onStep(-1)} aria-label="Proyecto anterior" disabled={total < 2}><ArrowLeft size={18} /></button>
              <button type="button" className="sb-iconbtn" onClick={() => onStep(1)} aria-label="Proyecto siguiente" disabled={total < 2}><ArrowRight size={18} /></button>
              <button type="button" className="sb-iconbtn" onClick={onClose} aria-label="Cerrar proyecto" data-autofocus><X size={18} /></button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto" data-lenis-prevent key={project.id}>
            <div className="container grid gap-10 py-10 lg:grid-cols-12 lg:gap-14 lg:py-16" style={{ animation: 'sb-rise .35s var(--ease)' }}>
              <div className="lg:col-span-7">
                <div className="relative aspect-[16/10] overflow-hidden border border-line bg-bg-2">
                  {imgs.length ? (
                    <button type="button" className="absolute inset-0 block h-full w-full cursor-zoom-in" onClick={() => setZoom(shot)} aria-label="Ampliar imagen">
                      <Img src={imgs[shot]} alt={gallery[shot]?.alt} className="h-full w-full object-cover" />
                    </button>
                  ) : (
                    <SbCover title={project.title} category={project.category} />
                  )}
                </div>
                {imgs.length > 1 && (
                  <ul className="m-0 mt-3 flex list-none gap-2 overflow-x-auto p-0 pb-1" aria-label="Galería">
                    {imgs.map((src, i) => (
                      <li key={src + i} className="shrink-0">
                        <button type="button" onClick={() => setShot(i)} aria-label={`Ver imagen ${i + 1}`} aria-current={i === shot} className="block h-[58px] w-[88px] overflow-hidden border" style={{ borderColor: i === shot ? 'var(--gold)' : 'var(--line)', opacity: i === shot ? 1 : 0.7 }}>
                          <Img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="lg:col-span-5">
                <p className="text-sm text-fg-3">{project.category}</p>
                <h3 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.5rem)] font-semibold leading-[1.05] tracking-tight" style={{ overflowWrap: 'anywhere' }}>{project.title}</h3>
                {project.description || project.summary ? <p className="mt-5 leading-[1.7] text-fg-2" style={{ whiteSpace: 'pre-line' }}>{project.description || project.summary}</p> : null}
                {project.key_features?.length > 0 && (
                  <>
                    <h4 className="mt-8 text-sm text-fg-3">Puntos clave</h4>
                    <ul className="m-0 mt-3 grid list-none gap-2.5 p-0">
                      {project.key_features.map((k) => (
                        <li key={k} className="flex gap-3 text-[.96rem] leading-snug"><span aria-hidden className="mt-[.55em] h-px w-4 shrink-0 bg-gold" />{k}</li>
                      ))}
                    </ul>
                  </>
                )}
                {project.technologies?.length > 0 && (
                  <>
                    <h4 className="mt-8 text-sm text-fg-3">Tecnologías</h4>
                    <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
                      {project.technologies.map((t) => {
                        const tool = toolMap.get(norm(t));
                        return (
                          <li key={t} className="chip">{tool ? <ToolIcon name={tool.icon} size={14} /> : null}{t}</li>
                        );
                      })}
                    </ul>
                  </>
                )}
                {(live || repo) && (
                  <div className="mt-9 flex flex-wrap gap-3">
                    {live && <a className="btn btn-primary" href={live} target="_blank" rel="noopener noreferrer">Ver en vivo <ArrowUpRight size={16} aria-hidden /><span className="sr-only"> (se abre en una pestaña nueva)</span></a>}
                    {repo && <a className="btn" href={repo} target="_blank" rel="noopener noreferrer"><ToolIcon name="github" size={16} /> Código<span className="sr-only"> (se abre en una pestaña nueva)</span></a>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Overlay>
      {zoom !== null && <Lightbox items={gallery} index={zoom} onIndex={(i) => (setZoom(i), setShot(i))} onClose={() => setZoom(null)} />}
    </>
  );
}
