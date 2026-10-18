import { SECTION_IDS, SECTION_LABELS, PAPER_IDS } from './sections.js';
import useActiveSection from './useActiveSection.js';
import { anchorClick } from './scrollControl.js';

/**
 * Índice lateral (solo ≥1280 px). Va en el margen derecho: marcas finas siempre visibles y el nombre
 * de la sección activa (o enfocada) se despliega hacia la izquierda. Cambia de tinta sobre secciones de papel.
 */
export default function SideIndex() {
  const active = useActiveSection(SECTION_IDS);
  const onPaper = PAPER_IDS.includes(active);
  const ink = onPaper ? '#141414' : '#ebe7df';
  return (
    <nav
      aria-label="Secciones"
      className="fixed right-5 top-1/2 z-[90] hidden -translate-y-1/2 min-[1280px]:block"
      style={{ color: ink, transition: 'color .3s var(--ease)' }}
    >
      <ul className="m-0 flex list-none flex-col items-end p-0">
        {SECTION_IDS.map((id) => {
          const on = id === active;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={anchorClick(id)}
                aria-current={on ? 'true' : undefined}
                className="group flex min-h-[30px] items-center gap-3 rounded py-1 text-[13px] no-underline"
              >
                <span
                  className={`font-medium transition-opacity duration-200 ${on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
                >
                  {SECTION_LABELS[id]}
                </span>
                <span
                  aria-hidden
                  className="block h-px bg-current"
                  style={{ width: on ? 28 : 14, opacity: on ? 1 : 0.45, transition: 'width .3s var(--ease), opacity .25s' }}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
