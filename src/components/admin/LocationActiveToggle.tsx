"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toggleLocationActiveAction } from "@/app/(dashboard)/(protected)/admin/actions/coworkingActions";

export function LocationActiveToggle({ locationId, activa }: { locationId: string; activa: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    const result = await toggleLocationActiveAction(locationId, !activa);
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
        {activa ? "Desactivar" : "Activar"}
      </Button>
      {error ? <span className="text-[12px] text-[--edu-danger-text]">{error}</span> : null}
    </div>
  );
}
