-- Datos iniciales (generado con: npm run seed:sql). Ejecuta DESPUÉS de schema.sql.
-- Es seguro correrlo más de una vez: solo inserta si la tabla está vacía.

insert into public.projects (title, summary, description, category, technologies, key_features, live_url, github_url, image_urls, featured, sort)
select * from (values
  ('Hospital Regional — acceso y autenticación con ID-Card NFC', 'Inicio de sesión unificado y control de acceso para hardware médico y administrativo con tarjetas NFC.', 'Diseño e implementación de un sistema unificado de inicio de sesión y control de acceso para hardware médico y administrativo de un hospital regional. Integra hardware y software para reforzar la seguridad del entorno y la trazabilidad de los usuarios.', 'IoT', array['Python', 'Keycloak', 'Arduino', 'NFC']::text[], array['Inicio de sesión único con tarjeta ID-Card NFC', 'Control de acceso a equipos médicos y administrativos', 'Trazabilidad de quién accede, cuándo y a qué', 'Autenticación centralizada con Keycloak']::text[], '', '', '[]'::jsonb, true, 0),
  ('Arquitectura IoT y control de acceso empresarial', 'Control de acceso unificado con RFID/NFC: hardware Arduino, middleware en Python y ERP Odoo.', 'Desarrollo de sistemas unificados de seguridad con tecnología RFID/NFC, integrando hardware (Arduino) con middleware en Python y plataformas ERP corporativas (Odoo).', 'IoT', array['RFID/NFC', 'Arduino', 'Python', 'Odoo']::text[], array['Seguridad unificada con tecnología RFID/NFC', 'Hardware Arduino conectado a un middleware en Python', 'Integración con la plataforma ERP corporativa Odoo']::text[], '', '', '[]'::jsonb, true, 1),
  ('ELLA & Jarvis — asistentes virtuales con IA', 'Reconocimiento de voz offline en Android y asistentes locales con Ollama y Whisper.', 'Creación de motores de reconocimiento de voz offline para Android utilizando Kotlin y Vosk, y despliegue de asistentes locales avanzados con arquitecturas basadas en Ollama y Whisper.', 'IA', array['Kotlin', 'Android', 'Vosk', 'Ollama', 'Whisper', 'Playwright', 'Claude Code', 'Voiceflow']::text[], array['Motor de reconocimiento de voz offline para Android (Kotlin + Vosk)', 'Asistentes locales con arquitectura basada en Ollama', 'Transcripción de voz con Whisper', 'Agentes autónomos que ejecutan tareas en entornos locales de Windows (proyectos Jarvis y Viernes)', 'Flujos con modelos de lenguaje optimizados para el hardware local']::text[], '', '', '[]'::jsonb, true, 2),
  ('Microservicios y APIs de alta disponibilidad', 'Backends FastAPI con caché en memoria para consultas de datos masivos en tiempo real.', 'Arquitectura y despliegue de backends robustos (FastAPI, Python) con sistemas de caché en memoria para consultas de datos masivos en tiempo real.', 'Backend', array['FastAPI', 'Python', 'SQL']::text[], array['Backends robustos con FastAPI y Python', 'Caché en memoria para consultas de datos masivos', 'Respuestas en tiempo real']::text[], '', '', '[]'::jsonb, true, 3),
  ('AgroSoft — software industrial y logístico', 'Sistemas orientados a objetos en Java y C++ para pesaje, recepción y logística de precisión.', 'Diseño de sistemas orientados a objetos en Java y C++ para la gestión algorítmica de pesaje, recepción y logística de precisión en el sector agrario.', 'Industrial', array['Java', 'C++']::text[], array['Diseño orientado a objetos en Java y C++', 'Gestión algorítmica de pesaje y recepción', 'Logística de precisión para el sector agrario', 'Revisión estructural y gestión de reportes técnicos de las fases 1 y 2']::text[], '', '', '[]'::jsonb, true, 4)
) as v(title, summary, description, category, technologies, key_features, live_url, github_url, image_urls, featured, sort)
where not exists (select 1 from public.projects);

