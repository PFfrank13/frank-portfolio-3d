import { useEffect, useId, useRef, useState } from 'react';
import { ExternalLink, FileText, RotateCcw, Upload } from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { useSettings } from '../../lib/hooks.js';
import { BUCKETS } from '../../lib/config.js';
import { SETTINGS_DEFAULTS } from '../../lib/profile.js';
import { formatDateTime } from '../../lib/format.js';
import { resolveUrl } from '../../lib/images.js';
import { PageHeader, Spinner, Switch, toast } from './ui.jsx';
import { errMsg, FormField, isHttpUrl, useBeforeUnload } from './parts/bits.jsx';

const CV_MAX = 8 * 1024 * 1024;
const FIELDS = ['available', 'email', 'phone', 'whatsapp', 'github', 'linkedin', 'location'];
const pick = (s) => Object.fromEntries(FIELDS.map((k) => [k, s[k] ?? SETTINGS_DEFAULTS[k]]));

export default function Settings() {
  const { settings, loading } = useSettings();
  const [f, setF] = useState(null);
  const base = useRef(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const uid = useId();
  const id = (n) => `${uid}-${n}`;

  useEffect(() => {
    if (loading) return;
    const next = pick(settings);
    // Si el formulario está sin tocar, sigue los cambios que lleguen en vivo.
    setF((cur) => (cur && JSON.stringify(cur) !== JSON.stringify(base.current) ? cur : next));
    base.current = next;
  }, [settings, loading]);

  const dirty = f && JSON.stringify(f) !== JSON.stringify(base.current);
  useBeforeUnload(!!dirty);

  if (loading || !f) return <div className="grid place-items-center py-20"><Spinner /></div>;
  const set = (p) => setF((s) => ({ ...s, ...p }));
  const invalid = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': id(k) + '-err' } : {});

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Escribe un correo válido.';
    const digits = f.whatsapp.replace(/\D/g, '');
    if (f.whatsapp.trim() && (digits.length < 8 || digits.length > 15)) e.whatsapp = 'Solo dígitos con código de país, por ejemplo 51928471762.';
    if (f.github.trim() && !isHttpUrl(f.github.trim())) e.github = 'Usa la dirección completa, por ejemplo https://github.com/tu-usuario.';
    if (f.linkedin.trim() && !isHttpUrl(f.linkedin.trim())) e.linkedin = 'Usa la dirección completa que empiece por https://.';
    return e;
  };

  const save = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector('[data-set-form] [aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    try {
      await store.saveSettings({
        available: !!f.available,
        email: f.email.trim(),
        phone: f.phone.trim(),
        whatsapp: f.whatsapp.replace(/\D/g, ''),
        github: f.github.trim(),
        linkedin: f.linkedin.trim(),
        location: f.location.trim(),
      });
      toast.success('Ajustes guardados. El sitio ya los muestra.');
    } catch (err) {
      toast.error(errMsg(err, 'No se pudieron guardar los ajustes.') + ' Tus cambios siguen aquí.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-10">
      <PageHeader title="Ajustes" description="Datos de contacto, disponibilidad y CV. Lo que cambies aquí se actualiza en el sitio al guardar." />

      <form onSubmit={save} noValidate data-set-form className="surface grid gap-6 p-5 sm:p-7">
        <h2 className="font-display text-[1.15rem] font-medium">Contacto y perfil</h2>
        <Switch checked={f.available} onChange={(v) => set({ available: v })} label="Disponible para contratación" hint="Muestra u oculta la insignia en la portada." />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Correo" required htmlFor={id('email')} error={errors.email}>
            <input id={id('email')} type="email" className="input" value={f.email} onChange={(e) => set({ email: e.target.value })} {...invalid('email')} />
          </FormField>
          <FormField label="Teléfono" htmlFor={id('phone')} hint="Como quieres que se vea, con espacios.">
            <input id={id('phone')} type="tel" className="input" value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
          </FormField>
          <FormField label="WhatsApp (solo dígitos)" htmlFor={id('wa')} error={errors.whatsapp} hint="Con código de país: 51928471762.">
            <input id={id('wa')} inputMode="numeric" className="input" value={f.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} {...invalid('whatsapp')} />
          </FormField>
          <FormField label="Ubicación" htmlFor={id('loc')}>
            <input id={id('loc')} className="input" value={f.location} onChange={(e) => set({ location: e.target.value })} />
          </FormField>
          <FormField label="GitHub" htmlFor={id('gh')} error={errors.github} hint="El botón de GitHub del sitio abre esta dirección.">
            <div className="flex gap-2">
              <input id={id('gh')} className="input" value={f.github} onChange={(e) => set({ github: e.target.value })} {...invalid('github')} />
              {isHttpUrl(f.github.trim()) && (
                <a className="btn btn-sm shrink-0" href={f.github.trim()} target="_blank" rel="noopener noreferrer" aria-label="Probar enlace de GitHub en una pestaña nueva">
                  <ExternalLink size={14} aria-hidden /> Probar
                </a>
              )}
            </div>
          </FormField>
          <FormField label="LinkedIn" htmlFor={id('li')} error={errors.linkedin} hint="Opcional. Si lo dejas vacío, no se muestra.">
            <input id={id('li')} className="input" value={f.linkedin} onChange={(e) => set({ linkedin: e.target.value })} {...invalid('linkedin')} />
          </FormField>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving || !dirty}>{saving ? 'Guardando…' : 'Guardar ajustes'}</button>
          {dirty && <button type="button" className="btn" onClick={() => (setF(base.current), setErrors({}))}>Descartar</button>}
          <span className="hint" aria-live="polite">{dirty ? 'Cambios sin guardar' : ''}</span>
        </div>
      </form>

      <CvCard settings={settings} />
      {store.auth.kind === 'password' && <PasswordCard />}
    </div>
  );
}

