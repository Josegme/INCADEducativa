-- ============================================================
-- INCADEducativa — Migración 039: Comunidad / Foro (T14)
-- MVP mínimo: foros por carrera + feed institucional, gateado por
-- FEATURE_COMUNIDAD (ver CLAUDE.md regla #6, src/lib/flags.ts). Solo
-- usuarios autenticados (sin anónimos), sin likes ni DMs a propósito —
-- alcance mínimo, ver docs/addenda/resolver_loop1.md T14.
-- NO aplicar contra ninguna DB sin aprobación explícita del usuario.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table public.foro_publicaciones (
  id          uuid primary key default extensions.uuid_generate_v4(),
  autor_id    uuid not null references public.users(id) on delete cascade,
  carrera_id  uuid references public.careers(id) on delete cascade,
  contenido   text not null check (char_length(contenido) between 1 and 2000),
  oculto      boolean not null default false,
  oculto_por  uuid references public.users(id) on delete set null,
  oculto_at   timestamptz,
  created_at  timestamptz not null default now()
);

comment on table public.foro_publicaciones is
  'Publicaciones del módulo Comunidad/Foro (T14). carrera_id null = feed institucional (visible a cualquier autenticado); carrera_id seteado = foro de esa carrera. Sin likes/DMs, sin edición de contenido — el Admin solo puede ocultar (oculto=true), nunca se borra la fila.';

create index idx_foro_publicaciones_carrera on public.foro_publicaciones(carrera_id);
create index idx_foro_publicaciones_autor   on public.foro_publicaciones(autor_id);
create index idx_foro_publicaciones_created on public.foro_publicaciones(created_at desc);

alter table public.foro_publicaciones enable row level security;

-- ============================================================
-- Función: mi_carrera_id() — mismo patrón security definer stable que
-- get_user_discount() (002) para resolver un atributo del usuario
-- autenticado sin exponer una subquery directa a public.users en la
-- policy (más fácil de auditar, un solo lugar si carrera_id cambia de
-- significado a futuro).
-- ============================================================
create or replace function public.mi_carrera_id()
returns uuid as $$
  select carrera_id from public.users where id = auth.uid();
$$ language sql security definer stable set search_path = public;

-- Lectura: cualquier autenticado ve las publicaciones no ocultas (feed
-- institucional + todas las carreras — sin restringir lectura por
-- carrera, el corte real está en quién puede publicar). El autor y el
-- Admin también ven sus propias publicaciones ocultas.
create policy "foro_publicaciones_select" on public.foro_publicaciones
  for select using (
    auth.uid() is not null
    and (not oculto or autor_id = auth.uid() or public.is_admin())
  );

-- Escritura: solo la propia fila. Al feed institucional (carrera_id
-- null) puede postear cualquier autenticado; a un foro de carrera
-- puntual, solo quien pertenece a esa carrera o el Admin.
create policy "foro_publicaciones_insert" on public.foro_publicaciones
  for insert with check (
    autor_id = auth.uid()
    and (carrera_id is null or carrera_id = public.mi_carrera_id() or public.is_admin())
  );

-- Moderación: solo Admin, y solo para ocultar/reactivar (oculto,
-- oculto_por, oculto_at) — nunca se expone un update de `contenido` en
-- el código de la aplicación aunque la policy no lo prohíba a nivel de
-- columna (RLS de Postgres no filtra por columna).
create policy "foro_publicaciones_admin_moderar" on public.foro_publicaciones
  for update using (public.is_admin()) with check (public.is_admin());
