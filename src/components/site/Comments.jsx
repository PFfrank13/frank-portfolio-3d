import { useMemo, useState } from 'react';
import { RotateCw } from 'lucide-react';
import SectionHead from './SectionHead.jsx';
import { Lightbox, SbStyles } from './parts/sbKit.jsx';
import CmStyles from './comments/styles.jsx';
import CommentForm from './comments/Form.jsx';
import CommentItem from './comments/Item.jsx';
import { useFresh, useTick } from './comments/utils.js';
import { store } from '../../lib/store/index.js';
import { useLikedSet, useTable } from '../../lib/hooks.js';
import { plural } from '../../lib/format.js';

const PAGE = 8;

function Skeleton() {
  return (
    <div role="status" aria-label="Cargando comentarios" className="grid gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-[40px_1fr] gap-3.5">
          <span className="cm-skel h-10 w-10 !rounded-full" />
          <div className="grid gap-2"><span className="cm-skel h-4 w-1/3" /><span className="cm-skel h-4 w-full" /><span className="cm-skel h-4 w-2/3" /></div>
        </div>
      ))}
    </div>
  );
}

export default function Comments() {
  const { rows, loading, error, reload } = useTable('comments');
  const [liked, addLiked] = useLikedSet();
  const [opt, setOpt] = useState({});
  const [shown, setShown] = useState(PAGE);
  const [box, setBox] = useState(null);
  const [live, setLive] = useState('');
  const [likeErr, setLikeErr] = useState('');
  useTick(30000);
  const fresh = useFresh(rows, !loading && !error, {
    onNew: (added) => setLive(added.length === 1 ? `Nuevo comentario de ${added[0].name}.` : `${added.length} comentarios nuevos.`),
  });

  const list = useMemo(
    () => [...rows].sort((a, b) => Number(!!b.is_pinned) - Number(!!a.is_pinned) || new Date(b.created_at) - new Date(a.created_at)),
    [rows],
  );

  const like = async (c) => {
    if (liked.has(c.id) || opt[c.id]) return;
    setOpt((o) => ({ ...o, [c.id]: (c.likes || 0) + 1 }));
    setLikeErr('');
    try {
      await store.likeComment(c.id);
      addLiked(c.id);
    } catch (e) {
      setOpt((o) => {
        const n = { ...o };
        delete n[c.id];
        return n;
      });
      setLikeErr(`No se pudo registrar tu me gusta. ${e?.message || ''} Inténtalo de nuevo.`);
    }
  };

  const visible = list.slice(0, shown);
  const local = store.mode === 'local';

  return (
    <section id="comentarios" className="cm-sec py-[clamp(4.5rem,10vw,8rem)]" aria-labelledby="comentarios-h">
      <CmStyles /><SbStyles />
      <div className="container">
        <div className="cm-grid">
          <div className="cm-aside">
            <SectionHead kicker="Comentarios" id="comentarios-h">Tu opinión cuenta</SectionHead>
            <p className="mt-6 max-w-[46ch] leading-[1.65] text-fg-2">
              Deja un comentario, con una imagen si quieres. Frank los lee y responde desde su panel; lo verás aparecer aquí al instante.
            </p>
            <div className="mt-8"><CommentForm /></div>
            <p className="mt-6 max-w-[46ch] text-[.82rem] leading-relaxed text-fg-3">
              {local
                ? 'Modo demostración: los comentarios se guardan solo en este navegador y no los ve nadie más.'
                : 'Los comentarios son públicos y se actualizan en vivo para todos los visitantes.'}
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
              <h3 className="font-display text-xl font-medium">Conversación</h3>
              <span className="text-sm text-fg-3">{!loading && !error ? plural(list.length, 'comentario', 'comentarios') : ''}</span>
            </div>
            <p className="sr-only" role="status" aria-live="polite">{live}</p>
            {likeErr && <p role="alert" className="cm-err mt-3">{likeErr}</p>}

            {loading ? (
              <div className="pt-6"><Skeleton /></div>
            ) : error && !rows.length ? (
              <div role="alert" className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center">
                <p className="font-display text-lg">No pudimos cargar los comentarios</p>
                <p className="mx-auto mt-1.5 max-w-[44ch] text-sm text-fg-2">Revisa tu conexión y vuelve a intentarlo.</p>
                <button type="button" className="btn btn-sm mt-5" style={{ minHeight: 44 }} onClick={reload}><RotateCw size={15} aria-hidden /> Reintentar</button>
              </div>
            ) : !list.length ? (
              <div className="mt-6 rounded-2xl border border-dashed border-line p-8 sm:p-10">
                <p className="font-display text-lg">Sé la primera persona en comentar</p>
                <p className="mt-1.5 max-w-[44ch] text-sm text-fg-2">Aún no hay comentarios. El tuyo abrirá la conversación; Frank responde desde su panel y lo verás aparecer aquí al instante.</p>
                <div className="mt-6 border-t border-line" aria-hidden>
                  {[[190, 150], [240, 110]].map(([a, b], k) => (
                    <div key={k} className="cm-ghost">
                      <i style={{ width: 38, height: 38, borderRadius: '50%' }} />
                      <div className="grid gap-2"><i style={{ width: 90, height: 11 }} /><i style={{ width: a, height: 11 }} /><i style={{ width: b, height: 11 }} /></div>
                    </div>
                  ))}
                </div>
                <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0 text-[.82rem] text-fg-2">
                  {['¿Qué proyecto te llamó la atención?', 'Una duda sobre el stack', 'Una idea para colaborar'].map((t) => <li key={t} className="chip">{t}</li>)}
                </ul>
              </div>
            ) : (
              <>
                <ul className="m-0 list-none p-0">
                  {visible.map((c) => (
                    <CommentItem
                      key={c.id}
                      c={c}
                      fresh={fresh[c.id]}
                      liked={liked.has(c.id) || !!opt[c.id]}
                      likes={Math.max(c.likes || 0, opt[c.id] || 0)}
                      onLike={like}
                      onOpenImage={(x) => setBox({ src: x.image_url, alt: `Imagen de ${x.name}`, caption: x.comment.slice(0, 140) })}
                    />
                  ))}
                </ul>
                {list.length > shown && (
                  <div className="mt-6 text-center">
                    <button type="button" className="btn" style={{ minHeight: 44 }} onClick={() => setShown((n) => n + PAGE)}>
                      Ver más ({list.length - shown})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {box && <Lightbox items={[box]} index={0} onIndex={() => {}} onClose={() => setBox(null)} />}
    </section>
  );
}
