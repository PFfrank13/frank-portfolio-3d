import { useEffect, useMemo, useState } from 'react';
import { Copy, Mail, MailOpen, Trash2 } from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { useTable } from '../../lib/hooks.js';
import { formatDateTime, plural, timeAgo } from '../../lib/format.js';
import { useFresh } from '../site/comments/utils.js';
import { confirmDialog, Empty, PageHeader, Spinner, toast } from './ui.jsx';
import { errMsg, IconBtn, SearchBox } from './parts/bits.jsx';

const FILTERS = [
  ['all', 'Todos'],
  ['unread', 'Sin leer'],
];
const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Messages() {
  const { rows, loading, error } = useTable('messages');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(() => new Set());

  useFresh(rows, !loading && !error, {
    kinds: ['new'],
    onNew: (added) => toast.info(added.length === 1 ? `Nuevo mensaje de ${added[0].name}` : `${added.length} mensajes nuevos`),
  });

  const unread = rows.filter((m) => !m.read).length;
  const shown = useMemo(() => {
    const t = norm(q.trim());
    return rows.filter((m) => (filter === 'all' || !m.read) && (!t || norm(`${m.name} ${m.email} ${m.subject} ${m.message}`).includes(t)));
  }, [rows, filter, q]);

  useEffect(() => {
    if (open && !rows.some((m) => m.id === open)) setOpen(null);
  }, [rows, open]);

  const mark = (id, on) =>
    setBusy((s) => {
      const n = new Set(s);
      on ? n.add(id) : n.delete(id);
      return n;
    });

  const setRead = async (m, read) => {
    mark(m.id, true);
    try {
      await store.update('messages', m.id, { read });
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo actualizar el mensaje.'));
    } finally {
      mark(m.id, false);
    }
  };

  const toggle = (m) => {
    const next = open === m.id ? null : m.id;
    setOpen(next);
    if (next && !m.read) setRead(m, true);
  };

  const remove = async (m) => {
    const ok = await confirmDialog({
      title: 'Eliminar mensaje',
      message: `Se borrará el mensaje de ${m.name}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Conservar',
      danger: true,
    });
    if (!ok) return;
    mark(m.id, true);
    try {
      await store.remove('messages', m.id);
      toast.success('Mensaje eliminado.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo eliminar el mensaje.'));
    } finally {
      mark(m.id, false);
    }
  };

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copiado.`);
    } catch {
      toast.error('No se pudo copiar. Selecciona el texto y cópialo a mano.');
    }
  };

  return (
    <div>
      <PageHeader
        title="Mensajes"
        description="Lo que te escriben desde el formulario de contacto. Responde con un clic desde tu correo."
      />
      {loading ? (
        <div className="grid place-items-center py-20"><Spinner /></div>
      ) : error && !rows.length ? (
        <Empty title="No se pudieron cargar los mensajes" hint={`${errMsg(error, '')} Recarga la página.`} />
      ) : !rows.length ? (
        <Empty title="Aún no hay mensajes" hint="Cuando alguien use el formulario de contacto, aparecerá aquí al instante." />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Filtrar mensajes" className="flex gap-1.5">
              {FILTERS.map(([id, label]) => (
                <button key={id} type="button" className={`btn btn-sm ${filter === id ? 'btn-primary' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>
                  {label}
                  {id === 'unread' && unread > 0 ? ` (${unread})` : ''}
                </button>
              ))}
            </div>
            <SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre, correo, texto…" label="Buscar mensajes" />
            <p className="hint ml-auto" aria-live="polite">{plural(shown.length, 'mensaje', 'mensajes')}</p>
          </div>

          {!shown.length ? (
            <Empty title="Ningún mensaje coincide" hint="Prueba con otra palabra o muestra todos." action={<button type="button" className="btn btn-sm" onClick={() => (setQ(''), setFilter('all'))}>Limpiar filtros</button>} />
          ) : (
            <ul className="surface overflow-hidden" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {shown.map((m) => {
                const isOpen = open === m.id;
                const disabled = busy.has(m.id);
                const subject = m.subject?.trim() || 'Sin asunto';
                const mailto = `mailto:${m.email}?subject=${encodeURIComponent('Re: ' + subject)}&body=${encodeURIComponent(`\n\n— Frank Pineda\n\n> ${m.message.split('\n').join('\n> ')}`)}`;
                return (
                  <li key={m.id} style={{ borderTop: '1px solid var(--line)', opacity: disabled ? 0.6 : 1 }} className="first:border-t-0">
                    <button
                      type="button"
                      onClick={() => toggle(m)}
                      aria-expanded={isOpen}
                      className="flex w-full min-h-[64px] items-center gap-4 px-4 py-3 text-left hover:bg-bg-1"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line" style={{ color: m.read ? 'var(--fg-3)' : 'var(--gold)' }} aria-hidden>
                        {m.read ? <MailOpen size={16} /> : <Mail size={16} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className={`truncate ${m.read ? 'text-fg-2' : 'font-semibold'}`}>{m.name}</span>
                          {!m.read && <span className="sr-only">(sin leer)</span>}
                          <span className="ml-auto shrink-0 text-[.78rem] text-fg-3" title={formatDateTime(m.created_at)}>{timeAgo(m.created_at)}</span>
                        </span>
                        <span className="block truncate text-[.88rem] text-fg-2">{subject} — {m.message}</span>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 pl-[68px]">
                        <p className="text-[.82rem] text-fg-3">
                          <a href={`mailto:${m.email}`} className="underline underline-offset-2">{m.email}</a> · {formatDateTime(m.created_at)}
                        </p>
                        <p className="mt-1 font-display text-[1.05rem] font-medium">{subject}</p>
                        <p className="mt-3 whitespace-pre-wrap text-[.95rem] leading-relaxed" style={{ overflowWrap: 'anywhere' }}>{m.message}</p>
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <a className="btn btn-sm btn-primary" href={mailto}><Mail size={14} aria-hidden /> Responder por correo</a>
                          <button type="button" className="btn btn-sm" onClick={() => copy(m.email, 'Correo')}><Copy size={14} aria-hidden /> Copiar correo</button>
                          <button type="button" className="btn btn-sm" disabled={disabled} onClick={() => setRead(m, !m.read)}>{m.read ? 'Marcar como sin leer' : 'Marcar como leído'}</button>
                          <span className="ml-auto" />
                          <IconBtn label={`Eliminar mensaje de ${m.name}`} danger disabled={disabled} onClick={() => remove(m)}><Trash2 size={15} /></IconBtn>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
