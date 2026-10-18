import { Heart, Pin } from 'lucide-react';
import Img from '../../ui/Img.jsx';
import { formatDateTime, initials, timeAgo } from '../../../lib/format.js';
import { cx } from './utils.js';

export const Time = ({ at }) => (
  <time dateTime={at} title={formatDateTime(at)} className="text-fg-3">{timeAgo(at)}</time>
);

export function Replies({ replies, freshReply }) {
  if (!replies?.length) return null;
  const sorted = [...replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return (
    <div role="group" aria-label={`Respuestas de Frank (${sorted.length})`}>
      {sorted.map((r, i) => (
        <div key={r.id || i} className={cx('cm-reply', freshReply && i === sorted.length - 1 && 'cm-fresh')}>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
            <span className="cm-avatar cm-avatar-frank" style={{ width: 28, height: 28, fontSize: '.7rem' }} aria-hidden>{initials(r.author || 'Frank')}</span>
            <strong className="font-display font-medium">{r.author || 'Frank Pineda'}</strong>
            <span className="rounded-full border px-2 py-px text-[.7rem] text-gold" style={{ borderColor: 'rgba(213,176,90,.45)' }}>Autor</span>
            <Time at={r.created_at} />
          </div>
          <p className="cm-text mt-2">{r.message}</p>
        </div>
      ))}
    </div>
  );
}

export default function CommentItem({ c, fresh, liked, likes, onLike, onOpenImage }) {
  return (
    <li className={cx('cm-card', fresh && `cm-fresh-${fresh}`)} id={`c-${c.id}`}>
      <span className="cm-avatar" aria-hidden>{initials(c.name)}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <strong className="font-display text-[1rem] font-medium [overflow-wrap:anywhere]">{c.name}</strong>
          <Time at={c.created_at} />
          {c.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-px text-[.72rem] text-gold" style={{ borderColor: 'rgba(213,176,90,.45)' }}>
              <Pin size={11} aria-hidden /> Fijado
            </span>
          )}
        </div>
        <p className="cm-text mt-1.5">{c.comment}</p>
        {c.image_url && (
          <button type="button" className="cm-thumb" onClick={() => onOpenImage(c)} aria-label={`Ampliar imagen de ${c.name}`}>
            <Img src={c.image_url} alt={`Imagen adjunta por ${c.name}`} />
          </button>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4">
          <button type="button" className="cm-like" aria-pressed={liked} disabled={liked} onClick={() => onLike(c)} aria-label={liked ? `Te gustó este comentario. ${likes} me gusta` : `Me gusta. ${likes} actualmente`}>
            <Heart size={17} aria-hidden />
            <span aria-hidden>{likes}</span>
          </button>
          {c.liked_by_admin && (
            <span className="inline-flex items-center gap-1.5 text-[.82rem] text-gold">
              <Heart size={13} fill="currentColor" aria-hidden /> A Frank le gustó
            </span>
          )}
        </div>
        <Replies replies={c.replies} freshReply={fresh === 'reply'} />
      </div>
    </li>
  );
}
