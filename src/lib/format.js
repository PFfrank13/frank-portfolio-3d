const rtf = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat('es', { numeric: 'auto' }) : null;

export function timeAgo(date) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const diff = (d - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (!rtf) return d.toLocaleString('es-PE');
  if (abs < 45) return 'hace un momento';
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(date) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '?';

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
