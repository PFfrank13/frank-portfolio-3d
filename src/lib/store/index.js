import { USE_SUPABASE } from '../config.js';
import { createLocalStore } from './local.js';
import { createSupabaseStore } from './supabase.js';

/** Un único `store` para toda la app: Supabase si hay variables de entorno, local si no. */
export const store = USE_SUPABASE ? createSupabaseStore() : createLocalStore();
export const isLocal = store.mode === 'local';

// Útil para depurar y para las pruebas automáticas (no expone nada que el navegador no tenga ya).
if (typeof window !== 'undefined') window.__fpStore = store;
