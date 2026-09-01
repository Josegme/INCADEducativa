-- ============================================================
-- INCADEducativa — Migración 035: Compra individual de cursos (Etapa 3)
-- Primer entregable de apertura pública: pago de un curso individual vía
-- MercadoPago (CU-T03, Addendum 04) + conversión automática lead→comunidad.
-- Tabla dedicada, separada de `payments` (que está acoplada 1:1 a
-- `bookings` de Coworking — ADR-13, revenue streams separados).
-- NO aplicar contra ninguna DB sin aprobación explícita del usuario.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table public.compras_curso (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  mp_preference_id text,
  mp_payment_id    text unique,
  monto            numeric(10,2) not null,
  descuento_pct    integer not null default 0 check (descuento_pct between 0 and 100),
  tipo_descuento   discount_type not null default 'publico',
  estado           text not null default 'pendiente'
                   check (estado in ('pendiente','aprobado','rechazado','reembolsado')),
  webhook_payload  jsonb,
  created_at       timestamptz not null default now()
);

comment on table public.compras_curso is
  'Ledger de compras individuales de cursos vía MercadoPago (Etapa 3). Sin
  unique(user_id, course_id) a propósito: un usuario puede reintentar una
  compra abandonada; el doble-acceso real ya lo bloquea enrollments.';

create index idx_compras_curso_user   on public.compras_curso(user_id);
create index idx_compras_curso_course on public.compras_curso(course_id);
create index idx_compras_curso_estado on public.compras_curso(estado);

alter table public.compras_curso enable row level security;

-- Sin policy de insert para `authenticated`: la fila la escribe siempre el
-- server action vía el cliente service-role (createAdminClient()), mismo
-- criterio que `payments` — nunca se confía en un monto que mande el
-- navegador.
create policy "compras_curso_select" on public.compras_curso
  for select using (user_id = auth.uid() or public.is_admin());

create policy "compras_curso_admin" on public.compras_curso
  for all using (public.is_admin());

-- ============================================================
-- Función: promote_lead_on_course_payment() — conversión de sistema
-- lead→comunidad al confirmarse el pago de un curso (CU-T03, Addendum 04).
--
-- Por qué NO usa convert_user_role() (migración 004): esa función chequea
-- is_admin() internamente vía auth.uid(), que es null cuando la llama el
-- webhook con el cliente service-role (sin sesión de admin) — el chequeo
-- rechazaría al caller legítimo del sistema. Esta función es una vía nueva,
-- separada, para ese único caso puntual (system-triggered, no admin-triggered),
-- siguiendo el mismo patrón SECURITY DEFINER que ya usa
-- notify_admins_course_submitted (migración 025) para otro caso de "acción
-- de sistema disparada por un no-admin".
--
-- Sin grant a `authenticated` a propósito: el rol service_role de Supabase
-- ya tiene privilegios completos sobre public por defecto, así que el
-- webhook puede llamarla sin grant explícito, pero un usuario `lead`
-- logueado NO puede invocarla directo para auto-promoverse — la ausencia
-- del grant es el límite de seguridad. Sin parámetros de carrera_id/dni:
-- estructuralmente imposible de usar para asignar carrera (regla #12/ADR-15).
-- ============================================================
create or replace function public.promote_lead_on_course_payment(
  p_user_id   uuid,
  p_compra_id uuid
) returns void as $$
declare
  v_old_role user_role;
  v_titulo   text;
begin
  select role into v_old_role from public.users where id = p_user_id;
  if v_old_role is null then
    raise exception 'Usuario % no encontrado', p_user_id;
  end if;

  -- Idempotente: si ya no es lead (reintento de webhook, u otra vía ya lo
  -- convirtió), no es un error, es el caso normal de "nada que hacer".
  if v_old_role <> 'lead' then
    return;
  end if;

  -- Defensa en profundidad: releer el estado real de la compra en vez de
  -- confiar ciegamente en lo que mande el caller.
  if not exists (
    select 1 from public.compras_curso
    where id = p_compra_id and user_id = p_user_id and estado = 'aprobado'
  ) then
    raise exception 'La compra % no está aprobada para el usuario %', p_compra_id, p_user_id;
  end if;

  select c.titulo into v_titulo from public.compras_curso pc
    join public.courses c on c.id = pc.course_id where pc.id = p_compra_id;

  update public.users
  set role         = 'comunidad',
      role_history = role_history || jsonb_build_object(
        'from', v_old_role,
        'to',   'comunidad',
        'at',   now(),
        'by',   'system:compra_curso',
        'referencia_id', p_compra_id
      ),
      updated_at   = now()
  where id = p_user_id;

  insert into public.notifications (user_id, tipo, sender_id, titulo, cuerpo)
  values (
    p_user_id, 'sistema', null,
    '¡Bienvenido a la comunidad INCADE!',
    'Tu compra de "' || coalesce(v_titulo, 'un curso') || '" quedó confirmada y ahora sos parte de la comunidad INCADE.'
  );
end;
$$ language plpgsql security definer set search_path = public;
