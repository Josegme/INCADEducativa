import { notFound, redirect } from "next/navigation";

import { EvaluationPlayer } from "@/components/educativa/EvaluationPlayer";
import type { EditableEvaluation } from "@/modules/docente/evaluationEditor";
import type { AttemptRow } from "@/modules/educativa/evaluationAttempt";
import { startAttemptAction } from "@/app/(dashboard)/cursos/actions/evaluationAttemptActions";
import { createClient } from "@/lib/supabase/server";

export default async function StudentEvaluationPage({
  params,
}: {
  params: { slug: string; evaluationId: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, titulo")
    .eq("slug", params.slug)
    .eq("estado", "publicado")
    .single();

  if (!course) {
    notFound();
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("progreso_pct")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/cursos/${course.slug}`);
  }

  const { data: evaluationRow } = await supabase
    .from("evaluations")
    .select("id, titulo, tipo, course_id, module_id, preguntas, nota_minima, config")
    .eq("id", params.evaluationId)
    .eq("course_id", course.id)
    .single();

  if (!evaluationRow) {
    notFound();
  }

  if (evaluationRow.module_id) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("module_id", evaluationRow.module_id)
      .eq("publicada", true);

    const lessonIds = (lessons ?? []).map((l) => l.id as string);

    const { data: progressRows } = lessonIds.length
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id, completada")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds)
      : { data: [] as { lesson_id: string; completada: boolean }[] };

    const completedCount = (progressRows ?? []).filter((p) => p.completada).length;

    if (lessonIds.length === 0 || completedCount < lessonIds.length) {
      redirect(`/cursos/${course.slug}`);
    }
  } else if (enrollment.progreso_pct < 100) {
    redirect(`/cursos/${course.slug}`);
  }

  const startResult = await startAttemptAction(evaluationRow.id);

  if (startResult.error || !startResult.attemptId) {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-[20px] font-semibold text-white">{evaluationRow.titulo}</h1>
        <p className="text-sm text-[--edu-danger-text]">{startResult.error}</p>
      </div>
    );
  }

  const { data: attemptRow } = await supabase
    .from("evaluation_attempts")
    .select("id, user_id, evaluation_id, respuestas, nota, aprobado, intento_num, estado, score_auto, score_manual, created_at")
    .eq("id", startResult.attemptId)
    .single();

  const { data: correction } =
    attemptRow?.estado === "corregida"
      ? await supabase
          .from("manual_corrections")
          .select("comentario")
          .eq("attempt_id", attemptRow.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

  const editableEvaluation: EditableEvaluation = {
    id: evaluationRow.id,
    titulo: evaluationRow.titulo,
    tipo: evaluationRow.tipo,
    course_id: evaluationRow.course_id,
    module_id: evaluationRow.module_id,
    preguntas: evaluationRow.preguntas ?? [],
    nota_minima: evaluationRow.nota_minima,
    config: evaluationRow.config,
  };

  return (
    <EvaluationPlayer
      evaluation={editableEvaluation}
      attempt={attemptRow as AttemptRow}
      userId={user.id}
      courseSlug={course.slug}
      devolucion={correction?.comentario ?? null}
    />
  );
}
