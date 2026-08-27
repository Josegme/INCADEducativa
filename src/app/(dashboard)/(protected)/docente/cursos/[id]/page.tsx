import { notFound } from "next/navigation";

import { CourseEditor } from "@/components/docente/CourseEditor";
import type { EditableLesson, EditableModule } from "@/modules/docente/courseEditor";
import type { EvaluationSummary } from "@/modules/docente/evaluationEditor";
import { getFlags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";

export default async function DocenteCourseEditorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const flags = await getFlags();

  const { data: course } = await supabase
    .from("courses")
    .select("id, titulo, estado, revision_comentario")
    .eq("id", params.id)
    .single();

  if (!course) {
    notFound();
  }

  const { data: moduleRows } = await supabase
    .from("modules")
    .select("id, titulo, orden")
    .eq("course_id", course.id)
    .order("orden", { ascending: true });

  const moduleIds = (moduleRows ?? []).map((m) => m.id as string);

  const { data: lessonRows } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("id, module_id, titulo, tipo, contenido_url, contenido_text, duracion_min, orden")
        .in("module_id", moduleIds)
        .order("orden", { ascending: true })
    : { data: [] as Record<string, unknown>[] };

  const lessonIds = (lessonRows ?? []).map((l) => l.id as string);

  const { data: attachmentRows } = lessonIds.length
    ? await supabase
        .from("lesson_attachments")
        .select("id, lesson_id, titulo, archivo_url, orden")
        .in("lesson_id", lessonIds)
        .order("orden", { ascending: true })
    : { data: [] as Record<string, unknown>[] };

  const attachmentsByLesson = new Map<string, EditableLesson["attachments"]>();
  for (const row of attachmentRows ?? []) {
    const list = attachmentsByLesson.get(row.lesson_id as string) ?? [];
    list.push({
      id: row.id as string,
      titulo: row.titulo as string,
      archivo_url: row.archivo_url as string,
      orden: row.orden as number,
    });
    attachmentsByLesson.set(row.lesson_id as string, list);
  }

  const lessonsByModule = new Map<string, EditableLesson[]>();
  for (const row of lessonRows ?? []) {
    const list = lessonsByModule.get(row.module_id as string) ?? [];
    list.push({
      id: row.id as string,
      titulo: row.titulo as string,
      tipo: row.tipo as EditableLesson["tipo"],
      contenido_url: row.contenido_url as string | null,
      contenido_text: row.contenido_text as string | null,
      duracion_min: row.duracion_min as number | null,
      orden: row.orden as number,
      attachments: attachmentsByLesson.get(row.id as string) ?? [],
    });
    lessonsByModule.set(row.module_id as string, list);
  }

  const modules: EditableModule[] = (moduleRows ?? []).map((m) => ({
    id: m.id as string,
    titulo: m.titulo as string,
    orden: m.orden as number,
    lessons: lessonsByModule.get(m.id as string) ?? [],
  }));

  const { data: evaluationRows } = await supabase
    .from("evaluations")
    .select("id, titulo, tipo, module_id")
    .eq("course_id", course.id);

  const evaluations: EvaluationSummary[] = (evaluationRows ?? []).map((e) => ({
    id: e.id as string,
    titulo: e.titulo as string,
    tipo: e.tipo as EvaluationSummary["tipo"],
    module_id: e.module_id as string | null,
  }));

  return (
    <CourseEditor
      course={{
        id: course.id,
        titulo: course.titulo,
        estado: course.estado,
        revision_comentario: course.revision_comentario,
      }}
      modules={modules}
      evaluations={evaluations}
      tutoriasHabilitado={flags.tutorias}
    />
  );
}
