-- ============================================================
-- INCADEducativa — Migración 029: vitrina pública de carreras
-- Deuda funcional E1 (FUNCIONALIDADES.md CU-T02/ADR-15): un visitante sin
-- sesión debe poder ver la vitrina de carreras (descripción, materias,
-- salida laboral) con CTA a admisiones presenciales, nunca a compra.
--
-- `careers_select` (001) exigía `auth.uid() is not null` — bloqueaba del
-- todo a un visitante anónimo. Se relaja al mismo criterio que
-- `courses_select` (001): público si está activa/publicado, autenticado
-- solo agrega ver las inactivas si es admin (ya cubierto por
-- `careers_admin`, sin cambios acá).
--
-- Depende de: 001_educativa_core.sql (careers, is_admin).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

drop policy if exists "careers_select" on public.careers;
create policy "careers_select" on public.careers
  for select using (
    activa = true
    or auth.uid() is not null
  );
