import type { createClient } from "@/lib/supabase/server";

export const LESSON_CONTENT_BUCKET = "contenido-cursos";
export const TP_SUBMISSIONS_BUCKET = "entregas-tp";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Requiere el cliente de sesión normal (no el de service-role) para que la
 * policy de storage.objects se aplique con el usuario autenticado real. */
export async function getSignedLessonContentUrl(
  supabase: SupabaseServerClient,
  path: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(LESSON_CONTENT_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    return null;
  }

  return data.signedUrl;
}
