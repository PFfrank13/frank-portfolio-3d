import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, ImageIcon, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { useTable } from '../../lib/hooks.js';
import { BUCKETS } from '../../lib/config.js';
import { PROJECT_CATEGORIES } from '../../lib/profile.js';
import { resolveUrl } from '../../lib/images.js';
import { plural, timeAgo, formatDateTime } from '../../lib/format.js';
import Img from '../ui/Img.jsx';
import { Badge, confirmDialog, Empty, ImageUploader, ListEditor, Modal, PageHeader, Spinner, Switch, TagInput, toast } from './ui.jsx';
import { Counter, errMsg, FormField, IconBtn, isHttpUrl, Monogram, SearchBox, useBeforeUnload } from './parts/bits.jsx';

const MAX_IMAGES = 12;
const SUMMARY_MAX = 300;

const blank = (sort) => ({
  title: '',
  summary: '',
  description: '',
  category: PROJECT_CATEGORIES[0],
  technologies: [],
  key_features: [],
  live_url: '',
  github_url: '',
  image_urls: [],
  featured: false,
  sort,
});

const fmtDate = (d) => {
  const x = new Date(d);
  return isNaN(x) ? '' : x.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Copia los archivos de una imagen para que el duplicado sea independiente (borrar uno no rompe el otro). */
async function cloneImage(url) {
  try {
    const src = await resolveUrl(url);
    const blob = await (await fetch(src)).blob();
    const ext = (blob.type.split('/')[1] || 'webp').replace('jpeg', 'jpg');
    const { url: next } = await store.upload(BUCKETS.projects, new File([blob], `copia.${ext}`, { type: blob.type }));
    return next;
  } catch {
    return null;
  }
}

export default function Projects() {
  const { rows, loading, error } = useTable('projects');
  const { rows: tools } = useTable('tools');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [editing, setEditing] = useState(null); // { project|null }
  const [busy, setBusy] = useState(() => new Set());

  const filtering = Boolean(q.trim() || cat);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!t || [p.title, p.summary, p.category, ...(p.technologies || [])].join(' ').toLowerCase().includes(t)),
    );
  }, [rows, q, cat]);

  const nextSort = rows.reduce((m, p) => Math.max(m, Number(p.sort) || 0), 0) + 1;
  const mark = (id, on) =>
    setBusy((s) => {
      const n = new Set(s);
      on ? n.add(id) : n.delete(id);
      return n;
    });

  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const order = [...rows];
    [order[idx], order[j]] = [order[j], order[idx]];
    const changes = order.map((p, i) => ({ p, sort: i + 1 })).filter(({ p, sort }) => p.sort !== sort);
    changes.forEach(({ p }) => mark(p.id, true));
    try {
      await Promise.all(changes.map(({ p, sort }) => store.update('projects', p.id, { sort })));
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo cambiar el orden.') + ' Vuelve a intentarlo.');
    } finally {
      changes.forEach(({ p }) => mark(p.id, false));
    }
  };

  const duplicate = async (p) => {
    mark(p.id, true);
    try {
      const imgs = (await Promise.all((p.image_urls || []).map(cloneImage))).filter(Boolean);
      const { id, created_at, updated_at, ...rest } = p; // eslint-disable-line no-unused-vars
      await store.insert('projects', { ...rest, title: `${p.title} (copia)`, image_urls: imgs, featured: false, sort: nextSort });
      toast.success('Proyecto duplicado. Lo encontrarás al final de la lista.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo duplicar el proyecto.'));
    } finally {
      mark(p.id, false);
    }
  };

  const remove = async (p) => {
    const ok = await confirmDialog({
      title: 'Eliminar proyecto',
      message: `Se borrará «${p.title}» y sus ${plural((p.image_urls || []).length, 'imagen', 'imágenes')} del sitio. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar proyecto',
      cancelLabel: 'Conservar',
      danger: true,
    });
    if (!ok) return;
    mark(p.id, true);
    try {
      await store.remove('projects', p.id);
      toast.success('Proyecto eliminado.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo eliminar el proyecto.') + ' Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      mark(p.id, false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Proyectos"
        description="Lo que se muestra en la sección de proyectos del sitio. La primera imagen de cada proyecto es su portada."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing({ project: null })}>
            <Plus size={16} aria-hidden /> Nuevo proyecto
          </button>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-20"><Spinner /></div>
      ) : error && !rows.length ? (
        <Empty title="No se pudieron cargar los proyectos" hint={`${errMsg(error, '')} Recarga la página; si sigue fallando, revisa la conexión con la base de datos.`} />
      ) : !rows.length ? (
        <Empty
          title="Aún no has publicado proyectos"
          hint="Sube tu primer proyecto con capturas, tecnologías y enlaces. Aparecerá en tu sitio al guardarlo."
          action={
            <button type="button" className="btn btn-primary" onClick={() => setEditing({ project: null })}>
              <Plus size={16} aria-hidden /> Crear el primer proyecto
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <SearchBox value={q} onChange={setQ} placeholder="Buscar por título, tecnología…" label="Buscar proyectos" icon={<Search size={16} aria-hidden />} />
            <div className="field" style={{ minWidth: 170 }}>
              <label className="sr-only" htmlFor="pj-cat">Filtrar por categoría</label>
              <select id="pj-cat" className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">Todas las categorías</option>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <p className="hint ml-auto" aria-live="polite">
              {filtering ? `${shown.length} de ${rows.length}` : plural(rows.length, 'proyecto', 'proyectos')}
            </p>
          </div>

          {!shown.length ? (
            <Empty
              title="Ningún proyecto coincide"
              hint="Prueba con otra palabra o quita el filtro de categoría."
              action={<button type="button" className="btn btn-sm" onClick={() => (setQ(''), setCat(''))}>Limpiar filtros</button>}
            />
          ) : (
            <>
              {filtering && <p className="hint mb-3">Para reordenar, quita primero la búsqueda y el filtro.</p>}
              <ul className="surface divide-y overflow-hidden" style={{ listStyle: 'none', margin: 0, padding: 0, '--tw-divide-opacity': 1, borderColor: 'var(--line)' }}>
                {shown.map((p) => {
                  const idx = rows.indexOf(p);
                  const disabled = busy.has(p.id);
                  const n = (p.image_urls || []).length;
                  return (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:p-4" style={{ borderColor: 'var(--line)', opacity: disabled ? 0.6 : 1 }} aria-busy={disabled}>
                      <div className="h-[54px] w-[76px] shrink-0 overflow-hidden rounded-[10px]" style={{ border: '1px solid var(--line)' }}>
                        {n ? <Img src={p.image_urls[0]} alt="" className="h-full w-full object-cover" /> : <Monogram text={p.title} className="h-full w-full text-lg" />}
                      </div>
                      <div className="min-w-0 flex-1 basis-[200px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-display text-[1.02rem] font-medium">{p.title || 'Sin título'}</h3>
                          {p.featured && <Badge tone="gold"><Star size={11} aria-hidden /> Destacado</Badge>}
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.82rem] text-fg-3">
                          <span>{p.category}</span>
                          <span className="inline-flex items-center gap-1"><ImageIcon size={12} aria-hidden /> {n}</span>
                          <span title={formatDateTime(p.updated_at || p.created_at)}>{fmtDate(p.created_at)}</span>
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <IconBtn label={`Subir «${p.title}»`} disabled={disabled || filtering || idx === 0} onClick={() => move(idx, -1)}><ArrowUp size={15} /></IconBtn>
                        <IconBtn label={`Bajar «${p.title}»`} disabled={disabled || filtering || idx === rows.length - 1} onClick={() => move(idx, 1)}><ArrowDown size={15} /></IconBtn>
                        <IconBtn label={`Duplicar «${p.title}»`} disabled={disabled} onClick={() => duplicate(p)}><Copy size={15} /></IconBtn>
                        <button type="button" className="btn btn-sm" disabled={disabled} onClick={() => setEditing({ project: p })} aria-label={`Editar «${p.title}»`}>
                          <Pencil size={14} aria-hidden /> Editar
                        </button>
                        <IconBtn label={`Eliminar «${p.title}»`} danger disabled={disabled} onClick={() => remove(p)}><Trash2 size={15} /></IconBtn>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}

      {editing && <ProjectEditor project={editing.project} nextSort={nextSort} tools={tools} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ───────────── Editor ───────────── */

function ProjectEditor({ project, nextSort, tools, onClose }) {
  const isNew = !project;
  const initial = useMemo(() => (project ? { ...blank(nextSort), ...project } : blank(nextSort)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const seen = useRef(new Set(initial.image_urls || [])); // todas las imágenes que han pasado por el formulario
  const uid = useId();
  const id = (n) => `${uid}-${n}`;

  const dirty = useMemo(() => JSON.stringify(f) !== JSON.stringify(initial), [f, initial]);
  useBeforeUnload(dirty);

  const set = useCallback((patch) => setF((s) => ({ ...s, ...patch })), []);
  const onImages = (urls) => {
    urls.forEach((u) => seen.current.add(u));
    set({ image_urls: urls });
  };

  const discardUnsaved = (keep) => {
    const initialSet = new Set(initial.image_urls || []);
    const keepSet = new Set(keep);
    [...seen.current].filter((u) => !initialSet.has(u) && !keepSet.has(u)).forEach((u) => store.removeFile(u));
  };

  const close = async () => {
    if (saving) return;
    if (dirty) {
      const ok = await confirmDialog({
        title: 'Descartar los cambios',
        message: 'Tienes cambios sin guardar. Si sales ahora se perderán, y las imágenes que subiste en esta edición se borrarán.',
        confirmLabel: 'Descartar cambios',
        cancelLabel: 'Seguir editando',
        danger: true,
      });
      if (!ok) return;
    }
    discardUnsaved(initial.image_urls || []);
    onClose();
  };

  const validate = () => {
    const e = {};
    if (!f.title.trim()) e.title = 'Escribe un título para el proyecto.';
    if (f.summary.length > SUMMARY_MAX) e.summary = `El resumen admite hasta ${SUMMARY_MAX} caracteres; sobran ${f.summary.length - SUMMARY_MAX}.`;
    if (f.live_url.trim() && !isHttpUrl(f.live_url.trim())) e.live_url = 'Usa una dirección completa que empiece por https:// (o http://).';
    if (f.github_url.trim() && !isHttpUrl(f.github_url.trim())) e.github_url = 'Usa una dirección completa que empiece por https:// (o http://).';
    if (f.sort !== '' && !Number.isFinite(Number(f.sort))) e.sort = 'El orden debe ser un número.';
    return e;
  };

  const save = async (ev) => {
    ev?.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector('[data-pj-form] [aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    const data = {
      title: f.title.trim(),
      summary: f.summary.trim(),
      description: f.description.trim(),
      category: f.category,
      technologies: f.technologies,
      key_features: f.key_features.map((s) => s.trim()).filter(Boolean),
      live_url: f.live_url.trim(),
      github_url: f.github_url.trim(),
      image_urls: f.image_urls,
      featured: f.featured,
      sort: f.sort === '' ? nextSort : Number(f.sort),
    };
    try {
      if (isNew) await store.insert('projects', data);
      else await store.update('projects', project.id, data);
    } catch (err) {
      setSaving(false);
      toast.error(`${errMsg(err, 'No se pudo guardar el proyecto.')} Tus cambios siguen en el formulario; inténtalo de nuevo.`);
      return;
    }
    // Guardado correcto: ahora sí se borran archivos que ya no se usan.
    const finalSet = new Set(data.image_urls);
    [...seen.current].filter((u) => !finalSet.has(u)).forEach((u) => store.removeFile(u));
    toast.success(isNew ? 'Proyecto creado.' : 'Cambios guardados.');
    setSaving(false);
    onClose();
  };

  const suggestions = useMemo(() => [...new Set(tools.map((t) => t.name).filter(Boolean))], [tools]);
  const invalid = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': id(k) + '-err' } : {});

  return (
    <Modal
      open
      onClose={close}
      title={isNew ? 'Nuevo proyecto' : 'Editar proyecto'}
      size="xl"
      footer={
        <>
          <span className="hint mr-auto" aria-live="polite">{dirty ? 'Cambios sin guardar' : isNew ? '' : 'Sin cambios'}</span>
          <button type="button" className="btn" onClick={close} disabled={saving}>Cancelar</button>
          <button type="submit" form={id('form')} className="btn btn-primary" disabled={saving || (!isNew && !dirty)}>
            {saving ? 'Guardando…' : isNew ? 'Crear proyecto' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id={id('form')} onSubmit={save} noValidate data-pj-form className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-5">
          <FormField label="Título" required htmlFor={id('title')} error={errors.title}>
            <input id={id('title')} className="input" value={f.title} onChange={(e) => set({ title: e.target.value })} maxLength={140} autoFocus={isNew} {...invalid('title')} />
          </FormField>

          <FormField label="Resumen" htmlFor={id('summary')} error={errors.summary} hint="Una o dos frases: es lo que se ve en la tarjeta." counter={<Counter value={f.summary} max={SUMMARY_MAX} />}>
            <textarea id={id('summary')} className="textarea" style={{ minHeight: 84 }} value={f.summary} onChange={(e) => set({ summary: e.target.value })} {...invalid('summary')} />
          </FormField>

          <FormField label="Descripción" htmlFor={id('desc')} hint="El detalle completo: problema, solución, tu papel y resultados.">
            <textarea id={id('desc')} className="textarea" style={{ minHeight: 190 }} value={f.description} onChange={(e) => set({ description: e.target.value })} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Categoría" htmlFor={id('cat')}>
              <select id={id('cat')} className="select" value={f.category} onChange={(e) => set({ category: e.target.value })}>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Orden" htmlFor={id('sort')} error={errors.sort} hint="Número menor = aparece antes.">
              <input id={id('sort')} type="number" step="1" className="input" value={f.sort} onChange={(e) => set({ sort: e.target.value })} {...invalid('sort')} />
            </FormField>
          </div>

          <FormField label="Tecnologías" hint="Escribe y pulsa Enter. Se sugieren las de tu sección de herramientas.">
            <TagInput value={f.technologies} onChange={(v) => set({ technologies: v })} suggestions={suggestions} placeholder="Python, Arduino…" />
          </FormField>

          <FormField label="Características clave" hint="Una línea por característica.">
            <ListEditor value={f.key_features} onChange={(v) => set({ key_features: v })} placeholder="Qué hace o qué logra" addLabel="Añadir característica" />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="URL en vivo" htmlFor={id('live_url')} error={errors.live_url}>
              <input id={id('live_url')} type="url" inputMode="url" className="input" placeholder="https://" value={f.live_url} onChange={(e) => set({ live_url: e.target.value })} {...invalid('live_url')} />
            </FormField>
            <FormField label="URL de GitHub" htmlFor={id('github_url')} error={errors.github_url}>
              <input id={id('github_url')} type="url" inputMode="url" className="input" placeholder="https://github.com/…" value={f.github_url} onChange={(e) => set({ github_url: e.target.value })} {...invalid('github_url')} />
            </FormField>
          </div>

          <FormField
            label="Imágenes"
            hint={`Hasta ${MAX_IMAGES}. La primera es la portada: arrastra o usa las flechas para reordenar. Se comprimen al subirlas.`}
            counter={<span className="hint tabular-nums">{f.image_urls.length}/{MAX_IMAGES}</span>}
          >
            <ImageUploader value={f.image_urls} onChange={onImages} bucket={BUCKETS.projects} multiple max={MAX_IMAGES} label="Añadir imágenes" />
          </FormField>

          <div className="rounded-[12px] p-4" style={{ border: '1px solid var(--line)' }}>
            <Switch checked={f.featured} onChange={(v) => set({ featured: v })} label="Destacado" />
            <p className="hint mt-1.5">Los proyectos destacados se resaltan en el sitio.</p>
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start" aria-label="Vista previa">
          <p className="label mb-2">Así se verá la tarjeta</p>
          <ProjectCardPreview f={f} />
        </aside>
      </form>
    </Modal>
  );
}

function ProjectCardPreview({ f }) {
  const techs = f.technologies || [];
  return (
    <article className="surface overflow-hidden">
      <div className="aspect-[16/10] w-full overflow-hidden" style={{ background: 'var(--bg-2)' }}>
        {f.image_urls[0] ? <Img src={f.image_urls[0]} alt="" className="h-full w-full object-cover" /> : <Monogram text={f.title} className="h-full w-full text-5xl" />}
      </div>
      <div className="p-4">
        <p className="flex items-center gap-2 text-[0.78rem] text-fg-3">
          <span>{f.category}</span>
          {f.featured && <span style={{ color: 'var(--gold)' }}>Destacado</span>}
        </p>
        <h4 className="mt-1 font-display text-[1.15rem] font-medium leading-tight tracking-tight">{f.title.trim() || <span className="text-fg-3">Título del proyecto</span>}</h4>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-fg-2" style={{ overflowWrap: 'anywhere' }}>
          {f.summary.trim() || <span className="text-fg-3">El resumen aparecerá aquí.</span>}
        </p>
        {techs.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {techs.slice(0, 5).map((t) => (
              <li key={t} className="chip">{t}</li>
            ))}
            {techs.length > 5 && <li className="chip">+{techs.length - 5}</li>}
          </ul>
        )}
      </div>
    </article>
  );
}
