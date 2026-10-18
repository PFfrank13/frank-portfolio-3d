// Datos iniciales. En modo local se cargan la primera vez; en Supabase se generan con
// `npm run seed:sql` → supabase/seed.sql (mismos datos, una sola fuente de verdad).
import { SETTINGS_DEFAULTS } from '../profile.js';

const T = '2026-01-01T00:00:00.000Z';

export const SEED_PROJECTS = [
  {
    id: 'seed-hospital-nfc',
    title: 'Hospital Regional — acceso y autenticación con ID-Card NFC',
    summary: 'Inicio de sesión unificado y control de acceso para hardware médico y administrativo con tarjetas NFC.',
    description:
      'Diseño e implementación de un sistema unificado de inicio de sesión y control de acceso para hardware médico y administrativo de un hospital regional. Integra hardware y software para reforzar la seguridad del entorno y la trazabilidad de los usuarios.',
    category: 'IoT',
    technologies: ['Python', 'Keycloak', 'Arduino', 'NFC'],
    key_features: [
      'Inicio de sesión único con tarjeta ID-Card NFC',
      'Control de acceso a equipos médicos y administrativos',
      'Trazabilidad de quién accede, cuándo y a qué',
      'Autenticación centralizada con Keycloak',
    ],
    live_url: '',
    github_url: '',
    image_urls: [],
    featured: true,
    sort: 0,
    created_at: T,
    updated_at: T,
  },
  {
    id: 'seed-iot-access',
    title: 'Arquitectura IoT y control de acceso empresarial',
    summary: 'Control de acceso unificado con RFID/NFC: hardware Arduino, middleware en Python y ERP Odoo.',
    description:
      'Desarrollo de sistemas unificados de seguridad con tecnología RFID/NFC, integrando hardware (Arduino) con middleware en Python y plataformas ERP corporativas (Odoo).',
    category: 'IoT',
    technologies: ['RFID/NFC', 'Arduino', 'Python', 'Odoo'],
    key_features: [
      'Seguridad unificada con tecnología RFID/NFC',
      'Hardware Arduino conectado a un middleware en Python',
      'Integración con la plataforma ERP corporativa Odoo',
    ],
    live_url: '',
    github_url: '',
    image_urls: [],
    featured: true,
    sort: 1,
    created_at: T,
    updated_at: T,
  },
  {
    id: 'seed-ella-jarvis',
    title: 'ELLA & Jarvis — asistentes virtuales con IA',
    summary: 'Reconocimiento de voz offline en Android y asistentes locales con Ollama y Whisper.',
    description:
      'Creación de motores de reconocimiento de voz offline para Android utilizando Kotlin y Vosk, y despliegue de asistentes locales avanzados con arquitecturas basadas en Ollama y Whisper.',
    category: 'IA',
    technologies: ['Kotlin', 'Android', 'Vosk', 'Ollama', 'Whisper', 'Playwright', 'Claude Code', 'Voiceflow'],
    key_features: [
      'Motor de reconocimiento de voz offline para Android (Kotlin + Vosk)',
      'Asistentes locales con arquitectura basada en Ollama',
      'Transcripción de voz con Whisper',
      'Agentes autónomos que ejecutan tareas en entornos locales de Windows (proyectos Jarvis y Viernes)',
      'Flujos con modelos de lenguaje optimizados para el hardware local',
    ],
    live_url: '',
    github_url: '',
    image_urls: [],
    featured: true,
    sort: 2,
    created_at: T,
    updated_at: T,
  },
  {
    id: 'seed-api-ha',
    title: 'Microservicios y APIs de alta disponibilidad',
    summary: 'Backends FastAPI con caché en memoria para consultas de datos masivos en tiempo real.',
    description:
      'Arquitectura y despliegue de backends robustos (FastAPI, Python) con sistemas de caché en memoria para consultas de datos masivos en tiempo real.',
    category: 'Backend',
    technologies: ['FastAPI', 'Python', 'SQL'],
    key_features: [
      'Backends robustos con FastAPI y Python',
      'Caché en memoria para consultas de datos masivos',
      'Respuestas en tiempo real',
    ],
    live_url: '',
    github_url: '',
    image_urls: [],
    featured: true,
    sort: 3,
    created_at: T,
    updated_at: T,
  },
  {
    id: 'seed-agrosoft',
    title: 'AgroSoft — software industrial y logístico',
    summary: 'Sistemas orientados a objetos en Java y C++ para pesaje, recepción y logística de precisión.',
    description:
      'Diseño de sistemas orientados a objetos en Java y C++ para la gestión algorítmica de pesaje, recepción y logística de precisión en el sector agrario.',
    category: 'Industrial',
    technologies: ['Java', 'C++'],
    key_features: [
      'Diseño orientado a objetos en Java y C++',
      'Gestión algorítmica de pesaje y recepción',
      'Logística de precisión para el sector agrario',
      'Revisión estructural y gestión de reportes técnicos de las fases 1 y 2',
    ],
    live_url: '',
    github_url: '',
    image_urls: [],
    featured: true,
    sort: 4,
    created_at: T,
    updated_at: T,
  },
];

