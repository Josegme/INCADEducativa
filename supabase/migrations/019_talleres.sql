-- ============================================================
-- INCADEducativa — Migración 019: Módulo Talleres (ETAPA 2, alcance interno)
-- Ver docs/addenda/ADDENDUM_06_Talleres.md para el detalle completo.
-- A diferencia de cursos y tutorías, Talleres es 100% autorado por Admin —
-- sin rol Docente, sin flujo de revisión (ADR-18). Sin cron, sin
-- notificaciones, sin puntos en esta pasada — ningún documento original los
-- pide para Talleres (a diferencia de Tutorías).
--
-- Depende de: 001_educativa_core.sql (is_admin()).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create type taller_estado as enum ('borrador', 'publicado', 'cancelado');

create table public.talleres (
  id                uuid primary key default uuid_generate_v4(),
  titulo            text not null,
  descripcion       text,
  fecha_inicio      timestamptz not null,
  duracion_minutos  integer not null default 60,
  link_virtual      text,
  grabacion_url     text,
  capacidad         integer,
  estado            taller_estado not null default 'borrador',
  created_at        timestamptz not null default now()
);

create table public.taller_inscripciones (
  id            uuid primary key default uuid_generate_v4(),
  taller_id     uuid not null references public.talleres(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  inscrito_at   timestamptz not null default now(),
  unique(taller_id, user_id)
);

create index idx_talleres_estado          on public.talleres(estado);
create index idx_taller_inscripciones_taller on public.taller_inscripciones(taller_id);
create index idx_taller_inscripciones_user   on public.taller_inscripciones(user_id);

-- ── RLS — usando is_admin() (001) ─────────────────────────────
alter table public.talleres            enable row level security;
alter table public.taller_inscripciones enable row level security;

-- talleres: publicados visibles para cualquier autenticado; admin ve todo y escribe
create policy "talleres_select" on public.talleres
  for select using (
    public.is_admin() or (auth.uid() is not null and estado = 'publicado')
  );
create policy "talleres_admin" on public.talleres
  for all using (public.is_admin());

-- taller_inscripciones: el usuario ve/borra la propia; admin ve todas.
-- Insert: solo a talleres publicados, sin restricción de rol (mismo criterio
-- que enrollments de cursos — cualquier autenticado puede inscribirse).
create policy "taller_inscripciones_select" on public.taller_inscripciones
  for select using (user_id = auth.uid() or public.is_admin());
create policy "taller_inscripciones_insert" on public.taller_inscripciones
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.talleres t where t.id = taller_id and t.estado = 'publicado')
  );
create policy "taller_inscripciones_delete" on public.taller_inscripciones
  for delete using (user_id = auth.uid() or public.is_admin());

-- ── Función: cantidad de inscriptos por taller ────────────────
-- La RLS de taller_inscripciones_select solo deja ver la fila propia (o a
-- admin) — un alumno no puede contar el total de inscriptos de otros para
-- saber si el cupo está lleno. Misma solución que get_occupied_slots()
-- (013, Coworking): función security definer que devuelve solo el número,
-- sin exponer qué usuarios están inscriptos.
create or replace function public.get_taller_inscripcion_count(p_taller_id uuid)
returns integer
language sql
security definer
stable
as $$
  select count(*)::integer from public.taller_inscripciones where taller_id = p_taller_id;
$$;

grant execute on function public.get_taller_inscripcion_count(uuid) to authenticated;
