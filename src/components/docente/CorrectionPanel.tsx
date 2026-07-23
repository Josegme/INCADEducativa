"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { correctAttemptAction } from "@/app/(dashboard)/docente/actions/correctionActions";
import type { ManualAnswerDisplay } from "@/modules/educativa/evaluationAttempt";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

export interface PendingAttempt {
  id: string;
  studentName: string;
  createdAt: string;
  scoreAuto: number;
  pesoManualDisponible: number;
  manualAnswers: ManualAnswerDisplay[];
}

function CorrectionRow({ attempt }: { attempt: PendingAttempt }) {
  const router = useRouter();
  const [notaParcial, setNotaParcial] = React.useState("");
  const [comentario, setComentario] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSave() {
    const value = Number(notaParcial);
    if (!notaParcial || Number.isNaN(value) || value < 0 || value > attempt.pesoManualDisponible) {
      setError(`La nota debe estar entre 0 y ${attempt.pesoManualDisponible}`);
      return;
    }

    setIsSaving(true);
    setError(null);
    const result = await correctAttemptAction(attempt.id, value, comentario);
    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-white">{attempt.studentName}</span>
        <span className="text-[11px] text-[--edu-text-faint]">
          Entregado {new Date(attempt.createdAt).toLocaleDateString("es-AR")} — auto: {attempt.scoreAuto} pts
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {attempt.manualAnswers.map((answer) => (
          <div key={answer.questionId} className="rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.03] p-3">
            <p className="mb-1 text-[12px] font-medium text-[--edu-text-muted]">{answer.enunciado}</p>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.4px] text-[--edu-text-faint]">
              {answer.tipoLabel}
            </span>
            {answer.link ? (
              <a
                href={answer.link}
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-1 text-[13px] text-[--inc-violet-text] hover:underline"
              >
                <Paperclip className="h-3.5 w-3.5" aria-hidden />
                Ver entrega
              </a>
            ) : (
              <p className="whitespace-pre-wrap text-[13px] text-[--edu-text]">{answer.texto || "(sin respuesta)"}</p>
            )}
          </div>
        ))}
      </div>

      {error ? <NotificationBanner type="danger">{error}</NotificationBanner> : null}

      <div className="flex items-end gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
            Nota manual (0-{attempt.pesoManualDisponible})
          </label>
          <Input
            type="number"
            min={0}
            max={attempt.pesoManualDisponible}
            value={notaParcial}
            onChange={(e) => setNotaParcial(e.target.value)}
            className="w-28"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">Devolución</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
            className={TEXTAREA_CLASS}
            placeholder="Comentario para el alumno..."
          />
        </div>
        <Button variant="primary" disabled={isSaving} onClick={handleSave}>
          {isSaving ? "Guardando…" : "Guardar corrección"}
        </Button>
      </div>
    </div>
  );
}

export function CorrectionPanel({ attempts }: { attempts: PendingAttempt[] }) {
  if (attempts.length === 0) {
    return <p className="text-[13px] text-[--edu-text-muted]">No hay entregas pendientes de corrección.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {attempts.map((attempt) => (
        <CorrectionRow key={attempt.id} attempt={attempt} />
      ))}
    </div>
  );
}
