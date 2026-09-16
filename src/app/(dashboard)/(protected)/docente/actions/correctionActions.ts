"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/points";
import { checkAndIssueCertificate } from "@/lib/certificates";
import { notifyUsers } from "@/lib/notifications";

export interface CorrectionActionState {
  error?: string;
  success?: boolean;
}

export async function correctAttemptAction(
  attemptId: string,
  notaParcial: number,
  comentario: string
): Promise<CorrectionActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("manual_corrections").insert({
    attempt_id: attemptId,
    nota_parcial: notaParcial,
    comentario: comentario.trim() || null,
    corregido_por: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: attempt } = await supabase
    .from("evaluation_attempts")
    .select("user_id, aprobado, evaluation_id, evaluations(titulo, course_id)")
    .eq("id", attemptId)
    .single();

  if (!attempt) {
    return { success: true };
  }

  const evaluationInfo = attempt.evaluations as unknown as { titulo: string; course_id: string } | null;
  const courseId = evaluationInfo?.course_id;

  if (attempt.aprobado === true) {
    await awardPoints(attempt.user_id, 25, "evaluacion_aprobada", attempt.evaluation_id);
    if (courseId) {
      await checkAndIssueCertificate(supabase, attempt.user_id, courseId);
    }
  }

  const { data: alumno } = await supabase.from("users").select("email").eq("id", attempt.user_id).single();

  if (alumno) {
    await notifyUsers(supabase, {
      tipo: "correccion",
      courseId,
      senderId: user.id,
      referenciaId: attemptId,
      titulo: `Corregimos tu entrega de "${evaluationInfo?.titulo ?? "una evaluación"}"`,
      cuerpo: attempt.aprobado
        ? `Aprobaste con ${comentario.trim() ? "la siguiente devolución: " + comentario.trim() : "una devolución del docente"}.`
        : `${comentario.trim() ? "Devolución del docente: " + comentario.trim() : "No alcanzaste la nota mínima."}`,
      recipients: [{ userId: attempt.user_id, email: alumno.email as string }],
      emailSubject: `[${evaluationInfo?.titulo ?? "Evaluación"}] Tu entrega fue corregida`,
    });
  }

  revalidatePath("/docente/cursos", "layout");
  revalidatePath("/cursos", "layout");
  return { success: true };
}
