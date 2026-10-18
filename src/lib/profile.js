// Datos base del perfil. Lo que cambie desde el panel admin (Ajustes) se guarda en la base de datos
// y tiene prioridad sobre estos valores por defecto.
export const PROFILE = {
  name: 'Frank Farid Yampier Pineda Ferro',
  shortName: 'Frank Pineda',
  role: 'Full-Stack Software Engineer',
  headline: 'Creative Tech Lead',
  location: 'Subtanjalla, Ica, Perú',
  handle: '@Subaru_Natsuki',
  // GitHub no admite "_" en los usuarios: confirma tu URL real y cámbiala en Admin → Ajustes.
  github: 'https://github.com/Subaru-Natsuki',
  linkedin: 'https://www.linkedin.com/in/frank-pineda-ferro-8960343a5',
  email: 'pinedaferrof@gmail.com',
  phone: '+51 928 471 762',
  whatsapp: '51928471762',
  school: 'Universidad Tecnológica del Perú',
  technicalSchool: 'SENATI',
  available: true,
};

export const LETTER = {
  title: 'Diseñando el futuro digital',
  paragraphs: [
    'Soy Frank Farid Yampier Pineda Ferro, ingeniero de software especializado en arquitecturas Full-Stack, automatización con IA y desarrollo de sistemas de alto rendimiento.',
    'Formado en la Universidad Tecnológica del Perú, transformo lógica compleja en soluciones empresariales escalables y disruptivas: desde el sensor que lee una tarjeta hasta el ERP que registra el acceso, pasando por la API que lo sostiene.',
  ],
  closing: 'Si buscas a alguien que entienda el hardware, el backend y la interfaz como un solo sistema, conversemos.',
};

export const SETTINGS_DEFAULTS = {
  available: PROFILE.available,
  email: PROFILE.email,
  phone: PROFILE.phone,
  whatsapp: PROFILE.whatsapp,
  github: PROFILE.github,
  linkedin: PROFILE.linkedin,
  location: PROFILE.location,
  cv_url: '', // vacío → se usa el CV incluido en el sitio
  cv_name: 'CV_Frank_Pineda.pdf',
  cv_updated_at: '',
};

export const PROJECT_CATEGORIES = ['IoT', 'IA', 'Backend', 'Industrial', 'Web', 'Móvil', 'Otro'];

export const TOOL_CATEGORIES = [
  'Lenguajes',
  'Frontend',
  'Backend',
  'Datos y despliegue',
  'IoT y hardware',
  'Inteligencia artificial',
  'Móvil',
];
