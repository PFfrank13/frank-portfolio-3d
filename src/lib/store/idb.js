// Archivos (imágenes, CV) en IndexedDB para el modo local. Referencia: "idb:<clave>".
const DB = 'fp-files';
const STORE = 'files';

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB no disponible'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const idbPut = (key, blob) => tx('readwrite', (s) => s.put(blob, key));
export const idbGet = (key) => tx('readonly', (s) => s.get(key));
export const idbDelete = (key) => tx('readwrite', (s) => s.delete(key));
export const idbClear = () => tx('readwrite', (s) => s.clear());
export const idbKeys = () => tx('readonly', (s) => s.getAllKeys());
