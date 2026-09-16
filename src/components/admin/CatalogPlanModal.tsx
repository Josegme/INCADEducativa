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
import type { CatalogPlanRow } from "@/modules/admin/catalogPlans";
import {
  createCatalogPlanAction,
  updateCatalogPlanAction,
} from "@/app/(dashboard)/(protected)/admin/actions/catalogPlanActions";

interface CatalogPlanModalProps {
  plan?: CatalogPlanRow;
  trigger?: React.ReactNode;
}

export function CatalogPlanModal({ plan, trigger }: CatalogPlanModalProps) {
  const router = useRouter();
  const isEdit = Boolean(plan);
  const [open, setOpen] = React.useState(false);
  const [nombre, setNombre] = React.useState(plan?.nombre ?? "");
  const [precio, setPrecio] = React.useState(plan?.precio?.toString() ?? "");
  const [activo, setActivo] = React.useState(plan?.activo ?? true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setNombre(plan?.nombre ?? "");
    setPrecio(plan?.precio?.toString() ?? "");
    setActivo(plan?.activo ?? true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (plan) formData.set("id", plan.id);
    formData.set("nombre", nombre);
    formData.set("precio", precio);
    formData.set("activo", String(activo));

    const result = plan ? await updateCatalogPlanAction(formData) : await createCatalogPlanAction(formData);
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
            {isEdit ? "Editar" : "Nuevo plan"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar plan — ${plan?.nombre}` : "Nuevo plan de suscripción"}</DialogTitle>
          <DialogDescription>Suscripción mensual al catálogo educativo (Etapa 3).</DialogDescription>
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
              placeholder="Suscripción Mensual"
            />
          </div>

          <div>
            <label htmlFor="precio" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Precio mensual ($)
            </label>
            <Input
              id="precio"
              type="number"
              min={0}
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Activo (visible para suscribirse)
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
