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
import { LessonUploader } from "@/components/docente/LessonUploader";
import { LESSON_TYPES, LESSON_TYPE_LABEL, type EditableLesson } from "@/modules/docente/courseEditor";
import type { LessonType } from "@/modules/educativa/lessons";
import { createLessonAction, updateLessonAction } from "@/app/(dashboard)/docente/actions/lessonActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface LessonModalProps {
  courseId: string;
  moduleId?: string;
  nextOrden?: number;
  lesson?: EditableLesson;
  trigger?: React.ReactNode;
}

export function LessonModal({ courseId, moduleId, nextOrden, lesson, trigger }: LessonModalProps) {
  const router = useRouter();
  const isEdit = Boolean(lesson);
  const [open, setOpen] = React.useState(false);
  const [titulo, setTitulo] = React.useState(lesson?.titulo ?? "");
  const [tipo, setTipo] = React.useState<LessonType>(lesson?.tipo ?? "video");
  const [contenidoUrl, setContenidoUrl] = React.useState(lesson?.contenido_url ?? "");
  const [contenidoText, setContenidoText] = React.useState(lesson?.contenido_text ?? "");
  const [duracionMin, setDuracionMin] = React.useState(lesson?.duracion_min?.toString() ?? "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setTitulo(lesson?.titulo ?? "");
    setTipo(lesson?.tipo ?? "video");
    setContenidoUrl(lesson?.contenido_url ?? "");
    setContenidoText(lesson?.contenido_text ?? "");
    setDuracionMin(lesson?.duracion_min?.toString() ?? "");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (tipo === "texto" && !contenidoText.trim()) {
      setError("Falta el texto de la clase");
      return;
    }
    if (tipo !== "texto" && !contenidoUrl) {
      setError("Subí un archivo para esta clase");
      return;
    }

    setIsLoading(true);
    setError(null);

    const data = {
      titulo,
      tipo,
      contenidoUrl,
      contenidoText,
      duracionMin: duracionMin ? Number(duracionMin) : undefined,
    };

    const result = lesson
      ? await updateLessonAction(lesson.id, courseId, data)
      : await createLessonAction(moduleId!, courseId, nextOrden ?? 0, data);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={isEdit ? "ghost" : "outline"} size="sm">
            {isEdit ? "Editar" : "+ Clase"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar clase — ${lesson?.titulo}` : "Nueva clase"}</DialogTitle>
          <DialogDescription>Video, texto o documento descargable.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="lessonTitulo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Título
            </label>
            <Input
              id="lessonTitulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Clase 1 — Introducción"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lessonTipo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Tipo
              </label>
              <select
                id="lessonTipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as LessonType)}
                className={SELECT_CLASS}
              >
                {LESSON_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[--edu-surface-raised]">
                    {LESSON_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duracionMin" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Duración (min)
              </label>
              <Input
                id="duracionMin"
                type="number"
                min={0}
                value={duracionMin}
                onChange={(e) => setDuracionMin(e.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          {tipo === "texto" ? (
            <div>
              <label htmlFor="contenidoText" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Contenido
              </label>
              <textarea
                id="contenidoText"
                value={contenidoText}
                onChange={(e) => setContenidoText(e.target.value)}
                rows={6}
                className="flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]"
                placeholder="Texto de la clase..."
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                {tipo === "video" ? "Video" : "Documento"}
              </label>
              <LessonUploader courseId={courseId} value={contenidoUrl || null} onUploaded={setContenidoUrl} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar clase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
