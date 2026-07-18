"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, ClipboardList, FileText, GripVertical, Trash2, UploadCloud, Video } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { ModuleModal } from "@/components/docente/ModuleModal";
import { LessonModal } from "@/components/docente/LessonModal";
import { EvaluationModal } from "@/components/docente/EvaluationModal";
import type { EditableCourse, EditableLesson, EditableModule } from "@/modules/docente/courseEditor";
import { EVALUATION_TIPO_LABEL, type EvaluationSummary } from "@/modules/docente/evaluationEditor";
import { deleteModuleAction, reorderModulesAction } from "@/app/(dashboard)/docente/actions/moduleActions";
import { deleteLessonAction, reorderLessonsAction } from "@/app/(dashboard)/docente/actions/lessonActions";
import { submitForReviewAction } from "@/app/(dashboard)/docente/actions/reviewActions";
import { deleteEvaluationAction } from "@/app/(dashboard)/docente/actions/evaluationActions";

const ESTADO_BADGE = {
  borrador: "locked",
  revision: "pending",
  publicado: "completed",
  archivado: "locked",
} as const;

const ESTADO_LABEL = {
  borrador: "Borrador",
  revision: "En revisión",
  publicado: "Publicado",
  archivado: "Archivado",
} as const;

function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = React.useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="destructive" size="sm" onClick={onConfirm}>
          ¿Seguro?
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          No
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} aria-label="Borrar">
      <Trash2 className="h-4 w-4" aria-hidden />
    </Button>
  );
}

function LessonRow({
  lesson,
  courseId,
  editable,
  onDeleted,
}: {
  lesson: EditableLesson;
  courseId: string;
  editable: boolean;
  onDeleted: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
    disabled: !editable,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] px-3 py-2 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {editable ? (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-[--edu-text-faint] active:cursor-grabbing"
          aria-label="Reordenar clase"
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      ) : null}

      {lesson.tipo === "texto" ? (
        <FileText className="h-4 w-4 shrink-0 text-[--edu-text-muted]" aria-hidden />
      ) : (
        <Video className="h-4 w-4 shrink-0 text-[--edu-text-muted]" aria-hidden />
      )}

      <span className="flex-1 text-[13px] text-[--edu-text]">{lesson.titulo}</span>

      {editable ? (
        <>
          <LessonModal courseId={courseId} lesson={lesson} />
          <ConfirmDelete onConfirm={onDeleted} />
        </>
      ) : null}
    </div>
  );
}

function EvaluationRow({
  evaluation,
  courseId,
  editable,
  onDeleted,
}: {
  evaluation: EvaluationSummary;
  courseId: string;
  editable: boolean;
  onDeleted: () => void;
}) {
  const Icon = evaluation.tipo === "tp" ? UploadCloud : ClipboardList;

  return (
    <div className="flex items-center gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-[--edu-text-muted]" aria-hidden />
      <span className="flex-1 text-[13px] text-[--edu-text]">{evaluation.titulo}</span>
      <Badge state="active">{EVALUATION_TIPO_LABEL[evaluation.tipo]}</Badge>
      <Link href={`/docente/cursos/${courseId}/evaluaciones/${evaluation.id}`}>
        <Button variant="ghost" size="sm">
          {editable ? "Editar" : "Ver"}
        </Button>
      </Link>
      {editable ? <ConfirmDelete onConfirm={onDeleted} /> : null}
    </div>
  );
}

