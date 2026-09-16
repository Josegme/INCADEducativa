-- ============================================================
-- INCADEducativa — 043: overlap incluye senada
-- ============================================================
-- Separado de 042 porque un valor nuevo de enum no se puede usar en
-- la misma transacción donde se agregó (PostgreSQL).

alter table public.bookings drop constraint if exists no_overlap;
alter table public.bookings add constraint no_overlap exclude using gist (
  space_id with =,
  tstzrange(fecha_inicio, fecha_fin) with &&
) where (estado in ('pendiente','senada','confirmada','en_uso'));
