import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { Download, FolderKanban, Heart, Mail, MessageSquare, Pin, Upload } from 'lucide-react';
import { store } from '../../lib/store/index.js';
import { useSettings, useTable } from '../../lib/hooks.js';
import { plural, timeAgo } from '../../lib/format.js';
import { useUnseenCount } from './shell/seen.js';
import { Badge, confirmDialog, PageHeader, toast } from './ui.jsx';
import { errMsg } from './parts/bits.jsx';

function Num({ to }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, Number(to) || 0, { duration: 1.2, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to]);
  return <span className="tabular-nums">{v}</span>;
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
};

/** Actividad de los últimos 14 días (comentarios + mensajes) como línea con área. */
function Spark({ days }) {
  const max = Math.max(1, ...days);
  const W = 560;
  const H = 120;
  const pts = days.map((d, i) => [(i / (days.length - 1)) * W, H - 14 - (d / max) * (H - 36)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[120px] w-full" role="img" aria-label={`Actividad de los últimos 14 días: ${days.reduce((a, b) => a + b, 0)} eventos`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--gold)" stopOpacity=".35" /><stop offset="1" stopColor="var(--gold)" stopOpacity="0" /></linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1="0" x2={W} y1={H * k} y2={H * k} stroke="var(--line)" strokeDasharray="3 6" />)}
      <motion.path d={`${line} L${W} ${H} L0 ${H} Z`} fill="url(#sp)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
      <motion.path d={line} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: 'easeOut' }} />
      {pts.map(([x, y], i) => days[i] > 0 && <circle key={i} cx={x} cy={y} r="3.5" fill="var(--bg)" stroke="var(--gold)" strokeWidth="2" />)}
    </svg>
  );
}