// icon: clave de lib/icons.jsx
export const SEED_TOOLS = [
  // Lenguajes
  { id: 'seed-java', name: 'Java', category: 'Lenguajes', icon: 'java', sort: 1, description: 'Sistemas orientados a objetos para software industrial y logístico.', used_in: 'AgroSoft' },
  { id: 'seed-python', name: 'Python', category: 'Lenguajes', icon: 'python', sort: 2, description: 'Middleware entre hardware y ERP, automatización y backends de IA.', used_in: 'Control de acceso IoT · APIs · Asistentes con IA' },
  { id: 'seed-kotlin', name: 'Kotlin', category: 'Lenguajes', icon: 'kotlin', sort: 3, description: 'Aplicaciones Android con reconocimiento de voz offline.', used_in: 'ELLA' },
  { id: 'seed-cpp', name: 'C++', category: 'Lenguajes', icon: 'cpp', sort: 4, description: 'Lógica de alto rendimiento para pesaje y recepción de precisión.', used_in: 'AgroSoft' },
  { id: 'seed-sql', name: 'SQL', category: 'Lenguajes', icon: 'db', sort: 5, description: 'Modelado y consultas sobre datos masivos y plataformas ERP.', used_in: 'APIs · ERP' },
  { id: 'seed-js', name: 'JavaScript', category: 'Lenguajes', icon: 'javascript', sort: 6, description: 'Interfaces web interactivas y herramientas del ecosistema Node.', used_in: 'Interfaces web' },
  // Frontend
  { id: 'seed-react', name: 'React', category: 'Frontend', icon: 'react', sort: 7, description: 'Aplicaciones web modernas e interfaces inmersivas.', used_in: 'Este portafolio' },
  { id: 'seed-three', name: 'Three.js', category: 'Frontend', icon: 'three', sort: 8, description: 'Escenas 3D en el navegador con física, como el carné de esta página.', used_in: 'Este portafolio' },
  { id: 'seed-tailwind', name: 'Tailwind CSS', category: 'Frontend', icon: 'tailwind', sort: 9, description: 'Sistemas de diseño consistentes y rápidos de mantener.', used_in: 'Este portafolio' },
  { id: 'seed-vite', name: 'Vite', category: 'Frontend', icon: 'vite', sort: 10, description: 'Entorno de desarrollo y compilación para aplicaciones React.', used_in: 'Este portafolio' },
  // Backend
  { id: 'seed-node', name: 'Node.js', category: 'Backend', icon: 'node', sort: 11, description: 'Servicios y herramientas del ecosistema Full-Stack.', used_in: 'Servicios web' },
  { id: 'seed-fastapi', name: 'FastAPI', category: 'Backend', icon: 'fastapi', sort: 12, description: 'APIs de alta disponibilidad con caché en memoria.', used_in: 'Microservicios y APIs' },
  { id: 'seed-odoo', name: 'Odoo', category: 'Backend', icon: 'odoo', sort: 13, description: 'ERP corporativo integrado con el control de acceso físico.', used_in: 'Control de acceso IoT' },
  // Datos y despliegue
  { id: 'seed-docker', name: 'Docker', category: 'Datos y despliegue', icon: 'docker', sort: 14, description: 'Despliegue reproducible de servicios con contenedores.', used_in: 'Microservicios' },
  { id: 'seed-supabase', name: 'Supabase', category: 'Datos y despliegue', icon: 'supabase', sort: 15, description: 'Base de datos, autenticación y tiempo real de este portafolio.', used_in: 'Este portafolio' },
  { id: 'seed-git', name: 'Git', category: 'Datos y despliegue', icon: 'git', sort: 16, description: 'Control de versiones de todos los proyectos.', used_in: 'Todos' },
  { id: 'seed-github', name: 'GitHub', category: 'Datos y despliegue', icon: 'github', sort: 17, description: 'Repositorios y colaboración.', used_in: 'Todos' },
  // IoT y hardware
  { id: 'seed-arduino', name: 'Arduino', category: 'IoT y hardware', icon: 'arduino', sort: 18, description: 'Lectores y controladores de acceso conectados al middleware.', used_in: 'Control de acceso IoT' },
  { id: 'seed-rfid', name: 'RFID / NFC', category: 'IoT y hardware', icon: 'nfc', sort: 19, description: 'Identificación por tarjeta para seguridad empresarial unificada.', used_in: 'Control de acceso IoT' },
  // IA
  { id: 'seed-ollama', name: 'Ollama', category: 'Inteligencia artificial', icon: 'ollama', sort: 20, description: 'Modelos de lenguaje locales para asistentes avanzados.', used_in: 'Jarvis' },
  { id: 'seed-whisper', name: 'Whisper', category: 'Inteligencia artificial', icon: 'openai', sort: 21, description: 'Transcripción de voz a texto en asistentes locales.', used_in: 'Jarvis' },
  { id: 'seed-vosk', name: 'Vosk', category: 'Inteligencia artificial', icon: 'mic', sort: 22, description: 'Reconocimiento de voz offline dentro de la app Android.', used_in: 'ELLA' },
  // Móvil
  { id: 'seed-android', name: 'Android', category: 'Móvil', icon: 'android', sort: 23, description: 'Apps nativas con procesamiento de voz en el dispositivo.', used_in: 'ELLA' },
  // Añadidas desde el CV
  { id: 'seed-keycloak', name: 'Keycloak', category: 'Datos y despliegue', icon: 'keycloak', sort: 24, description: 'Autenticación centralizada y control de identidades.', used_in: 'Hospital Regional · ID-Card NFC' },
  { id: 'seed-otel', name: 'OpenTelemetry', category: 'Datos y despliegue', icon: 'opentelemetry', sort: 25, description: 'Observabilidad: trazas y métricas de los servicios.', used_in: 'APIs y microservicios' },
  { id: 'seed-playwright', name: 'Playwright', category: 'Inteligencia artificial', icon: 'cube', sort: 26, description: 'Automatización de navegador para agentes autónomos y pruebas.', used_in: 'Jarvis · Viernes' },
  { id: 'seed-claude', name: 'Claude Code CLI', category: 'Inteligencia artificial', icon: 'claude', sort: 27, description: 'Desarrollo asistido por agentes desde la terminal.', used_in: 'Flujos de desarrollo' },
  { id: 'seed-aistudio', name: 'Google AI Studio', category: 'Inteligencia artificial', icon: 'gemini', sort: 28, description: 'Prototipado con modelos Gemini y diseño de prompts.', used_in: 'Asistentes con IA' },
  { id: 'seed-voiceflow', name: 'Voiceflow', category: 'Inteligencia artificial', icon: 'voice', sort: 29, description: 'Diseño de flujos conversacionales y asistentes de voz.', used_in: 'Jarvis · Viernes' },
  { id: 'seed-kaggle', name: 'Kaggle', category: 'Inteligencia artificial', icon: 'kaggle', sort: 30, description: 'Datasets y práctica con ciencia de datos.', used_in: 'Aprendizaje' },
  { id: 'seed-genymotion', name: 'Genymotion', category: 'Móvil', icon: 'android', sort: 31, description: 'Emulación de dispositivos Android para probar apps.', used_in: 'ELLA' },
  { id: 'seed-html', name: 'HTML5', category: 'Frontend', icon: 'html5', sort: 32, description: 'Estructura semántica y accesible de las interfaces.', used_in: 'Este portafolio' },
  { id: 'seed-css', name: 'CSS3', category: 'Frontend', icon: 'css3', sort: 33, description: 'Maquetación responsive y sistemas de diseño.', used_in: 'Este portafolio' },
  { id: 'seed-aws', name: 'AWS', category: 'Datos y despliegue', icon: 'aws', sort: 34, description: 'Fundamentos y operaciones en la nube (AWS Academy).', used_in: 'Formación · Cloud Foundations y Cloud Operations' },
  { id: 'seed-cisco', name: 'Cisco IoT', category: 'IoT y hardware', icon: 'cisco', sort: 35, description: 'Conceptos de redes e Internet de las Cosas (Cisco Networking Academy).', used_in: 'Formación · Introduction to IoT' },
  { id: 'seed-postman', name: 'Postman', category: 'Backend', icon: 'postman', sort: 36, description: 'Pruebas y documentación de APIs.', used_in: 'APIs y microservicios' },
  { id: 'seed-postgres', name: 'PostgreSQL', category: 'Datos y despliegue', icon: 'postgresql', sort: 37, description: 'Base de datos relacional detrás de Supabase.', used_in: 'Este portafolio' },
  { id: 'seed-linux', name: 'Linux', category: 'Datos y despliegue', icon: 'linux', sort: 38, description: 'Servidores y contenedores sobre Linux.', used_in: 'Despliegues con Docker' },
].map((t) => ({ ...t, created_at: T }));

