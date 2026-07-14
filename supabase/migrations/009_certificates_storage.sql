-- ============================================================
-- INCADEducativa — Migración 009: Storage de certificados (ETAPA 1)
-- Sprint 9-10: Certificados PDF + QR verificable
-- Depende de: 001 (is_admin, certificates)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Bucket privado ───────────────────────────────────────────
-- Convención de ruta: {user_id}/{course_id}.pdf
-- El servidor (service_role) es el único que escribe — la emisión de
-- certificados corre siempre por src/lib/certificates.ts con el cliente
-- admin, nunca desde el cliente del alumno (RLS de `certificates` ya
-- restringe el INSERT/UPDATE de la tabla a is_admin(), acá espejamos lo
-- mismo para el archivo).
insert into storage.buckets (id, name, public)
values ('certificados', 'certificados', false)
on conflict (id) do nothing;

-- ── Policy de lectura ────────────────────────────────────────
-- Puede leer un objeto de este bucket: el admin, o el dueño del certificado
-- (primer segmento de la ruta = user_id).
create policy "certificate_select" on storage.objects
  for select using (
    bucket_id = 'certificados'
    and (
      public.is_admin()
      or ((storage.foldername(name))[1])::uuid = auth.uid()
    )
  );

-- ============================================================
-- Bucket de entregas de TP — Addendum 01 §2.5 (tipo de entrega "archivo")
-- Convención de ruta: {evaluation_id}/{user_id}/{archivo}
-- ============================================================
insert into storage.buckets (id, name, public)
values ('entregas-tp', 'entregas-tp', false)
on conflict (id) do nothing;

create policy "tp_submission_owner_all" on storage.objects
  for all using (
    bucket_id = 'entregas-tp'
    and ((storage.foldername(name))[2])::uuid = auth.uid()
  );

create policy "tp_submission_docente_select" on storage.objects
  for select using (
    bucket_id = 'entregas-tp'
    and (
      public.is_admin()
      or exists (
        select 1 from public.evaluations e
        join public.courses c on c.id = e.course_id
        where e.id = ((storage.foldername(name))[1])::uuid
          and c.docente_id = auth.uid()
      )
    )
  );
