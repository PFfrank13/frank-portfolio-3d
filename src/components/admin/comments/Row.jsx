import { useState } from 'react';
import { Heart, ImageIcon, MessageSquareReply, Pin, PinOff, ThumbsUp, Trash2 } from 'lucide-react';
import Img from '../../ui/Img.jsx';
import { formatDateTime, initials, timeAgo } from '../../../lib/format.js';
import { Badge } from '../ui.jsx';
import Replies, { ReplyComposer } from './Replies.jsx';

export default function Row({ c, busy, isNew, fresh, onPin, onHeart, onReply, onEditReply, onDeleteReply, onRemove, onOpenImage }) {
  const [composing, setComposing] = useState(false);
  const n = c.replies?.length || 0;
  return (
    <li className="ac-item" id={`ac-${c.id}`} data-pinned={!!c.is_pinned} data-fresh={fresh || undefined} aria-busy={busy}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-bg-2 font-display text-[.9rem] font-semibold text-fg-2" aria-hidden>{initials(c.name)}</span>
        <strong className="font-display text-[1.02rem] font-medium [overflow-wrap:anywhere]">{c.name}</strong>
        <time dateTime={c.created_at} title={formatDateTime(c.created_at)} className="text-sm text-fg-3">{timeAgo(c.created_at)}</time>
        {isNew && <Badge tone="gold">Nuevo</Badge>}
        {c.is_pinned && <Badge tone="gold"><Pin size={11} className="mr-1" aria-hidden /> Fijado</Badge>}
        {c.image_url && <Badge><ImageIcon size={11} className="mr-1" aria-hidden /> Imagen</Badge>}
        {!n && <Badge>Sin responder</Badge>}
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-fg-3" title="Me gusta de los visitantes">
          <ThumbsUp size={14} aria-hidden /> <span className="tabular-nums">{c.likes || 0}</span><span className="sr-only"> me gusta de visitantes</span>
        </span>
      </div>

      <p className="ac-text mt-3">{c.comment}</p>
      {c.image_url && (
        <button type="button" className="ac-thumb" onClick={() => onOpenImage(c)} aria-label={`Ampliar imagen de ${c.name}`}>
          <Img src={c.image_url} alt={`Imagen adjunta por ${c.name}`} />
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-sm ac-act" aria-pressed={!!c.is_pinned} disabled={busy} onClick={() => onPin(c)}>
          {c.is_pinned ? <PinOff size={15} aria-hidden /> : <Pin size={15} aria-hidden />} {c.is_pinned ? 'Desfijar' : 'Fijar'}
        </button>
        <button type="button" className="btn btn-sm ac-act" aria-pressed={!!c.liked_by_admin} disabled={busy} onClick={() => onHeart(c)}>
          <Heart size={15} aria-hidden /> {c.liked_by_admin ? 'Quitar corazón' : 'Corazón'}
        </button>
        <button type="button" className="btn btn-sm ac-act" aria-expanded={composing} disabled={busy} onClick={() => setComposing((v) => !v)}>
          <MessageSquareReply size={15} aria-hidden /> Responder{n ? ` (${n})` : ''}
        </button>
        <button type="button" className="btn btn-sm btn-danger ac-act ml-auto" disabled={busy} onClick={() => onRemove(c)} aria-label={`Eliminar comentario de ${c.name}`}>
          <Trash2 size={15} aria-hidden /> Eliminar
        </button>
      </div>

      <Replies replies={c.replies} onEdit={(rid, m) => onEditReply(c, rid, m)} onDelete={(rid) => onDeleteReply(c, rid)} />
      {composing && (
        <ReplyComposer
          label={`Responder a ${c.name}`}
          submitLabel="Publicar respuesta"
          onCancel={() => setComposing(false)}
          onSubmit={async (m) => {
            await onReply(c, m);
          }}
        />
      )}
    </li>
  );
}
