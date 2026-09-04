-- ============================================================
-- INCADEducativa — Migración 037: Nurturing de leads días 1/3/7 (Etapa 3, T12)
-- Mismo patrón que 016 (Coworking) y 018 (Tutorías): columnas de dedupe en
-- la tabla dueña del dato + un job de pg_cron que golpea la ruta de
-- Next.js vía pg_net (la lógica de negocio vive en TypeScript, no se
-- duplica en SQL).
--
-- OJO — pg_net corre en la nube de Supabase: NO puede alcanzar
-- http://localhost. El job queda programado pero no completa una llamada
-- real hasta reemplazar <APP_URL> y <CRON_SECRET> por los valores reales
-- después de deployar. Mientras tanto la ruta se prueba a mano con curl.
--
-- NO aplicar contra ninguna DB sin aprobación explícita del usuario.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.users
  add column nurturing_d1_enviado boolean not null default false,
  add column nurturing_d3_enviado boolean not null default false,
  add column nurturing_d7_enviado boolean not null default false;

comment on column public.users.nurturing_d1_enviado is
  'Nurturing post-taller gratuito (T12) — solo tiene sentido para role=lead; queda en false sin efecto para el resto de los roles.';

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Reemplazar <APP_URL> (ej. https://incadeducativa.com) y <CRON_SECRET>
-- (mismo valor que la env var CRON_SECRET en producción) antes de correr
-- esta parte, o dejarla comentada hasta el deploy.
select cron.schedule(
  'nurturing-notify',
  '0 * * * *',
  $$
  select net.http_post(
    url := '<APP_URL>/api/cron/nurturing',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')
  );
  $$
);
