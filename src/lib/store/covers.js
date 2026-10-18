// Portadas ilustradas (originales, conceptuales) de los proyectos de ejemplo. Van incluidas en el código: sirven de portada
// mientras el proyecto no tenga imagen propia (en local por id, en Supabase por título). Si subes una imagen desde el panel, esa manda.
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

// En Supabase los proyectos de ejemplo tienen id aleatorio: se reconocen por el título.
const BY_TITLE = [
  [/^hospital regional/i, nfc],
  [/^arquitectura iot/i, iot],
  [/^ella\b/i, voice],
  [/^microservicios/i, micro],
  [/^agrosoft/i, agro],
];
const CERT_BY_TITLE = [
  [/cloud foundations/i, awsFound],
  [/cloud operations/i, awsOps],
  [/^introduction to iot/i, ciscoIot],
];
const pick = (list, title = '') => (list.find(([re]) => re.test(String(title).trim())) || [])[1];

export const withCoversByTitle = (rows) =>
  rows.map((p) => {
    if ((p.image_urls || []).length) return p;
    const img = COVERS[p.id] || pick(BY_TITLE, p.title);
    return img ? { ...p, image_urls: [img] } : p;
  });

export const withCertImagesByTitle = (rows) =>
  rows.map((c) => {
    const first = c.image_urls?.[0] || '';
    if (first && !/^https?:\/\/images\.credly\.com/.test(first)) return c;
    const img = CERTS[c.id] || pick(CERT_BY_TITLE, c.title);
    return img ? { ...c, image_urls: [img] } : c;
  });

/** Las portadas incluidas en el código no se guardan en la base de datos (su URL cambia en cada despliegue). */
const BUNDLED = new Set([...Object.values(COVERS), ...Object.values(CERTS), nfc, iot, voice, micro, agro, awsFound, awsOps, ciscoIot]);
export const stripBundled = (row) => (row && Array.isArray(row.image_urls) ? { ...row, image_urls: row.image_urls.filter((u) => !BUNDLED.has(u)) } : row);
