"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { TallerEstado } from "@/modules/talleres/talleres";
import { setTallerEstadoAction } from "@/app/(dashboard)/admin/actions/tallerActions";

interface TallerPublishToggleProps {
  tallerId: string;
  estado: TallerEstado;
}

export function TallerPublishToggle({ tallerId, estado }: TallerPublishToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSetEstado(next: TallerEstado) {
    setIsLoading(true);
    await setTallerEstadoAction(tallerId, next);
    setIsLoading(false);
    router.refresh();
  }

  if (estado === "cancelado") {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" disabled={isLoading} onClick={() => handleSetEstado(estado === "publicado" ? "borrador" : "publicado")}>
        {estado === "publicado" ? "Volver a borrador" : "Publicar"}
      </Button>
      <Button variant="ghost" size="sm" disabled={isLoading} onClick={() => handleSetEstado("cancelado")}>
        Cancelar
      </Button>
    </div>
  );
}
