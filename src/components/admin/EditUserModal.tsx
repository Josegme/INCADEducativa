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
import { updateUserAction } from "@/app/(dashboard)/(protected)/admin/actions/userActions";

interface EditUserModalProps {
  userId: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  carreraId: string | null;
  careers: { id: string; nombre: string }[];
}

export function EditUserModal({ userId, nombre, apellido, dni, carreraId, careers }: EditUserModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [nombreValue, setNombreValue] = React.useState(nombre);
  const [apellidoValue, setApellidoValue] = React.useState(apellido);
  const [dniValue, setDniValue] = React.useState(dni ?? "");
  const [carreraIdValue, setCarreraIdValue] = React.useState(carreraId ?? "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setNombreValue(nombre);
    setApellidoValue(apellido);
    setDniValue(dni ?? "");
    setCarreraIdValue(carreraId ?? "");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("id", userId);
    formData.set("nombre", nombreValue);
    formData.set("apellido", apellidoValue);
    formData.set("dni", dniValue);
    formData.set("carreraId", carreraIdValue);

    const result = await updateUserAction(formData);
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
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Nombre, apellido, DNI y carrera. El email y el rol se cambian desde otros flujos.
          </DialogDescription>
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
            <Input id="nombre" value={nombreValue} onChange={(e) => setNombreValue(e.target.value)} required />
          </div>

          <div>
            <label htmlFor="apellido" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Apellido
            </label>
            <Input
              id="apellido"
              value={apellidoValue}
              onChange={(e) => setApellidoValue(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="dni" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              DNI
            </label>
            <Input id="dni" value={dniValue} onChange={(e) => setDniValue(e.target.value)} />
          </div>

          <div>
            <label htmlFor="carreraId" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Carrera
            </label>
            <select
              id="carreraId"
              value={carreraIdValue}
              onChange={(e) => setCarreraIdValue(e.target.value)}
              className="h-9 w-full rounded-[10px] border border-[--edu-border] bg-[--edu-surface-alt] px-3 text-[13px] text-[--edu-text]"
            >
              <option value="">Sin carrera</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