/** Lista de verificación: qué le falta al sitio para estar completo. */
function Health({ items }) {
  const done = items.filter((i) => i.ok).length;
  const pct = done / items.length;
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <section aria-labelledby="hl-h" className="surface grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:p-7">
      <div className="relative mx-auto grid h-[96px] w-[96px] place-items-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="40" cy="40" r={R} fill="none" stroke="var(--line)" strokeWidth="5" />
          <motion.circle cx="40" cy="40" r={R} fill="none" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }} transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
        <span className="font-display text-[1.5rem] font-semibold tabular-nums">{Math.round(pct * 100)}%</span>
      </div>
      <div>
        <h2 id="hl-h" className="font-display text-[1.15rem] font-medium">Salud del sitio</h2>
        <p className="mt-1 text-[.86rem] text-fg-2">{done === items.length ? 'Todo está completo. Tu sitio está listo para recibir visitas.' : `${items.length - done} detalle${items.length - done > 1 ? 's' : ''} para dejarlo perfecto.`}</p>
        <ul className="m-0 mt-4 grid list-none gap-x-6 gap-y-2 p-0 sm:grid-cols-2">
          {items.map((it, k) => (
            <motion.li key={it.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + k * 0.06 }} className="flex items-center gap-2.5 text-[.9rem]">
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[.7rem] ${it.ok ? 'bg-gold text-ink' : 'border border-line text-fg-3'}`} aria-hidden>{it.ok ? '✓' : '·'}</span>
              {it.ok || !it.href ? <span className={it.ok ? 'text-fg-2' : 'text-fg'}>{it.t}</span> : <a href={it.href} className="link">{it.t}</a>}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, hint, href, i = 0 }) {
  return (
    <motion.a href={href} className="surface fx-spot-a block p-5 transition-colors hover:bg-bg-2" style={{ minHeight: 44 }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
      <p className="flex items-center gap-2 text-[.82rem] text-fg-3"><Icon size={15} aria-hidden /> {label}</p>
      <p className="mt-2 font-display text-[2.1rem] font-semibold leading-none tracking-tight"><Num to={value} /></p>
      {hint && <p className="mt-2 text-[.8rem] text-fg-2">{hint}</p>}
    </motion.a>
  );
}

export default function Dashboard() {
  const comments = useTable('comments');
  const messages = useTable('messages');
  const projects = useTable('projects');
  const tools = useTable('tools');
  const certs = useTable('certificates');
  const { settings } = useSettings();
  const health = [
    { t: 'Proyectos publicados', ok: projects.rows.length >= 3, href: '#/admin/proyectos' },
    { t: 'Imagen en cada proyecto', ok: projects.rows.length > 0 && projects.rows.every((p) => (p.image_urls || []).length > 0), href: '#/admin/proyectos' },
    { t: 'Herramientas del stack', ok: tools.rows.length >= 10, href: '#/admin/herramientas' },
    { t: 'Certificados con imagen', ok: certs.rows.length > 0 && certs.rows.every((c) => (c.image_urls || []).length > 0), href: '#/admin/certificados' },
    { t: 'LinkedIn conectado', ok: !!String(settings.linkedin || '').trim(), href: '#/admin/ajustes' },
    { t: 'CV propio subido', ok: !!String(settings.cv_url || '').trim(), href: '#/admin/ajustes' },
  ];
  const newComments = useUnseenCount('comments');
  const file = useRef(null);
  const local = store.mode === 'local';

  const pending = comments.rows.filter((c) => !c.replies?.length).length;
  const unread = messages.rows.filter((m) => !m.read).length;
  const hearts = comments.rows.reduce((n, c) => n + (c.likes || 0), 0);

  const activity = [
    ...comments.rows.map((c) => ({ k: 'c' + c.id, at: c.created_at, text: `${c.name} comentó: «${c.comment.slice(0, 70)}${c.comment.length > 70 ? '…' : ''}»`, href: '#/admin/comentarios', icon: MessageSquare })),
    ...messages.rows.map((m) => ({ k: 'm' + m.id, at: m.created_at, text: `${m.name} te escribió${m.subject ? `: ${m.subject}` : ''}`, href: '#/admin/mensajes', icon: Mail })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);

  const days = useMemo(() => {
    const out = Array(14).fill(0);
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    [...comments.rows, ...messages.rows].forEach((r) => {
      const d = Math.floor((now - new Date(r.created_at)) / 86400000);
      if (d >= 0 && d < 14) out[13 - d] += 1;
    });
    return out;
  }, [comments.rows, messages.rows]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `respaldo-portafolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast.success('Respaldo descargado. Las imágenes subidas no van incluidas.');
  };

  const importData = async (f) => {
    if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      const ok = await confirmDialog({ title: 'Importar respaldo', message: 'Esto reemplaza los proyectos, herramientas, comentarios y mensajes actuales por los del archivo.', confirmLabel: 'Importar', cancelLabel: 'Cancelar', danger: true });
      if (ok) {
        await store.importAll(json);
        toast.success('Respaldo importado.');
      }
    } catch (e) {
      toast.error(errMsg(e, 'El archivo no es un respaldo válido.'));
    } finally {
      if (file.current) file.current.value = '';
    }
  };

  const reset = async () => {
    const ok = await confirmDialog({ title: 'Restablecer datos de ejemplo', message: 'Se borrarán TODOS los comentarios, mensajes, certificados e imágenes y volverán los proyectos y herramientas originales. No se puede deshacer.', confirmLabel: 'Borrar y restablecer', cancelLabel: 'Cancelar', danger: true });
    if (!ok) return;
    try {
      await store.resetDemo();
      toast.success('Datos restablecidos.');
    } catch (e) {
      toast.error(errMsg(e, 'No se pudo restablecer.'));
    }
  };

  return (
    <div className="grid gap-10">
      <PageHeader
        title={`${greeting()}, Frank`}
        description="Esto es lo último que pasa en tu sitio, en vivo."
        actions={<a href="#/admin/proyectos" className="btn btn-primary btn-sm"><FolderKanban size={15} aria-hidden /> Subir proyecto</a>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        <Stat i={0} icon={MessageSquare} label="Comentarios" value={comments.rows.length} hint={newComments ? `${newComments} nuevos desde tu última visita` : `${pending} sin responder`} href="#/admin/comentarios" />
        <Stat i={1} icon={Mail} label="Mensajes" value={messages.rows.length} hint={`${unread} sin leer`} href="#/admin/mensajes" />
        <Stat i={2} icon={Heart} label="Me gusta" value={hearts} hint={`${comments.rows.filter((c) => c.is_pinned).length} fijados`} href="#/admin/comentarios" />
        <Stat i={3} icon={FolderKanban} label="Proyectos" value={projects.rows.length} hint={`${plural(tools.rows.length, 'herramienta', 'herramientas')} · ${plural(certs.rows.length, 'certificado', 'certificados')}`} href="#/admin/proyectos" />
      </div>

      <Health items={health} />

      <section aria-labelledby="sp-h" className="surface p-5 sm:p-7">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="sp-h" className="font-display text-[1.15rem] font-medium">Actividad · 14 días</h2>
          <p className="text-[.8rem] text-fg-3">{days.reduce((a, b) => a + b, 0)} eventos</p>
        </div>
        <Spark days={days} />
        <div className="mt-1 flex justify-between text-[.72rem] text-fg-3" aria-hidden><span>hace 14 días</span><span>hoy</span></div>
      </section>

      <section aria-label="Atajos" className="grid gap-3 sm:grid-cols-3">
        {[['Subir proyecto', '#/admin/proyectos', FolderKanban], ['Responder comentarios', '#/admin/comentarios', MessageSquare], ['Revisar mensajes', '#/admin/mensajes', Mail]].map(([t, h, Ic]) => (
          <a key={t} href={h} className="btn justify-between" style={{ minHeight: 52 }}><span className="flex items-center gap-2.5"><Ic size={16} aria-hidden /> {t}</span><span aria-hidden>→</span></a>
        ))}
      </section>

      <section aria-labelledby="act-h">
        <h2 id="act-h" className="mb-3 font-display text-[1.15rem] font-medium">Actividad reciente</h2>
        {activity.length ? (
          <ul className="surface overflow-hidden" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {activity.map(({ k, at, text, href, icon: Icon }, n) => (
              <motion.li key={k} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + n * 0.06 }} style={{ borderTop: '1px solid var(--line)' }} className="first:border-t-0">
                <a href={href} className="flex min-h-[52px] items-center gap-3 px-4 py-3 hover:bg-bg-1">
                  <Icon size={16} className="shrink-0 text-gold" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-[.92rem]">{text}</span>
                  <span className="shrink-0 text-[.78rem] text-fg-3">{timeAgo(at)}</span>
                </a>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="surface p-6 text-[.92rem] text-fg-2">Todavía no hay actividad. Cuando alguien comente o te escriba, lo verás aquí al instante.</p>
        )}
      </section>

      {local && (
        <section className="surface grid gap-4 p-5 sm:p-7" aria-labelledby="loc-h">
          <div className="flex items-center gap-3">
            <h2 id="loc-h" className="font-display text-[1.15rem] font-medium">Modo demostración</h2>
            <Badge tone="gold">Local</Badge>
          </div>
          <p className="text-[.92rem] leading-relaxed text-fg-2">
            Ahora mismo los datos viven solo en este navegador: los comentarios de otras personas no te llegarán. Para que tus visitantes comenten y tú los veas y respondas en tiempo real,
            conecta Supabase (gratis): crea un proyecto, ejecuta <code className="font-mono">supabase/schema.sql</code> en el SQL Editor, copia la URL y la clave anónima en un archivo <code className="font-mono">.env</code>
            (ver <code className="font-mono">.env.example</code>), crea tu usuario en Authentication y vuelve a compilar.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm" onClick={exportData}><Download size={14} aria-hidden /> Descargar respaldo</button>
            <input ref={file} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={(e) => importData(e.target.files?.[0])} />
            <button type="button" className="btn btn-sm" onClick={() => file.current?.click()}><Upload size={14} aria-hidden /> Importar respaldo</button>
            <button type="button" className="btn btn-sm" onClick={reset} style={{ color: 'var(--danger)' }}><Pin size={14} aria-hidden className="hidden" /> Restablecer datos de ejemplo</button>
          </div>
        </section>
      )}
    </div>
  );
}
