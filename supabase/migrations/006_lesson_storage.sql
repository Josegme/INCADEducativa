-- ============================================================
-- INCADEducativa — Migración 006: Storage de contenido de clases (ETAPA 1)
-- Sprint 5-6: Player de contenido + Progreso
-- Migración 006: E1 — bucket privado + policy de lectura para video/documento
-- de lecciones. Depende de 001 (is_admin) y 004 (can_teach_course).
-- Ejecutar en: Supabase Dashboard > SQL Editor (después de 001, 003, 004, 005)
-- ============================================================

-- ── Bucket privado ───────────────────────────────────────────
-- Convención de ruta de los objetos: {course_id}/{archivo}
insert into storage.buckets (id, name, public)
values ('contenido-cursos', 'contenido-cursos', false)
on conflict (id) do nothing;

-- ── Policy de lectura ────────────────────────────────────────
-- Puede leer un objeto de este bucket: el admin, el docente dueño del curso
-- (can_teach_course, 004), o un alumno con inscripción activa en el curso.
-- El course_id se extrae del primer segmento de la ruta del objeto.
create policy "lesson_content_select" on storage.objects
  for select using (
    bucket_id = 'contenido-cursos'
    and (
      public.is_admin()
      or public.can_teach_course(((storage.foldername(name))[1])::uuid)
      or exists (
        select 1 from public.enrollments e
        where e.user_id = auth.uid()
          and e.course_id = ((storage.foldername(name))[1])::uuid
      )
    )
  );
