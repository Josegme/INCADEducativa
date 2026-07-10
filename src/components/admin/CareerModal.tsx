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
import { slugify } from "@/lib/slugify";
import type { CareerRow } from "@/modules/admin/careers";
import { createCareerAction, updateCareerAction } from "@/app/(dashboard)/admin/actions/careerActions";

interface CareerModalProps {
  career?: CareerRow;
  trigger?: React.ReactNode;
}

export function CareerModal({ career, trigger }: CareerModalProps) {
  const router = useRouter();
  const isEdit = Boolean(career);
  const [open, setOpen] = React.useState(false);
  const [nombre, setNombre] = React.useState(career?.nombre ?? "");
  const [slug, setSlug] = React.useState(career?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [descripcion, setDescripcion] = React.useState(career?.descripcion ?? "");
  const [imagenUrl, setImagenUrl] = React.useState(career?.imagen_url ?? "");
  const [activa, setActiva] = React.useState(career?.activa ?? true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setNombre(career?.nombre ?? "");
    setSlug(career?.slug ?? "");
    setSlugTouched(isEdit);
    setDescripcion(career?.descripcion ?? "");
    setImagenUrl(career?.imagen_url ?? "");
    setActiva(career?.activa ?? true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (career) formData.set("id", career.id);
    formData.set("nombre", nombre);
    formData.set("slug", slug);
    formData.set("descripcion", descripcion);
    formData.set("imagenUrl", imagenUrl);
    formData.set("activa", String(activa));

    const result = career ? await updateCareerAction(formData) : await createCareerAction(formData);
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
          <Button variant={isEdit ? "outline" : "primary"} size="sm">
            {isEdit ? "Editar" : "Nueva carrera"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar carrera — ${career?.nombre}` : "Nueva carrera"}</DialogTitle>
          <DialogDescription>Carreras visibles en el catálogo de /carreras.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Nombre
            </label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => {
                const value = e.target.value;
                setNombre(value);
                if (!slugTouched) setSlug(slugify(value));
              }}
              required
              placeholder="Marketing Digital"
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Slug
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
              placeholder="marketing-digital"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Descripción
            </label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Formación integral en..."
            />
          </div>

          <div>
            <label htmlFor="imagenUrl" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Imagen (URL, opcional)
            </label>
            <Input
              id="imagenUrl"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={activa}
              onChange={(e) => setActiva(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Activa (visible en el catálogo)
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar carrera"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
