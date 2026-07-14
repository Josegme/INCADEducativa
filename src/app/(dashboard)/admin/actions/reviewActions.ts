"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { notifyUsers } from "@/lib/notifications";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    throw new Error("Solo el administrador puede revisar cursos");
  }

  return { supabase, user };
}

export interface ReviewActionState {
  error?: string;
  success?: boolean;
}

export async function approveCourseAction(courseId: string): Promise<ReviewActionState> {
  const { supabase, user } = await requireAdmin();

  const { data: course } = await supabase.from("courses").select("titulo, docente_id").eq("id", courseId).single();

  const { error } = await supabase
    .from("courses")
    .update({
      estado: "publicado",
      revision_comentario: null,
      revisado_por: user.id,
      revisado_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  await notifyCourseReview(supabase, courseId, course, {
    tipo: "contenido_publicado",
    titulo: `Tu curso "${course?.titulo}" fue aprobado`,
    cuerpo: "El Admin aprobó tu curso — ya está publicado en el catálogo.",
    emailSubject: `[${course?.titulo}] Curso aprobado`,
  });

  revalidatePath("/admin/cursos");
  return { success: true };
}

export async function rejectCourseAction(courseId: string, comentario: string): Promise<ReviewActionState> {
  if (!comentario.trim()) {
    return { error: "El motivo del rechazo es obligatorio" };
  }

  const { supabase, user } = await requireAdmin();

  const { data: course } = await supabase.from("courses").select("titulo, docente_id").eq("id", courseId).single();

  const { error } = await supabase
    .from("courses")
    .update({
      estado: "borrador",
      revision_comentario: comentario.trim(),
      revisado_por: user.id,
      revisado_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  await notifyCourseReview(supabase, courseId, course, {
    tipo: "sistema",
    titulo: `Tu curso "${course?.titulo}" fue rechazado`,
    cuerpo: `El Admin rechazó tu curso con el motivo: "${comentario.trim()}"`,
    emailSubject: `[${course?.titulo}] Curso rechazado`,
  });

  revalidatePath("/admin/cursos");
  return { success: true };
}

async function notifyCourseReview(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  courseId: string,
  course: { titulo: string; docente_id: string | null } | null,
  content: { tipo: "contenido_publicado" | "sistema"; titulo: string; cuerpo: string; emailSubject: string }
) {
  if (!course?.docente_id) return;

  const { data: docente } = await supabase.from("users").select("email").eq("id", course.docente_id).single();

  if (!docente) return;

  await notifyUsers(supabase, {
    tipo: content.tipo,
    courseId,
    titulo: content.titulo,
    cuerpo: content.cuerpo,
    recipients: [{ userId: course.docente_id, email: docente.email as string }],
    emailSubject: content.emailSubject,
  });
}
