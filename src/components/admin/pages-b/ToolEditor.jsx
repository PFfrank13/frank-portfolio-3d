import { useId, useMemo, useState } from 'react';
import { store } from '../../../lib/store/index.js';
import { TOOL_CATEGORIES } from '../../../lib/profile.js';
import { confirmDialog, Modal, toast } from '../ui.jsx';
import { Counter, errMsg, FormField, useBeforeUnload } from '../parts/bits.jsx';
import IconPicker from './IconPicker.jsx';
import ToolPanel from './ToolPanel.jsx';

export const DESC_MAX = 200;
export const USED_MAX = 120;

export default function ToolEditor({ tool, base, allTools, nextSort, onClose }) {
  const isNew = !tool?.id;
  const initial = useMemo(
    () => ({ name: '', category: TOOL_CATEGORIES[0], icon: 'cube', description: '', used_in: '', sort: nextSort, ...base, ...tool }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const uid = useId();
  const id = (n) => `${uid}-${n}`;
  const set = (patch) => setF((s) => ({ ...s, ...patch }));
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  useBeforeUnload(dirty);

  const close = async () => {
    if (saving) return;
    if (dirty) {
      const ok = await confirmDialog({
        title: 'Descartar los cambios',
        message: 'Tienes cambios sin guardar. Si sales ahora se perderán.',
        confirmLabel: 'Descartar cambios',
        cancelLabel: 'Seguir editando',
        danger: true,
      });
      if (!ok) return;
    }
    onClose();
  };

  const validate = () => {
    const e = {};
    const name = f.name.trim();
    if (!name) e.name = 'Escribe el nombre de la herramienta.';
    else if (allTools.some((t) => t.id !== tool?.id && t.name.trim().toLowerCase() === name.toLowerCase())) e.name = `Ya existe una herramienta llamada «${name}». Usa otro nombre o edita la existente.`;
    if (f.description.length > DESC_MAX) e.description = `Admite hasta ${DESC_MAX} caracteres; sobran ${f.description.length - DESC_MAX}.`;
    if (f.used_in.length > USED_MAX) e.used_in = `Admite hasta ${USED_MAX} caracteres; sobran ${f.used_in.length - USED_MAX}.`;
    return e;
  };

  const save = async (ev) => {
    ev?.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector('[data-tool-form] [aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    const data = { name: f.name.trim(), category: f.category, icon: f.icon || 'cube', description: f.description.trim(), used_in: f.used_in.trim(), sort: Number(f.sort) || nextSort };
    try {
      if (isNew) await store.insert('tools', data);
      else await store.update('tools', tool.id, data);
    } catch (err) {
      setSaving(false);
      toast.error(`${errMsg(err, 'No se pudo guardar la herramienta.')} Tus cambios siguen en el formulario; inténtalo de nuevo.`);
      return;
    }
    toast.success(isNew ? 'Herramienta creada.' : 'Cambios guardados.');
    setSaving(false);
    onClose();
  };

  const invalid = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': id(k) + '-err' } : {});

  return (
    <Modal
      open
      onClose={close}
      title={isNew ? 'Nueva herramienta' : 'Editar herramienta'}
      size="xl"
      footer={
        <>
          <span className="hint mr-auto" aria-live="polite">{dirty ? 'Cambios sin guardar' : isNew ? '' : 'Sin cambios'}</span>
          <button type="button" className="btn" onClick={close} disabled={saving}>Cancelar</button>
          <button type="submit" form={id('form')} className="btn btn-primary" disabled={saving || (!isNew && !dirty)}>
            {saving ? 'Guardando…' : isNew ? 'Crear herramienta' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id={id('form')} onSubmit={save} noValidate data-tool-form className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Nombre" required htmlFor={id('name')} error={errors.name}>
              <input id={id('name')} className="input" value={f.name} maxLength={60} autoFocus={isNew} onChange={(e) => set({ name: e.target.value })} {...invalid('name')} />
            </FormField>
            <FormField label="Categoría" htmlFor={id('cat')}>
              <select id={id('cat')} className="select" value={f.category} onChange={(e) => set({ category: e.target.value })}>
                {[...new Set([...TOOL_CATEGORIES, f.category])].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Descripción" htmlFor={id('desc')} error={errors.description} hint="Para qué la usas. Es lo que lee el visitante." counter={<Counter value={f.description} max={DESC_MAX} />}>
            <textarea id={id('desc')} className="textarea" style={{ minHeight: 84 }} value={f.description} onChange={(e) => set({ description: e.target.value })} {...invalid('description')} />
          </FormField>
          <FormField label="Dónde la uso" htmlFor={id('used')} error={errors.used_in} hint="Proyecto o contexto, por ejemplo «ELLA» o «Todos»." counter={<Counter value={f.used_in} max={USED_MAX} />}>
            <input id={id('used')} className="input" value={f.used_in} onChange={(e) => set({ used_in: e.target.value })} {...invalid('used_in')} />
          </FormField>
          <div className="field">
            <span className="label">Ícono</span>
            <IconPicker value={f.icon} onChange={(icon) => set({ icon })} />
          </div>
        </div>
        <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start" aria-label="Vista previa">
          <p className="label mb-2">Así se verá el panelito</p>
          <ToolPanel tool={f} />
        </aside>
      </form>
    </Modal>
  );
}
