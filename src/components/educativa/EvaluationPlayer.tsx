"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { QuestionAnswer } from "@/components/educativa/QuestionAnswer";
import { EVALUATION_TIPO_LABEL, type EditableEvaluation } from "@/modules/docente/evaluationEditor";
import {
  ATTEMPT_STATE_LABEL,
  createEmptyAnswer,
  type AnswerValue,
  type AttemptRow,
  type Respuestas,
} from "@/modules/educativa/evaluationAttempt";
import { submitAttemptAction } from "@/app/(dashboard)/cursos/actions/evaluationAttemptActions";

function useCountdown(deadline: number | null, onExpire: () => void) {
  const [remainingMs, setRemainingMs] = React.useState(deadline ? deadline - Date.now() : null);
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const remaining = deadline - Date.now();
      setRemainingMs(remaining);
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  return remainingMs;
}

interface EvaluationPlayerProps {
  evaluation: EditableEvaluation;
  attempt: AttemptRow;
  userId: string;
  courseSlug: string;
  devolucion?: string | null;
}

export function EvaluationPlayer({ evaluation, attempt, userId, courseSlug, devolucion }: EvaluationPlayerProps) {
  const router = useRouter();
  const isTerminal = attempt.estado !== "en_curso";

  const [respuestas, setRespuestas] = React.useState<Respuestas>(() => {
    const initial: Respuestas = {};
    for (const q of evaluation.preguntas) {
      initial[q.id] = (attempt.respuestas[q.id] as AnswerValue) ?? createEmptyAnswer(q);
    }
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const deadline = React.useMemo(() => {
    if (isTerminal || !evaluation.config.tiempo_limite_min) return null;
    return new Date(attempt.created_at).getTime() + evaluation.config.tiempo_limite_min * 60 * 1000;
  }, [attempt.created_at, evaluation.config.tiempo_limite_min, isTerminal]);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    const result = await submitAttemptAction(attempt.id, respuestas);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  const remainingMs = useCountdown(deadline, () => {
    if (!isTerminal) handleSubmit();
  });

  function updateAnswer(questionId: string, value: AnswerValue) {
    setRespuestas((prev) => ({ ...prev, [questionId]: value }));
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        href={`/cursos/${courseSlug}`}
        className="flex w-fit items-center gap-1 text-[13px] text-[--edu-text-muted] hover:text-[--edu-text]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al curso
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <Badge state="active">{EVALUATION_TIPO_LABEL[evaluation.tipo]}</Badge>
        <h1 className="text-[20px] font-semibold text-white">{evaluation.titulo}</h1>
        {!isTerminal && remainingMs !== null ? (
          <span className="ml-auto flex items-center gap-1 text-[13px] text-[--edu-warning-text]">
            <Clock className="h-4 w-4" aria-hidden />
            {Math.max(0, Math.floor(remainingMs / 60000))}:{String(Math.max(0, Math.floor((remainingMs / 1000) % 60))).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      {isTerminal ? (
        <NotificationBanner type={attempt.aprobado ? "success" : attempt.aprobado === false ? "danger" : "info"}>
          {attempt.estado === "pendiente_correccion"
            ? "Entregado — pendiente de corrección del docente."
            : `${ATTEMPT_STATE_LABEL[attempt.estado]}${attempt.nota !== null ? ` — nota: ${attempt.nota}/100` : ""}`}
        </NotificationBanner>
      ) : null}

      {devolucion ? (
        <NotificationBanner type="info">
          <span className="font-semibold">Devolución del docente: </span>
          {devolucion}
        </NotificationBanner>
      ) : null}

      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}

      <div className="flex flex-col gap-3">
        {evaluation.preguntas.map((question, index) => (
          <QuestionAnswer
            key={question.id}
            question={question}
            index={index}
            answer={respuestas[question.id]}
            disabled={isTerminal}
            onChange={(value) => updateAnswer(question.id, value)}
            evaluationId={evaluation.id}
            userId={userId}
          />
        ))}
      </div>

      {!isTerminal ? (
        <Button variant="primary" disabled={isSubmitting} onClick={handleSubmit} className="self-start">
          {isSubmitting ? "Enviando…" : "Entregar evaluación"}
        </Button>
      ) : null}
    </div>
  );
}
