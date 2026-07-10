import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/educativa/EnrollButton";
import { LEVEL_LABEL, type CourseLevel } from "@/modules/educativa/catalog";
import type { LessonRow, ModuleWithLessons } from "@/modules/educativa/lessons";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, titulo, descripcion, nivel, duracion_hs, es_gratuito, carrera:careers(nombre)")
    .eq("slug", params.slug)
    .eq("estado", "publicado")
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
        .eq("publicada", true)
        .order("orden", { ascending: true })
    : { data: [] as Record<string, unknown>[] };

  const lessonsByModule = new Map<string, LessonRow[]>();
  for (const row of lessonRows ?? []) {
    const list = lessonsByModule.get(row.module_id as string) ?? [];
    list.push({
      id: row.id as string,
      titulo: row.titulo as string,
      tipo: row.tipo as LessonRow["tipo"],
      contenido_url: row.contenido_url as string | null,
      contenido_text: row.contenido_text as string | null,
      duracion_min: row.duracion_min as number | null,
      orden: row.orden as number,
    });
    lessonsByModule.set(row.module_id as string, list);
  }

  const modules: ModuleWithLessons[] = (moduleRows ?? []).map((m) => ({
    id: m.id as string,
    titulo: m.titulo as string,
    orden: m.orden as number,
    lessons: lessonsByModule.get(m.id as string) ?? [],
  }));

  const flatLessons = modules.flatMap((m) => m.lessons);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("role").eq("id", user.id).single()
    : { data: null };

  const { data: enrollment } = user
    ? await supabase
        .from("enrollments")
        .select("progreso_pct")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle()
    : { data: null };

  const isEnrolled = Boolean(enrollment);

  const { data: progressRows } =
    user && isEnrolled && flatLessons.length > 0
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id, completada")
          .eq("user_id", user.id)
          .in(
            "lesson_id",
            flatLessons.map((l) => l.id)
          )
      : { data: [] as { lesson_id: string; completada: boolean }[] };

  const completedByLesson = new Map((progressRows ?? []).map((p) => [p.lesson_id, p.completada === true]));

  let firstIncompleteId: string | undefined;
  let previousCompleted = true;
  const lockedByLesson = new Map<string, boolean>();
  for (const lesson of flatLessons) {
    const locked = !previousCompleted;
    lockedByLesson.set(lesson.id, locked);
    const completed = completedByLesson.get(lesson.id) ?? false;
    if (!completed && !firstIncompleteId && !locked) {
      firstIncompleteId = lesson.id;
    }
    previousCompleted = completed;
  }

  const carrera = course.carrera as unknown as { nombre: string } | null;
  const nivel = course.nivel as CourseLevel;

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        {carrera ? (
          <span className="text-[12px] font-semibold uppercase tracking-[0.7px] text-[--inc-violet]">
            {carrera.nombre}
          </span>
        ) : null}
        <h1 className="text-[20px] font-semibold text-white">{course.titulo}</h1>
        <p className="text-sm text-[--edu-text-muted]">{course.descripcion}</p>
        <div className="flex items-center gap-3">
          <Badge state="locked">{LEVEL_LABEL[nivel]}</Badge>
          {course.duracion_hs ? (
            <span className="flex items-center gap-1 text-[12px] text-[--edu-text-muted]">
              <Clock className="h-[14px] w-[14px]" aria-hidden />
              {course.duracion_hs} hs
            </span>
          ) : null}
        </div>
      </div>

      <EnrollButton
        courseId={course.id}
        courseSlug={course.slug}
        esGratuito={course.es_gratuito}
        progresoPct={enrollment?.progreso_pct}
        canEnroll={profile?.role === "alumno"}
        resumeLessonId={firstIncompleteId ?? flatLessons[0]?.id}
      />

      <div>
        <h2 className="mb-2 text-[13px] font-semibold text-[--edu-text]">Contenido del curso</h2>
        {modules.length > 0 && flatLessons.length > 0 ? (
          <div className="flex flex-col gap-3">
            {modules.map((module) => (
              <div key={module.id} className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[--edu-text-faint]">
                  {module.titulo}
                </span>
                <ol className="flex flex-col gap-1">
                  {module.lessons.map((lesson) => {
                    const locked = !isEnrolled || (lockedByLesson.get(lesson.id) ?? true);
                    const completed = completedByLesson.get(lesson.id) ?? false;
                    const icon = completed ? (
                      <Check className="h-3 w-3" aria-hidden />
                    ) : locked ? (
                      <Lock className="h-3 w-3" aria-hidden />
                    ) : (
                      <span className="text-[10px] font-semibold">{lesson.orden}</span>
                    );
                    const row = (
                      <>
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-sm",
                            completed ? "bg-[--edu-success-subtle] text-[--edu-success]" : "bg-white/5 text-[--edu-text-faint]"
                          )}
                        >
                          {icon}
                        </span>
                        {lesson.titulo}
                      </>
                    );
                    return (
                      <li key={lesson.id} className="flex items-center gap-2 text-[13px]">
                        {locked ? (
                          <span className="flex items-center gap-2 text-[--edu-text-faint]">{row}</span>
                        ) : (
                          <Link
                            href={`/cursos/${course.slug}/lecciones/${lesson.id}`}
                            className="flex items-center gap-2 text-[--edu-text-muted] hover:text-[--edu-text]"
                          >
                            {row}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[--edu-text-muted]">Todavía no se cargó el contenido de este curso.</p>
        )}
      </div>
    </div>
  );
}
