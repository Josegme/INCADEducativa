-- ============================================================
-- INCADEducativa — Migración 034: canje de cupón atómico
-- ============================================================
-- increment_coupon_usage() (030_fase2_prep.sql) incrementaba usos_actuales
-- incondicionalmente, sin volver a chequear usos_maximos. La validación real
-- era un SELECT en JS separado en el tiempo del incremento (check-then-act):
-- dos reservas concurrentes con el mismo cupón podían pasar la validación y
-- terminar canjeando ambas, superando usos_maximos. Ahora el chequeo y el
-- incremento son una sola sentencia atómica; la función devuelve null (cero
-- filas afectadas) si el cupón ya llegó al límite, para que el caller pueda
-- fallar el canje. decrement_coupon_usage() es la compensación simétrica
-- que se usa si la reserva falla después de haber canjeado el cupón.

create or replace function public.increment_coupon_usage(p_coupon_id uuid)
returns boolean as $$
  update public.coupons
  set usos_actuales = usos_actuales + 1
  where id = p_coupon_id
    and (usos_maximos is null or usos_actuales < usos_maximos)
  returning true;
$$ language sql security definer set search_path = public;

create or replace function public.decrement_coupon_usage(p_coupon_id uuid)
returns void as $$
  update public.coupons
  set usos_actuales = greatest(usos_actuales - 1, 0)
  where id = p_coupon_id;
$$ language sql security definer set search_path = public;
