-- ============================================================
-- INCADEducativa — 042: seña / pago parcial de coworking
-- ============================================================
-- payments ya admite varias filas por reserva. Se suma monto_pagado y
-- el estado senada retiene el slot hasta completar o vencer.

alter type public.booking_status add value if not exists 'senada';

alter table public.bookings
  add column if not exists monto_pagado numeric(10,2) not null default 0,
  add column if not exists sena_pct integer not null default 0 check (sena_pct between 0 and 100),
  add column if not exists sena_vence_at timestamptz;

comment on column public.bookings.monto_pagado is
  'Suma de payments.estado=aprobado. Si < monto y > 0, la reserva queda senada.';
