-- ============================================================
-- INCADEducativa — Migración 011: Realtime de reservas (ETAPA 2)
-- Sprint 13-14: el calendario de disponibilidad de BookingForm necesita
-- refrescarse en vivo cuando otro usuario toma un horario. Se agrega
-- public.bookings a la publicación supabase_realtime (mismo patrón que
-- 008_notifications_realtime.sql para public.notifications).
-- Depende de: 002_coworking_module.sql ya aplicada.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter publication supabase_realtime add table public.bookings;
