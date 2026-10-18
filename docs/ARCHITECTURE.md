# Portafolio de Frank Pineda — contrato de arquitectura

Proyecto **Vite + React 18** (JavaScript, sin TypeScript). Idioma de toda la interfaz: **español (Perú)**, tono directo y profesional, *sentence case*.
Dependencias disponibles (NO añadir otras): `react`, `framer-motion`, `gsap`, `lenis`, `lucide-react`, `simple-icons`,
`three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `meshline`, `@supabase/supabase-js`, Tailwind 3.

```
src/
  main.jsx, App.jsx            router por hash: "#/" público · "#/admin/..." panel
  styles/index.css             TOKENS + primitivas (.btn .input .chip .surface …). NO editar.
  lib/
    config.js                  BUCKETS, LIMITS, ADMIN_EMAIL, USE_SUPABASE
    profile.js                 PROFILE, LETTER, SETTINGS_DEFAULTS, PROJECT_CATEGORIES, TOOL_CATEGORIES
    hooks.js                   useTable, useSettings, useAdminSession, useHashRoute, go, useLikedSet
    format.js                  timeAgo, formatDateTime, initials, plural
    icons.jsx                  <ToolIcon name size/>, ICON_KEYS
    images.js                  compressImage, useResolvedUrl
    store/                     capa de datos (local + Supabase). NO editar.
  components/
    ui/Img.jsx                 <Img src alt className/> (entiende "idb:" y https)
    site/                      sitio público
    admin/                     panel de administración
    three/                     escena 3D del hero
supabase/schema.sql, seed.sql  base de datos
```

## Sistema visual (tokens en `src/styles/index.css`)

Grafito + papel cálido, **un solo acento dorado** (`--gold`) usado con mucha contención (foco, detalles clave). Nada colorido.

| Token | Uso |
|---|---|
| `--bg #0c0d0e` `--bg-1 #121315` `--bg-2 #1a1b1e` `--bg-3 #232528` | fondos, de más profundo a más elevado |
| `--line #2a2c30` | bordes y reglas finas |
| `--fg #ebe7df` `--fg-2 #a4a39e` `--fg-3 #74757a` | texto principal / secundario / terciario |
| `--paper #e9e5db` `--ink #141414` | secciones claras (`.on-paper` reasigna --fg/--line/--bg-1 automáticamente) |
| `--gold #d5b05a` | acento único |
| `--ok` `--danger` `--warn` | estados (verde / rojo / ámbar apagados) |

Tailwind está mapeado a los tokens: `bg-bg`, `bg-bg-1`, `bg-bg-2`, `border-line`, `text-fg`, `text-fg-2`, `text-fg-3`, `text-gold`, `bg-paper`, `text-ink`, `text-danger`, `text-ok`, `font-display`, `font-body`, `font-mono`.

Tipografía (ya cargada, local): **Bricolage Grotesque** (`font-display`, titulares) + **Instrument Sans** (`font-body`) + JetBrains Mono (`font-mono`, SOLO para números/datos técnicos puntuales).

Primitivas CSS listas: `.container` · `.btn` `.btn-primary` `.btn-gold` `.btn-danger` `.btn-sm` `.btn-icon` · `.field` `.label` `.hint` `.input` `.textarea` `.select` · `.chip` `.chip-solid` · `.surface` · `.link` · `.dot` `.dot-ok` · `.on-paper` · `.sr-only`.

