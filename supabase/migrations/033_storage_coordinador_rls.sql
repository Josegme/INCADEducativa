-- ============================================================
-- INCADEducativa — Migración 033: Storage RLS para Coordinador
-- ============================================================
-- 028_coordinador_educativo.sql agregó can_coordinate_course() y lo usó para
-- dar permiso de tabla (lesson_attachments) al rol Coordinador, pero nunca
-- se agregó a las policies de storage.objects del bucket 'contenido-cursos'
-- (definidas en 007_course_review.sql), que solo chequean can_teach_course().
-- Resultado: un Coordinador puede insertar la fila en lesson_attachments
-- pero Storage RLS rechaza la subida del archivo en sí.

drop policy if exists "lesson_content_write" on storage.objects;
create policy "lesson_content_write" on storage.objects
  for insert with check (
    bucket_id = 'contenido-cursos'
    and (
      public.is_admin()
      or public.can_teach_course(((storage.foldername(name))[1])::uuid)
      or public.can_coordinate_course(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "lesson_content_update" on storage.objects;
create policy "lesson_content_update" on storage.objects
  for update using (
    bucket_id = 'contenido-cursos'
    and (
      public.is_admin()
      or public.can_teach_course(((storage.foldername(name))[1])::uuid)
      or public.can_coordinate_course(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "lesson_content_delete" on storage.objects;
create policy "lesson_content_delete" on storage.objects
  for delete using (
    bucket_id = 'contenido-cursos'
    and (
      public.is_admin()
      or public.can_teach_course(((storage.foldername(name))[1])::uuid)
      or public.can_coordinate_course(((storage.foldername(name))[1])::uuid)
    )
  );
