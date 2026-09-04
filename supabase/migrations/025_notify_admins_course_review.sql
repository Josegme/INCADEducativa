-- ============================================================
-- INCADEducativa — Migración 025: notificar a los admins cuando un
-- docente envía un curso a revisión
--
-- Bloqueado hasta ahora por la RLS de `notifications` (`notifications_own`,
-- 003): un docente solo puede insertar una notificación con
-- `user_id = auth.uid()`, nunca con el `user_id` de un admin. En vez de
-- relajar esa policy (expondría la lista de admins a insert arbitrario),
-- se agrega una función SECURITY DEFINER — mismo patrón que
-- convert_user_role()/award_points() — que valida que el que llama es el
-- docente asignado al curso y notifica a todos los admins in-app. Devuelve
-- los emails de los admins para que la capa de aplicación dispare el email
-- (Resend no tiene RLS, no hace falta bypass adicional para eso).
--
-- No aplicar contra ninguna DB sin aprobación explícita — mismo criterio
-- que la migración 024.
-- ============================================================

create or replace function public.notify_admins_course_submitted(p_course_id uuid)
returns table(admin_email text) as $$
declare
  v_titulo text;
  v_docente_id uuid;
begin
  select titulo, docente_id into v_titulo, v_docente_id
  from public.courses
  where id = p_course_id;

  if v_docente_id is null or v_docente_id <> auth.uid() then
    raise exception 'Solo el docente asignado al curso puede notificar el envío a revisión';
  end if;

  insert into public.notifications (user_id, tipo, course_id, sender_id, titulo, cuerpo)
  select u.id, 'sistema', p_course_id, auth.uid(),
         'Curso enviado a revisión: ' || coalesce(v_titulo, ''),
         'Un docente envió un curso a revisión. Revisalo en /admin/cursos.'
  from public.users u
  where u.role = 'admin';

  return query
    select u.email from public.users u where u.role = 'admin';
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.notify_admins_course_submitted(uuid) to authenticated;
