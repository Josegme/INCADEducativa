-- ============================================================
-- INCADEducativa — Migración 018: Módulo Tutorías (ETAPA 2)
-- Ver docs/addenda/ADDENDUM_05_Tutorias.md para el detalle completo.
-- Sesión grupal ligada a un curso (no cita 1:1 — eso queda para el futuro
-- FEATURE_MENTORIA, ADR-17). La modalidad presencial reusa la infraestructura
-- de Coworking (002/013) para bloquear un aula sin flujo de pago: se inserta
-- una reserva `institucional` en `bookings`, sin fila en `payments`, mismo
-- criterio que las reservas en lote de Coordinador (Sprint 17-18).
--
-- No hace falta alterar ningún enum existente:
-- - `discount_type` ya tiene 'institucional' (002).
-- - `notification_type` ya tiene 'tutoria' (003) — nunca tuvo productor real.
--
-- Depende de: 001_educativa_core.sql (is_admin, courses, enrollments),
-- 004_conversion_roles.sql (can_teach_course), 002_coworking_module.sql
-- (spaces, bookings, no_overlap — solo si FEATURE_COWORKING=true).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create type tutoria_modalidad as enum ('virtual', 'presencial');
create type tutoria_estado    as enum ('programada', 'realizada', 'cancelada');

create table public.tutorias (
  id                        uuid primary key default uuid_generate_v4(),
  curso_id                  uuid not null references public.courses(id) on delete cascade,
  docente_id                uuid not null references public.users(id),
  modalidad                 tutoria_modalidad not null,
  fecha_inicio              timestamptz not null,
  fecha_fin                 timestamptz not null,
  link_virtual              text,
  space_id                  uuid references public.spaces(id),
  booking_id                uuid references public.bookings(id),
  grabacion_url             text,
  estado                    tutoria_estado not null default 'programada',
  recordatorio_24h_enviado  boolean not null default false,
  recordatorio_1h_enviado   boolean not null default false,
  created_at                timestamptz not null default now()
);

create table public.tutoria_asistencias (
  id             uuid primary key default uuid_generate_v4(),
  tutoria_id     uuid not null references public.tutorias(id) on delete cascade,
  alumno_id      uuid not null references public.users(id),
  presente       boolean not null default false,
  registrado_at  timestamptz,
  unique(tutoria_id, alumno_id)
);

create index idx_tutorias_curso   on public.tutorias(curso_id);
create index idx_tutorias_docente on public.tutorias(docente_id);
create index idx_tutorias_fecha   on public.tutorias(fecha_inicio);

-- ── Función: auto-completar tutorías pasadas (mismo patrón que
--    detect_completed_bookings(), migración 017) ─────────────
create or replace function public.detect_completed_tutorias()
returns integer as $$
declare affected integer;
begin
  with marked as (
    update public.tutorias t
    set estado = 'realizada'
    where t.estado = 'programada'
      and t.fecha_fin < now()
    returning t.id
  )
  select count(*) into affected from marked;
  return affected;
end;
$$ language plpgsql security definer;

-- ── RLS — usando is_admin() (001) y can_teach_course() (004) ─
alter table public.tutorias            enable row level security;
alter table public.tutoria_asistencias enable row level security;

-- tutorias: inscriptos del curso leen; docente del curso y admin escriben
create policy "tutorias_select" on public.tutorias
  for select using (
    public.is_admin()
    or public.can_teach_course(curso_id)
    or exists (
      select 1 from public.enrollments en
      where en.course_id = tutorias.curso_id and en.user_id = auth.uid()
    )
  );
create policy "tutorias_write" on public.tutorias
  for all using (
    public.is_admin() or public.can_teach_course(curso_id)
  );

-- tutoria_asistencias: alumno ve la propia; docente del curso y admin escriben
create policy "tutoria_asistencias_select" on public.tutoria_asistencias
  for select using (
    public.is_admin()
    or alumno_id = auth.uid()
    or exists (
      select 1 from public.tutorias t
      where t.id = tutoria_asistencias.tutoria_id and public.can_teach_course(t.curso_id)
    )
  );
create policy "tutoria_asistencias_write" on public.tutoria_asistencias
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.tutorias t
      where t.id = tutoria_asistencias.tutoria_id and public.can_teach_course(t.curso_id)
    )
  );

-- ── Cron: auto-completado 100% SQL + recordatorios vía /api/cron/tutorias ─
-- pg_cron/pg_net ya están habilitados desde la migración 016 (coworking).
select cron.schedule(
  'tutorias-detect-completed',
  '*/5 * * * *',
  $$select public.detect_completed_tutorias();$$
);

-- Reemplazar <APP_URL> y <CRON_SECRET> (mismo valor que la env var
-- CRON_SECRET ya usada por /api/cron/coworking) después de deployar — pg_net
-- no puede alcanzar http://localhost, mientras tanto se prueba con curl.
select cron.schedule(
  'tutorias-notify',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := '<APP_URL>/api/cron/tutorias',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')
  );
  $$
);