export const SEED_SETTINGS = { ...SETTINGS_DEFAULTS };

const CREDLY = 'https://www.credly.com/badges/';
const IMG = 'https://images.credly.com/images/';
export const SEED_CERTIFICATES = [
  {
    id: 'seed-cert-aws-ops',
    title: 'AWS Academy Graduate - Cloud Operations - Training Badge',
    issuer: 'Amazon Web Services Training and Certification',
    year: '2025',
    url: CREDLY + '8a224595-5d4b-436b-83e4-9437e78fbb62',
    image_urls: [IMG + '07e7ba52-aea4-431f-ba2d-a4113efd1d5a/linkedin_thumb_blob'],
    created_at: '2025-10-14T12:00:00.000Z',
  },
  {
    id: 'seed-cert-aws-found',
    title: 'AWS Academy Graduate - Cloud Foundations - Training Badge',
    issuer: 'Amazon Web Services Training and Certification',
    year: '2025',
    url: CREDLY + '3a850576-a99b-448d-8074-b07797a63d9c',
    image_urls: [IMG + 'e3541a0c-dd4a-4820-8052-5001006efc85/linkedin_thumb_blob'],
    created_at: '2025-09-22T12:00:00.000Z',
  },
  {
    id: 'seed-cert-cisco-iot',
    title: 'Introduction to IoT',
    issuer: 'Cisco Networking Academy',
    year: '2023',
    url: CREDLY + 'ab30a128-8db5-45b7-b012-6ad3322ae2f9',
    image_urls: [IMG + 'fce226c2-0f13-4e17-b60c-24fa6ffd88cb/linkedin_thumb_Intro2IoT.png'],
    created_at: '2023-05-26T12:00:00.000Z',
  },
];
export const SEED_VERSION = '4';
