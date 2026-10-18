// Configuración de entorno. Se rellena en `.env` (ver .env.example).
// Sin variables → modo local (datos en este navegador). Con variables → Supabase.
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

/** Único correo con permisos de administración (también se exige en las políticas SQL). */
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'pinedaferrof@gmail.com').trim().toLowerCase();

export const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const BUCKETS = {
  projects: 'project-images',
  comments: 'comment-images',
  certificates: 'certificates',
  files: 'site-files',
};

export const LIMITS = {
  commentName: 60,
  commentText: 600,
  messageName: 80,
  messageBody: 2000,
  imageMaxBytes: 4 * 1024 * 1024,
};
