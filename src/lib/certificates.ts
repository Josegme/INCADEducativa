import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateCertificatePdf, generateCareerCertificatePdf } from "@/lib/certificatePdf";
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
  const { data: course } = await supabase.from("courses").select("titulo, carrera_id").eq("id", courseId).single();

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

  if (course?.carrera_id) {
    await checkAndIssueCareerCertificate(supabase, userId, course.carrera_id);
  }

  return { issued: true };
}

interface CheckAndIssueCareerResult {
  issued: boolean;
  reason?: "sin_cursos" | "cursos_pendientes" | "ya_emitido";
}

/**
 * Se llama después de emitir un certificado de curso — chequea si ese curso
 * era el último que faltaba para completar la carrera entera. "Completó la
 * carrera" = tiene un certificado de curso (certificates) por cada curso
 * publicado de esa carrera — reusa la validación ya hecha en
 * checkAndIssueCertificate (100% clases + evaluaciones aprobadas) en vez de
 * volver a mirar enrollments/evaluaciones acá.
 */
export async function checkAndIssueCareerCertificate(
  supabase: SupabaseClient,
  userId: string,
  carreraId: string
): Promise<CheckAndIssueCareerResult> {
  const { data: existing } = await supabase
    .from("career_certificates")
    .select("id")
    .eq("user_id", userId)
    .eq("carrera_id", carreraId)
    .maybeSingle();

  if (existing) {
    return { issued: false, reason: "ya_emitido" };
  }

  const { data: careerCourses } = await supabase
    .from("courses")
    .select("id")
    .eq("carrera_id", carreraId)
    .eq("estado", "publicado");

  const courseIds = (careerCourses ?? []).map((c) => c.id as string);
  if (courseIds.length === 0) {
    return { issued: false, reason: "sin_cursos" };
  }

  const { data: courseCertificates } = await supabase
    .from("certificates")
    .select("course_id")
    .eq("user_id", userId)
    .in("course_id", courseIds);

  const certifiedCourseIds = new Set((courseCertificates ?? []).map((c) => c.course_id as string));
  const allCertified = courseIds.every((id) => certifiedCourseIds.has(id));

  if (!allCertified) {
    return { issued: false, reason: "cursos_pendientes" };
  }

  const { data: user } = await supabase.from("users").select("nombre, apellido").eq("id", userId).single();
  const { data: career } = await supabase.from("careers").select("nombre").eq("id", carreraId).single();

  const admin = createAdminClient();

  const { data: certificate, error: insertError } = await admin
    .from("career_certificates")
    .insert({ user_id: userId, carrera_id: carreraId })
    .select("id, uuid_verificacion, emitido_at")
    .single();

  if (insertError || !certificate) {
    console.error("[certificates] Error creando certificado de carrera:", insertError);
    return { issued: false };
  }

  const verificacionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar/${certificate.uuid_verificacion}`;

  const pdfBuffer = await generateCareerCertificatePdf({
    alumnoNombre: `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim(),
    carreraNombre: career?.nombre ?? "",
    fechaEmision: new Date(certificate.emitido_at).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    verificacionUrl,
  });

  const pdfPath = `${userId}/carrera-${carreraId}.pdf`;

  const { error: uploadError } = await admin.storage
    .from(CERTIFICATE_BUCKET)
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    console.error("[certificates] Error subiendo el PDF de carrera:", uploadError);
  } else {
    await admin.from("career_certificates").update({ pdf_url: pdfPath }).eq("id", certificate.id);
  }

  await awardPoints(userId, 300, "certificado_carrera_emitido", certificate.id);

  return { issued: true };
}

export interface RegenerateCertificateResult {
  error?: string;
  success?: boolean;
}

/**
 * Regenera el PDF de un certificado de curso ya emitido — usa
 * `nombre_override` si está seteado, si no el nombre real del alumno.
 * Siempre con el cliente admin (llamado desde una acción ya gateada por
 * requireAdmin() en el caller, mismo criterio que checkAndIssueCertificate).
 */
export async function regenerateCertificatePdf(certificateId: string): Promise<RegenerateCertificateResult> {
  const admin = createAdminClient();

  const { data: certificate } = await admin
    .from("certificates")
    .select("id, user_id, course_id, uuid_verificacion, emitido_at, nombre_override")
    .eq("id", certificateId)
    .single();

  if (!certificate) {
    return { error: "El certificado no existe" };
  }

  const [{ data: user }, { data: course }] = await Promise.all([
    admin.from("users").select("nombre, apellido").eq("id", certificate.user_id).single(),
    admin.from("courses").select("titulo").eq("id", certificate.course_id).single(),
  ]);

  const alumnoNombre = certificate.nombre_override?.trim() || `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim();
  const verificacionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar/${certificate.uuid_verificacion}`;

  const pdfBuffer = await generateCertificatePdf({
    alumnoNombre,
    cursoTitulo: course?.titulo ?? "",
    fechaEmision: new Date(certificate.emitido_at).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    verificacionUrl,
  });

  const pdfPath = `${certificate.user_id}/${certificate.course_id}.pdf`;

  const { error: uploadError } = await admin.storage
    .from(CERTIFICATE_BUCKET)
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    return { error: "No se pudo subir el PDF regenerado" };
  }

  await admin.from("certificates").update({ pdf_url: pdfPath }).eq("id", certificateId);

  return { success: true };
}
