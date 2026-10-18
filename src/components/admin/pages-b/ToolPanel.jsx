import { ToolIcon } from '../../../lib/icons.jsx';

/** Réplica del "panelito" que ve el visitante al pasar el cursor sobre una herramienta. */
export default function ToolPanel({ tool }) {
  const name = tool.name?.trim();
  const desc = tool.description?.trim();
  const used = tool.used_in?.trim();
  return (
    <div className="surface p-5" style={{ background: 'var(--bg-2)' }}>
      <div className="flex items-start gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[14px]" style={{ border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--fg)' }}>
          <ToolIcon name={tool.icon} size={34} />
        </span>
        <div className="min-w-0">
          <h4 className="font-display text-[1.2rem] font-medium leading-tight tracking-tight" style={{ overflowWrap: 'anywhere' }}>
            {name || <span className="text-fg-3">Nombre de la herramienta</span>}
          </h4>
          <p className="mt-1 text-[0.8rem] text-fg-3">{tool.category}</p>
        </div>
      </div>
      <p className="mt-4 text-[0.9rem] leading-relaxed text-fg-2" style={{ overflowWrap: 'anywhere' }}>
        {desc || <span className="text-fg-3">Para qué la usas, en una frase.</span>}
      </p>
      <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
        <p className="text-[0.74rem] text-fg-3">Dónde la uso</p>
        <p className="mt-0.5 text-[0.88rem]" style={{ color: 'var(--gold)', overflowWrap: 'anywhere' }}>
          {used || <span className="text-fg-3">Proyecto o contexto</span>}
        </p>
      </div>
    </div>
  );
}
