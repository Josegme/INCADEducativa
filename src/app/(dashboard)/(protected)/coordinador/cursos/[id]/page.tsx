import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LessonAttachmentsManager } from "@/components/docente/LessonAttachmentsManager";
import { createClient } from "@/lib/supabase/server";
import type { LessonAttachment } from "@/modules/educativa/lessons";

interface LessonWithAttachments {
  id: string;
  titulo: string;
  orden: number;
  attachments: LessonAttachment[];
}

interface ModuleWithLessons {
  id: string;
  titulo: string;
  orden: number;
  lessons: LessonWithAttachments[];
}

export default async function CoordinadorCursoDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("id, titulo").eq("id", params.id).single();

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
        .select("id, module_id, titulo, orden")
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

  const attachmentsByLesson = new Map<string, LessonAttachment[]>();
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

  const lessonsByModule = new Map<string, LessonWithAttachments[]>();
  for (const row of lessonRows ?? []) {
    const list = lessonsByModule.get(row.module_id as string) ?? [];
    list.push({
      id: row.id as string,
      titulo: row.titulo as string,
      orden: row.orden as number,
      attachments: attachmentsByLesson.get(row.id as string) ?? [],
    });
    lessonsByModule.set(row.module_id as string, list);
  }

  const modules: ModuleWithLessons[] = (moduleRows ?? []).map((m) => ({
    id: m.id as string,
    titulo: m.titulo as string,
    orden: m.orden as number,
    lessons: lessonsByModule.get(m.id as string) ?? [],
  }));

  const { data: students } = await supabase
    .from("course_students")
    .select("id, nombre, apellido, enrollment_estado, progreso_pct")
    .eq("course_id", course.id)
    .order("nombre", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-white">{course.titulo}</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Cargá materiales adjuntos por clase y mirá el progreso de los alumnos inscriptos.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[14px] font-semibold text-white">Materiales por clase</h2>
        {modules.length === 0 ? (
          <p className="text-sm text-[--edu-text-muted]">Este curso todavía no tiene módulos cargados.</p>
        ) : (
          modules.map((courseModule) => (
            <Card key={courseModule.id} className="flex flex-col gap-3 p-4">
              <h3 className="text-[13px] font-semibold text-[--edu-text-muted]">{courseModule.titulo}</h3>
              {courseModule.lessons.length === 0 ? (
                <p className="text-[13px] text-[--edu-text-faint]">Sin clases todavía.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {courseModule.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex flex-col gap-2">
                      <span className="text-[13px] text-[--edu-text]">{lesson.titulo}</span>
                      <LessonAttachmentsManager
                        lessonId={lesson.id}
                        courseId={course.id}
                        attachments={lesson.attachments}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[14px] font-semibold text-white">Progreso de alumnos</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Progreso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(students ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {s.nombre} {s.apellido}
                </TableCell>
                <TableCell>
                  <Badge state={s.enrollment_estado === "completado" ? "completed" : "active"}>
                    {s.enrollment_estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-[--edu-text-muted]">{s.progreso_pct}%</TableCell>
              </TableRow>
            ))}
            {(students ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-[--edu-text-muted]">
                  Todavía no hay alumnos inscriptos.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
