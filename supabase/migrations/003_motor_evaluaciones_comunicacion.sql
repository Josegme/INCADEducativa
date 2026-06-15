-- ============================================================
-- INCADEducativa — Migración 003: Motor de Evaluaciones + Comunicación (ETAPA 1)
-- Implementa Addendum 01 (Motor de Evaluaciones y Entregas)
--           Addendum 02 (Canal de Comunicación Docente → Grupo)
-- Requiere: 001_educativa_core.sql ya aplicada (usa is_admin(), is_role())
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Migración 003: E1 — Evaluaciones + Comunicación. Depende de 001. Agrega 5 tablas.
-- ============================================================

-- ── Enums nuevos ─────────────────────────────────────────────
create type evaluation_type   as enum ('cuestionario_modulo','examen_final','tp');
create type attempt_state      as enum (
  'bloqueada','disponible','en_curso','pendiente_correccion',
  'aprobada','desaprobada','corregida'
);
create type submission_kind    as enum ('archivo','drive','github','url','texto');
create type submission_state   as enum ('pendiente_entrega','entregado','corregido');
create type notification_type  as enum (
  'announcement','tutoria','correccion','contenido_publicado',
  'certificado','puntos','pago','sistema'
);
create type notification_channel as enum ('in_app','email','whatsapp');

-- ============================================================
-- 1. RENOMBRADO: quizzes → evaluations  (ADR-12)
-- ============================================================
alter table public.quizzes        rename to evaluations;
alter table public.quiz_attempts  rename to evaluation_attempts;
alter table public.evaluation_attempts rename column quiz_id to evaluation_id;

-- Migrar el campo `tipo` al nuevo enum y ampliar tipos soportados
alter table public.evaluations drop constraint if exists quizzes_tipo_check;
alter table public.evaluations alter column tipo drop default;
update public.evaluations set tipo = 'cuestionario_modulo'
  where tipo in ('leccion','modulo');
update public.evaluations set tipo = 'examen_final'
  where tipo = 'final';
alter table public.evaluations
  alter column tipo type evaluation_type using tipo::evaluation_type;
alter table public.evaluations alter column tipo set default 'cuestionario_modulo';

-- Parámetros globales de la evaluación (tiempo límite, intentos, espera, visibilidad)
alter table public.evaluations
  add column if not exists config jsonb not null default jsonb_build_object(
    'tiempo_limite_min', null,
    'intentos_permitidos', 1,
    'espera_horas', 24,
    'mostrar_resultado', 'inmediato'
  );

-- Estado del intento + desglose de score (automático + manual)
alter table public.evaluation_attempts
  add column if not exists estado       attempt_state not null default 'en_curso',
  add column if not exists score_auto   integer check (score_auto between 0 and 100),
  add column if not exists score_manual integer check (score_manual between 0 and 100);

