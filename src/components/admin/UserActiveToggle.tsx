"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { setUserActivoAction } from "@/app/(dashboard)/(protected)/admin/actions/userActions";

export function UserActiveToggle({ userId, activo }: { userId: string; activo: boolean }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run(nextActivo: boolean) {
    setIsLoading(true);
    setError(null);
    const result = await setUserActivoAction(userId, nextActivo);
    setIsLoading(false);
    setOpen(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success(nextActivo ? "Usuario activado" : "Usuario desactivado");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={() => (activo ? setOpen(true) : run(true))}
      >
        {activo ? "Desactivar" : "Activar"}
      </Button>
      {error ? <span className="text-caption text-[--edu-danger-text]">{error}</span> : null}
      <ConfirmDialog
        open={open}
        title="Desactivar usuario"
        description="¿Desactivar este usuario? Va a perder acceso a la plataforma de inmediato."
        confirmLabel="Desactivar"
        onConfirm={() => run(false)}
        onOpenChange={setOpen}
      />
    </div>
  );
}
