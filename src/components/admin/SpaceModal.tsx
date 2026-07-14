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
import { SPACE_TYPES, SPACE_TYPE_LABEL, type LocationRow, type SpaceRow, type SpaceType } from "@/modules/admin/coworking";
import { createSpaceAction, updateSpaceAction } from "@/app/(dashboard)/admin/actions/coworkingActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface SpaceModalProps {
  locations: LocationRow[];
  space?: SpaceRow;
  trigger?: React.ReactNode;
}

export function SpaceModal({ locations, space, trigger }: SpaceModalProps) {
  const router = useRouter();
  const isEdit = Boolean(space);
  const [open, setOpen] = React.useState(false);
  const [locationId, setLocationId] = React.useState(space?.location_id ?? locations[0]?.id ?? "");
  const [nombre, setNombre] = React.useState(space?.nombre ?? "");
  const [tipo, setTipo] = React.useState<SpaceType>(space?.tipo ?? "hot_desk");
  const [capacidad, setCapacidad] = React.useState(space?.capacidad?.toString() ?? "1");
  const [precioHora, setPrecioHora] = React.useState(space?.precio_hora?.toString() ?? "");
  const [descripcion, setDescripcion] = React.useState(space?.descripcion ?? "");
  const [imagenUrl, setImagenUrl] = React.useState(space?.imagen_url ?? "");
  const [activo, setActivo] = React.useState(space?.activo ?? true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setLocationId(space?.location_id ?? locations[0]?.id ?? "");
    setNombre(space?.nombre ?? "");
    setTipo(space?.tipo ?? "hot_desk");
    setCapacidad(space?.capacidad?.toString() ?? "1");
    setPrecioHora(space?.precio_hora?.toString() ?? "");
    setDescripcion(space?.descripcion ?? "");
    setImagenUrl(space?.imagen_url ?? "");
    setActivo(space?.activo ?? true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (space) formData.set("id", space.id);
    formData.set("locationId", locationId);
    formData.set("nombre", nombre);
    formData.set("tipo", tipo);
    formData.set("capacidad", capacidad);
    formData.set("precioHora", precioHora);
    formData.set("descripcion", descripcion);
    formData.set("imagenUrl", imagenUrl);
    formData.set("activo", String(activo));

    const result = space ? await updateSpaceAction(formData) : await createSpaceAction(formData);
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
            {isEdit ? "Editar" : "Nuevo espacio"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar espacio — ${space?.nombre}` : "Nuevo espacio"}</DialogTitle>
          <DialogDescription>Hot desks, salas de reunión y aulas del Coworking.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="locationId" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Sede
            </label>
            <select id="locationId" value={locationId} onChange={(e) => setLocationId(e.target.value)} className={SELECT_CLASS} required>
              {locations.map((l) => (
                <option key={l.id} value={l.id} className="bg-[--edu-surface-raised]">
                  {l.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nombre" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Nombre
            </label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Hot desk 1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tipo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Tipo
              </label>
              <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as SpaceType)} className={SELECT_CLASS}>
                {SPACE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[--edu-surface-raised]">
                    {SPACE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="capacidad" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Capacidad
              </label>
              <Input id="capacidad" type="number" min={1} value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required />
            </div>
          </div>

          <div>
            <label htmlFor="precioHora" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Precio por hora ($)
            </label>
            <Input
              id="precioHora"
              type="number"
              min={0}
              step="0.01"
              value={precioHora}
              onChange={(e) => setPrecioHora(e.target.value)}
              required
              placeholder="1500"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Descripción (opcional)
            </label>
            <Input id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Escritorio individual con..." />
          </div>

          <div>
            <label htmlFor="imagenUrl" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Imagen (URL, opcional)
            </label>
            <Input id="imagenUrl" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://..." />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[--edu-text]">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[--edu-border] accent-[--inc-violet]"
            />
            Activo (visible en la landing pública)
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar espacio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
