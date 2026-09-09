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
import { updateCertificateNameAction } from "@/app/(dashboard)/(protected)/admin/actions/certificateActions";

interface EditCertificateNameModalProps {
  certificateId: string;
  nombreActual: string;
  nombreOverride: string | null;
}

export function EditCertificateNameModal({ certificateId, nombreActual, nombreOverride }: EditCertificateNameModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(nombreOverride ?? nombreActual);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await updateCertificateNameAction(certificateId, value);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Editar nombre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar nombre en el certificado</DialogTitle>
          <DialogDescription>
            Corrige cómo aparece el nombre en el PDF y en la verificación pública, sin tocar el
            perfil real del alumno. Regenera el PDF automáticamente.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="nombreOverride" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
              Nombre en el certificado
            </label>
            <Input id="nombreOverride" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Guardando…" : "Guardar y regenerar PDF"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
