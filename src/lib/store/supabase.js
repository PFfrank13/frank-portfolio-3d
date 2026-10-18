// Adaptador SUPABASE: Postgres + Realtime + Auth + Storage. Misma interfaz que el adaptador local.
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL, LIMITS, SUPABASE_KEY, SUPABASE_URL } from '../config.js';
import { SETTINGS_DEFAULTS } from '../profile.js';
import { compressImage } from '../images.js';
import { fileExt, ORDER, sanitizeComment, sanitizeMessage, uid } from './common.js';
import { withCoversByTitle, withCertImagesByTitle, stripBundled } from './covers.js';

export function createSupabaseStore() {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'fp-auth' },
    realtime: { params: { eventsPerSecond: 10 } },
  });

  const fail = (error) => {
    if (error) throw new Error(error.message || 'Error de base de datos');
  };
  const isAdmin = (session) => session?.user?.email?.toLowerCase() === ADMIN_EMAIL;
  let channelCount = 0;

  const auth = {
    kind: 'email',
    async getSession() {
      const { data } = await client.auth.getSession();
      return isAdmin(data.session) ? data.session : null;
    },
    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email: String(email).trim(), password });
      fail(error);
      if (!isAdmin(data.session)) {
        await client.auth.signOut();
        throw new Error('Esta cuenta no tiene permisos de administrador.');
      }
    },
    async signOut() {
      await client.auth.signOut();
    },
    onChange(cb) {
      const { data } = client.auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },
  };

  return {
    mode: 'supabase',
    auth,
    client,

    async list(table) {
      const { data, error } = await client.from(table).select('*');
      fail(error);
      const rows = (data || []).sort(ORDER[table]);
      // Los proyectos y certificados de ejemplo traen su portada incluida en el código (hasta que subas una propia).
      if (table === 'projects') return withCoversByTitle(rows);
      if (table === 'certificates') return withCertImagesByTitle(rows);
      return rows;
    },

    async insert(table, row) {
      const { data, error } = await client.from(table).insert(stripBundled(row)).select().single();
      fail(error);
      return data;
    },

    async update(table, id, patch) {
      const { data, error } = await client.from(table).update(stripBundled(patch)).eq('id', id).select().single();
      fail(error);
      return data;
    },

    async remove(table, id) {
      const { data: row } = await client.from(table).select('*').eq('id', id).maybeSingle();
      const { error } = await client.from(table).delete().eq('id', id);
      fail(error);
      [row?.image_url, ...(row?.image_urls || [])].filter(Boolean).forEach((u) => this.removeFile(u));
    },

    subscribe(table, cb) {
      const ch = client
        .channel(`fp-${table}-${++channelCount}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => cb())
        .subscribe();
      return () => {
        client.removeChannel(ch);
      };
    },

    // — Ajustes (una sola fila id=1) —
    async getSettings() {
      const { data, error } = await client.from('settings').select('data').eq('id', 1).maybeSingle();
      fail(error);
      return { ...SETTINGS_DEFAULTS, ...(data?.data || {}) };
    },
    async saveSettings(patch) {
      const next = { ...(await this.getSettings()), ...patch };
      const { error } = await client.from('settings').upsert({ id: 1, data: next });
      fail(error);
      return next;
    },

    // — Visitantes —
    async createComment(input) {
      const row = sanitizeComment(input);
      const { data, error } = await client.from('comments').insert(row).select().single();
      fail(error);
      return data;
    },
    async createMessage(input) {
      // Sin .select(): el visitante puede insertar pero nunca leer mensajes.
      const { error } = await client.from('messages').insert(sanitizeMessage(input));
      fail(error);
    },
    async likeComment(id) {
      const { data, error } = await client.rpc('like_comment', { p_id: id });
      fail(error);
      return data;
    },

    // — Archivos —
    async upload(bucket, file) {
      const isImg = file.type.startsWith('image/');
      const max = isImg ? LIMITS.imageMaxBytes : 8 * 1024 * 1024;
      const body = isImg ? await compressImage(file) : file;
      if (body.size > max) throw new Error(`El archivo supera ${Math.round(max / 1048576)} MB.`);
      const path = `${uid()}.${fileExt(body.name)}`;
      const { error } = await client.storage
        .from(bucket)
        .upload(path, body, { contentType: body.type || 'application/octet-stream', cacheControl: '31536000', upsert: false });
      fail(error);
      return { url: client.storage.from(bucket).getPublicUrl(path).data.publicUrl, path };
    },
    async removeFile(url) {
      const m = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/.exec(url || '');
      if (!m) return;
      try {
        await client.storage.from(m[1]).remove([decodeURIComponent(m[2])]);
      } catch {
        /* noop */
      }
    },
  };
}
