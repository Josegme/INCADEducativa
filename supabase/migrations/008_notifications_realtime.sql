-- ============================================================
-- INCADEducativa — Migración 008: Realtime para notificaciones (ETAPA 1)
-- Sprint 7c: Centro de notificaciones + Anuncios del docente (Addendum 02)
-- Depende de: 003 (tablas notifications/announcements/announcement_reads)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- La campana de notificaciones (NotificationBell) escucha INSERTs vía
-- Supabase Realtime filtrados por user_id — la tabla necesita estar en la
-- publicación supabase_realtime (no lo está por defecto).
alter publication supabase_realtime add table public.notifications;
