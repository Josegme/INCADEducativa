"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface LessonAttachmentActionState {
  error?: string;
  success?: boolean;
}

export async function addLessonAttachmentAction(
  lessonId: string,
  courseId: string,
  titulo: string,
  archivoUrl: string,
  orden: number
): Promise<LessonAttachmentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("lesson_attachments").insert({
    lesson_id: lessonId,
    titulo,
    archivo_url: archivoUrl,
    orden,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}

export async function deleteLessonAttachmentAction(
  attachmentId: string,
  courseId: string
): Promise<LessonAttachmentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("lesson_attachments").delete().eq("id", attachmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  return { success: true };
}
