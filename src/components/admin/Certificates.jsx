import { useId, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { useTable } from '../../lib/hooks.js';
import { BUCKETS } from '../../lib/config.js';
import Img from '../ui/Img.jsx';
import { confirmDialog, Empty, ImageUploader, Modal, PageHeader, Spinner, toast } from './ui.jsx';
import { errMsg, FormField, IconBtn, isHttpUrl, useBeforeUnload } from './parts/bits.jsx';

const blank = { title: '', issuer: '', year: '', url: '', image_urls: [] };

export default function Certificates() {
  const { rows, loading, error } = useTable('certificates');
  const [editing, setEditing] = useState(null);

  const remove = async (c) => {
    const ok = await confirmDialog({ title: 'Eliminar certificado', message: `Se borrará «${c.title}».`, confirmLabel: 'Eliminar', cancelLabel: 'Conservar', danger: true });
    if (!ok) return;
    try {
      await store.remove('certificates', c.id);
      (c.image_urls || []).forEach((u) => store.removeFile(u));
      toast.success('Certificado eliminado.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo eliminar.'));
    }
  };

  const add = <button type="button" className="btn btn-primary" onClick={() => setEditing({ cert: null })}><Plus size={16} aria-hidden /> Nuevo certificado</button>;

  return (
    <div>
      <PageHeader title="Certificados" description="Cursos y certificaciones que aparecen en «Formación y certificados»." actions={add} />
      {loading ? (
        <div className="grid place-items-center py-20"><Spinner /></div>
      ) : error && !rows.length ? (
        <Empty title="No se pudieron cargar los certificados" hint={errMsg(error, '')} />
      ) : !rows.length ? (
        <Empty title="Aún no hay certificados" hint="Sube una imagen o captura de cada certificado con su emisor y año." action={add} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {rows.map((c) => (
            <li key={c.id} className="surface overflow-hidden">
              <div className="aspect-[4/3] bg-bg-2">
                {c.image_urls?.[0] ? <Img src={c.image_urls[0]} alt={`Certificado ${c.title}`} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-sm text-fg-3">Sin imagen</span>}
              </div>
              <div className="p-4">
                <p className="font-medium" style={{ overflowWrap: 'anywhere' }}>{c.title}</p>
                <p className="text-[.84rem] text-fg-3">{[c.issuer, c.year].filter(Boolean).join(' · ')}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <button type="button" className="btn btn-sm" onClick={() => setEditing({ cert: c })} aria-label={`Editar ${c.title}`}><Pencil size={14} aria-hidden /> Editar</button>
                  <span className="ml-auto" />
                  <IconBtn label={`Eliminar ${c.title}`} danger onClick={() => remove(c)}><Trash2 size={15} /></IconBtn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <CertEditor cert={editing.cert} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CertEditor({ cert, onClose }) {
  const isNew = !cert;
  const initial = useMemo(() => ({ ...blank, ...cert }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const uid = useId();
  const id = (n) => `${uid}-${n}`;
  const set = (p) => setF((s) => ({ ...s, ...p }));
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  useBeforeUnload(dirty);

  const close = async () => {
    if (saving) return;
    if (dirty) {
      const ok = await confirmDialog({ title: 'Descartar los cambios', message: 'Tienes cambios sin guardar.', confirmLabel: 'Descartar', cancelLabel: 'Seguir editando', danger: true });
      if (!ok) return;
      const keep = new Set(initial.image_urls || []);
      (f.image_urls || []).filter((u) => !keep.has(u)).forEach((u) => store.removeFile(u));
    }
    onClose();
  };

  const save = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!f.title.trim()) e.title = 'Escribe el nombre del certificado.';
    if (f.url.trim() && !isHttpUrl(f.url.trim())) e.url = 'Usa una dirección completa que empiece por https://.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const data = { title: f.title.trim(), issuer: f.issuer.trim(), year: String(f.year).trim(), url: f.url.trim(), image_urls: f.image_urls };
    try {
      if (isNew) await store.insert('certificates', data);
      else await store.update('certificates', cert.id, data);
      toast.success(isNew ? 'Certificado creado.' : 'Cambios guardados.');
      onClose();
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo guardar.'));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={close}
      title={isNew ? 'Nuevo certificado' : 'Editar certificado'}
      footer={
        <>
          <button type="button" className="btn" onClick={close} disabled={saving}>Cancelar</button>
          <button type="submit" form={id('form')} className="btn btn-primary" disabled={saving || (!isNew && !dirty)}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </>
      }
    >
      <form id={id('form')} onSubmit={save} noValidate className="grid gap-5">
        <FormField label="Nombre" required htmlFor={id('t')} error={errors.title}>
          <input id={id('t')} className="input" value={f.title} autoFocus onChange={(e) => set({ title: e.target.value })} {...(errors.title ? { 'aria-invalid': true } : {})} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Emisor" htmlFor={id('i')}><input id={id('i')} className="input" value={f.issuer} onChange={(e) => set({ issuer: e.target.value })} /></FormField>
          <FormField label="Año" htmlFor={id('y')}><input id={id('y')} className="input" inputMode="numeric" maxLength={4} value={f.year} onChange={(e) => set({ year: e.target.value })} /></FormField>
        </div>
        <FormField label="Enlace de verificación" htmlFor={id('u')} error={errors.url} hint="Opcional.">
          <input id={id('u')} className="input" value={f.url} onChange={(e) => set({ url: e.target.value })} {...(errors.url ? { 'aria-invalid': true } : {})} />
        </FormField>
        <ImageUploader label="Imagen del certificado" value={f.image_urls} onChange={(urls) => set({ image_urls: urls })} bucket={BUCKETS.certificates} max={2} />
      </form>
    </Modal>
  );
}