-- ============================================================
-- 2. evaluation_submissions (entregas de TP) — Addendum 01 §2.5
-- ============================================================
create table public.evaluation_submissions (
  id             uuid primary key default uuid_generate_v4(),
  evaluation_id  uuid not null references public.evaluations(id) on delete cascade,
  user_id        uuid not null references public.users(id) on delete cascade,
  tipo_entrega   submission_kind not null,
  submission_url text,         -- Drive / GitHub / URL externa
  file_url       text,         -- Supabase Storage: tps/{curso_id}/{alumno_id}/{filename}
  texto          text,         -- respuesta larga en plataforma
  estado         submission_state not null default 'entregado',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- 3. manual_corrections (corrección manual del docente) — Addendum 01 §4
-- ============================================================
create table public.manual_corrections (
  id            uuid primary key default uuid_generate_v4(),
  attempt_id    uuid not null references public.evaluation_attempts(id) on delete cascade,
  nota_parcial  integer not null check (nota_parcial between 0 and 100),
  comentario    text,
  corregido_por uuid not null references public.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 4. notifications (backbone de comunicación) — Addendum 02, ADR-14
-- ============================================================
create table public.notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  tipo          notification_type not null,
  course_id     uuid references public.courses(id) on delete cascade,
  sender_id     uuid references public.users(id) on delete set null,
  referencia_id uuid,                          -- anuncio, intento, certificado, etc.
  titulo        text not null,
  cuerpo        text,
  canal         notification_channel not null default 'in_app',
  leida         boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Preferencias de canal por usuario (in-app siempre activo, no desactivable)
alter table public.users
  add column if not exists notification_prefs jsonb not null default jsonb_build_object(
    'email', true,
    'whatsapp', true
  );

-- ============================================================
-- 5. announcements + announcement_reads — Addendum 02 §5
-- ============================================================
create table public.announcements (
  id             uuid primary key default uuid_generate_v4(),
  course_id      uuid not null references public.courses(id) on delete cascade,
  sender_id      uuid not null references public.users(id) on delete set null,
  titulo         text,
  body           text not null,
  attachment_url text,
  created_at     timestamptz not null default now()
);

create table public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

-- ============================================================
-- 6. Índices
-- ============================================================
create index idx_eval_course        on public.evaluations(course_id);
create index idx_eval_module         on public.evaluations(module_id);
create index idx_submissions_eval    on public.evaluation_submissions(evaluation_id);
create index idx_submissions_user    on public.evaluation_submissions(user_id);
create index idx_corrections_attempt on public.manual_corrections(attempt_id);
create index idx_notif_user_unread   on public.notifications(user_id, created_at desc) where leida = false;
create index idx_announce_course     on public.announcements(course_id, created_at desc);

-- ── Trigger updated_at en submissions ────────────────────────
create trigger trg_submissions_updated before update on public.evaluation_submissions
  for each row execute function update_updated_at();

-- ============================================================
-- 7. Función: integrar score automático + manual al corregir
-- ============================================================
create or replace function public.apply_manual_correction()
returns trigger as $$
declare auto_part int; total int;
begin
  select coalesce(score_auto, 0) into auto_part
  from public.evaluation_attempts where id = new.attempt_id;

  total := auto_part + new.nota_parcial;
  if total > 100 then total := 100; end if;

  update public.evaluation_attempts
  set score_manual = new.nota_parcial,
      nota         = total,
      estado       = 'corregida',
      aprobado     = (total >= (
        select nota_minima from public.evaluations e
        where e.id = evaluation_attempts.evaluation_id
      ))
  where id = new.attempt_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_apply_manual_correction after insert on public.manual_corrections
  for each row execute function apply_manual_correction();

-- ============================================================
-- 8. RLS — usando is_admin() / is_role() de la migración 001
-- ============================================================
alter table public.evaluation_submissions enable row level security;
alter table public.manual_corrections      enable row level security;
alter table public.notifications           enable row level security;
alter table public.announcements           enable row level security;
alter table public.announcement_reads      enable row level security;

-- Recrear policies de las tablas renombradas con nombres coherentes
drop policy if exists "quizzes_select" on public.evaluations;
drop policy if exists "quizzes_admin"  on public.evaluations;
drop policy if exists "attempts_own"   on public.evaluation_attempts;

-- evaluations: visibles para autenticados; docente dueño del curso y admin escriben
create policy "evaluations_select" on public.evaluations
  for select using (auth.uid() is not null);
create policy "evaluations_write" on public.evaluations
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_id and c.docente_id = auth.uid()
    )
  );

-- evaluation_attempts: alumno los propios; docente del curso y admin lectura
create policy "attempts_own" on public.evaluation_attempts
  for all using (user_id = auth.uid() or public.is_admin());
create policy "attempts_docente_read" on public.evaluation_attempts
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.evaluations e
      join public.courses c on c.id = e.course_id
      where e.id = evaluation_id and c.docente_id = auth.uid()
    )
  );

-- evaluation_submissions: alumno las propias; docente del curso y admin
create policy "submissions_own" on public.evaluation_submissions
  for all using (user_id = auth.uid() or public.is_admin());
create policy "submissions_docente_read" on public.evaluation_submissions
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.evaluations e
      join public.courses c on c.id = e.course_id
      where e.id = evaluation_id and c.docente_id = auth.uid()
    )
  );

-- manual_corrections: docente del curso y admin escriben; alumno lee las de sus intentos
create policy "corrections_docente_write" on public.manual_corrections
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.evaluation_attempts a
      join public.evaluations e on e.id = a.evaluation_id
      join public.courses c on c.id = e.course_id
      where a.id = attempt_id and c.docente_id = auth.uid()
    )
  );
create policy "corrections_alumno_read" on public.manual_corrections
  for select using (
    exists (
      select 1 from public.evaluation_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
    or public.is_admin()
  );

-- notifications: cada usuario ve y marca como leídas solo las propias
create policy "notifications_own" on public.notifications
  for all using (user_id = auth.uid() or public.is_admin());

-- announcements: inscriptos del curso leen; docente del curso, coordinador y admin escriben
create policy "announcements_select" on public.announcements
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.enrollments en
      where en.course_id = announcements.course_id and en.user_id = auth.uid()
    )
    or exists (
      select 1 from public.courses c
      where c.id = announcements.course_id and c.docente_id = auth.uid()
    )
  );
create policy "announcements_write" on public.announcements
  for all using (
    public.is_admin()
    or public.is_role('coordinador')
    or exists (
      select 1 from public.courses c
      where c.id = announcements.course_id and c.docente_id = auth.uid()
    )
  );

-- announcement_reads: cada usuario marca sus propias lecturas
create policy "announcement_reads_own" on public.announcement_reads
  for all using (user_id = auth.uid() or public.is_admin());
