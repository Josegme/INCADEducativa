import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { LessonSidebar } from "@/components/educativa/LessonSidebar";
import { LessonNav } from "@/components/educativa/LessonNav";
import { LessonPlayer } from "@/components/educativa/LessonPlayer";
import { ContentViewer } from "@/components/educativa/ContentViewer";
import { createClient } from "@/lib/supabase/server";
import { getSignedLessonContentUrl } from "@/lib/supabase/storage";
import type { LessonRow, LessonState, ModuleWithLessons } from "@/modules/educativa/lessons";

interface LessonPageProps {
  params: { slug: string; leccionId: string };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, titulo, docente_id")
    .eq("slug", params.slug)
    .eq("estado", "publicado")
    .single();

  if (!course) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/cursos/${params.slug}`);
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";
  const isDocenteOwner = course.docente_id === user.id;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("progreso_pct")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  const hasAccess = isAdmin || isDocenteOwner || Boolean(enrollment);
  if (!hasAccess) {
    redirect(`/cursos/${params.slug}`);
  }
  const bypassLock = isAdmin || isDocenteOwner;

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

  const flatLessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitulo: m.titulo })));

  if (flatLessons.length === 0) {
    notFound();
  }

  const lessonIds = flatLessons.map((l) => l.id);
  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completada, tiempo_visto_seg")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  const progressByLesson = new Map(
    (progressRows ?? []).map((p) => [p.lesson_id as string, { completada: p.completada as boolean, tiempoVistoSeg: p.tiempo_visto_seg as number }])
  );

  const lessonStates: LessonState[] = flatLessons.map((lesson, index) => {
    const progress = progressByLesson.get(lesson.id);
    const previousCompleted = index === 0 || progressByLesson.get(flatLessons[index - 1].id)?.completada === true;
    return {
      ...lesson,
      locked: bypassLock ? false : !previousCompleted,
      completed: progress?.completada === true,
      tiempoVistoSeg: progress?.tiempoVistoSeg ?? 0,
    };
  });

  const lessonStateById = new Map(lessonStates.map((l) => [l.id, l]));
  const activeIndex = lessonStates.findIndex((l) => l.id === params.leccionId);

  if (activeIndex === -1) {
    notFound();
  }

  const activeLesson = lessonStates[activeIndex];

  if (activeLesson.locked) {
    const firstUnlocked = lessonStates.find((l) => !l.locked);
    redirect(firstUnlocked ? `/cursos/${params.slug}/lecciones/${firstUnlocked.id}` : `/cursos/${params.slug}`);
  }

  const previousLesson = activeIndex > 0 ? lessonStates[activeIndex - 1] : null;
  const nextLesson = activeIndex < lessonStates.length - 1 ? lessonStates[activeIndex + 1] : null;

  const videoUrl =
    activeLesson.tipo === "video" && activeLesson.contenido_url
      ? await getSignedLessonContentUrl(supabase, activeLesson.contenido_url)
      : null;
  const documentoUrl =
    activeLesson.tipo === "documento" && activeLesson.contenido_url
      ? await getSignedLessonContentUrl(supabase, activeLesson.contenido_url)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/cursos/${params.slug}`}
        className="flex w-fit items-center gap-1 text-[12px] text-[--edu-text-muted] hover:text-[--edu-text]"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        Volver al curso
      </Link>

      {typeof enrollment?.progreso_pct === "number" ? (
        <div className="flex items-center gap-2">
          <Progress value={enrollment.progreso_pct} className="h-[3px] max-w-xs" />
          <span className="text-[11px] text-[--edu-text-muted]">{enrollment.progreso_pct}% del curso</span>
        </div>
      ) : null}

      <div className="flex gap-6">
        <LessonSidebar
          courseSlug={params.slug}
          modules={modules}
          lessonStateById={lessonStateById}
          activeLessonId={activeLesson.id}
        />

        <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-[18px] font-semibold text-white">{activeLesson.titulo}</h1>

          {activeLesson.tipo === "video" && videoUrl ? (
            <LessonPlayer
              lessonId={activeLesson.id}
              videoUrl={videoUrl}
              tiempoVistoSeg={activeLesson.tiempoVistoSeg}
              completed={activeLesson.completed}
            />
          ) : (
            <ContentViewer
              lessonId={activeLesson.id}
              tipo={activeLesson.tipo}
              contenidoText={activeLesson.contenido_text}
              documentoUrl={documentoUrl}
              completed={activeLesson.completed}
            />
          )}

          <LessonNav
            courseSlug={params.slug}
            previousLessonId={previousLesson?.id ?? null}
            nextLessonId={nextLesson?.id ?? null}
            nextLocked={nextLesson ? lessonStateById.get(nextLesson.id)?.locked ?? true : true}
          />
        </div>
      </div>
    </div>
  );
}
