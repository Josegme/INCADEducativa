"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";

export interface SubmitReviewState {
  error?: string;
  success?: boolean;
}

export async function submitForReviewAction(courseId: string): Promise<SubmitReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: course } = await supabase.from("courses").select("estado, titulo").eq("id", courseId).single();

  if (!course) {
    return { error: "El curso no existe" };
  }

  if (course.estado !== "borrador") {
    return { error: "Solo se puede enviar a revisión un curso en borrador" };
  }

  const { data: modules } = await supabase.from("modules").select("id").eq("course_id", courseId);

  if (!modules || modules.length === 0) {
    return { error: "Agregá al menos un módulo con una clase antes de enviar a revisión" };
  }

  const { error } = await supabase.from("courses").update({ estado: "revision" }).eq("id", courseId);

  if (error) {
    return { error: error.message };
  }

  const { data: admins } = await supabase.rpc("notify_admins_course_submitted", { p_course_id: courseId });

  if (admins) {
    await Promise.allSettled(
      admins.map((a: { admin_email: string }) =>
        sendEmail({
          to: a.admin_email,
          subject: `Curso enviado a revisión: ${course.titulo}`,
          html: `<p>El curso "${course.titulo}" fue enviado a revisión. Revisalo en /admin/cursos.</p>`,
        })
      )
    );
  }

  revalidatePath(`/docente/cursos/${courseId}`);
  revalidatePath("/docente");
  return { success: true };
}
