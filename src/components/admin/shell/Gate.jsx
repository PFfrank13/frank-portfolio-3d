import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { store } from '../../../lib/store/index.js';
import { ADMIN_EMAIL } from '../../../lib/config.js';
import { confirmDialog } from '../ui.jsx';
import { errMsg } from '../parts/bits.jsx';

function PasswordField({ label, value, onChange, autoComplete, error, hint }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          className="input pr-12"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={show}
          className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-fg-3 hover:text-fg"
        >
          {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
      {error ? <p id={`${id}-e`} role="alert" className="text-[.8rem] text-danger">{error}</p> : hint ? <p id={`${id}-h`} className="hint">{hint}</p> : null}
    </div>
  );
}

/** Pantalla de acceso: crea la contraseña la primera vez (modo local) o inicia sesión (local o Supabase). */
export default function Gate() {
  const local = store.mode === 'local';
  const first = local && !store.auth.hasPassword();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [err, setErr] = useState('');
  const [errConfirm, setErrConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const emailId = useId();

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr('');
    setErrConfirm('');
    if (first) {
      if (pass.length < 8) return setErr('Usa al menos 8 caracteres.');
      if (pass !== pass2) return setErrConfirm('Las contraseñas no coinciden.');
    } else if (!pass) {
      return setErr('Escribe tu contraseña.');
    }
    setBusy(true);
    try {
      if (first) await store.auth.setup(pass);
      else await store.auth.signIn(email, pass);
    } catch (x) {
      const m = errMsg(x, 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      setErr(/invalid login/i.test(m) ? 'Correo o contraseña incorrectos.' : /fetch|network/i.test(m) ? 'No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.' : m);
      setPass('');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    const ok = await confirmDialog({
      title: 'Restablecer la contraseña',
      message: 'Se borrará la contraseña actual de este navegador y podrás crear una nueva. Tus proyectos, comentarios y demás datos no se tocan.',
      confirmLabel: 'Restablecer contraseña',
      cancelLabel: 'Cancelar',
      danger: true,
    });
    if (ok) await store.auth.resetPassword();
  };

  return (
    <main className="adm-gate relative grid min-h-[100dvh] place-items-center overflow-hidden px-4 py-10">
      <div className="fx-aurora" aria-hidden><i /><i /></div>
      <div className="adm-grid" aria-hidden />
      <motion.div className="relative w-full max-w-[420px]" initial={{ opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <p className="mb-8 flex items-center gap-2.5 font-display text-[1.05rem] font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-line text-[.8rem]" aria-hidden>FP</span>
          Panel de Frank Pineda
        </p>
        <motion.form onSubmit={submit} className="surface grid gap-5 p-6 sm:p-8" noValidate animate={err ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }} transition={{ duration: 0.45 }} key={err ? 'e' + err : 'ok'}>
          <div>
            <h1 className="font-display text-[1.6rem] font-semibold leading-tight tracking-[-0.02em]">{first ? 'Crea tu contraseña' : 'Iniciar sesión'}</h1>
            <p className="mt-2 text-[.92rem] leading-relaxed text-fg-2">
              {first
                ? 'Es la primera vez que entras. Elige una contraseña para proteger este panel en este navegador.'
                : local
                  ? 'Escribe tu contraseña para administrar el sitio.'
                  : 'Entra con la cuenta de administrador del sitio.'}
            </p>
          </div>
          {!local && (
            <div className="field">
              <label className="label" htmlFor={emailId}>Correo</label>
              <input id={emailId} className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
          )}
          <PasswordField label="Contraseña" value={pass} onChange={setPass} autoComplete={first ? 'new-password' : 'current-password'} error={err} hint={first ? 'Mínimo 8 caracteres.' : undefined} />
          {first && <PasswordField label="Repite la contraseña" value={pass2} onChange={setPass2} autoComplete="new-password" error={errConfirm} />}
          <button type="submit" className="btn btn-primary" style={{ minHeight: 48 }} disabled={busy}>
            <Lock size={16} aria-hidden /> {busy ? 'Un momento…' : first ? 'Crear contraseña y entrar' : 'Entrar'}
          </button>
          {local && !first && (
            <button type="button" className="link self-start text-[.88rem]" style={{ minHeight: 44 }} onClick={forgot}>Olvidé mi contraseña</button>
          )}
        </motion.form>
        <p className="mt-5 text-[.82rem] leading-relaxed text-fg-3">
          {local
            ? 'Modo demostración: los datos y esta contraseña viven solo en este navegador. Sirve para probar el panel; para publicar, conecta Supabase.'
            : 'Conectado a Supabase. Solo la cuenta de administrador puede entrar.'}
        </p>
        <a href="#/" className="link mt-4 inline-flex text-[.88rem]" style={{ minHeight: 44, alignItems: 'center' }}>Volver al sitio</a>
      </motion.div>
    </main>
  );
}
