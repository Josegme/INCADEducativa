create or replace function public.get_occupied_slots(p_space_id uuid, p_from timestamptz, p_to timestamptz)
returns table(fecha_inicio timestamptz, fecha_fin timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select b.fecha_inicio, b.fecha_fin
  from public.bookings b
  where b.space_id = p_space_id
    and b.estado in ('pendiente', 'senada', 'confirmada', 'en_uso')
    and b.fecha_inicio >= p_from
    and b.fecha_inicio <= p_to;
$$;
