-- ============================================================
-- INCADEducativa — Migración 023: editar nombre en certificado + regenerar
-- Deuda funcional E1 (FUNCIONALIDADES.md §2.3/§8.2 "Admin puede editar
-- nombre y regenerar el certificado"). Columna nullable — cuando está seteada,
-- el PDF usa este nombre en vez de users.nombre/apellido (correcciones
-- puntuales de tipeo/DNI sin tocar el perfil real del alumno en el resto
-- de la plataforma).
--
-- Depende de: 001_educativa_core.sql (certificates).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.certificates add column nombre_override text;

-- verify_certificate() (001) también tiene que reflejar el nombre corregido
-- en la verificación pública, no solo en el PDF. Cuando hay override se
-- devuelve como alumno_nombre completo (alumno_apellido vacío) — evita
-- duplicar "nombre completo" en dos columnas separadas que ya no aplican.
create or replace function public.verify_certificate(p_uuid uuid)
returns table (
  alumno_nombre   text,
  alumno_apellido text,
  curso_titulo    text,
  emitido_at      timestamptz,
  estado          certificate_status
) as $$
  select
    coalesce(nullif(cert.nombre_override, ''), u.nombre),
    case when nullif(cert.nombre_override, '') is not null then '' else u.apellido end,
    c.titulo,
    cert.emitido_at,
    cert.estado
  from public.certificates cert
  join public.users u on u.id = cert.user_id
  join public.courses c on c.id = cert.course_id
  where cert.uuid_verificacion = p_uuid;
$$ language sql security definer stable;
