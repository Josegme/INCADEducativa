-- ============================================================
-- INCADEducativa — Migración 036: Suscripción mensual al catálogo (Etapa 3)
-- Segundo entregable de apertura pública: mismo mecanismo que las
-- membresías de Coworking (015_membership_plans.sql) — plan
-- admin-configurable + MercadoPago PreApproval — pero en tablas propias,
-- separadas de `membership_plans`/`memberships` (ADR-13, revenue streams
-- separados; además `creditos_*` tiene semántica específica de Coworking
-- que no aplica acá).
-- NO aplicar contra ninguna DB sin aprobación explícita del usuario.
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- uuid_generate_v4() calificado como extensions.uuid_generate_v4(): el
-- runner de `supabase db push` no incluye el schema `extensions` en el
-- search_path de la sesión (a diferencia del SQL Editor del Dashboard),
-- así que la llamada sin calificar falla con "function does not exist"
-- (mismo bug ya resuelto en la migración 022).
-- ============================================================

create table public.catalogo_planes (
  id         uuid primary key default extensions.uuid_generate_v4(),
  nombre     text not null,
  precio     numeric(10,2) not null,
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.catalogo_planes is
  'Planes de suscripción mensual al catálogo educativo. Sin columna `tipo`
  (a diferencia de membership_plans): el spec solo pide cadencia mensual.';

create table public.catalogo_suscripciones (
  id                uuid primary key default extensions.uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  plan_id           uuid references public.catalogo_planes(id),
  monto             numeric(10,2) not null,
  descuento_pct     integer not null default 0 check (descuento_pct between 0 and 100),
  tipo_descuento    discount_type not null default 'publico',
  mp_preapproval_id text,
  activa            boolean not null default false,
  inicio            date,
  fin               date,
  created_at        timestamptz not null default now()
);

create index idx_catalogo_suscripciones_user on public.catalogo_suscripciones(user_id);
create index idx_catalogo_suscripciones_mp   on public.catalogo_suscripciones(mp_preapproval_id);

alter table public.catalogo_planes enable row level security;

create policy "catalogo_planes_select" on public.catalogo_planes
  for select using (activo = true or public.is_admin());

create policy "catalogo_planes_admin" on public.catalogo_planes
  for all using (public.is_admin());

alter table public.catalogo_suscripciones enable row level security;

create policy "catalogo_suscripciones_select" on public.catalogo_suscripciones
  for select using (user_id = auth.uid() or public.is_admin());

-- Auto-servicio acotado — mismo patrón que memberships_self_insert/
-- memberships_self_update_pending (015_membership_plans.sql): el usuario
-- puede crear/actualizar su propia fila MIENTRAS sigue pendiente; activarla
-- es exclusivo del webhook (service-role), nunca del propio usuario.
create policy "catalogo_suscripciones_self_insert" on public.catalogo_suscripciones
  for insert with check (user_id = auth.uid() and activa = false);

create policy "catalogo_suscripciones_self_update_pending" on public.catalogo_suscripciones
  for update using (user_id = auth.uid() and activa = false)
  with check (user_id = auth.uid() and activa = false);

create policy "catalogo_suscripciones_admin" on public.catalogo_suscripciones
  for all using (public.is_admin());

-- ============================================================
-- Función: has_active_course_subscription() — gate de acceso perezoso al
-- catálogo. Mismo patrón SECURITY DEFINER stable que is_admin()/
-- can_teach_course() (001/004). La usa cursos/[slug]/page.tsx para decidir
-- si mostrar SubscriptionAccessButton, y enrollViaSubscriptionAction()
-- antes de insertar la fila de enrollments.
-- ============================================================
create or replace function public.has_active_course_subscription()
returns boolean as $$
  select exists (
    select 1 from public.catalogo_suscripciones
    where user_id = auth.uid() and activa = true and fin >= current_date
  );
$$ language sql security definer stable;
