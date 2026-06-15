-- ============================================================
-- INCADEducativa — Migración 001: Plataforma Educativa (ETAPA 1)
-- Producto central del sistema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- v3.1 — RLS corregido (sin recursión) + verificación pública
-- Migración 001: E1 — Educativa Core. Sin dependencias. Crea 13 tablas.
-- Orden E1: 001 -> 003 -> 004 -> 005. (002 es E2, solo con FEATURE_COWORKING.)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
create type user_role          as enum ('admin','docente','alumno','coordinador','comunidad');
create type course_status      as enum ('borrador','revision','publicado','archivado');
create type lesson_type        as enum ('video','texto','documento');
create type enrollment_status  as enum ('activo','completado','suspendido');
create type review_status      as enum ('pendiente','aprobado','rechazado');
create type certificate_status as enum ('emitido','revocado');

-- ── users ────────────────────────────────────────────────────
create table public.users (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null unique,
  nombre        text not null,
  apellido      text not null,
  dni           text unique,
  role          user_role not null default 'alumno',
  carrera_id    uuid,
  avatar_url    text,
  puntos        integer not null default 0,
  activo        boolean not null default true,
  onboarding_ok boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── careers ──────────────────────────────────────────────────
create table public.careers (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  descripcion text,
  slug        text not null unique,
  imagen_url  text,
  activa      boolean not null default true,
  orden       integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.users
  add constraint fk_users_career
  foreign key (carrera_id) references public.careers(id) on delete set null;

-- ── courses ──────────────────────────────────────────────────
create table public.courses (
  id           uuid primary key default uuid_generate_v4(),
  titulo       text not null,
  descripcion  text,
  slug         text not null unique,
  carrera_id   uuid references public.careers(id) on delete set null,
  docente_id   uuid references public.users(id) on delete set null,
  estado       course_status not null default 'borrador',
  precio       numeric(10,2) not null default 0,
  imagen_url   text,
  duracion_hs  integer,
  nivel        text check (nivel in ('basico','intermedio','avanzado')),
  es_gratuito  boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── modules ──────────────────────────────────────────────────
create table public.modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  titulo      text not null,
  descripcion text,
  orden       integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ── lessons ──────────────────────────────────────────────────
create table public.lessons (
  id             uuid primary key default uuid_generate_v4(),
  module_id      uuid not null references public.modules(id) on delete cascade,
  titulo         text not null,
  tipo           lesson_type not null default 'video',
  contenido_url  text,
  contenido_text text,
  duracion_min   integer,
  orden          integer not null default 0,
  publicada      boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ── enrollments ──────────────────────────────────────────────
create table public.enrollments (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  course_id         uuid not null references public.courses(id) on delete cascade,
  estado            enrollment_status not null default 'activo',
  progreso_pct      integer not null default 0 check (progreso_pct between 0 and 100),
  fecha_inscripcion timestamptz not null default now(),
  fecha_completado  timestamptz,
  unique(user_id, course_id)
);

-- ── lesson_progress ───────────────────────────────────────────
create table public.lesson_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  lesson_id        uuid not null references public.lessons(id) on delete cascade,
  completada       boolean not null default false,
  tiempo_visto_seg integer not null default 0,
  updated_at       timestamptz not null default now(),
  unique(user_id, lesson_id)
);

-- ── quizzes ──────────────────────────────────────────────────
create table public.quizzes (
  id          uuid primary key default uuid_generate_v4(),
  lesson_id   uuid references public.lessons(id) on delete cascade,
  module_id   uuid references public.modules(id) on delete cascade,
  course_id   uuid references public.courses(id) on delete cascade,
  titulo      text not null,
  preguntas   jsonb not null default '[]',
  nota_minima integer not null default 60 check (nota_minima between 0 and 100),
  tipo        text not null default 'modulo' check (tipo in ('leccion','modulo','final')),
  created_at  timestamptz not null default now()
);

-- ── quiz_attempts ────────────────────────────────────────────
create table public.quiz_attempts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  quiz_id     uuid not null references public.quizzes(id) on delete cascade,
  respuestas  jsonb not null default '{}',
  nota        integer check (nota between 0 and 100),
  aprobado    boolean,
  intento_num integer not null default 1,
  created_at  timestamptz not null default now()
);

-- ── certificates ─────────────────────────────────────────────
create table public.certificates (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  course_id         uuid not null references public.courses(id) on delete cascade,
  uuid_verificacion uuid not null unique default uuid_generate_v4(),
  pdf_url           text,
  estado            certificate_status not null default 'emitido',
  emitido_at        timestamptz not null default now(),
  unique(user_id, course_id)
);

-- ── points_log (LEDGER APPEND-ONLY) ──────────────────────────
create table public.points_log (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  puntos        integer not null,
  motivo        text not null,
  referencia_id uuid,
  created_at    timestamptz not null default now()
);

-- Proteger el ledger: prohibir UPDATE y DELETE a nivel de DB
create or replace function prevent_ledger_mutation()
returns trigger as $$
begin
  raise exception 'points_log es append-only: no se permite % en el ledger', TG_OP;
end;
$$ language plpgsql;

create trigger trg_points_no_update before update on public.points_log
  for each row execute function prevent_ledger_mutation();
create trigger trg_points_no_delete before delete on public.points_log
  for each row execute function prevent_ledger_mutation();

-- ── content_reviews ──────────────────────────────────────────
create table public.content_reviews (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  docente_id  uuid not null references public.users(id) on delete cascade,
  admin_id    uuid references public.users(id) on delete set null,
  estado      review_status not null default 'pendiente',
  comentario  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── audit_log ────────────────────────────────────────────────
create table public.audit_log (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users(id) on delete set null,
  accion     text not null,
  entidad    text not null,
  entidad_id uuid,
  detalle    jsonb,
  created_at timestamptz not null default now()
);

-- ── Índices ──────────────────────────────────────────────────
create index idx_courses_estado     on public.courses(estado);
create index idx_courses_docente    on public.courses(docente_id);
create index idx_courses_carrera    on public.courses(carrera_id);
create index idx_modules_course     on public.modules(course_id, orden);
create index idx_lessons_module     on public.lessons(module_id, orden);
create index idx_enrollments_user   on public.enrollments(user_id);
create index idx_enrollments_course on public.enrollments(course_id);
create index idx_lp_user_lesson     on public.lesson_progress(user_id, lesson_id);
create index idx_attempts_user      on public.quiz_attempts(user_id, quiz_id);
create index idx_points_user        on public.points_log(user_id, created_at desc);
create index idx_cert_uuid          on public.certificates(uuid_verificacion);
create index idx_audit_user         on public.audit_log(user_id, created_at desc);

-- ── Trigger updated_at ───────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_users_updated    before update on public.users            for each row execute function update_updated_at();
create trigger trg_courses_updated  before update on public.courses          for each row execute function update_updated_at();
create trigger trg_reviews_updated  before update on public.content_reviews  for each row execute function update_updated_at();
create trigger trg_lp_updated       before update on public.lesson_progress  for each row execute function update_updated_at();

-- ── Función: recalcular progreso ─────────────────────────────
create or replace function recalculate_progress(p_user_id uuid, p_course_id uuid)
returns void as $$
declare total int; done int; pct int;
begin
  select count(*) into total
  from public.lessons l join public.modules m on m.id = l.module_id
  where m.course_id = p_course_id and l.publicada = true;
  if total = 0 then return; end if;
  select count(*) into done
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id
  join public.modules m on m.id = l.module_id
  where lp.user_id = p_user_id and m.course_id = p_course_id and lp.completada = true;
  pct := (done * 100) / total;
  update public.enrollments
  set progreso_pct = pct,
      estado = case when pct = 100 then 'completado'::enrollment_status else estado end,
      fecha_completado = case when pct = 100 and fecha_completado is null then now() else fecha_completado end
  where user_id = p_user_id and course_id = p_course_id;
end;
$$ language plpgsql security definer;

create or replace function trg_recalculate_progress() returns trigger as $$
declare p_course_id uuid;
begin
  select m.course_id into p_course_id
  from public.modules m join public.lessons l on l.module_id = m.id
  where l.id = new.lesson_id;
  perform recalculate_progress(new.user_id, p_course_id);
  return new;
end;
$$ language plpgsql;

create trigger trg_progress_recalc after insert or update on public.lesson_progress
  for each row execute function trg_recalculate_progress();

-- ============================================================
-- FUNCIONES DE SEGURIDAD — evitan recursión infinita en RLS
-- ============================================================

-- is_admin(): security definer bypasea RLS para consultar el rol.
-- USAR SIEMPRE esta función en policies, NUNCA subquery a public.users.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function public.is_role(p_role user_role)
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = p_role
  );
$$ language sql security definer stable;

-- ============================================================
-- RPC: Verificación pública de certificados (sin login)
-- La página /verificar/[uuid] llama a esta función.
-- Devuelve solo datos públicos del certificado.
-- ============================================================
create or replace function public.verify_certificate(p_uuid uuid)
returns table (
  alumno_nombre   text,
  alumno_apellido text,
  curso_titulo    text,
  emitido_at      timestamptz,
  estado          certificate_status
) as $$
  select u.nombre, u.apellido, c.titulo, cert.emitido_at, cert.estado
  from public.certificates cert
  join public.users u on u.id = cert.user_id
  join public.courses c on c.id = cert.course_id
  where cert.uuid_verificacion = p_uuid;
$$ language sql security definer stable;

-- Permitir ejecución anónima (página pública)
grant execute on function public.verify_certificate(uuid) to anon;

-- ============================================================
-- RLS Policies — usando is_admin() (sin recursión)
-- ============================================================
alter table public.users           enable row level security;
alter table public.careers         enable row level security;
alter table public.courses         enable row level security;
alter table public.modules         enable row level security;
alter table public.lessons         enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes         enable row level security;
alter table public.quiz_attempts   enable row level security;
alter table public.certificates    enable row level security;
alter table public.points_log      enable row level security;
alter table public.content_reviews enable row level security;
alter table public.audit_log       enable row level security;

-- users: cada usuario ve y edita su propio registro; admin ve todos
create policy "users_select" on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy "users_update_own" on public.users
  for update using (id = auth.uid() or public.is_admin());
create policy "users_admin_write" on public.users
  for insert with check (public.is_admin());
create policy "users_admin_delete" on public.users
  for delete using (public.is_admin());

-- careers: visibles para todos los autenticados; solo admin escribe
create policy "careers_select" on public.careers
  for select using (auth.uid() is not null);
create policy "careers_admin" on public.careers
  for all using (public.is_admin());

-- courses: publicados visibles para autenticados; borradores para docente dueño y admin
create policy "courses_select" on public.courses
  for select using (
    estado = 'publicado'
    or docente_id = auth.uid()
    or public.is_admin()
  );
create policy "courses_docente_write" on public.courses
  for update using (docente_id = auth.uid() and estado in ('borrador','revision'));
create policy "courses_admin" on public.courses
  for all using (public.is_admin());

-- modules y lessons: siguen la visibilidad del curso padre
create policy "modules_select" on public.modules
  for select using (
    exists (select 1 from public.courses c where c.id = course_id
            and (c.estado = 'publicado' or c.docente_id = auth.uid()))
    or public.is_admin()
  );
create policy "modules_write" on public.modules
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.docente_id = auth.uid())
    or public.is_admin()
  );

