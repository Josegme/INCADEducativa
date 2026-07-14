-- ============================================================
-- INCADEducativa — Migración 010: Lectura pública de Coworking (ETAPA 2)
-- Sprint 11-12: fix de RLS — la landing /servicios/coworking debe verse
-- SIN login (Addendum 03 §2.1, ADR-13), pero 002_coworking_module.sql
-- restringía "locations_select"/"spaces_select" a auth.uid() is not null,
-- lo que bloqueaba a los visitantes anónimos. Se reemplaza por lectura
-- pública de sedes/espacios ACTIVOS; el admin sigue viendo todo
-- (incluidos inactivos) vía la policy "for all" existente basada en
-- is_admin().
-- Depende de: 002_coworking_module.sql ya aplicada.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

drop policy if exists "locations_select" on public.locations;
create policy "locations_select_public" on public.locations
  for select using (activa = true);

drop policy if exists "spaces_select" on public.spaces;
create policy "spaces_select_public" on public.spaces
  for select using (activo = true);
