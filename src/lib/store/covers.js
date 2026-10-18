// Portadas ilustradas (originales, conceptuales) de los proyectos de ejemplo. Solo modo local; no van al SQL de Supabase.
import nfc from '../../assets/covers/nfc.webp';
import iot from '../../assets/covers/iot.webp';
import voice from '../../assets/covers/voice.webp';
import micro from '../../assets/covers/micro.webp';
import agro from '../../assets/covers/agro.webp';

import awsFound from '../../assets/certs/aws-found.webp';
import awsOps from '../../assets/certs/aws-ops.webp';
import ciscoIot from '../../assets/certs/cisco-iot.webp';

const CERTS = { 'seed-cert-aws-found': awsFound, 'seed-cert-aws-ops': awsOps, 'seed-cert-cisco-iot': ciscoIot };
/** Las imágenes locales sustituyen a los enlaces remotos de Credly (que pueden fallar sin conexión o por hotlink). */
export const withCertImages = (rows) =>
  rows.map((c) => {
    const first = c.image_urls?.[0] || '';
    return CERTS[c.id] && (!first || /^https?:\/\/images\.credly\.com/.test(first)) ? { ...c, image_urls: [CERTS[c.id]] } : c;
  });

export const COVERS = {
  'seed-hospital-nfc': nfc,
  'seed-iot-access': iot,
  'seed-ella-jarvis': voice,
  'seed-api-ha': micro,
  'seed-agrosoft': agro,
};
export const withCovers = (rows) => rows.map((p) => (COVERS[p.id] && !(p.image_urls || []).length ? { ...p, image_urls: [COVERS[p.id]] } : p));
