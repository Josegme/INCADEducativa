-- ============================================================
-- INCADEducativa — Migración 020: Feature flags editables desde la UI
-- CLAUDE.md v3.6, regla #6: los flags pasan a resolverse desde esta tabla,
-- con fallback a la env var si no hay fila (ver src/lib/flags.ts). Sin fila
-- para un flag → se sigue comportando exactamente como hoy (env var).
--
-- Solo los módulos de servicio (E2/E3) son togglables desde /admin — el
-- núcleo `educativa` (E1, producto central) no tiene UI de apagado, aunque
-- la tabla no lo restringe a nivel de schema (ver COMPONENTS.md §60).
--
-- Depende de: 001_educativa_core.sql (is_admin()).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table public.feature_flags (
  flag        text primary key,
  activo      boolean not null default false,
  updated_by  uuid references public.users(id) on delete set null,
  updated_at  timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

-- Lectura pública (incluso sin sesión): páginas públicas como
-- /servicios/coworking dependen de flags.coworking para renderizar server-side.
create policy "feature_flags_select" on public.feature_flags
  for select using (true);

create policy "feature_flags_admin_write" on public.feature_flags
  for all using (public.is_admin()) with check (public.is_admin());

create trigger trg_feature_flags_updated
  before update on public.feature_flags
  for each row execute function update_updated_at();
