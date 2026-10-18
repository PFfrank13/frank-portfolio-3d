import { useEffect, useState } from 'react';
import { idbGet } from './store/idb.js';

/** Reduce y recomprime una imagen en el navegador (WebP/JPEG). SVG y GIF pasan tal cual. */
export async function compressImage(file, { maxSide = 1600, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/') || /svg|gif/.test(file.type)) return file;
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (bitmap.close) bitmap.close();
  const toBlob = (type) => new Promise((res) => canvas.toBlob(res, type, quality));
  let blob = await toBlob('image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg');
  return blob && blob.size < file.size ? new File([blob], renameExt(file.name, blob.type), { type: blob.type }) : file;
}

function renameExt(name, type) {
  const ext = type === 'image/webp' ? 'webp' : 'jpg';
  return name.replace(/\.[^.]+$/, '') + '.' + ext;
}

function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).catch(() => loadViaImg(file));
  }
  return loadViaImg(file);
}

function loadViaImg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

// ───────── Resolución de URLs "idb:" (modo local) ─────────
const cache = new Map();

export async function resolveUrl(url) {
  if (!url || !url.startsWith('idb:')) return url || '';
  if (cache.has(url)) return cache.get(url);
  try {
    const blob = await idbGet(url.slice(4));
    if (!blob) return '';
    const obj = URL.createObjectURL(blob);
    cache.set(url, obj);
    return obj;
  } catch {
    return '';
  }
}

export function forgetUrl(url) {
  const obj = cache.get(url);
  if (obj) URL.revokeObjectURL(obj);
  cache.delete(url);
}

/** Hook: devuelve una URL lista para <img src>. */
export function useResolvedUrl(url) {
  const [src, setSrc] = useState(() => (url && !url.startsWith('idb:') ? url : cache.get(url) || ''));
  useEffect(() => {
    let alive = true;
    if (!url) return setSrc('');
    if (!url.startsWith('idb:')) return setSrc(url);
    resolveUrl(url).then((u) => alive && setSrc(u));
    return () => {
      alive = false;
    };
  }, [url]);
  return src;
}
