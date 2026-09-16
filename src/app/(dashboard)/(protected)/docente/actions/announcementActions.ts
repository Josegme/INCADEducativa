"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { notifyUsers } from "@/lib/notifications";

export interface AnnouncementActionState {
  error?: string;
  success?: boolean;
}

export async function createAnnouncementAction(
  courseId: string,
  titulo: string,
  body: string,
  attachmentUrl?: string
): Promise<AnnouncementActionState> {
  if (!body.trim()) {
    return { error: "El mensaje no puede estar vacío" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: course } = await supabase.from("courses").select("titulo, slug").eq("id", courseId).single();

  if (!course) {
    return { error: "El curso no existe" };
  }

  const { data: announcement, error } = await supabase
    .from("announcements")
    .insert({
      course_id: courseId,
      sender_id: user.id,
      titulo: titulo.trim() || null,
      body: body.trim(),
      attachment_url: attachmentUrl?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const { data: enrollments } = await supabase.from("enrollments").select("user_id").eq("course_id", courseId);
  const userIds = (enrollments ?? []).map((e) => e.user_id as string);

  if (userIds.length > 0) {
    const { data: recipients } = await supabase.from("users").select("id, email").in("id", userIds);

    await notifyUsers(supabase, {
      tipo: "announcement",
      courseId,
      senderId: user.id,
      referenciaId: announcement.id,
      titulo: `Nuevo anuncio en ${course.titulo}`,
      cuerpo: body.trim().slice(0, 200),
      recipients: (recipients ?? []).map((r) => ({ userId: r.id as string, email: r.email as string })),
      emailSubject: `[${course.titulo}] Nuevo anuncio de tu docente`,
    });
  }

  revalidatePath(`/docente/cursos/${courseId}/anuncios`);
  revalidatePath(`/cursos/${course.slug}`);
  return { success: true };
}
