-- ════════════════════════════════════════════════════════════════════════
--  Portafolio de Frank Pineda — esquema de base de datos (Supabase / Postgres)
--
--  Cómo usarlo:
--    1. Crea un proyecto en https://supabase.com
--    2. SQL Editor → pega TODO este archivo → Run
--    3. SQL Editor → pega supabase/seed.sql → Run   (datos iniciales)
--    4. Authentication → Users → "Add user" con tu correo y una contraseña
--    5. Authentication → Sign In / Providers → desactiva "Allow new users to sign up"
--
--  Seguridad: solo el correo definido en is_admin() puede administrar.
--  Los visitantes pueden: leer contenido, publicar comentarios (sin fijarlos ni
--  responderlos), dar "me gusta" y enviar mensajes (sin poder leerlos).
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ───────────── Administrador ─────────────
-- Cambia el correo aquí y en VITE_ADMIN_EMAIL si usas otro.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'pinedaferrof@gmail.com', false)
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- ───────────── Tablas ─────────────
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(btrim(title)) between 1 and 160),
  summary      text not null default '' check (char_length(summary) <= 300),
  description  text not null default '',
  category     text not null default 'Otro',
  technologies text[] not null default '{}',
  key_features text[] not null default '{}',
  live_url     text not null default '',
  github_url   text not null default '',
  image_urls   jsonb not null default '[]'::jsonb,
  featured     boolean not null default true,
  sort         int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.tools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  category    text not null default 'Lenguajes',
  icon        text not null default 'cube',
  description text not null default '' check (char_length(description) <= 400),
  used_in     text not null default '' check (char_length(used_in) <= 200),
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.certificates (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(btrim(title)) between 1 and 160),
  issuer     text not null default '',
  year       text not null default '',
  url        text not null default '',
  image_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
-- Si ya habías creado la tabla con una versión anterior:
alter table public.certificates add column if not exists url text not null default '';
alter table public.certificates add column if not exists image_urls jsonb not null default '[]'::jsonb;

create table if not exists public.comments (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(btrim(name)) between 1 and 60),
  comment        text not null check (char_length(btrim(comment)) between 1 and 600),
  image_url      text,
  likes          int not null default 0 check (likes >= 0),
  is_pinned      boolean not null default false,
  liked_by_admin boolean not null default false,
  replies        jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 1 and 80),
  email      text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  subject    text not null default '' check (char_length(subject) <= 120),
  message    text not null check (char_length(btrim(message)) between 5 and 2000),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_sort      on public.projects (sort, created_at desc);
create index if not exists idx_tools_sort         on public.tools (sort);
create index if not exists idx_comments_order     on public.comments (is_pinned desc, created_at desc);
create index if not exists idx_messages_created   on public.messages (created_at desc);

-- ───────────── Triggers updated_at ─────────────
drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tools_updated on public.tools;
create trigger trg_tools_updated before update on public.tools
  for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated on public.settings;
create trigger trg_settings_updated before update on public.settings
  for each row execute function public.set_updated_at();

-- ───────────── "Me gusta" seguro (solo suma 1) ─────────────
create or replace function public.like_comment(p_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  update public.comments set likes = likes + 1 where id = p_id returning likes into n;
  return n;
end
$$;

revoke all on function public.like_comment(uuid) from public;
grant execute on function public.like_comment(uuid) to anon, authenticated;

-- ───────────── Row Level Security ─────────────
-- Permisos de la API de datos (necesarios si "Automatically expose new tables" está desactivado).
-- La seguridad real la ponen las políticas RLS de abajo; estos permisos solo dejan que lleguen a evaluarse.
grant usage on schema public to anon, authenticated;
grant select on public.settings, public.projects, public.tools, public.certificates, public.comments to anon, authenticated;
grant insert on public.comments, public.messages to anon, authenticated;
grant select, insert, update, delete on public.settings, public.projects, public.tools, public.certificates, public.comments, public.messages to authenticated;

alter table public.settings     enable row level security;
alter table public.projects     enable row level security;
alter table public.tools        enable row level security;
alter table public.certificates enable row level security;
alter table public.comments     enable row level security;
alter table public.messages     enable row level security;

-- Lectura pública del contenido
drop policy if exists "public read settings"     on public.settings;
drop policy if exists "public read projects"     on public.projects;
drop policy if exists "public read tools"        on public.tools;
drop policy if exists "public read certificates" on public.certificates;
drop policy if exists "public read comments"     on public.comments;
create policy "public read settings"     on public.settings     for select using (true);
create policy "public read projects"     on public.projects     for select using (true);
create policy "public read tools"        on public.tools        for select using (true);
create policy "public read certificates" on public.certificates for select using (true);
create policy "public read comments"     on public.comments     for select using (true);

-- Administración completa (solo is_admin)
drop policy if exists "admin all settings"     on public.settings;
drop policy if exists "admin all projects"     on public.projects;
drop policy if exists "admin all tools"        on public.tools;
drop policy if exists "admin all certificates" on public.certificates;
drop policy if exists "admin all comments"     on public.comments;
drop policy if exists "admin all messages"     on public.messages;
create policy "admin all settings"     on public.settings     for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all projects"     on public.projects     for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all tools"        on public.tools        for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all certificates" on public.certificates for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all comments"     on public.comments     for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all messages"     on public.messages     for all using (public.is_admin()) with check (public.is_admin());

-- Visitantes: publicar un comentario "limpio" (sin fijar, sin respuestas, sin likes)
drop policy if exists "visitors insert comments" on public.comments;
create policy "visitors insert comments" on public.comments
  for insert to anon, authenticated
  with check (
    likes = 0
    and is_pinned = false
    and liked_by_admin = false
    and replies = '[]'::jsonb
    and (image_url is null or image_url like '%/storage/v1/object/public/comment-images/%')
  );

-- Visitantes: enviar un mensaje (no pueden leerlo después)
drop policy if exists "visitors insert messages" on public.messages;
create policy "visitors insert messages" on public.messages
  for insert to anon, authenticated
  with check (read = false);

-- ───────────── Tiempo real ─────────────
do $$
declare
  t text;
begin
  foreach t in array array['comments', 'messages', 'projects', 'tools', 'certificates', 'settings'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;   -- ya estaba publicada
      when undefined_object then null;   -- publicación inexistente (proyecto sin Realtime)
    end;
  end loop;
end
$$;

-- ───────────── Almacenamiento (imágenes y CV) ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('project-images', 'project-images', true,  5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('comment-images', 'comment-images', true,  2097152, array['image/jpeg','image/png','image/webp','image/gif']),
  ('certificates',   'certificates',   true,  5242880, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('site-files',     'site-files',     true, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read files"            on storage.objects;
drop policy if exists "visitors upload comment imgs" on storage.objects;
drop policy if exists "admin manage files"           on storage.objects;

create policy "public read files" on storage.objects
  for select using (bucket_id in ('project-images','comment-images','certificates','site-files'));

create policy "visitors upload comment imgs" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'comment-images');

create policy "admin manage files" on storage.objects
  for all to authenticated
  using (public.is_admin() and bucket_id in ('project-images','comment-images','certificates','site-files'))
  with check (public.is_admin() and bucket_id in ('project-images','comment-images','certificates','site-files'));
