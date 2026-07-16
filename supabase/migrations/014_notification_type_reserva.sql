-- ============================================================
-- INCADEducativa — Migración 014: Notificación de reserva (ETAPA 2)
-- Sprint 15-16: cancelar una reserva de Coworking dispara notifyUsers()
-- (src/lib/notifications.ts, mismo patrón que reviewActions.ts), que necesita
-- un tipo de notification_type dedicado en vez de reusar 'sistema'.
-- Depende de: 003_motor_evaluaciones_comunicacion.sql ya aplicada (define
-- el enum notification_type).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter type public.notification_type add value 'reserva';
