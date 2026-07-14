import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateCertificatePdf } from "@/lib/certificatePdf";
import { awardPoints } from "@/lib/points";

export const CERTIFICATE_BUCKET = "certificados";

interface CheckAndIssueResult {
  issued: boolean;
  reason?: "no_completado" | "evaluaciones_pendientes" | "ya_emitido";
}

/**
 * Se llama después de cada evento que podría completar un curso (aprobar una
 * evaluación, terminar la última clase). Idempotente — si ya existe un
 * certificado para (user, course) no hace nada. Usa el cliente admin para el
 * INSERT en `certificates` y el upload del PDF porque la policy
 * `certs_admin_write` (001) solo permite escribir a is_admin(), nunca al
 * propio alumno.
 */
export async function checkAndIssueCertificate(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<CheckAndIssueResult> {
  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return { issued: false, reason: "ya_emitido" };
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("estado")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (enrollment?.estado !== "completado") {
    return { issued: false, reason: "no_completado" };
  }

  const { data: evaluations } = await supabase.from("evaluations").select("id").eq("course_id", courseId);

  for (const evaluation of evaluations ?? []) {
    const { data: latestAttempt } = await supabase
      .from("evaluation_attempts")
      .select("aprobado")
      .eq("evaluation_id", evaluation.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // aprobado queda en true tanto si el intento se aprobó 100% automático
    // (estado='aprobada') como si lo cerró una corrección manual
    // (estado='corregida' — el trigger apply_manual_correction de la 003
    // fija `aprobado` en ambos casos, no solo `estado`).
    if (latestAttempt?.aprobado !== true) {
      return { issued: false, reason: "evaluaciones_pendientes" };
    }
  }

  const { data: user } = await supabase.from("users").select("nombre, apellido").eq("id", userId).single();
  const { data: course } = await supabase.from("courses").select("titulo").eq("id", courseId).single();

  const admin = createAdminClient();

  const { data: certificate, error: insertError } = await admin
    .from("certificates")
    .insert({ user_id: userId, course_id: courseId })
    .select("id, uuid_verificacion, emitido_at")
    .single();

  if (insertError || !certificate) {
    console.error("[certificates] Error creando certificado:", insertError);
    return { issued: false };
  }

  const verificacionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar/${certificate.uuid_verificacion}`;

  const pdfBuffer = await generateCertificatePdf({
    alumnoNombre: `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim(),
    cursoTitulo: course?.titulo ?? "",
    fechaEmision: new Date(certificate.emitido_at).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    verificacionUrl,
  });

  const pdfPath = `${userId}/${courseId}.pdf`;

  const { error: uploadError } = await admin.storage
    .from(CERTIFICATE_BUCKET)
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    console.error("[certificates] Error subiendo el PDF:", uploadError);
  } else {
    await admin.from("certificates").update({ pdf_url: pdfPath }).eq("id", certificate.id);
  }

  await awardPoints(userId, 100, "certificado_emitido", certificate.id);

  return { issued: true };
}