function CvCard({ settings }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const custom = (settings.cv_url || '').trim();

  const upload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return toast.error('El CV debe ser un archivo PDF.');
    if (file.size > CV_MAX) return toast.error('El PDF supera 8 MB. Comprímelo e inténtalo de nuevo.');
    setBusy(true);
    try {
      const { url } = await store.upload(BUCKETS.files, file);
      const old = settings.cv_url;
      await store.saveSettings({ cv_url: url, cv_name: file.name, cv_updated_at: new Date().toISOString() });
      if (old && old !== url) store.removeFile(old);
      toast.success('CV actualizado. Los botones «Descargar CV» ya entregan el nuevo archivo.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo subir el CV.'));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const old = settings.cv_url;
      await store.saveSettings({ cv_url: '', cv_name: SETTINGS_DEFAULTS.cv_name, cv_updated_at: '' });
      if (old) store.removeFile(old);
      toast.success('Se restauró el CV incluido en el sitio.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo restaurar el CV.'));
    } finally {
      setBusy(false);
    }
  };

  const preview = async () => {
    const src = custom ? await resolveUrl(custom) : null;
    if (!src) return;
    window.open(src, '_blank', 'noopener');
  };

  return (
    <section className="surface grid gap-5 p-5 sm:p-7" aria-labelledby="cv-h">
      <div>
        <h2 id="cv-h" className="font-display text-[1.15rem] font-medium">Currículum (PDF)</h2>
        <p className="mt-1 text-[.92rem] text-fg-2">Reemplázalo cuando actualices tu experiencia: los botones del sitio entregan siempre el último.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line p-4">
        <FileText size={22} className="text-gold" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{custom ? settings.cv_name : 'CV incluido en el sitio'}</p>
          <p className="hint">{custom && settings.cv_updated_at ? `Subido el ${formatDateTime(settings.cv_updated_at)}` : 'Versión original, hecha con tus datos.'}</p>
        </div>
        {custom && <button type="button" className="btn btn-sm" onClick={preview}><ExternalLink size={14} aria-hidden /> Ver</button>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1} onChange={(e) => upload(e.target.files?.[0])} />
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => input.current?.click()}>
          <Upload size={16} aria-hidden /> {busy ? 'Procesando…' : custom ? 'Reemplazar CV' : 'Subir mi CV'}
        </button>
        {custom && <button type="button" className="btn" disabled={busy} onClick={restore}><RotateCcw size={15} aria-hidden /> Volver al CV original</button>}
        <span className="hint">PDF de hasta 8 MB.</span>
      </div>
    </section>
  );
}

function PasswordCard() {
  const uid = useId();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (next.length < 6) return setErr('La nueva contraseña debe tener al menos 6 caracteres.');
    if (next !== again) return setErr('Las contraseñas nuevas no coinciden.');
    setBusy(true);
    try {
      await store.auth.signIn('', cur); // verifica la actual
      await store.auth.setup(next);
      setCur(''); setNext(''); setAgain('');
      toast.success('Contraseña cambiada.');
    } catch (ex) {
      setErr(errMsg(ex, 'No se pudo cambiar la contraseña.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="surface grid gap-5 p-5 sm:p-7">
      <div>
        <h2 className="font-display text-[1.15rem] font-medium">Contraseña del panel</h2>
        <p className="mt-1 text-[.92rem] text-fg-2">Modo demostración: la contraseña se guarda solo en este navegador.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Actual" htmlFor={uid + 'a'}><input id={uid + 'a'} type="password" autoComplete="current-password" className="input" value={cur} onChange={(e) => setCur(e.target.value)} /></FormField>
        <FormField label="Nueva" htmlFor={uid + 'b'}><input id={uid + 'b'} type="password" autoComplete="new-password" className="input" value={next} onChange={(e) => setNext(e.target.value)} /></FormField>
        <FormField label="Repite la nueva" htmlFor={uid + 'c'}><input id={uid + 'c'} type="password" autoComplete="new-password" className="input" value={again} onChange={(e) => setAgain(e.target.value)} /></FormField>
      </div>
      {err && <p role="alert" className="text-sm text-danger">{err}</p>}
      <div><button type="submit" className="btn" disabled={busy || !cur || !next}>{busy ? 'Cambiando…' : 'Cambiar contraseña'}</button></div>
    </form>
  );
}
