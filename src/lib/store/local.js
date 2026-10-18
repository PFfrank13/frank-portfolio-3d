// Adaptador LOCAL: localStorage + IndexedDB. Tiempo real entre pestañas con BroadcastChannel
// y el evento "storage". Sirve para probar y para el modo demostración; no es una base compartida.
import { ADMIN_EMAIL, LIMITS } from '../config.js';
import { SETTINGS_DEFAULTS } from '../profile.js';
import { compressImage, forgetUrl } from '../images.js';
import { fileExt, nowIso, ORDER, sanitizeComment, sanitizeMessage, TABLES, uid } from './common.js';
import { idbClear, idbDelete, idbPut } from './idb.js';
import { withCertImages, withCovers } from './covers.js';
import { SEED_CERTIFICATES, SEED_PROJECTS, SEED_SETTINGS, SEED_TOOLS, SEED_VERSION } from './seed.js';

const P = 'fp.v1.';
const SESSION_MS = 8 * 60 * 60 * 1000;

// Almacenamiento con respaldo en memoria si localStorage está bloqueado.
const mem = new Map();
const ls = {
  get(k) {
    try {
      return localStorage.getItem(P + k);
    } catch {
      return mem.get(k) ?? null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(P + k, v);
    } catch {
      mem.set(k, v);
    }
  },
  del(k) {
    try {
      localStorage.removeItem(P + k);
    } catch {
      mem.delete(k);
    }
  },
};

