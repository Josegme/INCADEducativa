import { notFound } from "next/navigation";

import { EvaluationBuilder } from "@/components/docente/EvaluationBuilder";
import { CorrectionPanel, type PendingAttempt } from "@/components/docente/CorrectionPanel";
import { EvaluationResults, type ResultRow } from "@/components/docente/EvaluationResults";
import type { EditableEvaluation } from "@/modules/docente/evaluationEditor";
import { extractManualAnswers, gradeAttempt, type AttemptState, type Respuestas } from "@/modules/educativa/evaluationAttempt";
import { TP_SUBMISSIONS_BUCKET } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";

export default async function EvaluationBuilderPage({
  params,
}: {
  params: { id: string; evaluationId: string };
}) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, titulo, estado")
    .eq("id", params.id)
    .single();

  if (!course) {
    notFound();
  }

  const { data: evaluation } = await supabase
    .from("evaluations")
    .select("id, titulo, tipo, course_id, module_id, preguntas, nota_minima, config")
    .eq("id", params.evaluationId)
    .eq("course_id", params.id)
    .single();

  if (!evaluation) {
    notFound();
  }

  const editableEvaluation: EditableEvaluation = {
    id: evaluation.id,
    titulo: evaluation.titulo,
    tipo: evaluation.tipo,
    course_id: evaluation.course_id,
    module_id: evaluation.module_id,
    preguntas: evaluation.preguntas ?? [],
    nota_minima: evaluation.nota_minima,
    config: evaluation.config,
  };

  const { data: attemptRows } = await supabase
    .from("evaluation_attempts")
    .select("id, user_id, respuestas, nota, aprobado, estado, score_auto, created_at")
    .eq("evaluation_id", evaluation.id)
    .order("created_at", { ascending: false });

  const userIds = Array.from(new Set((attemptRows ?? []).map((a) => a.user_id as string)));

  const { data: students } =
    userIds.length > 0
      ? await supabase.from("course_students").select("id, nombre, apellido").eq("course_id", course.id).in("id", userIds)
      : { data: [] as { id: string; nombre: string; apellido: string }[] };

  const nameByUser = new Map((students ?? []).map((s) => [s.id as string, `${s.nombre} ${s.apellido}`]));

  type AttemptRow = NonNullable<typeof attemptRows>[number];

  const latestAttemptByUser = new Map<string, AttemptRow>();
  for (const row of attemptRows ?? []) {
    if (!latestAttemptByUser.has(row.user_id as string)) {
      latestAttemptByUser.set(row.user_id as string, row);
    }
  }

  const latestAttempts = Array.from(latestAttemptByUser.values());

  const pendingAttempts: PendingAttempt[] = [];
  for (const attempt of latestAttempts) {
    if (attempt.estado !== "pendiente_correccion") continue;

    const manualAnswers = extractManualAnswers(editableEvaluation.preguntas, attempt.respuestas as Respuestas);
    const resolvedAnswers = await Promise.all(
      manualAnswers.map(async (answer) => {
        if (!answer.link || !answer.link.includes("/")) return answer;
        // Los links de tipo "archivo" son un path del bucket entregas-tp, no una
        // URL — se resuelven a una signed URL recién acá, con el cliente de
        // sesión del docente (la policy tp_submission_docente_select ya lo permite).
        if (answer.link.startsWith("http")) return answer;
        const { data: signed } = await supabase.storage.from(TP_SUBMISSIONS_BUCKET).createSignedUrl(answer.link, 3600);
        return signed ? { ...answer, link: signed.signedUrl } : answer;
      })
    );

    const grading = gradeAttempt(editableEvaluation.preguntas, attempt.respuestas as Respuestas);

    pendingAttempts.push({
      id: attempt.id,
      studentName: nameByUser.get(attempt.user_id as string) ?? "Alumno",
      createdAt: attempt.created_at,
      scoreAuto: attempt.score_auto ?? 0,
      pesoManualDisponible: grading.pesoManualDisponible,
      manualAnswers: resolvedAnswers,
    });
  }

  const resultRows: ResultRow[] = latestAttempts.map((attempt) => ({
    attemptId: attempt.id,
    studentName: nameByUser.get(attempt.user_id as string) ?? "Alumno",
    nota: attempt.nota,
    aprobado: attempt.aprobado,
    estado: attempt.estado as AttemptState,
    createdAt: attempt.created_at,
  }));

  return (
    <div className="flex flex-col gap-6">
      <EvaluationBuilder evaluation={editableEvaluation} courseTitulo={course.titulo} editable={course.estado === "borrador"} />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-white">Correcciones pendientes</h2>
        <CorrectionPanel attempts={pendingAttempts} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-white">Resultados</h2>
        <EvaluationResults rows={resultRows} />
      </div>
    </div>
  );
}
