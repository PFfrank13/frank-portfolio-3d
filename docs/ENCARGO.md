# Encargo común (léelo junto con docs/ARCHITECTURE.md)

Trabajamos varias personas EN PARALELO sobre el mismo proyecto (`/home/claude/frank-portfolio-3d`).
Cada una es dueña de archivos concretos (ver "Tus archivos" en tu encargo). **No edites archivos de otros ni los marcados "NO editar".**
Algunos archivos que importas pueden seguir siendo stubs de 4 líneas cuando empieces: programa contra los nombres de export acordados y,
si necesitas algo de un archivo ajeno que aún no existe, simúlalo solo en tu banco de pruebas (fuera del repo), nunca lo crees tú.

## Quién es el cliente y qué pidió (palabras suyas, resumidas)

Frank Farid Yampier Pineda Ferro, ingeniero de software Full-Stack de Ica, Perú. Rechazó la versión anterior: "se ve muy colorido", "hecho con IA",
"debe ser hecho con sumo cuidado profesional". Pidió:

1. **Perfil profesional y sobrio.** Nada colorido ni de ciencia ficción genérica. Sistema visual ya fijado en `ARCHITECTURE.md` (grafito + papel cálido, un solo acento dorado).
2. **Experiencia por scroll**: al bajar aparece más contenido profesional, con ritmo (secciones oscuras y de papel). Un único gran momento 3D: **un carné de identificación colgado de una cinta con física** (como en su referencia), que se arrastra con el mouse y se balancea más cuanto más rápido se hace scroll.
3. **Proyectos "al extremo"**: que pueda subir los suyos desde un panel, con galería de imágenes, filtros, detalle, enlaces.
4. **Panel de administración** para gestionar todo, y **comentarios en tiempo real**: visitantes comentan (con imagen opcional), dan "me gusta"; Frank fija, da corazón, **responde**, borra; todo se ve en vivo en el sitio.
5. **Herramientas que maneja** (varias) con **el "panelito"**: un panel que muestra nombre, para qué lo usa y dónde, al pasar el cursor / enfocar / tocar una herramienta.
6. **Contacto visible**: correo y teléfono reales, botón de WhatsApp, formulario que llega al panel. **GitHub debe abrir su perfil real.**
7. **CV profesional** descargable (y que pueda reemplazarlo desde el panel).

## Datos verificados (úsalos tal cual; NO inventes otros)

- Nombre: Frank Farid Yampier Pineda Ferro · Rol: Full-Stack Software Engineer (Creative Tech Lead) · Ica, Perú · Universidad Tecnológica del Perú
- Correo: pinedaferrof@gmail.com · Teléfono: +51 928 471 762 · WhatsApp: https://wa.me/51928471762
- GitHub: https://github.com/Subaru-Natsuki (verificado: existe) · handle @Subaru_Natsuki · LinkedIn: no tiene dato (si está vacío, no se muestra)
- Foto: `src/assets/image_c70791.png` (227×314 px, fondo blanco, camisa negra). Es de baja resolución: no la amplies por encima de ~1.3× en pantalla sin avisarlo.
- Proyectos y herramientas reales: `src/lib/store/seed.js` y `src/lib/profile.js`. **No inventes empleadores, fechas, cifras de impacto ni clientes.**
- Zona horaria del cliente: America/Lima.

## Reglas de calidad (obligatorias)

- Idioma: español de Perú, tono directo y profesional, *sentence case*. Evita lo que `ARCHITECTURE.md` lista como cliché de página generada por IA.
- **Robusto**: todo componente con datos tiene estado de carga, vacío y error (con texto que dice qué pasó y qué hacer). Nada de pantallas en blanco. Ningún error en consola. Valida entradas. Escapa/sanea todo lo que escribe un visitante (React ya escapa; no uses `dangerouslySetInnerHTML` con datos de usuario; los enlaces de usuario pasan por `safeUrl`).
- Accesibilidad: foco visible, `aria-label` en botones de solo icono, formularios con `<label>`, resultados en `aria-live`, contraste AA, objetivos táctiles ≥ 44 px, `prefers-reduced-motion` respetado.
- Responsive de 360 a 1920 px sin scroll horizontal.
- Cero recursos externos (sin CDN, sin Google Fonts, sin imágenes remotas).
- Sin dependencias nuevas. No toques `package.json`, `src/styles/index.css`, `src/lib/store/*`, `src/lib/hooks.js`, `src/lib/config.js`, `tailwind.config.js`, `vite.config.js`, `index.html`. Si necesitas estilos extra: clases de Tailwind o un `<style>` acotado dentro de tu componente (ver `SbStyles` en `site/parts/sbKit.jsx`).
- Archivos nuevos solo dentro de tu carpeta/subcarpeta indicada. Comentarios en el código solo donde expliquen un porqué no evidente.
- Prefiere componentes pequeños y legibles; ningún archivo de más de ~500 líneas.

## Contratos entre piezas (nombres de export acordados)

