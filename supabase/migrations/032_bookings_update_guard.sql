-- ============================================================
-- INCADEducativa — Migración 032: guard de columnas en bookings_update
-- ============================================================
-- El WITH CHECK de "bookings_update" (031_rls_hardening.sql) solo exige que,
-- si el dueño de la reserva edita su propia fila, el `estado` final sea
-- 'cancelada' — pero Postgres RLS no compara el resto de las columnas contra
-- OLD automáticamente. Un usuario puede hacer
--   UPDATE bookings SET estado = 'cancelada', monto = 999999 WHERE id = ...
-- y la policy lo deja pasar. Mismo patrón de fix que ya se usó para `users`
-- en 031 (trg_users_guard_self_update): un trigger BEFORE UPDATE que compara
-- columna por columna.

create or replace function public.guard_bookings_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if public.is_admin() or public.is_role('coordinador') then
    return new;
  end if;

  -- dueño de la reserva: solo puede pasar estado -> 'cancelada', nada más
  if new.estado is distinct from old.estado and new.estado is distinct from 'cancelada' then
    raise exception 'Solo se puede cancelar una reserva propia';
  end if;

  if new.user_id is distinct from old.user_id
     or new.space_id is distinct from old.space_id
     or new.fecha_inicio is distinct from old.fecha_inicio
     or new.fecha_fin is distinct from old.fecha_fin
     or new.monto is distinct from old.monto
     or new.descuento_pct is distinct from old.descuento_pct
     or new.tipo_descuento is distinct from old.tipo_descuento
     or new.telefono_contacto is distinct from old.telefono_contacto
     or new.notas is distinct from old.notas
  then
    raise exception 'No se pueden modificar esos campos de una reserva propia';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_bookings_guard_self_update on public.bookings;
create trigger trg_bookings_guard_self_update
  before update on public.bookings
  for each row execute function public.guard_bookings_self_update();
