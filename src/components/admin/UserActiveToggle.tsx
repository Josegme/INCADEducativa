"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { setUserActivoAction } from "@/app/(dashboard)/admin/actions/userActions";

export function UserActiveToggle({ userId, activo }: { userId: string; activo: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    if (activo) {
      const confirmed = window.confirm(
        "¿Desactivar este usuario? Va a perder acceso a la plataforma de inmediato."
      );
      if (!confirmed) return;
    }
    setIsLoading(true);
    await setUserActivoAction(userId, !activo);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {activo ? "Desactivar" : "Activar"}
    </Button>
  );
}
