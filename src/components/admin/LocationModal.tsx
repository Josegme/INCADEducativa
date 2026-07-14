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
import type { LocationRow } from "@/modules/admin/coworking";
import { createLocationAction, updateLocationAction } from "@/app/(dashboard)/admin/actions/coworkingActions";

interface LocationModalProps {
  location?: LocationRow;
  trigger?: React.ReactNode;
}

export function LocationModal({ location, trigger }: LocationModalProps) {
  const router = useRouter();
  const isEdit = Boolean(location);
  const [open, setOpen] = React.useState(false);
  const [nombre, setNombre] = React.useState(location?.nombre ?? "");
  const [direccion, setDireccion] = React.useState(location?.direccion ?? "");
  const [activa, setActiva] = React.useState(location?.activa ?? true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setNombre(location?.nombre ?? "");
    setDireccion(location?.direccion ?? "");
    setActiva(location?.activa ?? true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (location) formData.set("id", location.id);
    formData.set("nombre", nombre);
    formData.set("direccion", direccion);
    formData.set("activa", String(activa));

    const result = location ? await updateLocationAction(formData) : await createLocationAction(formData);
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
            {isEdit ? "Editar" : "Nueva sede"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar sede — ${location?.nombre}` : "Nueva sede"}</DialogTitle>
          <DialogDescription>Sedes físicas del módulo Coworking.</DialogDescription>
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
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="INCADE Sede Central"
            />
          </div>

          <div>
            <label htmlFor="direccion" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Dirección
            </label>
            <Input
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
              placeholder="Posadas, Misiones — Sede 1"
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={activa}
              onChange={(e) => setActiva(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Activa (visible en la landing pública)
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar sede"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
