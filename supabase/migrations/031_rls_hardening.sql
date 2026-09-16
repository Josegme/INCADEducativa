-- ============================================================
-- INCADEducativa — Migración 024: Hardening de RLS post code-review
-- Cierra 4 agujeros donde una policy `FOR ALL`/`FOR UPDATE` con solo
-- `USING` (sin `WITH CHECK`) dejaba que el propio usuario escribiera
-- columnas que solo debían moverse desde el servidor:
--   1. public.users              — auto-escalación de rol/puntos/carrera
--   2. public.evaluations        — respuesta_correcta visible a cualquiera
--   3. public.evaluation_attempts — alumno se auto-aprueba el examen
--   4. public.bookings            — reserva se auto-confirma sin pagar
-- Requiere: 001, 002, 003, 004 ya aplicadas.
-- ============================================================

-- ============================================================
-- 1. users — trigger que protege columnas sensibles del propio UPDATE
-- ============================================================
-- `users_update_own` (001) es `for update using (id = auth.uid() or
-- is_admin())` sin `with check`: Postgres reusa el USING como WITH CHECK,
-- que solo fija `id` — cualquier otra columna, incluida `role`, queda
-- libre. Un trigger es más seguro que un GRANT/REVOKE por columna acá
-- porque "admin" es un dato de fila (public.users.role), no un rol de
-- Postgres — el service_role (siempre admin de facto) y las Server
-- Actions que ya validan is_admin() en código siguen andando igual.
create or replace function public.guard_users_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- El cliente service_role (admin.ts) ya corre detrás de un requireAdmin()
  -- en la Server Action — confiar en eso, igual que el resto del proyecto.
  if auth.role() = 'service_role' then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'No se puede modificar el id de usuario';
  end if;

  if new.role is distinct from old.role
     or new.puntos is distinct from old.puntos
     or new.carrera_id is distinct from old.carrera_id
     or new.can_teach is distinct from old.can_teach
     or new.role_history is distinct from old.role_history
     or new.activo is distinct from old.activo
     or new.dni is distinct from old.dni
  then
    raise exception 'Solo el administrador puede modificar esos campos — usá convert_user_role() o las acciones de /admin';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_users_guard_self_update on public.users;
create trigger trg_users_guard_self_update
  before update on public.users
  for each row execute function public.guard_users_self_update();

-- ============================================================
-- 2. evaluations — la clave de respuestas (respuesta_correcta /
--    respuestas_correctas) ya no viaja a cualquier autenticado
-- ============================================================
-- Antes: `for select using (auth.uid() is not null)` — cualquier usuario
-- logueado podía leer `preguntas` completo, con la clave de respuestas
-- adentro. Ahora solo admin/docente-dueño-del-curso leen la tabla cruda;
-- el alumno recibe las preguntas SIN esos campos vía la función de abajo.
drop policy if exists "evaluations_select" on public.evaluations;
create policy "evaluations_select" on public.evaluations
  for select using (
    public.is_admin() or public.can_teach_course(course_id)
  );

-- Devuelve la evaluación con `preguntas` despojado de las claves de
-- respuesta correcta, solo si el que llama está admin, es el docente del
-- curso, o está inscripto en él. security definer para poder leer
-- `evaluations`/`enrollments` sin que la RLS de arriba se lo impida.
create or replace function public.get_evaluation_for_attempt(p_evaluation_id uuid)
returns table (
  id uuid,
  titulo text,
  tipo evaluation_type,
  course_id uuid,
  module_id uuid,
  nota_minima integer,
  config jsonb,
  preguntas jsonb
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_course_id uuid;
begin
  select e.course_id into v_course_id from public.evaluations e where e.id = p_evaluation_id;

  if v_course_id is null then
    return;
  end if;

  if not (
    public.is_admin()
    or public.can_teach_course(v_course_id)
    or exists (
      select 1 from public.enrollments en
      where en.course_id = v_course_id and en.user_id = auth.uid()
    )
  ) then
    return;
  end if;

  return query
    select
      e.id, e.titulo, e.tipo, e.course_id, e.module_id, e.nota_minima, e.config,
      coalesce(
        (
          select jsonb_agg(q - 'respuesta_correcta' - 'respuestas_correctas')
          from jsonb_array_elements(e.preguntas) q
        ),
        '[]'::jsonb
      ) as preguntas
    from public.evaluations e
    where e.id = p_evaluation_id;
end;
$$;

grant execute on function public.get_evaluation_for_attempt(uuid) to authenticated;

-- ============================================================
-- 3. evaluation_attempts — el alumno ya no puede escribir su propia nota
-- ============================================================
-- Antes: `attempts_own` era `for all using (user_id = auth.uid() or
-- is_admin())` — el alumno podía UPDATE directo de nota/aprobado/estado.
-- Ahora: solo puede SELECT su intento e INSERT uno nuevo en 'en_curso'
-- sin nota. El único UPDATE de grading corre server-side con el cliente
-- service_role (submitAttemptAction) o vía el trigger de manual_corrections
-- (apply_manual_correction, ya security definer — no se toca acá).
drop policy if exists "attempts_own" on public.evaluation_attempts;

create policy "attempts_select_own" on public.evaluation_attempts
  for select using (user_id = auth.uid() or public.is_admin());

create policy "attempts_insert_own" on public.evaluation_attempts
  for insert with check (
    (
      user_id = auth.uid()
      and estado = 'en_curso'
      and nota is null
      and aprobado is null
      and score_auto is null
      and score_manual is null
    )
    or public.is_admin()
  );

create policy "attempts_admin_all" on public.evaluation_attempts
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 4. bookings — el estado de pago ya no lo decide el cliente
-- ============================================================
-- Antes: `bookings_own` era `for all using (user_id = auth.uid() or
-- is_admin() or is_role('coordinador'))` — el dueño podía INSERT/UPDATE
-- con estado='confirmada' y cualquier monto, sin pasar por MercadoPago
-- (viola CLAUDE.md regla #9). Ahora un usuario común solo puede crear su
-- reserva en 'pendiente' y solo puede pasarla a 'cancelada'; confirmar
-- sigue siendo exclusivo del webhook (service_role) o de admin/coordinador.
drop policy if exists "bookings_own" on public.bookings;

create policy "bookings_select" on public.bookings
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_role('coordinador')
  );

create policy "bookings_insert" on public.bookings
  for insert with check (
    (user_id = auth.uid() and estado = 'pendiente')
    or public.is_admin()
    or public.is_role('coordinador')
  );

create policy "bookings_update" on public.bookings
  for update using (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_role('coordinador')
  )
  with check (
    (user_id = auth.uid() and estado = 'cancelada')
    or public.is_admin()
    or public.is_role('coordinador')
  );

create policy "bookings_delete" on public.bookings
  for delete using (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_role('coordinador')
  );
