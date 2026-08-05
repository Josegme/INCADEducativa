-- ============================================================
-- INCADEducativa — Migración 021: progreso de alumnos visible al docente
-- Deuda funcional E1 (FUNCIONALIDADES.md §4.2 "ver progreso y asistencia de
-- sus alumnos"). La policy `enrollments_own` (001) solo deja ver la propia
-- fila (o a admin) — un docente no podía leer el progreso de sus alumnos.
-- Mismo criterio que get_occupied_slots()/get_taller_inscripcion_count():
-- se extiende la vista `course_students` (005, ya restringida a
-- can_teach_course()/is_admin()) en vez de abrir la RLS de `enrollments`
-- directo, para no exponer filas de otros cursos.
--
-- Depende de: 001_educativa_core.sql, 005_rls_fixes_e1.sql (course_students,
-- can_teach_course()).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create or replace view public.course_students
with (security_invoker = false) as
select distinct
  u.id,
  u.nombre,
  u.apellido,
  u.avatar_url,
  u.email,
  e.course_id,
  e.estado as enrollment_estado,
  e.progreso_pct,
  e.fecha_inscripcion,
  e.fecha_completado
from public.users u
join public.enrollments e on e.user_id = u.id
where public.can_teach_course(e.course_id) or public.is_admin();

grant select on public.course_students to authenticated;

comment on view public.course_students is
  'Datos públicos (sin DNI) + progreso de alumnos inscriptos, visibles solo para el docente del curso o admin. Fuente para paneles de resultados/correcciones/roster (RLS-03, extendida con progreso en el Sprint de deuda funcional E1/E2).';