create policy "lessons_select" on public.lessons
  for select using (
    exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
            where m.id = module_id
            and (c.estado = 'publicado' or c.docente_id = auth.uid()))
    or public.is_admin()
  );
create policy "lessons_write" on public.lessons
  for all using (
    exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
            where m.id = module_id and c.docente_id = auth.uid())
    or public.is_admin()
  );

-- enrollments: usuario ve y crea las propias; admin todas
create policy "enrollments_own" on public.enrollments
  for all using (user_id = auth.uid() or public.is_admin());

-- lesson_progress: usuario solo el propio
create policy "lp_own" on public.lesson_progress
  for all using (user_id = auth.uid());

-- quizzes: visibles si el curso es accesible
create policy "quizzes_select" on public.quizzes
  for select using (auth.uid() is not null);
create policy "quizzes_admin" on public.quizzes
  for all using (public.is_admin());

-- quiz_attempts: usuario solo los propios; admin ve todos
create policy "attempts_own" on public.quiz_attempts
  for all using (user_id = auth.uid() or public.is_admin());

-- certificates: usuario ve los propios; admin todos.
-- La verificación pública usa la RPC verify_certificate(), no SELECT directo.
create policy "certs_own" on public.certificates
  for select using (user_id = auth.uid() or public.is_admin());
create policy "certs_admin_write" on public.certificates
  for all using (public.is_admin());

-- points_log: usuario ve los propios (solo SELECT — ledger append-only)
create policy "points_select" on public.points_log
  for select using (user_id = auth.uid() or public.is_admin());
create policy "points_insert" on public.points_log
  for insert with check (public.is_admin() or user_id = auth.uid());

-- content_reviews: docente ve las propias; admin todas
create policy "reviews_docente" on public.content_reviews
  for select using (docente_id = auth.uid() or public.is_admin());
create policy "reviews_admin" on public.content_reviews
  for all using (public.is_admin());

-- audit_log: solo admin
create policy "audit_admin" on public.audit_log
  for all using (public.is_admin());