insert into public.tools (name, category, icon, description, used_in, sort)
select * from (values
  ('Java', 'Lenguajes', 'java', 'Sistemas orientados a objetos para software industrial y logístico.', 'AgroSoft', 1),
  ('Python', 'Lenguajes', 'python', 'Middleware entre hardware y ERP, automatización y backends de IA.', 'Control de acceso IoT · APIs · Asistentes con IA', 2),
  ('Kotlin', 'Lenguajes', 'kotlin', 'Aplicaciones Android con reconocimiento de voz offline.', 'ELLA', 3),
  ('C++', 'Lenguajes', 'cpp', 'Lógica de alto rendimiento para pesaje y recepción de precisión.', 'AgroSoft', 4),
  ('SQL', 'Lenguajes', 'db', 'Modelado y consultas sobre datos masivos y plataformas ERP.', 'APIs · ERP', 5),
  ('JavaScript', 'Lenguajes', 'javascript', 'Interfaces web interactivas y herramientas del ecosistema Node.', 'Interfaces web', 6),
  ('React', 'Frontend', 'react', 'Aplicaciones web modernas e interfaces inmersivas.', 'Este portafolio', 7),
  ('Three.js', 'Frontend', 'three', 'Escenas 3D en el navegador con física, como el carné de esta página.', 'Este portafolio', 8),
  ('Tailwind CSS', 'Frontend', 'tailwind', 'Sistemas de diseño consistentes y rápidos de mantener.', 'Este portafolio', 9),
  ('Vite', 'Frontend', 'vite', 'Entorno de desarrollo y compilación para aplicaciones React.', 'Este portafolio', 10),
  ('Node.js', 'Backend', 'node', 'Servicios y herramientas del ecosistema Full-Stack.', 'Servicios web', 11),
  ('FastAPI', 'Backend', 'fastapi', 'APIs de alta disponibilidad con caché en memoria.', 'Microservicios y APIs', 12),
  ('Odoo', 'Backend', 'odoo', 'ERP corporativo integrado con el control de acceso físico.', 'Control de acceso IoT', 13),
  ('Docker', 'Datos y despliegue', 'docker', 'Despliegue reproducible de servicios con contenedores.', 'Microservicios', 14),
  ('Supabase', 'Datos y despliegue', 'supabase', 'Base de datos, autenticación y tiempo real de este portafolio.', 'Este portafolio', 15),
  ('Git', 'Datos y despliegue', 'git', 'Control de versiones de todos los proyectos.', 'Todos', 16),
  ('GitHub', 'Datos y despliegue', 'github', 'Repositorios y colaboración.', 'Todos', 17),
  ('Arduino', 'IoT y hardware', 'arduino', 'Lectores y controladores de acceso conectados al middleware.', 'Control de acceso IoT', 18),
  ('RFID / NFC', 'IoT y hardware', 'nfc', 'Identificación por tarjeta para seguridad empresarial unificada.', 'Control de acceso IoT', 19),
  ('Ollama', 'Inteligencia artificial', 'ollama', 'Modelos de lenguaje locales para asistentes avanzados.', 'Jarvis', 20),
  ('Whisper', 'Inteligencia artificial', 'openai', 'Transcripción de voz a texto en asistentes locales.', 'Jarvis', 21),
  ('Vosk', 'Inteligencia artificial', 'mic', 'Reconocimiento de voz offline dentro de la app Android.', 'ELLA', 22),
  ('Android', 'Móvil', 'android', 'Apps nativas con procesamiento de voz en el dispositivo.', 'ELLA', 23),
  ('Keycloak', 'Datos y despliegue', 'keycloak', 'Autenticación centralizada y control de identidades.', 'Hospital Regional · ID-Card NFC', 24),
  ('OpenTelemetry', 'Datos y despliegue', 'opentelemetry', 'Observabilidad: trazas y métricas de los servicios.', 'APIs y microservicios', 25),
  ('Playwright', 'Inteligencia artificial', 'cube', 'Automatización de navegador para agentes autónomos y pruebas.', 'Jarvis · Viernes', 26),
  ('Claude Code CLI', 'Inteligencia artificial', 'claude', 'Desarrollo asistido por agentes desde la terminal.', 'Flujos de desarrollo', 27),
  ('Google AI Studio', 'Inteligencia artificial', 'gemini', 'Prototipado con modelos Gemini y diseño de prompts.', 'Asistentes con IA', 28),
  ('Voiceflow', 'Inteligencia artificial', 'voice', 'Diseño de flujos conversacionales y asistentes de voz.', 'Jarvis · Viernes', 29),
  ('Kaggle', 'Inteligencia artificial', 'kaggle', 'Datasets y práctica con ciencia de datos.', 'Aprendizaje', 30),
  ('Genymotion', 'Móvil', 'android', 'Emulación de dispositivos Android para probar apps.', 'ELLA', 31),
  ('HTML5', 'Frontend', 'html5', 'Estructura semántica y accesible de las interfaces.', 'Este portafolio', 32),
  ('CSS3', 'Frontend', 'css3', 'Maquetación responsive y sistemas de diseño.', 'Este portafolio', 33),
  ('AWS', 'Datos y despliegue', 'aws', 'Fundamentos y operaciones en la nube (AWS Academy).', 'Formación · Cloud Foundations y Cloud Operations', 34),
  ('Cisco IoT', 'IoT y hardware', 'cisco', 'Conceptos de redes e Internet de las Cosas (Cisco Networking Academy).', 'Formación · Introduction to IoT', 35),
  ('Postman', 'Backend', 'postman', 'Pruebas y documentación de APIs.', 'APIs y microservicios', 36),
  ('PostgreSQL', 'Datos y despliegue', 'postgresql', 'Base de datos relacional detrás de Supabase.', 'Este portafolio', 37),
  ('Linux', 'Datos y despliegue', 'linux', 'Servidores y contenedores sobre Linux.', 'Despliegues con Docker', 38)
) as v(name, category, icon, description, used_in, sort)
where not exists (select 1 from public.tools);

