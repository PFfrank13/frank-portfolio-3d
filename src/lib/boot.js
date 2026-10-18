// Estado de arranque: la pantalla de carga lo marca al abrirse la cortina; el hero y el carné 3D esperan a esa señal para empezar.
import { useSyncExternalStore } from 'react';

let booted = false;
const subs = new Set();

export const isBooted = () => booted;
export function markBooted() {
  if (booted) return;
  booted = true;
  subs.forEach((f) => f());
}
export function useBooted() {
  return useSyncExternalStore(
    (cb) => (subs.add(cb), () => subs.delete(cb)),
    () => booted,
    () => true,
  );
}

/** Señal de que el modelo 3D ya está en pantalla (la usa el cargador para su progreso real). */
export const cardReady = { value: false };
export function markCardReady() {
  cardReady.value = true;
  try {
    window.dispatchEvent(new Event('fp:card-ready'));
  } catch {
    /* noop */
  }
}
