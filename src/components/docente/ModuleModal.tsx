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
import type { EditableModule } from "@/modules/docente/courseEditor";
import { createModuleAction, updateModuleAction } from "@/app/(dashboard)/docente/actions/moduleActions";

interface ModuleModalProps {
  courseId: string;
  nextOrden: number;
  courseModule?: EditableModule;
  trigger?: React.ReactNode;
}

export function ModuleModal({ courseId, nextOrden, courseModule, trigger }: ModuleModalProps) {
  const router = useRouter();
  const isEdit = Boolean(courseModule);
  const [open, setOpen] = React.useState(false);
  const [titulo, setTitulo] = React.useState(courseModule?.titulo ?? "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = courseModule
      ? await updateModuleAction(courseModule.id, courseId, titulo)
      : await createModuleAction(courseId, titulo, nextOrden);

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
        if (!next) {
          setTitulo(courseModule?.titulo ?? "");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={isEdit ? "ghost" : "outline"} size="sm">
            {isEdit ? "Editar" : "+ Módulo"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar módulo" : "Nuevo módulo"}</DialogTitle>
          <DialogDescription>Un módulo agrupa clases del curso.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="moduleTitulo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Título
            </label>
            <Input
              id="moduleTitulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Módulo 1 — Fundamentos"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
