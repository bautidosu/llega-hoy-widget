-- Ejecutar una sola vez en Supabase > SQL Editor.
-- No crea políticas públicas: solo el servidor con la clave secreta accede.
create table if not exists public.tn_installations (
  store_id text primary key,
  app_id text not null,
  access_token_encrypted text not null,
  installed_at timestamptz not null default now()
);
alter table public.tn_installations enable row level security;
-- No crear políticas SELECT/INSERT para anon ni authenticated.
