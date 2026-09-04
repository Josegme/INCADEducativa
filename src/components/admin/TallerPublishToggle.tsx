"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { TallerEstado } from "@/modules/talleres/talleres";
import { setTallerEstadoAction } from "@/app/(dashboard)/(protected)/admin/actions/tallerActions";

interface TallerPublishToggleProps {
  tallerId: string;
  estado: TallerEstado;
}

export function TallerPublishToggle({ tallerId, estado }: TallerPublishToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSetEstado(next: TallerEstado) {
    setIsLoading(true);
    setError(null);
    const result = await setTallerEstadoAction(tallerId, next);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (estado === "cancelado") {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" disabled={isLoading} onClick={() => handleSetEstado(estado === "publicado" ? "borrador" : "publicado")}>
          {estado === "publicado" ? "Volver a borrador" : "Publicar"}
        </Button>
        <Button variant="ghost" size="sm" disabled={isLoading} onClick={() => handleSetEstado("cancelado")}>
          Cancelar
        </Button>
      </div>
      {error ? <span className="text-[12px] text-[--edu-danger-text]">{error}</span> : null}
    </div>
  );
}
