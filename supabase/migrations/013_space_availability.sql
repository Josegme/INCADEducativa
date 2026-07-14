-- ============================================================
-- INCADEducativa — Migración 013: Disponibilidad de espacios (ETAPA 2)
-- Sprint 13-14: bug real encontrado en navegador — "bookings_own" (002) solo
-- deja ver la propia reserva (o a admin/coordinador). Un alumno o comunidad
-- no puede ver los horarios que OTRO usuario ya tomó del mismo espacio, así
-- que la grilla de BookingForm quedaba vacía para cualquiera que no fuera el
-- dueño de la reserva — el problema no era "no en tiempo real", era que no
-- se veía la ocupación ajena en absoluto.
--
-- No se amplía la policy de SELECT de `bookings` directamente porque RLS no
-- filtra por columna: si cualquier autenticado pudiera ver filas ajenas,
-- también podría leer `monto`, `telefono_contacto` y `user_id` de reservas
-- de otras personas (fuga de datos personales/financieros). En su lugar, una
-- función security definer devuelve SOLO fecha_inicio/fecha_fin de reservas
-- activas — mismo patrón que get_user_discount() de la 002.
-- Depende de: 002_coworking_module.sql ya aplicada.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create or replace function public.get_occupied_slots(p_space_id uuid, p_from timestamptz, p_to timestamptz)
returns table(fecha_inicio timestamptz, fecha_fin timestamptz)
language sql
security definer
stable
as $$
  select b.fecha_inicio, b.fecha_fin
  from public.bookings b
  where b.space_id = p_space_id
    and b.estado in ('pendiente', 'confirmada', 'en_uso')
    and b.fecha_inicio >= p_from
    and b.fecha_inicio <= p_to;
$$;

grant execute on function public.get_occupied_slots(uuid, timestamptz, timestamptz) to anon, authenticated;
