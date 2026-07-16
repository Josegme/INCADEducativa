-- ============================================================
-- INCADEducativa — Migración 015: Catálogo de planes de membresía (ETAPA 2)
-- Sprint 17-18: `memberships` (002) solo guarda la instancia por usuario
-- (tipo, inicio, fin, creditos_restantes, activa) — no hay catálogo de
-- planes con precio ni créditos incluidos. Esta migración agrega ese
-- catálogo y liga cada membresía al plan + a la suscripción de MercadoPago
-- que la generó (mp_preapproval_id, análogo a mp_preference_id en payments).
-- Depende de: 002_coworking_module.sql ya aplicada.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table public.membership_plans (
  id                 uuid primary key default uuid_generate_v4(),
  tipo               text not null check (tipo in ('mensual','anual')),
  nombre             text not null,
  precio             numeric(10,2) not null,
  creditos_incluidos integer not null,
  activo             boolean not null default true,
  created_at         timestamptz not null default now()
);

alter table public.memberships
  add column plan_id uuid references public.membership_plans(id),
  add column mp_preapproval_id text;

-- Una membresía se inserta como "pendiente" (activa=false) apenas se crea la
-- suscripción en MercadoPago — todavía no tiene fechas reales, el webhook
-- las completa recién cuando la suscripción queda `authorized` (CLAUDE.md
-- regla #9: el webhook es la única fuente de verdad). inicio/fin dejan de
-- ser obligatorios en el momento de la creación.
alter table public.memberships
  alter column inicio drop not null,
  alter column fin drop not null;

-- ── RLS — mismo patrón que locations/spaces (010): lectura pública de
-- planes activos, escritura solo admin ──
alter table public.membership_plans enable row level security;

create policy "membership_plans_select" on public.membership_plans
  for select using (activo = true or public.is_admin());
create policy "membership_plans_admin" on public.membership_plans
  for all using (public.is_admin());

-- `memberships` (002) solo tenía SELECT para el dueño ("memberships_own") —
-- todo INSERT/UPDATE era exclusivo de admin ("memberships_admin"). El flujo
-- de autoservicio necesita que el usuario pueda crear SU PROPIA membresía en
-- estado pendiente (nunca activa=true directo — eso lo hace el webhook de
-- MP, CLAUDE.md regla #9) antes de ir al checkout.
create policy "memberships_self_insert" on public.memberships
  for insert with check (user_id = auth.uid() and activa = false);

-- Deja guardar mp_preapproval_id en la propia fila pendiente (paso 2 del
-- alta, después de crear la suscripción en MP) sin poder auto-activarse:
-- el `with check` exige que siga en activa=false después del update.
create policy "memberships_self_update_pending" on public.memberships
  for update using (user_id = auth.uid() and activa = false)
  with check (user_id = auth.uid() and activa = false);
