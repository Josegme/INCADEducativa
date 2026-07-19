"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { gradeAttempt, type Respuestas } from "@/modules/educativa/evaluationAttempt";
import { checkAndIssueCertificate } from "@/lib/certificates";
import { awardPoints } from "@/lib/points";

export interface AttemptActionState {
  error?: string;
  success?: boolean;
  attemptId?: string;
}

export async function startAttemptAction(evaluationId: string): Promise<AttemptActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: evaluation } = await supabase
    .from("evaluations")
    .select("id, config")
    .eq("id", evaluationId)
    .single();

  if (!evaluation) {
    return { error: "La evaluación no existe" };
  }

  const { data: lastAttempt } = await supabase
    .from("evaluation_attempts")
    .select("id, estado, aprobado, intento_num, created_at")
    .eq("evaluation_id", evaluationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastAttempt) {
    if (lastAttempt.estado === "en_curso" || lastAttempt.estado === "pendiente_correccion") {
      return { success: true, attemptId: lastAttempt.id };
    }

    // `aprobado` decide si ya se puede reintentar, no `estado` — un intento
    // 'corregida' puede haber quedado desaprobado (nota < nota_minima tras la
    // corrección manual) y en ese caso sigue habilitado para un nuevo intento.
    // Si ya aprobó no hay reintento posible (nunca), pero eso no es motivo
    // para bloquear la vista del resultado — mismo criterio que el caso
    // pendiente_correccion de arriba: devolver el intento existente en vez
    // de un error, para que la página lo muestre en modo lectura.
    if (lastAttempt.aprobado === true) {
      return { success: true, attemptId: lastAttempt.id };
    }

    const config = evaluation.config as { intentos_permitidos: number; espera_horas: number };

    if (lastAttempt.intento_num >= config.intentos_permitidos) {
      return { error: "Agotaste los intentos permitidos para esta evaluación" };
    }

    const espinMs = config.espera_horas * 60 * 60 * 1000;
    const disponibleEn = new Date(lastAttempt.created_at).getTime() + espinMs;

    if (Date.now() < disponibleEn) {
      const horasRestantes = Math.ceil((disponibleEn - Date.now()) / (60 * 60 * 1000));
      return { error: `Podés reintentar en ${horasRestantes}hs` };
    }
  }

  const { data: attempt, error } = await supabase
    .from("evaluation_attempts")
    .insert({
      evaluation_id: evaluationId,
      user_id: user.id,
      respuestas: {},
      estado: "en_curso",
      intento_num: (lastAttempt?.intento_num ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, attemptId: attempt.id };
}

export async function submitAttemptAction(attemptId: string, respuestas: Respuestas): Promise<AttemptActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: attempt } = await supabase
    .from("evaluation_attempts")
    .select("id, evaluation_id")
    .eq("id", attemptId)
    .single();

  if (!attempt) {
    return { error: "El intento no existe" };
  }

  const { data: evaluation } = await supabase
    .from("evaluations")
    .select("preguntas, nota_minima, course_id")
    .eq("id", attempt.evaluation_id)
    .single();

  if (!evaluation) {
    return { error: "La evaluación no existe" };
  }

  const grading = gradeAttempt(evaluation.preguntas, respuestas);

  const willBeApproved = !grading.needsManualReview && grading.scoreAuto >= evaluation.nota_minima;

  const { error } = await supabase
    .from("evaluation_attempts")
    .update({
      respuestas,
      score_auto: grading.scoreAuto,
      nota: grading.needsManualReview ? null : grading.scoreAuto,
      aprobado: grading.needsManualReview ? null : willBeApproved,
      estado: grading.needsManualReview ? "pendiente_correccion" : willBeApproved ? "aprobada" : "desaprobada",
    })
    .eq("id", attemptId);

  if (error) {
    return { error: error.message };
  }

  if (willBeApproved) {
    await awardPoints(user.id, 25, "evaluacion_aprobada", attempt.evaluation_id);
    await checkAndIssueCertificate(supabase, user.id, evaluation.course_id);
  }

  revalidatePath(`/cursos`, "layout");
  return { success: true };
}
