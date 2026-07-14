"use client";

import * as React from "react";
import Link from "next/link";
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
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  ListChecks,
  MessageSquareText,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { QuestionBlock } from "@/components/docente/QuestionBlock";
import {
  EVALUATION_TIPO_LABEL,
  QUESTION_TYPES,
  QUESTION_TYPE_LABEL,
  createEmptyQuestion,
  type EditableEvaluation,
  type EvaluationQuestion,
  type MostrarResultado,
  type QuestionType,
} from "@/modules/docente/evaluationEditor";
import { deleteEvaluationAction, updateEvaluationAction } from "@/app/(dashboard)/docente/actions/evaluationActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

const QUESTION_TYPE_ICON: Record<QuestionType, LucideIcon> = {
  vf_fundamentada: CheckCircle2,
  opcion_unica: CircleDot,
  opcion_multiple: ListChecks,
  abierta: MessageSquareText,
  entrega_tp: UploadCloud,
};

interface EvaluationBuilderProps {
  evaluation: EditableEvaluation;
  courseTitulo: string;
  editable: boolean;
}

export function EvaluationBuilder({ evaluation, courseTitulo, editable }: EvaluationBuilderProps) {
  const router = useRouter();
  const [titulo, setTitulo] = React.useState(evaluation.titulo);
  const [preguntas, setPreguntas] = React.useState<EvaluationQuestion[]>(evaluation.preguntas);
  const [notaMinima, setNotaMinima] = React.useState(evaluation.nota_minima);
  const [config, setConfig] = React.useState(evaluation.config);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const pesoTotal = preguntas.reduce((sum, q) => sum + (q.peso || 0), 0);

  function markDirty() {
    setSaved(false);
  }

  function handleAddQuestion(tipo: QuestionType) {
    setPreguntas((prev) => [...prev, createEmptyQuestion(tipo)]);
    markDirty();
  }

  function handleQuestionChange(updated: EvaluationQuestion) {
    setPreguntas((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    markDirty();
  }

  function handleDeleteQuestion(id: string) {
    setPreguntas((prev) => prev.filter((q) => q.id !== id));
    markDirty();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPreguntas((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === active.id);
      const newIndex = prev.findIndex((q) => q.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    markDirty();
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    const result = await updateEvaluationAction(evaluation.id, evaluation.course_id, {
      titulo,
      preguntas,
      nota_minima: notaMinima,
      config,
    });

    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteEvaluationAction(evaluation.id, evaluation.course_id);
    setIsDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/docente/cursos/${evaluation.course_id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/docente/cursos/${evaluation.course_id}`}
        className="flex w-fit items-center gap-1 text-[13px] text-[--edu-text-muted] hover:text-[--edu-text]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a {courseTitulo}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <Badge state="active">{EVALUATION_TIPO_LABEL[evaluation.tipo]}</Badge>
        <Input
          value={titulo}
          disabled={!editable}
          onChange={(e) => {
            setTitulo(e.target.value);
            markDirty();
          }}
          className="max-w-sm text-[16px] font-semibold"
          placeholder="Título de la evaluación"
        />
        <span className={`text-[12px] ${pesoTotal === 100 ? "text-[--edu-success-text]" : "text-[--edu-warning-text]"}`}>
          Peso total: {pesoTotal}%{pesoTotal !== 100 ? " (debería sumar 100%)" : ""}
        </span>
      </div>

      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}
      {!editable ? (
        <NotificationBanner type="info">
          El curso no está en borrador — esta evaluación no se puede editar.
        </NotificationBanner>
      ) : null}

      <div className="rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">Configuración</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="tiempoLimite" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Tiempo límite (min)
            </label>
            <Input
              id="tiempoLimite"
              type="number"
              min={0}
              disabled={!editable}
              value={config.tiempo_limite_min ?? ""}
              placeholder="Sin límite"
              onChange={(e) => {
                setConfig((c) => ({ ...c, tiempo_limite_min: e.target.value ? Number(e.target.value) : null }));
                markDirty();
              }}
            />
          </div>
          <div>
            <label htmlFor="notaMinima" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Nota mínima (%)
            </label>
            <Input
              id="notaMinima"
              type="number"
              min={0}
              max={100}
              disabled={!editable}
              value={notaMinima}
              onChange={(e) => {
                setNotaMinima(Number(e.target.value));
                markDirty();
              }}
            />
          </div>
          <div>
            <label htmlFor="intentos" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Intentos permitidos
            </label>
            <Input
              id="intentos"
              type="number"
              min={1}
              disabled={!editable}
              value={config.intentos_permitidos}
              onChange={(e) => {
                setConfig((c) => ({ ...c, intentos_permitidos: Number(e.target.value) }));
                markDirty();
              }}
            />
          </div>
          <div>
            <label htmlFor="espera" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Espera entre intentos (hs)
            </label>
            <Input
              id="espera"
              type="number"
              min={0}
              disabled={!editable}
              value={config.espera_horas}
              onChange={(e) => {
                setConfig((c) => ({ ...c, espera_horas: Number(e.target.value) }));
                markDirty();
              }}
            />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="mostrarResultado" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
            Mostrar resultado al alumno
          </label>
          <select
            id="mostrarResultado"
            value={config.mostrar_resultado}
            disabled={!editable}
            onChange={(e) => {
              setConfig((c) => ({ ...c, mostrar_resultado: e.target.value as MostrarResultado }));
              markDirty();
            }}
            className={`${SELECT_CLASS} max-w-xs`}
          >
            <option value="inmediato" className="bg-[--edu-surface-raised]">
              Inmediato
            </option>
            <option value="diferido" className="bg-[--edu-surface-raised]">
              Diferido (cuando el docente corrija)
            </option>
          </select>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={preguntas.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {preguntas.map((question, index) => (
              <QuestionBlock
                key={question.id}
                question={question}
                index={index}
                editable={editable}
                onChange={handleQuestionChange}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editable ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-white">+ Agregar pregunta</h2>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((tipo) => {
              const Icon = QUESTION_TYPE_ICON[tipo];
              return (
                <Button key={tipo} type="button" variant="outline" size="sm" onClick={() => handleAddQuestion(tipo)}>
                  <Icon className="h-4 w-4" aria-hidden />
                  {QUESTION_TYPE_LABEL[tipo]}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {editable ? (
        <div className="flex items-center justify-between border-t-[0.5px] border-[--edu-border] pt-4">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[--edu-text-muted]">¿Eliminar esta evaluación?</span>
              <Button variant="destructive" size="sm" disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? "Eliminando…" : "Confirmar"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => setConfirmingDelete(true)}>
              Eliminar evaluación
            </Button>
          )}

          <Button variant="primary" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "Guardando…" : saved ? "Guardado" : "Guardar cambios"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
