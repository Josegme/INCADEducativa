-- ============================================================
-- INCADEducativa — Migración 024: search_path fijo en funciones
-- SECURITY DEFINER / funciones de trigger
-- El linter de Supabase marca como riesgo "Function Search Path Mutable"
-- cualquier función sin search_path fijo: quien la ejecuta puede manipular
-- el search_path de su sesión y hacer que la función resuelva objetos de
-- otro schema (shadowing). Fijar search_path = public cierra ese vector
-- sin tocar la lógica de ninguna función existente.
--
-- Solo agrega ALTER FUNCTION — no reescribe ningún CREATE OR REPLACE.
-- Firmas verificadas contra el archivo fuente de cada función (ver
-- comentario por línea).
--
-- Depende de: 001, 002, 003, 004, 005, 013, 017, 018, 019, 022, 023.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 001_educativa_core.sql
alter function public.is_admin() set search_path = public;
alter function public.is_role(user_role) set search_path = public;
alter function public.verify_certificate(uuid) set search_path = public; -- firma redefinida en 023, misma firma
alter function public.recalculate_progress(uuid, uuid) set search_path = public;
alter function public.trg_recalculate_progress() set search_path = public;

-- 002_coworking_module.sql
alter function public.detect_no_shows() set search_path = public;
alter function public.get_user_discount() set search_path = public;

-- 003_motor_evaluaciones_comunicacion.sql
alter function public.apply_manual_correction() set search_path = public;

-- 004_conversion_roles.sql
alter function public.can_teach_course(uuid) set search_path = public;
alter function public.convert_user_role(uuid, user_role, uuid, text) set search_path = public;

-- 005_rls_fixes_e1.sql
alter function public.award_points(uuid, integer, text, uuid) set search_path = public;

-- 013_space_availability.sql
alter function public.get_occupied_slots(uuid, timestamptz, timestamptz) set search_path = public;

-- 017_coworking_credits.sql
alter function public.detect_completed_bookings() set search_path = public;

-- 018_tutorias.sql
alter function public.detect_completed_tutorias() set search_path = public;

-- 019_talleres.sql
alter function public.get_taller_inscripcion_count(uuid) set search_path = public;

-- 022_career_certificates.sql
alter function public.verify_career_certificate(uuid) set search_path = public;