| Archivo | Export por defecto | Notas |
|---|---|---|
| `three/Lanyard.jsx` | `Lanyard({ className })` + named `LanyardFallback` | Llena su contenedor (`position:absolute; inset:0`). El Hero lo carga con `React.lazy` y lo envuelve en un error boundary que usa `LanyardFallback`. |
| `site/Site.jsx` | `Site` | Compone Nav, Hero, Profile, Projects, Stack, Credentials, CvSection, Contact, Comments, Footer. Registra Lenis (`setLenis`) y actualiza `scrollState`. |
| `site/Projects.jsx` | `Projects` | `<section id="proyectos">` |
| `site/Stack.jsx` | `Stack` | `<section id="stack">` con el panelito |
| `site/Credentials.jsx` | `Credentials` | `<section id="credenciales" class="on-paper">` |
| `site/Comments.jsx` | `Comments` | `<section id="comentarios">` |
| `admin/AdminApp.jsx` | `AdminApp({ route })` | `route` = segmentos tras `admin`: `[]`, `['proyectos']`, `['herramientas']`, `['certificados']`, `['comentarios']`, `['mensajes']`, `['ajustes']` |
| `admin/{Projects,Tools,Certificates,Comments,Messages,Settings,Dashboard}.jsx` | cada uno su componente | AdminApp los importa con esos nombres de archivo |

Tiempo real: usa siempre `useTable(table)` / `useSettings()` / `store.subscribe` (ya funcionan en modo local entre pestañas y en Supabase).
Para pruebas: `window.__fpStore` expone el store.

## Cómo probar (obligatorio: mira tus capturas con la herramienta Read y corrige)

```bash
cd /home/claude/frank-portfolio-3d
npx vite --port <TU_PUERTO> --strictPort > /tmp/claude-0/<tu-nombre>-vite.log 2>&1 &     # servidor de desarrollo propio
python3 -I tu_script.py                                                                  # Playwright (Python) con Chromium headless
npx vite build --outDir /tmp/claude-0/<tu-nombre>-dist --emptyOutDir                     # compilación de prueba (NO escribas en dist/)
```

- WebGL en headless: `chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--enable-unsafe-swiftshader"])`.
- Guarda scripts y capturas en `/tmp/claude-0/<tu-nombre>/` (no dentro del repo). Prueba al menos 1440×900 y 390×844.
- Captura `pageerror` y `console.error`: deben quedar en cero (ignora fallos de red externos del sandbox).
- Al terminar, detén tu servidor de desarrollo (`kill` por PID que guardaste; **no uses `pkill -f`**, mataría el de los demás).
- Si la compilación falla por un archivo AJENO a medio escribir, espera un minuto y reintenta; no lo arregles tú.

## Entrega

Responde en español, máximo 220 palabras: archivos creados/modificados, qué verificaste (con qué prueba), límites o decisiones que el dueño del proyecto deba saber. Sin recapitular el proceso.

---

# ADENDA 2 (15 oct) — lo que pidió el cliente tras ver el avance

Palabras del cliente: *"así debes hacerlo el modelo 3d … dale mejoras extremas sobre los proyectos … déjame subir los míos … haz un panel de admin para poder hacer todo: fijar comentario, ver los comentarios y responder a comentarios en tiempo real … mejora todo al extremo, mejora el 3d."*

1. **Referencia 3D**: su portafolio de referencia (Next.js) cuelga un carné con física (Rapier + MeshLine) de una cinta; se arrastra con el mouse. Copia en `/tmp/claude-0/kartu-reference.glb` (nodos `card`, `clamp`, `clip`; materiales `base`, `metal`) y su atlas de textura en `/tmp/claude-0/kartu-reference-atlas.png` (panel frontal a la izquierda, trasero a la derecha). **Se usa la GEOMETRÍA del modelo; la textura trae marca de otra persona ("jack.rg") y NO debe aparecer en ningún entregable.** Textura nueva con los datos de Frank, mismo diseño sobrio (grafito + papel + dorado).
2. **Todo lo que se ve "subido" en la referencia es de otra persona.** Aquí los proyectos, herramientas y certificados los sube Frank desde el panel. Los 4 proyectos y 23 herramientas semilla son reales (de sus textos); no inventes más.
3. **Tiempo real**: el sitio ya usa `useTable`/`store.subscribe`. En modo local solo funciona entre pestañas del mismo navegador; con Supabase (`.env` + `supabase/schema.sql`) funciona entre visitantes y panel. Donde sea relevante, la interfaz debe decir en qué modo está.
4. **Panel**: debe poder hacer TODO: proyectos, herramientas, certificados, comentarios (fijar, corazón, responder, borrar), mensajes, ajustes (contacto, disponibilidad, CV).
5. Los archivos `Profile`, `CvSection`, `Contact`, `Footer` (sitio) y `Dashboard`, `Messages`, `Settings` (admin) ya existen como esqueletos de 4 líneas: reemplázalos si son tuyos.
6. Servidores de prueba, uno por persona: puertos 5201 (3D), 5202 (perfil/CV/contacto), 5203 (proyectos/stack), 5204 (comentarios), 5205 (admin shell), 5206 (admin herramientas/certificados). `vite.config.js` ya pre-empaqueta dependencias y sabe cargar `.glb` con `import url from '...glb?url'`.
