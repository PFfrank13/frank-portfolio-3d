import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { store } from '../../../lib/store/index.js';
import { BUCKETS, LIMITS } from '../../../lib/config.js';
import { lsGet, lsSet } from '../parts/sbKit.jsx';
import { canDecode, checkImageFile, COOLDOWN_MS, cx, IMAGE_ACCEPT, LAST_KEY, mb, NAME_KEY, validateName, validateText } from './utils.js';

const readLast = () => Number(lsGet(LAST_KEY, '0')) || 0;

export default function CommentForm() {
  const uid = useId();
  const [name, setName] = useState(() => lsGet(NAME_KEY, '') || '');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ kind: 'idle', msg: '' });
  const [until, setUntil] = useState(() => readLast() + COOLDOWN_MS);
  const [now, setNow] = useState(Date.now());
  const [over, setOver] = useState(false);
  const [hp, setHp] = useState('');
  const refs = { name: useRef(null), text: useRef(null), image: useRef(null) };
  const fileRef = useRef(null);
  const sending = status.kind === 'sending';
  const remaining = Math.max(0, Math.ceil((until - now) / 1000));

  useEffect(() => {
    if (until <= Date.now()) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= until) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [until]);

  useEffect(() => {
    if (!file) return setPreview('');
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = async (f) => {
    if (!f) return;
    const msg = checkImageFile(f);
    if (msg) return setErrors((e) => ({ ...e, image: msg }));
    const url = URL.createObjectURL(f);
    const ok = await canDecode(url);
    URL.revokeObjectURL(url);
    if (!ok) return setErrors((e) => ({ ...e, image: 'No pudimos leer esa imagen: parece dañada. Prueba con otra.' }));
    setErrors((e) => ({ ...e, image: '' }));
    setFile(f);
  };
  const clearFile = () => {
    setFile(null);
    setErrors((e) => ({ ...e, image: '' }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (sending) return;
    if (hp) return setStatus({ kind: 'ok', msg: 'Gracias, tu comentario fue publicado.' }); // trampa para bots
    const errs = { name: validateName(name), text: validateText(text), image: errors.image || '' };
    setErrors(errs);
    const bad = ['name', 'text', 'image'].find((k) => errs[k]);
    if (bad) {
      setStatus({ kind: 'error', msg: 'Revisa los campos marcados.' });
      refs[bad].current?.focus();
      return;
    }
    if (remaining > 0) return setStatus({ kind: 'error', msg: `Espera ${remaining} s antes de enviar otro comentario.` });

    setStatus({ kind: 'sending', msg: 'Publicando tu comentario…' });
    let up = null;
    try {
      if (file) up = await store.upload(BUCKETS.comments, file);
      await store.createComment({ name: name.trim(), comment: text.trim(), image_url: up?.url || null });
    } catch (err) {
      if (up) store.removeFile(up.url).catch(() => {});
      setStatus({ kind: 'error', msg: `${err?.message || 'No se pudo publicar.'} Tu texto sigue aquí; vuelve a intentarlo.` });
      return;
    }
    const t = Date.now();
    lsSet(NAME_KEY, name.trim());
    lsSet(LAST_KEY, String(t));
    setUntil(t + COOLDOWN_MS);
    setNow(t);
    setText('');
    clearFile();
    setErrors({});
    setStatus({ kind: 'ok', msg: 'Gracias, tu comentario ya está publicado.' });
  };

  const over600 = text.trim().length > LIMITS.commentText;
  const disabled = sending || remaining > 0;

  return (
    <form onSubmit={submit} noValidate className="grid gap-5" aria-label="Escribir un comentario">
      <div className="field">
        <label className="label" htmlFor={`${uid}-n`}>Nombre</label>
        <input
          ref={refs.name}
          id={`${uid}-n`}
          className="input"
          value={name}
          maxLength={LIMITS.commentName + 20}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${uid}-ne` : undefined}
          onChange={(e) => (setName(e.target.value), errors.name && setErrors((x) => ({ ...x, name: '' })))}
          onBlur={() => name.trim() && lsSet(NAME_KEY, name.trim())}
          placeholder="Cómo quieres que te llamemos"
        />
        {errors.name && <p id={`${uid}-ne`} className="cm-err">{errors.name}</p>}
      </div>

      <div className="field">
        <div className="flex items-baseline justify-between gap-3">
          <label className="label" htmlFor={`${uid}-t`}>Comentario</label>
          <span className="hint tabular-nums" style={over600 ? { color: 'var(--danger)' } : undefined}>{text.trim().length}/{LIMITS.commentText}</span>
        </div>
        <textarea
          ref={refs.text}
          id={`${uid}-t`}
          className="textarea"
          rows={5}
          value={text}
          aria-invalid={!!errors.text}
          aria-describedby={errors.text ? `${uid}-te` : undefined}
          onChange={(e) => (setText(e.target.value), errors.text && setErrors((x) => ({ ...x, text: '' })))}
          placeholder="Qué te pareció el portafolio, una pregunta, una idea…"
        />
        {errors.text && <p id={`${uid}-te`} className="cm-err">{errors.text}</p>}
      </div>

      <div className="field">
        <span className="label" id={`${uid}-il`}>Imagen <span className="text-fg-3">(opcional)</span></span>
        <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pick(e.target.files?.[0])} />
        {file && preview ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-bg-1 p-2.5">
            <img src={preview} alt="Vista previa de la imagen que adjuntas" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate text-fg">{file.name}</p>
              <p className="text-fg-3">{mb(file.size)} MB</p>
            </div>
            <button type="button" className="btn btn-sm btn-icon" style={{ minWidth: 44, minHeight: 44 }} onClick={clearFile} aria-label="Quitar imagen">
              <X size={16} aria-hidden />
            </button>
          </div>
        ) : (
          <button
            ref={refs.image}
            type="button"
            className="cm-drop"
            data-over={over}
            aria-labelledby={`${uid}-il`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => (e.preventDefault(), setOver(true))}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => (e.preventDefault(), setOver(false), pick(e.dataTransfer.files?.[0]))}
          >
            <ImagePlus size={20} aria-hidden />
            <span className="text-sm">Elegir o arrastrar una imagen<span className="block text-fg-3">JPG, PNG, WebP o GIF</span></span>
          </button>
        )}
        {errors.image && <p className="cm-err" role="alert">{errors.image}</p>}
      </div>

      <div className="cm-hp" aria-hidden>
        <label>No rellenar<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="submit" className="btn btn-primary" style={{ minHeight: 44 }} disabled={disabled} aria-disabled={disabled}>
          {sending ? <Loader2 size={16} className="cm-spin" aria-hidden /> : <Send size={16} aria-hidden />}
          {sending ? 'Publicando…' : remaining > 0 ? `Espera ${remaining} s` : 'Publicar comentario'}
        </button>
        <p
          role={status.kind === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={cx('text-sm', status.kind === 'error' ? 'text-danger' : status.kind === 'ok' ? 'text-ok' : 'text-fg-3')}
        >
          {status.msg}
        </p>
      </div>
    </form>
  );
}
