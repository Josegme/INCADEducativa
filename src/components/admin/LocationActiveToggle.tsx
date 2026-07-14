"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toggleLocationActiveAction } from "@/app/(dashboard)/admin/actions/coworkingActions";

export function LocationActiveToggle({ locationId, activa }: { locationId: string; activa: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleClick() {
    setIsLoading(true);
    await toggleLocationActiveAction(locationId, !activa);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isLoading} onClick={handleClick}>
      {activa ? "Desactivar" : "Activar"}
    </Button>
  );
}
