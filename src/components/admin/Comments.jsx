import { useEffect, useMemo, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { useTable } from '../../lib/hooks.js';
import { plural } from '../../lib/format.js';
import { Lightbox } from '../site/parts/sbKit.jsx';
import { useFresh } from '../site/comments/utils.js';
import { confirmDialog, Empty, PageHeader, Spinner, toast } from './ui.jsx';
import { errMsg, SearchBox } from './parts/bits.jsx';
import AcStyles from './comments/styles.jsx';
import Row from './comments/Row.jsx';
import { AUTHOR } from './comments/Replies.jsx';
import { getSeen, markSeen } from './shell/seen.js';

const FILTERS = [
  ['all', 'Todos'],
  ['open', 'Sin responder'],
  ['pinned', 'Fijados'],
  ['image', 'Con imagen'],
];
const newId = () => `r-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Comments() {
  const { rows, loading, error, reload } = useTable('comments');
  const [since] = useState(() => getSeen('comments'));
  const [patches, setPatches] = useState({});
  const [busy, setBusy] = useState(() => new Set());
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [box, setBox] = useState(null);

  // Lo que llega por tiempo real manda: al cambiar las filas se descartan los parches optimistas.
  useEffect(() => setPatches({}), [rows]);
  useEffect(() => {
    const done = () => markSeen('comments');
    window.addEventListener('beforeunload', done);
    return () => {
      window.removeEventListener('beforeunload', done);
      done();
    };
  }, []);

  const fresh = useFresh(rows, !loading && !error, {
    kinds: ['new'],
    onNew: (added) => toast.info(added.length === 1 ? `Nuevo comentario de ${added[0].name}` : `${added.length} comentarios nuevos`),
  });

  const list = useMemo(
    () =>
      rows
        .map((c) => (patches[c.id] ? { ...c, ...patches[c.id] } : c))
        .sort((a, b) => Number(!!b.is_pinned) - Number(!!a.is_pinned) || new Date(b.created_at) - new Date(a.created_at)),
    [rows, patches],
  );

  const counts = useMemo(
    () => ({
      all: list.length,
      open: list.filter((c) => !c.replies?.length).length,
      pinned: list.filter((c) => c.is_pinned).length,
      image: list.filter((c) => c.image_url).length,
    }),
    [list],
  );

  const shown = useMemo(() => {
    const t = norm(q.trim());
    return list.filter((c) => {
      if (filter === 'open' && c.replies?.length) return false;
      if (filter === 'pinned' && !c.is_pinned) return false;
      if (filter === 'image' && !c.image_url) return false;
      if (!t) return true;
      return norm(`${c.name} ${c.comment} ${(c.replies || []).map((r) => r.message).join(' ')}`).includes(t);
    });
  }, [list, filter, q]);

  const withBusy = async (id, fn) => {
    setBusy((s) => new Set(s).add(id));
    try {
      return await fn();
    } finally {
      setBusy((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  // Cambio optimista con reversión; relanza el error para que el compositor conserve el texto.
  const apply = (c, patch, ok) =>
    withBusy(c.id, async () => {
      setPatches((p) => ({ ...p, [c.id]: { ...(p[c.id] || {}), ...patch } }));
      try {
        await store.update('comments', c.id, patch);
        if (ok) toast.success(ok);
      } catch (e) {
        setPatches((p) => {
          const n = { ...p };
          delete n[c.id];
          return n;
        });
        toast.error(errMsg(e, 'No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo.'));
        throw e;
      }
    });
  const quiet = (p) => p.catch(() => {});

  const onPin = (c) => quiet(apply(c, { is_pinned: !c.is_pinned }, c.is_pinned ? 'Comentario desfijado' : 'Comentario fijado arriba del sitio'));
  const onHeart = (c) => quiet(apply(c, { liked_by_admin: !c.liked_by_admin }));
  const onReply = (c, message) =>
    apply(c, { replies: [...(c.replies || []), { id: newId(), author: AUTHOR, message, created_at: new Date().toISOString() }] }, 'Respuesta publicada');
  const onEditReply = (c, rid, message) =>
    apply(c, { replies: (c.replies || []).map((r) => (r.id === rid ? { ...r, message } : r)) }, 'Respuesta actualizada');
  const onDeleteReply = (c, rid) => quiet(apply(c, { replies: (c.replies || []).filter((r) => r.id !== rid) }, 'Respuesta eliminada'));
  const onRemove = async (c) => {
    const ok = await confirmDialog({
      title: 'Eliminar comentario',
      message: `Se borrará el comentario de ${c.name}${c.replies?.length ? `, con sus ${plural(c.replies.length, 'respuesta', 'respuestas')}` : ''}${c.image_url ? ' y su imagen' : ''}. No se puede deshacer.`,
      confirmLabel: 'Eliminar comentario',
      cancelLabel: 'Conservar',
      danger: true,
    });
    if (!ok) return;
    await withBusy(c.id, async () => {
      try {
        await store.remove('comments', c.id);
        toast.success('Comentario eliminado');
      } catch (e) {
        toast.error(errMsg(e, 'No se pudo eliminar el comentario. Inténtalo de nuevo.'));
      }
    });
  };

  const local = store.mode === 'local';
  return (
    <div>
      <AcStyles />
      <PageHeader
        title="Comentarios"
        description="Lo que escriben los visitantes llega aquí en vivo. Fija los mejores, dales corazón y responde: la respuesta aparece al instante en el sitio."
        actions={<span className="inline-flex items-center gap-2 text-sm text-fg-2"><i className="dot dot-ok" aria-hidden /> En vivo · {plural(counts.all, 'comentario', 'comentarios')}</span>}
      />

      {local && (
        <p className="mb-6 rounded-xl border border-line bg-bg-1 px-4 py-3 text-sm leading-relaxed text-fg-2">
          Modo demostración: solo ves los comentarios hechos en este navegador. Para recibir los de tus visitantes conecta Supabase (ver Resumen).
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar comentarios">
        {FILTERS.map(([id, label]) => (
          <button key={id} type="button" className="ac-filter" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label} <b>{counts[id]}</b>
          </button>
        ))}
        <div className="ml-auto w-full sm:w-[280px]">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre o texto" label="Buscar comentarios" />
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{!loading && !error ? plural(shown.length, 'comentario', 'comentarios') : ''}</p>

      {loading ? (
        <div className="grid place-items-center py-20"><Spinner label="Cargando comentarios" /></div>
      ) : error && !rows.length ? (
        <Empty
          title="No se pudieron cargar los comentarios"
          hint="Revisa tu conexión y vuelve a intentarlo."
          action={<button type="button" className="btn btn-sm" onClick={reload}><RotateCw size={15} aria-hidden /> Reintentar</button>}
        />
      ) : !list.length ? (
        <Empty title="Aún no hay comentarios" hint="Cuando alguien comente en el sitio, lo verás aquí en el mismo momento." />
      ) : !shown.length ? (
        <Empty
          title="Ningún comentario coincide"
          hint="Prueba con otra búsqueda o cambia el filtro."
          action={<button type="button" className="btn btn-sm" onClick={() => (setFilter('all'), setQ(''))}>Quitar filtros</button>}
        />
      ) : (
        <ul className="m-0 list-none border-y border-line p-0">
          {shown.map((c) => (
            <Row
              key={c.id}
              c={c}
              busy={busy.has(c.id)}
              isNew={new Date(c.created_at).getTime() > since}
              fresh={fresh[c.id]}
              onPin={onPin}
              onHeart={onHeart}
              onReply={onReply}
              onEditReply={onEditReply}
              onDeleteReply={onDeleteReply}
              onRemove={onRemove}
              onOpenImage={(x) => setBox({ src: x.image_url, alt: `Imagen de ${x.name}`, caption: x.comment.slice(0, 140) })}
            />
          ))}
        </ul>
      )}
      {box && <Lightbox items={[box]} index={0} onIndex={() => {}} onClose={() => setBox(null)} />}
    </div>
  );
}