insert into public.certificates (title, issuer, year, url, image_urls, created_at)
select * from (values
  ('AWS Academy Graduate - Cloud Operations - Training Badge', 'Amazon Web Services Training and Certification', '2025', 'https://www.credly.com/badges/8a224595-5d4b-436b-83e4-9437e78fbb62', '["https://images.credly.com/images/07e7ba52-aea4-431f-ba2d-a4113efd1d5a/linkedin_thumb_blob"]'::jsonb, '2025-10-14T12:00:00.000Z'::timestamptz),
  ('AWS Academy Graduate - Cloud Foundations - Training Badge', 'Amazon Web Services Training and Certification', '2025', 'https://www.credly.com/badges/3a850576-a99b-448d-8074-b07797a63d9c', '["https://images.credly.com/images/e3541a0c-dd4a-4820-8052-5001006efc85/linkedin_thumb_blob"]'::jsonb, '2025-09-22T12:00:00.000Z'::timestamptz),
  ('Introduction to IoT', 'Cisco Networking Academy', '2023', 'https://www.credly.com/badges/ab30a128-8db5-45b7-b012-6ad3322ae2f9', '["https://images.credly.com/images/fce226c2-0f13-4e17-b60c-24fa6ffd88cb/linkedin_thumb_Intro2IoT.png"]'::jsonb, '2023-05-26T12:00:00.000Z'::timestamptz)
) as v(title, issuer, year, url, image_urls, created_at)
where not exists (select 1 from public.certificates);

insert into public.settings (id, data)
values (1, '{"available":true,"email":"pinedaferrof@gmail.com","phone":"+51 928 471 762","whatsapp":"51928471762","github":"https://github.com/Subaru-Natsuki","linkedin":"https://www.linkedin.com/in/frank-pineda-ferro-8960343a5","location":"Subtanjalla, Ica, Perú","cv_url":"","cv_name":"CV_Frank_Pineda.pdf","cv_updated_at":""}'::jsonb)
on conflict (id) do nothing;
