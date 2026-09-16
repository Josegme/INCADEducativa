"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
import type { SpaceRow } from "@/modules/admin/coworking";
import { createMaintenanceIncidentAction } from "@/app/(dashboard)/(protected)/admin/actions/maintenanceActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors placeholder:text-[--edu-text-faint] focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface MaintenanceIncidentModalProps {
  spaces: SpaceRow[];
}

export function MaintenanceIncidentModal({ spaces }: MaintenanceIncidentModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [spaceId, setSpaceId] = React.useState(spaces[0]?.id ?? "");
  const [descripcion, setDescripcion] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setSpaceId(spaces[0]?.id ?? "");
    setDescripcion("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("spaceId", spaceId);
    formData.set("descripcion", descripcion);

    const result = await createMaintenanceIncidentAction(formData);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          Reportar incidencia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar incidencia de mantenimiento</DialogTitle>
          <DialogDescription>Queda registrada contra el espacio elegido hasta que se marque resuelta.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="incidentSpaceId" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Espacio
            </label>
            <select id="incidentSpaceId" value={spaceId} onChange={(e) => setSpaceId(e.target.value)} className={SELECT_CLASS} required>
              {spaces.map((s) => (
                <option key={s.id} value={s.id} className="bg-[--edu-surface-raised]">
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="incidentDescripcion" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Descripción
            </label>
            <textarea
              id="incidentDescripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              required
              className={TEXTAREA_CLASS}
              placeholder="Aire acondicionado fuera de servicio..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Reportar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
