-- ============================================================
-- INCADEducativa — Migración 026: Storage de avatares de perfil
-- Deuda funcional E1 (FUNCIONALIDADES.md §1.1 "Perfil de usuario: nombre,
-- foto, carrera/área, historial"). Bucket privado, mismo patrón que
-- 009_certificates_storage.sql — el dueño sube/lee su propio avatar,
-- el admin puede leer cualquiera.
--
-- Depende de: 001_educativa_core.sql (is_admin, users.avatar_url).
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Bucket privado ───────────────────────────────────────────
-- Convención de ruta: {user_id}/{archivo}
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- ── Policies ─────────────────────────────────────────────────
-- Puede leer un avatar: el admin, o el dueño (primer segmento de la ruta = user_id).
create policy "avatar_select" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and (
      public.is_admin()
      or ((storage.foldername(name))[1])::uuid = auth.uid()
    )
  );

-- Puede subir/reemplazar/borrar: solo el dueño del avatar.
create policy "avatar_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1])::uuid = auth.uid()
  );

create policy "avatar_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1])::uuid = auth.uid()
  );

create policy "avatar_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1])::uuid = auth.uid()
  );
