-- ============================================================
-- INCADEducativa — Migración 016: Recordatorios + cron real de Coworking (ETAPA 2)
-- Sprint 17-18. `detect_no_shows()` (002) ya existe pero nada la disparaba
-- automáticamente — Sprint 15-16 solo agregó un botón manual. Esta migración:
-- (a) agrega las 2 columnas que necesita /api/cron/coworking para no
--     reenviar el mismo aviso dos veces, (b) programa pg_cron para correr
--     detect_no_shows() cada 5 min (100% en SQL, no depende de nada externo),
--     (c) programa un segundo job que golpea /api/cron/coworking vía pg_net
--     para el envío real de email/WhatsApp (sendEmail/sendWhatsapp viven en
--     TypeScript, no se duplica esa lógica acá).
--
-- OJO — pg_net corre en la nube de Supabase: NO puede alcanzar http://localhost.
-- El segundo job (coworking-notify) queda programado pero no va a completar
-- una llamada real hasta reemplazar <APP_URL>/<CRON_SECRET> por los valores
-- reales después de deployar. Mientras tanto la ruta se prueba a mano con
-- curl (ver docs de verificación del sprint).
--
-- Depende de: 002_coworking_module.sql ya aplicada.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.bookings
  add column recordatorio_enviado boolean not null default false,
  add column no_show_notificado   boolean not null default false;

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'coworking-detect-no-shows',
  '*/5 * * * *',
  $$select public.detect_no_shows();$$
);

-- Reemplazar <APP_URL> (ej. https://incadeducativa.com) y <CRON_SECRET>
-- (mismo valor que la env var CRON_SECRET en producción) antes de correr
-- esta parte, o dejarla comentada hasta el deploy.
select cron.schedule(
  'coworking-notify',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := '<APP_URL>/api/cron/coworking',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')
  );
  $$
);
