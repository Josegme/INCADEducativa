-- ============================================================
-- INCADEducativa — Migración 030: prep de schema para Fase 2 (Etapa 2)
-- Deuda funcional E2 (FUNCIONALIDADES.md): cupones/early bird, puntos por
-- talleres. Tres cambios de schema chicos, sin relación entre sí más que
-- ser prerequisito de features de la misma pasada.
-- ============================================================

-- ── Cupones — nuevo valor de discount_type + canje atómico ────
-- 'institucional'/'publico'/'manual' (002), 'canje' (017, créditos
-- canjeados por puntos). Un cupón es una promoción intencional, no se
-- acumula con el descuento institucional automático — gana el cupón.
alter type public.discount_type add value 'cupon';

-- coupons.usos_actuales solo lo puede tocar admin por RLS (coupons_admin,
-- 002) — un usuario canjeando un cupón en su propia reserva necesita una
-- vía atómica que no dependa de ampliar esa policy. security definer,
-- update de una sola sentencia (atómico en Postgres, sin race condition
-- por más que dos reservas canjeen el mismo código a la vez).
create or replace function public.increment_coupon_usage(p_coupon_id uuid)
returns void as $$
  update public.coupons set usos_actuales = usos_actuales + 1 where id = p_coupon_id;
$$ language sql security definer set search_path = public;

-- ── Talleres — asistencia (prerequisito de puntos automáticos) ─
-- No existía ningún concepto de "completó/asistió" en taller_inscripciones,
-- solo inscrito_at. Sin esto no hay nada verificable sobre lo cual otorgar
-- puntos.
alter table public.taller_inscripciones add column asistio boolean not null default false;

-- Faltaba policy de UPDATE en taller_inscripciones (019 solo tenía
-- select/insert/delete) — admin marca asistencia.
create policy "taller_inscripciones_update_admin" on public.taller_inscripciones
  for update using (public.is_admin());
