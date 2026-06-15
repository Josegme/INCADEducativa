-- ============================================================
-- INCADEducativa — Migración 005: Fixes de RLS + Ledger + Constraints (ETAPA 1)
-- Resuelve hallazgos de la auditoría pre-desarrollo:
--   RLS-01  enrollments: lectura del docente sobre inscriptos de sus cursos
--   RLS-02  lesson_progress: lectura de admin y docente del curso
--   RLS-03  users: lectura acotada del docente SIN exponer DNI (vía vista)
--   SEG-01  points_log: solo admin/servidor insertan; función award_points()
--   DAT-03  announcements.sender_id: drop NOT NULL (compatible con ON DELETE SET NULL)
-- Migración 005: E1 — Fixes RLS + ledger + constraints. Depende de 001, 003, 004.
-- Ejecutar en: Supabase Dashboard > SQL Editor (después de 001, 003 y 004)
-- ============================================================

-- ============================================================
-- RLS-01 — enrollments: el docente ve los inscriptos de sus cursos
-- (admin ya cubierto por la policy "enrollments_own" de 001)
-- Usa can_teach_course() (004) para cubrir rol docente y rol dual can_teach.
-- ============================================================
create policy "enrollments_docente_read" on public.enrollments
  for select using (public.can_teach_course(course_id));

-- ============================================================
-- RLS-02 — lesson_progress: admin y docente del curso pueden leer el progreso
-- Se recrea "lp_own" (001) para incluir a is_admin(), y se agrega lectura docente.
-- ============================================================
drop policy if exists "lp_own" on public.lesson_progress;
create policy "lp_own" on public.lesson_progress
  for all using (user_id = auth.uid() or public.is_admin());

create policy "lp_docente_read" on public.lesson_progress
  for select using (
    exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_id
        and public.can_teach_course(m.course_id)
    )
  );

-- ============================================================
-- RLS-03 — users: el docente necesita nombre/avatar/email de sus alumnos
-- para los paneles de resultados y correcciones, PERO no debe ver el DNI.
-- RLS es a nivel de FILA y no puede ocultar columnas; por eso se expone una
-- vista de columnas seguras restringida a los cursos que dicta el llamante.
-- (security_invoker = false → corre como owner; el WHERE limita el acceso).
-- ============================================================
create or replace view public.course_students
with (security_invoker = false) as
select distinct
  u.id,
  u.nombre,
  u.apellido,
  u.avatar_url,
  u.email,
  e.course_id
from public.users u
join public.enrollments e on e.user_id = u.id
where public.can_teach_course(e.course_id) or public.is_admin();

grant select on public.course_students to authenticated;

comment on view public.course_students is
  'Datos públicos (sin DNI) de alumnos inscriptos, visibles solo para el docente del curso o admin. Fuente para paneles de resultados/correcciones (RLS-03).';

-- ============================================================
-- SEG-01 — points_log: cerrar el auto-insert del propio usuario.
-- El ledger sigue siendo append-only (triggers de 001). Solo admin o el
-- servidor (service_role, que bypasea RLS) pueden insertar movimientos.
-- award_points() es la vía controlada de acreditación.
-- ============================================================
drop policy if exists "points_insert" on public.points_log;
create policy "points_insert" on public.points_log
  for insert with check (public.is_admin());

-- Vía única y controlada de acreditación de puntos.
-- Inserta el movimiento en el ledger y sincroniza el total cacheado users.puntos.
-- SECURITY DEFINER: se invoca desde el servidor (service_role) o desde triggers
-- internos del sistema. NO se otorga execute a 'authenticated' para no reabrir SEG-01.
create or replace function public.award_points(
  p_user_id uuid,
  p_amount  integer,
  p_reason  text,
  p_ref     uuid default null
) returns void as $$
begin
  insert into public.points_log (user_id, puntos, motivo, referencia_id)
  values (p_user_id, p_amount, p_reason, p_ref);

  update public.users
  set puntos = puntos + p_amount
  where id = p_user_id;
end;
$$ language plpgsql security definer;

revoke all on function public.award_points(uuid, integer, text, uuid) from public;
revoke all on function public.award_points(uuid, integer, text, uuid) from authenticated;

-- ============================================================
-- DAT-03 — announcements.sender_id: el ON DELETE SET NULL de 003 entra en
-- conflicto con el NOT NULL. Se permite NULL para que borrar al emisor no falle.
-- ============================================================
alter table public.announcements alter column sender_id drop not null;