function ModuleCard({
  courseModule,
  courseId,
  editable,
  evaluations,
  onDeleted,
  onDeletedEvaluation,
}: {
  courseModule: EditableModule;
  courseId: string;
  editable: boolean;
  evaluations: EvaluationSummary[];
  onDeleted: () => void;
  onDeletedEvaluation: (evaluationId: string) => void;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: courseModule.id,
    disabled: !editable,
  });
  const [lessons, setLessons] = React.useState(courseModule.lessons);

  React.useEffect(() => {
    setLessons(courseModule.lessons);
  }, [courseModule.lessons]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  async function handleLessonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lessons, oldIndex, newIndex);
    setLessons(reordered);
    await reorderLessonsAction(courseId, reordered.map((l) => l.id));
    router.refresh();
  }

  async function handleDeleteLesson(lessonId: string) {
    await deleteLessonAction(lessonId, courseId);
    router.refresh();
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-2 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {editable ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab text-[--edu-text-faint] active:cursor-grabbing"
            aria-label="Reordenar módulo"
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <span className="flex-1 text-sm font-semibold text-white">{courseModule.titulo}</span>
        {editable ? (
          <>
            <ModuleModal courseId={courseId} nextOrden={courseModule.orden} courseModule={courseModule} />
            <ConfirmDelete onConfirm={onDeleted} />
          </>
        ) : null}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5 pl-6">
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                courseId={courseId}
                editable={editable}
                onDeleted={() => handleDeleteLesson(lesson.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editable ? (
        <div className="pl-6">
          <LessonModal courseId={courseId} moduleId={courseModule.id} nextOrden={lessons.length} />
        </div>
      ) : null}

      {evaluations.length > 0 ? (
        <div className="flex flex-col gap-1.5 pl-6">
          {evaluations.map((evaluation) => (
            <EvaluationRow
              key={evaluation.id}
              evaluation={evaluation}
              courseId={courseId}
              editable={editable}
              onDeleted={() => onDeletedEvaluation(evaluation.id)}
            />
          ))}
        </div>
      ) : null}

      {editable ? (
        <div className="flex flex-wrap gap-2 pl-6">
          {evaluations.some((e) => e.tipo === "cuestionario_modulo") ? null : (
            <EvaluationModal
              courseId={courseId}
              moduleId={courseModule.id}
              tipo="cuestionario_modulo"
              trigger={
                <Button variant="outline" size="sm">
                  + Cuestionario de módulo
                </Button>
              }
            />
          )}
          <EvaluationModal
            courseId={courseId}
            moduleId={courseModule.id}
            tipo="tp"
            trigger={
              <Button variant="outline" size="sm">
                + Entrega de TP
              </Button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}

interface CourseEditorProps {
  course: EditableCourse;
  modules: EditableModule[];
  evaluations: EvaluationSummary[];
  tutoriasHabilitado?: boolean;
}

export function CourseEditor({
  course,
  modules: initialModules,
  evaluations: initialEvaluations,
  tutoriasHabilitado,
}: CourseEditorProps) {
  const router = useRouter();
  const [modules, setModules] = React.useState(initialModules);
  const [evaluations, setEvaluations] = React.useState(initialEvaluations);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  React.useEffect(() => {
    setEvaluations(initialEvaluations);
  }, [initialEvaluations]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const editable = course.estado === "borrador";
  const examenFinal = evaluations.find((e) => e.tipo === "examen_final");

  async function handleModuleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);
    setModules(reordered);
    await reorderModulesAction(course.id, reordered.map((m) => m.id));
    router.refresh();
  }

  async function handleDeleteModule(moduleId: string) {
    await deleteModuleAction(moduleId, course.id);
    router.refresh();
  }

  async function handleDeleteEvaluation(evaluationId: string) {
    await deleteEvaluationAction(evaluationId, course.id);
    router.refresh();
  }

  async function handleSubmitForReview() {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitForReviewAction(course.id);
    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-semibold text-white">{course.titulo}</h1>
          <Badge state={ESTADO_BADGE[course.estado]}>{ESTADO_LABEL[course.estado]}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/docente/cursos/${course.id}/anuncios`}>
            <Button variant="outline" size="sm">
              Anuncios
            </Button>
          </Link>
          {tutoriasHabilitado ? (
            <Link href={`/docente/cursos/${course.id}/tutorias`}>
              <Button variant="outline" size="sm">
                Tutorías
              </Button>
            </Link>
          ) : null}
          {course.estado === "borrador" ? (
            <Button variant="primary" size="sm" disabled={isSubmitting} onClick={handleSubmitForReview}>
              {isSubmitting ? "Enviando…" : "Enviar a revisión"}
            </Button>
          ) : null}
        </div>
      </div>

      {submitError ? <NotificationBanner type="danger">{submitError}</NotificationBanner> : null}

      {course.estado === "borrador" && course.revision_comentario ? (
        <NotificationBanner type="warning">
          <span className="font-semibold">El Admin rechazó este curso: </span>
          {course.revision_comentario}
        </NotificationBanner>
      ) : null}

      {course.estado === "revision" ? (
        <NotificationBanner type="info">
          Este curso está en revisión del Admin — no se puede editar hasta que lo apruebe o rechace.
        </NotificationBanner>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {modules.map((courseModule) => (
              <ModuleCard
                key={courseModule.id}
                courseModule={courseModule}
                courseId={course.id}
                editable={editable}
                evaluations={evaluations.filter((e) => e.module_id === courseModule.id)}
                onDeleted={() => handleDeleteModule(courseModule.id)}
                onDeletedEvaluation={handleDeleteEvaluation}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {modules.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] px-4 py-6 text-sm text-[--edu-text-muted]">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          Todavía no hay módulos. Agregá el primero para empezar a cargar clases.
        </div>
      ) : null}

      {editable ? (
        <div>
          <ModuleModal courseId={course.id} nextOrden={modules.length} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2 border-t-[0.5px] border-[--edu-border] pt-4">
        <span className="text-sm font-semibold text-white">Examen final</span>
        {examenFinal ? (
          <EvaluationRow
            evaluation={examenFinal}
            courseId={course.id}
            editable={editable}
            onDeleted={() => handleDeleteEvaluation(examenFinal.id)}
          />
        ) : editable ? (
          <EvaluationModal
            courseId={course.id}
            moduleId={null}
            tipo="examen_final"
            trigger={
              <Button variant="outline" size="sm" className="self-start">
                + Examen final
              </Button>
            }
          />
        ) : (
          <span className="text-sm text-[--edu-text-muted]">Este curso no tiene examen final.</span>
        )}
      </div>
    </div>
  );
}