### Reglas de estilo (importantes)
- **Evitar los clichés de página generada por IA**: nada de etiquetas en MAYÚSCULAS con tracking sobre cada título, nada de numeración 01/02/03 salvo que sea una secuencia real, nada de textos tipo "A · B · C" como decoración, nada de flechas "→" pegadas a los botones, nada de degradados de colores, nada de tarjetas idénticas con sombra suave repetidas. Preferir tipografía, reglas finas (`border-line`) y espacio en blanco.
- Titulares de sección: `font-display`, peso 500–600, `clamp(2.2rem, 5.2vw, 4.2rem)`, `letter-spacing -0.03em`, `line-height 1`. Párrafos: `text-fg-2`, máx. ~62ch, `line-height 1.65`.
- Radios: superficies 18px, controles 12px, botones/chips 999px. Un solo nivel de sombra o ninguna: se prefiere borde fino.
- Movimiento sobrio: transiciones de 200–300 ms con `var(--ease)`. Sin animaciones decorativas continuas. Respetar `prefers-reduced-motion` (ya hay regla global).
- Accesibilidad: contraste AA, foco visible (ya global), `aria-label` en botones solo-icono, formularios con `<label>`, estados `aria-live` para toasts/resultados.
- Responsive de 360px a 1920px, sin scroll horizontal. Objetivos táctiles ≥ 44px.
- Cero recursos externos (sin CDN, sin Google Fonts, sin imágenes remotas): el sitio debe funcionar offline y compilado en un solo HTML.

## Capa de datos

`import { store } from '../../lib/store/index.js'` — mismo contrato en modo **local** (localStorage + IndexedDB, tiempo real entre pestañas) y **Supabase**.
Llamar SIEMPRE como método (`store.remove(...)`, nunca desestructurado).

```js
store.mode                           // 'local' | 'supabase'
await store.list(table)              // 'projects'|'tools'|'certificates'|'comments'|'messages' → ya ordenado
await store.insert(table, data)      // → fila (con id y created_at)
await store.update(table, id, patch) // → fila
await store.remove(table, id)        // borra también sus archivos
store.subscribe(table, cb) → unsubscribe   // cb() en cada cambio (también 'settings')
await store.getSettings() / saveSettings(patch)
await store.createComment({ name, comment, image_url })   // visitante (valida y recorta)
await store.createMessage({ name, email, subject, message })
await store.likeComment(id) → nuevo total
await store.upload(BUCKETS.projects, file) → { url, path }   // comprime imágenes; url "idb:..." (local) o https
await store.removeFile(url)
store.auth: kind ('password'|'email'), hasPassword() [local], setup(pw) [local], signIn(email, pw),
            signOut(), getSession(), onChange(cb) → unsubscribe, resetPassword() [local]
// solo modo local: store.resetDemo(), store.exportAll(), store.importAll(json)
```

Hooks (`lib/hooks.js`): `useTable(table)` → `{ rows, loading, error, reload }` (se actualiza solo en tiempo real) ·
`useSettings()` → `{ settings, loading, save }` · `useAdminSession()` → `{ session, loading }` · `go('admin/proyectos')` navega.

Para mostrar imágenes SIEMPRE usar `<Img src={url} alt="…" className="…" />` (las URLs `idb:` no funcionan en `<img>` directo).
Para pruebas, `window.__fpStore` expone el store en el navegador.

### Modelos
- **project**: `id, title, summary(≤300), description, category (PROJECT_CATEGORIES), technologies[], key_features[], live_url, github_url, image_urls[] (la 1ª = portada), featured, sort, created_at, updated_at`
- **tool**: `id, name, category (TOOL_CATEGORIES), icon (clave de ICON_KEYS), description, used_in, sort, created_at`
- **certificate**: `id, title, issuer, year, image_url, created_at`
- **comment**: `id, name, comment, image_url, likes, is_pinned, liked_by_admin, replies[{id, author, message, created_at}], created_at`
- **message**: `id, name, email, subject, message, read, created_at`
- **settings**: `available, email, phone, whatsapp, github, linkedin, location, cv_url, cv_name, cv_updated_at`

## Rutas del panel

`#/admin` (login o resumen) · `#/admin/proyectos` · `#/admin/herramientas` · `#/admin/certificados` · `#/admin/comentarios` · `#/admin/mensajes` · `#/admin/ajustes`.

## Secciones del sitio público (ids de ancla)

`inicio` (hero 3D) · `perfil` (carta, papel) · `proyectos` · `stack` · `credenciales` (papel) · `cv` · `contacto` · `comentarios`.

## Probar

```bash
npx vite --port 5191 --strictPort &      # servidor de desarrollo
python3 -I script.py                      # Playwright (Python) ya instalado; usar chromium headless
npm run build                             # debe compilar sin errores ni advertencias nuevas
```
