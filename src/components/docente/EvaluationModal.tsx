"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { EVALUATION_TIPO_LABEL, type EvaluationTipo } from "@/modules/docente/evaluationEditor";
import { createEvaluationAction } from "@/app/(dashboard)/docente/actions/evaluationActions";

interface EvaluationModalProps {
  courseId: string;
  moduleId: string | null;
  tipo: EvaluationTipo;
  trigger: React.ReactNode;
}

export function EvaluationModal({ courseId, moduleId, tipo, trigger }: EvaluationModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [titulo, setTitulo] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await createEvaluationAction(courseId, moduleId, tipo, titulo);

    setIsLoading(false);

    if (result.error || !result.id) {
      setError(result.error ?? "No se pudo crear la evaluación");
      return;
    }

    setOpen(false);
    router.push(`/docente/cursos/${courseId}/evaluaciones/${result.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setTitulo("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo — {EVALUATION_TIPO_LABEL[tipo]}</DialogTitle>
          <DialogDescription>Armás las preguntas en el paso siguiente.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="evaluationTitulo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Título
            </label>
            <Input
              id="evaluationTitulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder={EVALUATION_TIPO_LABEL[tipo]}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Creando…" : "Crear y editar preguntas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
