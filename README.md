# Portafolio de Frank Pineda

Sitio personal (React + Vite + Three.js) con carné 3D con física, secciones que aparecen al hacer scroll, panel de administración y comentarios en tiempo real.

## Usar

```bash
npm install
npm run dev            # desarrollo
npm run build          # dist/ → súbelo a Vercel, Netlify, etc.
npm run build:single   # dist-single/index.html: UN solo archivo, abre con doble clic
```

Panel de administración: añade `#/admin` a la dirección del sitio (no hay enlace público). Entra con tu correo de administrador y tu contraseña. En modo demostración el acceso está guardado en el propio navegador; en producción se valida con Supabase (ver abajo).

## Qué puedes hacer desde el panel

- **Proyectos**: subir, editar, duplicar, ordenar, marcar como destacado; galería de imágenes, tecnologías, enlaces.
- **Herramientas**: las del «Stack», con ícono y su panelito (qué hace y dónde la usas) con vista previa.
- **Certificados**: imagen, emisor, año, enlace.
- **Comentarios**: fijar, dar corazón, responder, editar/borrar respuestas, eliminar; llegan en vivo.
- **Mensajes**: bandeja del formulario de contacto, leído/no leído, responder por correo.
- **Ajustes**: correo, teléfono, WhatsApp, GitHub, LinkedIn, disponibilidad y **reemplazo del CV (PDF)**.

## Tiempo real: modo local vs. Supabase

| | Sin configurar (local) | Con Supabase |
|---|---|---|
| Datos | En el navegador (localStorage + IndexedDB) | Base de datos en la nube |
| Tiempo real | Solo entre pestañas del mismo navegador | Entre **todos** los visitantes y tu panel |
| Uso | Demostración | Producción |

Para que tus visitantes comenten y tú los veas y respondas en vivo:

1. Crea un proyecto gratis en supabase.com.
2. En **SQL Editor** ejecuta `supabase/schema.sql` (y opcionalmente `supabase/seed.sql`).
3. En **Authentication → Users** crea tu usuario con tu correo (`pinedaferrof@gmail.com`) y la contraseña que quieras usar en el panel.
4. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (y `VITE_ADMIN_EMAIL` si usas otro correo).
5. `npm run build` y vuelve a publicar.

Las políticas SQL permiten escribir comentarios/mensajes a cualquiera pero solo tu correo puede moderar.

## Editar el contenido base

- Datos de contacto y textos: `src/lib/profile.js` (o desde Ajustes en el panel).
- CV: `python3 scripts/build_cv.py` regenera `cv/Frank_Pineda_CV.pdf`; o súbelo desde Ajustes.
- Carné 3D: `python3 scripts/build_card.py` regenera las texturas con tus datos; el modelo está en `src/assets/card/card.glb`.
- Convenciones de diseño: `docs/ARCHITECTURE.md`.

## Notas

- El enlace de GitHub es `https://github.com/Subaru-Natsuki` (GitHub no admite `_` en usuarios): verifícalo y cámbialo en Ajustes si es otro.
- LinkedIn está vacío: si lo añades en Ajustes, aparece solo.
