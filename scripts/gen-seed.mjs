// Genera supabase/seed.sql desde src/lib/store/seed.js (misma fuente que el modo local).
import { writeFileSync } from 'node:fs';
import { SEED_PROJECTS, SEED_SETTINGS, SEED_TOOLS, SEED_CERTIFICATES } from '../src/lib/store/seed.js';

const q = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;
const arr = (a) => (a.length ? `array[${a.map(q).join(', ')}]::text[]` : `'{}'::text[]`);

const projects = SEED_PROJECTS.map(
  (p) =>
    `  (${q(p.title)}, ${q(p.summary)}, ${q(p.description)}, ${q(p.category)}, ${arr(p.technologies)}, ${arr(p.key_features)}, ${q(p.live_url)}, ${q(p.github_url)}, '[]'::jsonb, ${p.featured}, ${p.sort})`
).join(',\n');

const tools = SEED_TOOLS.map(
  (t) => `  (${q(t.name)}, ${q(t.category)}, ${q(t.icon)}, ${q(t.description)}, ${q(t.used_in)}, ${t.sort})`
).join(',\n');

const certs = SEED_CERTIFICATES.map(
  (c) => `  (${q(c.title)}, ${q(c.issuer)}, ${q(c.year)}, ${q(c.url)}, ${q(JSON.stringify(c.image_urls))}::jsonb, ${q(c.created_at)}::timestamptz)`
).join(',\n');

const sql = `-- Datos iniciales (generado con: npm run seed:sql). Ejecuta DESPUÉS de schema.sql.
-- Es seguro correrlo más de una vez: solo inserta si la tabla está vacía.

insert into public.projects (title, summary, description, category, technologies, key_features, live_url, github_url, image_urls, featured, sort)
select * from (values
${projects}
) as v(title, summary, description, category, technologies, key_features, live_url, github_url, image_urls, featured, sort)
where not exists (select 1 from public.projects);

insert into public.tools (name, category, icon, description, used_in, sort)
select * from (values
${tools}
) as v(name, category, icon, description, used_in, sort)
where not exists (select 1 from public.tools);

insert into public.certificates (title, issuer, year, url, image_urls, created_at)
select * from (values
${certs}
) as v(title, issuer, year, url, image_urls, created_at)
where not exists (select 1 from public.certificates);

insert into public.settings (id, data)
values (1, ${q(JSON.stringify(SEED_SETTINGS))}::jsonb)
on conflict (id) do nothing;
`;

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);
console.log('supabase/seed.sql generado:', SEED_PROJECTS.length, 'proyectos,', SEED_TOOLS.length, 'herramientas');
