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
import { AlertTriangle, FileText, GripVertical, Trash2, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { ModuleModal } from "@/components/docente/ModuleModal";
import { LessonModal } from "@/components/docente/LessonModal";
import type { EditableCourse, EditableLesson, EditableModule } from "@/modules/docente/courseEditor";
import { deleteModuleAction, reorderModulesAction } from "@/app/(dashboard)/docente/actions/moduleActions";
import { deleteLessonAction, reorderLessonsAction } from "@/app/(dashboard)/docente/actions/lessonActions";
import { submitForReviewAction } from "@/app/(dashboard)/docente/actions/reviewActions";

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

function ModuleCard({
  courseModule,
  courseId,
  editable,
  onDeleted,
}: {
  courseModule: EditableModule;
  courseId: string;
  editable: boolean;
  onDeleted: () => void;
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
    </div>
  );
}

interface CourseEditorProps {
  course: EditableCourse;
  modules: EditableModule[];
}

export function CourseEditor({ course, modules: initialModules }: CourseEditorProps) {
  const router = useRouter();
  const [modules, setModules] = React.useState(initialModules);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const editable = course.estado === "borrador";

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

        {course.estado === "borrador" ? (
          <Button variant="primary" size="sm" disabled={isSubmitting} onClick={handleSubmitForReview}>
            {isSubmitting ? "Enviando…" : "Enviar a revisión"}
          </Button>
        ) : null}
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
                onDeleted={() => handleDeleteModule(courseModule.id)}
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
    </div>
  );
}
