import { useId, useRef, useState } from 'react';
import { Pencil, Send, Trash2, X } from 'lucide-react';
import { LIMITS } from '../../../lib/config.js';
import { initials, timeAgo, formatDateTime } from '../../../lib/format.js';
import { Counter } from '../parts/bits.jsx';
import { confirmDialog } from '../ui.jsx';

export const AUTHOR = 'Frank Pineda';

/** Ctrl/Cmd + Enter envía; Escape cancela si se pasa onCancel. */
const keys = (submit, onCancel) => (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    submit();
  } else if (e.key === 'Escape' && onCancel) {
    e.stopPropagation();
    onCancel();
  }
};

const validate = (t) => {
  const v = t.trim();
  if (!v) return 'Escribe tu respuesta.';
  if (v.length > LIMITS.commentText) return `Sobran ${v.length - LIMITS.commentText} caracteres: el máximo es ${LIMITS.commentText}.`;
  return '';
};

/** Compositor en línea. `onSubmit` devuelve una promesa; si falla se conserva el texto. */
export function ReplyComposer({ initial = '', label, submitLabel, onSubmit, onCancel, autoFocus = true }) {
  const uid = useId();
  const [text, setText] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const submit = async () => {
    if (busy) return;
    const m = validate(text);
    setErr(m);
    if (m) return ref.current?.focus();
    setBusy(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } catch {
      /* el padre ya avisó con un toast; el texto se conserva */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="field mt-3">
      <div className="flex items-baseline justify-between gap-3">
        <label className="label" htmlFor={uid}>{label}</label>
        <Counter value={text.trim()} max={LIMITS.commentText} />
      </div>
      <textarea
        ref={ref}
        id={uid}
        className="textarea"
        rows={3}
        autoFocus={autoFocus}
        value={text}
        aria-invalid={!!err}
        aria-describedby={err ? `${uid}-e` : undefined}
        onChange={(e) => (setText(e.target.value), err && setErr(''))}
        onKeyDown={keys(submit, onCancel)}
        placeholder="Escribe tu respuesta pública"
      />
      {err && <p id={`${uid}-e`} role="alert" className="text-[.78rem] text-danger">{err}</p>}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary btn-sm ac-act" onClick={submit} disabled={busy}>
          <Send size={14} aria-hidden /> {busy ? 'Enviando…' : submitLabel}
        </button>
        {onCancel && <button type="button" className="btn btn-sm ac-act" onClick={onCancel} disabled={busy}><X size={14} aria-hidden /> Cancelar</button>}
        <span className="hint">Ctrl o Cmd + Enter para enviar</span>
      </div>
    </div>
  );
}

function ReplyRow({ r, pending, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const remove = async () => {
    const ok = await confirmDialog({ title: 'Eliminar respuesta', message: 'Se quitará esta respuesta del sitio.', confirmLabel: 'Eliminar respuesta', cancelLabel: 'Conservar', danger: true });
    if (ok) onDelete(r.id);
  };
  return (
    <div className="ac-reply" aria-busy={pending}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
        <span className="grid h-7 w-7 place-items-center rounded-full border text-[.7rem] font-semibold text-gold" style={{ borderColor: 'rgba(213,176,90,.5)' }} aria-hidden>{initials(r.author || AUTHOR)}</span>
        <strong className="font-display font-medium">{r.author || AUTHOR}</strong>
        <time dateTime={r.created_at} title={formatDateTime(r.created_at)} className="text-fg-3">{timeAgo(r.created_at)}</time>
        {!editing && (
          <span className="ml-auto flex gap-1">
            <button type="button" className="btn btn-sm btn-icon ac-act" aria-label="Editar respuesta" title="Editar respuesta" disabled={pending} onClick={() => setEditing(true)}><Pencil size={14} aria-hidden /></button>
            <button type="button" className="btn btn-sm btn-icon btn-danger ac-act" aria-label="Eliminar respuesta" title="Eliminar respuesta" disabled={pending} onClick={remove}><Trash2 size={14} aria-hidden /></button>
          </span>
        )}
      </div>
      {editing ? (
        <ReplyComposer
          initial={r.message}
          label="Editar respuesta"
          submitLabel="Guardar"
          onCancel={() => setEditing(false)}
          onSubmit={async (m) => {
            await onEdit(r.id, m);
            setEditing(false);
          }}
        />
      ) : (
        <p className="ac-text mt-2">{r.message}</p>
      )}
    </div>
  );
}

export default function Replies({ replies, onEdit, onDelete }) {
  if (!replies?.length) return null;
  const sorted = [...replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return (
    <div role="group" aria-label={`Respuestas (${sorted.length})`}>
      {sorted.map((r) => <ReplyRow key={r.id} r={r} pending={String(r.id).startsWith('tmp-')} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}

