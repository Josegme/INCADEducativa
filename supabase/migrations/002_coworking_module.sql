-- ============================================================
-- INCADEducativa — Migración 002: Módulo Coworking (ETAPA 2)
-- Servicio INDEPENDIENTE con revenue propio, acceso público (Addendum 03, ADR-13)
-- Cualquier usuario con registro mínimo puede reservar a precio público.
-- Alumno/docente/coordinador reciben descuento institucional automático por rol.
-- SOLO ejecutar cuando FEATURE_COWORKING = true (semanas 11+)
-- Requiere: 001_educativa_core.sql ya aplicada (usa is_admin(), is_role())
-- Migración 002: E2 — Coworking. Depende de 001. Ejecutar solo al activar FEATURE_COWORKING.
-- ============================================================

create extension if not exists btree_gist;

create type space_type     as enum ('hot_desk','sala_reunion','aula');
create type booking_status as enum ('pendiente','confirmada','en_uso','completada','cancelada','no_show');
create type checkin_method as enum ('qr','manual');
create type discount_type  as enum ('institucional','publico','manual');

-- ── locations (sedes) ────────────────────────────────────────
create table public.locations (
  id         uuid primary key default uuid_generate_v4(),
  nombre     text not null,
  direccion  text not null,
  activa     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── spaces ───────────────────────────────────────────────────
create table public.spaces (
  id           uuid primary key default uuid_generate_v4(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  nombre       text not null,
  tipo         space_type not null,
  capacidad    integer not null default 1,
  precio_hora  numeric(10,2) not null,
  descripcion  text,
  imagen_url   text,
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── bookings ─────────────────────────────────────────────────
create table public.bookings (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  space_id      uuid not null references public.spaces(id) on delete cascade,
  fecha_inicio  timestamptz not null,
  fecha_fin     timestamptz not null,
  estado        booking_status not null default 'pendiente',
  monto         numeric(10,2) not null,
  descuento_pct integer not null default 0 check (descuento_pct between 0 and 100),
  tipo_descuento discount_type not null default 'publico',
  notas         text,
  created_at    timestamptz not null default now(),
  -- CONSTRAINT CRÍTICO: cero doble asignación de espacio
  constraint no_overlap exclude using gist (
    space_id with =,
    tstzrange(fecha_inicio, fecha_fin) with &&
  ) where (estado in ('pendiente','confirmada','en_uso'))
);

-- ── payments ─────────────────────────────────────────────────
-- El webhook de MercadoPago es la ÚNICA fuente de verdad del estado.
create table public.payments (
  id               uuid primary key default uuid_generate_v4(),
  booking_id       uuid not null references public.bookings(id) on delete cascade,
  mp_preference_id text,
  mp_payment_id    text unique,
  monto            numeric(10,2) not null,
  estado           text not null default 'pendiente'
                   check (estado in ('pendiente','aprobado','rechazado','reembolsado')),
  webhook_payload  jsonb,
  created_at       timestamptz not null default now()
);

-- ── memberships ──────────────────────────────────────────────
create table public.memberships (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade,
  tipo               text not null check (tipo in ('mensual','anual')),
  inicio             date not null,
  fin                date not null,
  creditos_restantes integer not null default 0,
  activa             boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ── checkins ─────────────────────────────────────────────────
create table public.checkins (
  id         uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  metodo     checkin_method not null default 'qr',
  registrado_por uuid references public.users(id),
  timestamp  timestamptz not null default now()
);

-- ── maintenance_incidents (incidencias por espacio) ──────────
create table public.maintenance_incidents (
  id          uuid primary key default uuid_generate_v4(),
  space_id    uuid not null references public.spaces(id) on delete cascade,
  descripcion text not null,
  resuelta    boolean not null default false,
  reportada_por uuid references public.users(id),
  created_at  timestamptz not null default now(),
  resuelta_at timestamptz
);

-- ── coupons (cupones y early bird) ───────────────────────────
create table public.coupons (
  id            uuid primary key default uuid_generate_v4(),
  codigo        text not null unique,
  descuento_pct integer not null check (descuento_pct between 1 and 100),
  valido_desde  date not null,
  valido_hasta  date not null,
  usos_maximos  integer,
  usos_actuales integer not null default 0,
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── Índices ──────────────────────────────────────────────────
create index idx_bookings_user    on public.bookings(user_id);
create index idx_bookings_space   on public.bookings(space_id, fecha_inicio);
create index idx_bookings_estado  on public.bookings(estado);
create index idx_bookings_fecha   on public.bookings(fecha_inicio) where estado in ('confirmada','en_uso');
create index idx_spaces_location  on public.spaces(location_id);
create index idx_payments_booking on public.payments(booking_id);
create index idx_memberships_user on public.memberships(user_id) where activa = true;

-- ── Función: detectar no-shows (llamar desde cron cada 5 min) ─
create or replace function public.detect_no_shows()
returns integer as $$
declare affected integer;
begin
  with marked as (
    update public.bookings b
    set estado = 'no_show'
    where b.estado = 'confirmada'
      and b.fecha_inicio < now() - interval '15 minutes'
      and not exists (select 1 from public.checkins c where c.booking_id = b.id)
    returning b.id
  )
  select count(*) into affected from marked;
  return affected;
end;
$$ language plpgsql security definer;

-- ── Función: descuento institucional automático ──────────────
-- Devuelve % de descuento según el rol del usuario autenticado.
-- Alumno, docente y coordinador activos reciben descuento institucional.
-- Comunidad / lead pagan precio público (0%).
create or replace function public.get_user_discount()
returns integer as $$
  select case
    when exists (select 1 from public.users where id = auth.uid()
                 and role in ('alumno','docente','coordinador') and activo = true) then 30
    else 0
  end;
$$ language sql security definer stable;

-- ── Vista: ingresos del Coworking (revenue stream independiente) ─
-- Reporte financiero SEPARADO del módulo educativo (Addendum 03 §5.4, ADR-13).
-- Desglose por sede y por tipo de usuario (institucional vs público).
create or replace view public.coworking_revenue
with (security_invoker = true) as
select
  date_trunc('month', p.created_at)                        as periodo,
  l.id                                                      as location_id,
  l.nombre                                                  as sede,
  b.tipo_descuento,
  count(*)                                                  as reservas_pagadas,
  sum(p.monto)                                              as ingresos
from public.payments p
join public.bookings b  on b.id = p.booking_id
join public.spaces  s   on s.id = b.space_id
join public.locations l on l.id = s.location_id
where p.estado = 'aprobado'
group by 1, 2, 3, 4;

-- ── RLS Coworking — usando is_admin() de la migración 001 ────
alter table public.locations             enable row level security;
alter table public.spaces                enable row level security;
alter table public.bookings              enable row level security;
alter table public.payments              enable row level security;
alter table public.memberships           enable row level security;
alter table public.checkins              enable row level security;
alter table public.maintenance_incidents enable row level security;
alter table public.coupons               enable row level security;

-- locations y spaces: visibles para autenticados; solo admin escribe
create policy "locations_select" on public.locations
  for select using (auth.uid() is not null);
create policy "locations_admin" on public.locations
  for all using (public.is_admin());

create policy "spaces_select" on public.spaces
  for select using (auth.uid() is not null);
create policy "spaces_admin" on public.spaces
  for all using (public.is_admin());

-- bookings: cualquier usuario autenticado (alumno, comunidad, lead, docente)
-- crea y ve sus propias reservas. Admin y coordinador con acceso ampliado.
-- El acceso público se garantiza porque user_id = auth.uid() aplica a TODO rol.
create policy "bookings_own" on public.bookings
  for all using (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_role('coordinador')
  );

-- payments: dueño de la reserva ve los propios; admin todos
create policy "payments_select" on public.payments
  for select using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
    or public.is_admin()
  );
create policy "payments_admin" on public.payments
  for all using (public.is_admin());

-- memberships: usuario la propia; admin todas
create policy "memberships_own" on public.memberships
  for select using (user_id = auth.uid() or public.is_admin());
create policy "memberships_admin" on public.memberships
  for all using (public.is_admin());

-- checkins: admin y coordinador registran; usuario ve los de sus reservas
create policy "checkins_select" on public.checkins
  for select using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
    or public.is_admin()
  );
create policy "checkins_write" on public.checkins
  for insert with check (public.is_admin() or public.is_role('coordinador'));

-- maintenance: solo admin
create policy "maintenance_admin" on public.maintenance_incidents
  for all using (public.is_admin());

-- coupons: lectura para validar; escritura solo admin
create policy "coupons_select" on public.coupons
  for select using (auth.uid() is not null and activo = true);
create policy "coupons_admin" on public.coupons
  for all using (public.is_admin());

-- ── Seed: sedes INCADE ───────────────────────────────────────
insert into public.locations (nombre, direccion) values
  ('INCADE Sede Central', 'Posadas, Misiones — Sede 1'),
  ('INCADE Sede Norte',   'Posadas, Misiones — Sede 2');
