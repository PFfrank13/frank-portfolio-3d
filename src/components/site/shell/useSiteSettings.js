import { useSettings } from '../../../lib/hooks.js';
import { SETTINGS_DEFAULTS } from '../../../lib/profile.js';

/** Ajustes con los valores por defecto del perfil rellenando huecos (campo vacío = valor base, salvo linkedin/cv). */
export default function useSiteSettings() {
  const { settings } = useSettings();
  const pick = (k) => (String(settings[k] ?? '').trim() ? String(settings[k]).trim() : SETTINGS_DEFAULTS[k]);
  return {
    ...settings,
    available: settings.available ?? SETTINGS_DEFAULTS.available,
    email: pick('email'),
    phone: pick('phone'),
    whatsapp: pick('whatsapp').replace(/\D/g, ''),
    github: pick('github'),
    location: pick('location'),
    linkedin: String(settings.linkedin || '').trim(),
  };
}
