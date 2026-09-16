-- ============================================================
-- INCADEducativa — Migración 027: Materiales adjuntos por clase
-- Deuda funcional E1 (FUNCIONALIDADES.md §3.4/§8.1 "Materiales descargables
-- *adjuntos* por clase, además del contenido principal"). `lessons` ya
-- guarda el contenido principal (video/texto/documento) en `contenido_url`
-- — esto agrega N adjuntos *extra* por clase (ej. una guía de ejercicios
-- sobre una clase de video), reusando el mismo bucket `contenido-cursos`
-- y su policy de lectura existente (009_certificates_storage no aplica acá,
-- ver 006_lesson_storage: la policy ya autoriza por prefijo {course_id}/,
-- no hace falta una policy de storage nueva).
--
-- Convención de ruta de archivo: {course_id}/adjuntos/{lesson_id}/{archivo}
-- (mismo primer segmento course_id que ya valida "lesson_content_select").
--
-- Depende de: 001_educativa_core.sql (lessons, modules, courses, is_admin).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create table public.lesson_attachments (
  id          uuid primary key default extensions.uuid_generate_v4(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  titulo      text not null,
  archivo_url text not null,
  orden       integer not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_lesson_attachments_lesson on public.lesson_attachments(lesson_id, orden);

alter table public.lesson_attachments enable row level security;

-- Misma visibilidad que lessons_select/lessons_write (curso publicado o
-- docente dueño ven; solo el docente dueño o el admin escriben).
create policy "lesson_attachments_select" on public.lesson_attachments
  for select using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      where l.id = lesson_id
        and (c.estado = 'publicado' or c.docente_id = auth.uid())
    )
    or public.is_admin()
  );

-- Usa can_teach_course() (004) en vez de c.docente_id = auth.uid() para
-- cubrir también el rol dual (alumno con can_teach=true en ese curso).
create policy "lesson_attachments_write" on public.lesson_attachments
  for all using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_id and public.can_teach_course(m.course_id)
    )
    or public.is_admin()
  );
