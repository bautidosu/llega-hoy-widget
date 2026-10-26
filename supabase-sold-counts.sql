-- Ejecutar una vez en SQL Editor de Supabase. Tabla independiente del widget.
create table if not exists public.lh_sold_products (
 store_id text not null,
 product_id text not null,
 name text not null,
 handle text,
 sold_count integer not null default 0 check(sold_count >= 0),
 enabled boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key(store_id,product_id)
);
alter table public.lh_sold_products enable row level security;
-- Sin políticas públicas: únicamente el servidor con clave secreta puede acceder.
