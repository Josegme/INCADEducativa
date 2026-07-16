-- ============================================================
-- INCADEducativa — Migración 017: Canje de puntos por horas de Coworking
-- + cierre automático de reservas (ETAPA 2)
-- Sprint 19-20. Dos cosas sin relación directa entre sí, agrupadas porque
-- ambas cierran el checklist de LIFECYCLE_PLAN.md de este sprint:
-- (a) saldo de créditos canjeados con puntos de la plataforma educativa
--     (independiente de los créditos de membresía de la 015 — un usuario
--     puede tener ambos, se consumen por separado);
-- (b) detect_completed_bookings(): hueco real encontrado en la exploración
--     — existe detect_no_shows() (002) pero nada pasaba una reserva a
--     'completada' cuando terminaba con el usuario adentro.
-- Depende de: 001_educativa_core.sql y 002_coworking_module.sql ya aplicadas.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.users
  add column coworking_creditos_canje integer not null default 0;

alter type public.discount_type add value 'canje';

create or replace function public.detect_completed_bookings()
returns integer as $$
declare affected integer;
begin
  with marked as (
    update public.bookings b
    set estado = 'completada'
    where b.estado = 'en_uso'
      and b.fecha_fin < now()
    returning b.id
  )
  select count(*) into affected from marked;
  return affected;
end;
$$ language plpgsql security definer;
