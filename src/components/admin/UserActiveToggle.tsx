"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { setUserActivoAction } from "@/app/(dashboard)/(protected)/admin/actions/userActions";

export function UserActiveToggle({ userId, activo }: { userId: string; activo: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    if (activo) {
      const confirmed = window.confirm(
        "¿Desactivar este usuario? Va a perder acceso a la plataforma de inmediato."
      );
      if (!confirmed) return;
    }
    setIsLoading(true);
    setError(null);
    const result = await setUserActivoAction(userId, !activo);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
        {activo ? "Desactivar" : "Activar"}
      </Button>
      {error ? <span className="text-[12px] text-[--edu-danger-text]">{error}</span> : null}
    </div>
  );
}
