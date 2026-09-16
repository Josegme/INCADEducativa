-- ============================================================
-- INCADEducativa — 040: costura de período en enrollments
-- ============================================================
-- Habilita recursar / repetir una capacitación por cohorte sin romper
-- el comportamiento actual (una inscripción por usuario+curso cuando
-- periodo_id es null). No se construye el SGA acá — ADR-19.

alter table public.enrollments
  add column if not exists periodo_id uuid;

alter table public.enrollments
  drop constraint if exists enrollments_user_id_course_id_key;

create unique index if not exists enrollments_user_course_sin_periodo_uidx
  on public.enrollments (user_id, course_id)
  where periodo_id is null;

create unique index if not exists enrollments_user_course_periodo_uidx
  on public.enrollments (user_id, course_id, periodo_id)
  where periodo_id is not null;

comment on column public.enrollments.periodo_id is
  'Costura académica (ADR-19). Null = inscripción LMS actual. Con valor, permite una fila por cohorte.';
