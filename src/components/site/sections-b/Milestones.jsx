import { RefreshCw } from 'lucide-react';
import { useTable } from '../../../lib/hooks.js';
import Reveal from '../Reveal.jsx';
import { anchorClick } from '../scrollControl.js';

/** Los proyectos destacados hacen de hitos: solo salen del store, nada escrito a mano. */
export default function Milestones() {
  const { rows, loading, error, reload } = useTable('projects');
  const items = rows.filter((p) => p.featured);

  let body;
  if (loading) {
    body = (
      <ul className="m-0 list-none p-0" aria-busy="true" aria-label="Cargando trabajos destacados">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="fb-row">
            <div className="fb-skel h-6 w-2/3" />
            <div className="fb-skel mt-3 h-4 w-full max-w-[52ch]" />
          </li>
        ))}
      </ul>
    );
  } else if (error && !rows.length) {
    body = (
      <div className="fb-row" role="alert">
        <p className="text-fg-2">No se pudieron cargar los trabajos destacados. Revisa tu conexión e inténtalo de nuevo.</p>
        <button type="button" className="btn mt-4" onClick={reload}>
          <RefreshCw size={16} aria-hidden /> Reintentar
        </button>
      </div>
    );
  } else if (!items.length) {
    body = (
      <div className="fb-row">
        <p className="max-w-[52ch] text-fg-2">Aún no hay trabajos destacados. Frank los marca como destacados desde su panel y aparecen aquí al instante.</p>
      </div>
    );
  } else {
    body = (
      <ul className="m-0 list-none p-0">
        {items.map((p, i) => (
          <Reveal as="li" key={p.id} delay={Math.min(i, 3) * 0.06} y={12} className="fb-row">
            <div className="grid gap-x-8 gap-y-2 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <h4 className="font-display text-[1.35rem] font-medium leading-[1.15] tracking-tight">
                <a href="#proyectos" onClick={anchorClick('proyectos')} className="fb-stretch no-underline">
                  {p.title}
                </a>
              </h4>
              <div>
                <p className="leading-[1.6] text-fg-2">{p.summary}</p>
                {p.technologies?.length ? <p className="mt-2 text-sm text-fg-3">{p.technologies.slice(0, 5).join(', ')}</p> : null}
              </div>
            </div>
          </Reveal>
        ))}
        <li className="border-t border-line pt-5">
          <a href="#proyectos" onClick={anchorClick('proyectos')} className="link inline-flex min-h-[44px] items-center text-[0.95rem]">
            Ver todos los proyectos
          </a>
        </li>
      </ul>
    );
  }

  return (
    <div>
      <h3 className="font-display mb-6 text-[1.05rem] font-semibold tracking-tight">Trabajos destacados</h3>
      {body}
    </div>
  );
}
