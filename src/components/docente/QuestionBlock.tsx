"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle2,
  CircleDot,
  GripVertical,
  ListChecks,
  MessageSquareText,
  Plus,
  Trash2,
  UploadCloud,
  X,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QUESTION_TYPE_LABEL,
  SUBMISSION_KIND_LABEL,
  type EvaluationQuestion,
  type SubmissionKind,
} from "@/modules/docente/evaluationEditor";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

const TYPE_ICON: Record<EvaluationQuestion["tipo"], LucideIcon> = {
  vf_fundamentada: CheckCircle2,
  opcion_unica: CircleDot,
  opcion_multiple: ListChecks,
  abierta: MessageSquareText,
  entrega_tp: UploadCloud,
};

const SUBMISSION_KINDS: SubmissionKind[] = ["archivo", "drive", "github", "url", "texto"];

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
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} aria-label="Borrar pregunta">
      <Trash2 className="h-4 w-4" aria-hidden />
    </Button>
  );
}

interface QuestionBlockProps {
  question: EvaluationQuestion;
  index: number;
  editable: boolean;
  onChange: (question: EvaluationQuestion) => void;
  onDelete: () => void;
}

export function QuestionBlock({ question, index, editable, onChange, onDelete }: QuestionBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    disabled: !editable,
  });

  const Icon = TYPE_ICON[question.tipo];

  function patch(fields: Partial<EvaluationQuestion>) {
    onChange({ ...question, ...fields } as EvaluationQuestion);
  }

  function updateOpcion(opciones: string[], i: number, value: string) {
    const next = [...opciones];
    next[i] = value;
    return next;
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4 ${
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
            aria-label="Reordenar pregunta"
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <Icon className="h-4 w-4 shrink-0 text-[--inc-violet]" aria-hidden />
        <Badge state="active">{QUESTION_TYPE_LABEL[question.tipo]}</Badge>
        <span className="text-[12px] text-[--edu-text-faint]">Pregunta {index + 1}</span>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor={`peso-${question.id}`} className="text-[12px] text-[--edu-text-muted]">
            Peso
          </label>
          <Input
            id={`peso-${question.id}`}
            type="number"
            min={0}
            max={100}
            value={question.peso}
            disabled={!editable}
            onChange={(e) => patch({ peso: Number(e.target.value) })}
            className="w-16 text-center"
          />
          {editable ? <ConfirmDelete onConfirm={onDelete} /> : null}
        </div>
      </div>

      <textarea
        value={question.enunciado}
        disabled={!editable}
        onChange={(e) => patch({ enunciado: e.target.value })}
        rows={2}
        className={TEXTAREA_CLASS}
        placeholder="Enunciado de la pregunta..."
      />

      {question.tipo === "vf_fundamentada" ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[--edu-text-muted]">Respuesta correcta:</span>
            <Button
              type="button"
              size="sm"
              variant={question.respuesta_correcta ? "primary" : "outline"}
              disabled={!editable}
              onClick={() => patch({ respuesta_correcta: true })}
            >
              Verdadero
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!question.respuesta_correcta ? "primary" : "outline"}
              disabled={!editable}
              onClick={() => patch({ respuesta_correcta: false })}
            >
              Falso
            </Button>
          </div>
          <div>
            <label htmlFor={`min-caracteres-${question.id}`} className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Mínimo de caracteres para fundamentar
            </label>
            <Input
              id={`min-caracteres-${question.id}`}
              type="number"
              min={0}
              disabled={!editable}
              value={question.min_caracteres_fundamentacion}
              onChange={(e) => patch({ min_caracteres_fundamentacion: Number(e.target.value) })}
              className="w-24"
            />
          </div>
        </div>
      ) : null}

      {question.tipo === "opcion_unica" || question.tipo === "opcion_multiple" ? (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[--edu-text-muted]">Opciones (marcá la correcta)</span>
          {question.opciones.map((opcion, i) => {
            const isCorrect =
              question.tipo === "opcion_unica" ? question.respuesta_correcta === i : question.respuestas_correctas.includes(i);

            function toggleCorrect() {
              if (question.tipo === "opcion_unica") {
                patch({ respuesta_correcta: i });
                return;
              }
              if (question.tipo !== "opcion_multiple") return;
              const set = new Set<number>(question.respuestas_correctas);
              if (set.has(i)) set.delete(i);
              else set.add(i);
              patch({ respuestas_correctas: Array.from(set).sort() });
            }

            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!editable}
                  onClick={toggleCorrect}
                  aria-label={isCorrect ? "Opción correcta" : "Marcar como correcta"}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-[0.5px] ${
                    isCorrect
                      ? "border-[--edu-success-border] bg-[--edu-success-subtle] text-[--edu-success-text]"
                      : "border-[--edu-border] text-[--edu-text-faint]"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                </button>
                <Input
                  value={opcion}
                  disabled={!editable}
                  onChange={(e) => patch({ opciones: updateOpcion(question.opciones, i, e.target.value) })}
                  placeholder={`Opción ${i + 1}`}
                  className="flex-1"
                />
                {editable && question.opciones.length > 2 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Quitar opción"
                    onClick={() => patch({ opciones: question.opciones.filter((_, idx) => idx !== i) })}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </Button>
                ) : null}
              </div>
            );
          })}

          {editable && question.opciones.length < 6 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => patch({ opciones: [...question.opciones, ""] })}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Agregar opción
            </Button>
          ) : null}

          {question.tipo === "opcion_unica" ? (
            <div>
              <label htmlFor={`retro-${question.id}`} className="mb-1 mt-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Retroalimentación (opcional)
              </label>
              <textarea
                id={`retro-${question.id}`}
                value={question.retroalimentacion}
                disabled={!editable}
                onChange={(e) => patch({ retroalimentacion: e.target.value })}
                rows={2}
                className={TEXTAREA_CLASS}
                placeholder="Explicación que ve el alumno al corregirse..."
              />
            </div>
          ) : (
            <div>
              <label htmlFor={`puntuacion-${question.id}`} className="mb-1 mt-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Puntuación
              </label>
              <select
                id={`puntuacion-${question.id}`}
                value={question.puntuacion}
                disabled={!editable}
                onChange={(e) => patch({ puntuacion: e.target.value as "proporcional" | "todo_o_nada" })}
                className={SELECT_CLASS}
              >
                <option value="proporcional" className="bg-[--edu-surface-raised]">
                  Proporcional (por opción correcta)
                </option>
                <option value="todo_o_nada" className="bg-[--edu-surface-raised]">
                  Todo o nada
                </option>
              </select>
            </div>
          )}
        </div>
      ) : null}

      {question.tipo === "entrega_tp" ? (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[--edu-text-muted]">Tipos de entrega aceptados</span>
          <div className="flex flex-wrap gap-2">
            {SUBMISSION_KINDS.map((kind) => {
              const active = question.tipos_entrega.includes(kind);
              return (
                <button
                  key={kind}
                  type="button"
                  disabled={!editable}
                  onClick={() => {
                    const set = new Set(question.tipos_entrega);
                    if (set.has(kind)) set.delete(kind);
                    else set.add(kind);
                    if (set.size === 0) return;
                    patch({ tipos_entrega: Array.from(set) });
                  }}
                  className={`rounded-pill border-[0.5px] px-3 py-1 text-[12px] ${
                    active
                      ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                      : "border-[--edu-border] text-[--edu-text-faint]"
                  }`}
                >
                  {SUBMISSION_KIND_LABEL[kind]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