const readJson = (k, fallback) => {
  try {
    const raw = ls.get(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function createLocalStore() {
  const listeners = new Map(); // tabla → Set<cb>
  let channel = null;
  try {
    channel = new BroadcastChannel('fp-store');
  } catch {
    /* sin BroadcastChannel: queda el evento storage */
  }

  const notify = (table) => listeners.get(table)?.forEach((cb) => cb());
  const emit = (table) => {
    notify(table);
    try {
      channel?.postMessage({ table });
    } catch {
      /* noop */
    }
    // Despierta a otras pestañas aunque BroadcastChannel no funcione (p. ej. file://).
    ls.set('tick', JSON.stringify({ table, t: Date.now(), r: Math.random() }));
  };
  if (channel) channel.onmessage = (e) => e.data?.table && notify(e.data.table);
  try {
    window.addEventListener('storage', (e) => {
      if (e.key === P + 'tick' && e.newValue) {
        try {
          notify(JSON.parse(e.newValue).table);
        } catch {
          /* noop */
        }
      }
      if (e.key === P + 'session') authListeners.forEach((cb) => cb());
    });
  } catch {
    /* noop */
  }

  // ───────── Semilla inicial ─────────
  if (!ls.get('seeded')) {
    ls.set('projects', JSON.stringify(withCovers(SEED_PROJECTS)));
    ls.set('tools', JSON.stringify(SEED_TOOLS));
    ls.set('settings', JSON.stringify(SEED_SETTINGS));
    ls.set('certificates', JSON.stringify(withCertImages(SEED_CERTIFICATES)));
    ls.set('seeded', '1');
    ls.set('seed_v', SEED_VERSION);
  } else if (ls.get('seed_v') !== SEED_VERSION) {
    // Datos nuevos de una versión posterior: se añaden los que faltan, sin tocar lo que ya editaste.
    const merge = (table, seeds) => {
      const cur = readJson(table, []);
      const ids = new Set(cur.map((r) => r.id));
      ls.set(table, JSON.stringify([...cur, ...seeds.filter((x) => !ids.has(x.id))]));
    };
    merge('tools', SEED_TOOLS);
    merge('projects', SEED_PROJECTS);
    merge('certificates', SEED_CERTIFICATES);
    ls.set('certificates', JSON.stringify(withCertImages(readJson('certificates', []))));
    ls.set('projects', JSON.stringify(withCovers(readJson('projects', []))));
    const st = readJson('settings', {});
    if (!st.linkedin) ls.set('settings', JSON.stringify({ ...st, linkedin: SEED_SETTINGS.linkedin }));
    ls.set('seed_v', SEED_VERSION);
  }

  const rows = (table) => readJson(table, []);

  // ───────── Autenticación local (contraseña única) ─────────
  const authListeners = new Set();
  const fireAuth = () => authListeners.forEach((cb) => cb());

  async function hash(pass, salt) {
    const data = new TextEncoder().encode(salt + '::' + pass);
    if (globalThis.crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381;
    for (const b of data) h = ((h << 5) + h + b) >>> 0; // respaldo débil, solo modo demo
    return 'weak-' + h.toString(16);
  }

  // Acceso de la dueña/o del sitio ya configurado (correo + contraseña); no hay pantalla pública para crear una.
  if (!readJson('admin', null)) {
    ls.set('admin', JSON.stringify({ salt: 'fp-owner-2026', hash: 'a04b8cc09f65c351782b6f427802d3df3f5679b91eab68880b33f14a0237fe8e' }));
  }

  const auth = {
    kind: 'password',
    hasPassword: () => !!readJson('admin', null),
    async setup(password) {
      if (String(password).length < 6) throw new Error('Usa al menos 6 caracteres.');
      const salt = uid();
      ls.set('admin', JSON.stringify({ salt, hash: await hash(password, salt) }));
      ls.set('session', String(Date.now() + SESSION_MS));
      fireAuth();
    },
    async signIn(email, password) {
      if (email && String(email).trim().toLowerCase() !== ADMIN_EMAIL) throw new Error('Correo o contraseña incorrectos.');
      const rec = readJson('admin', null);
      if (!rec) throw new Error('Aún no hay contraseña. Crea una primero.');
      const h = await hash(password, rec.salt);
      const okDefault = rec.salt === 'fp-owner-2026' && h === 'weak-d52adc8e'; // navegador sin crypto.subtle (http en red local)
      if (h !== rec.hash && !okDefault) throw new Error('Contraseña incorrecta.');
      ls.set('session', String(Date.now() + SESSION_MS));
      fireAuth();
    },
    async signOut() {
      ls.del('session');
      fireAuth();
    },
    async resetPassword() {
      ls.del('admin');
      ls.del('session');
      fireAuth();
    },
    async getSession() {
      const exp = Number(ls.get('session') || 0);
      return exp > Date.now() ? { user: { email: ADMIN_EMAIL } } : null;
    },
    onChange(cb) {
      authListeners.add(cb);
      return () => authListeners.delete(cb);
    },
  };

  // ───────── API de datos ─────────
  return {
    mode: 'local',
    auth,

    async list(table) {
      return [...rows(table)].sort(ORDER[table]);
    },

    async insert(table, data) {
      const row = { id: uid(), created_at: nowIso(), ...data };
      if (table === 'projects' || table === 'tools') row.updated_at = row.created_at;
      ls.set(table, JSON.stringify([...rows(table), row]));
      emit(table);
      return row;
    },

    async update(table, id, patch) {
      let out = null;
      const next = rows(table).map((r) => {
        if (r.id !== id) return r;
        out = { ...r, ...patch };
        if (table === 'projects' || table === 'tools') out.updated_at = nowIso();
        return out;
      });
      if (!out) throw new Error('No se encontró el registro.');
      ls.set(table, JSON.stringify(next));
      emit(table);
      return out;
    },

    async remove(table, id) {
      const target = rows(table).find((r) => r.id === id);
      ls.set(table, JSON.stringify(rows(table).filter((r) => r.id !== id)));
      emit(table);
      // limpia archivos huérfanos
      const urls = [target?.image_url, ...(target?.image_urls || [])].filter((u) => u?.startsWith('idb:'));
      urls.forEach((u) => this.removeFile(u));
    },

    subscribe(table, cb) {
      if (!listeners.has(table)) listeners.set(table, new Set());
      listeners.get(table).add(cb);
      return () => listeners.get(table)?.delete(cb);
    },

    // — Ajustes —
    async getSettings() {
      return { ...SETTINGS_DEFAULTS, ...readJson('settings', {}) };
    },
    async saveSettings(patch) {
      const next = { ...(await this.getSettings()), ...patch };
      ls.set('settings', JSON.stringify(next));
      emit('settings');
      return next;
    },

    // — Visitantes (comentarios y mensajes) —
    async createComment(input) {
      return this.insert('comments', sanitizeComment(input));
    },
    async createMessage(input) {
      await this.insert('messages', sanitizeMessage(input));
    },
    async likeComment(id) {
      const c = rows('comments').find((r) => r.id === id);
      if (!c) throw new Error('Comentario no encontrado.');
      return (await this.update('comments', id, { likes: (c.likes || 0) + 1 })).likes;
    },

    // — Archivos —
    async upload(bucket, file) {
      const isImg = file.type.startsWith('image/');
      const max = isImg ? LIMITS.imageMaxBytes : 8 * 1024 * 1024;
      const body = isImg ? await compressImage(file) : file;
      if (body.size > max) throw new Error(`El archivo supera ${Math.round(max / 1048576)} MB.`);
      const path = `${bucket}/${uid()}.${fileExt(body.name)}`;
      await idbPut(path, body);
      return { url: 'idb:' + path, path };
    },
    async removeFile(url) {
      if (!url?.startsWith('idb:')) return;
      forgetUrl(url);
      try {
        await idbDelete(url.slice(4));
      } catch {
        /* noop */
      }
    },

    // — Utilidades solo del modo local —
    async resetDemo() {
      TABLES.forEach((t) => ls.del(t));
      ls.del('settings');
      ls.del('seeded');
      try {
        await idbClear();
      } catch {
        /* noop */
      }
      ls.set('projects', JSON.stringify(withCovers(SEED_PROJECTS)));
      ls.set('tools', JSON.stringify(SEED_TOOLS));
      ls.set('settings', JSON.stringify(SEED_SETTINGS));
      ls.set('certificates', JSON.stringify(withCertImages(SEED_CERTIFICATES)));
      ls.set('seeded', '1');
      ls.set('seed_v', SEED_VERSION);
      [...TABLES, 'settings'].forEach(emit);
    },
    exportAll() {
      const out = { version: 1, exported_at: nowIso(), settings: readJson('settings', {}) };
      TABLES.forEach((t) => (out[t] = rows(t)));
      return out;
    },
    async importAll(json) {
      if (!json || typeof json !== 'object') throw new Error('Archivo no válido.');
      TABLES.forEach((t) => Array.isArray(json[t]) && ls.set(t, JSON.stringify(json[t])));
      if (json.settings) ls.set('settings', JSON.stringify(json.settings));
      [...TABLES, 'settings'].forEach(emit);
    },
  };
}
