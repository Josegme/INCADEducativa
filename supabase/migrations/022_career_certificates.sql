-- ============================================================
-- INCADEducativa — Migración 022: Certificado de especialización por carrera
-- Deuda funcional E1 (FUNCIONALIDADES.md §8.2/§8.4 "certificado de
-- especialización al completar una carrera completa"). Tabla separada de
-- `certificates` (distinta granularidad: carrera, no curso) — reusa el
-- mismo enum `certificate_status` y el mismo patrón de verificación
-- pública que `verify_certificate()` (001).
--
-- Depende de: 001_educativa_core.sql (certificate_status, careers, users).
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- uuid_generate_v4() calificado como extensions.uuid_generate_v4(): el
-- runner de `supabase db push` no incluye el schema `extensions` en el
-- search_path de la sesión (a diferencia del SQL Editor del Dashboard),
-- así que la llamada sin calificar falla con "function does not exist".
-- ============================================================

create table public.career_certificates (
  id                uuid primary key default extensions.uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  carrera_id        uuid not null references public.careers(id) on delete cascade,
  uuid_verificacion uuid not null unique default extensions.uuid_generate_v4(),
  pdf_url           text,
  estado            certificate_status not null default 'emitido',
  emitido_at        timestamptz not null default now(),
  unique(user_id, carrera_id)
);

create index idx_career_cert_uuid on public.career_certificates(uuid_verificacion);
create index idx_career_cert_user on public.career_certificates(user_id);

alter table public.career_certificates enable row level security;

-- Mismo criterio que certificates (001): usuario ve las propias, admin todas.
-- La verificación pública usa la RPC de abajo, no SELECT directo.
create policy "career_certs_own" on public.career_certificates
  for select using (user_id = auth.uid() or public.is_admin());
create policy "career_certs_admin_write" on public.career_certificates
  for all using (public.is_admin());

-- ============================================================
-- Verificación pública sin sesión (mismo patrón que verify_certificate).
-- ============================================================
create or replace function public.verify_career_certificate(p_uuid uuid)
returns table (
  alumno_nombre   text,
  alumno_apellido text,
  carrera_nombre  text,
  emitido_at      timestamptz,
  estado          certificate_status
) as $$
  select u.nombre, u.apellido, c.nombre, cert.emitido_at, cert.estado
  from public.career_certificates cert
  join public.users u on u.id = cert.user_id
  join public.careers c on c.id = cert.carrera_id
  where cert.uuid_verificacion = p_uuid;
$$ language sql security definer stable;

grant execute on function public.verify_career_certificate(uuid) to anon;
