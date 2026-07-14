import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ClipboardList, Clock, Lock, UploadCloud } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { EnrollButton } from "@/components/educativa/EnrollButton";
import { AnnouncementList } from "@/components/educativa/AnnouncementList";
import { LEVEL_LABEL, type CourseLevel } from "@/modules/educativa/catalog";
import type { LessonRow, ModuleWithLessons } from "@/modules/educativa/lessons";
import type { AnnouncementRow } from "@/modules/comunicacion/types";
import type { EvaluationTipo } from "@/modules/docente/evaluationEditor";
import { ATTEMPT_STATE_LABEL, type AttemptState } from "@/modules/educativa/evaluationAttempt";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface CourseEvaluationRow {
  id: string;
  titulo: string;
  tipo: EvaluationTipo;
  module_id: string | null;
}

type EvaluationDisplayState = AttemptState;

const EVALUATION_DISPLAY_LABEL: Record<EvaluationDisplayState, string> = ATTEMPT_STATE_LABEL;

const EVALUATION_BADGE_STATE: Record<EvaluationDisplayState, BadgeProps["state"]> = {
  bloqueada: "locked",
  disponible: "active",
  en_curso: "pending",
  pendiente_correccion: "pending",
  aprobada: "completed",
  desaprobada: "error",
  corregida: "completed",
};

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

  const moduleCompletion = new Map<string, boolean>();
  for (const courseModule of modules) {
    const published = courseModule.lessons;
    moduleCompletion.set(
      courseModule.id,
      published.length > 0 && published.every((l) => completedByLesson.get(l.id) === true)
    );
  }

  const { data: evaluationRows } = await supabase
    .from("evaluations")
    .select("id, titulo, tipo, module_id")
    .eq("course_id", course.id);

  const evaluations: CourseEvaluationRow[] = (evaluationRows ?? []).map((e) => ({
    id: e.id as string,
    titulo: e.titulo as string,
    tipo: e.tipo as EvaluationTipo,
    module_id: e.module_id as string | null,
  }));

  const evaluationIds = evaluations.map((e) => e.id);

  const { data: attemptRows } =
    user && isEnrolled && evaluationIds.length > 0
      ? await supabase
          .from("evaluation_attempts")
          .select("evaluation_id, estado, aprobado, nota, created_at")
          .eq("user_id", user.id)
          .in("evaluation_id", evaluationIds)
          .order("created_at", { ascending: false })
      : {
          data: [] as {
            evaluation_id: string;
            estado: AttemptState;
            aprobado: boolean | null;
            nota: number | null;
            created_at: string;
          }[],
        };

  const latestAttemptByEvaluation = new Map<string, { estado: AttemptState; aprobado: boolean | null; nota: number | null }>();
  for (const row of attemptRows ?? []) {
    if (!latestAttemptByEvaluation.has(row.evaluation_id as string)) {
      latestAttemptByEvaluation.set(row.evaluation_id as string, { estado: row.estado, aprobado: row.aprobado, nota: row.nota });
    }
  }

  function evaluationDisplayState(evaluation: CourseEvaluationRow): EvaluationDisplayState {
    const unlocked = evaluation.module_id
      ? moduleCompletion.get(evaluation.module_id) === true
      : (enrollment?.progreso_pct ?? 0) >= 100;

    if (!isEnrolled || !unlocked) return "bloqueada";

    const attempt = latestAttemptByEvaluation.get(evaluation.id);
    if (!attempt) return "disponible";
    // `corregida` no distingue aprobado/desaprobado por sí solo (ver nota en
    // EvaluationResults.tsx) — acá también hay que mirar `aprobado`.
    if (attempt.estado === "corregida" && attempt.aprobado === false) return "desaprobada";
    return attempt.estado;
  }

  const { data: announcementRows } = isEnrolled
    ? await supabase
        .from("announcements")
        .select("id, course_id, sender_id, titulo, body, attachment_url, created_at, sender:users!announcements_sender_id_fkey(nombre, apellido)")
        .eq("course_id", course.id)
        .order("created_at", { ascending: false })
    : { data: [] as Record<string, unknown>[] };

  const announcements: AnnouncementRow[] = (announcementRows ?? []).map((row) => {
    const sender = row.sender as unknown as { nombre: string; apellido: string } | null;
    return {
      id: row.id as string,
      course_id: row.course_id as string,
      sender_id: row.sender_id as string,
      titulo: row.titulo as string | null,
      body: row.body as string,
      attachment_url: row.attachment_url as string | null,
      created_at: row.created_at as string,
      sender_nombre: sender?.nombre ?? "Usuario",
      sender_apellido: sender?.apellido ?? "",
    };
  });

  const { data: readRows } =
    user && isEnrolled && announcements.length > 0
      ? await supabase
          .from("announcement_reads")
          .select("announcement_id")
          .eq("user_id", user.id)
          .in(
            "announcement_id",
            announcements.map((a) => a.id)
          )
      : { data: [] as { announcement_id: string }[] };

  const readAnnouncementIds = (readRows ?? []).map((r) => r.announcement_id as string);

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
            {modules.map((courseModule) => (
              <div key={courseModule.id} className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[--edu-text-faint]">
                  {courseModule.titulo}
                </span>
                <ol className="flex flex-col gap-1">
                  {courseModule.lessons.map((lesson) => {
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

                {evaluations
                  .filter((e) => e.module_id === courseModule.id)
                  .map((evaluation) => {
                    const state = evaluationDisplayState(evaluation);
                    const Icon = evaluation.tipo === "tp" ? UploadCloud : ClipboardList;
                    const content = (
                      <>
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {evaluation.titulo}
                        <Badge state={EVALUATION_BADGE_STATE[state]} className="ml-auto">
                          {EVALUATION_DISPLAY_LABEL[state]}
                        </Badge>
                      </>
                    );
                    return (
                      <div key={evaluation.id} className="mt-1 flex items-center gap-2 text-[13px]">
                        {state === "bloqueada" ? (
                          <span className="flex flex-1 items-center gap-2 text-[--edu-text-faint]">{content}</span>
                        ) : (
                          <Link
                            href={`/cursos/${course.slug}/evaluaciones/${evaluation.id}`}
                            className="flex flex-1 items-center gap-2 text-[--edu-text-muted] hover:text-[--edu-text]"
                          >
                            {content}
                          </Link>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[--edu-text-muted]">Todavía no se cargó el contenido de este curso.</p>
        )}
      </div>

      {evaluations.some((e) => !e.module_id) ? (
        <div>
          <h2 className="mb-2 text-[13px] font-semibold text-[--edu-text]">Examen final</h2>
          <div className="flex flex-col gap-2">
            {evaluations
              .filter((e) => !e.module_id)
              .map((evaluation) => {
                const state = evaluationDisplayState(evaluation);
                const content = (
                  <>
                    <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                    {evaluation.titulo}
                    <Badge state={EVALUATION_BADGE_STATE[state]} className="ml-auto">
                      {EVALUATION_DISPLAY_LABEL[state]}
                    </Badge>
                  </>
                );
                return (
                  <div
                    key={evaluation.id}
                    className="flex items-center gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] px-3 py-2 text-[13px]"
                  >
                    {state === "bloqueada" ? (
                      <span className="flex flex-1 items-center gap-2 text-[--edu-text-faint]">{content}</span>
                    ) : (
                      <Link
                        href={`/cursos/${course.slug}/evaluaciones/${evaluation.id}`}
                        className="flex flex-1 items-center gap-2 text-[--edu-text-muted] hover:text-[--edu-text]"
                      >
                        {content}
                      </Link>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}

      {isEnrolled ? (
        <div>
          <h2 className="mb-2 text-[13px] font-semibold text-[--edu-text]">Anuncios</h2>
          <AnnouncementList
            announcements={announcements}
            courseId={course.id}
            courseSlug={course.slug}
            readAnnouncementIds={readAnnouncementIds}
          />
        </div>
      ) : null}
    </div>
  );
}
