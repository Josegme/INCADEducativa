-- ============================================================
-- INCADEducativa — Migración 004: Conversión de Roles y Casos de Transición
-- Implementa Addendum 04 (ADR-15 carreras exclusivas, ADR-16 conversión aditiva + rol dual)
-- Requiere: 001_educativa_core.sql y 003_motor_evaluaciones_comunicacion.sql aplicadas
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Migración 004: E1 — Conversión de roles. Depende de 001, 003. No agrega tablas.
-- ============================================================

-- ── PASO 1: agregar el rol 'lead' al enum ───────────────────
-- IMPORTANTE: ALTER TYPE ... ADD VALUE debe COMMITear antes de que el valor
-- pueda usarse como literal. Esta migración NO usa 'lead' como literal más
-- abajo, por lo que es seguro en un solo script. Si en el futuro se necesita
-- referenciar 'lead' en el mismo script, ejecutar este ALTER por separado primero.
alter type user_role add value if not exists 'lead';

-- ── PASO 2: campos de conversión en users ───────────────────
-- dni y carrera_id YA existen en 001 — no se recrean.
alter table public.users
  add column if not exists can_teach    boolean not null default false,
  add column if not exists role_history jsonb   not null default '[]'::jsonb;

comment on column public.users.can_teach is
  'Habilita rol dual docente: el usuario puede dictar los cursos donde es docente_id, sin cambiar su rol base.';
comment on column public.users.role_history is
  'Log append-only de conversiones de rol: [{from,to,at,by}]. Auditoría — no editar manualmente.';

-- ============================================================
-- Función: can_teach_course() — gate del rol dual para RLS
-- Devuelve true si el usuario autenticado es docente_id del curso Y
-- tiene rol 'docente' (rol base) o can_teach = true (alumno habilitado).
-- Centraliza la regla de escritura de contenido docente.
-- ============================================================
create or replace function public.can_teach_course(p_course_id uuid)
returns boolean as $$
  select exists (
    select 1
    from public.users u
    join public.courses c on c.docente_id = u.id
    where u.id = auth.uid()
      and c.id = p_course_id
      and (u.role = 'docente' or u.can_teach = true)
  );
$$ language sql security definer stable;

-- ============================================================
-- Función: convert_user_role() — única vía de conversión de rol
-- Solo Admin. Aditiva (no toca historial). Asigna carrera/DNI solo
-- si el destino es 'alumno'. Registra en role_history y notifica.
-- ============================================================
create or replace function public.convert_user_role(
  p_user_id    uuid,
  p_new_role   user_role,
  p_carrera_id uuid default null,
  p_dni        text default null
) returns void as $$
declare
  v_old_role user_role;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede convertir roles';
  end if;

  -- Las carreras solo se asignan al pasar a alumno (ADR-15)
  if p_carrera_id is not null and p_new_role <> 'alumno' then
    raise exception 'Solo se puede asignar carrera al convertir a alumno';
  end if;

  select role into v_old_role from public.users where id = p_user_id;
  if v_old_role is null then
    raise exception 'Usuario % no encontrado', p_user_id;
  end if;

  update public.users
  set role         = p_new_role,
      carrera_id   = coalesce(p_carrera_id, carrera_id),
      dni          = coalesce(p_dni, dni),
      role_history = role_history || jsonb_build_object(
        'from', v_old_role,
        'to',   p_new_role,
        'at',   now(),
        'by',   auth.uid()
      ),
      updated_at   = now()
  where id = p_user_id;

  -- Notificación de sistema al usuario convertido
  insert into public.notifications (user_id, tipo, sender_id, titulo, cuerpo)
  values (
    p_user_id,
    'sistema',
    auth.uid(),
    'Tu cuenta fue actualizada',
    'Tu perfil cambió a ' || p_new_role || '. Ya podés acceder a tus nuevos beneficios.'
  );
end;
$$ language plpgsql security definer;

grant execute on function public.convert_user_role(uuid, user_role, uuid, text) to authenticated;

-- ============================================================
-- RLS: extender escritura de contenido docente con can_teach_course()
-- Reemplaza el chequeo crudo docente_id = auth.uid() por la función,
-- que cubre tanto al rol 'docente' como al alumno con can_teach.
-- ============================================================

-- courses (001)
drop policy if exists "courses_docente_write" on public.courses;
create policy "courses_docente_write" on public.courses
  for update using (
    public.can_teach_course(id) and estado in ('borrador','revision')
  );

-- modules (001)
drop policy if exists "modules_write" on public.modules;
create policy "modules_write" on public.modules
  for all using (
    public.is_admin() or public.can_teach_course(course_id)
  );

-- lessons (001) — el curso se obtiene vía el módulo padre
drop policy if exists "lessons_write" on public.lessons;
create policy "lessons_write" on public.lessons
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.modules m
      where m.id = module_id and public.can_teach_course(m.course_id)
    )
  );

-- evaluations (003)
drop policy if exists "evaluations_write" on public.evaluations;
create policy "evaluations_write" on public.evaluations
  for all using (
    public.is_admin() or public.can_teach_course(course_id)
  );

-- announcements (003)
drop policy if exists "announcements_write" on public.announcements;
create policy "announcements_write" on public.announcements
  for all using (
    public.is_admin()
    or public.is_role('coordinador')
    or public.can_teach_course(course_id)
  );
