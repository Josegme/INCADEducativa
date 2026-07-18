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
import type { TallerRow } from "@/modules/talleres/talleres";
import { createTallerAction, updateTallerAction } from "@/app/(dashboard)/admin/actions/tallerActions";

interface TallerModalProps {
  taller?: TallerRow;
  trigger?: React.ReactNode;
}

function toDateInputValue(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function toHourValue(iso: string) {
  return new Date(iso).getHours();
}

export function TallerModal({ taller, trigger }: TallerModalProps) {
  const router = useRouter();
  const isEdit = Boolean(taller);
  const [open, setOpen] = React.useState(false);
  const [titulo, setTitulo] = React.useState(taller?.titulo ?? "");
  const [descripcion, setDescripcion] = React.useState(taller?.descripcion ?? "");
  const [fecha, setFecha] = React.useState(taller ? toDateInputValue(taller.fecha_inicio) : "");
  const [hora, setHora] = React.useState(taller ? toHourValue(taller.fecha_inicio) : 10);
  const [duracionMinutos, setDuracionMinutos] = React.useState(taller?.duracion_minutos ?? 60);
  const [linkVirtual, setLinkVirtual] = React.useState(taller?.link_virtual ?? "");
  const [grabacionUrl, setGrabacionUrl] = React.useState(taller?.grabacion_url ?? "");
  const [capacidad, setCapacidad] = React.useState(taller?.capacidad ? String(taller.capacidad) : "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setTitulo(taller?.titulo ?? "");
    setDescripcion(taller?.descripcion ?? "");
    setFecha(taller ? toDateInputValue(taller.fecha_inicio) : "");
    setHora(taller ? toHourValue(taller.fecha_inicio) : 10);
    setDuracionMinutos(taller?.duracion_minutos ?? 60);
    setLinkVirtual(taller?.link_virtual ?? "");
    setGrabacionUrl(taller?.grabacion_url ?? "");
    setCapacidad(taller?.capacidad ? String(taller.capacidad) : "");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (taller) formData.set("id", taller.id);
    formData.set("titulo", titulo);
    formData.set("descripcion", descripcion);
    formData.set("fecha", fecha);
    formData.set("hora", String(hora));
    formData.set("duracionMinutos", String(duracionMinutos));
    formData.set("linkVirtual", linkVirtual);
    formData.set("grabacionUrl", grabacionUrl);
    formData.set("capacidad", capacidad);

    const result = taller ? await updateTallerAction(formData) : await createTallerAction(formData);
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
            {isEdit ? "Editar" : "Nuevo taller"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar taller — ${taller?.titulo}` : "Nuevo taller"}</DialogTitle>
          <DialogDescription>Visible para alumnos logueados una vez publicado.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="titulo" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Título
            </label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Taller de LinkedIn para profesionales" />
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Descripción
            </label>
            <Input id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="De qué trata el taller..." />
          </div>

          <div className="flex gap-3">
            <div>
              <label htmlFor="fecha" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Fecha
              </label>
              <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="hora" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Hora
              </label>
              <Input
                id="hora"
                type="number"
                min={0}
                max={23}
                value={hora}
                onChange={(e) => setHora(Number(e.target.value))}
                className="w-20"
              />
            </div>
            <div>
              <label htmlFor="duracion" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Duración (min)
              </label>
              <Input
                id="duracion"
                type="number"
                min={15}
                value={duracionMinutos}
                onChange={(e) => setDuracionMinutos(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>

          <div>
            <label htmlFor="linkVirtual" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Link virtual
            </label>
            <Input id="linkVirtual" type="url" value={linkVirtual} onChange={(e) => setLinkVirtual(e.target.value)} placeholder="https://meet.google.com/..." />
          </div>

          <div>
            <label htmlFor="grabacionUrl" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Link de grabación (opcional, se carga después del evento)
            </label>
            <Input id="grabacionUrl" type="url" value={grabacionUrl} onChange={(e) => setGrabacionUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label htmlFor="capacidad" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Capacidad (opcional, vacío = sin límite)
            </label>
            <Input
              id="capacidad"
              type="number"
              min={1}
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              className="w-24"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar taller"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
