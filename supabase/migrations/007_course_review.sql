-- ============================================================
-- INCADEducativa — Migración 007: Revisión de contenido docente (ETAPA 1)
-- Sprint 7a: Panel docente + Editor de estructura + Cola de revisión
-- Depende de: 001 (is_admin, courses), 004 (can_teach_course), 006 (bucket contenido-cursos)
-- Ejecutar en: Supabase Dashboard > SQL Editor (después de 001, 003, 004, 005, 006)
-- ============================================================

-- ── Feedback de revisión en courses ──────────────────────────
-- Guarda solo el último motivo de rechazo (no un historial completo tipo
-- role_history) — el Admin lo pisa en cada revisión. El docente lo lee
-- directo en CourseEditor mientras el bell/panel de notifications (Sprint 7c)
-- no está construido todavía.
alter table public.courses
  add column if not exists revision_comentario text,
  add column if not exists revisado_por         uuid references public.users(id) on delete set null,
  add column if not exists revisado_at          timestamptz;

-- ── Storage: escritura de contenido por el docente dueño ─────
-- La 006 solo agregó SELECT. El docente (o alumno con can_teach) necesita
-- poder subir/reemplazar/borrar el archivo de sus propias lecciones.
create policy "lesson_content_write" on storage.objects
  for insert with check (
    bucket_id = 'contenido-cursos'
    and (
      public.is_admin()
      or public.can_teach_course(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "lesson_content_update" on storage.objects
  for update using (
    bucket_id = 'contenido-cursos'
    and (
      public.is_admin()
      or public.can_teach_course(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "lesson_content_delete" on storage.objects
  for delete using (
    bucket_id = 'contenido-cursos'
    and (
      public.is_admin()
      or public.can_teach_course(((storage.foldername(name))[1])::uuid)
    )
  );
