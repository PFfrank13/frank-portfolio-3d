// Utilidades compartidas por los dos adaptadores (local y Supabase).
import { LIMITS } from '../config.js';

export const TABLES = ['projects', 'tools', 'certificates', 'comments', 'messages'];

const byCreatedDesc = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);

export const ORDER = {
  projects: (a, b) => (a.sort ?? 0) - (b.sort ?? 0) || byCreatedDesc(a, b),
  tools: (a, b) => (a.sort ?? 0) - (b.sort ?? 0) || String(a.name).localeCompare(String(b.name)),
  certificates: byCreatedDesc,
  comments: (a, b) => Number(!!b.is_pinned) - Number(!!a.is_pinned) || byCreatedDesc(a, b),
  messages: byCreatedDesc,
};

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export const nowIso = () => new Date().toISOString();

const clean = (s, max) => String(s ?? '').replace(/\u0000/g, '').trim().slice(0, max);

/** Normaliza lo que escribe un visitante (se vuelve a validar en SQL con CHECKs). */
export function sanitizeComment({ name, comment, image_url }) {
  const n = clean(name, LIMITS.commentName);
  const c = clean(comment, LIMITS.commentText);
  if (!n) throw new Error('Escribe tu nombre.');
  if (!c) throw new Error('Escribe un comentario.');
  return {
    name: n,
    comment: c,
    image_url: image_url || null,
    likes: 0,
    is_pinned: false,
    liked_by_admin: false,
    replies: [],
  };
}

export function sanitizeMessage({ name, email, subject, message }) {
  const n = clean(name, LIMITS.messageName);
  const e = clean(email, 120);
  const m = clean(message, LIMITS.messageBody);
  if (!n) throw new Error('Escribe tu nombre.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) throw new Error('Escribe un correo válido.');
  if (m.length < 5) throw new Error('El mensaje es muy corto.');
  return { name: n, email: e, subject: clean(subject, 120), message: m, read: false };
}

export function fileExt(name = '') {
  const m = /\.([a-z0-9]{1,6})$/i.exec(name);
  return m ? m[1].toLowerCase() : 'bin';
}
