"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { TpFileUploader } from "@/components/educativa/TpFileUploader";
import type { EvaluationQuestion } from "@/modules/docente/evaluationEditor";
import { SUBMISSION_KIND_LABEL, type SubmissionKind } from "@/modules/docente/evaluationEditor";
import type {
  AnswerAbierta,
  AnswerEntregaTp,
  AnswerOpcionMultiple,
  AnswerOpcionUnica,
  AnswerValue,
  AnswerVF,
} from "@/modules/educativa/evaluationAttempt";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface QuestionAnswerProps {
  question: EvaluationQuestion;
  index: number;
  answer: AnswerValue;
  disabled: boolean;
  onChange: (answer: AnswerValue) => void;
  evaluationId: string;
  userId: string;
}

export function QuestionAnswer({ question, index, answer, disabled, onChange, evaluationId, userId }: QuestionAnswerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[--edu-text-faint]">
          Pregunta {index + 1}
        </span>
        <span className="text-[11px] text-[--edu-text-faint]">({question.peso} pts)</span>
      </div>

      <p className="text-[14px] text-[--edu-text]">{question.enunciado}</p>

      {question.tipo === "vf_fundamentada" ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...(answer as AnswerVF), respuesta: true })}
              className={`rounded-md border-[0.5px] px-3 py-1.5 text-[13px] ${
                (answer as AnswerVF).respuesta
                  ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                  : "border-[--edu-border] text-[--edu-text-faint]"
              }`}
            >
              Verdadero
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...(answer as AnswerVF), respuesta: false })}
              className={`rounded-md border-[0.5px] px-3 py-1.5 text-[13px] ${
                !(answer as AnswerVF).respuesta
                  ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                  : "border-[--edu-border] text-[--edu-text-faint]"
              }`}
            >
              Falso
            </button>
          </div>
          <textarea
            value={(answer as AnswerVF).fundamentacion}
            disabled={disabled}
            onChange={(e) => onChange({ ...(answer as AnswerVF), fundamentacion: e.target.value })}
            rows={3}
            className={TEXTAREA_CLASS}
            placeholder={`Fundamentá tu respuesta (mínimo ${question.min_caracteres_fundamentacion} caracteres)...`}
          />
        </div>
      ) : null}

      {question.tipo === "opcion_unica" ? (
        <div className="flex flex-col gap-2">
          {question.opciones.map((opcion, i) => {
            const selected = (answer as AnswerOpcionUnica).seleccionada === i;
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ seleccionada: i })}
                className={`flex items-center gap-2 rounded-md border-[0.5px] px-3 py-2 text-left text-[13px] ${
                  selected
                    ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                    : "border-[--edu-border] text-[--edu-text]"
                }`}
              >
                {selected ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden /> : <Circle className="h-4 w-4 shrink-0" aria-hidden />}
                {opcion}
              </button>
            );
          })}
        </div>
      ) : null}

      {question.tipo === "opcion_multiple" ? (
        <div className="flex flex-col gap-2">
          {question.opciones.map((opcion, i) => {
            const seleccionadas = (answer as AnswerOpcionMultiple).seleccionadas;
            const selected = seleccionadas.includes(i);
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const set = new Set(seleccionadas);
                  if (set.has(i)) set.delete(i);
                  else set.add(i);
                  onChange({ seleccionadas: Array.from(set).sort() });
                }}
                className={`flex items-center gap-2 rounded-md border-[0.5px] px-3 py-2 text-left text-[13px] ${
                  selected
                    ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                    : "border-[--edu-border] text-[--edu-text]"
                }`}
              >
                {selected ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden /> : <Circle className="h-4 w-4 shrink-0" aria-hidden />}
                {opcion}
              </button>
            );
          })}
        </div>
      ) : null}

      {question.tipo === "abierta" ? (
        <textarea
          value={(answer as AnswerAbierta).texto}
          disabled={disabled}
          onChange={(e) => onChange({ texto: e.target.value })}
          rows={5}
          className={TEXTAREA_CLASS}
          placeholder="Tu respuesta..."
        />
      ) : null}

      {question.tipo === "entrega_tp" ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {question.tipos_entrega.map((kind) => (
              <button
                key={kind}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ tipoEntrega: kind, valor: "" })}
                className={`rounded-pill border-[0.5px] px-3 py-1 text-[12px] ${
                  (answer as AnswerEntregaTp).tipoEntrega === kind
                    ? "border-[--inc-violet-border] bg-[--inc-violet-subtle] text-[--inc-violet-text]"
                    : "border-[--edu-border] text-[--edu-text-faint]"
                }`}
              >
                {SUBMISSION_KIND_LABEL[kind]}
              </button>
            ))}
          </div>
          {(answer as AnswerEntregaTp).tipoEntrega === "texto" ? (
            <textarea
              value={(answer as AnswerEntregaTp).valor}
              disabled={disabled}
              onChange={(e) => onChange({ ...(answer as AnswerEntregaTp), valor: e.target.value })}
              rows={5}
              className={TEXTAREA_CLASS}
              placeholder="Tu entrega..."
            />
          ) : (answer as AnswerEntregaTp).tipoEntrega === "archivo" ? (
            <TpFileUploader
              evaluationId={evaluationId}
              userId={userId}
              value={(answer as AnswerEntregaTp).valor}
              onUploaded={(path) => onChange({ ...(answer as AnswerEntregaTp), valor: path })}
            />
          ) : (
            <Input
              value={(answer as AnswerEntregaTp).valor}
              disabled={disabled}
              onChange={(e) => onChange({ ...(answer as AnswerEntregaTp), valor: e.target.value })}
              placeholder={placeholderFor((answer as AnswerEntregaTp).tipoEntrega)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

function placeholderFor(kind: SubmissionKind) {
  if (kind === "drive") return "https://drive.google.com/...";
  if (kind === "github") return "https://github.com/...";
  if (kind === "archivo") return "URL del archivo subido";
  return "https://...";
}
