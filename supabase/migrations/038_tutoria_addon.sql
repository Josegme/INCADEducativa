-- ============================================================
-- INCADEducativa — Migración 038: Add-on pago de Tutorías para Comunidad (T13)
-- Spec v3.7 §6.4. Para `alumno` las tutorías siguen gratis (Addendum 05,
-- sin cambios). Un usuario `comunidad` que compró/se suscribió a un curso
-- (Etapa 3) accede al contenido pero no a las tutorías de ese curso por
-- default — el Admin puede habilitar un add-on pago por curso.
--
-- Tabla dedicada, separada de `compras_curso`/`catalogo_suscripciones`
-- (ADR-13, revenue streams separados) — mismo criterio que esas dos.
-- NO aplicar contra ninguna DB sin aprobación explícita del usuario.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.courses
  add column precio_tutorias_addon numeric(10,2) not null default 0;

comment on column public.courses.precio_tutorias_addon is
  'Precio del add-on de acceso a tutorías para usuario comunidad (T13). 0 = no se vende para este curso. No afecta a alumno (gratis, sin cambios) ni a docente/coordinador/admin (roles internos).';

create table public.tutoria_addon_compras (
  id               uuid primary key default extensions.uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  mp_preference_id text,
  mp_payment_id    text unique,
  monto            numeric(10,2) not null,
  estado           text not null default 'pendiente'
                   check (estado in ('pendiente','aprobado','rechazado','reembolsado')),
  webhook_payload  jsonb,
  created_at       timestamptz not null default now()
);

comment on table public.tutoria_addon_compras is
  'Ledger de compras del add-on de tutorías por curso (T13). Sin unique(user_id, course_id) a propósito, mismo criterio que compras_curso: un usuario puede reintentar una compra abandonada.';

create index idx_tutoria_addon_compras_user   on public.tutoria_addon_compras(user_id);
create index idx_tutoria_addon_compras_course on public.tutoria_addon_compras(course_id);

alter table public.tutoria_addon_compras enable row level security;

-- Sin policy de insert para `authenticated`: la fila la escribe siempre el
-- server action vía el cliente service-role (createAdminClient()), mismo
-- criterio que compras_curso — nunca se confía en un monto que mande el
-- navegador.
create policy "tutoria_addon_compras_select" on public.tutoria_addon_compras
  for select using (user_id = auth.uid() or public.is_admin());

create policy "tutoria_addon_compras_admin" on public.tutoria_addon_compras
  for all using (public.is_admin());

-- ============================================================
-- Función: has_tutoria_addon_access() — gate de acceso a tutorías para
-- comunidad. Mismo patrón SECURITY DEFINER stable que
-- has_active_course_subscription() (036). Alumno/docente/coordinador/admin
-- NUNCA llaman esta función — el gate de rol se resuelve antes, en
-- TypeScript (cursos/[slug]/page.tsx), no acá.
-- ============================================================
create or replace function public.has_tutoria_addon_access(p_course_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.tutoria_addon_compras
    where user_id = auth.uid() and course_id = p_course_id and estado = 'aprobado'
  );
$$ language sql security definer stable;
