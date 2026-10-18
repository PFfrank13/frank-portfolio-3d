import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { useTable } from '../../lib/hooks.js';
import { ToolIcon } from '../../lib/icons.jsx';
import { plural } from '../../lib/format.js';
import { confirmDialog, Empty, PageHeader, Spinner, toast } from './ui.jsx';
import { errMsg, IconBtn, SearchBox } from './parts/bits.jsx';
import ToolEditor from './pages-b/ToolEditor.jsx';

export default function Tools() {
  const { rows, loading, error } = useTable('tools');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(() => new Set());
  const nextSort = rows.reduce((m, t) => Math.max(m, Number(t.sort) || 0), 0) + 1;
  const filtering = !!q.trim();

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    const map = new Map();
    rows
      .filter((x) => !t || [x.name, x.category, x.description, x.used_in].join(' ').toLowerCase().includes(t))
      .forEach((x) => map.set(x.category, [...(map.get(x.category) || []), x]));
    return [...map.entries()];
  }, [rows, q]);

  const mark = (id, on) =>
    setBusy((s) => {
      const n = new Set(s);
      on ? n.add(id) : n.delete(id);
      return n;
    });

  const move = async (tool, dir) => {
    const i = rows.indexOf(tool);
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const order = [...rows];
    [order[i], order[j]] = [order[j], order[i]];
    const changes = order.map((t, k) => ({ t, sort: k + 1 })).filter(({ t, sort }) => t.sort !== sort);
    changes.forEach(({ t }) => mark(t.id, true));
    try {
      await Promise.all(changes.map(({ t, sort }) => store.update('tools', t.id, { sort })));
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo cambiar el orden.'));
    } finally {
      changes.forEach(({ t }) => mark(t.id, false));
    }
  };

  const remove = async (t) => {
    const ok = await confirmDialog({ title: 'Eliminar herramienta', message: `Se quitará «${t.name}» de tu sitio.`, confirmLabel: 'Eliminar', cancelLabel: 'Conservar', danger: true });
    if (!ok) return;
    mark(t.id, true);
    try {
      await store.remove('tools', t.id);
      toast.success('Herramienta eliminada.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo eliminar.'));
    } finally {
      mark(t.id, false);
    }
  };

  const add = (
    <button type="button" className="btn btn-primary" onClick={() => setEditing({ tool: null })}>
      <Plus size={16} aria-hidden /> Nueva herramienta
    </button>
  );

  return (
    <div>
      <PageHeader title="Herramientas" description="Las tecnologías que aparecen en la sección «Stack». Cada una muestra su panelito con qué hace y dónde la usas." actions={add} />
      {loading ? (
        <div className="grid place-items-center py-20"><Spinner /></div>
      ) : error && !rows.length ? (
        <Empty title="No se pudieron cargar las herramientas" hint={errMsg(error, '')} />
      ) : !rows.length ? (
        <Empty title="Aún no hay herramientas" hint="Añade las que manejas para que aparezcan en tu sitio." action={add} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <SearchBox value={q} onChange={setQ} placeholder="Buscar herramienta…" label="Buscar herramientas" icon={<Search size={16} aria-hidden />} />
            <p className="hint ml-auto" aria-live="polite">{plural(rows.length, 'herramienta', 'herramientas')}</p>
          </div>
          {filtering && <p className="hint mb-3">Para reordenar, quita primero la búsqueda.</p>}
          {!groups.length ? (
            <Empty title="Ninguna herramienta coincide" action={<button type="button" className="btn btn-sm" onClick={() => setQ('')}>Limpiar búsqueda</button>} />
          ) : (
            <div className="grid gap-8">
              {groups.map(([cat, list]) => (
                <section key={cat} aria-label={cat}>
                  <h2 className="mb-2 text-[.82rem] font-medium uppercase tracking-[.08em] text-fg-3">{cat}</h2>
                  <ul className="surface overflow-hidden" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {list.map((t) => {
                      const disabled = busy.has(t.id);
                      const idx = rows.indexOf(t);
                      return (
                        <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:px-4" style={{ borderTop: '1px solid var(--line)', opacity: disabled ? 0.6 : 1 }}>
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] border border-line"><ToolIcon name={t.icon} size={22} /></span>
                          <div className="min-w-0 flex-1 basis-[200px]">
                            <p className="font-medium">{t.name}</p>
                            <p className="truncate text-[.82rem] text-fg-3">{t.description || 'Sin descripción'}{t.used_in ? ` · ${t.used_in}` : ''}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-1.5">
                            <IconBtn label={`Subir ${t.name}`} disabled={disabled || filtering || idx === 0} onClick={() => move(t, -1)}><ArrowUp size={15} /></IconBtn>
                            <IconBtn label={`Bajar ${t.name}`} disabled={disabled || filtering || idx === rows.length - 1} onClick={() => move(t, 1)}><ArrowDown size={15} /></IconBtn>
                            <button type="button" className="btn btn-sm" disabled={disabled} onClick={() => setEditing({ tool: t })} aria-label={`Editar ${t.name}`}><Pencil size={14} aria-hidden /> Editar</button>
                            <IconBtn label={`Eliminar ${t.name}`} danger disabled={disabled} onClick={() => remove(t)}><Trash2 size={15} /></IconBtn>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
      {editing && <ToolEditor tool={editing.tool} allTools={rows} nextSort={nextSort} onClose={() => setEditing(null)} />}
    </div>
  );
}
