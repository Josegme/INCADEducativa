-- ============================================================
-- INCADEducativa — Migración 028: Coordinador — permiso educativo
-- Deuda funcional E1 (FUNCIONALIDADES.md §3.2 "Coordinador de cursos —
-- Educativo: cargar materiales y contenidos en cursos asignados, ver
-- progreso y asistencia de alumnos", requiere permiso habilitado por Admin).
--
-- No reusa can_teach_course() (004) porque ese mecanismo asume dueño único
-- del curso (courses.docente_id) — acá un coordinador puede estar asignado
-- a varios cursos SIN ser su docente. Se modela como tabla de asignación
-- propia, admin-only para escribir.
--
-- Alcance deliberadamente acotado (no es un docente completo): solo puede
-- cargar/borrar materiales ADJUNTOS (lesson_attachments, 027) sobre clases
-- ya existentes y ver el progreso (course_students, 021) — no puede crear/
-- editar/borrar módulos, clases, evaluaciones, ni enviar el curso a
-- revisión (regla #1 de CLAUDE.md sigue intacta, ni siquiera aplica acá
-- porque el coordinador nunca tiene acceso de escritura sobre `courses`).
--
-- Depende de: 001 (is_admin, courses, users), 021 (course_students),
-- 027 (lesson_attachments).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table public.course_coordinadores (
  course_id      uuid not null references public.courses(id) on delete cascade,
  coordinador_id uuid not null references public.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (course_id, coordinador_id)
);

alter table public.course_coordinadores enable row level security;

create policy "course_coordinadores_admin_write" on public.course_coordinadores
  for all using (public.is_admin());

create policy "course_coordinadores_select_own" on public.course_coordinadores
  for select using (coordinador_id = auth.uid() or public.is_admin());

-- ============================================================
-- Función: can_coordinate_course() — gate del permiso educativo del
-- coordinador. Requiere asignación explícita (admin) Y rol 'coordinador'
-- vigente (si el admin lo convierte a otro rol, pierde el acceso aunque
-- la fila de asignación quede, igual que can_teach_course() exige
-- role='docente' o can_teach=true).
-- ============================================================
create or replace function public.can_coordinate_course(p_course_id uuid)
returns boolean as $$
  select exists (
    select 1
    from public.course_coordinadores cc
    join public.users u on u.id = cc.coordinador_id
    where cc.coordinador_id = auth.uid()
      and cc.course_id = p_course_id
      and u.role = 'coordinador'
  );
$$ language sql security definer stable set search_path = public;

-- Extiende la escritura de adjuntos (027) para incluir al coordinador
-- asignado, además del docente dueño / rol dual.
drop policy if exists "lesson_attachments_write" on public.lesson_attachments;
create policy "lesson_attachments_write" on public.lesson_attachments
  for all using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_id
        and (public.can_teach_course(m.course_id) or public.can_coordinate_course(m.course_id))
    )
    or public.is_admin()
  );

-- Extiende la vista de progreso (021) para incluir al coordinador asignado.
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
where public.can_teach_course(e.course_id) or public.can_coordinate_course(e.course_id) or public.is_admin();

grant select on public.course_students to authenticated;

comment on view public.course_students is
  'Datos públicos (sin DNI) + progreso de alumnos inscriptos, visibles para el docente del curso, un coordinador asignado (028), o admin.';
