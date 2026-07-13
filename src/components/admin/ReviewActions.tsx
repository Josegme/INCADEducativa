"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { approveCourseAction, rejectCourseAction } from "@/app/(dashboard)/admin/actions/reviewActions";

interface ReviewActionsProps {
  courseId: string;
  courseTitulo: string;
}

export function ReviewActions({ courseId, courseTitulo }: ReviewActionsProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [comentario, setComentario] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleApprove() {
    setIsLoading(true);
    const result = await approveCourseAction(courseId);
    setIsLoading(false);

    if (!result.error) {
      router.refresh();
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await rejectCourseAction(courseId, comentario);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setComentario("");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button variant="primary" size="sm" disabled={isLoading} onClick={handleApprove}>
        <Check className="h-4 w-4" aria-hidden />
        Aprobar
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setComentario("");
            setError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isLoading}>
            <X className="h-4 w-4" aria-hidden />
            Rechazar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar curso — {courseTitulo}</DialogTitle>
            <DialogDescription>
              El curso vuelve a borrador y el docente ve este motivo en su editor.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <NotificationBanner type="danger" className="mb-3">
              {error}
            </NotificationBanner>
          ) : null}

          <form onSubmit={handleReject} className="flex flex-col gap-3">
            <div>
              <label htmlFor="comentario" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Motivo del rechazo
              </label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
                rows={4}
                placeholder="Ej: falta el video de la clase 3, la clase 1 tiene el orden cambiado..."
                className="flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? "Rechazando…" : "Rechazar curso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
